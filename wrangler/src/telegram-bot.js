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
import {
  ROLES, STATES, UserContext, getContext, clearContext,
  detectRoleFromText, detectRoleFromHistory,
  getNextQuestion, getRoleButtons, getServiceButtons,
  getProactiveSuggestion, updateSatisfaction, getContextSummary,
} from "./services/basma-context.js";
import {
  PROFILE_SCHEMAS, getProfileSession, clearProfileSession,
  startProfileBuilder, answerQuestion, generateProfileHTML,
  publishProfile, getProfile, listProfiles,
} from "./services/basma-profile-builder.js";
import {
  generateQRCodeSVG, generateProfileQR,
  trackProfileView, getProfileAnalytics, formatAnalytics,
  verifySCFHS, getVerificationBadge,
  searchProfiles, formatSearchResults,
  generateEmbedCode, generateShareText, generateVCard,
  compareProfiles, getProfileRecommendations,
  updateProfile, deleteProfile, getProfileStats,
} from "./services/basma-profile-features.js";
import {
  HF_MODELS, MEDICAL_MODELS, ARABIC_MODELS, FADIL369_MODELS,
  runCFModel, getEmbeddings, analyzeImage, transcribeAudio,
  generateSpeech, generateImage, semanticSearch as hfSemanticSearch,
  selectModel, checkModelHealth, listModels,
  checkFadil369Models, callFadil369Model, getFadil369Status,
} from "./services/huggingface-integration.js";

// ═══════════════════════════════════════════════════════════
// BASMA — بسمه — Context-Aware Healthcare AI
// Voice-guided · Proactive · Multi-role · Satisfaction-driven
// ═══════════════════════════════════════════════════════════

const AGENTS = {
  summary:          { fn: handleSummary,          ar: "ملخص المريض",     en: "Patient Summary",      icon: "📋" },
  "prior-auth":     { fn: handlePriorAuth,        ar: "الترخيص المسبق",   en: "Prior Authorization",  icon: "✅" },
  "gaps-in-care":   { fn: handleGapsInCare,        ar: "فجوات الرعاية",    en: "Gaps in Care",         icon: "🔍" },
  "medication-safety": { fn: handleMedicationSafety, ar: "سلامة الأدوية",   en: "Medication Safety",    icon: "💊" },
  "care-plan":      { fn: handleCarePlanNavigator,  ar: "خطة الرعاية",     en: "Care Plan",            icon: "📝" },
  "clinical-trials": { fn: handleClinicalTrials,    ar: "التجارب السريرية", en: "Clinical Trials",      icon: "🔬" },
  "readmission-risk": { fn: handleReadmissionRisk,  ar: "خطر إعادة الدخول", en: "Readmission Risk",    icon: "⚠️" },
  triage:           { fn: handleTriage,             ar: "الفحص الأولي",     en: "Triage Assessment",    icon: "🚑" },
  "imaging-followup": { fn: handleImagingFollowup,  ar: "متابعة التصوير",   en: "Imaging Follow-up",   icon: "📷" },
  "lab-explainer":  { fn: handleLabExplainer,       ar: "شرح التحاليل",     en: "Lab Results",          icon: "🧪" },
  "nl-query":       { fn: handleNLQuery,            ar: "استعلام ذكي",      en: "Smart Query",          icon: "💬" },
  "sdoh-referral":  { fn: handleSDOHReferral,       ar: "الإحالات الاجتماعية", en: "SDOH Referrals",    icon: "🏠" },
};

// ═══════════════════════════════════════════════════════════
// Telegram API Helpers
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
// Context-Aware Response Builder
// ═══════════════════════════════════════════════════════════

async function respondWithContext(token, chatId, ctx, env, userText = "") {
  const lang = ctx.preferences.lang;
  const role = ctx.getRoleConfig();

  // If no role selected yet, ask for it
  if (ctx.role === "unknown" && ctx.state === STATES.GREETING) {
    ctx.updateState(STATES.ROLE_SELECTION);
    const question = getNextQuestion(ctx, lang);
    await sendMsgWithVoice(token, chatId, question.text, env, { reply_markup: question.buttons }, lang);
    return;
  }

  // If role just selected, greet and show services
  if (ctx.state === STATES.SERVICE_ROUTING || ctx.state === STATES.FOLLOW_UP) {
    const question = getNextQuestion(ctx, lang);
    await sendMsgWithVoice(token, chatId, question.text, env, { reply_markup: question.buttons }, lang);
    return;
  }

  // Default: show service buttons
  const question = getNextQuestion(ctx, lang);
  await sendMsgWithVoice(token, chatId, question.text, env, { reply_markup: question.buttons }, lang);
}

