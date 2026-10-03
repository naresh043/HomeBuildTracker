import type { ConstructionStage, ConstructionStageStatus } from "./stage.types";

export const CONSTRUCTION_STAGE_STATUS_LABELS: Record<
  ConstructionStageStatus,
  string
> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
};

export const CONSTRUCTION_STAGE_STATUS_DESCRIPTIONS: Record<
  ConstructionStageStatus,
  string
> = {
  NOT_STARTED: "This stage has not started yet.",
  IN_PROGRESS: "This stage is currently in progress.",
  COMPLETED: "This stage has been completed.",
  ON_HOLD: "This stage is currently on hold.",
};

export const formatConstructionStageStatus = (
  status: ConstructionStageStatus,
): string => CONSTRUCTION_STAGE_STATUS_LABELS[status];

export const getConstructionStageStatusDescription = (
  status: ConstructionStageStatus,
): string => CONSTRUCTION_STAGE_STATUS_DESCRIPTIONS[status];

export const formatConstructionStageDate = (date?: string): string => {
  if (!date) {
    return "Not set";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
};

export const getConstructionStageStatusClassName = (
  status: ConstructionStageStatus,
): string => {
  switch (status) {
    case "NOT_STARTED":
      return "bg-muted text-muted-foreground";

    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700";

    case "COMPLETED":
      return "bg-green-100 text-green-700";

    case "ON_HOLD":
      return "bg-amber-100 text-amber-700";

    default:
      return "bg-muted text-muted-foreground";
  }
};

export const sortConstructionStages = (
  stages: ConstructionStage[],
): ConstructionStage[] =>
  [...stages].sort((first, second) => first.order - second.order);

export const getActiveConstructionStages = (
  stages: ConstructionStage[],
): ConstructionStage[] =>
  stages
    .filter((stage) => !stage.isDeleted)
    .sort((first, second) => first.order - second.order);

export const getConstructionStageProgress = (
  stages: ConstructionStage[],
): number => {
  const activeStages = getActiveConstructionStages(stages);

  if (activeStages.length === 0) {
    return 0;
  }

  const completedStages = activeStages.filter(
    (stage) => stage.status === "COMPLETED",
  ).length;

  return Math.round((completedStages / activeStages.length) * 100);
};
