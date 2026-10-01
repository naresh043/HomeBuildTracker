import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

import { dashboardSchema } from "../validators/dashboard.schema";
import { getDashboardController } from "../controllers/dashboard.controller";

const router = Router();

/**
 * =====================================================
 * DASHBOARD ROUTES
 * =====================================================
 *
 * All dashboard data is private and requires
 * authentication.
 */

router.use(authenticate);

/**
 * GET DASHBOARD
 *
 * GET /api/dashboard
 *
 * Optional query parameters:
 *
 * ?fromDate=2026-03-01
 * ?toDate=2026-10-01
 *
 * Or:
 *
 * ?fromDate=2026-03-01&toDate=2026-10-01
 */
router.get("/", validate(dashboardSchema), getDashboardController);

export default router;
