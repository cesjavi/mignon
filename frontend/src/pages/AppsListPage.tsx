import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchApps, MiniApp, executeMiniApp, generateMiniAppWithAI, createApp } from '../lib/api';
import { 
  Plane, Clock, TrendingUp, Target, Sparkles, 
  Play, Code, Settings, Copy, Check, ArrowRight, 
  Layers, ShieldCheck, Zap, Wand2, Download, Upload, Volume2
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Plane,
  Clock,
  TrendingUp,
  Target,
  Sparkles,
};

export const AppsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [apps, setApps] = useState<MiniApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingAppId, setTestingAppId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionElapsed, setExecutionElapsed] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Prompt-to-App AI Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  useEffect(() => {
    loadApps();
  }, []);

  useEffect(() => {
    let interval: any;
    if (isExecuting) {
      setExecutionElapsed(0);
      interval = setInterval(() => {
        setExecutionElapsed((prev) => +(prev + 0.2).toFixed(1));
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isExecuting]);

  async function loadApps() {
    try {
      setLoading(true);
      const data = await fetchApps();
      setApps(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickRun(app: MiniApp) {
    setTestingAppId(app.id);
    setIsExecuting(true);
    setTestResult(null);

    const defaultInputs: Record<string, any> = {};
    app.inputs.forEach((inp) => {
      defaultInputs[inp.id] = inp.default || '';
    });

    try {
      const res = await executeMiniApp(app.id, defaultInputs);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ error: err.message || 'Execution failed' });
    } finally {
      setIsExecuting(false);
    }
  }

  function handleCopyEmbedSnippet(appId: string) {
    const snippet = `<div data-mignon-app="${appId}"></div>\n<script src="${window.location.origin}/widget.js" async></script>`;
    navigator.clipboard.writeText(snippet);
    setCopiedId(appId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleSpeakText(text: string) {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }

  async function handleGenerateWithAi(e: React.FormEvent) {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsGeneratingAi(true);
    try {
      const schema = await generateMiniAppWithAI(aiPrompt.trim());
      const created = await createApp(schema);
      setIsAiModalOpen(false);
      setAiPrompt('');
      await loadApps();
      navigate(`/editor/${created.id}`);
    } catch (err: any) {
      alert(`AI Generation error: ${err.message}`);
    } finally {
      setIsGeneratingAi(false);
    }
  }

  function handleExportAppsJson() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(apps, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "mignon-mini-apps-catalog.json");
    dlAnchorElem.click();
  }

  function handleImportAppsJson(e: React.ChangeEvent<HTMLInputElement>) {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            for (const item of parsed) {
              await createApp(item);
            }
          } else {
            await createApp(parsed);
          }
          await loadApps();
          alert("Mini-Apps imported successfully!");
        } catch (err) {
          alert("Invalid JSON file");
        }
      };
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
            <Zap size={13} />
            <span>Autonomous Micro-Agent Fleet & Voice Widgets</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Mini-Apps & AI Agent Widgets
          </h1>
          <p className="text-slate-300 text-base leading-relaxed">
            Create, test and deploy intelligent single-purpose micro-agents powered by <strong className="text-white">Gemini 3.5 Flash</strong>. 
            Embed them in any website with a single <code className="text-sky-300 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/40">&lt;script&gt;</code> tag or access them via direct REST API endpoints.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600 hover:opacity-95 text-slate-950 font-extrabold text-xs shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Wand2 size={16} />
              <span>Prompt-to-App (Create with AI)</span>
            </button>

            <Link
              to="/editor/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
            >
              <span>+ Manual Builder</span>
            </Link>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleExportAppsJson}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white text-xs transition-colors"
                title="Export Mini-Apps JSON"
              >
                <Download size={14} />
                <span>Export JSON</span>
              </button>

              <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white text-xs cursor-pointer transition-colors">
                <Upload size={14} />
                <span>Import JSON</span>
                <input type="file" accept=".json" onChange={handleImportAppsJson} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Mini-Apps */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Active Mini-Apps</h2>
            <p className="text-xs text-slate-400">Deployed and ready for web embedding & API execution</p>
          </div>
          <span className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            {apps.length} Mini-Apps Active
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {apps.map((app) => {
              const IconComp = ICON_MAP[app.icon] || Sparkles;
              return (
                <div
                  key={app.id}
                  className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-all duration-200 glow-hover"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md"
                          style={{ backgroundColor: app.theme?.primaryColor || '#38bdf8' }}
                        >
                          <IconComp size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-white leading-tight">{app.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400">{app.category}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-[11px] font-mono text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/40">
                              {app.id}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {app.theme?.badge || 'AI App'}
                      </span>
                    </div>

                    <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">
                      {app.description}
                    </p>

                    {/* Tools badges */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Gemini Tools Attached:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {app.tools.map((tool) => (
                          <span
                            key={tool}
                            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-indigo-950/70 text-indigo-300 border border-indigo-800/50"
                          >
                            <ShieldCheck size={12} />
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-6 mt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuickRun(app)}
                        className="flex items-center gap-1.5 text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 px-3 py-2 rounded-lg transition-colors shadow-sm"
                      >
                        <Play size={13} fill="currentColor" />
                        <span>Quick Test</span>
                      </button>

                      <button
                        onClick={() => handleCopyEmbedSnippet(app.id)}
                        className="flex items-center gap-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg border border-slate-700 transition-colors"
                        title="Copy HTML Embed code"
                      >
                        {copiedId === app.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        <span>{copiedId === app.id ? 'Copied' : 'Embed Code'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/api-docs?app=${app.id}`}
                        className="p-2 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="View API Docs"
                      >
                        <Code size={16} />
                      </Link>
                      <Link
                        to={`/editor/${app.id}`}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Configure App"
                      >
                        <Settings size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Prompt-to-App AI Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <Wand2 size={20} />
                <span className="text-base text-white">Prompt-to-App Architect</span>
              </div>
              <button onClick={() => setIsAiModalOpen(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Describe in natural language what your micro-agent widget should do. Gemini 3.5 Flash will automatically engineer the input fields, system instructions, tools, and UI theme.
            </p>

            <form onSubmit={handleGenerateWithAi} className="space-y-4">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. International shipping cost estimator asking for origin, destination, and package weight in kg, providing instant rate breakdowns and express recommendations."
                rows={4}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Try presets:</span>
                <button
                  type="button"
                  onClick={() => setAiPrompt("Smart budget estimation calculator for software development projects with tech stack and hourly breakdown")}
                  className="text-[11px] text-sky-400 bg-sky-950/60 px-2 py-1 rounded border border-sky-800/40 hover:bg-sky-900/60"
                >
                  Software Quote
                </button>
                <button
                  type="button"
                  onClick={() => setAiPrompt("Vacation package booking and itinerary planning assistant with hotel options and local activities")}
                  className="text-[11px] text-indigo-400 bg-indigo-950/60 px-2 py-1 rounded border border-indigo-800/40 hover:bg-indigo-900/60"
                >
                  Travel Planner
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingAi}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-600 hover:from-sky-300 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  <Sparkles size={14} />
                  <span>{isGeneratingAi ? 'Synthesizing Mini-App...' : 'Generate with Gemini'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Test Modal / Drawer */}
      {testingAppId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Play size={16} fill="currentColor" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    Quick Test: {apps.find((a) => a.id === testingAppId)?.name}
                  </h3>
                  <p className="text-xs text-slate-400">Executing Gemini 3.5 Flash Tool Loop</p>
                </div>
              </div>
              <button
                onClick={() => setTestingAppId(null)}
                className="text-slate-400 hover:text-white text-sm font-semibold p-1.5 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {isExecuting ? (
              <div className="py-10 flex flex-col items-center justify-center space-y-4 text-center">
                <div className="relative">
                  <div className="w-14 h-14 border-4 border-sky-500/20 border-t-sky-400 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-[11px] font-mono text-sky-400 font-bold">
                    {executionElapsed}s
                  </div>
                </div>

                <div className="space-y-1 max-w-sm">
                  <p className="text-sm font-semibold text-white">
                    {executionElapsed < 1.5
                      ? '1/3 Initializing Gemini Agent & Tool Bindings...'
                      : executionElapsed < 3.5
                      ? '2/3 Executing Native Function Calling Tool Loop...'
                      : '3/3 Synthesizing Final Reasoning & Structured Output...'}
                  </p>
                  <p className="text-xs text-slate-400">
                    Live reasoning pipeline running on Google Gemini 3.5 Flash
                  </p>
                </div>

                {/* Micro Progress Bar */}
                <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-300 rounded-full"
                    style={{
                      width: `${Math.min(95, Math.max(15, executionElapsed * 28))}%`,
                    }}
                  ></div>
                </div>
              </div>
            ) : testResult?.error ? (
              <div className="p-5 rounded-xl bg-rose-950/40 border border-rose-800/60 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                  <span>⚠️ Notice / Execution Info:</span>
                </div>
                <p className="text-xs text-rose-200 leading-relaxed">
                  {testResult.error}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      const app = apps.find((a) => a.id === testingAppId);
                      if (app) handleQuickRun(app);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
                  >
                    Retry Execution
                  </button>
                </div>
              </div>
            ) : testResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">Agent Reasoning Output</span>
                    {testResult.result?.tool_executed && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-800/50">
                        Tool: {testResult.result.tool_executed}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const app = apps.find((a) => a.id === testingAppId);
                        if (app) handleQuickRun(app);
                      }}
                      className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-colors"
                      title="Run again"
                    >
                      Re-run
                    </button>
                    <button
                      onClick={() => handleSpeakText(testResult.result?.markdown || '')}
                      className="flex items-center gap-1.5 text-xs text-sky-400 bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-800/40 hover:bg-sky-900/60"
                    >
                      <Volume2 size={13} />
                      <span>Listen Voice</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-sans text-sm text-slate-200 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                  {testResult.result?.markdown || JSON.stringify(testResult, null, 2)}
                </div>

                {testResult.metadata && (
                  <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                    <div>
                      <span>Latency: </span>
                      <strong className="text-sky-400">{testResult.metadata.latency_ms} ms</strong>
                    </div>
                    <div>
                      <span>Tokens: </span>
                      <strong className="text-indigo-400">{testResult.metadata.tokens_used}</strong>
                    </div>
                    <div>
                      <span>Engine: </span>
                      <strong className="text-slate-200">{testResult.metadata.model}</strong>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setTestingAppId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Close
              </button>
              <Link
                to={`/embed?app=${testingAppId}`}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
              >
                <span>Embed this Mini-App</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
