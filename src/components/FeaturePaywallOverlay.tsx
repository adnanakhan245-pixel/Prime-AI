import React from 'react';
import { 
  Lock, 
  Sparkles, 
  Crown, 
  CreditCard, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap,
  Activity,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface FeaturePaywallOverlayProps {
  featureName: string;
  featureDescription?: string;
  benefits?: string[];
  isDemoMode?: boolean;
  onOpenAuth?: (mode: 'signup') => void;
  children?: React.ReactNode;
}

export const FeaturePaywallOverlay: React.FC<FeaturePaywallOverlayProps> = ({
  featureName,
  featureDescription,
  benefits = [
    'Unlimited 24/7 autonomous operations & reasoning',
    'Real-time deal risk detection and AI outreach',
    'Custom fine-tuned executive neural twin model',
    'Multi-tenant data isolation & SOC2 compliance'
  ],
  isDemoMode = false,
  onOpenAuth,
  children
}) => {
  const { isPro, isTrialActive, isFeatureLocked, openUpgradeModal, redirectToCheckout, companyName } = useAuth();

  // In demo mode, give full interactive access with an informative conversion banner
  if (isDemoMode) {
    return (
      <div className="relative w-full space-y-3">
        <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#181818] to-amber-500/10 border border-[#FFD700]/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-200">
            <Sparkles className="w-4 h-4 text-[#FFD700] animate-pulse shrink-0" />
            <span>
              <strong>Sandbox Preview Active:</strong> Test-driving <strong>{featureName}</strong> with Acme Corp sample telemetry.
            </span>
          </div>
          {onOpenAuth && (
            <button
              onClick={() => onOpenAuth('signup')}
              className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#FFD700] via-amber-300 to-[#FFC700] text-black font-extrabold hover:brightness-110 transition-all text-xs cursor-pointer shadow-sm flex items-center gap-1 shrink-0"
            >
              <Crown className="w-3.5 h-3.5 text-black" />
              <span>Claim Your 14-Day Free Trial →</span>
            </button>
          )}
        </div>
        {children}
      </div>
    );
  }

  // If the feature is not locked (e.g. active paid or within 14-day trial), render the content normally
  const locked = isFeatureLocked(featureName.toLowerCase());

  if (!locked) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden min-h-[500px]">
      {/* Blurred background preview of the feature */}
      <div className="filter blur-md opacity-30 pointer-events-none select-none transition-all duration-300">
        {children}
      </div>

      {/* Paywall Overlay */}
      <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-black/75 backdrop-blur-md">
        <div className="max-w-lg w-full rounded-3xl bg-gradient-to-b from-[#181818] to-[#0D0D0D] border border-[#FFD700]/30 p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-center space-y-6 animate-fade-in">
          
          {/* Header Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFD700]/20 to-amber-500/10 border border-[#FFD700]/40 flex items-center justify-center text-[#FFD700] mx-auto shadow-[0_0_30px_rgba(255,215,0,0.2)]">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-mono font-bold">
              <span>🔒 14-Day Free Trial Expired</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
              Unlock <span className="font-semibold text-[#FFD700]">{featureName}</span>
            </h2>
            
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              {featureDescription || `Your 14-day free trial has concluded. Upgrade ${companyName} to PRIME AI Pro to unlock ${featureName} and continue automated operations.`}
            </p>
          </div>

          {/* Benefits List */}
          <div className="bg-[#111111] rounded-2xl p-4 border border-white/5 space-y-2.5 text-left text-xs text-white/80">
            {benefits.map((b, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#FFD700] shrink-0 mt-0.5" />
                <span>{b}</span>
              </div>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => openUpgradeModal('Pro')}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#FFD700] via-amber-400 to-amber-500 text-black font-extrabold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,215,0,0.3)] cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Upgrade to Pro with Stripe Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-white/40 font-mono">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instant 30-Day Activation</span>
              </span>
              <span>•</span>
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
