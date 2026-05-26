export class FHIRCache {
  constructor(state, env) {
    this.state = state;
  }

  async fetch(request) {
    const url = new URL(request.url);
    const key = url.searchParams.get("key");
    if (!key) {
      return new Response("Missing key parameter", { status: 400 });
    }
    if (request.method === "GET") {
      const value = await this.state.storage.get(key);
      if (!value) return new Response("Not found", { status: 404 });
      return new Response(value);
    }
    if (request.method === "PUT") {
      const value = await request.text();
      await this.state.storage.put(key, value, { expirationTtl: 3600 });
      return new Response("OK");
    }
    return new Response("Method not allowed", { status: 405 });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const durableId = env.FHIR_CACHE.idFromName("global");
    const stub = env.FHIR_CACHE.get(durableId);
    return stub.fetch(request);
  },
};
