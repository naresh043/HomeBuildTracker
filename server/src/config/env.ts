import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  // =====================================================
  // APPLICATION
  // =====================================================

  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(5000),

  // =====================================================
  // DATABASE
  // =====================================================

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  // =====================================================
  // AUTHENTICATION
  // =====================================================

  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),

  JWT_EXPIRES_IN: z.string().default("30d"),

  // =====================================================
  // CLIENT
  // =====================================================

  CLIENT_URL: z.string().url("CLIENT_URL must be a valid URL"),

  // =====================================================
  // COOKIE
  // =====================================================

  COOKIE_DOMAIN: z.string().optional(),

  // =====================================================
  // CLOUDINARY
  // =====================================================

  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),

  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),

  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("❌ Invalid environment variables:");
  console.error(result.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = result.data;
