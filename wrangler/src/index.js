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
import { handleFhirLint } from "./agents/fhir-lint.js";
import { handleOrchestrate, registerHandlers } from "./agents/orchestrator.js";

// Register handlers with the orchestrator for direct function calls
registerHandlers({
  summary: handleSummary,
  "prior-auth": handlePriorAuth,
  "gaps-in-care": handleGapsInCare,
  "medication-safety": handleMedicationSafety,
  "care-plan": handleCarePlanNavigator,
  "clinical-trials": handleClinicalTrials,
  "readmission-risk": handleReadmissionRisk,
  triage: handleTriage,
  "imaging-followup": handleImagingFollowup,
  "lab-explainer": handleLabExplainer,
  "nl-query": handleNLQuery,
  "sdoh-referral": handleSDOHReferral,
});

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

    // MASTERLINC Agent Orchestrator
    if (path.startsWith("/api/orchestrate")) {
      return handleOrchestrate(request, env);
    }

    // FHIR Lint — validation engine (fhirlint integration)
    if (path.startsWith("/fhir/validate") || path.startsWith("/fhir/lint")) {
      return handleFhirLint(request, env);
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

    // Serve static assets — try env ASSETS first, then fall through to SPA
    if (path.startsWith("/assets/")) {
      const assetName = path.slice(1);
      if (env.__STATIC_CONTENT) {
        const content = await env.__STATIC_CONTENT.get(assetName, "arrayBuffer");
        if (content) {
          const ext = assetName.split(".").pop();
          const mime = ext === "js" ? "application/javascript" : ext === "css" ? "text/css" : "application/octet-stream";
          return new Response(content, {
            headers: { "content-type": mime, "access-control-allow-origin": "*", "cache-control": "public, max-age=31536000" },
          });
        }
      }
      // Fallback: serve from KV or R2
      if (env.STATIC_KV) {
        const content = await env.STATIC_KV.get(assetName);
        if (content) {
          const ext = assetName.split(".").pop();
          const mime = ext === "js" ? "application/javascript" : ext === "css" ? "text/css" : "application/octet-stream";
          return new Response(content, {
            headers: { "content-type": mime, "access-control-allow-origin": "*", "cache-control": "public, max-age=31536000" },
          });
        }
      }
    }

    // Ecosystem proxy — routes to HNH, NPHIES, BASMA, GIVC, SBS, Oracle, etc.
    if (path.startsWith("/api/ecosystem")) {
      return handleEcosystem(request, env);
    }

    // Serve the shadcn React SPA from Cloudflare Pages
    const pagesUrl = "https://brainsait-linc-fhir.pages.dev";
    const pagesResp = await fetch(`${pagesUrl}${path}`);
    if (pagesResp.ok) {
      return new Response(pagesResp.body, {
        status: pagesResp.status,
        headers: {
          "content-type": pagesResp.headers.get("content-type") || "text/html",
          "access-control-allow-origin": "*",
          "cache-control": "public, max-age=3600",
        },
      });
    }

    return new Response("BrainSAIT LINC FHIR Unified API — " + pagesUrl, {
      headers: { "content-type": "text/plain", "access-control-allow-origin": "*" },
    });
  },
};
