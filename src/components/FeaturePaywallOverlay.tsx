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
    'Unlimited 24/7 AI-assisted operations & reasoning. AI will help you to close.',
    'Real-time deal risk detection and AI outreach',
    'Custom fine-tuned executive neural twin model',
    'Multi-tenant data isolation & SOC2 compliance'
  ],
  isDemoMode = false,
  onOpenAuth,
  children
}) => {
  const { isPro, isTrialActive, isFeatureLocked, openUpgradeModal, redirectToCheckout, companyName } = useAuth();

  // In demo mode or trial, render fully interactive with an informative conversion ribbon
  if (isDemoMode) {
    return (
      <div className="relative w-full space-y-4">
        <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#181818] to-amber-500/10 border border-[#FFD700]/30 flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-2 text-amber-200">
            <Sparkles className="w-4 h-4 text-[#FFD700] animate-pulse shrink-0" />
            <span>
              <strong>Full Interactive Access:</strong> Live preview of <strong className="text-white">{featureName}</strong> active.
            </span>
          </div>
          {onOpenAuth && (
            <button
              onClick={() => onOpenAuth('signup')}
              className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#FFD700] via-amber-300 to-[#FFC700] text-black font-extrabold hover:brightness-110 transition-all text-xs cursor-pointer shadow-sm flex items-center gap-1 shrink-0"
            >
              <Crown className="w-3.5 h-3.5 text-black" />
              <span>Connect Your Company (14-Day Free Trial) →</span>
            </button>
          )}
        </div>
        <div className="w-full">
          {children}
        </div>
      </div>
    );
  }

  // Check if locked
  const locked = isFeatureLocked(featureName.toLowerCase());

  return (
    <div className="relative w-full space-y-4">
      {locked && (
        <div className="px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-950/60 via-zinc-900 to-amber-950/60 border border-[#FFD700]/35 flex flex-wrap items-center justify-between gap-3 text-xs shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 text-amber-200">
            <div className="w-6 h-6 rounded-lg bg-[#FFD700]/20 flex items-center justify-center text-[#FFD700] shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-white">{featureName}</span>
              <span className="text-white/60 ml-2 hidden sm:inline">
                {featureDescription || 'Enterprise feature active in your workspace.'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => openUpgradeModal('Pro')}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FFD700] via-amber-300 to-[#FFC700] text-black font-extrabold hover:brightness-110 transition-all text-xs cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5 text-black" />
              <span>Unlock Unlimited Pro →</span>
            </button>
          </div>
        </div>
      )}

      {/* Children render 100% full, sharp, unblurred, and interactive */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
};
