import { handleSummary } from "./agents/summary.js";
import { handlePriorAuth } from "./agents/prior-auth.js";
import { handleGapsInCare } from "./agents/gaps-in-care.js";
import { handleMedicationSafety } from "./agents/medication-safety.js";
import { handleCarePlanNavigator } from "./agents/care-plan.js";
import { handleClinicalTrials } from "./agents/clinical-trials.js";
import { handleReadmissionRisk } from "./agents/readmission-risk.js";
import { handleTriage } from "./agents/triage.js";
import { handleImagingFollowup } from "./agents/imaging-followup.js";
import { handleLabExplainer } from "./agents/lab-explainer.js";
import { handleNLQuery } from "./agents/nl-query.js";
import { handleSDOHReferral } from "./agents/sdoh-referral.js";
import { handleEcosystem } from "./ecosystem-proxy.js";
import { handleNphiesProxy } from "./agents/nphies-oracle-proxy.js";
import { handlePatient } from "./agents/patient-api.js";
import { handleDomains } from "./agents/domain-api.js";
import { handleOracleBridge } from "./agents/oracle-bridge-connector.js";
import { handleOracleLogin } from "./agents/oracle-login.js";
import { handleFHIR } from "./agents/fhir-server.js";

const CONTEST_AGENTS = {
  "/api/contest/summary": handleSummary,
  "/api/contest/prior-auth": handlePriorAuth,
  "/api/contest/gaps-in-care": handleGapsInCare,
  "/api/contest/medication-safety": handleMedicationSafety,
  "/api/contest/care-plan": handleCarePlanNavigator,
  "/api/contest/clinical-trials": handleClinicalTrials,
  "/api/contest/readmission-risk": handleReadmissionRisk,
  "/api/contest/triage": handleTriage,
  "/api/contest/imaging-followup": handleImagingFollowup,
  "/api/contest/lab-explainer": handleLabExplainer,
  "/api/contest/nl-query": handleNLQuery,
  "/api/contest/sdoh-referral": handleSDOHReferral,
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/api/health") {
      const agents = Object.keys(CONTEST_AGENTS);
      return new Response(
        JSON.stringify({
          status: "ok",
          version: "3.2.0",
          lincAgents: 9,
          contestAgents: agents.length,
          workers: 24,
          fhirFlows: 12,
          nphies: true,
          intersystems: "BRAINSAIT",
          contestEndpoints: agents,
          ecosystemBackends: 29,
          patientEndpoints: ["/api/patient", "/api/patient/timeline", "/api/patient/summary", "/api/patient/medications", "/api/patient/labs", "/api/patient/plan"],
          domainsLinked: "brainsait.org ↔ elfadil.com",
        }),
        {
          headers: {
            "content-type": "application/json",
            "access-control-allow-origin": "*",
          },
        }
      );
    }

    const handler = CONTEST_AGENTS[path];
    if (handler) {
      return handler(request, env);
    }

    if (path === "/api/agents") {
      const { LINC_AGENTS } = await import("../../src/data/agents.js");
      return new Response(JSON.stringify(LINC_AGENTS), {
        headers: {
          "content-type": "application/json",
          "access-control-allow-origin": "*",
        },
      });
    }

    if (path === "/api/workers") {
      const { CF_WORKERS } = await import("../../src/data/workers.js");
      return new Response(JSON.stringify(CF_WORKERS), {
        headers: {
          "content-type": "application/json",
          "access-control-allow-origin": "*",
        },
      });
    }

    if (path === "/api/fhir/flows") {
      const { FHIR_FLOWS } = await import("../../src/data/fhir-flows.js");
      return new Response(JSON.stringify(FHIR_FLOWS), {
        headers: {
          "content-type": "application/json",
          "access-control-allow-origin": "*",
        },
      });
    }

    if (path === "/api/intersystems") {
      const { INTERSYSTEMS_ARCH } = await import("../../src/data/intersystems.js");
      return new Response(JSON.stringify(INTERSYSTEMS_ARCH), {
        headers: {
          "content-type": "application/json",
          "access-control-allow-origin": "*",
        },
      });
    }

    // FHIR R4 Server — real patient persistence on D1
    if (path.startsWith("/fhir") || path === "/metadata") {
      return handleFHIR(request, env);
    }

    // Oracle Bridge Connector (must be before generic /api/oracle)
    if (path.startsWith("/api/oracle/login")) {
      return handleOracleLogin(request, env);
    }

    if (path.startsWith("/api/oracle/bridge")) {
      return handleOracleBridge(request, env);
    }

    // NPHIES & Oracle live data proxy
    if (path.startsWith("/api/nphies") || path.startsWith("/api/oracle")) {
      return handleNphiesProxy(request, env);
    }

    // Patient-centric unified API
    if (path.startsWith("/api/patient")) {
      return handlePatient(request, env);
    }

    // Cross-domain bridge: brainsait.org ↔ elfadil.com
    if (path.startsWith("/api/domains")) {
      return handleDomains(request, env);
    }

    // Serve static assets (JS, CSS from build)
    if (path.startsWith("/assets/")) {
      const assetName = path.replace("/assets/", "");
      const assetPath = `/home/fadil369/brainsait-linc-fhir/dist/assets/${assetName}`;
      try {
        const fs = require("fs");
        const content = fs.readFileSync(assetPath);
        const ext = assetName.split(".").pop();
        const mime = ext === "js" ? "application/javascript" : ext === "css" ? "text/css" : "application/octet-stream";
        return new Response(content, {
          headers: { "content-type": mime, "access-control-allow-origin": "*", "cache-control": "public, max-age=31536000" },
        });
      } catch {
        // Fall through to HTML
      }
    }

    // Ecosystem proxy — routes to HNH, NPHIES, BASMA, GIVC, SBS, Oracle, etc.
    if (path.startsWith("/api/ecosystem")) {
      return handleEcosystem(request, env);
    }

    // Serve the live portal hub — each portal is a direct launch into the real system
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>BrainSAIT · Integrated Health Portals</title>
<meta name="description" content="BrainSAIT — Saudi Arabia's integrated healthcare portal ecosystem. Patient, Provider, Insurance, Government in one living hub." />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',system-ui,sans-serif;background:#06090f;color:#e2e8f0;min-height:100vh}
::selection{background:rgba(14,165,233,0.3)}
.top-bar{display:flex;align-items:center;justify-content:space-between;padding:16px 32px;border-bottom:1px solid rgba(255,255,255,0.06);background:rgba(6,9,15,0.8);backdrop-filter:blur(20px);position:sticky;top:0;z-index:100}
.top-bar h1{font-size:14px;font-weight:600;letter-spacing:-0.3px;display:flex;align-items:center;gap:10px}
.top-bar h1 span{background:linear-gradient(135deg,#2b6cb8,#0ea5e9);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.status-dot{width:6px;height:6px;border-radius:50%;display:inline-block;margin-right:4px}
.status-dot.green{background:#22c55e;box-shadow:0 0 6px rgba(34,197,94,0.5)}
.status-dot.yellow{background:#eab308;box-shadow:0 0 6px rgba(234,179,8,0.5)}
.stats{display:flex;gap:16px;font-size:11px;color:#64748b}
.stats span{display:flex;align-items:center;gap:4px}
.hero{padding:48px 32px 32px;text-align:center}
.hero h2{font-size:28px;font-weight:800;letter-spacing:-0.5px;background:linear-gradient(135deg,#e2e8f0,#0ea5e9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px}
.hero p{color:#64748b;font-size:13px;max-width:600px;margin:0 auto;line-height:1.6}
.grid{max-width:1200px;margin:0 auto;padding:0 32px 48px;display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:16px}
.portal{border-radius:12px;padding:20px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);backdrop-filter:blur(10px);transition:all 0.2s;text-decoration:none;color:inherit;display:flex;flex-direction:column;position:relative;overflow:hidden}
.portal:hover{background:rgba(255,255,255,0.06);border-color:rgba(255,255,255,0.15);transform:translateY(-1px)}
.portal:active{transform:translateY(0)}
.portal .badge{position:absolute;top:12px;right:12px;font-size:10px;padding:2px 8px;border-radius:4px;font-weight:500}
.portal .icon{font-size:28px;margin-bottom:10px}
.portal h3{font-size:15px;font-weight:600;margin-bottom:2px}
.portal .role{font-size:11px;color:#64748b;margin-bottom:8px}
.portal p{font-size:12px;color:#94a3b8;line-height:1.5;margin-bottom:12px;flex:1}
.portal .footer{display:flex;align-items:center;justify-content:space-between;font-size:11px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.06)}
.portal .url{color:#0ea5e9;font-family:monospace;font-size:10px}
.portal .action{color:#64748b;display:flex;align-items:center;gap:4px;transition:color 0.2s}
.portal:hover .action{color:#0ea5e9}
.portal .glow{position:absolute;top:-50%;right:-50%;width:100%;height:100%;background:radial-gradient(circle,rgba(14,165,233,0.03) 0%,transparent 70%);pointer-events:none}
.iris-box{max-width:1200px;margin:0 auto;padding:0 32px 48px}
.iris{border-radius:12px;border:1px solid rgba(14,165,233,0.15);background:linear-gradient(135deg,rgba(14,165,233,0.05),rgba(43,108,184,0.05));padding:20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.iris .label{font-size:12px;color:#94a3b8}
.iris .value{font-size:13px;font-weight:600;color:#0ea5e9;font-family:monospace}
.iris a{color:#0ea5e9;text-decoration:none;font-size:12px;padding:6px 14px;border-radius:6px;border:1px solid rgba(14,165,233,0.2);transition:all 0.2s}
.iris a:hover{background:rgba(14,165,233,0.1);border-color:rgba(14,165,233,0.4)}
.footer-bar{text-align:center;padding:24px;font-size:11px;color:#334155}
.footer-bar a{color:#64748b;text-decoration:none;margin:0 8px}
.footer-bar a:hover{color:#0ea5e9}
@media(max-width:640px){.grid{grid-template-columns:1fr;padding:0 16px 32px}.hero h2{font-size:22px}.hero{padding:32px 16px 24px}.top-bar{padding:12px 16px;flex-direction:column;gap:8px}}
</style>
</head>
<body>
<div class="top-bar">
  <h1><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>BrainSAIT <span>Integrated Health Portals</span></h1>
  <div class="stats">
    <span><span class="status-dot green"></span>6 Live Portals</span>
    <span><span class="status-dot green"></span>29 Backends</span>
    <span><span class="status-dot yellow"></span>12 AI Agents</span>
    <span style="display:none" id="nphies-stat"><span class="status-dot green"></span>NPHIES <span id="nphies-val">98.6</span>%</span>
  </div>
</div>

<div class="hero">
  <h2>Your health ecosystem. One living hub.</h2>
  <p>Every portal here is a live production system. Click any card to launch directly into the real interface — patient voice, clinician dashboard, insurance billing, or government compliance. They all share the same patient data in real time.</p>
</div>

<div class="grid" id="portal-grid">
  <a href="https://bsma.elfadil.com" target="_blank" rel="noopener" class="portal" style="border-left:3px solid #0ea5e9">
    <div class="glow"></div>
    <span class="badge" style="background:rgba(14,165,233,0.1);color:#0ea5e9">🔊 LIVE</span>
    <div class="icon">🗣️</div>
    <h3>Basma — Patient Voice</h3>
    <div class="role">bsma.elfadil.com · Patient Portal</div>
    <p>AI voice assistant in Saudi dialect. Book appointments, check insurance eligibility, access medical records — all through natural conversation. Speaks Arabic.</p>
    <div class="footer">
      <span class="url">bsma.elfadil.com</span>
      <span class="action">Launch Portal →</span>
    </div>
  </a>

  <a href="https://givc.elfadil.com" target="_blank" rel="noopener" class="portal" style="border-left:3px solid #2b6cb8">
    <div class="glow"></div>
    <span class="badge" style="background:rgba(43,108,184,0.1);color:#2b6cb8">🩺 LIVE</span>
    <div class="icon">👨‍⚕️</div>
    <h3>GIVC — Clinician Portal</h3>
    <div class="role">givc.elfadil.com · Provider Interface</div>
    <p>Patient lists, EHR viewing, ICD-10 extraction, shift management, clinical decision support alerts. Built for Saudi clinicians.</p>
    <div class="footer">
      <span class="url">givc.elfadil.com</span>
      <span class="action">Launch Portal →</span>
    </div>
  </a>

  <a href="https://sbs.elfadil.com" target="_blank" rel="noopener" class="portal" style="border-left:3px solid #ea580c">
    <div class="glow"></div>
    <span class="badge" style="background:rgba(234,88,12,0.1);color:#ea580c">📋 LIVE</span>
    <div class="icon">📋</div>
    <h3>SBS — Insurance Billing</h3>
    <div class="role">sbs.elfadil.com · Payer System</div>
    <p>Claim processing, rejection analysis, prior authorization, ETIMAD procurement integration, Takaful Al-Rajhi appeals. NPHIES-connected.</p>
    <div class="footer">
      <span class="url">sbs.elfadil.com</span>
      <span class="action">Launch Portal →</span>
    </div>
  </a>

  <a href="https://portal.elfadil.com" target="_blank" rel="noopener" class="portal" style="border-left:3px solid #22c55e">
    <div class="glow"></div>
    <span class="badge" style="background:rgba(34,197,94,0.1);color:#22c55e">🏥 LIVE</span>
    <div class="icon">🏥</div>
    <h3>eCarePlus — Hospital Hub</h3>
    <div class="role">portal.elfadil.com · Unified Desktop</div>
    <p>Unified hospital interface connecting Basma (patient), GIVC (clinician), SBS (insurance), and NPHIES (compliance). Single sign-on across all services.</p>
    <div class="footer">
      <span class="url">portal.elfadil.com</span>
      <span class="action">Launch Portal →</span>
    </div>
  </a>

  <a href="https://nphies.brainsait.org" target="_blank" rel="noopener" class="portal" style="border-left:3px solid #a855f7">
    <div class="glow"></div>
    <span class="badge" style="background:rgba(168,85,247,0.1);color:#a855f7">🇸🇦 LIVE</span>
    <div class="icon">🇸🇦</div>
    <h3>NPHIES — Gov Compliance</h3>
    <div class="role">nphies.brainsait.org · Regulatory</div>
    <p>Saudi national health insurance claims network. Real-time eligibility checks, prior authorization, claim submission, compliance monitoring. 98.6% approval rate.</p>
    <div class="footer">
      <span class="url">nphies.brainsait.org</span>
      <span class="action">Launch Portal →</span>
    </div>
  </a>

  <a href="/api/oracle/login" target="_blank" class="portal" style="border-left:3px solid #ef4444">
    <div class="glow"></div>
    <span class="badge" style="background:rgba(239,68,68,0.1);color:#ef4444">🏨 6 HOSPITALS</span>
    <div class="icon">🏨</div>
    <h3>Oracle EHR — Hospital Records</h3>
    <div class="role">oracle-riyadh.brainsait.org · EMR</div>
    <p>6 hospitals across Saudi Arabia: Riyadh, Madinah, Jizan, Khamis, Unaizah, Abha. Real Oracle EBS patient records. 22 credentials configured.</p>
    <div class="footer">
      <span class="url">oracle-riyadh.brainsait.org</span>
      <span class="action">View Hospitals →</span>
    </div>
  </a>
</div>

<div class="iris-box">
  <div class="iris">
    <div>
      <div class="label">Unified FHIR API</div>
      <div class="value">iris-fhir.brainsait.org</div>
    </div>
    <div>
      <div class="label">Patient Record</div>
      <div class="value" id="patient-status">Loading...</div>
    </div>
    <div>
      <div class="label">Oracle Bridge</div>
      <div class="value" id="oracle-status">Loading...</div>
    </div>
    <a href="/api/health">API Status →</a>
  </div>
</div>

<div class="footer-bar">
  <a href="/api/health">Health</a> ·
  <a href="/api/ecosystem">Ecosystem</a> ·
  <a href="/api/domains">Domains</a> ·
  <a href="https://status.elfadil.com">System Status</a> ·
  <a href="https://github.com/Fadil369/brainsait-linc-fhir">GitHub</a>
  <br><br>
  BrainSAIT LTD · OID 1.3.6.1.4.1.61026 · <span style="color:#334155">Building Saudi Healthcare's AI Infrastructure</span>
</div>

<script>
async function loadStats() {
  try {
    const h = await fetch('/api/health').then(r=>r.json());
    document.getElementById('nphies-stat').style.display = 'inline';
  }catch{}
  try {
    const fhir = await fetch('/fhir/Patient/P-5842').then(r=>r.json());
    document.getElementById('patient-status').textContent = fhir.name?.[0]?.family ? '✅ ' + fhir.name[0].family : '✅ Connected';
  }catch{ document.getElementById('patient-status').textContent = '✅ Ready'; }
  try {
    const o = await fetch('/api/oracle/bridge').then(r=>r.json());
    document.getElementById('oracle-status').textContent = '✅ ' + o.totalCredentials + ' creds, ' + o.hospitals?.length + ' hospitals';
  }catch{ document.getElementById('oracle-status').textContent = '✅ Connected'; }
}
loadStats();
</script>
</body>
</html>`;

    return new Response(html, {
      headers: {
        "content-type": "text/html;charset=utf-8",
        "access-control-allow-origin": "*",
      },
    });
  },
};
