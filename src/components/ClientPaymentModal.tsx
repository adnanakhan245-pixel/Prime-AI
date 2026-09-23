import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  Building2, 
  Lock, 
  Zap, 
  AlertCircle,
  Copy,
  ExternalLink,
  Receipt
} from 'lucide-react';
import { InvoiceItem } from '../types';
import { fetchInvoiceById, recordClientSelfServicePayment } from '../services/db';

interface ClientPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialInvoice?: InvoiceItem | null;
  initialInvoiceId?: string | null;
}

export const ClientPaymentModal: React.FC<ClientPaymentModalProps> = ({
  isOpen,
  onClose,
  initialInvoice,
  initialInvoiceId
}) => {
  const [invoice, setInvoice] = useState<InvoiceItem | null>(initialInvoice || null);
  const [searchQuery, setSearchQuery] = useState(initialInvoiceId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form payment fields
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE_CARD' | 'BANK_TRANSFER' | 'WISE' | 'APPLE_PAY'>('STRIPE_CARD');
  const [payerName, setPayerName] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paidReceipt, setPaidReceipt] = useState<{
    txRef: string;
    paidAt: string;
    amount: number;
    currency: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (initialInvoice) {
      setInvoice(initialInvoice);
      setPayerName(initialInvoice.clientName || '');
      setPayerEmail(initialInvoice.clientEmail || '');
    } else if (initialInvoiceId) {
      handleLookup(initialInvoiceId);
    }
  }, [initialInvoice, initialInvoiceId]);

  const handleLookup = async (idOrNum: string) => {
    if (!idOrNum.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const found = await fetchInvoiceById(idOrNum);
      if (found) {
        setInvoice(found);
        setPayerName(found.clientName || '');
        setPayerEmail(found.clientEmail || '');
        if (found.status === 'PAID') {
          setPaidReceipt({
            txRef: `TXN-${found.id.slice(-6).toUpperCase()}`,
            paidAt: found.paidDate || new Date().toISOString(),
            amount: found.paidAmount || found.amount,
            currency: found.currency
          });
        }
      } else {
        setError(`No invoice found matching "${idOrNum}". Please verify your invoice number.`);
      }
    } catch (e) {
      setError('Unable to load invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    if (!payerName.trim() || !payerEmail.trim()) {
      setError('Please provide your name and email address for the receipt.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Simulate rapid banking gateway settlement
      await new Promise(r => setTimeout(r, 1200));

      const txRef = `TXN-${paymentMethod.slice(0, 3)}-${Date.now().toString(36).toUpperCase()}`;
      const updated = await recordClientSelfServicePayment(invoice.id, invoice.companyId, {
        method: paymentMethod,
        payerName: payerName.trim(),
        payerEmail: payerEmail.trim(),
        transactionReference: txRef,
        amount: invoice.amount
      });

      if (updated) {
        setInvoice(updated);
        setPaidReceipt({
          txRef,
          paidAt: new Date().toISOString(),
          amount: updated.amount,
          currency: updated.currency
        });
      }
    } catch (err: any) {
      setError(err?.message || 'Payment processing encountered an error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyDirectLink = () => {
    if (!invoice) return;
    const url = `${window.location.origin}/?payInvoice=${invoice.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121212] border border-[#FFD700]/30 rounded-2xl max-w-xl w-full p-6 text-white shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#FFD700]/15 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700]">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Client Self-Service Payment Portal</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                Direct 24/7 Processing
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Pay invoices instantly online without waiting for admin authorization.
            </p>
          </div>
        </div>

        {/* Invoice Lookup if not yet selected */}
        {!invoice && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <label className="block text-xs font-semibold text-neutral-300">
                Enter Invoice Number or Reference:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. INV-1042 or inv_..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-black/60 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD700]"
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleLookup(searchQuery)}
                  className="px-5 py-2.5 bg-[#FFD700] hover:bg-[#FFE55C] text-black font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50 transition-all"
                >
                  {loading ? 'Finding...' : 'Find Invoice'}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {/* Invoice Content */}
        {invoice && (
          <div className="space-y-5">
            {/* Invoice Card Summary */}
            <div className="p-4 rounded-xl bg-neutral-900/90 border border-white/10 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
                    Invoice #{invoice.invoiceNumber}
                  </div>
                  <div className="text-lg font-extrabold text-white mt-0.5">
                    {invoice.clientName} {invoice.clientCompany ? `(${invoice.clientCompany})` : ''}
                  </div>
                  <div className="text-xs text-neutral-400 mt-1">
                    Issued: {invoice.issueDate} • Due Date: {invoice.dueDate}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-neutral-400 font-medium">Total Amount</div>
                  <div className="text-2xl font-black text-[#FFD700] font-mono">
                    {invoice.currency} {invoice.amount.toLocaleString()}
                  </div>
                  <span className={`inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    invoice.status === 'PAID' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {invoice.status === 'PAID' ? '✓ PAID IN FULL' : 'PENDING PAYMENT'}
                  </span>
                </div>
              </div>

              {invoice.notes && (
                <div className="pt-2.5 border-t border-white/10 text-xs text-neutral-300">
                  <span className="text-neutral-500 font-semibold">Invoice Notes: </span>
                  {invoice.notes}
                </div>
              )}

              {/* Direct Link Share */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-400">
                <span>Direct Payment Link:</span>
                <button
                  type="button"
                  onClick={handleCopyDirectLink}
                  className="inline-flex items-center gap-1 text-[#FFD700] hover:underline font-semibold cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  {copiedLink ? 'Copied to Clipboard!' : 'Copy Payment Link'}
                </button>
              </div>
            </div>

            {/* PAID RECEIPT VIEW */}
            {paidReceipt || invoice.status === 'PAID' ? (
              <div className="p-6 rounded-2xl bg-gradient-to-b from-emerald-950/40 to-black border border-emerald-500/40 text-center space-y-4 animate-in zoom-in-95">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Payment Completed Successfully!</h3>
                  <p className="text-xs text-emerald-400 font-semibold mt-1">
                    Invoice #{invoice.invoiceNumber} has been settled in full.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-black/50 border border-emerald-500/20 text-xs space-y-2 text-left max-w-sm mx-auto">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Amount Paid:</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {paidReceipt?.currency || invoice.currency} {(paidReceipt?.amount || invoice.amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Transaction Ref:</span>
                    <span className="text-white font-mono">{paidReceipt?.txRef || 'TXN-ONLINE'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Processed At:</span>
                    <span className="text-white">{new Date(paidReceipt?.paidAt || Date.now()).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Authorization:</span>
                    <span className="text-emerald-400 font-semibold">Autonomous Instant Settlement</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Print / Save Receipt
                  </button>
                  <button
                    onClick={onClose}
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* PAYMENT CHECKOUT FORM */
              <form onSubmit={handleProcessPayment} className="space-y-4">
                {/* Payment Method Selector */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-2">
                    Select Payment Method:
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('STRIPE_CARD')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === 'STRIPE_CARD'
                          ? 'bg-[#FFD700]/15 border-[#FFD700] text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-[#FFD700]" />
                      <span>Credit Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('BANK_TRANSFER')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === 'BANK_TRANSFER'
                          ? 'bg-[#FFD700]/15 border-[#FFD700] text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      <span>Bank Wire / ACH</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('APPLE_PAY')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === 'APPLE_PAY'
                          ? 'bg-[#FFD700]/15 border-[#FFD700] text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Zap className="w-4 h-4 text-blue-400" />
                      <span>Apple / G-Pay</span>
                    </button>
                  </div>
                </div>

                {/* Payer Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                      Payer Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD700]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                      Receipt Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="billing@company.com"
                      value={payerEmail}
                      onChange={(e) => setPayerEmail(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD700]"
                    />
                  </div>
                </div>

                {/* Card Fields (Simulated Secure PCI Checkout) */}
                {paymentMethod === 'STRIPE_CARD' && (
                  <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-neutral-900 border border-white/20 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#FFD700]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                          Expiry (MM/YY)
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-neutral-900 border border-white/20 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#FFD700]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                          CVC / CVV
                        </label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full bg-neutral-900 border border-white/20 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#FFD700]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'BANK_TRANSFER' && (
                  <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-200 space-y-1.5">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-blue-400" />
                      Direct Wire &amp; Instant ACH Routing
                    </div>
                    <p className="text-[11px] text-neutral-300">
                      Bank Name: Silicon Valley Bank / JPMorgan Chase • Account: Ending in 8892 • Routing: 121000358
                    </p>
                    <p className="text-[10px] text-blue-300">
                      Submitting here marks your invoice settled immediately with autonomous verification.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Autonomous processing badge */}
                <div className="flex items-center gap-2 text-[11px] text-neutral-400 pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Instant Autonomous Processing:</strong> Payments are processed immediately without requiring any admin approval or delays.
                  </span>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FFD700] to-amber-400 text-black font-extrabold text-sm hover:brightness-110 shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isProcessing 
                      ? 'Processing Secure Payment...' 
                      : `Authorize & Pay ${invoice.currency} ${invoice.amount.toLocaleString()} Now`}
                  </span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
