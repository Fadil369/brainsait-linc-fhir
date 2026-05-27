import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CONTEST_FEATURES = [
  { id: "summary", icon: "🩺", label: "Patient Summary", short: "Summary" },
  { id: "prior-auth", icon: "📋", label: "Prior Auth", short: "Prior Auth" },
  { id: "gaps", icon: "🔍", label: "Care Gaps", short: "Care Gaps" },
  { id: "med-safety", icon: "💊", label: "Med Safety", short: "Med Safety" },
  { id: "care-plan", icon: "🗺️", label: "Care Plan", short: "Care Plan" },
  { id: "sdoh", icon: "🤝", label: "SDOH", short: "SDOH" },
  { id: "trials", icon: "🔬", label: "Trials", short: "Trials" },
  { id: "nl-query", icon: "💬", label: "NL→FHIR", short: "NL→FHIR" },
  { id: "readmit", icon: "🏥", label: "Readmission", short: "Readmit" },
  { id: "triage", icon: "🚑", label: "Triage", short: "Triage" },
  { id: "imaging", icon: "📡", label: "Imaging", short: "Imaging" },
  { id: "labs", icon: "🧪", label: "Lab Explainer", short: "Labs" },
];

// ─── Shared UI primitives ────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function FhirBadges({ resources = [], services = [] }) {
  return (
    <div className="mt-4 pt-3 border-t border-white/[0.06] flex flex-wrap gap-2">
      {resources.map(r => (
        <span key={r} className="px-2 py-0.5 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">{r}</span>
      ))}
      {services.map(s => (
        <span key={s} className="px-2 py-0.5 rounded-full text-xs font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20">{s}</span>
      ))}
    </div>
  );
}

function GlassCard({ children, className = "" }) {
  return (
    <div className={`rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 ${className}`}>
      {children}
    </div>
  );
}

function GenerateButton({ onClick, loading, label = "Generate", loadingLabel = "Generating…" }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? <><Spinner />{loadingLabel}</> : label}
    </button>
  );
}

// ─── Feature 1: Smart Patient Summary ───────────────────────────────────────

const SUMMARY_DATA = {
  doctor: {
    headline: "54F with uncontrolled T2DM, Stage 3 CKD, and recent ACS — high complexity",
    sections: [
      { label: "Active Problems", color: "red", items: ["Type 2 Diabetes (HbA1c 9.2% — uncontrolled)", "CKD Stage 3a (eGFR 48)", "Hypertension (BP 158/94 last visit)", "Prior MI 2023 — on dual antiplatelet"] },
      { label: "Current Medications", color: "blue", items: ["Metformin 500mg BID", "Lisinopril 10mg QD", "Atorvastatin 40mg QD", "Aspirin 81mg QD", "Clopidogrel 75mg QD"] },
      { label: "Critical Alerts", color: "orange", items: ["⚠️ Drug interaction: Metformin + CKD — monitor eGFR", "⚠️ HbA1c >9% — consider insulin augmentation", "⚠️ Overdue: Nephrology referral (6 months past due)"] },
      { label: "Recent Labs", color: "purple", items: ["HbA1c: 9.2% (↑ from 8.1%)", "eGFR: 48 (↓ from 55)", "LDL: 89 mg/dL (controlled)", "BP: 158/94"] }
    ],
    fhirResources: ["Patient", "Condition", "MedicationRequest", "Observation", "AllergyIntolerance"],
    cfServices: ["FHIR API", "AI Hub (Claude)", "KV Cache"]
  },
  care_manager: {
    headline: "High-risk patient needs care coordination — 3 overdue preventive measures",
    sections: [
      { label: "Care Gaps", color: "red", items: ["Nephrology referral overdue 6 months", "Ophthalmology exam overdue 14 months", "Diabetes education not completed"] },
      { label: "Social Risk Factors", color: "orange", items: ["Transportation barrier (misses 30% appointments)", "Limited health literacy (Arabic preferred)", "Lives alone — fall risk"] },
      { label: "Open Care Plan Goals", color: "yellow", items: ["HbA1c target <7.5% — currently off track", "BP target <130/80 — currently off track", "Exercise 150min/week — partially met"] },
      { label: "Recommended Actions", color: "green", items: ["Schedule telehealth nephrology consult", "Arrange transport voucher for next visit", "Enroll in bilingual diabetes management program"] }
    ],
    fhirResources: ["CarePlan", "Goal", "Task", "Observation", "ServiceRequest"],
    cfServices: ["FHIR SQL Builder", "AI Hub", "R2 Storage"]
  },
  patient: {
    headline: "Your health summary — في صحة جيدة مع بعض الأمور التي تحتاج اهتمام",
    sections: [
      { label: "Your Conditions", color: "blue", items: ["Diabetes — your blood sugar has been higher than our goal lately", "Kidney health — your kidneys are working at about 48% — we're watching this", "Blood pressure — a bit high, let's talk about adjusting your medicine"] },
      { label: "Your Medicines", color: "green", items: ["Metformin — for diabetes, take with food", "Lisinopril — for blood pressure and kidney protection", "Atorvastatin — to keep your cholesterol healthy", "Aspirin + Clopidogrel — to protect your heart"] },
      { label: "What to Do This Week", color: "cyan", items: ["Check your blood sugar every morning and write it down", "Take your medicines at the same time each day", "Call us if your BP is above 160/100"] }
    ],
    fhirResources: ["Patient", "Condition", "MedicationRequest", "CarePlan"],
    cfServices: ["AI Hub (Claude)", "Vector Search", "D1 Database"]
  },
  family: {
    headline: "Caring for Fatima — here's what you need to know",
    sections: [
      { label: "Most Important Right Now", color: "red", items: ["Her diabetes is not well controlled — support low-carb meals", "She needs help getting to her kidney specialist appointment", "Watch for swelling in legs or feet — call us if you see this"] },
      { label: "Her Medicine Schedule", color: "blue", items: ["Morning: Metformin, Lisinopril, Atorvastatin, Aspirin", "Evening: Metformin, Clopidogrel", "Never skip blood pressure medicine"] },
      { label: "Warning Signs — Call 911 If", color: "orange", items: ["Chest pain or pressure", "Sudden confusion or can't speak", "Very low blood sugar (shaking, sweating, unconscious)"] }
    ],
    fhirResources: ["Patient", "Condition", "MedicationRequest", "RelatedPerson"],
    cfServices: ["AI Hub (Claude)", "FHIR API"]
  }
};

const SECTION_COLORS = {
  red: "border-red-500/30 bg-red-500/5",
  blue: "border-blue-500/30 bg-blue-500/5",
  orange: "border-orange-500/30 bg-orange-500/5",
  purple: "border-purple-500/30 bg-purple-500/5",
  yellow: "border-yellow-500/30 bg-yellow-500/5",
  green: "border-green-500/30 bg-green-500/5",
  cyan: "border-cyan-500/30 bg-cyan-500/5",
};

const SECTION_LABEL_COLORS = {
  red: "text-red-400",
  blue: "text-blue-400",
  orange: "text-orange-400",
  purple: "text-purple-400",
  yellow: "text-yellow-400",
  green: "text-green-400",
  cyan: "text-cyan-400",
};

