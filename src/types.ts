export interface Product {
  id: string;
  title: string;
  titleBn?: string;
  description: string;
  descriptionBn?: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  category: string;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  sku: string;
  images: string[];
  sourceUrl?: string;
  tags: string[];
  status: 'draft' | 'ready' | 'published';
  createdAt: string;
  aiGeneratedCopy?: {
    headline: string;
    facebookPost: string;
    instagramCaption: string;
    tiktokScript: string;
    hashtags: string[];
    generatedAt: string;
  };
}

export type PlatformType = 'facebook' | 'instagram' | 'tiktok';

export interface PublishingQueueItem {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  platform: PlatformType;
  scheduledTime: string;
  content: {
    caption: string;
    hashtags: string[];
    mediaUrl: string;
    callToAction: string;
  };
  status: 'pending' | 'approved' | 'published' | 'failed';
  publishedAt?: string;
  error?: string;
}

export type LogLevel = 'info' | 'warn' | 'error' | 'success';
export type LogModule = 'collector' | 'ai' | 'queue' | 'tavily' | 'system' | 'social';

export interface SystemLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  module: LogModule;
  message: string;
  details?: string;
}

export interface AIModelConfig {
  id: string;
  name: string;
  provider: 'gemini' | 'openai' | 'anthropic' | 'custom';
  modelId: string;
  isDefault: boolean;
  apiKeyConfigured: boolean;
  status: 'active' | 'configured' | 'unconfigured';
}

export interface StoreSettings {
  storeName: string;
  shopBaseStoreUrl: string;
  shopBaseApiKey: string;
  currencySymbol: string;
  targetMarket: string;
  defaultLanguage: 'bn' | 'en' | 'both';
  autoPublishEnabled: boolean;
  scheduleIntervalMinutes: number;
  socialAccounts: {
    facebookConnected: boolean;
    facebookPageName: string;
    instagramConnected: boolean;
    instagramHandle: string;
    tiktokConnected: boolean;
    tiktokUsername: string;
  };
}

export interface TavilyResearchResult {
  id: string;
  query: string;
  title: string;
  url: string;
  snippet: string;
  score: number;
  category: string;
  trendingDemand: 'very_high' | 'high' | 'moderate';
  estimatedMargin: string;
  suggestedAction: string;
}
