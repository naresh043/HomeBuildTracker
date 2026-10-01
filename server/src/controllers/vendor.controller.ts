import { RequestHandler } from "express";

import {
  createVendor,
  deleteVendor,
  getActiveVendors,
  getVendorById,
  listVendors,
  restoreVendor,
  updateVendor,
} from "../services/vendor.service";

import { successResponse } from "../utils/response";

import type {
  CreateVendorInput,
  ListVendorsQuery,
  UpdateVendorInput,
  VendorIdParams,
} from "../validators/vendor.schema";

/**
 * ============================================================
 * CREATE VENDOR
 * ============================================================
 *
 * POST /api/vendors
 */
export const createVendorController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const validated = (req as any).validated as {
      body: CreateVendorInput;
    };

    const vendor = await createVendor(validated.body);

    return res
      .status(201)
      .json(successResponse(vendor, "Vendor created successfully"));
  } catch (error) {
    return next(error);
  }
};

/**
 * ============================================================
 * LIST VENDORS
 * ============================================================
 *
 * GET /api/vendors
 */
export const listVendorsController: RequestHandler = async (req, res, next) => {
  try {
    const validated = (req as any).validated as {
      query: ListVendorsQuery;
    };

    const result = await listVendors(validated.query);

    return res
      .status(200)
      .json(successResponse(result, "Vendors fetched successfully"));
  } catch (error) {
    return next(error);
  }
};

/**
 * ============================================================
 * GET ACTIVE VENDORS
 * ============================================================
 *
 * GET /api/vendors/active
 *
 * Optional query:
 * ?type=CONTRACTOR
 * ?type=MATERIAL_SUPPLIER
 * ?type=SERVICE_PROVIDER
 * ?type=OTHER
 */
export const getActiveVendorsController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const type = req.query.type as
      Parameters<typeof getActiveVendors>[0] | undefined;

    const vendors = await getActiveVendors(type);

    return res
      .status(200)
      .json(successResponse(vendors, "Active vendors fetched successfully"));
  } catch (error) {
    return next(error);
  }
};

/**
 * ============================================================
 * GET VENDOR BY ID
 * ============================================================
 *
 * GET /api/vendors/:vendorId
 */
export const getVendorController: RequestHandler = async (req, res, next) => {
  try {
    const validated = (req as any).validated as {
      params: VendorIdParams;
    };

    const vendor = await getVendorById(validated.params.vendorId);

    return res
      .status(200)
      .json(successResponse(vendor, "Vendor fetched successfully"));
  } catch (error) {
    return next(error);
  }
};

/**
 * ============================================================
 * UPDATE VENDOR
 * ============================================================
 *
 * PATCH /api/vendors/:vendorId
 */
export const updateVendorController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const validated = (req as any).validated as {
      params: VendorIdParams;
      body: UpdateVendorInput;
    };

    const vendor = await updateVendor(
      validated.params.vendorId,
      validated.body,
    );

    return res
      .status(200)
      .json(successResponse(vendor, "Vendor updated successfully"));
  } catch (error) {
    return next(error);
  }
};

/**
 * ============================================================
 * DELETE VENDOR
 * ============================================================
 *
 * DELETE /api/vendors/:vendorId
 *
 * IMPORTANT:
 * This is a soft delete.
 *
 * The vendor record remains in MongoDB because historical
 * payments, material receipts, contracts, etc. may reference it.
 */
export const deleteVendorController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const validated = (req as any).validated as {
      params: VendorIdParams;
    };

    const vendor = await deleteVendor(validated.params.vendorId);

    return res
      .status(200)
      .json(successResponse(vendor, "Vendor deleted successfully"));
  } catch (error) {
    return next(error);
  }
};

/**
 * ============================================================
 * RESTORE VENDOR
 * ============================================================
 *
 * PATCH /api/vendors/:vendorId/restore
 *
 * Restores a previously soft-deleted vendor.
 */
export const restoreVendorController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const validated = (req as any).validated as {
      params: VendorIdParams;
    };

    const vendor = await restoreVendor(validated.params.vendorId);

    return res
      .status(200)
      .json(successResponse(vendor, "Vendor restored successfully"));
  } catch (error) {
    return next(error);
  }
};
