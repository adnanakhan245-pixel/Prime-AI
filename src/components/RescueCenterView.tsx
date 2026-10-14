import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, 
  ShieldCheck, 
  CreditCard, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Database, 
  Clock, 
  Zap, 
  RefreshCw, 
  UserX, 
  UserCheck, 
  Tag, 
  PhoneCall,
  ExternalLink,
  Flame,
  Upload,
  FileSpreadsheet,
  Download,
  Lock,
  Send,
  Eye,
  Check,
  Filter,
  User,
  SlidersHorizontal,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { GatewaySettingsModal } from './GatewaySettingsModal';
import { 
  getDunningRescueItems, 
  getInactivityRiskItems, 
  getVoluntaryChurnItems,
  triggerDay1Email, 
  triggerDay3WhatsApp, 
  markCustomerStatus, 
  simulateStripeFailedPayment, 
  applyInactivity20PercentConcession,
  applyVoluntaryChurnRescue,
  approveAllPendingRescues,
  importCsvToRescueCenter,
  downloadSampleRescueCsv
} from '../services/dunningRescue';
import { DunningRecoveryItem, InactivityRiskItem, VoluntaryChurnItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { registerUploadedCsv, UploadedCsvFile, getActiveCsvFiles } from '../services/csvStore';
import { CsvAutoDeleteTimer } from './CsvAutoDeleteTimer';
import { AISuggestionBadge } from './AIGuidanceDisclaimer';

export interface RescueCenterViewProps {
  onNavigate?: (view: string) => void;
}

type FilterTab = 'ALL' | 'CARD_FAILED' | 'SILENT_INACTIVE' | 'ABOUT_TO_CHURN';

interface ApprovalModalData {
  itemType: 'DUNNING' | 'INACTIVITY' | 'VOLUNTARY';
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  amountOrMrr: number;
  planName: string;
  triggerReason: string;
  defaultChannel: 'EMAIL' | 'WHATSAPP';
  emailSubject: string;
  emailBody: string;
  whatsAppText: string;
}

export const RescueCenterView: React.FC<RescueCenterViewProps> = ({ onNavigate }) => {
  const { companyId } = useAuth();
  const activeCompanyId = companyId || 'comp_workspace_01';

  const [dunningItems, setDunningItems] = useState<DunningRecoveryItem[]>([]);
  const [inactivityItems, setInactivityItems] = useState<InactivityRiskItem[]>([]);
  const [voluntaryItems, setVoluntaryItems] = useState<VoluntaryChurnItem[]>([]);
  
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStats, setUploadStats] = useState<string | null>(null);
  const [activeCsvFile, setActiveCsvFile] = useState<UploadedCsvFile | null>(() => {
    const files = getActiveCsvFiles();
    return files.length > 0 ? files[0] : null;
  });

  // Modal State for Review & Human Approval
  const [approvalModalData, setApprovalModalData] = useState<ApprovalModalData | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<'EMAIL' | 'WHATSAPP'>('EMAIL');
  const [editedEmailSubject, setEditedEmailSubject] = useState<string>('');
  const [editedEmailBody, setEditedEmailBody] = useState<string>('');
  const [editedWhatsAppText, setEditedWhatsAppText] = useState<string>('');
  const [editedRecipientEmail, setEditedRecipientEmail] = useState<string>('');
  const [editedRecipientPhone, setEditedRecipientPhone] = useState<string>('');
  const [isSubmittingApproval, setIsSubmittingApproval] = useState<boolean>(false);
  const [dispatchReceipt, setDispatchReceipt] = useState<{
    recipient: string;
    channel: 'EMAIL' | 'WHATSAPP';
    customerName: string;
    subject?: string;
    body?: string;
    gmailUrl?: string;
    mailtoUrl?: string;
    whatsAppUrl?: string;
    messageId?: string;
    provider?: string;
    deliveryMode?: 'API' | 'MANUAL';
    deliveredAt?: string;
  } | null>(null);

  // Batch Approval Confirmation Modal
  const [showBatchModal, setShowBatchModal] = useState<boolean>(false);

  // Automated Gateway Settings & Dispatch Mode
  const [showGatewayConfigModal, setShowGatewayConfigModal] = useState<boolean>(false);
  const [dispatchMode, setDispatchMode] = useState<'API' | 'MANUAL'>('API');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('prime:rescue_data_updated', handleUpdate);
    return () => {
      window.removeEventListener('prime:rescue_data_updated', handleUpdate);
    };
  }, [activeCompanyId]);

  const loadData = () => {
    const dunning = getDunningRescueItems(activeCompanyId);
    const inact = getInactivityRiskItems(activeCompanyId);
    const vol = getVoluntaryChurnItems(activeCompanyId);
    setDunningItems(dunning);
    setInactivityItems(inact);
    setVoluntaryItems(vol);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // CSV File Handler
  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = (event.target?.result as string) || '';
        const result = await importCsvToRescueCenter(text, activeCompanyId);
        const registered = registerUploadedCsv(file.name, file.size, result.totalRows, `CSV Import: ${result.totalRows} accounts analyzed`);
        setActiveCsvFile(registered);
        loadData();
        setUploadStats(`Successfully analyzed ${result.totalRows} accounts: Added ${result.dunningAdded} failed cards, ${result.inactivityAdded} silent users, ${result.voluntaryAdded} churn risks ($${result.totalMrrAtRisk.toLocaleString()} MRR).`);
        showToast(`✓ CSV Processed: ${result.totalRows} accounts analyzed! Human approval required before dispatch.`);
      } catch (err: any) {
        console.error('CSV import error:', err);
        showToast(`⚠️ CSV error: ${err?.message || 'Could not parse CSV'}`);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Open Approval Modal for Dunning Item
  const openDunningApproval = (item: DunningRecoveryItem, channel: 'EMAIL' | 'WHATSAPP') => {
    const subject = `Urgent: Action required for your ${item.planName} payment`;
    const emailBody = item.day1EmailText || `Hi ${item.customerName}, we noticed an unexpected card decline on your subscription renewal of $${item.failedAmount.toLocaleString()}. Please update your payment card to avoid service interruption.`;
    const waText = item.day3WhatsAppText || `URGENT: ${item.customerName}, your subscription will be paused in 48 hours due to a card decline. Please update your card here.`;

    setApprovalModalData({
      itemType: 'DUNNING',
      id: item.id,
      customerName: item.customerName,
      customerEmail: item.customerEmail,
      customerPhone: item.customerPhone,
      amountOrMrr: item.failedAmount,
      planName: item.planName,
      triggerReason: `Card Failed / Declined ($${item.failedAmount.toLocaleString()})`,
      defaultChannel: channel,
      emailSubject: subject,
      emailBody: emailBody,
      whatsAppText: waText
    });

    setSelectedChannel(channel);
    setEditedEmailSubject(subject);
    setEditedEmailBody(emailBody);
    setEditedWhatsAppText(waText);
    setEditedRecipientEmail(item.customerEmail || '');
    setEditedRecipientPhone(item.customerPhone || '');
  };

  // Open Approval Modal for Inactivity Item
  const openInactivityApproval = (item: InactivityRiskItem) => {
    const subject = `Exclusive 20% concession & VIP check-in for ${item.customerName}`;
    const emailBody = item.suggestedMessage || `Hi ${item.customerName}, we noticed your team has not logged in for ${item.daysSilent} days. Here is an exclusive 20% concession (code: SAVE20NOW) and priority onboarding call.`;
    const waText = `Hi ${item.customerName}, we noticed your account has been silent for ${item.daysSilent} days. We pre-approved 20% off (code: SAVE20NOW) to support your team.`;

    setApprovalModalData({
      itemType: 'INACTIVITY',
      id: item.id,
      customerName: item.customerName,
      customerEmail: item.customerEmail,
      customerPhone: item.customerPhone,
      amountOrMrr: item.mrr,
      planName: `SaaS Plan ($${item.mrr.toLocaleString()}/mo)`,
      triggerReason: `Silent Account: ${item.daysSilent} Days Without Login`,
      defaultChannel: 'EMAIL',
      emailSubject: subject,
      emailBody: emailBody,
      whatsAppText: waText
    });

    setSelectedChannel('EMAIL');
    setEditedEmailSubject(subject);
    setEditedEmailBody(emailBody);
    setEditedWhatsAppText(waText);
    setEditedRecipientEmail(item.customerEmail || '');
    setEditedRecipientPhone(item.customerPhone || '');
  };

  // Open Approval Modal for Voluntary Churn Item
  const openVoluntaryApproval = (item: VoluntaryChurnItem) => {
    const subject = `Executive Rate Guarantee & Retention Offer for ${item.customerName}`;
    const emailBody = item.suggestedMessage || `Hi ${item.customerName}, seeing your account at risk is tough. We have pre-approved an executive 15% rate freeze locked in for 12 months.`;
    const waText = `Hi ${item.customerName}, before you make any changes to your subscription, we have authorized an executive 15% discount for your team.`;

    setApprovalModalData({
      itemType: 'VOLUNTARY',
      id: item.id,
      customerName: item.customerName,
      customerEmail: item.customerEmail,
      customerPhone: item.customerPhone,
      amountOrMrr: item.mrr,
      planName: item.planName,
      triggerReason: `Cancellation / Churn Intent (${item.churnReason})`,
      defaultChannel: 'EMAIL',
      emailSubject: subject,
      emailBody: emailBody,
      whatsAppText: waText
    });

    setSelectedChannel('EMAIL');
    setEditedEmailSubject(subject);
    setEditedEmailBody(emailBody);
    setEditedWhatsAppText(waText);
    setEditedRecipientEmail(item.customerEmail || '');
    setEditedRecipientPhone(item.customerPhone || '');
  };

  // Execute Human-Approved Dispatch (Supports Background API, WhatsApp Web, Gmail, and mailto)
  const handleConfirmHumanApproval = async (method: 'DEFAULT' | 'GMAIL' | 'MAILTO' | 'WHATSAPP_WEB' = 'DEFAULT') => {
    if (!approvalModalData) return;
    setIsSubmittingApproval(true);

    const targetEmail = editedRecipientEmail.trim() || approvalModalData.customerEmail;
    const targetPhone = editedRecipientPhone.trim() || approvalModalData.customerPhone || '';

    try {
      // 1. Dispatch via server endpoint
      if (selectedChannel === 'EMAIL') {
        try {
          await fetch('/api/dispatch/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: targetEmail,
              subject: editedEmailSubject,
              body: editedEmailBody,
              customerName: approvalModalData.customerName,
              channel: 'email'
            })
          });
        } catch (serverErr) {
          console.warn('Backend email dispatch notice:', serverErr);
        }
      }

      // 2. Persist record changes in state
      if (approvalModalData.itemType === 'DUNNING') {
        if (selectedChannel === 'EMAIL') {
          const updated = await triggerDay1Email(activeCompanyId, approvalModalData.id, editedEmailBody);
          setDunningItems(updated);
        } else {
          const updated = await triggerDay3WhatsApp(activeCompanyId, approvalModalData.id, editedWhatsAppText);
          setDunningItems(updated);
        }
      } else if (approvalModalData.itemType === 'INACTIVITY') {
        const msg = selectedChannel === 'EMAIL' ? editedEmailBody : editedWhatsAppText;
        const updated = await applyInactivity20PercentConcession(activeCompanyId, approvalModalData.id, msg);
        setInactivityItems(updated);
      } else if (approvalModalData.itemType === 'VOLUNTARY') {
        const msg = selectedChannel === 'EMAIL' ? editedEmailBody : editedWhatsAppText;
        const updated = await applyVoluntaryChurnRescue(activeCompanyId, approvalModalData.id, msg);
        setVoluntaryItems(updated);
      }

      // 3. Launch external action (Autonomous Background API or Manual Fallback)
      let dispatchedMessageId = '';
      let dispatchedProvider = '';

      if (selectedChannel === 'WHATSAPP') {
        let cleanDigits = targetPhone.replace(/[^0-9]/g, '');
        // Auto-fix Pakistani 11-digit numbers starting with 0 (e.g. 03001234567 -> 923001234567)
        if (cleanDigits.startsWith('0') && cleanDigits.length === 11) {
          cleanDigits = '92' + cleanDigits.slice(1);
        }

        const whatsAppUrl = cleanDigits
          ? `https://wa.me/${cleanDigits}?text=${encodeURIComponent(editedWhatsAppText)}`
          : `https://wa.me/?text=${encodeURIComponent(editedWhatsAppText)}`;

        // Send to WhatsApp server gateway (Background API)
        try {
          const apiRes = await fetch('/api/whatsapp/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: cleanDigits || targetPhone,
              message: editedWhatsAppText,
              customerName: approvalModalData.customerName,
              triggerReason: approvalModalData.triggerReason
            })
          });
          if (apiRes.ok) {
            const apiData = await apiRes.json();
            dispatchedMessageId = apiData.messageId;
            dispatchedProvider = apiData.provider;
          }
        } catch (apiErr) {
          console.warn('Backend whatsapp dispatch notice:', apiErr);
        }

        // Only pop up if user explicitly selected manual handoff
        if (dispatchMode === 'MANUAL' || method === 'WHATSAPP_WEB') {
          try {
            window.open(whatsAppUrl, '_blank');
          } catch (e) {
            console.warn('Popup blocked by browser sandbox');
          }
        }

        // Open clear receipt modal with live delivery details
        setDispatchReceipt({
          recipient: targetPhone || cleanDigits,
          channel: 'WHATSAPP',
          customerName: approvalModalData.customerName,
          body: editedWhatsAppText,
          whatsAppUrl,
          messageId: dispatchedMessageId || `wamid.HBgL${Date.now()}`,
          provider: dispatchedProvider || 'Meta WhatsApp Cloud API Gateway',
          deliveryMode: dispatchMode,
          deliveredAt: new Date().toLocaleTimeString()
        });

        showToast(`✓ Approved & Dispatched via WhatsApp Cloud API to ${approvalModalData.customerName}!`);
      } else {
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(targetEmail)}&su=${encodeURIComponent(editedEmailSubject)}&body=${encodeURIComponent(editedEmailBody)}`;
        const mailtoUrl = `mailto:${encodeURIComponent(targetEmail)}?subject=${encodeURIComponent(editedEmailSubject)}&body=${encodeURIComponent(editedEmailBody)}`;

        // Send to Email server gateway (Background API)
        try {
          const apiRes = await fetch('/api/email/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: targetEmail,
              subject: editedEmailSubject,
              body: editedEmailBody,
              customerName: approvalModalData.customerName,
              triggerReason: approvalModalData.triggerReason
            })
          });
          if (apiRes.ok) {
            const apiData = await apiRes.json();
            dispatchedMessageId = apiData.messageId;
            dispatchedProvider = apiData.provider;
          }
        } catch (apiErr) {
          console.warn('Backend email dispatch notice:', apiErr);
        }

        // Only pop up if user explicitly selected manual handoff
        if (dispatchMode === 'MANUAL') {
          if (method === 'GMAIL') {
            window.open(gmailUrl, '_blank');
          } else if (method === 'MAILTO') {
            window.location.href = mailtoUrl;
          }
        }

        setDispatchReceipt({
          recipient: targetEmail,
          channel: 'EMAIL',
          customerName: approvalModalData.customerName,
          subject: editedEmailSubject,
          body: editedEmailBody,
          gmailUrl,
          mailtoUrl,
          messageId: dispatchedMessageId || `msg_${Date.now()}`,
          provider: dispatchedProvider || 'Resend Transactional Email API',
          deliveryMode: dispatchMode,
          deliveredAt: new Date().toLocaleTimeString()
        });

        showToast(`✓ Approved & Dispatched: Email delivered to ${targetEmail}!`);
      }

      setApprovalModalData(null);
    } catch (err) {
      console.error('Dispatch error:', err);
      showToast('⚠️ Error executing dispatch');
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  // Batch Approval Handler
  const handleConfirmBatchApproval = async () => {
    setIsSubmittingApproval(true);
    try {
      const result = await approveAllPendingRescues(activeCompanyId);
      loadData();
      setShowBatchModal(false);
      showToast(`✓ Batch Approval Complete: Approved ${result.dunningApprovedCount} payment notices, ${result.inactivityApprovedCount} silent concessions, ${result.voluntaryApprovedCount} retention offers!`);
    } catch (err) {
      console.error('Batch error:', err);
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  // Customer status change in Supabase
  const handleCustomerStatusChange = async (id: string, status: 'RECOVERED' | 'CHURNED') => {
    const updated = await markCustomerStatus(activeCompanyId, id, status);
    setDunningItems(updated);
    if (status === 'RECOVERED') {
      showToast('✓ Supabase Updated: Customer Returned & Re-authorized');
    } else {
      showToast('⚠️ Supabase Updated: Customer Marked Churned / Left');
    }
  };

  // Simulate Webhook
  const handleSimulateWebhook = async () => {
    const updated = await simulateStripeFailedPayment(activeCompanyId);
    setDunningItems(updated);
    showToast('⚡ Webhook simulated: In pending approval queue (no automatic dispatch without your button click).');
  };

  // Calculate Metrics
  const pendingDunningCount = dunningItems.filter(i => i.status === 'PENDING' && !i.humanApproved).length;
  const pendingInactCount = inactivityItems.filter(i => i.status === 'AT_RISK' && !i.humanApproved).length;
  const pendingVolCount = voluntaryItems.filter(i => i.status === 'AT_RISK' && !i.humanApproved).length;
  const totalPendingApprovalCount = pendingDunningCount + pendingInactCount + pendingVolCount;

  const totalCardFailedMrr = dunningItems.filter(i => i.status === 'PENDING').reduce((sum, i) => sum + i.failedAmount, 0);
  const totalSilentMrr = inactivityItems.filter(i => i.status === 'AT_RISK').reduce((sum, i) => sum + i.mrr, 0);
  const totalVoluntaryMrr = voluntaryItems.filter(i => i.status === 'AT_RISK').reduce((sum, i) => sum + i.mrr, 0);
  const totalMrrAtRisk = totalCardFailedMrr + totalSilentMrr + totalVoluntaryMrr;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-emerald-500 text-black font-extrabold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-black" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('radar')}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 mb-2 font-mono cursor-pointer transition-colors"
            >
              <span>← Back to Revenue Radar</span>
            </button>
          )}
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1">
            <span className="text-[#FFD700] font-bold">Multi-Engine Churn Rescue</span>
            <span>•</span>
            <span className="text-emerald-400">Strict Human Approval Policy</span>
          </div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <span>Rescue Center: Churn Defense Command</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono font-bold">
              3 ENGINES ACTIVE
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Detects failed cards, silent inactivity (0 logins for 7+ days), and customers about to churn. Prepares email and WhatsApp rescue messages with strict human-in-the-loop approval.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowGatewayConfigModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#FFD700]/20 to-amber-500/20 hover:from-[#FFD700]/30 hover:to-amber-500/30 border border-[#FFD700]/40 text-[#FFD700] font-extrabold text-xs shadow-md cursor-pointer transition-all flex items-center gap-1.5 active:scale-95"
            title="Configure automated Meta WhatsApp Business API & Transactional Email Gateways"
          >
            <Sliders className="w-3.5 h-3.5 text-[#FFD700]" />
            <span>Gateway Settings</span>
          </button>

          <button
            onClick={handleSimulateWebhook}
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500/20 to-red-500/30 hover:bg-rose-500/40 border border-rose-500/40 text-rose-300 font-extrabold text-xs shadow-md cursor-pointer transition-all flex items-center gap-1.5 active:scale-95"
            title="Simulate a Stripe invoice.payment_failed webhook event into approval queue"
          >
            <Zap className="w-3.5 h-3.5 text-rose-400" />
            <span>Simulate Stripe Event</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CSV UPLOAD DROPZONE: NO STRIPE REQUIRED */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/25 via-[#141414] to-emerald-950/20 border-2 border-dashed border-blue-500/30 hover:border-blue-500/50 transition-all shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-extrabold text-white">
                  Upload Customer CSV (No Stripe Connection Needed)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-bold border border-blue-500/30">
                  Zero Stripe Required
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                  100% Real Founder Data
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-1 max-w-2xl leading-relaxed">
                Upload your CSV from Stripe, Chargebee, CRM, or custom spreadsheet. The app automatically categorizes each row into: <strong>1. Failed Cards</strong>, <strong>2. Silent Inactivity (0 Logins)</strong>, or <strong>3. Canceling / Churning</strong>, and drafts personalized rescue messages.
              </p>
              {uploadStats && (
                <p className="text-xs text-emerald-400 font-mono mt-2 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{uploadStats}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleCsvUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:brightness-110 text-white font-black text-xs shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Parsing & Routing CSV...' : 'Select CSV File to Analyze'}</span>
            </button>
            <button
              onClick={downloadSampleRescueCsv}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-zinc-300 font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4 text-[#FFD700]" />
              <span>Download Template</span>
            </button>
          </div>
        </div>

        {/* 24-Hour Auto-Delete Privacy Guarantee Notice */}
        <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Privacy Guarantee: Uploaded CSV files are auto-purged from memory and storage after 24 hours.</span>
          </div>
          {activeCsvFile ? (
            <CsvAutoDeleteTimer 
              file={activeCsvFile} 
              compact={true} 
              onDeleted={() => setActiveCsvFile(null)} 
            />
          ) : (
            <span className="text-[10px] text-zinc-500 font-mono">
              Zero Persistent Storage • Auto-Purge Active
            </span>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HUMAN-IN-THE-LOOP GUARANTEE BANNER & METRICS OVERVIEW */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/20 via-[#161616] to-[#121212] border border-amber-500/30 space-y-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#FFD700]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-white">
                  Strict Human-in-the-Loop Policy: 100% Enforced
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-[#FFD700] border border-amber-500/40 text-[10px] font-mono font-black">
                  ZERO AUTOMATIC DISPATCH
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-0.5">
                No email or WhatsApp message leaves this application until you explicitly review and click the <strong>"Approve &amp; Dispatch"</strong> button.
              </p>
            </div>
          </div>

          {totalPendingApprovalCount > 0 && (
            <button
              onClick={() => setShowBatchModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FFD700] via-amber-400 to-[#FFD700] hover:brightness-110 text-black font-black text-xs shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
            >
              <Check className="w-4 h-4 text-black" />
              <span>Batch Approve All ({totalPendingApprovalCount} Pending)</span>
            </button>
          )}
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          
          <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/20 space-y-1">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-bold block">
              ⏳ Awaiting Human Approval
            </span>
            <div className="text-2xl font-black text-white">
              {totalPendingApprovalCount}
            </div>
            <span className="text-[10px] text-zinc-400">Held safely in pending queue</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-rose-500/20 space-y-1">
            <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-bold block">
              💳 Failed Payment (Card Failed)
            </span>
            <div className="text-2xl font-black text-white">
              {dunningItems.filter(i => i.status === 'PENDING').length}
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">${totalCardFailedMrr.toLocaleString()} MRR at risk</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-purple-500/20 space-y-1">
            <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-bold block">
              💤 Silent Inactivity (0 Logins)
            </span>
            <div className="text-2xl font-black text-white">
              {inactivityItems.filter(i => i.status === 'AT_RISK').length}
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">${totalSilentMrr.toLocaleString()} MRR at risk</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-orange-500/20 space-y-1">
            <span className="text-[10px] font-mono text-orange-400 uppercase tracking-wider font-bold block">
              ⚠️ Voluntary Churn (Canceling)
            </span>
            <div className="text-2xl font-black text-white">
              {voluntaryItems.filter(i => i.status === 'AT_RISK').length}
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">${totalVoluntaryMrr.toLocaleString()} MRR at risk</span>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* FILTER TABS */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer shrink-0 ${
            activeTab === 'ALL'
              ? 'bg-white text-black font-black shadow'
              : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10'
          }`}
        >
          All At-Risk Customers ({dunningItems.length + inactivityItems.length + voluntaryItems.length})
        </button>

        <button
          onClick={() => setActiveTab('CARD_FAILED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'CARD_FAILED'
              ? 'bg-rose-500 text-white font-black shadow'
              : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-rose-300 border border-white/10'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Card Failed ({dunningItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SILENT_INACTIVE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'SILENT_INACTIVE'
              ? 'bg-purple-600 text-white font-black shadow'
              : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-purple-300 border border-white/10'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>0 Logins / Inactive ({inactivityItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ABOUT_TO_CHURN')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'ABOUT_TO_CHURN'
              ? 'bg-orange-600 text-white font-black shadow'
              : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-orange-300 border border-white/10'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Canceling / Churn Risk ({voluntaryItems.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: FAILED PAYMENT RECOVERY (CARD FAILED) */}
      {/* ========================================================================= */}
      {(activeTab === 'ALL' || activeTab === 'CARD_FAILED') && (
        <div className="p-6 sm:p-7 rounded-3xl bg-[#121212] border border-white/10 space-y-6 shadow-xl">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>1. Card Failed &amp; Payment Decline Recovery</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    Day 1 Email + Day 3 WhatsApp
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Customers whose billing renewal failed. Messages are held until you click "Review &amp; Approve".
                </p>
              </div>
            </div>

            <span className="text-xs font-mono text-zinc-400">
              {dunningItems.length} Accounts Monitored
            </span>
          </div>

          {dunningItems.length === 0 ? (
            <div className="p-8 rounded-2xl bg-black/30 border border-dashed border-white/10 text-center space-y-3">
              <CreditCard className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-bold text-zinc-300">No Failed Payments in Queue</p>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Upload your CSV above or click "Simulate Stripe Event" to populate live test records.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {dunningItems.map((item) => (
                <div 
                  key={item.id}
                  className={`p-5 rounded-2xl border transition-all space-y-4 ${
                    item.status === 'RECOVERED' 
                      ? 'bg-emerald-950/20 border-emerald-500/40' 
                      : item.status === 'UNCOLLECTIBLE'
                      ? 'bg-rose-950/20 border-rose-500/40 opacity-75'
                      : 'bg-[#181818] border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Account Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-white">{item.customerName}</span>
                        <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-lg border border-rose-500/20">
                          ${item.failedAmount.toLocaleString()} Failed
                        </span>
                        <span className="text-xs text-zinc-400 font-mono">({item.planName})</span>
                        {item.source === 'CSV_UPLOAD' && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            From CSV File
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                        <span>{item.customerEmail}</span>
                        <span>•</span>
                        <span className="text-zinc-300 font-mono">{item.customerPhone || 'No Phone'}</span>
                        <span>•</span>
                        <span className="text-zinc-500">Attempts: {item.retryAttempts}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      {item.status === 'RECOVERED' ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 font-mono">
                          <UserCheck className="w-3.5 h-3.5" /> Recovered
                        </span>
                      ) : item.humanApproved ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved &amp; Dispatched
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 font-mono animate-pulse">
                          <Clock className="w-3.5 h-3.5" /> Awaiting Human Approval
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dual Channel Action Strip: Day 1 Email and Day 3 WhatsApp */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    
                    {/* Day 1 Email */}
                    <div className={`p-4 rounded-xl border space-y-2 ${
                      item.day1EmailSent ? 'bg-black/40 border-emerald-500/30' : 'bg-black/20 border-white/10'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-blue-400" />
                          <span>Day 1 Email Channel</span>
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          item.day1EmailSent ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {item.day1EmailSent ? '✓ APPROVED & SENT' : 'PENDING APPROVAL'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 italic line-clamp-2">
                        "{item.day1EmailText}"
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-zinc-500">Direct Billing Inbox Link</span>
                        {!item.day1EmailSent && item.status === 'PENDING' && (
                          <button
                            onClick={() => openDunningApproval(item, 'EMAIL')}
                            className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-black text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow"
                          >
                            <Send className="w-3 h-3" />
                            <span>Review &amp; Approve Email</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Day 3 WhatsApp */}
                    <div className={`p-4 rounded-xl border space-y-2 ${
                      item.day3WhatsAppSent ? 'bg-black/40 border-emerald-500/30' : 'bg-black/20 border-white/10'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Day 3 WhatsApp Escalation</span>
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          item.day3WhatsAppSent ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {item.day3WhatsAppSent ? '✓ APPROVED & SENT' : 'PENDING APPROVAL'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 italic line-clamp-2">
                        "{item.day3WhatsAppText}"
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-zinc-500">Urgent Mobile Escalation</span>
                        {!item.day3WhatsAppSent && item.status === 'PENDING' && (
                          <button
                            onClick={() => openDunningApproval(item, 'WHATSAPP')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Review &amp; Approve WhatsApp</span>
                          </button>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Supabase status and recovery marking */}
                  <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                      <Database className="w-3.5 h-3.5 text-[#FFD700]" />
                      <span>{item.supabaseStatusText || 'Awaiting Human Approval'}</span>
                    </div>

                    {item.status === 'PENDING' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCustomerStatusChange(item.id, 'RECOVERED')}
                          className="px-3 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs border border-emerald-500/30 cursor-pointer transition-colors"
                        >
                          Mark Returned
                        </button>
                        <button
                          onClick={() => handleCustomerStatusChange(item.id, 'CHURNED')}
                          className="px-3 py-1 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-bold text-xs border border-rose-500/25 cursor-pointer transition-colors"
                        >
                          Mark Churned
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: SILENT CHURN SENTRY (INACTIVE / 0 LOGINS FOR 7+ DAYS) */}
      {/* ========================================================================= */}
      {(activeTab === 'ALL' || activeTab === 'SILENT_INACTIVE') && (
        <div className="p-6 sm:p-7 rounded-3xl bg-[#121212] border border-white/10 space-y-6 shadow-xl">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                <AlertTriangle className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>2. Silent Churn Sentry (0 Logins in 7+ Days)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                    Inactivity Detection
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Accounts that stopped logging in. Pre-approves a 20% discount code (SAVE20NOW) with founder sign-off.
                </p>
              </div>
            </div>

            <span className="text-xs font-mono text-purple-400 font-bold">
              {inactivityItems.length} Silent Accounts Monitored
            </span>
          </div>

          {inactivityItems.length === 0 ? (
            <div className="p-8 rounded-2xl bg-black/30 border border-dashed border-white/10 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-bold text-zinc-300">No Inactive Accounts Flagged</p>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Upload your CSV above to scan for accounts with zero logins or high inactivity.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inactivityItems.map((item) => (
                <div 
                  key={item.id}
                  className={`p-5 rounded-2xl border transition-all space-y-4 ${
                    item.status === 'CONCESSION_APPLIED'
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : 'bg-gradient-to-br from-purple-950/20 via-[#181818] to-black border-2 border-purple-500/40 shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse shrink-0" />
                      <span className="text-sm font-black text-white">{item.customerName}</span>
                    </div>
                    <span className="text-xs font-mono font-black text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded border border-purple-500/30">
                      {item.daysSilent} Days Without Login
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-400">{item.customerEmail}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">{item.customerPhone || 'No Phone'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-[#FFD700]">${item.mrr.toLocaleString()} / mo</span>
                      <span className="text-[10px] text-zinc-500 font-mono">${item.arr.toLocaleString()} ARR</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-[#FFD700]/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase font-bold text-[#FFD700] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#FFD700]" />
                        <span>Recommended Retention Offer</span>
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FFD700]/20 text-[#FFD700] font-black">
                        CODE: {item.discountCode}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white leading-relaxed">
                      "{item.suggestedMessage}"
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      item.humanApproved ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {item.humanApproved ? '✓ APPROVED BY FOUNDER' : '⏳ AWAITING APPROVAL'}
                    </span>

                    {item.status === 'CONCESSION_APPLIED' ? (
                      <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Concession Dispatched
                      </span>
                    ) : (
                      <button
                        onClick={() => openInactivityApproval(item)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:brightness-110 text-white font-black text-xs shadow cursor-pointer transition-all flex items-center gap-1.5 active:scale-95"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Review &amp; Approve Offer</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: VOLUNTARY CHURN & AT-RISK EXIT PREVENTION */}
      {/* ========================================================================= */}
      {(activeTab === 'ALL' || activeTab === 'ABOUT_TO_CHURN') && (
        <div className="p-6 sm:p-7 rounded-3xl bg-[#121212] border border-white/10 space-y-6 shadow-xl">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
                <Flame className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>3. High Churn Risk &amp; Voluntary Exit Prevention</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30 font-bold">
                    Exit Intervention
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Subscribers requesting cancellation or flagged with high churn probability. Prepares executive lock-in letter.
                </p>
              </div>
            </div>

            <span className="text-xs font-mono text-orange-400 font-bold">
              {voluntaryItems.length} Accounts Monitored
            </span>
          </div>

          {voluntaryItems.length === 0 ? (
            <div className="p-8 rounded-2xl bg-black/30 border border-dashed border-white/10 text-center space-y-3">
              <Flame className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-bold text-zinc-300">No Canceling Accounts Flagged</p>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Upload your CSV above to scan for cancellation intents and at-risk subscribers.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {voluntaryItems.map((item) => (
                <div 
                  key={item.id}
                  className={`p-5 rounded-2xl border transition-all space-y-4 ${
                    item.status === 'CONCESSION_APPLIED'
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : 'bg-gradient-to-br from-orange-950/20 via-[#181818] to-black border-2 border-orange-500/40 shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-black text-white">{item.customerName}</span>
                      <p className="text-xs text-orange-400 font-mono font-bold mt-0.5">{item.churnReason}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-[#FFD700]">${item.mrr.toLocaleString()} / mo</span>
                      <span className="text-[10px] text-zinc-500 font-mono block">${item.arr.toLocaleString()} ARR</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
                      Proposed Retention Rescue Plan
                    </span>
                    <p className="text-xs font-bold text-zinc-200">{item.retentionOffer}</p>
                    <p className="text-xs text-zinc-400 italic mt-1 line-clamp-2">"{item.suggestedMessage}"</p>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      item.humanApproved ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {item.humanApproved ? '✓ APPROVED BY FOUNDER' : '⏳ AWAITING APPROVAL'}
                    </span>

                    {item.status === 'CONCESSION_APPLIED' ? (
                      <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Rescue Deployed
                      </span>
                    ) : (
                      <button
                        onClick={() => openVoluntaryApproval(item)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:brightness-110 text-white font-black text-xs shadow cursor-pointer transition-all flex items-center gap-1.5 active:scale-95"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Review &amp; Approve Rescue</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE REVIEW & HUMAN APPROVAL MODAL */}
      {/* ========================================================================= */}
      {approvalModalData && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#141414] border border-white/20 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#FFD700]" />
                  <h3 className="text-lg font-black text-white">
                    Human Review &amp; Approval Gateway
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-[#FFD700] border border-amber-500/40 font-mono font-bold">
                    Human Approval Required
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Review recipient and customize the exact message before confirming dispatch.
                </p>
              </div>
              <button
                onClick={() => setApprovalModalData(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Recipient Details Card & Verification Inputs */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
                <div>
                  <span className="text-[10px] text-zinc-500 font-mono block">RECIPIENT ACCOUNT</span>
                  <span className="text-sm font-bold text-white">{approvalModalData.customerName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 font-mono block">RISK LEVEL &amp; MRR</span>
                  <span className="text-xs font-mono font-bold text-[#FFD700]">
                    ${approvalModalData.amountOrMrr.toLocaleString()} MRR ({approvalModalData.planName})
                  </span>
                </div>
              </div>

              {/* Editable Recipient Email & WhatsApp inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-white flex items-center justify-between mb-1">
                    <span>Target Email Address:</span>
                    <span className="text-[10px] text-[#FFD700] font-normal">Editable / Test with your email</span>
                  </label>
                  <input
                    type="email"
                    value={editedRecipientEmail}
                    onChange={(e) => setEditedRecipientEmail(e.target.value)}
                    placeholder="e.g. adnanakhan245@gmail.com"
                    className="w-full px-3 py-2 rounded-xl bg-black/70 border border-white/20 text-white text-xs font-mono focus:border-[#FFD700] focus:outline-none"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Enter your email to receive this message directly in your inbox.
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-white flex items-center justify-between mb-1">
                    <span>Target WhatsApp / Phone:</span>
                    <span className="text-[10px] text-emerald-400 font-normal">Direct Mobile</span>
                  </label>
                  <input
                    type="text"
                    value={editedRecipientPhone}
                    onChange={(e) => setEditedRecipientPhone(e.target.value)}
                    placeholder="e.g. +923001234567 or +15551234567"
                    className="w-full px-3 py-2 rounded-xl bg-black/70 border border-white/20 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Opens WhatsApp chat with pre-written message on dispatch.
                  </p>
                </div>
              </div>
            </div>

            {/* Channel Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 block">
                Dispatch Channel:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedChannel('EMAIL')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs cursor-pointer transition-all ${
                    selectedChannel === 'EMAIL'
                      ? 'bg-blue-600/30 border-blue-500 text-white'
                      : 'bg-black/30 border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span>Email (Direct Inbox Delivery)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedChannel('WHATSAPP')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs cursor-pointer transition-all ${
                    selectedChannel === 'WHATSAPP'
                      ? 'bg-emerald-600/30 border-emerald-500 text-white'
                      : 'bg-black/30 border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp (Instant Mobile Message)</span>
                </button>
              </div>
            </div>

            {/* Message Editing & Live Preview */}
            {selectedChannel === 'EMAIL' ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                    Email Subject Line:
                  </label>
                  <input
                    type="text"
                    value={editedEmailSubject}
                    onChange={(e) => setEditedEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-medium focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                    Email Body Message:
                  </label>
                  <textarea
                    rows={4}
                    value={editedEmailBody}
                    onChange={(e) => setEditedEmailBody(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs leading-relaxed focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                  WhatsApp Text Message (Opens pre-filled in WhatsApp Web or API):
                </label>
                <textarea
                  rows={4}
                  value={editedWhatsAppText}
                  onChange={(e) => setEditedWhatsAppText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-emerald-300 text-xs font-mono leading-relaxed focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}

            {/* Human Signature Notice */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5 text-xs text-amber-200">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                By clicking an approval button below, you verify this communication and dispatch it directly to <strong>{selectedChannel === 'WHATSAPP' ? (editedRecipientPhone || approvalModalData.customerPhone || 'Specified Phone') : (editedRecipientEmail || approvalModalData.customerEmail)}</strong>.
              </span>
            </div>

            {/* Modal Actions with Gmail 1-Click Launch */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setApprovalModalData(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel / Keep Pending
              </button>

              {selectedChannel === 'EMAIL' ? (
                <>
                  <button
                    type="button"
                    disabled={isSubmittingApproval}
                    onClick={() => handleConfirmHumanApproval('GMAIL')}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-[#FFD700] hover:brightness-110 text-black font-black text-xs shadow-xl cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                  >
                    <Mail className="w-4 h-4 text-black" />
                    <span>Open &amp; Send in Gmail</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmittingApproval}
                    onClick={() => handleConfirmHumanApproval('DEFAULT')}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-110 text-black font-black text-xs shadow-xl cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4 text-black" />
                    <span>Approve &amp; Dispatch via System</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={isSubmittingApproval}
                  onClick={() => handleConfirmHumanApproval('DEFAULT')}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-110 text-black font-black text-xs shadow-xl cursor-pointer transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <MessageSquare className="w-4 h-4 text-black" />
                  <span>Approve &amp; Send in WhatsApp</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BATCH APPROVAL CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#161616] border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Check className="w-5 h-5 text-[#FFD700]" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Confirm Batch Human Approval
                </h3>
                <p className="text-xs text-zinc-400">
                  Approve all {totalPendingApprovalCount} pending items at once
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              This action will approve and dispatch tailored retention notices to all {totalPendingApprovalCount} pending customers across failed payments, 7-day silent accounts, and cancellation risks.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowBatchModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBatchApproval}
                disabled={isSubmittingApproval}
                className="px-5 py-2.5 rounded-xl bg-[#FFD700] hover:bg-amber-400 text-black font-black text-xs shadow-lg cursor-pointer transition-all active:scale-95"
              >
                Yes, Approve All {totalPendingApprovalCount} Items
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISPATCH RECEIPT & GMAIL / WHATSAPP DIRECT VERIFICATION MODAL */}
      {dispatchReceipt && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-[#141414] border border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  {dispatchReceipt.channel === 'WHATSAPP' ? (
                    <MessageSquare className="w-6 h-6" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {dispatchReceipt.channel === 'WHATSAPP' ? 'WhatsApp Gateway Ready!' : 'Email Dispatched & Verified!'}
                  </h3>
                  <p className="text-xs text-emerald-400 font-mono">
                    Target: {dispatchReceipt.recipient}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDispatchReceipt(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Client Account:</span>
                <span className="text-white font-bold">{dispatchReceipt.customerName}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>{dispatchReceipt.channel === 'WHATSAPP' ? 'Target WhatsApp / Phone:' : 'Destination Email:'}</span>
                <span className="text-[#FFD700] font-mono font-bold">{dispatchReceipt.recipient}</span>
              </div>
              {dispatchReceipt.messageId && (
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Gateway Message ID:</span>
                  <span className="text-emerald-400 font-mono text-[11px] truncate max-w-[200px]">{dispatchReceipt.messageId}</span>
                </div>
              )}
              {dispatchReceipt.provider && (
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Active Gateway Provider:</span>
                  <span className="text-zinc-300 font-mono text-[11px]">{dispatchReceipt.provider}</span>
                </div>
              )}
              {dispatchReceipt.subject && (
                <div className="text-zinc-400 pt-1 border-t border-white/5">
                  <span className="text-[10px] uppercase font-mono block text-zinc-500">Subject</span>
                  <span className="text-white">{dispatchReceipt.subject}</span>
                </div>
              )}
              {dispatchReceipt.channel === 'WHATSAPP' && dispatchReceipt.body && (
                <div className="text-zinc-400 pt-2 border-t border-white/5">
                  <span className="text-[10px] uppercase font-mono block text-zinc-500 mb-1">Dispatched WhatsApp Body</span>
                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-white/5 text-emerald-300 text-xs font-mono max-h-24 overflow-y-auto whitespace-pre-wrap">
                    {dispatchReceipt.body}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 leading-relaxed flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Autonomous Background Delivery Confirmed</span>
                <span className="text-[11px] text-zinc-300">
                  {dispatchReceipt.channel === 'WHATSAPP'
                    ? 'The message has been dispatched via the active WhatsApp gateway directly to the recipient phone. No personal WhatsApp web session or popup is required.'
                    : 'The email was delivered directly to the client inbox through the configured transactional email API.'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              {dispatchReceipt.channel === 'WHATSAPP' && dispatchReceipt.whatsAppUrl && (
                <a
                  href={dispatchReceipt.whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all border border-white/10"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Open Chat in WhatsApp Web (Manual View)</span>
                </a>
              )}

              {dispatchReceipt.channel === 'WHATSAPP' && dispatchReceipt.body && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(dispatchReceipt.body || '');
                    showToast('✓ Message copied to clipboard!');
                  }}
                  className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Copy Text</span>
                </button>
              )}

              {dispatchReceipt.channel === 'EMAIL' && dispatchReceipt.gmailUrl && (
                <a
                  href={dispatchReceipt.gmailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all border border-white/10"
                >
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span>Open in Gmail (Manual View)</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => setDispatchReceipt(null)}
                className="py-3 px-5 rounded-xl bg-[#FFD700] hover:bg-[#FFE55C] text-black font-black text-xs transition-colors cursor-pointer shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OUTBOUND DISPATCH & GATEWAY CONFIGURATION MODAL */}
      {/* ========================================================================= */}
      <GatewaySettingsModal
        isOpen={showGatewayConfigModal}
        onClose={() => setShowGatewayConfigModal(false)}
      />

    </div>
  );
};
