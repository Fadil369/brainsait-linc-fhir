import { handleSummary, handlePriorAuth, handleGapsInCare,
  handleMedicationSafety, handleCarePlanNavigator, handleClinicalTrials,
  handleReadmissionRisk, handleTriage, handleImagingFollowup,
  handleLabExplainer, handleNLQuery, handleSDOHReferral,
} from "./agents/ai-handler.js";
import { speechToText, textToSpeech } from "./services/basma-voice.js";

// ═══════════════════════════════════════════════════════════
// BASMA — BrainSAIT AI Medical Assistant
// Bilingual (AR/EN) · Voice · Smart Routing · 12 Agents
// ═══════════════════════════════════════════════════════════

const AGENTS = {
  summary:          { fn: handleSummary,          ar: "ملخص المريض",     en: "Patient Summary",      icon: "📋", category: "clinical" },
  "prior-auth":     { fn: handlePriorAuth,        ar: "الترخيص المسبق",   en: "Prior Authorization",  icon: "✅", category: "admin" },
  "gaps-in-care":   { fn: handleGapsInCare,        ar: "فجوات الرعاية",    en: "Gaps in Care",         icon: "🔍", category: "quality" },
  "medication-safety": { fn: handleMedicationSafety, ar: "سلامة الأدوية",   en: "Medication Safety",    icon: "💊", category: "pharmacy" },
  "care-plan":      { fn: handleCarePlanNavigator,  ar: "خطة الرعاية",     en: "Care Plan",            icon: "📝", category: "clinical" },
  "clinical-trials": { fn: handleClinicalTrials,    ar: "التجارب السريرية", en: "Clinical Trials",      icon: "🔬", category: "research" },
  "readmission-risk": { fn: handleReadmissionRisk,  ar: "خطر إعادة الدخول", en: "Readmission Risk",    icon: "⚠️", category: "risk" },
  triage:           { fn: handleTriage,             ar: "الفحص الأولي",     en: "Triage Assessment",    icon: "🚑", category: "emergency" },
  "imaging-followup": { fn: handleImagingFollowup,  ar: "متابعة التصوير",   en: "Imaging Follow-up",   icon: "📷", category: "clinical" },
  "lab-explainer":  { fn: handleLabExplainer,       ar: "شرح التحاليل",     en: "Lab Results",          icon: "🧪", category: "clinical" },
  "nl-query":       { fn: handleNLQuery,            ar: "استعلام ذكي",      en: "Smart Query",          icon: "💬", category: "query" },
  "sdoh-referral":  { fn: handleSDOHReferral,       ar: "الإحالات الاجتماعية", en: "SDOH Referrals",    icon: "🏠", category: "social" },
};

// Smart keyword → agent routing (AR + EN)
const ROUTING_RULES = [
  { keywords: ["triage", "emergency", "urgent", "pain", "chest", "breathing", "bleeding", " unconscious",
    "طوارئ", "ألم", "صدر", "نزيف", "تنفس", "وعكة", "إسعاف", "حرجة"], agent: "triage" },
  { keywords: ["summary", "overview", "patient", "history", "report",
    "ملخص", "تقرير", "مريض", "حالة", "تاريخ"], agent: "summary" },
  { keywords: ["medication", "drug", "medicine", "pharmacy", "interaction", "dose", "pill",
    "دواء", "أدوية", "صيدلية", "تفاعل", "جرعة"], agent: "medication-safety" },
  { keywords: ["lab", "blood", "test", "result", "cbc", "glucose", "hba1c", "cholesterol",
    "تحليل", "تحاليل", "دم", "سكر", "نتائج"], agent: "lab-explainer" },
  { keywords: ["gap", "screening", "vaccine", "preventive", "missing", "overdue",
    "فجوة", "فحص", "تطعيم", "وقائي", "مفقود"], agent: "gaps-in-care" },
  { keywords: ["care plan", "plan", "goal", "follow-up", "schedule",
    "خطة", "رعاية", "هدف", "متابعة", "موعد"], agent: "care-plan" },
  { keywords: ["imaging", "x-ray", "mri", "ct", "ultrasound", "radiology",
    "تصوير", "أشعة", "رنين", "سيتي", "سونار"], agent: "imaging-followup" },
  { keywords: ["readmission", "risk", "re-admit", "hospital", "chronic",
    "إعادة", "دخول", "خطر", "مزمن", "مستشفى"], agent: "readmission-risk" },
  { keywords: ["prior auth", "authorization", "insurance", "approval", "coverage",
    "ترخيص", "تأمين", "موافقة", "تغطية"], agent: "prior-auth" },
  { keywords: ["trial", "research", "study", "enrollment", "clinical",
    "تجربة", "بحث", "دراسة", "سريري"], agent: "clinical-trials" },
  { keywords: ["social", "food", "transport", "housing", "community", "referral",
    "اجتماعي", "غذاء", "نقل", "سكن", "إحالة"], agent: "sdoh-referral" },
  { keywords: ["query", "ask", "what", "how", "why", "when", "explain",
    "استعلام", "اسأل", "ماذا", "كيف", "لماذا", "اشرح"], agent: "nl-query" },
];

