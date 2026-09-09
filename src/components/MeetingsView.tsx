import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Send, 
  Copy, 
  Check, 
  Play, 
  Pause, 
  FileText, 
  ListChecks, 
  Mail, 
  Crown, 
  RefreshCw, 
  ArrowUpRight,
  Database,
  Trash2,
  Calendar,
  Layers,
  Search,
  Users,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MeetingRecord, MeetingActionItem, MeetingDraftEmail } from '../types';
import { saveMeetingToSupabase, fetchUserMeetings, saveEmail } from '../services/db';

const SAMPLE_MEETINGS = [
  {
    title: 'Q3 Board Strategy & Executive Resource Allocation',
    description: 'CEO, CFO & Head of Operations align on $4.5M infrastructure scaling budget, latency targets & enterprise headcount.',
    transcript: `[00:00] CEO: Welcome everyone. Today we must finalize our Q3 resource allocation and settle the AI infrastructure budget.
[00:15] CFO: We have modeled the Cloud Run and GPU cluster expansion. We are proposing a $4.5M allocation with a 22% buffer for multi-agent workloads.
[00:42] VP Engineering: We need this approved today. Our current latency SLA is 420ms, but with the new pipeline optimization we can reach sub-200ms.
[01:10] Head of Revenue: If engineering hits sub-200ms, our enterprise closing cycle with FinTech Global and Apex Partners accelerates by at least 3 weeks.
[01:35] CEO: Decision confirmed: budget is approved. Let's make sure Sarah circulates the updated Board deck by Monday 9 AM.
[01:50] CFO: I will lock in the vendor contracts by Thursday end-of-day. Engineering, please deliver the load test benchmarks by Friday.
[02:10] CEO: Perfect. Meeting adjourned.`,
  },
  {
    title: 'Enterprise Client QBR & SLA Escalation Review',
    description: 'Cross-functional executive triage resolving a high-value customer ticket escalation and drafting new enterprise SLA guarantees.',
    transcript: `[00:00] Chief Customer Officer: We are reviewing the Vanguard Capital SLA ticket from Tuesday.
[00:20] VP Engineering: Root cause was a Redis cache failover during peak US trading hours. Total degradation lasted 4.2 minutes.
[00:45] Head of Product: We have already rolled out multi-region redundancy. We must present our post-mortem and updated 99.99% uptime guarantee.
[01:15] CEO: Marcus, lead the executive outreach to Vanguard's CTO directly today. Offer a 10% credit and walk them through the architecture fix.
[01:40] CCO: Agreed. I will draft the post-mortem report and attach the telemetry charts before 2 PM.`,
  }
];

