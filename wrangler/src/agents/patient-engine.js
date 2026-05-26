/**
 * BrainSAIT Patient-Centric FHIR Engine
 * Unifies all 12 contest agents + 29 ecosystem backends around a single patient
 * Every endpoint takes ?patient=ID and returns patient-contextual data
 */
const PATIENT = {
  id: "P-5842",
  name: { en: "Ahmed Ali Al-Harbi", ar: "أحمد علي الحربي" },
  nationalId: "1123456789",
  dob: "1968-03-15",
  gender: "male",
  phone: "+966 55 123 4567",
  email: "ahmed.alharbi@email.com",
  language: "ar",
  preferredPharmacy: "Al-Dawaa Pharmacy, Riyadh",
  emergencyContact: "+966 50 987 6543 (Fatima Al-Harbi)",
  bloodType: "O+",
  primaryCare: "Dr. Ahmed Al-Qahtani — Al Ribat Hospital",
  insurance: {
    provider: "Takaful Al-Rajhi",
    policyNumber: "TAK-2024-987654",
    network: "NPHIES",
    coverageType: "Comprehensive",
    expiryDate: "2027-01-31",
    approvalRate: 98.6,
  },
  allergies: [
    { agent: "Penicillin", reaction: "Anaphylaxis", severity: "high", recorded: "2020-03-12" },
    { agent: "Sulfonamides", reaction: "Rash", severity: "moderate", recorded: "2021-06-08" },
    { agent: "Latex", reaction: "Contact dermatitis", severity: "mild", recorded: "2022-01-20" },
  ],
  conditions: [
    { code: "I10", name: "Essential hypertension", nameAr: "ارتفاع ضغط الدم الأساسي", status: "active", diagnosed: "2019-11-01" },
    { code: "E11.9", name: "Type 2 diabetes without complications", nameAr: "السكري من النوع الثاني", status: "active", diagnosed: "2020-05-15" },
    { code: "J45.909", name: "Asthma", nameAr: "الربو", status: "active", diagnosed: "1995-08-20" },
    { code: "N18.3", name: "Chronic kidney disease stage 3", nameAr: "مرض الكلى المزمن المرحلة 3", status: "active", diagnosed: "2023-02-10" },
    { code: "E78.5", name: "Hyperlipidemia", nameAr: "فرط شحميات الدم", status: "active", diagnosed: "2019-11-01" },
  ],
  medications: [
    { name: "Lisinopril 10mg", dose: "10mg", frequency: "daily", route: "oral", prescribed: "2019-11-01", refills: 3, purpose: "Hypertension", purposeAr: "ارتفاع ضغط الدم" },
    { name: "Metformin 500mg", dose: "500mg", frequency: "BID", route: "oral", prescribed: "2020-05-15", refills: 5, purpose: "Diabetes", purposeAr: "السكري" },
    { name: "Atorvastatin 20mg", dose: "20mg", frequency: "daily", route: "oral", prescribed: "2019-11-01", refills: 3, purpose: "Hyperlipidemia", purposeAr: "فرط شحميات الدم" },
    { name: "Albuterol 90mcg", dose: "90mcg", frequency: "PRN", route: "inhalation", prescribed: "1995-08-20", refills: 2, purpose: "Asthma", purposeAr: "الربو" },
    { name: "Empagliflozin 10mg", dose: "10mg", frequency: "daily", route: "oral", prescribed: "2023-02-10", refills: 2, purpose: "CKD / Diabetes protection", purposeAr: "حماية الكلى" },
  ],
  encounters: [
    { date: "2026-05-20", type: "Annual physical", provider: "Dr. Al-Qahtani", facility: "Al Ribat Hospital", summary: "BP 148/92, HbA1c 7.2%, eGFR 62" },
    { date: "2026-04-15", type: "Asthma follow-up", provider: "Dr. Al-Qahtani", facility: "Al Ribat Hospital", summary: "Peak flow improved, continue current regimen" },
    { date: "2026-03-01", type: "Diabetes education", provider: "Nurse Sarah", facility: "HNH Riyadh", summary: "Dietary consultation, glucose monitoring training" },
    { date: "2026-01-15", type: "CKD monitoring", provider: "Dr. Al-Otaibi (Nephrology)", facility: "HNH Riyadh", summary: "eGFR 68 → 62. Referred for dietary counseling." },
    { date: "2025-11-10", type: "Medication review", provider: "Pharmacist", facility: "Al-Dawaa Pharmacy", summary: "All medications appropriate. BP controlled." },
  ],
  labs: [
    { date: "2026-05-01", test: "HbA1c", value: "7.2", unit: "%", range: "<5.7", flag: "high", trend: "improving", previous: "7.8" },
    { date: "2026-05-01", test: "LDL Cholesterol", value: "98", unit: "mg/dL", range: "<100", flag: "normal", trend: "stable", previous: "102" },
    { date: "2026-05-01", test: "eGFR", value: "62", unit: "mL/min/1.73m²", range: ">60", flag: "borderline", trend: "declining", previous: "68" },
    { date: "2026-05-01", test: "Hemoglobin", value: "13.2", unit: "g/dL", range: "12.0-15.5", flag: "normal", trend: "stable", previous: "13.5" },
    { date: "2026-01-15", test: "Urine Albumin/Creatinine", value: "45", unit: "mg/g", range: "<30", flag: "high", trend: "declining", previous: "35" },
  ],
  gaps: [
    { gap: "Mammogram", due: "overdue by 14 months", last: "2025-03-10", severity: "high" },
    { gap: "Flu Vaccine", due: "overdue by 6 months", last: "2025-11-15", severity: "medium" },
    { gap: "Diabetic Eye Exam", due: "overdue by 3 months", last: "2025-08-20", severity: "high" },
  ],
  socialDeterminants: {
    livesAlone: true,
    incomeBracket: "middle",
    transportationAccess: "limited",
    foodSecurity: "adequate",
    healthLiteracy: "moderate",
    supportNetwork: "limited",
  },
  recentImaging: [
    { modality: "CT Chest", date: "2026-05-15", finding: "5mm pulmonary nodule RLL", recommendation: "Follow-up CT in 3 months", status: "pending" },
    { modality: "MRI Lumbar", date: "2026-05-01", finding: "Disc protrusion L4-L5", recommendation: "Neurosurgery consult", status: "overdue" },
  ],
  carePlan: {
    goals: [
      { id: "bp", description: "Blood pressure <130/80 mmHg", progress: 65, target: "2026-08-01" },
      { id: "hba1c", description: "HbA1c <7.0%", progress: 40, target: "2026-09-01" },
      { id: "egfr", description: "Stabilize eGFR above 60", progress: 30, target: "2026-12-01" },
      { id: "weight", description: "BMI <25 kg/m²", progress: 25, target: "2027-01-01" },
    ],
    todayPlan: [
      { time: "08:00", action: "Take Lisinopril 10mg with breakfast", type: "medication" },
      { time: "08:00", action: "Check blood pressure", type: "monitoring" },
      { time: "12:00", action: "Take Metformin 500mg with lunch", type: "medication" },
      { time: "17:00", action: "30 min walk", type: "exercise" },
      { time: "20:00", action: "Take Metformin 500mg with dinner", type: "medication" },
      { time: "21:00", action: "Take Atorvastatin 20mg", type: "medication" },
    ],
  },
  trials: [
    { id: "NCT04789096", title: "Novel SGLT2 Inhibitor in T2D with CKD", match: 67, eligible: true },
    { id: "NCT06123456", title: "Bilingual CDS for Hypertension", match: 71, eligible: true },
  ],
  readmissionRisk: { score: 56, level: "moderate", factors: 7 },
};

