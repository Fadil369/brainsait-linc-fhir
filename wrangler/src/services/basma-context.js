// ═══════════════════════════════════════════════════════════
// BASMA Context Engine — Intelligent User Profiling & Routing
// Voice-guided · Proactive · Multi-role · Satisfaction-driven
// ═══════════════════════════════════════════════════════════

// ── User Roles ────────────────────────────────────────────
export const ROLES = {
  patient: {
    ar: "مريض", en: "Patient", icon: "🏥",
    arDesc: "سجلاتي، مواعيدي، تحاليلي، أدويتي",
    enDesc: "My records, appointments, labs, medications",
    priority: ["summary", "labs", "medication-safety", "care-plan", "book", "triage", "reminders", "trends"],
    greeting: {
      ar: "مرحباً! أنا بسمه، مساعدك الصحي. كيف حالك اليوم؟ هل تحتاج مساعدة في موعد، تحاليل، أو أي شيء صحي؟",
      en: "Hello! I'm BASMA, your health assistant. How are you today? Need help with an appointment, labs, or anything health-related?"
    },
    followUp: {
      ar: "هل تريد أن أراجع سجلاتك الطبية أو أحجز لك موعداً؟",
      en: "Would you like me to review your records or book an appointment?"
    }
  },
  provider: {
    ar: "مقدم خدمة طبية", en: "Healthcare Provider", icon: "👨‍⚕️",
    arDesc: "الأدوات السريرية، المرضى، نفيس، التقارير",
    enDesc: "Clinical tools, patients, NPHIES, reports",
    priority: ["triage", "summary", "prior-auth", "clinical-trials", "gaps-in-care", "imaging-followup", "nphies", "hospitals"],
    greeting: {
      ar: "مرحباً دكتور! أنا بسمه. كيف يمكنني مساعدتك اليوم؟ هل تحتاج تقييم مريض، ترخيص مسبق، أو معلومات عن نفيس؟",
      en: "Hello Doctor! I'm BASMA. How can I help today? Need patient evaluation, prior auth, or NPHIES info?"
    },
    followUp: {
      ar: "هل تريد عرض ملخص مريض أو التحقق من الترخيص المسبق؟",
      en: "Would you like a patient summary or check prior authorization?"
    }
  },
  payer: {
    ar: "شركة تأمين", en: "Insurance/Payer", icon: "🏦",
    arDesc: "المطالبات، الأهلية، الموافقات، التحليلات",
    enDesc: "Claims, eligibility, approvals, analytics",
    priority: ["prior-auth", "nphies_claims", "nphies_eligibility", "nphies_network", "readmission-risk", "gaps-in-care"],
    greeting: {
      ar: "مرحباً! أنا بسمه، مساعد التأمين. كيف يمكنني مساعدتك؟ هل تريد التحقق من مطالبة، أهلية، أو تقرير؟",
      en: "Hello! I'm BASMA, your insurance assistant. Need help with a claim, eligibility, or report?"
    },
    followUp: {
      ar: "هل تريد مراجعة مطالبات نفيس أو التحقق من أهلية مريض؟",
      en: "Would you like to review NPHIES claims or check patient eligibility?"
    }
  },
  gov: {
    ar: "جهة حكومية", en: "Government/MOH", icon: "🏛️",
    arDesc: "الامتثال، التدقيق، التقارير، الرقابة",
    enDesc: "Compliance, auditing, reporting, oversight",
    priority: ["compliance", "audit", "nphies_network", "hospitals", "gaps-in-care", "readmission-risk"],
    greeting: {
      ar: "مرحباً! أنا بسمه، مساعد الامتثال. كيف يمكنني مساعدتك؟ هل تريد تقرير امتثال، تدقيق، أو مراقبة؟",
      en: "Hello! I'm BASMA, your compliance assistant. Need a compliance report, audit, or monitoring?"
    },
    followUp: {
      ar: "هل تريد عرض تقرير الامتثال أو حالة نفيس؟",
      en: "Would you like a compliance report or NPHIES status?"
    }
  },
  partner: {
    ar: "شريك برين سايت", en: "BrainSAIT Partner", icon: "🤝",
    arDesc: "التكامل، API، التعاون، الحلول",
    enDesc: "Integration, API, collaboration, solutions",
    priority: ["ecosystem", "api", "integration", "dashboard", "status"],
    greeting: {
      ar: "مرحباً شريكنا! أنا بسمه. كيف يمكنني مساعدتك؟ هل تريد الاطلاع على API، التكامل، أو حالة النظام؟",
      en: "Hello Partner! I'm BASMA. Need API access, integration details, or system status?"
    },
    followUp: {
      ar: "هل تريد عرض وثائق API أو حالة التكامل؟",
      en: "Would you like API docs or integration status?"
    }
  },
  student: {
    ar: "طالب برين سايت", en: "BrainSAIT Student", icon: "🎓",
    arDesc: "التعلم، التدريب، الموارد، المشاريع",
    enDesc: "Learning, training, resources, projects",
    priority: ["learning", "tutorials", "fhir", "agents", "contest"],
    greeting: {
      ar: "مرحباً طالب! أنا بسمه، مساعدك التعليمي. كيف يمكنني مساعدتك؟ هل تريد تعلم FHIR، الوكلاء، أو المشاريع؟",
      en: "Hello Student! I'm BASMA, your learning assistant. Want to learn FHIR, agents, or projects?"
    },
    followUp: {
      ar: "هل تريد شرح FHIR أو عرض أمثلة الوكلاء؟",
      en: "Would you like a FHIR explanation or agent examples?"
    }
  },
  team: {
    ar: "فريق برين سايت", en: "BrainSAIT Team", icon: "👥",
    arDesc: "الإدارة، المراقبة، الإشعارات، الفريق",
    enDesc: "Management, monitoring, alerts, team",
    priority: ["dashboard", "status", "ecosystem", "alerts", "team"],
    greeting: {
      ar: "مرحباً فريق! أنا بسمه. كيف يمكنني مساعدتك؟ هل تريد لوحة القيادة، حالة النظام، أو إشعارات؟",
      en: "Hello Team! I'm BASMA. Need the dashboard, system status, or alerts?"
    },
    followUp: {
      ar: "هل تريد عرض لوحة القيادة أو حالة النظام؟",
      en: "Would you like the dashboard or system status?"
    }
  },
  unknown: {
    ar: "زائر", en: "Visitor", icon: "👋",
    arDesc: "تعرف على بسمه وخدماتنا",
    enDesc: "Learn about BASMA and our services",
    priority: ["about", "basma", "help"],
    greeting: {
      ar: "مرحباً! أنا بسمه، مساعدك الذكي من برين سايت. من أنت؟",
      en: "Hello! I'm BASMA, your smart assistant from BrainSAIT. Who are you?"
    },
    followUp: {
      ar: "هل تريد معرفة المزيد عن خدماتنا؟",
      en: "Would you like to learn more about our services?"
    }
  }
};

