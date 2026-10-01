// src/controllers/material.controller.ts

import { RequestHandler } from "express";
import {
  createMaterial,
  deleteMaterial,
  getMaterialById,
  listMaterials,
  restoreMaterial,
  updateMaterial,
} from "../services/material.service";
import { successResponse } from "../utils/response";

export const createMaterialController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const { body } = (req as any).validated;

    const material = await createMaterial(body);

    return res
      .status(201)
      .json(successResponse(material, "Material created successfully"));
  } catch (error) {
    return next(error);
  }
};

export const listMaterialsController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const { query } = (req as any).validated;

    const result = await listMaterials(query);

    return res
      .status(200)
      .json(successResponse(result, "Materials fetched successfully"));
  } catch (error) {
    return next(error);
  }
};

export const getMaterialController: RequestHandler = async (req, res, next) => {
  try {
    const { params } = (req as any).validated;

    const material = await getMaterialById(params.materialId);

    return res
      .status(200)
      .json(successResponse(material, "Material fetched successfully"));
  } catch (error) {
    return next(error);
  }
};

export const updateMaterialController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const { params, body } = (req as any).validated;

    const material = await updateMaterial(params.materialId, body);

    return res
      .status(200)
      .json(successResponse(material, "Material updated successfully"));
  } catch (error) {
    return next(error);
  }
};

export const deleteMaterialController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const { params } = (req as any).validated;

    const material = await deleteMaterial(params.materialId);

    return res
      .status(200)
      .json(successResponse(material, "Material deleted successfully"));
  } catch (error) {
    return next(error);
  }
};

export const restoreMaterialController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const { params } = (req as any).validated;

    const material = await restoreMaterial(params.materialId);

    return res
      .status(200)
      .json(successResponse(material, "Material restored successfully"));
  } catch (error) {
    return next(error);
  }
};
