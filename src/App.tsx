import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { DashboardTab } from './components/DashboardTab';
import { ProductsTab } from './components/ProductsTab';
import { AIModelsTab } from './components/AIModelsTab';
import { TavilyTab } from './components/TavilyTab';
import { CreativeStudioTab } from './components/CreativeStudioTab';
import { QueueTab } from './components/QueueTab';
import { SettingsTab } from './components/SettingsTab';
import { LogsTab } from './components/LogsTab';
import { GithubApkModal } from './components/GithubApkModal';
import {
  DashboardStats,
  Product,
  AIModelConfig,
  TaskModelAssignments,
  QueueItem,
  LogEntry,
  AppSettings,
} from './types';
import { api } from './api';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isApkModalOpen, setIsApkModalOpen] = useState<boolean>(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [models, setModels] = useState<Array<AIModelConfig & { hasKey: boolean }>>([]);
  const [taskAssignments, setTaskAssignments] = useState<TaskModelAssignments>({
    productAnalysis: 'gemini-flash',
    facebookCaption: 'gemini-flash',
    youtubeContent: 'gemini-flash',
    tiktokContent: 'gemini-flash',
    videoScript: 'gemini-flash',
    imagePrompt: 'gemini-flash',
    generalMarketing: 'gemini-flash',
    enableFallback: true,
  });
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [selectedProductForStudio, setSelectedProductForStudio] = useState<Product | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRunningAuto, setIsRunningAuto] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'info' | 'error';
    title: string;
    message: string;
  } | null>(null);

  // Fetch all core state
  const loadAllData = useCallback(async () => {
    try {
      const [
        statsData,
        productsData,
        modelsData,
        assignmentsData,
        queueData,
        logsData,
        settingsData,
      ] = await Promise.all([
        api.getStats().catch(() => null),
        api.getProducts().catch(() => []),
        api.getAIModels().catch(() => []),
        api.getTaskAssignments().catch(() => ({
          productAnalysis: 'gemini-flash',
          facebookCaption: 'gemini-flash',
          youtubeContent: 'gemini-flash',
          tiktokContent: 'gemini-flash',
          videoScript: 'gemini-flash',
          imagePrompt: 'gemini-flash',
          generalMarketing: 'gemini-flash',
          enableFallback: true,
        })),
        api.getQueue().catch(() => []),
        api.getLogs().catch(() => []),
        api.getSettings().catch(() => null),
      ]);

      if (statsData) setStats(statsData);
      if (productsData) setProducts(productsData);
      if (modelsData) setModels(modelsData);
      if (assignmentsData) setTaskAssignments(assignmentsData);
      if (queueData) setQueue(queueData);
      if (logsData) setLogs(logsData);
      if (settingsData) setSettings(settingsData);
    } catch (err: any) {
      console.error('Failed to load application data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load + periodic polling (every 12 seconds)
  useEffect(() => {
    loadAllData();
    const interval = setInterval(() => {
      loadAllData();
    }, 12000);
    return () => clearInterval(interval);
  }, [loadAllData]);

  // Run full automated pipeline on demand
  const handleRunAutomation = async () => {
    setIsRunningAuto(true);
    setNotification({
      type: 'info',
      title: 'Automated Pipeline Running',
      message:
        'Scanning ShopBase BD, scraping high-res images, performing Tavily research, generating AI content, and rendering video creatives...',
    });

    try {
      const res = await api.runAutomationNow();
      await loadAllData();

      if (res.processedCount > 0) {
        setNotification({
          type: 'success',
          title: 'Automation Pipeline Complete',
          message: `Successfully processed ${res.processedCount} product(s) into creative videos and publishing queues!`,
        });
      } else {
        setNotification({
          type: 'info',
          title: 'Pipeline Checked',
          message: res.message || 'No new unqueued products found to process.',
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        title: 'Pipeline Run Error',
        message: err.message || 'An error occurred during pipeline execution.',
      });
    } finally {
      setIsRunningAuto(false);
    }
  };

  // Run pipeline for a specific single product
  const handleRunSingleProductPipeline = async (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    setNotification({
      type: 'info',
      title: 'Generating Creatives',
      message: `Generating marketing copy & video creative for "${prod?.title || 'product'}"...`,
    });

    try {
      const res = await api.runProductPipeline(productId);
      await loadAllData();
      setNotification({
        type: 'success',
        title: 'Creatives Generated!',
        message: res.message || 'Product content generated and enqueued successfully.',
      });
      setActiveTab('queue');
    } catch (err: any) {
      setNotification({
        type: 'error',
        title: 'Generation Failed',
        message: err.message || 'Could not complete pipeline for this product.',
      });
    }
  };

  // Open video studio with pre-selected product
  const handleOpenVideoStudio = (product: Product) => {
    setSelectedProductForStudio(product);
    setActiveTab('creatives');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Sticky Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        onRefresh={loadAllData}
        onRunAuto={handleRunAutomation}
        isRunningAuto={isRunningAuto}
        onOpenApkModal={() => setIsApkModalOpen(true)}
      />

      {/* Global Notification Toast */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full">
          <div
            className={`p-4 rounded-2xl border flex items-start justify-between shadow-lg transition-all animate-fadeIn ${
              notification.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200'
                : notification.type === 'error'
                ? 'bg-rose-950/80 border-rose-500/30 text-rose-200'
                : 'bg-indigo-950/80 border-indigo-500/30 text-indigo-200'
            }`}
          >
            <div className="flex items-start space-x-3">
              {notification.type === 'success' && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              {notification.type === 'error' && (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              {notification.type === 'info' && (
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  {notification.title}
                </h4>
                <p className="text-xs opacity-90 mt-0.5 leading-relaxed">
                  {notification.message}
                </p>
              </div>
            </div>

            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading && !stats ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Initializing ShopBase AI Automation System...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardTab
                stats={stats}
                products={products}
                queue={queue}
                setActiveTab={setActiveTab}
                onRunAuto={handleRunAutomation}
              />
            )}

            {activeTab === 'products' && (
              <ProductsTab
                products={products}
                onRefresh={loadAllData}
                onOpenVideoStudio={handleOpenVideoStudio}
                onRunPipeline={handleRunSingleProductPipeline}
              />
            )}

            {activeTab === 'models' && (
              <AIModelsTab
                models={models}
                taskAssignments={taskAssignments}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'tavily' && <TavilyTab />}

            {activeTab === 'creatives' && (
              <CreativeStudioTab
                products={products}
                selectedProduct={selectedProductForStudio}
                onSelectProduct={(prod) => setSelectedProductForStudio(prod)}
                onRefresh={loadAllData}
                onGoToQueue={() => setActiveTab('queue')}
              />
            )}

            {activeTab === 'queue' && (
              <QueueTab
                queue={queue}
                isTestMode={stats?.testMode ?? true}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab
                settings={settings}
                onRefresh={loadAllData}
                onOpenApkModal={() => setIsApkModalOpen(true)}
              />
            )}

            {activeTab === 'logs' && <LogsTab logs={logs} onRefresh={loadAllData} />}
          </>
        )}
      </main>

      {/* GitHub APK Maker & Mobile App Modal */}
      <GithubApkModal
        isOpen={isApkModalOpen || activeTab === 'apk'}
        onClose={() => {
          setIsApkModalOpen(false);
          if (activeTab === 'apk') setActiveTab('dashboard');
        }}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-300">ShopBase AI Social Media Automation</span>
            <span>•</span>
            <span className="text-slate-500">Model-Agnostic Cloud Engine</span>
          </div>

          <div className="flex items-center space-x-4 text-slate-400">
            <span>ShopBase BD Scraper</span>
            <span>•</span>
            <span>Tavily Grounding</span>
            <span>•</span>
            <span>Meta Graph & TikTok APIs</span>
            <span>•</span>
            <span className="text-emerald-400">
              {stats?.isTestMode ? 'Test Mode Enabled' : 'Live Mode'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
