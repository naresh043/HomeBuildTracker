import { z } from "zod";

export const expenseSchema = z.object({
  date: z.string().min(1, "Expense date is required"),
  amount: z
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a number",
    })
    .finite("Amount must be a valid number")
    .positive("Amount must be greater than ₹0")
    .max(100_000_000, "Expense amount cannot exceed ₹10 crore"),
  category: z.enum([
    "TRANSPORT",
    "WATER",
    "ELECTRICITY",
    "TOOLS",
    "MISC",
  ]),
  method: z.enum(["CASH", "UPI", "BANK", "CHEQUE", "OTHER"]),
  stageId: z.string().optional(),
  notes: z.string().trim().max(1000, "Notes cannot exceed 1000 characters"),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
