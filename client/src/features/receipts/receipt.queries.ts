import { useQuery } from "@tanstack/react-query";
import { getReceipt, getReceipts } from "@/api/receipts.api";
import type { ReceiptQueryParams } from "./receipt.types";
export const receiptQueryKeys = {
  all: ["receipts"] as const,
  lists: () => [...receiptQueryKeys.all, "list"] as const,
  list: (params: ReceiptQueryParams) =>
    [...receiptQueryKeys.lists(), params] as const,
  details: () => [...receiptQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...receiptQueryKeys.details(), id] as const,
};
export const useReceiptsQuery = (params: ReceiptQueryParams) =>
  useQuery({
    queryKey: receiptQueryKeys.list(params),
    queryFn: () => getReceipts(params),
  });
export const useReceiptQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: receiptQueryKeys.detail(id),
    queryFn: () => getReceipt(id),
    enabled: enabled && Boolean(id),
  });
