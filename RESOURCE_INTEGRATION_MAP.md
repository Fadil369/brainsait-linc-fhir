# Brainsait Unified Ecosystem - Resource Integration Map

*BotFather v2.1 - Complete Asset Inventory*

---

## Summary

| Resource | Count | Already Configured |
|----------|-------|---------------------|
| **Cloudflare Pages** | 10 | ✅ 10 active |
| **Cloudflare Workers** | 130+ | ✅ Deployed |
| **KV Namespaces** | 20 | ✅ Active |
| **D1 Databases** | 0 | ❌ None (need setup) |
| **Durable Objects** | 20+ | ✅ Active scripts |
| **R2 Buckets** | 0 | ❌ Need creation |

---

## Pages (Frontends)

| URL | Worker | Purpose |
|-----|--------|---------|
| `brainsait-linc-fhir.pages.dev` | `brainsait-linc-fhir` | FHIR LINC Portal |
| `brainsait-org.pages.dev` | `brainsait-org` | Main Org |
| `*-novel.pages.dev` (8) | Various | Forge projects |

---

## Workers → Existing Resources

### Core Platform
| Worker | KV | R2 | DO | Notes |
|--------|-----|----|----|-------|
| `brainsait-unified-platform` | - | - | - | Main platform |
| `brainsait-masterlinc-production` | - | - | - | MasterLINC orchestrator |
| `brainsait-mcp-production` | - | - | - | MCP server |
| `brainsait-orchestrator` | - | - | - | Workflow orchestrator |

### Healthcare (connects to existing KV)
| Worker | KV | Purpose |
|--------|-----|---------|
| `brainsait-healthcare-api` | - | Healthcare API |
| `healthbridge-*` | - | Bridge services |
| `nphies-service` | `sudan-gov-*` | NPHIES integration |

### LINC Agents
| Worker | DO Namespace | Purpose |
|--------|--------------|---------|
| `givc-linc-agents` | givc-linc-agents_* | Claims agents |
| `healthlinc-*` | brainsait-linc-platform_* | Health agents |

### BASMA ERP
| Worker | KV | Purpose |
|--------|-----|---------|
| `basma-api` | `basma-api-worker-BASMA_RATE_LIMIT` | Rate limiting |
| `basma-gateway` | - | API gateway |
| `basma-portal` | - | Portal |

### Auth & Sessions
| Worker | KV | Purpose |
|--------|-----|---------|
| `brainsait-sso` | `SESSIONS`, `UNIFIED_SESSIONS` | Session store |
| `brainsait-stripe-identity` | - | Stripe auth |

### Data & Storage
| Worker | Purpose |
|--------|---------|
| `brainsait-data-hub-prod` | Data hub |
| `browser-r2-worker` | R2 operations (exists!) |

---

## KV Namespaces → Best Use

| Namespace ID | Name | Worker(s) Using | Action |
|--------------|------|----------------|--------|
| `33a2f9eb359f4b4380869639245d9673` | SESSIONS | `brainsait-sso` | ✅ Keep, expand for unified |
| `062eab539a7049c0b1e36049441a211d` | UNIFIED_SESSIONS | - | ✅ Merge target |
| `021ea635293a457b8dfaf854f10dbec4` | brainsait-feature-flags | - | ✅ Use for gateway feature flags |
| `114b15432afa430aa03ea77c9c561d9e` | brainsait-event-log | - | ✅ Central audit log |
| `553388646ee64b14b871aa17eeaa5cbc` | BOT_KV | - | ✅ BotFather state |
| `1f1cee0c7fef4af7be191f487c2f3d76` | basma-api-worker-BASMA_RATE_LIMIT | basma-api | ✅ Keep |
| `639ac84ff0c540f9b9cded716ae65f06` | ORACLE_RESULTS | oracle-claim-scanner | ✅ Keep |
| `59350ecff5314c33bbc91aa6510dda91` | brainsait-webhook-secrets | - | ✅ Keep for webhook secrets |
| `3955e252772c4e3faa0f34f14217eb52` | OBSIDIAN_SYNC | - | ℹ️ Sync to Notion (if needed) |
| Others | sudan-gov-*, oracle-* | Various | Stay as-is |

---

## D1 Databases

❌ **No D1 databases found** - Need to create for:
1. Persistent application data (currently using D1 in workers?)
2. FHIR data store
3. User/profile data

---

## R2 Storage

❌ **No R2 buckets** - But `browser-r2-worker` exists and needs one!

**Recommend creating:**
```bash
wrangler r2 bucket create brainsait-media
wrangler r2 bucket create brainsait-uploads
```

---

## Durable Objects → Consolidate

| Namespace | Class | Worker Using | Target |
|-----------|-------|-------------|--------|
| brainsait-linc-platform | FHIRLincContainer | brainsait-linc-*-production | Keep |
| brainsait-linc-platform | HealthLincContainer | healthlinc-* | Keep |
| brainsait-linc-platform | MasterLincContainer | brainsait-masterlinc-* | Keep |
| brainsait-ecosystem | ChatAgent | brainsait-ecosystem | Keep |
| givc-linc-agents | MasterLincAgent | givc-linc-agents | Keep |
| givc-linc-agents | ClaimsLincAgent | givc-linc-agents | Keep |
| cf-containers | MyContainer, NphiesContainer | cf-containers | Keep |

---

## Integrated Architecture

```
┌─────────────────────────────────────────────────────┐
│                    api.brainsait.org               │
│              (Unified Gateway Worker)             │
├─────────────────────────────────────────────────────┤
│ Routes:                                            │
│ /fhir/*     → brainsait-linc-fhir-unified          │
│ /agents/*   → brainsait-masterlinc-production     │
│ /health/*  → brainsait-healthcare-api            │
│ /basma/*   → basma-api-prod                     │
│ /auth/*    → brainsait-sso + SESSIONS KV        │
│ /data/*    → brainsait-data-hub-prod           │
│ /r2/*      → browser-r2-worker → R2 bucket      │
└─────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
   ┌─────────┐      ┌──────────┐     ┌─────────┐
   │SESSIONS│      │EVENT_LOG │     │FEATURE  │
   │   KV   │      │   KV     │     │ FLAGS   │
   └─────────┘      └──────────┘     └─────────┘
        │                                    ▲
        │         ┌──────────────────────────┘
        ▼         ▼
   ┌─────────────────┐
   │  Durable       │
   │  Objects      │
   └─────────────────┘
```

---

## Recommended Integrations

### 1. Gateway → Use Existing KV
- `brainsait-feature-flags` → Gateway feature toggles
- `SESSIONS` → Session validation
- `brainsait-event-log` → Audit logging

### 2. Gateway → Use Existing Workers
- Route to existing workers via fetch (as currently designed)
- Don't duplicate - just aggregate

### 3. R2 Integration
- Create R2 bucket
- Link to `browser-r2-worker` (exists but maybe misconfigured)

### 4. D1 Consideration
- Check if workers actually use D1 (might be external)
- Only create if need persists

---

## Next Steps

1. **Create R2 Buckets**
```bash
wrangler r2 bucket create brainsait-media
```

2. **Update Gateway to use known namespaces:**
- KV IDs from above for SESSIONS, EVENT_LOG, FEATURE_FLAGS

3. **Verify D1 usage** - May be external/oracle

---

*Resource Map v2.1 - Based on live Cloudflare audit*