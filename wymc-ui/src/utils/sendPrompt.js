// File: src/utils/sendPrompt.js (updated)

import parseMistralReply from './parseMistralReply';
import buildPromptTemplate from './promptBuilder';

export default async function sendPrompt(userPrompt, context = {}) {
  // Build full outbound prompt
  const finalPrompt = buildPromptTemplate({
    userPrompt,
    fileSummary: context.fileSummary,
    persistentPrompt: context.persistentPrompt,
    temporaryPrompt: context.temporaryPrompt
  });

  try {
    const res = await fetch("/api/mistral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
      prompt: finalPrompt,
      model: context.model // Pass the model if present!
    })

    });

    const contentType = res.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      const fallback = await res.text();
      return { reply: fallback.slice(0, 200), parsed: null };
    }

    const data = await res.json();
    const reply = data.reply || '[No response]';
    const parsed = parseMistralReply(reply);

    return { reply, parsed };
  } catch (err) {
    return { reply: `❌ Error: ${err.message}`, parsed: null };
  }
}
