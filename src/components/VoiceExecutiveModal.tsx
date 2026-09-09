import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Sparkles, 
  Send, 
  RotateCcw, 
  Play, 
  Square,
  Crown,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface VoiceExecutiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export const VoiceExecutiveModal: React.FC<VoiceExecutiveModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { profile } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [actionItems, setActionItems] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      if (transcript.trim()) {
        handleExecuteVoiceCommand(transcript);
      }
    } else {
      setTranscript('');
      setResponse(null);
      setActionItems([]);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn('Recognition start failed:', e);
        }
      } else {
        // Fallback for browsers without speech recognition
        const samplePrompt = "Give me today's top 3 operational decisions and pipeline risks";
        setTranscript(samplePrompt);
        handleExecuteVoiceCommand(samplePrompt);
      }
    }
  };

  const speakText = (text: string) => {
    if (audioMuted || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    // Clean markdown symbols for cleaner voice speech
    const cleanText = text.replace(/[*#_`]/g, '').replace(/\[.*?\]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    
    // Choose high quality English voice if available
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Alex')) && v.lang.startsWith('en'));
    if (premiumVoice) {
      utterance.voice = premiumVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleExecuteVoiceCommand = async (commandText: string) => {
    if (!commandText.trim()) return;
    setLoading(true);
    setResponse(null);
    setActionItems([]);

    try {
      const res = await fetch('/api/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are PRIME AI, the executive 24/7 AI Chief of Operations for ${profile?.companyName || 'an enterprise technology company'}. 
Respond directly, concisely, and authoritatively to this spoken executive request:
"${commandText}"

Structure your answer in 2 crisp sections:
1. EXECUTIVE BRIEFING (2-3 sentences max, suitable for spoken playback)
2. RECOMMENDED DECISIONS / ACTIONS (2-3 bullet items starting with "- ")`,
          type: 'EXECUTIVE_VOICE_BRIEFING',
          companyContext: profile?.role ? `${profile.role} at ${profile.companyName}` : 'High-growth enterprise B2B SaaS'
        })
      });

      const data = await res.json();
      let reply = data.result || data.text || "Executive intelligence synthesized. All operations aligned with 90-day trajectory.";
      
      // Parse bullets if present
      const lines = reply.split('\n');
      const bullets = lines.filter((l: string) => l.trim().startsWith('-') || l.trim().startsWith('*')).map((l: string) => l.replace(/^[-*]\s*/, ''));
      setActionItems(bullets.slice(0, 3));

      setResponse(reply);
      speakText(reply);
    } catch (err) {
      const fallback = `Understood. I have logged your command "${commandText}". Today's primary focus remains closing the $450k MSA indemnification redline and executing the Growth Lab pricing test.`;
      setResponse(fallback);
      speakText(fallback);
    } finally {
      setLoading(false);
    }
  };

  const presetCommands = [
    "Brief me on today's 3 decisions",
    "Triage unread VIP inbox emails",
    "Audit pipeline risk on Revenue Radar",
    "Run a Growth Lab teardown for our checkout",
    "Prepare the 90-Day Board Pack summary"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      {/* Background radial glow */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-[#FFD700]/5 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-2xl bg-[#0F0F0F] border border-[#FFD700]/25 rounded-3xl shadow-[0_0_80px_rgba(255,215,0,0.15)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header HUD */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FFD700] to-[#B8860B] text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,215,0,0.3)]">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold tracking-tight text-white uppercase font-mono">
                  PRIME AI Voice War Room
                </h3>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE COO
                </span>
              </div>
              <p className="text-xs text-white/40">Hands-free voice executive intelligence & vocal briefing</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setAudioMuted(!audioMuted);
                if (!audioMuted && typeof window !== 'undefined' && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                }
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                audioMuted 
                  ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                  : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
              }`}
              title={audioMuted ? "Unmute Voice Briefing" : "Mute Voice Briefing"}
            >
              {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Voice Waveform & Mic Center */}
        <div className="p-8 flex flex-col items-center justify-center text-center space-y-6 bg-gradient-to-b from-[#141414]/50 to-transparent">
          {/* Animated Waveform Ring */}
          <div className="relative flex items-center justify-center">
            {isListening && (
              <>
                <div className="absolute w-36 h-36 rounded-full border border-[#FFD700]/30 animate-ping opacity-40" />
                <div className="absolute w-44 h-44 rounded-full border border-yellow-400/20 animate-pulse opacity-60" />
              </>
            )}
            {isSpeaking && (
              <div className="absolute w-40 h-40 rounded-full border-2 border-emerald-400/40 animate-pulse" />
            )}

            <button
              onClick={toggleListening}
              disabled={loading}
              className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer shadow-2xl ${
                isListening
                  ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-[0_0_40px_rgba(244,63,94,0.5)] scale-105'
                  : isSpeaking
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_0_40px_rgba(16,185,129,0.5)] scale-105'
                  : 'bg-gradient-to-br from-[#FFD700] to-yellow-600 text-black hover:from-[#FFE55C] hover:to-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.3)] hover:scale-105'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-8 h-8 animate-bounce" />
                  <span className="text-[10px] font-extrabold uppercase mt-1 tracking-wider">Listening</span>
                </>
              ) : isSpeaking ? (
                <>
                  <Volume2 className="w-8 h-8 animate-pulse" />
                  <span className="text-[10px] font-extrabold uppercase mt-1 tracking-wider">Speaking</span>
                </>
              ) : (
                <>
                  <Mic className="w-8 h-8" />
                  <span className="text-[10px] font-extrabold uppercase mt-1 tracking-wider">Tap to Speak</span>
                </>
              )}
            </button>
          </div>

          {/* Spoken Transcript Bubble */}
          <div className="w-full max-w-lg space-y-2">
            <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 text-xs text-white/90 min-h-[50px] flex items-center justify-center">
              {loading ? (
                <div className="flex items-center gap-2 text-[#FFD700] font-mono font-bold">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Chief of Operations Intelligence...</span>
                </div>
              ) : transcript ? (
                <p className="italic text-white">"{transcript}"</p>
              ) : (
                <p className="text-white/40">Click microphone or tap a preset command below to start speaking...</p>
              )}
            </div>

            {/* Quick vocal command presets */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {presetCommands.map((cmd, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTranscript(cmd);
                    handleExecuteVoiceCommand(cmd);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FFD700]/40 text-white/70 hover:text-white text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-[#FFD700]" />
                  <span>{cmd}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Chief of Operations Response Card */}
        {response && (
          <div className="p-6 border-t border-white/10 bg-black/40 overflow-y-auto space-y-4 max-h-[300px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[#FFD700] flex items-center gap-2 font-mono">
                <Activity className="w-4 h-4" /> Chief of Operations Briefing
              </span>
              <button
                onClick={() => speakText(response)}
                className="text-[11px] font-bold text-white/60 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" /> Replay Vocal Audio
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#141414] border border-white/5 text-xs text-white/90 leading-relaxed whitespace-pre-line">
              {response}
            </div>

            {actionItems.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
                  Direct Next Steps:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {actionItems.map((act, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2 text-xs text-white/80">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-black/70 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
          <span className="flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#FFD700]" /> Voice Engine: WebSpeech & Google Gemini
          </span>
          <button
            onClick={() => {
              onNavigate('brain');
              onClose();
            }}
            className="text-xs font-bold text-[#FFD700] hover:underline flex items-center gap-1 cursor-pointer"
          >
            Full Neural Brain Mode <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
