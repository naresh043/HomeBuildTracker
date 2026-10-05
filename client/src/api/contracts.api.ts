import apiClient from "./client";
import { API_ENDPOINTS } from "./endpoints";
import type { ContractInput, ContractListParams, ContractListResponse, ContractResponse, ContractSummaryResponse, UpdateContractInput } from "@/features/contracts/contract.types";

export async function getContracts(params: ContractListParams = {}): Promise<ContractListResponse> {
  const response = await apiClient.get<ContractListResponse>(API_ENDPOINTS.contracts.base, { params });
  return response.data;
}
export async function getContract(id: string, includeDeleted = false): Promise<ContractResponse> {
  const response = await apiClient.get<ContractResponse>(API_ENDPOINTS.contracts.byId(id), { params: includeDeleted ? { includeDeleted: true } : undefined });
  return response.data;
}
export async function getContractSummary(id: string): Promise<ContractSummaryResponse> {
  const response = await apiClient.get<ContractSummaryResponse>(API_ENDPOINTS.contracts.summary(id));
  return response.data;
}
export async function createContract(payload: ContractInput): Promise<ContractResponse> {
  const response = await apiClient.post<ContractResponse>(API_ENDPOINTS.contracts.base, payload);
  return response.data;
}
export async function updateContract(id: string, payload: UpdateContractInput): Promise<ContractResponse> {
  const response = await apiClient.patch<ContractResponse>(API_ENDPOINTS.contracts.byId(id), payload);
  return response.data;
}
export async function deleteContract(id: string): Promise<ContractResponse> {
  const response = await apiClient.delete<ContractResponse>(API_ENDPOINTS.contracts.byId(id));
  return response.data;
}
export async function restoreContract(id: string): Promise<ContractResponse> {
  const response = await apiClient.patch<ContractResponse>(API_ENDPOINTS.contracts.restore(id));
  return response.data;
}
