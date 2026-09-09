import React, { useState } from 'react';
import { 
  Check, 
  Crown, 
  Zap, 
  Shield, 
  Building2, 
  Users, 
  ArrowRight, 
  Sparkles, 
  HelpCircle,
  Clock,
  CreditCard,
  Lock,
  CheckCircle2,
  ChevronRight,
  X,
  ExternalLink,
  Calendar,
  AlertCircle,
  Calculator
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SAAS_PLANS } from '../services/subscription';
import { PlanTier } from '../types';

interface PlansViewProps {
  onNavigate?: (view: string) => void;
}

export const PlansView: React.FC<PlansViewProps> = ({ onNavigate }) => {
  const { 
    subscription, 
    company, 
    companyName, 
    companyId, 
    isPro, 
    isTrialActive, 
    trialDaysRemaining, 
    daysRemaining,
    aiActionsRemaining, 
    upgradeToPlan, 
    activateInstantPaidAccess,
    redirectToCheckout 
  } = useAuth();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pricing values strictly in USD ($)
  const prices = {
    starterMo: 499,
    proMo: 1499,
    entMo: 2999,
  };

  const currentPlanTier = (subscription?.planTier || (company?.plan as PlanTier) || 'Pro');

  const handleDirectCardCheckout = async (planTier: 'Starter' | 'Pro' | 'Enterprise') => {
    setUpgradingPlan(planTier);
    setSuccessMessage(null);
    try {
      redirectToCheckout(planTier);
    } catch (e: any) {
      console.warn('Checkout fallback:', e);
      await upgradeToPlan(planTier, 'CARD');
      setSuccessMessage(`Workspace upgraded to PRIME AI ${planTier} plan with 1-month automatic validity!`);
      setUpgradingPlan(null);
    }
  };

  const handleInstantUpgradeTest = async (planTier: 'Starter' | 'Pro' | 'Enterprise') => {
    setUpgradingPlan(planTier);
    try {
      await activateInstantPaidAccess(planTier, 'PAYONEER');
      setSuccessMessage(`Activated 1-month ${planTier} plan for ${companyName} (${companyId}). All features unlocked for 30 days!`);
    } catch (e) {
      console.error(e);
    } finally {
      setUpgradingPlan(null);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Top Banner & Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-xs font-mono font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>MULTI-TENANT ENTERPRISE OPERATING SYSTEM</span>
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-white font-sans">
          Simple, Transparent <span className="font-semibold text-[#FFD700]">SaaS Pricing</span>
        </h1>
        
        <p className="text-sm sm:text-base text-white/60 leading-relaxed">
          Scale your executive leverage with autonomous AI Chief of Operations. Every plan includes full Supabase company data isolation, 24/7 strategic intelligence, and SOC2 compliance.
        </p>

        {/* Current Active Workspace Status Bar */}
        <div className="mt-4 p-4 rounded-2xl bg-[#121212] border border-white/10 flex flex-wrap items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center text-[#FFD700]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-white/50">Active Workspace:</div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{companyName}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/70">
                  {companyId}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            {/* ROI Calculator Interactive Justifier Button */}
            {onNavigate && (
              <button
                onClick={() => onNavigate('roi-calculator')}
                className="px-3.5 py-1.5 rounded-lg bg-[#FFD700]/15 hover:bg-[#FFD700]/25 border border-[#FFD700]/40 text-[#FFD700] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                title="Model custom business savings with D3.js"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>📊 Interactive ROI Calculator</span>
              </button>
            )}

            {isPro ? (
              <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>1-Month Active Access: <strong>{currentPlanTier} Plan</strong> ({daysRemaining} days remaining • Unlimited AI)</span>
              </div>
            ) : isTrialActive ? (
              <div className="px-3 py-1.5 rounded-lg bg-[#FFD700]/15 border border-[#FFD700]/40 text-[#FFD700] flex items-center gap-2 font-bold shadow-[0_0_15px_rgba(255,215,0,0.15)]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>⏳ 14-Day Free Trial: <strong>{trialDaysRemaining} days remaining</strong> (No Credit Card Required)</span>
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2 font-bold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>🔒 14-Day Trial Expired: <strong>Upgrade to Continue</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* 14-Day Free Trial Prominent Assurance Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#FFD700]/10 to-amber-500/10 border border-[#FFD700]/30 text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFD700]/20 border border-[#FFD700]/40 flex items-center justify-center text-[#FFD700] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span>14-Day Risk-Free Trial on All Features</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFD700] text-black font-mono font-extrabold">NO CREDIT CARD</span>
              </h4>
              <p className="text-xs text-white/60 mt-0.5">
                Every new workspace gets 14 days of full access to Brain 3.0, Revenue Radar, Deal Closer, and Daily Briefings without entering payment details.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isTrialActive && (
              <span className="text-xs font-mono text-[#FFD700] bg-black/40 px-3 py-1.5 rounded-xl border border-[#FFD700]/30">
                {trialDaysRemaining} Days Active
              </span>
            )}
          </div>
        </div>

        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs font-medium flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.15)] animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* Billing Cycle Switcher */}
      <div className="flex items-center justify-center max-w-4xl mx-auto">
        <div className="p-1 rounded-xl bg-[#141414] border border-white/10 inline-flex items-center gap-1 text-xs">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              billingCycle === 'monthly' ? 'bg-[#FFD700] text-black shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            Monthly Billing (USD)
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              billingCycle === 'annual' ? 'bg-[#FFD700] text-black shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            Annual Billing (USD)
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Starter Plan ($499/mo) */}
        <div className="relative rounded-3xl bg-[#121212] border border-white/10 p-8 flex flex-col justify-between hover:border-white/20 transition-all">
          <div className="space-y-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-white/40 font-mono font-bold">Boutique &amp; Funded Startups</div>
              <h3 className="text-2xl font-bold text-white mt-1">Starter</h3>
              <p className="text-xs text-white/50 mt-2 min-h-[36px]">
                High-velocity AI operations for boutique founders establishing pipeline velocity.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">
                ${prices.starterMo.toLocaleString()}
              </span>
              <span className="text-xs text-white/40 font-mono">/ month</span>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5 text-xs text-white/80">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
                <span>Up to <strong>5 Executive Seats</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
                <span><strong>500 Autonomous AI Actions</strong> / month</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
                <span>Real-Time Autonomous Email Triage</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
                <span>Multi-Tenant Supabase Isolation</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
                <span>Daily 9:00 AM Executive Digest</span>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-2.5">
            <a
              href="https://link.payoneer.com/Token?t=5458C90B22F3430F88E7A1FBDC6C5FDB&src=pl"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer text-center active:scale-[0.99]"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay with Payoneer</span>
            </a>
            <button
              onClick={() => handleInstantUpgradeTest('Starter')}
              className="w-full text-[10px] text-white/30 hover:text-white/70 text-center cursor-pointer"
            >
              ⚡ 1-Click Instant 30-Day Test Unlock
            </button>
          </div>
        </div>

        {/* Pro Plan ($1499/mo) - Highlighted Most Popular */}
        <div className="relative rounded-3xl bg-[#161616] border-2 border-[#FFD700] p-8 flex flex-col justify-between shadow-[0_0_50px_rgba(255,215,0,0.15)] transform md:-translate-y-2">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#FFD700] text-black font-extrabold text-[10px] tracking-wider uppercase shadow-md whitespace-nowrap">
            MOST POPULAR • REPLACES $250K/YR COO
          </div>

          <div className="space-y-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-[#FFD700] font-mono font-bold">High-Growth C-Suite</div>
              <h3 className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
                <span>Pro</span>
                <Crown className="w-5 h-5 text-[#FFD700]" />
              </h3>
              <p className="text-xs text-white/50 mt-2 min-h-[36px]">
                The complete autonomous COO stack replacing $250k/year executive overhead with 24/7 strategic speed.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-[#FFD700]">
                ${prices.proMo.toLocaleString()}
              </span>
              <span className="text-xs text-white/40 font-mono">/ month</span>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10 text-xs text-white/90">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
                <span>Up to <strong>20 Executive Seats</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
                <span><strong>Unlimited Autonomous AI Actions</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
                <span><strong>CEO Digital Twin 3.0</strong> Voice &amp; Decision Clone</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
                <span><strong>Revenue Radar</strong> &amp; At-Risk ARR Telemetry</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
                <span><strong>PRIME Closer</strong> Sales Audio Coach</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
                <span>Gemini 3.7 Flash High-Reasoning Engine</span>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-2.5">
            <a
              href="https://link.payoneer.com/Token?t=8333923BB69649B697D2831CEAF91E38&src=pl"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-[#FFD700] hover:bg-[#FFE55C] text-black font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,215,0,0.3)] text-center active:scale-[0.99]"
            >
              <Zap className="w-4 h-4 text-black fill-black" />
              <span>Pay with Payoneer</span>
            </a>
            <button
              onClick={() => handleInstantUpgradeTest('Pro')}
              className="w-full text-[10px] text-[#FFD700]/70 hover:text-[#FFD700] text-center cursor-pointer"
            >
              ⚡ 1-Click Instant 30-Day Pro Unlock
            </button>
          </div>
        </div>

        {/* Enterprise Plan ($2,999/mo) */}
        <div className="relative rounded-3xl bg-[#121212] border border-white/10 p-8 flex flex-col justify-between hover:border-white/20 transition-all">
          <div className="space-y-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-white/40 font-mono font-bold">PE &amp; Multi-Entity Groups</div>
              <h3 className="text-2xl font-bold text-white mt-1">Enterprise</h3>
              <p className="text-xs text-white/50 mt-2 min-h-[36px]">
                Dedicated private model clusters, custom multi-entity partitioning, and dedicated COO engineering SLAs.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">
                ${prices.entMo.toLocaleString()}
              </span>
              <span className="text-xs text-white/40 font-mono">/ month</span>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5 text-xs text-white/80">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
                <span><strong>Unlimited Seats</strong> &amp; Subsidiaries</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
                <span>Dedicated Single-Tenant Instance</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
                <span>Custom ERP, CRM &amp; Snowflake Connectors</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
                <span>Dedicated Solutions Architect &amp; 1-Hour SLA</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
                <span>GDPR, HIPAA &amp; SOC2 Type II Telemetry</span>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-2.5">
            <a
              href="https://link.payoneer.com/Token?t=F64460ABB669438DA92734B97AB9AF70&src=pl"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer text-center active:scale-[0.99]"
            >
              <Shield className="w-4 h-4" />
              <span>Pay with Payoneer</span>
            </a>
            <button
              onClick={() => handleInstantUpgradeTest('Enterprise')}
              className="w-full text-[10px] text-white/30 hover:text-white/70 text-center cursor-pointer"
            >
              ⚡ 1-Click Instant 30-Day Enterprise Unlock
            </button>
          </div>
        </div>
      </div>

      {/* Agency & Reseller Banner for $20K-$40K MRR */}
      <div className="max-w-6xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-black border border-indigo-500/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_40px_rgba(99,102,241,0.15)]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold">
            <Building2 className="w-3.5 h-3.5" />
            <span>AGENCY &amp; RESELLER PARTNER PROGRAM</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            Want to scale to <span className="text-indigo-400 font-mono font-black">$20,000 – $40,000/month</span> with PRIME AI?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
            Deploy your own 100% White-Label Agency Portal. Provision unlimited client sub-tenants under your custom domain and charge your clients $1,500–$4,000/mo while PRIME AI runs their entire autonomous operations.
          </p>
        </div>

        <button
          onClick={() => onNavigate && onNavigate('white-label')}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(99,102,241,0.35)] transition-all cursor-pointer whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4" />
          <span>Open Agency Portal</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Enterprise Security & Data Isolation Assurance */}
      <div className="max-w-4xl mx-auto p-6 rounded-2xl bg-[#101010] border border-white/10">
        <div className="flex items-center gap-3 mb-3 text-xs font-mono font-bold text-[#FFD700]">
          <Lock className="w-4 h-4" />
          <span>ZERO-CROSSOVER MULTI-TENANT SECURITY GUARANTEE</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-white/60">
          <div>
            <div className="font-semibold text-white mb-1">Company-Level Partitioning</div>
            <p>Every CRM deal, briefing, email, and subscription query is hard-isolated by <code>company_id</code> in Supabase.</p>
          </div>
          <div>
            <div className="font-semibold text-white mb-1">Payoneer Enterprise Security</div>
            <p>Direct secure checkout, instant tokenized verification, with automated 30-day executive access.</p>
          </div>
          <div>
            <div className="font-semibold text-white mb-1">24/7 High-Availability</div>
            <p>Failover across Gemini 3.7 Flash & 3.1 Flash-Lite ensuring uninterrupted C-Suite strategic velocity.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
