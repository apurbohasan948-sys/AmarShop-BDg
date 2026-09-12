import React, { useState } from 'react';
import { QueueItem } from '../types.js';
import { publishQueueItem, deleteQueueItem, toggleAutomation } from '../api.js';

interface QueueTabProps {
  queue: QueueItem[];
  onRefresh: () => void;
  autoPublish: boolean;
  onToggleAutoPublish: (enabled: boolean) => void;
}

export const QueueTab: React.FC<QueueTabProps> = ({
  queue,
  onRefresh,
  autoPublish,
  onToggleAutoPublish,
}) => {
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePublishNow = async (id: string) => {
    setPublishingId(id);
    try {
      await publishQueueItem(id);
      setMsg({ type: 'success', text: 'Post successfully published!' });
      onRefresh();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Publishing failed.' });
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this post from publishing queue?')) return;
    try {
      await deleteQueueItem(id);
      onRefresh();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to remove item.' });
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Top Banner with Auto-publish switch */}
      <div style={{
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '12px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
            Social Publishing & Review Queue
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: '#94a3b8' }}>
            Approve generated social copy, review images, or let the background runner broadcast automatically.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1' }}>
              Auto-Publish Scheduler:
            </span>
            <button
              onClick={() => onToggleAutoPublish(!autoPublish)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: autoPublish ? '#16a34a' : '#475569',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {autoPublish ? 'ACTIVE ON' : 'PAUSED'}
            </button>
          </div>
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
            Refresh
          </button>
        </div>
      </div>

      {msg && (
        <div style={{
          backgroundColor: msg.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          border: `1px solid ${msg.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
          color: msg.type === 'success' ? '#34d399' : '#f87171',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.875rem'
        }}>
          {msg.text}
        </div>
      )}

      {/* Queue items list */}
      {queue.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 1rem',
          backgroundColor: '#0f172a',
          borderRadius: '12px',
          border: '1px dashed #334155',
          color: '#64748b'
        }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: '#94a3b8' }}>Queue is Empty</p>
          <p style={{ margin: 0, fontSize: '0.8125rem' }}>Generate copy in Creative Studio to schedule posts.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {queue.map((item) => {
            const isPublished = item.status === 'published';
            const platforms = (item as any).platforms || [item.platform];
            const img = (item as any).productImage || item.mediaUrl;

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  display: 'flex',
                  gap: '1.25rem',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap'
                }}
              >
                {img && (
                  <img
                    src={img}
                    alt="Media preview"
                    style={{ width: '110px', height: '110px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #334155' }}
                  />
                )}

                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      {platforms.map((plat: string, pIdx: number) => (
                        <span
                          key={pIdx}
                          style={{
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '9999px',
                            fontSize: '0.7rem',
                            fontWeight: 700
                          }}
                        >
                          {plat.toUpperCase()}
                        </span>
                      ))}
                      <span style={{
                        backgroundColor: isPublished ? '#065f46' : '#854d0e',
                        color: isPublished ? '#6ee7b7' : '#fef08a',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.7rem',
                        fontWeight: 700
                      }}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {!isPublished && (
                        <button
                          onClick={() => handlePublishNow(item.id)}
                          disabled={publishingId === item.id}
                          style={{
                            padding: '0.35rem 0.75rem',
                            backgroundColor: '#16a34a',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {publishingId === item.id ? 'Publishing...' : 'Publish Now'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        style={{
                          padding: '0.35rem 0.6rem',
                          backgroundColor: 'transparent',
                          color: '#ef4444',
                          border: '1px solid #ef444440',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.875rem', color: '#f8fafc', whiteSpace: 'pre-wrap', lineHeight: 1.4, marginBottom: '0.5rem' }}>
                    {item.caption}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {(item.hashtags || []).map((h, hIdx) => (
                      <span key={hIdx} style={{ fontSize: '0.75rem', color: '#60a5fa' }}>
                        {h}
                      </span>
                    ))}
                  </div>

                  <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#64748b' }}>
                    Scheduled for: {(item as any).scheduledTime || item.scheduledFor || 'Immediate'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
