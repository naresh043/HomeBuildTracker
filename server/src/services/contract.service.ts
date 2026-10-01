import { Types } from "mongoose";
import { Contract, type IContract } from "../models/Contract";
import { Vendor } from "../models/Vendor";
import { Payment } from "../models/Payment";
import { CONTRACT_RATE_UNIT, CONTRACT_STATUS } from "../constants/contract";
import { PAYMENT_TYPE } from "../constants/payment";
import { ApiError } from "../utils/ApiError";

const RUPEE_TO_PAISE = 100;

const toPaise = (amount: number): number => {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new ApiError(
      422,
      "Amount must be a valid non-negative number",
      "INVALID_AMOUNT",
    );
  }

  return Math.round(amount * RUPEE_TO_PAISE);
};

const toRupees = (amountPaise: number): number => {
  return amountPaise / RUPEE_TO_PAISE;
};

const serializeContract = (contract: IContract) => {
  return {
    id: contract._id.toString(),

    vendorId: contract.vendorId.toString(),

    contractType: contract.contractType,

    rate: toRupees(contract.ratePaise),

    rateUnit: contract.rateUnit,

    measurement: contract.measurement ?? null,

    estimatedAmount: toRupees(contract.estimatedAmountPaise),

    advanceAmount: toRupees(contract.advanceAmountPaise),

    scopeIncluded: contract.scopeIncluded,

    scopeExcluded: contract.scopeExcluded,

    startDate: contract.startDate,

    status: contract.status,

    notes: contract.notes ?? null,

    createdBy: contract.createdBy.toString(),

    isDeleted: contract.isDeleted,

    createdAt: contract.createdAt,

    updatedAt: contract.updatedAt,
  };
};

const calculateEstimatedAmountPaise = (
  ratePaise: number,
  rateUnit: string,
  measurement?: number,
): number => {
  if (rateUnit === CONTRACT_RATE_UNIT.LUMP_SUM) {
    return ratePaise;
  }

  if (measurement === undefined || measurement <= 0) {
    throw new ApiError(
      422,
      "Measurement is required for this contract rate unit",
      "MEASUREMENT_REQUIRED",
    );
  }

  return Math.round(ratePaise * measurement);
};

const validateVendor = async (vendorId: string) => {
  if (!Types.ObjectId.isValid(vendorId)) {
    throw new ApiError(422, "Invalid vendor ID", "INVALID_VENDOR_ID");
  }

  const vendor = await Vendor.findOne({
    _id: vendorId,
    isDeleted: false,
    status: "ACTIVE",
  });

  if (!vendor) {
    throw new ApiError(404, "Active vendor was not found", "VENDOR_NOT_FOUND");
  }

  return vendor;
};

const validateDateRange = (fromDate?: Date, toDate?: Date) => {
  if (fromDate && toDate && fromDate > toDate) {
    throw new ApiError(
      422,
      "fromDate cannot be later than toDate",
      "INVALID_DATE_RANGE",
    );
  }
};

export const createContract = async (
  input: {
    vendorId: string;
    contractType: IContract["contractType"];
    rate: number;
    rateUnit: IContract["rateUnit"];
    measurement?: number;
    advanceAmount?: number;
    scopeIncluded?: string[];
    scopeExcluded?: string[];
    startDate: Date;
    status?: IContract["status"];
    notes?: string;
  },
  createdBy: string,
) => {
  await validateVendor(input.vendorId);

  const ratePaise = toPaise(input.rate);

  const estimatedAmountPaise = calculateEstimatedAmountPaise(
    ratePaise,
    input.rateUnit,
    input.measurement,
  );

  const advanceAmountPaise = toPaise(input.advanceAmount ?? 0);

  if (advanceAmountPaise > estimatedAmountPaise) {
    throw new ApiError(
      422,
      "Advance amount cannot exceed the estimated contract amount",
      "ADVANCE_EXCEEDS_CONTRACT_VALUE",
    );
  }

  const contract = await Contract.create({
    vendorId: input.vendorId,

    contractType: input.contractType,

    ratePaise,

    rateUnit: input.rateUnit,

    measurement: input.measurement,

    estimatedAmountPaise,

    advanceAmountPaise,

    scopeIncluded: input.scopeIncluded ?? [],

    scopeExcluded: input.scopeExcluded ?? [],

    startDate: input.startDate,

    status: input.status ?? CONTRACT_STATUS.DRAFT,

    notes: input.notes,

    createdBy,

    isDeleted: false,
  });

  return serializeContract(contract);
};

