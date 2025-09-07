// routes/gpu.js
import { Router } from "express";
import { readVram } from "../services/gpuService.js";

const r = Router();

r.get("/stats", async (_req, res) => {
  try {
    const stats = await readVram();
    res.json(stats);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default r;
