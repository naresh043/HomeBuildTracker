import { Document, Schema, Types, model } from "mongoose";
import {
  SUPPLIER_AGREEMENT_STATUS,
  type SupplierAgreementStatus,
} from "../constants/supplierAgreement";

export interface ISupplierAgreement extends Document {
  vendorId: Types.ObjectId;
  materialIds: Types.ObjectId[];
  advanceAmountPaise: number;
  startDate: Date;
  status: SupplierAgreementStatus;
  notes?: string;
  createdBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const supplierAgreementSchema = new Schema<ISupplierAgreement>(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: [true, "Supplier vendor is required"],
      index: true,
    },

    materialIds: {
      type: [Schema.Types.ObjectId],
      ref: "Material",
      required: [true, "At least one material is required"],
      validate: {
        validator: (value: Types.ObjectId[]) =>
          Array.isArray(value) && value.length > 0,
        message: "At least one material is required",
      },
    },

    advanceAmountPaise: {
      type: Number,
      required: true,
      min: [0, "Advance amount cannot be negative"],
    },

    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(SUPPLIER_AGREEMENT_STATUS),
      required: true,
      default: SUPPLIER_AGREEMENT_STATUS.ACTIVE,
      index: true,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by user is required"],
      index: true,
    },

    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

supplierAgreementSchema.index({
  vendorId: 1,
  isDeleted: 1,
});

supplierAgreementSchema.index({
  status: 1,
  isDeleted: 1,
});

supplierAgreementSchema.index({
  startDate: -1,
});

export const SupplierAgreement = model<ISupplierAgreement>(
  "SupplierAgreement",
  supplierAgreementSchema,
);