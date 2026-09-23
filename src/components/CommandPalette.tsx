import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Sparkles, 
  LayoutDashboard, 
  Inbox, 
  Radar, 
  Mic, 
  Users, 
  Video, 
  TrendingUp, 
  Target, 
  DollarSign,
  Calculator,
  Briefcase, 
  FileText, 
  BrainCircuit, 
  Settings, 
  Volume2, 
  Zap, 
  ChevronRight, 
  ArrowRight,
  ShieldAlert,
  Send,
  Plus,
  History,
  Clock,
  Trash2,
  CornerDownLeft,
  MessageSquarePlus,
  CheckSquare
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  onOpenVoiceHUD: () => void;
  onOpenSettings: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'NAVIGATION' | 'AI_ACTION' | 'SYSTEM';
  icon: React.ReactNode;
  action: () => void;
  badge?: string;
}

const STORAGE_KEY = 'prime_recent_queries';
const DEFAULT_RECENT_QUERIES = [
  'Run Growth Lab revenue teardown',
  'Triage unread VIP inbox emails',
  'Audit contract liabilities & redlines',
  'Check pipeline risk on Revenue Radar',
  'Launch Executive Voice War Room HUD'
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenVoiceHUD,
  onOpenSettings
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent queries from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setRecentQueries(JSON.parse(saved));
      } else {
        setRecentQueries(DEFAULT_RECENT_QUERIES);
      }
    } catch (e) {
      setRecentQueries(DEFAULT_RECENT_QUERIES);
    }
  }, []);

  const saveRecentQuery = (q: string) => {
    if (!q || !q.trim()) return;
    const clean = q.trim();
    setRecentQueries(prev => {
      const updated = [clean, ...prev.filter(item => item.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const removeRecentQuery = (e: React.MouseEvent, qToRemove: string) => {
    e.stopPropagation();
    setRecentQueries(prev => {
      const updated = prev.filter(item => item !== qToRemove);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const clearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentQueries([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const allCommands: CommandItem[] = [
    {
      id: 'cmd-voice',
      title: 'Launch Executive Voice War Room HUD',
      subtitle: 'Hands-free voice mode with real-time audio synthesis & vocal briefing',
      category: 'AI_ACTION',
      icon: <Mic className="w-4 h-4 text-[#FFD700]" />,
      action: () => {
        saveRecentQuery('Launch Executive Voice War Room HUD');
        onOpenVoiceHUD();
      },
      badge: 'VOICE AI'
    },
    {
      id: 'cmd-twin',
      title: 'CEO Digital Twin & Tone Matrix Clone',
      subtitle: 'Calibrate voice heuristics, clone executive communication style & test scenarios',
      category: 'AI_ACTION',
      icon: <Sparkles className="w-4 h-4 text-[#FFD700]" />,
      action: () => {
        saveRecentQuery('Open CEO Digital Twin Persona');
        onNavigate('twin');
      },
      badge: 'CLONE 3.0'
    },
    {
      id: 'cmd-approvals',
      title: 'AI Approvals Log & Human Safety Sentry',
      subtitle: 'Review pending AI actions, approve/reject tasks, and access 2-minute undo safety window',
      category: 'AI_ACTION',
      icon: <CheckSquare className="w-4 h-4 text-emerald-400" />,
      action: () => {
        saveRecentQuery('Review AI Approvals & Undo Window');
        onNavigate('approvals');
      },
      badge: 'LOG'
    },
    {
      id: 'cmd-draft',
      title: 'Triage & Run 3-Line Executive Email Draft',
      subtitle: 'Synthesize unread executive messages with Chief of Staff response',
      category: 'AI_ACTION',
      icon: <Inbox className="w-4 h-4 text-[#FFD700]" />,
      action: () => {
        saveRecentQuery('Triage unread VIP inbox emails');
        onNavigate('inbox');
      },
      badge: 'POPULAR'
    },
    {
      id: 'cmd-roi-calc',
      title: 'Executive ROI & Cost Justification Calculator (D3.js)',
      subtitle: 'Model monthly financial returns, ad waste savings, and software cost justification',
      category: 'AI_ACTION',
      icon: <Calculator className="w-4 h-4 text-[#FFD700]" />,
      action: () => {
        saveRecentQuery('Executive ROI & Cost Justification Calculator');
        onNavigate('roi-calculator');
      },
      badge: 'D3.JS'
    },
    {
      id: 'cmd-growth-audit',
      title: 'Run Real-time Growth Lab Teardown',
      subtitle: 'Benchmark 12-month ARR trajectory, conversion levers, and pricing friction',
      category: 'AI_ACTION',
      icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
      action: () => {
        saveRecentQuery('Run Growth Lab revenue teardown');
        onNavigate('growth');
      },
      badge: 'RECHARTS'
    },
    {
      id: 'cmd-ad-spend',
      title: 'Audit Ad Spend & CAC Waste (Google, Meta, TikTok)',
      subtitle: 'Audit ROAS, compute true CAC, and eliminate unprofitable ad channel bleed',
      category: 'AI_ACTION',
      icon: <Target className="w-4 h-4 text-emerald-400" />,
      action: () => {
        saveRecentQuery('Audit Ad Spend & CAC Waste');
        onNavigate('ad-spend');
      },
      badge: 'SAVE $'
    },
    {
      id: 'cmd-cashflow-guard',
      title: 'Cash Flow Guard & Overdue Invoice Recovery',
      subtitle: 'Send 1-click WhatsApp/Email escalation notices and eliminate gateway fee bleed',
      category: 'AI_ACTION',
      icon: <DollarSign className="w-4 h-4 text-blue-400" />,
      action: () => {
        saveRecentQuery('Cash Flow Guard & Invoices');
        onNavigate('cashflow-guard');
      },
      badge: 'RECOVER'
    },
    {
      id: 'cmd-radar',
      title: 'Audit Revenue Radar & Stalled Deals',
      subtitle: 'Detect deal slippage risks, contract liabilities, and pipeline velocity',
      category: 'AI_ACTION',
      icon: <Radar className="w-4 h-4 text-amber-400" />,
      action: () => {
        saveRecentQuery('Check pipeline risk on Revenue Radar');
        onNavigate('radar');
      }
    },
    {
      id: 'cmd-board',
      title: 'Generate 90-Day Strategy Board & Board Pack',
      subtitle: 'Synthesize quarterly OKRs, strategic battleplans, and shareholder deck',
      category: 'AI_ACTION',
      icon: <Briefcase className="w-4 h-4 text-[#FFD700]" />,
      action: () => {
        saveRecentQuery('Generate 90-Day Board Pack summary');
        onNavigate('board-pack');
      }
    },
    {
      id: 'cmd-closer',
      title: 'Analyze Sales Call Transcript (Closer AI)',
      subtitle: 'Identify buyer hesitation, objection counters, and closing probability',
      category: 'AI_ACTION',
      icon: <Zap className="w-4 h-4 text-yellow-400" />,
      action: () => {
        saveRecentQuery('Analyze Sales Call Transcript (Closer AI)');
        onNavigate('closer');
      }
    },
    {
      id: 'nav-dash',
      title: 'Go to Command Center (Dashboard)',
      subtitle: 'Daily COO briefing, key operational metrics & executive decision cards',
      category: 'NAVIGATION',
      icon: <LayoutDashboard className="w-4 h-4 text-white/70" />,
      action: () => {
        saveRecentQuery('Go to Command Center (Dashboard)');
        onNavigate('dashboard');
      }
    },
    {
      id: 'nav-inbox',
      title: 'Go to Executive Inbox Triage',
      subtitle: 'VIP priority filtering, 1-click approvals, and email synthesizer',
      category: 'NAVIGATION',
      icon: <Inbox className="w-4 h-4 text-white/70" />,
      action: () => {
        saveRecentQuery('Go to Executive Inbox Triage');
        onNavigate('inbox');
      }
    },
    {
      id: 'nav-meetings',
      title: 'Go to Meeting AI Synthesizer',
      subtitle: 'Real-time audio upload, summary cards, and owner assignments',
      category: 'NAVIGATION',
      icon: <Video className="w-4 h-4 text-white/70" />,
      action: () => {
        saveRecentQuery('Go to Meeting AI Synthesizer');
        onNavigate('meetings');
      }
    },
    {
      id: 'nav-hiring',
      title: 'Go to Hiring AI Executive Screener',
      subtitle: 'Score executive candidates, resume rubrics, and culture alignment',
      category: 'NAVIGATION',
      icon: <Users className="w-4 h-4 text-white/70" />,
      action: () => {
        saveRecentQuery('Go to Hiring AI Executive Screener');
        onNavigate('hiring');
      }
    },
    {
      id: 'nav-docs',
      title: 'Go to Document Intelligence & Redline',
      subtitle: 'Review enterprise MSAs, uncapped liabilities, and NDA clauses',
      category: 'NAVIGATION',
      icon: <FileText className="w-4 h-4 text-white/70" />,
      action: () => {
        saveRecentQuery('Audit contract liabilities & redlines');
        onNavigate('docs');
      }
    },
    {
      id: 'nav-brain',
      title: 'Go to Neural Operational Brain',
      subtitle: 'Executive intelligence assistant for complex ad-hoc strategic inquiries',
      category: 'NAVIGATION',
      icon: <BrainCircuit className="w-4 h-4 text-white/70" />,
      action: () => {
        saveRecentQuery('Go to Neural Operational Brain');
        onNavigate('brain');
      }
    },
    {
      id: 'nav-feedback',
      title: 'Complaints, Requests & Product Roadmap',
      subtitle: 'Submit company feature requests, report issues, and vote on upcoming versions',
      category: 'NAVIGATION',
      icon: <MessageSquarePlus className="w-4 h-4 text-[#FFD700]" />,
      action: () => {
        saveRecentQuery('Submit feature request or bug report');
        onNavigate('feedback');
      }
    },
    {
      id: 'sys-settings',
      title: 'Open Executive Settings & API Keys',
      subtitle: 'Configure company profile, AI parameters, integrations, and branding',
      category: 'SYSTEM',
      icon: <Settings className="w-4 h-4 text-white/70" />,
      action: onOpenSettings
    }
  ];

  const handleSelectRecentQuery = (recentText: string) => {
    saveRecentQuery(recentText);
    const matched = allCommands.find(c => 
      c.title.toLowerCase().includes(recentText.toLowerCase()) ||
      recentText.toLowerCase().includes(c.title.toLowerCase())
    );

    if (matched) {
      matched.action();
      onClose();
    } else {
      setQuery(recentText);
    }
  };

  const filteredCommands = allCommands.filter(c => 
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.subtitle.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        } else if (query.trim()) {
          saveRecentQuery(query);
          onNavigate('brain');
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, query, filteredCommands]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#111111] border border-white/10 rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.8)] overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Search Bar Input */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/[0.02]">
          <Search className="w-5 h-5 text-[#FFD700] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, search modules, or ask PRIME AI... (e.g. 'growth', 'voice', 'inbox')"
            className="w-full bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-white/40 hover:text-white px-2 py-0.5 rounded bg-white/5 cursor-pointer"
            >
              Clear
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-white/40 bg-white/5 border border-white/10 rounded">
            ESC
          </kbd>
        </div>

        {/* Scrollable Container with Recent Queries + Command List */}
        <div className="overflow-y-auto p-2 space-y-3">
          {/* RECENT STRATEGIC QUERIES SECTION (Visible when search is empty or has matching items) */}
          {query === '' && recentQueries.length > 0 && (
            <div className="p-2 space-y-2 bg-white/[0.02] rounded-xl border border-white/5">
              <div className="flex items-center justify-between px-2 text-[11px] font-mono uppercase tracking-wider text-white/50">
                <span className="flex items-center gap-1.5 text-[#FFD700]">
                  <History className="w-3.5 h-3.5" /> Recent Strategic Queries
                </span>
                <button
                  onClick={clearAllRecent}
                  className="hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer text-[10px]"
                  title="Clear history"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {recentQueries.map((rq, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectRecentQuery(rq)}
                    className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-[#FFD700]/15 border border-white/10 hover:border-[#FFD700]/30 text-white/80 hover:text-white text-xs font-medium transition-all cursor-pointer shadow-sm"
                  >
                    <Clock className="w-3 h-3 text-[#FFD700]/70 group-hover:text-[#FFD700]" />
                    <span className="truncate max-w-[280px]">{rq}</span>
                    <button
                      onClick={(e) => removeRecentQuery(e, rq)}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-0.5 rounded cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results List */}
          <div className="space-y-1 divide-y divide-white/[0.03]">
            {filteredCommands.length === 0 ? (
              <div className="p-8 text-center text-white/40 space-y-2">
                <Sparkles className="w-6 h-6 mx-auto text-white/20" />
                <p className="text-xs">No matching commands found for "{query}"</p>
                <button
                  onClick={() => {
                    saveRecentQuery(query);
                    onNavigate('brain');
                    onClose();
                  }}
                  className="mt-2 text-xs font-bold text-[#FFD700] hover:underline flex items-center gap-1.5 mx-auto cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Ask Neural Brain "{query}" →
                </button>
              </div>
            ) : (
              filteredCommands.map((cmd, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={cmd.id}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#FFD700]/15 to-transparent border border-[#FFD700]/30 text-white'
                        : 'text-white/80 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#FFD700]/20 text-[#FFD700]' : 'bg-white/5 text-white/60'
                      }`}>
                        {cmd.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold truncate text-white">{cmd.title}</span>
                          {cmd.badge && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30 uppercase font-mono">
                              {cmd.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-white/40 truncate">{cmd.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isSelected && (
                        <span className="text-[10px] text-white/50 font-mono hidden sm:inline">Press ↵</span>
                      )}
                      <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-[#FFD700]' : 'text-white/20'}`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer info bar */}
        <div className="p-3 bg-black/50 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-[#FFD700]/80 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> PRIME AI v3.7
          </span>
        </div>
      </div>
    </div>
  );
};

