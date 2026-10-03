import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createStage,
  deleteStage,
  initializeStages,
  reorderStages,
  restoreStage,
  updateStage,
} from "@/api/stages.api";

import { stageQueryKeys } from "./stage.queries";

import type {
  CreateStageRequest,
  ReorderStagesRequest,
  UpdateStageRequest,
} from "./stage.types";

export const useInitializeStagesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: initializeStages,

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: stageQueryKeys.all,
      });
    },
  });
};

export const useCreateStageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStageRequest) => createStage(payload),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: stageQueryKeys.all,
      });
    },
  });
};

export const useUpdateStageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      stageId,
      payload,
    }: {
      stageId: string;
      payload: UpdateStageRequest;
    }) => updateStage(stageId, payload),

    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: stageQueryKeys.all,
      });

      void queryClient.invalidateQueries({
        queryKey: stageQueryKeys.detail(variables.stageId),
      });
    },
  });
};

export const useReorderStagesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReorderStagesRequest) => reorderStages(payload),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: stageQueryKeys.all,
      });
    },
  });
};

export const useDeleteStageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stageId: string) => deleteStage(stageId),

    onSuccess: (_data, stageId) => {
      void queryClient.invalidateQueries({
        queryKey: stageQueryKeys.all,
      });

      void queryClient.invalidateQueries({
        queryKey: stageQueryKeys.detail(stageId),
      });
    },
  });
};

export const useRestoreStageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stageId: string) => restoreStage(stageId),

    onSuccess: (_data, stageId) => {
      void queryClient.invalidateQueries({
        queryKey: stageQueryKeys.all,
      });

      void queryClient.invalidateQueries({
        queryKey: stageQueryKeys.detail(stageId),
      });
    },
  });
};