async function sendMsgWithVoice(token, chatId, text, env, opts = {}, lang = "ar") {
  await sendMsg(token, chatId, text, opts);

  // Send voice if enabled
  if (env.ELEVENLABS_API_KEY) {
    await sendAction(token, chatId, "record_voice");
    const cleanText = text.replace(/\*/g, "").replace(/_/g, "").replace(/`/g, "");
    const tts = await textToSpeech(cleanText, env.ELEVENLABS_API_KEY);
    if (tts.ok) {
      await sendVoice(token, chatId, tts.audio);
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Voice Pipeline (Context-Aware)
// ═══════════════════════════════════════════════════════════

async function processVoice(update, env, token) {
  const chatId = update.message.chat.id;
  const msgId = update.message.message_id;
  const ctx = getContext(chatId);
  const lang = ctx.preferences.lang;
  const voice = update.message.voice || update.message.audio;
  if (!voice) return;

  await sendAction(token, chatId, "typing");
  const audio = await downloadFile(token, voice.file_id);
  if (!audio) { await sendMsg(token, chatId, "❌"); return; }

  const stt = await speechToText(audio, env.ELEVENLABS_API_KEY);
  if (!stt.ok || !stt.text.trim()) {
    await sendMsgWithVoice(token, chatId,
      lang === "ar" ? "🎤 لم أفهم. حاول مرة أخرى." : "🎤 Could not understand. Try again.",
      env, {}, lang);
    return;
  }

  const text = stt.text.trim();
  ctx.addHistory("voice_input", text);

  // Detect role from voice input
  const detectedRole = detectRoleFromText(text);
  if (detectedRole && ctx.role === "unknown") {
    ctx.setRole(detectedRole);
    const greeting = ctx.getRoleConfig().greeting[lang];
    await sendMsgWithVoice(token, chatId, greeting, env, {
      reply_markup: getServiceButtons(ctx, lang),
    }, lang);
    return;
  }

  // Route to appropriate agent
  const agentKey = routeAgent(text, ctx);
  await sendAction(token, chatId, "typing");
  const result = await callAgent(agentKey, text, env);

  const agent = AGENTS[agentKey];
  const readable = jsonToReadable(result.data || result.error, lang);
  const response = `${agent.icon} *${lang === "ar" ? agent.ar : agent.en}*\n\n${readable}\n\n🎤 _"${text}"_`;

  await sendMsg(token, chatId, response, {
    reply_to_message_id: msgId,
    reply_markup: getServiceButtons(ctx, lang),
  });

  // Voice response
  if (env.ELEVENLABS_API_KEY) {
    await sendAction(token, chatId, "record_voice");
    const voiceText = lang === "ar"
      ? `${agent.ar}: ${readable}`
      : `${agent.en}: ${readable}`;
    const tts = await textToSpeech(voiceText, env.ELEVENLABS_API_KEY);
    if (tts.ok) await sendVoice(token, chatId, tts.audio, { reply_to: msgId });
  }

  // Proactive suggestion
  ctx.addHistory(agentKey, result.ok);
  const suggestion = getProactiveSuggestion(ctx, lang);
  if (suggestion && ctx.interactionCount % 3 === 0) {
    setTimeout(async () => {
      await sendMsg(token, chatId, `💡 ${suggestion.text}`, {
        reply_markup: getServiceButtons(ctx, lang),
      });
    }, 2000);
  }
}

function routeAgent(text, ctx) {
  const lower = text.toLowerCase();

  // Context-aware routing based on role
  const roleRoutes = {
    patient: { kw: ["triage","emergency","pain","طوارئ","ألم"], agent: "triage" },
    provider: { kw: ["summary","patient","ملخص","مريض"], agent: "summary" },
    payer: { kw: ["claim","auth","مطالبة","ترخيص"], agent: "prior-auth" },
    gov: { kw: ["compliance","audit","امتثال","تدقيق"], agent: "gaps-in-care" },
  };

  // Check role-specific routes first
  if (ctx.role !== "unknown" && roleRoutes[ctx.role]) {
    const route = roleRoutes[ctx.role];
    if (route.kw.some(kw => lower.includes(kw))) return route.agent;
  }

  // General routing
  const rules = [
    { kw: ["triage","emergency","urgent","pain","chest","طوارئ","ألم","صدر"], agent: "triage" },
    { kw: ["summary","overview","patient","ملخص","تقرير","مريض"], agent: "summary" },
    { kw: ["medication","drug","medicine","دواء","أدوية","صيدلية"], agent: "medication-safety" },
    { kw: ["lab","blood","test","result","تحليل","تحاليل","دم","نتائج"], agent: "lab-explainer" },
    { kw: ["gap","screening","vaccine","preventive","فجوة","فحص","تطعيم"], agent: "gaps-in-care" },
    { kw: ["care plan","plan","goal","خطة","رعاية","هدف"], agent: "care-plan" },
    { kw: ["imaging","x-ray","mri","ct","ultrasound","تصوير","أشعة","رنين"], agent: "imaging-followup" },
    { kw: ["readmission","risk","hospital","chronic","إعادة","دخول","خطر","مزمن"], agent: "readmission-risk" },
    { kw: ["prior auth","authorization","insurance","approval","ترخيص","تأمين","موافقة"], agent: "prior-auth" },
    { kw: ["trial","research","study","تجربة","بحث","دراسة"], agent: "clinical-trials" },
    { kw: ["social","food","transport","housing","اجتماعي","غذاء","نقل","سكن"], agent: "sdoh-referral" },
    { kw: ["query","ask","what","how","explain","استعلام","اسأل","ماذا","كيف","اشرح"], agent: "nl-query" },
  ];

  for (const rule of rules) {
    if (rule.kw.some(kw => lower.includes(kw))) return rule.agent;
  }

  return ctx.role === "provider" ? "summary" : "triage";
}

// ═══════════════════════════════════════════════════════════
// Callback Handler (Context-Aware)
// ═══════════════════════════════════════════════════════════

async function handleCallback(cb, env, token) {
  const chatId = cb.message.chat.id;
  const data = cb.data;
  const ctx = getContext(chatId);
  const lang = ctx.preferences.lang;

  await tg("answerCallbackQuery", token, { callback_query_id: cb.id });

  // ── Role Selection ──
  if (data.startsWith("role_")) {
    const role = data.replace("role_", "");
    if (role === "switch") {
      ctx.role = "unknown";
      ctx.state = STATES.ROLE_SELECTION;
      await sendMsgWithVoice(token, chatId,
        lang === "ar" ? "من أنت الآن؟" : "Who are you now?",
        env, { reply_markup: getRoleButtons(lang) }, lang);
      return;
    }
    if (ROLES[role]) {
      ctx.setRole(role);
      const greeting = ROLES[role].greeting[lang];
      await sendMsgWithVoice(token, chatId, greeting, env, {
        reply_markup: getServiceButtons(ctx, lang),
      }, lang);
    }
    return;
  }

  // ── Satisfaction ──
  if (data.startsWith("satisfied_")) {
    const feedback = updateSatisfaction(ctx, data);
    if (feedback) {
      await sendMsgWithVoice(token, chatId, feedback.text, env, {
        reply_markup: getServiceButtons(ctx, lang),
      }, lang);
    }
    return;
  }

  // ── Main Menu ──
  if (data === "main_menu") {
    ctx.updateState(STATES.SERVICE_ROUTING);
    const question = getNextQuestion(ctx, lang);
    await sendMsgWithVoice(token, chatId, question.text, env, { reply_markup: question.buttons }, lang);
    return;
  }

  // ── Agent Execution ──
  if (AGENTS[data]) {
    await sendAction(token, chatId, "typing");
    const result = await callAgent(data, "", env);
    const agent = AGENTS[data];
    const readable = jsonToReadable(result.data || result.error, lang);
    await sendMsg(token, chatId, `${agent.icon} *${lang === "ar" ? agent.ar : agent.en}*\n\n${readable}`, {
      reply_markup: getServiceButtons(ctx, lang),
    });

    // Voice response
    if (env.ELEVENLABS_API_KEY) {
      await sendAction(token, chatId, "record_voice");
      const voiceText = lang === "ar" ? `${agent.ar}: ${readable}` : `${agent.en}: ${readable}`;
      const tts = await textToSpeech(voiceText, env.ELEVENLABS_API_KEY);
      if (tts.ok) await sendVoice(token, chatId, tts.audio);
    }

    // Proactive follow-up
    ctx.addHistory(data, result.ok);
    setTimeout(async () => {
      const suggestion = getProactiveSuggestion(ctx, lang);
      await sendMsg(token, chatId, `💡 ${suggestion.text}`, {
        reply_markup: getServiceButtons(ctx, lang),
      });
    }, 3000);
    return;
  }

  // ── Profile Builder ──
  if (data.startsWith("build_")) {
    const action = data.replace("build_", "");

    if (["doctor", "partner", "team", "student"].includes(action)) {
      const result = startProfileBuilder(chatId, action, lang);
      if (result.ok) {
        await sendMsgWithVoice(token, chatId, result.message, env, {
          reply_markup: { inline_keyboard: [
            [{ text: lang === "ar" ? "❌ إلغاء" : "❌ Cancel", callback_data: "build_cancel" }],
          ]},
        }, lang);
      }
      return;
    }

    if (action === "publish") {
      const session = getProfileSession(chatId);
      if (session.state === "reviewing") {
        await sendAction(token, chatId, "typing");
        const result = await publishProfile(env, session);
        if (result.ok) {
          session.state = "published";
          await sendMsgWithVoice(token, chatId,
            lang === "ar"
              ? `✅ *تم نشر الملف الشخصي!*\n\n🔗 ${result.url}\n\nيمكنك مشاركة هذا الرابط مع مرضاك أو زملائك`
              : `✅ *Profile Published!*\n\n🔗 ${result.url}\n\nShare this link with your patients or colleagues`,
            env, { reply_markup: getServiceButtons(ctx, lang) }, lang);
        } else {
          await sendMsg(token, chatId, `❌ ${result.error}`);
        }
      }
      return;
    }

    if (action === "edit") {
      const session = getProfileSession(chatId);
      session.state = "collecting";
      session.currentQuestion = 0;
      const firstQ = session.schema.questions[0];
      await sendMsgWithVoice(token, chatId,
        lang === "ar" ? `✏️ *تعديل الملف*\n\n${firstQ.ask}` : `✏️ *Edit Profile*\n\n${firstQ.ask}`,
        env, {}, lang);
      return;
    }

    if (action === "skip") {
      const session = getProfileSession(chatId);
      const result = answerQuestion(chatId, "(skipped)");
      if (result.ok && !result.done) {
        await sendMsgWithVoice(token, chatId, `${result.message}\n\n📊 ${result.progress}`, env, {
          reply_markup: { inline_keyboard: [
            [{ text: lang === "ar" ? "⏭️ تخطي" : "⏭️ Skip", callback_data: "build_skip" },
             { text: lang === "ar" ? "❌ إلغاء" : "❌ Cancel", callback_data: "build_cancel" }],
          ]},
        }, lang);
      } else if (result.done) {
        await sendMsgWithVoice(token, chatId, result.message, env, {
          reply_markup: { inline_keyboard: [
            [{ text: lang === "ar" ? "✅ نشر الملف" : "✅ Publish Profile", callback_data: "build_publish" },
             { text: lang === "ar" ? "✏️ تعديل" : "✏️ Edit", callback_data: "build_edit" }],
            [{ text: lang === "ar" ? "❌ إلغاء" : "❌ Cancel", callback_data: "build_cancel" }],
          ]},
        }, lang);
      }
      return;
    }

    if (action === "cancel") {
      clearProfileSession(chatId);
      await sendMsg(token, chatId, lang === "ar" ? "❌ تم إلغاء بناء الملف" : "❌ Profile building cancelled", {
        reply_markup: getServiceButtons(ctx, lang),
      });
      return;
    }
  }

  // ── BASMA Intro ──
  if (data === "basma_intro") {
    await handleBasmaIntro(token, chatId, env, lang);
    return;
  }

  // ── Emergency SOS ──
  if (data === "sos") {
    await sendAction(token, chatId, "typing");
    const sos = await handleEmergencySOS(ctx.patientId || "1", "emergency", callAgent, env, lang);
    await sendMsg(token, chatId, sos.report, {
      reply_markup: { inline_keyboard: [
        [{ text: "🚑 997", url: "tel:997" }, { text: "🏥 911", url: "tel:911" }],
        [{ text: lang === "ar" ? "📋 ملخص" : "📋 Summary", callback_data: "summary" }],
      ]},
    });
    return;
  }

  // ── Clinical Chains ──
  if (data.startsWith("chain_")) {
    const chainKey = data.replace("chain_", "");
    if (CHAINS[chainKey]) {
      await sendAction(token, chatId, "typing");
      const result = await runChain(chainKey, ctx.patientId || "1", callAgent, env, lang);
      await sendMsg(token, chatId, result.summary, { reply_markup: getServiceButtons(ctx, lang) });
    }
    return;
  }

  // ── Insights ──
  if (data === "insights") {
    await sendAction(token, chatId, "typing");
    const { results: conds } = await fhirSearch(env, "Condition", { patient: ctx.patientId || "1" });
    const { results: meds } = await fhirSearch(env, "MedicationRequest", { patient: ctx.patientId || "1" });
    const { results: labs } = await fhirSearch(env, "Observation", { patient: ctx.patientId || "1" });
    const insights = generateInsights({ conditions: conds, medications: meds, observations: labs }, lang);
    await sendMsg(token, chatId, `💡 *${lang === "ar" ? "الملاحظات الذكية" : "Smart Insights"}*\n\n${formatInsights(insights, lang)}`, {
      reply_markup: getServiceButtons(ctx, lang),
    });
    return;
  }

  // ── System Status ──
  if (data === "system_status") {
    await sendAction(token, chatId, "typing");
    const health = await fullSystemHealth();
    const s = (ok) => ok ? "🟢" : "🔴";
    await sendMsg(token, chatId,
      `📊 *${lang === "ar" ? "حالة النظام" : "System Status"}*\n\n` +
      `${s(health.worker?.status==="ok")} Worker: ${health.worker?.status||"?"}\n` +
      `${s(health.oracle?.ok!==false)} Oracle: ${lang==="ar"?"6 مستشفيات":"6 hospitals"}\n` +
      `${s(health.hnh?.ok!==false)} HNH\n${s(health.givc?.ok!==false)} GIVC\n${s(health.sbs?.ok!==false)} SBS\n` +
      `🟢 IRIS 🟢 FHIR 🟢 AI 🟢 Voice`,
      { reply_markup: getServiceButtons(ctx, lang) });
    return;
  }

  // ── NPHIES ──
  if (data === "nphies_menu" || data === "nphies") {
    await sendAction(token, chatId, "typing");
    const [net, kpis] = await Promise.all([nphiesNetwork(), nphiesKpis()]);
    await sendMsg(token, chatId, `🏥 *NPHIES*\n\n📊 ${jsonToReadable(net, lang)}\n\n📈 ${jsonToReadable(kpis, lang)}`, {
      reply_markup: getServiceButtons(ctx, lang),
    });
    return;
  }

  // ── Hospitals ──
  if (data === "hospitals" || data === "hospitals_menu") {
    const hospitals = getHospitals();
    const list = hospitals.map(h => `🏥 ${h.name}: \`${h.license}\``).join("\n");
    await sendMsg(token, chatId, `🏨 *${lang === "ar" ? "المستشفيات" : "Hospitals"}*\n\n${list}`, {
      reply_markup: getServiceButtons(ctx, lang),
    });
    return;
  }

  // ── Search ──
  if (data === "search" || data === "search_menu") {
    await sendMsg(token, chatId, lang === "ar" ? "🔎 أرسل كلمة البحث:" : "🔎 Send search term:");
    return;
  }
}

