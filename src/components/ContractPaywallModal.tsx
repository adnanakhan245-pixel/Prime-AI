import React from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  Clock,
  Zap,
  Download
} from 'lucide-react';

interface ContractPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueFree: () => void;
  onUpgradePro: () => void;
}

export const ContractPaywallModal: React.FC<ContractPaywallModalProps> = ({
  isOpen,
  onClose,
  onContinueFree,
  onUpgradePro
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#111111] border border-[#FFD700]/40 p-6 sm:p-8 shadow-[0_0_50px_rgba(255,215,0,0.18)] text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge & Lock Icon */}
        <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/15 border border-[#FFD700]/30 flex items-center justify-center mb-4 text-[#FFD700]">
          <Lock className="w-6 h-6 animate-pulse" />
        </div>

        {/* Modal Title & Text per user requirement */}
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          You've used your free check
        </h2>
        <p className="text-sm text-zinc-300 mt-2 font-medium">
          Get unlimited contract checks + PDF export
        </p>

        {/* Benefits list */}
        <div className="mt-5 p-4 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-2.5 text-xs">
          <div className="flex items-center gap-2.5 text-zinc-200">
            <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
            <span><strong className="text-white">Unlimited</strong> AI Contract Checks (no daily limits)</span>
          </div>
          <div className="flex items-center gap-2.5 text-zinc-200">
            <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
            <span><strong className="text-white">Instant PDF Export</strong> with executive redline synthesis</span>
          </div>
          <div className="flex items-center gap-2.5 text-zinc-200">
            <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
            <span>Hidden liability &amp; penalty clause detection in 30 seconds</span>
          </div>
          <div className="flex items-center gap-2.5 text-zinc-200">
            <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
            <span>Full AI Fleet access during beta</span>
          </div>
        </div>

        {/* Action Buttons as requested */}
        <div className="mt-6 space-y-3">
          {/* Button 2: Upgrade to Pro - $19/month */}
          <button
            type="button"
            onClick={onUpgradePro}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FFD700] via-yellow-400 to-[#FFD700] hover:brightness-110 text-black text-sm font-black flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,215,0,0.35)] transition-all cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Upgrade to Pro - $19/month</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Button 1: Continue Free (1 check/day) */}
          <button
            type="button"
            onClick={onContinueFree}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>Continue Free (1 check/day)</span>
          </button>
        </div>

        {/* Footer reassurance */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-4 text-[11px] text-zinc-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Cancel anytime
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-[#FFD700]" /> Instant activation
          </span>
        </div>
      </div>
    </div>
  );
};
