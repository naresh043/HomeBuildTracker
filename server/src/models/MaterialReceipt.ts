// src/models/MaterialReceipt.ts

import { Document, Schema, Types, model } from "mongoose";
import { MATERIAL_UNIT, type MaterialUnit } from "../constants/material";

export const MATERIAL_RECEIPT_VERIFICATION_STATUS = {
  VERIFIED: "VERIFIED",
  NEEDS_VERIFICATION: "NEEDS_VERIFICATION",
} as const;

export type MaterialReceiptVerificationStatus =
  (typeof MATERIAL_RECEIPT_VERIFICATION_STATUS)[keyof typeof MATERIAL_RECEIPT_VERIFICATION_STATUS];

export interface IMaterialReceipt extends Document {
  receiptNo: string;

  vendorId: Types.ObjectId;
  materialId: Types.ObjectId;
  stageId: Types.ObjectId;

  date: Date;

  quantity: number;
  unit: MaterialUnit;

  unitPricePaise: number;
  totalAmountPaise: number;

  receiptId?: Types.ObjectId;
  agreementId?: Types.ObjectId;

  notes?: string;

  verificationStatus: MaterialReceiptVerificationStatus;

  createdBy: Types.ObjectId;

  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const materialReceiptSchema = new Schema<IMaterialReceipt>(
  {
    receiptNo: {
      type: String,
      required: [true, "Receipt number is required"],
      trim: true,
      uppercase: true,
      maxlength: [50, "Receipt number cannot exceed 50 characters"],
    },

    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: [true, "Vendor is required"],
      index: true,
    },

    materialId: {
      type: Schema.Types.ObjectId,
      ref: "Material",
      required: [true, "Material is required"],
      index: true,
    },

    stageId: {
      type: Schema.Types.ObjectId,
      ref: "ConstructionStage",
      required: [true, "Construction stage is required"],
      index: true,
    },

    date: {
      type: Date,
      required: [true, "Material receipt date is required"],
      index: true,
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0.000001, "Quantity must be greater than zero"],
    },

    unit: {
      type: String,
      required: [true, "Material unit is required"],
      enum: {
        values: Object.values(MATERIAL_UNIT),
        message: "Invalid material unit",
      },
    },

    unitPricePaise: {
      type: Number,
      required: [true, "Unit price is required"],
      min: [0, "Unit price cannot be negative"],
    },

    totalAmountPaise: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },

    receiptId: {
      type: Schema.Types.ObjectId,
      ref: "Receipt",
      index: true,
    },

    agreementId: {
      type: Schema.Types.ObjectId,
      ref: "SupplierAgreement",
      index: true,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },

    verificationStatus: {
      type: String,
      enum: {
        values: Object.values(MATERIAL_RECEIPT_VERIFICATION_STATUS),
        message: "Invalid verification status",
      },
      default: MATERIAL_RECEIPT_VERIFICATION_STATUS.NEEDS_VERIFICATION,
      required: true,
      index: true,
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

/**
 * Material receipt number must be unique.
 *
 * A receipt such as MR-0001 represents one material-receipt
 * transaction and must not be reused.
 */
materialReceiptSchema.index(
  { receiptNo: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  },
);

/**
 * Useful for material analytics and history.
 */
materialReceiptSchema.index({
  materialId: 1,
  date: -1,
  isDeleted: 1,
});

/**
 * Useful for supplier/vendor ledger queries.
 */
materialReceiptSchema.index({
  vendorId: 1,
  date: -1,
  isDeleted: 1,
});

/**
 * Useful for construction-stage cost queries.
 */
materialReceiptSchema.index({
  stageId: 1,
  date: -1,
  isDeleted: 1,
});

/**
 * Useful for verification workflow.
 */
materialReceiptSchema.index({
  verificationStatus: 1,
  isDeleted: 1,
});

/**
 * Calculate total from quantity × unit price.
 *
 * Money is stored in paise.
 *
 * Example:
 * 100 bags × ₹420
 * = 100 × 42000 paise
 * = 4,200,000 paise
 */
materialReceiptSchema.pre("validate", function () {
  if (this.quantity !== undefined && this.unitPricePaise !== undefined) {
    this.totalAmountPaise = Math.round(this.quantity * this.unitPricePaise);
  }
});

export const MaterialReceipt = model<IMaterialReceipt>(
  "MaterialReceipt",
  materialReceiptSchema,
);
