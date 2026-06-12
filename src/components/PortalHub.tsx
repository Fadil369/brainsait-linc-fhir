"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/brainsait";
import { 
  Globe, Shield, Building, Microscope, Stethoscope, 
  HeartPulse, ArrowUpRight, ExternalLink, Loader2,
  CheckCircle, AlertCircle, Clock 
} from "lucide-react";

interface Portal {
  id: string;
  label: string;
  sub: string;
  url: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  bgGlow: string;
  desc: string;
  live: boolean;
  users: string;
}

interface PortalCardProps {
  portal: Portal;
  onOpenUrl: (url: string) => void;
}

function PortalCard({ portal, onOpenUrl }: PortalCardProps) {
  const [hovered, setHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const Icon = portal.icon;

  const handleClick = async () => {
    setLoading(true);
    try {
      await onOpenUrl(portal.url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <a
      href={portal.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm transition-all duration-300 ${
        hovered 
          ? 'bg-white/[0.06] border-white/[0.12] scale-[1.02] translate-y-[-2px]' 
          : ''
      }`}
      style={{ 
        boxShadow: hovered ? `0 12px 40px ${portal.bgGlow}` : 'none',
      }}
    >
      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 opacity-0 transition-opacity duration-500"
        style={{ 
          background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${portal.bgGlow}, transparent 40%)`,
          opacity: hovered ? 1 : 0
        }}
      />
      
      <div className="relative p-5">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div 
            className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${portal.gradient} shadow-lg transition-transform duration-300 ${
              hovered ? 'scale-110' : ''
            }`}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <Icon className="h-5 w-5 text-white" />
            )}
          </div>
          
          {/* Live badge */}
          <div className="flex items-center gap-1.5">
            <span 
              className={`h-2 w-2 rounded-full ${
                portal.live 
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]' 
                  : 'bg-gray-500'
              }`}
            >
              {portal.live && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
            </span>
            <span className="text-[10px] font-medium text-emerald-400">
              {portal.live ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Labels */}
        <h3 className="mb-1 text-sm font-semibold text-white">{portal.label}</h3>
        <p className="mb-3 text-xs text-gray-500">{portal.sub}</p>
        <p className="mb-4 text-xs text-gray-400 leading-relaxed">{portal.desc}</p>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
          <span className="text-[10px] font-mono text-gray-600 truncate max-w-[180px]">
            {portal.url.replace(/^https?:\/\//, '')}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-gray-500 group-hover:text-cyan-400 transition-colors">
            Open <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </a>
  );
}

/* ── HOSPITAL LINK CARD ── */
interface HospitalLinkProps {
  name: string;
  status: string;
  portal: string;
  creds: string;
}

function HospitalLink({ name, status, portal, creds }: HospitalLinkProps) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <a
      href={`https://${portal}`}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group rounded-lg border border-white/[0.04] bg-white/[0.02] p-3 text-center transition-all ${
        hovered ? 'bg-white/[0.05] border-white/[0.1]' : ''
      }`}
    >
      <div className="mb-1.5 flex justify-center">
        <span 
          className={`h-2 w-2 rounded-full ${
            status === "online" 
              ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]' 
              : 'bg-gray-500'
          }`}
        >
          {status === "online" && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
        </span>
      </div>
      <div className={`text-xs font-semibold transition-colors ${
        hovered ? 'text-red-400' : 'text-white'
      }`}>
        {name}
      </div>
      <div className="text-[9px] font-mono text-gray-600 mt-0.5 truncate">
        {portal}
      </div>
      <div className="text-[9px] text-gray-600 mt-1">{creds}</div>
    </a>
  );
}

/* ── STATS COUNTER ── */
interface AnimatedCounterProps {
  value: number | string;
  label: string;
  suffix?: string;
  color?: string;
}

function AnimatedCounter({ value, label, suffix = "", color = "text-cyan-400" }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  
  // Simple counter animation on mount
  useState(() => {
    const numValue = typeof value === 'string' ? parseInt(value) || 0 : value;
    if (numValue > 0) setCount(numValue);
  });

  return (
    <div className="text-center">
      <div className={`text-xl font-bold tracking-tight ${color}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </div>
      <div className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">{label}</div>
    </div>
  );
}

