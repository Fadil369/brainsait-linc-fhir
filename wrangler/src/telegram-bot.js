import { handleSummary, handlePriorAuth, handleGapsInCare,
  handleMedicationSafety, handleCarePlanNavigator, handleClinicalTrials,
  handleReadmissionRisk, handleTriage, handleImagingFollowup,
  handleLabExplainer, handleNLQuery, handleSDOHReferral,
} from "./agents/ai-handler.js";
import { speechToText, textToSpeech } from "./services/basma-voice.js";

const AGENTS = {
  summary: { fn: handleSummary, label: "Patient Summary" },
  "prior-auth": { fn: handlePriorAuth, label: "Prior Auth" },
  "gaps-in-care": { fn: handleGapsInCare, label: "Gaps in Care" },
  "medication-safety": { fn: handleMedicationSafety, label: "Medication Safety" },
  "care-plan": { fn: handleCarePlanNavigator, label: "Care Plan" },
  "clinical-trials": { fn: handleClinicalTrials, label: "Clinical Trials" },
  "readmission-risk": { fn: handleReadmissionRisk, label: "Readmission Risk" },
  triage: { fn: handleTriage, label: "Triage" },
  "imaging-followup": { fn: handleImagingFollowup, label: "Imaging Follow-up" },
  "lab-explainer": { fn: handleLabExplainer, label: "Lab Explainer" },
  "nl-query": { fn: handleNLQuery, label: "NL Query" },
  "sdoh-referral": { fn: handleSDOHReferral, label: "SDOH Referral" },
};

const VOICE_MODE_KEY = "basma_voice_mode";

const COMMANDS = [
  { command: "start", description: "Start BrainSAIT Healthcare AI" },
  { command: "help", description: "Show available commands" },
  { command: "voice", description: "Toggle BASMA voice responses 🔊" },
  { command: "basma", description: "Hear BASMA introduce herself" },
  { command: "summary", description: "Generate patient summary" },
  { command: "triage", description: "Triage assessment" },
  { command: "meds", description: "Medication safety check" },
  { command: "gaps", description: "Identify care gaps" },
  { command: "plan", description: "Generate care plan" },
  { command: "labs", description: "Explain lab results" },
  { command: "risk", description: "Readmission risk score" },
  { command: "auth", description: "Prior authorization eval" },
  { command: "trials", description: "Clinical trial matching" },
  { command: "imaging", description: "Imaging follow-up" },
  { command: "sdoh", description: "SDOH referrals" },
  { command: "query", description: "Ask about a patient" },
];

// In-memory voice mode toggle (per chat). For production, use KV/D1.
const voiceModeChats = new Set();

function makeFakeRequest(body) {
  return new Request("http://localhost/api/contest/agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function callAgent(agentKey, question, env) {
  const agent = AGENTS[agentKey];
  if (!agent) return "Unknown agent.";
  const fakeReq = makeFakeRequest({ patientId: "1", question: question || "" });
  try {
    const resp = await agent.fn(fakeReq, env);
    const data = await resp.json();
    const response = data.response || data.error || JSON.stringify(data, null, 2);
    return typeof response === "string" ? response : JSON.stringify(response, null, 2);
  } catch (err) {
    return `Error: ${err.message}`;
  }
}

function jsonToReadableText(data, depth = 0) {
  if (typeof data === "string") return data;
  if (typeof data === "number" || typeof data === "boolean") return String(data);
  if (Array.isArray(data)) {
    return data.map((item, i) => {
      const prefix = depth === 0 ? "" : `${i + 1}. `;
      return prefix + jsonToReadableText(item, depth + 1);
    }).join(". ");
  }
  if (typeof data === "object" && data !== null) {
    return Object.entries(data).map(([key, val]) => {
      const label = key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim();
      if (typeof val === "object" && val !== null) {
        return `${label}: ${jsonToReadableText(val, depth + 1)}`;
      }
      return `${label}: ${val}`;
    }).join(". ");
  }
  return String(data);
}

function formatTelegram(text, maxLen = 4000) {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 20) + "\n\n... (truncated)";
}

async function sendMessage(token, chatId, text, replyTo) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = {
    chat_id: chatId,
    text: formatTelegram(text),
    parse_mode: "Markdown",
    ...(replyTo ? { reply_to_message_id: replyTo } : {}),
  };
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function sendVoice(token, chatId, audioBuffer, replyTo, caption) {
  const form = new FormData();
  form.append("chat_id", String(chatId));
  form.append("voice", new Blob([audioBuffer], { type: "audio/mpeg" }), "basma.mp3");
  if (caption) form.append("caption", caption);
  if (replyTo) form.append("reply_to_message_id", String(replyTo));

  return fetch(`https://api.telegram.org/bot${token}/sendVoice`, {
    method: "POST",
    body: form,
  });
}

