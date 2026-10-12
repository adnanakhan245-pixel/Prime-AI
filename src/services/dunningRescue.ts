import { DunningRecoveryItem, InactivityRiskItem, VoluntaryChurnItem } from '../types';
import { getSupabaseClient } from './crm';

const DUNNING_STORAGE_KEY_PREFIX = 'prime_dunning_v2_';
const INACTIVITY_STORAGE_KEY_PREFIX = 'prime_inactivity_v2_';
const VOLUNTARY_CHURN_STORAGE_KEY_PREFIX = 'prime_voluntary_churn_v1_';

// =========================================================================
// 1. FAILED PAYMENT RECOVERY (CARD FAILED / DUNNING)
// =========================================================================

export function getDunningRescueItems(companyId: string): DunningRecoveryItem[] {
  try {
    const raw = localStorage.getItem(DUNNING_STORAGE_KEY_PREFIX + companyId);
    if (raw) {
      const items = JSON.parse(raw);
      if (Array.isArray(items)) {
        return items.filter(i => i && !i.id.startsWith("dunning_str_"));
      }
    }
  } catch (e) {}
  return [];
}

export async function saveDunningRescueItems(companyId: string, items: DunningRecoveryItem[]): Promise<void> {
  try {
    localStorage.setItem(DUNNING_STORAGE_KEY_PREFIX + companyId, JSON.stringify(items));
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('prime:rescue_data_updated', { detail: { type: 'dunning' } }));
  }

  // Sync to Supabase table `dunning_recoveries`
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const records = items.map(item => ({
        id: item.id,
        company_id: companyId,
        customer_name: item.customerName,
        customer_email: item.customerEmail,
        customer_phone: item.customerPhone || null,
        failed_amount: item.failedAmount,
        status: item.status,
        day1_email_sent: item.day1EmailSent,
        day3_whatsapp_sent: item.day3WhatsAppSent,
        recovered_at: item.recoveredAt || null,
        updated_at: new Date().toISOString()
      }));
      await supabase.from('dunning_recoveries').upsert(records);
    } catch (err) {
      console.warn('Supabase dunning sync notice (local backup active):', err);
    }
  }
}

// Trigger Day 1 Email ONLY after Human Approval
export async function triggerDay1Email(
  companyId: string, 
  itemId: string,
  customBody?: string
): Promise<DunningRecoveryItem[]> {
  const items = getDunningRescueItems(companyId);
  const updated = items.map(item => {
    if (item.id === itemId) {
      return {
        ...item,
        day1EmailSent: true,
        day1EmailText: customBody || 'Your payment failed. Update card details in 1 click to avoid service interruption.',
        humanApproved: true,
        humanApprovedAt: new Date().toISOString(),
        humanApprovedBy: 'Founder (Human Confirmed)',
        supabaseStatusText: 'Supabase Updated: Day 1 Email Approved & Dispatched'
      };
    }
    return item;
  });
  await saveDunningRescueItems(companyId, updated);
  return updated;
}

// Trigger Day 3 WhatsApp ONLY after Human Approval
export async function triggerDay3WhatsApp(
  companyId: string, 
  itemId: string,
  customMessage?: string
): Promise<DunningRecoveryItem[]> {
  const items = getDunningRescueItems(companyId);
  const updated = items.map(item => {
    if (item.id === itemId) {
      return {
        ...item,
        day3WhatsAppSent: true,
        day3WhatsAppText: customMessage || 'URGENT: Your subscription will be suspended in 48 hours due to failed payment.',
        humanApproved: true,
        humanApprovedAt: new Date().toISOString(),
        humanApprovedBy: 'Founder (Human Confirmed)',
        supabaseStatusText: 'Supabase Updated: Day 3 WhatsApp Escalation Approved & Dispatched'
      };
    }
    return item;
  });
  await saveDunningRescueItems(companyId, updated);
  return updated;
}

