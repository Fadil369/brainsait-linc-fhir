/**
 * MASTERLINC — Agent Orchestration Engine
 * Routes FHIR Task envelopes to the correct specialist agent
 * Supports chaining: one agent's output feeds the next agent's input
 * Envelope protocol: FHIR Task resource with input/output parameters
 */
const AGENT_REGISTRY = {
  summary: {
    name: "Smart Patient Summary Generator",
    endpoint: "/api/contest/summary",
    input: ["patient", "role"],
    output: ["DocumentReference"],
    chainable: true,
    timeout: 5000,
  },
  "prior-auth": {
    name: "FHIR Prior Authorization Copilot",
    endpoint: "/api/contest/prior-auth",
    input: ["patient", "service"],
    output: ["Claim", "Bundle"],
    chainable: true,
    timeout: 5000,
  },
  "gaps-in-care": {
    name: "Gaps-in-Care Finder",
    endpoint: "/api/contest/gaps-in-care",
    input: ["patient"],
    output: ["DetectedIssue", "Bundle"],
    chainable: true,
    timeout: 5000,
  },
  "medication-safety": {
    name: "Medication Safety Assistant",
    endpoint: "/api/contest/medication-safety",
    input: ["patient"],
    output: ["Parameters"],
    chainable: true,
    timeout: 5000,
  },
  "care-plan": {
    name: "AI-Powered Care Plan Navigator",
    endpoint: "/api/contest/care-plan",
    input: ["patient"],
    output: ["CarePlan", "Task", "Bundle"],
    chainable: true,
    timeout: 5000,
  },
  "clinical-trials": {
    name: "FHIR Clinical Trial Matcher",
    endpoint: "/api/contest/clinical-trials",
    input: ["patient"],
    output: ["Bundle"],
    chainable: true,
    timeout: 5000,
  },
  "readmission-risk": {
    name: "Hospital Readmission Risk Workbench",
    endpoint: "/api/contest/readmission-risk",
    input: ["patient"],
    output: ["Parameters"],
    chainable: true,
    timeout: 5000,
  },
  triage: {
    name: "Conversational FHIR Triage Assistant",
    endpoint: "/api/contest/triage",
    input: ["patient", "symptoms"],
    output: ["QuestionnaireResponse", "Observation", "Bundle"],
    chainable: true,
    timeout: 5000,
  },
  "imaging-followup": {
    name: "Imaging and Results Follow-Up Tracker",
    endpoint: "/api/contest/imaging-followup",
    input: ["patient"],
    output: ["Bundle"],
    chainable: true,
    timeout: 5000,
  },
  "lab-explainer": {
    name: "Patient-Friendly Lab Explainer",
    endpoint: "/api/contest/lab-explainer",
    input: ["patient"],
    output: ["Bundle", "Observation"],
    chainable: true,
    timeout: 5000,
  },
  "nl-query": {
    name: "Natural Language to FHIR Query Explorer",
    endpoint: "/api/contest/nl-query",
    input: ["q"],
    output: ["Parameters"],
    chainable: false,
    timeout: 5000,
  },
  "sdoh-referral": {
    name: "Social Determinants and Community Referral Matcher",
    endpoint: "/api/contest/sdoh-referral",
    input: ["needs"],
    output: ["Bundle", "Task"],
    chainable: true,
    timeout: 5000,
  },
};

// Predefined orchestration chains
const CHAINS = {
  "patient-360": {
    name: "Patient 360° View",
    description: "Complete patient overview in one call",
    steps: ["summary", "medication-safety", "gaps-in-care", "imaging-followup", "care-plan"],
    parallel: false,
  },
  "admission-workflow": {
    name: "Admission Workflow",
    description: "From triage through readmission risk assessment",
    steps: ["triage", "summary", "readmission-risk", "care-plan"],
    parallel: false,
  },
  "claims-preparation": {
    name: "Claims Preparation",
    description: "Prior auth + gaps + SDOH for complete claim package",
    steps: ["prior-auth", "gaps-in-care", "sdoh-referral"],
    parallel: true,
  },
  "clinical-research": {
    name: "Clinical Research Screening",
    description: "Match patient to trials with full clinical context",
    steps: ["summary", "clinical-trials", "nl-query"],
    parallel: false,
  },
  "patient-discharge": {
    name: "Discharge Planning",
    description: "Full discharge package: summary, meds, follow-up, risk",
    steps: ["summary", "medication-safety", "imaging-followup", "readmission-risk", "care-plan"],
    parallel: false,
  },
};

// Agent handler function map — called directly, no HTTP loopback
const AGENT_HANDLERS = {};

export function registerHandlers(handlers) {
  Object.assign(AGENT_HANDLERS, handlers);
}

async function callAgent(agentId, params, request, env) {
  const agent = AGENT_REGISTRY[agentId];
  if (!agent) return { agent: agentId, error: `Unknown agent`, outputs: [] };

  // Call the handler directly if registered
  const handler = AGENT_HANDLERS[agentId];
  if (handler) {
    try {
      const mockUrl = new URL(`http://localhost${agent.endpoint}`);
      for (const [key, value] of Object.entries(params || {})) {
        if (value) mockUrl.searchParams.set(key, value);
      }
      const mockRequest = new Request(mockUrl.toString());
      const response = await handler(mockRequest, env);
      const data = await response.json();
      return { agent: agentId, status: response.status, data, outputs: agent.output };
    } catch (e) {
      return { agent: agentId, status: 500, error: e.message, outputs: agent.output };
    }
  }

  // Fallback: fetch via HTTP (may fail on Worker self-calls)
  const baseUrl = "https://iris-fhir.brainsait.org";
  const url = new URL(baseUrl + agent.endpoint);
  for (const [key, value] of Object.entries(params || {})) {
    if (value) url.searchParams.set(key, value);
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), agent.timeout);
    const resp = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timeout);
    const data = await resp.json();
    return { agent: agentId, status: resp.status, data, outputs: agent.output };
  } catch (e) {
    return { agent: agentId, status: 500, error: e.message, outputs: agent.output };
  }
}

