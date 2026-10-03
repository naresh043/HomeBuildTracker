import { Plus, Wrench } from "lucide-react";

interface StageHeaderProps {
  totalStages: number;
  onAddStage: () => void;
}

export default function StageHeader({
  totalStages,
  onAddStage,
}: StageHeaderProps) {
  return (
    <header className="w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Title */}
        <div className="flex min-w-0 items-start gap-3">
          <div
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted"
          >
            <Wrench className="h-5 w-5 text-foreground" />
          </div>

          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Construction Stages
            </h1>

            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              Manage and track the progress of your house construction.
            </p>
          </div>
        </div>

        {/* Add stage */}
        <button
          type="button"
          onClick={onAddStage}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-semibold text-background transition-opacity hover:opacity-90 active:opacity-80 sm:w-auto"
        >
          <Plus className="h-4 w-4" />

          <span>Add Stage</span>
        </button>
      </div>

      {/* Stage count */}
      <div className="mt-4 flex items-center">
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          {totalStages}{" "}
          {totalStages === 1 ? "active stage" : "active stages"}
        </span>
      </div>
    </header>
  );
}