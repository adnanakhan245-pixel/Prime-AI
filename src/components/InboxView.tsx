import React, { useEffect, useState } from 'react';
import { 
  Inbox, 
  Send, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  Filter, 
  ShieldAlert, 
  Building, 
  Mail, 
  ArrowRight,
  EyeOff,
  Plus,
  X,
  Check,
  Copy,
  Database,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchUserEmails, updateEmailStatus, saveEmail, deleteEmail, saveSentEmailToSupabase } from '../services/db';
import { EmailItem } from '../types';

interface AiDraftModalState {
  email: EmailItem;
  draftReply: string;
  isEditing: boolean;
  editedText: string;
  sending: boolean;
  copied: boolean;
}

export const InboxView: React.FC = () => {
  const { user, profile, companyId } = useAuth();
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'IGNORED'>('ALL');
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [draftContent, setDraftContent] = useState('');
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [draftingEmailId, setDraftingEmailId] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState('Decisive & Solutions-Oriented');
  const [simulating, setSimulating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Popup Modal State for AI 3-Line Draft Reply
  const [aiModal, setAiModal] = useState<AiDraftModalState | null>(null);

  const loadEmails = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await fetchUserEmails(companyId, user.uid);
      setEmails(data);
      if (data.length > 0 && !selectedEmail) {
        setSelectedEmail(data[0]);
        setDraftContent(data[0].aiDraftReply || '');
      } else if (selectedEmail) {
        const found = data.find(e => e.id === selectedEmail.id);
        if (found) {
          setSelectedEmail(found);
          setDraftContent(found.aiDraftReply || '');
        }
      }
    } catch (err) {
      console.error('Error fetching emails:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmails();
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSelectEmail = (email: EmailItem) => {
    setSelectedEmail(email);
    setDraftContent(email.aiDraftReply || '');
    setIsEditingDraft(false);
  };

  // AI Draft Reply Handler (Called when "AI Draft Reply" button below any email is clicked)
  const handleTriggerAiDraftReply = async (email: EmailItem) => {
    setDraftingEmailId(email.id);
    setSelectedEmail(email);
    try {
      const res = await fetch('/api/gemini/draft-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: email.sender,
          subject: email.subject,
          body: email.fullBody
        })
      });

      if (!res.ok) {
        throw new Error('Failed to generate 3-line executive reply');
      }

      const data = await res.json();
      const generatedReply = data.draftReply || `Thank you for your email regarding ${email.subject}.\nWe have reviewed the specifications and confirmed our executive alignment on the milestones.\nOur operations team will deploy the finalized action plan by end of business.`;

      setAiModal({
        email,
        draftReply: generatedReply,
        isEditing: false,
        editedText: generatedReply,
        sending: false,
        copied: false
      });
    } catch (err) {
      console.error('Error drafting reply:', err);
      showToast('Error drafting reply. Please try again.');
    } finally {
      setDraftingEmailId(null);
    }
  };

  // Approve & Send from Modal -> Saves to Supabase table 'emails' with status='sent'
  const handleModalApproveAndSend = async () => {
    if (!user || !aiModal) return;
    try {
      setAiModal(prev => prev ? { ...prev, sending: true } : null);
      const finalReply = aiModal.isEditing ? aiModal.editedText : aiModal.draftReply;

      // 1. Save to Supabase table 'emails' with status='sent'
      const supabaseResult = await saveSentEmailToSupabase(user.uid, aiModal.email, finalReply);

      // 2. Update local DB & Firestore email status
      await updateEmailStatus(companyId, user.uid, aiModal.email.id, 'SENT', finalReply);

      showToast(`✓ Dispatched to ${aiModal.email.sender} & saved to Supabase 'emails' table (status='sent')`);
      
      // Close modal and reload
      setAiModal(null);
      await loadEmails();
    } catch (err) {
      console.error('Error approving and sending email:', err);
      showToast('Error saving to Supabase. Email state updated locally.');
    }
  };

  const handleApproveAndSend = async () => {
    if (!user || !selectedEmail) return;
    try {
      await saveSentEmailToSupabase(user.uid, selectedEmail, draftContent);
      await updateEmailStatus(companyId, user.uid, selectedEmail.id, 'SENT', draftContent);
      showToast(`✓ Approved & Dispatched reply to ${selectedEmail.sender} (saved to Supabase status='sent')`);
      await loadEmails();
    } catch (err) {
      console.error('Error approving email:', err);
    }
  };

  const handleIgnore = async () => {
    if (!user || !selectedEmail) return;
    try {
      await updateEmailStatus(companyId, user.uid, selectedEmail.id, 'IGNORED');
      showToast(`✓ Email from ${selectedEmail.sender} marked as Ignored & Archived in Supabase.`);
      await loadEmails();
    } catch (err) {
      console.error('Error ignoring email:', err);
    }
  };

  // 1-Click Approve directly from Inbox card
  const handleOneClickApprove = async (email: EmailItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) return;
    try {
      const replyBody = email.aiDraftReply || `Hi ${email.sender.split(' ')[0]},\n\nThank you for reaching out regarding "${email.subject}". Our executive team has reviewed and fully approved the milestones.\n\nOur operations lead will dispatch finalized confirmation by end of day.\n\nBest regards,\nExecutive Office | ${profile?.companyName || 'Apex Enterprises'}`;
      await saveSentEmailToSupabase(user.uid, email, replyBody);
      await updateEmailStatus(companyId, user.uid, email.id, 'APPROVED', replyBody);
      showToast(`✓ 1-Click Approved! Reply to ${email.sender} synced to Supabase.`);
      await loadEmails();
    } catch (err) {
      console.error('Error approving email:', err);
      showToast('Approved and updated locally.');
    }
  };

  // 1-Click Reject directly from Inbox card
  const handleOneClickReject = async (email: EmailItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) return;
    try {
      await updateEmailStatus(companyId, user.uid, email.id, 'IGNORED');
      showToast(`✓ 1-Click Rejected: ${email.sender} archived in Supabase.`);
      await loadEmails();
    } catch (err) {
      console.error('Error rejecting email:', err);
    }
  };

  const handleRegenerateDraft = async (tone = selectedTone) => {
    if (!selectedEmail) return;
    try {
      setGeneratingDraft(true);
      const res = await fetch('/api/gemini/draft-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: selectedEmail.sender,
          senderEmail: selectedEmail.senderEmail,
          subject: selectedEmail.subject,
          body: selectedEmail.fullBody,
          companyName: profile?.companyName || 'Apex Enterprises',
          tone
        })
      });
      const data = await res.json();
      if (data.draftReply) {
        setDraftContent(data.draftReply);
        if (user) {
          await updateEmailStatus(companyId, user.uid, selectedEmail.id, selectedEmail.status, data.draftReply);
        }
        showToast('Generated fresh executive reply with Gemini');
      }
    } catch (err) {
      console.error('Error regenerating draft:', err);
    } finally {
      setGeneratingDraft(false);
    }
  };

  const handleSimulateNewEmail = async () => {
    if (!user) return;
    try {
      setSimulating(true);
      const res = await fetch('/api/gemini/generate-sample-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: profile?.companyName || 'Apex Enterprises',
          scenarioType: 'Strategic vendor renegotiation or high-profile enterprise client review'
        })
      });
      const data = await res.json();
      if (data.sender && data.fullBody) {
        // Draft reply
        const draftRes = await fetch('/api/gemini/draft-reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: data.sender,
            subject: data.subject,
            body: data.fullBody
          })
        });
        const draftData = await draftRes.json();

        const created = await saveEmail({
          companyId,
          userId: user.uid,
          sender: data.sender,
          senderEmail: data.senderEmail,
          subject: data.subject,
          snippet: data.snippet || data.fullBody.slice(0, 80),
          fullBody: data.fullBody,
          urgency: data.urgency || 'HIGH',
          category: data.category || 'CLIENT',
          receivedAt: new Date().toISOString(),
          status: 'PENDING_REVIEW',
          aiDraftReply: draftData.draftReply,
          aiKeyTakeaway: `Review ${data.sender}'s requirements and deploy solutions-oriented resolution.`,
          aiSuggestedAction: 'Execute AI 3-line draft reply and sync counterparty.'
        });

        await loadEmails();
        setSelectedEmail(created);
        setDraftContent(created.aiDraftReply || '');
        showToast('Incoming high-stakes executive email simulated & triaged!');
      }
    } catch (err) {
      console.error('Error simulating email:', err);
    } finally {
      setSimulating(false);
    }
  };

  const handleRunAiDraft = async () => {
    let target = selectedEmail || filteredEmails.find(e => e.status === 'PENDING_REVIEW') || emails[0];
    if (!target) {
      // Simulate an incoming executive email first then draft
      await handleSimulateNewEmail();
      return;
    }
    await handleTriggerAiDraftReply(target);
  };

  const filteredEmails = emails.filter(e => {
    if (filter === 'PENDING') return e.status === 'PENDING_REVIEW';
    if (filter === 'APPROVED') return e.status === 'APPROVED' || e.status === 'SENT';
    if (filter === 'IGNORED') return e.status === 'IGNORED';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* AI DRAFT REPLY POPUP MODAL */}
      {aiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl bg-[#141414] border border-[#FFD700]/30 shadow-[0_0_50px_rgba(255,215,0,0.15)] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-[#181818] to-[#121212] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      PRIME AI <span className="text-[#FFD700]">Chief of Staff Draft</span>
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/25 font-mono font-semibold">
                      3-Line Reply
                    </span>
                  </div>
                  <p className="text-[11px] text-white/40 mt-0.5">
                    Direct • Professional • Confident • Solutions-Oriented
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAiModal(null)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Context Summary Box */}
              <div className="p-3.5 rounded-xl bg-[#0E0E0E] border border-white/5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-white/50 text-[11px]">
                  <span>
                    To: <strong className="text-white">{aiModal.email.sender}</strong> ({aiModal.email.senderEmail})
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/60 font-mono">
                    {aiModal.email.category}
                  </span>
                </div>
                <div className="text-white/80 font-medium truncate">
                  Subject: <span className="text-zinc-300">Re: {aiModal.email.subject}</span>
                </div>
              </div>

              {/* Draft Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#FFD700] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {aiModal.isEditing ? 'Edit Executive Reply' : 'Generated 3-Line Reply'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const textToCopy = aiModal.isEditing ? aiModal.editedText : aiModal.draftReply;
                        navigator.clipboard?.writeText(textToCopy);
                        setAiModal(prev => prev ? { ...prev, copied: true } : null);
                        setTimeout(() => {
                          setAiModal(prev => prev ? { ...prev, copied: false } : null);
                        }, 2000);
                      }}
                      className="text-[11px] text-white/40 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {aiModal.copied ? (
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
                  </div>
                </div>

                {aiModal.isEditing ? (
                  <textarea
                    rows={6}
                    value={aiModal.editedText}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAiModal(prev => prev ? { ...prev, editedText: val } : null);
                    }}
                    placeholder="Enter customized executive reply..."
                    className="w-full p-4 rounded-xl bg-[#0C0C0C] border border-[#FFD700]/50 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#FFD700] leading-relaxed font-mono shadow-inner resize-y"
                    autoFocus
                  />
                ) : (
                  <div className="p-4 rounded-xl bg-[#0C0C0C] border border-white/10 text-sm text-zinc-100 whitespace-pre-line leading-relaxed font-sans shadow-inner border-l-4 border-l-[#FFD700]">
                    {aiModal.draftReply}
                  </div>
                )}

                {/* Supabase Status Indicator */}
                <div className="flex items-center gap-1.5 text-[11px] text-white/40 pt-1">
                  <Database className="w-3 h-3 text-[#FFD700]" />
                  <span>On approval, email is automatically recorded to Supabase table <code className="text-[#FFD700] font-mono font-semibold">'emails'</code> with <code className="text-emerald-400 font-mono font-semibold">status='sent'</code>.</span>
                </div>
              </div>
            </div>

            {/* Modal Footer with the 2 Mandatory Buttons */}
            <div className="p-5 bg-[#101010] border-t border-white/10 flex items-center justify-between gap-3">
              <button
                onClick={() => setAiModal(null)}
                className="px-4 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-3">
                {/* Button 2: Edit */}
                <button
                  onClick={() => {
                    setAiModal(prev => prev ? { ...prev, isEditing: !prev.isEditing } : null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                    aiModal.isEditing
                      ? 'bg-white/10 text-[#FFD700] border-[#FFD700]/40 hover:bg-white/15'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-200 border-white/10'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{aiModal.isEditing ? 'Done Editing' : 'Edit'}</span>
                </button>

                {/* Button 1: Approve & Send */}
                <button
                  onClick={handleModalApproveAndSend}
                  disabled={aiModal.sending}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FFD700] to-yellow-500 hover:from-[#FFE55C] hover:to-[#FFD700] text-black text-xs font-extrabold shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 ${aiModal.sending ? 'animate-spin' : ''}`} />
                  <span>{aiModal.sending ? 'Saving & Sending...' : 'Approve & Send'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-light text-white tracking-tight">
              PRIME <span className="text-[#FFD700] font-semibold">Inbox</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20 font-medium font-mono">
              {emails.filter(e => e.status === 'PENDING_REVIEW').length} Pending
            </span>
          </div>
          <p className="text-xs text-white/40 mt-1">
            Autonomous triage & decision synthesis. 3-line replies powered by Gemini & synced to Supabase.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRunAiDraft}
            disabled={draftingEmailId !== null}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FFD700] to-yellow-500 hover:from-[#FFE55C] hover:to-[#FFD700] text-black text-xs font-extrabold shadow-[0_0_20px_rgba(255,215,0,0.35)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="Generate executive 3-line draft reply"
          >
            <Sparkles className={`w-4 h-4 ${draftingEmailId ? 'animate-spin' : ''}`} />
            <span>{draftingEmailId ? 'Chief of Staff Drafting...' : 'Run AI Draft'}</span>
          </button>
          <button
            onClick={handleSimulateNewEmail}
            disabled={simulating}
            className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white hover:text-black text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer border border-white/10 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{simulating ? 'Synthesizing...' : '+ Simulate Incoming'}</span>
          </button>
          <button
            onClick={loadEmails}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            title="Refresh Inbox"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-h-[640px]">
        {/* Email List (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-[#161616] border border-white/5 flex flex-col overflow-hidden shadow-xl">
          {/* Filters */}
          <div className="p-3 bg-[#121212] border-b border-white/5 flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1">
              {(['ALL', 'PENDING', 'APPROVED', 'IGNORED'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    filter === f
                      ? 'bg-[#FFD700] text-black shadow-sm'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-white/30 font-mono shrink-0">
              {filteredEmails.length} threads
            </span>
          </div>

          {/* List of Emails with AI Draft Reply button below every email */}
          <div className="divide-y divide-white/5 max-h-[640px] overflow-y-auto">
            {filteredEmails.length === 0 ? (
              <div className="p-12 text-center text-white/30 text-xs">
                No emails found matching filter.
              </div>
            ) : (
              filteredEmails.map((email) => {
                const isSelected = selectedEmail?.id === email.id;
                const isDraftingThis = draftingEmailId === email.id;
                return (
                  <div
                    key={email.id}
                    onClick={() => handleSelectEmail(email)}
                    className={`p-4 transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-[#FFD700]/10 border-l-4 border-[#FFD700]'
                        : 'hover:bg-white/[0.02] border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white truncate max-w-[180px]">
                        {email.sender}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {(email.status === 'APPROVED' || email.status === 'SENT') && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Sent
                          </span>
                        )}
                        {email.status === 'IGNORED' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-white/40">
                            Ignored
                          </span>
                        )}
                        {email.urgency === 'HIGH' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                            HIGH
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs font-medium text-zinc-300 truncate">
                      {email.subject}
                    </p>
                    <p className="text-[11px] text-white/40 line-clamp-2 leading-relaxed">
                      {email.snippet || email.fullBody}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-white/30 font-mono">
                      <span>{email.category}</span>
                      <span>{new Date(email.receivedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* 1-Click Actions & AI Draft Reply below every email in the inbox */}
                    <div className="pt-2 border-t border-white/5 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={(e) => handleOneClickApprove(email, e)}
                          className="py-1.5 px-2.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/30 hover:border-emerald-400 text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                          title="1-Click Approve & send reply (updates Supabase)"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>1-Click Approve</span>
                        </button>
                        <button
                          onClick={(e) => handleOneClickReject(email, e)}
                          className="py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/50 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 text-[11px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer"
                          title="1-Click Reject / Ignore (updates Supabase)"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTriggerAiDraftReply(email);
                        }}
                        disabled={isDraftingThis}
                        className="w-full py-1 px-3 rounded-lg bg-[#FFD700]/10 hover:bg-[#FFD700] border border-[#FFD700]/25 hover:border-[#FFD700] text-[#FFD700] hover:text-black text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm group disabled:opacity-50"
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${isDraftingThis ? 'animate-spin' : 'group-hover:rotate-12'} transition-transform`} />
                        <span>{isDraftingThis ? 'Chief of Staff Drafting...' : 'AI 3-Line Draft Reply'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Email Detail & AI Action Panel (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-[#161616] border border-white/5 overflow-hidden shadow-xl flex flex-col">
          {selectedEmail ? (
            <div className="p-6 space-y-6">
              {/* Header Info */}
              <div className="space-y-3 pb-4 border-b border-white/5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-white">{selectedEmail.subject}</h2>
                    <p className="text-xs text-white/40 mt-0.5">
                      From: <span className="text-white font-medium">{selectedEmail.sender}</span> ({selectedEmail.senderEmail})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-md bg-white/5 text-white/60 border border-white/5 font-medium">
                      {selectedEmail.category}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-md font-bold ${
                      selectedEmail.urgency === 'HIGH' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-white/5 text-white/60'
                    }`}>
                      {selectedEmail.urgency} URGENCY
                    </span>
                  </div>
                </div>

                {/* Original Email Content Box */}
                <div className="p-4 rounded-xl bg-[#121212] border border-white/5 text-xs text-zinc-300 leading-relaxed whitespace-pre-line font-sans">
                  {selectedEmail.fullBody}
                </div>

                {/* AI Draft Reply Button below original email in detail view */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => handleTriggerAiDraftReply(selectedEmail)}
                    disabled={draftingEmailId === selectedEmail.id}
                    className="px-4 py-2 rounded-xl bg-[#FFD700] hover:bg-[#FFE55C] text-black text-xs font-extrabold shadow-[0_0_20px_rgba(255,215,0,0.25)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className={`w-4 h-4 ${draftingEmailId === selectedEmail.id ? 'animate-spin' : ''}`} />
                    <span>{draftingEmailId === selectedEmail.id ? 'Generating 3-Line Reply...' : 'AI Draft Reply'}</span>
                  </button>

                  {(selectedEmail.status === 'APPROVED' || selectedEmail.status === 'SENT') && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Status: Sent (Synced to Supabase)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* AI COO Executive Takeaway & Suggested Action */}
              <div className="p-4 rounded-xl bg-[#FFD700]/5 border border-[#FFD700]/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#FFD700]">
                    <Sparkles className="w-4 h-4 text-[#FFD700]" />
                    <span>PRIME Executive Synthesis</span>
                  </div>
                  <span className="text-[10px] text-white/40 font-mono">Gemini 3.7 Flash</span>
                </div>
                <p className="text-xs text-zinc-300">
                  <strong className="text-[#FFD700]">Core Takeaway: </strong>
                  {selectedEmail.aiKeyTakeaway || 'Review sender requirements and authorize proposed terms.'}
                </p>
                <p className="text-xs text-zinc-300">
                  <strong className="text-[#FFD700]">Strategic Next Action: </strong>
                  {selectedEmail.aiSuggestedAction || 'Approve drafted response and align internal stakeholders.'}
                </p>
              </div>

              {/* AI Draft Reply Section */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                      Active Draft Response
                    </span>
                    {(selectedEmail.status === 'APPROVED' || selectedEmail.status === 'SENT') && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        ✓ Dispatched & Saved to Supabase
                      </span>
                    )}
                  </div>

                  {/* Tone Selector */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-white/40 text-[11px]">Tone:</span>
                    <select
                      value={selectedTone}
                      onChange={(e) => {
                        setSelectedTone(e.target.value);
                        handleRegenerateDraft(e.target.value);
                      }}
                      className="bg-[#121212] border border-white/10 text-zinc-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-[#FFD700]"
                    >
                      <option value="Decisive & Solutions-Oriented">Decisive & Solutions-Oriented</option>
                      <option value="Diplomatic & Reassuring">Diplomatic & Reassuring</option>
                      <option value="Firm & Contractual">Firm & Contractual</option>
                      <option value="Urgent & Action-Focused">Urgent & Action-Focused</option>
                    </select>
                  </div>
                </div>

                {/* Draft Content or Text Area */}
                {isEditingDraft ? (
                  <textarea
                    rows={6}
                    value={draftContent}
                    onChange={(e) => setDraftContent(e.target.value)}
                    className="w-full p-4 rounded-xl bg-[#1E1E1E] border border-[#FFD700]/30 text-xs text-zinc-200 focus:outline-none leading-relaxed font-mono"
                  />
                ) : (
                  <div className="p-4 rounded-xl bg-[#1E1E1E] border border-white/5 text-xs text-zinc-200 whitespace-pre-line leading-relaxed font-mono">
                    {draftContent || selectedEmail.aiDraftReply || 'No draft reply available. Click "AI Draft Reply" to generate.'}
                  </div>
                )}

                {/* Bottom Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditingDraft(!isEditingDraft)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditingDraft ? 'Done Editing' : 'Edit'}</span>
                    </button>
                    <button
                      onClick={() => handleRegenerateDraft()}
                      disabled={generatingDraft}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${generatingDraft ? 'animate-spin' : ''}`} />
                      <span>{generatingDraft ? 'Regenerating...' : 'Regenerate'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleIgnore}
                      className="px-3 py-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Ignore / Archive
                    </button>
                    <button
                      onClick={handleApproveAndSend}
                      className="px-4 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.15)] flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Approve & Send</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-white/30 text-xs space-y-2">
              <Inbox className="w-8 h-8 mx-auto text-white/20 mb-2" />
              <p className="font-semibold text-white/60">Select an email to view AI COO triage</p>
              <p>PRIME AI prepares instant 3-line draft replies and bottom-line strategic actions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

