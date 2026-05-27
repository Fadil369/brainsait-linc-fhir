"use client";
import { useState } from "react";

const ROUTING_MATRIX = [
  { operation: "GET /fhir/Patient", agent: "HealthcareLinc", worker: "givc-healthcare-api", cfResource: "KV:PATIENT_INDEX + D1:brainsait_fhir_db", latency: "45ms", volume: "8.1K/hr" },
  { operation: "POST /fhir/Claim", agent: "ClaimLinc", worker: "claim-chat-agent", cfResource: "KV:CLAIM_STATUS + Queue:claim-submissions", latency: "89ms", volume: "1.2K/hr" },
  { operation: "GET /fhir/Coverage (eligibility)", agent: "ClaimLinc", worker: "rcm-validation-api", cfResource: "KV:CLAIM_STATUS + D1:nphies_claims_db", latency: "234ms", volume: "890/hr" },
  { operation: "POST /fhir/ImagingStudy", agent: "RadioLinc", worker: "givc-dicom-agent", cfResource: "R2:dicom-images + DO:WorkflowCoordinator", latency: "1.2s", volume: "120/hr" },
  { operation: "GET /fhir/AuditEvent", agent: "ComplianceLinc", worker: "givc-compliance", cfResource: "D1:audit_log_db + R2:audit-logs", latency: "28ms", volume: "14K/hr" },
  { operation: "POST /fhir/CarePlan", agent: "ClinicalLinc", worker: "givc-clinical-decision", cfResource: "D1:brainsait_fhir_db + AI:claude-3-haiku", latency: "445ms", volume: "234/hr" },
  { operation: "POST /fhir/DocumentReference", agent: "ContextLinc", worker: "contextlinc-api", cfResource: "R2:fhir-documents + R2:clinical-notes + DO:WorkflowCoordinator", latency: "234ms", volume: "890/hr" },
  { operation: "POST /api/translate", agent: "TTLinc", worker: "healthlinc-unified", cfResource: "KV:TERMINOLOGY + AI:llama-3.1-8b", latency: "89ms", volume: "2.1K/hr" },
  { operation: "POST /api/agents/doculinc/chat", agent: "DocuLinc", worker: "healthlinc-unified", cfResource: "AI:claude-3-haiku + D1:brainsait_fhir_db", latency: "234ms", volume: "445/hr" },
  { operation: "POST /api/context/upload (OCR)", agent: "ContextLinc", worker: "brainsait-ocr-worker", cfResource: "R2:ocr-processed + Queue:ocr-pipeline + AI:whisper", latency: "1.7s", volume: "89/hr" },
  { operation: "GET /api/mcp/tools (MCP)", agent: "MASTERLINC", worker: "healthlinc-mcp", cfResource: "KV:AGENT_CONFIG + DO:AgentSession", latency: "12ms", volume: "12K/hr" },
  { operation: "POST /api/compliance/audit", agent: "ComplianceLinc", worker: "givc-compliance-monitor", cfResource: "Queue:audit-events + D1:audit_log_db", latency: "45ms", volume: "89K/hr" },
];

const ACTIVE_TASKS = [
  { id: "TASK-8821", type: "Claim Submission", agent: "ClaimLinc", status: "processing", patient: "XXXXXXXXX", duration: "1.2s", nphies: true },
  { id: "TASK-8820", type: "Prior Auth", agent: "ClaimLinc", status: "awaiting-nphies", patient: "XXXXXXXXX", duration: "45s", nphies: true },
  { id: "TASK-8819", type: "Clinical Note", agent: "DocuLinc", status: "complete", patient: "XXXXXXXXX", duration: "0.8s", nphies: false },
  { id: "TASK-8818", type: "DICOM Analysis", agent: "RadioLinc", status: "processing", patient: "XXXXXXXXX", duration: "8.4s", nphies: false },
  { id: "TASK-8817", type: "Eligibility Check", agent: "ClaimLinc", status: "complete", patient: "XXXXXXXXX", duration: "0.3s", nphies: true },
  { id: "TASK-8816", type: "OCR Document", agent: "ContextLinc", status: "queued", patient: "XXXXXXXXX", duration: "—", nphies: false },
  { id: "TASK-8815", type: "Audit Log", agent: "ComplianceLinc", status: "complete", patient: "system", duration: "0.1s", nphies: false },
];

