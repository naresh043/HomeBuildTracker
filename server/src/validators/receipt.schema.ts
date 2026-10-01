// src/validators/receipt.schema.ts

import { z } from "zod";
import { RECEIPT_SOURCE_TYPE } from "../constants/receipt";

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ObjectId");

const emptyObjectSchema = z.object({}).default({});

const sourceTypeSchema = z.enum(
  Object.values(RECEIPT_SOURCE_TYPE) as [
    (typeof RECEIPT_SOURCE_TYPE)[keyof typeof RECEIPT_SOURCE_TYPE],
    ...(typeof RECEIPT_SOURCE_TYPE)[keyof typeof RECEIPT_SOURCE_TYPE][],
  ],
);

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const createReceiptSchema = z.object({
  body: z.object({
    sourceType: sourceTypeSchema,
  }),

  params: emptyObjectSchema,

  query: emptyObjectSchema,
});

export const listReceiptsSchema = z.object({
  body: emptyObjectSchema,

  params: emptyObjectSchema,

  query: paginationSchema.extend({
    sourceType: sourceTypeSchema.optional(),

    fileType: z
      .enum(["IMAGE", "PDF"])
      .optional(),

    fromDate: z.coerce.date().optional(),

    toDate: z.coerce.date().optional(),

    includeDeleted: z.coerce.boolean().default(false),
  }),
});

export const getReceiptSchema = z.object({
  body: emptyObjectSchema,

  params: z.object({
    receiptId: objectIdSchema,
  }),

  query: emptyObjectSchema,
});

export const deleteReceiptSchema = z.object({
  body: emptyObjectSchema,

  params: z.object({
    receiptId: objectIdSchema,
  }),

  query: emptyObjectSchema,
});

export const restoreReceiptSchema = z.object({
  body: emptyObjectSchema,

  params: z.object({
    receiptId: objectIdSchema,
  }),

  query: emptyObjectSchema,
});

export const linkReceiptSchema = z.object({
  body: z
    .object({
      paymentId: objectIdSchema.optional(),
      materialReceiptId: objectIdSchema.optional(),
      expenseId: objectIdSchema.optional(),
    })
    .refine(
      (data) =>
        Boolean(
          data.paymentId ||
            data.materialReceiptId ||
            data.expenseId,
        ),
      {
        message: "At least one transaction ID is required",
      },
    ),

  params: z.object({
    receiptId: objectIdSchema,
  }),

  query: emptyObjectSchema,
});

export const unlinkReceiptSchema = z.object({
  body: z
    .object({
      paymentId: objectIdSchema.optional(),
      materialReceiptId: objectIdSchema.optional(),
      expenseId: objectIdSchema.optional(),
    })
    .refine(
      (data) =>
        Boolean(
          data.paymentId ||
            data.materialReceiptId ||
            data.expenseId,
        ),
      {
        message: "At least one transaction ID is required",
      },
    ),

  params: z.object({
    receiptId: objectIdSchema,
  }),

  query: emptyObjectSchema,
}); 