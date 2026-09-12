import { X, Smartphone, Github, CheckCircle2, Download, Terminal } from 'lucide-react';

interface GithubApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GithubApkModal({ isOpen, onClose }: GithubApkModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold">AmarShop BD Android Mobile App</h3>
            <p className="text-xs text-slate-400">Capacitor Native Shell & GitHub Actions APK Build</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Native Capacitor Android Bridge Ready</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              AmarShop BD is equipped with an Android Capacitor wrapper (<code className="text-slate-200">com.shopbase.ai.automation</code>) allowing store managers to oversee crawling and publishing directly from mobile devices.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center space-x-2 text-slate-200 font-semibold">
              <Github className="w-4 h-4 text-slate-400" />
              <span>Automated GitHub Actions Workflow</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Whenever you push changes to your GitHub repository, the <code className="text-emerald-400">.github/workflows/build-apk.yml</code> pipeline automatically compiles the release APK using Gradle and Java 17.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center space-x-2 text-slate-200 font-semibold">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span>Local Android Build Command:</span>
            </div>
            <div className="p-2 rounded bg-slate-950 font-mono text-[11px] text-emerald-400 overflow-x-auto">
              npm run build && npx cap sync android && cd android && ./gradlew assembleDebug
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
