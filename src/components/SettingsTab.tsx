import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  AlertTriangle,
  Building,
  DollarSign,
  Share2,
  Clock,
  CheckCircle2,
  Play,
  Facebook,
  Youtube,
  Video,
  Key,
} from 'lucide-react';
import {
  BrandSettings,
  PricingRules,
  SocialAccountConfig,
  AutomationSettings,
  AppSettings,
} from '../types';
import { api } from '../api';

interface SettingsTabProps {
  settings?: AppSettings | null;
  onRefresh: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ onRefresh }) => {
  const [brand, setBrand] = useState<BrandSettings>({
    brandName: 'ShopBase BD',
    logoUrl: '',
    contactNumber: '+880 1700-000000',
    facebookPage: 'https://facebook.com/ShopBaseBD',
    website: 'https://shopbasebd.com',
    orderUrl: 'https://shopbasebd.com/store/product/{sku}',
    defaultCta: 'অর্ডার করতে ইনবক্স করুন অথবা আমাদের নম্বরে কল করুন। সারা বাংলাদেশে ক্যাশ অন ডেলিভারি!',
    defaultProfit: 150,
    currency: 'BDT',
    language: 'Bangla',
  });

  const [pricing, setPricing] = useState<PricingRules>({
    strategy: 'fixed',
    fixedProfit: 150,
    percentageProfit: 15,
    minProfit: 100,
  });

  const [social, setSocial] = useState<SocialAccountConfig>({
    facebook: { connected: false, pageId: '', status: 'not_configured' },
    youtube: { connected: false, status: 'not_configured' },
    tiktok: { connected: false, status: 'not_configured' },
  });

  const [automation, setAutomation] = useState<AutomationSettings>({
    autoCollect: false,
    autoGenerate: false,
    autoPost: false,
    intervalHours: 4,
    testMode: true,
    categoryFilters: [],
    minQualityScore: 80,
  });

  const [fbToken, setFbToken] = useState('');
  const [fbPageId, setFbPageId] = useState('');
  const [ytToken, setYtToken] = useState('');
  const [ttToken, setTtToken] = useState('');

  const [testStatus, setTestStatus] = useState<{ [key: string]: any }>({});
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    loadAllSettings();
  }, []);

  const loadAllSettings = async () => {
    try {
      const [b, p, s, a] = await Promise.all([
        api.getBrandSettings(),
        api.getPricingRules(),
        api.getSocialConfig(),
        api.getAutomationSettings(),
      ]);
      setBrand(b);
      setPricing(p);
      setSocial(s);
      setAutomation(a);
      setFbPageId(s.facebook.pageId || '');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.saveBrandSettings(brand);
      showNotice('Brand settings updated!');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.savePricingRules(pricing);
      showNotice('Pricing rules updated!');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveSocial = async () => {
    try {
      const updatedSocial: Partial<SocialAccountConfig> = {
        facebook: {
          ...social.facebook,
          pageId: fbPageId,
          accessToken: fbToken || undefined,
        },
        youtube: {
          ...social.youtube,
          accessToken: ytToken || undefined,
        },
        tiktok: {
          ...social.tiktok,
          accessToken: ttToken || undefined,
        },
      };
      await api.saveSocialConfig(updatedSocial);
      showNotice('Social media configuration saved!');
      loadAllSettings();
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleTestSocial = async (platform: string) => {
    setTestStatus((prev) => ({ ...prev, [platform]: { loading: true } }));
    try {
      const res = await api.testSocialConnection(
        platform,
        platform === 'facebook' ? fbToken : platform === 'youtube' ? ytToken : ttToken,
        platform === 'facebook' ? fbPageId : undefined
      );
      setTestStatus((prev) => ({ ...prev, [platform]: res }));
      loadAllSettings();
    } catch (err: any) {
      setTestStatus((prev) => ({
        ...prev,
        [platform]: { success: false, message: err.message },
      }));
    }
  };

  const handleSaveAutomation = async (updated: Partial<AutomationSettings>) => {
    try {
      const saved = await api.saveAutomationSettings(updated);
      setAutomation(saved);
      showNotice('Automation settings saved!');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const showNotice = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(null), 3000);
  };

  // Sample profit calculation
  const sampleCost = 1000;
  let sampleProfit = pricing.strategy === 'fixed'
    ? pricing.fixedProfit
    : (sampleCost * pricing.percentageProfit) / 100;
  if (sampleProfit < pricing.minProfit) sampleProfit = pricing.minProfit;
  const sampleSelling = sampleCost + sampleProfit;

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" />
          <span>System Configuration & Rules</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Settings, Pricing Formulas & Social APIs
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl">
          Configure branding, automatic profit margins, official social media OAuth tokens, and
          automation scheduler controls with built-in Test Mode safety.
        </p>
      </div>

      {saveMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Safety & Automation Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Automation Engine & TEST MODE</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Control the independent switches of the automation pipeline.
            </p>
          </div>

          {/* TEST MODE SWITCH */}
          <div className="flex items-center space-x-3 p-2 px-3 rounded-xl bg-slate-950 border border-slate-800">
            {automation.testMode ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            )}
            <div>
              <div className="text-xs font-bold text-white flex items-center space-x-2">
                <span>TEST MODE (Simulate Safe Publishing)</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                    automation.testMode ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  {automation.testMode ? 'ACTIVE' : 'LIVE'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {automation.testMode
                  ? 'All pipeline steps run, but posts are simulated safely without live publishing.'
                  : 'Live posts will be broadcast directly to connected Facebook, YouTube, and TikTok accounts.'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={automation.testMode}
              onChange={(e) => handleSaveAutomation({ testMode: e.target.checked })}
              className="w-5 h-5 rounded text-indigo-600 bg-slate-900 border-slate-700 cursor-pointer"
            />
          </div>
        </div>

        {/* 3 Independent Pipeline Switches */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200">1. Auto-Collect</div>
              <div className="text-[11px] text-slate-400">Pull new ShopBase products</div>
            </div>
            <input
              type="checkbox"
              checked={automation.autoCollect}
              onChange={(e) => handleSaveAutomation({ autoCollect: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200">2. Auto-Generate</div>
              <div className="text-[11px] text-slate-400">Tavily + AI copy + 9:16 Video</div>
            </div>
            <input
              type="checkbox"
              checked={automation.autoGenerate}
              onChange={(e) => handleSaveAutomation({ autoGenerate: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200">3. Auto-Post</div>
              <div className="text-[11px] text-slate-400">Publish approved items from queue</div>
            </div>
            <input
              type="checkbox"
              checked={automation.autoPost}
              onChange={(e) => handleSaveAutomation({ autoPost: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600"
            />
          </div>
        </div>
      </div>

      {/* Grid: Pricing Rules & Brand Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pricing Rules */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-3">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Profit Margin Formula</span>
          </h3>

          <form onSubmit={handleSavePricing} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Pricing Strategy</label>
              <select
                value={pricing.strategy}
                onChange={(e) => setPricing({ ...pricing, strategy: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
              >
                <option value="fixed">Fixed Profit Markup (e.g. +150 BDT on every product)</option>
                <option value="percentage">Percentage Markup (e.g. +15% on wholesale cost)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Fixed Profit Amount (৳)</label>
                <input
                  type="number"
                  value={pricing.fixedProfit}
                  onChange={(e) => setPricing({ ...pricing, fixedProfit: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Percentage Profit (%)</label>
                <input
                  type="number"
                  value={pricing.percentageProfit}
                  onChange={(e) => setPricing({ ...pricing, percentageProfit: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Minimum Guaranteed Profit (৳)</label>
              <input
                type="number"
                value={pricing.minProfit}
                onChange={(e) => setPricing({ ...pricing, minProfit: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
              />
            </div>

            {/* Live Preview Calculator Box */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-[11px]">
              <div className="font-semibold text-slate-300">Live Calculation Example:</div>
              <div className="flex justify-between text-slate-400">
                <span>ShopBase Source Cost:</span>
                <span>{sampleCost} ৳</span>
              </div>
              <div className="flex justify-between text-indigo-400">
                <span>Calculated Profit Markup:</span>
                <span>+{sampleProfit} ৳</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold border-t border-slate-800 pt-1">
                <span>Final Selling Price:</span>
                <span>{sampleSelling} ৳</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition shadow-sm"
            >
              Save Pricing Rules
            </button>
          </form>
        </div>

        {/* Brand Information */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-3">
            <Building className="w-4 h-4 text-indigo-400" />
            <span>Brand Details & Copy Settings</span>
          </h3>

          <form onSubmit={handleSaveBrand} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Brand Name</label>
                <input
                  type="text"
                  value={brand.brandName}
                  onChange={(e) => setBrand({ ...brand, brandName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Contact Number</label>
                <input
                  type="text"
                  value={brand.contactNumber}
                  onChange={(e) => setBrand({ ...brand, contactNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Facebook Page</label>
                <input
                  type="text"
                  value={brand.facebookPage}
                  onChange={(e) => setBrand({ ...brand, facebookPage: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Website URL</label>
                <input
                  type="text"
                  value={brand.website}
                  onChange={(e) => setBrand({ ...brand, website: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Default Call-to-Action (Bangla)</label>
              <textarea
                rows={2}
                value={brand.defaultCta}
                onChange={(e) => setBrand({ ...brand, defaultCta: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Copy Language Style</label>
              <select
                value={brand.language}
                onChange={(e) => setBrand({ ...brand, language: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
              >
                <option value="Bangla">Natural Standard Bangla (বাংলা)</option>
                <option value="English">English</option>
                <option value="Banglish">Banglish (Bangla in Latin Script)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition shadow-sm"
            >
              Save Brand Info
            </button>
          </form>
        </div>
      </div>

      {/* Social Accounts OAuth & Credentials */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span>Official Social Media API Integration</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Connect official developer APIs. No fake browser automation. Test connection before publishing.
            </p>
          </div>

          <button
            onClick={handleSaveSocial}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow transition"
          >
            Save Credentials
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
          {/* Facebook */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 font-bold text-slate-200">
                  <Facebook className="w-4 h-4 text-blue-500" />
                  <span>Facebook Page</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-slate-800 text-slate-400">
                  {social.facebook.status}
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-slate-400 mb-1">Page ID</label>
                  <input
                    type="text"
                    value={fbPageId}
                    onChange={(e) => setFbPageId(e.target.value)}
                    placeholder="1029384756..."
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Page Access Token</label>
                  <input
                    type="password"
                    value={fbToken}
                    onChange={(e) => setFbToken(e.target.value)}
                    placeholder="EAA..."
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => handleTestSocial('facebook')}
              disabled={testStatus.facebook?.loading}
              className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg border border-slate-700 transition"
            >
              {testStatus.facebook?.loading ? 'Testing...' : 'Test Facebook API'}
            </button>
          </div>

          {/* YouTube */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 font-bold text-slate-200">
                  <Youtube className="w-4 h-4 text-red-500" />
                  <span>YouTube Data API</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-slate-800 text-slate-400">
                  {social.youtube.status}
                </span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">OAuth Access Token</label>
                <input
                  type="password"
                  value={ytToken}
                  onChange={(e) => setYtToken(e.target.value)}
                  placeholder="ya29.a0..."
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 font-mono"
                />
              </div>
            </div>

            <button
              onClick={() => handleTestSocial('youtube')}
              disabled={testStatus.youtube?.loading}
              className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg border border-slate-700 transition"
            >
              {testStatus.youtube?.loading ? 'Testing...' : 'Test YouTube API'}
            </button>
          </div>

          {/* TikTok */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 font-bold text-slate-200">
                  <Video className="w-4 h-4 text-cyan-400" />
                  <span>TikTok Creator API</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-slate-800 text-slate-400">
                  {social.tiktok.status}
                </span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Creator API Token</label>
                <input
                  type="password"
                  value={ttToken}
                  onChange={(e) => setTtToken(e.target.value)}
                  placeholder="act.••••"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 font-mono"
                />
              </div>
            </div>

            <button
              onClick={() => handleTestSocial('tiktok')}
              disabled={testStatus.tiktok?.loading}
              className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg border border-slate-700 transition"
            >
              {testStatus.tiktok?.loading ? 'Testing...' : 'Test TikTok API'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
