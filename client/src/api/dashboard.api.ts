import apiClient from "./client";
import { API_ENDPOINTS } from "./endpoints";

import type { DashboardResponse } from "@/features/dashboard/dashboard.types";

export interface DashboardParams {
  fromDate?: string;
  toDate?: string;
}

export const getDashboardApi = async (params?: DashboardParams): Promise<DashboardResponse> => {
  const response = await apiClient.get<DashboardResponse>(
    API_ENDPOINTS.dashboard,
    { params },
  );

  return response.data;
};
