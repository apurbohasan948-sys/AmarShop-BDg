import { useState, useEffect } from 'react';
import { Bot, CheckCircle2, AlertTriangle, Sparkles, RefreshCw, Cpu, ShieldCheck } from 'lucide-react';
import { AIModelConfig } from '../types.ts';
import { api } from '../api.ts';

export function AIModelsTab() {
  const [models, setModels] = useState<AIModelConfig[]>([]);
  const [testingModelId, setTestingModelId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null);

  const fetchModels = async () => {
    try {
      const res = await api.getModels();
      if (res.success) {
        setModels(res.data);
      }
    } catch (err) {
      console.error('Failed to load AI models:', err);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleTest = async (model: AIModelConfig) => {
    setTestingModelId(model.id);
    setTestResult(null);

    try {
      const res = await api.testModel(model.provider, model.modelId);
      setTestResult({
        id: model.id,
        success: res.data.success,
        message: res.data.message,
      });
    } catch (err: any) {
      setTestResult({
        id: model.id,
        success: false,
        message: err.message || 'Handshake failed',
      });
    } finally {
      setTestingModelId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">AI Model Engines & Multimodal Providers</h2>
            <p className="text-xs text-slate-400">
              Manage LLM backends for Bengali eCommerce copywriting, product descriptions, and video reel generation.
            </p>
          </div>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {models.map((m) => (
          <div
            key={m.id}
            className={`bg-slate-900 border rounded-xl p-5 text-white flex flex-col justify-between shadow-sm transition ${
              m.isDefault ? 'border-emerald-500/50 shadow-emerald-950/20' : 'border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{m.provider}</span>
                {m.isDefault ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Active Engine
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">
                    Secondary
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold mt-2 text-white">{m.name}</h3>
              <p className="text-xs font-mono text-slate-400 mt-0.5">{m.modelId}</p>

              <div className="mt-4 p-3 rounded-lg bg-slate-800/60 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Bangla Fluency:</span>
                  <span className="font-semibold text-emerald-400">
                    {m.provider === 'gemini' ? 'Native Superb' : 'Supported'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Multimodal (Image/Video):</span>
                  <span className="font-semibold text-slate-200">Yes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Environment Key:</span>
                  <span className="font-semibold text-emerald-400">
                    {m.provider === 'gemini' ? 'Active' : 'Optional'}
                  </span>
                </div>
              </div>

              {testResult && testResult.id === m.id && (
                <div
                  className={`mt-3 p-2.5 rounded-lg text-xs flex items-start space-x-1.5 ${
                    testResult.success
                      ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/80 border border-rose-800 text-rose-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="line-clamp-2">{testResult.message}</span>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleTest(m)}
                disabled={testingModelId === m.id}
                className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition border border-slate-700 disabled:opacity-50"
              >
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>{testingModelId === m.id ? 'Testing Handshake...' : 'Test Connection'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Engineering Info Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white">
        <h3 className="text-sm font-bold flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Server-Side Gemini Architecture</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Gemini 2.5 Flash is invoked strictly on the Express backend via the official <code className="text-emerald-300">@google/genai</code> SDK. Your API key never leaks to browser clients. All generated copy complies with Bangladeshi online shopping terminology (Cash on Delivery, হোম ডেলিভারি, জেনুইন কোয়ালিটি).
        </p>
      </div>
    </div>
  );
}
