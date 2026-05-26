# BrainSAIT Unified AI Agents for FHIR

> **InterSystems Programming Contest Submission** — *AI Agents for FHIR*
> 🏆 12 Contest Tasks | 60/60 Bonus Points | FHIR R4 | NPHIES | Cloudflare Edge

---

## 📋 Overview

**BrainSAIT LINC FHIR** is a fully integrated platform that unifies **9 LINC AI agents** with **12 contest-ready AI agents** for the InterSystems IRIS ecosystem. It provides a bilingual (Arabic/English) dashboard, Cloudflare Workers deployment, and ObjectScript production classes — all working together under a single MASTERLINC orchestrator.

### Architecture

```
Client / Dashboard (React + shadcn/ui)
       │
       ▼
  brainsait-api-gateway ──► JWT · CORS · Rate Limit
       │
       ├── /api/agents/*        ──► 9 LINC Agent endpoints
       ├── /api/contest/*       ──► 12 Contest AI Agent endpoints
       ├── /api/fhir/*          ──► FHIR R4 resources
       ├── /api/compliance/*    ──► HIPAA/NPHIES audit
       └── /api/intersystems/*  ──► IRIS bridge
               │
               ▼
  Cloudflare Workers (25 total)
       │
       ▼
  InterSystems IRIS Production (BRAINSAIT namespace)
       │
       ├── BrainSAIT.Production.MASTERLINC
       ├── BrainSAIT.Production.CLAIMLINC
       ├── BrainSAIT.Production.* (10 production classes)
       └── BrainSAIT.Contest.* (12 contest agent classes)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- InterSystems IRIS for Health (Community Edition)
- Cloudflare account (for Worker deployment)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Fadil369/brainsait-linc-fhir.git
cd brainsait-linc-fhir

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### IRIS Deployment

1. Open IRIS Management Portal
2. Import classes from `intersystems/src/` and `intersystems/src/contest/`
3. Import `intersystems/module.xml` via IPM
4. Start the `BrainSAIT.Production.MasterUnified` production

### Cloudflare Workers

```bash
# Navigate to wrangler config
cd wrangler

# Deploy the unified worker
npx wrangler deploy

# Deploy with environment
npx wrangler deploy --env production
```

---

## 🏆 Contest AI Agents (12 Tasks × 5 Bonus Points = 60)

| # | Agent | Endpoint | Bonus Feature | FHIR Output |
|---|---|---|---|---|
| 1 | **Smart Patient Summary Generator** | `/api/contest/summary` | Role-tailored summaries (doctor/care manager/patient) | `DocumentReference` |
| 2 | **FHIR Prior Authorization Copilot** | `/api/contest/prior-auth` | Missing evidence checklist | `Claim` + `Bundle` |
| 3 | **Gaps-in-Care Finder** | `/api/contest/gaps-in-care` | Bilingual AI outreach (Arabic/English) | `DetectedIssue` |
| 4 | **Medication Safety Assistant** | `/api/contest/medication-safety` | Patient counseling explanations | `Parameters` |
| 5 | **Care Plan Navigator** | `/api/contest/care-plan` | Auto-create FHIR Task resources | `CarePlan` + `Task` |
| 6 | **Clinical Trial Matcher** | `/api/contest/clinical-trials` | Missing criteria prompts | `Bundle` |
| 7 | **Readmission Risk Workbench** | `/api/contest/readmission-risk` | Next steps as Tasks/CarePlans | `Parameters` |
| 8 | **Conversational FHIR Triage** | `/api/contest/triage` | Coded FHIR Observations | `QuestionnaireResponse` |
| 9 | **Imaging Follow-Up Tracker** | `/api/contest/imaging-followup` | AI clinician reminders | `ImagingStudy` |
| 10 | **Patient-Friendly Lab Explainer** | `/api/contest/lab-explainer` | Educational content links | `Bundle` + `Observation` |
| 11 | **NL to FHIR Query Explorer** | `/api/contest/nl-query` | Display generated FHIR/SQL queries | `Parameters` |
| 12 | **SDOH Community Referral** | `/api/contest/sdoh-referral` | Vector Search semantic matching | `Bundle` + `Task` |

### 🔍 Demo API Calls

```bash
# 1. Patient Summary (Doctor role)
curl "https://brainsait.io/api/contest/summary?patient=Patient/101&role=doctor"