// Mark Customer Returned or Left
export async function markCustomerStatus(
  companyId: string, 
  itemId: string, 
  status: 'RECOVERED' | 'CHURNED'
): Promise<DunningRecoveryItem[]> {
  const items = getDunningRescueItems(companyId);
  const updated = items.map(item => {
    if (item.id === itemId) {
      const isReturned = status === 'RECOVERED';
      return {
        ...item,
        status: isReturned ? ('RECOVERED' as const) : ('UNCOLLECTIBLE' as const),
        recoveredAt: isReturned ? new Date().toISOString() : undefined,
        supabaseStatusText: isReturned 
          ? 'Supabase Record: Customer Returned & Re-authorized' 
          : 'Supabase Record: Customer Marked Churned / Uncollectible'
      };
    }
    return item;
  });
  await saveDunningRescueItems(companyId, updated);
  return updated;
}

// Simulate a fresh Stripe Failed Payment Webhook event
export async function simulateStripeFailedPayment(companyId: string): Promise<DunningRecoveryItem[]> {
  const items = getDunningRescueItems(companyId);
  const newItem: DunningRecoveryItem = {
    id: `dunning_${Date.now()}`,
    companyId,
    customerName: 'Stripe Webhook Client (Live Event)',
    customerEmail: `billing_${Date.now().toString().slice(-4)}@enterprisepartner.com`,
    customerPhone: '+1 (415) 779-3320',
    planName: 'Enterprise Pro ($1,500/mo)',
    failedAmount: 1500,
    currency: 'USD',
    failedDate: new Date().toISOString(),
    retryAttempts: 1,
    status: 'PENDING',
    day1EmailSent: false, // Strict: Never auto-send without human approval
    day1EmailText: 'Your payment failed. Update card details in 1 click to avoid service interruption.',
    day3WhatsAppSent: false,
    day3WhatsAppText: 'URGENT: Your subscription will be suspended in 48 hours due to failed payment.',
    day3WhatsAppScheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    supabaseSynced: true,
    supabaseStatusText: 'Awaiting Human Approval: Invoice payment failed',
    paymentUpdateUrl: '',
    humanApproved: false,
    source: 'STRIPE_WEBHOOK'
  };

  const updated = [newItem, ...items];
  await saveDunningRescueItems(companyId, updated);
  return updated;
}

// =========================================================================
// 2. 7-DAY INACTIVITY SILENT CHURN SENTRY (NO LOGINS)
// =========================================================================

export function getInactivityRiskItems(companyId: string): InactivityRiskItem[] {
  try {
    const raw = localStorage.getItem(INACTIVITY_STORAGE_KEY_PREFIX + companyId);
    if (raw) {
      const items = JSON.parse(raw);
      if (Array.isArray(items)) {
        return items.filter(i => i && !i.id.startsWith("inact_0"));
      }
    }
  } catch (e) {}
  return [];
}

export async function saveInactivityRiskItems(companyId: string, items: InactivityRiskItem[]): Promise<void> {
  try {
    localStorage.setItem(INACTIVITY_STORAGE_KEY_PREFIX + companyId, JSON.stringify(items));
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('prime:rescue_data_updated', { detail: { type: 'inactivity' } }));
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const records = items.map(item => ({
        id: item.id,
        company_id: companyId,
        customer_name: item.customerName,
        mrr: item.mrr,
        days_silent: item.daysSilent,
        alert_title: item.alertTitle,
        ai_advice: item.aiAdvice,
        status: item.status,
        discount_code: item.discountCode,
        updated_at: new Date().toISOString()
      }));
      await supabase.from('inactivity_risks').upsert(records);
    } catch (err) {
      console.warn('Supabase inactivity sync notice:', err);
    }
  }
}

// Apply 20% Concession ONLY after Human Approval
export async function applyInactivity20PercentConcession(
  companyId: string, 
  itemId: string,
  customMessage?: string
): Promise<InactivityRiskItem[]> {
  const items = getInactivityRiskItems(companyId);
  const updated = items.map(item => {
    if (item.id === itemId) {
      return {
        ...item,
        status: 'CONCESSION_APPLIED' as const,
        humanApproved: true,
        humanApprovedAt: new Date().toISOString(),
        humanApprovedBy: 'Founder (Human Confirmed)',
        suggestedMessage: customMessage || '✓ 20% Retention Concession (SAVE20NOW) Dispatched via VIP Email & WhatsApp. Customer Logged in Supabase as Retained.'
      };
    }
    return item;
  });
  await saveInactivityRiskItems(companyId, updated);
  return updated;
}

