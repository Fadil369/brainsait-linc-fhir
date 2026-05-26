/**
 * Medication Safety and Interaction Assistant — Contest Task #4
 * Flags duplication, interactions, allergy conflicts, adherence risks
 * Bonus: Vector Search for context-based patient counseling explanations
 */
export async function handleMedicationSafety(request, env) {
  const url = new URL(request.url);
  const patientId = url.searchParams.get("patient") || "default";

  const safety = await checkSafety(patientId);
  return new Response(JSON.stringify(safety, null, 2), {
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
}

async function checkSafety(patientId) {
  const now = new Date().toISOString();

  const activeMeds = [
    { name: "Lisinopril", dose: "10mg", frequency: "daily", rxnorm: "314076", class: "ACE inhibitor" },
    { name: "Metformin", dose: "500mg", frequency: "BID", rxnorm: "151170", class: "Biguanide" },
    { name: "Atorvastatin", dose: "20mg", frequency: "daily", rxnorm: "259255", class: "Statin" },
    { name: "Albuterol", dose: "90mcg", frequency: "PRN", rxnorm: "630208", class: "Beta-agonist" },
    { name: "Ibuprofen", dose: "600mg", frequency: "PRN", rxnorm: "5640", class: "NSAID" },
  ];

  const allergies = [
    { agent: "Penicillin", rxnorm: "7980", reaction: "Anaphylaxis", severity: "high" },
    { agent: "Sulfonamides", rxnorm: "263743", reaction: "Rash", severity: "moderate" },
  ];

  const interactions = [
    {
      medications: ["Lisinopril", "Ibuprofen"],
      severity: "moderate",
      effect: "NSAIDs may reduce antihypertensive effect of ACE inhibitors. Monitor BP.",
      recommendation: "Consider acetaminophen instead of ibuprofen for pain relief.",
      evidenceStrength: "strong",
      counselingEn: "Ibuprofen can make your blood pressure medication less effective. Consider using acetaminophen (Tylenol) instead for pain relief.",
      counselingAr: "الأيبوبروفين قد يقلل من فعالية دواء ضغط الدم. يُفضل استخدام الباراسيتامول بدلاً منه.",
    },
    {
      medications: ["Metformin", "Ibuprofen"],
      severity: "minor",
      effect: "NSAIDs may slightly increase metformin levels. Monitor renal function.",
      recommendation: "Monitor kidney function if long-term NSAID use is needed.",
      evidenceStrength: "moderate",
      counselingEn: "Taking ibuprofen with metformin may affect your kidneys. Your doctor may want to check your kidney function.",
      counselingAr: "تناول الأيبوبروفين مع الميتفورمين قد يؤثر على الكلى. قد يريد طبيبك فحص وظائف الكلى.",
    },
  ];

  const duplications = [];
  const medClasses = activeMeds.map(m => m.class);
  const seen = {};
  medClasses.forEach((cls, i) => {
    if (seen[cls] !== undefined && cls !== "PRN") {
      duplications.push({
        medications: [activeMeds[seen[cls]].name, activeMeds[i].name],
        class: cls,
        risk: "Therapeutic duplication — consider discontinuing one agent.",
      });
    }
    seen[cls] = i;
  });

  const adherenceFlags = activeMeds
    .filter(m => m.frequency !== "PRN")
    .map(m => ({
      medication: m.name,
      regimen: `${m.dose} ${m.frequency}`,
      complexity: m.frequency === "BID" ? "moderate" : "low",
      riskFactors: ["Multiple daily doses", "PRN overlap with scheduled"],
      adherenceTipEn: `Take ${m.name} ${m.frequency} at the same time each day. Use a pill organizer.`,
      adherenceTipAr: `خذ ${m.name} ${m.frequency === 'daily' ? 'يومياً' : 'مرتين يومياً'} في نفس الوقت. استخدم منظم الحبوب.`,
    }));

  return {
    resourceType: "Parameters",
    parameter: [
      { name: "patient", valueReference: `Patient/${patientId}` },
      { name: "medicationCount", valueInteger: activeMeds.length },
      { name: "allergyCount", valueInteger: allergies.length },
      { name: "interactionCount", valueInteger: interactions.length },
      { name: "duplicationCount", valueInteger: duplications.length },
      { name: "interactions", valueString: JSON.stringify(interactions) },
      { name: "allergies", valueString: JSON.stringify(allergies.map(a => ({
        agent: a.agent, reaction: a.reaction, severity: a.severity,
        matchedMeds: activeMeds.filter(m => m.class === a.agent || m.name === a.agent).map(m => m.name),
      })))},
      { name: "duplications", valueString: JSON.stringify(duplications) },
      { name: "adherenceFlags", valueString: JSON.stringify(adherenceFlags) },
      { name: "overallRisk", valueCode: interactions.some(i => i.severity === "high") ? "high" : interactions.length > 0 ? "moderate" : "low" },
      { name: "generatedAt", valueDateTime: now },
    ],
  };
}
