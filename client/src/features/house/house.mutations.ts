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

    onSuccess: (response) => {
      queryClient.setQueryData(houseQueryKeys.detail(), response);
    },
  });
};

export const useUpdateHouseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateHouseRequest) =>
      updateHouse(payload),

    onSuccess: (response) => {
      queryClient.setQueryData(houseQueryKeys.detail(), response);
    },
  });
};

export const useUpdateCurrentConstructionStageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCurrentStageRequest) =>
      updateCurrentConstructionStage(payload),

    onSuccess: (response) => {
      queryClient.setQueryData(houseQueryKeys.detail(), response);
    },
  });
};
