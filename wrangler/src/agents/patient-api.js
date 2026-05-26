/**
 * Patient-Centric Unified API
 * Single endpoint that aggregates all patient data from every system
 */
import { getPatientData, patientTimeline, careGapsSummary, fiveYearSummary } from "./patient-engine.js";

export async function handlePatient(request, env) {
  const url = new URL(request.url);
  const patientId = url.searchParams.get("patient") || "P-5842";
  const lang = url.searchParams.get("lang") || "en";

  const p = getPatientData(patientId);
  const timeline = patientTimeline(patientId);
  const gaps = careGapsSummary(patientId);
  const fiveYear = fiveYearSummary(patientId);

  // /api/patient — complete unified patient view
  if (url.pathname === "/api/patient") {
    return new Response(JSON.stringify({
      patient: {
        id: p.id,
        name: lang === "ar" ? p.name.ar : p.name.en,
        nationalId: p.nationalId,
        dob: p.dob,
        gender: p.gender,
        bloodType: p.bloodType,
        phone: p.phone,
        language: p.language,
        emergencyContact: p.emergencyContact,
        primaryCare: p.primaryCare,
      },
      insurance: p.insurance,
      clinical: {
        conditions: p.conditions.map(c => ({ code: c.code, name: lang === "ar" ? c.nameAr : c.name, status: c.status, diagnosed: c.diagnosed })),
        medications: p.medications.map(m => ({ name: m.name, dose: m.dose, frequency: m.frequency, purpose: lang === "ar" ? m.purposeAr : m.purpose })),
        allergies: p.allergies,
      },
      recentLabs: p.labs.slice(0, 3),
      recentEncounters: p.encounters.slice(0, 3),
      careGaps: gaps,
      carePlan: {
        goals: p.carePlan.goals,
        todayPlan: p.carePlan.todayPlan,
      },
      upcomingNeeds: [
        { priority: "high", item: "Diabetic eye exam overdue", dueBy: "immediate" },
        { priority: "high", item: "Follow-up CT chest in 3 months", dueBy: "2026-08-15" },
        { priority: "medium", item: "Flu vaccine due", dueBy: "2026-11-01" },
        { priority: "medium", item: "Nephrology follow-up for CKD", dueBy: "2026-07-01" },
      ],
      readmissionRisk: p.readmissionRisk,
      socialDeterminants: p.socialDeterminants,
      activeTrials: p.trials,
    }, null, 2), {
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
    });
  }

  // /api/patient/timeline — chronological patient timeline
  if (url.pathname === "/api/patient/timeline") {
    return new Response(JSON.stringify({
      patientId,
      timeline,
      total: timeline.length,
    }, null, 2), {
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
    });
  }

  // /api/patient/summary — 5-year clinical summary
  if (url.pathname === "/api/patient/summary") {
    return new Response(JSON.stringify({
      ...fiveYear,
      language: lang,
    }, null, 2), {
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
    });
  }

  // /api/patient/medications — full medication profile
  if (url.pathname === "/api/patient/medications") {
    return new Response(JSON.stringify({
      patientId,
      medications: p.medications.map(m => ({
        ...m,
        counseling: {
          en: `Take ${m.name} ${m.frequency}${m.frequency === "PRN" ? " as needed for " + m.purpose : ""}. ${m.dose} each time.`,
          ar: m.frequency === "daily" ? `خذ ${m.name} يومياً. ${m.dose} لكل مرة.` :
              m.frequency === "BID" ? `خذ ${m.name} مرتين يومياً. ${m.dose} لكل مرة.` :
              `خذ ${m.name} عند الحاجة. ${m.dose}.`,
        },
      })),
      interactions: [
        { severity: "moderate", medications: ["Lisinopril", "Ibuprofen"], effect: "NSAIDs reduce BP control. Use acetaminophen instead.", counselingEn: "Avoid ibuprofen — it reduces your BP medication's effect.", counselingAr: "تجنب الأيبوبروفين — يقلل من تأثير دواء الضغط." },
        { severity: "minor", medications: ["Metformin", "Ibuprofen"], effect: "May affect kidney function with long-term use.", counselingEn: "Limit NSAID use. Monitor kidney function.", counselingAr: "قلل استخدام مسكنات NSAID. راقب وظائف الكلى." },
      ],
      total: p.medications.length,
    }, null, 2), {
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
    });
  }

  // /api/patient/labs — lab results with Arabic explanations
  if (url.pathname === "/api/patient/labs") {
    return new Response(JSON.stringify({
      patientId,
      labs: p.labs.map(l => ({
        ...l,
        explanation: {
          en: l.test === "HbA1c" ? `Your HbA1c is ${l.value}%, down from ${l.previous}%. Target is below 7.0%. You're making progress!` :
              l.test === "LDL Cholesterol" ? `Your LDL is ${l.value} mg/dL, which is within the desirable range (<100).` :
              l.test === "eGFR" ? `Your kidney function is ${l.value}, slightly down from ${l.previous}. Stay hydrated and avoid NSAIDs.` :
              `Your ${l.test} is ${l.value} ${l.unit}, which is normal.`,
          ar: l.test === "HbA1c" ? `نسبة HbA1c لديك ${l.value}%، انخفضت من ${l.previous}%. الهدف أقل من ٧.٠%. أنت تتقدم!` :
              l.test === "LDL Cholesterol" ? `نسبة الكوليسترول ${l.value} ملغ/دل، ضمن النطاق المطلوب (أقل من ١٠٠).` :
              l.test === "eGFR" ? `وظيفة الكلى ${l.value}، انخفضت قليلاً من ${l.previous}. اشرب الماء بكثرة وتجنب مسكنات NSAID.` :
              `${l.test} لديك ${l.value} ${l.unit}، وهو طبيعي.`,
        },
      })),
      total: p.labs.length,
    }, null, 2), {
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
    });
  }

  // /api/patient/plan — today's care plan
  if (url.pathname === "/api/patient/plan") {
    return new Response(JSON.stringify({
      patientId,
      goals: p.carePlan.goals,
      todaySchedule: p.carePlan.todayPlan.map(t => ({
        ...t,
        instructionEn: t.type === "medication" ? `Take your medication as prescribed` : t.action,
        instructionAr: t.type === "medication" ? "تناول دوائك حسب الوصفة" : t.action,
      })),
      weeklySchedule: [
        { day: "Monday", action: "Weigh-in and log result" },
        { day: "Wednesday", action: "Review glucose log" },
        { day: "Friday", action: "Meal planning for next week" },
      ],
      upcomingAppointments: [
        { date: "2026-06-15", type: "Nephrology follow-up", provider: "Dr. Al-Otaibi", location: "HNH Riyadh" },
        { date: "2026-08-15", type: "Follow-up CT Chest", provider: "Radiology", location: "Al Ribat Hospital" },
      ],
    }, null, 2), {
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
    });
  }

  return new Response(JSON.stringify({
    usage: {
      "/api/patient?patient=P-5842": "Complete unified patient view",
      "/api/patient/timeline?patient=P-5842": "Chronological event timeline",
      "/api/patient/summary?patient=P-5842": "5-year clinical summary (bilingual)",
      "/api/patient/medications?patient=P-5842": "Full medication profile with counseling",
      "/api/patient/labs?patient=P-5842": "Lab results with Arabic explanations",
      "/api/patient/plan?patient=P-5842": "Today's care plan + upcoming appointments",
    }
  }, null, 2), {
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
}
