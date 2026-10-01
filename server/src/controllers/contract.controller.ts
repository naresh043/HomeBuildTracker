import { RequestHandler } from "express";
import {
  createContract,
  deleteContract,
  getContract,
  getContractSummary,
  listContracts,
  restoreContract,
  updateContract,
} from "../services/contract.service";
import { successResponse } from "../utils/response";

const getValidated = (req: any) =>
  req.validated as {
    body?: any;
    params?: any;
    query?: any;
  };

export const createContractController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const validated = getValidated(req);

    const contract = await createContract(
      validated.body,
      req.user!._id.toString(),
    );

    return res
      .status(201)
      .json(successResponse(contract, "Contract created successfully"));
  } catch (error) {
    return next(error);
  }
};

export const listContractsController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const validated = getValidated(req);

    const result = await listContracts(validated.query);

    return res
      .status(200)
      .json(successResponse(result, "Contracts retrieved successfully"));
  } catch (error) {
    return next(error);
  }
};

export const getContractController: RequestHandler = async (req, res, next) => {
  try {
    const validated = getValidated(req);

    const contract = await getContract(
      validated.params.contractId,
      validated.query?.includeDeleted ?? false,
    );

    return res
      .status(200)
      .json(successResponse(contract, "Contract retrieved successfully"));
  } catch (error) {
    return next(error);
  }
};

export const updateContractController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const validated = getValidated(req);

    const contract = await updateContract(
      validated.params.contractId,
      validated.body,
    );

    return res
      .status(200)
      .json(successResponse(contract, "Contract updated successfully"));
  } catch (error) {
    return next(error);
  }
};

export const deleteContractController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const validated = getValidated(req);

    const contract = await deleteContract(validated.params.contractId);

    return res
      .status(200)
      .json(successResponse(contract, "Contract deleted successfully"));
  } catch (error) {
    return next(error);
  }
};

export const restoreContractController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const validated = getValidated(req);

    const contract = await restoreContract(validated.params.contractId);

    return res
      .status(200)
      .json(successResponse(contract, "Contract restored successfully"));
  } catch (error) {
    return next(error);
  }
};

export const getContractSummaryController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const validated = getValidated(req);

    const summary = await getContractSummary(validated.params.contractId);

    return res
      .status(200)
      .json(
        successResponse(summary, "Contract summary retrieved successfully"),
      );
  } catch (error) {
    return next(error);
  }
};
