import { IrisConnector } from "./iris-connector.js";
import { callMiMo } from "./mimo-client.js";

const CF_MODEL = "@cf/meta/llama-3.2-3b-instruct";

export class AIAgent {
  constructor(name, goal, env) {
    this.name = name;
    this.goal = goal;
    this.env = env;
    this.iris = new IrisConnector(env);
    this.maxSteps = 5;
    this.memory = [];
  }

  async getPatientContext(patientId) {
    const [patient, conditions, medications, allergies, encounters, observations] = await Promise.all([
      this.iris.getPatient(patientId),
      this.iris.getConditions(patientId),
      this.iris.getMedications(patientId),
      this.iris.getAllergies(patientId),
      this.iris.getEncounters(patientId),
      this.iris.getObservations(patientId),
    ]);
    return { patient, conditions, medications, allergies, encounters, observations };
  }

  _repairJSON(s) {
    s = s.replace(/,\s*}/g, "}").replace(/,\s*\]/g, "]");
    s = s.replace(/([{,])\s*'([^']+)'\s*:/g, '$1"$2":');
    s = s.replace(/:\s*'([^']+)'/g, ':"$1"');
    try { JSON.parse(s); return s; } catch { return s; }
  }

  async reason(systemPrompt, userMessage) {
    const messages = [
      { role: "system", content: systemPrompt + "\n\nCRITICAL: Return ONLY valid JSON. NO markdown, NO code fences, NO explanation. Start with { and end with }." },
      ...this.memory.slice(-4),
      { role: "user", content: userMessage + "\n\nRespond ONLY with raw JSON." },
    ];

    let text = null;
    let mimoError = null;

    // 1. Try MiMo (primary LLM)
    if (this.env?.MIMO_API_KEY) {
      const mimo = await callMiMo(
        [{ role: "system", content: systemPrompt + "\n\nCRITICAL: Return ONLY valid JSON. NO markdown, NO code fences, NO explanation. Start with { and end with }." },
         { role: "user", content: userMessage + "\n\nRespond ONLY with raw JSON." }],
        systemPrompt, this.env
      );
      if (mimo.ok) {
        text = mimo.text;
      } else {
        mimoError = mimo.error;
      }
    }

    // 2. Fall back to Workers AI
    if (text === null && this.env?.AI) {
      try {
        const raw = await this.env.AI.run(CF_MODEL, { messages, max_tokens: 1500 });
        text = typeof raw.response === "string" ? raw.response
              : raw.response?.response || raw.response?.choices?.[0]?.message?.content
              || raw.choices?.[0]?.message?.content
              || JSON.stringify(raw);
      } catch (err) {
        text = null;
      }
    }

    // 3. Neither available
    if (text === null) {
      const detail = mimoError ? ` MiMo error: ${mimoError}` : "";
      return JSON.stringify({
        error: `AI unavailable.${detail} Configure MIMO_API_KEY or Workers AI binding.`,
        status: "unavailable",
        mimoKeyPresent: !!this.env?.MIMO_API_KEY,
        aiBindingPresent: !!this.env?.AI,
      });
    }

    // 4. JSON repair (shared across providers)
    text = String(text).replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const jsonMatch = text.match(/\{.*\}/s);
    if (jsonMatch) text = this._repairJSON(jsonMatch[0]);
    this.memory.push({ role: "user", content: userMessage }, { role: "assistant", content: text });
    return text;
  }

  async generateClinicalSummary(context, role) {
    const prompt = `You are ${this.name}, an AI healthcare agent specialized in ${this.goal}.

Patient: ${JSON.stringify(context.patient, null, 2)}
Active Conditions: ${JSON.stringify(context.conditions.map(c => c.code?.coding?.[0]?.display || c.code?.coding?.[0]?.code).filter(Boolean), null, 2)}
Current Medications: ${JSON.stringify(context.medications.map(m => m.medicationCodeableConcept?.coding?.[0]?.display || m.medicationReference?.display).filter(Boolean), null, 2)}
Allergies: ${JSON.stringify(context.allergies.map(a => a.code?.coding?.[0]?.display).filter(Boolean), null, 2)}
Recent Encounters: ${JSON.stringify(context.encounters.slice(0, 3).map(e => ({
  date: e.period?.start?.split("T")[0],
  type: e.type?.map(t => t.coding?.[0]?.display).join(", "),
  status: e.status
})), null, 2)}
Lab Results: ${JSON.stringify(context.observations.slice(0, 5).map(o => ({
  test: o.code?.coding?.[0]?.display,
  value: o.valueQuantity?.value,
  unit: o.valueQuantity?.unit,
  date: o.effectiveDateTime?.split("T")[0]
})), null, 2)}

Generate a concise clinical summary for a ${role}. Include:
1. Key diagnoses and their status
2. Current medications and adherence considerations
3. Critical allergies
4. Recent clinical activity
5. Recommended next steps
6. Risk factors or concerns

Format as structured JSON with sections.`;
    return this.reason(prompt, `Generate ${role} summary for patient ${context.patient?.id || "unknown"}`);
  }

  async evaluatePriorAuth(context, serviceCode) {
    const conditions = context.conditions || [];
    const medications = context.medications || [];
    const encounters = context.encounters || [];

    const prompt = `You are a prior authorization specialist. Evaluate if service ${serviceCode} is medically necessary for this patient.

Diagnoses: ${conditions.map(c => c.code?.coding?.[0]?.display).join(", ") || "None"}
Active Medications: ${medications.map(m => m.medicationCodeableConcept?.coding?.[0]?.display).join(", ") || "None"}
Recent Visits: ${encounters.length}

Evaluate: medical necessity, supporting evidence, missing documentation, and approval recommendation.
Provide evidence checklist and necessity score (0-1). Format as JSON.`;
    return this.reason(prompt, `Evaluate prior auth for ${serviceCode}`);
  }

  async identifyGaps(context) {
    const conditions = context.conditions || [];
    const prompt = `As a quality measure specialist, identify preventive care gaps for this patient.

Diagnoses: ${conditions.map(c => c.code?.coding?.[0]?.display).join(", ") || "None"}
Age: ${context.patient?.birthDate || "unknown"}
Gender: ${context.patient?.gender || "unknown"}

Based on USPSTF guidelines, identify missing screenings, vaccinations, and interventions.
For each gap: name, severity (high/medium/low), recommendation, and rationale.
Format as JSON with gaps array.`;
    return this.reason(prompt, "Identify care gaps");
  }

  async checkMedicationSafety(context) {
    const medications = context.medications || [];
    const allergies = context.allergies || [];
    const conditions = context.conditions || [];

    const medNames = medications.map(m => m.medicationCodeableConcept?.coding?.[0]?.display || "").filter(Boolean);
    const allergySubstances = allergies.map(a => a.code?.coding?.[0]?.display || "").filter(Boolean);
    const conditionNames = conditions.map(c => c.code?.coding?.[0]?.display || "").filter(Boolean);

    const prompt = `As a clinical pharmacist, review medications for safety concerns.

Medications: ${JSON.stringify(medNames)}
Allergies: ${JSON.stringify(allergySubstances)}
Conditions: ${JSON.stringify(conditionNames)}

Check for:
1. Drug-allergy contraindications
2. Drug-drug interactions
3. Therapeutic duplications
4. Dosing concerns based on conditions
5. Monitoring recommendations

Format as JSON with interactions, warnings, recommendations.`;
    return this.reason(prompt, "Medication safety review");
  }

  async generateCarePlan(context) {
    const conditions = context.conditions || [];
    const medications = context.medications || [];

    const prompt = `As a care coordinator, generate a structured care plan.

Diagnoses: ${conditions.map(c => c.code?.coding?.[0]?.display).join(", ") || "None"}
Medications: ${medications.map(m => m.medicationCodeableConcept?.coding?.[0]?.display || "").filter(Boolean).join(", ")}

Generate a 90-day care plan including:
1. Condition-specific goals (SMART format)
2. Medication management plan
3. Follow-up schedule
4. Required referrals
5. Patient education topics
6. Monitoring parameters

Format as JSON with title, goals, interventions, schedule.`;
    return this.reason(prompt, "Generate care plan");
  }

  async evaluateReadmissionRisk(context) {
    const conditions = context.conditions || [];
    const encounters = context.encounters || [];
    const medications = context.medications || [];

    const age = context.patient?.birthDate;
    const prompt = `As a risk stratification specialist, evaluate hospital readmission risk.

Age DOB: ${age || "unknown"}
Conditions: ${conditions.map(c => c.code?.coding?.[0]?.display).join(", ") || "None"}
Recent Encounters: ${encounters.length} in last period
Medications: ${medications.length} active

Calculate risk score (0-100) considering:
- Age (>65 = higher risk)
- Chronic conditions (CHF, COPD, CKD, diabetes)
- Polypharmacy (>5 meds)
- Recent admissions
- Social determinants

Format as JSON with riskScore, riskLevel, riskFactors, recommendations.`;
    return this.reason(prompt, "Evaluate readmission risk");
  }

  async clinicalTrialMatching(context) {
    const conditions = context.conditions || [];
    const prompt = `As a clinical trial matcher, find relevant trials for this patient.

Diagnoses: ${conditions.map(c => c.code?.coding?.[0]?.display).join(", ") || "None"}
Age: ${context.patient?.birthDate || "unknown"}
Gender: ${context.patient?.gender || "unknown"}

Recommend suitable clinical trials based on conditions. Include:
- Trial name and phase
- Eligibility criteria match
- Location and contact
- Relevance score (0-1)

Format as JSON with trials array.`;
    return this.reason(prompt, "Match clinical trials");
  }

  async triageAssessment(context, symptoms) {
    const conditions = context.conditions || [];
    const prompt = `As an emergency triage nurse, assess urgency for: ${symptoms}

Patient History: ${conditions.map(c => c.code?.coding?.[0]?.display).join(", ") || "None"}

Determine:
1. Triage level (immediate/urgent/semi-urgent/non-urgent)
2. Triage score (1-5)
3. Recommended actions
4. Red flags to monitor
5. Disposition recommendation

Format as JSON with level, score, actions, disposition.`;
    return this.reason(prompt, `Triage assessment for: ${symptoms}`);
  }

  async generateSDOHReferrals(context) {
    const conditions = context.conditions || [];
    const prompt = `As a social worker, identify social determinant needs.

Diagnoses: ${conditions.map(c => c.code?.coding?.[0]?.display).join(", ") || "None"}
Chronic conditions that may indicate social needs: diabetes, hypertension, asthma, CKD

Assess needs for:
1. Food security resources
2. Transportation assistance
3. Medication affordability programs
4. Home health services
5. Community support groups
6. Mental health resources

Format as JSON with referrals array (type, organization, description, priority).`;
    return this.reason(prompt, "Generate SDOH referrals");
  }

  async analyzeQuery(context, query) {
    const prompt = `As a clinical NLP specialist, analyze this natural language query about the patient.

Query: "${query}"

Patient Data:
Conditions: ${JSON.stringify(context.conditions.map(c => c.code?.coding?.[0]?.display))}
Medications: ${JSON.stringify(context.medications.map(m => m.medicationCodeableConcept?.coding?.[0]?.display))}
Observations: ${JSON.stringify(context.observations.slice(0, 3).map(o => ({
  name: o.code?.coding?.[0]?.display,
  value: o.valueQuantity?.value
})))}

Determine:
1. Intent (what the user wants to know)
2. FHIR query needed
3. Answer based on available data
4. Confidence in answer (0-1)
5. Missing data that would help

Format as JSON with intent, fhirQuery, answer, confidence.`;
    return this.reason(prompt, `Analyze: ${query}`);
  }

  async generateImagingFollowup(context) {
    const conditions = context.conditions || [];
    const prompt = `As a imaging follow-up coordinator, identify needed imaging.

Conditions: ${conditions.map(c => c.code?.coding?.[0]?.display).join(", ") || "None"}

Based on guidelines, identify:
1. Recommended imaging studies with rationale
2. Follow-up intervals
3. Previous study review needed
4. Priority level

Format as JSON with studies and reminders arrays.`;
    return this.reason(prompt, "Imaging follow-up assessment");
  }

  async explainLabs(context) {
    const observations = context.observations || [];
    const conditions = context.conditions || [];

    const prompt = `As a lab result interpreter, explain these lab values.

Labs: ${JSON.stringify(observations.slice(0, 10).map(o => ({
  test: o.code?.coding?.[0]?.display,
  value: o.valueQuantity?.value,
  unit: o.valueQuantity?.unit,
  range: o.referenceRange?.[0]?.text
})), null, 2)}

Diagnoses: ${conditions.map(c => c.code?.coding?.[0]?.display).join(", ") || "None"}

For each lab:
1. Current value and reference range
2. Interpretation (normal/high/low/abnormal)
3. Clinical significance in context
4. Trending (comparing to typical patterns)
5. Follow-up recommendations

Format as JSON with results array.`;
    return this.reason(prompt, "Explain lab results");
  }
}
