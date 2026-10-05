import { z } from "zod";
import { CONTRACT_RATE_UNIT, CONTRACT_STATUS, CONTRACT_TYPE } from "./contract.types";

const enumSchema = <T extends Record<string, string>>(values: T) => z.enum(Object.values(values) as [T[keyof T], ...T[keyof T][]]);
export const contractFormSchema = z.object({
  vendorId: z.string().min(1, "Select an active vendor"),
  contractType: enumSchema(CONTRACT_TYPE),
  rate: z.coerce.number().finite().positive("Rate must be greater than zero"),
  rateUnit: enumSchema(CONTRACT_RATE_UNIT),
  measurement: z.union([z.coerce.number().finite().positive("Measurement must be greater than zero"), z.literal("")]),
  advanceAmount: z.coerce.number().finite().nonnegative("Advance cannot be negative"),
  scopeIncluded: z.array(z.string().trim().min(1)).max(100),
  scopeExcluded: z.array(z.string().trim().min(1)).max(100),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Select a start date"),
  status: enumSchema(CONTRACT_STATUS),
  notes: z.string().max(5000, "Notes must not exceed 5000 characters"),
}).superRefine((values, ctx) => {
  if (values.rateUnit === "LUMP_SUM" && values.measurement !== "") ctx.addIssue({ code: "custom", path: ["measurement"], message: "Measurement is not allowed for a lump-sum contract" });
  if (values.rateUnit !== "LUMP_SUM" && values.measurement === "") ctx.addIssue({ code: "custom", path: ["measurement"], message: "Measurement is required for this rate unit" });
  if (values.measurement !== "" && values.advanceAmount > values.rate * values.measurement) ctx.addIssue({ code: "custom", path: ["advanceAmount"], message: "Advance cannot exceed the estimated contract value" });
});
export type ContractFormValues = z.input<typeof contractFormSchema>;
