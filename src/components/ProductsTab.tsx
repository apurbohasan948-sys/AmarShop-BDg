import React, { useState } from 'react';
import { Product } from '../types.js';
import { collectProducts, extractProductImages } from '../api.js';

interface ProductsTabProps {
  products: Product[];
  onRefresh: () => void;
  onSelectProductForStudio: (product: Product) => void;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  onRefresh,
  onSelectProductForStudio,
}) => {
  const [storeUrl, setStoreUrl] = useState('https://demo-shopbase-store.com');
  const [keyword, setKeyword] = useState('ergonomic');
  const [isCollecting, setIsCollecting] = useState(false);
  const [extractingId, setExtractingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCollect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCollecting(true);
    setMsg(null);
    try {
      const res = await collectProducts(storeUrl, keyword);
      if (res.success) {
        setMsg({ type: 'success', text: res.message || 'Products collected successfully!' });
        onRefresh();
      } else {
        setMsg({ type: 'error', text: 'Failed to collect products from store.' });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Collection failed.' });
    } finally {
      setIsCollecting(false);
    }
  };

  const handleExtractImages = async (productId: string) => {
    setExtractingId(productId);
    try {
      const res = await extractProductImages(productId);
      if (res.success) {
        setMsg({ type: 'success', text: `Extracted ${res.images.length} high-resolution product photos!` });
        onRefresh();
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: `Image extraction failed: ${err.message}` });
    } finally {
      setExtractingId(null);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Collector Controls */}
      <div style={{
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '12px',
        padding: '1.25rem',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
          ShopBase Product Collector
        </h3>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.8125rem', color: '#94a3b8' }}>
          Enter your ShopBase store URL or category to fetch active listings and automatically pull HD images.
        </p>

        <form onSubmit={handleCollect} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="text"
            value={storeUrl}
            onChange={(e) => setStoreUrl(e.target.value)}
            placeholder="https://yourstore.on-shopbase.com"
            style={{
              flex: '1 1 280px',
              padding: '0.6rem 0.75rem',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#f8fafc',
              fontSize: '0.875rem'
            }}
          />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Filter keyword (e.g. ergonomic, lamp, pillow)"
            style={{
              flex: '0 1 220px',
              padding: '0.6rem 0.75rem',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#f8fafc',
              fontSize: '0.875rem'
            }}
          />
          <button
            type="submit"
            disabled={isCollecting}
            style={{
              padding: '0.6rem 1.25rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: isCollecting ? 'not-allowed' : 'pointer'
            }}
          >
            {isCollecting ? 'Collecting...' : 'Collect From ShopBase'}
          </button>
        </form>

        {msg && (
          <div style={{
            marginTop: '1rem',
            padding: '0.6rem 0.875rem',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            backgroundColor: msg.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            color: msg.type === 'success' ? '#34d399' : '#f87171'
          }}>
            {msg.text}
          </div>
        )}
      </div>

      {/* Product List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {products.map((p) => {
          const img = (p as any).imageUrl || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80';
          const price = (p as any).price;

          return (
            <div
              key={p.id}
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{ position: 'relative', height: '180px', backgroundColor: '#0f172a' }}>
                <img
                  src={img}
                  alt={p.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  color: '#38bdf8',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  ${price}
                </span>
              </div>

              <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.3 }}>
                  {p.title}
                </h4>
                <p style={{
                  margin: '0 0 1rem 0',
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {p.description}
                </p>

                <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => onSelectProductForStudio(p)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Generate Posts
                  </button>
                  <button
                    onClick={() => handleExtractImages(p.id)}
                    disabled={extractingId === p.id}
                    style={{
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#334155',
                      color: '#e2e8f0',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {extractingId === p.id ? 'Extracting...' : 'HD Photos'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
