import { ClipboardList } from "lucide-react";

import StageActions from "@/components/stages/StageActions";
import StageCard from "@/components/stages/StageCard";

import type { ConstructionStage } from "@/features/stages/stage.types";

interface StageListProps {
  stages: ConstructionStage[];
  deletingStageId?: string | null;
  restoringStageId?: string | null;
  onStageClick?: (stage: ConstructionStage) => void;
  onEditStage: (stage: ConstructionStage) => void;
  onDeleteStage: (stage: ConstructionStage) => void;
  onRestoreStage: (stage: ConstructionStage) => void;
}

export default function StageList({
  stages,
  deletingStageId = null,
  restoringStageId = null,
  onStageClick,
  onEditStage,
  onDeleteStage,
  onRestoreStage,
}: StageListProps) {
  if (stages.length === 0) {
    return (
      <section
        aria-label="Construction stages"
        className="flex min-h-56 w-full flex-col items-center justify-center rounded-2xl border bg-card px-5 py-8 text-center shadow-sm"
      >
        <div
          aria-hidden="true"
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted"
        >
          <ClipboardList className="h-6 w-6 text-muted-foreground" />
        </div>

        <h2 className="mt-4 text-base font-semibold text-foreground">
          No construction stages
        </h2>

        <p className="mt-1 max-w-sm text-sm leading-5 text-muted-foreground">
          There are currently no stages available for this house.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Construction stages" className="w-full space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground">
            Construction Stages
          </h2>

          <p className="mt-0.5 text-xs text-muted-foreground">
            Track the progress of each construction stage.
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {stages.length}
        </span>
      </div>

      <div className="space-y-3">
        {stages.map((stage) => (
          <div key={stage._id} className="relative">
            <StageCard stage={stage} onClick={onStageClick} />

            <div className="absolute right-3 top-3">
              <StageActions
                stage={stage}
                isDeleting={deletingStageId === stage._id}
                isRestoring={restoringStageId === stage._id}
                onEdit={onEditStage}
                onDelete={onDeleteStage}
                onRestore={onRestoreStage}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
