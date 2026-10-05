import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createContract, deleteContract, restoreContract, updateContract } from "@/api/contracts.api";
import { contractQueryKeys } from "./contract.queries";
import type { ContractInput, UpdateContractInput } from "./contract.types";

export function useCreateContractMutation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (payload: ContractInput) => createContract(payload), onSuccess: () => client.invalidateQueries({ queryKey: contractQueryKeys.all }) });
}
export function useUpdateContractMutation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }: { id: string; payload: UpdateContractInput }) => updateContract(id, payload), onSuccess: (_data, variables) => Promise.all([client.invalidateQueries({ queryKey: contractQueryKeys.all }), client.invalidateQueries({ queryKey: [...contractQueryKeys.details(), variables.id] }), client.invalidateQueries({ queryKey: contractQueryKeys.summary(variables.id) })]) });
}
export function useDeleteContractMutation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: deleteContract, onSuccess: (_data, id) => Promise.all([client.invalidateQueries({ queryKey: contractQueryKeys.all }), client.invalidateQueries({ queryKey: [...contractQueryKeys.details(), id] }), client.invalidateQueries({ queryKey: contractQueryKeys.summary(id) })]) });
}
export function useRestoreContractMutation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: restoreContract, onSuccess: (_data, id) => Promise.all([client.invalidateQueries({ queryKey: contractQueryKeys.all }), client.invalidateQueries({ queryKey: [...contractQueryKeys.details(), id] }), client.invalidateQueries({ queryKey: contractQueryKeys.summary(id) })]) });
}
