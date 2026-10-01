import type { Request, Response } from "express";

import {
  createHouse,
  getHouse,
  initializeDefaultHouse,
  updateCurrentStage,
  updateHouse,
} from "../services/house.service";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/response";

/*
=====================================================
GET HOUSE
=====================================================
*/

export const getHouseController = asyncHandler(
  async (_req: Request, res: Response) => {
    const house = await getHouse();

    return res.status(200).json(
      successResponse(
        house,
        "House configuration fetched successfully",
      ),
    );
  },
);

/*
=====================================================
CREATE HOUSE
=====================================================
*/

export const createHouseController = asyncHandler(
  async (req: Request, res: Response) => {
    const house = await createHouse(req.body);

    return res.status(201).json(
      successResponse(
        house,
        "House configuration created successfully",
      ),
    );
  },
);

/*
=====================================================
INITIALIZE DEFAULT HOUSE
=====================================================
*/

export const initializeDefaultHouseController =
  asyncHandler(
    async (_req: Request, res: Response) => {
      const house = await initializeDefaultHouse();

      return res.status(200).json(
        successResponse(
          house,
          "Default house configuration initialized successfully",
        ),
      );
    },
  );

/*
=====================================================
UPDATE HOUSE
=====================================================
*/

export const updateHouseController = asyncHandler(
  async (req: Request, res: Response) => {
    const house = await updateHouse(req.body);

    return res.status(200).json(
      successResponse(
        house,
        "House configuration updated successfully",
      ),
    );
  },
);

/*
=====================================================
UPDATE CURRENT CONSTRUCTION STAGE
=====================================================
*/

export const updateCurrentStageController =
  asyncHandler(
    async (req: Request, res: Response) => {
      const { stageId } = req.body as {
        stageId?: unknown;
      };

      /*
      -------------------------------------------------
      VALIDATE stageId TYPE
      -------------------------------------------------

      stageId can be:

      string  -> set current stage
      null    -> clear current stage

      undefined is also accepted here so that the
      controller can provide a clear validation error.
      */

      if (
        stageId !== null &&
        stageId !== undefined &&
        typeof stageId !== "string"
      ) {
        throw new ApiError(
          400,
          "stageId must be a string or null",
        );
      }

      /*
      -------------------------------------------------
      HANDLE MISSING stageId
      -------------------------------------------------

      A missing stageId should not silently clear the
      current stage.

      Therefore, require the property to be present.
      */

      if (!Object.prototype.hasOwnProperty.call(req.body, "stageId")) {
        throw new ApiError(
          400,
          "stageId is required",
        );
      }

      const house = await updateCurrentStage(
        stageId as string | null,
      );

      return res.status(200).json(
        successResponse(
          house,
          "Current construction stage updated successfully",
        ),
      );
    },
  );