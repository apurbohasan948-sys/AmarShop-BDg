import React, { useState } from 'react';
import { CloudModel } from '../types.js';
import { saveCloudModel, testCloudModel, deleteCloudModel, setActiveCloudModel } from '../api.js';

interface AIModelsTabProps {
  models: CloudModel[];
  onRefresh: () => void;
}

const PRESETS = [
  {
    name: 'OpenAI',
    modelName: 'gpt-4o-mini',
    baseUrl: 'https://api.openai.com/v1',
    hint: 'Official OpenAI GPT models (gpt-4o-mini, gpt-4o)'
  },
  {
    name: 'Groq',
    modelName: 'llama-3.3-70b-versatile',
    baseUrl: 'https://api.groq.com/openai/v1',
    hint: 'Ultra-fast Llama-3.3 70B inference via Groq'
  },
  {
    name: 'DeepSeek',
    modelName: 'deepseek-chat',
    baseUrl: 'https://api.deepseek.com',
    hint: 'DeepSeek-V3 chat & reasoning models'
  },
  {
    name: 'Together AI',
    modelName: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    baseUrl: 'https://api.together.xyz/v1',
    hint: 'Open-source frontier models via Together AI'
  },
  {
    name: 'Custom (OpenAI-Compatible)',
    modelName: 'custom-model-name',
    baseUrl: 'https://your-api-gateway.com/v1',
    hint: 'Any OpenAI-compatible server (vLLM, Ollama, LM Studio, LiteLLM)'
  }
];

