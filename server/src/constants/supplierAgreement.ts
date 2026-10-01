export const SUPPLIER_AGREEMENT_STATUS = {
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type SupplierAgreementStatus =
  (typeof SUPPLIER_AGREEMENT_STATUS)[keyof typeof SUPPLIER_AGREEMENT_STATUS];
