import { DEFAULT_AI_CONFIG } from './types';
import type { PromptType, AIResult, AIEngineConfig } from './types';
import { promptBuilder } from './promptBuilder';
import { aiCache } from './aiCache';
import { retryManager } from './retryManager';
import { responseParser } from './responseParser';

export const aiEngine = {
  /**
   * Main entry point to run AI processing. Coordinates prompt building, cache lookups,
   * fallbacks, and rendering parsing.
   */
  async execute(
    userInput: string,
    type: PromptType,
    options?: {
      contextText?: string;
      targetLanguage?: string;
      isPrivate?: boolean;
      config?: Partial<AIEngineConfig>;
    }
  ): Promise<AIResult> {
    const startTime = Date.now();
    const config = { ...DEFAULT_AI_CONFIG, ...options?.config };
    const isPrivate = options?.isPrivate || false;

    // 1. Check if input is excessively large for a single prompt (Token Optimization & Chunking)
    // If the input is summarization of a text longer than 15,000 characters (~3700 tokens), run Map-Reduce chunking.
    if (type === 'summary' && userInput.length > 15000) {
      console.log(`AIEngine: Large document detected (${userInput.length} chars). Executing chunked Map-Reduce...`);
      return this.executeChunkedSummary(userInput, config);
    }

    // 2. Build the structured prompt parameters
    const builtPrompt = promptBuilder.build(userInput, type, {
      contextText: options?.contextText,
      targetLanguage: options?.targetLanguage
    });

    // 3. Generate Cache Key
    const cacheKey = aiCache.generateKey(
      builtPrompt.systemInstruction,
      builtPrompt.prompt,
      config.providerPriority[0],
      builtPrompt.temperature
    );

    // 4. Query Cache (If not private)
    const cachedResult = aiCache.get(cacheKey, isPrivate);
    if (cachedResult) {
      console.log('AIEngine: Cache hit! Returning cached answer.');
      return {
        ...cachedResult,
        latency: Date.now() - startTime
      };
    }

    // 5. Execute with Fallbacks and Retries
    const executionResult = await retryManager.executeWithFallback(
      {
        prompt: builtPrompt.prompt,
        systemInstruction: builtPrompt.systemInstruction,
        temperature: builtPrompt.temperature,
        maxOutputTokens: config.maxOutputTokens
      },
      config.providerPriority,
      config.retries
    );

    const latency = Date.now() - startTime;

    if (executionResult.error) {
      return {
        success: false,
        data: '',
        provider: executionResult.provider,
        latency,
        error: executionResult.error
      };
    }

    // 6. Parse and format Markdown output to HTML
    const formattedData = responseParser.parse(executionResult.text);

    const finalResult: AIResult = {
      success: true,
      data: formattedData,
      provider: executionResult.provider,
      latency
    };

    // 7. Cache successful output (if not private)
    aiCache.set(cacheKey, finalResult, isPrivate);

    return finalResult;
  },

  /**
   * Splits text into smaller chunks of approximately maxChunkSize characters.
   * Splits along paragraph breaks to avoid breaking sentences.
   */
  chunkText(text: string, maxChunkSize = 8000): string[] {
    const paragraphs = text.split('\n');
    const chunks: string[] = [];
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      if ((currentChunk + '\n' + paragraph).length > maxChunkSize) {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = paragraph;
      } else {
        currentChunk = currentChunk ? `${currentChunk}\n${paragraph}` : paragraph;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  },

  /**
   * Helper to summarize very large documents by chunking, summarizing each chunk,
   * and doing a final summary merge.
   */
  async executeChunkedSummary(
    text: string,
    config: AIEngineConfig
  ): Promise<AIResult> {
    const startTime = Date.now();
    const chunks = this.chunkText(text, 8000); // 8,000 character chunks
    const chunkSummaries: string[] = [];

    console.log(`AIEngine: Document split into ${chunks.length} chunks.`);

    // Summarize each chunk
    for (let i = 0; i < chunks.length; i++) {
      const builtPrompt = promptBuilder.build(chunks[i], 'summary');
      const response = await retryManager.executeWithFallback(
        {
          prompt: builtPrompt.prompt,
          systemInstruction: builtPrompt.systemInstruction,
          temperature: builtPrompt.temperature,
          maxOutputTokens: 1024 // smaller output tokens for intermediate steps
        },
        config.providerPriority,
        config.retries
      );

      if (response.error) {
        return {
          success: false,
          data: '',
          provider: response.provider,
          latency: Date.now() - startTime,
          error: `Failed during chunk ${i + 1} summarization: ${response.error}`
        };
      }
      chunkSummaries.push(response.text);
    }

    // Merge chunk summaries into a single final summary prompt
    const mergedText = chunkSummaries.join('\n\n---\n\n');
    console.log('AIEngine: Summarizing merged intermediate results...');

    const builtPrompt = promptBuilder.build(mergedText, 'summary');
    const response = await retryManager.executeWithFallback(
      {
        prompt: builtPrompt.prompt,
        systemInstruction: builtPrompt.systemInstruction,
        temperature: builtPrompt.temperature,
        maxOutputTokens: config.maxOutputTokens
      },
      config.providerPriority,
      config.retries
    );

    const latency = Date.now() - startTime;

    if (response.error) {
      return {
        success: false,
        data: '',
        provider: response.provider,
        latency,
        error: `Failed during final summary merging: ${response.error}`
      };
    }

    const formattedData = responseParser.parse(response.text);

    return {
      success: true,
      data: formattedData,
      provider: response.provider,
      latency
    };
  }
};
