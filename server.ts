process.env.PORT = '3000';

import express, { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db.js';
import { AIModelManager } from './server/services/AIModelManager.js';
import { ShopBaseCollector } from './server/services/ShopBaseCollector.js';
import { TavilyService } from './server/services/TavilyService.js';
import { VideoGeneratorService } from './server/services/VideoGeneratorService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = http.createServer(app);
const PORT = 3000;
const isDev = process.env.NODE_ENV !== 'production';

// Basic middleware
app.use(cors());
app.use(express.json());

// Request logging for API calls
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');
  }
  next();
});

// ==========================================
// 1. CLOUD MODELS API (URGENT FIX ROUTES)
// ==========================================

// POST /api/cloud-models - Save & Test new cloud model
app.post('/api/cloud-models', async (req: Request, res: Response) => {
  try {
    const { providerName, apiKey, modelName, baseUrl } = req.body || {};

    if (!providerName || typeof providerName !== 'string' || !providerName.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Provider Name is required and must be non-empty.'
      });
    }

    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
      return res.status(400).json({
        success: false,
        error: 'API Key is required.'
      });
    }

    if (!modelName || typeof modelName !== 'string' || !modelName.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Model Name is required (e.g. gpt-4o-mini, llama-3.3-70b-versatile).'
      });
    }

    if (!baseUrl || typeof baseUrl !== 'string' || !baseUrl.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Base URL is required (e.g. https://api.openai.com/v1).'
      });
    }

    const normalizedUrl = db.normalizeBaseUrl(baseUrl);

    // Step 9 & 13: Test the model against the OpenAI-compatible endpoint
    const testResult = await db.testOpenAIEndpoint(normalizedUrl, apiKey, modelName);

    // Save to persistent storage with actual tested status and latency
    const savedModel = await db.saveCloudModel({
      providerName,
      apiKey,
      modelName,
      baseUrl: normalizedUrl,
      status: testResult.success ? 'working' : 'error',
      latencyMs: testResult.latencyMs,
      isDefault: testResult.success
    });

    return res.status(200).json({
      success: true,
      message: testResult.success
        ? 'Cloud model verified and saved successfully'
        : `Model saved, but verification failed: ${testResult.error || 'Authentication error'}`,
      model: savedModel,
      verified: testResult.success,
      latencyMs: testResult.latencyMs,
      testError: testResult.error
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error while processing cloud model'
    });
  }
});

// GET /api/cloud-models - Retrieve all saved cloud models (Masked API keys only)
app.get('/api/cloud-models', (req: Request, res: Response) => {
  try {
    const models = db.getSanitizedModels();
    return res.status(200).json({
      success: true,
      models
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to retrieve cloud models'
    });
  }
});

