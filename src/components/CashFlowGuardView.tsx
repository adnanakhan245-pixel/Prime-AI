import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  Plus, 
  Mail, 
  MessageSquare, 
  CheckCircle, 
  Trash2, 
  Edit3, 
  Download, 
  RefreshCw, 
  Filter, 
  CreditCard, 
  TrendingDown, 
  Copy, 
  ExternalLink,
  Send,
  Zap,
  Info,
  Check
} from 'lucide-react';
import { 
  InvoiceItem, 
  CashFlowGuardStats, 
  PaymentGatewayType, 
  InvoiceStatus, 
  Company 
} from '../types';
import { 
  fetchUserInvoices, 
  saveInvoice, 
  markInvoiceAsPaid, 
  deleteInvoice, 
  recordPaymentReminderSent,
  calculateGatewayFees,
  recommendOptimalGateway
} from '../services/db';

interface CashFlowGuardViewProps {
  currentCompany: Company | null;
  userId: string;
}

const PAYMENT_GATEWAYS: PaymentGatewayType[] = [
  'Stripe (2.9% + $0.30)',
  'PayPal (3.49% + $0.49)',
  'Wise / ACH Bank Transfer (0.4% Cap $5)',
  'Payoneer (1.5% - 2%)',
  'Direct Wire / Swift (Fixed $15 - $25)',
  'Local Bank Transfer (0%)'
];

const CURRENCIES = ['USD', 'PKR', 'EUR', 'GBP', 'AED', 'CAD', 'AUD'];