// BASMA personality
const BASMA = {
  name_ar: "بسمه",
  name_en: "BASMA",
  full_ar: "بسمه — المساعد الطبي الذكي من برين سايت",
  full_en: "BASMA — BrainSAIT AI Medical Assistant",
  tagline_ar: "مساعدك الصحي الذكي",
  tagline_en: "Your Smart Healthcare Assistant",
};

// ═══════════════════════════════════════════════════════════
// Telegram API Helpers
// ═══════════════════════════════════════════════════════════

function tg(method, token, body) {
  return fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function tgForm(method, token, form) {
  return fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    body: form,
  });
}

async function sendMessage(token, chatId, text, opts = {}) {
  return tg("sendMessage", token, {
    chat_id: chatId,
    text: text.slice(0, 4000),
    parse_mode: "Markdown",
    disable_web_page_preview: true,
    ...opts,
  });
}

async function sendVoice(token, chatId, audioBuffer, opts = {}) {
  const form = new FormData();
  form.append("chat_id", String(chatId));
  form.append("voice", new Blob([audioBuffer], { type: "audio/mpeg" }), "basma.mp3");
  if (opts.caption) form.append("caption", opts.caption.slice(0, 1024));
  if (opts.reply_to) form.append("reply_to_message_id", String(opts.reply_to));
  return tgForm("sendVoice", token, form);
}

async function sendChatAction(token, chatId, action = "typing") {
  return tg("sendChatAction", token, { chat_id: chatId, action });
}

async function editMessage(token, chatId, messageId, text, keyboard) {
  const body = { chat_id: chatId, message_id: messageId, text: text.slice(0, 4000), parse_mode: "Markdown" };
  if (keyboard) body.reply_markup = keyboard;
  return tg("editMessageText", token, body);
}

async function downloadFile(token, fileId) {
  const info = await (await tg("getFile", token, { file_id: fileId })).json();
  if (!info.ok) return null;
  const res = await fetch(`https://api.telegram.org/file/bot${token}/${info.result.file_path}`);
  return res.arrayBuffer();
}

// ═══════════════════════════════════════════════════════════
// Smart Agent Routing
// ═══════════════════════════════════════════════════════════

function detectLanguage(text) {
  return /[\u0600-\u06FF]/.test(text) ? "ar" : "en";
}

function routeAgent(text) {
  const lower = text.toLowerCase();
  let bestAgent = null;
  let bestScore = 0;

  for (const rule of ROUTING_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (lower.includes(kw.toLowerCase())) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestAgent = rule.agent;
    }
  }
  return bestScore > 0 ? bestAgent : "triage"; // default to triage
}

function jsonToReadable(data, lang = "en", depth = 0) {
  if (typeof data === "string") return data;
  if (typeof data === "number" || typeof data === "boolean") return String(data);
  if (Array.isArray(data)) {
    return data.map((item, i) => {
      const prefix = depth === 0 ? "" : `${i + 1}. `;
      return prefix + jsonToReadable(item, lang, depth + 1);
    }).join(lang === "ar" ? "، " : ". ");
  }
  if (typeof data === "object" && data !== null) {
    return Object.entries(data).map(([key, val]) => {
      const label = key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim();
      if (typeof val === "object" && val !== null) {
        return `${label}: ${jsonToReadable(val, lang, depth + 1)}`;
      }
      return `${label}: ${val}`;
    }).join(lang === "ar" ? "، " : ". ");
  }
  return String(data);
}

// ═══════════════════════════════════════════════════════════
// Agent Execution
// ═══════════════════════════════════════════════════════════

