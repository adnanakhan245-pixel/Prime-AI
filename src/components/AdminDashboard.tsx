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
  Sparkles
} from 'lucide-react';
import { 
  fetchAdminDashboardData, 
  deleteAdminUserAccount, 
  purgeDuplicateAdnanAccountsAndSessions 
} from '../services/db';
import { AdminDashboardData, AdminUserRecord } from '../types';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardProps {
  onNavigate?: (view: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [purging, setPurging] = useState(false);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
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
    loadData();
  }, []);

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
      showToast(`Cleaned duplicates: ${result.deletedAccounts} accounts & ${result.deletedSessions} sessions.`);
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
                SUPER ADMIN
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live platform metrics &amp; registered account registry • Last synced at {lastRefreshed}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePurgeDuplicates}
            disabled={purging}
            className="px-3.5 py-2.5 rounded-xl bg-[#FFD700]/10 hover:bg-[#FFD700]/20 text-[#FFD700] text-xs font-bold border border-[#FFD700]/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
            title="Clean all duplicate accounts and keep 1 unique record per user"
          >
            <Sparkles className={`w-3.5 h-3.5 ${purging ? 'animate-spin' : ''}`} />
            <span>{purging ? 'Cleaning...' : 'Clean Duplicates'}</span>
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

      {/* 3 CORE METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* OPTION 1: TOTAL APP USERS */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#121212] border border-white/10 hover:border-[#FFD700]/50 transition-all shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 rounded-bl-full pointer-events-none group-hover:bg-[#FFD700]/10 transition-colors" />
          
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] shadow-md">
              <Users className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/30">
              UNIQUE
            </span>
          </div>

          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
            Total App Users
          </span>

          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
              {loading ? '...' : totalUsers}
            </span>
            <span className="text-xs text-zinc-500 font-medium">Unique Accounts</span>
          </div>

          <p className="mt-4 pt-4 border-t border-white/5 text-xs text-zinc-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>All verified unique user profiles across tenant workspaces</span>
          </p>
        </div>

        {/* OPTION 2: TOTAL VISITORS */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#121212] border border-white/10 hover:border-emerald-500/50 transition-all shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
          
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
              <Globe className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              TRAFFIC
            </span>
          </div>

          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
            Total Visitors
          </span>

          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-black text-emerald-400 font-mono tracking-tight">
              {loading ? '...' : totalVisitors}
            </span>
            <span className="text-xs text-zinc-500 font-medium">All-Time Visitors</span>
          </div>

          <p className="mt-4 pt-4 border-t border-white/5 text-xs text-zinc-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Today&apos;s Visitors: <strong className="text-white">{data?.visitorStats?.totalVisitorsToday || 0}</strong></span>
          </p>
        </div>

        {/* OPTION 3: TOTAL REGISTERED ACCOUNTS */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#121212] border border-white/10 hover:border-blue-500/50 transition-all shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
          
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-md">
              <UserCheck className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
              VERIFIED
            </span>
          </div>

          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
            Total Registered Accounts
          </span>

          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-black text-blue-400 font-mono tracking-tight">
              {loading ? '...' : totalRegistered}
            </span>
            <span className="text-xs text-zinc-500 font-medium">Distinct Registered Accounts</span>
          </div>

          <p className="mt-4 pt-4 border-t border-white/5 text-xs text-zinc-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Strict deduplication enforced • 1 record per registered user</span>
          </p>
        </div>

      </div>

      {/* REGISTERED ACCOUNTS DIRECTORY LIST */}
      <section className="bg-[#121212] border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
        
        {/* Section Header with Search Bar and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Registered Accounts Registry</span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                  {filteredUsers.length} Unique Accounts
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Verified registry of all unique accounts. Duplicates are automatically merged.
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
              placeholder="Search by name, email, org..."
              className="w-full bg-[#181818] border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#FFD700]"
            />
          </div>
        </div>

        {/* Accounts Table */}
        <div className="overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              <UserCheck className="w-8 h-8 text-zinc-600 mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-zinc-400">No registered accounts found</p>
              <p className="mt-1">Accounts will appear here automatically when users sign up.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                  <th className="pb-3 font-semibold">User &amp; Email</th>
                  <th className="pb-3 font-semibold">Organization / Workspace</th>
                  <th className="pb-3 font-semibold">Executive Role</th>
                  <th className="pb-3 font-semibold">Plan Tier</th>
                  <th className="pb-3 font-semibold">Joined Date</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((account) => {
                  const isMaster = account.isSuperAdmin || account.email === 'adnanakhan245@gmail.com';
                  const isCurrent = account.email === user?.email;
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
                                  MASTER ADMIN
                                </span>
                              )}
                              {isCurrent && !isMaster && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 shrink-0">
                                  YOU
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

                      {/* Organization / Workspace */}
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

                      {/* Status */}
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Active</span>
                        </span>
                      </td>

                      {/* Action (Delete / Remove) */}
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

      {/* Clean Status Banner */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#FFD700]" />
          <span>All telemetry data is synchronized live with the database and strictly deduplicated.</span>
        </div>
        <div className="font-mono text-[11px] text-zinc-500">
          Admin Session: {user?.email || 'Master Super Admin'}
        </div>
      </div>

    </div>
  );
};
