export interface CloudModel {
  id: string;
  providerName: string;
  modelName: string;
  baseUrl: string;
  status: 'working' | 'untested' | 'error';
  isActive: boolean;
  apiKeyConfigured: boolean;
  apiKeyMasked: string;
  latencyMs?: number;
  lastError?: string;
  lastTestedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  price: string;
  comparePrice?: string;
  images: string[];
  tags: string[];
  extractedFeatures?: string[];
  sourceUrl?: string;
  collectedAt: string;
}

export interface QueueItem {
  id: string;
  productId?: string;
  productTitle?: string;
  platform: 'Facebook' | 'YouTube' | 'TikTok' | 'Reels';
  caption: string;
  hashtags: string[];
  hook: string;
  mediaUrl?: string;
  mediaType: 'image' | 'video';
  scheduledFor: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  createdAt: string;
  publishedAt?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  category: 'API' | 'SYSTEM' | 'COLLECTOR' | 'AI' | 'PUBLISH';
  message: string;
}

export interface AppSettings {
  autoPublish: boolean;
  publishIntervalMinutes: number;
  defaultPlatforms: string[];
  tavilyApiKey: string;
  shopBaseStoreUrl: string;
  aiTemperature: number;
  hashtagCount: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalQueued: number;
  totalPublished: number;
  activeModel: string;
  activeModelStatus: string;
  autoPublishActive: boolean;
}
