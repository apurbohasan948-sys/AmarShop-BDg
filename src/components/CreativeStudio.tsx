import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Video, 
  Send, 
  Check, 
  Copy, 
  Share2, 
  RefreshCw, 
  Play, 
  Film, 
  Sliders, 
  Clock, 
  Facebook, 
  Youtube, 
  Layers 
} from 'lucide-react';
import { Product } from './ProductsCollector';

interface CreativeStudioProps {
  selectedProduct: Product | null;
  onPostScheduled: () => void;
}

export const CreativeStudio: React.FC<CreativeStudioProps> = ({ 
  selectedProduct, 
  onPostScheduled 
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(selectedProduct);
  const [platform, setPlatform] = useState<'facebook' | 'youtube' | 'tiktok' | 'reels'>('reels');
  const [tone, setTone] = useState<'engaging' | 'promotional' | 'storytelling' | 'viral'>('viral');

  // AI Content State
  const [generatingCopy, setGeneratingCopy] = useState(false);
  const [generatedHook, setGeneratedHook] = useState('');
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [generatedCTA, setGeneratedCTA] = useState('');
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);
  const [modelUsed, setModelUsed] = useState('');

  // Video State
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [videoProject, setVideoProject] = useState<any | null>(null);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  // Queue State
  const [scheduling, setScheduling] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Load products list for dropdown
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
          if (!currentProduct && data.products.length > 0) {
            setCurrentProduct(data.products[0]);
          }
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      setCurrentProduct(selectedProduct);
    }
  }, [selectedProduct]);

  // Generate Social Copy
  const handleGenerateCopy = async () => {
    if (!currentProduct) return;
    try {
      setGeneratingCopy(true);
      setSuccessMessage('');
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: currentProduct.id,
          productTitle: currentProduct.title,
          productDescription: currentProduct.description,
          platform,
          tone
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setGeneratedHook(data.data.hook || '');
        setGeneratedCaption(data.data.caption || '');
        setGeneratedCTA(data.data.callToAction || '');
        setGeneratedHashtags(data.data.hashtags || []);
        setModelUsed(`${data.data.provider} (${data.data.modelUsed})`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingCopy(false);
    }
  };

  // Generate Video Storyboard
  const handleGenerateVideo = async () => {
    if (!currentProduct) return;
    try {
      setGeneratingVideo(true);
      const res = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productTitle: currentProduct.title,
          productPrice: currentProduct.price,
          productImage: currentProduct.imageUrl,
          platform
        })
      });
      const data = await res.json();
      if (data.success && data.project) {
        setVideoProject(data.project);
        setActiveSceneIndex(0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingVideo(false);
    }
  };

  // Add to Publishing Queue
  const handleAddToQueue = async () => {
    if (!currentProduct) return;
    try {
      setScheduling(true);
      const fullCaption = `${generatedHook}\n\n${generatedCaption}\n\n${generatedCTA}\n\n${generatedHashtags.join(' ')}`;
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: currentProduct.id,
          productTitle: currentProduct.title,
          productImage: currentProduct.imageUrl,
          platforms: [platform],
          caption: fullCaption.trim() || `Check out the new ${currentProduct.title}!`,
          hashtags: generatedHashtags,
          scheduledTime: new Date(Date.now() + 3600000 * 2).toISOString()
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Post successfully scheduled into the Publishing Queue!');
        onPostScheduled();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setScheduling(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Film className="w-6 h-6 text-emerald-400" />
          Creative AI Studio & Video Generator
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Generate platform-tuned viral captions, attention hooks, and multi-scene video scripts powered by your active Cloud AI model.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-xs opacity-60 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Product & Config Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Select Product */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Product
            </label>
            <select
              value={currentProduct?.id || ''}
              onChange={(e) => {
                const found = products.find(p => p.id === e.target.value);
                if (found) setCurrentProduct(found);
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title} (${p.price.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Select Platform */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Destination Platform
            </label>
            <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {(['reels', 'tiktok', 'facebook', 'youtube'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`py-1.5 text-xs font-bold capitalize rounded-md transition ${
                    platform === p
                      ? 'bg-emerald-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Copy Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="viral">Viral & Punchy (High CTR)</option>
              <option value="engaging">Engaging & Relatable</option>
              <option value="promotional">Promotional & Urgent</option>
              <option value="storytelling">Storytelling & Transformation</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleGenerateCopy}
            disabled={generatingCopy || !currentProduct}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800/40 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4" />
            {generatingCopy ? 'Generating AI Post...' : 'Generate AI Copy & Hooks'}
          </button>

          <button
            type="button"
            onClick={handleGenerateVideo}
            disabled={generatingVideo || !currentProduct}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-900/40 text-white font-bold rounded-lg text-xs flex items-center gap-2 transition"
          >
            <Video className="w-4 h-4" />
            {generatingVideo ? 'Synthesizing Storyboard...' : 'Generate 5-Scene Video'}
          </button>
        </div>
      </div>

      {/* Two Column Output: Copy on Left, Video on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: AI Post Copy (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Social Post Blueprint
            </h2>
            {modelUsed && (
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {modelUsed}
              </span>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            {/* Hook */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Viral Hook (First 3 Seconds)
              </label>
              <textarea
                rows={2}
                value={generatedHook}
                onChange={(e) => setGeneratedHook(e.target.value)}
                placeholder="Hook will appear here after clicking Generate..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-emerald-300 font-medium placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Caption */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Body Caption
              </label>
              <textarea
                rows={4}
                value={generatedCaption}
                onChange={(e) => setGeneratedCaption(e.target.value)}
                placeholder="Full social post copy..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Call to Action */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Call to Action (CTA)
              </label>
              <input
                type="text"
                value={generatedCTA}
                onChange={(e) => setGeneratedCTA(e.target.value)}
                placeholder="Tap the link in bio..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Hashtags */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Targeted Hashtags
              </label>
              <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg min-h-[40px]">
                {generatedHashtags.length === 0 ? (
                  <span className="text-xs text-slate-600">No hashtags generated yet</span>
                ) : (
                  generatedHashtags.map((tag, idx) => (
                    <span key={idx} className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
                      {tag}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleAddToQueue}
                disabled={scheduling || !currentProduct}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800/40 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition"
              >
                <Send className="w-4 h-4" />
                {scheduling ? 'Scheduling Post...' : 'Schedule to Publishing Queue'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: 5-Scene Video Storyboard (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-cyan-400" />
              Social Video Generator
            </h2>
            {videoProject && (
              <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20">
                {videoProject.aspectRatio} • {videoProject.estimatedDuration}s
              </span>
            )}
          </div>

          {videoProject ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden space-y-4 p-5">
              {/* Visual Scene Simulation Player */}
              <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                {currentProduct && (
                  <img
                    src={currentProduct.imageUrl}
                    alt="Scene preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

                <div className="relative z-10 text-center px-4">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 mb-1">
                    Scene {activeSceneIndex + 1} / {videoProject.scenes.length} ({videoProject.scenes[activeSceneIndex].timestamp})
                  </div>
                  <div className="text-sm font-extrabold text-white bg-slate-950/80 px-3 py-1.5 rounded-lg border border-white/10 shadow-lg max-w-sm mx-auto">
                    {videoProject.scenes[activeSceneIndex].onScreenText}
                  </div>
                  <div className="text-xs text-slate-300 mt-2 italic max-w-md mx-auto">
                    🎙️ "{videoProject.scenes[activeSceneIndex].voiceoverScript}"
                  </div>
                </div>

                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-slate-400 font-mono">
                  {videoProject.scenes[activeSceneIndex].cameraMovement}
                </div>
              </div>

              {/* Scene selector tabs */}
              <div className="grid grid-cols-5 gap-1.5">
                {videoProject.scenes.map((scene: any, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSceneIndex(idx)}
                    className={`py-2 px-1 text-center rounded-lg border text-[11px] transition ${
                      activeSceneIndex === idx
                        ? 'bg-cyan-500/20 border-cyan-500 text-white font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Scene {idx + 1}
                  </button>
                ))}
              </div>

              {/* Scene Breakdown Info */}
              <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-lg text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-semibold text-slate-300">Visual Direction:</span>
                  <span className="text-[11px] font-mono text-cyan-400">{videoProject.scenes[activeSceneIndex].timestamp}</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {videoProject.scenes[activeSceneIndex].visualDescription}
                </p>
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800">
                  <span>Audio Track: {videoProject.audioTrack}</span>
                  <span className="text-emerald-400 font-medium">Ready for Render</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-xl space-y-3">
              <Video className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No Video Storyboard Generated</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Click "Generate 5-Scene Video" above to create an automated video script with hooks, scene timestamps, and on-screen typography.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
