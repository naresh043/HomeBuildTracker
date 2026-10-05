export const CONTRACT_TYPE = { CONSTRUCTION: "CONSTRUCTION", LABOR: "LABOR", TURNKEY: "TURNKEY", OTHER: "OTHER" } as const;
export type ContractType = (typeof CONTRACT_TYPE)[keyof typeof CONTRACT_TYPE];
export const CONTRACT_RATE_UNIT = { SQUARE: "SQUARE", SQFT: "SQFT", SQM: "SQM", LUMP_SUM: "LUMP_SUM", OTHER: "OTHER" } as const;
export type ContractRateUnit = (typeof CONTRACT_RATE_UNIT)[keyof typeof CONTRACT_RATE_UNIT];
export const CONTRACT_STATUS = { DRAFT: "DRAFT", ACTIVE: "ACTIVE", COMPLETED: "COMPLETED", CANCELLED: "CANCELLED" } as const;
export type ContractStatus = (typeof CONTRACT_STATUS)[keyof typeof CONTRACT_STATUS];

export interface Contract {
  id: string; vendorId: string; contractType: ContractType; rate: number;
  rateUnit: ContractRateUnit; measurement: number | null; estimatedAmount: number;
  advanceAmount: number; scopeIncluded: string[]; scopeExcluded: string[];
  startDate: string; status: ContractStatus; notes: string | null;
  createdBy: string; isDeleted: boolean; createdAt: string; updatedAt: string;
}
export interface ContractInput {
  vendorId: string; contractType: ContractType; rate: number; rateUnit: ContractRateUnit;
  measurement?: number; advanceAmount: number; scopeIncluded: string[];
  scopeExcluded: string[]; startDate: string; status: ContractStatus; notes?: string;
}
export type UpdateContractInput = Partial<ContractInput> & { measurement?: number | null; notes?: string | null };
export interface ContractListParams {
  page?: number; limit?: number; q?: string; vendorId?: string; contractType?: ContractType;
  rateUnit?: ContractRateUnit; status?: ContractStatus; fromDate?: string; toDate?: string;
  includeDeleted?: boolean;
}
export interface ContractPagination { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean }
export interface ContractResponse { success: boolean; message: string; data: Contract }
export interface ContractListResponse { success: boolean; message: string; data: { items: Contract[]; pagination: ContractPagination } }
export interface ContractSummaryResponse {
  success: boolean; message: string;
  data: { contract: Contract; financials: { contractValue: number; advanceAmount: number; totalPaid: number; remainingBalance: number; paymentCount: number; paymentPercentage: number }; payments: Array<{ id: string; paymentNo: string; date: string; amount: number; method: string; verificationStatus: string; receiptId: string | null; notes: string | null }> };
}
