import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CRMRecord, RevenueRadarStats } from '../types';

const CRM_STORAGE_KEY_PREFIX = 'prime_crm_records_company_';
const SUPABASE_CONFIG_KEY = 'prime_supabase_config';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  tableName: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

// Get Supabase configuration from environment or localStorage
export function getSupabaseConfig(): SupabaseConfig {
  try {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch (e) {}

  const envUrl = 
    (import.meta as any).env?.VITE_SUPABASE_URL || 
    (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL || 
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) || 
    '';

  const envKey = 
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
    (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 
    '';

  return {
    url: envUrl,
    anonKey: envKey,
    tableName: 'deals',
    autoSync: true,
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  try {
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {}
}

let cachedSupabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }
  try {
    if (!cachedSupabaseClient) {
      cachedSupabaseClient = createClient(config.url, config.anonKey);
    }
    return cachedSupabaseClient;
  } catch (e) {
    console.error('Failed to create Supabase client:', e);
    return null;
  }
}

// Seed initial realistic company CRM deals isolated to companyId - empty for fresh workspace
export function getInitialSeedCRMData(companyId: string, userId: string, companyName?: string): CRMRecord[] {
  return [];
}

// Enterprise CRM Telemetry dataset - returns empty array to ensure zero fake/sample deals
export function getSampleEnterpriseCRMData(companyId: string, userId: string, companyName?: string): CRMRecord[] {
  return [];
}

function _legacySampleCRMData(companyId: string, userId: string, companyName?: string): CRMRecord[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const cName = companyName || 'Company';

  return [
    // --- AT RISK CLIENTS (No contact > 10 days, Value > $10,000) ---
    {
      id: `crm_risk_${companyId}_001`,
      companyId,
      userId,
      accountName: 'Stellar Dynamics Corp',
      contactName: 'Victoria Chen',
      contactEmail: 'vchen@stellardynamics.io',
      contactRole: 'Chief Technology Officer',
      dealValue: 78000,
      mrr: 6500,
      planTier: 'Pro',
      seatsUsed: 14,
      seatsTotal: 20,
      activityDropPct: -48,
      churnProbability: 76,
      expansionPotentialArr: 36000,
      stripeStatus: 'active',
      stage: 'Active Client',
      type: 'CLIENT',
      lastContactDate: new Date(now - 14 * dayMs).toISOString(),
      daysSinceLastContact: 14,
      healthScore: 42,
      riskFactors: [
        'No executive contact in 14 days (Threshold > 10d)',
        'Contract renewal approaching in 45 days',
        'Recent platform support ticket regarding API latency spike',
        'Daily active user logins dropped by -48%'
      ],
      notes: `$78k ARR Tier-1 customer for ${cName}. Last touched during quarterly check-in. Key risk is silent dissatisfaction with SLA benchmarks.`,
      source: 'Supabase',
      createdAt: new Date(now - 90 * dayMs).toISOString(),
      updatedAt: new Date(now - 14 * dayMs).toISOString()
    },
    {
      id: `crm_risk_${companyId}_002`,
      companyId,
      userId,
      accountName: 'Vanguard Health Systems',
      contactName: 'Dr. Arthur Pendelton',
      contactEmail: 'a.pendelton@vanguardhealth.org',
      contactRole: 'VP of Digital Operations',
      dealValue: 125000,
      mrr: 10416,
      planTier: 'Enterprise',
      seatsUsed: 42,
      seatsTotal: 50,
      activityDropPct: -62,
      churnProbability: 88,
      expansionPotentialArr: 45000,
      stripeStatus: 'past_due',
      failedPaymentAmount: 10416,
      stage: 'Active Client',
      type: 'CLIENT',
      lastContactDate: new Date(now - 19 * dayMs).toISOString(),
      daysSinceLastContact: 19,
      healthScore: 35,
      riskFactors: [
        '19 days of total communication silence (Critical > 10d)',
        'New interim CIO joined customer leadership last month',
        'Latest invoice payment failed (Past Due $10,416)',
        'High contract ARR ($125,000)'
      ],
      notes: `Flagship healthcare client for ${cName}. Silent since their leadership restructuring. Urgent executive sponsor call needed.`,
      source: 'Supabase',
      createdAt: new Date(now - 120 * dayMs).toISOString(),
      updatedAt: new Date(now - 19 * dayMs).toISOString()
    },
    {
      id: `crm_risk_${companyId}_003`,
      companyId,
      userId,
      accountName: 'Apex Logistics International',
      contactName: 'Roland Hayes',
      contactEmail: 'rhayes@apexlogistics.com',
      contactRole: 'Director of Global Procurement',
      dealValue: 46000,
      mrr: 3833,
      planTier: 'Pro',
      seatsUsed: 19,
      seatsTotal: 20,
      activityDropPct: -15,
      churnProbability: 45,
      expansionPotentialArr: 28000,
      stripeStatus: 'active',
      stage: 'Active Client',
      type: 'CLIENT',
      lastContactDate: new Date(now - 12 * dayMs).toISOString(),
      daysSinceLastContact: 12,
      healthScore: 48,
      riskFactors: [
        '12 days since last touchpoint (Threshold > 10d)',
        'Quarterly business review (QBR) overdue by 2 weeks',
        'Reaching 95% seat utilization (19/20 seats occupied)'
      ],
      notes: '$46k supply chain account. Needs automated QBR summary deck and dedicated solutions check-in.',
      source: 'CRM Sync',
      createdAt: new Date(now - 60 * dayMs).toISOString(),
      updatedAt: new Date(now - 12 * dayMs).toISOString()
    },
    {
      id: `crm_risk_${companyId}_004`,
      companyId,
      userId,
      accountName: 'Meridian Capital Group',
      contactName: 'Eleanor Vance',
      contactEmail: 'evance@meridiancapital.com',
      contactRole: 'Partner & Chief Investment Officer',
      dealValue: 92000,
      mrr: 7666,
      planTier: 'Pro',
      seatsUsed: 20,
      seatsTotal: 20,
      activityDropPct: -35,
      churnProbability: 65,
      expansionPotentialArr: 55000,
      stripeStatus: 'active',
      stage: 'Active Client',
      type: 'CLIENT',
      lastContactDate: new Date(now - 16 * dayMs).toISOString(),
      daysSinceLastContact: 16,
      healthScore: 38,
      riskFactors: [
        '16 days since last email interaction (Threshold > 10d)',
        'Requested custom security audit addendum with zero follow-up',
        'Maxed out 20/20 seats - Prime candidate for Enterprise upgrade',
        'Annual license up for review ($92,000)'
      ],
      notes: 'Investment firm managing multi-fund portfolios. Requested compliance paperwork 16 days ago that stalled in legal.',
      source: 'Supabase',
      createdAt: new Date(now - 180 * dayMs).toISOString(),
      updatedAt: new Date(now - 16 * dayMs).toISOString()
    },

    // --- HOT LEADS (Stage: 'Negotiation', Value > $20,000) ---
    {
      id: `crm_hot_${companyId}_001`,
      companyId,
      userId,
      accountName: 'OmniCloud Technologies',
      contactName: 'Samantha Zhao',
      contactEmail: 'szhao@omnicloud.tech',
      contactRole: 'VP of Revenue Operations',
      dealValue: 185000,
      stage: 'Negotiation',
      type: 'LEAD',
      lastContactDate: new Date(now - 2 * dayMs).toISOString(),
      daysSinceLastContact: 2,
      healthScore: 89,
      riskFactors: [
        'Competitor trying to offer aggressive 15% discount',
        'Decision committee meets this Thursday at 2 PM'
      ],
      notes: `$185k ARR Enterprise opportunity for ${cName}. Final redline stage on multi-seat contract. High closing probability with CEO price-lock incentive.`,
      source: 'Supabase',
      createdAt: new Date(now - 20 * dayMs).toISOString(),
      updatedAt: new Date(now - 2 * dayMs).toISOString()
    },
    {
      id: `crm_hot_${companyId}_002`,
      companyId,
      userId,
      accountName: 'FinNova Global Pay',
      contactName: 'Julian Thorne',
      contactEmail: 'j.thorne@finnovapay.com',
      contactRole: 'Head of Strategic Partnerships',
      dealValue: 64000,
      stage: 'Negotiation',
      type: 'LEAD',
      lastContactDate: new Date(now - 1 * dayMs).toISOString(),
      daysSinceLastContact: 1,
      healthScore: 92,
      riskFactors: [
        'Requires SLA addendum guarantee of 99.95% uptime'
      ],
      notes: 'Fast-moving fintech lead. Ready to sign upon confirmation of enterprise SLA addendum.',
      source: 'Supabase',
      createdAt: new Date(now - 15 * dayMs).toISOString(),
      updatedAt: new Date(now - 1 * dayMs).toISOString()
    },
    {
      id: `crm_hot_${companyId}_003`,
      companyId,
      userId,
      accountName: 'CyberShield Defense Systems',
      contactName: 'Colonel Nathan Briggs',
      contactEmail: 'nbriggs@cybershield.us',
      contactRole: 'Chief Information Security Officer',
      dealValue: 240000,
      stage: 'Negotiation',
      type: 'LEAD',
      lastContactDate: new Date(now - 3 * dayMs).toISOString(),
      daysSinceLastContact: 3,
      healthScore: 85,
      riskFactors: [
        'Fiscal year budget closes at end of month ($240k budget allocation)',
        'Legal review of indemnity clause ongoing'
      ],
      notes: 'Mega enterprise deal. Government-grade cybersecurity provider. Procurement awaiting final executive approval.',
      source: 'Supabase',
      createdAt: new Date(now - 45 * dayMs).toISOString(),
      updatedAt: new Date(now - 3 * dayMs).toISOString()
    },
    {
      id: `crm_hot_${companyId}_004`,
      companyId,
      userId,
      accountName: 'Kallisto AI Robotics',
      contactName: 'Miriam Al-Mansoor',
      contactEmail: 'miriam@kallistorobotics.com',
      contactRole: 'Co-Founder & Chief Operating Officer',
      dealValue: 52000,
      stage: 'Negotiation',
      type: 'LEAD',
      lastContactDate: new Date(now - 2 * dayMs).toISOString(),
      daysSinceLastContact: 2,
      healthScore: 88,
      riskFactors: [
        'Needs rapid 48-hour sandbox onboarding commitment'
      ],
      notes: 'Series B robotics company. Negotiating 2-year subscription with dedicated implementation architect.',
      source: 'CRM Sync',
      createdAt: new Date(now - 18 * dayMs).toISOString(),
      updatedAt: new Date(now - 2 * dayMs).toISOString()
    },

    // --- OTHER PIPELINE ACCOUNTS ---
    {
      id: `crm_pipe_${companyId}_001`,
      companyId,
      userId,
      accountName: 'Nexus Media Labs',
      contactName: 'David Kester',
      contactEmail: 'dkester@nexusmedialabs.com',
      contactRole: 'Creative Director',
      dealValue: 18000,
      stage: 'Proposal',
      type: 'LEAD',
      lastContactDate: new Date(now - 4 * dayMs).toISOString(),
      daysSinceLastContact: 4,
      healthScore: 75,
      riskFactors: [],
      notes: 'Proposal delivered for $18k. Follow-up demo scheduled next Tuesday.',
      source: 'Direct Entry',
      createdAt: new Date(now - 10 * dayMs).toISOString(),
      updatedAt: new Date(now - 4 * dayMs).toISOString()
    },
    {
      id: `crm_pipe_${companyId}_002`,
      companyId,
      userId,
      accountName: 'Horizon Aerospace',
      contactName: 'Clara Oswald',
      contactEmail: 'coswald@horizonaero.com',
      contactRole: 'VP of Commercial Aviation',
      dealValue: 310000,
      stage: 'Discovery',
      type: 'LEAD',
      lastContactDate: new Date(now - 1 * dayMs).toISOString(),
      daysSinceLastContact: 1,
      healthScore: 80,
      riskFactors: [],
      notes: 'Initial scoping session went exceptionally well. Drafting executive enterprise pitch.',
      source: 'Supabase',
      createdAt: new Date(now - 5 * dayMs).toISOString(),
      updatedAt: new Date(now - 1 * dayMs).toISOString()
    },
    {
      id: `crm_pipe_${companyId}_003`,
      companyId,
      userId,
      accountName: 'Beacon Wealth Advisory',
      contactName: 'Gordon Fisher',
      contactEmail: 'gfisher@beaconwealth.io',
      contactRole: 'Managing Director',
      dealValue: 35000,
      stage: 'Active Client',
      type: 'CLIENT',
      lastContactDate: new Date(now - 4 * dayMs).toISOString(),
      daysSinceLastContact: 4,
      healthScore: 94,
      riskFactors: [],
      notes: 'Healthy client. Active daily usage and high NPS score.',
      source: 'Supabase',
      createdAt: new Date(now - 200 * dayMs).toISOString(),
      updatedAt: new Date(now - 4 * dayMs).toISOString()
    }
  ];
}

// Fetch all CRM deals strictly isolated by company_id
export async function fetchCRMRecords(companyId: string, userId?: string): Promise<CRMRecord[]> {
  const resolvedCompanyId = companyId || 'default_comp';
  const resolvedUserId = userId || 'user_anon';
  const supabase = getSupabaseClient();
  const config = getSupabaseConfig();

  // Try fetching from Supabase with company_id filter (Multi-tenant requirement)
  if (supabase && config.url && config.anonKey) {
    try {
      // 1. Query 'deals' table filtered strictly by company_id
      let { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('company_id', resolvedCompanyId)
        .order('deal_value', { ascending: false });

      // 2. Fallback to 'clients' or 'crm_deals' if 'deals' table is not yet migrated
      if (error || !data || data.length === 0) {
        const clientRes = await supabase
          .from('clients')
          .select('*')
          .eq('company_id', resolvedCompanyId)
          .order('revenue', { ascending: false });
        
        if (!clientRes.error && clientRes.data && clientRes.data.length > 0) {
          data = clientRes.data;
          error = null;
        }
      }

      if (!error && data && data.length > 0) {
        // Map Supabase rows to CRMRecord ensuring companyId is enforced
        const mappedRecords: CRMRecord[] = data.map((row: any) => {
          const lastDate = row.last_contact || row.last_contact_date || row.lastContactDate || new Date().toISOString();
          const daysAgo = Math.max(0, Math.floor((Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24)));
          
          return {
            id: String(row.id || 'supa_' + Math.random().toString(36).substr(2, 9)),
            companyId: row.company_id || resolvedCompanyId,
            userId: row.user_id || resolvedUserId,
            accountName: row.account_name || row.name || row.accountName || 'Unnamed Account',
            contactName: row.contact_name || row.contactName || (row.name ? row.name + ' Lead' : 'Lead Contact'),
            contactEmail: row.contact_email || row.contactEmail || 'contact@domain.com',
            contactRole: row.contact_role || row.contactRole || 'Decision Maker',
            dealValue: Number(row.deal_value || row.revenue || row.dealValue || row.value || 0),
            stage: row.stage || (row.churn_risk === 'HIGH' ? 'Renewal At Risk' : 'Active Client'),
            type: (row.type === 'LEAD' || row.account_type === 'LEAD') ? 'LEAD' : 'CLIENT',
            lastContactDate: lastDate,
            daysSinceLastContact: daysAgo,
            healthScore: Number(row.health_score || (row.churn_risk === 'HIGH' ? 42 : row.churn_risk === 'MEDIUM' ? 70 : 92)),
            riskFactors: Array.isArray(row.risk_factors) 
              ? row.risk_factors 
              : (row.churn_risk ? [`Churn Risk Flag: ${row.churn_risk}`] : []),
            notes: row.notes || '',
            source: 'Supabase',
            aiAction: row.ai_action || row.aiAction,
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
          };
        });

        // Cache locally partitioned by company_id
        saveRecordsToLocal(resolvedCompanyId, mappedRecords);
        return mappedRecords;
      }
    } catch (err) {
      console.warn('Supabase tenant query notice, falling back to isolated store:', err);
    }
  }

  // Local storage fallback (strictly isolated by companyId)
  try {
    const raw = localStorage.getItem(CRM_STORAGE_KEY_PREFIX + resolvedCompanyId);
    if (raw) {
      const records: CRMRecord[] = JSON.parse(raw);
      if (Array.isArray(records)) {
        // Strip out any previously seeded sample / mock deals
        const genuine = records.filter(r => 
          r && 
          !r.id.startsWith('crm_risk_') && 
          !r.id.startsWith('crm_hot_') && 
          !r.id.startsWith('crm_pipe_') &&
          r.accountName !== 'Stellar Dynamics Corp' &&
          r.accountName !== 'Vanguard Health Systems' &&
          r.accountName !== 'Apex Logistics International' &&
          r.accountName !== 'Meridian Capital Group' &&
          r.accountName !== 'CyberShield Defense Systems' &&
          r.accountName !== 'Kallisto AI Robotics' &&
          r.accountName !== 'Nexus Media Labs' &&
          r.accountName !== 'Horizon Aerospace'
        );
        if (genuine.length !== records.length) {
          saveRecordsToLocal(resolvedCompanyId, genuine);
        }
        return genuine.map(r => {
          const lastDate = r.lastContactDate || new Date().toISOString();
          const dateParsed = new Date(lastDate).getTime();
          const daysAgo = isNaN(dateParsed) ? 0 : Math.max(0, Math.floor((Date.now() - dateParsed) / (1000 * 60 * 60 * 24)));
          return { 
            ...r, 
            companyId: resolvedCompanyId, 
            daysSinceLastContact: daysAgo,
            dealValue: Number(r.dealValue || 0),
            stage: r.stage || 'Active Client',
            type: r.type || 'CLIENT',
            healthScore: Number(r.healthScore || 70)
          };
        });
      }
    }
  } catch (e) {
    console.warn('Error reading CRM from localStorage:', e);
  }

  return [];
}

export function saveRecordsToLocal(companyId: string, records: CRMRecord[]): void {
  try {
    localStorage.setItem(CRM_STORAGE_KEY_PREFIX + companyId, JSON.stringify(records));
  } catch (e) {}
}

export async function saveCRMRecord(companyId: string, userId: string, record: CRMRecord): Promise<CRMRecord> {
  const resolvedCompanyId = companyId || record.companyId || 'default_comp';
  const resolvedUserId = userId || record.userId || 'user_anon';
  
  const records = await fetchCRMRecords(resolvedCompanyId, resolvedUserId);
  const existingIdx = records.findIndex(r => r.id === record.id);
  
  const normalizedRecord: CRMRecord = {
    ...record,
    companyId: resolvedCompanyId,
    userId: resolvedUserId,
    updatedAt: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    records[existingIdx] = normalizedRecord;
  } else {
    records.unshift({ 
      ...normalizedRecord, 
      createdAt: normalizedRecord.createdAt || new Date().toISOString() 
    });
  }

  saveRecordsToLocal(resolvedCompanyId, records);

  // Sync to Supabase with company_id
  const supabase = getSupabaseClient();
  if (supabase) {
    // 1. Write to 'deals' table
    try {
      await supabase.from('deals').upsert({
        id: normalizedRecord.id,
        company_id: resolvedCompanyId,
        user_id: resolvedUserId,
        account_name: normalizedRecord.accountName,
        contact_name: normalizedRecord.contactName,
        contact_email: normalizedRecord.contactEmail,
        contact_role: normalizedRecord.contactRole,
        deal_value: normalizedRecord.dealValue,
        stage: normalizedRecord.stage,
        type: normalizedRecord.type,
        health_score: normalizedRecord.healthScore,
        risk_factors: normalizedRecord.riskFactors,
        notes: normalizedRecord.notes,
        last_contact: normalizedRecord.lastContactDate,
        ai_action: normalizedRecord.aiAction,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Supabase deals upsert notice:', e);
    }

    // 2. Also write to legacy 'clients' table for backward compatibility
    try {
      const churnRiskLevel = normalizedRecord.healthScore < 50 ? 'HIGH' : normalizedRecord.healthScore < 80 ? 'MEDIUM' : 'LOW';
      await supabase.from('clients').upsert({
        id: normalizedRecord.id,
        company_id: resolvedCompanyId,
        user_id: resolvedUserId,
        name: normalizedRecord.accountName,
        revenue: normalizedRecord.dealValue,
        churn_risk: churnRiskLevel,
        last_contact: normalizedRecord.lastContactDate,
      });
    } catch (e) {}
  }

  return normalizedRecord;
}

// 1-Click Import Deals for Onboarding & Multi-Tenant Setup
export async function importCompanyDeals(
  companyId: string, 
  userId: string, 
  companyName: string = 'Enterprise Workspace',
  customDeals?: CRMRecord[]
): Promise<CRMRecord[]> {
  const dealsToImport = customDeals && customDeals.length > 0 
    ? customDeals 
    : getInitialSeedCRMData(companyId, userId, companyName);

  for (const deal of dealsToImport) {
    await saveCRMRecord(companyId, userId, {
      ...deal,
      companyId,
      userId,
    });
  }

  return dealsToImport;
}

export async function updateCRMRecord(
  companyId: string,
  userId: string, 
  recordId: string, 
  updates: Partial<CRMRecord>
): Promise<CRMRecord | null> {
  const records = await fetchCRMRecords(companyId, userId);
  const idx = records.findIndex(r => r.id === recordId);
  if (idx === -1) return null;

  const updated: CRMRecord = {
    ...records[idx],
    ...updates,
    companyId,
    userId,
    updatedAt: new Date().toISOString()
  };

  records[idx] = updated;
  saveRecordsToLocal(companyId, records);

  // Sync to Supabase
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('deals').update({
        deal_value: updated.dealValue,
        stage: updated.stage,
        type: updated.type,
        health_score: updated.healthScore,
        risk_factors: updated.riskFactors,
        notes: updated.notes,
        last_contact: updated.lastContactDate,
        ai_action: updated.aiAction,
        updated_at: new Date().toISOString()
      }).eq('id', recordId).eq('company_id', companyId);
    } catch (e) {}
  }

  return updated;
}

export async function deleteCRMRecord(companyId: string, userId: string, recordId: string): Promise<boolean> {
  const records = await fetchCRMRecords(companyId, userId);
  const filtered = records.filter(r => r.id !== recordId);
  saveRecordsToLocal(companyId, filtered);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('deals').delete().eq('id', recordId).eq('company_id', companyId);
      await supabase.from('clients').delete().eq('id', recordId).eq('company_id', companyId);
    } catch (e) {}
  }
  return true;
}

// Mark contact as communicated today
export async function markContactedToday(companyId: string, userId: string, recordId: string): Promise<CRMRecord | null> {
  const now = new Date().toISOString();
  return updateCRMRecord(companyId, userId, recordId, {
    lastContactDate: now,
    daysSinceLastContact: 0,
    healthScore: 85,
  });
}

// Attach Gemini AI suggested tactical action to record
export async function attachAIActionToRecord(
  companyId: string,
  userId: string,
  recordId: string,
  aiAction: CRMRecord['aiAction']
): Promise<CRMRecord | null> {
  return updateCRMRecord(companyId, userId, recordId, { aiAction });
}

// --- STRICT FILTERING RULES ---

export function filterAtRiskClients(records: CRMRecord[]): CRMRecord[] {
  if (!Array.isArray(records)) return [];
  return records.filter(record => {
    if (!record) return false;
    const isClient = record.type === 'CLIENT' || record.stage === 'Active Client' || record.stage === 'Churn Risk';
    const isSilentOver10Days = (record.daysSinceLastContact || 0) > 10;
    const isHighValueOver10k = (record.dealValue || 0) > 10000;

    return isClient && isSilentOver10Days && isHighValueOver10k;
  });
}

export function filterHotLeads(records: CRMRecord[]): CRMRecord[] {
  if (!Array.isArray(records)) return [];
  return records.filter(record => {
    if (!record) return false;
    const stageStr = (record.stage || '').toLowerCase();
    const isNegotiationStage = stageStr === 'negotiation';
    const isHighValueOver20k = (record.dealValue || 0) > 20000;

    return isNegotiationStage && isHighValueOver20k;
  });
}

export function calculateRadarStats(records: CRMRecord[]): RevenueRadarStats {
  const safeRecords = Array.isArray(records) ? records.filter(Boolean) : [];
  const atRisk = filterAtRiskClients(safeRecords);
  const hotLeads = filterHotLeads(safeRecords);

  const atRiskPipelineValue = atRisk.reduce((acc, r) => acc + (r?.dealValue || 0), 0);
  const hotLeadsPipelineValue = hotLeads.reduce((acc, r) => acc + (r?.dealValue || 0), 0);
  const totalPipelineValue = safeRecords.reduce((acc, r) => acc + (r?.dealValue || 0), 0);

  return {
    atRiskCount: atRisk.length,
    atRiskPipelineValue,
    hotLeadsCount: hotLeads.length,
    hotLeadsPipelineValue,
    totalPipelineValue,
    totalAccountsCount: safeRecords.length,
  };
}
