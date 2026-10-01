import { z } from "zod";
import {
  CONTRACT_RATE_UNIT,
  CONTRACT_STATUS,
  CONTRACT_TYPE,
} from "../constants/contract";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

const dateSchema = z.coerce.date();

const moneySchema = z.number().finite().min(0, "Amount cannot be negative");

const positiveMoneySchema = z
  .number()
  .finite()
  .positive("Amount must be greater than zero");

const optionalStringArraySchema = z
  .array(z.string().trim().min(1).max(500))
  .max(100)
  .optional();

const contractTypeSchema = z.enum(
  Object.values(CONTRACT_TYPE) as [
    (typeof CONTRACT_TYPE)[keyof typeof CONTRACT_TYPE],
    ...(typeof CONTRACT_TYPE)[keyof typeof CONTRACT_TYPE][],
  ],
);

const rateUnitSchema = z.enum(
  Object.values(CONTRACT_RATE_UNIT) as [
    (typeof CONTRACT_RATE_UNIT)[keyof typeof CONTRACT_RATE_UNIT],
    ...(typeof CONTRACT_RATE_UNIT)[keyof typeof CONTRACT_RATE_UNIT][],
  ],
);

const contractStatusSchema = z.enum(
  Object.values(CONTRACT_STATUS) as [
    (typeof CONTRACT_STATUS)[keyof typeof CONTRACT_STATUS],
    ...(typeof CONTRACT_STATUS)[keyof typeof CONTRACT_STATUS][],
  ],
);

const baseContractFields = {
  vendorId: objectIdSchema,

  contractType: contractTypeSchema,

  rate: positiveMoneySchema,

  rateUnit: rateUnitSchema,

  measurement: z.number().finite().positive().optional(),

  advanceAmount: moneySchema.default(0),

  scopeIncluded: optionalStringArraySchema,

  scopeExcluded: optionalStringArraySchema,

  startDate: dateSchema,

  status: contractStatusSchema.optional(),

  notes: z.string().trim().max(5000).optional(),
};

export const createContractSchema = z.object({
  body: z.object(baseContractFields).superRefine((data, ctx) => {
    if (
      data.rateUnit !== CONTRACT_RATE_UNIT.LUMP_SUM &&
      data.measurement === undefined
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["measurement"],
        message: "Measurement is required for this rate unit",
      });
    }

    if (
      data.rateUnit === CONTRACT_RATE_UNIT.LUMP_SUM &&
      data.measurement !== undefined
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["measurement"],
        message: "Measurement is not allowed for a lump-sum contract",
      });
    }
  }),

  params: z.object({}),

  query: z.object({}),
});

export const listContractsSchema = z.object({
  body: z.object({}),

  params: z.object({}),

  query: z.object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(20),

    q: z.string().trim().max(100).optional(),

    vendorId: objectIdSchema.optional(),

    contractType: contractTypeSchema.optional(),

    rateUnit: rateUnitSchema.optional(),

    status: contractStatusSchema.optional(),

    fromDate: dateSchema.optional(),

    toDate: dateSchema.optional(),

    minAmount: moneySchema.optional(),

    maxAmount: moneySchema.optional(),

    includeDeleted: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .default(false),
  }),
});

export const getContractSchema = z.object({
  body: z.object({}),

  params: z.object({
    contractId: objectIdSchema,
  }),

  query: z.object({}),
});

export const updateContractSchema = z.object({
  body: z
    .object({
      vendorId: objectIdSchema.optional(),

      contractType: contractTypeSchema.optional(),

      rate: positiveMoneySchema.optional(),

      rateUnit: rateUnitSchema.optional(),

      measurement: z.number().finite().positive().nullable().optional(),

      advanceAmount: moneySchema.optional(),

      scopeIncluded: optionalStringArraySchema,

      scopeExcluded: optionalStringArraySchema,

      startDate: dateSchema.optional(),

      status: contractStatusSchema.optional(),

      notes: z.string().trim().max(5000).nullable().optional(),
    })
    .superRefine((data, ctx) => {
      if (
        data.rateUnit === CONTRACT_RATE_UNIT.LUMP_SUM &&
        data.measurement !== undefined &&
        data.measurement !== null
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["measurement"],
          message: "Measurement is not allowed for a lump-sum contract",
        });
      }
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      "At least one field must be provided for update",
    ),

  params: z.object({
    contractId: objectIdSchema,
  }),

  query: z.object({}),
});

export const deleteContractSchema = getContractSchema;

export const restoreContractSchema = getContractSchema;

export const contractSummarySchema = getContractSchema;
