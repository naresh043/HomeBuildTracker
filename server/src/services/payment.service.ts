import { Types } from "mongoose";
import { Payment } from "../models/Payment";
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
import { User } from "../models/User";
import { Vendor } from "../models/Vendor";
import { ConstructionStage } from "../models/ConstructionStage";
import { Counter } from "../models/Counter";
import { ApiError } from "../utils/ApiError";

interface CreatePaymentInput {
  date: Date;
  amount: number;
  paidByUserId: string;
  paidToVendorId?: string;
  paymentType: PaymentType;
  method: PaymentMethod;
  upiApp?: UpiApp;
  transactionReference?: string;
  relatedContractId?: string;
  relatedSupplierAgreementId?: string;
  stageId?: string;
  receiptId?: string;
  notes?: string;
  verificationStatus?: PaymentVerificationStatus;
}

interface ListPaymentsInput {
  page: number;
  limit: number;
  q?: string;
  fromDate?: Date;
  toDate?: Date;
  vendorId?: string;
  paidByUserId?: string;
  stageId?: string;
  paymentType?: PaymentType;
  method?: PaymentMethod;
  verificationStatus?: PaymentVerificationStatus;
  minAmount?: number;
  maxAmount?: number;
  hasReceipt?: boolean;
  includeDeleted?: boolean;
}

interface UpdatePaymentInput {
  date?: Date;
  amount?: number;
  paidByUserId?: string;
  paidToVendorId?: string | null;
  paymentType?: PaymentType;
  method?: PaymentMethod;
  upiApp?: UpiApp | null;
  transactionReference?: string | null;
  relatedContractId?: string | null;
  relatedSupplierAgreementId?: string | null;
  stageId?: string | null;
  receiptId?: string | null;
  notes?: string | null;
  verificationStatus?: PaymentVerificationStatus;
}

const PAYMENT_COUNTER_KEY = "PAYMENT";

const rupeesToPaise = (amount: number): number => {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ApiError(
      422,
      "Payment amount must be greater than zero",
      "INVALID_AMOUNT",
    );
  }

  const paise = Math.round(amount * 100);

  if (!Number.isSafeInteger(paise)) {
    throw new ApiError(422, "Payment amount is too large", "AMOUNT_TOO_LARGE");
  }

  return paise;
};

const paiseToRupees = (paise: number): number => {
  return Number((paise / 100).toFixed(2));
};

const isValidObjectId = (value: string): boolean => {
  return Types.ObjectId.isValid(value);
};

const toObjectId = (value: string): Types.ObjectId => {
  if (!isValidObjectId(value)) {
    throw new ApiError(
      422,
      `Invalid MongoDB ObjectId: ${value}`,
      "INVALID_OBJECT_ID",
    );
  }

  return new Types.ObjectId(value);
};

