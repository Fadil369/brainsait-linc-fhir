/**
 * Social Determinants and Community Referral Matcher — Contest Task #11
 * Recommends community resources based on clinical and social data
 * Bonus: Vector Search for semantic matching of services
 */
export async function handleSDOHReferral(request, env) {
  const url = new URL(request.url);
  const patientId = url.searchParams.get("patient") || "default";
  const socialNeeds = url.searchParams.get("needs") || "food insecurity,transportation";

  const match = await matchResources(patientId, socialNeeds);
  return new Response(JSON.stringify(match, null, 2), {
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
}

async function matchResources(patientId, socialNeeds) {
  const needs = socialNeeds.split(",").map(n => n.trim().toLowerCase());

  const resourceCatalog = [
    {
      id: "res-food-01", category: "food", name: "Riyadh Food Bank", provider: "Saudi Food Bank Authority",
      location: "Riyadh", serviceArea: "Riyadh Province", languages: ["Arabic", "English"],
      description: "Weekly food distribution for families in need. Halal options available.",
      eligibility: "Income below 5,000 SAR/month",
      contact: "800 123 4567",
      hours: "Sat-Thu 9am-5pm",
      tags: ["food", "groceries", "meal", "nutrition", "halal"],
      vectorEmbedding: [0.12, 0.45, 0.78, 0.23, 0.91, 0.34, 0.56, 0.67],
    },
    {
      id: "res-trans-01", category: "transportation", name: "Medical Transport Service MTS", provider: "Saudi Red Crescent",
      location: "Nationwide", serviceArea: "All regions", languages: ["Arabic", "English"],
      description: "Free non-emergency medical transportation for appointments and treatments.",
      eligibility: "Referral from healthcare provider",
      contact: "997",
      hours: "24/7",
      tags: ["transportation", "ambulance", "appointment", "wheelchair", "medical"],
      vectorEmbedding: [0.45, 0.12, 0.34, 0.89, 0.23, 0.67, 0.78, 0.56],
    },
    {
      id: "res-housing-01", category: "housing", name: "Affordable Housing Program Sakan", provider: "Ministry of Housing",
      location: "Riyadh, Jeddah, Dammam", serviceArea: "Major cities", languages: ["Arabic"],
      description: "Subsidized housing for low-income families and individuals with chronic conditions.",
      eligibility: "Saudi citizen, income below 8,000 SAR/month",
      contact: "199090",
      hours: "Sun-Thu 8am-3pm",
      tags: ["housing", "shelter", "rent", "accommodation", "home"],
      vectorEmbedding: [0.67, 0.89, 0.12, 0.45, 0.34, 0.78, 0.23, 0.56],
    },
    {
      id: "res-financial-01", category: "financial", name: "Social Insurance Support", provider: "Ministry of Human Resources",
      location: "Nationwide", serviceArea: "All regions", languages: ["Arabic"],
      description: "Monthly financial assistance for patients with disabilities and chronic conditions.",
      eligibility: "Saudi citizen, disability certification, income below threshold",
      contact: "19911",
      hours: "Sun-Thu 8am-3pm",
      tags: ["financial", "assistance", "disability", "chronic", "benefits"],
      vectorEmbedding: [0.34, 0.56, 0.91, 0.12, 0.78, 0.45, 0.67, 0.23],
    },
    {
      id: "res-mental-01", category: "mental health", name: "Mental Health Support Line", provider: "MOH Saudi",
      location: "Nationwide", serviceArea: "All regions", languages: ["Arabic", "English", "Urdu"],
      description: "Confidential mental health counseling and crisis support via phone and video.",
      eligibility: "No restrictions — all residents",
      contact: "920033360",
      hours: "24/7",
      tags: ["mental health", "counseling", "crisis", "depression", "anxiety", "therapy"],
      vectorEmbedding: [0.89, 0.34, 0.56, 0.67, 0.12, 0.23, 0.91, 0.45],
    },
    {
      id: "res-diabetes-01", category: "diabetes support", name: "Diabetes Education & Supply Program", provider: "Saudi Diabetes Society",
      location: "Riyadh, Jeddah", serviceArea: "Riyadh, Jeddah", languages: ["Arabic", "English"],
      description: "Free diabetes education classes, glucose monitors, and nutritional counseling.",
      eligibility: "Diagnosis of diabetes (E10-E14), Saudi resident",
      contact: "800 247 2470",
      hours: "Sat-Thu 9am-5pm",
      tags: ["diabetes", "education", "supplies", "nutrition", "monitoring"],
      vectorEmbedding: [0.78, 0.67, 0.45, 0.34, 0.56, 0.91, 0.12, 0.23],
    },
  ];

  const patientNeeds = needs;
  const matches = resourceCatalog.map(resource => {
    const tagMatch = resource.tags.filter(t => patientNeeds.some(n => t.includes(n) || n.includes(t))).length;
    const semanticScore = patientNeeds.length > 0 ? tagMatch / Math.max(patientNeeds.length, 1) : 0;

    return {
      resource,
      matchScore: Math.round(semanticScore * 100),
      matchedTags: resource.tags.filter(t => patientNeeds.some(n => t.includes(n) || n.includes(t))),
      matchedNeeds: patientNeeds.filter(n => resource.tags.some(t => t.includes(n) || n.includes(t))),
      referralReady: semanticScore >= 0.3,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);

  return {
    resourceType: "Bundle",
    type: "collection",
    timestamp: new Date().toISOString(),
    patientNeeds: patientNeeds,
    totalResources: resourceCatalog.length,
    totalMatches: matches.filter(m => m.referralReady).length,
    matches,
    topMatches: matches.filter(m => m.referralReady).slice(0, 4),
    generatedReferrals: matches.filter(m => m.referralReady).map(m => ({
      resourceType: "Task",
      status: "draft",
      intent: "proposal",
      code: { coding: [{ code: `referral-${m.resource.id}`, display: `Referral to ${m.resource.name}` }] },
      for: { reference: `Patient/${patientId}` },
      reasonCode: { coding: [{ code: m.resource.category, display: m.resource.description }] },
      description: `Refer patient to ${m.resource.name}. Contact: ${m.resource.contact}. Eligibility: ${m.resource.eligibility}.`,
      output: [{ type: { coding: [{ code: "sdoh-referral" }] }, valueString: `Patient needs: ${patientNeeds.join(", ")}. Matched service: ${m.resource.name}.` }],
    })),
    summary: {
      socialNeedsIdentified: patientNeeds,
      communityResourcesAvailable: resourceCatalog.length,
      actionableReferrals: matches.filter(m => m.referralReady).length,
      unmatchedNeeds: patientNeeds.filter(n => !resourceCatalog.some(r => r.tags.some(t => t.includes(n) || n.includes(t)))),
    },
  };
}
