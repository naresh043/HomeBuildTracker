import { z } from "zod";
import { SUPPLIER_AGREEMENT_STATUS } from "../constants/supplierAgreement";

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ObjectId");

const dateSchema = z.coerce.date({
  error: "Invalid date",
});

const moneySchema = z
  .number()
  .finite()
  .min(0, "Amount cannot be negative")
  .max(100_000_000, "Amount cannot exceed ₹10 crore");

const statusSchema = z.enum(SUPPLIER_AGREEMENT_STATUS);

const materialIdsSchema = z
  .array(objectIdSchema)
  .min(1, "At least one material is required")
  .max(100, "An agreement cannot contain more than 100 materials")
  .refine(
    (ids) => new Set(ids).size === ids.length,
    "Duplicate material IDs are not allowed",
  );

export const createSupplierAgreementSchema = z.object({
  body: z.object({
    vendorId: objectIdSchema,

    materialIds: materialIdsSchema,

    advanceAmount: moneySchema.default(0),

    startDate: dateSchema,

    status: statusSchema.default("ACTIVE"),

    notes: z
      .string()
      .trim()
      .max(2000, "Notes cannot exceed 2000 characters")
      .optional(),
  }),

  params: z.object({}),

  query: z.object({}),
});

export const listSupplierAgreementsSchema = z.object({
  body: z.object({}),

  params: z.object({}),

  query: z.object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(20),

    vendorId: objectIdSchema.optional(),

    status: statusSchema.optional(),

    fromDate: dateSchema.optional(),

    toDate: dateSchema.optional(),

    q: z.string().trim().max(100).optional(),

    includeDeleted: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .default(false),
  }),
});

export const getSupplierAgreementSchema = z.object({
  body: z.object({}),

  params: z.object({
    agreementId: objectIdSchema,
  }),

  query: z.object({
    includeDeleted: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .default(false),
  }),
});

export const updateSupplierAgreementSchema = z.object({
  body: z
    .object({
      vendorId: objectIdSchema.optional(),

      materialIds: materialIdsSchema.optional(),

      advanceAmount: moneySchema.optional(),

      startDate: dateSchema.optional(),

      status: statusSchema.optional(),

      notes: z
        .string()
        .trim()
        .max(2000, "Notes cannot exceed 2000 characters")
        .nullable()
        .optional(),
    })
    .refine(
      (body) => Object.keys(body).length > 0,
      "At least one field is required for update",
    ),

  params: z.object({
    agreementId: objectIdSchema,
  }),

  query: z.object({}),
});

export const deleteSupplierAgreementSchema = z.object({
  body: z.object({}),

  params: z.object({
    agreementId: objectIdSchema,
  }),

  query: z.object({}),
});

export const restoreSupplierAgreementSchema = z.object({
  body: z.object({}),

  params: z.object({
    agreementId: objectIdSchema,
  }),

  query: z.object({}),
});

export const supplierAgreementSummarySchema = z.object({
  body: z.object({}),

  params: z.object({
    agreementId: objectIdSchema,
  }),

  query: z.object({}),
});
