import { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";

import { ApiError } from "../utils/ApiError";

export const errorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  }

  /**
   * Zod validation error
   */
  if (error instanceof ZodError) {
    return res.status(422).json({
      success: false,
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      details: error.flatten(),
    });
  }

  /**
   * Mongoose validation error
   */
  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(422).json({
      success: false,
      code: "DATABASE_VALIDATION_ERROR",
      message: "Database validation failed",
    });
  }

  /**
   * Invalid MongoDB ObjectId
   */
  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      code: "INVALID_ID",
      message: "Invalid resource ID",
    });
  }

  /**
   * Application error
   */
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      code: error.code,
      message: error.message,
      ...(error.details
        ? { details: error.details }
        : {}),
    });
  }

  /**
   * Unexpected error
   */
  return res.status(500).json({
    success: false,
    code: "INTERNAL_SERVER_ERROR",
    message: "Something went wrong",
  });
};