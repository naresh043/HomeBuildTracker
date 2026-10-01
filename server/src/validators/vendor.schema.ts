import { z } from "zod";

import { VENDOR_STATUS, VENDOR_TYPE } from "../constants/vendor";

/**
 * ============================================================
 * COMMON SCHEMAS
 * ============================================================
 */

const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-fA-F0-9]{24}$/, "Invalid vendor ID");

const emptyObjectSchema = z.preprocess(
  (value) => value ?? {},
  z.object({}).strict(),
);

const optionalTrimmedString = (max: number) =>
  z.string().trim().max(max).optional();

const phoneSchema = z
  .string()
  .trim()
  .min(7, "Phone number must contain at least 7 characters")
  .max(30, "Phone number cannot exceed 30 characters")
  .regex(/^[+0-9()\-.\s]+$/, "Phone number contains invalid characters");

/**
 * ============================================================
 * CREATE VENDOR
 * ============================================================
 */

export const createVendorBodySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Vendor name must be at least 2 characters")
      .max(150, "Vendor name cannot exceed 150 characters"),

    type: z.enum([
      VENDOR_TYPE.CONTRACTOR,
      VENDOR_TYPE.MATERIAL_SUPPLIER,
      VENDOR_TYPE.SERVICE_PROVIDER,
      VENDOR_TYPE.OTHER,
    ]),

    status: z
      .enum([VENDOR_STATUS.ACTIVE, VENDOR_STATUS.INACTIVE])
      .default(VENDOR_STATUS.ACTIVE),

    phone: phoneSchema.optional(),

    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .max(254, "Email cannot exceed 254 characters")
      .optional(),

    address: optionalTrimmedString(500),

    notes: optionalTrimmedString(2000),
  })
  .strict();

/**
 * ============================================================
 * UPDATE VENDOR
 * ============================================================
 *
 * Every field is optional because PATCH-style updates are
 * supported.
 *
 * name/type/status cannot be omitted from the validation
 * contract, but when supplied they must still be valid.
 */

export const updateVendorBodySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Vendor name must be at least 2 characters")
      .max(150, "Vendor name cannot exceed 150 characters")
      .optional(),

    type: z
      .enum([
        VENDOR_TYPE.CONTRACTOR,
        VENDOR_TYPE.MATERIAL_SUPPLIER,
        VENDOR_TYPE.SERVICE_PROVIDER,
        VENDOR_TYPE.OTHER,
      ])
      .optional(),

    status: z.enum([VENDOR_STATUS.ACTIVE, VENDOR_STATUS.INACTIVE]).optional(),

    phone: phoneSchema.optional(),

    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .max(254, "Email cannot exceed 254 characters")
      .optional(),

    address: optionalTrimmedString(500),

    notes: optionalTrimmedString(2000),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required to update a vendor",
  });

/**
 * ============================================================
 * VENDOR ID PARAMETER
 * ============================================================
 */

export const vendorIdParamsSchema = z
  .object({
    vendorId: objectIdSchema,
  })
  .strict();

/**
 * ============================================================
 * LIST VENDORS QUERY
 * ============================================================
 */

export const listVendorsQuerySchema = z
  .object({
    q: z
      .string()
      .trim()
      .max(150, "Search query cannot exceed 150 characters")
      .optional(),

    type: z
      .enum([
        VENDOR_TYPE.CONTRACTOR,
        VENDOR_TYPE.MATERIAL_SUPPLIER,
        VENDOR_TYPE.SERVICE_PROVIDER,
        VENDOR_TYPE.OTHER,
      ])
      .optional(),

    status: z.enum([VENDOR_STATUS.ACTIVE, VENDOR_STATUS.INACTIVE]).optional(),

    includeDeleted: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),

    page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1, "Limit must be at least 1")
      .max(100, "Limit cannot exceed 100")
      .default(20),

    sortBy: z
      .enum(["name", "type", "status", "createdAt", "updatedAt"])
      .default("createdAt"),

    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict();

/**
 * ============================================================
 * COMPLETE REQUEST SCHEMAS
 * ============================================================
 *
 * These schemas intentionally match the existing
 * validate.middleware.ts:
 *
 * validate(schema)
 *
 * where the middleware validates:
 *
 * {
 *   body: req.body,
 *   params: req.params,
 *   query: req.query
 * }
 */

/**
 * POST /api/vendors
 */
export const createVendorSchema = z
  .object({
    body: createVendorBodySchema,
    params: emptyObjectSchema,
    query: emptyObjectSchema,
  })
  .strict();

/**
 * GET /api/vendors
 */
export const listVendorsSchema = z
  .object({
    body: emptyObjectSchema,
    params: emptyObjectSchema,
    query: listVendorsQuerySchema,
  })
  .strict();

/**
 * GET /api/vendors/:vendorId
 */
export const getVendorSchema = z
  .object({
    body: emptyObjectSchema,
    params: vendorIdParamsSchema,
    query: emptyObjectSchema,
  })
  .strict();

/**
 * PATCH /api/vendors/:vendorId
 */
export const updateVendorSchema = z
  .object({
    body: updateVendorBodySchema,
    params: vendorIdParamsSchema,
    query: emptyObjectSchema,
  })
  .strict();

/**
 * DELETE /api/vendors/:vendorId
 *
 * DELETE performs a soft delete.
 */
export const deleteVendorSchema = z
  .object({
    body: emptyObjectSchema,
    params: vendorIdParamsSchema,
    query: emptyObjectSchema,
  })
  .strict();

/**
 * ============================================================
 * TYPES
 * ============================================================
 */

export type CreateVendorInput = z.infer<typeof createVendorBodySchema>;

export type UpdateVendorInput = z.infer<typeof updateVendorBodySchema>;

export type VendorIdParams = z.infer<typeof vendorIdParamsSchema>;

export type ListVendorsQuery = z.infer<typeof listVendorsQuerySchema>;
