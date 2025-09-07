// utils/api.js
export async function getVram() {
  const r = await fetch("http://localhost:3001/gpu/stats");
  if (!r.ok) throw new Error("vram_fetch_failed");
  return r.json();
}

export async function loadModel(name, sizeMB = 4600, pinned = false) {
  const r = await fetch("http://localhost:3001/model/load", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name, sizeMB, pinned }),
  });
  if (!r.ok) throw new Error("model_load_failed");
  return r.json();
}

export async function unloadModel(name) {
  const r = await fetch("http://localhost:3001/model/unload", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!r.ok) throw new Error("model_unload_failed");
  return r.json();
}

// Stream route (SSE over POST fetch)
export async function streamRoute({ mode, prompt, onToken, onMeta, onDone, onError }) {
  const r = await fetch("http://localhost:3001/route/stream", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ mode, prompt }),
  });
  if (!r.ok || !r.body) {
    onError?.(new Error("route_stream_failed"));
    return;
  }

  const reader = r.body.getReader();
  const dec = new TextDecoder();
  let buf = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });

      // Parse SSE lines
      const chunks = buf.split("\n\n");
      buf = chunks.pop() ?? "";
      for (const block of chunks) {
        const lines = block.split("\n");
        let event = "message";
        let data = "";
        for (const ln of lines) {
          if (ln.startsWith("event:")) event = ln.slice(6).trim();
          else if (ln.startsWith("data:")) data += ln.slice(5);
        }
        if (event === "meta") onMeta?.(JSON.parse(data));
        else if (event === "done") onDone?.();
        else if (event === "error") onError?.(JSON.parse(data));
        else onToken?.(data);
      }
    }
  } catch (e) {
    onError?.(e);
  }
}
