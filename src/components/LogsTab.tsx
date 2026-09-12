import React, { useState } from 'react';
import {
  Terminal,
  RefreshCw,
  Trash2,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { LogEntry } from '../types';
import { api } from '../api';

interface LogsTabProps {
  logs?: LogEntry[];
  onRefresh?: () => void;
}

export const LogsTab: React.FC<LogsTabProps> = ({ logs: propLogs, onRefresh }) => {
  const [internalLogs, setInternalLogs] = useState<LogEntry[]>([]);
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const logs = propLogs || internalLogs;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    } else {
      const data = await api.getLogs(150);
      setInternalLogs(data);
    }
    setIsRefreshing(false);
  };

  const handleClearLogs = async () => {
    if (!window.confirm('Clear all system logs?')) return;
    try {
      await api.clearLogs();
      if (onRefresh) onRefresh();
      else setInternalLogs([]);
    } catch (err: any) {
      alert(`Failed to clear logs: ${err.message}`);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchesSearch =
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.metadata && JSON.stringify(log.metadata).toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Terminal className="w-4 h-4" />
            <span>Real-Time Audit Trail & Diagnostic Console</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">System Activity Logs</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Live execution traces for ShopBase BD scraping, Tavily web inquiries, multi-model AI generation,
            creative video composition, and social channel publishing.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleClearLogs}
            className="px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-semibold rounded-xl border border-rose-800/40 transition flex items-center space-x-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search log messages or payload..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Level Filters */}
        <div className="flex space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {(['all', 'info', 'warn', 'error'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-3 py-1 rounded-lg capitalize transition font-medium ${
                levelFilter === lvl
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal View */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner font-mono text-xs">
        {/* Terminal Title Bar */}
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="ml-2 font-semibold text-slate-300">automation-pipeline.log</span>
          </div>
          <span>{filteredLogs.length} events logged</span>
        </div>

        {/* Log Entries List */}
        <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto divide-y divide-slate-900">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-600">
              No logs found matching current filter
            </div>
          ) : (
            filteredLogs.map((log) => {
              const timeStr = new Date(log.timestamp).toLocaleTimeString();
              const dateStr = new Date(log.timestamp).toLocaleDateString();

              return (
                <div key={log.id} className="pt-2 first:pt-0 pb-2">
                  <div className="flex items-start space-x-2.5">
                    {/* Level Icon */}
                    <div className="pt-0.5 shrink-0">
                      {log.level === 'error' && (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      )}
                      {log.level === 'warn' && (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      {log.level === 'info' && <Info className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>

                    {/* Timestamp */}
                    <div className="text-[11px] text-slate-500 shrink-0 font-sans">
                      <span>{dateStr}</span> <span className="text-slate-400">{timeStr}</span>
                    </div>

                    {/* Level Badge */}
                    <div
                      className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded shrink-0 ${
                        log.level === 'error'
                          ? 'bg-rose-500/20 text-rose-300'
                          : log.level === 'warn'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-cyan-500/20 text-cyan-300'
                      }`}
                    >
                      {log.level}
                    </div>

                    {/* Message */}
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 leading-relaxed break-words">{log.message}</p>

                      {/* Metadata if present */}
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <details className="mt-1">
                          <summary className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer select-none">
                            Inspect JSON payload
                          </summary>
                          <pre className="mt-1 p-2 bg-slate-900/90 rounded-lg text-[10px] text-slate-400 overflow-x-auto border border-slate-800">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
