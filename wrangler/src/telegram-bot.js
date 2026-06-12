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
      { command: "build", description: "🏗️ Build profile" },
      { command: "profile", description: "📋 My profiles" },
      { command: "basma", description: "🏥 Meet BASMA" },
      { command: "context", description: "👤 My context" },
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
