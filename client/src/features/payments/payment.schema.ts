import { z } from "zod";

export const paymentSchema = z
  .object({
    date: z.string().min(1, "Payment date is required"),

    amount: z
      .number({
        required_error: "Amount is required",
        invalid_type_error: "Amount must be a number",
      })
      .positive("Amount must be greater than ₹0"),

    paidByUserId: z.string().min(1, "Paid by user is required"),

    paidToVendorId: z.string().min(1, "Vendor is required"),

    stageId: z.string().min(1, "Construction stage is required"),

    paymentType: z.enum([
      "ADVANCE",
      "MATERIAL_PAYMENT",
      "CONTRACT_PAYMENT",
      "SERVICE_PAYMENT",
      "OTHER",
    ]),

    method: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CHEQUE"]),

    upiApp: z
      .enum(["PHONEPE", "GOOGLE_PAY", "PAYTM", "BHIM", "OTHER"])
      .optional(),

    transactionReference: z.string().trim().optional(),

    relatedContractId: z.string().trim().optional(),

    relatedSupplierAgreementId: z.string().trim().optional(),

    notes: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.method === "UPI") {
      if (!data.upiApp) {
        ctx.addIssue({
          code: "custom",
          path: ["upiApp"],
          message: "UPI app is required for UPI payments",
        });
      }

      if (!data.transactionReference) {
        ctx.addIssue({
          code: "custom",
          path: ["transactionReference"],
          message: "Transaction reference is required for UPI payments",
        });
      }
    }

    if (data.method !== "UPI") {
      if (data.upiApp) {
        ctx.addIssue({
          code: "custom",
          path: ["upiApp"],
          message: "UPI app is only allowed for UPI payments",
        });
      }

      if (data.transactionReference) {
        ctx.addIssue({
          code: "custom",
          path: ["transactionReference"],
          message: "Transaction reference is only allowed for UPI payments",
        });
      }
    }
  });

export type PaymentFormValues = z.infer<typeof paymentSchema>;
