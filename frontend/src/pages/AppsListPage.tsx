import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchApps, MiniApp, executeMiniApp } from '../lib/api';
import { 
  Plane, Clock, TrendingUp, Target, Sparkles, 
  Play, Code, Settings, Copy, Check, ArrowRight, 
  Layers, ShieldCheck, Zap
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Plane,
  Clock,
  TrendingUp,
  Target,
  Sparkles,
};

export const AppsListPage: React.FC = () => {
  const [apps, setApps] = useState<MiniApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingAppId, setTestingAppId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadApps();
  }, []);

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

    // Build default inputs
    const defaultInputs: Record<string, any> = {};
    app.inputs.forEach((inp) => {
      defaultInputs[inp.id] = inp.default || '';
    });

    try {
      const res = await executeMiniApp(app.id, defaultInputs);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ error: err.message });
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

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
            <Zap size={13} />
            <span>Autonomous Micro-Agent Fleet</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Mini-Apps & AI Agent Widgets
          </h1>
          <p className="text-slate-300 text-base leading-relaxed">
            Create, test and deploy intelligent single-purpose micro-agents powered by <strong className="text-white">Gemini 3.5 Flash</strong>. 
            Embed them in any website with a single <code className="text-sky-300 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/40">&lt;script&gt;</code> tag or access them via direct REST API endpoints.
          </p>
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
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-sky-500/20 border-t-sky-400 rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-slate-300">
                  Invoking Gemini Flash Agent & Running Tools...
                </p>
              </div>
            ) : testResult ? (
              <div className="space-y-4">
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
