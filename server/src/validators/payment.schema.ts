import { z } from "zod";

import {
  PAYMENT_METHOD,
  PAYMENT_TYPE,
  PAYMENT_VERIFICATION_STATUS,
  UPI_APP,
} from "../constants/payment";

/* =========================================================
   COMMON
========================================================= */

const emptySchema = z.preprocess(
  (value) => value ?? {},
  z.object({}),
);

const paymentIdSchema = z.object({
  paymentId: z
    .string()
    .trim()
    .min(1, "Payment ID is required"),
});

/* =========================================================
   ENUMS
========================================================= */

const paymentTypeSchema = z.enum(
  Object.values(PAYMENT_TYPE) as [
    string,
    ...string[],
  ],
);

const paymentMethodSchema = z.enum(
  Object.values(PAYMENT_METHOD) as [
    string,
    ...string[],
  ],
);

const upiAppSchema = z.enum(
  Object.values(UPI_APP) as [
    string,
    ...string[],
  ],
);

const verificationStatusSchema = z.enum(
  Object.values(
    PAYMENT_VERIFICATION_STATUS,
  ) as [string, ...string[]],
);

/* =========================================================
   REUSABLE FIELDS
========================================================= */

const objectIdSchema = (
  fieldName: string,
) =>
  z
    .string()
    .trim()
    .min(1, `${fieldName} is required`);

const moneyInRupeesSchema = z
  .number()
  .finite()
  .positive(
    "Payment amount must be greater than zero",
  )
  .max(
    100_000_000,
    "Payment amount cannot exceed ₹10 crore",
  );

const dateSchema = z.coerce.date();

const optionalString = (
  maxLength: number,
  fieldName: string,
) =>
  z
    .string()
    .trim()
    .max(
      maxLength,
      `${fieldName} cannot exceed ${maxLength} characters`,
    )
    .optional();

/* =========================================================
   CREATE PAYMENT
========================================================= */

export const createPaymentSchema =
  z.object({
    body: z
      .object({
        date: dateSchema,

        amount: moneyInRupeesSchema,

        paidByUserId: objectIdSchema(
          "Paid-by user ID",
        ),

        paidToVendorId:
          objectIdSchema(
            "Paid-to vendor ID",
          ).optional(),

        paymentType:
          paymentTypeSchema,

        method:
          paymentMethodSchema,

        upiApp:
          upiAppSchema.optional(),

        transactionReference:
          optionalString(
            200,
            "Transaction reference",
          ),

        relatedContractId:
          objectIdSchema(
            "Related contract ID",
          ).optional(),

        relatedSupplierAgreementId:
          objectIdSchema(
            "Related supplier agreement ID",
          ).optional(),

        stageId:
          objectIdSchema(
            "Stage ID",
          ).optional(),

        receiptId:
          objectIdSchema(
            "Receipt ID",
          ).optional(),

        notes:
          optionalString(
            1000,
            "Notes",
          ),

        verificationStatus:
          verificationStatusSchema.optional(),
      })
      .superRefine(
        (data, ctx) => {
          /*
           * UPI app only makes sense when
           * the payment method is UPI.
           */
          if (
            data.upiApp !== undefined &&
            data.method !== PAYMENT_METHOD.UPI
          ) {
            ctx.addIssue({
              code: "custom",
              path: ["upiApp"],
              message:
                "UPI app can only be provided for UPI payments",
            });
          }

          /*
           * If payment method is UPI,
           * require the UPI application.
           */
          if (
            data.method === PAYMENT_METHOD.UPI &&
            data.upiApp === undefined
          ) {
            ctx.addIssue({
              code: "custom",
              path: ["upiApp"],
              message:
                "UPI app is required for UPI payments",
            });
          }

          /*
           * A UPI payment should normally
           * have a transaction reference.
           */
          if (
            data.method === PAYMENT_METHOD.UPI &&
            !data.transactionReference
          ) {
            ctx.addIssue({
              code: "custom",
              path: [
                "transactionReference",
              ],
              message:
                "Transaction reference is required for UPI payments",
            });
          }

          /*
           * Contract payments should point
           * to the relevant contract.
           */
          if (
            data.paymentType ===
              PAYMENT_TYPE.CONTRACT_PAYMENT &&
            !data.relatedContractId
          ) {
            ctx.addIssue({
              code: "custom",
              path: [
                "relatedContractId",
              ],
              message:
                "Related contract ID is required for contract payments",
            });
          }

          /*
           * Material payments should identify
           * the vendor receiving the payment.
           */
          if (
            data.paymentType ===
              PAYMENT_TYPE.MATERIAL_PAYMENT &&
            !data.paidToVendorId
          ) {
            ctx.addIssue({
              code: "custom",
              path: [
                "paidToVendorId",
              ],
              message:
                "Paid-to vendor ID is required for material payments",
            });
          }

          /*
           * Service payments should identify
           * the service provider/vendor.
           */
          if (
            data.paymentType ===
              PAYMENT_TYPE.SERVICE_PAYMENT &&
            !data.paidToVendorId
          ) {
            ctx.addIssue({
              code: "custom",
              path: [
                "paidToVendorId",
              ],
              message:
                "Paid-to vendor ID is required for service payments",
            });
          }
        },
      ),

    params: emptySchema,

    query: emptySchema,
  });

