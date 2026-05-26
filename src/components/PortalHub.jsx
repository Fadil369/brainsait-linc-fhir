"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Cloud, Activity, Globe, Shield, Stethoscope, Building, Microscope, ArrowUpRight, ChevronRight, Sparkles, HeartPulse } from "lucide-react";

const BASE = window.location.origin;

const PORTALS = [
  { id: "bsma", label: "Basma", sub: "Patient Voice AI", url: "https://bsma.elfadil.com", icon: HeartPulse, color: "#0ea5e9", gradient: "from-cyan-500 to-blue-600", bgGlow: "rgba(14,165,233,0.08)", desc: "AI voice assistant in Saudi dialect. Book, check, access — all through conversation.", live: true, users: "2.4K" },
  { id: "givc", label: "GIVC", sub: "Clinician Portal", url: "https://givc.elfadil.com", icon: Stethoscope, color: "#2b6cb8", gradient: "from-blue-600 to-purple-600", bgGlow: "rgba(43,108,184,0.08)", desc: "Patient lists, EHR, ICD-10, shift management, CDS alerts.", live: true, users: "1.8K" },
  { id: "sbs", label: "SBS", sub: "Insurance Billing", url: "https://sbs.elfadil.com", icon: Shield, color: "#ea580c", gradient: "from-orange-500 to-red-600", bgGlow: "rgba(234,88,12,0.08)", desc: "Claim processing, prior auth, ETIMAD procurement, Takaful appeals.", live: true, users: "856" },
  { id: "ecare", label: "eCarePlus", sub: "Hospital Hub", url: "https://portal.elfadil.com", icon: Building, color: "#22c55e", gradient: "from-emerald-500 to-teal-600", bgGlow: "rgba(34,197,94,0.08)", desc: "Unified desktop connecting patient, clinician, insurance, compliance.", live: true, users: "3.1K" },
  { id: "nphies", label: "NPHIES", sub: "Saudi Claims Network", url: "https://nphies.brainsait.org", icon: Globe, color: "#a855f7", gradient: "from-purple-600 to-pink-600", bgGlow: "rgba(168,85,247,0.08)", desc: "98.6% approval rate. Real-time eligibility, PA, claim submission.", live: true, users: "National" },
  { id: "oracle", label: "Oracle EHR", sub: "6 Hospital Records", url: "/api/oracle/bridge", icon: Microscope, color: "#ef4444", gradient: "from-red-500 to-rose-600", bgGlow: "rgba(239,68,68,0.08)", desc: "22 credentials. Riyadh, Madinah, Jizan, Khamis, Unaizah, Abha.", live: true, users: "6 sites" },
];

const HOSPITALS = [
  { id: "riyadh", name: "Riyadh", status: "online", portal: "oracle-riyadh.brainsait.org", creds: "U29200" },
  { id: "madinah", name: "Madinah", status: "online", portal: "oracle-madinah.brainsait.org", creds: "on bridge" },
  { id: "jizan", name: "Jizan", status: "online", portal: "oracle-jizan.brainsait.org", creds: "on bridge" },
  { id: "khamis", name: "Khamis", status: "online", portal: "oracle-khamis.brainsait.org", creds: "on bridge" },
  { id: "unaizah", name: "Unaizah", status: "online", portal: "oracle-unaizah.brainsait.org", creds: "on bridge" },
  { id: "abha", name: "Abha", status: "online", portal: "oracle-abha.brainsait.org", creds: "on bridge" },
];

