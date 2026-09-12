import { useState, useEffect, FormEvent } from 'react';
import { Settings, Save, RotateCcw, CheckCircle, AlertCircle, Store, Share2, Clock } from 'lucide-react';
import { StoreSettings } from '../types.ts';
import { api } from '../api.ts';

export function SettingsTab() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSettings = async () => {
    try {
      const res = await api.getSettings();
      if (res.success) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await api.updateSettings(settings);
      if (res.success) {
        setMessage({ type: 'success', text: 'Store configuration saved successfully.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Reset all catalog, queue, and logs back to the pre-seeded Bangladeshi e-commerce dataset?')) {
      try {
        const res = await api.resetDatabase();
        if (res.success) {
          alert('Database reset successfully! Reloading data...');
          window.location.reload();
        }
      } catch (err: any) {
        alert(err.message || 'Reset failed.');
      }
    }
  };

  if (!settings) {
    return <div className="p-8 text-center text-slate-400 text-xs">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
            <Settings className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Store & Automation Settings</h2>
            <p className="text-xs text-slate-400">
              Configure ShopBase credentials, social media target channels, and autonomous scheduler timing.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* ShopBase Connection */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white space-y-4 shadow-sm">
          <h3 className="text-sm font-bold flex items-center space-x-2 text-emerald-400">
            <Store className="w-4 h-4" />
            <span>ShopBase Platform Configuration</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Store Name:</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">ShopBase Store URL:</label>
              <input
                type="url"
                value={settings.shopBaseStoreUrl}
                onChange={(e) => setSettings({ ...settings, shopBaseStoreUrl: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Currency Symbol:</label>
              <input
                type="text"
                value={settings.currencySymbol}
                onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Market:</label>
              <input
                type="text"
                value={settings.targetMarket}
                onChange={(e) => setSettings({ ...settings, targetMarket: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Social Accounts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white space-y-4 shadow-sm">
          <h3 className="text-sm font-bold flex items-center space-x-2 text-blue-400">
            <Share2 className="w-4 h-4" />
            <span>Social Publishing Channels</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Facebook Page Name:</label>
              <input
                type="text"
                value={settings.socialAccounts.facebookPageName}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialAccounts: { ...settings.socialAccounts, facebookPageName: e.target.value },
                  })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Instagram Handle:</label>
              <input
                type="text"
                value={settings.socialAccounts.instagramHandle}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialAccounts: { ...settings.socialAccounts, instagramHandle: e.target.value },
                  })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">TikTok Creator Account:</label>
              <input
                type="text"
                value={settings.socialAccounts.tiktokUsername}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialAccounts: { ...settings.socialAccounts, tiktokUsername: e.target.value },
                  })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Auto Scheduler */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white space-y-4 shadow-sm">
          <h3 className="text-sm font-bold flex items-center space-x-2 text-purple-400">
            <Clock className="w-4 h-4" />
            <span>Autonomous Publishing Scheduler</span>
          </h3>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="autoPublishCheckbox"
              checked={settings.autoPublishEnabled}
              onChange={(e) => setSettings({ ...settings, autoPublishEnabled: e.target.checked })}
              className="w-4 h-4 text-emerald-600 bg-slate-800 border-slate-700 rounded focus:ring-emerald-500"
            />
            <label htmlFor="autoPublishCheckbox" className="text-xs text-slate-200">
              Enable Auto-Dispatching for Approved Posts
            </label>
          </div>
        </div>

        {message && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
              message.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                : 'bg-rose-950/80 border border-rose-800 text-rose-300'
            }`}
          >
            {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetData}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 text-xs font-medium flex items-center space-x-1.5 transition border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
