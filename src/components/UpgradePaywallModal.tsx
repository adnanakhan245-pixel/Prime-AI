import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  Crown, 
  CreditCard, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  Building2, 
  CheckCircle2,
  Lock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SAAS_PLANS } from '../services/subscription';
import { PlanTier } from '../types';

export const UpgradePaywallModal: React.FC = () => {
  const { 
    upgradeModalOpen, 
    setUpgradeModalOpen, 
    selectedUpgradePlan, 
    companyName, 
    companyId,
    trialDaysRemaining,
    isTrialExpired,
    upgradeToPlan,
    activateInstantPaidAccess,
    redirectToCheckout 
  } = useAuth();

  const [activePlan, setActivePlan] = useState<'Starter' | 'Pro' | 'Enterprise'>(selectedUpgradePlan || 'Pro');
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!upgradeModalOpen) return null;

  const plans = [
    {
      tier: 'Starter' as PlanTier,
      name: 'Starter',
      price: billingInterval === 'annual' ? 399 : 499,
      tagline: 'Growing SaaS Leadership',
      description: 'Autonomous email triage, document analyzer, and baseline operational metrics.',
      features: [
        'Up to 5 Executive Seats',
        '250 AI Actions / month',
        'Email Triage & Draft Generator',
        'Company Isolated Supabase DB',
        'Standard Email Support'
      ],
      popular: false
    },
    {
      tier: 'Pro' as PlanTier,
      name: 'Pro (Most Popular)',
      price: billingInterval === 'annual' ? 1199 : 1499,
      tagline: 'Autonomous AI Chief of Operations',
      description: 'Full-scale strategic executive intelligence, deal closing automation, and real-time revenue telemetry.',
      features: [
        'Unlimited AI Operations',
        'Brain 3.0 CEO Digital Twin',
        'Revenue Radar & Churn Sentry',
        'Deal Rescue Closer Agent',
        '9:00 AM Automated Executive Briefing',
        'Multi-Tenant Company Isolation',
        '24/7 Priority Concierge SLA'
      ],
      popular: true
    },
    {
      tier: 'Enterprise' as PlanTier,
      name: 'Enterprise',
      price: billingInterval === 'annual' ? 2499 : 2999,
      tagline: 'Custom Dedicated Infrastructure',
      description: 'Private model instances, custom ERP/CRM data warehouse connectors, and bespoke AI tuning.',
      features: [
        'Unlimited Everything & Custom Models',
        'Dedicated Private Gemini Engine',
        'Custom Data Warehouse Sync (Snowflake/BigQuery)',
        'Custom SSO & SOC2 Type II SLA',
        'Dedicated Solutions Architect',
        'Custom Integrations & Migration'
      ],
      popular: false
    }
  ];

  const handleStripeCheckout = async () => {
    setLoadingCheckout(true);
    setSuccessMessage(null);
    try {
      redirectToCheckout(activePlan);
    } catch (err: any) {
      console.warn('Checkout fallback to simulated activation:', err);
      await upgradeToPlan(activePlan, 'CARD');
      setSuccessMessage(`Successfully upgraded ${companyName} to PRIME AI ${activePlan}!`);
      setTimeout(() => {
        setUpgradeModalOpen(false);
      }, 2000);
    } finally {
      setLoadingCheckout(false);
    }
  };

  const handleInstantTestUpgrade = async () => {
    setLoadingCheckout(true);
    try {
      await activateInstantPaidAccess(activePlan, 'CARD');
      setSuccessMessage(`Activated 30-day ${activePlan} plan for ${companyName}! All premium features unlocked.`);
      setTimeout(() => {
        setUpgradeModalOpen(false);
      }, 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCheckout(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#161616] via-[#121212] to-[#0A0A0A] border border-[#FFD700]/30 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.9)] my-8">
        
        {/* Close Button */}
        <button
          onClick={() => setUpgradeModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EXECUTIVE UPGRADE PORTAL</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-light text-white tracking-tight">
            Upgrade <span className="font-semibold text-[#FFD700]">{companyName}</span> to Pro
          </h2>

          <p className="text-xs sm:text-sm text-white/60">
            {isTrialExpired 
              ? 'Your 14-day free trial has expired. Upgrade your workspace to unlock Brain 3.0, Revenue Radar, and continuous 24/7 AI execution.'
              : `You have ${trialDaysRemaining} days remaining in your 14-day trial. Lock in early founder pricing with uninterrupted access.`}
          </p>

          {/* Billing Switcher */}
          <div className="inline-flex items-center p-1 rounded-xl bg-[#0D0D0D] border border-white/10 text-xs mt-2">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                billingInterval === 'monthly' ? 'bg-[#FFD700] text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingInterval('annual')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                billingInterval === 'annual' ? 'bg-[#FFD700] text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              <span>Annual (Save 20%)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">20% OFF</span>
            </button>
          </div>
        </div>

        {/* Success Message Banner */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center justify-center gap-2 animate-fade-in shadow-[0_0_25px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {plans.map((p) => {
            const isSelected = activePlan === p.tier;
            return (
              <div
                key={p.tier}
                onClick={() => setActivePlan(p.tier as any)}
                className={`relative rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#1C1A14] to-[#121212] border-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.15)] ring-1 ring-[#FFD700]/50'
                    : 'bg-[#121212] border-white/10 hover:border-white/20'
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#FFD700] to-amber-500 text-black text-[10px] font-extrabold tracking-wide uppercase shadow-md">
                    Recommended
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-base">{p.name}</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-[#FFD700] bg-[#FFD700] text-black' : 'border-white/20'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white font-mono">${p.price}</span>
                    <span className="text-xs text-white/50">/month</span>
                  </div>

                  <p className="text-xs text-white/60 leading-relaxed min-h-[36px]">
                    {p.description}
                  </p>

                  <div className="border-t border-white/5 pt-3 space-y-2 text-xs text-white/80">
                    {p.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#FFD700] shrink-0 mt-0.5" />
                        <span className="text-[11px]">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Bottom Bar */}
        <div className="rounded-2xl bg-[#0D0D0D] border border-white/10 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs">
            <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white">Stripe Instant Checkout</div>
              <div className="text-[11px] text-white/50">
                Selected: <strong className="text-[#FFD700]">{activePlan} Plan</strong> • 30-Day Active Guarantee
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handleInstantTestUpgrade}
              disabled={loadingCheckout}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white font-medium text-xs border border-white/10 transition-all cursor-pointer"
              title="Instantly test the unlocked Pro plan without actual credit card charges"
            >
              1-Click Demo Upgrade
            </button>

            <button
              onClick={handleStripeCheckout}
              disabled={loadingCheckout}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FFD700] via-amber-400 to-amber-500 text-black font-extrabold text-xs hover:brightness-110 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.3)] cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>{loadingCheckout ? 'Connecting to Stripe...' : `Checkout ${activePlan} with Stripe`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-[11px] font-mono text-white/40">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit SSL Encrypted</span>
          </span>
          <span>•</span>
          <span>SOC2 Type II Isolation</span>
          <span>•</span>
          <span>Cancel Online in 1 Click</span>
        </div>

      </div>
    </div>
  );
};
