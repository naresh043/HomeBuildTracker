import { RequestHandler } from "express";

import { getDashboard } from "../services/dashboard.service";
import { successResponse } from "../utils/response";

export const getDashboardController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    /**
     * =====================================================
     * VALIDATED QUERY
     * =====================================================
     *
     * The validate middleware stores the parsed query
     * inside req.validated.
     *
     * dashboardSchema validates:
     *
     * - fromDate
     * - toDate
     */

    const validated = (
      req as typeof req & {
        validated?: {
          query?: {
            fromDate?: Date;
            toDate?: Date;
          };
        };
      }
    ).validated;

    const query = validated?.query ?? {};

    /**
     * =====================================================
     * GET DASHBOARD
     * =====================================================
     */

    const dashboard = await getDashboard(query);

    /**
     * =====================================================
     * RESPONSE
     * =====================================================
     */

    return res
      .status(200)
      .json(successResponse(dashboard, "Dashboard fetched successfully"));
  } catch (error) {
    return next(error);
  }
};
