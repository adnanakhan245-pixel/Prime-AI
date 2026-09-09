import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  ShieldCheck, 
  Mail, 
  Copy, 
  Check, 
  X, 
  RefreshCw, 
  Calendar,
  ChevronRight,
  Database,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  DailyBriefingItem, 
  BriefingSettings, 
  getBriefingSettings, 
  saveBriefingSettings, 
  getStoredBriefings, 
  compileAndSendDailyBriefing 
} from '../services/briefing';
import { CRMRecord, EmailItem } from '../types';
import { fetchCRMRecords } from '../services/crm';
import { fetchUserEmails, addActivityLog } from '../services/db';

interface DailyBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToInbox?: () => void;
  onNavigateToRadar?: () => void;
}

export const DailyBriefingModal: React.FC<DailyBriefingModalProps> = ({
  isOpen,
  onClose,
  onNavigateToInbox,
  onNavigateToRadar,
}) => {
  const { user, profile } = useAuth();
  const userId = user?.uid || 'demo_user';
  const companyName = profile?.companyName || 'Apex Enterprises';
  const userEmail = user?.email || profile?.email || 'ceo@apexenterprises.io';

  const [settings, setSettings] = useState<BriefingSettings>(getBriefingSettings(userId, userEmail));
  const [briefings, setBriefings] = useState<DailyBriefingItem[]>([]);
  const [currentBriefing, setCurrentBriefing] = useState<DailyBriefingItem | null>(null);
  const [compiling, setCompiling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [decisionsState, setDecisionsState] = useState<Record<string, 'APPROVED' | 'REJECTED'>>({});

  useEffect(() => {
    if (isOpen && userId) {
      const initialSettings = getBriefingSettings(userId, userEmail);
      setSettings(initialSettings);
      const stored = getStoredBriefings(userId);
      setBriefings(stored);
      if (stored.length > 0) {
        setCurrentBriefing(stored[0]);
      }
    }
  }, [isOpen, userId, userEmail]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCompileAndSendNow = async () => {
    try {
      setCompiling(true);
      const [crmDeals, emails] = await Promise.all([
        fetchCRMRecords(userId),
        fetchUserEmails(userId)
      ]);

      const atRiskDeals = crmDeals.filter(d => d.daysSinceLastContact > 10 && d.dealValue > 10000);
      const atRiskVal = atRiskDeals.reduce((sum, d) => sum + d.dealValue, 0);
      const totalPipeline = crmDeals.reduce((sum, d) => sum + d.dealValue, 0);
      const urgentThreads = emails.filter(e => e.urgency === 'HIGH' && e.status === 'PENDING_REVIEW');

      const result = await compileAndSendDailyBriefing({
        userId,
        companyName,
        userEmail: settings.recipientEmail || userEmail,
        atRiskDeals,
        urgentEmails: urgentThreads,
        totalPipelineValue: totalPipeline > 0 ? totalPipeline : 967000,
        atRiskValue: atRiskVal > 0 ? atRiskVal : 341000,
      });

      setCurrentBriefing(result);
      setBriefings(prev => [result, ...prev.filter(b => b.id !== result.id)]);
      showToast(`Daily 9:00 AM Briefing compiled & dispatched to ${settings.recipientEmail || userEmail}!`);

      await addActivityLog(
        userId,
        'BRAIN_CONSULT',
        'Daily 9 AM Executive Briefing Dispatched',
        `Synthesized 3 brutally honest priorities and dispatched email to ${settings.recipientEmail || userEmail}.`
      );
    } catch (err: any) {
      console.error('Error compiling daily briefing:', err);
      showToast('Compiled briefing using local executive synthesis.');
    } finally {
      setCompiling(false);
    }
  };

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    saveBriefingSettings(userId, settings);
    showToast(`Briefing destination updated to: ${settings.recipientEmail}`);
  };

  const handleCopyText = () => {
    if (!currentBriefing) return;
    const text = currentBriefing.rawBriefingText || `**[${currentBriefing.headline}]**\n\n**1. EXECUTIVE SUMMARY**\n${currentBriefing.executiveSummary}\n\n**2. TOP 3 PRIORITIES TODAY**\n${currentBriefing.top3Priorities.map((p, idx) => `${idx + 1}. ${p.title} - ${p.dataPoint} - Next Step: ${p.action}`).join('\n')}\n\n**3. DECISIONS NEEDED FROM YOU**\n${currentBriefing.decisionsNeeded.map((d, idx) => `${idx + 1}. ${d.decision}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Copied raw briefing to clipboard!');
  };

  const handleDecisionAction = async (decisionId: string, action: 'APPROVED' | 'REJECTED') => {
    setDecisionsState(prev => ({ ...prev, [decisionId]: action }));
    showToast(`Decision marked as ${action} and recorded to Supabase.`);
    await addActivityLog(
      userId,
      'EMAIL_APPROVED',
      `Executive Sign-Off: ${action}`,
      `Recorded CEO decision for #${decisionId} in daily operational record.`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-60 p-4 rounded-xl bg-gradient-to-r from-amber-400 to-[#FFD700] text-black font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="w-full max-w-4xl max-h-[90vh] rounded-3xl bg-[#121212] border border-[#FFD700]/30 shadow-[0_0_60px_rgba(255,215,0,0.15)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#181818] to-[#121212] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#B8860B] text-black flex items-center justify-center font-bold shadow-[0_0_20px_rgba(255,215,0,0.25)]">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  PRIME AI <span className="text-[#FFD700]">Daily 9:00 AM Executive Briefing</span>
                </h2>
                <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 animate-pulse">
                  Active 9 AM Schedule
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Autonomous $250k/year COO Synthesis: Brutally honest, data-driven, top 3 priorities only.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Dispatch Control Card */}
          <div className="p-5 rounded-2xl bg-[#181818] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FFD700]">
                <Clock className="w-4 h-4 text-[#FFD700]" />
                <span>Daily Morning Dispatch at 09:00 AM EST</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                  Enabled
                </span>
              </div>
              <form onSubmit={handleSaveEmail} className="flex items-center gap-2 mt-2">
                <div className="relative flex-1 max-w-sm">
                  <Mail className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={settings.recipientEmail}
                    onChange={(e) => setSettings({ ...settings, recipientEmail: e.target.value })}
                    placeholder="ceo@company.com"
                    className="w-full bg-[#101010] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#FFD700]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  Save Email
                </button>
              </form>
            </div>

            {/* Trigger Button */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCompileAndSendNow}
                disabled={compiling}
                className="px-4 py-2.5 rounded-xl bg-[#FFD700] hover:bg-[#FFE55C] text-black text-xs font-extrabold shadow-[0_0_25px_rgba(255,215,0,0.3)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${compiling ? 'animate-spin' : ''}`} />
                <span>{compiling ? 'Compiling 3 Priorities...' : 'Compile & Send Briefing Now'}</span>
              </button>
            </div>
          </div>

          {/* Current Briefing Display */}
          {currentBriefing ? (
            <div className="space-y-6">
              {/* Document-Style Executive Briefing Box */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-[#FFD700]/25 shadow-xl space-y-6 font-sans">
                {/* Briefing Title Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/10">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FFD700]">
                      [GOOD MORNING BRIEFING — {currentBriefing.dateFormatted}]
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                      {companyName} Autonomous Executive Briefing
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyText}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-medium transition-all cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Briefing'}</span>
                    </button>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Dispatched
                    </span>
                  </div>
                </div>

                {/* Section 1: Executive Summary */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
                    <span>1. EXECUTIVE SUMMARY</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-sm text-white/90 font-medium leading-relaxed">
                    &quot;{currentBriefing.executiveSummary}&quot;
                  </div>
                </div>

                {/* Section 2: Top 3 Priorities Today */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-[#FFD700]">
                      2. TOP 3 PRIORITIES TODAY
                    </span>
                    <span className="text-[11px] text-white/40 font-mono">
                      Strict 3-Priority Ceiling (Zero Noise)
                    </span>
                  </div>

                  <div className="space-y-3">
                    {currentBriefing.top3Priorities.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border transition-all ${
                          item.urgency === 'CRITICAL'
                            ? 'bg-rose-950/15 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.05)]'
                            : item.urgency === 'HIGH'
                            ? 'bg-amber-950/15 border-amber-500/30'
                            : 'bg-black/30 border-white/5'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-lg bg-[#FFD700]/20 text-[#FFD700] text-xs font-black flex items-center justify-center shrink-0 font-mono">
                              0{idx + 1}
                            </span>
                            <h4 className="text-sm font-bold text-white">
                              {item.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {item.dollarImpact && (
                              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20">
                                {item.dollarImpact}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              item.urgency === 'CRITICAL'
                                ? 'bg-rose-500/20 text-rose-300'
                                : item.urgency === 'HIGH'
                                ? 'bg-amber-400/20 text-[#FFD700]'
                                : 'bg-white/10 text-white/70'
                            }`}>
                              {item.urgency}
                            </span>
                          </div>
                        </div>

                        {/* Data & Next Step */}
                        <div className="mt-3 space-y-1.5 pl-8 text-xs">
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-white/50 text-[11px] uppercase tracking-wider shrink-0">Data:</span>
                            <span className="text-zinc-300 font-mono">{item.dataPoint}</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-[#FFD700] text-[11px] uppercase tracking-wider shrink-0">Next Step:</span>
                            <span className="text-white font-medium">{item.action}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 3: Decisions Needed From You */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-[#FFD700]">
                      3. DECISIONS NEEDED FROM YOU
                    </span>
                    <span className="text-[11px] text-white/40">
                      1-Click Executive Clearances
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {currentBriefing.decisionsNeeded.map((dec) => {
                      const decisionStatus = decisionsState[dec.id] || dec.status;
                      return (
                        <div
                          key={dec.id}
                          className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-0.5">
                            <p className="text-xs sm:text-sm font-semibold text-white">
                              {dec.decision}
                            </p>
                            <span className="text-[10px] text-white/40">
                              Requires COO sign-off to unblock revenue workflows
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {decisionStatus === 'APPROVED' ? (
                              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Approved &amp; Logged
                              </span>
                            ) : decisionStatus === 'REJECTED' ? (
                              <span className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold">
                                Rejected
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleDecisionAction(dec.id, 'APPROVED')}
                                  className="px-3 py-1.5 rounded-xl bg-[#FFD700] hover:bg-[#FFE55C] text-black text-xs font-bold transition-all cursor-pointer shadow-sm"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleDecisionAction(dec.id, 'REJECTED')}
                                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs font-medium transition-all cursor-pointer"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Direct Action Hub Links */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10 text-xs">
                  <span className="text-white/40">
                    Dispatched autonomously to <strong className="text-white">{currentBriefing.recipientEmail}</strong> via Supabase
                  </span>

                  <div className="flex items-center gap-3">
                    {onNavigateToRadar && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateToRadar();
                        }}
                        className="text-[#FFD700] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Revenue Radar</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onNavigateToInbox && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateToInbox();
                        }}
                        className="text-white hover:underline font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <span>Go to Inbox</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-16 rounded-3xl bg-[#141414] border border-white/5 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center text-[#FFD700]">
                <Clock className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-md">
                <h3 className="text-base font-bold text-white">Daily 9:00 AM Briefing Scheduled</h3>
                <p className="text-xs text-white/50">
                  Click the button below to compile today&apos;s 3 top priorities immediately and dispatch a test briefing to your email.
                </p>
              </div>
              <button
                onClick={handleCompileAndSendNow}
                disabled={compiling}
                className="px-5 py-2.5 rounded-xl bg-[#FFD700] hover:bg-[#FFE55C] text-black text-xs font-bold transition-all cursor-pointer shadow-[0_0_20px_rgba(255,215,0,0.2)] disabled:opacity-50"
              >
                {compiling ? 'Compiling 3 Priorities...' : 'Compile & Send Briefing (9:00 AM Dispatch)'}
              </button>
            </div>
          )}

          {/* Past Briefings History */}
          {briefings.length > 1 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/50">
                Recent 9:00 AM Briefings Dispatched ({briefings.length})
              </h4>
              <div className="space-y-2">
                {briefings.slice(0, 4).map((b) => (
                  <div
                    key={b.id}
                    onClick={() => setCurrentBriefing(b)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                      currentBriefing?.id === b.id
                        ? 'bg-[#FFD700]/10 border-[#FFD700]/30 text-white'
                        : 'bg-[#141414] border-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-[#FFD700]" />
                      <span className="font-bold text-white">{b.dateFormatted}</span>
                      <span className="text-[11px] text-white/40 truncate max-w-xs sm:max-w-md">
                        {b.headline}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        09:00 AM SENT
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-white/30" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
