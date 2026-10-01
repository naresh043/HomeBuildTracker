import mongoose, { Types } from "mongoose";

import {
  CONSTRUCTION_STAGE_STATUS,
  DEFAULT_CONSTRUCTION_STAGES,
} from "../constants/construction";
import {
  ConstructionStage,
  type IConstructionStage,
} from "../models/ConstructionStage";
import { ApiError } from "../utils/ApiError";
import type {
  CreateStageInput,
  ReorderStagesInput,
  StageListQueryInput,
  UpdateStageInput,
} from "../validators/stage.schema";

/*
=====================================================
TYPES
=====================================================
*/

type StageResponse = IConstructionStage;

/*
=====================================================
HELPERS
=====================================================
*/

/**
 * Normalize a stage name before duplicate checks.
 *
 * Example:
 *
 * "  Foundation  "
 * "foundation"
 * "FOUNDATION"
 *
 * are treated as the same stage name.
 */
const normalizeStageName = (name: string): string =>
  name.trim().replace(/\s+/g, " ").toLowerCase();

/**
 * Convert a Mongoose document into a plain response object.
 */
const toPlainStage = (stage: IConstructionStage): StageResponse => {
  return stage.toObject() as StageResponse;
};

/*
=====================================================
DUPLICATE NAME CHECK
=====================================================
*/

const ensureUniqueStageName = async ({
  name,
  excludeStageId,
}: {
  name: string;
  excludeStageId?: Types.ObjectId;
}): Promise<void> => {
  const normalizedName = normalizeStageName(name);

  const activeStages = await ConstructionStage.find({
    isDeleted: false,
    ...(excludeStageId
      ? {
          _id: {
            $ne: excludeStageId,
          },
        }
      : {}),
  }).select("name");

  const duplicateExists = activeStages.some(
    (stage) => normalizeStageName(stage.name) === normalizedName,
  );

  if (duplicateExists) {
    throw new ApiError(
      409,
      "A construction stage with this name already exists",
      "DUPLICATE_STAGE_NAME",
    );
  }
};

/*
=====================================================
GET NEXT ORDER
=====================================================
*/

const getNextStageOrder = async (): Promise<number> => {
  const lastStage = await ConstructionStage.findOne({
    isDeleted: false,
  })
    .sort({ order: -1 })
    .select("order")
    .lean();

  return lastStage ? lastStage.order + 1 : 1;
};

/*
=====================================================
NORMALIZE STAGE ORDERS
=====================================================

Keeps active stage orders sequential:

1
2
3
4
...

This prevents gaps such as:

1
2
5
9
=====================================================
*/

const normalizeStageOrders = async (
  session?: mongoose.ClientSession,
): Promise<void> => {
  const stages = await ConstructionStage.find({
    isDeleted: false,
  })
    .sort({
      order: 1,
      createdAt: 1,
      _id: 1,
    })
    .session(session ?? null);

  const operations = stages.map((stage, index) => ({
    updateOne: {
      filter: {
        _id: stage._id,
        isDeleted: false,
      },
      update: {
        $set: {
          order: index + 1,
        },
      },
    },
  }));

  if (operations.length > 0) {
    await ConstructionStage.bulkWrite(
      operations,
      session ? { session } : undefined,
    );
  }
};

/*
=====================================================
VALIDATE STAGE DATES
=====================================================
*/

const validateStageDates = ({
  startDate,
  completionDate,
}: {
  startDate?: Date | null;
  completionDate?: Date | null;
}): void => {
  if (startDate && completionDate && completionDate < startDate) {
    throw new ApiError(
      400,
      "Completion date cannot be earlier than start date",
      "INVALID_STAGE_DATES",
    );
  }
};

/*
=====================================================
CREATE STAGE
=====================================================
*/

export const createStage = async (
  input: CreateStageInput,
): Promise<StageResponse> => {
  await ensureUniqueStageName({
    name: input.name,
  });

  validateStageDates({
    startDate: input.startDate,
    completionDate: input.completionDate,
  });

  /*
  ---------------------------------------------------
  COMPLETED STATUS
  ---------------------------------------------------
  */

  if (
    input.status === CONSTRUCTION_STAGE_STATUS.COMPLETED &&
    !input.completionDate
  ) {
    throw new ApiError(
      400,
      "Completion date is required when stage status is COMPLETED",
      "COMPLETION_DATE_REQUIRED",
    );
  }

  /*
  ---------------------------------------------------
  DETERMINE ORDER
  ---------------------------------------------------

  If the caller provides an order, we insert the stage
  at that position.

  Otherwise, append it to the end.
  */

  const existingStageCount = await ConstructionStage.countDocuments({
    isDeleted: false,
  });

  const requestedOrder = input.order;

  const finalOrder = Math.min(
    Math.max(requestedOrder, 1),
    existingStageCount + 1,
  );

  /*
  ---------------------------------------------------
  SHIFT EXISTING STAGES
  ---------------------------------------------------

  If we insert at order 3:

  1
  2
  3
  4

  becomes:

  1
  2
  NEW
  3
  4
  */

  await ConstructionStage.updateMany(
    {
      isDeleted: false,
      order: {
        $gte: finalOrder,
      },
    },
    {
      $inc: {
        order: 1,
      },
    },
  );

  const stage = await ConstructionStage.create({
    name: input.name,
    description: input.description,
    status: input.status ?? CONSTRUCTION_STAGE_STATUS.NOT_STARTED,
    order: finalOrder,
    startDate: input.startDate,
    completionDate: input.completionDate,
    notes: input.notes,
    isDeleted: false,
  });

  return toPlainStage(stage);
};

