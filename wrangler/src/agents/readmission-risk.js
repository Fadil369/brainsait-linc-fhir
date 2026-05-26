/**
 * Hospital Readmission Risk Workbench — Contest Task #7
 * Estimates 30-day readmission risk and proposes intervention tasks
 * Bonus: Suggest next steps as FHIR Task or CarePlan resources
 */
export async function handleReadmissionRisk(request, env) {
  const url = new URL(request.url);
  const patientId = url.searchParams.get("patient") || "default";

  const risk = await assessRisk(patientId);
  return new Response(JSON.stringify(risk, null, 2), {
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
}

async function assessRisk(patientId) {
  const now = new Date().toISOString();

  const riskFactors = [
    { factor: "Age > 65", present: false, weight: 3 },
    { factor: "Congestive heart failure (I50)", present: false, weight: 5 },
    { factor: "COPD (J44)", present: false, weight: 4 },
    { factor: "Diabetes with complications", present: true, weight: 4 },
    { factor: "Chronic kidney disease (N18)", present: true, weight: 3 },
    { factor: "≥3 admissions in past 12 months", present: true, weight: 5 },
    { factor: "Polypharmacy (≥5 medications)", present: true, weight: 2 },
    { factor: "Depression (F32)", present: false, weight: 3 },
    { factor: "Recent surgery (30 days)", present: false, weight: 4 },
    { factor: "Social: lives alone", present: true, weight: 3 },
    { factor: "Medication non-adherence history", present: true, weight: 4 },
    { factor: "HbA1c >8.0%", present: true, weight: 3 },
  ];

  const totalWeight = riskFactors.reduce((s, f) => s + f.weight, 0);
  const presentWeight = riskFactors.filter(f => f.present).reduce((s, f) => s + f.weight, 0);
  const riskScore = Math.round((presentWeight / totalWeight) * 100);

  const riskLevel = riskScore >= 60 ? "high" : riskScore >= 35 ? "moderate" : "low";

  const interventions = [
    { priority: 1, type: "Task", description: "Schedule follow-up appointment within 7 days of discharge", dueInDays: 7 },
    { priority: 2, type: "Task", description: "Medication reconciliation within 48 hours", dueInDays: 2 },
    { priority: 3, type: "Task", description: "Arrange home health nursing visit within 72 hours", dueInDays: 3 },
    { priority: 4, type: "CarePlan", description: "Diabetes education session before discharge", dueInDays: 0 },
    { priority: 5, type: "Task", description: "Social work consult for home support assessment", dueInDays: 5 },
    { priority: 6, type: "Task", description: "Scheduled weekly phone check-in for 30 days", dueInDays: 7 },
    { priority: 7, type: "CarePlan", description: "Nutrition counseling — renal diet adaptation", dueInDays: 14 },
  ];

  return {
    resourceType: "Parameters",
    parameter: [
      { name: "patient", valueReference: `Patient/${patientId}` },
      { name: "riskScore", valueInteger: riskScore },
      { name: "riskLevel", valueCode: riskLevel },
      { name: "riskFactors", valueString: JSON.stringify(riskFactors) },
      { name: "interventions", valueString: JSON.stringify(interventions) },
      { name: "suggestedTasks", valueString: JSON.stringify(interventions.filter(i => i.type === "Task").map(i => ({
        resourceType: "Task",
        status: "draft",
        intent: "proposal",
        code: { coding: [{ code: `intervention-${i.priority}`, display: i.description }] },
        for: { reference: `Patient/${patientId}` },
        authoredOn: now,
        description: i.description,
        restriction: { period: { end: new Date(Date.now() + i.dueInDays * 86400000).toISOString() } },
      }))) },
      { name: "suggestedCarePlans", valueString: JSON.stringify(interventions.filter(i => i.type === "CarePlan").map(i => ({
        resourceType: "CarePlan",
        status: "active",
        intent: "plan",
        subject: { reference: `Patient/${patientId}` },
        description: i.description,
      }))) },
      { name: "generatedAt", valueDateTime: now },
    ],
  };
}
