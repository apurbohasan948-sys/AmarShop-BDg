import { GoogleGenAI } from '@google/genai';
import { AIModelConfig } from '../../../src/types';
import { AIProviderAdapter, AdapterTestResult } from './AIProviderAdapter';

export class GeminiAdapter implements AIProviderAdapter {
  public id = 'gemini';
  public name = 'Google Gemini SDK';

  public async test(model: AIModelConfig): Promise<AdapterTestResult> {
    const startTime = Date.now();
    const apiKey = model.apiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        status: 'Authentication Failed',
        latency: 0,
        message: '✕ Gemini API Key is missing',
        errorType: 'auth',
      };
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: model.modelName || 'gemini-2.5-flash',
        contents: 'Say OK in 1 word.',
        config: {
          maxOutputTokens: 10,
          temperature: 0.1,
        },
      });

      const latency = Date.now() - startTime;
      return {
        success: true,
        status: 'Working',
        latency,
        message: `✓ API Working | Response time: ${(latency / 1000).toFixed(2)}s`,
        sampleResponse: (response.text || '').trim(),
      };
    } catch (err: any) {
      const latency = Date.now() - startTime;
      const msg = err.message || '';

      if (msg.includes('API key') || msg.includes('401') || msg.includes('403')) {
        return {
          success: false,
          status: 'Authentication Failed',
          latency,
          message: '✕ Invalid Gemini API Key',
          errorType: 'auth',
        };
      }
      if (msg.includes('404') || msg.includes('not found')) {
        return {
          success: false,
          status: 'Failed',
          latency,
          message: `✕ Model "${model.modelName}" not found`,
          errorType: 'model',
        };
      }
      if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
        return {
          success: false,
          status: 'Rate Limited',
          latency,
          message: '✕ Quota exceeded (Resource Exhausted)',
          errorType: 'rate_limit',
        };
      }

      return {
        success: false,
        status: 'Failed',
        latency,
        message: `✕ Error: ${msg.slice(0, 100)}`,
        errorType: 'connection',
      };
    }
  }

  public async generate(model: AIModelConfig, prompt: string, systemPrompt?: string): Promise<string> {
    const apiKey = model.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: model.modelName || 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt || model.systemPrompt || undefined,
        temperature: model.temperature ?? 0.7,
        maxOutputTokens: model.maxTokens || 2048,
      },
    });

    return response.text || '';
  }
}
