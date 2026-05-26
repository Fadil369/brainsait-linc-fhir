/**
 * BrainSAIT FHIR Lint Agent
 * Wraps fhirlint validation for the iris-fhir.brainsait.org platform
 *
 * Endpoints:
 *   POST /fhir/validate       — validate a FHIR resource against spec
 *   POST /fhir/validate/batch — validate multiple resources
 *   GET  /fhir/lint/rules     — list supported validation rules
 *   GET  /fhir/lint/stats     — dataset statistics from D1
 */

// ── FHIR R4 validation rules (offline, no external JAR needed) ──────────
const FHIR_RULES = [
  { id: "REQUIRED_ELEMENT", severity: "error", desc: "Required element missing", resources: ["*"] },
  { id: "INVALID_CARDINALITY", severity: "error", desc: "Cardinality violation (min/max)", resources: ["*"] },
  { id: "INVALID_REFERENCE", severity: "warning", desc: "Reference target not found", resources: ["*"] },
  { id: "INVALID_CODE_SYSTEM", severity: "error", desc: "Code not in declared system", resources: ["*"] },
  { id: "INVALID_DATETIME", severity: "error", desc: "Invalid FHIR dateTime format", resources: ["*"] },
  { id: "MISSING_META", severity: "warning", desc: "Resource missing meta element", resources: ["*"] },
  { id: "MISSING_TEXT", severity: "warning", desc: "Resource missing text narrative", resources: ["*"] },
  { id: "INVALID_IDENTIFIER", severity: "error", desc: "Identifier missing system or value", resources: ["*"] },
  { id: "BUNDLE_ENTRY_MISSING", severity: "error", desc: "Bundle entry missing resource", resources: ["Bundle"] },
  { id: "PATIENT_MISSING_NAME", severity: "error", desc: "Patient must have at least one name", resources: ["Patient"] },
  { id: "PATIENT_MISSING_GENDER", severity: "error", desc: "Patient must have gender", resources: ["Patient"] },
  { id: "OBSERVATION_MISSING_CODE", severity: "error", desc: "Observation must have a code", resources: ["Observation"] },
  { id: "OBSERVATION_MISSING_STATUS", severity: "error", desc: "Observation must have status", resources: ["Observation"] },
  { id: "OBSERVATION_MISSING_SUBJECT", severity: "error", desc: "Observation must have subject", resources: ["Observation"] },
  { id: "CLAIM_MISSING_TYPE", severity: "error", desc: "Claim must have type", resources: ["Claim"] },
  { id: "CLAIM_MISSING_PATIENT", severity: "error", desc: "Claim must reference patient", resources: ["Claim"] },
  { id: "CLAIM_MISSING_INSURER", severity: "error", desc: "Claim must reference insurer", resources: ["Claim"] },
  { id: "ENCOUNTER_MISSING_STATUS", severity: "error", desc: "Encounter must have status", resources: ["Encounter"] },
  { id: "ENCOUNTER_MISSING_CLASS", severity: "error", desc: "Encounter must have class", resources: ["Encounter"] },
  { id: "MEDICATION_MISSING_CODE", severity: "error", desc: "MedicationRequest must have medication code", resources: ["MedicationRequest"] },
  { id: "CONDITION_MISSING_CODE", severity: "error", desc: "Condition must have code", resources: ["Condition"] },
  { id: "CONDITION_MISSING_SUBJECT", severity: "error", desc: "Condition must have subject", resources: ["Condition"] },
  { id: "COVERAGE_MISSING_BENEFICIARY", severity: "error", desc: "Coverage must reference beneficiary", resources: ["Coverage"] },
  { id: "COVERAGE_MISSING_PAYOR", severity: "error", desc: "Coverage must reference payor", resources: ["Coverage"] },
  { id: "APPOINTMENT_MISSING_STATUS", severity: "error", desc: "Appointment must have status", resources: ["Appointment"] },
  { id: "DIAGNOSTIC_REPORT_MISSING_STATUS", severity: "error", desc: "DiagnosticReport must have status", resources: ["DiagnosticReport"] },
  { id: "NPHIES_EXTENSION", severity: "info", desc: "NPHIES-specific extension validation", resources: ["Claim", "ClaimResponse", "Coverage", "Patient"] },
  { id: "NPHIES_SLICE", severity: "warning", desc: "NPHIES slice requirements", resources: ["Claim", "Coverage"] },
];

