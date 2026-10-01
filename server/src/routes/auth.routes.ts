import { Router } from "express";

import {
  login,
  logout,
  me,
} from "../controllers/auth.controller";

import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

import { loginSchema } from "../validators/auth.schema";

import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

/**
 * POST /api/auth/login
 */
router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(login),
);

/**
 * POST /api/auth/logout
 */
router.post(
  "/logout",
  authenticate,
  asyncHandler(logout),
);

/**
 * GET /api/auth/me
 */
router.get(
  "/me",
  authenticate,
  asyncHandler(me),
);

export default router;