import React from 'react';
import { DashboardStats, CloudModel, QueueItem, Product } from '../types.js';

interface DashboardTabProps {
  stats: DashboardStats | null;
  activeModel: CloudModel | null;
  products: Product[];
  queue: QueueItem[];
  onNavigate: (tab: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  stats,
  activeModel,
  products,
  queue,
  onNavigate,
}) => {
  const scheduledCount = queue.filter((q) => q.status === 'scheduled' || (q.status as any) === 'approved').length;
  const publishedCount = queue.filter((q) => q.status === 'published').length;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {/* Metric 1 */}
        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '1.25rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 600 }}>ACTIVE CLOUD AI</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.5rem' }}>
            {activeModel ? activeModel.providerName : 'None Configured'}
          </div>
          <div style={{
            fontSize: '0.75rem',
            marginTop: '0.35rem',
            color: activeModel?.status === 'working' ? '#34d399' : '#f87171',
            fontWeight: 600
          }}>
            {activeModel ? `${activeModel.modelName} • ${activeModel.status.toUpperCase()}` : 'Click Cloud Models to add'}
          </div>
        </div>

        {/* Metric 2 */}
        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '1.25rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 600 }}>PRODUCTS STORED</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.5rem' }}>
            {products.length}
          </div>
          <div style={{ fontSize: '0.75rem', marginTop: '0.35rem', color: '#94a3b8' }}>
            Ready for AI content generation
          </div>
        </div>

        {/* Metric 3 */}
        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '1.25rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 600 }}>SCHEDULED IN QUEUE</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.5rem' }}>
            {scheduledCount}
          </div>
          <div style={{ fontSize: '0.75rem', marginTop: '0.35rem', color: '#94a3b8' }}>
            Facebook, TikTok, Reels, YouTube
          </div>
        </div>

        {/* Metric 4 */}
        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '1.25rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 600 }}>PUBLISHED POSTS</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', marginTop: '0.5rem' }}>
            {publishedCount}
          </div>
          <div style={{ fontSize: '0.75rem', marginTop: '0.35rem', color: '#94a3b8' }}>
            Automated social broadcasts
          </div>
        </div>
      </div>

      {/* Quick Launchpad */}
      <div style={{
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
          Workflow Quick Launchpad
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <button
            onClick={() => onNavigate('models')}
            style={{
              padding: '1rem',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              textAlign: 'left',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontWeight: 700, color: '#60a5fa', fontSize: '0.95rem' }}>1. Cloud Models</div>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
              Connect OpenAI, Groq, DeepSeek, or custom API endpoints.
            </p>
          </button>

          <button
            onClick={() => onNavigate('products')}
            style={{
              padding: '1rem',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              textAlign: 'left',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.95rem' }}>2. Collect Products</div>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
              Scrape ShopBase catalog and extract high-resolution image assets.
            </p>
          </button>

          <button
            onClick={() => onNavigate('studio')}
            style={{
              padding: '1rem',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              textAlign: 'left',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontWeight: 700, color: '#a78bfa', fontSize: '0.95rem' }}>3. Creative Studio</div>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
              Generate viral copy, hooks, hashtags, and short video storyboards.
            </p>
          </button>

          <button
            onClick={() => onNavigate('queue')}
            style={{
              padding: '1rem',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              textAlign: 'left',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.95rem' }}>4. Publishing Queue</div>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
              Review queued items, schedule auto-publishing, and view history.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
