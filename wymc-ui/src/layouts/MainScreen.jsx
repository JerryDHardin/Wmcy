// File: MainScreen.jsx (partial update to handle Mistral reply parsing)

import React, { useState, useEffect } from 'react';
import GeneralMode from '../modes/GeneralMode';
import DebugMode from '../modes/DebugMode';
import NarrativeMode from '../modes/NarrativeMode';
import XMode from '../modes/XMode';
import '../styles/modeTransitions.css';
import sendPrompt from "../utils/sendPrompt";
import parseMistralReply from "../utils/parseMistralReply";
import VramMonitor from '../components/VramMonitor';
import { streamRoute, getVram } from '../utils/api';
import ModelSelector from '../components/ModelSelector';

const modeOrder = ['General', 'Debug', 'Narrative', 'X'];

export default function MainScreen({ scrollRef, conversation, setConversation }) {
  const [modeIndex, setModeIndex] = useState(0);
  const [userPrompt, setUserPrompt] = useState('');
  const [streaming, setStreaming] = useState(true); // ← flip on/off in UI
  const [persistentPrompt, setPersistentPrompt] = useState('');
  const [temporaryPrompt, setTemporaryPrompt] = useState('');
  const [logOutput, setLogOutput] = useState([]);
  const [currentFileInfo, setCurrentFileInfo] = useState(null);
  const [loggingActive, setLoggingActive] = useState(false);
  const [fileSummary, setFileSummary] = useState(null);
  const [fileSlice, setFileSlice] = useState(null);
  const [mood, setMood] = useState('neutral');
  const [statusText, setStatusText] = useState('standing by');
  const [currentAvatar, setCurrentAvatar] = useState('default.png');
  const [isThinking, setIsThinking] = useState(false);
  const [vramRefreshKey, setVramRefreshKey] = useState(0);
  const startsWithSpace = (s) => s.length && s[0] === " ";
  const endsWithSpace   = (s) => s.length && /\s$/.test(s);
  const [activeModelId, setActiveModelId] = useState("dolphin-nemo-12b-q5km");
  const [loadedModelId, setLoadedModelId] = useState("dolphin-nemo-12b-q5km"); // Model in VRAM
  const [loadingModel, setLoadingModel] = useState(false);
  const [availableAvatars, setAvailableAvatars] = useState([
    { file: 'smiling.png', description: 'cheerful expression' },
    { file: 'serious.png', description: 'neutral alert face' },
    { file: 'scared.png', description: 'wide eyes, recoiled' },
    { file: 'glitched.png', description: 'visual corruption, used for malfunctions' }
  ]);
  const [capabilities, setCapabilities] = useState(['/read', '/write', '/update']);

  async function handleModelSwitch(newModelId) {
  setLoadingModel(true);

  // 1. Unload previous, if it's different
  if (loadedModelId && loadedModelId !== newModelId) {
    try {
      await fetch("/api/model/unload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: loadedModelId })
      });
    } catch (err) {
      // Optionally: handle unload failure, but keep going
      console.warn("Failed to unload previous model", err);
    }
  }

  // 2. Load new model
  try {
    await fetch("/api/model/load", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newModelId })
    });
    setLoadedModelId(newModelId);
    setActiveModelId(newModelId);
  } catch (err) {
    alert("Failed to load new model: " + err.message);
  }

  setLoadingModel(false);
}


  useEffect(() => {
    const container = scrollRef.current;
    const messages = Array.from(container?.children || []);
    if (!container || messages.length < 1) return;

    const newestIndex = messages.length - 1;
    const newest = messages[newestIndex];
    const messageHeight = newest.offsetHeight;
    const containerHeight = container.clientHeight;

    requestAnimationFrame(() => {
      if (messageHeight <= containerHeight) {
        newest.scrollIntoView({ behavior: 'auto', block: 'end' });
      } else {
        const contextIndex = Math.max(0, newestIndex - 2);
        messages[contextIndex]?.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    });
  }, [conversation]);
  
  useEffect(() => {
    setLoadingModel(true);
      // Simulate loading delay or call backend to warm model
    setTimeout(() => setLoadingModel(false), 1200); // 1.2s spinner, adjust as needed
    // Optionally: ping backend /model/load for real model warming
    }, [activeModelId]);

  useEffect(() => {
    if (!currentFileInfo?.contents) {
      setFileSummary(null);
      setFileSlice(null);
      return;
    }

    const content = currentFileInfo.contents;
    const maxLength = 8000;

    if (content.length > maxLength) {
      const truncated = content.slice(0, maxLength);
      setFileSlice(truncated);
    } else {
      setFileSlice(null);
    }

    setFileSummary(null);
  }, [currentFileInfo]);

// --- streaming text normalizers ---
const endsWS = (s) => /\s$/.test(s) || s === "";

// Join-time cleanup for a new chunk
function smartJoin(acc, chunk) {
  if (endsWS(acc)) chunk = chunk.replace(/^\s+/, "");           // trim leading space
  chunk = chunk.replace(/\s+([.,!?;:])/g, "$1");                // no space before ,.!?:
  // fix "I ' m" / "don ' t" -> "I'm" / "don't"  (Unicode letters/digits)
  chunk = chunk.replace(/(\p{L}|\d)\s+'\s+(\p{L}|\d)/gu, "$1'$2");
  // handle split possessives: "users ' " -> "users'"
  chunk = chunk.replace(/(\p{L}|\d)\s+'(\s|$)/gu, "$1'$2");
  // tighten spaces just inside brackets/quotes: "( hello )" -> "(hello)"
  chunk = chunk.replace(/([(\[\{“‘])\s+/g, "$1").replace(/\s+([)\]}\)”’])/g, "$1");
  return chunk;
}

// Light final tidy when the stream ends (don’t touch code blocks)
function finalTidy(s) {
  if (/```/.test(s)) return s;
  return s
    .replace(/\s+([.,!?;:])/g, "$1")
    .replace(/(\p{L}|\d)\s+'\s+(\p{L}|\d)/gu, "$1'$2")
    .replace(/(\p{L}|\d)\s+'(\s|$)/gu, "$1'$2");
}

  
  const handleSubmitPrompt = async () => {
  const promptText = userPrompt.trim();
  if (!promptText) return;
  const isCommand = promptText.startsWith("/");

  const fullPrompt = fileSummary
    ? `[File Summary Context]\n${fileSummary}\n\n${promptText}`
    : fileSlice
      ? `[File Slice Preview]\n${fileSlice}\n\n${promptText}`
      : promptText;

  setUserPrompt('');
  setConversation((prev) => [...prev, { role: 'user', text: promptText }]);

  // STREAM for General mode only
  if (modeOrder[modeIndex] === 'General' && streaming) {
    setIsThinking(true);
let growingIndex;
setConversation(prev => {
  growingIndex = prev.length;
  return [...prev, { role: 'wymc', text: "" }];
});
  
    let gotFirst = false;
    let acc = "";

  await streamRoute({
  mode: 'General',
  prompt: fullPrompt,
  onMeta: (m) => console.log("engine:", m.engine),
  onToken: (t) => {
    const joined = smartJoin(acc, t);
    acc += joined;

    if (!gotFirst) { gotFirst = true; setIsThinking(false); } // stop spinner on first token (if you use it)

    setConversation(prev => {
      const copy = prev.slice();
      copy[growingIndex] = { ...copy[growingIndex], text: acc };
      return copy;
    });
  },

onDone: async () => {
  acc = finalTidy(acc);  // final pass for punctuation/apostrophes
  setConversation(prev => {
    const copy = prev.slice();
    copy[growingIndex] = { ...copy[growingIndex], text: acc };
    return copy;
  });

  setIsThinking(false);
  setVramRefreshKey(k => k + 1);
  setTimeout(() => setVramRefreshKey(k => k + 1), 7000);

  if (!isCommand && currentFileInfo && !fileSummary) {
    const summarizationPrompt =
      `Summarize this file in approximately 25% of its length:\n\n${fileSlice || currentFileInfo.contents}`;
    const { reply: summary } = await sendPrompt(summarizationPrompt);
    setFileSummary(summary);
  }
},

  onError: (e) => {
    setIsThinking(false);
    setConversation(prev => [...prev, { role: 'wymc', text: `[[stream error: ${e?.message || e}]]` }]);
  }
});

    return;
  }

  // NON-General modes keep your existing one-shot call
  const { reply, parsed } = await sendPrompt(fullPrompt, {
    fileSummary,
    persistentPrompt,
    temporaryPrompt,
    mood,
    statusText,
    currentAvatar,
    availableAvatars,
    capabilities
  });

  setConversation((prev) => [...prev, { role: 'wymc', text: reply }]);
  setLogOutput((prev) => [...prev, `> ${promptText}`, `< ${reply}`]);

    // Handle first-time summary
    if (!isCommand && currentFileInfo && !fileSummary) {
      const summarizationPrompt = `Summarize this file in approximately 25% of its length:\n\n${fileSlice || currentFileInfo.contents}`;
      const { reply: summary } = await sendPrompt(summarizationPrompt);
      setFileSummary(summary);
    }

    // Handle parsed reply commands
    if (parsed) {
      if (parsed.updates) {
        parsed.updates.forEach(({ key, value }) => {
          if (key === 'Persistent Prompt') setPersistentPrompt(value);
          if (key === 'Temporary Prompt') setTemporaryPrompt(value);
        });
      }

      if (parsed.write?.length) {
        for (const entry of parsed.write) {
          try {
            await fetch('/api/writeLog', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ entry })
            });
          } catch (err) {
            console.error("Failed to write log:", err);
          }
        }
      }

      if (parsed.alerts?.length) {
        parsed.alerts.forEach((alert) => {
          console.warn(`⚠️ ALERT from WymC: ${alert}`);
          // Add UI signal here if desired
        });
      }
    }
  };

  const cycleMode = () => {
    setModeIndex((prev) => (prev + 1) % modeOrder.length);
  };

  const flushAll = () => {
    setUserPrompt('');
    setPersistentPrompt('');
    setTemporaryPrompt('');
    setLogOutput([]);
    setCurrentFileInfo(null);
    setFileSummary(null);
    setFileSlice(null);
    setConversation([{ role: 'wymc', text: "WymC online. Let's get this over with." }]);
  };

  const toggleLogging = () => {
    setLoggingActive((prev) => !prev);
  };

  const currentMode = modeOrder[modeIndex];

  return (
    <div className={`main-screen mode-${currentMode.toLowerCase()} h-screen overflow-hidden flex flex-col`}>
      <div className="mode-toggle flex justify-end items-center gap-3 p-2">
  <label className="text-xs flex items-center gap-1 cursor-pointer">
    <input
      type="checkbox"
      checked={streaming}
      onChange={(e) => setStreaming(e.target.checked)}
    />
    stream
  </label>
  <ModelSelector
  selectedModel={activeModelId}
   onChange={handleModelSwitch}
  />
  {loadingModel && (
  <div className="flex items-center gap-2 text-yellow-300">
    <span className="animate-spin mr-2">🧠</span>
    Loading new brain...
  </div>
)}

    {/* other header buttons like Flush/Logging can sit before this */}
  <VramMonitor refreshKey={vramRefreshKey} pollMs={0} />
  <button
onClick={cycleMode}
  className="min-w-[7rem] text-center text-sm bg-black text-green-400 border border-green-500 px-2 py-1 rounded hover:bg-green-800">
      {currentMode}
</button>
</div>


      <div className="mode-container transition-slide flex-grow overflow-hidden">
        <div className="flex flex-col h-full w-full bg-black text-green-300 font-mono border border-green-700 rounded p-2">
          {currentMode === 'General' && (
            <GeneralMode
              scrollRef={scrollRef}
              userPrompt={userPrompt}
              setUserPrompt={setUserPrompt}
              conversation={conversation}
              onSubmit={handleSubmitPrompt}
              currentFileInfo={currentFileInfo}
              setCurrentFileInfo={setCurrentFileInfo}
              setPersistentPrompt={setPersistentPrompt}
            />
          )}

          {currentMode === 'Debug' && (
            <DebugMode
              logOutput={logOutput}
              userPrompt={userPrompt}
              currentFileInfo={currentFileInfo}
              flushAll={flushAll}
              toggleLogging={toggleLogging}
              loggingActive={loggingActive}
            />
          )}

          {currentMode === 'Narrative' &&(
            <NarrativeMode
              persistentPrompt={persistentPrompt}
              setPersistentPrompt={setPersistentPrompt}
              temporaryPrompt={temporaryPrompt}
              setTemporaryPrompt={setTemporaryPrompt}
              currentFileInfo={currentFileInfo}
              setCurrentFileInfo={setCurrentFileInfo}
            />
          )}

          {currentMode === 'X' && <XMode />}
        </div>
      </div>
    </div>
  );
}
