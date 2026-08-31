import { Router } from "express";
import { store } from "../services/store.js";
import { runAgentWithTools } from "../services/gemini.js";

export const appsRouter = Router();

// GET /api/v1/apps - list all mini-apps
appsRouter.get("/", (req, res) => {
  const apps = store.getAllApps();
  res.json({ status: "success", count: apps.length, data: apps });
});

// GET /api/v1/apps/:id - get mini-app details & metadata
appsRouter.get("/:id", (req, res) => {
  const app = store.getAppById(req.params.id);
  if (!app) {
    return res.status(404).json({ error: "Mini-App not found", code: "APP_NOT_FOUND" });
  }
  res.json({ status: "success", data: app });
});

// POST /api/v1/apps - create a new mini-app
appsRouter.post("/", (req, res) => {
  const { name, description, category, systemPrompt, tools, inputs, theme, sampleQuery } = req.body;
  if (!name) {
    return res.status(400).json({ error: "App name is required", code: "MISSING_NAME" });
  }

  const created = store.createApp({
    name,
    description,
    category,
    systemPrompt,
    tools,
    inputs,
    theme,
    sampleQuery
  });

  res.status(201).json({ status: "success", data: created });
});

// PUT /api/v1/apps/:id - update mini-app
appsRouter.put("/:id", (req, res) => {
  const updated = store.updateApp(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: "Mini-App not found", code: "APP_NOT_FOUND" });
  }
  res.json({ status: "success", data: updated });
});

// DELETE /api/v1/apps/:id - delete mini-app
appsRouter.delete("/:id", (req, res) => {
  const deleted = store.deleteApp(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: "Mini-App not found", code: "APP_NOT_FOUND" });
  }
  res.json({ status: "success", message: "Mini-App deleted successfully" });
});

// POST /api/v1/apps/:id/run - execute mini-app (either via Embed Widget or REST API with Bearer token)
appsRouter.post("/:id/run", async (req, res) => {
  const app = store.getAppById(req.params.id);
  if (!app) {
    return res.status(404).json({ error: "Mini-App not found", code: "APP_NOT_FOUND" });
  }

  // Check auth header if provided (API consumption)
  const authHeader = req.headers.authorization;
  let callerInfo = { type: "widget", id: "anonymous" };

  if (authHeader) {
    const authResult = store.validateApiKey(authHeader);
    if (!authResult) {
      return res.status(401).json({ error: "Invalid API Key", code: "UNAUTHORIZED" });
    }
    if (authResult.error === "REVOKED_API_KEY") {
      return res.status(401).json({ error: "This API Key has been revoked", code: "REVOKED_KEY" });
    }
    callerInfo = { type: "api", keyId: authResult.keyId, name: authResult.name };
  }

  const { query, inputs = {} } = req.body || {};

  try {
    const agentResult = await runAgentWithTools({
      app,
      userQuery: query || app.sampleQuery,
      inputValues: inputs
    });

    // Log telemetry
    store.logExecution({
      appId: app.id,
      appName: app.name,
      callerType: callerInfo.type,
      latencyMs: agentResult.latencyMs,
      tokensTotal: agentResult.tokensTotal,
      toolExecuted: agentResult.toolExecuted,
      status: "success",
      queryPreview: (query || JSON.stringify(inputs)).substring(0, 80)
    });

    res.json({
      status: "success",
      app_id: app.id,
      app_name: app.name,
      result: {
        markdown: agentResult.text,
        tool_executed: agentResult.toolExecuted,
        tool_data: agentResult.toolResults
      },
      metadata: {
        latency_ms: agentResult.latencyMs,
        tokens_used: agentResult.tokensTotal,
        model: agentResult.model,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    store.logExecution({
      appId: app.id,
      appName: app.name,
      callerType: callerInfo.type,
      latencyMs: 0,
      tokensTotal: 0,
      toolExecuted: null,
      status: "error",
      error: err.message
    });

    res.status(500).json({
      status: "error",
      error: err.message,
      code: "EXECUTION_FAILED"
    });
  }
});
