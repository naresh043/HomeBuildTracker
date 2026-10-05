export const SUPPLIER_AGREEMENT_STATUS = {
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type SupplierAgreementStatus =
  (typeof SUPPLIER_AGREEMENT_STATUS)[keyof typeof SUPPLIER_AGREEMENT_STATUS];

export interface SupplierAgreement {
  id: string;
  vendorId: string;
  materialIds: string[];
  advanceAmount: number;
  startDate: string;
  status: SupplierAgreementStatus;
  notes: string | null;
  createdBy: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierAgreementQueryParams {
  page?: number;
  limit?: number;
  vendorId?: string;
  status?: SupplierAgreementStatus;
  fromDate?: string;
  toDate?: string;
  q?: string;
  includeDeleted?: boolean;
}

export interface SupplierAgreementPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface SupplierAgreementResponse {
  success: boolean;
  message: string;
  data: SupplierAgreement;
}

export interface SupplierAgreementListResponse {
  success: boolean;
  message: string;
  data: {
    items: SupplierAgreement[];
    pagination: SupplierAgreementPagination;
  };
}

export interface SupplierAgreementSummary {
  agreement: SupplierAgreement;
  financials: {
    agreementAdvanceAmount: number;
    totalPaid: number;
    totalMaterialReceived: number;
    balance: number;
    balanceType: "UNUSED_ADVANCE" | "AMOUNT_OWED_TO_SUPPLIER" | "SETTLED";
  };
  counts: {
    paymentCount: number;
    materialReceiptCount: number;
  };
}

export interface SupplierAgreementSummaryResponse {
  success: boolean;
  message: string;
  data: SupplierAgreementSummary;
}

export interface CreateSupplierAgreementPayload {
  vendorId: string;
  materialIds: string[];
  advanceAmount: number;
  startDate: string;
  status: SupplierAgreementStatus;
  notes?: string;
}

export type UpdateSupplierAgreementPayload = Partial<CreateSupplierAgreementPayload> & {
  notes?: string | null;
};
