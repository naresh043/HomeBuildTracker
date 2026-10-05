import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

import VendorDeleteDialog from "@/components/vendors/VendorDeleteDialog";
import VendorEmptyState from "@/components/vendors/VendorEmptyState";
import VendorErrorState from "@/components/vendors/VendorErrorState";
import VendorFilters from "@/components/vendors/VendorFilters";
import VendorFormDialog from "@/components/vendors/VendorFormDialog";
import VendorHeader from "@/components/vendors/VendorHeader";
import VendorList from "@/components/vendors/VendorList";
import VendorLoadingState from "@/components/vendors/VendorLoadingState";

import {
  useCreateVendorMutation,
  useDeleteVendorMutation,
  useRestoreVendorMutation,
  useUpdateVendorMutation,
} from "@/features/vendors/vendor.mutations";

import { useVendorsQuery } from "@/features/vendors/vendor.queries";

import type { CreateVendorFormValues } from "@/features/vendors/vendor.schema";

import type {
  Vendor,
  VendorStatus,
  VendorType,
} from "@/features/vendors/vendor.types";

const VendorsPage = () => {
  const getErrorMessage = (error: unknown, fallback: string) => axios.isAxiosError<{ message?: string }>(error) ? error.response?.data?.message ?? fallback : error instanceof Error ? error.message : fallback;
  const [showDeleted, setShowDeleted] = useState(false);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<VendorType | undefined>();
  const [status, setStatus] = useState<VendorStatus | undefined>();
  const [page, setPage] = useState(1);

  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

  const vendorsQuery = useVendorsQuery({
    page,
    limit: 20,
    includeDeleted: showDeleted,
    q: search.trim() || undefined,
    type,
    status,
  });

  const createVendorMutation = useCreateVendorMutation();
  const updateVendorMutation = useUpdateVendorMutation();
  const deleteVendorMutation = useDeleteVendorMutation();
  const restoreVendorMutation = useRestoreVendorMutation();

  const vendors = useMemo(() => vendorsQuery.data?.data.vendors ?? [], [vendorsQuery.data?.data.vendors]);

  const visibleVendors = vendors;

  const openCreateForm = () => {
    setSelectedVendor(null);
    setIsFormOpen(true);
  };

  const openEditForm = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (createVendorMutation.isPending || updateVendorMutation.isPending) {
      return;
    }

    setIsFormOpen(false);
    setSelectedVendor(null);
  };

  const handleSubmit = async (values: CreateVendorFormValues) => {
    try {
      if (selectedVendor) {
        await updateVendorMutation.mutateAsync({
          vendorId: selectedVendor._id,
          payload: values,
        });

        toast.success("Vendor updated successfully");
      } else {
        await createVendorMutation.mutateAsync(values);

        toast.success("Vendor created successfully");
      }

      setIsFormOpen(false);
      setSelectedVendor(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to save vendor"));
    }
  };

  const openDeleteDialog = (vendor: Vendor) => {
    setVendorToDelete(vendor);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    if (deleteVendorMutation.isPending) {
      return;
    }

    setIsDeleteDialogOpen(false);
    setVendorToDelete(null);
  };

  const handleDelete = async () => {
    if (!vendorToDelete) {
      return;
    }

    try {
      await deleteVendorMutation.mutateAsync(vendorToDelete._id);

      toast.success("Vendor deleted successfully");

      setIsDeleteDialogOpen(false);
      setVendorToDelete(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete vendor"));
    }
  };

  const handleRestore = async (vendor: Vendor) => {
    try {
      await restoreVendorMutation.mutateAsync(vendor._id);

      toast.success("Vendor restored successfully");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to restore vendor"));
    }
  };

  const clearFilters = () => {
    setSearch(""); setType(undefined); setStatus(undefined); setShowDeleted(false); setPage(1);
  };

  const isFormSubmitting =
    createVendorMutation.isPending || updateVendorMutation.isPending;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 pb-24 sm:px-6 sm:py-6 lg:px-8 lg:pb-8">
      <div className="space-y-5">
        <VendorHeader
          vendorCount={visibleVendors.length}
          onAddVendor={openCreateForm}
        />

        <VendorFilters
          search={search}
          type={type}
          status={status}
          showDeleted={showDeleted}
          onSearchChange={(value) => { setSearch(value); setPage(1); }}
          onTypeChange={(value) => { setType(value); setPage(1); }}
          onStatusChange={(value) => { setStatus(value); setPage(1); }}
          onShowDeletedChange={(value) => { setShowDeleted(value); setPage(1); }}
          onClear={clearFilters}
        />

        {vendorsQuery.isLoading && <VendorLoadingState />}

        {vendorsQuery.isError && (
          <VendorErrorState
            message={getErrorMessage(vendorsQuery.error, "Unable to load vendors. Please try again.")}
            onRetry={() => {
              void vendorsQuery.refetch();
            }}
          />
        )}

        {vendorsQuery.isSuccess && visibleVendors.length === 0 && (
          <VendorEmptyState
            showDeleted={showDeleted}
            onAddVendor={openCreateForm}
          />
        )}

        {vendorsQuery.isSuccess && visibleVendors.length > 0 && (
          <VendorList
            vendors={visibleVendors}
            onEdit={openEditForm}
            onDelete={openDeleteDialog}
            onRestore={handleRestore}
          />
        )}

        {vendorsQuery.isSuccess && vendorsQuery.data.data.pagination.totalPages > 1 && <div className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-3">
          <button type="button" aria-label="Previous vendors page" disabled={!vendorsQuery.data.data.pagination.hasPreviousPage} onClick={() => setPage((current) => Math.max(1, current - 1))} className="inline-flex min-h-10 items-center gap-1 rounded-xl border px-3 text-sm disabled:opacity-40"><ChevronLeft className="h-4 w-4"/><span className="hidden sm:inline">Previous</span></button>
          <span className="text-sm" aria-live="polite">Page {vendorsQuery.data.data.pagination.page} of {vendorsQuery.data.data.pagination.totalPages}</span>
          <button type="button" aria-label="Next vendors page" disabled={!vendorsQuery.data.data.pagination.hasNextPage} onClick={() => setPage((current) => current + 1)} className="inline-flex min-h-10 items-center gap-1 rounded-xl border px-3 text-sm disabled:opacity-40"><span className="hidden sm:inline">Next</span><ChevronRight className="h-4 w-4"/></button>
        </div>}
      </div>

      <VendorFormDialog
        open={isFormOpen}
        vendor={selectedVendor}
        isSubmitting={isFormSubmitting}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />

      <VendorDeleteDialog
        open={isDeleteDialogOpen}
        vendor={vendorToDelete}
        isDeleting={deleteVendorMutation.isPending}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
      />
    </main>
  );
};

export default VendorsPage;
