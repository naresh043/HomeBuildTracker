import { Router } from "express";

import {
  createStageController,
  deleteStageController,
  getActiveStagesController,
  getStageByIdController,
  getStagesController,
  initializeDefaultStagesController,
  reorderStagesController,
  updateStageController,
} from "../controllers/stage.controller";

import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

import {
  createStageSchema,
  reorderStagesSchema,
  stageIdParamSchema,
  stageListQuerySchema,
  updateStageSchema,
} from "../validators/stage.schema";

const router = Router();

/*
=====================================================
AUTHENTICATION
=====================================================
*/

router.use(authenticate);

/*
=====================================================
GET ACTIVE STAGES
=====================================================

GET /api/stages/active
*/

router.get(
  "/active",
  getActiveStagesController,
);

/*
=====================================================
GET ALL STAGES
=====================================================

GET /api/stages

Examples:

/api/stages

/api/stages?status=IN_PROGRESS

/api/stages?includeDeleted=true
*/

router.get(
  "/",
  validate(
    // The validation middleware expects
    // body + params + query together.
    stageListQuerySchema,
  ),
  getStagesController,
);

/*
=====================================================
INITIALIZE DEFAULT STAGES
=====================================================

POST /api/stages/initialize
*/

router.post(
  "/initialize",
  initializeDefaultStagesController,
);

/*
=====================================================
CREATE STAGE
=====================================================

POST /api/stages
*/

router.post(
  "/",
  validate(createStageSchema),
  createStageController,
);

/*
=====================================================
REORDER STAGES
=====================================================

PATCH /api/stages/reorder
*/

router.patch(
  "/reorder",
  validate(reorderStagesSchema),
  reorderStagesController,
);

/*
=====================================================
GET SINGLE STAGE
=====================================================

GET /api/stages/:stageId
*/

router.get(
  "/:stageId",
  validate(stageIdParamSchema),
  getStageByIdController,
);

/*
=====================================================
UPDATE STAGE
=====================================================

PATCH /api/stages/:stageId
*/

router.patch(
  "/:stageId",
  validate(updateStageSchema),
  updateStageController,
);

/*
=====================================================
DELETE STAGE
=====================================================

DELETE /api/stages/:stageId
*/

router.delete(
  "/:stageId",
  validate(stageIdParamSchema),
  deleteStageController,
);

export default router;