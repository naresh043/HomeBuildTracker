import { z } from "zod";

import { HOUSE_STATUS } from "../constants/house";

/*
=====================================================
ROOM SCHEMA
=====================================================
*/

const houseRoomSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Room name is required")
      .max(100, "Room name cannot exceed 100 characters"),
  })
  .strict();

/*
=====================================================
FLOOR SCHEMA
=====================================================
*/

const houseFloorSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Floor name is required")
      .max(100, "Floor name cannot exceed 100 characters"),

    rooms: z
      .array(houseRoomSchema)
      .default([]),
  })
  .strict();

/*
=====================================================
CREATE HOUSE BODY
=====================================================
*/

const createHouseBodySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "House name must be at least 2 characters")
      .max(
        150,
        "House name cannot exceed 150 characters",
      ),

    location: z
      .string()
      .trim()
      .max(
        300,
        "Location cannot exceed 300 characters",
      )
      .optional(),

    startDate: z.coerce.date(),

    status: z.enum([
      HOUSE_STATUS.NOT_STARTED,
      HOUSE_STATUS.IN_PROGRESS,
      HOUSE_STATUS.COMPLETED,
    ]),

    floors: z
      .array(houseFloorSchema)
      .min(
        1,
        "At least one floor is required",
      ),

    budgetMin: z
      .number()
      .int(
        "Minimum budget must be an integer number of paise",
      )
      .nonnegative(
        "Minimum budget cannot be negative",
      ),

    budgetMax: z
      .number()
      .int(
        "Maximum budget must be an integer number of paise",
      )
      .nonnegative(
        "Maximum budget cannot be negative",
      ),

    workingBudget: z
      .number()
      .int(
        "Working budget must be an integer number of paise",
      )
      .nonnegative(
        "Working budget cannot be negative",
      )
      .optional(),

    currentStageId: z
      .string()
      .regex(
        /^[a-f\d]{24}$/i,
        "Current stage ID must be a valid MongoDB ObjectId",
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.budgetMin > data.budgetMax) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["budgetMin"],
        message:
          "Minimum budget cannot be greater than maximum budget",
      });
    }

    if (
      data.workingBudget !== undefined &&
      data.workingBudget < data.budgetMin
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["workingBudget"],
        message:
          "Working budget cannot be less than minimum budget",
      });
    }

    if (
      data.workingBudget !== undefined &&
      data.workingBudget > data.budgetMax
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["workingBudget"],
        message:
          "Working budget cannot be greater than maximum budget",
      });
    }
  });

/*
=====================================================
CREATE HOUSE REQUEST
=====================================================
*/

export const createHouseSchema = z.object({
  body: createHouseBodySchema,

  params: z.object({}),

  query: z.object({}),
});

/*
=====================================================
UPDATE HOUSE BODY
=====================================================
*/

const updateHouseBodySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "House name must be at least 2 characters")
      .max(
        150,
        "House name cannot exceed 150 characters",
      )
      .optional(),

    location: z
      .string()
      .trim()
      .max(
        300,
        "Location cannot exceed 300 characters",
      )
      .optional(),

    startDate: z.coerce.date().optional(),

    status: z
      .enum([
        HOUSE_STATUS.NOT_STARTED,
        HOUSE_STATUS.IN_PROGRESS,
        HOUSE_STATUS.COMPLETED,
      ])
      .optional(),

    floors: z
      .array(houseFloorSchema)
      .min(
        1,
        "At least one floor is required",
      )
      .optional(),

    budgetMin: z
      .number()
      .int(
        "Minimum budget must be an integer number of paise",
      )
      .nonnegative(
        "Minimum budget cannot be negative",
      )
      .optional(),

    budgetMax: z
      .number()
      .int(
        "Maximum budget must be an integer number of paise",
      )
      .nonnegative(
        "Maximum budget cannot be negative",
      )
      .optional(),

    workingBudget: z
      .number()
      .int(
        "Working budget must be an integer number of paise",
      )
      .nonnegative(
        "Working budget cannot be negative",
      )
      .nullable()
      .optional(),

    currentStageId: z
      .string()
      .regex(
        /^[a-f\d]{24}$/i,
        "Current stage ID must be a valid MongoDB ObjectId",
      )
      .nullable()
      .optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (
      data.budgetMin !== undefined &&
      data.budgetMax !== undefined &&
      data.budgetMin > data.budgetMax
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["budgetMin"],
        message:
          "Minimum budget cannot be greater than maximum budget",
      });
    }

    if (
      data.budgetMin !== undefined &&
      data.workingBudget !== undefined &&
      data.workingBudget !== null &&
      data.workingBudget < data.budgetMin
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["workingBudget"],
        message:
          "Working budget cannot be less than minimum budget",
      });
    }

    if (
      data.budgetMax !== undefined &&
      data.workingBudget !== undefined &&
      data.workingBudget !== null &&
      data.workingBudget > data.budgetMax
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["workingBudget"],
        message:
          "Working budget cannot be greater than maximum budget",
      });
    }
  });

/*
=====================================================
UPDATE HOUSE REQUEST
=====================================================
*/

export const updateHouseSchema = z.object({
  body: updateHouseBodySchema,

  params: z.object({}),

  query: z.object({}),
});

/*
=====================================================
EXPORTED TYPES
=====================================================
*/

export type CreateHouseInput =
  z.infer<typeof createHouseBodySchema>;

export type UpdateHouseInput =
  z.infer<typeof updateHouseBodySchema>;