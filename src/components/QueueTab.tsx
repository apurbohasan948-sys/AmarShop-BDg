import React, { useState } from 'react';
import {
  ListOrdered,
  Facebook,
  Youtube,
  Video,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Edit3,
  Trash2,
  ExternalLink,
  Calendar,
  Sparkles,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Layers,
} from 'lucide-react';
import { QueueItem } from '../types';
import { api } from '../api';

interface QueueTabProps {
  queue: QueueItem[];
  isTestMode: boolean;
  onRefresh: () => void;
}

export const QueueTab: React.FC<QueueTabProps> = ({
  queue,
  isTestMode,
  onRefresh,
}) => {
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<{ id: string; success: boolean; message: string; url?: string } | null>(null);

  // Edit modal
  const [editingItem, setEditingItem] = useState<QueueItem | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Scheduling modal / picker
  const [schedulingItem, setSchedulingItem] = useState<QueueItem | null>(null);
  const [scheduleDateTime, setScheduleDateTime] = useState<string>('');

  const handlePublish = async (item: QueueItem) => {
    setPublishingId(item.id);
    setPublishResult(null);

    try {
      const res = await api.publishQueueItem(item.id);
      setPublishResult({
        id: item.id,
        success: true,
        message: res.message,
        url: res.externalPostUrl,
      });
      onRefresh();
    } catch (err: any) {
      setPublishResult({
        id: item.id,
        success: false,
        message: err.message || 'Failed to publish post',
      });
      onRefresh();
    } finally {
      setPublishingId(null);
    }
  };

  const handleApprove = async (item: QueueItem) => {
    try {
      await api.updateQueueItem(item.id, { status: 'approved' });
      onRefresh();
    } catch (err: any) {
      alert(`Error approving item: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this post from queue?')) return;
    try {
      await api.deleteQueueItem(id);
      onRefresh();
    } catch (err: any) {
      alert(`Error deleting item: ${err.message}`);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsSavingEdit(true);
    try {
      await api.updateQueueItem(editingItem.id, {
        content: editingItem.content,
      });
      setEditingItem(null);
      onRefresh();
    } catch (err: any) {
      alert(`Error saving edits: ${err.message}`);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleSetSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingItem || !scheduleDateTime) return;

    try {
      await api.updateQueueItem(schedulingItem.id, {
        status: 'scheduled',
        scheduledTime: new Date(scheduleDateTime).toISOString(),
      });
      setSchedulingItem(null);
      setScheduleDateTime('');
      onRefresh();
    } catch (err: any) {
      alert(`Error setting schedule: ${err.message}`);
    }
  };

  const handleBulkApprove = async () => {
    const drafts = queue.filter((q) => q.status === 'draft');
    if (drafts.length === 0) return;
    if (!window.confirm(`Approve all ${drafts.length} draft items?`)) return;

    for (const item of drafts) {
      await api.updateQueueItem(item.id, { status: 'approved' });
    }
    onRefresh();
  };

  // Filtering
  const filteredQueue = queue.filter((item) => {
    const matchesPlatform = platformFilter === 'all' || item.platform === platformFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesSearch =
      item.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.contentType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlatform && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ListOrdered className="w-4 h-4" />
            <span>Social Publishing & Duplicate Management</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Publishing Queue & Post Dispatcher
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Review AI-generated captions, 9:16 vertical video creatives, and metadata before posting.
            Supports Facebook Graph API v19, YouTube Shorts v3, and TikTok Creator API.
          </p>
        </div>

        {/* Global Safe Mode Alert */}
        <div className="flex items-center space-x-3">
          {isTestMode ? (
            <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-bold">Test Mode Active:</span> Safe simulation mode
              </div>
            </div>
          ) : (
            <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <div>
                <span className="font-bold">Live Mode:</span> Posts send to real channels
              </div>
            </div>
          )}

          <button
            onClick={handleBulkApprove}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            Approve All Drafts
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
            placeholder="Search by product, caption or tags..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Platform & Status Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Platform Pills */}
          <div className="flex space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(['all', 'facebook', 'youtube', 'tiktok'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                className={`px-3 py-1 rounded-lg capitalize transition font-medium ${
                  platformFilter === p
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Status Pills */}
          <div className="flex space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(['all', 'draft', 'approved', 'scheduled', 'published', 'failed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg capitalize transition font-medium ${
                  statusFilter === s
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Publish Result Alert Banner */}
      {publishResult && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center justify-between ${
            publishResult.success
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
          }`}
        >
          <div className="flex items-center space-x-2">
            {publishResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{publishResult.message}</span>
          </div>

          {publishResult.url && (
            <a
              href={publishResult.url}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:underline flex items-center space-x-1 font-semibold"
            >
              <span>View Post</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Queue Items List */}
      <div className="space-y-4">
        {filteredQueue.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 border border-dashed border-slate-800 rounded-2xl">
            <ListOrdered className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No items found in queue</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Go to the Products tab and click &quot;Run Automation&quot; to generate content and creatives
              automatically.
            </p>
          </div>
        ) : (
          filteredQueue.map((item) => {
            const isPublishing = publishingId === item.id;

            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-sm transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left Column: Media Thumbnail & Badges */}
                  <div className="flex space-x-4 flex-1">
                    {/* Media Thumbnail */}
                    <div className="relative w-28 h-28 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                      {item.content.mediaUrls && item.content.mediaUrls[0] ? (
                        <img
                          src={item.content.mediaUrls[0]}
                          alt={item.productTitle}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <Video className="w-6 h-6" />
                        </div>
                      )}

                      {/* Content Type Badge */}
                      <div className="absolute bottom-1 right-1 bg-slate-950/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-300">
                        {item.contentType.includes('reel') || item.contentType.includes('short') || item.contentType.includes('video')
                          ? '9:16 Video'
                          : 'Post Image'}
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Platform & Status Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200">
                          {item.platform === 'facebook' && <Facebook className="w-3.5 h-3.5 text-blue-500" />}
                          {item.platform === 'youtube' && <Youtube className="w-3.5 h-3.5 text-red-500" />}
                          {item.platform === 'tiktok' && <Video className="w-3.5 h-3.5 text-cyan-400" />}
                          <span className="capitalize">{item.platform}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-[11px] text-slate-300 font-normal">
                            {item.contentType.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                            item.status === 'published'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : item.status === 'approved'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : item.status === 'scheduled'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : item.status === 'failed'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {item.status}
                        </span>

                        {/* AI & Tavily Badges */}
                        {item.aiModelUsed && (
                          <span className="text-[10px] text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded">
                            Model: {item.aiModelUsed}
                          </span>
                        )}

                        {item.tavilyResearchUsed && (
                          <span className="text-[10px] text-cyan-400 font-mono bg-cyan-500/10 px-2 py-0.5 rounded">
                            ✓ Tavily Grounded
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-slate-100">{item.productTitle}</h3>

                      {/* Hook & Selling Price */}
                      {item.content.hook && (
                        <div className="text-xs text-amber-300 font-semibold">
                          Hook: &quot;{item.content.hook}&quot;
                        </div>
                      )}

                      {/* Caption Preview */}
                      <p className="text-xs text-slate-300 whitespace-pre-line line-clamp-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 font-sans">
                        {item.content.caption}
                      </p>

                      {/* Hashtags */}
                      {item.content.hashtags && item.content.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 text-[11px] text-indigo-400">
                          {item.content.hashtags.map((h, i) => (
                            <span key={i}>{h}</span>
                          ))}
                        </div>
                      )}

                      {/* Error Message if Failed */}
                      {item.errorMessage && (
                        <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg flex items-center space-x-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Error: {item.errorMessage}</span>
                        </div>
                      )}

                      {/* Scheduled Time Banner */}
                      {item.status === 'scheduled' && item.scheduledTime && (
                        <div className="text-xs text-amber-300 flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            Scheduled for: {new Date(item.scheduledTime).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-end gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    {/* Approve button */}
                    {item.status === 'draft' && (
                      <button
                        onClick={() => handleApprove(item)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    {/* Publish Now */}
                    {item.status !== 'published' && (
                      <button
                        onClick={() => handlePublish(item)}
                        disabled={isPublishing}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        <Send className={`w-3.5 h-3.5 ${isPublishing ? 'animate-spin' : ''}`} />
                        <span>{isPublishing ? 'Publishing...' : 'Publish Now'}</span>
                      </button>
                    )}

                    {/* If published, link */}
                    {item.status === 'published' && item.externalPostUrl && (
                      <a
                        href={item.externalPostUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-medium text-xs rounded-xl border border-slate-700 transition flex items-center space-x-1.5"
                      >
                        <span>View Live</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <div className="flex items-center space-x-1.5">
                      {/* Schedule Button */}
                      {item.status !== 'published' && (
                        <button
                          onClick={() => {
                            setSchedulingItem(item);
                            // Default 1 hour from now
                            const date = new Date(Date.now() + 3600 * 1000);
                            setScheduleDateTime(date.toISOString().slice(0, 16));
                          }}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
                          title="Schedule Publish Time"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Edit Button */}
                      <button
                        onClick={() => setEditingItem({ ...item })}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
                        title="Edit Caption & Creatives"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-slate-800 hover:bg-rose-900/30 text-slate-400 hover:text-rose-400 rounded-xl border border-slate-700 transition"
                        title="Delete from Queue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Content Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Edit Queue Item Content</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Hook / Headline</label>
                <input
                  type="text"
                  value={editingItem.content.hook || ''}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      content: { ...editingItem.content, hook: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Full Post Caption</label>
                <textarea
                  rows={6}
                  value={editingItem.content.caption || ''}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      content: { ...editingItem.content, caption: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Call to Action (CTA)</label>
                <input
                  type="text"
                  value={editingItem.content.cta || ''}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      content: { ...editingItem.content, cta: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Hashtags (Comma-separated)</label>
                <input
                  type="text"
                  value={editingItem.content.hashtags?.join(', ') || ''}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      content: {
                        ...editingItem.content,
                        hashtags: e.target.value.split(',').map((s) => s.trim()),
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold"
                >
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Picker Modal */}
      {schedulingItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Schedule Post Publishing</h3>
            <p className="text-xs text-slate-400 mb-4">
              Set target publish time for &quot;{schedulingItem.productTitle}&quot; on{' '}
              <span className="capitalize font-semibold text-slate-200">{schedulingItem.platform}</span>.
            </p>

            <form onSubmit={handleSetSchedule} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Publish Date & Time (Local)</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleDateTime}
                  onChange={(e) => setScheduleDateTime(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSchedulingItem(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold"
                >
                  Set Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
