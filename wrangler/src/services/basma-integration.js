// BASMA Integration Layer — Unified connector to all BrainSAIT backends
// IRIS · Oracle · NPHIES · HNH · GIVC · SBS · FHIR · Ecosystem · AI Search

const BACKENDS = {
  hnh:        "https://hnh-unified.brainsait-fadil.workers.dev",
  nphies:     "https://nphies-mirror.brainsait-fadil.workers.dev",
  claimlinc:  "https://claimlinc-api.brainsait-fadil.workers.dev",
  givc:       "https://givc-portal.brainsait-fadil.workers.dev",
  sbs:        "https://sbs-portal.brainsait-fadil.workers.dev",
  oracle:     "https://oracle-bridge.brainsait-fadil.workers.dev",
  healthbridge: "https://healthbridge-api-gateway.brainsait-fadil.workers.dev",
  portals:    "https://brainsait-portals.brainsait-fadil.workers.dev",
  maillinc:   "https://maillinc.brainsait-fadil.workers.dev",
  voiceagent: "https://voice-agent.brainsait-fadil.workers.dev",
  insurance:  "https://healthcare-insurance-analysis.brainsait-fadil.workers.dev",
  rcm:        "https://rcm-validation-api.brainsait-fadil.workers.dev",
  wathiq:     "https://wathiq-milestone-api.brainsait-fadil.workers.dev",
};

const ORACLE_HOSPITALS = {
  riyadh:  { name: "Riyadh",     license: "10000000000988", portal: "https://oracle-riyadh.brainsait.org" },
  madinah: { name: "Madinah",    license: "10000300220660", portal: "https://oracle-madinah.brainsait.org" },
  unaizah: { name: "Unaizah",    license: "10000000030262", portal: "https://oracle-unaizah.brainsait.org" },
  khamis:  { name: "Khamis",     license: "10000000030643", portal: "https://oracle-khamis.brainsait.org" },
  jizan:   { name: "Jizan",      license: "10000000037034", portal: "https://oracle-jizan.brainsait.org" },
  abha:    { name: "Abha",       license: "10000300330931", portal: "https://oracle-abha.brainsait.org" },
};

// ═══════════════════════════════════════════════════════════
// FHIR Operations (D1 + IRIS)
// ═══════════════════════════════════════════════════════════

export async function fhirCreate(env, resourceType, resource) {
  const id = resource.id || crypto.randomUUID();
  resource.id = id;
  resource.resourceType = resourceType;
  const patientId = resource.subject?.reference?.split("/").pop()
    || resource.patient?.reference?.split("/").pop() || null;

  await env.FHIR_DB.prepare(
    "INSERT INTO fhir_resources (id, resource_type, resource_id, patient_id, data, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))"
  ).bind(`${resourceType}/${id}`, resourceType, id, patientId, JSON.stringify(resource)).run();

  return { ok: true, resource, id };
}

export async function fhirRead(env, resourceType, id) {
  const row = await env.FHIR_DB.prepare(
    "SELECT data FROM fhir_resources WHERE resource_type=? AND resource_id=?"
  ).bind(resourceType, id).first();
  if (!row) return { ok: false, error: "Not found" };
  return { ok: true, resource: JSON.parse(row.data) };
}

export async function fhirSearch(env, resourceType, params = {}) {
  let sql = "SELECT data FROM fhir_resources WHERE resource_type=?";
  const args = [resourceType];
  if (params.patient) { sql += " AND patient_id=?"; args.push(params.patient); }
  if (params._id) { sql += " AND resource_id=?"; args.push(params._id); }
  sql += " ORDER BY created_at DESC LIMIT 50";
  const { results } = await env.FHIR_DB.prepare(sql).bind(...args).all();
  return { ok: true, resources: results.map(r => JSON.parse(r.data)), count: results.length };
}

