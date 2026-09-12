import { GoogleGenAI } from '@google/genai';
import { AIModelConfig, Product, TaskModelAssignments } from '../../src/types';
import { db } from '../db';

export interface ModelTestResult {
  success: boolean;
  modelId: string;
  modelName: string;
  latencyMs: number;
  message: string;
  sampleResponse?: string;
  status: 'online' | 'error';
}

export class AIModelManager {
  /**
   * Test an AI model configuration with a real minimal request
   */
  public static async testModel(modelConfig: AIModelConfig): Promise<ModelTestResult> {
    const start = Date.now();
    const testPrompt = 'Say "OK - ShopBase Automation Connected" in 5 words or less.';

    try {
      const responseText = await this.invokeModelDirect(modelConfig, testPrompt, 'You are a diagnostic health checker. Reply very concisely.');
      const latencyMs = Date.now() - start;

      const updatedModel: AIModelConfig = {
        ...modelConfig,
        status: 'online',
        latencyMs,
        lastTestedAt: new Date().toISOString(),
        errorMessage: undefined,
      };
      db.saveModel(updatedModel);
      db.addLog('success', 'AI', `Model ${modelConfig.name} passed test (${latencyMs}ms): ${responseText.slice(0, 60)}`);

      return {
        success: true,
        modelId: modelConfig.id,
        modelName: modelConfig.modelName,
        latencyMs,
        message: `Connection successful! Model responded in ${(latencyMs / 1000).toFixed(2)}s`,
        sampleResponse: responseText.trim(),
        status: 'online',
      };
    } catch (err: any) {
      const latencyMs = Date.now() - start;
      const errorMsg = err.message || 'Unknown error occurred';

      let userMsg = errorMsg;
      if (errorMsg.includes('401') || errorMsg.includes('403') || errorMsg.includes('auth') || errorMsg.includes('API key')) {
        userMsg = '✕ API key invalid or unauthorized (HTTP 401/403)';
      } else if (errorMsg.includes('404') || errorMsg.includes('not found') || errorMsg.includes('model')) {
        userMsg = `✕ Model "${modelConfig.modelName}" unavailable or invalid endpoint`;
      } else if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('rate limit')) {
        userMsg = '✕ Rate limit or quota exceeded (HTTP 429)';
      }

      const updatedModel: AIModelConfig = {
        ...modelConfig,
        status: 'error',
        latencyMs,
        lastTestedAt: new Date().toISOString(),
        errorMessage: userMsg,
      };
      db.saveModel(updatedModel);
      db.addLog('error', 'AI', `Model ${modelConfig.name} test failed: ${userMsg}`);

      return {
        success: false,
        modelId: modelConfig.id,
        modelName: modelConfig.modelName,
        latencyMs,
        message: userMsg,
        status: 'error',
      };
    }
  }

  /**
   * Execute a prompt using the specified task's configured model, with fallback support
   */
  public static async executeForTask(
    task: keyof TaskModelAssignments,
    prompt: string,
    customSystemPrompt?: string
  ): Promise<{ text: string; modelUsed: string; fallbackUsed: boolean }> {
    const assignments = db.getTaskAssignments();
    const primaryModelId = (assignments[task] as string) || assignments.generalMarketing || 'gemini-flash';
    const models = db.getModels();

    let primaryModel = models.find(m => m.id === primaryModelId && m.isEnabled);
    if (!primaryModel) {
      // Fallback to any enabled model or default
      primaryModel = models.find(m => m.isDefault && m.isEnabled) || models.find(m => m.isEnabled);
    }

    if (!primaryModel) {
      throw new Error('No AI model is currently enabled. Please enable or add a model in AI Settings.');
    }

    const sysPrompt = customSystemPrompt || primaryModel.systemPrompt;

    // Try primary model
    try {
      const text = await this.invokeModelDirect(primaryModel, prompt, sysPrompt);
      return { text, modelUsed: primaryModel.name, fallbackUsed: false };
    } catch (primaryErr: any) {
      db.addLog('warn', 'AI', `Primary model "${primaryModel.name}" failed: ${primaryErr.message}`);

      // Check if fallback is enabled
      if (assignments.enableFallback && assignments.fallbackModelId && assignments.fallbackModelId !== primaryModel.id) {
        const fallbackModel = models.find(m => m.id === assignments.fallbackModelId && m.isEnabled);
        if (fallbackModel) {
          db.addLog('info', 'AI', `Attempting fallback model: "${fallbackModel.name}"`);
          try {
            const fallbackText = await this.invokeModelDirect(fallbackModel, prompt, sysPrompt);
            db.addLog('success', 'AI', `Fallback model "${fallbackModel.name}" succeeded`);
            return { text: fallbackText, modelUsed: fallbackModel.name, fallbackUsed: true };
          } catch (fallbackErr: any) {
            db.addLog('error', 'AI', `Fallback model "${fallbackModel.name}" also failed: ${fallbackErr.message}`);
          }
        }
      }

      // If all failed, provide rich mock fallback response if in test environment or throw
      throw primaryErr;
    }
  }

  /**
   * Low-level dispatcher to invoke any AI provider
   */
  public static async invokeModelDirect(
    model: AIModelConfig,
    prompt: string,
    systemPrompt?: string
  ): Promise<string> {
    const effectiveSystemPrompt = systemPrompt || model.systemPrompt || '';

    // 1. Gemini Provider
    if (model.provider === 'gemini') {
      const apiKey = model.apiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key is required. Please set it in model settings.');
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: model.modelName || 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: effectiveSystemPrompt || undefined,
          temperature: model.temperature ?? 0.7,
          maxOutputTokens: model.maxTokens || 2048,
        },
      });
      return response.text || '';
    }

    // 2. Anthropic Provider
    if (model.provider === 'anthropic') {
      if (!model.apiKey) throw new Error('Anthropic API key is missing');
      const url = `${model.baseUrl || 'https://api.anthropic.com/v1'}${model.endpoint || '/messages'}`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': model.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: model.modelName || 'claude-3-5-sonnet-20241022',
          system: effectiveSystemPrompt,
          messages: [{ role: 'user', content: prompt }],
          temperature: model.temperature ?? 0.7,
          max_tokens: model.maxTokens || 2048,
        }),
        signal: AbortSignal.timeout(25000),
      });

      if (!resp.ok) {
        throw new Error(`Anthropic error (${resp.status}): ${await resp.text()}`);
      }
      const data = await resp.json();
      return data.content?.[0]?.text || '';
    }

    // 3. Custom REST API with Template
    if (model.provider === 'custom' && model.requestTemplate) {
      return this.invokeCustomTemplateModel(model, prompt, effectiveSystemPrompt);
    }

    // 4. OpenAI & OpenAI-Compatible (OpenAI, Groq, DeepSeek, OpenRouter, Mistral)
    const baseUrl = (model.baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '');
    const endpoint = (model.endpoint || '/chat/completions').startsWith('/')
      ? model.endpoint || '/chat/completions'
      : `/${model.endpoint}`;
    const targetUrl = `${baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (model.authHeaderType === 'Bearer' && model.apiKey) {
      headers['Authorization'] = `Bearer ${model.apiKey}`;
    } else if (model.authHeaderType === 'x-api-key' && model.apiKey) {
      headers['x-api-key'] = model.apiKey;
    } else if (model.customHeaders) {
      Object.assign(headers, model.customHeaders);
    }

    const messages = [];
    if (effectiveSystemPrompt) {
      messages.push({ role: 'system', content: effectiveSystemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const body = {
      model: model.modelName,
      messages,
      temperature: model.temperature ?? 0.7,
      max_tokens: model.maxTokens || 2048,
    };

    const resp = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(25000),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Model API error (${resp.status}): ${errText}`);
    }

    const json = await resp.json();
    return json.choices?.[0]?.message?.content || '';
  }

  /**
   * Handles custom templated APIs with dynamic JSON path resolution
   */
  private static async invokeCustomTemplateModel(
    model: AIModelConfig,
    prompt: string,
    systemPrompt: string
  ): Promise<string> {
    const baseUrl = (model.baseUrl || '').replace(/\/$/, '');
    const endpoint = (model.endpoint || '').startsWith('/') ? model.endpoint : `/${model.endpoint}`;
    const targetUrl = `${baseUrl}${endpoint}`;

    let renderedTemplate = model.requestTemplate || '{}';
    renderedTemplate = renderedTemplate
      .replace(/{{model}}/g, model.modelName)
      .replace(/{{systemPrompt}}/g, JSON.stringify(systemPrompt).slice(1, -1))
      .replace(/{{prompt}}/g, JSON.stringify(prompt).slice(1, -1))
      .replace(/{{temperature}}/g, String(model.temperature ?? 0.7))
      .replace(/{{maxTokens}}/g, String(model.maxTokens ?? 2048));

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (model.apiKey) {
      headers['Authorization'] = `Bearer ${model.apiKey}`;
    }
    if (model.customHeaders) {
      Object.assign(headers, model.customHeaders);
    }

    const resp = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: renderedTemplate,
      signal: AbortSignal.timeout(25000),
    });

    if (!resp.ok) {
      throw new Error(`Custom API returned ${resp.status}: ${await resp.text()}`);
    }

    const data = await resp.json();
    const path = model.responsePath || 'choices[0].message.content';
    return this.resolvePath(data, path) || JSON.stringify(data);
  }

  private static resolvePath(obj: any, path: string): string {
    try {
      const keys = path.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '').split('.');
      let cur = obj;
      for (const k of keys) {
        if (cur === undefined || cur === null) return '';
        cur = cur[k];
      }
      return typeof cur === 'string' ? cur : JSON.stringify(cur);
    } catch {
      return '';
    }
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
