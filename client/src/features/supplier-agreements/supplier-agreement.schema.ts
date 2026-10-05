import { isValid, parse } from "date-fns";
import { z } from "zod";
import { SUPPLIER_AGREEMENT_STATUS } from "./supplier-agreement.types";

const statusSchema = z.enum(Object.values(SUPPLIER_AGREEMENT_STATUS) as [
  (typeof SUPPLIER_AGREEMENT_STATUS)[keyof typeof SUPPLIER_AGREEMENT_STATUS],
  ...(typeof SUPPLIER_AGREEMENT_STATUS)[keyof typeof SUPPLIER_AGREEMENT_STATUS][],
]);

export const supplierAgreementFormSchema = z.object({
  vendorId: z.string().min(1, "Select an active material supplier"),
  materialIds: z.array(z.string().min(1)).min(1, "Select at least one material").max(100, "An agreement cannot contain more than 100 materials").refine((ids) => new Set(ids).size === ids.length, "Duplicate materials are not allowed"),
  advanceAmount: z.coerce.number().finite().min(0, "Advance cannot be negative").max(100_000_000, "Advance cannot exceed ₹10 crore"),
  startDate: z.string().refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && isValid(parse(value, "yyyy-MM-dd", new Date())), "Select a valid start date"),
  status: statusSchema,
  notes: z.string().max(2000, "Notes cannot exceed 2000 characters"),
});

export type SupplierAgreementFormValues = z.input<typeof supplierAgreementFormSchema>;
