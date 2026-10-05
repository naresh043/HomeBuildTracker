export const VENDOR_TYPE = {
  CONTRACTOR: "CONTRACTOR",
  MATERIAL_SUPPLIER: "MATERIAL_SUPPLIER",
  SERVICE_PROVIDER: "SERVICE_PROVIDER",
  OTHER: "OTHER",
} as const;

export type VendorType = (typeof VENDOR_TYPE)[keyof typeof VENDOR_TYPE];

export const VENDOR_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type VendorStatus = (typeof VENDOR_STATUS)[keyof typeof VENDOR_STATUS];

export interface Vendor {
  _id: string;
  name: string;
  normalizedName: string;
  type: VendorType;
  status: VendorStatus;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorRequest {
  name: string;
  type: VendorType;
  status?: VendorStatus;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface UpdateVendorRequest {
  name?: string;
  type?: VendorType;
  status?: VendorStatus;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface VendorResponse {
  success: boolean;
  message: string;
  data: Vendor;
}

export interface VendorPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface VendorsResponse {
  success: boolean;
  message: string;
  data: {
    vendors: Vendor[];
    pagination: VendorPagination;
  };
}

export interface ActiveVendorsResponse {
  success: boolean;
  message: string;
  data: Vendor[];
}

export interface DeleteVendorResponse {
  success: boolean;
  message: string;
  data: Vendor;
}

export interface VendorListParams {
  page?: number;
  limit?: number;
  includeDeleted?: boolean;
  q?: string;
  type?: VendorType;
  status?: VendorStatus;
}