function SummaryFeature() {
  const [summaryPatient, setSummaryPatient] = useState("P-101");
  const [summaryRole, setSummaryRole] = useState("doctor");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState(null);

  const handleGenerate = () => {
    setSummaryLoading(true);
    setSummaryResult(null);
    setTimeout(() => {
      setSummaryResult(SUMMARY_DATA[summaryRole]);
      setSummaryLoading(false);
    }, 1800);
  };

  const selectClass = "w-full rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm px-3 py-2 focus:outline-none focus:border-cyan-500/50";

  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Patient</label>
            <select value={summaryPatient} onChange={e => setSummaryPatient(e.target.value)} className={selectClass}>
              <option value="P-101">P-101 — Fatima Al-Rashidi, 54F</option>
              <option value="P-102">P-102 — Mohammed Al-Harbi, 67M</option>
              <option value="P-103">P-103 — Noura Al-Zahrani, 38F</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Viewer Role</label>
            <select value={summaryRole} onChange={e => setSummaryRole(e.target.value)} className={selectClass}>
              <option value="doctor">ED Physician</option>
              <option value="care_manager">Care Manager</option>
              <option value="patient">Patient / Self</option>
              <option value="family">Family Caregiver</option>
            </select>
          </div>
        </div>
        <GenerateButton onClick={handleGenerate} loading={summaryLoading} label="Generate Summary" loadingLabel="Generating Summary…" />
      </GlassCard>

      {summaryResult && (
        <GlassCard className="border-cyan-500/20 bg-cyan-500/[0.03]">
          <p className="text-white font-semibold mb-4 text-sm leading-relaxed">{summaryResult.headline}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {summaryResult.sections.map(sec => (
              <div key={sec.label} className={`rounded-lg border p-3 ${SECTION_COLORS[sec.color] || "border-white/10 bg-white/5"}`}>
                <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${SECTION_LABEL_COLORS[sec.color] || "text-slate-400"}`}>{sec.label}</p>
                <ul className="space-y-1">
                  {sec.items.map((item, i) => (
                    <li key={i} className="text-xs text-slate-300 flex gap-1.5">
                      <span className="mt-0.5 shrink-0 text-slate-500">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <FhirBadges resources={summaryResult.fhirResources} services={summaryResult.cfServices} />
        </GlassCard>
      )}
    </div>
  );
}

// ─── Feature 2: Prior Auth Copilot ──────────────────────────────────────────

const AUTH_RESULT = {
  matchScore: 87,
  decision: "LIKELY APPROVED",
  decisionColor: "green",
  supportingEvidence: [
    { item: "Diagnosis E11.65 — T2DM with hyperglycemia", status: "found", source: "Condition/c-101" },
    { item: "Failed first-line therapy (Metformin 500mg BID)", status: "found", source: "MedicationRequest/mr-201" },
    { item: "HbA1c 9.2% documented within 90 days", status: "found", source: "Observation/obs-301" },
    { item: "Prescribing physician NPI on file", status: "found", source: "Practitioner/prac-01" },
    { item: "Prior authorization history", status: "missing", source: null },
    { item: "Letter of medical necessity", status: "missing", source: null }
  ],
  missingChecklist: [
    "Upload prior authorization history document",
    "Attach letter of medical necessity from Dr. Al-Rashidi",
    "Confirm payer-specific formulary step requirements"
  ],
  fhirBundle: "Bundle/auth-draft-2024-12-19",
  fhirResources: ["Claim", "Coverage", "Condition", "MedicationRequest", "Observation"],
  cfServices: ["FHIR SQL Builder", "Vector Search", "AI Hub", "AI Agents"]
};

function PriorAuthFeature() {
  const [authService, setAuthService] = useState("99214");
  const [authDiag, setAuthDiag] = useState("E11.65");
  const [authLoading, setAuthLoading] = useState(false);
  const [authResult, setAuthResult] = useState(null);

  const handleGenerate = () => {
    setAuthLoading(true);
    setAuthResult(null);
    setTimeout(() => {
      setAuthResult(AUTH_RESULT);
      setAuthLoading(false);
    }, 2000);
  };

  const selectClass = "w-full rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm px-3 py-2 focus:outline-none focus:border-cyan-500/50";
  const inputClass = "w-full rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm px-3 py-2 focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-500";

  const decisionColors = { green: "bg-green-500/20 text-green-300 border-green-500/40", yellow: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40", red: "bg-red-500/20 text-red-300 border-red-500/40" };

  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Service Code</label>
            <select value={authService} onChange={e => setAuthService(e.target.value)} className={selectClass}>
              <option value="99214">99214 — Office Visit Level 4</option>
              <option value="J0696">J0696 — Ceftriaxone Injection</option>
              <option value="70553">70553 — MRI Brain w/ contrast</option>
              <option value="27447">27447 — Total Knee Replacement</option>
              <option value="90837">90837 — Psychotherapy 60min</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Primary Diagnosis (ICD-10)</label>
            <input value={authDiag} onChange={e => setAuthDiag(e.target.value)} className={inputClass} placeholder="E11.65" />
          </div>
        </div>
        <GenerateButton onClick={handleGenerate} loading={authLoading} label="Generate Auth Package" loadingLabel="Building Package…" />
      </GlassCard>

      {authResult && (
        <GlassCard className="border-green-500/20 bg-green-500/[0.02]">
          {/* Score + Decision */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-16 h-16 shrink-0">
              <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22c55e" strokeWidth="3"
                  strokeDasharray={`${authResult.matchScore} ${100 - authResult.matchScore}`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">{authResult.matchScore}%</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Authorization Confidence</p>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${decisionColors[authResult.decisionColor]}`}>{authResult.decision}</span>
            </div>
          </div>

          {/* Evidence checklist */}
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Supporting Evidence</p>
          <div className="space-y-1.5 mb-4">
            {authResult.supportingEvidence.map((ev, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className={`shrink-0 mt-0.5 text-base leading-none ${ev.status === "found" ? "text-green-400" : "text-red-400"}`}>
                  {ev.status === "found" ? "✓" : "✗"}
                </span>
                <span className={ev.status === "found" ? "text-slate-300" : "text-slate-500"}>{ev.item}</span>
                {ev.source && <span className="ml-auto shrink-0 font-mono text-slate-600">{ev.source}</span>}
              </div>
            ))}
          </div>

          {/* Missing items */}
          <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-3 mb-3">
            <p className="text-xs font-semibold text-orange-400 mb-2">Action Required</p>
            {authResult.missingChecklist.map((item, i) => (
              <p key={i} className="text-xs text-slate-300 flex gap-1.5 mb-1">
                <span className="text-orange-400 shrink-0">→</span>{item}
              </p>
            ))}
          </div>

          <p className="text-xs text-slate-500 font-mono">FHIR Bundle: {authResult.fhirBundle}</p>
          <FhirBadges resources={authResult.fhirResources} services={authResult.cfServices} />
        </GlassCard>
      )}
    </div>
  );
}

// ─── Feature 3: Gaps-in-Care Finder ─────────────────────────────────────────

const GAPS = [
  { name: "HbA1c Check", arabic: "فحص السكر التراكمي", lastDone: "14 months ago", due: "Overdue 2 months", urgency: "high", recommendation: "Schedule HbA1c lab within 2 weeks" },
  { name: "Nephrology Consult", arabic: "استشارة أمراض الكلى", lastDone: "Never", due: "Overdue 6 months", urgency: "high", recommendation: "Referral to nephrology — eGFR declining" },
  { name: "Ophthalmology Exam", arabic: "فحص العيون", lastDone: "18 months ago", due: "Overdue 6 months", urgency: "medium", recommendation: "Annual diabetic retinopathy screening" },
  { name: "Flu Vaccination", arabic: "لقاح الإنفلوانزا", lastDone: "Last season", due: "Due this season", urgency: "medium", recommendation: "Offer at next visit or pharmacy" },
  { name: "Foot Exam", arabic: "فحص القدم", lastDone: "8 months ago", due: "Due now", urgency: "medium", recommendation: "Annual diabetic foot exam" },
  { name: "Mammogram", arabic: "الأشعة التشخيصية للثدي", lastDone: "3 years ago", due: "Overdue 1 year", urgency: "high", recommendation: "Biennial mammogram for age 54" }
];

function GapsFeature() {
  const [gapPatient, setGapPatient] = useState("P-101");
  const [gapLoading, setGapLoading] = useState(false);
  const [gapResult, setGapResult] = useState(null);
  const [outreachLang, setOutreachLang] = useState("en");
  const [outreachMsg, setOutreachMsg] = useState({});

  const handleAnalyze = () => {
    setGapLoading(true);
    setGapResult(null);
    setTimeout(() => { setGapResult(GAPS); setGapLoading(false); }, 1500);
  };

  const handleOutreach = (gap) => {
    const key = gap.name;
    const en = `Dear Fatima, we noticed you are due for ${gap.name}. Please call us at 800-BRAINSAIT or book online. Your health is our priority.`;
    const ar = `عزيزتنا فاطمة، لاحظنا أنك متأخرة في ${gap.arabic}. يرجى الاتصال بنا على 800-براين سايت أو الحجز عبر الإنترنت. صحتك أولويتنا.`;
    setOutreachMsg(prev => ({ ...prev, [key]: { en, ar } }));
  };

  const urgencyStyle = { high: "border-red-500/30 bg-red-500/5", medium: "border-yellow-500/30 bg-yellow-500/5" };
  const urgencyBadge = { high: "bg-red-500/20 text-red-300 border-red-500/30", medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" };

  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Patient</label>
            <select value={gapPatient} onChange={e => setGapPatient(e.target.value)} className="rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm px-3 py-2 focus:outline-none focus:border-cyan-500/50">
              <option value="P-101">P-101 — Fatima Al-Rashidi, 54F</option>
              <option value="P-102">P-102 — Mohammed Al-Harbi, 67M</option>
            </select>
          </div>
          <GenerateButton onClick={handleAnalyze} loading={gapLoading} label="Find Care Gaps" loadingLabel="Analyzing…" />
        </div>
      </GlassCard>

      {gapResult && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-300">{gapResult.filter(g => g.urgency === "high").length} high-priority gaps found</p>
            <div className="flex rounded-lg overflow-hidden border border-white/[0.1]">
              <button onClick={() => setOutreachLang("en")} className={`px-3 py-1 text-xs transition-colors ${outreachLang === "en" ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400 hover:text-white"}`}>EN</button>
              <button onClick={() => setOutreachLang("ar")} className={`px-3 py-1 text-xs transition-colors ${outreachLang === "ar" ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400 hover:text-white"}`}>AR</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {gapResult.map(gap => (
              <div key={gap.name} className={`rounded-xl border p-4 ${urgencyStyle[gap.urgency]}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-white">{gap.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5" dir="rtl">{gap.arabic}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${urgencyBadge[gap.urgency]}`}>{gap.urgency.toUpperCase()}</span>
                </div>
                <p className="text-xs text-slate-400">Last: {gap.lastDone}</p>
                <p className="text-xs text-slate-300 font-medium mt-0.5">{gap.due}</p>
                <p className="text-xs text-slate-400 mt-2 italic">{gap.recommendation}</p>
                <button onClick={() => handleOutreach(gap)} className="mt-3 text-xs px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition-colors">
                  Generate AI Outreach
                </button>
                {outreachMsg[gap.name] && (
                  <div className="mt-2 p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                    <p className="text-xs text-slate-300 leading-relaxed" dir={outreachLang === "ar" ? "rtl" : "ltr"}>
                      {outreachMsg[gap.name][outreachLang]}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <GlassCard>
            <FhirBadges resources={["DetectedIssue", "Communication", "Bundle"]} services={["FHIR SQL Builder", "AI Hub", "Queues"]} />
          </GlassCard>
        </>
      )}
    </div>
  );
}

// ─── Feature 4: Medication Safety ───────────────────────────────────────────

const MED_INTERACTIONS = [
  { severity: "MODERATE", type: "Drug-Disease", drugs: ["Metformin", "CKD Stage 3a"], description: "Metformin contraindicated when eGFR <30; currently 48 — monitor quarterly", action: "Continue with quarterly eGFR monitoring; dose reduce if eGFR drops below 45", arabic: "الميتفورمين مقيد عند انخفاض معدل الترشيح — مراقبة دورية مطلوبة" },
  { severity: "LOW", type: "Drug-Drug", drugs: ["Aspirin", "Clopidogrel"], description: "Dual antiplatelet increases bleeding risk — acceptable for post-ACS per guidelines", action: "Continue dual antiplatelet for 12 months post-ACS per ACC/AHA guidelines", arabic: "مزدوج مضادات الصفيحات — خطر النزيف مقبول بعد متلازمة الشريان التاجي" },
  { severity: "INFO", type: "Drug-Lab", drugs: ["Atorvastatin"], description: "Monitor LFTs annually — currently normal", action: "Annual hepatic panel ordered", arabic: "متابعة وظائف الكبد سنوياً" }
];

const ALLERGY_CHECK = { status: "CLEAR", message: "No allergies on file conflict with current medications", medications: 5, allergies: 1 };

const COUNSELING = {
  en: "Take Metformin with meals to reduce stomach upset. Never skip your blood pressure medication (Lisinopril) — stopping suddenly can cause dangerous blood pressure spikes. Your Clopidogrel and Aspirin protect your heart — do not stop without talking to your doctor.",
  ar: "تناول الميتفورمين مع الوجبات لتجنب الغثيان. لا تتوقف عن دواء ضغط الدم فجأة. الكلوبيدوجريل والأسبرين يحمان قلبك — لا تتوقف بدون مشورة طبيبك."
};

function MedSafetyFeature() {
  const [medLoading, setMedLoading] = useState(false);
  const [medResult, setMedResult] = useState(null);
  const [counselingLang, setCounselingLang] = useState("en");

  const handleCheck = () => {
    setMedLoading(true);
    setMedResult(null);
    setTimeout(() => { setMedResult(true); setMedLoading(false); }, 1600);
  };

  const sevStyle = { MODERATE: "border-orange-500/30 bg-orange-500/5", LOW: "border-yellow-500/30 bg-yellow-500/5", INFO: "border-blue-500/30 bg-blue-500/5" };
  const sevBadge = { MODERATE: "bg-orange-500/20 text-orange-300 border-orange-500/30", LOW: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", INFO: "bg-blue-500/20 text-blue-300 border-blue-500/30" };

  return (
    <div className="space-y-4">
      <GlassCard>
        <p className="text-sm text-slate-400 mb-3">Running full medication safety analysis for <span className="text-cyan-400">Fatima Al-Rashidi</span> — 5 active medications, 1 allergy on file.</p>
        <GenerateButton onClick={handleCheck} loading={medLoading} label="Run Safety Check" loadingLabel="Analyzing medications…" />
      </GlassCard>

      {medResult && (
        <div className="space-y-3">
          {/* Allergy check */}
          <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-sm font-semibold text-green-400">Allergy Check: {ALLERGY_CHECK.status}</p>
              <p className="text-xs text-slate-400">{ALLERGY_CHECK.message} ({ALLERGY_CHECK.medications} meds checked, {ALLERGY_CHECK.allergies} allergy on file)</p>
            </div>
          </div>

          {/* Adherence */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-white">Adherence Risk Score</p>
              <span className="text-yellow-400 font-bold">72%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full" style={{ width: "72%" }} />
            </div>
            <p className="text-xs text-slate-400 mt-1">Moderate risk — patient reports forgetting evening dose 2x/week</p>
          </div>

          {/* Interactions */}
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Interaction Analysis</p>
          {MED_INTERACTIONS.map((inter, i) => (
            <div key={i} className={`rounded-xl border p-4 ${sevStyle[inter.severity]}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${sevBadge[inter.severity]}`}>{inter.severity}</span>
                <span className="text-xs text-slate-400">{inter.type}</span>
                <div className="flex gap-1 ml-auto">
                  {inter.drugs.map(d => <span key={d} className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-slate-300">{d}</span>)}
                </div>
              </div>
              <p className="text-xs text-slate-300 mb-1">{inter.description}</p>
              <p className="text-xs text-cyan-400">→ {inter.action}</p>
              <p className="text-xs text-slate-500 mt-1.5" dir="rtl">{inter.arabic}</p>
            </div>
          ))}

          {/* Counseling */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-white">Patient Counseling</p>
              <div className="flex rounded-lg overflow-hidden border border-white/[0.1]">
                <button onClick={() => setCounselingLang("en")} className={`px-3 py-1 text-xs transition-colors ${counselingLang === "en" ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400 hover:text-white"}`}>EN</button>
                <button onClick={() => setCounselingLang("ar")} className={`px-3 py-1 text-xs transition-colors ${counselingLang === "ar" ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400 hover:text-white"}`}>AR</button>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed" dir={counselingLang === "ar" ? "rtl" : "ltr"}>{COUNSELING[counselingLang]}</p>
          </div>

          <GlassCard>
            <FhirBadges resources={["MedicationRequest", "AllergyIntolerance", "Parameters"]} services={["FHIR API", "AI Hub", "Vector Search"]} />
          </GlassCard>
        </div>
      )}
    </div>
  );
}

// ─── Feature 5: Care Plan Navigator ─────────────────────────────────────────

const CARE_GOALS = [
  { goal: "HbA1c below 7.5%", arabic: "السكر التراكمي أقل من 7.5%", current: 9.2, target: 7.5, unit: "%", status: "off-track", progress: 23, dueDate: "2025-03-01", tasks: ["Weekly blood sugar log", "Dietary consult referral", "Medication adjustment review"] },
  { goal: "Blood pressure below 130/80", arabic: "الضغط أقل من 130/80", current: 158, target: 130, unit: "systolic", status: "off-track", progress: 35, dueDate: "2025-02-01", tasks: ["Daily BP monitoring", "Low sodium diet", "Follow-up in 4 weeks"] },
  { goal: "150 min exercise per week", arabic: "150 دقيقة نشاط أسبوعياً", current: 90, target: 150, unit: "min/week", status: "partial", progress: 60, dueDate: "2025-01-15", tasks: ["Walking 20min daily", "Community pool program referral"] },
  { goal: "Attend diabetes education", arabic: "حضور تثقيف مرض السكري", current: 0, target: 3, unit: "sessions", status: "not-started", progress: 0, dueDate: "2025-02-15", tasks: ["Enroll in Arabic language program", "Schedule first session"] }
];

function CarePlanFeature() {
  const [planView, setPlanView] = useState("goals");
  const [planGoalSelected, setPlanGoalSelected] = useState(null);
  const [tasksGenerated, setTasksGenerated] = useState(false);

  const statusStyle = { "off-track": "text-red-400", "partial": "text-yellow-400", "not-started": "text-slate-400" };
  const progressColor = { "off-track": "bg-red-500", "partial": "bg-yellow-500", "not-started": "bg-slate-600" };

  const selectedGoal = planGoalSelected !== null ? CARE_GOALS[planGoalSelected] : null;

  return (
    <div className="space-y-4">
      {/* View switcher */}
      <div className="flex gap-2">
        {["goals", "tasks", "next"].map(v => (
          <button key={v} onClick={() => setPlanView(v)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${planView === v ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-slate-400 hover:text-white border border-transparent"}`}>
            {v === "goals" ? "Goals" : v === "tasks" ? "Tasks" : "What's Next?"}
          </button>
        ))}
      </div>

      {planView === "goals" && (
        <div className="space-y-3">
          {CARE_GOALS.map((g, i) => (
            <div key={i} onClick={() => setPlanGoalSelected(planGoalSelected === i ? null : i)} className={`rounded-xl border p-4 cursor-pointer transition-all ${planGoalSelected === i ? "border-cyan-500/40 bg-cyan-500/[0.05]" : "border-white/[0.08] bg-white/[0.03] hover:border-white/20"}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-white">{g.goal}</p>
                  <p className="text-xs text-slate-500 mt-0.5" dir="rtl">{g.arabic}</p>
                </div>
                <span className={`text-xs font-semibold ${statusStyle[g.status]}`}>{g.status.replace("-", " ").toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 bg-white/10 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full transition-all ${progressColor[g.status]}`} style={{ width: `${g.progress}%` }} />
                </div>
                <span className="text-xs text-slate-400 w-10 text-right">{g.progress}%</span>
              </div>
              <p className="text-xs text-slate-500">Current: {g.current} {g.unit} → Target: {g.target} {g.unit} · Due: {g.dueDate}</p>
            </div>
          ))}
        </div>
      )}

      {planView === "tasks" && (
        <div className="space-y-3">
          {CARE_GOALS.map((g, i) => (
            <GlassCard key={i}>
              <p className="text-xs font-semibold text-cyan-400 mb-2">{g.goal}</p>
              <ul className="space-y-1.5">
                {g.tasks.map((t, j) => (
                  <li key={j} className="flex items-center gap-2 text-xs text-slate-300">
                    <input type="checkbox" className="accent-cyan-500 rounded" readOnly />
                    {t}
                  </li>
                ))}
              </ul>
            </GlassCard>
          ))}
          <button onClick={() => setTasksGenerated(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-sm font-medium transition-all">
            {tasksGenerated ? "✓ FHIR Tasks Generated" : "Generate FHIR Tasks"}
          </button>
          {tasksGenerated && <p className="text-xs text-slate-500 font-mono">Created: Task/task-101, Task/task-102, Task/task-103, Task/task-104</p>}
        </div>
      )}

      {planView === "next" && (
        <GlassCard className="border-cyan-500/20 bg-cyan-500/[0.03]">
          <div className="flex gap-3 mb-4">
            <span className="text-2xl">🤖</span>
            <div>
              <p className="text-xs font-semibold text-cyan-400 mb-1">AI Clinical Recommendation</p>
              <p className="text-sm text-slate-300 leading-relaxed">Based on Fatima's current trajectory, the most impactful next step is adjusting her diabetes medication and scheduling the nephrology consult that is 6 months overdue. Her HbA1c of 9.2% indicates poor glycemic control — insulin augmentation or GLP-1 addition should be discussed at the next visit.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { action: "Urgent: Nephrology referral", urgency: "high", fhir: "ServiceRequest" },
              { action: "Medication review: insulin consideration", urgency: "high", fhir: "MedicationRequest" },
              { action: "Schedule follow-up in 2 weeks", urgency: "medium", fhir: "Appointment" },
              { action: "Enroll: bilingual diabetes program", urgency: "medium", fhir: "Task" }
            ].map((item, i) => (
              <div key={i} className={`rounded-lg border p-3 text-xs ${item.urgency === "high" ? "border-red-500/20 bg-red-500/5" : "border-yellow-500/20 bg-yellow-500/5"}`}>
                <p className="text-slate-300 font-medium">{item.action}</p>
                <span className="mt-1 inline-block px-1.5 py-0.5 rounded font-mono bg-cyan-500/10 text-cyan-400 text-xs">{item.fhir}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <GlassCard>
        <FhirBadges resources={["CarePlan", "Goal", "Task", "DocumentReference"]} services={["AI Agents", "AI Hub", "FHIR API"]} />
      </GlassCard>
    </div>
  );
}

// ─── Feature 6: SDOH Referral ────────────────────────────────────────────────

const SDOH_NEED_OPTIONS = [
  { key: "food_insecurity", label: "Food Insecurity / انعدام الأمن الغذائي" },
  { key: "transportation", label: "Transportation Barrier / عائق النقل" },
  { key: "housing", label: "Housing Instability / عدم استقرار السكن" },
  { key: "financial", label: "Financial Stress / ضغط مالي" },
  { key: "mental_health", label: "Mental Health Support / دعم الصحة النفسية" },
  { key: "social_isolation", label: "Social Isolation / العزلة الاجتماعية" }
];

const SDOH_RESOURCES = {
  transportation: [
    { name: "Riyadh Health Transport Voucher", match: 96, type: "Government", contact: "800-1234567", description: "Free medical transportation for chronic disease patients in Riyadh region", referralFhir: "Task/ref-transport-001" },
    { name: "BrainSAIT Telehealth", match: 91, type: "Virtual Care", contact: "telehealth.brainsait.org", description: "Virtual visits eliminate transportation barrier for routine follow-ups", referralFhir: "Task/ref-telehealth-001" }
  ],
  social_isolation: [
    { name: "Senior Community Center Riyadh", match: 88, type: "Community", contact: "011-555-0123", description: "Weekly group activities, Arabic language programs, chronic disease peer support", referralFhir: "Task/ref-social-001" },
    { name: "Diabetes Peer Mentor Program", match: 82, type: "Peer Support", contact: "mentor.brainsait.org", description: "Matched with Arabic-speaking diabetes peer mentor for weekly check-ins", referralFhir: "Task/ref-mentor-001" }
  ],
  food_insecurity: [
    { name: "Riyadh Food Assistance Program", match: 85, type: "Government", contact: "800-2345678", description: "Monthly food vouchers for low-income chronic disease patients", referralFhir: "Task/ref-food-001" }
  ],
  housing: [
    { name: "Housing Support Office", match: 78, type: "Government", contact: "800-3456789", description: "Emergency housing assistance and temporary shelter coordination", referralFhir: "Task/ref-housing-001" }
  ],
  financial: [
    { name: "Patient Financial Services", match: 90, type: "Hospital", contact: "finance@hospital.org", description: "Sliding scale fees, insurance enrollment assistance, medication copay programs", referralFhir: "Task/ref-financial-001" }
  ],
  mental_health: [
    { name: "Community Mental Health Clinic", match: 83, type: "Clinical", contact: "011-555-9999", description: "Bilingual Arabic/English counseling services, sliding scale fees", referralFhir: "Task/ref-mh-001" }
  ]
};

function SdohFeature() {
  const [sdohNeeds, setSdohNeeds] = useState(["transportation", "social_isolation"]);
  const [sdohLoading, setSdohLoading] = useState(false);
  const [sdohMatches, setSdohMatches] = useState(null);
  const [referralSent, setReferralSent] = useState({});

  const toggleNeed = (key) => {
    setSdohNeeds(prev => prev.includes(key) ? prev.filter(n => n !== key) : [...prev, key]);
    setSdohMatches(null);
  };

  const handleMatch = () => {
    setSdohLoading(true);
    setSdohMatches(null);
    setTimeout(() => {
      const matches = {};
      sdohNeeds.forEach(n => { if (SDOH_RESOURCES[n]) matches[n] = SDOH_RESOURCES[n]; });
      setSdohMatches(matches);
      setSdohLoading(false);
    }, 1500);
  };

  const handleReferral = (fhir) => setReferralSent(prev => ({ ...prev, [fhir]: true }));

  return (
    <div className="space-y-4">
      <GlassCard>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Social Needs Screening</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {SDOH_NEED_OPTIONS.map(opt => (
            <label key={opt.key} className="flex items-start gap-2.5 cursor-pointer group">
              <input type="checkbox" checked={sdohNeeds.includes(opt.key)} onChange={() => toggleNeed(opt.key)} className="mt-0.5 accent-cyan-500 rounded" />
              <span className="text-xs text-slate-300 group-hover:text-white transition-colors">{opt.label}</span>
            </label>
          ))}
        </div>
        <GenerateButton onClick={handleMatch} loading={sdohLoading} label={`Match Resources (${sdohNeeds.length} needs)`} loadingLabel="Matching…" />
      </GlassCard>

      {sdohMatches && Object.entries(sdohMatches).map(([need, resources]) => (
        <div key={need}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            {SDOH_NEED_OPTIONS.find(o => o.key === need)?.label}
          </p>
          <div className="space-y-2">
            {resources.map((r, i) => (
              <GlassCard key={i} className="border-cyan-500/10">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{r.name}</p>
                    <span className="text-xs text-slate-500">{r.type} · {r.contact}</span>
                  </div>
                  <div className="ml-3 flex flex-col items-end shrink-0">
                    <span className="text-lg font-bold text-cyan-400">{r.match}%</span>
                    <span className="text-xs text-slate-500">match</span>
                  </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1 mb-2">
                  <div className="bg-cyan-500 h-1 rounded-full" style={{ width: `${r.match}%` }} />
                </div>
                <p className="text-xs text-slate-400 mb-2">{r.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-600">{r.referralFhir}</span>
                  <button onClick={() => handleReferral(r.referralFhir)} className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${referralSent[r.referralFhir] ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20"}`}>
                    {referralSent[r.referralFhir] ? "✓ Referral Sent" : "Generate Referral Letter"}
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      ))}

      {sdohMatches && (
        <GlassCard>
          <FhirBadges resources={["Bundle", "Task", "Observation"]} services={["Vector Search", "AI Hub", "AI Agents"]} />
        </GlassCard>
      )}
    </div>
  );
}

// ─── Feature 7: Clinical Trial Matcher ──────────────────────────────────────

const TRIALS = [
  {
    id: "NCT-2024-DIAB-001", title: "AI-Guided Insulin Optimization in T2DM with CKD", phase: "Phase 3",
    sponsor: "Saudi NCBE", location: "King Faisal Specialist Hospital",
    match: 89, verdict: "LIKELY ELIGIBLE",
    verdictColor: "green",
    criteria: [
      { criterion: "T2DM diagnosis ≥ 2 years", met: true, evidence: "Condition/c-101 — diagnosed 2019" },
      { criterion: "HbA1c 8.0–11.0%", met: true, evidence: "Observation: HbA1c 9.2%" },
      { criterion: "CKD Stage 2–3", met: true, evidence: "Condition: CKD Stage 3a, eGFR 48" },
      { criterion: "Age 40–70", met: true, evidence: "Patient: age 54" },
      { criterion: "No insulin use in past 6 months", met: true, evidence: "No insulin in MedicationRequest" },
      { criterion: "Negative pregnancy test (if female)", met: null, evidence: "MISSING — needs confirmation" }
    ]
  },
  {
    id: "NCT-2024-CARD-002", title: "Post-ACS Antiplatelet Duration Study", phase: "Phase 2",
    sponsor: "King Abdulaziz Medical City", location: "Riyadh / Remote",
    match: 74, verdict: "MAYBE ELIGIBLE",
    verdictColor: "yellow",
    criteria: [
      { criterion: "Prior MI or ACS within 18 months", met: true, evidence: "Condition: MI 2023" },
      { criterion: "On dual antiplatelet therapy", met: true, evidence: "Aspirin + Clopidogrel in MedicationRequest" },
      { criterion: "No active bleeding history", met: null, evidence: "MISSING — review needed" },
      { criterion: "eGFR > 30", met: true, evidence: "eGFR 48" }
    ]
  },
  {
    id: "NCT-2024-HTN-003", title: "Remote Blood Pressure Monitoring with AI Coaching", phase: "Phase 4",
    sponsor: "MOH Saudi Arabia", location: "Remote / Digital",
    match: 62, verdict: "POSSIBLY ELIGIBLE",
    verdictColor: "orange",
    criteria: [
      { criterion: "Hypertension diagnosis", met: true, evidence: "Condition: Hypertension" },
      { criterion: "Smartphone access", met: null, evidence: "MISSING — patient survey needed" },
      { criterion: "BP > 140/90 at last visit", met: true, evidence: "BP 158/94" }
    ]
  }
];

function TrialsFeature() {
  const [trialLoading, setTrialLoading] = useState(false);
  const [trialResult, setTrialResult] = useState(null);
  const [expandedTrial, setExpandedTrial] = useState(null);
  const [followUp, setFollowUp] = useState({});

  const handleMatch = () => {
    setTrialLoading(true);
    setTrialResult(null);
    setTimeout(() => { setTrialResult(TRIALS); setTrialLoading(false); }, 2000);
  };

  const handleFollowUp = (id, missing) => {
    setFollowUp(prev => ({ ...prev, [id]: `Agent will query: "Does ${missing.criterion}?" and update eligibility when confirmed.` }));
  };

  const verdictStyle = { green: "bg-green-500/20 text-green-300 border-green-500/30", yellow: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", orange: "bg-orange-500/20 text-orange-300 border-orange-500/30" };
  const matchColor = (m) => m >= 80 ? "text-green-400" : m >= 65 ? "text-yellow-400" : "text-orange-400";

  return (
    <div className="space-y-4">
      <GlassCard>
        <p className="text-sm text-slate-400 mb-3">Matching <span className="text-cyan-400">Fatima Al-Rashidi</span> against active clinical trials using FHIR conditions, medications, and labs.</p>
        <GenerateButton onClick={handleMatch} loading={trialLoading} label="Match Trials" loadingLabel="Matching against trials…" />
      </GlassCard>

      {trialResult && trialResult.map(trial => (
        <GlassCard key={trial.id} className={expandedTrial === trial.id ? "border-cyan-500/30 bg-cyan-500/[0.03]" : ""}>
          <div className="flex items-start justify-between mb-3 cursor-pointer" onClick={() => setExpandedTrial(expandedTrial === trial.id ? null : trial.id)}>
            <div className="flex-1 min-w-0 pr-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">{trial.phase}</span>
                <span className="text-xs text-slate-500 font-mono">{trial.id}</span>
              </div>
              <p className="text-sm font-semibold text-white leading-tight">{trial.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{trial.sponsor} · {trial.location}</p>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <span className={`text-xl font-bold ${matchColor(trial.match)}`}>{trial.match}%</span>
              <span className={`mt-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${verdictStyle[trial.verdictColor]}`}>{trial.verdict}</span>
            </div>
          </div>

          {expandedTrial === trial.id && (
            <div className="border-t border-white/[0.06] pt-3 space-y-1.5">
              {trial.criteria.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className={`shrink-0 mt-0.5 font-bold ${c.met === true ? "text-green-400" : c.met === null ? "text-slate-500" : "text-red-400"}`}>
                    {c.met === true ? "✓" : c.met === null ? "?" : "✗"}
                  </span>
                  <span className={`flex-1 ${c.met === true ? "text-slate-300" : "text-slate-500"}`}>{c.criterion}</span>
                  <span className="text-slate-600 font-mono text-right max-w-[180px] truncate">{c.evidence}</span>
                </div>
              ))}
              {trial.criteria.some(c => c.met === null) && (
                <div className="mt-3">
                  {followUp[trial.id] ? (
                    <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-2.5 text-xs text-cyan-300">{followUp[trial.id]}</div>
                  ) : (
                    <button onClick={() => handleFollowUp(trial.id, trial.criteria.find(c => c.met === null))} className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 transition-colors">
                      Ask Agent Follow-Up
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </GlassCard>
      ))}

      {trialResult && (
        <GlassCard>
          <FhirBadges resources={["ResearchStudy", "Parameters", "Bundle"]} services={["Vector Search", "AI Hub", "AI Agents", "FHIR SQL Builder"]} />
        </GlassCard>
      )}
    </div>
  );
}

// ─── Feature 8: NL → FHIR Query ─────────────────────────────────────────────

const NL_PRESETS = [
  "Show all diabetic patients with HbA1c > 9%",
  "Find patients overdue for nephrology",
  "List medications with drug interactions",
  "Patients admitted 3+ times this year",
  "Unvaccinated patients over 50"
];

const NL_RESULT = {
  fhirUrl: "GET /Patient?condition=E11&_has:Observation:subject:code=4548-4&_has:Observation:subject:value-quantity=gt9",
  fhirSql: `SELECT p.id, p.name, o.value\nFROM Patient p\nJOIN Observation o ON o.subject = p.id\nWHERE o.code = '4548-4' AND o.value > 9\nAND EXISTS (\n  SELECT 1 FROM Condition c\n  WHERE c.subject = p.id\n  AND c.code LIKE 'E11%'\n)`,
  resultCount: 47,
  sampleResults: [
    { id: "P-101", name: "Fatima Al-Rashidi", value: "9.2%", lastDate: "2024-11-15" },
    { id: "P-208", name: "Omar Al-Mutairi", value: "10.1%", lastDate: "2024-12-01" },
    { id: "P-319", name: "Sarah Al-Dosari", value: "9.8%", lastDate: "2024-10-30" }
  ],
  explanation: "Found 47 patients with Type 2 Diabetes (ICD-10: E11.x) AND HbA1c observation (LOINC 4548-4) greater than 9%. Query used FHIR chained parameters and FHIR SQL Builder cross-join.",
  fhirResources: ["Patient", "Observation", "Condition"],
  cfServices: ["FHIR SQL Builder", "AI Hub", "D1 Database"]
};

function NlQueryFeature() {
  const [nlQuery, setNlQuery] = useState("Show all diabetic patients with HbA1c > 9%");
  const [nlLoading, setNlLoading] = useState(false);
  const [nlResult, setNlResult] = useState(null);

  const handleRun = () => {
    setNlLoading(true);
    setNlResult(null);
    setTimeout(() => { setNlResult(NL_RESULT); setNlLoading(false); }, 1200);
  };

  return (
    <div className="space-y-4">
      <GlassCard>
        <p className="text-xs text-slate-400 mb-2">Example queries:</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {NL_PRESETS.map(p => (
            <button key={p} onClick={() => { setNlQuery(p); setNlResult(null); }} className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${nlQuery === p ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" : "border-white/10 text-slate-400 hover:text-white hover:border-white/20"}`}>
              {p}
            </button>
          ))}
        </div>
        <textarea
          value={nlQuery}
          onChange={e => setNlQuery(e.target.value)}
          rows={2}
          className="w-full rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm px-3 py-2 focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-500 resize-none mb-3"
          placeholder="Ask a clinical question in plain English…"
        />
        <GenerateButton onClick={handleRun} loading={nlLoading} label="Run Query" loadingLabel="Translating to FHIR…" />
      </GlassCard>

      {nlResult && (
        <div className="space-y-3">
          <GlassCard>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">FHIR REST URL</p>
            <code className="text-xs text-cyan-300 font-mono break-all bg-black/20 rounded p-2 block">{nlResult.fhirUrl}</code>
          </GlassCard>

          <GlassCard>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">FHIR SQL (Cloudflare D1)</p>
            <pre className="text-xs text-green-300 font-mono bg-black/30 rounded p-3 overflow-x-auto leading-relaxed">{nlResult.fhirSql}</pre>
          </GlassCard>

          <GlassCard className="border-cyan-500/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl font-bold text-cyan-400">{nlResult.resultCount}</div>
              <p className="text-sm text-slate-300">patients matching your query</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left py-1.5 px-2 text-slate-500 font-medium">Patient ID</th>
                    <th className="text-left py-1.5 px-2 text-slate-500 font-medium">Name</th>
                    <th className="text-left py-1.5 px-2 text-slate-500 font-medium">HbA1c</th>
                    <th className="text-left py-1.5 px-2 text-slate-500 font-medium">Last Date</th>
                  </tr>
                </thead>
                <tbody>
                  {nlResult.sampleResults.map(r => (
                    <tr key={r.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="py-1.5 px-2 font-mono text-cyan-400">{r.id}</td>
                      <td className="py-1.5 px-2 text-slate-300">{r.name}</td>
                      <td className="py-1.5 px-2 text-red-400 font-semibold">{r.value}</td>
                      <td className="py-1.5 px-2 text-slate-500">{r.lastDate}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={4} className="py-1.5 px-2 text-slate-600 italic text-center">… {nlResult.resultCount - 3} more results</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <p className="text-xs text-slate-400">{nlResult.explanation}</p>
            </div>
            <FhirBadges resources={nlResult.fhirResources} services={nlResult.cfServices} />
          </GlassCard>
        </div>
      )}
    </div>
  );
}

// ─── Feature 9: Readmission Risk ─────────────────────────────────────────────

const RISK_FACTORS = [
  { key: "prior_admits", label: "3+ admissions in past year", arabic: "3+ دخولات في العام الماضي", weight: 15 },
  { key: "heart_failure", label: "Heart failure diagnosis", arabic: "قصور القلب", weight: 12 },
  { key: "ckd", label: "CKD Stage 3+", arabic: "مرض كلوي مزمن المرحلة 3+", weight: 10 },
  { key: "diabetes_uncontrolled", label: "Uncontrolled diabetes (HbA1c >9%)", arabic: "سكري غير متحكم", weight: 10 },
  { key: "copd", label: "COPD or asthma", arabic: "مرض الرئة الانسدادي المزمن", weight: 8 },
  { key: "no_pcp", label: "No primary care follow-up scheduled", arabic: "لا متابعة مع الطبيب الأساسي", weight: 8 },
  { key: "polypharmacy", label: "5+ medications", arabic: "كثرة الأدوية (5+)", weight: 7 },
  { key: "low_literacy", label: "Low health literacy", arabic: "محدودية الثقافة الصحية", weight: 6 },
  { key: "lives_alone", label: "Lives alone", arabic: "يعيش وحده", weight: 6 },
  { key: "transport", label: "Transportation barrier", arabic: "عائق النقل", weight: 5 },
  { key: "mental_health", label: "Mental health comorbidity", arabic: "اضطراب نفسي مرافق", weight: 5 },
  { key: "prior_er", label: "ED visit in past 30 days", arabic: "زيارة طوارئ خلال 30 يوم", weight: 8 }
];

const DEFAULT_RISK = { ckd: true, diabetes_uncontrolled: true, polypharmacy: true, low_literacy: true, lives_alone: true, transport: true };

function ReadmitFeature() {
  const [riskFactors, setRiskFactors] = useState(DEFAULT_RISK);

  const riskScore = RISK_FACTORS.filter(f => riskFactors[f.key]).reduce((sum, f) => sum + f.weight, 0);
  const riskLevel = riskScore <= 30 ? "LOW" : riskScore <= 60 ? "MODERATE" : "HIGH";
  const riskColor = { LOW: "text-green-400", MODERATE: "text-yellow-400", HIGH: "text-red-400" };
  const riskBarColor = { LOW: "bg-green-500", MODERATE: "bg-yellow-500", HIGH: "bg-red-500" };

  const toggle = (key) => setRiskFactors(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-4">
      {/* Score display */}
      <GlassCard className={riskLevel === "HIGH" ? "border-red-500/30" : riskLevel === "MODERATE" ? "border-yellow-500/30" : "border-green-500/30"}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">30-Day Readmission Risk</p>
            <p className={`text-3xl font-bold mt-1 ${riskColor[riskLevel]}`}>{riskScore} pts</p>
          </div>
          <div className={`text-lg font-bold px-4 py-2 rounded-xl border ${riskLevel === "HIGH" ? "border-red-500/40 bg-red-500/10 text-red-400" : riskLevel === "MODERATE" ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400" : "border-green-500/40 bg-green-500/10 text-green-400"}`}>
            {riskLevel}
          </div>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3">
          <div className={`h-3 rounded-full transition-all duration-300 ${riskBarColor[riskLevel]}`} style={{ width: `${Math.min(riskScore, 100)}%` }} />
        </div>
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>0 — LOW</span><span>30</span><span>60</span><span>100 — HIGH</span>
        </div>
      </GlassCard>

      {/* Factor checkboxes */}
      <GlassCard>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Risk Factors</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {RISK_FACTORS.map(f => (
            <label key={f.key} className="flex items-start gap-2.5 cursor-pointer group">
              <input type="checkbox" checked={!!riskFactors[f.key]} onChange={() => toggle(f.key)} className="mt-0.5 accent-cyan-500" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-300 group-hover:text-white transition-colors">{f.label}</p>
                <p className="text-xs text-slate-600" dir="rtl">{f.arabic}</p>
              </div>
              <span className="text-xs text-slate-500 shrink-0">+{f.weight}</span>
            </label>
          ))}
        </div>
      </GlassCard>

      {/* Suggested interventions */}
      {(riskLevel === "MODERATE" || riskLevel === "HIGH") && (
        <GlassCard className="border-orange-500/20 bg-orange-500/[0.02]">
          <p className="text-xs font-semibold text-orange-400 uppercase tracking-wide mb-3">Suggested FHIR Tasks</p>
          {[
            { action: "Schedule follow-up within 7 days", resource: "Task/followup-7d" },
            { action: "Refer to care transition program", resource: "Task/care-transition" },
            { action: "Medication reconciliation", resource: "Task/med-recon" }
          ].map((t, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
              <span className="text-xs text-slate-300">→ {t.action}</span>
              <span className="text-xs font-mono text-cyan-500 ml-2">{t.resource}</span>
            </div>
          ))}
        </GlassCard>
      )}

      <GlassCard>
        <FhirBadges resources={["Parameters", "Task", "CarePlan"]} services={["FHIR SQL Builder", "AI Hub", "Dashboards"]} />
      </GlassCard>
    </div>
  );
}

// ─── Feature 10: Conversational Triage ──────────────────────────────────────

const TRIAGE_FLOWS = [
  { bot: "Hi! I'm your AI Triage Assistant. Please describe your main symptom or concern." },
  { bot: "How long have you had this symptom? And how severe on a scale of 1 (mild) to 10 (worst)?" },
  { bot: "Do you have any of these: chest pain, difficulty breathing, sudden confusion, or severe pain?" },
  { bot: "Do you have any chronic conditions? (e.g., diabetes, heart disease, kidney disease)" }
];

function TriageFeature() {
  const [triageMessages, setTriageMessages] = useState([{ role: "bot", text: TRIAGE_FLOWS[0].bot }]);
  const [triageInput, setTriageInput] = useState("");
  const [triageStep, setTriageStep] = useState(0);
  const [triageAcuity, setTriageAcuity] = useState(null);
  const [triageSending, setTriageSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [triageMessages]);

  const handleSend = () => {
    if (!triageInput.trim() || triageSending) return;
    const userText = triageInput.trim();
    setTriageInput("");
    setTriageSending(true);
    setTriageMessages(prev => [...prev, { role: "user", text: userText }]);

    setTimeout(() => {
      const nextStep = triageStep + 1;
      if (nextStep < TRIAGE_FLOWS.length) {
        setTriageMessages(prev => [...prev, { role: "bot", text: TRIAGE_FLOWS[nextStep].bot }]);
        setTriageStep(nextStep);
        setTriageSending(false);
      } else {
        // Generate acuity
        const lower = userText.toLowerCase() + " " + triageMessages.map(m => m.text).join(" ").toLowerCase();
        let acuity;
        if (lower.includes("chest")) {
          acuity = { level: 2, label: "EMERGENT", color: "red", instruction: "Go to the ED immediately. Call 911 if pain is severe. Do not drive yourself.", fhirQuestionnaireId: "QR/triage-2024-001" };
        } else if (lower.includes("breath") || lower.includes("confusion") || lower.includes("severe")) {
          acuity = { level: 3, label: "URGENT", color: "orange", instruction: "Visit urgent care or ED within 2 hours. Arrange transport now.", fhirQuestionnaireId: "QR/triage-2024-002" };
        } else {
          acuity = { level: 4, label: "LESS URGENT", color: "yellow", instruction: "Schedule a clinic appointment within 24 hours. Call us if symptoms worsen.", fhirQuestionnaireId: "QR/triage-2024-003" };
        }
        setTriageMessages(prev => [...prev, { role: "bot", text: `Based on your answers, I'm assigning an acuity level. Please see your triage result below.` }]);
        setTriageAcuity(acuity);
        setTriageSending(false);
      }
    }, 900);
  };

  const acuityBorder = { red: "border-red-500/40 bg-red-500/10", orange: "border-orange-500/40 bg-orange-500/10", yellow: "border-yellow-500/40 bg-yellow-500/10" };
  const acuityText = { red: "text-red-400", orange: "text-orange-400", yellow: "text-yellow-400" };

  const resetTriage = () => {
    setTriageMessages([{ role: "bot", text: TRIAGE_FLOWS[0].bot }]);
    setTriageStep(0);
    setTriageAcuity(null);
    setTriageInput("");
  };

  return (
    <div className="space-y-4">
      {/* Chat window */}
      <GlassCard className="p-0 overflow-hidden">
        <div ref={scrollRef} className="h-64 overflow-y-auto p-4 space-y-3">
          {triageMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${msg.role === "bot" ? "bg-white/[0.06] text-slate-300 rounded-tl-none" : "bg-cyan-500/20 text-cyan-100 rounded-tr-none border border-cyan-500/30"}`}>
                {msg.role === "bot" && <span className="text-xs text-cyan-500 font-semibold block mb-0.5">🤖 AI Triage</span>}
                {msg.text}
              </div>
            </div>
          ))}
          {triageSending && (
            <div className="flex justify-start">
              <div className="bg-white/[0.06] rounded-2xl rounded-tl-none px-4 py-2.5">
                <div className="flex gap-1 items-center h-4">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
        {!triageAcuity && (
          <div className="border-t border-white/[0.06] p-3 flex gap-2">
            <input
              value={triageInput}
              onChange={e => setTriageInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              disabled={triageSending}
              placeholder="Type your response…"
              className="flex-1 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm px-3 py-2 focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600 disabled:opacity-50"
            />
            <button onClick={handleSend} disabled={!triageInput.trim() || triageSending} className="px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-sm font-medium transition-all disabled:opacity-40">
              Send
            </button>
          </div>
        )}
      </GlassCard>

      {/* Acuity result */}
      {triageAcuity && (
        <GlassCard className={`border ${acuityBorder[triageAcuity.color]}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`text-4xl font-black ${acuityText[triageAcuity.color]}`}>ESI {triageAcuity.level}</div>
            <div>
              <p className={`text-lg font-bold ${acuityText[triageAcuity.color]}`}>{triageAcuity.label}</p>
              <p className="text-xs text-slate-500 font-mono">{triageAcuity.fhirQuestionnaireId}</p>
            </div>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-3">{triageAcuity.instruction}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
            {[
              { label: "QuestionnaireResponse", value: "Created" },
              { label: "Observation", value: "Acuity documented" },
              { label: "DocumentReference", value: "Handoff note ready" }
            ].map(item => (
              <div key={item.label} className="rounded-lg bg-white/[0.04] border border-white/[0.06] p-2.5 text-xs">
                <p className="text-cyan-400 font-mono mb-0.5">{item.label}</p>
                <p className="text-slate-400">{item.value}</p>
              </div>
            ))}
          </div>
          <button onClick={resetTriage} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">↩ Start new triage</button>
        </GlassCard>
      )}

      <GlassCard>
        <FhirBadges resources={["QuestionnaireResponse", "Observation", "DocumentReference"]} services={["AI Agents", "AI Hub", "FHIR API", "Durable Objects"]} />
      </GlassCard>
    </div>
  );
}

// ─── Feature 11: Imaging Follow-Up ──────────────────────────────────────────

const STUDIES = [
  { id: "IS-001", type: "CT Chest", date: "2024-11-10", finding: "3mm pulmonary nodule — recommend 6-month follow-up CT", urgency: "medium", followUpDue: "2025-05-10", status: "OVERDUE", daysOverdue: 19, modality: "CT", bodysite: "Chest" },
  { id: "IS-002", type: "Cardiac Echo", date: "2024-12-01", finding: "EF 50-55%, mild diastolic dysfunction", urgency: "low", followUpDue: "2025-12-01", status: "UPCOMING", daysOverdue: 0, modality: "US", bodysite: "Heart" },
  { id: "IS-003", type: "Renal Ultrasound", date: "2024-10-15", finding: "Right kidney 5mm stone — monitor for passage", urgency: "medium", followUpDue: "2025-04-15", status: "OVERDUE", daysOverdue: 44, modality: "US", bodysite: "Kidneys" },
  { id: "IS-004", type: "Foot X-Ray", date: "2024-12-10", finding: "No acute fracture; mild arthropathy", urgency: "low", followUpDue: "2025-12-10", status: "OK", daysOverdue: 0, modality: "XR", bodysite: "Foot" },
  { id: "IS-005", type: "Mammogram", date: "2022-08-01", finding: "BIRADS 2 — routine follow-up in 1 year", urgency: "high", followUpDue: "2023-08-01", status: "OVERDUE", daysOverdue: 506, modality: "MG", bodysite: "Breast" }
];

function ImagingFeature() {
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [outreachDraft, setOutreachDraft] = useState({});
  const [clinicianDraft, setClinicianDraft] = useState({});

  const statusStyle = {
    OVERDUE: "border-red-500/30 bg-red-500/5",
    UPCOMING: "border-yellow-500/30 bg-yellow-500/5",
    OK: "border-green-500/30 bg-green-500/5"
  };
  const statusBadge = {
    OVERDUE: "bg-red-500/20 text-red-300 border-red-500/30",
    UPCOMING: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    OK: "bg-green-500/20 text-green-300 border-green-500/30"
  };

  const handleOutreach = (study) => {
    setOutreachDraft(prev => ({
      ...prev,
      [study.id]: `Dear Fatima,\n\nThis is a reminder from BrainSAIT Health regarding your ${study.type} from ${study.date}. ${study.status === "OVERDUE" ? `Your follow-up was due on ${study.followUpDue} and is now ${study.daysOverdue} days overdue.` : `Your next follow-up is due on ${study.followUpDue}.`}\n\nPlease call 800-BRAINSAIT or book online to schedule your follow-up appointment.\n\nYour care team.`
    }));
  };

  const handleClinician = (study) => {
    setClinicianDraft(prev => ({
      ...prev,
      [study.id]: `IMAGING FOLLOW-UP REMINDER\nPatient: Fatima Al-Rashidi (P-101)\nStudy: ${study.type} (${study.id})\nFinding: ${study.finding}\nFollow-up Due: ${study.followUpDue}\nStatus: ${study.status}${study.daysOverdue > 0 ? ` (${study.daysOverdue} days overdue)` : ""}\n\nAction Required: Please order follow-up ${study.type} and contact patient to schedule.`
    }));
  };

  return (
    <div className="space-y-3">
      {STUDIES.map(study => (
        <div key={study.id}>
          <div
            onClick={() => setSelectedStudy(selectedStudy === study.id ? null : study.id)}
            className={`rounded-xl border p-4 cursor-pointer transition-all ${selectedStudy === study.id ? "border-cyan-500/40 bg-cyan-500/[0.05]" : statusStyle[study.status]}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-slate-400">{study.modality}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{study.type}</p>
                  <p className="text-xs text-slate-500">{study.date} · {study.bodysite}</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">{study.finding}</p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${statusBadge[study.status]}`}>{study.status}</span>
                {study.daysOverdue > 0 && <p className="text-xs text-red-400 mt-1">{study.daysOverdue}d overdue</p>}
              </div>
            </div>
          </div>

          {selectedStudy === study.id && (
            <div className="mx-2 rounded-b-xl border border-t-0 border-cyan-500/20 bg-cyan-500/[0.02] p-4 space-y-3">
              <p className="text-xs text-slate-400">Follow-up due: <span className="text-white">{study.followUpDue}</span></p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleOutreach(study)} className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition-colors">
                  Generate Patient Outreach
                </button>
                <button onClick={() => handleClinician(study)} className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 transition-colors">
                  Generate Clinician Reminder
                </button>
              </div>
              {outreachDraft[study.id] && (
                <div className="rounded-lg border border-cyan-500/20 bg-black/20 p-3">
                  <p className="text-xs font-semibold text-cyan-400 mb-1">Patient Outreach Draft</p>
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">{outreachDraft[study.id]}</pre>
                </div>
              )}
              {clinicianDraft[study.id] && (
                <div className="rounded-lg border border-purple-500/20 bg-black/20 p-3">
                  <p className="text-xs font-semibold text-purple-400 mb-1">Clinician Reminder Draft</p>
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">{clinicianDraft[study.id]}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <GlassCard>
        <FhirBadges resources={["ImagingStudy", "Observation", "Communication"]} services={["FHIR SQL Builder", "AI Hub", "AI Agents", "Queues"]} />
      </GlassCard>
    </div>
  );
}

// ─── Feature 12: Lab Explainer ───────────────────────────────────────────────

const LAB_RESULTS = {
  hba1c: { name: "HbA1c", arabic: "السكر التراكمي", value: 9.2, unit: "%", normalRange: [4.0, 5.6], targetRange: [0, 7.5], referenceHigh: 11.0, loinc: "4548-4", date: "2024-11-15" },
  ldl: { name: "LDL Cholesterol", arabic: "الكوليسترول الضار", value: 89, unit: "mg/dL", normalRange: [0, 100], targetRange: [0, 70], referenceHigh: 160, loinc: "2089-1", date: "2024-11-15" },
  egfr: { name: "eGFR", arabic: "معدل الترشيح الكبيبي", value: 48, unit: "mL/min/1.73m²", normalRange: [60, 120], targetRange: [60, 120], referenceHigh: 120, loinc: "62238-1", date: "2024-11-10" },
  hemoglobin: { name: "Hemoglobin", arabic: "الهيموغلوبين", value: 11.8, unit: "g/dL", normalRange: [12.0, 16.0], targetRange: [12.0, 16.0], referenceHigh: 17.0, loinc: "718-7", date: "2024-11-15" },
  bp_systolic: { name: "Blood Pressure (Systolic)", arabic: "ضغط الدم الانقباضي", value: 158, unit: "mmHg", normalRange: [90, 120], targetRange: [90, 130], referenceHigh: 180, loinc: "8480-6", date: "2024-12-10" }
};

const LAB_EXPLANATIONS = {
  hba1c: {
    en: "Your HbA1c of 9.2% tells us your average blood sugar over the past 3 months has been quite high — think of it like a 3-month blood sugar report card. A healthy score is below 5.7%, and we'd like yours below 7.5%. High HbA1c means your cells aren't getting energy properly, and over time it can harm your kidneys, eyes, and heart. The good news: with medication adjustments and diet changes, this number can improve significantly within 3 months.",
    ar: "نتيجة السكر التراكمي 9.2% تخبرنا أن متوسط سكر دمك خلال الأشهر الثلاثة الماضية كان مرتفعاً. فكر فيه كتقرير سكر لثلاثة أشهر. النتيجة الصحية أقل من 5.7%، وهدفنا لك أقل من 7.5%. ارتفاع هذا الرقم يعني أن خلاياك لا تحصل على الطاقة بشكل صحيح، وقد يضر بكلاك وعيونك وقلبك على المدى البعيد. البشرى: مع تعديل العلاج والنظام الغذائي، يمكن تحسين هذا الرقم خلال 3 أشهر."
  },
  ldl: {
    en: "Your LDL (bad cholesterol) of 89 mg/dL is within acceptable range, but since you have heart disease, we want it below 70 mg/dL. LDL builds up in your arteries like rust in pipes — the lower it is, the safer for your heart. Your statin (Atorvastatin) is helping, but we may need to adjust the dose.",
    ar: "الكوليسترول الضار 89 ملغ/ديسيلتر في النطاق المقبول، لكن لأن لديك مرض قلب، نريده أقل من 70. الكوليسترول الضار يتراكم في الشرايين — كلما كان أقل، كان أفضل لقلبك. الدواء الستاتيني يساعد، لكن قد نحتاج لتعديل الجرعة."
  },
  egfr: {
    en: "Your eGFR of 48 means your kidneys are filtering at about 48% of normal capacity — this is Stage 3a chronic kidney disease. Normal is above 60. While this is a concern, Stage 3 kidneys can be stable for years with good blood pressure and blood sugar control. We need to watch this number carefully every 3-6 months.",
    ar: "معدل الترشيح الكبيبي 48 يعني أن كليتيك تعملان بنسبة 48% من الطبيعي — هذا مرحلة 3 من مرض الكلى المزمن. الطبيعي أكثر من 60. مع ضبط ضغط الدم والسكر، يمكن أن تستقر الكلى لسنوات. نحتاج لمراقبة هذا الرقم كل 3-6 أشهر."
  },
  hemoglobin: {
    en: "Your hemoglobin of 11.8 g/dL is slightly below normal (12-16 for women). This mild anemia may be causing some fatigue. It could be related to your kidney disease, which can reduce a hormone that tells your body to make red blood cells. We'll investigate further.",
    ar: "الهيموغلوبين 11.8 أقل قليلاً من الطبيعي (12-16 للنساء). هذا فقر دم خفيف قد يسبب التعب. قد يكون مرتبطاً بمرض الكلى الذي يؤثر على إنتاج كريات الدم الحمراء. سنحقق أكثر."
  },
  bp_systolic: {
    en: "Your systolic blood pressure of 158 mmHg is above our target of 130 mmHg. Think of blood pressure like water pressure in a garden hose — too high for too long damages the pipes. High BP stresses your heart and kidneys (which are already under strain). Medication adjustment and low-sodium diet are key next steps.",
    ar: "ضغط الدم الانقباضي 158 ملم زئبق فوق هدفنا 130. فكر في ضغط الدم كضغط الماء في خرطوم — ارتفاعه لفترة طويلة يتلف الأوعية. الضغط المرتفع يجهد قلبك وكلاك. تعديل الدواء وتقليل الملح خطوات أساسية."
  }
};

function LabExplainerFeature() {
  const [labSelected, setLabSelected] = useState("hba1c");
  const [labLang, setLabLang] = useState("en");
  const [labExplaining, setLabExplaining] = useState(false);
  const [labExplanation, setLabExplanation] = useState(null);

  const handleExplain = () => {
    setLabExplaining(true);
    setLabExplanation(null);
    setTimeout(() => { setLabExplanation(LAB_EXPLANATIONS[labSelected]); setLabExplaining(false); }, 1000);
  };

  const lab = LAB_RESULTS[labSelected];
  const range = lab.referenceHigh - 0;
  const valuePos = Math.min(Math.max((lab.value / lab.referenceHigh) * 100, 0), 100);
  const normalLow = (lab.normalRange[0] / lab.referenceHigh) * 100;
  const normalHigh = (lab.normalRange[1] / lab.referenceHigh) * 100;

  const isAbnormal = lab.value < lab.normalRange[0] || lab.value > lab.normalRange[1];
  const isOffTarget = lab.value < lab.targetRange[0] || lab.value > lab.targetRange[1];

  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(LAB_RESULTS).map(([key, l]) => (
            <button key={key} onClick={() => { setLabSelected(key); setLabExplanation(null); }} className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${labSelected === key ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" : "border-white/10 text-slate-400 hover:text-white"}`}>
              {l.name}
            </button>
          ))}
        </div>

        {/* Lab value display */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 mb-4">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-base font-bold text-white">{lab.name}</p>
              <p className="text-xs text-slate-500" dir="rtl">{lab.arabic}</p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-black ${isAbnormal ? "text-red-400" : "text-green-400"}`}>{lab.value}</p>
              <p className="text-xs text-slate-500">{lab.unit}</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 mb-3">LOINC {lab.loinc} · {lab.date}</p>

          {/* Range bar */}
          <div className="relative mt-2">
            <div className="w-full h-4 rounded-full bg-white/10 relative overflow-hidden">
              {/* Normal range */}
              <div
                className="absolute h-full bg-green-500/30"
                style={{ left: `${normalLow}%`, width: `${normalHigh - normalLow}%` }}
              />
              {/* Target range (if different) */}
              {(lab.targetRange[0] !== lab.normalRange[0] || lab.targetRange[1] !== lab.normalRange[1]) && (
                <div
                  className="absolute h-full bg-cyan-500/20 border-x border-cyan-500/40"
                  style={{ left: `${(lab.targetRange[0] / lab.referenceHigh) * 100}%`, width: `${((lab.targetRange[1] - lab.targetRange[0]) / lab.referenceHigh) * 100}%` }}
                />
              )}
              {/* Patient value marker */}
              <div className="absolute top-0 bottom-0 w-0.5 bg-white" style={{ left: `${valuePos}%` }} />
            </div>
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>0</span>
              <span className="text-green-500 text-xs">Normal: {lab.normalRange[0]}–{lab.normalRange[1]}</span>
              <span>{lab.referenceHigh}</span>
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            {isAbnormal && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">Abnormal</span>}
            {isOffTarget && <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">Off Target</span>}
            {!isAbnormal && !isOffTarget && <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/30">Within Range</span>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg overflow-hidden border border-white/[0.1]">
            <button onClick={() => setLabLang("en")} className={`px-3 py-1.5 text-xs transition-colors ${labLang === "en" ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400 hover:text-white"}`}>English</button>
            <button onClick={() => setLabLang("ar")} className={`px-3 py-1.5 text-xs transition-colors ${labLang === "ar" ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400 hover:text-white"}`}>العربية</button>
          </div>
          <GenerateButton onClick={handleExplain} loading={labExplaining} label="Explain in Plain Language" loadingLabel="Explaining…" />
        </div>
      </GlassCard>

      {labExplanation && (
        <GlassCard className="border-cyan-500/20 bg-cyan-500/[0.03]">
          <p className="text-xs font-semibold text-cyan-400 mb-2">{labLang === "en" ? "Plain Language Explanation" : "شرح بلغة بسيطة"}</p>
          <p className="text-sm text-slate-300 leading-relaxed" dir={labLang === "ar" ? "rtl" : "ltr"}>{labExplanation[labLang]}</p>
          <div className="mt-3 pt-3 border-t border-white/[0.06]">
            <p className="text-xs font-semibold text-slate-500 mb-2">Educational Resources</p>
            <div className="flex flex-wrap gap-2">
              {["ADA Diabetes Guidelines", "Kidney Disease Foundation", "Heart Health Basics"].map(link => (
                <span key={link} className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-400 cursor-pointer hover:text-white transition-colors">
                  {link} →
                </span>
              ))}
            </div>
          </div>
          <FhirBadges resources={["Observation", "Bundle"]} services={["AI Hub", "Vector Search"]} />
        </GlassCard>
      )}
    </div>
  );
}

// ─── Main ContestPanel component ────────────────────────────────────────────

export default function ContestPanel() {
  const [activeContest, setActiveContest] = useState("summary");
  const navRef = useRef(null);

  const featureComponents = {
    "summary": <SummaryFeature />,
    "prior-auth": <PriorAuthFeature />,
    "gaps": <GapsFeature />,
    "med-safety": <MedSafetyFeature />,
    "care-plan": <CarePlanFeature />,
    "sdoh": <SdohFeature />,
    "trials": <TrialsFeature />,
    "nl-query": <NlQueryFeature />,
    "readmit": <ReadmitFeature />,
    "triage": <TriageFeature />,
    "imaging": <ImagingFeature />,
    "labs": <LabExplainerFeature />,
  };

  const activeFeature = CONTEST_FEATURES.find(f => f.id === activeContest);

  return (
    <div className="w-full min-h-0 flex flex-col gap-4">
      {/* Header */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 font-semibold">InterSystems Contest</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/25 font-semibold">AI Agents for FHIR</span>
            </div>
            <h2 className="text-lg font-bold text-white">BrainSAIT — 12 AI Agent Features</h2>
            <p className="text-xs text-slate-400 mt-0.5">Built on InterSystems IRIS FHIR + Cloudflare AI Platform · Saudi Arabia Healthcare</p>
          </div>
          <div className="flex gap-3 text-center">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
              <p className="text-xl font-bold text-cyan-400">12</p>
              <p className="text-xs text-slate-500">Features</p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
              <p className="text-xl font-bold text-purple-400">AR/EN</p>
              <p className="text-xs text-slate-500">Bilingual</p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
              <p className="text-xl font-bold text-green-400">FHIR</p>
              <p className="text-xs text-slate-500">R4 Native</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature nav */}
      <div ref={navRef} className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {CONTEST_FEATURES.map(f => (
          <button
            key={f.id}
            onClick={() => setActiveContest(f.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border shrink-0 ${
              activeContest === f.id
                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                : "bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white hover:border-white/20"
            }`}
          >
            <span>{f.icon}</span>
            <span>{f.short}</span>
          </button>
        ))}
      </div>

      {/* Active feature content */}
      <div className="min-h-0">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{activeFeature?.icon}</span>
          <h3 className="text-sm font-semibold text-white">{activeFeature?.label}</h3>
          <span className="text-xs text-slate-600">· Feature {CONTEST_FEATURES.findIndex(f => f.id === activeContest) + 1} of 12</span>
        </div>
        {featureComponents[activeContest]}
      </div>
    </div>
  );
}
