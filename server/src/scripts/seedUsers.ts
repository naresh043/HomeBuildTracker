import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import { User } from "../models/User";
import { env } from "../config/env";

const users = [
  {
    name: process.env.SEED_USER_1_NAME,
    email: process.env.SEED_USER_1_EMAIL,
    password: process.env.SEED_USER_1_PASSWORD,
  },
  {
    name: process.env.SEED_USER_2_NAME,
    email: process.env.SEED_USER_2_EMAIL,
    password: process.env.SEED_USER_2_PASSWORD,
  },
];

const seedUsers = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI);

    console.log("✅ MongoDB connected");

    for (const userData of users) {
      if (
        !userData.name ||
        !userData.email ||
        !userData.password
      ) {
        throw new Error(
          "Missing seed user environment variables",
        );
      }

      const email = userData.email
        .trim()
        .toLowerCase();

      const existingUser = await User.findOne({
        email,
      });

      if (existingUser) {
        console.log(
          `⚠️ User already exists: ${email}`,
        );

        continue;
      }

      const passwordHash = await bcrypt.hash(
        userData.password,
        12,
      );

      await User.create({
        name: userData.name.trim(),
        email,
        passwordHash,
        isActive: true,
      });

      console.log(
        `✅ Created user: ${email}`,
      );
    }

    console.log("🎉 User seeding completed");
  } catch (error) {
    console.error(
      "❌ User seeding failed:",
      error,
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

void seedUsers();