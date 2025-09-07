# Wmcy: Local LLM Companion

Wmcy (`wym-see`) is a fast, modular AI assistant built for local use — think DevTools meets digital muse. It runs a custom React frontend with Node.js backend, connecting to local models via Ollama, KoboldCpp, or other backends. Designed for experimentation, journaling, prompt engineering, and character emulation.

This monorepo includes:
- `wymc-ui`: React frontend with Tailwind and dynamic mode switching (General, Debug, Narrative, X-Mode)
- `wymc-backend`: Node/Express API to manage VRAM, local models, and GPU info

### ✨ Core Features

- 🔁 **Hot-swap models** via UI (Mistral, Dolphin, KoboldCpp, etc)
- 📊 **VRAM Monitor** and backend GPU stats
- 🧠 **Prompt pipelines** (persistent, temporary, X-mode)
- 🖼️ **Avatar engine** with swappable expressions and states
- 🧪 **Debug Mode** with token analysis, system self-checks, and dev overrides
- 🗂️ Reads from Obsidian vaults (planned)

### 📌 Upcoming Features

- Multi-agent dialogue panel for character chats  
- “Showcase Mode” for public demos with auto-sandboxing  
- In-browser command history (`↑` to recall prompt)  
- LLM Confidence Indicator and Self-Repair Diagnostics  
- Universe/Character `.json` import for Narrator/X-mode  

### 🚀 Quickstart

```bash
# Backend
cd wymc-backend
npm install
npm run dev

# Frontend
cd ../wymc-ui
npm install
npm run dev
