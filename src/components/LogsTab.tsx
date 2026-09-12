import React from 'react';
import { LogEntry } from '../types.js';
import { clearLogs } from '../api.js';

interface LogsTabProps {
  logs: LogEntry[];
  onRefresh: () => void;
}

export const LogsTab: React.FC<LogsTabProps> = ({ logs, onRefresh }) => {
  const handleClear = async () => {
    if (!confirm('Clear all system logs?')) return;
    try {
      await clearLogs();
      onRefresh();
    } catch (err: any) {
      alert(`Failed to clear logs: ${err.message}`);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return '#f87171';
      case 'warn':
        return '#fbbf24';
      case 'success':
        return '#34d399';
      default:
        return '#60a5fa';
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        backgroundColor: '#1e293b',
        padding: '1rem 1.25rem',
        borderRadius: '10px',
        border: '1px solid #334155'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
            System Diagnostic & Operation Logs ({logs.length})
          </h2>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
            Live logging of API calls, model connectivity tests, and auto-publishing tasks.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={onRefresh}
            style={{
              padding: '0.4rem 0.75rem',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#94a3b8',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            Refresh Logs
          </button>
          <button
            onClick={handleClear}
            style={{
              padding: '0.4rem 0.75rem',
              backgroundColor: '#7f1d1d',
              border: 'none',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div style={{
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '10px',
        fontFamily: 'monospace',
        fontSize: '0.8125rem',
        maxHeight: '600px',
        overflowY: 'auto'
      }}>
        {logs.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            No logs recorded yet.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              style={{
                padding: '0.6rem 1rem',
                borderBottom: '1px solid #1e293b',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start'
              }}
            >
              <span style={{ color: '#64748b', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span style={{
                color: getLevelColor(log.level),
                fontWeight: 700,
                fontSize: '0.75rem',
                minWidth: '60px'
              }}>
                [{log.level.toUpperCase()}]
              </span>
              <span style={{
                color: '#94a3b8',
                fontSize: '0.75rem',
                backgroundColor: '#1e293b',
                padding: '0.1rem 0.4rem',
                borderRadius: '4px'
              }}>
                {log.category.toUpperCase()}
              </span>
              <span style={{ color: '#e2e8f0', flex: 1, wordBreak: 'break-word' }}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
