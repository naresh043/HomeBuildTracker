import axios from "axios";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import PaymentDeleteDialog from "@/components/payments/PaymentDeleteDialog";
import PaymentDetailsDialog from "@/components/payments/PaymentDetailsDialog";
import PaymentEmptyState from "@/components/payments/PaymentEmptyState";
import PaymentErrorState from "@/components/payments/PaymentErrorState";
import PaymentFilters from "@/components/payments/PaymentFilters";
import PaymentFormDialog from "@/components/payments/PaymentFormDialog";
import PaymentHeader from "@/components/payments/PaymentHeader";
import PaymentList from "@/components/payments/PaymentList";
import PaymentLoadingState from "@/components/payments/PaymentLoadingState";
import { useActiveVendorsQuery, useVendorsQuery } from "@/features/vendors/vendor.queries";
import { useStagesQuery } from "@/features/stages/stage.queries";
import { useAppSelector } from "@/store/hooks";
import { useCreatePaymentMutation, useDeletePaymentMutation, useRestorePaymentMutation, useUpdatePaymentMutation, useVerifyPaymentMutation } from "@/features/payments/payment.mutations";
import { usePaymentsQuery } from "@/features/payments/payment.queries";
import type { PaymentFormValues } from "@/features/payments/payment.schema";
import type { Payment, PaymentMethod, PaymentQueryParams, PaymentType, VerificationStatus } from "@/features/payments/payment.types";

const PAGE_SIZE = 10;

const getMutationErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError<{ message?: string }>(error)) return error.response?.data?.message ?? fallback;
  return error instanceof Error ? error.message : fallback;
};

