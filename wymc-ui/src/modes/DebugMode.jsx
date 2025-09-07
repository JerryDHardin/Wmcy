import React from 'react';
import Avatar from '../components/Avatar';

export default function DebugMode({
  logOutput,
  userPrompt,
  currentFileInfo,
  flushAll,
  toggleLogging,
  loggingActive
}) {
  return (
    <div className="flex flex-col h-full text-green-300">
      {/* Top Row: Main Debug + Avatar Side Panel */}
      <div className="flex flex-grow p-4 gap-4">
        {/* Left Column: Logs and Status */}
        <div className="flex-1 space-y-4">
          <div className="border border-green-600 p-2">
            <h3 className="font-bold text-sm mb-1">🧠 Cortex Log Output</h3>
            <div className="bg-black h-32 overflow-y-auto text-xs p-1 font-mono whitespace-pre-line">
              {logOutput.length > 0 ? logOutput.join('\n') : '[No logs yet]'}
            </div>
          </div>

          <div className="border border-green-600 p-2">
            <h3 className="font-bold text-sm mb-1">📝 Last Command Prompt</h3>
            <div className="bg-black h-16 p-1 text-xs overflow-auto">
              {userPrompt || '[Prompt is empty]'}
            </div>
          </div>

          <div className="border border-green-600 p-2">
            <h3 className="font-bold text-sm mb-1">📁 Current File Info</h3>
            <div className="bg-black h-32 text-xs p-1 overflow-auto">
              {currentFileInfo
                ? JSON.stringify(currentFileInfo, null, 2)
                : '[No file loaded]'}
            </div>
          </div>
        </div>

        {/* Right Column: Avatar + Buttons */}
        <div className="w-1/3 flex flex-col justify-between space-y-4">
        <Avatar />

          <div className="flex gap-2">
            <button
              onClick={flushAll}
              className="bg-red-700 px-3 py-1 rounded text-white text-sm"
            >
              Flush
            </button>
            <button
              onClick={toggleLogging}
              className={`px-3 py-1 rounded text-white text-sm ${
                loggingActive ? 'bg-green-700' : 'bg-blue-700'
              }`}
            >
              {loggingActive ? 'Logging On' : 'Logging Off'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
