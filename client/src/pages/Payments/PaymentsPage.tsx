import { useMemo, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import { useActiveVendorsQuery } from "@/features/vendors/vendor.queries";
import { useStagesQuery } from "@/features/stages/stage.queries";
import { usePaymentsQuery } from "@/features/payments/payment.queries";
import { useCreatePaymentMutation, useDeletePaymentMutation, useRestorePaymentMutation, useUpdatePaymentMutation, useVerifyPaymentMutation } from "@/features/payments/payment.mutations";
import type { Payment, PaymentQueryParams, PaymentMethod, PaymentType } from "@/features/payments/payment.types";
import type { PaymentFormValues } from "@/features/payments/payment.schema";
import { PAYMENT_METHOD_LABELS, PAYMENT_TYPE_LABELS, formatPaymentAmount, formatPaymentDate, getVerificationStatusLabel } from "@/features/payments/payment.utils";
import { PaymentCard } from "@/components/payments/PaymentCard";
import PaymentFormPlaceholder from "@/components/payments/PaymentFormPlaceholder";

const PAGE_SIZE = 10;

function errorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return error instanceof Error ? error.message : fallback;
}

export default function PaymentsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [search, setSearch] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType | "">("");
  const [method, setMethod] = useState<PaymentMethod | "">("");
  const [hasReceipt, setHasReceipt] = useState<"" | "true" | "false">("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [page, setPage] = useState(1);
  const [formPayment, setFormPayment] = useState<Payment | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [details, setDetails] = useState<Payment | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Payment | null>(null);

  const params = useMemo<PaymentQueryParams>(() => ({
    page,
    limit: PAGE_SIZE,
    q: search.trim() || undefined,
    paymentType: paymentType || undefined,
    method: method || undefined,
    hasReceipt: hasReceipt === "" ? undefined : hasReceipt === "true",
    includeDeleted,
  }), [page, search, paymentType, method, hasReceipt, includeDeleted]);

  const paymentsQuery = usePaymentsQuery(params);
  const vendorsQuery = useActiveVendorsQuery();
  const stagesQuery = useStagesQuery();
  const createMutation = useCreatePaymentMutation();
  const updateMutation = useUpdatePaymentMutation();
  const verifyMutation = useVerifyPaymentMutation();
  const deleteMutation = useDeletePaymentMutation();
  const restoreMutation = useRestorePaymentMutation();
  const payments = paymentsQuery.data?.data.items ?? [];
  const pagination = paymentsQuery.data?.data.pagination;
  const vendorNames = new Map((vendorsQuery.data?.data ?? []).map((v) => [v._id, v.name]));
  const stageNames = new Map((stagesQuery.data?.data ?? []).map((s) => [s._id, s.name]));
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const closeForm = () => { setFormOpen(false); setFormPayment(null); };
  const resetPage = () => setPage(1);
  const submitPayment = async (values: PaymentFormValues) => {
    if (!user?.id) { toast.error("Your session could not be identified. Sign in again."); return; }
    const payload = {
      date: values.date,
      amount: values.amount,
      paidByUserId: user.id,
      paidToVendorId: values.paidToVendorId || undefined,
      stageId: values.stageId || undefined,
      paymentType: values.paymentType,
      method: values.method,
      ...(values.method === "UPI" ? { upiApp: values.upiApp, transactionReference: values.transactionReference?.trim() } : {}),
      ...(values.relatedContractId?.trim() ? { relatedContractId: values.relatedContractId.trim() } : {}),
      ...(values.relatedSupplierAgreementId?.trim() ? { relatedSupplierAgreementId: values.relatedSupplierAgreementId.trim() } : {}),
      ...(values.notes?.trim() ? { notes: values.notes.trim() } : {}),
    };
    try {
      if (formPayment) {
        await updateMutation.mutateAsync({ paymentId: formPayment.id, payload: { ...payload, notes: values.notes?.trim() || null } });
        toast.success("Payment updated.");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Payment added.");
        resetPage();
      }
      closeForm();
    } catch (error) { toast.error(errorMessage(error, "Could not save payment.")); }
  };

  const verify = async (payment: Payment) => {
    try { await verifyMutation.mutateAsync(payment.id); toast.success(`${payment.paymentNo} verified.`); }
    catch (error) { toast.error(errorMessage(error, "Could not verify payment.")); }
  };
  const remove = async () => {
    if (!pendingDelete) return;
    try { await deleteMutation.mutateAsync(pendingDelete.id); toast.success(`${pendingDelete.paymentNo} deleted.`); setPendingDelete(null); }
    catch (error) { toast.error(errorMessage(error, "Could not delete payment.")); }
  };
  const restore = async (payment: Payment) => {
    try { await restoreMutation.mutateAsync(payment.id); toast.success(`${payment.paymentNo} restored.`); setDetails(null); }
    catch (error) { toast.error(errorMessage(error, "Could not restore payment.")); }
  };

  const clearFilters = () => { setSearch(""); setPaymentType(""); setMethod(""); setHasReceipt(""); setIncludeDeleted(false); resetPage(); };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Payments</h1><p className="mt-1 text-sm text-muted-foreground">Track money paid during house construction.</p></div>
        <button type="button" onClick={() => { setFormPayment(null); setFormOpen(true); }} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" />Add Payment</button>
      </header>

      <section aria-label="Payment filters" className="grid grid-cols-1 gap-3 rounded-xl border bg-card p-3 sm:grid-cols-2 lg:grid-cols-6">
        <label className="relative min-w-0 sm:col-span-2"><span className="sr-only">Search payments</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(e) => { setSearch(e.target.value); resetPage(); }} placeholder="Search number, reference, notes" className="h-11 w-full rounded-lg border bg-background pl-9 pr-3 text-sm" /></label>
        <label><span className="sr-only">Payment type</span><select value={paymentType} onChange={(e) => { setPaymentType(e.target.value as PaymentType | ""); resetPage(); }} className="h-11 w-full rounded-lg border bg-background px-3 text-sm"><option value="">All types</option>{Object.entries(PAYMENT_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label><span className="sr-only">Payment method</span><select value={method} onChange={(e) => { setMethod(e.target.value as PaymentMethod | ""); resetPage(); }} className="h-11 w-full rounded-lg border bg-background px-3 text-sm"><option value="">All methods</option>{Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label><span className="sr-only">Receipt filter</span><select value={hasReceipt} onChange={(e) => { setHasReceipt(e.target.value as "" | "true" | "false"); resetPage(); }} className="h-11 w-full rounded-lg border bg-background px-3 text-sm"><option value="">Any receipt</option><option value="true">Has receipt</option><option value="false">No receipt</option></select></label>
        <label className="flex h-11 items-center gap-2 rounded-lg border px-3 text-sm sm:col-span-2 lg:col-span-1"><input type="checkbox" checked={includeDeleted} onChange={(e) => { setIncludeDeleted(e.target.checked); resetPage(); }} />Deleted too</label>
        {(search || paymentType || method || hasReceipt || includeDeleted) && <button type="button" onClick={clearFilters} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm hover:bg-muted"><X className="h-4 w-4" />Clear filters</button>}
      </section>

      {paymentsQuery.isLoading && <div className="space-y-3" aria-label="Loading payments">{[0, 1, 2].map((n) => <div key={n} className="h-28 animate-pulse rounded-xl border bg-card" />)}</div>}
      {paymentsQuery.isError && <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/5 p-5"><div className="flex gap-3"><AlertCircle className="h-5 w-5 text-destructive" /><div><p className="font-semibold">Could not load payments</p><p className="mt-1 text-sm text-muted-foreground">{errorMessage(paymentsQuery.error, "Please try again.")}</p><button type="button" onClick={() => void paymentsQuery.refetch()} className="mt-3 rounded-lg border px-3 py-2 text-sm">Retry</button></div></div></div>}
      {!paymentsQuery.isLoading && !paymentsQuery.isError && (payments.length ? <div className="space-y-3">{payments.map((payment) => <PaymentCard key={payment.id} payment={payment} vendorName={payment.paidToVendorId ? vendorNames.get(payment.paidToVendorId) : undefined} stageName={payment.stageId ? stageNames.get(payment.stageId) : undefined} onClick={setDetails} />)}</div> : <div className="rounded-xl border bg-card px-5 py-12 text-center"><p className="font-semibold">No payments found</p><p className="mt-1 text-sm text-muted-foreground">{includeDeleted ? "No payments match these filters." : "Add your first construction payment."}</p>{!includeDeleted && <button type="button" onClick={() => { setFormPayment(null); setFormOpen(true); }} className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" />Add Payment</button>}</div>)}

      {pagination && pagination.totalPages > 1 && <nav aria-label="Payment pages" className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3"><p className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages} · {pagination.total} payments</p><div className="flex gap-2"><button type="button" aria-label="Previous page" disabled={!pagination.hasPreviousPage} onClick={() => setPage((p) => Math.max(1, p - 1))} className="inline-flex h-10 items-center gap-1 rounded-lg border px-3 text-sm disabled:opacity-40"><ChevronLeft className="h-4 w-4" /><span className="hidden sm:inline">Previous</span></button><button type="button" aria-label="Next page" disabled={!pagination.hasNextPage} onClick={() => setPage((p) => p + 1)} className="inline-flex h-10 items-center gap-1 rounded-lg border px-3 text-sm disabled:opacity-40"><span className="hidden sm:inline">Next</span><ChevronRight className="h-4 w-4" /></button></div></nav>}

      {formOpen && <PaymentFormPlaceholder payment={formPayment} vendors={(vendorsQuery.data?.data ?? []).map((v) => ({ id: v._id, name: v.name }))} stages={(stagesQuery.data?.data ?? []).map((s) => ({ id: s._id, name: s.name }))} currentUserId={user?.id ?? ""} isSubmitting={isSubmitting} onClose={closeForm} onSubmit={submitPayment} />}

      {details && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setDetails(null); }}><section role="dialog" aria-modal="true" aria-labelledby="payment-details-title" className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-background p-5 shadow-xl sm:rounded-2xl"><div className="flex items-start justify-between gap-3"><div><h2 id="payment-details-title" className="text-lg font-semibold">{details.paymentNo}</h2><p className="mt-1 text-sm text-muted-foreground">{formatPaymentDate(details.date)}</p></div><button type="button" aria-label="Close payment details" onClick={() => setDetails(null)} className="rounded-lg p-2 hover:bg-muted"><X className="h-5 w-5" /></button></div><p className="mt-5 text-2xl font-bold">{formatPaymentAmount(details.amount)}</p><dl className="mt-5 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">{[["Payment type", PAYMENT_TYPE_LABELS[details.paymentType]], ["Method", PAYMENT_METHOD_LABELS[details.method]], ["UPI app", details.upiApp?.replaceAll("_", " ")], ["Transaction reference", details.transactionReference], ["Paid by", details.paidByUserId === user?.id ? user.name : details.paidByUserId], ["Vendor", details.paidToVendorId ? vendorNames.get(details.paidToVendorId) ?? details.paidToVendorId : null], ["Stage", details.stageId ? stageNames.get(details.stageId) ?? details.stageId : null], ["Related contract", details.relatedContractId], ["Supplier agreement", details.relatedSupplierAgreementId], ["Receipt", details.receiptId ?? "No receipt"], ["Verification", getVerificationStatusLabel(details.verificationStatus)], ["Created by", details.createdBy], ["Created", new Date(details.createdAt).toLocaleString()], ["Updated", new Date(details.updatedAt).toLocaleString()]].map(([label, value]) => <div key={label}><dt className="text-muted-foreground">{label}</dt><dd className="mt-1 break-words font-medium">{value ?? "—"}</dd></div>)}</dl>{details.notes && <div className="mt-4 rounded-lg bg-muted/50 p-3"><p className="text-xs font-medium text-muted-foreground">Notes</p><p className="mt-1 whitespace-pre-wrap text-sm">{details.notes}</p></div>}{details.isDeleted && <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive">Deleted payment</p>}<div className="mt-6 flex flex-wrap justify-end gap-2">{details.isDeleted ? <button type="button" onClick={() => void restore(details)} disabled={restoreMutation.isPending} className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">{restoreMutation.isPending ? "Restoring…" : "Restore"}</button> : <><button type="button" onClick={() => { setFormPayment(details); setFormOpen(true); setDetails(null); }} className="h-10 rounded-lg border px-4 text-sm font-medium">Edit</button>{details.verificationStatus === "NEEDS_VERIFICATION" && <button type="button" onClick={() => void verify(details)} disabled={verifyMutation.isPending} className="h-10 rounded-lg border px-4 text-sm font-medium">{verifyMutation.isPending ? "Verifying…" : "Verify"}</button>}<button type="button" onClick={() => setPendingDelete(details)} className="h-10 rounded-lg border border-destructive/40 px-4 text-sm font-medium text-destructive">Delete</button></>}<button type="button" onClick={() => setDetails(null)} className="h-10 rounded-lg border px-4 text-sm font-medium">Close</button></div></section></div>}

      {pendingDelete && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"><section role="alertdialog" aria-modal="true" aria-labelledby="delete-payment-title" aria-describedby="delete-payment-description" className="w-full max-w-md rounded-2xl bg-background p-5 shadow-xl"><h2 id="delete-payment-title" className="text-lg font-semibold">Delete payment?</h2><p id="delete-payment-description" className="mt-2 text-sm text-muted-foreground">Delete {pendingDelete.paymentNo}? It will leave the active list and can be restored later.</p><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setPendingDelete(null)} className="h-10 rounded-lg border px-4 text-sm">Cancel</button><button type="button" onClick={() => void remove()} disabled={deleteMutation.isPending} className="h-10 rounded-lg bg-destructive px-4 text-sm font-semibold text-white disabled:opacity-50">{deleteMutation.isPending ? "Deleting…" : "Delete Payment"}</button></div></section></div>}
    </div>
  );
}
