import apiClient from "./client";
import { API_ENDPOINTS } from "./endpoints";

import type {
  ConstructionStageResponse,
  ConstructionStagesResponse,
  CreateStageRequest,
  ReorderStagesRequest,
  UpdateStageRequest,
} from "@/features/stages/stage.types";

export interface GetStagesParams {
  includeDeleted?: boolean;
}

export const initializeStages =
  async (): Promise<ConstructionStagesResponse> => {
    const response = await apiClient.post<ConstructionStagesResponse>(
      API_ENDPOINTS.stages.initialize,
    );

    return response.data;
  };

export const getStages = async (
  params?: GetStagesParams,
): Promise<ConstructionStagesResponse> => {
  const response = await apiClient.get<ConstructionStagesResponse>(
    API_ENDPOINTS.stages.base,
    {
      params: {
        ...(params?.includeDeleted !== undefined && {
          includeDeleted: params.includeDeleted,
        }),
      },
    },
  );

  return response.data;
};

export const getStage = async (
  stageId: string,
): Promise<ConstructionStageResponse> => {
  const response = await apiClient.get<ConstructionStageResponse>(
    `${API_ENDPOINTS.stages.base}/${stageId}`,
  );

  return response.data;
};

export const createStage = async (
  payload: CreateStageRequest,
): Promise<ConstructionStageResponse> => {
  const response = await apiClient.post<ConstructionStageResponse>(
    API_ENDPOINTS.stages.base,
    payload,
  );

  return response.data;
};

export const updateStage = async (
  stageId: string,
  payload: UpdateStageRequest,
): Promise<ConstructionStageResponse> => {
  const response = await apiClient.patch<ConstructionStageResponse>(
    `${API_ENDPOINTS.stages.base}/${stageId}`,
    payload,
  );

  return response.data;
};

export const reorderStages = async (
  payload: ReorderStagesRequest,
): Promise<ConstructionStagesResponse> => {
  const response = await apiClient.patch<ConstructionStagesResponse>(
    API_ENDPOINTS.stages.reorder,
    payload,
  );

  return response.data;
};

export const deleteStage = async (
  stageId: string,
): Promise<{ success: boolean; message: string; data: null }> => {
  const response = await apiClient.delete<{
    success: boolean;
    message: string;
    data: null;
  }>(`${API_ENDPOINTS.stages.base}/${stageId}`);

  return response.data;
};

export const restoreStage = async (
  stageId: string,
): Promise<ConstructionStageResponse> => {
  const response = await apiClient.patch<ConstructionStageResponse>(
    `${API_ENDPOINTS.stages.base}/${stageId}/restore`,
  );

  return response.data;
};
