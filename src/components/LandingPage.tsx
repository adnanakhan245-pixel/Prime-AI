import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Zap, 
  Sparkles, 
  ArrowRight, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  Sliders, 
  TrendingUp, 
  CreditCard, 
  Smartphone,
  Eye,
  Check,
  AlertTriangle,
  UserX,
  TrendingDown,
  Quote,
  ChevronDown,
  HelpCircle
} from 'lucide-react';
import { ClientContactModal } from './ClientContactModal';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'signup' | 'verify-email' | 'forgot-password') => void;
  onEnterDemo?: () => void;
  onOpenClientPayment?: () => void;
  onOpenClientContact?: () => void;
  onOpenChurnAudit?: () => void;
  onOpenLegal?: (type: 'privacy' | 'terms' | 'deletion' | 'meta-whatsapp') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onOpenAuth, 
  onEnterDemo,
  onOpenClientPayment,
  onOpenClientContact: propOnOpenClientContact,
  onOpenChurnAudit,
  onOpenLegal
}) => {
  // Client contact modal state (always defined)
  const [isContactOpen, setIsContactOpen] = useState(false);

  // FAQ Accordion State (first item open by default)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Safe client contact opener that satisfies requirements and fallback
  const onOpenClientContact = () => {
    setIsContactOpen(true);
    if (propOnOpenClientContact) {
      propOnOpenClientContact();
    }
  };

  // Element 1: Interactive Hero Demo Mockup State
  const [demoApproved, setDemoApproved] = useState(false);

  // Element 4: Message Preview Tab (Email vs WhatsApp)
  const [activeMessageTab, setActiveMessageTab] = useState<'email' | 'whatsapp'>('email');

  // Element 6: Interactive Leaked Revenue Calculator
  const [calculatorMrr, setCalculatorMrr] = useState<number>(15000);
  const [calculatorChurnRate, setCalculatorChurnRate] = useState<number>(6);

  // Calculated ROI values
  const monthlyLeaked = Math.round(calculatorMrr * (calculatorChurnRate / 100));
  const annualLeaked = monthlyLeaked * 12;
  const annualRecoverable = Math.round(annualLeaked * 0.72);

  const handleLaunchTour = () => {
    if (onEnterDemo) {
      onEnterDemo();
    } else {
      onOpenAuth('signup');
    }
  };

  const handleOpenAuditOrTour = () => {
    if (onOpenChurnAudit) {
      onOpenChurnAudit();
    } else {
      handleLaunchTour();
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#070707] text-white flex flex-col items-center selection:bg-emerald-500 selection:text-black">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION & LIVE UI MOCKUP (ELEMENT 1) */}
      {/* ========================================================================= */}
      <header className="w-full max-w-5xl mx-auto px-4 pt-12 pb-14 sm:pt-16 sm:pb-20 flex flex-col items-center text-center">
        
        {/* Strict Human-in-the-Loop Header Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono font-bold text-emerald-400 mb-6 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>HUMAN-IN-THE-LOOP RETENTION ENGINE</span>
        </div>

        {/* Main Bold Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-4xl leading-[1.25] sm:leading-[1.15]">
          Stop Revenue Lost to Failed Payments &amp; Churn. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
            We Draft the Recovery. You Approve in 1-Click.
          </span>
        </h1>

        {/* 1-to-2 Line Subheading */}
        <p className="mt-4 text-sm sm:text-base text-zinc-300 max-w-2xl leading-relaxed">
          PRIME catches card renewals and inactive subscribers before they cancel, then drafts polite recovery messages ready for your 1-click approval.
        </p>

        {/* Hero Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-xl">
          <button
            type="button"
            onClick={() => onOpenAuth('signup')}
            className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:brightness-110 text-black font-black text-xs sm:text-sm rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span>Start Free Trial - $29/mo</span>
          </button>

          <button
            type="button"
            onClick={handleLaunchTour}
            className="w-full sm:w-auto px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/15 hover:border-white/30 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
          >
            <Eye className="w-4 h-4 text-[#FFD700]" />
            <span>Try Live Demo - No Signup Needed</span>
          </button>
        </div>

        {/* Hero Interactive UI Mockup (Show, Don't Just Tell) */}
        <div className="mt-12 w-full max-w-3xl rounded-2xl bg-[#111111] border border-white/10 p-5 sm:p-6 text-left shadow-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 text-xs">
            <div className="flex items-center gap-2 font-mono font-bold text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE QUEUE: 1 PENDING FOUNDER APPROVAL</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Zero Rogue Action
            </span>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm sm:text-base">Sarah Jenkins</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                  Card Renewal Declined ($420/mo)
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Drafted polite Day 1 email + 10-second card update link. Waiting for your sign-off.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDemoApproved(!demoApproved)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                demoApproved 
                  ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                  : 'bg-[#FFD700] hover:bg-amber-400 text-black shadow-md hover:scale-105'
              }`}
            >
              {demoApproved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>Approved &amp; Recovered!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-black" />
                  <span>Approve &amp; Dispatch in 1-Click</span>
                </>
              )}
            </button>
          </div>
        </div>

      </header>

      {/* ========================================================================= */}
      {/* 2. THE 4 CORE CAPABILITIES */}
      {/* ========================================================================= */}
      <section className="w-full max-w-5xl mx-auto px-4 py-10 border-t border-white/5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-[#0f0f0f] border border-white/10 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-sm">1. Zero Automatic Sends</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Nothing is dispatched without your sign-off. You review and approve every message in 1 click.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f0f0f] border border-white/10 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-sm">2. Read-Only Stripe &amp; CSV Security</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We only read failure event webhooks or CSV files. Zero write permissions, zero access to sensitive funds.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f0f0f] border border-white/10 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center text-[#FFD700]">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-sm">3. 2-Minute Zero-Code Setup</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Connect your billing or drop a CSV file in seconds. No engineering work or code required.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f0f0f] border border-white/10 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-sm">4. Multi-Channel 1-Click Recovery</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Automated Day 1 email and Day 3 WhatsApp nudges with frictionless 10-second card update links.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2.5 THE WALL OF REALITY: WHY CHURN ACTUALLY HAPPENS */}
      {/* ========================================================================= */}
      <section className="w-full max-w-5xl mx-auto px-4 py-12 border-t border-white/5">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-mono font-bold tracking-wide">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>THE SILENT LEAK BEHIND 80% OF SAAS CHURN</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Why Most Customers Churn (And Why Standard Dunning Fails)
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto">
            Founders pour thousands into user acquisition while leaking 5–15% MRR every single quarter to these 3 preventable blindspots:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Champion Transition */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#141414] to-[#0d0d0d] border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <UserX className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">
                Blindspot A: The &quot;Departed Champion&quot;
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Most churn signals arrive as a <strong className="text-zinc-200">change of contact</strong>, not a sudden drop in product usage. The internal champion who loved your app leaves the company, the new admin logs in once, and procurement cancels at the next renewal.
              </p>
            </div>
            <div className="pt-3 border-t border-white/5 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>PRIME drafts re-onboarding outreach to the new decision maker.</span>
            </div>
          </div>

          {/* Card 2: Passive Failed Cards */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#141414] to-[#0d0d0d] border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">
                Blindspot B: Involuntary Card Declines
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Over <strong className="text-zinc-200">40% of churn is accidental</strong>. Expired cards, fraud false-positives, or bank limits block renewals. Generic automated dunning emails land in spam or look like robotic threats, pushing warm customers away.
              </p>
            </div>
            <div className="pt-3 border-t border-white/5 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>PRIME generates 10-second frictionless card update links.</span>
            </div>
          </div>

          {/* Card 3: The Acquisition Blindspot */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#141414] to-[#0d0d0d] border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <TrendingDown className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">
                Blindspot C: The Leaky Bucket Trap
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Founders spend 90% of their mental bandwidth acquiring new signups while losing existing paying subscribers. Manual recovery feels awkward, uncomfortable, and gets pushed to &quot;tomorrow&quot;.
              </p>
            </div>
            <div className="pt-3 border-t border-white/5 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>PRIME prepares the copy. You review and click Approve.</span>
            </div>
          </div>
        </div>

        {/* Real Quote Banner */}
        <div className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3 max-w-3xl mx-auto text-left">
          <Quote className="w-5 h-5 text-emerald-400 shrink-0 rotate-180" />
          <p className="text-xs text-zinc-300 italic">
            &quot;Most churn signals arrive as a change of contact, not a drop in usage. Fix the transition before procurement cancels.&quot;
            <span className="not-italic text-[10px] text-zinc-500 block sm:inline sm:ml-2 font-mono font-bold">— B2B SaaS Benchmark</span>
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SIMPLE 3-STEP WORKFLOW (ELEMENT 3) */}
      {/* ========================================================================= */}
      <section className="w-full max-w-5xl mx-auto px-4 py-12 border-t border-white/5 text-center">
        <div className="space-y-2 mb-8">
          <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
            Clear 3-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            How PRIME Recovers Your Revenue
          </h2>
          <p className="text-xs text-zinc-400">
            A clean, transparent loop that puts the founder in 100% control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          
          <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-white/10 space-y-2 relative">
            <span className="font-mono text-xs font-black text-zinc-600">01</span>
            <h3 className="font-bold text-white text-sm">Upload CSV or Connect Stripe</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We sync failed payments and inactive user telemetry with zero write access.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-white/10 space-y-2 relative">
            <span className="font-mono text-xs font-black text-zinc-600">02</span>
            <h3 className="font-bold text-white text-sm">System Drafts Polite Outreach</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Tailored Day 1 Email and Day 3 WhatsApp nudges with 10-second payment links.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-white/10 space-y-2 relative">
            <span className="font-mono text-xs font-black text-emerald-400">03</span>
            <h3 className="font-bold text-white text-sm">You Approve in 1-Click</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Click &quot;Approve&quot; in your dashboard. The customer updates their card and stays subscribed.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. ACTUAL MESSAGE PREVIEW (ELEMENT 4) */}
      {/* ========================================================================= */}
      <section className="w-full max-w-4xl mx-auto px-4 py-12 border-t border-white/5">
        <div className="text-center space-y-2 mb-6">
          <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
            Brand Protection
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            What Your Customer Actually Sees
          </h2>
          <p className="text-xs text-zinc-400">
            Professional, respectful copy that protects your brand dignity and preserves goodwill.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => setActiveMessageTab('email')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMessageTab === 'email'
                ? 'bg-white text-black shadow-md'
                : 'bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Day 1 Email Sample</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMessageTab('whatsapp')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMessageTab === 'whatsapp'
                ? 'bg-[#25D366] text-black shadow-md'
                : 'bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Day 3 WhatsApp Sample</span>
          </button>
        </div>

        {/* Message Container */}
        <div className="rounded-2xl bg-[#111111] border border-white/10 p-5 sm:p-6 text-left shadow-xl">
          {activeMessageTab === 'email' ? (
            <div className="space-y-3 font-sans text-xs">
              <div className="pb-3 border-b border-white/5 text-zinc-400 space-y-1 font-mono text-[11px]">
                <div>From: <span className="text-white">Billing Support &lt;billing@yourcompany.com&gt;</span></div>
                <div>Subject: <span className="text-emerald-300 font-bold">Quick update regarding your subscription renewal</span></div>
              </div>
              <p className="text-zinc-200 leading-relaxed">
                Hi Sarah,
              </p>
              <p className="text-zinc-300 leading-relaxed">
                We noticed your latest renewal encountered a temporary bank hold. You can safely update your payment card in 10 seconds via our secure billing portal below:
              </p>
              <div className="py-2">
                <span className="inline-block px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs">
                  👉 [ 1-Click Secure Card Update Link ]
                </span>
              </div>
              <p className="text-zinc-400 text-[11px]">
                Thank you for being with us — our team is always here if you have any questions.
              </p>
            </div>
          ) : (
            <div className="space-y-3 font-sans text-xs max-w-lg mx-auto">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5 text-[11px] text-zinc-400 font-mono">
                <Smartphone className="w-3.5 h-3.5 text-[#25D366]" />
                <span>WhatsApp Business Verified Dispatch</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#0D1F16] border border-emerald-500/20 text-zinc-200 space-y-2">
                <p className="leading-relaxed">
                  Hi Sarah, quick heads up from <strong className="text-white">Your Company</strong>: your subscription renewal hit a quick bank hold.
                </p>
                <p className="text-emerald-300 font-mono text-[11px]">
                  Click here to refresh your card in 10 seconds without disruption: <span className="underline">pay.link/sarah-update</span>
                </p>
                <span className="block text-[10px] text-zinc-500 text-right">Delivered • 10:24 AM</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. THE 1-CUSTOMER ROI MATH (ELEMENT 5) */}
      {/* ========================================================================= */}
      <section className="w-full max-w-4xl mx-auto px-4 py-10 border-t border-white/5">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/30 via-[#101915] to-[#0A0A0A] border-2 border-emerald-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
          <div className="space-y-1.5 max-w-lg">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
              Immediate ROI Equation
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Recover Just 1 Customer = Software Pays for Itself
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              If PRIME saves just a single $49/mo or $99/mo subscriber this month, it generates an immediate 5x to 10x return on investment.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/30 text-center shrink-0 w-full sm:w-auto">
            <span className="text-xs text-zinc-400 font-mono block">1 Saved Customer</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono block mt-1">
              +$1,188 / yr
            </span>
            <span className="text-[10px] text-zinc-500 font-medium">Compounds your MRR forever</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. INTERACTIVE LEAKED REVENUE CALCULATOR (ELEMENT 6) */}
      {/* ========================================================================= */}
      <section className="w-full max-w-4xl mx-auto px-4 py-12 border-t border-white/5">
        <div className="text-center space-y-2 mb-8">
          <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
            Interactive Calculator
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            How Much Revenue Are You Leaking?
          </h2>
          <p className="text-xs text-zinc-400">
            Move the sliders below to calculate your estimated recoverable revenue.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-[#111111] border border-white/10 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          
          {/* Sliders Side */}
          <div className="space-y-6">
            
            {/* Slider 1: MRR */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 font-semibold">Your Monthly Recurring Revenue (MRR)</span>
                <span className="font-mono text-emerald-400 font-black text-sm">${calculatorMrr.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="2000"
                max="100000"
                step="1000"
                value={calculatorMrr}
                onChange={(e) => setCalculatorMrr(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>$2k</span>
                <span>$50k</span>
                <span>$100k+</span>
              </div>
            </div>

            {/* Slider 2: Churn / Failure Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 font-semibold">Failed Cards &amp; Inactivity Churn Rate</span>
                <span className="font-mono text-[#FFD700] font-black text-sm">{calculatorChurnRate}%</span>
              </div>
              <input
                type="range"
                min="2"
                max="15"
                step="1"
                value={calculatorChurnRate}
                onChange={(e) => setCalculatorChurnRate(Number(e.target.value))}
                className="w-full accent-[#FFD700] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>2% (Low)</span>
                <span>6% (Average)</span>
                <span>15% (High)</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 pt-2 border-t border-white/5 leading-relaxed">
              Based on industry benchmark of 23% involuntary churn recovering at 70%+ with timely multi-channel nudges.
            </p>
          </div>

          {/* Results Display Side */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/20 via-[#0a110d] to-black border border-emerald-500/30 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                Estimated Recoverable Annual ARR
              </span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono mt-1">
                +${annualRecoverable.toLocaleString()} <span className="text-xs text-zinc-400 font-sans font-normal">/ yr</span>
              </div>
              <p className="text-xs text-zinc-400 mt-2">
                Leaking ~${monthlyLeaked.toLocaleString()}/mo in declined cards and silent cancellations.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAuditOrTour}
              className="w-full py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Audit Your Churn in 2 Mins</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6.5 SIMPLE PRICING, 10X ROI */}
      {/* ========================================================================= */}
      <section className="w-full max-w-5xl mx-auto px-4 py-16 border-t border-white/5 text-center">
        <div className="space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>TRANSPARENT VALUE-BASED PRICING</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Simple Pricing, 10x ROI
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            Recover just 1 failed card or saved renewal and your subscription pays for itself immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
          
          {/* Card 1: Starter */}
          <div className="p-7 rounded-3xl bg-[#0f0f0f] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Starter</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">For Early-Stage &amp; Indie SaaS</p>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300">
                  Launch Special
                </span>
              </div>

              <div className="flex items-baseline gap-1 pt-2">
                <span className="text-4xl sm:text-5xl font-black text-white font-mono">$29</span>
                <span className="text-xs text-zinc-400">/ month</span>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-3 text-xs text-zinc-300">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Up to <strong className="text-white">$10k MRR</strong> Monitored</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong className="text-white">50 AI Recovery Drafts</strong> / month</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1-Click Human Approval Queue</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>CSV Drag &amp; Drop Ingestion (Zero API needed)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Email Support &amp; 24h Auto-Purge Privacy</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenAuth('signup')}
              className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/15 cursor-pointer shadow-md flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Growth (Most Popular) */}
          <div className="p-7 rounded-3xl bg-gradient-to-b from-[#16241c] via-[#0e1713] to-[#0A0A0A] border-2 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.15)] flex flex-col justify-between space-y-6 relative overflow-hidden">
            
            {/* Most Popular Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-400 to-teal-400 text-black text-[10px] font-black font-mono px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Most Popular
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>Growth</span>
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">For Scaling B2B SaaS</p>
                </div>
              </div>

              <div className="flex items-baseline gap-1 pt-2">
                <span className="text-4xl sm:text-5xl font-black text-emerald-400 font-mono">$99</span>
                <span className="text-xs text-zinc-400">/ month</span>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-3 text-xs text-zinc-300">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Up to <strong className="text-white">$50k MRR</strong> Monitored</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong className="text-white">Unlimited</strong> AI Recovery Drafts</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong className="text-white">WhatsApp Recovery</strong> &amp; Polite Email Sequences</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Departed Champion Transition Detection</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Priority Support &amp; Custom Gateway Relay</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenAuth('signup')}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:brightness-110 text-black font-black text-xs transition-all shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. STRICT HUMAN-IN-THE-LOOP PROMISE & FRICTIONLESS CTA (ELEMENT 7) */}
      {/* ========================================================================= */}
      <section className="w-full max-w-4xl mx-auto px-4 py-12">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#121212] via-[#0D0D0D] to-black border-2 border-white/10 text-center space-y-6 shadow-2xl relative overflow-hidden">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% HUMAN APPROVAL GUARANTEE</span>
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Zero Rogue Actions. Total Founder Control.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              No unwanted charges. No embarrassing spam. Every recovery email and WhatsApp message waits for your 1-click approval.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenAuth('signup')}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 text-black font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>Start Free Trial - $29/mo</span>
            </button>

            <button
              type="button"
              onClick={handleLaunchTour}
              className="w-full sm:w-auto px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Eye className="w-4 h-4 text-[#FFD700]" />
              <span>Try Live Demo - No Signup Needed</span>
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      {/* ========================================================================= */}
      <section className="w-full max-w-3xl mx-auto px-4 py-16 border-t border-white/5">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-xs font-mono font-bold">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>COMMON QUESTIONS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-zinc-400">
            Clear answers on security, founder control, and data protection.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "کیا یہ خودبخود گاہکوں کے پیسے کاٹے گا یا کوئی ایکشن لے گا؟ (Will it take automatic rogue actions?)",
              a: "بالکل نہیں! PRIME AI سختی سے 100% 'Human-in-the-Loop' اصول پر کام کرتا ہے۔ یہ کبھی بھی آپ کی اجازت کے بغیر کوئی ای میل نہیں بھیجے گا اور نہ ہی کسی کارڈ کو چارج کرے گا۔ ہر ریکوری میسج ڈرافٹ ہو کر آپ کے سامنے ڈیش بورڈ میں آئے گا، اور صرف آپ کے 1-Click اپروول کے بعد ہی سینڈ ہوگا۔"
            },
            {
              q: "کیا یہ میرے کسٹمرز کو اسپیم کرے گا؟ (Will it spam customers or harm my brand?)",
              a: "ہرگز نہیں! روایتی ٹولز کی سب سے بڑی خامی یہی ہوتی ہے کہ وہ دھمکی آمیز اور روبوٹک ای میلز بھیج کر کلائنٹس کو ناراض کر دیتے ہیں۔ PRIME AI انتہائی نرم، احترام والے اور ہمدردانہ Day 1 اور Day 3 میسجز تیار کرتا ہے جن میں 10 سیکنڈ کا کارڈ اپ ڈیٹ لنک ہوتا ہے، تاکہ آپ کے برانڈ کی عزت برقرار رہے اور کسٹمر خوشی سے ادائیگی کرے۔"
            },
            {
              q: "کیا میرا سٹرائپ (Stripe) اور کسٹمر ڈیٹا محفوظ ہے؟ (Is Stripe and client data secure?)",
              a: "سو فیصد محفوظ اور بینک گریڈ! PRIME AI کو آپ کے بینک یا سٹرائپ میں کسی 'Write' پرمیشن یا پاسورڈ کی ضرورت نہیں ہے۔ حتیٰ کہ آپ کو سٹرائپ جوڑنے کی بھی ضرورت نہیں ہے — آپ صرف فیلڈ انوائسز کی CSV فائل ڈراپ کر سکتے ہیں۔ تمام اپلوڈ شدہ ڈیٹا 24 گھنٹے بعد خود بخود تلف (Auto-Purged) ہو جاتا ہے۔"
            },
            {
              q: "میں جب چاہوں کینسل کیسے کر سکتا ہوں؟ (How does cancellation work?)",
              a: "کسی بھی وقت، صرف ایک کلک سے! کوئی طویل مدتی لاک ان یا پوشیدہ فیسیں نہیں ہیں۔ آپ اپنے ڈیش بورڈ کے سیٹنگز پینل سے جب چاہیں ایک سیکنڈ میں اپنی سبسکرپشن کینسل کر سکتے ہیں۔"
            }
          ].map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={idx}
                className="rounded-2xl bg-[#0f0f0f] border border-white/10 overflow-hidden transition-all hover:border-white/20"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-bold text-white text-xs sm:text-sm">
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-zinc-300 leading-relaxed border-t border-white/5 font-sans">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. COMPLETE PRODUCTION FOOTER */}
      {/* ========================================================================= */}
      <footer className="w-full border-t border-white/10 bg-[#060606] pt-12 pb-10 text-xs text-zinc-500">
        <div className="max-w-5xl mx-auto px-4 space-y-8">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-black font-black text-sm shadow-md">
                P
              </div>
              <div className="text-left">
                <span className="font-black text-white tracking-tight text-sm block">PRIME AI</span>
                <span className="text-[11px] text-zinc-400 font-mono block">Zero-Friction B2B Churn &amp; Revenue Defense</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-zinc-400">
              <button 
                type="button" 
                onClick={() => onOpenAuth('signup')} 
                className="hover:text-emerald-400 transition-colors font-medium cursor-pointer"
              >
                Pricing ($29/mo)
              </button>
              <span>•</span>
              <button 
                type="button" 
                onClick={handleLaunchTour} 
                className="hover:text-white transition-colors cursor-pointer"
              >
                Live Product Tour
              </button>
              {onOpenLegal && (
                <>
                  <span>•</span>
                  <button 
                    type="button" 
                    onClick={() => onOpenLegal('privacy')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                  <span>•</span>
                  <button 
                    type="button" 
                    onClick={() => onOpenLegal('terms')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Terms of Service
                  </button>
                </>
              )}
              {onOpenClientContact && (
                <>
                  <span>•</span>
                  <button 
                    type="button" 
                    onClick={onOpenClientContact}
                    className="hover:text-emerald-400 transition-colors cursor-pointer font-bold"
                  >
                    Contact Support
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Bank-Grade 256-bit Encryption • 24h Auto-Purge Privacy • 100% Human Approval</span>
            </div>
            <div>
              &copy; 2026 PRIME AI. All rights reserved. Built for B2B SaaS Founders.
            </div>
          </div>

        </div>
      </footer>

      {/* Fallback Inbound Client Contact Modal if parent modal handler is not present */}
      {!propOnOpenClientContact && (
        <ClientContactModal
          isOpen={isContactOpen}
          onClose={() => setIsContactOpen(false)}
        />
      )}
    </div>
  );
};
