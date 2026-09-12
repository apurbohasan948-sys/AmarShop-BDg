import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  ExternalLink,
  Sparkles,
  Video,
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Compass,
  ArrowRight,
  Maximize2,
  Layers,
  Tag,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { Product, ProductImage } from '../types';
import { api } from '../api';

interface ProductsTabProps {
  products: Product[];
  onRefresh: () => void;
  onOpenVideoStudio: (product: Product) => void;
  onRunPipeline: (productId: string) => void;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  onRefresh,
  onOpenVideoStudio,
  onRunPipeline,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [extractUrl, setExtractUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractMessage, setExtractMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Categories discovery state
  const [categories, setCategories] = useState<Array<{ name: string; url: string; count?: number }>>([]);
  const [isDiscoveringCats, setIsDiscoveringCats] = useState(false);

  // Image preview modal state
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [previewAspectRatio, setPreviewAspectRatio] = useState<'original' | '1:1' | '4:5' | '9:16'>('original');

  // Single URL extractor handler
  const handleExtractUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extractUrl.trim()) return;

    setIsExtracting(true);
    setExtractMessage(null);

    try {
      const result = await api.extractProductUrl(extractUrl.trim());
      setExtractMessage({
        type: 'success',
        text: result.isDuplicate
          ? `Product refreshed! "${result.product.title}" (${result.product.images.length} high-res images)`
          : `Collected successfully: "${result.product.title}" (${result.product.sellingPrice} BDT)`,
      });
      setExtractUrl('');
      onRefresh();
    } catch (err: any) {
      setExtractMessage({
        type: 'error',
        text: err.message || 'Failed to extract product. Please check the URL.',
      });
    } finally {
      setIsExtracting(false);
    }
  };

  // Discover categories
  const handleDiscoverCategories = async () => {
    setIsDiscoveringCats(true);
    try {
      const cats = await api.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDiscoveringCats(false);
    }
  };

  // Delete product
  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete product "${title}" from database?`)) return;
    try {
      await api.deleteProduct(id);
      onRefresh();
    } catch (err: any) {
      alert(`Error deleting product: ${err.message}`);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  return (
    <div className="space-y-6">
      {/* Top Collector Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-indigo-400" />
              <span>ShopBase BD Live Product Collector</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Extract products, specifications, and uncompressed high-resolution imagery directly from{' '}
              <a
                href="https://shopbasebd.com/store/product-category"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline"
              >
                shopbasebd.com
              </a>
            </p>
          </div>

          <button
            onClick={handleDiscoverCategories}
            disabled={isDiscoveringCats}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center space-x-1.5 self-start md:self-auto"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isDiscoveringCats ? 'Discovering...' : 'Discover Categories'}</span>
          </button>
        </div>

        {/* URL Input Form */}
        <form onSubmit={handleExtractUrl} className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={extractUrl}
            onChange={(e) => setExtractUrl(e.target.value)}
            placeholder="Paste ShopBase BD product URL (e.g., https://shopbasebd.com/store/product/t900-ultra-smart-watch)"
            className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={isExtracting}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{isExtracting ? 'Extracting...' : 'Extract & Save'}</span>
          </button>
        </form>

        {/* Feedback Alert */}
        {extractMessage && (
          <div
            className={`mt-3 p-3 rounded-xl text-xs flex items-center space-x-2 ${
              extractMessage.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
            }`}
          >
            {extractMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{extractMessage.text}</span>
          </div>
        )}

        {/* Discovered Categories Pills */}
        {categories.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Discovered ShopBase BD Categories:
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs flex items-center space-x-2"
                >
                  <span className="font-medium text-slate-200">{cat.name}</span>
                  {cat.count && <span className="text-[10px] text-indigo-400 font-bold">({cat.count})</span>}
                  <a
                    href={cat.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-white"
                    title="Open live page"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, SKU, or category..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {uniqueCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((product) => {
          const heroImg = product.images[0];
          const qualityScore = heroImg?.qualityScore || 90;

          return (
            <div
              key={product.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-sm flex flex-col transition"
            >
              {/* Image Preview with High-Res Badge */}
              <div className="relative h-56 bg-slate-950 overflow-hidden group">
                <img
                  src={heroImg?.highResolutionImageUrl || heroImg?.originalImageUrl}
                  alt={product.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Quality Score Badge */}
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-700/60 rounded-lg px-2 py-1 text-[11px] text-white font-medium flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Score: {qualityScore}/100</span>
                  <span className="text-slate-400">({heroImg?.format || 'HD'})</span>
                </div>

                {/* Image Count & Inspect Button */}
                <button
                  onClick={() => {
                    setPreviewProduct(product);
                    setActiveImageIndex(0);
                  }}
                  className="absolute bottom-3 right-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white text-xs px-2.5 py-1 rounded-lg flex items-center space-x-1 backdrop-blur-sm transition shadow"
                  title="Inspect High-Res Images & Aspect Ratios"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{product.images.length} Images</span>
                </button>

                {/* Stock Tag */}
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {product.availability.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Product Content Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>{product.category}</span>
                    <span className="font-mono text-slate-500">{product.sku}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 line-clamp-2 leading-snug">
                    {product.title}
                  </h3>

                  {/* Pricing Matrix */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 grid grid-cols-3 gap-1 text-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">Source</div>
                      <div className="font-semibold text-slate-300">{product.price} ৳</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-indigo-400">Profit</div>
                      <div className="font-bold text-indigo-400">+{product.profit} ৳</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-emerald-400">Selling Price</div>
                      <div className="font-extrabold text-emerald-400">{product.sellingPrice} ৳</div>
                    </div>
                  </div>

                  {/* Key Features Bullets */}
                  <div className="mt-3 space-y-1">
                    {product.features.slice(0, 3).map((feat, i) => (
                      <div key={i} className="text-[11px] text-slate-400 flex items-start space-x-1.5">
                        <span className="text-indigo-400 font-bold shrink-0">•</span>
                        <span className="line-clamp-1">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* AI & Research Badges */}
                  <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-wrap gap-1.5 text-[10px]">
                    {product.tavilyResearch ? (
                      <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-medium">
                        ✓ Tavily Researched
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        Tavily Pending
                      </span>
                    )}

                    {product.aiAnalysis ? (
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                        ✓ AI Copy Ready
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        AI Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center space-x-2">
                  <button
                    onClick={() => onRunPipeline(product.id)}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 shadow-sm"
                    title="Execute full automation: Tavily search + AI Copy + 9:16 Video + Social Queue"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Automation</span>
                  </button>

                  <button
                    onClick={() => onOpenVideoStudio(product)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition"
                    title="Open 9:16 Video Studio"
                  >
                    <Video className="w-4 h-4 text-purple-400" />
                  </button>

                  <button
                    onClick={() => handleDelete(product.id, product.title)}
                    className="p-2 bg-slate-800 hover:bg-rose-900/30 hover:text-rose-400 text-slate-400 rounded-xl border border-slate-700 transition"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Image Inspection & Crop Presets Modal */}
      {previewProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  High-Resolution Product Imagery & Quality Inspector
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{previewProduct.title}</p>
              </div>
              <button
                onClick={() => setPreviewProduct(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 text-xs font-semibold"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Body: Aspect Ratio Presets and Main Viewer */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Viewer */}
              <div className="md:col-span-2 flex flex-col items-center">
                <div className="flex space-x-2 mb-3 self-start text-xs font-medium">
                  <span className="text-slate-400 self-center">Aspect Ratio Preset:</span>
                  {(['original', '1:1', '4:5', '9:16'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setPreviewAspectRatio(ratio)}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        previewAspectRatio === ratio
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {ratio === 'original'
                        ? 'Original'
                        : ratio === '1:1'
                        ? '1:1 Square (FB/IG)'
                        : ratio === '4:5'
                        ? '4:5 Portrait'
                        : '9:16 Reels/TikTok'}
                    </button>
                  ))}
                </div>

                <div
                  className={`relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center transition-all ${
                    previewAspectRatio === '1:1'
                      ? 'w-80 h-80'
                      : previewAspectRatio === '4:5'
                      ? 'w-72 h-90'
                      : previewAspectRatio === '9:16'
                      ? 'w-56 h-96'
                      : 'w-full h-80'
                  }`}
                >
                  <img
                    src={
                      previewProduct.images[activeImageIndex]?.highResolutionImageUrl ||
                      previewProduct.images[activeImageIndex]?.originalImageUrl
                    }
                    alt="Active Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="mt-3 text-xs text-slate-400 flex items-center space-x-4">
                  <span>
                    Width: {previewProduct.images[activeImageIndex]?.width || 1920}px
                  </span>
                  <span>
                    Height: {previewProduct.images[activeImageIndex]?.height || 1920}px
                  </span>
                  <span>
                    Quality: {previewProduct.images[activeImageIndex]?.qualityScore}/100
                  </span>
                  <a
                    href={previewProduct.images[activeImageIndex]?.highResolutionImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:underline flex items-center space-x-1"
                  >
                    <span>Open Raw</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Thumbnails list */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Available High-Res Photos ({previewProduct.images.length})
                </h4>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {previewProduct.images.map((img, idx) => (
                    <div
                      key={img.id}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`p-2 rounded-xl border flex items-center space-x-3 cursor-pointer transition ${
                        activeImageIndex === idx
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={img.highResolutionImageUrl || img.originalImageUrl}
                        alt="Thumbnail"
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 object-cover rounded-lg bg-slate-900 shrink-0"
                      />
                      <div className="text-xs min-w-0">
                        <div className="font-semibold text-slate-200 line-clamp-1">
                          {img.label || `Photo ${idx + 1}`}
                        </div>
                        <div className="text-[11px] text-emerald-400 font-medium">
                          Score: {img.qualityScore}/100
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {img.format || 'JPEG'} • {img.width || 1920}x{img.height || 1920}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setPreviewProduct(null);
                      onOpenVideoStudio(previewProduct);
                    }}
                    className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Create 9:16 Video with These Images</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
