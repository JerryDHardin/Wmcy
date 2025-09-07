import { Router } from "express";
import { estimateTokens, pickEngine, generateWithEngine } from "../services/routerService.js";
import { queueMiddleware } from "../middleware/queue.js";
import { generateStream } from "../services/ollamaService.js";

const r = Router();

// POST /route { mode, prompt, options? }
r.post("/", queueMiddleware(async (req, res) => {
  const { mode = "General", prompt = "", options = {} } = req.body || {};
  if (!prompt.trim()) return res.status(400).json({ error: "prompt required" });

  const engine = pickEngine(mode);
  const estTokens = estimateTokens(prompt);

  try {
    const { text } = await generateWithEngine(engine, prompt, options);
    res.json({ engine, estTokens, text });
  } catch (e) {
    res.status(500).json({ engine, estTokens, error: e.message });
  }
}));

r.post("/stream", async (req, res) => {
  const { mode = "General", prompt = "", options = {} } = req.body || {};
  if (!prompt.trim()) return res.status(400).json({ error: "prompt required" });

  const engine = pickEngine(mode);

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // helpers
  const send = (event, data) => res.write(`${event ? `event: ${event}\n` : ""}data: ${data}\n\n`);

  try {
    // tell client which engine we resolved to (optional)
    send("meta", JSON.stringify({ engine }));

    await generateStream(
      { model: engine, prompt, options },
      (chunk) => send("", chunk) // default event is "message"; client reads lines after "data:"
    );

    send("done", "{}");
    res.end();
  } catch (e) {
    send("error", JSON.stringify({ message: e.message, code: e.code || "stream_error" }));
    res.end();
  }
});

export default r;
