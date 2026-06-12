const DEFAULT_TIMEOUT_MS = 30000;
const MAX_RETRIES = 2;
const MAX_TOKENS = 1500;

function buildHeaders(apiKey) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
  };
}

function extractText(data, shape) {
  if (shape === "openai") {
    return data?.choices?.[0]?.message?.content ?? "";
  }
  const blocks = data?.content;
  if (Array.isArray(blocks)) {
    return blocks.filter((b) => b.type === "text").map((b) => b.text).join("");
  }
  return "";
}

async function tryOpenAI(base, apiKey, messages, model, signal) {
  const url = `${base.replace(/\/+$/, "")}/v1/chat/completions`;
  const body = { model, messages, max_tokens: MAX_TOKENS, temperature: 0.3 };
  const res = await fetch(url, {
    method: "POST", headers: buildHeaders(apiKey), body: JSON.stringify(body), signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, status: res.status, shape: "openai", error: text || `HTTP ${res.status}` };
  }
  const data = await res.json();
  return { ok: true, shape: "openai", text: extractText(data, "openai"), usage: data?.usage ?? null, raw: data };
}

async function tryAnthropic(base, apiKey, systemPrompt, messages, model, signal) {
  const url = `${base.replace(/\/+$/, "")}/anthropic`;
  const body = { model, max_tokens: MAX_TOKENS, system: systemPrompt, messages };
  const res = await fetch(url, {
    method: "POST",
    headers: { ...buildHeaders(apiKey), "anthropic-version": "2023-06-01", "x-api-key": apiKey },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, status: res.status, shape: "anthropic", error: text || `HTTP ${res.status}` };
  }
  const data = await res.json();
  return { ok: true, shape: "anthropic", text: extractText(data, "anthropic"), usage: data?.usage ?? null, raw: data };
}

export async function callMiMo(messages, systemPrompt, env, opts = {}) {
  const apiKey = env?.MIMO_API_KEY;
  const base = env?.MIMO_API_BASE || "https://token-plan-sgp.xiaomimimo.com";
  const model = env?.MIMO_MODEL || "";

  if (!apiKey) {
    return { ok: false, error: "MIMO_API_KEY not configured. Run: npx wrangler secret put MIMO_API_KEY" };
  }
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return { ok: false, error: "Empty messages" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  if (opts.signal) {
    opts.signal.addEventListener("abort", () => controller.abort());
  }

  let lastError = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const oai = await tryOpenAI(base, apiKey, messages, model, controller.signal);
      if (oai.ok) { clearTimeout(timeout); return oai; }
      if (oai.status === 404 || oai.status === 405) {
        const ant = await tryAnthropic(base, apiKey, systemPrompt || "You are a helpful clinical assistant.", messages.map(m => ({ role: m.role, content: m.content })), model, controller.signal);
        if (ant.ok) { clearTimeout(timeout); return ant; }
        lastError = ant.error;
      } else {
        lastError = oai.error;
      }
    } catch (err) {
      lastError = err?.name === "AbortError" ? `MiMo timed out after ${DEFAULT_TIMEOUT_MS}ms` : err?.message || String(err);
    }
    if (attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  clearTimeout(timeout);
  return { ok: false, error: `MiMo unavailable after ${MAX_RETRIES + 1} attempts: ${lastError}` };
}
