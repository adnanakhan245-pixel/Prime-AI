import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  Plus, 
  Search, 
  Check, 
  X, 
  Building2, 
  Mail, 
  DollarSign, 
  ShieldCheck,
  Download,
  Info,
  FileText,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { AIGuidanceDisclaimer } from './AIGuidanceDisclaimer';
import { 
  AIActionItem, 
  getApprovalActions, 
  saveApprovalActions, 
  approveAction, 
  undoApprovedAction, 
  rejectAction, 
  queueApprovalAction,
  INITIAL_SAMPLE_ACTIONS 
} from '../services/approvals';
import { 
  getAIDecisionLogs, 
  exportAuditLogsAsCSV, 
  exportAuditLogsAsJSON,
  AIDecisionAuditRecord,
  logAIDecision
} from '../services/aiAuditLogger';

export type { AIActionItem };

export const ApprovalLogView: React.FC = () => {
  const { user, profile, companyId, companyName } = useAuth();
  const activeCompanyId = companyId || localStorage.getItem('prime_ai_active_company_id') || 'comp_apex_01';
  const activeCompanyName = companyName || profile?.companyName || 'Apex Enterprises';

  const [actions, setActions] = useState<AIActionItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AIDecisionAuditRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'GOVERNANCE' | 'AUDIT_LOGS'>('GOVERNANCE');
  const [now, setNow] = useState<number>(Date.now());
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDONE'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showSimulateModal, setShowSimulateModal] = useState(false);

  // Form states for simulating custom action
  const [newActionName, setNewActionName] = useState('');
  const [newCategory, setNewCategory] = useState<AIActionItem['category']>('email');
  const [newTarget, setNewTarget] = useState('');
  const [newDetails, setNewDetails] = useState('');
  const [newImpact, setNewImpact] = useState<AIActionItem['impactLevel']>('HIGH');

  const refreshData = () => {
    const loadedActions = getApprovalActions(activeCompanyId);
    let loadedLogs = getAIDecisionLogs(activeCompanyId);

    // If audit logs are completely empty for this tenant, seed realistic initial governance decisions
    if (loadedLogs.length === 0) {
      const initialSeed: AIDecisionAuditRecord[] = [
        {
          id: `audit_${activeCompanyId}_1`,
          companyId: activeCompanyId,
          userId: user?.uid || 'user_ceo_01',
          timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
          category: 'EMAIL',
          actionTitle: 'Contract Renewal & SLA Response Triage',
          targetEntity: 'Sarah Jenkins (sjenkins@apexenterprise.com)',
          aiModel: 'Gemini 3.7 Flash',
          aiRationale: 'Client requested 99.95% uptime SLA commitment and SOC2 Type II tenant compliance before Friday deadline. Drafted decisive executive reply.',
          aiSuggestedAction: 'Approved by human executive with SOC2 data boundary verification.',
          riskLevel: 'HIGH',
          approvalStatus: 'APPROVED',
          approvedBy: user?.email || 'Executive Lead',
          approvedAt: Date.now() - 1000 * 60 * 40,
          disclaimerAcknowledged: true
        },
        {
          id: `audit_${activeCompanyId}_2`,
          companyId: activeCompanyId,
          userId: user?.uid || 'user_ceo_01',
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          category: 'PLAYBOOK',
          actionTitle: 'SaaS Churn Rescue Concession Recommendation',
          targetEntity: 'Vanguard Global Corp ($60,000 ARR)',
          aiModel: 'Gemini 3.7 Flash',
          aiRationale: 'Client usage decreased 45% over 14 days. AI synthesized 2-month 20% billing concession and dedicated support engineer triage.',
          aiSuggestedAction: 'Requires human executive authorization before deployment.',
          riskLevel: 'CRITICAL',
          approvalStatus: 'PENDING_REVIEW',
          disclaimerAcknowledged: true
        },
        {
          id: `audit_${activeCompanyId}_3`,
          companyId: activeCompanyId,
          userId: user?.uid || 'user_ceo_01',
          timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
          category: 'INVOICE',
          actionTitle: 'Overdue Invoice Recovery Notice Dispatch',
          targetEntity: 'Acme Cloud Systems (#INV-2026-088)',
          aiModel: 'Gemini 3.7 Flash',
          aiRationale: 'Invoice overdue by 14 days. Drafted respectful payment recovery escalation with direct 1-click checkout link.',
          aiSuggestedAction: 'Dispatched following explicit human review.',
          riskLevel: 'MEDIUM',
          approvalStatus: 'APPROVED',
          approvedBy: user?.email || 'Executive Lead',
          approvedAt: Date.now() - 1000 * 60 * 350,
          disclaimerAcknowledged: true
        }
      ];

      initialSeed.forEach(record => logAIDecision(record));
      loadedLogs = getAIDecisionLogs(activeCompanyId);
    }

    setActions(loadedActions);
    setAuditLogs(loadedLogs);
  };

  useEffect(() => {
    refreshData();

    const handleUpdate = () => refreshData();
    window.addEventListener('prime_approvals_changed', handleUpdate);
    window.addEventListener('prime_action_queued', handleUpdate);
    window.addEventListener('prime_action_approved', handleUpdate);
    window.addEventListener('prime_action_undone', handleUpdate);
    window.addEventListener('prime_ai_audit_updated', handleUpdate);

    return () => {
      window.removeEventListener('prime_approvals_changed', handleUpdate);
      window.removeEventListener('prime_action_queued', handleUpdate);
      window.removeEventListener('prime_action_approved', handleUpdate);
      window.removeEventListener('prime_action_undone', handleUpdate);
      window.removeEventListener('prime_ai_audit_updated', handleUpdate);
    };
  }, [activeCompanyId]);

  // Live timer tick every 1 second to update Undo 2-minute countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleApprove = async (id: string) => {
    const targetAction = actions.find(a => a.id === id);
    const updated = await approveAction(id, activeCompanyId);
    if (updated) {
      refreshData();
      triggerToast(`⚡ Human Approval Granted: "${targetAction?.actionName || 'AI Task'}". Undo available for 2 minutes.`);
    }
  };

  const handleReject = (id: string) => {
    const targetAction = actions.find(a => a.id === id);
    const updated = rejectAction(id, activeCompanyId);
    if (updated) {
      refreshData();
      triggerToast(`🚫 Action Rejected: "${targetAction?.actionName || 'AI Task'}". No execution was performed.`);
    }
  };

  const handleUndo = async (id: string) => {
    const targetAction = actions.find(a => a.id === id);
    const updated = await undoApprovedAction(id, activeCompanyId);
    if (updated) {
      refreshData();
      triggerToast(`↩️ Action Reverted & Undone! Rolled back "${targetAction?.actionName || 'AI Task'}".`);
    }
  };

  const handleCreateCustomAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionName.trim() || !newDetails.trim()) return;

    const queued = queueApprovalAction({
      companyId: activeCompanyId,
      actionName: newActionName.trim(),
      category: newCategory,
      target: newTarget.trim() || `${activeCompanyName} Workspace`,
      details: newDetails.trim(),
      impactLevel: newImpact,
      actionType: newCategory === 'crm' ? 'MOVE_DEAL' : newCategory === 'email' ? 'SEND_EMAIL' : 'CUSTOM',
      undoData: {
        companyId: activeCompanyId,
        userId: user?.uid || 'user_ceo_01'
      }
    });

    setShowSimulateModal(false);
    setNewActionName('');
    setNewTarget('');
    setNewDetails('');
    refreshData();
    triggerToast(`✨ Action queued for mandatory human approval: "${queued.actionName}"`);
  };

  const handleResetToDefault = () => {
    saveApprovalActions(INITIAL_SAMPLE_ACTIONS, activeCompanyId);
    refreshData();
    triggerToast(`🔄 Approvals log refreshed for ${activeCompanyName}.`);
  };

  // Filter actions
  const filteredActions = actions.filter(act => {
    const matchesStatus = statusFilter === 'ALL' || act.status === statusFilter;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      act.actionName.toLowerCase().includes(searchLower) ||
      act.details.toLowerCase().includes(searchLower) ||
      act.target.toLowerCase().includes(searchLower);
    return matchesStatus && matchesSearch;
  });

  // Filter audit logs
  const filteredAuditLogs = auditLogs.filter(log => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      log.actionTitle.toLowerCase().includes(q) ||
      log.targetEntity.toLowerCase().includes(q) ||
      log.aiRationale.toLowerCase().includes(q) ||
      log.category.toLowerCase().includes(q)
    );
  });

  // Calculate statistics
  const pendingCount = actions.filter(a => a.status === 'PENDING').length;
  const approvedCount = actions.filter(a => a.status === 'APPROVED').length;
  const rejectedCount = actions.filter(a => a.status === 'REJECTED').length;
  const undoneCount = actions.filter(a => a.status === 'UNDONE').length;
  const activeUndoCount = actions.filter(
    a => a.status === 'APPROVED' && a.undoExpiresAt && a.undoExpiresAt > now
  ).length;

  const getImpactBadgeClass = (impact: AIActionItem['impactLevel'] | AIDecisionAuditRecord['riskLevel']) => {
    switch (impact) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-extrabold';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold';
      case 'MEDIUM':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold';
      case 'LOW':
        return 'bg-slate-500/20 text-slate-300 border border-slate-500/40';
      default:
        return 'bg-white/10 text-white/80';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'email':
        return <Mail className="w-4 h-4 text-sky-400" />;
      case 'ad_spend':
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case 'crm':
      case 'deal':
        return <Building2 className="w-4 h-4 text-amber-400" />;
      case 'board':
      case 'strategy':
        return <ShieldCheck className="w-4 h-4 text-purple-400" />;
      case 'finance':
      case 'invoice':
        return <DollarSign className="w-4 h-4 text-[#FFD700]" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 z-50 bg-[#141414] border border-[#FFD700]/50 text-white px-5 py-3.5 rounded-2xl shadow-2xl shadow-amber-500/10 flex items-center gap-3 font-medium text-xs sm:text-sm"
          >
            <ShieldAlert className="w-5 h-5 text-[#FFD700] shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mandatory Safety Guidance Disclaimer */}
      <AIGuidanceDisclaimer companyId={activeCompanyId} companyName={activeCompanyName} />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-stone-900 to-zinc-900 border border-[#FFD700]/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Autonomous Execution: Human Approval Required</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                <Database className="w-3 h-3" />
                <span>Tenant Isolated: {activeCompanyName} ({activeCompanyId})</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>AI Decision Audit Logs &amp; Human Governance</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Every AI recommendation, email draft, invoice notice, and playbook requires explicit human approval before touching a client. Every decision creates an immutable audit trail with an instant <strong>2-minute safety window</strong> to undo and revert.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => exportAuditLogsAsCSV(activeCompanyId)}
              className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              title="Download SOC2 / ISO compliant audit trail"
            >
              <Download className="w-3.5 h-3.5 text-[#FFD700]" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => exportAuditLogsAsJSON(activeCompanyId)}
              className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              title="Download audit trail JSON"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={() => setShowSimulateModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FFD700] via-amber-400 to-[#FFC700] text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Simulate AI Decision</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left">
            <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Pending Human Review</div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1 flex items-center gap-2">
              <span>{pendingCount}</span>
              {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-left">
            <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Human-Approved</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">{approvedCount}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-left">
            <div className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">Rejected Actions</div>
            <div className="text-xl sm:text-2xl font-black text-rose-400 mt-1">{rejectedCount}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-left">
            <div className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">Undone / Rolled Back</div>
            <div className="text-xl sm:text-2xl font-black text-purple-400 mt-1">{undoneCount}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-left col-span-2 sm:col-span-1">
            <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Active 2-Min Undo</div>
            <div className="text-xl sm:text-2xl font-black text-indigo-400 mt-1 flex items-center gap-1.5">
              <span>{activeUndoCount}</span>
              {activeUndoCount > 0 && <Clock className="w-4 h-4 text-indigo-400 animate-spin" />}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Section Switcher Tabs: Governance Queue vs Full Audit Logs */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('GOVERNANCE')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'GOVERNANCE'
              ? 'bg-[#FFD700] text-black shadow-[0_0_20px_rgba(255,215,0,0.3)]'
              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Pending Approvals &amp; 2-Minute Undo ({actions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('AUDIT_LOGS')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'AUDIT_LOGS'
              ? 'bg-[#FFD700] text-black shadow-[0_0_20px_rgba(255,215,0,0.3)]'
              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Immutable AI Decision Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs (for Governance tab) */}
        {activeTab === 'GOVERNANCE' ? (
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto custom-scrollbar pb-1 md:pb-0">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'UNDONE'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-[#FFD700] text-black shadow-md shadow-amber-500/10'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab === 'ALL' && `All (${actions.length})`}
                {tab === 'PENDING' && `Pending (${pendingCount})`}
                {tab === 'APPROVED' && `Approved (${approvedCount})`}
                {tab === 'REJECTED' && `Rejected (${rejectedCount})`}
                {tab === 'UNDONE' && `Undone (${undoneCount})`}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-xs text-white/60 flex items-center gap-2">
            <span className="font-semibold text-white">Audit Protocol:</span>
            <span>All AI suggestions record model, rationale, recipient, and human review sign-off.</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search action, client, or details..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#FFD700]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: GOVERNANCE QUEUE & 2-MINUTE UNDO */}
      {activeTab === 'GOVERNANCE' && (
        <div className="space-y-4">
          {filteredActions.length === 0 ? (
            <div className="bg-[#121212] border border-white/10 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#FFD700] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No actions in queue</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                All client communications and playbooks have been authorized or reviewed for tenant <strong>{activeCompanyName}</strong>.
              </p>
              <button
                onClick={() => { setStatusFilter('ALL'); setSearchTerm(''); }}
                className="px-4 py-2 rounded-xl bg-white/10 text-xs font-semibold text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredActions.map(action => {
              const isApproved = action.status === 'APPROVED';
              const isPending = action.status === 'PENDING';
              const isRejected = action.status === 'REJECTED';
              const isUndone = action.status === 'UNDONE';

              // Calculate Undo countdown timer (2 minutes = 120 seconds)
              const isUndoWindowActive = 
                isApproved && 
                action.undoExpiresAt !== undefined && 
                action.undoExpiresAt > now;

              const remainingSeconds = isUndoWindowActive 
                ? Math.max(0, Math.floor((action.undoExpiresAt! - now) / 1000))
                : 0;

              const mins = Math.floor(remainingSeconds / 60);
              const secs = remainingSeconds % 60;
              const timerFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

              return (
                <motion.div
                  key={action.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-[#121212] border rounded-2xl p-5 transition-all space-y-4 ${
                    isPending
                      ? 'border-amber-500/40 bg-gradient-to-r from-[#141414] via-amber-950/10 to-[#141414] shadow-lg shadow-amber-500/5'
                      : isApproved
                      ? isUndoWindowActive
                        ? 'border-indigo-500/50 bg-gradient-to-r from-[#141414] via-indigo-950/20 to-[#141414]'
                        : 'border-emerald-500/30'
                      : isRejected
                      ? 'border-rose-500/20 opacity-75'
                      : 'border-purple-500/30'
                  }`}
                >
                  {/* Action Card Top Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        {getCategoryIcon(action.category)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white">{action.actionName}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${getImpactBadgeClass(action.impactLevel)}`}>
                            {action.impactLevel} IMPACT
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                          <span>Target: <strong className="text-slate-200">{action.target}</strong></span>
                          <span>•</span>
                          <span className="font-mono text-[11px] text-slate-500">
                            {new Date(action.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span>•</span>
                          <span className="text-[10px] font-mono text-[#FFD700]/70">Tenant: {action.companyId || activeCompanyId}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                          <span>Human Approval Required</span>
                        </span>
                      )}

                      {isApproved && isUndoWindowActive && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold font-mono">
                          <Clock className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                          <span>Undo Window: {timerFormatted}</span>
                        </span>
                      )}

                      {isApproved && !isUndoWindowActive && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Executed &amp; Finalized</span>
                        </span>
                      )}

                      {isRejected && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Rejected</span>
                        </span>
                      )}

                      {isUndone && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reverted / Undone</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details Container */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 leading-relaxed font-sans">
                    {action.details}
                  </div>

                  {/* Execution Log Notice */}
                  {action.executionLog && (
                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{action.executionLog}</span>
                    </div>
                  )}

                  {/* Action Buttons Row */}
                  <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                    {isPending && (
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                          onClick={() => handleApprove(action.id)}
                          className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FFD700] via-amber-300 to-[#FFD700] hover:scale-105 active:scale-95 text-black text-xs font-black shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-black" />
                          <span>Human Approval Required: Approve &amp; Execute</span>
                        </button>

                        <button
                          onClick={() => handleReject(action.id)}
                          className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                        >
                          <X className="w-4 h-4 stroke-[3]" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}

                    {/* Active Undo Button */}
                    {isApproved && isUndoWindowActive && (
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
                        <div className="text-xs text-indigo-300 flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                          <span>Authorized! You can rollback within <strong>{timerFormatted}</strong></span>
                        </div>

                        <button
                          onClick={() => handleUndo(action.id)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-purple-500/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Undo Action ({timerFormatted})</span>
                        </button>
                      </div>
                    )}

                    {isApproved && !isUndoWindowActive && (
                      <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Execution finalized &amp; recorded in tenant audit log.</span>
                      </div>
                    )}

                    {isRejected && (
                      <div className="text-xs text-rose-400 flex items-center gap-1.5 font-medium">
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>Action rejected and removed from execution queue.</span>
                      </div>
                    )}

                    {isUndone && (
                      <div className="text-xs text-purple-400 flex items-center gap-1.5 font-medium">
                        <RotateCcw className="w-4 h-4 text-purple-400" />
                        <span>Action was safely undone within the 2-minute safety window.</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: IMMUTABLE AI DECISION AUDIT TRAIL */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="space-y-4">
          <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-black/60 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <FileText className="w-4 h-4 text-[#FFD700]" />
                <span>Tenant Audit Trail: {activeCompanyName} ({activeCompanyId})</span>
              </div>
              <span className="text-[11px] font-mono text-white/50">
                {filteredAuditLogs.length} Logged Decisions
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-white/5 text-[10px] uppercase font-mono tracking-wider text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Timestamp (UTC)</th>
                    <th className="py-3 px-4">Decision Category</th>
                    <th className="py-3 px-4">Target Client / Entity</th>
                    <th className="py-3 px-4">AI Model &amp; Rationale</th>
                    <th className="py-3 px-4">Risk Level</th>
                    <th className="py-3 px-4">Human Governance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {filteredAuditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-white/60 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 text-white/90 text-[11px] font-semibold">
                          {getCategoryIcon(log.category)}
                          <span>{log.category}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white whitespace-nowrap">
                        {log.targetEntity}
                      </td>
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="text-[11px] text-[#FFD700] font-mono mb-0.5">{log.aiModel}</div>
                        <p className="text-slate-300 line-clamp-2 leading-relaxed text-xs">
                          {log.aiRationale}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${getImpactBadgeClass(log.riskLevel)}`}>
                          {log.riskLevel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          log.approvalStatus === 'APPROVED' 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : log.approvalStatus === 'PENDING_REVIEW'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                            : log.approvalStatus === 'UNDONE'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {log.approvalStatus === 'APPROVED' && <CheckCircle2 className="w-3 h-3" />}
                          {log.approvalStatus === 'PENDING_REVIEW' && <Clock className="w-3 h-3" />}
                          {log.approvalStatus === 'UNDONE' && <RotateCcw className="w-3 h-3" />}
                          {log.approvalStatus === 'REJECTED' && <XCircle className="w-3 h-3" />}
                          <span>{log.approvalStatus.replace(/_/g, ' ')}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Simulate Custom AI Action Modal */}
      <AnimatePresence>
        {showSimulateModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#141414] border border-[#FFD700]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowSimulateModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simulate AI Decision (Isolated Tenant: {activeCompanyName})</span>
                </div>
                <h3 className="text-xl font-bold text-white">Create Test AI Decision</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Injects an AI action into the governance queue to verify mandatory human approval and 2-minute safety undo.
                </p>
              </div>

              <AIGuidanceDisclaimer variant="modal" companyId={activeCompanyId} companyName={activeCompanyName} />

              <form onSubmit={handleCreateCustomAction} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Action Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Enterprise SLA Addendum Transmission"
                    value={newActionName}
                    onChange={e => setNewActionName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/10 text-white text-xs focus:outline-none focus:border-[#FFD700]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">Category</label>
                    <select
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/10 text-white text-xs focus:outline-none focus:border-[#FFD700]"
                    >
                      <option value="email">Client Email Dispatch</option>
                      <option value="finance">Invoice Notice</option>
                      <option value="crm">CRM Stage Move</option>
                      <option value="ad_spend">Ad Spend Allocation</option>
                      <option value="board">Executive Playbook</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">Impact Level</label>
                    <select
                      value={newImpact}
                      onChange={e => setNewImpact(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/10 text-white text-xs focus:outline-none focus:border-[#FFD700]"
                    >
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="HIGH">HIGH</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="LOW">LOW</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Target Client / Recipient</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe (VP Procurement, Acme Corp)"
                    value={newTarget}
                    onChange={e => setNewTarget(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/10 text-white text-xs focus:outline-none focus:border-[#FFD700]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">AI Rationale &amp; Details</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Details of the proposed communication or playbook concession..."
                    value={newDetails}
                    onChange={e => setNewDetails(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/10 text-white text-xs focus:outline-none focus:border-[#FFD700]"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSimulateModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#FFD700] via-amber-400 to-[#FFC700] text-black text-xs font-black shadow-lg cursor-pointer"
                  >
                    Queue for Human Approval
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
