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
  ExternalLink, 
  Plus, 
  Database, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ChevronRight, 
  ShieldAlert, 
  Zap, 
  Building2, 
  User, 
  PhoneCall, 
  X,
  SlidersHorizontal,
  Check,
  TrendingUp,
  CreditCard,
  Layers,
  ArrowRight,
  Send,
  AlertCircle,
  Download,
  Key,
  ShieldCheck,
  Percent,
  Users,
  Activity,
  Swords,
  Shield,
  CalendarCheck,
  Award,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  CRMRecord, 
  RevenueRadarStats,
  ChurnRescuePlaybook,
  ExpansionPlaybook,
  DunningRecoveryItem,
  SaaSTelemetryStats,
  PQLSignal,
  PLGTelemetryStats,
  RenewalDefenseItem,
  RenewalDefenseStats
} from '../types';
import { 
  fetchCRMRecords, 
  filterAtRiskClients, 
  filterHotLeads, 
  calculateRadarStats, 
  saveCRMRecord, 
  updateCRMRecord, 
  deleteCRMRecord, 
  markContactedToday, 
  attachAIActionToRecord,
  getSupabaseConfig,
  saveSupabaseConfig,
  getSampleEnterpriseCRMData,
  saveRecordsToLocal,
  SupabaseConfig
} from '../services/crm';
import { 
  calculateSaaSTelemetry,
  filterSaaSChurnRisks,
  filterSaaSExpansionTargets,
  getDunningRecoveries,
  saveDunningRecoveries,
  applyChurnRescue,
  applyExpansionUpgrade,
  getPQLSignals,
  savePQLSignals,
  generateSeedPQLSignals,
  calculatePLGStats,
  markPQLConverted,
  getRenewalDefenseItems,
  saveRenewalDefenseItems,
  generateSeedRenewalDefenseItems,
  calculateRenewalStats,
  lockInMultiYearContract
} from '../services/saas';
import { createInboxEmailFromDraft, addActivityLog } from '../services/db';
import { DealHealthTrendChart } from './DealHealthTrendChart';

