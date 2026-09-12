import { useState, useEffect } from 'react';
import {
  Store,
  Bot,
  Layers,
  Sparkles,
  Send,
  Search,
  Settings,
  Terminal,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Play,
} from 'lucide-react';
import { api } from '../api.ts';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenApkModal: () => void;
  onTriggerScheduler: () => void;
  schedulerRunning: boolean;
}

export function Header({
  activeTab,
  setActiveTab,
  onOpenApkModal,
  onTriggerScheduler,
  schedulerRunning,
}: HeaderProps) {
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [geminiReady, setGeminiReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkServer = async () => {
      try {
        const res = await api.getHealth();
        if (mounted) {
          setServerOnline(res.status === 'ok');
          setGeminiReady(res.geminiConfigured);
        }
      } catch (err) {
        if (mounted) {
          setServerOnline(false);
        }
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'products', label: 'Products', icon: Store },
    { id: 'creative', label: 'Creative Studio', icon: Sparkles },
    { id: 'queue', label: 'Publishing Queue', icon: Send },
    { id: 'research', label: 'Market Research', icon: Search },
    { id: 'models', label: 'AI Engines', icon: Bot },
    { id: 'logs', label: 'System Logs', icon: Terminal },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm">
      {/* Top Banner / Status Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-900/30">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white">AmarShop BD</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  AI Automation Hub
                </span>
              </div>
              <p className="text-xs text-slate-400">ShopBase Collector • Gemini Marketing • Auto-Publisher</p>
            </div>
          </div>

          {/* Right Status / Controls */}
          <div className="flex items-center space-x-3">
            {/* Server Status Pill */}
            <div
              id="server-status-pill"
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                serverOnline === true
                  ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                  : serverOnline === false
                  ? 'bg-rose-950/60 border-rose-800/80 text-rose-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title={serverOnline ? 'Backend Express API & Database Connected' : 'Connecting to Backend API...'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  serverOnline === true ? 'bg-emerald-400 animate-pulse' : serverOnline === false ? 'bg-rose-400' : 'bg-slate-400'
                }`}
              />
              <span>{serverOnline ? 'API Online' : 'Connecting'}</span>
              {geminiReady && <span className="text-[10px] bg-emerald-800/60 px-1 rounded text-emerald-200">Gemini</span>}
            </div>

            {/* Quick Scheduler Button */}
            <button
              id="header-trigger-scheduler"
              onClick={onTriggerScheduler}
              disabled={schedulerRunning}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Process all due posts in the publishing queue now"
            >
              <Play className={`w-3.5 h-3.5 text-amber-400 ${schedulerRunning ? 'animate-spin' : ''}`} />
              <span>{schedulerRunning ? 'Syncing...' : 'Run Scheduler'}</span>
            </button>

            {/* Mobile App Modal Button */}
            <button
              id="header-apk-btn"
              onClick={onOpenApkModal}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android APK</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 overflow-x-auto">
        <nav className="flex space-x-1 py-1" aria-label="Tabs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-btn-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
