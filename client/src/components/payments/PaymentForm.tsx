import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import type { Payment } from "@/features/payments/payment.types";
import { paymentSchema, type PaymentFormValues } from "@/features/payments/payment.schema";
import { PAYMENT_METHOD_LABELS, PAYMENT_TYPE_LABELS } from "@/features/payments/payment.utils";

interface PaymentOption { id: string; name: string; status?: string; isDeleted?: boolean; }
interface PaymentFormProps {
  payment: Payment | null;
  vendors: PaymentOption[];
  stages: PaymentOption[];
  currentUserId: string;
  isSubmitting: boolean;
  optionsLoading: boolean;
  optionsError?: string;
  onCancel: () => void;
  onSubmit: (values: PaymentFormValues) => void | Promise<void>;
}

const inputClass = "min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/10 disabled:cursor-not-allowed disabled:opacity-60";
const labelClass = "mb-1.5 block text-sm font-medium text-foreground";
const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

function initialValues(payment: Payment | null, currentUserId: string): PaymentFormValues {
  return {
    date: payment?.date.slice(0, 10) ?? today(),
    amount: payment?.amount ?? 0,
    paidByUserId: payment?.paidByUserId ?? currentUserId,
    paidToVendorId: payment?.paidToVendorId ?? "",
    stageId: payment?.stageId ?? "",
    paymentType: payment?.paymentType ?? "ADVANCE",
    method: payment?.method ?? "CASH",
    upiApp: payment?.upiApp ?? undefined,
    transactionReference: payment?.transactionReference ?? undefined,
    relatedContractId: payment?.relatedContractId ?? undefined,
    relatedSupplierAgreementId: payment?.relatedSupplierAgreementId ?? undefined,
    notes: payment?.notes ?? "",
  };
}

