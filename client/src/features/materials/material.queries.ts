import { useQuery } from "@tanstack/react-query";

import { getMaterial, getMaterials } from "@/api/materials.api";

import type { MaterialListParams } from "./material.types";

export const materialQueryKeys = {
  all: ["materials"] as const,

  lists: () => [...materialQueryKeys.all, "list"] as const,

  list: (params?: MaterialListParams) =>
    [...materialQueryKeys.lists(), params ?? {}] as const,

  details: () => [...materialQueryKeys.all, "detail"] as const,

  detail: (materialId: string) =>
    [...materialQueryKeys.details(), materialId] as const,
};

export const useMaterialsQuery = (params?: MaterialListParams) =>
  useQuery({
    queryKey: materialQueryKeys.list(params),
    queryFn: () => getMaterials(params),
  });

export const useMaterialQuery = (materialId: string, enabled = true) =>
  useQuery({
    queryKey: materialQueryKeys.detail(materialId),
    queryFn: () => getMaterial(materialId),
    enabled: enabled && Boolean(materialId),
  });
