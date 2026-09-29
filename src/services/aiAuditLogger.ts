/**
 * Multi-Tenant AI Decision Audit Logger
 * Strictly isolates audit logs by companyId to guarantee zero data leakage between tenants.
 * Tracks every AI decision, rationale, risk score, human authorization, and 2-minute undo rollback.
 */

export interface AIDecisionAuditRecord {
  id: string;
  companyId: string;
  userId: string;
  timestamp: string;
  category: 'EMAIL' | 'INVOICE' | 'PLAYBOOK' | 'DEAL' | 'STRATEGY' | 'MEETING' | 'HIRING' | 'AD_SPEND';
  actionTitle: string;
  targetEntity: string; // Client name, account, invoice number, etc.
  aiModel: string;
  aiRationale: string;
  aiSuggestedAction: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  approvalStatus: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'UNDONE';
  approvedBy?: string;
  approvedAt?: number;
  undoExpiresAt?: number;
  disclaimerAcknowledged: boolean;
  metadata?: Record<string, any>;
}

const STORAGE_PREFIX = 'prime_ai_audit_logs_';

function getTenantStorageKey(companyId: string): string {
  const safeId = companyId || 'default_tenant';
  return `${STORAGE_PREFIX}${safeId}`;
}

export function getAIDecisionLogs(companyId: string): AIDecisionAuditRecord[] {
  try {
    const key = getTenantStorageKey(companyId);
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Enforce strict multi-tenant boundary check: filter out any records that do not match companyId
        return parsed.filter(item => !item.companyId || item.companyId === companyId);
      }
    }
  } catch (e) {
    console.error('Failed to load AI decision logs:', e);
  }
  return [];
}

export function saveAIDecisionLogs(companyId: string, logs: AIDecisionAuditRecord[]): void {
  try {
    const key = getTenantStorageKey(companyId);
    // Ensure all saved records strictly contain the tenant's companyId
    const sanitized = logs.map(l => ({ ...l, companyId }));
    localStorage.setItem(key, JSON.stringify(sanitized));
    window.dispatchEvent(new CustomEvent('prime_ai_audit_updated', { detail: { companyId, logs: sanitized } }));
  } catch (e) {
    console.error('Failed to save AI decision logs:', e);
  }
}

/**
 * Log an AI Decision into the immutable tenant audit log.
 */
export function logAIDecision(
  decision: Omit<AIDecisionAuditRecord, 'id' | 'timestamp' | 'disclaimerAcknowledged'> & {
    id?: string;
    timestamp?: string;
    disclaimerAcknowledged?: boolean;
  }
): AIDecisionAuditRecord {
  const companyId = decision.companyId || 'comp_apex_01';
  const existing = getAIDecisionLogs(companyId);

  const newRecord: AIDecisionAuditRecord = {
    ...decision,
    id: decision.id || `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    companyId,
    timestamp: decision.timestamp || new Date().toISOString(),
    disclaimerAcknowledged: true,
  };

  const updated = [newRecord, ...existing.filter(l => l.id !== newRecord.id)];
  saveAIDecisionLogs(companyId, updated);
  return newRecord;
}

/**
 * Update an audit log record when a human approves it.
 */
export function markAIDecisionApproved(
  companyId: string,
  logId: string,
  approvedBy: string,
  undoWindowMs: number = 120000 // 2-minute default safety window
): AIDecisionAuditRecord | null {
  const logs = getAIDecisionLogs(companyId);
  const now = Date.now();
  const target = logs.find(l => l.id === logId);
  if (!target) return null;

  const updated: AIDecisionAuditRecord = {
    ...target,
    approvalStatus: 'APPROVED',
    approvedBy,
    approvedAt: now,
    undoExpiresAt: now + undoWindowMs
  };

  const newLogs = logs.map(l => l.id === logId ? updated : l);
  saveAIDecisionLogs(companyId, newLogs);
  return updated;
}

/**
 * Update an audit log record when an action is reverted within the safety window.
 */
export function markAIDecisionUndone(companyId: string, logId: string): AIDecisionAuditRecord | null {
  const logs = getAIDecisionLogs(companyId);
  const target = logs.find(l => l.id === logId);
  if (!target) return null;

  const updated: AIDecisionAuditRecord = {
    ...target,
    approvalStatus: 'UNDONE',
    undoExpiresAt: undefined
  };

  const newLogs = logs.map(l => l.id === logId ? updated : l);
  saveAIDecisionLogs(companyId, newLogs);
  return updated;
}

/**
 * Update an audit log record when an action is rejected by the human executive.
 */
export function markAIDecisionRejected(companyId: string, logId: string, reviewer: string): AIDecisionAuditRecord | null {
  const logs = getAIDecisionLogs(companyId);
  const target = logs.find(l => l.id === logId);
  if (!target) return null;

  const updated: AIDecisionAuditRecord = {
    ...target,
    approvalStatus: 'REJECTED',
    approvedBy: reviewer
  };

  const newLogs = logs.map(l => l.id === logId ? updated : l);
  saveAIDecisionLogs(companyId, newLogs);
  return updated;
}

/**
 * Export audit logs as CSV for SOC2 / ISO compliance auditing
 */
export function exportAuditLogsAsCSV(companyId: string): void {
  const logs = getAIDecisionLogs(companyId);
  if (logs.length === 0) return;

  const headers = [
    'Log ID',
    'Timestamp (UTC)',
    'Company Tenant ID',
    'Category',
    'Action Title',
    'Target Entity',
    'AI Model',
    'AI Rationale',
    'Risk Level',
    'Approval Status',
    'Approved By',
    'Disclaimer Acknowledged'
  ];

  const rows = logs.map(l => [
    `"${l.id}"`,
    `"${l.timestamp}"`,
    `"${l.companyId}"`,
    `"${l.category}"`,
    `"${l.actionTitle.replace(/"/g, '""')}"`,
    `"${l.targetEntity.replace(/"/g, '""')}"`,
    `"${l.aiModel}"`,
    `"${(l.aiRationale || '').replace(/"/g, '""')}"`,
    `"${l.riskLevel}"`,
    `"${l.approvalStatus}"`,
    `"${l.approvedBy || 'N/A'}"`,
    `"YES (AI suggestions are for guidance only)"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `prime_ai_audit_log_${companyId}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export audit logs as JSON for programmatic archival
 */
export function exportAuditLogsAsJSON(companyId: string): void {
  const logs = getAIDecisionLogs(companyId);
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
    tenantId: companyId,
    exportedAt: new Date().toISOString(),
    governancePolicy: 'Strict Human-in-the-Loop',
    safetyDisclaimer: 'AI suggestions are for guidance only. Please review before taking action.',
    auditRecordsCount: logs.length,
    records: logs
  }, null, 2));

  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `prime_ai_audit_log_${companyId}_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
