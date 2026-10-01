import multer from "multer";

import {
  RECEIPT_ALLOWED_MIME_TYPES,
  RECEIPT_MAX_FILE_SIZE_BYTES,
} from "../constants/receipt";
import { ApiError } from "../utils/ApiError";

/**
 * =====================================================
 * RECEIPT UPLOAD CONFIGURATION
 * =====================================================
 *
 * Receipts are temporarily stored in memory because
 * they are uploaded directly to Cloudinary by the
 * receipt service.
 *
 * We intentionally do not use diskStorage().
 */
const storage = multer.memoryStorage();

/**
 * =====================================================
 * FILE FILTER
 * =====================================================
 *
 * Only allow the MIME types supported by the receipt
 * module.
 *
 * IMPORTANT:
 * MIME type is supplied by the client and should not
 * be treated as a cryptographic proof of file contents.
 *
 * The receipt service performs additional validation
 * before sending the file to Cloudinary.
 */
const fileFilter: multer.Options["fileFilter"] = (_req, file, callback) => {
  const isAllowedMimeType = RECEIPT_ALLOWED_MIME_TYPES.includes(
    file.mimetype as (typeof RECEIPT_ALLOWED_MIME_TYPES)[number],
  );

  if (!isAllowedMimeType) {
    return callback(
      new ApiError(
        422,
        "Only JPEG, PNG, WebP images and PDF files are allowed",
        "INVALID_FILE_TYPE",
      ),
    );
  }

  return callback(null, true);
};

/**
 * =====================================================
 * RECEIPT UPLOAD MIDDLEWARE
 * =====================================================
 *
 * Expected multipart/form-data:
 *
 * file       -> receipt file
 * sourceType -> receipt source type
 *
 * Maximum:
 * - 1 file
 * - 10 MB
 */
export const uploadReceipt = multer({
  storage,

  limits: {
    fileSize: RECEIPT_MAX_FILE_SIZE_BYTES,
    files: 1,
  },

  fileFilter,
}).single("file");
