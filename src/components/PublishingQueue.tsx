import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Trash2, 
  RefreshCw, 
  Calendar, 
  Share2, 
  Filter,
  ExternalLink
} from 'lucide-react';

export interface QueueItem {
  id: string;
  productId?: string;
  productTitle: string;
  productImage: string;
  platforms: string[];
  caption: string;
  hashtags: string[];
  scheduledTime: string;
  status: 'pending' | 'approved' | 'scheduled' | 'published' | 'failed';
  createdAt: string;
  publishedAt?: string;
}

export const PublishingQueue: React.FC = () => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/queue');
      const data = await res.json();
      if (data.success && Array.isArray(data.queue)) {
        setQueue(data.queue);
      }
    } catch (err) {
      console.error('Failed to load publishing queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 15000);
    return () => clearInterval(interval);
  }, []);

  const handlePublishNow = async (id: string) => {
    try {
      setPublishingId(id);
      setFeedback(null);
      const res = await fetch(`/api/queue/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: 'Post successfully published across configured platforms!' });
        await fetchQueue();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Publishing failed.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error executing publish request.' });
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this scheduled post?')) return;
    try {
      const res = await fetch(`/api/queue/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setQueue(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const filteredQueue = queue.filter(item => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (filterPlatform !== 'all' && !item.platforms.includes(filterPlatform)) return false;
    return true;
  });

  const getStatusBadge = (status: QueueItem['status']) => {
    switch (status) {
      case 'published':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Published
          </span>
        );
      case 'scheduled':
      case 'approved':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Scheduled
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <Clock className="w-3 h-3" /> In Review
          </span>
        );
      case 'failed':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Failed
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-emerald-400" />
            Social Media Publishing Queue ({filteredQueue.length})
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Manage scheduled automation, manual instant triggers, and multi-channel publication status.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled / Approved</option>
            <option value="pending">In Review</option>
            <option value="published">Published</option>
            <option value="failed">Failed</option>
          </select>

          {/* Platform Filter */}
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
          >
            <option value="all">All Platforms</option>
            <option value="Facebook">Facebook</option>
            <option value="Instagram">Instagram</option>
            <option value="TikTok">TikTok</option>
            <option value="YouTube">YouTube</option>
          </select>

          <button
            onClick={fetchQueue}
            disabled={loading}
            className="p-2 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs sm:text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100 font-bold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Queue Items List */}
      {loading && queue.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading scheduled posts...</p>
        </div>
      ) : filteredQueue.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-xl">
          <Share2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">Publishing Queue is Empty</p>
          <p className="text-xs text-slate-500 mt-1">
            Generate new social posts or video storyboards in Creative Studio to schedule them.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQueue.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row gap-5 items-start hover:border-slate-700 transition"
            >
              {/* Product Thumbnail */}
              <div className="w-full md:w-36 h-36 shrink-0 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 relative">
                {item.productImage ? (
                  <img
                    src={item.productImage}
                    alt={item.productTitle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-700 text-xs">
                    No Image
                  </div>
                )}
                <div className="absolute bottom-2 left-2 flex gap-1">
                  {item.platforms.map((p) => (
                    <span
                      key={p}
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-950/80 text-white backdrop-blur-sm border border-slate-700"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Main Info */}
              <div className="flex-1 space-y-3 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className="text-sm font-bold text-white">{item.productTitle}</h3>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(item.status)}
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.scheduledTime).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Post Caption Preview */}
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs text-slate-300 font-mono whitespace-pre-line max-h-36 overflow-y-auto">
                  {item.caption}
                </div>

                {/* Hashtags */}
                {Array.isArray(item.hashtags) && item.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.hashtags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>

                  {item.status !== 'published' && (
                    <button
                      type="button"
                      disabled={publishingId === item.id}
                      onClick={() => handlePublishNow(item.id)}
                      className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
                    >
                      <Send className={`w-3.5 h-3.5 ${publishingId === item.id ? 'animate-spin' : ''}`} />
                      {publishingId === item.id ? 'Publishing...' : 'Publish Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default PublishingQueue;
