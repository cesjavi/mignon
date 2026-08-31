import React, { useState } from 'react';
import { 
  Globe, LayoutDashboard, Github, Sparkles, 
  ExternalLink, Copy, Check, Link2, ShieldCheck, Cpu 
} from 'lucide-react';

interface ProjectLinkItem {
  label: string;
  url: string;
  description: string;
  badge: string;
  icon: React.ElementType;
  primary?: boolean;
}

const PROJECT_LINKS: ProjectLinkItem[] = [
  {
    label: 'Live App & Studio',
    url: 'https://mignon-platform-526192292529.us-central1.run.app/',
    description: 'Main web studio to build, configure, test and manage autonomous Gemini Mini-Apps.',
    badge: 'Production Cloud Run',
    icon: Globe,
    primary: true,
  },
  {
    label: 'Interactive Widgets Showcase',
    url: 'https://mignon-platform-526192292529.us-central1.run.app/demo.html',
    description: 'Live external website demonstration embedding Mignon Shadow DOM widgets with voice TTS & anti-spam cooldown.',
    badge: 'Live Showcase',
    icon: Sparkles,
  },
  {
    label: 'Real-time Observability Dashboard',
    url: 'https://mignon-platform-526192292529.us-central1.run.app/analytics',
    description: 'Live telemetry, sub-second latency tracking, Gemini token usage metrics, and audit trace inspector.',
    badge: 'Telemetry & Logs',
    icon: LayoutDashboard,
  },
  {
    label: 'GitHub Repository',
    url: 'https://github.com/cesjavi/mignon',
    description: 'Full open-source codebase, Docker container configurations, API gateway, and hackathon documentation.',
    badge: 'Open Source',
    icon: Github,
  },
];

export const ProjectLinksPage: React.FC = () => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  function handleCopy(url: string) {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  }

  function handleCopyAllMarkdown() {
    const markdown = `| Resource | Link / URL |\n| :--- | :--- |\n| **Live App & Studio** | [https://mignon-platform-526192292529.us-central1.run.app/](https://mignon-platform-526192292529.us-central1.run.app/) |\n| **Interactive Widgets Showcase** | [https://mignon-platform-526192292529.us-central1.run.app/demo.html](https://mignon-platform-526192292529.us-central1.run.app/demo.html) |\n| **Real-time Observability Dashboard** | [https://mignon-platform-526192292529.us-central1.run.app/analytics](https://mignon-platform-526192292529.us-central1.run.app/analytics) |\n| **GitHub Repository** | [https://github.com/cesjavi/mignon](https://github.com/cesjavi/mignon) |`;
    navigator.clipboard.writeText(markdown);
    setCopiedUrl('markdown_table');
    setTimeout(() => setCopiedUrl(null), 2000);
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
            <Link2 size={13} />
            <span>Official Submission & Project Links</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Project Links & Resources
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Direct access URLs for hackathon evaluators, developers, and live system demonstration.
          </p>

          <div className="pt-2">
            <button
              onClick={handleCopyAllMarkdown}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
            >
              {copiedUrl === 'markdown_table' ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied Markdown Table!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Table as Markdown</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PROJECT_LINKS.map((item) => {
          const Icon = item.icon;
          const isCopied = copiedUrl === item.url;
          return (
            <div
              key={item.label}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 ${
                item.primary
                  ? 'bg-slate-900/90 border-sky-500/40 shadow-lg shadow-sky-500/5'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 text-sky-400 flex items-center justify-center">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h2 className="font-bold text-base text-white">{item.label}</h2>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-400/90 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                        {item.badge}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.description}
                </p>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-sky-300 truncate select-all">
                    {item.url}
                  </span>
                  <button
                    onClick={() => handleCopy(item.url)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
                    title="Copy URL"
                  >
                    {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              <div className="pt-4 mt-2 flex items-center justify-end gap-2 border-t border-slate-800/60">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-semibold transition-colors"
                >
                  <span>Open Link</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Structured Table View */}
      <section className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-sky-400" />
            <h2 className="font-bold text-base text-white">Direct Resources Table</h2>
          </div>
          <span className="text-xs text-slate-400">4 Active Endpoints</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Link / Label</th>
                <th className="py-3 px-4">URL</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {PROJECT_LINKS.map((link) => {
                const isCopied = copiedUrl === link.url;
                return (
                  <tr key={link.label} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                      <ShieldCheck size={14} className="text-emerald-400" />
                      <span>{link.label}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-sky-300">
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="hover:underline hover:text-sky-200"
                      >
                        {link.url}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(link.url)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          title="Copy Link"
                        >
                          {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        </button>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 transition-colors"
                          title="Open Link"
                        >
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
