import { Check, Loader2, Pencil, RotateCcw, Trash2, X } from "lucide-react";
import type { Payment } from "@/features/payments/payment.types";
import { formatPaymentAmount, formatPaymentDate, getPaymentMethodLabel, getPaymentTypeLabel, getUpiAppLabel, getVerificationStatusLabel } from "@/features/payments/payment.utils";

interface Props {
  payment: Payment | null;
  currentUserId: string;
  currentUserName: string;
  vendorName: string;
  stageName: string;
  isVerifying: boolean;
  isRestoring: boolean;
  onClose: () => void;
  onEdit: (payment: Payment) => void;
  onVerify: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
  onRestore: (payment: Payment) => void;
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return <div className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm font-medium text-foreground">{value}</dd></div>;
}

export default function PaymentDetailsDialog({ payment, currentUserId, currentUserName, vendorName, stageName, isVerifying, isRestoring, onClose, onEdit, onVerify, onDelete, onRestore }: Props) {
  if (!payment) return null;
  const paidBy = payment.paidByUserId === currentUserId ? currentUserName : payment.paidByUserId ? "Household member" : undefined;
  const createdBy = payment.createdBy === currentUserId ? "You" : payment.createdBy ? "Household member" : undefined;

  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="payment-detail-title" className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border bg-card p-5 shadow-xl sm:max-w-lg sm:rounded-2xl">
    <header className="flex items-start justify-between gap-3"><div><p className="text-xs text-muted-foreground">{payment.isDeleted ? "Deleted payment" : "Payment"}</p><h2 id="payment-detail-title" className="text-lg font-semibold">{payment.paymentNo}</h2></div><button type="button" aria-label="Close details" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button></header>
    <div className="mt-4 flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${payment.verificationStatus === "VERIFIED" ? "bg-emerald-500/10 text-emerald-700" : "bg-amber-500/10 text-amber-700"}`}>{getVerificationStatusLabel(payment.verificationStatus)}</span>{payment.isDeleted && <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">Deleted</span>}</div>
    <p className="mt-4 text-2xl font-semibold tracking-tight">{formatPaymentAmount(payment.amount)}</p>

    <section className="mt-5 border-t border-border pt-4"><h3 className="text-sm font-semibold">Payment information</h3><dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-4"><Detail label="Date" value={formatPaymentDate(payment.date)} /><Detail label="Payment type" value={getPaymentTypeLabel(payment.paymentType)} /><Detail label="Method" value={getPaymentMethodLabel(payment.method)} /></dl></section>
    <section className="mt-5 border-t border-border pt-4"><h3 className="text-sm font-semibold">Parties and construction</h3><dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-4"><Detail label="Paid by" value={paidBy} /><Detail label="Vendor" value={payment.paidToVendorId ? vendorName : undefined} /><Detail label="Construction stage" value={payment.stageId ? stageName : undefined} /></dl></section>
    {(payment.method === "UPI" || payment.receiptId) && <section className="mt-5 border-t border-border pt-4"><h3 className="text-sm font-semibold">Payment evidence</h3><dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-4">{payment.method === "UPI" && payment.upiApp && <Detail label="UPI app" value={getUpiAppLabel(payment.upiApp)} />}{payment.method === "UPI" && <Detail label="Transaction reference" value={payment.transactionReference} />}{payment.receiptId && <Detail label="Receipt" value="Receipt linked" />}</dl></section>}
    {(payment.relatedContractId || payment.relatedSupplierAgreementId) && <section className="mt-5 border-t border-border pt-4"><h3 className="text-sm font-semibold">Related records</h3><dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-4"><Detail label="Contract" value={payment.relatedContractId ? "Contract linked" : undefined} /><Detail label="Supplier agreement" value={payment.relatedSupplierAgreementId ? "Supplier agreement linked" : undefined} /></dl></section>}
    {(payment.notes || createdBy || payment.createdAt || payment.updatedAt) && <section className="mt-5 border-t border-border pt-4"><h3 className="text-sm font-semibold">Additional information</h3>{payment.notes && <p className="mt-3 whitespace-pre-wrap rounded-xl bg-muted/40 p-3 text-sm text-foreground">{payment.notes}</p>}<dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-4"><Detail label="Created by" value={createdBy} /><Detail label="Created" value={payment.createdAt ? new Date(payment.createdAt).toLocaleString() : undefined} /><Detail label="Last updated" value={payment.updatedAt ? new Date(payment.updatedAt).toLocaleString() : undefined} /></dl></section>}

    <footer className="mt-6 flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="min-h-11 rounded-xl border px-4 text-sm font-medium hover:bg-muted">Close</button>{payment.isDeleted ? <button type="button" disabled={isRestoring} onClick={() => onRestore(payment)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium text-primary hover:bg-primary/10 disabled:opacity-50"><RotateCcw className="h-4 w-4" />{isRestoring ? "Restoring…" : "Restore"}</button> : <><button type="button" onClick={() => onEdit(payment)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium hover:bg-muted"><Pencil className="h-4 w-4" />Edit</button>{payment.verificationStatus !== "VERIFIED" && <button type="button" disabled={isVerifying} onClick={() => onVerify(payment)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium text-emerald-700 hover:bg-emerald-500/10 disabled:opacity-50">{isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Verify</button>}<button type="button" onClick={() => onDelete(payment)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" />Delete</button></>}</footer>
  </section></div>;
}
