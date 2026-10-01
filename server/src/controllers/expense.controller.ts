import { RequestHandler } from "express";
import { Types } from "mongoose";
import {
  createExpense,
  deleteExpense,
  getExpenseById,
  listExpenses,
  restoreExpense,
  updateExpense,
} from "../services/expense.service";
import { ApiError } from "../utils/ApiError";
import { successResponse } from "../utils/response";

const getValidated = (req: any) => {
  if (!req.validated) {
    throw new ApiError(
      500,
      "Validated request data is missing",
      "VALIDATED_DATA_MISSING",
    );
  }

  return req.validated;
};

/**
 * ============================================================
 * CREATE EXPENSE
 * ============================================================
 */
export const createExpenseController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const validated = getValidated(req);

    if (!req.user?._id) {
      return next(
        new ApiError(401, "Authentication required", "UNAUTHENTICATED"),
      );
    }

    const expense = await createExpense(
      validated.body,
      req.user._id as Types.ObjectId,
    );

    return res
      .status(201)
      .json(successResponse(expense, "Expense created successfully"));
  } catch (error) {
    return next(error);
  }
};

/**
 * ============================================================
 * LIST EXPENSES
 * ============================================================
 */
export const listExpensesController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const validated = getValidated(req);

    const result = await listExpenses(validated.query);

    return res
      .status(200)
      .json(successResponse(result, "Expenses fetched successfully"));
  } catch (error) {
    return next(error);
  }
};

/**
 * ============================================================
 * GET EXPENSE
 * ============================================================
 */
export const getExpenseController: RequestHandler = async (req, res, next) => {
  try {
    const validated = getValidated(req);

    const expense = await getExpenseById(
      validated.params.expenseId,
      validated.query.includeDeleted,
    );

    return res
      .status(200)
      .json(successResponse(expense, "Expense fetched successfully"));
  } catch (error) {
    return next(error);
  }
};

/**
 * ============================================================
 * UPDATE EXPENSE
 * ============================================================
 */
export const updateExpenseController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const validated = getValidated(req);

    const expense = await updateExpense(
      validated.params.expenseId,
      validated.body,
    );

    return res
      .status(200)
      .json(successResponse(expense, "Expense updated successfully"));
  } catch (error) {
    return next(error);
  }
};

/**
 * ============================================================
 * DELETE EXPENSE
 * ============================================================
 */
export const deleteExpenseController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const validated = getValidated(req);

    const expense = await deleteExpense(validated.params.expenseId);

    return res
      .status(200)
      .json(successResponse(expense, "Expense deleted successfully"));
  } catch (error) {
    return next(error);
  }
};

/**
 * ============================================================
 * RESTORE EXPENSE
 * ============================================================
 */
export const restoreExpenseController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const validated = getValidated(req);

    const expense = await restoreExpense(validated.params.expenseId);

    return res
      .status(200)
      .json(successResponse(expense, "Expense restored successfully"));
  } catch (error) {
    return next(error);
  }
};
