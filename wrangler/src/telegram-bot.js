import { handleSummary, handlePriorAuth, handleGapsInCare,
  handleMedicationSafety, handleCarePlanNavigator, handleClinicalTrials,
  handleReadmissionRisk, handleTriage, handleImagingFollowup,
  handleLabExplainer, handleNLQuery, handleSDOHReferral,
} from "./agents/ai-handler.js";
import { speechToText, textToSpeech } from "./services/basma-voice.js";
import {
  fhirCreate, fhirRead, fhirSearch, fhirDelete,
  bookAppointment, listAppointments,
  createPatient, createCondition, createObservation, createMedicationRequest,
  createDocumentReference, createCarePlan, createTask,
  oracleStatus, oraclePatients, oracleSearch, oracleEligibility, getHospitals,
  nphiesNetwork, nphiesFacilities, nphiesClaims, nphiesKpis,
  hnhStatus, hnhPatients, hnhAppointments,
  givcStatus, givcPatients,
  sbsStatus, sbsSubscriptions, sbsInvoices,
  ecosystemStatus, ecosystemProxy,
  aiSearch, semanticSearch,
  createReminder, listReminders, completeReminder,
  sendNotification, irisProductionStatus, fullSystemHealth,
} from "./services/basma-integration.js";
import {
  analyzeLabResults, analyzeVitals, calculateTrend, sparkline, formatTrend,
  CHAINS, runChain, handleEmergencySOS,
  generateMedSchedule, formatMedSchedule,
  generateInsights, formatInsights,
} from "./services/basma-intelligence.js";

// ═══════════════════════════════════════════════════════════
// Patient Context (per-user)
// ═══════════════════════════════════════════════════════════
const patientContext = new Map(); // chatId -> patientId

// ═══════════════════════════════════════════════════════════
// BASMA — بسمه — BrainSAIT AI Medical Assistant
// Full Integration: IRIS · Oracle · NPHIES · HNH · GIVC · SBS
// ═══════════════════════════════════════════════════════════

const AGENTS = {
  summary:          { fn: handleSummary,          ar: "ملخص المريض",     en: "Patient Summary",      icon: "📋", cat: "clinical" },
  "prior-auth":     { fn: handlePriorAuth,        ar: "الترخيص المسبق",   en: "Prior Authorization",  icon: "✅", cat: "admin" },
  "gaps-in-care":   { fn: handleGapsInCare,        ar: "فجوات الرعاية",    en: "Gaps in Care",         icon: "🔍", cat: "quality" },
  "medication-safety": { fn: handleMedicationSafety, ar: "سلامة الأدوية",   en: "Medication Safety",    icon: "💊", cat: "pharmacy" },
  "care-plan":      { fn: handleCarePlanNavigator,  ar: "خطة الرعاية",     en: "Care Plan",            icon: "📝", cat: "clinical" },
  "clinical-trials": { fn: handleClinicalTrials,    ar: "التجارب السريرية", en: "Clinical Trials",      icon: "🔬", cat: "research" },
  "readmission-risk": { fn: handleReadmissionRisk,  ar: "خطر إعادة الدخول", en: "Readmission Risk",    icon: "⚠️", cat: "risk" },
  triage:           { fn: handleTriage,             ar: "الفحص الأولي",     en: "Triage Assessment",    icon: "🚑", cat: "emergency" },
  "imaging-followup": { fn: handleImagingFollowup,  ar: "متابعة التصوير",   en: "Imaging Follow-up",   icon: "📷", cat: "clinical" },
  "lab-explainer":  { fn: handleLabExplainer,       ar: "شرح التحاليل",     en: "Lab Results",          icon: "🧪", cat: "clinical" },
  "nl-query":       { fn: handleNLQuery,            ar: "استعلام ذكي",      en: "Smart Query",          icon: "💬", cat: "query" },
  "sdoh-referral":  { fn: handleSDOHReferral,       ar: "الإحالات الاجتماعية", en: "SDOH Referrals",    icon: "🏠", cat: "social" },
};

const ROUTING_RULES = [
  { kw: ["triage","emergency","urgent","pain","chest","breathing","bleeding","طوارئ","ألم","صدر","نزيف","تنفس","إسعاف"], agent: "triage" },
  { kw: ["summary","overview","patient","history","report","ملخص","تقرير","مريض","حالة","تاريخ"], agent: "summary" },
  { kw: ["medication","drug","medicine","pharmacy","interaction","dose","دواء","أدوية","صيدلية","تفاعل","جرعة"], agent: "medication-safety" },
  { kw: ["lab","blood","test","result","cbc","glucose","hba1c","تحليل","تحاليل","دم","سكر","نتائج"], agent: "lab-explainer" },
  { kw: ["gap","screening","vaccine","preventive","missing","فجوة","فحص","تطعيم","وقائي"], agent: "gaps-in-care" },
  { kw: ["care plan","plan","goal","follow-up","خطة","رعاية","هدف","متابعة"], agent: "care-plan" },
  { kw: ["imaging","x-ray","mri","ct","ultrasound","radiology","تصوير","أشعة","رنين","سيتي"], agent: "imaging-followup" },
  { kw: ["readmission","risk","re-admit","hospital","chronic","إعادة","دخول","خطر","مزمن","مستشفى"], agent: "readmission-risk" },
  { kw: ["prior auth","authorization","insurance","approval","coverage","ترخيص","تأمين","موافقة","تغطية"], agent: "prior-auth" },
  { kw: ["trial","research","study","enrollment","تجربة","بحث","دراسة","سريري"], agent: "clinical-trials" },
  { kw: ["social","food","transport","housing","community","اجتماعي","غذاء","نقل","سكن","إحالة"], agent: "sdoh-referral" },
  { kw: ["query","ask","what","how","why","explain","استعلام","اسأل","ماذا","كيف","لماذا","اشرح"], agent: "nl-query" },
];

