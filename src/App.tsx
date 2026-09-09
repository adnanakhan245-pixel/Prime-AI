import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
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
import { AgencyWhiteLabelView } from './components/AgencyWhiteLabelView';
import { AdminDashboard } from './components/AdminDashboard';
import { CEODigitalTwinView } from './components/CEODigitalTwinView';
import { AdSpendOptimizerView } from './components/AdSpendOptimizerView';
import { CashFlowGuardView } from './components/CashFlowGuardView';
import { ROICalculatorView } from './components/ROICalculatorView';
import { FeedbackHubView } from './components/FeedbackHubView';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';
import { CommandPalette } from './components/CommandPalette';
import { VoiceExecutiveModal } from './components/VoiceExecutiveModal';
import { DailyBriefingModal } from './components/DailyBriefingModal';
import { MobileInstallBanner } from './components/MobileInstallBanner';
import { MobileInstallModal } from './components/MobileInstallModal';
import { TrialBanner } from './components/TrialBanner';
import { FeaturePaywallOverlay } from './components/FeaturePaywallOverlay';
import { UpgradePaywallModal } from './components/UpgradePaywallModal';
import { fetchUserEmails } from './services/db';
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
  Lightbulb
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
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'radar' | 'inbox' | 'plans' | 'white-label' | 'admin' | 'closer' | 'hiring' | 'meetings' | 'growth' | 'strategy' | 'board-pack' | 'docs' | 'brain' | 'twin' | 'ad-spend' | 'cashflow-guard' | 'roi-calculator' | 'feedback'>('landing');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'verify-email' | 'forgot-password'>('login');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [voiceHUDOpen, setVoiceHUDOpen] = useState(false);
  const [dailyBriefingOpen, setDailyBriefingOpen] = useState(false);
  const [mobileInstallModalOpen, setMobileInstallModalOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [pendingEmailsCount, setPendingEmailsCount] = useState(0);

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

  // Sync route on auth state changes (Rule 4: Free users can still login and see dashboard)
  useEffect(() => {
    if (!loading) {
      if (user) {
        setIsDemoMode(false);
        if (currentView === 'landing') {
          setCurrentView('dashboard');
        }
      } else {
        if (!isDemoMode) {
          setCurrentView('landing');
        }
      }
    }
  }, [user, loading, isDemoMode]);

  // Load pending email counts for badges
  useEffect(() => {
    if (user) {
      fetchUserEmails(user.uid).then(emails => {
        const pending = emails.filter(e => e.status === 'PENDING_REVIEW').length;
        setPendingEmailsCount(pending);
      }).catch(() => {});
    }
  }, [user, currentView]);

  const handleOpenAuth = (mode: 'login' | 'signup' | 'verify-email' | 'forgot-password') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleNavigate = (view: string) => {
    if (['dashboard', 'radar', 'inbox', 'plans', 'white-label', 'admin', 'closer', 'hiring', 'meetings', 'growth', 'strategy', 'board-pack', 'docs', 'brain', 'twin', 'ad-spend', 'cashflow-guard', 'roi-calculator', 'feedback'].includes(view)) {
      if (!user && !isDemoMode) {
        handleOpenAuth('login');
        return;
      }
      setCurrentView(view as any);
    } else {
      if (isDemoMode && view === 'landing') {
        setIsDemoMode(false);
      }
      setCurrentView('landing');
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
      {/* Smart Mobile App Installation Banner (iOS & Android) */}
      <MobileInstallBanner onOpenModal={() => setMobileInstallModalOpen(true)} />

      {/* Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
        onOpenSettings={() => {
          if (isDemoMode && !user) {
            handleOpenAuth('signup');
          } else {
            setSettingsOpen(true);
          }
        }}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onOpenVoiceHUD={() => setVoiceHUDOpen(true)}
        onOpenDailyBriefing={() => setDailyBriefingOpen(true)}
        isDemoMode={isDemoMode && !user}
        onExitDemo={() => {
          setIsDemoMode(false);
          setCurrentView('landing');
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
      {(!user && !isDemoMode) || currentView === 'landing' ? (
        <LandingPage
          onOpenAuth={handleOpenAuth}
          onEnterDemo={() => {
            setIsDemoMode(true);
            setCurrentView('dashboard');
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
              if (isDemoMode && !user) {
                handleOpenAuth('signup');
              } else {
                setSettingsOpen(true);
              }
            }}
            isDemoMode={isDemoMode && !user}
            onOpenAuth={handleOpenAuth}
            onExitDemo={() => {
              setIsDemoMode(false);
              setCurrentView('landing');
            }}
          />

          {/* Main App Container */}
          <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto pb-24 md:pb-10 max-w-7xl">
            {currentView === 'dashboard' && (
              <DashboardView 
                onNavigate={handleNavigate} 
                onOpenSettings={() => {
                  if (isDemoMode && !user) {
                    handleOpenAuth('signup');
                  } else {
                    setSettingsOpen(true);
                  }
                }}
                onOpenDailyBriefing={() => setDailyBriefingOpen(true)}
              />
            )}
            {currentView === 'radar' && (
              <FeaturePaywallOverlay 
                featureName="Revenue Radar & Churn Sentry" 
                featureDescription="Real-time multi-tenant deal risk monitoring, executive rescue scripts, and autonomous revenue pipeline telemetry."
                isDemoMode={isDemoMode && !user}
                onOpenAuth={handleOpenAuth}
              >
                <RevenueRadarView />
              </FeaturePaywallOverlay>
            )}
            {currentView === 'inbox' && <InboxView />}
            {currentView === 'plans' && <PlansView onNavigate={handleNavigate} />}
            {currentView === 'white-label' && <AgencyWhiteLabelView />}
            {currentView === 'admin' && <AdminDashboard onNavigate={handleNavigate} />}
            {currentView === 'closer' && (
              <FeaturePaywallOverlay 
                featureName="PRIME Deal Closer AI"
                featureDescription="Autonomous high-stakes objection overcoming, real-time contract closer, and live audio negotiation partner."
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
                featureDescription="Automated competitive moats, pricing elasticities, and board-level risk simulation."
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
                featureDescription="Autonomous institutional memory, multi-vector reasoning, and real-time operational context retrieval."
                isDemoMode={isDemoMode && !user}
                onOpenAuth={handleOpenAuth}
              >
                <BrainView />
              </FeaturePaywallOverlay>
            )}
            {currentView === 'twin' && (
              <FeaturePaywallOverlay 
                featureName="CEO Digital Twin" 
                featureDescription="24/7 executive decision cloning, personalized tone modulation, and autonomous delegation engine."
                isDemoMode={isDemoMode && !user}
                onOpenAuth={handleOpenAuth}
              >
                <CEODigitalTwinView />
              </FeaturePaywallOverlay>
            )}
            {currentView === 'ad-spend' && (
              <FeaturePaywallOverlay 
                featureName="Ad Spend Optimizer" 
                featureDescription="Autonomous CAC reduction, wasted ad detection, and cross-channel ROAS reallocation."
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
                featureDescription="Autonomous invoice recovery, burn rate projections, and runway extension warnings."
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
                onNavigatePlans={() => handleNavigate('plans')} 
              />
            )}
            {currentView === 'feedback' && <FeedbackHubView />}
          </main>

          {/* Mobile Bottom Navigation Bar (6 Tabs: Command, Radar, Inbox, Brain, Plans, Admin) */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0E0E0E]/95 backdrop-blur-xl border-t border-white/5 grid grid-cols-6 items-center py-2.5 px-1">
            <button
              onClick={() => handleNavigate('dashboard')}
              className={`flex flex-col items-center justify-center gap-1 text-[9px] sm:text-[10px] font-bold ${
                currentView === 'dashboard' ? 'text-[#FFD700]' : 'text-white/40'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="truncate">Command</span>
            </button>
            <button
              onClick={() => handleNavigate('radar')}
              className={`flex flex-col items-center justify-center gap-1 text-[9px] sm:text-[10px] font-bold relative ${
                currentView === 'radar' ? 'text-rose-400' : 'text-white/40'
              }`}
            >
              <Radar className="w-4 h-4" />
              <span className="truncate">Radar</span>
              <span className="absolute 0 top-0.5 right-2 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            </button>
            <button
              onClick={() => handleNavigate('inbox')}
              className={`flex flex-col items-center justify-center gap-1 text-[9px] sm:text-[10px] font-bold relative ${
                currentView === 'inbox' ? 'text-[#FFD700]' : 'text-white/40'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span className="truncate">Inbox</span>
              {pendingEmailsCount > 0 && (
                <span className="absolute 0 top-0 right-2 w-3.5 h-3.5 rounded-full bg-[#FFD700] text-black text-[8px] font-extrabold flex items-center justify-center">
                  {pendingEmailsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => handleNavigate('brain')}
              className={`flex flex-col items-center justify-center gap-1 text-[9px] sm:text-[10px] font-bold ${
                currentView === 'brain' ? 'text-[#FFD700]' : 'text-white/40'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span className="truncate">Brain</span>
            </button>
            <button
              onClick={() => handleNavigate('plans')}
              className={`flex flex-col items-center justify-center gap-1 text-[9px] sm:text-[10px] font-bold ${
                currentView === 'plans' ? 'text-[#FFD700]' : 'text-white/40'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span className="truncate">Plans</span>
            </button>
            <button
              onClick={() => handleNavigate('admin')}
              className={`flex flex-col items-center justify-center gap-1 text-[9px] sm:text-[10px] font-bold ${
                currentView === 'admin' ? 'text-emerald-400' : 'text-white/40'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="truncate">Admin</span>
            </button>
          </div>
        </div>
      )}

      {/* Upgrade Paywall Modal */}
      <UpgradePaywallModal />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setIsDemoMode(false);
          setAuthModalOpen(false);
          setCurrentView('dashboard');
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
          setSettingsOpen(true);
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
