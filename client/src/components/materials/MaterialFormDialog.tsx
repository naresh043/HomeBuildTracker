import { X } from "lucide-react";

import MaterialForm from "./MaterialForm";

import type { CreateMaterialFormValues } from "@/features/materials/material.schema";
import type { Material } from "@/features/materials/material.types";

interface MaterialFormDialogProps {
  open: boolean;
  material?: Material | null;
  categories: string[];
  isSubmitting?: boolean;
  onSubmit: (values: CreateMaterialFormValues) => void | Promise<void>;
  onClose: () => void;
}

export default function MaterialFormDialog({
  open,
  material = null,
  categories,
  isSubmitting = false,
  onSubmit,
  onClose,
}: MaterialFormDialogProps) {
  if (!open) {
    return null;
  }

  const isEditMode = Boolean(material);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
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
        aria-labelledby="material-dialog-title"
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border border-border bg-card p-5 shadow-xl sm:max-w-lg sm:rounded-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2
              id="material-dialog-title"
              className="text-lg font-semibold text-foreground"
            >
              {isEditMode ? "Edit Material" : "Add Material"}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {isEditMode
                ? "Update the material details."
                : "Add a construction material to your tracker."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X
              className="h-5 w-5"
              aria-hidden="true"
            />
          </button>
        </div>

        <MaterialForm
          material={material}
          categories={categories}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}