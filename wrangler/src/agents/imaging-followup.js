/**
 * Imaging and Results Follow-Up Tracker — Contest Task #9
 * Ensures abnormal results receive follow-up to close care loops
 * Bonus: AI-generated outreach or clinician reminders
 */
export async function handleImagingFollowup(request, env) {
  const url = new URL(request.url);
  const patientId = url.searchParams.get("patient") || "default";

  const followup = await trackFollowup(patientId);
  return new Response(JSON.stringify(followup, null, 2), {
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
}

async function trackFollowup(patientId) {
  const now = new Date().toISOString();

  const studies = [
    {
      id: "img-001", modality: "CT", bodySite: "Chest", performed: "2026-05-15", status: "completed",
      finding: "5mm pulmonary nodule, right lower lobe",
      impression: "Indeterminate — requires follow-up CT in 3 months",
      recommendation: "Follow-up CT chest in 3 months. Consider PET-CT if nodule enlarges.",
      abnormal: true, urgency: "moderate",
      followupStatus: "pending",
      daysSinceResult: 10,
    },
    {
      id: "img-002", modality: "MRI", bodySite: "Lumbar Spine", performed: "2026-05-01", status: "completed",
      finding: "Disc protrusion at L4-L5 with mild nerve root compression",
      impression: "Degenerative changes — neurosurgery consult recommended",
      recommendation: "Neurosurgery evaluation within 4 weeks. Conservative management in interim.",
      abnormal: true, urgency: "moderate",
      followupStatus: "overdue",
      daysSinceResult: 24,
    },
    {
      id: "img-003", modality: "Mammogram", bodySite: "Breast, Bilateral", performed: "2026-04-10", status: "completed",
      finding: "BI-RADS 4A — suspicious calcifications left breast",
      impression: "BI-RADS Category 4A — biopsy recommended",
      recommendation: "Ultrasound-guided core needle biopsy within 2 weeks.",
      abnormal: true, urgency: "high",
      followupStatus: "overdue",
      daysSinceResult: 45,
    },
    {
      id: "lab-001", test: "HbA1c", value: "7.2%", performed: "2026-05-10", status: "completed",
      flag: "high", referenceRange: "<5.7%",
      followupStatus: "actioned",
      daysSinceResult: 15,
    },
    {
      id: "img-004", modality: "X-Ray", bodySite: "Chest", performed: "2026-05-20", status: "completed",
      finding: "No acute cardiopulmonary abnormality",
      impression: "Normal study",
      abnormal: false, urgency: "none",
      followupStatus: "none-required",
      daysSinceResult: 5,
    },
  ];

  const pending = studies.filter(s => s.abnormal && s.followupStatus !== "actioned" && s.followupStatus !== "none-required");

  const reminders = pending.map(s => ({
    modality: s.modality || s.test,
    finding: s.finding || s.impression,
    urgency: s.urgency || "high",
    daysOverdue: s.daysSinceResult - (s.urgency === "high" ? 14 : 21),
    clinicianReminder: `[URGENT] Patient ${patientId}: ${s.modality || s.test} (${s.bodySite || ''}) performed ${s.performed} shows "${s.finding}". ${s.recommendation}. ${s.daysSinceResult} days since study.`,
    patientOutreach: {
      en: `Your recent ${s.modality || s.test} showed a finding that needs follow-up. Please contact your provider to schedule: ${s.recommendation}`,
      ar: `أظهر فحص ${s.modality === 'CT' ? 'الأشعة المقطعية' : s.modality === 'MRI' ? 'الرنين المغناطيسي' : s.modality === 'Mammogram' ? 'الماموجرام' : 'الأشعة السينية'} الأخير نتيجة تحتاج متابعة. يرجى الاتصال بمقدم الرعاية الصحية الخاص بك.`,
    },
  }));

  return {
    resourceType: "Bundle",
    type: "collection",
    timestamp: now,
    total: studies.length,
    entry: studies.map(s => ({
      resource: {
        resourceType: s.id.startsWith("lab") ? "Observation" : "ImagingStudy",
        status: s.abnormal ? "preliminary" : "final",
        code: { coding: [{ code: s.id, display: s.finding || s.test }] },
        subject: { reference: `Patient/${patientId}` },
        effectiveDateTime: s.performed,
      },
    })),
    studies,
    pendingFollowups: pending.length,
    reminders,
    summary: {
      totalAbnormal: studies.filter(s => s.abnormal).length,
      followupOverdue: pending.filter(s => s.followupStatus === "overdue").length,
      followupPending: pending.filter(s => s.followupStatus === "pending").length,
      followupActioned: studies.filter(s => s.followupStatus === "actioned").length,
      closedLoopRate: Math.round((studies.filter(s => !s.abnormal || s.followupStatus === "actioned").length / studies.length) * 100),
    },
  };
}
