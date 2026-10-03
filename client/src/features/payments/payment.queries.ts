import { useQuery } from "@tanstack/react-query";

import { getPayment, getPayments } from "@/api/payments.api";

import type { PaymentQueryParams } from "./payment.types";

export const paymentQueryKeys = {
  all: ["payments"] as const,

  lists: () => [...paymentQueryKeys.all, "list"] as const,

  list: (params?: PaymentQueryParams) =>
    [...paymentQueryKeys.lists(), params ?? {}] as const,

  details: () => [...paymentQueryKeys.all, "detail"] as const,

  detail: (paymentId: string) =>
    [...paymentQueryKeys.details(), paymentId] as const,
};

export const usePaymentsQuery = (params?: PaymentQueryParams) => {
  return useQuery({
    queryKey: paymentQueryKeys.list(params),
    queryFn: () => getPayments(params),
  });
};

export const usePaymentQuery = (paymentId: string, enabled = true) => {
  return useQuery({
    queryKey: paymentQueryKeys.detail(paymentId),
    queryFn: () => getPayment(paymentId),
    enabled: enabled && Boolean(paymentId),
  });
};
