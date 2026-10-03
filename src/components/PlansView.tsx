import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  Lock, 
  Building2, 
  Link as LinkIcon, 
  Edit3, 
  Save, 
  Copy, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Check,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PlansViewProps {
  onNavigate?: (view: string) => void;
}

const STORAGE_KEY = 'prime_app_payment_link';
const DEFAULT_PAYONEER_LINK = 'https://link.payoneer.com/Token?t=FD68511E57C241E098B3DE26AF829EF2&src=pl';
const PRICE_DISPLAY = '$29';

export const PlansView: React.FC<PlansViewProps> = ({ onNavigate }) => {
  const { companyName, companyId, isPro, daysRemaining, activateInstantPaidAccess } = useAuth();

  // Load custom payment link from storage or use user-provided Payoneer link as default
  const [paymentLink, setPaymentLink] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_PAYONEER_LINK;
  });

  const [inputLink, setInputLink] = useState(paymentLink);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activating, setActivating] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState(false);

  useEffect(() => {
    if (paymentLink) {
      localStorage.setItem(STORAGE_KEY, paymentLink);
    }
  }, [paymentLink]);

  const handleSaveLink = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLink = inputLink.trim();
    if (cleanLink) {
      setPaymentLink(cleanLink);
      localStorage.setItem(STORAGE_KEY, cleanLink);
      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const handleCopy = () => {
    if (!paymentLink) return;
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenPayoneer = () => {
    if (paymentLink) {
      window.open(paymentLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleConfirmPaid = async () => {
    setActivating(true);
    try {
      await activateInstantPaidAccess('Pro', 'PAYONEER');
      setActivationSuccess(true);
      setTimeout(() => setActivationSuccess(false), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16 max-w-4xl mx-auto pt-6 px-4">
      {/* Top Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-xs font-mono font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>OFFICIAL PAYONEER CHECKOUT</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-light text-white tracking-tight">
          PRIME AI <span className="text-[#FFD700] font-semibold">Executive License</span>
        </h1>

        <p className="text-sm sm:text-base text-white/60 max-w-lg mx-auto leading-relaxed">
          Pay securely via Payoneer to unlock full 24/7 autonomous Chief of Operations, Revenue Radar, and executive delegation.
        </p>
      </div>

      {/* Main Payment Buy Card */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-[#181818] via-[#121212] to-[#0D0D0D] border-2 border-[#FFD700]/50 shadow-[0_0_60px_rgba(255,215,0,0.18)] space-y-8">
        
        {/* Workspace Identifier Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700]">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-white/50">Billing Workspace:</div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                <span>{companyName || 'Apex Enterprises'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/70">
                  {companyId || 'comp_apex_01'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isPro ? `Active Paid License (${daysRemaining}d)` : 'Active Workspace'}</span>
            </span>
          </div>
        </div>

        {/* Pricing & Plan Highlight */}
        <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-[#1F1C12] via-[#141414] to-[#1F1C12] border border-[#FFD700]/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FFD700] text-black text-[10px] font-black uppercase tracking-wider">
                SPECIAL OFFER
              </span>
              <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Instant Payoneer Authorization
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white">Full Autonomous COO Suite</h2>
            <p className="text-xs text-white/60 max-w-md">
              Unlimited AI operations, CEO Digital Twin 3.0, Revenue Radar deal sentry, and daily 9:00 AM executive briefings.
            </p>
          </div>

          <div className="text-left md:text-right shrink-0">
            <div className="text-xs text-white/40 uppercase font-mono tracking-wider">Price</div>
            <div className="flex items-baseline md:justify-end gap-1">
              <span className="text-4xl sm:text-5xl font-black text-[#FFD700] font-mono">{PRICE_DISPLAY}</span>
              <span className="text-sm text-white/60 font-mono">USD</span>
            </div>
            <div className="text-[11px] text-emerald-400 font-mono mt-0.5">Zero Recurring Commitment</div>
          </div>
        </div>

        {/* What is Unlocked Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300 pt-2">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5">
            <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
            <span>Unlimited AI Operations &amp; Strategy Guidance</span>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5">
            <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
            <span>CEO Digital Twin 3.0 Voice &amp; Delegation HUD</span>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5">
            <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
            <span>Revenue Radar &amp; ARR Churn Defense</span>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5">
            <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
            <span>Dedicated Multi-Tenant Bank-Grade Data Partitioning</span>
          </div>
        </div>

        {/* PRIMARY BUY BUTTON (THE PAYONEER PAYMENT LINK) */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleOpenPayoneer}
              className="w-full sm:flex-1 py-5 px-8 rounded-2xl bg-gradient-to-r from-amber-400 via-[#FFD700] to-yellow-500 hover:brightness-110 text-black font-black text-lg transition-all shadow-[0_0_40px_rgba(255,215,0,0.45)] flex items-center justify-center gap-3 cursor-pointer border-2 border-yellow-200 active:scale-[0.98]"
            >
              <CreditCard className="w-6 h-6 text-black" />
              <span>Buy Now — {PRICE_DISPLAY}</span>
              <ExternalLink className="w-5 h-5 text-black" />
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="w-full sm:w-auto px-5 py-5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all border border-white/15 flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
              title="Copy Payment Link"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#FFD700]" />}
              <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setInputLink(paymentLink);
                setIsEditing(!isEditing);
              }}
              className="w-full sm:w-auto px-4 py-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-medium text-xs transition-all border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              title="Edit Link URL"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Close' : 'Edit Link'}</span>
            </button>
          </div>

          {/* Active Link Pill */}
          <div className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
            <span className="text-white/40 shrink-0">Payoneer Link:</span>
            <span className="text-[#FFD700] truncate">{paymentLink}</span>
            <span className="text-[10px] text-emerald-400 font-bold shrink-0">Active</span>
          </div>

          {/* Post-Payment Activation Assistance */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-white/50">Already sent payment via Payoneer?</span>
            <button
              type="button"
              onClick={handleConfirmPaid}
              disabled={activating}
              className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{activating ? 'Activating...' : 'I have completed payment (Activate Now)'}</span>
            </button>
          </div>

          {activationSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center justify-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Your workspace license has been successfully activated for 30 days!</span>
            </div>
          )}
        </div>

        {/* Optional: Edit Payment Link form */}
        {isEditing && (
          <form onSubmit={handleSaveLink} className="p-5 rounded-2xl bg-[#101010] border border-white/15 space-y-3 animate-fade-in">
            <label className="text-xs font-bold text-white flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-[#FFD700]" />
              <span>Change / Update Payoneer Payment Link URL:</span>
            </label>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={inputLink}
                onChange={(e) => setInputLink(e.target.value)}
                placeholder="https://link.payoneer.com/..."
                required
                className="flex-1 bg-[#181818] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder-white/30 focus:border-[#FFD700] focus:outline-none transition-colors"
              />

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-[#FFD700] text-black font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer shrink-0"
              >
                <Save className="w-3.5 h-3.5 text-black" />
                <span>Save</span>
              </button>
            </div>
          </form>
        )}

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center justify-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Payoneer payment link updated successfully!</span>
          </div>
        )}

        {/* Footer Guarantee */}
        <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-white/50">
          <span className="flex items-center gap-1.5 font-mono">
            <Lock className="w-3.5 h-3.5 text-[#FFD700]" />
            <span>Payoneer Escrow &amp; Buyer Protection</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </span>
          <span>•</span>
          <span className="font-mono">Instant License Activation</span>
        </div>
      </div>
    </div>
  );
};
