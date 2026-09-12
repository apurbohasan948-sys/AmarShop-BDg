import { AIModelConfig, AIHealthStatus } from '../../../src/types';

export interface AdapterTestResult {
  success: boolean;
  status: AIHealthStatus;
  latency: number;
  message: string;
  sampleResponse?: string;
  resolvedEndpoint?: string;
  errorType?: 'auth' | 'model' | 'rate_limit' | 'connection' | 'unknown';
}

export interface AIProviderAdapter {
  id: string;
  name: string;
  test(model: AIModelConfig): Promise<AdapterTestResult>;
  generate(model: AIModelConfig, prompt: string, systemPrompt?: string): Promise<string>;
}
