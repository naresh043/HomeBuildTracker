import { Router } from "express";

import {
  createHouseController,
  getHouseController,
  initializeDefaultHouseController,
  updateCurrentStageController,
  updateHouseController,
} from "../controllers/house.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createHouseSchema,
  updateHouseSchema,
} from "../validators/house.schema";

const router = Router();

/*
=====================================================
GET HOUSE
=====================================================
*/

router.get(
  "/",
  authenticate,
  getHouseController,
);

/*
=====================================================
CREATE HOUSE
=====================================================
*/

router.post(
  "/",
  authenticate,
  validate(createHouseSchema),
  createHouseController,
);

/*
=====================================================
INITIALIZE DEFAULT HOUSE
=====================================================
*/

router.post(
  "/initialize",
  authenticate,
  initializeDefaultHouseController,
);

/*
=====================================================
UPDATE HOUSE
=====================================================
*/

router.patch(
  "/",
  authenticate,
  validate(updateHouseSchema),
  updateHouseController,
);

/*
=====================================================
UPDATE CURRENT CONSTRUCTION STAGE
=====================================================
*/

router.patch(
  "/current-stage",
  authenticate,
  updateCurrentStageController,
);

export default router;