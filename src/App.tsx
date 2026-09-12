import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { DashboardTab } from './components/DashboardTab.tsx';
import { ProductsTab } from './components/ProductsTab.tsx';
import { CreativeStudioTab } from './components/CreativeStudioTab.tsx';
import { QueueTab } from './components/QueueTab.tsx';
import { TavilyTab } from './components/TavilyTab.tsx';
import { AIModelsTab } from './components/AIModelsTab.tsx';
import { LogsTab } from './components/LogsTab.tsx';
import { SettingsTab } from './components/SettingsTab.tsx';
import { GithubApkModal } from './components/GithubApkModal.tsx';
import { Product, PublishingQueueItem, SystemLog, PlatformType } from './types.ts';
import { api } from './api.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [queue, setQueue] = useState<PublishingQueueItem[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [selectedProductForCreative, setSelectedProductForCreative] = useState<Product | null>(null);
  const [apkModalOpen, setApkModalOpen] = useState<boolean>(false);
  const [schedulerRunning, setSchedulerRunning] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 4000);
  };

  const loadAllData = useCallback(async () => {
    try {
      const [prodRes, queueRes, logRes] = await Promise.all([
        api.getProducts().catch(() => ({ success: false, data: [] })),
        api.getQueue().catch(() => ({ success: false, data: [] })),
        api.getLogs().catch(() => ({ success: false, data: [] })),
      ]);

      if (prodRes.success) setProducts(prodRes.data);
      if (queueRes.success) setQueue(queueRes.data);
      if (logRes.success) setLogs(logRes.data);
    } catch (err) {
      console.error('Data load error:', err);
    }
  }, []);

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 10000);
    return () => clearInterval(interval);
  }, [loadAllData]);

  const handleOpenCreativeStudio = (product: Product) => {
    setSelectedProductForCreative(product);
    setActiveTab('creative');
  };

  const handleAddToQueue = async (
    product: Product,
    platform: PlatformType,
    customContent?: { caption: string; hashtags: string[]; mediaUrl: string; callToAction: string }
  ) => {
    try {
      const newItem: Partial<PublishingQueueItem> = {
        productId: product.id,
        productTitle: product.title,
        productImage: product.images[0] || '',
        platform,
        status: 'approved',
        scheduledTime: new Date(Date.now() + 3600000 * 2).toISOString(),
        content: customContent || {
          caption:
            product.aiGeneratedCopy?.facebookPost ||
            `✨ AmarShop BD নিয়ে এলো প্রিমিয়াম ${product.title}।\n\nদাম: ৳${product.price}\nক্যাশ অন ডেলিভারিতে অর্ডার করতে এখনই ইনবক্স করুন!`,
          hashtags: product.aiGeneratedCopy?.hashtags || ['#AmarShopBD', '#CashOnDeliveryBD'],
          mediaUrl: product.images[0] || '',
          callToAction: 'Shop Now',
        },
      };

      const res = await api.addToQueue(newItem);
      if (res.success) {
        showToast(`Scheduled "${product.title}" for ${platform.toUpperCase()} publishing!`);
        loadAllData();
        setActiveTab('queue');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to queue post.');
    }
  };

  const handlePublishNow = async (id: string) => {
    try {
      const res = await api.publishNow(id);
      if (res.success) {
        showToast(`Instant dispatch sent to ${res.data.platform.toUpperCase()}!`);
        loadAllData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to publish now.');
    }
  };

  const handleTriggerScheduler = async () => {
    setSchedulerRunning(true);
    try {
      const res = await api.triggerSchedulerTick();
      if (res.success) {
        showToast(`Publishing tick completed: ${res.data.published} published.`);
        loadAllData();
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setSchedulerRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-900">
      {/* Top App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenApkModal={() => setApkModalOpen(true)}
        onTriggerScheduler={handleTriggerScheduler}
        schedulerRunning={schedulerRunning}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-400/30 text-xs font-semibold flex items-center space-x-2 animate-bounce">
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tab Views */}
        {activeTab === 'dashboard' && (
          <DashboardTab
            products={products}
            queue={queue}
            logs={logs}
            onNavigate={setActiveTab}
            onRefreshData={loadAllData}
            onPublishNow={handlePublishNow}
          />
        )}

        {activeTab === 'products' && (
          <ProductsTab
            products={products}
            onRefresh={loadAllData}
            onOpenCreativeStudioForProduct={handleOpenCreativeStudio}
            onAddToQueue={(prod, plat) => handleAddToQueue(prod, plat)}
          />
        )}

        {activeTab === 'creative' && (
          <CreativeStudioTab
            products={products}
            selectedProduct={selectedProductForCreative}
            onSelectProduct={setSelectedProductForCreative}
            onAddToQueue={handleAddToQueue}
            onRefreshProducts={loadAllData}
          />
        )}

        {activeTab === 'queue' && (
          <QueueTab
            queue={queue}
            onRefresh={loadAllData}
            onPublishNow={handlePublishNow}
            onTriggerScheduler={handleTriggerScheduler}
            schedulerRunning={schedulerRunning}
          />
        )}

        {activeTab === 'research' && <TavilyTab />}

        {activeTab === 'models' && <AIModelsTab />}

        {activeTab === 'logs' && <LogsTab />}

        {activeTab === 'settings' && <SettingsTab />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <p>AmarShop BD Automation Core • Built for ShopBase eCommerce & Multi-Channel Social Growth in Bangladesh</p>
      </footer>

      {/* Android APK Modal */}
      <GithubApkModal isOpen={apkModalOpen} onClose={() => setApkModalOpen(false)} />
    </div>
  );
}
