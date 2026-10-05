import axios from "axios";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import SupplierAgreementDeleteDialog from "@/components/supplier-agreements/SupplierAgreementDeleteDialog";
import SupplierAgreementDetailsDialog from "@/components/supplier-agreements/SupplierAgreementDetailsDialog";
import SupplierAgreementEmptyState from "@/components/supplier-agreements/SupplierAgreementEmptyState";
import SupplierAgreementErrorState from "@/components/supplier-agreements/SupplierAgreementErrorState";
import SupplierAgreementFilters, { type SupplierAgreementFilterValues } from "@/components/supplier-agreements/SupplierAgreementFilters";
import SupplierAgreementFormDialog from "@/components/supplier-agreements/SupplierAgreementFormDialog";
import SupplierAgreementHeader from "@/components/supplier-agreements/SupplierAgreementHeader";
import SupplierAgreementList from "@/components/supplier-agreements/SupplierAgreementList";
import SupplierAgreementLoadingState from "@/components/supplier-agreements/SupplierAgreementLoadingState";
import SupplierAgreementPagination from "@/components/supplier-agreements/SupplierAgreementPagination";
import type { SupplierAgreementFormValues } from "@/features/supplier-agreements/supplier-agreement.schema";
import { useCreateSupplierAgreementMutation, useDeleteSupplierAgreementMutation, useRestoreSupplierAgreementMutation, useUpdateSupplierAgreementMutation } from "@/features/supplier-agreements/supplier-agreement.mutations";
import { useSupplierAgreementsQuery } from "@/features/supplier-agreements/supplier-agreement.queries";
import type { SupplierAgreement, SupplierAgreementQueryParams } from "@/features/supplier-agreements/supplier-agreement.types";
import { useActiveVendorsQuery } from "@/features/vendors/vendor.queries";
import { useMaterialsQuery } from "@/features/materials/material.queries";
import type { Vendor } from "@/features/vendors/vendor.types";
import type { Material } from "@/features/materials/material.types";

const EMPTY_FILTERS: SupplierAgreementFilterValues = { vendorId: "", status: "" };
const EMPTY_VENDORS: Vendor[] = [];
const EMPTY_MATERIALS: Material[] = [];
const getErrorMessage = (error: unknown, fallback: string) => axios.isAxiosError<{ message?: string }>(error) ? error.response?.data?.message ?? fallback : error instanceof Error ? error.message : fallback;

