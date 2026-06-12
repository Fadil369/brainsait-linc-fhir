export class IrisConnector {
  constructor(env) {
    this.env = env;
    this.baseUrl = env.IRIS_API_BASE || "http://localhost:52773";
    this.fhirEndpoint = env.IRIS_FHIR_ENDPOINT || "/csp/brainsait/fhir";
    this.username = env.IRIS_USERNAME || "_SYSTEM";
    this.password = env.IRIS_PASSWORD || "BrainSAIT2026!";
    this.d1 = env.FHIR_DB;
  }

  async request(method, path, body = null) {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": "Basic " + btoa(`${this.username}:${this.password}`),
    };

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (error) {
      return { ok: false, status: 502, data: { resourceType: "OperationOutcome", issue: [{ severity: "error", diagnostics: `IRIS connection failed: ${error.message}` }] } };
    }
  }

  async fhirRead(resourceType, id) {
    return this.request("GET", `${this.fhirEndpoint}/${resourceType}/${id}`);
  }

  async fhirSearch(resourceType, params = {}) {
    const query = Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");
    return this.request("GET", `${this.fhirEndpoint}/${resourceType}?${query}`);
  }

  async fhirCreate(resourceType, resource) {
    return this.request("POST", `${this.fhirEndpoint}/${resourceType}`, resource);
  }

  async queryD1(resourceType, patientId) {
    if (!this.d1) return [];
    try {
      const { results } = await this.d1.prepare(
        "SELECT data FROM fhir_resources WHERE resource_type = ? AND patient_id = ?"
      ).bind(resourceType, patientId).all();
      return results.map(r => JSON.parse(r.data));
    } catch {
      return [];
    }
  }

  async getPatient(patientId) {
    const result = await this.fhirRead("Patient", patientId);
    if (result.ok) return result.data;
    const search = await this.fhirSearch("Patient", { identifier: patientId });
    if (search.ok && search.data.entry?.length) return search.data.entry[0].resource;
    const fallback = await this.queryD1("Patient", patientId);
    return fallback[0] || null;
  }

  async getConditions(patientId) {
    const result = await this.fhirSearch("Condition", { patient: `Patient/${patientId}`, "clinical-status": "active" });
    if (result.ok && result.data.entry?.length) return result.data.entry.map(e => e.resource);
    return this.queryD1("Condition", patientId);
  }

  async getMedications(patientId) {
    const result = await this.fhirSearch("MedicationRequest", { patient: `Patient/${patientId}`, status: "active" });
    if (result.ok && result.data.entry?.length) return result.data.entry.map(e => e.resource);
    return this.queryD1("MedicationRequest", patientId);
  }

  async getEncounters(patientId) {
    const result = await this.fhirSearch("Encounter", { patient: `Patient/${patientId}`, _sort: "-date", _count: "10" });
    if (result.ok && result.data.entry?.length) return result.data.entry.map(e => e.resource);
    return this.queryD1("Encounter", patientId);
  }

  async getObservations(patientId, code) {
    const params = { patient: `Patient/${patientId}`, _sort: "-date", _count: "20" };
    if (code) params.code = code;
    const result = await this.fhirSearch("Observation", params);
    if (result.ok && result.data.entry?.length) return result.data.entry.map(e => e.resource);
    return this.queryD1("Observation", patientId);
  }

  async getAllergies(patientId) {
    const result = await this.fhirSearch("AllergyIntolerance", { patient: `Patient/${patientId}`, "clinical-status": "active" });
    if (result.ok && result.data.entry?.length) return result.data.entry.map(e => e.resource);
    return this.queryD1("AllergyIntolerance", patientId);
  }

  async getCarePlans(patientId) {
    const result = await this.fhirSearch("CarePlan", { patient: `Patient/${patientId}`, status: "active" });
    if (result.ok && result.data.entry?.length) return result.data.entry.map(e => e.resource);
    return this.queryD1("CarePlan", patientId);
  }

  async getImmunizations(patientId) {
    const result = await this.fhirSearch("Immunization", { patient: `Patient/${patientId}`, _sort: "-date" });
    if (result.ok && result.data.entry?.length) return result.data.entry.map(e => e.resource);
    return this.queryD1("Immunization", patientId);
  }

  async healthCheck() {
    const result = await this.request("GET", `${this.fhirEndpoint}/metadata`);
    if (result.ok) return true;
    return this.d1 !== undefined;
  }
}
