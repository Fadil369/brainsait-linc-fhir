"use client";
import { useState } from "react";

const CF_KV_NAMESPACES = [
  { id: "FHIR_CACHE", title: "FHIR Resource Cache", keys: 12847, reads: "2.4M/day", writes: "145K/day", size: "892 MB", agent: "HealthcareLinc", color: "cyan" },
  { id: "PATIENT_INDEX", title: "Patient Index", keys: 84320, reads: "8.1M/day", writes: "23K/day", size: "1.2 GB", agent: "HealthcareLinc", color: "blue" },
  { id: "CLAIM_STATUS", title: "NPHIES Claim Status", keys: 34891, reads: "1.9M/day", writes: "89K/day", size: "412 MB", agent: "ClaimLinc", color: "orange" },
  { id: "SESSION_STORE", title: "SMART Auth Sessions", keys: 2341, reads: "5.6M/day", writes: "230K/day", size: "28 MB", agent: "AuthLinc", color: "green" },
  { id: "AGENT_CONFIG", title: "LINC Agent Config", keys: 127, reads: "890K/day", writes: "1.2K/day", size: "4.1 MB", agent: "MASTERLINC", color: "purple" },
  { id: "TERMINOLOGY", title: "FHIR Terminology Cache", keys: 98432, reads: "3.2M/day", writes: "500/day", size: "2.8 GB", agent: "TTLinc", color: "indigo" },
];

const CF_R2_BUCKETS = [
  { name: "fhir-documents", title: "FHIR Clinical Documents", objects: 284710, size: "48.2 GB", agent: "ContextLinc", transfers: "1.2 TB/mo", icon: "📄" },
  { name: "dicom-images", title: "DICOM Imaging Studies", objects: 92847, size: "2.8 TB", agent: "RadioLinc", transfers: "890 GB/mo", icon: "🔬" },
  { name: "audit-logs", title: "HIPAA Audit Logs", objects: 1843920, size: "128 GB", agent: "ComplianceLinc", transfers: "45 GB/mo", icon: "🛡️" },
  { name: "clinical-notes", title: "Clinical Note Archives", objects: 748291, size: "84 GB", agent: "DocuLinc", transfers: "234 GB/mo", icon: "📝" },
  { name: "ocr-processed", title: "OCR Processed Documents", objects: 124832, size: "18 GB", agent: "ContextLinc", transfers: "62 GB/mo", icon: "📂" },
];

const CF_D1_DATABASES = [
  { name: "brainsait_fhir_db", title: "FHIR Resources DB", tables: 48, rows: "12.8M", size: "4.2 GB", agent: "HealthcareLinc", queries: "890K/day" },
  { name: "nphies_claims_db", title: "NPHIES Claims Database", tables: 24, rows: "3.4M", size: "1.8 GB", agent: "ClaimLinc", queries: "234K/day" },
  { name: "audit_log_db", title: "Compliance Audit Log", tables: 12, rows: "48.2M", size: "8.9 GB", agent: "ComplianceLinc", queries: "120K/day" },
  { name: "analytics_db", title: "Clinical Analytics", tables: 36, rows: "84.7M", size: "14.2 GB", agent: "MASTERLINC", queries: "45K/day" },
];

const CF_DURABLE_OBJECTS = [
  { class: "FhirSession", instances: 2847, namespace: "FHIR_SESSIONS", description: "Active SMART on FHIR sessions", agent: "HealthcareLinc", icon: "🔐" },
  { class: "ClaimStateMachine", instances: 8934, namespace: "CLAIM_WORKFLOWS", description: "NPHIES claim processing state machines", agent: "ClaimLinc", icon: "⚙️" },
  { class: "AgentSession", instances: 127, namespace: "AGENT_SESSIONS", description: "Active LINC agent conversations", agent: "MASTERLINC", icon: "🤖" },
  { class: "WorkflowCoordinator", instances: 341, namespace: "WORKFLOW_STATE", description: "Multi-step clinical workflow state", agent: "MASTERLINC", icon: "🔄" },
  { class: "AuditCollector", instances: 24, namespace: "AUDIT_BUFFER", description: "Real-time HIPAA audit event buffering", agent: "ComplianceLinc", icon: "🛡️" },
];

