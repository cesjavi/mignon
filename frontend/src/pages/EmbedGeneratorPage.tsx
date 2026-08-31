import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchApps, MiniApp } from '../lib/api';
import { 
  Sparkles, Copy, Check, Code2, Globe, Monitor, 
  Smartphone, Layers, RefreshCw, ExternalLink 
} from 'lucide-react';

export const EmbedGeneratorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialAppId = searchParams.get('app');

  const [apps, setApps] = useState<MiniApp[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string>(initialAppId || '');
  const [embedMode, setEmbedMode] = useState<'inline' | 'floating' | 'iframe' | 'react'>('inline');
  const [displayMode, setDisplayMode] = useState<'form' | 'direct' | 'result_only'>('form');
  const [copied, setCopied] = useState(false);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');

  const widgetPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadApps();
  }, []);

  async function loadApps() {
    try {
      const data = await fetchApps();
      setApps(data);
      if (data.length > 0 && !selectedAppId) {
        setSelectedAppId(data[0].id);
        setDisplayMode(data[0].theme?.displayMode || (data[0].slug?.includes('fortune') ? 'direct' : 'form'));
      }
    } catch (err) {
      console.error(err);
    }
  }

  const selectedApp = apps.find((a) => a.id === selectedAppId);

  useEffect(() => {
    if (selectedApp) {
      setDisplayMode(selectedApp.theme?.displayMode || (selectedApp.slug?.includes('fortune') ? 'direct' : 'form'));
    }
  }, [selectedApp]);

  // Mount/Refresh the embed widget in the preview box
  useEffect(() => {
    if (!widgetPreviewRef.current || !selectedApp) return;

    widgetPreviewRef.current.innerHTML = '';
    const widgetDiv = document.createElement('div');
    widgetDiv.setAttribute('data-mignon-app', selectedApp.id);
    widgetDiv.setAttribute('data-theme', themeMode);
    widgetDiv.setAttribute('data-display', displayMode);
    widgetDiv.setAttribute('data-api-url', window.location.origin);
    widgetPreviewRef.current.appendChild(widgetDiv);

    if ((window as any).Mignon) {
      (window as any).Mignon.init();
    } else {
      const script = document.createElement('script');
      script.src = '/widget.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [selectedApp, themeMode, embedMode, displayMode]);

  function getCodeSnippet(): string {
    const origin = window.location.origin;
    const appId = selectedApp?.id || 'app_flight_scout';
    const displayAttr = displayMode === 'direct' ? ' data-display="direct"' : '';

    switch (embedMode) {
      case 'inline':
        return `<!-- Place this anywhere in your HTML <body> -->\n<div data-mignon-app="${appId}" data-theme="${themeMode}"${displayAttr}></div>\n<script src="${origin}/widget.js" async></script>`;
      case 'floating':
        return `<!-- Place this once before the closing </body> tag -->\n<script src="${origin}/widget.js" data-app-id="${appId}" data-mode="floating" async></script>`;
      case 'iframe':
        return `<iframe \n  src="${origin}/embed-frame.html?app=${appId}&theme=${themeMode}&display=${displayMode}" \n  width="100%" \n  height="480" \n  frameborder="0" \n  style="border-radius: 16px; border: 1px solid #1e293b;"\n></iframe>`;
      case 'react':
        return `import { useEffect } from 'react';\n\nexport function MignonWidget() {\n  useEffect(() => {\n    const s = document.createElement('script');\n    s.src = '${origin}/widget.js';\n    s.async = true;\n    document.body.appendChild(s);\n    return () => { s.remove(); };\n  }, []);\n\n  return <div data-mignon-app="${appId}" data-theme="${themeMode}"${displayAttr} />;\n}`;
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Embed & Widget Generator</h1>
        <p className="text-slate-400 text-sm mt-1">
          Generate embeddable web artifacts and drop AI Mini-Apps into Webflow, WordPress, Shopify, Next.js, or plain HTML.
        </p>
      </div>

      {/* Selector & Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Options (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                1. Select Mini-App
              </label>
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-sky-500"
              >
                {apps.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name} ({app.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                2. Embed Style & Delivery
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'inline', label: 'Inline Card', icon: Monitor },
                  { id: 'floating', label: 'Floating Bubble', icon: Smartphone },
                  { id: 'iframe', label: 'Iframe Sandbox', icon: Globe },
                  { id: 'react', label: 'React / Next.js', icon: Code2 },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setEmbedMode(tab.id as any)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                        embedMode === tab.id
                          ? 'bg-sky-500/15 border-sky-500/40 text-sky-300 shadow-sm'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                3. Presentation Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDisplayMode('form')}
                  className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                    displayMode === 'form'
                      ? 'bg-sky-500/15 border-sky-500/40 text-sky-300'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Form Mode
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayMode('direct')}
                  className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                    displayMode === 'direct'
                      ? 'bg-sky-500/15 border-sky-500/40 text-sky-300'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Direct Card
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayMode('result_only')}
                  className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                    displayMode === 'result_only'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Pure Result ✨
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                {displayMode === 'result_only' 
                  ? 'Pure Minimalist Mode: Only the quote or output is rendered directly, with zero card headers or chrome.' 
                  : displayMode === 'direct' 
                  ? 'Direct Card: Shows card header, direct quote, next button and actions.' 
                  : 'Form Mode: Asks for inputs and has an Execute button.'}
              </p>
            </div>

            {/* Generated Code Box */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Integration Snippet</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Snippet'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-sky-300 overflow-x-auto leading-relaxed max-h-52">
                <code>{getCodeSnippet()}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Right Live Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <h2 className="text-sm font-bold text-slate-200">Live Web Widget Preview</h2>
            </div>
            <a
              href="/demo.html"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 hover:underline"
            >
              <span>Open in standalone demo page</span>
              <ExternalLink size={13} />
            </a>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-xl min-h-[460px] flex items-center justify-center">
            <div className="w-full max-w-md" ref={widgetPreviewRef}>
              {/* Mounted via shadow DOM */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
