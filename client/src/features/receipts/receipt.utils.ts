import { format, isValid, parseISO } from "date-fns";
import type { ReceiptFileType, ReceiptSourceType } from "./receipt.types";

export const RECEIPT_SOURCE_LABELS: Record<ReceiptSourceType, string> = {
  PAPER_BILL: "Paper Bill", WHATSAPP_IMAGE: "WhatsApp Image", WHATSAPP_PDF: "WhatsApp PDF",
  PHOTO: "Photo", DIGITAL_INVOICE: "Digital Invoice", OTHER: "Other",
};
export const formatReceiptCreatedDate = (value: string) => {
  const date = parseISO(value);
  return isValid(date) ? format(date, "dd MMM yyyy, h:mm a") : value;
};
export const formatReceiptSize = (size: number) => size < 1024 * 1024
  ? `${Math.max(1, Math.round(size / 1024))} KB`
  : `${(size / (1024 * 1024)).toFixed(1)} MB`;
export const receiptFileTypeLabel = (type: ReceiptFileType) => type === "PDF" ? "PDF document" : "Image";
