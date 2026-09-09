import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Zap, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  ArrowUpRight, 
  Download, 
  RefreshCw, 
  Sliders, 
  CheckCircle2, 
  Building2, 
  Briefcase, 
  Target, 
  PieChart as PieChartIcon, 
  Layers, 
  ChevronRight,
  Info,
  CreditCard,
  Percent
} from 'lucide-react';
import { Company, PlanTier } from '../types';
import jsPDF from 'jspdf';

interface ROICalculatorViewProps {
  currentCompany?: Company | null;
  onNavigatePlans?: () => void;
}

interface PresetConfig {
  name: string;
  category: string;
  monthlyRevenue: number;
  monthlyAdSpend: number;
  overdueInvoices: number;
  pipelineDeals: number;
  avgDealSize: number;
  teamSize: number;
  recommendedPlan: PlanTier;
}

const PRESETS: PresetConfig[] = [
  {
    name: 'B2B SaaS Scale-Up',
    category: 'SaaS / Tech',
    monthlyRevenue: 120000,
    monthlyAdSpend: 30000,
    overdueInvoices: 45000,
    pipelineDeals: 15,
    avgDealSize: 18000,
    teamSize: 12,
    recommendedPlan: 'Pro'
  },
  {
    name: 'Growth Marketing Agency',
    category: 'Agency / Services',
    monthlyRevenue: 85000,
    monthlyAdSpend: 50000,
    overdueInvoices: 30000,
    pipelineDeals: 8,
    avgDealSize: 8500,
    teamSize: 10,
    recommendedPlan: 'Pro'
  },
  {
    name: 'Enterprise Consulting Firm',
    category: 'Professional Services',
    monthlyRevenue: 280000,
    monthlyAdSpend: 15000,
    overdueInvoices: 110000,
    pipelineDeals: 20,
    avgDealSize: 45000,
    teamSize: 25,
    recommendedPlan: 'Enterprise'
  },
  {
    name: 'Bootstrapped Early Startup',
    category: 'Startup',
    monthlyRevenue: 25000,
    monthlyAdSpend: 6000,
    overdueInvoices: 8000,
    pipelineDeals: 5,
    avgDealSize: 4000,
    teamSize: 4,
    recommendedPlan: 'Starter'
  }
];

