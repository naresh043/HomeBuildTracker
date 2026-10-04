import { format, isValid, parseISO } from "date-fns";

import type { MaterialUnit } from "@/features/materials/material.types";
import type { MaterialReceiptVerificationStatus } from "./material-receipt.types";

export const MATERIAL_RECEIPT_UNIT_LABELS: Record<MaterialUnit, string> = {
  BAG: "Bag",
  KG: "Kg",
  TON: "Ton",
  LOAD: "Load",
  TRACTOR_LOAD: "Tractor Load",
  PIECE: "Piece",
  BOX: "Box",
  METER: "Meter",
  SQFT: "Sq.ft",
  LITER: "Liter",
  OTHER: "Other",
};

export const formatReceiptUnit = (unit: MaterialUnit): string => MATERIAL_RECEIPT_UNIT_LABELS[unit];

export const formatReceiptDate = (value: string): string => {
  const date = parseISO(value);
  return isValid(date) ? format(date, "dd MMM yyyy") : value;
};

export const formatReceiptCurrency = (value: number): string =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);

export const VERIFICATION_STATUS_LABELS: Record<MaterialReceiptVerificationStatus, string> = {
  VERIFIED: "Verified",
  NEEDS_VERIFICATION: "Needs verification",
};
