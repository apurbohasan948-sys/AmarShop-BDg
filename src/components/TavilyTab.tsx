import React, { useState } from 'react';
import { searchTavily } from '../api.js';

export const TavilyTab: React.FC = () => {
  const [query, setQuery] = useState('Trending viral ergonomic work from home TikTok products');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setError(null);

    try {
      const res = await searchTavily(query);
      if (res.success) {
        setResults(res);
      } else {
        setError(res.error || 'Search failed');
      }
    } catch (err: any) {
      setError(err.message || 'Market research error');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      <div style={{
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '12px',
        padding: '1.25rem',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
          Tavily AI Market & Social Trend Research
        </h2>
        <p style={{ margin: '0.25rem 0 1rem 0', fontSize: '0.8125rem', color: '#94a3b8' }}>
          Discover trending e-commerce hashtags, competitor pricing, and top viral content angles across the web.
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search trend or niche..."
            style={{
              flex: '1 1 320px',
              padding: '0.65rem 0.85rem',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#f8fafc',
              fontSize: '0.875rem'
            }}
          />
          <button
            type="submit"
            disabled={isSearching}
            style={{
              padding: '0.65rem 1.25rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: isSearching ? 'not-allowed' : 'pointer'
            }}
          >
            {isSearching ? 'Analyzing Trends...' : 'Research Trends'}
          </button>
        </form>
      </div>

      {error && (
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          color: '#f87171',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}

      {results && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* AI Synthesis Summary */}
          {results.summary && (
            <div style={{
              backgroundColor: '#0f172a',
              border: '1px solid #3b82f640',
              borderRadius: '10px',
              padding: '1.25rem'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#60a5fa', fontSize: '1rem', fontWeight: 700 }}>
                AI Market Intelligence Summary
              </h4>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                {results.summary}
              </p>
            </div>
          )}

          {/* Results List */}
          {(results.results || []).map((item: any, idx: number) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '1rem'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#38bdf8' }}>
                <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                  {item.title} ↗
                </a>
              </div>
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                {item.content}
              </p>
              <div style={{ marginTop: '0.35rem', fontSize: '0.7rem', color: '#64748b' }}>
                Source: {item.url}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
