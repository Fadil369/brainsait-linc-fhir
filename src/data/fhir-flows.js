export const FHIR_FLOWS = [
  { flow: "Patient Registration", resources: ["Patient", "Organization", "Coverage"], agents: ["healthcarelinc", "compliancelinc"], nphies: true },
  { flow: "Eligibility Check", resources: ["Coverage", "Parameters", "CoverageEligibilityRequest"], agents: ["claimlinc"], nphies: true },
  { flow: "Prior Authorization", resources: ["Claim", "ClaimResponse", "Task"], agents: ["claimlinc", "masterlinc"], nphies: true },
  { flow: "Claim Submission", resources: ["Claim", "ClaimResponse", "ExplanationOfBenefit"], agents: ["claimlinc", "masterlinc"], nphies: true },
  { flow: "Clinical Documentation", resources: ["Composition", "Condition", "MedicationRequest"], agents: ["doculinc", "clinicallinc"], nphies: false },
  { flow: "Imaging Study", resources: ["ImagingStudy", "DiagnosticReport", "Observation"], agents: ["radiolinc"], nphies: false },
  { flow: "Audit Logging", resources: ["AuditEvent", "Consent"], agents: ["compliancelinc"], nphies: false },
  { flow: "Care Coordination", resources: ["CarePlan", "Appointment", "Encounter"], agents: ["masterlinc", "healthcarelinc", "clinicallinc"], nphies: false },
  { flow: "Medication Reconciliation", resources: ["MedicationRequest", "MedicationDispense", "MedicationStatement"], agents: ["clinicallinc", "doculinc"], nphies: false },
  { flow: "Lab Results", resources: ["DiagnosticReport", "Observation", "Specimen"], agents: ["radiolinc", "clinicallinc"], nphies: false },
  { flow: "Discharge Summary", resources: ["Composition", "Encounter", "Condition", "MedicationRequest"], agents: ["doculinc", "clinicallinc"], nphies: false },
  { flow: "Appointment Scheduling", resources: ["Appointment", "Schedule", "Slot"], agents: ["healthcarelinc"], nphies: false },
];
