import { z } from "zod";

import { MATERIAL_UNIT } from "../constants/material";
import { MATERIAL_RECEIPT_VERIFICATION_STATUS } from "../models/MaterialReceipt";

/* =========================================================
   COMMON SCHEMAS
========================================================= */

const emptySchema = z.preprocess((value) => value ?? {}, z.object({}));

const materialReceiptIdSchema = z.object({
  materialReceiptId: z
    .string()
    .trim()
    .min(1, "Material receipt ID is required"),
});

const materialUnitSchema = z.enum(
  Object.values(MATERIAL_UNIT) as [string, ...string[]],
);

const verificationStatusSchema = z.enum(
  Object.values(MATERIAL_RECEIPT_VERIFICATION_STATUS) as [string, ...string[]],
);

/* =========================================================
   REUSABLE FIELD SCHEMAS
========================================================= */

const objectIdSchema = (fieldName: string) =>
  z.string().trim().min(1, `${fieldName} is required`);

const quantitySchema = z
  .number()
  .finite()
  .positive("Quantity must be greater than zero")
  .max(1_000_000_000, "Quantity is too large");

const moneyInRupeesSchema = z
  .number()
  .finite()
  .min(0, "Amount cannot be negative")
  .max(100_000_000, "Amount cannot exceed ₹10 crore");

const dateSchema = z.coerce.date();

/* =========================================================
   CREATE
========================================================= */

export const createMaterialReceiptSchema = z.object({
  body: z.object({
    vendorId: objectIdSchema("Vendor ID"),

    materialId: objectIdSchema("Material ID"),

    stageId: objectIdSchema("Stage ID"),

    date: dateSchema,

    quantity: quantitySchema,

    unit: materialUnitSchema,

    /*
     * API accepts rupees.
     *
     * Example:
     * 420 = ₹420
     *
     * Service converts it to:
     * 42000 paise
     */
    unitPrice: moneyInRupeesSchema,

    /*
     * Receipt is optional because the
     * Receipt module is being implemented
     * separately.
     */
    receiptId: z
      .string()
      .trim()
      .min(1, "Receipt ID cannot be empty")
      .optional(),

    agreementId: z
      .string()
      .trim()
      .min(1, "Agreement ID cannot be empty")
      .optional(),

    notes: z
      .string()
      .trim()
      .max(1000, "Notes cannot exceed 1000 characters")
      .optional(),

    verificationStatus: verificationStatusSchema.optional(),
  }),

  params: emptySchema,

  query: emptySchema,
});

/* =========================================================
   LIST
========================================================= */

export const listMaterialReceiptsSchema = z.object({
  body: emptySchema,

  params: emptySchema,

  query: z.object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(20),

    q: z.string().trim().max(100).optional(),

    vendorId: z.string().trim().min(1).optional(),

    materialId: z.string().trim().min(1).optional(),

    stageId: z.string().trim().min(1).optional(),

    verificationStatus: verificationStatusSchema.optional(),

    fromDate: z.string().trim().optional(),

    toDate: z.string().trim().optional(),

    includeDeleted: z
      .preprocess((value) => {
        if (value === undefined) {
          return undefined;
        }

        if (value === "true") {
          return true;
        }

        if (value === "false") {
          return false;
        }

        return value;
      }, z.boolean())
      .default(false),
  }),
});

/* =========================================================
   GET BY ID
========================================================= */

export const getMaterialReceiptSchema = z.object({
  body: emptySchema,

  params: materialReceiptIdSchema,

  query: z.object({
    includeDeleted: z
      .preprocess((value) => {
        if (value === undefined) {
          return undefined;
        }

        if (value === "true") {
          return true;
        }

        if (value === "false") {
          return false;
        }

        return value;
      }, z.boolean())
      .default(false),
  }),
});

/* =========================================================
   UPDATE
========================================================= */

export const updateMaterialReceiptSchema = z.object({
  body: z
    .object({
      vendorId: z.string().trim().min(1).optional(),

      materialId: z.string().trim().min(1).optional(),

      stageId: z.string().trim().min(1).optional(),

      date: dateSchema.optional(),

      quantity: quantitySchema.optional(),

      unit: materialUnitSchema.optional(),

      unitPrice: moneyInRupeesSchema.optional(),

      /*
       * null allows removing the
       * receipt reference.
       */
      receiptId: z.string().trim().min(1).nullable().optional(),

      /*
       * null allows removing the
       * agreement reference.
       */
      agreementId: z.string().trim().min(1).nullable().optional(),

      /*
       * null allows clearing notes.
       */
      notes: z
        .string()
        .trim()
        .max(1000, "Notes cannot exceed 1000 characters")
        .nullable()
        .optional(),

      verificationStatus: verificationStatusSchema.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required for update",
    }),

  params: materialReceiptIdSchema,

  query: emptySchema,
});

/* =========================================================
   DELETE
========================================================= */

export const deleteMaterialReceiptSchema = z.object({
  body: emptySchema,

  params: materialReceiptIdSchema,

  query: emptySchema,
});

/* =========================================================
   RESTORE
========================================================= */

export const restoreMaterialReceiptSchema = z.object({
  body: emptySchema,

  params: materialReceiptIdSchema,

  query: emptySchema,
});

/* =========================================================
   VERIFY
========================================================= */

export const verifyMaterialReceiptSchema = z.object({
  body: emptySchema,

  params: materialReceiptIdSchema,

  query: emptySchema,
});
