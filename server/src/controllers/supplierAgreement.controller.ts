import { Request, Response, NextFunction } from "express";
import {
  createSupplierAgreement,
  deleteSupplierAgreement,
  getSupplierAgreementById,
  getSupplierAgreementSummary,
  listSupplierAgreements,
  restoreSupplierAgreement,
  updateSupplierAgreement,
} from "../services/supplierAgreement.service";
import { successResponse } from "../utils/response";

export const createSupplierAgreementController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validated = (req as any).validated;

    const agreement = await createSupplierAgreement(
      validated.body,
      req.user!._id.toString(),
    );

    return res
      .status(201)
      .json(
        successResponse(agreement, "Supplier agreement created successfully"),
      );
  } catch (error) {
    return next(error);
  }
};

export const listSupplierAgreementsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validated = (req as any).validated;

    const result = await listSupplierAgreements(validated.query);

    return res.json(
      successResponse(result, "Supplier agreements fetched successfully"),
    );
  } catch (error) {
    return next(error);
  }
};

export const getSupplierAgreementController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validated = (req as any).validated;

    const agreement = await getSupplierAgreementById(
      validated.params.agreementId,
      validated.query?.includeDeleted === true,
    );

    return res.json(
      successResponse(agreement, "Supplier agreement fetched successfully"),
    );
  } catch (error) {
    return next(error);
  }
};

export const updateSupplierAgreementController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validated = (req as any).validated;

    const agreement = await updateSupplierAgreement(
      validated.params.agreementId,
      validated.body,
    );

    return res.json(
      successResponse(agreement, "Supplier agreement updated successfully"),
    );
  } catch (error) {
    return next(error);
  }
};

export const deleteSupplierAgreementController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validated = (req as any).validated;

    const result = await deleteSupplierAgreement(validated.params.agreementId);

    return res.json(
      successResponse(result, "Supplier agreement deleted successfully"),
    );
  } catch (error) {
    return next(error);
  }
};

export const restoreSupplierAgreementController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validated = (req as any).validated;

    const agreement = await restoreSupplierAgreement(
      validated.params.agreementId,
    );

    return res.json(
      successResponse(agreement, "Supplier agreement restored successfully"),
    );
  } catch (error) {
    return next(error);
  }
};

export const getSupplierAgreementSummaryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validated = (req as any).validated;

    const summary = await getSupplierAgreementSummary(
      validated.params.agreementId,
    );

    return res.json(
      successResponse(
        summary,
        "Supplier agreement summary fetched successfully",
      ),
    );
  } catch (error) {
    return next(error);
  }
};
