// File: GeneralMode.jsx
import React from 'react';
import Avatar from '../components/Avatar';

export default function GeneralMode({
  userPrompt,
  setUserPrompt,
  conversation,
  onSubmit,
  scrollRef,
  currentFileInfo,
  setCurrentFileInfo,
  setPersistentPrompt
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.ctrlKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleLocalFileLoad = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result;
      setCurrentFileInfo({ name: file.name, contents: content });
      setPersistentPrompt?.(content); // if provided
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex h-full w-full overflow-hidden text-green-300">
      {/* Left Side: Scrollable chat */}
      <div className="flex-grow flex flex-col overflow-hidden">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto border border-green-700 p-4 bg-black text-sm space-y-4"
        >
          {conversation.map((entry, idx) => (
            <div
              key={idx}
              className={`whitespace-pre-wrap ${
                entry.role === 'wymc'
                  ? 'pl-2 border-l-2 border-green-600'
                  : 'pl-6 opacity-80 italic'
              }`}
            >
              <div className="font-bold text-green-500 mb-1">
                {entry.role === 'wymc' ? '🤖 WymC:' : '🧍 You:'}
              </div>
              <div className="text-green-400">{entry.text}</div>
            </div>
          ))}
        </div>

        <div className="border-t border-green-700 p-4 bg-black">
          <textarea
            className="w-full border border-green-700 p-2 text-sm resize-none h-24 font-mono placeholder-green-600"
            placeholder="Type your message..."
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ backgroundColor: 'black', color: '#00ff66' }}
          />
        </div>
      </div>

      {/* Right Side: Avatar + file load panel */}
      <div className="w-1/3 flex flex-col flex-shrink-0 space-y-2 border-l border-green-700 p-4 bg-black overflow-hidden">
        <Avatar />

        <div className="border border-green-700 p-2 text-xs space-y-1">
          <div className="font-bold">📁 Pre-prompt / Current File</div>
          <div className="text-green-400">{currentFileInfo?.name || '[None loaded]'}</div>
          <div
  onDragOver={(e) => e.preventDefault()}
  onDrop={(e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCurrentFileInfo({ name: file.name, contents: reader.result });
      setPersistentPrompt?.(reader.result);
    };
    reader.readAsText(file);
  }}
  className="border border-dashed border-green-600 p-2 text-xs rounded bg-black text-green-300"
>
  <p className="mb-1">📁 Drop a file here or click to load:</p>
  <input
    type="file"
    accept=".txt,.md,.json"
    onChange={handleLocalFileLoad}
    className="text-green-300 text-xs"
  />
</div>

        </div>
      </div>
    </div>
  );
}
