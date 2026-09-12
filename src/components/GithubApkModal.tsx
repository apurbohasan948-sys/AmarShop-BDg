import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Github,
  Download,
  Copy,
  Check,
  Play,
  Terminal,
  FileCode,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Layers,
  HelpCircle,
  X,
  RefreshCw,
  QrCode,
  Cpu,
  Package,
} from 'lucide-react';
import { api } from '../api';
import { ApkInfo } from '../types';

interface GithubApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GithubApkModal: React.FC<GithubApkModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'workflow' | 'config' | 'pwa' | 'manual'>('workflow');
  const [apkInfo, setApkInfo] = useState<ApkInfo | null>(null);
  const [appName, setAppName] = useState('ShopBase AI');
  const [appId, setAppId] = useState('com.shopbase.ai.automation');
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [copiedTerminal, setCopiedTerminal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadApkInfo();
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const loadApkInfo = async () => {
    try {
      const data = await api.getApkInfo();
      setApkInfo(data);
      if (data.appName) setAppName(data.appName);
      if (data.appId) setAppId(data.appId);
    } catch (err) {
      console.error('Failed to load APK info:', err);
    }
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      await api.updateApkConfig({ appName, appId });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      await loadApkInfo();
    } catch (err: any) {
      alert(`Failed to save config: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = (text: string, type: 'workflow' | 'config' | 'terminal') => {
    navigator.clipboard.writeText(text);
    if (type === 'workflow') {
      setCopiedWorkflow(true);
      setTimeout(() => setCopiedWorkflow(false), 2000);
    } else if (type === 'config') {
      setCopiedConfig(true);
      setTimeout(() => setCopiedConfig(false), 2000);
    } else {
      setCopiedTerminal(true);
      setTimeout(() => setCopiedTerminal(false), 2000);
    }
  };

  const handlePwaInstall = async () => {
    if (!deferredPrompt) {
      alert('To install on your phone:\n1. Open this app in Chrome on your Android phone.\n2. Tap the 3-dots menu in Chrome.\n3. Tap "Install App" or "Add to Home Screen".');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallSuccess(true);
      setDeferredPrompt(null);
    }
  };

  const downloadScript = () => {
    const scriptContent = `#!/bin/bash
# Local APK build script using Capacitor and Gradle
set -e

echo "🚀 Building ShopBase AI Android APK..."
npm run build
if [ ! -d "android" ]; then
    npx cap add android
fi
npx cap sync android
cd android
chmod +x gradlew
./gradlew assembleDebug
echo "✅ SUCCESS! Debug APK created at: android/app/build/outputs/apk/debug/app-debug.apk"
`;
    const blob = new Blob([scriptContent], { type: 'application/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'build-apk.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">GitHub APK Maker & Android App</h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Github className="w-3 h-3" /> CI/CD Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                গিটহাব অ্যাকশনস (GitHub Actions) এর মাধ্যমে স্বয়ংক্রিয়ভাবে Android APK বিল্ড ও ডাউনলোড করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 gap-2">
          <button
            onClick={() => setActiveTab('workflow')}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition ${
              activeTab === 'workflow'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Github className="w-4 h-4" />
            GitHub Actions APK বিল্ডার
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition ${
              activeTab === 'config'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            Capacitor & APK কনফিগ
          </button>
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition ${
              activeTab === 'pwa'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            মোবাইলে সরাসরি ইন্সটল (PWA)
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition ${
              activeTab === 'manual'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            লোকাল / টার্মিনাল বিল্ড
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900/50">
          {/* TAB 1: GITHUB ACTIONS WORKFLOW */}
          {activeTab === 'workflow' && (
            <div className="space-y-6">
              {/* Process Flow banner */}
              <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  GitHub Actions অটোমেটিক APK মেকার কীভাবে কাজ করে:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-center text-xs">
                  <div className="bg-slate-800/80 border border-slate-700/60 p-3 rounded-lg">
                    <span className="font-bold text-slate-200 block">১. GitHub Push</span>
                    <span className="text-slate-400 text-[11px]">কোড পুশ বা 1-Click Run</span>
                  </div>
                  <div className="flex items-center justify-center text-emerald-400 font-bold">➔</div>
                  <div className="bg-slate-800/80 border border-slate-700/60 p-3 rounded-lg">
                    <span className="font-bold text-slate-200 block">২. Vite + Capacitor</span>
                    <span className="text-slate-400 text-[11px]">ওয়েব বিল্ড এবং সিঙ্ক</span>
                  </div>
                  <div className="flex items-center justify-center text-emerald-400 font-bold">➔</div>
                  <div className="bg-emerald-900/40 border border-emerald-500/40 p-3 rounded-lg text-emerald-300">
                    <span className="font-bold text-white block">৩. Gradle Assemble</span>
                    <span className="text-emerald-400 text-[11px]">.apk ফাইল রেডি!</span>
                  </div>
                </div>
              </div>

              {/* Step-by-step instructions in Bengali & English */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-black text-xs font-bold flex items-center justify-center">
                      বাং
                    </span>
                    সহজ ৫ ধাপের বাংলা নির্দেশিকা:
                  </h4>
                  <ol className="space-y-2.5 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
                    <li className="pl-1">
                      <strong className="text-white">GitHub এ এক্সপোর্ট করুন:</strong> AI Studio-র উপরের মেনু থেকে <em>Export to GitHub</em> এ ক্লিক করে আপনার একাউন্টে রিপোজিটরি তৈরি করুন।
                    </li>
                    <li className="pl-1">
                      <strong className="text-white">Actions ট্যাবে যান:</strong> আপনার GitHub রিপোজিটরিতে ঢুকে উপরের মেনু থেকে <em>Actions</em> ট্যাব ওপেন করুন।
                    </li>
                    <li className="pl-1">
                      <strong className="text-white">ওয়ার্কফ্লো নির্বাচন করুন:</strong> বামদিকের তালিকা থেকে <em>Build Android APK (GitHub APK Maker)</em> সিলেক্ট করুন।
                    </li>
                    <li className="pl-1">
                      <strong className="text-white">Run Workflow ক্লিক করুন:</strong> ডানপাশে থাকা <em>Run workflow</em> বাটনে ক্লিক করুন (Build Type: debug)।
                    </li>
                    <li className="pl-1">
                      <strong className="text-emerald-400">APK ডাউনলোড করুন:</strong> ৩ মিনিটের মধ্যে বিল্ড শেষ হলে নিচে <em>Artifacts</em> থেকে <strong>ShopBase-AI-Android-APK</strong> জিপটি ডাউনলোড করে আপনার অ্যান্ড্রয়েড ফোনে ইন্সটল করুন!
                    </li>
                  </ol>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
                      EN
                    </span>
                    English Quick Steps:
                  </h4>
                  <ol className="space-y-2.5 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
                    <li className="pl-1">
                      <strong className="text-white">Export to GitHub:</strong> In AI Studio, open Settings menu and choose <em>Export to GitHub</em> to push this repository.
                    </li>
                    <li className="pl-1">
                      <strong className="text-white">Open Actions Tab:</strong> In your GitHub repo, click the <em>Actions</em> tab in the top navigation.
                    </li>
                    <li className="pl-1">
                      <strong className="text-white">Choose Workflow:</strong> Click on <em>Build Android APK (GitHub APK Maker)</em> on the left.
                    </li>
                    <li className="pl-1">
                      <strong className="text-white">Trigger Workflow:</strong> Click <em>Run workflow</em> and press the green button.
                    </li>
                    <li className="pl-1">
                      <strong className="text-blue-400">Download APK:</strong> When finished, download <strong>ShopBase-AI-Android-APK</strong> under the Artifacts section and install on your phone!
                    </li>
                  </ol>
                </div>
              </div>

              {/* Workflow File Preview & Copy */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    .github/workflows/build-apk.yml
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-emerald-400">
                      Already in repo!
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(apkInfo?.workflowYaml || '', 'workflow')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
                  >
                    {copiedWorkflow ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Workflow YAML
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-slate-900 p-3 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto max-h-56 leading-relaxed border border-slate-800/80">
                  {apkInfo?.workflowYaml || 'Loading workflow...'}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: CAPACITOR & APK CONFIGURATION */}
          {activeTab === 'config' && (
            <div className="space-y-6">
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-400" />
                  Android APK বিল্ড সেটিংস (Capacitor Config)
                </h3>
                <p className="text-xs text-slate-400">
                  আপনার অ্যান্ড্রয়েড অ্যাপের নাম এবং প্যাকেজ আইডি (Package ID) পরিবর্তন করতে পারেন। এটি <code className="text-emerald-400">capacitor.config.json</code> এ সংরক্ষিত থাকবে।
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      অ্যাপের নাম (App Name)
                    </label>
                    <input
                      type="text"
                      value={appName}
                      onChange={e => setAppName(e.target.value)}
                      placeholder="ShopBase AI"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      ফোনের হোমস্ক্রিন ও অ্যাপ লিস্টে যা দেখাবে
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      অ্যান্ড্রয়েড প্যাকেজ আইডি (Application ID)
                    </label>
                    <input
                      type="text"
                      value={appId}
                      onChange={e => setAppId(e.target.value)}
                      placeholder="com.shopbase.ai.automation"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      ইউনিক প্যাকেজ নাম (যেমন: com.mycompany.shopbase)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-700/60">
                  <div className="flex items-center gap-2">
                    {saveSuccess && (
                      <span className="text-xs text-emerald-400 flex items-center gap-1">
                        <Check className="w-4 h-4" /> সেটিংস সফলভাবে আপডেট হয়েছে!
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleSaveConfig}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50"
                  >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    কনফিগারেশন সেভ করুন
                  </button>
                </div>
              </div>

              {/* capacitor.config.json Preview */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">capacitor.config.json</span>
                  <button
                    onClick={() =>
                      handleCopy(
                        JSON.stringify(
                          {
                            appId,
                            appName,
                            webDir: 'dist',
                            bundledWebRuntime: false,
                            server: { androidScheme: 'https', cleartext: true },
                          },
                          null,
                          2
                        ),
                        'config'
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                  >
                    {copiedConfig ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy JSON
                  </button>
                </div>
                <pre className="bg-slate-900 p-3 rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800">
                  {JSON.stringify(
                    {
                      appId,
                      appName,
                      webDir: 'dist',
                      bundledWebRuntime: false,
                      server: {
                        androidScheme: 'https',
                        cleartext: true,
                      },
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: PWA & MOBILE INSTANT INSTALL */}
          {activeTab === 'pwa' && (
            <div className="space-y-6">
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                  <Smartphone className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    আপনার মোবাইলে সরাসরি ইন্সটল করুন (PWA Web APK)
                  </h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
                    কোনো কোডিং বা অপেক্ষা ছাড়াই এই অ্যাপটি আপনার যেকোনো অ্যান্ড্রয়েড ফোনে বা কম্পিউটারে হোমস্ক্রিন অ্যাপ হিসেবে যুক্ত করতে পারবেন।
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handlePwaInstall}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5"
                  >
                    <Download className="w-5 h-5" />
                    {installSuccess ? 'অ্যাপ ইন্সটল হয়েছে!' : 'মোবাইলে অ্যাপ ইন্সটল করুন'}
                  </button>
                </div>
              </div>

              {/* Instructions for Android Chrome */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    অ্যান্ড্রয়েড ক্রোমে ম্যানুয়াল ইন্সটল নিয়ম:
                  </h4>
                  <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                    <li>অ্যান্ড্রয়েড ফোনের Chrome ব্রাউজারে এই লিংকটি ওপেন করুন</li>
                    <li>উপরের ডানদিকের থ্রি-ডট (⋮) মেনুতে চাপ দিন</li>
                    <li><strong>"Install App"</strong> অথবা <strong>"Add to Home Screen"</strong> চাপুন</li>
                    <li>অ্যাপ আইকন সরাসরি হোমস্ক্রিনে যোগ হয়ে যাবে</li>
                  </ul>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    PWA ও নেটিভ APK-র সুবিধা:
                  </h4>
                  <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                    <li>সম্পূর্ণ স্ক্রিন জুড়ে নেটিভ অ্যাপের মতো চলে (Standalone UI)</li>
                    <li>অটোমেটিক আপডেট এবং ব্যাকগ্রাউন্ড নোটিফিকেশন সাপোর্ট</li>
                    <li>ল্যাপটপ বা ডেস্কটপেও ক্রোম/এজ দিয়ে অ্যাপ হিসেবে চালানো যায়</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MANUAL / TERMINAL LOCAL BUILD */}
          {activeTab === 'manual' && (
            <div className="space-y-6">
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  লোকাল মেশিনে বা GitHub Codespaces এ APK তৈরি
                </h3>
                <p className="text-xs text-slate-400">
                  আপনার কম্পিউটারে Android Studio / Java 17 ইনস্টল থাকলে নিচের কমান্ডগুলো রান করে সরাসরি <code className="text-emerald-400">.apk</code> ফাইল তৈরি করতে পারেন:
                </p>

                <div className="relative">
                  <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto border border-slate-800 leading-relaxed">
{`# 1. ওয়েব অ্যাসেট কম্পাইল করুন
npm run build

# 2. Capacitor Android প্রজেক্ট সিঙ্ক করুন
npx cap sync android

# 3. Gradle দিয়ে Debug APK বিল্ড করুন
cd android
./gradlew assembleDebug

# ✅ প্রস্তুত APK ফাইলের লোকেশন:
# android/app/build/outputs/apk/debug/app-debug.apk`}
                  </pre>
                  <button
                    onClick={() =>
                      handleCopy(
                        `npm run build\nnpx cap sync android\ncd android\n./gradlew assembleDebug`,
                        'terminal'
                      )
                    }
                    className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
                  >
                    {copiedTerminal ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Commands
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    বা এক ক্লিকে স্ক্রিপ্ট ফাইল ডাউনলোড করে রান করুন:
                  </span>
                  <button
                    onClick={downloadScript}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    Download build-apk.sh
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            GitHub Actions APK বিল্ড ওয়ার্কফ্লো প্রস্তুত রয়েছে (<code className="text-slate-300">.github/workflows/build-apk.yml</code>)
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
