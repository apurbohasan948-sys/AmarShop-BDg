import { GoogleGenAI } from '@google/genai';
import { db } from '../db.ts';

let geminiClient: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    geminiClient = new GoogleGenAI(apiKey ? { apiKey } : {});
  }
  return geminiClient;
}

export interface GenerateCopyParams {
  title: string;
  description?: string;
  category?: string;
  price?: number;
  currency?: string;
  tone?: 'high_converting' | 'casual' | 'premium' | 'urgency_sale';
  language?: 'bn' | 'en' | 'both';
}

export interface GeneratedCopyResult {
  headline: string;
  facebookPost: string;
  instagramCaption: string;
  tiktokScript: string;
  hashtags: string[];
}

export class AIModelManager {
  public static async generateProductCopy(params: GenerateCopyParams): Promise<GeneratedCopyResult> {
    const {
      title,
      description = '',
      category = 'General',
      price = 0,
      currency = 'BDT',
      tone = 'high_converting',
      language = 'both',
    } = params;

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = getGemini();
        const prompt = `You are an elite Bangladeshi e-commerce copywriter for "AmarShop BD" (an online shop in Bangladesh).
Write highly engaging, high-converting social media marketing materials for the following product:
- Product Title: ${title}
- Description: ${description}
- Category: ${category}
- Price: ${currency} ${price}
- Tone: ${tone} (Options: high_converting, casual, premium, urgency_sale)
- Language preference: ${language} (Write culturally resonant Bengali / Banglish / English as requested, emphasizing nationwide Cash on Delivery, home delivery, premium quality, and easy ordering).

You MUST respond strictly in valid JSON format with the following schema:
{
  "headline": "A catchy headline with emojis",
  "facebookPost": "Full Facebook post formatted with bullet points, emotional hooks, product perks, pricing info, and call to action to message or order",
  "instagramCaption": "Short, aesthetic Instagram caption with emojis and CTA",
  "tiktokScript": "Short-form video script with [Visual], [Voiceover], and [Text on Screen] timestamps for 15-30 seconds",
  "hashtags": ["#AmarShopBD", "#tag2", "#tag3", "#tag4", "#tag5"]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text || '';
        try {
          const parsed = JSON.parse(rawText);
          db.addLog(
            'ai',
            'success',
            `AI generated marketing copy for "${title}"`,
            `Model: gemini-2.5-flash | Tone: ${tone}`
          );
          return {
            headline: parsed.headline || `✨ স্পেশাল অফার: ${title}`,
            facebookPost: parsed.facebookPost || `AmarShop BD নিয়ে এলো প্রিমিয়াম ${title}। এখনই অর্ডার করুন!`,
            instagramCaption: parsed.instagramCaption || `Elevate your lifestyle with ${title}. Available now at AmarShop BD!`,
            tiktokScript: parsed.tiktokScript || `[Visual]: Close up of ${title}\n[Voiceover]: সেরা কোয়ালিটির ${title} পাচ্ছেন AmarShop BD-তে!`,
            hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : ['#AmarShopBD', '#BangladeshShopping'],
          };
        } catch (jsonErr) {
          console.warn('Failed to parse Gemini JSON output, creating structured fallback:', jsonErr);
        }
      } catch (err: any) {
        console.error('Gemini API call failed, using intelligent fallback:', err?.message || err);
        db.addLog(
          'ai',
          'warn',
          `Gemini API invocation note for "${title}": ${err?.message || 'Using smart fallback'}`,
          'Generated authentic local Bangladeshi e-commerce copy template.'
        );
      }
    }

    // High quality intelligent template fallback when API key is unavailable or rate limited
    const priceFormatted = price > 0 ? `৳${price.toLocaleString()}` : 'সাশ্রয়ী মূল্য';
    const fallbackHeadline = `✨ প্রিমিয়াম কোয়ালিটি ${title} – AmarShop BD এক্সক্লুসিভ কালেকশন!`;
    const fallbackFb = `🔥 এবার আপনার শপিং হবে আরও সহজ ও নিশ্চিন্ত!\n\n${title} নিয়ে এলো AmarShop BD।\n\n🔹 সেরা ফিনিশিং ও প্রিমিয়াম কোয়ালিটি\n🔹 দ্রুত হোম ডেলিভারি সমগ্র বাংলাদেশে\n🔹 প্রোডাক্ট হাতে পেয়ে মূল্য পরিশোধের সুবিধা (ক্যাশ অন ডেলিভারি)\n\n💰 স্পেশাল অফার প্রাইজ: ${priceFormatted}\n\n👉 অর্ডার কনফার্ম করতে এখনি "Send Message" বাটনে ইনবক্স করুন অথবা আপনার নাম, ঠিকানা ও মোবাইল নম্বর পাঠিয়ে দিন।`;
    const fallbackIg = `Upgrade your daily lifestyle with ${title} ✨ Exceptional craftsmanship & verified quality. Special price: ${priceFormatted}. Cash on delivery all over Bangladesh! 🇧🇩 Link in bio to purchase.`;
    const fallbackTiktok = `[Hook 0-3s]: "অনলাইনে শপিং করতে গিয়ে ঠকছেন? এবার দেখুন আসল প্রিমিয়াম কোয়ালিটি!"\n[Visual 3-8s]: 360-ডিগ্রি ভিউ ও ডিটেইল শোকেস: ${title}\n[Body 8-12s]: "অরিজিনাল প্রোডাক্ট পাচ্ছেন মাত্র ${priceFormatted} টাকায় AmarShop BD-তে!"\n[CTA 12-15s]: "স্টক ফুরিয়ে যাওয়ার আগেই এখনই অর্ডার করতে মেসেজ দিন!"`;
    const fallbackTags = [
      '#AmarShopBD',
      '#BDOnlineShop',
      '#DhakaShopping',
      '#CashOnDeliveryBD',
      '#ShopBaseBD',
      `#${category.replace(/\s+/g, '')}`,
    ];

    db.addLog('ai', 'info', `Smart copy generated for "${title}"`, `Category: ${category} | Price: ${priceFormatted}`);

    return {
      headline: fallbackHeadline,
      facebookPost: fallbackFb,
      instagramCaption: fallbackIg,
      tiktokScript: fallbackTiktok,
      hashtags: fallbackTags,
    };
  }

  public static async testModel(provider: string, modelId: string): Promise<{ success: boolean; message: string }> {
    if (provider === 'gemini') {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return { success: false, message: 'GEMINI_API_KEY is not configured in environment.' };
      }
      try {
        const ai = getGemini();
        const res = await ai.models.generateContent({
          model: modelId || 'gemini-2.5-flash',
          contents: 'Say "AmarShop BD AI Active" in 5 words or less.',
        });
        return { success: true, message: `Connected to Gemini! Response: "${res.text?.trim()}"` };
      } catch (err: any) {
        return { success: false, message: `Gemini test failed: ${err?.message || err}` };
      }
    }

    return { success: true, message: `Provider "${provider}" pinged successfully (simulated mock handshake).` };
  }
}
