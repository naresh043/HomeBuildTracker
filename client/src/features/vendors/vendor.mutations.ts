import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createVendor,
  deleteVendor,
  restoreVendor,
  updateVendor,
} from "@/api/vendors.api";

import { vendorQueryKeys } from "./vendor.queries";
import { dashboardQueryKeys } from "@/features/dashboard/dashboard.queries";

import type {
  CreateVendorRequest,
  UpdateVendorRequest,
} from "./vendor.types";

export const useCreateVendorMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVendorRequest) =>
      createVendor(payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: vendorQueryKeys.all,
      });
      await queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all });
    },
  });
};

export const useUpdateVendorMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      vendorId,
      payload,
    }: {
      vendorId: string;
      payload: UpdateVendorRequest;
    }) => updateVendor(vendorId, payload),

    onSuccess: async (_response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: vendorQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: vendorQueryKeys.detail(
            variables.vendorId,
          ),
        }),
      ]);
      await queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all });
    },
  });
};

export const useDeleteVendorMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vendorId: string) =>
      deleteVendor(vendorId),

    onSuccess: async (_response, vendorId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: vendorQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: vendorQueryKeys.detail(vendorId),
        }),
      ]);
      await queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all });
    },
  });
};

export const useRestoreVendorMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vendorId: string) =>
      restoreVendor(vendorId),

    onSuccess: async (_response, vendorId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: vendorQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: vendorQueryKeys.detail(vendorId),
        }),
      ]);
      await queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all });
    },
  });
};
