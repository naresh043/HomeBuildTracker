import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

import type { ConstructionStage } from "@/features/stages/stage.types";

interface StageDeleteDialogProps {
  stage: ConstructionStage | null;
  isOpen: boolean;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function StageDeleteDialog({
  stage,
  isOpen,
  isDeleting = false,
  onClose,
  onConfirm,
}: StageDeleteDialogProps) {
  if (!isOpen || !stage) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) {
          onClose();
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-stage-title"
        aria-describedby="delete-stage-description"
        className="w-full rounded-t-3xl border bg-background p-5 shadow-2xl sm:max-w-md sm:rounded-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div
              aria-hidden="true"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10"
            >
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>

            <div className="min-w-0">
              <h2
                id="delete-stage-title"
                className="text-base font-semibold text-foreground"
              >
                Delete stage?
              </h2>

              <p
                id="delete-stage-description"
                className="mt-1 text-sm leading-5 text-muted-foreground"
              >
                This will remove the stage from the active construction stages.
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close delete dialog"
            disabled={isDeleting}
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-muted disabled:pointer-events-none disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stage information */}
        <div className="mt-5 rounded-2xl border bg-muted/30 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Stage
          </p>

          <p className="mt-1 break-words text-sm font-semibold text-foreground">
            {stage.name}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Stage order: {stage.order}
          </p>
        </div>

        {/* Warning */}
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 dark:border-amber-900/60 dark:bg-amber-950/30">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300" />

            <p className="text-sm leading-5 font-medium text-amber-900 dark:text-amber-100">
              This stage will be soft deleted. It will not be permanently
              removed and can be restored later.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="min-h-11 w-full rounded-xl border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted active:bg-muted disabled:pointer-events-none disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-destructive px-4 text-sm font-semibold text-destructive-foreground transition-opacity hover:opacity-90 active:opacity-80 disabled:pointer-events-none disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Delete Stage</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
