import apiClient from "./client";
import { API_ENDPOINTS } from "./endpoints";

import type {
  CreateMaterialReceiptRequest,
  MaterialReceiptListParams,
  MaterialReceiptResponse,
  MaterialReceiptsResponse,
  UpdateMaterialReceiptRequest,
} from "@/features/material-receipts/material-receipt.types";

export const createMaterialReceipt = async (
  payload: CreateMaterialReceiptRequest,
): Promise<MaterialReceiptResponse> => {
  const response = await apiClient.post<MaterialReceiptResponse>(API_ENDPOINTS.materialReceipts.base, payload);
  return response.data;
};

export const getMaterialReceipts = async (
  params?: MaterialReceiptListParams,
): Promise<MaterialReceiptsResponse> => {
  const response = await apiClient.get<MaterialReceiptsResponse>(API_ENDPOINTS.materialReceipts.base, {
    params: Object.fromEntries(
      Object.entries(params ?? {}).filter(([, value]) => value !== undefined && value !== ""),
    ),
  });
  return response.data;
};

export const getMaterialReceipt = async (
  receiptId: string,
  includeDeleted = false,
): Promise<MaterialReceiptResponse> => {
  const response = await apiClient.get<MaterialReceiptResponse>(API_ENDPOINTS.materialReceipts.byId(receiptId), {
    params: includeDeleted ? { includeDeleted: true } : undefined,
  });
  return response.data;
};

export const updateMaterialReceipt = async (
  receiptId: string,
  payload: UpdateMaterialReceiptRequest,
): Promise<MaterialReceiptResponse> => {
  const response = await apiClient.patch<MaterialReceiptResponse>(API_ENDPOINTS.materialReceipts.byId(receiptId), payload);
  return response.data;
};

export const verifyMaterialReceipt = async (receiptId: string): Promise<MaterialReceiptResponse> => {
  const response = await apiClient.patch<MaterialReceiptResponse>(API_ENDPOINTS.materialReceipts.verify(receiptId));
  return response.data;
};

export const deleteMaterialReceipt = async (receiptId: string): Promise<MaterialReceiptResponse> => {
  const response = await apiClient.delete<MaterialReceiptResponse>(API_ENDPOINTS.materialReceipts.byId(receiptId));
  return response.data;
};

export const restoreMaterialReceipt = async (receiptId: string): Promise<MaterialReceiptResponse> => {
  const response = await apiClient.patch<MaterialReceiptResponse>(API_ENDPOINTS.materialReceipts.restore(receiptId));
  return response.data;
};
