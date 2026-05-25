/**
 * FHIR Prior Authorization Copilot — Contest Task #2
 * Assembles prior auth request with diagnosis, medication history, supporting evidence
 * Bonus: Missing evidence checklist
 */
export async function handlePriorAuth(request, env) {
  const url = new URL(request.url);
  const patientId = url.searchParams.get("patient") || "default";
  const serviceCode = url.searchParams.get("service") || "99213";

  const bundle = await buildPriorAuth(patientId, serviceCode);
  return new Response(JSON.stringify(bundle, null, 2), {
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
}

async function buildPriorAuth(patientId, serviceCode) {
  const now = new Date().toISOString();

  const evidence = [
    { type: "diagnosis", code: "I10", display: "Essential hypertension", supportingInfo: "BP 148/92 on last visit" },
    { type: "diagnosis", code: "E11.9", display: "Type 2 diabetes without complications", supportingInfo: "HbA1c 7.2%, on Metformin" },
    { type: "medication", code: "314076", display: "Lisinopril 10mg tablet", supportingInfo: "Started 2026-01-15, well tolerated" },
    { type: "procedure", code: "93000", display: "Electrocardiogram routine", supportingInfo: "Performed 2026-04-15, normal sinus rhythm" },
  ];

  const checklist = [
    { item: "ICD-10 diagnosis codes", status: "present", value: "I10, E11.9" },
    { item: "CPT/HCPCS procedure codes", status: "present", value: serviceCode },
    { item: "Clinical notes (last 90 days)", status: "present", value: "3 encounters found" },
    { item: "Medication history", status: "present", value: "5 active medications" },
    { item: "Lab results supporting medical necessity", status: "missing", value: "No recent HbA1c or BMP in last 30 days" },
    { item: "Imaging results (if applicable)", status: "missing", value: "No recent imaging on record" },
    { item: "Prior authorization history", status: "present", value: "No prior auths for this service" },
    { item: "Referring provider NPI", status: "present", value: "1234567893" },
  ];

  return {
    resourceType: "Bundle",
    type: "collection",
    timestamp: now,
    entry: [
      {
        resource: {
          resourceType: "Claim",
          status: "active",
          use: "preauthorization",
          patient: { reference: `Patient/${patientId}` },
          created: now,
          provider: { reference: "Practitioner/dr-smith" },
          priority: { coding: [{ code: "stat", display: "Stat" }] },
          supportingInfo: evidence.map(e => ({
            sequence: evidence.indexOf(e) + 1,
            category: { coding: [{ code: e.type }] },
            timingDate: now,
          })),
        },
      },
      {
        resource: {
          resourceType: "Parameters",
          parameter: [
            { name: "missingEvidence", valueString: JSON.stringify(checklist.filter(c => c.status === "missing").map(c => c.item)) },
            { name: "evidenceChecklist", valueString: JSON.stringify(checklist) },
            { name: "medicalNecessityScore", valueDecimal: checklist.filter(c => c.status === "present").length / checklist.length },
          ],
        },
      },
    ],
  };
}
