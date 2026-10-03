import { z } from "zod";

export const constructionStageStatusSchema = z.enum([
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
  "ON_HOLD",
]);

const validateStageDates = (
  values: {
    startDate?: string;
    completionDate?: string;
  },
  ctx: z.RefinementCtx,
) => {
  const startDate = values.startDate?.trim();
  const completionDate = values.completionDate?.trim();

  if (startDate && completionDate && completionDate < startDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["completionDate"],
      message: "Completion date cannot be earlier than start date",
    });
  }
};

export const createStageSchema = z
  .object({
    name: z.string().trim().min(1, "Stage name is required"),

    description: z.string().trim().optional(),

    status: constructionStageStatusSchema,

    order: z
      .number({
        required_error: "Stage order is required",
        invalid_type_error: "Stage order must be a number",
      })
      .int("Stage order must be a whole number")
      .positive("Stage order must be greater than 0"),

    startDate: z.string().trim().optional(),

    completionDate: z.string().trim().optional(),

    notes: z.string().trim().optional(),
  })
  .superRefine((values, ctx) => {
    if (
      values.status === "COMPLETED" &&
      !values.completionDate?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["completionDate"],
        message: "Completion date is required when stage is completed",
      });
    }

    validateStageDates(values, ctx);
  });

export const updateStageSchema = z
  .object({
    name: z.string().trim().min(1, "Stage name is required").optional(),

    status: constructionStageStatusSchema.optional(),

    completionDate: z.string().trim().optional(),

    notes: z.string().trim().optional(),
  })
  .superRefine((values, ctx) => {
    if (
      values.status === "COMPLETED" &&
      !values.completionDate?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["completionDate"],
        message: "Completion date is required when stage is completed",
      });
    }
  });

export const reorderStagesSchema = z.object({
  stageIds: z
    .array(z.string().trim().min(1, "Stage ID is required"))
    .min(1, "At least one stage is required"),
});

export type CreateStageFormValues = z.infer<typeof createStageSchema>;

export type UpdateStageFormValues = z.infer<typeof updateStageSchema>;

export type ReorderStagesFormValues = z.infer<typeof reorderStagesSchema>;