import { useState, useEffect, FormEvent } from 'react';
import { Search, TrendingUp, ExternalLink, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { TavilyResearchResult } from '../types.ts';
import { api } from '../api.ts';

export function TavilyTab() {
  const [researchList, setResearchList] = useState<TavilyResearchResult[]>([]);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResearch = async () => {
    try {
      const res = await api.getResearch();
      if (res.success) {
        setResearchList(res.data);
      }
    } catch (err) {
      console.error('Failed to load market research:', err);
    }
  };

  useEffect(() => {
    fetchResearch();
  }, []);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setError(null);

    try {
      const res = await api.runResearch(query.trim());
      if (res.success) {
        setQuery('');
        fetchResearch();
      }
    } catch (err: any) {
      setError(err.message || 'Market trend research failed.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Bangladesh eCommerce Market Research</h2>
            <p className="text-xs text-slate-400">
              Query high-converting product trends, pricing margins, and consumer demand across Daraz, Facebook Commerce, and Pickaboo.
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            id="tavily-query-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search trend (e.g. 'high demand winter hoodies bd', 'organic mustard oil')..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            required
          />
          <button
            type="submit"
            disabled={searching}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-2 shadow-sm transition disabled:opacity-50"
          >
            {searching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Market...</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                <span>Analyze Demand</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {researchList.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white flex flex-col justify-between hover:border-slate-700 transition shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">{item.category}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    item.trendingDemand === 'very_high'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {item.trendingDemand === 'very_high' ? '🔥 Very High Demand' : '📈 Steady Demand'}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mt-2">{item.title}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{item.snippet}</p>

              <div className="mt-4 p-3 rounded-lg bg-slate-800/60 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Estimated Margin:</span>
                  <span className="font-bold text-emerald-400">{item.estimatedMargin}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-semibold">Strategic Recommendation:</span>
                  <p className="text-slate-200 text-[11px] leading-normal">{item.suggestedAction}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="text-[11px] text-slate-500 font-mono">Relevance: {Math.round(item.score * 100)}%</span>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline flex items-center space-x-1"
              >
                <span>Read Benchmark</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
