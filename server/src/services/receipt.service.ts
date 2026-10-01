import { Types } from "mongoose";
import cloudinary from "../config/cloudinary";

import { Receipt } from "../models/Receipt";
import {
  RECEIPT_FILE_TYPE,
  RECEIPT_MAX_FILE_SIZE_BYTES,
  type ReceiptSourceType,
} from "../constants/receipt";
import { ApiError } from "../utils/ApiError";
import { Payment } from "../models/Payment";
import { MaterialReceipt } from "../models/MaterialReceipt";
import { Expense } from "../models/Expense";

interface UploadReceiptInput {
  buffer: Buffer;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  sourceType: ReceiptSourceType;
  uploadedBy: Types.ObjectId;
}

interface ListReceiptsInput {
  page: number;
  limit: number;
  sourceType?: ReceiptSourceType;
  fileType?: "IMAGE" | "PDF";
  fromDate?: Date;
  toDate?: Date;
  includeDeleted?: boolean;
}

interface LinkReceiptInput {
  receiptId: string;
  paymentId?: string;
  materialReceiptId?: string;
  expenseId?: string;
}

const getFileType = (mimeType: string) => {
  if (mimeType === "application/pdf") {
    return RECEIPT_FILE_TYPE.PDF;
  }

  if (mimeType.startsWith("image/")) {
    return RECEIPT_FILE_TYPE.IMAGE;
  }

  throw new ApiError(
    422,
    "Only image and PDF files are supported",
    "INVALID_FILE_TYPE",
  );
};

const validateFile = (buffer: Buffer, mimeType: string, sizeBytes: number) => {
  if (!buffer || buffer.length === 0) {
    throw new ApiError(422, "Receipt file is empty", "EMPTY_FILE");
  }

  if (sizeBytes > RECEIPT_MAX_FILE_SIZE_BYTES) {
    throw new ApiError(
      422,
      "Receipt file cannot exceed 10 MB",
      "FILE_TOO_LARGE",
    );
  }

  getFileType(mimeType);
};

const getCloudinaryResourceType = (mimeType: string) => {
  return mimeType === "application/pdf" ? "raw" : "image";
};

const uploadToCloudinary = async (
  buffer: Buffer,
  originalFileName: string,
  mimeType: string,
) => {
  const resourceType = getCloudinaryResourceType(mimeType);

  const safeBaseName =
    originalFileName
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "receipt";

  const publicId = `home-build-tracker/receipts/${Date.now()}-${safeBaseName}`;

  return new Promise<{
    secureUrl: string;
    publicId: string;
  }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        public_id: publicId,
        overwrite: false,
        use_filename: false,
        unique_filename: false,
        type: "upload",
      },
      (error, result) => {
        if (error || !result) {
          return reject(
            new ApiError(
              502,
              "Failed to upload receipt to cloud storage",
              "CLOUDINARY_UPLOAD_FAILED",
            ),
          );
        }

        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    uploadStream.end(buffer);
  });
};

const deleteFromCloudinary = async (
  publicId: string,
  fileType: "IMAGE" | "PDF",
) => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: fileType === "PDF" ? "raw" : "image",
      invalidate: true,
    });
  } catch {
    // Cloud deletion failure should not expose provider details.
    // The database operation remains the source of truth.
  }
};

export const createReceipt = async (input: UploadReceiptInput) => {
  validateFile(input.buffer, input.mimeType, input.sizeBytes);

  const fileType = getFileType(input.mimeType);

  let uploadedFile: {
    secureUrl: string;
    publicId: string;
  };

  try {
    uploadedFile = await uploadToCloudinary(
      input.buffer,
      input.originalFileName,
      input.mimeType,
    );
  } catch (error) {
    throw error;
  }

  try {
    const receipt = await Receipt.create({
      fileUrl: uploadedFile.secureUrl,
      publicId: uploadedFile.publicId,
      fileType,
      sourceType: input.sourceType,
      originalFileName: input.originalFileName,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      uploadedBy: input.uploadedBy,
      isDeleted: false,
    });

    return receipt;
  } catch (error) {
    await deleteFromCloudinary(uploadedFile.publicId, fileType);

    throw error;
  }
};