const CF_QUEUES = [
  { name: "fhir-events", messages: 14892, dlq: 23, throughput: "2.1K/min", agent: "MASTERLINC", description: "FHIR resource change events", icon: "⚡" },
  { name: "claim-submissions", messages: 3841, dlq: 7, throughput: "234/min", agent: "ClaimLinc", description: "NPHIES claim batch queue", icon: "📋" },
  { name: "audit-events", messages: 89234, dlq: 0, throughput: "8.9K/min", agent: "ComplianceLinc", description: "HIPAA audit event stream", icon: "🛡️" },
  { name: "agent-tasks", messages: 892, dlq: 2, throughput: "89/min", agent: "MASTERLINC", description: "LINC agent task dispatch", icon: "🧠" },
  { name: "ocr-pipeline", messages: 1284, dlq: 15, throughput: "45/min", agent: "ContextLinc", description: "Document OCR processing jobs", icon: "📂" },
];

const CF_AI_MODELS = [
  { model: "@cf/anthropic/claude-3-haiku", provider: "Anthropic AI Gateway", requests: "284K/day", tokens: "48.2M/day", latency: "234ms", cost: "$84/day", agents: ["DocuLinc", "ClinicalLinc"], icon: "🧠" },
  { model: "@cf/meta/llama-3.1-8b-instruct", provider: "Workers AI (edge)", requests: "89K/day", tokens: "12.4M/day", latency: "89ms", cost: "$12/day", agents: ["TTLinc", "ContextLinc"], icon: "⚡" },
  { model: "@cf/openai/whisper-large-v3", provider: "Workers AI (ASR)", requests: "12K/day", tokens: "—", latency: "2.4s", cost: "$8/day", agents: ["TTLinc"], icon: "🎤" },
  { model: "@cf/baai/bge-large-en-v1.5", provider: "Workers AI (embeddings)", requests: "234K/day", tokens: "—", latency: "28ms", cost: "$6/day", agents: ["ContextLinc"], icon: "🔍" },
];

const CF_WORKER_METRICS = [
  { name: "healthlinc-unified", req: "284K", errRate: "0.02%", cpu: "12ms", status: "active", p99: "89ms" },
  { name: "healthlinc-mcp", req: "89K", errRate: "0.00%", cpu: "8ms", status: "active", p99: "45ms" },
  { name: "brainsait-masterlinc", req: "148K", errRate: "0.01%", cpu: "24ms", status: "active", p99: "120ms" },
  { name: "brainsait-masterlinc-production", req: "234K", errRate: "0.01%", cpu: "22ms", status: "active", p99: "115ms" },
  { name: "brainsait-unified-prod", req: "92K", errRate: "0.03%", cpu: "18ms", status: "active", p99: "98ms" },
  { name: "contextlinc-api", req: "34K", errRate: "0.05%", cpu: "45ms", status: "active", p99: "234ms" },
  { name: "contextlinc-file-processor", req: "8K", errRate: "0.12%", cpu: "89ms", status: "active", p99: "890ms" },
  { name: "claim-chat-agent", req: "18K", errRate: "0.00%", cpu: "34ms", status: "active", p99: "180ms" },
  { name: "givc-api-router", req: "892K", errRate: "0.00%", cpu: "2ms", status: "active", p99: "8ms" },
  { name: "givc-healthcare-api", req: "184K", errRate: "0.02%", cpu: "15ms", status: "active", p99: "78ms" },
  { name: "givc-healthcare-platform", req: "94K", errRate: "0.01%", cpu: "19ms", status: "active", p99: "95ms" },
  { name: "givc-compliance", req: "248K", errRate: "0.00%", cpu: "11ms", status: "active", p99: "56ms" },
  { name: "givc-compliance-monitor", req: "342K", errRate: "0.00%", cpu: "9ms", status: "active", p99: "45ms" },
  { name: "givc-clinical-decision", req: "28K", errRate: "0.04%", cpu: "89ms", status: "active", p99: "445ms" },
  { name: "givc-lab-parser", req: "12K", errRate: "0.08%", cpu: "128ms", status: "active", p99: "640ms" },
  { name: "givc-dicom-agent", req: "4K", errRate: "0.15%", cpu: "234ms", status: "active", p99: "1.2s" },
  { name: "givc-dicom-analysis", req: "3K", errRate: "0.18%", cpu: "456ms", status: "active", p99: "2.3s" },
  { name: "givc-oracle-container", req: "9K", errRate: "0.22%", cpu: "78ms", status: "active", p99: "390ms" },
  { name: "rcm-validation-api", req: "45K", errRate: "0.01%", cpu: "22ms", status: "active", p99: "110ms" },
  { name: "healthcare-insurance-analysis", req: "7K", errRate: "0.06%", cpu: "156ms", status: "active", p99: "780ms" },
  { name: "brainsait-doctor-hub-api", req: "38K", errRate: "0.02%", cpu: "28ms", status: "active", p99: "140ms" },
  { name: "brainsait-ocr-worker", req: "6K", errRate: "0.14%", cpu: "340ms", status: "active", p99: "1.7s" },
  { name: "brainsait-api-gateway", req: "1.2M", errRate: "0.00%", cpu: "1ms", status: "active", p99: "5ms" },
  { name: "admin-linc-369", req: "2K", errRate: "0.00%", cpu: "45ms", status: "active", p99: "225ms" },
];

