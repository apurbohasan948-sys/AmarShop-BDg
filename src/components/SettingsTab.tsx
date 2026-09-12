import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types.js';
import { updateSettings } from '../api.js';

interface SettingsTabProps {
  settings: AppSettings | null;
  onRefresh: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ settings, onRefresh }) => {
  const [formData, setFormData] = useState<Partial<AppSettings>>({});
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(formData);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
      onRefresh();
    } catch (err: any) {
      alert(`Failed to save settings: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      <div style={{
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '12px',
        padding: '1.5rem'
      }}>
        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
          Global Settings & Automation Rules
        </h2>
        <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.8125rem', color: '#94a3b8' }}>
          Configure posting intervals, default hashtags, and search engine credentials.
        </p>

        {savedMsg && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            Settings saved successfully to persistent database.
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* ShopBase URL */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Default ShopBase Store URL
            </label>
            <input
              type="text"
              value={formData.shopBaseStoreUrl || ''}
              onChange={(e) => setFormData({ ...formData, shopBaseStoreUrl: e.target.value })}
              placeholder="https://yourstore.on-shopbase.com"
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#f8fafc',
                fontSize: '0.875rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Posting Interval */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Auto-Publish Check Interval (Minutes)
            </label>
            <input
              type="number"
              value={formData.publishIntervalMinutes || 60}
              onChange={(e) => setFormData({ ...formData, publishIntervalMinutes: parseInt(e.target.value, 10) || 60 })}
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#f8fafc',
                fontSize: '0.875rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Tavily API Key */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Tavily API Key (Optional for live web crawling)
            </label>
            <input
              type="password"
              value={formData.tavilyApiKey || ''}
              onChange={(e) => setFormData({ ...formData, tavilyApiKey: e.target.value })}
              placeholder="tvly-••••••••••••••••"
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#f8fafc',
                fontSize: '0.875rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              alignSelf: 'flex-start'
            }}
          >
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
};
