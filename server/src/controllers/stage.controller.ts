import type { Request, Response } from "express";

import {
  createStage,
  deleteStage,
  getActiveStages,
  getStageById,
  getStages,
  initializeDefaultStages,
  reorderStages,
  updateStage,
} from "../services/stage.service";

import type {
  ReorderStagesInput,
  StageListQueryInput,
} from "../validators/stage.schema";

import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/response";

/*
=====================================================
CREATE STAGE
=====================================================
*/

export const createStageController = asyncHandler(
  async (req: Request, res: Response) => {
    const stage = await createStage(
      req.body,
    );

    return res.status(201).json(
      successResponse(
        stage,
        "Construction stage created successfully",
      ),
    );
  },
);

/*
=====================================================
GET ALL STAGES
=====================================================
*/

export const getStagesController = asyncHandler(
  async (req: Request, res: Response) => {
    /*
    Query parameters have already been validated
    and transformed by the validation middleware.
    */

    const query =
      req.query as unknown as StageListQueryInput;

    const stages = await getStages(query);

    return res.status(200).json(
      successResponse(
        stages,
        "Construction stages fetched successfully",
      ),
    );
  },
);

/*
=====================================================
GET ACTIVE STAGES
=====================================================
*/

export const getActiveStagesController = asyncHandler(
  async (_req: Request, res: Response) => {
    const stages = await getActiveStages();

    return res.status(200).json(
      successResponse(
        stages,
        "Active construction stages fetched successfully",
      ),
    );
  },
);

/*
=====================================================
GET SINGLE STAGE
=====================================================
*/

export const getStageByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const stageId = String(req.params.stageId);

    const stage = await getStageById(stageId);

    return res.status(200).json(
      successResponse(
        stage,
        "Construction stage fetched successfully",
      ),
    );
  },
);

/*
=====================================================
UPDATE STAGE
=====================================================
*/

export const updateStageController = asyncHandler(
  async (req: Request, res: Response) => {
    const stageId = String(req.params.stageId);

    const stage = await updateStage(
      stageId,
      req.body,
    );

    return res.status(200).json(
      successResponse(
        stage,
        "Construction stage updated successfully",
      ),
    );
  },
);

/*
=====================================================
DELETE STAGE
=====================================================
*/

export const deleteStageController = asyncHandler(
  async (req: Request, res: Response) => {
    const stageId = String(req.params.stageId);

    await deleteStage(stageId);

    return res.status(200).json(
      successResponse(
        null,
        "Construction stage deleted successfully",
      ),
    );
  },
);

/*
=====================================================
REORDER STAGES
=====================================================
*/

export const reorderStagesController = asyncHandler(
  async (req: Request, res: Response) => {
    const input =
      req.body as ReorderStagesInput;

    const stages = await reorderStages(input);

    return res.status(200).json(
      successResponse(
        stages,
        "Construction stages reordered successfully",
      ),
    );
  },
);

/*
=====================================================
INITIALIZE DEFAULT STAGES
=====================================================
*/

export const initializeDefaultStagesController =
  asyncHandler(async (_req: Request, res: Response) => {
    const stages = await initializeDefaultStages();

    return res.status(200).json(
      successResponse(
        stages,
        "Default construction stages initialized successfully",
      ),
    );
  });