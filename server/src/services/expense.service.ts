import { Types } from "mongoose";
import { Expense } from "../models/Expense";
import { User } from "../models/User";
import { ConstructionStage } from "../models/ConstructionStage";
import { ApiError } from "../utils/ApiError";
import { type PaymentMethod } from "../constants/payment";
import { EXPENSE_CATEGORY, type ExpenseCategory } from "../models/Expense";

interface CreateExpenseInput {
  date: Date;
  amount: number;
  category: ExpenseCategory;
  paidByUserId: string;
  method: PaymentMethod;
  stageId?: string;
  receiptId?: string;
  notes?: string;
}

interface ListExpensesInput {
  page: number;
  limit: number;
  q?: string;
  fromDate?: Date;
  toDate?: Date;
  category?: ExpenseCategory;
  paidByUserId?: string;
  stageId?: string;
  method?: PaymentMethod;
  minAmount?: number;
  maxAmount?: number;
  hasReceipt?: boolean;
  includeDeleted?: boolean;
}

interface UpdateExpenseInput {
  date?: Date;
  amount?: number;
  category?: ExpenseCategory;
  paidByUserId?: string;
  method?: PaymentMethod;
  stageId?: string | null;
  receiptId?: string | null;
  notes?: string | null;
}

const rupeesToPaise = (amount: number): number => {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ApiError(
      422,
      "Expense amount must be greater than zero",
      "INVALID_AMOUNT",
    );
  }

  const paise = Math.round(amount * 100);

  if (!Number.isSafeInteger(paise)) {
    throw new ApiError(422, "Expense amount is too large", "AMOUNT_TOO_LARGE");
  }

  return paise;
};

const paiseToRupees = (paise: number): number => {
  return Number((paise / 100).toFixed(2));
};

const isValidObjectId = (value: string): boolean =>
  Types.ObjectId.isValid(value);

const toObjectId = (value: string): Types.ObjectId => {
  if (!isValidObjectId(value)) {
    throw new ApiError(422, "Invalid MongoDB ObjectId", "INVALID_OBJECT_ID");
  }

  return new Types.ObjectId(value);
};

const validateUser = async (userId: string): Promise<void> => {
  const objectId = toObjectId(userId);

  const user = await User.findOne({
    _id: objectId,
    isActive: true,
  });

  if (!user) {
    throw new ApiError(
      404,
      "Paid-by user was not found or is inactive",
      "USER_NOT_FOUND",
    );
  }
};

const validateStage = async (stageId: string): Promise<void> => {
  const objectId = toObjectId(stageId);

  const stage = await ConstructionStage.findOne({
    _id: objectId,
    isDeleted: false,
  });

  if (!stage) {
    throw new ApiError(
      404,
      "Construction stage was not found",
      "STAGE_NOT_FOUND",
    );
  }
};

const validateOptionalObjectId = (
  value: string | null | undefined,
  fieldName: string,
): void => {
  if (value === undefined || value === null) {
    return;
  }

  if (!isValidObjectId(value)) {
    throw new ApiError(
      422,
      `${fieldName} must be a valid MongoDB ObjectId`,
      "INVALID_OBJECT_ID",
    );
  }
};

const serializeExpense = (expense: any) => ({
  id: expense._id.toString(),

  date: expense.date,

  amount: paiseToRupees(expense.amountPaise),

  category: expense.category,

  paidByUserId: expense.paidByUserId?.toString() ?? null,

  method: expense.method,

  stageId: expense.stageId?.toString() ?? null,

  receiptId: expense.receiptId?.toString() ?? null,

  notes: expense.notes ?? null,

  createdBy: expense.createdBy?.toString() ?? null,

  isDeleted: expense.isDeleted,

  createdAt: expense.createdAt,

  updatedAt: expense.updatedAt,
});

/**
 * ============================================================
 * CREATE EXPENSE
 * ============================================================
 */
export const createExpense = async (
  input: CreateExpenseInput,
  createdBy: Types.ObjectId,
) => {
  await validateUser(input.paidByUserId);

  if (input.stageId) {
    await validateStage(input.stageId);
  }

  validateOptionalObjectId(input.receiptId, "Receipt");

  const expense = await Expense.create({
    date: input.date,

    amountPaise: rupeesToPaise(input.amount),

    category: input.category,

    paidByUserId: toObjectId(input.paidByUserId),

    method: input.method,

    stageId: input.stageId ? toObjectId(input.stageId) : undefined,

    receiptId: input.receiptId ? toObjectId(input.receiptId) : undefined,

    notes: input.notes,

    createdBy,

    isDeleted: false,
  });

  return serializeExpense(expense);
};

/**
 * ============================================================
 * LIST EXPENSES
 * ============================================================
 */
