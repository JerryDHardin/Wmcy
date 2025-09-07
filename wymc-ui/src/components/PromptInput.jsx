import React, { useState } from "react";

export default function PromptInput({
  onSubmit,
  placeholder = "Type your message...",
  className = "",
}) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    onSubmit(trimmed);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.ctrlKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`mt-4 ${className}`}>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full h-24 resize-none p-2 font-mono text-green-300 placeholder-green-600 bg-black border border-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        placeholder={placeholder}
        style={{ backgroundColor: "black", color: "#00ff66" }}
      />
    </form>
  );
}
