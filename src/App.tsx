import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { RescueCenterView } from './components/RescueCenterView';
import { InboxView } from './components/InboxView';
import { DocsView } from './components/DocsView';
import { BrainView } from './components/BrainView';
import { RevenueRadarView } from './components/RevenueRadarView';
import { CloserView } from './components/CloserView';
import { HiringView } from './components/HiringView';
import { MeetingsView } from './components/MeetingsView';
import { GrowthLabView } from './components/GrowthLabView';
import { StrategyView } from './components/StrategyView';
import { BoardPackView } from './components/BoardPackView';
import { PlansView } from './components/PlansView';
import { AdminDashboard } from './components/AdminDashboard';
import { CEODigitalTwinView } from './components/CEODigitalTwinView';
import { AdSpendOptimizerView } from './components/AdSpendOptimizerView';
import { CashFlowGuardView } from './components/CashFlowGuardView';
import { ROICalculatorView } from './components/ROICalculatorView';
import { FeedbackHubView } from './components/FeedbackHubView';
import { ApprovalLogView } from './components/ApprovalLogView';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';
import { SettingsView } from './components/SettingsView';
import { FreeChurnAuditModal } from './components/FreeChurnAuditModal';
import { LegalModals } from './components/LegalModals';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { CommandPalette } from './components/CommandPalette';
import { VoiceExecutiveModal } from './components/VoiceExecutiveModal';
import { DailyBriefingModal } from './components/DailyBriefingModal';
import { MobileInstallModal } from './components/MobileInstallModal';
import { TrialBanner } from './components/TrialBanner';
import { FeaturePaywallOverlay } from './components/FeaturePaywallOverlay';
import { UpgradePaywallModal } from './components/UpgradePaywallModal';
import { ClientPaymentModal } from './components/ClientPaymentModal';
import { ClientContactModal } from './components/ClientContactModal';
import { DemoLeadModal } from './components/DemoLeadModal';
import { fetchUserEmails, logVisitorSession } from './services/db';
import { 
  LayoutDashboard, 
  Inbox, 
  FileText, 
  BrainCircuit, 
  Crown,
  Sparkles,
  Radar,
  Mic,
  Users,
  Video,
  TrendingUp,
  Target,
  Briefcase,
  CreditCard,
  ShieldCheck,
  Brain,
  Lightbulb,
  Settings,
  DollarSign,
  AlertTriangle,
  X,
  Activity
} from 'lucide-react';