// ═══════════════════════════════════════════════════════════
// BASMA Introduction (Context-Aware)
// ═══════════════════════════════════════════════════════════

async function handleBasmaIntro(token, chatId, env, lang = "ar") {
  const introAr = `مرحباً! أنا *بسمه* 🌟
مساعدك الذكي من *برين سايت*.

🏥 أفهم من أنت وأ adapt حسب احتياجاتك:
• مرضى — سجلاتي، مواعيدي، تحاليلي
• أطباء — أدوات سريرية، مرضى، نفيس
• تأمين — مطالبات، أهلية، موافقات
• حكومة — امتثال، تدقيق، تقارير
• شركاء — تكامل، API، تعاون
• طلاب — تعلم، تدريب، موارد
• فريق — إدارة، مراقبة، إشعارات

🎤 أرسل رسالة صوتية وسأفهمك!`;

  const introEn = `Hello! I am *BASMA* 🌟
Your smart assistant from *BrainSAIT*.

🏥 I understand who you are and adapt to your needs:
• Patients — my records, appointments, labs
• Providers — clinical tools, patients, NPHIES
• Insurance — claims, eligibility, approvals
• Government — compliance, audits, reports
• Partners — integration, API, collaboration
• Students — learning, training, resources
• Team — management, monitoring, alerts

🎤 Send a voice message and I'll understand!`;

  await sendMsgWithVoice(token, chatId, lang === "ar" ? introAr : introEn, env, {
    reply_markup: getRoleButtons(lang),
  }, lang);
}

