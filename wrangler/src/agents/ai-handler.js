import { AIAgent } from "../services/ai-agent.js";

function getPatientId(request) {
  return new URL(request.url).searchParams.get("patient") || "P-5842";
}

function getParam(request, name, def) {
  return new URL(request.url).searchParams.get(name) || def;
}

function tryParse(str) {
  try { return JSON.parse(str); } catch { return null; }
}

const FALLBACK = { error: "AI unable to generate structured response", status: "fallback" };

async function handle(agentType, env, request, extraPrompts) {
  const patientId = getPatientId(request);
  const agent = new AIAgent(agentType, extraPrompts.goal, env);
  const context = await agent.getPatientContext(patientId);
  let result = await agent[extraPrompts.method](context, ...extraPrompts.args);
  let parsed = tryParse(result);
  if (!parsed) {
    const repaired = result.replace(/[^\[\]{}",:.\w\s\-_\/]/g, "").replace(/,(\s*[}\]])/g, "$1");
    parsed = tryParse(repaired) || { ...FALLBACK, raw: result.slice(0, 500) };
    result = JSON.stringify(parsed);
  }
  return new Response(result, {
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
}

export const handleSummary = (req, env) => handle("Summary", env, req, {
  goal: "Generate concise clinical summaries for any healthcare role",
  method: "generateClinicalSummary",
  args: [getParam(req, "role", "physician")],
});

export const handlePriorAuth = (req, env) => handle("PriorAuth", env, req, {
  goal: "Evaluate medical necessity for prior authorization requests",
  method: "evaluatePriorAuth",
  args: [getParam(req, "service", "99213")],
});

export const handleGapsInCare = (req, env) => handle("GapsInCare", env, req, {
  goal: "Identify preventive care gaps based on USPSTF guidelines",
  method: "identifyGaps",
  args: [],
});

export const handleMedicationSafety = (req, env) => handle("MedicationSafety", env, req, {
  goal: "Review medications for drug interactions, allergies, and safety",
  method: "checkMedicationSafety",
  args: [],
});

export const handleCarePlanNavigator = (req, env) => handle("CarePlan", env, req, {
  goal: "Generate personalized 90-day care plans with SMART goals",
  method: "generateCarePlan",
  args: [],
});

export const handleClinicalTrials = (req, env) => handle("ClinicalTrials", env, req, {
  goal: "Match patients to relevant clinical trials",
  method: "clinicalTrialMatching",
  args: [],
});

export const handleReadmissionRisk = (req, env) => handle("ReadmissionRisk", env, req, {
  goal: "Calculate hospital readmission risk and recommend interventions",
  method: "evaluateReadmissionRisk",
  args: [],
});

export const handleTriage = (req, env) => handle("Triage", env, req, {
  goal: "Assess urgency of symptoms for emergency triage",
  method: "triageAssessment",
  args: [getParam(req, "symptoms", "chest pain and shortness of breath")],
});

export const handleImagingFollowup = (req, env) => handle("ImagingFollowup", env, req, {
  goal: "Track recommended imaging studies and follow-up schedules",
  method: "generateImagingFollowup",
  args: [],
});

export const handleLabExplainer = (req, env) => handle("LabExplainer", env, req, {
  goal: "Interpret lab results with clinical context and recommendations",
  method: "explainLabs",
  args: [],
});

export const handleNLQuery = (req, env) => handle("NLQuery", env, req, {
  goal: "Process natural language queries about patient data",
  method: "analyzeQuery",
  args: [getParam(req, "query", "Show me all diabetic patients with HbA1c over 7")],
});

export const handleSDOHReferral = (req, env) => handle("SDOHReferral", env, req, {
  goal: "Identify social determinant needs and community resources",
  method: "generateSDOHReferrals",
  args: [],
});
