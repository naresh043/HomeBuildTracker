import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Ellipsis,
  PauseCircle,
} from "lucide-react";

import type { ConstructionStage } from "@/features/stages/stage.types";
import {
  formatConstructionStageDate,
  formatConstructionStageStatus,
  getConstructionStageStatusClassName,
} from "@/features/stages/stage.utils";

interface StageCardProps {
  stage: ConstructionStage;
  onClick?: (stage: ConstructionStage) => void;
}

const getStatusIcon = (status: ConstructionStage["status"]) => {
  switch (status) {
    case "IN_PROGRESS":
      return <Clock3 className="h-3.5 w-3.5" />;

    case "COMPLETED":
      return <CheckCircle2 className="h-3.5 w-3.5" />;

    case "ON_HOLD":
      return <PauseCircle className="h-3.5 w-3.5" />;

    case "NOT_STARTED":
    default:
      return <Circle className="h-3.5 w-3.5" />;
  }
};

export default function StageCard({ stage, onClick }: StageCardProps) {
  const statusIcon = getStatusIcon(stage.status);

  const isClickable = Boolean(onClick);

  const handleClick = () => {
    onClick?.(stage);
  };

  return (
    <article
      className={[
        "w-full rounded-2xl border bg-background p-4 shadow-sm",
        "transition-shadow duration-150",
        "sm:p-5",
        isClickable
          ? "cursor-pointer active:scale-[0.99] active:shadow-none hover:shadow-md"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={(event) => {
        if (!isClickable) {
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleClick();
        }
      }}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <div className="flex min-w-0 items-start gap-3">
        {/* Stage order */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-sm font-semibold text-foreground">
          {stage.order}
        </div>

        {/* Stage information */}
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-foreground sm:text-base">
                {stage.name}
              </h3>

              {stage.description && (
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground sm:text-sm">
                  {stage.description}
                </p>
              )}
            </div>

            {onClick && (
              <button
                type="button"
                aria-label={`Open ${stage.name}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={(event) => {
                  event.stopPropagation();
                  handleClick();
                }}
              >
                <Ellipsis className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Status */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={[
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
                "text-xs font-medium",
                getConstructionStageStatusClassName(stage.status),
              ].join(" ")}
            >
              {statusIcon}
              {formatConstructionStageStatus(stage.status)}
            </span>

            {stage.startDate && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatConstructionStageDate(stage.startDate)}
              </span>
            )}
          </div>

          {/* Notes */}
          {stage.notes && (
            <div className="mt-3 rounded-xl bg-muted/50 px-3 py-2.5">
              <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                {stage.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
