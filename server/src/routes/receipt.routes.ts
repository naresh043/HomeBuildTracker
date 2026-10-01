// src/routes/receipt.routes.ts

import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";
import { uploadReceipt } from "../middleware/upload.middleware";
import { validate } from "../middleware/validate.middleware";

import {
  createReceiptController,
  deleteReceiptController,
  getReceiptController,
  linkReceiptController,
  listReceiptsController,
  restoreReceiptController,
  unlinkReceiptController,
} from "../controllers/receipt.controller";

import {
  createReceiptSchema,
  deleteReceiptSchema,
  getReceiptSchema,
  linkReceiptSchema,
  listReceiptsSchema,
  restoreReceiptSchema,
  unlinkReceiptSchema,
} from "../validators/receipt.schema";

const router = Router();

router.use(authenticate);

/**
 * Upload receipt
 *
 * POST /api/receipts
 *
 * multipart/form-data
 * file       -> receipt file
 * sourceType -> receipt source
 */
router.post(
  "/",
  uploadReceipt,
  validate(createReceiptSchema),
  createReceiptController,
);

/**
 * List receipts
 *
 * GET /api/receipts
 */
router.get("/", validate(listReceiptsSchema), listReceiptsController);

/**
 * Get receipt
 *
 * GET /api/receipts/:receiptId
 */
router.get("/:receiptId", validate(getReceiptSchema), getReceiptController);

/**
 * Link receipt to a financial transaction
 *
 * PATCH /api/receipts/:receiptId/link
 */
router.patch(
  "/:receiptId/link",
  validate(linkReceiptSchema),
  linkReceiptController,
);

/**
 * Unlink receipt from a financial transaction
 *
 * PATCH /api/receipts/:receiptId/unlink
 */
router.patch(
  "/:receiptId/unlink",
  validate(unlinkReceiptSchema),
  unlinkReceiptController,
);

/**
 * Restore receipt
 *
 * PATCH /api/receipts/:receiptId/restore
 */
router.patch(
  "/:receiptId/restore",
  validate(restoreReceiptSchema),
  restoreReceiptController,
);

/**
 * Soft delete receipt
 *
 * DELETE /api/receipts/:receiptId
 */
router.delete(
  "/:receiptId",
  validate(deleteReceiptSchema),
  deleteReceiptController,
);

export default router;
