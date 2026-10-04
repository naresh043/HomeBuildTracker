import type { ExpenseCategory, ExpenseMethod } from "./expense.types";

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  TRANSPORT: "Transport",
  WATER: "Water",
  ELECTRICITY: "Electricity",
  TOOLS: "Tools",
  MISC: "Other",
};

export const EXPENSE_METHOD_LABELS: Record<ExpenseMethod, string> = {
  CASH: "Cash",
  UPI: "UPI",
  BANK: "Bank",
  CHEQUE: "Cheque",
  OTHER: "Other",
};

export const formatExpenseAmount = (amount: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

export const formatExpenseDate = (date: string): string =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