export default function SupplierAgreementsPage() {
  const [filters, setFilters] = useState<SupplierAgreementFilterValues>(EMPTY_FILTERS);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [page, setPage] = useState(1);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState<SupplierAgreement | null>(null);
  const [detailsAgreement, setDetailsAgreement] = useState<SupplierAgreement | null>(null);
  const [deletingAgreement, setDeletingAgreement] = useState<SupplierAgreement | null>(null);

  const vendorsQuery = useActiveVendorsQuery();
  const materialsQuery = useMaterialsQuery({ page: 1, limit: 100 });
  const vendors = vendorsQuery.data?.data ?? EMPTY_VENDORS;
  const materials = materialsQuery.data?.data.materials ?? EMPTY_MATERIALS;
  const params: SupplierAgreementQueryParams = useMemo(() => ({ page, limit: includeDeleted ? 100 : 20, includeDeleted, ...(filters.vendorId && { vendorId: filters.vendorId }), ...(filters.status && { status: filters.status as SupplierAgreementQueryParams["status"] }) }), [filters, includeDeleted, page]);
  const agreementsQuery = useSupplierAgreementsQuery(params);
  const createMutation = useCreateSupplierAgreementMutation();
  const updateMutation = useUpdateSupplierAgreementMutation();
  const deleteMutation = useDeleteSupplierAgreementMutation();
  const restoreMutation = useRestoreSupplierAgreementMutation();

  const agreements = useMemo(() => {
    const responseItems = agreementsQuery.data?.data.items ?? [];
    return responseItems.filter((agreement) => includeDeleted ? agreement.isDeleted : !agreement.isDeleted);
  }, [agreementsQuery.data?.data.items, includeDeleted]);
  const pagination = agreementsQuery.data?.data.pagination;
  const hasFilters = Boolean(filters.vendorId || filters.status);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const openCreate = () => { setDetailsAgreement(null); setDeletingAgreement(null); setEditingAgreement(null); setFormDialogOpen(true); };
  const openEdit = (agreement: SupplierAgreement) => { setDetailsAgreement(null); setDeletingAgreement(null); setEditingAgreement(agreement); setFormDialogOpen(true); };
  const closeForm = () => { if (!isSubmitting) { setFormDialogOpen(false); setEditingAgreement(null); } };
  const onFilterChange = (key: keyof SupplierAgreementFilterValues, value: string) => { setFilters((current) => ({ ...current, [key]: value })); setPage(1); };
  const clearFilters = () => { setFilters(EMPTY_FILTERS); setIncludeDeleted(false); setPage(1); };

  const handleSubmit = async (values: SupplierAgreementFormValues) => {
    try {
      const payload = { ...values, vendorId: values.vendorId, materialIds: [...new Set(values.materialIds)], advanceAmount: Number(values.advanceAmount), startDate: values.startDate, status: values.status, notes: values.notes.trim() || undefined };
      if (editingAgreement) {
        await updateMutation.mutateAsync({ id: editingAgreement.id, payload });
        toast.success("Supplier agreement updated");
      } else {
        await createMutation.mutateAsync(payload);
        setPage(1);
        setIncludeDeleted(false);
        toast.success("Supplier agreement created");
      }
      setFormDialogOpen(false);
      setEditingAgreement(null);
    } catch (error) { toast.error(getErrorMessage(error, "Unable to save supplier agreement")); }
  };

  const handleDelete = async () => {
    if (!deletingAgreement) return;
    try {
      await deleteMutation.mutateAsync(deletingAgreement.id);
      setDeletingAgreement(null);
      setDetailsAgreement(null);
      toast.success("Supplier agreement deleted", { description: "You can restore it from deleted agreements." });
    } catch (error) { toast.error(getErrorMessage(error, "Unable to delete supplier agreement")); }
  };

  const handleRestore = async (agreement: SupplierAgreement) => {
    try { await restoreMutation.mutateAsync(agreement.id); setDetailsAgreement(null); toast.success("Supplier agreement restored"); }
    catch (error) { toast.error(getErrorMessage(error, "Unable to restore supplier agreement")); }
  };

  return <main className="mx-auto w-full max-w-7xl space-y-5 px-4 py-5 pb-24 sm:px-6 sm:py-6 lg:px-8 lg:pb-8">
    <div className="space-y-1"><SupplierAgreementHeader count={agreements.length} onAdd={openCreate} /><p className="text-sm text-muted-foreground">Manage material supply commitments, advances, and linked receipts.</p></div>
    <SupplierAgreementFilters values={filters} vendors={vendors} includeDeleted={includeDeleted} onChange={onFilterChange} onDeletedChange={(value) => { setIncludeDeleted(value); setPage(1); }} onClear={clearFilters} />
    {vendorsQuery.isError && <p role="alert" className="rounded-xl border border-amber-400/40 bg-amber-50 p-3 text-sm text-amber-900">Active vendors could not be loaded. <button type="button" onClick={() => void vendorsQuery.refetch()} className="underline">Retry</button></p>}
    {materialsQuery.isError && <p role="alert" className="rounded-xl border border-amber-400/40 bg-amber-50 p-3 text-sm text-amber-900">Materials could not be loaded. <button type="button" onClick={() => void materialsQuery.refetch()} className="underline">Retry</button></p>}
    {agreementsQuery.isFetching && !agreementsQuery.isLoading && <p role="status" aria-live="polite" className="inline-flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" />Updating agreement results…</p>}
    {agreementsQuery.isLoading && <SupplierAgreementLoadingState />}
    {agreementsQuery.isError && <SupplierAgreementErrorState message={getErrorMessage(agreementsQuery.error, "Unable to load supplier agreements. Check your connection and try again.")} onRetry={() => { void agreementsQuery.refetch(); }} />}
    {agreementsQuery.isSuccess && agreements.length === 0 && <SupplierAgreementEmptyState hasFilters={hasFilters} deletedOnly={includeDeleted} onAdd={openCreate} onClear={clearFilters} />}
    {agreementsQuery.isSuccess && agreements.length > 0 && <><SupplierAgreementList agreements={agreements} vendors={vendors} materials={materials} restoringId={restoreMutation.isPending ? restoreMutation.variables : undefined} onDetails={setDetailsAgreement} onEdit={openEdit} onDelete={(agreement) => { setDetailsAgreement(null); setDeletingAgreement(agreement); }} onRestore={(agreement) => { void handleRestore(agreement); }} />{pagination && <SupplierAgreementPagination pagination={pagination} onPageChange={setPage} />}</>}
    <SupplierAgreementFormDialog open={formDialogOpen} agreement={editingAgreement} vendors={vendors} materials={materials} submitting={isSubmitting} onSubmit={(values) => { void handleSubmit(values); }} onClose={closeForm} />
    <SupplierAgreementDetailsDialog agreement={detailsAgreement} vendors={vendors} materials={materials} isRestoring={restoreMutation.isPending} onClose={() => setDetailsAgreement(null)} onEdit={openEdit} onDelete={(agreement) => { setDetailsAgreement(null); setDeletingAgreement(agreement); }} onRestore={(agreement) => { void handleRestore(agreement); }} />
    <SupplierAgreementDeleteDialog agreement={deletingAgreement} vendorName={deletingAgreement ? vendors.find((vendor) => vendor._id === deletingAgreement.vendorId)?.name ?? "Vendor no longer active" : ""} isDeleting={deleteMutation.isPending} onConfirm={() => { void handleDelete(); }} onClose={() => { if (!deleteMutation.isPending) setDeletingAgreement(null); }} />
  </main>;
}
