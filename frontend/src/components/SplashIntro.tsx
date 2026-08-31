import React, { useState, useEffect } from 'react';
import { Sparkles, Cpu, Shield, Zap, ArrowRight, Play } from 'lucide-react';

interface SplashIntroProps {
  onComplete: () => void;
}

export const SplashIntro: React.FC<SplashIntroProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusStep, setStatusStep] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const statusMessages = [
    'Initializing Google Gemini 3.5 Flash Tool Runtime...',
    'Mounting Shadow DOM Isolation Engine & Widgets...',
    'Connecting SHA-256 Secure API Gateway & Rate Limiters...',
    'Loading Autonomous Mini-Apps Fleet...',
    'Mignon Studio Ready.'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const next = prev + 2.5;
        if (next > 20 && next <= 45) setStatusStep(1);
        else if (next > 45 && next <= 70) setStatusStep(2);
        else if (next > 70 && next <= 90) setStatusStep(3);
        else if (next > 90) setStatusStep(4);
        return next;
      });
    }, 45);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const exitTimer = setTimeout(() => {
        handleEnter();
      }, 700);
      return () => clearTimeout(exitTimer);
    }
  }, [progress]);

  function handleEnter() {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 500);
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#030712] flex flex-col items-center justify-center p-6 text-white overflow-hidden transition-all duration-500 ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />

      <div className="relative z-10 flex flex-col items-center max-w-lg w-full text-center space-y-7">
        {/* Glowing Logo Container */}
        <div className="relative group cursor-pointer" onClick={handleEnter}>
          {/* Animated Glow Ring */}
          <div className="absolute -inset-3 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 animate-tilt transition duration-500" />
          
          <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-3xl bg-slate-950 border-2 border-cyan-400/40 p-2 shadow-2xl flex items-center justify-center overflow-hidden">
            <img
              src="/mignon-logo.jpg"
              alt="Mignon AI Bread Logo"
              className="w-full h-full object-cover rounded-2xl drop-shadow-[0_0_20px_rgba(56,189,248,0.6)] transform group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Floating Sparkle Badge */}
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-sky-500 to-indigo-600 p-2 rounded-xl border border-sky-300/40 shadow-lg text-white">
            <Sparkles size={16} className="animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        </div>

        {/* Brand Name & Tagline */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-400 bg-clip-text text-transparent">
              MIGNON
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/30">
              v1.0 Live
            </span>
          </div>
          <p className="text-sm md:text-base text-slate-300 font-medium leading-relaxed max-w-md">
            Autonomous AI Mini-Apps & Embeddable Agent Widget Engine
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300">
            <Cpu size={13} className="text-sky-400" />
            <span>Gemini 3.5 Flash</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300">
            <Zap size={13} className="text-amber-400" />
            <span>1-Line Web Components</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300">
            <Shield size={13} className="text-emerald-400" />
            <span>SHA-256 Gateways</span>
          </span>
        </div>

        {/* Loading Progress & Dynamic Terminal Log */}
        <div className="w-full space-y-3 pt-2">
          <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-75 shadow-[0_0_12px_rgba(56,189,248,0.7)]"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span className="text-slate-300 truncate max-w-[280px] md:max-w-none text-left">
                {statusMessages[statusStep]}
              </span>
            </div>
            <span className="font-bold text-sky-400">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Skip / Enter Action */}
        <div className="pt-2">
          <button
            onClick={handleEnter}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <span>Enter Mignon Studio</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
