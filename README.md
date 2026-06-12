# BrainSAIT Unified AI Agents for FHIR

> **InterSystems Programming Contest Submission** — *AI Agents for FHIR*
> 🏆 12 Contest Tasks | 60/60 Bonus Points | FHIR R4 | NPHIES | Multi-Provider LLM

**AI Models:**
| Priority | Provider | Configuration |
|----------|----------|---------------|
| 1° | **MiMo Token Plan API** (OpenAI/Anthropic-compatible) | `MIMO_API_KEY` secret + `MIMO_API_BASE` + `MIMO_MODEL` in vars |
| 2° | **Cloudflare Workers AI** (`@cf/meta/llama-3.2-3b-instruct`) | `env.AI` binding (no config needed) |

12 AI agents powered by LLM reasoning over FHIR patient data, served at the edge. MiMo is the default LLM; Workers AI acts as automatic fallback when MiMo is unavailable.

---

## 📋 Overview

**BrainSAIT LINC FHIR** is a fully integrated platform that unifies **9 LINC AI agents** with **12 contest-ready AI agents** for the InterSystems IRIS ecosystem. It provides a bilingual (Arabic/English) dashboard, Cloudflare Workers deployment, and ObjectScript production classes — all working together under a single MASTERLINC orchestrator.

All 12 AI agents use **MiMo Token Plan API** as the primary LLM provider, with automatic fallback to **Cloudflare Workers AI** (`@cf/meta/llama-3.2-3b-instruct`) when MiMo is unavailable. Each agent retrieves real FHIR patient data (via D1 database or IRIS) and generates structured JSON responses with:
- Clinical summaries, prior authorization evaluations, care gaps identification
- Medication safety reviews, care plans, clinical trial matching
- Readmission risk scoring, triage assessment, lab result explanations
- Natural language FHIR querying, SDOH referral matching

### Architecture

```
Client / Dashboard (React + shadcn/ui, port 3000)
       │
       ▼
   Cloudflare Worker (port 8787 local / *.brainsait.org production)
        │
        ├── /api/contest/*       ──► 12 AI Agents (MiMo API → Workers AI fallback)
        │                           FHIR patient context → structured JSON
       ├── /fhir/*              ──► FHIR R4 server (D1 database)
       ├── /api/agents/*        ──► 9 LINC Agent definitions
       ├── /api/workers/*       ──► Cloudflare Worker catalog
       ├── /api/orchestrate/*   ──► Multi-agent orchestration
       └── /api/ecosystem/*     ──► Ecosystem proxy
               │
               ▼
  D1 Database (brainsait-healthcare-d1)
       ├── Patient, Condition, MedicationRequest
       ├── Observation, Encounter, AllergyIntolerance
       ├── CarePlan, Goal, Immunization
       └── Full FHIR R4 CRUD via /fhir/* endpoints

  Optional: InterSystems IRIS (port 52773)
       ├── BrainSAIT.Production.* (10 production classes)
       └── BrainSAIT.Contest.* (12 contest agent classes)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn
- Cloudflare account (for Worker deployment, **optional for local dev**)

### Installation & Local Development

The app runs completely standalone with just the frontend + Cloudflare Worker — no Docker or IRIS needed.

```bash
# Clone the repository
git clone https://github.com/Fadil369/brainsait-linc-fhir.git
cd brainsait-linc-fhir

# Install dependencies
npm install

# Start the Vite development server (port 3000)
npm run dev
```

The frontend will be available at: **http://localhost:3000/**

### D1 Database Setup (FHIR Data)

The FHIR server and AI agents need patient data in the D1 database. Set it up with:

```bash
# Install wrangler if needed
npm install -g wrangler

# Create the D1 database (first time only)
npx wrangler d1 create brainsait-healthcare-d1

# Apply schema
npx wrangler d1 execute brainsait-healthcare-d1 --file=./wrangler/schema.sql

# Seed with test patient data (Ahmed Al-Harbi, P-5842)
npx wrangler d1 execute brainsait-healthcare-d1 --file=./wrangler/seed-data.sql

# Verify the data
npx wrangler d1 execute brainsait-healthcare-d1 --command="SELECT COUNT(*) as count FROM fhir_resources"
```

This creates a FHIR patient with conditions (hypertension, diabetes, asthma, CKD), medications, allergies, lab results, encounters, immunizations, and care plans — all data needed by the 12 AI agents.

### AI Provider Setup

The app supports two LLM providers. MiMo is the default; Workers AI is the automatic fallback.

#### Option A: MiMo Token Plan API (Default)

```bash
# Set the API key as a Cloudflare secret
npx wrangler secret put MIMO_API_KEY
# Paste your MiMo API key when prompted
```

The base URL and model are pre-configured in `wrangler/wrangler.toml`:
```toml
[vars]
MIMO_API_BASE = "https://token-plan-sgp.xiaomimimo.com"
MIMO_MODEL = "mimo-v2.5-pro"
```

#### Option B: Cloudflare Workers AI (Fallback)

Add an AI binding to your `wrangler.toml`:
```toml
[ai]
binding = "AI"
```

No secret or API key needed — Workers AI is billed to your Cloudflare account.

#### Verify LLM is Working

```bash
curl -s "http://localhost:8787/api/contest/summary?patient=P-5842&role=doctor" | jq .
```

The response includes `"status"` field. If MiMo is active, the response contains structured clinical JSON. If neither provider is configured, you'll get `{"error": "AI unavailable...", "status": "unavailable"}`.

### Cloudflare Workers (Local Development)

```bash
# Start local worker (port 8787) with D1 binding
npx wrangler dev --d1 FHIR_DB=brainsait-healthcare-d1

