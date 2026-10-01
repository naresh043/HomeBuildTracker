import { Types } from "mongoose";

import { HouseConfiguration } from "../models/HouseConfiguration";
import { ConstructionStage } from "../models/ConstructionStage";
import { Vendor } from "../models/Vendor";
import { Payment } from "../models/Payment";
import { MaterialReceipt } from "../models/MaterialReceipt";
import { Contract } from "../models/Contract";
import { Expense } from "../models/Expense";
import { User } from "../models/User";

import { PAYMENT_TYPE } from "../constants/payment";
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

export const getDashboard = async (query: DashboardQuery) => {
  /**
   * =====================================================
   * DATE VALIDATION
   * =====================================================
   */

  if (query.fromDate && query.toDate && query.fromDate > query.toDate) {
    throw new ApiError(
      422,
      "fromDate cannot be later than toDate",
      "INVALID_DATE_RANGE",
    );
  }

  /**
   * =====================================================
   * DATE FILTERS
   * =====================================================
   */

  const dateFilter = getDateFilter(query);

  /**
   * =====================================================
   * BASE FILTERS
   * =====================================================
   */

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

  /**
   * =====================================================
   * HOUSE
   * =====================================================
   */

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

  /**
   * =====================================================
   * CURRENT STAGE
   * =====================================================
   */

  let currentStage = null;

  if (house.currentStageId) {
    currentStage = await ConstructionStage.findOne({
      _id: house.currentStageId,
      isDeleted: false,
    }).select("_id name status order description startDate completionDate");
  }

  /**
   * =====================================================
   * ALL ACTIVE STAGES
   * =====================================================
   */

  const stages = await ConstructionStage.find({
    isDeleted: false,
  })
    .sort({
      order: 1,
      createdAt: 1,
    })
    .select("_id name status order description startDate completionDate");

  /**
   * =====================================================
   * FINANCIAL TOTALS
   * =====================================================
   */

  const [
    paymentTotals,
    materialTotals,
    expenseTotals,
    contractorPaymentTotals,
  ] = await Promise.all([
    /**
     * TOTAL PAYMENTS
     */
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
        },
      },
    ]),

    /**
     * TOTAL MATERIAL RECEIVED
     */
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

    /**
     * TOTAL OTHER EXPENSES
     */
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
        },
      },
    ]),

    /**
     * TOTAL CONTRACTOR PAYMENTS
     *
     * Include both ADVANCE and CONTRACT_PAYMENT
     * because an advance is also money paid against
     * a construction contract.
     */
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
  ]);

  const totalPaidPaise = paymentTotals[0]?.totalPaidPaise ?? 0;

  const totalMaterialValuePaise =
    materialTotals[0]?.totalMaterialValuePaise ?? 0;

  const totalOtherExpensesPaise =
    expenseTotals[0]?.totalOtherExpensesPaise ?? 0;

  const totalContractorPaidPaise =
    contractorPaymentTotals[0]?.totalContractorPaidPaise ?? 0;

  /**
   * =====================================================
   * CONTRACTOR BALANCES
   *
   * Contract value - payments made against contract
   * =====================================================
   */

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

  /**
   * Payments linked to contracts.
   *
   * Both ADVANCE and CONTRACT_PAYMENT count as
   * money paid against a contract.
   */
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

  /**
   * =====================================================
   * SUPPLIER BALANCES
   *
   * Supplier balance:
   *
   * payments to supplier
   * -
   * material received from supplier
   *
   * Positive:
   *   unused supplier advance
   *
   * Negative:
   *   amount owed to supplier
   * =====================================================
   */

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

  /**
   * =====================================================
   * OUTSTANDING
   *
   * Contractor outstanding
   * +
   * supplier amount owed
   * =====================================================
   */

  const supplierAmountOwedPaise = supplierBalances.reduce((sum, supplier) => {
    if (supplier.balanceType === "AMOUNT_OWED") {
      return sum + Math.round(supplier.balance * 100);
    }

    return sum;
  }, 0);

  const outstandingPaise =
    totalContractorOutstandingPaise + supplierAmountOwedPaise;

  /**
   * =====================================================
   * STAGE PROGRESS
   * =====================================================
   */

  const totalStages = stages.length;

  const completedStages = stages.filter(
    (stage) => stage.status === CONSTRUCTION_STAGE_STATUS.COMPLETED,
  ).length;

  const inProgressStages = stages.filter(
    (stage) => stage.status === CONSTRUCTION_STAGE_STATUS.IN_PROGRESS,
  ).length;

  const stageProgress =
    totalStages === 0
      ? 0
      : Number(((completedStages / totalStages) * 100).toFixed(2));

  /**
   * =====================================================
   * MONTHLY SPENDING
   *
   * Payments + other expenses
   * =====================================================
   */

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

  /**
   * =====================================================
   * CATEGORY BREAKDOWN
   * =====================================================
   */

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

  /**
   * =====================================================
   * FAMILY PAYMENT BREAKDOWN
   * =====================================================
   */

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

  /**
   * =====================================================
   * RECENT TRANSACTIONS
   * =====================================================
   */

  const [recentPayments, recentExpenses] = await Promise.all([
    Payment.find(paymentFilter)
      .sort({
        date: -1,
        createdAt: -1,
      })
      .limit(10)
      .populate("paidToVendorId", "name type")
      .select(
        "_id paymentNo date amountPaise paymentType method paidToVendorId notes verificationStatus",
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

  /**
   * =====================================================
   * BUDGET
   * =====================================================
   *
   * House configuration stores the configured
   * minimum and maximum budget range.
   * =====================================================
   */

  const budgetMinPaise = house.budgetMin ?? 0;

  const budgetMaxPaise = house.budgetMax ?? 0;

  const actualSpendingPaise = totalPaidPaise + totalOtherExpensesPaise;

  const remainingMinimumPaise = Math.max(
    budgetMinPaise - actualSpendingPaise,
    0,
  );

  const remainingMaximumPaise = Math.max(
    budgetMaxPaise - actualSpendingPaise,
    0,
  );

  /**
   * =====================================================
   * FINAL DASHBOARD RESPONSE
   * =====================================================
   */

  return {
    house: {
      id: house._id,

      name: house.name,

      status: house.status,

      startDate: house.startDate,

      currentStage: currentStage
        ? {
            id: currentStage._id,

            name: currentStage.name,

            status: currentStage.status,

            order: currentStage.order,

            description: currentStage.description ?? null,

            startDate: currentStage.startDate ?? null,

            completionDate: currentStage.completionDate ?? null,
          }
        : null,
    },

    financial: {
      totalPaid: toRupees(totalPaidPaise),

      totalMaterialReceived: toRupees(totalMaterialValuePaise),

      totalContractorPaid: toRupees(totalContractorPaidPaise),

      totalOtherExpenses: toRupees(totalOtherExpensesPaise),

      outstanding: toRupees(outstandingPaise),
    },

    budget: {
      minimum: toRupees(budgetMinPaise),

      maximum: toRupees(budgetMaxPaise),

      spent: toRupees(actualSpendingPaise),

      remainingMinimum: toRupees(remainingMinimumPaise),

      remainingMaximum: toRupees(remainingMaximumPaise),
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

      balances: supplierBalances,
    },

    stages: {
      total: totalStages,

      completed: completedStages,

      inProgress: inProgressStages,

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
