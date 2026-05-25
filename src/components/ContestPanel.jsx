import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const CONTEST_AGENTS = [
  { id: "summary", label: "Smart Patient Summary Generator", arabic: "مولد ملخص المريض الذكي", icon: "📄", color: "#2b6cb8", task: "1", endpoint: "/api/contest/summary?patient=Patient/101&role=doctor", description: "Generates role-tailored FHIR patient summaries (doctor, care manager, patient) with conditions, medications, allergies, labs, and care plans.", bonus: "Role-tailored summaries with different verbosity and clinical depth", bonusScore: 5, fhirResources: ["DocumentReference", "Composition"], irishClass: "BrainSAIT.Contest.SummaryGenerator", demoUrl: "/api/contest/summary?patient=Patient/101&role=doctor" },
  { id: "prior-auth", label: "FHIR Prior Authorization Copilot", arabic: "مساعد التفويض المسبق", icon: "✅", color: "#0ea5e9", task: "2", endpoint: "/api/contest/prior-auth?patient=Patient/101&service=99213", description: "Assists staff in preparing prior authorization requests by gathering diagnoses, medication history, and supporting evidence.", bonus: "Missing evidence checklist with actionable prompts", bonusScore: 5, fhirResources: ["Claim", "Parameters", "Bundle"], irishClass: "BrainSAIT.Contest.PriorAuthCopilot", demoUrl: "/api/contest/prior-auth?patient=Patient/101&service=99213" },
  { id: "gaps-in-care", label: "Gaps-in-Care Finder", arabic: "مكتشف الفجوات في الرعاية", icon: "🔍", color: "#ea580c", task: "3", endpoint: "/api/contest/gaps-in-care?patient=Patient/101", description: "Detects patients overdue for mammograms, colonoscopies, vaccines, HbA1c checks, eye exams, BP screening, and Pap smears.", bonus: "AI-generated bilingual outreach messages (Arabic/English)", bonusScore: 5, fhirResources: ["DetectedIssue", "Communication", "Bundle"], irishClass: "BrainSAIT.Contest.GapsInCareFinder", demoUrl: "/api/contest/gaps-in-care?patient=Patient/101" },
  { id: "medication-safety", label: "Medication Safety Assistant", arabic: "مساعد سلامة الأدوية", icon: "💊", color: "#22c55e", task: "4", endpoint: "/api/contest/medication-safety?patient=Patient/101", description: "Flags drug interactions, therapeutic duplications, allergy conflicts, and adherence risks with bilingual counseling.", bonus: "Vector Search-ready counseling explanations in patient language", bonusScore: 5, fhirResources: ["Parameters", "MedicationRequest", "AllergyIntolerance"], irishClass: "BrainSAIT.Contest.MedicationSafety", demoUrl: "/api/contest/medication-safety?patient=Patient/101" },
  { id: "care-plan", label: "Care Plan Navigator", arabic: "ملاح خطة الرعاية", icon: "🗺️", color: "#2b6cb8", task: "5", endpoint: "/api/contest/care-plan?patient=Patient/101", description: "Turns CarePlan and Goal resources into daily/weekly/monthly actionable guidance for patients and coordinators.", bonus: "Auto-creates suggested FHIR Task resources per goal", bonusScore: 5, fhirResources: ["CarePlan", "Goal", "Task", "DocumentReference"], irishClass: "BrainSAIT.Contest.CarePlanNavigator", demoUrl: "/api/contest/care-plan?patient=Patient/101" },
  { id: "clinical-trials", label: "Clinical Trial Matcher", arabic: "مطابق التجارب السريرية", icon: "🔬", color: "#a855f7", task: "6", endpoint: "/api/contest/clinical-trials?patient=Patient/101", description: "Matches patient records against 3 active trial eligibility criteria with percentage scores.", bonus: "Agent prompts for missing criteria (lab results, pregnancy status)", bonusScore: 5, fhirResources: ["Parameters", "Bundle", "ResearchStudy"], irishClass: "BrainSAIT.Contest.ClinicalTrialMatcher", demoUrl: "/api/contest/clinical-trials?patient=Patient/101" },
  { id: "readmission-risk", label: "Readmission Risk Workbench", arabic: "تقييم خطر إعادة الدخول", icon: "🏥", color: "#ef4444", task: "7", endpoint: "/api/contest/readmission-risk?patient=Patient/101", description: "Estimates 30-day readmission risk (low/moderate/high) based on 12 risk factors with weighted scoring.", bonus: "Next steps as FHIR Task and CarePlan resources", bonusScore: 5, fhirResources: ["Parameters", "Task", "CarePlan"], irishClass: "BrainSAIT.Contest.ReadmissionRisk", demoUrl: "/api/contest/readmission-risk?patient=Patient/101" },
  { id: "triage", label: "Conversational FHIR Triage", arabic: "مساعد الفرز الطبي", icon: "🚑", color: "#f59e0b", task: "8", endpoint: "/api/contest/triage?patient=Patient/101&symptoms=chest%20pain", description: "AI triage agent classifies symptoms into 5-level acuity, populates QuestionnaireResponse, and generates handoff notes.", bonus: "Maps conversation into coded FHIR Observations", bonusScore: 5, fhirResources: ["QuestionnaireResponse", "Observation", "DocumentReference"], irishClass: "BrainSAIT.Contest.TriageAssistant", demoUrl: "/api/contest/triage?patient=Patient/101&symptoms=chest%20pain" },
  { id: "imaging-followup", label: "Imaging Follow-Up Tracker", arabic: "متابعة نتائج التصوير", icon: "📡", color: "#0ea5e9", task: "9", endpoint: "/api/contest/imaging-followup?patient=Patient/101", description: "Ensures abnormal imaging/lab results receive follow-up. Tracks 5 studies with urgency-based reminders.", bonus: "AI-generated clinician reminders and bilingual patient outreach", bonusScore: 5, fhirResources: ["ImagingStudy", "Observation", "Communication"], irishClass: "BrainSAIT.Contest.ImagingFollowup", demoUrl: "/api/contest/imaging-followup?patient=Patient/101" },
  { id: "lab-explainer", label: "Patient-Friendly Lab Explainer", arabic: "شرح النتائج المخبرية", icon: "🧪", color: "#22c55e", task: "10", endpoint: "/api/contest/lab-explainer?patient=Patient/101", description: "Explains HbA1c, LDL, eGFR, and hemoglobin in lay terms with bilingual explanations and educational content links.", bonus: "Vector Search ready — educational content from trusted sources", bonusScore: 5, fhirResources: ["Bundle", "Observation"], irishClass: "BrainSAIT.Contest.LabExplainer", demoUrl: "/api/contest/lab-explainer?patient=Patient/101" },
  { id: "nl-query", label: "NL to FHIR Query Explorer", arabic: "تحويل اللغة الطبيعية إلى FHIR", icon: "💬", color: "#64748b", task: "11", endpoint: "/api/contest/nl-query?q=Show%20diabetic%20patients", description: "Converts 8 types of plain-language questions (diabetes, meds, allergies, etc.) into FHIR R4 and SQL queries.", bonus: "Displays generated FHIR and SQL queries for transparency", bonusScore: 5, fhirResources: ["Parameters"], irishClass: "BrainSAIT.Contest.NLQueryExplorer", demoUrl: "/api/contest/nl-query?q=Show%20me%20all%20diabetic%20patients" },
  { id: "sdoh-referral", label: "SDOH Community Referral", arabic: "الإحالة المجتمعية للعوامل الاجتماعية", icon: "🤝", color: "#ea580c", task: "11", endpoint: "/api/contest/sdoh-referral?needs=food,transportation", description: "Recommends community resources (food bank, transport, housing, financial, mental health, diabetes) based on social needs with semantic matching.", bonus: "Vector Search-ready semantic matching of services against patient needs", bonusScore: 5, fhirResources: ["Bundle", "Task"], irishClass: "BrainSAIT.Contest.SDOHReferralMatcher", demoUrl: "/api/contest/sdoh-referral?needs=food,transportation" },
];

