# DNS Setup Guide - BotFather v2.1

*The API token has Read access but limited Write for DNS. Set up manually:*

---

## Quick Manual Setup

### 1. Go to Cloudflare Dashboard
```
https://dash.cloudflare.com/brainsait.org/dns
```

### 2. Add DNS Record

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| CNAME | api | `brainsait-unified-gateway.brainsait-fadil.workers.dev` | ✅ Proxied |

### 3. Alternative: Workers Route (No DNS needed)

The worker is already accessible at:
```
https://brainsait-unified-gateway.brainsait-fadil.workers.dev
```

---

## After DNS Setup

### Test the Gateway
```bash
# Health check
curl https://api.brainsait.org/health

# Expected: {"status":"healthy","service":"unified-gateway"...}
```

### Test Routes
```bash
# Should route to existing workers:
curl https://api.brainsait.org/v1/fhir/Patient
curl https://api.brainsait.org/v1/health/claims
curl https://api.brainsait.org/v1/agents/orchestrate
```

---

## API Token Issues

The current Cloudflare token may have restricted DNS write access. Options:

### Option 1: Use Super：admin Token
Generate new token with "All zones - Edit" permissions:
- Go to: https://dash.cloudflare.com/profile/api-tokens
- Create token with: `Zone:DNS:Edit`, `Worker:Script:Edit`

### Option 2: Set via Dashboard
Manual DNS entry is quick:
1. Cloudflare Dashboard → DNS
2. Add Record button
3. Fill in the form

---

## Current Resources

| Resource | Endpoint |
|----------|----------|
| Gateway Worker | `brainsait-unified-gateway.brainsait-fadil.workers.dev` |
| Domain (after DNS) | `api.brainsait.org` |
| R2 Buckets (21) | Use `brainsait-media`, `brainsait-files`, etc. |

---

*BotFather v2.1 - DNS Setup Guide*