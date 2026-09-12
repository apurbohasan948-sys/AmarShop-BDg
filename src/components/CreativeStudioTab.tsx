import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Layers,
  Music,
  Clock,
  Palette,
  Sliders,
  CheckCircle2,
  Send,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Product, VideoRenderSpec, QueueItem } from '../types';
import { api } from '../api';

interface CreativeStudioTabProps {
  products: Product[];
  selectedProduct: Product | null;
  onSelectProduct: (product: Product) => void;
  onRefresh: () => void;
  onGoToQueue: () => void;
}

export const CreativeStudioTab: React.FC<CreativeStudioTabProps> = ({
  products,
  selectedProduct,
  onSelectProduct,
  onRefresh,
  onGoToQueue,
}) => {
  const currentProduct = selectedProduct || products[0] || null;

  // Video Generator state
  const [duration, setDuration] = useState<number>(15);
  const [template, setTemplate] = useState<string>('modern_reels');
  const [selectedMusic, setSelectedMusic] = useState<string>('energetic_beat');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [videoSpec, setVideoSpec] = useState<VideoRenderSpec | null>(null);
  const [enqueuedSuccess, setEnqueuedSuccess] = useState<string | null>(null);

  // Custom text overlays state
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customHook, setCustomHook] = useState<string>('');
  const [customPriceText, setCustomPriceText] = useState<string>('');
  const [customCta, setCustomCta] = useState<string>('');

  // Slide playback timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && videoSpec && videoSpec.scenes.length > 0) {
      timer = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % videoSpec.scenes.length);
      }, (duration / videoSpec.scenes.length) * 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, videoSpec, duration]);

  // Update spec when product changes
  useEffect(() => {
    if (currentProduct) {
      setCustomTitle(currentProduct.title);
      setCustomHook('🔥 সেরা বাজেটে প্রিমিয়াম কোয়ালিটি!');
      setCustomPriceText(`অফার প্রাইস: ${currentProduct.sellingPrice} ৳`);
      setCustomCta('অর্ডার করতে ভিজিট করুন ShopBase BD');
      generateSpec(currentProduct, duration, template, selectedMusic);
    }
  }, [currentProduct?.id]);

  const generateSpec = async (
    prod: Product,
    dur: number,
    tpl: string,
    music: string
  ) => {
    try {
      const spec = await api.getVideoSpec({
        productId: prod.id,
        duration: dur,
        template: tpl,
        audioTrackId: music,
      });
      setVideoSpec(spec);
      setCurrentSlideIndex(0);
    } catch (err) {
      console.error('Failed to generate video spec:', err);
    }
  };

  const handleTemplateChange = (tpl: string) => {
    setTemplate(tpl);
    if (currentProduct) generateSpec(currentProduct, duration, tpl, selectedMusic);
  };

  const handleDurationChange = (dur: number) => {
    setDuration(dur);
    if (currentProduct) generateSpec(currentProduct, dur, template, selectedMusic);
  };

  const handleAddToQueue = async (targetPlatform: 'facebook_reel' | 'youtube_short' | 'tiktok_video') => {
    if (!currentProduct) return;
    setIsGenerating(true);
    setEnqueuedSuccess(null);

    const platform = targetPlatform === 'facebook_reel' ? 'facebook' : targetPlatform === 'youtube_short' ? 'youtube' : 'tiktok';

    const item: Partial<QueueItem> = {
      productId: currentProduct.id,
      productTitle: currentProduct.title,
      platform,
      contentType: targetPlatform,
      status: 'approved',
      content: {
        title: customTitle,
        caption: `${customHook}\n\n${currentProduct.description.slice(0, 150)}...\n\n💰 ${customPriceText}\n👉 ${customCta}\n\n#ShopBaseBD #BDOnlineShopping #GadgetBD`,
        hook: customHook,
        sellingPriceText: customPriceText,
        cta: customCta,
        hashtags: ['ShopBaseBD', 'SmartGadget', 'TikTokShopBD', 'ReelsBD'],
        mediaUrls: currentProduct.images.map(i => i.highResolutionImageUrl).slice(0, 3),
        videoDurationSeconds: duration,
        videoScript: `${customHook}. ${currentProduct.features.join('. ')}. ${customPriceText}. ${customCta}.`,
      },
    };

    try {
      await api.addToQueue(item);
      setEnqueuedSuccess(`Added 9:16 Video Creative to ${platform.toUpperCase()} publishing queue!`);
      onRefresh();
      setTimeout(() => setEnqueuedSuccess(null), 4000);
    } catch (err: any) {
      alert(`Error queuing creative: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentScene = videoSpec?.scenes[currentSlideIndex] || null;

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Video className="w-4 h-4" />
            <span>Automated 9:16 Short-Form Video Engine</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Creative Studio (Facebook Reels, YouTube Shorts, TikTok)
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Synthesize dynamic 9:16 portrait video creatives from ShopBase BD uncompressed images,
            timed transitions, animated price badges, Bangla typography, and audio tracks.
          </p>
        </div>

        {/* Product Picker */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 whitespace-nowrap">Select Product:</span>
          <select
            value={currentProduct?.id || ''}
            onChange={(e) => {
              const p = products.find((prod) => prod.id === e.target.value);
              if (p) onSelectProduct(p);
            }}
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500 max-w-xs truncate"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.sellingPrice} ৳)
              </option>
            ))}
          </select>
        </div>
      </div>

      {enqueuedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{enqueuedSuccess}</span>
          </div>
          <button
            onClick={onGoToQueue}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1"
          >
            <span>View in Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Studio Viewport & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: 9:16 Phone Simulation Canvas */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="text-xs font-semibold text-slate-400 mb-3 flex items-center space-x-2">
            <span>9:16 Vertical Preview (1080x1920)</span>
            <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-[10px]">
              Slide {currentSlideIndex + 1} of {videoSpec?.scenes.length || 1}
            </span>
          </div>

          {/* 9:16 Mobile Device Frame */}
          <div className="relative w-64 h-[510px] bg-black rounded-[36px] p-2.5 shadow-2xl border-4 border-slate-700 overflow-hidden select-none">
            {/* Camera notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-full z-30"></div>

            {/* Video Screen Content */}
            <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-slate-950 flex flex-col justify-between">
              {/* Background Product Image with Pan/Zoom Animation */}
              <div className="absolute inset-0 z-0">
                <img
                  src={
                    currentScene?.imageUrl ||
                    currentProduct?.images[0]?.highResolutionImageUrl ||
                    currentProduct?.images[0]?.originalImageUrl
                  }
                  alt="Product Frame"
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover transition-transform duration-1000 ease-out ${
                    isPlaying ? 'scale-110 translate-y-[-2%]' : 'scale-100'
                  }`}
                />
                {/* Gradient vignette for text contrast */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
              </div>

              {/* Top Layer: Branding & Header */}
              <div className="relative z-10 p-4 pt-7 text-center">
                <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white shadow">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>ShopBase BD Official</span>
                </div>
                <h4 className="mt-2 text-xs font-extrabold text-white text-shadow drop-shadow-md line-clamp-2 px-1">
                  {customTitle}
                </h4>
              </div>

              {/* Center Layer: Animated Feature Hook Card */}
              <div className="relative z-10 px-3">
                <div className="p-3 rounded-xl bg-slate-900/85 backdrop-blur-md border border-purple-500/40 text-center shadow-lg transition-all transform animate-in fade-in">
                  <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                    {currentScene ? `Scene ${currentScene.sceneNumber}: Highlights` : 'Featured Deal'}
                  </span>
                  <p className="text-xs font-bold text-white mt-1 leading-snug">
                    {currentScene?.textOverlay || customHook}
                  </p>
                </div>
              </div>

              {/* Bottom Layer: Pricing & Call to Action */}
              <div className="relative z-10 p-4 space-y-2">
                {/* Price Sticker */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-extrabold text-xs shadow-lg">
                  <span>{customPriceText}</span>
                  <span className="text-[10px] bg-white text-rose-600 px-1.5 py-0.5 rounded font-black uppercase">
                    Best Deal
                  </span>
                </div>

                {/* CTA Button */}
                <div className="w-full py-2 bg-white text-slate-900 font-bold text-xs rounded-xl text-center shadow-md flex items-center justify-center space-x-1">
                  <span>{customCta}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Player Controls Bar */}
          <div className="mt-4 flex items-center space-x-3 text-xs">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl flex items-center space-x-1.5 shadow"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause Preview' : 'Play Slideshow'}</span>
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentSlideIndex(0);
              }}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700"
              title="Reset to beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Side: Generator Controls, Overlays & Template Chooser */}
        <div className="lg:col-span-7 space-y-4">
          {/* Style Template Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-3">
              <Palette className="w-4 h-4 text-purple-400" />
              <span>Video Theme & Motion Template</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: 'modern_reels', name: 'Modern Reels', desc: 'Fast zooms & bold gradient lower-thirds' },
                { id: 'luxury_showcase', name: 'Luxury Elegance', desc: 'Slow cinematic pans & gold accents' },
                { id: 'minimal_clean', name: 'Minimalist Clean', desc: 'Crisp white typography & smooth fades' },
                { id: 'flash_deal', name: 'Flash Deal Energy', desc: 'High-contrast badges & urgent CTAs' },
              ].map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => handleTemplateChange(tpl.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    template === tpl.id
                      ? 'border-purple-500 bg-purple-500/10 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-slate-200">{tpl.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-tight">{tpl.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Duration & Audio Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Video Duration</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {[15, 30, 45, 60].map((dur) => (
                  <button
                    key={dur}
                    onClick={() => handleDurationChange(dur)}
                    className={`py-2 rounded-xl font-semibold transition ${
                      duration === dur
                        ? 'bg-cyan-600 text-white shadow'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {dur}s
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">
                15s is optimized for high completion rate on Shorts and TikTok.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center space-x-1.5">
                <Music className="w-3.5 h-3.5 text-pink-400" />
                <span>Background Audio Track</span>
              </label>
              <select
                value={selectedMusic}
                onChange={(e) => {
                  setSelectedMusic(e.target.value);
                  if (currentProduct) generateSpec(currentProduct, duration, template, e.target.value);
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
              >
                <option value="energetic_beat">Upbeat Electronic Beat (120 BPM)</option>
                <option value="luxury_ambient">Luxury Ambient Lounge (Chill)</option>
                <option value="viral_acoustic">Acoustic Pop Trend (Warm)</option>
                <option value="bass_drop">Punchy Bassline Gadget Trend</option>
              </select>
              <p className="text-[10px] text-slate-500 mt-1.5">
                Royalty-free background track included in final spec render.
              </p>
            </div>
          </div>

          {/* Text Overlays Customizer */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Bangla & English Visual Text Overlays</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Headline Hook</label>
                <input
                  type="text"
                  value={customHook}
                  onChange={(e) => setCustomHook(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Price Badge Sticker</label>
                <input
                  type="text"
                  value={customPriceText}
                  onChange={(e) => setCustomPriceText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Call to Action (CTA)</label>
              <input
                type="text"
                value={customCta}
                onChange={(e) => setCustomCta(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
              />
            </div>
          </div>

          {/* Direct Publish / Enqueue Buttons */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-white">Ready to Enqueue Video Creative?</h4>
              <p className="text-[11px] text-slate-400">
                Adds the finalized 9:16 video creative to your chosen social channel for review.
              </p>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={() => handleAddToQueue('facebook_reel')}
                disabled={isGenerating || !currentProduct}
                className="flex-1 sm:flex-none px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center space-x-1 shadow"
              >
                <span>FB Reel</span>
              </button>
              <button
                onClick={() => handleAddToQueue('youtube_short')}
                disabled={isGenerating || !currentProduct}
                className="flex-1 sm:flex-none px-3 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center space-x-1 shadow"
              >
                <span>YT Short</span>
              </button>
              <button
                onClick={() => handleAddToQueue('tiktok_video')}
                disabled={isGenerating || !currentProduct}
                className="flex-1 sm:flex-none px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center space-x-1 shadow"
              >
                <span>TikTok</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
