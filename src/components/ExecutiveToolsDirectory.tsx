import React, { useState } from 'react';
import { 
  Crown, 
  Inbox, 
  FileText, 
  BrainCircuit, 
  Radar, 
  Mic, 
  Users, 
  Video, 
  TrendingUp, 
  Target, 
  Briefcase, 
  DollarSign, 
  Calculator, 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  CheckSquare, 
  Search, 
  ArrowUpRight, 
  SlidersHorizontal,
  Bot
} from 'lucide-react';

interface ExecutiveToolsDirectoryProps {
  onNavigate: (view: string) => void;
  filterCategory?: string;
}

interface ToolDefinition {
  id: string;
  name: string;
  category: 'AI Executives' | 'Finance & Margins' | 'Core Operations' | 'Autonomous Swarms';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  tagColor: string;
  metrics: string;
  actionLabel: string;
  highlight?: boolean;
}

export const toolsCatalog: ToolDefinition[] = [
  {
    id: 'closer',
    name: 'PRIME Closer AI',
    category: 'AI Executives',
    description: 'Executive sales call audio audit, objection defense scoring (0-100), and custom closing battle scripts.',
    icon: Mic,
    tag: 'Audio Coach',
    tagColor: 'bg-[#FFD700] text-black',
    metrics: '+34% Win Rate',
    actionLabel: 'Launch Closer AI',
    highlight: true
  },
  {
    id: 'hiring',
    name: 'PRIME Hiring AI',
    category: 'AI Executives',
    description: 'Multi-candidate CV ranker, match percentage benchmarks, and 10 hyper-customized interview questions.',
    icon: Users,
    tag: 'Talent Scout',
    tagColor: 'bg-blue-400 text-black',
    metrics: 'Rank in 1.4s',
    actionLabel: 'Rank Candidates'
  },
  {
    id: 'meetings',
    name: 'PRIME Meeting AI',
    category: 'AI Executives',
    description: 'Executive audio & transcript synthesis, automated action items checklist, and draft follow-up email dispatch.',
    icon: Video,
    tag: 'Meeting Intel',
    tagColor: 'bg-amber-400 text-black',
    metrics: 'Zero Manual Notes',
    actionLabel: 'Synthesize Meeting'
  },
  {
    id: 'growth',
    name: 'PRIME Growth Lab',
    category: 'AI Executives',
    description: 'Commercial URL growth audit, top 3 scalable revenue levers, and structured 30-day growth roadmap.',
    icon: TrendingUp,
    tag: 'Revenue Levers',
    tagColor: 'bg-emerald-400 text-black',
    metrics: '3 Key Levers',
    actionLabel: 'Run Growth Audit'
  },
  {
    id: 'strategy',
    name: 'PRIME Strategy Board',
    category: 'AI Executives',
    description: '90-day strategy synthesizer, risk vs opportunity quad-matrix, and executive PDF board report exports.',
    icon: Target,
    tag: 'Strategic Vision',
    tagColor: 'bg-[#FFD700] text-black',
    metrics: 'PDF Export Ready',
    actionLabel: 'Open Strategy Board'
  },
  {
    id: 'board-pack',
    name: 'PRIME Board Pack',
    category: 'AI Executives',
    description: 'Director slide deck generator, ARR & margin breakdown, and voting quorum resolution drafting.',
    icon: Briefcase,
    tag: 'Governance',
    tagColor: 'bg-[#FFD700] text-black',
    metrics: 'Quorum Ready',
    actionLabel: 'Generate Board Pack'
  },
  {
    id: 'twin',
    name: 'CEO Digital Twin 3.0',
    category: 'AI Executives',
    description: 'Your autonomous digital persona with customized tone calibration, decision frameworks, and instant delegate replies.',
    icon: Sparkles,
    tag: 'Autonomous Twin',
    tagColor: 'bg-gradient-to-r from-[#FFD700] to-amber-500 text-black',
    metrics: 'Trained on 100+ Decisions',
    actionLabel: 'Open Digital Twin',
    highlight: true
  },
  {
    id: 'ad-spend',
    name: 'Ad Spend & CAC Optimizer',
    category: 'Finance & Margins',
    description: 'Multi-channel marketing campaign analysis across Meta, Google, LinkedIn & TikTok to prune low-ROAS ad waste.',
    icon: Target,
    tag: 'Spend Guard',
    tagColor: 'bg-emerald-400 text-black',
    metrics: 'Cut 15-30% CAC Waste',
    actionLabel: 'Optimize Ad Spend'
  },
  {
    id: 'cashflow-guard',
    name: 'Cash Flow & Invoice Sentry',
    category: 'Finance & Margins',
    description: 'Aging client receivables tracker, 1-click WhatsApp/Email escalation drafts, and gateway fee leakage shield.',
    icon: DollarSign,
    tag: 'Cash Recovery',
    tagColor: 'bg-blue-400 text-black',
    metrics: 'Recover Stalled Invoices',
    actionLabel: 'Open Cash Flow Guard'
  },
  {
    id: 'roi-calculator',
    name: 'Executive ROI & Value Model',
    category: 'Finance & Margins',
    description: 'Interactive D3.js financial return model, breakeven payback periods, and CFO-ready investment proposals.',
    icon: Calculator,
    tag: 'D3.js Model',
    tagColor: 'bg-[#FFD700] text-black',
    metrics: '14.8x Avg ROI',
    actionLabel: 'Calculate Returns'
  },
  {
    id: 'inbox',
    name: 'Executive Inbox Triage',
    category: 'Core Operations',
    description: 'Urgency-scored thread triage, high-confidence AI draft replies, and 1-click Firestore dispatch.',
    icon: Inbox,
    tag: 'Zero Inbox',
    tagColor: 'bg-blue-500 text-white',
    metrics: '0.45h Saved / Thread',
    actionLabel: 'Open Inbox'
  },
  {
    id: 'docs',
    name: 'Documents Intelligence',
    category: 'Core Operations',
    description: 'Deep PDF & contract parsing, legal risk detection, red flag warnings, and actionable executive summaries.',
    icon: FileText,
    tag: 'Contract Audit',
    tagColor: 'bg-purple-500 text-white',
    metrics: 'Analyze in 1.2s',
    actionLabel: 'Upload & Analyze'
  },
  {
    id: 'brain',
    name: 'PRIME Brain (AI COO)',
    category: 'Core Operations',
    description: 'Strategic conversational Chief of Operations delivering 3 direct high-leverage actions on every business query.',
    icon: BrainCircuit,
    tag: 'COO Persona',
    tagColor: 'bg-amber-400 text-black',
    metrics: '3 Direct Actions',
    actionLabel: 'Consult Brain'
  },
  {
    id: 'radar',
    name: 'Revenue Radar & Churn Sentry',
    category: 'Core Operations',
    description: 'Real-time multi-tenant deal risk monitoring, revenue pipeline telemetry, and executive rescue playbooks.',
    icon: Radar,
    tag: 'Deal Shield',
    tagColor: 'bg-rose-500 text-white',
    metrics: 'Live Pipeline Telemetry',
    actionLabel: 'Open Revenue Radar'
  },
  {
    id: 'approvals',
    name: 'Approval Log & Audit Trail',
    category: 'Core Operations',
    description: 'Full chronological ledger of executive sign-offs, email dispatches, and compliance actions.',
    icon: CheckSquare,
    tag: 'Audit Trail',
    tagColor: 'bg-emerald-500 text-white',
    metrics: 'SOC2 Compliant',
    actionLabel: 'View Approval Log'
  }
];

