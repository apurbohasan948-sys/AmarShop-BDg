import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Key, 
  Globe, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trash2, 
  Play, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle,
  Server,
  ChevronRight,
  Info
} from 'lucide-react';

export interface CloudModel {
  id: string;
  providerName: string;
  modelName: string;
  baseUrl: string;
  status: 'working' | 'untested' | 'error';
  latencyMs?: number;
  isDefault?: boolean;
  apiKeyConfigured: boolean;
  apiKeyMasked: string;
  createdAt: string;
  updatedAt: string;
}

interface ProviderPreset {
  providerName: string;
  defaultBaseUrl: string;
  defaultModel: string;
  description: string;
}

const PRESETS: ProviderPreset[] = [
  {
    providerName: 'OpenAI',
    defaultBaseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    description: 'Industry standard GPT-4o-mini & GPT-4o'
  },
  {
    providerName: 'Groq',
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    description: 'Ultra-fast LPU inference (500+ tokens/sec)'
  },
  {
    providerName: 'DeepSeek',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    description: 'High-intelligence DeepSeek V3 reasoning'
  },
  {
    providerName: 'Together AI',
    defaultBaseUrl: 'https://api.together.xyz/v1',
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    description: 'Open-source open weights models'
  },
  {
    providerName: 'Mistral AI',
    defaultBaseUrl: 'https://api.mistral.ai/v1',
    defaultModel: 'mistral-small-latest',
    description: 'European AI leader'
  },
  {
    providerName: 'Custom OpenAI-Compatible',
    defaultBaseUrl: 'https://api.example.com/v1',
    defaultModel: 'custom-model-name',
    description: 'Any OpenAI API-compatible proxy or gateway'
  }
];

