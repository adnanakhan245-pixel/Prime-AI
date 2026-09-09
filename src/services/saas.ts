import { 
  CRMRecord, 
  ChurnRescuePlaybook, 
  ExpansionPlaybook, 
  DunningRecoveryItem, 
  SaaSTelemetryStats,
  PQLSignal,
  PLGTelemetryStats,
  InAppEvent,
  RenewalDefenseItem,
  RenewalDefenseStats
} from '../types';
import { getSupabaseClient, saveRecordsToLocal } from './crm';

const DUNNING_STORAGE_KEY_PREFIX = 'prime_dunning_company_';
const PQL_STORAGE_KEY_PREFIX = 'prime_pql_company_';
const EVENTS_STORAGE_KEY_PREFIX = 'prime_events_company_';
const RENEWAL_STORAGE_KEY_PREFIX = 'prime_renewal_company_';

// Calculate Real-Time SaaS Telemetry from CRM & Subscriptions
export function calculateSaaSTelemetry(records: CRMRecord[]): SaaSTelemetryStats {
  const activeClients = records.filter(r => r.type === 'CLIENT' || r.stage === 'Active Client' || r.stage === 'Closed Won');
  
  // Total MRR calculation
  const totalMrr = activeClients.reduce((sum, r) => {
    if (r.mrr && r.mrr > 0) return sum + r.mrr;
    // Fallback: estimate MRR from annual deal value
    return sum + Math.round((r.dealValue || 0) / 12);
  }, 0);

  const totalArr = totalMrr * 12;

  // At-Risk ARR (Clients silent > 10 days or health score < 60 or churn probability > 40%)
  const atRiskClients = activeClients.filter(r => 
    r.daysSinceLastContact > 10 || 
    r.healthScore < 60 || 
    (r.churnProbability && r.churnProbability >= 40)
  );
  const totalAtRiskArr = atRiskClients.reduce((sum, r) => sum + (r.dealValue || (r.mrr ? r.mrr * 12 : 0)), 0);

  // Expansion Potential ARR
  const expansionClients = activeClients.filter(r => 
    (r.seatsUsed && r.seatsTotal && (r.seatsUsed / r.seatsTotal) >= 0.8) ||
    (r.expansionPotentialArr && r.expansionPotentialArr > 0) ||
    r.planTier === 'Starter' ||
    r.planTier === 'Pro'
  );
  const totalExpansionArr = expansionClients.reduce((sum, r) => {
    if (r.expansionPotentialArr && r.expansionPotentialArr > 0) return sum + r.expansionPotentialArr;
    return sum + Math.round((r.dealValue || 30000) * 0.4); // 40% upgrade uplift
  }, 0);

  // Failed payment ARR (dunning)
  const failedClients = activeClients.filter(r => r.stripeStatus === 'past_due' || (r.failedPaymentAmount && r.failedPaymentAmount > 0));
  const totalFailedPaymentArr = failedClients.reduce((sum, r) => sum + (r.failedPaymentAmount ? r.failedPaymentAmount * 12 : 0), 0);

  // Churn Rate estimate: ratio of at-risk accounts vs total active clients
  const churnRate = activeClients.length > 0 
    ? Math.min(100, Math.round((atRiskClients.length / activeClients.length) * 100 * 0.25 * 10) / 10) 
    : 0;

  // Net Revenue Retention (NRR): (Base + Expansion - Churn) / Base
  const nrr = activeClients.length > 0 && totalArr > 0
    ? Math.round(((totalArr + (totalExpansionArr * 0.3) - (totalAtRiskArr * 0.2)) / totalArr) * 100)
    : 100;

  const arpu = activeClients.length > 0 ? Math.round(totalMrr / activeClients.length) : 0;
  const ltv = arpu > 0 ? Math.round(arpu * (1 / (Math.max(0.02, churnRate / 100)))) : 0;

  return {
    mrr: totalMrr,
    arr: totalArr,
    nrr: Math.max(80, Math.min(160, nrr)),
    churnRate,
    arpu,
    ltv,
    totalActiveSubscribers: activeClients.length,
    totalAtRiskArr,
    totalExpansionArr,
    totalFailedPaymentArr
  };
}