export const RevenueRadarView: React.FC = () => {
  const { user, profile, companyId, companyName } = useAuth();
  const userId = user?.uid || 'demo_user';
  const activeCompanyId = companyId || 'comp_apex_01';
  const activeCompanyName = companyName || profile?.companyName || 'Apex Enterprises';

  const [activeTab, setActiveTab] = useState<'health_trends' | 'churn_rescue' | 'expansion_radar' | 'pql_signals' | 'renewal_defense' | 'stripe_telemetry' | 'all_pipeline'>('health_trends');
  const [records, setRecords] = useState<CRMRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Churn AI State
  const [generatingChurnId, setGeneratingChurnId] = useState<string | null>(null);
  const [selectedRecordForChurn, setSelectedRecordForChurn] = useState<CRMRecord | null>(null);
  const [churnPlaybook, setChurnPlaybook] = useState<ChurnRescuePlaybook | null>(null);
  const [churnModalOpen, setChurnModalOpen] = useState(false);

  // Expansion AI State
  const [generatingExpansionId, setGeneratingExpansionId] = useState<string | null>(null);
  const [selectedRecordForExpansion, setSelectedRecordForExpansion] = useState<CRMRecord | null>(null);
  const [expansionPlaybook, setExpansionPlaybook] = useState<ExpansionPlaybook | null>(null);
  const [expansionModalOpen, setExpansionModalOpen] = useState(false);

  // PLG & PQL Signals State
  const [pqlSignals, setPqlSignals] = useState<PQLSignal[]>([]);
  const [generatingPqlId, setGeneratingPqlId] = useState<string | null>(null);
  const [selectedPql, setSelectedPql] = useState<PQLSignal | null>(null);
  const [pqlPitchModalOpen, setPqlPitchModalOpen] = useState(false);

  // Competitor Attack & Renewal Defense State
  const [renewalItems, setRenewalItems] = useState<RenewalDefenseItem[]>([]);
  const [generatingRenewalId, setGeneratingRenewalId] = useState<string | null>(null);
  const [selectedRenewal, setSelectedRenewal] = useState<RenewalDefenseItem | null>(null);
  const [renewalDefenseModalOpen, setRenewalDefenseModalOpen] = useState(false);

  // Dunning Recovery State
  const [dunningItems, setDunningItems] = useState<DunningRecoveryItem[]>([]);
  const [generatingDunningId, setGeneratingDunningId] = useState<string | null>(null);
  const [selectedDunning, setSelectedDunning] = useState<DunningRecoveryItem | null>(null);
  const [dunningModalOpen, setDunningModalOpen] = useState(false);

  // Shared clipboard / notification
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [pushedToInboxId, setPushedToInboxId] = useState<string | null>(null);

  // Supabase Config Modal
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [supabaseConfig, setSupabaseConfigState] = useState<SupabaseConfig>(getSupabaseConfig());
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [stripeConnected, setStripeConnected] = useState(false);

  // New deal modal
  const [newRecordModalOpen, setNewRecordModalOpen] = useState(false);
  const [newRecordData, setNewRecordData] = useState({
    accountName: '',
    contactName: '',
    contactEmail: '',
    contactRole: '',
    dealValue: 36000,
    mrr: 3000,
    planTier: 'Pro' as const,
    stage: 'Active Client' as const,
    type: 'CLIENT' as const,
    daysSinceLastContact: 14,
    notes: '',
  });

  // Load CRM & SaaS data
  const loadData = async () => {
    setLoading(true);
    try {
      const liveRecords = await fetchCRMRecords(userId);
      setRecords(liveRecords);

      const localDunning = getDunningRecoveries(activeCompanyId);
      if (localDunning.length === 0) {
        // Derive initial dunning items from delinquent records if any
        const delinquent = liveRecords.filter(r => r.stripeStatus === 'past_due' || (r.failedPaymentAmount && r.failedPaymentAmount > 0));
        const derived: DunningRecoveryItem[] = delinquent.map(d => ({
          id: 'dunning_' + d.id,
          companyId: activeCompanyId,
          customerName: d.accountName,
          customerEmail: d.contactEmail,
          planName: d.planTier || 'Enterprise',
          failedAmount: d.failedPaymentAmount || Math.round((d.dealValue || 60000) / 12),
          currency: 'USD',
          failedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          retryAttempts: 2,
          status: 'PENDING',
        }));
        setDunningItems(derived);
        saveDunningRecoveries(activeCompanyId, derived);
      } else {
        setDunningItems(localDunning);
      }

      // Load PLG & PQL Signals
      let localPqls = getPQLSignals(activeCompanyId);
      if (localPqls.length === 0) {
        localPqls = generateSeedPQLSignals(activeCompanyId, activeCompanyName);
        savePQLSignals(activeCompanyId, localPqls);
      }
      setPqlSignals(localPqls);

      // Load Renewal & Competitor Defense Items
      let localRenewals = getRenewalDefenseItems(activeCompanyId);
      if (localRenewals.length === 0) {
        localRenewals = generateSeedRenewalDefenseItems(activeCompanyId, activeCompanyName);
        saveRenewalDefenseItems(activeCompanyId, localRenewals);
      }
      setRenewalItems(localRenewals);
    } catch (e) {
      console.error('Failed to load CRM records:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeCompanyId, userId]);

  // Derived filtered lists & stats
  const saasStats: SaaSTelemetryStats = calculateSaaSTelemetry(records);
  const plgStats: PLGTelemetryStats = calculatePLGStats(pqlSignals);
  const renewalStats: RenewalDefenseStats = calculateRenewalStats(renewalItems);
  const churnRisks = filterSaaSChurnRisks(records);
  const expansionTargets = filterSaaSExpansionTargets(records);
  const hotLeads = filterHotLeads(records);
  const stats: RevenueRadarStats = calculateRadarStats(records);

  const filteredRecords = records.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.accountName.toLowerCase().includes(q) ||
      r.contactName.toLowerCase().includes(q) ||
      r.contactEmail.toLowerCase().includes(q) ||
      (r.notes && r.notes.toLowerCase().includes(q))
    );
  });

  // Trigger 1-Click AI PQL Conversion Pitch
  const handleGeneratePQLPitch = async (signal: PQLSignal) => {
    setGeneratingPqlId(signal.id);
    try {
      const res = await fetch('/api/gemini/pql-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pqlSignal: signal,
          companyName: activeCompanyName,
        }),
      });

      if (!res.ok) throw new Error('AI PQL pitch service failed');
      const pitch = await res.json();
      
      const updatedSignal: PQLSignal = {
        ...signal,
        aiConversionPitch: pitch,
        status: 'PITCHED'
      };

      const updatedList = pqlSignals.map(s => s.id === signal.id ? updatedSignal : s);
      setPqlSignals(updatedList);
      savePQLSignals(activeCompanyId, updatedList);
      setSelectedPql(updatedSignal);
      setPqlPitchModalOpen(true);
    } catch (err) {
      console.error('PQL pitch generation failed:', err);
    } finally {
      setGeneratingPqlId(null);
    }
  };

  // Convert PQL to Paid Tier
  const handleConvertPQL = async (signal: PQLSignal) => {
    const updated = markPQLConverted(activeCompanyId, pqlSignals, signal.id);
    setPqlSignals(updated);
    addActivityLog(
      userId,
      'RADAR_ACTION_TRIGGERED',
      'PQL Converted to Paid Tier',
      `Converted in-app user ${signal.userName} (${signal.accountName}) to ${signal.targetPlan} (+$${signal.estimatedArrUplift.toLocaleString()} ARR uplift).`
    );
    setPqlPitchModalOpen(false);
  };

  // Push PQL Pitch to Inbox
  const handlePushPQLToInbox = async () => {
    if (!selectedPql || !selectedPql.aiConversionPitch) return;
    await createInboxEmailFromDraft(activeCompanyId, userId, {
      sender: 'PRIME Growth & Product AI',
      senderEmail: 'growth@prime.ai',
      subject: selectedPql.aiConversionPitch.subject,
      snippet: selectedPql.aiConversionPitch.body.slice(0, 120) + '...',
      fullBody: selectedPql.aiConversionPitch.body,
      urgency: 'HIGH',
      category: 'CLIENT',
      aiDraftReply: selectedPql.aiConversionPitch.body,
      aiKeyTakeaway: `PQL Conversion Pitch for ${selectedPql.userName} at ${selectedPql.accountName} (+$${selectedPql.estimatedArrUplift.toLocaleString()} ARR)`,
      aiSuggestedAction: `Deploy ${selectedPql.targetPlan} tier upgrade offer based on trigger: ${selectedPql.pqlTriggerReason}`
    });
    setPushedToInboxId(selectedPql.id);
    setTimeout(() => setPushedToInboxId(null), 3000);
  };

  // Trigger 1-Click AI Competitor Counter-Strike & Renewal Defense Strategy
  const handleGenerateRenewalDefense = async (item: RenewalDefenseItem) => {
    setGeneratingRenewalId(item.id);
    try {
      const res = await fetch('/api/gemini/renewal-defense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          renewalItem: item,
          companyName: activeCompanyName,
        }),
      });

      if (!res.ok) throw new Error('AI Renewal defense service failed');
      const strategy = await res.json();

      const updatedItem: RenewalDefenseItem = {
        ...item,
        aiDefenseStrategy: strategy,
        status: 'DEFENSE_DEPLOYED'
      };

      const updatedList = renewalItems.map(i => i.id === item.id ? updatedItem : i);
      setRenewalItems(updatedList);
      saveRenewalDefenseItems(activeCompanyId, updatedList);
      setSelectedRenewal(updatedItem);
      setRenewalDefenseModalOpen(true);
    } catch (err) {
      console.error('Renewal defense generation failed:', err);
    } finally {
      setGeneratingRenewalId(null);
    }
  };

  // Lock In 2-Year or 3-Year Contract
  const handleLockInMultiYear = async (item: RenewalDefenseItem, years: number = 2) => {
    const updated = lockInMultiYearContract(activeCompanyId, renewalItems, item.id, years);
    setRenewalItems(updated);
    addActivityLog(
      userId,
      'RADAR_ACTION_TRIGGERED',
      `Multi-Year Renewal Lock-In (${years} Years)`,
      `Secured ${years}-year contract lock-in for ${item.accountName} ($${(item.contractArr * years).toLocaleString()} total ARR secured).`
    );
    setRenewalDefenseModalOpen(false);
  };

  // Push Renewal Outreach to Inbox
  const handlePushRenewalToInbox = async () => {
    if (!selectedRenewal || !selectedRenewal.aiDefenseStrategy) return;
    await createInboxEmailFromDraft(activeCompanyId, userId, {
      sender: 'PRIME Executive Defense AI',
      senderEmail: 'cro@prime.ai',
      subject: selectedRenewal.aiDefenseStrategy.executiveOutreachSubject,
      snippet: selectedRenewal.aiDefenseStrategy.executiveOutreachBody.slice(0, 120) + '...',
      fullBody: selectedRenewal.aiDefenseStrategy.executiveOutreachBody,
      urgency: 'HIGH',
      category: 'CLIENT',
      aiDraftReply: selectedRenewal.aiDefenseStrategy.executiveOutreachBody,
      aiKeyTakeaway: `Renewal Pre-emption & Competitor Defense for ${selectedRenewal.accountName} ($${selectedRenewal.contractArr.toLocaleString()} ARR at stake)`,
      aiSuggestedAction: `Deploy 2-year lock-in proposal highlighting $${selectedRenewal.historicalRoiDollarsSaved.toLocaleString()} historical value delivered.`
    });
    setPushedToInboxId(selectedRenewal.id);
    setTimeout(() => setPushedToInboxId(null), 3000);
  };

  // Trigger 1-Click AI Churn Auto-Rescue
  const handleGenerateChurnRescue = async (record: CRMRecord) => {
    setGeneratingChurnId(record.id);
    try {
      const res = await fetch('/api/gemini/churn-rescue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          record,
          companyName: activeCompanyName,
        }),
      });

      if (!res.ok) throw new Error('AI Rescue service response error');
      const playbook: ChurnRescuePlaybook = await res.json();
      setChurnPlaybook(playbook);
      setSelectedRecordForChurn(record);
      setChurnModalOpen(true);
    } catch (err: any) {
      console.error('Churn rescue failed:', err);
    } finally {
      setGeneratingChurnId(null);
    }
  };

  // Execute Churn Concession & Stabilize Account
  const handleApplyChurnRescueAction = async () => {
    if (!selectedRecordForChurn || !churnPlaybook) return;
    const updated = await applyChurnRescue(activeCompanyId, records, selectedRecordForChurn.id, churnPlaybook);
    setRecords(updated);
    addActivityLog(
      userId,
      'RADAR_ACTION_TRIGGERED',
      'SaaS Churn Rescued',
      `Applied AI Concession to ${selectedRecordForChurn.accountName}: ${churnPlaybook.proposedConcession} ($${churnPlaybook.savedArr.toLocaleString()} ARR protected).`
    );
    setChurnModalOpen(false);
  };

  // Push Rescue Email to Inbox as Draft
  const handlePushRescueToInbox = async () => {
    if (!selectedRecordForChurn || !churnPlaybook) return;
    await createInboxEmailFromDraft(activeCompanyId, userId, {
      sender: 'PRIME Executive AI',
      senderEmail: 'coo@prime.ai',
      subject: churnPlaybook.rescueEmailSubject,
      snippet: churnPlaybook.rescueEmailBody.slice(0, 120) + '...',
      fullBody: churnPlaybook.rescueEmailBody,
      urgency: 'HIGH',
      category: 'CLIENT',
      aiDraftReply: churnPlaybook.rescueEmailBody,
      aiKeyTakeaway: `Executive Churn Rescue for ${selectedRecordForChurn.accountName} ($${churnPlaybook.savedArr.toLocaleString()} ARR)`,
      aiSuggestedAction: `Rescue intervention playbook deployed with ${churnPlaybook.proposedConcession}`
    });
    setPushedToInboxId(selectedRecordForChurn.id);
    setTimeout(() => setPushedToInboxId(null), 3000);
  };

  // Trigger 1-Click AI Expansion Proposal
  const handleGenerateExpansionProposal = async (record: CRMRecord) => {
    setGeneratingExpansionId(record.id);
    try {
      const res = await fetch('/api/gemini/expansion-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          record,
          companyName: activeCompanyName,
        }),
      });

      if (!res.ok) throw new Error('Expansion proposal error');
      const proposal: ExpansionPlaybook = await res.json();
      setExpansionPlaybook(proposal);
      setSelectedRecordForExpansion(record);
      setExpansionModalOpen(true);
    } catch (err) {
      console.error('Expansion proposal error:', err);
    } finally {
      setGeneratingExpansionId(null);
    }
  };

  // Execute Expansion Upgrade
  const handleApplyExpansionUpgrade = async () => {
    if (!selectedRecordForExpansion || !expansionPlaybook) return;
    const updated = await applyExpansionUpgrade(activeCompanyId, records, selectedRecordForExpansion.id, expansionPlaybook);
    setRecords(updated);
    addActivityLog(
      userId,
      'RADAR_ACTION_TRIGGERED',
      'SaaS Account Upgraded',
      `Upgraded ${selectedRecordForExpansion.accountName} to ${expansionPlaybook.recommendedTier} (+${expansionPlaybook.expansionArrUplift.toLocaleString()} ARR uplift).`
    );
    setExpansionModalOpen(false);
  };

  // Push Expansion Pitch to Inbox
  const handlePushExpansionToInbox = async () => {
    if (!selectedRecordForExpansion || !expansionPlaybook) return;
    await createInboxEmailFromDraft(activeCompanyId, userId, {
      sender: 'PRIME Revenue AI',
      senderEmail: 'cro@prime.ai',
      subject: expansionPlaybook.proposalEmailSubject,
      snippet: expansionPlaybook.proposalEmailBody.slice(0, 120) + '...',
      fullBody: expansionPlaybook.proposalEmailBody,
      urgency: 'HIGH',
      category: 'CLIENT',
      aiDraftReply: expansionPlaybook.proposalEmailBody,
      aiKeyTakeaway: `Expansion upgrade offer for ${selectedRecordForExpansion.accountName} (+${expansionPlaybook.expansionArrUplift.toLocaleString()} ARR)`,
      aiSuggestedAction: `Deploy ${expansionPlaybook.recommendedTier} tier upsell`
    });
    setPushedToInboxId(selectedRecordForExpansion.id);
    setTimeout(() => setPushedToInboxId(null), 3000);
  };

  // Trigger 1-Click Dunning AI Recovery
  const handleGenerateDunningRecovery = async (item: DunningRecoveryItem) => {
    setGeneratingDunningId(item.id);
    try {
      const res = await fetch('/api/gemini/dunning-recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: item.customerName,
          customerEmail: item.customerEmail,
          failedAmount: item.failedAmount,
          companyName: activeCompanyName,
        }),
      });
      const data = await res.json();
      const updatedItem: DunningRecoveryItem = {
        ...item,
        recoveryEmailSubject: data.recoverySubject,
        recoveryEmailBody: data.recoveryBody,
        paymentUpdateUrl: data.paymentUpdateLink,
      };
      setSelectedDunning(updatedItem);
      setDunningModalOpen(true);
    } catch (e) {
      console.error('Dunning recovery error:', e);
    } finally {
      setGeneratingDunningId(null);
    }
  };

  // Mark Dunning Item Recovered
  const handleMarkDunningRecovered = (id: string) => {
    const updated = dunningItems.map(d => d.id === id ? { ...d, status: 'RECOVERED' as const, recoveredAt: new Date().toISOString() } : d);
    setDunningItems(updated);
    saveDunningRecoveries(activeCompanyId, updated);
    setDunningModalOpen(false);
  };

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Import rich sample data
  const handleImportSampleData = () => {
    const seed = getSampleEnterpriseCRMData(activeCompanyId, userId, activeCompanyName);
    saveRecordsToLocal(activeCompanyId, seed);
    setRecords(seed);
  };

  // Export SaaS Telemetry to CSV
  const handleExportCsv = () => {
    const headers = ['Account Name', 'Contact', 'Email', 'Plan', 'MRR ($)', 'ARR ($)', 'Health Score', 'Silence (Days)', 'Churn Prob (%)', 'Seats'];
    const rows = records.map(r => [
      `"${r.accountName}"`,
      `"${r.contactName}"`,
      `"${r.contactEmail}"`,
      `"${r.planTier || 'Pro'}"`,
      r.mrr || Math.round((r.dealValue || 0) / 12),
      r.dealValue || (r.mrr ? r.mrr * 12 : 0),
      r.healthScore,
      r.daysSinceLastContact,
      r.churnProbability || (r.healthScore < 50 ? 75 : 15),
      `"${r.seatsUsed || 0}/${r.seatsTotal || 0}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `saas_telemetry_${activeCompanyId}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Create new deal
  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecordData.accountName.trim() || !newRecordData.contactName.trim()) return;

    const dealVal = Number(newRecordData.dealValue) || (newRecordData.mrr * 12);
    const newRecord: CRMRecord = {
      id: 'crm_' + Date.now().toString(36),
      companyId: activeCompanyId,
      userId,
      accountName: newRecordData.accountName,
      contactName: newRecordData.contactName,
      contactEmail: newRecordData.contactEmail || 'contact@example.com',
      contactRole: newRecordData.contactRole || 'Executive Decision Maker',
      dealValue: dealVal,
      mrr: Number(newRecordData.mrr) || Math.round(dealVal / 12),
      planTier: newRecordData.planTier,
      seatsUsed: 15,
      seatsTotal: 20,
      activityDropPct: newRecordData.daysSinceLastContact > 10 ? -40 : 0,
      churnProbability: newRecordData.daysSinceLastContact > 10 ? 65 : 15,
      stage: newRecordData.stage,
      type: newRecordData.type,
      lastContactDate: new Date(Date.now() - newRecordData.daysSinceLastContact * 24 * 60 * 60 * 1000).toISOString(),
      daysSinceLastContact: Number(newRecordData.daysSinceLastContact) || 0,
      healthScore: newRecordData.daysSinceLastContact > 10 ? 45 : 85,
      riskFactors: newRecordData.daysSinceLastContact > 10 ? [`No contact in ${newRecordData.daysSinceLastContact} days`] : [],
      notes: newRecordData.notes,
      source: 'Direct Entry',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const saved = await saveCRMRecord(activeCompanyId, userId, newRecord);
    setRecords(prev => [saved, ...prev]);
    setNewRecordModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      {/* Top Banner / Breadcrumb & Global Action Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-white/5">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black shadow-[0_0_25px_rgba(255,215,0,0.25)]">
              <Radar className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  PRIME <span className="text-[#FFD700]">REVENUE &amp; SAAS RADAR</span>
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/10 text-[#FFD700] border border-amber-400/30">
                  Real-Time SaaS Defense
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/50">
                Autonomous Churn Prevention, Seat Expansion Radar, and Live Stripe MRR Telemetry with 1-Click AI Rescue Playbooks.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => setActiveTab('stripe_telemetry')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-sm ${
              activeTab === 'stripe_telemetry'
                ? 'bg-purple-950/40 border-purple-500/40 text-purple-200'
                : 'bg-[#141414] hover:bg-[#1C1C1C] border-white/10 text-white/80 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4 text-purple-400" />
            <span>Stripe Telemetry</span>
            {stripeConnected && (
              <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            )}
          </button>

          <button
            onClick={() => setSupabaseModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141414] hover:bg-[#1C1C1C] border border-white/10 text-white/80 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Supabase Sync</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#141414] hover:bg-[#1C1C1C] border border-white/10 text-white/80 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
            title="Export SaaS Telemetry CSV"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleImportSampleData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#141414] hover:bg-[#1C1C1C] border border-white/10 text-white/80 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
            title="Sync Enterprise CRM Telemetry"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Sync Pipeline</span>
          </button>

          <button
            onClick={() => setNewRecordModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFD700] hover:bg-[#FFE55C] text-black text-xs font-bold transition-all shadow-[0_0_20px_rgba(255,215,0,0.2)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Account</span>
          </button>

          <button
            onClick={loadData}
            title="Refresh Telemetry"
            className="p-2 rounded-xl bg-[#141414] hover:bg-[#1C1C1C] border border-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Real SaaS Metrics & Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* MRR */}
        <div className="p-4 rounded-2xl bg-[#0E0E0E] border border-white/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Monthly MRR</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-white font-mono">
            ${saasStats.mrr.toLocaleString()}
          </div>
          <p className="text-[10px] text-emerald-400 font-medium">
            ${saasStats.arr.toLocaleString()} ARR
          </p>
        </div>

        {/* Churn Risk ARR */}
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">At-Risk ARR</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-black text-white font-mono">
            ${saasStats.totalAtRiskArr.toLocaleString()}
          </div>
          <p className="text-[10px] text-rose-400 font-medium">
            {churnRisks.length} accounts slipping
          </p>
        </div>

        {/* Expansion ARR */}
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFD700]">Expansion ARR</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#FFD700]" />
          </div>
          <div className="text-xl font-black text-white font-mono">
            +${saasStats.totalExpansionArr.toLocaleString()}
          </div>
          <p className="text-[10px] text-amber-400 font-medium">
            {expansionTargets.length} ready to upgrade
          </p>
        </div>

        {/* NRR % */}
        <div className="p-4 rounded-2xl bg-[#0E0E0E] border border-white/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Net Retention (NRR)</span>
            <Percent className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-black text-white font-mono">
            {saasStats.nrr}%
          </div>
          <p className="text-[10px] text-blue-400 font-medium">
            Target: &gt;110% Top Quartile
          </p>
        </div>

        {/* Churn Rate */}
        <div className="p-4 rounded-2xl bg-[#0E0E0E] border border-white/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Churn Rate</span>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-black text-white font-mono">
            {saasStats.churnRate}%
          </div>
          <p className="text-[10px] text-white/40 font-medium">
            {saasStats.totalActiveSubscribers} Paid Clients
          </p>
        </div>

        {/* Delinquent / Dunning */}
        <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Failed Charges</span>
            <CreditCard className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-black text-white font-mono">
            ${dunningItems.filter(d => d.status === 'PENDING').reduce((s, d) => s + d.failedAmount, 0).toLocaleString()}
          </div>
          <p className="text-[10px] text-purple-400 font-medium">
            {dunningItems.filter(d => d.status === 'PENDING').length} delinquent invoices
          </p>
        </div>
      </div>

      {/* Main SaaS Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111111] p-2 rounded-2xl border border-white/5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('health_trends')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'health_trends'
                ? 'bg-gradient-to-r from-amber-400 to-[#FFD700] text-black shadow-[0_0_20px_rgba(255,215,0,0.35)]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className="w-4 h-4 text-black" />
            <span>30D Deal Health Trends</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'health_trends' ? 'bg-black/30 text-black' : 'bg-amber-400/20 text-[#FFD700]'
            }`}>
              {records.filter(r => r.stage !== 'Closed Lost').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('churn_rescue')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'churn_rescue'
                ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.35)]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>AI Churn Predictor &amp; Rescue</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'churn_rescue' ? 'bg-black/30 text-white' : 'bg-rose-500/20 text-rose-300'
            }`}>
              {churnRisks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('expansion_radar')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'expansion_radar'
                ? 'bg-[#FFD700] text-black shadow-[0_0_20px_rgba(255,215,0,0.35)]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-black" />
            <span>Expansion &amp; Upsell Radar</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'expansion_radar' ? 'bg-black/30 text-black' : 'bg-amber-400/20 text-[#FFD700]'
            }`}>
              {expansionTargets.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pql_signals')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'pql_signals'
                ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.35)]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>PLG &amp; PQL Signals</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'pql_signals' ? 'bg-black/30 text-black' : 'bg-cyan-500/20 text-cyan-300'
            }`}>
              {pqlSignals.filter(s => s.status === 'NEW_OPPORTUNITY' || s.status === 'PITCHED').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('renewal_defense')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'renewal_defense'
                ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.35)]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Swords className="w-4 h-4 text-indigo-400" />
            <span>Renewal &amp; Competitor Defense</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'renewal_defense' ? 'bg-black/30 text-white' : 'bg-indigo-500/20 text-indigo-300'
            }`}>
              {renewalItems.filter(r => r.status !== 'MULTI_YEAR_LOCKED').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('stripe_telemetry')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'stripe_telemetry'
                ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.35)]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Stripe Telemetry &amp; Dunning</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'stripe_telemetry' ? 'bg-black/30 text-white' : 'bg-purple-500/20 text-purple-300'
            }`}>
              {dunningItems.filter(d => d.status === 'PENDING').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('all_pipeline')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all_pipeline'
                ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>All Deals &amp; Pipeline</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'all_pipeline' ? 'bg-black/30 text-black' : 'bg-white/10 text-white/80'
            }`}>
              {records.length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search accounts..."
            className="w-full bg-[#181818] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#FFD700]/50"
          />
        </div>
      </div>

      {/* TAB 0: 30-DAY DEAL HEALTH SCORES TREND LINE (RECHARTS) */}
      {activeTab === 'health_trends' && (
        <div className="space-y-6">
          <DealHealthTrendChart 
            records={records} 
            onSelectRecord={(record) => {
              handleGenerateChurnRescue(record);
            }} 
          />
        </div>
      )}

      {/* TAB 1: AI CHURN PREDICTOR & AUTO-RESCUE */}
      {activeTab === 'churn_rescue' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  AI Churn Risk Diagnostics &amp; Auto-Rescue Engine
                </h3>
                <p className="text-xs text-white/50">
                  Accounts flagged by communication gaps (&gt;10d), login activity drops, or health degradation.
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-rose-400 font-bold block">
                ${saasStats.totalAtRiskArr.toLocaleString()} ARR At-Risk
              </span>
              <span className="text-[10px] text-white/40">
                {churnRisks.length} high priority accounts
              </span>
            </div>
          </div>

          {churnRisks.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#0E0E0E] border border-white/5 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Zero Critical Churn Risks Detected</h3>
              <p className="text-xs text-white/40 max-w-md mx-auto">
                All client accounts are healthy and actively engaged within the standard 10-day communication window.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {churnRisks.map((record) => {
                const isGenerating = generatingChurnId === record.id;
                const churnProb = record.churnProbability || (record.healthScore < 40 ? 82 : 55);

                return (
                  <div 
                    key={record.id} 
                    className="p-5 rounded-2xl bg-[#0E0E0E] border border-rose-500/30 hover:border-rose-500/60 transition-all flex flex-col justify-between space-y-4 shadow-[0_0_25px_rgba(244,63,94,0.06)]"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-white">{record.accountName}</h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              {churnProb}% Churn Risk
                            </span>
                          </div>
                          <p className="text-xs text-white/50">
                            {record.contactName} ({record.contactRole || 'Key Stakeholder'}) • {record.contactEmail}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-white font-mono block">
                            ${(record.mrr ? record.mrr : Math.round(record.dealValue / 12)).toLocaleString()}/mo
                          </span>
                          <span className="text-[10px] text-white/40">
                            ${record.dealValue.toLocaleString()} ARR
                          </span>
                        </div>
                      </div>

                      {/* Diagnostic Meters */}
                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 text-center">
                        <div>
                          <span className="text-[10px] text-white/40 block">Silence</span>
                          <span className="text-xs font-bold text-rose-400 font-mono">
                            {record.daysSinceLastContact} Days
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-white/40 block">Health Score</span>
                          <span className="text-xs font-bold text-amber-400 font-mono">
                            {record.healthScore}/100
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-white/40 block">Activity</span>
                          <span className="text-xs font-bold text-rose-400 font-mono">
                            {record.activityDropPct ? `${record.activityDropPct}%` : '-35%'}
                          </span>
                        </div>
                      </div>

                      {/* Risk factors */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Root Causes:</span>
                        <ul className="text-xs text-white/70 space-y-1">
                          {(record.riskFactors || []).map((rf, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-rose-400 mt-0.5">•</span>
                              <span>{rf}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="pt-2 border-t border-white/5 flex gap-2">
                      <button
                        onClick={() => handleGenerateChurnRescue(record)}
                        disabled={isGenerating}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.3)] cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                        <span>{isGenerating ? 'Analyzing Root Cause...' : '1-Click AI Auto-Rescue'}</span>
                      </button>

                      <button
                        onClick={async () => {
                          await markContactedToday(activeCompanyId, userId, record.id);
                          loadData();
                        }}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer border border-white/5"
                        title="Mark Contacted Today"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EXPANSION & UPSELL RADAR */}
      {activeTab === 'expansion_radar' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-[#FFD700]">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  SaaS Expansion &amp; Upsell Radar
                </h3>
                <p className="text-xs text-white/50">
                  Accounts reaching seat capacity (&gt;80%), power features, or ripe for Enterprise upgrades.
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#FFD700] font-bold block">
                +${saasStats.totalExpansionArr.toLocaleString()} Expansion Pipeline
              </span>
              <span className="text-[10px] text-white/40">
                {expansionTargets.length} expansion targets
              </span>
            </div>
          </div>

          {expansionTargets.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#0E0E0E] border border-white/5 space-y-3">
              <Sparkles className="w-10 h-10 text-amber-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No Immediate Upsell Triggers</h3>
              <p className="text-xs text-white/40 max-w-md mx-auto">
                Accounts are operating normally within their plan tier allocations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expansionTargets.map((record) => {
                const isGenerating = generatingExpansionId === record.id;
                const seatsUsed = record.seatsUsed || 18;
                const seatsTotal = record.seatsTotal || 20;
                const seatPct = Math.round((seatsUsed / seatsTotal) * 100);
                const expansionUplift = record.expansionPotentialArr || Math.round((record.dealValue || 36000) * 0.5);

                return (
                  <div 
                    key={record.id} 
                    className="p-5 rounded-2xl bg-[#0E0E0E] border border-amber-500/30 hover:border-amber-500/60 transition-all flex flex-col justify-between space-y-4 shadow-[0_0_25px_rgba(255,215,0,0.06)]"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-white">{record.accountName}</h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-400/20 text-[#FFD700] border border-amber-400/30">
                              {record.planTier || 'Pro Tier'}
                            </span>
                          </div>
                          <p className="text-xs text-white/50">
                            {record.contactName} • {record.contactEmail}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-[#FFD700] font-mono block">
                            +${expansionUplift.toLocaleString()} ARR
                          </span>
                          <span className="text-[10px] text-white/40">Expansion Value</span>
                        </div>
                      </div>

                      {/* Seat Capacity Bar */}
                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/60">Seat Capacity Utilization</span>
                          <span className="font-bold text-amber-400 font-mono">{seatsUsed} / {seatsTotal} seats ({seatPct}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${seatPct >= 90 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                            style={{ width: `${Math.min(100, seatPct)}%` }}
                          />
                        </div>
                      </div>

                      {/* Upgrade Pitch Angle */}
                      <div className="p-2.5 rounded-xl bg-amber-400/5 border border-amber-400/10 text-xs text-white/70">
                        <span className="font-bold text-[#FFD700]">Upgrade Catalyst: </span>
                        {record.notes || 'Reaching seat ceiling. Upgrade to Enterprise unlocks unlimited seats and dedicated VPC cluster.'}
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="pt-2 border-t border-white/5">
                      <button
                        onClick={() => handleGenerateExpansionProposal(record)}
                        disabled={isGenerating}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#FFD700] hover:bg-[#FFE55C] text-black text-xs font-black transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.25)] cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                        <span>{isGenerating ? 'Formulating Business Case...' : '1-Click Generate Expansion Proposal'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: PLG & PQL SIGNALS (PRODUCT-QUALIFIED LEADS) */}
      {activeTab === 'pql_signals' && (
        <div className="space-y-6">
          {/* PLG Telemetry Summary Header */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Total PQL Signals</span>
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-xl font-black text-white font-mono">{plgStats.totalPQLs} High-Intent Users</div>
              <p className="text-[10px] text-cyan-400 font-medium">{pqlSignals.filter(s => s.status === 'NEW_OPPORTUNITY').length} ready for upgrade pitch</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0E0E0E] border border-white/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Potential ARR Pipeline</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl font-black text-white font-mono">${plgStats.potentialArr.toLocaleString()}</div>
              <p className="text-[10px] text-emerald-400 font-medium">+${(plgStats.potentialArr / 12).toFixed(0)}/mo MRR expansion</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0E0E0E] border border-white/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Avg PQL Score</span>
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-xl font-black text-white font-mono">{plgStats.avgPQLScore}/100</div>
              <p className="text-[10px] text-white/40 font-medium">Weighted feature adoption score</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0E0E0E] border border-white/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Converted ARR</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl font-black text-white font-mono">${plgStats.convertedArr.toLocaleString()}</div>
              <p className="text-[10px] text-emerald-400 font-medium">{pqlSignals.filter(s => s.status === 'CONVERTED').length} converted to paid tier</p>
            </div>
          </div>

          {/* PQL Cards Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Real-Time Product-Qualified Leads (PQL Radar)</span>
                </h3>
                <p className="text-xs text-white/50">
                  Autonomous event telemetry tracking user workflow surges, onboarding milestones, and plan limit hits.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pqlSignals.map((signal) => {
                const isGenerating = generatingPqlId === signal.id;
                const isConverted = signal.status === 'CONVERTED';

                return (
                  <div
                    key={signal.id}
                    className={`p-5 rounded-3xl bg-[#0E0E0E] border transition-all space-y-4 flex flex-col justify-between ${
                      isConverted
                        ? 'border-emerald-500/30 opacity-80'
                        : signal.pqlScore >= 85
                        ? 'border-cyan-500/40 hover:border-cyan-500/70 shadow-[0_0_25px_rgba(6,182,212,0.1)]'
                        : 'border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-white">{signal.userName}</h4>
                            <span className="text-xs text-white/50">({signal.accountName})</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              signal.status === 'CONVERTED'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : signal.status === 'PITCHED'
                                ? 'bg-amber-400/20 text-[#FFD700] border border-amber-400/30'
                                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            }`}>
                              {signal.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-white/50 font-mono mt-0.5">{signal.userEmail}</p>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-1.5 justify-end">
                            <span className="text-xs font-mono font-bold text-white/40">{signal.currentPlan}</span>
                            <ArrowRight className="w-3 h-3 text-cyan-400" />
                            <span className="text-xs font-mono font-black text-cyan-400">{signal.targetPlan}</span>
                          </div>
                          <span className="text-sm font-black text-emerald-400 font-mono block mt-0.5">
                            +${signal.estimatedArrUplift.toLocaleString()} ARR
                          </span>
                        </div>
                      </div>

                      {/* Behavioral Catalyst Banner */}
                      <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>PQL TRIGGER CATALYST</span>
                          </span>
                          <span className="font-mono font-bold text-white">Score: {signal.pqlScore}/100</span>
                        </div>
                        <p className="text-xs text-white/80 leading-relaxed font-medium">
                          {signal.pqlTriggerReason}
                        </p>
                      </div>

                      {/* Onboarding & Telemetry Stats */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                          <span className="text-[10px] text-white/40 block font-bold">Onboarding</span>
                          <span className="font-mono font-bold text-white">{signal.onboardingProgress}% Complete</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                          <span className="text-[10px] text-white/40 block font-bold">User Sentiment</span>
                          <span className={`font-mono font-bold ${
                            signal.sentimentScore >= 8 ? 'text-emerald-400' : 'text-amber-400'
                          }`}>
                            {signal.sentimentLabel} ({signal.sentimentScore}/10)
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                          <span className="text-[10px] text-white/40 block font-bold">Event Volume</span>
                          <span className="font-mono font-bold text-cyan-400">
                            {signal.recentEvents?.reduce((sum, e) => sum + (e.count || 1), 0) || 0} events/wk
                          </span>
                        </div>
                      </div>

                      {/* Recent In-App Events Pill List */}
                      {signal.recentEvents && signal.recentEvents.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Top In-App Events:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {signal.recentEvents.map((evt, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-white/70 font-mono">
                                {evt.eventName} {evt.count ? <strong className="text-cyan-400">×{evt.count}</strong> : null}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-white/5 flex gap-2">
                      {!isConverted ? (
                        <>
                          <button
                            onClick={() => handleGeneratePQLPitch(signal)}
                            disabled={isGenerating}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-black transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer disabled:opacity-50"
                          >
                            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                            <span>{isGenerating ? 'Drafting Conversion Pitch...' : '1-Click AI Conversion Pitch'}</span>
                          </button>

                          <button
                            onClick={() => handleConvertPQL(signal)}
                            className="py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Upgraded</span>
                          </button>
                        </>
                      ) : (
                        <div className="w-full py-2 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center text-xs font-bold text-emerald-400 flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Successfully Converted to {signal.targetPlan} (+$${signal.estimatedArrUplift.toLocaleString()} ARR)</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB: RENEWAL & COMPETITOR DEFENSE PRE-EMPTOR */}
      {activeTab === 'renewal_defense' && (
        <div className="space-y-6">
          {/* Renewal Defense Telemetry Summary Header */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">ARR At Renewal Stake</span>
                <CalendarCheck className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="text-xl font-black text-white font-mono">${renewalStats.totalRenewalArrAtStake.toLocaleString()}</div>
              <p className="text-[10px] text-indigo-300 font-medium">{renewalStats.upcomingRenewalsCount} enterprise contracts expiring &lt;90 days</p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Competitor Poach Threat</span>
                <Swords className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="text-xl font-black text-white font-mono">${renewalStats.competitorAttackedArr.toLocaleString()}</div>
              <p className="text-[10px] text-rose-400 font-medium">Under active competitor discount attack</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Multi-Year Locked ARR</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl font-black text-white font-mono">${renewalStats.multiYearLockedArr.toLocaleString()}</div>
              <p className="text-[10px] text-emerald-400 font-medium">Locked in 2-3 yr multi-year guarantees</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0E0E0E] border border-white/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Net Revenue Retention</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl font-black text-white font-mono">{renewalStats.projectedNrrImpact}% NRR</div>
              <p className="text-[10px] text-emerald-400 font-medium">Zero churn renewal pre-emption mode</p>
            </div>
          </div>

          {/* Renewal Cards Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Swords className="w-4 h-4 text-indigo-400" />
                  <span>Contract Renewal Pre-emption &amp; Competitor Counter-Strike Radar</span>
                </h3>
                <p className="text-xs text-white/50">
                  Pre-empts client churn 60-90 days before annual contract expiry, neutralizes predatory competitor discounting, and locks multi-year contracts.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {renewalItems.map((item) => {
                const isGenerating = generatingRenewalId === item.id;
                const isLocked = item.status === 'MULTI_YEAR_LOCKED';
                const hasThreat = Boolean(item.competitorThreat);

                return (
                  <div
                    key={item.id}
                    className={`p-5 rounded-3xl bg-[#0E0E0E] border transition-all space-y-4 flex flex-col justify-between ${
                      isLocked
                        ? 'border-emerald-500/40 bg-emerald-950/10'
                        : hasThreat
                        ? 'border-rose-500/40 hover:border-rose-500/70 shadow-[0_0_30px_rgba(244,63,94,0.12)]'
                        : 'border-indigo-500/30 hover:border-indigo-500/60'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-white">{item.accountName}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isLocked
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : hasThreat
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                            }`}>
                              {isLocked ? `${item.lockInTermYears}-YR LOCKED` : hasThreat ? 'COMPETITOR ATTACK' : 'RENEWAL PRE-EMPT'}
                            </span>
                          </div>
                          <p className="text-xs text-white/60 mt-0.5">
                            {item.decisionMakerName} • <span className="text-white/40">{item.decisionMakerRole}</span>
                          </p>
                          <p className="text-[11px] text-white/40 font-mono">{item.decisionMakerEmail}</p>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-black text-white font-mono block">
                            ${item.contractArr.toLocaleString()}/yr
                          </span>
                          <span className={`text-[11px] font-bold font-mono block mt-0.5 ${
                            item.daysUntilRenewal <= 30 ? 'text-rose-400' : item.daysUntilRenewal <= 60 ? 'text-amber-400' : 'text-indigo-400'
                          }`}>
                            Expires in {item.daysUntilRenewal} days
                          </span>
                        </div>
                      </div>

                      {/* Historical Value Delivered Banner */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 space-y-0.5">
                          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            <span>Financial ROI Saved</span>
                          </span>
                          <span className="font-mono font-black text-white text-sm">
                            ${item.historicalRoiDollarsSaved.toLocaleString()}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 space-y-0.5">
                          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Automated Hours</span>
                          </span>
                          <span className="font-mono font-black text-white text-sm">
                            {item.historicalHoursSaved} hrs
                          </span>
                        </div>
                      </div>

                      {/* Competitor Threat Box (If Active Poaching) */}
                      {item.competitorThreat && !isLocked && (
                        <div className="p-3.5 rounded-2xl bg-rose-950/25 border border-rose-500/40 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-rose-400 flex items-center gap-1.5">
                              <Swords className="w-3.5 h-3.5" />
                              <span>COMPETITOR POACHING ATTEMPT: {item.competitorThreat.competitorName}</span>
                            </span>
                            <span className="font-mono text-rose-300 font-bold text-[11px]">
                              {item.competitorThreat.estimatedPriceGap < 0 ? `Price Cut: ${item.competitorThreat.estimatedPriceGap.toLocaleString()}` : ''}
                            </span>
                          </div>
                          <p className="text-xs text-white/80 font-medium">
                            {item.competitorThreat.perceivedAdvantage}
                          </p>
                          <div className="pt-2 border-t border-rose-500/20 space-y-1">
                            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Competitor Weaknesses to Exploit:</span>
                            <ul className="space-y-1 text-[11px] text-white/70">
                              {item.competitorThreat.criticalWeaknesses.map((w, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-rose-400 font-bold">✕</span>
                                  <span>{w}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Multi-Year Locked Status Banner */}
                      {isLocked && (
                        <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                            <ShieldCheck className="w-4 h-4" />
                            <span>{item.lockInTermYears}-Year Contract Locked &amp; Protected</span>
                          </div>
                          <p className="text-xs text-white/70">
                            Guaranteed rate lock of <strong className="text-white font-mono">${(item.multiYearArrTotal || item.contractArr * 2).toLocaleString()}</strong> with zero price volatility. Competitor threat neutralized.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row gap-2">
                      {!isLocked ? (
                        <>
                          <button
                            onClick={() => handleGenerateRenewalDefense(item)}
                            disabled={isGenerating}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-black transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)] cursor-pointer disabled:opacity-50"
                          >
                            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                            <span>{isGenerating ? 'Drafting Defense Playbook...' : '1-Click AI Counter-Strike & ROI'}</span>
                          </button>

                          <button
                            onClick={() => handleLockInMultiYear(item, 2)}
                            className="py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>2-Yr Lock-In</span>
                          </button>

                          <button
                            onClick={() => handleLockInMultiYear(item, 3)}
                            className="py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>3-Yr Lock-In</span>
                          </button>
                        </>
                      ) : (
                        <div className="w-full py-2 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center text-xs font-bold text-emerald-400 flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Active Multi-Year Contract (${(item.multiYearArrTotal || item.contractArr * 2).toLocaleString()} Secured)</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STRIPE TELEMETRY & DUNNING RECOVERY */}
      {activeTab === 'stripe_telemetry' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Stripe Subscriptions &amp; Automated Dunning Engine
                </h3>
                <p className="text-xs text-white/50">
                  Real-time invoice telemetry, automated failed credit card recovery, and payment portal links.
                </p>
              </div>
            </div>
            <button
              onClick={() => setStripeConnected(!stripeConnected)}
              className={`px-3 py-1.5 rounded-xl text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer ${
                stripeConnected ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {stripeConnected ? 'Telemetry Active ✓' : 'Connect Telemetry'}
            </button>
          </div>

          {/* Dunning / Failed Charges Queue */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/60">
                Delinquent Invoices &amp; Recovery Queue ({dunningItems.filter(d => d.status === 'PENDING').length})
              </h4>
            </div>

            {dunningItems.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#0E0E0E] border border-white/5 text-xs text-white/40">
                All subscriptions are currently paid in full. No failed payments in queue.
              </div>
            ) : (
              <div className="space-y-2">
                {dunningItems.map((item) => (
                  <div 
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#0E0E0E] border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold text-white">{item.customerName}</h5>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'RECOVERED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {item.status === 'RECOVERED' ? 'RECOVERED' : 'PAST DUE'}
                        </span>
                      </div>
                      <p className="text-xs text-white/50">
                        {item.customerEmail} • {item.planName} Plan • {item.retryAttempts} charge attempts failed
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-sm font-black text-rose-400 font-mono block">
                          ${item.failedAmount.toLocaleString()} USD
                        </span>
                        <span className="text-[10px] text-white/40">Failed Invoice</span>
                      </div>

                      {item.status === 'PENDING' && (
                        <button
                          onClick={() => handleGenerateDunningRecovery(item)}
                          disabled={generatingDunningId === item.id}
                          className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>1-Click AI Dunning</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ALL PIPELINE & HOT DEALS */}
      {activeTab === 'all_pipeline' && (
        <div className="space-y-6">
          <DealHealthTrendChart 
            records={records} 
            onSelectRecord={(deal) => handleGenerateChurnRescue(deal)} 
          />

          <div className="flex items-center justify-between pt-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/60">
              Active Pipeline Deals ({filteredRecords.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredRecords.map((deal) => {
              const isAtRisk = deal.daysSinceLastContact > 10;
              return (
                <div 
                  key={deal.id}
                  className="p-5 rounded-2xl bg-[#0E0E0E] border border-white/5 hover:border-white/20 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">{deal.accountName}</h4>
                        <p className="text-xs text-white/50">{deal.contactName}</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#FFD700]">
                        ${deal.dealValue.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-white/70">
                        {deal.stage}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isAtRisk ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {deal.daysSinceLastContact}d silent
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex gap-2">
                    <button
                      onClick={() => handleGenerateChurnRescue(deal)}
                      className="flex-1 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-semibold transition-all"
                    >
                      AI Playbook
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: 1-CLICK AI CHURN AUTO-RESCUE */}
      {churnModalOpen && churnPlaybook && selectedRecordForChurn && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-[#121212] border border-rose-500/40 p-6 sm:p-7 space-y-6 shadow-[0_0_50px_rgba(244,63,94,0.2)] animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    1-Click Auto-Rescue: {selectedRecordForChurn.accountName}
                  </h3>
                  <p className="text-xs text-rose-400">
                    {churnPlaybook.churnProbability}% Churn Probability • ${churnPlaybook.savedArr.toLocaleString()} ARR At-Risk
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setChurnModalOpen(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Retention Diagnosis */}
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>DIAGNOSTIC STRATEGY</span>
              </div>
              <p className="text-white/80 leading-relaxed">
                {churnPlaybook.rescueStrategy}
              </p>
              <div className="pt-2 border-t border-rose-500/20">
                <span className="text-rose-300 font-bold">Proposed Retention Concession: </span>
                <span className="text-white font-medium">{churnPlaybook.proposedConcession}</span>
              </div>
            </div>

            {/* Auto-Drafted Rescue Email */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white/60">
                  Ready-to-Send Executive Rescue Email
                </label>
                <button
                  onClick={() => copyToClipboard(churnPlaybook.rescueEmailBody, 'rescue_email')}
                  className="flex items-center gap-1 text-[11px] text-[#FFD700] hover:underline cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedText === 'rescue_email' ? 'Copied!' : 'Copy Email'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3 font-mono text-xs text-white/90">
                <div className="text-white/40">
                  Subject: <span className="text-white font-semibold">{churnPlaybook.rescueEmailSubject}</span>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed border-t border-white/5 pt-2 text-white/80">
                  {churnPlaybook.rescueEmailBody}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handlePushRescueToInbox}
                className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10"
              >
                <Mail className="w-4 h-4 text-[#FFD700]" />
                <span>{pushedToInboxId === selectedRecordForChurn.id ? 'Pushed to Inbox Drafts!' : 'Push as Priority Draft to Inbox'}</span>
              </button>

              <button
                onClick={handleApplyChurnRescueAction}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(16,185,129,0.3)]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply Concession &amp; Mark Stabilized</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: 1-CLICK AI EXPANSION PROPOSAL */}
      {expansionModalOpen && expansionPlaybook && selectedRecordForExpansion && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-[#121212] border border-amber-500/40 p-6 sm:p-7 space-y-6 shadow-[0_0_50px_rgba(255,215,0,0.2)] animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-[#FFD700] flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Expansion Proposal: {selectedRecordForExpansion.accountName}
                  </h3>
                  <p className="text-xs text-[#FFD700]">
                    Recommended: {expansionPlaybook.recommendedTier} (+${expansionPlaybook.expansionArrUplift.toLocaleString()} ARR Uplift)
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setExpansionModalOpen(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ROI Calculation */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2 text-xs">
              <span className="font-bold text-[#FFD700] uppercase tracking-wider block">Business Case &amp; ROI</span>
              <p className="text-white/90 leading-relaxed font-medium">
                {expansionPlaybook.roiSummary}
              </p>
              <ul className="text-white/70 space-y-1 pt-1 border-t border-amber-500/20">
                {expansionPlaybook.businessCaseDeckPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#FFD700]">✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Proposal Email */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white/60">
                  Generated Executive Pitch Email
                </label>
                <button
                  onClick={() => copyToClipboard(expansionPlaybook.proposalEmailBody, 'expansion_email')}
                  className="flex items-center gap-1 text-[11px] text-[#FFD700] hover:underline cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedText === 'expansion_email' ? 'Copied!' : 'Copy Email'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3 font-mono text-xs text-white/90">
                <div className="text-white/40">
                  Subject: <span className="text-white font-semibold">{expansionPlaybook.proposalEmailSubject}</span>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed border-t border-white/5 pt-2 text-white/80">
                  {expansionPlaybook.proposalEmailBody}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handlePushExpansionToInbox}
                className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10"
              >
                <Mail className="w-4 h-4 text-[#FFD700]" />
                <span>{pushedToInboxId === selectedRecordForExpansion.id ? 'Pushed to Inbox Drafts!' : 'Push as Expansion Draft to Inbox'}</span>
              </button>

              <button
                onClick={handleApplyExpansionUpgrade}
                className="flex-1 py-3 px-4 rounded-xl bg-[#FFD700] hover:bg-[#FFE55C] text-black text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(255,215,0,0.3)]"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Upgrade Account to Enterprise</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: 1-CLICK DUNNING RECOVERY */}
      {dunningModalOpen && selectedDunning && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-3xl bg-[#121212] border border-purple-500/40 p-6 sm:p-7 space-y-6 shadow-[0_0_50px_rgba(168,85,247,0.2)] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Recover Payment: {selectedDunning.customerName}
                  </h3>
                  <p className="text-xs text-purple-400">
                    Failed Invoice: ${selectedDunning.failedAmount.toLocaleString()} USD
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setDunningModalOpen(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60">
                Generated Recovery Email
              </label>
              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2 text-xs font-mono text-white/80">
                <div className="text-white/40">Subject: <span className="text-white">{selectedDunning.recoveryEmailSubject}</span></div>
                <div className="whitespace-pre-wrap pt-2 border-t border-white/5">
                  {selectedDunning.recoveryEmailBody}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => copyToClipboard(selectedDunning.recoveryEmailBody || '', 'dunning_email')}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
              >
                {copiedText === 'dunning_email' ? 'Copied!' : 'Copy Recovery Email'}
              </button>

              <button
                onClick={() => handleMarkDunningRecovered(selectedDunning.id)}
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] cursor-pointer"
              >
                Mark Payment Recovered ($+{selectedDunning.failedAmount.toLocaleString()})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: 1-CLICK AI PQL CONVERSION PITCH */}
      {pqlPitchModalOpen && selectedPql && selectedPql.aiConversionPitch && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-[#121212] border border-cyan-500/40 p-6 sm:p-7 space-y-6 shadow-[0_0_50px_rgba(6,182,212,0.2)] animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    PQL Upgrade Pitch: {selectedPql.userName}
                  </h3>
                  <p className="text-xs text-cyan-400">
                    {selectedPql.accountName} • {selectedPql.currentPlan} → {selectedPql.targetPlan} (+$${selectedPql.estimatedArrUplift.toLocaleString()} ARR)
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setPqlPitchModalOpen(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Catalyst and Offer */}
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2 text-xs">
              <div className="flex items-center justify-between text-cyan-400 font-bold">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>RECOMMENDED CONVERSION OFFER</span>
                </div>
                <span className="font-mono text-white">Score: {selectedPql.pqlScore}/100</span>
              </div>
              <p className="text-white font-medium text-sm">
                {selectedPql.aiConversionPitch.suggestedOffer}
              </p>
              <div className="pt-2 border-t border-cyan-500/20 flex flex-wrap gap-2 text-[11px]">
                {selectedPql.aiConversionPitch.talkingPoints.map((tp, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-black/40 border border-cyan-500/30 text-white/80">
                    ✓ {tp}
                  </span>
                ))}
              </div>
            </div>

            {/* In-App / Email Pitch Body */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white/60">
                  Ready-to-Deploy Outreach &amp; In-App Pitch
                </label>
                <button
                  onClick={() => copyToClipboard(selectedPql.aiConversionPitch?.body || '', 'pql_email')}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedText === 'pql_email' ? 'Copied!' : 'Copy Pitch'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3 font-mono text-xs text-white/90">
                <div className="text-white/40">
                  Subject: <span className="text-white font-semibold">{selectedPql.aiConversionPitch.subject}</span>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed border-t border-white/5 pt-2 text-white/80">
                  {selectedPql.aiConversionPitch.body}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handlePushPQLToInbox}
                className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10"
              >
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>{pushedToInboxId === selectedPql.id ? 'Pushed to Inbox Drafts!' : 'Push as Priority Outreach to Inbox'}</span>
              </button>

              <button
                onClick={() => handleConvertPQL(selectedPql)}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(16,185,129,0.3)]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Convert to {selectedPql.targetPlan} (+$${selectedPql.estimatedArrUplift.toLocaleString()} ARR)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: 1-CLICK AI COMPETITOR COUNTER-STRIKE & RENEWAL DEFENSE */}
      {renewalDefenseModalOpen && selectedRenewal && selectedRenewal.aiDefenseStrategy && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-3xl bg-[#121212] border border-indigo-500/40 p-6 sm:p-7 space-y-6 shadow-[0_0_60px_rgba(99,102,241,0.25)] animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Swords className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Competitor Counter-Strike &amp; Renewal Defense: {selectedRenewal.accountName}
                  </h3>
                  <p className="text-xs text-indigo-300">
                    {selectedRenewal.decisionMakerName} ({selectedRenewal.decisionMakerRole}) • ${selectedRenewal.contractArr.toLocaleString()}/yr • Expires in {selectedRenewal.daysUntilRenewal} days
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setRenewalDefenseModalOpen(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ROI Executive Value Realization */}
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-wider">
                <Award className="w-4 h-4" />
                <span>Executive Value Realization &amp; Financial Impact</span>
              </div>
              <p className="text-white/90 leading-relaxed font-medium">
                {selectedRenewal.aiDefenseStrategy.roiExecutiveSummary}
              </p>
            </div>

            {/* Competitor Counter-Strike & Battle Points */}
            <div className="p-4 rounded-2xl bg-rose-950/25 border border-rose-500/30 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider">
                <Swords className="w-4 h-4" />
                <span>Competitor Neutralization Strategy</span>
              </div>
              <p className="text-white/90 leading-relaxed font-medium">
                {selectedRenewal.aiDefenseStrategy.competitorCounterStrike}
              </p>
              <div className="pt-2 border-t border-rose-500/20 space-y-1">
                <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">Executive Talking Points:</span>
                <ul className="space-y-1 text-[11px] text-white/80">
                  {selectedRenewal.aiDefenseStrategy.battleCardTalkingPoints.map((tp, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-400 font-bold">✓</span>
                      <span>{tp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommended Multi-Year Lock-In Concession */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-[#FFD700] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Recommended Multi-Year Lock-in Concession</span>
              </div>
              <p className="text-white/90 leading-relaxed font-medium">
                {selectedRenewal.aiDefenseStrategy.multiYearOfferProposal}
              </p>
            </div>

            {/* Executive Outreach Email Draft */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white/60">
                  C-Level Executive Outreach &amp; Lock-in Proposal
                </label>
                <button
                  onClick={() => copyToClipboard(selectedRenewal.aiDefenseStrategy?.executiveOutreachBody || '', 'renewal_email')}
                  className="flex items-center gap-1 text-[11px] text-indigo-400 hover:underline cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedText === 'renewal_email' ? 'Copied!' : 'Copy Email'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3 font-mono text-xs text-white/90">
                <div className="text-white/40">
                  Subject: <span className="text-white font-semibold">{selectedRenewal.aiDefenseStrategy.executiveOutreachSubject}</span>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed border-t border-white/5 pt-2 text-white/80">
                  {selectedRenewal.aiDefenseStrategy.executiveOutreachBody}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handlePushRenewalToInbox}
                className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10"
              >
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>{pushedToInboxId === selectedRenewal.id ? 'Pushed to Inbox Drafts!' : 'Push as Priority Outreach to Inbox'}</span>
              </button>

              <button
                onClick={() => handleLockInMultiYear(selectedRenewal, 2)}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(16,185,129,0.3)]"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Lock 2-Year Contract (${(selectedRenewal.contractArr * 2).toLocaleString()})</span>
              </button>

              <button
                onClick={() => handleLockInMultiYear(selectedRenewal, 3)}
                className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(99,102,241,0.3)]"
              >
                <Award className="w-4 h-4" />
                <span>Lock 3-Year Contract (${(selectedRenewal.contractArr * 3).toLocaleString()})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: SUPABASE CRM CONFIGURATION */}
      {supabaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#121212] border border-emerald-500/40 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Supabase CRM Sync</h3>
              </div>
              <button 
                onClick={() => setSupabaseModalOpen(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-white/60 font-bold">Supabase URL</label>
                <input
                  type="text"
                  value={supabaseConfig.url}
                  onChange={(e) => setSupabaseConfigState({ ...supabaseConfig, url: e.target.value })}
                  placeholder="https://xyz.supabase.co"
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/60 font-bold">Anon Public Key</label>
                <input
                  type="password"
                  value={supabaseConfig.anonKey}
                  onChange={(e) => setSupabaseConfigState({ ...supabaseConfig, anonKey: e.target.value })}
                  placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <button
              onClick={() => {
                saveSupabaseConfig(supabaseConfig);
                loadData();
                setSupabaseModalOpen(false);
              }}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
            >
              Save &amp; Fetch Supabase Deals
            </button>
          </div>
        </div>
      )}

      {/* MODAL 6: ADD NEW CRM / SAAS ACCOUNT */}
      {newRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateRecord} className="w-full max-w-lg rounded-3xl bg-[#121212] border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Add SaaS / CRM Account</h3>
              <button 
                type="button" 
                onClick={() => setNewRecordModalOpen(false)}
                className="p-1 text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-white/60 font-bold">Account / Company Name *</label>
                <input
                  type="text"
                  required
                  value={newRecordData.accountName}
                  onChange={(e) => setNewRecordData({ ...newRecordData, accountName: e.target.value })}
                  placeholder="Acme Corp"
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/60 font-bold">Contact Name *</label>
                <input
                  type="text"
                  required
                  value={newRecordData.contactName}
                  onChange={(e) => setNewRecordData({ ...newRecordData, contactName: e.target.value })}
                  placeholder="John Doe"
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/60 font-bold">Contact Email</label>
                <input
                  type="email"
                  value={newRecordData.contactEmail}
                  onChange={(e) => setNewRecordData({ ...newRecordData, contactEmail: e.target.value })}
                  placeholder="john@acme.com"
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/60 font-bold">Monthly MRR ($)</label>
                <input
                  type="number"
                  value={newRecordData.mrr}
                  onChange={(e) => {
                    const m = Number(e.target.value);
                    setNewRecordData({ ...newRecordData, mrr: m, dealValue: m * 12 });
                  }}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/60 font-bold">Plan Tier</label>
                <select
                  value={newRecordData.planTier}
                  onChange={(e: any) => setNewRecordData({ ...newRecordData, planTier: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Starter">Starter ($1,499/mo)</option>
                  <option value="Pro">Pro ($2,999/mo)</option>
                  <option value="Enterprise">Enterprise ($4,999/mo)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-white/60 font-bold">Days Since Last Contact</label>
                <input
                  type="number"
                  value={newRecordData.daysSinceLastContact}
                  onChange={(e) => setNewRecordData({ ...newRecordData, daysSinceLastContact: Number(e.target.value) })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#FFD700] hover:bg-[#FFE55C] text-black text-xs font-bold transition-all shadow-[0_0_20px_rgba(255,215,0,0.2)] cursor-pointer"
            >
              Save SaaS Deal
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