/* ── PORTAL HUB MAIN COMPONENT ── */
const BASE = typeof window !== 'undefined' ? window.location.origin : '';

const PORTALS: Portal[] = [
  { 
    id: "bsma", 
    label: "Basma", 
    sub: "Patient Voice AI", 
    url: "https://bsma.elfadil.com", 
    icon: HeartPulse, 
    color: "#0ea5e9", 
    gradient: "from-cyan-500 to-blue-600", 
    bgGlow: "rgba(14,165,233,0.15)", 
    desc: "AI voice assistant in Saudi dialect. Book, check, access — all through conversation.",
    live: true, 
    users: "2.4K" 
  },
  { 
    id: "givc", 
    label: "GIVC", 
    sub: "Clinician Portal", 
    url: "https://givc.elfadil.com", 
    icon: Stethoscope, 
    color: "#2b6cb8", 
    gradient: "from-blue-600 to-purple-600", 
    bgGlow: "rgba(43,108,184,0.15)", 
    desc: "Patient lists, EHR, ICD-10, shift management, CDS alerts.",
    live: true, 
    users: "1.8K" 
  },
  { 
    id: "sbs", 
    label: "SBS", 
    sub: "Insurance Billing", 
    url: "https://sbs.elfadil.com", 
    icon: Shield, 
    color: "#ea580c", 
    gradient: "from-orange-500 to-red-600", 
    bgGlow: "rgba(234,88,12,0.15)", 
    desc: "Claim processing, prior auth, ETIMAD procurement, Takaful appeals.",
    live: true, 
    users: "856" 
  },
  { 
    id: "ecare", 
    label: "eCarePlus", 
    sub: "Hospital Hub", 
    url: "https://portal.elfadil.com", 
    icon: Building, 
    color: "#22c55e", 
    gradient: "from-emerald-500 to-teal-600", 
    bgGlow: "rgba(34,197,94,0.15)", 
    desc: "Unified desktop connecting patient, clinician, insurance, compliance.",
    live: true, 
    users: "3.1K" 
  },
  { 
    id: "nphies", 
    label: "NPHIES", 
    sub: "Saudi Claims Network", 
    url: "https://nphies.brainsait.org", 
    icon: Globe, 
    color: "#a855f7", 
    gradient: "from-purple-600 to-pink-600", 
    bgGlow: "rgba(168,85,247,0.15)", 
    desc: "98.6% approval rate. Real-time eligibility, PA, claim submission.",
    live: true, 
    users: "National" 
  },
  { 
    id: "oracle", 
    label: "Oracle EHR", 
    sub: "6 Hospital Records", 
    url: "/api/oracle/bridge", 
    icon: Microscope, 
    color: "#ef4444", 
    gradient: "from-red-500 to-rose-600", 
    bgGlow: "rgba(239,68,68,0.15)", 
    desc: "22 credentials. Riyadh, Madinah, Jizan, Khamis, Unaizah, Abha.",
    live: true, 
    users: "6 sites" 
  },
];

const HOSPITALS = [
  { id: "riyadh", name: "Riyadh", status: "online", portal: "oracle-riyadh.brainsait.org", creds: "U29200" },
  { id: "madinah", name: "Madinah", status: "online", portal: "oracle-madinah.brainsait.org", creds: "on bridge" },
  { id: "jizan", name: "Jizan", status: "online", portal: "oracle-jizan.brainsait.org", creds: "on bridge" },
  { id: "khamis", name: "Khamis", status: "online", portal: "oracle-khamis.brainsait.org", creds: "on bridge" },
  { id: "unaizah", name: "Unaizah", status: "online", portal: "oracle-unaizah.brainsait.org", creds: "on bridge" },
  { id: "abha", name: "Abha", status: "online", portal: "oracle-abha.brainsait.org", creds: "on bridge" },
];

