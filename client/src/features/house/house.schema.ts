import { z } from "zod";

export const houseInitializeSchema = z.object({
  name: z.string().trim().min(1, "House name is required"),

  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]),

  startDate: z.string().min(1, "Construction start date is required"),

  budgetMinPaise: z
    .number({
      required_error: "Minimum budget is required",
      invalid_type_error: "Minimum budget must be a number",
    })
    .nonnegative("Minimum budget cannot be negative")
    .optional(),

  budgetMaxPaise: z
    .number({
      required_error: "Maximum budget is required",
      invalid_type_error: "Maximum budget must be a number",
    })
    .nonnegative("Maximum budget cannot be negative")
    .optional(),
});

export const houseUpdateSchema = z.object({
  name: z.string().trim().min(1, "House name is required").optional(),

  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]).optional(),

  startDate: z
    .string()
    .min(1, "Construction start date is required")
    .optional(),

  budgetMin: z
    .number({
      invalid_type_error: "Minimum budget must be a number",
    })
    .nonnegative("Minimum budget cannot be negative")
    .optional(),

  budgetMax: z
    .number({
      invalid_type_error: "Maximum budget must be a number",
    })
    .nonnegative("Maximum budget cannot be negative")
    .optional(),
});

export const currentStageSchema = z.object({
  stageId: z.string().trim().min(1, "Construction stage is required"),
});

export type HouseInitializeFormValues = z.infer<typeof houseInitializeSchema>;

export type HouseUpdateFormValues = z.infer<typeof houseUpdateSchema>;

export type CurrentStageFormValues = z.infer<typeof currentStageSchema>;