export const MeetingsView: React.FC = () => {
  const { user, companyId } = useAuth();
  const [meetings, setMeetings] = useState<MeetingRecord[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingRecord | null>(null);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Media upload state
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number; base64?: string; mimeType?: string; url?: string } | null>(null);
  const [manualTranscript, setManualTranscript] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'sample'>('upload');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load meeting archives on mount
  useEffect(() => {
    if (user) {
      loadMeetings();
    }
  }, [user]);

  const loadMeetings = async () => {
    if (!user) return;
    try {
      setLoadingList(true);
      const data = await fetchUserMeetings(user.uid);
      setMeetings(data);
      if (data.length > 0 && !selectedMeeting) {
        setSelectedMeeting(data[0]);
      }
    } catch (err) {
      console.error('Error fetching meetings:', err);
    } finally {
      setLoadingList(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!meetingTitle) {
      // Auto-populate title from filename
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setMeetingTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const blobUrl = URL.createObjectURL(file);
      setUploadedFile({
        name: file.name,
        size: file.size,
        base64,
        mimeType: file.type || 'video/mp4',
        url: blobUrl,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeMeeting = async () => {
    if (!user) return;
    if (!uploadedFile && !manualTranscript.trim()) {
      return;
    }

    try {
      setAnalyzing(true);
      setEmailSentSuccess(false);

      const titleToSend = meetingTitle.trim() || uploadedFile?.name.replace(/\.[^/.]+$/, '') || 'Executive Strategic Alignment Meeting';

      const response = await fetch('/api/gemini/meeting-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingTitle: titleToSend,
          videoOrAudioBase64: uploadedFile?.base64,
          mimeType: uploadedFile?.mimeType,
          transcriptText: manualTranscript.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to analyze meeting');
      }

      const result = await response.json();

      // Save to Supabase 'meetings' table
      const savedRecord = await saveMeetingToSupabase(user.uid, {
        title: titleToSend,
        summary: result.summary || 'Meeting synthesized successfully.',
        action_items: Array.isArray(result.action_items) ? result.action_items : [],
        draft_followup_email: result.draft_followup_email || {
          subject: `Meeting Follow-Up: ${titleToSend}`,
          body: 'Team, thank you for attending today\'s meeting.',
        },
        transcript: result.transcript || manualTranscript || 'Live audio transcript captured.',
        filename: uploadedFile?.name,
        fileSize: uploadedFile?.size,
      });

      setSelectedMeeting(savedRecord);
      setMeetings(prev => [savedRecord, ...prev.filter(m => m.id !== savedRecord.id)]);
      
      // Reset inputs
      setUploadedFile(null);
      setManualTranscript('');
      setMeetingTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      console.error('Meeting analysis error:', err);
      alert(err.message || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLoadSample = (sample: typeof SAMPLE_MEETINGS[0]) => {
    setMeetingTitle(sample.title);
    setManualTranscript(sample.transcript);
    setUploadedFile({
      name: `${sample.title.toLowerCase().replace(/\s+/g, '-')}.mp3`,
      size: 4820000,
      mimeType: 'audio/mp3',
    });
    setActiveTab('upload');
  };

  const handleSendDraftEmail = async () => {
    if (!user || !selectedMeeting || !selectedMeeting.draft_followup_email) return;
    try {
      setEmailSending(true);
      
      // Save directly to Supabase table 'emails' with status 'SENT'
      await saveEmail({
        companyId: companyId || 'comp_apex_01',
        userId: user.uid,
        sender: 'Executive Chief of Staff',
        senderEmail: user.email || 'executive@apexenterprises.ai',
        subject: selectedMeeting.draft_followup_email.subject,
        snippet: selectedMeeting.draft_followup_email.body.slice(0, 100),
        fullBody: selectedMeeting.draft_followup_email.body,
        urgency: 'HIGH',
        category: 'TEAM',
        receivedAt: new Date().toISOString(),
        status: 'SENT',
        aiDraftReply: selectedMeeting.draft_followup_email.body,
        aiKeyTakeaway: selectedMeeting.summary.slice(0, 120),
        aiSuggestedAction: 'Meeting follow-up dispatched to attendees and saved to Supabase.'
      });

      setEmailSentSuccess(true);
      
      // Update local state to show email sent
      setSelectedMeeting({
        ...selectedMeeting,
        emailSent: true
      });
      setMeetings(prev => prev.map(m => m.id === selectedMeeting.id ? { ...m, emailSent: true } : m));
    } catch (err) {
      console.error('Error sending meeting follow-up email:', err);
    } finally {
      setEmailSending(false);
    }
  };

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const toggleActionItemComplete = (index: number) => {
    if (!selectedMeeting) return;
    const updatedItems = [...selectedMeeting.action_items];
    updatedItems[index] = {
      ...updatedItems[index],
      completed: !updatedItems[index].completed,
    };

    const updated = {
      ...selectedMeeting,
      action_items: updatedItems,
    };
    setSelectedMeeting(updated);
    setMeetings(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  const filteredMeetings = meetings.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#B8860B] flex items-center justify-center text-black shadow-[0_0_20px_rgba(255,215,0,0.2)]">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  PRIME <span className="text-[#FFD700]">MEETING AI</span>
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FFD700] text-black">
                  PAGE 8
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  <Database className="w-3 h-3" /> Supabase: meetings
                </span>
              </div>
              <p className="text-xs text-white/50">
                Autonomous Executive Chief of Staff meeting transcription, 3-section executive synthesis & 1-click follow-up dispatch.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadMeetings}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            title="Refresh Meetings Archive"
          >
            <RefreshCw className={`w-4 h-4 ${loadingList ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: Upload & Studio (Left) + Archives (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Meeting Studio (Upload + 3 Display Sections) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* UPLOAD & INPUT CARD */}
          <div className="p-6 rounded-2xl bg-[#141414] border border-white/5 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#FFD700] flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-[#FFD700]" /> Upload Recording or Audio
                </span>
              </div>
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'upload' ? 'bg-[#FFD700] text-black shadow' : 'text-white/40 hover:text-white'
                  }`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setActiveTab('sample')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'sample' ? 'bg-[#FFD700] text-black shadow' : 'text-white/40 hover:text-white'
                  }`}
                >
                  Executive Presets
                </button>
              </div>
            </div>

            {/* Meeting Title Input */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-white/50 mb-1.5">
                Meeting Title / Strategic Topic
              </label>
              <input
                type="text"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                placeholder="e.g. Q3 Executive Strategy & Board Resource Allocation"
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#FFD700]/50 transition-colors"
              />
            </div>

            {activeTab === 'upload' ? (
              <div className="space-y-4">
                {/* File Dropzone */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="audio/mp3,audio/wav,audio/m4a,video/mp4,video/webm" 
                  className="hidden" 
                />

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    uploadedFile 
                      ? 'border-[#FFD700]/50 bg-[#FFD700]/5' 
                      : 'border-white/10 hover:border-[#FFD700]/30 bg-black/20 hover:bg-black/40'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 mx-auto flex items-center justify-center text-[#FFD700] mb-3">
                    {uploadedFile ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <Upload className="w-6 h-6" />}
                  </div>
                  
                  {uploadedFile ? (
                    <div>
                      <p className="text-sm font-bold text-white">{uploadedFile.name}</p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for Chief of Staff synthesis
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-bold text-white">Click to upload MP4 video or MP3/WAV audio</p>
                      <p className="text-xs text-white/40 mt-1">Supports Zoom, Google Meet recordings & voice memos up to 100MB</p>
                    </div>
                  )}
                </div>

                {/* Optional Transcript Input */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-white/50 mb-1.5">
                    Or Paste Meeting Notes / Audio Transcript (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={manualTranscript}
                    onChange={(e) => setManualTranscript(e.target.value)}
                    placeholder="[00:00] CEO: Let's review Q3 resource allocations..."
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs font-mono placeholder:text-white/20 focus:outline-none focus:border-[#FFD700]/50 transition-colors"
                  />
                </div>
              </div>
            ) : (
              /* Sample Presets Tab */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SAMPLE_MEETINGS.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleLoadSample(s)}
                    className="p-4 rounded-xl bg-black/30 border border-white/5 hover:border-[#FFD700]/40 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFD700]/10 text-[#FFD700]">
                        Preset Demo #{idx + 1}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-white/30 group-hover:text-[#FFD700] transition-colors" />
                    </div>
                    <p className="text-xs font-bold text-white mb-1 group-hover:text-[#FFD700] transition-colors">{s.title}</p>
                    <p className="text-[11px] text-white/40 line-clamp-2 leading-relaxed">{s.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Action Trigger Button */}
            <button
              onClick={handleAnalyzeMeeting}
              disabled={analyzing || (!uploadedFile && !manualTranscript.trim() && !meetingTitle)}
              className="w-full py-3.5 bg-gradient-to-r from-[#FFD700] to-[#E6B800] hover:from-[#FFE033] hover:to-[#FFD700] text-black font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_25px_rgba(255,215,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
              <span>{analyzing ? 'Synthesizing Meeting Intelligence...' : 'Process Meeting & Generate Action Items'}</span>
            </button>
          </div>

          {/* ========================================================= */}
          {/* DISPLAY: 3 SECTIONS (SUMMARY, ACTION ITEMS, DRAFT EMAIL) */}
          {/* ========================================================= */}
          {selectedMeeting ? (
            <div className="space-y-6">
              
              {/* SECTION 1: EXECUTIVE SUMMARY CARD */}
              <div className="p-6 rounded-2xl bg-[#141414] border border-white/5 shadow-xl space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700]">
                      <Crown className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#FFD700]">
                      Section 1: Executive Summary
                    </span>
                  </div>

                  <button
                    onClick={() => copyToClipboard(selectedMeeting.summary, 'summary')}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedSection === 'summary' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'summary' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                  <h3 className="text-base font-bold text-white mb-2">{selectedMeeting.title}</h3>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">{selectedMeeting.summary}</p>
                </div>
              </div>

              {/* SECTION 2: ACTION ITEMS CHECKLIST */}
              <div className="p-6 rounded-2xl bg-[#141414] border border-white/5 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <ListChecks className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                      Section 2: Action Items Checklist ({selectedMeeting.action_items?.length || 0})
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      const text = selectedMeeting.action_items.map((a, i) => `${i + 1}. [${a.owner}] ${a.task}`).join('\n');
                      copyToClipboard(text, 'actions');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedSection === 'actions' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy All Items</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {selectedMeeting.action_items && selectedMeeting.action_items.length > 0 ? (
                    selectedMeeting.action_items.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => toggleActionItemComplete(idx)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          item.completed 
                            ? 'bg-emerald-500/[0.04] border-emerald-500/20 text-white/40 line-through' 
                            : 'bg-black/40 border-white/5 hover:border-white/15 text-white'
                        }`}
                      >
                        <div className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                          item.completed 
                            ? 'bg-emerald-500 border-emerald-500 text-black' 
                            : 'border-white/20 text-transparent hover:border-[#FFD700]'
                        }`}>
                          <Check className="w-3.5 h-3.5" />
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20">
                              {item.owner}
                            </span>
                            <span className="text-[10px] text-white/40">Priority Tactical Item</span>
                          </div>
                          <p className="text-xs text-zinc-200 font-sans leading-relaxed">
                            {item.task}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-white/40 p-4 text-center">No action items extracted from this meeting.</p>
                  )}
                </div>
              </div>

              {/* SECTION 3: DRAFT FOLLOW-UP EMAIL WITH SEND BUTTON */}
              <div className="p-6 rounded-2xl bg-[#141414] border border-white/5 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
                      Section 3: Draft Follow-Up Email
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(`${selectedMeeting.draft_followup_email.subject}\n\n${selectedMeeting.draft_followup_email.body}`, 'email')}
                      className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedSection === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Email</span>
                    </button>
                  </div>
                </div>

                {/* Email Box */}
                <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-3">
                  <div className="pb-2 border-b border-white/5 flex items-center gap-2 text-xs">
                    <span className="text-white/40 font-semibold">Subject:</span>
                    <span className="text-white font-medium">{selectedMeeting.draft_followup_email?.subject || `Follow-up: ${selectedMeeting.title}`}</span>
                  </div>

                  <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
                    {selectedMeeting.draft_followup_email?.body}
                  </pre>
                </div>

                {/* Send Button */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-white/40">
                    {selectedMeeting.emailSent || emailSentSuccess ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-4 h-4" /> Follow-up Dispatched to Executive Inbox & Supabase
                      </span>
                    ) : (
                      <span>Dispatches follow-up email directly to Supabase table &apos;emails&apos;</span>
                    )}
                  </div>

                  <button
                    onClick={handleSendDraftEmail}
                    disabled={emailSending || selectedMeeting.emailSent || emailSentSuccess}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                      selectedMeeting.emailSent || emailSentSuccess
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-[#FFD700] hover:bg-[#FFE033] text-black shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                    }`}
                  >
                    <Send className={`w-3.5 h-3.5 ${emailSending ? 'animate-spin' : ''}`} />
                    <span>
                      {emailSending ? 'Dispatching...' : selectedMeeting.emailSent || emailSentSuccess ? 'Approved & Sent' : 'Approve & Send Email'}
                    </span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* Empty State */
            <div className="p-12 rounded-2xl bg-[#141414] border border-white/5 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-white/5 mx-auto flex items-center justify-center text-white/30">
                <Video className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No Meeting Selected</h3>
                <p className="text-xs text-white/40 max-w-md mx-auto mt-1">
                  Upload an MP4/MP3 recording above or select an existing synthesized meeting from your archive on the right.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Historical Meetings Archive (Supabase Sync) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-[#141414] border border-white/5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#FFD700]" /> Meeting Intelligence Hub
              </span>
              <span className="text-[10px] font-mono text-white/30">
                {meetings.length} Recorded
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search meeting titles, topics..."
                className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/5 rounded-xl text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#FFD700]/30"
              />
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {loadingList ? (
                <div className="py-8 text-center text-xs text-white/30 animate-pulse">
                  Streaming meeting logs from Supabase...
                </div>
              ) : filteredMeetings.length === 0 ? (
                <div className="py-8 text-center text-xs text-white/30">
                  No meeting sessions logged yet.
                </div>
              ) : (
                filteredMeetings.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedMeeting(m);
                      setEmailSentSuccess(m.emailSent || false);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      selectedMeeting?.id === m.id
                        ? 'bg-[#FFD700]/10 border-[#FFD700]/40 shadow-lg'
                        : 'bg-black/30 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-[#FFD700]">
                        {m.action_items?.length || 0} Action Items
                      </span>
                      <span className="text-[10px] text-white/30">
                        {new Date(m.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-white line-clamp-1 mb-1">
                      {m.title}
                    </p>

                    <p className="text-[11px] text-white/40 line-clamp-2 leading-relaxed">
                      {m.summary}
                    </p>

                    {m.emailSent && (
                      <div className="mt-2 flex items-center gap-1 text-[9px] text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Email Dispatched
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
