import React from 'react';
import { 
  LayoutDashboard, 
  Inbox, 
  FileText, 
  Zap, 
  Settings, 
  Shield, 
  Crown,
  Radar,
  Mic,
  Users,
  Video,
  TrendingUp,
  Target,
  Briefcase,
  CreditCard,
  ShieldCheck,
  Building2,
  Brain,
  Lightbulb,
  LogOut,
  Sparkles,
  Calculator,
  MessageSquarePlus,
  CheckSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  pendingEmailsCount: number;
  onOpenSettings: () => void;
  isDemoMode?: boolean;
  onOpenAuth?: (mode: 'login' | 'signup' | 'verify-email' | 'forgot-password') => void;
  onExitDemo?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  pendingEmailsCount,
  onOpenSettings,
  isDemoMode = false,
  onOpenAuth,
  onExitDemo,
}) => {
  const { 
    profile, 
    user, 
    isPro, 
    isTrialActive,
    isTrialExpired,
    trialDaysRemaining, 
    daysRemaining,
    aiActionsRemaining, 
    company, 
    companyName, 
    companyId,
    isAdmin,
    isFeatureLocked,
    openUpgradeModal,
    signOut
  } = useAuth();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Command Center',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'radar',
      label: 'Revenue Radar',
      icon: Radar,
      badge: 'LIVE',
      badgeClass: 'bg-rose-500 text-white animate-pulse',
    },
    {
      id: 'inbox',
      label: 'Executive Inbox',
      icon: Inbox,
      badge: pendingEmailsCount > 0 ? pendingEmailsCount : null,
      badgeClass: 'bg-[#FFD700] text-black',
    },
    {
      id: 'approvals',
      label: 'Approvals',
      icon: CheckSquare,
      badge: 'LOG',
      badgeClass: 'bg-emerald-400 text-black font-extrabold',
    },
    {
      id: 'brain',
      label: 'Brain',
      icon: Brain,
      badge: '3.0',
      badgeClass: 'bg-[#FFD700] text-black font-extrabold',
    },
    {
      id: 'twin',
      label: 'CEO Digital Twin',
      icon: Sparkles,
      badge: 'CLONE',
      badgeClass: 'bg-gradient-to-r from-[#FFD700] to-amber-500 text-black font-extrabold shadow-sm',
    },
    {
      id: 'roi-calculator',
      label: 'ROI Calculator',
      icon: Calculator,
      badge: 'D3.JS',
      badgeClass: 'bg-gradient-to-r from-[#FFD700] to-amber-500 text-black font-extrabold shadow-sm',
    },
    {
      id: 'plans',
      label: 'Plans & Pricing',
      icon: CreditCard,
      badge: 'SAAS',
      badgeClass: 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30',
    },
    {
      id: 'white-label',
      label: 'Agency White-Label',
      icon: Building2,
      badge: '$40K/MO',
      badgeClass: 'bg-gradient-to-r from-[#FFD700] to-amber-400 text-black font-extrabold shadow-sm',
    },
    {
      id: 'admin',
      label: 'Super Admin',
      icon: ShieldCheck,
      badge: 'GLOBAL',
      badgeClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
    {
      id: 'closer',
      label: 'PRIME Closer AI',
      icon: Mic,
      badge: 'NEW',
      badgeClass: 'bg-[#FFD700] text-black font-extrabold',
    },
    {
      id: 'hiring',
      label: 'PRIME Hiring AI',
      icon: Users,
      badge: 'NEW',
      badgeClass: 'bg-[#FFD700] text-black font-extrabold',
    },
    {
      id: 'meetings',
      label: 'PRIME Meeting AI',
      icon: Video,
      badge: 'NEW',
      badgeClass: 'bg-[#FFD700] text-black font-extrabold',
    },
    {
      id: 'growth',
      label: 'PRIME Growth Lab',
      icon: TrendingUp,
      badge: 'NEW',
      badgeClass: 'bg-emerald-400 text-black font-extrabold',
    },
    {
      id: 'ad-spend',
      label: 'Ad Spend Optimizer',
      icon: Target,
      badge: 'SAVE $',
      badgeClass: 'bg-emerald-400 text-black font-extrabold',
    },
    {
      id: 'cashflow-guard',
      label: 'Cash Flow & Invoices',
      icon: ShieldCheck,
      badge: 'RECOVER',
      badgeClass: 'bg-blue-400 text-black font-extrabold',
    },
    {
      id: 'strategy',
      label: 'PRIME Strategy Board',
      icon: Target,
      badge: null,
    },
    {
      id: 'board-pack',
      label: 'PRIME Board Pack',
      icon: Briefcase,
      badge: null,
    },
    {
      id: 'docs',
      label: 'Documents Intel',
      icon: FileText,
      badge: null,
    }
  ];

  const userInitials = profile?.displayName
    ? profile.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : (user?.email ? user.email.slice(0, 2).toUpperCase() : 'JD');

  return (
    <aside className="w-72 border-r border-white/5 bg-[#0D0D0D] flex flex-col justify-between shrink-0 hidden md:flex min-h-[calc(100vh-4.5rem)]">
      <div>
        {/* Brand Header */}
        <div 
          onClick={() => onNavigate('dashboard')}
          className="p-5 border-b border-white/5 cursor-pointer group hover:bg-white/[0.02] transition-colors"
          title="PRIME AI — Command Center"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.15)] text-black shrink-0 group-hover:scale-105 transition-transform">
              <Crown className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-[#FFD700] leading-none">PRIME AI</span>
              <span className="text-[10px] uppercase font-bold tracking-[0.16em] text-white/70 group-hover:text-[#FFD700] transition-colors mt-1">
                Command Center
              </span>
            </div>
          </div>
        </div>

        {/* Active Company Badge */}
        <div className="mx-4 mt-4 p-2.5 rounded-xl bg-[#141414] border border-white/10 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700] shrink-0">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate">{companyName}</div>
            <div className="text-[9px] font-mono text-white/40 truncate">Tenant: {companyId}</div>
          </div>
        </div>
        
        {/* Navigation Items */}
        <nav className="px-4 py-3 space-y-1 max-h-[calc(100vh-22rem)] overflow-y-auto">
          {navItems
            .filter((item) => {
              if (item.id === 'admin') {
                return isAdmin;
              }
              return true;
            })
            .map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const locked = isFeatureLocked(item.id);

            return (
              <div
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] font-medium'
                    : 'text-white/50 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFD700]' : locked ? 'text-white/30' : 'text-white/50'}`} />
                <span className={`text-xs font-semibold ${locked ? 'text-white/40' : ''}`}>{item.label}</span>
                {locked ? (
                  <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-mono font-bold border border-red-500/30">
                    🔒 LOCK
                  </span>
                ) : (
                  item.badge !== null && (
                    <span className={`ml-auto text-[9px] px-2 py-0.5 rounded-full font-bold ${item.badgeClass || 'bg-[#FFD700] text-black'}`}>
                      {item.badge}
                    </span>
                  )
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Subscription Telemetry */}
      <div className="p-5 border-t border-white/5 bg-[#080808]">
        {/* Trial, Demo or Pro Badge */}
        {isDemoMode ? (
          <div 
            onClick={() => onOpenAuth ? onOpenAuth('signup') : null}
            className="mb-3 p-3 rounded-xl bg-gradient-to-br from-amber-500/15 via-[#141414] to-zinc-950 border border-[#FFD700]/40 hover:border-[#FFD700] transition-all cursor-pointer group text-xs shadow-[0_0_15px_rgba(255,215,0,0.1)]"
          >
            <div className="flex items-center justify-between font-bold text-white mb-1">
              <span className="flex items-center gap-1.5 text-[#FFD700]">
                <Crown className="w-3.5 h-3.5" />
                <span>Acme Corp Demo</span>
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#FFD700] text-black font-extrabold">
                SANDBOX
              </span>
            </div>
            <p className="text-[11px] text-white/60 leading-tight mb-2">
              Ready to connect your own company?
            </p>
            <div className="flex items-center justify-between pt-1.5 border-t border-white/10 text-[10px]">
              <span className="text-[#FFD700] font-bold">14-Day Free Trial</span>
              <span className="text-white font-extrabold group-hover:text-[#FFD700] flex items-center gap-0.5">
                Claim Now →
              </span>
            </div>
          </div>
        ) : isPro ? (
          <div 
            onClick={() => onNavigate('plans')}
            className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-between cursor-pointer hover:bg-emerald-500/20 transition-all"
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{company?.plan || 'Pro'} ({daysRemaining}d left)</span>
            </span>
            <span className="text-[10px] text-white/50 font-mono font-normal">Manage</span>
          </div>
        ) : isTrialExpired ? (
          <div 
            onClick={() => openUpgradeModal('Pro')}
            className="mb-3 p-3 rounded-xl bg-gradient-to-r from-red-500/15 via-zinc-900 to-amber-500/15 border border-red-500/40 hover:border-[#FFD700] transition-all cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-red-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                14-Day Trial Expired
              </span>
              <span className="text-[#FFD700] font-mono text-[10px]">Upgrade</span>
            </div>
            <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-white/5 text-[10px]">
              <span className="text-white/50">Unlock Brain &amp; Radar</span>
              <span className="text-[#FFD700] font-bold group-hover:underline">Pro with Stripe →</span>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => openUpgradeModal('Pro')}
            className="mb-3 p-2.5 rounded-xl bg-[#141414] border border-[#FFD700]/20 hover:border-[#FFD700]/50 transition-all cursor-pointer group text-xs"
          >
            <div className="flex items-center justify-between font-bold text-white">
              <span className="flex items-center gap-1.5 text-[#FFD700]">
                <span>⏳</span>
                <span>{trialDaysRemaining}d Trial Left</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FFD700]/10 text-[#FFD700]">
                No CC
              </span>
            </div>
            <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-white/5 text-[10px]">
              <span className="text-white/50">Upgrade anytime</span>
              <span className="text-[#FFD700] font-bold group-hover:underline">Upgrade →</span>
            </div>
          </div>
        )}

        {/* Discreet Feedback & Roadmap Button */}
        <button
          onClick={() => onNavigate('feedback')}
          className={`w-full mb-3 flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
            currentView === 'feedback'
              ? 'bg-[#FFD700] text-black border-[#FFD700] shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border-white/5 hover:border-white/15'
          }`}
          title="Product Feedback, Feature Requests & Roadmap"
        >
          <span className="flex items-center gap-2">
            <MessageSquarePlus className={`w-3.5 h-3.5 ${currentView === 'feedback' ? 'text-black' : 'text-[#FFD700]'}`} />
            <span>Feedback & Roadmap</span>
          </span>
          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${currentView === 'feedback' ? 'bg-black/20 text-black' : 'bg-[#FFD700]/15 text-[#FFD700]'}`}>
            Hub
          </span>
        </button>

        <div 
          onClick={() => {
            if (isDemoMode && onOpenAuth) {
              onOpenAuth('signup');
            } else {
              onOpenSettings();
            }
          }}
          className="flex items-center justify-between gap-3 mb-3 cursor-pointer group"
          title={isDemoMode ? "Claim your real company workspace" : "Open Workspace Settings"}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500/30 to-amber-700/30 border border-[#FFD700]/30 flex items-center justify-center text-xs font-bold text-[#FFD700] shrink-0">
              {isDemoMode ? 'AC' : userInitials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white group-hover:text-[#FFD700] transition-colors truncate max-w-[120px]">
                {isDemoMode ? 'Executive Guest' : (profile?.displayName || 'Executive Leader')}
              </span>
              <span className="text-[10px] text-white/40 truncate">
                {isDemoMode ? 'Acme Corp (Demo)' : companyName}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {isDemoMode ? (
              <button 
                onClick={(e) => { e.stopPropagation(); onExitDemo && onExitDemo(); }}
                className="px-2 py-1 rounded-md bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-colors cursor-pointer text-[10px] font-mono"
                title="Exit Demo"
              >
                Exit
              </button>
            ) : (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); onOpenSettings(); }}
                  className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  title="Workspace Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button 
                  onClick={async (e) => {
                    e.stopPropagation();
                    await signOut();
                    onNavigate('landing');
                  }}
                  className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                  title="Sign Out (Log Out)"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Multi-Tenant Security Telemetry */}
        <div className="flex items-center justify-between text-[9px] text-white/40 pt-2 border-t border-white/5 uppercase tracking-widest font-mono">
          <span>company_id Isolated</span>
          <span className="flex items-center gap-1 text-emerald-400 font-mono">
            <Shield className="w-2.5 h-2.5" /> Supabase
          </span>
        </div>
      </div>
    </aside>
  );
};
