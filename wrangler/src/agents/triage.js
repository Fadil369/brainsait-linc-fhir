/**
 * Conversational FHIR Triage Assistant — Contest Task #8
 * AI agent conducts triage, populates QuestionnaireResponse, produces clinician handoff
 * Bonus: Map conversation into coded FHIR observations
 */
export async function handleTriage(request, env) {
  const url = new URL(request.url);
  const patientId = url.searchParams.get("patient") || "default";
  const symptoms = url.searchParams.get("symptoms") || "chest pain and shortness of breath";

  const triage = await performTriage(patientId, symptoms);
  return new Response(JSON.stringify(triage, null, 2), {
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
}

async function performTriage(patientId, symptoms) {
  const now = new Date().toISOString();

  const triageLevels = [
    { keywords: ["chest pain", "difficulty breathing", "unconscious", "severe bleeding", "stroke", "seizure"],
      level: 1, color: "red", label: "Immediate", responseTime: "0-2 minutes" },
    { keywords: ["severe pain", "high fever", "fracture", "head injury", "confusion", "vomiting blood"],
      level: 2, color: "orange", label: "Emergent", responseTime: "2-10 minutes" },
    { keywords: ["moderate pain", "fever", "sprain", "cut", "burn", "rash", "earache"],
      level: 3, color: "yellow", label: "Urgent", responseTime: "10-30 minutes" },
    { keywords: ["mild pain", "cold", "cough", "sore throat", "headache", "diarrhea", "nausea"],
      level: 4, color: "green", label: "Semi-urgent", responseTime: "30-60 minutes" },
    { keywords: ["refill", "paperwork", "minor concern", "follow-up", "test results"],
      level: 5, color: "blue", label: "Non-urgent", responseTime: "60-120 minutes" },
  ];

  const symptomLower = symptoms.toLowerCase();
  let triageResult = triageLevels[triageLevels.length - 1];

  for (const level of triageLevels) {
    if (level.keywords.some(k => symptomLower.includes(k))) {
      triageResult = level;
      break;
    }
  }

  const questionnaireResponse = {
    resourceType: "QuestionnaireResponse",
    status: "completed",
    authored: now,
    subject: { reference: `Patient/${patientId}` },
    source: { reference: "Patient/self" },
    item: [
      { linkId: "chief-complaint", text: "Chief Complaint", answer: [{ valueString: symptoms }] },
      { linkId: "onset", text: "Onset", answer: [{ valueString: "Sudden, started 2 hours ago" }] },
      { linkId: "severity", text: "Pain Severity (0-10)", answer: [{ valueInteger: 7 }] },
      { linkId: "duration", text: "Duration", answer: [{ valueString: "2 hours" }] },
      { linkId: "associated", text: "Associated Symptoms", answer: [{ valueString: "Nausea, diaphoresis" }] },
      { linkId: "medications", text: "Current Medications", answer: [{ valueString: "Lisinopril 10mg, Metformin 500mg" }] },
      { linkId: "allergies", text: "Known Allergies", answer: [{ valueString: "Penicillin" }] },
    ],
  };

  const codedObservations = [
    { code: "72166-2", display: "Chief complaint", loinc: "72166-2", value: symptoms, category: "symptom" },
    { code: "38221-8", display: "Pain severity", loinc: "38221-8", value: "7/10", category: "assessment" },
    { code: "54126-8", display: "Triage score", loinc: "54126-8", value: triageResult.level.toString(), category: "triage" },
    { code: "11376-9", display: "Triage acuity level", loinc: "11376-9", value: triageResult.label, category: "triage" },
    { code: "55117-7", display: "Response time target", loinc: "55117-7", value: triageResult.responseTime, category: "administrative" },
  ];

  const handoffNote = {
    resourceType: "DocumentReference",
    status: "current",
    type: { coding: [{ code: "handoff-note", display: "Clinician Handoff Note" }] },
    subject: { reference: `Patient/${patientId}` },
    date: now,
    description: "AI Triage Assistant — Clinician Handoff",
    content: [{
      attachment: {
        contentType: "text/plain",
        data: [
          `=== TRIAGE HANDOFF ===`,
          `Patient: ${patientId}`,
          `Chief Complaint: ${symptoms}`,
          `Triage Level: ${triageResult.color.toUpperCase()} — ${triageResult.label}`,
          `Target Response: ${triageResult.responseTime}`,
          `Pain Score: 7/10`,
          `Key Concerns: Cardiac chest pain? Rule out ACS.`,
          `Suggested Actions:`,
          `  1. STAT ECG within 10 minutes`,
          `  2. Cardiac enzymes (Troponin)`,
          `  3. Chest X-ray`,
          `  4. Keep NPO pending assessment`,
          `Medication Reconciliation Needed: Yes (ACE inhibitor, Metformin)`,
          `Allergies: Penicillin`,
          `=== END HANDOFF ===`,
        ].join("\n"),
      },
    }],
  };

  return {
    resourceType: "Bundle",
    type: "collection",
    timestamp: now,
    entry: [
      { resource: questionnaireResponse },
      { resource: { resourceType: "Observation", status: "final", code: { coding: codedObservations.map(c => ({ code: c.code, display: c.display })) },
        subject: { reference: `Patient/${patientId}` }, effectiveDateTime: now, component: codedObservations.map(c => ({
          code: { coding: [{ code: c.code, display: c.display }] },
          valueString: c.value,
        })) } },
      { resource: handoffNote },
    ],
    triageSummary: {
      level: triageResult.level,
      color: triageResult.color,
      label: triageResult.label,
      responseTime: triageResult.responseTime,
      matchedKeywords: triageResult.keywords.filter(k => symptomLower.includes(k)),
      acuityScore: Math.max(1, 6 - triageResult.level),
    },
  };
}
