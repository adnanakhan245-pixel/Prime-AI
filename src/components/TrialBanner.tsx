import React, { useState } from 'react';
import { 
  Clock, 
  Sparkles, 
  Lock, 
  Crown, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  X,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TrialBannerProps {
  onUpgradeClick?: () => void;
  compact?: boolean;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({ onUpgradeClick, compact = false }) => {
  const { 
    isPro, 
    isTrialActive, 
    isTrialExpired, 
    trialDaysRemaining, 
    daysRemaining,
    trialStartDate,
    trialEndDate,
    subscription,
    openUpgradeModal,
    isAdmin 
  } = useAuth();

  const [dismissed, setDismissed] = useState(false);

  // If dismissed or admin, don't obstruct unless strictly expired
  if (dismissed && !isTrialExpired) return null;

  const handleUpgrade = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      openUpgradeModal('Pro');
    }
  };

  // 1. ACTIVE PAID USER BANNER (Green/Gold subtle status)
  if (isPro) {
    if (compact) return null;
    return (
      <div className="bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-emerald-950/60 border-b border-emerald-500/20 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-emerald-300">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium">
            <strong>Active Executive Plan:</strong> {subscription?.plan || 'Pro'} Tier ({daysRemaining} days active • Unlimited AI Operations &amp; Telemetry)
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-400/80">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>SOC2 Encrypted Workspace</span>
        </div>
      </div>
    );
  }

  // 2. TRIAL EXPIRED PAYWALL BANNER (Rule 3 & 4: Lock premium features, show urgent upgrade prompt)
  if (isTrialExpired) {
    return (
      <div className="bg-gradient-to-r from-red-950/95 via-[#1A0A0A] to-amber-950/95 border-b border-red-500/40 px-4 py-3 shadow-[0_4px_20px_rgba(239,68,68,0.15)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-fade-in">
        <div className="flex items-center gap-3 text-red-200">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-red-100 flex items-center gap-2">
              <span>🔒 14-Day Free Trial Expired</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                Action Required
              </span>
            </div>
            <p className="text-[11px] text-red-300/80 mt-0.5">
              Brain 3.0, Revenue Radar, and Deal Alerts are locked. Upgrade to Pro to restore 24/7 autonomous COO execution.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
          <button
            onClick={handleUpgrade}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#FFD700] to-amber-500 text-black font-extrabold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.25)] cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Upgrade to Pro with Stripe ($499+)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // 3. ACTIVE 14-DAY TRIAL COUNTDOWN BANNER (Rule 5: "3 days left in trial" on top of dashboard)
  const totalTrialDays = 14;
  const daysUsed = Math.max(0, Math.min(totalTrialDays, totalTrialDays - trialDaysRemaining));
  const progressPercent = Math.round((daysUsed / totalTrialDays) * 100);

  // Dynamic urgency color scheme based on days remaining
  const isUrgent = trialDaysRemaining <= 3;

  return (
    <div className={`border-b px-4 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs transition-colors ${
      isUrgent 
        ? 'bg-gradient-to-r from-amber-950/90 via-[#161208] to-amber-950/90 border-amber-500/40 text-amber-200 shadow-[0_2px_15px_rgba(245,158,11,0.15)]'
        : 'bg-gradient-to-r from-[#121212] via-[#161616] to-[#121212] border-amber-400/20 text-white/90'
    }`}>
      {/* Left side: Countdown & Days Remaining Pill */}
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
          isUrgent 
            ? 'bg-amber-400/20 border-amber-400/50 text-amber-400 animate-pulse' 
            : 'bg-[#FFD700]/10 border-[#FFD700]/30 text-[#FFD700]'
        }`}>
          <Clock className="w-4 h-4" />
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span>⏳</span>
              <strong className={isUrgent ? 'text-amber-400' : 'text-[#FFD700]'}>
                {trialDaysRemaining === 1 ? '1 day left' : `${trialDaysRemaining} days left`} in your 14-day free trial
              </strong>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/10 hidden sm:inline-block">
              No credit card required
            </span>
          </div>

          <p className="text-[11px] text-white/60">
            Full access to Brain 3.0, Revenue Radar, and Executive Twin active until{' '}
            <span className="font-mono text-white/80">
              {trialEndDate ? new Date(trialEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '14 days'}
            </span>
          </p>
        </div>
      </div>

      {/* Center: Visual Progress Bar */}
      <div className="hidden lg:flex items-center gap-2.5 text-[11px] font-mono text-white/50 w-56">
        <span>Day {daysUsed}/14</span>
        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/5">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              isUrgent ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-gradient-to-r from-[#FFD700] to-amber-400'
            }`}
            style={{ width: `${Math.max(8, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Right side: Upgrade CTA */}
      <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
        <button
          onClick={handleUpgrade}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FFD700] to-amber-400 text-black font-extrabold hover:brightness-110 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,215,0,0.2)] cursor-pointer text-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Upgrade to Pro</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {!isUrgent && (
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
