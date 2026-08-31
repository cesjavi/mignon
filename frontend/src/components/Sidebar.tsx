import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Code, Key, Activity, Sparkles, PlusCircle } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Mini-Apps Studio', icon: LayoutGrid, end: true },
  { to: '/embed', label: 'Embed & Widgets', icon: Sparkles },
  { to: '/api-docs', label: 'API Instructions', icon: Code },
  { to: '/keys', label: 'API Keys', icon: Key },
  { to: '/analytics', label: 'Observability & Logs', icon: Activity },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 border-r border-border bg-surface/50 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Navigation
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="pt-4 border-t border-border">
          <NavLink
            to="/editor/new"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-sky-500/20 transition-all transform hover:-translate-y-0.5"
          >
            <PlusCircle size={16} />
            <span>Create Mini-App</span>
          </NavLink>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 space-y-1">
        <div className="flex items-center justify-between text-slate-300 font-medium">
          <span>Hackathon Track</span>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">Taskmaster</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-tight">
          Google Cloud Run + Gemini 3.5 Autonomous Tool Engine
        </p>
      </div>
    </aside>
  );
};
