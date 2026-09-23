import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  X, 
  Mail, 
  Lock, 
  Building2, 
  User, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  KeyRound, 
  Sparkles,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type AuthModalMode = 'login' | 'signup' | 'verify-email' | 'forgot-password';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthModalMode;
  savePromptReason?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  savePromptReason = null,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<AuthModalMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Enterprise SaaS');
  const [verificationCode, setVerificationCode] = useState('');
  const [activeGeneratedPin, setActiveGeneratedPin] = useState<string | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { 
    user, 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    sendVerificationEmail, 
    verifyEmailWithCode, 
    sendPasswordReset, 
    loginAsDemoUser 
  } = useAuth();

  // Sync mode when initialMode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccessMsg(null);
      if (initialMode === 'verify-email') {
        const storedPin = localStorage.getItem('prime_ai_latest_pin') || '742918';
        setActiveGeneratedPin(storedPin);
      }
    }
  }, [isOpen, initialMode]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  if (!isOpen) return null;

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { label: 'None', score: 0, color: 'bg-white/10' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { label: 'Weak', score: 25, color: 'bg-red-500' };
    if (score <= 3) return { label: 'Medium', score: 65, color: 'bg-amber-500' };
    return { label: 'Strong (Enterprise-Ready)', score: 100, color: 'bg-emerald-500' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
        onSuccess();
        onClose();
      } else if (mode === 'signup') {
        if (!companyName.trim()) {
          throw new Error('Please provide your company or organization name');
        }
        await signUpWithEmail(email, password, companyName, fullName, industry);
        setSuccessMsg(`Welcome, ${fullName || 'Executive'}! Your 14-day Pro workspace has been created. Launching Command Center...`);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 700);
      } else if (mode === 'verify-email') {
        const isVerified = await verifyEmailWithCode(verificationCode);
        if (isVerified) {
          setSuccessMsg('Email verified successfully! Welcome to PRIME AI.');
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1000);
        } else {
          throw new Error('Invalid 6-digit verification code. Please check or click "Resend Code".');
        }
      } else if (mode === 'forgot-password') {
        await sendPasswordReset(email);
        setSuccessMsg(`Password reset instructions have been dispatched to ${email}.`);
      }
    } catch (err: any) {
      console.warn('Auth error:', err);
      let msg = err.message || 'Authentication could not be completed.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'غلط ای میل یا پاس ورڈ۔ براہ کرم دوبارہ چیک کریں / Invalid email or password. Please verify and try again.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'اس ای میل سے اکاؤنٹ پہلے سے موجود ہے۔ ایک ای میل پر صرف ایک اکاؤنٹ کی اجازت ہے۔ براہ کرم لاگ ان کریں / An account with this email already exists. Only 1 account per email is allowed. Please log in.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے / Password should be at least 6 characters.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setLoading(true);
    try {
      const pin = await sendVerificationEmail();
      setActiveGeneratedPin(pin);
      setResendCooldown(60);
      setSuccessMsg(`New 6-digit verification code dispatched!`);
    } catch (err: any) {
      setError(err.message || 'Could not resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantVerify = async () => {
    setLoading(true);
    try {
      const pin = activeGeneratedPin || '742918';
      await verifyEmailWithCode(pin);
      setSuccessMsg('Email verified instantly!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Google Sign-In window was closed. You can also sign up with email and password below.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('Google OAuth domain restricted in preview. Please use email and password to sign up.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup blocked by browser. Please allow popups or use email and password below.');
      } else {
        setError(err.message || 'Google sign-in failed. Please use email and password below.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginAsDemoUser();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError('Could not launch demo workspace.');
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-[#141414] border border-white/10 p-6 sm:p-8 shadow-[0_0_60px_rgba(255,215,0,0.15)] text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo & Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center mx-auto mb-3 text-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.2)]">
            <Crown className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-light tracking-tight text-white font-sans">
            {savePromptReason ? (
              <>Save Your <span className="font-semibold text-[#FFD700]">Executive Data</span></>
            ) : (
              <>PRIME <span className="font-semibold text-[#FFD700]">AI</span></>
            )}
          </h2>
          <p className="text-xs text-white/60 mt-1">
            {savePromptReason && savePromptReason}
            {!savePromptReason && mode === 'login' && 'Sign in to access your 24/7 AI Chief of Operations'}
            {!savePromptReason && mode === 'signup' && 'Start Your 14-Day Free Trial • No Credit Card Required'}
            {!savePromptReason && mode === 'verify-email' && 'Verify your corporate email address'}
            {!savePromptReason && mode === 'forgot-password' && 'Reset your workspace master password'}
          </p>
          {mode === 'signup' && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{savePromptReason ? '💾 Auto-Saves Your Work • 14 Days 100% Free Access' : '14 Days 100% Free • Full Access • No Card Needed'}</span>
            </div>
          )}
        </div>

        {/* Status / Error notifications */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="leading-snug">{successMsg}</span>
          </div>
        )}

        {/* -------------------- 1. EMAIL VERIFICATION MODE -------------------- */}
        {mode === 'verify-email' ? (
          <div className="space-y-4">
            {/* Live Email Delivery Banner */}
            <div className="p-4 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/30 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#FFD700] flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[#FFD700]" />
                  <span>Email Verification Code (OTP)</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#FFD700]/20 text-[#FFD700] font-mono text-[10px] font-bold border border-[#FFD700]/30">
                  SECURITY PIN
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                A 6-digit security code has been generated for <strong className="text-white font-mono">{email || user?.email || 'your email'}</strong>.
              </p>
              
              <div className="flex items-center justify-between bg-black/70 p-3 rounded-xl border border-white/10">
                <div>
                  <div className="text-[10px] text-white/50 uppercase font-mono tracking-wider">Your 6-Digit Code:</div>
                  <div className="text-xl font-mono font-extrabold text-[#FFD700] tracking-widest mt-0.5">
                    {activeGeneratedPin || '742918'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const pin = activeGeneratedPin || '742918';
                    setVerificationCode(pin);
                    navigator.clipboard?.writeText?.(pin);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#FFD700] text-xs font-bold font-mono transition-all cursor-pointer border border-[#FFD700]/30"
                >
                  Auto-Fill PIN ↵
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">
                  Enter 6-Digit Verification PIN
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#FFD700] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6 digits (e.g. 742918)"
                    className="w-full bg-[#101010] border border-white/15 focus:border-[#FFD700] rounded-xl pl-10 pr-4 py-3 text-base text-white font-mono tracking-widest text-center placeholder-white/20 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="submit"
                  disabled={loading || verificationCode.length < 4}
                  className="w-full py-3 rounded-xl text-xs font-bold text-black bg-[#FFD700] hover:bg-[#FFC700] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-[0_0_20px_rgba(255,215,0,0.2)]"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify &amp; Continue</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleInstantVerify}
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-[#FFD700] hover:brightness-110 border border-amber-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-black" />
                  <span>1-Click Verify</span>
                </button>
              </div>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => {
                    onSuccess();
                    onClose();
                  }}
                  className="text-xs text-white/50 hover:text-[#FFD700] transition-colors cursor-pointer"
                >
                  Skip verification for now &amp; enter dashboard →
                </button>
              </div>
            </form>

            <div className="flex items-center justify-between text-xs text-white/50 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendCooldown > 0 || loading}
                className="flex items-center gap-1.5 text-xs text-[#FFD700] hover:underline cursor-pointer disabled:opacity-40"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>
                  {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend Code'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className="text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        ) : mode === 'forgot-password' ? (
          /* -------------------- 2. FORGOT PASSWORD MODE -------------------- */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/80 mb-1.5">Your Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-[#101010] border border-white/10 focus:border-[#FFD700] rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-xs font-bold text-black bg-[#FFD700] hover:bg-[#FFC700] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-[0_0_20px_rgba(255,215,0,0.15)]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : 'Send Password Reset Link'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className="text-xs text-[#FFD700] hover:underline cursor-pointer"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        ) : (
          /* -------------------- 3. LOGIN & SIGNUP MODES -------------------- */
          <div className="space-y-4">
            {/* Quick Switch Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-black/40 border border-white/10">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-[#FFD700] text-black shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Sign In (Login)
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); setSuccessMsg(null); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-[#FFD700] text-black shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Create Account (Sign Up)
              </button>
            </div>

            {/* Google Sign-in Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#101010] hover:bg-white/5 border border-white/10 font-semibold text-xs text-white flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z" />
                <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-[#141414] px-2 text-white/30">or enter work credentials</span>
              </div>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">Executive Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Adnan Khan"
                        className="w-full bg-[#101010] border border-white/10 focus:border-[#FFD700] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1">Company Name</label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. Prime Enterprise"
                          className="w-full bg-[#101010] border border-white/10 focus:border-[#FFD700] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1">Industry</label>
                      <div className="relative">
                        <Briefcase className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                        <select
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          className="w-full bg-[#101010] border border-white/10 focus:border-[#FFD700] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none transition-colors appearance-none cursor-pointer"
                        >
                          <option value="Enterprise SaaS">Enterprise SaaS</option>
                          <option value="FinTech & Banking">FinTech & Banking</option>
                          <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                          <option value="AI & Deep Tech">AI & Deep Tech</option>
                          <option value="Healthcare & BioTech">Healthcare & BioTech</option>
                          <option value="Agency & Consulting">Agency & Consulting</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-[#101010] border border-white/10 focus:border-[#FFD700] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-white/70">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot-password'); setError(null); }}
                      className="text-[11px] text-[#FFD700] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#101010] border border-white/10 focus:border-[#FFD700] rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator on Sign Up */}
                {mode === 'signup' && password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-white/50">
                      <span>Password Strength:</span>
                      <span className="font-bold text-white/80">{strength.label}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all duration-300`}
                        style={{ width: `${strength.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-[#FFD700] via-amber-300 to-[#FFC700] hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3 shadow-[0_0_25px_rgba(255,215,0,0.25)]"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In to Workspace' : 'Start 14-Day Free Trial (Instant Access)'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Instant Demo CEO Login Option */}
            <div className="pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={handleDemoSignIn}
                disabled={loading}
                className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white/80 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
                <span>Quick Test: 1-Click CEO Demo Account</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
