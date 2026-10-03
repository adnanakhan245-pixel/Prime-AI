import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Download, 
  Lock, 
  DollarSign, 
  CreditCard, 
  Flame, 
  Clock, 
  RefreshCw, 
  Zap, 
  Send,
  Building2,
  TrendingDown,
  TrendingUp,
  Mail,
  Smartphone,
  Upload,
  FileSpreadsheet
} from 'lucide-react';
import { 
  runChurnAudit, 
  runChurnAuditFromCsv,
  getSavedChurnAudit, 
  exportChurnAuditCsv, 
  markAccountRecovered 
} from '../services/churnAudit';
import { ChurnAuditResult, ChurnAuditAccount } from '../types';
import { useAuth } from '../context/AuthContext';

interface FreeChurnAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartPro?: () => void;
}

export const FreeChurnAuditModal: React.FC<FreeChurnAuditModalProps> = ({
  isOpen,
  onClose,
  onStartPro
}) => {
  const { company, redirectToCheckout, upgradeToPro } = useAuth();
  const [stripeKey, setStripeKey] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [auditResult, setAuditResult] = useState<ChurnAuditResult | null>(null);
  const [recoveredCount, setRecoveredCount] = useState(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const existing = getSavedChurnAudit();
      if (existing) {
        setAuditResult(existing);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleStartAudit = async (useDemo: boolean = false) => {
    setScanning(true);
    setScanStep(1);

    // Simulated animated telemetry scan steps
    setTimeout(() => setScanStep(2), 700);
    setTimeout(() => setScanStep(3), 1400);

    setTimeout(async () => {
      try {
        const key = useDemo ? '' : stripeKey.trim();
        const result = await runChurnAudit(key, company?.id || 'comp_workspace_01');
        setAuditResult(result);
      } catch (err) {
        console.error('Audit error:', err);
      } finally {
        setScanning(false);
        setScanStep(0);
      }
    }, 2100);
  };

  const handleCsvFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setScanStep(1);
    setTimeout(() => setScanStep(2), 600);
    setTimeout(() => setScanStep(3), 1200);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = (event.target?.result as string) || '';
      try {
        const result = await runChurnAuditFromCsv(text, company?.id || 'comp_workspace_01');
        setTimeout(() => {
          setAuditResult(result);
          setScanning(false);
          setScanStep(0);
          showToast(`✓ CSV فائل سے تجزیہ مکمل: ${result.allAccounts.length} اکاؤنٹس اور $${result.totalDollarsLost30Days.toLocaleString()} کا نقصان معلوم ہوا!`);
        }, 1500);
      } catch (err) {
        console.error('CSV parse error:', err);
        setScanning(false);
        setScanStep(0);
      }
    };
    reader.readAsText(file);
  };

  const handle1ClickRecover = (account: ChurnAuditAccount) => {
    const updated = markAccountRecovered(account.id);
    if (updated) {
      setAuditResult(updated);
      setRecoveredCount(prev => prev + 1);
      showToast(`✓ 1-Click Rescue Deployed to ${account.customerName}! ($${account.mrrLost.toLocaleString()}/mo secured)`);
    }
  };

  const handleExport = () => {
    if (auditResult) {
      exportChurnAuditCsv(auditResult);
      showToast('✓ Churn Audit Report CSV Downloaded!');
    }
  };

  const handleProUpgradeCTA = async () => {
    if (onStartPro) {
      onStartPro();
      onClose();
      return;
    }
    try {
      await upgradeToPro();
      showToast('✓ خودکار ریکوری فعال ہو گئی! (پہلے والے پیمنٹ لنکس ہٹا دیے گئے ہیں — فیس صرف ریکوری پر لی جائے گی)');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (e) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl bg-[#0E0E0E] border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.9)] text-white flex flex-col overflow-hidden">
        
        {/* Toast Notification */}
        {toastMsg && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-emerald-500 text-black font-extrabold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-black" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#141414] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-white">مفت 30 روزہ چرن اور ریونیو آڈٹ (Free Churn Report)</h3>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono font-bold">
                  خودکار انجن
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">معلوم کریں پچھلے 30 دنوں میں سٹرائپ اور ایکسپائرڈ کارڈز سے آپ کا کتنا ریونیو ضائع ہوا ہے۔</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          
          {/* STEP 1: KEY INPUT (If audit not yet generated) */}
          {!auditResult && !scanning && (
            <div className="space-y-6 max-w-2xl mx-auto py-4">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-2">
                  <TrendingDown className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-white">
                  پچھلے مہینے آپ کی ساس (SaaS) کمپنی کا کتنا پیسہ ضائع ہوا؟
                </h2>
                <p className="text-xs text-zinc-400 max-w-lg mx-auto leading-relaxed">
                  اپنا سٹرائپ ریڈ-اونلی (Read-Only) کی ڈالیں یا بغیر سٹرائپ کے CSV فائل اپلوڈ کریں، یا فوری سیمپل رپورٹ دیکھیں۔ ہمارا سسٹم فیل چارجز، 7 دن میں ایکسپائر ہونے والے کارڈز اور خاموش کسٹمرز کو خودکار اسکین کرے گا۔
                </p>
              </div>

              {/* Form Input Box */}
              <div className="p-5 rounded-2xl bg-[#161616] border border-white/10 space-y-4 shadow-xl">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>سٹرائپ API Key (صرف ریڈ اونلی - Read Only)</span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono font-normal">
                      <Lock className="w-3 h-3" /> 100% محفوظ • زیرو رسک
                    </span>
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={stripeKey}
                      onChange={(e) => setStripeKey(e.target.value)}
                      placeholder="rk_live_... یا sk_test_..."
                      className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#FFD700] font-mono transition-colors"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1.5">
                    ہمیں کسی رائٹ (Write) پرمیشن کی ضرورت نہیں۔ آپ کی کیز AES-256 سے محفوظ رہتی ہیں۔
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleStartAudit(false)}
                    disabled={!stripeKey.trim()}
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-extrabold text-xs hover:brightness-110 shadow-lg cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>سٹرائپ اسکین شروع کریں (Run Churn Audit)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartAudit(true)}
                    className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-[#FFD700]" />
                    <span>فوری ڈیمو آڈٹ دیکھیں (1-Click)</span>
                  </button>
                </div>

                {/* OR SEPARATOR FOR CSV UPLOAD WITHOUT STRIPE */}
                <div className="relative flex items-center justify-center pt-2">
                  <div className="border-t border-white/10 w-full" />
                  <span className="bg-[#161616] px-3 text-[10px] uppercase font-mono text-emerald-400 font-bold shrink-0">
                    یا بغیر سٹرائپ کے: CSV فائل اپلوڈ کریں
                  </span>
                  <div className="border-t border-white/10 w-full" />
                </div>

                {/* CSV File Upload Option */}
                <div className="p-4 rounded-xl bg-black/40 border border-dashed border-emerald-500/30 hover:border-emerald-500/60 transition-colors text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-zinc-200">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-bold">بلنگ یا کسٹمرز کی CSV فائل اپلوڈ کریں (Stripe کنیکٹ کیے بغیر)</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 max-w-md mx-auto leading-relaxed">
                    اگر آپ سٹرائپ کنیکٹ نہیں کرنا چاہتے تو اپنی سٹرائپ پیمنٹس، انوائسز یا کسٹمرز کی CSV فائل اپلوڈ کریں۔ سسٹم فائل پڑھ کر فوراً آپ کا نقصان اور ریکوری نکال دے گا!
                  </p>
                  <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95">
                    <Upload className="w-4 h-4" />
                    <span>CSV فائل منتخب کریں (بغیر سٹرائپ کے نقصان دیکھیں)</span>
                    <input
                      type="file"
                      accept=".csv,text/csv,application/vnd.ms-excel"
                      onChange={handleCsvFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 text-center text-[10px] text-zinc-500 font-mono">
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  ✓ SOC-2 مصدقہ پروٹوکول
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  ✓ زیرو رائٹ پرمیشن (صرف ریڈ)
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  ✓ 10 سیکنڈ میں تجزیہ
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ANIMATED SCANNING STATE */}
          {scanning && (
            <div className="py-16 text-center space-y-6 max-w-md mx-auto">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin" />
                <Zap className="w-6 h-6 text-rose-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-white">Running 30-Day Pipeline Diagnostic...</h3>
                <div className="space-y-1.5 text-xs font-mono text-zinc-400">
                  <p className={scanStep >= 1 ? 'text-white flex items-center justify-center gap-2' : 'text-zinc-600'}>
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Scanning Stripe Charges &amp; Webhooks...</span>
                  </p>
                  <p className={scanStep >= 2 ? 'text-white flex items-center justify-center gap-2' : 'text-zinc-600'}>
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Auditing Past-Due Invoices &amp; 7-Day Dropoffs...</span>
                  </p>
                  <p className={scanStep >= 3 ? 'text-white flex items-center justify-center gap-2' : 'text-zinc-600'}>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Synthesizing 1-Click Executive Recovery Playbooks...</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: THE SHOCK-VALUE AUDIT REPORT CARD */}
          {auditResult && !scanning && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* BIG SHOCK BANNER: RED LOSS vs GREEN RECOVERY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. RED LOSS CARD (THE PAIN) */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-950/40 via-red-950/20 to-black border-2 border-rose-500/50 shadow-[0_0_40px_rgba(244,63,94,0.15)] space-y-3 relative overflow-hidden text-right">
                  <div className="absolute -left-4 -bottom-4 w-28 h-28 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                      ضائع شدہ ریونیو
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest text-rose-400 font-mono flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      30 دن کا چرن اور نقصان
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-rose-200/80 font-medium">آپ نے پچھلے 30 دن میں ضائع کیے:</p>
                    <div className="text-3xl sm:text-4xl font-black text-rose-400 tracking-tight font-mono mt-1 dir-ltr text-right">
                      -${auditResult.totalDollarsLost30Days.toLocaleString()} <span className="text-xs font-sans text-rose-300/70">/ ماہانہ</span>
                    </div>
                    <p className="text-xs font-bold text-rose-300/80 mt-1">
                      -${(auditResult.totalDollarsLost30Days * 12).toLocaleString()} سالانہ ضائع شدہ ریٹ (ARR Loss)
                    </p>
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-relaxed border-t border-rose-500/20 pt-3">
                    پتہ لگایا گیا: <strong>{auditResult.failedInvoicesCount} فیل شدہ انوائسز</strong>، <strong>{auditResult.voluntaryChurnCount} کینسل شدہ اکاؤنٹس</strong>، اور <strong>{auditResult.atRiskExpiringCardsCount} اگلے ہفتے ختم ہونے والے کارڈز</strong>۔
                  </p>
                </div>

                {/* 2. GREEN RECOVERY CARD (THE RELIEF) */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-teal-950/20 to-black border-2 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.15)] space-y-3 relative overflow-hidden text-right">
                  <div className="absolute -left-4 -bottom-4 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      82% قابل واپسی
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-400 font-mono flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      1-کلک میں رقم کی واپسی کا امکان
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-emerald-200/80 font-medium">1 کلک میں فوری حاصل ہونے والی رقم:</p>
                    <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight font-mono mt-1 dir-ltr text-right">
                      +${auditResult.totalRecoverableDollars.toLocaleString()} <span className="text-xs font-sans text-emerald-300/70">/ ماہانہ</span>
                    </div>
                    <p className="text-xs font-bold text-emerald-300/80 mt-1">
                      +${(auditResult.totalRecoverableDollars * 12).toLocaleString()} سالانہ محفوظ رقم (Secured ARR)
                    </p>
                  </div>

                  <div className="border-t border-emerald-500/20 pt-3 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-400 font-mono">
                      {recoveredCount > 0 ? `${recoveredCount} اکاؤنٹس واپس آ گئے` : 'واپسی کے لیے تیار'}
                    </span>
                    <span className="text-[11px] text-zinc-300">
                      خودکار ڈننگ ای میل + واٹس ایپ الرٹ:
                    </span>
                  </div>
                </div>

              </div>

              {/* 4 DETAILED BREAKDOWN METRICS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-right">
                <div className="p-4 rounded-2xl bg-[#141414] border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">فیل شدہ ادائیگی</span>
                  <div className="text-lg font-black text-white font-mono">{auditResult.failedPaymentsCount} انوائسز</div>
                  <p className="text-[10px] text-rose-400 font-semibold">${auditResult.failedPaymentsAmount.toLocaleString()} رکی ہوئی رقم</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#141414] border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">کینسل کسٹمرز</span>
                  <div className="text-lg font-black text-white font-mono">{auditResult.voluntaryChurnCount} اکاؤنٹس</div>
                  <p className="text-[10px] text-amber-400 font-semibold">${auditResult.voluntaryChurnArr.toLocaleString()} نقصان</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#141414] border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">ایکسپائرڈ کارڈز (7 دن)</span>
                  <div className="text-lg font-black text-white font-mono">{auditResult.atRiskExpiringCardsCount} کارڈز</div>
                  <p className="text-[10px] text-yellow-400 font-semibold">${auditResult.atRiskExpiringCardsArr.toLocaleString()} خطرے میں</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#141414] border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">خاموش کسٹمرز (7D+)</span>
                  <div className="text-lg font-black text-white font-mono">{auditResult.inactiveAccountsCount} غیر فعال</div>
                  <p className="text-[10px] text-rose-400 font-semibold">${auditResult.inactiveAccountsArr.toLocaleString()} خطرے کی رقم</p>
                </div>
              </div>

              {/* TOP 3 HIGH-VALUE ACCOUNTS FOR 1-CLICK RECOVERY */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleExport}
                    className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#FFD700]" />
                    <span>پوری رپورٹ ڈاؤن لوڈ کریں (.CSV)</span>
                  </button>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono flex items-center gap-2">
                    <span>1-کلک میں فوری واپس لائے جانے والے اکاؤنٹس</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
                  </h4>
                </div>

                <div className="space-y-2.5">
                  {auditResult.topRecoverableAccounts.map((account) => (
                    <div 
                      key={account.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        account.recovered 
                          ? 'bg-emerald-950/20 border-emerald-500/40' 
                          : 'bg-[#141414] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white">{account.customerName}</span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold ${
                            account.riskType === 'FAILED_PAYMENT' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                            account.riskType === 'SUBSCRIPTION_CANCELED' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          }`}>
                            {account.riskLabel}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-400">
                          <span className="text-[#FFD700] font-mono font-bold">${account.mrrLost.toLocaleString()}/mo ($${account.arrLost.toLocaleString()} ARR)</span>
                          <span>•</span>
                          <span>{account.customerEmail}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold">{account.recoveryProbability}% Rescue Probability</span>
                        </div>
                        <p className="text-[11px] text-zinc-300 italic max-w-xl">
                          "{account.rescueSnippet}"
                        </p>
                      </div>

                      <div className="shrink-0">
                        {account.recovered ? (
                          <span className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 font-mono">
                            <CheckCircle2 className="w-3.5 h-3.5" /> رقم واپس حاصل کر لی گئی
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handle1ClickRecover(account)}
                            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-black font-extrabold text-xs shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                          >
                            <Zap className="w-3.5 h-3.5 text-black" />
                            <span>1-کلک ریسکیو (واپسی)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* THE ULTIMATE CALL-TO-ACTION (CTA) BUTTON SPECIFIED BY USER */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-[#FFD700]/20 via-amber-500/20 to-[#FFD700]/20 border-2 border-[#FFD700] shadow-[0_0_50px_rgba(255,215,0,0.25)] text-center space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    1-کلک میں ${auditResult.totalRecoverableDollars.toLocaleString()} واپس لائیں
                  </h3>
                  <p className="text-xs text-zinc-300 max-w-md mx-auto">
                    آپ نے پچھلے 30 دن میں ${auditResult.totalDollarsLost30Days.toLocaleString()} ضائع کیے۔ خودکار ملٹی چینل ریکوری فعال کریں، اور سوتے ہوئے اپنا پیسہ واپس پائیں۔
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">

                  <button
                    type="button"
                    onClick={handleProUpgradeCTA}
                    className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 border border-white/15"
                  >
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>مفت آڈٹ سے شروع کریں (Pay Only On Recovery)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExport}
                    className="w-full sm:w-auto px-4 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white font-medium text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 border border-white/10"
                  >
                    <Download className="w-4 h-4 text-[#FFD700]" />
                    <span>CSV رپورٹ</span>
                  </button>
                </div>

                <div className="flex items-center justify-center gap-6 text-[10px] text-zinc-400 font-mono">
                  <span>⚡ 30 دن کی گارنٹی</span>
                  <span>•</span>
                  <span>🔒 محفوظ Stripe &amp; Supabase انضمام</span>
                  <span>•</span>
                  <span>🚀 فوری 3 منٹ سیٹ اپ</span>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
