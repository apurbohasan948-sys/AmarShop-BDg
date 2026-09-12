import { db } from '../db';
import { ShopBaseCollector } from './ShopBaseCollector';
import { TavilyService } from './TavilyService';
import { AIModelManager } from './AIModelManager';
import { VideoGeneratorService } from './VideoGeneratorService';
import { SocialPublisherDispatcher } from './SocialServices';
import { QueueItem } from '../../src/types';

export class SchedulerService {
  private static timer: NodeJS.Timeout | null = null;
  private static isRunning = false;

  public static startScheduler() {
    if (this.timer) clearInterval(this.timer);

    db.addLog('info', 'Scheduler', 'Automation background service started (interval check: 60s)');

    // Run periodic tick every 60 seconds
    this.timer = setInterval(() => {
      this.tick();
    }, 60 * 1000);

    // Run first tick immediately
    this.tick();
  }

  public static stopScheduler() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    db.addLog('info', 'Scheduler', 'Automation background service stopped');
  }

  public static async tick() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      const settings = db.getAutomationSettings();

      // Check scheduled queue items ready for publish
      const queue = db.getQueue();
      const now = new Date().getTime();

      for (const item of queue) {
        if (item.status === 'scheduled' && item.scheduledTime) {
          const itemTime = new Date(item.scheduledTime).getTime();
          if (itemTime <= now) {
            db.addLog('info', 'Scheduler', `Publishing scheduled item: ${item.id} (${item.platform})`);
            try {
              await SocialPublisherDispatcher.publishItem(item);
            } catch (err: any) {
              db.updateQueueItem(item.id, {
                status: 'failed',
                errorMessage: err.message,
              });
              db.addLog('error', 'Scheduler', `Failed to publish item ${item.id}: ${err.message}`);
            }
          }
        }
      }

      // If Auto-Post is enabled, process approved items
      if (settings.autoPost) {
        const approvedItems = queue.filter(q => q.status === 'approved');
        for (const item of approvedItems.slice(0, 3)) {
          try {
            await SocialPublisherDispatcher.publishItem(item);
          } catch (err: any) {
            db.updateQueueItem(item.id, {
              status: 'failed',
              errorMessage: err.message,
            });
          }
        }
      }

      // Update next run timestamp
      db.saveAutomationSettings({
        lastRunAt: new Date().toISOString(),
        nextRunAt: new Date(Date.now() + settings.intervalHours * 3600 * 1000).toISOString(),
      });
    } catch (err: any) {
      db.addLog('error', 'Scheduler', `Scheduler tick error: ${err.message}`);
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
  public static async processProductFullPipeline(
    productId: string,
    options?: { skipTavily?: boolean; autoApprove?: boolean }
  ) {
    const product = db.getProductById(productId);
    if (!product) throw new Error(`Product ${productId} not found`);

    db.addLog('info', 'AI', `Processing end-to-end automation for: "${product.title}"`);

    // Step 1: Tavily Research
    let tavilySummary = '';
    if (!options?.skipTavily) {
      try {
        const tavilyResp = await TavilyService.search(`${product.title} ${product.category}`);
        product.tavilyResearch = {
          query: `${product.title} ${product.category}`,
          summary: tavilyResp.answer || tavilyResp.results[0]?.content || 'High demand gadget in Bangladesh market.',
          trends: tavilyResp.results.map(r => r.title).slice(0, 3),
          keywords: [product.category, 'ShopBase BD', 'Bangladesh online shop'],
          researchedAt: new Date().toISOString(),
        };
        tavilySummary = product.tavilyResearch.summary;
      } catch (err: any) {
        db.addLog('warn', 'Tavily', `Tavily research skipped or failed: ${err.message}`);
      }
    }

    // Step 2: AI Product Analysis
    try {
      product.aiAnalysis = await AIModelManager.analyzeProduct(product, tavilySummary);
      product.contentStatus = 'analyzed';
    } catch (err: any) {
      db.addLog('error', 'AI', `AI Analysis failed for ${product.id}: ${err.message}`);
    }

    // Step 3: Generate Social Content & Creatives
    const initialStatus = options?.autoApprove ? 'approved' : 'draft';

    // 3a. Facebook Post
    if (!db.isAlreadyPublished(product.id, 'facebook', 'facebook_post')) {
      try {
        const fbContent = await AIModelManager.generateSocialContent(product, 'facebook', 'post');
        const queueItem: QueueItem = {
          id: `q-fb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: product.id,
          productTitle: product.title,
          platform: 'facebook',
          contentType: 'facebook_post',
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
            mediaUrls: product.images.map(i => i.highResolutionImageUrl).slice(0, 3),
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.addToQueue(queueItem);
      } catch (e: any) {
        db.addLog('error', 'AI', `Failed to generate FB Post for ${product.id}: ${e.message}`);
      }
    }

    // 3b. Facebook Reel / Short Video
    if (!db.isAlreadyPublished(product.id, 'facebook', 'facebook_reel')) {
      try {
        const reelContent = await AIModelManager.generateSocialContent(product, 'facebook', 'reel');
        const vidSpec = VideoGeneratorService.createVideoSpec(product, reelContent.videoScript, 15, 'modern_reels');

        const queueItem: QueueItem = {
          id: `q-reel-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: product.id,
          productTitle: product.title,
          platform: 'facebook',
          contentType: 'facebook_reel',
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
            mediaUrls: product.images.map(i => i.highResolutionImageUrl).slice(0, 3),
            videoDurationSeconds: vidSpec.durationSeconds,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.addToQueue(queueItem);
      } catch (e: any) {
        db.addLog('error', 'AI', `Failed to generate FB Reel for ${product.id}: ${e.message}`);
      }
    }

    // 3c. YouTube Shorts
    if (!db.isAlreadyPublished(product.id, 'youtube', 'youtube_short')) {
      try {
        const ytContent = await AIModelManager.generateSocialContent(product, 'youtube', 'short');
        const queueItem: QueueItem = {
          id: `q-yt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: product.id,
          productTitle: product.title,
          platform: 'youtube',
          contentType: 'youtube_short',
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
            mediaUrls: product.images.map(i => i.highResolutionImageUrl).slice(0, 2),
            videoDurationSeconds: 15,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.addToQueue(queueItem);
      } catch (e: any) {
        db.addLog('error', 'AI', `Failed to generate YouTube Short for ${product.id}: ${e.message}`);
      }
    }

    // 3d. TikTok Video
    if (!db.isAlreadyPublished(product.id, 'tiktok', 'tiktok_video')) {
      try {
        const ttContent = await AIModelManager.generateSocialContent(product, 'tiktok', 'video');
        const queueItem: QueueItem = {
          id: `q-tt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: product.id,
          productTitle: product.title,
          platform: 'tiktok',
          contentType: 'tiktok_video',
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
            mediaUrls: product.images.map(i => i.highResolutionImageUrl).slice(0, 2),
            videoDurationSeconds: 15,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.addToQueue(queueItem);
      } catch (e: any) {
        db.addLog('error', 'AI', `Failed to generate TikTok content for ${product.id}: ${e.message}`);
      }
    }

    product.contentStatus = 'creatives_generated';
    product.publishingStatus = 'in_queue';
    db.saveProduct(product);

    db.addLog('success', 'Scheduler', `Complete workflow executed for "${product.title}". Queued social creatives ready for review.`);
    return product;
  }

  public static async runPipelineNow(): Promise<{ success: boolean; processedCount: number; message: string }> {
    // Find unqueued/pending products first, or existing products
    let targets = db.getProducts().filter(p => p.publishingStatus === 'unprocessed' || p.contentStatus === 'pending');
    
    if (targets.length === 0) {
      // Crawl or use first 2 products for demonstration
      targets = db.getProducts().slice(0, 2);
    }

    let count = 0;
    for (const prod of targets.slice(0, 2)) {
      try {
        await this.processProductFullPipeline(prod.id, { autoApprove: false });
        count++;
      } catch (err: any) {
        db.addLog('error', 'Scheduler', `Pipeline step failed for ${prod.title}: ${err.message}`);
      }
    }

    return {
      success: true,
      processedCount: count,
      message: count > 0 ? `Successfully processed ${count} product(s) through full workflow.` : 'All products have already been processed.',
    };
  }
}
