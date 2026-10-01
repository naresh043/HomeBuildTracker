import { z } from "zod";

import { CONSTRUCTION_STAGE_STATUS } from "../constants/construction";

/*
=====================================================
MONGODB OBJECT ID
=====================================================
*/

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ObjectId");

/*
=====================================================
EMPTY REQUEST PARTS
=====================================================
*/

const emptyBodySchema = z.preprocess(
  (value) => value ?? {},
  z.object({}).strict(),
);

const emptyParamsSchema = z.preprocess(
  (value) => value ?? {},
  z.object({}).strict(),
);

const emptyQuerySchema = z.preprocess(
  (value) => value ?? {},
  z.object({}).strict(),
);

/*
=====================================================
STAGE FIELDS
=====================================================
*/

const stageStatusSchema = z.enum([
  CONSTRUCTION_STAGE_STATUS.NOT_STARTED,
  CONSTRUCTION_STAGE_STATUS.IN_PROGRESS,
  CONSTRUCTION_STAGE_STATUS.COMPLETED,
  CONSTRUCTION_STAGE_STATUS.ON_HOLD,
]);

const stageNameSchema = z
  .string()
  .trim()
  .min(2, "Construction stage name must be at least 2 characters")
  .max(150, "Construction stage name cannot exceed 150 characters");

const stageDescriptionSchema = z
  .string()
  .trim()
  .max(500, "Construction stage description cannot exceed 500 characters");

const stageNotesSchema = z
  .string()
  .trim()
  .max(2000, "Construction stage notes cannot exceed 2000 characters");

const stageOrderSchema = z
  .number()
  .int("Stage order must be an integer")
  .min(1, "Stage order must be at least 1");

/*
=====================================================
CREATE STAGE BODY
=====================================================
*/

const createStageBodySchema = z
  .object({
    name: stageNameSchema,

    description: stageDescriptionSchema.optional(),

    status: stageStatusSchema.default(CONSTRUCTION_STAGE_STATUS.NOT_STARTED),

    order: stageOrderSchema,

    startDate: z.coerce.date().optional(),

    completionDate: z.coerce.date().optional(),

    notes: stageNotesSchema.optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    /*
    =================================================
    DATE VALIDATION
    =================================================
    */

    if (
      data.startDate &&
      data.completionDate &&
      data.completionDate < data.startDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["completionDate"],
        message: "Completion date cannot be earlier than start date",
      });
    }

    /*
    =================================================
    COMPLETED STAGE VALIDATION
    =================================================
    */

    if (
      data.status === CONSTRUCTION_STAGE_STATUS.COMPLETED &&
      !data.completionDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["completionDate"],
        message: "Completion date is required when stage status is COMPLETED",
      });
    }
  });

/*
=====================================================
CREATE CONSTRUCTION STAGE
=====================================================

Expected request:

POST /api/stages

{
  "body": {
    "name": "Foundation",
    "status": "NOT_STARTED",
    "order": 1
  },
  "params": {},
  "query": {}
}

The actual HTTP request body is only the
stage fields. The validation middleware wraps it
inside { body, params, query }.
=====================================================
*/

export const createStageSchema = z
  .object({
    body: createStageBodySchema,

    params: emptyParamsSchema,

    query: emptyQuerySchema,
  })
  .strict();

/*
=====================================================
UPDATE STAGE BODY
=====================================================
*/

const updateStageBodySchema = z
  .object({
    name: stageNameSchema.optional(),

    description: stageDescriptionSchema.nullable().optional(),

    status: stageStatusSchema.optional(),

    order: stageOrderSchema.optional(),

    startDate: z.coerce.date().nullable().optional(),

    completionDate: z.coerce.date().nullable().optional(),

    notes: stageNotesSchema.nullable().optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    /*
    =================================================
    DATE VALIDATION
    =================================================
    */

    if (
      data.startDate &&
      data.completionDate &&
      data.completionDate < data.startDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["completionDate"],
        message: "Completion date cannot be earlier than start date",
      });
    }

    /*
    =================================================
    COMPLETED STATUS VALIDATION
    =================================================
    */

    if (
      data.status === CONSTRUCTION_STAGE_STATUS.COMPLETED &&
      data.completionDate === null
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["completionDate"],
        message: "Completion date cannot be removed from a completed stage",
      });
    }
  });

/*
=====================================================
UPDATE CONSTRUCTION STAGE
=====================================================

PATCH /api/stages/:stageId
=====================================================
*/

export const updateStageSchema = z
  .object({
    body: updateStageBodySchema,

    params: z.object({
      stageId: objectIdSchema,
    }),

    query: emptyQuerySchema,
  })
  .strict();

/*
=====================================================
STAGE ID PARAMETER
=====================================================
*/

export const stageIdParamSchema = z
  .object({
    body: emptyBodySchema,

    params: z.object({
      stageId: objectIdSchema,
    }),

    query: emptyQuerySchema,
  })
  .strict();

/*
=====================================================
REORDER STAGES BODY
=====================================================

The client sends:

{
  "stageIds": [
    "66...",
    "67...",
    "68..."
  ]
}

The service verifies:

1. Every ID is valid.
2. No ID is duplicated.
3. All active stages are included.
4. No deleted stage is included.
=====================================================
*/

const reorderStagesBodySchema = z
  .object({
    stageIds: z
      .array(objectIdSchema)
      .min(1, "At least one stage ID is required"),
  })
  .strict()
  .superRefine((data, ctx) => {
    const uniqueIds = new Set(data.stageIds);

    if (uniqueIds.size !== data.stageIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["stageIds"],
        message: "Duplicate stage IDs are not allowed",
      });
    }
  });

/*
=====================================================
REORDER STAGES
=====================================================
*/

export const reorderStagesSchema = z
  .object({
    body: reorderStagesBodySchema,

    params: emptyParamsSchema,

    query: emptyQuerySchema,
  })
  .strict();

/*
=====================================================
STAGE LIST QUERY
=====================================================

GET /api/stages

Supported:

?status=IN_PROGRESS

?includeDeleted=true
=====================================================
*/

const stageListQueryFieldsSchema = z
  .object({
    status: stageStatusSchema.optional(),

    includeDeleted: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .default(false),
  })
  .strict();

/*
=====================================================
STAGE LIST
=====================================================
*/

export const stageListQuerySchema = z
  .object({
    body: emptyBodySchema,

    params: emptyParamsSchema,

    query: stageListQueryFieldsSchema,
  })
  .strict();

/*
=====================================================
EXPORTED TYPES
=====================================================
*/

export type CreateStageInput = z.infer<typeof createStageBodySchema>;

export type UpdateStageInput = z.infer<typeof updateStageBodySchema>;

export type StageIdParamInput = z.infer<typeof stageIdParamSchema>;

export type ReorderStagesInput = z.infer<typeof reorderStagesBodySchema>;

export type StageListQueryInput = z.infer<typeof stageListQueryFieldsSchema>;