// ── Conversation States ───────────────────────────────────
export const STATES = {
  GREETING: "greeting",
  ROLE_SELECTION: "role_selection",
  CONTEXT_COLLECTION: "context_collection",
  SERVICE_ROUTING: "service_routing",
  TASK_EXECUTION: "task_execution",
  FOLLOW_UP: "follow_up",
  SATISFACTION_CHECK: "satisfaction_check",
  IDLE: "idle",
};

// ── Context Manager ───────────────────────────────────────
export class UserContext {
  constructor(chatId) {
    this.chatId = chatId;
    this.role = "unknown";
    this.state = STATES.GREETING;
    this.patientId = null;
    this.history = [];
    this.preferences = { lang: "ar", voice: true };
    this.satisfaction = 0; // 0-100
    this.interactionCount = 0;
    this.lastAgent = null;
    this.collectedInfo = {};
    this.createdAt = Date.now();
    this.lastActive = Date.now();
  }

  updateState(newState) {
    this.state = newState;
    this.lastActive = Date.now();
    this.interactionCount++;
  }

  setRole(role) {
    this.role = ROLES[role] ? role : "unknown";
    this.updateState(STATES.SERVICE_ROUTING);
  }

  addHistory(action, result) {
    this.history.push({ action, result, timestamp: Date.now() });
    if (this.history.length > 20) this.history.shift();
  }

