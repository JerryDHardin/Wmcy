// server.js
import gpuRoutes from "./routes/gpu.js";
import modelRoutes from "./routes/model.js";
import routeRoutes from "./routes/route.js";
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import getFileRoute from './routes/getFile.js';
import writeLogRoute from './routes/writeLog.js';
import listFiles from './routes/listFiles.js';
import mistralRoute from './routes/mistral.js';
import getWmcyData from './routes/getWmcyData.js';
import modelsRoute from "./routes/models.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use("/gpu", gpuRoutes);
app.use("/model", modelRoutes);
app.use("/route", routeRoutes);
app.use('/api/listFiles', listFiles);
app.use('/api/mistral', mistralRoute);
app.use('/api/getWmcyData', getWmcyData);
app.use('/api/read-obsidian', getFileRoute);
app.use('/api/log-wmcy', writeLogRoute);
app.use('/api/models', modelsRoute);
app.get('/api/wymc/cortex', async (req, res) => {
  const baseDir = path.join(__dirname, '../obsidian-vault/Wimzy_Core');
  const subdirs = ['whispers', 'logs', 'memory_snapshots'];
  const cortex = {};

  try {
    for (const dir of subdirs) {
      const fullPath = path.join(baseDir, dir);
      try {
        const files = await fs.readdir(fullPath);
        cortex[dir] = files;
      } catch {
        cortex[dir] = null;
      }
    }

    res.json(cortex);
  } catch (err) {
    res.status(500).json({ error: 'Cortex scan failed', details: err.message });
  }
});

app.get("/__health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.get('/api/wymc/whispers/:filename', async (req, res) => {
  const { filename } = req.params;
  const allowedFiles = ['known_contexts.md', 'prompt_templates.md', 'system_goals.md', 'user_logs_index.md'];

  if (!allowedFiles.includes(filename)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const filePath = path.join(__dirname, 'obsidian-vault/Wimzy_Core/whispers', filename);

  try {
    const data = await fs.readFile(filePath, 'utf-8');
    res.json({ content: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read file', details: err.message });
  }
});

app.post('/api/wymc', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral",
        prompt: `You are WymC, an assistant AI\nUser: ${prompt}\nWymC:`,
        stream: false
      })
    });

    const data = await response.json();
    const reply = data.response.trim();
    res.json({ reply });
  } catch (err) {
    console.error("WymC backend error:", err);
    res.status(500).json({ reply: "Great. Another failure. Just what I needed." });
  }
});

app.listen(port, () => {
  console.log(`WymC backend is brooding at http://localhost:${port}`);
});
