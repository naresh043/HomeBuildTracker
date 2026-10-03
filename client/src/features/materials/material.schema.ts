import { z } from "zod";

import { MATERIAL_UNIT } from "./material.types";

const materialUnitSchema = z.enum(
  Object.values(MATERIAL_UNIT) as [
    (typeof MATERIAL_UNIT)[keyof typeof MATERIAL_UNIT],
    ...(typeof MATERIAL_UNIT)[keyof typeof MATERIAL_UNIT][],
  ],
);

export const createMaterialSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Material name is required")
    .max(100, "Material name must not exceed 100 characters"),

  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(100, "Category must not exceed 100 characters"),

  defaultUnit: materialUnitSchema,
});

export const updateMaterialSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Material name is required")
    .max(100, "Material name must not exceed 100 characters")
    .optional(),

  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(100, "Category must not exceed 100 characters")
    .optional(),

  defaultUnit: materialUnitSchema.optional(),
});

export type CreateMaterialFormValues = z.infer<typeof createMaterialSchema>;

export type UpdateMaterialFormValues = z.infer<typeof updateMaterialSchema>;
