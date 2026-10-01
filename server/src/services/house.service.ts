import { Types } from "mongoose";

import {
  DEFAULT_BUDGET_MAX_PAISE,
  DEFAULT_BUDGET_MIN_PAISE,
  DEFAULT_HOUSE_FLOORS,
  DEFAULT_HOUSE_START_DATE,
  HOUSE_CONFIGURATION_KEY,
  HOUSE_STATUS,
} from "../constants/house";
import {
  HouseConfiguration,
  type IHouseConfiguration,
} from "../models/HouseConfiguration";
import {
  type CreateHouseInput,
  type UpdateHouseInput,
} from "../validators/house.schema";
import { ApiError } from "../utils/ApiError";

/*
=====================================================
TYPES
=====================================================
*/

type HouseConfigurationResponse = IHouseConfiguration;

/*
=====================================================
HELPER
=====================================================
*/

/**
 * Convert a Mongoose document into a plain object.
 *
 * Keeping this in the service prevents controllers from
 * depending on Mongoose document behavior.
 */
const toPlainHouse = (
  house: IHouseConfiguration,
): HouseConfigurationResponse => {
  return house.toObject() as HouseConfigurationResponse;
};

/**
 * Validate the relationship between the house budget values.
 *
 * This validation is performed again at the service layer
 * because update requests may contain only a subset of
 * the budget fields.
 */
const validateBudget = ({
  budgetMin,
  budgetMax,
  workingBudget,
}: {
  budgetMin: number;
  budgetMax: number;
  workingBudget?: number | null;
}): void => {
  if (budgetMin > budgetMax) {
    throw new ApiError(
      400,
      "Minimum budget cannot be greater than maximum budget",
    );
  }

  if (
    workingBudget !== undefined &&
    workingBudget !== null &&
    workingBudget < budgetMin
  ) {
    throw new ApiError(
      400,
      "Working budget cannot be less than minimum budget",
    );
  }

  if (
    workingBudget !== undefined &&
    workingBudget !== null &&
    workingBudget > budgetMax
  ) {
    throw new ApiError(
      400,
      "Working budget cannot be greater than maximum budget",
    );
  }
};

/*
=====================================================
GET HOUSE
=====================================================
*/

/**
 * Get the single house configuration.
 *
 * There must only ever be one configuration document.
 */
export const getHouse = async (): Promise<HouseConfigurationResponse> => {
  const house = await HouseConfiguration.findOne({
    singletonKey: HOUSE_CONFIGURATION_KEY,
  }).lean();

  if (!house) {
    throw new ApiError(404, "House configuration has not been initialized");
  }

  return house as HouseConfigurationResponse;
};

/*
=====================================================
CREATE HOUSE
=====================================================
*/

/**
 * Create the single house configuration.
 *
 * This operation is intentionally protected against creating
 * a second house configuration.
 */
export const createHouse = async (
  input: CreateHouseInput,
): Promise<HouseConfigurationResponse> => {
  const existingHouse = await HouseConfiguration.exists({
    singletonKey: HOUSE_CONFIGURATION_KEY,
  });

  if (existingHouse) {
    throw new ApiError(409, "House configuration already exists");
  }

  validateBudget({
    budgetMin: input.budgetMin,
    budgetMax: input.budgetMax,
    workingBudget: input.workingBudget,
  });

  if (input.currentStageId) {
    if (!Types.ObjectId.isValid(input.currentStageId)) {
      throw new ApiError(
        400,
        "Current stage ID must be a valid MongoDB ObjectId",
      );
    }
  }

  const house = await HouseConfiguration.create({
    singletonKey: HOUSE_CONFIGURATION_KEY,
    name: input.name,
    location: input.location,
    startDate: input.startDate,
    status: input.status,
    floors: input.floors,
    budgetMin: input.budgetMin,
    budgetMax: input.budgetMax,
    workingBudget: input.workingBudget,
    currentStageId: input.currentStageId
      ? new Types.ObjectId(input.currentStageId)
      : undefined,
  });

  return toPlainHouse(house);
};

/*
=====================================================
INITIALIZE DEFAULT HOUSE
=====================================================
*/

/**
 * Create the initial HomeBuild Tracker configuration
 * using the application's default house structure.
 *
 * This is useful for first-time application setup and
 * database initialization.
 */
