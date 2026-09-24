import React, { useState } from 'react';
import { Sparkles, Mail, Building2, User, ArrowRight, X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { recordLeadSignup } from '../services/analytics';

interface DemoLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DemoLeadModal: React.FC<DemoLeadModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid work or personal email address.');
      return;
    }

    setSubmitting(true);
    try {
      const derivedName = fullName.trim() || cleanEmail.split('@')[0];
      const derivedCompany = companyName.trim() || `${derivedName}'s Organization`;

      // Record lead in Firestore & local cache
      await recordLeadSignup({
        email: cleanEmail,
        fullName: derivedName,
        companyName: derivedCompany,
        industry: 'Executive / Tech',
        plan: 'Live Demo Access'
      });

      // Save unlock state so user doesn't get prompted repeatedly in this session
      try {
        localStorage.setItem('prime_demo_unlocked_email', cleanEmail);
      } catch {}

      onSuccess();
    } catch (err) {
      console.error('Failed to register demo lead:', err);
      // Still allow them in gracefully so they don't get stuck
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-[#111111] border border-[#FFD700]/35 p-6 sm:p-8 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge & Icon */}
        <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/25 flex items-center justify-center mb-4 text-[#FFD700]">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>

        {/* Header */}
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Unlock Interactive Demo
        </h2>
        <p className="text-xs text-white/60 mt-1.5 leading-relaxed">
          Enter your email to instantly launch the live C-Suite AI fleet workspace with pre-populated telemetry.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-wider mb-1">
              Work or Personal Email <span className="text-[#FFD700]">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@company.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] text-white text-xs outline-none transition-all placeholder:text-white/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-wider mb-1">
                Your Name <span className="text-white/40 text-[10px]">(optional)</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-white/15 focus:border-[#FFD700] text-white text-xs outline-none transition-all placeholder:text-white/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-wider mb-1">
                Company <span className="text-white/40 text-[10px]">(optional)</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Labs"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-white/15 focus:border-[#FFD700] text-white text-xs outline-none transition-all placeholder:text-white/30"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#FFD700] via-yellow-400 to-[#FFD700] hover:brightness-110 text-black text-xs font-black flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{submitting ? 'Unlocking Workspace...' : 'Enter Live Demo Now'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Benefits summary */}
        <div className="mt-5 pt-4 border-t border-white/10 space-y-1.5 text-[11px] text-white/50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Instant sandbox entry — no password or credit card needed</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FFD700] shrink-0" />
            <span>Zero spam guarantee. 100% confidential.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
