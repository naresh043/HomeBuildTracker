import { isValid, parse } from "date-fns";
import { z } from "zod";

export const houseInitializeSchema = z.object({
  confirm: z.literal(true),
});

export const houseUpdateSchema = z.object({
  name: z.string().trim().min(1, "House name is required").optional(),

  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]).optional(),

  startDate: z
    .string()
    .min(1, "Construction start date is required")
    .optional(),

  budgetMin: z.number().nonnegative("Minimum budget cannot be negative").safe("Minimum budget is too large").optional(),

  budgetMax: z.number().nonnegative("Maximum budget cannot be negative").safe("Maximum budget is too large").optional(),
}).superRefine((data, ctx) => {
  if (data.startDate !== undefined && !isValid(parse(data.startDate, "yyyy-MM-dd", new Date()))) ctx.addIssue({ code: "custom", path: ["startDate"], message: "Enter a valid start date" });
  if (data.budgetMin !== undefined && data.budgetMax !== undefined && data.budgetMin > data.budgetMax) {
    ctx.addIssue({ code: "custom", path: ["budgetMin"], message: "Minimum budget cannot exceed maximum budget" });
  }
});

export const currentStageSchema = z.object({
  stageId: z.string().trim().min(1, "Construction stage is required"),
});

export type HouseInitializeFormValues = z.infer<typeof houseInitializeSchema>;

export type HouseUpdateFormValues = z.infer<typeof houseUpdateSchema>;

export type CurrentStageFormValues = z.infer<typeof currentStageSchema>;
