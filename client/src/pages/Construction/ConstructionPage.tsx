import { useMemo, useState } from "react";
import { toast } from "sonner";

import StageDeleteDialog from "@/components/stages/StageDeleteDialog";
import StageEmptyState from "@/components/stages/StageEmptyState";
import StageErrorState from "@/components/stages/StageErrorState";
import StageFilters from "@/components/stages/StageFilters";
import StageForm from "@/components/stages/StageForm";
import StageHeader from "@/components/stages/StageHeader";
import StageList from "@/components/stages/StageList";
import StageLoadingState from "@/components/stages/StageLoadingState";
import StageProgressSummary from "@/components/stages/StageProgressSummary";
import StageReorder from "@/components/stages/StageReorder";

import {
  useCreateStageMutation,
  useDeleteStageMutation,
  useReorderStagesMutation,
  useRestoreStageMutation,
  useUpdateStageMutation,
} from "@/features/stages/stage.mutations";

import { useStagesQuery } from "@/features/stages/stage.queries";

import type { ConstructionStageStatus } from "@/features/stages/stage.types";

import type {
  CreateStageFormValues,
  UpdateStageFormValues,
} from "@/features/stages/stage.schema";

import {
  getActiveConstructionStages,
  sortConstructionStages,
} from "@/features/stages/stage.utils";

