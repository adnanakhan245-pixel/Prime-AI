import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  Database, 
  Flame, 
  Lock, 
  Mail, 
  MessageSquare, 
  RotateCcw, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  TrendingDown, 
  TrendingUp, 
  UserCheck, 
  UserX, 
  Zap 
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'signup' | 'verify-email' | 'forgot-password') => void;
  onEnterDemo?: () => void;
  onOpenClientPayment?: () => void;
  onOpenClientContact?: () => void;
  onOpenChurnAudit?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onOpenAuth, 
  onEnterDemo,
  onOpenChurnAudit 
}) => {
  const [interactiveLostAmount] = useState<number>(4820);
  const [interactiveRecoveredAmount] = useState<number>(4150);

  const handleLaunchTour = () => {
    if (onEnterDemo) {
      onEnterDemo();
    } else {
      onOpenAuth('signup');
    }
  };

  const handleOpenAuditOrTour = () => {
    if (onOpenChurnAudit) {
      onOpenChurnAudit();
    } else {
      handleLaunchTour();
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#070707] text-white flex flex-col items-center selection:bg-rose-500 selection:text-white">
      
      {/* ========================================================================= */}
      {/* 1. ہیرو سیکشن (HERO SECTION) — خالص اردو ہیڈ لائن اور فوری ریونیو بچاؤ */}
      {/* ========================================================================= */}
      <header className="w-full max-w-5xl mx-auto px-4 pt-12 pb-14 sm:pt-16 sm:pb-20 flex flex-col items-center text-center">
        
        {/* Urgent Live Loss Alert Badge in Urdu */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/40 text-xs font-bold text-rose-300 mb-6 shadow-[0_0_25px_rgba(244,63,94,0.2)] animate-pulse">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span className="font-sans tracking-wide">
            سٹرائپ چرن اور فیلڈ کارڈز کا لائیو رڈار • 1-کلک رقم کی واپسی
          </span>
        </div>

        {/* Urdu Main Bold Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-4xl leading-[1.25] sm:leading-[1.2]">
          پچھلے مہینے آپ <span className="text-rose-500 underline decoration-rose-500/50 decoration-wavy font-mono">${interactiveLostAmount.toLocaleString()}</span> صرف کارڈ فیل ہونے سے ہار گئے۔ <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
            ہم 1 کلک میں واپس لائیں گے۔
          </span>
        </h1>

        {/* English Sub-Headline */}
        <p className="mt-3 text-sm sm:text-base text-zinc-400 font-mono tracking-tight">
          You Lost ${interactiveLostAmount.toLocaleString()} Last Month to Failed Payments. We Bring It Back in 1-Click.
        </p>

        {/* Urdu Sub-headline Description */}
        <p className="mt-5 text-sm sm:text-lg text-zinc-300 max-w-2xl leading-relaxed font-normal">
          پرائم ریڈار آپ کے سٹرائپ اکاؤنٹ کو اسکین کرتا ہے، فیل شدہ کارڈز اور کینسل ہونے والی سبسکرپشنز کو پکڑتا ہے، اور آپ کے سوتے ہوئے رقم خودکار طور پر واپس لاتا ہے۔ سیٹ اپ صرف 3 منٹ میں۔
        </p>

        {/* Visual Comparison: Red Loss vs. Green Recovery in Urdu */}
        <div className="mt-8 w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-right dir-rtl">
          
          {/* سرخ کارڈ: نقصان (The Loss) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/40 via-[#181010] to-black border-2 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.15)] flex items-center justify-between gap-3 text-right">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5 justify-end">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                پچھلے مہینے ضائع شدہ رقم (خاموش نقصان)
              </span>
              <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono dir-ltr text-right">
                -${interactiveLostAmount.toLocaleString()}
              </div>
              <p className="text-xs text-zinc-400">
                5 فیل شدہ سٹرائپ انوائسز اور 7 زائد المعیاد کارڈز
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>

          {/* سبز کارڈ: واپسی (The Recovery) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-[#0d1612] to-black border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)] flex items-center justify-between gap-3 text-right">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 justify-end">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                1-کلک خودکار واپسی (ریکوری)
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono dir-ltr text-right">
                +${interactiveRecoveredAmount.toLocaleString()}
              </div>
              <p className="text-xs text-zinc-400">
                86% رقم ڈے 1 ای میل اور ڈے 3 واٹس ایپ سے واپس
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* CTA Buttons in Urdu */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-3xl">
          
          {/* PRIMARY CTA: Opens Stripe Connect / Free Churn Report */}
          <button
            type="button"
            onClick={handleOpenAuditOrTour}
            className="w-full sm:w-auto px-7 py-4 bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 hover:brightness-110 text-white font-black text-sm rounded-2xl shadow-[0_0_35px_rgba(244,63,94,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-white animate-pulse" />
            <span>[ Free Churn Report دیکھیں - 2 منٹ ]</span>
          </button>

          {/* SECONDARY CTA: Interactive Demo */}
          <button
            type="button"
            onClick={handleLaunchTour}
            className="w-full sm:w-auto px-5 py-4 bg-white/5 hover:bg-white/10 text-zinc-200 hover:text-white font-bold text-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#FFD700]" />
            <span>لائیو ڈیمو (Live Tour)</span>
          </button>

        </div>

        {/* Trust Line in Urdu */}
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-zinc-400 font-medium flex-wrap">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>سٹرائپ کنیکٹ (Read-Only • 100% محفوظ) • کسی کریڈٹ کارڈ کی ضرورت نہیں • فوری 2 منٹ رپورٹ</span>
        </div>

      </header>

      {/* ========================================================================= */}
      {/* SECTION 2 - PAIN: سٹرائپ کا ڈیش بورڈ سچ نہیں بتاتا */}
      {/* ========================================================================= */}
      <section className="w-full max-w-5xl mx-auto px-4 py-12 border-t border-white/5 text-center">
        
        <div className="space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>خاموش مالیاتی نقصان کا پردہ فاش</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Stripe Dashboard Doesn't Tell You The Truth
          </h2>
          <h3 className="text-lg sm:text-xl font-bold text-rose-400">
            سٹرائپ کا ڈیش بورڈ صرف کامیاب پیمنٹس دکھاتا ہے اور خاموش نقصان چھپا دیتا ہے!
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto">
            ہر مہینے آپ کی جیب سے پیسے نکل رہے ہیں اور آپ کو اندازہ بھی نہیں ہوتا:
          </p>
        </div>

        {/* 3 Red Pain Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-right dir-rtl">
          
          {/* Card 1: $ Lost to Failed Payments */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-rose-950/30 via-[#140e0e] to-black border-2 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.12)] space-y-4 hover:border-rose-500 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black text-rose-300 bg-rose-500/20 px-2.5 py-1 rounded-lg border border-rose-500/30">
                  23% CHURN FACTOR
                </span>
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">
                  1. فیل پیمنٹس میں ضائع شدہ رقم
                </h3>
                <div className="text-xs font-bold text-rose-400 font-sans">
                  23% of your churn is just expired cards.
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                کسٹمر سروس چھوڑنا نہیں چاہتا تھا، مگر اس کا کارڈ ایکسپائر ہو گیا یا بینک نے چارج بلاک کر دیا۔ سٹرائپ نے 3 بے اثر ای میلز بھیج کر سبسکرپشن کینسل کر دی۔ آپ کا تیار کسٹمر ضائع ہو گیا!
              </p>
            </div>

            <div className="pt-3 border-t border-rose-500/20 flex items-center justify-between text-[11px] text-rose-400 font-mono dir-ltr">
              <span>-$1,850 avg / client</span>
              <span>خاموش نقصان</span>
            </div>
          </div>

          {/* Card 2: Users About to Cancel */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-rose-950/30 via-[#140e0e] to-black border-2 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.12)] space-y-4 hover:border-rose-500 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black text-rose-300 bg-rose-500/20 px-2.5 py-1 rounded-lg border border-rose-500/30">
                  7-DAY WARNING
                </span>
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">
                  2. جانے والے کسٹمر کی پیشگی خبر
                </h3>
                <div className="text-xs font-bold text-rose-400 font-sans">
                  We detect them 7 days before they leave.
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                کوئی بھی سبسکرائبر اچانک کینسل نہیں کرتا؛ وہ پہلے 7 سے 10 دن ایپ میں لاگ ان کرنا بند کر دیتا ہے۔ سٹرائپ یہ کبھی نہیں بتاتا، لیکن PRIME AI بروقت سرخ الرٹ دکھاتا ہے: "یہ کسٹمر جانے والا ہے"۔
              </p>
            </div>

            <div className="pt-3 border-t border-rose-500/20 flex items-center justify-between text-[11px] text-rose-400 font-mono dir-ltr">
              <span>Early Churn Flag</span>
              <span>7 دن خاموش</span>
            </div>
          </div>

          {/* Card 3: No Manual Work */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-rose-950/30 via-[#140e0e] to-black border-2 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.12)] space-y-4 hover:border-rose-500 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black text-rose-300 bg-rose-500/20 px-2.5 py-1 rounded-lg border border-rose-500/30">
                  HANDS-FREE
                </span>
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">
                  3. زیرو دستی محنت (No Manual Work)
                </h3>
                <div className="text-xs font-bold text-rose-400 font-sans">
                  No more writing "your payment failed" emails.
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                نہ آپ کو خود بیٹھ کر فیلڈ پیمنٹس چیک کرنی ہیں نہ کسٹمرز کو ای میلز لکھنی ہیں۔ پہلے دن خودکار ای میل اور تیسرے دن براہ راست واٹس ایپ میسج خود بخود چلا جاتا ہے۔
              </p>
            </div>

            <div className="pt-3 border-t border-rose-500/20 flex items-center justify-between text-[11px] text-rose-400 font-mono dir-ltr">
              <span>100% Hands-Free</span>
              <span>خودکار نظام</span>
            </div>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* SECTION 3 - SOLUTION: پرائم آپ کا پیسہ کیسے واپس لاتا ہے؟ */}
      {/* ========================================================================= */}
      <section className="w-full max-w-5xl mx-auto px-4 py-12 border-t border-white/5 text-center">
        
        <div className="space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>سبز ریکوری فارمولا</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            How PRIME Recovers Your Money
          </h2>
          <h3 className="text-lg sm:text-xl font-bold text-emerald-400">
            PRIME آپ کا پیسہ کیسے واپس لاتا ہے؟ (سرخ نقصان سے سبز منافع تک)
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto">
            تین ایسے خودکار طریقے جو کسٹمر کو کینسل کرنے نہیں دیتے اور رکی ہوئی رقم واپس لاتے ہیں:
          </p>
        </div>

        {/* 3 Solution Features in Urdu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-right dir-rtl">
          
          {/* Feature 1: ہر فیل پیمنٹ پر فوری الرٹ */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-emerald-950/30 via-[#0e1612] to-black border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.12)] space-y-4 hover:border-emerald-400 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  DAY 1 + DAY 3
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono text-emerald-400 font-bold">Stripe Dunning Telemetry</span>
                <h3 className="text-lg font-black text-white">
                  ہر فیل پیمنٹ پر فوری الرٹ
                </h3>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                سٹرائپ میں کارڈ فیل ہوتے ہی پہلے دن ای میل جاتی ہے: <em>"آپ کی ادائیگی ناکام ہو گئی، ایک کلک میں ٹھیک کریں"</em>۔ اور تیسرے دن واٹس ایپ پر نوٹس: <em>"آپ کا اکاؤنٹ دو دن میں بند ہو جائے گا"</em>۔
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 text-[11px] text-emerald-300 font-mono flex items-center justify-between dir-ltr">
              <span>98% WhatsApp Open</span>
              <span>1-Click Pay Link</span>
            </div>
          </div>

          {/* Feature 2: AI خود کسٹمر کو روک کر رکھے */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-emerald-950/30 via-[#0e1612] to-black border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.12)] space-y-4 hover:border-emerald-400 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  20% CONCESSION
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono text-emerald-400 font-bold">Autonomous Churn Prevention</span>
                <h3 className="text-lg font-black text-white">
                  AI خود کسٹمر کو روک کر رکھے
                </h3>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                جب کوئی یوزر 7 دن تک لاگ ان نہ کرے تو PRIME ریڈ الرٹ دیتا ہے: <em>"یہ کسٹمر جانے والا ہے"</em> اور AI مشورہ دیتا ہے: <em>"اس کو بیس فیصد رعایت دو"</em> (SAVE20NOW) تاکہ کسٹمر ضائع نہ ہو۔
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 text-[11px] text-emerald-300 font-mono flex items-center justify-between dir-ltr">
              <span>20% Discount Code</span>
              <span>Win-Back Playbook</span>
            </div>
          </div>

          {/* Feature 3: اردو / English میں AI خود جواب دے، تم سوئے رہو */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-emerald-950/30 via-[#0e1612] to-black border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.12)] space-y-4 hover:border-emerald-400 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  24/7 BILINGUAL
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono text-emerald-400 font-bold">VIP Billing Inbox</span>
                <h3 className="text-lg font-black text-white">
                  اردو / English میں AI خود جواب دے، تم سوئے رہو
                </h3>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                گاہک کی طرف سے بلنگ کا سوال آئے یا کارڈ اپڈیٹ کی پریشانی، AI سیکنڈوں میں شائستہ اور پیشہ ورانہ جواب دے کر پیمنٹ مکمل کرواتا ہے۔ آپ کے سوتے ہوئے بھی ریکوری چلتی رہے گی۔
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 text-[11px] text-emerald-300 font-mono flex items-center justify-between dir-ltr">
              <span>Zero Human Delay</span>
              <span>اردو + English</span>
            </div>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* SECTION 4 - HOW IT WORKS: صرف 3 آسان اقدامات میں رقم کی واپسی */}
      {/* ========================================================================= */}
      <section className="w-full max-w-5xl mx-auto px-4 py-12 border-t border-white/5 text-center">
        
        <div className="space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-xs font-mono font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            <span>3 منٹ میں سیٹ اپ</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            صرف 3 آسان اقدامات میں رقم کی واپسی
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            کوئی لمبا چوڑا کوڈ نہیں، نہ کوئی پیچیدہ فارم۔ صرف 3 کلکس:
          </p>
        </div>

        {/* 3 Steps Grid in Urdu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-right dir-rtl">
          
          {/* Step 1 */}
          <div className="p-6 rounded-3xl bg-[#101010] border border-white/10 relative space-y-3 hover:border-[#FFD700]/50 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-mono font-black text-[#FFD700] text-sm dir-ltr">
              01
            </div>
            <h3 className="text-base font-extrabold text-white">
              مرحلہ 1: سٹرائپ کنیکٹ کرو (Read-only، 100% محفوظ)
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              صرف ریڈ اونلی سٹرائپ کی درج کرو یا سیدھی CSV فائل ڈالو۔ کوئی کریڈٹ کارڈ یا والٹ پاس ورڈ کی ضرورت نہیں۔ آپ کا ڈیٹا 100% محفوظ ہے۔
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-3xl bg-[#101010] border border-white/10 relative space-y-3 hover:border-rose-500/50 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center font-mono font-black text-rose-400 text-sm dir-ltr">
              02
            </div>
            <h3 className="text-base font-extrabold text-white">
              مرحلہ 2: ہم تمہیں Free Report دکھائیں گے کہ کتنا نقصان ہوا
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              PRIME پچھلے 30 دن کا مکمل حساب کھول دے گا: کتنے ڈالر فیل پیمنٹس میں برباد ہوئے، کتنے گاہک 7 دن سے خاموش ہیں، اور کن کے کارڈز فیل ہونے والے ہیں۔
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-3xl bg-[#101010] border border-white/10 relative space-y-3 hover:border-emerald-500/50 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-mono font-black text-emerald-400 text-sm dir-ltr">
              03
            </div>
            <h3 className="text-base font-extrabold text-white">
              مرحلہ 3: 1-Click دباؤ، پیسے واپس آنا شروع
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              صرف ایک بٹن دباؤ، خودکار ای میل اور واٹس ایپ ریسکیو شروع ہو جائے گا اور سپا بیس میں کسٹمرز واپس آنے کا اندراج خودکار طور پر ہوتا رہے گا۔
            </p>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 5. FOOTER CTA: پرانے 14 دن کے ٹرائلز چھوڑیں */}
      {/* ========================================================================= */}
      <section className="w-full max-w-5xl mx-auto px-4 py-12">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-rose-950/40 via-[#161010] to-[#0A0A0A] border-2 border-rose-500/60 shadow-[0_0_60px_rgba(244,63,94,0.25)] text-center space-y-6 relative overflow-hidden">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold uppercase tracking-wider">
            <Flame className="w-4 h-4 text-rose-400" />
            <span>نقصان آج ہی روکیں</span>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Don't offer another 14-day trial. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400">
                Show them the money they already lost.
              </span>
            </h2>
            <p className="text-sm sm:text-lg text-zinc-200 max-w-xl mx-auto leading-relaxed">
              پرانے بورنگ 14 دن کے ٹرائلز چھوڑیں۔ کسٹمر کو وہ رقم دکھائیں جو وہ پہلے ہی کارڈ فیل ہونے کی وجہ سے ہار چکے ہیں!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={handleOpenAuditOrTour}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:brightness-110 text-black font-black text-base shadow-[0_0_35px_rgba(16,185,129,0.35)] transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 text-black" />
              <span>مفت آڈٹ سے شروع کریں — پیسے تب دیں جب ریکوری ہو</span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-center gap-4 text-xs text-zinc-400 font-mono flex-wrap">
            <span>⚡ سٹرائپ ریڈ اونلی محفوظ</span>
            <span>•</span>
            <span>🚀 صرف 2 منٹ رپورٹ</span>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* CLEAN FOOTER IN URDU */}
      {/* ========================================================================= */}
      <footer className="w-full border-t border-white/5 py-8 text-center text-xs text-zinc-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-black text-xs">
              P
            </div>
            <span className="text-zinc-300 font-bold">PRIME AI</span>
            <span>— خودکار ریونیو ریکوری اور چرن ڈیفنس</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <button
              type="button"
              onClick={handleOpenAuditOrTour}
              className="text-rose-400 hover:underline transition-colors cursor-pointer font-bold"
            >
              مفت چرن رپورٹ
            </button>
            <button
              type="button"
              onClick={handleLaunchTour}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              پراڈکٹ ڈیمو
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              سائن ان
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth('signup')}
              className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white transition-colors font-bold cursor-pointer shadow-sm"
            >
              اکاؤنٹ بنائیں
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};