// Filter high-risk SaaS accounts requiring immediate AI rescue
export function filterSaaSChurnRisks(records: CRMRecord[]): CRMRecord[] {
  return records.filter(r => {
    const isClient = r.type === 'CLIENT' || r.stage === 'Active Client';
    const isSilent = r.daysSinceLastContact > 10;
    const isUnhealthy = r.healthScore < 60;
    const highChurnProb = (r.churnProbability ?? 0) >= 40;
    const activityDrop = (r.activityDropPct ?? 0) <= -25;
    return isClient && (isSilent || isUnhealthy || highChurnProb || activityDrop);
  }).sort((a, b) => (b.dealValue || 0) - (a.dealValue || 0));
}

// Filter expansion & upsell ready accounts
export function filterSaaSExpansionTargets(records: CRMRecord[]): CRMRecord[] {
  return records.filter(r => {
    const isClient = r.type === 'CLIENT' || r.stage === 'Active Client';
    const nearSeatLimit = r.seatsUsed && r.seatsTotal ? (r.seatsUsed / r.seatsTotal) >= 0.75 : false;
    const hasExpansionVal = (r.expansionPotentialArr ?? 0) > 0;
    const isGoodHealth = r.healthScore >= 65;
    return isClient && isGoodHealth && (nearSeatLimit || hasExpansionVal || r.planTier === 'Starter' || r.planTier === 'Pro');
  }).sort((a, b) => (b.expansionPotentialArr || b.dealValue || 0) - (a.expansionPotentialArr || a.dealValue || 0));
}

// Retrieve or generate dunning recovery items for a company
export function getDunningRecoveries(companyId: string): DunningRecoveryItem[] {
  try {
    const local = localStorage.getItem(DUNNING_STORAGE_KEY_PREFIX + companyId);
    if (local) {
      return JSON.parse(local);
    }
  } catch (e) {}
  return [];
}

export function saveDunningRecoveries(companyId: string, items: DunningRecoveryItem[]): void {
  try {
    localStorage.setItem(DUNNING_STORAGE_KEY_PREFIX + companyId, JSON.stringify(items));
  } catch (e) {}
}