export default function ConstructionPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReorderOpen, setIsReorderOpen] = useState(false);

  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [deleteStageId, setDeleteStageId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState<ConstructionStageStatus | "ALL">("ALL");
  const [showDeleted, setShowDeleted] = useState(false);

  const { data, isLoading, isError, error, isFetching, refetch } =
    useStagesQuery(showDeleted);

  const createStageMutation = useCreateStageMutation();
  const updateStageMutation = useUpdateStageMutation();
  const reorderStagesMutation = useReorderStagesMutation();
  const deleteStageMutation = useDeleteStageMutation();
  const restoreStageMutation = useRestoreStageMutation();

  const allStages = useMemo(
    () => sortConstructionStages(data?.data ?? []),
    [data?.data],
  );

  const filteredStages = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return allStages.filter((stage) => {
      if (!showDeleted && stage.isDeleted) {
        return false;
      }

      if (status !== "ALL" && stage.status !== status) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText = [
        stage.name,
        stage.description ?? "",
        stage.notes ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [allStages, search, showDeleted, status]);

  const activeStages = useMemo(
    () => getActiveConstructionStages(allStages),
    [allStages],
  );

  const editingStage = useMemo(
    () =>
      editingStageId
        ? (allStages.find((stage) => stage._id === editingStageId) ?? null)
        : null,
    [allStages, editingStageId],
  );

  const deleteStage = useMemo(
    () =>
      deleteStageId
        ? (allStages.find((stage) => stage._id === deleteStageId) ?? null)
        : null,
    [allStages, deleteStageId],
  );

  const isFormSubmitting =
    createStageMutation.isPending || updateStageMutation.isPending;

  const isDeleting = deleteStageMutation.isPending;
  const isRestoring = restoreStageMutation.isPending;
  const isReordering = reorderStagesMutation.isPending;

  const handleOpenCreate = () => {
    setEditingStageId(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (stage: (typeof allStages)[number]) => {
    setEditingStageId(stage._id);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    if (isFormSubmitting) {
      return;
    }

    setIsFormOpen(false);
    setEditingStageId(null);
  };

  const handleOpenReorder = () => {
    if (isReordering || activeStages.length < 2) {
      return;
    }

    setIsReorderOpen(true);
  };

  const handleCloseReorder = () => {
    if (isReordering) {
      return;
    }

    setIsReorderOpen(false);
  };

  const handleSaveReorder = async (stageIds: string[]) => {
    if (isReordering) {
      return;
    }

    try {
      await reorderStagesMutation.mutateAsync({
        stageIds,
      });

      toast.success("Construction stage order updated successfully.");

      setIsReorderOpen(false);
    } catch {
      toast.error("Failed to update construction stage order.");
    }
  };

  const handleCreateStage = async (
    values: CreateStageFormValues | UpdateStageFormValues,
  ) => {
    if (editingStage) {
      return;
    }

    const createValues = values as CreateStageFormValues;

    try {
      await createStageMutation.mutateAsync({
        name: createValues.name.trim(),
        description: createValues.description?.trim() || undefined,
        status: createValues.status,
        order: createValues.order,
        startDate: createValues.startDate?.trim() || undefined,
        completionDate:
          createValues.completionDate?.trim() || undefined,
        notes: createValues.notes?.trim() || undefined,
      });

      toast.success("Construction stage created successfully.");

      setIsFormOpen(false);
      setEditingStageId(null);
    } catch {
      toast.error("Failed to create construction stage.");
    }
  };

  const handleUpdateStage = async (
    values: CreateStageFormValues | UpdateStageFormValues,
  ) => {
    if (!editingStage) {
      return;
    }

    const updateValues = values as UpdateStageFormValues;

    try {
      await updateStageMutation.mutateAsync({
        stageId: editingStage._id,
        payload: {
          name: updateValues.name?.trim() || undefined,
          status: updateValues.status,
          completionDate:
            updateValues.completionDate?.trim() || undefined,
          notes: updateValues.notes?.trim() || undefined,
        },
      });

      toast.success("Construction stage updated successfully.");

      setIsFormOpen(false);
      setEditingStageId(null);
    } catch {
      toast.error("Failed to update construction stage.");
    }
  };

  const handleSubmitStage = async (
    values: CreateStageFormValues | UpdateStageFormValues,
  ) => {
    if (editingStage) {
      await handleUpdateStage(values);
      return;
    }

    await handleCreateStage(values);
  };

  const handleRequestDelete = (stage: (typeof allStages)[number]) => {
    setDeleteStageId(stage._id);
  };

  const handleCloseDelete = () => {
    if (isDeleting) {
      return;
    }

    setDeleteStageId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteStage) {
      return;
    }

    try {
      await deleteStageMutation.mutateAsync(deleteStage._id);

      toast.success("Construction stage deleted successfully.");

      setDeleteStageId(null);
    } catch {
      toast.error("Failed to delete construction stage.");
    }
  };

  const handleRestoreStage = async (
    stage: (typeof allStages)[number],
  ) => {
    try {
      await restoreStageMutation.mutateAsync(stage._id);

      toast.success("Construction stage restored successfully.");
    } catch {
      toast.error("Failed to restore construction stage.");
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("ALL");
    setShowDeleted(false);
  };

  const hasFilters =
    search.trim().length > 0 || status !== "ALL" || showDeleted;

  const hasStages = allStages.length > 0;
  const hasFilteredStages = filteredStages.length > 0;

  const pageErrorMessage =
    error instanceof Error
      ? error.message
      : "We couldn't load the construction stages. Please try again.";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8">
      <StageHeader
        totalStages={activeStages.length}
        onAddStage={handleOpenCreate}
      />

      {isLoading ? (
        <StageLoadingState />
      ) : isError ? (
        <StageErrorState
          message={pageErrorMessage}
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={handleOpenReorder}
              disabled={isReordering || activeStages.length < 2}
              className="min-h-11 w-full rounded-xl border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted active:bg-muted disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
            >
              Reorder stages
            </button>
          </div>

          <StageProgressSummary stages={allStages} />

          <StageFilters
            search={search}
            status={status}
            showDeleted={showDeleted}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            onShowDeletedChange={setShowDeleted}
            onClear={handleClearFilters}
          />

          {!hasStages ? (
            <StageEmptyState
              title="No construction stages"
              description="Create your first construction stage to start tracking the house construction."
              actionLabel="Add Stage"
              onAction={handleOpenCreate}
            />
          ) : !hasFilteredStages ? (
            <StageEmptyState
              title="No stages found"
              description={
                hasFilters
                  ? "No construction stage matches the current filters."
                  : "There are currently no stages to display."
              }
              actionLabel={hasFilters ? "Clear Filters" : "Add Stage"}
              onAction={
                hasFilters ? handleClearFilters : handleOpenCreate
              }
            />
          ) : (
            <StageList
              stages={filteredStages}
              deletingStageId={
                deleteStageMutation.isPending ? deleteStageId : null
              }
              restoringStageId={
                restoreStageMutation.isPending ? null : null
              }
              onEditStage={handleOpenEdit}
              onDeleteStage={handleRequestDelete}
              onRestoreStage={handleRestoreStage}
            />
          )}
        </>
      )}

      {isFormOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !isFormSubmitting
            ) {
              handleCloseForm();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="construction-stage-form-title"
            className="max-h-[95dvh] w-full overflow-y-auto rounded-t-3xl border bg-background shadow-2xl sm:max-w-xl sm:rounded-2xl"
          >
            <div className="p-4 sm:p-5">
              <h2
                id="construction-stage-form-title"
                className="sr-only"
              >
                {editingStage
                  ? "Edit construction stage"
                  : "Add construction stage"}
              </h2>

              <StageForm
                stage={editingStage}
                isSubmitting={isFormSubmitting}
                onSubmit={handleSubmitStage}
                onClose={handleCloseForm}
              />
            </div>
          </div>
        </div>
      )}

      {isReorderOpen && (
        <StageReorder
          stages={activeStages}
          isSaving={isReordering}
          onSave={handleSaveReorder}
          onClose={handleCloseReorder}
        />
      )}

      <StageDeleteDialog
        stage={deleteStage}
        isOpen={Boolean(deleteStage)}
        isDeleting={isDeleting}
        onClose={handleCloseDelete}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}