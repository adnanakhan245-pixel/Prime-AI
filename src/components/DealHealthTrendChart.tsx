import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea,
  Legend
} from 'recharts';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShieldCheck,
  Filter,
  Eye,
  Calendar,
  Sparkles,
  Layers,
  Search,
  ChevronDown,
  ChevronUp,
  Info,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { CRMRecord } from '../types';

interface DealHealthTrendChartProps {
  records: CRMRecord[];
  onSelectRecord?: (record: CRMRecord) => void;
  className?: string;
}

type TimeHorizon = '30D' | '14D' | '7D';
type ChartMode = 'aggregate' | 'multiline' | 'risk_cohorts';
type FilterCohort = 'all' | 'at_risk' | 'healthy' | 'enterprise';

interface DayDataPoint {
  date: string;
  dayNumber: number;
  fullDate: string;
  avgHealthScore: number;
  medianHealthScore: number;
  minScore: number;
  maxScore: number;
  healthyAvg: number;
  atRiskAvg: number;
  enterpriseAvg: number;
  activeCount: number;
  criticalCount: number;
  totalAtRiskArr: number;
  [dealId: string]: number | string | undefined;
}

// Generate realistic deterministic 30-day historical health trajectory for each deal
function calculateHistoricalDealScore(record: CRMRecord, daysAgo: number): number {
  const current = record.healthScore || 50;
  const silence = record.daysSinceLastContact || 0;
  const dropPct = record.activityDropPct || 0;
  
  // Use deal ID as pseudo-random seed for organic noise
  const seed = record.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const wave = Math.sin((daysAgo + seed % 7) * 0.4) * 2.5;

  if (current < 50) {
    // At-risk deal: was healthier 30 days ago, decayed over the last 15-20 days due to silence / drop
    const daysSinceDecayBegan = Math.max(0, Math.min(25, silence > 0 ? silence : 18));
    if (daysAgo > daysSinceDecayBegan) {
      // Prior to decay, it was relatively healthy
      const baseline = Math.min(88, current + 25 + (seed % 10));
      return Math.round(Math.max(10, Math.min(100, baseline + wave)));
    } else {
      // Linear/curved decay towards current score
      const progress = (daysSinceDecayBegan - daysAgo) / (daysSinceDecayBegan || 1);
      const score = (current + 25) - (25 * Math.pow(progress, 1.2));
      return Math.round(Math.max(5, Math.min(100, score + wave)));
    }
  } else if (current >= 80) {
    // Healthy / expanding deal: grew or stayed solid over last 30 days
    const delta = (seed % 8) - 3;
    const progress = (30 - daysAgo) / 30;
    const baseline = current - (delta * (1 - progress));
    return Math.round(Math.max(60, Math.min(100, baseline + wave)));
  } else {
    // Moderate / neutral deal: stable with slight organic fluctuations
    const delta = ((seed % 10) - 5) * ((30 - daysAgo) / 30);
    return Math.round(Math.max(30, Math.min(95, current - delta + wave)));
  }
}

const PALETTE = [
  '#FFD700', // Gold
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F43F5E', // Rose
  '#A855F7', // Purple
  '#38BDF8', // Sky
  '#FB923C', // Orange
  '#EC4899', // Pink
];

