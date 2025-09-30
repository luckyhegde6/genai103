const axios = require('axios');
const OLLAMA_BASE = process.env.OLLAMA_BASE || 'http://localhost:11434';

async function generate({model='qwen2.5:3b', prompt, stream=false}) {
  // Many Ollama setups support /api/generate and also OpenAI-compatible /v1 endpoints.
  // Use /api/generate which is commonly present.
  const url = `${OLLAMA_BASE}/api/generate`;
  try {
    const resp = await axios.post(url, { model, prompt, stream }, { timeout: 120000 });
    // resp.data often contains { response: "text..." }
    return resp.data;
  } catch (e) {
    // fallback: try OpenAI-compatible endpoint
    try {
      const url2 = `${OLLAMA_BASE}/v1/chat/completions`;
      const r2 = await axios.post(url2, {
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800
      }, { headers: { Authorization: 'Bearer ollama' }, timeout: 120000});
      // r2.data.choices[0].message.content
      return { response: r2.data.choices?.[0]?.message?.content || JSON.stringify(r2.data) };
    } catch (e2) {
      throw new Error('Ollama request failed: ' + (e2.message || e.message));
    }
  }
}

module.exports = { generate };