const generatePaymentNumber = async (): Promise<string> => {
  const counter = await Counter.findOneAndUpdate(
    { key: PAYMENT_COUNTER_KEY },
    { $inc: { sequence: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  if (!counter) {
    throw new ApiError(
      500,
      "Unable to generate payment number",
      "PAYMENT_NUMBER_GENERATION_FAILED",
    );
  }

  return `PAY-${String(counter.sequence).padStart(4, "0")}`;
};

const validateUser = async (
  userId: string,
  fieldName = "Paid-by user",
): Promise<void> => {
  const objectId = toObjectId(userId);

  const user = await User.findOne({
    _id: objectId,
    isActive: true,
  });

  if (!user) {
    throw new ApiError(
      404,
      `${fieldName} was not found or is inactive`,
      "USER_NOT_FOUND",
    );
  }
};

const validateVendor = async (vendorId: string): Promise<void> => {
  const objectId = toObjectId(vendorId);

  const vendor = await Vendor.findOne({
    _id: objectId,
    isDeleted: false,
    status: "ACTIVE",
  });

  if (!vendor) {
    throw new ApiError(
      404,
      "Vendor was not found or is inactive",
      "VENDOR_NOT_FOUND",
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

const validatePaymentRules = (data: {
  paymentType: PaymentType;
  method: PaymentMethod;
  upiApp?: UpiApp | null;
  transactionReference?: string | null;
  paidToVendorId?: string | null;
  relatedContractId?: string | null;
}): void => {
  if (data.method === PAYMENT_METHOD.UPI) {
    if (!data.upiApp) {
      throw new ApiError(
        422,
        "UPI app is required when payment method is UPI",
        "UPI_APP_REQUIRED",
      );
    }

    if (!data.transactionReference?.trim()) {
      throw new ApiError(
        422,
        "Transaction reference is required for UPI payments",
        "TRANSACTION_REFERENCE_REQUIRED",
      );
    }
  }

  if (data.method !== PAYMENT_METHOD.UPI && data.upiApp) {
    throw new ApiError(
      422,
      "UPI app can only be provided for UPI payments",
      "INVALID_UPI_APP",
    );
  }

  if (
    data.paymentType === PAYMENT_TYPE.CONTRACT_PAYMENT &&
    !data.relatedContractId
  ) {
    throw new ApiError(
      422,
      "Related contract is required for contract payments",
      "CONTRACT_REQUIRED",
    );
  }

  if (
    (data.paymentType === PAYMENT_TYPE.MATERIAL_PAYMENT ||
      data.paymentType === PAYMENT_TYPE.SERVICE_PAYMENT) &&
    !data.paidToVendorId
  ) {
    throw new ApiError(
      422,
      "Vendor is required for this payment type",
      "VENDOR_REQUIRED",
    );
  }
};

const serializePayment = (payment: any) => {
  return {
    id: payment._id.toString(),
    paymentNo: payment.paymentNo,
    date: payment.date,
    amount: paiseToRupees(payment.amountPaise),

    paidByUserId: payment.paidByUserId?.toString() ?? null,
    paidToVendorId: payment.paidToVendorId?.toString() ?? null,

    paymentType: payment.paymentType,
    method: payment.method,
    upiApp: payment.upiApp ?? null,
    transactionReference: payment.transactionReference ?? null,

    relatedContractId: payment.relatedContractId?.toString() ?? null,
    relatedSupplierAgreementId:
      payment.relatedSupplierAgreementId?.toString() ?? null,

    stageId: payment.stageId?.toString() ?? null,
    receiptId: payment.receiptId?.toString() ?? null,

    notes: payment.notes ?? null,
    verificationStatus: payment.verificationStatus,

    createdBy: payment.createdBy?.toString() ?? null,

    isDeleted: payment.isDeleted,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
};

/**
 * ============================================================
 * CREATE PAYMENT
 * ============================================================
 */
export const createPayment = async (
  input: CreatePaymentInput,
  createdBy: Types.ObjectId,
) => {
  await validateUser(input.paidByUserId);

  if (input.paidToVendorId) {
    await validateVendor(input.paidToVendorId);
  }

  if (input.stageId) {
    await validateStage(input.stageId);
  }

  validateOptionalObjectId(input.relatedContractId, "Related contract");

  validateOptionalObjectId(
    input.relatedSupplierAgreementId,
    "Related supplier agreement",
  );

  validateOptionalObjectId(input.receiptId, "Receipt");

  validatePaymentRules({
    paymentType: input.paymentType,
    method: input.method,
    upiApp: input.upiApp,
    transactionReference: input.transactionReference,
    paidToVendorId: input.paidToVendorId,
    relatedContractId: input.relatedContractId,
  });

  const amountPaise = rupeesToPaise(input.amount);
  const paymentNo = await generatePaymentNumber();

  const payment = await Payment.create({
    paymentNo,
    date: input.date,
    amountPaise,

    paidByUserId: toObjectId(input.paidByUserId),
    paidToVendorId: input.paidToVendorId
      ? toObjectId(input.paidToVendorId)
      : undefined,

    paymentType: input.paymentType,
    method: input.method,
    upiApp: input.upiApp,
    transactionReference: input.transactionReference,

    relatedContractId: input.relatedContractId
      ? toObjectId(input.relatedContractId)
      : undefined,

    relatedSupplierAgreementId: input.relatedSupplierAgreementId
      ? toObjectId(input.relatedSupplierAgreementId)
      : undefined,

    stageId: input.stageId ? toObjectId(input.stageId) : undefined,

    receiptId: input.receiptId ? toObjectId(input.receiptId) : undefined,

    notes: input.notes,

    verificationStatus:
      input.verificationStatus ??
      PAYMENT_VERIFICATION_STATUS.NEEDS_VERIFICATION,

    createdBy,
    isDeleted: false,
  });

  return serializePayment(payment);
};

/**
 * ============================================================
 * LIST PAYMENTS
 * ============================================================
 */
export const listPayments = async (input: ListPaymentsInput) => {
  const {
    page,
    limit,
    q,
    fromDate,
    toDate,
    vendorId,
    paidByUserId,
    stageId,
    paymentType,
    method,
    verificationStatus,
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
    const search = q.trim();

    filter.$or = [
      {
        paymentNo: {
          $regex: search,
          $options: "i",
        },
      },
      {
        transactionReference: {
          $regex: search,
          $options: "i",
        },
      },
      {
        notes: {
          $regex: search,
          $options: "i",
        },
      },
    ];
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

  if (vendorId) {
    filter.paidToVendorId = toObjectId(vendorId);
  }

  if (paidByUserId) {
    filter.paidByUserId = toObjectId(paidByUserId);
  }

  if (stageId) {
    filter.stageId = toObjectId(stageId);
  }

  if (paymentType) {
    filter.paymentType = paymentType;
  }

  if (method) {
    filter.method = method;
  }

  if (verificationStatus) {
    filter.verificationStatus = verificationStatus;
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
    filter.$and = [
      ...(filter.$and ?? []),
      {
        $or: [{ receiptId: { $exists: false } }, { receiptId: null }],
      },
    ];
  }

  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Payment.countDocuments(filter),
  ]);

  return {
    items: payments.map(serializePayment),
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
 * GET PAYMENT
 * ============================================================
 */
export const getPaymentById = async (
  paymentId: string,
  includeDeleted = false,
) => {
  const id = toObjectId(paymentId);

  const filter: Record<string, any> = {
    _id: id,
  };

  if (!includeDeleted) {
    filter.isDeleted = false;
  }

  const payment = await Payment.findOne(filter);

  if (!payment) {
    throw new ApiError(404, "Payment not found", "PAYMENT_NOT_FOUND");
  }

  return serializePayment(payment);
};

/**
 * ============================================================
 * UPDATE PAYMENT
 * ============================================================
 */
export const updatePayment = async (
  paymentId: string,
  input: UpdatePaymentInput,
) => {
  const id = toObjectId(paymentId);

  const payment = await Payment.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!payment) {
    throw new ApiError(404, "Payment not found", "PAYMENT_NOT_FOUND");
  }

  if (input.date !== undefined) {
    payment.date = input.date;
  }

  if (input.amount !== undefined) {
    payment.amountPaise = rupeesToPaise(input.amount);
  }

  if (input.paidByUserId !== undefined) {
    await validateUser(input.paidByUserId);

    payment.paidByUserId = toObjectId(input.paidByUserId);
  }

  if (input.paidToVendorId !== undefined) {
    if (input.paidToVendorId === null) {
      payment.paidToVendorId = undefined;
    } else {
      await validateVendor(input.paidToVendorId);

      payment.paidToVendorId = toObjectId(input.paidToVendorId);
    }
  }

  if (input.stageId !== undefined) {
    if (input.stageId === null) {
      payment.stageId = undefined;
    } else {
      await validateStage(input.stageId);

      payment.stageId = toObjectId(input.stageId);
    }
  }

  if (input.paymentType !== undefined) {
    payment.paymentType = input.paymentType;
  }

  if (input.method !== undefined) {
    payment.method = input.method;

    if (input.method !== PAYMENT_METHOD.UPI) {
      payment.upiApp = undefined;
      payment.transactionReference = undefined;
    }
  }

  if (input.upiApp !== undefined) {
    payment.upiApp = input.upiApp ?? undefined;
  }

  if (input.transactionReference !== undefined) {
    payment.transactionReference = input.transactionReference ?? undefined;
  }

  if (input.relatedContractId !== undefined) {
    if (input.relatedContractId === null) {
      payment.relatedContractId = undefined;
    } else {
      validateOptionalObjectId(input.relatedContractId, "Related contract");

      payment.relatedContractId = toObjectId(input.relatedContractId);
    }
  }

  if (input.relatedSupplierAgreementId !== undefined) {
    if (input.relatedSupplierAgreementId === null) {
      payment.relatedSupplierAgreementId = undefined;
    } else {
      validateOptionalObjectId(
        input.relatedSupplierAgreementId,
        "Related supplier agreement",
      );

      payment.relatedSupplierAgreementId = toObjectId(
        input.relatedSupplierAgreementId,
      );
    }
  }

  if (input.receiptId !== undefined) {
    if (input.receiptId === null) {
      payment.receiptId = undefined;
    } else {
      validateOptionalObjectId(input.receiptId, "Receipt");

      payment.receiptId = toObjectId(input.receiptId);
    }
  }

  if (input.notes !== undefined) {
    payment.notes = input.notes ?? undefined;
  }

  if (input.verificationStatus !== undefined) {
    payment.verificationStatus = input.verificationStatus;
  }

  validatePaymentRules({
    paymentType: payment.paymentType,
    method: payment.method,
    upiApp: payment.upiApp,
    transactionReference: payment.transactionReference,
    paidToVendorId: payment.paidToVendorId?.toString(),
    relatedContractId: payment.relatedContractId?.toString(),
  });

  await payment.save();

  return serializePayment(payment);
};

/**
 * ============================================================
 * SOFT DELETE PAYMENT
 * ============================================================
 */
export const deletePayment = async (paymentId: string) => {
  const id = toObjectId(paymentId);

  const payment = await Payment.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!payment) {
    throw new ApiError(404, "Payment not found", "PAYMENT_NOT_FOUND");
  }

  payment.isDeleted = true;

  await payment.save();

  return serializePayment(payment);
};

/**
 * ============================================================
 * RESTORE PAYMENT
 * ============================================================
 */
export const restorePayment = async (paymentId: string) => {
  const id = toObjectId(paymentId);

  const payment = await Payment.findOne({
    _id: id,
    isDeleted: true,
  });

  if (!payment) {
    throw new ApiError(404, "Deleted payment not found", "PAYMENT_NOT_FOUND");
  }

  const activePaymentWithSameNumber = await Payment.findOne({
    paymentNo: payment.paymentNo,
    isDeleted: false,
    _id: { $ne: id },
  });

  if (activePaymentWithSameNumber) {
    throw new ApiError(
      409,
      "Another active payment already uses this payment number",
      "PAYMENT_NUMBER_CONFLICT",
    );
  }

  payment.isDeleted = false;

  await payment.save();

  return serializePayment(payment);
};

/**
 * ============================================================
 * VERIFY PAYMENT
 * ============================================================
 */
export const verifyPayment = async (paymentId: string) => {
  const id = toObjectId(paymentId);

  const payment = await Payment.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!payment) {
    throw new ApiError(404, "Payment not found", "PAYMENT_NOT_FOUND");
  }

  payment.verificationStatus = PAYMENT_VERIFICATION_STATUS.VERIFIED;

  await payment.save();

  return serializePayment(payment);
};
