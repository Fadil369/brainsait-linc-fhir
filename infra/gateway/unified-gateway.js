/**
 * Cloudflare Worker - Unified Gateway v2.1
 * BotFather - Integrated with existing resources
 * 
 * Uses:
 * - KV: brainsait-event-log (audit), brainsait-feature-flags (features)
 * - Existing Workers for backend routing
 * - Sessions KV already active
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const search = url.search;
    const startTime = Date.now();

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

    let upstream = null;
    let upstreamPath = path;

    // ═══════════════════════════════════════════════════════════
    // ROUTING LOGIC - Route to EXISTING workers
    // ═══════════════════════════════════════════════════════════

    // FHIR Routes → brainsait-linc-fhir-unified
    if (path.startsWith('/fhir/') || path.startsWith('/api/fhir/') || path.startsWith('/v1/fhir/')) {
      upstream = 'https://brainsait-linc-fhir-unified';
      upstreamPath = path.replace(/^\/fhir/, '/r4').replace(/^\/api\/fhir/, '/r4').replace(/^\/v1\/fhir/, '/r4');
    }
    
    // Healthcare → brainsait-healthcare-api
    else if (path.startsWith('/health/') || path.startsWith('/api/health/') || path.startsWith('/v1/health/')) {
      upstream = 'https://brainsait-healthcare-api';
      upstreamPath = path.replace(/^\/api\/health/, '').replace(/^\/v1\/health/, '');
    }
    
    // LINC/Agents → brainsait-masterlinc-production
    else if (path.startsWith('/agents/') || path.startsWith('/api/agents/') || path.startsWith('/v1/agents/')) {
      upstream = 'https://brainsait-masterlinc-production';
      upstreamPath = path.replace(/^\/api\/agents/, '').replace(/^\/v1\/agents/', '');
    }
    
    // BASMA → basma-api-prod (existing!)
    else if (path.startsWith('/basma/') || path.startsWith('/api/basma/') || path.startsWith('/v1/basma/')) {
      upstream = 'https://basma-api-prod';
      upstreamPath = path.replace(/^\/api\/basma/, '').replace(/^\/v1\/basma/', '');
    }
    
    // NPHIES → nphies-service (existing!)
    else if (path.startsWith('/nphies/') || path.startsWith('/api/nphies/') || path.startsWith('/v1/nphies/')) {
      upstream = 'https://nphies-service';
      upstreamPath = path.replace(/^\/api\/nphies/, '').replace(/^\/v1\/nphies/', '');
    }
    
    // Auth → brainsait-sso (existing!)
    else if (path.startsWith('/auth/') || path.startsWith('/api/auth/') || path.startsWith('/v1/auth/')) {
      upstream = 'https://brainsait-sso';
      upstreamPath = path.replace(/^\/api\/auth/, '').replace(/^\/v1\/auth/', '');
    }
    
    // Data Hub → brainsait-data-hub-prod (existing!)
    else if (path.startsWith('/data/') || path.startsWith('/api/data/') || path.startsWith('/v1/data/')) {
      upstream = 'https://brainsait-data-hub-prod';
      upstreamPath = path.replace(/^\/api\/data/, '').replace(/^\/v1\/data/', '');
    }
    
    // Chat/Voice → brainsait-chat-widget-prod
    else if (path.startsWith('/chat/') || path.startsWith('/comms/') || path.startsWith('/voice/')) {
      upstream = 'https://brainsait-chat-widget-prod';
      upstreamPath = path;
    }

    // Static assets → Pages
    else if (path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
      return env.ASSETS.fetch(request);
    }

    // SPA fallback
    else {
      return env.ASSETS.fetch(request);
    }

    // ═══════════════════════════════════════════════════════════
    // UPSTREAM PROXY
    // ═══════════════════════════════════════════════════════════

    if (!upstream) {
      return new Response(JSON.stringify({ 
        error: 'Route not found',
        path,
        available: [
          '/v1/fhir/*', '/v1/health/*', '/v1/agents/*',
          '/v1/basma/*', '/v1/nphies/*', '/v1/auth/*', '/v1/data/*'
        ]
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json', ...cors }
      });
    }

    const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
    const upstreamUrl = `${upstream}${upstreamPath}${search}`;

    try {
      const response = await fetch(upstreamUrl, {
        method: request.method,
        headers: {
          ...Object.fromEntries(request.headers),
          'X-Forwarded-For': clientIp,
          'X-Gateway-Version': '2.1.0',
          'X-Gateway-Timestamp': new Date().toISOString()
        },
        body: request.body
      });

      const newHeaders = new Headers(response.headers);
      Object.entries(cors).forEach(([k, v]) => newHeaders.set(k, v));
      newHeaders.set('X-Upstream', upstream);
      newHeaders.set('X-Response-Time', `${Date.now() - startTime}ms`);

      // Log to event log (if configured)
      // await logEvent(env, { path, upstream, status: response.status, duration: Date.now() - startTime });

      return new Response(response.body, {
        status: response.status,
        headers: newHeaders
      });

    } catch (error) {
      // Also log error
      return new Response(JSON.stringify({
        error: 'Upstream unavailable',
        message: error.message,
        upstream: upstream
      }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...cors }
      });
    }
  }
};

/*

╔═══════════════════════════════════════════════════════════════════════════╗
║                    UNIFIED GATEWAY - INTEGRATED                            ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  Domain: api.brainsait.org                                               ║
║                                                                           ║
║  Routes (pointing to EXISTING workers):                                 ║
║  ─────────────────────────────────────────────────────────────────────    ║
║  /v1/fhir/*        →  brainsait-linc-fhir-unified  (existing!)           ║
║  /v1/health/*     →  brainsait-healthcare-api    (existing!)           ��
║  /v1/agents/*      →  brainsait-masterlinc-prod  (existing!)           ║
║  /v1/basma/*      →  basma-api-prod              (existing!)            ║
║  /v1/nphies/*      →  nphies-service              (existing!)            ║
║  /v1/auth/*       →  brainsait-sso               (existing!)             ║
║  /v1/data/*       →  brainsait-data-hub-prod     (existing!)            ║
║  /v1/comms/*      →  brainsait-chat-widget-prod (existing!)            ║
║                                                                           ║
║  KV Used:                                                                ║
║  - brainsait-event-log (audit logging)                                  ║
║  - brainsait-feature-flags (feature toggles)                            ║
║  - SESSIONS (session validation - via brainsait-sso)                    ║
║  - UNIFIED_SESSIONS (future expansion)                                    ║
║                                                                           ║
║  Static:                                                                 ║
║  - *.js, *.css, images → Cloudflare Pages                              ║
║                                                                           ║
║  Fallback:                                                               ║
║  - All unmatched → SPA                                                    ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝

*/