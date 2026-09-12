import { AIModelConfig, Product, TaskModelAssignments } from '../../src/types';
import { db } from '../db';
import { AdapterRegistry } from './adapters/AdapterRegistry';
import { AdapterTestResult } from './adapters/AIProviderAdapter';

export interface ModelTestResult extends AdapterTestResult {
  modelId: string;
  modelName: string;
  latencyMs: number;
}

export class AIModelManager {
  /**
   * Test an AI model configuration with a real minimal request using its adapter
   */
  public static async testModel(modelConfig: AIModelConfig): Promise<ModelTestResult> {
    const adapter = AdapterRegistry.getAdapter(modelConfig);
    const result = await adapter.test(modelConfig);

    const updatedModel: AIModelConfig = {
      ...modelConfig,
      lastTestStatus: result.status,
      status: result.status === 'Working' ? 'online' : (result.status === 'Not Tested' ? 'untested' : 'error'),
      latency: result.latency,
      latencyMs: result.latency,
      lastTestedAt: new Date().toISOString(),
      errorMessage: result.success ? undefined : result.message,
    };

    if (result.resolvedEndpoint) {
      updatedModel.endpoint = result.resolvedEndpoint;
    }

    db.saveModel(updatedModel);

    if (result.success) {
      db.addLog('success', 'AI', `Model ${updatedModel.providerName || updatedModel.name} passed test (${result.latency}ms): ${result.sampleResponse || 'OK'}`);
    } else {
      db.addLog('error', 'AI', `Model ${updatedModel.providerName || updatedModel.name} test failed: ${result.message}`);
    }

    return {
      ...result,
      modelId: modelConfig.id,
      modelName: modelConfig.modelName,
      latencyMs: result.latency,
    };
  }

  /**
   * Execute a prompt using the specified task's configured model, with multi-level failover support
   * (Primary Model -> Fallback Model 1 -> Fallback Model 2)
   */
  public static async executeForTask(
    task: keyof TaskModelAssignments,
    prompt: string,
    customSystemPrompt?: string
  ): Promise<{ text: string; modelUsed: string; fallbackUsed: boolean }> {
    const assignments = db.getTaskAssignments();
    const models = db.getModels();

    // 1. Determine Primary Model ID:
    // Task-specific assignment takes first priority; if none, check primaryModelId, generalMarketing, or default model.
    const taskSpecificModelId = (assignments[task] as string) || '';
    const preferredId = taskSpecificModelId || assignments.primaryModelId || assignments.generalMarketing || '';

    let primaryModel = models.find(m => m.id === preferredId && (m.enabled ?? m.isEnabled));
    if (!primaryModel) {
      // Fall back to designated default model
      primaryModel = models.find(m => m.isDefault && (m.enabled ?? m.isEnabled));
    }
    if (!primaryModel) {
      // Fall back to any enabled model
      primaryModel = models.find(m => (m.enabled ?? m.isEnabled));
    }

    if (!primaryModel) {
      throw new Error('No AI model is currently enabled. Please add or enable an AI model in AI Settings.');
    }

    const sysPrompt = customSystemPrompt || primaryModel.systemPrompt;
    const primaryName = primaryModel.providerName || primaryModel.name || primaryModel.modelName;

    // Try primary model
    try {
      const text = await this.invokeModelDirect(primaryModel, prompt, sysPrompt);
      return { text, modelUsed: primaryName, fallbackUsed: false };
    } catch (primaryErr: any) {
      db.addLog('warn', 'AI', `Primary model "${primaryName}" failed: ${primaryErr.message}`);

      // Check if fallback is enabled
      if (assignments.enableFallback) {
        // --- Fallback Candidate 1 ---
        const fb1Id = assignments.fallbackModelId;
        if (fb1Id && fb1Id !== primaryModel.id) {
          const fallback1 = models.find(m => m.id === fb1Id && (m.enabled ?? m.isEnabled));
          if (fallback1) {
            const fb1Name = fallback1.providerName || fallback1.name || fallback1.modelName;
            db.addLog('info', 'AI', `Primary failed. Attempting Fallback 1: "${fb1Name}"`);
            try {
              const text1 = await this.invokeModelDirect(fallback1, prompt, sysPrompt);
              db.addLog('success', 'AI', `Fallback 1 "${fb1Name}" succeeded`);
              return { text: text1, modelUsed: `${fb1Name} (Fallback 1)`, fallbackUsed: true };
            } catch (fb1Err: any) {
              db.addLog('warn', 'AI', `Fallback 1 "${fb1Name}" failed: ${fb1Err.message}`);
            }
          }
        }

        // --- Fallback Candidate 2 ---
        const fb2Id = assignments.fallbackModel2Id;
        if (fb2Id && fb2Id !== primaryModel.id && fb2Id !== assignments.fallbackModelId) {
          const fallback2 = models.find(m => m.id === fb2Id && (m.enabled ?? m.isEnabled));
          if (fallback2) {
            const fb2Name = fallback2.providerName || fallback2.name || fallback2.modelName;
            db.addLog('info', 'AI', `Fallback 1 failed. Attempting Fallback 2: "${fb2Name}"`);
            try {
              const text2 = await this.invokeModelDirect(fallback2, prompt, sysPrompt);
              db.addLog('success', 'AI', `Fallback 2 "${fb2Name}" succeeded`);
              return { text: text2, modelUsed: `${fb2Name} (Fallback 2)`, fallbackUsed: true };
            } catch (fb2Err: any) {
              db.addLog('error', 'AI', `Fallback 2 "${fb2Name}" also failed: ${fb2Err.message}`);
            }
          }
        }
      }

      // If all attempts failed, throw the primary error with actionable guidance
      throw new Error(`AI generation failed with ${primaryName}: ${primaryErr.message}`);
    }
  }

