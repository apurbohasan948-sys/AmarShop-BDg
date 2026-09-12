import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  ShoppingBag, 
  LayoutDashboard, 
  Film, 
  TrendingUp, 
  Clock, 
  CheckSquare, 
  Terminal, 
  Settings as SettingsIcon, 
  Sparkles, 
  Server,
  ShieldCheck 
} from 'lucide-react';
import { CloudModelsManager } from './components/CloudModelsManager';
import { Dashboard } from './components/Dashboard';
import { ProductsCollector, Product } from './components/ProductsCollector';
import { CreativeStudio } from './components/CreativeStudio';
import { TavilyResearch } from './components/TavilyResearch';
import { PublishingQueue } from './components/PublishingQueue';
import { ReviewQueue } from './components/ReviewQueue';
import { SystemLogs } from './components/SystemLogs';
import { SettingsModal } from './components/SettingsModal';

type TabId = 
  | 'cloud-models' 
  | 'dashboard' 
  | 'products' 
  | 'creative' 
  | 'tavily' 
  | 'queue' 
  | 'review' 
  | 'logs';

export function App() {
  const [currentTab, setCurrentTab] = useState<TabId>('cloud-models');
  const [selectedProductForPost, setSelectedProductForPost] = useState<Product | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeModelInfo, setActiveModelInfo] = useState<string>('Loading...');

  const refreshActiveModel = async () => {
    try {
      const res = await fetch('/api/cloud-models');
      const data = await res.json();
      if (data.success && Array.isArray(data.models)) {
        const defaultMod = data.models.find((m: any) => m.isDefault && m.status === 'working');
        const anyWorking = data.models.find((m: any) => m.status === 'working');
        const active = defaultMod || anyWorking || data.models[0];
        if (active) {
          setActiveModelInfo(`${active.providerName}: ${active.modelName}`);
        } else {
          setActiveModelInfo('No models configured');
        }
      }
    } catch {
      setActiveModelInfo('Backend offline');
    }
  };

  useEffect(() => {
    refreshActiveModel();
  }, [currentTab]);

  const handleGenerateForProduct = (product: Product) => {
    setSelectedProductForPost(product);
    setCurrentTab('creative');
  };

  const navItems: { id: TabId; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'cloud-models', label: 'Cloud Models', icon: <Cpu className="w-4 h-4" />, badge: 'Core API' },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'products', label: 'ShopBase Products', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'creative', label: 'Creative Studio', icon: <Film className="w-4 h-4" /> },
    { id: 'tavily', label: 'Tavily Trends', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'queue', label: 'Publish Queue', icon: <Clock className="w-4 h-4" /> },
    { id: 'review', label: 'Review Queue', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'logs', label: 'System Logs', icon: <Terminal className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-emerald-500/20">
              🛍️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight">ShopBase AI</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                  v1.0
                </span>
              </div>
              <div className="text-[11px] text-slate-400 hidden sm:block">Social Media & Video Automation</div>
            </div>
          </div>

          {/* Active Model Indicator */}
          <div 
            onClick={() => setCurrentTab('cloud-models')}
            className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition text-xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Active AI:</span>
            <span className="font-mono font-medium text-emerald-400 truncate max-w-[200px]">
              {activeModelInfo}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white transition"
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-2 overflow-x-auto no-scrollbar flex items-center gap-1 border-t border-slate-900 pt-2">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {currentTab === 'cloud-models' && <CloudModelsManager />}
        {currentTab === 'dashboard' && <Dashboard onNavigate={(t) => setCurrentTab(t as TabId)} />}
        {currentTab === 'products' && (
          <ProductsCollector onGenerateForProduct={handleGenerateForProduct} />
        )}
        {currentTab === 'creative' && (
          <CreativeStudio
            selectedProduct={selectedProductForPost}
            onPostScheduled={() => setCurrentTab('queue')}
          />
        )}
        {currentTab === 'tavily' && <TavilyResearch />}
        {currentTab === 'queue' && <PublishingQueue />}
        {currentTab === 'review' && <ReviewQueue />}
        {currentTab === 'logs' && <SystemLogs />}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
