import { useState, useEffect, useRef } from "react";

export default function WymC() {
  const [showGoals, setShowGoals] = useState(true);
  const [systemGoals, setSystemGoals] = useState('');
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const [messages, setMessages] = useState([
    { sender: "wymc", text: "WymC online. Let's get this over with." },
  ]);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMessage = { sender: "you", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const response = await fetch("http://localhost:3001/api/wymc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input })
    });

    const data = await response.json();
    const wymcReply = { sender: "wymc", text: data.reply };
    setMessages((prev) => [...prev, wymcReply]);
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetch('/api/wymc/whispers/system_goals.md')
      .then(res => res.json())
      .then(data => {
        if (data.content) setSystemGoals(data.content);
      })
      .catch(err => console.error('Failed to load system goals:', err));
  }, []);

  return (
    <div className="min-h-screen bg-black text-[#00FF41] font-mono p-6">
      <h1 className="text-2xl font-bold mb-4">WymC Terminal Interface</h1>

      {systemGoals && (
        <div className="border border-[#00FF41] p-4 mb-4 text-sm text-green-400 bg-black">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-green-300">🧠 WymC Boot Panel: system_goals.md</span>
            <button
              className="text-xs border border-[#00FF41] px-2 py-1 hover:bg-[#00FF41] hover:text-black transition"
              onClick={() => setShowGoals(prev => !prev)}
            >
              {showGoals ? "Hide" : "Show"}
            </button>
          </div>
          {showGoals && (
            <pre className="whitespace-pre-wrap">{systemGoals || "🧠 BOOT PANEL LOADED"}</pre>
          )}
        </div>
      )}

      <div className="border border-[#00FF41] h-96 overflow-y-auto p-4 mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-4 whitespace-pre-wrap ${
              msg.sender === "wymc" ? "pl-2 border-l-2 border-[#00FF41]" : "pl-6 opacity-80 italic"
            }`}
          >
            <div className="font-bold mb-1">
              {msg.sender === "wymc" ? "🤖 WymC:" : "🧍 You:"}
            </div>
            <div className="text-[#00FF41]">{msg.text}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex space-x-2">
        <textarea
          className="border border-[#00FF41] text-[#00FF41] placeholder-[#00FF41] px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#00FF41] resize-none leading-relaxed"
          style={{ backgroundColor: "#000000" }}
          placeholder="Type your message..."
          value={input}
          rows={2}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />

        <button
          className="bg-[#00FF41] text-black font-bold px-4 py-2 border border-[#00FF41] hover:bg-black hover:text-[#00FF41] transition-colors duration-200"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
