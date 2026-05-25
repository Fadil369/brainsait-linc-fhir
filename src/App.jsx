import { useState } from "react";
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

const TABS = [
  { id: "agents", label: "LINC Agents", arabic: "وكلاء لينك" },
  { id: "fhir", label: "FHIR Flows", arabic: "تدفقات FHIR" },
  { id: "contest", label: "🏆 Contest", arabic: "المسابقة" },
  { id: "workers", label: "CF Workers", arabic: "عمال كلاود فلير" },
  { id: "intersys", label: "InterSystems", arabic: "إنتر سيستمز" },
  { id: "plan", label: "Unification Plan", arabic: "خطة التوحيد" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("agents");

  return (
    <BrainSAITContainer>
      <div className="font-sans text-gray-200">
        <Header
          workerCount={CF_WORKERS.length}
          agentCount={LINC_AGENTS.length}
        />
        <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="px-8 py-7">
          {activeTab === "agents" && <AgentPanel agents={LINC_AGENTS} />}
          {activeTab === "fhir" && <FhirFlows flows={FHIR_FLOWS} />}
          {activeTab === "contest" && <ContestPanel />}
          {activeTab === "workers" && <WorkerList workers={CF_WORKERS} />}
          {activeTab === "intersys" && (
            <InterSystemsPanel arch={INTERSYSTEMS_ARCH} />
          )}
          {activeTab === "plan" && (
            <UnificationPlan
              plan={UNIFICATION_PLAN}
              workerCount={CF_WORKERS.length}
              agentCount={LINC_AGENTS.length}
            />
          )}
        </div>
      </div>
    </BrainSAITContainer>
  );
}