  getRoleConfig() {
    return ROLES[this.role] || ROLES.unknown;
  }

  getSuggestedActions() {
    const roleConfig = this.getRoleConfig();
    return roleConfig.priority.slice(0, 6);
  }

  isSatisfied() {
    return this.satisfaction >= 80;
  }

  incrementSatisfaction(amount = 10) {
    this.satisfaction = Math.min(100, this.satisfaction + amount);
  }

  decrementSatisfaction(amount = 5) {
    this.satisfaction = Math.max(0, this.satisfaction - amount);
  }
}

// ── Context Store (per-user, in-memory) ───────────────────
const contextStore = new Map();

export function getContext(chatId) {
  if (!contextStore.has(chatId)) {
    contextStore.set(chatId, new UserContext(chatId));
  }
  const ctx = contextStore.get(chatId);
  ctx.lastActive = Date.now();
  return ctx;
}

export function clearContext(chatId) {
  contextStore.delete(chatId);
}

// ── Smart Context Collection ──────────────────────────────

export function detectRoleFromText(text) {
  const lower = text.toLowerCase();

  // Arabic role detection
  if (/مريض|مريض|حالتي|صحتي|أدوية|تحاليل|موعد/.test(lower)) return "patient";
  if (/دكتور|طبيب|ممرض|クリニック|مريض/.test(lower)) return "provider";
  if (/تأمين|مطالبة|شركة| страхов/.test(lower)) return "payer";
  if (/حكومة|وزارة|صحة|امتثال|نفيس/.test(lower)) return "gov";
  if (/شريك|تكامل|API|بريسايت/.test(lower)) return "partner";
  if (/طالب|تعلم|تدريب|دورة|فهر/.test(lower)) return "student";
  if (/فريق|إدارة|مراقبة|إشعار/.test(lower)) return "team";

  // English role detection
  if (/patient|my health|my records|appointment|medication/.test(lower)) return "patient";
  if (/doctor|physician|nurse|clinical|patient care/.test(lower)) return "provider";
  if (/insurance|claim|coverage|approval|payer/.test(lower)) return "payer";
  if (/government|ministry|compliance|audit|nphies/.test(lower)) return "gov";
  if (/partner|integration|api|collaboration/.test(lower)) return "partner";
  if (/student|learn|training|course|fhir|agent/.test(lower)) return "student";
  if (/team|management|monitoring|alert|dashboard/.test(lower)) return "team";

  return null;
}

export function detectRoleFromHistory(history) {
  if (!history || history.length === 0) return null;

  const recentActions = history.slice(-5).map(h => h.action);
  const clinicalActions = ["triage", "summary", "labs", "medication-safety", "care-plan"];
  const insuranceActions = ["prior-auth", "nphies", "claims", "eligibility"];

  if (recentActions.some(a => clinicalActions.includes(a))) return "patient";
  if (recentActions.some(a => insuranceActions.includes(a))) return "payer";

  return null;
}

// ── Conversation Flow ─────────────────────────────────────

export function getNextQuestion(ctx, lang = "ar") {
  const role = ctx.getRoleConfig();

  switch (ctx.state) {
    case STATES.GREETING:
      return {
        text: role.greeting[lang],
        voice: true,
        buttons: getRoleButtons(lang),
      };

    case STATES.ROLE_SELECTION:
      return {
        text: lang === "ar"
          ? "من فضلك، من أنت؟ اختر نوعك أو اكتب وصفاً:"
          : "Please select your role or describe yourself:",
        voice: true,
        buttons: getRoleButtons(lang),
      };

    case STATES.CONTEXT_COLLECTION:
      return getContextQuestion(ctx, lang);

    case STATES.SERVICE_ROUTING:
      return {
        text: lang === "ar"
          ? `ممتاز! كيف يمكنني مساعدتك اليوم؟`
          : `Great! How can I help you today?`,
        voice: true,
        buttons: getServiceButtons(ctx, lang),
      };

    case STATES.FOLLOW_UP:
      return {
        text: role.followUp[lang],
        voice: true,
        buttons: getServiceButtons(ctx, lang),
      };

    case STATES.SATISFACTION_CHECK:
      return {
        text: lang === "ar"
          ? "هل كنت راضياً عن الخدمة؟ هل تحتاج شيء آخر؟"
          : "Were you satisfied with the service? Need anything else?",
        voice: true,
        buttons: getSatisfactionButtons(lang),
      };

    default:
      return {
        text: lang === "ar" ? "كيف يمكنني مساعدتك؟" : "How can I help?",
        voice: false,
        buttons: getServiceButtons(ctx, lang),
      };
  }
}

