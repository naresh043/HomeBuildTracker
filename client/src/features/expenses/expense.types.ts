export type ExpenseCategory =
  | "TRANSPORT"
  | "WATER"
  | "ELECTRICITY"
  | "TOOLS"
  | "MISC";

export type ExpenseMethod = "CASH" | "UPI" | "BANK" | "CHEQUE" | "OTHER";

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
  paidByUserId: string | null;
  method: ExpenseMethod;
  stageId: string | null;
  receiptId: string | null;
  notes: string | null;
  createdBy: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExpensePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ExpenseListData {
  items: Expense[];
  pagination: ExpensePagination;
}

export interface ExpenseListResponse {
  success: boolean;
  message: string;
  data: ExpenseListData;
}

export interface ExpenseResponse {
  success: boolean;
  message: string;
  data: Expense;
}

export interface ExpenseFilters {
  q?: string;
  fromDate?: string;
  toDate?: string;
  category?: ExpenseCategory;
  stageId?: string;
  method?: ExpenseMethod;
  minAmount?: number;
  maxAmount?: number;
  hasReceipt?: boolean;
  includeDeleted?: boolean;
}

export interface ExpenseQueryParams extends ExpenseFilters {
  page?: number;
  limit?: number;
  paidByUserId?: string;
}

export interface CreateExpensePayload {
  date: string;
  amount: number;
  category: ExpenseCategory;
  paidByUserId: string;
  method: ExpenseMethod;
  stageId?: string;
  notes?: string;
}

export interface UpdateExpensePayload {
  date?: string;
  amount?: number;
  category?: ExpenseCategory;
  paidByUserId?: string;
  method?: ExpenseMethod;
  stageId?: string | null;
  notes?: string | null;
}
