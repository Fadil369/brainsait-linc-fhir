/**
 * Cloudflare Worker - FHIR Intelligent Router
 * BotFather Unified LINC Ecosystem
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check
    if (path === '/health' || path === '/api/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        worker: 'fhir-router',
        version: '2.1.0',
        ecosystem: 'BotFather Unified'
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Orchestration endpoint
    if (path.startsWith('/api/orchestrate')) {
      return handleOrchestration(request, env, ctx, corsHeaders);
    }

    // Agent endpoints
    if (path.startsWith('/api/agents/')) {
      return handleAgentRequest(request, env, ctx, corsHeaders);
    }

    // Default: SPA fallback
    return env.ASSETS.fetch(request);
  }
};

async function handleOrchestration(request, env, ctx, corsHeaders) {
  try {
    const body = await request.json();
    const { agent, patientId, action, context } = body;

    // Route to appropriate agent
    const agentUrl = getAgentUrl(agent);
    
    const response = await fetch(agentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': env.API_KEY || '',
      },
      body: JSON.stringify({ patientId, action, context })
    });

    const result = await response.json();
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

function getAgentUrl(agent) {
  const agents = {
    'patient-summary': `${env.AGENT_API_URL}/summary`,
    'medications': `${env.AGENT_API_URL}/medications`,
    'care-plan': `${env.AGENT_API_URL}/care-plan`,
    'imaging': `${env.AGENT_API_URL}/imaging`,
    'gaps': `${env.AGENT_API_URL}/gaps`,
  };
  return agents[agent] || `${env.AGENT_API_URL}/default`;
}

async function handleAgentRequest(request, env, ctx, corsHeaders) {
  const url = new URL(request.url);
  const agent = url.pathname.split('/')[3];
  
  return new Response(JSON.stringify({
    agent,
    status: 'ready',
    endpoints: ['patient-summary', 'medications', 'care-plan', 'imaging', 'gaps']
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}