/*
=====================================================
GET ALL STAGES
=====================================================
*/

export const getStages = async (
  query?: StageListQueryInput,
): Promise<StageResponse[]> => {
  const filter: Record<string, unknown> = {};

  const includeDeleted = query?.includeDeleted ?? false;
  const status = query?.status;

  /*
  =====================================================
  DELETED FILTER
  =====================================================
  */

  if (!includeDeleted) {
    filter.isDeleted = false;
  }

  /*
  =====================================================
  STATUS FILTER
  =====================================================
  */

  if (status) {
    filter.status = status;
  }

  /*
  =====================================================
  FETCH STAGES
  =====================================================
  */

  const stages = await ConstructionStage.find(filter)
    .sort({
      order: 1,
      createdAt: 1,
    })
    .lean();

  return stages as StageResponse[];
};

/*
=====================================================
GET ACTIVE STAGES
=====================================================
*/

export const getActiveStages = async (): Promise<StageResponse[]> => {
  return getStages({
    includeDeleted: false,
  });
};

/*
=====================================================
GET SINGLE STAGE
=====================================================
*/

export const getStageById = async (stageId: string): Promise<StageResponse> => {
  if (!Types.ObjectId.isValid(stageId)) {
    throw new ApiError(
      400,
      "Invalid construction stage ID",
      "INVALID_STAGE_ID",
    );
  }

  const stage = await ConstructionStage.findOne({
    _id: stageId,
    isDeleted: false,
  });

  if (!stage) {
    throw new ApiError(404, "Construction stage not found", "STAGE_NOT_FOUND");
  }

  return toPlainStage(stage);
};

/*
=====================================================
UPDATE STAGE
=====================================================
*/

export const updateStage = async (
  stageId: string,
  input: UpdateStageInput,
): Promise<StageResponse> => {
  if (!Types.ObjectId.isValid(stageId)) {
    throw new ApiError(
      400,
      "Invalid construction stage ID",
      "INVALID_STAGE_ID",
    );
  }

  const objectId = new Types.ObjectId(stageId);

  const stage = await ConstructionStage.findOne({
    _id: objectId,
    isDeleted: false,
  });

  if (!stage) {
    throw new ApiError(404, "Construction stage not found", "STAGE_NOT_FOUND");
  }

  /*
  ---------------------------------------------------
  DUPLICATE NAME CHECK
  ---------------------------------------------------
  */

  if (input.name !== undefined) {
    await ensureUniqueStageName({
      name: input.name,
      excludeStageId: objectId,
    });
  }

  /*
  ---------------------------------------------------
  DETERMINE FINAL DATES
  ---------------------------------------------------
  */

  const finalStartDate =
    input.startDate !== undefined ? input.startDate : stage.startDate;

  const finalCompletionDate =
    input.completionDate !== undefined
      ? input.completionDate
      : stage.completionDate;

  validateStageDates({
    startDate: finalStartDate,
    completionDate: finalCompletionDate,
  });

  /*
  ---------------------------------------------------
  DETERMINE FINAL STATUS
  ---------------------------------------------------
  */

  const finalStatus = input.status !== undefined ? input.status : stage.status;

  /*
  ---------------------------------------------------
  COMPLETED STATUS
  ---------------------------------------------------
  */

  if (
    finalStatus === CONSTRUCTION_STAGE_STATUS.COMPLETED &&
    !finalCompletionDate
  ) {
    throw new ApiError(
      400,
      "Completion date is required when stage status is COMPLETED",
      "COMPLETION_DATE_REQUIRED",
    );
  }

  /*
  ---------------------------------------------------
  APPLY FIELDS
  ---------------------------------------------------
  */

  if (input.name !== undefined) {
    stage.name = input.name;
  }

  if (input.description !== undefined) {
    stage.description = input.description ?? undefined;
  }

  if (input.status !== undefined) {
    stage.status = input.status;
  }

  if (input.startDate !== undefined) {
    stage.startDate = input.startDate ?? undefined;
  }

  if (input.completionDate !== undefined) {
    stage.completionDate = input.completionDate ?? undefined;
  }

  if (input.notes !== undefined) {
    stage.notes = input.notes ?? undefined;
  }

  /*
  ---------------------------------------------------
  ORDER
  ---------------------------------------------------

  Order changes are handled separately so we can safely
  shift the other stages.
  */

  if (input.order !== undefined && input.order !== stage.order) {
    const activeStageCount = await ConstructionStage.countDocuments({
      isDeleted: false,
    });

    const newOrder = Math.min(Math.max(input.order, 1), activeStageCount);

    const oldOrder = stage.order;

    if (newOrder < oldOrder) {
      await ConstructionStage.updateMany(
        {
          _id: {
            $ne: objectId,
          },
          isDeleted: false,
          order: {
            $gte: newOrder,
            $lt: oldOrder,
          },
        },
        {
          $inc: {
            order: 1,
          },
        },
      );
    } else {
      await ConstructionStage.updateMany(
        {
          _id: {
            $ne: objectId,
          },
          isDeleted: false,
          order: {
            $gt: oldOrder,
            $lte: newOrder,
          },
        },
        {
          $inc: {
            order: -1,
          },
        },
      );
    }

    stage.order = newOrder;
  }

  await stage.save();

  /*
  ---------------------------------------------------
  FINAL ORDER NORMALIZATION
  ---------------------------------------------------
  */

  await normalizeStageOrders();

  const updatedStage = await ConstructionStage.findById(objectId);

  if (!updatedStage) {
    throw new ApiError(
      500,
      "Construction stage could not be retrieved after update",
      "STAGE_UPDATE_FAILED",
    );
  }

  return toPlainStage(updatedStage);
};

