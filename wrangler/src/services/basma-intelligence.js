// ═══════════════════════════════════════════════════════════
// BASMA Health Intelligence Engine
// Proactive alerts · Health trends · Clinical chains · Emergency SOS
// ═══════════════════════════════════════════════════════════

// ── Lab Reference Ranges ──────────────────────────────────
const LAB_RANGES = {
  "4548-4":  { name: "HbA1c",     unit: "%",    low: 4.0, high: 5.6,  critHigh: 9.0,  ar: "الهيموجلوبين السكري" },
  "2345-7":  { name: "Glucose",   unit: "mg/dL", low: 70, high: 100,  critHigh: 300,  ar: "السكر" },
  "2093-3":  { name: "Cholesterol", unit: "mg/dL", low: 0, high: 200,  critHigh: 300,  ar: "الكوليسترول" },
  "2571-8":  { name: "Triglycerides", unit: "mg/dL", low: 0, high: 150, critHigh: 500, ar: "الدهون الثلاثية" },
  "2160-0":  { name: "Creatinine", unit: "mg/dL", low: 0.6, high: 1.2, critHigh: 5.0, ar: "الكرياتينين" },
  "3094-0":  { name: "BUN",       unit: "mg/dL", low: 7, high: 20,   critHigh: 100,  ar: "اليوريا" },
  "17861-6": { name: "Calcium",   unit: "mg/dL", low: 8.5, high: 10.5, critHigh: 15,  ar: "الكالسيوم" },
  "2951-2":  { name: "Sodium",    unit: "mEq/L", low: 136, high: 145,  critHigh: 160, ar: "الصوديوم" },
  "2823-3":  { name: "Potassium", unit: "mEq/L", low: 3.5, high: 5.0,  critHigh: 6.5, ar: "البوتاسيوم" },
  "718-7":   { name: "Hemoglobin", unit: "g/dL", low: 12, high: 17.5,  critHigh: 20,  ar: "الهيموجلوبين" },
  "6690-2":  { name: "WBC",       unit: "K/uL",  low: 4.5, high: 11.0,  critHigh: 30,  ar: "كريات الدم البيضاء" },
  "785-6":   { name: "MCH",       unit: "pg",    low: 27, high: 33,    critHigh: 50,  ar: "متوسط الهيموجلوبين" },
  "787-2":   { name: "MCV",       unit: "fL",    low: 80, high: 100,   critHigh: 120, ar: "متوسط حجم الخلية" },
  "2085-9":  { name: "HDL",       unit: "mg/dL", low: 40, high: 100,   critHigh: 150, ar: "الكوليسترول الجيد" },
  "2089-1":  { name: "LDL",       unit: "mg/dL", low: 0, high: 100,    critHigh: 190, ar: "الكوليسترول الضار" },
};

// ── BP/Vitals Reference ───────────────────────────────────
const VITAL_RANGES = {
  systolic:  { low: 90, high: 120, critHigh: 180, critLow: 70, name: "Systolic BP", ar: "ضغط الدم الانقباضي" },
  diastolic: { low: 60, high: 80,  critHigh: 120, critLow: 50, name: "Diastolic BP", ar: "ضغط الدم الانبساطي" },
  heartRate: { low: 60, high: 100, critHigh: 150, critLow: 40, name: "Heart Rate", ar: "معدل ضربات القلب" },
  temp:      { low: 36.1, high: 37.2, critHigh: 39.5, critLow: 35, name: "Temperature", ar: "درجة الحرارة" },
  spo2:      { low: 95, high: 100, critHigh: 101, critLow: 90, name: "SpO2", ar: "تشبع الأكسجين" },
  respRate:  { low: 12, high: 20, critHigh: 30, critLow: 8, name: "Respiratory Rate", ar: "معدل التنفس" },
};

// ── Health Alert Detection ────────────────────────────────

