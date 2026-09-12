import { db, QueueItem, Product } from '../db.js';
import { AIModelManager } from './AIModelManager.js';
import { OpenAICompatibleAdapter } from './adapters/OpenAICompatibleAdapter.js';

export interface GeneratePostRequest {
  productId: string;
  platforms: ('Facebook' | 'YouTube' | 'TikTok' | 'Reels')[];
  tone?: 'high-energy' | 'storytelling' | 'urgency-promo' | 'humorous';
  customInstructions?: string;
}

export interface GeneratedPostResponse {
  platform: 'Facebook' | 'YouTube' | 'TikTok' | 'Reels';
  hook: string;
  caption: string;
  hashtags: string[];
}

export class SocialServices {
  /**
   * Generates tailored posts for platforms using the active cloud model or high-craft fallback
   */
  public static async generatePosts(req: GeneratePostRequest): Promise<{ success: boolean; posts: GeneratedPostResponse[]; error?: string }> {
    const product = db.get().products.find((p) => p.id === req.productId);
    if (!product) {
      return { success: false, posts: [], error: 'Product not found' };
    }

    const activeModel = AIModelManager.getActiveModel();
    const tone = req.tone || 'high-energy';
    const results: GeneratedPostResponse[] = [];

    db.addLog('INFO', 'AI', `Generating social posts for "${product.title}" across ${req.platforms.join(', ')}...`);

    for (const platform of req.platforms) {
      let hook = '';
      let caption = '';
      let hashtags: string[] = [];

      // If active model is configured, try calling it
      let generatedText = '';
      if (activeModel && activeModel.apiKey) {
        const prompt = `
Create a high-converting ${platform} post for the following product:
Product: ${product.title}
Price: $${product.price}
Description: ${product.description}
Key Features: ${(product.extractedFeatures || []).join(', ')}
Tone: ${tone}
${req.customInstructions ? `Additional notes: ${req.customInstructions}` : ''}

Format your response strictly as:
HOOK: [A viral 1-line hook]
CAPTION: [Engaging caption with call to action]
HASHTAGS: [#tag1, #tag2, #tag3, #tag4, #tag5]
`;
        const res = await OpenAICompatibleAdapter.generateText(
          activeModel.baseUrl,
          activeModel.apiKey,
          activeModel.modelName,
          prompt,
          `You are an elite e-commerce social media copywriter for ${platform}.`
        );
        if (res.success && res.content) {
          generatedText = res.content;
        }
      }

      if (generatedText) {
        // Parse generated text
        const hookMatch = generatedText.match(/HOOK:\s*(.+)/i);
        const captionMatch = generatedText.match(/CAPTION:\s*([\s\S]+?)(?=HASHTAGS:|$)/i);
        const tagsMatch = generatedText.match(/HASHTAGS:\s*(.+)/i);

        hook = hookMatch ? hookMatch[1].trim() : `You won't believe how this changed my daily routine! 🔥`;
        caption = captionMatch ? captionMatch[1].trim() : `${product.title} is now back in stock! Order yours today!`;
        if (tagsMatch) {
          hashtags = tagsMatch[1].split(/[\s,]+/).filter((t) => t.startsWith('#'));
        }
      }

      // High-craft fallback if no LLM configured or parsing was partial
      if (!hook || !caption || hashtags.length === 0) {
        if (platform === 'TikTok') {
          hook = `Stop wasting your money on knockoffs! Watch this before you buy 🚨`;
          caption = `I finally found the one that actually lives up to the hype: ${product.title} ✨\n\nSave on the limited flash sale right now! 🛒 Link in bio!`;
          hashtags = ['#TikTokMadeMeBuyIt', '#ViralFinds', '#ProductReview', '#TechTok', '#MustHave'];
        } else if (platform === 'Reels') {
          hook = `The aesthetic and functional upgrade you did not know you needed ✨`;
          caption = `Level up your lifestyle with ${product.title}.\n\nDouble tap if you need this! Drop a comment for direct checkout link 🛍️`;
          hashtags = ['#ReelsViral', '#AestheticVibes', '#ShopTheLook', '#DailyEssentials', '#TrendingNow'];
        } else if (platform === 'YouTube') {
          hook = `Is the ${product.title} actually worth $${product.price}? Honest Review!`;
          caption = `In this short video, we break down the top features of ${product.title}. Premium durability, sleek finish, and unbeatable value.\n\nSubscribe for more gadget breakdowns! Links in description.`;
          hashtags = ['#YouTubeShorts', '#ProductUnboxing', '#GadgetShowcase', '#TechReview'];
        } else {
          hook = `Special Exclusive Announcement: The ${product.title} is officially back!`;
          caption = `Looking for an upgrade that lasts? ${product.description}\n\nOver 5,000+ satisfied customers worldwide.\n\n👉 Click the Shop Now button below to claim your discount today!`;
          hashtags = ['#SpecialOffer', '#BestSeller', '#ShopNow', '#UpgradeYourLife'];
        }
      }

      results.push({
        platform,
        hook,
        caption,
        hashtags: hashtags.slice(0, 7)
      });
    }

    db.addLog('SUCCESS', 'AI', `Successfully created ${results.length} posts for "${product.title}".`);
    return { success: true, posts: results };
  }

  /**
   * Adds generated post to queue
   */
  public static addToQueue(item: Omit<QueueItem, 'id' | 'createdAt' | 'status'>): QueueItem {
    const newItem: QueueItem = {
      ...item,
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    db.update((data) => {
      data.queue.unshift(newItem);
    });

    db.addLog('SUCCESS', 'PUBLISH', `Added new post to queue for ${newItem.platform} (Scheduled: ${newItem.scheduledFor})`);
    return newItem;
  }

  /**
   * Publishes a queue item immediately
   */
  public static publishQueueItem(id: string): { success: boolean; item?: QueueItem; error?: string } {
    let target: QueueItem | undefined;
    db.update((data) => {
      const item = data.queue.find((q) => q.id === id);
      if (item) {
        item.status = 'published';
        item.publishedAt = new Date().toISOString();
        target = item;
      }
    });

    if (!target) {
      return { success: false, error: 'Queue item not found' };
    }

    db.addLog('SUCCESS', 'PUBLISH', `Published post to ${target.platform}: "${target.hook}"`);
    return { success: true, item: target };
  }

  /**
   * Removes item from queue
   */
  public static deleteQueueItem(id: string): boolean {
    let found = false;
    db.update((data) => {
      const initial = data.queue.length;
      data.queue = data.queue.filter((q) => q.id !== id);
      found = data.queue.length < initial;
    });
    return found;
  }
}
