import { AIModelConfig } from '../../../src/types';
import { AIProviderAdapter } from './AIProviderAdapter';
import { OpenAICompatibleAdapter } from './OpenAICompatibleAdapter';
import { GeminiAdapter } from './GeminiAdapter';
import { AnthropicAdapter } from './AnthropicAdapter';

export class AdapterRegistry {
  private static adapters: Map<string, AIProviderAdapter> = new Map();
  private static openAIAdapter = new OpenAICompatibleAdapter();
  private static geminiAdapter = new GeminiAdapter();
  private static anthropicAdapter = new AnthropicAdapter();

  static {
    this.register(this.openAIAdapter);
    this.register(this.geminiAdapter);
    this.register(this.anthropicAdapter);
  }

  public static register(adapter: AIProviderAdapter) {
    this.adapters.set(adapter.id.toLowerCase(), adapter);
  }

  public static getAdapter(model: Partial<AIModelConfig>): AIProviderAdapter {
    const type = (model.apiType || model.provider || 'openai-compatible').toLowerCase();

    if (type === 'gemini') {
      return this.geminiAdapter;
    }
    if (type === 'anthropic') {
      return this.anthropicAdapter;
    }

    // Standard OpenAI compatible adapter handles all modern cloud AI providers:
    // DeepSeek, Groq, OpenRouter, Together AI, OpenAI, Mistral, Perplexity, vLLM, Ollama, etc.
    return this.openAIAdapter;
  }
}
