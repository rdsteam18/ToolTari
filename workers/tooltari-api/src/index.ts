import { Env, dbService } from './services/db';
import { aiHandlers } from './handlers/ai';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. CORS Preflight Handler
    if (request.method === 'OPTIONS') {
      return this.handleCorsOptions();
    }

    // CORS Headers helper
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // 2. Validate URL API Versioning
    if (!path.startsWith('/api/v1/')) {
      return new Response(
        JSON.stringify({ success: false, error: 'API endpoint not found. Always use /api/v1/', timestamp: Date.now() }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const relativePath = path.replace('/api/v1', '');

    try {
      // 3. Simple Rate Limiter using Cloudflare KV binding
      const ip = request.headers.get('CF-Connecting-IP') || 'anonymous_ip';
      const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
      
      let rateLimitCategory = 'general';
      let maxLimit = 100;

      if (relativePath.startsWith('/ai/')) {
        rateLimitCategory = 'ai';
        maxLimit = 20; // 20 requests per day for anonymous AI queries
      } else if (relativePath.startsWith('/ocr/')) {
        rateLimitCategory = 'ocr';
        maxLimit = 30; // 30 requests per day for OCR conversion
      }

      const limitKey = `limit:${ip}:${rateLimitCategory}:${today}`;
      const currentCountStr = await env.TOOLTARI_KV.get(limitKey);
      const currentCount = currentCountStr ? parseInt(currentCountStr, 10) : 0;

      if (currentCount >= maxLimit) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Rate limit exceeded. Anonymous users are limited to ${maxLimit} ${rateLimitCategory.toUpperCase()} requests per day.`,
            timestamp: Date.now()
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Increment Rate Limit counter
      await env.TOOLTARI_KV.put(limitKey, String(currentCount + 1), { expirationTtl: 86400 });

      // 4. API Endpoints Routing
      if (request.method === 'POST' && relativePath === '/ai/gemini') {
        const response = await aiHandlers.handleGemini(request, env);
        this.addCorsHeaders(response, corsHeaders);
        return response;
      }

      if (request.method === 'POST' && relativePath === '/ai/nvidia') {
        const response = await aiHandlers.handleNvidia(request, env);
        this.addCorsHeaders(response, corsHeaders);
        return response;
      }

      if (request.method === 'POST' && relativePath === '/ai/openai') {
        const response = await aiHandlers.handleOpenai(request, env);
        this.addCorsHeaders(response, corsHeaders);
        return response;
      }

      if (request.method === 'GET' && relativePath.startsWith('/flags/')) {
        const flagName = relativePath.split('/')[2];
        const isEnabled = await dbService.getFeatureFlag(env, flagName);
        return new Response(
          JSON.stringify({ success: true, data: { enabled: isEnabled }, timestamp: Date.now() }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 404 Route Catch-all
      return new Response(
        JSON.stringify({ success: false, error: 'Endpoint method or route matches nothing in this worker.', timestamp: Date.now() }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ success: false, error: err.message || 'Worker Internal Server Error', timestamp: Date.now() }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  },

  handleCorsOptions(): Response {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  },

  addCorsHeaders(response: Response, corsHeaders: Record<string, string>) {
    // Append headers to Response
    for (const [key, value] of Object.entries(corsHeaders)) {
      response.headers.set(key, value);
    }
  }
};
