import { Document, Schema, Types, model } from "mongoose";
import {
  CONTRACT_RATE_UNIT,
  CONTRACT_STATUS,
  CONTRACT_TYPE,
  type ContractRateUnit,
  type ContractStatus,
  type ContractType,
} from "../constants/contract";

export interface IContract extends Document {
  vendorId: Types.ObjectId;

  contractType: ContractType;

  ratePaise: number;

  rateUnit: ContractRateUnit;

  /**
   * Measurement used for rate calculation.
   *
   * Example:
   * rateUnit = SQUARE
   * measurement = 10
   *
   * estimatedAmount = rate × measurement
   *
   * For LUMP_SUM contracts this can be omitted.
   */
  measurement?: number;

  estimatedAmountPaise: number;

  advanceAmountPaise: number;

  scopeIncluded: string[];

  scopeExcluded: string[];

  startDate: Date;

  status: ContractStatus;

  notes?: string;

  createdBy: Types.ObjectId;

  isDeleted: boolean;

  createdAt: Date;

  updatedAt: Date;
}

const contractSchema = new Schema<IContract>(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: [true, "Vendor is required"],
      index: true,
    },

    contractType: {
      type: String,
      enum: Object.values(CONTRACT_TYPE),
      required: [true, "Contract type is required"],
      trim: true,
      index: true,
    },

    ratePaise: {
      type: Number,
      required: [true, "Contract rate is required"],
      min: [0, "Contract rate cannot be negative"],
    },

    rateUnit: {
      type: String,
      enum: Object.values(CONTRACT_RATE_UNIT),
      required: [true, "Contract rate unit is required"],
      trim: true,
      index: true,
    },

    measurement: {
      type: Number,
      min: [0, "Measurement cannot be negative"],
    },

    estimatedAmountPaise: {
      type: Number,
      required: [true, "Estimated contract amount is required"],
      min: [0, "Estimated contract amount cannot be negative"],
    },

    advanceAmountPaise: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Advance amount cannot be negative"],
    },

    scopeIncluded: {
      type: [String],
      default: [],
    },

    scopeExcluded: {
      type: [String],
      default: [],
    },

    startDate: {
      type: Date,
      required: [true, "Contract start date is required"],
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(CONTRACT_STATUS),
      required: true,
      default: CONTRACT_STATUS.DRAFT,
      index: true,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 5000,
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

contractSchema.index({
  vendorId: 1,
  isDeleted: 1,
});

contractSchema.index({
  status: 1,
  isDeleted: 1,
});

contractSchema.index({
  startDate: -1,
  isDeleted: 1,
});

export const Contract = model<IContract>("Contract", contractSchema);
