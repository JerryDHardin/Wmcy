// routes/model.js
import { Router } from "express";
import { warm, stop } from "../services/ollamaService.js"; // real model server calls
import { listModels } from "../services/ollamaService.js";

const r = Router();

/**
 * POST /model/load
 * { "name":"mistral:7b", "sizeMB":4600, "pinned":false }
 */
r.post("/load", async (req, res) => {
  try {
    const { name, sizeMB = 0, pinned = false } = req.body || {};
    if (!name) return res.status(400).json({ error: "name required" });

    // track it in registry (LRU will evict non‑pinned if MAX_VRAM_MB is set)
    registry.add(name, { sizeMB: Number(sizeMB) || 0, pinned });

    // warm the model so first real generate is fast
    await warm({ model: name });

    res.json({ ok: true, loaded: name, registry: registry.list() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /model/unload
 * { "name":"mistral:7b" }
 */
r.post("/unload", async (req, res) => {
  try {
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ error: "name required" });

    registry.remove(name);
    try { await stop({ model: name }); } catch { /* best-effort */ }

    res.json({ ok: true, unloaded: name, registry: registry.list() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /model
 */
r.get("/", (_req, res) => {
  res.json({ models: registry.list() });
});

r.get("/available", async (_req, res) => {
  try { res.json({ models: await listModels() }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

export default r;
