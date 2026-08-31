import React, { useEffect, useState } from 'react';
import { fetchAnalytics, AnalyticsData } from '../lib/api';
import { Activity, Zap, Clock, ShieldCheck, RefreshCw, Layers, Terminal } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const res = await fetchAnalytics();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Activity size={13} />
            <span>Real-time Agent Telemetry & Audit Logs</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Observability & Logs</h1>
          <p className="text-slate-400 text-sm mt-1">
            End-to-end reasoning chain traces, latency telemetry, and tool execution metrics across your Mini-Apps.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-colors"
        >
          <RefreshCw size={13} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Executions</span>
            <Zap size={16} className="text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {data?.totalRuns || 0}
          </div>
          <p className="text-[11px] text-slate-500">Across widgets & REST API calls</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Success Rate</span>
            <ShieldCheck size={16} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">
            {data?.successRate ?? 100}%
          </div>
          <p className="text-[11px] text-slate-500">Zero unhandled tool exceptions</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Avg Agent Latency</span>
            <Clock size={16} className="text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-400">
            {data?.avgLatencyMs || 0} <span className="text-sm font-normal text-slate-400">ms</span>
          </div>
          <p className="text-[11px] text-slate-500">Powered by Gemini Flash engine</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Tokens Processed</span>
            <Layers size={16} className="text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-purple-400">
            {data?.totalTokens || 0}
          </div>
          <p className="text-[11px] text-slate-500">Prompt & function calling metadata</p>
        </div>
      </div>

      {/* Audit Log Feed */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-sky-400" />
            <h2 className="font-bold text-base text-white">Execution Audit Stream</h2>
          </div>
          <span className="text-xs text-slate-400">Auto-refreshing every 5s</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3.5">Run ID</th>
                <th className="p-3.5">Mini-App</th>
                <th className="p-3.5">Channel</th>
                <th className="p-3.5">Tool Invoked</th>
                <th className="p-3.5">Latency</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">Loading audit feed...</td>
                </tr>
              ) : !data?.recentLogs || data.recentLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">No execution logs recorded yet. Run a Mini-App to see live traces.</td>
                </tr>
              ) : (
                data.recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-mono text-sky-400">{log.id}</td>
                    <td className="p-3.5 font-bold text-white">{log.appName}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {log.callerType}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-emerald-400">{log.toolExecuted || 'Direct'}</td>
                    <td className="p-3.5 text-indigo-300">{log.latencyMs} ms</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
