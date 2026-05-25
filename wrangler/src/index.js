import {
  BrainSAITFHIRUnified,
} from "../src/App.jsx";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/api/health") {
      return new Response(
        JSON.stringify({
          status: "ok",
          version: "3.2.0",
          agents: 9,
          workers: 24,
          fhirFlows: 12,
          nphies: true,
          intersystems: "BRAINSAIT",
        }),
        {
          headers: {
            "content-type": "application/json",
            "access-control-allow-origin": "*",
          },
        }
      );
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
      const { INTERSYSTEMS_ARCH } = await import(
        "../src/data/intersystems.js"
      );
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
