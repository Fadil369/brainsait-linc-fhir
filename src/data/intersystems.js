export const INTERSYSTEMS_ARCH = {
  namespace: "BRAINSAIT",
  productionClasses: [
    "BrainSAIT.Production.MASTERLINC",
    "BrainSAIT.Production.HEALTHCARELINC",
    "BrainSAIT.Production.CLAIMLINC",
    "BrainSAIT.Production.RADIOLINC",
    "BrainSAIT.Production.COMPLIANCELINC",
    "BrainSAIT.Production.CLINICALLINC",
    "BrainSAIT.Production.TTLINC",
    "BrainSAIT.Production.CONTEXTLINC",
    "BrainSAIT.Production.DOCULINC",
    "BrainSAIT.Production.ORACLEBRIDGE",
  ],
  fhirServer: "BrainSAIT.FHIR.Server",
  oauthServer: "BrainSAIT.Auth.OAuth2Server",
  smartOnFhir: {
    authEndpoint: "https://brainsait.io/auth/oauth2/authorize",
    tokenEndpoint: "https://brainsait.io/auth/oauth2/token",
    scope: "openid profile fhir-api launch patient/*.read patient/*.write user/*.read",
  },
  cdaAdapter: "BrainSAIT.CDA.Adapter",
  hl7Adapter: "BrainSAIT.HL7.InboundService",
  ipmModule: "brainsait-linc-fhir",
  ipmVersion: "3.2.0",
};

export const UNIFICATION_PLAN = [
  {
    phase: "Phase 1 — Inventory & Wire",
    duration: "Week 1",
    tasks: [
      "Register all CF Workers as IRIS Business Services under BRAINSAIT namespace",
      "Map each LINC agent to its InterSystems Production class",
      "Connect healthlinc-unified as the primary FHIR R4 endpoint (via Cloudflare Tunnel → IRIS FHIR Server)",
      "Bind healthlinc-mcp as the MCP tool provider for all agents",
    ],
    status: "ready",
  },
  {
    phase: "Phase 2 — FHIR Server Unification",
    duration: "Week 2",
    tasks: [
      "Deploy HAPI FHIR R4 server on Cloudflare D1 / R2 or IRIS HealthShare",
      "Route all /api/fhir/* requests through givc-api-router → givc-healthcare-api",
      "Implement SMART on FHIR OAuth2 using brainsait-unified auth endpoints",
      "Validate all FHIR resources with NPHIES Saudi profile (StructureDefinition)",
    ],
    status: "in-progress",
  },
  {
    phase: "Phase 3 — Agent Orchestration",
    duration: "Week 3",
    tasks: [
      "Promote brainsait-masterlinc-production as single orchestration entrypoint",
      "Wire MCP tools: authlinc, claimlinc, nphieslinc, doculinc, recordlinc, reviewerlinc",
      "Implement A2A (Agent-to-Agent) protocol between MASTERLINC and specialist LINCs",
      "Add FHIR Task resource as canonical inter-agent message envelope",
    ],
    status: "planned",
  },
  {
    phase: "Phase 4 — InterSystems IRIS Integration",
    duration: "Week 4",
    tasks: [
      "Deploy BrainSAIT.Production.MASTERLINC in IRIS production",
      "Map Oracle Bridge Worker to IRIS SQL/JDBC Business Operation",
      "Enable IRIS Analytics for FHIR population health dashboards",
      "Configure CDA Adapter for legacy hospital EHR data ingestion",
    ],
    status: "planned",
  },
];
