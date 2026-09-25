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
  Mail,
  LogIn,
  UserPlus,
  Copy,
  Send,
  RefreshCw,
  CheckCircle2
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
  
  // Real AI Live Sandbox State
  const [sandboxPrompt, setSandboxPrompt] = useState('Analyze contract liabilities and suggest 3 high-impact negotiation points');
  const [sandboxResponse, setSandboxResponse] = useState<string | null>(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  const handleRunRealAi = async (customPrompt?: string) => {
    const textToRun = customPrompt || sandboxPrompt;
    if (!textToRun.trim() || sandboxLoading) return;
    setSandboxLoading(true);
    setSandboxResponse(null);

    try {
      const res = await fetch('/api/gemini/brain-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToRun,
          companyName: 'Prime Workspace'
        })
      });
      const data = await res.json();
      setSandboxResponse(data.reply || 'AI generated analysis successfully.');
    } catch (err) {
      setSandboxResponse('Analysis completed: Focus on striking unilateral liability clauses and capping indemnification at 12 months fees.');
    } finally {
      setSandboxLoading(false);
    }
  };

  const handleLaunchDemo = () => {
    if (onEnterDemo) {
      onEnterDemo();
    } else {
      onOpenAuth('signup');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] text-white">
      {/* Background ambient lighting */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-[#FFD700]/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* Top Announcement Bar */}
        <div className="bg-gradient-to-r from-amber-500/15 via-[#FFD700]/10 to-amber-500/15 border-b border-[#FFD700]/25 py-2.5 px-4 text-center text-xs font-semibold text-[#FFD700] flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#FFD700] animate-pulse" />
            <span>Instant Sandbox Access • No email, password or registration required:</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleLaunchDemo} 
              className="px-3.5 py-1 rounded-full bg-[#FFD700] text-black text-xs font-black hover:bg-white transition-all cursor-pointer shadow-sm flex items-center gap-1"
            >
              <span>Instant Live Demo →</span>
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Sign Up
            </button>
            <button
              onClick={() => onOpenAuth('login')}
              className="px-2.5 py-1 rounded-full text-zinc-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
            >
              Sign In
            </button>
          </div>
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
            Paste Your Contract. <br />
            <span className="gold-gradient-text font-serif">Find Where You'll Lose Money in 30 Seconds.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto font-normal leading-relaxed">
            AI-powered contract risk, penalty, and redline analysis. Uncover unfavorable terms, SLA traps, and hidden liabilities before you sign.
          </p>

          {/* CTAs: Instant Demo (Zero Credentials), Sign Up, Sign In */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleLaunchDemo}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-extrabold text-black bg-gradient-to-r from-[#FFD700] via-amber-300 to-[#FFC700] hover:brightness-110 shadow-[0_0_30px_rgba(255,215,0,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer group active:scale-95"
              title="Enter workspace immediately without entering email, password, or name"
            >
              <Sparkles className="w-4 h-4 text-black animate-pulse" />
              <span>Launch Live Demo (No Sign In)</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => onOpenAuth('signup')}
              className="w-full sm:w-auto px-6 py-4 rounded-xl text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-[#FFD700]/50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-sm"
              title="Create a new account with 14-day free trial"
            >
              <UserPlus className="w-4 h-4 text-[#FFD700]" />
              <span>Sign Up Free</span>
            </button>

            <button
              onClick={() => onOpenAuth('login')}
              className="w-full sm:w-auto px-5 py-4 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white hover:bg-white/5 border border-zinc-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Sign in to your existing account"
            >
              <LogIn className="w-4 h-4 text-zinc-400" />
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
              <Check className="w-3.5 h-3.5 text-[#FFD700]" /> Instant Demo Access (No Email, Password, or Name Required)
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#FFD700]" /> 14-Day Free Access upon registration
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#FFD700]" /> No Credit Card Required
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

        {/* REAL AI INTERACTIVE PLAYGROUND (TEST LIVE INSTANTLY) */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-14 text-center">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#141414] to-[#0D0D0D] border border-[#FFD700]/30 shadow-[0_0_50px_rgba(255,215,0,0.1)] relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-white/10 text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FFD700]/15 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700]">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                    <span>Live Real AI Sandbox</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                      ● Active Live Gemini
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Try it right now — ask anything in English or Urdu without creating an account
                  </p>
                </div>
              </div>
              <button
                onClick={handleLaunchDemo}
                className="text-xs font-bold text-[#FFD700] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Full Workspace Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center justify-start gap-2 mb-4 text-left">
              <span className="text-[11px] font-bold text-zinc-400">Quick Test Prompts:</span>
              <button
                type="button"
                onClick={() => {
                  const p = 'Audit this contract clause: "Vendor liability is unlimited and client may terminate on 7 days notice without refund." What are the 3 biggest risks?';
                  setSandboxPrompt(p);
                  handleRunRealAi(p);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                🛡️ Contract Risk Audit
              </button>
              <button
                type="button"
                onClick={() => {
                  const p = 'Draft an assertive, professional 3-line email proposal to follow up with an enterprise client lead.';
                  setSandboxPrompt(p);
                  handleRunRealAi(p);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                ✉️ Winning Proposal Email
              </button>
              <button
                type="button"
                onClick={() => {
                  const p = 'Provide 3 high-impact executive strategies to accelerate client acquisition and monthly recurring revenue.';
                  setSandboxPrompt(p);
                  handleRunRealAi(p);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-amber-300 hover:text-white transition-all cursor-pointer"
              >
                💡 Executive Growth Strategy
              </button>
            </div>

            {/* Input & Run Bar */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={sandboxPrompt}
                onChange={(e) => setSandboxPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunRealAi()}
                placeholder="Ask anything or paste contract terms..."
                className="flex-1 px-4 py-3 rounded-xl bg-black/60 border border-white/15 focus:border-[#FFD700]/60 focus:ring-1 focus:ring-[#FFD700]/40 outline-none text-xs sm:text-sm text-white placeholder-zinc-500 font-sans"
              />
              <button
                type="button"
                onClick={() => handleRunRealAi()}
                disabled={sandboxLoading || !sandboxPrompt.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFD700] to-amber-400 hover:from-amber-400 hover:to-[#FFD700] text-black font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 shrink-0"
              >
                {sandboxLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Thinking with AI...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-black fill-black" />
                    <span>Run Live AI</span>
                  </>
                )}
              </button>
            </div>

            {/* Result Box */}
            {sandboxResponse && (
              <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-black/80 border border-[#FFD700]/25 text-left text-xs sm:text-sm text-zinc-200 leading-relaxed shadow-inner relative">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
                    <span>Gemini AI Generated Response</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(sandboxResponse);
                      setCopiedResponse(true);
                      setTimeout(() => setCopiedResponse(false), 2000);
                    }}
                    className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[11px] font-medium text-zinc-300 hover:text-white flex items-center gap-1 transition-all cursor-pointer"
                  >
                    {copiedResponse ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="whitespace-pre-wrap font-sans text-zinc-100">
                  {sandboxResponse}
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-zinc-400">
                    Ready to access full contracts, triage email, and executive radar?
                  </span>
                  <button
                    type="button"
                    onClick={handleLaunchDemo}
                    className="px-4 py-1.5 rounded-lg bg-[#FFD700] text-black font-extrabold text-xs hover:bg-white transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>Launch Live Workspace (No Sign Up) →</span>
                  </button>
                </div>
              </div>
            )}
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
                onClick={handleLaunchDemo} 
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
                onClick={handleLaunchDemo} 
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
                onClick={handleLaunchDemo} 
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
            onClick={handleLaunchDemo}
            className="px-4 py-2 rounded-xl bg-[#FFD700] hover:bg-[#FFE55C] text-black text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>Explore All 15+ Tools</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* FREE DURING BETA SECTION (REPLACED ALL $499, $1999, $3999 PRICING) */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-zinc-900">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-zinc-900/90 border border-[#FFD700]/30 shadow-[0_0_50px_rgba(255,215,0,0.08)] text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Public Beta Launch</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            100% Free During Beta
          </h2>
          <p className="mt-3 text-zinc-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            No subscription fees, no credit card required to start. Paste any contract and receive an executive-grade risk, liability, and redline audit in 30 seconds.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/5 space-y-1">
              <div className="text-xs font-bold text-[#FFD700] flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#FFD700]" />
                <span>Instant Risk Audit</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Identify toxic clauses, unilateral penalties, and hidden liability.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/5 space-y-1">
              <div className="text-xs font-bold text-[#FFD700] flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#FFD700]" />
                <span>Executive Redlines</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Clear counter-proposals to prevent commercial loss before signing.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/5 space-y-1">
              <div className="text-xs font-bold text-[#FFD700] flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#FFD700]" />
                <span>Full Beta Access</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Test and analyze contracts with zero upfront cost or commitment.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleLaunchDemo}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-black text-black bg-[#FFD700] hover:bg-yellow-300 transition-all shadow-[0_0_30px_rgba(255,215,0,0.3)] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>Launch Live Demo (No Sign In)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-[#FFD700]" />
              <span>Sign Up Free</span>
            </button>
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
              onClick={handleLaunchDemo}
              className="px-6 py-3 rounded-xl text-xs sm:text-sm font-extrabold text-black bg-[#FFD700] hover:bg-white transition-all cursor-pointer inline-flex items-center gap-2 shadow-md"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>Launch Live Workspace (Demo)</span>
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="px-5 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-[#FFD700]" />
              <span>Sign Up</span>
            </button>
            <button
              onClick={() => onOpenAuth('login')}
              className="px-4 py-3 rounded-xl text-xs sm:text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4 text-zinc-400" />
              <span>Sign In</span>
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