# 2. Prior Authorization
curl "https://brainsait.io/api/contest/prior-auth?patient=Patient/101&service=99213"

# 3. Gaps in Care
curl "https://brainsait.io/api/contest/gaps-in-care?patient=Patient/101"

# 4. Medication Safety
curl "https://brainsait.io/api/contest/medication-safety?patient=Patient/101"

# 5. Care Plan Navigator
curl "https://brainsait.io/api/contest/care-plan?patient=Patient/101"

# 6. Clinical Trial Matcher
curl "https://brainsait.io/api/contest/clinical-trials?patient=Patient/101"

# 7. Readmission Risk
curl "https://brainsait.io/api/contest/readmission-risk?patient=Patient/101"

# 8. FHIR Triage
curl "https://brainsait.io/api/contest/triage?patient=Patient/101&symptoms=chest%20pain"

# 9. Imaging Follow-Up
curl "https://brainsait.io/api/contest/imaging-followup?patient=Patient/101"

# 10. Lab Explainer
curl "https://brainsait.io/api/contest/lab-explainer?patient=Patient/101"

# 11. Natural Language Query
curl "https://brainsait.io/api/contest/nl-query?q=Show%20me%20diabetic%20patients%20with%20HbA1c%20over%207"

# 12. SDOH Referral
curl "https://brainsait.io/api/contest/sdoh-referral?needs=food,transportation"
```

---

## 🔧 LINC Core Agents

| Agent | Role | FHIR Resources | IRIS Class |
|---|---|---|---|
| **MASTERLINC** 🧠 | Orchestrator | Bundle, Task, MessageHeader | `BrainSAIT.Production.MASTERLINC` |
| **ClaimLinc** 📋 | NPHIES Claims | Claim, ClaimResponse, Coverage | `BrainSAIT.Production.CLAIMLINC` |
| **RadioLinc** 🔬 | DICOM / Lab | ImagingStudy, DiagnosticReport | `BrainSAIT.Production.RADIOLINC` |
| **ComplianceLinc** 🛡️ | HIPAA/NPHIES Audit | AuditEvent, Consent | `BrainSAIT.Production.COMPLIANCELINC` |
| **ClinicalLinc** ⚕️ | CDS Hooks v2 | Condition, MedicationRequest | `BrainSAIT.Production.CLINICALLINC` |
| **HealthcareLinc** 🏥 | FHIR R4 Patient | Patient, Encounter, Appointment | `BrainSAIT.Production.HEALTHCARELINC` |
| **TTLinc** 🌐 | Arabic/English Translation | Basic, Parameters | `BrainSAIT.Production.TTLINC` |
| **ContextLinc** 📂 | RAG / OCR | DocumentReference, Binary | `BrainSAIT.Production.CONTEXTLINC` |
| **DocuLinc** 📝 | Clinical Documentation | Composition, DiagnosticReport | `BrainSAIT.Production.DOCULINC` |

---

## 🏗️ Project Structure

```
brainsait-linc-fhir/
├── src/                          # React Frontend (shadcn/ui)
│   ├── App.jsx                   # Main app with 6 tabs
│   ├── main.jsx                  # Entry point
│   ├── index.css                 # Tailwind CSS v4 config
│   ├── data/                     # Data layer (agents, workers, flows)
│   ├── components/               # UI components
│   │   ├── ui/                   # shadcn/ui primitives
│   │   └── *.jsx                 # Page-level components
│   └── lib/                      # Utility functions
├── wrangler/                     # Cloudflare Workers
│   ├── wrangler.toml             # Worker configuration
│   └── src/
│       ├── index.js              # Router with 20+ endpoints
│       └── agents/               # 12 contest agent handlers
├── intersystems/                 # InterSystems IRIS
│   ├── module.xml                # IPM package manifest
│   └── src/
│       ├── BrainSAIT.Production.* # 10 production classes
│       ├── BrainSAIT.Audit.*     # HIPAA & NPHIES audit
│       ├── BrainSAIT.Validation.*# Saudi National ID validator
│       └── contest/              # 12 contest agent classes
├── test/                         # Test suites
│   ├── e2e.js                    # 417 E2E tests
│   └── integration-audit.js      # 208 integration checks
└── package.json
```

---

## 🧪 Testing

```bash
# Run all E2E tests (417)
npm test

