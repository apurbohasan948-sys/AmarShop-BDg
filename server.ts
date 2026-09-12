import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { db } from './server/db';
import { ShopBaseCollector } from './server/services/ShopBaseCollector';
import { TavilyService } from './server/services/TavilyService';
import { AIModelManager } from './server/services/AIModelManager';
import { OpenAICompatibleAdapter } from './server/services/adapters/OpenAICompatibleAdapter';
import { VideoGeneratorService } from './server/services/VideoGeneratorService';
import { FacebookService, YouTubeService, TikTokService, SocialPublisherDispatcher } from './server/services/SocialServices';
import { SchedulerService } from './server/services/SchedulerService';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// --- DASHBOARD STATS ---
app.get('/api/dashboard/stats', (req, res) => {
  const products = db.getProducts();
  const queue = db.getQueue();
  const social = db.getSocialConfig();
  const assignments = db.getTaskAssignments();
  const tavily = db.getTavilyConfig();
  const automation = db.getAutomationSettings();

  const published = queue.filter(q => q.status === 'published').length;
  const failed = queue.filter(q => q.status === 'failed').length;
  const scheduled = queue.filter(q => q.status === 'scheduled').length;
  const aiAnalyzed = products.filter(p => p.contentStatus !== 'pending').length;
  const videosGenerated = queue.filter(q => q.contentType.includes('reel') || q.contentType.includes('video') || q.contentType.includes('short')).length;

  res.json({
    productsCollected: products.length,
    newProducts: products.filter(p => p.publishingStatus === 'unprocessed').length,
    aiContentGenerated: aiAnalyzed,
    videosGenerated,
    postsPublished: published,
    failedPosts: failed,
    scheduledPosts: scheduled,
    connectedPlatforms: {
      facebook: social.facebook.connected || social.facebook.status === 'online',
      youtube: social.youtube.connected || social.youtube.status === 'online',
      tiktok: social.tiktok.connected || social.tiktok.status === 'online',
    },
    activeAiModel: assignments.productAnalysis,
    tavilyStatus: tavily.status,
    automationStatus: automation.autoCollect || automation.autoGenerate || automation.autoPost ? 'running' : 'paused',
    testMode: automation.testMode,
  });
});

// --- PRODUCTS ---
app.get('/api/products', (req, res) => {
  res.json(db.getProducts());
});

