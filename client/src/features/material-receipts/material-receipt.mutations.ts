import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createMaterialReceipt,
  deleteMaterialReceipt,
  restoreMaterialReceipt,
  updateMaterialReceipt,
  verifyMaterialReceipt,
} from "@/api/material-receipts.api";
import { materialReceiptQueryKeys } from "./material-receipt.queries";
import type { CreateMaterialReceiptRequest, UpdateMaterialReceiptRequest } from "./material-receipt.types";

const invalidateReceiptQueries = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({ queryKey: materialReceiptQueryKeys.all });

export const useCreateMaterialReceiptMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMaterialReceiptRequest) => createMaterialReceipt(payload),
    onSuccess: () => invalidateReceiptQueries(queryClient),
  });
};

export const useUpdateMaterialReceiptMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ receiptId, payload }: { receiptId: string; payload: UpdateMaterialReceiptRequest }) =>
      updateMaterialReceipt(receiptId, payload),
    onSuccess: () => invalidateReceiptQueries(queryClient),
  });
};

export const useVerifyMaterialReceiptMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (receiptId: string) => verifyMaterialReceipt(receiptId),
    onSuccess: () => invalidateReceiptQueries(queryClient),
  });
};

export const useDeleteMaterialReceiptMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (receiptId: string) => deleteMaterialReceipt(receiptId),
    onSuccess: () => invalidateReceiptQueries(queryClient),
  });
};

export const useRestoreMaterialReceiptMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (receiptId: string) => restoreMaterialReceipt(receiptId),
    onSuccess: () => invalidateReceiptQueries(queryClient),
  });
};
