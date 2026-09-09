import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Cpu, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight, 
  Zap, 
  ShieldCheck, 
  Radar, 
  Inbox, 
  TrendingUp, 
  RefreshCw,
  Play
} from 'lucide-react';

interface AgentStatus {
  id: string;
  name: string;
  role: string;
  status: 'ACTIVE' | 'PROCESSING' | 'STANDBY';
  lastAction: string;
  latencyMs: number;
  tasksCompleted: number;
  icon: React.ReactNode;
  color: string;
}

export const AgentSwarmGrid: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('Just now');
  const [agents, setAgents] = useState<AgentStatus[]>([
    {
      id: 'agent-staff',
      name: 'Chief of Staff Agent',
      role: 'Executive Inbox & Calendar Triage',
      status: 'ACTIVE',
      lastAction: 'Synthesized 3-line reply for Acme Corp partner inquiry',
      latencyMs: 142,
      tasksCompleted: 48,
      icon: <Inbox className="w-4 h-4" />,
      color: '#FFD700'
    },
    {
      id: 'agent-deal',
      name: 'Deal Desk Revenue Sentry',
      role: 'Pipeline Stagnation & Slippage Guard',
      status: 'ACTIVE',
      lastAction: 'Flagged 11-day stagnation risk on Vanguard Health $180k deal',
      latencyMs: 180,
      tasksCompleted: 34,
      icon: <Radar className="w-4 h-4" />,
      color: '#F59E0B'
    },
    {
      id: 'agent-cro',
      name: 'Growth Lab CRO Auditor',
      role: 'Conversion Optimization & ARR Levers',
      status: 'ACTIVE',
      lastAction: 'Audited checkout funnels, unlocked +$38k MRR quarterly tier lever',
      latencyMs: 210,
      tasksCompleted: 29,
      icon: <TrendingUp className="w-4 h-4" />,
      color: '#10B981'
    },
    {
      id: 'agent-legal',
      name: 'Autonomous Legal & Redline Sentinel',
      role: 'Contract Risk & Indemnification Audit',
      status: 'STANDBY',
      lastAction: 'Counter-redlined Clause 14.2 uncapped liability MSA',
      latencyMs: 165,
      tasksCompleted: 22,
      icon: <ShieldCheck className="w-4 h-4" />,
      color: '#3B82F6'
    }
  ]);

  const handleRunSwarmCycle = () => {
    setSyncing(true);
    setTimeout(() => {
      setAgents(prev => prev.map(a => ({
        ...a,
        tasksCompleted: a.tasksCompleted + Math.floor(Math.random() * 3) + 1,
        latencyMs: Math.floor(130 + Math.random() * 60)
      })));
      setSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
  };

  return (
    <div className="p-6 rounded-2xl bg-[#121212] border border-white/5 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700]">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2 font-mono">
              Autonomous Agent Swarm Matrix
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                4 SUB-AGENTS ONLINE
              </span>
            </h3>
          </div>
          <p className="text-xs text-white/40">
            Real-time autonomous micro-agents monitoring communication, revenue slippage, contracts, and growth.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunSwarmCycle}
            disabled={syncing}
            className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#FFD700] ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Dispatching Swarm...' : 'Run Swarm Cycle'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {agents.map((agent) => (
          <div 
            key={agent.id}
            className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 transition-all space-y-3 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center border shadow-md"
                  style={{ 
                    backgroundColor: `${agent.color}15`, 
                    borderColor: `${agent.color}40`,
                    color: agent.color 
                  }}
                >
                  {agent.icon}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white group-hover:text-[#FFD700] transition-colors flex items-center gap-2">
                    {agent.name}
                  </h4>
                  <p className="text-[11px] text-white/40">{agent.role}</p>
                </div>
              </div>

              <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {agent.status}
              </span>
            </div>

            {/* Last Autonomous Action */}
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-white/80">
              <span className="text-[10px] text-white/40 uppercase tracking-wider block font-mono">Last Action:</span>
              <p className="mt-0.5 line-clamp-2 text-white/90">{agent.lastAction}</p>
            </div>

            {/* Metrics Footer */}
            <div className="flex items-center justify-between pt-1 text-[11px] text-white/40 font-mono">
              <div className="flex items-center gap-3">
                <span>Latency: <strong className="text-white">{agent.latencyMs}ms</strong></span>
                <span>Actions: <strong className="text-[#FFD700]">{agent.tasksCompleted}</strong></span>
              </div>
              <span className="text-emerald-400 font-bold">99.98% Uptime</span>
            </div>
          </div>
        ))}
      </div>

      {/* Global Swarm Telemetry Bar */}
      <div className="p-3 rounded-xl bg-black/60 border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-white/50">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <Zap className="w-3.5 h-3.5 text-[#FFD700]" />
            Throughput: <strong>133 decisions/hr</strong>
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            Model Pipeline: <strong>Gemini 3.7 Flash Engine</strong>
          </span>
        </div>
        <span className="text-[11px] text-white/40">Last Orchestration Sync: {lastSyncTime}</span>
      </div>
    </div>
  );
};
