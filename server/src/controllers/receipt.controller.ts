import { RequestHandler } from "express";

import {
  createReceipt,
  deleteReceipt,
  getReceiptById,
  getReceiptPdfPreview,
  linkReceipt,
  listReceipts,
  restoreReceipt,
  unlinkReceipt,
} from "../services/receipt.service";
import { ApiError } from "../utils/ApiError";
import { successResponse } from "../utils/response";

export const createReceiptController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    if (!req.file) {
      return next(
        new ApiError(422, "Receipt file is required", "FILE_REQUIRED"),
      );
    }

    if (!req.user) {
      return next(
        new ApiError(401, "Authentication required", "UNAUTHENTICATED"),
      );
    }

    const receipt = await createReceipt({
      buffer: req.file.buffer,
      originalFileName: req.file.originalname,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      sourceType: req.body.sourceType,
      uploadedBy: req.user._id,
    });

    return res
      .status(201)
      .json(successResponse(receipt, "Receipt uploaded successfully"));
  } catch (error) {
    return next(error);
  }
};

export const listReceiptsController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const validated = (req as any).validated;

    const result = await listReceipts(validated.query);

    return res.json(successResponse(result, "Receipts fetched successfully"));
  } catch (error) {
    return next(error);
  }
};

export const getReceiptController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const validated = (req as any).validated;

    const receipt = await getReceiptById(validated.params.receiptId);

    return res.json(successResponse(receipt, "Receipt fetched successfully"));
  } catch (error) {
    return next(error);
  }
};

export const getReceiptPdfPreviewController: RequestHandler = async (req, res, next) => {
  try {
    const validated = (req as any).validated;
    const { body, filename } = await getReceiptPdfPreview(validated.params.receiptId);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    });
    return res.send(body);
  } catch (error) {
    return next(error);
  }
};

export const linkReceiptController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const validated = (req as any).validated;

    const receipt = await linkReceipt({
      receiptId: validated.params.receiptId,
      paymentId: validated.body.paymentId,
      materialReceiptId: validated.body.materialReceiptId,
      expenseId: validated.body.expenseId,
    });

    return res.json(
      successResponse(receipt, "Receipt linked successfully"),
    );
  } catch (error) {
    return next(error);
  }
};

export const unlinkReceiptController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const validated = (req as any).validated;

    const receipt = await unlinkReceipt({
      receiptId: validated.params.receiptId,
      paymentId: validated.body.paymentId,
      materialReceiptId: validated.body.materialReceiptId,
      expenseId: validated.body.expenseId,
    });

    return res.json(
      successResponse(receipt, "Receipt unlinked successfully"),
    );
  } catch (error) {
    return next(error);
  }
};

export const deleteReceiptController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const validated = (req as any).validated;

    const receipt = await deleteReceipt(validated.params.receiptId);

    return res.json(
      successResponse(receipt, "Receipt deleted successfully"),
    );
  } catch (error) {
    return next(error);
  }
};

export const restoreReceiptController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const validated = (req as any).validated;

    const receipt = await restoreReceipt(validated.params.receiptId);

    return res.json(
      successResponse(receipt, "Receipt restored successfully"),
    );
  } catch (error) {
    return next(error);
  }
};
