import { Types } from "mongoose";
import { SupplierAgreement } from "../models/SupplierAgreement";
import { Vendor } from "../models/Vendor";
import { Material } from "../models/Material";
import { Payment } from "../models/Payment";
import { MaterialReceipt } from "../models/MaterialReceipt";
import { ApiError } from "../utils/ApiError";
import { VENDOR_STATUS, VENDOR_TYPE } from "../constants/vendor";
import { PAYMENT_TYPE } from "../constants/payment";
import type {
  SupplierAgreementStatus,
} from "../constants/supplierAgreement";

interface CreateSupplierAgreementInput {
  vendorId: string;
  materialIds: string[];
  advanceAmount: number;
  startDate: Date;
  status: SupplierAgreementStatus;
  notes?: string;
}

interface UpdateSupplierAgreementInput {
  vendorId?: string;
  materialIds?: string[];
  advanceAmount?: number;
  startDate?: Date;
  status?: SupplierAgreementStatus;
  notes?: string | null;
}

interface ListSupplierAgreementsInput {
  page: number;
  limit: number;
  vendorId?: string;
  status?: SupplierAgreementStatus;
  fromDate?: Date;
  toDate?: Date;
  q?: string;
  includeDeleted?: boolean;
}

const rupeesToPaise = (amount: number): number =>
  Math.round(amount * 100);

const paiseToRupees = (amount: number): number =>
  amount / 100;

const serializeAgreement = (agreement: any) => ({
  id: agreement._id.toString(),
  vendorId: agreement.vendorId.toString(),
  materialIds: agreement.materialIds.map((id: Types.ObjectId) =>
    id.toString(),
  ),
  advanceAmount: paiseToRupees(agreement.advanceAmountPaise),
  startDate: agreement.startDate,
  status: agreement.status,
  notes: agreement.notes,
  createdBy: agreement.createdBy.toString(),
  isDeleted: agreement.isDeleted,
  createdAt: agreement.createdAt,
  updatedAt: agreement.updatedAt,
});

const validateSupplierVendor = async (vendorId: string) => {
  const vendor = await Vendor.findOne({
    _id: vendorId,
    isDeleted: false,
  });

  if (!vendor) {
    throw new ApiError(
      404,
      "Supplier vendor was not found",
      "SUPPLIER_NOT_FOUND",
    );
  }

  if (vendor.status !== VENDOR_STATUS.ACTIVE) {
    throw new ApiError(
      409,
      "Supplier vendor is not active",
      "SUPPLIER_INACTIVE",
    );
  }

  if (vendor.type !== VENDOR_TYPE.MATERIAL_SUPPLIER) {
    throw new ApiError(
      422,
      "Selected vendor is not a material supplier",
      "INVALID_SUPPLIER_TYPE",
    );
  }

  return vendor;
};

const validateMaterials = async (materialIds: string[]) => {
  const uniqueIds = [...new Set(materialIds)];

  if (uniqueIds.length !== materialIds.length) {
    throw new ApiError(
      422,
      "Duplicate materials are not allowed",
      "DUPLICATE_MATERIALS",
    );
  }

  const materials = await Material.find({
    _id: { $in: uniqueIds },
    isDeleted: false,
  });

  if (materials.length !== uniqueIds.length) {
    throw new ApiError(
      404,
      "One or more materials were not found or are inactive",
      "MATERIALS_NOT_FOUND",
    );
  }

  return materials;
};

export const createSupplierAgreement = async (
  input: CreateSupplierAgreementInput,
  createdBy: string,
) => {
  await validateSupplierVendor(input.vendorId);

  await validateMaterials(input.materialIds);

  const agreement = await SupplierAgreement.create({
    vendorId: new Types.ObjectId(input.vendorId),
    materialIds: input.materialIds.map(
      (id) => new Types.ObjectId(id),
    ),
    advanceAmountPaise: rupeesToPaise(input.advanceAmount),
    startDate: input.startDate,
    status: input.status,
    notes: input.notes,
    createdBy: new Types.ObjectId(createdBy),
    isDeleted: false,
  });

  return serializeAgreement(agreement);
};

