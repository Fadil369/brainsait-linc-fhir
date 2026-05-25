/**
 * BrainSAIT Unified Health Gateway — Ecosystem Proxy
 * Single public entrypoint that routes to all SSO-protected backend workers
 * iris-fhir.brainsait.org/ecosystem/* → proxies to HNH, NPHIES, BASMA, GIVC, SBS, Oracle
 */

const ECOSYSTEM_BACKENDS = {
  "hnh": {
    base: "https://hnh-unified.brainsait-fadil.workers.dev",
    label: "HNH (Al Ribat / Gharnata Hospitals)",
    routes: ["/api/health", "/api/patients", "/api/encounters", "/fhir/Patient", "/fhir/Encounter"],
  },
  "nphies": {
    base: "https://nphies-mirror.brainsait-fadil.workers.dev",
    label: "NPHIES (Saudi National Claims)",
    routes: ["/api/health", "/network/summary", "/facilities", "/eligibility", "/pa"],
  },
  "basma": {
    base: "https://basma-api.brainsait-fadil.workers.dev",
    label: "BASMA (Bilingual Voice AI)",
    routes: ["/api/health", "/basma/speak", "/basma/voices", "/basma/eligibility"],
  },
  "givc": {
    base: "https://givc-portal.brainsait-fadil.workers.dev",
    label: "GIVC Healthcare Platform",
    routes: ["/api/health", "/api/patients", "/api/clinical", "/api/cds"],
  },
  "sbs": {
    base: "https://sbs-portal.brainsait-fadil.workers.dev",
    label: "SBS (Subscription Billing)",
    routes: ["/api/health", "/api/coverage", "/api/claims", "/api/billing"],
  },
  "oracle": {
    base: "https://oracle-bridge.brainsait-fadil.workers.dev",
    label: "Oracle Bridge (6 Hospital EHRs)",
    routes: ["/api/health", "/api/patients", "/api/eligibility", "/api/claims"],
  },
  "claimlinc": {
    base: "https://claimlinc-api.brainsait-fadil.workers.dev",
    label: "ClaimLinc (NPHIES Claims API)",
    routes: ["/api/health", "/nphies/claims", "/nphies/eligibility"],
  },
  "portals": {
    base: "https://brainsait-portals.brainsait-fadil.workers.dev",
    label: "Brainsait Portals",
    routes: ["/api/health", "/api/portal"],
  },
  "healthcare": {
    base: "https://brainsait-healthcare-gateway.brainsait-fadil.workers.dev",
    label: "Healthcare Gateway",
    routes: ["/api/health", "/api/fhir"],
  },
};

async function proxyRequest(backend, path, request) {
  const target = ECOSYSTEM_BACKENDS[backend];
  if (!target) return new Response(JSON.stringify({ error: `Unknown backend: ${backend}` }), { status: 404 });

  const url = new URL(target.base + path);
  const proxyHeaders = new Headers(request.headers);

  try {
    const response = await fetch(url.toString(), {
      method: request.method,
      headers: proxyHeaders,
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
    return new Response(JSON.stringify({
      error: `Failed to reach ${backend}`,
      detail: err.message,
      note: "Backend may be behind Cloudflare Access SSO. Use service token or bypass.",
    }), {
      status: 502,
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
    });
  }
}

export async function handleEcosystem(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  // /api/ecosystem -> list all available backends
  if (path === "/api/ecosystem" || path === "/api/ecosystem/") {
    const backends = Object.entries(ECOSYSTEM_BACKENDS).map(([key, val]) => ({
      id: key,
      label: val.label,
      base: val.base,
      routes: val.routes,
      status: "online",
      proxyUrl: `https://iris-fhir.brainsait.org/api/ecosystem/${key}`,
    }));
    return new Response(JSON.stringify({ total: backends.length, backends }, null, 2), {
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
    });
  }

  // /api/ecosystem/:backend -> list routes for that backend
  const backendMatch = path.match(/^\/api\/ecosystem\/([a-z]+)$/);
  if (backendMatch) {
    const backend = backendMatch[1];
    const target = ECOSYSTEM_BACKENDS[backend];
    if (!target) return new Response(JSON.stringify({ error: `Unknown backend: ${backend}` }), { status: 404 });

    return new Response(JSON.stringify({
      id: backend,
      label: target.label,
      base: target.base,
      routes: target.routes,
      proxyPrefix: `/api/ecosystem/${backend}`,
    }, null, 2), {
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
    });
  }

  // /api/ecosystem/:backend/rest/of/path -> proxy to backend
  const proxyMatch = path.match(/^\/api\/ecosystem\/([a-z]+)\/(.+)$/);
  if (proxyMatch) {
    const backend = proxyMatch[1];
    const backendPath = "/" + proxyMatch[2];
    return proxyRequest(backend, backendPath, request);
  }

  return new Response(JSON.stringify({
    error: "Invalid ecosystem path",
    usage: "/api/ecosystem (list backends), /api/ecosystem/:backend (list routes), /api/ecosystem/:backend/:path (proxy)",
  }), {
    status: 400,
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
}
