import React from 'react';
import { 
  Crown, 
  Radar, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  DollarSign, 
  TrendingUp, 
  Lock, 
  Sparkles, 
  LogIn, 
  Mail, 
  Send,
  Database,
  Zap
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'signup' | 'verify-email' | 'forgot-password') => void;
  onEnterDemo?: () => void;
  onOpenClientPayment?: () => void;
  onOpenClientContact?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onEnterDemo }) => {
  // Launching interactive product tour
  const handleLaunchTour = () => {
    if (onEnterDemo) {
      onEnterDemo();
    } else {
      onOpenAuth('signup');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center selection:bg-[#FFD700] selection:text-black">
      
      {/* Hero Section */}
      <main className="w-full max-w-5xl mx-auto px-4 pt-8 pb-8 sm:pt-14 sm:pb-12 flex flex-col items-center text-center">
        
        {/* Subtle Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-[#FFD700]/30 text-xs font-bold text-[#FFD700] mb-6 shadow-sm">
          <Radar className="w-4 h-4 text-[#FFD700] animate-pulse" />
          <span>REVENUE RADAR AUTOPILOT • ENTERPRISE B2B</span>
        </div>

        {/* Short, Punchy, Tailored Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white max-w-4xl leading-[1.08]">
          Stop Revenue Leaks <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-amber-300 to-[#FFD700]">
            On Autopilot.
          </span>
        </h1>

        {/* Clear, Understandable Subtitle */}
        <p className="mt-5 text-base sm:text-xl text-zinc-400 max-w-2xl leading-relaxed font-normal">
          PRIME AI watches your accounts 24/7, flags silent churn risks, and recovers overdue cash — with human approval on every action.
        </p>

        {/* 3 Core Buttons: Sign Up, Interactive Tour, Sign In */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-2xl">
          <button
            onClick={() => onOpenAuth('signup')}
            className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[#FFD700] via-amber-300 to-[#FFD700] text-black font-black text-sm rounded-2xl shadow-[0_0_30px_rgba(255,215,0,0.35)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Crown className="w-4 h-4 text-black" />
            <span>Start Free 14-Day Pilot</span>
          </button>

          <button
            onClick={handleLaunchTour}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#FFD700]/10 hover:bg-[#FFD700]/20 text-[#FFD700] font-bold text-sm rounded-2xl border border-[#FFD700]/40 shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            title="Explore live interactive workspace tour"
          >
            <Sparkles className="w-4 h-4 text-[#FFD700]" />
            <span>Interactive Product Tour</span>
          </button>

          <button
            onClick={() => onOpenAuth('login')}
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-zinc-400" />
            <span>Sign In</span>
          </button>
        </div>

        {/* Trust Line - Reassurance */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>No Credit Card Required • Instant Enterprise Workspace • SOC-2 Type II Certified Isolation</span>
        </div>
      </main>

      {/* Enterprise Social Proof & Stack Strip */}
      <section className="w-full max-w-5xl mx-auto px-4 pb-10">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0F0F0F] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-zinc-400">
              TRUSTED ENTERPRISE STACK SYNC
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-zinc-400">
            <span className="px-3 py-1 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-1.5 font-medium">
              <Zap className="w-3.5 h-3.5 text-[#FFD700]" /> Stripe Billing Webhooks
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-1.5 font-medium">
              <Database className="w-3.5 h-3.5 text-emerald-400" /> HubSpot &amp; Salesforce
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-1.5 font-medium">
              <Mail className="w-3.5 h-3.5 text-blue-400" /> Google Workspace &amp; 365
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-1.5 font-medium">
              <Lock className="w-3.5 h-3.5 text-[#FFD700]" /> SOC-2 Type II
            </span>
          </div>
        </div>
      </section>

      {/* The ONE Feature Showcase: Revenue Radar */}
      <section className="w-full max-w-5xl mx-auto px-4 pb-20">
        
        {/* Feature Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700]">
              <Radar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Revenue Radar Sentry</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </h2>
              <p className="text-xs text-zinc-400">Continuous AI deal risk telemetry & autonomous revenue protection</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#FFD700] bg-[#FFD700]/10 border border-[#FFD700]/30 px-3 py-1 rounded-xl font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FFD700]" />
            <span>Human Approval Required On Every Action</span>
          </div>
        </div>

        {/* Interactive Radar Sentry Container */}
        <div 
          className="relative w-full rounded-3xl bg-[#0E0E0E] border border-white/10 hover:border-[#FFD700]/50 p-5 sm:p-7 shadow-2xl transition-all group"
        >
          {/* Top Sentry Status Bar with Tour & Signup */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-emerald-400">RADAR SENTRY LIVE TELEMETRY</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLaunchTour}
                className="px-3.5 py-1.5 rounded-xl bg-[#FFD700]/10 hover:bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explore Live Product Tour</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('signup')}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FFD700] to-amber-400 text-black text-xs font-black shadow hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-black" />
                <span>Start Free 14-Day Pilot</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] uppercase font-bold text-zinc-400">At-Risk Pipeline</span>
              <p className="text-lg sm:text-xl font-extrabold text-white mt-1">$148,000</p>
              <span className="text-[10px] text-amber-400 font-mono">3 Accounts Flagged</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Churn Rescued</span>
              <p className="text-lg sm:text-xl font-extrabold text-emerald-400 mt-1">+$48,000</p>
              <span className="text-[10px] text-emerald-400/80 font-mono">100% Retained</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Dunning Recovered</span>
              <p className="text-lg sm:text-xl font-extrabold text-[#FFD700] mt-1">+$24,500</p>
              <span className="text-[10px] text-[#FFD700]/80 font-mono">2 Invoices Settled</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Expansion Pipeline</span>
              <p className="text-lg sm:text-xl font-extrabold text-blue-400 mt-1">+$76,000</p>
              <span className="text-[10px] text-blue-400/80 font-mono">Seat Caps Approached</span>
            </div>
          </div>

          {/* 3 Real Telemetry Action Items */}
          <div className="space-y-3">
            
            {/* 1. At-Risk Churn Rescue */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/20 via-zinc-900/40 to-transparent border border-red-500/20 hover:border-red-500/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Stellar Dynamics Corp</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-mono font-bold">
                      76% Churn Risk
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">Silent 14 Days</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    $78k ARR Tier-1 contract. Support ticket unresolved. AI drafted SLA concession playbook.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleLaunchTour}
                  className="w-full md:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#FFD700] to-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Authorize Churn Rescue</span>
                </button>
              </div>
            </div>

            {/* 2. Dunning & Overdue Cash Recovery */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/20 via-zinc-900/40 to-transparent border border-amber-500/20 hover:border-amber-500/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Apex Logistics International</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-bold">
                      $12,500 Past Due
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">18 Days Overdue</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Invoice #INV-2041 unpaid. AI drafted one-click instant payment link reminder.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleLaunchTour}
                  className="w-full md:w-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 border border-white/10 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-[#FFD700]" />
                  <span>Deploy Recovery Notice</span>
                </button>
              </div>
            </div>

            {/* 3. Product-Led Expansion (PQL) */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/20 via-zinc-900/40 to-transparent border border-blue-500/20 hover:border-blue-500/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">NovaStack Technologies</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-bold">
                      +$36k ARR Upsell
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">14/15 Seats Used</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Client approached 93% seat limit. AI generated Enterprise expansion proposal.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleLaunchTour}
                  className="w-full md:w-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 border border-white/10 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Send Expansion Offer</span>
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Callout Overlay */}
          <div className="mt-6 pt-5 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Lock className="w-3.5 h-3.5 text-[#FFD700]" />
              <span>Multi-Tenant Enterprise Security • AES-256 Encrypted • SOC-2 Type II Standards</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleLaunchTour}
                className="text-xs font-bold text-[#FFD700] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Launch Live Workspace Tour</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-zinc-600">|</span>
              <button
                type="button"
                onClick={() => onOpenAuth('signup')}
                className="text-xs font-bold text-white hover:text-[#FFD700] transition-colors cursor-pointer"
              >
                Create Enterprise Workspace
              </button>
            </div>
          </div>
        </div>

      </section>

      {/* Clean Footer */}
      <footer className="w-full border-t border-white/5 py-8 text-center text-xs text-zinc-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-[#FFD700]" />
            <span className="text-zinc-400 font-bold">PRIME AI</span>
            <span>— Autonomous CEO Command Center</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLaunchTour}
              className="text-[#FFD700] hover:underline transition-colors cursor-pointer font-semibold"
            >
              Product Tour
            </button>
            <button
              onClick={() => onOpenAuth('login')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="px-3.5 py-1.5 rounded-xl bg-[#FFD700] text-black hover:brightness-110 transition-colors font-bold cursor-pointer shadow-sm"
            >
              Start Free 14-Day Pilot
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};
