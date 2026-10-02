import apiClient from "./client";
import { API_ENDPOINTS } from "./endpoints";

import type { DashboardResponse } from "@/features/dashboard/dashboard.types";

export const getDashboardApi = async (): Promise<DashboardResponse> => {
  const response = await apiClient.get<DashboardResponse>(
    API_ENDPOINTS.dashboard,
  );

  return response.data;
};