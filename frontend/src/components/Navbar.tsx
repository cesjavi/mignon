import React from 'react';
import { Sparkles, Cpu, Globe, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onReplayIntro?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onReplayIntro }) => {
  return (
    <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-sky-400/40 p-0.5 shadow-md shadow-sky-500/20 group-hover:scale-105 group-hover:border-sky-400 transition-all overflow-hidden relative">
            <img
              src="/mignon-logo.jpg"
              alt="Mignon AI Bread"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-300 bg-clip-text text-transparent">
              MIGNON
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded ml-2 border border-sky-500/20">
              Agent Engine
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {onReplayIntro && (
          <button
            onClick={onReplayIntro}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800/60 border border-slate-800 transition-colors"
            title="Replay Splash Intro Animation"
          >
            <Sparkles size={13} className="text-amber-400" />
            <span className="hidden sm:inline">Intro</span>
          </button>
        )}

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <Cpu size={14} className="text-sky-400" />
          <span>Gemini 3.5 Flash Tool Runtime</span>
        </div>

        <a
          href="/demo.html"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs font-medium bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Globe size={14} />
          <span>Live Embed Demo</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </header>
  );
};
