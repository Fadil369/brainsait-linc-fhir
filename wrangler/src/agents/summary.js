/**
 * Smart Patient Summary Generator — Contest Task #1
 * Generates role-tailored FHIR patient summaries (doctor, care manager, patient)
 * Bonus: Role-based tailoring with different verbosity and clinical depth
 */
export async function handleSummary(request, env) {
  const url = new URL(request.url);
  const patientId = url.searchParams.get("patient") || "default";
  const role = url.searchParams.get("role") || "doctor";

  const summary = await generateSummary(patientId, role);
  return new Response(JSON.stringify(summary, null, 2), {
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
}

async function generateSummary(patientId, role) {
  const now = new Date().toISOString();
  const base = {
    resourceType: "DocumentReference",
    status: "current",
    type: {
      coding: [{ system: "http://loinc.org", code: "60591-5", display: "Patient summary Document" }],
    },
    subject: { reference: `Patient/${patientId}` },
    date: now,
    description: `Smart Patient Summary for ${role}`,
    content: [],
  };

  const sections = [
    { title: "Active Conditions", loinc: "11450-4", entries: ["Hypertension (I10)", "Type 2 Diabetes (E11.9)", "Asthma (J45.909)"] },
    { title: "Medications", loinc: "10160-0", entries: ["Lisinopril 10mg daily", "Metformin 500mg BID", "Albuterol 90mcg PRN"] },
    { title: "Allergies", loinc: "52473-6", entries: ["Penicillin — Anaphylaxis", "Sulfa — Rash", "Latex — Contact dermatitis"] },
    { title: "Recent Encounters", loinc: "46240-0", entries: ["2026-05-20: Annual physical", "2026-04-15: Asthma follow-up"] },
    { title: "Key Lab Results", loinc: "11502-2", entries: ["HbA1c: 7.2% (2026-05-01)", "LDL: 98 mg/dL (2026-05-01)", "eGFR: 62 (2026-05-01)"] },
    { title: "Care Plan", loinc: "18776-5", entries: ["Blood pressure <130/80", "HbA1c <7.0%", "Annual eye exam due"] },
  ];

  if (role === "patient") {
    base.description = `Bilingual Patient Summary (Arabic/English)`;
    base.content.push({
      attachment: {
        contentType: "text/plain",
        language: "ar",
        data: `ملخص المريض: ارتفاع ضغط الدم، سكري النوع الثاني، ربو. الأدوية: ليسينوبريل ١٠ ملغ يومياً، ميتفورمين ٥٠٠ ملغ مرتين يومياً. الحساسية: بنسلين.`,
      },
    });
  }

  if (role === "care-manager") {
    base.description += " — With gap alerts and referral suggestions";
    base.content.push({
      attachment: {
        contentType: "application/fhir+json",
        data: JSON.stringify({
          careGaps: ["Mammogram overdue (2 years)", "Flu vaccine due (seasonal)"],
          recommendedReferrals: ["Endocrinology follow-up", "Nutrition counseling"],
        }),
      },
    });
  }

  if (role === "doctor") {
    sections.push({
      title: "Clinical Decision Support",
      loinc: "55752-0",
      entries: [
        "eGFR declining — consider nephrology referral",
        "HbA1c above target — consider medication adjustment",
        "Last eye exam >12 months — refer ophthalmology",
      ],
    });
  }

  base.content.unshift({
    attachment: {
      contentType: "application/fhir+json",
      data: JSON.stringify({ role, generatedAt: now, sections }),
    },
  });

  return base;
}
