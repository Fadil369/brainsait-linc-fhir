"use client";

import { useState, useCallback, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { GlassCard, LivePulse } from "@/components/ui/brainsait";
import { Trophy, ExternalLink, Play, Loader2, CheckCircle, Star, Zap, Code2, Database, Globe, ArrowUpRight, ChevronRight } from "lucide-react";

interface ContestAgent {
  id: string;
  label: string;
  arabic: string;
  icon: string;
  color: string;
  task: string;
  endpoint: string;
  description: string;
  bonus: string;
  bonusScore: number;
  fhirResources: string[];
  irishClass: string;
  demoUrl: string;
}

const CONTEST_AGENTS: ContestAgent[] = [
  { id: "summary", label: "Smart Patient Summary Generator", arabic: "مولد ملخص المريض الذكي", icon: "📄", color: "#2b6cb8", task: "1", endpoint: "/api/contest/summary?patient=Patient/101&role=doctor", description: "Generates role-tailored FHIR patient summaries with conditions, medications, allergies, labs.", bonus: "Role-tailored summaries", bonusScore: 5, fhirResources: ["DocumentReference", "Composition"], irishClass: "BrainSAIT.Contest.SummaryGenerator", demoUrl: "/api/contest/summary?patient=P-5842&role=doctor" },
  { id: "prior-auth", label: "FHIR Prior Authorization Copilot", arabic: "مساعد التفويض المسبق", icon: "✅", color: "#0ea5e9", task: "2", endpoint: "/api/contest/prior-auth?patient=Patient/101&service=99213", description: "Assists in preparing prior authorization requests with diagnoses and evidence.", bonus: "Missing evidence checklist", bonusScore: 5, fhirResources: ["Claim", "Parameters", "Bundle"], irishClass: "BrainSAIT.Contest.PriorAuthCopilot", demoUrl: "/api/contest/prior-auth?patient=P-5842&service=99213" },
  { id: "gaps-in-care", label: "Gaps-in-Care Finder", arabic: "مكتشف الفجوات في الرعاية", icon: "🔍", color: "#ea580c", task: "3", endpoint: "/api/contest/gaps-in-care?patient=Patient/101", description: "Detects patients overdue for mammograms, vaccines, HbA1c checks, eye exams.", bonus: "Bilingual outreach messages", bonusScore: 5, fhirResources: ["DetectedIssue", "Communication"], irishClass: "BrainSAIT.Contest.GapsInCareFinder", demoUrl: "/api/contest/gaps-in-care?patient=P-5842" },
  { id: "medication-safety", label: "Medication Safety Assistant", arabic: "مساعد سلامة الأدوية", icon: "💊", color: "#22c55e", task: "4", endpoint: "/api/contest/medication-safety?patient=Patient/101", description: "Flags drug interactions, therapeutic duplications, allergy conflicts.", bonus: "Vector Search counseling", bonusScore: 5, fhirResources: ["Parameters", "MedicationRequest"], irishClass: "BrainSAIT.Contest.MedicationSafety", demoUrl: "/api/contest/medication-safety?patient=P-5842" },
  { id: "care-plan", label: "Care Plan Navigator", arabic: "ملاح خطة الرعاية", icon: "🗺️", color: "#2b6cb8", task: "5", endpoint: "/api/contest/care-plan?patient=Patient/101", description: "Turns CarePlan into daily/weekly/monthly actionable guidance.", bonus: "Auto-creates FHIR Tasks", bonusScore: 5, fhirResources: ["CarePlan", "Goal", "Task"], irishClass: "BrainSAIT.Contest.CarePlanNavigator", demoUrl: "/api/contest/care-plan?patient=P-5842" },
  { id: "clinical-trials", label: "Clinical Trial Matcher", arabic: "مطابق التجارب السريرية", icon: "🔬", color: "#a855f7", task: "6", endpoint: "/api/contest/clinical-trials?patient=Patient/101", description: "Matches patient records against trial eligibility criteria.", bonus: "Missing criteria prompts", bonusScore: 5, fhirResources: ["Parameters", "Bundle", "ResearchStudy"], irishClass: "BrainSAIT.Contest.ClinicalTrialMatcher", demoUrl: "/api/contest/clinical-trials?patient=P-5842" },
  { id: "readmission-risk", label: "Readmission Risk Workbench", arabic: "تقييم خطر إعادة الدخول", icon: "🏥", color: "#ef4444", task: "7", endpoint: "/api/contest/readmission-risk?patient=Patient/101", description: "Estimates 30-day readmission risk with weighted scoring.", bonus: "FHIR Tasks for next steps", bonusScore: 5, fhirResources: ["Parameters", "Task", "CarePlan"], irishClass: "BrainSAIT.Contest.ReadmissionRisk", demoUrl: "/api/contest/readmission-risk?patient=P-5842" },
  { id: "triage", label: "Conversational FHIR Triage", arabic: "مساعد الفرز الطبي", icon: "🚑", color: "#f59e0b", task: "8", endpoint: "/api/contest/triage?patient=Patient/101&symptoms=chest%20pain", description: "AI triage with 5-level acuity and handoff notes.", bonus: "Coded FHIR Observations", bonusScore: 5, fhirResources: ["QuestionnaireResponse", "Observation"], irishClass: "BrainSAIT.Contest.TriageAssistant", demoUrl: "/api/contest/triage?patient=P-5842&symptoms=chest%20pain" },
  { id: "imaging-followup", label: "Imaging Follow-Up Tracker", arabic: "متابعة نتائج التصوير", icon: "📡", color: "#0ea5e9", task: "9", endpoint: "/api/contest/imaging-followup?patient=Patient/101", description: "Tracks abnormal imaging/lab results with urgency reminders.", bonus: "AI patient reminders", bonusScore: 5, fhirResources: ["ImagingStudy", "Observation"], irishClass: "BrainSAIT.Contest.ImagingFollowup", demoUrl: "/api/contest/imaging-followup?patient=P-5842" },
  { id: "lab-explainer", label: "Patient-Friendly Lab Explainer", arabic: "شرح النتائج المخبرية", icon: "🧪", color: "#22c55e", task: "10", endpoint: "/api/contest/lab-explainer?patient=Patient/101", description: "Explains HbA1c, LDL, eGFR in lay terms with bilingual explanations.", bonus: "Vector Search content", bonusScore: 5, fhirResources: ["Bundle", "Observation"], irishClass: "BrainSAIT.Contest.LabExplainer", demoUrl: "/api/contest/lab-explainer?patient=P-5842" },
  { id: "nl-query", label: "NL to FHIR Query Explorer", arabic: "تحويل اللغة الطبيعية إلى FHIR", icon: "💬", color: "#64748b", task: "11", endpoint: "/api/contest/nl-query?q=Show%20diabetic%20patients", description: "Converts plain-language to FHIR R4 and SQL queries.", bonus: "Shows generated queries", bonusScore: 5, fhirResources: ["Parameters"], irishClass: "BrainSAIT.Contest.NLQueryExplorer", demoUrl: "/api/contest/nl-query?q=Show%20diabetic%20patients" },
  { id: "sdoh-referral", label: "SDOH Community Referral", arabic: "الإحالة المجتمعية", icon: "🤝", color: "#ea580c", task: "11", endpoint: "/api/contest/sdoh-referral?needs=food,transportation", description: "Recommends community resources based on social needs.", bonus: "Semantic Vector matching", bonusScore: 5, fhirResources: ["Bundle", "Task"], irishClass: "BrainSAIT.Contest.SDOHReferralMatcher", demoUrl: "/api/contest/sdoh-referral?needs=food,transportation" },
];

/* ── CONTEST TASK CARD ── */
interface TaskCardProps {
  agent: ContestAgent;
  onRun: (agent: ContestAgent) => void;
  isRunning: boolean;
}

function TaskCard({ agent, onRun, isRunning }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <GlassCard 
      className={`overflow-hidden transition-all duration-300 hover:scale-[1.01] ${
        expanded ? 'border-cyan-500/30' : 'border-white/8'
      }`}
      style={{ borderLeft: `3px solid ${agent.color}` }}
    >
      {/* Header bar */}
      <div 
        className="h-1" 
        style={{ background: `linear-gradient(90deg, ${agent.color}88, ${agent.color}44)` }} 
      />

      <div className="p-4">
        {/* Title row */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
              style={{ background: `${agent.color}22` }}
            >
              {agent.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-white">{agent.label}</h4>
                <Badge variant="outline" className="text-[9px] border-green-500/30 bg-green-500/10 text-green-400">
                  Task {agent.task}
                </Badge>
              </div>
              <div className="text-xs" style={{ color: agent.color, direction: "rtl" }}>
                {agent.arabic}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="mb-3 text-xs leading-relaxed text-gray-400">
          {agent.description}
        </p>

        {/* Bonus badge */}
        <div className="mb-3">
          <Badge className="border-amber-500/20 bg-amber-500/10 text-[10px] text-amber-400">
            <Star className="mr-1 h-2.5 w-2.5" />
            +{agent.bonusScore} — {agent.bonus}
          </Badge>
        </div>

        {/* FHIR Resources */}
        <div className="mb-3 flex flex-wrap gap-1">
          {agent.fhirResources.map((r) => (
            <Badge 
              key={r} 
              variant="outline" 
              className="border-cyan-500/20 bg-cyan-500/5 px-1.5 py-0 font-mono text-[9px] text-cyan-400"
            >
              {r}
            </Badge>
          ))}
        </div>

        {/* Expandable endpoint section */}
        {expanded && (
          <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
            <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase">
              <Code2 className="h-3 w-3" />
              Endpoint
            </div>
            <div className="flex items-center gap-2">
              <a
                href={agent.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 truncate rounded bg-white/5 px-2.5 py-2 font-mono text-xs text-cyan-400 hover:bg-white/10"
              >
                {agent.endpoint}
              </a>
              <Button 
                variant="neon" 
                size="icon-xs"
                onClick={() => onRun(agent)}
                disabled={isRunning}
              >
                {isRunning ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
              </Button>
            </div>

            {/* IRIS Class */}
            <div className="mt-2">
              <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase">
                <Database className="h-3 w-3" />
                InterSystems IRIS
              </div>
              <code className="block rounded bg-white/5 px-2.5 py-2 font-mono text-[10px] text-orange-400">
                {agent.irishClass}
              </code>
            </div>
          </div>
        )}

        {/* Toggle expand */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="mt-2 w-full justify-center text-gray-500 hover:text-white"
        >
          <ChevronRight className={`h-3 w-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          <span className="ml-1 text-[10px]">{expanded ? 'Less' : 'More'}</span>
        </Button>
      </div>
    </GlassCard>
  );
}

export default function ContestPanel() {
  const [runningAgent, setRunningAgent] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});
  const [health, setHealth] = useState<any>(null);

  // Fetch health on mount
  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(setHealth)
      .catch(() => {});
  }, []);

  const handleRunAgent = useCallback(async (agent: ContestAgent) => {
    setRunningAgent(agent.id);
    try {
      const res = await fetch(agent.demoUrl);
      const data = await res.json();
      setResults(prev => ({ ...prev, [agent.id]: data }));
    } catch (err) {
      console.error('Agent error:', err);
    } finally {
      setRunningAgent(null);
    }
  }, []);

  const totalBonus = CONTEST_AGENTS.reduce((s, a) => s + a.bonusScore, 0);
  const totalPrize = totalBonus * 80;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <Trophy className="h-5 w-5 text-yellow-400" />
            InterSystems AI Agents for FHIR Contest
          </h2>
          <p className="text-xs text-gray-500">
            12 contest tasks — {totalBonus} bonus points possible
          </p>
        </div>
        
        {/* Status badges */}
        <div className="flex items-center gap-2">
          <Badge className="border-blue-500/30 bg-blue-500/10 text-[11px] text-blue-400">
            <Zap className="mr-1.5 h-3 w-3" />
            {health?.version || 'Loading...'}
          </Badge>
          <Badge className="border-yellow-500/30 bg-yellow-500/10 text-[11px] text-yellow-400">
            25 May – 14 Jun 2026
          </Badge>
          <Badge className="border-green-500/30 bg-green-500/10 text-[11px] text-green-400">
            ${totalPrize}+ prize potential
          </Badge>
        </div>
      </div>

      {/* Progress bar */}
      <GlassCard className="mb-6 p-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-gray-400">Submission Progress</span>
          <span className="font-semibold text-emerald-400">
            12/12 Tasks (100%)
          </span>
        </div>
        <Progress 
          value={100} 
          className="h-2 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-cyan-500 [&>div]:to-emerald-500" 
        />
      </GlassCard>

      {/* Stats cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Tasks", value: "12/12", sub: "All implemented", color: "text-emerald-400", icon: CheckCircle },
          { label: "Bonus Pts", value: `${totalBonus}`, sub: "12 × 5pts", color: "text-yellow-400", icon: Star },
          { label: "IRIS Classes", value: "12", sub: "One per agent", color: "text-cyan-400", icon: Database },
          { label: "API Endpoints", value: "12", sub: "Cloudflare", color: "text-purple-400", icon: Globe },
        ].map((stat) => (
          <GlassCard key={stat.label} className="p-4 text-center">
            <stat.icon className={`mx-auto mb-2 h-5 w-5 ${stat.color}`} />
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] text-gray-500 mt-1">{stat.label}</div>
            <div className="text-[9px] text-gray-600">{stat.sub}</div>
          </GlassCard>
        ))}
      </div>

      {/* Task grid */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {CONTEST_AGENTS.map((agent) => (
          <TaskCard 
            key={agent.id} 
            agent={agent} 
            onRun={handleRunAgent}
            isRunning={runningAgent === agent.id}
          />
        ))}
      </div>

      {/* Backend integrations */}
      <GlassCard className="mt-6 border-purple-500/20">
        <div className="p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-purple-400">
            <Globe className="h-4 w-4" />
            BrainSAIT Health Ecosystem — 9 Integrated Backends
          </div>
          
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { id: "hnh", label: "HNH Hospitals", desc: "Al Ribat / Gharnata — patient records", url: "/api/ecosystem/hnh" },
              { id: "nphies", label: "NPHIES Saudi", desc: "National claims network", url: "/api/ecosystem/nphies" },
              { id: "basma", label: "BASMA Voice", desc: "Arabic/English TTS", url: "/api/ecosystem/basma" },
              { id: "givc", label: "GIVC Platform", desc: "Healthcare platform", url: "/api/ecosystem/givc" },
              { id: "sbs", label: "SBS Billing", desc: "Insurance coverage", url: "/api/ecosystem/sbs" },
              { id: "oracle", label: "Oracle Bridge", desc: "6 hospital EHRs", url: "/api/ecosystem/oracle" },
              { id: "claimlinc", label: "ClaimLinc", desc: "NPHIES claims API", url: "/api/ecosystem/claimlinc" },
              { id: "portals", label: "Portals", desc: "Unified gateway", url: "/api/ecosystem/portals" },
              { id: "healthcare", label: "Healthcare GW", desc: "FHIR routing", url: "/api/ecosystem/healthcare-gateway" },
            ].map((backend) => (
              <a
                key={backend.id}
                href={backend.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-lg border border-white/8 bg-white/3 p-3 transition-all hover:border-white/20 hover:bg-white/8"
              >
                <div>
                  <div className="text-sm font-semibold text-gray-200 group-hover:text-white">
                    {backend.label}
                  </div>
                  <div className="text-[10px] text-gray-500">{backend.desc}</div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-600 group-hover:text-cyan-400" />
              </a>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}