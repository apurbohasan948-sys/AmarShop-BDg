import { AIModelConfig, AIHealthStatus } from '../../../src/types';
import { AIProviderAdapter, AdapterTestResult } from './AIProviderAdapter';

export class OpenAICompatibleAdapter implements AIProviderAdapter {
  public id = 'openai-compatible';
  public name = 'OpenAI-Compatible Chat Completions';

  /**
   * Intelligently normalizes a base URL and determines candidate chat endpoints.
   * Prevents duplicate path segments like /v1/v1 or /chat/completions/chat/completions.
   */
  public static normalizeEndpoint(rawBaseUrl: string, explicitEndpoint?: string): {
    normalizedBaseUrl: string;
    chatEndpoint: string;
    candidateUrls: string[];
  } {
    let cleanUrl = (rawBaseUrl || '').trim();
    if (!cleanUrl) {
      cleanUrl = 'https://api.openai.com/v1';
    }

    // Ensure protocol
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    // Strip trailing slashes
    cleanUrl = cleanUrl.replace(/\/+$/, '');

    // Case 1: URL already ends with /chat/completions
    if (cleanUrl.endsWith('/chat/completions')) {
      const base = cleanUrl.replace(/\/chat\/completions$/, '');
      return {
        normalizedBaseUrl: base,
        chatEndpoint: '/chat/completions',
        candidateUrls: [cleanUrl],
      };
    }

    // Case 2: URL already ends with /v1
    if (cleanUrl.endsWith('/v1')) {
      const fullUrl = `${cleanUrl}/chat/completions`;
      return {
        normalizedBaseUrl: cleanUrl,
        chatEndpoint: '/chat/completions',
        candidateUrls: [fullUrl],
      };
    }

    // Case 3: URL contains /v1/ somewhere in the middle (e.g. /openai/v1)
    if (cleanUrl.includes('/v1/')) {
      const withoutExtra = cleanUrl.replace(/\/chat\/completions.*$/, '');
      return {
        normalizedBaseUrl: withoutExtra,
        chatEndpoint: '/chat/completions',
        candidateUrls: [`${withoutExtra}/chat/completions`],
      };
    }

    // Case 4: Base domain or root path without /v1 (e.g., https://api.deepseek.com or https://api.example.com)
    // We provide candidates:
    // 1) ${cleanUrl}/v1/chat/completions (standard OpenAI)
    // 2) ${cleanUrl}/chat/completions (alternative standard like DeepSeek direct)
    const candidate1 = `${cleanUrl}/v1/chat/completions`;
    const candidate2 = `${cleanUrl}/chat/completions`;

    return {
      normalizedBaseUrl: cleanUrl,
      chatEndpoint: '/v1/chat/completions',
      candidateUrls: [candidate1, candidate2],
    };
  }

  /**
   * Sends a minimal test request ("Reply with OK.") and measures latency and health.
   */
  public async test(model: AIModelConfig): Promise<AdapterTestResult> {
    const startTime = Date.now();

    if (!model.apiKey || model.apiKey.trim() === '') {
      return {
        success: false,
        status: 'Authentication Failed',
        latency: 0,
        message: '✕ API Key is missing. Please provide a valid key.',
        errorType: 'auth',
      };
    }

    const { candidateUrls, normalizedBaseUrl } = OpenAICompatibleAdapter.normalizeEndpoint(
      model.baseUrl,
      model.endpoint
    );

    let lastError: any = null;
    let successfulUrl = '';
    let responseText = '';

    // Try candidates in order (handles both /v1/chat/completions and /chat/completions seamlessly)
    for (const url of candidateUrls) {
      try {
        const res = await this.sendChatRequest(
          url,
          model,
          'Reply with OK.',
          'You are an API diagnostic tester. Respond with only "OK".',
          10,
          15000
        );

        responseText = res;
        successfulUrl = url;
        break; // Succeeded!
      } catch (err: any) {
        lastError = err;
        // If 404 (Endpoint not found), continue to try next candidate endpoint
        if (err?.statusCode === 404 && candidateUrls.length > 1) {
          continue;
        }
        // If 401, 403, 429, don't keep retrying alternate paths since auth/quota failed
        break;
      }
    }

    const latency = Date.now() - startTime;

    if (successfulUrl) {
      return {
        success: true,
        status: 'Working',
        latency,
        message: `✓ API Working | Response time: ${(latency / 1000).toFixed(2)}s`,
        sampleResponse: responseText.trim(),
        resolvedEndpoint: successfulUrl.replace(normalizedBaseUrl, ''),
      };
    }

    // Process failed response
    const statusInfo = this.classifyError(lastError);
    return {
      success: false,
      status: statusInfo.status,
      latency,
      message: statusInfo.message,
      errorType: statusInfo.errorType,
    };
  }

