import {
  Document,
  Schema,
  model,
} from "mongoose";

import {
  VENDOR_STATUS,
  VENDOR_TYPE,
  type VendorStatus,
  type VendorType,
} from "../constants/vendor";

/**
 * ============================================================
 * VENDOR DOCUMENT
 * ============================================================
 */

export interface IVendor extends Document {
  name: string;
  normalizedName: string;

  type: VendorType;
  status: VendorStatus;

  phone?: string;
  email?: string;
  address?: string;
  notes?: string;

  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * ============================================================
 * VENDOR SCHEMA
 * ============================================================
 */

const vendorSchema = new Schema<IVendor>(
  {
    /**
     * Vendor display name.
     *
     * Examples:
     * - Siddappa
     * - Raghunathappa
     * - ABC Sand Supplier
     */
    name: {
      type: String,
      required: [true, "Vendor name is required"],
      trim: true,
      minlength: [2, "Vendor name must be at least 2 characters"],
      maxlength: [150, "Vendor name cannot exceed 150 characters"],
    },

    /**
     * Normalized name is maintained internally.
     *
     * Example:
     *
     * "  Raghunathappa  "
     *       ↓
     * "raghunathappa"
     *
     * This is used for duplicate detection.
     */
    normalizedName: {
      type: String,
      required: [true, "Normalized vendor name is required"],
      trim: true,
      index: true,
    },

    /**
     * Vendor business type.
     */
    type: {
      type: String,
      required: [true, "Vendor type is required"],
      enum: {
        values: Object.values(VENDOR_TYPE),
        message: "Invalid vendor type",
      },
      index: true,
    },

    /**
     * Vendor status.
     */
    status: {
      type: String,
      required: [true, "Vendor status is required"],
      enum: {
        values: Object.values(VENDOR_STATUS),
        message: "Invalid vendor status",
      },
      default: VENDOR_STATUS.ACTIVE,
      index: true,
    },

    /**
     * Optional contact information.
     */
    phone: {
      type: String,
      trim: true,
      maxlength: [30, "Phone number cannot exceed 30 characters"],
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [254, "Email cannot exceed 254 characters"],
    },

    address: {
      type: String,
      trim: true,
      maxlength: [500, "Address cannot exceed 500 characters"],
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [2000, "Vendor notes cannot exceed 2000 characters"],
    },

    /**
     * Soft-delete flag.
     *
     * Vendors are never physically deleted because historical
     * payments, contracts, and material receipts may reference
     * them.
     */
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/**
 * ============================================================
 * NORMALIZE VENDOR NAME
 * ============================================================
 *
 * Keeps duplicate detection consistent.
 *
 * Example:
 *
 * "  Raghunathappa   "
 * "RAGHUNATHAPPA"
 * "Raghunathappa"
 *
 * all normalize to:
 *
 * "raghunathappa"
 */

vendorSchema.pre("validate", function () {
  if (this.name) {
    this.name = this.name.trim();

    this.normalizedName = this.name
      .replace(/\s+/g, " ")
      .toLowerCase();
  }
});

/**
 * ============================================================
 * UNIQUE ACTIVE VENDOR NAME
 * ============================================================
 *
 * Two active vendors cannot have the same normalized name.
 *
 * Soft-deleted vendors do not participate in this unique
 * constraint.
 *
 * Example:
 *
 * Raghunathappa -> ACTIVE
 *
 * Another Raghunathappa -> rejected
 *
 * If the original vendor is soft-deleted, a new active
 * vendor with the same name can be created.
 */

vendorSchema.index(
  {
    normalizedName: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
    name: "active_vendor_normalized_name_unique_idx",
  },
);

/**
 * ============================================================
 * FILTERING INDEX
 * ============================================================
 *
 * Supports queries such as:
 *
 * - Active contractors
 * - Active material suppliers
 * - Inactive service providers
 * - Non-deleted vendors by type/status
 */

vendorSchema.index(
  {
    type: 1,
    status: 1,
    isDeleted: 1,
  },
  {
    name: "vendor_type_status_deleted_idx",
  },
);

/**
 * ============================================================
 * CREATED DATE INDEX
 * ============================================================
 *
 * Useful for vendor list sorting and recently-created vendors.
 */

vendorSchema.index(
  {
    createdAt: -1,
  },
  {
    name: "vendor_created_at_idx",
  },
);

/**
 * ============================================================
 * MODEL
 * ============================================================
 */

export const Vendor = model<IVendor>(
  "Vendor",
  vendorSchema,
);