export function getCorsHeaders(env) {
  const origin = env.CORS_ORIGIN || "*";
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
    "access-control-allow-headers": "Content-Type, Authorization",
    "access-control-max-age": "86400",
  };
}

export async function authenticate(request, env) {
  if (env.ENABLE_AUTH !== "true") return true;

  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return false;

  const token = authHeader.replace("Bearer ", "");
  const validToken = env.API_AUTH_TOKEN;

  if (!validToken || token !== validToken) return false;
  return true;
}

export function unauthorizedResponse(headers) {
  return new Response(
    JSON.stringify({
      resourceType: "OperationOutcome",
      issue: [{
        severity: "error",
        code: "forbidden",
        diagnostics: "Authentication required. Provide a valid Bearer token in the Authorization header.",
      }],
    }),
    {
      status: 401,
      headers: {
        "content-type": "application/json",
        ...headers,
      },
    }
  );
}
