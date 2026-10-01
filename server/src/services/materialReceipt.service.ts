import { Types } from "mongoose";

import {
  MaterialReceipt,
  MATERIAL_RECEIPT_VERIFICATION_STATUS,
  type MaterialReceiptVerificationStatus,
  type IMaterialReceipt,
} from "../models/MaterialReceipt";
import { Material } from "../models/Material";
import { Vendor } from "../models/Vendor";
import { ConstructionStage } from "../models/ConstructionStage";
import { Counter } from "../models/Counter";
import { ApiError } from "../utils/ApiError";

const MAX_LIMIT = 100;

const MATERIAL_RECEIPT_COUNTER_KEY = "MATERIAL_RECEIPT";

interface CreateMaterialReceiptInput {
  vendorId: string;
  materialId: string;
  stageId: string;
  date: Date | string;
  quantity: number;
  unit: IMaterialReceipt["unit"];
  unitPrice: number;
  receiptId?: string;
  agreementId?: string;
  notes?: string;
  verificationStatus?: MaterialReceiptVerificationStatus;
}

interface UpdateMaterialReceiptInput {
  vendorId?: string;
  materialId?: string;
  stageId?: string;
  date?: Date | string;
  quantity?: number;
  unit?: IMaterialReceipt["unit"];
  unitPrice?: number;
  receiptId?: string | null;
  agreementId?: string | null;
  notes?: string | null;
  verificationStatus?: MaterialReceiptVerificationStatus;
}

interface ListMaterialReceiptsInput {
  page?: number;
  limit?: number;
  q?: string;
  vendorId?: string;
  materialId?: string;
  stageId?: string;
  verificationStatus?: MaterialReceiptVerificationStatus;
  fromDate?: string;
  toDate?: string;
  includeDeleted?: boolean;
}

const assertObjectId = (value: string, fieldName: string): Types.ObjectId => {
  if (!Types.ObjectId.isValid(value)) {
    throw new ApiError(422, `Invalid ${fieldName}`, "INVALID_OBJECT_ID");
  }

  return new Types.ObjectId(value);
};

const rupeesToPaise = (rupees: number): number => {
  if (!Number.isFinite(rupees) || rupees < 0) {
    throw new ApiError(
      422,
      "Unit price must be a valid non-negative amount",
      "INVALID_AMOUNT",
    );
  }

  const paise = Math.round(rupees * 100);

  if (!Number.isSafeInteger(paise)) {
    throw new ApiError(422, "Unit price is too large", "AMOUNT_TOO_LARGE");
  }

  return paise;
};

const paiseToRupees = (paise: number): number => {
  return paise / 100;
};

const calculateTotalPaise = (
  quantity: number,
  unitPricePaise: number,
): number => {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new ApiError(
      422,
      "Quantity must be greater than zero",
      "INVALID_QUANTITY",
    );
  }

  if (!Number.isSafeInteger(unitPricePaise) || unitPricePaise < 0) {
    throw new ApiError(422, "Unit price is invalid", "INVALID_AMOUNT");
  }

  const total = Math.round(quantity * unitPricePaise);

  if (!Number.isSafeInteger(total)) {
    throw new ApiError(
      422,
      "Calculated total amount is too large",
      "AMOUNT_TOO_LARGE",
    );
  }

  return total;
};

const parseDate = (value: Date | string, fieldName: string): Date => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new ApiError(
      422,
      `${fieldName} must be a valid date`,
      "INVALID_DATE",
    );
  }

  return date;
};

const getActiveVendor = async (vendorId: Types.ObjectId) => {
  const vendor = await Vendor.findOne({
    _id: vendorId,
    isDeleted: false,
    status: "ACTIVE",
  });

  if (!vendor) {
    throw new ApiError(404, "Active vendor not found", "VENDOR_NOT_FOUND");
  }

  return vendor;
};

