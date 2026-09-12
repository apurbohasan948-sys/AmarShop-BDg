import { useState, useEffect } from 'react';
import { Terminal, RefreshCw, Trash2, Filter } from 'lucide-react';
import { SystemLog, LogModule, LogLevel } from '../types.ts';
import { api } from '../api.ts';

export function LogsTab() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [moduleFilter, setModuleFilter] = useState<'all' | LogModule>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | LogLevel>('all');

  const fetchLogs = async () => {
    try {
      const res = await api.getLogs();
      if (res.success) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleClear = async () => {
    if (window.confirm('Clear all system audit logs?')) {
      try {
        await api.clearLogs();
        fetchLogs();
      } catch (err) {
        console.error('Failed to clear logs:', err);
      }
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    return matchesModule && matchesLevel;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
            <Terminal className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold">System Automation & Audit Logs</h2>
            <p className="text-xs text-slate-400">
              Complete chronological audit trail for ShopBase scraper, Gemini generation, and multi-channel publishing.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchLogs}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleClear}
            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-300 text-xs flex items-center space-x-1 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl text-white">
        <div className="flex items-center space-x-1">
          <span className="text-xs text-slate-400 mr-2 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1" /> Module:
          </span>
          {(['all', 'collector', 'ai', 'queue', 'tavily', 'system'] as const).map((mod) => (
            <button
              key={mod}
              onClick={() => setModuleFilter(mod)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition ${
                moduleFilter === mod
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-1">
          <span className="text-xs text-slate-400 mr-2">Severity:</span>
          {(['all', 'info', 'success', 'warn', 'error'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition ${
                levelFilter === lvl
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-white shadow-sm">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No logs recorded for this criteria.</div>
        ) : (
          <div className="divide-y divide-slate-800/80 font-mono text-xs">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-3.5 hover:bg-slate-800/40 transition flex items-start space-x-3">
                <span className="text-slate-500 whitespace-nowrap pt-0.5">
                  {new Date(log.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>

                <span
                  className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded whitespace-nowrap ${
                    log.level === 'success'
                      ? 'bg-emerald-950 text-emerald-400'
                      : log.level === 'error'
                      ? 'bg-rose-950 text-rose-400'
                      : log.level === 'warn'
                      ? 'bg-amber-950 text-amber-400'
                      : 'bg-blue-950 text-blue-400'
                  }`}
                >
                  {log.level}
                </span>

                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded whitespace-nowrap">
                  {log.module}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 break-words">{log.message}</p>
                  {log.details && <p className="text-slate-400 text-[11px] mt-0.5 break-words">{log.details}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
