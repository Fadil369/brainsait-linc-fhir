/**
 * BrainSAIT Unified Health Gateway — Full Ecosystem Proxy
 * Routes to all 101 workers across 6 product lines + 7 portal subdomains
 * iris-fhir.brainsait.org/ecosystem/* → unified access to everything
 */

const ECOSYSTEM_BACKENDS = {
  // ── Hospitals ──
  "hnh": {
    base: "https://hnh-unified.brainsait-fadil.workers.dev",
    label: "HNH (Al Ribat / Gharnata Hospitals)",
    sub: ["hnh-unified", "hnh-gharnata-api", "hnh-portal", "hnh-portal-v2-modular", "hnh-browser-audit"],
    db: "hnh-gharnata (d6960732)",
    routes: ["/api/health", "/api/patients", "/api/encounters", "/fhir/Patient", "/fhir/Encounter"],
  },
  "hnh-gharnata": {
    base: "https://hnh-gharnata-api.brainsait-fadil.workers.dev",
    label: "HNH Gharnata API",
    sub: ["hnh-gharnata-api"],
    routes: ["/api/health", "/fhir", "/patients"],
  },
  "hnh-portal": {
    base: "https://hnh-portal.brainsait-fadil.workers.dev",
    label: "HNH Portal",
    sub: ["hnh-portal", "hnh-portal-v2-modular"],
    routes: ["/api/health", "/portal"],
  },

  // ── NPHIES / Saudi National Claims ──
  "nphies": {
    base: "https://nphies-mirror.brainsait-fadil.workers.dev",
    label: "NPHIES (Saudi National Claims Network)",
    sub: ["nphies-mirror", "nphies-service", "claimlinc-api", "healthbridge-nphies-proxy"],
    db: "healthbridge-compliance (fd4edf57)",
    routes: ["/api/health", "/network/summary", "/facilities", "/eligibility", "/pa", "/claims"],
  },
  "claimlinc": {
    base: "https://claimlinc-api.brainsait-fadil.workers.dev",
    label: "ClaimLinc (NPHIES Claims API)",
    sub: ["claimlinc-api"],
    routes: ["/api/health", "/nphies/claims", "/nphies/eligibility", "/nphies/pa"],
  },

  // ── BASMA / Bilingual Voice AI ──
  "basma": {
    base: "https://basma-api.brainsait-fadil.workers.dev",
    label: "BASMA (Bilingual Voice AI — Arabic TTS)",
    sub: ["basma-api", "basma-voice-agent", "basma-portal", "basma-crm", "basma-gateway"],
    db: "basma_production (c30dd8f8)",
    routes: ["/api/health", "/basma/speak", "/basma/voices", "/basma/eligibility", "/basma/speak/kpis"],
  },

  // ── GIVC Healthcare Platform ──
  "givc": {
    base: "https://givc-portal.brainsait-fadil.workers.dev",
    label: "GIVC Healthcare Platform",
    sub: ["givc-portal", "givc-core-academy-backend", "givc-core-academy-unified", "givc-linc-agents", "givc-linc-workflows"],
    db: "his_database (f79d9487)",
    routes: ["/api/health", "/api/patients", "/api/clinical", "/api/cds", "/api/labs"],
  },
  "givc-academy": {
    base: "https://givc-core-academy-unified.brainsait-fadil.workers.dev",
    label: "GIVC Academy (Unified)",
    sub: ["givc-core-academy-unified"],
    routes: ["/api/health", "/api/courses", "/api/certification"],
  },

  // ── SBS / Subscription Billing ──
  "sbs": {
    base: "https://sbs-portal.brainsait-fadil.workers.dev",
    label: "SBS (Subscription Billing System)",
    sub: ["sbs-portal", "sbs-normalizer", "sbs-landing-api"],
    db: "sbs_db (334fd7dc)",
    routes: ["/api/health", "/api/coverage", "/api/claims", "/api/billing"],
  },

  // ── Oracle Bridge / Hospital EHRs ──
  "oracle": {
    base: "https://oracle-bridge.brainsait-fadil.workers.dev",
    label: "Oracle Bridge (6 Hospital EHR Systems)",
    sub: ["oracle-bridge", "oracle-claim-scanner", "oracle-patient-search"],
    kv: "ORACLE_RESULTS (639ac84f)",
    routes: ["/api/health", "/api/patients", "/api/eligibility", "/api/claims"],
  },

  // ── HealthBridge Compliance ──
  "healthbridge": {
    base: "https://healthbridge-api-gateway.brainsait-fadil.workers.dev",
    label: "HealthBridge API Gateway",
    sub: ["healthbridge-api-gateway", "healthbridge-compliance-db", "healthbridge-document-store", "healthbridge-nphies-proxy"],
    db: "healthbridge-compliance (fd4edf57)",
    routes: ["/api/health", "/api/compliance", "/api/documents", "/api/nphies"],
  },
  "healthbridge-compliance": {
    base: "https://healthbridge-compliance-db.brainsait-fadil.workers.dev",
    label: "HealthBridge Compliance DB",
    sub: ["healthbridge-compliance-db"],
    routes: ["/api/health", "/api/audit", "/api/hipaa"],
  },
  "healthbridge-nphies": {
    base: "https://healthbridge-nphies-proxy.brainsait-fadil.workers.dev",
    label: "HealthBridge NPHIES Proxy",
    sub: ["healthbridge-nphies-proxy"],
    routes: ["/api/health", "/api/nphies/eligibility", "/api/nphies/claims"],
  },

  // ── Portals & Gateways ──
  "portals": {
    base: "https://brainsait-portals.brainsait-fadil.workers.dev",
    label: "Brainsait Portals (eCarePlus Platform)",
    sub: ["brainsait-portals", "portal-gateway-v5", "portal-gateway"],
    routes: ["/api/health", "/api/portal"],
  },
  "healthcare-gateway": {
    base: "https://brainsait-healthcare-gateway.brainsait-fadil.workers.dev",
    label: "Healthcare Gateway (FHIR Multi-Backend)",
    sub: ["brainsait-healthcare-gateway"],
    routes: ["/api/health", "/api/fhir"],
  },
  "subdomain-router": {
    base: "https://brainsait-subdomain-router.brainsait-fadil.workers.dev",
    label: "Subdomain Router (All *.brainsait.org routing)",
    sub: ["brainsait-subdomain-router"],
    routes: ["/", "/api/routes"],
  },

  // ── Live Portal Subdomains ──
  "portal-elfadil": {
    base: "https://portal.elfadil.com",
    label: "portal.elfadil.com — BrainSAIT eCarePlus Portal",
    sub: ["portal-gateway-v6"],
    routes: ["/", "/api/health"],
  },
  "api-elfadil": {
    base: "https://api.elfadil.com",
    label: "api.elfadil.com — Unified API Gateway",
    sub: ["portal-gateway-v6"],
    routes: ["/", "/api/services"],
  },
  "sso-elfadil": {
    base: "https://sso.elfadil.com",
    label: "sso.elfadil.com — SSO Session Manager",
    sub: ["portal-gateway-v6"],
    routes: ["/", "/api/session"],
  },
  "bsma-elfadil": {
    base: "https://bsma.elfadil.com",
    label: "bsma.elfadil.com — BASMA Patient Portal",
    sub: ["portal-gateway-v6"],
    routes: ["/", "/api/health"],
  },
  "givc-elfadil": {
    base: "https://givc.elfadil.com",
    label: "givc.elfadil.com — GIVC Clinician Portal",
    sub: ["portal-gateway-v6"],
    routes: ["/", "/api/health"],
  },
  "sbs-elfadil": {
    base: "https://sbs.elfadil.com",
    label: "sbs.elfadil.com — SBS Insurance Portal",
    sub: ["portal-gateway-v6"],
    routes: ["/", "/api/health"],
  },
  "status-elfadil": {
    base: "https://status.elfadil.com",
    label: "status.elfadil.com — Ecosystem Status",
    sub: ["portal-gateway-v6"],
    routes: ["/", "/api/status"],
  },

  // ── Wathiq / E-Signing ──
  "wathiq": {
    base: "https://wathiq-milestone-api.brainsait-fadil.workers.dev",
    label: "Wathiq Milestone API (E-Signing)",
    sub: ["wathiq-milestone-api"],
    db: "openauth-brainsait-db (4c885964)",
    routes: ["/api/health", "/api/milestones", "/api/signing"],
  },
  "acrobat-sign": {
    base: "https://acrobat-sign-worker.brainsait-fadil.workers.dev",
    label: "Acrobat Sign Worker (Adobe Integration)",
    sub: ["acrobat-sign-worker"],
    db: "brainsait-signing-db (29cc24d6)",
    routes: ["/api/health", "/api/sign", "/api/agreements"],
  },

  // ── Healthcare Insurance ──
  "insurance-analytics": {
    base: "https://healthcare-insurance-analysis.brainsait-fadil.workers.dev",
    label: "Healthcare Insurance Analytics",
    sub: ["healthcare-insurance-analysis"],
    routes: ["/api/health", "/api/analytics"],
  },
  "rcm": {
    base: "https://rcm-validation-api.brainsait-fadil.workers.dev",
    label: "RCM Validation (Revenue Cycle)",
    sub: ["rcm-validation-api"],
    routes: ["/api/health", "/api/validation"],
  },

  // ── Voice / Communication ──
  "voice-agent": {
    base: "https://voice-agent.brainsait-fadil.workers.dev",
    label: "Voice Agent (Twilio + ElevenLabs)",
    sub: ["voice-agent"],
    routes: ["/api/health", "/api/voice"],
  },
  "maillinc": {
    base: "https://maillinc.brainsait-fadil.workers.dev",
    label: "MailLinc (SMS + Email)",
    sub: ["maillinc"],
    routes: ["/api/health", "/api/sms", "/api/email"],
  },
};

