/**
 * House configuration constants.
 *
 * The application manages exactly one house.
 * There is intentionally no projectId, project model,
 * project membership, or project selector.
 */

export const HOUSE_CONFIGURATION_KEY = "HOME_BUILD_TRACKER";

/**
 * Overall construction status of the house.
 */
export const HOUSE_STATUS = {
  NOT_STARTED: "NOT_STARTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
} as const;

export type HouseStatus =
  (typeof HOUSE_STATUS)[keyof typeof HOUSE_STATUS];

/**
 * Default house structure.
 *
 * These are seed/default values only.
 * The actual structure is stored in MongoDB and can be changed
 * through the house configuration API.
 */
export const DEFAULT_HOUSE_FLOORS = [
  {
    name: "Ground Floor",
    rooms: [
      { name: "Hall" },
      { name: "Bedroom 1" },
      { name: "Bedroom 2" },
      { name: "Kitchen" },
      { name: "Bathroom" },
      { name: "Pooja Room" },
    ],
  },
  {
    name: "First Floor",
    rooms: [
      { name: "Room 1" },
      { name: "Room 2" },
    ],
  },
] as const;

/**
 * The construction started in March 2026.
 *
 * We use the first day of the month as the default starting date.
 * Historical transactions can still be backdated to their actual
 * transaction date.
 */
export const DEFAULT_HOUSE_START_DATE = new Date("2026-03-01T00:00:00.000Z");

/**
 * Initial budget range from the product requirements.
 *
 * All monetary values in the backend are stored in paise.
 *
 * ₹25,00,000 = 25,00,00,000 paise
 * ₹30,00,000 = 30,00,00,000 paise
 */
export const DEFAULT_BUDGET_MIN_PAISE = 250_000_000;
export const DEFAULT_BUDGET_MAX_PAISE = 300_000_000;