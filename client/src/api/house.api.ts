import  apiClient  from "./client";
import { API_ENDPOINTS } from "./endpoints";

import type {
  HouseResponse,
  InitializeHouseRequest,
  UpdateCurrentStageRequest,
  UpdateHouseRequest,
} from "@/features/house/house.types";

export const getHouse = async (): Promise<HouseResponse> => {
  const response = await apiClient.get<HouseResponse>(API_ENDPOINTS.house.base);

  return response.data;
};

export const initializeHouse = async (
  payload: InitializeHouseRequest,
): Promise<HouseResponse> => {
  const response = await apiClient.post<HouseResponse>(
    API_ENDPOINTS.house.initialize,
    payload,
  );

  return response.data;
};

export const updateHouse = async (
  payload: UpdateHouseRequest,
): Promise<HouseResponse> => {
  const response = await apiClient.patch<HouseResponse>(
    API_ENDPOINTS.house.base,
    payload,
  );

  return response.data;
};

export const updateCurrentConstructionStage = async (
  payload: UpdateCurrentStageRequest,
): Promise<HouseResponse> => {
  const response = await apiClient.patch<HouseResponse>(
    API_ENDPOINTS.house.currentStage,
    payload,
  );

  return response.data;
};
