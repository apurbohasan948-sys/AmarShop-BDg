import fs from 'fs';
import path from 'path';
import {
  Product,
  PublishingQueueItem,
  SystemLog,
  AIModelConfig,
  StoreSettings,
  TavilyResearchResult,
} from '../src/types.ts';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'app_data.json');

export interface AppDatabase {
  products: Product[];
  queue: PublishingQueueItem[];
  logs: SystemLog[];
  models: AIModelConfig[];
  settings: StoreSettings;
  research: TavilyResearchResult[];
}

const defaultProducts: Product[] = [
  {
    id: 'prod-1',
    title: 'Premium Royal Silk Embroidered Panjabi',
    titleBn: 'প্রিমিয়াম রয়্যাল সিল্ক এমব্রয়ডারি করা পাঞ্জাবি',
    description: 'Crafted with premium silk fabric with elegant neck and cuff embroidery. Ideal for Eid, weddings, and formal occasions.',
    descriptionBn: 'উচ্চমানের আরামদায়ক সিল্ক কাপড়ের ওপর আকর্ষণীয় সুঁই-সুতার কারুকাজ। ঈদ ও বিশেষ অনুষ্ঠানের জন্য সেরা পছন্দ।',
    price: 2450,
    compareAtPrice: 3200,
    currency: 'BDT',
    category: 'Men Fashion',
    stockStatus: 'in_stock',
    sku: 'PANJ-SILK-001',
    images: [
      'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80',
    ],
    sourceUrl: 'https://amarshopbd.shopbase.net/products/royal-silk-panjabi',
    tags: ['Panjabi', 'Eid Collection', 'Silk', 'Men Fashion'],
    status: 'ready',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    aiGeneratedCopy: {
      headline: '✨ ঈদ ও উৎসবে আপনার আভিজাত্য বাড়াতে প্রিমিয়াম রয়্যাল সিল্ক পাঞ্জাবি!',
      facebookPost: 'পরিপাটি ও মার্জিত লুকের জন্য এবার বেছে নিন AmarShop BD-এর স্পেশাল রয়্যাল সিল্ক পাঞ্জাবি।\n\n🔹 ১০০% প্রিমিয়াম কোয়ালিটি ফ্যাবরিক্স\n🔹 চমৎকার হ্যান্ড-এমব্রয়ডারি ডিজাইন\n🔹 ক্যাশ অন ডেলিভারি সারা বাংলাদেশে!\n\nসীমিত স্টক! এখনই ইনবক্স অথবা অর্ডার বাটনে ক্লিক করে লুফে নিন।',
      instagramCaption: 'Elevate your festive look with our Royal Silk Embroidered Panjabi ✨ Crafted for ultimate comfort & timeless elegance. Nationwide Cash on Delivery! 📦🇧🇩 #AmarShopBD #PanjabiLook #EidStyle',
      tiktokScript: '[Hook: 0-3s]: এই ঈদে পাঞ্জাবিতে সেরা লুক খুঁজছেন?\n[Body: 3-10s]: দেখুন আমাদের এক্সক্লুসিভ সিল্ক কালেকশন! প্রিমিয়াম ফিনিশিং ও নিখুঁত কাজ।\n[Call-To-Action: 10-15s]: বায়ো লিংক অথবা ইনবক্সে অর্ডার দিন এখনই!',
      hashtags: ['#AmarShopBD', '#EidCollection', '#MensFashionBD', '#TraditionalWear', '#ShopBaseBD'],
      generatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  },
  {
    id: 'prod-2',
    title: 'Ultra AMOLED Calling Smart Watch with Health Monitor',
    titleBn: 'আল্ট্রা অ্যামোলেড কলিং স্মার্ট ওয়াচ (হার্ট রেট ও স্লিপ ট্র্যাকারসহ)',
    description: 'High definition 1.96-inch AMOLED display, Bluetooth calling, IP68 water resistance, battery backup up to 7 days.',
    descriptionBn: '১.৯৬ ইঞ্চি ফুল অ্যামোলেড ডিসপ্লে, ব্লুটুথ এইচডি কলিং, হার্ট রেট ও ব্লাড অক্সিজেন সেন্সর, ৭ দিনের দীর্ঘ ব্যাটারি ব্যাকআপ।',
    price: 3190,
    compareAtPrice: 4500,
    currency: 'BDT',
    category: 'Gadgets',
    stockStatus: 'in_stock',
    sku: 'SMART-WCH-002',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    ],
    sourceUrl: 'https://amarshopbd.shopbase.net/products/amoled-smart-watch',
    tags: ['Smart Watch', 'Gadget', 'Bluetooth Calling', 'Fitness'],
    status: 'published',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    aiGeneratedCopy: {
      headline: '⚡ প্রিমিয়াম অ্যামোলেড ডিসপ্লের সাথে এইচডি ব্লুটুথ কলিং স্মার্টওয়াচ!',
      facebookPost: 'হাতে পরলেই স্মার্টনেসের নতুন ছোঁয়া! কল রিসিভ, ফিটনেস ট্র্যাকিং এবং দীর্ঘস্থায়ী ব্যাটারি ব্যাকআপ—সব পাবেন একসাথে।\n\n✅ ক্রিস্টাল ক্লিয়ার AMOLED ডিসপ্লে\n✅ ১ বছরের রিপ্লেসমেন্ট ওয়ারেন্টি\n✅ দ্রুত হোম ডেলিভারি\n\nঅর্ডার করতে এখনি শপ নাও বাটনে ক্লিক করুন।',
      instagramCaption: 'Stay connected in style ⌚✨ High resolution AMOLED screen, health sensors & 7-day battery life. Get yours now with free delivery in Dhaka! #SmartWatchBD #GadgetsBD #TechStyle',
      tiktokScript: '[Visual: Unboxing the sleek smart watch]\n[Voiceover]: বাজেট দামে সেরা কলিং স্মার্ট ওয়াচ খুঁজছেন? এই ঘড়িটি একবার দেখুন!\n[Screen text: ৳৩,১৯০ মাত্র! অফার সীমিত সময়ের জন্য]',
      hashtags: ['#SmartWatch', '#TechBD', '#GadgetReview', '#AmarShopBD', '#WearableTech'],
      generatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
  },
  {
    id: 'prod-3',
    title: 'Handcrafted Genuine Cowhide Leather Bifold Wallet',
    titleBn: '১০০% খাঁটি চামড়ার হ্যান্ডক্রাফটেড লেদার ওয়ালেট',
    description: '100% genuine top-grain cow leather bifold wallet with RFID blocking layer and 8 card slots.',
    descriptionBn: 'আসল গরুর চামড়ায় তৈরি টেকসই ওয়ালেট। আরএফআইডি সিকিউরিটি ও ৮টি কার্ড স্লটসহ আকর্ষণীয় লুক।',
    price: 1150,
    compareAtPrice: 1600,
    currency: 'BDT',
    category: 'Accessories',
    stockStatus: 'in_stock',
    sku: 'WAL-LEA-003',
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
    ],
    sourceUrl: 'https://amarshopbd.shopbase.net/products/genuine-leather-wallet',
    tags: ['Leather', 'Wallet', 'Men Accessories', 'RFID'],
    status: 'ready',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'prod-4',
    title: 'ANC Wireless Bluetooth Earbuds with Bass Boost',
    titleBn: 'অ্যাক্টিভ নয়েজ ক্যান্সেলেশন ওয়্যারলেস ব্লুটুথ ইয়ারবাডস',
    description: 'Active Noise Cancellation, 35 hours total playtime, dynamic deep bass drivers and touch controls.',
    descriptionBn: 'নয়েজ ক্যান্সেলেশন টেকনোলজি, ৩৫ ঘণ্টার দীর্ঘ প্লেব্যাক এবং পাওয়ারফুল ডিপ ব্যাস সাউন্ড।',
    price: 1850,
    compareAtPrice: 2600,
    currency: 'BDT',
    category: 'Audio',
    stockStatus: 'in_stock',
    sku: 'EAR-ANC-004',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
    ],
    sourceUrl: 'https://amarshopbd.shopbase.net/products/anc-bluetooth-earbuds',
    tags: ['Earbuds', 'ANC', 'Wireless', 'Audio'],
    status: 'draft',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'prod-5',
    title: 'Handloom Traditional Tangail Cotton Saree',
    titleBn: 'ঐতিহ্যবাহী তাঁতের টাঙ্গাইল কটন শাড়ি',
    description: 'Authentic 100% pure cotton saree crafted by traditional artisans of Tangail. Comfortable for summer and festive occasions.',
    descriptionBn: 'টাঙ্গাইলের দক্ষ তাঁতিদের নিখুঁত হাতের কাজ। সুতি কাপড়ের চমৎকার আরাম ও ঐতিহ্যবাহী নকশা।',
    price: 1950,
    compareAtPrice: 2800,
    currency: 'BDT',
    category: 'Women Fashion',
    stockStatus: 'in_stock',
    sku: 'SAR-TANG-005',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    ],
    sourceUrl: 'https://amarshopbd.shopbase.net/products/tangail-cotton-saree',
    tags: ['Saree', 'Tangail Cotton', 'Handloom', 'Women Fashion'],
    status: 'ready',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