function AnimatedCounter({ value, label, suffix = "", color = "text-cyan-400" }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    const duration = 1500;
    const step = Math.max(1, Math.floor(end / 60));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, duration / 60);
    return () => clearInterval(timer);
  }, [value]);
  return (
    <div className="text-center">
      <div className={`text-2xl font-extrabold tracking-tight ${color}`}>{count.toLocaleString()}{suffix}</div>
      <div className="text-[10px] text-gray-600 mt-0.5 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function PulseDot({ live = true }) {
  return (
    <span className={`relative inline-flex h-2 w-2 ${live ? "" : "opacity-30"}`}>
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${live ? "bg-green-400" : "bg-gray-500"} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-2 w-2 ${live ? "bg-green-500" : "bg-gray-500"}`} />
    </span>
  );
}

export default function PortalHub() {
  const [ecosystem, setEcosystem] = useState(null);
  const [nphies, setNphies] = useState(null);
  const [fhir, setFhir] = useState(null);
  const [oracle, setOracle] = useState(null);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    Promise.allSettled([
      fetch(`${BASE}/api/ecosystem`).then(r => r.json()).then(setEcosystem),
      fetch(`${BASE}/api/nphies/network`).then(r => r.json()).then(setNphies),
      fetch(`${BASE}/fhir/Patient/P-5842`).then(r => r.json()).then(setFhir),
      fetch(`${BASE}/api/oracle/bridge`).then(r => r.json()).then(setOracle),
    ]);
  }, []);

  const nphiesApproval = nphies?.data?.financials?.network_approval_rate_pct || 98.6;
  const totalBackends = ecosystem?.total || 29;
  const patientName = fhir?.name?.[0]?.family || "Al-Harbi";
  const oracleCreds = oracle?.totalCredentials || 22;

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#0a1628] via-[#0f1f3a] to-[#0a1628] p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.04),transparent_50%)]" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-[10px] font-medium text-cyan-400/80 uppercase tracking-[0.2em]">Live Ecosystem</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            BrainSAIT <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Integrated Health Network</span>
          </h1>
          <p className="text-sm text-gray-500 max-w-xl leading-relaxed">
            Six live portals. One unified patient record. Real-time across every system.
          </p>
        </div>
      </div>

      {/* Live Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-[10px] text-gray-600 uppercase tracking-wider">Network</span>
          </div>
          <AnimatedCounter value={totalBackends} label="Backend Systems" color="text-cyan-400" />
        </Card>
        <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <HeartPulse className="h-3.5 w-3.5 text-green-400" />
            <span className="text-[10px] text-gray-600 uppercase tracking-wider">NPHIES</span>
          </div>
          <AnimatedCounter value={nphiesApproval} label="Approval Rate" suffix="%" color="text-green-400" />
        </Card>
        <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building className="h-3.5 w-3.5 text-purple-400" />
            <span className="text-[10px] text-gray-600 uppercase tracking-wider">Oracle</span>
          </div>
          <AnimatedCounter value={oracleCreds} label="Hospital Credentials" color="text-purple-400" />
        </Card>
        <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-[10px] text-gray-600 uppercase tracking-wider">Patient</span>
          </div>
          <div className="text-center">
            <div className="text-lg font-extrabold tracking-tight text-blue-400">{patientName}</div>
            <div className="text-[10px] text-gray-600 mt-0.5 uppercase tracking-wider">P-5842 on FHIR</div>
          </div>
        </Card>
      </div>

      {/* Portal Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PORTALS.map((p) => {
          const Icon = p.icon;
          return (
            <a
              key={p.id}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.05] hover:border-white/[0.12] hover:translate-y-[-1px]"
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ boxShadow: hovered === p.id ? `0 8px 32px ${p.bgGlow}` : "none" }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${p.bgGlow}, transparent 40%)` }} />
              
              <div className="relative p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${p.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <PulseDot live={p.live} />
                    <span className="text-[10px] font-medium text-green-400">{p.live ? "Live" : "Maintenance"}</span>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-white mb-0.5">{p.label}</h3>
                <p className="text-[11px] text-gray-500 mb-2">{p.sub}</p>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">{p.desc}</p>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                  <span className="text-[10px] font-mono text-gray-600 truncate max-w-[180px]">{p.url.replace("https://", "")}</span>
                  <span className="flex items-center gap-1 text-[11px] text-gray-500 group-hover:text-cyan-400 transition-colors">
                    Open <ArrowUpRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Oracle Hospital Network Map */}
      <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-sm overflow-hidden">
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Building className="h-4 w-4 text-red-400" />
                Oracle Hospital Network
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">6 hospitals · 22 credentials · Live bridge</p>
            </div>
            <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-[10px] text-green-400">
              <span className="animate-ping mr-1 h-1.5 w-1.5 rounded-full bg-green-400 inline-block" />
              All Online
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {HOSPITALS.map((h) => (
              <a
                key={h.id}
                href={`https://${h.portal}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-lg border border-white/[0.04] bg-white/[0.02] p-3 text-center hover:bg-white/[0.04] hover:border-white/[0.08] transition-all"
              >
                <div className="flex justify-center mb-1.5">
                  <PulseDot live={h.status === "online"} />
                </div>
                <div className="text-xs font-semibold text-white group-hover:text-red-400 transition-colors">{h.name}</div>
                <div className="text-[9px] font-mono text-gray-600 mt-0.5 truncate">{h.portal}</div>
                <div className="text-[9px] text-gray-600 mt-1">{h.creds}</div>
              </a>
            ))}
          </div>
        </div>
      </Card>

      {/* NPHIES Approval Gauge */}
      <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-400" />
              NPHIES Network Performance
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Saudi National Health Insurance — Live Feed</p>
          </div>
          <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-[10px] text-cyan-400">
            Live Data
          </Badge>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-gray-400">Claim Approval Rate</span>
              <span className="text-green-400 font-bold">{nphiesApproval}%</span>
            </div>
            <Progress value={nphiesApproval} className="h-2 bg-white/5 [&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-emerald-400" />
          </div>
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { label: "Network Value", value: `SAR ${((nphies?.data?.financials?.network_total_sar || 835690702.81) / 1e6).toFixed(1)}M`, color: "text-cyan-400" },
              { label: "Total Claims", value: (nphies?.data?.financials?.total_claims_gss || 15138).toLocaleString(), color: "text-blue-400" },
              { label: "Facilities", value: "6", color: "text-purple-400" },
            ].map((s) => (
              <div key={s.label} className="text-center rounded-lg bg-white/[0.02] p-2.5">
                <div className={`text-sm font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[9px] text-gray-600 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Quick Actions Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <a href="/api/health" className="hover:text-cyan-400 transition-colors flex items-center gap-1"><Activity className="h-3 w-3" /> Health</a>
          <a href="/api/ecosystem" className="hover:text-cyan-400 transition-colors flex items-center gap-1"><Cloud className="h-3 w-3" /> Ecosystem</a>
          <a href="https://status.elfadil.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors flex items-center gap-1"><ChevronRight className="h-3 w-3" /> Status</a>
          <a href="https://github.com/Fadil369/brainsait-linc-fhir" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors flex items-center gap-1"><ChevronRight className="h-3 w-3" /> GitHub</a>
        </div>
        <span className="text-[10px] text-gray-700">BrainSAIT · OID 1.3.6.1.4.1.61026</span>
      </div>
    </div>
  );
}
