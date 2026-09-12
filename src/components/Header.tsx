import React from 'react';
import { CloudModel } from '../types.js';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeModel?: CloudModel | null;
  serverStatus: 'online' | 'offline' | 'checking';
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeModel,
  serverStatus,
}) => {
  const tabs = [
    { id: 'models', label: 'Cloud Models', badge: activeModel?.status === 'working' ? 'Ready' : 'Setup' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'products', label: 'Products' },
    { id: 'studio', label: 'Creative Studio' },
    { id: 'queue', label: 'Publishing Queue' },
    { id: 'tavily', label: 'Tavily Trends' },
    { id: 'logs', label: 'System Logs' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <header style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b', color: '#f8fafc' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.25rem',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
            }}>
              S
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em' }}>
                  ShopBase AI
                </h1>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                  backgroundColor: '#3b82f620',
                  color: '#60a5fa',
                  border: '1px solid #3b82f640',
                  fontWeight: 600
                }}>
                  Social Automation
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#94a3b8' }}>
                Automated e-commerce viral marketing & multi-cloud LLM engine
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Active AI Model Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.75rem',
              backgroundColor: '#1e293b',
              borderRadius: '8px',
              border: '1px solid #334155',
              fontSize: '0.8125rem'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: activeModel?.status === 'working' ? '#10b981' : '#f59e0b'
              }} />
              <span style={{ color: '#94a3b8' }}>Active Model:</span>
              <strong style={{ color: '#f1f5f9' }}>
                {activeModel ? `${activeModel.providerName} (${activeModel.modelName})` : 'Not Configured'}
              </strong>
            </div>

            {/* Server Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.75rem',
              color: serverStatus === 'online' ? '#34d399' : '#f87171'
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: serverStatus === 'online' ? '#34d399' : '#f87171'
              }} />
              <span>Backend {serverStatus}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: isActive ? '#3b82f6' : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : (tab.badge === 'Ready' ? '#065f46' : '#854d0e'),
                    color: isActive ? '#ffffff' : (tab.badge === 'Ready' ? '#34d399' : '#fef08a')
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
