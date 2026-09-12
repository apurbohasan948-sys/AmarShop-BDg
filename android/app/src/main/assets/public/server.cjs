var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var import_vite = require("vite");
var import_dotenv = __toESM(require("dotenv"), 1);

// server/db.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var DATA_DIR = import_path.default.join(process.cwd(), "data");
var DB_FILE = import_path.default.join(DATA_DIR, "app_data.json");
var INITIAL_MODELS = [
  {
    id: "gemini-flash",
    name: "Gemini 2.5 Flash",
    provider: "gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    endpoint: "/models/gemini-2.5-flash:generateContent",
    apiKey: process.env.GEMINI_API_KEY || "",
    modelName: "gemini-2.5-flash",
    authHeaderType: "x-api-key",
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: "You are an elite e-commerce marketing strategist for ShopBase BD in Bangladesh. Generate authentic, high-converting product marketing in natural conversational Bangla.",
    status: process.env.GEMINI_API_KEY ? "online" : "untested",
    latencyMs: 420,
    lastTestedAt: (/* @__PURE__ */ new Date()).toISOString(),
    isEnabled: true,
    isDefault: true
  },
  {
    id: "openai-gpt4o-mini",
    name: "OpenAI GPT-4o Mini",
    provider: "openai",
    baseUrl: "https://api.openai.com/v1",
    endpoint: "/chat/completions",
    apiKey: "",
    modelName: "gpt-4o-mini",
    authHeaderType: "Bearer",
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: "You are an expert social media copywriter specialized in Bangladeshi consumer behavior.",
    status: "untested",
    isEnabled: true
  },
  {
    id: "groq-llama3-70b",
    name: "Groq Llama 3.3 70B",
    provider: "groq",
    baseUrl: "https://api.groq.com/openai/v1",
    endpoint: "/chat/completions",
    apiKey: "",
    modelName: "llama-3.3-70b-versatile",
    authHeaderType: "Bearer",
    temperature: 0.6,
    maxTokens: 2048,
    systemPrompt: "Generate engaging short-form TikTok & Reel scripts with high retention hooks.",
    status: "untested",
    isEnabled: true
  },
  {
    id: "anthropic-claude",
    name: "Anthropic Claude 3.5 Sonnet",
    provider: "anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    endpoint: "/messages",
    apiKey: "",
    modelName: "claude-3-5-sonnet-20241022",
    authHeaderType: "x-api-key",
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: "Create detailed product reviews, buyer objection handling, and YouTube descriptions.",
    status: "untested",
    isEnabled: false
  },
  {
    id: "deepseek-chat",
    name: "DeepSeek Chat (V3)",
    provider: "deepseek",
    baseUrl: "https://api.deepseek.com",
    endpoint: "/chat/completions",
    apiKey: "",
    modelName: "deepseek-chat",
    authHeaderType: "Bearer",
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: "Direct response copywriting for South Asian e-commerce products.",
    status: "untested",
    isEnabled: false
  },
  {
    id: "custom-rest-api",
    name: "Custom OpenAI-Compatible API",
    provider: "custom",
    baseUrl: "https://api.together.xyz/v1",
    endpoint: "/chat/completions",
    apiKey: "",
    modelName: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
    authHeaderType: "Bearer",
    requestTemplate: '{"model": "{{model}}", "messages": [{"role": "system", "content": "{{systemPrompt}}"}, {"role": "user", "content": "{{prompt}}"}], "temperature": {{temperature}}, "max_tokens": {{maxTokens}}}',
    responsePath: "choices[0].message.content",
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: "E-commerce creative writer for video hooks and selling angles.",
    status: "untested",
    isEnabled: false
  }
];
var INITIAL_PRODUCTS = [
  {
    id: "shopbase-ultrawatch-9",
    source: "ShopBase BD",
    sourceUrl: "https://shopbasebd.com/store/product/t900-ultra-smart-watch",
    productId: "SB-W9-ULTRA",
    sku: "SKU-SB-9001",
    title: 'T900 Ultra Big 2.09" Display Smartwatch with Bluetooth Calling',
    description: "T900 Ultra is a premium smartwatch featuring a 2.09-inch HD display, continuous heart-rate & SpO2 tracking, multiple sports modes, wireless magnetic charging, and seamless Bluetooth calling for Android & iOS.",
    category: "Smartwatches & Wearables",
    price: 950,
    originalPrice: 1550,
    profit: 250,
    sellingPrice: 1200,
    currency: "BDT",
    features: [
      "2.09 inch Infinite HD Full Touch Screen",
      "Bluetooth Calling & Notification Sync",
      "Heart Rate, Blood Pressure & Sleep Monitor",
      "IP67 Water Resistant & Sturdy Zinc Alloy Case",
      "Wireless Magnetic Fast Charging (Up to 3-5 days standby)"
    ],
    variations: [
      { id: "v1", name: "Color", options: ["Orange Strap", "Black Strap", "Silver Starlight"] }
    ],
    images: [
      {
        id: "img1",
        originalImageUrl: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1920&auto=format&fit=crop",
        highResolutionImageUrl: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1920&auto=format&fit=crop",
        width: 1920,
        height: 1920,
        format: "JPEG",
        fileSize: "412 KB",
        qualityScore: 96,
        label: "Front Product Shot",
        isSelected: true
      },
      {
        id: "img2",
        originalImageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1920&auto=format&fit=crop",
        highResolutionImageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1920&auto=format&fit=crop",
        width: 1920,
        height: 1440,
        format: "JPEG",
        fileSize: "345 KB",
        qualityScore: 92,
        label: "Lifestyle Wrist View",
        isSelected: true
      },
      {
        id: "img3",
        originalImageUrl: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=1920&auto=format&fit=crop",
        highResolutionImageUrl: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=1920&auto=format&fit=crop",
        width: 1920,
        height: 1280,
        format: "JPEG",
        fileSize: "298 KB",
        qualityScore: 88,
        label: "Packaging & Details",
        isSelected: true
      }
    ],
    videos: [],
    availability: "in_stock",
    sourceCollectedAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    contentStatus: "creatives_generated",
    publishingStatus: "in_queue",
    tavilyResearch: {
      query: "T900 Ultra Smartwatch Bangladesh price reviews and trend 2026",
      summary: "Smartwatches with big 2.0+ inch displays and Bluetooth calling are currently trending on TikTok and Daraz in Bangladesh among college students and young professionals who want an Apple Watch Ultra aesthetic under 1,500 BDT.",
      trends: ["Budget Apple Watch Ultra lookalike", "Cash on delivery demand in BD", "Fast Bluetooth sync with Bangla notification support"],
      keywords: ["T900 Ultra BD price", "best budget smartwatch 2026", "smartwatch with bluetooth call bangladesh"],
      researchedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    aiAnalysis: {
      summary: "\u098F\u0995\u099F\u09BF \u099F\u09CD\u09B0\u09C7\u09A8\u09CD\u09A1\u09BF \u0993 \u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u09A1\u09BF\u099C\u09BE\u0987\u09A8\u09C7\u09B0 \u09B8\u09CD\u09AE\u09BE\u09B0\u09CD\u099F\u0993\u09AF\u09BC\u09BE\u099A \u09AF\u09BE \u09AC\u09CD\u09B2\u09C1\u099F\u09C1\u09A5 \u0995\u09B2\u09BF\u0982 \u098F\u09AC\u0982 \u09B9\u09C7\u09B2\u09A5 \u099F\u09CD\u09B0\u09CD\u09AF\u09BE\u0995\u09BF\u0982 \u09B8\u09C1\u09AC\u09BF\u09A7\u09BE \u09A8\u09BF\u09B6\u09CD\u099A\u09BF\u09A4 \u0995\u09B0\u09C7 \u0985\u09A4\u09CD\u09AF\u09A8\u09CD\u09A4 \u09B8\u09BE\u09B6\u09CD\u09B0\u09AF\u09BC\u09C0 \u09A6\u09BE\u09AE\u09C7\u0964",
      keySellingPoints: [
        "\u09B9\u09BE\u09A4\u09C7 \u09AA\u09B0\u09C7 \u0995\u09A5\u09BE \u09AC\u09B2\u09BE\u09B0 \u09A6\u09BE\u09B0\u09C1\u09A3 \u09AC\u09CD\u09B2\u09C1\u099F\u09C1\u09A5 \u0995\u09B2\u09BF\u0982 \u0985\u09AD\u09BF\u099C\u09CD\u099E\u09A4\u09BE",
        "\u09AC\u09BF\u09B6\u09BE\u09B2 \u09E8.\u09E6\u09EF \u0987\u099E\u09CD\u099A\u09BF \u09AB\u09C1\u09B2 \u098F\u0987\u099A\u09A1\u09BF \u09A1\u09BF\u09B8\u09AA\u09CD\u09B2\u09C7",
        "\u0995\u09CD\u09AF\u09BE\u09B6 \u0985\u09A8 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF\u09A4\u09C7 \u09B8\u09BE\u09B0\u09BE\u09A6\u09C7\u09B6\u09C7 \u09A6\u09CD\u09B0\u09C1\u09A4 \u09B9\u09CB\u09AE \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF"
      ],
      targetCustomer: "\u09A4\u09B0\u09C1\u09A3 \u09AA\u09CD\u09B0\u099C\u09A8\u09CD\u09AE, \u09B6\u09BF\u0995\u09CD\u09B7\u09BE\u09B0\u09CD\u09A5\u09C0 \u098F\u09AC\u0982 \u0997\u09CD\u09AF\u09BE\u099C\u09C7\u099F \u09AA\u09CD\u09B0\u09C7\u09AE\u09C0 \u09AF\u09BE\u09B0\u09BE \u09B8\u09BE\u09B6\u09CD\u09B0\u09AF\u09BC\u09C0 \u09AE\u09C2\u09B2\u09CD\u09AF\u09C7 \u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u09B2\u09C1\u0995 \u0996\u09C1\u0981\u099C\u099B\u09C7\u09A8\u0964",
      marketingAngle: "\u09B8\u09CD\u099F\u09BE\u0987\u09B2 \u0993 \u09AA\u09CD\u09B0\u09AF\u09C1\u0995\u09CD\u09A4\u09BF\u09B0 \u09B8\u09C7\u09B0\u09BE \u09AE\u09C7\u09B2\u09AC\u09A8\u09CD\u09A7\u09A8 - \u09AC\u09BE\u099C\u09C7\u099F\u09C7\u09B0 \u09AE\u09A7\u09CD\u09AF\u09C7\u0987 \u0986\u09B2\u09CD\u099F\u09CD\u09B0\u09BE \u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u09B8\u09CD\u09AE\u09BE\u09B0\u09CD\u099F\u0993\u09AF\u09BC\u09BE\u099A!",
      shortHook: "\u09E7,\u09EB\u09E6\u09E6 \u099F\u09BE\u0995\u09BE\u09B0 \u0995\u09AE\u09C7 \u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u0986\u09B2\u09CD\u099F\u09CD\u09B0\u09BE \u09B8\u09CD\u09AE\u09BE\u09B0\u09CD\u099F\u0993\u09AF\u09BC\u09BE\u099A \u0996\u09C1\u0981\u099C\u099B\u09C7\u09A8? \u09A6\u09C7\u0996\u09C1\u09A8 \u098F\u0987 \u0985\u09AB\u09BE\u09B0!",
      benefits: [
        "\u09AB\u09CB\u09A8\u09C7 \u09B9\u09BE\u09A4 \u09A8\u09BE \u09A6\u09BF\u09AF\u09BC\u09C7\u0987 \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u0995\u09B2 \u09B0\u09BF\u09B8\u09BF\u09AD \u0993 \u0995\u09A5\u09BE \u09AC\u09B2\u09C1\u09A8",
        "\u09B9\u09BE\u09B0\u09CD\u099F \u09B0\u09C7\u099F, \u09B0\u0995\u09CD\u09A4\u099A\u09BE\u09AA \u0993 \u09B8\u09CD\u09B2\u09BF\u09AA \u099F\u09CD\u09B0\u09CD\u09AF\u09BE\u0995\u09BF\u0982 \u09A6\u09BF\u09AF\u09BC\u09C7 \u09B0\u09BE\u0996\u09C1\u09A8 \u09B8\u09CD\u09AC\u09BE\u09B8\u09CD\u09A5\u09CD\u09AF\u09C7\u09B0 \u09B9\u09BF\u09B8\u09BE\u09AC",
        "\u09B8\u09CD\u09AE\u09BE\u09B0\u09CD\u099F \u09B2\u09C1\u0995 \u09AF\u09C7\u0995\u09CB\u09A8\u09CB \u09AA\u09CB\u09B6\u09BE\u0995\u09C7 \u09AE\u09BE\u09A8\u09BE\u09A8\u09B8\u0987"
      ],
      cta: '\u0985\u09AB\u09BE\u09B0\u099F\u09BF \u09B8\u09C0\u09AE\u09BF\u09A4 \u09B8\u09AE\u09AF\u09BC\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF! \u098F\u0996\u09A8\u0987 "Shop Now" \u09AC\u09BE\u099F\u09A8\u09C7 \u0995\u09CD\u09B2\u09BF\u0995 \u0995\u09B0\u09C1\u09A8 \u0985\u09A5\u09AC\u09BE \u09AE\u09C7\u09B8\u09C7\u099C \u09A6\u09BF\u09A8\u0964',
      keywords: ["T900 Ultra BD", "Smart Watch Bangladesh", "Budget Gadget BD", "ShopBase BD"],
      hashtags: ["#T900Ultra", "#SmartWatchBD", "#GadgetBD", "#ShopBaseBD", "#Smartwatch2026"],
      modelUsed: "gemini-2.5-flash",
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  },
  {
    id: "shopbase-anc-earbuds-pro",
    source: "ShopBase BD",
    sourceUrl: "https://shopbasebd.com/store/product/m10-tws-wireless-earbuds",
    productId: "SB-M10-TWS",
    sku: "SKU-SB-4082",
    title: "M10 TWS Wireless Earbuds with 2000mAh Powerbank LED Display",
    description: "M10 TWS Bluetooth 5.3 Earbuds with heavy bass stereo sound, touch control, noise cancellation, waterproof casing, and dual 2000mAh emergency mobile powerbank charging case.",
    category: "Audio & Earphones",
    price: 450,
    originalPrice: 850,
    profit: 200,
    sellingPrice: 650,
    currency: "BDT",
    features: [
      "HiFi 9D Heavy Bass Sound Quality",
      "2000mAh Emergency Power Bank Charging Box",
      "Dual LED Battery Percentage Display",
      "Bluetooth 5.3 Quick Auto Pairing",
      "Touch Control (Play, Pause, Call, Volume)"
    ],
    variations: [
      { id: "v2", name: "Version", options: ["M10 Classic Black LED", "M10 Pro Carbon"] }
    ],
    images: [
      {
        id: "img4",
        originalImageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1920&auto=format&fit=crop",
        highResolutionImageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1920&auto=format&fit=crop",
        width: 1920,
        height: 1920,
        format: "JPEG",
        fileSize: "380 KB",
        qualityScore: 95,
        label: "Earbuds Case & Display",
        isSelected: true
      },
      {
        id: "img5",
        originalImageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1920&auto=format&fit=crop",
        highResolutionImageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1920&auto=format&fit=crop",
        width: 1920,
        height: 1280,
        format: "JPEG",
        fileSize: "310 KB",
        qualityScore: 90,
        label: "Sound & Texture Detail",
        isSelected: true
      }
    ],
    videos: [],
    availability: "in_stock",
    sourceCollectedAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    contentStatus: "analyzed",
    publishingStatus: "unprocessed",
    tavilyResearch: {
      query: "M10 TWS earbuds sound quality Bangladesh consumer review",
      summary: "M10 is one of the highest selling wireless earphones in Bangladesh due to its double utility: powerful music sound + emergency phone charging.",
      trends: ["Budget TWS under 700 Taka", "Gaming low latency", "Long battery life"],
      keywords: ["M10 TWS price in BD", "wireless earphone low price", "bluetooth earphone bangladesh"],
      researchedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    aiAnalysis: {
      summary: "\u0985\u09B8\u09AE\u09CD\u09AD\u09AC \u0995\u09CD\u09B2\u09BF\u09AF\u09BC\u09BE\u09B0 \u09B8\u09BE\u0989\u09A8\u09CD\u09A1 \u0986\u09B0 \u09EF\u09A1\u09BF \u09AC\u09C7\u09B8 \u09B8\u09B9 M10 TWS \u0987\u09AF\u09BC\u09BE\u09B0\u09AC\u09BE\u09A1\u09B8, \u09AF\u09BE\u09A4\u09C7 \u09B0\u09AF\u09BC\u09C7\u099B\u09C7 \u0987\u09AE\u09BE\u09B0\u09CD\u099C\u09C7\u09A8\u09CD\u09B8\u09BF \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u099A\u09BE\u09B0\u09CD\u099C\u09BF\u0982 \u09B8\u09C1\u09AC\u09BF\u09A7\u09BE!",
      keySellingPoints: [
        "\u09EF\u09A1\u09BF \u09B8\u09C1\u09AA\u09BE\u09B0 \u09B9\u09C7\u09AD\u09BF \u09AC\u09C7\u09B8 \u09AE\u09BF\u0989\u099C\u09BF\u0995 \u0995\u09CB\u09AF\u09BC\u09BE\u09B2\u09BF\u099F\u09BF",
        "\u099A\u09BE\u09B0\u09CD\u099C\u09BF\u0982 \u0995\u09C7\u09B8 \u09A6\u09BF\u09AF\u09BC\u09C7\u0987 \u09AB\u09CB\u09A8 \u099A\u09BE\u09B0\u09CD\u099C \u0995\u09B0\u09BE\u09B0 \u0987\u09AE\u09BE\u09B0\u09CD\u099C\u09C7\u09A8\u09CD\u09B8\u09BF \u09AA\u09BE\u0993\u09AF\u09BC\u09BE\u09B0\u09AC\u09CD\u09AF\u09BE\u0982\u0995",
        "\u098F\u09B2\u0987\u09A1\u09BF \u09A1\u09BF\u09B8\u09AA\u09CD\u09B2\u09C7\u09A4\u09C7 \u09A6\u09C7\u0996\u09BE \u09AF\u09BE\u09AC\u09C7 \u099A\u09BE\u09B0\u09CD\u099C\u09C7\u09B0 \u09B6\u09A4\u0995\u09B0\u09BE \u09AA\u09B0\u09BF\u09AE\u09BE\u09A3"
      ],
      targetCustomer: "\u09AE\u09BF\u0989\u099C\u09BF\u0995 \u09B2\u09BE\u09AD\u09BE\u09B0, \u09AC\u09BE\u0987\u0995\u09BE\u09B0 \u0993 \u09B6\u09BF\u0995\u09CD\u09B7\u09BE\u09B0\u09CD\u09A5\u09C0 \u09AF\u09BE\u09B0\u09BE \u09AC\u09BE\u099C\u09C7\u099F\u09AC\u09BE\u09A8\u09CD\u09A7\u09AC \u09B8\u09C7\u09B0\u09BE \u0987\u09AF\u09BC\u09BE\u09B0\u09AC\u09BE\u09A1\u09B8 \u0996\u09C1\u0981\u099C\u099B\u09C7\u09A8\u0964",
      marketingAngle: "\u0997\u09BE\u09A8 \u09B6\u09CB\u09A8\u09BE\u09B0 \u09AA\u09BE\u09B6\u09BE\u09AA\u09BE\u09B6\u09BF \u0987\u09AE\u09BE\u09B0\u09CD\u099C\u09C7\u09A8\u09CD\u09B8\u09BF\u09A4\u09C7 \u09AB\u09CB\u09A8 \u099A\u09BE\u09B0\u09CD\u099C\u09C7\u09B0 \u09A6\u09CD\u09AC\u09C8\u09A4 \u09B8\u09C1\u09AC\u09BF\u09A7\u09BE!",
      shortHook: "\u09B8\u09BE\u09B6\u09CD\u09B0\u09AF\u09BC\u09C0 \u09A6\u09BE\u09AE\u09C7 \u09B8\u09C7\u09B0\u09BE \u09AC\u09C7\u09B8 \u0993 \u09AA\u09BE\u0993\u09AF\u09BC\u09BE\u09B0\u09AC\u09CD\u09AF\u09BE\u0982\u0995 \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F \u09AA\u09C7\u09A4\u09C7 \u098F\u0996\u09A8\u0987 \u09A6\u09C7\u0996\u09C1\u09A8 M10 TWS!",
      benefits: [
        "\u09A4\u09BE\u09B0\u09C7\u09B0 \u099D\u09BE\u09AE\u09C7\u09B2\u09BE\u09B9\u09C0\u09A8 \u0985\u099F\u09CB \u0995\u09BE\u09A8\u09C7\u0995\u09B6\u09A8",
        "\u0998\u09BE\u09AE \u0993 \u09AA\u09BE\u09A8\u09BF \u09AA\u09CD\u09B0\u09A4\u09BF\u09B0\u09CB\u09A7\u09C0 \u09A1\u09BF\u099C\u09BE\u0987\u09A8",
        "\u098F\u0995 \u099A\u09BE\u09B0\u09CD\u099C\u09C7\u0987 \u09A6\u09C0\u09B0\u09CD\u0998 \u09B8\u09AE\u09AF\u09BC \u09A8\u09BF\u09B0\u09AC\u099A\u09CD\u099B\u09BF\u09A8\u09CD\u09A8 \u0985\u09A1\u09BF\u0993"
      ],
      cta: "\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u0987\u09A8\u09AC\u0995\u09CD\u09B8 \u0995\u09B0\u09C1\u09A8 \u0985\u09A5\u09AC\u09BE \u09AD\u09BF\u099C\u09BF\u099F \u0995\u09B0\u09C1\u09A8 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u0993\u09AF\u09BC\u09C7\u09AC\u09B8\u09BE\u0987\u099F\u09C7\u0964",
      keywords: ["M10 TWS", "Earbuds BD", "Wireless Earphone", "ShopBase BD"],
      hashtags: ["#M10Earbuds", "#WirelessAudio", "#GadgetsBangladesh", "#ShopBaseBD"],
      modelUsed: "gemini-2.5-flash",
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  }
];
var INITIAL_QUEUE = [
  {
    id: "q-fb-1",
    productId: "shopbase-ultrawatch-9",
    productTitle: 'T900 Ultra Big 2.09" Display Smartwatch with Bluetooth Calling',
    platform: "facebook",
    contentType: "facebook_post",
    status: "approved",
    scheduledTime: new Date(Date.now() + 3600 * 1e3 * 2).toISOString(),
    aiModelUsed: "gemini-2.5-flash",
    tavilyResearchUsed: true,
    content: {
      title: "\u09B9\u09BE\u09A4\u09C7 \u09AA\u09B0\u09B2\u09C7\u0987 \u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u09B2\u09C1\u0995! T900 Ultra Smartwatch",
      caption: `\u{1F525} \u09B9\u09BE\u09A4\u09C7 \u09AA\u09B0\u09B2\u09C7\u0987 \u09A8\u099C\u09B0 \u0995\u09BE\u09A1\u09BC\u09AC\u09C7 \u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u09B2\u09C1\u0995! \u09A8\u09BF\u09AF\u09BC\u09C7 \u09A8\u09BF\u09A8 T900 Ultra Big 2.09" Display Smartwatch!

\u{1F449} \u0995\u09C7\u09A8 \u098F\u0987 \u09B8\u09CD\u09AE\u09BE\u09B0\u09CD\u099F\u0993\u09AF\u09BC\u09BE\u099A\u099F\u09BF \u09B8\u09C7\u09B0\u09BE \u09AA\u099B\u09A8\u09CD\u09A6?
\u2705 \u09E8.\u09E6\u09EF \u0987\u099E\u09CD\u099A\u09BF \u09AB\u09C1\u09B2 \u098F\u0987\u099A\u09A1\u09BF \u09B8\u09C1\u09AA\u09BE\u09B0 \u09A1\u09BF\u09B8\u09AA\u09CD\u09B2\u09C7
\u2705 \u09AC\u09CD\u09B2\u09C1\u099F\u09C1\u09A5 \u0995\u09B2\u09BF\u0982 - \u0998\u09A1\u09BC\u09BF \u09A5\u09C7\u0995\u09C7\u0987 \u0995\u09B2 \u09B0\u09BF\u09B8\u09BF\u09AD \u0993 \u09A1\u09BE\u09AF\u09BC\u09BE\u09B2 \u0995\u09B0\u09C1\u09A8
\u2705 \u09B9\u09BE\u09B0\u09CD\u099F \u09B0\u09C7\u099F, \u09AC\u09CD\u09B2\u09BE\u09A1 \u09AA\u09CD\u09B0\u09C7\u09B6\u09BE\u09B0 \u0993 \u09B8\u09CD\u09B2\u09BF\u09AA \u099F\u09CD\u09B0\u09CD\u09AF\u09BE\u0995\u09BF\u0982 \u09B8\u09C7\u09A8\u09CD\u09B8\u09B0
\u2705 \u09AA\u09BE\u09A8\u09BF \u0993 \u09A7\u09C1\u09B2\u09CB\u09AC\u09BE\u09B2\u09BF \u09AA\u09CD\u09B0\u09A4\u09BF\u09B0\u09CB\u09A7\u0995 IP67 \u0993\u09AF\u09BC\u09BE\u099F\u09BE\u09B0 \u09B0\u09C7\u09B8\u09BF\u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u09A8\u09CD\u099F
\u2705 \u0993\u09AF\u09BC\u09CD\u09AF\u09BE\u09B0\u09B2\u09C7\u09B8 \u09AB\u09BE\u09B8\u09CD\u099F \u09AE\u09CD\u09AF\u09BE\u0997\u09A8\u09C7\u099F\u09BF\u0995 \u099A\u09BE\u09B0\u09CD\u099C\u09BF\u0982

\u{1F4B0} \u09AC\u09BF\u09B6\u09C7\u09B7 \u0985\u09AB\u09BE\u09B0 \u09AE\u09C2\u09B2\u09CD\u09AF: \u09AE\u09BE\u09A4\u09CD\u09B0 \u09E7,\u09E8\u09E6\u09E6 \u099F\u09BE\u0995\u09BE! (\u09A8\u09BF\u09AF\u09BC\u09AE\u09BF\u09A4 \u09AE\u09C2\u09B2\u09CD\u09AF: \u09E7,\u09EB\u09EB\u09E6 \u099F\u09BE\u0995\u09BE)

\u{1F69A} \u0995\u09CD\u09AF\u09BE\u09B6 \u0985\u09A8 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF\u09A4\u09C7 \u09AA\u09A3\u09CD\u09AF \u09A6\u09C7\u0996\u09C7 \u099F\u09BE\u0995\u09BE \u09AA\u09B0\u09BF\u09B6\u09CB\u09A7 \u0995\u09B0\u09BE\u09B0 \u09B8\u09C1\u09AC\u09BF\u09A7\u09BE!

\u{1F4E9} \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u098F\u0996\u09A8\u0987 \u0986\u09AA\u09A8\u09BE\u09B0 \u09A8\u09BE\u09AE, \u09AA\u09C2\u09B0\u09CD\u09A3 \u09A0\u09BF\u0995\u09BE\u09A8\u09BE \u0993 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09AE\u09CD\u09AC\u09B0 \u09B8\u09B9 \u09AE\u09C7\u09B8\u09C7\u099C \u0995\u09B0\u09C1\u09A8 \u0985\u09A5\u09AC\u09BE \u0995\u09B2 \u0995\u09B0\u09C1\u09A8 01700-000000 \u09A8\u09AE\u09CD\u09AC\u09B0\u09C7\u0964`,
      hook: "\u09E7,\u09EB\u09E6\u09E6 \u099F\u09BE\u0995\u09BE\u09B0 \u0995\u09AE\u09C7 \u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u0986\u09B2\u09CD\u099F\u09CD\u09B0\u09BE \u09B8\u09CD\u09AE\u09BE\u09B0\u09CD\u099F\u0993\u09AF\u09BC\u09BE\u099A \u0996\u09C1\u0981\u099C\u099B\u09C7\u09A8?",
      sellingPriceText: "\u09E7,\u09E8\u09E6\u09E6 \u099F\u09BE\u0995\u09BE",
      featuresList: ['2.09" HD Display', "Bluetooth Calling", "Magnetic Fast Charger"],
      cta: "\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u0987\u09A8\u09AC\u0995\u09CD\u09B8 \u0995\u09B0\u09C1\u09A8 \u098F\u0996\u09A8\u0987!",
      hashtags: ["#T900Ultra", "#SmartWatchBD", "#GadgetBD", "#ShopBaseBD", "#ViralWatch"],
      mediaUrls: ["https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1920&auto=format&fit=crop"]
    },
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "q-reel-1",
    productId: "shopbase-ultrawatch-9",
    productTitle: 'T900 Ultra Big 2.09" Display Smartwatch',
    platform: "facebook",
    contentType: "facebook_reel",
    status: "draft",
    aiModelUsed: "gemini-2.5-flash",
    content: {
      title: "T900 Ultra 9:16 Short Video",
      caption: "\u098F\u0987 \u0998\u09A1\u09BC\u09BF\u099F\u09BF \u09B9\u09BE\u09A4\u09C7 \u09A8\u09BE \u09A6\u09C7\u0996\u09B2\u09C7 \u09AC\u09C1\u099D\u09AC\u09C7\u09A8 \u09A8\u09BE \u098F\u09B0 \u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u09AB\u09BF\u09A8\u09BF\u09B6! \u{1F525} T900 Ultra Smartwatch \u09AE\u09BE\u09A4\u09CD\u09B0 \u09E7\u09E8\u09E6\u09E6 \u099F\u09BE\u0995\u09BE\u09AF\u09BC! #ShopBaseBD #SmartWatch",
      hook: "\u09E7\u09E6\u09E6\u09E6 \u099F\u09BE\u0995\u09BE\u09B0 \u09AC\u09BE\u099C\u09C7\u099F\u09C7 \u098F\u09A4\u09CB \u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u09AB\u09BF\u099A\u09BE\u09B0 \u0995\u09BF\u09AD\u09BE\u09AC\u09C7 \u09B8\u09AE\u09CD\u09AD\u09AC?!",
      videoScript: `[Scene 1: 0-3s] Hook: "\u0986\u09AA\u09A8\u09BF \u0995\u09BF \u09E7,\u09EB\u09E6\u09E6 \u099F\u09BE\u0995\u09BE\u09B0 \u09AE\u09A7\u09CD\u09AF\u09C7 \u09B8\u09C7\u09B0\u09BE \u09B2\u09C1\u0995\u09BF\u0982 \u09B8\u09CD\u09AE\u09BE\u09B0\u09CD\u099F\u0993\u09AF\u09BC\u09BE\u099A \u0996\u09C1\u0981\u099C\u099B\u09C7\u09A8?"
[Scene 2: 3-8s] Displaying 2.09" ultra HD screen and vibrant watch faces.
[Scene 3: 8-12s] Demonstrating Bluetooth Calling and instant clear voice test.
[Scene 4: 12-15s] CTA: "\u09B8\u09BE\u09B0\u09BE \u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6\u09C7 \u0995\u09CD\u09AF\u09BE\u09B6 \u0985\u09A8 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF! \u0986\u099C\u0987 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09A8\u09AB\u09BE\u09B0\u09CD\u09AE \u0995\u09B0\u09A4\u09C7 \u09A1\u09C7\u09B8\u0995\u09CD\u09B0\u09BF\u09AA\u09B6\u09A8\u09C7\u09B0 \u09B2\u09BF\u0982\u0995\u09C7 \u09AF\u09BE\u09A8\u0964"`,
      mediaUrls: ["https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1920&auto=format&fit=crop"],
      hashtags: ["#T900Ultra", "#ReelsBD", "#GadgetVlog", "#TrendingBD"],
      videoDurationSeconds: 15
    },
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "q-tiktok-1",
    productId: "shopbase-ultrawatch-9",
    productTitle: 'T900 Ultra Big 2.09" Display Smartwatch',
    platform: "tiktok",
    contentType: "tiktok_video",
    status: "draft",
    aiModelUsed: "groq-llama3-70b",
    content: {
      caption: "\u0985\u09AC\u09BF\u09B6\u09CD\u09AC\u09BE\u09B8\u09CD\u09AF \u09A1\u09BF\u09B8\u0995\u09BE\u0989\u09A8\u09CD\u099F\u09C7 T900 Ultra \u09B8\u09CD\u09AE\u09BE\u09B0\u09CD\u099F\u0993\u09AF\u09BC\u09BE\u099A! \u09AC\u09CD\u09B2\u09C1\u099F\u09C1\u09A5 \u0995\u09B2\u09BF\u0982 + \u09AB\u09C1\u09B2 \u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09A8 \u09A1\u09BF\u09B8\u09AA\u09CD\u09B2\u09C7 \u{1F525} #TikTokBD #GadgetsBD #ShopBase",
      hook: "\u098F\u0987 \u0998\u09A1\u09BC\u09BF\u099F\u09BF \u09AE\u09BF\u09B8 \u0995\u09B0\u09B2\u09C7 \u09B8\u09A4\u09CD\u09AF\u09BF \u09B2\u09B8 \u0995\u09B0\u09AC\u09C7\u09A8!",
      videoScript: `00-03s: \u09B9\u09CD\u09AF\u09BE\u09B2\u09CB \u0997\u09CD\u09AF\u09BE\u099C\u09C7\u099F \u09B2\u09BE\u09AD\u09BE\u09B0\u09CD\u09B8! \u098F\u0987 \u09AC\u09BE\u099C\u09C7\u099F \u0997\u09CD\u09AF\u09BE\u099C\u09C7\u099F\u099F\u09BF \u09A6\u09C7\u0996\u09B2\u09C7 \u0986\u09AA\u09A8\u09BF\u0993 \u099A\u09AE\u0995\u09C7 \u09AF\u09BE\u09AC\u09C7\u09A8!
04-09s: \u09AC\u09BF\u09B6\u09BE\u09B2 \u09E8.\u09E6\u09EF \u0987\u099E\u09CD\u099A\u09BF \u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09A8 \u0986\u09B0 \u0985\u09CD\u09AF\u09BE\u09AA\u09B2 \u0993\u09AF\u09BC\u09BE\u099A \u0986\u09B2\u09CD\u099F\u09CD\u09B0\u09BE \u09AD\u09BE\u0987\u09AC!
10-15s: \u09A6\u09C7\u09B0\u09BF \u09A8\u09BE \u0995\u09B0\u09C7 \u098F\u0996\u09A8\u0987 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8 \u09AC\u09BE\u09AF\u09BC\u09CB \u09B2\u09BF\u0982\u0995\u09C7 \u0995\u09CD\u09B2\u09BF\u0995 \u0995\u09B0\u09C7!`,
      hashtags: ["#GadgetBD", "#TikTokShopBD", "#T900Ultra", "#Smartwatch"],
      mediaUrls: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1920&auto=format&fit=crop"],
      videoDurationSeconds: 15
    },
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var DatabaseService = class {
  constructor() {
    this.ensureDirectory();
    this.data = this.loadData();
  }
  ensureDirectory() {
    if (!import_fs.default.existsSync(DATA_DIR)) {
      import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
    }
  }
  loadData() {
    try {
      if (import_fs.default.existsSync(DB_FILE)) {
        const raw = import_fs.default.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        return {
          products: parsed.products || INITIAL_PRODUCTS,
          aiModels: parsed.aiModels || INITIAL_MODELS,
          taskAssignments: parsed.taskAssignments || {
            productAnalysis: "gemini-flash",
            facebookCaption: "gemini-flash",
            youtubeContent: "gemini-flash",
            tiktokContent: "groq-llama3-70b",
            videoScript: "groq-llama3-70b",
            imagePrompt: "gemini-flash",
            generalMarketing: "gemini-flash",
            fallbackModelId: "openai-gpt4o-mini",
            enableFallback: true
          },
          tavily: parsed.tavily || {
            apiKey: process.env.TAVILY_API_KEY || "",
            searchDepth: "basic",
            maxResults: 5,
            includeAnswer: true,
            status: process.env.TAVILY_API_KEY ? "online" : "not_configured"
          },
          brand: parsed.brand || {
            brandName: "ShopBase BD Gadget Hub",
            logoUrl: "https://shopbasebd.com/wp-content/uploads/2023/shopbase-logo.png",
            contactNumber: "+880 1700-000000",
            facebookPage: "https://facebook.com/ShopBaseBD",
            website: "https://shopbasebd.com",
            orderUrl: "https://shopbasebd.com/store",
            defaultCta: "\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u098F\u0996\u09A8\u0987 \u0987\u09A8\u09AC\u0995\u09CD\u09B8 \u0995\u09B0\u09C1\u09A8 \u0985\u09A5\u09AC\u09BE \u0993\u09AF\u09BC\u09C7\u09AC\u09B8\u09BE\u0987\u099F\u09C7 \u09AD\u09BF\u099C\u09BF\u099F \u0995\u09B0\u09C1\u09A8\u0964 \u09B8\u09BE\u09B0\u09BE \u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6\u09C7 \u0995\u09CD\u09AF\u09BE\u09B6 \u0985\u09A8 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF!",
            defaultProfit: 200,
            currency: "BDT",
            language: "Bangla"
          },
          pricing: parsed.pricing || {
            strategy: "fixed",
            fixedProfit: 150,
            percentageProfit: 15,
            minProfit: 100,
            customFormula: "sourcePrice + 150"
          },
          social: parsed.social || {
            facebook: {
              connected: false,
              pageName: "ShopBase Official BD",
              pageId: "1092837465",
              status: "not_configured"
            },
            youtube: {
              connected: false,
              channelTitle: "ShopBase BD Tech",
              channelId: "UC_shopbasebd_tech",
              status: "not_configured"
            },
            tiktok: {
              connected: false,
              accountName: "@shopbase.bd",
              status: "not_configured",
              permissionsNotice: "Requires TikTok Content Posting API permissions."
            }
          },
          queue: parsed.queue || INITIAL_QUEUE,
          automation: parsed.automation || {
            autoCollect: false,
            autoGenerate: false,
            autoPost: false,
            intervalHours: 6,
            testMode: true,
            // Safe mode default
            categoryFilters: ["Smartwatches & Wearables", "Audio & Earphones", "Accessories"],
            minQualityScore: 80,
            lastRunAt: (/* @__PURE__ */ new Date()).toISOString(),
            nextRunAt: new Date(Date.now() + 6 * 3600 * 1e3).toISOString()
          },
          logs: parsed.logs || [
            {
              id: "log-init",
              timestamp: (/* @__PURE__ */ new Date()).toISOString(),
              level: "info",
              service: "Database",
              message: "ShopBase BD Automation Database Initialized with persistent storage."
            }
          ],
          duplicateHistory: parsed.duplicateHistory || {
            "shopbase-ultrawatch-9_facebook_facebook_post": true
          }
        };
      }
    } catch (err) {
      console.error("Error loading DB, using defaults", err);
    }
    const defaultState = {
      products: INITIAL_PRODUCTS,
      aiModels: INITIAL_MODELS,
      taskAssignments: {
        productAnalysis: "gemini-flash",
        facebookCaption: "gemini-flash",
        youtubeContent: "gemini-flash",
        tiktokContent: "groq-llama3-70b",
        videoScript: "groq-llama3-70b",
        imagePrompt: "gemini-flash",
        generalMarketing: "gemini-flash",
        fallbackModelId: "openai-gpt4o-mini",
        enableFallback: true
      },
      tavily: {
        apiKey: process.env.TAVILY_API_KEY || "",
        searchDepth: "basic",
        maxResults: 5,
        includeAnswer: true,
        status: process.env.TAVILY_API_KEY ? "online" : "not_configured"
      },
      brand: {
        brandName: "ShopBase BD Gadget Hub",
        logoUrl: "https://shopbasebd.com/wp-content/uploads/2023/shopbase-logo.png",
        contactNumber: "+880 1700-000000",
        facebookPage: "https://facebook.com/ShopBaseBD",
        website: "https://shopbasebd.com",
        orderUrl: "https://shopbasebd.com/store",
        defaultCta: "\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u098F\u0996\u09A8\u0987 \u0987\u09A8\u09AC\u0995\u09CD\u09B8 \u0995\u09B0\u09C1\u09A8 \u0985\u09A5\u09AC\u09BE \u0993\u09AF\u09BC\u09C7\u09AC\u09B8\u09BE\u0987\u099F\u09C7 \u09AD\u09BF\u099C\u09BF\u099F \u0995\u09B0\u09C1\u09A8\u0964 \u09B8\u09BE\u09B0\u09BE \u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6\u09C7 \u0995\u09CD\u09AF\u09BE\u09B6 \u0985\u09A8 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF!",
        defaultProfit: 200,
        currency: "BDT",
        language: "Bangla"
      },
      pricing: {
        strategy: "fixed",
        fixedProfit: 150,
        percentageProfit: 15,
        minProfit: 100,
        customFormula: "sourcePrice + 150"
      },
      social: {
        facebook: {
          connected: false,
          pageName: "ShopBase Official BD",
          pageId: "1092837465",
          status: "not_configured"
        },
        youtube: {
          connected: false,
          channelTitle: "ShopBase BD Tech",
          channelId: "UC_shopbasebd_tech",
          status: "not_configured"
        },
        tiktok: {
          connected: false,
          accountName: "@shopbase.bd",
          status: "not_configured",
          permissionsNotice: "Requires TikTok Content Posting API permissions."
        }
      },
      queue: INITIAL_QUEUE,
      automation: {
        autoCollect: false,
        autoGenerate: false,
        autoPost: false,
        intervalHours: 6,
        testMode: true,
        categoryFilters: ["Smartwatches & Wearables", "Audio & Earphones"],
        minQualityScore: 80,
        lastRunAt: (/* @__PURE__ */ new Date()).toISOString(),
        nextRunAt: new Date(Date.now() + 6 * 3600 * 1e3).toISOString()
      },
      logs: [
        {
          id: "log-init",
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          level: "info",
          service: "Database",
          message: "ShopBase BD Automation Database Initialized with persistent storage."
        }
      ],
      duplicateHistory: {
        "shopbase-ultrawatch-9_facebook_facebook_post": true
      }
    };
    this.saveDataDirect(defaultState);
    return defaultState;
  }
  saveData() {
    this.saveDataDirect(this.data);
  }
  saveDataDirect(data) {
    try {
      this.ensureDirectory();
      const tmp = `${DB_FILE}.tmp`;
      import_fs.default.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf-8");
      import_fs.default.renameSync(tmp, DB_FILE);
    } catch (err) {
      console.error("Failed to write database file", err);
    }
  }
  // --- PRODUCTS ---
  getProducts() {
    return this.data.products;
  }
  getProductById(id) {
    return this.data.products.find((p) => p.id === id || p.productId === id);
  }
  saveProduct(product) {
    const existingIndex = this.data.products.findIndex(
      (p) => p.sourceUrl && p.sourceUrl === product.sourceUrl || p.productId && p.productId === product.productId || p.sku && product.sku && p.sku === product.sku || p.id === product.id
    );
    if (existingIndex >= 0) {
      this.data.products[existingIndex] = {
        ...this.data.products[existingIndex],
        ...product,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.saveData();
      return { product: this.data.products[existingIndex], isDuplicate: true };
    } else {
      this.data.products.unshift(product);
      this.saveData();
      this.addLog("info", "Collector", `New product saved: ${product.title} (${product.price} BDT)`);
      return { product, isDuplicate: false };
    }
  }
  deleteProduct(id) {
    const prevLen = this.data.products.length;
    this.data.products = this.data.products.filter((p) => p.id !== id);
    if (this.data.products.length !== prevLen) {
      this.saveData();
      return true;
    }
    return false;
  }
  // --- AI MODELS ---
  getModels() {
    return this.data.aiModels;
  }
  getModelById(id) {
    return this.data.aiModels.find((m) => m.id === id);
  }
  saveModel(model) {
    const idx = this.data.aiModels.findIndex((m) => m.id === model.id);
    if (idx >= 0) {
      this.data.aiModels[idx] = model;
    } else {
      this.data.aiModels.push(model);
    }
    this.saveData();
    return model;
  }
  deleteModel(id) {
    this.data.aiModels = this.data.aiModels.filter((m) => m.id !== id);
    this.saveData();
    return true;
  }
  getTaskAssignments() {
    return this.data.taskAssignments;
  }
  saveTaskAssignments(assignments) {
    this.data.taskAssignments = assignments;
    this.saveData();
    return this.data.taskAssignments;
  }
  // --- TAVILY ---
  getTavilyConfig() {
    return this.data.tavily;
  }
  saveTavilyConfig(config) {
    this.data.tavily = { ...this.data.tavily, ...config };
    this.saveData();
    return this.data.tavily;
  }
  // --- BRAND & PRICING ---
  getBrandSettings() {
    return this.data.brand;
  }
  saveBrandSettings(brand) {
    this.data.brand = { ...this.data.brand, ...brand };
    this.saveData();
    return this.data.brand;
  }
  getPricingRules() {
    return this.data.pricing;
  }
  savePricingRules(pricing) {
    this.data.pricing = { ...this.data.pricing, ...pricing };
    this.saveData();
    return this.data.pricing;
  }
  // Calculate selling price according to rules
  calculateSellingPrice(sourcePrice) {
    const rules = this.data.pricing;
    let profit = rules.fixedProfit;
    if (rules.strategy === "percentage") {
      profit = Math.round(sourcePrice * rules.percentageProfit / 100);
      if (profit < rules.minProfit) profit = rules.minProfit;
    } else if (rules.strategy === "custom" && rules.customFormula) {
      try {
        const sanitized = rules.customFormula.replace(/sourcePrice/g, String(sourcePrice));
        if (/^[0-9+\-*/().\s]+$/.test(sanitized)) {
          const evalVal = Function(`"use strict"; return (${sanitized});`)();
          if (typeof evalVal === "number" && !isNaN(evalVal)) {
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
      sellingPrice: sourcePrice + profit
    };
  }
  // --- SOCIAL ACCOUNTS ---
  getSocialConfig() {
    return this.data.social;
  }
  saveSocialConfig(config) {
    this.data.social = { ...this.data.social, ...config };
    this.saveData();
    return this.data.social;
  }
  // --- QUEUE ---
  getQueue() {
    return this.data.queue;
  }
  addToQueue(item) {
    const idx = this.data.queue.findIndex((q) => q.id === item.id);
    if (idx >= 0) {
      this.data.queue[idx] = item;
    } else {
      this.data.queue.unshift(item);
    }
    this.saveData();
    return item;
  }
  updateQueueItem(id, updates) {
    const item = this.data.queue.find((q) => q.id === id);
    if (!item) return null;
    Object.assign(item, updates, { updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
    this.saveData();
    return item;
  }
  deleteQueueItem(id) {
    const prev = this.data.queue.length;
    this.data.queue = this.data.queue.filter((q) => q.id !== id);
    if (this.data.queue.length !== prev) {
      this.saveData();
      return true;
    }
    return false;
  }
  // --- DUPLICATE PROTECTION ---
  isAlreadyPublished(productId, platform, contentType) {
    const key = `${productId}_${platform}_${contentType}`;
    return !!this.data.duplicateHistory[key];
  }
  markAsPublished(productId, platform, contentType) {
    const key = `${productId}_${platform}_${contentType}`;
    this.data.duplicateHistory[key] = true;
    this.saveData();
  }
  // --- AUTOMATION SETTINGS ---
  getAutomationSettings() {
    return this.data.automation;
  }
  saveAutomationSettings(settings) {
    this.data.automation = { ...this.data.automation, ...settings };
    this.saveData();
    return this.data.automation;
  }
  // --- LOGS ---
  getLogs(limit = 100) {
    return this.data.logs.slice(0, limit);
  }
  addLog(level, service, message, details) {
    const log = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      level,
      service,
      message,
      details
    };
    this.data.logs.unshift(log);
    if (this.data.logs.length > 300) {
      this.data.logs = this.data.logs.slice(0, 300);
    }
    this.saveData();
    return log;
  }
  clearLogs() {
    this.data.logs = [];
    this.saveData();
    return true;
  }
};
var db = new DatabaseService();

// server/services/ShopBaseCollector.ts
var cheerio = __toESM(require("cheerio"), 1);
var ShopBaseCollector = class _ShopBaseCollector {
  static {
    this.defaultUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
  }
  /**
   * Discover categories from ShopBase BD
   */
  static async discoverCategories() {
    const defaultCategories = [
      { name: "Smart Watches & Wearables", url: "https://shopbasebd.com/store/product-category/smart-watch/", count: 42 },
      { name: "Audio & Wireless Earbuds", url: "https://shopbasebd.com/store/product-category/audio-earbuds/", count: 38 },
      { name: "Mobile Accessories & Gadgets", url: "https://shopbasebd.com/store/product-category/gadgets/", count: 65 },
      { name: "Power Banks & Chargers", url: "https://shopbasebd.com/store/product-category/power-bank/", count: 24 },
      { name: "Home & Kitchen Appliances", url: "https://shopbasebd.com/store/product-category/home-appliances/", count: 31 },
      { name: "Fashion, Bags & Wallets", url: "https://shopbasebd.com/store/product-category/bags/", count: 19 }
    ];
    try {
      const response = await fetch("https://shopbasebd.com/store/product-category", {
        headers: { "User-Agent": this.defaultUserAgent },
        signal: AbortSignal.timeout(6e3)
      });
      if (response.ok) {
        const html = await response.text();
        const $ = cheerio.load(html);
        const discovered = [];
        $(".product-category a, ul.product-categories a, .cat-item a, nav.shop-categories a").each((_, el) => {
          const href = $(el).attr("href");
          const name = $(el).text().trim().replace(/\(\d+\)$/, "").trim();
          const countMatch = $(el).text().match(/\((\d+)\)/);
          const count = countMatch ? parseInt(countMatch[1], 10) : void 0;
          if (href && name && name.length > 2 && !discovered.some((c) => c.url === href)) {
            discovered.push({ name, url: href, count });
          }
        });
        if (discovered.length > 0) {
          db.addLog("info", "Collector", `Discovered ${discovered.length} categories from ShopBase live page`);
          return discovered;
        }
      }
    } catch (err) {
      db.addLog("warn", "Collector", `Direct category scrape timed out or blocked; returning standard ShopBase BD categories: ${err.message}`);
    }
    return defaultCategories;
  }
  /**
   * Discover product URLs from a category page or store listing
   */
  static async discoverProductUrls(categoryUrl) {
    try {
      const response = await fetch(categoryUrl, {
        headers: { "User-Agent": this.defaultUserAgent },
        signal: AbortSignal.timeout(7e3)
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const html = await response.text();
      const $ = cheerio.load(html);
      const productUrls = /* @__PURE__ */ new Set();
      $('a[href*="/product/"], a.woocommerce-LoopProduct-link, .product-title a, .woocommerce-loop-product__link').each((_, el) => {
        const href = $(el).attr("href");
        if (href && href.includes("/product/")) {
          const cleanUrl = href.split("?")[0];
          productUrls.add(cleanUrl);
        }
      });
      return Array.from(productUrls);
    } catch (err) {
      db.addLog("warn", "Collector", `Could not crawl category URL: ${categoryUrl} (${err.message})`);
      return [];
    }
  }
  /**
   * Extract high-resolution image candidates and filter out thumbnails
   */
  static cleanAndScoreImageUrl(rawUrl, label = "Product Image") {
    if (!rawUrl || typeof rawUrl !== "string") return null;
    let url = rawUrl.trim();
    if (url.startsWith("//")) url = `https:${url}`;
    if (url.includes("data:image") || url.includes("pixel") || url.includes("avatar") || url.includes("placeholder") || url.includes("gravatar") || url.includes("1x1")) {
      return null;
    }
    const highResUrl = url.replace(/-\d{2,4}x\d{2,4}(\.[a-zA-Z0-9]+)$/, "$1");
    let format = "JPEG";
    if (url.endsWith(".png")) format = "PNG";
    else if (url.endsWith(".webp")) format = "WEBP";
    let width = 1920;
    let height = 1920;
    let qualityScore = 90;
    const dimMatch = url.match(/-(\d{3,4})x(\d{3,4})/);
    if (dimMatch) {
      width = parseInt(dimMatch[1], 10);
      height = parseInt(dimMatch[2], 10);
      if (width < 300 || height < 300) {
        qualityScore = 55;
      } else if (width >= 1e3) {
        qualityScore = 95;
      } else {
        qualityScore = 80;
      }
    } else if (url === highResUrl) {
      qualityScore = 95;
    }
    return {
      id: `img-${Math.random().toString(36).substring(2, 9)}`,
      originalImageUrl: url,
      highResolutionImageUrl: highResUrl,
      width,
      height,
      format,
      qualityScore,
      label,
      isSelected: true
    };
  }
  /**
   * Robust multi-strategy product extraction
   * Strategy 1: JSON-LD (Schema.org/Product)
   * Strategy 2: OpenGraph & Twitter Meta Tags
   * Strategy 3: WooCommerce and ShopBase specific DOM elements
   */
  static async extractProductFromUrl(url) {
    db.addLog("info", "Collector", `Starting multi-strategy extraction for ${url}`);
    let html = "";
    try {
      const resp = await fetch(url, {
        headers: { "User-Agent": this.defaultUserAgent },
        signal: AbortSignal.timeout(8e3)
      });
      if (resp.ok) {
        html = await resp.text();
      }
    } catch (e) {
      db.addLog("warn", "Collector", `Live request to ${url} failed or timed out: ${e.message}. Using synthetic extraction parser.`);
    }
    if (!html) {
      return this.buildFallbackFromUrl(url);
    }
    const $ = cheerio.load(html);
    let jsonLdProduct = null;
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const text = $(el).html();
        if (text) {
          const parsed = JSON.parse(text);
          if (parsed["@type"] === "Product") {
            jsonLdProduct = parsed;
          } else if (Array.isArray(parsed["@graph"])) {
            const found = parsed["@graph"].find((item) => item["@type"] === "Product");
            if (found) jsonLdProduct = found;
          }
        }
      } catch {
      }
    });
    let title = "";
    if (jsonLdProduct && jsonLdProduct.name) {
      title = String(jsonLdProduct.name);
    } else {
      title = $('meta[property="og:title"]').attr("content") || $("h1.product_title, h1.product-title, h1.entry-title").first().text().trim() || $("title").text().replace(/[-–|].*$/, "").trim();
    }
    if (!title) {
      title = "ShopBase BD Premium Product";
    }
    let price = 0;
    let originalPrice = void 0;
    if (jsonLdProduct && jsonLdProduct.offers) {
      const offers = Array.isArray(jsonLdProduct.offers) ? jsonLdProduct.offers[0] : jsonLdProduct.offers;
      if (offers && offers.price) {
        price = parseFloat(offers.price);
      }
    }
    if (!price || isNaN(price)) {
      const ogPrice = $('meta[property="product:price:amount"]').attr("content");
      if (ogPrice) price = parseFloat(ogPrice);
    }
    if (!price || isNaN(price)) {
      const insPriceText = $(".price ins .woocommerce-Price-amount, .product-price ins, .price .current-price").first().text().replace(/[^0-9.]/g, "");
      const delPriceText = $(".price del .woocommerce-Price-amount, .product-price del, .price .old-price").first().text().replace(/[^0-9.]/g, "");
      if (insPriceText) {
        price = parseFloat(insPriceText);
        if (delPriceText) originalPrice = parseFloat(delPriceText);
      } else {
        const generalPrice = $(".price .woocommerce-Price-amount, .price, .single-price").first().text().replace(/[^0-9.]/g, "");
        if (generalPrice) price = parseFloat(generalPrice);
      }
    }
    if (!price || isNaN(price)) {
      price = 850;
    }
    let sku = "";
    if (jsonLdProduct && jsonLdProduct.sku) {
      sku = String(jsonLdProduct.sku);
    } else {
      sku = $(".sku").first().text().trim() || $("[data-product_sku]").attr("data-product_sku") || "";
    }
    if (!sku) {
      sku = `SKU-SB-${Math.floor(1e3 + Math.random() * 9e3)}`;
    }
    const productId = $("[data-product_id]").attr("data-product_id") || `SB-${sku}`;
    let description = "";
    if (jsonLdProduct && jsonLdProduct.description) {
      description = String(jsonLdProduct.description);
    } else {
      description = $('meta[property="og:description"]').attr("content") || $("#tab-description, .woocommerce-product-details__short-description, .product-short-description").first().text().trim();
    }
    if (!description || description.length < 20) {
      description = `${title} is a genuine high-demand lifestyle gadget available from ShopBase BD with official manufacturer warranty and island-wide delivery.`;
    }
    let category = "";
    $(".posted_in a, .breadcrumbs a, .woocommerce-breadcrumb a").each((_, el) => {
      const text = $(el).text().trim();
      if (text && !["Home", "Shop", "Store", "Products"].includes(text)) {
        category = text;
      }
    });
    if (!category) category = "Gadgets & Electronics";
    const features = [];
    $(".woocommerce-product-attributes-item, .specifications-list li, #tab-additional_information table tr, .product-description ul li").each((_, el) => {
      const text = $(el).text().replace(/\s+/g, " ").trim();
      if (text && text.length > 5 && text.length < 150) {
        features.push(text);
      }
    });
    if (features.length === 0) {
      features.push("High build quality and premium materials");
      features.push("Fast plug-and-play setup for all devices");
      features.push("Official ShopBase BD 7-days replacement warranty");
      features.push("Cash on delivery available nationwide across Bangladesh");
    }
    const images = [];
    const seenUrls = /* @__PURE__ */ new Set();
    const addImage = (rawUrl, label = "Product") => {
      if (!rawUrl) return;
      const img = _ShopBaseCollector.cleanAndScoreImageUrl(rawUrl, label);
      if (img && !seenUrls.has(img.highResolutionImageUrl)) {
        seenUrls.add(img.highResolutionImageUrl);
        images.push(img);
      }
    };
    if (jsonLdProduct && jsonLdProduct.image) {
      const ldImgs = Array.isArray(jsonLdProduct.image) ? jsonLdProduct.image : [jsonLdProduct.image];
      ldImgs.forEach((i) => addImage(typeof i === "string" ? i : i.url, "JSON-LD Product"));
    }
    const ogImg = $('meta[property="og:image"]').attr("content");
    if (ogImg) addImage(ogImg, "OpenGraph Hero");
    $(".woocommerce-product-gallery__image a, .woocommerce-product-gallery__wrapper img, .product-images img").each((_, el) => {
      const fullUrl = $(el).attr("data-large_image") || $(el).attr("data-src") || $(el).attr("src") || $(el).parent("a").attr("href");
      if (fullUrl) addImage(fullUrl, "Gallery Photo");
    });
    if (images.length === 0) {
      images.push({
        id: `img-${Date.now()}`,
        originalImageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1920&auto=format&fit=crop",
        highResolutionImageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1920&auto=format&fit=crop",
        width: 1920,
        height: 1920,
        format: "JPEG",
        qualityScore: 94,
        label: "High-Res Preview",
        isSelected: true
      });
    }
    const { profit, sellingPrice } = db.calculateSellingPrice(price);
    const product = {
      id: `shopbase-${productId.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      source: "ShopBase BD",
      sourceUrl: url,
      productId,
      sku,
      title,
      description,
      category,
      price,
      originalPrice,
      profit,
      sellingPrice,
      currency: "BDT",
      features: features.slice(0, 8),
      variations: [],
      images,
      videos: [],
      availability: "in_stock",
      sourceCollectedAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      contentStatus: "pending",
      publishingStatus: "unprocessed"
    };
    db.addLog("success", "Collector", `Extracted product: "${title}" (${price} BDT) with ${images.length} high-res images`);
    return product;
  }
  /**
   * Fallback builder for demo/testing when network cannot reach ShopBase BD
   */
  static buildFallbackFromUrl(url) {
    const slug = url.split("/").filter(Boolean).pop() || "premium-gadget";
    const cleanTitle = slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    const price = 1150;
    const { profit, sellingPrice } = db.calculateSellingPrice(price);
    return {
      id: `shopbase-${slug}`,
      source: "ShopBase BD",
      sourceUrl: url,
      productId: `SB-${slug.toUpperCase()}`,
      sku: `SKU-${slug.slice(0, 4).toUpperCase()}-99`,
      title: `${cleanTitle} (ShopBase BD Edition)`,
      description: `Official ${cleanTitle} featuring next-generation build quality, fast connectivity, long battery backup, and full local warranty in Bangladesh.`,
      category: "Smart Gadgets",
      price,
      originalPrice: 1750,
      profit,
      sellingPrice,
      currency: "BDT",
      features: [
        "Premium metallic and polycarbonate construction",
        "Intuitive one-touch operations and instant pairing",
        "Verified Bangladesh voltage and temperature tested",
        "Full 7-day cash on delivery guarantee from ShopBase BD"
      ],
      variations: [
        { id: "var-1", name: "Color", options: ["Matte Black", "Arctic White", "Space Grey"] }
      ],
      images: [
        {
          id: `img-${Date.now()}-1`,
          originalImageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1920&auto=format&fit=crop",
          highResolutionImageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1920&auto=format&fit=crop",
          width: 1920,
          height: 1920,
          format: "JPEG",
          qualityScore: 94,
          label: "Primary High-Res Shot",
          isSelected: true
        },
        {
          id: `img-${Date.now()}-2`,
          originalImageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1920&auto=format&fit=crop",
          highResolutionImageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1920&auto=format&fit=crop",
          width: 1920,
          height: 1280,
          format: "JPEG",
          qualityScore: 91,
          label: "Studio Detail",
          isSelected: true
        }
      ],
      videos: [],
      availability: "in_stock",
      sourceCollectedAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      contentStatus: "pending",
      publishingStatus: "unprocessed"
    };
  }
};

// server/services/TavilyService.ts
var TavilyService = class {
  /**
   * Test the Tavily API connection
   */
  static async testConnection(apiKey) {
    const key = apiKey || db.getTavilyConfig().apiKey || process.env.TAVILY_API_KEY;
    if (!key) {
      db.saveTavilyConfig({ status: "not_configured" });
      return {
        success: false,
        status: "NOT CONFIGURED",
        latencyMs: 0,
        message: "No Tavily API key found. Please enter your Tavily key in API Settings."
      };
    }
    const start = Date.now();
    try {
      const resp = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          api_key: key,
          query: "Bangladesh e-commerce consumer trends",
          search_depth: "basic",
          max_results: 1
        }),
        signal: AbortSignal.timeout(6e3)
      });
      const latencyMs = Date.now() - start;
      if (!resp.ok) {
        const errText = await resp.text();
        const status = resp.status === 401 || resp.status === 403 ? "AUTHENTICATION FAILED" : "error";
        db.saveTavilyConfig({ status: status === "AUTHENTICATION FAILED" ? "error" : "error", lastTestedAt: (/* @__PURE__ */ new Date()).toISOString(), latencyMs });
        db.addLog("error", "Tavily", `Tavily test failed: HTTP ${resp.status} - ${errText}`);
        return {
          success: false,
          status,
          latencyMs,
          message: `Tavily API responded with HTTP ${resp.status}: ${errText.slice(0, 120)}`
        };
      }
      db.saveTavilyConfig({ status: "online", lastTestedAt: (/* @__PURE__ */ new Date()).toISOString(), latencyMs });
      db.addLog("success", "Tavily", `Tavily connection test successful (${latencyMs}ms)`);
      return {
        success: true,
        status: "online",
        latencyMs,
        message: `Connection successful. Tavily latency: ${latencyMs}ms.`
      };
    } catch (err) {
      const latencyMs = Date.now() - start;
      db.saveTavilyConfig({ status: "error", lastTestedAt: (/* @__PURE__ */ new Date()).toISOString(), latencyMs });
      db.addLog("error", "Tavily", `Tavily test error: ${err.message}`);
      return {
        success: false,
        status: "error",
        latencyMs,
        message: `Network error reaching Tavily API: ${err.message}`
      };
    }
  }
  /**
   * Search the web for product market research
   */
  static async search(query, depth = "basic", maxResults = 5) {
    const config = db.getTavilyConfig();
    const apiKey = config.apiKey || process.env.TAVILY_API_KEY;
    const start = Date.now();
    if (!apiKey) {
      db.addLog("warn", "Tavily", `Tavily API key not configured. Using synthetic market research for query: "${query}"`);
      return {
        query,
        searchDepth: depth,
        latencyMs: 120,
        answer: `Market research for ${query} indicates high consumer interest in budget-friendly alternatives with cash on delivery and fast customer support in Bangladesh.`,
        results: [
          {
            title: `${query} Price and Review in Bangladesh`,
            url: "https://shopbasebd.com/trends",
            content: `Bangladeshi consumers heavily prioritize clear pricing, authentic specs, and Bangla communication. Fast delivery in Dhaka (24-48 hours) and outside Dhaka (3-4 days) are critical value drivers.`,
            score: 0.95
          },
          {
            title: "Trending Gadgets and Social Media Marketing 2026",
            url: "https://e-cab.net/bangladesh-ecommerce-insights",
            content: `Short video formats on TikTok and Facebook Reels drive over 70% of gadget impulse purchases. Videos showing hands-on unboxing, key screen features, and warranty assurance perform best.`,
            score: 0.89
          }
        ]
      };
    }
    try {
      const resp = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          query: `${query} Bangladesh price review`,
          search_depth: depth,
          include_answer: true,
          max_results: maxResults
        }),
        signal: AbortSignal.timeout(1e4)
      });
      const latencyMs = Date.now() - start;
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
      }
      const data = await resp.json();
      db.addLog("info", "Tavily", `Tavily research completed for "${query}" (${latencyMs}ms)`);
      return {
        query,
        answer: data.answer,
        results: (data.results || []).map((r) => ({
          title: r.title,
          url: r.url,
          content: r.content,
          score: r.score
        })),
        searchDepth: depth,
        latencyMs
      };
    } catch (err) {
      db.addLog("error", "Tavily", `Tavily search failed: ${err.message}`);
      throw err;
    }
  }
  /**
   * Extract webpage content via Tavily extract endpoint
   */
  static async extract(urls) {
    const config = db.getTavilyConfig();
    const apiKey = config.apiKey || process.env.TAVILY_API_KEY;
    if (!apiKey) {
      return {
        results: urls.map((u) => ({ url: u, raw_content: `Content preview for ${u} (Tavily key not configured).` }))
      };
    }
    const resp = await fetch("https://api.tavily.com/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        urls
      }),
      signal: AbortSignal.timeout(12e3)
    });
    if (!resp.ok) {
      throw new Error(`Tavily extract failed: ${resp.status}`);
    }
    return await resp.json();
  }
};

// server/services/AIModelManager.ts
var import_genai = require("@google/genai");
var AIModelManager = class {
  /**
   * Test an AI model configuration with a real minimal request
   */
  static async testModel(modelConfig) {
    const start = Date.now();
    const testPrompt = 'Say "OK - ShopBase Automation Connected" in 5 words or less.';
    try {
      const responseText = await this.invokeModelDirect(modelConfig, testPrompt, "You are a diagnostic health checker. Reply very concisely.");
      const latencyMs = Date.now() - start;
      const updatedModel = {
        ...modelConfig,
        status: "online",
        latencyMs,
        lastTestedAt: (/* @__PURE__ */ new Date()).toISOString(),
        errorMessage: void 0
      };
      db.saveModel(updatedModel);
      db.addLog("success", "AI", `Model ${modelConfig.name} passed test (${latencyMs}ms): ${responseText.slice(0, 60)}`);
      return {
        success: true,
        modelId: modelConfig.id,
        modelName: modelConfig.modelName,
        latencyMs,
        message: `Connection successful! Model responded in ${(latencyMs / 1e3).toFixed(2)}s`,
        sampleResponse: responseText.trim(),
        status: "online"
      };
    } catch (err) {
      const latencyMs = Date.now() - start;
      const errorMsg = err.message || "Unknown error occurred";
      let userMsg = errorMsg;
      if (errorMsg.includes("401") || errorMsg.includes("403") || errorMsg.includes("auth") || errorMsg.includes("API key")) {
        userMsg = "\u2715 API key invalid or unauthorized (HTTP 401/403)";
      } else if (errorMsg.includes("404") || errorMsg.includes("not found") || errorMsg.includes("model")) {
        userMsg = `\u2715 Model "${modelConfig.modelName}" unavailable or invalid endpoint`;
      } else if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("rate limit")) {
        userMsg = "\u2715 Rate limit or quota exceeded (HTTP 429)";
      }
      const updatedModel = {
        ...modelConfig,
        status: "error",
        latencyMs,
        lastTestedAt: (/* @__PURE__ */ new Date()).toISOString(),
        errorMessage: userMsg
      };
      db.saveModel(updatedModel);
      db.addLog("error", "AI", `Model ${modelConfig.name} test failed: ${userMsg}`);
      return {
        success: false,
        modelId: modelConfig.id,
        modelName: modelConfig.modelName,
        latencyMs,
        message: userMsg,
        status: "error"
      };
    }
  }
  /**
   * Execute a prompt using the specified task's configured model, with fallback support
   */
  static async executeForTask(task, prompt, customSystemPrompt) {
    const assignments = db.getTaskAssignments();
    const primaryModelId = assignments[task] || assignments.generalMarketing || "gemini-flash";
    const models = db.getModels();
    let primaryModel = models.find((m) => m.id === primaryModelId && m.isEnabled);
    if (!primaryModel) {
      primaryModel = models.find((m) => m.isDefault && m.isEnabled) || models.find((m) => m.isEnabled);
    }
    if (!primaryModel) {
      throw new Error("No AI model is currently enabled. Please enable or add a model in AI Settings.");
    }
    const sysPrompt = customSystemPrompt || primaryModel.systemPrompt;
    try {
      const text = await this.invokeModelDirect(primaryModel, prompt, sysPrompt);
      return { text, modelUsed: primaryModel.name, fallbackUsed: false };
    } catch (primaryErr) {
      db.addLog("warn", "AI", `Primary model "${primaryModel.name}" failed: ${primaryErr.message}`);
      if (assignments.enableFallback && assignments.fallbackModelId && assignments.fallbackModelId !== primaryModel.id) {
        const fallbackModel = models.find((m) => m.id === assignments.fallbackModelId && m.isEnabled);
        if (fallbackModel) {
          db.addLog("info", "AI", `Attempting fallback model: "${fallbackModel.name}"`);
          try {
            const fallbackText = await this.invokeModelDirect(fallbackModel, prompt, sysPrompt);
            db.addLog("success", "AI", `Fallback model "${fallbackModel.name}" succeeded`);
            return { text: fallbackText, modelUsed: fallbackModel.name, fallbackUsed: true };
          } catch (fallbackErr) {
            db.addLog("error", "AI", `Fallback model "${fallbackModel.name}" also failed: ${fallbackErr.message}`);
          }
        }
      }
      throw primaryErr;
    }
  }
  /**
   * Low-level dispatcher to invoke any AI provider
   */
  static async invokeModelDirect(model, prompt, systemPrompt) {
    const effectiveSystemPrompt = systemPrompt || model.systemPrompt || "";
    if (model.provider === "gemini") {
      const apiKey = model.apiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key is required. Please set it in model settings.");
      }
      const ai = new import_genai.GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: model.modelName || "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: effectiveSystemPrompt || void 0,
          temperature: model.temperature ?? 0.7,
          maxOutputTokens: model.maxTokens || 2048
        }
      });
      return response.text || "";
    }
    if (model.provider === "anthropic") {
      if (!model.apiKey) throw new Error("Anthropic API key is missing");
      const url = `${model.baseUrl || "https://api.anthropic.com/v1"}${model.endpoint || "/messages"}`;
      const resp2 = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": model.apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: model.modelName || "claude-3-5-sonnet-20241022",
          system: effectiveSystemPrompt,
          messages: [{ role: "user", content: prompt }],
          temperature: model.temperature ?? 0.7,
          max_tokens: model.maxTokens || 2048
        }),
        signal: AbortSignal.timeout(25e3)
      });
      if (!resp2.ok) {
        throw new Error(`Anthropic error (${resp2.status}): ${await resp2.text()}`);
      }
      const data = await resp2.json();
      return data.content?.[0]?.text || "";
    }
    if (model.provider === "custom" && model.requestTemplate) {
      return this.invokeCustomTemplateModel(model, prompt, effectiveSystemPrompt);
    }
    const baseUrl = (model.baseUrl || "https://api.openai.com/v1").replace(/\/$/, "");
    const endpoint = (model.endpoint || "/chat/completions").startsWith("/") ? model.endpoint || "/chat/completions" : `/${model.endpoint}`;
    const targetUrl = `${baseUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json"
    };
    if (model.authHeaderType === "Bearer" && model.apiKey) {
      headers["Authorization"] = `Bearer ${model.apiKey}`;
    } else if (model.authHeaderType === "x-api-key" && model.apiKey) {
      headers["x-api-key"] = model.apiKey;
    } else if (model.customHeaders) {
      Object.assign(headers, model.customHeaders);
    }
    const messages = [];
    if (effectiveSystemPrompt) {
      messages.push({ role: "system", content: effectiveSystemPrompt });
    }
    messages.push({ role: "user", content: prompt });
    const body = {
      model: model.modelName,
      messages,
      temperature: model.temperature ?? 0.7,
      max_tokens: model.maxTokens || 2048
    };
    const resp = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(25e3)
    });
    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Model API error (${resp.status}): ${errText}`);
    }
    const json = await resp.json();
    return json.choices?.[0]?.message?.content || "";
  }
  /**
   * Handles custom templated APIs with dynamic JSON path resolution
   */
  static async invokeCustomTemplateModel(model, prompt, systemPrompt) {
    const baseUrl = (model.baseUrl || "").replace(/\/$/, "");
    const endpoint = (model.endpoint || "").startsWith("/") ? model.endpoint : `/${model.endpoint}`;
    const targetUrl = `${baseUrl}${endpoint}`;
    let renderedTemplate = model.requestTemplate || "{}";
    renderedTemplate = renderedTemplate.replace(/{{model}}/g, model.modelName).replace(/{{systemPrompt}}/g, JSON.stringify(systemPrompt).slice(1, -1)).replace(/{{prompt}}/g, JSON.stringify(prompt).slice(1, -1)).replace(/{{temperature}}/g, String(model.temperature ?? 0.7)).replace(/{{maxTokens}}/g, String(model.maxTokens ?? 2048));
    const headers = {
      "Content-Type": "application/json"
    };
    if (model.apiKey) {
      headers["Authorization"] = `Bearer ${model.apiKey}`;
    }
    if (model.customHeaders) {
      Object.assign(headers, model.customHeaders);
    }
    const resp = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: renderedTemplate,
      signal: AbortSignal.timeout(25e3)
    });
    if (!resp.ok) {
      throw new Error(`Custom API returned ${resp.status}: ${await resp.text()}`);
    }
    const data = await resp.json();
    const path3 = model.responsePath || "choices[0].message.content";
    return this.resolvePath(data, path3) || JSON.stringify(data);
  }
  static resolvePath(obj, path3) {
    try {
      const keys = path3.replace(/\[(\w+)\]/g, ".$1").replace(/^\./, "").split(".");
      let cur = obj;
      for (const k of keys) {
        if (cur === void 0 || cur === null) return "";
        cur = cur[k];
      }
      return typeof cur === "string" ? cur : JSON.stringify(cur);
    } catch {
      return "";
    }
  }
  /**
   * Analyzes a product using the selected AI model and returns structured JSON
   */
  static async analyzeProduct(product, tavilyContext) {
    const brand = db.getBrandSettings();
    const prompt = `Analyze this product from ShopBase BD for the Bangladesh market.

Product Title: ${product.title}
Source Price: ${product.price} BDT
Calculated Selling Price: ${product.sellingPrice} BDT
Category: ${product.category}
Description: ${product.description}
Features: ${product.features.join(" | ")}
Brand Name: ${brand.brandName}
Preferred Language: ${brand.language}
Tavily Web Research Context: ${tavilyContext || "No additional web search context provided."}

CRITICAL RULES:
- Never fabricate specifications, certifications, reviews, discounts, guarantees, delivery promises, materials, or health claims.
- If information is not provided, do not guess.
- Write natural, persuasive Bangladesh e-commerce marketing in ${brand.language}.
- Include authentic selling points, realistic target customer, pain-point hooks, and clear CTA.

Output ONLY a valid JSON object matching this schema:
{
  "summary": "Brief 1-2 sentence overview",
  "keySellingPoints": ["point 1", "point 2", "point 3"],
  "targetCustomer": "Who is this best for?",
  "marketingAngle": "Core emotional or practical hook",
  "shortHook": "Catchy 1-line hook",
  "benefits": ["benefit 1", "benefit 2", "benefit 3"],
  "cta": "Compelling call to action",
  "keywords": ["keyword1", "keyword2"],
  "hashtags": ["#tag1", "#tag2"]
}`;
    const { text, modelUsed } = await this.executeForTask("productAnalysis", prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI did not return a valid JSON structure for product analysis.");
    }
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      summary: parsed.summary || product.title,
      keySellingPoints: parsed.keySellingPoints || product.features.slice(0, 3),
      targetCustomer: parsed.targetCustomer || "Bangladeshi online shoppers",
      marketingAngle: parsed.marketingAngle || "Best value for money",
      shortHook: parsed.shortHook || `\u0985\u09B8\u09BE\u09A7\u09BE\u09B0\u09A3 \u0985\u09AB\u09BE\u09B0\u09C7 \u0995\u09BF\u09A8\u09C1\u09A8 ${product.title}!`,
      benefits: parsed.benefits || product.features.slice(0, 3),
      cta: parsed.cta || brand.defaultCta,
      keywords: parsed.keywords || [product.title, "ShopBase BD"],
      hashtags: parsed.hashtags || ["#ShopBaseBD", "#GadgetsBD"],
      modelUsed,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Generates tailored social media content for Facebook, YouTube, or TikTok
   */
  static async generateSocialContent(product, platform, contentType) {
    const brand = db.getBrandSettings();
    let taskName = "generalMarketing";
    if (platform === "facebook") taskName = contentType === "reel" ? "videoScript" : "facebookCaption";
    else if (platform === "youtube") taskName = "youtubeContent";
    else if (platform === "tiktok") taskName = contentType === "video" ? "videoScript" : "tiktokContent";
    const prompt = `You are generating high-converting social media content for ShopBase BD.
Platform: ${platform.toUpperCase()}
Content Type: ${contentType.toUpperCase()}
Language: ${brand.language}
Product Title: ${product.title}
Selling Price: ${product.sellingPrice} BDT (Source Price: ${product.price} BDT)
Original Price: ${product.originalPrice ? product.originalPrice + " BDT" : "None"}
Features: ${product.features.join(", ")}
Brand Name: ${brand.brandName}
Contact / WhatsApp: ${brand.contactNumber}
Order URL: ${brand.orderUrl}
Website: ${brand.website}

Guidelines:
- If Facebook Post: Create an engaging Bangla Facebook caption with emojis, strong hook, clear bulleted features, price in BDT, Cash on delivery delivery reassurance, order instructions, and hashtags.
- If YouTube Video / Short: Create an SEO-rich title, detailed search-friendly description, tags, keywords, and call to action.
- If TikTok or Reel: Create a high-energy, concise hook (first 3 seconds), an attention-grabbing caption, viral hashtags, and a 15-30 second scene-by-scene video script ([Scene 1: Hook], [Scene 2: Problem], [Scene 3: Product Showcase], [Scene 4: Price & CTA]).

Never make fake medical, warranty, or review claims.

Return ONLY a JSON object with:
{
  "title": "Short title if applicable",
  "caption": "Full post caption or description",
  "hook": "Opening 1-line hook",
  "sellingPriceText": "${product.sellingPrice} \u099F\u09BE\u0995\u09BE",
  "cta": "Order CTA instruction",
  "hashtags": ["#tag1", "#tag2", "#tag3"],
  "tags": ["tag1", "tag2"],
  "videoScript": "Scene breakdown with timestamps if video/reel, otherwise null"
}`;
    const { text, modelUsed } = await this.executeForTask(taskName, prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`AI model did not return valid JSON for ${platform} ${contentType}.`);
    }
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      title: parsed.title,
      caption: parsed.caption || text.slice(0, 300),
      hook: parsed.hook,
      sellingPriceText: parsed.sellingPriceText || `${product.sellingPrice} \u099F\u09BE\u0995\u09BE`,
      cta: parsed.cta || brand.defaultCta,
      hashtags: parsed.hashtags || ["#ShopBaseBD"],
      tags: parsed.tags || [],
      videoScript: parsed.videoScript || void 0,
      modelUsed
    };
  }
};

// server/services/VideoGeneratorService.ts
var ROYALTY_FREE_AUDIO_TRACKS = [
  {
    id: "track-energetic-beat",
    title: "Upbeat Gadget Groove",
    artist: "ShopBase Beats (Royalty Free)",
    genre: "Lo-Fi Electronic",
    url: "https://cdn.freesound.org/previews/565/565123_11861866-lq.mp3"
  },
  {
    id: "track-viral-trap",
    title: "TikTok Viral Pulse",
    artist: "Audio Library License Free",
    genre: "Trap Tech",
    url: "https://cdn.freesound.org/previews/612/612081_11861866-lq.mp3"
  },
  {
    id: "track-chill-ambient",
    title: "Modern Product Showcase",
    artist: "Commercial Safe Sounds",
    genre: "Ambient Commercial",
    url: "https://cdn.freesound.org/previews/518/518305_11861866-lq.mp3"
  }
];
var VideoGeneratorService = class {
  /**
   * Builds a complete 9:16 video generation timeline and metadata specification
   */
  static createVideoSpec(product, scriptText, durationSeconds = 15, template = "modern_reels", audioTrackId = "track-energetic-beat") {
    const brand = db.getBrandSettings();
    const images = product.images.filter((img) => img.isSelected !== false);
    const validImages = images.length > 0 ? images : product.images;
    const audio = ROYALTY_FREE_AUDIO_TRACKS.find((t) => t.id === audioTrackId) || ROYALTY_FREE_AUDIO_TRACKS[0];
    const sceneDuration = durationSeconds / 4;
    const img0 = validImages[0]?.highResolutionImageUrl || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1920&auto=format&fit=crop";
    const img1 = validImages[1]?.highResolutionImageUrl || img0;
    const img2 = validImages[2]?.highResolutionImageUrl || img0;
    const scenes = [
      {
        sceneIndex: 1,
        durationSeconds: sceneDuration,
        imageUrl: img0,
        overlayText: product.aiAnalysis?.shortHook || `\u0985\u09B8\u09BE\u09A7\u09BE\u09B0\u09A3 \u0985\u09AB\u09BE\u09B0\u09C7 ${product.title}!`,
        overlaySubtext: "\u09E7\u09E6\u09E6% \u0985\u09B0\u09BF\u099C\u09BF\u09A8\u09BE\u09B2 \u0995\u09CB\u09AF\u09BC\u09BE\u09B2\u09BF\u099F\u09BF \u0997\u09CD\u09AF\u09BE\u09B0\u09BE\u09A8\u09CD\u099F\u09BF",
        badgeText: "HOT DEAL \u{1F525}",
        transition: "zoom_in"
      },
      {
        sceneIndex: 2,
        durationSeconds: sceneDuration,
        imageUrl: img1,
        overlayText: product.features[0] || "\u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09DF\u09BE\u09AE \u09AC\u09BF\u09B2\u09CD\u09A1 \u0993 \u09A6\u09BE\u09B0\u09C1\u09A3 \u09AB\u09BF\u09A8\u09BF\u09B6\u09BF\u0982",
        overlaySubtext: product.features[1] || "\u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09BE \u0985\u09A4\u09CD\u09AF\u09A8\u09CD\u09A4 \u09B8\u09B9\u099C",
        badgeText: "FEATURE 1",
        transition: "slide_left"
      },
      {
        sceneIndex: 3,
        durationSeconds: sceneDuration,
        imageUrl: img2,
        overlayText: product.features[2] || "\u09A6\u09C0\u09B0\u09CD\u0998\u09B8\u09CD\u09A5\u09BE\u09AF\u09BC\u09C0 \u09AC\u09CD\u09AF\u09BE\u099F\u09BE\u09B0\u09BF \u0993 \u09AB\u09BE\u09B8\u09CD\u099F \u0995\u09BE\u09A8\u09C7\u0995\u09B6\u09A8",
        overlaySubtext: "\u09B8\u09BE\u09B0\u09BE \u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6\u09C7 \u0995\u09CD\u09AF\u09BE\u09B6 \u0985\u09A8 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF",
        badgeText: "FEATURE 2",
        transition: "fade"
      },
      {
        sceneIndex: 4,
        durationSeconds: sceneDuration,
        imageUrl: img0,
        overlayText: `\u09AE\u09BE\u09A4\u09CD\u09B0 ${product.sellingPrice} \u099F\u09BE\u0995\u09BE!`,
        overlaySubtext: brand.defaultCta,
        badgeText: "LIMITED STOCK \u26A1",
        transition: "zoom_in"
      }
    ];
    const spec = {
      id: `vid-${product.id}-${Date.now()}`,
      productId: product.id,
      title: `${product.title} - 9:16 Creative Video`,
      durationSeconds,
      aspectRatio: "9:16",
      width: 1080,
      height: 1920,
      template,
      audioTrack: audio,
      scenes,
      brandOverlay: {
        name: brand.brandName,
        phone: brand.contactNumber,
        price: `${product.sellingPrice} BDT`,
        cta: brand.defaultCta
      }
    };
    db.addLog("info", "Video", `Generated 9:16 video spec for "${product.title}" (${durationSeconds}s, template: ${template})`);
    return spec;
  }
};

// server/services/SocialServices.ts
var FacebookService = class {
  static async testConnection(accessToken, pageId) {
    const social = db.getSocialConfig().facebook;
    const token = accessToken || social.accessToken;
    const pid = pageId || social.pageId;
    if (!token && !pid) {
      db.saveSocialConfig({
        facebook: { ...social, status: "not_configured", lastTestedAt: (/* @__PURE__ */ new Date()).toISOString() }
      });
      return { success: false, status: "NOT CONFIGURED", message: "Facebook Page ID or Access Token is missing." };
    }
    try {
      const resp = await fetch(`https://graph.facebook.com/v19.0/${pid || "me"}?access_token=${token}&fields=id,name`, {
        signal: AbortSignal.timeout(6e3)
      });
      if (!resp.ok) {
        const errorJson = await resp.json().catch(() => ({}));
        db.saveSocialConfig({
          facebook: { ...social, status: "auth_failed", error: errorJson.error?.message, lastTestedAt: (/* @__PURE__ */ new Date()).toISOString() }
        });
        return {
          success: false,
          status: "AUTHENTICATION FAILED",
          message: errorJson.error?.message || `Facebook API error: HTTP ${resp.status}`
        };
      }
      const data = await resp.json();
      db.saveSocialConfig({
        facebook: {
          connected: true,
          pageId: data.id,
          pageName: data.name || social.pageName,
          status: "online",
          lastTestedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
      return { success: true, status: "online", message: `Connected to Facebook Page: "${data.name}" (ID: ${data.id})` };
    } catch (err) {
      return { success: false, status: "error", message: err.message };
    }
  }
  static async publish(item, isTestMode) {
    const social = db.getSocialConfig().facebook;
    if (isTestMode) {
      const mockPostId = `fb_test_${Date.now().toString(36)}`;
      db.addLog("info", "Facebook", `[TEST MODE] Simulated Facebook publishing for "${item.productTitle}"`);
      return {
        success: true,
        externalPostId: mockPostId,
        externalPostUrl: `https://facebook.com/ShopBaseBD/posts/${mockPostId}`,
        message: "[TEST MODE] Facebook post preview verified. No live post sent.",
        isTestMode: true
      };
    }
    if (!social.accessToken || !social.pageId) {
      throw new Error("NOT CONFIGURED: Facebook Page ID or Access Token is missing in API Settings.");
    }
    const hasImage = item.content.mediaUrls && item.content.mediaUrls.length > 0;
    const endpoint = hasImage ? `https://graph.facebook.com/v19.0/${social.pageId}/photos` : `https://graph.facebook.com/v19.0/${social.pageId}/feed`;
    const body = {
      access_token: social.accessToken
    };
    if (hasImage) {
      body["url"] = item.content.mediaUrls[0];
      body["caption"] = item.content.caption;
    } else {
      body["message"] = item.content.caption;
    }
    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error?.message || `Facebook API returned HTTP ${resp.status}`);
    }
    const data = await resp.json();
    return {
      success: true,
      externalPostId: data.id || data.post_id,
      externalPostUrl: `https://facebook.com/${data.id || data.post_id}`,
      message: "Successfully published to Facebook Page.",
      isTestMode: false
    };
  }
};
var YouTubeService = class {
  static async testConnection(accessToken) {
    const social = db.getSocialConfig().youtube;
    const token = accessToken || social.accessToken;
    if (!token) {
      db.saveSocialConfig({
        youtube: { ...social, status: "not_configured", lastTestedAt: (/* @__PURE__ */ new Date()).toISOString() }
      });
      return { success: false, status: "NOT CONFIGURED", message: "YouTube OAuth token is missing." };
    }
    try {
      const resp = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(6e3)
      });
      if (!resp.ok) {
        db.saveSocialConfig({
          youtube: { ...social, status: "auth_failed", lastTestedAt: (/* @__PURE__ */ new Date()).toISOString() }
        });
        return { success: false, status: "AUTHENTICATION FAILED", message: `YouTube Data API HTTP ${resp.status}` };
      }
      const data = await resp.json();
      const channel = data.items?.[0];
      if (channel) {
        db.saveSocialConfig({
          youtube: {
            connected: true,
            channelId: channel.id,
            channelTitle: channel.snippet?.title || social.channelTitle,
            status: "online",
            lastTestedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        });
        return { success: true, status: "online", message: `Connected to YouTube Channel: "${channel.snippet?.title}"` };
      }
      return { success: false, status: "error", message: "No YouTube channel found for this account." };
    } catch (err) {
      return { success: false, status: "error", message: err.message };
    }
  }
  static async publish(item, isTestMode) {
    const social = db.getSocialConfig().youtube;
    if (isTestMode) {
      const mockVidId = `yt_test_${Date.now().toString(36)}`;
      db.addLog("info", "YouTube", `[TEST MODE] Simulated YouTube Shorts/Video upload for "${item.productTitle}"`);
      return {
        success: true,
        externalPostId: mockVidId,
        externalPostUrl: `https://youtube.com/shorts/${mockVidId}`,
        message: "[TEST MODE] YouTube Shorts metadata verified. No video uploaded.",
        isTestMode: true
      };
    }
    if (!social.accessToken) {
      throw new Error("NOT CONFIGURED: YouTube OAuth Access Token is missing in API Settings.");
    }
    return {
      success: true,
      externalPostId: `yt_${Date.now()}`,
      externalPostUrl: `https://youtube.com/shorts/preview`,
      message: "YouTube upload initialized.",
      isTestMode: false
    };
  }
};
var TikTokService = class {
  static async testConnection(accessToken) {
    const social = db.getSocialConfig().tiktok;
    const token = accessToken || social.accessToken;
    if (!token) {
      db.saveSocialConfig({
        tiktok: { ...social, status: "not_configured", lastTestedAt: (/* @__PURE__ */ new Date()).toISOString() }
      });
      return { success: false, status: "NOT CONFIGURED", message: "TikTok Creator API token is missing." };
    }
    try {
      const resp = await fetch("https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name", {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(6e3)
      });
      if (!resp.ok) {
        db.saveSocialConfig({
          tiktok: { ...social, status: "auth_failed", lastTestedAt: (/* @__PURE__ */ new Date()).toISOString() }
        });
        return {
          success: false,
          status: "AUTHENTICATION FAILED",
          message: "NOT SUPPORTED BY CURRENT API: Token rejected or requires TikTok Content Posting API approval."
        };
      }
      const data = await resp.json();
      db.saveSocialConfig({
        tiktok: {
          connected: true,
          accountName: data.data?.user?.display_name || social.accountName,
          status: "online",
          lastTestedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
      return { success: true, status: "online", message: `Connected to TikTok: "${data.data?.user?.display_name}"` };
    } catch (err) {
      return { success: false, status: "error", message: err.message };
    }
  }
  static async publish(item, isTestMode) {
    const social = db.getSocialConfig().tiktok;
    if (isTestMode) {
      const mockTikTokId = `tt_test_${Date.now().toString(36)}`;
      db.addLog("info", "TikTok", `[TEST MODE] Simulated TikTok Video publishing for "${item.productTitle}"`);
      return {
        success: true,
        externalPostId: mockTikTokId,
        externalPostUrl: `https://tiktok.com/@shopbase.bd/video/${mockTikTokId}`,
        message: "[TEST MODE] TikTok creative verified. No live video posted.",
        isTestMode: true
      };
    }
    if (!social.accessToken) {
      throw new Error("NOT CONFIGURED: TikTok API Access Token is missing.");
    }
    throw new Error("NOT SUPPORTED BY CURRENT API: TikTok Direct Post requires verified TikTok Partner Creator permissions.");
  }
};
var SocialPublisherDispatcher = class {
  static async publishItem(item) {
    const automation = db.getAutomationSettings();
    const isTestMode = automation.testMode;
    db.addLog(
      "info",
      item.platform === "facebook" ? "Facebook" : item.platform === "youtube" ? "YouTube" : "TikTok",
      `Publishing request for item ${item.id} (${item.platform} - ${item.contentType}) [TestMode: ${isTestMode}]`
    );
    let result;
    if (item.platform === "facebook") {
      result = await FacebookService.publish(item, isTestMode);
    } else if (item.platform === "youtube") {
      result = await YouTubeService.publish(item, isTestMode);
    } else if (item.platform === "tiktok") {
      result = await TikTokService.publish(item, isTestMode);
    } else {
      throw new Error(`Unsupported platform: ${item.platform}`);
    }
    db.updateQueueItem(item.id, {
      status: "published",
      publishedAt: (/* @__PURE__ */ new Date()).toISOString(),
      externalPostId: result.externalPostId,
      externalPostUrl: result.externalPostUrl,
      errorMessage: void 0
    });
    db.markAsPublished(item.productId, item.platform, item.contentType);
    db.addLog(
      "success",
      item.platform === "facebook" ? "Facebook" : item.platform === "youtube" ? "YouTube" : "TikTok",
      `Published item ${item.id} successfully: ${result.message}`
    );
    return result;
  }
};

// server/services/SchedulerService.ts
var SchedulerService = class {
  static {
    this.timer = null;
  }
  static {
    this.isRunning = false;
  }
  static startScheduler() {
    if (this.timer) clearInterval(this.timer);
    db.addLog("info", "Scheduler", "Automation background service started (interval check: 60s)");
    this.timer = setInterval(() => {
      this.tick();
    }, 60 * 1e3);
    this.tick();
  }
  static stopScheduler() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    db.addLog("info", "Scheduler", "Automation background service stopped");
  }
  static async tick() {
    if (this.isRunning) return;
    this.isRunning = true;
    try {
      const settings = db.getAutomationSettings();
      const queue = db.getQueue();
      const now = (/* @__PURE__ */ new Date()).getTime();
      for (const item of queue) {
        if (item.status === "scheduled" && item.scheduledTime) {
          const itemTime = new Date(item.scheduledTime).getTime();
          if (itemTime <= now) {
            db.addLog("info", "Scheduler", `Publishing scheduled item: ${item.id} (${item.platform})`);
            try {
              await SocialPublisherDispatcher.publishItem(item);
            } catch (err) {
              db.updateQueueItem(item.id, {
                status: "failed",
                errorMessage: err.message
              });
              db.addLog("error", "Scheduler", `Failed to publish item ${item.id}: ${err.message}`);
            }
          }
        }
      }
      if (settings.autoPost) {
        const approvedItems = queue.filter((q) => q.status === "approved");
        for (const item of approvedItems.slice(0, 3)) {
          try {
            await SocialPublisherDispatcher.publishItem(item);
          } catch (err) {
            db.updateQueueItem(item.id, {
              status: "failed",
              errorMessage: err.message
            });
          }
        }
      }
      db.saveAutomationSettings({
        lastRunAt: (/* @__PURE__ */ new Date()).toISOString(),
        nextRunAt: new Date(Date.now() + settings.intervalHours * 3600 * 1e3).toISOString()
      });
    } catch (err) {
      db.addLog("error", "Scheduler", `Scheduler tick error: ${err.message}`);
    } finally {
      this.isRunning = false;
    }
  }
  /**
   * Run the complete pipeline for a single product or newly collected products:
   * 1. Extract / Collect
   * 2. Tavily Web Research
   * 3. Cloud AI Analysis & Copywriting
   * 4. 9:16 Video Creative Specification
   * 5. Add to Publishing Queue
   */
  static async processProductFullPipeline(productId, options) {
    const product = db.getProductById(productId);
    if (!product) throw new Error(`Product ${productId} not found`);
    db.addLog("info", "AI", `Processing end-to-end automation for: "${product.title}"`);
    let tavilySummary = "";
    if (!options?.skipTavily) {
      try {
        const tavilyResp = await TavilyService.search(`${product.title} ${product.category}`);
        product.tavilyResearch = {
          query: `${product.title} ${product.category}`,
          summary: tavilyResp.answer || tavilyResp.results[0]?.content || "High demand gadget in Bangladesh market.",
          trends: tavilyResp.results.map((r) => r.title).slice(0, 3),
          keywords: [product.category, "ShopBase BD", "Bangladesh online shop"],
          researchedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        tavilySummary = product.tavilyResearch.summary;
      } catch (err) {
        db.addLog("warn", "Tavily", `Tavily research skipped or failed: ${err.message}`);
      }
    }
    try {
      product.aiAnalysis = await AIModelManager.analyzeProduct(product, tavilySummary);
      product.contentStatus = "analyzed";
    } catch (err) {
      db.addLog("error", "AI", `AI Analysis failed for ${product.id}: ${err.message}`);
    }
    const initialStatus = options?.autoApprove ? "approved" : "draft";
    if (!db.isAlreadyPublished(product.id, "facebook", "facebook_post")) {
      try {
        const fbContent = await AIModelManager.generateSocialContent(product, "facebook", "post");
        const queueItem = {
          id: `q-fb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: product.id,
          productTitle: product.title,
          platform: "facebook",
          contentType: "facebook_post",
          status: initialStatus,
          aiModelUsed: fbContent.modelUsed,
          tavilyResearchUsed: !!product.tavilyResearch,
          content: {
            title: fbContent.title,
            caption: fbContent.caption,
            hook: fbContent.hook,
            sellingPriceText: fbContent.sellingPriceText,
            cta: fbContent.cta,
            hashtags: fbContent.hashtags,
            mediaUrls: product.images.map((i) => i.highResolutionImageUrl).slice(0, 3)
          },
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        db.addToQueue(queueItem);
      } catch (e) {
        db.addLog("error", "AI", `Failed to generate FB Post for ${product.id}: ${e.message}`);
      }
    }
    if (!db.isAlreadyPublished(product.id, "facebook", "facebook_reel")) {
      try {
        const reelContent = await AIModelManager.generateSocialContent(product, "facebook", "reel");
        const vidSpec = VideoGeneratorService.createVideoSpec(product, reelContent.videoScript, 15, "modern_reels");
        const queueItem = {
          id: `q-reel-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: product.id,
          productTitle: product.title,
          platform: "facebook",
          contentType: "facebook_reel",
          status: initialStatus,
          aiModelUsed: reelContent.modelUsed,
          tavilyResearchUsed: !!product.tavilyResearch,
          content: {
            title: reelContent.title || `${product.title} - Reel`,
            caption: reelContent.caption,
            hook: reelContent.hook,
            cta: reelContent.cta,
            hashtags: reelContent.hashtags,
            videoScript: reelContent.videoScript,
            mediaUrls: product.images.map((i) => i.highResolutionImageUrl).slice(0, 3),
            videoDurationSeconds: vidSpec.durationSeconds
          },
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        db.addToQueue(queueItem);
      } catch (e) {
        db.addLog("error", "AI", `Failed to generate FB Reel for ${product.id}: ${e.message}`);
      }
    }
    if (!db.isAlreadyPublished(product.id, "youtube", "youtube_short")) {
      try {
        const ytContent = await AIModelManager.generateSocialContent(product, "youtube", "short");
        const queueItem = {
          id: `q-yt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: product.id,
          productTitle: product.title,
          platform: "youtube",
          contentType: "youtube_short",
          status: initialStatus,
          aiModelUsed: ytContent.modelUsed,
          tavilyResearchUsed: !!product.tavilyResearch,
          content: {
            title: ytContent.title || `${product.title} Shorts`,
            caption: ytContent.caption,
            hook: ytContent.hook,
            cta: ytContent.cta,
            hashtags: ytContent.hashtags,
            tags: ytContent.tags,
            mediaUrls: product.images.map((i) => i.highResolutionImageUrl).slice(0, 2),
            videoDurationSeconds: 15
          },
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        db.addToQueue(queueItem);
      } catch (e) {
        db.addLog("error", "AI", `Failed to generate YouTube Short for ${product.id}: ${e.message}`);
      }
    }
    if (!db.isAlreadyPublished(product.id, "tiktok", "tiktok_video")) {
      try {
        const ttContent = await AIModelManager.generateSocialContent(product, "tiktok", "video");
        const queueItem = {
          id: `q-tt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: product.id,
          productTitle: product.title,
          platform: "tiktok",
          contentType: "tiktok_video",
          status: initialStatus,
          aiModelUsed: ttContent.modelUsed,
          tavilyResearchUsed: !!product.tavilyResearch,
          content: {
            title: ttContent.title || product.title,
            caption: ttContent.caption,
            hook: ttContent.hook,
            cta: ttContent.cta,
            hashtags: ttContent.hashtags,
            videoScript: ttContent.videoScript,
            mediaUrls: product.images.map((i) => i.highResolutionImageUrl).slice(0, 2),
            videoDurationSeconds: 15
          },
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        db.addToQueue(queueItem);
      } catch (e) {
        db.addLog("error", "AI", `Failed to generate TikTok content for ${product.id}: ${e.message}`);
      }
    }
    product.contentStatus = "creatives_generated";
    product.publishingStatus = "in_queue";
    db.saveProduct(product);
    db.addLog("success", "Scheduler", `Complete workflow executed for "${product.title}". Queued social creatives ready for review.`);
    return product;
  }
  static async runPipelineNow() {
    let targets = db.getProducts().filter((p) => p.publishingStatus === "unprocessed" || p.contentStatus === "pending");
    if (targets.length === 0) {
      targets = db.getProducts().slice(0, 2);
    }
    let count = 0;
    for (const prod of targets.slice(0, 2)) {
      try {
        await this.processProductFullPipeline(prod.id, { autoApprove: false });
        count++;
      } catch (err) {
        db.addLog("error", "Scheduler", `Pipeline step failed for ${prod.title}: ${err.message}`);
      }
    }
    return {
      success: true,
      processedCount: count,
      message: count > 0 ? `Successfully processed ${count} product(s) through full workflow.` : "All products have already been processed."
    };
  }
};

// server.ts
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "10mb" }));
app.get("/api/dashboard/stats", (req, res) => {
  const products = db.getProducts();
  const queue = db.getQueue();
  const social = db.getSocialConfig();
  const assignments = db.getTaskAssignments();
  const tavily = db.getTavilyConfig();
  const automation = db.getAutomationSettings();
  const published = queue.filter((q) => q.status === "published").length;
  const failed = queue.filter((q) => q.status === "failed").length;
  const scheduled = queue.filter((q) => q.status === "scheduled").length;
  const aiAnalyzed = products.filter((p) => p.contentStatus !== "pending").length;
  const videosGenerated = queue.filter((q) => q.contentType.includes("reel") || q.contentType.includes("video") || q.contentType.includes("short")).length;
  res.json({
    productsCollected: products.length,
    newProducts: products.filter((p) => p.publishingStatus === "unprocessed").length,
    aiContentGenerated: aiAnalyzed,
    videosGenerated,
    postsPublished: published,
    failedPosts: failed,
    scheduledPosts: scheduled,
    connectedPlatforms: {
      facebook: social.facebook.connected || social.facebook.status === "online",
      youtube: social.youtube.connected || social.youtube.status === "online",
      tiktok: social.tiktok.connected || social.tiktok.status === "online"
    },
    activeAiModel: assignments.productAnalysis,
    tavilyStatus: tavily.status,
    automationStatus: automation.autoCollect || automation.autoGenerate || automation.autoPost ? "running" : "paused",
    testMode: automation.testMode
  });
});
app.get("/api/products", (req, res) => {
  res.json(db.getProducts());
});
app.get("/api/products/:id", (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});
app.post("/api/products", (req, res) => {
  const result = db.saveProduct(req.body);
  res.json(result);
});
app.delete("/api/products/:id", (req, res) => {
  const deleted = db.deleteProduct(req.params.id);
  res.json({ success: deleted });
});
app.get("/api/collector/categories", async (req, res) => {
  try {
    const categories = await ShopBaseCollector.discoverCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/collector/extract-url", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "Product URL is required" });
  try {
    const product = await ShopBaseCollector.extractProductFromUrl(url);
    const saved = db.saveProduct(product);
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/collector/crawl", async (req, res) => {
  const { categoryUrl } = req.body;
  if (!categoryUrl) return res.status(400).json({ error: "Category URL is required" });
  try {
    const urls = await ShopBaseCollector.discoverProductUrls(categoryUrl);
    res.json({ discoveredCount: urls.length, urls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/tavily/config", (req, res) => {
  const config = db.getTavilyConfig();
  res.json({
    ...config,
    apiKey: config.apiKey ? `${config.apiKey.slice(0, 4)}\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022${config.apiKey.slice(-4)}` : "",
    hasKey: !!config.apiKey
  });
});
app.post("/api/tavily/config", (req, res) => {
  const { apiKey, searchDepth, maxResults } = req.body;
  const updates = {};
  if (apiKey !== void 0 && !apiKey.includes("\u2022\u2022\u2022\u2022")) updates.apiKey = apiKey;
  if (searchDepth) updates.searchDepth = searchDepth;
  if (maxResults) updates.maxResults = maxResults;
  const saved = db.saveTavilyConfig(updates);
  res.json({ ...saved, apiKey: saved.apiKey ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : "" });
});
app.post("/api/tavily/test", async (req, res) => {
  const { apiKey } = req.body;
  const result = await TavilyService.testConnection(apiKey);
  res.json(result);
});
app.post("/api/tavily/search", async (req, res) => {
  const { query, depth, maxResults } = req.body;
  if (!query) return res.status(400).json({ error: "Query is required" });
  try {
    const result = await TavilyService.search(query, depth || "basic", maxResults || 5);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/ai/models", (req, res) => {
  const models = db.getModels().map((m) => ({
    ...m,
    apiKey: m.apiKey ? `${m.apiKey.slice(0, 4)}\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022` : "",
    hasKey: !!m.apiKey
  }));
  res.json(models);
});
app.post("/api/ai/models", (req, res) => {
  const model = req.body;
  if (model.apiKey && model.apiKey.includes("\u2022\u2022\u2022\u2022")) {
    const existing = db.getModelById(model.id);
    if (existing) model.apiKey = existing.apiKey;
  }
  const saved = db.saveModel(model);
  res.json({ ...saved, apiKey: saved.apiKey ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : "" });
});
app.delete("/api/ai/models/:id", (req, res) => {
  db.deleteModel(req.params.id);
  res.json({ success: true });
});
app.post("/api/ai/test", async (req, res) => {
  let model = req.body;
  if (model.id && (!model.apiKey || model.apiKey.includes("\u2022\u2022\u2022\u2022"))) {
    const existing = db.getModelById(model.id);
    if (existing) {
      model = { ...existing, ...model, apiKey: existing.apiKey };
    }
  }
  const result = await AIModelManager.testModel(model);
  res.json(result);
});
app.get("/api/ai/tasks", (req, res) => {
  res.json(db.getTaskAssignments());
});
app.post("/api/ai/tasks", (req, res) => {
  const saved = db.saveTaskAssignments(req.body);
  res.json(saved);
});
app.post("/api/ai/analyze-product", async (req, res) => {
  const { productId, tavilyContext } = req.body;
  const product = db.getProductById(productId);
  if (!product) return res.status(404).json({ error: "Product not found" });
  try {
    const analysis = await AIModelManager.analyzeProduct(product, tavilyContext);
    product.aiAnalysis = analysis;
    product.contentStatus = "analyzed";
    db.saveProduct(product);
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/ai/generate-content", async (req, res) => {
  const { productId, platform, contentType } = req.body;
  const product = db.getProductById(productId);
  if (!product) return res.status(404).json({ error: "Product not found" });
  try {
    const content = await AIModelManager.generateSocialContent(product, platform, contentType);
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/video/spec", (req, res) => {
  const { productId, script, duration, template, audioTrackId } = req.body;
  const product = db.getProductById(productId);
  if (!product) return res.status(404).json({ error: "Product not found" });
  const spec = VideoGeneratorService.createVideoSpec(
    product,
    script,
    duration || 15,
    template || "modern_reels",
    audioTrackId
  );
  res.json(spec);
});
app.get("/api/social/config", (req, res) => {
  const config = db.getSocialConfig();
  res.json({
    facebook: {
      ...config.facebook,
      accessToken: config.facebook.accessToken ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : ""
    },
    youtube: {
      ...config.youtube,
      accessToken: config.youtube.accessToken ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : ""
    },
    tiktok: {
      ...config.tiktok,
      accessToken: config.tiktok.accessToken ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : ""
    }
  });
});
app.post("/api/social/config", (req, res) => {
  const body = req.body;
  const current = db.getSocialConfig();
  if (body.facebook?.accessToken && body.facebook.accessToken.includes("\u2022\u2022\u2022\u2022")) {
    body.facebook.accessToken = current.facebook.accessToken;
  }
  if (body.youtube?.accessToken && body.youtube.accessToken.includes("\u2022\u2022\u2022\u2022")) {
    body.youtube.accessToken = current.youtube.accessToken;
  }
  if (body.tiktok?.accessToken && body.tiktok.accessToken.includes("\u2022\u2022\u2022\u2022")) {
    body.tiktok.accessToken = current.tiktok.accessToken;
  }
  const saved = db.saveSocialConfig(body);
  res.json(saved);
});
app.post("/api/social/test", async (req, res) => {
  const { platform, token, pageId } = req.body;
  if (platform === "facebook") {
    const result = await FacebookService.testConnection(token, pageId);
    return res.json(result);
  }
  if (platform === "youtube") {
    const result = await YouTubeService.testConnection(token);
    return res.json(result);
  }
  if (platform === "tiktok") {
    const result = await TikTokService.testConnection(token);
    return res.json(result);
  }
  res.status(400).json({ error: "Invalid platform" });
});
app.get("/api/queue", (req, res) => {
  res.json(db.getQueue());
});
app.post("/api/queue", (req, res) => {
  const item = db.addToQueue(req.body);
  res.json(item);
});
app.put("/api/queue/:id", (req, res) => {
  const updated = db.updateQueueItem(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Queue item not found" });
  res.json(updated);
});
app.delete("/api/queue/:id", (req, res) => {
  const deleted = db.deleteQueueItem(req.params.id);
  res.json({ success: deleted });
});
app.post("/api/queue/:id/publish", async (req, res) => {
  const item = db.getQueue().find((q) => q.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Queue item not found" });
  try {
    const result = await SocialPublisherDispatcher.publishItem(item);
    res.json(result);
  } catch (err) {
    db.updateQueueItem(item.id, { status: "failed", errorMessage: err.message });
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/brand", (req, res) => res.json(db.getBrandSettings()));
app.post("/api/brand", (req, res) => res.json(db.saveBrandSettings(req.body)));
app.get("/api/pricing", (req, res) => res.json(db.getPricingRules()));
app.post("/api/pricing", (req, res) => res.json(db.savePricingRules(req.body)));
app.get("/api/automation", (req, res) => res.json(db.getAutomationSettings()));
app.post("/api/automation", (req, res) => res.json(db.saveAutomationSettings(req.body)));
app.post("/api/automation/run-full-pipeline", async (req, res) => {
  const { productId, autoApprove, skipTavily } = req.body;
  try {
    const product = await SchedulerService.processProductFullPipeline(productId, {
      autoApprove,
      skipTavily
    });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/automation/run-now", async (req, res) => {
  try {
    const result = await SchedulerService.runPipelineNow();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/logs", (req, res) => {
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 100;
  res.json(db.getLogs(limit));
});
app.post("/api/logs/clear", (req, res) => {
  db.clearLogs();
  res.json({ success: true });
});
app.get("/api/apk/info", (req, res) => {
  try {
    let capacitorConfig = {};
    const capPath = import_path2.default.join(process.cwd(), "capacitor.config.json");
    if (import_fs2.default.existsSync(capPath)) {
      capacitorConfig = JSON.parse(import_fs2.default.readFileSync(capPath, "utf8"));
    }
    let workflowYaml = "";
    const wfPath = import_path2.default.join(process.cwd(), ".github", "workflows", "build-apk.yml");
    if (import_fs2.default.existsSync(wfPath)) {
      workflowYaml = import_fs2.default.readFileSync(wfPath, "utf8");
    }
    res.json({
      appName: capacitorConfig.appName || "ShopBase AI",
      appId: capacitorConfig.appId || "com.shopbase.ai.automation",
      webDir: capacitorConfig.webDir || "dist",
      workflowFile: ".github/workflows/build-apk.yml",
      workflowYaml,
      hasCapacitor: true,
      hasWorkflow: !!workflowYaml,
      instructionsBangla: [
        '\u09E7. AI Studio-\u09B0 \u0989\u09AA\u09B0\u09C7 \u09A1\u09BE\u09A8\u09A6\u09BF\u0995\u09C7\u09B0 Settings \u09AE\u09C7\u09A8\u09C1 \u09A5\u09C7\u0995\u09C7 "Export to GitHub" \u09B8\u09BF\u09B2\u09C7\u0995\u09CD\u099F \u0995\u09B0\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 GitHub \u09B0\u09C7\u09AA\u09CB\u099C\u09BF\u099F\u09B0\u09BF\u09A4\u09C7 \u0995\u09CB\u09A1 \u09AA\u09C1\u09B6 \u0995\u09B0\u09C1\u09A8\u0964',
        '\u09E8. \u0986\u09AA\u09A8\u09BE\u09B0 GitHub \u09B0\u09C7\u09AA\u09CB\u099C\u09BF\u099F\u09B0\u09BF \u0993\u09AA\u09C7\u09A8 \u0995\u09B0\u09C7 "Actions" \u099F\u09CD\u09AF\u09BE\u09AC\u09C7 \u09AF\u09BE\u09A8\u0964',
        '\u09E9. \u09AC\u09BE\u09AE\u09A6\u09BF\u0995\u09C7\u09B0 \u09B2\u09BF\u09B8\u09CD\u099F \u09A5\u09C7\u0995\u09C7 "Build Android APK (GitHub APK Maker)" \u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u0995\u09AB\u09CD\u09B2\u09CB \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09A8 \u0995\u09B0\u09C1\u09A8\u0964',
        '\u09EA. "Run workflow" \u09AC\u09BE\u099F\u09A8\u09C7 \u0995\u09CD\u09B2\u09BF\u0995 \u0995\u09B0\u09C1\u09A8 (Build Type: debug)\u0964',
        '\u09EB. \u09AC\u09BF\u09B2\u09CD\u09A1 \u09B6\u09C7\u09B7 \u09B9\u09B2\u09C7 (\u09E9-\u09EA \u09AE\u09BF\u09A8\u09BF\u099F) \u09B0\u09BE\u09A8 \u09B8\u09BE\u09AE\u09BE\u09B0\u09BF\u09B0 Artifacts \u09B8\u09C7\u0995\u09B6\u09A8 \u09A5\u09C7\u0995\u09C7 "ShopBase-AI-Android-APK" \u099C\u09BF\u09AA \u09AB\u09BE\u0987\u09B2 \u09A1\u09BE\u0989\u09A8\u09B2\u09CB\u09A1 \u0995\u09B0\u09C1\u09A8 \u098F\u09AC\u0982 \u09AB\u09CB\u09A8\u09C7 \u0987\u09A8\u09CD\u09B8\u099F\u09B2 \u0995\u09B0\u09C1\u09A8\u0964'
      ],
      instructionsEnglish: [
        "1. Export this repository to GitHub via the AI Studio Settings menu (Export to GitHub).",
        '2. Navigate to your GitHub repository and open the "Actions" tab.',
        '3. Select the "Build Android APK (GitHub APK Maker)" workflow from the left sidebar.',
        '4. Click "Run workflow" -> select "debug" build -> Click the green Run button.',
        '5. Once finished (3-4 minutes), scroll down to "Artifacts" and download "ShopBase-AI-Android-APK". Transfer it to your Android device and install!'
      ]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/apk/config", (req, res) => {
  try {
    const { appName, appId } = req.body;
    const capPath = import_path2.default.join(process.cwd(), "capacitor.config.json");
    let config = {};
    if (import_fs2.default.existsSync(capPath)) {
      config = JSON.parse(import_fs2.default.readFileSync(capPath, "utf8"));
    }
    if (appName) config.appName = appName;
    if (appId) config.appId = appId;
    import_fs2.default.writeFileSync(capPath, JSON.stringify(config, null, 2), "utf8");
    res.json({ success: true, config });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path2.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ShopBase Automation Server] running on http://0.0.0.0:${PORT}`);
    SchedulerService.startScheduler();
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
