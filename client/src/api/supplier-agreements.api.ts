import apiClient from "./client";
import { API_ENDPOINTS } from "./endpoints";
import type {
  CreateSupplierAgreementPayload,
  SupplierAgreementListResponse,
  SupplierAgreementQueryParams,
  SupplierAgreementResponse,
  SupplierAgreementSummaryResponse,
  UpdateSupplierAgreementPayload,
} from "@/features/supplier-agreements/supplier-agreement.types";

export async function getSupplierAgreements(params: SupplierAgreementQueryParams): Promise<SupplierAgreementListResponse> {
  const response = await apiClient.get<SupplierAgreementListResponse>(API_ENDPOINTS.supplierAgreements.base, { params });
  return response.data;
}

export async function getSupplierAgreement(id: string, includeDeleted = false): Promise<SupplierAgreementResponse> {
  const response = await apiClient.get<SupplierAgreementResponse>(API_ENDPOINTS.supplierAgreements.byId(id), {
    params: includeDeleted ? { includeDeleted: true } : undefined,
  });
  return response.data;
}

export async function getSupplierAgreementSummary(id: string): Promise<SupplierAgreementSummaryResponse> {
  const response = await apiClient.get<SupplierAgreementSummaryResponse>(API_ENDPOINTS.supplierAgreements.summary(id));
  return response.data;
}

export async function createSupplierAgreement(payload: CreateSupplierAgreementPayload): Promise<SupplierAgreementResponse> {
  const response = await apiClient.post<SupplierAgreementResponse>(API_ENDPOINTS.supplierAgreements.base, payload);
  return response.data;
}

export async function updateSupplierAgreement(id: string, payload: UpdateSupplierAgreementPayload): Promise<SupplierAgreementResponse> {
  const response = await apiClient.patch<SupplierAgreementResponse>(API_ENDPOINTS.supplierAgreements.byId(id), payload);
  return response.data;
}

export async function deleteSupplierAgreement(id: string): Promise<{ success: boolean; message: string; data: { id: string; isDeleted: boolean } }> {
  const response = await apiClient.delete<{ success: boolean; message: string; data: { id: string; isDeleted: boolean } }>(API_ENDPOINTS.supplierAgreements.byId(id));
  return response.data;
}

export async function restoreSupplierAgreement(id: string): Promise<SupplierAgreementResponse> {
  const response = await apiClient.patch<SupplierAgreementResponse>(API_ENDPOINTS.supplierAgreements.restore(id));
  return response.data;
}