async function sendChatAction(token, chatId, action = "typing") {
  return fetch(`https://api.telegram.org/bot${token}/sendChatAction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, action }),
  });
}

async function downloadFile(token, fileId) {
  const infoRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
  const info = await infoRes.json();
  if (!info.ok) return null;
  const filePath = info.result.file_path;
  const fileRes = await fetch(`https://api.telegram.org/file/bot${token}/${filePath}`);
  return fileRes.arrayBuffer();
}

async function setWebhook(token, webhookUrl) {
  return fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      allowed_updates: ["message"],
      max_connections: 10,
    }),
  });
}

async function setCommands(token) {
  return fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ commands: COMMANDS }),
  });
}

async function handleVoiceMessage(update, env, token) {
  const chatId = update.message.chat.id;
  const messageId = update.message.message_id;
  const voice = update.message.voice || update.message.audio;
  if (!voice) return new Response("OK");

  await sendChatAction(token, chatId, "typing");

  // Download voice file
  const audioBuffer = await downloadFile(token, voice.file_id);
  if (!audioBuffer) {
    await sendMessage(token, chatId, "Could not download voice message.", messageId);
    return new Response("OK");
  }

  // Transcribe with STT
  const stt = await speechToText(audioBuffer, env.ELEVENLABS_API_KEY);
  if (!stt.ok) {
    await sendMessage(token, chatId, `Voice transcription failed: ${stt.error}`, messageId);
    return new Response("OK");
  }

  const transcribedText = stt.text.trim();
  if (!transcribedText) {
    await sendMessage(token, chatId, "I could not understand the audio. Please try again.", messageId);
    return new Response("OK");
  }

  // Detect language for response
  const isArabic = /[\u0600-\u06FF]/.test(transcribedText);

  // Route to triage agent
  const result = await callAgent("triage", transcribedText, env);
  const readable = jsonToReadableText(
    typeof result === "string" ? (() => { try { return JSON.parse(result); } catch { return result; } })() : result
  );

  // Always send text
  const label = "BASMA Triage";
  const textMsg = `🎤 *${label}* (voice input)\n\n_${transcribedText}_\n\n${readable}`;
  await sendMessage(token, chatId, textMsg, messageId);

  // Send BASMA voice response
  if (env.ELEVENLABS_API_KEY) {
    await sendChatAction(token, chatId, "record_voice");
    const voicePrompt = isArabic
      ? `مرحباً، أنا بصمة، مساعدتك الصحية الذكية. ${readable}`
      : `Hello, I am BASMA, your smart healthcare assistant. ${readable}`;

    const tts = await textToSpeech(voicePrompt, env.ELEVENLABS_API_KEY);
    if (tts.ok) {
      await sendVoice(token, chatId, tts.audio, messageId);
    }
  }

  return new Response("OK");
}

async function handleBasmaIntro(token, chatId, env) {
  const introAr = `مرحباً! أنا بصمة، مساعدتك الصحية الذكية من برين سايت.
أنا هنا لمساعدتك في كل ما يتعلق بصحتك.
يمكنك إرسال رسالة صوتية أو نصية وسأقوم بتحليلها فوراً.
أنا أتحدث العربية واللهجة السعودية بطلاقة.
كيف يمكنني مساعدتك اليوم؟`;

  await sendMessage(token, chatId, `🔊 *BASMA* — Your Smart Healthcare Assistant\n\n${introAr}`);

  if (env.ELEVENLABS_API_KEY) {
    await sendChatAction(token, chatId, "record_voice");
    const tts = await textToSpeech(introAr, env.ELEVENLABS_API_KEY);
    if (tts.ok) {
      await sendVoice(token, chatId, tts.audio);
    }
  }
}

