import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Filter, 
  Sliders, 
  ExternalLink,
  Target,
  Sparkles,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Download,
  Info
} from 'lucide-react';
import { 
  AdCampaignItem, 
  AdSpendAuditSummary, 
  AdPlatformType, 
  Company 
} from '../types';
import { 
  fetchUserAdCampaigns, 
  saveAdCampaign, 
  deleteAdCampaign, 
  computeAdCampaignMetrics 
} from '../services/db';

interface AdSpendOptimizerViewProps {
  currentCompany: Company | null;
  userId: string;
}

const PLATFORMS: AdPlatformType[] = [
  'Google Ads',
  'Meta (Facebook & IG)',
  'LinkedIn Ads',
  'TikTok Ads',
  'YouTube Video',
  'Twitter / X',
  'Affiliate / Organic',
  'Other'
];

export const AdSpendOptimizerView: React.FC<AdSpendOptimizerViewProps> = ({
  currentCompany,
  userId
}) => {
  const companyId = currentCompany?.id || 'default_comp';
  const companyName = currentCompany?.name || 'My Enterprise';

  const [campaigns, setCampaigns] = useState<AdCampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPlatform, setFilterPlatform] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<AdCampaignItem | null>(null);

  // Form State
  const [formCampaignName, setFormCampaignName] = useState('');
  const [formPlatform, setFormPlatform] = useState<AdPlatformType>('Meta (Facebook & IG)');
  const [formMonthlyBudget, setFormMonthlyBudget] = useState('');
  const [formActualSpend, setFormActualSpend] = useState('');
  const [formLeads, setFormLeads] = useState('');
  const [formCustomers, setFormCustomers] = useState('');
  const [formRevenue, setFormRevenue] = useState('');
  const [formTargetCac, setFormTargetCac] = useState('150');

  // Load campaigns from db
  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const data = await fetchUserAdCampaigns(companyId, userId);
      setCampaigns(data);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, [companyId]);

  // Aggregate Metrics
  const summary: AdSpendAuditSummary = useMemo(() => {
    let totalMonthlyBudget = 0;
    let totalActualSpend = 0;
    let totalRevenueGenerated = 0;
    let totalCustomersAcquired = 0;
    let totalMonthlyWasteIdentified = 0;
    let flaggedCount = 0;

    const platformPerf: Record<string, { spend: number; rev: number }> = {};

    campaigns.forEach(c => {
      totalMonthlyBudget += c.monthlyBudget;
      totalActualSpend += c.actualSpend;
      totalRevenueGenerated += c.revenueGenerated;
      totalCustomersAcquired += c.customersAcquired;
      totalMonthlyWasteIdentified += c.wasteRiskMonthly;
      if (c.status === 'FLAGGED_WASTE' || c.efficiencyGrade === 'F_CRITICAL' || c.efficiencyGrade === 'D') {
        flaggedCount++;
      }

      if (!platformPerf[c.platform]) {
        platformPerf[c.platform] = { spend: 0, rev: 0 };
      }
      platformPerf[c.platform].spend += c.actualSpend;
      platformPerf[c.platform].rev += c.revenueGenerated;
    });

    const blendedCac = totalCustomersAcquired > 0 
      ? Math.round(totalActualSpend / totalCustomersAcquired) 
      : (totalActualSpend > 0 ? totalActualSpend : 0);

    const blendedRoas = totalActualSpend > 0 
      ? Number((totalRevenueGenerated / totalActualSpend).toFixed(2)) 
      : 0;

    const projectedAnnualSavings = totalMonthlyWasteIdentified * 12;

    let topPlatform = 'None';
    let highestRoas = 0;
    Object.entries(platformPerf).forEach(([plat, perf]) => {
      const roas = perf.spend > 0 ? perf.rev / perf.spend : 0;
      if (roas > highestRoas && perf.spend > 0) {
        highestRoas = roas;
        topPlatform = `${plat} (${roas.toFixed(1)}x ROAS)`;
      }
    });

    return {
      totalMonthlyBudget,
      totalActualSpend,
      totalRevenueGenerated,
      totalCustomersAcquired,
      blendedCac,
      blendedRoas,
      totalMonthlyWasteIdentified,
      projectedAnnualSavings,
      flaggedCampaignsCount: flaggedCount,
      topPerformingPlatform: topPlatform
    };
  }, [campaigns]);

  // Filtered List
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      if (filterPlatform !== 'ALL' && c.platform !== filterPlatform) return false;
      if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;
      return true;
    });
  }, [campaigns, filterPlatform, filterStatus]);

  // Open Modal for Create or Edit
  const openCreateModal = () => {
    setEditingCampaign(null);
    setFormCampaignName('');
    setFormPlatform('Meta (Facebook & IG)');
    setFormMonthlyBudget('');
    setFormActualSpend('');
    setFormLeads('');
    setFormCustomers('');
    setFormRevenue('');
    setFormTargetCac('150');
    setIsModalOpen(true);
  };

  const openEditModal = (c: AdCampaignItem) => {
    setEditingCampaign(c);
    setFormCampaignName(c.campaignName);
    setFormPlatform(c.platform);
    setFormMonthlyBudget(c.monthlyBudget.toString());
    setFormActualSpend(c.actualSpend.toString());
    setFormLeads(c.leadsGenerated.toString());
    setFormCustomers(c.customersAcquired.toString());
    setFormRevenue(c.revenueGenerated.toString());
    setFormTargetCac(c.targetCac.toString());
    setIsModalOpen(true);
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCampaignName.trim()) return;

    const payload = {
      id: editingCampaign?.id,
      companyId,
      userId,
      campaignName: formCampaignName.trim(),
      platform: formPlatform,
      monthlyBudget: Number(formMonthlyBudget) || 0,
      actualSpend: Number(formActualSpend) || 0,
      leadsGenerated: Number(formLeads) || 0,
      customersAcquired: Number(formCustomers) || 0,
      revenueGenerated: Number(formRevenue) || 0,
      targetCac: Number(formTargetCac) || 100,
      status: editingCampaign?.status || 'ACTIVE',
    };

    const saved = await saveAdCampaign(payload as any);
    setCampaigns(prev => [saved, ...prev.filter(c => c.id !== saved.id)]);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this campaign record?')) {
      await deleteAdCampaign(id, companyId);
      setCampaigns(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleQuickPauseWaste = async (campaign: AdCampaignItem) => {
    const updated = await saveAdCampaign({
      ...campaign,
      status: 'PAUSED',
      monthlyBudget: 0,
      actualSpend: 0,
      auditNotes: 'Paused by Executive Spend Optimizer to prevent monthly cash burn.',
    });
    setCampaigns(prev => prev.map(c => c.id === campaign.id ? updated : c));
  };

  const handleExportCSV = () => {
    if (campaigns.length === 0) {
      alert('No campaign data to export.');
      return;
    }
    const headers = ['Campaign Name', 'Platform', 'Budget', 'Actual Spend', 'Leads', 'Customers', 'Revenue', 'CAC', 'ROAS', 'Status', 'Monthly Waste', 'Action Plan'];
    const rows = campaigns.map(c => [
      `"${c.campaignName}"`,
      `"${c.platform}"`,
      c.monthlyBudget,
      c.actualSpend,
      c.leadsGenerated,
      c.customersAcquired,
      c.revenueGenerated,
      c.calculatedCac,
      c.roas,
      c.status,
      c.wasteRiskMonthly,
      `"${c.aiSuggestedAction}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ad_Spend_Audit_${companyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="ad-spend-optimizer-container" className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Target className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Ad Spend & CAC Optimizer
            </h1>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-2xl">
            Audit live paid marketing campaigns across Google, Meta, LinkedIn & TikTok. Identify underperforming CAC bleed, cut ad waste, and protect monthly profit margins.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="export-ad-audit-btn"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Audit
          </button>
          <button
            id="add-ad-campaign-btn"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Campaign
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Spend & Revenue */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Ad Spend</span>
            <DollarSign className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            ${summary.totalActualSpend.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
            <span>Budget: ${summary.totalMonthlyBudget.toLocaleString()}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              Rev: ${summary.totalRevenueGenerated.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 2: Blended ROAS */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Blended ROAS</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
              {summary.blendedRoas}x
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              summary.blendedRoas >= 3 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
              summary.blendedRoas >= 1.5 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
              'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
            }`}>
              {summary.blendedRoas >= 3 ? 'Profitable' : summary.blendedRoas >= 1.5 ? 'Moderate' : 'Negative ROI'}
            </span>
          </div>
          <div className="mt-2 text-xs text-neutral-500 truncate">
            Top Channel: <span className="font-medium text-neutral-700 dark:text-neutral-300">{summary.topPerformingPlatform}</span>
          </div>
        </div>

        {/* Card 3: Blended CAC */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Blended CAC</span>
            <PieChart className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            ${summary.blendedCac.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-neutral-500">
            Total Customers Acquired: <span className="font-medium text-neutral-700 dark:text-neutral-300">{summary.totalCustomersAcquired}</span>
          </div>
        </div>

        {/* Card 4: Monthly Waste Identified (Savings Potential) */}
        <div className="bg-gradient-to-br from-rose-50 to-amber-50 dark:from-rose-950/40 dark:to-amber-950/20 border border-rose-200 dark:border-rose-900/60 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              Monthly Waste Identified
            </span>
            {summary.flaggedCampaignsCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded">
                {summary.flaggedCampaignsCount} Leak{summary.flaggedCampaignsCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-rose-700 dark:text-rose-300">
            ${summary.totalMonthlyWasteIdentified.toLocaleString()}
            <span className="text-xs font-normal text-rose-600 dark:text-rose-400 ml-1">/mo</span>
          </div>
          <div className="mt-2 text-xs text-rose-600/90 dark:text-rose-400">
            Potential Annual Savings: <strong className="font-bold">${summary.projectedAnnualSavings.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* Filter and Status Toolbar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Filter className="w-4 h-4" />
            <span>Platform:</span>
          </div>
          <select
            id="filter-ad-platform-select"
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Platforms ({campaigns.length})</option>
            {PLATFORMS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-sm text-neutral-500 ml-2">
            <span>Status:</span>
          </div>
          <select
            id="filter-ad-status-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="OPTIMIZED">Optimized (A+)</option>
            <option value="FLAGGED_WASTE">Flagged Waste / High CAC</option>
            <option value="PAUSED">Paused</option>
          </select>
        </div>

        <button
          id="refresh-ad-campaigns-btn"
          onClick={loadCampaigns}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Sync Data
        </button>
      </div>

      {/* Campaigns Table / Empty State */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-neutral-500">
          <RefreshCw className="w-8 h-8 animate-spin mb-3 text-emerald-500" />
          <p className="text-sm">Auditing marketing campaigns & calculating CAC...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">
            No Ad Campaigns Logged Yet
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-6">
            Add your actual ad campaigns from Google, Meta, TikTok, or LinkedIn. The audit engine will immediately calculate your true CAC, ROAS, and identify budget waste.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add First Campaign
          </button>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 text-center text-neutral-500 text-sm">
          No campaigns match the selected filters.
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="py-3.5 px-4">Campaign & Platform</th>
                  <th className="py-3.5 px-4 text-right">Spend / Budget</th>
                  <th className="py-3.5 px-4 text-right">Leads / Acq</th>
                  <th className="py-3.5 px-4 text-right">CAC vs Target</th>
                  <th className="py-3.5 px-4 text-right">ROAS</th>
                  <th className="py-3.5 px-4">Audit Status</th>
                  <th className="py-3.5 px-4">Identified Waste</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {filteredCampaigns.map((c) => {
                  const isWaste = c.status === 'FLAGGED_WASTE' || c.efficiencyGrade === 'F_CRITICAL' || c.efficiencyGrade === 'D';
                  return (
                    <tr 
                      key={c.id} 
                      className={`hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors ${
                        isWaste ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''
                      }`}
                    >
                      {/* Campaign & Platform */}
                      <td className="py-4 px-4">
                        <div className="font-medium text-neutral-900 dark:text-white">
                          {c.campaignName}
                        </div>
                        <div className="text-xs text-neutral-500 flex items-center gap-1.5 mt-0.5">
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                          {c.platform}
                        </div>
                        {c.aiSuggestedAction && (
                          <div className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 flex items-start gap-1 bg-neutral-100/60 dark:bg-neutral-800/60 p-1.5 rounded">
                            <Zap className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                            <span>{c.aiSuggestedAction}</span>
                          </div>
                        )}
                      </td>

                      {/* Spend / Budget */}
                      <td className="py-4 px-4 text-right">
                        <div className="font-semibold text-neutral-900 dark:text-white">
                          ${c.actualSpend.toLocaleString()}
                        </div>
                        <div className="text-xs text-neutral-500">
                          Budget: ${c.monthlyBudget.toLocaleString()}
                        </div>
                      </td>

                      {/* Leads / Customers */}
                      <td className="py-4 px-4 text-right">
                        <div className="font-medium text-neutral-900 dark:text-white">
                          {c.customersAcquired} customers
                        </div>
                        <div className="text-xs text-neutral-500">
                          {c.leadsGenerated} leads
                        </div>
                      </td>

                      {/* CAC vs Target */}
                      <td className="py-4 px-4 text-right">
                        <div className={`font-bold ${
                          c.calculatedCac <= c.targetCac ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          ${c.calculatedCac.toLocaleString()}
                        </div>
                        <div className="text-xs text-neutral-500">
                          Target: ${c.targetCac.toLocaleString()}
                        </div>
                      </td>

                      {/* ROAS */}
                      <td className="py-4 px-4 text-right">
                        <div className={`font-bold text-base ${
                          c.roas >= 3 ? 'text-emerald-600 dark:text-emerald-400' :
                          c.roas >= 1.5 ? 'text-neutral-800 dark:text-neutral-200' :
                          'text-rose-600 dark:text-rose-400'
                        }`}>
                          {c.roas}x
                        </div>
                        <div className="text-xs text-neutral-500">
                          Rev: ${c.revenueGenerated.toLocaleString()}
                        </div>
                      </td>

                      {/* Status / Grade Badge */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${
                            c.status === 'OPTIMIZED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                            c.status === 'FLAGGED_WASTE' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                            c.status === 'PAUSED' ? 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}>
                            {c.status === 'FLAGGED_WASTE' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                            {c.status === 'OPTIMIZED' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {c.status.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] text-neutral-500 font-medium">
                            Grade: <strong className={isWaste ? 'text-rose-600' : 'text-emerald-600'}>{c.efficiencyGrade}</strong>
                          </span>
                        </div>
                      </td>

                      {/* Waste Amount */}
                      <td className="py-4 px-4">
                        {c.wasteRiskMonthly > 0 ? (
                          <div className="text-rose-600 dark:text-rose-400 font-bold">
                            ${c.wasteRiskMonthly.toLocaleString()}/mo
                          </div>
                        ) : (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            $0 (Pristine)
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isWaste && c.status !== 'PAUSED' && (
                            <button
                              title="Instantly Pause to stop cash bleed"
                              onClick={() => handleQuickPauseWaste(c)}
                              className="px-2 py-1 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded transition-colors"
                            >
                              Pause Waste
                            </button>
                          )}
                          <button
                            title="Edit Campaign"
                            onClick={() => openEditModal(c)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            title="Delete Campaign"
                            onClick={() => handleDelete(c.id)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Creating / Editing Campaign */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                {editingCampaign ? 'Edit Ad Campaign' : 'Add Real Ad Campaign'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Meta Retargeting - High Intent"
                  value={formCampaignName}
                  onChange={(e) => setFormCampaignName(e.target.value)}
                  className="w-full text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Platform
                </label>
                <select
                  value={formPlatform}
                  onChange={(e) => setFormPlatform(e.target.value as AdPlatformType)}
                  className="w-full text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {PLATFORMS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Monthly Budget ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 5000"
                    value={formMonthlyBudget}
                    onChange={(e) => setFormMonthlyBudget(e.target.value)}
                    className="w-full text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Actual Monthly Spend ($) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="e.g. 4800"
                    value={formActualSpend}
                    onChange={(e) => setFormActualSpend(e.target.value)}
                    className="w-full text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Leads Generated
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 320"
                    value={formLeads}
                    onChange={(e) => setFormLeads(e.target.value)}
                    className="w-full text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Customers Acquired *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="e.g. 32"
                    value={formCustomers}
                    onChange={(e) => setFormCustomers(e.target.value)}
                    className="w-full text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Revenue Generated ($) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="e.g. 18400"
                    value={formRevenue}
                    onChange={(e) => setFormRevenue(e.target.value)}
                    className="w-full text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Target Max CAC ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 150"
                    value={formTargetCac}
                    onChange={(e) => setFormTargetCac(e.target.value)}
                    className="w-full text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg text-xs text-neutral-500 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-neutral-700 dark:text-neutral-300">
                  <Info className="w-3.5 h-3.5 text-blue-500" />
                  Real-time Audit Engine
                </div>
                <p>
                  Upon saving, the system will compute your exact Customer Acquisition Cost (CAC) and Return on Ad Spend (ROAS). If CAC exceeds your target or ROAS drops below threshold, potential monthly savings will be highlighted.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow transition-colors"
                >
                  {editingCampaign ? 'Save Changes' : 'Add & Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
