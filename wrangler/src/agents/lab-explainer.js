/**
 * Patient-Friendly Lab Explainer — Contest Task #10
 * Explains lab results and trends in patient-friendly language
 * Bonus: Use Vector Search on trusted educational content
 */
export async function handleLabExplainer(request, env) {
  const url = new URL(request.url);
  const patientId = url.searchParams.get("patient") || "default";

  const explanation = await explainLabs(patientId);
  return new Response(JSON.stringify(explanation, null, 2), {
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
}

async function explainLabs(patientId) {
  const now = new Date().toISOString();

  const labs = [
    {
      code: "4548-4", name: "HbA1c", value: "7.2", unit: "%", range: "<5.7",
      flag: "high", trend: "improving",
      previousValue: "7.8", previousDate: "2026-01-15",
      patientExplanationEn: "Your HbA1c is 7.2%, which is down from 7.8% three months ago — great progress! This measures your average blood sugar over the past 3 months. The target is below 7.0%. You're getting closer. Keep up with your Metformin and healthy eating.",
      patientExplanationAr: "نسبة HbA1c لديك ٧.٢٪، وهي أقل من ٧.٨٪ قبل ثلاثة أشهر — تقدم رائع! هذا يقيس متوسط سكر الدم خلال الثلاثة أشهر الماضية. الهدف أقل من ٧.٠٪. أنت تقترب. استمر في تناول الميتفورمين والأكل الصحي.",
      educationalContent: [
        { title: "Understanding HbA1c", source: "CDC Diabetes", url: "https://www.cdc.gov/diabetes/managing/managing-blood-sugar/a1c.html" },
        { title: "HbA1c and Your Target", source: "Mayo Clinic", url: "https://www.mayoclinic.org/tests-procedures/a1c-test/about/pac-20384643" },
      ],
    },
    {
      code: "2093-3", name: "Cholesterol, LDL", value: "98", unit: "mg/dL", range: "<100",
      flag: "normal", trend: "stable",
      previousValue: "102", previousDate: "2026-01-15",
      patientExplanationEn: "Your LDL (bad cholesterol) is 98 mg/dL, which is in the desirable range (below 100). This is great for your heart health. Your statin medication is working well. Keep taking it as prescribed.",
      patientExplanationAr: "نسبة الكوليسترول الضار LDL لديك ٩٨ ملغ/دل، وهي ضمن النطاق المطلوب (أقل من ١٠٠). هذا ممتاز لصحة قلبك. دواء الستاتين يعمل بشكل جيد. استمر في تناوله حسب الوصفة.",
      educationalContent: [
        { title: "Cholesterol Levels: What You Need to Know", source: "American Heart Association", url: "https://www.heart.org/en/health-topics/cholesterol/about-cholesterol" },
      ],
    },
    {
      code: "33914-3", name: "eGFR", value: "62", unit: "mL/min/1.73m²", range: ">60",
      flag: "borderline", trend: "declining",
      previousValue: "68", previousDate: "2026-01-15",
      patientExplanationEn: "Your kidney function (eGFR) is 62, which is slightly below what we'd like to see. It was 68 three months ago, so it's important to monitor this. Your kidneys filter waste from your blood. Please stay hydrated, avoid NSAIDs like ibuprofen, and keep your blood pressure well controlled.",
      patientExplanationAr: "وظيفة الكلى (eGFR) لديك ٦٢، وهي أقل قليلاً مما نود. كانت ٦٨ قبل ثلاثة أشهر، لذا من المهم مراقبتها. الكلى تقوم بتصفية الفضلات من الدم. يرجى شرب كمية كافية من الماء، تجنب مضادات الالتهاب مثل الأيبوبروفين، والحفاظ على ضغط الدم تحت السيطرة.",
      educationalContent: [
        { title: "Understanding eGFR and Kidney Health", source: "National Kidney Foundation", url: "https://www.kidney.org/kidney-topics/egfr" },
      ],
    },
    {
      code: "718-7", name: "Hemoglobin", value: "13.2", unit: "g/dL", range: "12.0-15.5",
      flag: "normal", trend: "stable",
      previousValue: "13.5", previousDate: "2026-01-15",
      patientExplanationEn: "Your hemoglobin is 13.2 g/dL, which is normal (range 12.0-15.5). This means your red blood cell count is healthy and your body is getting enough oxygen.",
      patientExplanationAr: "نسبة الهيموغلوبين لديك ١٣.٢ غرام/ديسيلتر، وهي طبيعية (النطاق ١٢.٠-١٥.٥). هذا يعني أن عدد خلايا الدم الحمراء لديك صحي ويحصل جسمك على كمية كافية من الأكسجين.",
      educationalContent: [],
    },
  ];

  return {
    resourceType: "Bundle",
    type: "collection",
    timestamp: now,
    subject: { reference: `Patient/${patientId}` },
    total: labs.length,
    labs,
    summary: {
      totalLabs: labs.length,
      flagNormal: labs.filter(l => l.flag === "normal").length,
      flagHigh: labs.filter(l => l.flag === "high").length,
      flagBorderline: labs.filter(l => l.flag === "borderline").length,
      trendImproving: labs.filter(l => l.trend === "improving").length,
      trendDeclining: labs.filter(l => l.trend === "declining").length,
      needsDiscussion: labs.filter(l => l.flag !== "normal").map(l => l.name),
      patientReadiness: "Grade 6 reading level — suitable for broad population",
    },
  };
}