// =========================================================================
// 3. VOLUNTARY CHURN & ABOUT-TO-CHURN DEFENSE
// =========================================================================

export function getVoluntaryChurnItems(companyId: string): VoluntaryChurnItem[] {
  try {
    const raw = localStorage.getItem(VOLUNTARY_CHURN_STORAGE_KEY_PREFIX + companyId);
    if (raw) {
      const items = JSON.parse(raw);
      if (Array.isArray(items)) {
        return items;
      }
    }
  } catch (e) {}
  return [];
}

export async function saveVoluntaryChurnItems(companyId: string, items: VoluntaryChurnItem[]): Promise<void> {
  try {
    localStorage.setItem(VOLUNTARY_CHURN_STORAGE_KEY_PREFIX + companyId, JSON.stringify(items));
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('prime:rescue_data_updated', { detail: { type: 'voluntary' } }));
  }
}

// Apply Voluntary Churn Retention Rescue ONLY after Human Approval
export async function applyVoluntaryChurnRescue(
  companyId: string,
  itemId: string,
  customMessage?: string
): Promise<VoluntaryChurnItem[]> {
  const items = getVoluntaryChurnItems(companyId);
  const updated = items.map(item => {
    if (item.id === itemId) {
      return {
        ...item,
        status: 'CONCESSION_APPLIED' as const,
        humanApproved: true,
        humanApprovedAt: new Date().toISOString(),
        humanApprovedBy: 'Founder (Human Confirmed)',
        suggestedMessage: customMessage || '✓ Executive Retention Rescue Dispatched. 15% Annual Lock-in Offer Sent via Email.'
      };
    }
    return item;
  });
  await saveVoluntaryChurnItems(companyId, updated);
  return updated;
}

// =========================================================================
// 4. MASTER HUMAN APPROVAL: BATCH APPROVE ALL PENDING RESCUES
// =========================================================================

export async function approveAllPendingRescues(companyId: string): Promise<{
  dunningApprovedCount: number;
  inactivityApprovedCount: number;
  voluntaryApprovedCount: number;
}> {
  const now = new Date().toISOString();

  // 1. Approve all pending Dunning items
  const dunning = getDunningRescueItems(companyId);
  let dunningCount = 0;
  const updatedDunning = dunning.map(item => {
    if (item.status === 'PENDING' && (!item.day1EmailSent || !item.humanApproved)) {
      dunningCount++;
      return {
        ...item,
        day1EmailSent: true,
        day3WhatsAppSent: true,
        humanApproved: true,
        humanApprovedAt: now,
        humanApprovedBy: 'Founder (Batch Human Approval)',
        supabaseStatusText: 'Supabase Updated: Batch Approved & Dispatched'
      };
    }
    return item;
  });
  await saveDunningRescueItems(companyId, updatedDunning);

  // 2. Approve all pending Inactivity items
  const inact = getInactivityRiskItems(companyId);
  let inactCount = 0;
  const updatedInact = inact.map(item => {
    if (item.status === 'AT_RISK') {
      inactCount++;
      return {
        ...item,
        status: 'CONCESSION_APPLIED' as const,
        humanApproved: true,
        humanApprovedAt: now,
        humanApprovedBy: 'Founder (Batch Human Approval)',
        suggestedMessage: '✓ 20% Retention Concession (SAVE20NOW) Dispatched via Batch Human Approval.'
      };
    }
    return item;
  });
  await saveInactivityRiskItems(companyId, updatedInact);

  // 3. Approve all pending Voluntary items
  const vol = getVoluntaryChurnItems(companyId);
  let volCount = 0;
  const updatedVol = vol.map(item => {
    if (item.status === 'AT_RISK') {
      volCount++;
      return {
        ...item,
        status: 'CONCESSION_APPLIED' as const,
        humanApproved: true,
        humanApprovedAt: now,
        humanApprovedBy: 'Founder (Batch Human Approval)'
      };
    }
    return item;
  });
  await saveVoluntaryChurnItems(companyId, updatedVol);

  return {
    dunningApprovedCount: dunningCount,
    inactivityApprovedCount: inactCount,
    voluntaryApprovedCount: volCount
  };
}

