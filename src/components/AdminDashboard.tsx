import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  Building2, 
  TrendingUp, 
  ShieldCheck, 
  Search, 
  RefreshCw, 
  ExternalLink,
  Crown,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  Shield,
  Layers,
  MessageSquarePlus,
  Bug,
  Lightbulb,
  Zap,
  Tag,
  AlertCircle,
  Check,
  Send,
  SlidersHorizontal,
  Camera,
  Video,
  Share2,
  Mail,
  UserCheck,
  Copy
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchAdminDashboardData, fetchAllFeedbacks, updateFeedbackStatus } from '../services/db';
import { AdminDashboardData, AdminUserRecord, CompanySummary, FeedbackTicket, FeedbackStatus } from '../types';
import { MarketingStudio } from './MarketingStudio';

interface AdminDashboardProps {
  onNavigate?: (view: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user, profile, companyId, switchCompany, isAdmin } = useAuth();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [tickets, setTickets] = useState<FeedbackTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [switchingCompanyId, setSwitchingCompanyId] = useState<string | null>(null);
  const [adminTab, setAdminTab] = useState<'users' | 'tenants' | 'feedback' | 'marketing'>('users');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Selected ticket for admin response
  const [selectedTicket, setSelectedTicket] = useState<FeedbackTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [targetVersionText, setTargetVersionText] = useState('');
  const [statusSelect, setStatusSelect] = useState<FeedbackStatus>('IN_PROGRESS');
  const [savingStatus, setSavingStatus] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [res, fbList] = await Promise.all([
        fetchAdminDashboardData(),
        fetchAllFeedbacks()
      ]);
      setData(res);
      setTickets(fbList);
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setSavingStatus(true);
    try {
      const updated = await updateFeedbackStatus(
        selectedTicket.id,
        statusSelect,
        replyText.trim() || undefined,
        targetVersionText.trim() || undefined
      );
      if (updated) {
        setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updated : t));
        setSelectedTicket(null);
        setReplyText('');
        setTargetVersionText('');
      }
    } catch (err) {
      console.error('Error updating ticket:', err);
    } finally {
      setSavingStatus(false);
    }
  };

  const handleQuickStatus = async (ticketId: string, newStatus: FeedbackStatus) => {
    try {
      const updated = await updateFeedbackStatus(ticketId, newStatus);
      if (updated) {
        setTickets(prev => prev.map(t => t.id === ticketId ? updated : t));
      }
    } catch (e) {
      console.error('Quick status error:', e);
    }
  };

  const handleSwitchTenant = async (targetCompanyId: string) => {
    setSwitchingCompanyId(targetCompanyId);
    try {
      await switchCompany(targetCompanyId);
      if (onNavigate) {
        onNavigate('dashboard');
      }
    } finally {
      setSwitchingCompanyId(null);
    }
  };

  const filteredCompanies = data?.companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = planFilter === 'all' || c.plan.toLowerCase() === planFilter.toLowerCase();
    return matchesSearch && matchesPlan;
  }) || [];

  const filteredUsers = (data?.users || []).filter(u => {
    const q = userSearch.toLowerCase();
    const matchesQuery = !q || 
      u.displayName.toLowerCase().includes(q) || 
      u.email.toLowerCase().includes(q) || 
      u.companyName.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q);
    
    const matchesRole = userRoleFilter === 'all' || 
      (userRoleFilter === 'admin' && u.isSuperAdmin) ||
      (userRoleFilter === 'executive' && !u.isSuperAdmin);

    return matchesQuery && matchesRole;
  });

  const pendingTicketsCount = tickets.filter(t => t.status === 'PENDING').length;

  if (!isAdmin) {
    return (
      <div className="p-12 text-center space-y-4 rounded-3xl bg-[#0D0D0D] border border-red-500/20 max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Restricted Access (Master Owner Only)</h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          The Global Super Admin dashboard is strictly restricted to verified platform administrators. Company workspace leaders and tenant CEOs only have access to their dedicated tenant environment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-bold tracking-wide mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SUPER ADMIN COMMAND OS</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-white font-sans">
            Multi-Tenant <span className="font-semibold text-[#FFD700]">Admin Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            Global telemetry, aggregate MRR metrics, and tenant company workspace directory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* Metric Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total MRR */}
        <div className="p-6 rounded-2xl bg-[#141414] border border-[#FFD700]/30 relative overflow-hidden shadow-[0_0_30px_rgba(255,215,0,0.05)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Total MRR</span>
            <div className="w-8 h-8 rounded-lg bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#FFD700] mt-3 tracking-tight font-mono">
            ${data?.totalMRR.toLocaleString() || '0'}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+24.5% vs last month</span>
          </div>
        </div>

        {/* Total Users */}
        <div 
          onClick={() => setAdminTab('users')}
          className={`p-6 rounded-2xl bg-[#141414] border transition-all cursor-pointer hover:border-blue-500/50 ${
            adminTab === 'users' ? 'border-blue-500 bg-blue-500/[0.04] shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'border-white/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Total Users</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3 tracking-tight font-mono flex items-center justify-between">
            <span>{data?.totalUsers || '0'}</span>
            <span className="text-xs font-sans text-blue-400 font-normal hover:underline flex items-center gap-0.5">
              <span>View List</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-[11px] text-white/40 mt-2">
            Across {data?.totalCompanies || '0'} distinct enterprise companies
          </div>
        </div>

        {/* Active Companies */}
        <div 
          onClick={() => setAdminTab('tenants')}
          className={`p-6 rounded-2xl bg-[#141414] border transition-all cursor-pointer hover:border-emerald-500/50 ${
            adminTab === 'tenants' ? 'border-emerald-500 bg-emerald-500/[0.04] shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'border-white/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Active Companies</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3 tracking-tight font-mono flex items-center justify-between">
            <span>{data?.totalCompanies || '0'}</span>
            <span className="text-xs font-sans text-emerald-400 font-normal hover:underline flex items-center gap-0.5">
              <span>View Tenants</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-2">
            100% Isolated Supabase Tenants
          </div>
        </div>

        {/* Total Deal Pipeline */}
        <div className="p-6 rounded-2xl bg-[#141414] border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Pipeline Managed</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3 tracking-tight font-mono">
            ${((data?.totalPipelineARR || data?.totalPipelineValue || 0) / 1000000).toFixed(1)}M
          </div>
          <div className="text-[11px] text-white/40 mt-2">
            {data?.totalDeals || 0} active enterprise deals
          </div>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-px overflow-x-auto">
        <button
          onClick={() => setAdminTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            adminTab === 'users'
              ? 'border-blue-400 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 text-blue-400" />
          <span>Registered Users ({data?.users?.length || data?.totalUsers || 0})</span>
        </button>

        <button
          onClick={() => setAdminTab('tenants')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            adminTab === 'tenants'
              ? 'border-[#FFD700] text-[#FFD700] bg-[#FFD700]/5'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Tenant Workspaces ({data?.companies.length || 0})</span>
        </button>

        <button
          onClick={() => setAdminTab('marketing')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            adminTab === 'marketing'
              ? 'border-[#FFD700] text-[#FFD700] bg-[#FFD700]/5'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          <Camera className="w-4 h-4 text-[#FFD700]" />
          <span>📸 LinkedIn Media &amp; Video Kit</span>
          <span className="px-1.5 py-0.5 rounded-full bg-[#FFD700]/20 text-[#FFD700] text-[10px] font-mono font-bold">
            NEW
          </span>
        </button>

        <button
          onClick={() => setAdminTab('feedback')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            adminTab === 'feedback'
              ? 'border-[#FFD700] text-[#FFD700]'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>Customer Complaints &amp; Feature Requests</span>
          {pendingTicketsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold">
              {pendingTicketsCount} New
            </span>
          )}
        </button>
      </div>

      {/* Users Tab View */}
      {adminTab === 'users' && (
        <div className="rounded-2xl bg-[#121212] border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161616]">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Platform Registered Users Directory</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[11px] font-mono font-bold">
                  {filteredUsers.length} Active Accounts
                </span>
              </div>
              <p className="text-xs text-white/40 mt-0.5">
                Full directory of system administrators, enterprise seat holders, and verified tenant members.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, email, role..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="bg-[#0A0A0A] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500 w-56 sm:w-64 transition-colors"
                />
              </div>

              {/* Role Filter */}
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="admin">Super Admins Only</option>
                <option value="executive">Workspace Executives</option>
              </select>
            </div>
          </div>

          {/* Table View */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0D0D0D] text-white/40 uppercase tracking-wider font-mono text-[10px] border-b border-white/5">
                <tr>
                  <th className="py-3 px-5">User / Identity</th>
                  <th className="py-3 px-5">Role &amp; Privilege</th>
                  <th className="py-3 px-5">Company Workspace</th>
                  <th className="py-3 px-5">Plan</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Joined</th>
                  <th className="py-3 px-5">Last Activity</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-white/40 text-xs">
                      No registered users matched your query.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isCurrentUser = user?.email?.toLowerCase() === u.email.toLowerCase();
                    return (
                      <tr key={u.uid} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${
                              u.isSuperAdmin 
                                ? 'bg-[#FFD700]/15 border-[#FFD700]/40 text-[#FFD700]' 
                                : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                            }`}>
                              {u.displayName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{u.displayName}</span>
                                {u.isSuperAdmin && (
                                  <span className="px-1.5 py-0.2 rounded bg-[#FFD700]/20 text-[#FFD700] text-[9px] font-mono font-bold flex items-center gap-1">
                                    <Crown className="w-2.5 h-2.5" />
                                    SUPER ADMIN
                                  </span>
                                )}
                                {isCurrentUser && (
                                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-mono text-white/40 flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3 text-white/30" />
                                <span>{u.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-5">
                          <div className="font-medium text-white">{u.role}</div>
                          <div className="text-[10px] text-white/40">{u.isSuperAdmin ? 'Full Platform Control' : 'Workspace Scoped'}</div>
                        </td>

                        <td className="py-3.5 px-5">
                          <div className="font-medium text-white/90">{u.companyName}</div>
                          <div className="text-[10px] font-mono text-white/30">{u.companyId}</div>
                        </td>

                        <td className="py-3.5 px-5">
                          <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                            u.plan === 'Enterprise'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : u.plan === 'Pro'
                              ? 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30'
                              : 'bg-white/10 text-white/70 border border-white/10'
                          }`}>
                            {u.plan}
                          </span>
                        </td>

                        <td className="py-3.5 px-5">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                            <span className="capitalize">{u.status}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-5 font-mono text-[11px] text-white/40">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>

                        <td className="py-3.5 px-5 font-mono text-[11px] text-white/60">
                          {u.lastActive || 'Recent'}
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => handleCopyEmail(u.email)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/5 transition-colors cursor-pointer text-[10px] inline-flex items-center gap-1"
                            title="Copy user email"
                          >
                            {copiedEmail === u.email ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adminTab === 'marketing' && (
        <MarketingStudio onNavigate={onNavigate} />
      )}

      {adminTab === 'tenants' && (
        /* Companies Directory Table */
        <div className="rounded-2xl bg-[#121212] border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161616]">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#FFD700]" />
                <span>Registered Tenant Companies</span>
              </h2>
              <p className="text-xs text-white/40 mt-0.5">
                Isolated multi-tenant workspaces with automated deal partitioning.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search company or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#0A0A0A] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#FFD700] w-48 sm:w-56 transition-colors"
                />
              </div>

              {/* Plan Filter */}
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFD700] cursor-pointer"
              >
                <option value="all">All Plans</option>
                <option value="starter">Starter ($499)</option>
                <option value="pro">Pro ($999)</option>
                <option value="enterprise">Enterprise ($2999)</option>
              </select>
            </div>
          </div>

          {/* Table View */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0D0D0D] text-white/40 uppercase tracking-wider font-mono text-[10px] border-b border-white/5">
                <tr>
                  <th className="py-3 px-5">Company / Workspace</th>
                  <th className="py-3 px-5">Industry</th>
                  <th className="py-3 px-5">Plan Tier</th>
                  <th className="py-3 px-5">MRR</th>
                  <th className="py-3 px-5">Deals</th>
                  <th className="py-3 px-5">Pipeline</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {filteredCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-white/40 text-xs">
                      No tenant companies match your filter query.
                    </td>
                  </tr>
                ) : (
                  filteredCompanies.map((c) => {
                    const isCurrent = c.id === companyId;
                    return (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#181818] border border-white/10 flex items-center justify-center font-bold text-white text-xs">
                              {c.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{c.name}</span>
                                {isCurrent && (
                                  <span className="px-1.5 py-0.2 rounded bg-[#FFD700]/20 text-[#FFD700] text-[9px] font-mono font-bold">
                                    CURRENT
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] font-mono text-white/30">{c.id}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-5 text-white/60">
                          {c.industry}
                        </td>

                        <td className="py-3.5 px-5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.plan === 'Enterprise' 
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' 
                              : c.plan === 'Pro'
                              ? 'bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/30'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          }`}>
                            {c.plan}
                          </span>
                        </td>

                        <td className="py-3.5 px-5 font-mono font-bold text-white">
                          ${c.mrr.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-5 font-mono text-white/70">
                          {c.dealsCount ?? c.dealCount ?? 0}
                        </td>

                        <td className="py-3.5 px-5 font-mono text-white/70">
                          ${(c.pipelineValue / 1000).toFixed(0)}k
                        </td>

                        <td className="py-3.5 px-5">
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>Active</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => handleSwitchTenant(c.id)}
                            disabled={isCurrent || switchingCompanyId === c.id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ml-auto ${
                              isCurrent
                                ? 'bg-white/5 text-white/30 cursor-default'
                                : 'bg-white/10 hover:bg-[#FFD700] hover:text-black text-white'
                            }`}
                          >
                            <span>{isCurrent ? 'Active View' : 'Inspect Tenant'}</span>
                            {!isCurrent && <ArrowUpRight className="w-3 h-3" />}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adminTab === 'feedback' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#121212] border border-white/10 overflow-hidden">
            <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161616]">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <MessageSquarePlus className="w-4 h-4 text-[#FFD700]" />
                  <span>Company Feedback & Engineering Queue</span>
                </h2>
                <p className="text-xs text-white/40 mt-0.5">
                  Review client complaints, assign release versions (e.g. v2.4), and reply directly to tenant CEOs.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-mono">
                  {tickets.length} total tickets logged
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0D0D0D] text-white/40 uppercase tracking-wider font-mono text-[10px] border-b border-white/5">
                  <tr>
                    <th className="py-3 px-5">Ticket / Title</th>
                    <th className="py-3 px-5">Company</th>
                    <th className="py-3 px-5">Type</th>
                    <th className="py-3 px-5">Priority</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5">Target Release</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {tickets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-white/40 text-xs">
                        No customer feedback tickets logged yet.
                      </td>
                    </tr>
                  ) : (
                    tickets.map((t) => (
                      <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-5 max-w-xs">
                          <div className="font-bold text-white line-clamp-1">{t.title}</div>
                          <div className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{t.description}</div>
                          <div className="text-[10px] font-mono text-zinc-500 mt-1">
                            ID: #{t.id.slice(-6)} • {new Date(t.createdAt).toLocaleDateString()}
                          </div>
                        </td>

                        <td className="py-3.5 px-5">
                          <div className="font-semibold text-white">{t.companyName}</div>
                          <div className="text-[10px] text-zinc-400">{t.userEmail}</div>
                        </td>

                        <td className="py-3.5 px-5">
                          <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-zinc-300 font-mono">
                            {t.type}
                          </span>
                        </td>

                        <td className="py-3.5 px-5">
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold font-mono ${
                            t.priority === 'URGENT' ? 'bg-red-500/20 text-red-400' :
                            t.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                            t.priority === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-500/20 text-zinc-400'
                          }`}>
                            {t.priority}
                          </span>
                        </td>

                        <td className="py-3.5 px-5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                            t.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400' :
                            t.status === 'IN_PROGRESS' ? 'bg-purple-500/20 text-purple-400' :
                            t.status === 'PLANNED_FOR_NEXT_RELEASE' ? 'bg-[#FFD700]/20 text-[#FFD700]' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {t.status.replace(/_/g, ' ')}
                          </span>
                        </td>

                        <td className="py-3.5 px-5 font-mono text-[11px] text-zinc-300">
                          {t.targetReleaseVersion || '—'}
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => {
                              setSelectedTicket(t);
                              setStatusSelect(t.status);
                              setReplyText(t.adminReply || '');
                              setTargetVersionText(t.targetReleaseVersion || '');
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-[#FFD700] hover:text-black text-white transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <span>Manage / Reply</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ticket Response Modal */}
          {selectedTicket && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
              <div className="w-full max-w-xl p-6 rounded-3xl bg-[#111] border border-white/20 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <span className="text-[11px] font-mono text-zinc-400">Manage Ticket #{selectedTicket.id.slice(-6)}</span>
                    <h3 className="text-base font-bold text-white">{selectedTicket.title}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-white/5 text-xs text-zinc-300 space-y-1">
                  <div className="text-[10px] text-zinc-500 uppercase font-mono">Company Submission</div>
                  <p className="leading-relaxed">{selectedTicket.description}</p>
                </div>

                <form onSubmit={handleUpdateTicket} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">Status</label>
                    <select
                      value={statusSelect}
                      onChange={e => setStatusSelect(e.target.value as FeedbackStatus)}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FFD700]"
                    >
                      <option value="PENDING" className="bg-[#111]">Pending Review</option>
                      <option value="UNDER_REVIEW" className="bg-[#111]">Under Review</option>
                      <option value="IN_PROGRESS" className="bg-[#111]">In Development</option>
                      <option value="PLANNED_FOR_NEXT_RELEASE" className="bg-[#111]">Planned for Next Release</option>
                      <option value="RESOLVED" className="bg-[#111]">Resolved & Shipped</option>
                      <option value="DECLINED" className="bg-[#111]">Declined / Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">Target Version (e.g. v2.4.0)</label>
                    <input
                      type="text"
                      placeholder="e.g., v2.4.0 (Scheduled for Friday)"
                      value={targetVersionText}
                      onChange={e => setTargetVersionText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FFD700]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">Official Engineering Reply</label>
                    <textarea
                      rows={3}
                      placeholder="Write a direct reply to the company founder explaining the resolution or ETA..."
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FFD700]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(null)}
                      className="px-4 py-2 rounded-xl bg-white/5 text-white/70 text-xs font-bold hover:bg-white/10 cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={savingStatus}
                      className="px-5 py-2 rounded-xl bg-[#FFD700] text-black text-xs font-bold hover:bg-[#FFD700]/90 cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                      {savingStatus ? 'Saving...' : 'Update & Notify Company'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