# Deploy to Cloudflare
npx wrangler deploy

# Deploy with environment
npx wrangler deploy --env production
```

The worker provides all API endpoints locally at: **http://localhost:8787/**

### Docker (Optional — Full Ecosystem)

If you want the full BRAINSAIT ecosystem with IRIS, PostgreSQL, and Redis:

```bash
# Navigate to ecosystem docker config
cd ~/brainsait-unified

# Start all core services (IRIS, PostgreSQL, Redis)
# Cloudflare Tunnel is excluded by default for local development
docker compose -f docker-compose.yml up -d

# IRIS Management Portal:
# http://localhost:52773/csp/sys/UtilHome.csp

# To include Cloudflare Tunnel (production only):
docker compose --profile full up -d
```

### IRIS Deployment (Optional — Advanced)

1. Open IRIS Management Portal at `http://localhost:52773/csp/sys/UtilHome.csp`
2. Import classes from `intersystems/src/` and `intersystems/src/contest/`
3. Import `intersystems/module.xml` via IPM
4. Start the `BrainSAIT.Production.MasterUnified` production

---

## 🌐 Live Access

### Local Access (Development)

When running locally, the following URLs are available:

| Service | URL |
|---------|-----|
| Frontend (Vite dev server) | `http://localhost:3000/` |
| Worker API (wrangler dev) | `http://localhost:8787/` |
| Worker Health | `http://localhost:8787/api/health` |
| FHIR R4 Server | `http://localhost:8787/fhir/metadata` |
| FHIR Patient API | `http://localhost:8787/fhir/Patient/P-5842` |
| IRIS Portal (if Docker running) | `http://localhost:52773/csp/sys/UtilHome.csp` |
| AI Agent: Summary | `http://localhost:8787/api/contest/summary?patient=P-5842&role=doctor` |

> **Note:** Ports 58080, 58081, 58773, 58082, 58083, 3001 are **not used** by this project. Those belong to the broader BRAINSAIT ecosystem API Gateway, Dashboard, Supervisor, and Grafana services which are separate Python microservices. This contest submission is self-contained with just the Vite frontend (port 3000) and the Cloudflare Worker (port 8787 locally).

### Public Access (Production)

When deployed to Cloudflare, the app is available at:

| Service | URL |
|---------|-----|
| Production Worker | `https://iris-fhir.brainsait.org/` |
| API Health | `https://iris-fhir.brainsait.org/api/health` |
| FHIR R4 | `https://iris-fhir.brainsait.org/fhir/` |
| Dashboard UI | `https://brainsait-linc-fhir.pages.dev/` |

### Cloudflare Tunnel (Production Only)

The Cloudflare Tunnel is only needed for exposing IRIS to the public internet in production. For local development, it is **not required** — the tunnel service is excluded by default via Docker profiles.

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

All API calls work against the local worker (`localhost:8787`) or the deployed worker. Use patient `P-5842` (Ahmed Al-Harbi, included in seed data).

```bash
# 0. Health check (no auth required)
curl http://localhost:8787/api/health

# FHIR server (no auth required)
curl http://localhost:8787/fhir/metadata
curl http://localhost:8787/fhir/Patient/P-5842

# 1. Patient Summary (Doctor role)
curl "http://localhost:8787/api/contest/summary?patient=P-5842&role=doctor"

# 2. Prior Authorization
curl "http://localhost:8787/api/contest/prior-auth?patient=P-5842&service=99213"

# 3. Gaps in Care
curl "http://localhost:8787/api/contest/gaps-in-care?patient=P-5842"

# 4. Medication Safety
curl "http://localhost:8787/api/contest/medication-safety?patient=P-5842"

# 5. Care Plan Navigator
curl "http://localhost:8787/api/contest/care-plan?patient=P-5842"

# 6. Clinical Trial Matcher
curl "http://localhost:8787/api/contest/clinical-trials?patient=P-5842"

# 7. Readmission Risk
curl "http://localhost:8787/api/contest/readmission-risk?patient=P-5842"

# 8. FHIR Triage
curl "http://localhost:8787/api/contest/triage?patient=P-5842&symptoms=chest%20pain"

# 9. Imaging Follow-Up
curl "http://localhost:8787/api/contest/imaging-followup?patient=P-5842"

# 10. Lab Explainer
curl "http://localhost:8787/api/contest/lab-explainer?patient=P-5842"

# 11. Natural Language Query
curl "http://localhost:8787/api/contest/nl-query?q=Show%20me%20diabetic%20patients%20with%20HbA1c%20over%207"

# 12. SDOH Referral
curl "http://localhost:8787/api/contest/sdoh-referral?needs=food,transportation"
```