const defaultQueue: PublishingQueueItem[] = [
  {
    id: 'queue-1',
    productId: 'prod-1',
    productTitle: 'Premium Royal Silk Embroidered Panjabi',
    productImage: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80',
    platform: 'facebook',
    scheduledTime: new Date(Date.now() + 3600000 * 2).toISOString(),
    content: {
      caption: '✨ স্পেশাল ঈদ অফার! AmarShop BD নিয়ে এলো প্রিমিয়াম রয়্যাল সিল্ক পাঞ্জাবি।\n\nপরিপাটি ও মার্জিত লুক পেতে এখনই অর্ডার করুন ক্যাশ অন ডেলিভারিতে!',
      hashtags: ['#AmarShopBD', '#EidCollection2026', '#PanjabiFashion', '#ShopBaseBD'],
      mediaUrl: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80',
      callToAction: 'Shop Now',
    },
    status: 'approved',
  },
  {
    id: 'queue-2',
    productId: 'prod-2',
    productTitle: 'Ultra AMOLED Calling Smart Watch with Health Monitor',
    productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    platform: 'instagram',
    scheduledTime: new Date(Date.now() + 3600000 * 5).toISOString(),
    content: {
      caption: 'Keep your lifestyle smart and active with Ultra AMOLED Smart Watch ⌚⚡ 7-day battery life, HD calling & health tracking. Shop link in bio! #AmarShopBD #SmartWatchBD',
      hashtags: ['#SmartWatchBD', '#TechAccessories', '#LifestyleBD', '#FitnessWatch'],
      mediaUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      callToAction: 'Order on Website',
    },
    status: 'pending',
  },
  {
    id: 'queue-3',
    productId: 'prod-3',
    productTitle: 'Handcrafted Genuine Cowhide Leather Bifold Wallet',
    productImage: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
    platform: 'tiktok',
    scheduledTime: new Date(Date.now() + 3600000 * 8).toISOString(),
    content: {
      caption: 'আসল চামড়ার প্রিমিয়াম ওয়ালেট মাত্র ১১৫০ টাকায়! ডেলিভারির সময় দেখে নেওয়ার সুবিধা। #LeatherWalletBD #AmarShopBD',
      hashtags: ['#LeatherWallet', '#MensAccessories', '#BangladeshShopping'],
      mediaUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
      callToAction: 'Send Message',
    },
    status: 'pending',
  },
];

