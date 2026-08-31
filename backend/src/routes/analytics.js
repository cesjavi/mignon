import { Router } from "express";
import { store } from "../services/store.js";

export const analyticsRouter = Router();

// GET /api/v1/analytics - get system telemetry & execution metrics
analyticsRouter.get("/", (req, res) => {
  const stats = store.getAnalytics();
  res.json({ status: "success", data: stats });
});

// POST /api/v1/analytics/simulate - generate synthetic test traffic
analyticsRouter.post("/simulate", (req, res) => {
  const count = Number(req.body?.count) || 5;
  const generated = store.simulateTraffic(Math.min(Math.max(count, 1), 50));
  const updatedStats = store.getAnalytics();
  res.json({
    status: "success",
    message: `Generated ${generated.length} simulated execution logs`,
    data: updatedStats
  });
});

// POST /api/v1/analytics/clear - clear telemetry logs
analyticsRouter.post("/clear", (req, res) => {
  store.clearLogs();
  const updatedStats = store.getAnalytics();
  res.json({
    status: "success",
    message: "Telemetry logs cleared successfully",
    data: updatedStats
  });
});
