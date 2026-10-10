import React from 'react';
import { ShieldCheck, ArrowLeft, Bot, AlertTriangle, Database, UserCheck, Lock } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onBack?: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBack }) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center py-12 px-4 sm:px-6 font-sans">
      <div className="w-full max-w-3xl space-y-8 animate-fadeIn">
        {/* Navigation & Back Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#FFD700]" />
            <span>Back to PRIME Workspace</span>
          </button>
          
          <div className="flex items-center gap-1.5 text-xs text-[#FFD700] font-mono font-bold bg-[#FFD700]/10 border border-[#FFD700]/30 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>OFFICIAL LEGAL COMPLIANCE</span>
          </div>
        </div>

        {/* Page Header */}
        <div className="border-b border-white/10 pb-6 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            PRIME - <span className="text-[#FFD700]">Privacy Policy &amp; Disclaimer</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/60">
            Last Updated: October 2026 • Enterprise SaaS AI-assisted Advisory Protection • AI will help you to close
          </p>
        </div>

        {/* The 4 Core Principles */}
        <div className="space-y-4">
          
          {/* 1. AI Assistant Only */}
          <div className="p-6 rounded-2xl bg-[#121212] border border-white/10 hover:border-[#FFD700]/30 transition-all shadow-xl space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FFD700] text-black font-black text-sm flex items-center justify-center shrink-0">
                1
              </div>
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>AI Assistant Only</span>
                  <Bot className="w-4 h-4 text-[#FFD700]" />
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  PRIME is an AI assistant tool. It provides suggestions only, not decisions. All final decisions are taken by the user/human. PRIME tagline everywhere should be: <strong className="text-[#FFD700]">&quot;AI will help you to close&quot;</strong> - NEVER write &quot;AI will close your deal&quot;.
                </p>
              </div>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/25 text-[#FFD700] text-xs font-semibold flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#FFD700]/20 text-[#FFD700] font-bold">Official Tagline</span>
              <span>&ldquo;AI will help you to close&rdquo;</span>
            </div>
          </div>

          {/* 2. No Liability */}
          <div className="p-6 rounded-2xl bg-[#121212] border border-white/10 hover:border-rose-500/30 transition-all shadow-xl space-y-2">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                2
              </div>
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>No Liability</span>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  We are not responsible for any business loss, deal loss, or financial loss from using AI suggestions. User is 100% responsible for approving actions.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Data */}
          <div className="p-6 rounded-2xl bg-[#121212] border border-white/10 hover:border-emerald-500/30 transition-all shadow-xl space-y-2">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-black font-black text-sm flex items-center justify-center shrink-0">
                3
              </div>
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>Data Protection &amp; Zero Credential Storage</span>
                  <Database className="w-4 h-4 text-emerald-400" />
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  We store only deal titles and amounts. We do NOT store client CNIC, bank details. All data is encrypted in Supabase.
                </p>
              </div>
            </div>
          </div>

          {/* 4. No Auto-Execution */}
          <div className="p-6 rounded-2xl bg-[#121212] border border-white/10 hover:border-blue-500/30 transition-all shadow-xl space-y-2">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                4
              </div>
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>No Auto-Execution (Human-in-the-Loop)</span>
                  <UserCheck className="w-4 h-4 text-blue-400" />
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  PRIME never automatically sends emails, closes deals, or charges clients without human approval.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer & Contact */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <div>
            Authorized Data Controller: <a href="mailto:adnanakhan245@gmail.com" className="text-[#FFD700] hover:underline">adnanakhan245@gmail.com</a>
          </div>
          <button
            onClick={handleBack}
            className="px-5 py-2.5 rounded-xl bg-[#FFD700] hover:bg-[#FFE033] text-black font-extrabold text-xs transition-colors cursor-pointer shadow-lg"
          >
            ← Return to PRIME Workspace
          </button>
        </div>
      </div>
    </div>
  );
};
