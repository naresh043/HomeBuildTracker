import { useQuery } from "@tanstack/react-query";

import { getStage, getStages } from "@/api/stages.api";

export const stageQueryKeys = {
  all: ["stages"] as const,

  lists: () => [...stageQueryKeys.all, "list"] as const,

  list: (includeDeleted: boolean = false) =>
    [...stageQueryKeys.lists(), { includeDeleted }] as const,

  details: () => [...stageQueryKeys.all, "detail"] as const,

  detail: (stageId: string) =>
    [...stageQueryKeys.details(), stageId] as const,
};

export const useStagesQuery = (includeDeleted: boolean = false) =>
  useQuery({
    queryKey: stageQueryKeys.list(includeDeleted),
    queryFn: () => getStages({ includeDeleted }),
  });

export const useStageQuery = (stageId: string) =>
  useQuery({
    queryKey: stageQueryKeys.detail(stageId),
    queryFn: () => getStage(stageId),
    enabled: Boolean(stageId),
  });