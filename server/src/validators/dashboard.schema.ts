import { z } from "zod";

export const dashboardSchema = z.object({
  /**
   * GET /api/dashboard does not require a request body.
   *
   * Express leaves req.body undefined for a GET request,
   * so default it to an empty object before validation.
   */
  body: z.object({}).default({}),

  /**
   * Dashboard does not currently use route parameters.
   */
  params: z.object({}).default({}),

  /**
   * Optional dashboard date range.
   *
   * Examples:
   *
   * /api/dashboard
   * /api/dashboard?fromDate=2026-03-01
   * /api/dashboard?fromDate=2026-03-01&toDate=2026-10-01
   */
  query: z.object({
    fromDate: z.coerce.date().optional(),
    toDate: z.coerce.date().optional(),
  }),
});

export type DashboardQuery = z.infer<typeof dashboardSchema>["query"];
