import type { SupplierAgreement, SupplierAgreementStatus } from "./supplier-agreement.types";

export const SUPPLIER_AGREEMENT_STATUS_LABELS: Record<SupplierAgreementStatus, string> = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const SUPPLIER_AGREEMENT_BALANCE_LABELS = {
  UNUSED_ADVANCE: "Unused advance",
  AMOUNT_OWED_TO_SUPPLIER: "Amount owed to supplier",
  SETTLED: "Settled",
} as const;

export const formatSupplierAgreementCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

export const formatSupplierAgreementDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(date);
};

export const getSupplierAgreementVendorName = (
  vendors: Array<{ _id: string; name: string }>,
  agreement: SupplierAgreement,
) => vendors.find((vendor) => vendor._id === agreement.vendorId)?.name ?? "Vendor no longer active";
