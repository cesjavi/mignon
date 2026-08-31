import React, { useEffect, useState, useMemo } from 'react';
import { 
  fetchAnalytics, 
  simulateTraffic, 
  clearAnalytics, 
  AnalyticsData, 
  ExecutionLog, 
  TimelinePoint, 
  AppUsageStat 
} from '../lib/api';
import { 
  Activity, 
  Zap, 
  Clock, 
  ShieldCheck, 
  RefreshCw, 
  Layers, 
  Terminal, 
  Download, 
  Trash2, 
  Filter, 
  Search, 
  TrendingUp, 
  BarChart3, 
  Globe, 
  Code, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Info, 
  Copy, 
  Check, 
  X, 
  Cpu,
  ArrowUpRight,
  Gauge
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [autoRefreshSec, setAutoRefreshSec] = useState<number>(5);
  const [timeRange, setTimeRange] = useState<'all' | '24h' | '7d'>('all');
  
  // Filters for the audit log table
  const [searchQuery, setSearchQuery] = useState('');
  const [filterApp, setFilterApp] = useState('ALL');
  const [filterChannel, setFilterChannel] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<ExecutionLog | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [chartMetric, setChartMetric] = useState<'runs' | 'latency' | 'tokens'>('runs');

  useEffect(() => {
    loadData();
    if (autoRefreshSec > 0) {
      const interval = setInterval(loadData, autoRefreshSec * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefreshSec]);

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

  async function handleSimulate(count: number = 5) {
    try {
      setSimulating(true);
      const updated = await simulateTraffic(count);
      setData(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  }

  async function handleClear() {
    if (!window.confirm('Are you sure you want to clear all telemetry logs? This will reset all current usage statistics.')) {
      return;
    }
    try {
      setClearing(true);
      const updated = await clearAnalytics();
      setData(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setClearing(false);
    }
  }

  // Export filtered logs as CSV
  function handleExportCSV() {
    if (!data?.recentLogs || data.recentLogs.length === 0) return;
    const headers = ['ID', 'Timestamp', 'App ID', 'App Name', 'Channel', 'Latency (ms)', 'Tokens', 'Tool Executed', 'Status', 'Query Preview'];
    const rows = filteredLogs.map(log => [
      log.id,
      log.timestamp,
      log.appId,
      `"${(log.appName || '').replace(/"/g, '""')}"`,
      log.callerType,
      log.latencyMs,
      log.tokensTotal,
      log.toolExecuted || 'direct',
      log.status,
      `"${(log.queryPreview || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mignon_usage_stats_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Export full telemetry as JSON
  function handleExportJSON() {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mignon_analytics_export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Filtered audit logs
  const filteredLogs = useMemo(() => {
    if (!data?.recentLogs) return [];
    return data.recentLogs.filter(log => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesId = log.id.toLowerCase().includes(q);
        const matchesName = (log.appName || '').toLowerCase().includes(q);
        const matchesQuery = (log.queryPreview || '').toLowerCase().includes(q);
        const matchesTool = (log.toolExecuted || '').toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesQuery && !matchesTool) return false;
      }
      // Filter App
      if (filterApp !== 'ALL' && log.appId !== filterApp && log.appName !== filterApp) {
        return false;
      }
      // Filter Channel
      if (filterChannel !== 'ALL' && log.callerType !== filterChannel) {
        return false;
      }
      // Filter Status
      if (filterStatus !== 'ALL' && log.status !== filterStatus) {
        return false;
      }
      return true;
    });
  }, [data?.recentLogs, searchQuery, filterApp, filterChannel, filterStatus]);

  // Unique list of apps for dropdown filter
  const uniqueApps = useMemo(() => {
    if (!data?.appBreakdown) return [];
    return data.appBreakdown;
  }, [data?.appBreakdown]);

  // Timeline chart calculations
  const maxChartValue = useMemo(() => {
    if (!data?.timeline || data.timeline.length === 0) return 10;
    if (chartMetric === 'runs') {
      return Math.max(...data.timeline.map(t => t.runs), 5);
    } else if (chartMetric === 'latency') {
      return Math.max(...data.timeline.map(t => t.avgLatency), 500);
    } else {
      return Math.max(...data.timeline.map(t => t.tokens), 1000);
    }
  }, [data?.timeline, chartMetric]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl pb-16">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <Activity size={13} />
            <span>Autonomous Agent Fleet Observability</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Usage Statistics & Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time telemetry, execution latency distribution, Gemini token consumption, and multi-channel API metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Auto refresh select */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <Clock size={13} className="text-slate-400 mr-1.5" />
            <span className="text-slate-400 mr-1">Auto:</span>
            <select
              value={autoRefreshSec}
              onChange={(e) => setAutoRefreshSec(Number(e.target.value))}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value={0} className="bg-slate-900 text-slate-300">Off</option>
              <option value={3} className="bg-slate-900 text-slate-300">3s</option>
              <option value={5} className="bg-slate-900 text-slate-300">5s</option>
              <option value={15} className="bg-slate-900 text-slate-300">15s</option>
              <option value={30} className="bg-slate-900 text-slate-300">30s</option>
            </select>
          </div>

          {/* Simulate Traffic Button */}
          <button
            onClick={() => handleSimulate(6)}
            disabled={simulating}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-xs font-semibold text-white shadow-lg shadow-sky-500/20 transition-all transform active:scale-95 disabled:opacity-50"
            title="Simulate realistic traffic across agents and tools"
          >
            <Zap size={14} className={simulating ? 'animate-spin' : ''} />
            <span>{simulating ? 'Simulating...' : 'Simulate Traffic'}</span>
          </button>

          {/* Export Dropdown / Buttons */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-xl p-1">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Export as CSV"
            >
              <Download size={13} />
              <span>CSV</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Export as JSON"
            >
              <span>JSON</span>
            </button>
          </div>

          {/* Clear Logs */}
          <button
            onClick={handleClear}
            disabled={clearing}
            className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-colors"
            title="Clear all telemetry logs"
          >
            <Trash2 size={15} />
          </button>

          {/* Manual Refresh */}
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-colors"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Top Metric / KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Executions */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-slate-800/80 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Runs</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Zap size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-black text-white tracking-tight">
              {data?.totalRuns || 0}
            </div>
            <span className="text-xs font-medium text-emerald-400 flex items-center">
              <TrendingUp size={12} className="mr-0.5" /> Live
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
            <span>Widget: {data?.channelBreakdown?.widget?.count || 0}</span>
            <span>API: {data?.channelBreakdown?.api?.count || 0}</span>
          </div>
        </div>

        {/* Success Rate */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-slate-800/80 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Success Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-black text-emerald-400 tracking-tight">
              {data?.successRate ?? 100}%
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
            <span className="text-emerald-400/90">{data?.successfulRuns || 0} passed</span>
            <span className={data?.errorRuns ? 'text-rose-400' : 'text-slate-500'}>
              {data?.errorRuns || 0} errors
            </span>
          </div>
        </div>

        {/* Average Latency */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-slate-800/80 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Avg Latency</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Clock size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <div className="text-3xl font-black text-indigo-400 tracking-tight">
              {data?.avgLatencyMs || 0}
            </div>
            <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
            <span>P95: {data?.p95LatencyMs || 0}ms</span>
            <span className="text-indigo-300">Min: {data?.minLatencyMs || 0}ms</span>
          </div>
        </div>

        {/* Total Tokens */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-slate-800/80 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Tokens Used</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Layers size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-black text-purple-400 tracking-tight">
              {(data?.totalTokens || 0) > 1000 
                ? `${((data?.totalTokens || 0) / 1000).toFixed(1)}k`
                : (data?.totalTokens || 0)}
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
            <span>~{data?.avgTokensPerRun || 0} tokens/run</span>
            <span className="text-purple-300">Gemini 3.5</span>
          </div>
        </div>

        {/* Active Mini-Apps */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-slate-800/80 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Active Fleet</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-black text-amber-400 tracking-tight">
              {data?.activeAppsCount || 0}
            </div>
            <span className="text-xs text-slate-400">deployed</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
            <span>Tools: {data?.toolBreakdown?.length || 0} active</span>
            <span className="text-amber-300">100% Ready</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Activity Chart (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5 flex flex-col justify-between shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <BarChart3 size={18} />
              </div>
              <div>
                <h2 className="font-bold text-base text-white">Execution Traffic & Timeline Activity</h2>
                <p className="text-xs text-slate-400">Chronological distribution of agent calls, latency, and throughput</p>
              </div>
            </div>

            {/* Metric Switcher */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setChartMetric('runs')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  chartMetric === 'runs'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Requests
              </button>
              <button
                onClick={() => setChartMetric('latency')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  chartMetric === 'latency'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Avg Latency
              </button>
              <button
                onClick={() => setChartMetric('tokens')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  chartMetric === 'tokens'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tokens
              </button>
            </div>
          </div>

          {/* Responsive SVG Bar / Timeline Visualizer */}
          <div className="space-y-2 pt-2">
            {!data?.timeline || data.timeline.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-500 text-xs">
                No timeline data available. Click "Simulate Traffic" or run an app to see live trends.
              </div>
            ) : (
              <div className="h-48 flex items-end justify-between gap-2 px-2 pt-6">
                {data.timeline.map((point, idx) => {
                  let val = point.runs;
                  let colorClass = 'from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-400';
                  let suffix = 'runs';

                  if (chartMetric === 'latency') {
                    val = point.avgLatency;
                    colorClass = 'from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-400';
                    suffix = 'ms';
                  } else if (chartMetric === 'tokens') {
                    val = point.tokens;
                    colorClass = 'from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-400';
                    suffix = 'tok';
                  }

                  const heightPercent = maxChartValue > 0 ? Math.max(Math.round((val / maxChartValue) * 100), 8) : 8;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute -top-12 z-20 bg-slate-950 border border-slate-700 text-[11px] text-slate-200 rounded-lg px-2.5 py-1 whitespace-nowrap shadow-2xl">
                        <span className="font-bold text-white">{val} {suffix}</span> ({point.runs} reqs, {point.avgLatency}ms)
                      </div>

                      {/* Bar */}
                      <div className="w-full max-w-[36px] bg-slate-800/40 rounded-t-lg overflow-hidden flex flex-col justify-end h-36">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full bg-gradient-to-t ${colorClass} rounded-t-lg transition-all duration-500 shadow-sm`}
                        />
                      </div>

                      {/* X-axis label */}
                      <span className="text-[10px] text-slate-400 font-mono rotate-0 truncate max-w-[45px] text-center">
                        {point.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/60">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-500"></span>
              <span>Gemini Flash Function Calling Pipeline</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">12 Recent Time Buckets</span>
          </div>
        </div>

        {/* Channel & Traffic Origin Distribution (1 Col) */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-4">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Globe size={18} />
              </div>
              <div>
                <h2 className="font-bold text-base text-white">Channel Ingestion Share</h2>
                <p className="text-xs text-slate-400">Traffic origin split across clients</p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              {/* Embed Widget */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2 text-slate-200">
                    <Globe size={14} className="text-sky-400" />
                    <span>Web Widgets & Embeds</span>
                  </span>
                  <span className="text-sky-400 font-mono">
                    {data?.channelBreakdown?.widget?.percent || 0}% ({data?.channelBreakdown?.widget?.count || 0})
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                  <div
                    style={{ width: `${data?.channelBreakdown?.widget?.percent || 0}%` }}
                    className="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full transition-all duration-500"
                  />
                </div>
              </div>

              {/* Developer REST API */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2 text-slate-200">
                    <Code size={14} className="text-indigo-400" />
                    <span>Developer REST API (Bearer)</span>
                  </span>
                  <span className="text-indigo-400 font-mono">
                    {data?.channelBreakdown?.api?.percent || 0}% ({data?.channelBreakdown?.api?.count || 0})
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                  <div
                    style={{ width: `${data?.channelBreakdown?.api?.percent || 0}%` }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-500"
                  />
                </div>
              </div>

              {/* Studio Playground */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2 text-slate-200">
                    <Sparkles size={14} className="text-amber-400" />
                    <span>Studio Playground</span>
                  </span>
                  <span className="text-amber-400 font-mono">
                    {data?.channelBreakdown?.studio?.percent || 0}% ({data?.channelBreakdown?.studio?.count || 0})
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                  <div
                    style={{ width: `${data?.channelBreakdown?.studio?.percent || 0}%` }}
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Latency Speed Distribution */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Gauge size={14} className="text-emerald-400" />
                <span>Latency Speed Buckets</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Healthy
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">&lt; 500ms (Fast)</span>
                <span className="font-bold text-emerald-400 text-sm font-mono">
                  {data?.latencyDistribution?.under500ms || 0} reqs
                </span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">500ms - 1s (Normal)</span>
                <span className="font-bold text-sky-400 text-sm font-mono">
                  {data?.latencyDistribution?.between500and1000ms || 0} reqs
                </span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">1s - 2s (Tools)</span>
                <span className="font-bold text-amber-400 text-sm font-mono">
                  {data?.latencyDistribution?.between1000and2000ms || 0} reqs
                </span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">&gt; 2s (Heavy)</span>
                <span className="font-bold text-rose-400 text-sm font-mono">
                  {data?.latencyDistribution?.over2000ms || 0} reqs
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Mini-Apps Performance Matrix & Tools Calling Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* App Popularity Matrix (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Layers size={18} />
              </div>
              <div>
                <h2 className="font-bold text-base text-white">Mini-App Popularity & Performance Matrix</h2>
                <p className="text-xs text-slate-400">Aggregated execution volume, token utilization and reliability per agent</p>
              </div>
            </div>
            <span className="text-xs text-slate-400 font-mono">{data?.appBreakdown?.length || 0} mini-apps</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3">Mini-App</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Executions</th>
                  <th className="p-3 text-right">Share</th>
                  <th className="p-3 text-right">Avg Latency</th>
                  <th className="p-3 text-right">Tokens</th>
                  <th className="p-3 text-right">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {!data?.appBreakdown || data.appBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500">
                      No mini-app executions recorded yet.
                    </td>
                  </tr>
                ) : (
                  data.appBreakdown.map((app) => (
                    <tr key={app.id || app.name} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                          <span>{app.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                          {app.category}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-sky-400">
                        {app.runs}
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${app.percentOfTotal}%` }}
                              className="h-full bg-sky-500 rounded-full"
                            />
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">{app.percentOfTotal}%</span>
                        </div>
                      </td>
                      <td className="p-3 text-right font-mono text-indigo-300">
                        {app.avgLatencyMs} ms
                      </td>
                      <td className="p-3 text-right font-mono text-purple-300">
                        {app.totalTokens > 1000 ? `${(app.totalTokens / 1000).toFixed(1)}k` : app.totalTokens}
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-emerald-400">
                        {app.successRate}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Autonomous Tool Invocation Breakdown (1 col) */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-4">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Cpu size={18} />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Tool Invocation Chains</h2>
              <p className="text-xs text-slate-400">Gemini native function executions</p>
            </div>
          </div>

          <div className="space-y-3.5 pt-2">
            {!data?.toolBreakdown || data.toolBreakdown.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No tool executions tracked yet.
              </div>
            ) : (
              data.toolBreakdown.map((t, idx) => {
                const isDirect = t.tool === 'direct_reasoning';
                const displayName = isDirect ? 'Direct LLM Reasoning' : t.tool.replace(/_/g, ' ');
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className={`flex items-center gap-1.5 ${isDirect ? 'text-slate-300' : 'text-emerald-400 font-mono'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isDirect ? 'bg-slate-500' : 'bg-emerald-400'}`}></span>
                        <span>{displayName}</span>
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {t.count} ({t.percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        style={{ width: `${t.percent}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          isDirect ? 'bg-slate-600' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        }`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              <Info size={12} className="text-sky-400" />
              <span>Deterministic Function Calling</span>
            </span>
            <p>
              Tools are called autonomously by Gemini with zero hallucination parameters and passed back into the final response synthesis.
            </p>
          </div>
        </div>
      </div>

      {/* Filterable Audit Stream & Log Feed */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Terminal size={18} />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Execution Audit Log Stream</h2>
              <p className="text-xs text-slate-400">Click on any record to inspect the complete execution trace and parameters</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Search Input */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search run ID, query..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none w-44 md:w-52"
              />
            </div>

            {/* App Filter */}
            <select
              value={filterApp}
              onChange={(e) => setFilterApp(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Mini-Apps</option>
              {uniqueApps.map(app => (
                <option key={app.id || app.name} value={app.id || app.name}>
                  {app.name}
                </option>
              ))}
            </select>

            {/* Channel Filter */}
            <select
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Channels</option>
              <option value="widget">Widget</option>
              <option value="api">REST API</option>
              <option value="studio">Studio</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3.5">Run ID</th>
                <th className="p-3.5">Mini-App</th>
                <th className="p-3.5">Channel</th>
                <th className="p-3.5">Tool Invoked</th>
                <th className="p-3.5">Latency</th>
                <th className="p-3.5">Tokens</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">Loading audit feed...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No execution logs match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr 
                    key={log.id} 
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="p-3.5 font-mono text-sky-400 font-semibold">{log.id}</td>
                    <td className="p-3.5 font-bold text-white max-w-[180px] truncate">{log.appName}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {log.callerType}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-emerald-400">
                      {log.toolExecuted ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[11px]">
                          <Cpu size={11} />
                          {log.toolExecuted}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Direct LLM</span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-indigo-300">{log.latencyMs} ms</td>
                    <td className="p-3.5 font-mono text-purple-300">{log.tokensTotal || 0}</td>
                    <td className="p-3.5">
                      {log.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                          <CheckCircle2 size={11} />
                          success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-950/80 text-rose-400 border border-rose-800/80">
                          <XCircle size={11} />
                          error
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-3.5 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      >
                        <ArrowUpRight size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
          <span>Showing {filteredLogs.length} of {data?.recentLogs?.length || 0} logs</span>
          <span className="font-mono text-[11px]">Telemetry Buffer: 500 Max Entries</span>
        </div>
      </div>

      {/* Execution Trace Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Terminal size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Execution Trace Details</h3>
                  <p className="text-xs font-mono text-sky-400">{selectedLog.id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Status</span>
                  <span className={`font-bold font-mono uppercase ${selectedLog.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {selectedLog.status}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Latency</span>
                  <span className="font-bold font-mono text-indigo-300">
                    {selectedLog.latencyMs} ms
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Tokens</span>
                  <span className="font-bold font-mono text-purple-300">
                    {selectedLog.tokensTotal}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Channel</span>
                  <span className="font-bold uppercase text-slate-300">
                    {selectedLog.callerType}
                  </span>
                </div>
              </div>

              {/* Mini-App & Tool Info */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Mini-App:</span>
                  <span className="font-bold text-white">{selectedLog.appName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tool Executed:</span>
                  <span className="font-mono text-emerald-400">
                    {selectedLog.toolExecuted || 'Direct Reasoning (None)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Timestamp:</span>
                  <span className="font-mono text-slate-300">
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Query Preview */}
              {selectedLog.queryPreview && (
                <div className="space-y-1.5">
                  <span className="text-slate-400 font-semibold block">Input Query / Parameters:</span>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] leading-relaxed">
                    {selectedLog.queryPreview}
                  </div>
                </div>
              )}

              {/* Error Message if any */}
              {selectedLog.error && (
                <div className="space-y-1.5">
                  <span className="text-rose-400 font-semibold block">Error Details:</span>
                  <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/50 text-rose-300 font-mono text-[11px]">
                    {selectedLog.error}
                  </div>
                </div>
              )}

              {/* Raw JSON Trace */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">Raw Telemetry JSON:</span>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(selectedLog, null, 2))}
                    className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    {copiedPayload ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copiedPayload ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 overflow-x-auto max-h-40">
                  {JSON.stringify(selectedLog, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