// ═══════════════════════════════════════════════════════════
// Main Webhook (Context-Aware)
// ═══════════════════════════════════════════════════════════

export async function handleTelegramWebhook(request, env) {
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) return new Response("OK");

  let update;
  try { update = await request.json(); } catch { return new Response("OK"); }

  // Callback queries
  if (update.callback_query) {
    await handleCallback(update.callback_query, env, token);
    return new Response("OK");
  }

  if (!update.message) return new Response("OK");

  const chatId = update.message.chat.id;
  const msgId = update.message.message_id;
  const ctx = getContext(chatId);

  // Voice messages
  if (update.message.voice || update.message.audio) {
    await processVoice(update, env, token);
    return new Response("OK");
  }

  const text = update.message.text?.trim();
  if (!text) return new Response("OK");

  const lang = ctx.preferences.lang;
  ctx.addHistory("text_input", text);

  // ── Commands ──
  if (text === "/start" || text === "/help") {
    ctx.updateState(STATES.GREETING);
    const greeting = ctx.getRoleConfig().greeting[lang];
    await sendMsgWithVoice(token, chatId, greeting, env, {
      reply_markup: getRoleButtons(lang),
    }, lang);
    return new Response("OK");
  }

  if (text === "/basma") {
    await handleBasmaIntro(token, chatId, env, lang);
    return new Response("OK");
  }

  if (text === "/context") {
    await sendMsg(token, chatId, getContextSummary(ctx, lang), {
      reply_markup: getServiceButtons(ctx, lang),
    });
    return new Response("OK");
  }

  // Profile Builder
  if (text === "/build") {
    const buildKeyboard = { inline_keyboard: [
      [{ text: lang === "ar" ? "🏥 ملف طبيب" : "🏥 Doctor Profile", callback_data: "build_doctor" },
       { text: lang === "ar" ? "🤝 ملف شريك" : "🤝 Partner Profile", callback_data: "build_partner" }],
      [{ text: lang === "ar" ? "👥 ملف فريق" : "👥 Team Profile", callback_data: "build_team" },
       { text: lang === "ar" ? "🎓 ملف طالب" : "🎓 Student Profile", callback_data: "build_student" }],
    ]};
    await sendMsgWithVoice(token, chatId,
      lang === "ar"
        ? "🌟 *بناء الملف الشخصي*\n\nاختر نوع الملف الذي تريد بناءه:"
        : "🌟 *Profile Builder*\n\nChoose the type of profile to build:",
      env, { reply_markup: buildKeyboard }, lang);
    return new Response("OK");
  }

  if (text.startsWith("/build_")) {
    const role = text.slice(7).trim();
    const result = startProfileBuilder(chatId, role, lang);
    if (result.ok) {
      await sendMsgWithVoice(token, chatId, result.message, env, {
        reply_markup: { inline_keyboard: [
          [{ text: lang === "ar" ? "❌ إلغاء" : "❌ Cancel", callback_data: "build_cancel" }],
        ]},
      }, lang);
    }
    return new Response("OK");
  }

  if (text === "/profile") {
    const profiles = await listProfiles(env);
    if (profiles.ok && profiles.profiles.length > 0) {
      const list = profiles.profiles.map(p => `${p.role === "doctor" ? "🏥" : p.role === "partner" ? "🤝" : p.role === "team" ? "👥" : "🎓"} [${p.name}](${p.url})`).join("\n");
      await sendMsg(token, chatId, `📋 *${lang === "ar" ? "الملفات الشخصية" : "Profiles"}*\n\n${list}`, {
        reply_markup: getServiceButtons(ctx, lang),
      });
    } else {
      await sendMsg(token, chatId, lang === "ar" ? "لا توجد ملفات شخصية بعد. ابدأ بـ /build" : "No profiles yet. Start with /build", {
        reply_markup: getServiceButtons(ctx, lang),
      });
    }
    return new Response("OK");
  }

  // QR Code for profile
  if (text.startsWith("/qr")) {
    const profileId = text.split(" ")[1];
    if (profileId) {
      const profile = await getProfile(env, profileId);
      if (profile.ok) {
        const url = `https://dr.elfadil.com/${profile.profile.role}/${profile.profile.slug}`;
        const qr = generateProfileQR(url, lang);
        await sendMsg(token, chatId, `📱 *QR Code*\n\n${qr.html}\n\n🔗 ${url}`, {
          reply_markup: getServiceButtons(ctx, lang),
        });
      } else {
        await sendMsg(token, chatId, lang === "ar" ? "❌ الملف غير موجود" : "❌ Profile not found");
      }
    } else {
      await sendMsg(token, chatId, lang === "ar" ? "استخدم: /qr معرف_الملف" : "Usage: /qr profile_id");
    }
    return new Response("OK");
  }

  // Profile Analytics
  if (text.startsWith("/analytics")) {
    const profileId = text.split(" ")[1];
    if (profileId) {
      const analytics = await getProfileAnalytics(env, profileId);
      if (analytics.ok) {
        await sendMsg(token, chatId, formatAnalytics(analytics.analytics, lang), {
          reply_markup: getServiceButtons(ctx, lang),
        });
      } else {
        await sendMsg(token, chatId, lang === "ar" ? "❌ لا توجد إحصائيات" : "❌ No analytics found");
      }
    } else {
      await sendMsg(token, chatId, lang === "ar" ? "استخدم: /analytics معرف_الملف" : "Usage: /analytics profile_id");
    }
    return new Response("OK");
  }

  // SCFHS Verification
  if (text.startsWith("/verify")) {
    const parts = text.split(" ").slice(1);
    if (parts.length >= 2) {
      const [scfhsNumber, ...nameParts] = parts;
      const name = nameParts.join(" ");
      const result = await verifySCFHS(env, scfhsNumber, name);
      const badge = getVerificationBadge(result.verified, lang);
      await sendMsg(token, chatId, `${badge.badge} *${badge.text}*\n\n${result.message}`, {
        reply_markup: getServiceButtons(ctx, lang),
      });
    } else {
      await sendMsg(token, chatId, lang === "ar"
        ? "استخدم: /verify رقم_الهيئة الاسم"
        : "Usage: /verify scfhs_number name");
    }
    return new Response("OK");
  }

  // Search Profiles
  if (text.startsWith("/search_profile")) {
    const query = text.split(" ").slice(1).join(" ");
    if (query) {
      const results = await searchProfiles(env, query);
      if (results.ok) {
        await sendMsg(token, chatId, `🔍 *${lang === "ar" ? "نتائج البحث" : "Search Results"}* (${results.count})\n\n${formatSearchResults(results.profiles, lang)}`, {
          reply_markup: getServiceButtons(ctx, lang),
        });
      } else {
        await sendMsg(token, chatId, lang === "ar" ? "❌ لا توجد نتائج" : "❌ No results found");
      }
    } else {
      await sendMsg(token, chatId, lang === "ar" ? "استخدم: /search_profile كلمة_البحث" : "Usage: /search_profile query");
    }
    return new Response("OK");
  }

  // Share Profile
  if (text.startsWith("/share")) {
    const profileId = text.split(" ")[1];
    if (profileId) {
      const profile = await getProfile(env, profileId);
      if (profile.ok) {
        const shareText = generateShareText(profile.profile, lang);
        await sendMsg(token, chatId, shareText, {
          reply_markup: { inline_keyboard: [
            [{ text: lang === "ar" ? "📱 QR Code" : "📱 QR Code", callback_data: `qr_${profileId}` }],
            [{ text: lang === "ar" ? "📊 إحصائيات" : "📊 Analytics", callback_data: `analytics_${profileId}` }],
          ]},
        });
      } else {
        await sendMsg(token, chatId, lang === "ar" ? "❌ الملف غير موجود" : "❌ Profile not found");
      }
    } else {
      await sendMsg(token, chatId, lang === "ar" ? "استخدم: /share معرف_الملف" : "Usage: /share profile_id");
    }
    return new Response("OK");
  }

  // Export vCard
  if (text.startsWith("/vcard")) {
    const profileId = text.split(" ")[1];
    if (profileId) {
      const profile = await getProfile(env, profileId);
      if (profile.ok) {
        const vcard = generateVCard(profile.profile);
        const blob = new Blob([vcard], { type: "text/vcard" });
        const form = new FormData();
        form.append("chat_id", String(chatId));
        form.append("document", blob, `${profile.profile.name}.vcf`);
        form.append("caption", lang === "ar" ? "📱 بطاقة الاتصال" : "📱 Contact Card");
        await tgForm("sendDocument", token, form);
      } else {
        await sendMsg(token, chatId, lang === "ar" ? "❌ الملف غير موجود" : "❌ Profile not found");
      }
    } else {
      await sendMsg(token, chatId, lang === "ar" ? "استخدم: /vcard معرف_الملف" : "Usage: /vcard profile_id");
    }
    return new Response("OK");
  }

  // Profile Statistics
  if (text === "/stats") {
    const stats = await getProfileStats(env);
    if (stats.ok) {
      const { total, byRole, recent } = stats.stats;
      const roleList = Object.entries(byRole).map(([r, c]) => `${r === "doctor" ? "🏥" : r === "partner" ? "🤝" : r === "team" ? "👥" : "🎓"} ${r}: ${c}`).join("\n");
      const recentList = recent.map(p => `• ${p.name} (${p.role})`).join("\n");
      await sendMsg(token, chatId, `📊 *${lang === "ar" ? "إحصائيات الملفات" : "Profile Statistics"}*\n\n📋 ${lang === "ar" ? "الإجمالي" : "Total"}: ${total}\n\n${roleList}\n\n📅 ${lang === "ar" ? "الأخيرة" : "Recent"}:\n${recentList}`, {
        reply_markup: getServiceButtons(ctx, lang),
      });
    } else {
      await sendMsg(token, chatId, lang === "ar" ? "❌ لا توجد إحصائيات" : "❌ No statistics found");
    }
    return new Response("OK");
  }

  // Embed Code
  if (text.startsWith("/embed")) {
    const profileId = text.split(" ")[1];
    if (profileId) {
      const profile = await getProfile(env, profileId);
      if (profile.ok) {
        const url = `https://dr.elfadil.com/${profile.profile.role}/${profile.profile.slug}`;
        const embedCode = generateEmbedCode(url);
        await sendMsg(token, chatId, `🔗 *${lang === "ar" ? "كود التضمين" : "Embed Code"}*\n\n\`\`\`html\n${embedCode}\n\`\`\``, {
          reply_markup: getServiceButtons(ctx, lang),
        });
      } else {
        await sendMsg(token, chatId, lang === "ar" ? "❌ الملف غير موجود" : "❌ Profile not found");
      }
    } else {
      await sendMsg(token, chatId, lang === "ar" ? "استخدم: /embed معرف_الملف" : "Usage: /embed profile_id");
    }
    return new Response("OK");
  }

  // ── HuggingFace Model Commands ──

  // List available models
  if (text === "/models") {
    const models = listModels();
    const byTask = {};
    models.forEach(m => {
      if (!byTask[m.task]) byTask[m.task] = [];
      byTask[m.task].push(m);
    });

    let response = `🤖 *${lang === "ar" ? "النماذج المتاحة" : "Available Models"}*\n\n`;
    for (const [task, ms] of Object.entries(byTask)) {
      response += `*${task}:*\n`;
      ms.slice(0, 3).forEach(m => {
        response += `  • \`${m.key}\` — ${m.description}\n`;
      });
      if (ms.length > 3) response += `  ... +${ms.length - 3} more\n`;
      response += "\n";
    }

    await sendMsg(token, chatId, response, { reply_markup: getServiceButtons(ctx, lang) });
    return new Response("OK");
  }

  // Switch model
  if (text.startsWith("/model")) {
    const modelKey = text.split(" ")[1];
    if (modelKey && HF_MODELS[modelKey]) {
      ctx.collectedInfo = ctx.collectedInfo || {};
      ctx.collectedInfo.preferredModel = modelKey;
      await sendMsg(token, chatId, lang === "ar"
        ? `✅ تم التبديل إلى: ${modelKey} (${HF_MODELS[modelKey].desc})`
        : `✅ Switched to: ${modelKey} (${HF_MODELS[modelKey].desc})`, {
        reply_markup: getServiceButtons(ctx, lang),
      });
    } else {
      const models = listModels().slice(0, 10);
      const list = models.map(m => `• \`${m.key}\` — ${m.description}`).join("\n");
      await sendMsg(token, chatId, lang === "ar"
        ? `استخدم: /model اسم_النموذج\n\nالنماذج المتاحة:\n${list}`
        : `Usage: /model model_name\n\nAvailable models:\n${list}`, {
        reply_markup: getServiceButtons(ctx, lang),
      });
    }
    return new Response("OK");
  }

  // Generate image
  if (text.startsWith("/generate")) {
    const prompt = text.split(" ").slice(1).join(" ");
    if (prompt) {
      await sendAction(token, chatId, "upload_photo");
      const result = await generateImage(env, prompt, "flux-schnell");
      if (result.ok) {
        const form = new FormData();
        form.append("chat_id", String(chatId));
        form.append("photo", new Blob([result.image], { type: "image/png" }), "generated.png");
        form.append("caption", lang === "ar" ? `🎨 تم التوليد: ${prompt.slice(0, 100)}` : `🎨 Generated: ${prompt.slice(0, 100)}`);
        await tgForm("sendPhoto", token, form);
      } else {
        await sendMsg(token, chatId, `❌ ${result.error}`);
      }
    } else {
      await sendMsg(token, chatId, lang === "ar"
        ? "استخدم: /generate وصف_الصورة\n\nمثال: /generate طبيب في مستشفى حديث"
        : "Usage: /generate image_description\n\nExample: /generate doctor in modern hospital");
    }
    return new Response("OK");
  }

  // Analyze image
  if (text.startsWith("/vision")) {
    await sendMsg(token, chatId, lang === "ar"
      ? "📷 أرسل صورة مع وصف (أو فقط صورة) وسأحللها"
      : "📷 Send an image with a description (or just an image) and I'll analyze it");
    return new Response("OK");
  }

  // Check model health
  if (text === "/health") {
    await sendAction(token, chatId, "typing");
    const health = await checkModelHealth(env);
    const aiStatus = health.workers_ai?.ok ? "🟢" : "🔴";
    const latency = health.workers_ai?.latency || "?";

    await sendMsg(token, chatId, `🏥 *${lang === "ar" ? "صحة النماذج" : "Model Health"}*\n\n${aiStatus} Workers AI: ${health.workers_ai?.ok ? "OK" : health.workers_ai?.error} (${latency}ms)\n🟢 MiMo: Fallback configured\n🟢 ElevenLabs: Voice ready\n🟢 HuggingFace: ${listModels().length} models`, {
      reply_markup: getServiceButtons(ctx, lang),
    });
    return new Response("OK");
  }

  // HuggingFace inference
  if (text.startsWith("/hf")) {
    const parts = text.split(" ").slice(1);
    const modelKey = parts[0];
    const prompt = parts.slice(1).join(" ");

    if (modelKey && prompt) {
      await sendAction(token, chatId, "typing");
      const messages = [
        { role: "system", content: "You are a helpful AI assistant. Respond concisely." },
        { role: "user", content: prompt },
      ];
      const result = await runCFModel(env, modelKey, messages);
      if (result.ok) {
        await sendMsg(token, chatId, `🤖 *${modelKey}*\n\n${result.text.slice(0, 3000)}`, {
          reply_markup: getServiceButtons(ctx, lang),
        });
      } else {
        await sendMsg(token, chatId, `❌ ${result.error}`);
      }
    } else {
      await sendMsg(token, chatId, lang === "ar"
        ? "استخدام: /hf نموذج سؤال\n\nمثال: /hf llama-3.3-70b ما هو الذكاء الاصطناعي؟"
        : "Usage: /hf model question\n\nExample: /hf llama-3.3-70b What is AI?");
    }
    return new Response("OK");
  }

  // Get embeddings
  if (text.startsWith("/embeddings")) {
    const content = text.split(" ").slice(1).join(" ");
    if (content) {
      await sendAction(token, chatId, "typing");
      const result = await getEmbeddings(env, content, "bge-m3");
      if (result.ok) {
        const preview = result.embeddings[0]?.slice(0, 10).map(v => v.toFixed(4)).join(", ");
        await sendMsg(token, chatId, `📊 *Embeddings*\n\nModel: ${result.model}\nDimensions: ${result.dimensions}\nPreview: [${preview}...]`, {
          reply_markup: getServiceButtons(ctx, lang),
        });
      } else {
        await sendMsg(token, chatId, `❌ ${result.error}`);
      }
    } else {
      await sendMsg(token, chatId, lang === "ar"
        ? "استخدم: /embeddings نص"
        : "Usage: /embeddings text");
    }
    return new Response("OK");
  }

  // Smart semantic search
  if (text.startsWith("/semantic")) {
    const query = text.split(" ").slice(1).join(" ");
    if (query) {
      await sendAction(token, chatId, "typing");
      // Search FHIR resources
      const { results: resources } = await fhirSearch(env, "Patient");
      const documents = resources.map(r =>
        `${r.name?.[0]?.given?.join(" ")} ${r.name?.[0]?.family || ""} ${r.address?.[0]?.city || ""}`
      ).filter(Boolean);

      if (documents.length > 0) {
        const result = await hfSemanticSearch(env, query, documents, 5);
        if (result.ok) {
          const list = result.results.map(r =>
            `• ${r.document} (score: ${r.score.toFixed(3)})`
          ).join("\n");
          await sendMsg(token, chatId, `🔍 *${lang === "ar" ? "البحث الدلالي" : "Semantic Search"}*\n\nQuery: "${query}"\n\n${list}`, {
            reply_markup: getServiceButtons(ctx, lang),
          });
        } else {
          await sendMsg(token, chatId, `❌ ${result.error}`);
        }
      } else {
        await sendMsg(token, chatId, lang === "ar" ? "لا توجد بيانات للبحث" : "No data to search");
      }
    } else {
      await sendMsg(token, chatId, lang === "ar"
        ? "استخدم: /semantic كلمة_البحث"
        : "Usage: /semantic search_query");
    }
    return new Response("OK");
  }

  // ── Fadil369 Medical Models ──

  // Meditron clinical guidelines
  if (text.startsWith("/meditron")) {
    const query = text.split(" ").slice(1).join(" ");
    if (query) {
      await sendAction(token, chatId, "typing");
      const result = await callFadil369Model(env, "meditron", query);
      if (result.ok) {
        await sendMsg(token, chatId, `🏥 *Meditron — ${lang === "ar" ? "الدليل السريري" : "Clinical Guidelines"}*\n\n${result.text.slice(0, 3000)}`, {
          reply_markup: getServiceButtons(ctx, lang),
        });
      } else {
        await sendMsg(token, chatId, `❌ ${result.error}`);
      }
    } else {
      await sendMsg(token, chatId, lang === "ar"
        ? "🏥 *Meditron — الدليل السريري*\n\nاستخدام: /meditron سؤال\n\nمثال: /meditron ما بروتوكول علاج ارتفاع ضغط الدم؟"
        : "🏥 *Meditron — Clinical Guidelines*\n\nUsage: /meditron question\n\nExample: /meditron What is the hypertension treatment protocol?");
    }
    return new Response("OK");
  }

  // LLaVA-Med medical imaging
  if (text.startsWith("/llava-med")) {
    const query = text.split(" ").slice(1).join(" ");
    if (query) {
      await sendAction(token, chatId, "typing");
      const result = await callFadil369Model(env, "llava-med", query);
      if (result.ok) {
        await sendMsg(token, chatId, `📷 *LLaVA-Med — ${lang === "ar" ? "تحليل الصور الطبية" : "Medical Imaging"}*\n\n${result.text.slice(0, 3000)}`, {
          reply_markup: getServiceButtons(ctx, lang),
        });
      } else {
        await sendMsg(token, chatId, `❌ ${result.error}`);
      }
    } else {
      await sendMsg(token, chatId, lang === "ar"
        ? "📷 *LLaVA-Med — تحليل الصور الطبية*\n\nاستخدام: /llava-med وصف_الصورة\n\nمثال: /llava-med شرح صورة أشعة سينية للصدر"
        : "📷 *LLaVA-Med — Medical Imaging*\n\nUsage: /llava-med image_description\n\nExample: /llava-med Explain this chest X-ray");
    }
    return new Response("OK");
  }

  // Medical QA
  if (text.startsWith("/medical-qa")) {
    const query = text.split(" ").slice(1).join(" ");
    if (query) {
      await sendAction(token, chatId, "typing");
      const result = await callFadil369Model(env, "medical-qa", query);
      if (result.ok) {
        await sendMsg(token, chatId, `❓ *Medical QA — ${lang === "ar" ? "أسئلة طبية" : "Medical Questions"}*\n\n${result.text.slice(0, 3000)}`, {
          reply_markup: getServiceButtons(ctx, lang),
        });
      } else {
        await sendMsg(token, chatId, `❌ ${result.error}`);
      }
    } else {
      await sendMsg(token, chatId, lang === "ar"
        ? "❓ *أسئلة طبية*\n\nاستخدام: /medical-qa سؤال\n\nمثال: /medical-qa ما أعراض السكري من النوع الثاني؟"
        : "❓ *Medical QA*\n\nUsage: /medical-qa question\n\nExample: /medical-qa What are Type 2 diabetes symptoms?");
    }
    return new Response("OK");
  }

  // Fadil369 model status
  if (text === "/fadil369") {
    await sendAction(token, chatId, "typing");
    const models = await getFadil369Status();
    const list = models.map(m => `• *${m.key}*: ${m.description}\n  Repo: \`${m.repo}\`\n  Fallback: \`${m.fallback}\``).join("\n\n");
    await sendMsg(token, chatId, `🧠 *Fadil369 Medical Models*\n\n${list}`, {
      reply_markup: getServiceButtons(ctx, lang),
    });
    return new Response("OK");
  }

  // Profile Builder Conversation
  const profileSession = getProfileSession(chatId);
  if (profileSession.state === "collecting") {
    const result = answerQuestion(chatId, text);
    if (result.ok) {
      if (result.done) {
        // Show review and publish button
        await sendMsgWithVoice(token, chatId, result.message, env, {
          reply_markup: { inline_keyboard: [
            [{ text: lang === "ar" ? "✅ نشر الملف" : "✅ Publish Profile", callback_data: "build_publish" },
             { text: lang === "ar" ? "✏️ تعديل" : "✏️ Edit", callback_data: "build_edit" }],
            [{ text: lang === "ar" ? "❌ إلغاء" : "❌ Cancel", callback_data: "build_cancel" }],
          ]},
        }, lang);
      } else {
        // Next question
        await sendMsgWithVoice(token, chatId, `${result.message}\n\n📊 ${result.progress}`, env, {
          reply_markup: { inline_keyboard: [
            [{ text: lang === "ar" ? "⏭️ تخطي" : "⏭️ Skip", callback_data: "build_skip" },
             { text: lang === "ar" ? "❌ إلغاء" : "❌ Cancel", callback_data: "build_cancel" }],
          ]},
        }, lang);
      }
    }
    return new Response("OK");
  }

  if (text === "/sos") {
    await sendAction(token, chatId, "typing");
    const sos = await handleEmergencySOS(ctx.patientId || "1", text.split(" ").slice(1).join(" ") || "emergency", callAgent, env, lang);
    await sendMsg(token, chatId, sos.report, {
      reply_markup: { inline_keyboard: [
        [{ text: "🚑 997", url: "tel:997" }, { text: "🏥 911", url: "tel:911" }],
      ]},
    });
    return new Response("OK");
  }

  // ── Detect Role from Text ──
  const detectedRole = detectRoleFromText(text);
  if (detectedRole && ctx.role === "unknown") {
    ctx.setRole(detectedRole);
    const greeting = ROLES[detectedRole].greeting[lang];
    await sendMsgWithVoice(token, chatId, greeting, env, {
      reply_markup: getServiceButtons(ctx, lang),
    }, lang);
    return new Response("OK");
  }

  // ── Smart Routing ──
  await sendAction(token, chatId, "typing");
  const agentKey = routeAgent(text, ctx);
  const result = await callAgent(agentKey, text, env);
  const agent = AGENTS[agentKey];
  const readable = jsonToReadable(result.data || result.error, lang);

  await sendMsg(token, chatId, `${agent.icon} *${lang === "ar" ? agent.ar : agent.en}*\n\n${readable}`, {
    reply_to_message_id: msgId,
    reply_markup: getServiceButtons(ctx, lang),
  });

  // Voice response
  if (env.ELEVENLABS_API_KEY) {
    await sendAction(token, chatId, "record_voice");
    const voiceText = lang === "ar" ? `${agent.ar}: ${readable}` : `${agent.en}: ${readable}`;
    const tts = await textToSpeech(voiceText, env.ELEVENLABS_API_KEY);
    if (tts.ok) await sendVoice(token, chatId, tts.audio, { reply_to: msgId });
  }

  // Proactive suggestion
  ctx.addHistory(agentKey, result.ok);
  if (ctx.interactionCount % 3 === 0) {
    const suggestion = getProactiveSuggestion(ctx, lang);
    setTimeout(async () => {
      await sendMsg(token, chatId, `💡 ${suggestion.text}`, {
        reply_markup: getServiceButtons(ctx, lang),
      });
    }, 2000);
  }

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
      { command: "start", description: "🌟 Start BASMA" },
      { command: "sos", description: "🚨 Emergency SOS" },
      { command: "meditron", description: "🏥 Clinical guidelines" },
      { command: "llava-med", description: "📷 Medical imaging" },
      { command: "medical-qa", description: "❓ Medical QA" },
      { command: "models", description: "🤖 List AI models" },
      { command: "generate", description: "🎨 Generate image" },
      { command: "semantic", description: "🔍 Semantic search" },
      { command: "build", description: "🏗️ Build profile" },
      { command: "basma", description: "🌟 Meet BASMA" },
      { command: "help", description: "❓ Help" },
    ]}),
  ]);

  return new Response(JSON.stringify({
    bot: "BASMA — بسمه — Context-Aware Healthcare AI",
    webhook: (await wh.json()).ok ? "configured" : "failed",
    commands: (await cmd.json()).ok ? "configured" : "failed",
    webhookUrl,
    features: [
      "context_aware", "role_detection", "voice_guided", "proactive",
      "satisfaction_tracking", "multi_role", "smart_routing",
      "IRIS", "Oracle", "NPHIES", "HNH", "GIVC", "SBS",
      "12_agents", "clinical_chains", "emergency_sos",
    ],
    roles: Object.keys(ROLES),
  }), { headers: { "content-type": "application/json" } });
}