function getContextQuestion(ctx, lang) {
  const role = ctx.role;
  const collected = ctx.collectedInfo;

  // Ask for missing context based on role
  if (role === "patient" && !collected.patientId) {
    return {
      text: lang === "ar"
        ? "هل لديك رقم مريض أو رقم هوية؟ أو تريد أن أبحث عن سجلاتك؟"
        : "Do you have a patient ID or national ID? Or should I search your records?",
      voice: true,
      buttons: [
        [{ text: lang === "ar" ? "🔍 بحث بالاسم" : "🔍 Search by name", callback_data: "ctx_search_name" }],
        [{ text: lang === "ar" ? "🆔 إدخال رقم" : "🆔 Enter ID", callback_data: "ctx_enter_id" }],
        [{ text: lang === "ar" ? "👤 مريض جديد" : "👤 New patient", callback_data: "ctx_new_patient" }],
      ],
    };
  }

  if (role === "provider" && !collected.hospital) {
    return {
      text: lang === "ar"
        ? "في أي مستشفى تعمل؟"
        : "Which hospital do you work at?",
      voice: true,
      buttons: getHospitalButtons(lang),
    };
  }

  if (role === "payer" && !collected.claimType) {
    return {
      text: lang === "ar"
        ? "نوع المطالبة: جديدة، متابعة، أو استفسار؟"
        : "Claim type: new, follow-up, or inquiry?",
      voice: true,
      buttons: [
        [{ text: lang === "ar" ? "📋 جديدة" : "📋 New", callback_data: "claim_new" },
         { text: lang === "ar" ? "🔄 متابعة" : "🔄 Follow-up", callback_data: "claim_followup" }],
        [{ text: lang === "ar" ? "❓ استفسار" : "❓ Inquiry", callback_data: "claim_inquiry" }],
      ],
    };
  }

  // Default: move to service routing
  ctx.updateState(STATES.SERVICE_ROUTING);
  return {
    text: lang === "ar" ? "ممتاز! كيف يمكنني مساعدتك؟" : "Great! How can I help?",
    voice: true,
    buttons: getServiceButtons(ctx, lang),
  };
}

// ── Button Generators ─────────────────────────────────────

export function getRoleButtons(lang) {
  const ar = lang === "ar";
  return { inline_keyboard: [
    [{ text: ar ? "🏥 مريض" : "🏥 Patient", callback_data: "role_patient" },
     { text: ar ? "👨‍⚕️ طبيب" : "👨‍⚕️ Provider", callback_data: "role_provider" }],
    [{ text: ar ? "🏦 تأمين" : "🏦 Insurance", callback_data: "role_payer" },
     { text: ar ? "🏛️ حكومة" : "🏛️ Government", callback_data: "role_gov" }],
    [{ text: ar ? "🤝 شريك" : "🤝 Partner", callback_data: "role_partner" },
     { text: ar ? "🎓 طالب" : "🎓 Student", callback_data: "role_student" }],
    [{ text: ar ? "👥 فريق" : "👥 Team", callback_data: "role_team" },
     { text: ar ? "👋 زائر" : "👋 Visitor", callback_data: "role_unknown" }],
  ]};
}

