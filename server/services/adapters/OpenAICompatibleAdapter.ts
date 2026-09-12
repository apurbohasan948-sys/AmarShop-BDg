export interface TestResult {
  success: boolean;
  model: string;
  latencyMs?: number;
  error?: string;
}

export interface GenerateResult {
  success: boolean;
  content?: string;
  error?: string;
}

export class OpenAICompatibleAdapter {
  /**
   * Automatically normalizes the Base URL into an OpenAI-compatible /chat/completions endpoint.
   * Handles:
   * - https://example.com/v1 -> https://example.com/v1/chat/completions
   * - https://example.com/v1/chat/completions -> stays https://example.com/v1/chat/completions
   * - avoids /v1/v1/chat/completions and /chat/completions/chat/completions
   */
  public static normalizeEndpoint(baseUrl: string): string {
    let clean = (baseUrl || '').trim().replace(/\/+$/, '');
    if (!clean) return 'https://api.openai.com/v1/chat/completions';

    // If it already ends with /chat/completions, return as is
    if (clean.endsWith('/chat/completions')) {
      return clean;
    }

    // If it ends with /chat, append /completions
    if (clean.endsWith('/chat')) {
      return `${clean}/completions`;
    }

    // Otherwise append /chat/completions
    return `${clean}/chat/completions`;
  }

  /**
   * Tests the model connectivity by making a minimal request
   */
  public static async testModel(baseUrl: string, apiKey: string, modelName: string): Promise<TestResult> {
    const endpoint = this.normalizeEndpoint(baseUrl);
    const start = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: modelName.trim(),
          messages: [{ role: 'user', content: 'Ping' }],
          max_tokens: 5,
          temperature: 0.1
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - start;

      if (!res.ok) {
        let errorMsg = `HTTP ${res.status} ${res.statusText}`;
        try {
          const errData = await res.json();
          if (errData?.error?.message) {
            errorMsg = errData.error.message;
          } else if (errData?.message) {
            errorMsg = errData.message;
          }
        } catch {
          // keep fallback
        }
        return {
          success: false,
          model: modelName,
          error: errorMsg
        };
      }

      return {
        success: true,
        model: modelName,
        latencyMs
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return {
          success: false,
          model: modelName,
          error: 'Connection timed out (12s)'
        };
      }
      return {
        success: false,
        model: modelName,
        error: err?.message || 'Network request failed'
      };
    }
  }

  /**
   * Generates text via the OpenAI-compatible API
   */
  public static async generateText(
    baseUrl: string,
    apiKey: string,
    modelName: string,
    prompt: string,
    systemPrompt: string = 'You are a professional social media marketing copywriter.'
  ): Promise<GenerateResult> {
    const endpoint = this.normalizeEndpoint(baseUrl);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: modelName.trim(),
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1000,
          temperature: 0.7
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        let errorMsg = `Provider error: ${res.status} ${res.statusText}`;
        try {
          const errData = await res.json();
          if (errData?.error?.message) errorMsg = errData.error.message;
        } catch {}
        return { success: false, error: errorMsg };
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '';
      return { success: true, content };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Generation failed' };
    }
  }
}
