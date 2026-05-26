# Update Existing Worker - Brainsait Subdomain Router

Since `api.brainsait.org` already points to `brainsait-subdomain-router`, let's update that worker to use our unified gateway code.

## Option 1: Deploy via Wrangler

Create a wrangler.toml in a temp folder:

```toml
name = "brainsait-subdomain-router"
main = "unified-gateway.js"
compatibility_date = "2024-01-01"

[vars]
ENVIRONMENT = "production"
VERSION = "2.1.0"

# Use existing KV namespaces
[[kv_namespaces]]
binding = "EVENT_LOG"
id = "114b15432afa430aa03ea77c9c561d9e"

[[kv_namespaces]]
binding = "FEATURE_FLAGS"
id = "021ea635293a457b8dfaf854f10dbec4"

[[kv_namespaces]]
binding = "SESSIONS"
id = "33a2f9eb359f4b4380869639245d9673"
```

Then deploy:
```bash
wrangler deploy
```

## Option 2: Use Cloudflare Dashboard

1. Go to: https://dash.cloudflare.com/brainsait.org/workers
2. Click on "brainsait-subdomain-router"
3. Click "Edit Code"
4. Paste the content from `infra/gateway/unified-gateway.js`
5. Save and Deploy

## Option 3: Manual API Upload

```bash
# Get the script
SCRIPT=$(cat infra/gateway/unified-gateway.js | base64 -w0)

# Upload via API
curl -X PUT "https://api.cloudflare.com/client/v4/accounts/d7b99530559ab4f2545e9bdc72a7ab9b/workers/scripts/brainsait-subdomain-router" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/javascript" \
  --data-binary @infra/gateway/unified-gateway.js
```

---

After update, test:
```bash
curl https://api.brainsait.org/health
# Should return: {"status":"healthy","service":"unified-gateway"...}
```