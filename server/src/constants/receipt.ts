// src/constants/receipt.ts

export const RECEIPT_SOURCE_TYPE = {
  PAPER_BILL: "PAPER_BILL",
  WHATSAPP_IMAGE: "WHATSAPP_IMAGE",
  WHATSAPP_PDF: "WHATSAPP_PDF",
  PHOTO: "PHOTO",
  DIGITAL_INVOICE: "DIGITAL_INVOICE",
  OTHER: "OTHER",
} as const;

export type ReceiptSourceType =
  (typeof RECEIPT_SOURCE_TYPE)[keyof typeof RECEIPT_SOURCE_TYPE];

export const RECEIPT_FILE_TYPE = {
  IMAGE: "IMAGE",
  PDF: "PDF",
} as const;

export type ReceiptFileType =
  (typeof RECEIPT_FILE_TYPE)[keyof typeof RECEIPT_FILE_TYPE];

export const RECEIPT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const RECEIPT_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export type ReceiptAllowedMimeType =
  (typeof RECEIPT_ALLOWED_MIME_TYPES)[number];