export async function handleEcosystem(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === "/api/ecosystem" || path === "/api/ecosystem/") {
    const backends = Object.entries(ECOSYSTEM_BACKENDS).map(([key, val]) => ({
      id: key,
      label: val.label,
      base: val.base,
      routes: val.routes,
      workers: val.sub?.length || 1,
      proxyUrl: `/api/ecosystem/${key}`,
    }));
    return new Response(JSON.stringify({
      total: backends.length,
      totalWorkers: backends.reduce((s, b) => s + b.workers, 0),
      backends,
    }, null, 2), {
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
    });
  }

  const backendMatch = path.match(/^\/api\/ecosystem\/([a-z-]+)$/);
  if (backendMatch) {
    const backend = backendMatch[1];
    const target = ECOSYSTEM_BACKENDS[backend];
    if (!target) return new Response(JSON.stringify({ error: `Unknown backend: ${backend}` }), { status: 404 });
    return new Response(JSON.stringify({
      id: backend, label: target.label, base: target.base,
      workers: target.sub, db: target.db, kv: target.kv,
      routes: target.routes, proxyPrefix: `/api/ecosystem/${backend}`,
    }, null, 2), {
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
    });
  }

  const proxyMatch = path.match(/^\/api\/ecosystem\/([a-z-]+)\/(.+)$/);
  if (proxyMatch) {
    const backend = proxyMatch[1];
    const target = ECOSYSTEM_BACKENDS[backend];
    if (!target) return new Response(JSON.stringify({ error: `Unknown backend: ${backend}` }), { status: 404 });
    const backendPath = "/" + proxyMatch[2];
    try {
      const response = await fetch(target.base + backendPath, {
        method: request.method,
        headers: request.headers,
        body: request.method !== "GET" && request.method !== "HEAD" ? await request.text() : undefined,
      });
      return new Response(response.body, {
        status: response.status,
        headers: {
          "content-type": response.headers.get("content-type") || "application/json",
          "access-control-allow-origin": "*",
          "x-ecosystem-backend": backend,
          "x-ecosystem-label": target.label,
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: `Failed to reach ${backend}`, detail: err.message }), {
        status: 502,
        headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
      });
    }
  }

  return new Response(JSON.stringify({
    error: "Invalid ecosystem path",
    usage: "/api/ecosystem — list, /api/ecosystem/:name — details, /api/ecosystem/:name/:path — proxy",
  }), { status: 400, headers: { "content-type": "application/json", "access-control-allow-origin": "*" } });
}