export function analyzeLabResults(observations, lang = "en") {
  const alerts = [];
  for (const obs of observations) {
    const code = obs.code?.coding?.[0]?.code;
    const value = obs.valueQuantity?.value;
    const ref = LAB_RANGES[code];
    if (!ref || value == null) continue;

    let severity = "normal";
    let message = "";

    if (value >= ref.critHigh) {
      severity = "critical";
      message = lang === "ar"
        ? `🔴 ${ref.ar}: ${value} ${ref.unit} — مرتفع بشكل حرج! (${ref.name} ≥${ref.critHigh})`
        : `🔴 ${ref.name}: ${value} ${ref.unit} — CRITICALLY HIGH! (≥${ref.critHigh})`;
    } else if (value > ref.high) {
      severity = "high";
      message = lang === "ar"
        ? `🟡 ${ref.ar}: ${value} ${ref.unit} — مرتفع (${ref.name} >${ref.high})`
        : `🟡 ${ref.name}: ${value} ${ref.unit} — HIGH (>${ref.high})`;
    } else if (value < ref.low) {
      severity = "low";
      message = lang === "ar"
        ? `🟡 ${ref.ar}: ${value} ${ref.unit} — منخفض (${ref.name} <${ref.low})`
        : `🟡 ${ref.name}: ${value} ${ref.unit} — LOW (<${ref.low})`;
    }

    if (severity !== "normal") {
      alerts.push({
        type: "lab",
        severity,
        code,
        name: ref.name,
        nameAr: ref.ar,
        value,
        unit: ref.unit,
        range: `${ref.low}-${ref.high}`,
        message,
      });
    }
  }
  return alerts.sort((a, b) => {
    const order = { critical: 0, high: 1, low: 2, normal: 3 };
    return order[a.severity] - order[b.severity];
  });
}

export function analyzeVitals(vitals, lang = "en") {
  const alerts = [];
  for (const [key, val] of Object.entries(vitals)) {
    const ref = VITAL_RANGES[key];
    if (!ref || val == null) continue;

    let severity = "normal";
    let message = "";

    if (val >= ref.critHigh || val <= ref.critLow) {
      severity = "critical";
      message = lang === "ar"
        ? `🔴 ${ref.ar}: ${val} — حالة حرجة!`
        : `🔴 ${ref.name}: ${val} — CRITICAL!`;
    } else if (val > ref.high || val < ref.low) {
      severity = "warning";
      message = lang === "ar"
        ? `🟡 ${ref.ar}: ${val} — خارج النطاق الطبيعي`
        : `🟡 ${ref.name}: ${val} — outside normal range`;
    }

    if (severity !== "normal") {
      alerts.push({ type: "vital", severity, name: ref.name, nameAr: ref.ar, value: val, message });
    }
  }
  return alerts;
}

// ── Health Trends ─────────────────────────────────────────

export function calculateTrend(values) {
  if (!values || values.length < 2) return { direction: "→", label: "stable", labelAr: "مستقر" };
  const recent = values.slice(-3);
  const older = values.slice(0, -3);
  const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;
  const avgOlder = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : avgRecent;
  const pctChange = ((avgRecent - avgOlder) / avgOlder) * 100;

  if (pctChange > 10) return { direction: "↑", label: "rising", labelAr: "ارتفاع", pct: pctChange.toFixed(1) };
  if (pctChange < -10) return { direction: "↓", label: "falling", labelAr: "انخفاض", pct: Math.abs(pctChange).toFixed(1) };
  return { direction: "→", label: "stable", labelAr: "مستقر", pct: Math.abs(pctChange).toFixed(1) };
}

export function sparkline(values, min, max) {
  if (!values || values.length === 0) return "";
  const blocks = "▁▂▃▄▅▆▇█";
  const range = max - min || 1;
  return values.map(v => {
    const idx = Math.min(Math.max(Math.round(((v - min) / range) * (blocks.length - 1)), 0), blocks.length - 1);
    return blocks[idx];
  }).join("");
}