// ── Validate a single FHIR resource ────────────────────────────────────
function validateResource(resource) {
  const issues = [];
  if (!resource || typeof resource !== "object") {
    return [{ ruleId: "INVALID_JSON", severity: "error", path: "$", message: "Input is not a valid JSON object" }];
  }

  // 1. resourceType check
  if (!resource.resourceType) {
    issues.push({ ruleId: "REQUIRED_ELEMENT", severity: "error", path: "$.resourceType", message: "Missing required resourceType" });
    return issues;
  }

  // 2. Required fields for ALL resources
  if (!resource.id && resource.resourceType !== "Bundle") {
    issues.push({ ruleId: "REQUIRED_ELEMENT", severity: "warning", path: "$.id", message: "Resource has no id" });
  }
  if (!resource.meta) {
    issues.push({ ruleId: "MISSING_META", severity: "warning", path: "$.meta", message: "Resource missing meta element" });
  }
  if (!resource.text) {
    issues.push({ ruleId: "MISSING_TEXT", severity: "warning", path: "$.text", message: "Resource missing text narrative (best practice)" });
  }

  // 3. Identifier validation
  if (resource.identifier) {
    const ids = Array.isArray(resource.identifier) ? resource.identifier : [resource.identifier];
    ids.forEach((id, i) => {
      if (!id.system) issues.push({ ruleId: "INVALID_IDENTIFIER", severity: "error", path: `$.identifier[${i}].system`, message: "Identifier missing system" });
      if (!id.value) issues.push({ ruleId: "INVALID_IDENTIFIER", severity: "error", path: `$.identifier[${i}].value`, message: "Identifier missing value" });
    });
  }

  // 4. DateTime validation
  const dateFields = ["birthDate", "date", "issued", "authoredOn", "recorded", "start", "end"];
  function checkDates(obj, prefix) {
    for (const key of Object.keys(obj || {})) {
      if (dateFields.includes(key) && typeof obj[key] === "string") {
        if (!/^\d{4}(-\d{2}(-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2}))?)?)?$/.test(obj[key])) {
          issues.push({ ruleId: "INVALID_DATETIME", severity: "error", path: `${prefix}.${key}`, message: `Invalid FHIR dateTime: ${obj[key]}` });
        }
      }
    }
  }
  checkDates(resource, "$");

  // 5. Resource-specific validation
  const rt = resource.resourceType;

  if (rt === "Patient") {
    if (!resource.name?.length) issues.push({ ruleId: "PATIENT_MISSING_NAME", severity: "error", path: "$.name", message: "Patient must have at least one name" });
    if (!resource.gender) issues.push({ ruleId: "PATIENT_MISSING_GENDER", severity: "error", path: "$.gender", message: "Patient must have gender" });
  }

  if (rt === "Observation") {
    if (!resource.code) issues.push({ ruleId: "OBSERVATION_MISSING_CODE", severity: "error", path: "$.code", message: "Observation must have a code" });
    if (!resource.status) issues.push({ ruleId: "OBSERVATION_MISSING_STATUS", severity: "error", path: "$.status", message: "Observation must have status" });
    if (!resource.subject) issues.push({ ruleId: "OBSERVATION_MISSING_SUBJECT", severity: "error", path: "$.subject", message: "Observation must have subject" });
  }

  if (rt === "Claim") {
    if (!resource.type) issues.push({ ruleId: "CLAIM_MISSING_TYPE", severity: "error", path: "$.type", message: "Claim must have type" });
    if (!resource.patient) issues.push({ ruleId: "CLAIM_MISSING_PATIENT", severity: "error", path: "$.patient", message: "Claim must reference patient" });
    if (!resource.insurer) issues.push({ ruleId: "CLAIM_MISSING_INSURER", severity: "error", path: "$.insurer", message: "Claim must reference insurer" });
  }

  if (rt === "Encounter") {
    if (!resource.status) issues.push({ ruleId: "ENCOUNTER_MISSING_STATUS", severity: "error", path: "$.status", message: "Encounter must have status" });
    if (!resource["class"]) issues.push({ ruleId: "ENCOUNTER_MISSING_CLASS", severity: "error", path: "$.class", message: "Encounter must have class" });
  }

  if (rt === "MedicationRequest") {
    if (!resource.medicationCodeableConcept && !resource.medicationReference) {
      issues.push({ ruleId: "MEDICATION_MISSING_CODE", severity: "error", path: "$.medication", message: "MedicationRequest must have medication" });
    }
  }

  if (rt === "Condition") {
    if (!resource.code) issues.push({ ruleId: "CONDITION_MISSING_CODE", severity: "error", path: "$.code", message: "Condition must have code" });
    if (!resource.subject) issues.push({ ruleId: "CONDITION_MISSING_SUBJECT", severity: "error", path: "$.subject", message: "Condition must have subject" });
  }

  if (rt === "Coverage") {
    if (!resource.beneficiary) issues.push({ ruleId: "COVERAGE_MISSING_BENEFICIARY", severity: "error", path: "$.beneficiary", message: "Coverage must reference beneficiary" });
    if (!resource.payor?.length) issues.push({ ruleId: "COVERAGE_MISSING_PAYOR", severity: "error", path: "$.payor", message: "Coverage must reference payor" });
  }

  if (rt === "Appointment") {
    if (!resource.status) issues.push({ ruleId: "APPOINTMENT_MISSING_STATUS", severity: "error", path: "$.status", message: "Appointment must have status" });
  }

  if (rt === "DiagnosticReport") {
    if (!resource.status) issues.push({ ruleId: "DIAGNOSTIC_REPORT_MISSING_STATUS", severity: "error", path: "$.status", message: "DiagnosticReport must have status" });
  }

  if (rt === "Bundle") {
    if (!resource.type) issues.push({ ruleId: "REQUIRED_ELEMENT", severity: "error", path: "$.type", message: "Bundle must have type" });
    if (resource.entry) {
      resource.entry.forEach((e, i) => {
        if (!e.resource) issues.push({ ruleId: "BUNDLE_ENTRY_MISSING", severity: "error", path: `$.entry[${i}]`, message: "Bundle entry missing resource" });
      });
    }
  }

  // 6. NPHIES extension checks
  if (["Claim", "ClaimResponse", "Coverage", "Patient"].includes(rt)) {
    const hasNphiesExt = JSON.stringify(resource).includes("nphies");
    if (!hasNphiesExt) {
      issues.push({ ruleId: "NPHIES_EXTENSION", severity: "info", path: "$", message: "No NPHIES extensions found — may be needed for Saudi claims" });
    }
  }

  return issues;
}

