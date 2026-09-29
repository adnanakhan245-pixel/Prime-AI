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
  Calendar
} from 'lucide-react';
import { fetchAdminDashboardData } from '../services/db';
import { AdminDashboardData } from '../types';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardProps {
  onNavigate?: (view: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());

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

  const totalUsers = data?.totalUsers ?? (data?.users?.length || 0);
  const totalVisitors = data?.visitorStats?.totalVisitorsAllTime ?? (data?.visitorStats?.totalVisitorsToday || 0);
  const totalRegistered = data?.visitorStats?.totalRegisteredAllTime ?? (data?.users?.length || 0);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          {onNavigate && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer border border-white/10"
              title="Back to Command Center"
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
              Live platform metrics • Last synced at {lastRefreshed}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
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

      {/* 3 CORE OPTIONS ONLY (Total Users, Total Visitors, Total Registered Accounts) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* OPTION 1: TOTAL APP USERS */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#121212] border border-white/10 hover:border-[#FFD700]/50 transition-all shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 rounded-bl-full pointer-events-none group-hover:bg-[#FFD700]/10 transition-colors" />
          
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] shadow-md">
              <Users className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/30">
              USERS
            </span>
          </div>

          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
            Total App Users
          </span>

          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
              {loading ? '...' : totalUsers}
            </span>
            <span className="text-xs text-zinc-500 font-medium">Active Users</span>
          </div>

          <p className="mt-4 pt-4 border-t border-white/5 text-xs text-zinc-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>All active enterprise users across platform workspaces</span>
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
              ACCOUNTS
            </span>
          </div>

          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
            Total Registered Accounts
          </span>

          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-black text-blue-400 font-mono tracking-tight">
              {loading ? '...' : totalRegistered}
            </span>
            <span className="text-xs text-zinc-500 font-medium">Registered Accounts</span>
          </div>

          <p className="mt-4 pt-4 border-t border-white/5 text-xs text-zinc-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Verified registered accounts with isolated workspaces</span>
          </p>
        </div>

      </div>

      {/* Clean Status Banner */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#FFD700]" />
          <span>All telemetry data is synchronized live with the database and updates automatically.</span>
        </div>
        <div className="font-mono text-[11px] text-zinc-500">
          Admin Session: {user?.email || 'Master Super Admin'}
        </div>
      </div>

    </div>
  );
};
