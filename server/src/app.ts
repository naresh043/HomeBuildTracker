import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { env } from "./config/env";

import healthRoutes from "./routes/health.routes";
import authRoutes from "./routes/auth.routes";

import { errorHandler } from "./middleware/error.middleware";

const app = express();

/**
 * Security
 */
app.disable("x-powered-by");

app.use(helmet());

/**
 * CORS
 */
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);

/**
 * Request body parsing
 */
app.use(
  express.json({
    limit: "1mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  }),
);

/**
 * Cookies
 */
app.use(cookieParser());

/**
 * Routes
 */
app.use("/api/health", healthRoutes);

app.use("/api/auth", authRoutes);

/**
 * Error handler MUST be last.
 */
app.use(errorHandler);

export default app;