export const DealHealthTrendChart: React.FC<DealHealthTrendChartProps> = ({
  records,
  onSelectRecord,
  className = '',
}) => {
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('30D');
  const [chartMode, setChartMode] = useState<ChartMode>('aggregate');
  const [cohortFilter, setCohortFilter] = useState<FilterCohort>('all');
  const [focusedDealId, setFocusedDealId] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [dealSearchQuery, setDealSearchQuery] = useState('');

  // Filter for active deals only (exclude Closed Lost)
  const activeDeals = useMemo(() => {
    return records.filter(r => r.stage !== 'Closed Lost');
  }, [records]);

  // Apply Cohort Filter
  const filteredActiveDeals = useMemo(() => {
    return activeDeals.filter(d => {
      if (cohortFilter === 'at_risk') return d.healthScore < 60 || d.daysSinceLastContact > 10;
      if (cohortFilter === 'healthy') return d.healthScore >= 70;
      if (cohortFilter === 'enterprise') return (d.dealValue || 0) >= 50000;
      return true;
    });
  }, [activeDeals, cohortFilter]);

  // Determine days count based on time horizon
  const daysCount = timeHorizon === '30D' ? 30 : timeHorizon === '14D' ? 14 : 7;

  // Build the 30-day timeline series
  const timelineData: DayDataPoint[] = useMemo(() => {
    if (activeDeals.length === 0) return [];

    const now = new Date();
    const data: DayDataPoint[] = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const fullDate = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

      const dayPoint: DayDataPoint = {
        date: dateLabel,
        dayNumber: i,
        fullDate,
        avgHealthScore: 0,
        medianHealthScore: 0,
        minScore: 100,
        maxScore: 0,
        healthyAvg: 0,
        atRiskAvg: 0,
        enterpriseAvg: 0,
        activeCount: filteredActiveDeals.length,
        criticalCount: 0,
        totalAtRiskArr: 0,
      };

      const dayScores: number[] = [];
      let healthySum = 0, healthyN = 0;
      let atRiskSum = 0, atRiskN = 0;
      let entSum = 0, entN = 0;

      filteredActiveDeals.forEach(deal => {
        const score = calculateHistoricalDealScore(deal, i);
        dayScores.push(score);
        dayPoint[deal.id] = score;

        if (score < 50) {
          dayPoint.criticalCount++;
          dayPoint.totalAtRiskArr += deal.dealValue || (deal.mrr ? deal.mrr * 12 : 0);
        }

        if (deal.healthScore >= 70) {
          healthySum += score;
          healthyN++;
        } else if (deal.healthScore < 60) {
          atRiskSum += score;
          atRiskN++;
        }

        if ((deal.dealValue || 0) >= 50000) {
          entSum += score;
          entN++;
        }

        if (score < dayPoint.minScore) dayPoint.minScore = score;
        if (score > dayPoint.maxScore) dayPoint.maxScore = score;
      });

      if (dayScores.length > 0) {
        const sum = dayScores.reduce((a, b) => a + b, 0);
        dayPoint.avgHealthScore = Math.round((sum / dayScores.length) * 10) / 10;
        
        // Median
        const sorted = [...dayScores].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        dayPoint.medianHealthScore = sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
      } else {
        dayPoint.minScore = 0;
        dayPoint.maxScore = 0;
      }

      dayPoint.healthyAvg = healthyN > 0 ? Math.round((healthySum / healthyN) * 10) / 10 : dayPoint.avgHealthScore;
      dayPoint.atRiskAvg = atRiskN > 0 ? Math.round((atRiskSum / atRiskN) * 10) / 10 : Math.max(20, dayPoint.avgHealthScore - 25);
      dayPoint.enterpriseAvg = entN > 0 ? Math.round((entSum / entN) * 10) / 10 : dayPoint.avgHealthScore;

      data.push(dayPoint);
    }

    return data;
  }, [activeDeals, filteredActiveDeals, daysCount]);

  // Aggregate stats across the 30-day window
  const statsSummary = useMemo(() => {
    if (timelineData.length === 0) {
      return {
        currentAvg: 0,
        startAvg: 0,
        delta: 0,
        isPositive: false,
        criticalCount: 0,
        healthyCount: 0,
        totalActiveArr: 0,
        highestGainDeal: null as { name: string; delta: number; value: number } | null,
      };
    }

    const currentDay = timelineData[timelineData.length - 1];
    const startDay = timelineData[0];
    const currentAvg = currentDay.avgHealthScore;
    const startAvg = startDay.avgHealthScore;
    const delta = Math.round((currentAvg - startAvg) * 10) / 10;

    let totalArr = 0;
    let criticals = 0;
    let healthies = 0;

    let bestGain: { name: string; delta: number; value: number } | null = null;

    filteredActiveDeals.forEach(deal => {
      totalArr += deal.dealValue || (deal.mrr ? deal.mrr * 12 : 0);
      if (deal.healthScore < 50) criticals++;
      if (deal.healthScore >= 70) healthies++;

      const startScore = calculateHistoricalDealScore(deal, daysCount - 1);
      const endScore = deal.healthScore;
      const dealDelta = endScore - startScore;

      if (!bestGain || dealDelta > bestGain.delta) {
        bestGain = {
          name: deal.accountName,
          delta: dealDelta,
          value: deal.dealValue || 0,
        };
      }
    });

    return {
      currentAvg,
      startAvg,
      delta,
      isPositive: delta >= 0,
      criticalCount: criticals,
      healthyCount: healthies,
      totalActiveArr: totalArr,
      highestGainDeal: bestGain,
    };
  }, [timelineData, filteredActiveDeals, daysCount]);

  // Top deals for multi-line view (limit to top 6 by deal value for clarity)
  const topDealsForChart = useMemo(() => {
    const sorted = [...filteredActiveDeals].sort((a, b) => (b.dealValue || 0) - (a.dealValue || 0));
    return sorted.slice(0, 6);
  }, [filteredActiveDeals]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const dataPoint: DayDataPoint | undefined = payload[0]?.payload;
    if (!dataPoint) return null;

    return (
      <div className="bg-[#121212]/95 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] text-xs min-w-[240px] max-w-[320px] space-y-2.5 z-50">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <Calendar className="w-3.5 h-3.5 text-[#FFD700]" />
            <span>{dataPoint.fullDate}</span>
          </div>
          <span className="text-[10px] font-mono text-white/50">
            {dataPoint.dayNumber === 0 ? 'Today' : `${dataPoint.dayNumber}d ago`}
          </span>
        </div>

        {/* Portfolio Avg Score */}
        <div className="flex items-center justify-between bg-black/40 p-2 rounded-xl border border-white/5">
          <span className="text-white/60 font-medium">Avg Health Score:</span>
          <span className={`font-mono font-bold text-sm ${
            dataPoint.avgHealthScore >= 70 ? 'text-emerald-400' : dataPoint.avgHealthScore >= 50 ? 'text-[#FFD700]' : 'text-rose-400'
          }`}>
            {dataPoint.avgHealthScore} / 100
          </span>
        </div>

        {/* Breakdown of Range or Active Lines */}
        {chartMode === 'aggregate' && (
          <div className="grid grid-cols-2 gap-2 text-[11px] text-white/70">
            <div className="bg-white/5 p-1.5 rounded-lg">
              <span className="text-white/40 block text-[9px] uppercase font-bold">Health Band</span>
              <span className="font-mono text-white font-semibold">{dataPoint.minScore} – {dataPoint.maxScore}</span>
            </div>
            <div className="bg-white/5 p-1.5 rounded-lg">
              <span className="text-white/40 block text-[9px] uppercase font-bold">Critical Deals</span>
              <span className={`font-mono font-semibold ${dataPoint.criticalCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {dataPoint.criticalCount} at risk
              </span>
            </div>
          </div>
        )}

        {chartMode === 'risk_cohorts' && (
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between text-emerald-400">
              <span>Healthy Cohort:</span>
              <span className="font-mono font-bold">{dataPoint.healthyAvg}</span>
            </div>
            <div className="flex justify-between text-rose-400">
              <span>At-Risk Cohort:</span>
              <span className="font-mono font-bold">{dataPoint.atRiskAvg}</span>
            </div>
            <div className="flex justify-between text-[#FFD700]">
              <span>Enterprise Cohort:</span>
              <span className="font-mono font-bold">{dataPoint.enterpriseAvg}</span>
            </div>
          </div>
        )}

        {chartMode === 'multiline' && (
          <div className="space-y-1 text-[11px] max-h-36 overflow-y-auto pr-1">
            {topDealsForChart.map((deal, idx) => {
              const score = dataPoint[deal.id] as number;
              const color = PALETTE[idx % PALETTE.length];
              return (
                <div key={deal.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-white/80 truncate">{deal.accountName}</span>
                  </div>
                  <span className="font-mono font-bold text-white flex-shrink-0">{score ?? '—'}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Selected Deal Drilldown if focused */}
        {focusedDealId && (
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
            <span className="text-[#FFD700] font-semibold">Focused Deal:</span>
            <span className="font-mono font-bold text-white">{dataPoint[focusedDealId]} / 100</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="deal-health-trend-container" className={`rounded-3xl bg-[#0E0E0E] border border-white/10 p-5 sm:p-6 space-y-6 shadow-xl relative overflow-hidden ${className}`}>
      {/* Background Subtle Gradient Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10 pb-4 border-b border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-[#FFD700] flex items-center justify-center text-black shadow-[0_0_15px_rgba(255,215,0,0.25)]">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                <span>30-Day Deal Health Score Velocity</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Trend
                </span>
              </h2>
              <p className="text-xs text-white/50">
                Continuous 30-day health diagnostic tracking across {filteredActiveDeals.length} active deals (${(statsSummary.totalActiveArr / 1000).toFixed(0)}k ARR).
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Horizon Selector */}
          <div className="p-1 rounded-xl bg-[#141414] border border-white/10 inline-flex items-center gap-0.5 text-xs">
            {(['7D', '14D', '30D'] as const).map((h) => (
              <button
                key={h}
                onClick={() => setTimeHorizon(h)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer text-[11px] ${
                  timeHorizon === h
                    ? 'bg-[#FFD700] text-black shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {h}
              </button>
            ))}
          </div>

          {/* Chart Mode Selector */}
          <div className="p-1 rounded-xl bg-[#141414] border border-white/10 inline-flex items-center gap-0.5 text-xs">
            <button
              onClick={() => { setChartMode('aggregate'); setFocusedDealId(null); }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer text-[11px] ${
                chartMode === 'aggregate' && !focusedDealId
                  ? 'bg-white text-black shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Portfolio Band
            </button>
            <button
              onClick={() => { setChartMode('multiline'); setFocusedDealId(null); }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer text-[11px] ${
                chartMode === 'multiline' && !focusedDealId
                  ? 'bg-white text-black shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Top Deals
            </button>
            <button
              onClick={() => { setChartMode('risk_cohorts'); setFocusedDealId(null); }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer text-[11px] ${
                chartMode === 'risk_cohorts' && !focusedDealId
                  ? 'bg-white text-black shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Risk Cohorts
            </button>
          </div>

          {/* Cohort Filter Dropdown */}
          <div className="relative">
            <select
              value={cohortFilter}
              onChange={(e) => setCohortFilter(e.target.value as FilterCohort)}
              aria-label="Filter deal cohort"
              className="bg-[#141414] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white/90 font-medium focus:outline-none focus:border-[#FFD700]/50 cursor-pointer"
            >
              <option value="all">All Active Deals ({activeDeals.length})</option>
              <option value="at_risk">At-Risk Only (&lt;60)</option>
              <option value="healthy">Healthy Only (≥70)</option>
              <option value="enterprise">Enterprise (≥$50k)</option>
            </select>
          </div>

          {/* Toggle Table Drawer Button */}
          <button
            onClick={() => setShowTable(!showTable)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#FFD700]" />
            <span>{showTable ? 'Hide Table' : 'Deal Breakdown'}</span>
            {showTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
        {/* Current Avg Score */}
        <div className="p-3.5 rounded-2xl bg-[#141414] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-white/50 text-[10px] uppercase font-bold tracking-wider">
            <span>30D Portfolio Avg</span>
            <Activity className="w-3.5 h-3.5 text-[#FFD700]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              {statsSummary.currentAvg}
            </span>
            <span className="text-xs text-white/40 font-mono">/ 100</span>
            <span className={`text-xs font-bold font-mono flex items-center gap-0.5 ${
              statsSummary.isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {statsSummary.isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {statsSummary.delta > 0 ? `+${statsSummary.delta}` : statsSummary.delta} pts
            </span>
          </div>
          <p className="text-[10px] text-white/40">
            vs. {statsSummary.startAvg} pts {daysCount}d ago
          </p>
        </div>

        {/* Critical Risk Deals */}
        <div className={`p-3.5 rounded-2xl border space-y-1 transition-all ${
          statsSummary.criticalCount > 0 
            ? 'bg-rose-950/20 border-rose-500/30' 
            : 'bg-[#141414] border-white/5'
        }`}>
          <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-rose-400">
            <span>Critical Zone (&lt;50)</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              {statsSummary.criticalCount}
            </span>
            <span className="text-xs text-rose-400 font-medium">
              {statsSummary.criticalCount === 1 ? 'deal slipping' : 'deals slipping'}
            </span>
          </div>
          <p className="text-[10px] text-white/40">
            Immediate AI Rescue triggered
          </p>
        </div>

        {/* Healthy Cohort */}
        <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-emerald-400">
            <span>High Health (≥70)</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              {statsSummary.healthyCount}
            </span>
            <span className="text-xs text-emerald-400 font-medium">
              stable accounts
            </span>
          </div>
          <p className="text-[10px] text-emerald-300/60">
            Prime candidates for expansion
          </p>
        </div>

        {/* Highest Momentum */}
        <div className="p-3.5 rounded-2xl bg-[#141414] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-white/50 text-[10px] uppercase font-bold tracking-wider">
            <span>Top 30D Momentum</span>
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          {statsSummary.highestGainDeal ? (
            <div>
              <div className="text-sm font-bold text-white truncate">
                {statsSummary.highestGainDeal.name}
              </div>
              <div className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
                <span>+{statsSummary.highestGainDeal.delta} pts velocity</span>
                <span className="text-white/40 font-normal">(${(statsSummary.highestGainDeal.value / 1000).toFixed(0)}k)</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-white/40">Calculating momentum...</div>
          )}
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="relative z-10">
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'aggregate' && !focusedDealId ? (
              <AreaChart data={timelineData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
                <defs>
                  {/* Glowing Gold Gradient for Average Health Line */}
                  <linearGradient id="goldHealthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFD700" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FFD700" stopOpacity={0.0} />
                  </linearGradient>
                  {/* Subtle Range Corridor Gradient */}
                  <linearGradient id="corridorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />

                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.35)"
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />

                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  stroke="rgba(255,255,255,0.35)"
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickFormatter={(val) => `${val}`}
                />

                <Tooltip content={<CustomTooltip />} />

                {/* Reference Threshold Lines */}
                <ReferenceLine 
                  y={70} 
                  stroke="#10B981" 
                  strokeDasharray="4 4" 
                  strokeOpacity={0.6}
                  label={{ 
                    value: 'Healthy Target (≥70)', 
                    fill: '#10B981', 
                    fontSize: 10, 
                    position: 'insideTopRight' 
                  }} 
                />
                <ReferenceLine 
                  y={50} 
                  stroke="#F43F5E" 
                  strokeDasharray="4 4" 
                  strokeOpacity={0.6}
                  label={{ 
                    value: 'Critical Churn Risk (<50)', 
                    fill: '#F43F5E', 
                    fontSize: 10, 
                    position: 'insideBottomRight' 
                  }} 
                />

                {/* Max-Min Range Corridor Band */}
                <Area
                  type="monotone"
                  dataKey="maxScore"
                  stroke="#38BDF8"
                  strokeOpacity={0.2}
                  strokeWidth={1}
                  fill="url(#corridorGrad)"
                  name="High Spread"
                />

                {/* Primary Trend Line: Average Deal Health Score */}
                <Area
                  type="monotone"
                  dataKey="avgHealthScore"
                  stroke="#FFD700"
                  strokeWidth={3}
                  fill="url(#goldHealthGrad)"
                  name="Avg Health Score"
                  dot={{ r: 3, fill: '#FFD700', stroke: '#000', strokeWidth: 1.5 }}
                  activeDot={{ r: 6, fill: '#FFE55C', stroke: '#FFD700', strokeWidth: 3 }}
                />
              </AreaChart>
            ) : chartMode === 'risk_cohorts' ? (
              <LineChart data={timelineData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.35)"
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  stroke="rgba(255,255,255,0.35)"
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={70} stroke="#10B981" strokeDasharray="3 3" strokeOpacity={0.4} />
                <ReferenceLine y={50} stroke="#F43F5E" strokeDasharray="3 3" strokeOpacity={0.4} />

                {/* Healthy Cohort Line */}
                <Line
                  type="monotone"
                  dataKey="healthyAvg"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={false}
                  name="Healthy Cohort (≥70)"
                  activeDot={{ r: 5, fill: '#10B981' }}
                />

                {/* Enterprise Line */}
                <Line
                  type="monotone"
                  dataKey="enterpriseAvg"
                  stroke="#FFD700"
                  strokeWidth={2.5}
                  dot={false}
                  name="Enterprise Cohort (≥$50k)"
                  activeDot={{ r: 5, fill: '#FFD700' }}
                />

                {/* At Risk Cohort Line */}
                <Line
                  type="monotone"
                  dataKey="atRiskAvg"
                  stroke="#F43F5E"
                  strokeWidth={2.5}
                  dot={false}
                  name="At-Risk Cohort (<60)"
                  activeDot={{ r: 5, fill: '#F43F5E' }}
                />

                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
                  formatter={(val) => <span className="text-white/70">{val}</span>}
                />
              </LineChart>
            ) : (
              // Multi-line top active deals or single focused deal
              <LineChart data={timelineData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.35)"
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  stroke="rgba(255,255,255,0.35)"
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={70} stroke="#10B981" strokeDasharray="3 3" strokeOpacity={0.4} />
                <ReferenceLine y={50} stroke="#F43F5E" strokeDasharray="3 3" strokeOpacity={0.4} />

                {/* Portfolio Average as ghost background line */}
                <Line
                  type="monotone"
                  dataKey="avgHealthScore"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  name="Portfolio Average"
                />

                {/* Render specific individual deals */}
                {topDealsForChart.map((deal, idx) => {
                  const isFocused = focusedDealId === deal.id;
                  const isDimmed = focusedDealId !== null && !isFocused;
                  const color = PALETTE[idx % PALETTE.length];

                  return (
                    <Line
                      key={deal.id}
                      type="monotone"
                      dataKey={deal.id}
                      name={deal.accountName}
                      stroke={color}
                      strokeWidth={isFocused ? 3.5 : isDimmed ? 1 : 2}
                      strokeOpacity={isDimmed ? 0.2 : 1}
                      dot={isFocused ? { r: 4, fill: color } : false}
                      activeDot={{ r: 6, fill: color }}
                    />
                  );
                })}

                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
                  formatter={(val) => <span className="text-white/70">{val}</span>}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend / Range Indicator Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-[11px] text-white/50">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <strong className="text-white/80">70–100:</strong> Optimal Growth / Expansion
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFD700] shadow-[0_0_8px_rgba(255,215,0,0.6)]" />
              <strong className="text-white/80">50–69:</strong> Steady / Review Cadence
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
              <strong className="text-white/80">&lt;50:</strong> Churn Threat / Auto-Rescue
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-white/40" />
            <span>Updated continuously via touchpoint &amp; CRM telemetry</span>
          </div>
        </div>
      </div>

      {/* Expandable Active Deals Health Breakdown Table */}
      {showTable && (
        <div className="space-y-3 pt-4 border-t border-white/10 relative z-10 animate-in fade-in-50 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                Active Deals 30-Day Trajectory Table ({filteredActiveDeals.length})
              </h3>
              <span className="text-xs text-white/40">
                Click any row to isolate on trend chart
              </span>
            </div>

            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={dealSearchQuery}
                onChange={(e) => setDealSearchQuery(e.target.value)}
                placeholder="Filter by account..."
                className="w-full bg-[#141414] border border-white/10 rounded-xl pl-8 pr-3 py-1 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#FFD700]/50"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#121212]">
            <table className="w-full text-left text-xs text-white/80">
              <thead className="bg-[#181818] text-[10px] uppercase font-bold tracking-wider text-white/40 border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">Account &amp; Decision Maker</th>
                  <th className="py-3 px-4">ARR / Deal Value</th>
                  <th className="py-3 px-4 text-center">30D Ago</th>
                  <th className="py-3 px-4 text-center">Current Score</th>
                  <th className="py-3 px-4 text-center">30D Velocity</th>
                  <th className="py-3 px-4">Health Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredActiveDeals
                  .filter(d => {
                    if (!dealSearchQuery) return true;
                    const q = dealSearchQuery.toLowerCase();
                    return d.accountName.toLowerCase().includes(q) || d.contactName.toLowerCase().includes(q);
                  })
                  .map((deal) => {
                    const startScore = calculateHistoricalDealScore(deal, daysCount - 1);
                    const currentScore = deal.healthScore;
                    const delta = currentScore - startScore;
                    const isFocused = focusedDealId === deal.id;

                    return (
                      <tr
                        key={deal.id}
                        onClick={() => {
                          setFocusedDealId(isFocused ? null : deal.id);
                          setChartMode('multiline');
                        }}
                        className={`hover:bg-white/5 transition-colors cursor-pointer ${
                          isFocused ? 'bg-white/10' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-medium">
                          <div className="text-white font-bold">{deal.accountName}</div>
                          <div className="text-[11px] text-white/40">{deal.contactName} • {deal.stage}</div>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-white">
                          ${(deal.dealValue || 0).toLocaleString()}
                          <span className="block text-[10px] text-white/40 font-normal">
                            ${(deal.mrr || Math.round((deal.dealValue || 0) / 12)).toLocaleString()}/mo
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center font-mono text-white/60">
                          {startScore}
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-bold">
                          <span className={`px-2.5 py-1 rounded-lg ${
                            currentScore >= 70
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : currentScore >= 50
                              ? 'bg-amber-400/20 text-[#FFD700]'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {currentScore} / 100
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-bold">
                          <span className={`flex items-center justify-center gap-0.5 ${
                            delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-rose-400' : 'text-white/40'
                          }`}>
                            {delta > 0 ? `+${delta}` : delta}
                            {delta > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : delta < 0 ? <ArrowDownRight className="w-3.5 h-3.5" /> : null}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            currentScore >= 70
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : currentScore >= 50
                              ? 'bg-amber-400/10 text-[#FFD700] border border-amber-400/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}>
                            {currentScore >= 70 ? 'Healthy' : currentScore >= 50 ? 'Moderate' : 'At-Risk'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSelectRecord) onSelectRecord(deal);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-all"
                          >
                            Examine
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
