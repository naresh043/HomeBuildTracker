import { useQuery } from "@tanstack/react-query";

import { getDashboardApi } from "@/api/dashboard.api";
import type { DashboardParams } from "@/api/dashboard.api";

export const dashboardQueryKeys = {
  all: ["dashboard"] as const,
  detail: (params?: DashboardParams) => ["dashboard", params ?? {}] as const,
};

export const useDashboardQuery = (params?: DashboardParams) =>
  useQuery({
    queryKey: dashboardQueryKeys.detail(params),
    queryFn: () => getDashboardApi(params),
  });
