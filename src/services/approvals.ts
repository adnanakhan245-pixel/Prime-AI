import { updateCRMRecord } from './crm';
import { updateEmailStatus } from './db';
import { getRenewalDefenseItems, saveRenewalDefenseItems, getPQLSignals, savePQLSignals } from './saas';
import { logAIDecision, markAIDecisionApproved, markAIDecisionUndone, markAIDecisionRejected } from './aiAuditLogger';

export interface AIActionItem {
  id: string;
  companyId?: string;
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

export const INITIAL_SAMPLE_ACTIONS: AIActionItem[] = [];

function getApprovalsKey(companyId?: string): string {
  const comp = companyId || localStorage.getItem('prime_ai_active_company_id') || 'comp_apex_01';
  return `prime_ai_approvals_${comp}`;
}

export function getApprovalActions(companyId?: string): AIActionItem[] {
  try {
    const key = getApprovalsKey(companyId);
    let raw = localStorage.getItem(key);
    if (!raw && !companyId) {
      // Legacy fallback
      raw = localStorage.getItem(APPROVALS_STORAGE_KEY);
    }
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Strip out any legacy sample actions
        const targetCompany = companyId || localStorage.getItem('prime_ai_active_company_id') || 'comp_apex_01';
        const filtered = parsed.filter(a => {
          if (['act-101', 'act-102', 'act-103', 'act-104', 'act-105'].includes(a.id)) return false;
          // Multi-tenant isolation: strictly ensure companyId matches if present
          if (a.companyId && a.companyId !== targetCompany) return false;
          return true;
        });
        return filtered;
      }
    }
  } catch (e) {
    console.error('Failed to load approval actions:', e);
  }
  return [];
}

export function saveApprovalActions(actions: AIActionItem[], companyId?: string): void {
  try {
    const key = getApprovalsKey(companyId);
    const targetComp = companyId || localStorage.getItem('prime_ai_active_company_id') || 'comp_apex_01';
    const sanitized = actions.map(a => ({ ...a, companyId: a.companyId || targetComp }));
    localStorage.setItem(key, JSON.stringify(sanitized));
    // Also update legacy key for backward compatibility
    localStorage.setItem(APPROVALS_STORAGE_KEY, JSON.stringify(sanitized));
    window.dispatchEvent(new CustomEvent('prime_approvals_changed', { detail: { actions: sanitized, companyId: targetComp } }));
  } catch (e) {
    console.error('Failed to save approval actions:', e);
  }
}

/**
 * Queue an autonomous action that requires human approval.
 * Guarantees that zero actions are executed silently.
 */
