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
  Copy,
  Activity,
  Globe,
  Laptop,
  Smartphone,
  Eye,
  Filter,
  MousePointerClick,
  Calendar,
  BarChart3,
  Radio,
  UserPlus,
  Compass,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  fetchAdminDashboardData, 
  fetchAllFeedbacks, 
  updateFeedbackStatus, 
  logVisitorSession, 
  purgeAllMockDataAndResetLive,
  purgeDuplicateAdnanAccountsAndSessions,
  deleteVisitorSession,
  deleteAdminUserAccount
} from '../services/db';
import { AdminDashboardData, AdminUserRecord, CompanySummary, FeedbackTicket, FeedbackStatus, VisitorSessionRecord } from '../types';
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
  const [adminTab, setAdminTab] = useState<'traffic' | 'users' | 'tenants' | 'feedback' | 'marketing'>('traffic');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [trafficFilter, setTrafficFilter] = useState<'all' | 'today' | 'demo' | 'registered' | 'mobile'>('all');
  const [trafficSearch, setTrafficSearch] = useState('');
  const [simulatingTraffic, setSimulatingTraffic] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const handleSimulateTraffic = async (type: 'DEMO_GUEST' | 'REGISTERED_ACCOUNT') => {
    setSimulatingTraffic(true);
    try {
      const samplePaths = ['/inbox', '/closer', '/cashflow-guard', '/roi-calculator', '/marketing', '/strategy'];
      const randomPath = samplePaths[Math.floor(Math.random() * samplePaths.length)];
      const isReg = type === 'REGISTERED_ACCOUNT';
      const fakeEmail = isReg ? `executive.${Math.random().toString(36).substring(2, 6)}@enterprise.io` : undefined;
      const fakeName = isReg ? `Enterprise Executive` : undefined;

      await logVisitorSession({
        visitorType: type,
        userEmail: fakeEmail,
        userName: fakeName,
        companyName: isReg ? 'Apex Enterprise' : undefined,
        entryPath: randomPath
      });
      await loadData();
    } finally {
      setSimulatingTraffic(false);
    }
  };

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
      // Auto-clean any duplicate Adnan sessions/accounts ensuring only the 1 primary master admin is preserved
      await purgeDuplicateAdnanAccountsAndSessions();

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

  const todayKey = new Date().toISOString().split('T')[0];
  const allTrafficSessions = data?.visitorStats?.recentSessions || [];
  
  const filteredSessions = allTrafficSessions.filter(s => {
    const q = trafficSearch.toLowerCase();
    const matchesSearch = !q || 
      (s.userEmail && s.userEmail.toLowerCase().includes(q)) ||
      (s.userName && s.userName.toLowerCase().includes(q)) ||
      (s.entryPath && s.entryPath.toLowerCase().includes(q)) ||
      (s.browser && s.browser.toLowerCase().includes(q)) ||
      (s.referrer && s.referrer.toLowerCase().includes(q)) ||
      s.id.toLowerCase().includes(q);

    let matchesFilter = true;
    if (trafficFilter === 'today') {
      matchesFilter = s.dateKey === todayKey;
    } else if (trafficFilter === 'demo') {
      matchesFilter = s.visitorType === 'DEMO_GUEST' || s.visitorType === 'LANDING_VISITOR';
    } else if (trafficFilter === 'registered') {
      matchesFilter = s.visitorType === 'REGISTERED_ACCOUNT';
    } else if (trafficFilter === 'mobile') {
      matchesFilter = s.deviceType === 'Mobile' || s.deviceType === 'Tablet';
    }

    return matchesSearch && matchesFilter;
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
            onClick={async () => {
              if (window.confirm('کیا آپ اضافی ڈپلیکیٹ ریکارڈز ڈیلیٹ کر کے صرف اپنا اصل ماسٹر ایڈمن اکاؤنٹ (adnanakhan245@gmail.com) باقی رکھنا چاہتے ہیں؟')) {
                const res = await purgeDuplicateAdnanAccountsAndSessions();
                await loadData();
                alert(`کامیابی! اضافی ریکارڈز صاف کر دیے گئے ہیں۔ صرف اصل ماسٹر ایڈمن اکاؤنٹ باقی ہے۔ (Cleaned ${res.deletedSessions} duplicate sessions and ${res.deletedAccounts} accounts).`);
              }
            }}
            title="Keep only the 1 original Master Admin account and clean any duplicate records"
            className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-300 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>فالتو اکاؤنٹس صاف کریں (Keep Master Admin Only)</span>
          </button>
          <button
            onClick={async () => {
              if (window.confirm('کیا آپ واقعی تمام جعلی/سیمپل ڈیٹا، فرضی وزٹرز اور ڈیمو ریکارڈز کو فوری طور پر صاف کرنا چاہتے ہیں؟ (Are you sure you want to clean all mock/sample data?)')) {
                await purgeAllMockDataAndResetLive();
                await loadData();
              }
            }}
            title="Clean all sample/mock data & reset real traffic only"
            className="px-3.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-semibold text-red-400 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>جعلی ڈیٹا صاف کریں (Purge Mock Data)</span>
          </button>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Today's Live Visitors (NEW) */}
        <div 
          onClick={() => setAdminTab('traffic')}
          className={`p-5 rounded-2xl bg-[#141414] border transition-all cursor-pointer hover:border-amber-400/60 relative overflow-hidden ${
            adminTab === 'traffic' ? 'border-amber-400 bg-amber-500/[0.04] shadow-[0_0_25px_rgba(251,191,36,0.15)]' : 'border-white/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-bold">Today's Traffic</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div className="w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 tracking-tight font-mono flex items-baseline justify-between">
            <span>{data?.visitorStats?.totalVisitorsToday || 0}</span>
            <span className="text-[11px] font-sans font-medium text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {data?.visitorStats?.activeNowCount || 1} online
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-white/50 mt-2 font-mono">
            <span className="text-amber-300 font-semibold">{data?.visitorStats?.demoVisitorsToday || 0} Demo</span>
            <span>•</span>
            <span className="text-blue-400 font-semibold">{data?.visitorStats?.registeredUsersToday || 0} Account</span>
          </div>
        </div>

        {/* Total MRR */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-[#FFD700]/30 relative overflow-hidden shadow-[0_0_30px_rgba(255,215,0,0.05)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Total MRR</span>
            <div className="w-7 h-7 rounded-lg bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#FFD700] mt-2 tracking-tight font-mono">
            ${data?.totalMRR.toLocaleString() || '0'}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-white/50 mt-2 font-mono">
            <span className="text-emerald-400 font-semibold">{data?.paidCompaniesCount || 0} Paid</span>
            <span>•</span>
            <span>{data?.activeTrialsCount || 0} Trialing</span>
          </div>
        </div>

        {/* Total Users */}
        <div 
          onClick={() => setAdminTab('users')}
          className={`p-5 rounded-2xl bg-[#141414] border transition-all cursor-pointer hover:border-blue-500/50 ${
            adminTab === 'users' ? 'border-blue-500 bg-blue-500/[0.04] shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'border-white/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Total Users</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 tracking-tight font-mono flex items-center justify-between">
            <span>{data?.totalUsers || '0'}</span>
            <span className="text-xs font-sans text-blue-400 font-normal hover:underline flex items-center gap-0.5">
              <span>View</span>
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-[11px] text-white/40 mt-2 truncate">
            {data?.totalCompanies || '0'} enterprise tenants
          </div>
        </div>

        {/* Active Companies */}
        <div 
          onClick={() => setAdminTab('tenants')}
          className={`p-5 rounded-2xl bg-[#141414] border transition-all cursor-pointer hover:border-emerald-500/50 ${
            adminTab === 'tenants' ? 'border-emerald-500 bg-emerald-500/[0.04] shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'border-white/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Active Tenants</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 tracking-tight font-mono flex items-center justify-between">
            <span>{data?.totalCompanies || '0'}</span>
            <span className="text-xs font-sans text-emerald-400 font-normal hover:underline flex items-center gap-0.5">
              <span>Tenants</span>
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-2">
            100% Isolated Supabase
          </div>
        </div>

        {/* Total Deal Pipeline */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Pipeline ARR</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 tracking-tight font-mono">
            ${((data?.totalPipelineARR || data?.totalPipelineValue || 0) / 1000000).toFixed(1)}M
          </div>
          <div className="text-[11px] text-white/40 mt-2 truncate">
            {data?.totalDeals || 0} active deals
          </div>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-px overflow-x-auto">
        <button
          onClick={() => setAdminTab('traffic')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            adminTab === 'traffic'
              ? 'border-amber-400 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4 text-amber-400" />
          <span>Live Visitor Traffic (ڈیمو بمقابلہ اکاؤنٹ)</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE
          </span>
        </button>

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
          <span>Customer Feedback &amp; Bugs</span>
          {pendingTicketsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold">
              {pendingTicketsCount} New
            </span>
          )}
        </button>
      </div>

      {/* Live Visitor Traffic Tab View (NEW) */}
      {adminTab === 'traffic' && (
        <div className="space-y-6">
          {/* Traffic Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-[#121212] border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-white/50 text-xs font-mono">
                <span>TODAY'S TOTAL</span>
                <Activity className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-white mt-2">
                {data?.visitorStats?.totalVisitorsToday || 0}
              </div>
              <div className="text-[11px] text-white/40 mt-1">
                Unique visitor sessions today
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#121212] border border-amber-500/30 bg-amber-500/[0.02] flex flex-col justify-between">
              <div className="flex items-center justify-between text-amber-400/80 text-xs font-mono">
                <span>DEMO VISITORS</span>
                <Globe className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-300 mt-2">
                {data?.visitorStats?.demoVisitorsToday || 0}
              </div>
              <div className="text-[11px] text-amber-400/60 mt-1">
                Explored sandbox without login
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#121212] border border-blue-500/30 bg-blue-500/[0.02] flex flex-col justify-between">
              <div className="flex items-center justify-between text-blue-400/80 text-xs font-mono">
                <span>ACCOUNT LOGINS</span>
                <UserCheck className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-blue-400 mt-2">
                {data?.visitorStats?.registeredUsersToday || 0}
              </div>
              <div className="text-[11px] text-blue-400/60 mt-1">
                Logged in verified accounts
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#121212] border border-emerald-500/30 bg-emerald-500/[0.02] flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-400/80 text-xs font-mono">
                <span>LIVE NOW</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 mt-2">
                {data?.visitorStats?.activeNowCount || 1}
              </div>
              <div className="text-[11px] text-emerald-400/60 mt-1">
                Active in last 15 minutes
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#121212] border border-purple-500/30 bg-purple-500/[0.02] flex flex-col justify-between">
              <div className="flex items-center justify-between text-purple-400/80 text-xs font-mono">
                <span>CONVERSION RATE</span>
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-purple-300 mt-2">
                {data?.visitorStats?.conversionRateTodayPct || 0}%
              </div>
              <div className="text-[11px] text-purple-400/60 mt-1">
                Demo to registered signup
              </div>
            </div>
          </div>

          {/* 7-Day Trend Visual Breakdown */}
          {data?.visitorStats?.dailyTrend && data.visitorStats.dailyTrend.length > 0 && (
            <div className="rounded-2xl bg-[#121212] border border-white/10 p-5 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-white/5">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#FFD700]" />
                    <span>7-Day Traffic Flow (Demo Guests vs Registered Accounts)</span>
                  </h3>
                  <p className="text-xs text-white/40 mt-0.5">
                    Daily comparative volume showing people exploring via instant demo vs active authenticated users.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-amber-400/80 inline-block"></span>
                    <span className="text-amber-300">Demo Guests</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-blue-500/80 inline-block"></span>
                    <span className="text-blue-400">Account Logins</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-2">
                {data.visitorStats.dailyTrend.map((day) => {
                  const maxDayTotal = Math.max(...data.visitorStats!.dailyTrend.map(d => d.totalCount), 1);
                  const heightPct = Math.max(Math.round((day.totalCount / maxDayTotal) * 100), 12);
                  const isToday = day.formattedDate === 'Today';

                  return (
                    <div 
                      key={day.dateKey}
                      className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                        isToday 
                          ? 'bg-amber-400/[0.04] border-amber-400/40 shadow-[0_0_15px_rgba(251,191,36,0.1)]' 
                          : 'bg-[#161616] border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                        <span className={`font-bold ${isToday ? 'text-amber-400' : 'text-white/60'}`}>
                          {day.formattedDate}
                        </span>
                        <span className="text-white/40 text-[10px]">
                          {day.totalCount} total
                        </span>
                      </div>

                      {/* Mini visual bar */}
                      <div className="h-16 w-full bg-white/5 rounded-lg flex items-end p-1.5 gap-1 my-1">
                        <div 
                          style={{ height: `${day.totalCount > 0 ? Math.max((day.demoCount / (day.totalCount || 1)) * 100, 15) : 10}%` }}
                          className="flex-1 bg-amber-400/80 rounded-sm hover:bg-amber-300 transition-all"
                          title={`${day.demoCount} Demo Guests`}
                        />
                        <div 
                          style={{ height: `${day.totalCount > 0 ? Math.max((day.registeredCount / (day.totalCount || 1)) * 100, 15) : 10}%` }}
                          className="flex-1 bg-blue-500/80 rounded-sm hover:bg-blue-400 transition-all"
                          title={`${day.registeredCount} Registered Accounts`}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono mt-1 pt-1 border-t border-white/5 text-white/50">
                        <span className="text-amber-300/90">{day.demoCount}d</span>
                        <span className="text-blue-400/90">{day.registeredCount}a</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Live Visitor Session Feed */}
          <div className="rounded-2xl bg-[#121212] border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#161616]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <span>Real-Time Visitor &amp; Session Stream</span>
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-mono font-bold">
                    {filteredSessions.length} Filtered / {allTrafficSessions.length} Total
                  </span>
                </div>
                <p className="text-xs text-white/40 mt-0.5">
                  Live feed of individuals accessing the app, their entry point, device, and authentication mode.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by email, route, device..."
                    value={trafficSearch}
                    onChange={(e) => setTrafficSearch(e.target.value)}
                    className="bg-[#0A0A0A] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400 w-52 sm:w-60 transition-colors"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center bg-[#0A0A0A] border border-white/10 rounded-xl p-0.5 text-xs">
                  <button
                    onClick={() => setTrafficFilter('all')}
                    className={`px-2.5 py-1 rounded-lg transition-all font-mono text-[11px] cursor-pointer ${
                      trafficFilter === 'all' ? 'bg-white/15 text-white font-bold' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    All ({allTrafficSessions.length})
                  </button>
                  <button
                    onClick={() => setTrafficFilter('today')}
                    className={`px-2.5 py-1 rounded-lg transition-all font-mono text-[11px] cursor-pointer ${
                      trafficFilter === 'today' ? 'bg-amber-400/20 text-amber-300 font-bold' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    Today Only
                  </button>
                  <button
                    onClick={() => setTrafficFilter('demo')}
                    className={`px-2.5 py-1 rounded-lg transition-all font-mono text-[11px] cursor-pointer ${
                      trafficFilter === 'demo' ? 'bg-amber-400/20 text-amber-400 font-bold' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    Demo Guests
                  </button>
                  <button
                    onClick={() => setTrafficFilter('registered')}
                    className={`px-2.5 py-1 rounded-lg transition-all font-mono text-[11px] cursor-pointer ${
                      trafficFilter === 'registered' ? 'bg-blue-500/20 text-blue-400 font-bold' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    Accounts
                  </button>
                  <button
                    onClick={() => setTrafficFilter('mobile')}
                    className={`px-2.5 py-1 rounded-lg transition-all font-mono text-[11px] cursor-pointer ${
                      trafficFilter === 'mobile' ? 'bg-purple-500/20 text-purple-400 font-bold' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    Mobile
                  </button>
                </div>

                {/* Simulate / Quick Test Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSimulateTraffic('DEMO_GUEST')}
                    disabled={simulatingTraffic}
                    title="Simulate a new Demo Guest visitor"
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Globe className="w-3 h-3" />
                    <span>+ Test Demo Visit</span>
                  </button>
                  <button
                    onClick={() => handleSimulateTraffic('REGISTERED_ACCOUNT')}
                    disabled={simulatingTraffic}
                    title="Simulate a Registered Account login"
                    className="px-2.5 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>+ Test Account Login</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Table View */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0D0D0D] text-white/40 uppercase tracking-wider font-mono text-[10px] border-b border-white/5">
                  <tr>
                    <th className="py-3 px-5">Access Type</th>
                    <th className="py-3 px-5">Visitor Identity</th>
                    <th className="py-3 px-5">Active Screen / Route</th>
                    <th className="py-3 px-5">Device &amp; Browser</th>
                    <th className="py-3 px-5">Referral Source</th>
                    <th className="py-3 px-5">Activity Time</th>
                    <th className="py-3 px-5 text-right">Interactions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {filteredSessions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-white/40 text-xs">
                        No visitor sessions matched the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredSessions.map((s) => {
                      const isDemo = s.visitorType === 'DEMO_GUEST' || s.visitorType === 'LANDING_VISITOR';
                      const isToday = s.dateKey === todayKey;
                      const timeStr = new Date(s.lastActiveAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      });

                      return (
                        <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                          {/* Access Type Badge */}
                          <td className="py-3.5 px-5">
                            {s.convertedToSignup ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold">
                                <Sparkles className="w-3 h-3 text-purple-400" />
                                <span>CONVERTED TO ACCOUNT</span>
                              </span>
                            ) : isDemo ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold">
                                <Globe className="w-3 h-3 text-amber-400" />
                                <span>DEMO SANDBOX GUEST</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[10px] font-mono font-bold">
                                <UserCheck className="w-3 h-3 text-blue-400" />
                                <span>REGISTERED ACCOUNT</span>
                              </span>
                            )}
                          </td>

                          {/* Identity */}
                          <td className="py-3.5 px-5">
                            {s.userEmail ? (
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>{s.userName || s.userEmail.split('@')[0]}</span>
                                  {s.companyName && (
                                    <span className="text-[10px] text-white/40 font-normal">({s.companyName})</span>
                                  )}
                                </div>
                                <div className="text-[11px] font-mono text-white/50 flex items-center gap-1.5 mt-0.5">
                                  <span>{s.userEmail}</span>
                                  <button
                                    onClick={() => handleCopyEmail(s.userEmail!)}
                                    title="Copy Email"
                                    className="text-white/30 hover:text-white transition-colors cursor-pointer"
                                  >
                                    <Copy className="w-2.5 h-2.5" />
                                  </button>
                                  {copiedEmail === s.userEmail && (
                                    <span className="text-[9px] text-emerald-400 font-mono">Copied!</span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="font-medium text-amber-200/90 flex items-center gap-1">
                                  <span>Anonymous Guest</span>
                                  <span className="text-[10px] text-white/30 font-mono">#{s.id.slice(-4)}</span>
                                </div>
                                <div className="text-[10px] font-mono text-white/40 mt-0.5">
                                  Instant sandbox explorer (no login)
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Entry Route */}
                          <td className="py-3.5 px-5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 font-mono text-[11px] text-white/90">
                              <Compass className="w-3 h-3 text-amber-400" />
                              <span>{s.entryPath || '/'}</span>
                            </span>
                          </td>

                          {/* Device & Browser */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-1.5 text-xs text-white/80">
                              {s.deviceType === 'Mobile' ? (
                                <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                              ) : (
                                <Laptop className="w-3.5 h-3.5 text-blue-400" />
                              )}
                              <span>{s.deviceType} • {s.browser}</span>
                            </div>
                          </td>

                          {/* Referral */}
                          <td className="py-3.5 px-5">
                            <span className="text-xs text-white/60 font-mono">
                              {s.referrer || 'Direct Access'}
                            </span>
                          </td>

                          {/* Activity Time */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-1.5 text-xs font-mono text-white/80">
                              <Clock className="w-3.5 h-3.5 text-white/40" />
                              <span>{isToday ? `Today at ${timeStr}` : s.dateKey}</span>
                            </div>
                          </td>

                          {/* Actions Count & Delete */}
                          <td className="py-3.5 px-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70 font-mono text-[10px]">
                                {s.actionsCount || 1} actions
                              </span>
                              <button
                                onClick={async () => {
                                  if (window.confirm('کیا آپ اس سیشن لاگ کو ڈیلیٹ کرنا چاہتے ہیں؟')) {
                                    await deleteVisitorSession(s.id);
                                    await loadData();
                                  }
                                }}
                                title="Delete session log"
                                className="p-1 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

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

                        <td className="py-3.5 px-5 text-right flex items-center justify-end gap-2">
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

                          {!u.isSuperAdmin && !isCurrentUser && (
                            <button
                              onClick={async () => {
                                if (window.confirm(`کیا آپ واقعی اکاؤنٹ "${u.displayName}" (${u.email}) کو ڈیلیٹ کرنا چاہتے ہیں؟ اس سے ان کا سارا ٹرائل ڈیٹا اور پروفائل صاف ہو جائے گا۔`)) {
                                  await deleteAdminUserAccount({
                                    uid: u.uid,
                                    email: u.email,
                                    companyId: u.companyId
                                  });
                                  await loadData();
                                }
                              }}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-colors cursor-pointer text-[10px] inline-flex items-center gap-1"
                              title="Delete account and reset trial"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          )}
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
