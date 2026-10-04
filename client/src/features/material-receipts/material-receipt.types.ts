import type { MaterialUnit } from "@/features/materials/material.types";

export const MATERIAL_RECEIPT_VERIFICATION_STATUS = {
  VERIFIED: "VERIFIED",
  NEEDS_VERIFICATION: "NEEDS_VERIFICATION",
} as const;

export type MaterialReceiptVerificationStatus =
  (typeof MATERIAL_RECEIPT_VERIFICATION_STATUS)[keyof typeof MATERIAL_RECEIPT_VERIFICATION_STATUS];

export interface MaterialReceipt {
  id: string;
  receiptNo: string;
  vendorId: string;
  materialId: string;
  stageId: string;
  date: string;
  quantity: number;
  unit: MaterialUnit;
  unitPrice: number;
  totalAmount: number;
  receiptId: string | null;
  agreementId: string | null;
  notes: string | null;
  verificationStatus: MaterialReceiptVerificationStatus;
  createdBy: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaterialReceiptRequest {
  vendorId: string;
  materialId: string;
  stageId: string;
  date: string;
  quantity: number;
  unit: MaterialUnit;
  unitPrice: number;
  notes?: string;
}

export type UpdateMaterialReceiptRequest = Partial<
  Omit<CreateMaterialReceiptRequest, "notes">
> & { notes?: string | null };

export interface MaterialReceiptResponse {
  success: boolean;
  message: string;
  data: MaterialReceipt;
}

export interface MaterialReceiptPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface MaterialReceiptsResponse {
  success: boolean;
  message: string;
  data: {
    items: MaterialReceipt[];
    pagination: MaterialReceiptPagination;
  };
}

export interface MaterialReceiptListParams {
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
