export type PromptType =
  | 'summary'
  | 'translation'
  | 'ocr'
  | 'chat'
  | 'rewriting'
  | 'explanation'
  | 'classification'
  | 'formatting'
  | 'extraction';

export interface AIResult {
  success: boolean;
  data: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  provider: string;
  model?: string;
  latency: number;
  error?: string;
}

export interface AIEngineConfig {
  temperature: number;
  maxOutputTokens: number;
  retries: number;
  timeout: number;
  streaming: boolean;
  providerPriority: string[];
}

export const DEFAULT_AI_CONFIG: AIEngineConfig = {
  temperature: 0.5,
  maxOutputTokens: 2048,
  retries: 2,
  timeout: 15000, // 15 seconds
  streaming: false,
  providerPriority: ['gemini', 'nvidia', 'openai']
};