/* =========================================================
   LIST PAYMENTS
========================================================= */

export const listPaymentsSchema =
  z.object({
    body: emptySchema,

    params: emptySchema,

    query: z.object({
      page: z
        .coerce
        .number()
        .int()
        .min(1)
        .default(1),

      limit: z
        .coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(20),

      q: z
        .string()
        .trim()
        .max(100)
        .optional(),

      fromDate: z
        .string()
        .trim()
        .optional(),

      toDate: z
        .string()
        .trim()
        .optional(),

      vendorId: z
        .string()
        .trim()
        .min(1)
        .optional(),

      paidByUserId: z
        .string()
        .trim()
        .min(1)
        .optional(),

      stageId: z
        .string()
        .trim()
        .min(1)
        .optional(),

      paymentType:
        paymentTypeSchema.optional(),

      method:
        paymentMethodSchema.optional(),

      verificationStatus:
        verificationStatusSchema.optional(),

      minAmount: z
        .coerce
        .number()
        .finite()
        .min(0)
        .optional(),

      maxAmount: z
        .coerce
        .number()
        .finite()
        .min(0)
        .optional(),

      hasReceipt:
        z
          .preprocess(
            (value) => {
              if (
                value === undefined
              ) {
                return undefined;
              }

              if (
                value === "true"
              ) {
                return true;
              }

              if (
                value === "false"
              ) {
                return false;
              }

              return value;
            },
            z.boolean(),
          )
          .optional(),

      includeDeleted:
        z
          .preprocess(
            (value) => {
              if (
                value === undefined
              ) {
                return undefined;
              }

              if (
                value === "true"
              ) {
                return true;
              }

              if (
                value === "false"
              ) {
                return false;
              }

              return value;
            },
            z.boolean(),
          )
          .default(false),
    }),
  });

/* =========================================================
   GET PAYMENT
========================================================= */

export const getPaymentSchema =
  z.object({
    body: emptySchema,

    params: paymentIdSchema,

    query: z.object({
      includeDeleted:
        z
          .preprocess(
            (value) => {
              if (
                value === undefined
              ) {
                return undefined;
              }

              if (
                value === "true"
              ) {
                return true;
              }

              if (
                value === "false"
              ) {
                return false;
              }

              return value;
            },
            z.boolean(),
          )
          .default(false),
    }),
  });

/* =========================================================
   UPDATE PAYMENT
========================================================= */

export const updatePaymentSchema =
  z.object({
    body: z
      .object({
        date:
          dateSchema.optional(),

        amount:
          moneyInRupeesSchema.optional(),

        paidByUserId:
          objectIdSchema(
            "Paid-by user ID",
          ).optional(),

        paidToVendorId:
          objectIdSchema(
            "Paid-to vendor ID",
          )
            .nullable()
            .optional(),

        paymentType:
          paymentTypeSchema.optional(),

        method:
          paymentMethodSchema.optional(),

        upiApp:
          upiAppSchema
            .nullable()
            .optional(),

        transactionReference:
          z
            .string()
            .trim()
            .max(
              200,
              "Transaction reference cannot exceed 200 characters",
            )
            .nullable()
            .optional(),

        relatedContractId:
          objectIdSchema(
            "Related contract ID",
          )
            .nullable()
            .optional(),

        relatedSupplierAgreementId:
          objectIdSchema(
            "Related supplier agreement ID",
          )
            .nullable()
            .optional(),

        stageId:
          objectIdSchema(
            "Stage ID",
          )
            .nullable()
            .optional(),

        receiptId:
          objectIdSchema(
            "Receipt ID",
          )
            .nullable()
            .optional(),

        notes:
          z
            .string()
            .trim()
            .max(
              1000,
              "Notes cannot exceed 1000 characters",
            )
            .nullable()
            .optional(),

        verificationStatus:
          verificationStatusSchema.optional(),
      })
      .refine(
        (data) =>
          Object.keys(data).length >
          0,
        {
          message:
            "At least one field is required for update",
        },
      ),

    params: paymentIdSchema,

    query: emptySchema,
  });

/* =========================================================
   DELETE PAYMENT
========================================================= */

export const deletePaymentSchema =
  z.object({
    body: emptySchema,

    params: paymentIdSchema,

    query: emptySchema,
  });

/* =========================================================
   RESTORE PAYMENT
========================================================= */

export const restorePaymentSchema =
  z.object({
    body: emptySchema,

    params: paymentIdSchema,

    query: emptySchema,
  });

/* =========================================================
   VERIFY PAYMENT
========================================================= */

export const verifyPaymentSchema =
  z.object({
    body: emptySchema,

    params: paymentIdSchema,

    query: emptySchema,
  });