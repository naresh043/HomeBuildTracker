import { Document, Schema, model } from "mongoose";

import {
  CONSTRUCTION_STAGE_STATUS,
  type ConstructionStageStatus,
} from "../constants/construction";

/*
=====================================================
CONSTRUCTION STAGE DOCUMENT
=====================================================
*/

export interface IConstructionStage extends Document {
  name: string;

  description?: string;

  status: ConstructionStageStatus;

  order: number;

  startDate?: Date;

  completionDate?: Date;

  notes?: string;

  isDeleted: boolean;

  createdAt: Date;

  updatedAt: Date;
}

/*
=====================================================
CONSTRUCTION STAGE SCHEMA
=====================================================
*/

const constructionStageSchema = new Schema<IConstructionStage>(
  {
    /*
      -------------------------------------------------
      STAGE NAME
      -------------------------------------------------
      */

    name: {
      type: String,
      required: [true, "Construction stage name is required"],
      trim: true,
      minlength: [2, "Construction stage name must be at least 2 characters"],
      maxlength: [150, "Construction stage name cannot exceed 150 characters"],
    },

    /*
      -------------------------------------------------
      DESCRIPTION
      -------------------------------------------------
      */

    description: {
      type: String,
      trim: true,
      maxlength: [
        500,
        "Construction stage description cannot exceed 500 characters",
      ],
    },

    /*
      -------------------------------------------------
      STATUS
      -------------------------------------------------
      */

    status: {
      type: String,
      required: [true, "Construction stage status is required"],
      enum: {
        values: Object.values(CONSTRUCTION_STAGE_STATUS),
        message: "Invalid construction stage status",
      },
      default: CONSTRUCTION_STAGE_STATUS.NOT_STARTED,
      index: true,
    },

    /*
      -------------------------------------------------
      ORDER
      -------------------------------------------------

      Determines the display/order of construction stages.

      Example:

      1 -> Site Preparation
      2 -> Foundation
      3 -> Ground Floor Structure
      */

    order: {
      type: Number,
      required: [true, "Construction stage order is required"],
      min: [1, "Construction stage order must be at least 1"],
      validate: {
        validator: Number.isInteger,
        message: "Construction stage order must be an integer",
      },
      index: true,
    },

    /*
      -------------------------------------------------
      START DATE
      -------------------------------------------------
      */

    startDate: {
      type: Date,
    },

    /*
      -------------------------------------------------
      COMPLETION DATE
      -------------------------------------------------
      */

    completionDate: {
      type: Date,
    },

    /*
      -------------------------------------------------
      NOTES
      -------------------------------------------------
      */

    notes: {
      type: String,
      trim: true,
      maxlength: [
        2000,
        "Construction stage notes cannot exceed 2000 characters",
      ],
    },

    /*
      -------------------------------------------------
      SOFT DELETE
      -------------------------------------------------

      We never physically delete construction records.

      Deleted stages remain in the database for audit/history
      purposes and are excluded from normal queries.
      */

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/*
=====================================================
DATE VALIDATION
=====================================================

A completion date cannot be earlier than the start date.
=====================================================
*/

constructionStageSchema.pre("validate", function () {
  if (
    this.startDate &&
    this.completionDate &&
    this.completionDate < this.startDate
  ) {
    this.invalidate(
      "completionDate",
      "Completion date cannot be earlier than start date",
    );
  }
});

/*
=====================================================
INDEXES
=====================================================
*/

/*
Normal stage listing:

- ignore deleted records
- sort by order
*/

constructionStageSchema.index(
  {
    isDeleted: 1,
    order: 1,
  },
  {
    name: "construction_stages_active_order_idx",
  },
);

/*
Useful for filtering stages by status.
*/

constructionStageSchema.index(
  {
    isDeleted: 1,
    status: 1,
  },
  {
    name: "construction_stages_active_status_idx",
  },
);

/*
=====================================================
MODEL
=====================================================
*/

export const ConstructionStage = model<IConstructionStage>(
  "ConstructionStage",
  constructionStageSchema,
);