app.get('/api/products/:id', (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.post('/api/products', (req, res) => {
  const result = db.saveProduct(req.body);
  res.json(result);
});

app.delete('/api/products/:id', (req, res) => {
  const deleted = db.deleteProduct(req.params.id);
  res.json({ success: deleted });
});

// --- COLLECTOR ---
app.get('/api/collector/categories', async (req, res) => {
  try {
    const categories = await ShopBaseCollector.discoverCategories();
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/collector/extract-url', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Product URL is required' });

  try {
    const product = await ShopBaseCollector.extractProductFromUrl(url);
    const saved = db.saveProduct(product);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/collector/crawl', async (req, res) => {
  const { categoryUrl } = req.body;
  if (!categoryUrl) return res.status(400).json({ error: 'Category URL is required' });

  try {
    const urls = await ShopBaseCollector.discoverProductUrls(categoryUrl);
    res.json({ discoveredCount: urls.length, urls });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- TAVILY RESEARCH ---
app.get('/api/tavily/config', (req, res) => {
  const config = db.getTavilyConfig();
  // Mask API key for security
  res.json({
    ...config,
    apiKey: config.apiKey ? `${config.apiKey.slice(0, 4)}••••••••${config.apiKey.slice(-4)}` : '',
    hasKey: !!config.apiKey,
  });
});

app.post('/api/tavily/config', (req, res) => {
  const { apiKey, searchDepth, maxResults } = req.body;
  const updates: any = {};
  if (apiKey !== undefined && !apiKey.includes('••••')) updates.apiKey = apiKey;
  if (searchDepth) updates.searchDepth = searchDepth;
  if (maxResults) updates.maxResults = maxResults;

  const saved = db.saveTavilyConfig(updates);
  res.json({ ...saved, apiKey: saved.apiKey ? '••••••••' : '' });
});

app.post('/api/tavily/test', async (req, res) => {
  const { apiKey } = req.body;
  const result = await TavilyService.testConnection(apiKey);
  res.json(result);
});

app.post('/api/tavily/search', async (req, res) => {
  const { query, depth, maxResults } = req.body;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  try {
    const result = await TavilyService.search(query, depth || 'basic', maxResults || 5);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- CLOUD AI MODELS SYSTEM (OpenAI-Compatible & Custom Providers) ---
function maskApiKey(key?: string): string {
  if (!key) return '';
  const trimmed = key.trim();
  if (trimmed.length <= 4) return '••••••••';
  const last4 = trimmed.slice(-4);
  return `••••••••${last4}`;
}

function formatModelForClient(model: any) {
  const isConfigured = !!(model.apiKey && model.apiKey.trim());
  return {
    ...model,
    apiKey: isConfigured ? maskApiKey(model.apiKey) : '',
    apiKeyConfigured: isConfigured,
    hasKey: isConfigured,
  };
}

async function handleCloudModelSaveAndTest(req: express.Request, res: express.Response) {
  res.setHeader('Content-Type', 'application/json');
  try {
    const { providerName, name, apiKey, modelName, baseUrl, id, skipTest, isDefault, enabled, isEnabled } = req.body;
    const effectiveProviderName = String(providerName || name || '').trim();
    const effectiveModelName = String(modelName || '').trim();
    const rawBaseUrl = String(baseUrl || '').trim();
    let effectiveApiKey = String(apiKey || '').trim();
    const modelId = id ? String(id).trim() : '';

    // If editing an existing model and API key was omitted or masked, retrieve existing key from DB
    let existingModel: any;
    if (modelId) {
      existingModel = db.getModelById(modelId);
      if (existingModel && (!effectiveApiKey || effectiveApiKey.includes('••••'))) {
        effectiveApiKey = existingModel.apiKey || '';
      }
    }

    // 1. Validation
    if (!effectiveProviderName) {
      return res.status(400).json({
        success: false,
        error: 'Provider Name is required',
        status: 400,
      });
    }
    if (!effectiveModelName) {
      return res.status(400).json({
        success: false,
        error: 'Model Name is required',
        status: 400,
      });
    }
    if (!rawBaseUrl) {
      return res.status(400).json({
        success: false,
        error: 'Base URL is required',
        status: 400,
      });
    }
    if (!effectiveApiKey) {
      return res.status(400).json({
        success: false,
        error: 'Invalid API key: API Key is required',
        status: 400,
      });
    }

    // 2. Intelligent Base URL normalization & OpenAI-compatible endpoint resolution
    const { normalizedBaseUrl, chatEndpoint } = OpenAICompatibleAdapter.normalizeEndpoint(rawBaseUrl);

    const finalId = modelId || existingModel?.id || `cloud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const isModelEnabled = enabled !== undefined
      ? enabled
      : (isEnabled !== undefined ? isEnabled : (existingModel?.enabled ?? true));

    const candidateModel = {
      ...existingModel,
      id: finalId,
      providerName: effectiveProviderName,
      name: effectiveProviderName,
      modelName: effectiveModelName,
      baseUrl: normalizedBaseUrl,
      endpoint: chatEndpoint,
      apiKey: effectiveApiKey,
      apiType: 'openai-compatible',
      authHeaderType: 'Bearer',
      temperature: req.body.temperature ?? existingModel?.temperature ?? 0.7,
      maxTokens: req.body.maxTokens ?? existingModel?.maxTokens ?? 2048,
      systemPrompt: req.body.systemPrompt || existingModel?.systemPrompt || 'You are an e-commerce marketing expert for Bangladesh.',
      enabled: isModelEnabled,
      isEnabled: isModelEnabled,
      isDefault: isDefault !== undefined ? isDefault : (existingModel?.isDefault ?? false),
      createdAt: existingModel?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // If skipTest is explicitly set (e.g. metadata-only toggle or save)
    if (skipTest) {
      const saved = db.saveModel(candidateModel);
      return res.status(200).json({
        success: true,
        message: 'Cloud model saved successfully',
        model: formatModelForClient(saved),
      });
    }

    // 3. Test the model using backend adapter
    const testResult = await AIModelManager.testModel(candidateModel);

    // 4. Save to persistent database if successful
    if (testResult.success) {
      const saved = db.saveModel({
        ...candidateModel,
        lastTestStatus: 'Working',
        status: 'online',
        latency: testResult.latency,
        latencyMs: testResult.latency,
        lastTestedAt: new Date().toISOString(),
        errorMessage: undefined,
        endpoint: testResult.resolvedEndpoint || candidateModel.endpoint,
      });

      return res.status(200).json({
        success: true,
        message: 'Cloud model saved successfully',
        model: formatModelForClient(saved),
        testResult: {
          success: true,
          model: saved.modelName,
          latencyMs: testResult.latency,
          message: testResult.message,
          sampleResponse: testResult.sampleResponse,
        },
      });
    } else {
      // If test failed, DO NOT save as working. Return JSON error with details
      const statusCode = testResult.errorType === 'auth' ? 401 : (testResult.statusCode || 400);
      return res.status(statusCode).json({
        success: false,
        error: testResult.message || 'Connection test failed',
        status: statusCode,
        latencyMs: testResult.latency,
        testResult: {
          success: false,
          model: candidateModel.modelName,
          latencyMs: testResult.latency,
          message: testResult.message,
          error: testResult.message,
          status: statusCode,
        },
      });
    }
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error processing cloud model',
      status: 500,
    });
  }
}

async function handleCloudModelTest(req: express.Request, res: express.Response) {
  res.setHeader('Content-Type', 'application/json');
  try {
    let model = req.body;
    if (model.id && (!model.apiKey || model.apiKey.includes('••••'))) {
      const existing = db.getModelById(model.id);
      if (existing) {
        model = { ...existing, ...model, apiKey: existing.apiKey };
      }
    }

    if (!model.apiKey || model.apiKey.trim() === '') {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed: API key is missing',
        status: 401,
      });
    }

    const testResult = await AIModelManager.testModel(model);
    if (testResult.success) {
      return res.status(200).json({
        success: true,
        model: model.modelName || 'cloud-model',
        latencyMs: testResult.latency,
        status: 'Working',
        message: testResult.message,
        sampleResponse: testResult.sampleResponse,
      });
    } else {
      const statusCode = testResult.errorType === 'auth' ? 401 : 400;
      return res.status(statusCode).json({
        success: false,
        error: testResult.message || 'Authentication failed',
        status: statusCode,
        latencyMs: testResult.latency,
      });
    }
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error during model test',
      status: 500,
    });
  }
}

// Routes: Primary Cloud Model endpoints
app.post('/api/cloud-models', handleCloudModelSaveAndTest);
app.get('/api/cloud-models', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(db.getModels().map(formatModelForClient));
});
app.post('/api/cloud-models/test', handleCloudModelTest);
app.delete('/api/cloud-models/:id', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const deleted = db.deleteModel(req.params.id);
  res.json({ success: deleted, message: deleted ? 'Cloud model deleted successfully' : 'Model not found' });
});

// Legacy / Compatibility AI Model routes
app.get('/api/ai/models', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(db.getModels().map(formatModelForClient));
});
app.post('/api/ai/models', handleCloudModelSaveAndTest);
app.post('/api/ai/save-and-test', handleCloudModelSaveAndTest);
app.post('/api/ai/test', handleCloudModelTest);
app.delete('/api/ai/models/:id', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const deleted = db.deleteModel(req.params.id);
  res.json({ success: deleted });
});

app.get('/api/ai/tasks', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(db.getTaskAssignments());
});

app.post('/api/ai/tasks', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const saved = db.saveTaskAssignments(req.body);
  res.json(saved);
});

app.post('/api/ai/analyze-product', async (req, res) => {
  const { productId, tavilyContext } = req.body;
  const product = db.getProductById(productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  try {
    const analysis = await AIModelManager.analyzeProduct(product, tavilyContext);
    product.aiAnalysis = analysis;
    product.contentStatus = 'analyzed';
    db.saveProduct(product);
    res.json(analysis);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/generate-content', async (req, res) => {
  const { productId, platform, contentType } = req.body;
  const product = db.getProductById(productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  try {
    const content = await AIModelManager.generateSocialContent(product, platform, contentType);
    res.json(content);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- VIDEO GENERATOR ---
app.post('/api/video/spec', (req, res) => {
  const { productId, script, duration, template, audioTrackId } = req.body;
  const product = db.getProductById(productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const spec = VideoGeneratorService.createVideoSpec(
    product,
    script,
    duration || 15,
    template || 'modern_reels',
    audioTrackId
  );
  res.json(spec);
});

// --- SOCIAL MEDIA & PUBLISHING QUEUE ---
app.get('/api/social/config', (req, res) => {
  const config = db.getSocialConfig();
  res.json({
    facebook: {
      ...config.facebook,
      accessToken: config.facebook.accessToken ? '••••••••' : '',
    },
    youtube: {
      ...config.youtube,
      accessToken: config.youtube.accessToken ? '••••••••' : '',
    },
    tiktok: {
      ...config.tiktok,
      accessToken: config.tiktok.accessToken ? '••••••••' : '',
    },
  });
});

app.post('/api/social/config', (req, res) => {
  const body = req.body;
  const current = db.getSocialConfig();

  // Preserve masked tokens
  if (body.facebook?.accessToken && body.facebook.accessToken.includes('••••')) {
    body.facebook.accessToken = current.facebook.accessToken;
  }
  if (body.youtube?.accessToken && body.youtube.accessToken.includes('••••')) {
    body.youtube.accessToken = current.youtube.accessToken;
  }
  if (body.tiktok?.accessToken && body.tiktok.accessToken.includes('••••')) {
    body.tiktok.accessToken = current.tiktok.accessToken;
  }

  const saved = db.saveSocialConfig(body);
  res.json(saved);
});

app.post('/api/social/test', async (req, res) => {
  const { platform, token, pageId } = req.body;
  if (platform === 'facebook') {
    const result = await FacebookService.testConnection(token, pageId);
    return res.json(result);
  }
  if (platform === 'youtube') {
    const result = await YouTubeService.testConnection(token);
    return res.json(result);
  }
  if (platform === 'tiktok') {
    const result = await TikTokService.testConnection(token);
    return res.json(result);
  }
  res.status(400).json({ error: 'Invalid platform' });
});

app.get('/api/queue', (req, res) => {
  res.json(db.getQueue());
});

app.post('/api/queue', (req, res) => {
  const item = db.addToQueue(req.body);
  res.json(item);
});

app.put('/api/queue/:id', (req, res) => {
  const updated = db.updateQueueItem(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Queue item not found' });
  res.json(updated);
});

app.delete('/api/queue/:id', (req, res) => {
  const deleted = db.deleteQueueItem(req.params.id);
  res.json({ success: deleted });
});

app.post('/api/queue/:id/publish', async (req, res) => {
  const item = db.getQueue().find(q => q.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Queue item not found' });

  try {
    const result = await SocialPublisherDispatcher.publishItem(item);
    res.json(result);
  } catch (err: any) {
    db.updateQueueItem(item.id, { status: 'failed', errorMessage: err.message });
    res.status(500).json({ error: err.message });
  }
});

// --- BRAND & PRICING ---
app.get('/api/brand', (req, res) => res.json(db.getBrandSettings()));
app.post('/api/brand', (req, res) => res.json(db.saveBrandSettings(req.body)));

app.get('/api/pricing', (req, res) => res.json(db.getPricingRules()));
app.post('/api/pricing', (req, res) => res.json(db.savePricingRules(req.body)));

// --- AUTOMATION & FULL PIPELINE ---
app.get('/api/automation', (req, res) => res.json(db.getAutomationSettings()));
app.post('/api/automation', (req, res) => res.json(db.saveAutomationSettings(req.body)));

app.post('/api/automation/run-full-pipeline', async (req, res) => {
  const { productId, autoApprove, skipTavily } = req.body;
  try {
    const product = await SchedulerService.processProductFullPipeline(productId, {
      autoApprove,
      skipTavily,
    });
    res.json({ success: true, product });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/automation/run-now', async (req, res) => {
  try {
    const result = await SchedulerService.runPipelineNow();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- LOGS ---
app.get('/api/logs', (req, res) => {
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 100;
  res.json(db.getLogs(limit));
});

app.post('/api/logs/clear', (req, res) => {
  db.clearLogs();
  res.json({ success: true });
});

// --- GITHUB APK BUILDER & CONFIG ---
app.get('/api/apk/info', (req, res) => {
  try {
    let capacitorConfig = {};
    const capPath = path.join(process.cwd(), 'capacitor.config.json');
    if (fs.existsSync(capPath)) {
      capacitorConfig = JSON.parse(fs.readFileSync(capPath, 'utf8'));
    }

    let workflowYaml = '';
    const wfPath = path.join(process.cwd(), '.github', 'workflows', 'build-apk.yml');
    if (fs.existsSync(wfPath)) {
      workflowYaml = fs.readFileSync(wfPath, 'utf8');
    }

    res.json({
      appName: (capacitorConfig as any).appName || 'ShopBase AI',
      appId: (capacitorConfig as any).appId || 'com.shopbase.ai.automation',
      webDir: (capacitorConfig as any).webDir || 'dist',
      workflowFile: '.github/workflows/build-apk.yml',
      workflowYaml,
      hasCapacitor: true,
      hasWorkflow: !!workflowYaml,
      instructionsBangla: [
        '১. AI Studio-র উপরে ডানদিকের Settings মেনু থেকে "Export to GitHub" সিলেক্ট করে আপনার GitHub রেপোজিটরিতে কোড পুশ করুন।',
        '২. আপনার GitHub রেপোজিটরি ওপেন করে "Actions" ট্যাবে যান।',
        '৩. বামদিকের লিস্ট থেকে "Build Android APK (GitHub APK Maker)" ওয়ার্কফ্লো নির্বাচন করুন।',
        '৪. "Run workflow" বাটনে ক্লিক করুন (Build Type: debug)।',
        '৫. বিল্ড শেষ হলে (৩-৪ মিনিট) রান সামারির Artifacts সেকশন থেকে "ShopBase-AI-Android-APK" জিপ ফাইল ডাউনলোড করুন এবং ফোনে ইন্সটল করুন।'
      ],
      instructionsEnglish: [
        '1. Export this repository to GitHub via the AI Studio Settings menu (Export to GitHub).',
        '2. Navigate to your GitHub repository and open the "Actions" tab.',
        '3. Select the "Build Android APK (GitHub APK Maker)" workflow from the left sidebar.',
        '4. Click "Run workflow" -> select "debug" build -> Click the green Run button.',
        '5. Once finished (3-4 minutes), scroll down to "Artifacts" and download "ShopBase-AI-Android-APK". Transfer it to your Android device and install!'
      ]
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/apk/config', (req, res) => {
  try {
    const { appName, appId } = req.body;
    const capPath = path.join(process.cwd(), 'capacitor.config.json');
    let config: any = {};
    if (fs.existsSync(capPath)) {
      config = JSON.parse(fs.readFileSync(capPath, 'utf8'));
    }
    if (appName) config.appName = appName;
    if (appId) config.appId = appId;
    fs.writeFileSync(capPath, JSON.stringify(config, null, 2), 'utf8');
    res.json({ success: true, config });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- STARTUP & VITE MIDDLEWARE ---
async function startServer() {
  // CRITICAL: Prevent unhandled /api/* requests from returning index.html via Vite middleware
  app.all('/api/*', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(404).json({
      success: false,
      error: `API route not found: ${req.method} ${req.originalUrl || req.url}`,
      status: 404,
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ShopBase Automation Server] running on http://0.0.0.0:${PORT}`);
    // Start automation background scheduler
    SchedulerService.startScheduler();
  });
}

startServer();
