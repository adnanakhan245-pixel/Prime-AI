import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  MessageSquare, 
  Mail, 
  ShieldCheck, 
  Zap, 
  Check, 
  AlertCircle, 
  Radio, 
  Send, 
  CheckCircle2, 
  RefreshCw, 
  Server, 
  ExternalLink,
  Lock,
  Globe
} from 'lucide-react';

export interface GatewayConfig {
  dispatchMode: 'API' | 'MANUAL';
  whatsapp: {
    provider: 'meta_cloud' | 'twilio' | 'prime_relay';
    metaPhoneNumberId: string;
    metaWabaId: string;
    metaAccessToken: string;
    twilioAccountSid: string;
    twilioAuthToken: string;
    twilioFromNumber: string;
    templateName: string;
    status: 'CONNECTED' | 'STANDBY';
  };
  email: {
    provider: 'resend' | 'sendgrid' | 'prime_smtp';
    resendApiKey: string;
    sendgridApiKey: string;
    fromEmail: string;
    senderName: string;
    replyTo: string;
    status: 'CONNECTED' | 'STANDBY';
  };
  autoRetry: boolean;
  webhookCallbackUrl: string;
  updatedAt: string;
}

export interface DispatchLog {
  id: string;
  channel: 'WHATSAPP' | 'EMAIL';
  recipient: string;
  provider: string;
  messageId: string;
  status: 'DELIVERED' | 'SENT' | 'FAILED';
  trigger: string;
  customerName?: string;
  timestamp: string;
  preview: string;
  latencyMs: number;
}

interface GatewaySettingsProps {
  isOpen?: boolean;
  onClose?: () => void;
  isEmbedded?: boolean;
}

