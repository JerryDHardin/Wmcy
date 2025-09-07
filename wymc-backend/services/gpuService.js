// services/gpuService.js
// Reads VRAM via nvidia-smi (Linux/Windows with NVIDIA drivers installed)
// Fallback returns zeros if nvidia-smi is missing.

import { exec } from "node:child_process";

export async function readVram() {
  const cmd = `nvidia-smi --query-gpu=memory.total,memory.used --format=csv,noheader,nounits`;
  try {
    const raw = await new Promise((resolve, reject) =>
      exec(cmd, (err, stdout, stderr) =>
        err ? reject(new Error(stderr || err.message)) : resolve(stdout)
      )
    );
    // If multiple GPUs, take the first line (GPU 0)
    const line = raw.trim().split(/\r?\n/)[0] || "";
    const [totalStr, usedStr] = line.split(",").map(s => s.trim());
    const totalMB = Number(totalStr || 0);
    const usedMB  = Number(usedStr  || 0);
    return {
      totalGB: +(totalMB / 1024).toFixed(1),
      usedGB:  +(usedMB  / 1024).toFixed(1),
      totalMB,
      usedMB,
    };
  } catch {
    return { totalGB: 0, usedGB: 0, totalMB: 0, usedMB: 0 };
  }
}