export default function PaymentsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [search, setSearch] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType | "">("");
  const [method, setMethod] = useState<PaymentMethod | "">("");
  const [hasReceipt, setHasReceipt] = useState<"" | "true" | "false">("");
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | "">("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null);
  const [detailPayment, setDetailPayment] = useState<Payment | null>(null);

  const params: PaymentQueryParams = {
    page,
    limit: PAGE_SIZE,
    q: search.trim() || undefined,
    paymentType: paymentType || undefined,
    method: method || undefined,
    hasReceipt: hasReceipt ? hasReceipt === "true" : undefined,
    verificationStatus: verificationStatus || undefined,
    includeDeleted: includeDeleted || undefined,
  };
  const paymentsQuery = usePaymentsQuery(params);
  const vendorsQuery = useActiveVendorsQuery();
  const vendorDirectoryQuery = useVendorsQuery({ page: 1, limit: 100, includeDeleted: true });
  const stagesQuery = useStagesQuery(true);
  const createMutation = useCreatePaymentMutation();
  const updateMutation = useUpdatePaymentMutation();
  const verifyMutation = useVerifyPaymentMutation();
  const deleteMutation = useDeletePaymentMutation();
  const restoreMutation = useRestorePaymentMutation();

  const payments = paymentsQuery.data?.data.items ?? [];
  const pagination = paymentsQuery.data?.data.pagination;
  const activeVendors = (vendorsQuery.data?.data ?? []).filter((vendor) => !vendor.isDeleted && vendor.status === "ACTIVE");
  const allVendors = useMemo(() => {
    const directory = vendorDirectoryQuery.data?.data.vendors ?? [];
    const byId = new Map(directory.map((vendor) => [vendor._id, vendor]));
    for (const vendor of activeVendors) byId.set(vendor._id, vendor);
    return [...byId.values()];
  }, [activeVendors, vendorDirectoryQuery.data?.data.vendors]);
  const formVendors = useMemo(() => {
    const byId = new Map(activeVendors.map((vendor) => [vendor._id, vendor]));
    if (editingPayment?.paidToVendorId) {
      const existingVendor = allVendors.find((vendor) => vendor._id === editingPayment.paidToVendorId);
      if (existingVendor) byId.set(existingVendor._id, existingVendor);
    }
    return [...byId.values()];
  }, [activeVendors, allVendors, editingPayment]);
  const stages = (stagesQuery.data?.data ?? []).filter((stage) => !stage.isDeleted);
  const formStages = useMemo(() => {
    const byId = new Map(stages.map((stage) => [stage._id, stage]));
    if (editingPayment?.stageId) {
      const oldStage = stagesQuery.data?.data.find((stage) => stage._id === editingPayment.stageId);
      if (oldStage) byId.set(oldStage._id, oldStage);
    }
    return [...byId.values()];
  }, [editingPayment, stages, stagesQuery.data?.data]);
  const vendorNames = useMemo(() => new Map(allVendors.map((vendor) => [vendor._id, `${vendor.name}${vendor.isDeleted ? " (deleted)" : vendor.status === "INACTIVE" ? " (inactive)" : ""}`])), [allVendors]);
  const stageNames = useMemo(() => new Map((stagesQuery.data?.data ?? []).map((stage) => [stage._id, `${stage.name}${stage.isDeleted ? " (deleted)" : ""}`])), [stagesQuery.data?.data]);
  const hasFilters = Boolean(search.trim() || paymentType || method || hasReceipt || verificationStatus || includeDeleted);
  const optionsLoading = vendorsQuery.isLoading || vendorDirectoryQuery.isLoading || stagesQuery.isLoading;
  const optionsError = vendorsQuery.isError || vendorDirectoryQuery.isError || stagesQuery.isError ? "Could not load vendors or construction stages. Retry before saving." : undefined;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!paymentsQuery.isSuccess || !pagination) return;
    const lastValidPage = Math.max(1, pagination.totalPages);
    if (page <= lastValidPage) return;
    const timeoutId = window.setTimeout(() => setPage(lastValidPage), 0);
    return () => window.clearTimeout(timeoutId);
  }, [page, pagination, paymentsQuery.isSuccess]);

  const resetPage = () => setPage(1);
  const clearFilters = () => {
    setSearch(""); setPaymentType(""); setMethod(""); setHasReceipt("");
    setVerificationStatus(""); setIncludeDeleted(false); resetPage();
  };
  const openCreate = () => { setEditingPayment(null); setFormOpen(true); };
  const closeForm = () => {
    if (!isSubmitting) { setFormOpen(false); setEditingPayment(null); }
  };

  const handleSubmit = async (values: PaymentFormValues) => {
    if (!user?.id) { toast.error("Your session could not be identified. Sign in again."); return; }
    const commonPayload = {
      date: values.date,
      amount: values.amount,
      paidByUserId: values.paidByUserId || user.id,
      paidToVendorId: values.paidToVendorId || undefined,
      stageId: values.stageId || undefined,
      paymentType: values.paymentType,
      method: values.method,
      ...(values.method === "UPI" ? { upiApp: values.upiApp, transactionReference: values.transactionReference?.trim() } : {}),
      ...(values.relatedContractId?.trim() ? { relatedContractId: values.relatedContractId.trim() } : {}),
      ...(values.relatedSupplierAgreementId?.trim() ? { relatedSupplierAgreementId: values.relatedSupplierAgreementId.trim() } : {}),
    };
    try {
      if (editingPayment) {
        const payload = { ...commonPayload, notes: values.notes?.trim() || null };
        const response = await updateMutation.mutateAsync({ paymentId: editingPayment.id, payload });
        toast.success(`${response.data.paymentNo} updated`);
      } else {
        const notes = values.notes?.trim();
        const response = await createMutation.mutateAsync({ ...commonPayload, ...(notes ? { notes } : {}) });
        toast.success(`${response.data.paymentNo} recorded`);
        resetPage();
      }
      setFormOpen(false); setEditingPayment(null);
    } catch (error) { toast.error(getMutationErrorMessage(error, "Unable to save payment")); }
  };

  const handleVerify = async (payment: Payment) => {
    try {
      const response = await verifyMutation.mutateAsync(payment.id);
      setDetailPayment(response.data);
      toast.success(`${response.data.paymentNo} verified`);
    } catch (error) { toast.error(getMutationErrorMessage(error, "Unable to verify payment")); }
  };
  const handleRestore = async (payment: Payment) => {
    try {
      const response = await restoreMutation.mutateAsync(payment.id);
      setDetailPayment(null);
      toast.success(`${response.data.paymentNo} restored`);
    } catch (error) { toast.error(getMutationErrorMessage(error, "Unable to restore payment")); }
  };
  const handleDelete = async () => {
    if (!deletingPayment) return;
    const removedPayment = deletingPayment;
    try {
      const response = await deleteMutation.mutateAsync(removedPayment.id);
      setDeletingPayment(null);
      setDetailPayment(null);
      toast(`${response.data.paymentNo} removed from the active list`, {
        action: { label: "Restore", onClick: () => { void handleRestore(response.data); } },
        duration: 10000,
      });
    } catch (error) { toast.error(getMutationErrorMessage(error, "Unable to remove payment")); }
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 px-4 py-5 pb-24 sm:px-6 sm:py-6 lg:px-8 lg:pb-8">
      <div className="space-y-1"><PaymentHeader count={payments.length} onAdd={openCreate} /><p className="text-sm text-muted-foreground">Track payments made to vendors, workers, and other construction-related parties.</p></div>
      <PaymentFilters search={search} paymentType={paymentType} method={method} hasReceipt={hasReceipt} verificationStatus={verificationStatus} includeDeleted={includeDeleted} onSearchChange={(value) => { setSearch(value); resetPage(); }} onPaymentTypeChange={(value) => { setPaymentType(value); resetPage(); }} onMethodChange={(value) => { setMethod(value); resetPage(); }} onReceiptChange={(value) => { setHasReceipt(value); resetPage(); }} onVerificationChange={(value) => { setVerificationStatus(value); resetPage(); }} onIncludeDeletedChange={(value) => { setIncludeDeleted(value); resetPage(); }} onClear={clearFilters} />

      {paymentsQuery.isFetching && !paymentsQuery.isLoading && <p role="status" className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" />Updating results…</p>}
      {paymentsQuery.isLoading && <PaymentLoadingState />}
      {paymentsQuery.isError && <PaymentErrorState message="Unable to load payments. Check your connection and try again." onRetry={() => { void paymentsQuery.refetch(); }} />}
      {paymentsQuery.isSuccess && payments.length === 0 && <PaymentEmptyState hasFilters={hasFilters} onAdd={openCreate} onClear={clearFilters} />}
      {paymentsQuery.isSuccess && payments.length > 0 && <>
        <PaymentList payments={payments} vendorNames={vendorNames} stageNames={stageNames} verifyingId={verifyMutation.isPending ? verifyMutation.variables : undefined} restoringId={restoreMutation.isPending ? restoreMutation.variables : undefined} onDetails={setDetailPayment} onEdit={(payment) => { setEditingPayment(payment); setFormOpen(true); }} onVerify={(payment) => { void handleVerify(payment); }} onDelete={setDeletingPayment} onRestore={(payment) => { void handleRestore(payment); }} />
        {pagination && pagination.totalPages > 1 && <nav aria-label="Payment pages" className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3"><button type="button" disabled={!pagination.hasPreviousPage} onClick={() => setPage((current) => Math.max(1, current - 1))} className="inline-flex min-h-10 items-center gap-1 rounded-xl border px-3 text-sm font-medium disabled:opacity-40"><ChevronLeft className="h-4 w-4" /><span className="hidden sm:inline">Previous</span></button><span className="text-sm font-medium text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</span><button type="button" disabled={!pagination.hasNextPage} onClick={() => setPage((current) => current + 1)} className="inline-flex min-h-10 items-center gap-1 rounded-xl border px-3 text-sm font-medium disabled:opacity-40"><span className="hidden sm:inline">Next</span><ChevronRight className="h-4 w-4" /></button></nav>}
      </>}

      <PaymentFormDialog open={formOpen} payment={editingPayment} vendors={formVendors.map((vendor) => ({ id: vendor._id, name: vendor.name, status: vendor.status, isDeleted: vendor.isDeleted }))} stages={formStages.map((stage) => ({ id: stage._id, name: stage.name, isDeleted: stage.isDeleted }))} currentUserId={user?.id ?? ""} optionsLoading={optionsLoading} optionsError={optionsError} isSubmitting={isSubmitting} onSubmit={handleSubmit} onClose={closeForm} />
      <PaymentDeleteDialog payment={deletingPayment} isDeleting={deleteMutation.isPending} onClose={() => { if (!deleteMutation.isPending) setDeletingPayment(null); }} onConfirm={() => { void handleDelete(); }} />
      <PaymentDetailsDialog payment={detailPayment} currentUserId={user?.id ?? ""} currentUserName={user?.name ?? "You"} vendorName={detailPayment?.paidToVendorId ? vendorNames.get(detailPayment.paidToVendorId) ?? "Vendor unavailable" : ""} stageName={detailPayment?.stageId ? stageNames.get(detailPayment.stageId) ?? "Stage unavailable" : ""} isVerifying={verifyMutation.isPending} isRestoring={restoreMutation.isPending} onClose={() => setDetailPayment(null)} onEdit={(payment) => { setEditingPayment(payment); setFormOpen(true); setDetailPayment(null); }} onVerify={(payment) => { void handleVerify(payment); }} onDelete={setDeletingPayment} onRestore={(payment) => { void handleRestore(payment); }} />
    </main>
  );
}
