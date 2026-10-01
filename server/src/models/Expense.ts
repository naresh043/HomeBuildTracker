import { Document, Schema, Types, model } from "mongoose";
import { PAYMENT_METHOD, type PaymentMethod } from "../constants/payment";

export const EXPENSE_CATEGORY = {
  TRANSPORT: "TRANSPORT",
  WATER: "WATER",
  ELECTRICITY: "ELECTRICITY",
  TOOLS: "TOOLS",
  MISC: "MISC",
} as const;

export type ExpenseCategory =
  (typeof EXPENSE_CATEGORY)[keyof typeof EXPENSE_CATEGORY];

export interface IExpense extends Document {
  date: Date;
  amountPaise: number;
  category: ExpenseCategory;
  paidByUserId: Types.ObjectId;
  method: PaymentMethod;
  stageId?: Types.ObjectId;
  receiptId?: Types.ObjectId;
  notes?: string;
  createdBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    date: {
      type: Date,
      required: [true, "Expense date is required"],
      index: true,
    },

    amountPaise: {
      type: Number,
      required: [true, "Expense amount is required"],
      min: [1, "Expense amount must be greater than zero"],
      validate: {
        validator: Number.isSafeInteger,
        message: "Expense amount must be a safe integer in paise",
      },
    },

    category: {
      type: String,
      required: [true, "Expense category is required"],
      enum: {
        values: Object.values(EXPENSE_CATEGORY),
        message: "Invalid expense category",
      },
      index: true,
    },

    paidByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Paid-by user is required"],
      index: true,
    },

    method: {
      type: String,
      required: [true, "Payment method is required"],
      enum: {
        values: Object.values(PAYMENT_METHOD),
        message: "Invalid payment method",
      },
      index: true,
    },

    stageId: {
      type: Schema.Types.ObjectId,
      ref: "ConstructionStage",
      index: true,
    },

    receiptId: {
      type: Schema.Types.ObjectId,
      ref: "Receipt",
      index: true,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by user is required"],
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

expenseSchema.index({
  date: -1,
  isDeleted: 1,
});

expenseSchema.index({
  category: 1,
  date: -1,
  isDeleted: 1,
});

expenseSchema.index({
  paidByUserId: 1,
  date: -1,
  isDeleted: 1,
});

expenseSchema.index({
  stageId: 1,
  date: -1,
  isDeleted: 1,
});

expenseSchema.index({
  method: 1,
  date: -1,
  isDeleted: 1,
});

expenseSchema.index({
  receiptId: 1,
  isDeleted: 1,
});

export const Expense = model<IExpense>("Expense", expenseSchema);