const AGENT_HEALTH = [
  { id: "masterlinc", label: "MASTERLINC", icon: "🧠", requests: "148K/day", errors: 14, uptime: 99.99, p99: "120ms", queue: 89, worker: "brainsait-masterlinc-production" },
  { id: "claimlinc", label: "ClaimLinc", icon: "📋", requests: "63K/day", errors: 6, uptime: 99.98, p99: "234ms", queue: 3841, worker: "claim-chat-agent" },
  { id: "radiolinc", label: "RadioLinc", icon: "🔬", requests: "7K/day", errors: 13, uptime: 99.85, p99: "2.3s", queue: 12, worker: "givc-dicom-agent" },
  { id: "compliancelinc", label: "ComplianceLinc", icon: "🛡️", requests: "590K/day", errors: 0, uptime: 100.0, p99: "56ms", queue: 89234, worker: "givc-compliance-monitor" },
  { id: "clinicallinc", label: "ClinicalLinc", icon: "⚕️", requests: "28K/day", errors: 11, uptime: 99.96, p99: "445ms", queue: 0, worker: "givc-clinical-decision" },
  { id: "healthcarelinc", label: "HealthcareLinc", icon: "🏥", requests: "278K/day", errors: 56, uptime: 99.98, p99: "95ms", queue: 14892, worker: "givc-healthcare-api" },
  { id: "ttlinc", label: "TTLinc", icon: "🌐", requests: "2.1K/hr", errors: 2, uptime: 99.99, p99: "89ms", queue: 0, worker: "healthlinc-unified" },
  { id: "contextlinc", label: "ContextLinc", icon: "📂", requests: "42K/day", errors: 59, uptime: 99.86, p99: "890ms", queue: 1284, worker: "contextlinc-api" },
  { id: "doculinc", label: "DocuLinc", icon: "📝", requests: "445/hr", errors: 1, uptime: 99.99, p99: "234ms", queue: 0, worker: "healthlinc-unified" },
];

const TEST_FHIR_OPERATIONS = [
  { label: "GET Patient", method: "GET", path: "/fhir/Patient/{{id}}", agent: "HealthcareLinc", worker: "givc-healthcare-api" },
  { label: "Check Eligibility", method: "POST", path: "/fhir/CoverageEligibilityRequest", agent: "ClaimLinc", worker: "rcm-validation-api" },
  { label: "Submit Claim", method: "POST", path: "/fhir/Claim", agent: "ClaimLinc", worker: "claim-chat-agent" },
  { label: "Generate Care Plan", method: "POST", path: "/api/clinical/care-plan", agent: "ClinicalLinc", worker: "givc-clinical-decision" },
  { label: "Translate (AR→EN)", method: "POST", path: "/api/translate", agent: "TTLinc", worker: "healthlinc-unified" },
  { label: "Upload Document", method: "POST", path: "/api/context/upload", agent: "ContextLinc", worker: "contextlinc-api" },
  { label: "Analyze DICOM", method: "POST", path: "/api/dicom/analyze", agent: "RadioLinc", worker: "givc-dicom-agent" },
  { label: "Log Audit Event", method: "POST", path: "/api/compliance/audit", agent: "ComplianceLinc", worker: "givc-compliance-monitor" },
];

const AGENT_ICONS = {
  HealthcareLinc: "🏥",
  ClaimLinc: "📋",
  ComplianceLinc: "🛡️",
  RadioLinc: "🔬",
  ClinicalLinc: "⚕️",
  ContextLinc: "📂",
  TTLinc: "🌐",
  DocuLinc: "📝",
  MASTERLINC: "🧠",
};

const TABS_ORCH = ["Routing", "Tasks", "Health"];

