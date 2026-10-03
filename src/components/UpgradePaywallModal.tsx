import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  Sparkles, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Lock,
  Building2,
  CheckCircle2,
  Activity,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UpgradePaywallModal: React.FC = () => {
  const { 
    upgradeModalOpen, 
    setUpgradeModalOpen, 
    companyName, 
    isTrialExpired,
    trialDaysRemaining,
    activateInstantPaidAccess
  } = useAuth();

  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!upgradeModalOpen) return null;

  const handleInstantUnlock = async () => {
    setLoadingCheckout(true);
    try {
      await activateInstantPaidAccess('Pro', 'CARD');
      setSuccessMessage(`Activated full executive access for ${companyName || 'your workspace'}! All features unlocked.`);
      setTimeout(() => {
        setUpgradeModalOpen(false);
      }, 1800);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCheckout(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#141414] border border-[#FFD700]/40 p-6 sm:p-8 shadow-[0_0_60px_rgba(255,215,0,0.18)] my-8">
        {/* Close Button */}
        <button
          onClick={() => setUpgradeModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FULL OPERATIONAL ACCESS</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
            Unlock Full <span className="font-semibold text-[#FFD700]">AI Chief of Operations</span>
          </h2>

          <p className="text-xs sm:text-sm text-white/60 max-w-lg mx-auto">
            {isTrialExpired 
              ? 'Your trial has ended. Re-activate uninterrupted 24/7 autonomous COO execution for your workspace.'
              : `Full access active for ${trialDaysRemaining} days. Unlock permanent executive leverage with 1 click.`}
          </p>
        </div>

        {/* Success Message Banner */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center justify-center gap-2 animate-fade-in shadow-[0_0_25px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Unified Executive License Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-[#1C1A14] to-[#121212] border border-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.15)] mb-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                <span>PRIME AI Executive License</span>
                <span className="px-2 py-0.5 rounded-full bg-[#FFD700] text-black text-[10px] font-extrabold uppercase">UNLIMITED</span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">Complete multi-tenant autonomous operations suite</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-[#FFD700]">Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-white/80">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
              <span>Unlimited Autonomous AI Operations</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
              <span>Brain 3.0 &amp; CEO Digital Twin</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
              <span>Revenue Radar &amp; Churn Defense</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
              <span>Deal Closer Coaching &amp; Sales HUD</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
              <span>Daily 9:00 AM Automated Briefing</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
              <span>Dedicated Multi-Tenant Encryption</span>
            </div>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="rounded-2xl bg-[#0D0D0D] border border-white/10 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs">
            <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white">Full Workspace Unlock</div>
              <div className="text-[11px] text-white/50">
                Workspace: <strong className="text-[#FFD700]">{companyName || 'Apex Enterprises'}</strong>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            <a
              href="https://link.payoneer.com/Token?t=FD68511E57C241E098B3DE26AF829EF2&src=pl"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-[#FFD700] to-yellow-500 text-black font-black text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.4)] cursor-pointer border border-yellow-200 active:scale-95"
            >
              <Zap className="w-4 h-4 text-black" />
              <span>Buy with Payoneer — $29</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleInstantUnlock}
              disabled={loadingCheckout}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-white/10 disabled:opacity-50"
            >
              <span>{loadingCheckout ? 'Activating...' : 'Activate Instant Access'}</span>
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
          <span>Bank-Grade Security</span>
          <span>•</span>
          <span>Instant Activation</span>
        </div>
      </div>
    </div>
  );
};
