import React, { useState } from 'react';
import { 
  Building2, 
  Globe, 
  Palette, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Layers, 
  Upload, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Lock, 
  RefreshCw,
  Sliders,
  FileCode,
  ArrowRight,
  Eye,
  Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface AgencyClientWorkspace {
  id: string;
  clientName: string;
  subdomain: string; // e.g. clientname.agencybrand.com
  contactEmail: string;
  plan: 'Growth Agency ($999/mo)' | 'Scale Operations ($1,999/mo)' | 'Enterprise Custom ($3,999/mo)';
  monthlyRetainer: number; // e.g. $1,499
  status: 'ACTIVE' | 'PENDING_ONBOARDING' | 'PAUSED';
  activeSeats: number;
  revenueProtected: number;
  customLogoUrl?: string;
  joinedDate: string;
}

export const AgencyWhiteLabelView: React.FC = () => {
  const { profile, companyName, companyId } = useAuth();

  // White-label portal branding state
  const [agencyName, setAgencyName] = useState('Apex Revenue Advisory & Ventures');
  const [customDomain, setCustomDomain] = useState('portal.apexventures.ai');
  const [primaryBrandColor, setPrimaryBrandColor] = useState('#FFD700');
  const [brandTagline, setBrandTagline] = useState('Autonomous Operations & Enterprise Revenue Intelligence');
  const [supportEmail, setSupportEmail] = useState('support@apexventures.ai');
  const [cnameStatus, setCnameStatus] = useState<'VERIFIED' | 'PROPAGATING' | 'UNCONFIGURED'>('VERIFIED');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Agency Clients List
  const [clients, setClients] = useState<AgencyClientWorkspace[]>([
    {
      id: 'ws_cl_01',
      clientName: 'HyperScale Logistics',
      subdomain: 'hyperscale.apexventures.ai',
      contactEmail: 'david@hyperscalelogistics.com',
      plan: 'Scale Operations ($1,999/mo)',
      monthlyRetainer: 1999,
      status: 'ACTIVE',
      activeSeats: 8,
      revenueProtected: 320000,
      joinedDate: '2026-06-12'
    },
    {
      id: 'ws_cl_02',
      clientName: 'SaaSFlow Metrics Inc',
      subdomain: 'saasflow.apexventures.ai',
      contactEmail: 'elena@saasflowmetrics.io',
      plan: 'Growth Agency ($999/mo)',
      monthlyRetainer: 999,
      status: 'ACTIVE',
      activeSeats: 4,
      revenueProtected: 185000,
      joinedDate: '2026-07-01'
    },
    {
      id: 'ws_cl_03',
      clientName: 'Vanguard Cyber Health',
      subdomain: 'vanguard.apexventures.ai',
      contactEmail: 'ciso@vanguardhealth.org',
      plan: 'Enterprise Custom ($3,999/mo)',
      monthlyRetainer: 3999,
      status: 'ACTIVE',
      activeSeats: 16,
      revenueProtected: 850000,
      joinedDate: '2026-05-18'
    },
    {
      id: 'ws_cl_04',
      clientName: 'Quantum AI Cloud',
      subdomain: 'quantum.apexventures.ai',
      contactEmail: 'tariq@quantumcloud.co',
      plan: 'Scale Operations ($1,999/mo)',
      monthlyRetainer: 1999,
      status: 'PENDING_ONBOARDING',
      activeSeats: 2,
      revenueProtected: 95000,
      joinedDate: '2026-08-15'
    }
  ]);

  // New Client Modal
  const [newClientModal, setNewClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientRetainer, setNewClientRetainer] = useState(1499);
  const [newClientPlan, setNewClientPlan] = useState<'Growth Agency ($999/mo)' | 'Scale Operations ($1,999/mo)' | 'Enterprise Custom ($3,999/mo)'>('Scale Operations ($1,999/mo)');

  // Calculate MRR & ARR from Agency Sub-Tenants
  const totalAgencyMRR = clients.filter(c => c.status === 'ACTIVE').reduce((sum, c) => sum + c.monthlyRetainer, 0);
  const totalAgencyARR = totalAgencyMRR * 12;
  const totalProtectedByAgency = clients.reduce((sum, c) => sum + c.revenueProtected, 0);

  const handleSaveBranding = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientEmail) return;

    const sub = newClientName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.' + (customDomain || 'prime.agency');
    const newWs: AgencyClientWorkspace = {
      id: 'ws_cl_' + Date.now(),
      clientName: newClientName,
      subdomain: sub,
      contactEmail: newClientEmail,
      plan: newClientPlan,
      monthlyRetainer: Number(newClientRetainer),
      status: 'ACTIVE',
      activeSeats: 5,
      revenueProtected: 120000,
      joinedDate: new Date().toISOString().split('T')[0]
    };

    setClients([newWs, ...clients]);
    setNewClientModal(false);
    setNewClientName('');
    setNewClientEmail('');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/40 via-purple-950/20 to-black border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-[0_0_50px_rgba(255,215,0,0.1)]">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold">
            <Crown className="w-3.5 h-3.5" />
            <span>$40,000/MO RECURRING AGENCY &amp; RESELLER ENGINE</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            White-Label Portal &amp; <span className="gold-gradient-text font-serif">Agency Multi-Tenancy</span>
          </h1>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Re-brand PRIME AI with your own agency identity, logo, and custom domain. Charge your B2B clients <strong className="text-white font-mono">$1,500 – $4,000/month</strong> for autonomous AI Operations, Churn Defense, and Revenue Radar.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setNewClientModal(true)}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FFD700] via-amber-300 to-[#FFC700] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_0_30px_rgba(255,215,0,0.35)] transition-all cursor-pointer whitespace-nowrap self-start md:self-auto"
        >
          <Building2 className="w-4 h-4" />
          <span>Provision New Client Portal</span>
        </button>
      </div>

      {/* Agency Financial High-Velocity Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0E0E0E] border border-amber-500/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Agency Client MRR</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">${totalAgencyMRR.toLocaleString()}<span className="text-xs text-zinc-400 font-normal">/mo</span></div>
          <p className="text-[10px] text-amber-300/80 font-medium">Target: $40,000/mo ({( (totalAgencyMRR / 40000) * 100 ).toFixed(0)}% reached)</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0E0E0E] border border-white/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Annual Run-Rate (ARR)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">${totalAgencyARR.toLocaleString()}</div>
          <p className="text-[10px] text-emerald-400 font-medium">+100% Retainer profit margin</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0E0E0E] border border-white/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Active Client Workspaces</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{clients.length} Sub-Tenants</div>
          <p className="text-[10px] text-cyan-400 font-medium">{clients.reduce((s, c) => s + c.activeSeats, 0)} total enterprise users</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0E0E0E] border border-white/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Client Revenue Protected</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">${totalProtectedByAgency.toLocaleString()}</div>
          <p className="text-[10px] text-indigo-300 font-medium">Autonomous Churn &amp; Dunning Defense</p>
        </div>
      </div>

      {/* Main Grid: White-Label Branding Settings + Client Workspaces Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Custom Agency White-Label Branding Setup */}
        <div className="p-6 rounded-3xl bg-[#0D0D0D] border border-white/10 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#FFD700]" />
              <h2 className="text-base font-bold text-white">Agency Brand Customizer</h2>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/30">
              100% UNBRANDED
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-zinc-400 font-bold block mb-1.5">Agency / Company Brand Name</label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-medium focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-zinc-400 font-bold block mb-1.5">Custom CNAME Domain</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono focus:border-amber-400 focus:outline-none"
                />
                <span className="px-2.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> SSL Active
                </span>
              </div>
            </div>

            <div>
              <label className="text-zinc-400 font-bold block mb-1.5">Primary Brand Accent Theme</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryBrandColor}
                  onChange={(e) => setPrimaryBrandColor(e.target.value)}
                  className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <span className="font-mono text-zinc-300 font-bold">{primaryBrandColor}</span>
                <span className="text-[11px] text-zinc-500">(Gold Imperial Luxury Accent)</span>
              </div>
            </div>

            <div>
              <label className="text-zinc-400 font-bold block mb-1.5">Client Portal Subtitle &amp; Tagline</label>
              <textarea
                rows={2}
                value={brandTagline}
                onChange={(e) => setBrandTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-medium focus:border-amber-400 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-zinc-400 font-bold block mb-1.5">Agency Support Desk Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Payoneer Agency Payout Gateway */}
            <div className="p-3.5 rounded-2xl bg-[#FF4800]/10 border border-[#FF4800]/30 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span>💳</span>
                  <span>Agency Payoneer Payout Gateway</span>
                </span>
                <span className="text-[#FF4800] font-mono font-bold text-[9px] uppercase tracking-wider bg-[#FF4800]/20 px-1.5 py-0.5 rounded">DIRECT DEPOSIT</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Connect your Payoneer payment link or email to receive monthly client retainers ($1,500 - $4,000/mo) directly to your account.
              </p>
              <input
                type="text"
                defaultValue={localStorage.getItem('prime_ai_payoneer_link') || 'https://payoneer.com'}
                onChange={(e) => localStorage.setItem('prime_ai_payoneer_link', e.target.value)}
                placeholder="https://payoneer.com/pay/your-agency-link"
                className="w-full px-3 py-2 rounded-lg bg-black/80 border border-white/10 text-white font-mono text-xs focus:border-[#FF4800] focus:outline-none"
              />
            </div>

            {/* DNS CNAME Configuration Box */}
            <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-zinc-300">DNS Setup Instructions</span>
                <span className="text-emerald-400 font-mono font-bold">CNAME RECORD</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Add a CNAME record pointing <code className="text-amber-300 bg-white/5 px-1 py-0.5 rounded font-mono">{customDomain}</code> to <code className="text-amber-300 bg-white/5 px-1 py-0.5 rounded font-mono">cname.prime.ai</code> in your DNS provider (Cloudflare, GoDaddy, Namecheap).
              </p>
            </div>

            <button
              onClick={handleSaveBranding}
              className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/15"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{savedSuccess ? 'Branding Saved & Deployed!' : 'Save & Propagate White-Label Portal'}</span>
            </button>
          </div>
        </div>

        {/* RIGHT TWO COLUMNS: Provisioned Sub-Tenant Client Workspaces Table */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#0D0D0D] border border-white/10 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>Provisioned Client Sub-Tenants ({clients.length})</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Isolated enterprise workspaces running under your custom brand with dedicated data isolation.
                </p>
              </div>

              <button
                onClick={() => setNewClientModal(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>+ Add Client</span>
              </button>
            </div>

            {/* Clients Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Client Organization</th>
                    <th className="pb-3">Custom Subdomain</th>
                    <th className="pb-3">Monthly Retainer</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {clients.map((c) => (
                    <tr key={c.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4">
                        <div>
                          <span className="font-bold text-white text-sm block">{c.clientName}</span>
                          <span className="text-[11px] text-zinc-400 font-mono">{c.contactEmail}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1 font-mono text-amber-300/90 text-[11px]">
                          <span>{c.subdomain}</span>
                          <ExternalLink className="w-3 h-3 text-zinc-500" />
                        </div>
                      </td>
                      <td className="py-4">
                        <div>
                          <span className="font-mono font-bold text-white text-sm">
                            ${c.monthlyRetainer.toLocaleString()}/mo
                          </span>
                          <span className="text-[10px] text-emerald-400 block font-medium">
                            ${(c.revenueProtected / 1000).toFixed(0)}k protected
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          c.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                        }`}>
                          {c.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => window.open(`https://${c.subdomain}`, '_blank')}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer"
                            title="Launch Client Portal"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Reseller Pricing Pitch Guide */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 to-black border border-amber-500/20 space-y-2 text-xs">
            <div className="flex items-center justify-between text-amber-400 font-bold">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>HOW TO SCALE TO $40,000/MONTH (AGENCY BLUEPRINT)</span>
              </span>
              <span className="font-mono">100% Margin Retention</span>
            </div>
            <p className="text-zinc-300 leading-relaxed text-[11px]">
              Sign <strong>20 clients at $2,000/month</strong> as their fractional "AI Chief Revenue Officer". PRIME AI autonomously runs their email triage, protects at-risk renewals, and rescues failed payments while you collect recurring monthly retainer revenue.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL: PROVISION NEW CLIENT SUB-TENANT */}
      {newClientModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#121212] border border-amber-500/40 p-6 sm:p-7 space-y-6 shadow-[0_0_50px_rgba(255,215,0,0.2)] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-[#FFD700] flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Provision New Client Workspace</h3>
                  <p className="text-xs text-zinc-400">Deploy an isolated tenant with custom branding &amp; permissions.</p>
                </div>
              </div>
              <button 
                onClick={() => setNewClientModal(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-400 font-bold block mb-1.5">Client Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nexus FinTech Capital"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-medium focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1.5">Primary Contact / Admin Email</label>
                <input
                  type="email"
                  required
                  placeholder="admin@nexusfintech.com"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-bold block mb-1.5">Agency Plan Tier</label>
                  <select
                    value={newClientPlan}
                    onChange={(e: any) => setNewClientPlan(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-medium focus:border-amber-400 focus:outline-none cursor-pointer"
                  >
                    <option value="Growth Agency ($999/mo)">Growth ($999/mo)</option>
                    <option value="Scale Operations ($1,999/mo)">Scale ($1,999/mo)</option>
                    <option value="Enterprise Custom ($3,999/mo)">Enterprise ($3,999/mo)</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 font-bold block mb-1.5">Your Client Retainer ($/mo)</label>
                  <input
                    type="number"
                    required
                    value={newClientRetainer}
                    onChange={(e) => setNewClientRetainer(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 space-y-1">
                <span className="font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Auto-Provisioning Includes:
                </span>
                <p className="text-[10px] text-zinc-300">
                  Dedicated Supabase DB partition, Stripe revenue telemetry, 24/7 autonomous COO agent, and white-label client login link.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setNewClientModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FFD700] via-amber-300 to-[#FFC700] text-black font-extrabold shadow-[0_0_25px_rgba(255,215,0,0.3)] hover:brightness-110 cursor-pointer"
                >
                  Launch Client Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
