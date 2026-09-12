import React, { useState } from 'react';
import { 
  TrendingUp, 
  Search, 
  Sparkles, 
  Lightbulb, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw, 
  Check, 
  Copy 
} from 'lucide-react';

interface TavilyResult {
  query: string;
  answer?: string;
  results: {
    title: string;
    url: string;
    content: string;
    score?: number;
  }[];
  insights: {
    trendingHooks: string[];
    audiencePainPoints: string[];
    suggestedAngles: string[];
  };
}

export const TavilyResearch: React.FC = () => {
  const [query, setQuery] = useState('ergonomic lumbar pillow for office desk');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TavilyResult | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      const res = await fetch('/api/tavily/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-violet-400" />
          Tavily Market Trends & Social Angles
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Perform live competitor and trend research across the web to extract high-converting hooks and customer objections.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search product niche (e.g. portable wireless espresso maker, posture corrector)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-900/50 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Analyzing...' : 'Analyze Market'}
          </button>
        </div>
      </form>

      {/* Results */}
      {data && (
        <div className="space-y-6">
          {/* Answer card */}
          {data.answer && (
            <div className="bg-gradient-to-r from-violet-950/40 via-slate-900 to-slate-900 border border-violet-500/20 rounded-xl p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-violet-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Market Summary & Intelligence
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{data.answer}</p>
            </div>
          )}

          {/* Insights 3-column cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Hooks */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                <Sparkles className="w-4 h-4" />
                Viral Video Hooks
              </div>
              <p className="text-xs text-slate-400">Tested attention-grabbing hooks for short-form video:</p>
              <div className="space-y-2">
                {data.insights.trendingHooks.map((h, i) => (
                  <div
                    key={i}
                    onClick={() => copyToClipboard(h)}
                    className="p-3 bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 rounded-lg text-xs text-slate-300 hover:text-white cursor-pointer group transition flex items-start justify-between gap-2"
                  >
                    <span>"{h}"</span>
                    <button className="opacity-0 group-hover:opacity-100 text-emerald-400 transition shrink-0">
                      {copiedText === h ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Pain Points */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 text-sm font-bold">
                <AlertCircle className="w-4 h-4" />
                Audience Pain Points
              </div>
              <p className="text-xs text-slate-400">Target customer frustrations to address in ad copy:</p>
              <div className="space-y-2">
                {data.insights.audiencePainPoints.map((p, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300"
                  >
                    • {p}
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Angles */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
                <Lightbulb className="w-4 h-4" />
                Recommended Angles
              </div>
              <p className="text-xs text-slate-400">High-converting strategic framing for copy:</p>
              <div className="space-y-2">
                {data.insights.suggestedAngles.map((a, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300"
                  >
                    💡 {a}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sources */}
          {data.results && data.results.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Research Sources ({data.results.length})
              </div>
              <div className="divide-y divide-slate-800">
                {data.results.map((r, i) => (
                  <div key={i} className="py-3 first:pt-0 last:pb-0">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1.5"
                    >
                      {r.title}
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                    <p className="text-xs text-slate-400 mt-1">{r.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
