import React from 'react';
import {
  ShoppingBag,
  Cpu,
  Video,
  Send,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Layers,
  Facebook,
  Youtube,
  Share2,
} from 'lucide-react';
import { DashboardStats, Product, QueueItem } from '../types';

interface DashboardTabProps {
  stats: DashboardStats | null;
  products: Product[];
  queue: QueueItem[];
  setActiveTab: (tab: string) => void;
  onRunAuto: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  stats,
  products,
  queue,
  setActiveTab,
  onRunAuto,
}) => {
  return (
    <div className="space-y-6">
      {/* Workflow Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Automated E-Commerce Social Pipeline</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              ShopBase BD Product-to-Social Automation
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Extract high-resolution catalog items from ShopBase, research market angles with Tavily,
              generate natural Bangla copy with your chosen Cloud AI, synthesize 9:16 short video creatives,
              and manage automated social publishing with full duplicate protection.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('products')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center space-x-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Collect Products</span>
            </button>
            <button
              onClick={onRunAuto}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto Run Workflow</span>
            </button>
          </div>
        </div>

        {/* Visual Pipeline Flow */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="font-semibold text-slate-200">1. ShopBase BD</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Store Discovery</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="font-semibold text-slate-200">2. High-Res Images</div>
            <div className="text-[11px] text-emerald-400 mt-0.5">Quality Scored</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="font-semibold text-slate-200">3. Tavily Research</div>
            <div className="text-[11px] text-cyan-400 mt-0.5">BD Market Angles</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="font-semibold text-slate-200">4. Cloud AI Model</div>
            <div className="text-[11px] text-indigo-400 mt-0.5">Agnostic Multi-AI</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="font-semibold text-slate-200">5. 9:16 Video Studio</div>
            <div className="text-[11px] text-purple-400 mt-0.5">Reels / Shorts / TikTok</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="font-semibold text-slate-200">6. Review Queue</div>
            <div className="text-[11px] text-amber-400 mt-0.5">Human In The Loop</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="font-semibold text-slate-200">7. FB / YT / TikTok</div>
            <div className="text-[11px] text-pink-400 mt-0.5">Official APIs</div>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Products Collected</p>
            <p className="text-2xl font-bold text-white mt-1">{stats?.productsCollected || 0}</p>
            <p className="text-[11px] text-slate-500 mt-1">{stats?.newProducts || 0} unqueued</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">AI Content Generated</p>
            <p className="text-2xl font-bold text-white mt-1">{stats?.aiContentGenerated || 0}</p>
            <p className="text-[11px] text-indigo-400 mt-1">Multi-Model Agnostic</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">9:16 Video Creatives</p>
            <p className="text-2xl font-bold text-white mt-1">{stats?.videosGenerated || 0}</p>
            <p className="text-[11px] text-purple-400 mt-1">Reels, Shorts, TikTok</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
            <Video className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Posts Published</p>
            <p className="text-2xl font-bold text-white mt-1">{stats?.postsPublished || 0}</p>
            <p className="text-[11px] text-emerald-400 mt-1">{stats?.scheduledPosts || 0} scheduled</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Send className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grid: Connected Platforms & Recent Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Platform & AI Status */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                <Share2 className="w-4 h-4 text-indigo-400" />
                <span>Connected Social Platforms</span>
              </h3>
              <button
                onClick={() => setActiveTab('settings')}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                Configure
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center space-x-2.5">
                  <Facebook className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className="font-medium text-slate-200">Facebook Page & Reels</div>
                    <div className="text-[11px] text-slate-400">Graph API v19</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  stats?.connectedPlatforms.facebook ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'
                }`}>
                  {stats?.connectedPlatforms.facebook ? 'ONLINE' : 'NOT CONFIGURED'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center space-x-2.5">
                  <Youtube className="w-4 h-4 text-red-500" />
                  <div>
                    <div className="font-medium text-slate-200">YouTube Data API</div>
                    <div className="text-[11px] text-slate-400">Shorts & Video Upload</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  stats?.connectedPlatforms.youtube ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'
                }`}>
                  {stats?.connectedPlatforms.youtube ? 'ONLINE' : 'NOT CONFIGURED'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center space-x-2.5">
                  <Video className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="font-medium text-slate-200">TikTok Creator API</div>
                    <div className="text-[11px] text-slate-400">Short-Form Vertical Video</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  stats?.connectedPlatforms.tiktok ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'
                }`}>
                  {stats?.connectedPlatforms.tiktok ? 'ONLINE' : 'NOT CONFIGURED'}
                </span>
              </div>
            </div>
          </div>

          {/* Model Dispatcher Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>Multi-Cloud AI Architecture</span>
              </h3>
              <button
                onClick={() => setActiveTab('models')}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                Manage Models
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The application is strictly model-agnostic. You can assign different models for Product Analysis,
              Facebook Captions, YouTube SEO, or TikTok scripts, with automatic fallback protection.
            </p>
            <div className="mt-3 p-2 rounded-lg bg-slate-800 text-[11px] flex items-center justify-between">
              <span className="text-slate-400">Primary Model:</span>
              <span className="font-semibold text-indigo-300">{stats?.activeAiModel || 'gemini-flash'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Queue & Recent Products Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Publishing & Review Queue</span>
              </h3>
              <button
                onClick={() => setActiveTab('queue')}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
              >
                <span>View All ({queue.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {queue.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs">
                No items in queue yet. Collect products and run the full pipeline to generate creatives.
              </div>
            ) : (
              <div className="space-y-2.5">
                {queue.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-slate-200 capitalize">
                          {item.platform} • {item.contentType.replace('_', ' ')}
                        </span>
                        <span className={`text-[10px] px-2 py-0.2 rounded font-semibold uppercase ${
                          item.status === 'published'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : item.status === 'approved'
                            ? 'bg-blue-500/20 text-blue-300'
                            : item.status === 'scheduled'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-slate-700 text-slate-300'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-slate-300 font-medium truncate">{item.productTitle}</p>
                      <p className="text-slate-400 text-[11px] line-clamp-1 mt-0.5">{item.content.caption}</p>
                    </div>

                    <button
                      onClick={() => setActiveTab('queue')}
                      className="px-2.5 py-1 text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded text-[11px] transition whitespace-nowrap"
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Catalog Highlights */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span>Collected Catalog Sample</span>
              </h3>
              <button
                onClick={() => setActiveTab('products')}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
              >
                <span>Browse Products ({products.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {products.slice(0, 2).map((prod) => (
                <div
                  key={prod.id}
                  className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/60 flex space-x-3 text-xs"
                >
                  <img
                    src={prod.images[0]?.highResolutionImageUrl || prod.images[0]?.originalImageUrl}
                    alt={prod.title}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 object-cover rounded-lg bg-slate-800 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-200 line-clamp-1">{prod.title}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{prod.category}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-emerald-400 font-bold">{prod.sellingPrice} ৳</span>
                      <span className="text-[10px] text-slate-400 line-through">{prod.price} ৳</span>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 rounded">
                        +{prod.profit} ৳ profit
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
