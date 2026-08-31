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

// Serve static widget bundle and demo assets
app.use(express.static(path.join(__dirname, "../../widget/dist")));
app.use("/widget.js", express.static(path.join(__dirname, "../../widget/dist/widget.js")));
app.use("/demo.html", express.static(path.join(__dirname, "../../frontend/public/demo.html")));
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

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

// SPA catch-all fallback for frontend routes (e.g. /apps/new, /embed, /keys)
app.get("*", (req, res) => {
  const indexPath = path.join(__dirname, "../../frontend/dist/index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(`Mignon Engine API Active. Access /api/v1/apps or run frontend locally.`);
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Mignon Agent Engine Backend running on http://localhost:${PORT}`);
  console.log(`📡 API Endpoints: http://localhost:${PORT}/api/v1/apps`);
});