export function queueApprovalAction(action: Omit<AIActionItem, 'id' | 'createdAt' | 'status'> & { id?: string; companyId?: string }): AIActionItem {
  const companyId = action.companyId || action.undoData?.companyId || localStorage.getItem('prime_ai_active_company_id') || 'comp_apex_01';
  const currentActions = getApprovalActions(companyId);
  const newAction: AIActionItem = {
    ...action,
    companyId,
    id: action.id || `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    status: 'PENDING',
  };

  const updated = [newAction, ...currentActions.filter(a => a.id !== newAction.id)];
  saveApprovalActions(updated, companyId);

  // Also log into multi-tenant AI Decision Audit Log
  logAIDecision({
    id: newAction.id,
    companyId,
    userId: newAction.undoData?.userId || 'executive_user',
    category: newAction.category === 'email' ? 'EMAIL' : newAction.category === 'finance' ? 'INVOICE' : newAction.category === 'crm' ? 'DEAL' : 'PLAYBOOK',
    actionTitle: newAction.actionName,
    targetEntity: newAction.target,
    aiModel: 'Gemini 3.7 Flash',
    aiRationale: newAction.details,
    aiSuggestedAction: `Requires explicit human authorization before execution.`,
    riskLevel: newAction.impactLevel,
    approvalStatus: 'PENDING_REVIEW'
  });

  window.dispatchEvent(new CustomEvent('prime_action_queued', { detail: { action: newAction } }));
  return newAction;
}

/**
 * Record an action that was just approved by the human executive.
 * Creates an audit log entry with an active 2-minute Undo window.
 */
export function recordApprovedAction(
  actionData: Omit<AIActionItem, 'id' | 'createdAt' | 'status' | 'approvedAt' | 'undoExpiresAt'> & { id?: string; companyId?: string }
): AIActionItem {
  const companyId = actionData.companyId || actionData.undoData?.companyId || localStorage.getItem('prime_ai_active_company_id') || 'comp_apex_01';
  const currentActions = getApprovalActions(companyId);
  const currentTime = Date.now();
  const undoLimit = currentTime + 120 * 1000; // 2 minutes Undo safety window

  const approvedAction: AIActionItem = {
    ...actionData,
    companyId,
    id: actionData.id || `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    status: 'APPROVED',
    approvedAt: currentTime,
    undoExpiresAt: undoLimit,
    executionLog: `Approved & Executed by Executive at ${new Date(currentTime).toLocaleTimeString()} (2-minute Undo window active)`,
  };

  const updated = [approvedAction, ...currentActions.filter(a => a.id !== approvedAction.id)];
  saveApprovalActions(updated, companyId);

  // Sync to multi-tenant AI Decision Audit Log
  logAIDecision({
    id: approvedAction.id,
    companyId,
    userId: approvedAction.undoData?.userId || 'executive_user',
    category: approvedAction.category === 'email' ? 'EMAIL' : approvedAction.category === 'finance' ? 'INVOICE' : approvedAction.category === 'crm' ? 'DEAL' : 'PLAYBOOK',
    actionTitle: approvedAction.actionName,
    targetEntity: approvedAction.target,
    aiModel: 'Gemini 3.7 Flash',
    aiRationale: approvedAction.details,
    aiSuggestedAction: approvedAction.executionLog || 'Approved by human executive',
    riskLevel: approvedAction.impactLevel,
    approvalStatus: 'APPROVED',
    approvedBy: 'Human Executive',
    approvedAt: currentTime,
    undoExpiresAt: undoLimit
  });

  window.dispatchEvent(new CustomEvent('prime_action_approved', { detail: { action: approvedAction } }));
  return approvedAction;
}

/**
 * Human approves a pending action.
 * Executes the real underlying system task (e.g. moves the deal, sends the email)
 * and activates the 2-minute Undo window.
 */
