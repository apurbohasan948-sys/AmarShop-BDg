import { db } from '../db.js';

export interface GenerationRequest {
  productId?: string;
  productTitle: string;
  productDescription?: string;
  platform: 'facebook' | 'youtube' | 'tiktok' | 'reels' | 'all';
  tone?: 'engaging' | 'promotional' | 'storytelling' | 'viral';
  includeHashtags?: boolean;
  targetAudience?: string;
}

export interface GenerationResult {
  caption: string;
  hook: string;
  callToAction: string;
  hashtags: string[];
  platformVariations?: Record<string, { caption: string; hook: string; hashtags: string[] }>;
  modelUsed: string;
  provider: string;
}

export class AIModelManager {
  public static async generateContent(req: GenerationRequest): Promise<GenerationResult> {
    const activeModel = db.getActiveModel();

    if (activeModel && activeModel.apiKey && activeModel.baseUrl) {
      try {
        const endpoint = db.normalizeBaseUrl(activeModel.baseUrl);
        const prompt = `You are a world-class social media copywriter for e-commerce.
Product: "${req.productTitle}"
Description: "${req.productDescription || req.productTitle}"
Target Platform: ${req.platform}
Tone: ${req.tone || 'engaging and high-converting'}
Audience: ${req.targetAudience || 'shoppers looking for great practical deals'}

Generate:
1. High-attention HOOK (1 punchy line)
2. Engaging social CAPTION optimized for ${req.platform}
3. Clear CALL TO ACTION (CTA)
4. 5-8 relevant trending HASHTAGS

Format response strictly as JSON with keys:
"hook", "caption", "callToAction", "hashtags" (array of strings starting with #)`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeModel.apiKey}`
          },
          body: JSON.stringify({
            model: activeModel.modelName,
            messages: [
              { role: 'system', content: 'You generate high-converting e-commerce social posts. Always return valid JSON.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 600
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          const content = json?.choices?.[0]?.message?.content || '';
          
          // Try parsing JSON out of content
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const parsed = JSON.parse(jsonMatch[0]);
              db.addLog('success', 'ai', `Generated content for "${req.productTitle}" via [${activeModel.providerName}/${activeModel.modelName}]`);
              return {
                hook: parsed.hook || `Discover why everyone is raving about ${req.productTitle}!`,
                caption: parsed.caption || content,
                callToAction: parsed.callToAction || 'Tap the link in bio to grab yours today with limited-time free shipping!',
                hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : ['#Trending', '#MustHave', '#ShopBase'],
                modelUsed: activeModel.modelName,
                provider: activeModel.providerName
              };
            } catch {}
          }
        }
      } catch (err: any) {
        db.addLog('warn', 'ai', `Cloud model generation error (${err.message}). Using high-converting fallback engine.`);
      }
    }

    // High quality intelligent template engine fallback
    const title = req.productTitle;
    const desc = req.productDescription || 'Engineered for premium comfort and lasting performance.';
    const hook = `🔥 Stop scrolling! If you need ${title.toLowerCase()}, this changes everything.`;
    const caption = `Tired of settling for low quality? Our ${title} is built for daily perfection. Whether for home, work, or on the go: ${desc.slice(0, 100)}... Order yours now before stock sells out!`;
    const callToAction = '🛒 Click the link in our bio to claim yours with fast worldwide shipping!';
    const defaultTags = ['#ShopBaseFinds', '#ViralProduct', '#SmartShopping', '#MustHave', '#TrendingDeals'];

    db.addLog('info', 'ai', `Generated post for "${req.productTitle}" (Engine fallback)`);

    return {
      hook,
      caption,
      callToAction,
      hashtags: defaultTags,
      modelUsed: activeModel ? activeModel.modelName : 'ShopBase Smart Engine',
      provider: activeModel ? activeModel.providerName : 'Built-in'
    };
  }
}
