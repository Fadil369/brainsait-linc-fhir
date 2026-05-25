import { COLORS, NPHIES_CODES } from "../data/constants.js";

const CONTEST_AGENTS = [
  {
    id: "summary",
    label: "Smart Patient Summary Generator",
    arabic: "مولد ملخص المريض الذكي",
    icon: "📄",
    color: "#2b6cb8",
    task: "1",
    endpoint: "/api/contest/summary?patient=Patient/101&role=doctor",
    description: "Generates role-tailored FHIR patient summaries (doctor, care manager, patient) with conditions, medications, allergies, labs, and care plans.",
    bonus: "Role-tailored summaries with different verbosity and clinical depth",
    bonusScore: 5,
    fhirResources: ["DocumentReference", "Composition"],
    irishClass: "BrainSAIT.Contest.SummaryGenerator",
    demoUrl: "/api/contest/summary?patient=Patient/101&role=doctor",
    demoResult: "DocumentReference with sections per role",
  },
  {
    id: "prior-auth",
    label: "FHIR Prior Authorization Copilot",
    arabic: "مساعد التفويض المسبق",
    icon: "✅",
    color: "#0ea5e9",
    task: "2",
    endpoint: "/api/contest/prior-auth?patient=Patient/101&service=99213",
    description: "Assists staff in preparing prior authorization requests by gathering diagnoses, medication history, and supporting evidence.",
    bonus: "Missing evidence checklist with actionable prompts",
    bonusScore: 5,
    fhirResources: ["Claim", "Parameters", "Bundle"],
    irishClass: "BrainSAIT.Contest.PriorAuthCopilot",
    demoUrl: "/api/contest/prior-auth?patient=Patient/101&service=99213",
    demoResult: "Bundle with Claim + evidence checklist",
  },
  {
    id: "gaps-in-care",
    label: "Gaps-in-Care Finder",
    arabic: "مكتشف الفجوات في الرعاية",
    icon: "🔍",
    color: "#ea580c",
    task: "3",
    endpoint: "/api/contest/gaps-in-care?patient=Patient/101",
    description: "Detects patients overdue for mammograms, colonoscopies, vaccines, HbA1c checks, eye exams, BP screening, and Pap smears.",
    bonus: "AI-generated bilingual outreach messages (Arabic/English)",
    bonusScore: 5,
    fhirResources: ["DetectedIssue", "Communication", "Bundle"],
    irishClass: "BrainSAIT.Contest.GapsInCareFinder",
    demoUrl: "/api/contest/gaps-in-care?patient=Patient/101",
    demoResult: "Bundle with 7 gap DetectedIssues + outreach messages",
  },
  {
    id: "medication-safety",
    label: "Medication Safety Assistant",
    arabic: "مساعد سلامة الأدوية",
    icon: "💊",
    color: "#22c55e",
    task: "4",
    endpoint: "/api/contest/medication-safety?patient=Patient/101",
    description: "Flags drug interactions, therapeutic duplications, allergy conflicts, and adherence risks with bilingual counseling.",
    bonus: "Vector Search-ready counseling explanations in patient language",
    bonusScore: 5,
    fhirResources: ["Parameters", "MedicationRequest", "AllergyIntolerance"],
    irishClass: "BrainSAIT.Contest.MedicationSafety",
    demoUrl: "/api/contest/medication-safety?patient=Patient/101",
    demoResult: "Parameters with interactions, allergies, duplications, adherence",
  },
  {
    id: "care-plan",
    label: "Care Plan Navigator",
    arabic: "ملاح خطة الرعاية",
    icon: "🗺️",
    color: "#2b6cb8",
    task: "5",
    endpoint: "/api/contest/care-plan?patient=Patient/101",
    description: "Turns CarePlan and Goal resources into daily/weekly/monthly actionable guidance for patients and coordinators.",
    bonus: "Auto-creates suggested FHIR Task resources per goal",
    bonusScore: 5,
    fhirResources: ["CarePlan", "Goal", "Task", "DocumentReference"],
    irishClass: "BrainSAIT.Contest.CarePlanNavigator",
    demoUrl: "/api/contest/care-plan?patient=Patient/101",
    demoResult: "Bundle with CarePlan, 4 auto-generated Tasks, guidance doc",
  },
  {
    id: "clinical-trials",
    label: "Clinical Trial Matcher",
    arabic: "مطابق التجارب السريرية",
    icon: "🔬",
    color: "#a855f7",
    task: "6",
    endpoint: "/api/contest/clinical-trials?patient=Patient/101",
    description: "Matches patient records against 3 active trial eligibility criteria with percentage scores.",
    bonus: "Agent prompts for missing criteria (lab results, pregnancy status)",
    bonusScore: 5,
    fhirResources: ["Parameters", "Bundle", "ResearchStudy"],
    irishClass: "BrainSAIT.Contest.ClinicalTrialMatcher",
    demoUrl: "/api/contest/clinical-trials?patient=Patient/101",
    demoResult: "Bundle with match scores, prompted criteria, eligibility decisions",
  },
  {
    id: "readmission-risk",
    label: "Readmission Risk Workbench",
    arabic: "تقييم خطر إعادة الدخول",
    icon: "🏥",
    color: "#ef4444",
    task: "7",
    endpoint: "/api/contest/readmission-risk?patient=Patient/101",
    description: "Estimates 30-day readmission risk (low/moderate/high) based on 12 risk factors with weighted scoring.",
    bonus: "Next steps as FHIR Task and CarePlan resources",
    bonusScore: 5,
    fhirResources: ["Parameters", "Task", "CarePlan"],
    irishClass: "BrainSAIT.Contest.ReadmissionRisk",
    demoUrl: "/api/contest/readmission-risk?patient=Patient/101",
    demoResult: "Parameters with risk score, level, 7 interventions as Tasks/CarePlans",
  },
  {
    id: "triage",
    label: "Conversational FHIR Triage",
    arabic: "مساعد الفرز الطبي",
    icon: "🚑",
    color: "#f59e0b",
    task: "8",
    endpoint: "/api/contest/triage?patient=Patient/101&symptoms=chest%20pain",
    description: "AI triage agent classifies symptoms into 5-level acuity, populates QuestionnaireResponse, and generates handoff notes.",
    bonus: "Maps conversation into coded FHIR Observations",
    bonusScore: 5,
    fhirResources: ["QuestionnaireResponse", "Observation", "DocumentReference"],
    irishClass: "BrainSAIT.Contest.TriageAssistant",
    demoUrl: "/api/contest/triage?patient=Patient/101&symptoms=chest%20pain",
    demoResult: "Bundle with QuestionnaireResponse, coded Observations, handoff",
  },
  {
    id: "imaging-followup",
    label: "Imaging Follow-Up Tracker",
    arabic: "متابعة نتائج التصوير",
    icon: "📡",
    color: "#0ea5e9",
    task: "9",
    endpoint: "/api/contest/imaging-followup?patient=Patient/101",
    description: "Ensures abnormal imaging/lab results receive follow-up. Tracks 5 studies with urgency-based reminders.",
    bonus: "AI-generated clinician reminders and bilingual patient outreach",
    bonusScore: 5,
    fhirResources: ["ImagingStudy", "Observation", "Communication"],
    irishClass: "BrainSAIT.Contest.ImagingFollowup",
    demoUrl: "/api/contest/imaging-followup?patient=Patient/101",
    demoResult: "Bundle with studies, reminders, closed-loop summary",
  },
  {
    id: "lab-explainer",
    label: "Patient-Friendly Lab Explainer",
    arabic: "شرح النتائج المخبرية",
    icon: "🧪",
    color: "#22c55e",
    task: "10",
    endpoint: "/api/contest/lab-explainer?patient=Patient/101",
    description: "Explains HbA1c, LDL, eGFR, and hemoglobin in lay terms with bilingual explanations and educational content links.",
    bonus: "Vector Search ready — educational content from trusted sources",
    bonusScore: 5,
    fhirResources: ["Bundle", "Observation"],
    irishClass: "BrainSAIT.Contest.LabExplainer",
    demoUrl: "/api/contest/lab-explainer?patient=Patient/101",
    demoResult: "Bundle with 4 labs explained at Grade 6 reading level",
  },
  {
    id: "nl-query",
    label: "NL to FHIR Query Explorer",
    arabic: "تحويل اللغة الطبيعية إلى FHIR",
    icon: "💬",
    color: "#64748b",
    task: "11",
    endpoint: "/api/contest/nl-query?q=Show%20diabetic%20patients",
    description: "Converts 8 types of plain-language questions (diabetes, meds, allergies, etc.) into FHIR R4 and SQL queries.",
    bonus: "Displays generated FHIR and SQL queries for transparency",
    bonusScore: 5,
    fhirResources: ["Parameters"],
    irishClass: "BrainSAIT.Contest.NLQueryExplorer",
    demoUrl: "/api/contest/nl-query?q=Show%20me%20all%20diabetic%20patients",
    demoResult: "Parameters with intent, FHIR query, SQL query, alternatives",
  },
  {
    id: "sdoh-referral",
    label: "SDOH Community Referral",
    arabic: "الإحالة المجتمعية للعوامل الاجتماعية",
    icon: "🤝",
    color: "#ea580c",
    task: "11",
    endpoint: "/api/contest/sdoh-referral?needs=food,transportation",
    description: "Recommends community resources (food bank, transport, housing, financial, mental health, diabetes) based on social needs with semantic matching.",
    bonus: "Vector Search-ready semantic matching of services against patient needs",
    bonusScore: 5,
    fhirResources: ["Bundle", "Task"],
    irishClass: "BrainSAIT.Contest.SDOHReferralMatcher",
    demoUrl: "/api/contest/sdoh-referral?needs=food,transportation",
    demoResult: "Bundle with matched resources and auto-generated referral Tasks",
  },
];