export async function approveAction(id: string, companyId?: string): Promise<AIActionItem | null> {
  const compId = companyId || localStorage.getItem('prime_ai_active_company_id') || 'comp_apex_01';
  const actions = getApprovalActions(compId);
  const target = actions.find(a => a.id === id);
  if (!target) return null;

  const currentTime = Date.now();
  const undoLimit = currentTime + 120 * 1000; // 2 minutes

  // Execute underlying system effects if applicable
  if ((target.actionType === 'MOVE_DEAL' || target.actionType === 'MOVE_DEAL_STAGE') && target.undoData) {
    const { companyId: cId, userId, dealId, newStage } = target.undoData;
    if (dealId && newStage) {
      await updateCRMRecord(cId || compId, userId || 'demo_user', dealId, {
        stage: newStage as any,
        updatedAt: new Date().toISOString()
      });
      window.dispatchEvent(new CustomEvent('prime_deal_updated', { detail: { dealId, newStage } }));
    }
  } else if (target.actionType === 'SEND_EMAIL' && target.undoData) {
    const { companyId: cId, userId, emailId } = target.undoData;
    if (emailId) {
      await updateEmailStatus(cId || compId, userId || 'demo_user', emailId, 'SENT');
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
  saveApprovalActions(updatedList, compId);

  // Sync to AI Decision Audit Log
  markAIDecisionApproved(compId, id, 'Human Executive', 120000);

  window.dispatchEvent(new CustomEvent('prime_action_approved', { detail: { action: updatedAction } }));
  return updatedAction;
}

/**
 * Reverts an approved action within the safety window.
 * Performs the actual state rollback (e.g. moves the deal back, cancels email transmission).
 */
export async function undoApprovedAction(id: string, companyId?: string): Promise<AIActionItem | null> {
  const compId = companyId || localStorage.getItem('prime_ai_active_company_id') || 'comp_apex_01';
  const actions = getApprovalActions(compId);
  const target = actions.find(a => a.id === id);
  if (!target) return null;

  // Perform actual rollback
  if ((target.actionType === 'MOVE_DEAL' || target.actionType === 'MOVE_DEAL_STAGE') && target.undoData) {
    const { companyId: cId, userId, dealId, previousStage } = target.undoData;
    if (dealId && previousStage) {
      await updateCRMRecord(cId || compId, userId || 'demo_user', dealId, {
        stage: previousStage as any,
        updatedAt: new Date().toISOString()
      });
      window.dispatchEvent(new CustomEvent('prime_deal_updated', { detail: { dealId, stage: previousStage, undone: true } }));
    }
  } else if (target.actionType === 'SEND_EMAIL' && target.undoData) {
    const { companyId: cId, userId, emailId, previousEmailStatus } = target.undoData;
    if (emailId) {
      const rollbackStatus = (previousEmailStatus as any) || 'PENDING_REVIEW';
      await updateEmailStatus(cId || compId, userId || 'demo_user', emailId, rollbackStatus);
      window.dispatchEvent(new CustomEvent('prime_email_status_updated', { detail: { emailId, status: rollbackStatus, undone: true } }));
    }
  } else if ((target.actionType === 'LOCK_IN_CONTRACT' || target.actionType === 'MULTI_YEAR_LOCK') && target.undoData) {
    const { companyId: cId, renewalItemId, previousStatus } = target.undoData;
    if (renewalItemId) {
      const activeCo = cId || compId;
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
    const { companyId: cId, pqlId, previousStatus } = target.undoData;
    if (pqlId) {
      const activeCo = cId || compId;
      const pqls = getPQLSignals(activeCo);
      const restored = pqls.map(p => p.id === pqlId ? {
        ...p,
        status: (previousStatus as any) || 'NEW_OPPORTUNITY'
      } : p);
      savePQLSignals(activeCo, restored);
      window.dispatchEvent(new CustomEvent('prime_pql_updated', { detail: { pqlId, undone: true } }));
    }
  } else if (target.actionType === 'APPLY_CONCESSION' && target.undoData) {
    const { companyId: cId, userId, dealId, previousHealth, previousStage } = target.undoData;
    if (dealId) {
      await updateCRMRecord(cId || compId, userId || 'demo_user', dealId, {
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
    executionLog: `Rolled back by Executive within 2-minute safety window at ${new Date().toLocaleTimeString()}`
  };

  const updatedList = actions.map(a => a.id === id ? undoneAction : a);
  saveApprovalActions(updatedList, compId);

  // Sync to multi-tenant AI Decision Audit Log
  markAIDecisionUndone(compId, id);

  window.dispatchEvent(new CustomEvent('prime_action_undone', { detail: { action: undoneAction } }));
  return undoneAction;
}

/**
 * Reject / dismiss a pending action.
 */
export function rejectAction(id: string, companyId?: string): AIActionItem | null {
  const compId = companyId || localStorage.getItem('prime_ai_active_company_id') || 'comp_apex_01';
  const actions = getApprovalActions(compId);
  const target = actions.find(a => a.id === id);
  if (!target) return null;

  const rejectedAction: AIActionItem = {
    ...target,
    status: 'REJECTED',
    executionLog: `Rejected & Cancelled by Executive at ${new Date().toLocaleTimeString()}`
  };

  const updatedList = actions.map(a => a.id === id ? rejectedAction : a);
  saveApprovalActions(updatedList, compId);

  // Sync to AI Decision Audit Log
  markAIDecisionRejected(compId, id, 'Human Executive');

  window.dispatchEvent(new CustomEvent('prime_action_rejected', { detail: { action: rejectedAction } }));
  return rejectedAction;
}
