import React from 'react';
import { ShieldAlert, Info, Sparkles, UserCheck } from 'lucide-react';

interface AIGuidanceDisclaimerProps {
  variant?: 'banner' | 'modal' | 'compact' | 'footer' | 'pill';
  className?: string;
  companyId?: string;
  companyName?: string;
}

/**
 * Reusable badge satisfying RULE 2:
 * "Show this text on every AI suggestion box: 'Suggestion by AI - Final decision is yours'"
 */
export const AISuggestionBadge: React.FC<{ className?: string; size?: 'sm' | 'md' }> = ({
  className = '',
  size = 'md'
}) => (
  <div className={`inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-[#FFD700]/30 text-amber-200 font-medium select-none ${
    size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
  } ${className}`}>
    <Sparkles className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-[#FFD700] shrink-0`} />
    <span className="font-semibold text-white">Suggestion by AI - Final decision is yours</span>
  </div>
);

/**
 * Reusable container wrapper for AI suggestion cards
 */
export const AISuggestionBox: React.FC<{
  children: React.ReactNode;
  title?: string;
  className?: string;
}> = ({ children, title, className = '' }) => (
  <div className={`p-4 rounded-2xl bg-[#141414] border border-[#FFD700]/25 shadow-lg space-y-3 ${className}`}>
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#FFD700]" />
        <span className="text-xs font-bold text-white uppercase tracking-wider">
          {title || 'AI Strategy Recommendation'}
        </span>
      </div>
      <AISuggestionBadge size="sm" />
    </div>
    {children}
  </div>
);

export const AIGuidanceDisclaimer: React.FC<AIGuidanceDisclaimerProps> = ({
  variant = 'banner',
  className = '',
  companyId,
  companyName
}) => {
  if (variant === 'pill') {
    return <AISuggestionBadge className={className} />;
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-[#FFD700]/30 text-[11px] text-amber-200/90 font-medium ${className}`}>
        <ShieldAlert className="w-3.5 h-3.5 text-[#FFD700] shrink-0" />
        <span className="font-semibold text-white">Suggestion by AI - Final decision is yours</span>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div className={`p-3.5 rounded-xl bg-amber-500/10 border border-[#FFD700]/40 text-xs text-amber-200/95 space-y-1.5 ${className}`}>
        <div className="flex items-center justify-between gap-2 font-bold text-white">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#FFD700] shrink-0" />
            <span>Human Approval Required</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFD700] text-black font-black uppercase">
            Rule 1 Enforced
          </span>
        </div>
        <p className="text-[11px] text-amber-100/90 leading-relaxed font-semibold">
          Suggestion by AI - Final decision is yours. All emails, deal closes, and messages require explicit human sign-off before dispatch.
        </p>
        {companyId && (
          <div className="pt-1 flex items-center gap-2 text-[10px] font-mono text-[#FFD700]/70 border-t border-amber-500/20">
            <span>🛡️ Isolated Tenant: {companyName || companyId}</span>
            <span>•</span>
            <span>Human-in-the-Loop Governance</span>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`w-full py-2 px-4 rounded-xl bg-black/60 border border-white/5 text-[11px] text-white/50 flex flex-wrap items-center justify-between gap-2 ${className}`}>
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-[#FFD700]" />
          <span className="font-semibold text-white/80">Suggestion by AI - Final decision is yours</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-white/40 font-mono">
          <span>Human-in-the-Loop Enforced</span>
          <span>•</span>
          <span>Zero Auto-Execution</span>
        </div>
      </div>
    );
  }

  // Default 'banner' variant
  return (
    <div className={`p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#FFD700]/5 to-transparent border border-[#FFD700]/30 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#FFD700]/15 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] shrink-0">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <span className="text-[#FFD700]">Mandatory Compliance:</span>
            <span>Suggestion by AI - Final decision is yours</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Every email, every deal close, and every message requires your human approval button before taking final action.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FFD700] px-2.5 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center gap-1.5">
          <UserCheck className="w-3 h-3 text-[#FFD700]" />
          <span>Human Approval Required</span>
        </span>
      </div>
    </div>
  );
};

