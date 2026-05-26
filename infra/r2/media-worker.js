/**
 * Cloudflare Worker - R2 Media Storage
 * Brainsait Unified Ecosystem
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    // Health
    if (path === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'r2-media',
        bucket: 'brainsait-media'
      }), { headers: { 'Content-Type': 'application/json' }});
    }

    // List files - GET /files
    if (path === '/files' && request.method === 'GET') {
      const prefix = url.searchParams.get('prefix') || '';
      const limit = parseInt(url.searchParams.get('limit') || '100');
      
      const objects = await env.MEDIA_BUCKET.list({ 
        prefix, 
        limit: Math.min(limit, 1000) 
      });
      
      return new Response(JSON.stringify({
        objects: objects.objects.map(o => ({
          key: o.key,
          size: o.size,
          uploaded: o.uploaded,
          httpMetadata: o.httpMetadata
        })),
        truncated: objects.truncated,
        cursor: objects.cursor
      }), { 
        headers: { 'Content-Type': 'application/json', ...cors }
      });
    }

    // Upload - POST /upload
    if (path === '/upload' && request.method === 'POST') {
      try {
        const formData = await request.formData();
        const file = formData.get('file');
        
        if (!file) {
          return new Response(JSON.stringify({ error: 'No file provided' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Extract path from form or use filename
        const filePath = formData.get('path')?.toString() || file.name;
        
        await env.MEDIA_BUCKET.put(filePath, file.stream(), {
          httpMetadata: {
            contentType: file.type
          },
          customMetadata: {
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
            uploadedBy: request.headers.get('CF-Connecting-IP')
          }
        });

        return new Response(JSON.stringify({
          success: true,
          key: filePath,
          contentType: file.type,
          size: file.size
        }), { 
          headers: { 'Content-Type': 'application/json', ...cors }
        });

      } catch (error) {
        return new Response(JSON.stringify({
          error: 'Upload failed',
          message: error.message
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Download or DELETE - /files/:key
    const fileMatch = path.match(/^\/files\/(.+)$/);
    if (fileMatch) {
      const key = decodeURIComponent(fileMatch[1]);

      // DELETE file
      if (request.method === 'DELETE') {
        await env.MEDIA_BUCKET.delete(key);
        return new Response(JSON.stringify({
          deleted: true,
          key
        }), { headers: { 'Content-Type': 'application/json' }});
      }

      // Download file
      const object = await env.MEDIA_BUCKET.get(key);
      if (!object) {
        return new Response(JSON.stringify({ error: 'File not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(object.body, {
        headers: {
          'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
          'Content-Length': object.size,
          'Content-Disposition': `inline; filename="${key}"`,
          'Last-Modified': object.uploaded?.toUTCString(),
          ...cors
        }
      });
    }

    // Metadata - HEAD /meta/:key
    const metaMatch = path.match(/^\/meta\/(.+)$/);
    if (metaMatch && request.method === 'GET') {
      const key = decodeURIComponent(metaMatch[1]);
      const object = await env.MEDIA_BUCKET.head(key);
      
      if (!object) {
        return new Response(JSON.stringify({ error: 'File not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({
        key,
        size: object.size,
        contentType: object.httpMetadata?.contentType,
        customMetadata: object.customMetadata,
        uploaded: object.uploaded
      }), { headers: { 'Content-Type': 'application/json' }});
    }

    return new Response(JSON.stringify({
      error: 'Not found',
      routes: [
        'GET /files - List files',
        'POST /upload - Upload file',
        'GET /files/:key - Download file',
        'DELETE /files/:key - Delete file',
        'GET /meta/:key - File metadata'
      ]
    }), { status: 404, headers: { 'Content-Type': 'application/json' }});
  }
};

/*

R2 Media API:

Base: media.brainsait.org

GET  /files          → List (supports ?prefix=&limit=)
POST /upload         → Upload (multipart/form-data)
GET  /files/:key      → Download
DELETE /files/:key    → Delete
GET  /meta/:key      → Get metadata

Example Usage:
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('https://media.brainsait.org/upload', {
  method: 'POST',
  body: formData
});

*/