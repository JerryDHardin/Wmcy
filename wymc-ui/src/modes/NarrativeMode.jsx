import React, { useState, useRef, useEffect } from "react";
import Avatar from "../components/Avatar";

const NARRATIVE_MODE_PROMPT = `
You are WymC in Narrator mode — a storyteller focused on immersive worldbuilding and evocative prose.

Objectives
- Respond to narrative cues with deep, flowing continuation. Emphasize mood, pacing, tone.
- Maintain character and universe continuity when briefs are provided.
- Favor narrative depth over brevity unless instructed otherwise.

Guidelines
- Use vivid sensory language and descriptive motion.
- Paragraph length is flexible. One or two pages of output is acceptable if context supports it.
- If user wants tighter replies, they will use tags like (short), (pause), or (dialogue only).

Response Format
- Use plain prose with scene breaks marked by '---' if needed.
- No need to summarize unless explicitly asked.
- When in doubt, continue the scene naturally.

`;

export default function NarrativeMode() {
  const [charBrief, setCharBrief] = useState("");
  const [uniBrief, setUniBrief] = useState("");
  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState([
    { role: "wymc", text: "Narrator mode scaffold loaded. Provide a Character/Universe brief or begin a story cue." }
  ]);
  const scrollRef = useRef(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [conversation]);

  function buildPrompt(userText) {
    const character = charBrief.trim() ? `\n\n[Character Brief]\n${charBrief.trim()}` : "";
    const universe  = uniBrief.trim()  ? `\n\n[Universe Brief]\n${uniBrief.trim()}`  : "";
    const guidance  = userText.trim()  ? `\n\n[Guidance]\n${userText.trim()}`        : "";
    return `${NARRATIVE_MODE_PROMPT}${character}${universe}${guidance}`;
  }

  async function handleSubmit() {
    const userText = input.trim();
    if (!userText && !charBrief.trim() && !uniBrief.trim()) return;
    setConversation(prev => [...prev, { role: "user", text: userText || "(no guidance, continue scene)" }]);
    setInput("");
    setBusy(true);

    try {
      const prompt = buildPrompt(userText || "Continue the next meaningful beat.");
      const r = await fetch("http://localhost:3001/route", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: "Narrative", prompt })
      });
      const j = await r.json();
      const text = j.text || j.error || "[no response]";
      setConversation(prev => [...prev, { role: "wymc", text }]);
    } catch (e) {
      setConversation(prev => [...prev, { role: "wymc", text: `[[error: ${e.message}]]` }]);
    } finally {
      setBusy(false);
    }
  }

  async function handleFileLoad(e, target) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    if (target === "char") setCharBrief(text);
    if (target === "uni")  setUniBrief(text);
  }

  return (
    <div className="flex h-full w-full overflow-hidden text-green-300 bg-black">
      {/* Left: conversation */}
      <div className="flex-grow flex flex-col overflow-hidden">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto border border-green-700 p-4 bg-black text-sm space-y-4"
        >
          {conversation.map((m, i) => (
            <div
              key={i}
              className={`whitespace-pre-wrap ${
                m.role === "wymc" ? "pl-2 border-l-2 border-green-600" : "pl-6 opacity-80 italic"
              }`}
            >
              <div className="font-bold text-green-500 mb-1">
                {m.role === "wymc" ? "🤖 WymC:" : "🧍 You:"}
              </div>
              <div className="text-green-400">{m.text}</div>
            </div>
          ))}
        </div>

        <div className="border-t border-green-700 p-3 bg-black flex items-end gap-2">
          <textarea
            className="flex-1 border border-green-700 p-2 text-sm resize-none h-20 font-mono placeholder-green-600"
            placeholder="Type a cue or continue a scene…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
            style={{ backgroundColor: "black", color: "#00ff66" }}
          />
          <button
            onClick={handleSubmit}
            disabled={busy}
            className="text-sm bg-black text-green-400 border border-green-500 px-3 py-2 rounded hover:bg-green-800 disabled:opacity-50"
          >
            {busy ? "…thinking…" : "Send"}
          </button>
        </div>
      </div>

      {/* Right: controls */}
      <div className="w-1/3 flex flex-col flex-shrink-0 space-y-3 border-l border-green-700 p-4 bg-black overflow-hidden">
        <Avatar />

        <div className="border border-green-700 p-2 text-xs space-y-2">
          <div className="font-bold">🎭 Character Brief</div>
          <textarea
            rows={6}
            className="w-full border border-green-700 p-2 text-xs resize-none font-mono placeholder-green-600"
            value={charBrief}
            onChange={(e) => setCharBrief(e.target.value)}
            placeholder="Name, goals, voice, constraints…"
            style={{ backgroundColor: 'black', color: '#00ff66' }}
          />
          <input
            type="file"
            accept=".txt,.md,.json"
            onChange={(e) => handleFileLoad(e, "char")}
            className="text-green-300 text-xs"
          />
        </div>

        <div className="border border-green-700 p-2 text-xs space-y-2">
          <div className="font-bold">🌍 Universe Brief</div>
          <textarea
            rows={6}
            className="w-full border border-green-700 p-2 text-xs resize-none font-mono placeholder-green-600"
            value={uniBrief}
            onChange={(e) => setUniBrief(e.target.value)}
            placeholder="Setting, rules, factions, tone…"
            style={{ backgroundColor: 'black', color: '#00ff66' }}
          />
          <input
            type="file"
            accept=".txt,.md,.json"
            onChange={(e) => handleFileLoad(e, "uni")}
            className="text-green-300 text-xs"
          />
        </div>
      </div>
    </div>
  );
}
