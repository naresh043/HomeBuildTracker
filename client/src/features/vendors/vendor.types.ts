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

export interface VendorPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface VendorListData {
  vendors: Vendor[];
  pagination: VendorPagination;
}

export interface VendorListResponse {
  success: boolean;
  message: string;
  data: VendorListData;
}

export interface VendorResponse {
  success: boolean;
  message: string;
  data: Vendor;
}
