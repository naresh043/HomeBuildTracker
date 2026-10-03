import { AlertTriangle, Loader2, X } from "lucide-react";

import type { Material } from "@/features/materials/material.types";

interface MaterialDeleteDialogProps {
  material: Material | null;
  open: boolean;
  isDeleting?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export default function MaterialDeleteDialog({
  material,
  open,
  isDeleting = false,
  onConfirm,
  onClose,
}: MaterialDeleteDialogProps) {
  if (!open || !material) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
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
        aria-labelledby="material-delete-dialog-title"
        aria-describedby="material-delete-dialog-description"
        className="w-full rounded-t-2xl border border-border bg-card p-5 shadow-xl sm:max-w-md sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle
                className="h-5 w-5 text-destructive"
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <h2
                id="material-delete-dialog-title"
                className="text-base font-semibold text-foreground"
              >
                Delete material?
              </h2>

              <p
                id="material-delete-dialog-description"
                className="mt-1 text-sm leading-5 text-muted-foreground"
              >
                This will move{" "}
                <span className="font-medium text-foreground">
                  {material.name}
                </span>{" "}
                to deleted materials. You can restore it later.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Close dialog"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X
              className="h-5 w-5"
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="min-h-11 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-destructive px-4 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting && (
              <Loader2
                className="h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            )}

            {isDeleting ? "Deleting..." : "Delete Material"}
          </button>
        </div>
      </div>
    </div>
  );
}