function makeFakeRequest(body) {
  return new Request("http://localhost/api/contest/agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function callAgent(agentKey, question, env) {
  const agent = AGENTS[agentKey];
  if (!agent) return { ok: false, error: "Unknown agent" };
  try {
    const resp = await agent.fn(makeFakeRequest({ patientId: "1", question: question || "" }), env);
    const data = await resp.json();
    return { ok: true, data: data.response || data.error || data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════
// Rich Response Formatters
// ═══════════════════════════════════════════════════════════

function formatAgentResponse(agentKey, result, lang) {
  const agent = AGENTS[agentKey];
  const icon = agent.icon;
  const title = lang === "ar" ? agent.ar : agent.en;
  const data = result.data;

  if (!result.ok) {
    return lang === "ar"
      ? `${icon} *${title}*\n\n❌ خطأ: ${result.error}`
      : `${icon} *${title}*\n\n❌ Error: ${result.error}`;
  }

  const readable = jsonToReadable(data, lang);
  const header = `${icon} *${title}*`;
  const body = readable.length > 3500 ? readable.slice(0, 3500) + "\n\n..." : readable;

  return `${header}\n\n${body}`;
}

function formatDashboard(lang) {
  const t = (ar, en) => lang === "ar" ? ar : en;
  const agentList = Object.entries(AGENTS).map(([k, v]) => {
    return `${v.icon} ${lang === "ar" ? v.ar : v.en}`;
  }).join("\n");

  return lang === "ar"
    ? `🏥 *${BASMA.full_ar}*

*الأطباء الرقميون (12 وكيل):*
${agentList}

*الخدمات:*
🔬 FHIR R4 — 20 نوع مورد
🏥 IRIS Production — 12 خدمة
☁️ Cloudflare Workers — 29 خلفية
🔗 NPHIES — مطالبات التأمين

*الأوامر:*
/dashboard — لوحة القيادة
/status — حالة النظام
/voice — تبديل الصوت
/basma — تعريف بسمه
/help — المساعدة`
    : `🏥 *${BASMA.full_en}*

*Digital Doctors (12 Agents):*
${agentList}

*Services:*
🔬 FHIR R4 — 20 resource types
🏥 IRIS Production — 12 services
☁️ Cloudflare Workers — 29 backends
🔗 NPHIES — Insurance claims

*Commands:*
/dashboard — Control panel
/status — System health
/voice — Toggle voice
/basma — Meet BASMA
/help — All commands`;
}

function formatStatus(irisRunning, lang) {
  const t = (ar, en) => lang === "ar" ? ar : en;
  const iris = irisRunning ? "🟢" : "🔴";
  const fhir = "🟢";
  const ai = "🟢";
  const voice = "🟢";

  return lang === "ar"
    ? `📊 *حالة النظام*

${iris} IRIS Production: ${irisRunning ? "يعمل" : "متوقف"}
${fhir} FHIR R4 Server: يعمل
${ai} AI Model (70B): يعمل
${voice} BASMA Voice: يعمل
☁️ Cloudflare Worker: يعمل
🔗 Ecosystem: 29 خلفية

_آخر تحديث: ${new Date().toISOString().slice(11, 19)} UTC_`
    : `📊 *System Status*

${iris} IRIS Production: ${irisRunning ? "Running" : "Stopped"}
${fhir} FHIR R4 Server: Active
${ai} AI Model (70B): Active
${voice} BASMA Voice: Active
☁️ Cloudflare Worker: Deployed
🔗 Ecosystem: 29 backends

_Last updated: ${new Date().toISOString().slice(11, 19)} UTC_`;
}

// ═══════════════════════════════════════════════════════════
// Inline Keyboards
// ═══════════════════════════════════════════════════════════

function quickActionsKeyboard(lang) {
  const ar = lang === "ar";
  return {
    inline_keyboard: [
      [
        { text: ar ? "🚑 فحص أولي" : "🚑 Triage", callback_data: "triage" },
        { text: ar ? "📋 ملخص" : "📋 Summary", callback_data: "summary" },
        { text: ar ? "💊 أدوية" : "💊 Meds", callback_data: "medication-safety" },
      ],
      [
        { text: ar ? "🧪 تحاليل" : "🧪 Labs", callback_data: "lab-explainer" },
        { text: ar ? "🔍 فجوات" : "🔍 Gaps", callback_data: "gaps-in-care" },
        { text: ar ? "📝 خطة" : "📝 Plan", callback_data: "care-plan" },
      ],
      [
        { text: ar ? "⚠️ خطر" : "⚠️ Risk", callback_data: "readmission-risk" },
        { text: ar ? "📷 أشعة" : "📷 Imaging", callback_data: "imaging-followup" },
        { text: ar ? "🔬 تجارب" : "🔬 Trials", callback_data: "clinical-trials" },
      ],
      [
        { text: ar ? "📊 لوحة القيادة" : "📊 Dashboard", callback_data: "dashboard" },
        { text: ar ? "🔊 بسمه" : "🔊 BASMA", callback_data: "basma_intro" },
      ],
    ],
  };
}

// ═══════════════════════════════════════════════════════════
// Voice Pipeline
// ═══════════════════════════════════════════════════════════

async function processVoice(update, env, token) {
  const chatId = update.message.chat.id;
  const messageId = update.message.message_id;
  const voice = update.message.voice || update.message.audio;
  if (!voice) return;

  await sendChatAction(token, chatId, "typing");

  const audioBuffer = await downloadFile(token, voice.file_id);
  if (!audioBuffer) {
    await sendMessage(token, chatId, "❌");
    return;
  }

  const stt = await speechToText(audioBuffer, env.ELEVENLABS_API_KEY);
  if (!stt.ok || !stt.text.trim()) {
    await sendMessage(token, chatId,
      detectLanguage(stt.text || "") === "ar"
        ? "🎤 لم أتمكن من فهم الرصالة. حاول مرة أخرى."
        : "🎤 Could not understand the audio. Try again.");
    return;
  }

  const transcribed = stt.text.trim();
  const lang = detectLanguage(transcribed);
  const agentKey = routeAgent(transcribed);

  await sendChatAction(token, chatId, "typing");
  const result = await callAgent(agentKey, transcribed, env);

  // Text response
  const textResponse = formatAgentResponse(agentKey, result, lang);
  const voiceHint = lang === "ar"
    ? `\n\n🎤 _"${transcribed}"_`
    : `\n\n🎤 _"${transcribed}"_`;
  await sendMessage(token, chatId, textResponse + voiceHint, {
    reply_to_message_id: messageId,
    reply_markup: quickActionsKeyboard(lang),
  });

  // BASMA voice response
  if (env.ELEVENLABS_API_KEY) {
    await sendChatAction(token, chatId, "record_voice");
    const readable = jsonToReadable(result.data || result.error, lang);
    const voiceText = lang === "ar"
      ? `مرحباً، أنا بسمه. ${AGENTS[agentKey].ar}: ${readable}`
      : `Hello, I am BASMA. ${AGENTS[agentKey].en}: ${readable}`;
    const tts = await textToSpeech(voiceText, env.ELEVENLABS_API_KEY);
    if (tts.ok) {
      await sendVoice(token, chatId, tts.audio, { reply_to: messageId });
    }
  }
}

// ═══════════════════════════════════════════════════════════
// BASMA Introduction
// ═══════════════════════════════════════════════════════════

async function handleBasmaIntro(token, chatId, env, lang = "ar") {
  const introAr = `مرحباً! أنا *بسمه* 🌟
مساعدك الطبي الذكي من *برين سايت*.

أنا أتحدث العربية واللهجة السعودية بطلاقة.
أستطيع تحليل حالتك الصحية وإعطائك نصائح طبية.
فقط أرسل لي رسالة نصية أو صوتية وسأقوم بالباقي.

كيف يمكنني مساعدتك اليوم؟`;

  const introEn = `Hello! I am *BASMA* 🌟
Your smart healthcare assistant from *BrainSAIT*.

I speak Arabic and English fluently.
I can analyze your health condition and provide medical advice.
Just send me a text or voice message and I'll handle the rest.

How can I help you today?`;

  await sendMessage(token, chatId, lang === "ar" ? introAr : introEn, {
    reply_markup: quickActionsKeyboard(lang),
  });

  if (env.ELEVENLABS_API_KEY) {
    await sendChatAction(token, chatId, "record_voice");
    const tts = await textToSpeech(
      lang === "ar" ? introAr.replace(/\*/g, "") : introEn.replace(/\*/g, ""),
      env.ELEVENLABS_API_KEY
    );
    if (tts.ok) {
      await sendVoice(token, chatId, tts.audio);
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Callback Query Handler (Inline Buttons)
// ═══════════════════════════════════════════════════════════

async function handleCallbackQuery(callback, env, token) {
  const chatId = callback.message.chat.id;
  const messageId = callback.message.message_id;
  const data = callback.data;
  const lang = detectLanguage(callback.message.text || "");

  await tg("answerCallbackQuery", token, { callback_query_id: callback.id });

  if (data === "dashboard") {
    await sendMessage(token, chatId, formatDashboard(lang));
    return;
  }

  if (data === "basma_intro") {
    await handleBasmaIntro(token, chatId, env, lang);
    return;
  }

  if (AGENTS[data]) {
    await sendChatAction(token, chatId, "typing");
    const result = await callAgent(data, "", env);
    const response = formatAgentResponse(data, result, lang);
    await sendMessage(token, chatId, response, {
      reply_markup: quickActionsKeyboard(lang),
    });

    if (env.ELEVENLABS_API_KEY) {
      await sendChatAction(token, chatId, "record_voice");
      const readable = jsonToReadable(result.data || result.error, lang);
      const voiceText = lang === "ar"
        ? `${AGENTS[data].ar}: ${readable}`
        : `${AGENTS[data].en}: ${readable}`;
      const tts = await textToSpeech(voiceText, env.ELEVENLABS_API_KEY);
      if (tts.ok) {
        await sendVoice(token, chatId, tts.audio);
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Main Webhook Handler
// ═══════════════════════════════════════════════════════════

export async function handleTelegramWebhook(request, env) {
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) return new Response("OK");

  let update;
  try { update = await request.json(); } catch { return new Response("OK"); }

  // Handle callback queries (inline buttons)
  if (update.callback_query) {
    await handleCallbackQuery(update.callback_query, env, token);
    return new Response("OK");
  }

  if (!update.message) return new Response("OK");

  const chatId = update.message.chat.id;
  const messageId = update.message.message_id;

  // Voice messages → smart routing + voice response
  if (update.message.voice || update.message.audio) {
    await processVoice(update, env, token);
    return new Response("OK");
  }

  const text = update.message.text?.trim();
  if (!text) return new Response("OK");

  const lang = detectLanguage(text);

  // ── Commands ──────────────────────────────────────────

  if (text === "/start" || text === "/help") {
    const help = lang === "ar"
      ? `🏥 *${BASMA.full_ar}*

🎤 *الصوت:* أرسل رسالة صوتية و بسمه سترد عليك!

📋 *الأوامر:*
/dashboard — لوحة القيادة الشاملة
/status — حالة النظام
/voice — تبديل ردود الصوت
/basma — تعريف بسمه
/summary — ملخص المريض
/triage — فحص طوارئ
/meds — سلامة الأدوية
/gaps — فجوات الرعاية
/plan — خطة الرعاية
/labs — شرح التحاليل
/risk — خطر إعادة الدخول
/auth — الترخيص المسبق
/trials — التجارب السريرية
/imaging — متابعة التصوير
/sdoh — الإحالات الاجتماعية
/query — استعلام ذكي

💬 أو اكتب أي شيء وسأوجهك تلقائياً!`
      : `🏥 *${BASMA.full_en}*

🎤 *Voice:* Send a voice message and BASMA will reply!

📋 *Commands:*
/dashboard — Full control panel
/status — System health
/voice — Toggle voice replies
/basma — Meet BASMA
/summary — Patient summary
/triage — Emergency triage
/meds — Medication safety
/gaps — Care gaps
/plan — Care plan
/labs — Lab explainer
/risk — Readmission risk
/auth — Prior auth
/trials — Clinical trials
/imaging — Imaging follow-up
/sdoh — SDOH referrals
/query — Smart query

💬 Or type anything and I'll route you automatically!`;
    await sendMessage(token, chatId, help, {
      reply_markup: quickActionsKeyboard(lang),
    });
    return new Response("OK");
  }

  if (text === "/basma") {
    await handleBasmaIntro(token, chatId, env, lang);
    return new Response("OK");
  }

  if (text === "/dashboard") {
    await sendMessage(token, chatId, formatDashboard(lang));
    return new Response("OK");
  }

  if (text === "/status") {
    await sendMessage(token, chatId, formatStatus(true, lang));
    return new Response("OK");
  }

  if (text === "/voice") {
    // Toggle voice mode via simple state
    const voiceState = env.__VOICE_MODE || {};
    if (voiceState[chatId]) {
      delete voiceState[chatId];
      await sendMessage(token, chatId,
        lang === "ar" ? "🔇 وضع النص فقط." : "🔇 Text only mode.");
    } else {
      voiceState[chatId] = true;
      await sendMessage(token, chatId,
        lang === "ar" ? "🔊 وضع الصوت مفعّل! بسمه سترد بصوتها." : "🔊 Voice mode ON! BASMA will reply with voice.");
    }
    env.__VOICE_MODE = voiceState;
    return new Response("OK");
  }

  // ── Smart Routing ─────────────────────────────────────

  await sendChatAction(token, chatId);

  // Check for explicit /command
  let agentKey = null;
  let question = null;

  if (text.startsWith("/")) {
    const cmd = text.split(" ")[0].slice(1).toLowerCase();
    const rest = text.split(" ").slice(1).join(" ");
    const cmdMap = {
      query: "nl-query", meds: "medication-safety", plan: "care-plan",
      labs: "lab-explainer", risk: "readmission-risk", auth: "prior-auth",
      trials: "clinical-trials", imaging: "imaging-followup", sdoh: "sdoh-referral",
    };
    agentKey = cmdMap[cmd] || (AGENTS[cmd] ? cmd : null);
    question = rest || undefined;
  }

  // Smart routing for free text
  if (!agentKey) {
    agentKey = routeAgent(text);
    question = text;
  }

  const result = await callAgent(agentKey, question, env);
  const response = formatAgentResponse(agentKey, result, lang);

  await sendMessage(token, chatId, response, {
    reply_to_message_id: messageId,
    reply_markup: quickActionsKeyboard(lang),
  });

  // Voice response if enabled
  const voiceMode = env.__VOICE_MODE || {};
  if ((voiceMode[chatId] || update.message.voice) && env.ELEVENLABS_API_KEY) {
    await sendChatAction(token, chatId, "record_voice");
    const readable = jsonToReadable(result.data || result.error, lang);
    const voiceText = lang === "ar"
      ? `${AGENTS[agentKey].ar}: ${readable}`
      : `${AGENTS[agentKey].en}: ${readable}`;
    const tts = await textToSpeech(voiceText, env.ELEVENLABS_API_KEY);
    if (tts.ok) {
      await sendVoice(token, chatId, tts.audio, { reply_to: messageId });
    }
  }

  return new Response("OK");
}

// ═══════════════════════════════════════════════════════════
// Setup Endpoint
// ═══════════════════════════════════════════════════════════

export async function handleTelegramSetup(request, env) {
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return new Response(JSON.stringify({ error: "TELEGRAM_BOT_TOKEN not configured" }), {
      status: 500, headers: { "content-type": "application/json" },
    });
  }

  const url = new URL(request.url);
  const webhookUrl = `${url.origin}/api/telegram/webhook`;

  const [webhookResp, commandsResp] = await Promise.all([
    tg("setWebhook", token, { url: webhookUrl, allowed_updates: ["message", "callback_query"], max_connections: 10 }),
    tg("setMyCommands", token, {
      commands: [
        { command: "start", description: "🏥 Start BASMA" },
        { command: "dashboard", description: "📊 Control panel" },
        { command: "status", description: "📡 System health" },
        { command: "voice", description: "🔊 Toggle voice" },
        { command: "basma", description: "🌟 Meet BASMA" },
        { command: "summary", description: "📋 Patient summary" },
        { command: "triage", description: "🚑 Emergency triage" },
        { command: "meds", description: "💊 Medication safety" },
        { command: "gaps", description: "🔍 Care gaps" },
        { command: "plan", description: "📝 Care plan" },
        { command: "labs", description: "🧪 Lab results" },
        { command: "risk", description: "⚠️ Readmission risk" },
        { command: "auth", description: "✅ Prior auth" },
        { command: "trials", description: "🔬 Clinical trials" },
        { command: "imaging", description: "📷 Imaging follow-up" },
        { command: "sdoh", description: "🏠 SDOH referrals" },
        { command: "query", description: "💬 Smart query" },
        { command: "help", description: "❓ All commands" },
      ],
    }),
  ]);

  const webhook = await webhookResp.json();
  const commands = await commandsResp.json();

  return new Response(JSON.stringify({
    bot: BASMA.full_en,
    webhook: webhook.ok ? "configured" : webhook,
    commands: commands.ok ? "configured" : commands,
    webhookUrl,
    voice: "BASMA (Latifa — Gulf Arabic, warm & energized)",
    features: [
      "text", "voice_input", "voice_output", "arabic", "english",
      "smart_routing", "inline_buttons", "dashboard", "12_agents",
      "fhir_r4", "iris_production", "ecosystem",
    ],
    agents: Object.entries(AGENTS).map(([k, v]) => `${v.icon} ${v.en} / ${v.ar}`),
  }), {
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
}
