import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Calendar, 
  Sparkles, 
  Download, 
  ShieldAlert, 
  TrendingUp, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Users, 
  DollarSign, 
  FileText, 
  ArrowUpRight, 
  Database, 
  Copy, 
  Check, 
  RefreshCw, 
  Crown, 
  Zap, 
  ChevronRight, 
  BarChart3, 
  Briefcase, 
  Compass,
  Printer,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  StrategyRecord, 
  StrategyPlan, 
  StrategyRisk, 
  StrategyOpportunity, 
  StrategyGoal, 
  StrategyTeamAssignment,
  StrategyMilestoneItem,
  CRMRecord,
  GrowthAuditRecord,
  MeetingRecord
} from '../types';
import { 
  saveStrategyToSupabase, 
  fetchUserStrategies, 
  fetchUserMeetings, 
  fetchUserGrowthAudits 
} from '../services/db';
import { fetchCRMRecords } from '../services/crm';
import { exportStrategyReportPDF } from '../utils/pdfGenerator';

const DATE_RANGE_OPTIONS = [
  'Last 90 Days',
  'Last 30 Days',
  'Last 180 Days',
  'Current Fiscal Year (Q3-Q4)'
];

const DEFAULT_SAMPLE_STRATEGY: StrategyPlan = {
  executive_summary: "Apex Enterprises is poised to accelerate ARR growth from $1.45M to $2.10M across Q4 by resolving silent at-risk accounts, executing CRO teardown recommendations, and expanding high-ticket enterprise contracts. With $1.8M in qualified pipeline velocity, our primary execution priority is reducing customer communication gaps and shipping low-latency infrastructure updates to compress sales cycles.",
  strategic_health_score: 88,
  pipeline_health_rating: "Strong Velocity ($1.82M Qualified Pipeline)",
  projected_arr_impact: "+$620,000 ARR",
  execution_readiness_score: 92,
  top_3_risks: [
    {
      title: "Executive Silence on 3 Core Enterprise Accounts ($140k ARR at risk)",
      category: "CHURN",
      severity: "CRITICAL",
      description: "Stellar Dynamics and Apex Partners show >10 days without executive touchpoints ahead of upcoming contract renewals.",
      mitigationPlan: "Dispatch CEO-level re-engagement letters within 24 hours, lock in multi-year SLA guarantees, and schedule on-site quarterly business reviews.",
      impactScore: 92
    },
    {
      title: "Sub-optimal Self-Serve Conversion on Tier-2 Pricing Flow",
      category: "REVENUE",
      severity: "HIGH",
      description: "Growth audit identified a 22% drop-off between trial onboarding and paid tier checkout due to hidden annual discount cues.",
      mitigationPlan: "Deploy 1-click annual billing discount toggle and SOC2 trust center badges across high-traffic checkout funnels.",
      impactScore: 84
    },
    {
      title: "Engineering Delivery Bottleneck for Sub-200ms Latency SLA",
      category: "EXECUTION",
      severity: "MEDIUM",
      description: "FinTech prospects require verified sub-200ms SLA benchmarks prior to signing $300k+ master service agreements.",
      mitigationPlan: "Allocate $4.5M approved infrastructure budget to provision GPU cluster redundancy and deliver load-test benchmarks by Friday.",
      impactScore: 78
    }
  ],
  top_3_opportunities: [
    {
      title: "High-Ticket Enterprise Contract Expansion ($420k ARR Upsell)",
      category: "UPSELL",
      potentialARR: "+$420,000 ARR",
      description: "Horizon Aerospace and Vanguard Capital are in late-stage discovery with high willingness to adopt multi-agent workflow modules.",
      actionRequired: "Deliver custom executive business cases and schedule live architect demonstrations with the VP of Engineering.",
      confidenceScore: 94
    },
    {
      title: "Interactive ROI Calculator & Trust Badge CRO Rollout",
      category: "CONVERSION",
      potentialARR: "+$180,000 ARR",
      description: "Implementing Growth Lab teardown recommendations is projected to lift website visitor-to-demo conversion by +18%.",
      actionRequired: "Roll out lightweight interactive calculator on the primary landing page and feature enterprise case studies above the fold.",
      confidenceScore: 89
    },
    {
      title: "Automated Executive Inbox & Sales Call AI Multi-threading",
      category: "PRODUCT_EXPANSION",
      potentialARR: "+$120,000 ARR",
      description: "Empowering revenue reps with PRIME Closer AI and Meeting AI to auto-dispatch objection scripts and immediate follow-ups.",
      actionRequired: "Mandate Closer AI call reviews across all SDR/AE opportunities valued at >$25,000.",
      confidenceScore: 91
    }
  ],
  q4_goals: [
    {
      targetMetric: "$2.10M ARR Run-Rate",
      currentBaseline: "$1.45M ARR",
      deadline: "Dec 31 (Q4 Day 90)",
      description: "Achieve record annual recurring revenue run-rate driven by enterprise renewals and expanded pipeline closing velocity.",
      status: "ON_TRACK",
      keyResults: [
        "Close $620k in new and expanded annual enterprise contracts",
        "Maintain 100% gross retention on accounts valued over $50k",
        "Compress median sales cycle from 44 days to 26 days"
      ]
    },
    {
      targetMetric: "99.99% Enterprise SLA & Sub-200ms API Latency",
      currentBaseline: "420ms Latency / 99.9% Uptime",
      deadline: "Nov 15 (Q4 Day 45)",
      description: "Establish world-class infrastructure reliability to win strict institutional and FinTech compliance audits.",
      status: "ON_TRACK",
      keyResults: [
        "Deploy multi-region cloud cluster redundancy with auto-failover",
        "Publish real-time public telemetry status page with live SLA badges",
        "Deliver verified load-test benchmarks to Vanguard Capital CTO"
      ]
    },
    {
      targetMetric: "100% Executive Follow-Up & Zero Account Silence",
      currentBaseline: "14-day silence threshold exceeded",
      deadline: "Oct 31 (Q4 Day 30)",
      description: "Eliminate silent churn vectors through autonomous CRM radar monitoring and chief-of-staff meeting dispatch.",
      status: "ON_TRACK",
      keyResults: [
        "Zero active accounts with >7 days without touchpoint",
        "Auto-generate meeting briefs and follow-up emails within 10 minutes",
        "Recover 100% of the $140k at-risk client pipeline"
      ]
    }
  ],
  team_assignments: [
    {
      roleOrLeader: "VP of Sales & Revenue Operations",
      focusArea: "Enterprise Pipeline Acceleration & Closing Sprint",
      keyDeliverables: [
        "Lock Horizon Aerospace ($310k) and Vanguard Capital ($420k) contracts",
        "Conduct weekly Closer AI call reviews on all Tier-1 deals",
        "Enforce 24-hour SLA on inbound enterprise qualification"
      ],
      allocatedBudgetOrFTE: "$120,000 / 3 Senior Account Executives",
      priority: "P0"
    },
    {
      roleOrLeader: "VP of Engineering & Infrastructure",
      focusArea: "Sub-200ms Performance SLA & Cloud Cluster Scaling",
      keyDeliverables: [
        "Execute $4.5M infrastructure budget allocation",
        "Finalize multi-region failover and verify sub-200ms latency",
        "Publish post-mortem report and updated trust center documentation"
      ],
      allocatedBudgetOrFTE: "$4.5M Capital Budget / 4 Lead Engineers",
      priority: "P0"
    },
    {
      roleOrLeader: "Head of Growth & Product Marketing",
      focusArea: "Website CRO Teardown & High-Intent Conversion",
      keyDeliverables: [
        "Deploy interactive ROI calculator on primary domain",
        "Redesign pricing tier page with clear annual savings toggle",
        "Feature verified customer ROI quotes and security badges above the fold"
      ],
      allocatedBudgetOrFTE: "$45,000 / Growth Engineer & Designer",
      priority: "P1"
    },
    {
      roleOrLeader: "Director of Customer Success & Retention",
      focusArea: "Proactive Churn Neutralization & Executive QBRs",
      keyDeliverables: [
        "Conduct executive outreach on all accounts with health score <60",
        "Deliver revised SLA agreements to Stellar Dynamics and Apex Partners",
        "Establish automated weekly telemetry check-ins with client sponsors"
      ],
      allocatedBudgetOrFTE: "$60,000 / 2 Enterprise CSMs",
      priority: "P0"
    }
  ],
  plan_90_day: [
    {
      timeframe: "Days 1 - 30 (Stabilization & Churn Neutralization)",
      milestoneTitle: "Re-engage Silent Accounts & Deploy First CRO Levers",
      actions: [
        "Initiate executive touchpoints for Stellar Dynamics and at-risk CRM accounts",
        "Deploy SOC2 trust center badges and interactive ROI calculator to landing page",
        "Finalize vendor contracts for GPU cluster cloud expansion"
      ],
      expectedKpiImpact: "Protect $140k at-risk ARR and lift baseline demo conversion by +10%",
      owner: "CEO & VP Sales",
      completed: false
    },
    {
      timeframe: "Days 31 - 60 (Pipeline Acceleration & Infrastructure Milestone)",
      milestoneTitle: "Verify Sub-200ms SLA & Scale Enterprise Deal Reviews",
      actions: [
        "Ship engineering latency optimization and deliver benchmarks to enterprise prospects",
        "Mandate Closer AI call coaching on all opportunities >$25k",
        "Launch targeted nurture campaign for high-value calculation drop-offs"
      ],
      expectedKpiImpact: "Shorten deal closing cycle by 18 days and expand pipeline to $2.2M",
      owner: "VP Engineering & VP Sales",
      completed: false
    },
    {
      timeframe: "Days 61 - 90 (Q4 Closing Sprint & 2027 Scale Foundation)",
      milestoneTitle: "Finalize Enterprise MSAs & Convene Strategy Board",
      actions: [
        "Execute final MSA renewals with Horizon Aerospace and Vanguard Capital",
        "Audit 90-day KPI outcomes against initial strategic targets",
        "Draft Q1 FY2027 board resource allocation deck"
      ],
      expectedKpiImpact: "Hit $2.10M ARR milestone and lock 100% net revenue retention",
      owner: "Executive Board",
      completed: false
    }
  ]
};

