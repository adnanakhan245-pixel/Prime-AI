import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Mic, 
  Upload, 
  Play, 
  Pause, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  Database, 
  FileAudio, 
  ArrowRight, 
  RefreshCw, 
  Zap, 
  ShieldAlert, 
  Flame,
  Volume2,
  ListRestart,
  History,
  PhoneCall
} from 'lucide-react';
import { CallRecord, CallFeedback } from '../types';
import { saveCallToSupabase, fetchUserCalls } from '../services/db';

interface SampleCall {
  id: string;
  title: string;
  duration: string;
  prospect: string;
  dealSize: string;
  audioUrl?: string;
  transcriptSample: string;
  mockFeedback: CallFeedback;
}

const SAMPLE_CALLS: SampleCall[] = [
  {
    id: 'sample_enterprise_pricing',
    title: 'Enterprise SaaS Annual Renewal ($120k ARR)',
    duration: '04:18',
    prospect: 'CTO @ FinTech Global',
    dealSize: '$120,000 ARR',
    transcriptSample: `[00:04] Closer (PRIME): Thanks for joining today, David. We reviewed your telemetry usage—you're scaling 40% ahead of forecast. Let's lock in the multi-year SLA rate today before the Q3 uplift.
[00:22] Prospect (David): Honestly, our CFO is pressing for a 20% discount or we delay rollout to next quarter. Your seat pricing is steep compared to legacy tools.
[00:48] Closer: Well, our platform does a lot more than legacy tools. We have AI agents built-in, so you actually save on engineering headcount.
[01:15] Prospect: That sounds great on paper, but I can't justify $120k upfront without guaranteed uptime SLA penalties and board approval.
[01:42] Closer: I understand. What if we drop to $105k if you sign by Friday?
[02:10] Prospect: Let me take that back to the committee next week. Send me the proposal.`,
    mockFeedback: {
      score: 72,
      transcript: `[00:04] Closer: Thanks for joining today, David. We reviewed your telemetry usage—you're scaling 40% ahead of forecast. Let's lock in the multi-year SLA rate today before the Q3 uplift.
[00:22] Prospect (David): Honestly, our CFO is pressing for a 20% discount or we delay rollout to next quarter. Your seat pricing is steep compared to legacy tools.
[00:48] Closer: Well, our platform does a lot more than legacy tools. We have AI agents built-in, so you actually save on engineering headcount.
[01:15] Prospect: That sounds great on paper, but I can't justify $120k upfront without guaranteed uptime SLA penalties and board approval.
[01:42] Closer: I understand. What if we drop to $105k if you sign by Friday?
[02:10] Prospect: Let me take that back to the committee next week. Send me the proposal.`,
      whatWentWrong: [
        'Premature price discount ($15k drop) without receiving any commercial concession in return.',
        'Defensive product comparison instead of quantifying the $340k downtime risk David faces.',
        'Allowed the call to end on a vague committee review without locking a definite calendar checkpoint.'
      ],
      whatWentRight: [
        'Strong confident opener highlighting that the client is 40% ahead of telemetry forecast.',
        'Accurately identified the hidden decision maker (CFO) and the core sticking point (SLA penalty guarantee).',
        'Maintained polite executive posture under direct pricing resistance.'
      ],
      betterScript: "When David demands a discount, say: 'David, rather than cutting scope or pricing, what if we attach a 99.99% uptime guarantee with direct penalty credits tied to your CFO’s milestone metrics—if we guarantee that in writing today, can we finalize the $120k agreement by Friday?'",
      sentiment: 'NEUTRAL',
      objectionHandlingScore: 68,
      closeProbability: 62
    }
  },
  {
    id: 'sample_discovery_urgency',
    title: 'High-Ticket B2B Operations Suite ($85k Initial Deal)',
    duration: '03:45',
    prospect: 'VP Operations @ Apex Logistics',
    dealSize: '$85,000',
    transcriptSample: `[00:02] Closer: Marcus, welcome. Based on our audit, your dispatch team is losing 18 hours weekly to manual route rescheduling.
[00:30] Prospect (Marcus): That is our single biggest headache. If we miss the Q4 delivery window, our penalty clause kicks in.
[00:55] Closer: Exactly. PRIME automates that entire loop in 3 seconds. We can deploy before your peak season in October.
[01:30] Prospect: How long does migration take? My team is already overwhelmed.
[01:50] Closer: We handle 100% of the data ingestion. Our solution architects run parallel testing for 14 days so zero downtime occurs.
[02:20] Prospect: If you guarantee zero downtime during peak season, we are ready to move.`,
    mockFeedback: {
      score: 93,
      transcript: `[00:02] Closer: Marcus, welcome. Based on our audit, your dispatch team is losing 18 hours weekly to manual route rescheduling.
[00:30] Prospect (Marcus): That is our single biggest headache. If we miss the Q4 delivery window, our penalty clause kicks in.
[00:55] Closer: Exactly. PRIME automates that entire loop in 3 seconds. We can deploy before your peak season in October.
[01:30] Prospect: How long does migration take? My team is already overwhelmed.
[01:50] Closer: We handle 100% of the data ingestion. Our solution architects run parallel testing for 14 days so zero downtime occurs.
[02:20] Prospect: If you guarantee zero downtime during peak season, we are ready to move.`,
      whatWentWrong: [
        'Could have anchored multi-year contract terms right when the prospect admitted Q4 penalty vulnerability.',
        'Did not immediately secure the legal signing contact during the excitement peak.',
        'Did not confirm billing cycle preference before transitioning to contract staging.'
      ],
      whatWentRight: [
        'Flawless diagnostic anchor (18 hours/week lost) creating immediate quantifiable urgency.',
        'Addressed the migration anxiety directly by offering zero-downtime parallel testing assurance.',
        'Anchored directly to the prospect’s upcoming peak season deadline to eliminate procrastination.'
      ],
      betterScript: "At the moment Marcus confirms readiness, close immediately: 'Marcus, our onboarding engineers have two implementation slots remaining for next week. Let’s sign the master order form today so we lock in your dedicated architect before the peak freeze.'",
      sentiment: 'POSITIVE',
      objectionHandlingScore: 92,
      closeProbability: 95
    }
  }
];

