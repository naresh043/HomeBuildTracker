import { X } from "lucide-react";

import StageForm from "@/components/stages/StageForm";

import type { ConstructionStage } from "@/features/stages/stage.types";
import type {
  CreateStageFormValues,
  UpdateStageFormValues,
} from "@/features/stages/stage.schema";

interface StageFormDialogProps {
  isOpen: boolean;
  stage?: ConstructionStage | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (
    values: CreateStageFormValues | UpdateStageFormValues,
  ) => Promise<void> | void;
}

export default function StageFormDialog({
  isOpen,
  stage = null,
  isSubmitting = false,
  onClose,
  onSubmit,
}: StageFormDialogProps) {
  if (!isOpen) {
    return null;
  }

  const isEditing = Boolean(stage);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="stage-form-dialog-title"
        className="flex max-h-[95dvh] w-full flex-col overflow-hidden rounded-t-3xl border bg-background shadow-2xl sm:max-w-xl sm:rounded-2xl"
      >
        {/* Dialog header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <h2
              id="stage-form-dialog-title"
              className="text-base font-semibold text-foreground"
            >
              {isEditing ? "Edit Construction Stage" : "Add Construction Stage"}
            </h2>

            <p className="mt-0.5 text-xs text-muted-foreground">
              {isEditing
                ? "Update the stage details and current status."
                : "Add a new stage to your construction plan."}
            </p>
          </div>

          <button
            type="button"
            aria-label="Close stage form"
            disabled={isSubmitting}
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-muted disabled:pointer-events-none disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          <StageForm
            stage={stage}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}