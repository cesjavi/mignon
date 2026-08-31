export interface MiniAppInput {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  placeholder?: string;
  options?: string[];
  required?: boolean;
  default?: string | number;
}

export interface MiniAppTheme {
  primaryColor: string;
  mode: 'dark' | 'light';
  badge?: string;
  widgetLayout: 'card' | 'floating';
  displayMode?: 'form' | 'direct' | 'result_only';
}

export interface MiniApp {
  id: string;
  slug: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  systemPrompt: string;
  tools: string[];
  inputs: MiniAppInput[];
  theme: MiniAppTheme;
  sampleQuery?: string;
  webhookUrl?: string;
  cooldownSeconds?: number;
  maxRequestsPerSession?: number;
  quotaExceededMessage?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ApiKeyRecord {
  id: string;
  name: string;
  dailyQuota?: number;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  isRevoked: boolean;
  rawSecret?: string;
}

export interface ExecutionLog {
  id: string;
  timestamp: string;
  appId: string;
  appName: string;
  callerType: string;
  latencyMs: number;
  tokensTotal: number;
  toolExecuted: string | null;
  status: 'success' | 'error';
  queryPreview?: string;
  error?: string;
}

export interface TimelinePoint {
  timestamp: string;
  label: string;
  runs: number;
  successCount: number;
  errorCount: number;
  avgLatency: number;
  tokens: number;
}

export interface AppUsageStat {
  id: string;
  name: string;
  category: string;
  icon: string;
  runs: number;
  percentOfTotal: number;
  avgLatencyMs: number;
  totalTokens: number;
  successRate: number;
  lastActive: string;
}

export interface ToolUsageStat {
  tool: string;
  count: number;
  percent: number;
}

export interface ChannelStat {
  count: number;
  percent: number;
}

export interface LatencyDistribution {
  under500ms: number;
  between500and1000ms: number;
  between1000and2000ms: number;
  over2000ms: number;
}

export interface AnalyticsData {
  totalRuns: number;
  successfulRuns: number;
  errorRuns: number;
  successRate: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  totalTokens: number;
  avgTokensPerRun: number;
  activeAppsCount: number;
  channelBreakdown: {
    widget: ChannelStat;
    api: ChannelStat;
    studio: ChannelStat;
  };
  toolBreakdown: ToolUsageStat[];
  latencyDistribution: LatencyDistribution;
  appBreakdown: AppUsageStat[];
  timeline: TimelinePoint[];
  recentLogs: ExecutionLog[];
}

const API_BASE = '/api/v1';

export async function fetchApps(): Promise<MiniApp[]> {
  const res = await fetch(`${API_BASE}/apps`);
  if (!res.ok) throw new Error('Failed to fetch apps');
  const json = await res.json();
  return json.data;
}

export async function fetchAppById(id: string): Promise<MiniApp> {
  const res = await fetch(`${API_BASE}/apps/${id}`);
  if (!res.ok) throw new Error('Failed to fetch app');
  const json = await res.json();
  return json.data;
}

export async function createApp(data: Partial<MiniApp>): Promise<MiniApp> {
  const res = await fetch(`${API_BASE}/apps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create app');
  const json = await res.json();
  return json.data;
}

export async function generateMiniAppWithAI(prompt: string): Promise<Partial<MiniApp>> {
  const res = await fetch(`${API_BASE}/apps/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error('Failed to generate app with AI');
  const json = await res.json();
  return json.data;
}

export async function updateApp(id: string, updates: Partial<MiniApp>): Promise<MiniApp> {
  const res = await fetch(`${API_BASE}/apps/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update app');
  const json = await res.json();
  return json.data;
}

export async function deleteApp(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/apps/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete app');
}

export async function executeMiniApp(
  id: string, 
  inputs: Record<string, any>, 
  apiKey?: string, 
  sessionId?: string,
  appOverride?: Partial<MiniApp>
) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey.trim()}`;
  }
  const res = await fetch(`${API_BASE}/apps/${id}/run`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ inputs, sessionId, app: appOverride }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Execution failed');
  }
  return await res.json();
}

export async function fetchApiKeys(): Promise<ApiKeyRecord[]> {
  const res = await fetch(`${API_BASE}/keys`);
  if (!res.ok) throw new Error('Failed to fetch API keys');
  const json = await res.json();
  return json.data;
}

export async function createApiKey(name: string, dailyQuota: number = 500): Promise<ApiKeyRecord> {
  const res = await fetch(`${API_BASE}/keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, dailyQuota }),
  });
  if (!res.ok) throw new Error('Failed to create API key');
  const json = await res.json();
  return json.data;
}

export async function updateApiKey(id: string, updates: { name?: string; dailyQuota?: number }): Promise<ApiKeyRecord> {
  const res = await fetch(`${API_BASE}/keys/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update API key');
  const json = await res.json();
  return json.data;
}

export async function revokeApiKey(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/keys/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to revoke API key');
}

export async function fetchAnalytics(): Promise<AnalyticsData> {
  const res = await fetch(`${API_BASE}/analytics`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  const json = await res.json();
  return json.data;
}

export async function simulateTraffic(count: number = 5): Promise<AnalyticsData> {
  const res = await fetch(`${API_BASE}/analytics/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count }),
  });
  if (!res.ok) throw new Error('Failed to simulate traffic');
  const json = await res.json();
  return json.data;
}

export async function clearAnalytics(): Promise<AnalyticsData> {
  const res = await fetch(`${API_BASE}/analytics/clear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to clear analytics');
  const json = await res.json();
  return json.data;
}