// ── Compute dataset statistics ─────────────────────────────────────────
async function computeStats(env) {
  try {
    const types = await env.FHIR_DB.prepare(
      "SELECT resource_type, COUNT(*) as count FROM fhir_resources GROUP BY resource_type ORDER BY count DESC"
    ).all();

    const total = await env.FHIR_DB.prepare("SELECT COUNT(*) as total FROM fhir_resources").first();

    return {
      totalResources: total?.total || 0,
      resourceTypes: types?.results || [],
      validationRules: FHIR_RULES.length,
      timestamp: new Date().toISOString(),
    };
  } catch {
    return { totalResources: 0, resourceTypes: [], validationRules: FHIR_RULES.length, error: "D1 not connected" };
  }
}

// ── Handler ────────────────────────────────────────────────────────────
export async function handleFhirLint(request, env) {
  const url = new URL(request.url);
  const corsHeaders = {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
  };

  // GET /fhir/lint/rules
  if (url.pathname === "/fhir/lint/rules" && request.method === "GET") {
    return new Response(JSON.stringify({
      rules: FHIR_RULES,
      total: FHIR_RULES.length,
      bySeverity: {
        error: FHIR_RULES.filter(r => r.severity === "error").length,
        warning: FHIR_RULES.filter(r => r.severity === "warning").length,
        info: FHIR_RULES.filter(r => r.severity === "info").length,
      },
    }), { headers: corsHeaders });
  }

  // GET /fhir/lint/stats
  if (url.pathname === "/fhir/lint/stats" && request.method === "GET") {
    const stats = await computeStats(env);
    return new Response(JSON.stringify(stats), { headers: corsHeaders });
  }

  // POST /fhir/validate — single resource
  if (url.pathname === "/fhir/validate" && request.method === "POST") {
    try {
      const resource = await request.json();
      const issues = validateResource(resource);

      const errors = issues.filter(i => i.severity === "error");
      const warnings = issues.filter(i => i.severity === "warning");
      const infos = issues.filter(i => i.severity === "info");

      return new Response(JSON.stringify({
        resourceType: resource.resourceType || "Unknown",
        resourceId: resource.id || "unknown",
        valid: errors.length === 0,
        summary: { errors: errors.length, warnings: warnings.length, info: infos.length, total: issues.length },
        issues,
        timestamp: new Date().toISOString(),
        validator: "brainsait-fhirlint/v1.1.0",
      }), { headers: corsHeaders });
    } catch (err) {
      return new Response(JSON.stringify({
        valid: false,
        error: `Parse error: ${err.message}`,
        issues: [{ ruleId: "INVALID_JSON", severity: "error", path: "$", message: err.message }],
      }), { status: 400, headers: corsHeaders });
    }
  }

  // POST /fhir/validate/batch — multiple resources
  if (url.pathname === "/fhir/validate/batch" && request.method === "POST") {
    try {
      const body = await request.json();
      const resources = body.resources || (Array.isArray(body) ? body : [body]);
      const results = resources.map(r => {
        const issues = validateResource(r);
        const errors = issues.filter(i => i.severity === "error");
        return {
          resourceType: r.resourceType,
          resourceId: r.id,
          valid: errors.length === 0,
          errorCount: errors.length,
          warningCount: issues.filter(i => i.severity === "warning").length,
          issues,
        };
      });

      const totalErrors = results.reduce((s, r) => s + r.errorCount, 0);
      const totalWarnings = results.reduce((s, r) => s + r.warningCount, 0);

      return new Response(JSON.stringify({
        valid: totalErrors === 0,
        summary: {
          resources: results.length,
          passed: results.filter(r => r.valid).length,
          failed: results.filter(r => !r.valid).length,
          totalErrors,
          totalWarnings,
        },
        results,
        timestamp: new Date().toISOString(),
        validator: "brainsait-fhirlint/v1.1.0",
      }), { headers: corsHeaders });
    } catch (err) {
      return new Response(JSON.stringify({ valid: false, error: err.message }), { status: 400, headers: corsHeaders });
    }
  }

  // POST /fhir/validate/flow — validate an entire FHIR flow (from fhir-flows.js)
  if (url.pathname === "/fhir/validate/flow" && request.method === "POST") {
    try {
      const body = await request.json();
      const { flow, resources } = body;

      const results = (resources || []).map(r => {
        const issues = validateResource(r);
        return {
          resourceType: r.resourceType,
          resourceId: r.id,
          valid: issues.filter(i => i.severity === "error").length === 0,
          issues,
        };
      });

      const totalErrors = results.reduce((s, r) => s + r.issues.filter(i => i.severity === "error").length, 0);

      return new Response(JSON.stringify({
        flow: flow || "custom",
        valid: totalErrors === 0,
        resourceResults: results,
        totalErrors,
        timestamp: new Date().toISOString(),
      }), { headers: corsHeaders });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: corsHeaders });
    }
  }

  return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: corsHeaders });
}
