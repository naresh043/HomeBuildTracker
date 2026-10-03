import type { HouseStatus } from "./house.types";

export const HOUSE_STATUS_LABELS: Record<HouseStatus, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

export const HOUSE_STATUS_DESCRIPTIONS: Record<HouseStatus, string> = {
  NOT_STARTED: "Construction has not started yet.",
  IN_PROGRESS: "Construction is currently in progress.",
  COMPLETED: "House construction has been completed.",
};

export const formatHouseStatus = (status: HouseStatus): string => {
  return HOUSE_STATUS_LABELS[status];
};

export const getHouseStatusDescription = (status: HouseStatus): string => {
  return HOUSE_STATUS_DESCRIPTIONS[status];
};

export const formatHouseDate = (date: string): string => {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

export const formatHouseCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatHouseBudgetRange = (
  budgetMin: number,
  budgetMax: number,
): string => {
  return `${formatHouseCurrency(budgetMin)} – ${formatHouseCurrency(
    budgetMax,
  )}`;
};
