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
      const { LINC_AGENTS } = await import("../src/data/agents.js");
      return new Response(JSON.stringify(LINC_AGENTS), {
        headers: {
          "content-type": "application/json",
          "access-control-allow-origin": "*",
        },
      });
    }

    if (path === "/api/workers") {
      const { CF_WORKERS } = await import("../src/data/workers.js");
      return new Response(JSON.stringify(CF_WORKERS), {
        headers: {
          "content-type": "application/json",
          "access-control-allow-origin": "*",
        },
      });
    }

    if (path === "/api/fhir/flows") {
      const { FHIR_FLOWS } = await import("../src/data/fhir-flows.js");
      return new Response(JSON.stringify(FHIR_FLOWS), {
        headers: {
          "content-type": "application/json",
          "access-control-allow-origin": "*",
        },
      });
    }

    if (path === "/api/intersystems") {
      const { INTERSYSTEMS_ARCH } = await import("../src/data/intersystems.js");
      return new Response(JSON.stringify(INTERSYSTEMS_ARCH), {
        headers: {
          "content-type": "application/json",
          "access-control-allow-origin": "*",
        },
      });
    }

    return new Response("BrainSAIT LINC FHIR Unified API", {
      headers: {
        "content-type": "text/plain",
        "access-control-allow-origin": "*",
      },
    });
  },
};