export const CashFlowGuardView: React.FC<CashFlowGuardViewProps> = ({
  currentCompany,
  userId
}) => {
  const companyId = currentCompany?.id || 'default_comp';
  const companyName = currentCompany?.name || 'My Enterprise';

  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modal State for Invoice Creation / Editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<InvoiceItem | null>(null);

  // Form State
  const [formInvoiceNumber, setFormInvoiceNumber] = useState('');
  const [formClientName, setFormClientName] = useState('');
  const [formClientEmail, setFormClientEmail] = useState('');
  const [formClientPhone, setFormClientPhone] = useState('');
  const [formClientCompany, setFormClientCompany] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCurrency, setFormCurrency] = useState('USD');
  const [formIssueDate, setFormIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDueDate, setFormDueDate] = useState('');
  const [formGateway, setFormGateway] = useState<PaymentGatewayType>('Stripe (2.9% + $0.30)');
  const [formNotes, setFormNotes] = useState('');

  // Reminder Modal State
  const [reminderInvoice, setReminderInvoice] = useState<InvoiceItem | null>(null);
  const [reminderTone, setReminderTone] = useState<'GENTLE' | 'FIRM' | 'LEGAL'>('GENTLE');
  const [copied, setCopied] = useState(false);

  // Load Invoices
  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data = await fetchUserInvoices(companyId, userId);
      setInvoices(data);
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [companyId]);

  // Aggregate Metrics
  const stats: CashFlowGuardStats = useMemo(() => {
    let totalInvoiced = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;
    let totalOverdueAmount = 0;
    let overdueCount = 0;
    let unpaidCount = 0;
    let paidCount = 0;
    let totalGatewayFeesBleed = 0;
    let potentialGatewayFeeSavings = 0;

    invoices.forEach(inv => {
      totalInvoiced += inv.amount;
      totalGatewayFeesBleed += inv.currentGatewayFee;
      potentialGatewayFeeSavings += inv.feeSavingsAmount;

      if (inv.status === 'PAID') {
        totalCollected += (inv.paidAmount || inv.amount);
        paidCount++;
      } else {
        totalOutstanding += inv.amount;
        if (inv.status === 'OVERDUE' || inv.daysOverdue > 0) {
          totalOverdueAmount += inv.amount;
          overdueCount++;
        } else {
          unpaidCount++;
        }
      }
    });

    return {
      totalInvoiced,
      totalCollected,
      totalOutstanding,
      totalOverdueAmount,
      overdueCount,
      unpaidCount,
      paidCount,
      totalGatewayFeesBleed: Number(totalGatewayFeesBleed.toFixed(2)),
      potentialGatewayFeeSavings: Number(potentialGatewayFeeSavings.toFixed(2)),
      avgPaymentCollectionDays: 14
    };
  }, [invoices]);

  // Filtered list
  const filteredInvoices = useMemo(() => {
    return invoices.filter(i => {
      if (filterStatus === 'ALL') return true;
      if (filterStatus === 'OVERDUE') return i.status === 'OVERDUE' || i.daysOverdue > 0;
      if (filterStatus === 'UNPAID') return i.status === 'UNPAID';
      if (filterStatus === 'PAID') return i.status === 'PAID';
      return i.status === filterStatus;
    });
  }, [invoices, filterStatus]);

  // Open Create Modal
  const openCreateModal = () => {
    setEditingInvoice(null);
    setFormInvoiceNumber(`INV-${Date.now().toString().slice(-4)}`);
    setFormClientName('');
    setFormClientEmail('');
    setFormClientPhone('');
    setFormClientCompany('');
    setFormAmount('');
    setFormCurrency('USD');
    setFormIssueDate(new Date().toISOString().split('T')[0]);
    
    // Default due date to 14 days from now
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setFormDueDate(d.toISOString().split('T')[0]);
    
    setFormGateway('Stripe (2.9% + $0.30)');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (inv: InvoiceItem) => {
    setEditingInvoice(inv);
    setFormInvoiceNumber(inv.invoiceNumber);
    setFormClientName(inv.clientName);
    setFormClientEmail(inv.clientEmail);
    setFormClientPhone(inv.clientPhone || '');
    setFormClientCompany(inv.clientCompany || '');
    setFormAmount(inv.amount.toString());
    setFormCurrency(inv.currency);
    setFormIssueDate(inv.issueDate);
    setFormDueDate(inv.dueDate);
    setFormGateway(inv.selectedGateway);
    setFormNotes(inv.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInvoiceNumber.trim() || !formClientName.trim() || !formDueDate) return;

    const payload = {
      id: editingInvoice?.id,
      companyId,
      userId,
      invoiceNumber: formInvoiceNumber.trim(),
      clientName: formClientName.trim(),
      clientEmail: formClientEmail.trim(),
      clientPhone: formClientPhone.trim(),
      clientCompany: formClientCompany.trim(),
      amount: Number(formAmount) || 0,
      currency: formCurrency,
      issueDate: formIssueDate,
      dueDate: formDueDate,
      selectedGateway: formGateway,
      notes: formNotes,
      status: editingInvoice?.status || 'UNPAID',
    };

    const saved = await saveInvoice(payload as any);
    setInvoices(prev => [saved, ...prev.filter(i => i.id !== saved.id)]);
    setIsModalOpen(false);
  };

  const handleMarkAsPaid = async (inv: InvoiceItem) => {
    const updated = await markInvoiceAsPaid(inv.id, companyId, inv.amount);
    if (updated) {
      setInvoices(prev => prev.map(i => i.id === inv.id ? updated : i));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this invoice record?')) {
      await deleteInvoice(id, companyId);
      setInvoices(prev => prev.filter(i => i.id !== id));
    }
  };

  // Generate Reminder Copy
  const reminderText = useMemo(() => {
    if (!reminderInvoice) return '';
    const name = reminderInvoice.clientName || 'Valued Client';
    const num = reminderInvoice.invoiceNumber;
    const amt = `${reminderInvoice.currency} ${reminderInvoice.amount.toLocaleString()}`;
    const days = reminderInvoice.daysOverdue;
    const company = companyName;

    if (reminderTone === 'GENTLE') {
      return `Hi ${name},\n\nHope you are having a productive week.\n\nThis is a friendly reminder regarding Invoice #${num} for ${amt}, which was due on ${reminderInvoice.dueDate} (${days > 0 ? `${days} days ago` : 'due soon'}).\n\nIf the payment is already on its way, please disregard this note. Otherwise, could you please confirm when we can expect the settlement?\n\nBest regards,\nAccounts Receivable | ${company}`;
    }

    if (reminderTone === 'FIRM') {
      return `Dear ${name},\n\nWe are following up on overdue Invoice #${num} in the amount of ${amt}, which is currently ${days} days past due (Due Date: ${reminderInvoice.dueDate}).\n\nTo ensure uninterrupted services and maintain active account standing, please process this payment today or provide the transaction reference number by return.\n\nThank you for your prompt cooperation.\n\nSincerely,\nExecutive Finance Team | ${company}`;
    }

    // LEGAL / ESCALATION
    return `FORMAL NOTICE OF OUTSTANDING ARREARS\n\nAttention: ${name} (${reminderInvoice.clientCompany || 'Finance Dept'})\nInvoice Ref: #${num}\nOutstanding Balance: ${amt}\nDays Overdue: ${days} Days\n\nDespite previous reminders, the invoice referenced above remains unpaid. Please be advised that continued failure to remit payment within 3 business days may result in immediate suspension of services and escalation to our legal recovery partners.\n\nPlease remit the full amount immediately or contact finance immediately to arrange settlement.\n\nFinance & Legal Compliance Division\n${company}`;
  }, [reminderInvoice, reminderTone, companyName]);

  const handleCopyReminder = () => {
    navigator.clipboard.writeText(reminderText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendReminderViaEmail = async () => {
    if (!reminderInvoice) return;
    await recordPaymentReminderSent(reminderInvoice.id, companyId);
    setInvoices(prev => prev.map(i => i.id === reminderInvoice.id ? {
      ...i,
      reminderCount: (i.reminderCount || 0) + 1,
      lastReminderSentAt: new Date().toISOString()
    } : i));

    const subject = encodeURIComponent(`Payment Reminder: Invoice #${reminderInvoice.invoiceNumber} (${reminderInvoice.currency} ${reminderInvoice.amount.toLocaleString()}) - ${companyName}`);
    const body = encodeURIComponent(reminderText);
    window.open(`mailto:${reminderInvoice.clientEmail}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleSendViaWhatsApp = async () => {
    if (!reminderInvoice) return;
    await recordPaymentReminderSent(reminderInvoice.id, companyId);
    setInvoices(prev => prev.map(i => i.id === reminderInvoice.id ? {
      ...i,
      reminderCount: (i.reminderCount || 0) + 1,
      lastReminderSentAt: new Date().toISOString()
    } : i));

    const phone = reminderInvoice.clientPhone?.replace(/[^0-9]/g, '') || '';
    const encoded = encodeURIComponent(reminderText);
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  };

  const handleExportCSV = () => {
    if (invoices.length === 0) {
      alert('No invoice records to export.');
      return;
    }
    const headers = ['Invoice Number', 'Client Name', 'Email', 'Company', 'Amount', 'Currency', 'Issue Date', 'Due Date', 'Status', 'Days Overdue', 'Gateway', 'Gateway Fee', 'Fee Savings'];
    const rows = invoices.map(i => [
      `"${i.invoiceNumber}"`,
      `"${i.clientName}"`,
      `"${i.clientEmail}"`,
      `"${i.clientCompany || ''}"`,
      i.amount,
      i.currency,
      i.issueDate,
      i.dueDate,
      i.status,
      i.daysOverdue,
      `"${i.selectedGateway}"`,
      i.currentGatewayFee,
      i.feeSavingsAmount
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CashFlow_Invoices_${companyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="cash-flow-guard-container" className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Overdue Invoices & Cash Flow Guard
            </h1>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-2xl">
            Recover unpaid invoices faster with automated executive escalation notices and eliminate payment gateway fee bleed across Stripe, Wise, and bank wires.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="export-invoices-btn"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Invoices
          </button>
          <button
            id="add-invoice-btn"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Overdue Amount at Risk */}
        <div className="bg-gradient-to-br from-rose-50 to-amber-50 dark:from-rose-950/40 dark:to-amber-950/20 border border-rose-200 dark:border-rose-900/60 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              Overdue Receivables
            </span>
            {stats.overdueCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded">
                {stats.overdueCount} Overdue
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-rose-700 dark:text-rose-300">
            ${stats.totalOverdueAmount.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-rose-600/90 dark:text-rose-400">
            Total Outstanding: <strong>${stats.totalOutstanding.toLocaleString()}</strong>
          </div>
        </div>

        {/* Card 2: Cash Collected / Recovered */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Cash Collected</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ${stats.totalCollected.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-neutral-500">
            {stats.paidCount} Paid Invoices ({Math.round((stats.paidCount / Math.max(invoices.length, 1)) * 100)}% recovery rate)
          </div>
        </div>

        {/* Card 3: Gateway Fees Paid */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gateway Fees Bleed</span>
            <CreditCard className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            ${stats.totalGatewayFeesBleed.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-neutral-500">
            Standard merchant transaction cut
          </div>
        </div>

        {/* Card 4: Potential Gateway Fee Savings */}
        <div className="bg-white dark:bg-neutral-900 border border-emerald-200 dark:border-emerald-900/60 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              Gateway Fee Savings
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ${stats.potentialGatewayFeeSavings.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-neutral-500">
            By routing &gt;$2k invoices to Wise / Wire
          </div>
        </div>
      </div>

      {/* Filter and Toolbar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Filter className="w-4 h-4" />
            <span>Filter Status:</span>
          </div>
          <select
            id="filter-invoice-status-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Invoices ({invoices.length})</option>
            <option value="OVERDUE">Overdue Only ({stats.overdueCount})</option>
            <option value="UNPAID">Pending / Unpaid ({stats.unpaidCount})</option>
            <option value="PAID">Paid / Recovered ({stats.paidCount})</option>
          </select>
        </div>

        <button
          id="refresh-invoices-btn"
          onClick={loadInvoices}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Sync Invoices
        </button>
      </div>

      {/* Invoices List / Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-neutral-500">
          <RefreshCw className="w-8 h-8 animate-spin mb-3 text-blue-500" />
          <p className="text-sm">Calculating invoice aging & overdue alerts...</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">
            No Invoices Added Yet
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-6">
            Track real client invoices and automate overdue recovery reminders via WhatsApp & Email while minimizing payment gateway fee deductions.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create First Invoice
          </button>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 text-center text-neutral-500 text-sm">
          No invoices match the selected status filter.
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="py-3.5 px-4">Invoice # & Client</th>
                  <th className="py-3.5 px-4">Due Date / Aging</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Gateway & Fee</th>
                  <th className="py-3.5 px-4">Fee Optimization</th>
                  <th className="py-3.5 px-4 text-right">Recovery Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {filteredInvoices.map((inv) => {
                  const isOverdue = inv.status === 'OVERDUE' || inv.daysOverdue > 0;
                  return (
                    <tr 
                      key={inv.id} 
                      className={`hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors ${
                        isOverdue ? 'bg-rose-50/20 dark:bg-rose-950/10' : ''
                      }`}
                    >
                      {/* Invoice & Client */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-neutral-900 dark:text-white">
                          #{inv.invoiceNumber}
                        </div>
                        <div className="text-xs text-neutral-700 dark:text-neutral-300 font-medium mt-0.5">
                          {inv.clientName}
                          {inv.clientCompany && <span className="text-neutral-500 font-normal"> ({inv.clientCompany})</span>}
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          {inv.clientEmail} {inv.clientPhone && `• ${inv.clientPhone}`}
                        </div>
                      </td>

                      {/* Due Date & Aging */}
                      <td className="py-4 px-4">
                        <div className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                          Due: {inv.dueDate}
                        </div>
                        {isOverdue ? (
                          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-1">
                            <Clock className="w-3 h-3" />
                            {inv.daysOverdue} days overdue
                          </div>
                        ) : inv.status === 'PAID' ? (
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                            Paid {inv.paidDate ? new Date(inv.paidDate).toLocaleDateString() : 'Confirmed'}
                          </div>
                        ) : (
                          <div className="text-[11px] text-neutral-500 mt-1">
                            Issued: {inv.issueDate}
                          </div>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 text-right">
                        <div className="font-bold text-base text-neutral-900 dark:text-white">
                          {inv.currency} {inv.amount.toLocaleString()}
                        </div>
                        {inv.paidAmount && inv.status === 'PAID' && (
                          <div className="text-[11px] text-emerald-600 font-medium">
                            Collected: {inv.currency} {inv.paidAmount.toLocaleString()}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          inv.status === 'OVERDUE' || isOverdue ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {inv.status === 'PAID' && <Check className="w-3 h-3 text-emerald-600" />}
                          {isOverdue && <AlertCircle className="w-3 h-3 text-rose-600" />}
                          {inv.status}
                        </span>
                        {inv.reminderCount > 0 && (
                          <div className="text-[10px] text-neutral-500 mt-1">
                            {inv.reminderCount} reminder{inv.reminderCount > 1 ? 's' : ''} sent
                          </div>
                        )}
                      </td>

                      {/* Gateway & Fee */}
                      <td className="py-4 px-4">
                        <div className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                          {inv.selectedGateway.split('(')[0]}
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          Est Fee: <strong>${inv.currentGatewayFee.toFixed(2)}</strong>
                        </div>
                      </td>

                      {/* Fee Optimization */}
                      <td className="py-4 px-4">
                        {inv.feeSavingsAmount > 5 ? (
                          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-900/60">
                            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              Save ${inv.feeSavingsAmount.toFixed(2)}
                            </div>
                            <div className="text-[10px] text-neutral-600 dark:text-neutral-400">
                              Route via {inv.recommendedGateway.split('(')[0]}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-500">
                            Optimal Gateway
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {inv.status !== 'PAID' && (
                            <>
                              <button
                                title="Generate & Send Payment Reminder"
                                onClick={() => setReminderInvoice(inv)}
                                className="px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1"
                              >
                                <Send className="w-3 h-3" />
                                Send Alert
                              </button>
                              <button
                                title="Mark as Paid"
                                onClick={() => handleMarkAsPaid(inv)}
                                className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                Paid
                              </button>
                            </>
                          )}
                          <button
                            title="Edit Invoice"
                            onClick={() => openEditModal(inv)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            title="Delete Invoice"
                            onClick={() => handleDelete(inv.id)}
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

      {/* Modal for Invoice Creation / Editing */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                {editingInvoice ? 'Edit Invoice' : 'Create Real Client Invoice'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Invoice Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. INV-1042"
                    value={formInvoiceNumber}
                    onChange={(e) => setFormInvoiceNumber(e.target.value)}
                    className="w-full text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David Vance"
                    value={formClientName}
                    onChange={(e) => setFormClientName(e.target.value)}
                    className="w-full text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Client Email
                  </label>
                  <input
                    type="email"
                    placeholder="client@company.com"
                    value={formClientEmail}
                    onChange={(e) => setFormClientEmail(e.target.value)}
                    className="w-full text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Client Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="+1 555 019 2831"
                    value={formClientPhone}
                    onChange={(e) => setFormClientPhone(e.target.value)}
                    className="w-full text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Client Company / Organization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Global Corp"
                  value={formClientCompany}
                  onChange={(e) => setFormClientCompany(e.target.value)}
                  className="w-full text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="e.g. 7500"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Currency
                  </label>
                  <select
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    className="w-full text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={formIssueDate}
                    onChange={(e) => setFormIssueDate(e.target.value)}
                    className="w-full text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Payment Gateway Routing
                </label>
                <select
                  value={formGateway}
                  onChange={(e) => setFormGateway(e.target.value as PaymentGatewayType)}
                  className="w-full text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {PAYMENT_GATEWAYS.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {Number(formAmount) >= 1500 && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                  <Zap className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold">Gateway Fee Optimization Tip:</strong>
                    <p className="text-[11px] mt-0.5">
                      For amounts over $1,500, routing via Wise ACH (0.4% cap $5) saves approximately ${((Number(formAmount) * 0.029) + 0.30 - 5).toFixed(0)} in merchant processing fees compared to standard credit cards!
                    </p>
                  </div>
                </div>
              )}

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
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition-colors"
                >
                  {editingInvoice ? 'Save Invoice' : 'Create & Guard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reminder Generator Modal */}
      {reminderInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Payment Recovery Notice Generator
                </h3>
                <p className="text-xs text-neutral-500">
                  Invoice #{reminderInvoice.invoiceNumber} • {reminderInvoice.clientName} ({reminderInvoice.currency} {reminderInvoice.amount.toLocaleString()})
                </p>
              </div>
              <button
                onClick={() => setReminderInvoice(null)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                ✕
              </button>
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                Escalation Tone:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setReminderTone('GENTLE')}
                  className={`p-2.5 rounded-lg text-xs font-semibold border transition-all text-center ${
                    reminderTone === 'GENTLE'
                      ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-700 dark:text-blue-300'
                      : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  🤝 Friendly (1-7d)
                </button>
                <button
                  type="button"
                  onClick={() => setReminderTone('FIRM')}
                  className={`p-2.5 rounded-lg text-xs font-semibold border transition-all text-center ${
                    reminderTone === 'FIRM'
                      ? 'bg-amber-50 dark:bg-amber-950 border-amber-500 text-amber-700 dark:text-amber-300'
                      : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  ⚡ Firm (8-21d)
                </button>
                <button
                  type="button"
                  onClick={() => setReminderTone('LEGAL')}
                  className={`p-2.5 rounded-lg text-xs font-semibold border transition-all text-center ${
                    reminderTone === 'LEGAL'
                      ? 'bg-rose-50 dark:bg-rose-950 border-rose-500 text-rose-700 dark:text-rose-300'
                      : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  ⚖️ Final Notice (22d+)
                </button>
              </div>
            </div>

            {/* Generated Body */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Formatted Message:
                </span>
                <button
                  onClick={handleCopyReminder}
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied to Clipboard!' : 'Copy Text'}
                </button>
              </div>
              <textarea
                readOnly
                rows={8}
                value={reminderText}
                className="w-full text-xs font-mono bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-lg p-3 text-neutral-800 dark:text-neutral-200 focus:outline-none"
              />
            </div>

            {/* Dispatch Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <div className="text-xs text-neutral-500">
                Dispatching logs reminder timestamp automatically.
              </div>
              <div className="flex items-center gap-2">
                {reminderInvoice.clientPhone && (
                  <button
                    onClick={handleSendViaWhatsApp}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Open WhatsApp
                  </button>
                )}
                <button
                  onClick={handleSendReminderViaEmail}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Launch Email Client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
