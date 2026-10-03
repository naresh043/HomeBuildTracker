import { z } from "zod";

import { VENDOR_STATUS, VENDOR_TYPE } from "./vendor.types";

export const vendorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Vendor name is required")
    .max(100, "Vendor name must be 100 characters or less"),

  type: z.enum([
    VENDOR_TYPE.CONTRACTOR,
    VENDOR_TYPE.MATERIAL_SUPPLIER,
    VENDOR_TYPE.SERVICE_PROVIDER,
    VENDOR_TYPE.OTHER,
  ]),

  status: z.enum([VENDOR_STATUS.ACTIVE, VENDOR_STATUS.INACTIVE]),

  phone: z
    .string()
    .trim()
    .max(20, "Phone number must be 20 characters or less")
    .optional()
    .or(z.literal("")),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(150, "Email must be 150 characters or less")
    .optional()
    .or(z.literal("")),

  address: z
    .string()
    .trim()
    .max(300, "Address must be 300 characters or less")
    .optional()
    .or(z.literal("")),

  notes: z
    .string()
    .trim()
    .max(500, "Notes must be 500 characters or less")
    .optional()
    .or(z.literal("")),
});

export type VendorFormValues = z.infer<typeof vendorSchema>;

export const createVendorSchema = vendorSchema.omit({
  status: true,
});

export type CreateVendorFormValues = z.infer<typeof createVendorSchema>;

export const updateVendorSchema = vendorSchema.partial();

export type UpdateVendorFormValues = z.infer<typeof updateVendorSchema>;
