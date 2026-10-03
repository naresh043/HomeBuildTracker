import { GripVertical, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { ConstructionStage } from "@/features/stages/stage.types";
import { sortConstructionStages } from "@/features/stages/stage.utils";

interface StageReorderProps {
  stages: ConstructionStage[];
  isSaving?: boolean;
  onSave: (stageIds: string[]) => Promise<void> | void;
  onClose: () => void;
}

export default function StageReorder({
  stages,
  isSaving = false,
  onSave,
  onClose,
}: StageReorderProps) {
  const [orderedStages, setOrderedStages] = useState<ConstructionStage[]>([]);

  const [draggedStageId, setDraggedStageId] = useState<string | null>(null);

  useEffect(() => {
    setOrderedStages(sortConstructionStages(stages));
  }, [stages]);

  const handleDragStart = (stageId: string) => {
    if (isSaving) {
      return;
    }

    setDraggedStageId(stageId);
  };

  const handleDragOver = (
    event: React.DragEvent<HTMLDivElement>,
    targetStageId: string,
  ) => {
    event.preventDefault();

    if (
      isSaving ||
      !draggedStageId ||
      draggedStageId === targetStageId
    ) {
      return;
    }

    setOrderedStages((currentStages) => {
      const draggedIndex = currentStages.findIndex(
        (stage) => stage._id === draggedStageId,
      );

      const targetIndex = currentStages.findIndex(
        (stage) => stage._id === targetStageId,
      );

      if (draggedIndex === -1 || targetIndex === -1) {
        return currentStages;
      }

      const nextStages = [...currentStages];

      const [draggedStage] = nextStages.splice(draggedIndex, 1);

      nextStages.splice(targetIndex, 0, draggedStage);

      return nextStages;
    });
  };

  const handleDragEnd = () => {
    setDraggedStageId(null);
  };

  const handleMoveUp = (index: number) => {
    if (isSaving || index === 0) {
      return;
    }

    setOrderedStages((currentStages) => {
      const nextStages = [...currentStages];

      [nextStages[index - 1], nextStages[index]] = [
        nextStages[index],
        nextStages[index - 1],
      ];

      return nextStages;
    });
  };

  const handleMoveDown = (index: number) => {
    if (isSaving || index === orderedStages.length - 1) {
      return;
    }

    setOrderedStages((currentStages) => {
      const nextStages = [...currentStages];

      [nextStages[index], nextStages[index + 1]] = [
        nextStages[index + 1],
        nextStages[index],
      ];

      return nextStages;
    });
  };

  const handleSave = async () => {
    if (isSaving || orderedStages.length === 0) {
      return;
    }

    await onSave(orderedStages.map((stage) => stage._id));
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="stage-reorder-title"
        className="flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border bg-background shadow-2xl sm:max-h-[90dvh] sm:rounded-3xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-4 sm:px-6">
          <div>
            <h2
              id="stage-reorder-title"
              className="text-lg font-semibold text-foreground"
            >
              Reorder stages
            </h2>

            <p className="mt-0.5 text-sm text-muted-foreground">
              Arrange the construction stages in the order you want.
            </p>
          </div>

          <button
            type="button"
            aria-label="Close reorder stages"
            onClick={onClose}
            disabled={isSaving}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          <div className="space-y-2">
            {orderedStages.map((stage, index) => {
              const isDragging = draggedStageId === stage._id;

              return (
                <div
                  key={stage._id}
                  draggable={!isSaving}
                  onDragStart={() => handleDragStart(stage._id)}
                  onDragOver={(event) =>
                    handleDragOver(event, stage._id)
                  }
                  onDragEnd={handleDragEnd}
                  className={[
                    "flex min-h-16 items-center gap-3 rounded-2xl border bg-background px-3 py-2 transition-all",
                    isDragging
                      ? "scale-[0.98] opacity-50"
                      : "opacity-100",
                  ].join(" ")}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 cursor-grab items-center justify-center rounded-xl bg-muted text-muted-foreground active:cursor-grabbing"
                    aria-hidden="true"
                  >
                    <GripVertical className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {stage.name}
                    </p>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Position {index + 1}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Move ${stage.name} up`}
                      disabled={isSaving || index === 0}
                      onClick={() => handleMoveUp(index)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      aria-label={`Move ${stage.name} down`}
                      disabled={
                        isSaving || index === orderedStages.length - 1
                      }
                      onClick={() => handleMoveDown(index)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex shrink-0 gap-3 border-t bg-background px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="min-h-11 flex-1 rounded-xl border border-input px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted active:bg-muted disabled:pointer-events-none disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving || orderedStages.length === 0}
            className="min-h-11 flex-1 rounded-xl bg-foreground px-4 text-sm font-medium text-background transition-opacity active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save order"}
          </button>
        </div>
      </div>
    </div>
  );
}