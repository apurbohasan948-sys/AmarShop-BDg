import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  Check, 
  X, 
  Sliders, 
  Key, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [tavilyApiKey, setTavilyApiKey] = useState('');
  const [autoPublish, setAutoPublish] = useState(false);
  const [facebookAutoPost, setFacebookAutoPost] = useState(true);
  const [instagramAutoPost, setInstagramAutoPost] = useState(true);
  const [tiktokAutoPost, setTiktokAutoPost] = useState(true);
  const [youtubeAutoPost, setYoutubeAutoPost] = useState(false);
  const [defaultHashtags, setDefaultHashtags] = useState('#ShopBase, #TrendingNow, #SmartShopping');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/settings')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.settings) {
            const s = data.settings;
            setAutoPublish(!!s.autoPublish);
            setFacebookAutoPost(!!s.facebookAutoPost);
            setInstagramAutoPost(!!s.instagramAutoPost);
            setTiktokAutoPost(!!s.tiktokAutoPost);
            setYoutubeAutoPost(!!s.youtubeAutoPost);
            if (Array.isArray(s.defaultHashtags)) {
              setDefaultHashtags(s.defaultHashtags.join(', '));
            }
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const hashtagsArr = defaultHashtags.split(',').map(h => h.trim()).filter(Boolean);
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autoPublish,
          facebookAutoPost,
          instagramAutoPost,
          tiktokAutoPost,
          youtubeAutoPost,
          defaultHashtags: hashtagsArr,
          ...(tavilyApiKey.trim() ? { tavilyApiKey: tavilyApiKey.trim() } : {})
        })
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-white text-base">
            <SettingsIcon className="w-5 h-5 text-emerald-400" />
            Automation & Channel Settings
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5 text-sm">
          {/* Channels Toggle */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Auto-Publishing Social Targets
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Facebook Page', val: facebookAutoPost, set: setFacebookAutoPost },
                { label: 'Instagram Reels', val: instagramAutoPost, set: setInstagramAutoPost },
                { label: 'TikTok Video', val: tiktokAutoPost, set: setTiktokAutoPost },
                { label: 'YouTube Shorts', val: youtubeAutoPost, set: setYoutubeAutoPost }
              ].map(ch => (
                <label
                  key={ch.label}
                  className="flex items-center gap-2 p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={ch.val}
                    onChange={(e) => ch.set(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-300 font-medium">{ch.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tavily API Key (Optional) */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Tavily API Key (Optional)
            </label>
            <input
              type="password"
              value={tavilyApiKey}
              onChange={(e) => setTavilyApiKey(e.target.value)}
              placeholder="tvly-..."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:border-emerald-500 font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              If not provided, the built-in trend intelligence engine synthesizes market queries.
            </p>
          </div>

          {/* Default Hashtags */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Default Social Hashtags
            </label>
            <input
              type="text"
              value={defaultHashtags}
              onChange={(e) => setDefaultHashtags(e.target.value)}
              placeholder="#ShopBase, #TrendingNow"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" /> Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