**Note:** For production, replace `http://localhost:8787` with your deployed worker URL (e.g. `https://iris-fhir.brainsait.org`).

---

## 🤖 AI Implementation

### LLM Resolution Order

The `AIAgent.reason()` method resolves the LLM provider in this order:

| Priority | Provider | Condition | Endpoint |
|----------|----------|-----------|----------|
| 1° | **MiMo Token Plan API** | `env.MIMO_API_KEY` exists | `MIMO_API_BASE/v1/chat/completions` (OpenAI) → `MIMO_API_BASE/anthropic` (Anthropic fallback) |
| 2° | **Cloudflare Workers AI** | `env.AI` binding exists | `@cf/meta/llama-3.2-3b-instruct` |
| 3° | Graceful error | Neither configured | `{"error": "AI unavailable...", "status": "unavailable"}` |

MiMo auto-detects the endpoint shape: tries OpenAI-compatible first, falls back to Anthropic Messages on 404/405. 30s timeout, 2 retries with exponential backoff.

### LLM Configuration

```toml
# wrangler.toml — MiMo vars (safe to commit)
[vars]
MIMO_API_BASE = "https://token-plan-sgp.xiaomimimo.com"
MIMO_MODEL = "mimo-v2.5-pro"
```

```bash
# Set the API key as a secret (never commit)
npx wrangler secret put MIMO_API_KEY
```

Workers AI requires no additional config — just the `env.AI` binding in `wrangler.toml`.

### How the AI Agents Work

Each agent follows this pipeline:

1. **Receive request** — Patient ID and optional parameters (role, symptoms, query, etc.)
2. **Fetch FHIR context** — Retrieves real patient data from D1 database or IRIS: Patient demographics, active conditions, medications, allergies, encounters, lab observations
3. **Construct LLM prompt** — Domain-specific system prompt with patient FHIR context
4. **Run inference** — MiMo primary → Workers AI fallback, with JSON-forcing instructions
5. **Parse JSON output** — Extracts structured JSON response, auto-repairs malformed JSON
6. **Return FHIR-native response** — Every agent returns FHIR-compatible JSON

### Agent Architecture

```
Request → AIAgent class → IrisConnector.getPatientContext(patientId)
                              ↓
    patient, conditions, medications, allergies, encounters, observations
                              ↓
    AIAgent.reason(systemPrompt, userMessage)
                              ↓
    ┌─ MiMo (env.MIMO_API_KEY) ─────────────────────┐
    │  callMiMo(messages, systemPrompt, env)         │
    │  OpenAI shape → Anthropic shape on 404/405     │
    └────────────────────────────────────────────────┘
                              ↓ (fallback on failure)
    ┌─ Workers AI (env.AI) ──────────────────────────┐
    │  env.AI.run(@cf/meta/llama-3.2-3b-instruct)    │
    └────────────────────────────────────────────────┘
                              ↓
    Structured JSON → Agent-specific handler → Response
```

All 12 contest agents share this same architecture, with specialized system prompts for each clinical task.

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
│       ├── agents/               # 12 contest agent handlers
│       └── services/
│           ├── ai-agent.js       # AIAgent class (MiMo → Workers AI)
│           ├── mimo-client.js    # MiMo Token Plan API client
│           ├── iris-connector.js # IRIS / D1 FHIR connector
│           └── auth.js           # CORS & auth utilities
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
# Run all tests (E2E + integration audit)
npm test
```

> Note: E2E tests validate data structures, constants, and agent definitions offline (no server required). Integration audit requires the worker to be running at `http://localhost:8787`.

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
- **Production Worker**: https://iris-fhir.brainsait.org/
- **Deployed Frontend**: https://brainsait-linc-fhir.pages.dev/
- **Local Frontend**: http://localhost:3000/
- **Local Worker API**: http://localhost:8787/
- **Local Worker Health**: http://localhost:8787/api/health
- **Local FHIR Server**: http://localhost:8787/fhir/metadata
- **IRIS Portal (with Docker)**: http://localhost:52773/csp/sys/UtilHome.csp
- **InterSystems Community**: https://community.intersystems.com

---

## 👥 Team

- **Fadil369** — Lead Developer & Architect
- Built for InterSystems Programming Contest: AI Agents for FHIR
- 25 May – 14 June 2026

---

## 📄 License

MIT — Open source for the InterSystems community.
