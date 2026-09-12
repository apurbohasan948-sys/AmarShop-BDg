import fs from 'fs';
import path from 'path';
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
} from '../src/types';

interface DatabaseSchema {
  products: Product[];
  aiModels: AIModelConfig[];
  taskAssignments: TaskModelAssignments;
  tavily: TavilyConfig;
  brand: BrandSettings;
  pricing: PricingRules;
  social: SocialAccountConfig;
  queue: QueueItem[];
  automation: AutomationSettings;
  logs: ActivityLog[];
  duplicateHistory: { [key: string]: boolean }; // e.g. "prod123_facebook_facebook_post": true
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'app_data.json');

const INITIAL_MODELS: AIModelConfig[] = [
  {
    id: 'gemini-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    endpoint: '/models/gemini-2.5-flash:generateContent',
    apiKey: process.env.GEMINI_API_KEY || '',
    modelName: 'gemini-2.5-flash',
    authHeaderType: 'x-api-key',
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: 'You are an elite e-commerce marketing strategist for ShopBase BD in Bangladesh. Generate authentic, high-converting product marketing in natural conversational Bangla.',
    status: process.env.GEMINI_API_KEY ? 'online' : 'untested',
    latencyMs: 420,
    lastTestedAt: new Date().toISOString(),
    isEnabled: true,
    isDefault: true,
  },
  {
    id: 'openai-gpt4o-mini',
    name: 'OpenAI GPT-4o Mini',
    provider: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    endpoint: '/chat/completions',
    apiKey: '',
    modelName: 'gpt-4o-mini',
    authHeaderType: 'Bearer',
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: 'You are an expert social media copywriter specialized in Bangladeshi consumer behavior.',
    status: 'untested',
    isEnabled: true,
  },
  {
    id: 'groq-llama3-70b',
    name: 'Groq Llama 3.3 70B',
    provider: 'groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    endpoint: '/chat/completions',
    apiKey: '',
    modelName: 'llama-3.3-70b-versatile',
    authHeaderType: 'Bearer',
    temperature: 0.6,
    maxTokens: 2048,
    systemPrompt: 'Generate engaging short-form TikTok & Reel scripts with high retention hooks.',
    status: 'untested',
    isEnabled: true,
  },
  {
    id: 'anthropic-claude',
    name: 'Anthropic Claude 3.5 Sonnet',
    provider: 'anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    endpoint: '/messages',
    apiKey: '',
    modelName: 'claude-3-5-sonnet-20241022',
    authHeaderType: 'x-api-key',
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: 'Create detailed product reviews, buyer objection handling, and YouTube descriptions.',
    status: 'untested',
    isEnabled: false,
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat (V3)',
    provider: 'deepseek',
    baseUrl: 'https://api.deepseek.com',
    endpoint: '/chat/completions',
    apiKey: '',
    modelName: 'deepseek-chat',
    authHeaderType: 'Bearer',
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: 'Direct response copywriting for South Asian e-commerce products.',
    status: 'untested',
    isEnabled: false,
  },
  {
    id: 'custom-rest-api',
    name: 'Custom OpenAI-Compatible API',
    provider: 'custom',
    baseUrl: 'https://api.together.xyz/v1',
    endpoint: '/chat/completions',
    apiKey: '',
    modelName: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
    authHeaderType: 'Bearer',
    requestTemplate: '{"model": "{{model}}", "messages": [{"role": "system", "content": "{{systemPrompt}}"}, {"role": "user", "content": "{{prompt}}"}], "temperature": {{temperature}}, "max_tokens": {{maxTokens}}}',
    responsePath: 'choices[0].message.content',
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: 'E-commerce creative writer for video hooks and selling angles.',
    status: 'untested',
    isEnabled: false,
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'shopbase-ultrawatch-9',
    source: 'ShopBase BD',
    sourceUrl: 'https://shopbasebd.com/store/product/t900-ultra-smart-watch',
    productId: 'SB-W9-ULTRA',
    sku: 'SKU-SB-9001',
    title: 'T900 Ultra Big 2.09" Display Smartwatch with Bluetooth Calling',
    description: 'T900 Ultra is a premium smartwatch featuring a 2.09-inch HD display, continuous heart-rate & SpO2 tracking, multiple sports modes, wireless magnetic charging, and seamless Bluetooth calling for Android & iOS.',
    category: 'Smartwatches & Wearables',
    price: 950,
    originalPrice: 1550,
    profit: 250,
    sellingPrice: 1200,
    currency: 'BDT',
    features: [
      '2.09 inch Infinite HD Full Touch Screen',
      'Bluetooth Calling & Notification Sync',
      'Heart Rate, Blood Pressure & Sleep Monitor',
      'IP67 Water Resistant & Sturdy Zinc Alloy Case',
      'Wireless Magnetic Fast Charging (Up to 3-5 days standby)'
    ],
    variations: [
      { id: 'v1', name: 'Color', options: ['Orange Strap', 'Black Strap', 'Silver Starlight'] }
    ],
    images: [
      {
        id: 'img1',
        originalImageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1920&auto=format&fit=crop',
        highResolutionImageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1920&auto=format&fit=crop',
        width: 1920,
        height: 1920,
        format: 'JPEG',
        fileSize: '412 KB',
        qualityScore: 96,
        label: 'Front Product Shot',
        isSelected: true,
      },
      {
        id: 'img2',
        originalImageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1920&auto=format&fit=crop',
        highResolutionImageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1920&auto=format&fit=crop',
        width: 1920,
        height: 1440,
        format: 'JPEG',
        fileSize: '345 KB',
        qualityScore: 92,
        label: 'Lifestyle Wrist View',
        isSelected: true,
      },
      {
        id: 'img3',
        originalImageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=1920&auto=format&fit=crop',
        highResolutionImageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=1920&auto=format&fit=crop',
        width: 1920,
        height: 1280,
        format: 'JPEG',
        fileSize: '298 KB',
        qualityScore: 88,
        label: 'Packaging & Details',
        isSelected: true,
      }
    ],
    videos: [],
    availability: 'in_stock',
    sourceCollectedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    contentStatus: 'creatives_generated',
    publishingStatus: 'in_queue',
    tavilyResearch: {
      query: 'T900 Ultra Smartwatch Bangladesh price reviews and trend 2026',
      summary: 'Smartwatches with big 2.0+ inch displays and Bluetooth calling are currently trending on TikTok and Daraz in Bangladesh among college students and young professionals who want an Apple Watch Ultra aesthetic under 1,500 BDT.',
      trends: ['Budget Apple Watch Ultra lookalike', 'Cash on delivery demand in BD', 'Fast Bluetooth sync with Bangla notification support'],
      keywords: ['T900 Ultra BD price', 'best budget smartwatch 2026', 'smartwatch with bluetooth call bangladesh'],
      researchedAt: new Date().toISOString(),
    },
    aiAnalysis: {
      summary: 'একটি ট্রেন্ডি ও প্রিমিয়াম ডিজাইনের স্মার্টওয়াচ যা ব্লুটুথ কলিং এবং হেলথ ট্র্যাকিং সুবিধা নিশ্চিত করে অত্যন্ত সাশ্রয়ী দামে।',
      keySellingPoints: [
        'হাতে পরে কথা বলার দারুণ ব্লুটুথ কলিং অভিজ্ঞতা',
        'বিশাল ২.০৯ ইঞ্চি ফুল এইচডি ডিসপ্লে',
        'ক্যাশ অন ডেলিভারিতে সারাদেশে দ্রুত হোম ডেলিভারি'
      ],
      targetCustomer: 'তরুণ প্রজন্ম, শিক্ষার্থী এবং গ্যাজেট প্রেমী যারা সাশ্রয়ী মূল্যে প্রিমিয়াম লুক খুঁজছেন।',
      marketingAngle: 'স্টাইল ও প্রযুক্তির সেরা মেলবন্ধন - বাজেটের মধ্যেই আল্ট্রা প্রিমিয়াম স্মার্টওয়াচ!',
      shortHook: '১,৫০০ টাকার কমে প্রিমিয়াম আল্ট্রা স্মার্টওয়াচ খুঁজছেন? দেখুন এই অফার!',
      benefits: [
        'ফোনে হাত না দিয়েই সরাসরি কল রিসিভ ও কথা বলুন',
        'হার্ট রেট, রক্তচাপ ও স্লিপ ট্র্যাকিং দিয়ে রাখুন স্বাস্থ্যের হিসাব',
        'স্মার্ট লুক যেকোনো পোশাকে মানানসই'
      ],
      cta: 'অফারটি সীমিত সময়ের জন্য! এখনই "Shop Now" বাটনে ক্লিক করুন অথবা মেসেজ দিন।',
      keywords: ['T900 Ultra BD', 'Smart Watch Bangladesh', 'Budget Gadget BD', 'ShopBase BD'],
      hashtags: ['#T900Ultra', '#SmartWatchBD', '#GadgetBD', '#ShopBaseBD', '#Smartwatch2026'],
      modelUsed: 'gemini-2.5-flash',
      generatedAt: new Date().toISOString(),
    },
  },
  {
    id: 'shopbase-anc-earbuds-pro',
    source: 'ShopBase BD',
    sourceUrl: 'https://shopbasebd.com/store/product/m10-tws-wireless-earbuds',
    productId: 'SB-M10-TWS',
    sku: 'SKU-SB-4082',
    title: 'M10 TWS Wireless Earbuds with 2000mAh Powerbank LED Display',
    description: 'M10 TWS Bluetooth 5.3 Earbuds with heavy bass stereo sound, touch control, noise cancellation, waterproof casing, and dual 2000mAh emergency mobile powerbank charging case.',
    category: 'Audio & Earphones',
    price: 450,
    originalPrice: 850,
    profit: 200,
    sellingPrice: 650,
    currency: 'BDT',
    features: [
      'HiFi 9D Heavy Bass Sound Quality',
      '2000mAh Emergency Power Bank Charging Box',
      'Dual LED Battery Percentage Display',
      'Bluetooth 5.3 Quick Auto Pairing',
      'Touch Control (Play, Pause, Call, Volume)'
    ],
    variations: [
      { id: 'v2', name: 'Version', options: ['M10 Classic Black LED', 'M10 Pro Carbon'] }
    ],
    images: [
      {
        id: 'img4',
        originalImageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1920&auto=format&fit=crop',
        highResolutionImageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1920&auto=format&fit=crop',
        width: 1920,
        height: 1920,
        format: 'JPEG',
        fileSize: '380 KB',
        qualityScore: 95,
        label: 'Earbuds Case & Display',
        isSelected: true,
      },
      {
        id: 'img5',
        originalImageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1920&auto=format&fit=crop',
        highResolutionImageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1920&auto=format&fit=crop',
        width: 1920,
        height: 1280,
        format: 'JPEG',
        fileSize: '310 KB',
        qualityScore: 90,
        label: 'Sound & Texture Detail',
        isSelected: true,
      }
    ],
    videos: [],
    availability: 'in_stock',
    sourceCollectedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    contentStatus: 'analyzed',
    publishingStatus: 'unprocessed',
    tavilyResearch: {
      query: 'M10 TWS earbuds sound quality Bangladesh consumer review',
      summary: 'M10 is one of the highest selling wireless earphones in Bangladesh due to its double utility: powerful music sound + emergency phone charging.',
      trends: ['Budget TWS under 700 Taka', 'Gaming low latency', 'Long battery life'],
      keywords: ['M10 TWS price in BD', 'wireless earphone low price', 'bluetooth earphone bangladesh'],
      researchedAt: new Date().toISOString(),
    },
    aiAnalysis: {
      summary: 'অসম্ভব ক্লিয়ার সাউন্ড আর ৯ডি বেস সহ M10 TWS ইয়ারবাডস, যাতে রয়েছে ইমার্জেন্সি মোবাইল চার্জিং সুবিধা!',
      keySellingPoints: [
        '৯ডি সুপার হেভি বেস মিউজিক কোয়ালিটি',
        'চার্জিং কেস দিয়েই ফোন চার্জ করার ইমার্জেন্সি পাওয়ারব্যাংক',
        'এলইডি ডিসপ্লেতে দেখা যাবে চার্জের শতকরা পরিমাণ'
      ],
      targetCustomer: 'মিউজিক লাভার, বাইকার ও শিক্ষার্থী যারা বাজেটবান্ধব সেরা ইয়ারবাডস খুঁজছেন।',
      marketingAngle: 'গান শোনার পাশাপাশি ইমার্জেন্সিতে ফোন চার্জের দ্বৈত সুবিধা!',
      shortHook: 'সাশ্রয়ী দামে সেরা বেস ও পাওয়ারব্যাংক সাপোর্ট পেতে এখনই দেখুন M10 TWS!',
      benefits: [
        'তারের ঝামেলাহীন অটো কানেকশন',
        'ঘাম ও পানি প্রতিরোধী ডিজাইন',
        'এক চার্জেই দীর্ঘ সময় নিরবচ্ছিন্ন অডিও'
      ],
      cta: 'অর্ডার করতে ইনবক্স করুন অথবা ভিজিট করুন আমাদের ওয়েবসাইটে।',
      keywords: ['M10 TWS', 'Earbuds BD', 'Wireless Earphone', 'ShopBase BD'],
      hashtags: ['#M10Earbuds', '#WirelessAudio', '#GadgetsBangladesh', '#ShopBaseBD'],
      modelUsed: 'gemini-2.5-flash',
      generatedAt: new Date().toISOString(),
    }
  }
];

