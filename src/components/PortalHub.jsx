"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const BASE = window.location.origin;

const DOMAINS = [
  {
    zone: "elfadil.com",
    label: "Patient & Provider Zone",
    labelAr: "منطقة المريض والطبيب",
    color: "from-cyan-500 to-blue-600",
    services: [
      { id: "bsma", label: "Basma", labelAr: "بسمة", url: "https://bsma.elfadil.com", icon: "🗣️", role: "Patient Voice AI", roleAr: "الذكاء الصوتي للمريض", desc: "AI voice assistant in Saudi dialect. Book appointments, check insurance, access records.", descAr: "سكرتيرة صوتية بالذكاء الاصطناعي باللهجة السعودية.", status: "Live", healthy: true },
      { id: "givc", label: "GIVC", labelAr: "GIVC", url: "https://givc.elfadil.com", icon: "👨‍⚕️", role: "Clinician Portal", roleAr: "بوابة الطبيب", desc: "Patient lists, EHR viewing, ICD-10 extraction, shift management, CDS alerts.", descAr: "قائمة المرضى، السجلات الإلكترونية، استخراج ICD-10.", status: "Live", healthy: true },
      { id: "ecare", label: "eCarePlus", labelAr: "إي كير بلاس", url: "https://portal.elfadil.com", icon: "🏥", role: "Hospital Hub", roleAr: "مركز المستشفى", desc: "Unified hospital portal connecting patient, clinician, insurance, and compliance.", descAr: "بوابة المستشفى الموحدة.", status: "Live", healthy: true },
      { id: "sbs", label: "SBS", labelAr: "SBS", url: "https://sbs.elfadil.com", icon: "📋", role: "Insurance Billing", roleAr: "فوترة التأمين", desc: "Claim processing, rejection analysis, prior authorization, ETIMAD, Takaful appeals.", descAr: "معالجة المطالبات، تحليل الرفض، الموافقة المسبقة.", status: "Live", healthy: true },
      { id: "status", label: "Status", labelAr: "الحالة", url: "https://status.elfadil.com", icon: "📊", role: "Ecosystem Monitor", roleAr: "مراقبة النظام", desc: "Real-time status of all ecosystem services.", descAr: "حالة جميع خدمات النظام.", status: "Live", healthy: true },
    ],
  },
  {
    zone: "brainsait.org",
    label: "FHIR & Governance Zone",
    labelAr: "منطقة FHIR والحوكمة",
    color: "from-purple-600 to-indigo-600",
    services: [
      { id: "iris-fhir", label: "IRIS FHIR", labelAr: "آيريس FHIR", url: "https://iris-fhir.brainsait.org", icon: "🧠", role: "Unified FHIR API", roleAr: "واجهة FHIR", desc: "12 AI agents, 29 ecosystem backends, NPHIES + Oracle live data.", descAr: "١٢ وكيل ذكاء اصطناعي، ٢٩ نظام خلفي.", status: "Live · 162ms avg", healthy: true },
      { id: "nphies", label: "NPHIES", labelAr: "نفيس", url: "https://nphies.brainsait.org", icon: "🇸🇦", role: "Claims Network", roleAr: "شبكة المطالبات", desc: "Saudi national health insurance — 98.6% approval, SAR 835.7M network.", descAr: "شبكة التأمين الصحي السعودية.", status: "98.6% Approval", healthy: true },
      { id: "api", label: "NPHIES API", labelAr: "API نفيس", url: "https://api.brainsait.org/nphies/network/summary", icon: "🔗", role: "Claims Gateway", roleAr: "بوابة المطالبات", desc: "Real-time eligibility, prior authorization, claim submission via NPHIES gateway.", descAr: "التحقق من الأهلية، الموافقة المسبقة.", status: "Live Data", healthy: true },
      { id: "portals", label: "Portals", labelAr: "البوابات", url: "https://portals.brainsait.org", icon: "🚪", role: "Portal Dashboard", roleAr: "لوحة البوابات", desc: "Central dashboard for all BrainSAIT portal services.", descAr: "لوحة مركزية لجميع خدمات البوابات.", status: "Live", healthy: true },
      { id: "academy", label: "Academy", labelAr: "الأكاديمية", url: "https://academy.brainsait.org", icon: "📚", role: "Learning Platform", roleAr: "منصة التعلم", desc: "BrainSAIT Academy — courses and certification.", descAr: "أكاديمية برينسيت — دورات وشهادات.", status: "SSO", healthy: true },
    ],
  },
];