export const StrategyView: React.FC = () => {
  const { user, profile } = useAuth();
  const [dateRange, setDateRange] = useState<string>('Last 90 Days');
  const [activeTab, setActiveTab] = useState<'overview' | 'risks' | 'opportunities' | 'plan'>('overview');
  const [strategies, setStrategies] = useState<StrategyRecord[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const activeCompanyName = profile?.companyName || selectedStrategy?.companyName || 'PRIME Corp';

  // Load existing strategies on mount
  useEffect(() => {
    if (user) {
      loadStrategies();
    }
  }, [user]);

  const loadStrategies = async () => {
    if (!user) return;
    try {
      setLoadingList(true);
      const data = await fetchUserStrategies(user.uid);
      setStrategies(data);
      if (data.length > 0 && !selectedStrategy) {
        setSelectedStrategy(data[0]);
      } else if (data.length === 0 && !selectedStrategy) {
        // Provide sample baseline record
        const sampleRecord: StrategyRecord = {
          id: 'strat_demo_init',
          userId: user.uid,
          companyName: activeCompanyName,
          dateRange: 'Last 90 Days',
          strategy: DEFAULT_SAMPLE_STRATEGY,
          createdAt: new Date().toISOString(),
          syncedToSupabase: true
        };
        setSelectedStrategy(sampleRecord);
        setStrategies([sampleRecord]);
      }
    } catch (err) {
      console.error('Error fetching strategies:', err);
    } finally {
      setLoadingList(false);
    }
  };

  const handleGenerateStrategy = async () => {
    if (!user) return;
    try {
      setLoading(true);

      // 1. Gather all cross-functional intelligence from tables
      const [crmData, growthAudits, meetings] = await Promise.all([
        fetchCRMRecords(user.uid).catch(() => []),
        fetchUserGrowthAudits(user.uid).catch(() => []),
        fetchUserMeetings(user.uid).catch(() => [])
      ]);

      const deals = crmData.filter(c => c.type === 'LEAD' || c.dealValue > 0);

      // 2. Send multi-table payload to Gemini Chief Strategy Officer endpoint
      const response = await fetch('/api/gemini/strategy-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: activeCompanyName,
          dateRange,
          crmData,
          deals,
          growthAudits,
          meetings,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate strategy');
      }

      const generatedPlan: StrategyPlan = await response.json();

      // 3. Save to Supabase 'strategy_reports' table
      const savedRecord = await saveStrategyToSupabase(user.uid, {
        companyName: activeCompanyName,
        dateRange,
        strategy: generatedPlan,
      });

      setSelectedStrategy(savedRecord);
      setStrategies(prev => [savedRecord, ...prev.filter(s => s.id !== savedRecord.id)]);
      setActiveTab('overview');
    } catch (err: any) {
      console.error('Strategy generation error:', err);
      alert(err.message || 'Strategy generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMilestone = (index: number) => {
    if (!selectedStrategy || !selectedStrategy.strategy.plan_90_day) return;
    const updatedPlan = [...selectedStrategy.strategy.plan_90_day];
    updatedPlan[index] = {
      ...updatedPlan[index],
      completed: !updatedPlan[index].completed,
    };

    const updatedStrategy: StrategyPlan = {
      ...selectedStrategy.strategy,
      plan_90_day: updatedPlan,
    };

    const updatedRecord: StrategyRecord = {
      ...selectedStrategy,
      strategy: updatedStrategy,
    };

    setSelectedStrategy(updatedRecord);
    setStrategies(prev => prev.map(s => s.id === updatedRecord.id ? updatedRecord : s));
  };

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleDownloadPDF = () => {
    exportStrategyReportPDF(selectedStrategy, activeCompanyName);
  };

  const currentStrategy = selectedStrategy?.strategy || DEFAULT_SAMPLE_STRATEGY;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#E6B800] flex items-center justify-center text-black shadow-[0_0_20px_rgba(255,215,0,0.25)]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  PRIME <span className="text-[#FFD700]">STRATEGY BOARD</span>
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FFD700] text-black">
                  PAGE 10
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  <Database className="w-3 h-3" /> Supabase: strategy_reports
                </span>
              </div>
              <p className="text-xs text-white/50">
                Autonomous Chief Strategy Officer (CSO) synthesizing CRM, Deals, Growth Audits & Meeting transcripts into a unified 90-day battleplan.
              </p>
            </div>
          </div>
        </div>

        {/* Controls: Date Range Picker + PDF Download + Refresh */}
        <div className="flex items-center flex-wrap gap-2.5">
          
          {/* 1. Date Range Picker */}
          <div className="relative flex items-center bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white">
            <Calendar className="w-3.5 h-3.5 text-[#FFD700] mr-2" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-4"
            >
              {DATE_RANGE_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-[#141414] text-white">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Downloadable PDF Report Button */}
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 transition-all cursor-pointer"
            title="Download Printable Executive Strategy PDF"
          >
            <Download className="w-3.5 h-3.5 text-[#FFD700]" />
            <span>Download PDF Report</span>
          </button>

          {/* Refresh Archive */}
          <button
            onClick={loadStrategies}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            title="Refresh Strategy Hub"
          >
            <RefreshCw className={`w-4 h-4 ${loadingList ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Action Banner: Generate Q4 Strategy Button */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#18140B] via-[#141414] to-[#0F1511] border border-[#FFD700]/30 shadow-[0_0_35px_rgba(255,215,0,0.08)] flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#FFD700]/10 text-[#FFD700] text-[10px] font-bold tracking-wider uppercase border border-[#FFD700]/20">
              CROSS-TABLE INTELLIGENCE SYNTHESIZER
            </span>
            <span className="text-xs text-white/40">
              Aggregating CRM Deals, Meetings & Growth Audits
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Execute Q4 Strategy Synthesis ({dateRange})
          </h2>
          <p className="text-xs text-white/60 max-w-2xl leading-relaxed">
            Feeds all active CRM account states, customer ticket escalations, website conversion levers, and executive meeting decisions to PRIME Chief Strategy Officer.
          </p>
        </div>

        <button
          onClick={handleGenerateStrategy}
          disabled={loading}
          className="px-6 py-4 bg-gradient-to-r from-[#FFD700] to-[#E6B800] hover:from-[#FFE033] hover:to-[#FFD700] text-black font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_30px_rgba(255,215,0,0.35)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shrink-0 cursor-pointer"
        >
          <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Synthesizing Q4 Strategy...' : 'Generate Q4 Strategy'}</span>
        </button>
      </div>

      {/* SCORE CARDS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Strategic Health Score */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-white/5 shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Strategic Health</p>
            <p className="text-2xl font-extrabold text-white font-mono">
              {currentStrategy.strategic_health_score || 88}
              <span className="text-xs font-normal text-white/40">/100</span>
            </p>
            <p className="text-[10px] text-emerald-400 font-semibold">High Conviction</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700]">
            <Crown className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Projected ARR Impact */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-white/5 shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Projected ARR Boost</p>
            <p className="text-2xl font-extrabold text-emerald-400 font-mono">
              {currentStrategy.projected_arr_impact || '+$620,000'}
            </p>
            <p className="text-[10px] text-white/40">Modeled Q4 Expansion</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Pipeline Health Rating */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-white/5 shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Pipeline Velocity</p>
            <p className="text-base font-extrabold text-white truncate max-w-[140px]">
              {currentStrategy.pipeline_health_rating?.split('(')[0] || 'Strong Velocity'}
            </p>
            <p className="text-[10px] text-blue-400 font-semibold truncate">
              {currentStrategy.pipeline_health_rating?.includes('(') ? currentStrategy.pipeline_health_rating.split('(')[1].replace(')', '') : '$1.8M Qualified'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Execution Readiness */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-white/5 shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Execution Readiness</p>
            <p className="text-2xl font-extrabold text-white font-mono">
              {currentStrategy.execution_readiness_score || 92}
              <span className="text-xs font-normal text-white/40">%</span>
            </p>
            <p className="text-[10px] text-emerald-400 font-semibold">Cross-Team Aligned</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Zap className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 3. 4 TABS NAVIGATION (Overview | Risks | Opportunities | 90-Day Plan) */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#141414] border border-white/5 rounded-2xl">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#FFD700] text-black shadow-lg'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>1. Strategic Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('risks')}
          className={`flex-1 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'risks'
              ? 'bg-rose-500 text-white shadow-lg'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>2. Top 3 Risks ({currentStrategy.top_3_risks?.length || 3})</span>
        </button>

        <button
          onClick={() => setActiveTab('opportunities')}
          className={`flex-1 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'opportunities'
              ? 'bg-emerald-400 text-black shadow-lg'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>3. Top 3 Opportunities ({currentStrategy.top_3_opportunities?.length || 3})</span>
        </button>

        <button
          onClick={() => setActiveTab('plan')}
          className={`flex-1 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'plan'
              ? 'bg-blue-500 text-white shadow-lg'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>4. 90-Day Plan & Assignments</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB CONTENT AREAS */}
      {/* ========================================================= */}

      {/* TAB 1: STRATEGIC OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Executive Summary Card */}
          <div className="p-6 rounded-2xl bg-[#141414] border border-white/5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700]">
                  <Crown className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#FFD700]">
                  Chief Strategy Officer: Executive Synthesis
                </h3>
              </div>

              <button
                onClick={() => copyToClipboard(currentStrategy.executive_summary, 'exec_summary')}
                className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                {copiedSection === 'exec_summary' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'exec_summary' ? 'Copied' : 'Copy Brief'}</span>
              </button>
            </div>

            <div className="p-5 rounded-xl bg-black/40 border border-white/5">
              <p className="text-sm text-zinc-200 leading-relaxed font-sans font-normal">
                {currentStrategy.executive_summary}
              </p>
            </div>
          </div>

          {/* Q4 Goals Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#FFD700]" /> Q4 Strategic Goals & Milestones
              </span>
              <span className="text-[10px] text-white/30">Targeting Q4 Close</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentStrategy.q4_goals && currentStrategy.q4_goals.map((goal, gIdx) => (
                <div 
                  key={gIdx}
                  className="p-5 rounded-2xl bg-[#141414] border border-white/5 hover:border-[#FFD700]/30 transition-all flex flex-col justify-between shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {goal.deadline}
                      </span>
                      <span className="text-[10px] font-extrabold text-[#FFD700]">
                        {goal.status || 'ON_TRACK'}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs text-white/40 uppercase font-semibold">Target Metric</p>
                      <h4 className="text-base font-extrabold text-white">{goal.targetMetric}</h4>
                      <p className="text-[11px] text-white/40 mt-0.5">Baseline: {goal.currentBaseline}</p>
                    </div>

                    <p className="text-xs text-white/60 leading-relaxed font-sans">
                      {goal.description}
                    </p>
                  </div>

                  {goal.keyResults && goal.keyResults.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5">
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Key Results:</p>
                      {goal.keyResults.map((kr, krIdx) => (
                        <div key={krIdx} className="flex items-start gap-1.5 text-[11px] text-zinc-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{kr}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Snapshot: Risks & Opportunities side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Risk Snapshot */}
            <div className="p-5 rounded-2xl bg-[#141414] border border-rose-500/20 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" /> Top Churn & Revenue Risks
                </span>
                <button 
                  onClick={() => setActiveTab('risks')} 
                  className="text-xs text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View All <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2">
                {currentStrategy.top_3_risks && currentStrategy.top_3_risks.map((r, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{r.title}</span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400">
                        {r.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/50 line-clamp-1">{r.mitigationPlan}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunity Snapshot */}
            <div className="p-5 rounded-2xl bg-[#141414] border border-emerald-500/20 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Top Revenue Upside Levers
                </span>
                <button 
                  onClick={() => setActiveTab('opportunities')} 
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View All <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2">
                {currentStrategy.top_3_opportunities && currentStrategy.top_3_opportunities.map((o, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{o.title}</span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                        {o.potentialARR}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/50 line-clamp-1">{o.actionRequired}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: TOP 3 RISKS */}
      {activeTab === 'risks' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Cross-Functional Risk Matrix</h3>
              <p className="text-xs text-white/50">Identified from silent CRM deals, customer SLA tickets, and product telemetry bottlenecks.</p>
            </div>
            <button
              onClick={() => {
                const text = currentStrategy.top_3_risks.map((r, i) => `Risk ${i + 1}: ${r.title} [${r.severity}]\nDescription: ${r.description}\nMitigation: ${r.mitigationPlan}`).join('\n\n');
                copyToClipboard(text, 'risks');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              {copiedSection === 'risks' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Risk Assessment</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {currentStrategy.top_3_risks && currentStrategy.top_3_risks.map((risk, rIdx) => (
              <div 
                key={rIdx}
                className="p-6 rounded-2xl bg-[#141414] border border-rose-500/20 hover:border-rose-500/40 transition-all flex flex-col justify-between shadow-xl relative overflow-hidden group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      RISK #{rIdx + 1} • {risk.category}
                    </span>
                    <span className="text-xs font-bold text-rose-400">
                      {risk.severity} SEVERITY
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug group-hover:text-rose-300 transition-colors">
                    {risk.title}
                  </h4>

                  <div className="p-3 rounded-xl bg-black/50 border border-white/5 text-xs text-white/70 leading-relaxed font-sans">
                    <p className="font-semibold text-white/40 text-[10px] uppercase mb-1">Root Cause Vector:</p>
                    {risk.description}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#FFD700] uppercase tracking-wider">
                    <ShieldAlert className="w-3.5 h-3.5" /> Mitigation Playbook
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed font-sans p-3 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20">
                    {risk.mitigationPlan}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TOP 3 OPPORTUNITIES */}
      {activeTab === 'opportunities' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Revenue & Commercial Upside Levers</h3>
              <p className="text-xs text-white/50">Derived from Growth Lab teardowns, hot CRM deal velocity, and executive meeting approvals.</p>
            </div>
            <button
              onClick={() => {
                const text = currentStrategy.top_3_opportunities.map((o, i) => `Opportunity ${i + 1}: ${o.title} (${o.potentialARR})\nDescription: ${o.description}\nAction Required: ${o.actionRequired}`).join('\n\n');
                copyToClipboard(text, 'opps');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              {copiedSection === 'opps' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Opportunities</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {currentStrategy.top_3_opportunities && currentStrategy.top_3_opportunities.map((opp, oIdx) => (
              <div 
                key={oIdx}
                className="p-6 rounded-2xl bg-[#141414] border border-emerald-500/20 hover:border-emerald-500/40 transition-all flex flex-col justify-between shadow-xl relative overflow-hidden group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      LEVER #{oIdx + 1} • {opp.category}
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      {opp.confidenceScore || 90}% Confidence
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug group-hover:text-emerald-300 transition-colors">
                    {opp.title}
                  </h4>

                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>{opp.potentialARR}</span>
                  </div>

                  <p className="text-xs text-white/70 leading-relaxed font-sans">
                    {opp.description}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#FFD700] uppercase tracking-wider">
                    <Zap className="w-3.5 h-3.5" /> Execution Action Plan
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed font-sans p-3 rounded-xl bg-black/50 border border-white/5">
                    {opp.actionRequired}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: 90-DAY PLAN & TEAM ASSIGNMENTS */}
      {activeTab === 'plan' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Section 4A: 90-Day Milestone Roadmap Checklist */}
          <div className="p-6 rounded-2xl bg-[#141414] border border-white/5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400">
                  90-Day Execution Roadmap ({currentStrategy.plan_90_day?.length || 3} Phases)
                </h3>
              </div>

              <button
                onClick={() => {
                  const text = (currentStrategy.plan_90_day || []).map((p, i) => `${p.timeframe}: ${p.milestoneTitle}\nActions:\n${p.actions.map(a => `- ${a}`).join('\n')}\nKPI Impact: ${p.expectedKpiImpact}`).join('\n\n');
                  copyToClipboard(text, 'roadmap');
                }}
                className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                {copiedSection === 'roadmap' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy 90-Day Roadmap</span>
              </button>
            </div>

            <div className="space-y-4">
              {currentStrategy.plan_90_day && currentStrategy.plan_90_day.map((phase, pIdx) => (
                <div
                  key={pIdx}
                  onClick={() => toggleMilestone(pIdx)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-start gap-4 ${
                    phase.completed
                      ? 'bg-emerald-500/[0.04] border-emerald-500/25 text-white/40'
                      : 'bg-black/40 border-white/10 hover:border-white/20 text-white'
                  }`}
                >
                  <div className={`mt-1 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                    phase.completed 
                      ? 'bg-emerald-500 border-emerald-500 text-black' 
                      : 'border-white/20 text-transparent hover:border-[#FFD700]'
                  }`}>
                    <Check className="w-4 h-4" />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/25">
                        {phase.timeframe}
                      </span>
                      <span className="text-xs text-white/40">
                        Lead: <strong className="text-white">{phase.owner}</strong>
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">
                      {phase.milestoneTitle}
                    </h4>

                    {/* Actions bullets */}
                    <div className="space-y-1.5 pt-1">
                      {phase.actions.map((act, actIdx) => (
                        <div key={actIdx} className="flex items-start gap-2 text-xs text-zinc-300">
                          <ChevronRight className="w-3.5 h-3.5 text-[#FFD700] shrink-0 mt-0.5" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>

                    {phase.expectedKpiImpact && (
                      <p className="text-xs text-emerald-400 font-semibold pt-1">
                        Target Impact: {phase.expectedKpiImpact}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4B: Team Assignments & Executive Ownership Matrix */}
          <div className="p-6 rounded-2xl bg-[#141414] border border-white/5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400">
                  Executive Team Assignments & Resource Allocation
                </h3>
              </div>

              <span className="text-xs text-white/40">
                {currentStrategy.team_assignments?.length || 4} Squads Accountable
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentStrategy.team_assignments && currentStrategy.team_assignments.map((team, tIdx) => (
                <div key={tIdx} className="p-5 rounded-xl bg-black/40 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#FFD700]" />
                      {team.roleOrLeader}
                    </span>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-[#FFD700] text-black">
                      {team.priority || 'P0'}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-semibold">
                    Focus: <span className="text-[#FFD700]">{team.focusArea}</span>
                  </p>

                  <div className="space-y-1 pt-1 border-t border-white/5">
                    <p className="text-[10px] uppercase font-bold text-white/30 tracking-wider">Key Deliverables:</p>
                    {team.keyDeliverables.map((del, dIdx) => (
                      <div key={dIdx} className="flex items-start gap-1.5 text-[11px] text-zinc-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{del}</span>
                      </div>
                    ))}
                  </div>

                  {team.allocatedBudgetOrFTE && (
                    <div className="pt-2 text-[10px] text-white/40 flex items-center justify-between">
                      <span>Resource Allocation:</span>
                      <strong className="text-white font-mono">{team.allocatedBudgetOrFTE}</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Historical Generated Strategies (Synced to Supabase) */}
      <div className="p-5 rounded-2xl bg-[#141414] border border-white/5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-white/50 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-[#FFD700]" /> Supabase Strategy Archive
          </span>
          <span className="text-[10px] font-mono text-white/30">
            {strategies.length} Records Persisted
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {strategies.map((strat) => (
            <div
              key={strat.id}
              onClick={() => setSelectedStrategy(strat)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                selectedStrategy?.id === strat.id
                  ? 'bg-[#FFD700]/10 border-[#FFD700]/40 shadow-lg'
                  : 'bg-black/30 border-white/5 hover:border-white/15'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-[#FFD700]">
                  {strat.dateRange}
                </span>
                <span className="text-[10px] text-white/30">
                  {new Date(strat.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="text-xs font-bold text-white truncate">
                {strat.companyName} Q4 Strategy
              </p>
              <p className="text-[10px] text-white/40 line-clamp-1 mt-0.5">
                Health Score: {strat.strategy?.strategic_health_score || 88}/100 • {strat.strategy?.projected_arr_impact || '+$620k ARR'}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
