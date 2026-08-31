import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { appsRouter } from "./routes/apps.js";
import { keysRouter } from "./routes/keys.js";
import { analyticsRouter } from "./routes/analytics.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS for web widgets and external API clients
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.use(express.json());

// Serve static widget bundle if requested
app.use(express.static(path.join(__dirname, "../../widget/dist")));
app.use("/public", express.static(path.join(__dirname, "../../widget/public")));

// API Routes
app.use("/api/v1/apps", appsRouter);
app.use("/api/v1/keys", keysRouter);
app.use("/api/v1/analytics", analyticsRouter);

// Health Check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "Mignon Agent Engine",
    version: "1.0.0",
    engine: "Gemini 2.5 Flash / 3.5 Flash",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Mignon Agent Engine Backend running on http://localhost:${PORT}`);
  console.log(`📡 API Endpoints: http://localhost:${PORT}/api/v1/apps`);
});
