import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  Building2, 
  User, 
  ShieldCheck, 
  Zap, 
  Check, 
  CreditCard, 
  ExternalLink,
  Sparkles,
  Server,
  Clock,
  Flame,
  ArrowRight,
  Mail,
  LogOut,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVerifyEmail?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onOpenVerifyEmail }) => {
  const { 
    user,
    profile, 
    isEmailVerified,
    updateCompanyProfile, 
    subscription, 
    isPro, 
    isTrialActive, 
    trialDaysRemaining, 
    aiActionsRemaining, 
    redirectToCheckout,
    upgradeToPro,
    signOut
  } = useAuth();
  const [companyName, setCompanyName] = useState(profile?.companyName || 'Apex Enterprises');
  const [role, setRole] = useState(profile?.role || 'CEO & Founder');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCompanyProfile(companyName, role);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpgradeClick = async () => {
    setUpgrading(true);
    try {
      redirectToCheckout();
    } catch (e) {
      console.error('Upgrade redirect error:', e);
      // Fallback direct upgrade
      await upgradeToPro();
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#161616] border border-white/10 p-6 sm:p-8 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center text-[#FFD700]">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-light text-white tracking-tight">
              Enterprise <span className="text-[#FFD700] font-semibold">Workspace Settings</span>
            </h2>
            <p className="text-xs text-white/40">Manage tenant profile, operational parameters, and plan tier.</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* User Account & Verification Section */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.email || profile?.email || 'CEO Account'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {isEmailVerified ? (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                      <ShieldCheck className="w-3 h-3" /> Email Verified
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 flex items-center gap-1 font-semibold">
                      <AlertTriangle className="w-3 h-3" /> Unverified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {!isEmailVerified && onOpenVerifyEmail && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenVerifyEmail();
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 text-[11px] font-bold transition-all cursor-pointer shrink-0"
              >
                Verify Now
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/60 mb-1">Company / Organization Name</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD700]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/60 mb-1">Your Executive Title / Role</label>
            <div className="relative">
              <User className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD700]"
              />
            </div>
          </div>

          {/* Subscription & Plan Status (Rule 5: Show Upgrade to Pro button if no active plan) */}
          <div className={`p-4 rounded-xl border space-y-3 transition-all ${
            isPro 
              ? 'bg-[#121212] border-[#FFD700]/30 shadow-[0_0_20px_rgba(255,215,0,0.05)]' 
              : 'bg-[#18150a] border-[#FFD700]/40 shadow-[0_0_30px_rgba(255,215,0,0.1)]'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Subscription Tier</span>
                {isPro && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Check className="w-3 h-3" /> ACTIVE PRO
                  </span>
                )}
              </div>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border font-mono ${
                isPro 
                  ? 'bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/30' 
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}>
                {isPro ? 'PRIME AI Pro ($1,000/mo)' : '14-Day Free Trial'}
              </span>
            </div>

            {/* Trial Telemetry if not Pro */}
            {!isPro ? (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#FFD700]" />
                    <div>
                      <p className="text-[10px] text-white/40 uppercase">Trial Remaining</p>
                      <p className="text-xs font-bold text-white">{trialDaysRemaining} Days Left</p>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <div>
                      <p className="text-[10px] text-white/40 uppercase">Free AI Actions</p>
                      <p className="text-xs font-bold text-white">{aiActionsRemaining} / 50 Left</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-white/60">
                  You are currently on the complimentary 14-day trial with 50 free AI actions. Upgrade to unlock unlimited autonomous operations and dedicated COO throughput.
                </p>

                {/* Payoneer Pro Direct Checkout Link */}
                <a
                  href="https://link.payoneer.com/Token?t=8333923BB69649B697D2831CEAF91E38&src=pl"
                  target="_blank"
                  rel="noopener noreferrer"
                  id="settings-upgrade-to-pro-btn"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFE55C] hover:to-[#FFB733] text-black font-black text-xs transition-all shadow-[0_0_25px_rgba(255,215,0,0.35)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] text-center"
                >
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Pay with Payoneer ($1,499/mo)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-black" />
                </a>
              </div>
            ) : (
              <p className="text-xs text-white/50">
                You have active executive Pro access ($1,499/mo). Unlimited AI autonomous email triage, Revenue Radar telemetry, and daily 9:00 AM executive briefings are fully unlocked.
              </p>
            )}
          </div>

          {/* Security & System Stack */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-[#121212] border border-white/5 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Payoneer & SOC2</p>
                <p className="text-[10px] text-white/30">End-to-End Encrypted</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#121212] border border-white/5 flex items-center gap-2.5">
              <Server className="w-4 h-4 text-[#FFD700] shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Gemini 3.7 & Supabase</p>
                <p className="text-[10px] text-white/30">Real-Time Autonomous Sync</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-3">
              {saved ? (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Workspace updated
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    signOut();
                  }}
                  className="text-xs font-medium text-red-400/80 hover:text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-red-500/10"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out of Workspace</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white/40 hover:text-white cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.15)] cursor-pointer transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

