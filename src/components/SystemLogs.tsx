import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Trash2, 
  RefreshCw, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info 
} from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  category: 'api' | 'scraper' | 'ai' | 'publisher' | 'system';
  message: string;
}

export const SystemLogs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/logs');
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleClearLogs = async () => {
    try {
      await fetch('/api/logs', { method: 'DELETE' });
      setLogs([]);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLogs = logs.filter(l => {
    if (filterCategory === 'all') return true;
    return l.category === filterCategory;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Terminal className="w-6 h-6 text-emerald-400" />
            Real-Time System Logs
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Live stream of backend events, scraper activities, AI completions, and publishing queues.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="api">API Endpoints</option>
            <option value="ai">AI Model</option>
            <option value="scraper">ShopBase Scraper</option>
            <option value="publisher">Social Publisher</option>
            <option value="system">System</option>
          </select>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleClearLogs}
            className="p-1.5 rounded-lg border border-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition"
            title="Clear logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logs Window */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs shadow-2xl">
        <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Backend Event Stream (Polling 5s)</span>
          </div>
          <span>{filteredLogs.length} events logged</span>
        </div>

        <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto divide-y divide-slate-900/80">
          {filteredLogs.length === 0 ? (
            <div className="py-8 text-center text-slate-600">No events found</div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="pt-2 first:pt-0 flex items-start gap-3">
                <span className="text-slate-600 text-[10px] shrink-0 pt-0.5">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>

                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold shrink-0 ${
                    log.level === 'success'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : log.level === 'error'
                      ? 'bg-rose-500/20 text-rose-400'
                      : log.level === 'warn'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {log.category}
                </span>

                <span
                  className={`flex-1 break-all ${
                    log.level === 'success'
                      ? 'text-emerald-200'
                      : log.level === 'error'
                      ? 'text-rose-300'
                      : log.level === 'warn'
                      ? 'text-amber-200'
                      : 'text-slate-300'
                  }`}
                >
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
