import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createExpense,
  deleteExpense,
  restoreExpense,
  updateExpense,
} from "@/api/expenses.api";
import type {
  CreateExpensePayload,
  UpdateExpensePayload,
} from "./expense.types";
import { expenseQueryKeys } from "./expense.queries";

export const useCreateExpenseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExpensePayload) => createExpense(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.all }),
  });
};

export const useUpdateExpenseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      expenseId,
      payload,
    }: {
      expenseId: string;
      payload: UpdateExpensePayload;
    }) => updateExpense(expenseId, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: expenseQueryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: expenseQueryKeys.detail(variables.expenseId),
      });
    },
  });
};

export const useDeleteExpenseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (expenseId: string) => deleteExpense(expenseId),
    onSuccess: (_data, expenseId) => {
      void queryClient.invalidateQueries({ queryKey: expenseQueryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: expenseQueryKeys.detail(expenseId),
      });
    },
  });
};

export const useRestoreExpenseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (expenseId: string) => restoreExpense(expenseId),
    onSuccess: (_data, expenseId) => {
      void queryClient.invalidateQueries({ queryKey: expenseQueryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: expenseQueryKeys.detail(expenseId, true),
      });
    },
  });
};