const defaultLogs: SystemLog[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    level: 'info',
    module: 'system',
    message: 'AmarShop BD Automation Core initialized successfully.',
    details: 'Database connected, background scheduler armed.',
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    level: 'success',
    module: 'collector',
    message: 'ShopBase sync completed: 5 products cataloged.',
    details: 'Verified pricing currency (BDT) and inventory metrics.',
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    level: 'success',
    module: 'ai',
    message: 'AI Marketing Copy generated for "Ultra AMOLED Calling Smart Watch"',
    details: 'Generated dual-language captions (Bangla + English) and hashtag bundle using Gemini.',
  },
];

const defaultModels: AIModelConfig[] = [
  {
    id: 'gemini-flash',
    name: 'Google Gemini 2.5 Flash',
    provider: 'gemini',
    modelId: 'gemini-2.5-flash',
    isDefault: true,
    apiKeyConfigured: true,
    status: 'active',
  },
  {
    id: 'openai-gpt4o',
    name: 'OpenAI GPT-4o Mini',
    provider: 'openai',
    modelId: 'gpt-4o-mini',
    isDefault: false,
    apiKeyConfigured: false,
    status: 'configured',
  },
  {
    id: 'claude-sonnet',
    name: 'Anthropic Claude 3.5 Sonnet',
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet-20241022',
    isDefault: false,
    apiKeyConfigured: false,
    status: 'unconfigured',
  },
];