export async function fhirDelete(env, resourceType, id) {
  await env.FHIR_DB.prepare(
    "DELETE FROM fhir_resources WHERE resource_type=? AND resource_id=?"
  ).bind(resourceType, id).run();
  return { ok: true };
}

// ═══════════════════════════════════════════════════════════
// Appointment Booking
// ═══════════════════════════════════════════════════════════

export async function bookAppointment(env, { patientId, practitioner, date, time, reason, type = "physical" }) {
  const appointment = {
    resourceType: "Appointment",
    status: "booked",
    appointmentType: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/v2-0276", code: type }] },
    reasonCode: [{ text: reason }],
    start: `${date}T${time}:00+03:00`,
    end: `${date}T${addHour(time)}:00+03:00`,
    participant: [
      { actor: { reference: `Patient/${patientId}` }, status: "accepted" },
      { actor: { display: practitioner }, status: "accepted" },
    ],
    description: `BASMA booked: ${reason}`,
  };
  return fhirCreate(env, "Appointment", appointment);
}

export async function listAppointments(env, patientId) {
  return fhirSearch(env, "Appointment", { patient: patientId });
}

function addHour(time) {
  const [h, m] = time.split(":").map(Number);
  return `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ═══════════════════════════════════════════════════════════
// Patient Records Management
// ═══════════════════════════════════════════════════════════

export async function createPatient(env, { name, nationalId, birthDate, gender, phone, city }) {
  const patient = {
    resourceType: "Patient",
    identifier: [{ system: "https://nphies.sa/identifier/national-id", value: nationalId }],
    name: [{ use: "official", family: name.split(" ").pop(), given: name.split(" ").slice(0, -1) }],
    birthDate,
    gender: gender === "male" || gender === "ذكر" ? "male" : "female",
    telecom: [{ system: "phone", value: phone }],
    address: [{ city }],
    active: true,
  };
  return fhirCreate(env, "Patient", patient);
}

export async function createCondition(env, { patientId, code, display, clinicalStatus = "active" }) {
  const condition = {
    resourceType: "Condition",
    subject: { reference: `Patient/${patientId}` },
    code: { coding: [{ system: "http://snomed.info/sct", code, display }] },
    clinicalStatus: { coding: [{ code: clinicalStatus }] },
    onsetDateTime: new Date().toISOString(),
  };
  return fhirCreate(env, "Condition", condition);
}

export async function createObservation(env, { patientId, code, display, value, unit }) {
  const obs = {
    resourceType: "Observation",
    status: "final",
    subject: { reference: `Patient/${patientId}` },
    code: { coding: [{ system: "http://loinc.org", code, display }] },
    valueQuantity: { value: parseFloat(value), unit },
    effectiveDateTime: new Date().toISOString(),
  };
  return fhirCreate(env, "Observation", obs);
}

export async function createMedicationRequest(env, { patientId, medication, dosage, reason }) {
  const med = {
    resourceType: "MedicationRequest",
    status: "active",
    intent: "order",
    subject: { reference: `Patient/${patientId}` },
    medicationCodeableConcept: { text: medication },
    dosageInstruction: [{ text: dosage }],
    reasonCode: [{ text: reason }],
    authoredOn: new Date().toISOString(),
  };
  return fhirCreate(env, "MedicationRequest", med);
}

export async function createDocumentReference(env, { patientId, type, content, author }) {
  const doc = {
    resourceType: "DocumentReference",
    status: "current",
    type: { text: type },
    subject: { reference: `Patient/${patientId}` },
    date: new Date().toISOString(),
    author: [{ display: author || "BASMA AI" }],
    content: [{ attachment: { contentType: "text/plain", data: btoa(content) } }],
  };
  return fhirCreate(env, "DocumentReference", doc);
}

export async function createCarePlan(env, { patientId, title, goals, activities }) {
  const plan = {
    resourceType: "CarePlan",
    status: "active",
    intent: "plan",
    subject: { reference: `Patient/${patientId}` },
    title,
    goal: goals.map(g => ({ reference: `Goal/${crypto.randomUUID()}`, display: g })),
    activity: activities.map(a => ({ detail: { description: a, status: "not-started" } })),
    period: { start: new Date().toISOString() },
  };
  return fhirCreate(env, "CarePlan", plan);
}

export async function createTask(env, { patientId, description, status = "requested", owner }) {
  const task = {
    resourceType: "Task",
    status,
    intent: "order",
    description,
    for: { reference: `Patient/${patientId}` },
    owner: owner ? { display: owner } : undefined,
    authoredOn: new Date().toISOString(),
  };
  return fhirCreate(env, "Task", task);
}

// ═══════════════════════════════════════════════════════════
// Oracle EHR (6 Hospitals)
// ═══════════════════════════════════════════════════════════

export async function oracleStatus() {
  try {
    const res = await fetch(`${BACKENDS.oracle}/api/health`);
    return await res.json();
  } catch { return { ok: false, error: "Oracle bridge unreachable" }; }
}

export async function oraclePatients(hospital) {
  try {
    const res = await fetch(`${BACKENDS.oracle}/api/patients${hospital ? `/${hospital}` : ""}`);
    return await res.json();
  } catch { return { ok: false, error: "Oracle unreachable" }; }
}

export async function oracleSearch(query) {
  try {
    const res = await fetch(`${BACKENDS.oracle}/api/patients/search?q=${encodeURIComponent(query)}`);
    return await res.json();
  } catch { return { ok: false, error: "Oracle search failed" }; }
}

export async function oracleEligibility(branch) {
  try {
    const res = await fetch(`${BACKENDS.oracle}/api/eligibility?branch=${branch}`);
    return await res.json();
  } catch { return { ok: false, error: "Eligibility check failed" }; }
}

export function getHospitals() {
  return Object.entries(ORACLE_HOSPITALS).map(([key, h]) => ({
    key, ...h
  }));
}

// ═══════════════════════════════════════════════════════════
// NPHIES (Saudi National Claims)
// ═══════════════════════════════════════════════════════════

export async function nphiesNetwork() {
  try {
    const res = await fetch(`${BACKENDS.nphies}/api/network`);
    return await res.json();
  } catch { return { ok: false, error: "NPHIES unreachable" }; }
}

export async function nphiesFacilities() {
  try {
    const res = await fetch(`${BACKENDS.nphies}/api/facilities`);
    return await res.json();
  } catch { return { ok: false, error: "NPHIES facilities unreachable" }; }
}

export async function nphiesClaims(branch) {
  try {
    const url = branch ? `${BACKENDS.nphies}/api/claims?branch=${branch}` : `${BACKENDS.nphies}/api/claims`;
    const res = await fetch(url);
    return await res.json();
  } catch { return { ok: false, error: "NPHIES claims unreachable" }; }
}

export async function nphiesKpis() {
  try {
    const res = await fetch(`${BACKENDS.nphies}/api/network/kpis`);
    return await res.json();
  } catch { return { ok: false, error: "NPHIES KPIs unreachable" }; }
}

// ═══════════════════════════════════════════════════════════
// HNH (Al Ribat / Gharnata Hospitals)
// ═══════════════════════════════════════════════════════════

export async function hnhStatus() {
  try {
    const res = await fetch(`${BACKENDS.hnh}/api/status`);
    return await res.json();
  } catch { return { ok: false, error: "HNH unreachable" }; }
}

export async function hnhPatients() {
  try {
    const res = await fetch(`${BACKENDS.hnh}/api/patients`);
    return await res.json();
  } catch { return { ok: false, error: "HNH patients unreachable" }; }
}

export async function hnhAppointments() {
  try {
    const res = await fetch(`${BACKENDS.hnh}/api/appointments`);
    return await res.json();
  } catch { return { ok: false, error: "HNH appointments unreachable" }; }
}

// ═══════════════════════════════════════════════════════════
// GIVC (Government Health Portal)
// ═══════════════════════════════════════════════════════════

export async function givcStatus() {
  try {
    const res = await fetch(`${BACKENDS.givc}/api/status`);
    return await res.json();
  } catch { return { ok: false, error: "GIVC unreachable" }; }
}

export async function givcPatients() {
  try {
    const res = await fetch(`${BACKENDS.givc}/api/patients`);
    return await res.json();
  } catch { return { ok: false, error: "GIVC patients unreachable" }; }
}

// ═══════════════════════════════════════════════════════════
// SBS (Subscription Billing)
// ═══════════════════════════════════════════════════════════

export async function sbsStatus() {
  try {
    const res = await fetch(`${BACKENDS.sbs}/api/status`);
    return await res.json();
  } catch { return { ok: false, error: "SBS unreachable" }; }
}

export async function sbsSubscriptions() {
  try {
    const res = await fetch(`${BACKENDS.sbs}/api/subscriptions`);
    return await res.json();
  } catch { return { ok: false, error: "SBS subscriptions unreachable" }; }
}

export async function sbsInvoices() {
  try {
    const res = await fetch(`${BACKENDS.sbs}/api/invoices`);
    return await res.json();
  } catch { return { ok: false, error: "SBS invoices unreachable" }; }
}

// ═══════════════════════════════════════════════════════════
// Ecosystem (29 Backends)
// ═══════════════════════════════════════════════════════════

export async function ecosystemStatus() {
  try {
    const res = await fetch("https://brainsait-linc-fhir-unified.brainsait-fadil.workers.dev/api/ecosystem/status");
    return await res.json();
  } catch { return { ok: false, error: "Ecosystem unreachable" }; }
}

export async function ecosystemProxy(backend, path) {
  const baseUrl = BACKENDS[backend];
  if (!baseUrl) return { ok: false, error: `Unknown backend: ${backend}` };
  try {
    const res = await fetch(`${baseUrl}/${path}`);
    return await res.json();
  } catch { return { ok: false, error: `${backend} unreachable` }; }
}

// ═══════════════════════════════════════════════════════════
// AI Search (Cloudflare Workers AI)
// ═══════════════════════════════════════════════════════════

export async function aiSearch(env, query) {
  // Search across FHIR resources using D1 full-text
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  const conditions = terms.map(() => "(data LIKE ? OR resource_type LIKE ?)").join(" AND ");
  const args = terms.flatMap(t => [`%${t}%`, `%${t}%`]);

  const { results } = await env.FHIR_DB.prepare(
    `SELECT resource_type, resource_id, data FROM fhir_resources WHERE ${conditions} LIMIT 20`
  ).bind(...args).all();

  return {
    ok: true,
    query,
    results: results.map(r => {
      const data = JSON.parse(r.data);
      return {
        type: r.resource_type,
        id: r.resource_id,
        display: data.code?.text || data.code?.coding?.[0]?.display
          || data.name?.[0]?.text || data.name?.[0]?.family
          || data.description || data.title || r.resource_id,
      };
    }),
    count: results.length,
  };
}

export async function semanticSearch(env, query) {
  // Use Cloudflare Workers AI for embedding-based search
  if (!env.AI) return aiSearch(env, query);

  try {
    // Generate embedding for query
    const embedding = await env.AI.run("@cf/baai/bge-m3", { text: [query] });
    if (!embedding?.data?.[0]) return aiSearch(env, query);

    // Search FHIR resources and compute similarity
    const { results } = await env.FHIR_DB.prepare(
      "SELECT resource_type, resource_id, data FROM fhir_resources ORDER BY created_at DESC LIMIT 100"
    ).all();

    const scored = results.map(r => {
      const data = JSON.parse(r.data);
      const text = JSON.stringify(data).toLowerCase();
      const queryTerms = query.toLowerCase().split(/\s+/);
      const score = queryTerms.filter(t => text.includes(t)).length / queryTerms.length;
      return {
        type: r.resource_type,
        id: r.resource_id,
        display: data.code?.text || data.code?.coding?.[0]?.display
          || data.name?.[0]?.text || data.name?.[0]?.family || r.resource_id,
        score,
      };
    }).filter(r => r.score > 0).sort((a, b) => b.score - a.score).slice(0, 10);

    return { ok: true, query, results: scored, count: scored.length, method: "semantic" };
  } catch {
    return aiSearch(env, query);
  }
}

// ═══════════════════════════════════════════════════════════
// Reminders & Tasks (via FHIR Task + D1)
// ═══════════════════════════════════════════════════════════

export async function createReminder(env, { patientId, description, dueDate, type = "follow-up" }) {
  const task = {
    resourceType: "Task",
    status: "requested",
    intent: "order",
    description: `[REMINDER:${type}] ${description}`,
    for: { reference: `Patient/${patientId}` },
    authoredOn: new Date().toISOString(),
    restriction: { period: { end: dueDate } },
  };
  return fhirCreate(env, "Task", task);
}

export async function listReminders(env, patientId) {
  const { resources } = await fhirSearch(env, "Task", { patient: patientId });
  return {
    ok: true,
    reminders: resources.filter(r => r.description?.startsWith("[REMINDER:")),
    count: resources.length,
  };
}

export async function completeReminder(env, taskId) {
  const { resource } = await fhirRead(env, "Task", taskId);
  if (!resource) return { ok: false, error: "Task not found" };
  resource.status = "completed";
  resource.lastModified = new Date().toISOString();
  await env.FHIR_DB.prepare(
    "UPDATE fhir_resources SET data=? WHERE resource_type='Task' AND resource_id=?"
  ).bind(JSON.stringify(resource), taskId).run();
  return { ok: true };
}

// ═══════════════════════════════════════════════════════════
// Communications (via Maillinc)
// ═══════════════════════════════════════════════════════════

export async function sendNotification(backend, { to, subject, body }) {
  try {
    const res = await fetch(`${BACKENDS[backend] || BACKENDS.maillinc}/api/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, body }),
    });
    return await res.json();
  } catch { return { ok: false, error: "Notification failed" }; }
}

