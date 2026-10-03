import { useMemo, useState } from "react";
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

  const [formOpen, setFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] =
    useState<Material | null>(null);

  const [deletingMaterial, setDeletingMaterial] =
    useState<Material | null>(null);

  const materialsQuery = useMaterialsQuery({
    page: 1,
    limit: 100,
    q: search.trim() || undefined,
    category: category || undefined,
    includeDeleted: showDeleted,
  });

  const createMutation = useCreateMaterialMutation();
  const updateMutation = useUpdateMaterialMutation();
  const deleteMutation = useDeleteMaterialMutation();
  const restoreMutation = useRestoreMaterialMutation();

  const materials = materialsQuery.data?.data.materials ?? [];

  const visibleMaterials = useMemo(
    () =>
      showDeleted
        ? materials.filter((material) => material.isDeleted)
        : materials.filter((material) => !material.isDeleted),
    [materials, showDeleted],
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
    } catch {
      toast.error(
        editingMaterial
          ? "Failed to update material"
          : "Failed to create material",
      );
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
    } catch {
      toast.error("Failed to delete material");
    }
  };

  const handleRestore = async (material: Material) => {
    try {
      await restoreMutation.mutateAsync(material._id);

      toast.success("Material restored successfully");
    } catch {
      toast.error("Failed to restore material");
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
    setShowDeleted(false);
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
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onShowDeletedChange={setShowDeleted}
          onClear={handleClearFilters}
        />

        {materialsQuery.isLoading && <MaterialLoadingState />}

        {materialsQuery.isError && !materialsQuery.isLoading && (
          <MaterialErrorState
            message="Unable to load materials. Please check your connection and try again."
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

        {materialsQuery.isSuccess &&
          materialsQuery.data.data.pagination.total > 100 && (
            <p className="text-center text-sm text-muted-foreground">
              Showing the first 100 materials.
            </p>
          )}
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