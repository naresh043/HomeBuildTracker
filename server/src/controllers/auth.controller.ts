import { Request, Response } from "express";

import { loginUser } from "../services/auth.service";
import { generateToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import { AUTH_COOKIE_NAME, authCookieOptions } from "../constants/auth";

const sanitizeUser = (user: {
  _id: unknown;
  name: string;
  email: string;
  phone?: string;
}) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  };
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await loginUser(email, password);

  const token = generateToken(user._id.toString());

  res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: sanitizeUser(user),
    },
  });
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, authCookieOptions);

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

export const me = (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required", "UNAUTHENTICATED");
  }

  return res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser(req.user),
    },
  });
};
