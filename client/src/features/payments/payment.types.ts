export type PaymentType =
  | "ADVANCE"
  | "MATERIAL_PAYMENT"
  | "CONTRACT_PAYMENT"
  | "SERVICE_PAYMENT"
  | "OTHER";

export type PaymentMethod = "CASH" | "UPI" | "BANK" | "CHEQUE" | "OTHER";

export type UpiApp = "PHONEPE" | "GOOGLE_PAY" | "PAYTM" | "BHIM" | "OTHER";

export type VerificationStatus = "VERIFIED" | "NEEDS_VERIFICATION";

export interface Payment {
  id: string;
  paymentNo: string;
  date: string;
  amount: number;

  paidByUserId: string | null;
  paidToVendorId: string | null;

  paymentType: PaymentType;
  method: PaymentMethod;

  upiApp: UpiApp | null;
  transactionReference: string | null;

  relatedContractId: string | null;
  relatedSupplierAgreementId: string | null;

  stageId: string | null;

  receiptId: string | null;

  notes: string | null;

  verificationStatus: VerificationStatus;

  createdBy: string;
  isDeleted: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface PaymentListPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaymentListData {
  items: Payment[];
  pagination: PaymentListPagination;
}

export interface PaymentListResponse {
  success: boolean;
  message: string;
  data: PaymentListData;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  data: Payment;
}

export interface CreatePaymentRequest {
  date: string;
  amount: number;
  paidByUserId: string;
  paidToVendorId?: string;
  stageId?: string;
  paymentType: PaymentType;
  method: PaymentMethod;

  upiApp?: UpiApp;
  transactionReference?: string;

  relatedContractId?: string;
  relatedSupplierAgreementId?: string;

  notes?: string;
}

export interface UpdatePaymentRequest {
  date?: string;
  amount?: number;
  paidByUserId?: string;
  paidToVendorId?: string;
  stageId?: string;
  paymentType?: PaymentType;
  method?: PaymentMethod;

  upiApp?: UpiApp | null;
  transactionReference?: string | null;

  relatedContractId?: string | null;
  relatedSupplierAgreementId?: string | null;

  notes?: string | null;
}

export interface VerifyPaymentRequest {
  verificationStatus: VerificationStatus;
}

export interface PaymentQueryParams {
  page?: number;
  limit?: number;
  q?: string;
  paymentType?: PaymentType;
  method?: PaymentMethod;
  hasReceipt?: boolean;
  includeDeleted?: boolean;
}
