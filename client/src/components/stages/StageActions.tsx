import {
  ArchiveRestore,
  Edit3,
  MoreVertical,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import type { ConstructionStage } from "@/features/stages/stage.types";

interface StageActionsProps {
  stage: ConstructionStage;
  isDeleting?: boolean;
  isRestoring?: boolean;
  onEdit: (stage: ConstructionStage) => void;
  onDelete: (stage: ConstructionStage) => void;
  onRestore: (stage: ConstructionStage) => void;
}

export default function StageActions({
  stage,
  isDeleting = false,
  isRestoring = false,
  onEdit,
  onDelete,
  onRestore,
}: StageActionsProps) {
  const [open, setOpen] = useState(false);

  const isProcessing = isDeleting || isRestoring;

  const handleEdit = () => {
    setOpen(false);
    onEdit(stage);
  };

  const handleDelete = () => {
    setOpen(false);
    onDelete(stage);
  };

  const handleRestore = () => {
    setOpen(false);
    onRestore(stage);
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Actions for ${stage.name}`}
        aria-expanded={open}
        disabled={isProcessing}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95 disabled:pointer-events-none disabled:opacity-50"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close stage actions"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 top-11 z-50 w-48 overflow-hidden rounded-2xl border bg-background p-1.5 shadow-lg">
            {!stage.isDeleted ? (
              <>
                <button
                  type="button"
                  onClick={handleEdit}
                  className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted active:bg-muted"
                >
                  <Edit3 className="h-4 w-4 shrink-0" />
                  <span>Edit stage</span>
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isProcessing}
                  className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 active:bg-destructive/10 disabled:pointer-events-none disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4 shrink-0" />
                  <span>{isDeleting ? "Deleting..." : "Delete stage"}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleRestore}
                disabled={isProcessing}
                className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted active:bg-muted disabled:pointer-events-none disabled:opacity-50"
              >
                {isRestoring ? (
                  <ArchiveRestore className="h-4 w-4 shrink-0" />
                ) : (
                  <RotateCcw className="h-4 w-4 shrink-0" />
                )}

                <span>{isRestoring ? "Restoring..." : "Restore stage"}</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
