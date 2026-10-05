import { useQuery } from "@tanstack/react-query";
import { getSupplierAgreement, getSupplierAgreementSummary, getSupplierAgreements } from "@/api/supplier-agreements.api";
import type { SupplierAgreementQueryParams } from "./supplier-agreement.types";

export const supplierAgreementQueryKeys = {
  all: ["supplier-agreements"] as const,
  lists: () => [...supplierAgreementQueryKeys.all, "list"] as const,
  list: (params: SupplierAgreementQueryParams) => [...supplierAgreementQueryKeys.lists(), params] as const,
  details: () => [...supplierAgreementQueryKeys.all, "detail"] as const,
  detail: (id: string, includeDeleted = false) => [...supplierAgreementQueryKeys.details(), id, { includeDeleted }] as const,
  summaries: () => [...supplierAgreementQueryKeys.all, "summary"] as const,
  summary: (id: string) => [...supplierAgreementQueryKeys.summaries(), id] as const,
};

export const useSupplierAgreementsQuery = (params: SupplierAgreementQueryParams) => useQuery({
  queryKey: supplierAgreementQueryKeys.list(params),
  queryFn: () => getSupplierAgreements(params),
});

export const useSupplierAgreementQuery = (id: string, includeDeleted = false) => useQuery({
  queryKey: supplierAgreementQueryKeys.detail(id, includeDeleted),
  queryFn: () => getSupplierAgreement(id, includeDeleted),
  enabled: Boolean(id),
});

export const useSupplierAgreementSummaryQuery = (id: string, enabled = true) => useQuery({
  queryKey: supplierAgreementQueryKeys.summary(id),
  queryFn: () => getSupplierAgreementSummary(id),
  enabled: enabled && Boolean(id),
});
