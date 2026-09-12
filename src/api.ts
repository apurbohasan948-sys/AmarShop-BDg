import { CloudModel, Product, QueueItem, LogEntry, AppSettings, DashboardStats } from './types.js';

// Helper for fetch with robust JSON handling
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options?.headers || {})
    }
  });

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    console.error(`Expected JSON from ${path} but received:`, text.substring(0, 200));
    throw new Error(`API endpoint ${path} returned non-JSON response (${response.status})`);
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }

  return data;
}

// ----------------------------------------------------------------------
// CLOUD MODELS API (Step 4, 6, 9, 11, 12)
// ----------------------------------------------------------------------

export async function fetchCloudModels(): Promise<CloudModel[]> {
  const data = await request<{ success: boolean; models: CloudModel[] }>('/api/cloud-models');
  return data.models || [];
}

export async function saveCloudModel(payload: {
  providerName: string;
  apiKey: string;
  modelName: string;
  baseUrl: string;
  id?: string;
}): Promise<{ success: boolean; message?: string; model?: CloudModel; error?: string }> {
  return request<{ success: boolean; message?: string; model?: CloudModel }>('/api/cloud-models', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function testCloudModel(id: string): Promise<{ success: boolean; model?: string; latencyMs?: number; error?: string }> {
  return request<{ success: boolean; model?: string; latencyMs?: number; error?: string }>(`/api/cloud-models/${id}/test`, {
    method: 'POST'
  });
}

export async function deleteCloudModel(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/cloud-models/${id}`, {
    method: 'DELETE'
  });
}

export async function setActiveCloudModel(id: string): Promise<{ success: boolean; model?: CloudModel }> {
  return request<{ success: boolean; model?: CloudModel }>(`/api/cloud-models/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ isActive: true })
  });
}

// ----------------------------------------------------------------------
// PRODUCTS API
// ----------------------------------------------------------------------

export async function fetchProducts(): Promise<Product[]> {
  const data = await request<{ success: boolean; products: Product[] }>('/api/products');
  return data.products || [];
}

export async function collectProducts(storeUrl: string, keyword?: string): Promise<{ success: boolean; products: Product[]; message: string }> {
  return request<{ success: boolean; products: Product[]; message: string }>('/api/products/collect', {
    method: 'POST',
    body: JSON.stringify({ storeUrl, keyword })
  });
}

export async function extractProductImages(productId: string): Promise<{ success: boolean; images: string[] }> {
  return request<{ success: boolean; images: string[] }>(`/api/products/${productId}/extract-images`, {
    method: 'POST'
  });
}

// ----------------------------------------------------------------------
// TAVILY RESEARCH API
// ----------------------------------------------------------------------

export async function searchTavily(query: string): Promise<any> {
  return request<any>('/api/tavily/search', {
    method: 'POST',
    body: JSON.stringify({ query })
  });
}

// ----------------------------------------------------------------------
// AI GENERATION & SOCIAL QUEUE API
// ----------------------------------------------------------------------

export async function generateSocialPosts(payload: {
  productId: string;
  platforms: string[];
  tone?: string;
  customInstructions?: string;
}): Promise<any> {
  return request<any>('/api/ai/generate', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function generateVideoScript(productId: string, platform: string = 'TikTok'): Promise<any> {
  return request<any>('/api/video/generate', {
    method: 'POST',
    body: JSON.stringify({ productId, platform })
  });
}

export async function fetchQueue(): Promise<QueueItem[]> {
  const data = await request<{ success: boolean; queue: QueueItem[] }>('/api/queue');
  return data.queue || [];
}

export async function addToQueue(item: Partial<QueueItem>): Promise<QueueItem> {
  const data = await request<{ success: boolean; item: QueueItem }>('/api/queue', {
    method: 'POST',
    body: JSON.stringify(item)
  });
  return data.item;
}

export async function publishQueueItem(id: string): Promise<QueueItem> {
  const data = await request<{ success: boolean; item: QueueItem }>(`/api/queue/${id}/publish`, {
    method: 'POST'
  });
  return data.item;
}

export async function deleteQueueItem(id: string): Promise<void> {
  await request<any>(`/api/queue/${id}`, {
    method: 'DELETE'
  });
}

// ----------------------------------------------------------------------
// AUTOMATION & LOGS API
// ----------------------------------------------------------------------

export async function fetchAutomationStatus(): Promise<any> {
  return request<any>('/api/automation/status');
}

export async function toggleAutomation(enabled: boolean): Promise<any> {
  return request<any>('/api/automation/toggle', {
    method: 'POST',
    body: JSON.stringify({ enabled })
  });
}

export async function fetchLogs(): Promise<LogEntry[]> {
  const data = await request<{ success: boolean; logs: LogEntry[] }>('/api/logs');
  return data.logs || [];
}

export async function clearLogs(): Promise<void> {
  await request<any>('/api/logs', {
    method: 'DELETE'
  });
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const data = await request<{ success: boolean; stats: DashboardStats }>('/api/dashboard/stats');
  return data.stats;
}

export async function fetchSettings(): Promise<AppSettings> {
  const data = await request<{ success: boolean; settings: AppSettings }>('/api/settings');
  return data.settings;
}

export async function updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const data = await request<{ success: boolean; settings: AppSettings }>('/api/settings', {
    method: 'POST',
    body: JSON.stringify(settings)
  });
  return data.settings;
}
