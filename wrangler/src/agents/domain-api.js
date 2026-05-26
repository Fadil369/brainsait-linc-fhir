import { getUnifiedServices, getDomainSummary } from "../domain-bridge.js";

export async function handleDomains(request, env) {
  const url = new URL(request.url);

  // /api/domains — unified view of ALL services across both zones
  if (url.pathname === "/api/domains") {
    const services = getUnifiedServices();
    const summary = getDomainSummary();
    return new Response(JSON.stringify({
      summary,
      services,
      total: services.length,
      healthy: services.filter(s => s.healthy).length,
    }, null, 2), {
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
    });
  }

  // /api/domains/brainsait.org — services on brainsait.org
  if (url.pathname === "/api/domains/brainsait.org") {
    const services = getUnifiedServices().filter(s => s.zone === "brainsait.org");
    return new Response(JSON.stringify({ zone: "brainsait.org", services }, null, 2), {
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
    });
  }

  // /api/domains/elfadil.com — services on elfadil.com
  if (url.pathname === "/api/domains/elfadil.com") {
    const services = getUnifiedServices().filter(s => s.zone === "elfadil.com");
    return new Response(JSON.stringify({ zone: "elfadil.com", services }, null, 2), {
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
    });
  }

  return new Response(JSON.stringify({
    usage: {
      "/api/domains": "Unified view of ALL services across both zones",
      "/api/domains/brainsait.org": "Services on brainsait.org only",
      "/api/domains/elfadil.com": "Services on elfadil.com only",
    }
  }, null, 2), {
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
}
