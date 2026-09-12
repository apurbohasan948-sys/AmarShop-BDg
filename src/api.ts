import {
  Product,
  AIModelConfig,
  TaskModelAssignments,
  TavilyConfig,
  BrandSettings,
  PricingRules,
  SocialAccountConfig,
  QueueItem,
  AutomationSettings,
  ActivityLog,
  DashboardStats,
  AppSettings,
  SocialAccount,
  ApkInfo,
} from './types';

export const api = {
  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await fetch('/api/dashboard/stats');
    return res.json();
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    const res = await fetch('/api/products');
    return res.json();
  },

  getProduct: async (id: string): Promise<Product> => {
    const res = await fetch(`/api/products/${id}`);
    return res.json();
  },

  saveProduct: async (product: Partial<Product>): Promise<{ product: Product; isDuplicate: boolean }> => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    return res.json();
  },

  deleteProduct: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Collector
  getCategories: async (): Promise<Array<{ name: string; url: string; count?: number }>> => {
    const res = await fetch('/api/collector/categories');
    return res.json();
  },

  extractProductUrl: async (url: string): Promise<{ product: Product; isDuplicate: boolean }> => {
    const res = await fetch('/api/collector/extract-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to extract product');
    }
    return res.json();
  },

  crawlCategory: async (categoryUrl: string): Promise<{ discoveredCount: number; urls: string[] }> => {
    const res = await fetch('/api/collector/crawl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryUrl }),
    });
    return res.json();
  },

  // Tavily
  getTavilyConfig: async (): Promise<TavilyConfig & { hasKey: boolean }> => {
    const res = await fetch('/api/tavily/config');
    return res.json();
  },

  saveTavilyConfig: async (config: Partial<TavilyConfig>): Promise<TavilyConfig> => {
    const res = await fetch('/api/tavily/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return res.json();
  },

  testTavily: async (apiKey?: string): Promise<{ success: boolean; status: string; latencyMs: number; message: string }> => {
    const res = await fetch('/api/tavily/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });
    return res.json();
  },

  searchTavily: async (query: string, depth = 'basic'): Promise<any> => {
    const res = await fetch('/api/tavily/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, depth }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Search failed');
    }
    return res.json();
  },

  // AI Models
  getAiModels: async (): Promise<Array<AIModelConfig & { hasKey: boolean }>> => {
    const res = await fetch('/api/ai/models');
    return res.json();
  },

  saveAiModel: async (model: Partial<AIModelConfig>): Promise<AIModelConfig> => {
    const res = await fetch('/api/ai/models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(model),
    });
    return res.json();
  },

  deleteAiModel: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/ai/models/${id}`, { method: 'DELETE' });
    return res.json();
  },

  testAiModel: async (model: Partial<AIModelConfig>): Promise<any> => {
    const res = await fetch('/api/ai/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(model),
    });
    return res.json();
  },

  saveAndTestAiModel: async (model: Partial<AIModelConfig>): Promise<{ model: AIModelConfig & { hasKey: boolean }; testResult: any }> => {
    const res = await fetch('/api/ai/save-and-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(model),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || 'Failed to save and test model');
    }
    return res.json();
  },

  getTaskAssignments: async (): Promise<TaskModelAssignments> => {
    const res = await fetch('/api/ai/tasks');
    return res.json();
  },

  saveTaskAssignments: async (assignments: TaskModelAssignments): Promise<TaskModelAssignments> => {
    const res = await fetch('/api/ai/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignments),
    });
    return res.json();
  },

  analyzeProduct: async (productId: string, tavilyContext?: string): Promise<any> => {
    const res = await fetch('/api/ai/analyze-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, tavilyContext }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Analysis failed');
    return res.json();
  },

  generateContent: async (productId: string, platform: string, contentType: string): Promise<any> => {
    const res = await fetch('/api/ai/generate-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, platform, contentType }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Content generation failed');
    return res.json();
  },

  // Video Spec
  getVideoSpec: async (payload: {
    productId: string;
    script?: string;
    duration?: number;
    template?: string;
    audioTrackId?: string;
  }): Promise<any> => {
    const res = await fetch('/api/video/spec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Social & Queue
  getSocialConfig: async (): Promise<SocialAccountConfig> => {
    const res = await fetch('/api/social/config');
    return res.json();
  },

  saveSocialConfig: async (config: Partial<SocialAccountConfig>): Promise<SocialAccountConfig> => {
    const res = await fetch('/api/social/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return res.json();
  },

  testSocialConnection: async (platform: string, token?: string, pageId?: string): Promise<any> => {
    const res = await fetch('/api/social/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, token, pageId }),
    });
    return res.json();
  },

  getQueue: async (): Promise<QueueItem[]> => {
    const res = await fetch('/api/queue');
    return res.json();
  },

  addToQueue: async (item: Partial<QueueItem>): Promise<QueueItem> => {
    const res = await fetch('/api/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return res.json();
  },

  updateQueueItem: async (id: string, updates: Partial<QueueItem>): Promise<QueueItem> => {
    const res = await fetch(`/api/queue/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  deleteQueueItem: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/queue/${id}`, { method: 'DELETE' });
    return res.json();
  },

  publishQueueItem: async (id: string): Promise<any> => {
    const res = await fetch(`/api/queue/${id}/publish`, { method: 'POST' });
    if (!res.ok) throw new Error((await res.json()).error || 'Publish failed');
    return res.json();
  },

  // Settings
  getBrandSettings: async (): Promise<BrandSettings> => {
    const res = await fetch('/api/brand');
    return res.json();
  },

  saveBrandSettings: async (settings: Partial<BrandSettings>): Promise<BrandSettings> => {
    const res = await fetch('/api/brand', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.json();
  },

  getPricingRules: async (): Promise<PricingRules> => {
    const res = await fetch('/api/pricing');
    return res.json();
  },

  savePricingRules: async (rules: Partial<PricingRules>): Promise<PricingRules> => {
    const res = await fetch('/api/pricing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rules),
    });
    return res.json();
  },

  getAutomationSettings: async (): Promise<AutomationSettings> => {
    const res = await fetch('/api/automation');
    return res.json();
  },

  saveAutomationSettings: async (settings: Partial<AutomationSettings>): Promise<AutomationSettings> => {
    const res = await fetch('/api/automation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.json();
  },

  runFullPipeline: async (productId: string, autoApprove = false): Promise<any> => {
    const res = await fetch('/api/automation/run-full-pipeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, autoApprove }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Pipeline execution failed');
    return res.json();
  },

  getLogs: async (limit = 100): Promise<ActivityLog[]> => {
    const res = await fetch(`/api/logs?limit=${limit}`);
    return res.json();
  },

  clearLogs: async (): Promise<{ success: boolean }> => {
    const res = await fetch('/api/logs/clear', { method: 'POST' });
    return res.json();
  },

  // Aliases for component compatibility
  getStats: async (): Promise<DashboardStats> => {
    const res = await fetch('/api/dashboard/stats');
    return res.json();
  },

  getAIModels: async (): Promise<Array<AIModelConfig & { hasKey: boolean }>> => {
    const res = await fetch('/api/ai/models');
    return res.json();
  },

  getSettings: async (): Promise<AppSettings> => {
    const [brand, pricing, social, automation] = await Promise.all([
      fetch('/api/brand').then(r => r.json()).catch(() => ({})),
      fetch('/api/pricing').then(r => r.json()).catch(() => ({})),
      fetch('/api/social/config').then(r => r.json()).catch(() => ({})),
      fetch('/api/automation').then(r => r.json()).catch(() => ({})),
    ]);
    return {
      brandName: brand?.brandName || 'ShopBase BD',
      defaultLanguage: brand?.language || 'Bangla',
      brandTone: 'Casual & Energetic',
      contactPhone: brand?.contactNumber || '+8801700000000',
      deliveryNote: 'Cash on delivery available across Bangladesh. Dhaka: 70 BDT, Outside Dhaka: 130 BDT.',
      markupPercent: pricing?.percentageProfit ? 1 + pricing.percentageProfit / 100 : 1.15,
      isTestMode: automation?.testMode ?? true,
      requireApproval: !automation?.autoPost,
      autoGenerateVideo: automation?.autoGenerate ?? true,
      collectionIntervalMinutes: (automation?.intervalHours || 1) * 60,
      maxPostsPerDay: 10,
      socialAccounts: [
        {
          platform: 'facebook',
          isActive: social?.facebook?.connected ?? true,
          credentials: {
            pageId: social?.facebook?.pageId || '',
            accessToken: social?.facebook?.accessToken || '',
          },
        },
        {
          platform: 'youtube',
          isActive: social?.youtube?.connected ?? true,
          credentials: {
            channelId: social?.youtube?.channelId || '',
            accessToken: social?.youtube?.accessToken || '',
          },
        },
        {
          platform: 'tiktok',
          isActive: social?.tiktok?.connected ?? true,
          credentials: {
            openId: social?.tiktok?.accountName || '',
            accessToken: social?.tiktok?.accessToken || '',
          },
        },
      ],
    };
  },

  updateSettings: async (settings: AppSettings): Promise<boolean> => {
    await Promise.all([
      fetch('/api/brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: settings.brandName,
          language: settings.defaultLanguage,
          contactNumber: settings.contactPhone,
        }),
      }),
      fetch('/api/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          percentageProfit: Math.round((settings.markupPercent - 1) * 100),
        }),
      }),
      fetch('/api/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testMode: settings.isTestMode,
          autoPost: !settings.requireApproval,
          autoGenerate: settings.autoGenerateVideo,
          intervalHours: Math.max(1, Math.round(settings.collectionIntervalMinutes / 60)),
        }),
      }),
      fetch('/api/social/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facebook: {
            connected: settings.socialAccounts.find(a => a.platform === 'facebook')?.isActive ?? true,
            pageId: settings.socialAccounts.find(a => a.platform === 'facebook')?.credentials.pageId,
            accessToken: settings.socialAccounts.find(a => a.platform === 'facebook')?.credentials.accessToken,
          },
          youtube: {
            connected: settings.socialAccounts.find(a => a.platform === 'youtube')?.isActive ?? true,
            channelId: settings.socialAccounts.find(a => a.platform === 'youtube')?.credentials.channelId,
            accessToken: settings.socialAccounts.find(a => a.platform === 'youtube')?.credentials.accessToken,
          },
          tiktok: {
            connected: settings.socialAccounts.find(a => a.platform === 'tiktok')?.isActive ?? true,
            accountName: settings.socialAccounts.find(a => a.platform === 'tiktok')?.credentials.openId,
            accessToken: settings.socialAccounts.find(a => a.platform === 'tiktok')?.credentials.accessToken,
          },
        }),
      }),
    ]);
    return true;
  },

  testSocialAccount: async (platform: string): Promise<{ success: boolean; message: string }> => {
    const res = await fetch('/api/social/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform }),
    });
    return res.json();
  },

  runAutomationNow: async (): Promise<any> => {
    const res = await fetch('/api/automation/run-now', { method: 'POST' });
    return res.json();
  },

  runProductPipeline: async (productId: string, autoApprove = false): Promise<any> => {
    const res = await fetch('/api/automation/run-full-pipeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, autoApprove }),
    });
    return res.json();
  },

  getApkInfo: async (): Promise<ApkInfo> => {
    const res = await fetch('/api/apk/info');
    return res.json();
  },

  updateApkConfig: async (config: { appName?: string; appId?: string }): Promise<{ success: boolean; config: any }> => {
    const res = await fetch('/api/apk/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return res.json();
  },
};
