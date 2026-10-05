import { useQuery } from "@tanstack/react-query";
import { getContract, getContractSummary, getContracts } from "@/api/contracts.api";
import type { ContractListParams } from "./contract.types";

export const contractQueryKeys = {
  all: ["contracts"] as const,
  lists: () => [...contractQueryKeys.all, "list"] as const,
  list: (params: ContractListParams) => [...contractQueryKeys.lists(), params] as const,
  details: () => [...contractQueryKeys.all, "detail"] as const,
  detail: (id: string, includeDeleted = false) => [...contractQueryKeys.details(), id, { includeDeleted }] as const,
  summary: (id: string) => [...contractQueryKeys.all, "summary", id] as const,
};
export const useContractsQuery = (params: ContractListParams) => useQuery({ queryKey: contractQueryKeys.list(params), queryFn: () => getContracts(params) });
export const useContractQuery = (id: string, includeDeleted = false) => useQuery({ queryKey: contractQueryKeys.detail(id, includeDeleted), queryFn: () => getContract(id, includeDeleted), enabled: Boolean(id) });
export const useContractSummaryQuery = (id: string, enabled = true) => useQuery({ queryKey: contractQueryKeys.summary(id), queryFn: () => getContractSummary(id), enabled: enabled && Boolean(id) });
