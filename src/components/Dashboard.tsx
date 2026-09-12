import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Send, 
  CheckCircle2, 
  Cpu, 
  Sparkles, 
  ArrowUpRight, 
  TrendingUp, 
  Layers, 
  Clock, 
  Video, 
  RefreshCw 
} from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  queuedPosts: number;
  publishedPosts: number;
  activeCloudModel: string;
  activeModelStatus: string;
  configuredModelsCount: number;
}

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Hero Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Autonomous Social Automation
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            ShopBase AI Command Center
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2">
            Collect trending products, run market intelligence research with Tavily, synthesize viral video scripts, and auto-publish to Facebook, TikTok, Reels, and YouTube.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={() => onNavigate('cloud-models')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-2 transition"
            >
              <Cpu className="w-4 h-4" />
              Manage Cloud AI Models
            </button>
            <button
              onClick={() => onNavigate('products')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg text-xs flex items-center gap-2 transition"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              Collect ShopBase Products
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Catalog Products</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {loading ? '-' : stats?.totalProducts || 0}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">Ready</span> for AI post generation
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Publishing Queue</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {loading ? '-' : stats?.queuedPosts || 0}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-cyan-400 font-medium">Scheduled</span> across 4 social channels
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Published Posts</span>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {loading ? '-' : stats?.publishedPosts || 0}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-violet-400 font-medium">Live</span> on social feeds
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Active Cloud AI</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-white truncate" title={stats?.activeCloudModel}>
            {loading ? 'Checking...' : stats?.activeCloudModel || 'None configured'}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${stats?.activeModelStatus === 'working' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
            <span className="font-mono text-[11px] text-slate-300">
              {stats?.configuredModelsCount || 0} models registered
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => onNavigate('products')}
          className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-6 cursor-pointer group transition duration-200"
        >
          <div className="p-3 w-fit rounded-lg bg-emerald-500/10 text-emerald-400 mb-4 group-hover:scale-105 transition">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-emerald-400 flex items-center justify-between">
            ShopBase Collector
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
          </h3>
          <p className="text-xs text-slate-400 mt-2">
            Collect product catalogs from ShopBase stores, extract high-resolution image assets, and organize product attributes.
          </p>
        </div>

        <div 
          onClick={() => onNavigate('creative')}
          className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-6 cursor-pointer group transition duration-200"
        >
          <div className="p-3 w-fit rounded-lg bg-cyan-500/10 text-cyan-400 mb-4 group-hover:scale-105 transition">
            <Video className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-cyan-400 flex items-center justify-between">
            Creative & Video Studio
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
          </h3>
          <p className="text-xs text-slate-400 mt-2">
            Generate high-converting social captions, viral hooks, and 5-scene video storyboards customized for Reels, TikTok, and YouTube.
          </p>
        </div>

        <div 
          onClick={() => onNavigate('tavily')}
          className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-6 cursor-pointer group transition duration-200"
        >
          <div className="p-3 w-fit rounded-lg bg-violet-500/10 text-violet-400 mb-4 group-hover:scale-105 transition">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-violet-400 flex items-center justify-between">
            Tavily Market Trends
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
          </h3>
          <p className="text-xs text-slate-400 mt-2">
            Execute real-time e-commerce market intelligence, uncover customer pain points, and synthesize viral angles for ads.
          </p>
        </div>
      </div>
    </div>
  );
};
