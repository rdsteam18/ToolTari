import { GeminiProvider } from './geminiProvider';
import { NvidiaProvider } from './nvidiaProvider';
import { OpenAIProvider } from './openaiProvider';
import { LocalAIProvider } from './localProvider';

export interface AICompletionOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface AIResponse {
  text: string;
  error?: string;
  provider: string;
}

export interface AIServiceProvider {
  name: string;
  generateText(options: AICompletionOptions): Promise<AIResponse>;
}

class AIProviderService {
  private activeProvider: string = 'gemini';
  private providers: Record<string, AIServiceProvider> = {};

  constructor() {
    // Register all default providers
    this.registerProvider('gemini', new GeminiProvider());
    this.registerProvider('nvidia', new NvidiaProvider());
    this.registerProvider('openai', new OpenAIProvider());
    this.registerProvider('local', new LocalAIProvider());
  }

  registerProvider(name: string, provider: AIServiceProvider) {
    this.providers[name] = provider;
  }

  setProvider(name: string) {
    if (this.providers[name]) {
      this.activeProvider = name;
    } else {
      console.warn(`AI Provider "${name}" is not registered. Staying on "${this.activeProvider}".`);
    }
  }

  getProviderName(): string {
    return this.activeProvider;
  }

  getRegisteredProviders(): string[] {
    return Object.keys(this.providers);
  }

  async generateText(options: AICompletionOptions): Promise<AIResponse> {
    const provider = this.providers[this.activeProvider];
    if (!provider) {
      return {
        text: '',
        error: `AI Provider "${this.activeProvider}" is not configured.`,
        provider: this.activeProvider
      };
    }
    try {
      return await provider.generateText(options);
    } catch (err: any) {
      return {
        text: '',
        error: err.message || `An error occurred with provider ${this.activeProvider}.`,
        provider: this.activeProvider
      };
    }
  }
}

export const AIProvider = new AIProviderService();
export default AIProvider;