  /**
   * Dispatches model prompt generation to the appropriate adapter
   */
  public static async invokeModelDirect(
    model: AIModelConfig,
    prompt: string,
    systemPrompt?: string
  ): Promise<string> {
    const adapter = AdapterRegistry.getAdapter(model);
    return adapter.generate(model, prompt, systemPrompt);
  }

  /**
   * Analyzes a product using the selected AI model and returns structured JSON
   */
  public static async analyzeProduct(product: Product, tavilyContext?: string): Promise<NonNullable<Product['aiAnalysis']>> {
    const brand = db.getBrandSettings();
    const prompt = `Analyze this product from ShopBase BD for the Bangladesh market.

Product Title: ${product.title}
Source Price: ${product.price} BDT
Calculated Selling Price: ${product.sellingPrice} BDT
Category: ${product.category}
Description: ${product.description}
Features: ${product.features.join(' | ')}
Brand Name: ${brand.brandName}
Preferred Language: ${brand.language}
Tavily Web Research Context: ${tavilyContext || 'No additional web search context provided.'}

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

    const { text, modelUsed } = await this.executeForTask('productAnalysis', prompt);

    // Extract JSON safely
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI did not return a valid JSON structure for product analysis.');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      summary: parsed.summary || product.title,
      keySellingPoints: parsed.keySellingPoints || product.features.slice(0, 3),
      targetCustomer: parsed.targetCustomer || 'Bangladeshi online shoppers',
      marketingAngle: parsed.marketingAngle || 'Best value for money',
      shortHook: parsed.shortHook || `অসাধারণ অফারে কিনুন ${product.title}!`,
      benefits: parsed.benefits || product.features.slice(0, 3),
      cta: parsed.cta || brand.defaultCta,
      keywords: parsed.keywords || [product.title, 'ShopBase BD'],
      hashtags: parsed.hashtags || ['#ShopBaseBD', '#GadgetsBD'],
      modelUsed,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generates tailored social media content for Facebook, YouTube, or TikTok
   */
  public static async generateSocialContent(
    product: Product,
    platform: 'facebook' | 'youtube' | 'tiktok',
    contentType: 'post' | 'reel' | 'video' | 'short'
  ): Promise<{
    title?: string;
    caption: string;
    hook?: string;
    sellingPriceText?: string;
    cta?: string;
    hashtags: string[];
    tags?: string[];
    videoScript?: string;
    modelUsed: string;
  }> {
    const brand = db.getBrandSettings();
    let taskName: keyof TaskModelAssignments = 'generalMarketing';
    if (platform === 'facebook') taskName = contentType === 'reel' ? 'videoScript' : 'facebookCaption';
    else if (platform === 'youtube') taskName = 'youtubeContent';
    else if (platform === 'tiktok') taskName = contentType === 'video' ? 'videoScript' : 'tiktokContent';

    const prompt = `You are generating high-converting social media content for ShopBase BD.
Platform: ${platform.toUpperCase()}
Content Type: ${contentType.toUpperCase()}
Language: ${brand.language}
Product Title: ${product.title}
Selling Price: ${product.sellingPrice} BDT (Source Price: ${product.price} BDT)
Original Price: ${product.originalPrice ? product.originalPrice + ' BDT' : 'None'}
Features: ${product.features.join(', ')}
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
  "sellingPriceText": "${product.sellingPrice} টাকা",
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
      sellingPriceText: parsed.sellingPriceText || `${product.sellingPrice} টাকা`,
      cta: parsed.cta || brand.defaultCta,
      hashtags: parsed.hashtags || ['#ShopBaseBD'],
      tags: parsed.tags || [],
      videoScript: parsed.videoScript || undefined,
      modelUsed,
    };
  }
}
