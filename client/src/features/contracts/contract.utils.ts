import type { Contract, ContractStatus } from "./contract.types";
export const formatContractCurrency = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(amount);
export const formatContractDate = (value: string) => new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = { DRAFT: "Draft", ACTIVE: "Active", COMPLETED: "Completed", CANCELLED: "Cancelled" };
export const CONTRACT_TYPE_LABELS = { CONSTRUCTION: "Construction", LABOR: "Labor", TURNKEY: "Turnkey", OTHER: "Other" } as const;
export const CONTRACT_RATE_UNIT_LABELS = { SQUARE: "Square", SQFT: "Square feet", SQM: "Square metres", LUMP_SUM: "Lump sum", OTHER: "Other" } as const;
export const contractVendorName = (vendors: Array<{ _id: string; name: string }>, contract: Contract) => vendors.find((vendor) => vendor._id === contract.vendorId)?.name ?? "Vendor no longer active";
