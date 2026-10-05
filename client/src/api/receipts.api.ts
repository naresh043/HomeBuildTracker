import apiClient from "./client";
import { API_ENDPOINTS } from "./endpoints";
import type {
  ReceiptLinkPayload,
  ReceiptListResponse,
  ReceiptMutationResponse,
  ReceiptQueryParams,
  ReceiptResponse,
  ReceiptUnlinkPayload,
  UploadReceiptPayload,
} from "@/features/receipts/receipt.types";

export const uploadReceipt = async ({
  file,
  sourceType,
}: UploadReceiptPayload): Promise<ReceiptResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("sourceType", sourceType);
  // The shared client defaults to JSON. Suppress that header so Axios/the browser
  // sends the FormData with its generated multipart boundary.
  const response = await apiClient.post<ReceiptResponse>(
    API_ENDPOINTS.receipts.base,
    formData,
    { headers: { "Content-Type": undefined } },
  );
  return response.data;
};
export const getReceipts = async (
  params: ReceiptQueryParams,
): Promise<ReceiptListResponse> => {
  const response = await apiClient.get<ReceiptListResponse>(
    API_ENDPOINTS.receipts.base,
    { params },
  );
  return response.data;
};
export const getReceipt = async (id: string): Promise<ReceiptResponse> => {
  const response = await apiClient.get<ReceiptResponse>(
    API_ENDPOINTS.receipts.byId(id),
  );
  return response.data;
};
export const linkReceipt = async (
  id: string,
  payload: ReceiptLinkPayload,
): Promise<ReceiptResponse> => {
  const response = await apiClient.patch<ReceiptResponse>(
    API_ENDPOINTS.receipts.link(id),
    payload,
  );
  return response.data;
};
export const unlinkReceipt = async (
  id: string,
  payload: ReceiptUnlinkPayload,
): Promise<ReceiptResponse> => {
  const response = await apiClient.patch<ReceiptResponse>(
    API_ENDPOINTS.receipts.unlink(id),
    payload,
  );
  return response.data;
};
export const deleteReceipt = async (
  id: string,
): Promise<ReceiptMutationResponse> => {
  const response = await apiClient.delete<ReceiptMutationResponse>(
    API_ENDPOINTS.receipts.byId(id),
  );
  return response.data;
};
export const restoreReceipt = async (
  id: string,
): Promise<ReceiptMutationResponse> => {
  const response = await apiClient.patch<ReceiptMutationResponse>(
    API_ENDPOINTS.receipts.restore(id),
  );
  return response.data;
};