export const listExpenses = async (input: ListExpensesInput) => {
  const {
    page,
    limit,
    q,
    fromDate,
    toDate,
    category,
    paidByUserId,
    stageId,
    method,
    minAmount,
    maxAmount,
    hasReceipt,
    includeDeleted = false,
  } = input;

  const filter: Record<string, any> = {};

  if (!includeDeleted) {
    filter.isDeleted = false;
  }

  if (q?.trim()) {
    filter.notes = {
      $regex: q.trim(),
      $options: "i",
    };
  }

  if (fromDate || toDate) {
    filter.date = {};

    if (fromDate) {
      filter.date.$gte = fromDate;
    }

    if (toDate) {
      filter.date.$lte = toDate;
    }
  }

  if (category) {
    filter.category = category;
  }

  if (paidByUserId) {
    filter.paidByUserId = toObjectId(paidByUserId);
  }

  if (stageId) {
    filter.stageId = toObjectId(stageId);
  }

  if (method) {
    filter.method = method;
  }

  if (minAmount !== undefined || maxAmount !== undefined) {
    filter.amountPaise = {};

    if (minAmount !== undefined) {
      filter.amountPaise.$gte = rupeesToPaise(minAmount);
    }

    if (maxAmount !== undefined) {
      filter.amountPaise.$lte = rupeesToPaise(maxAmount);
    }
  }

  if (hasReceipt === true) {
    filter.receiptId = {
      $exists: true,
      $ne: null,
    };
  }

  if (hasReceipt === false) {
    filter.$or = [
      {
        receiptId: {
          $exists: false,
        },
      },
      {
        receiptId: null,
      },
    ];
  }

  const skip = (page - 1) * limit;

  const [expenses, total] = await Promise.all([
    Expense.find(filter)
      .sort({
        date: -1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),

    Expense.countDocuments(filter),
  ]);

  return {
    items: expenses.map(serializeExpense),

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};

/**
 * ============================================================
 * GET EXPENSE
 * ============================================================
 */
export const getExpenseById = async (
  expenseId: string,
  includeDeleted = false,
) => {
  const id = toObjectId(expenseId);

  const filter: Record<string, any> = {
    _id: id,
  };

  if (!includeDeleted) {
    filter.isDeleted = false;
  }

  const expense = await Expense.findOne(filter);

  if (!expense) {
    throw new ApiError(404, "Expense not found", "EXPENSE_NOT_FOUND");
  }

  return serializeExpense(expense);
};

/**
 * ============================================================
 * UPDATE EXPENSE
 * ============================================================
 */
export const updateExpense = async (
  expenseId: string,
  input: UpdateExpenseInput,
) => {
  const id = toObjectId(expenseId);

  const expense = await Expense.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!expense) {
    throw new ApiError(404, "Expense not found", "EXPENSE_NOT_FOUND");
  }

  if (input.date !== undefined) {
    expense.date = input.date;
  }

  if (input.amount !== undefined) {
    expense.amountPaise = rupeesToPaise(input.amount);
  }

  if (input.category !== undefined) {
    expense.category = input.category;
  }

  if (input.paidByUserId !== undefined) {
    await validateUser(input.paidByUserId);

    expense.paidByUserId = toObjectId(input.paidByUserId);
  }

  if (input.method !== undefined) {
    expense.method = input.method;
  }

  if (input.stageId !== undefined) {
    if (input.stageId === null) {
      expense.stageId = undefined;
    } else {
      await validateStage(input.stageId);

      expense.stageId = toObjectId(input.stageId);
    }
  }

  if (input.receiptId !== undefined) {
    if (input.receiptId === null) {
      expense.receiptId = undefined;
    } else {
      validateOptionalObjectId(input.receiptId, "Receipt");

      expense.receiptId = toObjectId(input.receiptId);
    }
  }

  if (input.notes !== undefined) {
    expense.notes = input.notes ?? undefined;
  }

  await expense.save();

  return serializeExpense(expense);
};

/**
 * ============================================================
 * SOFT DELETE EXPENSE
 * ============================================================
 */
export const deleteExpense = async (expenseId: string) => {
  const id = toObjectId(expenseId);

  const expense = await Expense.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!expense) {
    throw new ApiError(404, "Expense not found", "EXPENSE_NOT_FOUND");
  }

  expense.isDeleted = true;

  await expense.save();

  return serializeExpense(expense);
};

/**
 * ============================================================
 * RESTORE EXPENSE
 * ============================================================
 */
export const restoreExpense = async (expenseId: string) => {
  const id = toObjectId(expenseId);

  const expense = await Expense.findOne({
    _id: id,
    isDeleted: true,
  });

  if (!expense) {
    throw new ApiError(404, "Deleted expense not found", "EXPENSE_NOT_FOUND");
  }

  expense.isDeleted = false;

  await expense.save();

  return serializeExpense(expense);
};