export default function PortalHub() {
  const [ecosystem, setEcosystem] = useState(null);
  const [nphies, setNphies] = useState(null);
  const [lang, setLang] = useState("en");

  useEffect(() => {
    Promise.allSettled([
      fetch(`${BASE}/api/ecosystem`).then(r => r.json()).then(setEcosystem),
      fetch(`${BASE}/api/nphies/network`).then(r => r.json()).then(setNphies),
    ]);
  }, []);

  const nphiesApproval = nphies?.data?.financials?.network_approval_rate_pct;
  const totalBackends = ecosystem?.total || 29;

  return (
    <div>
      {/* Ecosystem Stats */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Live Portals", value: "6", sub: "Patient · Provider · Gov · Insurance", color: "text-cyan-400" },
          { label: "Backend Workers", value: `${totalBackends}`, sub: "29 API endpoints", color: "text-blue-400" },
          { label: "Total Workers", value: "101+", sub: "Across all product lines", color: "text-purple-400" },
          { label: "NPHIES Approval", value: nphiesApproval ? `${nphiesApproval}%` : "98.6%", sub: "Saudi national network", color: "text-green-400" },
        ].map(s => (
          <Card key={s.label} className="border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
            <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="mt-0.5 text-xs text-gray-300">{s.label}</div>
            <div className="text-[10px] text-gray-600">{s.sub}</div>
          </Card>
        ))}
      </div>

      {/* Domain Zones */}
      {DOMAINS.map(zone => (
        <div key={zone.zone} className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full bg-gradient-to-br ${zone.color}`} />
            <h3 className="text-sm font-semibold text-gray-300">
              {zone.zone}
            </h3>
            <span className="text-[11px] text-gray-600">
              {lang === "ar" ? zone.labelAr : zone.label}
            </span>
            <Badge variant="outline" className="ml-auto border-white/10 bg-white/[0.03] text-[10px] text-gray-500">
              {zone.services.length} services
            </Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {zone.services.map(s => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <Card className="h-full border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-200 hover:bg-white/[0.08] hover:border-white/20">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${zone.color} text-base shadow-lg shrink-0`}>
                        {s.icon}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{lang === "ar" ? s.labelAr : s.label}</div>
                        <div className="text-[10px] text-gray-500">{lang === "ar" ? s.roleAr : s.role}</div>
                      </div>
                    </div>
                    {s.healthy ? (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-green-500 mt-1" />
                    ) : (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-yellow-500 mt-1" />
                    )}
                  </div>
                  <p className="text-[11px] leading-relaxed text-gray-400">
                    {lang === "ar" ? s.descAr : s.desc}
                  </p>
                  <div className="mt-2 text-[10px] text-gray-600 font-mono truncate">{s.url}</div>
                </Card>
              </a>
            ))}
          </div>
        </div>
      ))}

      {/* Patient Context API — feeds all portals */}
      <Card className="mt-6 border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <h3 className="mb-3 text-sm font-semibold text-cyan-400">
          🔗 {lang === "ar" ? "تغذية جميع البوابات ببيانات المريض الموحدة" : "Unified Patient Data Feeds All Portals"}
        </h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { endpoint: "/api/patient", desc: "Complete unified patient record", ar: "سجل المريض الموحد الكامل" },
            { endpoint: "/api/patient/timeline", desc: "Chronological event history", ar: "التسلسل الزمني للأحداث" },
            { endpoint: "/api/patient/summary", desc: "5-year clinical summary (bilingual)", ar: "ملخص سريري لـ ٥ سنوات" },
            { endpoint: "/api/patient/medications", desc: "Full medication profile + counseling", ar: "ملف الأدوية الكامل" },
            { endpoint: "/api/patient/labs", desc: "Lab results with Arabic explanations", ar: "النتائج المخبرية مع شرح عربي" },
            { endpoint: "/api/patient/plan", desc: "Today's care plan + appointments", ar: "خطة اليوم + المواعيد" },
          ].map(ep => (
            <a key={ep.endpoint} href={`${BASE}${ep.endpoint}?patient=P-5842`} target="_blank" rel="noopener noreferrer"
              className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5 hover:bg-white/[0.06] transition-colors"
            >
              <code className="text-[10px] text-cyan-400">{ep.endpoint}</code>
              <p className="mt-0.5 text-[11px] text-gray-500">{lang === "ar" ? ep.ar : ep.desc}</p>
            </a>
          ))}
        </div>
      </Card>

      {/* Quick Links */}
      <Card className="mt-4 border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <a href="https://status.elfadil.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">📊 Status</a>
            <a href="https://sso.elfadil.com/api/session" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">🔐 SSO</a>
            <a href="https://academy.brainsait.org" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">📚 Academy</a>
            <a href="https://github.com/Fadil369/brainsait-linc-fhir" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">💻 GitHub</a>
          </div>
          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-gray-400 hover:bg-white/10 transition-colors"
          >
            {lang === "en" ? "🇸🇦 العربية" : "🇬🇧 English"}
          </button>
        </div>
      </Card>
    </div>
  );
}
