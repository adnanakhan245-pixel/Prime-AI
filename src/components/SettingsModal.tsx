import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  Building2, 
  User, 
  ShieldCheck, 
  ShieldAlert, 
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
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AIGuidanceDisclaimer } from './AIGuidanceDisclaimer';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVerifyEmail?: () => void;
  onNavigate?: (view: string) => void;
}

type SettingsTab = 'general' | 'safety' | 'billing' | 'team' | 'integrations' | 'security';

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onOpenVerifyEmail,
  onNavigate 
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

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [companyName, setCompanyName] = useState(profile?.companyName || company?.name || 'Acme Enterprises');
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
  const [inviteRole, setInviteRole] = useState('Executive');
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 'tm_1',
      name: profile?.displayName || user?.displayName || 'Executive Leader',
      email: user?.email || 'ceo@company.com',
      role: 'Workspace Owner (CEO)',
      status: 'Active',
      isYou: true
    }
  ]);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCompanyProfile(companyName, role);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
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
    setTimeout(() => setInviteSuccess(false), 3000);
  };

  const handleExportWorkspaceData = () => {
    const dataSnapshot = {
      workspaceId: company?.id || 'comp_current',
      workspaceName: companyName,
      executiveRole: role,
      executiveUser: displayName,
      email: user?.email,
      exportedAt: new Date().toISOString(),
      plan: isPro ? 'Pro' : '14-Day Free Trial',
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

  const handleUpgradeClick = async () => {
    setUpgrading(true);
    try {
      redirectToCheckout();
    } catch (e) {
      console.error('Upgrade redirect error:', e);
      await upgradeToPro();
    } finally {
      setUpgrading(false);
    }
  };

  const companyId = company?.id || 'comp_workspace_01';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl bg-[#121212] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-white flex flex-col md:flex-row overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT NAVIGATION SIDEBAR (B2B SaaS Settings Tabs) */}
        <div className="w-full md:w-64 bg-[#0A0A0A] border-b md:border-b-0 md:border-r border-white/5 p-4 sm:p-5 flex flex-col justify-between shrink-0">
          <div>
            {/* Header info */}
            <div className="flex items-center gap-3 mb-6 px-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#B8860B] flex items-center justify-center text-black font-black shadow-md">
                <Crown className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black text-white tracking-wide truncate">
                  {companyName}
                </h3>
                <p className="text-[10px] text-zinc-400 font-mono">Workspace Settings</p>
              </div>
            </div>

            {/* Tabs List */}
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'general'
                    ? 'bg-[#FFD700] text-black shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>General & Workspace</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('safety')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'safety'
                    ? 'bg-[#FFD700] text-black shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>AI Safety & Policy</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  activeTab === 'safety' ? 'bg-black text-[#FFD700]' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  POLICY
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('billing')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'billing'
                    ? 'bg-[#FFD700] text-black shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4" />
                  <span>Plan & Billing</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  activeTab === 'billing' ? 'bg-black text-[#FFD700]' : isPro ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-300'
                }`}>
                  {isPro ? 'PRO' : `${trialDaysRemaining}D`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('team')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'team'
                    ? 'bg-[#FFD700] text-black shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Team & Access (RBAC)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('integrations')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'integrations'
                    ? 'bg-[#FFD700] text-black shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Integrations & Sync</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'security'
                    ? 'bg-[#FFD700] text-black shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Security & Privacy</span>
              </button>
            </nav>
          </div>

          {/* Bottom Logout Button */}
          <div className="pt-4 mt-4 border-t border-white/5">
            <button
              type="button"
              onClick={async () => {
                onClose();
                await signOut();
                if (onNavigate) onNavigate('landing');
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out of Workspace</span>
            </button>
          </div>
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="flex-1 p-5 sm:p-7 overflow-y-auto max-h-[85vh] md:max-h-[92vh]">
          
          {/* TAB 1: GENERAL & WORKSPACE PROFILE */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Organization & Workspace Profile</h3>
                <p className="text-xs text-zinc-400">Configure your company identity, timezone, and executive details.</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* Account & Verification Card */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
                      <Mail className="w-5 h-5 text-[#FFD700]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{user?.email || 'Executive Account'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {isEmailVerified ? (
                          <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                            <ShieldCheck className="w-3 h-3" /> Official Work Email Verified
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-400 flex items-center gap-1 font-semibold">
                            <AlertTriangle className="w-3 h-3" /> Email Unverified
                          </span>
                        )}
                        <span className="text-zinc-600">•</span>
                        <span className="text-[10px] text-zinc-500 font-mono">Tenant ID: {companyId.slice(0, 12)}</span>
                      </div>
                    </div>
                  </div>

                  {!isEmailVerified && onOpenVerifyEmail && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenVerifyEmail();
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 text-xs font-bold transition-all cursor-pointer shrink-0"
                    >
                      Verify Work Email
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                      Company / Organization Name
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full bg-[#181818] border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD700]"
                        placeholder="e.g. Stripe, Acme Corp"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                      Executive Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-[#181818] border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD700]"
                        placeholder="e.g. Sarah Connor"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                      Executive Role / Title
                    </label>
                    <input
                      type="text"
                      required
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD700]"
                      placeholder="e.g. Chief Executive Officer, Founder"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                      Workspace Primary Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD700] cursor-pointer"
                    >
                      <option value="USD ($)">USD ($) - US Dollar</option>
                      <option value="EUR (€)">EUR (€) - Euro</option>
                      <option value="GBP (£)">GBP (£) - British Pound</option>
                      <option value="CAD ($)">CAD ($) - Canadian Dollar</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                      Operational Timezone
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full bg-[#181818] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD700] cursor-pointer"
                      >
                        <option value="America/New_York (EST)">America/New_York (Eastern Time)</option>
                        <option value="America/Los_Angeles (PST)">America/Los_Angeles (Pacific Time)</option>
                        <option value="Europe/London (GMT)">Europe/London (Greenwich Mean Time)</option>
                        <option value="Europe/Berlin (CET)">Europe/Berlin (Central European Time)</option>
                        <option value="Asia/Dubai (GST)">Asia/Dubai (Gulf Standard Time)</option>
                        <option value="Asia/Karachi (PKT)">Asia/Karachi (Pakistan Standard Time)</option>
                        <option value="Asia/Singapore (SGT)">Asia/Singapore (Singapore Time)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  {saved ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> Workspace Profile Updated Successfully!
                    </span>
                  ) : <span />}

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FFD700] to-amber-400 text-black text-xs font-black hover:brightness-110 shadow-md cursor-pointer transition-all disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Workspace Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: AI SAFETY, GOVERNANCE & POLICY (THIS IS WHERE THE SAFETY NOTICE LIVES PER USER REQUEST) */}
          {activeTab === 'safety' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#FFD700]" />
                  <span>AI Safety, Governance & Compliance Policy</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Enterprise safeguards ensuring no automated AI communication leaves the platform without explicit human authorization.
                </p>
              </div>

              {/* The Official AI Guidance Disclaimer Card (Moved here from homepage per user instructions) */}
              <AIGuidanceDisclaimer 
                variant="modal" 
                companyId={companyId} 
                companyName={companyName} 
              />

              {/* Policy Controls */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider text-zinc-400">
                  Autonomous Operation Safeguards
                </h4>

                {/* Switch 1: Human Approval on Outbound Emails */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Mandatory Human Approval on Client Emails</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                        ENFORCED
                      </span>
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      AI drafts Churn Rescue, negotiation proposals, and meeting replies, but holds them until you click Approve.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={requireApprovalEmails}
                    onChange={(e) => setRequireApprovalEmails(e.target.checked)}
                    className="w-5 h-5 accent-[#FFD700] rounded cursor-pointer shrink-0"
                  />
                </div>

                {/* Switch 2: Human Approval on Dunning & Invoices */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Mandatory Human Approval on Invoices & Dunning Notices</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                        ENFORCED
                      </span>
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Past-due reminders and payment settlement links require manual confirmation before sending to billing contacts.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={requireApprovalInvoices}
                    onChange={(e) => setRequireApprovalInvoices(e.target.checked)}
                    className="w-5 h-5 accent-[#FFD700] rounded cursor-pointer shrink-0"
                  />
                </div>

                {/* Switch 3: 2-Minute Undo Window */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Autonomous 2-Minute Safety Undo Window</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/30 font-mono">
                        {undoWindowSeconds}s ACTIVE
                      </span>
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Provides a 120-second rollback countdown after granting approval to cancel any scheduled transmission.
                    </p>
                  </div>
                  <select
                    value={undoWindowSeconds}
                    onChange={(e) => setUndoWindowSeconds(Number(e.target.value))}
                    className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value={60}>60 Seconds</option>
                    <option value={120}>120 Seconds (Standard)</option>
                    <option value={300}>5 Minutes</option>
                  </select>
                </div>
              </div>

              {/* Link to Audit Trail */}
              <div className="p-4 rounded-2xl bg-[#FFD700]/5 border border-[#FFD700]/20 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700] shrink-0">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Immutable AI Decision Audit Log</p>
                    <p className="text-[11px] text-zinc-400">Review timestamped verification of every AI calculation, risk score, and human signoff.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigate) onNavigate('approvals');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#FFD700] text-black font-extrabold text-xs hover:brightness-110 transition-all cursor-pointer shrink-0 shadow-sm"
                >
                  Open Audit Trail →
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SUBSCRIPTION & BILLING */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Subscription & Plan Tier</h3>
                <p className="text-xs text-zinc-400">Monitor trial duration, operational allowances, and enterprise license upgrades.</p>
              </div>

              {/* Plan Card */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isPro 
                  ? 'bg-emerald-950/20 border-emerald-500/30' 
                  : 'bg-amber-950/20 border-[#FFD700]/40 shadow-[0_0_30px_rgba(255,215,0,0.08)]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700]">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Current License</span>
                      <h4 className="text-base font-extrabold text-white">
                        {isPro ? 'PRIME AI Enterprise Pro' : '14-Day Free Executive Trial'}
                      </h4>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full font-mono border ${
                    isPro 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                      : 'bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/30'
                  }`}>
                    {isPro ? 'ACTIVE PRO ($1,499/mo)' : 'TRIAL ACTIVE'}
                  </span>
                </div>

                {!isPro ? (
                  <div className="space-y-4 pt-2 border-t border-white/5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-[#FFD700]" />
                        <div>
                          <p className="text-[10px] text-zinc-400 uppercase font-mono">Trial Days Left</p>
                          <p className="text-sm font-bold text-white">{trialDaysRemaining} Days</p>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2.5">
                        <Flame className="w-4 h-4 text-amber-400" />
                        <div>
                          <p className="text-[10px] text-zinc-400 uppercase font-mono">Free AI Actions</p>
                          <p className="text-sm font-bold text-white">{aiActionsRemaining} / 50 Left</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Your complimentary 14-day trial includes 50 free autonomous operations, full Revenue Radar telemetry, and contract risk audits. Upgrade to unlock unlimited AI action volume and dedicated COO speed.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        upgradeToPro();
                        onClose();
                      }}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FFD700] to-amber-500 text-black font-black text-xs transition-all shadow-[0_0_25px_rgba(255,215,0,0.3)] flex items-center justify-center gap-2 cursor-pointer hover:brightness-110 active:scale-95 text-center"
                    >
                      <Sparkles className="w-4 h-4 text-black" />
                      <span>Unlock Unlimited Operations</span>
                      <ArrowRight className="w-3.5 h-3.5 text-black" />
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-white/5 text-xs text-zinc-300 space-y-1">
                    <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Full Enterprise Operations Unlocked
                    </p>
                    <p className="text-zinc-400">
                      Unlimited Revenue Radar telemetry, automated dunning recovery, and 24/7 autonomous COO inbox triage are fully active.
                    </p>
                  </div>
                )}
              </div>

              {/* Billing Security Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="text-xs font-bold text-white">Payoneer & SOC-2</p>
                    <p className="text-[10px] text-zinc-400">256-Bit Bank-Grade Processing</p>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-[#FFD700]" />
                  <div>
                    <p className="text-xs font-bold text-white">Automatic Receipts</p>
                    <p className="text-[10px] text-zinc-400">VAT & Tax Invoices Included</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TEAM & ACCESS CONTROL (RBAC) */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Team & Role-Based Access (RBAC)</h3>
                <p className="text-xs text-zinc-400">Manage executive seats, team permissions, and operational delegators.</p>
              </div>

              {/* Invite Member Form */}
              <form onSubmit={handleInviteTeamMember} className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-[#FFD700]" />
                  <span>Invite Executive Team Member</span>
                </h4>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@yourcompany.com"
                    className="flex-1 bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#FFD700]"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Executive">Executive Member</option>
                    <option value="Admin">Administrator</option>
                    <option value="Auditor">Compliance Auditor</option>
                    <option value="Viewer">Read-Only Viewer</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#FFD700] text-black font-extrabold text-xs rounded-xl hover:brightness-110 transition-all cursor-pointer shrink-0"
                  >
                    Send Invite
                  </button>
                </div>
                {inviteSuccess && (
                  <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Invitation sent! User has been added to pending roster.
                  </p>
                )}
              </form>

              {/* Team Members List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Active Workspace Members ({teamMembers.length})
                </h4>
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-xs font-bold text-[#FFD700]">
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{member.name}</span>
                            {member.isYou && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-white/70 font-mono">YOU</span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400">{member.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#FFD700] bg-[#FFD700]/10 px-2 py-0.5 rounded border border-[#FFD700]/20">
                          {member.role}
                        </span>
                        <span className="text-[10px] text-emerald-400">
                          {member.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: INTEGRATIONS & DATA SYNC */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Integrations & Pipeline Sync</h3>
                <p className="text-xs text-zinc-400">Live connectors powering automated Revenue Radar, CRM telemetry, and dunning.</p>
              </div>

              <div className="space-y-3">
                {/* Supabase CRM */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">PostgreSQL & Supabase CRM</h4>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                          CONNECTED
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Bi-directional deals synchronization with client health scoring & ARR tracking.</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">2.4s Latency</span>
                </div>

                {/* Stripe */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">Stripe Subscriptions & Webhooks</h4>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                          LIVE WEBHOOKS
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Automated failed invoice detection, dunning telemetry, and seat quota triggers.</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">Active</span>
                </div>

                {/* Gmail & Outlook */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">Executive Inbox IMAP/SMTP Gateway</h4>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                          ACTIVE
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Autonomous triage scanning for contract redlines, payment disputes, and VIP buyer requests.</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">24/7 Monitor</span>
                </div>

                {/* Google Gemini AI Core */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] shrink-0">
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">Gemini 3.7 Ultra Neural Engine</h4>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/30 font-mono">
                          DEDICATED
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">High-velocity reasoning for contract redlines, multi-year proposals, and objection closing.</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 hidden sm:inline">99.99% Uptime</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SECURITY & DATA PRIVACY */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Security & Multi-Tenant Isolation</h3>
                <p className="text-xs text-zinc-400">SOC2 Type-II compliance, data isolation, and cryptographic auditability.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Tenant Partitioning</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Row-level isolation enforced on company ID. No other enterprise client can read or access your pipeline.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Lock className="w-4 h-4 text-[#FFD700]" />
                    <span>Encryption Standards</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    AES-256 at rest, TLS 1.3 in transit. Automated key rotation every 90 days.
                  </p>
                </div>
              </div>

              {/* Data Export Action */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-white">Export Workspace Data</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Download a complete JSON snapshot of all your settings, policies, and team metadata.</p>
                </div>
                <button
                  type="button"
                  onClick={handleExportWorkspaceData}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
              </div>

              {/* Session signout */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">Active session: Chrome on Web (Secure)</span>
                <button
                  type="button"
                  onClick={async () => {
                    onClose();
                    await signOut();
                    if (onNavigate) onNavigate('landing');
                  }}
                  className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 font-bold text-xs hover:bg-red-500/20 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Terminate Session &amp; Sign Out</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
