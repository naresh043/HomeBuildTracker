// src/validators/material.schema.ts

import { z } from "zod";
import { MATERIAL_UNIT } from "../constants/material";

const materialUnitSchema = z.enum(
  Object.values(MATERIAL_UNIT) as [string, ...string[]],
);

const materialIdSchema = z.object({
  materialId: z.string().trim().min(1, "Material ID is required"),
});

const emptyQuerySchema = z.preprocess((value) => value ?? {}, z.object({}));

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  q: z.string().trim().max(100).optional(),

  category: z.string().trim().max(100).optional(),

  includeDeleted: z
    .preprocess((value) => {
      if (value === undefined) return undefined;

      if (value === "true") return true;
      if (value === "false") return false;

      return value;
    }, z.boolean())
    .default(false),
});

export const createMaterialSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Material name must be at least 2 characters")
      .max(150, "Material name cannot exceed 150 characters"),

    category: z
      .string()
      .trim()
      .min(1, "Material category is required")
      .max(100, "Material category cannot exceed 100 characters"),

    defaultUnit: materialUnitSchema,
  }),

  params: emptyQuerySchema,

  query: emptyQuerySchema,
});

export const listMaterialsSchema = z.object({
  body: emptyQuerySchema,

  params: emptyQuerySchema,

  query: paginationSchema,
});

export const getMaterialSchema = z.object({
  body: emptyQuerySchema,

  params: materialIdSchema,

  query: emptyQuerySchema,
});

export const updateMaterialSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Material name must be at least 2 characters")
        .max(150, "Material name cannot exceed 150 characters")
        .optional(),

      category: z
        .string()
        .trim()
        .min(1, "Material category is required")
        .max(100, "Material category cannot exceed 100 characters")
        .optional(),

      defaultUnit: materialUnitSchema.optional(),
    })
    .refine(
      (data) =>
        data.name !== undefined ||
        data.category !== undefined ||
        data.defaultUnit !== undefined,
      {
        message: "At least one field is required for update",
      },
    ),

  params: materialIdSchema,

  query: emptyQuerySchema,
});

export const deleteMaterialSchema = z.object({
  body: emptyQuerySchema,

  params: materialIdSchema,

  query: emptyQuerySchema,
});

export const restoreMaterialSchema = z.object({
  body: emptyQuerySchema,

  params: materialIdSchema,

  query: emptyQuerySchema,
});
