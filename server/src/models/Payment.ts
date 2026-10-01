import { Document, Schema, Types, model } from "mongoose";

import {
  PAYMENT_METHOD,
  PAYMENT_TYPE,
  PAYMENT_VERIFICATION_STATUS,
  UPI_APP,
  type PaymentMethod,
  type PaymentType,
  type PaymentVerificationStatus,
  type UpiApp,
} from "../constants/payment";

export interface IPayment extends Document {
  paymentNo: string;

  date: Date;

  amountPaise: number;

  paidByUserId: Types.ObjectId;

  paidToVendorId?: Types.ObjectId;

  paymentType: PaymentType;

  method: PaymentMethod;

  upiApp?: UpiApp;

  transactionReference?: string;

  relatedContractId?: Types.ObjectId;

  relatedSupplierAgreementId?: Types.ObjectId;

  stageId?: Types.ObjectId;

  receiptId?: Types.ObjectId;

  notes?: string;

  verificationStatus: PaymentVerificationStatus;

  createdBy: Types.ObjectId;

  isDeleted: boolean;

  createdAt: Date;

  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    paymentNo: {
      type: String,
      required: [true, "Payment number is required"],
      trim: true,
      uppercase: true,
      maxlength: [50, "Payment number cannot exceed 50 characters"],
    },

    date: {
      type: Date,
      required: [true, "Payment date is required"],
      index: true,
    },

    /*
     * Money is always stored as integer paise.
     *
     * ₹2,000
     * ↓
     * 200000 paise
     */
    amountPaise: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [1, "Payment amount must be greater than zero"],
      validate: {
        validator: Number.isSafeInteger,
        message: "Payment amount must be a safe integer in paise",
      },
    },

    /*
     * The family member who actually made
     * the payment.
     *
     * Example:
     * Father paid Siddappa ₹50,000.
     */
    paidByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Paid-by user is required"],
      index: true,
    },

    /*
     * Optional because some payments may
     * not be made to a vendor.
     *
     * Example:
     * OTHER payment.
     */
    paidToVendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      index: true,
    },

    paymentType: {
      type: String,
      required: [true, "Payment type is required"],
      enum: {
        values: Object.values(PAYMENT_TYPE),
        message: "Invalid payment type",
      },
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

    /*
     * Only meaningful for UPI payments.
     *
     * Example:
     * PHONEPE
     * GOOGLE_PAY
     */
    upiApp: {
      type: String,
      enum: {
        values: Object.values(UPI_APP),
        message: "Invalid UPI app",
      },
    },

    /*
     * UPI transaction ID,
     * bank reference,
     * cheque reference, etc.
     */
    transactionReference: {
      type: String,
      trim: true,
      maxlength: [200, "Transaction reference cannot exceed 200 characters"],
    },

    /*
     * Optional link to Siddappa's contract.
     */
    relatedContractId: {
      type: Schema.Types.ObjectId,
      ref: "Contract",
      index: true,
    },

    /*
     * Optional link to a supplier agreement.
     *
     * SupplierAgreement is a future module,
     * so we keep the reference here without
     * importing a model that does not exist yet.
     */
    relatedSupplierAgreementId: {
      type: Schema.Types.ObjectId,
      ref: "SupplierAgreement",
      index: true,
    },

    /*
     * Optional construction stage.
     */
    stageId: {
      type: Schema.Types.ObjectId,
      ref: "ConstructionStage",
      index: true,
    },

    /*
     * Optional receipt/bill reference.
     *
     * Receipt module will be implemented later.
     */
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

    verificationStatus: {
      type: String,
      required: true,
      enum: {
        values: Object.values(PAYMENT_VERIFICATION_STATUS),
        message: "Invalid payment verification status",
      },
      default: PAYMENT_VERIFICATION_STATUS.NEEDS_VERIFICATION,
      index: true,
    },

    /*
     * User who created the record.
     */
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by user is required"],
      index: true,
    },

    /*
     * No hard delete.
     */
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

/*
 * Payment number must be unique among
 * active records.
 *
 * Example:
 * PAY-0001
 * PAY-0002
 * PAY-0003
 */
paymentSchema.index(
  {
    paymentNo: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  },
);

/*
 * Main payment timeline query.
 */
paymentSchema.index({
  date: -1,
  isDeleted: 1,
});

/*
 * Family member payment history.
 */
paymentSchema.index({
  paidByUserId: 1,
  date: -1,
  isDeleted: 1,
});

/*
 * Vendor payment history.
 */
paymentSchema.index({
  paidToVendorId: 1,
  date: -1,
  isDeleted: 1,
});

/*
 * Stage financial history.
 */
paymentSchema.index({
  stageId: 1,
  date: -1,
  isDeleted: 1,
});

/*
 * Payment type reporting.
 */
paymentSchema.index({
  paymentType: 1,
  date: -1,
  isDeleted: 1,
});

/*
 * Payment method reporting.
 */
paymentSchema.index({
  method: 1,
  date: -1,
  isDeleted: 1,
});

/*
 * Verification workflow.
 */
paymentSchema.index({
  verificationStatus: 1,
  isDeleted: 1,
});

/*
 * Contract ledger.
 */
paymentSchema.index({
  relatedContractId: 1,
  date: -1,
  isDeleted: 1,
});

/*
 * Supplier ledger.
 */
paymentSchema.index({
  relatedSupplierAgreementId: 1,
  date: -1,
  isDeleted: 1,
});

/*
 * Receipt lookup.
 */
paymentSchema.index({
  receiptId: 1,
  isDeleted: 1,
});

export const Payment = model<IPayment>("Payment", paymentSchema);
