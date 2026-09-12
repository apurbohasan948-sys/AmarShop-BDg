import { useState, FormEvent } from 'react';
import {
  Search,
  Plus,
  Sparkles,
  Send,
  Trash2,
  ExternalLink,
  Download,
  CheckCircle,
  Tag,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Product, PlatformType } from '../types.ts';
import { api } from '../api.ts';

interface ProductsTabProps {
  products: Product[];
  onRefresh: () => void;
  onOpenCreativeStudioForProduct: (product: Product) => void;
  onAddToQueue: (product: Product, platform: PlatformType) => void;
}

export function ProductsTab({
  products,
  onRefresh,
  onOpenCreativeStudioForProduct,
  onAddToQueue,
}: ProductsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [crawlUrl, setCrawlUrl] = useState('');
  const [crawling, setCrawling] = useState(false);
  const [crawlError, setCrawlError] = useState<string | null>(null);
  const [crawlSuccess, setCrawlSuccess] = useState<string | null>(null);

  // Quick Queue Modal state
  const [queueModalProduct, setQueueModalProduct] = useState<Product | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('facebook');

  // Categories
  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.titleBn && p.titleBn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCrawl = async (e: FormEvent) => {
    e.preventDefault();
    if (!crawlUrl.trim()) return;

    setCrawling(true);
    setCrawlError(null);
    setCrawlSuccess(null);

    try {
      const res = await api.collectProduct(crawlUrl.trim());
      if (res.success) {
        setCrawlSuccess(`Successfully imported "${res.data.title}"!`);
        setCrawlUrl('');
        onRefresh();
      }
    } catch (err: any) {
      setCrawlError(err.message || 'Failed to crawl ShopBase product.');
    } finally {
      setCrawling(false);
    }
  };

  const handleSampleCrawl = (url: string) => {
    setCrawlUrl(url);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await api.deleteProduct(id);
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Failed to delete product.');
      }
    }
  };

  const confirmAddToQueue = () => {
    if (queueModalProduct) {
      onAddToQueue(queueModalProduct, selectedPlatform);
      setQueueModalProduct(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ShopBase URL Collector Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold flex items-center space-x-2">
              <Download className="w-5 h-5 text-emerald-400" />
              <span>ShopBase Product Collector</span>
            </h2>
            <p className="text-xs text-slate-400">
              Paste any ShopBase or dropshipping store product URL to scrape specs, pricing, and catalog directly to AmarShop BD.
            </p>
          </div>

          {/* Quick preset links */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
            <span>Quick Samples:</span>
            <button
              onClick={() => handleSampleCrawl('https://amarshopbd.shopbase.net/products/sports-smartwatch-ip68')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Smartwatch
            </button>
            <button
              onClick={() => handleSampleCrawl('https://amarshopbd.shopbase.net/products/premium-royal-attar-12ml')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Attar
            </button>
            <button
              onClick={() => handleSampleCrawl('https://amarshopbd.shopbase.net/products/cotton-semi-formal-shirt')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Men Shirt
            </button>
          </div>
        </div>

        <form onSubmit={handleCrawl} className="flex flex-col sm:flex-row gap-3">
          <input
            id="shopbase-url-input"
            type="url"
            value={crawlUrl}
            onChange={(e) => setCrawlUrl(e.target.value)}
            placeholder="https://amarshopbd.shopbase.net/products/..."
            className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            required
          />
          <button
            id="shopbase-crawl-submit"
            type="submit"
            disabled={crawling}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold flex items-center justify-center space-x-2 shadow-sm transition disabled:opacity-50"
          >
            {crawling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Crawling & Parsing...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Collect & Import</span>
              </>
            )}
          </button>
        </form>

        {crawlSuccess && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{crawlSuccess}</span>
          </div>
        )}

        {crawlError && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{crawlError}</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products or tags..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-white flex flex-col hover:border-slate-700 transition shadow-sm"
          >
            {/* Image Header with Price Badge */}
            <div className="relative h-48 bg-slate-800 overflow-hidden">
              <img
                src={product.images[0] || 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?w=600'}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-400 border border-slate-700">
                ৳{product.price.toLocaleString()}
                {product.compareAtPrice && (
                  <span className="ml-1 text-[10px] line-through text-slate-400">
                    ৳{product.compareAtPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-medium text-slate-300">
                {product.category}
              </div>
            </div>

            {/* Body */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white line-clamp-1">{product.title}</h3>
                {product.titleBn && (
                  <p className="text-xs text-emerald-400 font-medium line-clamp-1 mt-0.5">{product.titleBn}</p>
                )}
                <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">{product.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {product.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300"
                    >
                      <Tag className="w-2.5 h-2.5 mr-1 text-slate-500" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => onOpenCreativeStudioForProduct(product)}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium flex items-center space-x-1 transition"
                    title="Generate marketing copy for this product"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{product.aiGeneratedCopy ? 'Refine Copy' : 'AI Copy'}</span>
                  </button>

                  <button
                    onClick={() => setQueueModalProduct(product)}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center space-x-1 transition"
                    title="Add to social publishing queue"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Queue</span>
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(product.id, product.title)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                  title="Delete product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Queue Modal */}
      {queueModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl">
            <h3 className="text-lg font-bold">Push to Social Media Queue</h3>
            <p className="text-xs text-slate-400 mt-1">
              Select platform to schedule "{queueModalProduct.title}" for publishing.
            </p>

            <div className="mt-4 space-y-3">
              <label className="block text-xs font-medium text-slate-300">Target Social Platform:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['facebook', 'instagram', 'tiktok'] as PlatformType[]).map((plat) => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => setSelectedPlatform(plat)}
                    className={`py-2.5 text-xs font-semibold rounded-xl uppercase tracking-wider transition ${
                      selectedPlatform === plat
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-500'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {plat}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-2">
              <button
                onClick={() => setQueueModalProduct(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddToQueue}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm Schedule</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
