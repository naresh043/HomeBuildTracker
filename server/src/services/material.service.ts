// src/services/material.service.ts

import { Material } from "../models/Material";
import { ApiError } from "../utils/ApiError";
import type { MaterialUnit } from "../constants/material";

interface CreateMaterialInput {
  name: string;
  category: string;
  defaultUnit: MaterialUnit;
}

interface UpdateMaterialInput {
  name?: string;
  category?: string;
  defaultUnit?: MaterialUnit;
}

interface ListMaterialsInput {
  page: number;
  limit: number;
  q?: string;
  category?: string;
  includeDeleted?: boolean;
}

const normalizeName = (name: string): string => {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
};

const normalizeCategory = (category: string): string => {
  return category.trim().replace(/\s+/g, " ");
};

const buildPagination = (
  page: number,
  limit: number,
  total: number,
) => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};

export const createMaterial = async (
  input: CreateMaterialInput,
) => {
  const name = input.name.trim().replace(/\s+/g, " ");
  const normalizedName = normalizeName(name);
  const category = normalizeCategory(input.category);

  const existingMaterial = await Material.findOne({
    normalizedName,
  });

  if (existingMaterial) {
    if (existingMaterial.isDeleted) {
      throw new ApiError(
        409,
        "A deleted material with this name already exists. Restore it instead.",
        "MATERIAL_ALREADY_EXISTS_DELETED",
      );
    }

    throw new ApiError(
      409,
      "A material with this name already exists",
      "MATERIAL_ALREADY_EXISTS",
    );
  }

  try {
    const material = await Material.create({
      name,
      normalizedName,
      category,
      defaultUnit: input.defaultUnit,
      isDeleted: false,
    });

    return material;
  } catch (error: any) {
    if (error?.code === 11000) {
      throw new ApiError(
        409,
        "A material with this name already exists",
        "MATERIAL_ALREADY_EXISTS",
      );
    }

    throw error;
  }
};

export const listMaterials = async (
  input: ListMaterialsInput,
) => {
  const {
    page,
    limit,
    q,
    category,
    includeDeleted = false,
  } = input;

  const filter: Record<string, unknown> = {
    isDeleted: includeDeleted ? { $in: [true, false] } : false,
  };

  if (q) {
    const search = q.trim();

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          category: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }
  }

  if (category) {
    filter.category = category.trim();
  }

  const skip = (page - 1) * limit;

  const [materials, total] = await Promise.all([
    Material.find(filter)
      .sort({
        name: 1,
      })
      .skip(skip)
      .limit(limit),

    Material.countDocuments(filter),
  ]);

  return {
    materials,
    pagination: buildPagination(page, limit, total),
  };
};

export const getMaterialById = async (
  materialId: string,
) => {
  const material = await Material.findById(materialId);

  if (!material) {
    throw new ApiError(
      404,
      "Material not found",
      "MATERIAL_NOT_FOUND",
    );
  }

  return material;
};

export const updateMaterial = async (
  materialId: string,
  input: UpdateMaterialInput,
) => {
  const material = await Material.findById(materialId);

  if (!material) {
    throw new ApiError(
      404,
      "Material not found",
      "MATERIAL_NOT_FOUND",
    );
  }

  if (material.isDeleted) {
    throw new ApiError(
      400,
      "Deleted material cannot be updated. Restore it first.",
      "MATERIAL_DELETED",
    );
  }

  if (input.name !== undefined) {
    const name = input.name.trim().replace(/\s+/g, " ");
    const normalizedName = normalizeName(name);

    if (normalizedName !== material.normalizedName) {
      const duplicateMaterial = await Material.findOne({
        normalizedName,
        _id: {
          $ne: material._id,
        },
      });

      if (duplicateMaterial) {
        if (duplicateMaterial.isDeleted) {
          throw new ApiError(
            409,
            "A deleted material with this name already exists. Restore it instead.",
            "MATERIAL_ALREADY_EXISTS_DELETED",
          );
        }

        throw new ApiError(
          409,
          "A material with this name already exists",
          "MATERIAL_ALREADY_EXISTS",
        );
      }
    }

    material.name = name;
    material.normalizedName = normalizedName;
  }

  if (input.category !== undefined) {
    material.category = normalizeCategory(input.category);
  }

  if (input.defaultUnit !== undefined) {
    material.defaultUnit = input.defaultUnit;
  }

  try {
    await material.save();
  } catch (error: any) {
    if (error?.code === 11000) {
      throw new ApiError(
        409,
        "A material with this name already exists",
        "MATERIAL_ALREADY_EXISTS",
      );
    }

    throw error;
  }

  return material;
};

export const deleteMaterial = async (
  materialId: string,
) => {
  const material = await Material.findById(materialId);

  if (!material) {
    throw new ApiError(
      404,
      "Material not found",
      "MATERIAL_NOT_FOUND",
    );
  }

  if (material.isDeleted) {
    throw new ApiError(
      400,
      "Material is already deleted",
      "MATERIAL_ALREADY_DELETED",
    );
  }

  material.isDeleted = true;

  await material.save();

  return material;
};

export const restoreMaterial = async (
  materialId: string,
) => {
  const material = await Material.findById(materialId);

  if (!material) {
    throw new ApiError(
      404,
      "Material not found",
      "MATERIAL_NOT_FOUND",
    );
  }

  if (!material.isDeleted) {
    throw new ApiError(
      400,
      "Material is already active",
      "MATERIAL_ALREADY_ACTIVE",
    );
  }

  const activeDuplicate = await Material.findOne({
    normalizedName: material.normalizedName,
    isDeleted: false,
    _id: {
      $ne: material._id,
    },
  });

  if (activeDuplicate) {
    throw new ApiError(
      409,
      "An active material with this name already exists",
      "MATERIAL_ALREADY_EXISTS",
    );
  }

  material.isDeleted = false;

  try {
    await material.save();
  } catch (error: any) {
    if (error?.code === 11000) {
      throw new ApiError(
        409,
        "An active material with this name already exists",
        "MATERIAL_ALREADY_EXISTS",
      );
    }

    throw error;
  }

  return material;
};