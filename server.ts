import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.ts';
import { AIModelManager } from './server/services/AIModelManager.ts';
import { ShopBaseCollector } from './server/services/ShopBaseCollector.ts';
import { SchedulerService } from './server/services/SchedulerService.ts';
import { TavilyService } from './server/services/TavilyService.ts';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  // Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Start background publishing scheduler loop
  SchedulerService.start();

  // ==========================================
  // API Routes (Mounted BEFORE Vite middleware)
  // ==========================================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'AmarShop BD Automation Core',
      timestamp: new Date().toISOString(),
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      uptime: process.uptime(),
    });
  });

  // Products
  app.get('/api/products', (req, res) => {
    try {
      const products = db.getProducts();
      res.json({ success: true, data: products });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/products', (req, res) => {
    try {
      const newProduct = req.body;
      if (!newProduct.title) {
        return res.status(400).json({ success: false, error: 'Product title is required.' });
      }
      newProduct.id = newProduct.id || `prod-${Date.now()}`;
      newProduct.createdAt = newProduct.createdAt || new Date().toISOString();
      const saved = db.saveProduct(newProduct);
      res.json({ success: true, data: saved });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/products/:id', (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const existing = db.getProductById(id);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Product not found.' });
      }
      const updated = db.saveProduct({ ...existing, ...updates });
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/products/:id', (req, res) => {
    try {
      const { id } = req.params;
      const deleted = db.deleteProduct(id);
      res.json({ success: deleted });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Collect from ShopBase URL
  app.post('/api/products/collect', async (req, res) => {
    try {
      const { sourceUrl } = req.body;
      if (!sourceUrl) {
        return res.status(400).json({ success: false, error: 'Source URL is required.' });
      }
      const product = await ShopBaseCollector.collectFromUrl(sourceUrl);
      res.json({ success: true, data: product });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // AI Marketing Copy Generation
  app.post('/api/ai/generate-copy', async (req, res) => {
    try {
      const { productId, title, description, category, price, currency, tone, language } = req.body;

      let targetTitle = title;
      let targetDesc = description;
      let targetCat = category;
      let targetPrice = price;
      let targetCurrency = currency || 'BDT';

      let product = null;
      if (productId) {
        product = db.getProductById(productId);
        if (product) {
          targetTitle = targetTitle || product.title;
          targetDesc = targetDesc || product.description;
          targetCat = targetCat || product.category;
          targetPrice = targetPrice ?? product.price;
          targetCurrency = targetCurrency || product.currency;
        }
      }

      if (!targetTitle) {
        return res.status(400).json({ success: false, error: 'Product title is required for copy generation.' });
      }

      const generated = await AIModelManager.generateProductCopy({
        title: targetTitle,
        description: targetDesc,
        category: targetCat,
        price: targetPrice,
        currency: targetCurrency,
        tone: tone || 'high_converting',
        language: language || 'both',
      });

      // If tied to a product, auto-save the generated copy
      if (product) {
        product.aiGeneratedCopy = {
          ...generated,
          generatedAt: new Date().toISOString(),
        };
        db.saveProduct(product);
      }

      res.json({ success: true, data: generated });
    } catch (err: any) {
      console.error('Error generating AI copy:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Publishing Queue
  app.get('/api/queue', (req, res) => {
    try {
      const queue = db.getQueue();
      res.json({ success: true, data: queue });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/queue', (req, res) => {
    try {
      const item = req.body;
      if (!item.productTitle || !item.platform) {
        return res.status(400).json({ success: false, error: 'Product title and platform are required.' });
      }
      item.id = item.id || `queue-${Date.now()}`;
      item.status = item.status || 'pending';
      item.scheduledTime = item.scheduledTime || new Date(Date.now() + 3600000 * 2).toISOString();
      const saved = db.addToQueue(item);
      db.addLog('queue', 'info', `Added "${item.productTitle}" to ${item.platform} queue.`);
      res.json({ success: true, data: saved });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.patch('/api/queue/:id', (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updated = db.updateQueueItem(id, updates);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Queue item not found.' });
      }
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/queue/:id', (req, res) => {
    try {
      const { id } = req.params;
      const deleted = db.deleteQueueItem(id);
      res.json({ success: deleted });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/queue/publish-now/:id', (req, res) => {
    try {
      const { id } = req.params;
      const item = db.getQueue().find((q) => q.id === id);
      if (!item) {
        return res.status(404).json({ success: false, error: 'Queue item not found.' });
      }
      const updated = db.updateQueueItem(id, {
        status: 'published',
        publishedAt: new Date().toISOString(),
      });
      db.addLog(
        'queue',
        'success',
        `Instant Published "${item.productTitle}" to ${item.platform.toUpperCase()}`,
        `Manual Trigger | Media: ${item.content.mediaUrl ? 'Attached' : 'Text-only'}`
      );
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Trigger scheduler tick manually
  app.post('/api/queue/scheduler/tick', (req, res) => {
    try {
      const result = SchedulerService.tick();
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // AI Models
  app.get('/api/models', (req, res) => {
    try {
      const models = db.getModels();
      res.json({ success: true, data: models });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/models/test', async (req, res) => {
    try {
      const { provider, modelId } = req.body;
      const result = await AIModelManager.testModel(provider, modelId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.patch('/api/models/:id', (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updated = db.updateModel(id, updates);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Model not found.' });
      }
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Tavily / Market Research
  app.get('/api/research', (req, res) => {
    try {
      const research = db.getResearch();
      res.json({ success: true, data: research });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/research', async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ success: false, error: 'Search query is required.' });
      }
      const results = await TavilyService.researchMarket(query);
      res.json({ success: true, data: results });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // System Logs
  app.get('/api/logs', (req, res) => {
    try {
      const logs = db.getLogs();
      res.json({ success: true, data: logs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/logs', (req, res) => {
    try {
      db.clearLogs();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Settings
  app.get('/api/settings', (req, res) => {
    try {
      const settings = db.getSettings();
      res.json({ success: true, data: settings });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/settings', (req, res) => {
    try {
      const updates = req.body;
      const updated = db.updateSettings(updates);
      db.addLog('system', 'info', 'Store configuration settings updated.');
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Reset database demo data
  app.post('/api/db/reset', (req, res) => {
    try {
      db.resetToDefault();
      db.addLog('system', 'info', 'Database reset to default demo dataset.');
      res.json({ success: true, message: 'Data reset to default successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Fallback for unhandled /api requests to ALWAYS return JSON instead of HTML
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: `API route ${req.method} ${req.path} not found.`,
    });
  });

  // ==========================================
  // Vite Middleware setup for Frontend SPA
  // ==========================================
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
    console.log(`[AmarShop BD] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[AmarShop BD] Failed to start server:', err);
});
