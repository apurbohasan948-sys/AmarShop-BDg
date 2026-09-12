import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  ExternalLink, 
  Sparkles, 
  Image as ImageIcon, 
  RefreshCw, 
  Check, 
  DollarSign, 
  Maximize2 
} from 'lucide-react';

export interface Product {
  id: string;
  title: string;
  handle: string;
  price: number;
  originalPrice?: number;
  currency: string;
  imageUrl: string;
  additionalImages?: string[];
  description: string;
  category: string;
  storeUrl?: string;
  extractedHighQuality?: boolean;
}

interface ProductsCollectorProps {
  onGenerateForProduct: (product: Product) => void;
}

export const ProductsCollector: React.FC<ProductsCollectorProps> = ({ onGenerateForProduct }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [collecting, setCollecting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCollect = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCollecting(true);
      const res = await fetch('/api/products/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urlOrKeyword: query || 'Trending E-Commerce Gadgets',
          maxItems: 3
        })
      });
      const data = await res.json();
      if (data.success) {
        await fetchProducts();
        setQuery('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCollecting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-400" />
            ShopBase Product Catalog
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Collect product catalogs directly from ShopBase stores or search trending e-commerce niches.
          </p>
        </div>
        <button
          onClick={fetchProducts}
          disabled={loading}
          className="p-2 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white self-start sm:self-auto transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Collector Form */}
      <form onSubmit={handleCollect} className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter ShopBase Store URL (e.g. https://mystore.onshopbase.com) or search keyword..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={collecting}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800/40 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition"
          >
            <RefreshCw className={`w-4 h-4 ${collecting ? 'animate-spin' : ''}`} />
            {collecting ? 'Collecting...' : 'Collect Products'}
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
          <span>Quick ideas:</span>
          {['Ergonomic Office', 'Smart Home', 'Fitness Gear', 'LED Lighting'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setQuery(tag)}
              className="hover:text-emerald-400 transition"
            >
              {tag} •
            </button>
          ))}
        </div>
      </form>

      {/* Products Grid */}
      {loading && products.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading collected products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-xl">
          <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">No products collected yet</p>
          <p className="text-xs text-slate-500 mt-1">Use the collector above to import items.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden flex flex-col group transition"
            >
              {/* Product Image */}
              <div className="relative aspect-video sm:aspect-square bg-slate-950 overflow-hidden">
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreviewImage(p.imageUrl)}
                    className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-900 text-white backdrop-blur border border-white/10 transition"
                    title="View High-Quality Image"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {p.extractedHighQuality && (
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-emerald-500/90 text-slate-950 font-bold text-[10px] shadow">
                    HQ Extracted
                  </span>
                )}
              </div>

              {/* Product Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="truncate max-w-[150px]">{p.category}</span>
                    <span className="font-mono text-emerald-400 font-bold text-sm">
                      ${p.price.toFixed(2)}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  {p.storeUrl ? (
                    <a
                      href={p.storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition"
                    >
                      <ExternalLink className="w-3 h-3" /> Store
                    </a>
                  ) : (
                    <span />
                  )}

                  <button
                    type="button"
                    onClick={() => onGenerateForProduct(p)}
                    className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold border border-emerald-500/40 rounded-lg text-xs flex items-center gap-1.5 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Create Post
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-2">
            <img src={previewImage} alt="HQ Extracted" className="w-full h-auto max-h-[75vh] object-contain rounded-lg" />
            <div className="p-2 text-center text-xs text-slate-400">Click anywhere to close</div>
          </div>
        </div>
      )}
    </div>
  );
};
