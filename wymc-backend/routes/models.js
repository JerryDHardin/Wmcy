// routes/models.js
import { Router } from "express";
import fs from "fs/promises";
import path from "path";

const r = Router();

r.get("/", async (_req, res) => {
  try {
    // Adjust this path if your modelRegistry.json is elsewhere
    const registryPath = path.resolve(process.cwd(), "modelRegistry.json");
    const file = await fs.readFile(registryPath, "utf-8");
    const data = JSON.parse(file);
    res.json({ models: data.models || [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to load model registry", details: err.message });
  }
});

export default r;