export const listContracts = async (filters: {
  page?: number;
  limit?: number;
  q?: string;
  vendorId?: string;
  contractType?: IContract["contractType"];
  rateUnit?: IContract["rateUnit"];
  status?: IContract["status"];
  fromDate?: Date;
  toDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  includeDeleted?: boolean;
}) => {
  validateDateRange(filters.fromDate, filters.toDate);

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;

  const query: Record<string, unknown> = {};

  if (!filters.includeDeleted) {
    query.isDeleted = false;
  }

  if (filters.vendorId) {
    query.vendorId = filters.vendorId;
  }

  if (filters.contractType) {
    query.contractType = filters.contractType;
  }

  if (filters.rateUnit) {
    query.rateUnit = filters.rateUnit;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.fromDate || filters.toDate) {
    query.startDate = {};

    if (filters.fromDate) {
      (query.startDate as Record<string, Date>).$gte = filters.fromDate;
    }

    if (filters.toDate) {
      (query.startDate as Record<string, Date>).$lte = filters.toDate;
    }
  }

  if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
    query.estimatedAmountPaise = {};

    if (filters.minAmount !== undefined) {
      (query.estimatedAmountPaise as Record<string, number>).$gte = toPaise(
        filters.minAmount,
      );
    }

    if (filters.maxAmount !== undefined) {
      (query.estimatedAmountPaise as Record<string, number>).$lte = toPaise(
        filters.maxAmount,
      );
    }
  }

  if (filters.q) {
    const escaped = filters.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const regex = new RegExp(escaped, "i");

    query.$or = [
      { notes: regex },
      { scopeIncluded: regex },
      { scopeExcluded: regex },
    ];
  }

  const [contracts, total] = await Promise.all([
    Contract.find(query)
      .sort({
        startDate: -1,
        createdAt: -1,
      })
      .skip((page - 1) * limit)
      .limit(limit),

    Contract.countDocuments(query),
  ]);

  return {
    items: contracts.map(serializeContract),

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

export const getContract = async (
  contractId: string,
  includeDeleted = false,
) => {
  if (!Types.ObjectId.isValid(contractId)) {
    throw new ApiError(422, "Invalid contract ID", "INVALID_CONTRACT_ID");
  }

  const query: Record<string, unknown> = {
    _id: contractId,
  };

  if (!includeDeleted) {
    query.isDeleted = false;
  }

  const contract = await Contract.findOne(query);

  if (!contract) {
    throw new ApiError(404, "Contract was not found", "CONTRACT_NOT_FOUND");
  }

  return serializeContract(contract);
};

export const updateContract = async (
  contractId: string,
  input: Partial<{
    vendorId: string;
    contractType: IContract["contractType"];
    rate: number;
    rateUnit: IContract["rateUnit"];
    measurement: number | null;
    advanceAmount: number;
    scopeIncluded: string[];
    scopeExcluded: string[];
    startDate: Date;
    status: IContract["status"];
    notes: string | null;
  }>,
) => {
  const contract = await Contract.findOne({
    _id: contractId,
    isDeleted: false,
  });

  if (!contract) {
    throw new ApiError(404, "Contract was not found", "CONTRACT_NOT_FOUND");
  }

  if (input.vendorId) {
    await validateVendor(input.vendorId);
    contract.vendorId = new Types.ObjectId(input.vendorId);
  }

  if (input.contractType !== undefined) {
    contract.contractType = input.contractType;
  }

  if (input.rate !== undefined) {
    contract.ratePaise = toPaise(input.rate);
  }

  if (input.rateUnit !== undefined) {
    contract.rateUnit = input.rateUnit;
  }

  if (input.measurement !== undefined) {
    contract.measurement =
      input.measurement === null ? undefined : input.measurement;
  }

  if (input.advanceAmount !== undefined) {
    contract.advanceAmountPaise = toPaise(input.advanceAmount);
  }

  if (input.scopeIncluded !== undefined) {
    contract.scopeIncluded = input.scopeIncluded;
  }

  if (input.scopeExcluded !== undefined) {
    contract.scopeExcluded = input.scopeExcluded;
  }

  if (input.startDate !== undefined) {
    contract.startDate = input.startDate;
  }

  if (input.status !== undefined) {
    contract.status = input.status;
  }

  if (input.notes !== undefined) {
    contract.notes = input.notes === null ? undefined : input.notes;
  }

  if (contract.rateUnit === CONTRACT_RATE_UNIT.LUMP_SUM) {
    contract.measurement = undefined;
  }

  contract.estimatedAmountPaise = calculateEstimatedAmountPaise(
    contract.ratePaise,
    contract.rateUnit,
    contract.measurement,
  );

  if (contract.advanceAmountPaise > contract.estimatedAmountPaise) {
    throw new ApiError(
      422,
      "Advance amount cannot exceed the estimated contract amount",
      "ADVANCE_EXCEEDS_CONTRACT_VALUE",
    );
  }

  await contract.save();

  return serializeContract(contract);
};

export const deleteContract = async (contractId: string) => {
  const contract = await Contract.findOne({
    _id: contractId,
    isDeleted: false,
  });

  if (!contract) {
    throw new ApiError(404, "Contract was not found", "CONTRACT_NOT_FOUND");
  }

  contract.isDeleted = true;

  await contract.save();

  return serializeContract(contract);
};

export const restoreContract = async (contractId: string) => {
  const contract = await Contract.findOne({
    _id: contractId,
    isDeleted: true,
  });

  if (!contract) {
    throw new ApiError(
      404,
      "Deleted contract was not found",
      "CONTRACT_NOT_FOUND",
    );
  }

  contract.isDeleted = false;

  await contract.save();

  return serializeContract(contract);
};

export const getContractSummary = async (contractId: string) => {
  if (!Types.ObjectId.isValid(contractId)) {
    throw new ApiError(422, "Invalid contract ID", "INVALID_CONTRACT_ID");
  }

  const contract = await Contract.findOne({
    _id: contractId,
    isDeleted: false,
  });

  if (!contract) {
    throw new ApiError(404, "Contract was not found", "CONTRACT_NOT_FOUND");
  }

  const payments = await Payment.find({
    relatedContractId: contract._id,
    paymentType: PAYMENT_TYPE.CONTRACT_PAYMENT,
    isDeleted: false,
  }).sort({
    date: 1,
    createdAt: 1,
  });

  const totalPaidPaise = payments.reduce(
    (sum, payment) => sum + payment.amountPaise,
    0,
  );

  const remainingBalancePaise = Math.max(
    contract.estimatedAmountPaise - totalPaidPaise,
    0,
  );

  return {
    contract: serializeContract(contract),

    financials: {
      contractValue: toRupees(contract.estimatedAmountPaise),

      advanceAmount: toRupees(contract.advanceAmountPaise),

      totalPaid: toRupees(totalPaidPaise),

      remainingBalance: toRupees(remainingBalancePaise),

      paymentCount: payments.length,

      paymentPercentage:
        contract.estimatedAmountPaise > 0
          ? Number(
              ((totalPaidPaise / contract.estimatedAmountPaise) * 100).toFixed(
                2,
              ),
            )
          : 0,
    },

    payments: payments.map((payment) => ({
      id: payment._id.toString(),
      paymentNo: payment.paymentNo,
      date: payment.date,
      amount: toRupees(payment.amountPaise),
      method: payment.method,
      verificationStatus: payment.verificationStatus,
      receiptId: payment.receiptId?.toString() ?? null,
      notes: payment.notes ?? null,
    })),
  };
};
