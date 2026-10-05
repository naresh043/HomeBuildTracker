import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupplierAgreement, deleteSupplierAgreement, restoreSupplierAgreement, updateSupplierAgreement } from "@/api/supplier-agreements.api";
import { supplierAgreementQueryKeys } from "./supplier-agreement.queries";
import type { CreateSupplierAgreementPayload, UpdateSupplierAgreementPayload } from "./supplier-agreement.types";

export function useCreateSupplierAgreementMutation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (payload: CreateSupplierAgreementPayload) => createSupplierAgreement(payload), onSuccess: () => client.invalidateQueries({ queryKey: supplierAgreementQueryKeys.lists() }) });
}

function invalidateAgreement(client: ReturnType<typeof useQueryClient>, id: string) {
  return Promise.all([
    client.invalidateQueries({ queryKey: supplierAgreementQueryKeys.lists() }),
    client.invalidateQueries({ queryKey: [...supplierAgreementQueryKeys.details(), id] }),
    client.invalidateQueries({ queryKey: supplierAgreementQueryKeys.summary(id) }),
  ]);
}

export function useUpdateSupplierAgreementMutation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }: { id: string; payload: UpdateSupplierAgreementPayload }) => updateSupplierAgreement(id, payload), onSuccess: (_data, variables) => invalidateAgreement(client, variables.id) });
}

export function useDeleteSupplierAgreementMutation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: deleteSupplierAgreement, onSuccess: (_data, id) => invalidateAgreement(client, id) });
}

export function useRestoreSupplierAgreementMutation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: restoreSupplierAgreement, onSuccess: (_data, id) => invalidateAgreement(client, id) });
}