// GET /api/cloud-models/:id - Retrieve single model
app.get('/api/cloud-models/:id', (req: Request, res: Response) => {
  try {
    const model = db.getModelById(req.params.id, false);
    if (!model) {
      return res.status(404).json({
        success: false,
        error: `Cloud model with id ${req.params.id} not found.`
      });
    }
    return res.status(200).json({
      success: true,
      model
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// PUT /api/cloud-models/:id - Update model configuration
app.put('/api/cloud-models/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { providerName, apiKey, modelName, baseUrl, isDefault } = req.body || {};

    const existing = db.getModelById(id, true);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Cloud model with id ${id} not found.`
      });
    }

    const updates: any = {};
    if (providerName) updates.providerName = providerName.trim();
    if (modelName) updates.modelName = modelName.trim();
    if (baseUrl) updates.baseUrl = db.normalizeBaseUrl(baseUrl);
    if (typeof isDefault === 'boolean') updates.isDefault = isDefault;
    if (apiKey && apiKey.trim()) updates.apiKey = apiKey.trim();

    const updated = db.updateCloudModel(id, updates);

    return res.status(200).json({
      success: true,
      message: 'Cloud model updated successfully',
      model: updated
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// DELETE /api/cloud-models/:id - Delete a model
app.delete('/api/cloud-models/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteCloudModel(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: `Cloud model with id ${id} not found.`
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Cloud model deleted successfully.'
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// POST /api/cloud-models/:id/test - Test an existing saved model
app.post('/api/cloud-models/:id/test', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const model = db.getModelById(id, true) as any;

    if (!model) {
      return res.status(404).json({
        success: false,
        error: `Cloud model with id ${id} not found.`
      });
    }

    const testResult = await db.testOpenAIEndpoint(model.baseUrl, model.apiKey, model.modelName);

    db.updateCloudModel(id, {
      status: testResult.success ? 'working' : 'error',
      latencyMs: testResult.latencyMs
    });

    if (testResult.success) {
      return res.status(200).json({
        success: true,
        model: model.modelName,
        latencyMs: testResult.latencyMs
      });
    } else {
      return res.status(400).json({
        success: false,
        error: testResult.error || 'Authentication failed'
      });
    }
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal error during model test'
    });
  }
});

// ==========================================
// 2. PRODUCTS & SHOPBASE COLLECTOR API
// ==========================================
app.get('/api/products', (req: Request, res: Response) => {
  try {
    const products = db.getProducts();
    return res.json({ success: true, products });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/products/collect', async (req: Request, res: Response) => {
  try {
    const { urlOrKeyword, maxItems, category } = req.body || {};
    const items = await ShopBaseCollector.collectProducts({
      urlOrKeyword: urlOrKeyword || 'trending',
      maxItems: maxItems || 3,
      category
    });
    return res.json({ success: true, products: items });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = db.getProducts().find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
  return res.json({ success: true, product });
});

// ==========================================
// 3. TAVILY MARKET RESEARCH API
// ==========================================
app.post('/api/tavily/search', async (req: Request, res: Response) => {
  try {
    const { query, searchDepth } = req.body || {};
    if (!query) return res.status(400).json({ success: false, error: 'Query is required.' });
    const result = await TavilyService.searchTrends({ query, searchDepth });
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. AI CONTENT GENERATION API
// ==========================================
app.post('/api/ai/generate', async (req: Request, res: Response) => {
  try {
    const { productTitle, productDescription, platform, tone, targetAudience } = req.body || {};
    if (!productTitle) return res.status(400).json({ success: false, error: 'productTitle is required.' });

    const result = await AIModelManager.generateContent({
      productTitle,
      productDescription,
      platform: platform || 'all',
      tone: tone || 'engaging',
      targetAudience
    });

    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. VIDEO GENERATOR API
// ==========================================
app.post('/api/video/generate', async (req: Request, res: Response) => {
  try {
    const { productTitle, productPrice, productImage, platform } = req.body || {};
    if (!productTitle || !productImage) {
      return res.status(400).json({ success: false, error: 'productTitle and productImage are required.' });
    }

    const project = await VideoGeneratorService.generateStoryboard({
      productTitle,
      productPrice: typeof productPrice === 'number' ? productPrice : parseFloat(productPrice || '29.99'),
      productImage,
      platform: platform || 'reels'
    });

    return res.json({ success: true, project });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 6. PUBLISHING QUEUE API
// ==========================================
app.get('/api/queue', (req: Request, res: Response) => {
  return res.json({ success: true, queue: db.getQueue() });
});

app.post('/api/queue', (req: Request, res: Response) => {
  try {
    const { productTitle, productImage, platforms, caption, hashtags, scheduledTime } = req.body || {};
    if (!productTitle || !caption) {
      return res.status(400).json({ success: false, error: 'Product title and caption are required.' });
    }

    const newItem = db.addToQueue({
      productTitle,
      productImage: productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      platforms: platforms || ['facebook', 'reels', 'tiktok'],
      caption,
      hashtags: hashtags || ['#ShopBase', '#Trending'],
      status: 'pending',
      scheduledTime: scheduledTime || new Date(Date.now() + 3600000).toISOString()
    });

    return res.json({ success: true, item: newItem });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/queue/:id', (req: Request, res: Response) => {
  const updated = db.updateQueueItem(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Queue item not found' });
  return res.json({ success: true, item: updated });
});

app.delete('/api/queue/:id', (req: Request, res: Response) => {
  const deleted = db.deleteQueueItem(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, error: 'Queue item not found' });
  return res.json({ success: true, message: 'Queue item deleted' });
});

app.post('/api/queue/:id/publish', (req: Request, res: Response) => {
  const updated = db.updateQueueItem(req.params.id, {
    status: 'published',
    publishedTime: new Date().toISOString()
  });
  if (!updated) return res.status(404).json({ success: false, error: 'Queue item not found' });

  db.addLog('success', 'publisher', `Successfully published [${updated.productTitle}] to platforms: ${updated.platforms.join(', ')}`);
  return res.json({ success: true, item: updated, message: 'Published successfully to social channels.' });
});

// ==========================================
// 7. DASHBOARD & STATS & LOGS API
// ==========================================
app.get('/api/dashboard/stats', (req: Request, res: Response) => {
  const products = db.getProducts();
  const queue = db.getQueue();
  const activeModel = db.getActiveModel();
  const models = db.getSanitizedModels();

  return res.json({
    success: true,
    stats: {
      totalProducts: products.length,
      queuedPosts: queue.filter(q => q.status === 'pending' || q.status === 'approved').length,
      publishedPosts: queue.filter(q => q.status === 'published').length,
      activeCloudModel: activeModel ? `${activeModel.providerName} (${activeModel.modelName})` : 'None configured',
      activeModelStatus: activeModel ? activeModel.status : 'inactive',
      configuredModelsCount: models.length
    }
  });
});

app.get('/api/logs', (req: Request, res: Response) => {
  return res.json({ success: true, logs: db.getLogs() });
});

app.delete('/api/logs', (req: Request, res: Response) => {
  db.clearLogs();
  return res.json({ success: true, message: 'Logs cleared.' });
});

// ==========================================
// 8. SETTINGS API
// ==========================================
app.get('/api/settings', (req: Request, res: Response) => {
  return res.json({ success: true, settings: db.getSettings() });
});

app.post('/api/settings', (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  return res.json({ success: true, settings: updated });
});

// =========================================================================
// 9. CRITICAL BULLETPROOF RULE: ALL UNHANDLED /api/* ROUTES ALWAYS RETURN JSON
// Never let an unknown /api/* route fall through to the HTML index handler!
// =========================================================================
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.path}`
  });
});

// ==========================================
// 10. FRONTEND VITE DEV / STATIC SERVING
// ==========================================
async function startServer() {
  if (isDev) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true, hmr: { server: httpServer } },
        appType: 'spa',
        root: process.cwd()
      });
      app.use(vite.middlewares);
      console.log('[Dev] Vite middleware attached for SPA frontend.');
    } catch (err) {
      console.warn('[Dev] Vite middleware fallback to static serving:', err);
      app.use(express.static(path.resolve(__dirname, 'dist')));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'index.html'));
      });
    }
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[ShopBase AI] Server running on http://0.0.0.0:${PORT}`);
    console.log(`[ShopBase AI] Cloud Models API active on http://0.0.0.0:${PORT}/api/cloud-models`);
  });
}

startServer();
