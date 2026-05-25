/**
 * Natural Language to FHIR Query Explorer — Contest Task #11
 * Converts plain-language questions into structured FHIR queries
 * Bonus: Display generated queries for transparency
 */
export async function handleNLQuery(request, env) {
  const url = new URL(request.url);
  const question = url.searchParams.get("q") || "Show me all diabetic patients with HbA1c over 7";
  const patientId = url.searchParams.get("patient") || "default";

  const result = await translateQuery(question, patientId);
  return new Response(JSON.stringify(result, null, 2), {
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
}

async function translateQuery(question, patientId) {
  const now = new Date().toISOString();
  const q = question.toLowerCase();

  const intentPatterns = [
    {
      keywords: ["diabetic", "diabetes", "hba1c", "a1c", "blood sugar"],
      intent: "find_patients_by_lab",
      fhirQuery: "Observation?code=http://loinc.org|4548-4&value-quantity=gt7.0&_sort=-date",
      sqlQuery: "SELECT Patient.Name, Patient.MRN, MAX(Observation.Value) as LatestHbA1c FROM Observation JOIN Patient ON Observation.PatientId = Patient.Id WHERE Observation.Code = '4548-4' GROUP BY Patient.Id HAVING LatestHbA1c > 7.0",
    },
    {
      keywords: ["medication", "prescription", "drug", "prescribed", "taking"],
      intent: "list_medications",
      fhirQuery: "MedicationRequest?patient=Patient/{{patientId}}&status=active",
      sqlQuery: "SELECT MedicationRequest.MedicationName, MedicationRequest.Dose, MedicationRequest.Frequency FROM MedicationRequest WHERE MedicationRequest.PatientId = '{{patientId}}' AND MedicationRequest.Status = 'active'",
    },
    {
      keywords: ["allergy", "allergic", "sulfa", "penicillin", "reaction"],
      intent: "list_allergies",
      fhirQuery: "AllergyIntolerance?patient=Patient/{{patientId}}&clinical-status=active",
      sqlQuery: "SELECT AllergyIntolerance.Substance, AllergyIntolerance.Reaction, AllergyIntolerance.Severity FROM AllergyIntolerance WHERE AllergyIntolerance.PatientId = '{{patientId}}' AND AllergyIntolerance.Status = 'active'",
    },
    {
      keywords: ["appointment", "visit", "encounter", "seen", "appointment"],
      intent: "upcoming_appointments",
      fhirQuery: "Appointment?patient=Patient/{{patientId}}&status=booked&date=gt{{today}}",
      sqlQuery: "SELECT Appointment.Date, Appointment.Type, Appointment.Provider, Appointment.Location FROM Appointment WHERE Appointment.PatientId = '{{patientId}}' AND Appointment.Status = 'booked' AND Appointment.Date > CURRENT_DATE",
    },
    {
      keywords: ["lab", "test", "result", "blood work", "panel"],
      intent: "recent_labs",
      fhirQuery: "Observation?patient=Patient/{{patientId}}&_sort=-date&_count=20",
      sqlQuery: "SELECT Observation.Code, Observation.DisplayName, Observation.Value, Observation.Unit, Observation.Date FROM Observation WHERE Observation.PatientId = '{{patientId}}' ORDER BY Observation.Date DESC LIMIT 20",
    },
    {
      keywords: ["admit", "hospital", "discharge", "readmission", "stay"],
      intent: "hospitalization_history",
      fhirQuery: "Encounter?patient=Patient/{{patientId}}&class=inpatient&_sort=-date",
      sqlQuery: "SELECT Encounter.StartDate, Encounter.EndDate, Encounter.ReasonCode, Encounter.DischargeDisposition FROM Encounter WHERE Encounter.PatientId = '{{patientId}}' AND Encounter.Class = 'inpatient' ORDER BY Encounter.StartDate DESC",
    },
    {
      keywords: ["vaccine", "vaccination", "immunization", "shot", "flu"],
      intent: "vaccination_history",
      fhirQuery: "Immunization?patient=Patient/{{patientId}}&_sort=-date",
      sqlQuery: "SELECT Immunization.VaccineCode, Immunization.Date, Immunization.LotNumber FROM Immunization WHERE Immunization.PatientId = '{{patientId}}' ORDER BY Immunization.Date DESC",
    },
    {
      keywords: ["condition", "diagnosis", "problem", "chronic", "icd"],
      intent: "active_conditions",
      fhirQuery: "Condition?patient=Patient/{{patientId}}&clinical-status=active",
      sqlQuery: "SELECT Condition.Code, Condition.DisplayName, Condition.OnsetDate, Condition.ClinicalStatus FROM Condition WHERE Condition.PatientId = '{{patientId}}' AND Condition.ClinicalStatus = 'active'",
    },
  ];

  let matched = intentPatterns.find(p => p.keywords.some(k => q.includes(k)));
  if (!matched) {
    matched = {
      keywords: [],
      intent: "general_fhir_search",
      fhirQuery: `Patient?_query=${encodeURIComponent(question)}`,
      sqlQuery: `-- Unable to generate specific SQL. Try: SELECT * FROM Patient WHERE ...`,
    };
  }

  const resolvedFHIR = matched.fhirQuery.replace("{{patientId}}", patientId).replace("{{today}}", new Date().toISOString().split("T")[0]);
  const resolvedSQL = matched.sqlQuery.replace("{{patientId}}", patientId);

  return {
    resourceType: "Parameters",
    parameter: [
      { name: "originalQuestion", valueString: question },
      { name: "intent", valueCode: matched.intent },
      { name: "matchedKeywords", valueString: JSON.stringify(matched.keywords.filter(k => q.includes(k))) },
      { name: "fhirQuery", valueString: resolvedFHIR },
      { name: "sqlQuery", valueString: resolvedSQL },
      { name: "generatedAt", valueDateTime: now },
      { name: "confidence", valueDecimal: matched.keywords.length > 0 ? 0.85 : 0.3 },
      { name: "previewSql", valueString: `EXPLAIN ${resolvedSQL}` },
      { name: "transparencyNote", valueString: "This query was automatically generated based on pattern matching of your natural language question. Review before executing." },
    ],
    generatedQuery: {
      naturalLanguage: question,
      intent: matched.intent,
      fhir: resolvedFHIR,
      sql: resolvedSQL,
      alternatives: intentPatterns.filter(p => p.intent !== matched.intent).slice(0, 3).map(p => ({ intent: p.intent, fhir: p.fhirQuery.replace("{{patientId}}", patientId) })),
    },
  };
}
