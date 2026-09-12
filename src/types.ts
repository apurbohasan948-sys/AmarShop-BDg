export interface ProductImage {
  id: string;
  originalImageUrl: string;
  highResolutionImageUrl: string;
  width?: number;
  height?: number;
  format?: string;
  fileSize?: string;
  qualityScore: number; // 0 - 100
  label?: string;
  isSelected?: boolean;
}

export interface ProductVariation {
  id: string;
  name: string;
  options: string[];
  price?: number;
  sku?: string;
}

export interface Product {
  id: string;
  source: string; // 'ShopBase BD'
  sourceUrl: string;
  productId: string;
  sku: string;
  title: string;
  description: string;
  category: string;
  price: number; // source price in BDT
  originalPrice?: number;
  profit: number; // calculated profit
  sellingPrice: number; // source + profit
  currency: string; // 'BDT'
  features: string[];
  variations: ProductVariation[];
  images: ProductImage[];
  videos: string[];
  availability: 'in_stock' | 'out_of_stock' | 'limited';
  sourceCollectedAt: string;
  updatedAt: string;
  contentStatus: 'pending' | 'analyzed' | 'creatives_generated';
  publishingStatus: 'unprocessed' | 'in_queue' | 'partially_published' | 'fully_published';
  tavilyResearch?: {
    query: string;
    summary: string;
    trends: string[];
    keywords: string[];
    researchedAt: string;
  };
  aiAnalysis?: {
    summary: string;
    keySellingPoints: string[];
    targetCustomer: string;
    marketingAngle: string;
    shortHook: string;
    benefits: string[];
    cta: string;
    keywords: string[];
    hashtags: string[];
    modelUsed: string;
    generatedAt: string;
  };
}

export type AIProviderType = 'openai' | 'gemini' | 'anthropic' | 'groq' | 'deepseek' | 'openrouter' | 'mistral' | 'together' | 'custom' | string;

export type AIHealthStatus = 'Working' | 'Not Tested' | 'Failed' | 'Disabled' | 'Rate Limited' | 'Authentication Failed';

