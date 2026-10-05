import { Types } from "mongoose";
import { HouseConfiguration } from "../models/HouseConfiguration";
import { ConstructionStage } from "../models/ConstructionStage";
import { Vendor } from "../models/Vendor";
import { Payment } from "../models/Payment";
import { MaterialReceipt } from "../models/MaterialReceipt";
import { Contract } from "../models/Contract";
import { Expense } from "../models/Expense";
import { User } from "../models/User";
import { PAYMENT_TYPE, PAYMENT_VERIFICATION_STATUS } from "../constants/payment";
import { CONSTRUCTION_STAGE_STATUS } from "../constants/construction";
import { ApiError } from "../utils/ApiError";
import type { DashboardQuery } from "../validators/dashboard.schema";
const toRupees = (paise: number): number => {
  return Number((paise / 100).toFixed(2));
};
const getDateFilter = (query: DashboardQuery) => {
  const filter: Record<string, Date> = {};
  if (query.fromDate) {
    filter.$gte = query.fromDate;
  }
  if (query.toDate) {
    filter.$lte = query.toDate;
  }
  return Object.keys(filter).length > 0 ? filter : undefined;
};
const formatMonth = (monthKey: string): string => {
  const [year, month] = monthKey.split("-");
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};
type DashboardStageSummary = {
  _id: Types.ObjectId;
  name: string;
  status: string;
  order: number;
  description?: string | null;
  startDate?: Date | null;
  completionDate?: Date | null;
};

type BudgetHealth =
  | "NO_BUDGET"
  | "BELOW_MINIMUM"
  | "WITHIN_TARGET"
  | "NEAR_MAXIMUM"
  | "OVER_MAXIMUM";

type FinancialHealth =
  | "HEALTHY"
  | "ATTENTION_REQUIRED"
  | "CRITICAL";

type DashboardActionType =
  | "PAYMENT_VERIFICATION"
  | "CONTRACTOR_OUTSTANDING"
  | "SUPPLIER_AMOUNT_OWED"
  | "UNUSED_SUPPLIER_ADVANCE";

const toStageSummary = (
  stage: DashboardStageSummary | null | undefined,
) => {
  if (!stage) {
    return null;
  }

  return {
    id: stage._id,
    name: stage.name,
    status: stage.status,
    order: stage.order,
    description: stage.description ?? null,
    startDate: stage.startDate ?? null,
    completionDate: stage.completionDate ?? null,
  };
};

const getBudgetHealth = ({
  budgetMinPaise,
  budgetMaxPaise,
  actualSpendingPaise,
}: {
  budgetMinPaise: number;
  budgetMaxPaise: number;
  actualSpendingPaise: number;
}): BudgetHealth => {
  if (budgetMinPaise <= 0 && budgetMaxPaise <= 0) {
    return "NO_BUDGET";
  }

  if (budgetMaxPaise > 0 && actualSpendingPaise > budgetMaxPaise) {
    return "OVER_MAXIMUM";
  }

  if (
    budgetMaxPaise > 0 &&
    actualSpendingPaise >= Math.round(budgetMaxPaise * 0.8)
  ) {
    return "NEAR_MAXIMUM";
  }

  if (
    budgetMinPaise > 0 &&
    actualSpendingPaise < budgetMinPaise
  ) {
    return "BELOW_MINIMUM";
  }

  return "WITHIN_TARGET";
};

const getFinancialHealth = ({
  outstandingPaise,
  budgetHealth,
  needsVerification,
}: {
  outstandingPaise: number;
  budgetHealth: BudgetHealth;
  needsVerification: number;
}): FinancialHealth => {
  if (
    budgetHealth === "OVER_MAXIMUM" ||
    (outstandingPaise > 0 && needsVerification > 0)
  ) {
    return "CRITICAL";
  }

  if (
    budgetHealth === "NEAR_MAXIMUM" ||
    outstandingPaise > 0 ||
    needsVerification > 0
  ) {
    return "ATTENTION_REQUIRED";
  }

  return "HEALTHY";
};