export async function handleTelegramWebhook(request, env) {
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return new Response(JSON.stringify({ error: "TELEGRAM_BOT_TOKEN not configured" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  let update;
  try {
    update = await request.json();
  } catch {
    return new Response("OK");
  }

  if (!update.message) return new Response("OK");

  const chatId = update.message.chat.id;
  const messageId = update.message.message_id;

  // Handle voice messages
  if (update.message.voice || update.message.audio) {
    return handleVoiceMessage(update, env, token);
  }

  const text = update.message.text?.trim();
  if (!text) return new Response("OK");

  // Handle /start and /help
  if (text === "/start" || text === "/help") {
    const voiceStatus = voiceModeChats.has(chatId) ? "🔊 ON" : "🔇 OFF";
    const helpText = `🏥 *BrainSAIT Healthcare AI*

🎤 *Voice:* Send me a voice message and BASMA will respond with voice!

📋 *Commands:*
/voice — Toggle voice responses ${voiceStatus}
/basma — Hear BASMA introduce herself
/summary — Patient summary
/triage — Triage assessment
/meds — Medication safety
/gaps — Care gaps
/plan — Care plan
/labs — Lab explainer
/risk — Readmission risk
/auth — Prior auth
/trials — Clinical trials
/imaging — Imaging follow-up
/sdoh — SDOH referrals
/query <question> — Ask about a patient

💬 Or send any text for triage analysis.`;
    await sendMessage(token, chatId, helpText);
    return new Response("OK");
  }

  // Handle /voice toggle
  if (text === "/voice") {
    if (voiceModeChats.has(chatId)) {
      voiceModeChats.delete(chatId);
      await sendMessage(token, chatId, "🔇 Voice responses OFF. Text only mode.");
    } else {
      voiceModeChats.add(chatId);
      await sendMessage(token, chatId, "🔊 Voice responses ON! BASMA will reply with voice.");
    }
    return new Response("OK");
  }

  // Handle /basma intro
  if (text === "/basma") {
    await handleBasmaIntro(token, chatId, env);
    return new Response("OK");
  }

  // Handle commands
  await sendChatAction(token, chatId);

  let agentKey = null;
  let question = null;

  if (text.startsWith("/")) {
    const cmd = text.split(" ")[0].slice(1).toLowerCase();
    const rest = text.split(" ").slice(1).join(" ");
    if (cmd === "query") {
      agentKey = "nl-query";
      question = rest || "Show patient overview";
    } else if (cmd === "meds") {
      agentKey = "medication-safety";
    } else if (cmd === "plan") {
      agentKey = "care-plan";
    } else if (cmd === "labs") {
      agentKey = "lab-explainer";
    } else if (cmd === "risk") {
      agentKey = "readmission-risk";
    } else if (cmd === "auth") {
      agentKey = "prior-auth";
    } else if (cmd === "trials") {
      agentKey = "clinical-trials";
    } else if (AGENTS[cmd]) {
      agentKey = cmd;
    }
  } else {
    agentKey = "triage";
    question = text;
  }

  if (!agentKey) {
    await sendMessage(token, chatId, "Unknown command. Send /help for options.");
    return new Response("OK");
  }

  const result = await callAgent(agentKey, question, env);
  const label = AGENTS[agentKey]?.label || agentKey;
  const readable = jsonToReadableText(
    typeof result === "string" ? (() => { try { return JSON.parse(result); } catch { return result; } })() : result
  );

  await sendMessage(token, chatId, `*${label}*\n\n${readable}`, messageId);

  // Send BASMA voice if voice mode is on
  if (voiceModeChats.has(chatId) && env.ELEVENLABS_API_KEY) {
    await sendChatAction(token, chatId, "record_voice");
    const isArabic = /[\u0600-\u06FF]/.test(text);
    const voiceText = isArabic
      ? `مرحباً، نتيجة ${label}: ${readable}`
      : `Here is the ${label} result: ${readable}`;
    const tts = await textToSpeech(voiceText, env.ELEVENLABS_API_KEY);
    if (tts.ok) {
      await sendVoice(token, chatId, tts.audio, messageId);
    }
  }

  return new Response("OK");
}

export async function handleTelegramSetup(request, env) {
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return new Response(JSON.stringify({ error: "TELEGRAM_BOT_TOKEN not configured" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const url = new URL(request.url);
  const baseUrl = url.origin;
  const webhookUrl = `${baseUrl}/api/telegram/webhook`;

  const [webhookResp, commandsResp] = await Promise.all([
    setWebhook(token, webhookUrl),
    setCommands(token),
  ]);

  const webhook = await webhookResp.json();
  const commands = await commandsResp.json();

  return new Response(JSON.stringify({
    webhook: webhook.ok ? "configured" : webhook,
    commands: commands.ok ? "configured" : commands,
    webhookUrl,
    voice: "BASMA (Latifa — Gulf Arabic, warm & energized)",
    features: ["text", "voice_input", "voice_output", "arabic", "english"],
  }), {
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
}
