import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import healthRouter from "./features/health/health.router.js";

export function buildApp() {
  const app = express();

  app.use(
    cors({
      origin: [env.frontendWebUrl],
      credentials: true,
    }),
  );
  app.use(express.json());

  app.use("/api", healthRouter);

  return app;
}
