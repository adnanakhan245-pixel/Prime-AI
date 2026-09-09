import React, { useState, useEffect } from 'react';
import { 
  MessageSquarePlus, 
  Sparkles, 
  ThumbsUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Send, 
  Search, 
  Building2, 
  Tag, 
  ChevronRight, 
  Plus, 
  Flame, 
  History, 
  HelpCircle, 
  Lightbulb, 
  Bug, 
  ArrowUp,
  ShieldCheck,
  Zap,
  Calendar,
  Layers,
  Check,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  fetchAllFeedbacks, 
  submitFeedbackTicket, 
  upvoteFeedbackTicket, 
  fetchChangelogs 
} from '../services/db';
import { 
  FeedbackTicket, 
  FeedbackType, 
  FeedbackPriority, 
  FeedbackStatus, 
  ChangelogItem 
} from '../types';

interface FeedbackHubViewProps {
  onNavigate?: (view: string) => void;
}

const CATEGORIES = [
  'Ad Spend Optimizer',
  'Cash Flow Guard',
  'Documents Intel',
  'Executive Inbox',
  'CEO Digital Twin',
  'Agency White-Label',
  'Mobile iOS/APK',
  'Billing & Plans',
  'Security & Permissions',
  'General Platform'
];

export const FeedbackHubView: React.FC<FeedbackHubViewProps> = ({ onNavigate }) => {
  const { user, profile, company, companyId } = useAuth();

  const [activeTab, setActiveTab] = useState<'roadmap' | 'my-tickets' | 'new-ticket' | 'changelog'>('roadmap');
  const [tickets, setTickets] = useState<FeedbackTicket[]>([]);
  const [changelogs, setChangelogs] = useState<ChangelogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  // Form State
  const [ticketType, setTicketType] = useState<FeedbackType>('FEATURE_REQUEST');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [priority, setPriority] = useState<FeedbackPriority>('MEDIUM');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // Filter State for Roadmap
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'upvotes' | 'recent'>('upvotes');

  const loadData = async () => {
    setLoading(true);
    try {
      const [fData, cData] = await Promise.all([
        fetchAllFeedbacks(),
        fetchChangelogs()
      ]);
      setTickets(fData);
      setChangelogs(cData);
    } catch (err) {
      console.error('Error loading feedback data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpvote = async (ticketId: string) => {
    if (!user) return;
    try {
      const updated = await upvoteFeedbackTicket(ticketId, user.uid);
      if (updated) {
        setTickets(prev => prev.map(t => (t.id === ticketId ? updated : t)));
      }
    } catch (e) {
      console.error('Upvote failed', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !user) return;

    setSubmitting(true);
    setSubmitSuccess(false);

    try {
      const resolvedCompanyName = company?.name || profile?.companyName || 'Apex Technologies';
      const resolvedCompId = companyId || 'comp_default';

      const newTicket = await submitFeedbackTicket({
        companyId: resolvedCompId,
        companyName: resolvedCompanyName,
        userId: user.uid,
        userEmail: user.email || 'executive@company.com',
        userName: profile?.displayName || user.displayName || 'Executive Leader',
        type: ticketType,
        title: title.trim(),
        description: description.trim(),
        category,
        priority
      });

      // Quick AI Triage Advice
      if (ticketType === 'BUG') {
        setAiAnalysis(`AI Triage: Ticket #${newTicket.id.slice(-5)} logged with HIGH engineering priority. Expected turnaround: 24-48h. In the meantime, try clearing local cache or reviewing the recent release notes in the Changelog tab.`);
      } else if (ticketType === 'FEATURE_REQUEST') {
        setAiAnalysis(`AI Triage: Feature request #${newTicket.id.slice(-5)} added to the Product Voting Hub. When other companies upvote this, it automatically advances to our next sprint build.`);
      } else {
        setAiAnalysis(`AI Triage: Your feedback has been queued directly for the executive product team. Thank you for helping build PRIME AI.`);
      }

      setTickets(prev => [newTicket, ...prev]);
      setSubmitSuccess(true);
      setTitle('');
      setDescription('');
      
      // Switch to my tickets after brief delay or user action
    } catch (err) {
      console.error('Submit feedback error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Tickets for Roadmap
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'upvotes') {
      return (b.upvotes || 0) - (a.upvotes || 0);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const myCompanyTickets = tickets.filter(t => {
    if (companyId) return t.companyId === companyId;
    if (user) return t.userId === user.uid;
    return true;
  });

  const statusBadge = (status: FeedbackStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold">
            <Clock className="w-3 h-3" /> PENDING REVIEW
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-mono font-bold">
            <Search className="w-3 h-3" /> UNDER REVIEW
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] font-mono font-bold">
            <Zap className="w-3 h-3" /> IN DEVELOPMENT
          </span>
        );
      case 'PLANNED_FOR_NEXT_RELEASE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-[10px] font-mono font-bold">
            <Sparkles className="w-3 h-3" /> PLANNED FOR RELEASE
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
            <CheckCircle2 className="w-3 h-3" /> COMPLETED & RELEASED
          </span>
        );
      case 'DECLINED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-500/10 border border-zinc-500/30 text-zinc-400 text-[10px] font-mono font-bold">
            CLOSED
          </span>
        );
    }
  };

  const typeIcon = (type: FeedbackType) => {
    switch (type) {
      case 'BUG':
        return <Bug className="w-4 h-4 text-red-400" />;
      case 'FEATURE_REQUEST':
        return <Lightbulb className="w-4 h-4 text-amber-400" />;
      case 'IMPROVEMENT':
        return <Zap className="w-4 h-4 text-emerald-400" />;
      case 'COMPLAINT':
        return <AlertCircle className="w-4 h-4 text-orange-400" />;
      case 'BILLING':
        return <Tag className="w-4 h-4 text-blue-400" />;
    }
  };

  const priorityBadge = (priority: FeedbackPriority) => {
    switch (priority) {
      case 'URGENT':
        return <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 font-bold font-mono">URGENT</span>;
      case 'HIGH':
        return <span className="text-[10px] px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 font-bold font-mono">HIGH</span>;
      case 'MEDIUM':
        return <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold font-mono">MED</span>;
      case 'LOW':
        return <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-500/20 text-zinc-400 font-bold font-mono">LOW</span>;
    }
  };

  // Metrics
  const totalCount = tickets.length;
  const plannedCount = tickets.filter(t => t.status === 'PLANNED_FOR_NEXT_RELEASE').length;
  const inDevCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED').length;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-xs font-mono font-bold tracking-wide mb-3">
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>CUSTOMER VOICE & PRODUCT ROADMAP</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-white font-sans">
            Feedback, Requests & <span className="font-semibold text-[#FFD700]">Release Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-2xl leading-relaxed">
            Report bugs, request custom enterprise workflows, and vote on community features. We engineer every new version directly based on your company's operational needs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('new-ticket')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFD700] text-black hover:bg-[#FFD700]/90 font-bold text-xs shadow-lg shadow-[#FFD700]/10 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Ticket / Request</span>
          </button>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top Stat Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-white/10 space-y-1">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Total Requests</span>
            <Layers className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-light text-white font-mono">{totalCount}</div>
          <div className="text-[10px] text-zinc-500">Across all enterprise tenants</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-purple-500/20 space-y-1">
          <div className="text-[11px] font-mono text-purple-400 uppercase tracking-wider flex items-center justify-between">
            <span>In Engineering</span>
            <Zap className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-light text-purple-400 font-mono">{inDevCount}</div>
          <div className="text-[10px] text-purple-400/60">Active in dev sprint</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-[#FFD700]/20 space-y-1">
          <div className="text-[11px] font-mono text-[#FFD700] uppercase tracking-wider flex items-center justify-between">
            <span>Next Release</span>
            <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
          </div>
          <div className="text-2xl sm:text-3xl font-light text-[#FFD700] font-mono">{plannedCount}</div>
          <div className="text-[10px] text-[#FFD700]/60">Scheduled for v2.4.0</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-emerald-500/20 space-y-1">
          <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider flex items-center justify-between">
            <span>Completed</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-light text-emerald-400 font-mono">{resolvedCount}</div>
          <div className="text-[10px] text-emerald-400/60">Live in production</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'roadmap'
              ? 'border-[#FFD700] text-[#FFD700]'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Feature Voting & Roadmap</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 font-mono text-white/70">
            {tickets.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('my-tickets')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'my-tickets'
              ? 'border-[#FFD700] text-[#FFD700]'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>My Company's Tickets</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 font-mono text-white/70">
            {myCompanyTickets.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('new-ticket')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'new-ticket'
              ? 'border-[#FFD700] text-[#FFD700]'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Submit Request / Complaint</span>
        </button>

        <button
          onClick={() => setActiveTab('changelog')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'changelog'
              ? 'border-[#FFD700] text-[#FFD700]'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Changelog & Releases</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
            v2.3.0
          </span>
        </button>
      </div>

      {/* TAB 1: FEATURE VOTING & ROADMAP */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0D0D0D] border border-white/10">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search requests by title, module, or company..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/40 focus:outline-none focus:border-[#FFD700]/50"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FFD700]/50"
              >
                <option value="ALL" className="bg-[#111]">All Types</option>
                <option value="FEATURE_REQUEST" className="bg-[#111]">Feature Requests</option>
                <option value="IMPROVEMENT" className="bg-[#111]">Improvements</option>
                <option value="BUG" className="bg-[#111]">Bugs & Glitches</option>
                <option value="COMPLAINT" className="bg-[#111]">Complaints</option>
                <option value="BILLING" className="bg-[#111]">Billing</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FFD700]/50"
              >
                <option value="ALL" className="bg-[#111]">All Statuses</option>
                <option value="PENDING" className="bg-[#111]">Pending</option>
                <option value="UNDER_REVIEW" className="bg-[#111]">Under Review</option>
                <option value="IN_PROGRESS" className="bg-[#111]">In Development</option>
                <option value="PLANNED_FOR_NEXT_RELEASE" className="bg-[#111]">Planned Release</option>
                <option value="RESOLVED" className="bg-[#111]">Completed</option>
              </select>

              {/* Sort Switcher */}
              <button
                onClick={() => setSortBy(sortBy === 'upvotes' ? 'recent' : 'upvotes')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-all cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#FFD700]" />
                <span>Sort: {sortBy === 'upvotes' ? 'Most Upvoted' : 'Most Recent'}</span>
              </button>
            </div>
          </div>

          {/* Ticket Cards List */}
          {filteredTickets.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#0D0D0D] border border-white/10 space-y-3">
              <MessageSquarePlus className="w-10 h-10 text-zinc-600 mx-auto" />
              <div className="text-white font-medium text-sm">No tickets found matching your criteria</div>
              <p className="text-xs text-zinc-500">Be the first to submit a feature idea or report an issue!</p>
              <button
                onClick={() => setActiveTab('new-ticket')}
                className="px-4 py-2 rounded-xl bg-[#FFD700] text-black font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer mt-2"
              >
                <Plus className="w-3.5 h-3.5" /> Submit Request
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredTickets.map(ticket => {
                const hasUpvoted = user && ticket.upvotedBy?.includes(user.uid);
                return (
                  <div
                    key={ticket.id}
                    className="p-5 rounded-2xl bg-[#0D0D0D] hover:bg-[#121212] border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
                  >
                    {/* Left: Upvote button & Info */}
                    <div className="flex items-start gap-4 flex-1">
                      {/* Upvote Button */}
                      <button
                        onClick={() => handleUpvote(ticket.id)}
                        className={`flex flex-col items-center justify-center w-12 h-14 rounded-xl border transition-all cursor-pointer shrink-0 ${
                          hasUpvoted
                            ? 'bg-[#FFD700]/20 border-[#FFD700] text-[#FFD700] shadow-sm shadow-[#FFD700]/20'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white'
                        }`}
                        title={hasUpvoted ? 'Remove your vote' : 'Upvote this request'}
                      >
                        <ArrowUp className={`w-4 h-4 ${hasUpvoted ? 'text-[#FFD700]' : 'text-zinc-400'}`} />
                        <span className="text-xs font-mono font-bold mt-0.5">{ticket.upvotes || 0}</span>
                      </button>

                      {/* Content */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-white/70 font-mono">
                            {typeIcon(ticket.type)}
                            <span className="capitalize">{ticket.type.toLowerCase().replace('_', ' ')}</span>
                          </span>
                          <span className="text-zinc-600">•</span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-zinc-300 font-mono">
                            {ticket.category}
                          </span>
                          {priorityBadge(ticket.priority)}
                          {statusBadge(ticket.status)}
                          {ticket.targetReleaseVersion && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFD700]/15 text-[#FFD700] font-mono font-bold">
                              🎯 {ticket.targetReleaseVersion}
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-[#FFD700] transition-colors">
                          {ticket.title}
                        </h3>

                        <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">
                          {ticket.description}
                        </p>

                        {/* Admin Reply Quote if present */}
                        {ticket.adminReply && (
                          <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-[11px] text-emerald-400">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Official Response from PRIME Engineering:</span>
                            </div>
                            <p className="text-xs text-emerald-200/90 leading-relaxed">{ticket.adminReply}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-[11px] text-zinc-500 pt-1">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-zinc-400" />
                            {ticket.companyName}
                          </span>
                          <span>•</span>
                          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY COMPANY'S TICKETS */}
      {activeTab === 'my-tickets' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Tickets logged by {company?.name || 'Your Company'}</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Track real-time engineering status and version targets for your specific requests.</p>
            </div>
            <button
              onClick={() => setActiveTab('new-ticket')}
              className="px-3.5 py-1.5 rounded-xl bg-[#FFD700] text-black font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> New Ticket
            </button>
          </div>

          {myCompanyTickets.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#0D0D0D] border border-white/10 space-y-3">
              <Building2 className="w-10 h-10 text-zinc-600 mx-auto" />
              <div className="text-white font-medium text-sm">Your company hasn't submitted any tickets yet</div>
              <p className="text-xs text-zinc-500">Need a custom feature or want to report an issue? Let us know!</p>
              <button
                onClick={() => setActiveTab('new-ticket')}
                className="px-4 py-2 rounded-xl bg-[#FFD700] text-black font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer mt-2"
              >
                <Plus className="w-3.5 h-3.5" /> Submit First Request
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myCompanyTickets.map(ticket => (
                <div
                  key={ticket.id}
                  className="p-5 rounded-2xl bg-[#0D0D0D] border border-white/10 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {statusBadge(ticket.status)}
                      <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-zinc-300 font-mono">
                        {ticket.category}
                      </span>
                      {priorityBadge(ticket.priority)}
                      {ticket.targetReleaseVersion && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFD700]/15 text-[#FFD700] font-mono font-bold">
                          🎯 Scheduled: {ticket.targetReleaseVersion}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-zinc-500 font-mono">
                      Ticket ID: #{ticket.id.slice(-6)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{ticket.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{ticket.description}</p>

                  {ticket.adminReply && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-[11px] text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Admin Engineering Reply:</span>
                      </div>
                      <p className="text-xs text-emerald-200/90 leading-relaxed">{ticket.adminReply}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-white/5">
                    <span>Submitted on: {new Date(ticket.createdAt).toLocaleString()}</span>
                    <span className="flex items-center gap-1 text-[#FFD700] font-bold">
                      <ArrowUp className="w-3.5 h-3.5" /> {ticket.upvotes || 1} Votes
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SUBMIT NEW TICKET / REQUEST */}
      {activeTab === 'new-ticket' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="p-6 rounded-3xl bg-[#0D0D0D] border border-white/10 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Submit a Complaint, Bug or Feature Request</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Tell us what you need or what broke. Our engineering team reviews all submissions daily and incorporates them into bi-weekly production releases.
              </p>
            </div>

            {submitSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ticket Logged Successfully!</span>
                </div>
                {aiAnalysis && (
                  <p className="text-emerald-300/90 leading-relaxed font-mono text-[11px] bg-black/30 p-3 rounded-xl border border-emerald-500/20">
                    {aiAnalysis}
                  </p>
                )}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('my-tickets')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-bold text-xs cursor-pointer"
                  >
                    View My Tickets
                  </button>
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="text-xs text-emerald-300 underline cursor-pointer"
                  >
                    Submit Another
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2">
                  Request Type <span className="text-[#FFD700]">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { type: 'FEATURE_REQUEST', label: 'Feature Idea', icon: Lightbulb, color: 'text-amber-400' },
                    { type: 'IMPROVEMENT', label: 'Improvement', icon: Zap, color: 'text-emerald-400' },
                    { type: 'BUG', label: 'Bug / Error', icon: Bug, color: 'text-red-400' },
                    { type: 'COMPLAINT', label: 'Complaint', icon: AlertCircle, color: 'text-orange-400' },
                    { type: 'BILLING', label: 'Billing/Plan', icon: Tag, color: 'text-blue-400' },
                  ].map(item => {
                    const Icon = item.icon;
                    const isSelected = ticketType === item.type;
                    return (
                      <button
                        type="button"
                        key={item.type}
                        onClick={() => setTicketType(item.type as FeedbackType)}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#FFD700]/10 border-[#FFD700] text-white shadow-sm'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/60'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-[#FFD700]' : item.color}`} />
                        <span className="text-[11px] font-bold">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Module & Priority Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Affected Module / Section <span className="text-[#FFD700]">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FFD700]/50"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c} className="bg-[#111]">{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Business Urgency / Priority <span className="text-[#FFD700]">*</span>
                  </label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as FeedbackPriority)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FFD700]/50"
                  >
                    <option value="LOW" className="bg-[#111]">Low (Nice to have)</option>
                    <option value="MEDIUM" className="bg-[#111]">Medium (Normal business impact)</option>
                    <option value="HIGH" className="bg-[#111]">High (Significant operational bottleneck)</option>
                    <option value="URGENT" className="bg-[#111]">Urgent 🔴 (Blocks revenue or critical flow)</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Headline / Summary <span className="text-[#FFD700]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Automated WhatsApp alert when payment is overdue by 7 days"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-[#FFD700]/50"
                  required
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Detailed Description & Expected Behavior <span className="text-[#FFD700]">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the exact problem, step-by-step reproduction, or how this new feature will help your company grow and save time..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-[#FFD700]/50 leading-relaxed"
                  required
                />
              </div>

              {/* Submit Action */}
              <div className="pt-2 flex items-center justify-between">
                <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Submitted from {company?.name || 'Your Company Workspace'}</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !title.trim() || !description.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FFD700] text-black font-bold text-xs hover:bg-[#FFD700]/90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#FFD700]/10"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Logging to Engineering...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit to Product Team</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: CHANGELOG & RELEASE NOTES */}
      {activeTab === 'changelog' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Continuous Delivery & Production Changelog</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Every release includes requested improvements and fixes contributed by our B2B client community.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              <Check className="w-3.5 h-3.5" /> LIVE ON V2.3.0
            </div>
          </div>

          <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-white/10">
            {changelogs.map((item, idx) => (
              <div key={item.version} className="relative pl-10 space-y-3">
                {/* Timeline Dot */}
                <div className={`absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full -translate-x-1/2 border-2 ${
                  idx === 0 ? 'bg-[#FFD700] border-black ring-4 ring-[#FFD700]/20' : 'bg-zinc-700 border-black'
                }`} />

                <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-white/10 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white font-mono bg-white/10 px-2 py-0.5 rounded">
                        {item.version}
                      </span>
                      <span className="text-xs font-bold text-[#FFD700]">
                        {item.title}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500 font-mono">{item.releaseDate}</span>
                  </div>

                  {item.requestedByCompany && (
                    <div className="inline-flex items-center gap-1 text-[11px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 font-mono">
                      <Sparkles className="w-3 h-3" /> Requested by: {item.requestedByCompany}
                    </div>
                  )}

                  <ul className="space-y-2 text-xs text-zinc-300 pt-2 border-t border-white/5">
                    {item.changes.map((change, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-[#FFD700] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