export function formatTrend(name, values, unit, lang = "en") {
  const trend = calculateTrend(values);
  const spark = sparkline(values, Math.min(...values) * 0.9, Math.max(...values) * 1.1);
  const latest = values[values.length - 1];
  const arrow = trend.direction === "↑" ? "📈" : trend.direction === "↓" ? "📉" : "➡️";

  return lang === "ar"
    ? `${arrow} ${name}: ${latest} ${unit} ${spark} (${trend.labelAr} ${trend.pct}%)`
    : `${arrow} ${name}: ${latest} ${unit} ${spark} (${trend.label} ${trend.pct}%)`;
}

// ── Clinical Decision Chains ──────────────────────────────

export const CHAINS = {
  "patient-360": {
    ar: "عرض المريض الشامل",
    en: "Patient 360 View",
    icon: "🔄",
    agents: ["summary", "medication-safety", "gaps-in-care", "imaging-followup", "care-plan"],
    mode: "sequential",
    description: ar => "تحليل شامل: ملخص → أدوية → فجوات → أشعة → خطة",
    descriptionEn: "Complete analysis: Summary → Meds → Gaps → Imaging → Plan",
  },
  "admission": {
    ar: "سير عمل الدخول",
    en: "Admission Workflow",
    icon: "🏥",
    agents: ["triage", "summary", "readmission-risk", "care-plan"],
    mode: "sequential",
    description: ar => "دخول المستشفى: فحص → ملخص → خطر → خطة",
    descriptionEn: "Hospital admission: Triage → Summary → Risk → Plan",
  },
  "claims": {
    ar: "تحضير المطالبات",
    en: "Claims Preparation",
    icon: "💰",
    agents: ["prior-auth", "gaps-in-care", "sdoh-referral"],
    mode: "parallel",
    description: ar => "مطالبات: ترخيص + فجوات + إحالات (متوازي)",
    descriptionEn: "Claims: Auth + Gaps + SDOH (parallel)",
  },
  "discharge": {
    ar: "سير عمل الخروج",
    en: "Discharge Workflow",
    icon: "🚪",
    agents: ["summary", "medication-safety", "imaging-followup", "readmission-risk", "care-plan"],
    mode: "sequential",
    description: ar => "خروج: ملخص → أدوية → أشعة → خطر → خطة",
    descriptionEn: "Discharge: Summary → Meds → Imaging → Risk → Plan",
  },
  "research": {
    ar: "البحث السريري",
    en: "Clinical Research",
    icon: "🔬",
    agents: ["summary", "clinical-trials", "nl-query"],
    mode: "sequential",
    description: ar => "بحث: ملخص → تجارب → استعلام",
    descriptionEn: "Research: Summary → Trials → Query",
  },
  "full-checkup": {
    ar: "فحص شامل",
    en: "Full Checkup",
    icon: "🩺",
    agents: ["summary", "medication-safety", "lab-explainer", "gaps-in-care", "imaging-followup", "readmission-risk", "care-plan", "clinical-trials", "sdoh-referral"],
    mode: "sequential",
    description: ar => "فحص شامل لجميع الوكلاء",
    descriptionEn: "Run all agents for complete checkup",
  },
};

