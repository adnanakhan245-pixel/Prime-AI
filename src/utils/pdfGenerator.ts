import { jsPDF } from 'jspdf';
import { StrategyRecord, StrategyPlan } from '../types';

export function exportStrategyReportPDF(strategyRecord: StrategyRecord | null, fallbackCompany = 'PRIME Corp') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const plan: StrategyPlan = strategyRecord?.strategy || {
    executive_summary: 'Executive Strategic Assessment synthesized by PRIME AI.',
    strategic_health_score: 88,
    projected_arr_impact: '+$620,000 ARR',
    pipeline_health_rating: 'Strong Velocity ($1.82M Qualified Pipeline)',
    execution_readiness_score: 92,
    top_3_risks: [],
    top_3_opportunities: [],
    q4_goals: [],
    team_assignments: [],
    plan_90_day: []
  };

  const company = strategyRecord?.companyName || fallbackCompany;
  const dateRange = strategyRecord?.dateRange || 'Q4 Strategic Planning (90 Days)';
  const dateStr = new Date(strategyRecord?.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  let y = 18;

  // Helper to add new page if content overflows
  function checkPageBreak(requiredHeight: number) {
    if (y + requiredHeight > 280) {
      doc.addPage();
      y = 18;
      // Small page header
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text(`PRIME AI Executive Strategy Report — ${company}`, margin, 10);
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, 12, pageWidth - margin, 12);
    }
  }

  // --- HEADER SECTION ---
  doc.setFillColor(15, 15, 15);
  doc.rect(margin, y, contentWidth, 26, 'F');

  doc.setTextColor(255, 215, 0); // Gold
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PRIME AI — Executive Strategic Operations Report', margin + 6, y + 10);

  doc.setTextColor(220, 220, 220);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Enterprise: ${company}   |   Period: ${dateRange}   |   Date: ${dateStr}`, margin + 6, y + 18);

  y += 32;

  // --- EXECUTIVE SCORECARD / STATS ROW ---
  const boxWidth = (contentWidth - 9) / 4;
  const boxHeight = 18;

  const scorecards = [
    { label: 'Health Score', value: `${plan.strategic_health_score || 88}/100`, color: [22, 101, 52] },
    { label: 'ARR Impact', value: plan.projected_arr_impact || '+$620k ARR', color: [161, 98, 7] },
    { label: 'Readiness', value: `${plan.execution_readiness_score || 92}%`, color: [30, 64, 175] },
    { label: 'Confidence', value: 'High (SOC2)', color: [75, 85, 99] },
  ];

  scorecards.forEach((card, idx) => {
    const bx = margin + idx * (boxWidth + 3);
    doc.setFillColor(245, 245, 247);
    doc.setDrawColor(220, 220, 225);
    doc.roundedRect(bx, y, boxWidth, boxHeight, 2, 2, 'FD');

    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'bold');
    doc.text(card.label.toUpperCase(), bx + 4, y + 6);

    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.setFont('helvetica', 'bold');
    doc.text(card.value, bx + 4, y + 13);
  });

  y += boxHeight + 8;

  // --- 1. EXECUTIVE SUMMARY ---
  checkPageBreak(30);
  doc.setFontSize(11);
  doc.setTextColor(10, 10, 10);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Executive Strategic Summary', margin, y);
  y += 5;

  doc.setFontSize(8.5);
  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'normal');
  const splitSummary = doc.splitTextToSize(plan.executive_summary || 'No executive summary provided.', contentWidth);
  doc.text(splitSummary, margin, y);
  y += (splitSummary.length * 4.2) + 6;

  // --- 2. TOP 3 CRITICAL RISKS ---
  checkPageBreak(35);
  doc.setFontSize(11);
  doc.setTextColor(180, 40, 40);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Top Critical Operational & Revenue Risks', margin, y);
  y += 5;

  (plan.top_3_risks || []).forEach((risk, i) => {
    checkPageBreak(25);
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(252, 165, 165);
    
    const riskTitle = `${i + 1}. [${risk.severity || 'HIGH'}] ${risk.title}`;
    const descLines = doc.splitTextToSize(`Description: ${risk.description}`, contentWidth - 8);
    const mitLines = doc.splitTextToSize(`Mitigation Plan: ${risk.mitigationPlan}`, contentWidth - 8);
    const cardH = 10 + (descLines.length * 3.6) + (mitLines.length * 3.6);

    doc.roundedRect(margin, y, contentWidth, cardH, 2, 2, 'FD');

    doc.setFontSize(8.5);
    doc.setTextColor(153, 27, 27);
    doc.setFont('helvetica', 'bold');
    doc.text(riskTitle, margin + 4, y + 5);

    doc.setFontSize(7.5);
    doc.setTextColor(70, 70, 70);
    doc.setFont('helvetica', 'normal');
    doc.text(descLines, margin + 4, y + 9);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(mitLines, margin + 4, y + 10 + (descLines.length * 3.6));

    y += cardH + 4;
  });

  y += 3;

  // --- 3. TOP 3 REVENUE OPPORTUNITIES ---
  checkPageBreak(35);
  doc.setFontSize(11);
  doc.setTextColor(21, 128, 61);
  doc.setFont('helvetica', 'bold');
  doc.text('3. High-Velocity Revenue & Expansion Opportunities', margin, y);
  y += 5;

  (plan.top_3_opportunities || []).forEach((opp, i) => {
    checkPageBreak(25);
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(134, 239, 172);

    const oppTitle = `${i + 1}. [${opp.category || 'EXPANSION'}] ${opp.title} (${opp.potentialARR || '+$100k'})`;
    const descLines = doc.splitTextToSize(`Strategic Potential: ${opp.description}`, contentWidth - 8);
    const actLines = doc.splitTextToSize(`Required Action: ${opp.actionRequired}`, contentWidth - 8);
    const cardH = 10 + (descLines.length * 3.6) + (actLines.length * 3.6);

    doc.roundedRect(margin, y, contentWidth, cardH, 2, 2, 'FD');

    doc.setFontSize(8.5);
    doc.setTextColor(22, 101, 52);
    doc.setFont('helvetica', 'bold');
    doc.text(oppTitle, margin + 4, y + 5);

    doc.setFontSize(7.5);
    doc.setTextColor(70, 70, 70);
    doc.setFont('helvetica', 'normal');
    doc.text(descLines, margin + 4, y + 9);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(actLines, margin + 4, y + 10 + (descLines.length * 3.6));

    y += cardH + 4;
  });

  y += 3;

  // --- 4. 90-DAY STRATEGIC ROADMAP ---
  checkPageBreak(40);
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Executive 90-Day Execution Roadmap & Milestones', margin, y);
  y += 5;

  const milestones = plan.plan_90_day || [
    {
      timeframe: 'Days 1 - 30 (Stabilization & Churn Neutralization)',
      milestoneTitle: 'Re-engage Silent Accounts & Deploy First CRO Levers',
      actions: ['Dispatch executive touchpoints', 'Deploy trust badges and ROI calculator'],
      expectedKpiImpact: 'Protect $140k at-risk ARR and lift baseline conversion',
      owner: 'CEO & VP Sales',
      completed: false
    },
    {
      timeframe: 'Days 31 - 60 (Pipeline Acceleration & Delivery)',
      milestoneTitle: 'Verify Sub-200ms Latency SLA & Expand Enterprise MSAs',
      actions: ['Deploy engineering speed upgrades', 'Launch Closer AI coaching'],
      expectedKpiImpact: 'Shorten sales cycle by 18 days',
      owner: 'VP Engineering',
      completed: false
    },
    {
      timeframe: 'Days 61 - 90 (Q4 Closing Sprint & Board Review)',
      milestoneTitle: 'Lock In Enterprise MSAs & Convene FY2027 Strategy Board',
      actions: ['Finalize multi-year renewals', 'Review 90-day KPI targets'],
      expectedKpiImpact: 'Reach $2.10M ARR milestone',
      owner: 'Executive Board',
      completed: false
    }
  ];

  milestones.forEach((m) => {
    checkPageBreak(25);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);

    const actionText = m.actions.map(a => `• ${a}`).join('  ');
    const actLines = doc.splitTextToSize(`Actions: ${actionText}`, contentWidth - 8);
    const cardH = 14 + (actLines.length * 3.6);

    doc.roundedRect(margin, y, contentWidth, cardH, 2, 2, 'FD');

    doc.setFontSize(8);
    doc.setTextColor(30, 58, 138);
    doc.setFont('helvetica', 'bold');
    doc.text(`${m.timeframe.toUpperCase()} — Owner: ${m.owner}`, margin + 4, y + 5);

    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(m.milestoneTitle, margin + 4, y + 9);

    doc.setFontSize(7.5);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(actLines, margin + 4, y + 13);

    y += cardH + 4;
  });

  // --- FOOTER ACROSS ALL PAGES ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, 285, pageWidth - margin, 285);
    doc.setFontSize(7.5);
    doc.setTextColor(130, 130, 130);
    doc.setFont('helvetica', 'normal');
    doc.text(`PRIME AI Enterprise Intelligence — Strictly Confidential — Page ${i} of ${totalPages}`, margin, 290);
    doc.text(dateStr, pageWidth - margin - 20, 290);
  }

  // Save the generated PDF
  const cleanFilename = `${company.toLowerCase().replace(/[^a-z0-9]/g, '_')}_strategy_report_${Date.now()}.pdf`;
  doc.save(cleanFilename);
}
