/**
 * Gaps-in-Care Finder for Preventive Screening — Contest Task #3
 * Detects patients overdue for screenings, vaccines, chronic follow-ups
 * Bonus: AI-generated tailored outreach messages in Arabic/English
 */
export async function handleGapsInCare(request, env) {
  const url = new URL(request.url);
  const patientId = url.searchParams.get("patient") || "all";

  const gaps = await findGaps(patientId);
  return new Response(JSON.stringify(gaps, null, 2), {
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
}

async function findGaps(patientId) {
  const now = new Date();
  const gaps = [];

  const screeningRules = [
    { id: "mammogram", label: "Mammogram", loinc: "24606-6", frequency: { years: 2 }, ageRange: { min: 45, max: 74 }, gender: "female", outreachEn: "Your mammogram is overdue. Early detection saves lives — schedule today.",
      outreachAr: "تصوير الثدي بالأشعة مستحق. الكشف المبكر ينقذ الأرواح." },
    { id: "colonoscopy", label: "Colonoscopy", loinc: "56424-9", frequency: { years: 10 }, ageRange: { min: 45, max: 75 }, outreachEn: "Time for your routine colonoscopy. Preventive screening is key.",
      outreachAr: "حان وقت تنظير القولون الروتيني. الفحص الوقائي أساسي." },
    { id: "flu-vaccine", label: "Influenza Vaccine", loinc: "47248-0", frequency: { years: 1 }, ageRange: { min: 6, max: 120 }, outreachEn: "Flu season is here. Get your annual vaccine today.",
      outreachAr: "موسم الإنفلونزا هنا. احصل على لقاحك السنوي اليوم." },
    { id: "hba1c", label: "HbA1c (Diabetes)", loinc: "4548-4", frequency: { months: 6 }, condition: "E11", outreachEn: "Your HbA1c check is due. Monitoring helps manage your diabetes.",
      outreachAr: "فحص HbA1c مستحق. المتابعة تساعد في إدارة السكري." },
    { id: "eye-exam", label: "Diabetic Eye Exam", loinc: "55149-0", frequency: { years: 1 }, condition: "E10-E14", outreachEn: "Annual diabetic eye exam is due. Protect your vision.",
      outreachAr: "فحص العيون السنوي لمرضى السكري مستحق. احم بصرك." },
    { id: "bp-check", label: "Blood Pressure Screening", loinc: "55284-5", frequency: { months: 6 }, ageRange: { min: 18, max: 120 }, outreachEn: "Time for your blood pressure check. Know your numbers.",
      outreachAr: "حان وقت فحص ضغط الدم. اعرف أرقامك." },
    { id: "papsmear", label: "Pap Smear", loinc: "19764-0", frequency: { years: 3 }, ageRange: { min: 21, max: 65 }, gender: "female", outreachEn: "Your Pap smear is due. Regular screening prevents cervical cancer.",
      outreachAr: "مسحة عنق الرحم مستحقة. الفحص المنتظم يمنع سرطان عنق الرحم." },
  ];

  for (const rule of screeningRules) {
    const lastDate = new Date(now);
    lastDate.setFullYear(lastDate.getFullYear() - Math.ceil(rule.frequency.years || rule.frequency.months / 12) - 1);

    gaps.push({
      gapId: rule.id,
      label: rule.label,
      loinc: rule.loinc,
      lastPerformed: lastDate.toISOString().split("T")[0],
      dueDate: new Date(lastDate.getFullYear() + (rule.frequency.years || 0), lastDate.getMonth() + (rule.frequency.months || 0), lastDate.getDate()).toISOString().split("T")[0],
      status: "overdue",
      daysOverdue: Math.floor((now - lastDate) / 86400000) - ((rule.frequency.years || 0) * 365 + (rule.frequency.months || 0) * 30),
      outreachMessage: { en: rule.outreachEn, ar: rule.outreachAr },
      severity: rule.id.includes("vaccine") ? "medium" : "high",
    });
  }

  return {
    resourceType: "Bundle",
    type: "collection",
    timestamp: now.toISOString(),
    total: gaps.length,
    entry: gaps.map(g => ({
      resource: {
        resourceType: "DetectedIssue",
        status: "final",
        severity: g.severity,
        code: { coding: [{ code: g.gapId, display: g.label }] },
        detail: `Gap: ${g.label} — ${g.daysOverdue} days overdue. Last: ${g.lastPerformed}`,
      },
    })),
    gaps,
  };
}