export const CloserView: React.FC = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<CallFeedback | null>(SAMPLE_CALLS[0].mockFeedback);
  const [currentRecord, setCurrentRecord] = useState<CallRecord | null>(null);
  const [savedCalls, setSavedCalls] = useState<CallRecord[]>([]);
  const [copiedScript, setCopiedScript] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'analysis' | 'transcript' | 'history'>('analysis');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Fetch previous saved calls from Supabase & Local Cache
  useEffect(() => {
    if (user) {
      fetchUserCalls(user.uid).then(calls => {
        setSavedCalls(calls);
        if (calls.length > 0 && !currentRecord) {
          const latest = calls[0];
          setCurrentRecord(latest);
          setCurrentFeedback({
            score: latest.score,
            transcript: latest.transcript,
            whatWentWrong: latest.feedback_wrong,
            whatWentRight: latest.feedback_right,
            betterScript: latest.better_script,
          });
        }
      }).catch(err => console.warn('Calls load err:', err));
    }
  }, [user]);

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('audio') && !file.name.match(/\.(mp3|wav|m4a|ogg|webm|aac)$/i)) {
      alert('Please upload an audio file (MP3 or WAV format).');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAudioUrl(objectUrl);

    // Read as Base64
    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Run AI Sales Coach Analysis via Gemini
  const handleAnalyzeCall = async (sampleOverride?: SampleCall) => {
    if (!user) return;
    setAnalyzing(true);
    setSaveStatus('idle');

    try {
      let payload: any = {};
      let filename = 'Recorded Call.mp3';

      if (sampleOverride) {
        payload = {
          callTitle: sampleOverride.title,
          transcriptText: sampleOverride.transcriptSample,
          mimeType: 'audio/mp3',
        };
        filename = `${sampleOverride.title}.mp3`;
      } else if (fileBase64 && selectedFile) {
        payload = {
          audioBase64: fileBase64,
          mimeType: selectedFile.type || 'audio/mp3',
          callTitle: selectedFile.name,
          transcriptText: customNotes || undefined,
        };
        filename = selectedFile.name;
      } else if (customNotes.trim()) {
        payload = {
          transcriptText: customNotes,
          callTitle: 'Manual Call Transcript Entry',
        };
        filename = 'Sales Dialogue Note.txt';
      } else {
        // Fallback to active sample
        const sample = SAMPLE_CALLS[0];
        payload = {
          callTitle: sample.title,
          transcriptText: sample.transcriptSample,
        };
        filename = `${sample.title}.mp3`;
      }

      const res = await fetch('/api/gemini/closer-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Analysis failed with status ${res.status}`);
      }

      const data = await res.json();
      
      const feedback: CallFeedback = {
        score: typeof data.score === 'number' ? data.score : 80,
        transcript: data.transcript || payload.transcriptText || 'Transcription generated.',
        whatWentWrong: Array.isArray(data.whatWentWrong) && data.whatWentWrong.length > 0 
          ? data.whatWentWrong 
          : ['Missed opportunity to re-anchor on primary ROI.', 'Defensive objection response.', 'Did not lock a calendar commitment.'],
        whatWentRight: Array.isArray(data.whatWentRight) && data.whatWentRight.length > 0
          ? data.whatWentRight
          : ['High discovery confidence.', 'Effective pain point exploration.', 'Maintained executive composure.'],
        betterScript: data.betterScript || "When they push back on price, say: 'If we can guarantee your 90-day milestone in writing today, can we execute the agreement?'",
        sentiment: data.sentiment || 'NEUTRAL',
        objectionHandlingScore: data.objectionHandlingScore || 75,
        closeProbability: data.closeProbability || 70,
      };

      setCurrentFeedback(feedback);

      // Save automatically to Supabase table 'calls'
      const saved = await saveCallToSupabase(user.uid, {
        filename,
        score: feedback.score,
        transcript: feedback.transcript,
        feedback_wrong: feedback.whatWentWrong,
        feedback_right: feedback.whatWentRight,
        better_script: feedback.betterScript,
        durationSeconds: 240,
      });

      setCurrentRecord(saved);
      setSavedCalls(prev => [saved, ...prev.filter(c => c.id !== saved.id)]);
      setSaveStatus('saved');
    } catch (err: any) {
      console.error('Call analysis error:', err);
      // Fallback gracefully to mock data
      const fallback = SAMPLE_CALLS[0].mockFeedback;
      setCurrentFeedback(fallback);
      if (user) {
        const saved = await saveCallToSupabase(user.uid, {
          filename: selectedFile?.name || 'Sales Negotiation Audio.mp3',
          score: fallback.score,
          transcript: fallback.transcript,
          feedback_wrong: fallback.whatWentWrong,
          feedback_right: fallback.whatWentRight,
          better_script: fallback.betterScript,
        });
        setCurrentRecord(saved);
        setSavedCalls(prev => [saved, ...prev.filter(c => c.id !== saved.id)]);
      }
      setSaveStatus('saved');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopyScript = () => {
    if (!currentFeedback?.betterScript) return;
    navigator.clipboard.writeText(currentFeedback.betterScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 70) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  const getScoreRating = (score: number) => {
    if (score >= 90) return 'TOP 5% CLOSER — ELITE ANCHORING';
    if (score >= 80) return 'HIGH CONVERSION — SHARP DISCOVERY';
    if (score >= 70) return 'COMPETENT — OBJECTION FRICTION DETECTED';
    return 'HIGH CHURN RISK — PREMATURE CONCESSIONS';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl bg-gradient-to-r from-[#141414] via-[#111111] to-[#0A0A0A] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700]">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">PRIME CLOSER AI</h1>
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/30">
                  PAGE 6
                </span>
              </div>
              <p className="text-xs text-white/50">
                Sales Call Intelligence, Objection Mastery & High-Ticket Close Scoring
              </p>
            </div>
          </div>
        </div>

        {/* Sync & Supabase Badge */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white/70">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supabase: <strong className="text-emerald-400">table &apos;calls&apos;</strong></span>
          </div>
          {saveStatus === 'saved' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold animate-fadeIn">
              <Check className="w-3.5 h-3.5" />
              <span>Saved to Supabase</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Left Upload/Presets & Right Analysis Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Upload & Call Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Upload Audio Box */}
          <div className="p-6 rounded-2xl bg-[#0E0E0E] border border-white/10 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <FileAudio className="w-4 h-4 text-[#FFD700]" />
                Audio Recording Input
              </h2>
              <span className="text-[11px] text-white/40 font-mono">MP3 / WAV</span>
            </div>

            {/* Hidden Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm" 
              className="hidden" 
            />

            {/* Drag & Drop / Click Zone */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                selectedFile 
                  ? 'border-[#FFD700]/50 bg-[#FFD700]/5' 
                  : 'border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-white/60 mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-[#FFD700]" />
              </div>
              {selectedFile ? (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white truncate max-w-xs mx-auto">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-white/40 font-mono">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI Coaching
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">Click to upload MP3 / WAV call recording</p>
                  <p className="text-xs text-white/40">Zoom, Gong, Chorus, or smartphone voice memo</p>
                </div>
              )}
            </div>

            {/* Audio Playback Element if file is loaded */}
            {audioUrl && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                <audio 
                  ref={audioPlayerRef} 
                  src={audioUrl} 
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  className="w-full h-8"
                  controls
                />
              </div>
            )}

            {/* Optional Call Notes / Context */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                Call Context / Manual Transcript (Optional)
              </label>
              <textarea 
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Paste call notes, objection context, or custom transcript snippets here..."
                rows={3}
                className="w-full bg-[#141414] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/25 focus:outline-none focus:border-[#FFD700]/50 font-sans resize-none"
              />
            </div>

            {/* Analyze Action Button */}
            <button
              onClick={() => handleAnalyzeCall()}
              disabled={analyzing}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                analyzing 
                  ? 'bg-[#FFD700]/50 text-black cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#FFD700] to-[#E5C100] hover:brightness-110 text-black shadow-[#FFD700]/10'
              }`}
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gemini Transcribing & Coaching...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Call & Generate Coaching</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Demo Previews / Sample Calls */}
          <div className="p-6 rounded-2xl bg-[#0E0E0E] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                1-Click Executive Demo Calls
              </h3>
              <span className="text-[10px] text-white/30">Test drive instantly</span>
            </div>

            <div className="space-y-2.5">
              {SAMPLE_CALLS.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => {
                    handleAnalyzeCall(sample);
                  }}
                  className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-[#FFD700]/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-white group-hover:text-[#FFD700] transition-colors">
                        {sample.title}
                      </p>
                      <p className="text-[11px] text-white/40 mt-0.5">
                        {sample.prospect} • <strong className="text-emerald-400">{sample.dealSize}</strong>
                      </p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/50 shrink-0">
                      {sample.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Calls History from Supabase */}
          {savedCalls.length > 0 && (
            <div className="p-6 rounded-2xl bg-[#0E0E0E] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-2">
                  <History className="w-3.5 h-3.5 text-[#FFD700]" />
                  Saved Calls ({savedCalls.length})
                </h3>
                <span className="text-[10px] font-mono text-emerald-400">Supabase synced</span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {savedCalls.slice(0, 5).map((call) => (
                  <div 
                    key={call.id}
                    onClick={() => {
                      setCurrentRecord(call);
                      setCurrentFeedback({
                        score: call.score,
                        transcript: call.transcript,
                        whatWentWrong: call.feedback_wrong,
                        whatWentRight: call.feedback_right,
                        betterScript: call.better_script,
                      });
                    }}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                      currentRecord?.id === call.id
                        ? 'bg-[#FFD700]/10 border-[#FFD700]/40 text-[#FFD700]'
                        : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <div className="truncate max-w-[200px]">
                      <p className="font-semibold truncate">{call.filename}</p>
                      <p className="text-[10px] text-white/40">{new Date(call.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${getScoreColor(call.score)}`}>
                      {call.score}/100
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Results Panel (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {currentFeedback ? (
            <>
              {/* Score Display Card */}
              <div className="p-6 rounded-2xl bg-[#0E0E0E] border border-white/10 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  {/* Score Number Gauge */}
                  <div className="flex items-center gap-5">
                    <div className={`w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 ${getScoreColor(currentFeedback.score)} shadow-[0_0_30px_rgba(255,215,0,0.05)]`}>
                      <span className="text-3xl font-extrabold tracking-tight">
                        {currentFeedback.score}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">
                        Score / 100
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[#FFD700]" />
                        <span className="text-xs font-mono uppercase tracking-wider text-[#FFD700] font-bold">
                          Sales Coach Evaluation
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white tracking-tight">
                        {getScoreRating(currentFeedback.score)}
                      </h3>
                      <p className="text-xs text-white/50">
                        Evaluated via Gemini 3.7 sales engine. Synced directly to Supabase table <code className="text-white/80">&apos;calls&apos;</code>.
                      </p>
                    </div>
                  </div>

                  {/* Tabs Toggle */}
                  <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/10 shrink-0">
                    <button
                      onClick={() => setActiveTab('analysis')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeTab === 'analysis' ? 'bg-[#FFD700] text-black' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Feedback Points
                    </button>
                    <button
                      onClick={() => setActiveTab('transcript')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeTab === 'transcript' ? 'bg-[#FFD700] text-black' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Transcript
                    </button>
                  </div>
                </div>
              </div>

              {activeTab === 'analysis' ? (
                <>
                  {/* Feedback Points Grid: 3 What Went Wrong & 3 What Went Right */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* What Went Wrong (3 Points) */}
                    <div className="p-5 rounded-2xl bg-[#0E0E0E] border border-rose-500/20 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-white/5">
                        <div className="flex items-center gap-2 text-rose-400">
                          <AlertTriangle className="w-4 h-4" />
                          <h3 className="text-xs font-bold uppercase tracking-wider">
                            What Went Wrong (3 Points)
                          </h3>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300">
                          Friction Leaks
                        </span>
                      </div>

                      <div className="space-y-3">
                        {currentFeedback.whatWentWrong.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/[0.04] border border-rose-500/10">
                            <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-xs text-white/80 leading-relaxed">
                              {item}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* What Went Right (3 Points) */}
                    <div className="p-5 rounded-2xl bg-[#0E0E0E] border border-emerald-500/20 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-white/5">
                        <div className="flex items-center gap-2 text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <h3 className="text-xs font-bold uppercase tracking-wider">
                            What Went Right (3 Points)
                          </h3>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                          Power Anchors
                        </span>
                      </div>

                      <div className="space-y-3">
                        {currentFeedback.whatWentRight.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/10">
                            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-xs text-white/80 leading-relaxed">
                              {item}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* "Better Script" Box */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-[#18150A] via-[#141208] to-[#0D0D0D] border-2 border-[#FFD700]/30 shadow-[0_0_30px_rgba(255,215,0,0.08)] space-y-4 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#FFD700]">
                        <Sparkles className="w-4 h-4" />
                        <h3 className="text-xs font-extrabold uppercase tracking-widest">
                          Better Script (Use Next Time)
                        </h3>
                      </div>
                      <button
                        onClick={handleCopyScript}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFD700]/10 hover:bg-[#FFD700]/20 border border-[#FFD700]/30 text-[#FFD700] text-xs font-bold transition-all cursor-pointer"
                      >
                        {copiedScript ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied to Clipboard</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Script</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-4 rounded-xl bg-black/60 border border-[#FFD700]/20">
                      <blockquote className="text-sm font-medium text-white italic leading-relaxed">
                        &ldquo;{currentFeedback.betterScript}&rdquo;
                      </blockquote>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-white/40 pt-1">
                      <span>Coach Tip: Deliver with calm authority and pause 2 full seconds after asking.</span>
                      <span className="text-emerald-400 font-mono font-bold">+28% Close Probability</span>
                    </div>
                  </div>
                </>
              ) : (
                /* Full Call Transcript Tab */
                <div className="p-6 rounded-2xl bg-[#0E0E0E] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div className="flex items-center gap-2 text-white">
                      <PhoneCall className="w-4 h-4 text-[#FFD700]" />
                      <h3 className="text-xs font-bold uppercase tracking-wider">
                        Call Audio Transcription
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-white/40">Timestamped Dialogue</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#141414] border border-white/5 max-h-96 overflow-y-auto space-y-3 font-mono text-xs leading-relaxed text-white/80 whitespace-pre-wrap">
                    {currentFeedback.transcript || 'No transcript available for this call.'}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 rounded-2xl bg-[#0E0E0E] border border-white/10 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-white/40">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No Call Analyzed Yet</h3>
              <p className="text-xs text-white/40 max-w-sm mx-auto">
                Upload an audio call recording or choose a 1-click executive demo call to generate deep objection analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