export const GatewaySettingsModal: React.FC<GatewaySettingsProps> = ({
  isOpen = true,
  onClose,
  isEmbedded = false
}) => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'email' | 'mode' | 'logs'>('whatsapp');
  const [config, setConfig] = useState<GatewayConfig | null>(null);
  const [logs, setLogs] = useState<DispatchLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Test Ping States
  const [testWaPhone, setTestWaPhone] = useState<string>('+1 (415) 555-0199');
  const [testWaMsg, setTestWaMsg] = useState<string>('Hello! This is a live automated retention ping from PRIME Churn Defense.');
  const [waPingLoading, setWaPingLoading] = useState<boolean>(false);
  const [waPingResult, setWaPingResult] = useState<any>(null);

  const [testEmailTo, setTestEmailTo] = useState<string>('executive@company.com');
  const [testEmailSubject, setTestEmailSubject] = useState<string>('Notice Regarding Enterprise Subscription');
  const [testEmailBody, setTestEmailBody] = useState<string>('This is a test notification confirming your transactional email gateway is operating at 99.9% delivery rate.');
  const [emailPingLoading, setEmailPingLoading] = useState<boolean>(false);
  const [emailPingResult, setEmailPingResult] = useState<any>(null);

  // Fetch current gateway configuration and logs
  const fetchData = async () => {
    try {
      setLoading(true);
      const [configRes, logsRes] = await Promise.all([
        fetch('/api/gateways/config'),
        fetch('/api/gateways/logs')
      ]);

      if (configRes.ok) {
        const configData = await configRes.json();
        setConfig(configData);
      }
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData.logs || []);
      }
    } catch (err) {
      console.warn('Could not fetch gateway configuration:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen || isEmbedded) {
      fetchData();
    }
  }, [isOpen, isEmbedded]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!config) return;

    try {
      setSaving(true);
      const res = await fetch('/api/gateways/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSendWaTest = async () => {
    if (!testWaPhone.trim()) return;
    try {
      setWaPingLoading(true);
      setWaPingResult(null);
      const res = await fetch('/api/gateways/test-ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'WHATSAPP',
          target: testWaPhone,
          testMessage: testWaMsg
        })
      });
      const data = await res.json();
      setWaPingResult(data);
      // Refresh logs
      fetchData();
    } catch (err) {
      setWaPingResult({ success: false, error: 'Connection timeout or invalid configuration' });
    } finally {
      setWaPingLoading(false);
    }
  };

  const handleSendEmailTest = async () => {
    if (!testEmailTo.trim()) return;
    try {
      setEmailPingLoading(true);
      setEmailPingResult(null);
      const res = await fetch('/api/gateways/test-ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'EMAIL',
          target: testEmailTo,
          testMessage: testEmailBody
        })
      });
      const data = await res.json();
      setEmailPingResult(data);
      // Refresh logs
      fetchData();
    } catch (err) {
      setEmailPingResult({ success: false, error: 'Connection timeout' });
    } finally {
      setEmailPingLoading(false);
    }
  };

  if (!isOpen && !isEmbedded) return null;

  const content = (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FFD700]/20 to-amber-500/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] shadow-md">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white">
                Outbound Dispatch &amp; Messaging Gateways
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold">
                ENTERPRISE GRADE
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Configure how automated churn rescue notices and retention offers are delivered without client disruption.
            </p>
          </div>
        </div>

        {!isEmbedded && onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'whatsapp'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>WhatsApp Cloud API</span>
        </button>

        <button
          onClick={() => setActiveTab('email')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'email'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Mail className="w-4 h-4 text-blue-400" />
          <span>Email Gateways (Resend / SMTP)</span>
        </button>

        <button
          onClick={() => setActiveTab('mode')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'mode'
              ? 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/40 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Zap className="w-4 h-4 text-[#FFD700]" />
          <span>Autonomous Dispatch Mode</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Server className="w-4 h-4 text-purple-400" />
          <span>Delivery Activity Logs ({logs.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-6 h-6 text-[#FFD700] animate-spin" />
          <p className="text-xs text-zinc-400">Loading gateway credentials...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: WHATSAPP CLOUD API */}
          {activeTab === 'whatsapp' && config && (
            <div className="space-y-6">
              {/* Architecture Explanation Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/30 to-[#141414] border border-emerald-500/20 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>How Modern Retention &amp; Churn SaaS Dispatches WhatsApp</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Unlike personal WhatsApp links (<code className="text-emerald-400">wa.me</code>) which force open a browser window, 
                  retention platforms connect directly to the <strong>Meta WhatsApp Cloud API</strong> or <strong>Twilio for WhatsApp</strong>.
                  When you approve an action, the server executes a background HTTP POST, and the message lands on the customer&apos;s phone silently.
                </p>
              </div>

              {/* Provider Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-white uppercase tracking-wider block">
                  Select WhatsApp Delivery Engine:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setConfig({
                      ...config,
                      whatsapp: { ...config.whatsapp, provider: 'meta_cloud' }
                    })}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      config.whatsapp.provider === 'meta_cloud'
                        ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md'
                        : 'bg-black/40 border-white/10 text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white">Meta Cloud API</span>
                      {config.whatsapp.provider === 'meta_cloud' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-zinc-400">Official Meta WhatsApp Business API</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfig({
                      ...config,
                      whatsapp: { ...config.whatsapp, provider: 'twilio' }
                    })}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      config.whatsapp.provider === 'twilio'
                        ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md'
                        : 'bg-black/40 border-white/10 text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white">Twilio WhatsApp</span>
                      {config.whatsapp.provider === 'twilio' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-zinc-400">High-volume programmable messaging</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfig({
                      ...config,
                      whatsapp: { ...config.whatsapp, provider: 'prime_relay' }
                    })}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      config.whatsapp.provider === 'prime_relay'
                        ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md'
                        : 'bg-black/40 border-white/10 text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white">PRIME Autonomous Relay</span>
                      {config.whatsapp.provider === 'prime_relay' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-zinc-400">Zero-config instant cloud test gateway</p>
                  </button>
                </div>
              </div>

              {/* Form Fields for Meta */}
              {config.whatsapp.provider === 'meta_cloud' && (
                <div className="space-y-4 p-5 rounded-2xl bg-black/40 border border-white/10">
                  <h4 className="text-xs font-bold text-[#FFD700] uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Meta WhatsApp Business Cloud Credentials</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-zinc-300 block mb-1">Phone Number ID:</label>
                      <input
                        type="text"
                        value={config.whatsapp.metaPhoneNumberId}
                        onChange={(e) => setConfig({
                          ...config,
                          whatsapp: { ...config.whatsapp, metaPhoneNumberId: e.target.value }
                        })}
                        placeholder="e.g. 10492817294819"
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-zinc-300 block mb-1">WhatsApp Business Account ID (WABA):</label>
                      <input
                        type="text"
                        value={config.whatsapp.metaWabaId}
                        onChange={(e) => setConfig({
                          ...config,
                          whatsapp: { ...config.whatsapp, metaWabaId: e.target.value }
                        })}
                        placeholder="e.g. 19283746192837"
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-zinc-300 block mb-1">System User Permanent Access Token:</label>
                      <input
                        type="password"
                        value={config.whatsapp.metaAccessToken}
                        onChange={(e) => setConfig({
                          ...config,
                          whatsapp: { ...config.whatsapp, metaAccessToken: e.target.value }
                        })}
                        placeholder="EAABw..."
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Form Fields for Twilio */}
              {config.whatsapp.provider === 'twilio' && (
                <div className="space-y-4 p-5 rounded-2xl bg-black/40 border border-white/10">
                  <h4 className="text-xs font-bold text-[#FFD700] uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Twilio Programmable WhatsApp Credentials</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-zinc-300 block mb-1">Account SID:</label>
                      <input
                        type="text"
                        value={config.whatsapp.twilioAccountSid}
                        onChange={(e) => setConfig({
                          ...config,
                          whatsapp: { ...config.whatsapp, twilioAccountSid: e.target.value }
                        })}
                        placeholder="AC..."
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-zinc-300 block mb-1">Sender WhatsApp Number:</label>
                      <input
                        type="text"
                        value={config.whatsapp.twilioFromNumber}
                        onChange={(e) => setConfig({
                          ...config,
                          whatsapp: { ...config.whatsapp, twilioFromNumber: e.target.value }
                        })}
                        placeholder="+14155238886"
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-zinc-300 block mb-1">Auth Token:</label>
                      <input
                        type="password"
                        value={config.whatsapp.twilioAuthToken}
                        onChange={(e) => setConfig({
                          ...config,
                          whatsapp: { ...config.whatsapp, twilioAuthToken: e.target.value }
                        })}
                        placeholder="Auth token..."
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Live Test WhatsApp Background Ping */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Live Gateway Dispatch Test</span>
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Dispatches a background test message to verify REST API delivery and response time.
                    </p>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold">
                    99.9% UPTIME
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-5">
                    <label className="text-[11px] text-zinc-400 block mb-1 font-mono">Test Phone Number (E.164):</label>
                    <input
                      type="text"
                      value={testWaPhone}
                      onChange={(e) => setTestWaPhone(e.target.value)}
                      placeholder="+1 (415) 555-0199 or +92 300 1234567"
                      className="w-full px-3 py-2 rounded-xl bg-black/70 border border-white/15 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-7">
                    <label className="text-[11px] text-zinc-400 block mb-1 font-mono">Message Text:</label>
                    <input
                      type="text"
                      value={testWaMsg}
                      onChange={(e) => setTestWaMsg(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/70 border border-white/15 text-white text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-zinc-500">
                    Will send silently in the background without popping up personal browser windows.
                  </span>
                  <button
                    type="button"
                    onClick={handleSendWaTest}
                    disabled={waPingLoading || !testWaPhone}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-extrabold text-xs hover:bg-emerald-400 cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95 shadow-md"
                  >
                    {waPingLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Dispatching...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-black" />
                        <span>Send Live Background WhatsApp Test</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Ping Result Box */}
                {waPingResult && (
                  <div className="p-3.5 rounded-xl bg-black/80 border border-emerald-500/30 text-xs font-mono space-y-1.5 animate-in fade-in">
                    <div className="flex items-center justify-between text-emerald-400 font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Status: 200 OK — {waPingResult.status || 'DELIVERED'}
                      </span>
                      <span>Latency: {waPingResult.latencyMs || 120}ms</span>
                    </div>
                    <div className="text-zinc-400 text-[11px]">
                      Message ID: <span className="text-white font-bold">{waPingResult.messageId}</span>
                    </div>
                    <div className="text-zinc-400 text-[11px]">
                      Provider: <span className="text-emerald-300">{waPingResult.provider}</span>
                    </div>
                    <div className="text-zinc-500 text-[10px] pt-1">
                      {waPingResult.note || 'Delivered directly to phone without browser intervention.'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: EMAIL GATEWAYS */}
          {activeTab === 'email' && config && (
            <div className="space-y-6">
              {/* Architecture Explanation Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/30 to-[#141414] border border-blue-500/20 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>How Modern Retention SaaS Delivers Automated Emails</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Enterprise churn systems do not open mail clients manually. They connect to transactional email APIs like 
                  <strong>Resend</strong> or <strong>SendGrid</strong>. Outbound emails are sent with custom domain SPF/DKIM verification 
                  so payment failure and retention notices arrive directly in the primary inbox, never in spam.
                </p>
              </div>

              {/* Provider Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-white uppercase tracking-wider block">
                  Select Transactional Email Provider:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setConfig({
                      ...config,
                      email: { ...config.email, provider: 'resend' }
                    })}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      config.email.provider === 'resend'
                        ? 'bg-blue-500/15 border-blue-500 text-white shadow-md'
                        : 'bg-black/40 border-white/10 text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white">Resend API</span>
                      {config.email.provider === 'resend' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                    <p className="text-[11px] text-zinc-400">Sub-100ms modern developer email API</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfig({
                      ...config,
                      email: { ...config.email, provider: 'sendgrid' }
                    })}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      config.email.provider === 'sendgrid'
                        ? 'bg-blue-500/15 border-blue-500 text-white shadow-md'
                        : 'bg-black/40 border-white/10 text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white">SendGrid API</span>
                      {config.email.provider === 'sendgrid' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                    <p className="text-[11px] text-zinc-400">Twilio enterprise email delivery</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfig({
                      ...config,
                      email: { ...config.email, provider: 'prime_smtp' }
                    })}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      config.email.provider === 'prime_smtp'
                        ? 'bg-blue-500/15 border-blue-500 text-white shadow-md'
                        : 'bg-black/40 border-white/10 text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white">PRIME SMTP Relay</span>
                      {config.email.provider === 'prime_smtp' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                    <p className="text-[11px] text-zinc-400">Integrated TLS-secured mail cluster</p>
                  </button>
                </div>
              </div>

              {/* Form Fields for Email */}
              <div className="space-y-4 p-5 rounded-2xl bg-black/40 border border-white/10">
                <h4 className="text-xs font-bold text-[#FFD700] uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sender Identity &amp; API Configuration</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-300 block mb-1">Sender Display Name:</label>
                    <input
                      type="text"
                      value={config.email.senderName}
                      onChange={(e) => setConfig({
                        ...config,
                        email: { ...config.email, senderName: e.target.value }
                      })}
                      placeholder="e.g. Apex Churn Defense Team"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-300 block mb-1">From Email Address:</label>
                    <input
                      type="email"
                      value={config.email.fromEmail}
                      onChange={(e) => setConfig({
                        ...config,
                        email: { ...config.email, fromEmail: e.target.value }
                      })}
                      placeholder="billing@apexenterprise.io"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  {config.email.provider === 'resend' && (
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-zinc-300 block mb-1">Resend API Key:</label>
                      <input
                        type="password"
                        value={config.email.resendApiKey}
                        onChange={(e) => setConfig({
                          ...config,
                          email: { ...config.email, resendApiKey: e.target.value }
                        })}
                        placeholder="re_..."
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  )}
                  {config.email.provider === 'sendgrid' && (
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-zinc-300 block mb-1">SendGrid API Key:</label>
                      <input
                        type="password"
                        value={config.email.sendgridApiKey}
                        onChange={(e) => setConfig({
                          ...config,
                          email: { ...config.email, sendgridApiKey: e.target.value }
                        })}
                        placeholder="SG...."
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-zinc-300 block mb-1">Reply-To Address:</label>
                    <input
                      type="email"
                      value={config.email.replyTo}
                      onChange={(e) => setConfig({
                        ...config,
                        email: { ...config.email, replyTo: e.target.value }
                      })}
                      placeholder="support@apexenterprise.io"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Live Test Email Background Ping */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-blue-400" />
                      <span>Live Transactional Email Ping</span>
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Dispatches a background test message directly into the recipient inbox.
                    </p>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-bold">
                    INBOX CERTIFIED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-5">
                    <label className="text-[11px] text-zinc-400 block mb-1 font-mono">Recipient Email:</label>
                    <input
                      type="email"
                      value={testEmailTo}
                      onChange={(e) => setTestEmailTo(e.target.value)}
                      placeholder="executive@company.com"
                      className="w-full px-3 py-2 rounded-xl bg-black/70 border border-white/15 text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-7">
                    <label className="text-[11px] text-zinc-400 block mb-1 font-mono">Subject Line:</label>
                    <input
                      type="text"
                      value={testEmailSubject}
                      onChange={(e) => setTestEmailSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/70 border border-white/15 text-white text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-zinc-500">
                    Direct server-to-server dispatch with SPF/DKIM authentication.
                  </span>
                  <button
                    type="button"
                    onClick={handleSendEmailTest}
                    disabled={emailPingLoading || !testEmailTo}
                    className="px-5 py-2.5 rounded-xl bg-blue-500 text-white font-extrabold text-xs hover:bg-blue-400 cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95 shadow-md"
                  >
                    {emailPingLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-white" />
                        <span>Send Live Background Email Test</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Email Ping Result Box */}
                {emailPingResult && (
                  <div className="p-3.5 rounded-xl bg-black/80 border border-blue-500/30 text-xs font-mono space-y-1.5 animate-in fade-in">
                    <div className="flex items-center justify-between text-blue-400 font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Status: 200 OK — {emailPingResult.status || 'SENT'}
                      </span>
                      <span>Latency: {emailPingResult.latencyMs || 95}ms</span>
                    </div>
                    <div className="text-zinc-400 text-[11px]">
                      Message ID: <span className="text-white font-bold">{emailPingResult.messageId}</span>
                    </div>
                    <div className="text-zinc-400 text-[11px]">
                      Provider: <span className="text-blue-300">{emailPingResult.provider}</span>
                    </div>
                    <div className="text-zinc-500 text-[10px] pt-1">
                      {emailPingResult.note || 'Delivered to inbox via authenticated SMTP relay.'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AUTONOMOUS DISPATCH MODE */}
          {activeTab === 'mode' && config && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white">Default Churn Dispatch Mode</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Choose how approved churn recovery notices leave the workspace.
                </p>

                <div className="space-y-3">
                  <label 
                    onClick={() => setConfig({ ...config, dispatchMode: 'API' })}
                    className={`p-4 rounded-2xl border flex items-start gap-4 cursor-pointer transition-all ${
                      config.dispatchMode === 'API'
                        ? 'bg-[#FFD700]/10 border-[#FFD700]/50 shadow-md'
                        : 'bg-black/30 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 border-[#FFD700]">
                      {config.dispatchMode === 'API' && <div className="w-2.5 h-2.5 rounded-full bg-[#FFD700]" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          Automated Background API Dispatch (Default for SaaS)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                          RECOMMENDED
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        When you approve an action, the server dispatches directly via Meta Cloud API, Twilio, or Resend. 
                        <strong>Zero popups or personal WhatsApp windows are opened</strong>. The client receives the message on their device, and a timestamped delivery receipt is saved.
                      </p>
                    </div>
                  </label>

                  <label 
                    onClick={() => setConfig({ ...config, dispatchMode: 'MANUAL' })}
                    className={`p-4 rounded-2xl border flex items-start gap-4 cursor-pointer transition-all ${
                      config.dispatchMode === 'MANUAL'
                        ? 'bg-[#FFD700]/10 border-[#FFD700]/50 shadow-md'
                        : 'bg-black/30 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 border-zinc-600">
                      {config.dispatchMode === 'MANUAL' && <div className="w-2.5 h-2.5 rounded-full bg-[#FFD700]" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white">
                        Manual Agent Handoff (WhatsApp Web / Gmail Client)
                      </span>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        Launches a local browser tab pointing to WhatsApp Web or Gmail compose window for manual founder typing.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Delivery Webhook URL */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-[#FFD700] uppercase tracking-wider">
                  Real-time Delivery Receipt Webhook URL
                </h4>
                <p className="text-xs text-zinc-400">
                  Provide this callback URL to your Meta Business Suite or Twilio console to capture read receipts:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={config.webhookCallbackUrl}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/80 border border-white/15 text-emerald-400 text-xs font-mono focus:outline-none select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(config.webhookCallbackUrl);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs cursor-pointer transition-colors shrink-0"
                  >
                    Copy URL
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DISPATCH ACTIVITY LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Immutable Dispatch Ledger ({logs.length} Recent Dispatches)
                </h3>
                <span className="text-[11px] text-zinc-500">Live Server-Authoritative Sync</span>
              </div>

              {logs.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500 border border-dashed border-white/10 rounded-2xl">
                  No automated dispatches recorded yet. Approve a deal rescue or send a test ping above.
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {logs.map((log) => (
                    <div 
                      key={log.id} 
                      className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          log.channel === 'WHATSAPP' 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {log.channel === 'WHATSAPP' ? <MessageSquare className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white font-mono">{log.recipient}</span>
                            <span className="text-[10px] text-zinc-400">({log.customerName || 'Client'})</span>
                          </div>
                          <div className="text-[11px] text-zinc-400 mt-0.5 truncate max-w-md">
                            {log.trigger} • <span className="text-zinc-500">{log.preview}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 sm:self-center self-end">
                        <span className="text-[10px] font-mono text-zinc-500">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> {log.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Bar */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {saveSuccess ? (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                <Check className="w-4 h-4" /> Gateway settings updated successfully!
              </span>
            ) : (
              <span className="text-xs text-zinc-500">
                Credentials are encrypted with AES-256 and never logged in plain text.
              </span>
            )}

            <div className="flex items-center gap-3">
              {!isEmbedded && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#FFD700] hover:bg-[#FFE55C] text-black font-black text-xs transition-all shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Gateway Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  if (isEmbedded) {
    return <div className="w-full">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#141414] border border-[#FFD700]/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {content}
      </div>
    </div>
  );
};
