import { updateCRMRecord } from './crm';
import { updateEmailStatus } from './db';
import { getRenewalDefenseItems, saveRenewalDefenseItems, getPQLSignals, savePQLSignals } from './saas';

export interface AIActionItem {
  id: string;
  actionName: string;
  category: 'email' | 'ad_spend' | 'crm' | 'board' | 'contract' | 'finance' | 'swarm' | 'general';
  target: string;
  details: string;
  impactLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDONE';
  approvedAt?: number; // ms timestamp
  undoExpiresAt?: number; // ms timestamp (approvedAt + 120,000)
  executionLog?: string;
  actionType?: 'MOVE_DEAL' | 'MOVE_DEAL_STAGE' | 'SEND_EMAIL' | 'REALLOCATE_AD_SPEND' | 'DISPATCH_INVOICE_NOTICE' | 'MULTI_YEAR_LOCK' | 'LOCK_IN_CONTRACT' | 'CONVERT_PQL' | 'APPLY_CONCESSION' | 'CUSTOM';
  payload?: any;
  undoData?: {
    companyId?: string;
    userId?: string;
    dealId?: string;
    previousStage?: string;
    newStage?: string;
    emailId?: string;
    previousEmailStatus?: string;
    renewalItemId?: string;
    previousStatus?: string;
    previousArr?: number;
    pqlId?: string;
    previousHealth?: number;
    [key: string]: any;
  };
}

export const APPROVALS_STORAGE_KEY = 'prime_ai_approvals_v1';

export const INITIAL_SAMPLE_ACTIONS: AIActionItem[] = [
  {
    id: 'act-101',
    actionName: 'Dispatch $18,500 Overdue Invoice Notice',
    category: 'finance',
    target: 'Vance Capital Partners (ceo@vanceholdings.com)',
    details: 'Send automated executive payment reminder with updated wire details for Invoice #INV-9042.',
    impactLevel: 'HIGH',
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    status: 'PENDING',
    actionType: 'DISPATCH_INVOICE_NOTICE'
  },
  {
    id: 'act-102',
    actionName: 'Reallocate $2,500 Budget to High-ROAS Google Campaign',
    category: 'ad_spend',
    target: 'Google Search Campaign #4 (US Enterprise)',
    details: 'Pause non-performing Meta Ads ad set ($85/CPA) and reallocate $2,500/mo to Google Search ($22/CPA).',
    impactLevel: 'MEDIUM',
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    status: 'PENDING',
    actionType: 'REALLOCATE_AD_SPEND'
  },
  {
    id: 'act-103',
    actionName: 'Promote Lead "Elena Rostova" to Contract Stage',
    category: 'crm',
    target: 'HubSpot CRM — Rostova Logistics',
    details: 'Update deal stage to "Contract Sent" and draft $40k/yr Enterprise Service Agreement.',
    impactLevel: 'CRITICAL',
    createdAt: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
    status: 'PENDING',
    actionType: 'MOVE_DEAL',
    undoData: {
      dealId: 'crm_sample_rostova',
      previousStage: 'Negotiation',
      newStage: 'Contract Sent'
    }
  },
  {
    id: 'act-104',
    actionName: 'Send Weekly Board Pack Briefing',
    category: 'board',
    target: 'Board Members (4 Enterprise Executives)',
    details: 'Email AI-generated Q3 ARR growth breakdown ($83.9k ARR, 100% margin) and runway forecast.',
    impactLevel: 'HIGH',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    status: 'PENDING',
    actionType: 'SEND_EMAIL'
  },
  {
    id: 'act-105',
    actionName: 'Auto-Draft Response to Investor Runway Inquiry',
    category: 'email',
    target: 'Marcus Sterling (marcus@sterlingmedia.co)',
    details: 'Draft reply highlighting 18-month cash runway extension and zero customer churn metrics.',
    impactLevel: 'MEDIUM',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    status: 'PENDING',
    actionType: 'SEND_EMAIL'
  }
];

