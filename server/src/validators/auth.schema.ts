import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email("Invalid email address"),

    password: z
      .string()
      .min(6, "Password must contain at least 8 characters")
      .max(128, "Password is too long"),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;
