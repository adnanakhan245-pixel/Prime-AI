import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Trash2, 
  X, 
  Check, 
  Copy, 
  ExternalLink, 
  Send, 
  MessageSquare, 
  Globe, 
  CheckCircle2, 
  AlertCircle,
  Key,
  Smartphone,
  Layers,
  HelpCircle
} from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | 'deletion' | 'meta-whatsapp' | null;
  onClose: () => void;
}

export const LegalModals: React.FC<LegalModalProps> = ({ type, onClose }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Meta WhatsApp Setup State
  const [metaPhoneId, setMetaPhoneId] = useState('');
  const [metaToken, setMetaToken] = useState('');
  const [metaWabaId, setMetaWabaId] = useState('');
  const [testNumber, setTestNumber] = useState('');
  const [testMessage, setTestMessage] = useState('Salam! This is a test confirmation from PRIME Revenue & SaaS Radar.');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; url?: string } | null>(null);

  if (!type) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleSendWhatsAppTest = async () => {
    if (!testNumber) {
      setTestResult({ success: false, message: 'Please enter a valid recipient phone number with country code (e.g. +923001234567 or 14155552671).' });
      return;
    }

    setTestLoading(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/whatsapp/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testNumber,
          message: testMessage,
          phoneNumberId: metaPhoneId || undefined,
          accessToken: metaToken || undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.directChatUrl) {
          setTestResult({
            success: true,
            message: `✓ WhatsApp Gateway Ready! Click link below to open WhatsApp chat.`,
            url: data.directChatUrl
          });
        } else {
          setTestResult({
            success: true,
            message: `✓ Dispatched via Meta WhatsApp Cloud API (Message ID: ${data.messageId || 'SENT'})`
          });
        }
      } else {
        setTestResult({
          success: false,
          message: `Meta API Error: ${data.error || 'Failed to dispatch test message'}`
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Network error: ${err.message || 'Unable to connect to WhatsApp endpoint'}`
      });
    } finally {
      setTestLoading(false);
    }
  };

  const appBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://prime-saas-radar.app';
  const webhookUrl = `${appBaseUrl}/api/webhooks/whatsapp`;
  const verifyToken = 'prime_meta_verify_token_2026';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#111111] border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#161616]">
          <div className="flex items-center gap-3">
            {type === 'privacy' && (
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            )}
            {type === 'terms' && (
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            )}
            {type === 'deletion' && (
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
            )}
            {type === 'meta-whatsapp' && (
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
            )}

            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                {type === 'privacy' && 'PRIME AI Privacy Policy'}
                {type === 'terms' && 'Terms of Service & SLA Agreement'}
                {type === 'deletion' && 'Meta User Data Deletion Instructions'}
                {type === 'meta-whatsapp' && 'Meta WhatsApp Cloud API Verification & Setup'}
              </h2>
              <p className="text-xs text-white/50">
                Official Enterprise Compliance • Updated October 2026
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-white/80 leading-relaxed font-sans">
          
          {/* ========================================================================= */}
          {/* META & WHATSAPP INTEGRATION & VERIFICATION GUIDE */}
          {/* ========================================================================= */}
          {type === 'meta-whatsapp' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Meta App Review Ready &amp; 100% WhatsApp Cloud API Compliant</span>
                </div>
                <p className="text-xs text-emerald-200/80">
                  If your app status is in Development / Test Mode on the Meta Developer Portal, enter the verification details below into your Meta WhatsApp App Review form to authorize live messaging.
                </p>
              </div>

              {/* Step 1: Webhook Handshake Configuration */}
              <div className="space-y-3 p-4 rounded-2xl bg-[#161616] border border-white/10">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#FFD700] text-black text-xs font-black flex items-center justify-center">1</span>
                  <span>Meta Webhook Callback URL &amp; Verify Token</span>
                </h3>
                <p className="text-white/60 text-[11px]">
                  Paste these exact values into <strong>Meta for Developers &gt; WhatsApp &gt; Configuration &gt; Webhook</strong>:
                </p>

                <div className="space-y-2 font-mono">
                  <div>
                    <label className="text-[10px] text-white/40 block mb-1 font-sans">CALLBACK URL:</label>
                    <div className="flex items-center gap-2 bg-black/60 p-2.5 rounded-xl border border-white/10">
                      <span className="truncate flex-1 text-[#FFD700] text-[11px]">{webhookUrl}</span>
                      <button 
                        onClick={() => handleCopy(webhookUrl, 'url')}
                        className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === 'url' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'url' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-white/40 block mb-1 font-sans">VERIFY TOKEN:</label>
                    <div className="flex items-center gap-2 bg-black/60 p-2.5 rounded-xl border border-white/10">
                      <span className="truncate flex-1 text-emerald-400 text-[11px]">{verifyToken}</span>
                      <button 
                        onClick={() => handleCopy(verifyToken, 'token')}
                        className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === 'token' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'token' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Meta Cloud API Credentials (Optional Live Dispatch) */}
              <div className="space-y-3 p-4 rounded-2xl bg-[#161616] border border-white/10">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#FFD700] text-black text-xs font-black flex items-center justify-center">2</span>
                  <span>Connect Your Meta Phone Number ID &amp; Token (Optional)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-white/50 block mb-1 font-medium">Meta Phone Number ID</label>
                    <input 
                      type="text" 
                      value={metaPhoneId}
                      onChange={(e) => setMetaPhoneId(e.target.value)}
                      placeholder="e.g. 104829104928192"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:border-[#FFD700] focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/50 block mb-1 font-medium">Meta System User Access Token</label>
                    <input 
                      type="password" 
                      value={metaToken}
                      onChange={(e) => setMetaToken(e.target.value)}
                      placeholder="EAA..."
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:border-[#FFD700] focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Live Real WhatsApp Message Tester */}
              <div className="space-y-3 p-4 rounded-2xl bg-[#161616] border border-white/10">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#FFD700] text-black text-xs font-black flex items-center justify-center">3</span>
                  <span>Live WhatsApp Dispatch Test</span>
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-white/50 block mb-1 font-medium">Recipient Phone Number (with Country Code)</label>
                    <input 
                      type="text" 
                      value={testNumber}
                      onChange={(e) => setTestNumber(e.target.value)}
                      placeholder="+923001234567 or 14155552671"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:border-[#FFD700] focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-white/50 block mb-1 font-medium">Test Message</label>
                    <textarea 
                      rows={2}
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:border-[#FFD700] focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSendWhatsAppTest}
                    disabled={testLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    {testLoading ? (
                      <span>Testing WhatsApp Dispatch...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Test WhatsApp Message Now</span>
                      </>
                    )}
                  </button>

                  {testResult && (
                    <div className={`p-3 rounded-xl border text-xs space-y-2 ${
                      testResult.success 
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' 
                        : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                    }`}>
                      <div>{testResult.message}</div>
                      {testResult.url && (
                        <a 
                          href={testResult.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open Direct WhatsApp Chat</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PRIVACY POLICY CONTENT */}
          {/* ========================================================================= */}
          {type === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/30 text-white space-y-1">
                <h3 className="text-sm font-black text-[#FFD700] uppercase tracking-wider">
                  PRIME - Privacy Policy &amp; Disclaimer
                </h3>
                <p className="text-[11px] text-white/70">
                  Official enterprise operational rules and human-in-the-loop protection agreement.
                </p>
              </div>

              <section className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-[#FFD700] text-black text-[10px] font-black flex items-center justify-center">1</span>
                  <span>AI Assistant Only</span>
                </h4>
                <p className="text-zinc-300">
                  PRIME is an AI assistant tool. It provides suggestions only, not decisions. All final decisions are taken by the user/human. PRIME tagline everywhere should be: <strong className="text-[#FFD700]">&quot;AI will help you to close&quot;</strong> - NEVER write &quot;AI will close your deal&quot;.
                </p>
                <div className="text-[11px] text-[#FFD700] bg-[#FFD700]/10 px-2.5 py-1 rounded-lg border border-[#FFD700]/20 font-semibold">
                  Official Tagline: &ldquo;AI will help you to close&rdquo;
                </div>
              </section>

              <section className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">2</span>
                  <span>No Liability</span>
                </h4>
                <p className="text-zinc-300">
                  We are not responsible for any business loss, deal loss, or financial loss from using AI suggestions. User is 100% responsible for approving actions.
                </p>
              </section>

              <section className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-emerald-500 text-black text-[10px] font-black flex items-center justify-center">3</span>
                  <span>Data</span>
                </h4>
                <p className="text-zinc-300">
                  We store only deal titles and amounts. We do NOT store client CNIC, bank details. All data is encrypted in Supabase.
                </p>
              </section>

              <section className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-blue-500 text-white text-[10px] font-black flex items-center justify-center">4</span>
                  <span>No Auto-Execution</span>
                </h4>
                <p className="text-zinc-300">
                  PRIME never automatically sends emails, closes deals, or charges clients without human approval.
                </p>
              </section>

              <div className="text-[11px] text-white/50 pt-2 flex items-center justify-between border-t border-white/10">
                <span>Data Controller: adnanakhan245@gmail.com</span>
                <a href="/privacy-policy" target="_blank" rel="noreferrer" className="text-[#FFD700] hover:underline flex items-center gap-1 font-semibold">
                  <span>Open Full /privacy-policy URL</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TERMS OF SERVICE CONTENT */}
          {/* ========================================================================= */}
          {type === 'terms' && (
            <div className="space-y-4">
              <section className="space-y-1">
                <h3 className="text-sm font-bold text-white">1. Service Agreement</h3>
                <p>
                  By accessing or subscribing to PRIME AI, you agree to these Terms of Service. PRIME AI provides enterprise SaaS pipeline telemetry, deal health diagnostics, and automated dunning recovery tools.
                </p>
              </section>

              <section className="space-y-1">
                <h3 className="text-sm font-bold text-white">2. Acceptable Use &amp; Messaging Policies</h3>
                <p>
                  Users agree to utilize WhatsApp and Email notifications strictly in compliance with Meta&apos;s Business Messaging Policies, obtaining explicit consent from client contacts before dispatching transactional payment reminders.
                </p>
              </section>

              <section className="space-y-1">
                <h3 className="text-sm font-bold text-white">3. Service Level &amp; Uptime Guarantee</h3>
                <p>
                  PRIME AI guarantees 99.9% platform availability for mission-critical revenue radar telemetry.
                </p>
              </section>

              <section className="space-y-1 p-3 rounded-xl bg-white/5 border border-white/10">
                <h3 className="text-sm font-bold text-[#FFD700]">4. AI Advisory Role &amp; Human-in-the-Loop Disclaimer</h3>
                <p className="text-white/80">
                  PRIME AI operates strictly as an <strong>advisory and operational decision-support platform (&quot;Human-in-the-Loop&quot;)</strong>. All AI-generated suggestions, negotiation drafts, invoice reminders, and concession discounts require explicit user approval before execution. The platform does not make unilateral, legally binding financial decisions. The subscriber retains ultimate managerial authority over all dispatched communications and business decisions.
                </p>
              </section>

              <section className="space-y-1 p-3 rounded-xl bg-white/5 border border-white/10">
                <h3 className="text-sm font-bold text-[#FFD700]">5. Limitation of Liability &amp; Data Security Shield</h3>
                <p className="text-white/80">
                  To the maximum extent permitted by applicable law, PRIME AI and its operators shall not be liable for any indirect, incidental, punitive, or consequential damages. In all events, aggregate liability is strictly capped at the fees actually paid by the subscriber in the twelve (12) months preceding the claim. Furthermore, sensitive payment credentials (e.g., credit card numbers) are handled exclusively by PCI-DSS Level 1 certified processors (Stripe), with zero raw cardholder data stored on our servers.
                </p>
              </section>
            </div>
          )}

          {/* ========================================================================= */}
          {/* DATA DELETION INSTRUCTIONS */}
          {/* ========================================================================= */}
          {type === 'deletion' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <Trash2 className="w-4 h-4" />
                  <span>Meta Platform Data Deletion Compliance (Policy 8.2)</span>
                </div>
                <p className="text-xs text-rose-200/80">
                  In accordance with Meta Platform terms, users may request the total deletion of their account telemetry, phone logs, and business records at any time.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white">How to request data deletion:</h3>
                <ol className="list-decimal list-inside space-y-2 text-white/80">
                  <li>Send an email to <strong>adnanakhan245@gmail.com</strong> with the subject line &quot;DATA DELETION REQUEST&quot;.</li>
                  <li>Include your registered Company Name and Account Email.</li>
                  <li>Our data officer will execute total cryptographic erasure across our database within 24 hours and issue a Confirmation Certificate.</li>
                </ol>
              </section>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#161616] flex items-center justify-between">
          <div className="text-[11px] text-white/40">
            Contact Support: <span className="text-white/70">adnanakhan245@gmail.com</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
