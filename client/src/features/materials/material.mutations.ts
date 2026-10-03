import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createMaterial,
  deleteMaterial,
  restoreMaterial,
  updateMaterial,
} from "@/api/materials.api";

import type {
  CreateMaterialRequest,
  UpdateMaterialRequest,
} from "./material.types";

import { materialQueryKeys } from "./material.queries";

export const useCreateMaterialMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMaterialRequest) => createMaterial(payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: materialQueryKeys.all,
      });
    },
  });
};

export const useUpdateMaterialMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      materialId,
      payload,
    }: {
      materialId: string;
      payload: UpdateMaterialRequest;
    }) => updateMaterial(materialId, payload),

    onSuccess: async (_response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: materialQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: materialQueryKeys.detail(variables.materialId),
        }),
      ]);
    },
  });
};

export const useDeleteMaterialMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (materialId: string) => deleteMaterial(materialId),

    onSuccess: async (_response, materialId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: materialQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: materialQueryKeys.detail(materialId),
        }),
      ]);
    },
  });
};

export const useRestoreMaterialMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (materialId: string) => restoreMaterial(materialId),

    onSuccess: async (_response, materialId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: materialQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: materialQueryKeys.detail(materialId),
        }),
      ]);
    },
  });
};
