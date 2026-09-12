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
  ShieldAlert,
  ArrowRight,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Star,
  RefreshCw,
} from 'lucide-react';
import { AIModelConfig, TaskModelAssignments } from '../types';
import { api } from '../api';

interface AIModelsTabProps {
  models: Array<AIModelConfig & { hasKey: boolean }>;
  taskAssignments: TaskModelAssignments;
  onRefresh: () => void;
}

export const AIModelsTab: React.FC<AIModelsTabProps> = ({
  models,
  taskAssignments,
  onRefresh,
}) => {
  const [testingModelId, setTestingModelId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{ [modelId: string]: any }>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingModel, setEditingModel] = useState<Partial<AIModelConfig>>({
    name: '',
    provider: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    endpoint: '/chat/completions',
    apiKey: '',
    modelName: '',
    authHeaderType: 'Bearer',
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: 'You are an e-commerce marketing expert for Bangladesh.',
    isEnabled: true,
  });

  const [assignments, setAssignments] = useState<TaskModelAssignments>(taskAssignments);
  const [isSavingAssignments, setIsSavingAssignments] = useState(false);
  const [assignmentMessage, setAssignmentMessage] = useState<string | null>(null);

  // Test Model Connection
  const handleTestModel = async (model: AIModelConfig) => {
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
          status: 'error',
          message: err.message || 'Connection failed',
        },
      }));
    } finally {
      setTestingModelId(null);
    }
  };

  // Toggle Enable/Disable
  const handleToggleEnable = async (model: AIModelConfig) => {
    try {
      await api.saveAiModel({ ...model, isEnabled: !model.isEnabled });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Set Default Model
  const handleSetDefault = async (model: AIModelConfig) => {
    try {
      // Mark this model default and unset others
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
    if (!window.confirm(`Delete AI model "${name}"?`)) return;
    try {
      await api.deleteAiModel(id);
      onRefresh();
    } catch (err: any) {
      alert(`Error deleting: ${err.message}`);
    }
  };

  // Save Model in Modal
  const handleSaveModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModel.name || !editingModel.modelName) {
      alert('Model name and identifier are required.');
      return;
    }

    try {
      const payload: Partial<AIModelConfig> = {
        ...editingModel,
        id: editingModel.id || `custom-${Date.now()}`,
      };
      await api.saveAiModel(payload);
      setShowEditModal(false);
      onRefresh();
    } catch (err: any) {
      alert(`Error saving model: ${err.message}`);
    }
  };

  // Save Task Assignments
  const handleSaveAssignments = async () => {
    setIsSavingAssignments(true);
    setAssignmentMessage(null);
    try {
      await api.saveTaskAssignments(assignments);
      setAssignmentMessage('Task model assignments updated successfully!');
      setTimeout(() => setAssignmentMessage(null), 3500);
      onRefresh();
    } catch (err: any) {
      alert(`Failed to save task assignments: ${err.message}`);
    } finally {
      setIsSavingAssignments(false);
    }
  };

  const tasksList = [
    { key: 'productAnalysis', label: 'Product Analysis & Value Proposition' },
    { key: 'facebookCaption', label: 'Facebook Post & Hook Copy' },
    { key: 'youtubeContent', label: 'YouTube Title, SEO & Shorts' },
    { key: 'tiktokContent', label: 'TikTok Hooks & Viral Captions' },
    { key: 'videoScript', label: '9:16 Video Script Breakdown' },
    { key: 'imagePrompt', label: 'Image Generation Prompts' },
    { key: 'generalMarketing', label: 'General Marketing Copy & Translations' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            <span>Model-Agnostic AI Cloud System</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Multi-Model AI Dispatcher & Manager
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            The platform does not lock you to Gemini. Add, test, select, enable, and switch between
            OpenAI, Anthropic Claude, Groq, DeepSeek, Google Gemini, OpenRouter, and custom OpenAI-compatible REST APIs.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingModel({
              id: '',
              name: '',
              provider: 'openai',
              baseUrl: 'https://api.openai.com/v1',
              endpoint: '/chat/completions',
              apiKey: '',
              modelName: '',
              authHeaderType: 'Bearer',
              temperature: 0.7,
              maxTokens: 2048,
              systemPrompt: 'You are an elite e-commerce marketing strategist for Bangladesh.',
              isEnabled: true,
            });
            setShowEditModal(true);
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center space-x-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Model</span>
        </button>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map((model) => {
          const testResult = testResults[model.id];
          const isTesting = testingModelId === model.id;

          return (
            <div
              key={model.id}
              className={`bg-slate-900 border rounded-2xl p-4 shadow-sm flex flex-col justify-between transition ${
                model.isEnabled
                  ? model.isDefault
                    ? 'border-indigo-500/80 bg-slate-900/90'
                    : 'border-slate-800 hover:border-slate-700'
                  : 'border-slate-800/50 opacity-60 bg-slate-950/40'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h3 className="text-sm font-bold text-slate-100">{model.name}</h3>
                      {model.isDefault && (
                        <span className="text-[10px] bg-indigo-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">{model.modelName}</p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      model.provider === 'gemini'
                        ? 'bg-blue-500/20 text-blue-300'
                        : model.provider === 'openai'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : model.provider === 'groq'
                        ? 'bg-orange-500/20 text-orange-300'
                        : model.provider === 'anthropic'
                        ? 'bg-amber-500/20 text-amber-300'
                        : model.provider === 'deepseek'
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'bg-cyan-500/20 text-cyan-300'
                    }`}
                  >
                    {model.provider}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1 text-[11px] text-slate-400 mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <div className="flex justify-between">
                    <span>Endpoint:</span>
                    <span className="font-mono text-slate-300 truncate max-w-[160px]">{model.endpoint}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>API Key:</span>
                    <span className="font-mono text-slate-300">{model.hasKey ? '✓ Configured' : 'Missing Key'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span
                      className={`font-semibold uppercase ${
                        model.status === 'online'
                          ? 'text-emerald-400'
                          : model.status === 'error'
                          ? 'text-rose-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {model.status}
                    </span>
                  </div>
                  {model.latencyMs && (
                    <div className="flex justify-between">
                      <span>Latency:</span>
                      <span className="text-cyan-400 font-semibold">{model.latencyMs}ms</span>
                    </div>
                  )}
                </div>

                {/* Real Test Result Banner */}
                {testResult && (
                  <div
                    className={`mt-3 p-2 rounded-lg text-[11px] ${
                      testResult.loading
                        ? 'bg-slate-800 text-slate-300 animate-pulse'
                        : testResult.success
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                    }`}
                  >
                    {testResult.loading ? (
                      <div className="flex items-center space-x-1.5">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Sending test ping to API...</span>
                      </div>
                    ) : testResult.success ? (
                      <div>
                        <div className="font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>✓ Connection Successful</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Response time: {(testResult.latencyMs / 1000).toFixed(2)}s
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

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleTestModel(model)}
                  disabled={isTesting}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg border border-slate-700 transition flex items-center space-x-1.5"
                >
                  <Play className={`w-3 h-3 text-emerald-400 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Testing...' : 'Test Model'}</span>
                </button>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleSetDefault(model)}
                    title="Set as Default Model"
                    className={`p-1.5 rounded-lg border transition ${
                      model.isDefault
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleToggleEnable(model)}
                    title={model.isEnabled ? 'Disable' : 'Enable'}
                    className={`p-1.5 rounded-lg border transition ${
                      model.isEnabled
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}
                  >
                    {model.isEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => {
                      setEditingModel({ ...model });
                      setShowEditModal(true);
                    }}
                    title="Edit Configuration"
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {model.provider === 'custom' && (
                    <button
                      onClick={() => handleDeleteModel(model.id, model.name)}
                      title="Delete Model"
                      className="p-1.5 bg-slate-800 hover:bg-rose-900/30 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-700 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Model Assignment Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Settings2 className="w-4 h-4 text-indigo-400" />
              <span>Task-Specific Model Selector & Fallback</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Assign different specialized models for distinct marketing jobs across the workflow.
            </p>
          </div>

          <button
            onClick={handleSaveAssignments}
            disabled={isSavingAssignments}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition disabled:opacity-50"
          >
            {isSavingAssignments ? 'Saving...' : 'Save Assignments'}
          </button>
        </div>

        {assignmentMessage && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{assignmentMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {tasksList.map((task) => (
            <div
              key={task.key}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
            >
              <span className="font-medium text-slate-300">{task.label}</span>
              <select
                value={assignments[task.key as keyof TaskModelAssignments] as string}
                onChange={(e) =>
                  setAssignments({ ...assignments, [task.key]: e.target.value })
                }
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.provider})
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Fallback Config */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="enableFallback"
              checked={assignments.enableFallback}
              onChange={(e) => setAssignments({ ...assignments, enableFallback: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-500"
            />
            <label htmlFor="enableFallback" className="text-slate-300 font-medium cursor-pointer">
              Enable Automatic Model Fallback (If primary model fails or exceeds quota, failover to secondary)
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Fallback Model:</span>
            <select
              value={assignments.fallbackModelId || ''}
              onChange={(e) => setAssignments({ ...assignments, fallbackModelId: e.target.value })}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add / Edit Model Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingModel.id ? 'Configure AI Model' : 'Add External Cloud AI API'}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 text-xs font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModel} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Friendly Name</label>
                  <input
                    type="text"
                    required
                    value={editingModel.name || ''}
                    onChange={(e) => setEditingModel({ ...editingModel, name: e.target.value })}
                    placeholder="e.g. OpenAI GPT-4o"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Provider Type</label>
                  <select
                    value={editingModel.provider || 'openai'}
                    onChange={(e) =>
                      setEditingModel({
                        ...editingModel,
                        provider: e.target.value as any,
                        baseUrl:
                          e.target.value === 'openai'
                            ? 'https://api.openai.com/v1'
                            : e.target.value === 'groq'
                            ? 'https://api.groq.com/openai/v1'
                            : e.target.value === 'anthropic'
                            ? 'https://api.anthropic.com/v1'
                            : e.target.value === 'deepseek'
                            ? 'https://api.deepseek.com'
                            : editingModel.baseUrl,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="gemini">Google Gemini</option>
                    <option value="groq">Groq</option>
                    <option value="anthropic">Anthropic Claude</option>
                    <option value="deepseek">DeepSeek</option>
                    <option value="openrouter">OpenRouter</option>
                    <option value="custom">Custom REST API</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Base URL</label>
                  <input
                    type="text"
                    value={editingModel.baseUrl || ''}
                    onChange={(e) => setEditingModel({ ...editingModel, baseUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Endpoint</label>
                  <input
                    type="text"
                    value={editingModel.endpoint || '/chat/completions'}
                    onChange={(e) => setEditingModel({ ...editingModel, endpoint: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Model Identifier</label>
                  <input
                    type="text"
                    required
                    value={editingModel.modelName || ''}
                    onChange={(e) => setEditingModel({ ...editingModel, modelName: e.target.value })}
                    placeholder="e.g. gpt-4o, llama-3.3-70b-versatile"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">API Key</label>
                  <input
                    type="password"
                    value={editingModel.apiKey || ''}
                    onChange={(e) => setEditingModel({ ...editingModel, apiKey: e.target.value })}
                    placeholder="sk-••••••••"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono"
                  />
                </div>
              </div>

              {editingModel.provider === 'custom' && (
                <div>
                  <label className="block text-slate-400 mb-1">Response JSON Path</label>
                  <input
                    type="text"
                    value={editingModel.responsePath || 'choices[0].message.content'}
                    onChange={(e) => setEditingModel({ ...editingModel, responsePath: e.target.value })}
                    placeholder="choices[0].message.content"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1">System Prompt / Role</label>
                <textarea
                  rows={3}
                  value={editingModel.systemPrompt || ''}
                  onChange={(e) => setEditingModel({ ...editingModel, systemPrompt: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl"
                >
                  Save Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