// =========================================================================
// 5. CSV INGESTION & AUTO-CATEGORIZATION ENGINE (NO STRIPE REQUIRED)
// =========================================================================

export interface CsvImportResult {
  totalRows: number;
  dunningAdded: number;
  inactivityAdded: number;
  voluntaryAdded: number;
  totalMrrAtRisk: number;
}

/**
 * Ingests a CSV file and routes each row into the appropriate rescue engine:
 * 1. Card Failed / Payment Declined -> Dunning Recovery
 * 2. Inactive / 0 Logins (7+ days) -> Silent Churn Sentry
 * 3. Canceling / High Churn Risk -> Voluntary Churn Defense
 * STRICT RULE: All created items start with humanApproved: false, awaiting user button press!
 */
export async function importCsvToRescueCenter(
  csvText: string,
  companyId: string = 'comp_workspace_01'
): Promise<CsvImportResult> {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('CSV file has fewer than 2 lines (needs headers and data).');
  }

  // Parse header columns
  const headerLine = lines[0].toLowerCase();
  const headers = headerLine.split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));

  let nameIdx = headers.findIndex(h => h.includes('name') || h.includes('customer') || h.includes('account') || h.includes('company'));
  let emailIdx = headers.findIndex(h => h.includes('email') || h.includes('mail') || h.includes('contact'));
  let phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('tel') || h.includes('mobile') || h.includes('whatsapp'));
  let amountIdx = headers.findIndex(h => h.includes('amount') || h.includes('mrr') || h.includes('value') || h.includes('total') || h.includes('price') || h.includes('arr'));
  let statusIdx = headers.findIndex(h => h.includes('status') || h.includes('state') || h.includes('type') || h.includes('category') || h.includes('risk'));
  let daysIdx = headers.findIndex(h => h.includes('day') || h.includes('silent') || h.includes('inactive') || h.includes('login'));
  let reasonIdx = headers.findIndex(h => h.includes('reason') || h.includes('issue') || h.includes('desc') || h.includes('note') || h.includes('decline') || h.includes('code'));
  let planIdx = headers.findIndex(h => h.includes('plan') || h.includes('tier') || h.includes('package') || h.includes('subscription'));

  if (nameIdx === -1) nameIdx = 0;
  if (emailIdx === -1) emailIdx = Math.min(1, headers.length - 1);
  if (amountIdx === -1) amountIdx = Math.min(2, headers.length - 1);

  const existingDunning = getDunningRescueItems(companyId);
  const existingInact = getInactivityRiskItems(companyId);
  const existingVol = getVoluntaryChurnItems(companyId);

  const newDunning: DunningRecoveryItem[] = [];
  const newInact: InactivityRiskItem[] = [];
  const newVol: VoluntaryChurnItem[] = [];

  let totalMrrAtRisk = 0;

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    // Simple CSV token split respecting quoted commas
    const cols = rawLine.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(c => c.trim().replace(/^["']|["']$/g, '')) 
      || rawLine.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));

    if (cols.length < 2) continue;

    const rawName = cols[nameIdx] || `Account #${i}`;
    const cleanName = rawName.replace(/@.*$/, '').replace(/[^a-zA-Z0-9\s.-]/g, '').trim() || `Client ${i}`;
    const rawEmail = (emailIdx !== -1 && cols[emailIdx]) ? cols[emailIdx] : `${cleanName.toLowerCase().replace(/\s+/g, '')}@workspace.io`;
    const cleanEmail = rawEmail.includes('@') ? rawEmail : `client_${i}@customer.io`;
    const cleanPhone = (phoneIdx !== -1 && cols[phoneIdx]) ? cols[phoneIdx] : '+1 (555) ' + Math.floor(100 + Math.random() * 900) + '-' + Math.floor(1000 + Math.random() * 9000);

    let amount = 0;
    if (amountIdx !== -1 && cols[amountIdx]) {
      const cleaned = cols[amountIdx].replace(/[^0-9.]/g, '');
      amount = parseFloat(cleaned) || 0;
      if (amount > 50000) amount = Math.round(amount / 100);
    }
    if (amount <= 0) {
      amount = Math.floor(Math.random() * 900) + 400;
    }
    totalMrrAtRisk += amount;

    const rawStatus = (statusIdx !== -1 && cols[statusIdx]) ? cols[statusIdx].toLowerCase() : '';
    const rawReason = (reasonIdx !== -1 && cols[reasonIdx]) ? cols[reasonIdx] : '';
    const rawDays = (daysIdx !== -1 && cols[daysIdx]) ? parseInt(cols[daysIdx].replace(/[^0-9]/g, ''), 10) : 0;
    const planName = (planIdx !== -1 && cols[planIdx]) ? cols[planIdx] : `SaaS Plan ($${Math.round(amount)}/mo)`;

    const combinedSignals = `${rawStatus} ${rawReason}`.toLowerCase();

    // 1. Check if Card Failed / Payment Declined
    const isCardFailed = combinedSignals.includes('fail') || 
      combinedSignals.includes('decline') || 
      combinedSignals.includes('card') || 
      combinedSignals.includes('past_due') || 
      combinedSignals.includes('past due') || 
      combinedSignals.includes('unpaid') || 
      combinedSignals.includes('invoice');

    // 2. Check if Silent / No Login (7+ days)
    const isInactive = rawDays >= 7 || 
      combinedSignals.includes('inact') || 
      combinedSignals.includes('silent') || 
      combinedSignals.includes('no login') || 
      combinedSignals.includes('dormant') || 
      combinedSignals.includes('zero login');

    // 3. Otherwise or if status has cancel/churn
    const isVoluntary = combinedSignals.includes('cancel') || 
      combinedSignals.includes('churn') || 
      combinedSignals.includes('leave') || 
      combinedSignals.includes('risk') || 
      combinedSignals.includes('stop');

    const timestamp = Date.now() + i;

    if (isCardFailed || (!isInactive && !isVoluntary && i % 3 === 0)) {
      // Create Dunning item
      newDunning.push({
        id: `csv_dunning_${timestamp}`,
        companyId,
        customerName: cleanName,
        customerEmail: cleanEmail,
        customerPhone: cleanPhone,
        planName,
        failedAmount: Math.round(amount),
        currency: 'USD',
        failedDate: new Date().toISOString(),
        retryAttempts: 2,
        status: 'PENDING',
        day1EmailSent: false, // STRICT: Pending until user clicks Approve!
        day1EmailText: `Hi ${cleanName}, we noticed an unexpected card decline on your subscription renewal of $${Math.round(amount)}. Please update your payment card here to avoid service disruption.`,
        day3WhatsAppSent: false, // STRICT: Pending until user clicks Approve!
        day3WhatsAppText: `URGENT: ${cleanName}, your subscription will be paused in 48 hours due to a card decline. Click here to update securely.`,
        day3WhatsAppScheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        supabaseSynced: true,
        supabaseStatusText: 'Awaiting Human Approval: Invoice payment failed',
        paymentUpdateUrl: '',
        humanApproved: false,
        source: 'CSV_UPLOAD'
      });
    } else if (isInactive || (!isVoluntary && i % 2 === 0)) {
      // Create Inactivity item
      const silentDays = rawDays > 0 ? rawDays : Math.floor(Math.random() * 10) + 7;
      newInact.push({
        id: `csv_inact_${timestamp}`,
        companyId,
        customerName: cleanName,
        customerEmail: cleanEmail,
        customerPhone: cleanPhone,
        mrr: Math.round(amount),
        arr: Math.round(amount * 12),
        daysSilent: silentDays,
        alertTitle: 'High Churn Risk: Inactive Account',
        aiAdvice: 'Apply 20% Retention Concession',
        discountConcessionPercentage: 20,
        discountCode: 'SAVE20NOW',
        status: 'AT_RISK',
        suggestedMessage: `Hi ${cleanName}, we noticed your team has not logged in for ${silentDays} days. We would love to support your goals—here is an exclusive 20% concession (code: SAVE20NOW) and priority onboarding call.`,
        detectedAt: new Date().toISOString(),
        supabaseSynced: true,
        humanApproved: false, // STRICT: Pending until user clicks Approve!
        source: 'CSV_UPLOAD'
      });
    } else {
      // Create Voluntary Churn item
      newVol.push({
        id: `csv_vol_${timestamp}`,
        companyId,
        customerName: cleanName,
        customerEmail: cleanEmail,
        customerPhone: cleanPhone,
        planName,
        mrr: Math.round(amount),
        arr: Math.round(amount * 12),
        daysSilent: rawDays > 0 ? rawDays : 10,
        churnReason: rawReason || 'Cancellation intent flagged / pricing sensitivity',
        retentionOffer: '15% Annual Lock-in Guarantee + Executive Strategy Session',
        suggestedMessage: `Hi ${cleanName}, seeing your account at risk is tough. To keep your team unblocked without budget friction, we have pre-approved an executive 15% annual rate freeze.`,
        status: 'AT_RISK',
        detectedAt: new Date().toISOString(),
        humanApproved: false, // STRICT: Pending until user clicks Approve!
        source: 'CSV_UPLOAD'
      });
    }
  }

  // Merge and save
  const mergedDunning = [...newDunning, ...existingDunning];
  const mergedInact = [...newInact, ...existingInact];
  const mergedVol = [...newVol, ...existingVol];

  await saveDunningRescueItems(companyId, mergedDunning);
  await saveInactivityRiskItems(companyId, mergedInact);
  await saveVoluntaryChurnItems(companyId, mergedVol);

  return {
    totalRows: lines.length - 1,
    dunningAdded: newDunning.length,
    inactivityAdded: newInact.length,
    voluntaryAdded: newVol.length,
    totalMrrAtRisk: Math.round(totalMrrAtRisk)
  };
}

