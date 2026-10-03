import {
  CheckCircle2,
  Circle,
  Clock3,
  PauseCircle,
  TrendingUp,
} from "lucide-react";

import type {
  ConstructionStage,
  ConstructionStageStatus,
} from "@/features/stages/stage.types";

import {
  getActiveConstructionStages,
  getConstructionStageProgress,
} from "@/features/stages/stage.utils";

interface StageProgressSummaryProps {
  stages: ConstructionStage[];
}

interface StageStatusSummary {
  status: ConstructionStageStatus;
  label: string;
  count: number;
  icon: typeof Circle;
}

const STATUS_SUMMARY: ReadonlyArray<{
  status: ConstructionStageStatus;
  label: string;
  icon: typeof Circle;
}> = [
  {
    status: "COMPLETED",
    label: "Completed",
    icon: CheckCircle2,
  },
  {
    status: "IN_PROGRESS",
    label: "In Progress",
    icon: Clock3,
  },
  {
    status: "NOT_STARTED",
    label: "Not Started",
    icon: Circle,
  },
  {
    status: "ON_HOLD",
    label: "On Hold",
    icon: PauseCircle,
  },
];

export default function StageProgressSummary({
  stages,
}: StageProgressSummaryProps) {
  const activeStages = getActiveConstructionStages(stages);
  const progress = getConstructionStageProgress(stages);
  const totalStages = activeStages.length;

  const statusSummaries: StageStatusSummary[] = STATUS_SUMMARY.map(
    ({ status, label, icon }) => ({
      status,
      label,
      icon,
      count: activeStages.filter((stage) => stage.status === status).length,
    }),
  );

  return (
    <section
      aria-labelledby="construction-progress-title"
      className="w-full rounded-2xl border bg-card p-4 shadow-sm sm:p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted"
          >
            <TrendingUp className="h-5 w-5 text-foreground" />
          </div>

          <div className="min-w-0">
            <h2
              id="construction-progress-title"
              className="text-base font-semibold text-foreground"
            >
              Construction Progress
            </h2>

            <p className="mt-0.5 text-xs text-muted-foreground">
              {totalStages === 0
                ? "No active stages"
                : `${totalStages} active ${
                    totalStages === 1 ? "stage" : "stages"
                  }`}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-2xl font-bold leading-none tracking-tight text-foreground">
            {progress}%
          </p>

          <p className="mt-1 text-xs text-muted-foreground">Complete</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-5">
        <div
          role="progressbar"
          aria-label={`Construction progress ${progress}%`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-foreground transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Stage status summary */}
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {statusSummaries.map(({ status, label, count, icon: Icon }) => (
          <div
            key={status}
            className="rounded-xl border bg-muted/30 p-3"
          >
            <div className="flex items-center gap-2">
              <Icon
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-muted-foreground"
              />

              <span className="truncate text-xs font-medium text-muted-foreground">
                {label}
              </span>
            </div>

            <p className="mt-2 text-xl font-semibold leading-none text-foreground">
              {count}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}