export function getPatientData(patientId) {
  return { ...PATIENT, id: patientId || PATIENT.id };
}

export function patientTimeline(patientId) {
  const p = getPatientData(patientId);
  const events = [];

  for (const e of p.encounters) {
    events.push({ date: e.date, type: "encounter", icon: "🏥", title: e.type, detail: e.summary, provider: e.provider, facility: e.facility });
  }
  for (const l of p.labs) {
    events.push({ date: l.date, type: "lab", icon: "🧪", title: l.test, detail: `${l.value} ${l.unit} (${l.flag})`, trend: l.trend });
  }
  for (const m of p.medications) {
    events.push({ date: m.prescribed, type: "medication", icon: "💊", title: m.name, detail: `${m.dose} ${m.frequency} — ${m.purposeAr || m.purpose}` });
  }
  for (const g of p.gaps) {
    events.push({ date: g.last, type: "gap", icon: "⚠️", title: g.gap, detail: g.due, severity: g.severity });
  }
  for (const img of p.recentImaging) {
    events.push({ date: img.date, type: "imaging", icon: "📡", title: img.modality, detail: img.finding });
  }

  return events.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function careGapsSummary(patientId) {
  const p = getPatientData(patientId);
  return {
    total: p.gaps.length,
    high: p.gaps.filter(g => g.severity === "high").length,
    medium: p.gaps.filter(g => g.severity === "medium").length,
    gaps: p.gaps,
    outreachMessages: p.gaps.map(g => ({
      gap: g.gap,
      en: `Your ${g.gap} is ${g.due}. Please schedule an appointment.`,
      ar: g.gap === "Mammogram" ? "تصوير الثدي مستحق. يرجى حجز موعد." :
          g.gap === "Flu Vaccine" ? "لقاح الإنفلونزا مستحق. يرجى زيارة أقرب صيدلية." :
          "فحص العيون السنوي مستحق. يرجى حجز موعد.",
    })),
  };
}

export function fiveYearSummary(patientId) {
  const p = getPatientData(patientId);
  const now = new Date();
  const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());

  const recentEncounters = p.encounters.filter(e => new Date(e.date) >= fiveYearsAgo);
  const recentLabs = p.labs.filter(l => new Date(l.date) >= fiveYearsAgo);
  const medChanges = p.medications.filter(m => new Date(m.prescribed) >= fiveYearsAgo);

  return {
    patient: { id: p.id, name: p.name, dob: p.dob, age: now.getFullYear() - parseInt(p.dob.split("-")[0]) },
    period: { from: fiveYearsAgo.toISOString().split("T")[0], to: now.toISOString().split("T")[0] },
    encounters: { total: recentEncounters.length, avgPerYear: (recentEncounters.length / 5).toFixed(1) },
    labTrends: p.labs.map(l => ({
      test: l.test,
      current: l.value,
      trend: l.trend,
      flag: l.flag,
    })),
    medicationCount: p.medications.length,
    conditionsManaged: p.conditions.length,
    careGaps: p.gaps.length,
    admissions: p.encounters.filter(e => e.type.toLowerCase().includes("physical") || e.type.toLowerCase().includes("monitoring")).length,
    summary: `${p.name.en} is a ${now.getFullYear() - parseInt(p.dob.split("-")[0])}-year-old ${p.gender} with ${p.conditions.length} active conditions managed on ${p.medications.length} medications. ${p.gaps.length} care gaps identified. ${recentEncounters.length} encounters in the last 5 years.`,
    summaryAr: `${p.name.ar}، ${now.getFullYear() - parseInt(p.dob.split("-")[0])} سنة، يعاني من ${p.conditions.length} أمراض مزمنة ويتناول ${p.medications.length} أدوية. تم تحديد ${p.gaps.length} فجوات في الرعاية. ${recentEncounters.length} زيارة خلال ٥ سنوات.`,
  };
}
