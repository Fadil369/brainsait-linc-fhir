// BASMA Voice — ElevenLabs Arabic Saudi female voice pipeline
// STT: Cloudflare Workers AI Whisper | TTS: ElevenLabs Latifa (Gulf Arabic, warm/energized)

const BASMA_VOICE_ID = "LEqoCOGNjyExRiRUZhkv"; // Latifa — Bright and Welcoming (Gulf Arabic female)
const ELEVENLABS_API = "https://api.elevenlabs.io/v1";

export async function speechToText(audioBuffer, apiKey) {
  if (!apiKey) return { ok: false, error: "ELEVENLABS_API_KEY not configured" };

  const form = new FormData();
  form.append("audio", new Blob([audioBuffer], { type: "audio/ogg" }), "voice.ogg");
  form.append("model_id", "scribe_v1");

  const res = await fetch(`${ELEVENLABS_API}/speech-to-text`, {
    method: "POST",
    headers: { "xi-api-key": apiKey },
    body: form,
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    return { ok: false, error: `STT failed: ${res.status} ${err}` };
  }

  const data = await res.json();
  return { ok: true, text: data.text || "", language: data.language_code || "" };
}

export async function textToSpeech(text, apiKey, opts = {}) {
  if (!apiKey) return { ok: false, error: "ELEVENLABS_API_KEY not configured" };

  const voiceId = opts.voiceId || BASMA_VOICE_ID;
  const cleanText = text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[*#_~`>]/g, "")
    .replace(/\{[^}]*\}/g, (m) => {
      try { const d = JSON.parse(m); return JSON.stringify(d).slice(0, 200); } catch { return m; }
    })
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, ". ")
    .trim();

  if (!cleanText) return { ok: false, error: "Empty text" };

  const res = await fetch(`${ELEVENLABS_API}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: cleanText,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.4,
        similarity_boost: 0.75,
        style: 0.6,
        use_speaker_boost: true,
        speed: 1.05,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    return { ok: false, error: `TTS failed: ${res.status} ${err}` };
  }

  const audioBuffer = await res.arrayBuffer();
  return { ok: true, audio: audioBuffer, contentType: "audio/mpeg" };
}

export async function getVoiceInfo(apiKey) {
  const res = await fetch(`${ELEVENLABS_API}/voices/${BASMA_VOICE_ID}`, {
    headers: { "xi-api-key": apiKey },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return {
    name: data.name,
    labels: data.labels,
    preview: data.preview_url,
  };
}