export default function ContestPanel() {
  const totalBonus = CONTEST_AGENTS.reduce((s, a) => s + a.bonusScore, 0);

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>
            🏆 InterSystems AI Agents for FHIR Contest
          </h2>
          <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
            12 contest tasks implemented — {totalBonus} bonus points possible
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ background: "rgba(234,179,8,0.15)", border: "1px solid rgba(234,179,8,0.3)", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#eab308" }}>
            25 May – 14 Jun 2026
          </span>
          <span style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#22c55e" }}>
            ${totalBonus * 80}+ prize potential
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 16 }}>
        {CONTEST_AGENTS.map(agent => (
          <div key={agent.id} style={{
            background: COLORS.glassWhite,
            border: `1px solid ${agent.color}44`,
            borderLeft: `3px solid ${agent.color}`,
            borderRadius: 12,
            padding: "18px 20px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>{agent.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>{agent.label}</div>
                  <div style={{ fontSize: 10, color: agent.color, direction: "rtl" }}>{agent.arabic}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{
                  background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)",
                  borderRadius: 4, padding: "1px 7px", fontSize: 10, color: "#22c55e",
                }}>Task {agent.task}</span>
              </div>
            </div>

            <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 8px", lineHeight: 1.5 }}>
              {agent.description}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
              <span style={{
                background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)",
                borderRadius: 4, padding: "1px 7px", fontSize: 10, color: "#eab308",
              }}>+{agent.bonusScore}pts {agent.bonus}</span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
              {agent.fhirResources.map(r => (
                <span key={r} style={{
                  background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.2)",
                  borderRadius: 4, padding: "1px 6px", fontSize: 9, color: "#0ea5e9", fontFamily: "monospace",
                }}>{r}</span>
              ))}
            </div>

            <div style={{ display: "flex", gap: 6 }}>
              <a href={agent.demoUrl} target="_blank" rel="noopener noreferrer" style={{
                background: "rgba(14,165,233,0.15)", border: "1px solid rgba(14,165,233,0.3)",
                borderRadius: 6, padding: "4px 12px", fontSize: 11, color: "#0ea5e9",
                textDecoration: "none", fontFamily: "monospace",
              }}>{agent.endpoint}</a>
              <code style={{
                background: "rgba(100,116,139,0.1)", border: "1px solid rgba(100,116,139,0.2)",
                borderRadius: 6, padding: "4px 10px", fontSize: 10, color: "#94a3b8",
              }}>{agent.irishClass.split(".").pop()}</code>
            </div>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      <div style={{ marginTop: 24, background: COLORS.glassWhite, border: `1px solid ${COLORS.glassBorder}`, borderRadius: 12, padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "#eab308" }}>
          🏅 Contest Submission Scorecard
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { label: "Tasks Implemented", value: "12/12", sub: "All contest tasks", color: "#22c55e" },
            { label: "Bonus Points", value: `${totalBonus}`, sub: "12 × 5pts bonuses", color: "#eab308" },
            { label: "IRIS Classes", value: "12", sub: "One per agent", color: "#0ea5e9" },
            { label: "Agent Workers", value: "12", sub: "Cloudflare endpoints", color: "#a855f7" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "#fff", marginTop: 2 }}>{s.label}</div>
              <div style={{ fontSize: 10, color: "#64748b" }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