export const listSupplierAgreements = async (
  input: ListSupplierAgreementsInput,
) => {
  const query: Record<string, unknown> = {
    isDeleted: input.includeDeleted === true ? undefined : false,
  };

  if (input.includeDeleted !== true) {
    query.isDeleted = false;
  } else {
    delete query.isDeleted;
  }

  if (input.vendorId) {
    query.vendorId = new Types.ObjectId(input.vendorId);
  }

  if (input.status) {
    query.status = input.status;
  }

  if (input.fromDate || input.toDate) {
    const dateFilter: Record<string, Date> = {};

    if (input.fromDate) {
      dateFilter.$gte = input.fromDate;
    }

    if (input.toDate) {
      dateFilter.$lte = input.toDate;
    }

    query.startDate = dateFilter;
  }

  if (input.q) {
    query.notes = {
      $regex: input.q,
      $options: "i",
    };
  }

  const skip = (input.page - 1) * input.limit;

  const [agreements, total] = await Promise.all([
    SupplierAgreement.find(query)
      .sort({ startDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(input.limit),

    SupplierAgreement.countDocuments(query),
  ]);

  return {
    items: agreements.map(serializeAgreement),
    pagination: {
      page: input.page,
      limit: input.limit,
      total,
      pages: Math.ceil(total / input.limit),
    },
  };
};

export const getSupplierAgreementById = async (
  agreementId: string,
  includeDeleted = false,
) => {
  const query: Record<string, unknown> = {
    _id: agreementId,
  };

  if (!includeDeleted) {
    query.isDeleted = false;
  }

  const agreement = await SupplierAgreement.findOne(query);

  if (!agreement) {
    throw new ApiError(
      404,
      "Supplier agreement was not found",
      "SUPPLIER_AGREEMENT_NOT_FOUND",
    );
  }

  return serializeAgreement(agreement);
};

export const updateSupplierAgreement = async (
  agreementId: string,
  input: UpdateSupplierAgreementInput,
) => {
  const agreement = await SupplierAgreement.findOne({
    _id: agreementId,
    isDeleted: false,
  });

  if (!agreement) {
    throw new ApiError(
      404,
      "Supplier agreement was not found",
      "SUPPLIER_AGREEMENT_NOT_FOUND",
    );
  }

  if (input.vendorId) {
    await validateSupplierVendor(input.vendorId);

    agreement.vendorId = new Types.ObjectId(input.vendorId);
  }

  if (input.materialIds) {
    await validateMaterials(input.materialIds);

    agreement.materialIds = input.materialIds.map(
      (id) => new Types.ObjectId(id),
    );
  }

  if (input.advanceAmount !== undefined) {
    agreement.advanceAmountPaise = rupeesToPaise(
      input.advanceAmount,
    );
  }

  if (input.startDate !== undefined) {
    agreement.startDate = input.startDate;
  }

  if (input.status !== undefined) {
    agreement.status = input.status;
  }

  if (input.notes !== undefined) {
    agreement.notes = input.notes ?? undefined;
  }

  await agreement.save();

  return serializeAgreement(agreement);
};

export const deleteSupplierAgreement = async (
  agreementId: string,
) => {
  const agreement = await SupplierAgreement.findOne({
    _id: agreementId,
    isDeleted: false,
  });

  if (!agreement) {
    throw new ApiError(
      404,
      "Supplier agreement was not found",
      "SUPPLIER_AGREEMENT_NOT_FOUND",
    );
  }

  agreement.isDeleted = true;

  await agreement.save();

  return {
    id: agreement._id.toString(),
    isDeleted: true,
  };
};

export const restoreSupplierAgreement = async (
  agreementId: string,
) => {
  const agreement = await SupplierAgreement.findOne({
    _id: agreementId,
    isDeleted: true,
  });

  if (!agreement) {
    throw new ApiError(
      404,
      "Deleted supplier agreement was not found",
      "DELETED_SUPPLIER_AGREEMENT_NOT_FOUND",
    );
  }

  agreement.isDeleted = false;

  await agreement.save();

  return serializeAgreement(agreement);
};

export const getSupplierAgreementSummary = async (
  agreementId: string,
) => {
  const agreement = await SupplierAgreement.findOne({
    _id: agreementId,
    isDeleted: false,
  });

  if (!agreement) {
    throw new ApiError(
      404,
      "Supplier agreement was not found",
      "SUPPLIER_AGREEMENT_NOT_FOUND",
    );
  }

  const agreementObjectId = agreement._id;

  const [paymentAggregation, receiptAggregation] =
    await Promise.all([
      Payment.aggregate([
        {
          $match: {
            relatedSupplierAgreementId: agreementObjectId,
            isDeleted: false,
            paymentType: PAYMENT_TYPE.ADVANCE,
          },
        },
        {
          $group: {
            _id: null,
            totalPaidPaise: {
              $sum: "$amountPaise",
            },
            paymentCount: {
              $sum: 1,
            },
          },
        },
      ]),

      MaterialReceipt.aggregate([
        {
          $match: {
            agreementId: agreementObjectId,
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: null,
            totalMaterialValuePaise: {
              $sum: "$totalAmountPaise",
            },
            receiptCount: {
              $sum: 1,
            },
          },
        },
      ]),
    ]);

  const totalPaidPaise =
    paymentAggregation[0]?.totalPaidPaise ?? 0;

  const totalMaterialValuePaise =
    receiptAggregation[0]?.totalMaterialValuePaise ?? 0;

  /*
   * Supplier ledger rule from the documentation:
   *
   * Supplier balance =
   * Payments to supplier - Material received
   *
   * Positive  -> unused supplier advance
   * Negative  -> amount owed to supplier
   */
  const balancePaise =
    totalPaidPaise - totalMaterialValuePaise;

  return {
    agreement: serializeAgreement(agreement),

    financials: {
      agreementAdvanceAmount: paiseToRupees(
        agreement.advanceAmountPaise,
      ),

      totalPaid: paiseToRupees(totalPaidPaise),

      totalMaterialReceived: paiseToRupees(
        totalMaterialValuePaise,
      ),

      balance: paiseToRupees(balancePaise),

      balanceType:
        balancePaise > 0
          ? "UNUSED_ADVANCE"
          : balancePaise < 0
            ? "AMOUNT_OWED_TO_SUPPLIER"
            : "SETTLED",
    },

    counts: {
      paymentCount:
        paymentAggregation[0]?.paymentCount ?? 0,

      materialReceiptCount:
        receiptAggregation[0]?.receiptCount ?? 0,
    },
  };
};