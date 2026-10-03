import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";

import type { Payment } from "@/features/payments/payment.types";
import {
  paymentSchema,
  type PaymentFormValues,
} from "@/features/payments/payment.schema";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_TYPE_LABELS,
} from "@/features/payments/payment.utils";

interface PaymentFormOption {
  id: string;
  name: string;
}

interface PaymentFormPlaceholderProps {
  payment: Payment | null;
  vendors: PaymentFormOption[];
  stages: PaymentFormOption[];
  currentUserId: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: PaymentFormValues) => Promise<void>;
}

const getToday = (): string => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getInitialValues = (
  payment: Payment | null,
  currentUserId: string,
): PaymentFormValues => {
  if (payment) {
    return {
      date: payment.date.slice(0, 10),
      amount: payment.amount,
      paidByUserId: payment.paidByUserId,
      paidToVendorId: payment.paidToVendorId,
      stageId: payment.stageId,
      paymentType: payment.paymentType,
      method: payment.method,
      upiApp: payment.upiApp ?? undefined,
      transactionReference:
        payment.transactionReference ?? undefined,
      relatedContractId:
        payment.relatedContractId ?? undefined,
      relatedSupplierAgreementId:
        payment.relatedSupplierAgreementId ?? undefined,
      notes: payment.notes ?? undefined,
    };
  }

  return {
    date: getToday(),
    amount: 0,
    paidByUserId: currentUserId,
    paidToVendorId: "",
    stageId: "",
    paymentType: "ADVANCE",
    method: "CASH",
    upiApp: undefined,
    transactionReference: undefined,
    relatedContractId: undefined,
    relatedSupplierAgreementId: undefined,
    notes: undefined,
  };
};

export default function PaymentFormPlaceholder({
  payment,
  vendors,
  stages,
  currentUserId,
  isSubmitting,
  onClose,
  onSubmit,
}: PaymentFormPlaceholderProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: getInitialValues(payment, currentUserId),
  });

  const selectedMethod = watch("method");

  useEffect(() => {
    reset(getInitialValues(payment, currentUserId));
  }, [payment, currentUserId, reset]);

  const submitForm = async (values: PaymentFormValues) => {
    await onSubmit(values);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-background shadow-xl sm:max-h-[90vh] sm:rounded-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold">
              {payment ? "Edit Payment" : "Add Payment"}
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              {payment
                ? "Update the construction payment details."
                : "Record a payment made during house construction."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close payment form"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(submitForm)}
          className="min-h-0 flex-1 overflow-y-auto"
        >
          <div className="space-y-5 p-4 sm:p-6">
            {/* Payment date */}
            <div>
              <label
                htmlFor="payment-date"
                className="mb-1.5 block text-sm font-medium"
              >
                Payment Date
              </label>

              <input
                id="payment-date"
                type="date"
                {...register("date")}
                disabled={isSubmitting}
                className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
              />

              {errors.date && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.date.message}
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label
                htmlFor="payment-amount"
                className="mb-1.5 block text-sm font-medium"
              >
                Amount
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  ₹
                </span>

                <input
                  id="payment-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  {...register("amount", {
                    valueAsNumber: true,
                  })}
                  disabled={isSubmitting}
                  className="h-11 w-full rounded-lg border bg-background pl-8 pr-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {errors.amount && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.amount.message}
                </p>
              )}
            </div>

            {/* Vendor */}
            <div>
              <label
                htmlFor="payment-vendor"
                className="mb-1.5 block text-sm font-medium"
              >
                Vendor
              </label>

              <select
                id="payment-vendor"
                {...register("paidToVendorId")}
                disabled={isSubmitting}
                className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">Select vendor</option>

                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>

              {errors.paidToVendorId && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.paidToVendorId.message}
                </p>
              )}

              {vendors.length === 0 && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  No vendors are currently available.
                </p>
              )}
            </div>

            {/* Construction stage */}
            <div>
              <label
                htmlFor="payment-stage"
                className="mb-1.5 block text-sm font-medium"
              >
                Construction Stage
              </label>

              <select
                id="payment-stage"
                {...register("stageId")}
                disabled={isSubmitting}
                className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">Select construction stage</option>

                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>

              {errors.stageId && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.stageId.message}
                </p>
              )}

              {stages.length === 0 && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  No construction stages are currently available.
                </p>
              )}
            </div>

            {/* Payment type */}
            <div>
              <label
                htmlFor="payment-type"
                className="mb-1.5 block text-sm font-medium"
              >
                Payment Type
              </label>

              <select
                id="payment-type"
                {...register("paymentType")}
                disabled={isSubmitting}
                className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {(
                  Object.keys(PAYMENT_TYPE_LABELS) as PaymentFormValues["paymentType"][]
                ).map((type) => (
                  <option key={type} value={type}>
                    {PAYMENT_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>

              {errors.paymentType && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.paymentType.message}
                </p>
              )}
            </div>

            {/* Payment method */}
            <div>
              <label
                htmlFor="payment-method"
                className="mb-1.5 block text-sm font-medium"
              >
                Payment Method
              </label>

              <select
                id="payment-method"
                {...register("method")}
                disabled={isSubmitting}
                className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {(
                  Object.keys(PAYMENT_METHOD_LABELS) as PaymentFormValues["method"][]
                ).map((method) => (
                  <option key={method} value={method}>
                    {PAYMENT_METHOD_LABELS[method]}
                  </option>
                ))}
              </select>

              {errors.method && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.method.message}
                </p>
              )}
            </div>

            {/* UPI fields */}
            {selectedMethod === "UPI" && (
              <div className="space-y-5 rounded-xl border bg-muted/30 p-4">
                <div>
                  <p className="text-sm font-semibold">
                    UPI Payment Details
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Enter the UPI app and transaction reference for this
                    payment.
                  </p>
                </div>

                {/* UPI app */}
                <div>
                  <label
                    htmlFor="payment-upi-app"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    UPI App
                  </label>

                  <select
                    id="payment-upi-app"
                    {...register("upiApp")}
                    disabled={isSubmitting}
                    className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">Select UPI app</option>
                    <option value="PHONEPE">PhonePe</option>
                    <option value="GOOGLE_PAY">Google Pay</option>
                    <option value="PAYTM">Paytm</option>
                    <option value="BHIM">BHIM</option>
                    <option value="OTHER">Other</option>
                  </select>

                  {errors.upiApp && (
                    <p className="mt-1.5 text-xs text-destructive">
                      {errors.upiApp.message}
                    </p>
                  )}
                </div>

                {/* Transaction reference */}
                <div>
                  <label
                    htmlFor="payment-transaction-reference"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Transaction Reference
                  </label>

                  <input
                    id="payment-transaction-reference"
                    type="text"
                    placeholder="Enter UPI transaction reference"
                    {...register("transactionReference")}
                    disabled={isSubmitting}
                    className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  {errors.transactionReference && (
                    <p className="mt-1.5 text-xs text-destructive">
                      {errors.transactionReference.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label
                htmlFor="payment-notes"
                className="mb-1.5 block text-sm font-medium"
              >
                Notes
              </label>

              <textarea
                id="payment-notes"
                rows={4}
                placeholder="Add any notes about this payment..."
                {...register("notes")}
                disabled={isSubmitting}
                className="w-full resize-none rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
              />

              {errors.notes && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.notes.message}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex shrink-0 gap-3 border-t bg-background p-4 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-11 flex-1 rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 flex-1 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Saving..."
                : payment
                  ? "Update Payment"
                  : "Save Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}