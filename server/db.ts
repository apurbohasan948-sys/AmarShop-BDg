import fs from 'fs';
import path from 'path';

export interface CloudModelRecord {
  id: string;
  providerName: string;
  apiKey: string; // Server-only, NEVER exposed to client
  modelName: string;
  baseUrl: string;
  status: 'working' | 'untested' | 'error';
  latencyMs?: number;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SanitizedCloudModel {
  id: string;
  providerName: string;
  modelName: string;
  baseUrl: string;
  status: 'working' | 'untested' | 'error';
  latencyMs?: number;
  isDefault?: boolean;
  apiKeyConfigured: boolean;
  apiKeyMasked: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRecord {
  id: string;
  title: string;
  handle: string;
  price: number;
  originalPrice?: number;
  currency: string;
  imageUrl: string;
  additionalImages?: string[];
  description: string;
  category: string;
  storeUrl?: string;
  extractedHighQuality?: boolean;
  createdAt: string;
}

export interface QueueItemRecord {
  id: string;
  productId?: string;
  productTitle: string;
  productImage: string;
  platforms: ('facebook' | 'youtube' | 'tiktok' | 'reels')[];
  caption: string;
  hashtags: string[];
  status: 'pending' | 'approved' | 'published' | 'failed';
  scheduledTime: string;
  publishedTime?: string;
  videoUrl?: string;
  createdAt: string;
}

export interface LogRecord {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  category: 'api' | 'scraper' | 'ai' | 'publisher' | 'system';
  message: string;
  metadata?: any;
}

export interface AppSettings {
  defaultHashtags: string[];
  autoPublish: boolean;
  tavilyApiKey?: string;
  facebookAutoPost: boolean;
  instagramAutoPost: boolean;
  tiktokAutoPost: boolean;
  youtubeAutoPost: boolean;
  postingIntervalMinutes: number;
}

interface AppDatabase {
  cloudModels: CloudModelRecord[];
  products: ProductRecord[];
  queue: QueueItemRecord[];
  logs: LogRecord[];
  settings: AppSettings;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'app_data.json');

const INITIAL_DB: AppDatabase = {
  cloudModels: [],
  products: [
    {
      id: 'prod-1',
      title: 'Ergonomic Memory Foam Lumbar Support Pillow',
      handle: 'ergonomic-lumbar-support-pillow',
      price: 29.99,
      originalPrice: 49.99,
      currency: 'USD',
      imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80',
      additionalImages: [
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
        'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80'
      ],
      description: 'Medical-grade memory foam back cushion designed to relieve lower back pain, improve posture, and provide all-day comfort for desk workers and drivers.',
      category: 'Home & Office',
      storeUrl: 'https://shopbase.com/demo/lumbar-pillow',
      extractedHighQuality: true,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: 'prod-2',
      title: 'Ultra-Quiet 2L Ultrasonic Cool Mist Air Humidifier',
      handle: 'ultrasonic-cool-mist-humidifier',
      price: 34.50,
      originalPrice: 59.00,
      currency: 'USD',
      imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80',
      additionalImages: [
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80'
      ],
      description: 'Keep room air hydrated and fresh with whisper-quiet ultrasonic atomization, 7-color soothing ambient LED nightlight, and automatic dry-burn shutoff.',
      category: 'Wellness & Living',
      storeUrl: 'https://shopbase.com/demo/mist-humidifier',
      extractedHighQuality: true,
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
    }
  ],
  queue: [
    {
      id: 'queue-1',
      productId: 'prod-1',
      productTitle: 'Ergonomic Memory Foam Lumbar Support Pillow',
      productImage: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80',
      platforms: ['facebook', 'reels', 'tiktok'],
      caption: 'Stop suffering from back pain during long work hours! 🪑✨ Meet the ergonomic cushion desk workers swear by. Soft, supportive, posture-transforming.',
      hashtags: ['#WorkFromHome', '#OfficeErgonomics', '#DeskSetup', '#BackPainRelief', '#ShopBase'],
      status: 'approved',
      scheduledTime: new Date(Date.now() + 3600000 * 2).toISOString(),
      createdAt: new Date().toISOString()
    }
  ],
  logs: [
    {
      id: 'log-1',
      timestamp: new Date().toISOString(),
      level: 'info',
      category: 'system',
      message: 'ShopBase AI Social Media Automation initialized with persistent storage.'
    }
  ],
  settings: {
    defaultHashtags: ['#ShopBase', '#TrendingNow', '#ViralFinds', '#SmartShopping', '#Deals'],
    autoPublish: false,
    facebookAutoPost: true,
    instagramAutoPost: true,
    tiktokAutoPost: true,
    youtubeAutoPost: false,
    postingIntervalMinutes: 60
  }
};

class DatabaseManager {
  private data: AppDatabase;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): AppDatabase {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          ...INITIAL_DB,
          ...parsed,
          cloudModels: Array.isArray(parsed.cloudModels) ? parsed.cloudModels : [],
          products: Array.isArray(parsed.products) ? parsed.products : INITIAL_DB.products,
          queue: Array.isArray(parsed.queue) ? parsed.queue : INITIAL_DB.queue,
          logs: Array.isArray(parsed.logs) ? parsed.logs : INITIAL_DB.logs,
          settings: { ...INITIAL_DB.settings, ...(parsed.settings || {}) }
        };
      }
    } catch (err) {
      console.error('[DB] Failed to load data from disk, using defaults:', err);
    }
    this.saveData(INITIAL_DB);
    return JSON.parse(JSON.stringify(INITIAL_DB));
  }

  private saveData(dataToSave?: AppDatabase): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const data = dataToSave || this.data;
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('[DB] Failed to persist data to disk:', err);
    }
  }

  // API Key Masking Helper
  public maskApiKey(key: string): string {
    if (!key) return '';
    if (key.length <= 6) return '••••••••';
    const last4 = key.slice(-4);
    return `••••••••${last4}`;
  }

  // URL Normalization (Step 13: OpenAI-compatible URL helper)
  public normalizeBaseUrl(baseUrl: string): string {
    if (!baseUrl) return '';
    let trimmed = baseUrl.trim();
    // remove trailing slashes
    trimmed = trimmed.replace(/\/+$/, '');

    // If it already ends with /chat/completions, return as-is
    if (trimmed.endsWith('/chat/completions')) {
      return trimmed;
    }

    // If it already ends with /v1, append /chat/completions
    if (trimmed.endsWith('/v1')) {
      return `${trimmed}/chat/completions`;
    }

    // If it's a domain or path without /v1 and without /chat/completions
    // standard OpenAI-compatible API is /v1/chat/completions
    return `${trimmed}/v1/chat/completions`;
  }

  // Model Testing (Step 12 & 13)
  public async testOpenAIEndpoint(
    rawBaseUrl: string,
    apiKey: string,
    modelName: string
  ): Promise<{ success: boolean; latencyMs?: number; error?: string; rawResponse?: any }> {
    const endpoint = this.normalizeBaseUrl(rawBaseUrl);
    const startTime = Date.now();

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
          messages: [
            { role: 'user', content: 'Respond with exactly: OK' }
          ],
          max_tokens: 5,
          temperature: 0.1
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      if (!res.ok) {
        let errorDetails = `HTTP ${res.status} ${res.statusText}`;
        try {
          const errJson = await res.json();
          if (errJson?.error?.message) {
            errorDetails = errJson.error.message;
          } else if (typeof errJson === 'object') {
            errorDetails = JSON.stringify(errJson);
          }
        } catch {
          const text = await res.text().catch(() => '');
          if (text) errorDetails += `: ${text.slice(0, 150)}`;
        }
        return { success: false, error: errorDetails, latencyMs };
      }

      const data = await res.json();
      return { success: true, latencyMs, rawResponse: data };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      const msg = err.name === 'AbortError' ? 'Connection timed out after 12s' : (err.message || 'Network connection failed');
      return { success: false, error: msg, latencyMs };
    }
  }

  // --- Cloud Models Management ---

  public getSanitizedModels(): SanitizedCloudModel[] {
    return this.data.cloudModels.map((m) => ({
      id: m.id,
      providerName: m.providerName,
      modelName: m.modelName,
      baseUrl: m.baseUrl,
      status: m.status,
      latencyMs: m.latencyMs,
      isDefault: !!m.isDefault,
      apiKeyConfigured: !!m.apiKey,
      apiKeyMasked: this.maskApiKey(m.apiKey),
      createdAt: m.createdAt,
      updatedAt: m.updatedAt
    }));
  }

  public getModelById(id: string, includeSecret = false): (CloudModelRecord | SanitizedCloudModel) | null {
    const found = this.data.cloudModels.find((m) => m.id === id);
    if (!found) return null;
    if (includeSecret) return found;

    return {
      id: found.id,
      providerName: found.providerName,
      modelName: found.modelName,
      baseUrl: found.baseUrl,
      status: found.status,
      latencyMs: found.latencyMs,
      isDefault: !!found.isDefault,
      apiKeyConfigured: !!found.apiKey,
      apiKeyMasked: this.maskApiKey(found.apiKey),
      createdAt: found.createdAt,
      updatedAt: found.updatedAt
    };
  }

  public getActiveModel(): CloudModelRecord | null {
    const defaultModel = this.data.cloudModels.find((m) => m.isDefault && m.status === 'working');
    if (defaultModel) return defaultModel;
    const workingModel = this.data.cloudModels.find((m) => m.status === 'working');
    return workingModel || this.data.cloudModels[0] || null;
  }

  public async saveCloudModel(params: {
    providerName: string;
    apiKey: string;
    modelName: string;
    baseUrl: string;
    status?: 'working' | 'untested' | 'error';
    latencyMs?: number;
    isDefault?: boolean;
  }): Promise<SanitizedCloudModel> {
    const now = new Date().toISOString();
    const id = `model-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newRecord: CloudModelRecord = {
      id,
      providerName: params.providerName.trim(),
      apiKey: params.apiKey.trim(),
      modelName: params.modelName.trim(),
      baseUrl: this.normalizeBaseUrl(params.baseUrl),
      status: params.status || 'working',
      latencyMs: params.latencyMs,
      isDefault: this.data.cloudModels.length === 0 ? true : !!params.isDefault,
      createdAt: now,
      updatedAt: now
    };

    if (newRecord.isDefault) {
      this.data.cloudModels.forEach((m) => (m.isDefault = false));
    }

    this.data.cloudModels.push(newRecord);
    this.saveData();

    this.addLog('success', 'api', `Cloud model [${newRecord.providerName} / ${newRecord.modelName}] saved successfully.`);

    return {
      id: newRecord.id,
      providerName: newRecord.providerName,
      modelName: newRecord.modelName,
      baseUrl: newRecord.baseUrl,
      status: newRecord.status,
      latencyMs: newRecord.latencyMs,
      isDefault: newRecord.isDefault,
      apiKeyConfigured: true,
      apiKeyMasked: this.maskApiKey(newRecord.apiKey),
      createdAt: newRecord.createdAt,
      updatedAt: newRecord.updatedAt
    };
  }

  public updateCloudModel(
    id: string,
    updates: Partial<Omit<CloudModelRecord, 'id' | 'createdAt'>>
  ): SanitizedCloudModel | null {
    const idx = this.data.cloudModels.findIndex((m) => m.id === id);
    if (idx === -1) return null;

    const current = this.data.cloudModels[idx];
    if (updates.baseUrl) {
      updates.baseUrl = this.normalizeBaseUrl(updates.baseUrl);
    }
    if (updates.isDefault) {
      this.data.cloudModels.forEach((m) => (m.isDefault = false));
    }

    this.data.cloudModels[idx] = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveData();
    const updated = this.data.cloudModels[idx];

    return {
      id: updated.id,
      providerName: updated.providerName,
      modelName: updated.modelName,
      baseUrl: updated.baseUrl,
      status: updated.status,
      latencyMs: updated.latencyMs,
      isDefault: updated.isDefault,
      apiKeyConfigured: !!updated.apiKey,
      apiKeyMasked: this.maskApiKey(updated.apiKey),
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    };
  }

  public deleteCloudModel(id: string): boolean {
    const initialLen = this.data.cloudModels.length;
    this.data.cloudModels = this.data.cloudModels.filter((m) => m.id !== id);
    if (this.data.cloudModels.length !== initialLen) {
      if (this.data.cloudModels.length > 0 && !this.data.cloudModels.some((m) => m.isDefault)) {
        this.data.cloudModels[0].isDefault = true;
      }
      this.saveData();
      this.addLog('info', 'api', `Cloud model [${id}] removed.`);
      return true;
    }
    return false;
  }

  // --- Products ---
  public getProducts(): ProductRecord[] {
    return this.data.products;
  }

  public addProducts(newItems: Omit<ProductRecord, 'id' | 'createdAt'>[]): ProductRecord[] {
    const added: ProductRecord[] = [];
    for (const item of newItems) {
      const id = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const prod: ProductRecord = {
        ...item,
        id,
        createdAt: new Date().toISOString()
      };
      this.data.products.unshift(prod);
      added.push(prod);
    }
    this.saveData();
    this.addLog('info', 'scraper', `Collected ${added.length} product(s) into database.`);
    return added;
  }

  // --- Queue ---
  public getQueue(): QueueItemRecord[] {
    return this.data.queue;
  }

  public addToQueue(item: Omit<QueueItemRecord, 'id' | 'createdAt'>): QueueItemRecord {
    const newItem: QueueItemRecord = {
      ...item,
      id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    this.data.queue.unshift(newItem);
    this.saveData();
    this.addLog('info', 'publisher', `Scheduled post added to queue for [${newItem.productTitle}].`);
    return newItem;
  }

  public updateQueueItem(id: string, updates: Partial<QueueItemRecord>): QueueItemRecord | null {
    const idx = this.data.queue.findIndex((q) => q.id === id);
    if (idx === -1) return null;
    this.data.queue[idx] = { ...this.data.queue[idx], ...updates };
    this.saveData();
    return this.data.queue[idx];
  }

  public deleteQueueItem(id: string): boolean {
    const len = this.data.queue.length;
    this.data.queue = this.data.queue.filter((q) => q.id !== id);
    if (this.data.queue.length !== len) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Logs ---
  public getLogs(): LogRecord[] {
    return this.data.logs;
  }

  public addLog(
    level: 'info' | 'warn' | 'error' | 'success',
    category: 'api' | 'scraper' | 'ai' | 'publisher' | 'system',
    message: string,
    metadata?: any
  ): void {
    const entry: LogRecord = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      metadata
    };
    this.data.logs.unshift(entry);
    if (this.data.logs.length > 300) {
      this.data.logs = this.data.logs.slice(0, 300);
    }
    this.saveData();
  }

  public clearLogs(): void {
    this.data.logs = [];
    this.saveData();
  }

  // --- Settings ---
  public getSettings(): AppSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<AppSettings>): AppSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.saveData();
    return this.data.settings;
  }

  public get(): AppDatabase {
    return this.data;
  }

  public update(updater: (data: AppDatabase) => void): void {
    updater(this.data);
    this.saveData();
  }
}

export const db = new DatabaseManager();
