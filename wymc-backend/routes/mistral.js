// File: mistral.js
import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

router.post('/', async (req, res) => {
  const { prompt, model } = req.body;
  const modelName = model || "mistral";

  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }

  try {
    const mistralResponse = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
      model: modelName,
      prompt: `You are WymC, an assistant AI.\nUser: ${prompt}\nWymC:`,
      stream: false
        })
      });

    const data = await mistralResponse.json();
    const text = data.response || '[No response]';

    res.json({ reply: text.trim() });
  } catch (err) {
    console.error("Mistral proxy error:", err);
    res.status(500).json({ error: 'Mistral fetch failed' });
  }
});

export default router;
