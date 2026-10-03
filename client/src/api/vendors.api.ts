import apiClient from "./client";
import { API_ENDPOINTS } from "./endpoints";

import type {
  CreateVendorRequest,
  UpdateVendorRequest,
  VendorResponse,
  VendorsResponse,
  ActiveVendorsResponse,
  DeleteVendorResponse,
  VendorListParams,
} from "@/features/vendors/vendor.types";

export const createVendor = async (
  payload: CreateVendorRequest,
): Promise<VendorResponse> => {
  const response = await apiClient.post<VendorResponse>(
    API_ENDPOINTS.vendors.base,
    payload,
  );

  return response.data;
};

export const getVendors = async (
  params?: VendorListParams,
): Promise<VendorsResponse> => {
  const response = await apiClient.get<VendorsResponse>(
    API_ENDPOINTS.vendors.base,
    {
      params: {
        ...(params?.page !== undefined && {
          page: params.page,
        }),
        ...(params?.limit !== undefined && {
          limit: params.limit,
        }),
        ...(params?.includeDeleted !== undefined && {
          includeDeleted: params.includeDeleted,
        }),
      },
    },
  );

  return response.data;
};

export const getActiveVendors = async (): Promise<ActiveVendorsResponse> => {
  const response = await apiClient.get<ActiveVendorsResponse>(
    API_ENDPOINTS.vendors.active,
  );

  return response.data;
};

export const getVendor = async (vendorId: string): Promise<VendorResponse> => {
  const response = await apiClient.get<VendorResponse>(
    API_ENDPOINTS.vendors.byId(vendorId),
  );

  return response.data;
};

export const updateVendor = async (
  vendorId: string,
  payload: UpdateVendorRequest,
): Promise<VendorResponse> => {
  const response = await apiClient.patch<VendorResponse>(
    API_ENDPOINTS.vendors.byId(vendorId),
    payload,
  );

  return response.data;
};

export const deleteVendor = async (
  vendorId: string,
): Promise<DeleteVendorResponse> => {
  const response = await apiClient.delete<DeleteVendorResponse>(
    API_ENDPOINTS.vendors.byId(vendorId),
  );

  return response.data;
};

export const restoreVendor = async (
  vendorId: string,
): Promise<VendorResponse> => {
  const response = await apiClient.patch<VendorResponse>(
    API_ENDPOINTS.vendors.restore(vendorId),
  );

  return response.data;
};