export default function PortalHub() {
  const [ecosystem, setEcosystem] = useState<any>(null);
  const [nphies, setNphies] = useState<any>(null);
  const [fhir, setFhir] = useState<any>(null);
  const [oracle, setOracle] = useState<any>(null);

  // Fetch data on mount
  useState(() => {
    Promise.allSettled([
      fetch(`${BASE}/api/ecosystem`).then(r => r.json()).then(setEcosystem).catch(() => {}),
      fetch(`${BASE}/api/nphies/network`).then(r => r.json()).then(setNphies).catch(() => {}),
      fetch(`${BASE}/fhir/Patient/P-5842`).then(r => r.json()).then(setFhir).catch(() => {}),
      fetch(`${BASE}/api/oracle/bridge`).then(r => r.json()).then(setOracle).catch(() => {}),
    ]);
  });

  const handleOpenUrl = async (url: string) => {
    console.log('Opening URL:', url);
  };

  const nphiesApproval = nphies?.data?.financials?.network_approval_rate_pct || 98.6;
  const totalBackends = ecosystem?.total || 29;
  const patientName = fhir?.name?.[0]?.family || "Al-Harbi";
  const oracleCreds = oracle?.totalCredentials || 22;

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <GlassCard className="relative overflow-hidden border-cyan-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.08),transparent_50%)]" />
        
        <div className="relative p-8">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-[10px] font-medium text-cyan-400/80 uppercase tracking-[0.2em]">
              Integrated Health Network
            </span>
          </div>
          
          <h1 className="mb-3 text-2xl font-bold tracking-tight text-white">
            BrainSAIT <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Healthcare Platform
            </span>
          </h1>
          <p className="max-w-xl text-sm text-gray-500 leading-relaxed">
            Six live portals. One unified patient record. Real-time across every system.
          </p>
        </div>
      </GlassCard>

      {/* Live Stats Bar */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <GlassCard className="p-4">
          <div className="mb-2 flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-wider">
            <Globe className="h-3.5 w-3.5 text-cyan-400" />
            Network
          </div>
          <AnimatedCounter value={totalBackends} label="Backend Systems" color="text-cyan-400" />
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="mb-2 flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-wider">
            <HeartPulse className="h-3.5 w-3.5 text-emerald-400" />
            NPHIES
          </div>
          <AnimatedCounter value={nphiesApproval} label="Approval Rate" suffix="%" color="text-emerald-400" />
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="mb-2 flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-wider">
            <Microscope className="h-3.5 w-3.5 text-purple-400" />
            Oracle
          </div>
          <AnimatedCounter value={oracleCreds} label="Hospital Credentials" color="text-purple-400" />
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="mb-2 flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-wider">
            <Stethoscope className="h-3.5 w-3.5 text-blue-400" />
            Patient
          </div>
          <div className="text-center">
            <div className="text-lg font-bold tracking-tight text-blue-400">{patientName}</div>
            <div className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">P-5842 on FHIR</div>
          </div>
        </GlassCard>
      </div>

      {/* Portal Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PORTALS.map((portal) => (
          <PortalCard key={portal.id} portal={portal} onOpenUrl={handleOpenUrl} />
        ))}
      </div>

      {/* Oracle Hospital Network */}
      <GlassCard className="overflow-hidden border-red-500/20">
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Microscope className="h-4 w-4 text-red-400" />
                Oracle Hospital Network
              </h3>
              <p className="mt-0.5 text-xs text-gray-500">6 hospitals · 22 credentials · Live bridge</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1">
              <span className="animate-ping absolute h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-medium text-emerald-400">All Online</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
            {HOSPITALS.map((hospital) => (
              <HospitalLink key={hospital.id} {...hospital} />
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Quick Actions Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <a href="/api/health" className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
            <Globe className="h-3 w-3" /> Health
          </a>
          <a href="/api/ecosystem" className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
            <Globe className="h-3 w-3" /> Ecosystem
          </a>
          <a href="https://status.elfadil.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
            <ExternalLink className="h-3 w-3" /> Status
          </a>
          <a href="https://github.com/Fadil369/brainsait-linc-fhir" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
            <ExternalLink className="h-3 w-3" /> GitHub
          </a>
        </div>
        <span className="text-[10px] text-gray-700">BrainSAIT · OID 1.3.6.1.4.1.61026</span>
      </div>
    </div>
  );
}