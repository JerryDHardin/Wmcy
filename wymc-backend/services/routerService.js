import { generate as ollamaGenerate, listModels } from "./ollamaService.js";

// Defaults (overridable via env)
const DEFAULTS = {
  General:   "mistral",
  Debug:     "mistral",
  Narrative: "llama3.1:8b",
  X:         "mistral",
};

const ENV = {
  General:   process.env.WM_ENGINE_GENERAL,
  Debug:     process.env.WM_ENGINE_DEBUG,
  Narrative: process.env.WM_ENGINE_NARRATIVE,
  X:         process.env.WM_ENGINE_X,
};

export function estimateTokens(text = "") {
  return Math.ceil(text.length / 4);
}

export function pickEngine(mode = "General") {
  return ENV[mode] || DEFAULTS[mode] || DEFAULTS.General;
}

// Map common aliases to typical Ollama tags
const ALIASES = {
  "mistral:7b": "mistral",
  "llama3.1": "llama3.1:8b",
  "llama3.1-8b": "llama3.1:8b",
};

async function resolveEngineName(requested) {
  const names = await listModels();             // e.g. ["mistral","llama3.1:8b", ...]
  if (names.includes(requested)) return requested;

  // Alias exact match
  const alias = ALIASES[requested];
  if (alias && names.includes(alias)) return alias;

  // Try base name (strip tag): "mistral:7b" -> "mistral"
  const base = requested.split(":")[0];
  const byBase = names.find(n => n === base || n.startsWith(base));
  if (byBase) return byBase;

  // Fallback: first available model (last resort)
  return names[0] || requested;
}

export async function generateWithEngine(engine, prompt, opts = {}) {
  const resolved = await resolveEngineName(engine || DEFAULTS.General);
  const response = await ollamaGenerate({ model: resolved, prompt, options: opts });
  return { engine: resolved, text: response };
}
