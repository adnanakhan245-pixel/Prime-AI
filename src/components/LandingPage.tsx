import React, { useRef, useState, useEffect } from 'react';
import { 
  Crown, 
  Radar, 
  RotateCcw
} from 'lucide-react';
import { RevenueRadarView } from './RevenueRadarView';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'signup' | 'verify-email' | 'forgot-password') => void;
  onEnterDemo?: () => void;
  onOpenClientPayment?: () => void;
  onOpenClientContact?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = () => {
  const radarSectionRef = useRef<HTMLDivElement>(null);
  const [demoUndoActive, setDemoUndoActive] = useState(false);
  const [undoSecondsLeft, setUndoSecondsLeft] = useState(120);

  // 2-minute countdown timer for the demo undo
  useEffect(() => {
    if (!demoUndoActive) return;
    const timer = setInterval(() => {
      setUndoSecondsLeft(prev => {
        if (prev <= 1) {
          setDemoUndoActive(false);
          return 120;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [demoUndoActive]);

  const handleTryRadar = () => {
    // Activate 2-minute undo demo
    setDemoUndoActive(true);
    setUndoSecondsLeft(120);
    // Smooth scroll to the Radar screen below
    radarSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleUndoDemo = () => {
    setDemoUndoActive(false);
    setUndoSecondsLeft(120);
  };

  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center">
      {/* Top Hero Section */}
      <section className="w-full max-w-5xl mx-auto px-4 pt-16 pb-12 sm:pt-24 sm:pb-16 flex flex-col items-center text-center">
        {/* Top: PRIME AI */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 mb-8 shadow-sm">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#B8860B] flex items-center justify-center text-black">
            <Crown className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-black tracking-wider text-white">
            PRIME <span className="text-[#FFD700]">AI</span>
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white max-w-4xl leading-[1.08]">
          Your business on <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-amber-300 to-[#FFD700]">Autopilot</span>
        </h1>

        {/* Subheadline */}
        <p className="mt-5 text-base sm:text-xl text-zinc-400 max-w-2xl leading-relaxed font-normal">
          We watch your inbox, find risks, and never act without your approval.
        </p>

        {/* One button only: [Try Radar - 30 Second Demo] */}
        <div className="mt-8">
          <button
            onClick={handleTryRadar}
            className="px-8 py-4 bg-gradient-to-r from-[#FFD700] via-amber-300 to-[#FFD700] text-black font-black text-sm sm:text-base rounded-2xl shadow-[0_0_35px_rgba(255,215,0,0.35)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer"
          >
            <Radar className="w-5 h-5 text-black" />
            <span>Try Radar - 30 Second Demo</span>
          </button>
        </div>
      </section>

      {/* Below: Show only Radar screen with 2-minute undo */}
      <section ref={radarSectionRef} className="w-full max-w-7xl mx-auto px-4 pb-24">
        {/* 2-Minute Undo Demo Alert Banner */}
        {demoUndoActive && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-transparent border border-[#FFD700]/50 shadow-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFD700]/20 border border-[#FFD700]/40 flex items-center justify-center text-[#FFD700] shrink-0">
                <RotateCcw className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2 font-bold text-white text-xs sm:text-sm">
                  <span>⚡ 2-Minute Undo Window Active</span>
                  <span className="font-mono text-[#FFD700] bg-[#FFD700]/10 px-2 py-0.5 rounded-full border border-[#FFD700]/30 text-xs">
                    {undoSecondsLeft}s remaining
                  </span>
                </div>
                <p className="text-xs text-white/70 mt-0.5">
                  Action approved: Churn rescue email drafted for Acme Corp. You have 2 minutes to undo before execution.
                </p>
              </div>
            </div>

            <button
              onClick={handleUndoDemo}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FFD700] to-amber-500 text-black font-extrabold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo Action</span>
            </button>
          </div>
        )}

        {/* The Radar screen */}
        <div className="w-full rounded-3xl bg-[#0E0E0E] border border-white/10 p-4 sm:p-6 lg:p-8 shadow-2xl">
          <RevenueRadarView />
        </div>
      </section>
    </div>
  );
};
