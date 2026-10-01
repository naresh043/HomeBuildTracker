import { z } from "zod";
import { PAYMENT_METHOD, type PaymentMethod } from "../constants/payment";
import { EXPENSE_CATEGORY } from "../models/Expense";

const emptySchema = z.object({});

const expenseIdSchema = z.object({
  params: z.object({
    expenseId: z.string().min(1),
  }),
});

const expenseCategorySchema = z.enum(
  Object.values(EXPENSE_CATEGORY) as [
    (typeof EXPENSE_CATEGORY)[keyof typeof EXPENSE_CATEGORY],
    ...(typeof EXPENSE_CATEGORY)[keyof typeof EXPENSE_CATEGORY][],
  ],
);

const paymentMethodSchema = z.enum(
  Object.values(PAYMENT_METHOD) as [PaymentMethod, ...PaymentMethod[]],
);

const dateSchema = z.coerce.date();

const amountSchema = z
  .number()
  .finite()
  .positive()
  .max(100_000_000, "Expense amount cannot exceed ₹10 crore");

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Must be a valid MongoDB ObjectId");

export const createExpenseSchema = z.object({
  body: z
    .object({
      date: dateSchema,

      amount: amountSchema,

      category: expenseCategorySchema,

      paidByUserId: objectIdSchema,

      method: paymentMethodSchema,

      stageId: objectIdSchema.optional(),

      receiptId: objectIdSchema.optional(),

      notes: z.string().trim().max(1000).optional(),
    })
    .strict(),

  params: emptySchema,

  query: emptySchema,
});

export const listExpensesSchema = z.object({
  body: emptySchema,

  params: emptySchema,

  query: z
    .object({
      page: z.coerce.number().int().min(1).default(1),

      limit: z.coerce.number().int().min(1).max(100).default(20),

      q: z.string().trim().max(100).optional(),

      fromDate: dateSchema.optional(),

      toDate: dateSchema.optional(),

      category: expenseCategorySchema.optional(),

      paidByUserId: objectIdSchema.optional(),

      stageId: objectIdSchema.optional(),

      method: paymentMethodSchema.optional(),

      minAmount: z.coerce.number().finite().nonnegative().optional(),

      maxAmount: z.coerce.number().finite().nonnegative().optional(),

      hasReceipt: z
        .enum(["true", "false"])
        .transform((value) => value === "true")
        .optional(),

      includeDeleted: z
        .enum(["true", "false"])
        .transform((value) => value === "true")
        .default(false),
    })
    .refine(
      (data) => !data.fromDate || !data.toDate || data.fromDate <= data.toDate,
      {
        message: "fromDate cannot be later than toDate",
        path: ["fromDate"],
      },
    )
    .refine(
      (data) =>
        data.minAmount === undefined ||
        data.maxAmount === undefined ||
        data.minAmount <= data.maxAmount,
      {
        message: "minAmount cannot be greater than maxAmount",
        path: ["minAmount"],
      },
    ),
});

export const getExpenseSchema = z.object({
  body: emptySchema,

  params: z.object({
    expenseId: objectIdSchema,
  }),

  query: z.object({
    includeDeleted: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .default(false),
  }),
});

export const updateExpenseSchema = z.object({
  body: z
    .object({
      date: dateSchema.optional(),

      amount: amountSchema.optional(),

      category: expenseCategorySchema.optional(),

      paidByUserId: objectIdSchema.optional(),

      method: paymentMethodSchema.optional(),

      stageId: objectIdSchema.nullable().optional(),

      receiptId: objectIdSchema.nullable().optional(),

      notes: z.string().trim().max(1000).nullable().optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required for update",
    }),

  params: z.object({
    expenseId: objectIdSchema,
  }),

  query: emptySchema,
});

export const deleteExpenseSchema = z.object({
  body: emptySchema,

  params: z.object({
    expenseId: objectIdSchema,
  }),

  query: emptySchema,
});

export const restoreExpenseSchema = z.object({
  body: emptySchema,

  params: z.object({
    expenseId: objectIdSchema,
  }),

  query: emptySchema,
});