const CF_ZERO_TRUST = [
  { app: "BrainSAIT Admin Portal", domain: "admin.brainsait.org", policy: "Email OTP + SAML", users: 12, lastAuth: "2m ago", status: "protected" },
  { app: "LINC Agent Dashboard", domain: "linc.brainsait.org", policy: "GitHub SSO + MFA", users: 8, lastAuth: "5m ago", status: "protected" },
  { app: "NPHIES Gateway", domain: "nphies-gw.brainsait.org", policy: "mTLS + IP Allowlist", users: 3, lastAuth: "1m ago", status: "protected" },
  { app: "IRIS Production", domain: "iris.brainsait.org", policy: "SAML + Device Trust", users: 5, lastAuth: "12m ago", status: "protected" },
  { app: "FHIR API (External)", domain: "fhir.brainsait.org", policy: "SMART on FHIR OAuth2", users: 284, lastAuth: "just now", status: "protected" },
];

const AGENT_RESOURCE_MAP = [
  { agent: "MASTERLINC", kv: ["AGENT_CONFIG"], r2: [], d1: ["analytics_db"], dos: ["AgentSession", "WorkflowCoordinator"] },
  { agent: "HealthcareLinc", kv: ["FHIR_CACHE", "PATIENT_INDEX"], r2: [], d1: ["brainsait_fhir_db"], dos: ["FhirSession"] },
  { agent: "ClaimLinc", kv: ["CLAIM_STATUS"], r2: [], d1: ["nphies_claims_db"], dos: ["ClaimStateMachine"] },
  { agent: "ComplianceLinc", kv: [], r2: ["audit-logs"], d1: ["audit_log_db"], dos: ["AuditCollector"] },
  { agent: "ContextLinc", kv: [], r2: ["fhir-documents", "ocr-processed"], d1: [], dos: ["WorkflowCoordinator"] },
  { agent: "RadioLinc", kv: [], r2: ["dicom-images"], d1: [], dos: [] },
  { agent: "DocuLinc", kv: [], r2: ["clinical-notes"], d1: [], dos: [] },
  { agent: "TTLinc", kv: ["TERMINOLOGY"], r2: [], d1: [], dos: [] },
  { agent: "AuthLinc", kv: ["SESSION_STORE"], r2: [], d1: [], dos: [] },
];

const TABS_CF = ["Overview", "Workers", "Storage", "Compute", "AI", "Security"];

