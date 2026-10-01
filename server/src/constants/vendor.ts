/**
 * ============================================================
 * VENDOR CONSTANTS
 * ============================================================
 *
 * Vendors are people or businesses involved in the
 * construction of the house.
 *
 * Examples:
 * - Siddappa       -> CONTRACTOR
 * - Raghunathappa  -> MATERIAL_SUPPLIER
 * - Electrician    -> SERVICE_PROVIDER
 * - Other vendors  -> OTHER
 */

/**
 * ============================================================
 * VENDOR TYPE
 * ============================================================
 */

export const VENDOR_TYPE = {
  CONTRACTOR: "CONTRACTOR",
  MATERIAL_SUPPLIER: "MATERIAL_SUPPLIER",
  SERVICE_PROVIDER: "SERVICE_PROVIDER",
  OTHER: "OTHER",
} as const;

export type VendorType = (typeof VENDOR_TYPE)[keyof typeof VENDOR_TYPE];

/**
 * ============================================================
 * VENDOR STATUS
 * ============================================================
 *
 * ACTIVE:
 *   Vendor can be used for new transactions.
 *
 * INACTIVE:
 *   Vendor remains in the database/history but should not
 *   normally be selected for new transactions.
 */

export const VENDOR_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type VendorStatus = (typeof VENDOR_STATUS)[keyof typeof VENDOR_STATUS];
