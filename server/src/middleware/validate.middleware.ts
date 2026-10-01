import { RequestHandler } from "express";
import { z } from "zod";
import { ApiError } from "../utils/ApiError";

export const validate = (schema: z.ZodObject<any>): RequestHandler => {
  return (req, _res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      return next(
        new ApiError(
          422,
          "Validation failed",
          "VALIDATION_ERROR",
          result.error.flatten(),
        ),
      );
    }

    (req as any).validated = result.data;

    next();
  };
};
