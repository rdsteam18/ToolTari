import { Env, dbService } from '../services/db';

interface AiRequestBody {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export const aiHandlers = {
  /**
   * Proxies request to Gemini-2.5-flash endpoint securely.
   */
  async handleGemini(request: Request, env: Env): Promise<Response> {
    const startTime = Date.now();
    try {
      const apiKey = env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API Key is not configured on Cloudflare Workers.');
      }

      const body = await request.json() as AiRequestBody;
      if (!body.prompt) {
        return this.createErrorResponse('Missing required parameter: "prompt"', 400);
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: body.prompt }]
              }
            ],
            generationConfig: {
              temperature: body.temperature ?? 0.7,
              maxOutputTokens: body.maxOutputTokens ?? 2048,
            },
            ...(body.systemInstruction && {
              systemInstruction: {
                parts: [{ text: body.systemInstruction }]
              }
            })
          })
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API returned status ${response.status}: ${errText}`);
      }

      const resJson = await response.json() as any;
      const text = resJson?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Save analytics asynchronously
      await dbService.saveAnalytics(env, 'chat-pdf', true, Date.now() - startTime);

      return this.createSuccessResponse(text);
    } catch (err: any) {
      await dbService.logError(env, 'chat-pdf', err.message);
      return this.createErrorResponse(err.message || 'Error communicating with Gemini.', 500);
    }
  },

  /**
   * Proxies request to NVIDIA Llama NIM securely.
   */
  async handleNvidia(request: Request, env: Env): Promise<Response> {
    const startTime = Date.now();
    try {
      const apiKey = env.NVIDIA_API_KEY;
      if (!apiKey) {
        throw new Error('NVIDIA API Key is not configured on Cloudflare Workers.');
      }

      const body = await request.json() as AiRequestBody;
      if (!body.prompt) {
        return this.createErrorResponse('Missing required parameter: "prompt"', 400);
      }

      const response = await fetch(
        'https://integrate.api.nvidia.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'meta/llama3-70b-instruct',
            messages: [
              ...(body.systemInstruction
                ? [{ role: 'system', content: body.systemInstruction }]
                : []),
              { role: 'user', content: body.prompt }
            ],
            temperature: body.temperature ?? 0.7,
            max_tokens: body.maxOutputTokens ?? 2048,
          })
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`NVIDIA API returned status ${response.status}: ${errText}`);
      }

      const resJson = await response.json() as any;
      const text = resJson?.choices?.[0]?.message?.content || '';

      await dbService.saveAnalytics(env, 'ai-writer', true, Date.now() - startTime);

      return this.createSuccessResponse(text);
    } catch (err: any) {
      await dbService.logError(env, 'ai-writer', err.message);
      return this.createErrorResponse(err.message || 'Error communicating with NVIDIA.', 500);
    }
  },

  /**
   * Proxies request to OpenAI API securely.
   */
  async handleOpenai(request: Request, env: Env): Promise<Response> {
    const startTime = Date.now();
    try {
      const apiKey = env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API Key is not configured on Cloudflare Workers.');
      }

      const body = await request.json() as AiRequestBody;
      if (!body.prompt) {
        return this.createErrorResponse('Missing required parameter: "prompt"', 400);
      }

      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              ...(body.systemInstruction
                ? [{ role: 'system', content: body.systemInstruction }]
                : []),
              { role: 'user', content: body.prompt }
            ],
            temperature: body.temperature ?? 0.7,
            max_tokens: body.maxOutputTokens ?? 2048,
          })
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI API returned status ${response.status}: ${errText}`);
      }

      const resJson = await response.json() as any;
      const text = resJson?.choices?.[0]?.message?.content || '';

      await dbService.saveAnalytics(env, 'openai-text', true, Date.now() - startTime);

      return this.createSuccessResponse(text);
    } catch (err: any) {
      await dbService.logError(env, 'openai-text', err.message);
      return this.createErrorResponse(err.message || 'Error communicating with OpenAI.', 500);
    }
  },

  createSuccessResponse(data: any): Response {
    return new Response(
      JSON.stringify({
        success: true,
        data,
        timestamp: Date.now()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  },

  createErrorResponse(error: string, status: number): Response {
    return new Response(
      JSON.stringify({
        success: false,
        error,
        timestamp: Date.now()
      }),
      {
        status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
};
