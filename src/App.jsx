"use client";

import { useState, useEffect } from "react";
import { LINC_AGENTS } from "./data/agents.js";
import { CF_WORKERS } from "./data/workers.js";
import { FHIR_FLOWS } from "./data/fhir-flows.js";
import { INTERSYSTEMS_ARCH, UNIFICATION_PLAN } from "./data/intersystems.js";
import { BrainSAITContainer } from "./components/ui/brainsait.tsx";
import Header from "./components/Header.jsx";
import TabBar from "./components/TabBar.jsx";
import AgentPanel from "./components/AgentPanel.jsx";
import FhirFlows from "./components/FhirFlows.jsx";
import WorkerList from "./components/WorkerList.jsx";
import InterSystemsPanel from "./components/InterSystemsPanel.jsx";
import UnificationPlan from "./components/UnificationPlan.jsx";
import ContestPanel from "./components/ContestPanel.jsx";
import PortalHub from "./components/PortalHub.jsx";
import FhirLintPanel from "./components/FhirLintPanel.jsx";
import UnifiedDashboard from "./components/UnifiedDashboard.jsx";

const TABS = [
  { id: "patient", label: "🖥️ Portals", arabic: "البوابات" },
  { id: "agents", label: "Agents", arabic: "العملاء" },
  { id: "fhir", label: "FHIR Flows", arabic: "التدفقات" },
  { id: "contest", label: "🏆 Contest", arabic: "المسابقة" },
  { id: "workers", label: "Workers", arabic: "الخدمات" },
  { id: "intersys", label: "IRIS", arabic: "النظام" },
  { id: "plan", label: "Roadmap", arabic: "الخطة" },
  { id: "lint", label: "✅ FHIR Lint", arabic: "التحقق" },
  { id: "unified", label: "🎯 BotFather", arabic: "هيئة_botFather" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("patient");
  const [ecosystem, setEcosystem] = useState(null);
  const [nphies, setNphies] = useState(null);
  const [loading, setLoading] = useState("");

  useEffect(() => {
    const BASE = window.location.origin;
    setLoading("Loading...");
    Promise.allSettled([
      fetch(`${BASE}/api/ecosystem`).then(r => r.json()).then(setEcosystem).catch(() => {}),
      fetch(`${BASE}/api/nphies/network`).then(r => r.json()).then(setNphies).catch(() => {}),
    ]).finally(() => setLoading(""));
  }, []);

  const totalWorkers = ecosystem?.backends?.reduce?.((s, b) => s + (b.workers || 1), 0) || 0;
  const nphiesApproval = nphies?.data?.financials?.network_approval_rate_pct;

  return (
    <BrainSAITContainer>
      <div className="font-sans text-gray-200">
        {loading && (
          <div className="fixed top-4 right-4 z-50 animate-pulse rounded-full bg-cyan-500/20 px-3 py-1 text-[11px] text-cyan-400 backdrop-blur-sm">
            {loading}
          </div>
        )}

        {/* Ecosystem Status Bar */}
        {ecosystem && (
          <div className="border-b border-white/[0.04] bg-white/[0.02]">
            <div className="flex items-center justify-between gap-4 overflow-x-auto px-8 py-1.5 text-[11px]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-gray-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  {ecosystem.total} Backends
                </span>
                <span className="flex items-center gap-1.5 text-gray-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                  {totalWorkers}+ Workers
                </span>
                <span className="flex items-center gap-1.5 text-gray-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  {LINC_AGENTS.length} LINC Agents
                </span>
                <span className="flex items-center gap-1.5 text-gray-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                  12 Contest Tasks
                </span>
              </div>
              <div className="flex items-center gap-4">
                {nphiesApproval && (
                  <span className="flex items-center gap-1.5 text-green-400">
                    🇸🇦 NPHIES {nphiesApproval}% Approval
                  </span>
                )}
                <a
                  href="https://github.com/Fadil369/brainsait-linc-fhir"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-400 transition-colors"
                >
                  GitHub ↗
                </a>
              </div>
            </div>
          </div>
        )}

        <Header
          workerCount={CF_WORKERS.length}
          agentCount={LINC_AGENTS.length}
        />
        <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="px-8 py-7">
          {activeTab === "patient" && <PortalHub />}
          {activeTab === "agents" && <AgentPanel agents={LINC_AGENTS} />}
          {activeTab === "fhir" && <FhirFlows flows={FHIR_FLOWS} />}
          {activeTab === "contest" && <ContestPanel />}
          {activeTab === "workers" && <WorkerList workers={CF_WORKERS} />}
          {activeTab === "intersys" && <InterSystemsPanel arch={INTERSYSTEMS_ARCH} />}
          {activeTab === "plan" && (
            <UnificationPlan
              plan={UNIFICATION_PLAN}
              workerCount={CF_WORKERS.length}
              agentCount={LINC_AGENTS.length}
            />
          )}
          {activeTab === "lint" && <FhirLintPanel />}
          {activeTab === "unified" && <UnifiedDashboard />}
        </div>
      </div>
    </BrainSAITContainer>
  );
}
