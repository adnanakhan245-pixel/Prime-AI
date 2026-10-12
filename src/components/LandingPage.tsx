import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  Database, 
  Flame, 
  Lock, 
  Mail, 
  MessageSquare, 
  RotateCcw, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  TrendingDown, 
  TrendingUp, 
  UserCheck, 
  UserX, 
  Zap 
} from 'lucide-react';

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
  onOpenChurnAudit,
  onOpenLegal
}) => {
  const [interactiveLostAmount] = useState<number>(4820);
  const [interactiveRecoveredAmount] = useState<number>(4150);

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
    <div className="w-full min-h-screen bg-[#070707] text-white flex flex-col items-center selection:bg-rose-500 selection:text-white">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION — Bold English Headline & Immediate Revenue Rescue */}
      {/* ========================================================================= */}
      <header className="w-full max-w-5xl mx-auto px-4 pt-12 pb-14 sm:pt-16 sm:pb-20 flex flex-col items-center text-center">
        
        {/* Urgent Live Loss Alert Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/40 text-xs font-bold text-rose-300 mb-6 shadow-[0_0_25px_rgba(244,63,94,0.2)] animate-pulse">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span className="font-sans tracking-wide">
            Stripe Churn &amp; Failed Payment Live Radar • 1-Click Recovery
          </span>
        </div>

        {/* Main Bold Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-4xl leading-[1.25] sm:leading-[1.2]">
          You Lost <span className="text-rose-500 underline decoration-rose-500/50 decoration-wavy font-mono">${interactiveLostAmount.toLocaleString()}</span> Last Month to Failed Payments. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
            We Bring It Back in 1-Click.
          </span>
        </h1>

        {/* Sub-headline Description */}
        <p className="mt-5 text-sm sm:text-lg text-zinc-300 max-w-2xl leading-relaxed font-normal">
          PRIME Radar analyzes your customer data, catches failed card renewals and silent accounts before they cancel, and prepares personalized Day 1 Email and Day 3 WhatsApp rescue messages with strict human-in-the-loop approval.
        </p>

        {/* Visual Comparison: Red Loss vs. Green Recovery */}
        <div className="mt-8 w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
          
          {/* Red Card: The Loss */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/40 via-[#181010] to-black border-2 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.15)] flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Lost Last Month (Silent Inactivity)
              </span>
              <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
                -${interactiveLostAmount.toLocaleString()}
              </div>
              <p className="text-xs text-zinc-400">
                5 failed Stripe renewals &amp; 7 expired credit cards
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>

          {/* Green Card: The Recovery */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-[#0d1612] to-black border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)] flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                1-Click Verified Recovery
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                +${interactiveRecoveredAmount.toLocaleString()}
              </div>
              <p className="text-xs text-zinc-400">
                86% recovered via Day 1 Email &amp; Day 3 WhatsApp
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* CTA Buttons */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-3xl">
          
          {/* PRIMARY CTA: Opens Free Churn Report / CSV Upload */}
          <button
            type="button"
            onClick={handleOpenAuditOrTour}
            className="w-full sm:w-auto px-7 py-4 bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 hover:brightness-110 text-white font-black text-sm rounded-2xl shadow-[0_0_35px_rgba(244,63,94,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-white animate-pulse" />
            <span>[ Free Churn Report — 2 Min Audit ]</span>
          </button>

          {/* SECONDARY CTA: Interactive Demo */}
          <button
            type="button"
            onClick={handleLaunchTour}
            className="w-full sm:w-auto px-5 py-4 bg-white/5 hover:bg-white/10 text-zinc-200 hover:text-white font-bold text-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#FFD700]" />
            <span>Interactive Demo (Live Tour)</span>
          </button>

        </div>

        {/* Trust Line */}
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-zinc-400 font-medium flex-wrap">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Upload CSV or Connect Stripe • Zero Credit Card Required • Instant 2-Minute Audit</span>
        </div>

      </header>

      {/* ========================================================================= */}
      {/* SECTION 2 - PAIN: Stripe Dashboard Doesn't Tell You The Truth */}
      {/* ========================================================================= */}
      <section className="w-full max-w-5xl mx-auto px-4 py-12 border-t border-white/5 text-center">
        
        <div className="space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Silent Revenue Leaks Uncovered</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Stripe Dashboard Doesn&apos;t Tell You The Truth
          </h2>
          <h3 className="text-lg sm:text-xl font-bold text-rose-400">
            Standard billing dashboards only show successful charges and hide silent churn!
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto">
            Every month, recurring revenue quietly slips away without triggering alarm bells:
          </p>
        </div>

        {/* 3 Red Pain Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
          
          {/* Card 1: $ Lost to Failed Payments */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-rose-950/30 via-[#140e0e] to-black border-2 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.12)] space-y-4 hover:border-rose-500 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black text-rose-300 bg-rose-500/20 px-2.5 py-1 rounded-lg border border-rose-500/30">
                  23% CHURN FACTOR
                </span>
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">
                  1. Revenue Lost to Failed Cards
                </h3>
                <div className="text-xs font-bold text-rose-400 font-sans">
                  23% of SaaS churn is simply expired cards and temporary bank holds.
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Customers didn&apos;t want to leave—their cards expired or their banks blocked charges. Standard dunning emails land in spam, and subscriptions get canceled silently.
              </p>
            </div>

            <div className="pt-3 border-t border-rose-500/20 flex items-center justify-between text-[11px] text-rose-400 font-mono">
              <span>-$1,850 avg / client</span>
              <span>Silent Churn</span>
            </div>
          </div>

          {/* Card 2: Users About to Cancel */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-rose-950/30 via-[#140e0e] to-black border-2 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.12)] space-y-4 hover:border-rose-500 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black text-rose-300 bg-rose-500/20 px-2.5 py-1 rounded-lg border border-rose-500/30">
                  7-DAY WARNING
                </span>
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">
                  2. Early Silent Inactivity Warnings
                </h3>
                <div className="text-xs font-bold text-rose-400 font-sans">
                  Detect churn risks 7 days before they hit the cancel button.
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Subscribers never cancel unexpectedly: they stop logging in for 7 to 10 days first. PRIME flags inactive accounts and drafts proactive retention offers before they leave.
              </p>
            </div>

            <div className="pt-3 border-t border-rose-500/20 flex items-center justify-between text-[11px] text-rose-400 font-mono">
              <span>Early Churn Flag</span>
              <span>7+ Days Silent</span>
            </div>
          </div>

          {/* Card 3: No Manual Work */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-rose-950/30 via-[#140e0e] to-black border-2 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.12)] space-y-4 hover:border-rose-500 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black text-rose-300 bg-rose-500/20 px-2.5 py-1 rounded-lg border border-rose-500/30">
                  STRICT APPROVAL
                </span>
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">
                  3. Founder-Controlled Execution
                </h3>
                <div className="text-xs font-bold text-rose-400 font-sans">
                  No automated mistakes. 100% human-in-the-loop sign-off.
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                You never have to draft recovery copy from scratch. PRIME prepares Day 1 Email and Day 3 WhatsApp drafts and queues them up until you click &quot;Approve &amp; Dispatch&quot;.
              </p>
            </div>

            <div className="pt-3 border-t border-rose-500/20 flex items-center justify-between text-[11px] text-rose-400 font-mono">
              <span>Zero Rogue Dispatch</span>
              <span>Human Approval</span>
            </div>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* SECTION 3 - SOLUTION: How PRIME Recovers Your Money */}
      {/* ========================================================================= */}
      <section className="w-full max-w-5xl mx-auto px-4 py-12 border-t border-white/5 text-center">
        
        <div className="space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Proven Recovery Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            How PRIME Recovers Your Revenue
          </h2>
          <h3 className="text-lg sm:text-xl font-bold text-emerald-400">
            Three synchronized engines that prevent cancellation and reclaim declined MRR
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto">
            From failed invoice detection to multi-channel outreach with human approval:
          </p>
        </div>

        {/* 3 Solution Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
          
          {/* Feature 1: Immediate Alert on Failed Payments */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-emerald-950/30 via-[#0e1612] to-black border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.12)] space-y-4 hover:border-emerald-400 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  DAY 1 + DAY 3
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono text-emerald-400 font-bold">Multi-Channel Dunning</span>
                <h3 className="text-lg font-black text-white">
                  Payment Decline Rescue
                </h3>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                When a payment fails, PRIME drafts a Day 1 direct inbox email with 1-click update links and a Day 3 WhatsApp mobile escalation if payment remains pending.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 text-[11px] text-emerald-300 font-mono flex items-center justify-between">
              <span>98% WhatsApp Open</span>
              <span>1-Click Pay Link</span>
            </div>
          </div>

          {/* Feature 2: Inactivity Retention Concession */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-emerald-950/30 via-[#0e1612] to-black border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.12)] space-y-4 hover:border-emerald-400 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  20% CONCESSION
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono text-emerald-400 font-bold">Inactivity Intervention</span>
                <h3 className="text-lg font-black text-white">
                  Silent Churn Sentry
                </h3>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                When a subscriber goes silent for 7+ days, PRIME alerts you and pre-configures a targeted 20% concession (code: SAVE20NOW) and VIP check-in to preserve the contract.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 text-[11px] text-emerald-300 font-mono flex items-center justify-between">
              <span>20% Discount Code</span>
              <span>Win-Back Playbook</span>
            </div>
          </div>

          {/* Feature 3: Executive Retention Offers */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-emerald-950/30 via-[#0e1612] to-black border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.12)] space-y-4 hover:border-emerald-400 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  VOLUNTARY RESCUE
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono text-emerald-400 font-bold">Exit Intervention</span>
                <h3 className="text-lg font-black text-white">
                  Executive Rate Freeze
                </h3>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                For subscribers requesting cancellation, PRIME prepares tailored contract lock-in propositions and rate guarantees before they churn to competitors.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 text-[11px] text-emerald-300 font-mono flex items-center justify-between">
              <span>Rate Freeze Offer</span>
              <span>100% Sign-Off</span>
            </div>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* SECTION 4 - HOW IT WORKS: 3 Simple Steps */}
      {/* ========================================================================= */}
      <section className="w-full max-w-5xl mx-auto px-4 py-12 border-t border-white/5 text-center">
        
        <div className="space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-xs font-mono font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            <span>3-Minute Setup</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Start Recovering Revenue in 3 Steps
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            No complex engineering or multi-week migrations required:
          </p>
        </div>

        {/* 3 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
          
          {/* Step 1 */}
          <div className="p-6 rounded-3xl bg-[#101010] border border-white/10 relative space-y-3 hover:border-[#FFD700]/50 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-mono font-black text-[#FFD700] text-sm">
              01
            </div>
            <h3 className="text-base font-extrabold text-white">
              Step 1: Upload CSV or Connect Stripe
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Upload your customer CSV spreadsheet or connect Stripe Read-Only. No credit card or sensitive write access required.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-3xl bg-[#101010] border border-white/10 relative space-y-3 hover:border-rose-500/50 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center font-mono font-black text-rose-400 text-sm">
              02
            </div>
            <h3 className="text-base font-extrabold text-white">
              Step 2: Instant Churn Risk Breakdown
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              PRIME instantly audits your accounts: how much MRR is trapped in declined cards, which users are silent, and who is about to churn.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-3xl bg-[#101010] border border-white/10 relative space-y-3 hover:border-emerald-500/50 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-mono font-black text-emerald-400 text-sm">
              03
            </div>
            <h3 className="text-base font-extrabold text-white">
              Step 3: Review &amp; Approve to Recover
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Review pre-composed email and WhatsApp recovery copy. Click &quot;Approve &amp; Dispatch&quot; to restore customer subscriptions.
            </p>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 5. FOOTER CTA */}
      {/* ========================================================================= */}
      <section className="w-full max-w-5xl mx-auto px-4 py-12">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-rose-950/40 via-[#161010] to-[#0A0A0A] border-2 border-rose-500/60 shadow-[0_0_60px_rgba(244,63,94,0.25)] text-center space-y-6 relative overflow-hidden">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold uppercase tracking-wider">
            <Flame className="w-4 h-4 text-rose-400" />
            <span>Stop Churn Today</span>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Don&apos;t offer another 14-day trial. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400">
                Show them the money they already lost.
              </span>
            </h2>
            <p className="text-sm sm:text-lg text-zinc-200 max-w-xl mx-auto leading-relaxed">
              Skip speculative vanity metrics. See exactly how much recurring revenue has failed and reclaim it with founder-approved outreach.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={handleOpenAuditOrTour}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:brightness-110 text-black font-black text-base shadow-[0_0_35px_rgba(16,185,129,0.35)] transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 text-black" />
              <span>Start Free Churn Audit — Pay Only When Recovered</span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-center gap-4 text-xs text-zinc-400 font-mono flex-wrap">
            <span>⚡ Read-Only &amp; CSV Privacy Shield</span>
            <span>•</span>
            <span>🚀 2-Minute Audit</span>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* CLEAN FOOTER */}
      {/* ========================================================================= */}
      <footer className="w-full border-t border-white/5 py-8 text-center text-xs text-zinc-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-black text-xs">
              P
            </div>
            <span className="text-zinc-300 font-bold">PRIME AI</span>
            <span>— Revenue Recovery &amp; Churn Defense</span>
          </div>

          {/* Legal Compliance & Meta WhatsApp Review Quick Links */}
          <div className="flex items-center gap-3 flex-wrap justify-center text-[11px] text-zinc-400">
            {onOpenLegal && (
              <>
                <button
                  type="button"
                  onClick={() => onOpenLegal('meta-whatsapp')}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer font-bold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20"
                >
                  <span>Meta WhatsApp Cloud API</span>
                </button>
                <a
                  href="/privacy-policy"
                  onClick={(e) => {
                    if (onOpenLegal) {
                      e.preventDefault();
                      onOpenLegal('privacy');
                    }
                  }}
                  className="hover:text-[#FFD700] transition-colors cursor-pointer font-medium"
                >
                  Privacy Policy &amp; Disclaimer
                </a>
                <button
                  type="button"
                  onClick={() => onOpenLegal('terms')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Terms of Service
                </button>
                <button
                  type="button"
                  onClick={() => onOpenLegal('deletion')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  User Data Deletion
                </button>
              </>
            )}
            <button
              type="button"
              onClick={handleOpenAuditOrTour}
              className="text-rose-400 hover:underline transition-colors cursor-pointer font-bold"
            >
              Free Churn Report
            </button>
            <button
              type="button"
              onClick={handleLaunchTour}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Product Tour
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth('signup')}
              className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white transition-colors font-bold cursor-pointer shadow-sm"
            >
              Create Account
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};
