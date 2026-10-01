import { Types } from "mongoose";

import {
  VENDOR_STATUS,
  type VendorStatus,
  type VendorType,
} from "../constants/vendor";

import { Vendor, type IVendor } from "../models/Vendor";

import {
  type CreateVendorInput,
  type ListVendorsQuery,
  type UpdateVendorInput,
} from "../validators/vendor.schema";

import { ApiError } from "../utils/ApiError";

/**
 * ============================================================
 * TYPES
 * ============================================================
 */

type VendorSearchFilter = {
  isDeleted?: boolean;
  type?: VendorType;
  status?: VendorStatus;
  $or?: Array<{
    name?: RegExp;
    phone?: RegExp;
    email?: RegExp;
    address?: RegExp;
  }>;
};

export interface VendorListResult {
  vendors: IVendor[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * ============================================================
 * CONSTANTS
 * ============================================================
 */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * ============================================================
 * HELPERS
 * ============================================================
 */

/**
 * Normalize vendor names consistently.
 *
 * Example:
 *
 * "  Raghunathappa  "
 *       ↓
 * "raghunathappa"
 */
const normalizeVendorName = (name: string): string => {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
};

/**
 * Validate MongoDB ObjectId before querying.
 */
const assertValidObjectId = (vendorId: string): void => {
  if (!Types.ObjectId.isValid(vendorId)) {
    throw new ApiError(400, "Invalid vendor ID", "INVALID_VENDOR_ID");
  }
};

/**
 * Convert MongoDB duplicate-key errors into
 * an application-level API error.
 */
const handleMongoDuplicateKeyError = (error: unknown): never => {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  ) {
    throw new ApiError(
      409,
      "A vendor with this name already exists",
      "VENDOR_ALREADY_EXISTS",
    );
  }

  throw error;
};

/**
 * Escape user input before putting it into a RegExp.
 *
 * This prevents special regex characters supplied by the
 * user from changing the intended search behaviour.
 */
const escapeRegex = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Build MongoDB filters for the vendor list endpoint.
 */
const buildVendorListFilter = (query: ListVendorsQuery): VendorSearchFilter => {
  const filter: VendorSearchFilter = {};

  /**
   * Normal API listing only returns non-deleted vendors.
   */
  if (!query.includeDeleted) {
    filter.isDeleted = false;
  }

  /**
   * Vendor type filter.
   */
  if (query.type) {
    filter.type = query.type;
  }

  /**
   * Vendor status filter.
   */
  if (query.status) {
    filter.status = query.status;
  }

  /**
   * Search:
   *
   * - name
   * - phone
   * - email
   * - address
   */
  if (query.q) {
    const searchRegex = new RegExp(escapeRegex(query.q), "i");

    filter.$or = [
      {
        name: searchRegex,
      },
      {
        phone: searchRegex,
      },
      {
        email: searchRegex,
      },
      {
        address: searchRegex,
      },
    ];
  }

  return filter;
};

/**
 * Build a safe MongoDB sort object.
 *
 * sortBy and sortOrder have already been validated
 * by Zod before reaching this service.
 */
const buildSort = (query: ListVendorsQuery): Record<string, 1 | -1> => {
  const direction: 1 | -1 = query.sortOrder === "asc" ? 1 : -1;

  switch (query.sortBy) {
    case "name":
      return {
        name: direction,
        _id: direction,
      };

    case "type":
      return {
        type: direction,
        name: 1,
        _id: 1,
      };

    case "status":
      return {
        status: direction,
        name: 1,
        _id: 1,
      };

    case "updatedAt":
      return {
        updatedAt: direction,
        _id: direction,
      };

    case "createdAt":
    default:
      return {
        createdAt: direction,
        _id: direction,
      };
  }
};

/**
 * ============================================================
 * CREATE VENDOR
 * ============================================================
 */

export const createVendor = async (
  input: CreateVendorInput,
): Promise<IVendor> => {
  const normalizedName = normalizeVendorName(input.name);

  try {
    const vendor = await Vendor.create({
      name: input.name,
      normalizedName,

      type: input.type,

      status: input.status ?? VENDOR_STATUS.ACTIVE,

      phone: input.phone,
      email: input.email,
      address: input.address,
      notes: input.notes,

      isDeleted: false,
    });

    return vendor;
  } catch (error) {
    return handleMongoDuplicateKeyError(error);
  }
};

/**
 * ============================================================
 * GET VENDOR BY ID
 * ============================================================
 *
 * Only active/non-deleted vendors are returned through
 * the normal public service.
 */

export const getVendorById = async (vendorId: string): Promise<IVendor> => {
  assertValidObjectId(vendorId);

  const vendor = await Vendor.findOne({
    _id: vendorId,
    isDeleted: false,
  }).exec();

  if (!vendor) {
    throw new ApiError(404, "Vendor not found", "VENDOR_NOT_FOUND");
  }

  return vendor;
};

/**
 * ============================================================
 * GET VENDOR INCLUDING DELETED
 * ============================================================
 *
 * This is intentionally separate from getVendorById().
 *
 * It is useful for future audit/recovery functionality.
 * It is not required to be exposed as a public route.
 */

export const getVendorByIdIncludingDeleted = async (
  vendorId: string,
): Promise<IVendor> => {
  assertValidObjectId(vendorId);

  const vendor = await Vendor.findById(vendorId).exec();

  if (!vendor) {
    throw new ApiError(404, "Vendor not found", "VENDOR_NOT_FOUND");
  }

  return vendor;
};

/**
 * ============================================================
 * LIST VENDORS
 * ============================================================
 */

export const listVendors = async (
  query: ListVendorsQuery,
): Promise<VendorListResult> => {
  const page = Math.max(DEFAULT_PAGE, query.page ?? DEFAULT_PAGE);

  const limit = Math.min(MAX_LIMIT, Math.max(1, query.limit ?? DEFAULT_LIMIT));

  const skip = (page - 1) * limit;

  const filter = buildVendorListFilter(query);

  const sort = buildSort(query);

  const [vendors, total] = await Promise.all([
    Vendor.find(filter).sort(sort).skip(skip).limit(limit).exec(),

    Vendor.countDocuments(filter).exec(),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    vendors,

    pagination: {
      page,
      limit,
      total,
      totalPages,

      hasNextPage: totalPages > 0 && page < totalPages,

      hasPreviousPage: page > 1,
    },
  };
};

/**
 * ============================================================
 * GET ACTIVE VENDORS
 * ============================================================
 *
 * Used by dropdowns and quick-add forms.
 *
 * Optional type filtering:
 *
 * getActiveVendors()
 *
 * or:
 *
 * getActiveVendors(VENDOR_TYPE.CONTRACTOR)
 */

export const getActiveVendors = async (
  type?: VendorType,
): Promise<IVendor[]> => {
  const filter: VendorSearchFilter = {
    isDeleted: false,
    status: VENDOR_STATUS.ACTIVE,
  };

  if (type) {
    filter.type = type;
  }

  return Vendor.find(filter)
    .sort({
      name: 1,
      _id: 1,
    })
    .exec();
};

/**
 * ============================================================
 * UPDATE VENDOR
 * ============================================================
 *
 * PATCH-style update.
 *
 * Only supplied fields are changed.
 */

export const updateVendor = async (
  vendorId: string,
  input: UpdateVendorInput,
): Promise<IVendor> => {
  assertValidObjectId(vendorId);

  const vendor = await Vendor.findOne({
    _id: vendorId,
    isDeleted: false,
  }).exec();

  if (!vendor) {
    throw new ApiError(404, "Vendor not found", "VENDOR_NOT_FOUND");
  }

  /**
   * Name
   */
  if (input.name !== undefined) {
    vendor.name = input.name;

    vendor.normalizedName = normalizeVendorName(input.name);
  }

  /**
   * Vendor type
   */
  if (input.type !== undefined) {
    vendor.type = input.type;
  }

  /**
   * Vendor status
   */
  if (input.status !== undefined) {
    vendor.status = input.status;
  }

  /**
   * Phone
   */
  if (input.phone !== undefined) {
    vendor.phone = input.phone;
  }

  /**
   * Email
   */
  if (input.email !== undefined) {
    vendor.email = input.email;
  }

  /**
   * Address
   */
  if (input.address !== undefined) {
    vendor.address = input.address;
  }

  /**
   * Notes
   */
  if (input.notes !== undefined) {
    vendor.notes = input.notes;
  }

  try {
    await vendor.save();

    return vendor;
  } catch (error) {
    return handleMongoDuplicateKeyError(error);
  }
};

/**
 * ============================================================
 * SOFT DELETE VENDOR
 * ============================================================
 *
 * Vendors are never physically removed.
 *
 * Historical payments, contracts, material receipts,
 * and other records may reference the vendor.
 */

export const deleteVendor = async (vendorId: string): Promise<IVendor> => {
  assertValidObjectId(vendorId);

  const vendor = await Vendor.findOne({
    _id: vendorId,
    isDeleted: false,
  }).exec();

  if (!vendor) {
    throw new ApiError(404, "Vendor not found", "VENDOR_NOT_FOUND");
  }

  vendor.isDeleted = true;
  vendor.status = VENDOR_STATUS.INACTIVE;

  await vendor.save();

  return vendor;
};

/**
 * ============================================================
 * RESTORE VENDOR
 * ============================================================
 *
 * Not exposed through the current API.
 *
 * Kept as a service operation for a future recovery/settings
 * workflow.
 */

export const restoreVendor = async (vendorId: string): Promise<IVendor> => {
  assertValidObjectId(vendorId);

  const vendor = await Vendor.findById(vendorId).exec();

  if (!vendor) {
    throw new ApiError(404, "Vendor not found", "VENDOR_NOT_FOUND");
  }

  /**
   * Already active.
   */
  if (!vendor.isDeleted) {
    return vendor;
  }

  vendor.isDeleted = false;
  vendor.status = VENDOR_STATUS.ACTIVE;

  try {
    await vendor.save();

    return vendor;
  } catch (error) {
    return handleMongoDuplicateKeyError(error);
  }
};
