import axios from "axios";
import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import ContractDeleteDialog from "@/components/contracts/ContractDeleteDialog";
import ContractDetailsDialog from "@/components/contracts/ContractDetailsDialog";
import ContractEmptyState from "@/components/contracts/ContractEmptyState";
import ContractErrorState from "@/components/contracts/ContractErrorState";
import ContractFilters, { type ContractFilterValues } from "@/components/contracts/ContractFilters";
import ContractFormDialog from "@/components/contracts/ContractFormDialog";
import ContractHeader from "@/components/contracts/ContractHeader";
import ContractList from "@/components/contracts/ContractList";
import ContractLoadingState from "@/components/contracts/ContractLoadingState";
import ContractPagination from "@/components/contracts/ContractPagination";
import type { ContractFormValues } from "@/features/contracts/contract.schema";
import { useCreateContractMutation, useDeleteContractMutation, useRestoreContractMutation, useUpdateContractMutation } from "@/features/contracts/contract.mutations";
import { useContractsQuery } from "@/features/contracts/contract.queries";
import type { Contract, ContractListParams } from "@/features/contracts/contract.types";
import { useActiveVendorsQuery } from "@/features/vendors/vendor.queries";

const EMPTY_FILTERS: ContractFilterValues = { q: "", vendorId: "", contractType: "", rateUnit: "", status: "", fromDate: "", toDate: "" };
const EMPTY_VENDORS: import("@/features/vendors/vendor.types").Vendor[] = [];
const getErrorMessage = (error: unknown, fallback: string) => axios.isAxiosError<{ message?: string }>(error) ? error.response?.data?.message ?? fallback : error instanceof Error ? error.message : fallback;
const toPayload = (values: ContractFormValues) => ({ ...values, rate: Number(values.rate), advanceAmount: Number(values.advanceAmount), ...(values.measurement === "" ? { measurement: undefined } : { measurement: Number(values.measurement) }), notes: values.notes.trim() || undefined });