export async function runChain(chainKey, patientId, callAgentFn, env, lang = "en") {
  const chain = CHAINS[chainKey];
  if (!chain) return { ok: false, error: "Unknown chain" };

  const results = {};
  const startTime = Date.now();

  if (chain.mode === "parallel") {
    const promises = chain.agents.map(async (agentKey) => {
      const result = await callAgentFn(agentKey, patientId, env);
      return [agentKey, result];
    });
    const entries = await Promise.all(promises);
    entries.forEach(([k, v]) => { results[k] = v; });
  } else {
    for (const agentKey of chain.agents) {
      results[agentKey] = await callAgentFn(agentKey, patientId, env);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const summary = summarizeChainResults(results, chain, lang, elapsed);

  return { ok: true, chain: chainKey, results, elapsed, summary };
}

function summarizeChainResults(results, chain, lang, elapsed) {
  const lines = [];
  lines.push(lang === "ar"
    ? `${chain.icon} *${chain.ar}* (${elapsed}ث)\n`
    : `${chain.icon} *${chain.en}* (${elapsed}s)\n`);

  for (const [agentKey, result] of Object.entries(results)) {
    const data = result.data || result.error || {};
    const icon = result.ok !== false ? "✅" : "❌";

    if (typeof data === "object" && data !== null) {
      // Extract key metrics
      const keys = Object.keys(data).slice(0, 3);
      const summary = keys.map(k => {
        const v = data[k];
        if (Array.isArray(v)) return `${k}: ${v.length}`;
        if (typeof v === "object") return `${k}: {...}`;
        return `${k}: ${String(v).slice(0, 40)}`;
      }).join(", ");
      lines.push(`${icon} ${agentKey}: ${summary}`);
    } else {
      lines.push(`${icon} ${agentKey}: ${String(data).slice(0, 60)}`);
    }
  }

  return lines.join("\n");
}

// ── Emergency SOS ─────────────────────────────────────────

export async function handleEmergencySOS(patientId, symptoms, callAgentFn, env, lang = "en") {
  // 1. Immediate triage
  const triage = await callAgentFn("triage", symptoms || "emergency situation", env);

  // 2. Get patient summary
  const summary = await callAgentFn("summary", patientId, env);

  // 3. Check medications for interactions
  const meds = await callAgentFn("medication-safety", patientId, env);

  // 4. Build emergency report
  const triageData = triage.data || {};
  const level = triageData.level || "unknown";
  const score = triageData.score || 0;
  const actions = triageData.actions || [];
  const redFlags = triageData.red_flags || [];

  const report = lang === "ar"
    ? `🚨 *تنبيه طوارئ — بسمه*

*مستوى الخطورة:* ${level} (${score}/5)
*الأعراض:* ${symptoms || "غير محدد"}

*الإجراءات الفورية:*
${actions.map(a => `⚠️ ${a}`).join("\n")}

*علامات الخطر:*
${redFlags.map(f => `🔴 ${f}`).join("\n")}

*الدواء:* ${meds.ok !== false ? "تم الفحص" : "غير متاح"}

⚡ *اتصل بالإسعاف: 997*
🏥 *أقرب مستشفى: تواصل مع 911*`
    : `🚨 *EMERGENCY ALERT — BASMA*

*Severity:* ${level} (${score}/5)
*Symptoms:* ${symptoms || "Not specified"}

*Immediate Actions:*
${actions.map(a => `⚠️ ${a}`).join("\n")}

*Red Flags:*
${redFlags.map(f => `🔴 ${f}`).join("\n")}

*Medication Check:* ${meds.ok !== false ? "Checked" : "Unavailable"}

⚡ *Call Emergency: 997 (Saudi Arabia)*
🏥 *Nearest Hospital: Contact 911*`;

  return {
    ok: true,
    level,
    score,
    actions,
    redFlags,
    report,
    triage: triageData,
    summary: summary.data,
    meds: meds.data,
  };
}

// ── Medication Schedule ───────────────────────────────────

export function generateMedSchedule(medications, lang = "en") {
  const schedule = [];
  const times = { morning: "08:00", afternoon: "14:00", evening: "20:00", night: "22:00" };

  for (const med of medications) {
    const name = med.medicationCodeableConcept?.text || med.medicationCodeableConcept?.coding?.[0]?.display || "Unknown";
    const dosage = med.dosageInstruction?.[0]?.text || "As directed";

    let timeSlots = [];
    const dosageLower = dosage.toLowerCase();
    if (dosageLower.includes("twice") || dosageLower.includes("مرتين")) {
      timeSlots = [times.morning, times.evening];
    } else if (dosageLower.includes("three") || dosageLower.includes("ثلاث")) {
      timeSlots = [times.morning, times.afternoon, times.evening];
    } else if (dosageLower.includes("night") || dosageLower.includes("مساء")) {
      timeSlots = [times.night];
    } else {
      timeSlots = [times.morning];
    }

    schedule.push({
      medication: name,
      dosage,
      times: timeSlots,
      nextDose: timeSlots[0],
    });
  }

  return schedule;
}

export function formatMedSchedule(schedule, lang = "ar") {
  if (schedule.length === 0) return lang === "ar" ? "لا توجد أدوية" : "No medications";

  return schedule.map(s => {
    const times = s.times.join(", ");
    return lang === "ar"
      ? `💊 ${s.medication} — ${s.dosage}\n   ⏰ ${times}`
      : `💊 ${s.medication} — ${s.dosage}\n   ⏰ ${times}`;
  }).join("\n\n");
}

// ── Smart Insights ────────────────────────────────────────

export function generateInsights(patientData, lang = "en") {
  const insights = [];
  const conditions = patientData.conditions || [];
  const medications = patientData.medications || [];
  const labs = patientData.observations || [];

  // Diabetes + Hypertension combo
  const hasDiabetes = conditions.some(c => (c.code?.coding?.[0]?.display || "").toLowerCase().includes("diabetes"));
  const hasHTN = conditions.some(c => (c.code?.coding?.[0]?.display || "").toLowerCase().includes("hypertension"));
  if (hasDiabetes && hasHTN) {
    insights.push({
      type: "risk",
      icon: "⚠️",
      ar: "الإصابة بالسكري وارتفاع ضغط الدم معاً يزيد خطر أمراض القلب والكلى بنسبة 4 أضعاف",
      en: "Having both diabetes and hypertension increases heart/kidney disease risk by 4x",
      priority: "high",
    });
  }

  // Polypharmacy check
  if (medications.length >= 5) {
    insights.push({
      type: "medication",
      icon: "💊",
      ar: `تتناول ${medications.length} أدوية — قد تتفاعل مع بعضها. تأكد من مراجعة الصيدلي`,
      en: `Taking ${medications.length} medications — check for interactions with your pharmacist`,
      priority: "medium",
    });
  }

  // Lab trends
  const hba1c = labs.find(l => l.code?.coding?.[0]?.code === "4548-4");
  if (hba1c && hba1c.valueQuantity?.value > 7) {
    insights.push({
      type: "lab",
      icon: "🧪",
      ar: `الهيموجلوبين السكري (${hba1c.valueQuantity.value}%) مرتفع — يحتاج تعديل خطة العلاج`,
      en: `HbA1c (${hba1c.valueQuantity.value}%) is elevated — treatment plan adjustment needed`,
      priority: "high",
    });
  }

  // CKD + Metformin warning
  const hasCKD = conditions.some(c => (c.code?.coding?.[0]?.display || "").toLowerCase().includes("kidney"));
  const hasMetformin = medications.some(m => (m.medicationCodeableConcept?.text || "").toLowerCase().includes("metformin"));
  if (hasCKD && hasMetformin) {
    insights.push({
      type: "safety",
      icon: "🔴",
      ar: "تحذير: الميتفورمين مع مرض الكلى المزمن قد يحتاج تعديل الجرعة",
      en: "Warning: Metformin with CKD may require dose adjustment",
      priority: "critical",
    });
  }

  return insights.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return (order[a.priority] || 3) - (order[b.priority] || 3);
  });
}

export function formatInsights(insights, lang = "ar") {
  if (insights.length === 0) return lang === "ar" ? "✅ لا توجد ملاحظات" : "✅ No insights";

  return insights.map(i => {
    const text = lang === "ar" ? i.ar : i.en;
    return `${i.icon} ${text}`;
  }).join("\n\n");
}
