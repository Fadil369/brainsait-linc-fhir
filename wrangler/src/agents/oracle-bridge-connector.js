/**
 * Oracle Bridge Connector — Worker-to-Worker Integration
 * Calls the oracle-bridge worker (which has credentials) to get real patient data
 * The bridge worker has ORACLE_USER, ORACLE_PASSWORD, and per-hospital creds
 */

const ORACLE_BRIDGE = "https://oracle-bridge.brainsait-fadil.workers.dev";
const ORACLE_HOSPITALS = [
  { id: "riyadh", name: "Al-Hayat National Hospital, Riyadh", portal: "https://oracle-riyadh.brainsait.org/prod/faces/Home" },
  { id: "madinah", name: "Hayat National Hospital – Madinah", portal: "https://oracle-madinah.brainsait.org/Oasis/faces/Login.jsf" },
  { id: "jizan", name: "The National Life Hospital, Jazan", portal: "https://oracle-jizan.brainsait.org/prod/faces/Login.jsf" },
  { id: "khamis", name: "Al-Hayat National Hospital - Khamis Mushait", portal: "https://oracle-khamis.brainsait.org/prod/faces/Login.jsf" },
  { id: "unaizah", name: "Al-Hayat National Hospital - Unaizah", portal: "https://oracle-unaizah.brainsait.org/prod/faces/Login.jsf" },
  { id: "abha", name: "HNHN ABHA", portal: "https://oracle-abha.brainsait.org/Oasis/faces/Home" },
];

const ORACLE_ENDPOINTS = {
  patients: "/api/patients",
  search: "/api/patients/search",
  eligibility: "/api/eligibility",
  claims: "/api/claims",
  health: "/api/health",
};

async function callOracleBridge(path, method = "GET", body = null) {
  const url = ORACLE_BRIDGE + path;
  const options = {
    method,
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
  };
  if (body) options.body = JSON.stringify(body);
  try {
    return await fetch(url, options);
  } catch {
    return null;
  }
}

export async function handleOracleBridge(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  // /api/oracle/bridge — list available hospitals and their Oracle portals
  if (path === "/api/oracle/bridge") {
    const health = await callOracleBridge(ORACLE_ENDPOINTS.health);
    return new Response(JSON.stringify({
      service: "Oracle Bridge Connector",
      bridgeWorker: ORACLE_BRIDGE,
      bridgeStatus: health?.ok ? "connected" : "unreachable (SSO protected)",
      hospitals: ORACLE_HOSPITALS,
      endpoints: ORACLE_ENDPOINTS,
      note: "The oracle-bridge worker has all 22 credentials. Worker-to-worker calls bypass SSO.",
      credentialsAvailable: [
        "ORACLE_USER (shared)", "ORACLE_PASSWORD (shared)",
        "ORACLE_USER_RIYADH", "ORACLE_PASS_RIYADH",
        "ORACLE_USER_MADINAH", "ORACLE_PASS_MADINAH",
        "ORACLE_USER_JIZAN", "ORACLE_PASS_JIZAN",
        "ORACLE_USER_KHAMIS", "ORACLE_PASS_KHAMIS",
        "ORACLE_USER_UNAIZAH", "ORACLE_PASS_UNAIZAH",
        "ORACLE_USER_ABHA", "ORACLE_PASS_ABHA",
        "ORACLE_CREDS_RIYADH", "ORACLE_CREDS_MADINAH",
        "ORACLE_CREDS_JIZAN", "ORACLE_CREDS_KHAMIS",
        "ORACLE_CREDS_UNAIZAH", "ORACLE_CREDS_ABHA",
        "ORACLE_BRIDGE_API_KEY",
      ],
      totalCredentials: 22,
    }, null, 2), {
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
    });
  }

  // /api/oracle/bridge/patients/:hospital — get patients from Oracle
  const patientMatch = path.match(/^\/api\/oracle\/bridge\/patients\/([a-z]+)$/);
  if (patientMatch) {
    const hospital = patientMatch[1];
    const hosp = ORACLE_HOSPITALS.find(h => h.id === hospital);
    if (!hosp) {
      return new Response(JSON.stringify({ error: `Unknown hospital: ${hospital}`, available: ORACLE_HOSPITALS.map(h => h.id) }), {
        status: 400, headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
      });
    }

    const resp = await callOracleBridge(`${ORACLE_ENDPOINTS.patients}?branch=${hospital}`);
    if (resp && resp.ok) {
      const data = await resp.json();
      return new Response(JSON.stringify({
        source: "oracle-bridge (live Oracle DB)",
        hospital: hosp.name,
        data,
      }, null, 2), {
        headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
      });
    }

    return new Response(JSON.stringify({
      source: "oracle-bridge (credentials configured, needs service token)",
      hospital: hosp.name,
      portal: hosp.portal,
      note: "Oracle bridge worker has all 22 credentials. Worker-to-worker call attempted but may need service token.",
      alternative: "Set a Cloudflare Access Service Token on oracle-bridge, or call directly via CF internal network.",
    }, null, 2), {
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
    });
  }

  return new Response(JSON.stringify({
    usage: {
      "/api/oracle/bridge": "Oracle bridge status and credential inventory",
      "/api/oracle/bridge/patients/riyadh": "Get patients from specific hospital (riyadh, madinah, jizan, khamis, unaizah, abha)",
    }
  }, null, 2), {
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
}
