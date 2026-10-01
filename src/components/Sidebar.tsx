import React, { useState } from 'react';
import { 
  Radar, 
  ShieldCheck, 
  CreditCard, 
  Settings, 
  Crown, 
  Building2, 
  LogOut, 
  ChevronDown, 
  ChevronRight,
  Shield,
  FileText,
  Inbox,
  Brain,
  Sparkles,
  Users,
  Video,
  Mic,
  Target,
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  Activity,
  Layers
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
    company, 
    companyName, 
    companyId,
    isAdmin,
    isFeatureLocked,
    openUpgradeModal,
    signOut
  } = useAuth();

  // Core Hero Features - Clean, Razor-Sharp, Zero Rush for CEOs
  const primaryNavItems = [
    {
      id: 'radar',
      label: 'Revenue Radar',
      icon: Radar,
      badge: 'LIVE SENTRY',
      badgeClass: 'bg-rose-500 text-white animate-pulse font-extrabold shadow-sm',
    },
    {
      id: 'approvals',
      label: 'AI Approvals & Audit',
      icon: ShieldCheck,
      badge: pendingEmailsCount > 0 ? `${pendingEmailsCount} PENDING` : 'ACTIVE',
      badgeClass: pendingEmailsCount > 0 ? 'bg-amber-400 text-black font-black' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono',
    },
    {
      id: 'plans',
      label: 'Plan & Billing',
      icon: CreditCard,
      badge: isPro ? 'PRO' : 'PILOT',
      badgeClass: 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30 font-bold',
    },
    {
      id: 'settings',
      label: 'Workspace Settings',
      icon: Settings,
      badge: null,
      badgeClass: '',
    },
    ...(isAdmin ? [{
      id: 'admin',
      label: 'Super Admin',
      icon: Crown,
      badge: 'HQ',
      badgeClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    }] : [])
  ];

  // Secondary Power Modules (Safely tucked under an optional collapsible)
  const secondaryNavItems = [
    { id: 'inbox', label: 'Executive Inbox Triage', icon: Inbox },
    { id: 'docs', label: 'Contract Risk Audit', icon: FileText },
    { id: 'brain', label: 'Brain AI Copilot', icon: Brain },
    { id: 'twin', label: 'CEO Digital Twin 3.0', icon: Sparkles },
    { id: 'closer', label: 'PRIME Closer AI (Sales)', icon: Mic },
    { id: 'hiring', label: 'PRIME Hiring AI', icon: Users },
    { id: 'meetings', label: 'PRIME Meeting AI', icon: Video },
    { id: 'strategy', label: 'Strategy Board', icon: TrendingUp },
    { id: 'board-pack', label: 'Board Pack Generator', icon: FileText },
    { id: 'cashflow-guard', label: 'Cash Flow Guard', icon: DollarSign },
    { id: 'ad-spend', label: 'Ad Spend Optimizer', icon: TrendingUp },
    { id: 'roi-calculator', label: 'ROI Calculator', icon: Activity },
  ];

  const isSecondaryActive = secondaryNavItems.some(item => item.id === currentView);
  const [showAddons, setShowAddons] = useState(false);
  const isAddonsOpen = showAddons || isSecondaryActive;

  const userInitials = profile?.displayName
    ? profile.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : (user?.email ? user.email.slice(0, 2).toUpperCase() : 'JD');

  return (
    <aside className="w-72 border-r border-white/5 bg-[#0D0D0D] flex flex-col justify-between shrink-0 hidden md:flex min-h-[calc(100vh-4.5rem)]">
      <div>
        {/* Brand Header - 1-Click to Revenue Radar */}
        <div 
          onClick={() => onNavigate('radar')}
          className="p-5 border-b border-white/5 cursor-pointer group hover:bg-white/[0.02] transition-colors"
          title="PRIME AI — Revenue Radar Command"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.15)] text-black shrink-0 group-hover:scale-105 transition-transform">
              <Crown className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-[#FFD700] leading-none">PRIME AI</span>
              <span className="text-[10px] uppercase font-bold tracking-[0.16em] text-white/70 group-hover:text-[#FFD700] transition-colors mt-1">
                Revenue Radar
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
            <div className="text-[9px] font-mono text-white/40 truncate">Tenant: {companyId.slice(0, 14)}</div>
          </div>
        </div>
        
        {/* Navigation Items (Single-Feature Hero Focus) */}
        <nav className="px-4 py-3 space-y-1.5">
          
          {/* Primary 4-5 Essential Links */}
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const locked = isFeatureLocked(item.id);

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (item.id === 'settings') {
                    onOpenSettings();
                  } else {
                    onNavigate(item.id);
                  }
                }}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FFD700]/15 border border-[#FFD700]/30 text-[#FFD700] font-bold shadow-[0_0_15px_rgba(255,215,0,0.1)]'
                    : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFD700]' : locked ? 'text-zinc-600' : 'text-zinc-400'}`} />
                <span className="text-xs font-semibold">{item.label}</span>
                {item.badge !== null && (
                  <span className={`ml-auto text-[9px] px-2 py-0.5 rounded-full font-bold ${item.badgeClass}`}>
                    {item.badge}
                  </span>
                )}
              </div>
            );
          })}

          {/* Collapsible Secondary Power Tools (Zero Rush, Keeps Main UI Pristine) */}
          <div className="pt-3 border-t border-white/5 mt-3">
            <button
              type="button"
              onClick={() => setShowAddons(!showAddons)}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold transition-all cursor-pointer rounded-xl border ${
                isAddonsOpen 
                  ? 'bg-white/10 text-white border-white/15 shadow-sm' 
                  : 'bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/5 border-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-[#FFD700]" />
                <span>Other Features (Dropdown)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 font-mono text-zinc-400 font-bold">
                  {secondaryNavItems.length}
                </span>
                {isAddonsOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-white/70" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                )}
              </div>
            </button>

            {isAddonsOpen && (
              <div className="space-y-1 mt-2 pl-1 animate-in fade-in duration-150 max-h-72 overflow-y-auto pr-1">
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer text-left ${
                        isActive
                          ? 'bg-[#FFD700]/15 text-[#FFD700] font-bold border border-[#FFD700]/30'
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </nav>
      </div>

      {/* Footer Profile & Pilot Telemetry */}
      <div className="p-5 border-t border-white/5 bg-[#080808]">
        {/* Trial or Pro Badge */}
        {isDemoMode ? (
          <div 
            onClick={() => onOpenAuth ? onOpenAuth('signup') : null}
            className="mb-3 p-3 rounded-xl bg-gradient-to-br from-amber-500/15 via-[#141414] to-zinc-950 border border-[#FFD700]/40 hover:border-[#FFD700] transition-all cursor-pointer group text-xs shadow-[0_0_15px_rgba(255,215,0,0.1)]"
          >
            <div className="flex items-center justify-between font-bold text-white mb-1">
              <span className="flex items-center gap-1.5 text-[#FFD700]">
                <Crown className="w-3.5 h-3.5" />
                <span>Apex Global Pilot</span>
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-extrabold border border-emerald-500/30">
                LIVE PILOT
              </span>
            </div>
            <p className="text-[11px] text-white/60 leading-tight mb-2">
              Ready to connect your company domain &amp; team?
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
              <span>{company?.plan || 'Enterprise Pro'}</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">ACTIVE</span>
          </div>
        ) : (
          <div 
            onClick={() => openUpgradeModal('Pro')}
            className="mb-3 p-2.5 rounded-xl bg-[#141414] border border-[#FFD700]/20 hover:border-[#FFD700]/50 transition-all cursor-pointer group text-xs"
          >
            <div className="flex items-center justify-between font-bold text-white mb-1">
              <span className="flex items-center gap-1.5 text-[#FFD700]">
                <Crown className="w-3.5 h-3.5" />
                <span>14-Day Free Pilot</span>
              </span>
              <span className="text-[9px] font-mono text-[#FFD700]">Upgrade</span>
            </div>
            <p className="text-[10px] text-white/40">Full Revenue Radar Sentry Active</p>
          </div>
        )}

        {/* User Profile Card */}
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
              {isDemoMode ? 'EP' : userInitials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white group-hover:text-[#FFD700] transition-colors truncate max-w-[120px]">
                {isDemoMode ? 'Executive Pilot' : (profile?.displayName || 'Executive Leader')}
              </span>
              <span className="text-[10px] text-white/40 truncate">
                {isDemoMode ? 'Apex Global Enterprise' : companyName}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {isDemoMode ? (
              <button 
                onClick={(e) => { e.stopPropagation(); onExitDemo && onExitDemo(); }}
                className="px-2.5 py-1 rounded-lg bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors cursor-pointer text-[10px] font-mono"
                title="Exit Tour & Return Home"
              >
                Exit Tour
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
          <span>Tenant Isolated</span>
          <span className="flex items-center gap-1 text-emerald-400 font-mono">
            <Shield className="w-2.5 h-2.5" /> SOC-2 Ready
          </span>
        </div>
      </div>
    </aside>
  );
};