const defaultSettings: StoreSettings = {
  storeName: 'AmarShop BD Official',
  shopBaseStoreUrl: 'https://amarshop-bd.onshopbase.com',
  shopBaseApiKey: 'sb_live_demo_98439247',
  currencySymbol: '৳',
  targetMarket: 'Bangladesh (Dhaka & Nationwide COD)',
  defaultLanguage: 'both',
  autoPublishEnabled: true,
  scheduleIntervalMinutes: 30,
  socialAccounts: {
    facebookConnected: true,
    facebookPageName: 'AmarShop BD - Online Store',
    instagramConnected: true,
    instagramHandle: '@amarshop_bd',
    tiktokConnected: true,
    tiktokUsername: '@amarshop.official',
  },
};

const defaultResearch: TavilyResearchResult[] = [
  {
    id: 'res-1',
    query: 'trending eid fashion products bangladesh 2026',
    title: 'Top High-Converting Eid Festive Attire & Accessories in BD',
    url: 'https://ecommerce-insights.bd/trending-eid-2026',
    snippet: 'High demand surge observed in Semi-pure silk Panjabi, Chikankari Kurtas, and magnetic clasp leather wallets across Daraz and Facebook Commerce.',
    score: 0.96,
    category: 'Fashion & Lifestyle',
    trendingDemand: 'very_high',
    estimatedMargin: '45% - 60%',
    suggestedAction: 'Collect 10+ Panjabi SKUs, queue Facebook carousel campaigns with Cash on Delivery focus.',
  },
  {
    id: 'res-2',
    query: 'best selling wireless gadgets under 3000 taka dhaka',
    title: 'Consumer Electronics & Smart Accessories Market Pulse',
    url: 'https://techtrendsbd.com/smartwatch-earbuds-demand',
    snippet: 'AMOLED calling smartwatches with bangla fonts and ENC dual-mic wireless earbuds dominate under ৳3,500 segment with high repeat purchases.',
    score: 0.91,
    category: 'Consumer Electronics',
    trendingDemand: 'very_high',
    estimatedMargin: '35% - 50%',
    suggestedAction: 'Highlight AMOLED screen clarity in short-form TikTok & Reel video teasers.',
  },
  {
    id: 'res-3',
    query: 'organic honey and mustard oil demand bangladesh',
    title: 'Direct-from-Farm Organic Foods & Grocery eCommerce Trend',
    url: 'https://agro-commerce.bd/sundarban-honey-surge',
    snippet: 'Sundarban wild flower honey and cold-pressed mustard oil show 120% YoY growth driven by health awareness.',
    score: 0.84,
    category: 'Groceries & Health',
    trendingDemand: 'high',
    estimatedMargin: '30% - 40%',
    suggestedAction: 'Add organic purity certificate trust badge in creative captions.',
  },
];

