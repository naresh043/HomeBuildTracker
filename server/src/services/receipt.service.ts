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
  q?: string;
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

type ReceiptLinkedTransaction =
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

const validateFile = (
  buffer: Buffer,
  mimeType: string,
  sizeBytes: number,
) => {
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

/**
 * Escapes user input before it is used as a MongoDB regular expression.
 *
 * This prevents characters such as ".", "*", "+", "(", ")" etc.
 * from being interpreted as regular-expression operators.
 */
const escapeRegex = (value: string) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Determines which transaction a receipt is linked to.
 *
 * Application rule:
 * one receipt -> zero or one transaction
 *
 * Existing legacy data is handled defensively by checking all three
 * transaction collections. New links are prevented from creating
 * multiple relationships by linkReceipt().
 */
const findLinkedTransaction = async (
  receiptId: Types.ObjectId,
): Promise<ReceiptLinkedTransaction> => {
  const [payment, materialReceipt, expense] = await Promise.all([
    Payment.findOne({
      receiptId,
      isDeleted: false,
    })
      .select("_id paymentNo")
      .lean(),

    MaterialReceipt.findOne({
      receiptId,
      isDeleted: false,
    })
      .select("_id receiptNo")
      .lean(),

    Expense.findOne({
      receiptId,
      isDeleted: false,
    })
      .select("_id category")
      .lean(),
  ]);

  if (payment) {
    return {
      type: "payment",
      id: payment._id.toString(),
      label: payment.paymentNo,
    };
  }

  if (materialReceipt) {
    return {
      type: "materialReceipt",
      id: materialReceipt._id.toString(),
      label: materialReceipt.receiptNo,
    };
  }

  if (expense) {
    return {
      type: "expense",
      id: expense._id.toString(),
      label: expense.category,
    };
  }

  return null;
};

/**
 * Adds linkedTransaction to a single receipt.
 */
const serializeReceipt = async (receipt: any) => {
  const linkedTransaction = await findLinkedTransaction(receipt._id);

  return {
    ...receipt.toObject(),
    linkedTransaction,
  };
};

/**
 * Adds linkedTransaction to a receipt list using batched queries.
 *
 * This avoids running 3 database queries for every receipt.
 */
const serializeReceiptList = async (receipts: any[]) => {
  if (receipts.length === 0) {
    return [];
  }

  const receiptIds = receipts.map((receipt) => receipt._id);

  const [payments, materialReceipts, expenses] = await Promise.all([
    Payment.find({
      receiptId: { $in: receiptIds },
      isDeleted: false,
    })
      .select("_id paymentNo receiptId")
      .lean(),

    MaterialReceipt.find({
      receiptId: { $in: receiptIds },
      isDeleted: false,
    })
      .select("_id receiptNo receiptId")
      .lean(),

    Expense.find({
      receiptId: { $in: receiptIds },
      isDeleted: false,
    })
      .select("_id category receiptId")
      .lean(),
  ]);

  const linkedTransactions = new Map<
    string,
    ReceiptLinkedTransaction
  >();

  for (const payment of payments) {
    if (!payment.receiptId) {
      continue;
    }

    const receiptId = payment.receiptId.toString();

    if (!linkedTransactions.has(receiptId)) {
      linkedTransactions.set(receiptId, {
        type: "payment",
        id: payment._id.toString(),
        label: payment.paymentNo,
      });
    }
  }

  for (const materialReceipt of materialReceipts) {
    if (!materialReceipt.receiptId) {
      continue;
    }

    const receiptId = materialReceipt.receiptId.toString();

    if (!linkedTransactions.has(receiptId)) {
      linkedTransactions.set(receiptId, {
        type: "materialReceipt",
        id: materialReceipt._id.toString(),
        label: materialReceipt.receiptNo,
      });
    }
  }

  for (const expense of expenses) {
    if (!expense.receiptId) {
      continue;
    }

    const receiptId = expense.receiptId.toString();

    if (!linkedTransactions.has(receiptId)) {
      linkedTransactions.set(receiptId, {
        type: "expense",
        id: expense._id.toString(),
        label: expense.category,
      });
    }
  }

  return receipts.map((receipt) => ({
    ...receipt.toObject(),
    linkedTransaction:
      linkedTransactions.get(receipt._id.toString()) ?? null,
  }));
};

const getTransactionTargetCount = (input: LinkReceiptInput) => {
  return [
    input.paymentId,
    input.materialReceiptId,
    input.expenseId,
  ].filter(Boolean).length;
};

const validateExactlyOneTransaction = (input: LinkReceiptInput) => {
  const targetCount = getTransactionTargetCount(input);

  if (targetCount !== 1) {
    throw new ApiError(
      422,
      "Exactly one transaction ID is required",
      "EXACTLY_ONE_TRANSACTION_REQUIRED",
    );
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

    return {
      ...receipt.toObject(),
      linkedTransaction: null,
    };
  } catch (error) {
    await deleteFromCloudinary(uploadedFile.publicId, fileType);

    throw error;
  }
};

export const listReceipts = async (input: ListReceiptsInput) => {
  const {
    q,
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

  /*
   * Search receipt files by their original uploaded filename.
   *
   * Example:
   * q = "Naresh"
   * matches:
   * "Naresh Resume (2).pdf"
   *
   * The search is case-insensitive and the user input is escaped
   * before being used as a regular expression.
   */
  const normalizedQuery = q?.trim();

  if (normalizedQuery) {
    filter.originalFileName = {
      $regex: escapeRegex(normalizedQuery),
      $options: "i",
    };
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
    Receipt.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Receipt.countDocuments(filter),
  ]);

  const serializedItems = await serializeReceiptList(items);

  return {
    items: serializedItems,
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
    throw new ApiError(
      400,
      "Invalid receipt ID",
      "INVALID_RECEIPT_ID",
    );
  }

  const receipt = await Receipt.findOne({
    _id: receiptId,
    isDeleted: false,
  });

  if (!receipt) {
    throw new ApiError(
      404,
      "Receipt not found",
      "RECEIPT_NOT_FOUND",
    );
  }

  return serializeReceipt(receipt);
};

export const linkReceipt = async (input: LinkReceiptInput) => {
  validateExactlyOneTransaction(input);

  /*
   * We need the actual Receipt document here because we only need
   * its _id to assign to the target transaction.
   */
  if (!Types.ObjectId.isValid(input.receiptId)) {
    throw new ApiError(
      400,
      "Invalid receipt ID",
      "INVALID_RECEIPT_ID",
    );
  }

  const receipt = await Receipt.findOne({
    _id: input.receiptId,
    isDeleted: false,
  });

  if (!receipt) {
    throw new ApiError(
      404,
      "Receipt not found",
      "RECEIPT_NOT_FOUND",
    );
  }

  if (input.paymentId) {
    if (!Types.ObjectId.isValid(input.paymentId)) {
      throw new ApiError(
        400,
        "Invalid payment ID",
        "INVALID_PAYMENT_ID",
      );
    }

    const payment = await Payment.findOne({
      _id: input.paymentId,
      isDeleted: false,
    });

    if (!payment) {
      throw new ApiError(
        404,
        "Payment not found",
        "PAYMENT_NOT_FOUND",
      );
    }

    if (payment.receiptId) {
      throw new ApiError(
        409,
        "Payment is already linked to a receipt",
        "TRANSACTION_ALREADY_LINKED",
      );
    }

    payment.receiptId = receipt._id;
    await payment.save();
  }

  if (input.materialReceiptId) {
    if (!Types.ObjectId.isValid(input.materialReceiptId)) {
      throw new ApiError(
        400,
        "Invalid material receipt ID",
        "INVALID_MATERIAL_RECEIPT_ID",
      );
    }

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

    if (materialReceipt.receiptId) {
      throw new ApiError(
        409,
        "Material receipt is already linked to a receipt",
        "TRANSACTION_ALREADY_LINKED",
      );
    }

    materialReceipt.receiptId = receipt._id;
    await materialReceipt.save();
  }

  if (input.expenseId) {
    if (!Types.ObjectId.isValid(input.expenseId)) {
      throw new ApiError(
        400,
        "Invalid expense ID",
        "INVALID_EXPENSE_ID",
      );
    }

    const expense = await Expense.findOne({
      _id: input.expenseId,
      isDeleted: false,
    });

    if (!expense) {
      throw new ApiError(
        404,
        "Expense not found",
        "EXPENSE_NOT_FOUND",
      );
    }

    if (expense.receiptId) {
      throw new ApiError(
        409,
        "Expense is already linked to a receipt",
        "TRANSACTION_ALREADY_LINKED",
      );
    }

    expense.receiptId = receipt._id;
    await expense.save();
  }

  return serializeReceipt(receipt);
};

export const unlinkReceipt = async (input: LinkReceiptInput) => {
  validateExactlyOneTransaction(input);

  if (!Types.ObjectId.isValid(input.receiptId)) {
    throw new ApiError(
      400,
      "Invalid receipt ID",
      "INVALID_RECEIPT_ID",
    );
  }

  const receipt = await Receipt.findOne({
    _id: input.receiptId,
    isDeleted: false,
  });

  if (!receipt) {
    throw new ApiError(
      404,
      "Receipt not found",
      "RECEIPT_NOT_FOUND",
    );
  }

  if (input.paymentId) {
    if (!Types.ObjectId.isValid(input.paymentId)) {
      throw new ApiError(
        400,
        "Invalid payment ID",
        "INVALID_PAYMENT_ID",
      );
    }

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
    if (!Types.ObjectId.isValid(input.materialReceiptId)) {
      throw new ApiError(
        400,
        "Invalid material receipt ID",
        "INVALID_MATERIAL_RECEIPT_ID",
      );
    }

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
    if (!Types.ObjectId.isValid(input.expenseId)) {
      throw new ApiError(
        400,
        "Invalid expense ID",
        "INVALID_EXPENSE_ID",
      );
    }

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

  return serializeReceipt(receipt);
};

export const deleteReceipt = async (receiptId: string) => {
  const receipt = await getReceiptDocumentById(receiptId);

  receipt.isDeleted = true;
  await receipt.save();

  return serializeReceipt(receipt);
};

export const restoreReceipt = async (receiptId: string) => {
  if (!Types.ObjectId.isValid(receiptId)) {
    throw new ApiError(
      400,
      "Invalid receipt ID",
      "INVALID_RECEIPT_ID",
    );
  }

  const receipt = await Receipt.findOne({
    _id: receiptId,
    isDeleted: true,
  });

  if (!receipt) {
    throw new ApiError(
      404,
      "Deleted receipt not found",
      "RECEIPT_NOT_FOUND",
    );
  }

  receipt.isDeleted = false;
  await receipt.save();

  return serializeReceipt(receipt);
};

/**
 * Internal helper used by deleteReceipt because getReceiptById()
 * intentionally only returns active receipts.
 */
const getReceiptDocumentById = async (receiptId: string) => {
  if (!Types.ObjectId.isValid(receiptId)) {
    throw new ApiError(
      400,
      "Invalid receipt ID",
      "INVALID_RECEIPT_ID",
    );
  }

  const receipt = await Receipt.findOne({
    _id: receiptId,
    isDeleted: false,
  });

  if (!receipt) {
    throw new ApiError(
      404,
      "Receipt not found",
      "RECEIPT_NOT_FOUND",
    );
  }

  return receipt;
};