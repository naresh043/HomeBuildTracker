import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

import MaterialDeleteDialog from "@/components/materials/MaterialDeleteDialog";
import MaterialEmptyState from "@/components/materials/MaterialEmptyState";
import MaterialErrorState from "@/components/materials/MaterialErrorState";
import MaterialFilters from "@/components/materials/MaterialFilters";
import MaterialFormDialog from "@/components/materials/MaterialFormDialog";
import MaterialHeader from "@/components/materials/MaterialHeader";
import MaterialList from "@/components/materials/MaterialList";
import MaterialLoadingState from "@/components/materials/MaterialLoadingState";
import { getMaterialCategories } from "@/features/materials/material.utils";

import {
  useCreateMaterialMutation,
  useDeleteMaterialMutation,
  useRestoreMaterialMutation,
  useUpdateMaterialMutation,
} from "@/features/materials/material.mutations";
import { useMaterialsQuery } from "@/features/materials/material.queries";

import type { CreateMaterialFormValues } from "@/features/materials/material.schema";
import type { Material } from "@/features/materials/material.types";

export default function MaterialsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [page, setPage] = useState(1);
  const getErrorMessage = (error: unknown, fallback: string) => axios.isAxiosError<{ message?: string }>(error) ? error.response?.data?.message ?? fallback : error instanceof Error ? error.message : fallback;

  const [formOpen, setFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] =
    useState<Material | null>(null);

  const [deletingMaterial, setDeletingMaterial] =
    useState<Material | null>(null);

  const materialsQuery = useMaterialsQuery({
    page,
    limit: 20,
    q: search.trim() || undefined,
    category: category || undefined,
    includeDeleted: showDeleted,
  });

  const createMutation = useCreateMaterialMutation();
  const updateMutation = useUpdateMaterialMutation();
  const deleteMutation = useDeleteMaterialMutation();
  const restoreMutation = useRestoreMaterialMutation();

  const materials = useMemo(() => materialsQuery.data?.data.materials ?? [], [materialsQuery.data?.data.materials]);

  const visibleMaterials = useMemo(
    () => materials,
    [materials],
  );

  const categories = useMemo(
    () =>
      getMaterialCategories(
        materials.map((material) => material.category),
      ),
    [materials],
  );

  const hasFilters =
    search.trim() !== "" ||
    category !== "" ||
    showDeleted;

  const isFormSubmitting =
    createMutation.isPending || updateMutation.isPending;

  const handleOpenCreate = () => {
    setEditingMaterial(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    if (isFormSubmitting) {
      return;
    }

    setFormOpen(false);
    setEditingMaterial(null);
  };

  const handleSubmit = async (
    values: CreateMaterialFormValues,
  ) => {
    try {
      if (editingMaterial) {
        await updateMutation.mutateAsync({
          materialId: editingMaterial._id,
          payload: values,
        });

        toast.success("Material updated successfully");
      } else {
        await createMutation.mutateAsync(values);

        toast.success("Material created successfully");
      }

      setFormOpen(false);
      setEditingMaterial(null);
    } catch (error) {
      toast.error(getErrorMessage(error, editingMaterial ? "Failed to update material" : "Failed to create material"));
    }
  };

  const handleDelete = async () => {
    if (!deletingMaterial) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(
        deletingMaterial._id,
      );

      toast.success("Material deleted successfully");
      setDeletingMaterial(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete material"));
    }
  };

  const handleRestore = async (material: Material) => {
    try {
      await restoreMutation.mutateAsync(material._id);

      toast.success("Material restored successfully");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to restore material"));
    }
  };

  const handleClearFilters = () => {
    setSearch(""); setCategory(""); setShowDeleted(false); setPage(1);
  };

  const handleRetry = () => {
    void materialsQuery.refetch();
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 pb-24 sm:px-6 sm:py-6 lg:px-8">
      <div className="space-y-5">
        <MaterialHeader onAdd={handleOpenCreate} />

        <MaterialFilters
          search={search}
          category={category}
          categories={categories}
          showDeleted={showDeleted}
          onSearchChange={(value) => { setSearch(value); setPage(1); }}
          onCategoryChange={(value) => { setCategory(value); setPage(1); }}
          onShowDeletedChange={(value) => { setShowDeleted(value); setPage(1); }}
          onClear={handleClearFilters}
        />

        {materialsQuery.isLoading && <MaterialLoadingState />}

        {materialsQuery.isError && !materialsQuery.isLoading && (
          <MaterialErrorState
            message={getErrorMessage(materialsQuery.error, "Unable to load materials. Please check your connection and try again.")}
            onRetry={handleRetry}
          />
        )}

        {materialsQuery.isSuccess &&
          !materialsQuery.isLoading &&
          visibleMaterials.length === 0 && (
            <MaterialEmptyState
              hasFilters={hasFilters}
              onClearFilters={handleClearFilters}
            />
          )}

        {materialsQuery.isSuccess &&
          !materialsQuery.isLoading &&
          visibleMaterials.length > 0 && (
            <MaterialList
              materials={visibleMaterials}
              onEdit={handleOpenEdit}
              onDelete={setDeletingMaterial}
              onRestore={handleRestore}
            />
          )}

        {materialsQuery.isSuccess && materialsQuery.data.data.pagination.totalPages > 1 && <div className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-3">
          <button type="button" aria-label="Previous materials page" disabled={!materialsQuery.data.data.pagination.hasPreviousPage} onClick={() => setPage((current) => Math.max(1, current - 1))} className="inline-flex min-h-10 items-center gap-1 rounded-xl border px-3 text-sm disabled:opacity-40"><ChevronLeft className="h-4 w-4"/><span className="hidden sm:inline">Previous</span></button>
          <span className="text-sm" aria-live="polite">Page {materialsQuery.data.data.pagination.page} of {materialsQuery.data.data.pagination.totalPages}</span>
          <button type="button" aria-label="Next materials page" disabled={!materialsQuery.data.data.pagination.hasNextPage} onClick={() => setPage((current) => current + 1)} className="inline-flex min-h-10 items-center gap-1 rounded-xl border px-3 text-sm disabled:opacity-40"><span className="hidden sm:inline">Next</span><ChevronRight className="h-4 w-4"/></button>
        </div>}
      </div>

      <MaterialFormDialog
        open={formOpen}
        material={editingMaterial}
        categories={categories}
        isSubmitting={isFormSubmitting}
        onSubmit={handleSubmit}
        onClose={handleCloseForm}
      />

      <MaterialDeleteDialog
        material={deletingMaterial}
        open={Boolean(deletingMaterial)}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setDeletingMaterial(null);
          }
        }}
      />
    </main>
  );
}