function AppContent() {
  const { 
    user, 
    profile, 
    company, 
    isPro, 
    isAdmin, 
    isEmailVerified, 
    isTrialExpired,
    isFeatureLocked,
    openUpgradeModal,
    loading 
  } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'radar' | 'inbox' | 'approvals' | 'plans' | 'admin' | 'closer' | 'hiring' | 'meetings' | 'growth' | 'strategy' | 'board-pack' | 'docs' | 'brain' | 'twin' | 'ad-spend' | 'cashflow-guard' | 'roi-calculator' | 'feedback' | 'settings' | 'rescue' | 'privacy-policy'>('landing');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'verify-email' | 'forgot-password'>('login');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [voiceHUDOpen, setVoiceHUDOpen] = useState(false);
  const [dailyBriefingOpen, setDailyBriefingOpen] = useState(false);
  const [mobileSuiteDrawerOpen, setMobileSuiteDrawerOpen] = useState(false);
  const [mobileInstallModalOpen, setMobileInstallModalOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [pendingEmailsCount, setPendingEmailsCount] = useState(0);
  const [savePromptReason, setSavePromptReason] = useState<string | null>(null);
  const [demoLeadModalOpen, setDemoLeadModalOpen] = useState(false);
  const [churnAuditModalOpen, setChurnAuditModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | 'deletion' | 'meta-whatsapp' | null>(null);

  // 24/7 Client Self-Service Portals (Payment & Email - No Admin Approval Gating)
  const [clientPaymentModalOpen, setClientPaymentModalOpen] = useState(false);
  const [clientContactModalOpen, setClientContactModalOpen] = useState(false);
  const [targetedInvoiceId, setTargetedInvoiceId] = useState<string | null>(null);

  // Check URL path (/privacy-policy) and query parameters (?contact=true)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/privacy-policy' || path === '/privacy') {
        setCurrentView('privacy-policy');
      }
      const params = new URLSearchParams(window.location.search);
      if (params.get('contact') === 'true') {
        setClientContactModalOpen(true);
      }
    }
  }, []);

  // Global Cmd + K / Ctrl + K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global listener for "Save" actions while in demo mode
  useEffect(() => {
    const handleSaveAuthPrompt = (e: any) => {
      const reason = e.detail?.reason || "Enter your email to save your changes and activate full 14-day free access.";
      setAuthMode('signup');
      setSavePromptReason(reason);
      setAuthModalOpen(true);
    };
    window.addEventListener('prime_prompt_save_auth', handleSaveAuthPrompt as any);
    return () => window.removeEventListener('prime_prompt_save_auth', handleSaveAuthPrompt as any);
  }, []);

  // Sync route on auth state changes (Rule 4: Free users can still login and see dashboard)
  useEffect(() => {
    if (!loading) {
      if (user) {
        setIsDemoMode(false);
        if (currentView === 'landing') {
          setCurrentView('radar');
        }
      } else {
        if (!isDemoMode) {
          setCurrentView('landing');
        }
      }
    }
  }, [user, loading, isDemoMode]);

  // One-time cleanup of legacy sample entries from client localStorage
  useEffect(() => {
    try {
      const cleaned = localStorage.getItem('prime_real_data_only_enforced_v1');
      if (!cleaned) {
        localStorage.removeItem('strat_demo_init');
        const keys = Object.keys(localStorage);
        for (const k of keys) {
          if (
            k.includes('comp_apex_01') || 
            k.includes('comp_demo_') || 
            k.startsWith('prime_crm_records_') ||
            k.startsWith('prime_dunning_') ||
            k.startsWith('prime_inactivity_')
          ) {
            localStorage.removeItem(k);
          }
        }
        localStorage.setItem('prime_real_data_only_enforced_v1', 'true');
      }
    } catch {}
  }, []);

  // Load pending email counts for badges
  useEffect(() => {
    if (user) {
      fetchUserEmails(user.uid).then(emails => {
        const pending = emails.filter(e => e.status === 'PENDING_REVIEW').length;
        setPendingEmailsCount(pending);
      }).catch(() => {});
    }
  }, [user, currentView]);

  // Real-time visitor & session tracking (Excludes Platform Owner / Admin visits)
  useEffect(() => {
    if (loading) return;
    const isOwner = user?.email?.toLowerCase() === 'adnanakhan245@gmail.com' || isAdmin;
    if (isOwner) {
      try {
        localStorage.setItem('prime_is_owner_admin', 'true');
      } catch (e) {}
      return; // Do NOT log owner's visits
    }
    const vType = user ? 'REGISTERED_ACCOUNT' : (isDemoMode ? 'DEMO_GUEST' : 'LANDING_VISITOR');
    logVisitorSession({
      visitorType: vType,
      userId: user?.uid,
      userEmail: user?.email || undefined,
      userName: profile?.displayName || user?.displayName || undefined,
      companyId: profile?.companyId,
      companyName: profile?.companyName,
      entryPath: currentView === 'landing' ? '/' : `/${currentView}`
    }).catch(() => {});
  }, [user, isAdmin, isDemoMode, currentView, loading]);

  const handleOpenAuth = (mode: 'login' | 'signup' | 'verify-email' | 'forgot-password', reason?: string) => {
    setAuthMode(mode);
    setSavePromptReason(reason || null);
    setAuthModalOpen(true);
  };

  const handleNavigate = (view: string) => {
    if (view === 'landing') {
      setIsDemoMode(false);
      setCurrentView('landing');
      return;
    }
    if (!user && !isDemoMode) {
      handleOpenAuth('signup');
      return;
    }
    if (view === 'dashboard' || view === 'radar') {
      setCurrentView('radar');
      return;
    }
    if (view === 'admin') {
      const isOwner = user?.email?.toLowerCase().trim() === 'adnanakhan245@gmail.com' || isAdmin;
      if (!isOwner) {
        handleOpenAuth('login', 'Admin Dashboard is exclusively for the Platform Owner (adnanakhan245@gmail.com). Please sign in with your owner email.');
        return;
      }
    }
    if (['inbox', 'approvals', 'plans', 'admin', 'closer', 'hiring', 'meetings', 'growth', 'strategy', 'board-pack', 'docs', 'brain', 'twin', 'ad-spend', 'cashflow-guard', 'roi-calculator', 'feedback', 'settings', 'rescue'].includes(view)) {
      setCurrentView(view as any);
    } else {
      setCurrentView('radar');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 animate-pulse">
          <Crown className="w-7 h-7" />
        </div>
        <p className="text-xs uppercase tracking-widest font-bold text-amber-300 font-mono">
          PRIME AI — Initializing Executive Command Center...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans">
      {/* Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
        onOpenSettings={() => {
          handleNavigate('settings');
        }}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onOpenVoiceHUD={() => setVoiceHUDOpen(true)}
        onOpenDailyBriefing={() => setDailyBriefingOpen(true)}
        isDemoMode={isDemoMode && !user}
        onExitDemo={() => {
          setIsDemoMode(false);
          setCurrentView('landing');
        }}
        onEnterDemo={() => {
          setIsDemoMode(true);
          setCurrentView('radar');
        }}
        onOpenChurnAudit={() => setChurnAuditModalOpen(true)}
        onOpenLegal={(type) => {
          if (type === 'privacy') {
            if (typeof window !== 'undefined') {
              window.history.pushState({}, '', '/privacy-policy');
            }
            setCurrentView('privacy-policy');
          } else {
            setLegalModalType(type);
          }
        }}
      />

      {/* Unverified Email Warning Banner */}
      {user && !isEmailVerified && currentView !== 'landing' && (
        <div className="bg-gradient-to-r from-amber-950/80 via-amber-900/60 to-amber-950/80 border-b border-amber-500/30 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>
              <strong>Email Verification Required:</strong> A 6-digit code was sent to <strong className="text-white">{user.email || profile?.email || 'your email'}</strong>. Please verify to confirm your executive account.
            </span>
          </div>
          <button
            onClick={() => handleOpenAuth('verify-email')}
            className="px-3 py-1 rounded-lg bg-amber-400 text-black font-extrabold hover:bg-amber-300 transition-colors shadow-sm cursor-pointer shrink-0"
          >
            Enter 6-Digit Code →
          </button>
        </div>
      )}

      {/* Persistent Interactive Sandbox Mode Sticky Banner */}
      {isDemoMode && !user && currentView !== 'landing' && (
        <div className="bg-gradient-to-r from-amber-950 via-zinc-900 to-amber-950 border-b border-[#FFD700]/40 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs z-30 shadow-lg">
          <div className="flex items-center gap-2 text-amber-200">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFD700] animate-ping shrink-0" />
            <span>
              ⚡ <strong>Enterprise Workspace Live Telemetry:</strong> Real-time AI Chief of Operations suite active.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenAuth('signup')}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FFD700] via-amber-300 to-[#FFC700] text-black font-extrabold hover:brightness-110 transition-all shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95 text-xs"
            >
              <Crown className="w-3.5 h-3.5 text-black" />
              <span>Connect Your Company Workspace (14 Days Free) →</span>
            </button>
            <button
              onClick={() => {
                setIsDemoMode(false);
                setCurrentView('landing');
              }}
              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer text-xs"
            >
              Exit Demo
            </button>
          </div>
        </div>
      )}

      {/* 14-Day Free Trial Countdown & Expired Paywall Banner (Rules 3, 4, 5) */}
      {user && currentView !== 'landing' && (
        <TrialBanner onUpgradeClick={() => openUpgradeModal('Pro')} />
      )}

      {/* Main View Area */}
      {currentView === 'privacy-policy' ? (
        <PrivacyPolicyPage
          onBack={() => {
            if (typeof window !== 'undefined') {
              window.history.pushState({}, '', '/');
            }
            setCurrentView(user || isDemoMode ? 'radar' : 'landing');
          }}
        />
      ) : (!user && !isDemoMode) || currentView === 'landing' ? (
        <LandingPage
          onOpenAuth={handleOpenAuth}
          onEnterDemo={() => {
            setIsDemoMode(true);
            setCurrentView('radar');
          }}
          onOpenClientPayment={() => {
            setTargetedInvoiceId(null);
            setClientPaymentModalOpen(true);
          }}
          onOpenClientContact={() => setClientContactModalOpen(true)}
          onOpenChurnAudit={() => setChurnAuditModalOpen(true)}
          onOpenLegal={(type) => {
            if (type === 'privacy') {
              if (typeof window !== 'undefined') {
                window.history.pushState({}, '', '/privacy-policy');
              }
              setCurrentView('privacy-policy');
            } else {
              setLegalModalType(type);
            }
          }}
        />
      ) : (
        <div className="flex-1 flex flex-col md:flex-row w-full min-h-[calc(100vh-5rem)]">
          {/* Desktop Sidebar */}
          <Sidebar
            currentView={currentView}
            onNavigate={handleNavigate}
            pendingEmailsCount={pendingEmailsCount}
            onOpenSettings={() => {
              handleNavigate('settings');
            }}
            isDemoMode={isDemoMode && !user}
            onOpenAuth={handleOpenAuth}
            onExitDemo={() => {
              setIsDemoMode(false);
              setCurrentView('landing');
            }}
          />

          {/* Main App Container */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-24 md:pb-10 w-full max-w-7xl mx-auto">
            {(currentView === 'dashboard' || currentView === 'radar') && (
              <FeaturePaywallOverlay 
                featureName="PRIME REVENUE & SAAS RADAR" 
                featureDescription="AI-assisted deal risk monitoring, executive rescue drafts, and revenue telemetry. AI will help you to close — it never closes, sends, or charges on its own. 100% Human Approval Required."
                isDemoMode={isDemoMode && !user}
                onOpenAuth={handleOpenAuth}
              >
                <RevenueRadarView onNavigate={handleNavigate} />
              </FeaturePaywallOverlay>
            )}
            {currentView === 'rescue' && <RescueCenterView onNavigate={handleNavigate} />}
            {currentView === 'inbox' && <InboxView />}
            {currentView === 'approvals' && <ApprovalLogView />}
            {currentView === 'plans' && <PlansView onNavigate={handleNavigate} />}
            {currentView === 'admin' && (
              <AdminDashboard 
                onNavigate={handleNavigate} 
                onOpenAuth={handleOpenAuth} 
              />
            )}
            {currentView === 'closer' && (
              <FeaturePaywallOverlay 
                featureName="PRIME Deal Closer AI"
                featureDescription="AI-assisted high-stakes objection overcoming, real-time negotiation drafts, and live audio guidance. AI will help you to close — final decision is yours."
                isDemoMode={isDemoMode && !user}
                onOpenAuth={handleOpenAuth}
              >
                <CloserView />
              </FeaturePaywallOverlay>
            )}
            {currentView === 'hiring' && <HiringView />}
            {currentView === 'meetings' && <MeetingsView />}
            {currentView === 'growth' && <GrowthLabView />}
            {currentView === 'strategy' && (
              <FeaturePaywallOverlay 
                featureName="Strategy Board Intelligence"
                featureDescription="AI-assisted competitive moats, pricing elasticities, and board-level risk simulation. AI will help you to close."
                isDemoMode={isDemoMode && !user}
                onOpenAuth={handleOpenAuth}
              >
                <StrategyView />
              </FeaturePaywallOverlay>
            )}
            {currentView === 'board-pack' && <BoardPackView />}
            {currentView === 'docs' && <DocsView />}
            {currentView === 'brain' && (
              <FeaturePaywallOverlay 
                featureName="Brain 3.0 Neural Knowledge Core" 
                featureDescription="AI-assisted institutional memory, multi-vector reasoning, and real-time operational context retrieval. AI will help you to close."
                isDemoMode={isDemoMode && !user}
                onOpenAuth={handleOpenAuth}
              >
                <BrainView />
              </FeaturePaywallOverlay>
            )}
            {currentView === 'twin' && (
              <FeaturePaywallOverlay 
                featureName="CEO Digital Twin" 
                featureDescription="24/7 executive decision cloning, personalized tone modulation, and AI-assisted delegation engine. Human approval required."
                isDemoMode={isDemoMode && !user}
                onOpenAuth={handleOpenAuth}
              >
                <CEODigitalTwinView />
              </FeaturePaywallOverlay>
            )}
            {currentView === 'ad-spend' && (
              <FeaturePaywallOverlay 
                featureName="Ad Spend Optimizer" 
                featureDescription="AI-assisted CAC reduction, wasted ad detection, and cross-channel ROAS reallocation recommendations."
                isDemoMode={isDemoMode && !user}
                onOpenAuth={handleOpenAuth}
              >
                <AdSpendOptimizerView 
                  currentCompany={company} 
                  userId={user?.uid || ''} 
                />
              </FeaturePaywallOverlay>
            )}
            {currentView === 'cashflow-guard' && (
              <FeaturePaywallOverlay 
                featureName="Cash Flow Guard & Invoices" 
                featureDescription="AI-assisted invoice recovery drafts, burn rate projections, and runway extension warnings. Human approval required."
                isDemoMode={isDemoMode && !user}
                onOpenAuth={handleOpenAuth}
              >
                <CashFlowGuardView 
                  currentCompany={company} 
                  userId={user?.uid || ''} 
                />
              </FeaturePaywallOverlay>
            )}
            {currentView === 'roi-calculator' && (
              <ROICalculatorView 
                currentCompany={company} 
                onNavigatePlans={() => handleNavigate('settings')} 
              />
            )}
            {currentView === 'feedback' && <FeedbackHubView />}
            {currentView === 'settings' && (
              <SettingsView 
                onNavigate={handleNavigate} 
                onOpenAuth={handleOpenAuth} 
              />
            )}
          </main>

          {/* Mobile Bottom Navigation Bar (5 Seamless Responsive Pillars) */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0E0E0E]/95 backdrop-blur-xl border-t border-white/10 grid grid-cols-5 items-center py-2 px-1">
            <button
              onClick={() => handleNavigate('radar')}
              className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold relative ${
                currentView === 'radar' || currentView === 'dashboard' ? 'text-[#FFD700]' : 'text-white/40'
              }`}
            >
              <Radar className="w-4 h-4" />
              <span className="truncate">Radar</span>
              <span className="absolute top-0.5 right-3 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            </button>
            <button
              onClick={() => handleNavigate('rescue')}
              className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold relative ${
                currentView === 'rescue' ? 'text-amber-400' : 'text-white/40'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="truncate">Rescue</span>
            </button>
            <button
              onClick={() => setMobileSuiteDrawerOpen(true)}
              className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold text-white group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FFD700] to-amber-500 text-black flex items-center justify-center shadow-[0_0_15px_rgba(255,215,0,0.3)] group-active:scale-95 transition-transform">
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <span className="text-[9px] text-[#FFD700] font-extrabold truncate">All Tools</span>
            </button>
            <button
              onClick={() => handleNavigate('approvals')}
              className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold relative ${
                currentView === 'approvals' ? 'text-[#FFD700]' : 'text-white/40'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="truncate">Audit</span>
              {pendingEmailsCount > 0 && (
                <span className="absolute top-0 right-3 w-3 h-3 rounded-full bg-[#FFD700] text-black text-[7px] font-extrabold flex items-center justify-center">
                  {pendingEmailsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => handleNavigate('settings')}
              className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold ${
                currentView === 'settings' ? 'text-[#FFD700]' : 'text-white/40 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="truncate">Settings</span>
            </button>
          </div>

          {/* Mobile All Tools Quick Drawer Modal */}
          {mobileSuiteDrawerOpen && (
            <div className="fixed inset-0 z-50 md:hidden bg-black/80 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-200">
              <div 
                className="w-full max-h-[85vh] bg-[#121212] border-t border-[#FFD700]/30 rounded-t-3xl p-5 overflow-y-auto space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.9)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FFD700] to-amber-500 text-black flex items-center justify-center font-black">
                      <Sparkles className="w-4 h-4 text-black" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Executive C-Suite Tools</h3>
                      <p className="text-[10px] text-white/50">Tap any tool to open in full screen</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileSuiteDrawerOpen(false)}
                    className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Grid of All Working Tools */}
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'radar', label: 'Revenue Radar', tag: 'RADAR', icon: Radar, color: 'text-rose-400' },
                    { id: 'rescue', label: 'Rescue Center', tag: 'RESCUE', icon: AlertTriangle, color: 'text-amber-400' },
                    { id: 'closer', label: 'Closer AI', tag: 'SALES', icon: Mic, color: 'text-rose-400' },
                    { id: 'twin', label: 'CEO Twin 3.0', tag: 'DELEGATE', icon: Sparkles, color: 'text-[#FFD700]' },
                    { id: 'brain', label: 'Brain Copilot', tag: 'AI BRAIN', icon: Brain, color: 'text-purple-400' },
                    { id: 'strategy', label: 'Strategy Board', tag: 'STRATEGY', icon: Target, color: 'text-teal-400' },
                    { id: 'cashflow-guard', label: 'Cash Flow Guard', tag: 'FINANCE', icon: DollarSign, color: 'text-emerald-400' },
                    { id: 'ad-spend', label: 'Ad Spend Optimizer', tag: 'MARKETING', icon: TrendingUp, color: 'text-amber-400' },
                    { id: 'board-pack', label: 'Board Pack Gen', tag: 'BOARD', icon: FileText, color: 'text-emerald-400' },
                    { id: 'docs', label: 'Contract Audit', tag: 'LEGAL', icon: FileText, color: 'text-blue-400' },
                    { id: 'inbox', label: 'Executive Inbox', tag: 'INBOX', icon: Inbox, color: 'text-cyan-400' },
                    { id: 'meetings', label: 'Meeting AI', tag: 'MEETINGS', icon: Video, color: 'text-indigo-400' },
                    { id: 'hiring', label: 'Hiring AI', tag: 'RECRUITING', icon: Users, color: 'text-amber-400' },
                    { id: 'roi-calculator', label: 'ROI Calculator', tag: 'ROI', icon: Activity, color: 'text-emerald-400' },
                    { id: 'approvals', label: 'Approvals & Audit', tag: 'AUDIT', icon: ShieldCheck, color: 'text-emerald-400' },
                    { id: 'plans', label: 'Plans & Payment', tag: 'BILLING', icon: CreditCard, color: 'text-[#FFD700]' },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isActive = currentView === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          handleNavigate(t.id);
                          setMobileSuiteDrawerOpen(false);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                          isActive
                            ? 'bg-[#FFD700]/15 border-[#FFD700]/40 text-[#FFD700] shadow-sm'
                            : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/5 text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFD700]' : t.color}`} />
                          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/60">
                            {t.tag}
                          </span>
                        </div>
                        <div className="text-xs font-bold truncate text-white">
                          {t.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upgrade Paywall Modal */}
      <UpgradePaywallModal />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        savePromptReason={savePromptReason}
        onClose={() => {
          setAuthModalOpen(false);
          setSavePromptReason(null);
        }}
        onSuccess={() => {
          setIsDemoMode(false);
          setAuthModalOpen(false);
          setSavePromptReason(null);
          setCurrentView('radar');
        }}
      />

      {/* Workspace Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onOpenVerifyEmail={() => {
          setSettingsOpen(false);
          handleOpenAuth('verify-email');
        }}
        onNavigate={handleNavigate}
      />

      {/* Global Command Palette (Cmd + K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
        onOpenVoiceHUD={() => {
          setCommandPaletteOpen(false);
          setVoiceHUDOpen(true);
        }}
        onOpenSettings={() => {
          setCommandPaletteOpen(false);
          handleNavigate('settings');
        }}
      />

      {/* Hands-free Voice War Room Modal */}
      <VoiceExecutiveModal
        isOpen={voiceHUDOpen}
        onClose={() => setVoiceHUDOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Daily 9:00 AM Executive Briefing Modal */}
      <DailyBriefingModal
        isOpen={dailyBriefingOpen}
        onClose={() => setDailyBriefingOpen(false)}
        onNavigateToInbox={() => handleNavigate('inbox')}
        onNavigateToRadar={() => handleNavigate('radar')}
      />

      {/* Mobile iOS & Android Install Modal */}
      <MobileInstallModal
        isOpen={mobileInstallModalOpen}
        onClose={() => setMobileInstallModalOpen(false)}
      />

      {/* 24/7 Client Self-Service Payment Portal (Instant Settlement - No Admin Gating) */}
      <ClientPaymentModal
        isOpen={clientPaymentModalOpen}
        onClose={() => {
          setClientPaymentModalOpen(false);
          setTargetedInvoiceId(null);
        }}
        initialInvoiceId={targetedInvoiceId}
      />

      {/* 24/7 Direct Client Inbound Email / Message Modal (No Admin Gating) */}
      <ClientContactModal
        isOpen={clientContactModalOpen}
        onClose={() => setClientContactModalOpen(false)}
        targetCompanyId={company?.id}
      />

      {/* 1-Click Interactive Demo Lead Capture Modal */}
      <DemoLeadModal
        isOpen={demoLeadModalOpen}
        onClose={() => setDemoLeadModalOpen(false)}
        onSuccess={() => {
          setDemoLeadModalOpen(false);
          setIsDemoMode(true);
          setCurrentView('radar');
        }}
      />

      {/* Global Free 30-Day Churn Audit Diagnostic Modal */}
      <FreeChurnAuditModal
        isOpen={churnAuditModalOpen}
        onClose={() => setChurnAuditModalOpen(false)}
        onStartPro={() => {
          setChurnAuditModalOpen(false);
          handleNavigate('settings');
        }}
      />

      {/* Meta WhatsApp Cloud API & Legal Compliance Modals */}
      <LegalModals
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
