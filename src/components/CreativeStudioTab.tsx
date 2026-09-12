import { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Send,
  RefreshCw,
  Sliders,
  FileText,
  Video,
  Hash,
  Share2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Product, PlatformType } from '../types.ts';
import { api } from '../api.ts';

interface CreativeStudioTabProps {
  products: Product[];
  selectedProduct: Product | null;
  onSelectProduct: (p: Product | null) => void;
  onAddToQueue: (product: Product, platform: PlatformType, customContent?: any) => void;
  onRefreshProducts: () => void;
}

export function CreativeStudioTab({
  products,
  selectedProduct,
  onSelectProduct,
  onAddToQueue,
  onRefreshProducts,
}: CreativeStudioTabProps) {
  const [tone, setTone] = useState<'high_converting' | 'casual' | 'premium' | 'urgency_sale'>('high_converting');
  const [language, setLanguage] = useState<'both' | 'bn' | 'en'>('both');
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customPrice, setCustomPrice] = useState<number>(1500);

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Generated results
  const [results, setResults] = useState<{
    headline: string;
    facebookPost: string;
    instagramCaption: string;
    tiktokScript: string;
    hashtags: string[];
  } | null>(selectedProduct?.aiGeneratedCopy || null);

  const handleGenerate = async () => {
    const titleToUse = selectedProduct ? selectedProduct.title : customTitle.trim();
    if (!titleToUse) {
      setError('Please choose a product or enter a title to generate marketing copy.');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const res = await api.generateAICopy({
        productId: selectedProduct ? selectedProduct.id : undefined,
        title: titleToUse,
        description: selectedProduct ? selectedProduct.description : customDesc,
        category: selectedProduct ? selectedProduct.category : 'General',
        price: selectedProduct ? selectedProduct.price : customPrice,
        currency: 'BDT',
        tone,
        language,
      });

      if (res.success) {
        setResults(res.data);
        onRefreshProducts();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate copy using Gemini.');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const pushGeneratedToQueue = (platform: PlatformType) => {
    if (!results) return;

    let caption = results.facebookPost;
    if (platform === 'instagram') caption = results.instagramCaption;
    if (platform === 'tiktok') caption = results.tiktokScript;

    const dummyProd: Product = selectedProduct || {
      id: `prod-temp-${Date.now()}`,
      title: customTitle || 'Custom Promotion',
      description: customDesc || '',
      price: customPrice || 0,
      currency: 'BDT',
      category: 'Promotion',
      stockStatus: 'in_stock',
      sku: 'PROMO-001',
      images: ['https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?w=600'],
      tags: ['AI Generated'],
      status: 'ready',
      createdAt: new Date().toISOString(),
    };

    onAddToQueue(dummyProd, platform, {
      caption,
      hashtags: results.hashtags,
      mediaUrl: dummyProd.images[0],
      callToAction: platform === 'tiktok' ? 'Watch Now' : 'Order Now (Cash on Delivery)',
    });
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold">AI Creative Studio & Marketing Engine</h2>
            <p className="text-xs text-slate-400">
              Generate culturally resonant, high-converting social copy with Google Gemini (Bengali + English).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Target Product */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Product:</label>
            <select
              value={selectedProduct ? selectedProduct.id : 'custom'}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  onSelectProduct(null);
                } else {
                  const p = products.find((prod) => prod.id === e.target.value) || null;
                  onSelectProduct(p);
                  if (p?.aiGeneratedCopy) {
                    setResults(p.aiGeneratedCopy);
                  }
                }
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="custom">-- Custom Product / Free Input --</option>
              {products.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.title} (৳{prod.price})
                </option>
              ))}
            </select>
          </div>

          {/* Tone Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Tone & Copy Strategy:</label>
            <select
              value={tone}
              onChange={(e: any) => setTone(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="high_converting">High-Converting (Cash on Delivery + Emotional Hook)</option>
              <option value="urgency_sale">Urgency & Flash Sale (সীমিত অফার! এখনই নিন)</option>
              <option value="premium">Premium Luxury & Elegance (আভিজাত্য ও কোয়ালিটি)</option>
              <option value="casual">Casual & Trendy Gen-Z (ভাইব ও স্টাইল)</option>
            </select>
          </div>

          {/* Language Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Language Mode:</label>
            <select
              value={language}
              onChange={(e: any) => setLanguage(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="both">Banglish Dual (বাংলা মূল পোস্ট + English Caption)</option>
              <option value="bn">Pure Bengali (বিশুদ্ধ বাংলা)</option>
              <option value="en">English (International Audience)</option>
            </select>
          </div>
        </div>

        {/* Custom fields if no product selected */}
        {!selectedProduct && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-800">
            <div>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Product Name (e.g. Wireless Bluetooth Speaker)..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500"
              />
            </div>
            <div>
              <input
                type="text"
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                placeholder="Key Features (e.g. 10hr battery, deep bass)..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500"
              />
            </div>
            <div>
              <input
                type="number"
                value={customPrice}
                onChange={(e) => setCustomPrice(Number(e.target.value))}
                placeholder="Price in ৳ BDT"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500"
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Model: <strong className="text-emerald-400">Gemini 2.5 Flash</strong> (Optimized for Bangla context)
          </span>
          <button
            id="studio-generate-btn"
            onClick={handleGenerate}
            disabled={generating}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-md shadow-amber-950/30 transition disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Crafting Copy...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Campaign Copy</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Generated Creative Outputs */}
      {results && (
        <div className="space-y-5">
          {/* Headline Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400">Catchy Campaign Hook</span>
              <p className="text-base font-bold text-slate-100 mt-0.5">{results.headline}</p>
            </div>
            <button
              onClick={() => copyToClipboard(results.headline, 'headline')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1"
            >
              {copiedKey === 'headline' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* 3 Channels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Facebook Post */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-xs font-bold">f</span>
                    <h3 className="text-sm font-bold">Facebook Post</h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard(results.facebookPost, 'fb')}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1"
                  >
                    {copiedKey === 'fb' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'fb' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed max-h-72 overflow-y-auto pr-2">
                  {results.facebookPost}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <button
                  onClick={() => pushGeneratedToQueue('facebook')}
                  className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Queue for Facebook</span>
                </button>
              </div>
            </div>

            {/* Instagram Caption */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                      ig
                    </span>
                    <h3 className="text-sm font-bold">Instagram Caption</h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard(results.instagramCaption, 'ig')}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1"
                  >
                    {copiedKey === 'ig' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'ig' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed max-h-72 overflow-y-auto pr-2">
                  {results.instagramCaption}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <button
                  onClick={() => pushGeneratedToQueue('instagram')}
                  className="w-full py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Queue for Instagram</span>
                </button>
              </div>
            </div>

            {/* TikTok Video Script */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400">
                      tk
                    </span>
                    <h3 className="text-sm font-bold">15s Reels / TikTok Script</h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard(results.tiktokScript, 'tiktok')}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1"
                  >
                    {copiedKey === 'tiktok' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'tiktok' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed max-h-72 overflow-y-auto pr-2 font-mono bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  {results.tiktokScript}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <button
                  onClick={() => pushGeneratedToQueue('tiktok')}
                  className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition border border-slate-700"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Queue for TikTok</span>
                </button>
              </div>
            </div>
          </div>

          {/* Hashtag Bundle */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center space-x-1">
                <Hash className="w-3.5 h-3.5 text-emerald-400" />
                <span>Optimized Bangladeshi E-Commerce Hashtags</span>
              </span>
              <button
                onClick={() => copyToClipboard(results.hashtags.join(' '), 'tags')}
                className="text-xs text-emerald-400 hover:underline flex items-center space-x-1"
              >
                {copiedKey === 'tags' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>Copy Tags</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {results.hashtags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-emerald-400 border border-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
