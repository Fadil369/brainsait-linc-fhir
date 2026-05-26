/**
 * Cloudflare Worker - Unified Gateway
 * BotFather v2.1 - All routes to one gateway
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const search = url.search;

    // CORS headers
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    // Health check
    if (path === '/health' || path === '/api/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'unified-gateway',
        version: '2.1.0',
        timestamp: new Date().toISOString()
      }), { headers: { 'Content-Type': 'application/json', ...cors }});
    }

    // API versioning
    const isApi = path.startsWith('/api/') || path.startsWith('/v1/');
    
    // Route logic
    let upstream = null;
    let upstreamPath = path;

    // FHIR Routes → /v1/fhir/*
    if (path.startsWith('/fhir/') || path.startsWith('/api/fhir/') || path.startsWith('/v1/fhir/')) {
      upstream = env.FHIR_API_URL || 'https://fhir.brainsait.org';
      upstreamPath = path.replace(/^\/fhir/, '/r4').replace(/^\/api\/fhir/, '/r4').replace(/^\/v1\/fhir/, '/r4');
    }
    
    // Healthcare Routes → /v1/health/*
    else if (path.startsWith('/health/') || path.startsWith('/api/health/') || path.startsWith('/v1/health/')) {
      upstream = env.HEALTH_API_URL || 'https://health.brainsait.org';
      upstreamPath = path.replace(/^\/api\/health/, '').replace(/^\/v1\/health/, '');
    }
    
    // LINC Agent Routes → /v1/agents/*
    else if (path.startsWith('/agents/') || path.startsWith('/api/agents/') || path.startsWith('/v1/agents/')) {
      upstream = env.AGENT_API_URL || 'https://agents.brainsait.org';
      upstreamPath = path.replace(/^\/api\/agents/, '').replace(/^\/v1\/agents/, '');
    }
    
    // BASMA ERP Routes → /v1/basma/*
    else if (path.startsWith('/basma/') || path.startsWith('/api/basma/') || path.startsWith('/v1/basma/')) {
      upstream = env.BASMA_API_URL || 'https://basma.brainsait.org';
      upstreamPath = path.replace(/^\/api\/basma/, '').replace(/^\/v1\/basma/, '');
    }
    
    // NPHIES Routes
    else if (path.startsWith('/nphies/') || path.startsWith('/api/nphies/') || path.startsWith('/v1/nphies/')) {
      upstream = env.NPHIES_API_URL || 'https://nphies.brainsait.org';
      upstreamPath = path.replace(/^\/api\/nphies/, '').replace(/^\/v1\/nphies/, '');
    }
    
    // Auth Routes
    else if (path.startsWith('/auth/') || path.startsWith('/api/auth/') || path.startsWith('/v1/auth/')) {
      upstream = env.AUTH_API_URL || 'https://auth.brainsait.org';
      upstreamPath = path.replace(/^\/api\/auth/, '').replace(/^\/v1\/auth/, '');
    }
    
    // Chat/Voice Communication
    else if (path.startsWith('/chat/') || path.startsWith('/voice/') || path.startsWith('/api/comms/') || path.startsWith('/v1/comms/')) {
      upstream = env.COMMS_API_URL || 'https://comms.brainsait.org';
      upstreamPath = path.replace(/^\/api\/comms/, '').replace(/^\/v1\/comms/, '');
    }

    // Static assets
    else if (path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
      return env.ASSETS.fetch(request);
    }

    // SPA fallback
    else {
      return env.ASSETS.fetch(request);
    }

    // Forward to upstream
    if (!upstream) {
      return new Response(JSON.stringify({ 
        error: 'Route not found',
        path,
        available: [
          '/v1/fhir/*', '/v1/health/*', '/v1/agents/*',
          '/v1/basma/*', '/v1/nphies/*', '/v1/auth/*', '/v1/comms/*'
        ]
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json', ...cors }
      });
    }

    // Request to upstream
    const upstreamUrl = `${upstream}${upstreamPath}${search}`;
    const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';

    try {
      const response = await fetch(upstreamUrl, {
        method: request.method,
        headers: {
          ...Object.fromEntries(request.headers),
          'X-Forwarded-For': clientIp,
          'X-Gateway-Version': '2.1.0',
          'X-Gateway-Timestamp': new Date().toISOString()
        },
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined
      });

      // Add headers
      const newHeaders = new Headers(response.headers);
      Object.entries(cors).forEach(([k, v]) => newHeaders.set(k, v));
      newHeaders.set('X-Upstream', upstream);

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Upstream error',
        message: error.message,
        upstream
      }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...cors }
      });
    }
  }
};

/*

Route Map (Unified Gateway):

Domain: api.brainsait.org

/v1/fhir/*           → FHIR R4 Server
/v1/health/*        → Healthcare APIs  
/v1/agents/*        → LINC Agent Orchestrator
/v1/basma/*        → BASMA ERP
/v1/nphies/*       → NPHIES Integration
/v1/auth/*         → Authentication
/v1/comms/*        → Chat/Voice

Static:
*.js, *.css, *.png, etc → Cloudflare Pages

Fallback:
/ *                  → SPA (Cloudflare Pages)

*/