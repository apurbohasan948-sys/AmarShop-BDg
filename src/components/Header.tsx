import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Cpu,
  Search,
  Video,
  ListOrdered,
  Settings,
  Terminal,
  ShieldCheck,
  AlertTriangle,
  Play,
  RefreshCw,
} from 'lucide-react';
import { DashboardStats } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stats: DashboardStats | null;
  onRefresh: () => void;
  onRunAuto: () => void;
  isRunningAuto: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  stats,
  onRefresh,
  onRunAuto,
  isRunningAuto,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products & Collector', icon: ShoppingBag, badge: stats?.productsCollected },
    { id: 'models', label: 'AI Models', icon: Cpu },
    { id: 'tavily', label: 'Tavily Research', icon: Search },
    { id: 'creatives', label: 'Video Studio', icon: Video, badge: stats?.videosGenerated },
    { id: 'queue', label: 'Publishing Queue', icon: ListOrdered, badge: stats?.scheduledPosts || stats?.newProducts },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'logs', label: 'Logs', icon: Terminal },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white">ShopBase AI</h1>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/30">
                BD Automation
              </span>
            </div>
            <p className="text-xs text-slate-400">Model-Agnostic Product-to-Social Marketing Pipeline</p>
          </div>
        </div>

        {/* Global Status Badges & Controls */}
        <div className="flex items-center space-x-3 text-xs">
          {/* Test Mode Badge */}
          {stats?.testMode ? (
            <div
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              title="Test Mode is Active: Posts are simulated safely without live publishing."
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold">Test Mode: SAFE</span>
            </div>
          ) : (
            <div
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20"
              title="Live Mode: Approved items will publish directly to authenticated platforms."
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold">LIVE Posting</span>
            </div>
          )}

          {/* Active AI Model Badge */}
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI: <strong className="text-white font-medium">{stats?.activeAiModel || 'Multi-Model'}</strong></span>
          </div>

          {/* Tavily Badge */}
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tavily: <span className={stats?.tavilyStatus === 'online' ? 'text-emerald-400 font-medium' : 'text-slate-400'}>{stats?.tavilyStatus || 'Ready'}</span></span>
          </div>

          {/* Run Automation Button */}
          <button
            onClick={onRunAuto}
            disabled={isRunningAuto}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium px-3 py-1.5 rounded-lg shadow-sm transition disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isRunningAuto ? 'animate-spin' : ''}`} />
            <span>{isRunningAuto ? 'Running...' : 'Run Pipeline'}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            title="Refresh All Data"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 overflow-x-auto no-scrollbar border-t border-slate-800/80">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
