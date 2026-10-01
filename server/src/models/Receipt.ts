// src/models/Receipt.ts

import { Document, Schema, Types, model } from "mongoose";
import {
  RECEIPT_FILE_TYPE,
  RECEIPT_SOURCE_TYPE,
  type ReceiptFileType,
  type ReceiptSourceType,
} from "../constants/receipt";

export interface IReceipt extends Document {
  fileUrl: string;
  publicId: string;

  fileType: ReceiptFileType;
  sourceType: ReceiptSourceType;

  originalFileName: string;
  mimeType: string;
  sizeBytes: number;

  uploadedBy: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;

  isDeleted: boolean;
}

const receiptSchema = new Schema<IReceipt>(
  {
    fileUrl: {
      type: String,
      required: [true, "Receipt file URL is required"],
      trim: true,
    },

    publicId: {
      type: String,
      required: [true, "Receipt public ID is required"],
      trim: true,
      index: true,
    },

    fileType: {
      type: String,
      enum: {
        values: Object.values(RECEIPT_FILE_TYPE),
        message: "Invalid receipt file type",
      },
      required: [true, "Receipt file type is required"],
    },

    sourceType: {
      type: String,
      enum: {
        values: Object.values(RECEIPT_SOURCE_TYPE),
        message: "Invalid receipt source type",
      },
      required: [true, "Receipt source type is required"],
    },

    originalFileName: {
      type: String,
      required: [true, "Original file name is required"],
      trim: true,
      maxlength: [255, "Original file name cannot exceed 255 characters"],
    },

    mimeType: {
      type: String,
      required: [true, "MIME type is required"],
      trim: true,
    },

    sizeBytes: {
      type: Number,
      required: [true, "Receipt file size is required"],
      min: [1, "Receipt file size must be greater than zero"],
    },

    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Uploaded by user is required"],
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/**
 * Frequently used query:
 * fetch active receipts uploaded by a particular user.
 */
receiptSchema.index({
  uploadedBy: 1,
  isDeleted: 1,
  createdAt: -1,
});

/**
 * Frequently used query:
 * receipt vault ordered by newest first.
 */
receiptSchema.index({
  isDeleted: 1,
  createdAt: -1,
});

export const Receipt = model<IReceipt>("Receipt", receiptSchema);