export const ExecutiveToolsDirectory: React.FC<ExecutiveToolsDirectoryProps> = ({ 
  onNavigate,
  filterCategory 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(filterCategory || 'ALL');

  const categories = [
    'ALL',
    'AI Executives',
    'Finance & Margins',
    'Core Operations'
  ];

  const filteredTools = toolsCatalog.filter(tool => {
    const matchesCategory = selectedCategory === 'ALL' || tool.category === selectedCategory;
    const matchesSearch = 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Directory Filter & Search Header */}
      <div className="bg-[#121212] rounded-2xl border border-white/5 p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/25 text-[#FFD700] text-xs font-semibold uppercase tracking-wider mb-2">
              <Crown className="w-3.5 h-3.5" />
              <span>Modular Executive Suite</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Executive Tools &amp; Specialized Engines
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              Cleanly separated from your main command dashboard. Open any tool directly with dedicated states.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools, engines, audits..."
              className="w-full bg-[#181818] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#FFD700]"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-white/5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-white/30 shrink-0 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#FFD700] text-black font-extrabold shadow-sm'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat === 'ALL' ? `All Tools (${toolsCatalog.length})` : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              onClick={() => onNavigate(tool.id)}
              className={`rounded-2xl p-6 bg-[#141414] border hover:border-[#FFD700]/50 transition-all duration-200 cursor-pointer group flex flex-col justify-between shadow-lg relative overflow-hidden ${
                tool.highlight ? 'border-[#FFD700]/30 bg-gradient-to-b from-[#18150D] to-[#121212]' : 'border-white/5'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FFD700] group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${tool.tagColor}`}>
                    {tool.tag}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white group-hover:text-[#FFD700] transition-colors flex items-center gap-1.5">
                    <span>{tool.name}</span>
                  </h4>
                  <p className="text-xs text-white/50 leading-relaxed mt-1.5 line-clamp-3">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-white/40">
                  {tool.metrics}
                </span>
                <span className="font-bold text-[#FFD700] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>{tool.actionLabel}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTools.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-[#141414] border border-white/5 space-y-3">
          <Search className="w-8 h-8 text-white/30 mx-auto" />
          <p className="text-sm font-bold text-white">No tools found matching "{searchQuery}"</p>
          <p className="text-xs text-white/40">Try searching for a different keyword or reset filters.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
            className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
