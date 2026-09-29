import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

interface AIGuidanceDisclaimerProps {
  variant?: 'banner' | 'modal' | 'compact' | 'footer';
  className?: string;
  companyId?: string;
  companyName?: string;
}

export const AIGuidanceDisclaimer: React.FC<AIGuidanceDisclaimerProps> = ({
  variant = 'banner',
  className = '',
  companyId,
  companyName
}) => {
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-[#FFD700]/30 text-[11px] text-amber-200/90 font-medium ${className}`}>
        <ShieldAlert className="w-3.5 h-3.5 text-[#FFD700] shrink-0" />
        <span>AI suggestions are for guidance only. Please review before taking action.</span>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div className={`p-3.5 rounded-xl bg-amber-500/10 border border-[#FFD700]/40 text-xs text-amber-200/95 space-y-1 ${className}`}>
        <div className="flex items-center gap-2 font-bold text-white">
          <ShieldAlert className="w-4 h-4 text-[#FFD700] shrink-0" />
          <span>Mandatory Human Review Policy</span>
        </div>
        <p className="text-[11px] text-amber-100/80 leading-relaxed">
          <strong>AI suggestions are for guidance only. Please review before taking action.</strong>{' '}
          Zero automated messages, invoices, or playbooks may be transmitted without explicit human authorization.
        </p>
        {companyId && (
          <div className="pt-1 flex items-center gap-2 text-[10px] font-mono text-[#FFD700]/70 border-t border-amber-500/20">
            <span>🛡️ Isolated Tenant: {companyName || companyId}</span>
            <span>•</span>
            <span>Zero Cross-Tenant Leakage Enforced</span>
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
          <span>AI suggestions are for guidance only. Please review before taking action.</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-white/40 font-mono">
          <span>SOC2 Type II Isolated</span>
          <span>•</span>
          <span>Human-in-the-Loop Governance</span>
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
            <span className="text-[#FFD700]">Safety Notice:</span>
            <span>AI suggestions are for guidance only. Please review before taking action.</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Every client communication, invoice dispatch, and playbook execution requires strict human sign-off.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FFD700] px-2.5 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20">
          Human Approval Required
        </span>
      </div>
    </div>
  );
};