export const getDashboard = async (query: DashboardQuery) => {
  if (query.fromDate && query.toDate && query.fromDate > query.toDate) {
    throw new ApiError(
      422,
      "fromDate cannot be later than toDate",
      "INVALID_DATE_RANGE",
    );
  }
  const dateFilter = getDateFilter(query);
  const paymentFilter: Record<string, unknown> = {
    isDeleted: false,
  };
  const materialReceiptFilter: Record<string, unknown> = {
    isDeleted: false,
  };
  const expenseFilter: Record<string, unknown> = {
    isDeleted: false,
  };
  if (dateFilter) {
    paymentFilter.date = dateFilter;
    materialReceiptFilter.date = dateFilter;
    expenseFilter.date = dateFilter;
  }
  const house = await HouseConfiguration.findOne({
    singletonKey: { $exists: true },
  }).sort({ createdAt: 1 });
  if (!house) {
    throw new ApiError(
      404,
      "House configuration has not been initialized",
      "HOUSE_NOT_INITIALIZED",
    );
  }
  const stages = await ConstructionStage.find({
    isDeleted: false,
  })
    .sort({
      order: 1,
      createdAt: 1,
    })
    .select("_id name status order description startDate completionDate");
  const currentStage = house.currentStageId
    ? (stages.find(
        (stage) => stage._id.toString() === house.currentStageId?.toString(),
      ) ?? null)
    : (stages.find(
        (stage) => stage.status === CONSTRUCTION_STAGE_STATUS.IN_PROGRESS,
      ) ?? null);
  const currentStageSummary = currentStage ? toStageSummary({
    _id: currentStage._id,
    name: currentStage.name,
    status: currentStage.status,
    order: currentStage.order,
    description: currentStage.description ?? null,
    startDate: currentStage.startDate ?? null,
    completionDate: currentStage.completionDate ?? null,
  }) : null;
  const [
    paymentTotals,
    materialTotals,
    expenseTotals,
    contractorPaymentTotals,
    verificationAggregation,
  ] = await Promise.all([
    Payment.aggregate([
      {
        $match: paymentFilter,
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
        $match: materialReceiptFilter,
      },
      {
        $group: {
          _id: null,
          totalMaterialValuePaise: {
            $sum: "$totalAmountPaise",
          },
        },
      },
    ]),
    Expense.aggregate([
      {
        $match: expenseFilter,
      },
      {
        $group: {
          _id: null,
          totalOtherExpensesPaise: {
            $sum: "$amountPaise",
          },
          expenseCount: {
            $sum: 1,
          },
        },
      },
    ]),
    Payment.aggregate([
      {
        $match: {
          ...paymentFilter,
          paymentType: {
            $in: [PAYMENT_TYPE.ADVANCE, PAYMENT_TYPE.CONTRACT_PAYMENT],
          },
          relatedContractId: {
            $exists: true,
            $ne: null,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalContractorPaidPaise: {
            $sum: "$amountPaise",
          },
        },
      },
    ]),
    Payment.aggregate([
      { $match: paymentFilter },
      {
        $group: {
          _id: "$verificationStatus",
          count: { $sum: 1 },
          amountPaise: { $sum: "$amountPaise" },
        },
      },
    ]),
  ]);
  const totalPaidPaise = paymentTotals[0]?.totalPaidPaise ?? 0;
  const paymentCount = paymentTotals[0]?.paymentCount ?? 0;
  const totalMaterialValuePaise =
    materialTotals[0]?.totalMaterialValuePaise ?? 0;
  const totalOtherExpensesPaise =
    expenseTotals[0]?.totalOtherExpensesPaise ?? 0;
  const expenseCount = expenseTotals[0]?.expenseCount ?? 0;
  const transactionCount = paymentCount + expenseCount;
  const totalContractorPaidPaise =
    contractorPaymentTotals[0]?.totalContractorPaidPaise ?? 0;
  const contracts = await Contract.find({
    isDeleted: false,
  })
    .populate("vendorId", "name type phone email")
    .select(
      [
        "_id",
        "vendorId",
        "contractType",
        "ratePaise",
        "rateUnit",
        "measurement",
        "estimatedAmountPaise",
        "advanceAmountPaise",
        "status",
        "startDate",
      ].join(" "),
    );
  const contractorPaymentAggregation = await Payment.aggregate([
    {
      $match: {
        ...paymentFilter,
        paymentType: {
          $in: [PAYMENT_TYPE.ADVANCE, PAYMENT_TYPE.CONTRACT_PAYMENT],
        },
        relatedContractId: {
          $exists: true,
          $ne: null,
        },
      },
    },
    {
      $group: {
        _id: "$relatedContractId",
        totalPaidPaise: {
          $sum: "$amountPaise",
        },
      },
    },
  ]);
  const contractorPaymentsMap = new Map<string, number>();
  for (const item of contractorPaymentAggregation) {
    contractorPaymentsMap.set(String(item._id), item.totalPaidPaise ?? 0);
  }
  const contractorBalances = contracts.map((contract) => {
    const contractId = String(contract._id);
    const contractValuePaise = contract.estimatedAmountPaise ?? 0;
    const totalPaidAgainstContractPaise =
      contractorPaymentsMap.get(contractId) ?? 0;
    const outstandingPaise = Math.max(
      contractValuePaise - totalPaidAgainstContractPaise,
      0,
    );
    const vendor = contract.vendorId as unknown as {
      _id: Types.ObjectId;
      name: string;
      type: string;
      phone?: string;
      email?: string;
    } | null;
    return {
      contractId: contract._id,
      vendor: vendor
        ? {
            id: vendor._id,
            name: vendor.name,
            type: vendor.type,
            phone: vendor.phone ?? null,
            email: vendor.email ?? null,
          }
        : null,
      contractType: contract.contractType,
      status: contract.status,
      contractValue: toRupees(contractValuePaise),
      paid: toRupees(totalPaidAgainstContractPaise),
      outstanding: toRupees(outstandingPaise),
    };
  });
  const totalContractValuePaise = contractorBalances.reduce(
    (sum, contract) => sum + Math.round(contract.contractValue * 100),
    0,
  );
  const totalContractorOutstandingPaise = contractorBalances.reduce(
    (sum, contract) => sum + Math.round(contract.outstanding * 100),
    0,
  );
  const supplierVendors = await Vendor.find({
    isDeleted: false,
    type: "MATERIAL_SUPPLIER",
  }).select("_id name type phone email");
  const supplierPaymentAggregation = await Payment.aggregate([
    {
      $match: {
        ...paymentFilter,
        paidToVendorId: {
          $exists: true,
          $ne: null,
        },
      },
    },
    {
      $group: {
        _id: "$paidToVendorId",
        totalPaidPaise: {
          $sum: "$amountPaise",
        },
      },
    },
  ]);
  const supplierMaterialAggregation = await MaterialReceipt.aggregate([
    {
      $match: materialReceiptFilter,
    },
    {
      $group: {
        _id: "$vendorId",
        totalMaterialValuePaise: {
          $sum: "$totalAmountPaise",
        },
      },
    },
  ]);
  const supplierPaymentMap = new Map<string, number>();
  for (const item of supplierPaymentAggregation) {
    supplierPaymentMap.set(String(item._id), item.totalPaidPaise ?? 0);
  }
  const supplierMaterialMap = new Map<string, number>();
  for (const item of supplierMaterialAggregation) {
    supplierMaterialMap.set(
      String(item._id),
      item.totalMaterialValuePaise ?? 0,
    );
  }
  const supplierBalances = supplierVendors.map((vendor) => {
    const vendorId = String(vendor._id);
    const totalPaidPaise = supplierPaymentMap.get(vendorId) ?? 0;
    const materialValuePaise = supplierMaterialMap.get(vendorId) ?? 0;
    const balancePaise = totalPaidPaise - materialValuePaise;
    let balanceType: "UNUSED_ADVANCE" | "AMOUNT_OWED" | "SETTLED";
    if (balancePaise > 0) {
      balanceType = "UNUSED_ADVANCE";
    } else if (balancePaise < 0) {
      balanceType = "AMOUNT_OWED";
    } else {
      balanceType = "SETTLED";
    }
    return {
      vendorId: vendor._id,
      vendor: {
        name: vendor.name,
        type: vendor.type,
        phone: vendor.phone ?? null,
        email: vendor.email ?? null,
      },
      paid: toRupees(totalPaidPaise),
      materialReceived: toRupees(materialValuePaise),
      balance: toRupees(Math.abs(balancePaise)),
      balanceType,
    };
  });
  const totalSupplierPaidPaise = supplierBalances.reduce(
    (sum, supplier) => sum + Math.round(supplier.paid * 100),
    0,
  );
  const totalSupplierMaterialReceivedPaise = supplierBalances.reduce(
    (sum, supplier) => sum + Math.round(supplier.materialReceived * 100),
    0,
  );
  const totalSupplierUnusedAdvancePaise = supplierBalances.reduce(
    (sum, supplier) =>
      supplier.balanceType === "UNUSED_ADVANCE"
        ? sum + Math.round(supplier.balance * 100)
        : sum,
    0,
  );
  const totalSupplierAmountOwedPaise = supplierBalances.reduce(
    (sum, supplier) =>
      supplier.balanceType === "AMOUNT_OWED"
        ? sum + Math.round(supplier.balance * 100)
        : sum,
    0,
  );
  const supplierAmountOwedPaise = totalSupplierAmountOwedPaise;
  const outstandingPaise =
    totalContractorOutstandingPaise + supplierAmountOwedPaise;
  const totalStages = stages.length;
  const completedStages = stages.filter((stage) => stage.status === CONSTRUCTION_STAGE_STATUS.COMPLETED).length;
  const inProgressStages = stages.filter((stage) => stage.status === CONSTRUCTION_STAGE_STATUS.IN_PROGRESS).length;
  const notStartedStages = stages.filter((stage) => stage.status === CONSTRUCTION_STAGE_STATUS.NOT_STARTED).length;
  const onHoldStages = stages.filter((stage) => stage.status === CONSTRUCTION_STAGE_STATUS.ON_HOLD).length;
  const stageProgress =
    totalStages === 0
      ? 0
      : Number(((completedStages / totalStages) * 100).toFixed(2));
  const lastCompletedStage = stages
    .filter((stage) => stage.status === CONSTRUCTION_STAGE_STATUS.COMPLETED)
    .reduce<(typeof stages)[number] | null>((latest, stage) => !latest || stage.order > latest.order ? stage : latest, null);
  const nextStage = stages
    .filter((stage) => stage.status === CONSTRUCTION_STAGE_STATUS.NOT_STARTED)
    .reduce<(typeof stages)[number] | null>((earliest, stage) => !earliest || stage.order < earliest.order ? stage : earliest, null);

  const verifiedTotals = verificationAggregation.find((item) => item._id === PAYMENT_VERIFICATION_STATUS.VERIFIED);
  const needsVerificationTotals = verificationAggregation
    .filter((item) => item._id !== PAYMENT_VERIFICATION_STATUS.VERIFIED)
    .reduce((total, item) => ({ count: total.count + (item.count ?? 0), amountPaise: total.amountPaise + (item.amountPaise ?? 0) }), { count: 0, amountPaise: 0 });
  const verifiedPaymentCount = verifiedTotals?.count ?? 0;
  const verifiedPaymentAmountPaise = verifiedTotals?.amountPaise ?? 0;
  const needsVerificationPaymentCount = needsVerificationTotals.count;
  const needsVerificationPaymentAmountPaise = needsVerificationTotals.amountPaise;
  const budgetMinPaise = house.budgetMin ?? 0;
  const budgetMaxPaise = house.budgetMax ?? 0;
  const actualSpendingPaise = totalPaidPaise + totalOtherExpensesPaise;
  const minimumExceeded = budgetMinPaise > 0 && actualSpendingPaise > budgetMinPaise;
  const maximumExceeded = budgetMaxPaise > 0 && actualSpendingPaise > budgetMaxPaise;
  const budgetHealth = getBudgetHealth({ budgetMinPaise, budgetMaxPaise, actualSpendingPaise });
  const financialHealth = getFinancialHealth({ outstandingPaise, budgetHealth, needsVerification: needsVerificationPaymentCount });
  const actionRequiredItems: { type: DashboardActionType; count: number; amount: number }[] = [];
  if (needsVerificationPaymentCount > 0) actionRequiredItems.push({ type: "PAYMENT_VERIFICATION", count: needsVerificationPaymentCount, amount: toRupees(needsVerificationPaymentAmountPaise) });
  const contractorOutstandingCount = contractorBalances.filter((item) => item.outstanding > 0).length;
  if (totalContractorOutstandingPaise > 0) actionRequiredItems.push({ type: "CONTRACTOR_OUTSTANDING", count: contractorOutstandingCount, amount: toRupees(totalContractorOutstandingPaise) });
  const supplierOwedCount = supplierBalances.filter((item) => item.balanceType === "AMOUNT_OWED").length;
  if (totalSupplierAmountOwedPaise > 0) actionRequiredItems.push({ type: "SUPPLIER_AMOUNT_OWED", count: supplierOwedCount, amount: toRupees(totalSupplierAmountOwedPaise) });
  const unusedAdvanceCount = supplierBalances.filter((item) => item.balanceType === "UNUSED_ADVANCE").length;
  if (totalSupplierUnusedAdvancePaise > 0) actionRequiredItems.push({ type: "UNUSED_SUPPLIER_ADVANCE", count: unusedAdvanceCount, amount: toRupees(totalSupplierUnusedAdvancePaise) });
  const [monthlyPayments, monthlyExpenses] = await Promise.all([
    Payment.aggregate([
      {
        $match: paymentFilter,
      },
      {
        $group: {
          _id: {
            year: {
              $year: "$date",
            },
            month: {
              $month: "$date",
            },
          },
          amountPaise: {
            $sum: "$amountPaise",
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]),
    Expense.aggregate([
      {
        $match: expenseFilter,
      },
      {
        $group: {
          _id: {
            year: {
              $year: "$date",
            },
            month: {
              $month: "$date",
            },
          },
          amountPaise: {
            $sum: "$amountPaise",
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]),
  ]);
  const monthlyMap = new Map<string, number>();
  for (const item of monthlyPayments) {
    const monthKey = `${item._id.year}-${String(item._id.month).padStart(
      2,
      "0",
    )}`;
    monthlyMap.set(
      monthKey,
      (monthlyMap.get(monthKey) ?? 0) + (item.amountPaise ?? 0),
    );
  }
  for (const item of monthlyExpenses) {
    const monthKey = `${item._id.year}-${String(item._id.month).padStart(
      2,
      "0",
    )}`;
    monthlyMap.set(
      monthKey,
      (monthlyMap.get(monthKey) ?? 0) + (item.amountPaise ?? 0),
    );
  }
  const monthlySpending = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amountPaise]) => ({
      month,
      label: formatMonth(month),
      amount: toRupees(amountPaise),
    }));
  const [paymentCategoryAggregation, expenseCategoryAggregation] =
    await Promise.all([
      Payment.aggregate([
        {
          $match: paymentFilter,
        },
        {
          $group: {
            _id: "$paymentType",
            amountPaise: {
              $sum: "$amountPaise",
            },
          },
        },
        {
          $sort: {
            amountPaise: -1,
          },
        },
      ]),
      Expense.aggregate([
        {
          $match: expenseFilter,
        },
        {
          $group: {
            _id: "$category",
            amountPaise: {
              $sum: "$amountPaise",
            },
          },
        },
        {
          $sort: {
            amountPaise: -1,
          },
        },
      ]),
    ]);
  const categoryBreakdown = [
    ...paymentCategoryAggregation.map((item) => ({
      category: item._id,
      source: "PAYMENT",
      amount: toRupees(item.amountPaise ?? 0),
    })),
    ...expenseCategoryAggregation.map((item) => ({
      category: item._id,
      source: "EXPENSE",
      amount: toRupees(item.amountPaise ?? 0),
    })),
  ];
  const familyPaymentAggregation = await Payment.aggregate([
    {
      $match: paymentFilter,
    },
    {
      $group: {
        _id: "$paidByUserId",
        amountPaise: {
          $sum: "$amountPaise",
        },
        paymentCount: {
          $sum: 1,
        },
      },
    },
  ]);
  const familyUserIds = familyPaymentAggregation
    .map((item) => item._id)
    .filter(Boolean);
  const familyUsers =
    familyUserIds.length > 0
      ? await User.find({
          _id: {
            $in: familyUserIds,
          },
        }).select("_id name email")
      : [];
  const familyUserMap = new Map(
    familyUsers.map((user) => [String(user._id), user]),
  );
  const familyPayments = familyPaymentAggregation.map((item) => {
    const user = familyUserMap.get(String(item._id));
    return {
      userId: item._id,
      user: user
        ? {
            name: user.name,
            email: user.email,
          }
        : null,
      amount: toRupees(item.amountPaise ?? 0),
      paymentCount: item.paymentCount ?? 0,
    };
  });
  const [recentPayments, recentExpenses] = await Promise.all([
    Payment.find(paymentFilter)
      .sort({
        date: -1,
        createdAt: -1,
      })
      .limit(10)
      .populate("paidToVendorId", "name type")
      .select(
        [
          "_id",
          "paymentNo",
          "date",
          "amountPaise",
          "paymentType",
          "method",
          "paidToVendorId",
          "notes",
          "verificationStatus",
        ].join(" "),
      ),
    Expense.find(expenseFilter)
      .sort({
        date: -1,
        createdAt: -1,
      })
      .limit(10)
      .select("_id date amountPaise category method notes"),
  ]);
  const recentTransactions = [
    ...recentPayments.map((payment) => {
      const vendor = payment.paidToVendorId as unknown as {
        _id: Types.ObjectId;
        name: string;
        type: string;
      } | null;
      return {
        id: payment._id,
        type: "PAYMENT" as const,
        reference: payment.paymentNo,
        date: payment.date,
        amount: toRupees(payment.amountPaise),
        category: payment.paymentType,
        method: payment.method,
        vendor: vendor
          ? {
              id: vendor._id,
              name: vendor.name,
              type: vendor.type,
            }
          : null,
        notes: payment.notes ?? null,
        verificationStatus: payment.verificationStatus,
      };
    }),
    ...recentExpenses.map((expense) => ({
      id: expense._id,
      type: "EXPENSE" as const,
      reference: null,
      date: expense.date,
      amount: toRupees(expense.amountPaise),
      category: expense.category,
      method: expense.method,
      vendor: null,
      notes: expense.notes ?? null,
      verificationStatus: null,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
  const remainingMinimumPaise = Math.max(
    budgetMinPaise - actualSpendingPaise,
    0,
  );
  const remainingMaximumPaise = Math.max(
    budgetMaxPaise - actualSpendingPaise,
    0,
  );
  const budgetUtilizationAgainstMinimum =
    budgetMinPaise > 0
      ? Number(((actualSpendingPaise / budgetMinPaise) * 100).toFixed(2))
      : 0;
  const budgetUtilizationAgainstMaximum =
    budgetMaxPaise > 0
      ? Number(((actualSpendingPaise / budgetMaxPaise) * 100).toFixed(2))
      : 0;
  return {
    house: {
      id: house._id,
      name: house.name,
      status: house.status,
      startDate: house.startDate,
      currentStage: currentStageSummary,
    },
    construction: {
      currentStage: currentStageSummary,
      lastCompletedStage: toStageSummary(lastCompletedStage ? { _id: lastCompletedStage._id, name: lastCompletedStage.name, status: lastCompletedStage.status, order: lastCompletedStage.order, description: lastCompletedStage.description ?? null, startDate: lastCompletedStage.startDate ?? null, completionDate: lastCompletedStage.completionDate ?? null } : null),
      nextStage: toStageSummary(nextStage ? { _id: nextStage._id, name: nextStage.name, status: nextStage.status, order: nextStage.order, description: nextStage.description ?? null, startDate: nextStage.startDate ?? null, completionDate: nextStage.completionDate ?? null } : null),
      totalStages, completedStages, inProgressStages, notStartedStages, onHoldStages, progress: stageProgress,
    },
    financial: {
      totalPaid: toRupees(totalPaidPaise),
      totalSpending: toRupees(actualSpendingPaise),
      totalMaterialReceived: toRupees(totalMaterialValuePaise),
      totalContractorPaid: toRupees(totalContractorPaidPaise),
      totalOtherExpenses: toRupees(totalOtherExpensesPaise),
      outstanding: {
        total: toRupees(outstandingPaise),
        contractors: toRupees(totalContractorOutstandingPaise),
        suppliers: toRupees(supplierAmountOwedPaise),
      },
    },
    financialHealth: {
      totalSpent: toRupees(actualSpendingPaise),
      totalPaid: toRupees(totalPaidPaise),
      totalOutstanding: toRupees(outstandingPaise),
      status: financialHealth,
    },
    budget: {
      minimum: toRupees(budgetMinPaise),
      maximum: toRupees(budgetMaxPaise),
      spent: toRupees(actualSpendingPaise),
      remainingMinimum: toRupees(remainingMinimumPaise),
      remainingMaximum: toRupees(remainingMaximumPaise),
      utilization: {
        againstMinimum: budgetUtilizationAgainstMinimum,
        againstMaximum: budgetUtilizationAgainstMaximum,
      },
      health: budgetHealth,
      minimumExceeded,
      minimumExceededAmount: minimumExceeded ? toRupees(actualSpendingPaise - budgetMinPaise) : 0,
      maximumExceeded,
      maximumExceededAmount: maximumExceeded ? toRupees(actualSpendingPaise - budgetMaxPaise) : 0,
    },
    verification: {
      totalPayments: paymentCount,
      verified: verifiedPaymentCount,
      needsVerification: needsVerificationPaymentCount,
      verifiedAmount: toRupees(verifiedPaymentAmountPaise),
      needsVerificationAmount: toRupees(needsVerificationPaymentAmountPaise),
    },
    actionRequired: {
      count: actionRequiredItems.reduce((total, item) => total + item.count, 0),
      items: actionRequiredItems,
    },
    contractors: {
      totalContracts: contracts.length,
      totalContractValue: toRupees(totalContractValuePaise),
      totalPaid: toRupees(totalContractorPaidPaise),
      totalOutstanding: toRupees(totalContractorOutstandingPaise),
      balances: contractorBalances,
    },
    suppliers: {
      totalSuppliers: supplierVendors.length,
      totalPaid: toRupees(totalSupplierPaidPaise),
      totalMaterialReceived: toRupees(totalSupplierMaterialReceivedPaise),
      totalUnusedAdvance: toRupees(totalSupplierUnusedAdvancePaise),
      totalAmountOwed: toRupees(totalSupplierAmountOwedPaise),
      balances: supplierBalances,
    },
    activity: {
      paymentCount,
      expenseCount,
      transactionCount,
    },
    stages: {
      total: totalStages,
      completed: completedStages,
      inProgress: inProgressStages,
      notStarted: notStartedStages,
      onHold: onHoldStages,
      progress: stageProgress,
      items: stages.map((stage) => ({
        id: stage._id,
        name: stage.name,
        status: stage.status,
        order: stage.order,
        description: stage.description ?? null,
        startDate: stage.startDate ?? null,
        completionDate: stage.completionDate ?? null,
      })),
    },
    monthly: {
      spending: monthlySpending,
    },
    categories: {
      breakdown: categoryBreakdown,
    },
    familyPayments,
    recentTransactions,
  };
};