export default function PaymentForm({ payment, vendors, stages, currentUserId, isSubmitting, optionsLoading, optionsError, onCancel, onSubmit }: PaymentFormProps) {
  const form = useForm<PaymentFormValues>({ resolver: zodResolver(paymentSchema), defaultValues: initialValues(payment, currentUserId) });
  const { reset } = form;
  useEffect(() => { reset(initialValues(payment, currentUserId)); }, [reset, payment, currentUserId]);
  const selectedMethod = useWatch({ control: form.control, name: "method" });
  const selectedType = useWatch({ control: form.control, name: "paymentType" });
  const errors = form.formState.errors;
  const showError = (message?: string) => message && <p role="alert" className="mt-1 text-xs text-destructive">{message}</p>;
  const requiresVendor = selectedType === "MATERIAL_PAYMENT" || selectedType === "SERVICE_PAYMENT";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <input type="hidden" {...form.register("paidByUserId")} />
      {optionsError && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{optionsError}</p>}
      <div>
        <span id="payment-date-label" className={labelClass}>Date <span className="text-destructive" aria-hidden="true">*</span></span>
        <Controller name="date" control={form.control} render={({ field }) => <DatePicker value={field.value} onChange={field.onChange} disabled={isSubmitting} placeholder="Choose payment date" ariaLabelledBy="payment-date-label" />} />
        {showError(errors.date?.message)}
      </div>

      <div>
        <label htmlFor="payment-amount" className={labelClass}>Amount (₹) <span className="text-destructive" aria-hidden="true">*</span></label>
        <input id="payment-amount" type="number" min="0.01" max="100000000" step="0.01" inputMode="decimal" disabled={isSubmitting} className={inputClass} {...form.register("amount", { valueAsNumber: true })} />
        {showError(errors.amount?.message)}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="payment-vendor" className={labelClass}>Vendor{requiresVendor && <span className="text-destructive" aria-hidden="true"> *</span>}</label>
          <select id="payment-vendor" disabled={isSubmitting || optionsLoading} className={inputClass} {...form.register("paidToVendorId")}>
            <option value="">{optionsLoading ? "Loading vendors…" : "No vendor selected"}</option>
            {vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}{vendor.isDeleted ? " (deleted)" : vendor.status === "INACTIVE" ? " (inactive)" : ""}</option>)}
          </select>
          {showError(errors.paidToVendorId?.message)}
        </div>
        <div>
          <label htmlFor="payment-stage" className={labelClass}>Construction stage <span className="text-xs font-normal text-muted-foreground">(optional)</span></label>
          <select id="payment-stage" disabled={isSubmitting || optionsLoading} className={inputClass} {...form.register("stageId")}>
            <option value="">{optionsLoading ? "Loading stages…" : "No stage selected"}</option>
            {stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.name}{stage.isDeleted ? " (deleted)" : ""}</option>)}
          </select>
          {showError(errors.stageId?.message)}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div><label htmlFor="payment-type" className={labelClass}>Payment type <span className="text-destructive" aria-hidden="true">*</span></label><select id="payment-type" disabled={isSubmitting} className={inputClass} {...form.register("paymentType")}>{Object.entries(PAYMENT_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{showError(errors.paymentType?.message)}</div>
        <div><label htmlFor="payment-method" className={labelClass}>Payment method <span className="text-destructive" aria-hidden="true">*</span></label><select id="payment-method" disabled={isSubmitting} className={inputClass} {...form.register("method", { onChange: (event) => { if (event.target.value !== "UPI") { form.setValue("upiApp", undefined, { shouldValidate: true }); form.setValue("transactionReference", undefined, { shouldValidate: true }); } } })}>{Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{showError(errors.method?.message)}</div>
      </div>

      {selectedType === "CONTRACT_PAYMENT" && <section className="space-y-3 rounded-xl border border-border bg-muted/20 p-4"><div><h3 className="text-sm font-semibold">Contract reference</h3><p className="mt-0.5 text-xs text-muted-foreground">A contract reference is required for contract payments.</p></div><div><label htmlFor="payment-contract" className={labelClass}>Related contract ID <span className="text-destructive" aria-hidden="true">*</span></label><input id="payment-contract" disabled={isSubmitting} className={inputClass} placeholder="Enter contract ID" {...form.register("relatedContractId")} />{showError(errors.relatedContractId?.message)}</div></section>}

      {selectedMethod === "UPI" && <section className="space-y-3 rounded-xl border border-border bg-muted/20 p-4"><div><h3 className="text-sm font-semibold">UPI details</h3><p className="mt-0.5 text-xs text-muted-foreground">Add the app and transaction reference for this payment.</p></div><div><label htmlFor="payment-upi-app" className={labelClass}>UPI app <span className="text-destructive" aria-hidden="true">*</span></label><select id="payment-upi-app" disabled={isSubmitting} className={inputClass} {...form.register("upiApp")}><option value="">Select UPI app</option><option value="PHONEPE">PhonePe</option><option value="GOOGLE_PAY">Google Pay</option><option value="PAYTM">Paytm</option><option value="BHIM">BHIM</option><option value="OTHER">Other</option></select>{showError(errors.upiApp?.message)}</div><div><label htmlFor="payment-transaction-reference" className={labelClass}>Transaction reference <span className="text-destructive" aria-hidden="true">*</span></label><input id="payment-transaction-reference" maxLength={200} disabled={isSubmitting} className={inputClass} placeholder="Enter transaction reference" {...form.register("transactionReference")} />{showError(errors.transactionReference?.message)}</div></section>}

      <div><label htmlFor="payment-notes" className={labelClass}>Notes <span className="text-xs font-normal text-muted-foreground">(optional)</span></label><textarea id="payment-notes" rows={3} maxLength={1000} disabled={isSubmitting} className={`${inputClass} resize-y py-3`} placeholder="Add details about this payment" {...form.register("notes")} />{showError(errors.notes?.message)}</div>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="min-h-11 rounded-xl border px-4 text-sm font-medium hover:bg-muted">Cancel</button>
        <button type="submit" disabled={isSubmitting || optionsLoading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background disabled:opacity-50">{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}{isSubmitting ? "Saving…" : payment ? "Save changes" : "Add payment"}</button>
      </div>
    </form>
  );
}
