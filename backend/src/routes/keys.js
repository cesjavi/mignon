import { Router } from "express";
import { store } from "../services/store.js";

export const keysRouter = Router();

// GET /api/v1/keys - list workspace API keys
keysRouter.get("/", (req, res) => {
  const keys = store.listApiKeys();
  res.json({ status: "success", data: keys });
});

// POST /api/v1/keys - generate a new API key
keysRouter.post("/", (req, res) => {
  const { name = "Developer Key", dailyQuota = 500 } = req.body || {};
  const created = store.createApiKey(name, dailyQuota);
  res.status(201).json({
    status: "success",
    message: "API Key created successfully. Copy the secret key now, it will not be displayed again.",
    data: created
  });
});

// PUT /api/v1/keys/:id - update API key name or daily quota
keysRouter.put("/:id", (req, res) => {
  const updated = store.updateApiKey(req.params.id, req.body || {});
  if (!updated) {
    return res.status(404).json({ error: "Key not found", code: "KEY_NOT_FOUND" });
  }
  res.json({ status: "success", data: updated });
});

// DELETE /api/v1/keys/:id - revoke an API key
keysRouter.delete("/:id", (req, res) => {
  const revoked = store.revokeApiKey(req.params.id);
  if (!revoked) {
    return res.status(404).json({ error: "Key not found", code: "KEY_NOT_FOUND" });
  }
  res.json({ status: "success", message: "API Key has been revoked." });
});