// Mark an at-risk client as successfully rescued by AI
export async function applyChurnRescue(
  companyId: string, 
  records: CRMRecord[], 
  recordId: string, 
  playbook: ChurnRescuePlaybook
): Promise<CRMRecord[]> {
  const updated = records.map(r => {
    if (r.id === recordId) {
      return {
        ...r,
        healthScore: Math.min(95, r.healthScore + 35),
        daysSinceLastContact: 0,
        lastContactDate: new Date().toISOString(),
        churnProbability: Math.max(5, (r.churnProbability || 50) - 40),
        activityDropPct: 0,
        churnRescuePlaybook: playbook,
        riskFactors: [`AI Auto-Rescue Applied: ${playbook.proposedConcession}`],
        notes: `${r.notes || ''}\n[AI Rescue Executed ${new Date().toLocaleDateString()}]: ${playbook.headline}`,
        updatedAt: new Date().toISOString(),
      };
    }
    return r;
  });

  saveRecordsToLocal(companyId, updated);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase
        .from('deals')
        .update({
          health_score: 85,
          days_since_last_contact: 0,
          notes: `[AI Rescue Applied]: ${playbook.headline}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', recordId);
    } catch (e) {}
  }

  return updated;
}

// Mark an account as upgraded via Expansion Proposal
export async function applyExpansionUpgrade(
  companyId: string,
  records: CRMRecord[],
  recordId: string,
  expansion: ExpansionPlaybook
): Promise<CRMRecord[]> {
  const updated = records.map(r => {
    if (r.id === recordId) {
      const newMrr = expansion.targetMrr || (r.mrr ? r.mrr * 1.5 : 2999);
      const newDealVal = newMrr * 12;
      return {
        ...r,
        mrr: newMrr,
        dealValue: newDealVal,
        planTier: (expansion.recommendedTier as any) || 'Enterprise',
        expansionPlaybook: expansion,
        expansionPotentialArr: 0,
        healthScore: 98,
        notes: `${r.notes || ''}\n[Expansion Upgraded ${new Date().toLocaleDateString()}]: Upgraded to ${expansion.recommendedTier} (+$${expansion.expansionArrUplift.toLocaleString()} ARR)`,
        updatedAt: new Date().toISOString()
      };
    }
    return r;
  });

  saveRecordsToLocal(companyId, updated);
  return updated;
}

// =========================================================================
// PRODUCT-LED GROWTH (PLG) & PQL (PRODUCT-QUALIFIED LEADS) ENGINE
// =========================================================================

export function getPQLSignals(companyId: string): PQLSignal[] {
  try {
    const local = localStorage.getItem(PQL_STORAGE_KEY_PREFIX + companyId);
    if (local) {
      const parsed: PQLSignal[] = JSON.parse(local);
      const genuine = parsed.filter(p => !p.id.startsWith('pql_0'));
      if (genuine.length !== parsed.length) {
        savePQLSignals(companyId, genuine);
      }
      return genuine;
    }
  } catch (e) {}
  return [];
}

export function savePQLSignals(companyId: string, signals: PQLSignal[]): void {
  try {
    localStorage.setItem(PQL_STORAGE_KEY_PREFIX + companyId, JSON.stringify(signals));
  } catch (e) {}
}

export function generateSeedPQLSignals(companyId: string, companyName: string): PQLSignal[] {
  return [];
  const now = Date.now();
  const minMs = 60 * 1000;
  const hourMs = 60 * minMs;

  return [
    {
      id: 'pql_01',
      companyId,
      accountId: 'acc_novastack',
      accountName: 'NovaStack Engineering',
      userName: 'Tariq Mehmood',
      userEmail: 'tariq@novastack.dev',
      currentPlan: 'Free Trial',
      targetPlan: 'Pro',
      pqlScore: 94,
      pqlTriggerReason: 'Triggered 14 deep AI document audits & exported 6 CSV reports in 3 hours',
      urgency: 'IMMEDIATE',
      estimatedArrUplift: 11988, // $999/mo Pro
      onboardingProgress: 90,
      stuckStep: undefined,
      sentimentScore: 85,
      sentimentLabel: 'PROMOTER',
      recentEvents: [
        { id: 'ev_1', eventName: 'quota_hit_warning_90%', timestamp: new Date(now - 12 * minMs).toISOString() },
        { id: 'ev_2', eventName: 'report_csv_batch_export', timestamp: new Date(now - 45 * minMs).toISOString() },
        { id: 'ev_3', eventName: 'team_member_invited (3 users)', timestamp: new Date(now - 2 * hourMs).toISOString() },
        { id: 'ev_4', eventName: 'custom_ai_prompt_saved', timestamp: new Date(now - 3 * hourMs).toISOString() }
      ],
      status: 'NEW_OPPORTUNITY',
      detectedAt: new Date(now - 15 * minMs).toISOString()
    },
    {
      id: 'pql_02',
      companyId,
      accountId: 'acc_quantix',
      accountName: 'Quantix Analytics',
      userName: 'Sara Lindqvist',
      userEmail: 'sara.l@quantix.io',
      currentPlan: 'Starter',
      targetPlan: 'Pro',
      pqlScore: 88,
      pqlTriggerReason: 'Invited 8 team members (Hit Starter limit of 5 seats)',
      urgency: 'HIGH',
      estimatedArrUplift: 18000,
      onboardingProgress: 100,
      stuckStep: undefined,
      sentimentScore: 92,
      sentimentLabel: 'PROMOTER',
      recentEvents: [
        { id: 'ev_21', eventName: 'seat_cap_exceeded_error', timestamp: new Date(now - 25 * minMs).toISOString() },
        { id: 'ev_22', eventName: 'admin_security_page_viewed', timestamp: new Date(now - 1 * hourMs).toISOString() },
        { id: 'ev_23', eventName: 'team_invite_sent_attempt', timestamp: new Date(now - 2 * hourMs).toISOString() }
      ],
      status: 'NEW_OPPORTUNITY',
      detectedAt: new Date(now - 30 * minMs).toISOString()
    },
    {
      id: 'pql_03',
      companyId,
      accountId: 'acc_hyperflow',
      accountName: 'HyperFlow Logistics',
      userName: 'Marcus Vance',
      userEmail: 'mvance@hyperflow.com',
      currentPlan: 'Free Trial',
      targetPlan: 'Enterprise',
      pqlScore: 78,
      pqlTriggerReason: 'Connected 3 Live Supabase DBs & generated 24 CRM pipelines',
      urgency: 'HIGH',
      estimatedArrUplift: 36000,
      onboardingProgress: 60,
      stuckStep: 'Stripe Webhook Verification',
      sentimentScore: 40,
      sentimentLabel: 'PASSIVE',
      recentEvents: [
        { id: 'ev_31', eventName: 'webhook_signature_failure_viewed', timestamp: new Date(now - 40 * minMs).toISOString() },
        { id: 'ev_32', eventName: 'crm_batch_imported (500 records)', timestamp: new Date(now - 4 * hourMs).toISOString() },
        { id: 'ev_33', eventName: 'database_connected', timestamp: new Date(now - 5 * hourMs).toISOString() }
      ],
      status: 'NEW_OPPORTUNITY',
      detectedAt: new Date(now - 45 * minMs).toISOString()
    },
    {
      id: 'pql_04',
      companyId,
      accountId: 'acc_beaconcare',
      accountName: 'BeaconCare Health',
      userName: 'Dr. Elena Rostova',
      userEmail: 'elena@beaconcare.org',
      currentPlan: 'Free Trial',
      targetPlan: 'Enterprise',
      pqlScore: 82,
      pqlTriggerReason: 'Requested HIPAA Security Addendum & tested OCR Medical Audit',
      urgency: 'IMMEDIATE',
      estimatedArrUplift: 48000,
      onboardingProgress: 75,
      stuckStep: 'Enterprise BAA Signing',
      sentimentScore: 70,
      sentimentLabel: 'PROMOTER',
      recentEvents: [
        { id: 'ev_41', eventName: 'compliance_baa_doc_clicked', timestamp: new Date(now - 10 * minMs).toISOString() },
        { id: 'ev_42', eventName: 'ai_closer_call_analyzed', timestamp: new Date(now - 1 * hourMs).toISOString() }
      ],
      status: 'NEW_OPPORTUNITY',
      detectedAt: new Date(now - 20 * minMs).toISOString()
    }
  ];
}

export function calculatePLGStats(signals: PQLSignal[]): PLGTelemetryStats {
  const activePqls = signals.filter(s => s.status === 'NEW_OPPORTUNITY' || s.status === 'PITCHED');
  const convertedPqls = signals.filter(s => s.status === 'CONVERTED');
  const pipelineVal = activePqls.reduce((sum, s) => sum + s.estimatedArrUplift, 0);
  const convertedVal = convertedPqls.reduce((sum, s) => sum + s.estimatedArrUplift, 0);
  
  const avgPql = signals.length > 0
    ? Math.round(signals.reduce((sum, s) => sum + s.pqlScore, 0) / signals.length)
    : 85;

  const avgOnboarding = signals.length > 0
    ? Math.round(signals.reduce((sum, s) => sum + s.onboardingProgress, 0) / signals.length)
    : 80;

  const totalSentiment = signals.reduce((sum, s) => sum + s.sentimentScore, 0);
  const avgNps = signals.length > 0 ? Math.round(totalSentiment / signals.length) : 72;

  return {
    totalActiveUsersToday: 142 + (signals.length * 8),
    totalPQLs: signals.length,
    totalPqlOpportunities: activePqls.length,
    potentialArr: pipelineVal,
    pqlPipelineValue: pipelineVal,
    convertedArr: convertedVal,
    avgPQLScore: avgPql,
    avgOnboardingCompletion: avgOnboarding,
    featureAdoptionRate: 84.5,
    npsScore: avgNps,
    topActivatedFeature: 'AI Revenue Radar & Churn Rescue',
    topDropoffStep: 'Stripe Webhook Verification (60% drop)'
  };
}

export function markPQLConverted(
  companyId: string,
  signals: PQLSignal[],
  pqlId: string
): PQLSignal[] {
  const updated = signals.map(s => {
    if (s.id === pqlId) {
      return {
        ...s,
        status: 'CONVERTED' as const,
        currentPlan: s.targetPlan
      };
    }
    return s;
  });
  savePQLSignals(companyId, updated);
  return updated;
}

// =========================================================================
// COMPETITOR ATTACK & CONTRACT RENEWAL PRE-EMPTOR ENGINE
// =========================================================================

export function getRenewalDefenseItems(companyId: string): RenewalDefenseItem[] {
  try {
    const local = localStorage.getItem(RENEWAL_STORAGE_KEY_PREFIX + companyId);
    if (local) {
      const parsed: RenewalDefenseItem[] = JSON.parse(local);
      const genuine = parsed.filter(i => !i.id.startsWith('renew_0'));
      if (genuine.length !== parsed.length) {
        saveRenewalDefenseItems(companyId, genuine);
      }
      return genuine;
    }
  } catch (e) {}
  return [];
}

export function saveRenewalDefenseItems(companyId: string, items: RenewalDefenseItem[]): void {
  try {
    localStorage.setItem(RENEWAL_STORAGE_KEY_PREFIX + companyId, JSON.stringify(items));
  } catch (e) {}
}

export function generateSeedRenewalDefenseItems(companyId: string, companyName: string): RenewalDefenseItem[] {
  return [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return [
    {
      id: 'renew_01',
      companyId,
      accountId: 'acc_apex_renew',
      accountName: 'CloudMatrix Global',
      decisionMakerName: 'Danielle Brooks',
      decisionMakerEmail: 'dbrooks@cloudmatrix.com',
      decisionMakerRole: 'Chief Technology Officer',
      contractArr: 78000,
      contractRenewalDate: new Date(now + 38 * dayMs).toISOString(),
      daysUntilRenewal: 38,
      historicalRoiDollarsSaved: 340000,
      historicalHoursSaved: 890,
      competitorThreat: {
        competitorName: 'Gong.io + Chorus Enterprise',
        perceivedAdvantage: 'Offered 25% buyout incentive ($58k/yr) and promised migration assistance',
        criticalWeaknesses: [
          'No autonomous Churn Rescue & 1-click executive email deployment',
          'Lacks real-time Supabase/Stripe bi-directional CRM writeback',
          'Requires 8-week implementation timeline with $15k onboarding fee'
        ],
        estimatedPriceGap: -20000
      },
      renewalHealthScore: 68,
      status: 'PENDING_PREEMPTION',
      detectedAt: new Date(now - 2 * dayMs).toISOString()
    },
    {
      id: 'renew_02',
      companyId,
      accountId: 'acc_vector_renew',
      accountName: 'VectorScale Systems',
      decisionMakerName: 'Arthur Pendelton',
      decisionMakerEmail: 'arthur.p@vectorscale.ai',
      decisionMakerRole: 'VP of Sales Operations',
      contractArr: 54000,
      contractRenewalDate: new Date(now + 47 * dayMs).toISOString(),
      daysUntilRenewal: 47,
      historicalRoiDollarsSaved: 210000,
      historicalHoursSaved: 540,
      competitorThreat: {
        competitorName: 'HubSpot Sales Hub Pro',
        perceivedAdvantage: 'Bundled with their existing marketing automation software',
        criticalWeaknesses: [
          'Lacks autonomous PQL Behavioral Signal Detection',
          'No automated Dunning & Stripe telemetric cashflow recovery engine',
          'Rigid seat pricing scales exponentially without custom AI reasoning'
        ],
        estimatedPriceGap: -8000
      },
      renewalHealthScore: 74,
      status: 'PENDING_PREEMPTION',
      detectedAt: new Date(now - 1 * dayMs).toISOString()
    },
    {
      id: 'renew_03',
      companyId,
      accountId: 'acc_zenith_renew',
      accountName: 'Zenith Health Dynamics',
      decisionMakerName: 'Dr. Sarah Jenkins',
      decisionMakerEmail: 's.jenkins@zenithhealth.org',
      decisionMakerRole: 'Chief Executive Officer',
      contractArr: 120000,
      contractRenewalDate: new Date(now + 62 * dayMs).toISOString(),
      daysUntilRenewal: 62,
      historicalRoiDollarsSaved: 520000,
      historicalHoursSaved: 1420,
      competitorThreat: {
        competitorName: 'Salesloft + Qualified',
        perceivedAdvantage: 'Pitching consolidated vendor discount for healthcare CRM stack',
        criticalWeaknesses: [
          'Zero Gemini 3.7 Flash multimodal reasoning on clinical contracts',
          'No live Supabase database sync',
          'High latency analytics reporting'
        ],
        estimatedPriceGap: -15000
      },
      renewalHealthScore: 82,
      status: 'PENDING_PREEMPTION',
      detectedAt: new Date(now - 3 * dayMs).toISOString()
    },
    {
      id: 'renew_04',
      companyId,
      accountId: 'acc_omni_renew',
      accountName: 'OmniFlow Retail Solutions',
      decisionMakerName: 'Kareem Al-Mansoor',
      decisionMakerEmail: 'k.almansoor@omniflow.ae',
      decisionMakerRole: 'Head of Global Revenue',
      contractArr: 42000,
      contractRenewalDate: new Date(now + 19 * dayMs).toISOString(),
      daysUntilRenewal: 19,
      historicalRoiDollarsSaved: 185000,
      historicalHoursSaved: 460,
      competitorThreat: undefined,
      renewalHealthScore: 91,
      status: 'PENDING_PREEMPTION',
      detectedAt: new Date(now - 4 * dayMs).toISOString()
    }
  ];
}

export function calculateRenewalStats(items: RenewalDefenseItem[]): RenewalDefenseStats {
  const activeRenewals = items.filter(i => i.status !== 'MULTI_YEAR_LOCKED');
  const lockedRenewals = items.filter(i => i.status === 'MULTI_YEAR_LOCKED');

  const totalAtStake = activeRenewals.reduce((sum, i) => sum + i.contractArr, 0);
  const competitorAttacked = items
    .filter(i => Boolean(i.competitorThreat) && i.status !== 'MULTI_YEAR_LOCKED')
    .reduce((sum, i) => sum + i.contractArr, 0);

  const lockedArrTotal = lockedRenewals.reduce((sum, i) => sum + (i.multiYearArrTotal || (i.contractArr * 2)), 0);

  const avgHealth = items.length > 0
    ? Math.round(items.reduce((sum, i) => sum + i.renewalHealthScore, 0) / items.length)
    : 78;

  return {
    upcomingRenewalsCount: activeRenewals.length,
    totalRenewalArrAtStake: totalAtStake,
    competitorAttackedArr: competitorAttacked,
    multiYearLockedArr: lockedArrTotal,
    avgRenewalHealth: avgHealth,
    projectedNrrImpact: lockedRenewals.length > 0 ? 128.4 : 114.2
  };
}

export function lockInMultiYearContract(
  companyId: string,
  items: RenewalDefenseItem[],
  itemId: string,
  termYears: number = 2
): RenewalDefenseItem[] {
  const updated = items.map(item => {
    if (item.id === itemId) {
      const multiTotal = item.contractArr * termYears;
      return {
        ...item,
        status: 'MULTI_YEAR_LOCKED' as const,
        lockInTermYears: termYears,
        multiYearArrTotal: multiTotal,
        renewalHealthScore: 100
      };
    }
    return item;
  });

  saveRenewalDefenseItems(companyId, updated);
  return updated;
}