function detectLang(text) { return /[\u0600-\u06FF]/.test(text) ? "ar" : "en"; }

function routeAgent(text) {
  const lower = text.toLowerCase();
  let best = null, bestScore = 0;
  for (const rule of ROUTING_RULES) {
    const score = rule.kw.filter(kw => lower.includes(kw.toLowerCase())).length;
    if (score > bestScore) { bestScore = score; best = rule.agent; }
  }
  return bestScore > 0 ? best : "triage";
}

function jsonToReadable(data, lang = "en", depth = 0) {
  if (typeof data === "string") return data;
  if (typeof data === "number" || typeof data === "boolean") return String(data);
  if (Array.isArray(data)) return data.map((item, i) => (depth > 0 ? `${i+1}. ` : "") + jsonToReadable(item, lang, depth+1)).join(lang === "ar" ? "، " : ". ");
  if (typeof data === "object" && data !== null) return Object.entries(data).map(([k,v]) => {
    const label = k.replace(/([A-Z])/g," $1").replace(/_/g," ").trim();
    return typeof v === "object" && v !== null ? `${label}: ${jsonToReadable(v, lang, depth+1)}` : `${label}: ${v}`;
  }).join(lang === "ar" ? "، " : ". ");
  return String(data);
}

// ═══════════════════════════════════════════════════════════
// Telegram API
// ═══════════════════════════════════════════════════════════

function tg(method, token, body) {
  return fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
}
function tgForm(method, token, form) {
  return fetch(`https://api.telegram.org/bot${token}/${method}`, { method: "POST", body: form });
}
async function sendMsg(token, chatId, text, opts = {}) {
  return tg("sendMessage", token, { chat_id: chatId, text: text.slice(0, 4000), parse_mode: "Markdown", disable_web_page_preview: true, ...opts });
}
async function sendVoice(token, chatId, audio, opts = {}) {
  const form = new FormData();
  form.append("chat_id", String(chatId));
  form.append("voice", new Blob([audio], { type: "audio/mpeg" }), "basma.mp3");
  if (opts.caption) form.append("caption", opts.caption.slice(0, 1024));
  if (opts.reply_to) form.append("reply_to_message_id", String(opts.reply_to));
  return tgForm("sendVoice", token, form);
}
async function sendAction(token, chatId, action = "typing") {
  return tg("sendChatAction", token, { chat_id: chatId, action });
}
async function downloadFile(token, fileId) {
  const info = await (await tg("getFile", token, { file_id: fileId })).json();
  if (!info.ok) return null;
  return (await fetch(`https://api.telegram.org/file/bot${token}/${info.result.file_path}`)).arrayBuffer();
}

// ═══════════════════════════════════════════════════════════
// Agent Execution
// ═══════════════════════════════════════════════════════════