function StatusBadge({ status }) {
  const map = {
    processing: "bg-blue-500/20 text-blue-300 border-blue-500/30 animate-pulse",
    "awaiting-nphies": "bg-orange-500/20 text-orange-300 border-orange-500/30",
    complete: "bg-green-500/20 text-green-300 border-green-500/30",
    queued: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium border ${map[status] || "bg-white/10 text-gray-400 border-white/20"}`}>
      {status}
    </span>
  );
}

function uptimeColor(uptime) {
  if (uptime >= 99.9) return "text-green-400";
  if (uptime >= 99.5) return "text-yellow-400";
  return "text-red-400";
}

function queueColor(queue) {
  if (queue === 0) return "bg-green-500";
  if (queue > 10000) return "bg-orange-500";
  return "bg-blue-500";
}

function queueWidth(queue) {
  if (queue === 0) return "w-1";
  if (queue > 50000) return "w-full";
  const pct = Math.min(100, (queue / 50000) * 100);
  if (pct < 5) return "w-[5%]";
  if (pct < 10) return "w-[10%]";
  if (pct < 20) return "w-[20%]";
  if (pct < 30) return "w-[30%]";
  if (pct < 40) return "w-[40%]";
  if (pct < 50) return "w-[50%]";
  if (pct < 60) return "w-[60%]";
  if (pct < 70) return "w-[70%]";
  if (pct < 80) return "w-[80%]";
  if (pct < 90) return "w-[90%]";
  return "w-full";
}

function parseResources(cfResource) {
  return cfResource.split("+").map(s => s.trim());
}

export default function AgentOrchestrator() {
  const [activeTab, setActiveTab] = useState("Routing");
  const [toast, setToast] = useState(null);

  function sendTestOperation(op) {
    setToast({ message: `→ Routed to ${op.agent} via ${op.worker}`, path: op.path });
    setTimeout(() => setToast(null), 3500);
  }

  return (
    <div className="relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-8 z-50 rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-3 text-sm text-green-300 shadow-lg backdrop-blur-sm animate-pulse">
          <div className="font-medium">{toast.message}</div>
          <div className="text-xs text-green-500 font-mono mt-0.5">{toast.path}</div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">🤖 MASTERLINC Orchestrator</h2>
        <p className="text-xs text-gray-500 mt-1">
          Central control plane — agent routing, task queue, and health monitoring
        </p>
      </div>

      {/* Internal Tabs */}
      <div className="border-b border-white/[0.05] bg-white/[0.02] flex gap-2 px-0 mb-6">
        {TABS_ORCH.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-gray-500 hover:text-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ROUTING TAB */}
      {activeTab === "Routing" && (
        <div>
          <div className="mb-4">
            <div className="text-base font-semibold text-white">MASTERLINC Routing Matrix</div>
            <div className="text-xs text-gray-500 mt-0.5">FHIR Operation → CF Resource mapping — all traffic routed through edge workers</div>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                    {["FHIR Operation", "Agent", "CF Worker", "CF Resources", "Avg Latency", "Volume"].map((h) => (
                      <th key={h} className="text-left text-xs text-gray-500 uppercase tracking-wider pb-2 pt-3 px-4 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROUTING_MATRIX.map((row, i) => (
                    <tr key={i} className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <code className="text-xs font-mono text-cyan-300">{row.operation}</code>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-white flex items-center gap-1.5">
                          <span>{AGENT_ICONS[row.agent] || "🔧"}</span>
                          <span className="text-xs">{row.agent}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-xs font-mono text-gray-400">{row.worker}</code>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {parseResources(row.cfResource).map((r) => (
                            <span key={r} className="rounded px-1.5 py-0.5 text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 whitespace-nowrap">{r}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm text-white">{row.latency}</td>
                      <td className="py-3 px-4 font-mono text-sm text-gray-300">{row.volume}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TASKS TAB */}
      {activeTab === "Tasks" && (
        <div className="space-y-6">
          <div>
            <div className="text-base font-semibold text-white mb-1">
              Active Task Queue — <span className="text-cyan-400">{ACTIVE_TASKS.length} tasks in flight</span>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                      {["Task ID", "Type", "Agent", "Status", "Patient", "Duration", "NPHIES"].map((h) => (
                        <th key={h} className="text-left text-xs text-gray-500 uppercase tracking-wider pb-2 pt-3 px-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ACTIVE_TASKS.map((task) => (
                      <tr key={task.id} className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-cyan-400">{task.id}</td>
                        <td className="py-3 px-4 text-sm text-gray-300">{task.type}</td>
                        <td className="py-3 px-4">
                          <span className="flex items-center gap-1.5">
                            <span>{AGENT_ICONS[task.agent] || "🔧"}</span>
                            <span className="text-xs text-gray-300">{task.agent}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4"><StatusBadge status={task.status} /></td>
                        <td className="py-3 px-4 font-mono text-xs text-gray-500">{task.patient}</td>
                        <td className="py-3 px-4 font-mono text-sm text-white">{task.duration}</td>
                        <td className="py-3 px-4 text-center">
                          {task.nphies ? <span title="NPHIES transaction">🇸🇦</span> : <span className="text-gray-600">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Send Test Operation */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
            <div className="text-base font-semibold text-white mb-1">Send Test Operation</div>
            <div className="text-xs text-gray-500 mb-4">Dispatch a test FHIR operation through the MASTERLINC routing layer</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {TEST_FHIR_OPERATIONS.map((op) => (
                <button
                  key={op.label}
                  onClick={() => sendTestOperation(op)}
                  className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-left transition-all hover:border-blue-500/30 hover:bg-blue-500/[0.05] active:scale-[0.98]"
                >
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold font-mono shrink-0 ${
                    op.method === "GET"
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                  }`}>
                    {op.method}
                  </span>
                  <div>
                    <div className="text-sm text-white font-medium">{op.label}</div>
                    <div className="text-[10px] font-mono text-gray-500 mt-0.5">{op.path}</div>
                  </div>
                  <span className="ml-auto text-[10px] text-gray-600">{op.agent}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HEALTH TAB */}
      {activeTab === "Health" && (
        <div>
          <div className="mb-4">
            <div className="text-base font-semibold text-white">LINC Agent Health Matrix</div>
            <div className="text-xs text-gray-500 mt-0.5">Real-time health metrics for all LINC agents</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AGENT_HEALTH.map((agent) => (
              <div key={agent.id} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition-all hover:border-blue-500/30 hover:bg-blue-500/[0.05]">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{agent.icon}</span>
                    <div>
                      <div className="text-sm font-bold text-white">{agent.label}</div>
                      <div className="text-[10px] font-mono text-gray-500 mt-0.5">{agent.worker}</div>
                    </div>
                  </div>
                  <span className={`text-sm font-bold font-mono ${uptimeColor(agent.uptime)}`}>
                    {agent.uptime}%
                  </span>
                </div>

                {/* Mini stat boxes */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2">
                    <div className="text-[9px] text-gray-500 uppercase mb-0.5">Reqs</div>
                    <div className="font-mono text-xs text-white leading-tight">{agent.requests}</div>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2">
                    <div className="text-[9px] text-gray-500 uppercase mb-0.5">Errors</div>
                    <div className={`font-mono text-xs leading-tight ${agent.errors > 10 ? "text-red-400" : "text-green-400"}`}>
                      {agent.errors}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2">
                    <div className="text-[9px] text-gray-500 uppercase mb-0.5">Uptime</div>
                    <div className={`font-mono text-xs leading-tight ${uptimeColor(agent.uptime)}`}>
                      {agent.uptime >= 100 ? "100%" : `${agent.uptime}%`}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2">
                    <div className="text-[9px] text-gray-500 uppercase mb-0.5">P99</div>
                    <div className="font-mono text-xs text-white leading-tight">{agent.p99}</div>
                  </div>
                </div>

                {/* Queue depth */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-500">Queue Depth</span>
                    <span className={`text-[10px] font-mono ${agent.queue > 10000 ? "text-orange-400" : agent.queue > 0 ? "text-blue-400" : "text-green-400"}`}>
                      {agent.queue.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${queueColor(agent.queue)} ${queueWidth(agent.queue)}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