const INITIAL_QUEUE: QueueItem[] = [
  {
    id: 'q-fb-1',
    productId: 'shopbase-ultrawatch-9',
    productTitle: 'T900 Ultra Big 2.09" Display Smartwatch with Bluetooth Calling',
    platform: 'facebook',
    contentType: 'facebook_post',
    status: 'approved',
    scheduledTime: new Date(Date.now() + 3600 * 1000 * 2).toISOString(),
    aiModelUsed: 'gemini-2.5-flash',
    tavilyResearchUsed: true,
    content: {
      title: 'হাতে পরলেই প্রিমিয়াম লুক! T900 Ultra Smartwatch',
      caption: `🔥 হাতে পরলেই নজর কাড়বে প্রিমিয়াম লুক! নিয়ে নিন T900 Ultra Big 2.09" Display Smartwatch!

👉 কেন এই স্মার্টওয়াচটি সেরা পছন্দ?
✅ ২.০৯ ইঞ্চি ফুল এইচডি সুপার ডিসপ্লে
✅ ব্লুটুথ কলিং - ঘড়ি থেকেই কল রিসিভ ও ডায়াল করুন
✅ হার্ট রেট, ব্লাড প্রেশার ও স্লিপ ট্র্যাকিং সেন্সর
✅ পানি ও ধুলোবালি প্রতিরোধক IP67 ওয়াটার রেসিস্ট্যান্ট
✅ ওয়্যারলেস ফাস্ট ম্যাগনেটিক চার্জিং

💰 বিশেষ অফার মূল্য: মাত্র ১,২০০ টাকা! (নিয়মিত মূল্য: ১,৫৫০ টাকা)

🚚 ক্যাশ অন ডেলিভারিতে পণ্য দেখে টাকা পরিশোধ করার সুবিধা!

📩 অর্ডার করতে এখনই আপনার নাম, পূর্ণ ঠিকানা ও মোবাইল নম্বর সহ মেসেজ করুন অথবা কল করুন 01700-000000 নম্বরে।`,
      hook: '১,৫০০ টাকার কমে প্রিমিয়াম আল্ট্রা স্মার্টওয়াচ খুঁজছেন?',
      sellingPriceText: '১,২০০ টাকা',
      featuresList: ['2.09" HD Display', 'Bluetooth Calling', 'Magnetic Fast Charger'],
      cta: 'অর্ডার করতে ইনবক্স করুন এখনই!',
      hashtags: ['#T900Ultra', '#SmartWatchBD', '#GadgetBD', '#ShopBaseBD', '#ViralWatch'],
      mediaUrls: ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1920&auto=format&fit=crop'],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'q-reel-1',
    productId: 'shopbase-ultrawatch-9',
    productTitle: 'T900 Ultra Big 2.09" Display Smartwatch',
    platform: 'facebook',
    contentType: 'facebook_reel',
    status: 'draft',
    aiModelUsed: 'gemini-2.5-flash',
    content: {
      title: 'T900 Ultra 9:16 Short Video',
      caption: 'এই ঘড়িটি হাতে না দেখলে বুঝবেন না এর প্রিমিয়াম ফিনিশ! 🔥 T900 Ultra Smartwatch মাত্র ১২০০ টাকায়! #ShopBaseBD #SmartWatch',
      hook: '১০০০ টাকার বাজেটে এতো প্রিমিয়াম ফিচার কিভাবে সম্ভব?!',
      videoScript: `[Scene 1: 0-3s] Hook: "আপনি কি ১,৫০০ টাকার মধ্যে সেরা লুকিং স্মার্টওয়াচ খুঁজছেন?"
[Scene 2: 3-8s] Displaying 2.09" ultra HD screen and vibrant watch faces.
[Scene 3: 8-12s] Demonstrating Bluetooth Calling and instant clear voice test.
[Scene 4: 12-15s] CTA: "সারা বাংলাদেশে ক্যাশ অন ডেলিভারি! আজই অর্ডার কনফার্ম করতে ডেসক্রিপশনের লিংকে যান।"`,
      mediaUrls: ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1920&auto=format&fit=crop'],
      hashtags: ['#T900Ultra', '#ReelsBD', '#GadgetVlog', '#TrendingBD'],
      videoDurationSeconds: 15,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'q-tiktok-1',
    productId: 'shopbase-ultrawatch-9',
    productTitle: 'T900 Ultra Big 2.09" Display Smartwatch',
    platform: 'tiktok',
    contentType: 'tiktok_video',
    status: 'draft',
    aiModelUsed: 'groq-llama3-70b',
    content: {
      caption: 'অবিশ্বাস্য ডিসকাউন্টে T900 Ultra স্মার্টওয়াচ! ব্লুটুথ কলিং + ফুল স্ক্রিন ডিসপ্লে 🔥 #TikTokBD #GadgetsBD #ShopBase',
      hook: 'এই ঘড়িটি মিস করলে সত্যি লস করবেন!',
      videoScript: `00-03s: হ্যালো গ্যাজেট লাভার্স! এই বাজেট গ্যাজেটটি দেখলে আপনিও চমকে যাবেন!
04-09s: বিশাল ২.০৯ ইঞ্চি স্ক্রিন আর অ্যাপল ওয়াচ আল্ট্রা ভাইব!
10-15s: দেরি না করে এখনই অর্ডার করুন বায়ো লিংকে ক্লিক করে!`,
      hashtags: ['#GadgetBD', '#TikTokShopBD', '#T900Ultra', '#Smartwatch'],
      mediaUrls: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1920&auto=format&fit=crop'],
      videoDurationSeconds: 15,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadData();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure all top-level keys exist
        return {
          products: parsed.products || INITIAL_PRODUCTS,
          aiModels: parsed.aiModels || INITIAL_MODELS,
          taskAssignments: parsed.taskAssignments || {
            productAnalysis: 'gemini-flash',
            facebookCaption: 'gemini-flash',
            youtubeContent: 'gemini-flash',
            tiktokContent: 'groq-llama3-70b',
            videoScript: 'groq-llama3-70b',
            imagePrompt: 'gemini-flash',
            generalMarketing: 'gemini-flash',
            fallbackModelId: 'openai-gpt4o-mini',
            enableFallback: true,
          },
          tavily: parsed.tavily || {
            apiKey: process.env.TAVILY_API_KEY || '',
            searchDepth: 'basic',
            maxResults: 5,
            includeAnswer: true,
            status: process.env.TAVILY_API_KEY ? 'online' : 'not_configured',
          },
          brand: parsed.brand || {
            brandName: 'ShopBase BD Gadget Hub',
            logoUrl: 'https://shopbasebd.com/wp-content/uploads/2023/shopbase-logo.png',
            contactNumber: '+880 1700-000000',
            facebookPage: 'https://facebook.com/ShopBaseBD',
            website: 'https://shopbasebd.com',
            orderUrl: 'https://shopbasebd.com/store',
            defaultCta: 'অর্ডার করতে এখনই ইনবক্স করুন অথবা ওয়েবসাইটে ভিজিট করুন। সারা বাংলাদেশে ক্যাশ অন ডেলিভারি!',
            defaultProfit: 200,
            currency: 'BDT',
            language: 'Bangla',
          },
          pricing: parsed.pricing || {
            strategy: 'fixed',
            fixedProfit: 150,
            percentageProfit: 15,
            minProfit: 100,
            customFormula: 'sourcePrice + 150',
          },
          social: parsed.social || {
            facebook: {
              connected: false,
              pageName: 'ShopBase Official BD',
              pageId: '1092837465',
              status: 'not_configured',
            },
            youtube: {
              connected: false,
              channelTitle: 'ShopBase BD Tech',
              channelId: 'UC_shopbasebd_tech',
              status: 'not_configured',
            },
            tiktok: {
              connected: false,
              accountName: '@shopbase.bd',
              status: 'not_configured',
              permissionsNotice: 'Requires TikTok Content Posting API permissions.',
            },
          },
          queue: parsed.queue || INITIAL_QUEUE,
          automation: parsed.automation || {
            autoCollect: false,
            autoGenerate: false,
            autoPost: false,
            intervalHours: 6,
            testMode: true, // Safe mode default
            categoryFilters: ['Smartwatches & Wearables', 'Audio & Earphones', 'Accessories'],
            minQualityScore: 80,
            lastRunAt: new Date().toISOString(),
            nextRunAt: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
          },
          logs: parsed.logs || [
            {
              id: 'log-init',
              timestamp: new Date().toISOString(),
              level: 'info',
              service: 'Database',
              message: 'ShopBase BD Automation Database Initialized with persistent storage.',
            }
          ],
          duplicateHistory: parsed.duplicateHistory || {
            'shopbase-ultrawatch-9_facebook_facebook_post': true,
          }
        };
      }
    } catch (err) {
      console.error('Error loading DB, using defaults', err);
    }

    const defaultState: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      aiModels: INITIAL_MODELS,
      taskAssignments: {
        productAnalysis: 'gemini-flash',
        facebookCaption: 'gemini-flash',
        youtubeContent: 'gemini-flash',
        tiktokContent: 'groq-llama3-70b',
        videoScript: 'groq-llama3-70b',
        imagePrompt: 'gemini-flash',
        generalMarketing: 'gemini-flash',
        fallbackModelId: 'openai-gpt4o-mini',
        enableFallback: true,
      },
      tavily: {
        apiKey: process.env.TAVILY_API_KEY || '',
        searchDepth: 'basic',
        maxResults: 5,
        includeAnswer: true,
        status: process.env.TAVILY_API_KEY ? 'online' : 'not_configured',
      },
      brand: {
        brandName: 'ShopBase BD Gadget Hub',
        logoUrl: 'https://shopbasebd.com/wp-content/uploads/2023/shopbase-logo.png',
        contactNumber: '+880 1700-000000',
        facebookPage: 'https://facebook.com/ShopBaseBD',
        website: 'https://shopbasebd.com',
        orderUrl: 'https://shopbasebd.com/store',
        defaultCta: 'অর্ডার করতে এখনই ইনবক্স করুন অথবা ওয়েবসাইটে ভিজিট করুন। সারা বাংলাদেশে ক্যাশ অন ডেলিভারি!',
        defaultProfit: 200,
        currency: 'BDT',
        language: 'Bangla',
      },
      pricing: {
        strategy: 'fixed',
        fixedProfit: 150,
        percentageProfit: 15,
        minProfit: 100,
        customFormula: 'sourcePrice + 150',
      },
      social: {
        facebook: {
          connected: false,
          pageName: 'ShopBase Official BD',
          pageId: '1092837465',
          status: 'not_configured',
        },
        youtube: {
          connected: false,
          channelTitle: 'ShopBase BD Tech',
          channelId: 'UC_shopbasebd_tech',
          status: 'not_configured',
        },
        tiktok: {
          connected: false,
          accountName: '@shopbase.bd',
          status: 'not_configured',
          permissionsNotice: 'Requires TikTok Content Posting API permissions.',
        },
      },
      queue: INITIAL_QUEUE,
      automation: {
        autoCollect: false,
        autoGenerate: false,
        autoPost: false,
        intervalHours: 6,
        testMode: true,
        categoryFilters: ['Smartwatches & Wearables', 'Audio & Earphones'],
        minQualityScore: 80,
        lastRunAt: new Date().toISOString(),
        nextRunAt: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
      },
      logs: [
        {
          id: 'log-init',
          timestamp: new Date().toISOString(),
          level: 'info',
          service: 'Database',
          message: 'ShopBase BD Automation Database Initialized with persistent storage.',
        }
      ],
      duplicateHistory: {
        'shopbase-ultrawatch-9_facebook_facebook_post': true,
      }
    };

    this.saveDataDirect(defaultState);
    return defaultState;
  }

  private saveData() {
    this.saveDataDirect(this.data);
  }

  private saveDataDirect(data: DatabaseSchema) {
    try {
      this.ensureDirectory();
      const tmp = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmp, DB_FILE);
    } catch (err) {
      console.error('Failed to write database file', err);
    }
  }

  // --- PRODUCTS ---
  public getProducts(): Product[] {
    return this.data.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id || p.productId === id);
  }

  public saveProduct(product: Product): { product: Product; isDuplicate: boolean } {
    // Check duplicates by sourceUrl, productId, or SKU
    const existingIndex = this.data.products.findIndex(
      p => (p.sourceUrl && p.sourceUrl === product.sourceUrl) ||
           (p.productId && p.productId === product.productId) ||
           (p.sku && product.sku && p.sku === product.sku) ||
           p.id === product.id
    );

    if (existingIndex >= 0) {
      this.data.products[existingIndex] = {
        ...this.data.products[existingIndex],
        ...product,
        updatedAt: new Date().toISOString(),
      };
      this.saveData();
      return { product: this.data.products[existingIndex], isDuplicate: true };
    } else {
      this.data.products.unshift(product);
      this.saveData();
      this.addLog('info', 'Collector', `New product saved: ${product.title} (${product.price} BDT)`);
      return { product, isDuplicate: false };
    }
  }

  public deleteProduct(id: string): boolean {
    const prevLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== prevLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- AI MODELS ---
  public getModels(): AIModelConfig[] {
    return this.data.aiModels;
  }

  public getModelById(id: string): AIModelConfig | undefined {
    return this.data.aiModels.find(m => m.id === id);
  }

  public saveModel(model: AIModelConfig): AIModelConfig {
    const idx = this.data.aiModels.findIndex(m => m.id === model.id);
    if (idx >= 0) {
      this.data.aiModels[idx] = model;
    } else {
      this.data.aiModels.push(model);
    }
    this.saveData();
    return model;
  }

  public deleteModel(id: string): boolean {
    this.data.aiModels = this.data.aiModels.filter(m => m.id !== id);
    this.saveData();
    return true;
  }

  public getTaskAssignments(): TaskModelAssignments {
    return this.data.taskAssignments;
  }

  public saveTaskAssignments(assignments: TaskModelAssignments) {
    this.data.taskAssignments = assignments;
    this.saveData();
    return this.data.taskAssignments;
  }

  // --- TAVILY ---
  public getTavilyConfig(): TavilyConfig {
    return this.data.tavily;
  }

  public saveTavilyConfig(config: Partial<TavilyConfig>) {
    this.data.tavily = { ...this.data.tavily, ...config };
    this.saveData();
    return this.data.tavily;
  }

  // --- BRAND & PRICING ---
  public getBrandSettings(): BrandSettings {
    return this.data.brand;
  }

  public saveBrandSettings(brand: Partial<BrandSettings>) {
    this.data.brand = { ...this.data.brand, ...brand };
    this.saveData();
    return this.data.brand;
  }

  public getPricingRules(): PricingRules {
    return this.data.pricing;
  }

  public savePricingRules(pricing: Partial<PricingRules>) {
    this.data.pricing = { ...this.data.pricing, ...pricing };
    this.saveData();
    return this.data.pricing;
  }

  // Calculate selling price according to rules
  public calculateSellingPrice(sourcePrice: number): { profit: number; sellingPrice: number } {
    const rules = this.data.pricing;
    let profit = rules.fixedProfit;

    if (rules.strategy === 'percentage') {
      profit = Math.round((sourcePrice * rules.percentageProfit) / 100);
      if (profit < rules.minProfit) profit = rules.minProfit;
    } else if (rules.strategy === 'custom' && rules.customFormula) {
      try {
        // Safe evaluation of simple math formula
        const sanitized = rules.customFormula.replace(/sourcePrice/g, String(sourcePrice));
        if (/^[0-9+\-*/().\s]+$/.test(sanitized)) {
          const evalVal = Function(`"use strict"; return (${sanitized});`)();
          if (typeof evalVal === 'number' && !isNaN(evalVal)) {
            const calculatedSelling = Math.round(evalVal);
            profit = Math.max(rules.minProfit, calculatedSelling - sourcePrice);
          }
        }
      } catch {
        profit = rules.fixedProfit;
      }
    }

    return {
      profit,
      sellingPrice: sourcePrice + profit,
    };
  }

  // --- SOCIAL ACCOUNTS ---
  public getSocialConfig(): SocialAccountConfig {
    return this.data.social;
  }

  public saveSocialConfig(config: Partial<SocialAccountConfig>) {
    this.data.social = { ...this.data.social, ...config };
    this.saveData();
    return this.data.social;
  }

  // --- QUEUE ---
  public getQueue(): QueueItem[] {
    return this.data.queue;
  }

  public addToQueue(item: QueueItem): QueueItem {
    const idx = this.data.queue.findIndex(q => q.id === item.id);
    if (idx >= 0) {
      this.data.queue[idx] = item;
    } else {
      this.data.queue.unshift(item);
    }
    this.saveData();
    return item;
  }

  public updateQueueItem(id: string, updates: Partial<QueueItem>): QueueItem | null {
    const item = this.data.queue.find(q => q.id === id);
    if (!item) return null;
    Object.assign(item, updates, { updatedAt: new Date().toISOString() });
    this.saveData();
    return item;
  }

  public deleteQueueItem(id: string): boolean {
    const prev = this.data.queue.length;
    this.data.queue = this.data.queue.filter(q => q.id !== id);
    if (this.data.queue.length !== prev) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- DUPLICATE PROTECTION ---
  public isAlreadyPublished(productId: string, platform: string, contentType: string): boolean {
    const key = `${productId}_${platform}_${contentType}`;
    return !!this.data.duplicateHistory[key];
  }

  public markAsPublished(productId: string, platform: string, contentType: string) {
    const key = `${productId}_${platform}_${contentType}`;
    this.data.duplicateHistory[key] = true;
    this.saveData();
  }

  // --- AUTOMATION SETTINGS ---
  public getAutomationSettings(): AutomationSettings {
    return this.data.automation;
  }

  public saveAutomationSettings(settings: Partial<AutomationSettings>) {
    this.data.automation = { ...this.data.automation, ...settings };
    this.saveData();
    return this.data.automation;
  }

  // --- LOGS ---
  public getLogs(limit = 100): ActivityLog[] {
    return this.data.logs.slice(0, limit);
  }

  public addLog(level: 'info' | 'warn' | 'error' | 'success', service: ActivityLog['service'], message: string, details?: Record<string, any>) {
    const log: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      level,
      service,
      message,
      details,
    };
    this.data.logs.unshift(log);
    if (this.data.logs.length > 300) {
      this.data.logs = this.data.logs.slice(0, 300);
    }
    this.saveData();
    return log;
  }

  public clearLogs() {
    this.data.logs = [];
    this.saveData();
    return true;
  }
}

export const db = new DatabaseService();