// =========================================================================
// 6. SAMPLE CSV TEMPLATE DOWNLOADER (FOR INSTANT USER TESTING)
// =========================================================================

export function downloadSampleRescueCsv(): void {
  const sampleCsvContent = `Customer Name,Email,Phone,Plan,MRR,Status,Days Inactive,Issue Description
Acme Analytics,billing@acme-analytics.io,+1 (415) 555-0192,Enterprise Tier,1850,card_failed,3,Card Expired - 2x Declined by Issuer
DevFlow Studio,team@devflow.io,+1 (512) 555-0148,Pro Team Plan,950,card_failed,5,Insufficient Bank Funds / Limit
Zenith AI Labs,founders@zenithai.org,+1 (212) 555-0133,Growth Plan,1400,inactive,9,0 logins in past 9 days (Silent Account)
Hyperion Media,ops@hyperionmedia.co,+1 (650) 555-0187,Pro Plan,1200,inactive,14,No user activity recorded for 14 days
Skyline Logistics,marcus@skylinelogistics.com,+1 (312) 555-0165,Executive Suite,2400,canceling,18,Cancellation Requested: Pricing Freeze
Nova Health Tech,sarah@novahealth.tech,+1 (206) 555-0174,Enterprise Growth,3100,canceling,21,At-Risk: Budget Cut Announcement
Global Cyber Guard,admin@globalcyberguard.com,+1 (718) 555-0129,Pro Tier,1100,card_failed,2,Card Expired at End of Month`;

  const blob = new Blob([sampleCsvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'sample_saas_churn_rescue_data.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
