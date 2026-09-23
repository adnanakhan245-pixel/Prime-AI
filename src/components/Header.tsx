import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Sparkles, 
  LogIn, 
  UserPlus, 
  LogOut, 
  Settings, 
  ShieldCheck, 
  Activity, 
  Search, 
  Mic,
  Building2,
  ChevronDown,
  CreditCard,
  Layers,
  Plus,
  Smartphone,
  Apple,
  MessageSquarePlus,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchAllCompanies } from '../services/db';
import { CompanySummary } from '../types';
import { MobileInstallModal } from './MobileInstallModal';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: (mode: 'login' | 'signup' | 'verify-email' | 'forgot-password') => void;
  onOpenSettings: () => void;
  onOpenCommandPalette?: () => void;
  onOpenVoiceHUD?: () => void;
  onOpenDailyBriefing?: () => void;
  isDemoMode?: boolean;
  onExitDemo?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenSettings,
  onOpenCommandPalette,
  onOpenVoiceHUD,
  onOpenDailyBriefing,
  isDemoMode = false,
  onExitDemo,
}) => {
  const { 
    user, 
    profile, 
    company, 
    companyId, 
    companyName, 
    subscription, 
    isPro,
    daysRemaining,
    trialDaysRemaining,
    isAdmin, 
    isEmailVerified,
    switchCompany, 
    signOut 
  } = useAuth();

  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [companiesList, setCompaniesList] = useState<CompanySummary[]>([]);
  const [mobileInstallModalOpen, setMobileInstallModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAllCompanies().then(list => {
        setCompaniesList(list);
      }).catch(() => {});
    }
  }, [user, companyId]);

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <h2 className="text-sm sm:text-base md:text-xl font-light tracking-tight text-white leading-tight">
            <span className="block sm:inline">PRIME </span>
            <span className="text-[#FFD700] font-semibold block sm:inline">Command Center</span>
          </h2>
        );
      case 'radar':
        return (
          <h2 className="text-sm sm:text-base md:text-xl font-light tracking-tight text-white leading-tight">
            PRIME <span className="text-[#FFD700] font-semibold">Revenue Radar</span>
          </h2>
        );
      case 'inbox':
        return (
          <h2 className="text-sm sm:text-base md:text-xl font-light tracking-tight text-white leading-tight">
            PRIME <span className="text-[#FFD700] font-semibold">Executive Inbox</span>
          </h2>
        );
      case 'approvals':
        return (
          <h2 className="text-sm sm:text-base md:text-xl font-light tracking-tight text-white leading-tight">
            PRIME <span className="text-emerald-400 font-semibold">AI Approvals Log & Safety Sentry</span>
          </h2>
        );
      case 'plans':
        return (
          <h2 className="text-sm sm:text-base md:text-xl font-light tracking-tight text-white leading-tight">
            PRIME <span className="text-[#FFD700] font-semibold">SaaS Plans & Billing</span>
          </h2>
        );
      case 'white-label':
        return (
          <h2 className="text-sm sm:text-base md:text-xl font-light tracking-tight text-white leading-tight">
            PRIME <span className="text-[#FFD700] font-semibold">Agency White-Label &amp; Reseller Portal</span>
          </h2>
        );
      case 'admin':
        return (
          <h2 className="text-sm sm:text-base md:text-xl font-light tracking-tight text-white leading-tight">
            PRIME <span className="text-emerald-400 font-semibold">Super Admin</span>
          </h2>
        );
      case 'closer':
        return (
          <h2 className="text-sm sm:text-base md:text-xl font-light tracking-tight text-white leading-tight">
            PRIME <span className="text-[#FFD700] font-semibold">Closer AI</span>
          </h2>
        );
      case 'hiring':
        return (
          <h2 className="text-sm sm:text-base md:text-xl font-light tracking-tight text-white leading-tight">
            PRIME <span className="text-[#FFD700] font-semibold">Hiring AI</span>
          </h2>
        );
      case 'meetings':
        return (
          <h2 className="text-sm sm:text-base md:text-xl font-light tracking-tight text-white leading-tight">
            PRIME <span className="text-[#FFD700] font-semibold">Meeting AI</span>
          </h2>
        );
      case 'growth':
        return (
          <h2 className="text-sm sm:text-base md:text-xl font-light tracking-tight text-white leading-tight">
            PRIME <span className="text-emerald-400 font-semibold">Growth Lab</span>
          </h2>
        );
      case 'strategy':
        return (
          <h2 className="text-sm sm:text-base md:text-xl font-light tracking-tight text-white leading-tight">
            PRIME <span className="text-[#FFD700] font-semibold">Strategy Board</span>
          </h2>
        );
      case 'board-pack':
        return (
          <h2 className="text-sm sm:text-base md:text-xl font-light tracking-tight text-white leading-tight">
            PRIME <span className="text-[#FFD700] font-semibold">Board Pack</span>
          </h2>
        );
      case 'docs':
        return (
          <h2 className="text-sm sm:text-base md:text-xl font-light tracking-tight text-white leading-tight">
            PRIME <span className="text-[#FFD700] font-semibold">Documents Intelligence</span>
          </h2>
        );
      case 'twin':
        return (
          <h2 className="text-sm sm:text-base md:text-xl font-light tracking-tight text-white leading-tight">
            PRIME <span className="text-[#FFD700] font-semibold">CEO Digital Twin 3.0</span>
          </h2>
        );
      case 'brain':
        return (
          <h2 className="text-sm sm:text-base md:text-xl font-light tracking-tight text-white leading-tight">
            PRIME <span className="text-[#FFD700] font-semibold">Brain</span>
          </h2>
        );
      case 'roi-calculator':
        return (
          <h2 className="text-sm sm:text-base md:text-xl font-light tracking-tight text-white leading-tight">
            PRIME <span className="text-[#FFD700] font-semibold">ROI Calculator</span>
          </h2>
        );
      case 'ad-spend':
        return (
          <h2 className="text-sm sm:text-base md:text-xl font-light tracking-tight text-white leading-tight">
            PRIME <span className="text-[#FFD700] font-semibold">Ad Spend Optimizer</span>
          </h2>
        );
      case 'cashflow-guard':
        return (
          <h2 className="text-sm sm:text-base md:text-xl font-light tracking-tight text-white leading-tight">
            PRIME <span className="text-[#FFD700] font-semibold">Cash Flow Guard</span>
          </h2>
        );
      case 'feedback':
        return (
          <h2 className="text-sm sm:text-base md:text-xl font-light tracking-tight text-white leading-tight">
            PRIME <span className="text-[#FFD700] font-semibold">Feedback & Roadmap Hub</span>
          </h2>
        );
      default:
        return (
          <div className="flex items-center gap-3 select-none">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#B8860B] shadow-[0_0_20px_rgba(255,215,0,0.15)] flex items-center justify-center text-black">
              <Crown className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-[#FFD700] leading-none">PRIME AI</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 mt-1">Multi-Tenant OS</span>
            </div>
          </div>
        );
    }
  };

  const getViewBreadcrumbLabel = (view: string) => {
    switch (view) {
      case 'radar': return 'Revenue Radar';
      case 'inbox': return 'Executive Inbox';
      case 'brain': return 'Brain 3.0';
      case 'twin': return 'CEO Digital Twin';
      case 'roi-calculator': return 'ROI Calculator';
      case 'plans': return 'SaaS Plans & Billing';
      case 'white-label': return 'Agency White-Label';
      case 'admin': return 'Super Admin';
      case 'closer': return 'Closer AI';
      case 'hiring': return 'Hiring AI';
      case 'meetings': return 'Meeting AI';
      case 'growth': return 'Growth Lab';
      case 'ad-spend': return 'Ad Spend Optimizer';
      case 'cashflow-guard': return 'Cash Flow Guard';
      case 'strategy': return 'Strategy Board';
      case 'board-pack': return 'Board Pack';
      case 'docs': return 'Documents Intel';
      case 'feedback': return 'Feedback & Roadmap';
      default: return view;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#0A0A0A]/95 backdrop-blur-xl">
      <div className="w-full px-4 sm:px-8 h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Side: Permanent Brand Logo */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {/* Permanent Brand Logo: PRIME AI with Command Center written directly below */}
          <div 
            onClick={() => onNavigate(user ? 'dashboard' : 'landing')} 
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0 group"
            title="PRIME AI — Command Center"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#B8860B] shadow-[0_0_20px_rgba(255,215,0,0.25)] flex items-center justify-center text-black group-hover:scale-105 transition-transform shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-white group-hover:text-[#FFD700] transition-colors leading-none">
                  PRIME <span className="text-[#FFD700]">AI</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-mono font-bold bg-[#FFD700]/15 text-[#FFD700] rounded border border-[#FFD700]/30">
                  COO
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#FFD700] group-hover:text-amber-300 transition-colors mt-0.5">
                Command Center
              </span>
            </div>
          </div>

          {/* Active View Breadcrumb when in sub-modules */}
          {user && currentView !== 'dashboard' && currentView !== 'landing' && (
            <div className="hidden xl:flex items-center gap-2 text-xs font-medium text-white/40 shrink-0">
              <span>/</span>
              <span className="text-white/90 font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                {getViewBreadcrumbLabel(currentView)}
              </span>
            </div>
          )}

          {/* Multi-Tenant Workspace Selector or Demo Sandbox Badge */}
          {user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all cursor-pointer"
                title="Current Tenant Workspace"
              >
                <Building2 className="w-3.5 h-3.5 text-[#FFD700]" />
                <span className="truncate max-w-[140px]">{companyName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-white/40" />
              </button>

              {companyDropdownOpen && (
                <div 
                  className="absolute left-0 top-full mt-2 w-64 rounded-2xl bg-[#161616] border border-white/15 p-2 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 animate-fade-in"
                  onMouseLeave={() => setCompanyDropdownOpen(false)}
                >
                  <div className="px-3 py-2 text-[10px] uppercase tracking-wider font-mono text-white/40 border-b border-white/10 flex items-center justify-between">
                    <span>Isolated Tenants</span>
                    <span className="text-[#FFD700] font-bold">company_id</span>
                  </div>

                  <div className="max-h-60 overflow-y-auto py-1 space-y-1">
                    {companiesList.map((c) => {
                      const isCurrent = c.id === companyId;
                      return (
                        <button
                          key={c.id}
                          onClick={() => {
                            switchCompany(c.id);
                            setCompanyDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isCurrent 
                              ? 'bg-[#FFD700]/15 text-[#FFD700] font-bold' 
                              : 'text-white/80 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <div className="truncate">
                            <div>{c.name}</div>
                            <div className="text-[10px] font-mono text-white/40">{c.id}</div>
                          </div>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                            {c.plan}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <button
                      onClick={() => {
                        setCompanyDropdownOpen(false);
                        onOpenAuth('signup');
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-[#FFD700]/10 hover:bg-[#FFD700]/20 text-[#FFD700] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create New Company</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : isDemoMode ? (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 text-xs">
              <Building2 className="w-3.5 h-3.5 text-[#FFD700]" />
              <span className="font-semibold text-white">Acme Corp</span>
              <span className="px-1.5 py-0.5 rounded bg-[#FFD700]/20 text-[#FFD700] font-mono font-extrabold text-[10px]">SANDBOX DEMO</span>
            </div>
          ) : null}
        </div>

        {/* Center Nav for Landing */}
        {!user && (
          <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest text-white/50 font-medium">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#roi-calculator" className="hover:text-white transition-colors">ROI Calculator</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>
        )}

        {/* Right CTA / Status Stack */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {user ? (
            <>
              {/* Email Verification Status Pill */}
              {isEmailVerified ? (
                <div 
                  className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold"
                  title="Your work email is verified"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Verified</span>
                </div>
              ) : (
                <button
                  onClick={() => onOpenAuth('verify-email')}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-[11px] font-bold transition-all animate-pulse cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                  title="Click to complete email verification"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  <span>Verify Email</span>
                </button>
              )}

              {/* iOS / Android App Install Button */}
              <button
                onClick={() => setMobileInstallModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 border border-white/15 text-white text-xs font-bold transition-all cursor-pointer shadow-sm hover:border-[#FFD700]/50 group"
                title="Run on Apple iOS & Android"
              >
                <div className="flex items-center -space-x-1">
                  <Apple className="w-3.5 h-3.5 text-white group-hover:text-[#FFD700] transition-colors" />
                  <Smartphone className="w-3.5 h-3.5 text-[#3DDC84]" />
                </div>
                <span>Mobile App</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">iOS/APK</span>
              </button>

              {/* Plans Navigation Button */}
              <button
                onClick={() => onNavigate('plans')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  currentView === 'plans'
                    ? 'bg-[#FFD700] text-black border-[#FFD700]'
                    : 'bg-[#FFD700]/10 hover:bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30'
                }`}
                title={isPro ? `Active ${subscription?.planTier || company?.plan || 'Pro'} Plan (${daysRemaining} days remaining)` : `Free Trial (${trialDaysRemaining} days remaining)`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Plans</span>
                <span className="hidden md:inline text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono font-bold">
                  {subscription?.planTier || company?.plan || 'Pro'} ({daysRemaining > 0 ? `${daysRemaining}d` : 'Expired'})
                </span>
                <span className="md:hidden text-[10px] font-mono font-bold">
                  {daysRemaining > 0 ? `${daysRemaining}d` : 'Plan'}
                </span>
              </button>

              {/* Super Admin Dashboard Button (Master Owner Only) */}
              {isAdmin && (
                <button
                  onClick={() => onNavigate('admin')}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    currentView === 'admin'
                      ? 'bg-emerald-500 text-black border-emerald-500'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}
                  title="Super Admin Workspace Telemetry"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              )}

              {/* Quick Command Palette Button */}
              {onOpenCommandPalette && (
                <button
                  onClick={onOpenCommandPalette}
                  className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs transition-all cursor-pointer font-mono"
                  title="Search & Quick Actions (Cmd + K)"
                >
                  <Search className="w-3.5 h-3.5 text-[#FFD700]" />
                  <span>Search</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-white/50 border border-white/10">⌘K</kbd>
                </button>
              )}

              {/* Voice War Room HUD Button */}
              {onOpenVoiceHUD && (
                <button
                  onClick={onOpenVoiceHUD}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFD700]/10 hover:bg-[#FFD700]/20 border border-[#FFD700]/30 text-[#FFD700] text-xs font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(255,215,0,0.15)]"
                  title="Open Hands-Free Voice War Room"
                >
                  <Mic className="w-3.5 h-3.5 animate-pulse" />
                  <span>Voice HUD</span>
                </button>
              )}

              {/* Daily 9:00 AM Briefing Button */}
              {onOpenDailyBriefing && (
                <button
                  onClick={onOpenDailyBriefing}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FFD700]/15 to-amber-500/20 hover:from-[#FFD700]/30 hover:to-amber-500/30 border border-[#FFD700]/40 text-[#FFD700] text-xs font-extrabold transition-all cursor-pointer shadow-[0_0_15px_rgba(255,215,0,0.2)]"
                  title="Open Daily 9:00 AM Executive Briefing"
                >
                  <Crown className="w-3.5 h-3.5 text-[#FFD700]" />
                  <span>9:00 AM Briefing</span>
                </button>
              )}

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onNavigate('feedback')}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    currentView === 'feedback'
                      ? 'bg-[#FFD700] text-black shadow-sm'
                      : 'text-white/40 hover:text-[#FFD700] hover:bg-white/5'
                  }`}
                  title="Feedback & Roadmap Hub"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                </button>

                <button
                  onClick={onOpenSettings}
                  className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  title="Settings & Workspace"
                >
                  <Settings className="w-4 h-4" />
                </button>

                <button
                  onClick={async () => {
                    await signOut();
                    onNavigate('landing');
                  }}
                  className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                  title="Sign Out (Log Out)"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : isDemoMode ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Voice War Room HUD Button in demo */}
              {onOpenVoiceHUD && (
                <button
                  onClick={onOpenVoiceHUD}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFD700]/10 hover:bg-[#FFD700]/20 border border-[#FFD700]/30 text-[#FFD700] text-xs font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(255,215,0,0.15)]"
                  title="Test-Drive Hands-Free Voice War Room"
                >
                  <Mic className="w-3.5 h-3.5 animate-pulse" />
                  <span>Voice HUD</span>
                </button>
              )}

              {/* Plans Navigation Button */}
              <button
                onClick={() => onNavigate('plans')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer bg-[#FFD700]/10 hover:bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Plans</span>
              </button>

              <button
                onClick={() => onOpenAuth('signup')}
                className="px-3.5 py-2 bg-gradient-to-r from-[#FFD700] via-amber-300 to-[#FFC700] text-black text-xs font-black rounded-xl hover:brightness-110 transition-all cursor-pointer shadow-[0_0_20px_rgba(255,215,0,0.3)] flex items-center gap-1.5 active:scale-95"
              >
                <Crown className="w-3.5 h-3.5 text-black" />
                <span>Claim 14 Days Free</span>
              </button>

              {onExitDemo && (
                <button
                  onClick={onExitDemo}
                  className="px-2.5 py-1.5 text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
                  title="Exit Sandbox & Return to Home"
                >
                  Exit Demo
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenAuth('login')}
                className="text-xs uppercase tracking-widest font-semibold text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-4 py-2 bg-gradient-to-r from-[#FFD700] via-amber-300 to-[#FFC700] text-black text-xs font-black rounded-xl hover:brightness-110 transition-all cursor-pointer shadow-[0_0_20px_rgba(255,215,0,0.3)] flex items-center gap-1.5 active:scale-95"
              >
                <Crown className="w-3.5 h-3.5 text-black" />
                <span>Launch Live Workspace →</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cross-Platform iOS & Android Mobile Modal */}
      <MobileInstallModal
        isOpen={mobileInstallModalOpen}
        onClose={() => setMobileInstallModalOpen(false)}
      />
    </header>
  );
};
