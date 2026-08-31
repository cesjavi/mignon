import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchApps, fetchApiKeys, executeMiniApp, MiniApp, ApiKeyRecord } from '../lib/api';
import { 
  Code2, Key, Globe, Copy, Check, Play, 
  Terminal, Layers, Sparkles, BookOpen, AlertCircle 
} from 'lucide-react';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
      title="Copy to clipboard"
    >
      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
    </button>
  );
}

export const ApiInstructionsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialAppId = searchParams.get('app');

  const [apps, setApps] = useState<MiniApp[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string>(initialAppId || '');
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [activeLang, setActiveLang] = useState<'curl' | 'javascript' | 'python' | 'typescript'>('curl');

  // Try-It state
  const [tryInputs, setTryInputs] = useState<string>('{\n  "origin": "Buenos Aires (EZE)",\n  "destination": "Madrid (MAD)"\n}');
  const [tryRunning, setTryRunning] = useState(false);
  const [tryResponse, setTryResponse] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [appsData, keysData] = await Promise.all([fetchApps(), fetchApiKeys()]);
      setApps(appsData);
      setKeys(keysData);
      if (appsData.length > 0 && !selectedAppId) {
        setSelectedAppId(appsData[0].id);
        updateDefaultInputs(appsData[0]);
      }
      if (keysData.length > 0) {
        setSelectedKey(keysData[0].prefix);
      }
    } catch (err) {
      console.error(err);
    }
  }

  function handleAppChange(appId: string) {
    setSelectedAppId(appId);
    const app = apps.find(a => a.id === appId);
    if (app) {
      updateDefaultInputs(app);
    }
  }

  function updateDefaultInputs(app: MiniApp) {
    const obj: Record<string, any> = {};
    app.inputs?.forEach(inp => {
      obj[inp.id] = inp.default || '';
    });
    setTryInputs(JSON.stringify(obj, null, 2));
  }

  const selectedApp = apps.find(a => a.id === selectedAppId);
  const origin = window.location.origin;
  const targetKey = selectedKey || 'mgn_live_9f8e7d6c5b4a3...';

  function getCodeSnippet(): string {
    const appId = selectedApp?.id || 'app_flight_scout';
    const endpoint = `${origin}/api/v1/apps/${appId}/run`;

    switch (activeLang) {
      case 'curl':
        return `curl -X POST "${endpoint}" \\
  -H "Authorization: Bearer ${targetKey}" \\
  -H "Content-Type: application/json" \\
  -d '${tryInputs.replace(/\n/g, '')}'`;

      case 'javascript':
        return `const response = await fetch("${endpoint}", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ${targetKey}",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    inputs: ${tryInputs.split('\n').join('\n    ')}
  })
});

const data = await response.json();
console.log("Agent Markdown:", data.result.markdown);
console.log("Tool Data:", data.result.tool_data);`;

      case 'python':
        return `import requests

url = "${endpoint}"
headers = {
    "Authorization": "Bearer ${targetKey}",
    "Content-Type": "application/json"
}
payload = {
    "inputs": ${tryInputs.split('\n').join('\n    ')}
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()
print("Gemini Output:", data["result"]["markdown"])`;

      case 'typescript':
        return `import { MignonClient } from '@mignon/agent-sdk';

const client = new MignonClient({ apiKey: '${targetKey}' });

const run = await client.apps.run('${appId}', {
  inputs: ${tryInputs.split('\n').join('\n  ')}
});

console.log(run.result.markdown);`;
    }
  }

  async function handleExecuteTryIt() {
    setTryRunning(true);
    setTryResponse(null);

    try {
      const parsed = JSON.parse(tryInputs);
      const res = await executeMiniApp(selectedAppId, parsed);
      setTryResponse(res);
    } catch (err: any) {
      setTryResponse({ error: err.message });
    } finally {
      setTryRunning(false);
    }
  }

  return (
    <div className="space-y-10 max-w-5xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-3">
          <BookOpen size={13} />
          <span>Developer API Reference & Integration Guide</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">API Instructions & Execution Hub</h1>
        <p className="text-slate-400 text-sm mt-2 leading-relaxed">
          Every Mini-App registered in Mignon automatically exposes a secured REST API endpoint that triggers the full Gemini 3.5 Flash Tool Reasoning Loop.
        </p>
      </div>

      {/* Step 1: Authentication */}
      <section className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
            1
          </div>
          <div>
            <h2 className="font-bold text-base text-white">Authentication & Headers</h2>
            <p className="text-xs text-slate-400">All programmatic requests must include a Bearer API Key header.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="font-mono text-sky-400">Authorization: Bearer &lt;API_KEY&gt;</span>
            <p className="text-slate-400">Your workspace API key. Keys start with <code className="text-slate-200">mgn_live_...</code></p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="font-mono text-sky-400">Content-Type: application/json</span>
            <p className="text-slate-400">Required for POST requests containing input parameters</p>
          </div>
        </div>
      </section>

      {/* Step 2: Code Snippets Builder */}
      <section className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Endpoint & Code Examples</h2>
              <p className="text-xs text-slate-400">Select language and inspect the generated code</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedAppId}
              onChange={(e) => handleAppChange(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
            >
              {apps.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['curl', 'javascript', 'python', 'typescript'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeLang === lang
                    ? 'bg-sky-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <CopyButton text={getCodeSnippet()} />
        </div>

        {/* Code View */}
        <div className="relative group">
          <pre className="p-5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-sky-200 overflow-x-auto leading-relaxed">
            <code>{getCodeSnippet()}</code>
          </pre>
        </div>
      </section>

      {/* Step 3: Interactive Try-It Console */}
      <section className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Live "Try-It" API Console</h2>
              <p className="text-xs text-slate-400">Execute API calls and inspect raw responses in real-time</p>
            </div>
          </div>

          <button
            onClick={handleExecuteTryIt}
            disabled={tryRunning}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md disabled:opacity-50"
          >
            <Play size={13} fill="currentColor" />
            <span>{tryRunning ? 'Executing...' : 'Send API Request'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Request Body (JSON)</label>
            <textarea
              value={tryInputs}
              onChange={(e) => setTryInputs(e.target.value)}
              rows={8}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-sky-300 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Response (JSON)</label>
            <pre className="w-full h-44 bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-slate-200 overflow-y-auto leading-relaxed">
              {tryResponse ? JSON.stringify(tryResponse, null, 2) : '// Click "Send API Request" to test live endpoint'}
            </pre>
          </div>
        </div>
      </section>

      {/* Official Project Links */}
      <section className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-sky-400" />
            <h2 className="font-bold text-base text-white">Project Links & Resources</h2>
          </div>
          <span className="text-xs text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-md border border-sky-500/20 font-medium">Official Endpoints</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Link / Label</th>
                <th className="py-2.5 px-3">URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold text-white">Live App & Studio</td>
                <td className="py-2.5 px-3 text-sky-400"><a href="https://mignon-platform-526192292529.us-central1.run.app/" target="_blank" rel="noreferrer" className="hover:underline">https://mignon-platform-526192292529.us-central1.run.app/</a></td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold text-white">Interactive Widgets Showcase</td>
                <td className="py-2.5 px-3 text-sky-400"><a href="https://mignon-platform-526192292529.us-central1.run.app/demo.html" target="_blank" rel="noreferrer" className="hover:underline">https://mignon-platform-526192292529.us-central1.run.app/demo.html</a></td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold text-white">Real-time Observability Dashboard</td>
                <td className="py-2.5 px-3 text-sky-400"><a href="https://mignon-platform-526192292529.us-central1.run.app/analytics" target="_blank" rel="noreferrer" className="hover:underline">https://mignon-platform-526192292529.us-central1.run.app/analytics</a></td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold text-white">GitHub Repository</td>
                <td className="py-2.5 px-3 text-sky-400"><a href="https://github.com/cesjavi/mignon" target="_blank" rel="noreferrer" className="hover:underline">https://github.com/cesjavi/mignon</a></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
