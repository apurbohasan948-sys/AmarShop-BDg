import { useState } from 'react';
import {
  Send,
  CheckCircle,
  Clock,
  Trash2,
  Play,
  Filter,
  ExternalLink,
  Calendar,
  AlertCircle,
  Check,
} from 'lucide-react';
import { PublishingQueueItem, PlatformType } from '../types.ts';
import { api } from '../api.ts';

interface QueueTabProps {
  queue: PublishingQueueItem[];
  onRefresh: () => void;
  onPublishNow: (id: string) => void;
  onTriggerScheduler: () => void;
  schedulerRunning: boolean;
}

export function QueueTab({
  queue,
  onRefresh,
  onPublishNow,
  onTriggerScheduler,
  schedulerRunning,
}: QueueTabProps) {
  const [platformFilter, setPlatformFilter] = useState<'all' | PlatformType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'published'>('all');
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const filteredQueue = queue.filter((item) => {
    const matchesPlat = platformFilter === 'all' || item.platform === platformFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesPlat && matchesStatus;
  });

  const handlePublish = async (id: string) => {
    setPublishingId(id);
    try {
      await onPublishNow(id);
    } finally {
      setPublishingId(null);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.updateQueueStatus(id, { status: 'approved' });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to approve item.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Remove this scheduled post from publishing queue?')) {
      try {
        await api.deleteQueueItem(id);
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Failed to delete item.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-lg font-bold flex items-center space-x-2">
            <Send className="w-5 h-5 text-emerald-400" />
            <span>Multi-Channel Social Publishing Queue</span>
          </h2>
          <p className="text-xs text-slate-400">
            Autonomous post scheduler for Facebook Pages, Instagram Feeds, and TikTok Creators.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="queue-run-scheduler-btn"
            onClick={onTriggerScheduler}
            disabled={schedulerRunning}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${schedulerRunning ? 'animate-spin' : ''}`} />
            <span>{schedulerRunning ? 'Processing Due Posts...' : 'Run Publishing Tick'}</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl text-white">
        {/* Platforms */}
        <div className="flex items-center space-x-1">
          <span className="text-xs text-slate-400 mr-2 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1" /> Platform:
          </span>
          {(['all', 'facebook', 'instagram', 'tiktok'] as const).map((plat) => (
            <button
              key={plat}
              onClick={() => setPlatformFilter(plat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition ${
                platformFilter === plat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {plat}
            </button>
          ))}
        </div>

        {/* Status */}
        <div className="flex items-center space-x-1">
          <span className="text-xs text-slate-400 mr-2">Status:</span>
          {(['all', 'pending', 'approved', 'published'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition ${
                statusFilter === st
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Items List */}
      {filteredQueue.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-sm">
          No items found matching the selected filters.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQueue.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white hover:border-slate-700 transition shadow-sm flex flex-col md:flex-row gap-5 justify-between"
            >
              <div className="flex items-start space-x-4 min-w-0">
                <img
                  src={item.productImage || 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?w=200'}
                  alt={item.productTitle}
                  className="w-20 h-20 rounded-xl object-cover bg-slate-800 flex-shrink-0"
                />

                <div className="min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <h3 className="text-sm font-bold text-white">{item.productTitle}</h3>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        item.platform === 'facebook'
                          ? 'bg-blue-900/70 text-blue-300'
                          : item.platform === 'instagram'
                          ? 'bg-pink-900/70 text-pink-300'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {item.platform}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        item.status === 'published'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : item.status === 'approved'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 whitespace-pre-line mt-2 line-clamp-3 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    {item.content.caption}
                  </p>

                  <div className="flex items-center space-x-4 mt-2 text-xs text-slate-400">
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      {new Date(item.scheduledTime).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {item.publishedAt && (
                      <span className="text-emerald-400">
                        Dispatched: {new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex md:flex-col items-center justify-end md:justify-center space-x-2 md:space-x-0 md:space-y-2 flex-shrink-0 self-end md:self-center">
                {item.status !== 'published' ? (
                  <>
                    {item.status === 'pending' && (
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1 shadow-sm transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    <button
                      onClick={() => handlePublish(item.id)}
                      disabled={publishingId === item.id}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1 shadow-sm transition disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{publishingId === item.id ? 'Publishing...' : 'Publish Now'}</span>
                    </button>
                  </>
                ) : (
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-400 text-xs font-medium flex items-center space-x-1 border border-emerald-800/80">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Live on Social</span>
                  </div>
                )}

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                  title="Remove from queue"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
