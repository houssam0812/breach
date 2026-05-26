import { Router } from "express";

const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "breach-backend",
    timestamp: new Date().toISOString(),
  });
});

export default healthRouter;
