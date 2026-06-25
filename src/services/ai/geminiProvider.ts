import type { AIServiceProvider, AICompletionOptions, AIResponse } from './aiProvider';
import { apiClient } from '../apiClient';

export class GeminiProvider implements AIServiceProvider {
  name = 'gemini';

  async generateText(options: AICompletionOptions): Promise<AIResponse> {
    // Call the Cloudflare Worker API instead of direct Google API to protect developer keys
    const result = await apiClient.post<string>('/ai/gemini', {
      prompt: options.prompt,
      systemInstruction: options.systemInstruction,
      temperature: options.temperature,
      maxOutputTokens: options.maxOutputTokens
    });

    if (!result.success || result.data === undefined) {
      throw new Error(result.error || 'Failed to generate text from Gemini backend.');
    }

    return {
      text: result.data,
      provider: 'gemini'
    };
  }
}
