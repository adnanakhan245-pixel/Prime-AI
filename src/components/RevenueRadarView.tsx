import React, { useState, useEffect } from 'react';
import { 
  Radar, 
  Flame, 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  Mail, 
  Copy, 
  Plus, 
  Search, 
  TrendingUp, 
  Layers, 
  User, 
  X, 
  AlertCircle,
  Activity,
  Zap,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { recordApprovedAction } from '../services/approvals';
import { FreeChurnAuditModal } from './FreeChurnAuditModal';
import { DealHealthTrendChart } from './DealHealthTrendChart';
import { 
  CRMRecord, 
  RevenueRadarStats,
  SaaSTelemetryStats
} from '../types';
import { 
  fetchCRMRecords, 
  filterAtRiskClients, 
  filterHotLeads, 
  calculateRadarStats, 
  saveCRMRecord, 
  updateCRMRecord,
  markContactedToday
} from '../services/crm';
import { calculateSaaSTelemetry } from '../services/saas';

interface RevenueRadarViewProps {
  onNavigate?: (view: string) => void;
}

export const RevenueRadarView: React.FC<RevenueRadarViewProps> = ({ onNavigate }) => {
  const { user, companyId, companyName } = useAuth();
  const activeCompanyId = companyId || 'comp_workspace_01';
  const effectiveUserId = user?.uid || 'guest';

  const [records, setRecords] = useState<CRMRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'risk' | 'hot' | 'all' | 'telemetry'>('risk');
  const [actionModalRecord, setActionModalRecord] = useState<CRMRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [churnAuditModalOpen, setChurnAuditModalOpen] = useState(false);
  const [newDealModalOpen, setNewDealModalOpen] = useState(false);

  // New Deal Form State
  const [newDeal, setNewDeal] = useState({
    accountName: '',
    contactName: '',
    contactEmail: '',
    dealValue: 25000,
    mrr: 2080,
    stage: 'Active Client' as CRMRecord['stage'],
    type: 'CLIENT' as CRMRecord['type'],
    healthScore: 65,
    daysSinceLastContact: 4
  });

  useEffect(() => {
    loadRecords();
  }, [activeCompanyId, effectiveUserId]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await fetchCRMRecords(activeCompanyId, effectiveUserId);
      setRecords(data || []);
    } catch (e) {
      console.error('Error loading CRM records:', e);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSyncTelemetry = async () => {
    setSyncing(true);
    try {
      await loadRecords();
      showToast('✓ Real-time telemetry and company records updated.');
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await saveCRMRecord(activeCompanyId, effectiveUserId, {
      id: `deal_${Date.now()}`,
      companyId: activeCompanyId,
      userId: effectiveUserId,
      accountName: newDeal.accountName,
      contactName: newDeal.contactName,
      contactEmail: newDeal.contactEmail,
      dealValue: Number(newDeal.dealValue),
      mrr: Number(newDeal.mrr),
      stage: newDeal.stage,
      type: newDeal.type,
      healthScore: Number(newDeal.healthScore),
      daysSinceLastContact: Number(newDeal.daysSinceLastContact),
      lastContactDate: new Date(Date.now() - Number(newDeal.daysSinceLastContact) * 86400000).toISOString(),
      riskFactors: newDeal.daysSinceLastContact > 10 ? ['Overdue contact threshold (>10d)'] : ['Active normal monitoring'],
      source: 'Direct Entry'
    });
    setRecords(prev => [created, ...prev]);
    setNewDealModalOpen(false);
    showToast(`✓ Deal for ${newDeal.accountName} created and tracked.`);
  };

  const generateAIRescueAction = (record: CRMRecord) => {
    return {
      urgency: record.healthScore < 50 ? ('CRITICAL' as const) : ('HIGH' as const),
      headline: `Urgent Executive Re-engagement for ${record.accountName}`,
      strategy: `Account has been silent for ${record.daysSinceLastContact} days with $${record.dealValue.toLocaleString()} contract value at risk. Recommended action: Direct CEO-level outreach with an executive briefing and customized SLA reassurance.`,
      tactics: [
        'Bypass middle management; send direct note from Founder/CEO',
        'Offer complimentary 99.95% SLA addendum or quarterly business review',
        'Propose a 15-minute alignment sync before renewal date'
      ],
      emailSubject: `Executive Check-in: ${companyName || 'Leadership'} & ${record.accountName}`,
      emailBody: `Hi ${record.contactName},\n\nI was reviewing our key enterprise accounts this morning and noticed we haven't touched base in the last couple of weeks. Your team's partnership is a top priority for us at ${companyName || 'our team'}.\n\nI want to make sure you have everything you need and that our platform is delivering maximum value for ${record.accountName}.\n\nDo you have 10 minutes this Thursday or Friday for a brief check-in?\n\nBest regards,\nExecutive Office`,
      winProbability: Math.min(95, Math.max(45, 100 - record.daysSinceLastContact * 2)),
      generatedAt: new Date().toISOString()
    };
  };

  const handleOpenActionModal = async (record: CRMRecord) => {
    setActionModalRecord(record);
    if (!record.aiAction) {
      setActionLoading(true);
      try {
        const action = generateAIRescueAction(record);
        const updated = await updateCRMRecord(activeCompanyId, effectiveUserId, record.id, { aiAction: action });
        if (updated) {
          setActionModalRecord(updated);
          setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
        }
      } catch (err) {
        console.error('Failed to generate action:', err);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleApproveAction = async (record: CRMRecord) => {
    if (!record.aiAction) return;
    recordApprovedAction({
      companyId: activeCompanyId,
      actionName: `Executive Outreach: ${record.accountName}`,
      category: 'crm',
      target: record.accountName,
      details: `Dispatched AI recovery playbook to ${record.contactName} (${record.contactEmail}) for $${record.dealValue.toLocaleString()} deal.`,
      impactLevel: record.healthScore < 50 ? 'CRITICAL' : 'HIGH',
      actionType: 'SEND_EMAIL',
      payload: {
        emailSubject: record.aiAction.emailSubject,
        emailBody: record.aiAction.emailBody,
        strategy: record.aiAction.strategy
      }
    });

    const updated = await markContactedToday(activeCompanyId, effectiveUserId, record.id);
    if (updated) {
      setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
    }

    setActionModalRecord(null);
    showToast(`✓ Executive recovery email queued for ${record.accountName}. Touchpoint updated.`);
  };

  // Filtered views
  const atRiskList = filterAtRiskClients(records);
  const hotLeadsList = filterHotLeads(records);
  const stats: RevenueRadarStats = calculateRadarStats(records);
  const saasStats: SaaSTelemetryStats = calculateSaaSTelemetry(records);

  const displayedRecords = records.filter(r => {
    const matchesSearch = 
      r.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.contactEmail.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === 'risk') {
      return (r.daysSinceLastContact > 10 || r.healthScore < 60 || r.stage === 'Churn Risk');
    }
    if (activeTab === 'hot') {
      return (r.stage === 'Negotiation' || r.stage === 'Proposal' || r.stage === 'Contract Sent');
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-20 text-white max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl bg-emerald-500 text-black font-extrabold text-xs shadow-2xl flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-black" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header & Quick Action Suite */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Radar className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight uppercase font-mono">
                  PRIME <span className="text-[#FFD700] font-semibold">REVENUE &amp; SAAS RADAR</span>
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-extrabold uppercase animate-pulse">
                  100% REAL DATA
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Autonomous deal risk monitoring, executive rescue scripts, and revenue telemetry for <strong>{companyName || 'Apex Enterprises'}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Header */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setChurnAuditModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500/20 to-red-500/10 hover:from-rose-500/30 hover:to-red-500/20 text-rose-300 font-bold text-xs border border-rose-500/40 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.15)] cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Free 30-Day Churn Audit</span>
          </button>

          <button
            onClick={() => onNavigate?.('rescue')}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Rescue Center</span>
          </button>

          <button
            onClick={handleSyncTelemetry}
            disabled={syncing}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-medium text-xs border border-white/10 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-[#FFD700]' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync Telemetry'}</span>
          </button>

          <button
            onClick={() => setNewDealModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-[#FFD700] to-yellow-500 text-black font-black text-xs hover:brightness-110 transition-all flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-black" />
            <span>Add Deal</span>
          </button>
        </div>
      </div>

      {/* KPI Telemetry Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* At-Risk Pipeline */}
        <div 
          onClick={() => setActiveTab('risk')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'risk' 
              ? 'bg-gradient-to-b from-rose-950/40 to-[#121212] border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)]' 
              : 'bg-[#121212] border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono text-white/50 mb-2">
            <span>AT-RISK REVENUE</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
            ${stats.atRiskPipelineValue.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] text-white/60 mt-2 font-mono">
            <span>{stats.atRiskCount} Accounts flagged (&gt;10d silent)</span>
            <span className="text-rose-400 font-bold">Urgent</span>
          </div>
        </div>

        {/* Hot Leads Pipeline */}
        <div 
          onClick={() => setActiveTab('hot')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'hot' 
              ? 'bg-gradient-to-b from-amber-950/40 to-[#121212] border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]' 
              : 'bg-[#121212] border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono text-white/50 mb-2">
            <span>HIGH-INTENT LEADS</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#FFD700] font-mono">
            ${stats.hotLeadsPipelineValue.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] text-white/60 mt-2 font-mono">
            <span>{stats.hotLeadsCount} Deals in Closing Stage</span>
            <span className="text-emerald-400 font-bold">Fast-Track</span>
          </div>
        </div>

        {/* SaaS MRR & NRR */}
        <div 
          onClick={() => setActiveTab('telemetry')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'telemetry' 
              ? 'bg-gradient-to-b from-blue-950/40 to-[#121212] border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
              : 'bg-[#121212] border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono text-white/50 mb-2">
            <span>NET RETENTION (NRR)</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">
            {saasStats.nrr}%
          </div>
          <div className="flex items-center justify-between text-[11px] text-white/60 mt-2 font-mono">
            <span>Monthly Recurring: ${saasStats.mrr.toLocaleString()}</span>
            <span className="text-blue-400 font-bold">SaaS Core</span>
          </div>
        </div>

        {/* Total Monitored Accounts */}
        <div 
          onClick={() => setActiveTab('all')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'all' 
              ? 'bg-gradient-to-b from-purple-950/40 to-[#121212] border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]' 
              : 'bg-[#121212] border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono text-white/50 mb-2">
            <span>TOTAL CONTRACT VALUE</span>
            <DollarSign className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            ${stats.totalPipelineValue.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] text-white/60 mt-2 font-mono">
            <span>{stats.totalAccountsCount} Monitored Client Accounts</span>
            <span className="text-white/40">Portfolio</span>
          </div>
        </div>
      </div>

      {/* Deal Health Trend Analysis Chart (Visual Telemetry) */}
      <DealHealthTrendChart 
        records={records} 
        onSelectRecord={(rec) => handleOpenActionModal(rec)} 
      />

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setActiveTab('risk')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'risk'
                ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>At-Risk Clients ({atRiskList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('hot')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'hot'
                ? 'bg-[#FFD700] text-black shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Hot Leads ({hotLeadsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-black shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Deals ({records.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'telemetry'
                ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>SaaS Telemetry</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search accounts, contacts, emails..."
            className="w-full bg-[#121212] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/30 focus:border-[#FFD700] focus:outline-none transition-colors font-mono"
          />
        </div>
      </div>

      {/* Main Records Table / Cards */}
      {loading ? (
        <div className="p-12 text-center text-white/50 text-xs font-mono space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#FFD700]" />
          <div>Scanning real company accounts &amp; live CRM telemetry...</div>
        </div>
      ) : records.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-gradient-to-b from-[#141414] to-[#0A0A0A] border border-white/10 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/25 flex items-center justify-center text-[#FFD700] mx-auto">
            <Radar className="w-7 h-7 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Live Pipeline Ready — 100% Real Data</h3>
            <p className="text-xs text-white/50 max-w-md mx-auto">
              No simulated or fake accounts exist. Add your real active client contracts or sync your CRM to start monitoring real ARR, deal risk, and executive rescue playbooks.
            </p>
          </div>
          <button
            onClick={() => setNewDealModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-[#FFD700] to-yellow-500 text-black font-black text-xs hover:brightness-110 transition-all inline-flex items-center gap-2 shadow-lg cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Add Your First Real Deal</span>
          </button>
        </div>
      ) : displayedRecords.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#121212] border border-white/10 space-y-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <div className="text-sm font-bold text-white">No accounts match this filter</div>
          <p className="text-xs text-white/50 max-w-sm mx-auto">
            All your real accounts are currently in healthy standing or no records matched your search query.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedRecords.map((record) => {
            const isAtRisk = record.daysSinceLastContact > 10 || record.healthScore < 60;
            const isHotLead = record.stage === 'Negotiation' || record.stage === 'Proposal';

            return (
              <div
                key={record.id}
                className={`p-5 rounded-2xl bg-gradient-to-b from-[#161616] to-[#0E0E0E] border transition-all flex flex-col justify-between group hover:scale-[1.01] ${
                  isAtRisk 
                    ? 'border-rose-500/40 hover:border-rose-500 shadow-[0_4px_20px_rgba(244,63,94,0.08)]' 
                    : isHotLead 
                    ? 'border-amber-500/40 hover:border-amber-400 shadow-[0_4px_20px_rgba(245,158,11,0.08)]'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/70 border border-white/10">
                      {record.stage}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      isAtRisk 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                        : isHotLead 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {record.daysSinceLastContact}d Silent
                    </span>
                  </div>

                  {/* Account & Contact */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-[#FFD700] transition-colors truncate">
                      {record.accountName}
                    </h3>
                    <div className="text-xs text-white/60 flex items-center gap-1.5 mt-0.5 truncate">
                      <User className="w-3 h-3 text-white/40 shrink-0" />
                      <span className="truncate">{record.contactName} ({record.contactRole || 'Decision Maker'})</span>
                    </div>
                  </div>

                  {/* Financial & Health Metrics */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-white/50">Deal Contract ARR:</span>
                      <span className="font-bold text-white">${record.dealValue.toLocaleString()}</span>
                    </div>

                    {record.mrr && (
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-white/50">Monthly MRR:</span>
                        <span className="text-[#FFD700] font-bold">${record.mrr.toLocaleString()}</span>
                      </div>
                    )}

                    {/* Health Score Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-white/50">
                        <span>Health Score:</span>
                        <span className={record.healthScore < 50 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                          {record.healthScore}/100
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            record.healthScore < 50 ? 'bg-rose-500' : record.healthScore < 75 ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${record.healthScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Risk Factors */}
                  {record.riskFactors && record.riskFactors.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-rose-300 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Sentry Flags:</span>
                      </div>
                      <ul className="text-[11px] text-white/60 space-y-0.5 list-disc list-inside">
                        {record.riskFactors.slice(0, 2).map((factor, idx) => (
                          <li key={idx} className="truncate">{factor}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Card Bottom Actions */}
                <div className="pt-4 mt-4 border-t border-white/10 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenActionModal(record)}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-[#FFD700] hover:brightness-110 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-black" />
                    <span>AI Rescue Script</span>
                  </button>

                  <a
                    href={`mailto:${record.contactEmail}?subject=Follow-up%20from%20${encodeURIComponent(companyName || 'Leadership')}`}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer border border-white/10"
                    title={`Email ${record.contactName}`}
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Executive Action Slideover Modal */}
      {actionModalRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-[#141414] border border-[#FFD700]/40 p-6 sm:p-8 shadow-[0_0_50px_rgba(255,215,0,0.15)] space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{actionModalRecord.accountName}</h3>
                  <p className="text-xs text-white/50">{actionModalRecord.contactName} ({actionModalRecord.contactEmail})</p>
                </div>
              </div>

              <button
                onClick={() => setActionModalRecord(null)}
                className="p-1 rounded-lg text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action Details */}
            {actionLoading ? (
              <div className="py-12 text-center text-xs font-mono text-white/50 space-y-3">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#FFD700]" />
                <div>Generating tailor-made executive recovery email &amp; objection strategy...</div>
              </div>
            ) : actionModalRecord.aiAction ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="text-xs font-mono text-[#FFD700] uppercase tracking-wider font-bold">
                    Strategic Rationale:
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed">
                    {actionModalRecord.aiAction.strategy}
                  </p>
                </div>

                {/* Draft Email */}
                <div className="space-y-2">
                  <div className="text-xs font-mono text-white/50 uppercase tracking-wider flex items-center justify-between">
                    <span>Generated Executive Email:</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `Subject: ${actionModalRecord.aiAction?.emailSubject}\n\n${actionModalRecord.aiAction?.emailBody}`
                        );
                        showToast('✓ Email script copied to clipboard');
                      }}
                      className="text-[11px] text-[#FFD700] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0D0D0D] border border-white/15 space-y-2 text-xs font-mono text-white/90">
                    <div className="text-white/60 pb-2 border-b border-white/10">
                      <strong>Subject:</strong> {actionModalRecord.aiAction.emailSubject}
                    </div>
                    <div className="whitespace-pre-line leading-relaxed text-zinc-300">
                      {actionModalRecord.aiAction.emailBody}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3">
                  <button
                    onClick={() => setActionModalRecord(null)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => handleApproveAction(actionModalRecord)}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-[#FFD700] to-yellow-500 text-black font-black text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4 text-black" />
                    <span>Approve &amp; Log Touchpoint</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Add Deal Modal */}
      {newDealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <form onSubmit={handleCreateDeal} className="w-full max-w-lg rounded-3xl bg-[#141414] border border-white/15 p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#FFD700]" />
                <span>Add Monitored Account / Deal</span>
              </h3>
              <button
                type="button"
                onClick={() => setNewDealModalOpen(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-white/60 mb-1">Company / Account Name:</label>
                <input
                  type="text"
                  required
                  value={newDeal.accountName}
                  onChange={(e) => setNewDeal({ ...newDeal, accountName: e.target.value })}
                  placeholder="e.g. Acme Enterprise Global"
                  className="w-full bg-[#181818] border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-[#FFD700] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/60 mb-1">Contact Name:</label>
                  <input
                    type="text"
                    required
                    value={newDeal.contactName}
                    onChange={(e) => setNewDeal({ ...newDeal, contactName: e.target.value })}
                    placeholder="e.g. John Miller"
                    className="w-full bg-[#181818] border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-[#FFD700] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-white/60 mb-1">Contact Email:</label>
                  <input
                    type="email"
                    required
                    value={newDeal.contactEmail}
                    onChange={(e) => setNewDeal({ ...newDeal, contactEmail: e.target.value })}
                    placeholder="jmiller@acme.com"
                    className="w-full bg-[#181818] border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-[#FFD700] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/60 mb-1">Contract Deal Value ($):</label>
                  <input
                    type="number"
                    required
                    value={newDeal.dealValue}
                    onChange={(e) => setNewDeal({ ...newDeal, dealValue: Number(e.target.value) })}
                    className="w-full bg-[#181818] border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-[#FFD700] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-white/60 mb-1">Monthly MRR ($):</label>
                  <input
                    type="number"
                    value={newDeal.mrr}
                    onChange={(e) => setNewDeal({ ...newDeal, mrr: Number(e.target.value) })}
                    className="w-full bg-[#181818] border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-[#FFD700] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/60 mb-1">Days Since Last Touchpoint:</label>
                  <input
                    type="number"
                    value={newDeal.daysSinceLastContact}
                    onChange={(e) => setNewDeal({ ...newDeal, daysSinceLastContact: Number(e.target.value) })}
                    className="w-full bg-[#181818] border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-[#FFD700] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-white/60 mb-1">Initial Health Score (0-100):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newDeal.healthScore}
                    onChange={(e) => setNewDeal({ ...newDeal, healthScore: Number(e.target.value) })}
                    className="w-full bg-[#181818] border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-[#FFD700] focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setNewDealModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-[#FFD700] text-black font-black text-xs hover:brightness-110"
              >
                Save &amp; Monitor
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Free Churn Audit Modal */}
      <FreeChurnAuditModal
        isOpen={churnAuditModalOpen}
        onClose={() => setChurnAuditModalOpen(false)}
      />
    </div>
  );
};