export default function ContractsPage() {
 const [filters, setFilters] = useState<ContractFilterValues>(EMPTY_FILTERS);
 const [includeDeleted, setIncludeDeleted] = useState(false);
 const [page, setPage] = useState(1);
 const [formOpen, setFormOpen] = useState(false);
 const [editingContract, setEditingContract] = useState<Contract | null>(null);
 const [detailsContract, setDetailsContract] = useState<Contract | null>(null);
 const [deletingContract, setDeletingContract] = useState<Contract | null>(null);
 const vendorsQuery = useActiveVendorsQuery();
 const vendors = vendorsQuery.data?.data ?? EMPTY_VENDORS;
 const vendorNames = useMemo(() => new Map(vendors.map((vendor) => [vendor._id, vendor.name])), [vendors]);
 const params: ContractListParams = useMemo(() => ({ page, limit: 12, includeDeleted, ...(filters.q.trim() && { q: filters.q.trim() }), ...(filters.vendorId && { vendorId: filters.vendorId }), ...(filters.contractType && { contractType: filters.contractType as ContractListParams["contractType"] }), ...(filters.rateUnit && { rateUnit: filters.rateUnit as ContractListParams["rateUnit"] }), ...(filters.status && { status: filters.status as ContractListParams["status"] }), ...(filters.fromDate && { fromDate: filters.fromDate }), ...(filters.toDate && { toDate: filters.toDate }) }), [filters, includeDeleted, page]);
 const contractsQuery = useContractsQuery(params);
 const createMutation = useCreateContractMutation(); const updateMutation = useUpdateContractMutation(); const deleteMutation = useDeleteContractMutation(); const restoreMutation = useRestoreContractMutation();
 const serverItems = contractsQuery.data?.data.items ?? [];
 const contracts = serverItems.filter((contract) => includeDeleted ? contract.isDeleted : !contract.isDeleted);
 const pagination = contractsQuery.data?.data.pagination;
 const hasFilters = Boolean(Object.values(filters).some(Boolean) || includeDeleted);
 const isSubmitting = createMutation.isPending || updateMutation.isPending;
 const openCreate = () => { setDetailsContract(null); setDeletingContract(null); setEditingContract(null); setFormOpen(true); };
 const openEdit = (contract: Contract) => { setDetailsContract(null); setDeletingContract(null); setEditingContract(contract); setFormOpen(true); };
 const closeForm = () => { if (!isSubmitting) { setFormOpen(false); setEditingContract(null); } };
 const onFilterChange = (key: keyof ContractFilterValues, value: string) => { setFilters((current) => ({ ...current, [key]: value })); setPage(1); };
 const clearFilters = () => { setFilters(EMPTY_FILTERS); setIncludeDeleted(false); setPage(1); };
 const handleSubmit = async (values: ContractFormValues) => {
  try {
   if (editingContract) {
    await updateMutation.mutateAsync({ id: editingContract.id, payload: toPayload(values) });
    toast.success("Contract updated");
   } else {
    await createMutation.mutateAsync(toPayload(values));
    setPage(1);
    setIncludeDeleted(false);
    toast.success("Contract created");
   }
   setFormOpen(false); setEditingContract(null);
  } catch (error) { toast.error(getErrorMessage(error, "Unable to save contract")); }
 };
 const handleDelete = async () => { if (!deletingContract) return; try { const response = await deleteMutation.mutateAsync(deletingContract.id); setDeletingContract(null); setDetailsContract(null); toast.success("Contract archived", { description: "You can restore it from deleted contracts." }); if (response.data.isDeleted !== true) toast.error("The server did not confirm the archive."); } catch (error) { toast.error(getErrorMessage(error, "Unable to archive contract")); } };
 const handleRestore = async (contract: Contract) => { try { await restoreMutation.mutateAsync(contract.id); setDetailsContract(null); toast.success("Contract restored"); } catch (error) { toast.error(getErrorMessage(error, "Unable to restore contract")); } };
 return <main className="mx-auto w-full max-w-7xl space-y-5 px-4 py-5 pb-24 sm:px-6 sm:py-6 lg:px-8 lg:pb-8">
  <div className="space-y-1"><ContractHeader count={contracts.length} onAdd={openCreate} /><p className="text-sm text-muted-foreground">Manage construction contracts, rates, scope, advances, and financial progress.</p></div>
  <ContractFilters values={filters} vendors={vendors} includeDeleted={includeDeleted} onChange={onFilterChange} onDeletedChange={(value) => { setIncludeDeleted(value); setPage(1); }} onClear={clearFilters} />
  {vendorsQuery.isError && <p role="alert" className="rounded-xl border border-amber-400/40 bg-amber-50 p-3 text-sm text-amber-900">Active vendors could not be loaded, so a contract cannot be created. <button type="button" onClick={() => void vendorsQuery.refetch()} className="underline">Retry</button></p>}
  {contractsQuery.isFetching && !contractsQuery.isLoading && <p role="status" aria-live="polite" className="inline-flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" />Updating contract results…</p>}
  {contractsQuery.isLoading && <ContractLoadingState />}
  {contractsQuery.isError && <ContractErrorState message={getErrorMessage(contractsQuery.error, "Unable to load contracts. Check your connection and try again.")} onRetry={() => { void contractsQuery.refetch(); }} />}
  {contractsQuery.isSuccess && contracts.length === 0 && <ContractEmptyState hasFilters={hasFilters} deletedOnly={includeDeleted} onAdd={openCreate} onClear={clearFilters} />}
  {contractsQuery.isSuccess && contracts.length > 0 && <><ContractList contracts={contracts} vendorNames={vendorNames} restoringId={restoreMutation.isPending ? restoreMutation.variables : undefined} onDetails={setDetailsContract} onEdit={openEdit} onDelete={(contract) => { setDetailsContract(null); setDeletingContract(contract); }} onRestore={(contract) => { void handleRestore(contract); }} />{pagination && <ContractPagination pagination={pagination} onPageChange={setPage} />}</>}
  <ContractFormDialog open={formOpen} contract={editingContract} vendors={vendors} submitting={isSubmitting} onSubmit={(values) => { void handleSubmit(values); }} onClose={closeForm} />
  <ContractDetailsDialog contract={detailsContract} vendorName={detailsContract ? vendorNames.get(detailsContract.vendorId) ?? "Vendor no longer active" : ""} isRestoring={restoreMutation.isPending} onClose={() => setDetailsContract(null)} onEdit={openEdit} onDelete={(contract) => { setDetailsContract(null); setDeletingContract(contract); }} onRestore={(contract) => { void handleRestore(contract); }} />
  <ContractDeleteDialog contract={deletingContract} isDeleting={deleteMutation.isPending} onConfirm={() => { void handleDelete(); }} onClose={() => { if (!deleteMutation.isPending) setDeletingContract(null); }} />
 </main>;
}