export interface AIModelConfig {
  id: string;
  providerName: string; // e.g. "DeepSeek"
  name?: string; // backwards compatibility alias for providerName
  provider?: AIProviderType; // backwards compatibility
  baseUrl: string;
  endpoint?: string;
  apiKey: string; // Securely stored, masked in client responses (e.g. sk-••••••••1234)
  modelName: string; // e.g. "deepseek-chat"
  apiType?: 'openai-compatible' | 'gemini' | 'anthropic' | 'custom' | string;
  authHeaderType?: 'Bearer' | 'x-api-key' | 'none' | 'custom';
  customHeaders?: Record<string, string>;
  requestTemplate?: string; // JSON string template
  responsePath?: string; // e.g. "choices[0].message.content"
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  latency?: number; // In milliseconds
  latencyMs?: number; // backwards compatibility
  lastTestedAt?: string;
  lastTestStatus?: AIHealthStatus;
  status?: 'online' | 'error' | 'untested'; // backwards compatibility
  errorMessage?: string;
  enabled?: boolean;
  isEnabled: boolean;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskModelAssignments {
  productAnalysis: string; // model ID
  facebookCaption: string; // Facebook Post Model
  youtubeContent: string; // YouTube Model
  tiktokContent: string; // TikTok Model
  videoScript: string; // Video Script Model
  imagePrompt?: string;
  generalMarketing?: string;
  primaryModelId?: string; // Failover Primary Model
  fallbackModelId?: string; // Fallback Model 1
  fallbackModel2Id?: string; // Fallback Model 2
  enableFallback: boolean;
}

export interface TavilyConfig {
  apiKey: string;
  searchDepth: 'basic' | 'advanced';
  maxResults: number;
  includeAnswer: boolean;
  status: 'online' | 'error' | 'untested' | 'not_configured';
  lastTestedAt?: string;
  latencyMs?: number;
  errorMessage?: string;
}

export interface BrandSettings {
  brandName: string;
  logoUrl: string;
  contactNumber: string;
  facebookPage: string;
  website: string;
  orderUrl: string;
  defaultCta: string;
  defaultProfit: number;
  currency: string;
  language: 'Bangla' | 'English' | 'Banglish';
}

export interface PricingRules {
  strategy: 'fixed' | 'percentage' | 'custom';
  fixedProfit: number; // e.g. 100 BDT
  percentageProfit: number; // e.g. 15%
  minProfit: number; // e.g. 50 BDT
  customFormula?: string;
}

export type SocialPlatform = 'facebook' | 'youtube' | 'tiktok';
export type ContentType = 'facebook_post' | 'facebook_reel' | 'youtube_video' | 'youtube_short' | 'tiktok_video';
export type QueueStatus = 'draft' | 'approved' | 'scheduled' | 'publishing' | 'published' | 'failed';

export interface SocialAccountConfig {
  facebook: {
    connected: boolean;
    pageId?: string;
    pageName?: string;
    accessToken?: string;
    status: 'online' | 'not_configured' | 'auth_failed';
    lastTestedAt?: string;
    error?: string;
  };
  youtube: {
    connected: boolean;
    channelId?: string;
    channelTitle?: string;
    accessToken?: string;
    status: 'online' | 'not_configured' | 'auth_failed';
    lastTestedAt?: string;
    error?: string;
  };
  tiktok: {
    connected: boolean;
    accountName?: string;
    accessToken?: string;
    status: 'online' | 'not_configured' | 'auth_failed';
    permissionsNotice?: string;
    lastTestedAt?: string;
    error?: string;
  };
}

export interface QueueItem {
  id: string;
  productId: string;
  productTitle: string;
  platform: SocialPlatform;
  contentType: ContentType;
  status: QueueStatus;
  scheduledTime?: string;
  publishedAt?: string;
  externalPostId?: string;
  externalPostUrl?: string;
  errorMessage?: string;
  aiModelUsed?: string;
  tavilyResearchUsed?: boolean;
  content: {
    title?: string;
    caption: string;
    hook?: string;
    sellingPriceText?: string;
    featuresList?: string[];
    cta?: string;
    hashtags: string[];
    tags?: string[];
    videoScript?: string;
    mediaUrls: string[];
    videoUrl?: string;
    videoDurationSeconds?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AutomationSettings {
  autoCollect: boolean;
  autoGenerate: boolean;
  autoPost: boolean;
  intervalHours: number;
  testMode: boolean; // Safe mode: do not publish real posts
  categoryFilters: string[];
  minQualityScore: number;
  lastRunAt?: string;
  nextRunAt?: string;
  isCollectorRunning?: boolean;
  isGeneratorRunning?: boolean;
  isPublisherRunning?: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  service: 'Collector' | 'Tavily' | 'AI' | 'Video' | 'Facebook' | 'YouTube' | 'TikTok' | 'Scheduler' | 'Database';
  message: string;
  details?: Record<string, any>;
}

export type LogEntry = ActivityLog;

export interface VideoScene {
  sceneNumber: number;
  imageUrl: string;
  textOverlay: string;
  durationSeconds: number;
  transitionEffect: string;
  zoomPanEffect?: string;
  badge?: string;
}

export interface VideoRenderSpec {
  id: string;
  productId: string;
  aspectRatio: '9:16';
  width: number;
  height: number;
  durationSeconds: number;
  fps: number;
  templateStyle: string;
  audioTrackId: string;
  scenes: VideoScene[];
  voiceoverScript?: string;
  exportFormat: 'mp4';
}

export interface DashboardStats {
  productsCollected: number;
  newProducts: number;
  aiContentGenerated: number;
  videosGenerated: number;
  postsPublished: number;
  failedPosts: number;
  scheduledPosts: number;
  connectedPlatforms: {
    facebook: boolean;
    youtube: boolean;
    tiktok: boolean;
  };
  activeAiModel: string;
  tavilyStatus: string;
  automationStatus: 'running' | 'paused' | 'stopped';
  testMode: boolean;
}

export interface SocialAccount {
  platform: 'facebook' | 'youtube' | 'tiktok';
  isActive: boolean;
  credentials: {
    pageId?: string;
    channelId?: string;
    openId?: string;
    accessToken?: string;
  };
}

export interface AppSettings {
  brandName: string;
  defaultLanguage: 'Bangla' | 'English' | 'Banglish';
  brandTone: 'Casual & Energetic' | 'Urgency & Limited Offer' | 'Premium Luxury' | 'Informative & Friendly';
  contactPhone: string;
  deliveryNote: string;
  markupPercent: number;
  isTestMode: boolean;
  requireApproval: boolean;
  autoGenerateVideo: boolean;
  collectionIntervalMinutes: number;
  maxPostsPerDay: number;
  socialAccounts: SocialAccount[];
}

export interface ApkInfo {
  appName: string;
  appId: string;
  webDir: string;
  workflowFile: string;
  workflowYaml: string;
  hasCapacitor: boolean;
  hasWorkflow: boolean;
  instructionsBangla: string[];
  instructionsEnglish: string[];
}