export const initializeDefaultHouse =
  async (): Promise<HouseConfigurationResponse> => {
    const existingHouse = await HouseConfiguration.findOne({
      singletonKey: HOUSE_CONFIGURATION_KEY,
    });

    if (existingHouse) {
      return toPlainHouse(existingHouse);
    }

    const house = await HouseConfiguration.create({
      singletonKey: HOUSE_CONFIGURATION_KEY,

      name: "My House",

      startDate: DEFAULT_HOUSE_START_DATE,

      status: HOUSE_STATUS.IN_PROGRESS,

      floors: DEFAULT_HOUSE_FLOORS.map((floor) => ({
        name: floor.name,
        rooms: floor.rooms.map((room) => ({
          name: room.name,
        })),
      })),

      budgetMin: DEFAULT_BUDGET_MIN_PAISE,

      budgetMax: DEFAULT_BUDGET_MAX_PAISE,

      /*
       * Working budget intentionally remains undefined.
       * The initial requirements define a budget range.
       */

      workingBudget: undefined,

      currentStageId: undefined,
    });

    return toPlainHouse(house);
  };

/*
=====================================================
UPDATE HOUSE
=====================================================
*/

/**
 * Update the existing single house configuration.
 *
 * The service reads the existing document first so that
 * partial updates can still be validated against the
 * complete budget state.
 */
export const updateHouse = async (
  input: UpdateHouseInput,
): Promise<HouseConfigurationResponse> => {
  const house = await HouseConfiguration.findOne({
    singletonKey: HOUSE_CONFIGURATION_KEY,
  });

  if (!house) {
    throw new ApiError(404, "House configuration has not been initialized");
  }

  const nextBudgetMin = input.budgetMin ?? house.budgetMin;

  const nextBudgetMax = input.budgetMax ?? house.budgetMax;

  const nextWorkingBudget =
    input.workingBudget !== undefined
      ? input.workingBudget
      : house.workingBudget;

  validateBudget({
    budgetMin: nextBudgetMin,
    budgetMax: nextBudgetMax,
    workingBudget: nextWorkingBudget,
  });

  if (input.currentStageId) {
    if (!Types.ObjectId.isValid(input.currentStageId)) {
      throw new ApiError(
        400,
        "Current stage ID must be a valid MongoDB ObjectId",
      );
    }
  }

  if (input.name !== undefined) {
    house.name = input.name;
  }

  if (input.location !== undefined) {
    house.location = input.location;
  }

  if (input.startDate !== undefined) {
    house.startDate = input.startDate;
  }

  if (input.status !== undefined) {
    house.status = input.status;
  }

  if (input.floors !== undefined) {
    house.floors = input.floors;
  }

  if (input.budgetMin !== undefined) {
    house.budgetMin = input.budgetMin;
  }

  if (input.budgetMax !== undefined) {
    house.budgetMax = input.budgetMax;
  }

  if (input.workingBudget !== undefined) {
    house.workingBudget = input.workingBudget ?? undefined;
  }

  if (input.currentStageId !== undefined) {
    house.currentStageId = input.currentStageId
      ? new Types.ObjectId(input.currentStageId)
      : undefined;
  }

  await house.save();

  return toPlainHouse(house);
};

/*
=====================================================
UPDATE CURRENT STAGE
=====================================================
*/

/**
 * Update only the current construction stage.
 *
 * This is separated from the general house update so the
 * dashboard/stage workflow can update the current stage
 * without sending the entire house configuration.
 */
export const updateCurrentStage = async (
  stageId: string | null,
): Promise<HouseConfigurationResponse> => {
  const house = await HouseConfiguration.findOne({
    singletonKey: HOUSE_CONFIGURATION_KEY,
  });

  if (!house) {
    throw new ApiError(404, "House configuration has not been initialized");
  }

  if (stageId !== null) {
    if (!Types.ObjectId.isValid(stageId)) {
      throw new ApiError(400, "Stage ID must be a valid MongoDB ObjectId");
    }

    house.currentStageId = new Types.ObjectId(stageId);
  } else {
    house.currentStageId = undefined;
  }

  await house.save();

  return toPlainHouse(house);
};