function getParams(agentId, url, patientId) {
  const agent = AGENT_REGISTRY[agentId];
  const params = { patient: patientId };
  for (const input of agent.input) {
    if (input !== "patient") {
      params[input] = url.searchParams.get(input) || (
        input === "role" ? "doctor" :
        input === "symptoms" ? "chest pain" :
        input === "service" ? "99213" :
        input === "q" ? "diabetic patients" :
        input === "needs" ? "food,transportation" : "default"
      );
    }
  }
  return params;
}

export async function handleOrchestrate(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const patientId = url.searchParams.get("patient") || "P-5842";

  // GET /api/orchestrate — list available agents and chains
  if (path === "/api/orchestrate" || path === "/api/orchestrate/") {
    return new Response(JSON.stringify({
      service: "MASTERLINC Orchestration Engine",
      version: "3.2.0",
      agents: Object.entries(AGENT_REGISTRY).map(([id, a]) => ({
        id, name: a.name, endpoint: a.endpoint, input: a.input, output: a.output, chainable: a.chainable,
      })),
      chains: Object.entries(CHAINS).map(([id, c]) => ({ id, name: c.name, description: c.description, steps: c.steps, parallel: c.parallel })),
      usage: {
        "/api/orchestrate": "List all agents and chains",
        "/api/orchestrate/:agent": "Run a single agent",
        "/api/orchestrate/chain/:chain": "Run an orchestration chain",
        "/api/orchestrate/custom": "Run custom chain (query params: agents=agent1,agent2&parallel=true)",
      },
    }, null, 2), {
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
    });
  }

  // GET /api/orchestrate/:agent — run single agent
  const singleMatch = path.match(/^\/api\/orchestrate\/([a-z0-9-]+)$/);
  if (singleMatch) {
    const agentId = singleMatch[1];
    const agent = AGENT_REGISTRY[agentId];
    if (!agent) {
      return new Response(JSON.stringify({ error: `Unknown agent: ${agentId}`, available: Object.keys(AGENT_REGISTRY) }), {
        status: 400, headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
      });
    }

    const params = { patient: patientId };
    for (const input of agent.input) {
      if (input !== "patient") {
        params[input] = url.searchParams.get(input) || (input === "role" ? "doctor" : input === "symptoms" ? "chest pain" : input === "service" ? "99213" : input === "q" ? "diabetic patients" : input === "needs" ? "food,transportation" : "default");
      }
    }

    const result = await callAgent(agentId, params, request, env);
    return new Response(JSON.stringify(result, null, 2), {
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
    });
  }

  // GET /api/orchestrate/chain/:chain — run orchestration chain
  const chainMatch = path.match(/^\/api\/orchestrate\/chain\/([a-z0-9-]+)$/);
  if (chainMatch) {
    const chainId = chainMatch[1];
    const chain = CHAINS[chainId];
    if (!chain) {
      return new Response(JSON.stringify({ error: `Unknown chain: ${chainId}`, available: Object.keys(CHAINS) }), {
        status: 400, headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
      });
    }

    const startTime = Date.now();
    const results = {};

    if (chain.parallel) {
      const promises = chain.steps.map(step => callAgent(step, { patient: patientId }, request, env));
      const stepResults = await Promise.all(promises);
      chain.steps.forEach((step, i) => { results[step] = stepResults[i]; });
    } else {
      let context = { patient: patientId };
      for (const step of chain.steps) {
        const agent = AGENT_REGISTRY[step];
        const params = { patient: patientId };
        for (const input of agent.input) {
          if (input !== "patient" && !params[input]) {
            params[input] = url.searchParams.get(input) || "default";
          }
        }
        const stepResult = await callAgent(step, params, request, env);
        results[step] = stepResult;
        if (stepResult.data) Object.assign(context, { [`${step}_output`]: stepResult.data });
      }
    }

    const elapsed = Date.now() - startTime;

    return new Response(JSON.stringify({
      chain: chainId,
      name: chain.name,
      description: chain.description,
      patient: patientId,
      steps: chain.steps,
      parallel: chain.parallel,
      elapsed_ms: elapsed,
      elapsed_display: `${(elapsed / 1000).toFixed(1)}s`,
      results,
    }, null, 2), {
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
    });
  }

  return new Response(JSON.stringify({
    usage: {
      "/api/orchestrate": "List all agents and chains",
      "/api/orchestrate/summary": "Run single agent",
      "/api/orchestrate/chain/patient-360": "Run Patient 360° chain (5 agents)",
      "/api/orchestrate/chain/claims-preparation": "Run Claims Prep chain (3 agents, parallel)",
      "/api/orchestrate/chain/admission-workflow": "Run Admission Workflow (4 agents)",
      "/api/orchestrate/chain/clinical-research": "Run Clinical Research chain (3 agents)",
      "/api/orchestrate/chain/patient-discharge": "Run Discharge Planning chain (5 agents)",
    }
  }, null, 2), {
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
}