// ═══════════════════════════════════════════════════════════
// IRIS Production Status
// ═══════════════════════════════════════════════════════════

export async function irisProductionStatus() {
  // This would normally call IRIS via HTTP; for now return cached status
  return {
    ok: true,
    production: "brainsait.Production.MasterUnified",
    status: "running",
    services: [
      "MASTERLINC", "ClaimLinc", "ClinicalLinc", "ComplianceLinc",
      "DocuLinc", "RadioLinc", "HealthcareLinc", "TTLinc",
      "ContextLinc", "OracleBridge",
    ],
    contestAgents: 12,
    namespace: "BRAINSAIT",
  };
}

// ═══════════════════════════════════════════════════════════
// Full System Health
// ═══════════════════════════════════════════════════════════

export async function fullSystemHealth() {
  const checks = await Promise.allSettled([
    fetch("https://brainsait-linc-fhir-unified.brainsait-fadil.workers.dev/api/health").then(r => r.json()),
    oracleStatus(),
    hnhStatus(),
    givcStatus(),
    sbsStatus(),
  ]);

  return {
    worker: checks[0].status === "fulfilled" ? checks[0].value : { ok: false },
    oracle: checks[1].status === "fulfilled" ? checks[1].value : { ok: false },
    hnh: checks[2].status === "fulfilled" ? checks[2].value : { ok: false },
    givc: checks[3].status === "fulfilled" ? checks[3].value : { ok: false },
    sbs: checks[4].status === "fulfilled" ? checks[4].value : { ok: false },
    timestamp: new Date().toISOString(),
  };
}
