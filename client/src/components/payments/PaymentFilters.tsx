import { Filter, Search, X } from "lucide-react";
import { PAYMENT_METHOD_LABELS, PAYMENT_TYPE_LABELS } from "@/features/payments/payment.utils";
import type { PaymentMethod, PaymentType, VerificationStatus } from "@/features/payments/payment.types";

interface PaymentFiltersProps {
  search: string;
  paymentType: PaymentType | "";
  method: PaymentMethod | "";
  hasReceipt: "" | "true" | "false";
  verificationStatus: VerificationStatus | "";
  includeDeleted: boolean;
  onSearchChange: (value: string) => void;
  onPaymentTypeChange: (value: PaymentType | "") => void;
  onMethodChange: (value: PaymentMethod | "") => void;
  onReceiptChange: (value: "" | "true" | "false") => void;
  onVerificationChange: (value: VerificationStatus | "") => void;
  onIncludeDeletedChange: (value: boolean) => void;
  onClear: () => void;
}

const controlClass = "min-h-11 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/10";

export default function PaymentFilters(props: PaymentFiltersProps) {
  const hasFilters = Boolean(props.search.trim() || props.paymentType || props.method || props.hasReceipt || props.verificationStatus || props.includeDeleted);
  return (
    <section aria-label="Payment filters" className="w-full rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted"><Filter className="h-4 w-4" aria-hidden="true" /></span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">Find payments</h2>
            <p className="text-xs text-muted-foreground">Search and narrow by reference, type, method, receipt, or verification.</p>
          </div>
        </div>
        {hasFilters && <button type="button" onClick={props.onClear} className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted"><X className="h-3.5 w-3.5" aria-hidden="true" />Clear</button>}
      </div>

      <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-3">
          <label htmlFor="payment-search" className="mb-1.5 block text-xs font-medium">Search payment number, reference, or notes</label>
          <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><input id="payment-search" type="search" value={props.search} onChange={(event) => props.onSearchChange(event.target.value)} placeholder="e.g. PAY-0001" className={`${controlClass} pl-10`} /></div>
        </div>
        <div><label htmlFor="payment-filter-type" className="mb-1.5 block text-xs font-medium">Payment type</label><select id="payment-filter-type" value={props.paymentType} onChange={(event) => props.onPaymentTypeChange(event.target.value as PaymentType | "")} className={controlClass}><option value="">All types</option>{Object.entries(PAYMENT_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
        <div><label htmlFor="payment-filter-method" className="mb-1.5 block text-xs font-medium">Payment method</label><select id="payment-filter-method" value={props.method} onChange={(event) => props.onMethodChange(event.target.value as PaymentMethod | "")} className={controlClass}><option value="">All methods</option>{Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
        <div><label htmlFor="payment-filter-receipt" className="mb-1.5 block text-xs font-medium">Receipt</label><select id="payment-filter-receipt" value={props.hasReceipt} onChange={(event) => props.onReceiptChange(event.target.value as "" | "true" | "false")} className={controlClass}><option value="">Any receipt</option><option value="true">Has receipt</option><option value="false">No receipt</option></select></div>
        <div><label htmlFor="payment-filter-verification" className="mb-1.5 block text-xs font-medium">Verification</label><select id="payment-filter-verification" value={props.verificationStatus} onChange={(event) => props.onVerificationChange(event.target.value as VerificationStatus | "")} className={controlClass}><option value="">All statuses</option><option value="NEEDS_VERIFICATION">Needs verification</option><option value="VERIFIED">Verified</option></select></div>
        <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-3 py-2.5 sm:col-span-2 lg:col-span-2">
          <span><span className="block text-sm font-medium">Include deleted payments</span><span className="block text-xs text-muted-foreground">Deleted records are marked and can be restored.</span></span>
          <input type="checkbox" checked={props.includeDeleted} onChange={(event) => props.onIncludeDeletedChange(event.target.checked)} className="h-5 w-5 shrink-0 accent-foreground" />
        </label>
      </div>
    </section>
  );
}