export const AIModelsTab: React.FC<AIModelsTabProps> = ({ models, onRefresh }) => {
  const [providerName, setProviderName] = useState('OpenAI');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('gpt-4o-mini');
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setProviderName(preset.name === 'Custom (OpenAI-Compatible)' ? 'Custom' : preset.name);
    setModelName(preset.modelName);
    setBaseUrl(preset.baseUrl);
    setStatusMessage(null);
  };

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!providerName.trim()) {
      setStatusMessage({ type: 'error', text: 'Provider Name is required.' });
      return;
    }
    if (!apiKey.trim()) {
      setStatusMessage({ type: 'error', text: 'API Key is required.' });
      return;
    }
    if (!modelName.trim()) {
      setStatusMessage({ type: 'error', text: 'Model Name is required.' });
      return;
    }
    if (!baseUrl.trim()) {
      setStatusMessage({ type: 'error', text: 'Base URL is required.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await saveCloudModel({
        providerName: providerName.trim(),
        apiKey: apiKey.trim(),
        modelName: modelName.trim(),
        baseUrl: baseUrl.trim()
      });

      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `Success! Model "${modelName}" connected and saved securely to persistent database.`
        });
        setApiKey(''); // Clear raw secret from frontend form
        onRefresh();
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || 'Failed to authenticate or connect with provider.'
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Error occurred while connecting to backend.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestExisting = async (id: string) => {
    setTestingId(id);
    try {
      const res = await testCloudModel(id);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `Model test passed! Latency: ${res.latencyMs}ms.`
        });
        onRefresh();
      } else {
        setStatusMessage({
          type: 'error',
          text: `Test failed: ${res.error || 'Authentication error'}`
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Test failed: ${err.message}`
      });
    } finally {
      setTestingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this cloud model?')) return;
    try {
      await deleteCloudModel(id);
      onRefresh();
      setStatusMessage({ type: 'success', text: 'Cloud model removed from persistent storage.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Delete failed: ${err.message}` });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setActiveCloudModel(id);
      onRefresh();
      setStatusMessage({ type: 'success', text: 'Active default AI model updated.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Failed to set default: ${err.message}` });
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Intro Banner */}
      <div style={{
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '12px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
            Cloud AI Model Manager
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>
            Configure real server-side LLM providers. API keys are tested and encrypted server-side, never exposed to clients.
          </p>
        </div>
        <div style={{
          backgroundColor: '#0f172a',
          padding: '0.5rem 0.875rem',
          borderRadius: '8px',
          border: '1px solid #334155',
          fontSize: '0.75rem',
          color: '#cbd5e1'
        }}>
          Server Endpoint: <code style={{ color: '#38bdf8' }}>POST /api/cloud-models</code> (JSON)
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          backgroundColor: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: statusMessage.type === 'success' ? '#34d399' : '#f87171',
          border: `1px solid ${statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Grid: Form on Left, Saved Models on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Connection Form */}
        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 600, color: '#f1f5f9' }}>
            Connect New Cloud Model
          </h3>

          {/* Presets */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Quick Presets
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: '1px solid #334155',
                    backgroundColor: providerName === (p.name === 'Custom (OpenAI-Compatible)' ? 'Custom' : p.name) ? '#2563eb' : '#1e293b',
                    color: '#f8fafc',
                    cursor: 'pointer'
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSaveAndTest}>
            {/* Provider Name */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Provider Name
              </label>
              <input
                type="text"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                placeholder="e.g. OpenAI, Groq, DeepSeek"
                required
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

            {/* API Key */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                API Key <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-••••••••••••••••••••"
                required
                autoComplete="off"
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
              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '0.25rem' }}>
                Encrypted server-side in persistent database. Never returned in full to the browser.
              </span>
            </div>

            {/* Model Name */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Model Name
              </label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="e.g. gpt-4o-mini, llama-3.3-70b-versatile"
                required
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

            {/* Base URL */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Base URL
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.openai.com/v1"
                required
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
              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '0.25rem' }}>
                Endpoint is automatically normalized to /chat/completions (avoids duplicate slashes or /v1/v1).
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: isSubmitting ? '#475569' : '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.925rem',
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {isSubmitting ? (
                <>
                  <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  Testing & Saving...
                </>
              ) : (
                'SAVE & TEST'
              )}
            </button>
          </form>
        </div>

        {/* Saved Models List */}
        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#f1f5f9' }}>
              Configured Models ({models.length})
            </h3>
            <button
              type="button"
              onClick={onRefresh}
              style={{
                background: 'transparent',
                border: '1px solid #334155',
                color: '#94a3b8',
                padding: '0.3rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              Refresh
            </button>
          </div>

          {models.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              color: '#64748b',
              backgroundColor: '#1e293b50',
              borderRadius: '8px',
              border: '1px dashed #334155'
            }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: '#94a3b8' }}>No Cloud Models Configured</p>
              <p style={{ margin: 0, fontSize: '0.8125rem' }}>Use the form on the left to connect OpenAI, Groq, or any compatible provider.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {models.map((m) => (
                <div
                  key={m.id}
                  style={{
                    backgroundColor: '#1e293b',
                    border: `1px solid ${m.isActive ? '#3b82f6' : '#334155'}`,
                    borderRadius: '10px',
                    padding: '1rem',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
                          {m.providerName}
                        </span>
                        {m.isActive && (
                          <span style={{
                            fontSize: '0.68rem',
                            backgroundColor: '#1e40af',
                            color: '#93c5fd',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '9999px',
                            fontWeight: 700
                          }}>
                            ACTIVE DEFAULT
                          </span>
                        )}
                        <span style={{
                          fontSize: '0.68rem',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '9999px',
                          fontWeight: 600,
                          backgroundColor: m.status === 'working' ? '#065f46' : '#7f1d1d',
                          color: m.status === 'working' ? '#6ee7b7' : '#fca5a5'
                        }}>
                          {m.status.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#38bdf8', marginTop: '0.2rem', fontFamily: 'monospace' }}>
                        {m.modelName}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      {!m.isActive && (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(m.id)}
                          style={{
                            backgroundColor: '#334155',
                            color: '#e2e8f0',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.3rem 0.5rem',
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                        >
                          Make Active
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleTestExisting(m.id)}
                        disabled={testingId === m.id}
                        style={{
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.3rem 0.6rem',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        {testingId === m.id ? 'Testing...' : 'Test'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(m.id)}
                        style={{
                          backgroundColor: 'transparent',
                          color: '#ef4444',
                          border: '1px solid #ef444440',
                          borderRadius: '6px',
                          padding: '0.3rem 0.5rem',
                          fontSize: '0.72rem',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div>
                      Base URL: <code style={{ color: '#cbd5e1' }}>{m.baseUrl}</code>
                    </div>
                    <div>
                      API Key: <code style={{ color: '#93c5fd' }}>{m.apiKeyMasked || 'Configured'}</code>
                    </div>
                    {m.latencyMs !== undefined && (
                      <div style={{ color: '#10b981', fontWeight: 600 }}>
                        Latency: {m.latencyMs}ms
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
