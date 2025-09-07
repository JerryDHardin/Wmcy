// Minimal Ollama HTTP client (Node 18+)
// Env:
//   OLLAMA_URL (default: http://localhost:11434)

const BASE = process.env.OLLLAMA_URL || process.env.OLLAMA_URL || "http://localhost:11434";

export async function generate({ model, prompt, options = {} }) {
  const base = process.env.OLLAMA_URL || "http://localhost:11434";
  const r = await fetch(`${base}/api/generate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: false, ...options }),
  });
  if (!r.ok) {
    const body = await r.text();
    const err = new Error(`ollama_error ${r.status}`);
    try { err.details = JSON.parse(body); } catch { err.details = body; }
    if (r.status === 404) err.code = "model_not_found";
    throw err;
  }
  const j = await r.json();
  return j.response ?? "";
}


export async function warm({ model, prompt = "hi", options = {} }) {
  // cheap warm call
  return generate({ model, prompt, options: { ...options, num_predict: 8 } });
}

// List models that Ollama currently has
export async function listModels() {
  const base = process.env.OLLAMA_URL || "http://localhost:11434";
  const r = await fetch(`${base}/api/tags`, { method: "GET" });
  if (!r.ok) throw new Error(`Ollama tags failed: ${r.status} ${await r.text()}`);
  const j = await r.json();
  // j.models = [{ name: "mistral", ... }, ...]
  return (j.models || []).map(m => m.name);
}

export async function hasModel(name) {
  const names = await listModels();
  return names.includes(name);
}

export async function stop({ model }) {
  // Equivalent to `ollama stop -m <model>` via HTTP is not available;
  // We can hit `/api/generate` with an impossible prompt to force unload later,
  // or shell out. Shelling out below (works if `ollama` is on PATH).
  const { exec } = await import("node:child_process");
  return new Promise((resolve, reject) => {
    exec(`ollama stop -m ${model}`, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr || err.message));
      resolve(stdout?.trim() || "stopped");
    });
  });
}

// --- append to services/ollamaService.js ---
export async function generateStream({ model, prompt, options = {} }, onChunk) {
  const base = process.env.OLLAMA_URL || "http://localhost:11434";
  const r = await fetch(`${base}/api/generate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: true, ...options }),
  });
  if (!r.ok) {
    const body = await r.text();
    const err = new Error(`ollama_error ${r.status}`);
    try { err.details = JSON.parse(body); } catch { err.details = body; }
    throw err;
  }

  const reader = r.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const s = line.trim();
      if (!s) continue;
      // Each line is JSON: { "model": "...", "response": "...", "done": bool, ... }
      let j;
      try { j = JSON.parse(s); } catch { continue; }
      if (j.response) await onChunk(j.response);
      if (j.done) return;
    }
  }
}
