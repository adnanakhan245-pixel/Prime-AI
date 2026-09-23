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
  Filter, 
  Check, 
  X, 
  AlertTriangle, 
  Zap, 
  Building2, 
  Mail, 
  DollarSign, 
  ShieldCheck,
  ArrowRight,
  Info,
  ShieldX,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AIActionItem, 
  getApprovalActions, 
  saveApprovalActions, 
  approveAction, 
  undoApprovedAction, 
  rejectAction, 
  queueApprovalAction,
  INITIAL_SAMPLE_ACTIONS, 
  APPROVALS_STORAGE_KEY 
} from '../services/approvals';

export type { AIActionItem };

export const ApprovalLogView: React.FC = () => {
  const [actions, setActions] = useState<AIActionItem[]>([]);
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

  const refreshActions = () => {
    setActions(getApprovalActions());
  };

  // Load on mount and subscribe to updates across the app
  useEffect(() => {
    refreshActions();

    const handleUpdate = () => {
      refreshActions();
    };

    window.addEventListener('prime_approvals_changed', handleUpdate);
    window.addEventListener('prime_action_queued', handleUpdate);
    window.addEventListener('prime_action_approved', handleUpdate);
    window.addEventListener('prime_action_undone', handleUpdate);

    return () => {
      window.removeEventListener('prime_approvals_changed', handleUpdate);
      window.removeEventListener('prime_action_queued', handleUpdate);
      window.removeEventListener('prime_action_approved', handleUpdate);
      window.removeEventListener('prime_action_undone', handleUpdate);
    };
  }, []);

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
    const updated = await approveAction(id);
    if (updated) {
      refreshActions();
      triggerToast(`⚡ Action Approved & Executed: "${targetAction?.actionName || 'AI Task'}". Undo available for 2 minutes.`);
    }
  };

  const handleReject = (id: string) => {
    const targetAction = actions.find(a => a.id === id);
    const updated = rejectAction(id);
    if (updated) {
      refreshActions();
      triggerToast(`🚫 Action Rejected: "${targetAction?.actionName || 'AI Task'}". No execution was performed.`);
    }
  };

  const handleUndo = async (id: string) => {
    const targetAction = actions.find(a => a.id === id);
    const updated = await undoApprovedAction(id);
    if (updated) {
      refreshActions();
      triggerToast(`↩️ Action Reverted & Undone! Rolled back "${targetAction?.actionName || 'AI Task'}".`);
    }
  };

  const handleCreateCustomAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionName.trim() || !newDetails.trim()) return;

    const queued = queueApprovalAction({
      actionName: newActionName.trim(),
      category: newCategory,
      target: newTarget.trim() || 'Executive Workspace',
      details: newDetails.trim(),
      impactLevel: newImpact,
      actionType: newCategory === 'crm' ? 'MOVE_DEAL' : newCategory === 'email' ? 'SEND_EMAIL' : 'CUSTOM'
    });

    setShowSimulateModal(false);
    setNewActionName('');
    setNewTarget('');
    setNewDetails('');
    refreshActions();
    triggerToast(`✨ Action queued for human sign-off: "${queued.actionName}"`);
  };

  const handleResetToDefault = () => {
    saveApprovalActions(INITIAL_SAMPLE_ACTIONS);
    refreshActions();
    triggerToast(`🔄 Approvals log reset to initial sample queue.`);
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

  // Calculate statistics
  const pendingCount = actions.filter(a => a.status === 'PENDING').length;
  const approvedCount = actions.filter(a => a.status === 'APPROVED').length;
  const rejectedCount = actions.filter(a => a.status === 'REJECTED').length;
  const undoneCount = actions.filter(a => a.status === 'UNDONE').length;
  const activeUndoCount = actions.filter(
    a => a.status === 'APPROVED' && a.undoExpiresAt && a.undoExpiresAt > now
  ).length;

  const getImpactBadgeClass = (impact: AIActionItem['impactLevel']) => {
    switch (impact) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-extrabold';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold';
      case 'MEDIUM':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold';
      case 'LOW':
        return 'bg-slate-500/20 text-slate-300 border border-slate-500/40';
    }
  };

  const getCategoryIcon = (category: AIActionItem['category']) => {
    switch (category) {
      case 'email':
        return <Mail className="w-4 h-4 text-sky-400" />;
      case 'ad_spend':
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case 'crm':
        return <Building2 className="w-4 h-4 text-amber-400" />;
      case 'board':
        return <ShieldCheck className="w-4 h-4 text-purple-400" />;
      case 'finance':
        return <Zap className="w-4 h-4 text-[#FFD700]" />;
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

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-stone-900 to-zinc-900 border border-[#FFD700]/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sovereign Executive Governance: Zero Autonomous Execution Without Approval</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>AI Approvals Log &amp; Safety Sentry</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              <strong>Zero Auto-Moves • Zero Auto-Emails:</strong> Every autonomous action requires explicit human approval before execution. Every decision generates a tamper-evident audit log with a <strong>2-minute safety window</strong> to instantly <strong>Undo</strong> and revert state.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowSimulateModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FFD700] via-amber-400 to-[#FFC700] text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Simulate AI Action</span>
            </button>
            <button
              onClick={handleResetToDefault}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              title="Reset queue to initial sample data"
            >
              <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
              <span>Reset Queue</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left">
            <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Pending Review</div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1 flex items-center gap-2">
              <span>{pendingCount}</span>
              {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-left">
            <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Approved & Executed</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">{approvedCount}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-left">
            <div className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">Rejected Actions</div>
            <div className="text-xl sm:text-2xl font-black text-rose-400 mt-1">{rejectedCount}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-left">
            <div className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">Undone / Reverted</div>
            <div className="text-xl sm:text-2xl font-black text-purple-400 mt-1">{undoneCount}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-left col-span-2 sm:col-span-1">
            <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Active Undo Timers</div>
            <div className="text-xl sm:text-2xl font-black text-indigo-400 mt-1 flex items-center gap-1.5">
              <span>{activeUndoCount}</span>
              {activeUndoCount > 0 && <Clock className="w-4 h-4 text-indigo-400 animate-spin" />}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
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

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search action or details..."
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

      {/* Approval List */}
      <div className="space-y-4">
        {filteredActions.length === 0 ? (
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#FFD700] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No AI actions found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are no actions matching your current status filter ({statusFilter}) or search term.
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
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0">
                    {isPending && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        <span>Awaiting Approval</span>
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
                        <span>Executed & Finalized</span>
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
                        className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Approve & Execute</span>
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
                        <span>Approved! You can undo this action within <strong>{timerFormatted}</strong></span>
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
                      <span>Execution finalized & recorded in system audit logs.</span>
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
                  <span>Simulate AI Action</span>
                </div>
                <h3 className="text-xl font-bold text-white">Queue New AI Task for Review</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Create a custom simulated AI action to test the Approve, Reject, and 2-Minute Undo workflow.
                </p>
              </div>

              <form onSubmit={handleCreateCustomAction} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Action Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Draft $50,000 Contract Amendment"
                    value={newActionName}
                    onChange={e => setNewActionName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#FFD700]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#FFD700]"
                    >
                      <option value="email">Email</option>
                      <option value="ad_spend">Ad Spend</option>
                      <option value="crm">CRM / Deals</option>
                      <option value="board">Board</option>
                      <option value="finance">Finance</option>
                      <option value="general">General</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Impact Level</label>
                    <select
                      value={newImpact}
                      onChange={e => setNewImpact(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#FFD700]"
                    >
                      <option value="CRITICAL">Critical</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target / Recipient</label>
                  <input
                    type="text"
                    placeholder="e.g. Vance Capital (alexander@vance.com)"
                    value={newTarget}
                    onChange={e => setNewTarget(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#FFD700]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Action Details & Payload</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe what the AI will execute once approved..."
                    value={newDetails}
                    onChange={e => setNewDetails(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#FFD700]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSimulateModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FFD700] to-amber-400 text-black font-extrabold shadow-lg shadow-amber-500/20"
                  >
                    Add to Approval Queue
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
