// src/models/Material.ts

import { Document, Schema, model } from "mongoose";
import { MATERIAL_UNIT, type MaterialUnit } from "../constants/material";

export interface IMaterial extends Document {
  name: string;
  normalizedName: string;
  category: string;
  defaultUnit: MaterialUnit;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const materialSchema = new Schema<IMaterial>(
  {
    name: {
      type: String,
      required: [true, "Material name is required"],
      trim: true,
      minlength: [2, "Material name must be at least 2 characters"],
      maxlength: [150, "Material name cannot exceed 150 characters"],
    },

    normalizedName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    category: {
      type: String,
      required: [true, "Material category is required"],
      trim: true,
      maxlength: [100, "Material category cannot exceed 100 characters"],
    },

    defaultUnit: {
      type: String,
      required: [true, "Default unit is required"],
      enum: {
        values: Object.values(MATERIAL_UNIT),
        message: "Invalid material unit",
      },
    },

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

/**
 * Normalize material name before validation.
 *
 * Examples:
 * "  Cement  "       -> "cement"
 * "TMT   Steel"      -> "tmt steel"
 * "Roof Tiles"       -> "roof tiles"
 */
materialSchema.pre("validate", function ( ) {
  if (this.name) {
    this.normalizedName = this.name.trim().replace(/\s+/g, " ").toLowerCase();
  }
});

/**
 * Prevent duplicate active material names.
 *
 * Soft-deleted materials are excluded from this uniqueness rule.
 */
materialSchema.index(
  { normalizedName: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  },
);

/**
 * Useful for category-based material queries.
 */
materialSchema.index({
  category: 1,
  isDeleted: 1,
});

/**
 * Useful for recently-created material queries.
 */
materialSchema.index({
  createdAt: -1,
  isDeleted: 1,
});

export const Material = model<IMaterial>("Material", materialSchema);
