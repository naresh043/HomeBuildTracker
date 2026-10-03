import { useMemo, useState } from "react";
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
  const [showDeleted, setShowDeleted] = useState(false);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<VendorType | undefined>();
  const [status, setStatus] = useState<VendorStatus | undefined>();

  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

  const vendorsQuery = useVendorsQuery({
    page: 1,
    limit: 100,
    includeDeleted: showDeleted,
  });

  const createVendorMutation = useCreateVendorMutation();
  const updateVendorMutation = useUpdateVendorMutation();
  const deleteVendorMutation = useDeleteVendorMutation();
  const restoreVendorMutation = useRestoreVendorMutation();

  const vendors = vendorsQuery.data?.data.vendors ?? [];

  const visibleVendors = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return vendors.filter((vendor) => {
      if (showDeleted && !vendor.isDeleted) {
        return false;
      }

      if (
        normalizedSearch &&
        !vendor.name.toLowerCase().includes(normalizedSearch)
      ) {
        return false;
      }

      if (type && vendor.type !== type) {
        return false;
      }

      if (status && vendor.status !== status) {
        return false;
      }

      return true;
    });
  }, [vendors, search, type, status, showDeleted]);

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
      const message =
        error instanceof Error ? error.message : "Unable to save vendor";

      toast.error(message);
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
      const message =
        error instanceof Error ? error.message : "Unable to delete vendor";

      toast.error(message);
    }
  };

  const handleRestore = async (vendor: Vendor) => {
    try {
      await restoreVendorMutation.mutateAsync(vendor._id);

      toast.success("Vendor restored successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to restore vendor";

      toast.error(message);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setType(undefined);
    setStatus(undefined);
    setShowDeleted(false);
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
          onSearchChange={setSearch}
          onTypeChange={setType}
          onStatusChange={setStatus}
          onShowDeletedChange={setShowDeleted}
          onClear={clearFilters}
        />

        {vendorsQuery.isLoading && <VendorLoadingState />}

        {vendorsQuery.isError && (
          <VendorErrorState
            message="Unable to load vendors. Please try again."
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

        {vendorsQuery.isSuccess &&
          vendorsQuery.data?.data.pagination.hasNextPage && (
            <p className="text-center text-xs text-gray-500">
              Showing the first 100 vendors.
            </p>
          )}
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
