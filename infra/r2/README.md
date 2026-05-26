# Cloudflare R2 Storage - Brainsait Unified Ecosystem

*R2 provides zero egress fees - ideal for media/file storage*

---

## Current State

- ❌ No R2 buckets configured

---

## Proposed Buckets

| Bucket | Purpose | Class |
|-------|---------|-------|
| `brainsait-media` | Images, PDFs, documents | Standard |
| `brainsait-recordings` | Call recordings, voice | Standard |
| `brainsait-exports` | Data exports, reports | Standard |
| `brainsait-backups` | Database backups | Infrequent Access |

---

## R2 Client Worker Setup

```javascript
//infra/r2/media-worker.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // List files
    if (path === '/files' && request.method === 'GET') {
      const objects = await env.MEDIA_BUCKET.list({ limit: 100 });
      return new Response(JSON.stringify(objects.objects.map(o => ({
        key: o.key,
        size: o.size,
        uploaded: o.uploaded
      }))), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Upload file
    if (path === '/upload' && request.method === 'POST') {
      const formData = await request.formData();
      const file = formData.get('file');
      
      await env.MEDIA_BUCKET.put(file.name, file.stream(), {
        httpMetadata: {
          contentType: file.type
        }
      });
      
      return new Response(JSON.stringify({ 
        success: true, 
        key: file.name 
      }));
    }

    // Download/Delete file
    if (path.startsWith('/files/')) {
      const key = path.slice(7); // Remove '/files/'
      
      if (request.method === 'DELETE') {
        await env.MEDIA_BUCKET.delete(key);
        return new Response(JSON.stringify({ deleted: key }));
      }
      
      const object = await env.MEDIA_BUCKET.get(key);
      if (!object) {
        return new Response('Not found', { status: 404 });
      }
      
      return new Response(object.body, {
        headers: {
          'Content-Type': object.httpMetadata.contentType || 'application/octet-stream',
          'Content-Length': object.size
        }
      });
    }

    return new Response('Not found', { status: 404 });
  }
};
```

---

##Wrangler Configuration

```toml
#infra/r2/wrangler.toml
name = "brainsait-r2-media"
main = "media-worker.js"
compatibility_date = "2024-01-01"

[[r2_buckets]]
binding = "MEDIA_BUCKET"
bucket_name = "brainsait-media"

# Production routes
[env.production]
name = "brainsait-r2-media-production"
routes = [
  { pattern = "media.brainsait.org/*", zone_name = "brainsait.org" }
]
```

---

## Storage API Endpoints

| Endpoint | Method | Description |
|---------|--------|-------------|
| `/files` | GET | List files |
| `/upload` | POST | Upload file |
| `/files/:key` | GET | Download file |
| `/files/:key` | DELETE | Delete file |

---

## Usage Examples

### Upload from Worker
```javascript
const formData = new FormData();
formData.append('file', new Blob(['content']), 'report.pdf');

await fetch('https://media.brainsait.org/upload', {
  method: 'POST',
  body: formData
});
```

### Download
```javascript
const response = await fetch('https://media.brainsait.org/files/patient-12345.pdf');
const blob = await response.blob();
```

---

## Cost Comparison

| Service | Storage (100GB) | Egress (100GB) |
|---------|-----------------|---------------|
| S3 | ~$23 | ~$90 |
| R2 | ~$23 | **Free** |

*R2 saves ~80% on egress for media-heavy apps*

---

*BotFather v2.1 - R2 Storage Ready*