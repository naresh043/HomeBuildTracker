export const CONTRACT_TYPE = {
  CONSTRUCTION: "CONSTRUCTION",
  LABOR: "LABOR",
  TURNKEY: "TURNKEY",
  OTHER: "OTHER",
} as const;

export type ContractType = (typeof CONTRACT_TYPE)[keyof typeof CONTRACT_TYPE];

export const CONTRACT_RATE_UNIT = {
  SQUARE: "SQUARE",
  SQFT: "SQFT",
  SQM: "SQM",
  LUMP_SUM: "LUMP_SUM",
  OTHER: "OTHER",
} as const;

export type ContractRateUnit =
  (typeof CONTRACT_RATE_UNIT)[keyof typeof CONTRACT_RATE_UNIT];

export const CONTRACT_STATUS = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type ContractStatus =
  (typeof CONTRACT_STATUS)[keyof typeof CONTRACT_STATUS];
