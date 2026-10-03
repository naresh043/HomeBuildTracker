import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  initializeHouse,
  updateCurrentConstructionStage,
  updateHouse,
} from "@/api/house.api";

import type {
  InitializeHouseRequest,
  UpdateCurrentStageRequest,
  UpdateHouseRequest,
} from "./house.types";

import { houseQueryKeys } from "./house.queries";

export const useInitializeHouseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InitializeHouseRequest) =>
      initializeHouse(payload),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: houseQueryKeys.all,
      });
    },
  });
};

export const useUpdateHouseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateHouseRequest) =>
      updateHouse(payload),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: houseQueryKeys.all,
      });
    },
  });
};

export const useUpdateCurrentConstructionStageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCurrentStageRequest) =>
      updateCurrentConstructionStage(payload),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: houseQueryKeys.all,
      });
    },
  });
};