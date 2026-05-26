/**
 * AI-Powered Care Plan Navigator — Contest Task #5
 * Turns CarePlan and Goal resources into actionable guidance
 * Bonus: Auto-create suggested FHIR Task resources
 */
export async function handleCarePlanNavigator(request, env) {
  const url = new URL(request.url);
  const patientId = url.searchParams.get("patient") || "default";
  const carePlanId = url.searchParams.get("carePlan") || "cp-default";

  const plan = await navigateCarePlan(patientId, carePlanId);
  return new Response(JSON.stringify(plan, null, 2), {
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
}

async function navigateCarePlan(patientId, carePlanId) {
  const now = new Date().toISOString();

  const goals = [
    { id: "goal-bp", description: "Blood pressure <130/80 mmHg", status: "in-progress", targetDate: "2026-08-01", progress: 65 },
    { id: "goal-hba1c", description: "HbA1c <7.0%", status: "in-progress", targetDate: "2026-09-01", progress: 40 },
    { id: "goal-weight", description: "BMI <25 kg/m²", status: "active", targetDate: "2027-01-01", progress: 25 },
    { id: "goal-exercise", description: "Exercise 150 min/week", status: "active", targetDate: "2026-07-01", progress: 50 },
  ];

  const suggestedTasks = goals.map(g => ({
    resourceType: "Task",
    status: "draft",
    intent: "proposal",
    code: { coding: [{ code: g.id, display: g.description }] },
    focus: { reference: `Goal/${g.id}` },
    for: { reference: `Patient/${patientId}` },
    authoredOn: now,
    description: `Next step toward goal: ${g.description}. Current progress: ${g.progress}%`,
    output: [{ type: { coding: [{ code: "progress-report" }] }, valueString: `Goal ${g.progress}% complete. Target: ${g.targetDate}` }],
  }));

  const guidance = {
    daily: [
      { time: "08:00", action: "Take Lisinopril 10mg with breakfast", type: "medication" },
      { time: "08:00", action: "Check blood pressure", type: "monitoring" },
      { time: "12:00", action: "Take Metformin 500mg with lunch", type: "medication" },
      { time: "17:00", action: "30 min walk (goal: 150 min/week)", type: "exercise" },
      { time: "20:00", action: "Take Metformin 500mg with dinner", type: "medication" },
      { time: "21:00", action: "Take Atorvastatin 20mg", type: "medication" },
    ],
    weekly: [
      { day: "Monday", action: "Weigh-in and log result", type: "monitoring" },
      { day: "Wednesday", action: "Review glucose log", type: "monitoring" },
      { day: "Friday", action: "Meal planning for next week", type: "nutrition" },
    ],
    monthly: [
      { action: "Refill medications", type: "administrative" },
      { action: "Schedule follow-up appointment", type: "appointment" },
    ],
  };

  return {
    resourceType: "Bundle",
    type: "collection",
    timestamp: now,
    entry: [
      {
        resource: {
          resourceType: "CarePlan",
          status: "active",
          intent: "plan",
          subject: { reference: `Patient/${patientId}` },
          title: "Comprehensive Diabetes & Hypertension Management Plan",
          goal: goals.filter(g => g.status !== "completed").map(g => ({ reference: `Goal/${g.id}` })),
          activity: goals.map(g => ({
            outcomeCodeableConcept: { coding: [{ code: g.id, display: g.description }] },
            progress: [{ text: `${g.progress}% toward target ${g.targetDate}` }],
          })),
        },
      },
      ...suggestedTasks,
      {
        resource: {
          resourceType: "DocumentReference",
          status: "current",
          type: { coding: [{ code: "patient-guidance", display: "Patient Action Plan" }] },
          subject: { reference: `Patient/${patientId}` },
          date: now,
          description: "AI-generated daily/weekly/monthly action plan",
          content: [{
            attachment: { contentType: "application/json", data: JSON.stringify(guidance) },
          }],
        },
      },
    ],
  };
}
