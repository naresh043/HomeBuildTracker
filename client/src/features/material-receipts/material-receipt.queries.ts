import { useQuery } from "@tanstack/react-query";

import { getMaterialReceipt, getMaterialReceipts } from "@/api/material-receipts.api";
import type { MaterialReceiptListParams } from "./material-receipt.types";

export const materialReceiptQueryKeys = {
  all: ["material-receipts"] as const,
  lists: () => [...materialReceiptQueryKeys.all, "list"] as const,
  list: (params?: MaterialReceiptListParams) => [...materialReceiptQueryKeys.lists(), params ?? {}] as const,
  details: () => [...materialReceiptQueryKeys.all, "detail"] as const,
  detail: (receiptId: string) => [...materialReceiptQueryKeys.details(), receiptId] as const,
};

export const useMaterialReceiptsQuery = (params?: MaterialReceiptListParams) =>
  useQuery({ queryKey: materialReceiptQueryKeys.list(params), queryFn: () => getMaterialReceipts(params) });

export const useMaterialReceiptQuery = (
  receiptId: string,
  enabled = true,
  includeDeleted = false,
) =>
  useQuery({
    queryKey: [...materialReceiptQueryKeys.detail(receiptId), { includeDeleted }],
    queryFn: () => getMaterialReceipt(receiptId, includeDeleted),
    enabled: enabled && Boolean(receiptId),
  });
