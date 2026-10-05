export const RECEIPT_SOURCE_TYPES = [
  "PAPER_BILL",
  "WHATSAPP_IMAGE",
  "WHATSAPP_PDF",
  "PHOTO",
  "DIGITAL_INVOICE",
  "OTHER",
] as const;

export type ReceiptSourceType = (typeof RECEIPT_SOURCE_TYPES)[number];

export type ReceiptFileType = "IMAGE" | "PDF";

export type ReceiptLinkedTransaction =
  | {
      type: "payment";
      id: string;
      label: string;
    }
  | {
      type: "materialReceipt";
      id: string;
      label: string;
    }
  | {
      type: "expense";
      id: string;
      label: string;
    }
  | null;

export interface Receipt {
  _id: string;
  fileUrl: string;
  publicId?: string;

  fileType: ReceiptFileType;
  sourceType: ReceiptSourceType;

  originalFileName: string;
  mimeType: string;
  sizeBytes: number;

  uploadedBy: string;

  isDeleted: boolean;

  createdAt: string;
  updatedAt: string;

  linkedTransaction: ReceiptLinkedTransaction;
}

export interface ReceiptQueryParams {
  q?: string;
  sourceType?: ReceiptSourceType;
  fileType?: ReceiptFileType;
  fromDate?: string;
  toDate?: string;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
}

export interface ReceiptPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ReceiptListResponse {
  success: boolean;
  message: string;
  data: {
    items: Receipt[];
    pagination: ReceiptPagination;
  };
}

export interface ReceiptResponse {
  success: boolean;
  message: string;
  data: Receipt;
}

export interface ReceiptMutationResponse {
  success: boolean;
  message: string;
  data: Receipt | null;
}

export interface UploadReceiptPayload {
  file: File;
  sourceType: ReceiptSourceType;
}

export type ReceiptLinkPayload =
  | { paymentId: string }
  | { materialReceiptId: string }
  | { expenseId: string };

export type ReceiptUnlinkPayload = ReceiptLinkPayload;