export function getServiceButtons(ctx, lang) {
  const ar = lang === "ar";
  const role = ctx.getRoleConfig();
  const services = role.priority;

  const buttonMap = {
    summary: { ar: "📋 ملخص", en: "📋 Summary" },
    labs: { ar: "🧪 تحاليل", en: "🧪 Labs" },
    "medication-safety": { ar: "💊 أدوية", en: "💊 Meds" },
    "care-plan": { ar: "📝 خطة", en: "📝 Plan" },
    book: { ar: "📅 موعد", en: "📅 Book" },
    triage: { ar: "🚑 طوارئ", en: "🚑 Triage" },
    reminders: { ar: "📋 تذكير", en: "📋 Remind" },
    trends: { ar: "📈 اتجاه", en: "📈 Trends" },
    "prior-auth": { ar: "✅ ترخيص", en: "✅ Auth" },
    "clinical-trials": { ar: "🔬 تجارب", en: "🔬 Trials" },
    "gaps-in-care": { ar: "🔍 فجوات", en: "🔍 Gaps" },
    "imaging-followup": { ar: "📷 أشعة", en: "📷 Imaging" },
    "readmission-risk": { ar: "⚠️ خطر", en: "⚠️ Risk" },
    nphies: { ar: "🏥 نفيس", en: "🏥 NPHIES" },
    hospitals: { ar: "🏨 مستشفيات", en: "🏨 Hospitals" },
    ecosystem: { ar: "☁️ نظام", en: "☁️ System" },
    dashboard: { ar: "📊 لوحة", en: "📊 Board" },
    status: { ar: "📡 حالة", en: "📡 Status" },
    insights: { ar: "💡 ملاحظات", en: "💡 Insights" },
    sos: { ar: "🚨 طوارئ SOS", en: "🚨 SOS" },
    search: { ar: "🔎 بحث", en: "🔎 Search" },
    records: { ar: "👥 سجلات", en: "👥 Records" },
    schedule: { ar: "💊 جدول", en: "💊 Schedule" },
    chain: { ar: "🔗 سلسلة", en: "🔗 Chain" },
    patient: { ar: "👤 مريض", en: "👤 Patient" },
    voice: { ar: "🔊 صوت", en: "🔊 Voice" },
    about: { ar: "ℹ️ عن", en: "ℹ️ About" },
    basma: { ar: "🌟 بسمه", en: "🌟 BASMA" },
    help: { ar: "❓ مساعدة", en: "❓ Help" },
    learning: { ar: "📚 تعلم", en: "📚 Learn" },
    tutorials: { ar: "📖 دروس", en: "📖 Tutorials" },
    fhir: { ar: "🔬 FHIR", en: "🔬 FHIR" },
    agents: { ar: "🤖 وكلاء", en: "🤖 Agents" },
    contest: { ar: "🏆 مسابقة", en: "🏆 Contest" },
    api: { ar: "🔗 API", en: "🔗 API" },
    integration: { ar: "🔌 تكامل", en: "🔌 Integration" },
    compliance: { ar: "📋 امتثال", en: "📋 Compliance" },
    audit: { ar: "🔍 تدقيق", en: "🔍 Audit" },
    alerts: { ar: "🔔 إشعارات", en: "🔔 Alerts" },
    team: { ar: "👥 فريق", en: "👥 Team" },
  };

  // Build rows of 3 buttons each
  const rows = [];
  for (let i = 0; i < services.length; i += 3) {
    const row = services.slice(i, i + 3).map(s => {
      const btn = buttonMap[s] || { ar: s, en: s };
      return { text: ar ? btn.ar : btn.en, callback_data: s };
    });
    rows.push(row);
  }

  // Add utility row
  rows.push([
    { text: ar ? "🚨 طوارئ" : "🚨 SOS", callback_data: "sos" },
    { text: ar ? "🔄 تبديل" : "🔄 Switch", callback_data: "role_switch" },
    { text: ar ? "🔊 بسمه" : "🔊 BASMA", callback_data: "basma_intro" },
  ]);

  return { inline_keyboard: rows };
}

function getHospitalButtons(lang) {
  const ar = lang === "ar";
  return { inline_keyboard: [
    [{ text: ar ? "🏙️ الرياض" : "🏙️ Riyadh", callback_data: "hospital_riyadh" },
     { text: ar ? "🕌 المدينة" : "🕌 Madinah", callback_data: "hospital_madinah" }],
    [{ text: ar ? "🏔️ أبها" : "🏔️ Abha", callback_data: "hospital_abha" },
     { text: ar ? "🌊 جازان" : "🌊 Jizan", callback_data: "hospital_jizan" }],
    [{ text: ar ? "🏘️ خميس" : "🏘️ Khamis", callback_data: "hospital_khamis" },
     { text: ar ? "🏡 عنيزة" : "🏡 Unaizah", callback_data: "hospital_unaizah" }],
  ]};
}

