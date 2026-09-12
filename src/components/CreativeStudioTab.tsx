import React, { useState } from 'react';
import { Product, CloudModel } from '../types.js';
import { generateSocialPosts, generateVideoScript, addToQueue } from '../api.js';

interface CreativeStudioTabProps {
  products: Product[];
  activeModel: CloudModel | null;
  selectedProduct: Product | null;
  onNavigateToQueue: () => void;
  onNavigateToModels: () => void;
}

export const CreativeStudioTab: React.FC<CreativeStudioTabProps> = ({
  products,
  activeModel,
  selectedProduct,
  onNavigateToQueue,
  onNavigateToModels,
}) => {
  const [productId, setProductId] = useState(selectedProduct?.id || (products[0]?.id || ''));
  const [platforms, setPlatforms] = useState<string[]>(['Facebook', 'TikTok', 'Reels', 'YouTube']);
  const [tone, setTone] = useState('High Energy & Urgent');
  const [customInstructions, setCustomInstructions] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<any[]>([]);
  const [videoScript, setVideoScript] = useState<any | null>(null);
  const [queueSuccess, setQueueSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const togglePlatform = (p: string) => {
    if (platforms.includes(p)) {
      if (platforms.length > 1) {
        setPlatforms(platforms.filter((item) => item !== p));
      }
    } else {
      setPlatforms([...platforms, p]);
    }
  };

  const handleGenerate = async () => {
    if (!activeModel || activeModel.status !== 'working') {
      setErrorMessage('Please configure and verify an active Cloud AI Model first in the Cloud Models tab.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setQueueSuccess(null);

    try {
      const res = await generateSocialPosts({
        productId,
        platforms,
        tone,
        customInstructions
      });

      if (res.success && res.posts) {
        setGeneratedPosts(res.posts);
      } else {
        setErrorMessage(res.error || 'Content generation failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const res = await generateVideoScript(productId, 'TikTok');
      if (res.success && res.script) {
        setVideoScript(res.script);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Video script generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToQueue = async (post: any) => {
    try {
      const targetProd = products.find((p) => p.id === productId);
      await addToQueue({
        productId,
        productTitle: targetProd?.title || 'Featured Product',
        platform: post.platform,
        caption: post.caption,
        hashtags: post.hashtags || [],
        hook: post.hook || '',
        mediaType: 'image',
        mediaUrl: (targetProd as any)?.imageUrl,
        scheduledFor: new Date(Date.now() + 3600000 * 2).toISOString(),
        status: 'scheduled'
      });

      setQueueSuccess(`Post for ${post.platform} successfully added to Publishing Queue!`);
      setTimeout(() => setQueueSuccess(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to add to queue.');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Active Model Indicator */}
      <div style={{
        backgroundColor: activeModel?.status === 'working' ? '#1e293b' : 'rgba(239, 68, 68, 0.1)',
        border: `1px solid ${activeModel?.status === 'working' ? '#334155' : 'rgba(239, 68, 68, 0.3)'}`,
        borderRadius: '10px',
        padding: '0.875rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: activeModel?.status === 'working' ? '#10b981' : '#ef4444'
          }} />
          <span style={{ fontSize: '0.875rem', color: '#e2e8f0' }}>
            Inference Provider: <strong>{activeModel ? `${activeModel.providerName} (${activeModel.modelName})` : 'None Configured'}</strong>
          </span>
        </div>
        {(!activeModel || activeModel.status !== 'working') && (
          <button
            onClick={onNavigateToModels}
            style={{
              padding: '0.4rem 0.8rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Configure Model
          </button>
        )}
      </div>

      {queueSuccess && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#34d399',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.875rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{queueSuccess}</span>
          <button
            onClick={onNavigateToQueue}
            style={{
              background: '#065f46',
              border: 'none',
              color: '#ffffff',
              padding: '0.3rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            View Queue
          </button>
        </div>
      )}

      {errorMessage && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          color: '#f87171',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.875rem'
        }}>
          {errorMessage}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Controls Column */}
        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '12px',
          padding: '1.25rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
            Generation Settings
          </h3>

          {/* Product Picker */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.35rem' }}>
              Target Product
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#f8fafc',
                fontSize: '0.875rem'
              }}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (${(p as any).price})
                </option>
              ))}
            </select>
          </div>

          {/* Platforms Picker */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.35rem' }}>
              Target Platforms
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {['Facebook', 'TikTok', 'Reels', 'YouTube'].map((p) => {
                const isSelected = platforms.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlatform(p)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: '1px solid #334155',
                      backgroundColor: isSelected ? '#2563eb' : '#1e293b',
                      color: '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    {p} {isSelected ? '✓' : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tone */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.35rem' }}>
              Tone of Voice
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#f8fafc',
                fontSize: '0.875rem'
              }}
            >
              <option value="High Energy & Urgent">High Energy & Urgent (FOMO)</option>
              <option value="Problem-Solution Empathetic">Problem-Solution (Empathetic)</option>
              <option value="Casual & Relatable">Casual & Relatable (UGC style)</option>
              <option value="Luxury & Aesthetic">Luxury & Aesthetic</option>
            </select>
          </div>

          {/* Custom prompt */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.35rem' }}>
              Special Promo Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="e.g. Highlight 50% discount code SAVE50 and 30-day money-back guarantee."
              style={{
                width: '100%',
                padding: '0.6rem',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#f8fafc',
                fontSize: '0.8125rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: isGenerating ? 'not-allowed' : 'pointer'
              }}
            >
              {isGenerating ? 'Synthesizing with Cloud AI...' : 'Generate Multi-Platform Posts'}
            </button>

            <button
              onClick={handleGenerateVideo}
              disabled={isGenerating}
              style={{
                width: '100%',
                padding: '0.6rem',
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.8125rem',
                cursor: isGenerating ? 'not-allowed' : 'pointer'
              }}
            >
              Generate Short Video Script & Storyboard
            </button>
          </div>
        </div>

        {/* Results Column */}
        <div>
          {generatedPosts.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                Generated Social Posts
              </h3>
              {generatedPosts.map((post, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '10px',
                    padding: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      {post.platform}
                    </span>
                    <button
                      onClick={() => handleAddToQueue(post)}
                      style={{
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      + Schedule to Queue
                    </button>
                  </div>

                  <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    Hook: "{post.hook}"
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: '#e2e8f0', whiteSpace: 'pre-wrap', lineHeight: 1.5, margin: '0 0 0.75rem 0' }}>
                    {post.caption}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {(post.hashtags || []).map((h: string, hIdx: number) => (
                      <span key={hIdx} style={{ fontSize: '0.75rem', color: '#60a5fa' }}>
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Video Script Result */}
          {videoScript && (
            <div style={{
              backgroundColor: '#1e293b',
              border: '1px solid #7c3aed50',
              borderRadius: '12px',
              padding: '1.25rem'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#c084fc', fontSize: '1rem', fontWeight: 700 }}>
                Short-Form Video Script: {videoScript.title}
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0 0 1rem 0' }}>
                Target Platform: {videoScript.platform} | Audio: {videoScript.audioRecommendation}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(videoScript.scenes || []).map((s: any, sIdx: number) => (
                  <div key={sIdx} style={{ backgroundColor: '#0f172a', padding: '0.75rem', borderRadius: '8px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24' }}>
                      Scene {s.sceneNumber} ({s.durationSeconds}s)
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                      <strong>Visual:</strong> {s.visualDescription}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#38bdf8', marginTop: '0.2rem' }}>
                      <strong>Voiceover:</strong> "{s.voiceover}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!generatedPosts.length && !videoScript && (
            <div style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              color: '#64748b',
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              border: '1px dashed #334155'
            }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: '#94a3b8' }}>Studio Canvas Empty</p>
              <p style={{ margin: 0, fontSize: '0.8125rem' }}>Select a product and click "Generate Multi-Platform Posts" to preview copy.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
