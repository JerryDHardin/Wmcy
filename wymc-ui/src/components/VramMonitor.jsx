// src/components/VramMonitor.jsx
import React, { useEffect, useState } from 'react';
import { getVram } from '../utils/api';

export default function VramMonitor({ refreshKey, pollMs = 0 }) {
  const [vram, setVram] = useState({ usedGB: 0, totalGB: 0 });

  async function refresh() {
    try { setVram(await getVram()); } catch {}
  }

  useEffect(() => { refresh(); }, [refreshKey]);
  useEffect(() => {
    if (!pollMs) return;
    const id = setInterval(refresh, pollMs);
    return () => clearInterval(id);
  }, [pollMs]);

  return (
    <div className="ml-2 px-2 py-0.5 border border-[#00ff44] bg-[#0a0a0a] text-[#00ff44] text-xs rounded">
      VRAM: <span>{vram.usedGB.toFixed ? vram.usedGB.toFixed(1) : vram.usedGB} GB</span>
      {" / "}
      <span>{vram.totalGB} GB</span>
    </div>
  );
}
