import { useQuery } from "@tanstack/react-query";

import { getActiveVendors, getVendor, getVendors } from "@/api/vendors.api";

import type { VendorListParams } from "./vendor.types";

export const vendorQueryKeys = {
  all: ["vendors"] as const,

  lists: () => [...vendorQueryKeys.all, "list"] as const,

  list: (params?: VendorListParams) =>
    [...vendorQueryKeys.lists(), params ?? {}] as const,

  active: () => [...vendorQueryKeys.all, "active"] as const,

  details: () => [...vendorQueryKeys.all, "detail"] as const,

  detail: (vendorId: string) =>
    [...vendorQueryKeys.details(), vendorId] as const,
};

export const useVendorsQuery = (params?: VendorListParams) => {
  return useQuery({
    queryKey: vendorQueryKeys.list(params),
    queryFn: () => getVendors(params),
  });
};

export const useActiveVendorsQuery = () => {
  return useQuery({
    queryKey: vendorQueryKeys.active(),
    queryFn: getActiveVendors,
  });
};

export const useVendorQuery = (vendorId: string, enabled = true) => {
  return useQuery({
    queryKey: vendorQueryKeys.detail(vendorId),
    queryFn: () => getVendor(vendorId),
    enabled: enabled && Boolean(vendorId),
  });
};
