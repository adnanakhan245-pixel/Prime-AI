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
  LayoutDashboard,
  Radar,
  Inbox,
  Video,
  FileText,
  Brain,
  TrendingUp,
  DollarSign,
  Users
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
  onEnterDemo?: () => void;
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
  onEnterDemo,
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
  const [featuresDropdownOpen, setFeaturesDropdownOpen] = useState(false);
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
            PRIME <span className="text-[#FFD700] font-semibold">AI Decision Audit Logs & Human Governance</span>
          </h2>
        );
      case 'plans':
        return (
          <h2 className="text-sm sm:text-base md:text-xl font-light tracking-tight text-white leading-tight">
            PRIME <span className="text-[#FFD700] font-semibold">SaaS Plans & Billing</span>
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
      case 'admin': return 'Super Admin';
      case 'approvals': return 'AI Audit & Approvals';
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
      <div className="w-full px-4 sm:px-8 h-20 flex items-center justify-between gap-3">
        {/* Left Side: Brand Logo: PRIME AI */}
        <div className="flex items-center gap-3 min-w-0 shrink-0">
          <div 
            onClick={() => onNavigate(user ? 'radar' : 'landing')} 
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0 group"
            title="PRIME AI — Revenue Radar"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#B8860B] shadow-[0_0_20px_rgba(255,215,0,0.25)] flex items-center justify-center text-black group-hover:scale-105 transition-transform shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-[#FFD700] transition-colors leading-none whitespace-nowrap">
                PRIME <span className="text-[#FFD700]">AI</span>
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
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-[#FFD700]/30 text-xs">
              <Building2 className="w-3.5 h-3.5 text-[#FFD700]" />
              <span className="font-semibold text-white">Apex Global Enterprise</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-extrabold text-[10px] border border-emerald-500/30">LIVE PILOT</span>
            </div>
          ) : null}

          {/* All Features Dropdown Menu - Everything Cleanly Organized Under 1 Dropdown */}
          {(user || isDemoMode) && (
            <div className="relative">
              <button
                onClick={() => setFeaturesDropdownOpen(!featuresDropdownOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  featuresDropdownOpen 
                    ? 'bg-[#FFD700] text-black border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.3)]' 
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                }`}
                title="C-Suite Autonomous AI Tools (12 Live Working Features)"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
                <span className="hidden sm:inline">Executive AI Suite</span>
                <span className="px-1.5 py-0.2 rounded-full bg-[#FFD700]/20 text-[#FFD700] font-mono text-[9px] font-extrabold border border-[#FFD700]/30">
                  12 Active
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-white/60 transition-transform duration-200 ${featuresDropdownOpen ? 'rotate-180 text-black' : ''}`} />
              </button>

              {featuresDropdownOpen && (
                <div 
                  className="absolute left-0 sm:left-auto top-full mt-2 w-80 sm:w-96 rounded-2xl bg-[#141414] border border-white/15 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-50 animate-fade-in max-h-[80vh] overflow-y-auto"
                  onMouseLeave={() => setFeaturesDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-white/50 font-bold">
                      Autonomous C-Suite Modules
                    </span>
                    <span className="text-[10px] font-mono text-[#FFD700] font-bold bg-[#FFD700]/10 px-2 py-0.5 rounded-full border border-[#FFD700]/20">
                      1 Dropdown • Zero Rush
                    </span>
                  </div>

                  {/* 1. Primary Flagship Focus */}
                  <div className="mb-3">
                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider px-2 py-1 font-bold">
                      Flagship CEO Sentry (Active)
                    </div>
                    <button
                      onClick={() => {
                        onNavigate('radar');
                        setFeaturesDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left cursor-pointer ${
                        currentView === 'radar' || currentView === 'dashboard'
                          ? 'bg-[#FFD700]/15 text-[#FFD700] font-bold border border-[#FFD700]/30'
                          : 'hover:bg-white/5 text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                          <Radar className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Revenue Radar &amp; Churn Sentry</div>
                          <div className="text-[10px] text-white/50">Deal risk, churn prevention, ARR telemetry</div>
                        </div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500 text-white font-mono font-extrabold animate-pulse">
                        LIVE
                      </span>
                    </button>
                  </div>

                  {/* 2. Executive Operations */}
                  <div className="mb-3">
                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider px-2 py-1 font-bold">
                      Executive Operations
                    </div>
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          onNavigate('approvals');
                          setFeaturesDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 p-2 rounded-xl transition-all text-left cursor-pointer ${
                          currentView === 'approvals' ? 'bg-[#FFD700]/15 text-[#FFD700] font-bold' : 'hover:bg-white/5 text-zinc-300'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div className="truncate">
                          <div className="text-xs font-semibold text-white">AI Approvals &amp; Governance Audit</div>
                          <div className="text-[10px] text-zinc-500">Human authorization &amp; 2-min undo safety</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('inbox');
                          setFeaturesDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 p-2 rounded-xl transition-all text-left cursor-pointer ${
                          currentView === 'inbox' ? 'bg-[#FFD700]/15 text-[#FFD700] font-bold' : 'hover:bg-white/5 text-zinc-300'
                        }`}
                      >
                        <Inbox className="w-4 h-4 text-blue-400 shrink-0" />
                        <div className="truncate">
                          <div className="text-xs font-semibold text-white">Executive Inbox Triage</div>
                          <div className="text-[10px] text-zinc-500">Autonomous priority sorting &amp; draft replies</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('docs');
                          setFeaturesDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 p-2 rounded-xl transition-all text-left cursor-pointer ${
                          currentView === 'docs' ? 'bg-[#FFD700]/15 text-[#FFD700] font-bold' : 'hover:bg-white/5 text-zinc-300'
                        }`}
                      >
                        <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                        <div className="truncate">
                          <div className="text-xs font-semibold text-white">Documents Intel &amp; Contracts</div>
                          <div className="text-[10px] text-zinc-500">Contract risk audit &amp; clause extraction</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* 3. Autonomous AI C-Suite Modules */}
                  <div className="mb-3">
                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider px-2 py-1 font-bold">
                      Autonomous C-Suite Intelligence
                    </div>
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          onNavigate('closer');
                          setFeaturesDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 p-2 rounded-xl transition-all text-left cursor-pointer ${
                          currentView === 'closer' ? 'bg-[#FFD700]/15 text-[#FFD700] font-bold' : 'hover:bg-white/5 text-zinc-300'
                        }`}
                      >
                        <Mic className="w-4 h-4 text-rose-400 shrink-0" />
                        <div className="truncate">
                          <div className="text-xs font-semibold text-white">Deal Closer AI</div>
                          <div className="text-[10px] text-zinc-500">Objection handling &amp; high-stakes closing</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('twin');
                          setFeaturesDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 p-2 rounded-xl transition-all text-left cursor-pointer ${
                          currentView === 'twin' ? 'bg-[#FFD700]/15 text-[#FFD700] font-bold' : 'hover:bg-white/5 text-zinc-300'
                        }`}
                      >
                        <Sparkles className="w-4 h-4 text-[#FFD700] shrink-0" />
                        <div className="truncate">
                          <div className="text-xs font-semibold text-white">CEO Digital Twin 3.0</div>
                          <div className="text-[10px] text-zinc-500">Executive voice delegation &amp; decision cloning</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('brain');
                          setFeaturesDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 p-2 rounded-xl transition-all text-left cursor-pointer ${
                          currentView === 'brain' ? 'bg-[#FFD700]/15 text-[#FFD700] font-bold' : 'hover:bg-white/5 text-zinc-300'
                        }`}
                      >
                        <Brain className="w-4 h-4 text-purple-400 shrink-0" />
                        <div className="truncate">
                          <div className="text-xs font-semibold text-white">Brain 3.0 Neural Core</div>
                          <div className="text-[10px] text-zinc-500">Institutional memory &amp; semantic search</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('hiring');
                          setFeaturesDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 p-2 rounded-xl transition-all text-left cursor-pointer ${
                          currentView === 'hiring' ? 'bg-[#FFD700]/15 text-[#FFD700] font-bold' : 'hover:bg-white/5 text-zinc-300'
                        }`}
                      >
                        <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div className="truncate">
                          <div className="text-xs font-semibold text-white">Hiring &amp; Headhunting AI</div>
                          <div className="text-[10px] text-zinc-500">Candidate ranking &amp; scorecard vetting</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('meetings');
                          setFeaturesDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 p-2 rounded-xl transition-all text-left cursor-pointer ${
                          currentView === 'meetings' ? 'bg-[#FFD700]/15 text-[#FFD700] font-bold' : 'hover:bg-white/5 text-zinc-300'
                        }`}
                      >
                        <Video className="w-4 h-4 text-indigo-400 shrink-0" />
                        <div className="truncate">
                          <div className="text-xs font-semibold text-white">Meeting AI &amp; Transcripts</div>
                          <div className="text-[10px] text-zinc-500">Autonomous action item extraction</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* 4. Strategy & Financial Guard */}
                  <div>
                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider px-2 py-1 font-bold">
                      Strategy &amp; Financial Guard
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        onClick={() => {
                          onNavigate('strategy');
                          setFeaturesDropdownOpen(false);
                        }}
                        className="p-2 rounded-lg hover:bg-white/5 text-left text-xs font-medium text-white flex items-center gap-2 cursor-pointer"
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                        <span className="truncate">Strategy Board</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('board-pack');
                          setFeaturesDropdownOpen(false);
                        }}
                        className="p-2 rounded-lg hover:bg-white/5 text-left text-xs font-medium text-white flex items-center gap-2 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span className="truncate">Board Pack</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('cashflow-guard');
                          setFeaturesDropdownOpen(false);
                        }}
                        className="p-2 rounded-lg hover:bg-white/5 text-left text-xs font-medium text-white flex items-center gap-2 cursor-pointer"
                      >
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="truncate">Cash Flow Guard</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('roi-calculator');
                          setFeaturesDropdownOpen(false);
                        }}
                        className="p-2 rounded-lg hover:bg-white/5 text-left text-xs font-medium text-white flex items-center gap-2 cursor-pointer"
                      >
                        <Activity className="w-3.5 h-3.5 text-purple-400" />
                        <span className="truncate">ROI Calculator</span>
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}
        </div>

        {/* Center Nav for Landing - Removed per requirement for single-feature Radar homepage */}

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

              {/* Plans Navigation Button (Hidden on small mobile to give Prime Command Center full breathing room) */}
              <button
                onClick={() => onNavigate('plans')}
                className={`hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  currentView === 'plans'
                    ? 'bg-[#FFD700] text-black border-[#FFD700]'
                    : 'bg-[#FFD700]/10 hover:bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30'
                }`}
                title={isPro ? `Active ${subscription?.planTier || company?.plan || 'Pro'} Plan (${daysRemaining} days remaining)` : `Free Trial (${trialDaysRemaining} days remaining)`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Plans</span>
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

              <div className="flex items-center gap-1.5 shrink-0">
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
                  title="Exit Tour & Return to Home"
                >
                  Exit Tour
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {onEnterDemo && (
                <button
                  onClick={onEnterDemo}
                  className="px-3.5 py-1.5 text-xs font-bold text-[#FFD700] hover:text-black hover:bg-[#FFD700] bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  title="Explore live interactive workspace tour"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Product Tour</span>
                </button>
              )}
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-3.5 py-1.5 bg-gradient-to-r from-[#FFD700] via-amber-300 to-[#FFC700] text-black text-xs font-black rounded-xl hover:brightness-110 transition-all cursor-pointer shadow-[0_0_20px_rgba(255,215,0,0.3)] flex items-center gap-1.5 active:scale-95"
              >
                <Crown className="w-3.5 h-3.5 text-black" />
                <span>Sign Up</span>
              </button>
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer border border-white/10 flex items-center gap-1.5"
                title="Sign in to your registered account"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
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