export const listReceipts = async (input: ListReceiptsInput) => {
  const {
    page,
    limit,
    sourceType,
    fileType,
    fromDate,
    toDate,
    includeDeleted = false,
  } = input;

  const filter: Record<string, unknown> = {};

  if (!includeDeleted) {
    filter.isDeleted = false;
  }

  if (sourceType) {
    filter.sourceType = sourceType;
  }

  if (fileType) {
    filter.fileType = fileType;
  }

  if (fromDate || toDate) {
    const createdAt: Record<string, Date> = {};

    if (fromDate) {
      createdAt.$gte = fromDate;
    }

    if (toDate) {
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);
      createdAt.$lte = endDate;
    }

    filter.createdAt = createdAt;
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Receipt.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),

    Receipt.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getReceiptById = async (receiptId: string) => {
  if (!Types.ObjectId.isValid(receiptId)) {
    throw new ApiError(400, "Invalid receipt ID", "INVALID_RECEIPT_ID");
  }

  const receipt = await Receipt.findOne({
    _id: receiptId,
    isDeleted: false,
  });

  if (!receipt) {
    throw new ApiError(404, "Receipt not found", "RECEIPT_NOT_FOUND");
  }

  return receipt;
};

export const linkReceipt = async (input: LinkReceiptInput) => {
  const receipt = await getReceiptById(input.receiptId);

  if (!input.paymentId && !input.materialReceiptId && !input.expenseId) {
    throw new ApiError(
      422,
      "At least one transaction ID is required",
      "TRANSACTION_ID_REQUIRED",
    );
  }

  if (input.paymentId) {
    const payment = await Payment.findOne({
      _id: input.paymentId,
      isDeleted: false,
    });

    if (!payment) {
      throw new ApiError(404, "Payment not found", "PAYMENT_NOT_FOUND");
    }

    payment.receiptId = receipt._id;
    await payment.save();
  }

  if (input.materialReceiptId) {
    const materialReceipt = await MaterialReceipt.findOne({
      _id: input.materialReceiptId,
      isDeleted: false,
    });

    if (!materialReceipt) {
      throw new ApiError(
        404,
        "Material receipt not found",
        "MATERIAL_RECEIPT_NOT_FOUND",
      );
    }

    materialReceipt.receiptId = receipt._id;
    await materialReceipt.save();
  }

  if (input.expenseId) {
    const expense = await Expense.findOne({
      _id: input.expenseId,
      isDeleted: false,
    });

    if (!expense) {
      throw new ApiError(404, "Expense not found", "EXPENSE_NOT_FOUND");
    }

    expense.receiptId = receipt._id;
    await expense.save();
  }

  return receipt;
};

export const unlinkReceipt = async (input: LinkReceiptInput) => {
  const receipt = await getReceiptById(input.receiptId);

  if (!input.paymentId && !input.materialReceiptId && !input.expenseId) {
    throw new ApiError(
      422,
      "At least one transaction ID is required",
      "TRANSACTION_ID_REQUIRED",
    );
  }

  if (input.paymentId) {
    const payment = await Payment.findOne({
      _id: input.paymentId,
      receiptId: receipt._id,
      isDeleted: false,
    });

    if (!payment) {
      throw new ApiError(
        404,
        "Payment with this receipt link was not found",
        "RECEIPT_LINK_NOT_FOUND",
      );
    }

    payment.receiptId = undefined;
    await payment.save();
  }

  if (input.materialReceiptId) {
    const materialReceipt = await MaterialReceipt.findOne({
      _id: input.materialReceiptId,
      receiptId: receipt._id,
      isDeleted: false,
    });

    if (!materialReceipt) {
      throw new ApiError(
        404,
        "Material receipt with this receipt link was not found",
        "RECEIPT_LINK_NOT_FOUND",
      );
    }

    materialReceipt.receiptId = undefined;
    await materialReceipt.save();
  }

  if (input.expenseId) {
    const expense = await Expense.findOne({
      _id: input.expenseId,
      receiptId: receipt._id,
      isDeleted: false,
    });

    if (!expense) {
      throw new ApiError(
        404,
        "Expense with this receipt link was not found",
        "RECEIPT_LINK_NOT_FOUND",
      );
    }

    expense.receiptId = undefined;
    await expense.save();
  }

  return receipt;
};

export const deleteReceipt = async (receiptId: string) => {
  const receipt = await getReceiptById(receiptId);

  receipt.isDeleted = true;
  await receipt.save();

  return receipt;
};

export const restoreReceipt = async (receiptId: string) => {
  if (!Types.ObjectId.isValid(receiptId)) {
    throw new ApiError(400, "Invalid receipt ID", "INVALID_RECEIPT_ID");
  }

  const receipt = await Receipt.findOne({
    _id: receiptId,
    isDeleted: true,
  });

  if (!receipt) {
    throw new ApiError(404, "Deleted receipt not found", "RECEIPT_NOT_FOUND");
  }

  receipt.isDeleted = false;
  await receipt.save();

  return receipt;
};
