import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Globe, 
  UserCheck, 
  RefreshCw, 
  Crown, 
  ShieldCheck, 
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Search,
  Copy,
  Check,
  Building2,
  Trash2,
  Sparkles,
  Lock,
  LogIn,
  EyeOff,
  Compass,
  Monitor,
  Smartphone,
  ExternalLink,
  Activity,
  Radio
} from 'lucide-react';
import { 
  fetchAdminDashboardData, 
  deleteAdminUserAccount, 
  purgeDuplicateAdnanAccountsAndSessions 
} from '../services/db';
import { AdminDashboardData, AdminUserRecord, VisitorSessionRecord } from '../types';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardProps {
  onNavigate?: (view: string) => void;
  onOpenAuth?: (mode: 'login' | 'signup' | 'verify-email' | 'forgot-password', reason?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, onOpenAuth }) => {
  const { user } = useAuth();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [purging, setPurging] = useState(false);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'visitors'>('overview');

  // Master Owner Check: Strictly reserved exclusively for adnanakhan245@gmail.com
  const isOwner = user?.email?.toLowerCase().trim() === 'adnanakhan245@gmail.com';

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      await purgeDuplicateAdnanAccountsAndSessions().catch(() => {});
      const res = await fetchAdminDashboardData();
      setData(res);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOwner) {
      loadData();
    }
  }, [isOwner]);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // 1-Click Purge Duplicates
  const handlePurgeDuplicates = async () => {
    setPurging(true);
    try {
      const result = await purgeDuplicateAdnanAccountsAndSessions();
      await loadData();
      showToast(`Cleaned: ${result.deletedAccounts} test accounts & ${result.deletedSessions} owner sessions purged.`);
    } catch (e) {
      console.error('Purge error:', e);
    } finally {
      setPurging(false);
    }
  };

  // Delete specific account
  const handleDeleteAccount = async (account: AdminUserRecord) => {
    const isMaster = account.isSuperAdmin || account.email === 'adnanakhan245@gmail.com';
    if (isMaster) {
      alert('Master Platform Owner account cannot be deleted.');
      return;
    }

    if (!window.confirm(`Are you sure you want to remove account "${account.email}"? This action is permanent.`)) {
      return;
    }

    setDeletingEmail(account.email);
    try {
      await deleteAdminUserAccount({
        uid: account.uid,
        email: account.email,
        companyId: account.companyId
      });
      await loadData();
      showToast(`Account "${account.email}" deleted successfully.`);
    } catch (err) {
      console.error('Error deleting account:', err);
      alert('Could not delete account. Please try again.');
    } finally {
      setDeletingEmail(null);
    }
  };

  // =========================================================================
  // STRICT ACCESS DENIAL IF NOT PLATFORM OWNER (adnanakhan245@gmail.com)
  // =========================================================================
  if (!isOwner) {
    return (
      <div className="w-full max-w-2xl mx-auto py-16 px-4 animate-in fade-in duration-300">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#121212] border border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.15)] text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/5 rounded-bl-full pointer-events-none" />
          
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
              RESTRICTED • PLATFORM OWNER ONLY
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight pt-2">
              Private Admin Dashboard
            </h1>
            <p className="text-sm text-zinc-300 font-medium">
              صرف اور صرف پلیٹ فارم اونر (Platform Owner) کے لیے مختص
            </p>
          </div>

          <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
            This internal telemetry command center is strictly private. It contains real registered accounts and external visitor analytics. Only <span className="text-[#FFD700] font-mono font-bold">adnanakhan245@gmail.com</span> is authorized to view this data.
          </p>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-left text-xs space-y-2 max-w-md mx-auto">
            <div className="flex items-center gap-2 text-zinc-400">
              <EyeOff className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Current Status: {user ? `Signed in as ${user.email}` : 'Not logged in'}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Required Email: adnanakhan245@gmail.com</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {onOpenAuth && (
              <button
                onClick={() => onOpenAuth('login', 'Please sign in with the Platform Owner account (adnanakhan245@gmail.com) to access the Super Admin Dashboard.')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFD700] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign in as Platform Owner</span>
              </button>
            )}

            {onNavigate && (
              <button
                onClick={() => onNavigate('radar')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to App</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // OWNER AUTHORIZED VIEW
  // =========================================================================
  const rawUsersList: AdminUserRecord[] = data?.users || [];

  // Strict 100% Unique Deduplication Map by Normalized Email
  const uniqueUsersMap = new Map<string, AdminUserRecord>();
  for (const u of rawUsersList) {
    if (!u.email) continue;
    const norm = u.email.trim().toLowerCase();
    if (!uniqueUsersMap.has(norm)) {
      uniqueUsersMap.set(norm, { ...u, email: norm });
    } else {
      const existing = uniqueUsersMap.get(norm)!;
      if (u.isSuperAdmin || (!existing.displayName && u.displayName)) {
        uniqueUsersMap.set(norm, { ...u, email: norm });
      }
    }
  }

  const uniqueUsersList = Array.from(uniqueUsersMap.values());
  const totalUsers = uniqueUsersList.length;
  const totalVisitors = data?.visitorStats?.totalVisitorsAllTime ?? (data?.visitorStats?.totalVisitorsToday || 0);
  const totalRegistered = uniqueUsersList.length;
  const visitorsToday = data?.visitorStats?.totalVisitorsToday || 0;
  const activeNow = data?.visitorStats?.activeNowCount || 1;
  const recentSessions: VisitorSessionRecord[] = data?.visitorStats?.recentSessions || [];

  // Filter external registered users vs owner
  const filteredUsers = uniqueUsersList.filter(u => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.email?.toLowerCase().includes(q) ||
      u.displayName?.toLowerCase().includes(q) ||
      u.companyName?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  // Calculate Traffic Source Breakdown from sessions
  const sourceCounts: Record<string, number> = {
    'Reddit': 0,
    'Direct / WhatsApp': 0,
    'Twitter / X': 0,
    'Google Search': 0,
    'Other': 0
  };

  recentSessions.forEach(s => {
    const ref = (s.referrer || '').toLowerCase();
    if (ref.includes('reddit')) sourceCounts['Reddit']++;
    else if (ref.includes('twitter') || ref.includes('x.com') || ref.includes('t.co')) sourceCounts['Twitter / X']++;
    else if (ref.includes('google')) sourceCounts['Google Search']++;
    else if (ref.includes('direct') || ref.includes('whatsapp') || !ref) sourceCounts['Direct / WhatsApp']++;
    else sourceCounts['Other']++;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-gradient-to-r from-[#FFD700] to-amber-400 text-black font-extrabold text-xs shadow-2xl flex items-center gap-2 animate-bounce border border-black/20">
          <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          {onNavigate && (
            <button
              onClick={() => onNavigate('radar')}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer border border-white/10"
              title="Back to Revenue Radar"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD700] via-amber-400 to-[#B8860B] flex items-center justify-center text-black font-black shadow-[0_0_20px_rgba(255,215,0,0.25)]">
            <Crown className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                Admin <span className="text-[#FFD700]">Dashboard</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/30">
                OWNER EXCLUSIVE
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              صرف آپ کے لیے (adnanakhan245@gmail.com) • Last synced at {lastRefreshed}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePurgeDuplicates}
            disabled={purging}
            className="px-3.5 py-2.5 rounded-xl bg-[#FFD700]/10 hover:bg-[#FFD700]/20 text-[#FFD700] text-xs font-bold border border-[#FFD700]/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
            title="Clean all duplicate test accounts & sessions"
          >
            <Sparkles className={`w-3.5 h-3.5 ${purging ? 'animate-spin' : ''}`} />
            <span>{purging ? 'Cleaning...' : 'Clean Test Accounts'}</span>
          </button>

          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#FFD700]' : 'text-zinc-400'}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh Telemetry'}</span>
          </button>
        </div>
      </div>

      {/* GUARANTEE CALLOUT: ADMIN VISITS EXCLUDED */}
      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
            <EyeOff className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-emerald-300">
              آپ کے اپنے تمام وزٹس (adnanakhan245@gmail.com) ٹریفک سے 100% خارج ہیں
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Your own visits, page loads, and test sessions are never counted in the visitor telemetry. You only see real external users.
            </p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-emerald-500/30 text-[11px] font-mono text-emerald-400 font-bold shrink-0">
          FILTER: ACTIVE
        </div>
      </div>

      {/* 4 CORE METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* CARD 1: TOTAL REGISTERED ACCOUNTS */}
        <div className="p-6 rounded-3xl bg-[#121212] border border-white/10 hover:border-blue-500/50 transition-all shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
          
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-md">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
              VERIFIED
            </span>
          </div>

          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
            کل رجسٹرڈ اکاؤنٹس
          </span>
          <span className="text-[11px] text-zinc-500 block">Total Registered Accounts</span>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-blue-400 font-mono tracking-tight">
              {loading ? '...' : totalRegistered}
            </span>
            <span className="text-xs text-zinc-500 font-medium">Distinct Accounts</span>
          </div>

          <p className="mt-4 pt-3 border-t border-white/5 text-[11px] text-zinc-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Strict deduplication • 1 per user</span>
          </p>
        </div>

        {/* CARD 2: TOTAL VISITORS (ALL TIME) */}
        <div className="p-6 rounded-3xl bg-[#121212] border border-white/10 hover:border-emerald-500/50 transition-all shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
          
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
              <Globe className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              ALL TIME
            </span>
          </div>

          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
            کل بیرونی وزٹرز
          </span>
          <span className="text-[11px] text-zinc-500 block">Total External Visitors</span>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">
              {loading ? '...' : totalVisitors}
            </span>
            <span className="text-xs text-zinc-500 font-medium">Visitors</span>
          </div>

          <p className="mt-4 pt-3 border-t border-white/5 text-[11px] text-zinc-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Your visits excluded</span>
          </p>
        </div>

        {/* CARD 3: TODAY'S VISITORS */}
        <div className="p-6 rounded-3xl bg-[#121212] border border-white/10 hover:border-[#FFD700]/50 transition-all shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFD700]/5 rounded-bl-full pointer-events-none group-hover:bg-[#FFD700]/10 transition-colors" />
          
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] shadow-md">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/30">
              TODAY
            </span>
          </div>

          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
            آج کے وزٹرز
          </span>
          <span className="text-[11px] text-zinc-500 block">Visitors Today</span>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-[#FFD700] font-mono tracking-tight">
              {loading ? '...' : visitorsToday}
            </span>
            <span className="text-xs text-zinc-500 font-medium">Today</span>
          </div>

          <p className="mt-4 pt-3 border-t border-white/5 text-[11px] text-zinc-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#FFD700]" />
            <span>Refreshes dynamically</span>
          </p>
        </div>

        {/* CARD 4: LIVE ACTIVE RIGHT NOW */}
        <div className="p-6 rounded-3xl bg-[#121212] border border-white/10 hover:border-cyan-500/50 transition-all shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
          
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              LIVE
            </span>
          </div>

          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
            اس وقت ایکٹو وزٹرز
          </span>
          <span className="text-[11px] text-zinc-500 block">Active Right Now</span>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono tracking-tight">
              {loading ? '...' : activeNow}
            </span>
            <span className="text-xs text-zinc-500 font-medium">Active in last 15m</span>
          </div>

          <p className="mt-4 pt-3 border-t border-white/5 text-[11px] text-zinc-400 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Real-time presence tracking</span>
          </p>
        </div>

      </div>

      {/* NAVIGATION TABS FOR DEEP AUDIT */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#FFD700] text-black shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Overview &amp; Sources
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'accounts'
              ? 'bg-[#FFD700] text-black shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>Accounts Registry ({uniqueUsersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('visitors')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'visitors'
              ? 'bg-[#FFD700] text-black shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>Visitor Sessions Log ({recentSessions.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & TRAFFIC SOURCES */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Traffic Source Breakdown */}
          <div className="md:col-span-1 bg-[#121212] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#FFD700]" />
                <span>ٹریفک کے ذرائع (Sources)</span>
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">External Leads</span>
            </div>

            <div className="space-y-3">
              {Object.entries(sourceCounts).map(([source, count]) => {
                const total = totalVisitors || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={source} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 font-medium">{source}</span>
                      <span className="font-mono text-zinc-400">{count} visits ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          source === 'Reddit' ? 'bg-orange-500' :
                          source === 'Twitter / X' ? 'bg-cyan-400' :
                          source === 'Google Search' ? 'bg-emerald-400' :
                          'bg-[#FFD700]'
                        }`}
                        style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/5 text-[11px] text-zinc-500 leading-relaxed">
              ریڈٹ یا دیگر کمیونٹیز میں شیئر کیے گئے لنکس کے وزٹرز یہاں خودبخود شناخت ہوتے ہیں۔
            </div>
          </div>

          {/* Quick Account Preview */}
          <div className="md:col-span-2 bg-[#121212] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">
                  تازہ ترین اکاؤنٹس (Latest User Accounts)
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('accounts')}
                className="text-xs text-[#FFD700] hover:underline cursor-pointer font-semibold"
              >
                View all {uniqueUsersList.length} accounts &rarr;
              </button>
            </div>

            <div className="space-y-2.5">
              {uniqueUsersList.slice(0, 4).map((acc) => {
                const isMaster = acc.email === 'adnanakhan245@gmail.com' || acc.isSuperAdmin;
                return (
                  <div key={acc.email} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isMaster ? 'bg-[#FFD700] text-black font-black' : 'bg-white/10 text-white'
                      }`}>
                        {acc.displayName ? acc.displayName.slice(0, 2).toUpperCase() : 'US'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs truncate">{acc.displayName || 'Executive'}</span>
                          {isMaster && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#FFD700]/20 text-[#FFD700] font-bold border border-[#FFD700]/30 shrink-0">
                              YOU (OWNER)
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-400 truncate block">{acc.email}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/10 shrink-0">
                      {acc.createdAt ? new Date(acc.createdAt).toLocaleDateString() : 'Active'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REGISTERED ACCOUNTS REGISTRY */}
      {activeTab === 'accounts' && (
        <section className="bg-[#121212] border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
          {/* Header & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>رجسٹرڈ اکاؤنٹس کی لسٹ (Registered Accounts)</span>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                    {filteredUsers.length} Unique
                  </span>
                </h2>
                <p className="text-xs text-zinc-400">
                  All distinct user profiles registered in the database.
                </p>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, workspace..."
                className="w-full bg-[#181818] border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#FFD700]"
              />
            </div>
          </div>

          {/* Accounts Table */}
          <div className="overflow-x-auto">
            {filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                <UserCheck className="w-8 h-8 text-zinc-600 mx-auto mb-2 opacity-50" />
                <p className="font-semibold text-zinc-400">No registered accounts found matching your query</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    <th className="pb-3 font-semibold">User &amp; Email</th>
                    <th className="pb-3 font-semibold">Organization / Workspace</th>
                    <th className="pb-3 font-semibold">Role</th>
                    <th className="pb-3 font-semibold">Plan</th>
                    <th className="pb-3 font-semibold">Joined Date</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((account) => {
                    const isMaster = account.isSuperAdmin || account.email === 'adnanakhan245@gmail.com';
                    const isDeleting = deletingEmail === account.email;

                    return (
                      <tr key={account.uid || account.email} className="hover:bg-white/[0.02] transition-colors group">
                        
                        {/* User & Email */}
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              isMaster 
                                ? 'bg-[#FFD700] text-black shadow-sm font-black' 
                                : 'bg-white/10 text-white'
                            }`}>
                              {account.displayName ? account.displayName.slice(0, 2).toUpperCase() : 'US'}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white truncate">{account.displayName || 'Executive User'}</span>
                                {isMaster && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#FFD700]/20 text-[#FFD700] font-bold border border-[#FFD700]/30 shrink-0">
                                    YOU (MASTER ADMIN)
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5 text-zinc-400">
                                <span className="text-[11px] truncate">{account.email}</span>
                                <button
                                  onClick={() => handleCopyEmail(account.email)}
                                  className="text-zinc-500 hover:text-white transition-colors cursor-pointer shrink-0"
                                  title="Copy Email"
                                >
                                  {copiedEmail === account.email ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Organization */}
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                            <div className="truncate">
                              <span className="text-white font-medium">{account.companyName || 'Enterprise Workspace'}</span>
                              <span className="block text-[10px] font-mono text-zinc-500 truncate">
                                ID: {account.companyId || 'comp_isolated'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Executive Role */}
                        <td className="py-3.5 pr-4">
                          <span className="text-zinc-300 font-medium">
                            {account.role || 'Executive Member'}
                          </span>
                        </td>

                        {/* Plan Tier */}
                        <td className="py-3.5 pr-4">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                            account.plan === 'Pro' || account.plan === 'Enterprise'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/30'
                          }`}>
                            {account.plan || '14-Day Pilot'}
                          </span>
                        </td>

                        {/* Joined Date */}
                        <td className="py-3.5 pr-4 text-zinc-400 font-mono text-[11px]">
                          {account.createdAt ? new Date(account.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : 'Recent'}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 text-right">
                          {isMaster ? (
                            <span className="text-[10px] font-mono text-zinc-500 uppercase">
                              Protected
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDeleteAccount(account)}
                              disabled={isDeleting}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
                              title={`Delete account ${account.email}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      )}

      {/* TAB 3: VISITOR SESSIONS LOG */}
      {activeTab === 'visitors' && (
        <section className="bg-[#121212] border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>بیرونی وزٹرز کی لائیو لاگ (External Visitor Sessions)</span>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    {recentSessions.length} Recent Visits
                  </span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Real-time external traffic arriving on the web app. Adnan&apos;s own visits are strictly filtered out.
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {recentSessions.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500 space-y-2">
                <Globe className="w-8 h-8 text-zinc-600 mx-auto opacity-50" />
                <p className="font-semibold text-zinc-400">No external visits recorded yet</p>
                <p className="text-[11px] text-zinc-500">
                  As you share links on Reddit, X, or directly, live external visits will appear here instantly.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    <th className="pb-3 font-semibold">Time &amp; Date</th>
                    <th className="pb-3 font-semibold">Visitor Type</th>
                    <th className="pb-3 font-semibold">Source / Referrer</th>
                    <th className="pb-3 font-semibold">Device</th>
                    <th className="pb-3 font-semibold">Entry Page</th>
                    <th className="pb-3 font-semibold text-right">Actions Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 pr-4 font-mono text-[11px] text-zinc-300">
                        {new Date(session.lastActiveAt || session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(session.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          session.visitorType === 'REGISTERED_ACCOUNT' 
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : session.visitorType === 'DEMO_GUEST'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {session.visitorType}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-zinc-300 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <span className="truncate max-w-[180px]">{session.referrer || 'Direct Link'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          {session.deviceType === 'Mobile' ? (
                            <Smartphone className="w-3.5 h-3.5 text-[#3DDC84]" />
                          ) : (
                            <Monitor className="w-3.5 h-3.5 text-zinc-400" />
                          )}
                          <span className="text-[11px]">{session.deviceType || 'Desktop'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 font-mono text-[11px] text-zinc-400">
                        {session.entryPath || '/'}
                      </td>
                      <td className="py-3.5 text-right font-mono text-zinc-300">
                        {session.actionsCount || 1}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      )}

      {/* Clean Status Banner */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#FFD700]" />
          <span>Exclusive platform owner session: <strong>adnanakhan245@gmail.com</strong></span>
        </div>
        <div className="font-mono text-[11px] text-zinc-500">
          Admin Gate: Strict Enforcement (No public access)
        </div>
      </div>

    </div>
  );
};
