import apiClient from "./client";
import { API_ENDPOINTS } from "./endpoints";

import type {
  CreateMaterialRequest,
  DeleteMaterialResponse,
  MaterialListParams,
  MaterialResponse,
  MaterialsResponse,
  UpdateMaterialRequest,
} from "@/features/materials/material.types";

export const createMaterial = async (
  payload: CreateMaterialRequest,
): Promise<MaterialResponse> => {
  const response = await apiClient.post<MaterialResponse>(
    API_ENDPOINTS.materials.base,
    payload,
  );

  return response.data;
};

export const getMaterials = async (
  params?: MaterialListParams,
): Promise<MaterialsResponse> => {
  const response = await apiClient.get<MaterialsResponse>(
    API_ENDPOINTS.materials.base,
    {
      params: {
        ...(params?.page !== undefined && {
          page: params.page,
        }),
        ...(params?.limit !== undefined && {
          limit: params.limit,
        }),
        ...(params?.q !== undefined &&
          params.q.trim() !== "" && {
            q: params.q.trim(),
          }),
        ...(params?.category !== undefined &&
          params.category.trim() !== "" && {
            category: params.category.trim(),
          }),
        ...(params?.includeDeleted !== undefined && {
          includeDeleted: params.includeDeleted,
        }),
      },
    },
  );

  return response.data;
};

export const getMaterial = async (
  materialId: string,
): Promise<MaterialResponse> => {
  const response = await apiClient.get<MaterialResponse>(
    API_ENDPOINTS.materials.byId(materialId),
  );

  return response.data;
};

export const updateMaterial = async (
  materialId: string,
  payload: UpdateMaterialRequest,
): Promise<MaterialResponse> => {
  const response = await apiClient.patch<MaterialResponse>(
    API_ENDPOINTS.materials.byId(materialId),
    payload,
  );

  return response.data;
};

export const deleteMaterial = async (
  materialId: string,
): Promise<DeleteMaterialResponse> => {
  const response = await apiClient.delete<DeleteMaterialResponse>(
    API_ENDPOINTS.materials.byId(materialId),
  );

  return response.data;
};

export const restoreMaterial = async (
  materialId: string,
): Promise<MaterialResponse> => {
  const response = await apiClient.patch<MaterialResponse>(
    API_ENDPOINTS.materials.restore(materialId),
  );

  return response.data;
};