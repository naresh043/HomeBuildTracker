import { RequestHandler } from "express";

import { User } from "../models/User";
import { verifyToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import { AUTH_COOKIE_NAME } from "../constants/auth";

export const authenticate: RequestHandler = async (
  req,
  _res,
  next,
) => {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME];

    if (!token) {
      return next(
        new ApiError(
          401,
          "Authentication required",
          "UNAUTHENTICATED",
        ),
      );
    }

    let payload;

    try {
      payload = verifyToken(token);
    } catch {
      return next(
        new ApiError(
          401,
          "Invalid or expired authentication token",
          "INVALID_TOKEN",
        ),
      );
    }

    const user = await User.findById(payload.userId);

    if (!user) {
      return next(
        new ApiError(
          401,
          "User no longer exists",
          "USER_NOT_FOUND",
        ),
      );
    }

    if (!user.isActive) {
      return next(
        new ApiError(
          403,
          "Your account has been disabled",
          "ACCOUNT_DISABLED",
        ),
      );
    }

    req.user = user;

    return next();
  } catch (error) {
    return next(error);
  }
};