class DatabaseService {
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
          products: parsed.products || defaultProducts,
          queue: parsed.queue || defaultQueue,
          logs: parsed.logs || defaultLogs,
          models: parsed.models || defaultModels,
          settings: parsed.settings || defaultSettings,
          research: parsed.research || defaultResearch,
        };
      }
    } catch (err) {
      console.warn('Could not read persistent DB file, using default data:', err);
    }

    const initial: AppDatabase = {
      products: defaultProducts,
      queue: defaultQueue,
      logs: defaultLogs,
      models: defaultModels,
      settings: defaultSettings,
      research: defaultResearch,
    };
    this.saveData(initial);
    return initial;
  }

  public saveData(customData?: AppDatabase): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const toWrite = customData || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(toWrite, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // Products
  public getProducts(): Product[] {
    return this.data.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find((p) => p.id === id);
  }

  public saveProduct(product: Product): Product {
    const idx = this.data.products.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      this.data.products[idx] = product;
    } else {
      this.data.products.unshift(product);
    }
    this.saveData();
    return product;
  }

  public deleteProduct(id: string): boolean {
    const lenBefore = this.data.products.length;
    this.data.products = this.data.products.filter((p) => p.id !== id);
    if (this.data.products.length !== lenBefore) {
      this.saveData();
      return true;
    }
    return false;
  }

  // Queue
  public getQueue(): PublishingQueueItem[] {
    return this.data.queue;
  }

  public addToQueue(item: PublishingQueueItem): PublishingQueueItem {
    this.data.queue.unshift(item);
    this.saveData();
    return item;
  }

  public updateQueueItem(id: string, updates: Partial<PublishingQueueItem>): PublishingQueueItem | null {
    const item = this.data.queue.find((q) => q.id === id);
    if (!item) return null;
    Object.assign(item, updates);
    this.saveData();
    return item;
  }

  public deleteQueueItem(id: string): boolean {
    const lenBefore = this.data.queue.length;
    this.data.queue = this.data.queue.filter((q) => q.id !== id);
    if (this.data.queue.length !== lenBefore) {
      this.saveData();
      return true;
    }
    return false;
  }

  // Logs
  public getLogs(): SystemLog[] {
    return this.data.logs;
  }

  public addLog(module: SystemLog['module'], level: SystemLog['level'], message: string, details?: string): SystemLog {
    const log: SystemLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      details,
    };
    this.data.logs.unshift(log);
    // Keep max 200 logs
    if (this.data.logs.length > 200) {
      this.data.logs = this.data.logs.slice(0, 200);
    }
    this.saveData();
    return log;
  }

  public clearLogs(): void {
    this.data.logs = [];
    this.saveData();
  }

  // Models
  public getModels(): AIModelConfig[] {
    return this.data.models;
  }

  public updateModel(id: string, updates: Partial<AIModelConfig>): AIModelConfig | null {
    const model = this.data.models.find((m) => m.id === id);
    if (!model) return null;
    Object.assign(model, updates);
    this.saveData();
    return model;
  }

  // Settings
  public getSettings(): StoreSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<StoreSettings>): StoreSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.saveData();
    return this.data.settings;
  }

  // Research
  public getResearch(): TavilyResearchResult[] {
    return this.data.research;
  }

  public addResearch(item: TavilyResearchResult): TavilyResearchResult {
    this.data.research.unshift(item);
    this.saveData();
    return item;
  }

  public resetToDefault(): void {
    this.data = {
      products: defaultProducts,
      queue: defaultQueue,
      logs: defaultLogs,
      models: defaultModels,
      settings: defaultSettings,
      research: defaultResearch,
    };
    this.saveData();
  }
}

export const db = new DatabaseService();
