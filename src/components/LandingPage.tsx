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
  Clock, 
  TrendingUp, 
  Sparkles,
  Building2,
  Lock,
  ChevronRight,
  Calculator,
  Mail,
  Send,
  AlertCircle
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'signup' | 'verify-email' | 'forgot-password') => void;
  onEnterDemo?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onEnterDemo }) => {
  // ROI Calculator state
  const [execCount, setExecCount] = useState<number>(4);
  const [hourlyRate, setHourlyRate] = useState<number>(250);
  const [hoursSpentPerWeek, setHoursSpentPerWeek] = useState<number>(18);

  const monthlyHoursSaved = Math.round(execCount * hoursSpentPerWeek * 0.72 * 4.3);
  const monthlyDollarSavings = Math.round(monthlyHoursSaved * hourlyRate);

  // Live Interactive Demo state
  const [selectedDemoTab, setSelectedDemoTab] = useState<'inbox' | 'docs' | 'brain'>('inbox');
  const [demoStatus, setDemoStatus] = useState<string>('Ready for executive approval');

  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] text-white">
      {/* Glow Backdrops */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-amber-500/10 via-yellow-600/5 to-transparent blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-40 right-10 w-[350px] h-[350px] bg-amber-400/5 blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-40 left-10 w-[350px] h-[350px] bg-yellow-500/5 blur-[120px] pointer-events-none -z-10" />

        {/* Launch Announcement Banner for 14-Day Free Trial & Live Demo */}
        <div className="bg-gradient-to-r from-amber-500/20 via-[#FFD700]/15 to-amber-500/20 border-b border-[#FFD700]/30 py-2.5 px-4 text-center text-xs sm:text-sm font-bold text-[#FFD700] flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FFD700] animate-pulse" />
            <span>🎉 14-Day Free Trial (No Card Needed) — Or Test Drive Instantly:</span>
          </div>
          <div className="flex items-center gap-2">
            {onEnterDemo && (
              <button 
                onClick={onEnterDemo} 
                className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black hover:bg-amber-400/30 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <span>🎮 Explore Live Sandbox →</span>
              </button>
            )}
            <button 
              onClick={() => onOpenAuth('signup')} 
              className="px-3 py-1 rounded-full bg-[#FFD700] text-black text-xs font-black hover:bg-white transition-all cursor-pointer shadow-sm"
            >
              Claim 14 Days Free
            </button>
          </div>
        </div>

        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-20 text-center">
          {/* Executive Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(255,215,0,0.15)]">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>14-Day Free Trial • No Credit Card Required</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-sans max-w-5xl mx-auto leading-[1.1]">
            PRIME AI — Your 24/7 <br />
            <span className="gold-gradient-text font-serif">AI Chief of Operations</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Stop doing busywork. Let AI run your business. Executive inbox triage, autonomous document intelligence, and strategic operations command.
          </p>

          {/* Hero CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onOpenAuth('signup')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-extrabold text-black bg-gradient-to-r from-[#FFD700] via-amber-300 to-[#FFC700] hover:brightness-110 shadow-[0_0_35px_rgba(255,215,0,0.45)] transition-all flex items-center justify-center gap-2.5 cursor-pointer group scale-105"
            >
              <Crown className="w-5 h-5 text-black" />
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>

            {onEnterDemo && (
              <button
                onClick={onEnterDemo}
                className="w-full sm:w-auto px-7 py-4 rounded-xl text-base font-bold text-[#FFD700] bg-[#FFD700]/10 hover:bg-[#FFD700]/20 border border-[#FFD700]/40 hover:border-[#FFD700] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_0_25px_rgba(255,215,0,0.15)] group"
              >
                <Sparkles className="w-5 h-5 text-[#FFD700] animate-pulse" />
                <span>Explore Live Demo (No Sign-Up)</span>
                <ChevronRight className="w-4 h-4 text-[#FFD700] transition-transform group-hover:translate-x-1" />
              </button>
            )}

            <button
              onClick={() => onOpenAuth('login')}
              className="w-full sm:w-auto px-6 py-4 rounded-xl text-base font-semibold text-zinc-300 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In</span>
            </button>
          </div>

          {/* Free Trial Guarantee Sub-Pill */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-amber-400/90 font-medium">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#FFD700]" /> 14 Days 100% Free Access
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#FFD700]" /> No Credit Card Required
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#FFD700]" /> Instant 60-Second Setup
            </span>
          </div>

          {/* Trust badges */}
          <div className="mt-12 pt-8 border-t border-zinc-800/60 flex flex-wrap items-center justify-center gap-8 text-xs text-zinc-400 font-medium">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> SOC2 Type II Certified
            </span>
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" /> End-to-End Encryption
            </span>
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" /> Powered by Gemini 3.7 & 3.6 Flash
            </span>
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-zinc-400" /> 100% Real Supabase & Firebase RLS
            </span>
          </div>

          {/* Interactive Live App Preview Mockup */}
          <div className="mt-16 relative mx-auto max-w-5xl rounded-2xl border border-amber-500/30 bg-zinc-950/80 backdrop-blur-2xl p-2 sm:p-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)]">
            <div className="rounded-xl border border-zinc-800 bg-[#0E0E0E] overflow-hidden text-left">
              {/* Window Bar */}
              <div className="px-4 py-3 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="ml-3 text-xs text-zinc-400 font-mono">prime.enterprise/command-center</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[11px] text-zinc-400">Autonomous Loop Active</span>
                </div>
              </div>

              {/* Demo Mode Tabs */}
              <div className="p-4 sm:p-6 bg-zinc-950/90">
                <div className="flex flex-wrap gap-2 mb-6 border-b border-zinc-800 pb-3">
                  <button
                    onClick={() => setSelectedDemoTab('inbox')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                      selectedDemoTab === 'inbox'
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                        : 'text-zinc-400 hover:text-white bg-zinc-900/50'
                    }`}
                  >
                    <Inbox className="w-3.5 h-3.5" />
                    <span>PRIME Inbox Triage</span>
                  </button>
                  <button
                    onClick={() => setSelectedDemoTab('docs')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                      selectedDemoTab === 'docs'
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                        : 'text-zinc-400 hover:text-white bg-zinc-900/50'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>PRIME Docs Intelligence</span>
                  </button>
                  <button
                    onClick={() => setSelectedDemoTab('brain')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                      selectedDemoTab === 'brain'
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                        : 'text-zinc-400 hover:text-white bg-zinc-900/50'
                    }`}
                  >
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>Talk to PRIME Brain</span>
                  </button>
                </div>

                {/* Tab 1: Inbox preview */}
                {selectedDemoTab === 'inbox' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                          HIGH URGENCY
                        </span>
                        <span className="text-xs text-zinc-400 font-mono">12m ago</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Eleanor Vance, VP of Procurement</p>
                        <p className="text-xs text-zinc-400">Enterprise Contract Renewal ($420k ARR)</p>
                      </div>
                      <p className="text-xs text-zinc-300 line-clamp-3 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
                        "The board is thrilled to renew, but requires confirmation of 99.95% SLA and SOC2 tenant isolation before Thursday 3 PM..."
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-zinc-900/90 to-zinc-950 border border-amber-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                          <Crown className="w-3.5 h-3.5 text-amber-400" /> PRIME AI Draft Reply
                        </span>
                        <span className="text-[11px] text-emerald-400 font-medium">99.4% Confidence</span>
                      </div>
                      <p className="text-xs text-zinc-200 bg-zinc-950/80 p-2.5 rounded-lg border border-amber-500/20 font-mono text-[11px] leading-relaxed">
                        "Dear Eleanor, Confirmed on both fronts: 99.95% SLA is formally integrated into Section 4.2, and our SOC2 Type II compliance audit is attached. Executed addendum is queued in DocuSign..."
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button 
                          onClick={() => setDemoStatus('Approved & Dispatched to DocuSign!')}
                          className="px-3 py-1.5 rounded-lg bg-amber-400 text-black text-xs font-bold hover:brightness-110 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3 h-3" /> Approve & Send
                        </button>
                        <span className="text-[11px] text-zinc-400">{demoStatus}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Docs preview */}
                {selectedDemoTab === 'docs' && (
                  <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-bold text-white">Q3_Strategic_Operational_Audit.pdf</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                        Analyzed in 1.2s
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                        <p className="font-bold text-amber-400 mb-1">Executive Summary</p>
                        <p className="text-zinc-400 text-[11px]">Identified $170k ARR in unoptimized vendor compute, path to 84% gross margins by Q4.</p>
                      </div>
                      <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                        <p className="font-bold text-red-400 mb-1">Critical Risk Identified</p>
                        <p className="text-zinc-400 text-[11px]">3rd party API latency clause requires SLA backstop before scaling international nodes.</p>
                      </div>
                      <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                        <p className="font-bold text-emerald-400 mb-1">3 COO Direct Actions</p>
                        <p className="text-zinc-400 text-[11px]">1. Lock 1-yr compute terms. 2. Update SLA clause. 3. Fast-track Solutions lead.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Brain preview */}
                {selectedDemoTab === 'brain' && (
                  <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-3 font-sans">
                    <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300">
                      <span className="font-bold text-zinc-400">Executive: </span> 
                      "PRIME, what is our top priority for closing our Q3 revenue gap while protecting margins?"
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-zinc-950 to-zinc-900 border border-amber-500/30 text-xs text-zinc-200 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-amber-300">
                        <Crown className="w-3.5 h-3.5" /> PRIME AI (Chief of Operations)
                      </div>
                      <p className="text-[12px] text-zinc-300 leading-relaxed">
                        To hit our $10M ARR milestone without expanding headcount burn, execute these 3 direct actions immediately:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-zinc-300 text-[11px]">
                        <li><strong>1. Action:</strong> Transition 60% compute to reserved instances to unlock $14.2k/mo margin cushion.</li>
                        <li><strong>2. Action:</strong> Automate client SLA verification to reduce enterprise onboarding cycle from 14 days to 48 hours.</li>
                        <li><strong>3. Action:</strong> Reallocate 2 mid-tier SDRs to high-intent renewal accounts (&gt; $100k ACV).</li>
                      </ul>
                      <p className="text-amber-400 font-mono text-[11px] font-bold pt-1">- PRIME</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 3 CORE PILLARS / CARDS SECTION */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            The Three Pillars of <span className="gold-gradient-text">PRIME AI</span>
          </h2>
          <p className="mt-4 text-zinc-400 text-base">
            Engineered exclusively for CEOs, Founders, and C-Suite Executives who refuse to waste hours on operational friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: PRIME Inbox */}
          <div className="rounded-2xl p-8 bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/50 transition-all duration-300 group hover:shadow-[0_0_30px_rgba(255,215,0,0.1)] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                PRIME Inbox
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Autonomous executive email triage. Extracts core takeaways, urgency tiers, and drafts context-aware replies ready for 1-click approval.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Instant AI Drafts with custom tone controls</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Urgency scoring (Client, Investor, Vendor, Legal)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Approve & Send directly to Firestore database</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-800/80">
              <button 
                onClick={() => onOpenAuth('signup')} 
                className="text-xs font-bold text-amber-400 group-hover:text-amber-300 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Explore Inbox Triage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: PRIME Docs */}
          <div className="rounded-2xl p-8 bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/50 transition-all duration-300 group hover:shadow-[0_0_30px_rgba(255,215,0,0.1)] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                PRIME Docs
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Upload complex PDF reports, legal agreements, vendor contracts, or strategy decks. Get immediate bottom-line synthesis, risk audits, and tactical action items.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Deep PDF & Text parsing powered by Gemini</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Red flag detection & contract risk flags</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Structured next actions with clear deliverables</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-800/80">
              <button 
                onClick={() => onOpenAuth('signup')} 
                className="text-xs font-bold text-amber-400 group-hover:text-amber-300 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Explore Document Intelligence</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: PRIME Brain */}
          <div className="rounded-2xl p-8 bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/50 transition-all duration-300 group hover:shadow-[0_0_30px_rgba(255,215,0,0.1)] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                PRIME Brain
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Your dedicated conversational AI Chief of Operations. Formulate strategic decisions, resolve pipeline bottlenecks, and always receive 3 direct next actions.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Enforced COO persona with laser precision</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Always delivers 3 direct high-leverage actions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Full Firestore conversation memory per account</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-800/80">
              <button 
                onClick={() => onOpenAuth('signup')} 
                className="text-xs font-bold text-amber-400 group-hover:text-amber-300 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Consult PRIME Brain</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE ROI & HOURS SAVED CALCULATOR */}
      <section id="roi-calculator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-800/80">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-zinc-900 via-zinc-950 to-[#0A0A0A] border border-amber-500/30 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 text-xs font-semibold uppercase tracking-wider mb-4">
                <Calculator className="w-3.5 h-3.5" />
                <span>Executive Operations ROI</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Calculate Your Organization's <br />
                <span className="gold-gradient-text">Time & Capital Saved</span>
              </h2>
              <p className="mt-4 text-zinc-400 text-sm leading-relaxed">
                By delegating inbox triage, contract summarization, and routine decision drafting to PRIME AI, executive teams reclaim over 70% of operational overhead.
              </p>

              {/* Sliders */}
              <div className="mt-8 space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-zinc-300">Executive & C-Suite Members</span>
                    <span className="text-amber-400">{execCount} Leaders</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    value={execCount}
                    onChange={(e) => setExecCount(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-zinc-300">Weekly Hours Spent on Email & Docs per Leader</span>
                    <span className="text-amber-400">{hoursSpentPerWeek} Hours / week</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    value={hoursSpentPerWeek}
                    onChange={(e) => setHoursSpentPerWeek(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-zinc-300">Effective Blended Executive Hourly Rate</span>
                    <span className="text-amber-400">${hourlyRate}/hour</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="800"
                    step="25"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Projected Output Card */}
            <div className="p-8 rounded-2xl bg-zinc-950/90 border border-amber-500/30 text-center space-y-6 shadow-[0_0_40px_rgba(255,215,0,0.15)]">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Projected Monthly Value Created</span>
                <p className="text-4xl sm:text-5xl font-extrabold gold-gradient-text font-serif">
                  ${monthlyDollarSavings.toLocaleString()}
                </p>
                <span className="text-xs text-emerald-400 font-medium">in recovered leadership productivity</span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <p className="text-2xl font-bold text-white">{monthlyHoursSaved}</p>
                  <p className="text-[11px] text-zinc-400">Hours Saved / Month</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <p className="text-2xl font-bold text-amber-400">14.8x</p>
                  <p className="text-[11px] text-zinc-400">Average ROI on Growth Plan</p>
                </div>
              </div>

              <button
                onClick={() => onOpenAuth('signup')}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,215,0,0.25)]"
              >
                <Crown className="w-4 h-4" />
                <span>Claim Your Productivity Gains</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-semibold uppercase tracking-widest mb-4">
            <span>Transparent Investment</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Predictable Pricing for <span className="gold-gradient-text">Uncompromising Scale</span>
          </h2>
          <p className="mt-4 text-zinc-400 text-base">
            Choose the tier tailored to your operational velocity. Cancel or upgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {/* Plan 1: Starter */}
          <div className="rounded-2xl p-6 sm:p-7 bg-zinc-900/50 border border-zinc-800 flex flex-col justify-between">
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white">Starter</h3>
                <p className="text-xs text-zinc-400 mt-1">For single founders & early-stage executive duos.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">$499</span>
                <span className="text-xs text-zinc-400 font-medium">/ month</span>
              </div>
              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Up to 500 emails triaged / mo</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Revenue Radar pipeline tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Standard PRIME Brain COO</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Supabase &amp; Firestore persistence</span>
                </li>
              </ul>
            </div>
            <div className="mt-6">
              <button
                onClick={() => onOpenAuth('signup')}
                className="w-full py-3 rounded-xl text-xs font-bold text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Start 14-Day Trial</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FFD700]" />
              </button>
            </div>
          </div>

          {/* Plan 2: Growth (Highlighted) */}
          <div className="rounded-2xl p-6 sm:p-7 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-zinc-950 border-2 border-amber-400 relative flex flex-col justify-between shadow-[0_0_40px_rgba(255,215,0,0.2)]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[10px] font-extrabold uppercase tracking-widest shadow-md">
              Most Popular • 14-Day Free Trial
            </div>
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                  <span>Growth</span>
                  <Crown className="w-4 h-4 text-amber-400" />
                </h3>
                <p className="text-xs text-zinc-400 mt-1">For scaling scale-ups & Series A-C companies.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold gold-gradient-text font-serif">$1,999</span>
                <span className="text-xs text-zinc-400 font-medium">/ month</span>
              </div>
              <ul className="space-y-2.5 text-xs text-zinc-200">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-semibold text-white">Unlimited</span> emails &amp; docs triaged
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>24/7 Revenue Radar &amp; Churn Defense</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Closer AI &amp; Sales Call Analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Voice Executive HUD &amp; Daily Briefing</span>
                </li>
              </ul>
            </div>
            <div className="mt-6">
              <button
                onClick={() => onOpenAuth('signup')}
                className="w-full py-3 rounded-xl text-xs font-extrabold text-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 hover:brightness-110 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(255,215,0,0.25)]"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Start 14-Day Free Trial</span>
              </button>
            </div>
          </div>

          {/* Plan 3: White-Label Agency & Reseller ($3,999/mo) */}
          <div className="rounded-2xl p-6 sm:p-7 bg-gradient-to-b from-indigo-950/40 via-zinc-950 to-zinc-950 border border-indigo-500/50 relative flex flex-col justify-between shadow-[0_0_30px_rgba(99,102,241,0.2)]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-extrabold uppercase tracking-widest shadow-md">
              $20k-$40k MRR Agency
            </div>
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                  <span>Agency Reseller</span>
                  <Building2 className="w-4 h-4 text-indigo-400" />
                </h3>
                <p className="text-xs text-zinc-400 mt-1">For B2B agencies, consultancies &amp; rev-ops teams.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-indigo-300 font-mono">$3,999</span>
                <span className="text-xs text-zinc-400 font-medium">/ month</span>
              </div>
              <ul className="space-y-2.5 text-xs text-zinc-200">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="font-semibold text-white">100% White-Label</span> with custom domain
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Up to 25 Isolated Client Sub-Tenants</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Charge clients $1.5k-$4k/mo each</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Reseller Billing &amp; Client Provisioning</span>
                </li>
              </ul>
            </div>
            <div className="mt-6">
              <button
                onClick={() => onOpenAuth('signup')}
                className="w-full py-3 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(99,102,241,0.3)]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Deploy Agency Portal</span>
              </button>
            </div>
          </div>

          {/* Plan 4: Enterprise */}
          <div className="rounded-2xl p-6 sm:p-7 bg-zinc-900/50 border border-zinc-800 flex flex-col justify-between">
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white">Enterprise</h3>
                <p className="text-xs text-zinc-400 mt-1">For holding groups &amp; enterprise portfolios.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">$9,999</span>
                <span className="text-xs text-zinc-400 font-medium">/ month</span>
              </div>
              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Dedicated isolated cluster</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Custom ERP &amp; Salesforce ETL</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Dedicated Operations Lead</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Custom fine-tuned organization models</span>
                </li>
              </ul>
            </div>
            <div className="mt-6">
              <button
                onClick={() => onOpenAuth('signup')}
                className="w-full py-3 rounded-xl text-xs font-bold text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-all cursor-pointer"
              >
                Contact Enterprise Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center border-t border-zinc-800/80">
        <div className="rounded-3xl p-12 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-500/10 border border-amber-500/30">
          <Crown className="w-10 h-10 text-amber-400 mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to deploy your <span className="gold-gradient-text">24/7 AI Chief of Operations</span>?
          </h2>
          <p className="mt-3 text-zinc-400 text-sm max-w-xl mx-auto">
            Join hundreds of visionary executives running leaner, faster, and more decisive organizations today.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onOpenAuth('signup')}
              className="px-8 py-4 rounded-xl text-sm font-extrabold text-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 hover:brightness-110 shadow-[0_0_30px_rgba(255,215,0,0.3)] transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Crown className="w-4 h-4" />
              <span>Start Your Free 14-Day Trial</span>
            </button>
            {onEnterDemo && (
              <button
                onClick={onEnterDemo}
                className="px-6 py-4 rounded-xl text-sm font-bold text-[#FFD700] bg-[#FFD700]/10 hover:bg-[#FFD700]/20 border border-[#FFD700]/30 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#FFD700]" />
                <span>Test Drive Live Sandbox First</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 py-8 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-zinc-300">PRIME AI</span>
            <span>— The 24/7 AI Chief of Operations</span>
          </div>
          <p>© {new Date().getFullYear()} PRIME AI Inc. All rights reserved. SOC2 Type II Certified.</p>
        </div>
      </footer>
    </div>
  );
};
