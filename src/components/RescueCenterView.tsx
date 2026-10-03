import React, { useState, useEffect } from 'react';
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
  Flame
} from 'lucide-react';
import { 
  getDunningRescueItems, 
  getInactivityRiskItems, 
  triggerDay1Email, 
  triggerDay3WhatsApp, 
  markCustomerStatus, 
  simulateStripeFailedPayment, 
  applyInactivity20PercentConcession 
} from '../services/dunningRescue';
import { DunningRecoveryItem, InactivityRiskItem } from '../types';
import { useAuth } from '../context/AuthContext';

export interface RescueCenterViewProps {
  onNavigate?: (view: string) => void;
}

export const RescueCenterView: React.FC<RescueCenterViewProps> = ({ onNavigate }) => {
  const { companyId } = useAuth();
  const activeCompanyId = companyId || 'comp_workspace_01';

  const [dunningItems, setDunningItems] = useState<DunningRecoveryItem[]>([]);
  const [inactivityItems, setInactivityItems] = useState<InactivityRiskItem[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [activeCompanyId]);

  const loadData = () => {
    const dunning = getDunningRescueItems(activeCompanyId);
    const inact = getInactivityRiskItems(activeCompanyId);
    setDunningItems(dunning);
    setInactivityItems(inact);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Day 1 Email Action
  const handleSendDay1Email = async (id: string) => {
    const updated = await triggerDay1Email(activeCompanyId, id);
    setDunningItems(updated);
    showToast('✓ Day 1 Email Sent: "آپ کی ادائیگی ناکام ہو گئی، ایک کلک میں ٹھیک کریں"');
  };

  // Day 3 WhatsApp Action
  const handleSendDay3WhatsApp = async (item: DunningRecoveryItem) => {
    const updated = await triggerDay3WhatsApp(activeCompanyId, item.id);
    setDunningItems(updated);

    // Optional direct WhatsApp Web open
    const phone = item.customerPhone ? item.customerPhone.replace(/[^0-9]/g, '') : '';
    const text = encodeURIComponent(`آپ کا اکاؤنٹ دو دن میں بند ہو جائے گا۔ سروس بحال رکھنے کے لیے براہ کرم فوری رابطہ یا تصدیق کریں۔`);
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    }
    showToast('✓ Day 3 WhatsApp Dispatched: "آپ کا اکاؤنٹ دو دن میں بند ہو جائے گا"');
  };

  // Mark Customer Returned or Left in Supabase
  const handleCustomerStatusChange = async (id: string, status: 'RECOVERED' | 'CHURNED') => {
    const updated = await markCustomerStatus(activeCompanyId, id, status);
    setDunningItems(updated);
    if (status === 'RECOVERED') {
      showToast('✓ سپا بیس میں اپڈیٹ: کسٹمر واپس آ گیا (Customer Returned)');
    } else {
      showToast('⚠️ سپا بیس میں اپڈیٹ: کسٹمر چلا گیا (Customer Left / Churned)');
    }
  };

  // Simulate Stripe Webhook Failed Payment
  const handleSimulateWebhook = async () => {
    const updated = await simulateStripeFailedPayment(activeCompanyId);
    setDunningItems(updated);
    showToast('⚡ Stripe Webhook Event Simulated: invoice.payment_failed (Day 1 Email Auto-Sent)');
  };

  // Apply 20% Discount for Inactive Customers
  const handleApply20Percent = async (id: string) => {
    const updated = await applyInactivity20PercentConcession(activeCompanyId, id);
    setInactivityItems(updated);
    showToast('✓ AI مشورہ نافذ: 20% رعایت اور ری-انگیجمنٹ میسج بھیج دیا گیا!');
  };

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
            <span className="text-[#FFD700] font-bold">Stripe Webhooks &amp; Supabase</span>
            <span>•</span>
            <span className="text-rose-400">Autonomous Churn Protection</span>
          </div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <span>Rescue Center: فیل پیمنٹ اور جانے والے کسٹمرز کا حل</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono font-bold">
              2 RESCUE ENGINES
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            سٹرائپ ویب ہک اور سپا بیس سے جڑا ہوا خودکار نظام: فیل پیمنٹ پر ڈے 1 ای میل، ڈے 3 واٹس ایپ، اور 7 دن غیر حاضر گاہکوں کو 20% رعایت۔
          </p>
        </div>

        <button
          onClick={handleSimulateWebhook}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:brightness-110 text-white font-extrabold text-xs shadow-md cursor-pointer transition-all flex items-center gap-2 shrink-0 active:scale-95"
          title="Simulate a Stripe invoice.payment_failed webhook event"
        >
          <Zap className="w-4 h-4" />
          <span>Simulate Stripe Failed Payment Webhook</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. فیل پیمنٹ واپسی (STRIPE MULTI-CHANNEL DUNNING SYSTEM) */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#121212] border border-white/10 space-y-6 shadow-xl">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>1. فیل پیمنٹ واپسی (Stripe Dunning Engine)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Supabase Connected
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                پہلے دن ای میل: <em>"آپ کی ادائیگی ناکام ہو گئی، ایک کلک میں ٹھیک کریں"</em> • تیسرے دن واٹس ایپ: <em>"آپ کا اکاؤنٹ دو دن میں بند ہو جائے گا"</em>
              </p>
            </div>
          </div>

          <span className="text-xs font-mono text-zinc-400">
            {dunningItems.filter(i => i.status === 'PENDING').length} Active In Dunning
          </span>
        </div>

        {/* Dunning Items List */}
        <div className="space-y-3.5">
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
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                    <span>{item.customerEmail}</span>
                    <span>•</span>
                    <span className="text-zinc-300 font-mono">{item.customerPhone || 'No Phone'}</span>
                    <span>•</span>
                    <span className="text-zinc-500">Retry Count: {item.retryAttempts}</span>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2">
                  {item.status === 'RECOVERED' ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 font-mono">
                      <UserCheck className="w-3.5 h-3.5" /> کسٹمر واپس آ گیا (RECOVERED)
                    </span>
                  ) : item.status === 'UNCOLLECTIBLE' ? (
                    <span className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 font-mono">
                      <UserX className="w-3.5 h-3.5" /> کسٹمر چلا گیا (CHURNED)
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5" /> DUNNING ACTIVE
                    </span>
                  )}
                </div>
              </div>

              {/* Day 1 Email and Day 3 WhatsApp Step Strip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                
                {/* DAY 1: EMAIL */}
                <div className={`p-3.5 rounded-xl border space-y-1.5 ${
                  item.day1EmailSent ? 'bg-black/40 border-emerald-500/30' : 'bg-black/20 border-white/10'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-400" />
                      <span>پہلے دن ایمیل (Day 1 Email)</span>
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      item.day1EmailSent ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {item.day1EmailSent ? '✓ SENT' : 'PENDING'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 font-medium">
                    "آپ کی ادائیگی ناکام ہو گئی، ایک کلک میں ٹھیک کریں"
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    One-click payment link dispatched directly to client billing inbox.
                  </p>
                </div>

                {/* DAY 3: WHATSAPP */}
                <div className={`p-3.5 rounded-xl border space-y-1.5 ${
                  item.day3WhatsAppSent ? 'bg-black/40 border-emerald-500/30' : 'bg-black/20 border-white/10'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>تیسرے دن واٹس ایپ (Day 3 WhatsApp)</span>
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      item.day3WhatsAppSent ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {item.day3WhatsAppSent ? '✓ SENT' : 'SCHEDULED'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 font-medium">
                    "آپ کا اکاؤنٹ دو دن میں بند ہو جائے گا"
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-zinc-500">
                      High urgency 98% open-rate mobile escalation.
                    </span>
                    {!item.day3WhatsAppSent && item.status === 'PENDING' && (
                      <button
                        onClick={() => handleSendDay3WhatsApp(item)}
                        className="text-[10px] px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/30 cursor-pointer transition-colors"
                      >
                        ⚡ Send WhatsApp Now
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* Supabase Status Line & Decision Buttons */}
              <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <Database className="w-3.5 h-3.5 text-[#FFD700]" />
                  <span>{item.supabaseStatusText || 'Supabase Sync Active'}</span>
                </div>

                {item.status === 'PENDING' && (
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleCustomerStatusChange(item.id, 'RECOVERED')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>کسٹمر واپس آیا (Mark Returned)</span>
                    </button>

                    <button
                      onClick={() => handleCustomerStatusChange(item.id, 'CHURNED')}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 font-bold text-xs transition-all cursor-pointer flex items-center gap-1"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>کسٹمر چلا گیا (Mark Left)</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. جانے والے کسٹمر کی خبر (7-DAY INACTIVITY RADAR + 20% DISCOUNT ADVISOR) */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#121212] border border-white/10 space-y-6 shadow-xl">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>2. جانے والے کسٹمر کی خبر (7-Day Inactivity Warning)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                  سرخ الرٹ
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                جب کوئی یوزر سات دن سے لاگ ان نہ کرے تو الرٹ دکھاؤ: <strong>"یہ کسٹمر جانے والا ہے"</strong> اور AI مشورہ: <strong>"اس کو بیس فیصد رعایت دو"</strong>
              </p>
            </div>
          </div>

          <span className="text-xs font-mono text-rose-400 font-bold">
            {inactivityItems.filter(i => i.status === 'AT_RISK').length} High Churn Risks
          </span>
        </div>

        {/* Inactivity Risk Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inactivityItems.map((item) => (
            <div 
              key={item.id}
              className={`p-5 rounded-2xl border transition-all space-y-4 ${
                item.status === 'CONCESSION_APPLIED'
                  ? 'bg-emerald-950/20 border-emerald-500/40'
                  : 'bg-gradient-to-br from-rose-950/30 via-[#181818] to-black border-2 border-rose-500/60 shadow-[0_0_30px_rgba(244,63,94,0.15)]'
              }`}
            >
              {/* Card Header Alert */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                  <span className="text-base font-black text-rose-400 tracking-wide font-sans">
                    {item.alertTitle} (یہ کسٹمر جانے والا ہے)
                  </span>
                </div>
                <span className="text-xs font-mono font-black text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                  {item.daysSilent} دن سے خاموش
                </span>
              </div>

              {/* Account Telemetry */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{item.customerName}</span>
                  <span className="text-xs font-mono font-bold text-[#FFD700]">${item.mrr.toLocaleString()} / mo (${item.arr.toLocaleString()} ARR)</span>
                </div>
                <p className="text-xs text-zinc-400">{item.customerEmail}</p>
              </div>

              {/* AI ADVICE BOX: "اس کو بیس فیصد رعایت دو" */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 to-yellow-500/10 border border-[#FFD700]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#FFD700] flex items-center gap-1.5 uppercase font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
                    <span>AI مشورہ (AI Recommendation)</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFD700]/20 text-[#FFD700] font-black border border-[#FFD700]/30">
                    20% OFF CODE: {item.discountCode}
                  </span>
                </div>
                <p className="text-sm font-black text-white">
                  "{item.aiAdvice}" (Give 20% Retention Discount)
                </p>
                <p className="text-[11px] text-zinc-300 leading-relaxed italic">
                  "{item.suggestedMessage}"
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 font-mono">
                  Supabase RLS &amp; CRM Sync Active
                </span>

                {item.status === 'CONCESSION_APPLIED' ? (
                  <span className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 20% رعایت لاگو ہو گئی (RESCUED)
                  </span>
                ) : (
                  <button
                    onClick={() => handleApply20Percent(item.id)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FFD700] via-amber-400 to-[#FFD700] hover:brightness-110 text-black font-black text-xs shadow-md cursor-pointer transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5 text-black" />
                    <span>20% رعایت اور ری-انگیجمنٹ میسج بھیجیں</span>
                    <ArrowRight className="w-3.5 h-3.5 text-black" />
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
