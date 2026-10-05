export type HouseStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ON_HOLD";

export type StageStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ON_HOLD";

export type BalanceType = "UNUSED_ADVANCE" | "AMOUNT_OWED";
export type BudgetHealth = "NO_BUDGET" | "BELOW_MINIMUM" | "WITHIN_TARGET" | "NEAR_MAXIMUM" | "OVER_MAXIMUM";
export type FinancialHealthStatus = "HEALTHY" | "ATTENTION_REQUIRED" | "CRITICAL";
export type DashboardActionType = "PAYMENT_VERIFICATION" | "CONTRACTOR_OUTSTANDING" | "SUPPLIER_AMOUNT_OWED" | "UNUSED_SUPPLIER_ADVANCE";

export type TransactionType = "PAYMENT" | "EXPENSE";

export interface DashboardStage {
  id: string;
  name: string;
  status: StageStatus;
  order: number;
  description: string | null;
  startDate: string | null;
  completionDate: string | null;
}

export type CurrentStage = DashboardStage;

export interface HouseSummary {
  id: string;
  name: string;
  status: HouseStatus;
  startDate: string;
  currentStage: CurrentStage | null;
}

export interface FinancialOutstanding {
  total: number;
  contractors: number;
  suppliers: number;
}

export interface FinancialSummary {
  totalPaid: number;
  totalSpending: number;
  totalMaterialReceived: number;
  totalContractorPaid: number;
  totalOtherExpenses: number;
  outstanding: FinancialOutstanding;
}

export interface BudgetUtilization {
  againstMinimum: number;
  againstMaximum: number;
}

export interface BudgetSummary {
  minimum: number;
  maximum: number;
  spent: number;
  remainingMinimum: number;
  remainingMaximum: number;
  utilization: BudgetUtilization;
  health: BudgetHealth;
  minimumExceeded: boolean;
  minimumExceededAmount: number;
  maximumExceeded: boolean;
  maximumExceededAmount: number;
}

export interface ConstructionSummary {
  currentStage: CurrentStage | null;
  lastCompletedStage: DashboardStage | null;
  nextStage: DashboardStage | null;
  totalStages: number;
  completedStages: number;
  inProgressStages: number;
  notStartedStages: number;
  onHoldStages: number;
  progress: number;
}

export interface FinancialHealthSummary {
  totalSpent: number;
  totalPaid: number;
  totalOutstanding: number;
  status: FinancialHealthStatus;
}

export interface VerificationSummary {
  totalPayments: number;
  verified: number;
  needsVerification: number;
  verifiedAmount: number;
  needsVerificationAmount: number;
}

export interface ActionRequiredItem {
  type: DashboardActionType;
  count: number;
  amount: number;
}

export interface ContractorBalance {
  contractId: string;
  vendor: {
    id: string;
    name: string;
    type: string;
    phone: string | null;
    email: string | null;
  } | null;
  contractType: string;
  status: string;
  contractValue: number;
  paid: number;
  outstanding: number;
}

export interface ContractorSummary {
  totalContracts: number;
  totalContractValue: number;
  totalPaid: number;
  totalOutstanding: number;
  balances: ContractorBalance[];
}

export interface SupplierBalance {
  vendorId: string;
  vendor: {
    name: string;
    type: string;
    phone: string | null;
    email: string | null;
  };
  paid: number;
  materialReceived: number;
  balance: number;
  balanceType: BalanceType;
}

export interface SupplierSummary {
  totalSuppliers: number;
  totalPaid: number;
  totalMaterialReceived: number;
  totalUnusedAdvance: number;
  totalAmountOwed: number;
  balances: SupplierBalance[];
}

export interface ActivitySummary {
  paymentCount: number;
  expenseCount: number;
  transactionCount: number;
}

export interface MonthlySpending {
  month: string;
  label: string;
  amount: number;
}

export interface MonthlySummary {
  spending: MonthlySpending[];
}

export interface CategoryBreakdownItem {
  category: string;
  source: "PAYMENT" | "EXPENSE";
  amount: number;
}

export interface CategorySummary {
  breakdown: CategoryBreakdownItem[];
}

export interface FamilyPayment {
  userId: string | null;
  user: {
    name: string;
    email: string;
  } | null;
  amount: number;
  paymentCount: number;
}

export interface RecentTransaction {
  id: string;
  type: TransactionType;
  reference: string | null;
  date: string;
  amount: number;
  category: string;
  method: string;
  vendor: {
    id: string;
    name: string;
    type: string;
  } | null;
  notes: string | null;
  verificationStatus: string | null;
}

export interface DashboardData {
  house: HouseSummary;
  financial: FinancialSummary;
  budget: BudgetSummary;
  construction: ConstructionSummary;
  financialHealth: FinancialHealthSummary;
  verification: VerificationSummary;
  actionRequired: { count: number; items: ActionRequiredItem[] };
  contractors: ContractorSummary;
  suppliers: SupplierSummary;
  activity: ActivitySummary;
  stages: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    onHold: number;
    progress: number;
    items: DashboardStage[];
  };
  monthly: MonthlySummary;
  categories: CategorySummary;
  familyPayments: FamilyPayment[];
  recentTransactions: RecentTransaction[];
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardData;
}
