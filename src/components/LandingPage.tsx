import React, { useState } from 'react';
import { 
  Crown, 
  Inbox, 
  FileText, 
  BrainCircuit, 
  Check, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Sparkles,
  Building2,
  Lock,
  ChevronRight,
  Calculator,
  ArrowUpRight,
  CreditCard,
  Mail
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'signup' | 'verify-email' | 'forgot-password') => void;
  onEnterDemo?: () => void;
  onOpenClientPayment?: () => void;
  onOpenClientContact?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onOpenAuth, 
  onEnterDemo,
  onOpenClientPayment,
  onOpenClientContact
}) => {
  const [selectedPillar, setSelectedPillar] = useState<'inbox' | 'docs' | 'brain'>('inbox');

  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] text-white">
      {/* Background ambient lighting */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-[#FFD700]/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* Top Announcement Bar */}
        <div className="bg-gradient-to-r from-amber-500/15 via-[#FFD700]/10 to-amber-500/15 border-b border-[#FFD700]/25 py-2 px-4 text-center text-xs font-semibold text-[#FFD700] flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#FFD700] animate-pulse" />
            <span>Instant Sandbox Access • No registration or credit card required:</span>
          </div>
          <button 
            onClick={onEnterDemo || (() => onOpenAuth('signup'))} 
            className="px-3 py-0.5 rounded-full bg-[#FFD700] text-black text-[11px] font-black hover:bg-white transition-all cursor-pointer shadow-sm flex items-center gap-1"
          >
            <span>Launch Live Workspace →</span>
          </button>
        </div>

        {/* HERO SECTION */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-14 text-center">
          {/* Executive Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900/90 border border-[#FFD700]/30 text-amber-300 text-xs font-medium uppercase tracking-widest mb-6 shadow-sm">
            <Crown className="w-3.5 h-3.5 text-[#FFD700]" />
            <span>Autonomous Operations for Founders &amp; C-Suite</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Reclaim 223 Hours/Month. <br />
            <span className="gold-gradient-text font-serif">Your Autonomous AI Executive Fleet.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto font-normal leading-relaxed">
            PRIME AI handles executive busywork in real time: inbox triage, contract risk audits, sales pipeline coaching, and automated board packs.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenAuth('signup')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-extrabold text-black bg-gradient-to-r from-[#FFD700] via-amber-300 to-[#FFC700] hover:brightness-110 shadow-[0_0_30px_rgba(255,215,0,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer group active:scale-95"
            >
              <Crown className="w-4 h-4 text-black" />
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            {onEnterDemo && (
              <button
                onClick={onEnterDemo}
                className="w-full sm:w-auto px-6 py-4 rounded-xl text-sm font-bold text-white bg-zinc-900/90 hover:bg-zinc-800 border border-[#FFD700]/30 hover:border-[#FFD700]/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#FFD700]" />
                <span>Explore Live Demo Sandbox</span>
              </button>
            )}

            <button
              onClick={() => onOpenAuth('login')}
              className="w-full sm:w-auto px-5 py-4 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white hover:bg-white/5 border border-zinc-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Sign In</span>
            </button>
          </div>

          {/* Client Direct Self-Service Portal (Pay & Email with Zero Admin Waiting) */}
          <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-neutral-900/90 via-zinc-900/95 to-neutral-900/90 border border-white/10 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-left shadow-xl">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Client Self-Service Portal</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  24/7 Instant Access
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Are you a client? Settle your invoice online instantly or send an email inquiry directly with zero admin gating.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={onOpenClientPayment}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#FFD700]/15 hover:bg-[#FFD700] text-[#FFD700] hover:text-black border border-[#FFD700]/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pay Invoice</span>
              </button>
              <button
                type="button"
                onClick={onOpenClientContact}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-blue-500/15 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </button>
            </div>
          </div>

          {/* Guarantees */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#FFD700]" /> Instant Access (No signup needed)
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#FFD700]" /> 14-Day Free Access
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#FFD700]" /> Real Supabase &amp; Firestore
            </span>
          </div>

          {/* Trust badges */}
          <div className="mt-10 pt-6 border-t border-zinc-900 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> SOC2 Type II Certified
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#FFD700]" /> End-to-End Encryption
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" /> Powered by Gemini Flash
            </span>
          </div>
        </section>
      </div>

      {/* CORE 3 PILLARS SECTION (CLEAN & CONCISE) */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-zinc-900">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Three Core Pillars. <span className="gold-gradient-text">Zero Noise.</span>
          </h2>
          <p className="mt-2 text-zinc-400 text-sm">
            Everything an executive needs daily to operate at maximum velocity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: PRIME Inbox */}
          <div className="rounded-2xl p-6 bg-zinc-900/60 border border-zinc-800 hover:border-[#FFD700]/50 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
                <Inbox className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-[#FFD700] transition-colors">
                1. Executive Inbox Triage
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Autonomous email scoring and context-aware draft replies ready for 1-click dispatch.
              </p>
              <div className="pt-2 text-xs text-zinc-300 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#FFD700] shrink-0" />
                  <span>Instant AI Drafts with custom tone</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#FFD700] shrink-0" />
                  <span>Urgency triage &amp; priority tags</span>
                </div>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-zinc-800">
              <button 
                onClick={onEnterDemo || (() => onOpenAuth('signup'))} 
                className="text-xs font-semibold text-[#FFD700] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Try Inbox Triage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: PRIME Docs */}
          <div className="rounded-2xl p-6 bg-zinc-900/60 border border-zinc-800 hover:border-[#FFD700]/50 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-[#FFD700] transition-colors">
                2. Document &amp; Contract Intel
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Deep PDF risk audits, hidden liability warnings, and clear bottom-line executive summaries.
              </p>
              <div className="pt-2 text-xs text-zinc-300 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#FFD700] shrink-0" />
                  <span>Contract clause risk detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#FFD700] shrink-0" />
                  <span>Tactical 3-step action plans</span>
                </div>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-zinc-800">
              <button 
                onClick={onEnterDemo || (() => onOpenAuth('signup'))} 
                className="text-xs font-semibold text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Try Document Intel</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: PRIME Brain */}
          <div className="rounded-2xl p-6 bg-zinc-900/60 border border-zinc-800 hover:border-[#FFD700]/50 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700]">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-[#FFD700] transition-colors">
                3. PRIME Brain (AI COO)
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Your 24/7 conversational Chief of Operations. Formulate strategy and execute next steps.
              </p>
              <div className="pt-2 text-xs text-zinc-300 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#FFD700] shrink-0" />
                  <span>3 high-leverage execution steps</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#FFD700] shrink-0" />
                  <span>Persistent organizational memory</span>
                </div>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-zinc-800">
              <button 
                onClick={onEnterDemo || (() => onOpenAuth('signup'))} 
                className="text-xs font-semibold text-[#FFD700] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Consult AI COO</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* BRIDGE TO SPECIALIZED TOOLS DIRECTORY */}
        <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border border-[#FFD700]/25 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] shrink-0">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white">
                Looking for Specialized Executive Tools? (15+ Tools Built-In)
              </p>
              <p className="text-[11px] text-zinc-400">
                Closer AI, Hiring AI, Meetings AI, Cash Flow Guard, Strategy Board, and Agent Swarms are available in the Executive Directory.
              </p>
            </div>
          </div>
          <button
            onClick={onEnterDemo || (() => onOpenAuth('signup'))}
            className="px-4 py-2 rounded-xl bg-[#FFD700] hover:bg-[#FFE55C] text-black text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>Explore All 15+ Tools</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* PRICING SECTION (CLEAN & BALANCED) */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-zinc-900">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Transparent, <span className="gold-gradient-text">Predictable Pricing</span>
          </h2>
          <p className="mt-2 text-zinc-400 text-sm">
            Scalable plans for solo executives, high-growth startups, and advisory agencies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Plan 1: Starter */}
          <div className="rounded-2xl p-6 bg-zinc-900/50 border border-zinc-800 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Starter</h3>
                <p className="text-xs text-zinc-400 mt-0.5">For single founders &amp; early executives.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">$499</span>
                <span className="text-xs text-zinc-400">/ month</span>
              </div>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#FFD700] shrink-0" />
                  <span>500 emails triaged / mo</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#FFD700] shrink-0" />
                  <span>Standard Document Intelligence</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#FFD700] shrink-0" />
                  <span>PRIME Brain COO</span>
                </li>
              </ul>
            </div>
            <div className="mt-6">
              <button
                onClick={onEnterDemo || (() => onOpenAuth('signup'))}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-all cursor-pointer"
              >
                Launch Sandbox
              </button>
            </div>
          </div>

          {/* Plan 2: Growth (Highlighted) */}
          <div className="rounded-2xl p-6 bg-zinc-900/90 border-2 border-[#FFD700] relative flex flex-col justify-between shadow-[0_0_30px_rgba(255,215,0,0.15)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#FFD700] text-black text-[9px] font-extrabold uppercase tracking-widest">
              Most Popular
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <span>Growth Fleet</span>
                  <Crown className="w-4 h-4 text-[#FFD700]" />
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">For scaling startups &amp; growth teams.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold gold-gradient-text font-serif">$1,999</span>
                <span className="text-xs text-zinc-400">/ month</span>
              </div>
              <ul className="space-y-2 text-xs text-zinc-200">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#FFD700] shrink-0" />
                  <span className="font-semibold text-white">Unlimited</span> emails &amp; docs triaged
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#FFD700] shrink-0" />
                  <span>Closer AI &amp; Sales Call Analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#FFD700] shrink-0" />
                  <span>Cash Flow Guard &amp; Ad Optimizer</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#FFD700] shrink-0" />
                  <span>Full Autonomous Swarms</span>
                </li>
              </ul>
            </div>
            <div className="mt-6">
              <button
                onClick={onEnterDemo || (() => onOpenAuth('signup'))}
                className="w-full py-2.5 rounded-xl text-xs font-extrabold text-black bg-gradient-to-r from-[#FFD700] to-amber-400 hover:brightness-110 transition-all cursor-pointer shadow-sm"
              >
                Test Drive Growth
              </button>
            </div>
          </div>

          {/* Plan 3: Agency & Reseller */}
          <div className="rounded-2xl p-6 bg-zinc-900/50 border border-zinc-800 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <span>Agency Reseller</span>
                  <Building2 className="w-4 h-4 text-indigo-400" />
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">For B2B agencies &amp; consultancies.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">$3,999</span>
                <span className="text-xs text-zinc-400">/ month</span>
              </div>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>White-label with custom domain</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Up to 25 isolated client tenants</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Client provisioning &amp; billing</span>
                </li>
              </ul>
            </div>
            <div className="mt-6">
              <button
                onClick={onEnterDemo || (() => onOpenAuth('signup'))}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-all cursor-pointer"
              >
                Launch Agency Suite
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA STRIP */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center border-t border-zinc-900">
        <div className="rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-amber-500/10 via-[#FFD700]/5 to-amber-500/10 border border-[#FFD700]/25">
          <Crown className="w-8 h-8 text-[#FFD700] mx-auto mb-3" />
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to deploy your <span className="gold-gradient-text">24/7 AI C-Suite</span>?
          </h2>
          <p className="mt-2 text-zinc-400 text-xs sm:text-sm max-w-lg mx-auto">
            Experience real operations intelligence with zero setup friction.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onEnterDemo || (() => onOpenAuth('signup'))}
              className="px-6 py-3 rounded-xl text-xs sm:text-sm font-extrabold text-black bg-[#FFD700] hover:bg-white transition-all cursor-pointer inline-flex items-center gap-2 shadow-md"
            >
              <Crown className="w-4 h-4" />
              <span>Launch Live Workspace Now</span>
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-[#FFD700]" />
            <span className="font-bold text-zinc-300">PRIME AI</span>
            <span>— Autonomous Executive Intelligence</span>
          </div>
          <p>© {new Date().getFullYear()} PRIME AI Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