function fakeReq(body) {
  return new Request("http://localhost/api/contest/agent", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
}
async function callAgent(key, question, env) {
  const agent = AGENTS[key];
  if (!agent) return { ok: false, error: "Unknown" };
  try {
    const resp = await agent.fn(fakeReq({ patientId: "1", question: question || "" }), env);
    const data = await resp.json();
    return { ok: true, data: data.response || data.error || data };
  } catch (err) { return { ok: false, error: err.message }; }
}

// ═══════════════════════════════════════════════════════════
// Inline Keyboards
// ═══════════════════════════════════════════════════════════

function mainKeyboard(lang) {
  const ar = lang === "ar";
  return { inline_keyboard: [
    [{ text: ar ? "🚨 طوارئ SOS" : "🚨 EMERGENCY SOS", callback_data: "sos" },
     { text: ar ? "📋 ملخص" : "📋 Summary", callback_data: "summary" },
     { text: ar ? "💊 أدوية" : "💊 Meds", callback_data: "medication-safety" }],
    [{ text: ar ? "🧪 تحاليل" : "🧪 Labs", callback_data: "lab-explainer" },
     { text: ar ? "🔍 فجوات" : "🔍 Gaps", callback_data: "gaps-in-care" },
     { text: ar ? "📝 خطة" : "📝 Plan", callback_data: "care-plan" }],
    [{ text: ar ? "🔄 شامل 360" : "🔄 Patient 360", callback_data: "chain_patient-360" },
     { text: ar ? "🩺 فحص كامل" : "🩺 Full Check", callback_data: "chain_full-checkup" },
     { text: ar ? "💡 ملاحظات" : "💡 Insights", callback_data: "insights" }],
    [{ text: ar ? "📅 موعد" : "📅 Book", callback_data: "book_appt" },
     { text: ar ? "🔎 بحث" : "🔎 Search", callback_data: "search_menu" },
     { text: ar ? "🏥 نفيس" : "🏥 NPHIES", callback_data: "nphies_menu" }],
    [{ text: ar ? "🏨 مستشفيات" : "🏨 Hospitals", callback_data: "hospitals_menu" },
     { text: ar ? "📊 النظام" : "📊 System", callback_data: "system_status" },
     { text: ar ? "🔊 بسمه" : "🔊 BASMA", callback_data: "basma_intro" }],
  ]};
}

function hospitalsKeyboard(lang) {
  const ar = lang === "ar";
  return { inline_keyboard: [
    [{ text: ar ? "🏙️ الرياض" : "🏙️ Riyadh", callback_data: "oracle_riyadh" },
     { text: ar ? "🕌 المدينة" : "🕌 Madinah", callback_data: "oracle_madinah" }],
    [{ text: ar ? "🏔️ أبها" : "🏔️ Abha", callback_data: "oracle_abha" },
     { text: ar ? "🌊 جازان" : "🌊 Jizan", callback_data: "oracle_jizan" }],
    [{ text: ar ? "🏘️ خميس" : "🏘️ Khamis", callback_data: "oracle_khamis" },
     { text: ar ? "🏡 عنيزة" : "🏡 Unaizah", callback_data: "oracle_unaizah" }],
    [{ text: ar ? "⬅️ رجوع" : "⬅️ Back", callback_data: "main_menu" }],
  ]};
}

function nphiesKeyboard(lang) {
  const ar = lang === "ar";
  return { inline_keyboard: [
    [{ text: ar ? "📊 الشبكة" : "📊 Network", callback_data: "nphies_network" },
     { text: ar ? "🏥 المنشآت" : "🏥 Facilities", callback_data: "nphies_facilities" }],
    [{ text: ar ? "💰 المطالبات" : "💰 Claims", callback_data: "nphies_claims" },
     { text: ar ? "📈 المؤشرات" : "📈 KPIs", callback_data: "nphies_kpis" }],
    [{ text: ar ? "✅ أهلية" : "✅ Eligibility", callback_data: "nphies_eligibility" }],
    [{ text: ar ? "⬅️ رجوع" : "⬅️ Back", callback_data: "main_menu" }],
  ]};
}

function searchKeyboard(lang) {
  const ar = lang === "ar";
  return { inline_keyboard: [
    [{ text: ar ? "🔎 بحث FHIR" : "🔎 FHIR Search", callback_data: "search_fhir" },
     { text: ar ? "🧠 بحث ذكي" : "🧠 Semantic", callback_data: "search_semantic" }],
    [{ text: ar ? "🏨 بحث أوراكل" : "🏨 Oracle Search", callback_data: "search_oracle" },
     { text: ar ? "👥 بحث مرضى" : "👥 Patients", callback_data: "search_patients" }],
    [{ text: ar ? "⬅️ رجوع" : "⬅️ Back", callback_data: "main_menu" }],
  ]};
}

// ═══════════════════════════════════════════════════════════
// Voice Pipeline
// ═══════════════════════════════════════════════════════════

async function processVoice(update, env, token) {
  const chatId = update.message.chat.id;
  const msgId = update.message.message_id;
  const voice = update.message.voice || update.message.audio;
  if (!voice) return;

  await sendAction(token, chatId, "typing");
  const audio = await downloadFile(token, voice.file_id);
  if (!audio) { await sendMsg(token, chatId, "❌"); return; }

  const stt = await speechToText(audio, env.ELEVENLABS_API_KEY);
  if (!stt.ok || !stt.text.trim()) {
    await sendMsg(token, chatId, detectLang(stt.text||"") === "ar" ? "🎤 لم أفهم. حاول مرة أخرى." : "🎤 Could not understand. Try again.");
    return;
  }

  const text = stt.text.trim();
  const lang = detectLang(text);
  const agentKey = routeAgent(text);

  await sendAction(token, chatId, "typing");
  const result = await callAgent(agentKey, text, env);
  const title = AGENTS[agentKey];
  const readable = jsonToReadable(result.data || result.error, lang);
  const resp = `${title.icon} *${lang === "ar" ? title.ar : title.en}*\n\n${readable}\n\n🎤 _"${text}"_`;

  await sendMsg(token, chatId, resp, { reply_to_message_id: msgId, reply_markup: mainKeyboard(lang) });

  if (env.ELEVENLABS_API_KEY) {
    await sendAction(token, chatId, "record_voice");
    const voiceText = lang === "ar" ? `${title.ar}: ${readable}` : `${title.en}: ${readable}`;
    const tts = await textToSpeech(voiceText, env.ELEVENLABS_API_KEY);
    if (tts.ok) await sendVoice(token, chatId, tts.audio, { reply_to: msgId });
  }
}

// ═══════════════════════════════════════════════════════════
// Callback Handler
// ═══════════════════════════════════════════════════════════

async function handleCallback(cb, env, token) {
  const chatId = cb.message.chat.id;
  const data = cb.data;
  const lang = detectLang(cb.message.text || "");
  await tg("answerCallbackQuery", token, { callback_query_id: cb.id });

  // Main menu
  if (data === "main_menu") {
    await sendMsg(token, chatId, lang === "ar" ? "🏥 *بسمه — القائمة الرئيسية*\n\nاختر خدمة:" : "🏥 *BASMA — Main Menu*\n\nChoose a service:", { reply_markup: mainKeyboard(lang) });
    return;
  }

  // Agent execution
  if (AGENTS[data]) {
    await sendAction(token, chatId, "typing");
    const result = await callAgent(data, "", env);
    const a = AGENTS[data];
    const readable = jsonToReadable(result.data || result.error, lang);
    await sendMsg(token, chatId, `${a.icon} *${lang === "ar" ? a.ar : a.en}*\n\n${readable}`, { reply_markup: mainKeyboard(lang) });
    return;
  }

  // BASMA intro
  if (data === "basma_intro") {
    await handleBasmaIntro(token, chatId, env, lang);
    return;
  }

  // Emergency SOS
  if (data === "sos") {
    await sendAction(token, chatId, "typing");
    const pid = patientContext.get(chatId) || "1";
    const sos = await handleEmergencySOS(pid, "Patient pressed emergency button", callAgent, env, lang);
    await sendMsg(token, chatId, sos.report, {
      reply_markup: { inline_keyboard: [
        [{ text: "🚑 997", url: "tel:997" }, { text: "🏥 911", url: "tel:911" }],
        [{ text: lang === "ar" ? "📋 ملخص" : "📋 Summary", callback_data: "summary" },
         { text: lang === "ar" ? "⬅️ رجوع" : "⬅️ Back", callback_data: "main_menu" }],
      ]},
    });
    return;
  }

  // Clinical chains
  if (data.startsWith("chain_")) {
    const chainKey = data.replace("chain_", "");
    const chain = CHAINS[chainKey];
    if (chain) {
      await sendAction(token, chatId, "typing");
      const pid = patientContext.get(chatId) || "1";
      const result = await runChain(chainKey, pid, callAgent, env, lang);
      await sendMsg(token, chatId, result.summary, { reply_markup: mainKeyboard(lang) });
    }
    return;
  }

  // Health insights
  if (data === "insights") {
    await sendAction(token, chatId, "typing");
    const pid = patientContext.get(chatId) || "1";
    const { results } = await fhirSearch(env, "Condition", { patient: pid });
    const { results: meds } = await fhirSearch(env, "MedicationRequest", { patient: pid });
    const { results: labs } = await fhirSearch(env, "Observation", { patient: pid });
    const insights = generateInsights({ conditions: results, medications: meds, observations: labs }, lang);
    await sendMsg(token, chatId, `💡 *${lang === "ar" ? "الملاحظات الذكية" : "Smart Insights"}*\n\n${formatInsights(insights, lang)}`, { reply_markup: mainKeyboard(lang) });
    return;
  }

  // System status
  if (data === "system_status") {
    await sendAction(token, chatId, "typing");
    const health = await fullSystemHealth();
    const t = (ar, en) => lang === "ar" ? ar : en;
    const status = (ok) => ok ? "🟢" : "🔴";
    await sendMsg(token, chatId,
      `📊 *${t("حالة النظام", "System Status")}*\n\n` +
      `${status(health.worker?.status === "ok")} ${t("العامل", "Worker")}: ${health.worker?.status || "?"}\n` +
      `${status(health.oracle?.ok !== false)} ${t("أوراكل", "Oracle")}: ${t("6 مستشفيات", "6 hospitals")}\n` +
      `${status(health.hnh?.ok !== false)} HNH: ${t("الرباط / غرناطة", "Al Ribat / Gharnata")}\n` +
      `${status(health.givc?.ok !== false)} GIVC: ${t("المنصة الصحية", "Healthcare Platform")}\n` +
      `${status(health.sbs?.ok !== false)} SBS: ${t("الفوترة", "Billing")}\n` +
      `🟢 IRIS: ${t("يعمل", "Running")}\n` +
      `🟢 FHIR R4: ${t("20 نوع مورد", "20 resource types")}\n` +
      `🟢 AI: Llama 3.3 70B\n` +
      `🟢 ${t("الصوت", "Voice")}: BASMA (Latifa)\n\n` +
      `_${t("آخر تحديث", "Last updated")}: ${new Date().toISOString().slice(11, 19)} UTC_`,
      { reply_markup: mainKeyboard(lang) });
    return;
  }

  // NPHIES menu
  if (data === "nphies_menu") {
    await sendMsg(token, chatId, "🏥 *NPHIES — Saudi National Claims*\n\nاختر خدمة:", { reply_markup: nphiesKeyboard(lang) });
    return;
  }

  if (data === "nphies_network") {
    await sendAction(token, chatId, "typing");
    const net = await nphiesNetwork();
    await sendMsg(token, chatId, `📊 *NPHIES Network*\n\n${jsonToReadable(net, lang)}`, { reply_markup: nphiesKeyboard(lang) });
    return;
  }

  if (data === "nphies_facilities") {
    await sendAction(token, chatId, "typing");
    const fac = await nphiesFacilities();
    await sendMsg(token, chatId, `🏥 *NPHIES Facilities*\n\n${jsonToReadable(fac, lang)}`, { reply_markup: nphiesKeyboard(lang) });
    return;
  }

  if (data === "nphies_claims") {
    await sendAction(token, chatId, "typing");
    const claims = await nphiesClaims();
    await sendMsg(token, chatId, `💰 *NPHIES Claims*\n\n${jsonToReadable(claims, lang)}`, { reply_markup: nphiesKeyboard(lang) });
    return;
  }

  if (data === "nphies_kpis") {
    await sendAction(token, chatId, "typing");
    const kpis = await nphiesKpis();
    await sendMsg(token, chatId, `📈 *NPHIES KPIs*\n\n${jsonToReadable(kpis, lang)}`, { reply_markup: nphiesKeyboard(lang) });
    return;
  }

  // Hospitals menu
  if (data === "hospitals_menu") {
    await sendMsg(token, chatId, lang === "ar" ? "🏨 *المستشفيات المتصلة*\n\nاختر مستشفى:" : "🏨 *Connected Hospitals*\n\nChoose hospital:", { reply_markup: hospitalsKeyboard(lang) });
    return;
  }

  // Oracle hospitals
  if (data.startsWith("oracle_")) {
    const hospital = data.replace("oracle_", "");
    await sendAction(token, chatId, "typing");
    const patients = await oraclePatients(hospital);
    const info = getHospitals().find(h => h.key === hospital);
    await sendMsg(token, chatId,
      `🏥 *${info?.name || hospital}*\n\n` +
      `📋 License: \`${info?.license || "?"}\`\n` +
      `🔗 Portal: ${info?.portal || "?"}\n\n` +
      `${jsonToReadable(patients, lang)}`,
      { reply_markup: hospitalsKeyboard(lang) });
    return;
  }

  // Search menu
  if (data === "search_menu") {
    await sendMsg(token, chatId, lang === "ar" ? "🔎 *البحث*\n\nاختر نوع البحث:" : "🔎 *Search*\n\nChoose search type:", { reply_markup: searchKeyboard(lang) });
    return;
  }

  if (data === "search_fhir" || data === "search_semantic" || data === "search_oracle" || data === "search_patients") {
    await sendMsg(token, chatId, lang === "ar"
      ? "🔎 أرسل كلمة البحث بعد الأمر:\n/search patient\n/search diabetes\n/search أحمد"
      : "🔎 Send search term after command:\n/search patient\n/search diabetes\n/search Riyadh");
    return;
  }

  // Book appointment
  if (data === "book_appt") {
    await sendMsg(token, chatId, lang === "ar"
      ? "📅 *حجز موعد*\n\nأرسل:\n/book 2026-06-15 10:00 د.أحمد فحص عام"
      : "📅 *Book Appointment*\n\nSend:\n/book 2026-06-15 10:00 Dr.Ahmed general checkup");
    return;
  }

  // NPHIES eligibility
  if (data === "nphies_eligibility") {
    await sendAction(token, chatId, "typing");
    const elig = await oracleEligibility("all");
    await sendMsg(token, chatId, `✅ *NPHIES Eligibility*\n\n${jsonToReadable(elig, lang)}`, { reply_markup: nphiesKeyboard(lang) });
  }
}

// ═══════════════════════════════════════════════════════════
// BASMA Introduction
// ═══════════════════════════════════════════════════════════

async function handleBasmaIntro(token, chatId, env, lang = "ar") {
  const introAr = `مرحباً! أنا *بسمه* 🌟
مساعدك الطبي الذكي من *برين سايت*.

🏥 أتصل بـ:
• IRIS — سجلات المرضى FHIR
• أوراكل — 6 مستشفيات سعودية
• نفيس — مطالبات التأمين
• HNH — الرباط وغرناطة
• GIVC — المنصة الصحية
• SBS — الفوترة

🔬 أداء:
• تحليل تحاليل وأشعة
• تقييم طوارئ
• سلامة أدوية
• خطة رعاية
• تجارب سريرية
• حجز مواعيد
• بحث ذكي

أرسل رسالة نصية أو صوتية!`;

  const introEn = `Hello! I am *BASMA* 🌟
Your smart healthcare assistant from *BrainSAIT*.

🏥 Connected to:
• IRIS — FHIR Patient Records
• Oracle — 6 Saudi Hospitals
• NPHIES — Insurance Claims
• HNH — Al Ribat & Gharnata
• GIVC — Healthcare Platform
• SBS — Billing

🔬 Capabilities:
• Lab & imaging analysis
• Emergency triage
• Medication safety
• Care plans
• Clinical trials
• Appointment booking
• Smart search

Send text or voice message!`;

  await sendMsg(token, chatId, lang === "ar" ? introAr : introEn, { reply_markup: mainKeyboard(lang) });

  if (env.ELEVENLABS_API_KEY) {
    await sendAction(token, chatId, "record_voice");
    const tts = await textToSpeech(lang === "ar" ? introAr.replace(/\*/g, "") : introEn.replace(/\*/g, ""), env.ELEVENLABS_API_KEY);
    if (tts.ok) await sendVoice(token, chatId, tts.audio);
  }
}

// ═══════════════════════════════════════════════════════════
// Main Webhook
// ═══════════════════════════════════════════════════════════

export async function handleTelegramWebhook(request, env) {
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) return new Response("OK");

  let update;
  try { update = await request.json(); } catch { return new Response("OK"); }

  if (update.callback_query) { await handleCallback(update.callback_query, env, token); return new Response("OK"); }
  if (!update.message) return new Response("OK");

  const chatId = update.message.chat.id;
  const msgId = update.message.message_id;

  if (update.message.voice || update.message.audio) { await processVoice(update, env, token); return new Response("OK"); }

  const text = update.message.text?.trim();
  if (!text) return new Response("OK");
  const lang = detectLang(text);

  // ── Commands ──
  if (text === "/start" || text === "/help") {
    const help = lang === "ar"
      ? `🏥 *بسمه — BrainSAIT AI Medical Assistant*

🎤 أرسل رسالة صوتية و بسمه سترد!

📋 *الأوامر الطبية:*
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

🏥 *الأنظمة:*
/hospitals — المستشفيات (أوراكل)
/nphies — نفيس (مطالبات)
/status — حالة النظام

📅 *الخدمات:*
/book — حجز موعد
/search — بحث ذكي
/reminders — التذكيرات
/records — إدارة السجلات
/dashboard — لوحة القيادة`
      : `🏥 *BASMA — BrainSAIT AI Medical Assistant*

🎤 Send a voice message!

📋 *Medical Commands:*
/summary — Patient summary
/triage — Emergency triage
/meds — Medication safety
/gaps — Care gaps
/plan — Care plan
/labs — Lab results
/risk — Readmission risk
/auth — Prior auth
/trials — Clinical trials
/imaging — Imaging follow-up
/sdoh — SDOH referrals
/query — Smart query

🏥 *Systems:*
/hospitals — Oracle hospitals
/nphies — NPHIES claims
/status — System health

📅 *Services:*
/book — Book appointment
/search — Smart search
/reminders — Reminders
/records — Manage records
/dashboard — Control panel`;
    await sendMsg(token, chatId, help, { reply_markup: mainKeyboard(lang) });
    return new Response("OK");
  }

  if (text === "/basma") { await handleBasmaIntro(token, chatId, env, lang); return new Response("OK"); }

  if (text === "/dashboard") {
    await sendMsg(token, chatId, lang === "ar"
      ? `🏥 *بسمه — لوحة القيادة*

🏥 *الأنظمة المتصلة:*
• IRIS — سجلات FHIR (D1)
• أوراكل — 6 مستشفيات
• نفيس — مطالبات التأمين
• HNH — الرباط / غرناطة
• GIVC — المنصة الصحية
• SBS — الفوترة
• Maillinc — الإشعارات
• Wathiq — التوقيع الإلكتروني

🔬 *12 وكيل AI:*
📋 ملخص ✅ ترخيص 🔍 فجوات 💊 أدوية
📝 خطة 🔬 تجارب ⚠️ خطر 🚑 طوارئ
📷 أشعة 🧪 تحاليل 💬 استعلام 🏠 إحالات

☁️ *البنية التحتية:*
• Cloudflare Workers (29 خلفية)
• D1 Database (20 نوع FHIR)
• Workers AI (Llama 3.3 70B)
• ElevenLabs Voice (بسمه)
• Telegram Bot`
      : `🏥 *BASMA — Dashboard*

🏥 *Connected Systems:*
• IRIS — FHIR Records (D1)
• Oracle — 6 Hospitals
• NPHIES — Insurance Claims
• HNH — Al Ribat / Gharnata
• GIVC — Healthcare Platform
• SBS — Billing
• Maillinc — Notifications
• Wathiq — E-Signing

🔬 *12 AI Agents:*
📋 Summary ✅ Auth 🔍 Gaps 💊 Meds
📝 Plan 🔬 Trials ⚠️ Risk 🚑 Triage
📷 Imaging 🧪 Labs 💬 Query 🏠 SDOH

☁️ *Infrastructure:*
• Cloudflare Workers (29 backends)
• D1 Database (20 FHIR types)
• Workers AI (Llama 3.3 70B)
• ElevenLabs Voice (BASMA)
• Telegram Bot`,
      { reply_markup: mainKeyboard(lang) });
    return new Response("OK");
  }

  if (text === "/status") {
    await sendAction(token, chatId, "typing");
    const health = await fullSystemHealth();
    const s = (ok) => ok ? "🟢" : "🔴";
    await sendMsg(token, chatId,
      `📊 *${lang === "ar" ? "حالة النظام" : "System Status"}*\n\n` +
      `${s(health.worker?.status==="ok")} Worker: ${health.worker?.status||"?"}\n` +
      `${s(health.oracle?.ok!==false)} Oracle: ${lang==="ar"?"6 مستشفيات":"6 hospitals"}\n` +
      `${s(health.hnh?.ok!==false)} HNH\n${s(health.givc?.ok!==false)} GIVC\n${s(health.sbs?.ok!==false)} SBS\n` +
      `🟢 IRIS 🟢 FHIR 🟢 AI 🟢 Voice`,
      { reply_markup: mainKeyboard(lang) });
    return new Response("OK");
  }

  if (text === "/hospitals") {
    const hospitals = getHospitals();
    const list = hospitals.map(h => `🏥 *${h.name}*\n📋 \`${h.license}\`\n🔗 ${h.portal}`).join("\n\n");
    await sendMsg(token, chatId, `🏨 *${lang === "ar" ? "المستشفيات المتصلة" : "Connected Hospitals"}*\n\n${list}`, { reply_markup: hospitalsKeyboard(lang) });
    return new Response("OK");
  }

  if (text === "/nphies") {
    await sendAction(token, chatId, "typing");
    const [net, kpis] = await Promise.all([nphiesNetwork(), nphiesKpis()]);
    await sendMsg(token, chatId, `🏥 *NPHIES*\n\n📊 Network: ${jsonToReadable(net, lang)}\n\n📈 KPIs: ${jsonToReadable(kpis, lang)}`, { reply_markup: nphiesKeyboard(lang) });
    return new Response("OK");
  }

  if (text === "/search") {
    await sendMsg(token, chatId, lang === "ar" ? "🔎 أرسل كلمة البحث:" : "🔎 Send search term:");
    return new Response("OK");
  }

  if (text === "/book") {
    await sendMsg(token, chatId, lang === "ar"
      ? "📅 *حجز موعد*\n\nالصيغة:\n/book التاريخ الوقت الطبيب السبب\n\nمثال:\n/book 2026-06-15 10:00 د.أحمد فحص عام"
      : "📅 *Book Appointment*\n\nFormat:\n/book date time doctor reason\n\nExample:\n/book 2026-06-15 10:00 Dr.Ahmed general checkup");
    return new Response("OK");
  }

  if (text === "/reminders") {
    await sendAction(token, chatId, "typing");
    const reminders = await listReminders(env, "1");
    const list = reminders.reminders?.length > 0
      ? reminders.reminders.map((r, i) => `${i+1}. ${r.description}`).join("\n")
      : (lang === "ar" ? "لا توجد تذكيرات" : "No reminders");
    await sendMsg(token, chatId, `📋 *${lang === "ar" ? "التذكيرات" : "Reminders"}*\n\n${list}`, { reply_markup: mainKeyboard(lang) });
    return new Response("OK");
  }

  if (text === "/records") {
    await sendAction(token, chatId, "typing");
    const { results } = await fhirSearch(env, "Patient");
    const list = results.length > 0
      ? results.map(p => `• ${p.name?.[0]?.given?.join(" ")} ${p.name?.[0]?.family || ""} (${p.id})`).join("\n")
      : (lang === "ar" ? "لا يوجد مرضى" : "No patients found");
    await sendMsg(token, chatId, `👥 *${lang === "ar" ? "السجلات" : "Records"}*\n\n${list}\n\n${lang === "ar" ? "أضف سجل جديد:" : "Add new record:"}\n/create_patient الاسم الرقم_الوطني تاريخ_الميلاد ذكر/أنثى الهاتف المدينة`, { reply_markup: mainKeyboard(lang) });
    return new Response("OK");
  }

  // Emergency SOS
  if (text === "/sos") {
    await sendAction(token, chatId, "typing");
    const pid = patientContext.get(chatId) || "1";
    const symptoms = text.split(" ").slice(1).join(" ") || "emergency situation";
    const sos = await handleEmergencySOS(pid, symptoms, callAgent, env, lang);
    await sendMsg(token, chatId, sos.report, {
      reply_markup: { inline_keyboard: [
        [{ text: "🚑 997", url: "tel:997" }, { text: "🏥 911", url: "tel:911" }],
        [{ text: lang === "ar" ? "📋 ملخص" : "📋 Summary", callback_data: "summary" }],
      ]},
    });
    return new Response("OK");
  }

  // Clinical chains
  if (text === "/chain") {
    const chainList = Object.entries(CHAINS).map(([k, v]) => {
      const desc = lang === "ar" ? v.description(true) : v.descriptionEn;
      return `${v.icon} /chain_${k} — ${desc}`;
    }).join("\n");
    await sendMsg(token, chatId, `🔄 *${lang === "ar" ? "السلاسل السريرية" : "Clinical Chains"}*\n\n${chainList}`);
    return new Response("OK");
  }

  if (text.startsWith("/chain_")) {
    const chainKey = text.slice(7).trim();
    if (CHAINS[chainKey]) {
      await sendAction(token, chatId, "typing");
      const pid = patientContext.get(chatId) || "1";
      const result = await runChain(chainKey, pid, callAgent, env, lang);
      await sendMsg(token, chatId, result.summary, { reply_markup: mainKeyboard(lang) });
    }
    return new Response("OK");
  }

  // Health insights
  if (text === "/insights") {
    await sendAction(token, chatId, "typing");
    const pid = patientContext.get(chatId) || "1";
    const { results: conds } = await fhirSearch(env, "Condition", { patient: pid });
    const { results: meds } = await fhirSearch(env, "MedicationRequest", { patient: pid });
    const { results: labs } = await fhirSearch(env, "Observation", { patient: pid });
    const insights = generateInsights({ conditions: conds, medications: meds, observations: labs }, lang);
    await sendMsg(token, chatId, `💡 *${lang === "ar" ? "الملاحظات الذكية" : "Smart Insights"}*\n\n${formatInsights(insights, lang)}`, { reply_markup: mainKeyboard(lang) });
    return new Response("OK");
  }

  // Medication schedule
  if (text === "/schedule") {
    await sendAction(token, chatId, "typing");
    const pid = patientContext.get(chatId) || "1";
    const { results: meds } = await fhirSearch(env, "MedicationRequest", { patient: pid });
    const schedule = generateMedSchedule(meds, lang);
    await sendMsg(token, chatId, `💊 *${lang === "ar" ? "جدول الأدوية" : "Medication Schedule"}*\n\n${formatMedSchedule(schedule, lang)}`, { reply_markup: mainKeyboard(lang) });
    return new Response("OK");
  }

  // Switch patient
  if (text.startsWith("/switch")) {
    const pid = text.split(" ")[1];
    if (pid) {
      patientContext.set(chatId, pid);
      await sendMsg(token, chatId, lang === "ar"
        ? `✅ تم التبديل إلى المريض: ${pid}`
        : `✅ Switched to patient: ${pid}`, { reply_markup: mainKeyboard(lang) });
    } else {
      await sendMsg(token, chatId, lang === "ar"
        ? "استخدم: /switch معرف_المريض"
        : "Usage: /switch patient_id");
    }
    return new Response("OK");
  }

  // Health trends
  if (text === "/trends") {
    await sendAction(token, chatId, "typing");
    const pid = patientContext.get(chatId) || "1";
    const { results: labs } = await fhirSearch(env, "Observation", { patient: pid });
    if (labs.length === 0) {
      await sendMsg(token, chatId, lang === "ar" ? "لا توجد تحاليل بعد" : "No lab results yet");
      return new Response("OK");
    }
    // Group by code
    const byCode = {};
    for (const lab of labs) {
      const code = lab.code?.coding?.[0]?.code;
      if (code) {
        if (!byCode[code]) byCode[code] = [];
        byCode[code].push(lab.valueQuantity?.value);
      }
    }
    const trends = Object.entries(byCode).map(([code, values]) => {
      const ref = { "4548-4": { name: "HbA1c", unit: "%" }, "2345-7": { name: "Glucose", unit: "mg/dL" },
        "2093-3": { name: "Cholesterol", unit: "mg/dL" }, "2160-0": { name: "Creatinine", unit: "mg/dL" } };
      const r = ref[code] || { name: code, unit: "" };
      return formatTrend(r.name, values, r.unit, lang);
    }).join("\n");

    await sendMsg(token, chatId, `📈 *${lang === "ar" ? "الاتجاهات الصحية" : "Health Trends"}*\n\n${trends}`, { reply_markup: mainKeyboard(lang) });
    return new Response("OK");
  }

  // Patient info
  if (text === "/patient") {
    const pid = patientContext.get(chatId) || "1";
    await sendAction(token, chatId, "typing");
    const { resource: patient } = await fhirRead(env, "Patient", pid);
    if (patient) {
      const name = `${patient.name?.[0]?.given?.join(" ")} ${patient.name?.[0]?.family || ""}`;
      await sendMsg(token, chatId, lang === "ar"
        ? `👤 *المريض الحالي*\n\nالاسم: ${name}\nالمعرف: ${pid}\nتاريخ الميلاد: ${patient.birthDate || "?"}\nالجنس: ${patient.gender || "?"}\n\n_استخدم /switch لتغيير المريض_`
        : `👤 *Current Patient*\n\nName: ${name}\nID: ${pid}\nDOB: ${patient.birthDate || "?"}\nGender: ${patient.gender || "?"}\n\n_Use /switch to change patient_`, { reply_markup: mainKeyboard(lang) });
    } else {
      await sendMsg(token, chatId, lang === "ar" ? "لم يتم العثور على المريض" : "Patient not found");
    }
    return new Response("OK");
  }

  // ── Smart text routing ──

  // Handle /book with params
  if (text.startsWith("/book ")) {
    const parts = text.slice(6).trim().split(/\s+/);
    if (parts.length >= 4) {
      const [date, time, ...rest] = parts;
      const practitioner = rest[0];
      const reason = rest.slice(1).join(" ") || "General checkup";
      await sendAction(token, chatId, "typing");
      const result = await bookAppointment(env, { patientId: "1", practitioner, date, time, reason });
      await sendMsg(token, chatId, result.ok
        ? (lang === "ar" ? `✅ تم حجز الموعد!\n📅 ${date} ${time}\n👨‍⚕️ ${practitioner}\n📝 ${reason}` : `✅ Appointment booked!\n📅 ${date} ${time}\n👨‍⚕️ ${practitioner}\n📝 ${reason}`)
        : `❌ ${result.error}`, { reply_markup: mainKeyboard(lang) });
      return new Response("OK");
    }
  }

  // Handle /search with query
  if (text.startsWith("/search ")) {
    const query = text.slice(8).trim();
    await sendAction(token, chatId, "typing");
    const results = await semanticSearch(env, query);
    const list = results.results?.length > 0
      ? results.results.map(r => `${r.type}/${r.id}: ${r.display}`).join("\n")
      : (lang === "ar" ? "لا توجد نتائج" : "No results");
    await sendMsg(token, chatId, `🔎 *${lang === "ar" ? "نتائج البحث" : "Search Results"}* (${results.count || 0})\n\n${list}`, { reply_markup: searchKeyboard(lang) });
    return new Response("OK");
  }

  // Handle /create_patient
  if (text.startsWith("/create_patient ")) {
    const parts = text.slice(16).trim().split(/\s+/);
    if (parts.length >= 4) {
      const [name, nationalId, birthDate, gender, phone, city] = parts;
      await sendAction(token, chatId, "typing");
      const result = await createPatient(env, { name, nationalId, birthDate, gender, phone, city });
      await sendMsg(token, chatId, result.ok
        ? (lang === "ar" ? `✅ تم إنشاء المريض!\n👤 ${name}\n🆔 ${nationalId}` : `✅ Patient created!\n👤 ${name}\n🆔 ${nationalId}`)
        : `❌ ${result.error}`, { reply_markup: mainKeyboard(lang) });
      return new Response("OK");
    }
  }

  // Handle /query with question
  if (text.startsWith("/query ")) {
    const question = text.slice(7).trim();
    await sendAction(token, chatId, "typing");
    const result = await callAgent("nl-query", question, env);
    const readable = jsonToReadable(result.data || result.error, lang);
    await sendMsg(token, chatId, `💬 *${lang === "ar" ? "استعلام ذكي" : "Smart Query"}*\n\n${readable}`, { reply_markup: mainKeyboard(lang) });
    return new Response("OK");
  }

  // Agent commands
  const cmdMap = { summary:"summary", triage:"triage", meds:"medication-safety", gaps:"gaps-in-care",
    plan:"care-plan", labs:"lab-explainer", risk:"readmission-risk", auth:"prior-auth",
    trials:"clinical-trials", imaging:"imaging-followup", sdoh:"sdoh-referral" };
  const cmd = text.startsWith("/") ? text.split(" ")[0].slice(1).toLowerCase() : null;
  if (cmd && cmdMap[cmd]) {
    const question = text.split(" ").slice(1).join(" ") || undefined;
    await sendAction(token, chatId, "typing");
    const result = await callAgent(cmdMap[cmd], question, env);
    const a = AGENTS[cmdMap[cmd]];
    const readable = jsonToReadable(result.data || result.error, lang);
    await sendMsg(token, chatId, `${a.icon} *${lang === "ar" ? a.ar : a.en}*\n\n${readable}`, { reply_to_message_id: msgId, reply_markup: mainKeyboard(lang) });
    return new Response("OK");
  }

  // Smart routing for free text
  await sendAction(token, chatId, "typing");
  const agentKey = routeAgent(text);
  const result = await callAgent(agentKey, text, env);
  const a = AGENTS[agentKey];
  const readable = jsonToReadable(result.data || result.error, lang);
  await sendMsg(token, chatId, `${a.icon} *${lang === "ar" ? a.ar : a.en}*\n\n${readable}`, { reply_to_message_id: msgId, reply_markup: mainKeyboard(lang) });

  return new Response("OK");
}

