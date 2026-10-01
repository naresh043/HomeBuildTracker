// src/models/Counter.ts

import { Document, Schema, model } from "mongoose";

export interface ICounter extends Document {
  key: string;
  sequence: number;
  createdAt: Date;
  updatedAt: Date;
}

const counterSchema = new Schema<ICounter>(
  {
    key: {
      type: String,
      required: [true, "Counter key is required"],
      unique: true,
      trim: true,
      index: true,
    },

    sequence: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Counter sequence cannot be negative"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Counter = model<ICounter>("Counter", counterSchema);
