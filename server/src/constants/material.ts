export const MATERIAL_UNIT = {
  BAG: "BAG",
  KG: "KG",
  TON: "TON",
  LOAD: "LOAD",
  TRACTOR_LOAD: "TRACTOR_LOAD",
  PIECE: "PIECE",
  BOX: "BOX",
  METER: "METER",
  SQFT: "SQFT",
  LITER: "LITER",
  OTHER: "OTHER",
} as const;

export type MaterialUnit = (typeof MATERIAL_UNIT)[keyof typeof MATERIAL_UNIT];
