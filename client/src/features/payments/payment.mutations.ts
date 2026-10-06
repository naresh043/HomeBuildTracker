import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createPayment,
  updatePayment,
  verifyPayment,
  deletePayment,
  restorePayment,
} from "@/api/payments.api";

import type {
  CreatePaymentRequest,
  UpdatePaymentRequest,
} from "./payment.types";

import { paymentQueryKeys } from "./payment.queries";
import { dashboardQueryKeys } from "@/features/dashboard/dashboard.queries";

export const useCreatePaymentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePaymentRequest) => createPayment(payload),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: paymentQueryKeys.all,
      });
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all });
    },
  });
};

export const useUpdatePaymentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      paymentId,
      payload,
    }: {
      paymentId: string;
      payload: UpdatePaymentRequest;
    }) => updatePayment(paymentId, payload),

    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: paymentQueryKeys.all,
      });

      void queryClient.invalidateQueries({
        queryKey: paymentQueryKeys.detail(variables.paymentId),
      });
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all });
    },
  });
};

export const useVerifyPaymentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId: string) => verifyPayment(paymentId),

    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: paymentQueryKeys.all,
      });

      void queryClient.invalidateQueries({
        queryKey: paymentQueryKeys.detail(variables),
      });
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all });
    },
  });
};

export const useDeletePaymentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId: string) => deletePayment(paymentId),

    onSuccess: (_data, paymentId) => {
      void queryClient.invalidateQueries({
        queryKey: paymentQueryKeys.all,
      });

      void queryClient.invalidateQueries({
        queryKey: paymentQueryKeys.detail(paymentId),
      });
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all });
    },
  });
};

export const useRestorePaymentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId: string) => restorePayment(paymentId),

    onSuccess: (_data, paymentId) => {
      void queryClient.invalidateQueries({
        queryKey: paymentQueryKeys.all,
      });

      void queryClient.invalidateQueries({
        queryKey: paymentQueryKeys.detail(paymentId),
      });
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all });
    },
  });
};
