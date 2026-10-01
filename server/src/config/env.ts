// import dotenv from "dotenv";

// dotenv.config();

// export const env = {
//   PORT: process.env.PORT || 5000,
//   NODE_ENV: process.env.NODE_ENV || "development",
//   MONGODB_URI: process.env.MONGODB_URI!,
//   JWT_SECRET: process.env.JWT_SECRET!,
// };

// import "dotenv/config";
// import { z } from "zod";

// const envSchema = z.object({
//   NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

//   PORT: z.coerce.number().int().positive().default(5000),

//   MONGO_URI: z.string().min(1),

//   JWT_SECRET: z.string().min(32),

//   JWT_EXPIRES_IN: z.string().default("30d"),

//   CLIENT_URL: z.string().url(),

//   COOKIE_DOMAIN: z.string().optional(),

//   CLOUDINARY_CLOUD_NAME: z.string().optional(),
//   CLOUDINARY_API_KEY: z.string().optional(),
//   CLOUDINARY_API_SECRET: z.string().optional(),
// });

// const parsed = envSchema.safeParse(process.env);

// if (!parsed.success) {
//   console.error("❌ Invalid environment variables:");
//   console.error(parsed.error.flatten().fieldErrors);
//   process.exit(1);
// }

// export const env = parsed.data;

import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(5000),

  MONGODB_URI: z.string().min(1, "MONGO_URI is required"),

  JWT_SECRET: z.string(),

  JWT_EXPIRES_IN: z.string().default("30d"),

  CLIENT_URL: z.string().url("CLIENT_URL must be a valid URL"),

  COOKIE_DOMAIN: z.string().optional(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("❌ Invalid environment variables:");

  console.error(result.error.flatten().fieldErrors);

  process.exit(1);
}

export const env = result.data;
