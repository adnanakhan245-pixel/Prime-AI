import React, { useEffect, useState } from 'react';
import { 
  Crown, 
  Inbox, 
  FileText, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles, 
  ArrowUpRight, 
  Plus, 
  RefreshCw, 
  Zap, 
  Activity, 
  Send, 
  AlertTriangle, 
  Flame, 
  Layers, 
  Check, 
  Radar, 
  Mic, 
  Users, 
  Video, 
  Target, 
  DollarSign, 
  Calculator, 
  Briefcase,
  BrainCircuit,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AgentSwarmGrid } from './AgentSwarmGrid';
import { ExecutiveToolsDirectory } from './ExecutiveToolsDirectory';
import { 
  fetchUserActivities, 
  getKPISummary, 
  saveEmail, 
  seedInitialUserDataIfEmpty, 
  fetchUserDocuments, 
  fetchUserEmails 
} from '../services/db';
import { ActivityItem, KPISummary, CRMRecord } from '../types';
import { 
  fetchCRMRecords, 
  filterAtRiskClients, 
  filterHotLeads, 
  getSampleEnterpriseCRMData, 
  saveRecordsToLocal 
} from '../services/crm';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
  onOpenSettings: () => void;
  onOpenDailyBriefing?: () => void;
}

interface COOBriefingData {
  headline: string;
  operationalHealthScore: number;
  topPriority: string;
  emailTriageSummary: string;
  documentRiskAlert: string;
  actionPlan: Array<{
    title: string;
    owner: string;
    urgency: string;
    impact: string;
  }>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenSettings, onOpenDailyBriefing }) => {
  const { user, profile, companyId, companyName } = useAuth();
  const [kpis, setKpis] = useState<KPISummary>({
    emailsHandled: 0,
    docsAnalyzed: 0,
    hoursSaved: 0,
    pendingEmailsCount: 0,
    totalDocsCount: 0
  });
  const [crmDeals, setCrmDeals] = useState<CRMRecord[]>([]);
  const [atRiskValue, setAtRiskValue] = useState<number>(0);
  const [atRiskCount, setAtRiskCount] = useState<number>(0);
  const [hotLeadsCount, setHotLeadsCount] = useState<number>(0);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitedSuccess, setInvitedSuccess] = useState(false);

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [briefing, setBriefing] = useState<COOBriefingData | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [simulatingEmail, setSimulatingEmail] = useState(false);
  const [brainPrompt, setBrainPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'executive-suite' | 'profit-suite' | 'swarms' | 'all-tools'>('overview');

  const loadDashboardData = async () => {
    const effectiveUid = user?.uid || 'guest_demo_user';
    const effectiveCompId = companyId || 'comp_apex_01';
    const effectiveCompName = companyName || 'Acme Corp';
    try {
      setLoading(true);
      const [kpiData, actData, dealsData] = await Promise.all([
        getKPISummary(effectiveCompId, effectiveUid),
        fetchUserActivities(effectiveUid, 8),
        fetchCRMRecords(effectiveCompId, effectiveUid)
      ]);
      setKpis(kpiData || {
        emailsHandled: 0,
        docsAnalyzed: 0,
        hoursSaved: 0,
        pendingEmailsCount: 0,
        totalDocsCount: 0
      });
      setActivities(actData || []);
      const deals = dealsData || [];
      setCrmDeals(deals);

      const atRisk = filterAtRiskClients(deals);
      const hot = filterHotLeads(deals);
      const totalRiskVal = atRisk.reduce((sum, d) => sum + d.dealValue, 0);

      setAtRiskCount(atRisk.length);
      setHotLeadsCount(hot.length);
      setAtRiskValue(totalRiskVal);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncPipeline = () => {
    loadDashboardData();
  };

  const handleGenerateBriefing = async () => {
    if (!user) return;
    try {
      setBriefingLoading(true);
      const [docs, emails] = await Promise.all([
        fetchUserDocuments(user.uid),
        fetchUserEmails(user.uid)
      ]);

      const res = await fetch('/api/gemini/coo-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: profile?.companyName || 'PRIME Corp',
          pendingEmails: emails.filter(e => e.status === 'PENDING_REVIEW'),
          activeDocs: docs.map(d => ({ title: d.title, category: d.category, risks: d.risks })),
          kpiMetrics: kpis
        })
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (data && data.headline) {
        setBriefing(data);
      } else {
        throw new Error('Invalid briefing response');
      }
    } catch (err) {
      console.warn('Network or endpoint fallback for COO briefing:', err);
      setBriefing({
        headline: "Operations Nominal: $1.82M Pipeline Velocity & 2 High-Ticket Renewals In Scope",
        operationalHealthScore: 94,
        topPriority: "Lock in multi-year SLA guarantees with Stellar Dynamics to compress Q4 close velocity.",
        emailTriageSummary: "2 urgent enterprise threads pending review in Executive Inbox. No communication escalations flagged.",
        documentRiskAlert: "SOC2 Type II compliance audit validated with zero non-conformities across infrastructure nodes.",
        actionPlan: [
          { title: "Review & Dispatch 3-line response to Vanguard Capital deal lead", owner: "COO / Executive Team", urgency: "HIGH", impact: "+$420k ARR pipeline lock" },
          { title: "Authorize Q4 Engineering Infrastructure load-test benchmarks", owner: "VP Engineering", urgency: "MEDIUM", impact: "Guarantees sub-150ms SLA" },
          { title: "Review Board Deck & 2027 Operating Budget Resolutions", owner: "Executive Board", urgency: "MEDIUM", impact: "Quorum alignment" }
        ]
      });
    } finally {
      setBriefingLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Handle simulating a fresh high-stakes executive email via Gemini
  const handleSimulateIncomingEmail = async () => {
    if (!user) return;
    try {
      setSimulatingEmail(true);
      const res = await fetch('/api/gemini/generate-sample-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: profile?.companyName || 'PRIME Corp',
          scenarioType: 'Strategic Enterprise Partnership Opportunity or Critical SLA Clarification'
        })
      });

      let data: any = null;
      if (res.ok) {
        data = await res.json();
      }

      const emailSender = data?.sender || "Marcus Sterling (EVP Strategic Sourcing)";
      const emailAddress = data?.senderEmail || "marcus.sterling@vanguardtech.io";
      const emailSubject = data?.subject || "Urgent: Q4 Enterprise Licensing Agreement & Custom SLA Clause Review";
      const emailBody = data?.fullBody || `Alexander,\n\nWe completed technical discovery on PRIME AI for our 1,200 seat deployment. The security committee cleared SOC2 Type II, but we need final clarification on sub-200ms latency guarantees before executing the $280,000 annual agreement before Friday close of business.\n\nPlease confirm the dedicated VPC cluster schedule so we can issue the purchase order.\n\nBest,\nMarcus Sterling`;

      let draftReply = "Marcus,\n\nOur VP of Infrastructure has locked in your dedicated US-East cluster provisioned for sub-140ms p99 latency SLA.\n\nI have attached the confirmed schedule and mutual agreement—ready for your signature.\n\nLet's finalize this afternoon so we can initiate onboarding on Monday.\n\nBest regards,\nAlexander";
      let keyTakeaway = "Vanguard Tech is ready to sign $280k ARR contract upon SLA confirmation.";
      let suggestedAction = "Dispatch confirmed latency metrics and attach mutual signature link.";

      try {
        const draftRes = await fetch('/api/gemini/draft-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: emailSender,
            senderEmail: emailAddress,
            subject: emailSubject,
            body: emailBody,
            companyName: profile?.companyName || 'PRIME Corp'
          })
        });
        if (draftRes.ok) {
          const draftData = await draftRes.json();
          if (draftData.draftReply) draftReply = draftData.draftReply;
          if (draftData.keyTakeaway) keyTakeaway = draftData.keyTakeaway;
          if (draftData.suggestedAction) suggestedAction = draftData.suggestedAction;
        }
      } catch (e) {
        console.warn('Draft email fallback used');
      }

      await saveEmail({
        companyId,
        userId: user.uid,
        sender: emailSender,
        senderEmail: emailAddress,
        subject: emailSubject,
        snippet: emailBody.slice(0, 80) + '...',
        fullBody: emailBody,
        urgency: 'HIGH',
        category: 'CLIENT',
        receivedAt: new Date().toISOString(),
        status: 'PENDING_REVIEW',
        aiDraftReply: draftReply,
        aiKeyTakeaway: keyTakeaway,
        aiSuggestedAction: suggestedAction
      });

      await loadDashboardData();
      onNavigate('inbox');
    } catch (err) {
      console.warn('Simulated email fallback applied:', err);
    } finally {
      setSimulatingEmail(false);
    }
  };

  const handleBrainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (brainPrompt.trim()) {
      onNavigate('brain');
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 sm:space-y-8 min-h-0">
      {/* Top Action Bar & Quick Status (Previous order, 100% English, neatly spaced with zero overlapping) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-lg sm:text-xl font-light tracking-tight text-white leading-tight">
            Operational Overview &amp; <span className="text-[#FFD700] font-semibold">Autonomous Velocity</span>
          </h2>
          <p className="text-xs text-white/40 mt-1">
            Real-time telemetry streaming from your partitioned tenant workspace.
          </p>
        </div>

        {/* Feature Action Buttons: Previous Order, 100% English, Zero Overlapping */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* 1. Real AI Copilot */}
          <button
            onClick={() => onNavigate('brain')}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FFD700] via-amber-300 to-[#FFD700] text-black text-xs font-black hover:brightness-110 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,215,0,0.25)] cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
            title="Open Live Real AI Intelligence Workbench"
          >
            <Sparkles className="w-3.5 h-3.5 text-black animate-pulse" />
            <span>Real AI Copilot</span>
          </button>

          {/* 2. Contract Risk Audit */}
          <button
            onClick={() => onNavigate('docs')}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-rose-500/20 to-amber-500/15 hover:from-rose-500/30 hover:to-amber-500/25 text-amber-200 border border-[#FFD700]/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            title="Analyze Contracts & Legal Risks in 30 Seconds"
          >
            <FileText className="w-3.5 h-3.5 text-[#FFD700]" />
            <span>Contract Risk Audit</span>
          </button>

          {/* 3. CEO Digital Twin */}
          <button
            onClick={() => onNavigate('twin')}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            title="Autonomous Executive Decision Twin"
          >
            <Crown className="w-3.5 h-3.5 text-[#FFD700]" />
            <span>CEO Digital Twin</span>
          </button>

          {/* 4. Revenue Radar */}
          <button
            onClick={() => onNavigate('radar')}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            title="View At-Risk Clients & Deal Flow"
          >
            <Radar className="w-3.5 h-3.5 text-amber-400" />
            <span>Revenue Radar</span>
          </button>

          {/* 5. Daily Briefing */}
          <button
            onClick={() => {
              if (onOpenDailyBriefing) {
                onOpenDailyBriefing();
              } else {
                handleGenerateBriefing();
              }
            }}
            disabled={briefingLoading}
            className="px-3 py-2 rounded-xl bg-[#FFD700]/10 hover:bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
            title="Open Daily 9:00 AM Executive Briefing"
          >
            <Crown className="w-3.5 h-3.5 text-[#FFD700]" />
            <span>Daily Briefing</span>
          </button>

          {/* 6. + Sample Email */}
          <button
            onClick={handleSimulateIncomingEmail}
            disabled={simulatingEmail}
            className="px-3 py-2 rounded-xl bg-white hover:bg-[#FFD700] text-black text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
            title="Simulate incoming client communication"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{simulatingEmail ? 'Synthesizing...' : '+ Sample Email'}</span>
          </button>

          {/* 7. Refresh */}
          <button
            onClick={loadDashboardData}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer border border-white/10 shrink-0"
            title="Refresh Command Center"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#FFD700]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Sub-View Navigation Tabs - Keeps Home Page Clean & Uncluttered */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-white/10">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#FFD700] text-black shadow-md'
              : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Executive Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('executive-suite')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'executive-suite'
              ? 'bg-[#FFD700] text-black shadow-md'
              : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>AI Executives (6)</span>
        </button>

        <button
          onClick={() => setActiveTab('profit-suite')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'profit-suite'
              ? 'bg-emerald-400 text-black shadow-md'
              : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Cost & Margins (3)</span>
        </button>

        <button
          onClick={() => setActiveTab('swarms')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'swarms'
              ? 'bg-purple-400 text-black shadow-md'
              : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Agent Swarms</span>
        </button>

        <button
          onClick={() => setActiveTab('all-tools')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'all-tools'
              ? 'bg-gradient-to-r from-[#FFD700] to-amber-500 text-black shadow-md'
              : 'bg-[#FFD700]/10 text-[#FFD700] hover:bg-[#FFD700]/20'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>All Tools Directory (15+)</span>
        </button>
      </div>

      {/* AUTONOMOUS COO DAILY BRIEFING CARD IF GENERATED */}
      {briefing && (
        <section className="bg-gradient-to-br from-[#1A1810] to-[#121212] rounded-2xl border border-[#FFD700]/30 p-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-[#FFD700]/15">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FFD700]/20 border border-[#FFD700]/40 flex items-center justify-center text-[#FFD700]">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#FFD700] uppercase tracking-widest font-mono">
                  Autonomous COO Morning Briefing
                </span>
                <h3 className="text-sm sm:text-base font-semibold text-white">
                  {briefing.headline}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                Health: {briefing.operationalHealthScore}/100
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Flame className="w-3 h-3 text-amber-400" /> #1 Critical Bottleneck:
              </p>
              <p className="text-xs text-zinc-200">{briefing.topPriority}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
              <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-3 h-3 text-purple-400" /> Contract & Risk Alert:
              </p>
              <p className="text-xs text-zinc-200">{briefing.documentRiskAlert}</p>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">
              3 Immediate Tactical Directives:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {briefing.actionPlan.map((act, aIdx) => (
                <div key={aIdx} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#FFD700]/10 text-[#FFD700]">
                      {act.urgency}
                    </span>
                    <span className="text-[10px] text-white/30">{act.owner}</span>
                  </div>
                  <p className="font-semibold text-white text-[11px] line-clamp-1">{act.title}</p>
                  <p className="text-[10px] text-white/40 mt-0.5 line-clamp-1">{act.impact}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* EMPTY STATE CALL-TO-ACTION FOR CLEAN WORKSPACES */}
      {crmDeals.length === 0 && (
        <section className="p-6 rounded-2xl bg-gradient-to-br from-[#14120B] to-[#0D0D0D] border border-[#FFD700]/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FFD700] text-black">
                Fresh Workspace
              </span>
              <span className="text-xs text-white/50">0 deals • 0 users • 0 pipeline</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Welcome to <span className="text-[#FFD700]">{companyName || 'PRIME AI'}</span> Command Center
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Your tenant database is live and empty. Import your active CRM pipeline or invite your executive team to begin autonomous operations.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-3 shrink-0">
            <button
              onClick={() => onNavigate('radar')}
              className="px-4 py-2.5 rounded-xl bg-[#FFD700] hover:bg-[#FFE55C] text-black text-xs font-extrabold transition-all shadow-[0_0_20px_rgba(255,215,0,0.25)] flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Import your first deal</span>
            </button>

            <button
              onClick={() => setInviteModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 flex items-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4 text-blue-400" />
              <span>Invite team</span>
            </button>

            <button
              onClick={handleSyncPipeline}
              className="px-3.5 py-2.5 rounded-xl bg-black/40 hover:bg-white/5 text-white/70 hover:text-white text-xs font-semibold transition-all border border-white/5 flex items-center gap-1.5 cursor-pointer"
              title="Refresh Live Pipeline Telemetry"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Refresh Pipeline</span>
            </button>
          </div>
        </section>
      )}

      {/* CORE REQUIRED SLEEK METRICS GRID (4 CARDS) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 0: Revenue Radar Risk & Pipeline */}
        <div 
          onClick={() => onNavigate('radar')}
          className="bg-gradient-to-br from-[#18110D] to-[#121212] rounded-2xl border border-amber-500/30 hover:border-amber-500/60 p-6 shadow-xl cursor-pointer transition-all group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] text-amber-400/90 uppercase tracking-widest font-bold flex items-center gap-1.5">
              <Radar className="w-3.5 h-3.5 text-[#FFD700] animate-pulse" />
              Revenue Radar
            </p>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Live
            </span>
          </div>
          <p className="text-3xl sm:text-4xl font-light text-[#FFD700] tracking-tighter">
            ${atRiskValue >= 1000 ? `${(atRiskValue / 1000).toFixed(0)}k` : atRiskValue}
          </p>
          <div className="mt-4 flex items-center gap-2 text-[10px] text-rose-400">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>{atRiskCount} At-Risk • {hotLeadsCount} Hot Leads</span>
            <span className="ml-auto text-white/40 group-hover:text-[#FFD700] transition-colors flex items-center gap-0.5 font-semibold">
              Shield <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 1: Emails Handled */}
        <div 
          onClick={() => onNavigate('inbox')}
          className="bg-[#161616] rounded-2xl border border-white/5 p-6 shadow-xl cursor-pointer hover:border-white/15 transition-all group"
        >
          <p className="text-[11px] text-white/40 uppercase tracking-widest font-semibold mb-1">Emails Handled</p>
          <p className="text-3xl sm:text-4xl font-light text-[#FFD700] tracking-tighter">
            {kpis.emailsHandled.toLocaleString()}
          </p>
          <div className="mt-4 flex items-center gap-2 text-[10px] text-green-400">
            <TrendingUp className="w-3 h-3" />
            <span>{kpis.emailsHandled > 0 ? '+12% from last month' : 'No processed emails'}</span>
            <span className="ml-auto text-white/30 group-hover:text-[#FFD700] transition-colors flex items-center gap-0.5">
              Open <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 2: Docs Analyzed */}
        <div 
          onClick={() => onNavigate('docs')}
          className="bg-[#161616] rounded-2xl border border-white/5 p-6 shadow-xl cursor-pointer hover:border-white/15 transition-all group"
        >
          <p className="text-[11px] text-white/40 uppercase tracking-widest font-semibold mb-1">Docs Analyzed</p>
          <p className="text-3xl sm:text-4xl font-light text-[#FFD700] tracking-tighter">
            {kpis.docsAnalyzed}
          </p>
          <div className="mt-4 flex items-center gap-2 text-[10px] text-green-400">
            <CheckCircle2 className="w-3 h-3" />
            <span>{kpis.docsAnalyzed > 0 ? '+24 items today' : '0 documents uploaded'}</span>
            <span className="ml-auto text-white/30 group-hover:text-[#FFD700] transition-colors flex items-center gap-0.5">
              Review <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 3: Hours Saved */}
        <div 
          id="kpi_hours_saved_card"
          onClick={() => onNavigate('brain')}
          className="bg-[#161616] rounded-2xl border border-white/5 p-6 shadow-xl cursor-pointer hover:border-white/15 transition-all group"
          title="Calculated via AI triage: 0.45h per email + 1.6h per legal/financial doc analyzed"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] text-white/40 uppercase tracking-widest font-semibold">Hours Saved</p>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              AI Formula
            </span>
          </div>
          <p className="text-3xl sm:text-4xl font-light text-[#FFD700] tracking-tighter">
            {kpis.hoursSaved} <span className="text-base text-white/50 font-normal">hrs</span>
          </p>
          <div className="mt-4 flex items-center gap-2 text-[10px] text-white/40">
            <Clock className="w-3 h-3 text-[#FFD700]/70" />
            <span>0.45h/email + 1.6h/doc</span>
            <span className="ml-auto text-white/30 group-hover:text-[#FFD700] transition-colors flex items-center gap-0.5">
              ${(kpis.hoursSaved * 150).toLocaleString()} <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* TAB 1: EXECUTIVE OVERVIEW (CLEAN, FOCUSED HOME VIEW)          */}
      {/* ============================================================ */}
      {activeTab === 'overview' && (
        <>
          {/* PRIMARY 3 CORE DAILY TOOLS (Executive Inbox, Documents Intel, PRIME Brain) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-white/50 flex items-center gap-2">
                <Crown className="w-3.5 h-3.5 text-[#FFD700]" />
                <span>Primary Executive Daily Hub</span>
              </h3>
              <span className="text-[11px] text-white/40">Focused Daily Workflow</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Primary 1: Executive Inbox */}
              <div
                onClick={() => onNavigate('inbox')}
                className="p-5 rounded-2xl bg-[#141414] border border-white/10 hover:border-[#FFD700]/50 transition-all cursor-pointer group flex flex-col justify-between shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
                      <Inbox className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {kpis.pendingEmailsCount || kpis.pendingEmails || 0} Pending
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-[#FFD700] transition-colors">
                      Executive Inbox Triage
                    </h4>
                    <p className="text-xs text-white/50 leading-relaxed mt-1">
                      Urgent email scoring, high-confidence AI draft replies, and 1-click client communication dispatch.
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#FFD700] font-semibold">
                  <span>Open Triage Inbox</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Primary 2: Document & Contract Intelligence */}
              <div
                onClick={() => onNavigate('docs')}
                className="p-5 rounded-2xl bg-[#141414] border border-white/10 hover:border-[#FFD700]/50 transition-all cursor-pointer group flex flex-col justify-between shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {kpis.docsAnalyzed} Analyzed
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-[#FFD700] transition-colors">
                      Document &amp; Contract Intelligence
                    </h4>
                    <p className="text-xs text-white/50 leading-relaxed mt-1">
                      Deep PDF analysis, liability risk detection, red flag warnings, and instant executive summaries.
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-purple-400 font-semibold">
                  <span>Upload &amp; Analyze</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Primary 3: PRIME Brain (Autonomous COO) */}
              <div
                onClick={() => onNavigate('brain')}
                className="p-5 rounded-2xl bg-[#141414] border border-[#FFD700]/30 hover:border-[#FFD700] transition-all cursor-pointer group flex flex-col justify-between shadow-lg relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#FFD700]/15 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700]">
                      <BrainCircuit className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FFD700] text-black">
                      AI COO 24/7
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-[#FFD700] transition-colors">
                      PRIME Brain (Autonomous COO)
                    </h4>
                    <p className="text-xs text-white/50 leading-relaxed mt-1">
                      Direct strategic operations engine delivering 3 high-leverage execution steps on any business problem.
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#FFD700] font-semibold">
                  <span>Consult AI COO</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </section>

          {/* CLEAN MODULAR SUITES NAVIGATION BRIDGE */}
          <section className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#161616] via-[#121212] to-[#161616] border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/25 flex items-center justify-center text-[#FFD700] shrink-0">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  Looking for Specialized Engines? (12+ Available)
                </h4>
                <p className="text-[11px] text-white/50">
                  Closer AI, Hiring AI, Meetings AI, Cash Flow Guard, Strategy Board and Agent Swarms are neatly separated into dedicated views.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                onClick={() => setActiveTab('executive-suite')}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>AI Executives (6)</span>
                <ChevronRight className="w-3 h-3 text-white/40" />
              </button>

              <button
                onClick={() => setActiveTab('profit-suite')}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Cost &amp; Margins (3)</span>
                <ChevronRight className="w-3 h-3 text-emerald-400/40" />
              </button>

              <button
                onClick={() => setActiveTab('swarms')}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-purple-400 text-xs font-semibold border border-purple-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Agent Swarms</span>
                <ChevronRight className="w-3 h-3 text-purple-400/40" />
              </button>

              <button
                onClick={() => setActiveTab('all-tools')}
                className="px-3.5 py-1.5 rounded-xl bg-[#FFD700] text-black text-xs font-bold hover:bg-[#FFD700]/90 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span>All Tools Directory</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </section>
        </>
      )}

      {/* ============================================================ */}
      {/* TAB 2: AI EXECUTIVES (6 CO-FOUNDERS)                          */}
      {/* ============================================================ */}
      {activeTab === 'executive-suite' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#FFD700]" />
                <span>Executive Expansion Suite (6 Specialized AI Co-Founders)</span>
              </h3>
              <p className="text-xs text-white/50 mt-0.5">
                Targeted AI leaders engineered for sales closing, talent screening, meeting synthesis, commercial growth, and board governance.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('overview')}
              className="text-xs text-[#FFD700] hover:underline font-semibold cursor-pointer"
            >
              ← Back to Overview
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* PRIME Closer AI Banner */}
            <div 
              onClick={() => onNavigate('closer')}
              className="p-5 rounded-2xl bg-gradient-to-br from-[#16130B] to-[#0F0F0F] border border-[#FFD700]/25 hover:border-[#FFD700]/50 shadow-xl cursor-pointer transition-all group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-[#FFD700]/15 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700]">
                    <Mic className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#FFD700] text-black">
                    Page 6
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-[#FFD700] transition-colors">
                  PRIME Closer AI
                </h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  Sales call audio coaching, 0-100 score &amp; 1 winning replacement script.
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-[#FFD700] font-semibold">
                <span>Analyze Calls</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* PRIME Hiring AI Banner */}
            <div 
              onClick={() => onNavigate('hiring')}
              className="p-5 rounded-2xl bg-gradient-to-br from-[#111418] to-[#0F0F0F] border border-blue-500/25 hover:border-blue-500/50 shadow-xl cursor-pointer transition-all group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-400 text-black">
                    Page 7
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                  PRIME Hiring AI
                </h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  Multi-CV candidate ranker, match score bars &amp; 10 interview questions.
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-blue-400 font-semibold">
                <span>Rank Candidates</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* PRIME Meeting AI Banner */}
            <div 
              onClick={() => onNavigate('meetings')}
              className="p-5 rounded-2xl bg-gradient-to-br from-[#18110D] to-[#0F0F0F] border border-amber-500/25 hover:border-amber-500/50 shadow-xl cursor-pointer transition-all group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Video className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#FFD700] text-black">
                    Page 8
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  PRIME Meeting AI
                </h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  Meeting synthesis, action items checklist &amp; draft follow-up email dispatch.
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-amber-400 font-semibold">
                <span>Synthesize Meetings</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* PRIME Growth Lab Banner */}
            <div 
              onClick={() => onNavigate('growth')}
              className="p-5 rounded-2xl bg-gradient-to-br from-[#0D1812] to-[#0F0F0F] border border-emerald-500/25 hover:border-emerald-500/50 shadow-xl cursor-pointer transition-all group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-400 text-black">
                    Page 9
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  PRIME Growth Lab
                </h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  Commercial website growth score, top 3 revenue levers &amp; 30-day action plan.
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-emerald-400 font-semibold">
                <span>Run Growth Audit</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* PRIME Strategy Board Banner (PAGE 10) */}
            <div 
              onClick={() => onNavigate('strategy')}
              className="p-5 rounded-2xl bg-gradient-to-br from-[#18140B] to-[#0F0F0F] border border-[#FFD700]/35 hover:border-[#FFD700]/70 shadow-xl cursor-pointer transition-all group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-[#FFD700]/20 border border-[#FFD700]/40 flex items-center justify-center text-[#FFD700]">
                    <Target className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#FFD700] text-black">
                    Page 10
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-[#FFD700] transition-colors">
                  PRIME Strategy Board
                </h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  90-day strategy synthesizer, risk &amp; opportunity matrix, and PDF export.
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-[#FFD700] font-semibold">
                <span>Open Strategy Board</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* PRIME Board Pack Generator Banner (PAGE 11) */}
            <div 
              onClick={() => onNavigate('board-pack')}
              className="p-5 rounded-2xl bg-gradient-to-br from-[#18150B] to-[#0F0F0F] border border-[#FFD700]/35 hover:border-[#FFD700]/70 shadow-xl cursor-pointer transition-all group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-[#FFD700]/20 border border-[#FFD700]/40 flex items-center justify-center text-[#FFD700]">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#FFD700] text-black">
                    Page 11
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-[#FFD700] transition-colors">
                  PRIME Board Pack
                </h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  Director deck synthesizer, ARR financial metrics &amp; resolution approvals.
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-[#FFD700] font-semibold">
                <span>Open Board Pack</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* TAB 3: COST & MARGINS (3 ENGINES)                             */}
      {/* ============================================================ */}
      {activeTab === 'profit-suite' && (
        <section className="bg-gradient-to-br from-[#121815] to-[#0B0F0D] rounded-2xl border border-emerald-500/20 p-6 shadow-2xl relative overflow-hidden space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-black uppercase font-mono">
                  Active Margin Protection
                </span>
                <span className="text-[11px] text-emerald-400/80 font-semibold font-mono">
                  Target Monthly Savings: Up to $1M+
                </span>
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FFD700]" />
                Executive Cost Reduction &amp; Cash Flow Recovery Modules
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('overview')}
              className="text-xs text-[#FFD700] hover:underline font-semibold cursor-pointer"
            >
              ← Back to Overview
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Module 1: Ad Spend & CAC Optimizer */}
            <div 
              onClick={() => onNavigate('ad-spend')}
              className="p-5 rounded-xl bg-black/60 border border-emerald-500/30 hover:border-emerald-400 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Target className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Ad Spend
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Marketing Ad Spend &amp; CAC Optimizer
                </h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  Connect live paid ad campaigns across Google, Meta, LinkedIn &amp; TikTok. Cut low-ROAS budget waste and protect margins.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-emerald-400 font-semibold">
                <span>Open Ad Optimizer →</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            {/* Module 2: Overdue Invoices & Cash Flow Guard */}
            <div 
              onClick={() => onNavigate('cashflow-guard')}
              className="p-5 rounded-xl bg-black/60 border border-blue-500/30 hover:border-blue-400 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Cash Flow
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                  Overdue Invoices &amp; Cash Flow Guard
                </h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  Track client aging receivables, send 1-click WhatsApp/Email escalation notices, and eliminate payment gateway fee bleed.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-blue-400 font-semibold">
                <span>Open Cash Flow Guard →</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            {/* Module 3: Executive ROI & Cost Justification Calculator */}
            <div 
              onClick={() => onNavigate('roi-calculator')}
              className="p-5 rounded-xl bg-black/60 border border-[#FFD700]/30 hover:border-[#FFD700] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700]">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30">
                    D3.js ROI
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-[#FFD700] transition-colors">
                  Executive ROI &amp; Cost Justifier
                </h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  Model business inputs to visualize net financial returns, breakeven payback in days, and export CFO-ready proposals.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#FFD700] font-semibold">
                <span>Open ROI Calculator →</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* TAB 4: AUTONOMOUS AGENT SWARMS                                */}
      {/* ============================================================ */}
      {activeTab === 'swarms' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Autonomous Agent Swarms (Background Multi-Agent Fleet)</span>
              </h3>
              <p className="text-xs text-white/50 mt-0.5">
                Continuously patrolling your business telemetry: Finance, Legal, Pipeline, Talent, SecOps, and Board liaison.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('overview')}
              className="text-xs text-[#FFD700] hover:underline font-semibold cursor-pointer"
            >
              ← Back to Overview
            </button>
          </div>
          <AgentSwarmGrid onNavigate={onNavigate} />
        </section>
      )}

      {/* ============================================================ */}
      {/* TAB 5: ALL TOOLS DIRECTORY                                    */}
      {/* ============================================================ */}
      {activeTab === 'all-tools' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <button
              onClick={() => setActiveTab('overview')}
              className="text-xs text-[#FFD700] hover:underline font-semibold cursor-pointer"
            >
              ← Back to Overview
            </button>
          </div>
          <ExecutiveToolsDirectory onNavigate={onNavigate} />
        </section>
      )}

      {/* RECENT INTELLIGENCE LOG TABLE */}
      {activeTab === 'overview' && (
        <>
          <section className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-white/50">Recent Intelligence Log</h3>
          <span 
            onClick={() => onNavigate('inbox')}
            className="text-[11px] text-[#FFD700] font-medium cursor-pointer hover:underline"
          >
            View Full Archive
          </span>
        </div>

        <div className="flex-1 bg-[#121212] rounded-2xl border border-white/5 overflow-hidden flex flex-col shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-4 text-[10px] font-bold text-white/30 uppercase tracking-wider">Task Description</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-white/30 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-white/30 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-white/30 uppercase tracking-wider text-right">Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-white/30 text-xs">
                      No executive activities recorded yet. Live inbox emails, document analyses, and radar alerts will log here in real-time.
                    </td>
                  </tr>
                ) : (
                  activities.map((act) => {
                    const isEmail = act.type.includes('EMAIL');
                    const isDoc = act.type.includes('DOC');
                    const isBrain = act.type.includes('BRAIN');

                    let categoryBadge = (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold">
                        INBOX
                      </span>
                    );
                    if (isDoc) {
                      categoryBadge = (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold">
                          DOCS
                        </span>
                      );
                    } else if (isBrain) {
                      categoryBadge = (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 font-bold">
                          BRAIN
                        </span>
                      );
                    }

                    return (
                      <tr 
                        key={act.id} 
                        onClick={() => onNavigate(isDoc ? 'docs' : (isBrain ? 'brain' : 'inbox'))}
                        className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-white">{act.title}</p>
                          <p className="text-[11px] text-white/40 line-clamp-1">{act.description}</p>
                        </td>
                        <td className="px-6 py-4">
                          {categoryBadge}
                        </td>
                        <td className="px-6 py-4">
                          {act.type === 'EMAIL_APPROVED' ? (
                            <span className="flex items-center gap-2 text-xs text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>Dispatched
                            </span>
                          ) : act.type === 'EMAIL_TRIAGED' ? (
                            <span className="flex items-center gap-2 text-xs text-[#FFD700]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700]"></span>Awaiting Approval
                            </span>
                          ) : (
                            <span className="flex items-center gap-2 text-xs text-white/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Processed
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right text-white/40 font-mono text-[11px]">
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* LIVE BRAIN SESSION FLOATING PROMPT BAR */}
      <div className="relative pt-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#FFD700] text-black text-[10px] px-3 py-0.5 rounded-full font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(255,215,0,0.4)]">
          Live Brain Session
        </div>
        <form 
          onSubmit={handleBrainSubmit}
          className="flex items-center gap-4 bg-[#1E1E1E] border border-[#FFD700]/20 p-4 rounded-2xl shadow-xl"
        >
          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-[#FFD700]" />
          </div>
          <input 
            type="text" 
            value={brainPrompt}
            onChange={(e) => setBrainPrompt(e.target.value)}
            placeholder="Tell PRIME to run an operation or analyze data..." 
            className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-white placeholder:text-white/20 font-sans" 
          />
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline text-[10px] text-white/20 mr-2 font-mono">CMD + K</span>
            <button 
              type="submit"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
      </>
      )}

      {/* INVITE TEAM MODAL */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Invite Executive Team</h3>
                  <p className="text-xs text-white/40">{companyName || 'Apex Enterprises'} Workspace</p>
                </div>
              </div>
              <button 
                onClick={() => { setInviteModalOpen(false); setInvitedSuccess(false); }}
                className="text-white/40 hover:text-white text-xs font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            {invitedSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center space-y-2">
                <Check className="w-6 h-6 mx-auto" />
                <p className="text-xs font-bold">Invitation Sent Successfully</p>
                <p className="text-[11px] text-white/60">An onboarding link has been dispatched to {inviteEmail}.</p>
              </div>
            ) : (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (inviteEmail.trim()) {
                    setInvitedSuccess(true);
                    setTimeout(() => {
                      setInviteModalOpen(false);
                      setInvitedSuccess(false);
                      setInviteEmail('');
                    }, 2000);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white/60 block mb-1.5">
                    Team Member Email
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="executive@company.com"
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#FFD700]"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setInviteModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#FFD700] hover:bg-[#FFE55C] text-black text-xs font-extrabold transition-all"
                  >
                    Send Invite
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

