import { AIModelConfig } from '../../../src/types';
import { AIProviderAdapter, AdapterTestResult } from './AIProviderAdapter';

export class AnthropicAdapter implements AIProviderAdapter {
  public id = 'anthropic';
  public name = 'Anthropic Claude API';

  public async test(model: AIModelConfig): Promise<AdapterTestResult> {
    const startTime = Date.now();
    if (!model.apiKey) {
      return {
        success: false,
        status: 'Authentication Failed',
        latency: 0,
        message: '✕ Anthropic API key is missing',
        errorType: 'auth',
      };
    }

    try {
      const url = `${(model.baseUrl || 'https://api.anthropic.com/v1').replace(/\/$/, '')}/messages`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': model.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: model.modelName || 'claude-3-5-sonnet-20241022',
          messages: [{ role: 'user', content: 'Say OK' }],
          max_tokens: 10,
        }),
        signal: AbortSignal.timeout(15000),
      });

      const latency = Date.now() - startTime;
      if (!resp.ok) {
        const text = await resp.text();
        if (resp.status === 401 || resp.status === 403) {
          return { success: false, status: 'Authentication Failed', latency, message: '✕ Invalid API Key', errorType: 'auth' };
        }
        if (resp.status === 429) {
          return { success: false, status: 'Rate Limited', latency, message: '✕ Rate Limit Exceeded', errorType: 'rate_limit' };
        }
        return { success: false, status: 'Failed', latency, message: `✕ Anthropic error (${resp.status}): ${text.slice(0, 100)}`, errorType: 'model' };
      }

      const data = await resp.json();
      return {
        success: true,
        status: 'Working',
        latency,
        message: `✓ API Working | Response time: ${(latency / 1000).toFixed(2)}s`,
        sampleResponse: data.content?.[0]?.text || '',
      };
    } catch (err: any) {
      return {
        success: false,
        status: 'Failed',
        latency: Date.now() - startTime,
        message: `✕ Connection failed: ${err.message}`,
        errorType: 'connection',
      };
    }
  }

  public async generate(model: AIModelConfig, prompt: string, systemPrompt?: string): Promise<string> {
    const url = `${(model.baseUrl || 'https://api.anthropic.com/v1').replace(/\/$/, '')}/messages`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': model.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model.modelName || 'claude-3-5-sonnet-20241022',
        system: systemPrompt || model.systemPrompt,
        messages: [{ role: 'user', content: prompt }],
        temperature: model.temperature ?? 0.7,
        max_tokens: model.maxTokens || 2048,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!resp.ok) {
      throw new Error(`Anthropic error (${resp.status}): ${await resp.text()}`);
    }
    const data = await resp.json();
    return data.content?.[0]?.text || '';
  }
}