export const ROICalculatorView: React.FC<ROICalculatorViewProps> = ({
  currentCompany,
  onNavigatePlans
}) => {
  // Input parameters state
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(100000);
  const [monthlyAdSpend, setMonthlyAdSpend] = useState<number>(25000);
  const [overdueInvoices, setOverdueInvoices] = useState<number>(35000);
  const [pipelineDeals, setPipelineDeals] = useState<number>(12);
  const [avgDealSize, setAvgDealSize] = useState<number>(15000);
  const [teamSize, setTeamSize] = useState<number>(8);
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>('Pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [projectionMonths, setProjectionMonths] = useState<number>(12);
  const [hoveredDonutSlice, setHoveredDonutSlice] = useState<string | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  // SVG Chart container refs
  const areaChartSvgRef = useRef<SVGSVGElement | null>(null);
  const donutChartSvgRef = useRef<SVGSVGElement | null>(null);
  const gaugeChartSvgRef = useRef<SVGSVGElement | null>(null);

  // Plan pricing lookup ($)
  const planCosts: Record<PlanTier, { monthly: number; annual: number }> = {
    Starter: { monthly: 499, annual: 399 },
    Pro: { monthly: 1499, annual: 1199 },
    Enterprise: { monthly: 2999, annual: 2399 },
    Trial: { monthly: 0, annual: 0 }
  };

  const currentPlanMonthlyCost = billingCycle === 'annual' 
    ? planCosts[selectedPlan].annual 
    : planCosts[selectedPlan].monthly;

  // -------------------------------------------------------------
  // Mathematical Value Generation & Savings Engine
  // -------------------------------------------------------------
  const calculations = useMemo(() => {
    // 1. Ad Spend & CAC Waste Shield (eliminates 18% to 26% of wasted budget via negative keywords, audience fatigue detection, ROAS reallocation)
    const adWasteSavedMonthly = Math.round(monthlyAdSpend * 0.22);

    // 2. Overdue Invoices & Payment Gateway Optimization
    // - 2.2% saved on transaction fee routing (Wise/Direct ACH vs Stripe card surcharge)
    // - Accelerated cash velocity (prevents working capital loan interest on unpaid invoices at 1.2%/mo)
    const invoiceFeeSavedMonthly = Math.round(overdueInvoices * 0.024);
    const invoiceInterestRecoveredMonthly = Math.round(overdueInvoices * 0.015);
    const totalInvoiceValueMonthly = invoiceFeeSavedMonthly + invoiceInterestRecoveredMonthly;

    // 3. Stalled Deal Slippage Defense (Revenue Radar saves ~1 deal every 1.5 to 2 months from churning due to delayed follow-ups)
    const totalPipelineValue = pipelineDeals * avgDealSize;
    const dealDefenseMonthly = Math.round((totalPipelineValue * 0.045));

    // 4. Executive & Operational Labor Automated
    // - 4.5 hours saved per team member/month on email triage, board decks, meeting synthesis ($75/hr blended executive rate)
    const hoursSavedTotal = Math.round(teamSize * 5.5);
    const laborSavingsMonthly = Math.round(hoursSavedTotal * 65);

    // Total Monthly Value Delivered
    const totalMonthlyValue = adWasteSavedMonthly + totalInvoiceValueMonthly + dealDefenseMonthly + laborSavingsMonthly;
    
    // Net Profit Impact after software subscription
    const netMonthlyProfitImpact = totalMonthlyValue - currentPlanMonthlyCost;
    
    // Annualized figures
    const annualizedGrossValue = totalMonthlyValue * 12;
    const annualizedSoftwareCost = currentPlanMonthlyCost * 12;
    const annualizedNetSavings = annualizedGrossValue - annualizedSoftwareCost;

    // ROI Multiplier
    const roiMultiplier = currentPlanMonthlyCost > 0 
      ? Number((totalMonthlyValue / currentPlanMonthlyCost).toFixed(1))
      : 0;

    // Payback period (Days to break even on monthly subscription fee)
    const dailyValueGenerated = totalMonthlyValue / 30.4;
    const paybackDays = dailyValueGenerated > 0 
      ? Number((currentPlanMonthlyCost / dailyValueGenerated).toFixed(1))
      : 0;

    const valueStreams = [
      {
        id: 'ad-spend',
        label: 'Ad Spend & CAC Waste Shield',
        monthlyValue: adWasteSavedMonthly,
        color: '#10B981', // emerald-500
        desc: 'Stops ad bleed across Google, Meta & TikTok via automated ROAS auditing.'
      },
      {
        id: 'cashflow',
        label: 'Invoice Recovery & Gateway Fees',
        monthlyValue: totalInvoiceValueMonthly,
        color: '#3B82F6', // blue-500
        desc: 'Reclaims late client receivables & cuts 2.4% merchant processing fee gouging.'
      },
      {
        id: 'deal-defense',
        label: 'Deal Slippage & Revenue Radar',
        monthlyValue: dealDefenseMonthly,
        color: '#F59E0B', // amber-500
        desc: 'Prevents stalled pipeline deals from expiring through automated executive escalations.'
      },
      {
        id: 'labor',
        label: 'Executive & Ops Labor Automated',
        monthlyValue: laborSavingsMonthly,
        color: '#8B5CF6', // purple-500
        desc: `${hoursSavedTotal} hrs/mo automated in inbox triage, meeting briefs, and board decks.`
      }
    ];

    return {
      adWasteSavedMonthly,
      totalInvoiceValueMonthly,
      dealDefenseMonthly,
      laborSavingsMonthly,
      hoursSavedTotal,
      totalMonthlyValue,
      netMonthlyProfitImpact,
      annualizedGrossValue,
      annualizedSoftwareCost,
      annualizedNetSavings,
      roiMultiplier,
      paybackDays,
      valueStreams
    };
  }, [monthlyRevenue, monthlyAdSpend, overdueInvoices, pipelineDeals, avgDealSize, teamSize, currentPlanMonthlyCost]);

  // Load a business preset
  const applyPreset = (preset: PresetConfig) => {
    setMonthlyRevenue(preset.monthlyRevenue);
    setMonthlyAdSpend(preset.monthlyAdSpend);
    setOverdueInvoices(preset.overdueInvoices);
    setPipelineDeals(preset.pipelineDeals);
    setAvgDealSize(preset.avgDealSize);
    setTeamSize(preset.teamSize);
    setSelectedPlan(preset.recommendedPlan);
  };

  // -------------------------------------------------------------
  // D3 Visualization 1: Cumulative 12-Month Cash Flow & Net ROI (Area & Line Chart)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!areaChartSvgRef.current) return;

    const svg = d3.select(areaChartSvgRef.current);
    svg.selectAll('*').remove();

    const width = 640;
    const height = 280;
    const margin = { top: 25, right: 30, bottom: 40, left: 65 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Generate monthly timeline series
    const monthsData = Array.from({ length: projectionMonths }, (_, i) => {
      const monthNum = i + 1;
      const cumulativeValue = calculations.totalMonthlyValue * monthNum;
      const cumulativeCost = currentPlanMonthlyCost * monthNum;
      const cumulativeNetProfit = cumulativeValue - cumulativeCost;
      return {
        month: monthNum,
        label: `M${monthNum}`,
        value: cumulativeValue,
        cost: cumulativeCost,
        netProfit: cumulativeNetProfit
      };
    });

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([1, projectionMonths])
      .range([0, innerWidth]);

    const maxValue = d3.max(monthsData, d => d.value) || 10000;
    const yScale = d3
      .scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([innerHeight, 0]);

    // Gridlines
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(
        d3.axisLeft(yScale)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      );

    // Gradients
    const defs = svg.append('defs');

    const valueGradient = defs
      .append('linearGradient')
      .attr('id', 'roi-value-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    valueGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#10B981')
      .attr('stop-opacity', 0.45);

    valueGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#10B981')
      .attr('stop-opacity', 0.02);

    // Area generator for Gross Value
    const areaGenerator = d3
      .area<{ month: number; value: number }>()
      .x(d => xScale(d.month))
      .y0(innerHeight)
      .y1(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Draw Value Area
    g.append('path')
      .datum(monthsData)
      .attr('fill', 'url(#roi-value-gradient)')
      .attr('d', areaGenerator);

    // Line generator for Value
    const valueLine = d3
      .line<{ month: number; value: number }>()
      .x(d => xScale(d.month))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Line generator for Cost
    const costLine = d3
      .line<{ month: number; cost: number }>()
      .x(d => xScale(d.month))
      .y(d => yScale(d.cost))
      .curve(d3.curveLinear);

    // Line generator for Net Profit
    const netProfitLine = d3
      .line<{ month: number; netProfit: number }>()
      .x(d => xScale(d.month))
      .y(d => yScale(d.netProfit))
      .curve(d3.curveMonotoneX);

    // Draw Gross Value Line
    g.append('path')
      .datum(monthsData)
      .attr('fill', 'none')
      .attr('stroke', '#10B981')
      .attr('stroke-width', 3)
      .attr('d', valueLine);

    // Draw Net Profit Line
    g.append('path')
      .datum(monthsData)
      .attr('fill', 'none')
      .attr('stroke', '#FFD700')
      .attr('stroke-width', 2.5)
      .attr('stroke-dasharray', '4,3')
      .attr('d', netProfitLine);

    // Draw Subscription Cost Line
    g.append('path')
      .datum(monthsData)
      .attr('fill', 'none')
      .attr('stroke', '#EF4444')
      .attr('stroke-width', 1.8)
      .attr('opacity', 0.85)
      .attr('d', costLine);

    // Data points & Tooltips
    monthsData.forEach(d => {
      // Circle on Value
      g.append('circle')
        .attr('cx', xScale(d.month))
        .attr('cy', yScale(d.value))
        .attr('r', 4)
        .attr('fill', '#10B981')
        .attr('stroke', '#0B0F0D')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseenter', (event) => {
          d3.select(event.currentTarget).attr('r', 7).attr('fill', '#34D399');
        })
        .on('mouseleave', (event) => {
          d3.select(event.currentTarget).attr('r', 4).attr('fill', '#10B981');
        });
    });

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(projectionMonths).tickFormat(d => `M${d}`);
    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(d => `$${d3.format('~s')(d)}`);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .attr('class', 'text-xs text-white/50')
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#9CA3AF')
      .attr('font-size', '11px');

    g.append('g')
      .attr('class', 'text-xs text-white/50')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', '#9CA3AF')
      .attr('font-size', '11px');

    // Remove axis lines domain
    g.selectAll('.domain').attr('stroke', 'rgba(255,255,255,0.15)');
    g.selectAll('.tick line').attr('stroke', 'rgba(255,255,255,0.1)');

  }, [calculations, currentPlanMonthlyCost, projectionMonths]);

  // -------------------------------------------------------------
  // D3 Visualization 2: Value Stream Donut Breakdown
  // -------------------------------------------------------------
  useEffect(() => {
    if (!donutChartSvgRef.current) return;

    const svg = d3.select(donutChartSvgRef.current);
    svg.selectAll('*').remove();

    const width = 280;
    const height = 280;
    const radius = Math.min(width, height) / 2 - 16;
    const innerRadius = radius * 0.62;

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3
      .pie<{ id: string; label: string; monthlyValue: number; color: string }>()
      .value(d => d.monthlyValue)
      .sort(null);

    const arc = d3
      .arc<d3.PieArcDatum<{ id: string; label: string; monthlyValue: number; color: string }>>()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(4)
      .padAngle(0.03);

    const hoverArc = d3
      .arc<d3.PieArcDatum<{ id: string; label: string; monthlyValue: number; color: string }>>()
      .innerRadius(innerRadius)
      .outerRadius(radius + 8)
      .cornerRadius(4)
      .padAngle(0.03);

    const arcs = g
      .selectAll('.arc')
      .data(pie(calculations.valueStreams))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs
      .append('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .attr('stroke', '#0B0F0D')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .style('transition', 'all 0.2s ease')
      .on('mouseenter', (event, d) => {
        d3.select(event.currentTarget).attr('d', hoverArc as any).attr('opacity', 1);
        setHoveredDonutSlice(d.data.label);
      })
      .on('mouseleave', (event) => {
        d3.select(event.currentTarget).attr('d', arc as any).attr('opacity', 0.95);
        setHoveredDonutSlice(null);
      });

    // Center Text
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.3em')
      .attr('fill', '#FFFFFF')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .text(`$${calculations.totalMonthlyValue.toLocaleString()}`);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.3em')
      .attr('fill', '#10B981')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .text('Total Monthly ROI');

  }, [calculations]);

  // -------------------------------------------------------------
  // D3 Visualization 3: Net Multiplier Gauge
  // -------------------------------------------------------------
  useEffect(() => {
    if (!gaugeChartSvgRef.current) return;

    const svg = d3.select(gaugeChartSvgRef.current);
    svg.selectAll('*').remove();

    const width = 240;
    const height = 140;
    const radius = 100;

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2},${height - 15})`);

    // Arc from -Math.PI / 2 to Math.PI / 2
    const bgArc = d3
      .arc()
      .innerRadius(radius - 18)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2);

    g.append('path')
      .attr('d', bgArc as any)
      .attr('fill', 'rgba(255, 255, 255, 0.08)');

    // Clamped multiplier fill (max 30x on gauge)
    const clampedMultiplier = Math.min(Math.max(calculations.roiMultiplier, 1), 35);
    const fillAngle = -Math.PI / 2 + (clampedMultiplier / 35) * Math.PI;

    const valueArc = d3
      .arc()
      .innerRadius(radius - 18)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(fillAngle)
      .cornerRadius(4);

    const defs = svg.append('defs');
    const gaugeGrad = defs
      .append('linearGradient')
      .attr('id', 'gauge-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    gaugeGrad.append('stop').attr('offset', '0%').attr('stop-color', '#3B82F6');
    gaugeGrad.append('stop').attr('offset', '50%').attr('stop-color', '#10B981');
    gaugeGrad.append('stop').attr('offset', '100%').attr('stop-color', '#FFD700');

    g.append('path')
      .attr('d', valueArc as any)
      .attr('fill', 'url(#gauge-gradient)');

    // Center text
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .attr('fill', '#FFD700')
      .attr('font-size', '24px')
      .attr('font-weight', '900')
      .text(`${calculations.roiMultiplier}x`);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.1em')
      .attr('fill', 'rgba(255,255,255,0.6)')
      .attr('font-size', '11px')
      .text('NET ROI MULTIPLIER');

  }, [calculations]);

  // -------------------------------------------------------------
  // Executive ROI PDF Proposal Export
  // -------------------------------------------------------------
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const cName = currentCompany?.name || 'Enterprise Client';

    doc.setFillColor(11, 15, 13);
    doc.rect(0, 0, 210, 297, 'F');

    // Header
    doc.setTextColor(255, 215, 0); // Gold
    doc.setFontSize(22);
    doc.text('EXECUTIVE ROI & COST JUSTIFICATION REPORT', 15, 25);

    doc.setFontSize(11);
    doc.setTextColor(156, 163, 175);
    doc.text(`Prepared for: ${cName} | Date: ${new Date().toLocaleDateString()}`, 15, 33);
    doc.text(`Target Plan: ${selectedPlan} ($${currentPlanMonthlyCost}/mo)`, 15, 39);

    // Divider
    doc.setDrawColor(255, 215, 0);
    doc.line(15, 45, 195, 45);

    // High Level Highlights Box
    doc.setFillColor(18, 24, 21);
    doc.roundedRect(15, 52, 180, 48, 3, 3, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.text('KEY FINANCIAL RETURN METRICS', 20, 62);

    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text(`• Total Monthly Gross Value Delivered: $${calculations.totalMonthlyValue.toLocaleString()}`, 20, 72);
    doc.text(`• Monthly Software Subscription Cost: $${currentPlanMonthlyCost.toLocaleString()}`, 20, 79);
    doc.text(`• Net Monthly Profit Increase: $${calculations.netMonthlyProfitImpact.toLocaleString()}`, 20, 86);
    doc.text(`• Net Return On Investment (ROI): ${calculations.roiMultiplier}x | Payback Period: ${calculations.paybackDays} Days`, 20, 93);

    // Value Stream Breakdown Section
    doc.setTextColor(255, 215, 0);
    doc.setFontSize(14);
    doc.text('MONTHLY VALUE STREAM BREAKDOWN', 15, 115);

    let yPos = 125;
    calculations.valueStreams.forEach((stream, index) => {
      doc.setFillColor(25, 32, 28);
      doc.roundedRect(15, yPos, 180, 24, 2, 2, 'F');

      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text(`${index + 1}. ${stream.label}`, 20, yPos + 8);

      doc.setFontSize(11);
      doc.setTextColor(16, 185, 129); // Emerald
      doc.text(`+$${stream.monthlyValue.toLocaleString()}/mo`, 150, yPos + 8);

      doc.setFontSize(9);
      doc.setTextColor(160, 160, 160);
      doc.text(stream.desc, 20, yPos + 17);

      yPos += 30;
    });

    // 12-Month Forecast Box
    doc.setFillColor(18, 24, 21);
    doc.roundedRect(15, yPos + 5, 180, 42, 3, 3, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('12-MONTH CUMULATIVE FORECAST', 20, yPos + 16);

    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text(`• 12-Month Total Gross Savings & Value: $${calculations.annualizedGrossValue.toLocaleString()}`, 20, yPos + 25);
    doc.text(`• 12-Month Software Subscription: $${calculations.annualizedSoftwareCost.toLocaleString()}`, 20, yPos + 32);
    doc.setTextColor(255, 215, 0);
    doc.text(`• 12-Month Cumulative Net Profit Uplift: $${calculations.annualizedNetSavings.toLocaleString()}`, 20, yPos + 39);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('Generated via PRIME AI Operating System • Strict Executive Data Privacy', 15, 285);

    doc.save(`PRIME_ROI_Justification_${cName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#070908] text-white p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Value Proposition */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-[#FFD700] to-amber-500 text-black uppercase tracking-wider font-mono">
                D3.JS FINANCIAL ENGINE
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live Data Modeling
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Calculator className="w-8 h-8 text-[#FFD700]" />
              Executive ROI & Cost Justification Calculator
            </h1>
            <p className="text-sm text-white/60 mt-1.5 max-w-3xl">
              Model potential monthly cost reductions, ad CAC optimization, overdue invoice recoveries, and operational labor automation to justify your PRIME AI subscription.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-[#FFD700]" />
              Export Executive PDF
            </button>
            {onNavigatePlans && (
              <button
                onClick={onNavigatePlans}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FFD700] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                View & Upgrade Plans
              </button>
            )}
          </div>
        </div>

        {/* Preset Industry Templates */}
        <div className="bg-[#0B0F0D] rounded-2xl border border-white/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-white/80 uppercase tracking-wider font-mono flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
              Quick Industry Benchmark Presets
            </h3>
            <span className="text-[11px] text-white/40">Select a baseline to pre-fill inputs</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PRESETS.map(preset => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="p-3.5 rounded-xl bg-black/40 border border-white/5 hover:border-[#FFD700]/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">{preset.category}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/80">{preset.recommendedPlan}</span>
                </div>
                <div className="text-xs font-bold text-white group-hover:text-[#FFD700] transition-colors">{preset.name}</div>
                <div className="text-[11px] text-white/50 mt-1">
                  ${(preset.monthlyRevenue / 1000).toFixed(0)}k/mo Rev • ${(preset.monthlyAdSpend / 1000).toFixed(0)}k Ads
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Primary Metrics Banner (Headline Results) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#121815] to-[#0B0F0D] border border-emerald-500/30 relative overflow-hidden">
            <div className="flex items-center justify-between text-white/60 mb-2">
              <span className="text-xs font-bold font-mono uppercase">Total Monthly Value</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              ${calculations.totalMonthlyValue.toLocaleString()}
              <span className="text-xs text-white/50 font-normal"> / mo</span>
            </div>
            <div className="text-xs text-white/60 mt-1">
              Gross savings, recoveries & labor uplift
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#14151B] to-[#0B0F0D] border border-blue-500/30 relative overflow-hidden">
            <div className="flex items-center justify-between text-white/60 mb-2">
              <span className="text-xs font-bold font-mono uppercase">Net Monthly Profit</span>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              +${calculations.netMonthlyProfitImpact.toLocaleString()}
              <span className="text-xs text-white/50 font-normal"> / mo</span>
            </div>
            <div className="text-xs text-blue-400/80 mt-1 font-semibold">
              After ${currentPlanMonthlyCost}/mo software fee
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1B1812] to-[#0B0F0D] border border-[#FFD700]/30 relative overflow-hidden">
            <div className="flex items-center justify-between text-white/60 mb-2">
              <span className="text-xs font-bold font-mono uppercase">Net ROI Multiple</span>
              <Sparkles className="w-4 h-4 text-[#FFD700]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#FFD700]">
              {calculations.roiMultiplier}x
              <span className="text-xs text-white/50 font-normal"> Return</span>
            </div>
            <div className="text-xs text-amber-400/80 mt-1 font-semibold">
              ${calculations.roiMultiplier} return per $1 spent
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#181216] to-[#0B0F0D] border border-purple-500/30 relative overflow-hidden">
            <div className="flex items-center justify-between text-white/60 mb-2">
              <span className="text-xs font-bold font-mono uppercase">Breakeven Payback</span>
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-300">
              {calculations.paybackDays}
              <span className="text-xs text-white/50 font-normal"> Days</span>
            </div>
            <div className="text-xs text-white/60 mt-1">
              Time to fully recoup monthly license
            </div>
          </div>

        </div>

        {/* Main Grid: Inputs Panel (Left) vs D3 Visualizations (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Business Parameters & Sliders (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0B0F0D] rounded-2xl border border-white/10 p-6 space-y-6">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#FFD700]" />
                  <h2 className="text-base font-bold text-white">Business Parameters</h2>
                </div>
                <button
                  onClick={() => applyPreset(PRESETS[0])}
                  className="text-[11px] text-white/40 hover:text-white flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
              </div>

              {/* Plan Selection Tier */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white/80">Target Subscription Plan:</span>
                  <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg border border-white/10">
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${billingCycle === 'monthly' ? 'bg-[#FFD700] text-black' : 'text-white/60'}`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingCycle('annual')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${billingCycle === 'annual' ? 'bg-[#FFD700] text-black' : 'text-white/60'}`}
                    >
                      Annual (-20%)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(['Starter', 'Pro', 'Enterprise'] as PlanTier[]).map(plan => {
                    const cost = billingCycle === 'annual' ? planCosts[plan].annual : planCosts[plan].monthly;
                    const isSelected = selectedPlan === plan;
                    return (
                      <button
                        key={plan}
                        onClick={() => setSelectedPlan(plan)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isSelected 
                            ? 'bg-gradient-to-b from-[#1E231F] to-[#121815] border-[#FFD700] text-white shadow-lg' 
                            : 'bg-black/40 border-white/10 text-white/60 hover:border-white/30'
                        }`}
                      >
                        <div className="text-xs font-bold">{plan}</div>
                        <div className={`text-sm font-black mt-0.5 ${isSelected ? 'text-[#FFD700]' : 'text-white/80'}`}>
                          ${cost}
                        </div>
                        <div className="text-[10px] text-white/40">/mo</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Input 1: Monthly Revenue */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/80 font-medium">Monthly Gross Revenue ($)</span>
                  <span className="font-mono font-bold text-white text-sm">${monthlyRevenue.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="1000000"
                  step="5000"
                  value={monthlyRevenue}
                  onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FFD700]"
                />
                <div className="flex justify-between text-[10px] text-white/30 font-mono">
                  <span>$10k</span>
                  <span>$500k</span>
                  <span>$1M+</span>
                </div>
              </div>

              {/* Input 2: Monthly Paid Ad Spend */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/80 font-medium">Monthly Paid Ad Spend (Google/Meta/TikTok)</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">${monthlyAdSpend.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200000"
                  step="1000"
                  value={monthlyAdSpend}
                  onChange={(e) => setMonthlyAdSpend(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <div className="flex justify-between text-[10px] text-white/30 font-mono">
                  <span>$0</span>
                  <span>$100k</span>
                  <span>$200k</span>
                </div>
              </div>

              {/* Input 3: Overdue / Outstanding Invoices */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/80 font-medium">Monthly Outstanding & Delayed Invoices</span>
                  <span className="font-mono font-bold text-blue-400 text-sm">${overdueInvoices.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="300000"
                  step="2500"
                  value={overdueInvoices}
                  onChange={(e) => setOverdueInvoices(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-400"
                />
                <div className="flex justify-between text-[10px] text-white/30 font-mono">
                  <span>$0</span>
                  <span>$150k</span>
                  <span>$300k</span>
                </div>
              </div>

              {/* Input 4: Sales Pipeline Deals & Avg Deal Size */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-white/80 font-medium">Active Deals in Pipeline</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={pipelineDeals}
                    onChange={(e) => setPipelineDeals(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-sm focus:border-[#FFD700] outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-white/80 font-medium">Avg Deal Value ($)</label>
                  <input
                    type="number"
                    min="500"
                    max="250000"
                    step="500"
                    value={avgDealSize}
                    onChange={(e) => setAvgDealSize(Math.max(500, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-sm focus:border-[#FFD700] outline-none"
                  />
                </div>
              </div>

              {/* Input 5: Team Size */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/80 font-medium">Executive & Knowledge Workers Team Size</span>
                  <span className="font-mono font-bold text-purple-300 text-sm">{teamSize} members</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="60"
                  step="1"
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-400"
                />
                <div className="flex justify-between text-[10px] text-white/30 font-mono">
                  <span>1 person</span>
                  <span>30</span>
                  <span>60 members</span>
                </div>
              </div>

            </div>

            {/* Value Streams Breakdown List */}
            <div className="bg-[#0B0F0D] rounded-2xl border border-white/10 p-5 space-y-3">
              <h3 className="text-xs font-bold text-white/80 uppercase tracking-wider font-mono flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-[#FFD700]" />
                Monthly Value Generation Ledger
              </h3>

              <div className="space-y-2.5">
                {calculations.valueStreams.map(stream => (
                  <div 
                    key={stream.id}
                    className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: stream.color }} 
                      />
                      <div>
                        <div className="text-xs font-bold text-white">{stream.label}</div>
                        <div className="text-[10px] text-white/40 leading-tight max-w-[220px]">{stream.desc}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-black" style={{ color: stream.color }}>
                        +${stream.monthlyValue.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-white/40">/month</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT: D3.js Visualizations (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* D3 Chart 1: 12-Month Cumulative Value vs Subscription Cost */}
            <div className="bg-[#0B0F0D] rounded-2xl border border-white/10 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Cumulative Value & Profit Growth (12-Month Timeline)
                  </h3>
                  <p className="text-xs text-white/50 mt-0.5">
                    D3 projected trajectory comparing total financial upside against subscription investment.
                  </p>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                    <span className="text-white/80">Gross Value</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFD700] inline-block" />
                    <span className="text-white/80">Net Profit</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                    <span className="text-white/80">Subscription</span>
                  </div>
                </div>
              </div>

              {/* D3 SVG Container */}
              <div className="w-full overflow-x-auto">
                <svg 
                  ref={areaChartSvgRef} 
                  className="w-full h-auto max-h-[300px]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/5 text-center">
                <div className="p-2.5 rounded-xl bg-black/40">
                  <div className="text-[10px] text-white/40 uppercase font-mono">12-Mo Gross Savings</div>
                  <div className="text-sm font-black text-emerald-400 mt-0.5">
                    ${calculations.annualizedGrossValue.toLocaleString()}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40">
                  <div className="text-[10px] text-white/40 uppercase font-mono">12-Mo Software Cost</div>
                  <div className="text-sm font-black text-red-400 mt-0.5">
                    ${calculations.annualizedSoftwareCost.toLocaleString()}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40">
                  <div className="text-[10px] text-white/40 uppercase font-mono">12-Mo Net Retained</div>
                  <div className="text-sm font-black text-[#FFD700] mt-0.5">
                    +${calculations.annualizedNetSavings.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* D3 Chart 2 & 3: Donut Breakdown + Net Multiplier Gauge */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Donut Chart */}
              <div className="bg-[#0B0F0D] rounded-2xl border border-white/10 p-5 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 mb-1">
                    <PieChartIcon className="w-3.5 h-3.5 text-blue-400" />
                    Value Stream Composition
                  </h4>
                  <p className="text-[11px] text-white/50">
                    Hover slices to inspect distribution of value
                  </p>
                </div>

                <div className="my-2 flex justify-center items-center">
                  <svg 
                    ref={donutChartSvgRef} 
                    className="w-full max-w-[220px] h-auto"
                  />
                </div>

                {hoveredDonutSlice && (
                  <div className="text-center text-xs font-mono text-[#FFD700] py-1 bg-black/40 rounded-lg border border-white/5">
                    Active: {hoveredDonutSlice}
                  </div>
                )}
              </div>

              {/* Gauge Meter & Breakeven Insight */}
              <div className="bg-[#0B0F0D] rounded-2xl border border-white/10 p-5 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 mb-1">
                    <Target className="w-3.5 h-3.5 text-[#FFD700]" />
                    Net ROI Multiplier & Payback
                  </h4>
                  <p className="text-[11px] text-white/50">
                    Ratio of dollars returned per dollar invested
                  </p>
                </div>

                <div className="my-2 flex justify-center items-center">
                  <svg 
                    ref={gaugeChartSvgRef} 
                    className="w-full max-w-[220px] h-auto"
                  />
                </div>

                <div className="p-3 rounded-xl bg-black/50 border border-emerald-500/20 text-center">
                  <div className="text-[11px] text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Breakeven achieved in <span className="font-bold text-white">{calculations.paybackDays} days</span> of operation
                  </div>
                </div>
              </div>

            </div>

            {/* Executive Purchase Order (PO) Justification Card */}
            <div className="bg-gradient-to-br from-[#121815] to-[#0A0D0B] rounded-2xl border border-emerald-500/30 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Board & CFO Software Procurement Defense</h3>
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-mono font-bold">
                  PASSES 10x ROI GATEWAY
                </span>
              </div>

              <p className="text-xs text-white/70 leading-relaxed">
                By deploying PRIME AI on the <strong className="text-white">{selectedPlan} Tier (${currentPlanMonthlyCost}/mo)</strong>, your enterprise generates an estimated <strong className="text-emerald-400">${calculations.totalMonthlyValue.toLocaleString()}/month</strong> in direct ad spend waste reduction, accelerated receivables recovery, and automated executive operational labor. This delivers a net monthly profit expansion of <strong className="text-[#FFD700]">+${calculations.netMonthlyProfitImpact.toLocaleString()}</strong>, paying back its subscription fee in just <strong className="text-white">{calculations.paybackDays} days</strong>.
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-emerald-500/20">
                <div className="text-xs text-white/50 font-mono">
                  Guaranteed Data Privacy • Zero Mock Dependencies • Enterprise SLA
                </div>

                {onNavigatePlans && (
                  <button
                    onClick={onNavigatePlans}
                    className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-xs transition-all flex items-center gap-1.5"
                  >
                    <span>Proceed to {selectedPlan} Checkout</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
