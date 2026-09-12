import React, { useState } from 'react';
import {
  Cpu,
  Plus,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Settings2,
  Trash2,
  Edit3,
  Star,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Zap,
  Globe,
  Key,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { AIModelConfig, TaskModelAssignments, AIHealthStatus } from '../types';
import { api } from '../api';

interface AIModelsTabProps {
  models: Array<AIModelConfig & { hasKey: boolean }>;
  taskAssignments: TaskModelAssignments;
  onRefresh: () => void;
}

interface ProviderPreset {
  providerName: string;
  baseUrl: string;
  defaultModel: string;
  description: string;
}

const POPULAR_PRESETS: ProviderPreset[] = [
  {
    providerName: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    defaultModel: 'deepseek-chat',
    description: 'High performance & ultra low cost',
  },
  {
    providerName: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    description: 'Ultra fast inference (500+ tokens/s)',
  },
  {
    providerName: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    description: 'Industry standard OpenAI models',
  },
  {
    providerName: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'openrouter/auto',
    description: 'Multi-provider unified gateway',
  },
  {
    providerName: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-2.5-flash',
    description: 'Gemini multimodal API',
  },
];

export const AIModelsTab: React.FC<AIModelsTabProps> = ({
  models,
  taskAssignments,
  onRefresh,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [testingModelId, setTestingModelId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{ [modelId: string]: any }>({});

  // 4 Simple Fields State
  const [providerName, setProviderName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [isSavingAndTesting, setIsSavingAndTesting] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<{
    type: 'success' | 'error';
    status?: AIHealthStatus;
    message: string;
    latency?: number;
    sampleResponse?: string;
  } | null>(null);

  // Task-specific assignment state & failover
  const [assignments, setAssignments] = useState<TaskModelAssignments>(taskAssignments);
  const [isSavingAssignments, setIsSavingAssignments] = useState(false);
  const [assignmentMessage, setAssignmentMessage] = useState<string | null>(null);

  // Sync prop changes
  React.useEffect(() => {
    setAssignments(taskAssignments);
  }, [taskAssignments]);

  const resetForm = () => {
    setEditingId(null);
    setProviderName('');
    setApiKey('');
    setModelName('');
    setBaseUrl('');
    setModalFeedback(null);
    setIsSavingAndTesting(false);
  };

  const openAddModal = (preset?: ProviderPreset) => {
    resetForm();
    if (preset) {
      setProviderName(preset.providerName);
      setBaseUrl(preset.baseUrl);
      setModelName(preset.defaultModel);
    }
    setShowAddModal(true);
  };

  const openEditModal = (model: AIModelConfig) => {
    setEditingId(model.id);
    setProviderName(model.providerName || model.name);
    setModelName(model.modelName);
    setBaseUrl(model.baseUrl || 'https://api.openai.com/v1');
    setApiKey(model.apiKey ? '••••••••' : '');
    setModalFeedback(null);
    setIsSavingAndTesting(false);
    setShowAddModal(true);
  };

  // The simplified [SAVE & TEST] action
  const handleSaveAndTest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!providerName.trim()) {
      setModalFeedback({ type: 'error', message: 'Please enter a Provider Name.' });
      return;
    }
    if (!modelName.trim()) {
      setModalFeedback({ type: 'error', message: 'Please enter a Model Name.' });
      return;
    }
    if (!baseUrl.trim()) {
      setModalFeedback({ type: 'error', message: 'Please enter a Base URL.' });
      return;
    }

    setIsSavingAndTesting(true);
    setModalFeedback(null);

    const payload: Partial<AIModelConfig> = {
      id: editingId || undefined,
      providerName: providerName.trim(),
      name: providerName.trim(),
      modelName: modelName.trim(),
      baseUrl: baseUrl.trim(),
      apiKey: apiKey.trim(),
      enabled: true,
      isEnabled: true,
    };

    try {
      const response = await api.saveAndTestAiModel(payload);
      const testResult = response.testResult;

      if (testResult.success) {
        setModalFeedback({
          type: 'success',
          status: 'Working',
          latency: testResult.latency,
          message: testResult.message || `Connected successfully! Response time: ${testResult.latency}ms`,
          sampleResponse: testResult.sampleResponse,
        });
        // Refresh parent list
        onRefresh();
        // Auto-close modal after brief delay if successful
        setTimeout(() => {
          setShowAddModal(false);
          resetForm();
        }, 1400);
      } else {
        setModalFeedback({
          type: 'error',
          status: testResult.status || 'Failed',
          latency: testResult.latency,
          message: testResult.message || 'Connection test failed. Please verify API key and Base URL.',
        });
        onRefresh();
      }
    } catch (err: any) {
      setModalFeedback({
        type: 'error',
        status: 'Failed',
        message: err.message || 'Failed to save or test model.',
      });
    } finally {
      setIsSavingAndTesting(false);
    }
  };

  // Test an existing model from its card
  const handleTestExistingModel = async (model: AIModelConfig) => {
    setTestingModelId(model.id);
    setTestResults((prev) => ({ ...prev, [model.id]: { loading: true } }));

    try {
      const result = await api.testAiModel(model);
      setTestResults((prev) => ({ ...prev, [model.id]: result }));
      onRefresh();
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [model.id]: {
          success: false,
          status: 'Failed',
          message: err.message || 'Test failed',
        },
      }));
    } finally {
      setTestingModelId(null);
    }
  };

  // Toggle Enable / Disable
  const handleToggleEnable = async (model: AIModelConfig) => {
    const nextState = !(model.enabled ?? model.isEnabled);
    try {
      await api.saveAiModel({
        ...model,
        enabled: nextState,
        isEnabled: nextState,
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Set as Default Model
  const handleSetDefault = async (model: AIModelConfig) => {
    try {
      for (const m of models) {
        if (m.id === model.id) {
          await api.saveAiModel({ ...m, isDefault: true });
        } else if (m.isDefault) {
          await api.saveAiModel({ ...m, isDefault: false });
        }
      }
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Model
  const handleDeleteModel = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.deleteAiModel(id);
      onRefresh();
    } catch (err: any) {
      alert(`Error deleting model: ${err.message}`);
    }
  };

  // Save Task Assignments
  const handleSaveAssignments = async () => {
    setIsSavingAssignments(true);
    setAssignmentMessage(null);
    try {
      await api.saveTaskAssignments(assignments);
      setAssignmentMessage('Task routing & failover settings saved successfully.');
      setTimeout(() => setAssignmentMessage(null), 3500);
      onRefresh();
    } catch (err: any) {
      alert(`Failed to save: ${err.message}`);
    } finally {
      setIsSavingAssignments(false);
    }
  };

  const tasksList = [
    { key: 'productAnalysis', label: 'Product Analysis & Banglish Selling Points' },
    { key: 'facebookCaption', label: 'Facebook Post, Hook & Pricing Copy' },
    { key: 'youtubeContent', label: 'YouTube Long-form Script, SEO & Shorts' },
    { key: 'tiktokContent', label: 'TikTok 15s High-Retention Video Hooks' },
    { key: 'videoScript', label: '9:16 Video Director Script Generator' },
    { key: 'imagePrompt', label: 'High-Converting Ad Image Prompts' },
    { key: 'generalMarketing', label: 'Bangla E-Commerce Translations' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Top Banner: Simplified AI Manager */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            <span>OpenAI-Compatible Cloud AI Manager</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Cloud AI Providers & Models
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Connect any external cloud AI provider with just 4 simple fields: Provider Name, API Key, Model Name, and Base URL.
            The system automatically normalizes OpenAI-compatible endpoints with intelligent multi-level failover.
          </p>
        </div>

        <button
          id="btn-add-cloud-ai"
          onClick={() => openAddModal()}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center space-x-1.5 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Cloud AI Model</span>
        </button>
      </div>

      {/* Quick Provider Presets Bar */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Quick Connect Presets:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {POPULAR_PRESETS.map((preset) => (
            <button
              key={preset.providerName}
              onClick={() => openAddModal(preset)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white text-xs transition flex items-center space-x-2 group cursor-pointer"
            >
              <span className="font-semibold text-white">{preset.providerName}</span>
              <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-400">({preset.defaultModel})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Simple Card-Based AI Model List */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Configured Models ({models.length})</span>
          </h3>
          <span className="text-xs text-slate-400">
            Click &quot;Save &amp; Test&quot; or &quot;Test&quot; to verify latency &amp; status
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((model) => {
            const isModelEnabled = model.enabled ?? model.isEnabled ?? true;
            const testResult = testResults[model.id];
            const isTesting = testingModelId === model.id;
            const healthStatus: AIHealthStatus =
              model.lastTestStatus ||
              (model.status === 'online' ? 'Working' : model.status === 'error' ? 'Failed' : 'Not Tested');

            return (
              <div
                key={model.id}
                id={`model-card-${model.id}`}
                className={`bg-slate-900 border rounded-2xl p-4 shadow-sm flex flex-col justify-between transition ${
                  isModelEnabled
                    ? model.isDefault
                      ? 'border-indigo-500/80 bg-slate-900/90 ring-1 ring-indigo-500/30'
                      : 'border-slate-800 hover:border-slate-700'
                    : 'border-slate-800/40 opacity-60 bg-slate-950/40'
                }`}
              >
                <div>
                  {/* Card Header: Provider Name + Default Badge + Status Pill */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h4 className="text-sm font-bold text-slate-100">
                          {model.providerName || model.name}
                        </h4>
                        {model.isDefault && (
                          <span className="text-[9px] bg-indigo-500 text-white font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-indigo-300 mt-0.5 font-medium">
                        {model.modelName}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center space-x-1 ${
                        healthStatus === 'Working'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : healthStatus === 'Authentication Failed'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : healthStatus === 'Failed'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          healthStatus === 'Working'
                            ? 'bg-emerald-400'
                            : healthStatus === 'Authentication Failed'
                            ? 'bg-amber-400'
                            : healthStatus === 'Failed'
                            ? 'bg-rose-400'
                            : 'bg-slate-400'
                        }`}
                      />
                      <span>{healthStatus}</span>
                    </span>
                  </div>

                  {/* Clean Spec Panel */}
                  <div className="space-y-1.5 text-[11px] text-slate-400 mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center space-x-1 text-slate-400">
                        <Globe className="w-3 h-3 text-slate-400" />
                        <span>Base URL:</span>
                      </span>
                      <span className="font-mono text-slate-300 truncate max-w-[170px]" title={model.baseUrl}>
                        {model.baseUrl || 'https://api.openai.com/v1'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="flex items-center space-x-1 text-slate-400">
                        <Key className="w-3 h-3 text-slate-400" />
                        <span>API Key:</span>
                      </span>
                      <span className="font-mono text-slate-300">
                        {model.hasKey ? (
                          <span className="text-emerald-400 font-medium">•••••••• (Secured)</span>
                        ) : (
                          <span className="text-rose-400 font-medium">Missing Key</span>
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="flex items-center space-x-1 text-slate-400">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Latency:</span>
                      </span>
                      <span className="font-mono font-medium text-cyan-400">
                        {model.latency || model.latencyMs ? `${model.latency || model.latencyMs}ms` : '—'}
                      </span>
                    </div>

                    {model.errorMessage && (
                      <div className="mt-1 pt-1 border-t border-slate-800 text-[10px] text-rose-400 leading-tight">
                        {model.errorMessage}
                      </div>
                    )}
                  </div>

                  {/* Inline Test Result Banner if active */}
                  {testResult && (
                    <div
                      className={`mt-2.5 p-2 rounded-xl text-[11px] ${
                        testResult.loading
                          ? 'bg-slate-800 text-slate-300 animate-pulse'
                          : testResult.success
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                      }`}
                    >
                      {testResult.loading ? (
                        <div className="flex items-center space-x-1.5">
                          <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
                          <span>Pinging endpoint with diagnostic prompt...</span>
                        </div>
                      ) : testResult.success ? (
                        <div>
                          <div className="font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>✓ Working ({testResult.latency || testResult.latencyMs}ms)</span>
                          </div>
                          {testResult.sampleResponse && (
                            <div className="text-[10px] font-mono text-slate-400 italic mt-0.5 truncate">
                              &quot;{testResult.sampleResponse}&quot;
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-start space-x-1.5">
                          <AlertCircle className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                          <span>{testResult.message}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action Controls */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <button
                    id={`btn-test-${model.id}`}
                    onClick={() => handleTestExistingModel(model)}
                    disabled={isTesting}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl border border-slate-700 transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Play className={`w-3 h-3 text-emerald-400 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Testing...' : 'Test'}</span>
                  </button>

                  <div className="flex items-center space-x-1.5">
                    {/* Default Toggle Button */}
                    <button
                      id={`btn-default-${model.id}`}
                      onClick={() => handleSetDefault(model)}
                      title={model.isDefault ? 'Primary Default Model' : 'Set as Primary Default Model'}
                      className={`p-1.5 rounded-xl border transition cursor-pointer ${
                        model.isDefault
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>

                    {/* Enable/Disable Toggle */}
                    <button
                      id={`btn-toggle-${model.id}`}
                      onClick={() => handleToggleEnable(model)}
                      title={isModelEnabled ? 'Disable Model' : 'Enable Model'}
                      className={`p-1.5 rounded-xl border transition cursor-pointer ${
                        isModelEnabled
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}
                    >
                      {isModelEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>

                    {/* Edit Button */}
                    <button
                      id={`btn-edit-${model.id}`}
                      onClick={() => openEditModal(model)}
                      title="Edit Provider Settings"
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      id={`btn-delete-${model.id}`}
                      onClick={() => handleDeleteModel(model.id, model.providerName || model.name)}
                      title="Delete Model"
                      className="p-1.5 bg-slate-800 hover:bg-rose-900/30 text-slate-400 hover:text-rose-400 rounded-xl border border-slate-700 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Routing & Failover Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Settings2 className="w-4 h-4 text-indigo-400" />
              <span>Task-Specific Model Routing & Multi-Level Failover</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Assign dedicated models to specific content pipelines or use automatic multi-level failover.
            </p>
          </div>

          <button
            id="btn-save-assignments"
            onClick={handleSaveAssignments}
            disabled={isSavingAssignments}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer self-start sm:self-auto"
          >
            {isSavingAssignments ? 'Saving...' : 'Save Task Assignments'}
          </button>
        </div>

        {assignmentMessage && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{assignmentMessage}</span>
          </div>
        )}

        {/* Task Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {tasksList.map((task) => (
            <div
              key={task.key}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
            >
              <span className="font-medium text-slate-300">{task.label}</span>
              <select
                id={`task-select-${task.key}`}
                value={assignments[task.key as keyof TaskModelAssignments] as string}
                onChange={(e) =>
                  setAssignments({ ...assignments, [task.key]: e.target.value })
                }
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-medium"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.providerName || m.name} ({m.modelName})
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Failover Chain Configuration */}
        <div className="mt-5 pt-4 border-t border-slate-800 space-y-3 text-xs">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="enableFallback"
              checked={assignments.enableFallback ?? true}
              onChange={(e) => setAssignments({ ...assignments, enableFallback: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="enableFallback" className="text-slate-200 font-medium cursor-pointer">
              Enable Multi-Level Automatic Failover (If primary model encounters 429 quota or network error, fallback automatically)
            </label>
          </div>

          {assignments.enableFallback && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400 font-medium">Fallback 1 (Secondary):</span>
                <select
                  id="select-fallback-1"
                  value={assignments.fallbackModelId || ''}
                  onChange={(e) => setAssignments({ ...assignments, fallbackModelId: e.target.value })}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none"
                >
                  <option value="">None</option>
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.providerName || m.name} ({m.modelName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400 font-medium">Fallback 2 (Tertiary):</span>
                <select
                  id="select-fallback-2"
                  value={assignments.fallbackModel2Id || ''}
                  onChange={(e) => setAssignments({ ...assignments, fallbackModel2Id: e.target.value })}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none"
                >
                  <option value="">None</option>
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.providerName || m.name} ({m.modelName})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          SIMPLIFIED CLOUD AI ADD / EDIT MODAL (ONLY 4 REQUIRED FIELDS)
          ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            id="modal-cloud-ai"
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  <span>{editingId ? 'Edit Cloud AI Provider' : 'Add Cloud AI Provider'}</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Enter only 4 simple fields. Standard endpoint &amp; chat completion format are auto-determined.
                </p>
              </div>
              <button
                id="btn-close-modal"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* The 4 Fields Form */}
            <form onSubmit={handleSaveAndTest} className="space-y-3.5 text-xs">
              {/* Field 1: Provider Name */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  1. Provider Name <span className="text-rose-400">*</span>
                </label>
                <input
                  id="input-provider-name"
                  type="text"
                  required
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  placeholder="e.g. DeepSeek, Groq, OpenAI"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Field 2: API Key */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span>
                    2. API Key <span className="text-rose-400">*</span>
                  </span>
                  {editingId && apiKey.includes('••••') && (
                    <span className="text-[10px] text-slate-500 font-normal">
                      Leave masked to keep existing key
                    </span>
                  )}
                </label>
                <input
                  id="input-api-key"
                  type="password"
                  required={!editingId}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Field 3: Model Name */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  3. Model Name <span className="text-rose-400">*</span>
                </label>
                <input
                  id="input-model-name"
                  type="text"
                  required
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="e.g. deepseek-chat, gpt-4o-mini, llama-3.3-70b-versatile"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Field 4: Base URL */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span>
                    4. Base URL <span className="text-rose-400">*</span>
                  </span>
                  <span className="text-[10px] text-indigo-400 font-normal">
                    Auto-normalizes endpoints
                  </span>
                </label>
                <input
                  id="input-base-url"
                  type="text"
                  required
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="e.g. https://api.deepseek.com or https://api.openai.com/v1"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Real-time Feedback Banner */}
              {modalFeedback && (
                <div
                  id="modal-feedback-banner"
                  className={`p-3 rounded-xl text-xs flex items-start space-x-2.5 ${
                    modalFeedback.type === 'success'
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  {modalFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold flex items-center space-x-1.5">
                      <span>{modalFeedback.status || (modalFeedback.type === 'success' ? 'Working' : 'Failed')}</span>
                      {modalFeedback.latency && (
                        <span className="text-[10px] font-mono text-cyan-300 font-normal">
                          • {modalFeedback.latency}ms
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">{modalFeedback.message}</p>
                    {modalFeedback.sampleResponse && (
                      <p className="mt-1 text-[10px] font-mono text-slate-300 italic truncate max-w-sm">
                        &quot;{modalFeedback.sampleResponse}&quot;
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  id="btn-cancel-modal"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  disabled={isSavingAndTesting}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  id="btn-save-and-test"
                  disabled={isSavingAndTesting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center space-x-2 cursor-pointer disabled:opacity-60"
                >
                  {isSavingAndTesting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving &amp; Testing...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>SAVE &amp; TEST</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
