import { AIProvider } from './aiProvider';
import type { AICompletionOptions, AIResponse } from './aiProvider';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const retryManager = {
  /**
   * Executes a text generation task with automatic fallback switching and exponential backoff retries.
   */
  async executeWithFallback(
    options: AICompletionOptions,
    priorityList: string[],
    maxRetries: number
  ): Promise<AIResponse> {
    let lastErrorMsg = 'All configured AI providers failed to return a valid response.';

    for (const providerName of priorityList) {
      // Fetch provider dynamically from the registry
      const provider = AIProvider.getProvider(providerName);
      if (!provider) {
        console.warn(`RetryManager: Fallback provider "${providerName}" is not registered. Skipping.`);
        continue;
      }

      console.log(`RetryManager: Attempting execution with provider "${providerName}"...`);

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            // Exponential backoff: 500ms, 1000ms, 2000ms...
            const backoffTime = Math.pow(2, attempt - 1) * 500;
            await delay(backoffTime);
          }

          const result = await provider.generateText(options);

          // If the provider returned success (and no error field), return immediately
          if (!result.error && result.text) {
            return result;
          }

          // Otherwise, treat it as an error to trigger retry/fallback
          throw new Error(result.error || 'Empty or invalid response data.');
        } catch (err: any) {
          lastErrorMsg = err.message || 'Unknown provider error';
          console.warn(
            `RetryManager: Attempt ${attempt + 1}/${maxRetries + 1} failed for "${providerName}": ${lastErrorMsg}`
          );
        }
      }

      console.warn(`RetryManager: "${providerName}" exhausted all retries. Failover to next provider...`);
    }

    // Return final accumulated error format if all fallbacks fail
    return {
      text: '',
      error: `AI Service temporary failure: ${lastErrorMsg}. Please try again later.`,
      provider: 'failover-system'
    };
  }
};