const getActiveMaterial = async (materialId: Types.ObjectId) => {
  const material = await Material.findOne({
    _id: materialId,
    isDeleted: false,
  });

  if (!material) {
    throw new ApiError(404, "Active material not found", "MATERIAL_NOT_FOUND");
  }

  return material;
};

const getActiveStage = async (stageId: Types.ObjectId) => {
  const stage = await ConstructionStage.findOne({
    _id: stageId,
    isDeleted: false,
  });

  if (!stage) {
    throw new ApiError(
      404,
      "Active construction stage not found",
      "STAGE_NOT_FOUND",
    );
  }

  return stage;
};

/**
 * Generates the next material receipt number atomically.
 *
 * Examples:
 * MR-0001
 * MR-0002
 * MR-0003
 */
const generateMaterialReceiptNumber = async (): Promise<string> => {
  const counter = await Counter.findOneAndUpdate(
    {
      key: MATERIAL_RECEIPT_COUNTER_KEY,
    },
    {
      $inc: {
        sequence: 1,
      },
      $setOnInsert: {
        key: MATERIAL_RECEIPT_COUNTER_KEY,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  if (!counter) {
    throw new ApiError(
      500,
      "Unable to generate material receipt number",
      "COUNTER_GENERATION_FAILED",
    );
  }

  return `MR-${String(counter.sequence).padStart(4, "0")}`;
};

const serializeMaterialReceipt = (receipt: IMaterialReceipt) => {
  return {
    id: receipt._id.toString(),

    receiptNo: receipt.receiptNo,

    vendorId: receipt.vendorId.toString(),

    materialId: receipt.materialId.toString(),

    stageId: receipt.stageId.toString(),

    date: receipt.date,

    quantity: receipt.quantity,

    unit: receipt.unit,

    // API exposes money in rupees.
    unitPrice: paiseToRupees(receipt.unitPricePaise),

    totalAmount: paiseToRupees(receipt.totalAmountPaise),

    receiptId: receipt.receiptId ? receipt.receiptId.toString() : null,

    agreementId: receipt.agreementId ? receipt.agreementId.toString() : null,

    notes: receipt.notes ?? null,

    verificationStatus: receipt.verificationStatus,

    createdBy: receipt.createdBy.toString(),

    isDeleted: receipt.isDeleted,

    createdAt: receipt.createdAt,

    updatedAt: receipt.updatedAt,
  };
};

export const createMaterialReceipt = async (
  input: CreateMaterialReceiptInput,
  createdBy: Types.ObjectId,
) => {
  const vendorId = assertObjectId(input.vendorId, "Vendor ID");

  const materialId = assertObjectId(input.materialId, "Material ID");

  const stageId = assertObjectId(input.stageId, "Stage ID");

  const date = parseDate(input.date, "Material receipt date");

  const quantity = input.quantity;

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new ApiError(
      422,
      "Quantity must be greater than zero",
      "INVALID_QUANTITY",
    );
  }

  const unitPricePaise = rupeesToPaise(input.unitPrice);

  const totalAmountPaise = calculateTotalPaise(quantity, unitPricePaise);

  await Promise.all([
    getActiveVendor(vendorId),
    getActiveMaterial(materialId),
    getActiveStage(stageId),
  ]);

  const receiptNo = await generateMaterialReceiptNumber();

  const materialReceipt = await MaterialReceipt.create({
    receiptNo,

    vendorId,

    materialId,

    stageId,

    date,

    quantity,

    unit: input.unit,

    unitPricePaise,

    totalAmountPaise,

    receiptId: input.receiptId
      ? assertObjectId(input.receiptId, "Receipt ID")
      : undefined,

    agreementId: input.agreementId
      ? assertObjectId(input.agreementId, "Agreement ID")
      : undefined,

    notes: input.notes?.trim() || undefined,

    verificationStatus:
      input.verificationStatus ??
      MATERIAL_RECEIPT_VERIFICATION_STATUS.NEEDS_VERIFICATION,

    createdBy,

    isDeleted: false,
  });

  return serializeMaterialReceipt(materialReceipt);
};

export const listMaterialReceipts = async (
  input: ListMaterialReceiptsInput,
) => {
  const page = Math.max(1, input.page ?? 1);

  const limit = Math.min(MAX_LIMIT, Math.max(1, input.limit ?? 20));

  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (!input.includeDeleted) {
    filter.isDeleted = false;
  }

  if (input.q) {
    const search = input.q.trim();

    filter.receiptNo = {
      $regex: search,
      $options: "i",
    };
  }

  if (input.vendorId) {
    filter.vendorId = assertObjectId(input.vendorId, "Vendor ID");
  }

  if (input.materialId) {
    filter.materialId = assertObjectId(input.materialId, "Material ID");
  }

  if (input.stageId) {
    filter.stageId = assertObjectId(input.stageId, "Stage ID");
  }

  if (input.verificationStatus) {
    filter.verificationStatus = input.verificationStatus;
  }

  if (input.fromDate || input.toDate) {
    const dateFilter: Record<string, Date> = {};

    if (input.fromDate) {
      const fromDate = parseDate(input.fromDate, "From date");

      fromDate.setHours(0, 0, 0, 0);

      dateFilter.$gte = fromDate;
    }

    if (input.toDate) {
      const toDate = parseDate(input.toDate, "To date");

      toDate.setHours(23, 59, 59, 999);

      dateFilter.$lte = toDate;
    }

    if (
      dateFilter.$gte &&
      dateFilter.$lte &&
      dateFilter.$gte > dateFilter.$lte
    ) {
      throw new ApiError(
        422,
        "From date cannot be after To date",
        "INVALID_DATE_RANGE",
      );
    }

    filter.date = dateFilter;
  }

  const [items, total] = await Promise.all([
    MaterialReceipt.find(filter)
      .sort({
        date: -1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),

    MaterialReceipt.countDocuments(filter),
  ]);

  return {
    items: items.map(serializeMaterialReceipt),

    pagination: {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};

export const getMaterialReceiptById = async (
  materialReceiptId: string,
  includeDeleted = false,
) => {
  const id = assertObjectId(materialReceiptId, "Material receipt ID");

  const filter: Record<string, unknown> = {
    _id: id,
  };

  if (!includeDeleted) {
    filter.isDeleted = false;
  }

  const receipt = await MaterialReceipt.findOne(filter);

  if (!receipt) {
    throw new ApiError(
      404,
      "Material receipt not found",
      "MATERIAL_RECEIPT_NOT_FOUND",
    );
  }

  return serializeMaterialReceipt(receipt);
};

export const updateMaterialReceipt = async (
  materialReceiptId: string,
  input: UpdateMaterialReceiptInput,
) => {
  const id = assertObjectId(materialReceiptId, "Material receipt ID");

  const materialReceipt = await MaterialReceipt.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!materialReceipt) {
    throw new ApiError(
      404,
      "Material receipt not found",
      "MATERIAL_RECEIPT_NOT_FOUND",
    );
  }

  let vendorId = materialReceipt.vendorId;

  let materialId = materialReceipt.materialId;

  let stageId = materialReceipt.stageId;

  let date = materialReceipt.date;

  let quantity = materialReceipt.quantity;

  let unitPricePaise = materialReceipt.unitPricePaise;

  if (input.vendorId !== undefined) {
    vendorId = assertObjectId(input.vendorId, "Vendor ID");
  }

  if (input.materialId !== undefined) {
    materialId = assertObjectId(input.materialId, "Material ID");
  }

  if (input.stageId !== undefined) {
    stageId = assertObjectId(input.stageId, "Stage ID");
  }

  if (input.date !== undefined) {
    date = parseDate(input.date, "Material receipt date");
  }

  if (input.quantity !== undefined) {
    if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
      throw new ApiError(
        422,
        "Quantity must be greater than zero",
        "INVALID_QUANTITY",
      );
    }

    quantity = input.quantity;
  }

  if (input.unitPrice !== undefined) {
    unitPricePaise = rupeesToPaise(input.unitPrice);
  }

  const referencesChanged =
    input.vendorId !== undefined ||
    input.materialId !== undefined ||
    input.stageId !== undefined;

  if (referencesChanged) {
    await Promise.all([
      getActiveVendor(vendorId),
      getActiveMaterial(materialId),
      getActiveStage(stageId),
    ]);
  }

  const totalAmountPaise = calculateTotalPaise(quantity, unitPricePaise);

  materialReceipt.vendorId = vendorId;

  materialReceipt.materialId = materialId;

  materialReceipt.stageId = stageId;

  materialReceipt.date = date;

  materialReceipt.quantity = quantity;

  if (input.unit !== undefined) {
    materialReceipt.unit = input.unit;
  }

  materialReceipt.unitPricePaise = unitPricePaise;

  materialReceipt.totalAmountPaise = totalAmountPaise;

  if (input.receiptId !== undefined) {
    if (input.receiptId === null || input.receiptId.trim() === "") {
      materialReceipt.receiptId = undefined;
    } else {
      materialReceipt.receiptId = assertObjectId(input.receiptId, "Receipt ID");
    }
  }

  if (input.agreementId !== undefined) {
    if (input.agreementId === null || input.agreementId.trim() === "") {
      materialReceipt.agreementId = undefined;
    } else {
      materialReceipt.agreementId = assertObjectId(
        input.agreementId,
        "Agreement ID",
      );
    }
  }

  if (input.notes !== undefined) {
    materialReceipt.notes = input.notes?.trim() || undefined;
  }

  if (input.verificationStatus !== undefined) {
    materialReceipt.verificationStatus = input.verificationStatus;
  }

  await materialReceipt.save();

  return serializeMaterialReceipt(materialReceipt);
};

export const deleteMaterialReceipt = async (materialReceiptId: string) => {
  const id = assertObjectId(materialReceiptId, "Material receipt ID");

  const materialReceipt = await MaterialReceipt.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!materialReceipt) {
    throw new ApiError(
      404,
      "Material receipt not found",
      "MATERIAL_RECEIPT_NOT_FOUND",
    );
  }

  materialReceipt.isDeleted = true;

  await materialReceipt.save();

  return serializeMaterialReceipt(materialReceipt);
};

export const restoreMaterialReceipt = async (materialReceiptId: string) => {
  const id = assertObjectId(materialReceiptId, "Material receipt ID");

  const materialReceipt = await MaterialReceipt.findOne({
    _id: id,
    isDeleted: true,
  });

  if (!materialReceipt) {
    throw new ApiError(
      404,
      "Deleted material receipt not found",
      "MATERIAL_RECEIPT_NOT_FOUND",
    );
  }

  const conflictingReceipt = await MaterialReceipt.findOne({
    _id: {
      $ne: id,
    },
    receiptNo: materialReceipt.receiptNo,
    isDeleted: false,
  });

  if (conflictingReceipt) {
    throw new ApiError(
      409,
      `Cannot restore material receipt because receipt number ${materialReceipt.receiptNo} is already in use`,
      "RECEIPT_NUMBER_CONFLICT",
    );
  }

  materialReceipt.isDeleted = false;

  await materialReceipt.save();

  return serializeMaterialReceipt(materialReceipt);
};

export const verifyMaterialReceipt = async (materialReceiptId: string) => {
  const id = assertObjectId(materialReceiptId, "Material receipt ID");

  const materialReceipt = await MaterialReceipt.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!materialReceipt) {
    throw new ApiError(
      404,
      "Material receipt not found",
      "MATERIAL_RECEIPT_NOT_FOUND",
    );
  }

  materialReceipt.verificationStatus =
    MATERIAL_RECEIPT_VERIFICATION_STATUS.VERIFIED;

  await materialReceipt.save();

  return serializeMaterialReceipt(materialReceipt);
};