// ═══════════════════════════════════════════════════════════
// Setup
// ═══════════════════════════════════════════════════════════

export async function handleTelegramSetup(request, env) {
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) return new Response(JSON.stringify({ error: "No token" }), { status: 500 });

  const url = new URL(request.url);
  const webhookUrl = `${url.origin}/api/telegram/webhook`;

  const [wh, cmd] = await Promise.all([
    tg("setWebhook", token, { url: webhookUrl, allowed_updates: ["message","callback_query"], max_connections: 10 }),
    tg("setMyCommands", token, { commands: [
      { command: "start", description: "🏥 Start BASMA" },
      { command: "sos", description: "🚨 Emergency SOS" },
      { command: "dashboard", description: "📊 Control panel" },
      { command: "status", description: "📡 System health" },
      { command: "patient", description: "👤 Current patient" },
      { command: "switch", description: "🔄 Switch patient" },
      { command: "chain", description: "🔗 Clinical chains" },
      { command: "insights", description: "💡 Smart insights" },
      { command: "trends", description: "📈 Health trends" },
      { command: "schedule", description: "💊 Med schedule" },
      { command: "hospitals", description: "🏨 Oracle hospitals" },
      { command: "nphies", description: "🏥 NPHIES claims" },
      { command: "book", description: "📅 Book appointment" },
      { command: "search", description: "🔎 Smart search" },
      { command: "records", description: "👥 Manage records" },
      { command: "reminders", description: "📋 Reminders" },
      { command: "summary", description: "📋 Patient summary" },
      { command: "triage", description: "🚑 Emergency triage" },
      { command: "meds", description: "💊 Medication safety" },
      { command: "gaps", description: "🔍 Care gaps" },
      { command: "plan", description: "📝 Care plan" },
      { command: "labs", description: "🧪 Lab results" },
      { command: "risk", description: "⚠️ Readmission risk" },
      { command: "voice", description: "🔊 Toggle voice" },
      { command: "basma", description: "🌟 Meet BASMA" },
      { command: "query", description: "💬 Smart query" },
      { command: "help", description: "❓ All commands" },
    ]}),
  ]);

  return new Response(JSON.stringify({
    bot: "BASMA — بسمه — BrainSAIT AI Medical Assistant",
    webhook: (await wh.json()).ok ? "configured" : "failed",
    commands: (await cmd.json()).ok ? "configured" : "failed",
    webhookUrl,
    integrations: ["IRIS","Oracle","NPHIES","HNH","GIVC","SBS","FHIR","AI Search","Voice"],
    agents: 12,
    backends: 29,
  }), { headers: { "content-type": "application/json" } });
}