export default function ContestPanel() {
  const totalBonus = CONTEST_AGENTS.reduce((s, a) => s + a.bonusScore, 0);
  const progressPerAgent = 100 / CONTEST_AGENTS.length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            🏆 InterSystems AI Agents for FHIR Contest
          </h2>
          <p className="text-xs text-gray-500">
            12 contest tasks implemented — {totalBonus} bonus points possible
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] text-blue-400 font-mono">
            iris-fhir.brainsait.org
          </span>
          <span className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-1 text-[11px] text-yellow-400">
            25 May – 14 Jun 2026
          </span>
          <span className="rounded-md border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-[11px] text-green-400">
            ${totalBonus * 80}+ prize potential
          </span>
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-gray-400">Submission Progress</span>
          <span className="font-semibold text-green-400">12/12 Tasks (100%)</span>
        </div>
        <Progress value={100} className="h-2 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-cyan-500 [&>div]:to-green-500" />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Tasks Implemented", value: "12/12", sub: "All contest tasks", color: "text-green-400" },
          { label: "Bonus Points", value: `${totalBonus}`, sub: "12 × 5pts bonuses", color: "text-yellow-400" },
          { label: "IRIS Classes", value: "12", sub: "One per agent", color: "text-cyan-400" },
          { label: "Agent Workers", value: "12", sub: "Cloudflare endpoints", color: "text-purple-400" },
        ].map((s) => (
          <Card key={s.label} className="border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
            <div className={`text-3xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="mt-1 text-xs text-white">{s.label}</div>
            <div className="text-[10px] text-gray-500">{s.sub}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {CONTEST_AGENTS.map((agent) => (
          <Card
            key={agent.id}
            className="border-white/10 bg-white/5 backdrop-blur-sm"
            style={{ borderLeft: `3px solid ${agent.color}` }}
          >
            <div className="p-5">
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{agent.icon}</span>
                  <div>
                    <div className="text-sm font-bold text-white">{agent.label}</div>
                    <div className="text-[10px]" style={{ color: agent.color, direction: "rtl" }}>
                      {agent.arabic}
                    </div>
                  </div>
                </div>
                <span className="shrink-0 rounded-md border border-green-500/30 bg-green-500/10 px-1.5 py-0.5 text-[10px] text-green-400">
                  Task {agent.task}
                </span>
              </div>

              <p className="mb-2 text-xs leading-relaxed text-gray-400">
                {agent.description}
              </p>

              <div className="mb-1.5">
                <span className="inline-block rounded-md border border-yellow-500/20 bg-yellow-500/10 px-2 py-0.5 text-[10px] text-yellow-400">
                  +{agent.bonusScore}pts {agent.bonus}
                </span>
              </div>

              <div className="mb-2 flex flex-wrap gap-1.5">
                {agent.fhirResources.map((r) => (
                  <span
                    key={r}
                    className="rounded border border-cyan-500/20 bg-cyan-500/10 px-1.5 py-0.5 font-mono text-[9px] text-cyan-400"
                  >
                    {r}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={agent.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 font-mono text-[11px] text-cyan-400 hover:bg-cyan-500/20"
                >
                  {agent.endpoint}
                </a>
                <code className="shrink-0 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] text-gray-500">
                  {agent.irishClass.split(".").pop()}
                </code>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Ecosystem Integration */}
      <Card className="mt-6 border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <h3 className="mb-4 text-sm font-semibold text-purple-400">
          🌐 BrainSAIT Health Ecosystem — 9 Integrated Backends
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { id: "hnh", label: "HNH Hospitals", desc: "Al Ribat / Gharnata — real patient records", color: "text-blue-400" },
            { id: "nphies", label: "NPHIES Saudi", desc: "National claims network — real-time eligibility", color: "text-green-400" },
            { id: "basma", label: "BASMA Voice", desc: "Arabic/English TTS — ElevenLabs AI voice", color: "text-yellow-400" },
            { id: "givc", label: "GIVC Platform", desc: "Healthcare platform — CDS + LINC workflows", color: "text-cyan-400" },
            { id: "sbs", label: "SBS Billing", desc: "Subscription billing — insurance coverage", color: "text-orange-400" },
            { id: "oracle", label: "Oracle Bridge", desc: "6 hospital EHRs — legacy system integration", color: "text-red-400" },
            { id: "claimlinc", label: "ClaimLinc", desc: "NPHIES claims API — submission + tracking", color: "text-purple-400" },
            { id: "portals", label: "Brainsait Portals", desc: "Unified portal gateway — SSO + routing", color: "text-pink-400" },
            { id: "healthcare-gateway", label: "Healthcare GW", desc: "FHIR gateway — multi-backend routing", color: "text-indigo-400" },
          ].map((b) => (
            <a key={b.id} href={`/api/ecosystem/${b.id}`} target="_blank" rel="noopener noreferrer"
              className="rounded-lg border border-white/10 bg-white/[0.03] p-3 hover:bg-white/[0.06] transition-colors"
            >
              <div className={`text-sm font-semibold ${b.color}`}>{b.label}</div>
              <div className="mt-0.5 text-[11px] text-gray-500">{b.desc}</div>
              <code className="mt-1 block text-[10px] text-gray-600">/api/ecosystem/{b.id}</code>
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}
