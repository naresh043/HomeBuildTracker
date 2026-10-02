import { Document, Schema, Types, model } from "mongoose";

import {
  DEFAULT_BUDGET_MAX_PAISE,
  DEFAULT_BUDGET_MIN_PAISE,
  DEFAULT_HOUSE_START_DATE,
  HOUSE_CONFIGURATION_KEY,
  HOUSE_STATUS,
  type HouseStatus,
} from "../constants/house";

/*
=====================================================
ROOM
=====================================================
*/

export interface IHouseRoom {
  name: string;
}

/*
=====================================================
FLOOR
=====================================================
*/

export interface IHouseFloor {
  name: string;
  rooms: IHouseRoom[];
}

/*
=====================================================
HOUSE CONFIGURATION
=====================================================
*/

export interface IHouseConfiguration extends Document {
  singletonKey: string;

  name: string;

  location?: string;

  startDate: Date;

  status: HouseStatus;

  floors: IHouseFloor[];

  budgetMin: number;

  budgetMax: number;

  workingBudget?: number;

  currentStageId?: Types.ObjectId;

  createdAt: Date;

  updatedAt: Date;
}

/*
=====================================================
ROOM SCHEMA
=====================================================
*/

const houseRoomSchema = new Schema<IHouseRoom>(
  {
    name: {
      type: String,
      required: [true, "Room name is required"],
      trim: true,
      minlength: [1, "Room name cannot be empty"],
      maxlength: [100, "Room name cannot exceed 100 characters"],
    },
  },
  {
    _id: true,
    id: false,
  },
);

/*
=====================================================
FLOOR SCHEMA
=====================================================
*/

const houseFloorSchema = new Schema<IHouseFloor>(
  {
    name: {
      type: String,
      required: [true, "Floor name is required"],
      trim: true,
      minlength: [1, "Floor name cannot be empty"],
      maxlength: [100, "Floor name cannot exceed 100 characters"],
    },

    rooms: {
      type: [houseRoomSchema],
      default: [],
    },
  },
  {
    _id: true,
    id: false,
  },
);

/*
=====================================================
HOUSE CONFIGURATION SCHEMA
=====================================================
*/

const houseConfigurationSchema = new Schema<IHouseConfiguration>(
  {
    /*
      -------------------------------------------------
      SINGLETON KEY
      -------------------------------------------------

      There is exactly one house configuration.

      This unique key prevents accidentally creating
      multiple house configurations.
      */

    singletonKey: {
      type: String,
      required: [true, "House configuration key is required"],
      immutable: true,
      default: HOUSE_CONFIGURATION_KEY,
    },

    /*
      -------------------------------------------------
      HOUSE NAME
      -------------------------------------------------
      */

    name: {
      type: String,
      required: [true, "House name is required"],
      trim: true,
      minlength: [2, "House name must be at least 2 characters"],
      maxlength: [150, "House name cannot exceed 150 characters"],
    },

    /*
      -------------------------------------------------
      LOCATION
      -------------------------------------------------

      Optional because the application does not require
      the exact house address for its accounting logic.
      */

    location: {
      type: String,
      trim: true,
      maxlength: [300, "Location cannot exceed 300 characters"],
    },

    /*
      -------------------------------------------------
      CONSTRUCTION START DATE
      -------------------------------------------------
      */

    startDate: {
      type: Date,
      required: [true, "House construction start date is required"],
      default: DEFAULT_HOUSE_START_DATE,
    },

    /*
      -------------------------------------------------
      HOUSE STATUS
      -------------------------------------------------
      */

    status: {
      type: String,
      required: [true, "House status is required"],
      enum: {
        values: Object.values(HOUSE_STATUS),
        message: "Invalid house status",
      },
      default: HOUSE_STATUS.IN_PROGRESS,
      index: true,
    },

    /*
      -------------------------------------------------
      FLOORS
      -------------------------------------------------

      Floors and rooms are embedded because there is only
      one house and this configuration is relatively small.

      The structure remains configurable rather than being
      hard-coded into the application.
      */

    floors: {
      type: [houseFloorSchema],
      required: [true, "At least one floor is required"],
      validate: {
        validator: (floors: IHouseFloor[]) => floors.length > 0,
        message: "House must contain at least one floor",
      },
    },

    /*
      -------------------------------------------------
      BUDGET MINIMUM
      -------------------------------------------------

      IMPORTANT:
      All money values are stored as integer paise.

      Example:
      ₹25,00,000 = 250,000,000 paise
      */

    budgetMin: {
      type: Number,
      required: [true, "Minimum budget is required"],
      min: [0, "Minimum budget cannot be negative"],
      default: DEFAULT_BUDGET_MIN_PAISE,
      validate: {
        validator: Number.isInteger,
        message: "Minimum budget must be an integer number of paise",
      },
    },

    /*
      -------------------------------------------------
      BUDGET MAXIMUM
      -------------------------------------------------
      */

    budgetMax: {
      type: Number,
      required: [true, "Maximum budget is required"],
      min: [0, "Maximum budget cannot be negative"],
      default: DEFAULT_BUDGET_MAX_PAISE,
      validate: {
        validator: Number.isInteger,
        message: "Maximum budget must be an integer number of paise",
      },
    },

    /*
      -------------------------------------------------
      WORKING BUDGET
      -------------------------------------------------

      Optional because the initial requirements define a
      budget range but do not require a working budget.
      */

    workingBudget: {
      type: Number,
      min: [0, "Working budget cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Working budget must be an integer number of paise",
      },
    },

    /*
      -------------------------------------------------
      CURRENT CONSTRUCTION STAGE
      -------------------------------------------------

      This references ConstructionStage, which we will
      implement in the next stage of the backend.

      It is optional during initial house creation.
      */

    currentStageId: {
      type: Schema.Types.ObjectId,
      ref: "ConstructionStage",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/*
=====================================================
SCHEMA VALIDATION
=====================================================

Ensure:

budgetMin <= budgetMax
workingBudget >= budgetMin when provided
workingBudget <= budgetMax when provided
=====================================================
*/

houseConfigurationSchema.pre("validate", function () {
  if (this.budgetMin > this.budgetMax) {
    this.invalidate(
      "budgetMin",
      "Minimum budget cannot be greater than maximum budget",
    );
  }

  if (this.workingBudget !== undefined && this.workingBudget !== null) {
    if (this.workingBudget < this.budgetMin) {
      this.invalidate(
        "workingBudget",
        "Working budget cannot be less than minimum budget",
      );
    }

    if (this.workingBudget > this.budgetMax) {
      this.invalidate(
        "workingBudget",
        "Working budget cannot be greater than maximum budget",
      );
    }
  }
});

/*
=====================================================
INDEXES
=====================================================
*/

houseConfigurationSchema.index(
  { singletonKey: 1 },
  {
    unique: true,
    name: "house_configuration_singleton_key_unique_idx",
  },
);

/*
=====================================================
MODEL
=====================================================
*/

export const HouseConfiguration = model<IHouseConfiguration>(
  "HouseConfiguration",
  houseConfigurationSchema,
);
