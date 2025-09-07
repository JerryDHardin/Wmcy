# Wmcy

Wmcy is a personal AI assistant project.  
The repo is organized into two parts:

- **wmcy-ui** – React frontend interface (chat, controls, avatars)
- **wmcy-backend** – Node/Express backend (LLM routing, memory, file access)

---

## Getting Started

### Frontend

```bash
cd wmcy-ui
npm install
npm run dev


Frontend will start on http://localhost:5173 (default Vite port).
### Backend

cd wmcy-backend
npm install
npm run dev
Backend runs on http://localhost:3000 by default.


Project Structure
Wmcy/
  wmcy-ui/        # React (Vite) frontend
  wmcy-backend/   # Express backend API

Roadmap

 Core chat flow working

 Avatar component (UI polish)

 File access (Obsidian vault integration)

 Model swap support

 Debug / diagnostics panel

 Notes

This is an early-stage, evolving project. Expect changes as architecture stabilizes.