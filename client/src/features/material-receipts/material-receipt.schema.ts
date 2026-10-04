import { z } from "zod";

import { MATERIAL_UNIT } from "@/features/materials/material.types";

const materialUnitSchema = z.enum(Object.values(MATERIAL_UNIT) as [
  (typeof MATERIAL_UNIT)[keyof typeof MATERIAL_UNIT],
  ...(typeof MATERIAL_UNIT)[keyof typeof MATERIAL_UNIT][],
]);

const dateSchema = z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid date");

export const materialReceiptFormSchema = z.object({
  vendorId: z.string().trim().min(1, "Select a vendor"),
  materialId: z.string().trim().min(1, "Select a material"),
  stageId: z.string().trim().min(1, "Select a construction stage"),
  date: dateSchema,
  quantity: z.coerce
    .number()
    .positive("Quantity must be greater than 0")
    .max(1_000_000_000, "Quantity cannot exceed 1,000,000,000"),
  unit: materialUnitSchema,
  unitPrice: z.coerce
    .number()
    .nonnegative("Unit price cannot be negative")
    .max(100_000_000, "Unit price cannot exceed ₹100,000,000"),
  notes: z.string().trim().max(1000, "Notes must not exceed 1000 characters"),
});

export type MaterialReceiptFormValues = z.infer<typeof materialReceiptFormSchema>;
