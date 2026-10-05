import { useQuery } from "@tanstack/react-query";
import { getExpense, getExpenses } from "@/api/expenses.api";
import type { ExpenseQueryParams } from "./expense.types";

export const expenseQueryKeys = {
  all: ["expenses"] as const,
  lists: () => [...expenseQueryKeys.all, "list"] as const,
  list: (params?: ExpenseQueryParams) =>
    [...expenseQueryKeys.lists(), params ?? {}] as const,
  details: () => [...expenseQueryKeys.all, "detail"] as const,
  detail: (expenseId: string, includeDeleted = false) =>
    [...expenseQueryKeys.details(), expenseId, { includeDeleted }] as const,
};

export const useExpensesQuery = (params?: ExpenseQueryParams, enabled = true) =>
  useQuery({
    queryKey: expenseQueryKeys.list(params),
    queryFn: () => getExpenses(params),
    enabled,
  });

export const useExpenseQuery = (
  expenseId: string,
  includeDeleted = false,
  enabled = true,
) =>
  useQuery({
    queryKey: expenseQueryKeys.detail(expenseId, includeDeleted),
    queryFn: () => getExpense(expenseId, includeDeleted),
    enabled: enabled && Boolean(expenseId),
  });
