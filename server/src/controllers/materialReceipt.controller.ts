import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";

import {
  createMaterialReceipt,
  deleteMaterialReceipt,
  getMaterialReceiptById,
  listMaterialReceipts,
  restoreMaterialReceipt,
  updateMaterialReceipt,
  verifyMaterialReceipt,
} from "../services/materialReceipt.service";

import { successResponse } from "../utils/response";

const getValidated = (req: Request) => (req as any).validated;

/* =========================================================
   CREATE
========================================================= */

export const createMaterialReceiptController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { body } = getValidated(req);

    if (!req.user?._id) {
      throw new Error("Authenticated user is required");
    }

    const createdBy = new Types.ObjectId(req.user._id);

    const materialReceipt = await createMaterialReceipt(body, createdBy);

    return res
      .status(201)
      .json(
        successResponse(
          materialReceipt,
          "Material receipt created successfully",
        ),
      );
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   LIST
========================================================= */

export const listMaterialReceiptsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { query } = getValidated(req);

    const result = await listMaterialReceipts(query);

    return res
      .status(200)
      .json(successResponse(result, "Material receipts fetched successfully"));
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   GET BY ID
========================================================= */

export const getMaterialReceiptController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { params, query } = getValidated(req);

    const materialReceipt = await getMaterialReceiptById(
      params.materialReceiptId,
      query.includeDeleted,
    );

    return res
      .status(200)
      .json(
        successResponse(
          materialReceipt,
          "Material receipt fetched successfully",
        ),
      );
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   UPDATE
========================================================= */

export const updateMaterialReceiptController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { params, body } = getValidated(req);

    const materialReceipt = await updateMaterialReceipt(
      params.materialReceiptId,
      body,
    );

    return res
      .status(200)
      .json(
        successResponse(
          materialReceipt,
          "Material receipt updated successfully",
        ),
      );
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   DELETE
========================================================= */

export const deleteMaterialReceiptController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { params } = getValidated(req);

    const materialReceipt = await deleteMaterialReceipt(
      params.materialReceiptId,
    );

    return res
      .status(200)
      .json(
        successResponse(
          materialReceipt,
          "Material receipt deleted successfully",
        ),
      );
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   RESTORE
========================================================= */

export const restoreMaterialReceiptController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { params } = getValidated(req);

    const materialReceipt = await restoreMaterialReceipt(
      params.materialReceiptId,
    );

    return res
      .status(200)
      .json(
        successResponse(
          materialReceipt,
          "Material receipt restored successfully",
        ),
      );
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   VERIFY
========================================================= */

export const verifyMaterialReceiptController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { params } = getValidated(req);

    const materialReceipt = await verifyMaterialReceipt(
      params.materialReceiptId,
    );

    return res
      .status(200)
      .json(
        successResponse(
          materialReceipt,
          "Material receipt verified successfully",
        ),
      );
  } catch (error) {
    return next(error);
  }
};
