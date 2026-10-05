import { z } from "zod";
import { RECEIPT_SOURCE_TYPES } from "./receipt.types";

const supportedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
export const receiptUploadSchema = z.object({
  file: z
    .instanceof(File, { message: "Choose a receipt file" })
    .refine(
      (file) => supportedTypes.includes(file.type),
      "Choose a JPG, PNG, WebP, or PDF file",
    )
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      "File must be 10 MB or smaller",
    ),
  sourceType: z.enum([...RECEIPT_SOURCE_TYPES], {
    message: "Choose a source type",
  }),
});
export type ReceiptUploadValues = z.infer<typeof receiptUploadSchema>;
