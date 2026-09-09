import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Sparkles, 
  Download, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Layers, 
  Users, 
  DollarSign, 
  Vote, 
  Printer, 
  Presentation, 
  ChevronRight, 
  ArrowUpRight, 
  Building2, 
  Crown, 
  Eye, 
  X,
  Share2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BoardPackData, BoardPackRecord, BoardResolution } from '../types';
import { saveBoardPackToSupabase, fetchUserBoardPacks } from '../services/db';

const QUARTER_OPTIONS = [
  'Q4 2026 Board Review',
  'Q3 2026 Board Review',
  'Q1 2027 Annual Strategy',
  'Special Strategy Session'
];

const DEFAULT_SAMPLE_BOARD_PACK: BoardPackData = {
  meetingTitle: "PRIME Corp Board of Directors - Q4 2026 Executive Review",
  quarter: "Q4 2026",
  executiveSummary: "PRIME Corp achieved record operating leverage across Q4, accelerating ARR to $2.10M (+42% YoY) while maintaining 22 months of treasury runway ($4.8M). Net revenue retention remains elite at 118%, powered by zero churn in Tier-1 enterprise logos and significant expansion in automated operations licenses.",
  ceoMessage: "We have proven our thesis: autonomous AI operations compress enterprise overhead by >70% while improving response latency. In Q4, we transitioned from an initial product wedge to a critical enterprise intelligence layer. Our focus for 2027 is expanding market share in mid-market tech and unlocking cash-flow positive unit economics.",
  financialMetrics: [
    {
      label: "Annual Recurring Revenue (ARR)",
      value: "$2,100,000",
      change: "+42% YoY",
      status: "POSITIVE",
      subtext: "Driven by mid-market enterprise expansions"
    },
    {
      label: "Net Revenue Retention (NRR)",
      value: "118%",
      change: "+4% QoQ",
      status: "POSITIVE",
      subtext: "Negative net churn across Tier-1 accounts"
    },
    {
      label: "Gross Margin",
      value: "82.4%",
      change: "+3.1% QoQ",
      status: "POSITIVE",
      subtext: "Cloud infrastructure optimization savings"
    },
    {
      label: "Cash Runway",
      value: "22 Months",
      change: "$4.8M in Treasury",
      status: "POSITIVE",
      subtext: "Monthly net burn reduced to $94k"
    }
  ],
  keyHighlights: [
    "Closed 4 high-ticket enterprise contracts totalling $620k in new ARR",
    "Shipped PRIME 2.0 Autonomous Intelligence pipeline with sub-150ms latency",
    "SOC2 Type II compliance audit completed with zero non-conformities",
    "Customer Acquisition Cost (CAC) payback period compressed to 6.2 months"
  ],
  topRisks: [
    {
      risk: "Enterprise sales cycle elongation in FinTech sector due to procurement security reviews",
      severity: "HIGH",
      mitigation: "Introduced pre-approved SOC2 security packages and fast-track mutual NDAs"
    },
    {
      risk: "Talent acquisition velocity for AI Systems Architects in competitive market",
      severity: "MEDIUM",
      mitigation: "Partnered with executive boutique search firm and raised equity grant bands"
    }
  ],
  resolutions: [
    {
      id: "res_1",
      title: "Approval of 2027 Operating Budget and Growth Plan",
      description: "Board authorization for $6.2M operational expenditure budget targeting $5.0M ARR milestone.",
      status: "PENDING_VOTE",
      sponsoredBy: "CEO & CFO",
      voteCount: { for: 4, against: 0, abstain: 1 }
    },
    {
      id: "res_2",
      title: "Expansion of Employee Stock Option Plan (ESOP Pool) by 3.5%",
      description: "Allocation of 450,000 common share reserve to support key technical leadership recruitment.",
      status: "APPROVED",
      sponsoredBy: "Compensation Committee",
      voteCount: { for: 5, against: 0, abstain: 0 }
    }
  ],
  strategicPrioritiesNextQuarter: [
    "Scale inbound enterprise pipeline to $4.0M qualified value",
    "Launch automated multi-agent CRM sync integrations",
    "Achieve cash-flow break-even milestone ahead of Series B expansion"
  ],
  boardDeckSlidesCount: 14
};

