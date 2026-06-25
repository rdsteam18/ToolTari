import type { AIServiceProvider, AICompletionOptions, AIResponse } from './aiProvider';

export class LocalAIProvider implements AIServiceProvider {
  name = 'local';

  async generateText(options: AICompletionOptions): Promise<AIResponse> {
    // Check if chrome.aiOriginPrivateDeveloperMetadata or window.ai is available (experimental Gemini Nano in Chrome)
    const browserAI = (window as any).ai || (window as any).assistant;
    if (browserAI && typeof browserAI.createTextSession === 'function') {
      try {
        const session = await browserAI.createTextSession();
        const text = await session.prompt(options.prompt);
        return {
          text,
          provider: 'local-chrome-nano'
        };
      } catch (err: any) {
        console.warn('Chrome Built-in AI Session initialization failed:', err);
      }
    }

    // Fallback: WebGPU / ONNX runtime placeholder
    throw new Error(
      'Local WebGPU inference runtime is currently in development. Please select Gemini or NVIDIA providers in your settings.'
    );
  }
}
