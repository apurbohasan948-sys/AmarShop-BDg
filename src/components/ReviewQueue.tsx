import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Check, 
  X, 
  Edit3, 
  Send, 
  RefreshCw, 
  Clock, 
  ThumbsUp, 
  ThumbsDown 
} from 'lucide-react';
import { QueueItem } from './PublishingQueue';

export const ReviewQueue: React.FC = () => {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/queue');
      const data = await res.json();
      if (data.success && Array.isArray(data.queue)) {
        setItems(data.queue.filter((q: QueueItem) => q.status === 'pending'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await fetch(`/api/queue/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
      await fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await fetch(`/api/queue/${id}`, {
        method: 'DELETE'
      });
      await fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await fetch(`/api/queue/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: editCaption, status: 'approved' })
      });
      setEditingId(null);
      await fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-amber-400" />
            Post Review Queue ({items.length})
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Review pending AI-generated copy and creative assets before they are scheduled to post.
          </p>
        </div>
        <button
          onClick={fetchItems}
          disabled={loading}
          className="p-2 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white self-start sm:self-auto transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && items.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading pending reviews...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-xl">
          <CheckSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">All Posts Reviewed!</p>
          <p className="text-xs text-slate-500 mt-1">No pending content waiting for editorial review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row gap-5 items-start"
            >
              <div className="w-full md:w-32 h-32 shrink-0 bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
                <img
                  src={item.productImage}
                  alt={item.productTitle}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-3 w-full">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">{item.productTitle}</h3>
                  <span className="text-[11px] text-slate-500">{item.platforms.join(', ')}</span>
                </div>

                {editingId === item.id ? (
                  <div className="space-y-2">
                    <textarea
                      rows={4}
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-emerald-500 rounded-lg text-xs text-white"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        className="px-3 py-1 bg-emerald-500 text-slate-950 font-bold rounded text-xs"
                      >
                        Save & Approve
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 bg-slate-800 text-slate-300 rounded text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800 whitespace-pre-line">
                    {item.caption}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(item.id);
                      setEditCaption(item.caption);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReject(item.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs flex items-center gap-1.5 transition"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApprove(item.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