  /**
   * Generates text content using the configured model.
   */
  public async generate(model: AIModelConfig, prompt: string, systemPrompt?: string): Promise<string> {
    const { candidateUrls } = OpenAICompatibleAdapter.normalizeEndpoint(model.baseUrl, model.endpoint);
    const targetUrl = candidateUrls[0];

    return this.sendChatRequest(
      targetUrl,
      model,
      prompt,
      systemPrompt || model.systemPrompt,
      model.maxTokens || 2048,
      40000
    );
  }

  private async sendChatRequest(
    url: string,
    model: AIModelConfig,
    userPrompt: string,
    systemPrompt?: string,
    maxTokens = 2048,
    timeoutMs = 25000
  ): Promise<string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (model.authHeaderType === 'x-api-key') {
      headers['x-api-key'] = model.apiKey;
    } else {
      headers['Authorization'] = `Bearer ${model.apiKey}`;
    }

    // Common headers for OpenRouter / HuggingFace
    if (url.includes('openrouter.ai')) {
      headers['HTTP-Referer'] = 'https://shopbase.ai';
      headers['X-Title'] = 'ShopBase AI Automation';
    }

    const messages: Array<{ role: string; content: string }> = [];
    if (systemPrompt && systemPrompt.trim()) {
      messages.push({ role: 'system', content: systemPrompt.trim() });
    }
    messages.push({ role: 'user', content: userPrompt });

    const payload = {
      model: model.modelName,
      messages,
      temperature: model.temperature ?? 0.7,
      max_tokens: maxTokens,
    };

    let resp: Response;
    try {
      resp = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (networkErr: any) {
      const err: any = new Error(networkErr.message || 'Connection failed');
      err.isNetwork = true;
      throw err;
    }

    if (!resp.ok) {
      let errBody = '';
      try {
        errBody = await resp.text();
      } catch {
        errBody = resp.statusText;
      }

      const error: any = new Error(`API Error (${resp.status}): ${errBody}`);
      error.statusCode = resp.status;
      error.rawBody = errBody;
      throw error;
    }

    const json = await resp.json();
    return this.extractResponseContent(json);
  }

  /**
   * Automatic response parser: handles choices[0].message.content and common fallback shapes.
   */
  private extractResponseContent(data: any): string {
    if (!data) return '';

    // Standard OpenAI response format
    if (data.choices?.[0]?.message?.content) {
      const content = data.choices[0].message.content;
      if (typeof content === 'string') return content;
      if (Array.isArray(content)) {
        return content.map((c: any) => c.text || c.content || '').join('\n');
      }
    }

    // Fallback: choices[0].text (e.g. legacy completions or vllm)
    if (data.choices?.[0]?.text && typeof data.choices[0].text === 'string') {
      return data.choices[0].text;
    }

    // Fallback: message / content / response direct keys
    if (typeof data.response === 'string') return data.response;
    if (typeof data.output === 'string') return data.output;
    if (typeof data.content === 'string') return data.content;

    // Fallback: Anthropic shape through proxy
    if (Array.isArray(data.content) && data.content[0]?.text) {
      return data.content[0].text;
    }

    // Fallback: Gemini shape through proxy
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }

    return typeof data === 'string' ? data : JSON.stringify(data);
  }

  /**
   * Classify API errors into user-friendly messages and AIHealthStatus
   */
  private classifyError(err: any): { status: AIHealthStatus; message: string; errorType: 'auth' | 'model' | 'rate_limit' | 'connection' | 'unknown' } {
    if (!err) {
      return { status: 'Failed', message: '✕ Unknown connection error', errorType: 'unknown' };
    }

    const status = err.statusCode;
    const msg = (err.message || '').toLowerCase();
    const raw = (err.rawBody || '').toLowerCase();

    if (status === 401 || status === 403 || msg.includes('unauthorized') || msg.includes('invalid api key') || raw.includes('invalid_api_key') || raw.includes('authentication')) {
      return {
        status: 'Authentication Failed',
        message: '✕ Invalid API Key or Unauthorized (401/403)',
        errorType: 'auth',
      };
    }

    if (status === 404 || msg.includes('model_not_found') || raw.includes('model not found') || raw.includes('does not exist') || raw.includes('unknown model')) {
      return {
        status: 'Failed',
        message: '✕ Model Not Found or Invalid Endpoint (404)',
        errorType: 'model',
      };
    }

    if (status === 429 || msg.includes('rate limit') || raw.includes('quota') || raw.includes('rate_limit') || raw.includes('credits') || raw.includes('insufficient')) {
      return {
        status: 'Rate Limited',
        message: '✕ Rate Limit or Quota Exceeded (429)',
        errorType: 'rate_limit',
      };
    }

    if (err.isNetwork || msg.includes('timeout') || msg.includes('econnrefused') || msg.includes('fetch failed') || msg.includes('enotfound')) {
      return {
        status: 'Failed',
        message: '✕ Connection Failed (Network/Host Unreachable)',
        errorType: 'connection',
      };
    }

    return {
      status: 'Failed',
      message: `✕ Error (${status || 'Unknown'}): ${err.message?.slice(0, 120) || 'Connection failed'}`,
      errorType: 'unknown',
    };
  }
}
