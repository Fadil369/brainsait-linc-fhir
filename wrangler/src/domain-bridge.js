/**
 * Cross-Domain Bridge: brainsait.org ↔ elfadil.com
 * Unified routing that treats both zones as one ecosystem
 */
const CROSS_DOMAIN = {
  "brainsait.org": {
    zone: "117f23e28c474f87e9984bc4b6753a1b",
    description: "FHIR, NPHIES, Compliance, Governance",
    services: {
      "iris-fhir": {
        url: "https://iris-fhir.brainsait.org",
        label: "Unified FHIR API",
        labelAr: "واجهة FHIR الموحدة",
        status: 200,
      },
      "api": {
        url: "https://api.brainsait.org",
        label: "NPHIES Claims Gateway",
        labelAr: "بوابة مطالبات نفيس",
        status: 301,
      },
      "academy": {
        url: "https://academy.brainsait.org",
        label: "BrainSAIT Academy",
        labelAr: "أكاديمية برينسيت",
        status: 302,
      },
      "portals": {
        url: "https://portals.brainsait.org",
        label: "Portals Dashboard",
        labelAr: "لوحة البوابات",
        status: 200,
      },
      "nphies": {
        url: "https://nphies.brainsait.org",
        label: "NPHIES Platform",
        labelAr: "منصة نفيس",
        status: 200,
      },
      "mellissa": {
        url: "https://mellissa.brainsait.org",
        label: "Mellissa Hotel",
        labelAr: "ميليسا",
        status: 200,
      },
    },
  },
  "elfadil.com": {
    zone: "2df8e1ec714a9612535cdb04ef84c9d1",
    description: "Patient, Provider, Insurance, Voice",
    services: {
      "portal": {
        url: "https://portal.elfadil.com",
        label: "eCarePlus Portal",
        labelAr: "بوابة إي كير بلاس",
        status: 200,
      },
      "api": {
        url: "https://api.elfadil.com",
        label: "Unified API Gateway",
        labelAr: "بوابة API الموحدة",
        status: 200,
      },
      "sso": {
        url: "https://sso.elfadil.com",
        label: "SSO Session Manager",
        labelAr: "مدير جلسات SSO",
        status: 200,
      },
      "bsma": {
        url: "https://bsma.elfadil.com",
        label: "Basma Patient Voice",
        labelAr: "بسمة — واجهة المريض",
        status: 200,
      },
      "givc": {
        url: "https://givc.elfadil.com",
        label: "GIVC Clinician Portal",
        labelAr: "GIVC — بوابة الطبيب",
        status: 200,
      },
      "sbs": {
        url: "https://sbs.elfadil.com",
        label: "SBS Insurance Billing",
        labelAr: "SBS — نظام الفوترة",
        status: 200,
      },
      "status": {
        url: "https://status.elfadil.com",
        label: "Ecosystem Status",
        labelAr: "حالة النظام",
        status: 200,
      },
      "voice": {
        url: "https://voice.elfadil.com",
        label: "Voice Agent (Twilio)",
        labelAr: "الوكيل الصوتي",
        status: 200,
      },
      "pulseforge": {
        url: "https://pulseforge.elfadil.com",
        label: "PulseForge Novel",
        labelAr: "بولس فورج",
        status: 200,
      },
    },
  },
};

export function getUnifiedServices() {
  const all = [];
  for (const [zone, config] of Object.entries(CROSS_DOMAIN)) {
    for (const [key, svc] of Object.entries(config.services)) {
      all.push({
        zone,
        key,
        subdomain: key,
        domain: zone,
        url: svc.url,
        label: svc.label,
        labelAr: svc.labelAr,
        status: svc.status,
        healthy: svc.status === 200,
      });
    }
  }
  return all;
}

export function getDomainSummary() {
  const brainsait = Object.values(CROSS_DOMAIN["brainsait.org"].services);
  const elfadil = Object.values(CROSS_DOMAIN["elfadil.com"].services);
  return {
    totalDomains: 2,
    totalServices: brainsait.length + elfadil.length,
    brainsaitOrg: {
      zone: CROSS_DOMAIN["brainsait.org"].zone,
      label: CROSS_DOMAIN["brainsait.org"].description,
      services: brainsait.length,
      healthy: brainsait.filter(s => s.status === 200).length,
    },
    elfadilCom: {
      zone: CROSS_DOMAIN["elfadil.com"].zone,
      label: CROSS_DOMAIN["elfadil.com"].description,
      services: elfadil.length,
      healthy: elfadil.filter(s => s.status === 200).length,
    },
  };
}
