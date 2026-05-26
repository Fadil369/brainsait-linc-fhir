# Brainsait Unified Ecosystem - Infrastructure Audit

*Generated: 2026-05-26*

---

## Summary

| Resource | Count | Status |
|----------|-------|--------|
| Cloudflare Pages | 10 | Active |
| Cloudflare Workers | 130+ | Active |
| Durable Objects | 20 | Active |
| KV Namespaces | 20 | Active |
| D1 Databases | Limited | Review |
| R2 Buckets | None | Setup Needed |

---

## Pages (Frontends)

| Project | Domain | Purpose |
|---------|--------|---------|
| brainsait-linc-fhir | brainsait-linc-fhir.pages.dev | FHIR LINC Portal |
| brainsait-org | brainsait-org.pages.dev | Main Org Site |
| brainforge-novel | brainforge-novel.pages.dev | (×8) Novel Forges |

---

## Workers - Organized by Category

### 🎯 CORE PLATFORM (8)
- `brainsait-unified-platform`
- `brainsait-unified-engine`
- `brainsait-orchestrator`
- `brainsait-masterlinc-production` ← MasterLINC
- `brainsait-linc-production`
- `brainsait-linc-platform`
- `brainsait-linc-fhir-unified`
- `brainsait-mcp` / `brainsait-mcp-production`

### 🏥 HEALTHCARE (12)
- `brainsait-healthcare-api`
- `brainsait-healthcare-gateway`
- `healthbridge-api-gateway`
- `healthbridge-compliance-db`
- `healthbridge-document-store`
- `healthbridge-nphies-proxy`
- `nphies-claimlinc`
- `nphies-mirror`
- `nphies-service`
- `brainsait-enrollment-api`
- `brainsait-sdc-engine`
- `brainsait-drg-suite`

### 👥 GIVC LINC Agents (6)
- `givc-linc-agents`
- `givc-linc-agents-container`
- `givc-linc-workflows`
- `givc-core-academy-backend`
- `givc-core-academy-unified`
- `givc-portal`

### 💳 BASMA Ecosystem (7)
- `basma-api` / `basma-api-prod`
- `basma-gateway`
- `basma-crm`
- `basma-portal`
- `basma-voice-agent`
- `basma-hotels-landing`
- `basma-api-worker-BASMA_RATE_LIMIT`

### 🔐 AUTH & SECURITY (4)
- `brainsait-auth-gateway-prod`
- `brainsait-sso`
- `brainsait-stripe-identity`
- `brainsait-webhooks`

### 📞 COMMUNICATION (4)
- `brainsait-voice`
- `basma-voice-agent`
- `brainsait-telegram-bot-prod`
- `brainsait-chat-widget` / `-prod`

### 📊 DATA & ANALYTICS (5)
- `brainsait-data-hub-prod`
- `brainsait-realtime-hub`
- `brainsait-ai-mesh`
- `brainsait-ml-inference-prod`
- `brainsait-schema-registry-prod`

### 🇸🇩 SUDAN (3)
- `sudan-gov-api`
- `sudan-gov-api-staging`

### ⚡ OTHER (80+)
- `brainsait-backend-production`
- `brainsait-api-gateway`
- `brainsait-app-router`
- `brainsait-paypal`
- `brainsait-product-inventory`
- `oracle-claim-scanner`
- `patient-service`
- Many more...

---

## Durable Objects (Real-Time)

| Namespace | Class | Purpose |
|-----------|-------|---------|
| brainsait-linc-platform | FHIRLincContainer | FHIR Processing |
| brainsait-linc-platform | HealthLincContainer | Health Data |
| brainsait-linc-platform | MasterLincContainer | Master Orchestrator |
| brainsait-linc-platform | PayLincContainer | Payments |
| brainsait-ecosystem | ChatAgent | Chat |
| brainsait-ecosystem | AppController | App Control |
| givc-linc-agents | MasterLincAgent | Claims Processing |
| givc-linc-agents | ClaimsLincAgent | Claims |
| givc-linc-agents | AuditLincAgent | Audit |
| givc-linc-agents | LearningLincAgent | Learning |
| cf-containers | MyContainer | General Container |
| cf-containers | NphiesContainer | NPHIES |
| vibesdk | CodeGeneratorAgent | Code Gen |
| sudan-gov-api | RateLimiterDO | Rate Limiting |

---

## KV Namespaces (Caching/Sessions)

- `SESSIONS` / `UNIFIED_SESSIONS`
- `brainsait-feature-flags`
- `brainsait-event-log`
- `BOT_KV`
- `brainsait-webhook-secrets`
- `PARTNER_APPLICATIONS`
- `OID_REGISTRY`
- `PORTAL_HEALTH`
- `OBSIDIAN_SYNC`
- `basma-api-worker-BASMA_RATE_LIMIT`
- `sudan-gov-*` (3 namespaces)

---

## Consolidation Opportunities

### 🔴 Overlap Detected

1. **Multiple LINC Platforms**
   - `brainsait-linc-*-production` × 3
   - `givc-linc-*` × 4
   - Recommendation: Single MasterLINC with feature flags

2. **Duplicate Auth Gateways**
   - `brainsait-auth-gateway-prod`
   - `brainsait-sso`
   - Recommendation: Unified auth with SSO

3. **Scattered Chat/Voice**
   - `brainsait-voice`
   - `basma-voice-agent`
   - `brainsait-chat-widget-prod`
   - Recommendation: Unified comms platform

4. **Multiple API Gateways**
   - `brainsait-api-gateway`
   - `basma-gateway`
   - `healthbridge-api-gateway`
   - Recommendation: Single unified gateway with routes

5. **R2 Missing**
   - No R2 buckets for file storage
   - Recommendation: Add R2 for media/assets

---

## Unified Architecture Proposed

```
┌─────────────────────────────────────────────────────────────┐
│                    UNIFIED GATEWAY                        │
│           (api.brainsait.org)                           │
├─────────────────────────────────────────────────────────────┤
│  /fhir/*    → FHIR Platform                         │
│  /agents/*  → LINC Agent Orchestrator               │
│  /health/* → Healthcare APIs                      │
│  /basma/*   → BASMA Ecosystem                     │
│  /auth/*    → Unified Auth                       │
│  /chat/*    → Communications                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Next Steps

1. **Consolidate Workers** - Merge duplicate functionality
2. **Unified Dashboard** - Single pane for all systems
3. **R2 Setup** - File storage foundation
4. **Cross-Reference Links** - Connect UI to correct endpoints

---

*BotFather v2.1 - Infrastructure Audit Complete*