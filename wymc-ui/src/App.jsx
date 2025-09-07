// File: src/App.jsx
import React, { useRef, useEffect, useState } from 'react';
import MainScreen from './layouts/MainScreen';

export default function App() {
  const [currentMode, setCurrentMode] = useState("General");
  const [previousMode, setPreviousMode] = useState(null);
  const [xModeActive, setXModeActive] = useState(false);

  const scrollRef = useRef(null);
  const [conversation, setConversation] = useState([
    { role: 'wymc', text: "WymC online. Let's get this over with." }
  ]);

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

  return (
    <MainScreen scrollRef={scrollRef} conversation={conversation} setConversation={setConversation} />
  );
}