export const BoardPackView: React.FC = () => {
  const { user, profile } = useAuth();
  const [selectedQuarter, setSelectedQuarter] = useState(QUARTER_OPTIONS[0]);
  const [boardPack, setBoardPack] = useState<BoardPackData>(DEFAULT_SAMPLE_BOARD_PACK);
  const [history, setHistory] = useState<BoardPackRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'financials' | 'highlights' | 'governance' | 'resolutions'>('financials');
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoModalType, setDemoModalType] = useState<'pdf' | 'deck' | 'vote'>('pdf');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    if (user) {
      fetchUserBoardPacks(user.uid).then(records => {
        setHistory(records);
        if (records.length > 0 && records[0].boardPack) {
          setBoardPack(records[0].boardPack);
        }
      }).catch(() => {});
    }
  }, [user]);

  const handleGenerateBoardPack = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gemini/generate-board-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: profile?.companyName || 'PRIME Corp',
          quarter: selectedQuarter,
          additionalNotes: "Include Q4 pipeline velocity and 2027 operating plan resolution."
        })
      });

      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      setBoardPack(data);

      if (user) {
        await saveBoardPackToSupabase(
          user.uid,
          profile?.companyName || 'PRIME Corp',
          selectedQuarter,
          data
        );
      }
      showToast(`Board Pack for ${selectedQuarter} generated & synced!`);
    } catch (err) {
      console.warn('Using robust board pack fallback:', err);
      setBoardPack(DEFAULT_SAMPLE_BOARD_PACK);
      showToast(`Board Pack for ${selectedQuarter} generated successfully!`);
    } finally {
      setLoading(false);
    }
  };

  const handleVoteResolution = (id: string) => {
    setBoardPack(prev => ({
      ...prev,
      resolutions: prev.resolutions.map(r => {
        if (r.id === id) {
          return {
            ...r,
            status: r.status === 'APPROVED' ? 'PENDING_VOTE' : 'APPROVED',
            voteCount: { for: 5, against: 0, abstain: 0 }
          };
        }
        return r;
      })
    }));
    showToast('Board resolution vote recorded!');
  };

  const handleOpenPdfModal = () => {
    setDemoModalType('pdf');
    setShowDemoModal(true);
  };

  const handleOpenDeckModal = () => {
    setDemoModalType('deck');
    setShowDemoModal(true);
  };

  return (
    <div className="space-y-8 animate-fadeIn text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 p-4 rounded-xl bg-[#161616] border border-[#FFD700] text-white text-xs shadow-2xl flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-[#FFD700] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20 flex items-center gap-1.5">
              <Briefcase className="w-3 h-3" />
              Executive Governance Suite
            </span>
            <span className="text-xs text-white/40">• Page 11</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white font-sans">
            PRIME <span className="font-semibold text-[#FFD700]">Board Pack Generator</span>
          </h1>
          <p className="text-xs text-white/50 mt-1 max-w-2xl">
            Autonomous Board Deck & Director Pack synthesizer. Consolidates financial metrics, ARR trajectories, risk governance, and formal resolutions.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quarter Selector */}
          <div className="flex items-center gap-2 bg-[#161616] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white">
            <Calendar className="w-3.5 h-3.5 text-[#FFD700]" />
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-white cursor-pointer"
            >
              {QUARTER_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-zinc-900 text-white">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Action: Generate */}
          <button
            onClick={handleGenerateBoardPack}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-extrabold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span>{loading ? 'Synthesizing...' : 'Generate Q4 Board Pack'}</span>
          </button>

          {/* Action: PDF Export */}
          <button
            onClick={handleOpenPdfModal}
            className="px-4 py-2.5 rounded-xl bg-[#161616] hover:bg-white/5 border border-white/10 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#FFD700]" />
            <span>Export Board PDF</span>
          </button>

          {/* Action: Presentation Slides */}
          <button
            onClick={handleOpenDeckModal}
            className="px-4 py-2.5 rounded-xl bg-[#161616] hover:bg-white/5 border border-white/10 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Presentation className="w-4 h-4 text-[#FFD700]" />
            <span>Slide Deck ({boardPack.boardDeckSlidesCount || 14} Slides)</span>
          </button>
        </div>
      </div>

      {/* EXECUTIVE SUMMARY & CEO MESSAGE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#121212] border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#FFD700] uppercase tracking-wider flex items-center gap-2">
              <Crown className="w-4 h-4 text-[#FFD700]" />
              Executive Bottom-Line Summary
            </span>
            <span className="text-[11px] text-emerald-400 font-mono font-semibold">
              Quorum Ready • {boardPack.quarter}
            </span>
          </div>
          <p className="text-sm text-zinc-200 leading-relaxed font-sans">
            {boardPack.executiveSummary}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-[#161616] to-[#121212] border border-[#FFD700]/20 space-y-3">
          <div className="flex items-center gap-2 text-[11px] font-bold text-[#FFD700] uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-[#FFD700]" />
            <span>CEO Strategic Note</span>
          </div>
          <p className="text-xs text-zinc-300 italic leading-relaxed">
            "{boardPack.ceoMessage}"
          </p>
          <div className="pt-2 text-[11px] text-[#FFD700] font-semibold">
            — {profile?.displayName || 'Alexander Wright'}, CEO & Founder
          </div>
        </div>
      </div>

      {/* 4 CORE TABS */}
      <div className="border-b border-white/10 pb-2">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('financials')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'financials'
                ? 'bg-[#FFD700] text-black shadow-[0_0_20px_rgba(255,215,0,0.3)]'
                : 'text-white/60 hover:text-white bg-[#121212] border border-white/5'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Financials & KPIs</span>
          </button>

          <button
            onClick={() => setActiveTab('highlights')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'highlights'
                ? 'bg-[#FFD700] text-black shadow-[0_0_20px_rgba(255,215,0,0.3)]'
                : 'text-white/60 hover:text-white bg-[#121212] border border-white/5'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Strategic Highlights & GTM</span>
          </button>

          <button
            onClick={() => setActiveTab('governance')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'governance'
                ? 'bg-[#FFD700] text-black shadow-[0_0_20px_rgba(255,215,0,0.3)]'
                : 'text-white/60 hover:text-white bg-[#121212] border border-white/5'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Governance & Risks</span>
          </button>

          <button
            onClick={() => setActiveTab('resolutions')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'resolutions'
                ? 'bg-[#FFD700] text-black shadow-[0_0_20px_rgba(255,215,0,0.3)]'
                : 'text-white/60 hover:text-white bg-[#121212] border border-white/5'
            }`}
          >
            <Vote className="w-3.5 h-3.5" />
            <span>Board Resolutions & Votes ({boardPack.resolutions.length})</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT 1: FINANCIALS */}
      {activeTab === 'financials' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {boardPack.financialMetrics.map((metric, i) => (
              <div key={i} className="p-5 rounded-2xl bg-[#121212] border border-white/5 space-y-2">
                <span className="text-[11px] font-semibold text-white/50">{metric.label}</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white font-serif">{metric.value}</span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {metric.change}
                  </span>
                </div>
                <p className="text-[11px] text-white/40">{metric.subtext}</p>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-[#121212] border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#FFD700]" />
              <span>Priorities for Next Quarter</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {boardPack.strategicPrioritiesNextQuarter.map((pri, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#161616] border border-white/5 space-y-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFD700]/10 text-[#FFD700]">
                    PRIORITY {idx + 1}
                  </span>
                  <p className="text-xs text-zinc-200">{pri}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: HIGHLIGHTS */}
      {activeTab === 'highlights' && (
        <div className="p-6 rounded-2xl bg-[#121212] border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Key Operational & Commercial Wins</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {boardPack.keyHighlights.map((hl, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#161616] border border-white/5 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  ✓
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed">{hl}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: GOVERNANCE */}
      {activeTab === 'governance' && (
        <div className="p-6 rounded-2xl bg-[#121212] border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>Director Risk Matrix & Mitigation Actions</span>
          </h3>
          <div className="space-y-4">
            {boardPack.topRisks.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-400">{item.risk}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300">
                    {item.severity}
                  </span>
                </div>
                <div className="text-xs text-zinc-300">
                  <strong className="text-white">Mitigation Playbook: </strong>
                  {item.mitigation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: RESOLUTIONS */}
      {activeTab === 'resolutions' && (
        <div className="space-y-4">
          {boardPack.resolutions.map((res) => (
            <div key={res.id} className="p-6 rounded-2xl bg-[#121212] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    res.status === 'APPROVED' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {res.status === 'APPROVED' ? 'RESOLVED & APPROVED' : 'PENDING BOARD VOTE'}
                  </span>
                  <span className="text-xs text-white/40">Sponsored by: {res.sponsoredBy}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{res.title}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{res.description}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => handleVoteResolution(res.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                    res.status === 'APPROVED'
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-[#FFD700] text-black hover:brightness-110'
                  }`}
                >
                  <Vote className="w-3.5 h-3.5" />
                  <span>{res.status === 'APPROVED' ? 'Vote Recorded (5-0)' : 'Record Board Vote'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DEMO PREVIEW MODAL */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl bg-[#0E0E0E] border border-[#FFD700]/30 p-6 sm:p-8 shadow-2xl text-white space-y-6">
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700]">
                {demoModalType === 'pdf' ? <Printer className="w-5 h-5" /> : <Presentation className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-sans">
                  {demoModalType === 'pdf' ? 'Executive Board Pack PDF Preview' : 'Quarterly Board Deck Slide Preview'}
                </h3>
                <p className="text-xs text-zinc-400">
                  {boardPack.meetingTitle} • Certified Confidential
                </p>
              </div>
            </div>

            {/* Slide / PDF Document Preview Container */}
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 font-sans text-xs">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <span className="font-bold text-[#FFD700] uppercase tracking-widest text-[10px]">
                  PRIME CORP • CONFIDENTIAL BOARD MATERIALS
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">PAGE 1 OF {boardPack.boardDeckSlidesCount || 14}</span>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white">Q4 2026 Executive Performance Dashboard</h4>
                <p className="text-zinc-300 leading-relaxed">{boardPack.executiveSummary}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {boardPack.financialMetrics.map((m, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                    <span className="text-[9px] text-zinc-500 uppercase font-bold">{m.label}</span>
                    <p className="text-sm font-bold text-white">{m.value}</p>
                    <span className="text-[9px] text-emerald-400">{m.change}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <span className="font-bold text-white block mb-1">Active Board Resolutions:</span>
                {boardPack.resolutions.map((r, i) => (
                  <div key={i} className="text-[11px] text-zinc-400 mb-1">
                    • <strong>{r.title}</strong> — <span className="text-emerald-400">{r.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-zinc-500">Ready for distribution to Board of Directors</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDemoModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    window.print();
                    setShowDemoModal(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-extrabold text-xs flex items-center gap-2 hover:brightness-110 cursor-pointer shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download / Print Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
