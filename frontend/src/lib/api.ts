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
const LOCAL_STORAGE_KEY = 'mignon_custom_apps_v1';

function getLocalApps(): MiniApp[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalApp(app: MiniApp) {
  try {
    const apps = getLocalApps().filter(a => a.id !== app.id);
    apps.unshift(app);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(apps));
  } catch (e) {}
}

function removeLocalApp(id: string) {
  try {
    const apps = getLocalApps().filter(a => a.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(apps));
  } catch (e) {}
}

export async function fetchApps(): Promise<MiniApp[]> {
  try {
    const res = await fetch(`${API_BASE}/apps`);
    const json = res.ok ? await res.json() : { data: [] };
    const backendApps: MiniApp[] = json.data || [];
    
    // Merge with custom apps from localStorage
    const localApps = getLocalApps();
    const appMap = new Map<string, MiniApp>();
    
    backendApps.forEach(a => appMap.set(a.id, a));
    
    // For any local app not in backend, sync to server in background
    for (const localApp of localApps) {
      if (!appMap.has(localApp.id)) {
        appMap.set(localApp.id, localApp);
        // Sync to backend so server knows about it
        fetch(`${API_BASE}/apps`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(localApp)
        }).catch(() => {});
      }
    }
    
    return Array.from(appMap.values());
  } catch (err) {
    const localApps = getLocalApps();
    if (localApps.length > 0) return localApps;
    throw err;
  }
}

export async function fetchAppById(id: string): Promise<MiniApp> {
  const localApp = getLocalApps().find(a => a.id === id);
  try {
    const res = await fetch(`${API_BASE}/apps/${id}`);
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (e) {}
  
  if (localApp) return localApp;
  throw new Error('Failed to fetch app');
}

export async function createApp(data: Partial<MiniApp>): Promise<MiniApp> {
  const res = await fetch(`${API_BASE}/apps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create app');
  const json = await res.json();
  const created = json.data;
  saveLocalApp(created);
  return created;
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
  const updated = json.data;
  saveLocalApp(updated);
  return updated;
}

export async function deleteApp(id: string): Promise<void> {
  removeLocalApp(id);
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
