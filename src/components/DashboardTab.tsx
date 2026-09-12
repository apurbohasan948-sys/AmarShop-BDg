import { useState } from 'react';
import {
  Package,
  Send,
  CheckCircle,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Clock,
  RefreshCw,
  PlusCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Product, PublishingQueueItem, SystemLog } from '../types.ts';

interface DashboardTabProps {
  products: Product[];
  queue: PublishingQueueItem[];
  logs: SystemLog[];
  onNavigate: (tab: string) => void;
  onRefreshData: () => void;
  onPublishNow: (id: string) => void;
}

export function DashboardTab({
  products,
  queue,
  logs,
  onNavigate,
  onRefreshData,
  onPublishNow,
}: DashboardTabProps) {
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const pendingQueue = queue.filter((q) => q.status === 'pending' || q.status === 'approved');
  const publishedQueue = queue.filter((q) => q.status === 'published');
  const productsWithAICopy = products.filter((p) => p.aiGeneratedCopy);

  const handleInstantPublish = async (id: string) => {
    setPublishingId(id);
    try {
      await onPublishNow(id);
    } finally {
      setPublishingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 rounded-2xl border border-slate-800 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
              Active Control Room
            </span>
            <span className="text-xs text-slate-400">Bangladesh eCommerce Cloud</span>
          </div>
          <h1 className="text-2xl font-bold mt-2">AmarShop BD Automation Core</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Automating ShopBase product crawling, high-converting Bangla & English AI copy generation with Google Gemini, and multi-channel publishing to Facebook, Instagram & TikTok.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="dash-refresh-btn"
            onClick={onRefreshData}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh State</span>
          </button>
          <button
            id="dash-collect-btn"
            onClick={() => onNavigate('products')}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Collect Products</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl text-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Cataloged Products</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold tracking-tight">{products.length}</span>
            <span className="text-xs text-emerald-400 font-medium">In Stock</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>ShopBase items</span>
            <button onClick={() => onNavigate('products')} className="text-blue-400 hover:underline flex items-center">
              View All <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>

        {/* AI Optimized Copy */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl text-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">AI Copy Generated</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold tracking-tight">{productsWithAICopy.length}</span>
            <span className="text-xs text-amber-300 font-medium">Gemini Powered</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>{Math.round((productsWithAICopy.length / (products.length || 1)) * 100)}% coverage</span>
            <button onClick={() => onNavigate('creative')} className="text-amber-400 hover:underline flex items-center">
              Open Studio <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Active Queue */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl text-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Scheduled in Queue</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold tracking-tight">{pendingQueue.length}</span>
            <span className="text-xs text-purple-300 font-medium">Awaiting Dispatch</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>FB / IG / TikTok</span>
            <button onClick={() => onNavigate('queue')} className="text-purple-400 hover:underline flex items-center">
              Manage Queue <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Published Posts */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl text-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Successful Dispatches</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold tracking-tight">{publishedQueue.length}</span>
            <span className="text-xs text-emerald-400 font-medium">Live On Channels</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>100% Delivery Rate</span>
            <button onClick={() => onNavigate('queue')} className="text-emerald-400 hover:underline flex items-center">
              History <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Split: Scheduled Queue & Real-Time Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Publishing Queue Preview */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold">Scheduled Social Media Dispatches</h2>
              <p className="text-xs text-slate-400">Automated queue executing for Bangladesh standard time (BST)</p>
            </div>
            <button
              onClick={() => onNavigate('queue')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Go to Full Queue ({queue.length}) →
            </button>
          </div>

          {queue.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No items in queue. Select a product and push it to the publishing queue!
            </div>
          ) : (
            <div className="space-y-3">
              {queue.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg bg-slate-800/60 border border-slate-800 hover:border-slate-700 transition gap-3"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={item.productImage || 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?w=100'}
                      alt={item.productTitle}
                      className="w-12 h-12 rounded-lg object-cover bg-slate-800 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold truncate text-slate-200">{item.productTitle}</span>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            item.platform === 'facebook'
                              ? 'bg-blue-900/60 text-blue-300'
                              : item.platform === 'instagram'
                              ? 'bg-pink-900/60 text-pink-300'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {item.platform}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{item.content.caption}</p>
                      <div className="flex items-center space-x-3 mt-1 text-[11px] text-slate-500">
                        <span>Scheduled: {new Date(item.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>•</span>
                        <span
                          className={`font-medium ${
                            item.status === 'published'
                              ? 'text-emerald-400'
                              : item.status === 'approved'
                              ? 'text-blue-400'
                              : 'text-amber-400'
                          }`}
                        >
                          Status: {item.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center flex-shrink-0">
                    {item.status !== 'published' ? (
                      <button
                        onClick={() => handleInstantPublish(item.id)}
                        disabled={publishingId === item.id}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center space-x-1 shadow-sm transition"
                      >
                        <Send className="w-3 h-3" />
                        <span>{publishingId === item.id ? 'Publishing...' : 'Publish Now'}</span>
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 font-medium flex items-center space-x-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Live on Feed</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Live Activity Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold">Live System Activity</h2>
              <p className="text-xs text-slate-400">Real-time automation events</p>
            </div>
            <button onClick={() => onNavigate('logs')} className="text-xs text-slate-400 hover:text-slate-200">
              Logs →
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[340px]">
            {logs.slice(0, 7).map((log) => (
              <div key={log.id} className="text-xs p-2.5 rounded-lg bg-slate-800/40 border border-slate-800/60">
                <div className="flex items-center justify-between">
                  <span
                    className={`font-semibold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded ${
                      log.level === 'success'
                        ? 'bg-emerald-950 text-emerald-300'
                        : log.level === 'error'
                        ? 'bg-rose-950 text-rose-300'
                        : log.level === 'warn'
                        ? 'bg-amber-950 text-amber-300'
                        : 'bg-blue-950 text-blue-300'
                    }`}
                  >
                    {log.module}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-200 mt-1 font-medium">{log.message}</p>
                {log.details && <p className="text-slate-400 text-[11px] mt-0.5">{log.details}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
