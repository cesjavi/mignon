import { Router } from "express";
import { store } from "../services/store.js";

export const analyticsRouter = Router();

// GET /api/v1/analytics - get system telemetry & execution metrics
analyticsRouter.get("/", (req, res) => {
  const stats = store.getAnalytics();
  res.json({ status: "success", data: stats });
});