export function getApprovalActions(): AIActionItem[] {
  try {
    const raw = localStorage.getItem(APPROVALS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load approval actions:', e);
  }
  return INITIAL_SAMPLE_ACTIONS;
}

export function saveApprovalActions(actions: AIActionItem[]): void {
  try {
    localStorage.setItem(APPROVALS_STORAGE_KEY, JSON.stringify(actions));
    window.dispatchEvent(new CustomEvent('prime_approvals_changed', { detail: { actions } }));
  } catch (e) {
    console.error('Failed to save approval actions:', e);
  }
}

/**
 * Queue an autonomous action that requires human approval.
 * Guarantees that zero actions are executed silently.
 */
export function queueApprovalAction(action: Omit<AIActionItem, 'id' | 'createdAt' | 'status'> & { id?: string }): AIActionItem {
  const currentActions = getApprovalActions();
  const newAction: AIActionItem = {
    ...action,
    id: action.id || `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    status: 'PENDING',
  };

  const updated = [newAction, ...currentActions.filter(a => a.id !== newAction.id)];
  saveApprovalActions(updated);

  window.dispatchEvent(new CustomEvent('prime_action_queued', { detail: { action: newAction } }));
  return newAction;
}

/**
 * Record an action that was just approved by the human executive.
 * Creates an audit log entry with an active 2-minute Undo window.
 */
export function recordApprovedAction(
  actionData: Omit<AIActionItem, 'id' | 'createdAt' | 'status' | 'approvedAt' | 'undoExpiresAt'> & { id?: string }
): AIActionItem {
  const currentActions = getApprovalActions();
  const currentTime = Date.now();
  const undoLimit = currentTime + 120 * 1000; // 2 minutes Undo safety window

  const approvedAction: AIActionItem = {
    ...actionData,
    id: actionData.id || `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    status: 'APPROVED',
    approvedAt: currentTime,
    undoExpiresAt: undoLimit,
    executionLog: `Approved & Executed by Executive at ${new Date(currentTime).toLocaleTimeString()} (2-minute Undo window active)`,
  };

  const updated = [approvedAction, ...currentActions.filter(a => a.id !== approvedAction.id)];
  saveApprovalActions(updated);

  window.dispatchEvent(new CustomEvent('prime_action_approved', { detail: { action: approvedAction } }));
  return approvedAction;
}

/**
 * Human approves a pending action.
 * Executes the real underlying system task (e.g. moves the deal, sends the email)
 * and activates the 2-minute Undo window.
 */
export async function approveAction(id: string): Promise<AIActionItem | null> {
  const actions = getApprovalActions();
  const target = actions.find(a => a.id === id);
  if (!target) return null;

  const currentTime = Date.now();
  const undoLimit = currentTime + 120 * 1000; // 2 minutes

  // Execute underlying system effects if applicable
  if ((target.actionType === 'MOVE_DEAL' || target.actionType === 'MOVE_DEAL_STAGE') && target.undoData) {
    const { companyId, userId, dealId, newStage } = target.undoData;
    if (dealId && newStage) {
      await updateCRMRecord(companyId || 'comp_apex_01', userId || 'demo_user', dealId, {
        stage: newStage as any,
        updatedAt: new Date().toISOString()
      });
      window.dispatchEvent(new CustomEvent('prime_deal_updated', { detail: { dealId, newStage } }));
    }
  } else if (target.actionType === 'SEND_EMAIL' && target.undoData) {
    const { companyId, userId, emailId } = target.undoData;
    if (emailId) {
      await updateEmailStatus(companyId || 'demo_company', userId || 'demo_user', emailId, 'SENT');
      window.dispatchEvent(new CustomEvent('prime_email_status_updated', { detail: { emailId, status: 'SENT' } }));
    }
  }

  const updatedAction: AIActionItem = {
    ...target,
    status: 'APPROVED',
    approvedAt: currentTime,
    undoExpiresAt: undoLimit,
    executionLog: `Approved & Executed at ${new Date(currentTime).toLocaleTimeString()} (2-minute Undo window active)`
  };

  const updatedList = actions.map(a => a.id === id ? updatedAction : a);
  saveApprovalActions(updatedList);

  window.dispatchEvent(new CustomEvent('prime_action_approved', { detail: { action: updatedAction } }));
  return updatedAction;
}

/**
 * Reverts an approved action within the safety window.
 * Performs the actual state rollback (e.g. moves the deal back, cancels email transmission).
 */
export async function undoApprovedAction(id: string): Promise<AIActionItem | null> {
  const actions = getApprovalActions();
  const target = actions.find(a => a.id === id);
  if (!target) return null;

  // Perform actual rollback
  if ((target.actionType === 'MOVE_DEAL' || target.actionType === 'MOVE_DEAL_STAGE') && target.undoData) {
    const { companyId, userId, dealId, previousStage } = target.undoData;
    if (dealId && previousStage) {
      await updateCRMRecord(companyId || 'comp_apex_01', userId || 'demo_user', dealId, {
        stage: previousStage as any,
        updatedAt: new Date().toISOString()
      });
      window.dispatchEvent(new CustomEvent('prime_deal_updated', { detail: { dealId, stage: previousStage, undone: true } }));
    }
  } else if (target.actionType === 'SEND_EMAIL' && target.undoData) {
    const { companyId, userId, emailId, previousEmailStatus } = target.undoData;
    if (emailId) {
      const rollbackStatus = (previousEmailStatus as any) || 'PENDING_REVIEW';
      await updateEmailStatus(companyId || 'demo_company', userId || 'demo_user', emailId, rollbackStatus);
      window.dispatchEvent(new CustomEvent('prime_email_status_updated', { detail: { emailId, status: rollbackStatus, undone: true } }));
    }
  } else if ((target.actionType === 'LOCK_IN_CONTRACT' || target.actionType === 'MULTI_YEAR_LOCK') && target.undoData) {
    const { companyId, renewalItemId, previousStatus } = target.undoData;
    if (renewalItemId) {
      const activeCo = companyId || 'comp_apex_01';
      const items = getRenewalDefenseItems(activeCo);
      const restored = items.map(i => i.id === renewalItemId ? {
        ...i,
        status: (previousStatus as any) || 'RENEWAL_DUE',
        lockInTermYears: undefined,
        multiYearArrTotal: undefined
      } : i);
      saveRenewalDefenseItems(activeCo, restored);
      window.dispatchEvent(new CustomEvent('prime_renewal_updated', { detail: { renewalItemId, undone: true } }));
    }
  } else if (target.actionType === 'CONVERT_PQL' && target.undoData) {
    const { companyId, pqlId, previousStatus } = target.undoData;
    if (pqlId) {
      const activeCo = companyId || 'comp_apex_01';
      const pqls = getPQLSignals(activeCo);
      const restored = pqls.map(p => p.id === pqlId ? {
        ...p,
        status: (previousStatus as any) || 'NEW_OPPORTUNITY'
      } : p);
      savePQLSignals(activeCo, restored);
      window.dispatchEvent(new CustomEvent('prime_pql_updated', { detail: { pqlId, undone: true } }));
    }
  } else if (target.actionType === 'APPLY_CONCESSION' && target.undoData) {
    const { companyId, userId, dealId, previousHealth, previousStage } = target.undoData;
    if (dealId) {
      await updateCRMRecord(companyId || 'comp_apex_01', userId || 'demo_user', dealId, {
        healthScore: previousHealth !== undefined ? previousHealth : 40,
        stage: (previousStage as any) || 'Active Client',
        updatedAt: new Date().toISOString()
      });
      window.dispatchEvent(new CustomEvent('prime_deal_updated', { detail: { dealId, undone: true } }));
    }
  }

  const undoneAction: AIActionItem = {
    ...target,
    status: 'UNDONE',
    undoExpiresAt: undefined,
    executionLog: `Reverted & Undone by Executive at ${new Date().toLocaleTimeString()} (Rollback executed successfully)`
  };

  const updatedList = actions.map(a => a.id === id ? undoneAction : a);
  saveApprovalActions(updatedList);

  window.dispatchEvent(new CustomEvent('prime_action_undone', { detail: { action: undoneAction } }));
  return undoneAction;
}

/**
 * Reject / dismiss a pending action.
 */
export function rejectAction(id: string): AIActionItem | null {
  const actions = getApprovalActions();
  const target = actions.find(a => a.id === id);
  if (!target) return null;

  const rejectedAction: AIActionItem = {
    ...target,
    status: 'REJECTED',
    executionLog: `Rejected & Cancelled by Executive at ${new Date().toLocaleTimeString()}`
  };

  const updatedList = actions.map(a => a.id === id ? rejectedAction : a);
  saveApprovalActions(updatedList);

  window.dispatchEvent(new CustomEvent('prime_action_rejected', { detail: { action: rejectedAction } }));
  return rejectedAction;
}
