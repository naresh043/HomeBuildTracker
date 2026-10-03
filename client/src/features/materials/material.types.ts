export const MATERIAL_UNIT = {
  BAG: "BAG",
  KG: "KG",
  TON: "TON",
  LOAD: "LOAD",
  TRACTOR_LOAD: "TRACTOR_LOAD",
  PIECE: "PIECE",
  BOX: "BOX",
  METER: "METER",
  SQFT: "SQFT",
  LITER: "LITER",
  OTHER: "OTHER",
} as const;

export type MaterialUnit = (typeof MATERIAL_UNIT)[keyof typeof MATERIAL_UNIT];

export interface Material {
  _id: string;
  name: string;
  normalizedName: string;
  category: string;
  defaultUnit: MaterialUnit;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaterialRequest {
  name: string;
  category: string;
  defaultUnit: MaterialUnit;
}

export interface UpdateMaterialRequest {
  name?: string;
  category?: string;
  defaultUnit?: MaterialUnit;
}

export interface MaterialResponse {
  success: boolean;
  message: string;
  data: Material;
}

export interface MaterialPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface MaterialsResponse {
  success: boolean;
  message: string;
  data: {
    materials: Material[];
    pagination: MaterialPagination;
  };
}

export interface MaterialListParams {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  includeDeleted?: boolean;
}

export interface DeleteMaterialResponse {
  success: boolean;
  message: string;
  data: Material;
}