/*
=====================================================
SOFT DELETE STAGE
=====================================================
*/

export const deleteStage = async (stageId: string): Promise<void> => {
  if (!Types.ObjectId.isValid(stageId)) {
    throw new ApiError(
      400,
      "Invalid construction stage ID",
      "INVALID_STAGE_ID",
    );
  }

  const objectId = new Types.ObjectId(stageId);

  const stage = await ConstructionStage.findOne({
    _id: objectId,
    isDeleted: false,
  });

  if (!stage) {
    throw new ApiError(404, "Construction stage not found", "STAGE_NOT_FOUND");
  }

  /*
  ---------------------------------------------------
  SOFT DELETE
  ---------------------------------------------------
  */

  stage.isDeleted = true;

  await stage.save();

  /*
  ---------------------------------------------------
  NORMALIZE REMAINING ORDERS
  ---------------------------------------------------
  */

  await normalizeStageOrders();
};

/*
=====================================================
REORDER STAGES
=====================================================
*/

export const reorderStages = async (
  input: ReorderStagesInput,
): Promise<StageResponse[]> => {
  const session = await mongoose.startSession();

  try {
    let reorderedStages: StageResponse[] = [];

    await session.withTransaction(async () => {
      /*
      -------------------------------------------------
      CONVERT IDS
      -------------------------------------------------
      */

      const stageIds = input.stageIds.map(
        (stageId) => new Types.ObjectId(stageId),
      );

      /*
      -------------------------------------------------
      FETCH ACTIVE STAGES
      -------------------------------------------------
      */

      const activeStages = await ConstructionStage.find({
        isDeleted: false,
      })
        .select("_id")
        .session(session);

      /*
      -------------------------------------------------
      VERIFY COMPLETE STAGE SET
      -------------------------------------------------

      The supplied list must contain every active stage
      exactly once.
      */

      if (stageIds.length !== activeStages.length) {
        throw new ApiError(
          400,
          "All active construction stages must be included when reordering",
          "INCOMPLETE_STAGE_ORDER",
        );
      }

      const activeStageIdSet = new Set(
        activeStages.map((stage) => stage._id.toString()),
      );

      for (const stageId of stageIds) {
        if (!activeStageIdSet.has(stageId.toString())) {
          throw new ApiError(
            400,
            "Reorder list contains an invalid or inactive construction stage",
            "INVALID_STAGE_ORDER",
          );
        }
      }

      /*
      -------------------------------------------------
      ASSIGN NEW ORDERS
      -------------------------------------------------
      */

      const operations = stageIds.map((stageId, index) => ({
        updateOne: {
          filter: {
            _id: stageId,
            isDeleted: false,
          },
          update: {
            $set: {
              order: index + 1,
            },
          },
        },
      }));

      await ConstructionStage.bulkWrite(operations, {
        session,
      });

      /*
      -------------------------------------------------
      FETCH REORDERED STAGES
      -------------------------------------------------
      */

      const stages = await ConstructionStage.find({
        isDeleted: false,
      })
        .sort({
          order: 1,
        })
        .session(session)
        .lean();

      reorderedStages = stages as StageResponse[];
    });

    return reorderedStages;
  } finally {
    await session.endSession();
  }
};

/*
=====================================================
INITIALIZE DEFAULT STAGES
=====================================================

Creates the 13 default stages if the database currently
has no active construction stages.

If stages already exist, nothing is deleted or replaced.
=====================================================
*/

export const initializeDefaultStages = async (): Promise<StageResponse[]> => {
  const activeStageCount = await ConstructionStage.countDocuments({
    isDeleted: false,
  });

  if (activeStageCount > 0) {
    return getActiveStages();
  }

  const stages = DEFAULT_CONSTRUCTION_STAGES.map((name, index) => ({
    name,
    status:
      index === 0
        ? CONSTRUCTION_STAGE_STATUS.IN_PROGRESS
        : CONSTRUCTION_STAGE_STATUS.NOT_STARTED,
    order: index + 1,
    isDeleted: false,
  }));

  await ConstructionStage.insertMany(stages);

  return getActiveStages();
};
