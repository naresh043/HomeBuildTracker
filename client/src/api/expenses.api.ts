import apiClient from "./client";
import { API_ENDPOINTS } from "./endpoints";
import type {
  CreateExpensePayload,
  ExpenseListResponse,
  ExpenseQueryParams,
  ExpenseResponse,
  UpdateExpensePayload,
} from "@/features/expenses/expense.types";

export const createExpense = async (
  payload: CreateExpensePayload,
): Promise<ExpenseResponse> => {
  const response = await apiClient.post<ExpenseResponse>(
    API_ENDPOINTS.expenses.base,
    payload,
  );
  return response.data;
};

export const getExpenses = async (
  params?: ExpenseQueryParams,
): Promise<ExpenseListResponse> => {
  const response = await apiClient.get<ExpenseListResponse>(
    API_ENDPOINTS.expenses.base,
    { params },
  );
  return response.data;
};

export const getExpense = async (
  expenseId: string,
  includeDeleted = false,
): Promise<ExpenseResponse> => {
  const response = await apiClient.get<ExpenseResponse>(
    API_ENDPOINTS.expenses.byId(expenseId),
    { params: includeDeleted ? { includeDeleted: true } : undefined },
  );
  return response.data;
};

export const updateExpense = async (
  expenseId: string,
  payload: UpdateExpensePayload,
): Promise<ExpenseResponse> => {
  const response = await apiClient.patch<ExpenseResponse>(
    API_ENDPOINTS.expenses.byId(expenseId),
    payload,
  );
  return response.data;
};

export const deleteExpense = async (
  expenseId: string,
): Promise<ExpenseResponse> => {
  const response = await apiClient.delete<ExpenseResponse>(
    API_ENDPOINTS.expenses.byId(expenseId),
  );
  return response.data;
};

export const restoreExpense = async (
  expenseId: string,
): Promise<ExpenseResponse> => {
  const response = await apiClient.patch<ExpenseResponse>(
    API_ENDPOINTS.expenses.restore(expenseId),
  );
  return response.data;
};