export const CloudModelsManager: React.FC = () => {
  const [models, setModels] = useState<CloudModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingModelId, setTestingModelId] = useState<string | null>(null);
  
  // Form State
  const [providerName, setProviderName] = useState('OpenAI');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('gpt-4o-mini');
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Feedback banners
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    details?: string;
  } | null>(null);

  // Fetch models on mount
  const loadModels = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cloud-models', {
        headers: { 'Accept': 'application/json' }
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(`Server returned non-JSON response (${contentType}). Starts with: ${text.slice(0, 80)}`);
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.models)) {
        setModels(data.models);
      }
    } catch (err: any) {
      console.error('Failed to load cloud models:', err);
      setFeedback({
        type: 'error',
        message: 'Could not connect to Cloud Models API: ' + err.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  const handleApplyPreset = (preset: ProviderPreset) => {
    setProviderName(preset.providerName);
    setBaseUrl(preset.defaultBaseUrl);
    setModelName(preset.defaultModel);
    setFeedback({
      type: 'info',
      message: `Preset applied for ${preset.providerName}. Enter your API key and click "SAVE & TEST".`
    });
  };

  // Submit: SAVE & TEST
  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!providerName.trim() || !apiKey.trim() || !modelName.trim() || !baseUrl.trim()) {
      setFeedback({
        type: 'error',
        message: 'Please fill in all 4 fields: Provider Name, API Key, Model Name, and Base URL.'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback({
        type: 'info',
        message: `Testing connection to ${providerName} (${modelName})...`
      });

      const res = await fetch('/api/cloud-models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          providerName: providerName.trim(),
          apiKey: apiKey.trim(),
          modelName: modelName.trim(),
          baseUrl: baseUrl.trim()
        })
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(`API endpoint returned HTML/invalid content instead of JSON: ${text.slice(0, 100)}`);
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        setFeedback({
          type: 'error',
          message: data.error || 'Failed to save or test cloud model.'
        });
        return;
      }

      // Success
      setFeedback({
        type: 'success',
        message: `Model "${data.model.providerName} - ${data.model.modelName}" successfully tested and saved to persistent storage!`,
        details: `Latency: ${data.model.latencyMs ? data.model.latencyMs + 'ms' : 'Ready'}`
      });

      // Clear sensitive input from form
      setApiKey('');
      
      // Reload models list from persistent backend
      await loadModels();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'An unexpected error occurred while communicating with the backend.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Test an existing model
  const handleTestExisting = async (id: string, name: string) => {
    setTestingModelId(id);
    try {
      const res = await fetch(`/api/cloud-models/${id}/test`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setFeedback({
          type: 'success',
          message: `Test successful for ${name}! Latency: ${data.latencyMs}ms.`
        });
        await loadModels();
      } else {
        setFeedback({
          type: 'error',
          message: `Test failed for ${name}: ${data.error || 'Unknown error'}`
        });
        await loadModels();
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: `Connection error testing ${name}: ${err.message}`
      });
    } finally {
      setTestingModelId(null);
    }
  };

  // Delete a model
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/cloud-models/${id}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
      });
      const data = await res.json();

      if (data.success) {
        setFeedback({
          type: 'info',
          message: `Model "${name}" deleted.`
        });
        await loadModels();
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: `Failed to delete model: ${err.message}`
      });
    }
  };

  // Set default model
  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/cloud-models/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true })
      });
      const data = await res.json();
      if (data.success) {
        await loadModels();
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Cloud AI API Manager • Full-Stack Verified
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Cloud AI Model Connections
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-1 max-w-2xl">
              Connect any OpenAI-compatible provider (OpenAI, Groq, DeepSeek, Together, Ollama). 
              Configurations and credentials are verified server-side and persisted securely.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3">
            <Server className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-xs text-slate-400">Backend Endpoint</div>
              <div className="text-xs font-mono font-medium text-emerald-400">POST /api/cloud-models</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback alerts */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
              : feedback.type === 'error'
              ? 'bg-rose-950/50 border-rose-500/40 text-rose-200'
              : 'bg-cyan-950/50 border-cyan-500/40 text-cyan-200'
          }`}
        >
          {feedback.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
          {feedback.type === 'error' && <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
          {feedback.type === 'info' && <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />}
          <div className="flex-1 text-sm">
            <p className="font-semibold">{feedback.message}</p>
            {feedback.details && <p className="text-xs opacity-80 mt-1 font-mono">{feedback.details}</p>}
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs opacity-60 hover:opacity-100 transition"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Grid: Form & Presets on Left, Saved Models on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Presets (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Presets Picker */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Quick Provider Presets
              </span>
              <span className="text-[11px] text-slate-500">Auto-fills Base URL & Model</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.providerName}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                    providerName.toLowerCase() === p.providerName.toLowerCase()
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="font-semibold">{p.providerName}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{p.defaultModel}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Connection Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              Configure & Test Cloud AI Model
            </h2>

            <form onSubmit={handleSaveAndTest} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Provider Name <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  placeholder="e.g. OpenAI, Groq, DeepSeek, Together"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>
                    API Key <span className="text-emerald-400">*</span>
                  </span>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-normal">
                    <ShieldCheck className="w-3 h-3" /> Server-side encrypted & masked
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    autoComplete="off"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Never saved to browser storage or returned unmasked in API responses.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Model Name <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="e.g. gpt-4o-mini, llama-3.3-70b-versatile"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Base URL <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Globe className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      placeholder="https://api.openai.com/v1"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* URL Normalization Info */}
              <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg text-xs text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Endpoint auto-detection:</strong> Base URLs like <code className="text-slate-300">.../v1</code> automatically route to <code className="text-emerald-400 font-mono">.../v1/chat/completions</code>.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800/50 text-slate-950 font-bold rounded-lg text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition duration-150"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      Testing & Saving...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      SAVE & TEST
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Persistent Saved Models (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              Saved Cloud Models ({models.length})
            </h2>
            <button
              onClick={loadModels}
              disabled={loading}
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Refresh models"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading && models.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Loading saved cloud models...</p>
            </div>
          ) : models.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-xl space-y-3">
              <Cpu className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-medium text-slate-300">No cloud models saved yet</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Fill out the form on the left with your provider credentials and click SAVE & TEST to add your first model.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {models.map((m) => (
                <div
                  key={m.id}
                  className={`p-4 rounded-xl border transition-all ${
                    m.isDefault
                      ? 'bg-slate-900/90 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{m.providerName}</span>
                        {m.isDefault && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                            Active Default
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-emerald-400 mt-0.5">{m.modelName}</div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-1.5">
                      {m.status === 'working' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px]">
                          <CheckCircle2 className="w-3 h-3" />
                          {m.latencyMs ? `${m.latencyMs}ms` : 'Working'}
                        </span>
                      ) : m.status === 'error' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[11px]">
                          <XCircle className="w-3 h-3" />
                          Error
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[11px]">
                          <Clock className="w-3 h-3" />
                          Untested
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1 my-2.5 text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">API Key:</span>
                      <span className="font-mono text-slate-300">{m.apiKeyMasked}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Endpoint:</span>
                      <span className="font-mono text-slate-300 truncate max-w-[200px]" title={m.baseUrl}>
                        {m.baseUrl}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <div className="flex items-center gap-1">
                      {!m.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(m.id)}
                          className="px-2.5 py-1 text-[11px] rounded font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
                        >
                          Set as Default
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleTestExisting(m.id, `${m.providerName} (${m.modelName})`)}
                        disabled={testingModelId === m.id}
                        className="px-2.5 py-1 text-[11px] rounded font-medium bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 flex items-center gap-1 transition"
                      >
                        <RefreshCw className={`w-3 h-3 ${testingModelId === m.id ? 'animate-spin' : ''}`} />
                        {testingModelId === m.id ? 'Testing...' : 'Test'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(m.id, `${m.providerName} (${m.modelName})`)}
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                        title="Delete model"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Persistence info card */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Persistence Guarantee
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              All models configured here are stored directly on the server filesystem (<code className="text-slate-300">data/app_data.json</code>). They survive page refreshes, browser reloads, and application restarts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
