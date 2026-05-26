/**
 * BrainSAIT FHIR R4 Server — Built on D1
 * Real patient persistence for all 12 contest agents
 * Routes: /fhir/*  →  CRUD operations on D1
 * Database: brainsait-healthcare-d1 (0def24ea)
 */
const RESOURCE_TYPES = ["Patient", "Observation", "Condition", "MedicationRequest", "Encounter",
  "Claim", "ClaimResponse", "CarePlan", "Goal", "Task", "DocumentReference", "AllergyIntolerance",
  "Immunization", "ImagingStudy", "DiagnosticReport", "Coverage", "Appointment", "Organization",
  "Practitioner", "AuditEvent"];

async function initDB(env) {
  if (!env.FHIR_DB) return false;
  try {
    await env.FHIR_DB.prepare(
      "CREATE TABLE IF NOT EXISTS fhir_resources (id TEXT PRIMARY KEY, resource_type TEXT NOT NULL, resource_id TEXT NOT NULL, data TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')))"
    ).run();
    await env.FHIR_DB.prepare(
      "CREATE INDEX IF NOT EXISTS idx_fhir_type ON fhir_resources(resource_type)"
    ).run();
    await env.FHIR_DB.prepare(
      "CREATE INDEX IF NOT EXISTS idx_fhir_type_id ON fhir_resources(resource_type, resource_id)"
    ).run();
    return true;
  } catch (e) {
    return false;
  }
}

export async function handleFHIR(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  const dbReady = await initDB(env);

  // Capability Statement
  if (path === "/fhir/metadata" || path === "/fhir" || path === "/metadata") {
    return new Response(JSON.stringify({
      resourceType: "CapabilityStatement",
      status: "active",
      date: new Date().toISOString().split("T")[0],
      publisher: "BrainSAIT",
      kind: "instance",
      software: { name: "BrainSAIT FHIR R4", version: "3.2.0", releaseDate: "2026-05-25" },
      implementation: { description: "BrainSAIT Unified FHIR Server", url: "https://iris-fhir.brainsait.org/fhir" },
      fhirVersion: "4.0.1",
      format: ["application/fhir+json"],
      rest: [{
        mode: "server",
        resource: RESOURCE_TYPES.map(rt => ({
          type: rt,
          interaction: [
            { code: "read" }, { code: "search-type" }, { code: "create" }, { code: "update" }
          ],
          searchParam: [
            { name: "_id", type: "token" },
            { name: "patient", type: "reference" },
            { name: "subject", type: "reference" },
            { name: "code", type: "token" },
            { name: "status", type: "token" },
            { name: "date", type: "date" },
          ],
        })),
      }],
      dbConnected: dbReady,
      db: dbReady ? "brainsait-healthcare-d1" : "not connected",
    }, null, 2), {
      headers: { "content-type": "application/fhir+json", "access-control-allow-origin": "*" },
    });
  }

  if (!dbReady) {
    return new Response(JSON.stringify({
      resourceType: "OperationOutcome",
      issue: [{ severity: "error", code: "processing", diagnostics: "FHIR database not configured. Set FHIR_DB binding in wrangler.toml" }],
    }), {
      status: 500,
      headers: { "content-type": "application/fhir+json", "access-control-allow-origin": "*" },
    });
  }

  // POST /fhir/:type — Create resource
  const createMatch = path.match(/^\/fhir\/([A-Z][a-zA-Z]+)$/);
  if (createMatch && method === "POST") {
    const resourceType = createMatch[1];
    if (!RESOURCE_TYPES.includes(resourceType)) {
      return new Response(JSON.stringify({
        resourceType: "OperationOutcome",
        issue: [{ severity: "error", code: "not-supported", diagnostics: `Resource type ${resourceType} not supported` }],
      }), { status: 400, headers: { "content-type": "application/fhir+json", "access-control-allow-origin": "*" } });
    }

    try {
      const body = await request.json();
      const resourceId = body.id || crypto.randomUUID();
      body.id = resourceId;
      body.resourceType = resourceType;

      await env.FHIR_DB.prepare(
        "INSERT OR REPLACE INTO fhir_resources (id, resource_type, resource_id, data) VALUES (?, ?, ?, ?)"
      ).bind(resourceId, resourceType, resourceId, JSON.stringify(body)).run();

      return new Response(JSON.stringify(body), {
        status: 201,
        headers: {
          "content-type": "application/fhir+json",
          "location": `https://iris-fhir.brainsait.org/fhir/${resourceType}/${resourceId}`,
          "access-control-allow-origin": "*",
        },
      });
    } catch (e) {
      return new Response(JSON.stringify({
        resourceType: "OperationOutcome",
        issue: [{ severity: "error", code: "exception", diagnostics: e.message }],
      }), { status: 500, headers: { "content-type": "application/fhir+json", "access-control-allow-origin": "*" } });
    }
  }

  // GET /fhir/:type/:id — Read resource
  const readMatch = path.match(/^\/fhir\/([A-Z][a-zA-Z]+)\/([^/]+)$/);
  if (readMatch && method === "GET") {
    const [_, resourceType, resourceId] = readMatch;
    const result = await env.FHIR_DB.prepare(
      "SELECT data FROM fhir_resources WHERE resource_type = ? AND resource_id = ?"
    ).bind(resourceType, resourceId).first();

    if (!result) {
      return new Response(JSON.stringify({
        resourceType: "OperationOutcome",
        issue: [{ severity: "error", code: "not-found", diagnostics: `${resourceType}/${resourceId} not found` }],
      }), { status: 404, headers: { "content-type": "application/fhir+json", "access-control-allow-origin": "*" } });
    }

    return new Response(result.data, {
      headers: { "content-type": "application/fhir+json", "access-control-allow-origin": "*" },
    });
  }

  // GET /fhir/:type — Search resources
  if (createMatch && method === "GET") {
    const resourceType = createMatch[1];
    const patientRef = url.searchParams.get("patient") || url.searchParams.get("subject");
    const searchId = url.searchParams.get("_id");
    let query = "SELECT data FROM fhir_resources WHERE resource_type = ?";
    const params = [resourceType];

    if (patientRef) { query += " AND json_extract(data, '$.subject.reference') = ?"; params.push(patientRef); }
    if (searchId) { query += " AND resource_id = ?"; params.push(searchId); }

    query += " ORDER BY created_at DESC LIMIT 50";
    const results = await env.FHIR_DB.prepare(query).bind(...params).all();

    return new Response(JSON.stringify({
      resourceType: "Bundle",
      type: "searchset",
      total: results.results.length,
      entry: results.results.map(r => ({ resource: JSON.parse(r.data) })),
    }, null, 2), {
      headers: { "content-type": "application/fhir+json", "access-control-allow-origin": "*" },
    });
  }

  // DELETE /fhir/:type/:id
  if (readMatch && method === "DELETE") {
    const [_, resourceType, resourceId] = readMatch;
    await env.FHIR_DB.prepare(
      "DELETE FROM fhir_resources WHERE resource_type = ? AND resource_id = ?"
    ).bind(resourceType, resourceId).run();

    return new Response(null, { status: 204, headers: { "access-control-allow-origin": "*" } });
  }

  return new Response(JSON.stringify({
    resourceType: "OperationOutcome",
    issue: [{ severity: "information", code: "not-supported", diagnostics: `Unsupported FHIR operation: ${method} ${path}` }],
  }), { status: 400, headers: { "content-type": "application/fhir+json", "access-control-allow-origin": "*" } });
}