function errRateColor(rate) {
  const v = parseFloat(rate);
  if (v < 0.05) return "text-green-400";
  if (v <= 0.2) return "text-yellow-400";
  return "text-red-400";
}

function cpuColor(cpu) {
  const v = parseInt(cpu);
  if (v < 50) return "text-green-400";
  if (v <= 200) return "text-yellow-400";
  return "text-red-400";
}

function kvColor(color) {
  const map = {
    cyan: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    blue: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    orange: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    green: "bg-green-500/20 text-green-300 border-green-500/30",
    purple: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    indigo: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  };
  return map[color] || "bg-white/10 text-gray-300 border-white/20";
}

export default function CloudflarePanel() {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">☁️ Cloudflare Infrastructure</h2>
        <p className="text-xs text-gray-500 mt-1">
          BrainSAIT LINC Platform — Cloudflare edge resources powering all FHIR operations
        </p>
      </div>

      {/* Internal Tabs */}
      <div className="border-b border-white/[0.05] bg-white/[0.02] flex gap-2 px-0 mb-6">
        {TABS_CF.map((tab) => (
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

      {/* OVERVIEW TAB */}
      {activeTab === "Overview" && (
        <div>
          {/* Big stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { label: "Total Requests", value: "3.8M/day", icon: "⚡" },
              { label: "Workers Active", value: "24/24", icon: "🟢" },
              { label: "KV Operations", value: "22M/day", icon: "🗄️" },
              { label: "R2 Storage", value: "3.1 TB", icon: "💾" },
              { label: "AI Inferences", value: "619K/day", icon: "🧠" },
              { label: "Zero Trust Apps", value: "5", icon: "🔐" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                <div className="text-xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-bold text-white font-mono">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Resource Allocation by LINC Agent */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 mb-6">
            <div className="text-base font-semibold text-white mb-1">Resource Allocation by LINC Agent</div>
            <div className="text-xs text-gray-500 mb-4">Cloudflare resources owned or consumed by each agent</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    {["Agent", "KV Namespaces", "R2 Buckets", "D1 Databases", "Durable Objects"].map((h) => (
                      <th key={h} className="text-left text-xs text-gray-500 uppercase tracking-wider pb-2 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {AGENT_RESOURCE_MAP.map((row) => (
                    <tr key={row.agent} className="border-b border-white/[0.05]">
                      <td className="py-3 pr-4 font-medium text-white text-sm">{row.agent}</td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-1">
                          {row.kv.length ? row.kv.map(k => (
                            <span key={k} className="rounded px-1.5 py-0.5 text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{k}</span>
                          )) : <span className="text-gray-600 text-xs">—</span>}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-1">
                          {row.r2.length ? row.r2.map(r => (
                            <span key={r} className="rounded px-1.5 py-0.5 text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">{r}</span>
                          )) : <span className="text-gray-600 text-xs">—</span>}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-1">
                          {row.d1.length ? row.d1.map(d => (
                            <span key={d} className="rounded px-1.5 py-0.5 text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">{d}</span>
                          )) : <span className="text-gray-600 text-xs">—</span>}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-1">
                          {row.dos.length ? row.dos.map(d => (
                            <span key={d} className="rounded px-1.5 py-0.5 text-[10px] font-mono bg-orange-500/10 text-orange-400 border border-orange-500/20">{d}</span>
                          )) : <span className="text-gray-600 text-xs">—</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Platform Health */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
            <div className="text-base font-semibold text-white mb-3">Platform Health</div>
            <div className="space-y-2">
              {[
                "Workers Edge Network",
                "AI Gateway",
                "Zero Trust",
                "D1 Database",
                "R2 Storage",
              ].map((service) => (
                <div key={service} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                  <span className="text-sm text-gray-300">{service}</span>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="text-xs text-green-400">✓ Operational</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* WORKERS TAB */}
      {activeTab === "Workers" && (
        <div>
          <div className="mb-4">
            <div className="text-base font-semibold text-white">Workers</div>
            <div className="text-xs text-gray-500 mt-0.5">24 active Cloudflare Workers — real-time edge metrics</div>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                    {["Worker Name", "Requests/day", "Error Rate", "Avg CPU", "P99 Latency", "Status"].map((h) => (
                      <th key={h} className="text-left text-xs text-gray-500 uppercase tracking-wider pb-2 pt-3 px-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CF_WORKER_METRICS.map((w) => (
                    <tr key={w.name} className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <code className="text-xs text-cyan-400 font-mono">{w.name}</code>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm text-white">{w.req}</td>
                      <td className={`py-3 px-4 font-mono text-sm ${errRateColor(w.errRate)}`}>{w.errRate}</td>
                      <td className={`py-3 px-4 font-mono text-sm ${cpuColor(w.cpu)}`}>{w.cpu}</td>
                      <td className="py-3 px-4 font-mono text-sm text-gray-300">{w.p99}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          <span className="text-xs text-green-400">{w.status}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* STORAGE TAB */}
      {activeTab === "Storage" && (
        <div className="space-y-8">
          {/* KV Namespaces */}
          <div>
            <div className="text-base font-semibold text-white mb-1">KV Namespaces</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">FHIR data hot cache</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CF_KV_NAMESPACES.map((ns) => (
                <div key={ns.id} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition-all hover:border-blue-500/30 hover:bg-blue-500/[0.05]">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className={`text-[10px] font-mono font-bold rounded px-2 py-0.5 inline-block border mb-1.5 ${kvColor(ns.color)}`}>
                        {ns.id}
                      </div>
                      <div className="text-sm font-medium text-white">{ns.title}</div>
                    </div>
                    <span className="text-xs text-gray-500 bg-white/[0.05] rounded px-2 py-0.5">{ns.size}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <div className="text-xs text-gray-500">Keys</div>
                      <div className="font-mono text-sm text-white">{ns.keys.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Reads</div>
                      <div className="font-mono text-sm text-white">{ns.reads}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Writes</div>
                      <div className="font-mono text-sm text-white">{ns.writes}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 pt-2 border-t border-white/[0.05]">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                    <span className="text-xs text-cyan-400">{ns.agent}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* R2 Buckets */}
          <div>
            <div className="text-base font-semibold text-white mb-1">R2 Object Storage</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Clinical document archive</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CF_R2_BUCKETS.map((bucket) => (
                <div key={bucket.name} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition-all hover:border-blue-500/30 hover:bg-blue-500/[0.05]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{bucket.icon}</span>
                    <div>
                      <div className="text-[10px] font-mono text-blue-400 mb-0.5">{bucket.name}</div>
                      <div className="text-sm font-medium text-white">{bucket.title}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <div className="text-xs text-gray-500">Objects</div>
                      <div className="font-mono text-sm text-white">{bucket.objects.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Size</div>
                      <div className="font-mono text-sm text-white">{bucket.size}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Transfer/mo</div>
                      <div className="font-mono text-sm text-white">{bucket.transfers}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 pt-2 border-t border-white/[0.05]">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span className="text-xs text-blue-400">{bucket.agent}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* D1 Databases */}
          <div>
            <div className="text-base font-semibold text-white mb-1">D1 Databases</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Structured FHIR data</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CF_D1_DATABASES.map((db) => (
                <div key={db.name} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition-all hover:border-blue-500/30 hover:bg-blue-500/[0.05]">
                  <div className="mb-2">
                    <div className="text-[10px] font-mono text-purple-400 mb-0.5">{db.name}</div>
                    <div className="text-sm font-medium text-white">{db.title}</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div>
                      <div className="text-xs text-gray-500">Tables</div>
                      <div className="font-mono text-sm text-white">{db.tables}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Rows</div>
                      <div className="font-mono text-sm text-white">{db.rows}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Size</div>
                      <div className="font-mono text-sm text-white">{db.size}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Queries/day</div>
                      <div className="font-mono text-sm text-white">{db.queries}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 pt-2 border-t border-white/[0.05]">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <span className="text-xs text-purple-400">{db.agent}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* COMPUTE TAB */}
      {activeTab === "Compute" && (
        <div className="space-y-8">
          {/* Durable Objects */}
          <div>
            <div className="text-base font-semibold text-white mb-1">Durable Objects</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Stateful FHIR workflows</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CF_DURABLE_OBJECTS.map((obj) => (
                <div key={obj.class} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition-all hover:border-blue-500/30 hover:bg-blue-500/[0.05]">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{obj.icon}</span>
                    <div>
                      <div className="text-sm font-semibold text-white font-mono">{obj.class}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{obj.namespace}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mb-3">{obj.description}</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500">Active Instances</div>
                      <div className="font-mono text-lg font-bold text-white">{obj.instances.toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                      <span className="text-xs text-orange-400">{obj.agent}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Queues */}
          <div>
            <div className="text-base font-semibold text-white mb-1">Queues</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Async FHIR event pipeline</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CF_QUEUES.map((q) => (
                <div key={q.name} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition-all hover:border-blue-500/30 hover:bg-blue-500/[0.05]">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{q.icon}</span>
                      <div>
                        <div className="text-sm font-semibold text-white font-mono">{q.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{q.description}</div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div>
                      <div className="text-xs text-gray-500">Queued</div>
                      <div className="font-mono text-sm text-white">{q.messages.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">DLQ</div>
                      <div className="flex items-center gap-1">
                        {q.dlq > 0 ? (
                          <span className="rounded px-1.5 py-0.5 text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">{q.dlq}</span>
                        ) : (
                          <span className="font-mono text-sm text-green-400">0</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Throughput</div>
                      <div className="font-mono text-sm text-white">{q.throughput}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 pt-2 border-t border-white/[0.05]">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                    <span className="text-xs text-cyan-400">{q.agent}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI TAB */}
      {activeTab === "AI" && (
        <div className="space-y-6">
          <div>
            <div className="text-base font-semibold text-white mb-1">Workers AI + AI Gateway</div>
            <div className="text-xs text-gray-500 mb-4">Inference at the edge — all models routed via BrainSAIT AI Gateway</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {CF_AI_MODELS.map((model) => (
                <div key={model.model} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 transition-all hover:border-blue-500/30 hover:bg-blue-500/[0.05]">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{model.icon}</span>
                    <div>
                      <div className="text-xs font-mono text-cyan-400 mb-0.5 break-all">{model.model}</div>
                      <div className="text-xs text-gray-400">{model.provider}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <div className="text-xs text-gray-500">Requests/day</div>
                      <div className="font-mono text-sm text-white">{model.requests}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Tokens/day</div>
                      <div className="font-mono text-sm text-white">{model.tokens}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Avg Latency</div>
                      <div className="font-mono text-sm text-white">{model.latency}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Est. Cost</div>
                      <div className="font-mono text-sm text-green-400">{model.cost}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-2 border-t border-white/[0.05]">
                    {model.agents.map((a) => (
                      <span key={a} className="rounded px-2 py-0.5 text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">{a}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Gateway Config */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
            <div className="text-base font-semibold text-white mb-3">AI Gateway Config</div>
            <div className="space-y-2">
              {[
                { label: "Endpoint", value: "https://gateway.ai.cloudflare.com/v1/brainsait/linc-gateway" },
                { label: "Rate Limit", value: "10K req/min" },
                { label: "Caching", value: "Enabled" },
                { label: "Logging", value: "→ R2: audit-logs" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 py-2 border-b border-white/[0.04] last:border-0">
                  <span className="text-xs text-gray-500 w-24 shrink-0">{item.label}</span>
                  <span className="font-mono text-xs text-cyan-300 break-all">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly AI Cost Summary */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
            <div className="text-base font-semibold text-white mb-3">Monthly AI Cost Summary</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    {["Model", "Daily Cost", "Monthly Est.", "Usage"].map((h) => (
                      <th key={h} className="text-left text-xs text-gray-500 uppercase tracking-wider pb-2 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CF_AI_MODELS.map((m) => {
                    const daily = parseFloat(m.cost.replace("$", "").replace("/day", ""));
                    const monthly = (daily * 30).toFixed(0);
                    return (
                      <tr key={m.model} className="border-b border-white/[0.05]">
                        <td className="py-3 pr-4 font-mono text-xs text-cyan-400">{m.model.split("/").pop()}</td>
                        <td className="py-3 pr-4 font-mono text-sm text-green-400">{m.cost}</td>
                        <td className="py-3 pr-4 font-mono text-sm text-white">${monthly}/mo</td>
                        <td className="py-3 text-xs text-gray-400">{m.requests} reqs</td>
                      </tr>
                    );
                  })}
                  <tr className="border-t border-white/[0.08] font-bold">
                    <td className="py-3 pr-4 text-xs text-gray-400 uppercase">Total</td>
                    <td className="py-3 pr-4 font-mono text-sm text-green-400">$110/day</td>
                    <td className="py-3 pr-4 font-mono text-sm text-white">$3,300/mo</td>
                    <td className="py-3 text-xs text-gray-400">619K inferences/day</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECURITY TAB */}
      {activeTab === "Security" && (
        <div className="space-y-6">
          {/* Zero Trust */}
          <div>
            <div className="text-base font-semibold text-white mb-1">Zero Trust Access Policies</div>
            <div className="text-xs text-gray-500 mb-4">Cloudflare Access protecting all BrainSAIT endpoints</div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                      {["Application", "Domain", "Policy", "Active Users", "Last Auth", "Status"].map((h) => (
                        <th key={h} className="text-left text-xs text-gray-500 uppercase tracking-wider pb-2 pt-3 px-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CF_ZERO_TRUST.map((app) => (
                      <tr key={app.app} className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-medium text-white text-sm">{app.app}</td>
                        <td className="py-3 px-4 font-mono text-xs text-cyan-400">{app.domain}</td>
                        <td className="py-3 px-4 text-xs text-gray-400">{app.policy}</td>
                        <td className="py-3 px-4 font-mono text-sm text-white">{app.users}</td>
                        <td className="py-3 px-4 text-xs text-gray-400">{app.lastAuth}</td>
                        <td className="py-3 px-4">
                          <span className="rounded px-2 py-0.5 text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                            🔒 {app.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* WAF Rules */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
            <div className="text-base font-semibold text-white mb-3">WAF Rules — FHIR API Protection</div>
            <div className="space-y-2">
              {[
                { id: "1001", rule: "Block non-FHIR Content-Type", action: "BLOCK", color: "red" },
                { id: "1002", rule: "Rate limit /api/fhir/* — 1000 req/min per IP", action: "RATE LIMIT", color: "orange" },
                { id: "1003", rule: "Block OWASP Top 10", action: "BLOCK", color: "red" },
                { id: "1004", rule: "Allow NPHIES IP range 213.241.0.0/16", action: "ALLOW", color: "green" },
                { id: "1005", rule: "Block non-Saudi IPs on /api/nphies/*", action: "BLOCK", color: "red" },
              ].map((rule) => (
                <div key={rule.id} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                  <span className="text-[10px] font-mono text-gray-500 w-10 shrink-0">#{rule.id}</span>
                  <span className="text-sm text-gray-300 flex-1">{rule.rule}</span>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold font-mono ${
                    rule.color === "green" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                    rule.color === "orange" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                    "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}>{rule.action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* DNS Zones */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
            <div className="text-base font-semibold text-white mb-3">DNS Zones</div>
            <div className="flex flex-wrap gap-2">
              {[
                "brainsait.org",
                "admin.brainsait.org",
                "linc.brainsait.org",
                "nphies-gw.brainsait.org",
                "iris.brainsait.org",
                "fhir.brainsait.org",
              ].map((domain) => (
                <span key={domain} className="rounded-lg px-3 py-1.5 text-xs font-mono bg-white/[0.04] border border-white/[0.08] text-gray-300 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                  {domain}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
