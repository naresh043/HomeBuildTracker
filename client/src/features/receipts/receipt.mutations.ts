import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  deleteReceipt,
  linkReceipt,
  restoreReceipt,
  unlinkReceipt,
  uploadReceipt,
} from "@/api/receipts.api";

import { expenseQueryKeys } from "@/features/expenses/expense.queries";
import { materialReceiptQueryKeys } from "@/features/material-receipts/material-receipt.queries";
import { paymentQueryKeys } from "@/features/payments/payment.queries";
import { dashboardQueryKeys } from "@/features/dashboard/dashboard.queries";

import type {
  ReceiptLinkPayload,
  ReceiptUnlinkPayload,
  UploadReceiptPayload,
} from "./receipt.types";

import { receiptQueryKeys } from "./receipt.queries";

const relatedKeys = (
  payload: ReceiptLinkPayload | ReceiptUnlinkPayload,
) =>
  "paymentId" in payload
    ? paymentQueryKeys.all
    : "materialReceiptId" in payload
      ? materialReceiptQueryKeys.all
      : expenseQueryKeys.all;

export const useUploadReceiptMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: UploadReceiptPayload) => uploadReceipt(payload),

    onSuccess: (response) => {
      qc.invalidateQueries({
        queryKey: receiptQueryKeys.all,
      });

      if (response.data) {
        qc.setQueryData(
          receiptQueryKeys.detail(response.data._id),
          response,
        );
      }
    },
  });
};

export const useDeleteReceiptMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteReceipt,

    onSuccess: (response, receiptId) => {
      qc.invalidateQueries({
        queryKey: receiptQueryKeys.all,
      });

      if (response.data) {
        qc.setQueryData(
          receiptQueryKeys.detail(receiptId),
          response,
        );
      }
    },
  });
};

export const useRestoreReceiptMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: restoreReceipt,

    onSuccess: (response, receiptId) => {
      qc.invalidateQueries({
        queryKey: receiptQueryKeys.all,
      });

      if (response.data) {
        qc.setQueryData(
          receiptQueryKeys.detail(receiptId),
          response,
        );
      }
    },
  });
};

export const useLinkReceiptMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ReceiptLinkPayload;
    }) => linkReceipt(id, payload),

    onSuccess: (response, variables) => {
      qc.invalidateQueries({
        queryKey: receiptQueryKeys.all,
      });

      qc.invalidateQueries({
        queryKey: relatedKeys(variables.payload),
      });
      if ("paymentId" in variables.payload || "materialReceiptId" in variables.payload) {
        qc.invalidateQueries({ queryKey: dashboardQueryKeys.all });
      }

      if (response.data) {
        qc.setQueryData(
          receiptQueryKeys.detail(variables.id),
          response,
        );
      }
    },
  });
};

export const useUnlinkReceiptMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ReceiptUnlinkPayload;
    }) => unlinkReceipt(id, payload),

    onSuccess: (response, variables) => {
      qc.invalidateQueries({
        queryKey: receiptQueryKeys.all,
      });

      qc.invalidateQueries({
        queryKey: relatedKeys(variables.payload),
      });
      if ("paymentId" in variables.payload || "materialReceiptId" in variables.payload) {
        qc.invalidateQueries({ queryKey: dashboardQueryKeys.all });
      }

      if (response.data) {
        qc.setQueryData(
          receiptQueryKeys.detail(variables.id),
          response,
        );
      }
    },
  });
};
