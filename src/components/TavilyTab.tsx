import React, { useState, useEffect } from 'react';
import {
  Search,
  Key,
  Globe,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { TavilyConfig } from '../types';
import { api } from '../api';

export const TavilyTab: React.FC = () => {
  const [config, setConfig] = useState<TavilyConfig & { hasKey: boolean }>({
    apiKey: '',
    searchDepth: 'basic',
    maxResults: 5,
    status: 'idle',
    hasKey: false,
  });

  const [inputKey, setInputKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Search Sandbox
  const [searchQuery, setSearchQuery] = useState('T900 Ultra Smart Watch price in Bangladesh review');
  const [searchDepth, setSearchDepth] = useState<'basic' | 'advanced'>('basic');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await api.getTavilyConfig();
      setConfig(data);
      if (data.apiKey) setInputKey(data.apiKey);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const saved = await api.saveTavilyConfig({
        apiKey: inputKey,
        searchDepth: config.searchDepth,
        maxResults: config.maxResults,
      });
      setConfig({ ...config, ...saved, hasKey: !!inputKey });
      alert('Tavily configuration saved.');
    } catch (err: any) {
      alert(`Error saving Tavily config: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await api.testTavily(inputKey);
      setTestResult(res);
      loadConfig();
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleExecuteSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setSearchResults(null);

    try {
      const res = await api.searchTavily(searchQuery, searchDepth);
      setSearchResults(res);
    } catch (err: any) {
      setSearchError(err.message || 'Search execution failed');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Search className="w-4 h-4" />
          <span>Market Intelligence & Research Layer</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Tavily AI Web Search & Trend Engine
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl">
          Tavily automatically grounds AI generation in real Bangladesh market pricing, competitor
          angles, and trending viral topics before marketing copy is synthesized.
        </p>
      </div>

      {/* 2-Column Layout: Configuration & Live Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: API Config */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-3">
              <Key className="w-4 h-4 text-cyan-400" />
              <span>Tavily Credentials & Rules</span>
            </h3>

            <form onSubmit={handleSaveConfig} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Tavily API Key</label>
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="tvly-••••••••••••••••"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Obtain your key from{' '}
                  <a href="https://tavily.com" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
                    tavily.com
                  </a>
                </p>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Default Search Depth</label>
                <select
                  value={config.searchDepth}
                  onChange={(e) => setConfig({ ...config, searchDepth: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                >
                  <option value="basic">Basic (Fast & Economical - 1 credit)</option>
                  <option value="advanced">Advanced (Deep contextual extraction - 2 credits)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Max Extracted Results</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={config.maxResults}
                  onChange={(e) => setConfig({ ...config, maxResults: parseInt(e.target.value, 10) || 5 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-xs shadow-sm transition"
                >
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs transition"
                >
                  {isTesting ? 'Testing...' : 'Test API'}
                </button>
              </div>
            </form>

            {/* Test Connection Banner */}
            {testResult && (
              <div
                className={`mt-4 p-3 rounded-xl text-xs ${
                  testResult.success
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                }`}
              >
                <div className="flex items-center space-x-1.5 font-bold">
                  {testResult.success ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  )}
                  <span>{testResult.message}</span>
                </div>
                {testResult.latencyMs && (
                  <div className="text-[10px] text-slate-400 mt-1">
                    Latency: {testResult.latencyMs}ms • Status: {testResult.status}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
            <h4 className="font-semibold text-slate-200 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>How Tavily is Utilized</span>
            </h4>
            <p>
              1. When a product is collected from ShopBase BD, Tavily scans live Bangladesh search results for user sentiment and competitive price points.
            </p>
            <p>
              2. The extracted search summary is passed directly into the Selected Cloud AI model prompt to inject factual grounding.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Search Sandbox */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-3">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>Live Market Research Sandbox</span>
            </h3>

            <form onSubmit={handleExecuteSearch} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter query to research (e.g. M10 TWS Earbuds Bangladesh price review)"
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <select
                value={searchDepth}
                onChange={(e) => setSearchDepth(e.target.value as any)}
                className="px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs"
              >
                <option value="basic">Basic Depth</option>
                <option value="advanced">Advanced Depth</option>
              </select>
              <button
                type="submit"
                disabled={isSearching}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <Search className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
                <span>{isSearching ? 'Researching...' : 'Run Research'}</span>
              </button>
            </form>

            {/* Error banner */}
            {searchError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            {/* Search Results Display */}
            {searchResults && (
              <div className="mt-5 space-y-4">
                {/* AI Synthesized Answer */}
                {searchResults.answer && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/30 border border-cyan-800/40">
                    <div className="flex items-center space-x-2 text-cyan-300 font-bold text-xs uppercase tracking-wider mb-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Tavily AI Synthesized Market Overview</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">{searchResults.answer}</p>
                  </div>
                )}

                {/* Sources list */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Extracted Web Sources ({searchResults.results?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {searchResults.results?.map((res: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex flex-col space-y-1 hover:border-slate-700 transition"
                      >
                        <div className="flex items-center justify-between">
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-slate-200 hover:text-cyan-400 flex items-center space-x-1 truncate max-w-md"
                          >
                            <span className="truncate">{res.title}</span>
                            <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                          </a>
                          <span className="text-[10px] text-cyan-400 font-mono">
                            Relevance: {(res.score * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed">
                          {res.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
