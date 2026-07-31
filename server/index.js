function runtimeConfig(env) {
  return {
    VITE_SUPABASE_URL: env.VITE_SUPABASE_URL || "",
    VITE_SUPABASE_PUBLISHABLE_KEY: env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
    VITE_WORKSPACE_SLUG: env.VITE_WORKSPACE_SLUG || "joymade",
    VITE_PUBLIC_VIEWER: env.VITE_PUBLIC_VIEWER || "false",
  };
}

async function serveAsset(request, env) {
  if (!env.ASSETS || typeof env.ASSETS.fetch !== "function") {
    return new Response("Static asset binding is unavailable.", { status: 503 });
  }

  const response = await env.ASSETS.fetch(request);
  if (response.status !== 404 || request.method !== "GET") return response;

  const accept = request.headers.get("accept") || "";
  if (!accept.includes("text/html")) return response;
  const fallback = new URL(request.url);
  fallback.pathname = "/index.html";
  return env.ASSETS.fetch(new Request(fallback, request));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/__jm_config") {
      return Response.json(runtimeConfig(env), {
        headers: {
          "Cache-Control": "no-store",
          "Content-Security-Policy": "default-src 'none'",
        },
      });
    }
    return serveAsset(request, env);
  },
};