function getSatisfactionButtons(lang) {
  const ar = lang === "ar";
  return { inline_keyboard: [
    [{ text: ar ? "✅ نعم، ممتاز" : "✅ Yes, great!", callback_data: "satisfied_yes" },
     { text: ar ? "🔄 أحتاج مساعدة" : "🔄 Need help", callback_data: "satisfied_no" }],
    [{ text: ar ? "🏠 القائمة الرئيسية" : "🏠 Main menu", callback_data: "main_menu" }],
  ]};
}

// ── Proactive Suggestions ─────────────────────────────────

export function getProactiveSuggestion(ctx, lang = "ar") {
  const role = ctx.role;
  const history = ctx.history;
  const count = ctx.interactionCount;

  // First interaction: suggest role-specific actions
  if (count <= 1) {
    const roleConfig = ctx.getRoleConfig();
    return {
      text: lang === "ar"
        ? `بناءً على دورك، أنصحك بـ:\n${roleConfig.priority.slice(0, 3).map(a => `• ${a}`).join("\n")}`
        : `Based on your role, I suggest:\n${roleConfig.priority.slice(0, 3).map(a => `• ${a}`).join("\n")}`,
      actions: roleConfig.priority.slice(0, 3),
    };
  }

  // After triage: suggest follow-up
  if (history.some(h => h.action === "triage")) {
    return {
      text: lang === "ar"
        ? "بعد الفحص الأولي، أنصحك بـ:\n• ملخص المريض\n• خطة الرعاية\n• سلامة الأدوية"
        : "After triage, I suggest:\n• Patient summary\n• Care plan\n• Medication safety",
      actions: ["summary", "care-plan", "medication-safety"],
    };
  }

  // After labs: suggest interpretation
  if (history.some(h => h.action === "lab-explainer")) {
    return {
      text: lang === "ar"
        ? "بعد شرح التحاليل، أنصحك بـ:\n• فجوات الرعاية\n• خطة العلاج\n• المتابعة"
        : "After lab explanation, I suggest:\n• Care gaps\n• Treatment plan\n• Follow-up",
      actions: ["gaps-in-care", "care-plan", "reminders"],
    };
  }

  // Default: suggest based on role
  const roleConfig = ctx.getRoleConfig();
  return {
    text: lang === "ar"
      ? "هل تريد anything آخر؟"
      : "Need anything else?",
    actions: roleConfig.priority.slice(0, 3),
  };
}

// ── Satisfaction Tracking ─────────────────────────────────

export function updateSatisfaction(ctx, feedback) {
  if (feedback === "satisfied_yes") {
    ctx.incrementSatisfaction(20);
    return {
      text: ctx.preferences.lang === "ar"
        ? "شكراً لك! سعيدة بمساعدتك. هل تريد anything آخر؟"
        : "Thank you! Happy to help. Need anything else?",
    };
  }

  if (feedback === "satisfied_no") {
    ctx.decrementSatisfaction(10);
    return {
      text: ctx.preferences.lang === "ar"
        ? "أعتذر! دعني أساعدك بشكل أفضل. ما الذي تحتاجه؟"
        : "Sorry! Let me help better. What do you need?",
    };
  }

  return null;
}

// ── Context Summary ───────────────────────────────────────

export function getContextSummary(ctx, lang = "ar") {
  const role = ctx.getRoleConfig();
  const duration = Math.floor((Date.now() - ctx.createdAt) / 60000);

  return lang === "ar"
    ? `👤 *ملخص السياق*\n\nالدور: ${role.icon} ${role.ar}\nالحالة: ${ctx.state}\nالتفاعلات: ${ctx.interactionCount}\nالرضا: ${ctx.satisfaction}%\nالمدة: ${duration} دقيقة\nالمريض: ${ctx.patientId || "غير محدد"}`
    : `👤 *Context Summary*\n\nRole: ${role.icon} ${role.en}\nState: ${ctx.state}\nInteractions: ${ctx.interactionCount}\nSatisfaction: ${ctx.satisfaction}%\nDuration: ${duration} min\nPatient: ${ctx.patientId || "Not set"}`;
}