# Run integration chain audit (208)
node test/integration-audit.js

# Both suites: 625 total checks, 0 failures
```

---

## 🌐 Bilingual Support

The entire platform is bilingual (Arabic/English):
- Dashboard tabs, agent names, and descriptions
- Gaps-in-Care outreach messages
- Medication safety counseling
- Lab result explanations (Grade 6 reading level)
- Imaging follow-up reminders
- SDOH referral descriptions

---

## 🛡️ Compliance

- **HIPAA**: Audit logging via `BrainSAIT.Audit.HIPAA` — all agent calls logged
- **NPHIES**: Saudi healthcare standards with National ID validation (checksum)
- **SMART on FHIR**: OAuth2 with launch scopes
- **RBAC**: Role-based access control via ComplianceLinc

---

## 📊 Dashboard

The React dashboard includes 6 tabs:

| Tab | Content |
|---|---|
| **LINC Agents** | 9 agents with search, expand, health status |
| **FHIR Flows** | 12 clinical workflows with NPHIES flags |
| **🏆 Contest** | 12 AI agents with scorecard (60/60 bonus pts) |
| **CF Workers** | 24 workers with type filtering |
| **InterSystems** | IRIS config, 25 production classes, ObjectScript sample |
| **Unification Plan** | 4-phase roadmap with status tracking |

---

## 📹 Demo Video Script

### Title: BrainSAIT — Unified AI Agents for FHIR
*Duration: 3-4 minutes*

**Scene 1: Dashboard Overview (0:00-0:30)**  
Show the main dashboard with 6 tabs. Highlight the bilingual (Arabic/English) interface. Point out the 9 LINC agents and 24 CF Workers badges.

**Scene 2: Contest Agents (0:30-1:30)**  
Navigate to the 🏆 Contest tab. Show the 60/60 bonus scorecard. Run 3 live API demos:
- Patient Summary Generator with role=doctor
- Gaps-in-Care Finder with bilingual outreach
- Medication Safety with drug interactions

**Scene 3: FHIR Integration (1:30-2:30)**  
Show the FHIR Flows tab. Demonstrate the 12 clinical workflows. Run the NL Query Explorer: "Show me diabetic patients with HbA1c over 7" — show the generated FHIR and SQL queries.

**Scene 4: IRIS Architecture (2:30-3:30)**  
Navigate to the InterSystems tab. Show the 25 production classes. Display the MASTERLINC ObjectScript sample. Demonstrate how FHIR Task envelopes route between agents.

**Scene 5: Wrap Up (3:30-4:00)**  
Show the test suite passing (417 E2E + 208 integration = 0 failures). Open source on GitHub. Call to action.

---

## 🔗 Links

- **GitHub**: https://github.com/Fadil369/brainsait-linc-fhir
- **Dashboard**: https://brainsait.io
- **API Health**: https://brainsait.io/api/health
- **InterSystems Community**: https://community.intersystems.com

---

## 👥 Team

- **Fadil369** — Lead Developer & Architect
- Built for InterSystems Programming Contest: AI Agents for FHIR
- 25 May – 14 June 2026

---

## 📄 License

MIT — Open source for the InterSystems community.
