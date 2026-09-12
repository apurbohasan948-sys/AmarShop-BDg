import {
  Product,
  PublishingQueueItem,
  SystemLog,
  AIModelConfig,
  StoreSettings,
  TavilyResearchResult,
} from './types.ts';

async function safeFetch<T>(url: string, options?: RequestInit, retries = 1): Promise<T> {
  const method = (options?.method || 'GET').toUpperCase();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...((options?.headers as Record<string, string>) || {}),
  };

  if (method !== 'GET' && method !== 'HEAD' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const rawText = await res.text();
      throw new Error(
        `API endpoint returned non-JSON response (${res.status} ${res.statusText}): ${rawText.slice(0, 80)}...`
      );
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err: any) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return safeFetch<T>(url, options, retries - 1);
    }
    console.error(`[API Error] ${url}:`, err.message || err);
    throw err;
  }
}

export const api = {
  // Health
  async getHealth(): Promise<{ status: string; service: string; geminiConfigured: boolean; uptime: number }> {
    return safeFetch('/api/health');
  },

  // Products
  async getProducts(): Promise<{ success: boolean; data: Product[] }> {
    return safeFetch('/api/products');
  },

  async addProduct(product: Partial<Product>): Promise<{ success: boolean; data: Product }> {
    return safeFetch('/api/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<{ success: boolean; data: Product }> {
    return safeFetch(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteProduct(id: string): Promise<{ success: boolean }> {
    return safeFetch(`/api/products/${id}`, {
      method: 'DELETE',
    });
  },

  async collectProduct(sourceUrl: string): Promise<{ success: boolean; data: Product }> {
    return safeFetch('/api/products/collect', {
      method: 'POST',
      body: JSON.stringify({ sourceUrl }),
    });
  },

  // AI Generation
  async generateAICopy(params: {
    productId?: string;
    title: string;
    description?: string;
    category?: string;
    price?: number;
    currency?: string;
    tone?: string;
    language?: string;
  }): Promise<{
    success: boolean;
    data: {
      headline: string;
      facebookPost: string;
      instagramCaption: string;
      tiktokScript: string;
      hashtags: string[];
    };
  }> {
    return safeFetch('/api/ai/generate-copy', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Publishing Queue
  async getQueue(): Promise<{ success: boolean; data: PublishingQueueItem[] }> {
    return safeFetch('/api/queue');
  },

  async addToQueue(item: Partial<PublishingQueueItem>): Promise<{ success: boolean; data: PublishingQueueItem }> {
    return safeFetch('/api/queue', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  async updateQueueStatus(id: string, updates: Partial<PublishingQueueItem>): Promise<{ success: boolean; data: PublishingQueueItem }> {
    return safeFetch(`/api/queue/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteQueueItem(id: string): Promise<{ success: boolean }> {
    return safeFetch(`/api/queue/${id}`, {
      method: 'DELETE',
    });
  },

  async publishNow(id: string): Promise<{ success: boolean; data: PublishingQueueItem }> {
    return safeFetch(`/api/queue/publish-now/${id}`, {
      method: 'POST',
    });
  },

  async triggerSchedulerTick(): Promise<{ success: boolean; data: { published: number; approved: number } }> {
    return safeFetch('/api/queue/scheduler/tick', {
      method: 'POST',
    });
  },

  // AI Models
  async getModels(): Promise<{ success: boolean; data: AIModelConfig[] }> {
    return safeFetch('/api/models');
  },

  async testModel(provider: string, modelId: string): Promise<{ success: boolean; data: { success: boolean; message: string } }> {
    return safeFetch('/api/models/test', {
      method: 'POST',
      body: JSON.stringify({ provider, modelId }),
    });
  },

  // Research
  async getResearch(): Promise<{ success: boolean; data: TavilyResearchResult[] }> {
    return safeFetch('/api/research');
  },

  async runResearch(query: string): Promise<{ success: boolean; data: TavilyResearchResult[] }> {
    return safeFetch('/api/research', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  },

  // Logs
  async getLogs(): Promise<{ success: boolean; data: SystemLog[] }> {
    return safeFetch('/api/logs');
  },

  async clearLogs(): Promise<{ success: boolean }> {
    return safeFetch('/api/logs', {
      method: 'DELETE',
    });
  },

  // Settings
  async getSettings(): Promise<{ success: boolean; data: StoreSettings }> {
    return safeFetch('/api/settings');
  },

  async updateSettings(updates: Partial<StoreSettings>): Promise<{ success: boolean; data: StoreSettings }> {
    return safeFetch('/api/settings', {
      method: 'POST',
      body: JSON.stringify(updates),
    });
  },

  async resetDatabase(): Promise<{ success: boolean; message: string }> {
    return safeFetch('/api/db/reset', {
      method: 'POST',
    });
  },
};
