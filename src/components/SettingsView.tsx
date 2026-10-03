import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  User, 
  ShieldCheck, 
  Check, 
  CreditCard, 
  Sparkles, 
  Server, 
  Clock, 
  Flame, 
  ArrowRight, 
  Mail, 
  LogOut, 
  AlertTriangle,
  Lock,
  Database,
  Users,
  Download,
  CheckCircle2,
  Sliders,
  Globe,
  Plus,
  Crown,
  ChevronRight,
  Shield,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AIGuidanceDisclaimer } from './AIGuidanceDisclaimer';

interface SettingsViewProps {
  initialTab?: 'general' | 'safety' | 'billing' | 'team' | 'integrations' | 'security';
  onNavigate?: (view: string) => void;
  onOpenAuth?: (mode?: 'login' | 'signup' | 'verify-email') => void;
}

export type SettingsTabId = 'general' | 'safety' | 'billing' | 'team' | 'integrations' | 'security';

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  initialTab = 'general',
  onNavigate,
  onOpenAuth
}) => {
  const { 
    user,
    profile, 
    company,
    isEmailVerified,
    updateCompanyProfile, 
    isPro, 
    trialDaysRemaining, 
    aiActionsRemaining, 
    redirectToCheckout,
    upgradeToPro,
    signOut
  } = useAuth();

  const [activeTab, setActiveTab] = useState<SettingsTabId>(initialTab);
  const [companyName, setCompanyName] = useState(profile?.companyName || company?.name || 'Apex Global Enterprise');
  const [role, setRole] = useState(profile?.role || 'Chief Executive Officer');
  const [displayName, setDisplayName] = useState(profile?.displayName || user?.displayName || 'Executive Leader');
  const [timezone, setTimezone] = useState('America/New_York (EST)');
  const [currency, setCurrency] = useState('USD ($)');
  
  // AI Safety & Governance settings
  const [requireApprovalEmails, setRequireApprovalEmails] = useState(true);
  const [requireApprovalInvoices, setRequireApprovalInvoices] = useState(true);
  const [undoWindowSeconds, setUndoWindowSeconds] = useState(120);
  
  // Team invite state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Executive Member');
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 'tm_1',
      name: profile?.displayName || user?.displayName || 'Executive Leader',
      email: user?.email || 'ceo@company.com',
      role: 'Workspace Owner (CEO)',
      status: 'Active',
      isYou: true
    },
    {
      id: 'tm_2',
      name: 'Sarah Jenkins',
      email: 's.jenkins@enterprise-partners.com',
      role: 'Chief Revenue Officer',
      status: 'Active',
      isYou: false
    }
  ]);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCompanyProfile(companyName, role);
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleInviteTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    
    setTeamMembers(prev => [
      ...prev,
      {
        id: `tm_${Date.now()}`,
        name: inviteEmail.split('@')[0],
        email: inviteEmail.trim(),
        role: inviteRole,
        status: 'Invited (Pending Confirmation)',
        isYou: false
      }
    ]);
    setInviteEmail('');
    setInviteSuccess(true);
    setTimeout(() => setInviteSuccess(false), 3500);
  };

  const handleExportWorkspaceData = () => {
    const dataSnapshot = {
      workspaceId: company?.id || 'comp_current',
      workspaceName: companyName,
      executiveRole: role,
      executiveUser: displayName,
      email: user?.email,
      exportedAt: new Date().toISOString(),
      plan: isPro ? 'PRIME Enterprise Pro' : '14-Day Free Executive Trial',
      governancePolicy: {
        humanApprovalRequiredEmails: requireApprovalEmails,
        humanApprovalRequiredInvoices: requireApprovalInvoices,
        undoWindowSeconds: undoWindowSeconds,
        tenantIsolationEnforced: true
      },
      team: teamMembers
    };

    const blob = new Blob([JSON.stringify(dataSnapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${companyName.toLowerCase().replace(/\s+/g, '_')}_workspace_settings.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const companyId = company?.id || 'comp_workspace_01';

  const settingsTabs = [
    {
      id: 'general' as SettingsTabId,
      name: 'General & Profile',
      description: 'Workspace identity, timezone & currency',
      icon: Building2,
      badge: 'Profile'
    },
    {
      id: 'safety' as SettingsTabId,
      name: 'AI Safety & Policy',
      description: 'Human approval gates & compliance',
      icon: ShieldCheck,
      badge: 'Enforced'
    },
    {
      id: 'billing' as SettingsTabId,
      name: 'Plan & Billing',
      description: 'Current license, trial & upgrades',
      icon: CreditCard,
      badge: isPro ? 'PRO' : `${trialDaysRemaining}D Left`
    },
    {
      id: 'team' as SettingsTabId,
      name: 'Team & RBAC',
      description: 'Executive seats & permissions',
      icon: Users,
      badge: `${teamMembers.length} Members`
    },
    {
      id: 'integrations' as SettingsTabId,
      name: 'Integrations & Sync',
      description: 'Stripe, Supabase, CRM & AI models',
      icon: Database,
      badge: '4 Active'
    },
    {
      id: 'security' as SettingsTabId,
      name: 'Security & Privacy',
      description: 'Multi-tenant isolation & data export',
      icon: Lock,
      badge: 'SOC-2'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1.5 font-mono">
            <span 
              onClick={() => onNavigate && onNavigate('radar')}
              className="hover:text-white cursor-pointer transition-colors"
            >
              PRIME AI
            </span>
            <ChevronRight className="w-3 h-3 text-zinc-600" />
            <span className="text-[#FFD700] font-bold">Workspace Settings</span>
            <ChevronRight className="w-3 h-3 text-zinc-600" />
            <span className="text-white capitalize font-semibold">{settingsTabs.find(t => t.id === activeTab)?.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Workspace Settings & Governance</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/30 font-mono font-bold">
              Full Executive Control
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Configure your enterprise workspace identity, autonomous AI safety gates, team access permissions, and billing tier.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportWorkspaceData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all cursor-pointer"
            title="Download workspace configuration"
          >
            <Download className="w-3.5 h-3.5 text-[#FFD700]" />
            <span>Export Config JSON</span>
          </button>
          {onNavigate && (
            <button
              onClick={() => onNavigate('radar')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFD700] hover:bg-[#FFE55C] text-black text-xs font-bold transition-all shadow-[0_0_20px_rgba(255,215,0,0.25)] cursor-pointer"
            >
              <span>Back to Revenue Radar →</span>
            </button>
          )}
        </div>
      </div>

      {/* TOP NAVIGATION CARDS: The 6 Clear Options (Clicking any opens the full clean page below) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
            Select Settings Module (Click to Open Clean Full Page)
          </h2>
          <span className="text-[11px] text-zinc-500 font-mono">6 Modules Available</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {settingsTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between group ${
                  isActive
                    ? 'bg-[#181818] border-[#FFD700] shadow-[0_0_25px_rgba(255,215,0,0.15)] ring-1 ring-[#FFD700]/50'
                    : 'bg-[#111111] hover:bg-[#161616] border-white/5 hover:border-white/15'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                      isActive 
                        ? 'bg-[#FFD700] text-black shadow-md' 
                        : 'bg-white/5 text-zinc-400 group-hover:text-white'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      isActive 
                        ? 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/40' 
                        : 'bg-white/5 text-zinc-500 border border-white/5'
                    }`}>
                      {tab.badge}
                    </span>
                  </div>
                  <h3 className={`text-xs font-bold truncate ${isActive ? 'text-[#FFD700]' : 'text-white'}`}>
                    {tab.name}
                  </h3>
                  <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                    {tab.description}
                  </p>
                </div>

                {isActive && (
                  <div className="mt-2 pt-2 border-t border-[#FFD700]/30 flex items-center gap-1 text-[9px] text-[#FFD700] font-bold">
                    <Check className="w-3 h-3" />
                    <span>Active Page</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* FULL CLEAN PAGE AREA FOR SELECTED OPTION */}
      <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl relative">
        
        {/* ======================================================== */}
        {/* 1. GENERAL & WORKSPACE PROFILE (CLEAN FULL PAGE) */}
        {/* ======================================================== */}
        {activeTab === 'general' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            <div className="border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FFD700] to-amber-500 flex items-center justify-center text-black font-black shadow-md">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">General Organization & Workspace Profile</h2>
                  <p className="text-xs text-zinc-400">Configure your company identity, default executive details, timezone, and operational currency.</p>
                </div>
              </div>
            </div>

            {/* Email Verification Banner */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FFD700] shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">{user?.email || 'executive@yourcompany.com'}</p>
                    <span className="text-[10px] font-mono text-zinc-500">Tenant: {companyId.slice(0, 14)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {isEmailVerified ? (
                      <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" /> Official Work Email Verified
                      </span>
                    ) : (
                      <span className="text-xs text-amber-400 flex items-center gap-1 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5" /> Work Email Awaiting 6-Digit Verification
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!isEmailVerified && onOpenAuth && (
                <button
                  type="button"
                  onClick={() => onOpenAuth('verify-email')}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-black text-xs font-bold hover:bg-amber-300 transition-all cursor-pointer shrink-0 shadow-sm"
                >
                  Verify Email (Enter Code) →
                </button>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                    Company / Organization Name
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-[#181818] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFD700] transition-colors"
                      placeholder="e.g. Apex Global Enterprise"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1.5">Displayed on client contracts, Revenue Radar reports, and board packs.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                    Executive Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-[#181818] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFD700] transition-colors"
                      placeholder="e.g. Sarah Connor"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1.5">Used for AI draft approvals, CEO Digital Twin persona, and audit log attribution.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                    Executive Role / Official Title
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFD700] transition-colors"
                    placeholder="e.g. Chief Executive Officer, Founder"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1.5">Determines high-stakes approval authority in the executive workflow.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                    Workspace Primary Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFD700] cursor-pointer"
                  >
                    <option value="USD ($)">USD ($) - US Dollar</option>
                    <option value="EUR (€)">EUR (€) - Euro</option>
                    <option value="GBP (£)">GBP (£) - British Pound</option>
                    <option value="CAD ($)">CAD ($) - Canadian Dollar</option>
                    <option value="AUD ($)">AUD ($) - Australian Dollar</option>
                  </select>
                  <p className="text-[11px] text-zinc-500 mt-1.5">Standardized for Revenue Radar, MRR/ARR telemetry, and invoice tracking.</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                    Primary Operational Timezone
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full bg-[#181818] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFD700] cursor-pointer"
                    >
                      <option value="America/New_York (EST)">America/New_York (Eastern Time - UTC-5)</option>
                      <option value="America/Chicago (CST)">America/Chicago (Central Time - UTC-6)</option>
                      <option value="America/Los_Angeles (PST)">America/Los_Angeles (Pacific Time - UTC-8)</option>
                      <option value="Europe/London (GMT)">Europe/London (Greenwich Mean Time - UTC+0)</option>
                      <option value="Europe/Berlin (CET)">Europe/Berlin (Central European Time - UTC+1)</option>
                      <option value="Asia/Dubai (GST)">Asia/Dubai (Gulf Standard Time - UTC+4)</option>
                      <option value="Asia/Karachi (PKT)">Asia/Karachi (Pakistan Standard Time - UTC+5)</option>
                      <option value="Asia/Singapore (SGT)">Asia/Singapore (Singapore Time - UTC+8)</option>
                      <option value="Asia/Tokyo (JST)">Asia/Tokyo (Japan Standard Time - UTC+9)</option>
                    </select>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1.5">Controls the 9:00 AM daily executive briefing dispatch and deal SLA timestamps.</p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {saved ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                    <Check className="w-4 h-4" /> Workspace Profile Updated Successfully!
                  </span>
                ) : (
                  <span className="text-xs text-zinc-500">All modifications are stored securely under your isolated tenant ID.</span>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFD700] to-amber-500 text-black text-xs font-black hover:brightness-110 shadow-lg cursor-pointer transition-all disabled:opacity-50 flex items-center gap-2 justify-center"
                >
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>{saving ? 'Saving Workspace Changes...' : 'Save Workspace Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. AI SAFETY, GOVERNANCE & POLICY (CLEAN FULL PAGE) */}
        {/* ======================================================== */}
        {activeTab === 'safety' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            <div className="border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">AI Safety, Executive Governance & Compliance Policy</h2>
                  <p className="text-xs text-zinc-400">Strict enterprise safeguards guaranteeing no autonomous outbound message leaves without human sign-off.</p>
                </div>
              </div>
            </div>

            {/* Official AI Guidance Disclaimer Card */}
            <AIGuidanceDisclaimer 
              variant="modal" 
              companyId={companyId} 
              companyName={companyName} 
            />

            {/* Policy Controls Section */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider text-zinc-400">
                Autonomous Safety Toggles & Circuit Breakers
              </h3>

              {/* Control 1: Human Approval on Outbound Emails */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-sm font-bold text-white">Mandatory Human Approval on Client Emails</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold">
                      ACTIVE & ENFORCED
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    AI crafts high-precision churn rescue proposals, discount incentives, and renewal defense drafts, but holds them in your approval queue until you click Approve.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={requireApprovalEmails}
                    onChange={(e) => setRequireApprovalEmails(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFD700]"></div>
                </label>
              </div>

              {/* Control 2: Human Approval on Invoices */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-sm font-bold text-white">Mandatory Human Approval on Dunning & Invoices</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold">
                      ACTIVE & ENFORCED
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Past-due warnings, collections reminders, and payment settlement links require manual confirmation before sending to client billing contacts.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={requireApprovalInvoices}
                    onChange={(e) => setRequireApprovalInvoices(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFD700]"></div>
                </label>
              </div>

              {/* Control 3: Undo Safety Window */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-sm font-bold text-white">Autonomous Safety Undo Window</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/30 font-mono font-bold">
                      {undoWindowSeconds}s ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Provides a live rollback countdown after granting approval, allowing any executive to immediately abort an unintended transmission.
                  </p>
                </div>
                <select
                  value={undoWindowSeconds}
                  onChange={(e) => setUndoWindowSeconds(Number(e.target.value))}
                  className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value={60}>60 Seconds</option>
                  <option value={120}>120 Seconds (Enterprise Standard)</option>
                  <option value={300}>300 Seconds (5 Minutes High Security)</option>
                </select>
              </div>
            </div>

            {/* Audit Trail Link */}
            <div className="p-6 rounded-2xl bg-[#FFD700]/5 border border-[#FFD700]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700] shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Immutable AI Decision Audit Log</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Review timestamped verification of every AI telemetry calculation, risk alert score, and executive human signoff.
                  </p>
                </div>
              </div>

              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('approvals')}
                  className="px-5 py-2.5 rounded-xl bg-[#FFD700] text-black font-extrabold text-xs hover:brightness-110 transition-all cursor-pointer shrink-0 shadow-md flex items-center gap-1.5"
                >
                  <span>Open Audit Trail →</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. PLAN & SUBSCRIPTION BILLING (CLEAN FULL PAGE) */}
        {/* ======================================================== */}
        {activeTab === 'billing' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            <div className="border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Subscription, License Tier & Billing</h2>
                  <p className="text-xs text-zinc-400">Monitor executive trial duration, autonomous AI operational allowances, and license upgrades.</p>
                </div>
              </div>
            </div>

            {/* License Overview Card */}
            <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
              isPro 
                ? 'bg-emerald-950/20 border-emerald-500/30' 
                : 'bg-amber-950/20 border-[#FFD700]/40 shadow-[0_0_30px_rgba(255,215,0,0.08)]'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] shadow-md">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Current Workspace Tier</span>
                    <h3 className="text-xl font-extrabold text-white">
                      {isPro ? 'PRIME AI Enterprise Pro ($1,499/mo)' : '14-Day Free Executive Pilot'}
                    </h3>
                  </div>
                </div>

                <span className={`text-xs font-bold px-3.5 py-1.5 rounded-full font-mono border self-start sm:self-auto ${
                  isPro 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/30'
                }`}>
                  {isPro ? 'ACTIVE ENTERPRISE LICENSE' : 'PILOT EVALUATION ACTIVE'}
                </span>
              </div>

              {!isPro ? (
                <div className="space-y-6 pt-4 border-t border-white/5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700]">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-400 uppercase font-mono font-bold">Free Trial Days Left</p>
                        <p className="text-lg font-black text-white">{trialDaysRemaining} Days Remaining</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                        <Flame className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-400 uppercase font-mono font-bold">Autonomous AI Actions</p>
                        <p className="text-lg font-black text-white">{aiActionsRemaining} / 50 Remaining</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed max-w-3xl">
                    Your 14-day executive trial includes 50 free autonomous operations, full Revenue Radar multi-account telemetry, contract risk scans, and CEO Digital Twin simulations. Upgrade anytime to unlock unlimited deal monitoring and dedicated enterprise SLA speed.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      onClick={() => upgradeToPro()}
                      className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#FFD700] via-amber-400 to-[#FFD700] text-black font-extrabold text-xs transition-all shadow-[0_0_25px_rgba(255,215,0,0.3)] flex items-center justify-center gap-2 cursor-pointer hover:brightness-110 active:scale-95 text-center"
                    >
                      <Sparkles className="w-4 h-4 text-black" />
                      <span>Unlock Unlimited AI Operations</span>
                      <ArrowRight className="w-3.5 h-3.5 text-black" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-white/5 text-xs text-zinc-300 space-y-2">
                  <p className="font-bold text-emerald-400 flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4" /> Full Enterprise Suite Unlocked
                  </p>
                  <p className="text-zinc-400 max-w-2xl">
                    Unlimited Revenue Radar deal volume, automated dunning recovery, 24/7 CEO Digital Twin delegation, and dedicated multi-tenant isolation are fully active.
                  </p>
                </div>
              )}
            </div>

            {/* Trust & Security Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">Payoneer &amp; Bank-Grade</p>
                  <p className="text-[10px] text-zinc-400">256-Bit Encrypted Processing</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-[#FFD700] shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">Automated Tax Invoices</p>
                  <p className="text-[10px] text-zinc-400">Full VAT Receipts Emailed</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3">
                <Lock className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">Zero Lock-In</p>
                  <p className="text-[10px] text-zinc-400">Cancel or Pause Anytime</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. TEAM & ROLE-BASED ACCESS CONTROL (CLEAN FULL PAGE) */}
        {/* ======================================================== */}
        {activeTab === 'team' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            <div className="border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-md">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Team Roster & Role-Based Access (RBAC)</h2>
                  <p className="text-xs text-zinc-400">Provision executive seats, assign authorization roles, and audit member activity.</p>
                </div>
              </div>
            </div>

            {/* Invite Form */}
            <form onSubmit={handleInviteTeamMember} className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#FFD700]" />
                <span>Invite Executive Team Member or Delegator</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6">
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="executive@yourcompany.com"
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD700]"
                  />
                </div>
                <div className="sm:col-span-3">
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Executive Member">Executive Member</option>
                    <option value="Administrator">Workspace Admin</option>
                    <option value="Revenue Director">Revenue Director</option>
                    <option value="Compliance Auditor">Compliance Auditor</option>
                    <option value="Read-Only Viewer">Read-Only Viewer</option>
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-[#FFD700] text-black font-extrabold text-xs rounded-xl hover:brightness-110 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Send Invite</span>
                  </button>
                </div>
              </div>
              {inviteSuccess && (
                <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" /> Invitation link dispatched! The user has been added to your pending team roster.
                </p>
              )}
            </form>

            {/* Member List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">
                  Active Workspace Roster ({teamMembers.length} Members)
                </h3>
                <span className="text-[11px] text-zinc-500">Tier Limit: 10 Seats Included</span>
              </div>

              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div key={member.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-xs font-bold text-[#FFD700]">
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{member.name}</span>
                          {member.isYou && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#FFD700]/20 text-[#FFD700] font-mono font-bold">
                              YOU (CURRENT)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono text-[#FFD700] bg-[#FFD700]/10 px-2.5 py-1 rounded-lg border border-[#FFD700]/20 font-bold">
                        {member.role}
                      </span>
                      <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> {member.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 5. INTEGRATIONS & DATA PIPELINE SYNC (CLEAN FULL PAGE) */}
        {/* ======================================================== */}
        {activeTab === 'integrations' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            <div className="border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-md">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Integrations & Pipeline Sync Connectors</h2>
                  <p className="text-xs text-zinc-400">Live operational connectors feeding real-time deal data, ARR telemetry, and payment dunning.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Supabase CRM */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">PostgreSQL & Supabase CRM</h3>
                      <p className="text-[11px] text-zinc-400">Bi-directional pipeline synchronization</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold">
                    CONNECTED
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Real-time synchronization with CRM records, tracking 45 enterprise accounts, deal health scores, and ARR at risk.
                </p>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Latency: ~180ms</span>
                  <span className="text-emerald-400">Sync: Realtime Active</span>
                </div>
              </div>

              {/* Stripe */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Stripe Telemetry & Webhooks</h3>
                      <p className="text-[11px] text-zinc-400">Failed invoices & ARR telemetry</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold">
                    LIVE WEBHOOKS
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Automated dunning triggers on failed charges, seat expansion signals, and immediate ARR churn recalculation.
                </p>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Events: invoice.payment_failed</span>
                  <span className="text-blue-400">Telemetry Active</span>
                </div>
              </div>

              {/* Executive Inbox Gateway */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Executive Inbox IMAP/SMTP Gateway</h3>
                      <p className="text-[11px] text-zinc-400">VIP email triage & draft synthesis</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold">
                    MONITORED
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Monitors executive inbound messages for contract objections, procurement redlines, and payment disputes with zero human delay.
                </p>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>SSL/TLS: Enforced</span>
                  <span className="text-amber-400">24/7 Scanning</span>
                </div>
              </div>

              {/* Google Gemini AI Core */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700]">
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Gemini 3.7 Ultra Neural Engine</h3>
                      <p className="text-[11px] text-zinc-400">Dedicated operational reasoning</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/30 font-mono font-bold">
                    DEDICATED
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  High-velocity neural reasoning powering contract liability auditing, negotiation scripts, and autonomous revenue forecasting.
                </p>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Availability: 99.99%</span>
                  <span className="text-[#FFD700]">Ultra Reasoning Ready</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 6. SECURITY & DATA PRIVACY (CLEAN FULL PAGE) */}
        {/* ======================================================== */}
        {activeTab === 'security' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            <div className="border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-md">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Security, Multi-Tenant Isolation & Privacy</h2>
                  <p className="text-xs text-zinc-400">SOC2 Type-II compliance, cryptographic tenant isolation, and GDPR-compliant data export.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <div className="flex items-center gap-2.5 text-sm font-bold text-white">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Strict Row-Level Tenant Isolation</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Every query is strictly partitioned by your tenant company ID (<code className="text-[#FFD700]">{companyId.slice(0, 14)}</code>). No cross-tenant data leakage is cryptographically possible.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <div className="flex items-center gap-2.5 text-sm font-bold text-white">
                  <Lock className="w-5 h-5 text-[#FFD700]" />
                  <span>AES-256 & TLS 1.3 Encryption</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  All enterprise deal notes, client contracts, and executive audio are encrypted at rest with AES-256 and in transit with modern TLS 1.3 protocol.
                </p>
              </div>
            </div>

            {/* Data Export Action */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#FFD700]" />
                  <span>Export Full Workspace Configuration (GDPR Snapshot)</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Download a machine-readable JSON snapshot containing all your organizational profiles, safety policies, and member roles.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportWorkspaceData}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-2 shrink-0 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download JSON Snapshot</span>
              </button>
            </div>

            {/* Sign Out Action */}
            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs text-zinc-500 font-mono">
                Active session: Protected by Firebase Auth &amp; Enterprise RBAC
              </span>
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  if (onNavigate) onNavigate('landing');
                }}
                className="px-5 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 font-bold text-xs hover:bg-red-500/20 transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Workspace Session</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
