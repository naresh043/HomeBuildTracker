import { Banknote, Check, CreditCard, Eye, FileText, Pencil, RotateCcw, Smartphone, Trash2 } from "lucide-react";
import type { Payment } from "@/features/payments/payment.types";
import { formatPaymentAmount, formatPaymentDate, getPaymentMethodLabel, getPaymentTypeLabel, getUpiAppLabel, getVerificationStatusLabel } from "@/features/payments/payment.utils";

interface PaymentCardProps {
  payment: Payment;
  vendorName: string;
  stageName: string;
  isVerifying?: boolean;
  isRestoring?: boolean;
  onDetails: (payment: Payment) => void;
  onEdit: (payment: Payment) => void;
  onVerify: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
  onRestore: (payment: Payment) => void;
}

function MethodIcon({ method }: { method: Payment["method"] }) {
  const className = "h-4 w-4 shrink-0 text-muted-foreground";
  switch (method) {
    case "CASH": return <Banknote className={className} aria-hidden="true" />;
    case "UPI": return <Smartphone className={className} aria-hidden="true" />;
    case "BANK": return <CreditCard className={className} aria-hidden="true" />;
    case "CHEQUE":
    case "OTHER": return <FileText className={className} aria-hidden="true" />;
  }
}

export default function PaymentCard({ payment, vendorName, stageName, isVerifying = false, isRestoring = false, onDetails, onEdit, onVerify, onDelete, onRestore }: PaymentCardProps) {
  const verified = payment.verificationStatus === "VERIFIED";
  return (
    <article className={`min-w-0 rounded-2xl border border-border p-4 shadow-sm ${payment.isDeleted ? "border-destructive/30 bg-muted/40" : "bg-card"}`}>
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">{payment.paymentNo} · {formatPaymentDate(payment.date)}</p>
          <p className="mt-1 truncate text-base font-semibold text-foreground">{getPaymentTypeLabel(payment.paymentType)}</p>
          <p className="mt-0.5 flex min-w-0 items-center gap-1.5 truncate text-sm text-muted-foreground"><MethodIcon method={payment.method} />{getPaymentMethodLabel(payment.method)}{payment.method === "UPI" && payment.upiApp ? ` · ${getUpiAppLabel(payment.upiApp)}` : ""}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <p className="text-lg font-semibold tracking-tight text-foreground">{formatPaymentAmount(payment.amount)}</p>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${verified ? "bg-emerald-500/10 text-emerald-700" : "bg-amber-500/10 text-amber-700"}`}>{getVerificationStatusLabel(payment.verificationStatus)}</span>
          {payment.isDeleted && <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">Deleted</span>}
        </div>
      </div>

      <div className="mt-4 grid min-w-0 grid-cols-1 gap-2 border-t border-border pt-3 text-xs sm:grid-cols-2">
        <p className="min-w-0 truncate text-muted-foreground"><span className="font-medium text-foreground">Vendor</span> · {vendorName}</p>
        <p className="min-w-0 truncate text-muted-foreground"><span className="font-medium text-foreground">Stage</span> · {stageName}</p>
        {payment.method === "UPI" && payment.transactionReference && <p className="min-w-0 truncate text-muted-foreground sm:col-span-2"><span className="font-medium text-foreground">Transaction</span> · {payment.transactionReference}</p>}
      </div>
      {payment.notes && <p className="mt-3 line-clamp-2 border-t border-border pt-3 text-xs text-muted-foreground">{payment.notes}</p>}

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-2">
        <button type="button" aria-label={`View ${payment.paymentNo}`} title="View details" onClick={() => onDetails(payment)} className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"><Eye className="h-4 w-4" /></button>
        <div className="flex min-w-0 items-center gap-1">
          {payment.isDeleted ? <button type="button" aria-label={`Restore ${payment.paymentNo}`} title="Restore payment" disabled={isRestoring} onClick={() => onRestore(payment)} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-primary hover:bg-primary/10 disabled:opacity-50"><RotateCcw className="h-4 w-4" />{isRestoring ? "Restoring…" : "Restore"}</button> : <>
            <button type="button" aria-label={`Edit ${payment.paymentNo}`} title="Edit" onClick={() => onEdit(payment)} className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-4 w-4" /></button>
            {!verified && <button type="button" aria-label={`Verify ${payment.paymentNo}`} title="Verify payment" disabled={isVerifying} onClick={() => onVerify(payment)} className="flex h-10 w-10 items-center justify-center rounded-lg text-emerald-700 hover:bg-emerald-500/10 disabled:opacity-50"><Check className="h-4 w-4" /></button>}
            <button type="button" aria-label={`Delete ${payment.paymentNo}`} title="Delete" onClick={() => onDelete(payment)} className="flex h-10 w-10 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
          </>}
        </div>
      </div>
    </article>
  );
}
