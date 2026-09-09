import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Sparkles, 
  Sliders, 
  Send, 
  Copy, 
  Check, 
  ShieldAlert, 
  ShieldCheck, 
  RefreshCw, 
  Flame, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ChevronRight, 
  Bot, 
  Volume2, 
  FileText, 
  Settings2, 
  UserCheck, 
  Layers, 
  Activity, 
  Crown, 
  Quote, 
  Plus, 
  Trash2, 
  SlidersHorizontal,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  CEODigitalTwinConfig, 
  CEOVoiceArchetype, 
  DigitalTwinSimulationResult 
} from '../types';
import { 
  getDigitalTwinConfig, 
  saveDigitalTwinConfig, 
  synthesizeTwinCommunication, 
  analyzeCEOStyleFromSample,
  PRESET_SCENARIOS 
} from '../services/digitalTwin';

export const CEODigitalTwinView: React.FC = () => {
  const { user, profile, companyName, companyId } = useAuth();
  
  const [config, setConfig] = useState<CEODigitalTwinConfig>(() => 
    getDigitalTwinConfig(companyId || 'comp_apex_01', user?.uid || 'user_ceo_01', profile?.displayName || user?.displayName || 'Alexander Vance')
  );

  const [activeTab, setActiveTab] = useState<'simulator' | 'matrix' | 'fingerprints' | 'calibration' | 'heuristics'>('simulator');
  
  // Simulator State
  const [scenarioInput, setScenarioInput] = useState(PRESET_SCENARIOS[0].rawThought);
  const [scenarioTitle, setScenarioTitle] = useState(PRESET_SCENARIOS[0].title);
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<DigitalTwinSimulationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedAngle, setSelectedAngle] = useState<'primary' | 'diplomatic' | 'closer'>('primary');

  // Calibration State
  const [sampleWritingText, setSampleWritingText] = useState('');
  const [calibrating, setCalibrating] = useState(false);
  const [calibrationSuccess, setCalibrationSuccess] = useState<string | null>(null);

  // New Phrase Inputs
  const [newPowerPhrase, setNewPowerPhrase] = useState('');
  const [newBannedPhrase, setNewBannedPhrase] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  // Sync config changes to storage
  const updateConfig = (newConfig: Partial<CEODigitalTwinConfig>) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    saveDigitalTwinConfig(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleSimulate = async () => {
    if (!scenarioInput.trim()) return;
    setSimulating(true);
    try {
      const result = await synthesizeTwinCommunication(
        config,
        scenarioInput,
        scenarioTitle,
        companyName || 'Apex Enterprises'
      );
      setSimResult(result);
      setSelectedAngle('primary');
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  const handleCalibrateFromSample = async () => {
    if (!sampleWritingText.trim() || sampleWritingText.length < 25) return;
    setCalibrating(true);
    setCalibrationSuccess(null);
    try {
      const analysis = await analyzeCEOStyleFromSample(
        sampleWritingText,
        config.ceoName,
        config.ceoTitle
      );

      const updated: CEODigitalTwinConfig = {
        ...config,
        archetype: analysis.detectedArchetype,
        matrix: analysis.calibratedMatrix,
        signatureHook: analysis.extractedSignatureHook || config.signatureHook,
        signatureSignoff: analysis.extractedSignatureSignoff || config.signatureSignoff,
        powerPhrases: Array.from(new Set([...config.powerPhrases, ...analysis.extractedPowerPhrases])),
        bannedPhrases: Array.from(new Set([...config.bannedPhrases, ...analysis.recommendedBannedPhrases])),
        voiceStyleSummary: analysis.linguisticProfileSummary,
        lastCalibratedAt: new Date().toISOString(),
      };

      setConfig(updated);
      saveDigitalTwinConfig(updated);
      setCalibrationSuccess(`Neural Calibration Complete! Auto-adjusted to ${analysis.detectedArchetype.replace(/_/g, ' ')} with ${analysis.confidenceScore}% confidence.`);
    } catch (err: any) {
      console.error('Calibration error:', err);
    } finally {
      setCalibrating(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddPowerPhrase = () => {
    if (!newPowerPhrase.trim()) return;
    if (!config.powerPhrases.includes(newPowerPhrase.trim())) {
      updateConfig({ powerPhrases: [...config.powerPhrases, newPowerPhrase.trim()] });
    }
    setNewPowerPhrase('');
  };

  const handleRemovePowerPhrase = (phrase: string) => {
    updateConfig({ powerPhrases: config.powerPhrases.filter(p => p !== phrase) });
  };

  const handleAddBannedPhrase = () => {
    if (!newBannedPhrase.trim()) return;
    if (!config.bannedPhrases.includes(newBannedPhrase.trim())) {
      updateConfig({ bannedPhrases: [...config.bannedPhrases, newBannedPhrase.trim()] });
    }
    setNewBannedPhrase('');
  };

  const handleRemoveBannedPhrase = (phrase: string) => {
    updateConfig({ bannedPhrases: config.bannedPhrases.filter(p => p !== phrase) });
  };

  const ARCHETYPES: Array<{
    id: CEOVoiceArchetype;
    label: string;
    description: string;
    icon: any;
    badge: string;
  }> = [
    {
      id: 'HIGH_VELOCITY_CLOSER',
      label: 'High-Velocity Closer',
      description: 'Razor-sharp brevity, high urgency, numbers-driven, zero fluff. Uncompromising deadlines.',
      icon: Flame,
      badge: 'Aggressive & Decisive',
    },
    {
      id: 'DIPLOMATIC_FOUNDER',
      label: 'Diplomatic Founder',
      description: 'Inspirational, high EQ, relationship-preserving, visionary. Crafts bridge-building consensus.',
      icon: Award,
      badge: 'High EQ & Strategic',
    },
    {
      id: 'RUTHLESS_OPERATOR',
      label: 'Ruthless Operator',
      description: 'SOPs, strict metrics, extreme accountability, radical candor. Eliminates operational drag.',
      icon: Zap,
      badge: 'Metrics & Systems',
    },
    {
      id: 'STRATEGIC_VISIONARY',
      label: 'Strategic Visionary',
      description: 'Macroeconomic leverage, 10x multiplier thinking, market dominance, bold future framing.',
      icon: TrendingUp,
      badge: '10x Multiplier',
    },
  ];

  return (
    <div className="flex-1 min-h-screen bg-[#0A0A0A] text-white p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans pb-24">
      {/* Top Telemetry & Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#141414] via-[#121212] to-[#181508] border border-[#FFD700]/20 p-6 sm:p-8 shadow-[0_0_50px_rgba(255,215,0,0.08)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-[#FFD700]/15 border border-[#FFD700]/30 text-[#FFD700] text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
                <Crown className="w-3.5 h-3.5" />
                CEO DIGITAL TWIN 3.0
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {config.activeStatus === 'ONLINE_ACTIVE' ? 'Neural Model Active' : config.activeStatus}
              </span>
              {savedNotice && (
                <span className="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-mono font-semibold flex items-center gap-1 animate-fade-in">
                  <Check className="w-3 h-3" /> Auto-Saved
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extralight tracking-tight text-white font-serif">
              Autonomous <span className="font-semibold text-[#FFD700]">{config.ceoName}&apos;s</span> Voice Clone
            </h1>

            <p className="text-sm text-white/60 max-w-3xl leading-relaxed">
              Trained on your decision heuristics, signature hooks, and communication DNA. Your Digital Twin drafts high-stakes emails, executes team directives, and rejects unviable vendor contracts in your exact tone.
            </p>
          </div>

          {/* Quick Archetype & Autonomy Status Badge */}
          <div className="bg-black/60 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row lg:flex-col gap-4 min-w-[280px] shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50 font-medium">Active Archetype:</span>
              <span className="px-2 py-0.5 rounded-lg bg-[#FFD700]/20 text-[#FFD700] text-xs font-bold font-mono">
                {config.archetype.replace(/_/g, ' ')}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs border-t border-white/5 pt-3">
              <span className="text-white/50">Linguistic Precision:</span>
              <span className="text-emerald-400 font-mono font-bold">98.4% Match</span>
            </div>

            <div className="flex items-center justify-between text-xs border-t border-white/5 pt-3">
              <span className="text-white/50">Auto-Approval Budget:</span>
              <span className="text-white font-mono font-bold">${config.heuristics.autoApproveBudgetBelow.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        {[
          { id: 'simulator', label: 'Neural Voice Simulator', icon: Sparkles, badge: 'LIVE' },
          { id: 'matrix', label: 'Tone & Persona Matrix', icon: SlidersHorizontal, badge: null },
          { id: 'fingerprints', label: 'Verbal Fingerprints & Blacklist', icon: Quote, badge: null },
          { id: 'calibration', label: 'Auto-Calibrate from Samples', icon: Brain, badge: 'AI' },
          { id: 'heuristics', label: 'Delegation Rules of Engagement', icon: ShieldCheck, badge: null },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#FFD700] text-black shadow-[0_0_20px_rgba(255,215,0,0.25)]'
                  : 'bg-[#121212] hover:bg-white/5 text-white/70 hover:text-white border border-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-extrabold ${
                  isActive ? 'bg-black text-[#FFD700]' : 'bg-[#FFD700]/20 text-[#FFD700]'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: NEURAL VOICE SIMULATOR & PLAYGROUND */}
      {/* ========================================================================= */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Preset Scenarios & Input Thought */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl bg-[#141414] border border-white/10 p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#FFD700]" />
                  <span>Preset Executive Scenarios</span>
                </h3>
                <span className="text-[11px] text-white/40">1-Click Load</span>
              </div>

              <div className="space-y-2">
                {PRESET_SCENARIOS.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => {
                      setScenarioTitle(scenario.title);
                      setScenarioInput(scenario.rawThought);
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                      scenarioTitle === scenario.title
                        ? 'bg-[#FFD700]/10 border-[#FFD700]/40 text-[#FFD700]'
                        : 'bg-black/30 hover:bg-white/5 border-white/5 text-white/70'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="truncate">{scenario.title}</span>
                      <span className="text-[10px] text-white/40 font-mono shrink-0 ml-2">{scenario.category}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input Box */}
            <div className="rounded-2xl bg-[#141414] border border-white/10 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white/80 flex items-center gap-2">
                  <Quote className="w-3.5 h-3.5 text-[#FFD700]" />
                  <span>Raw Thought or Voice Memo to Clone</span>
                </label>
              </div>

              <textarea
                value={scenarioInput}
                onChange={(e) => setScenarioInput(e.target.value)}
                placeholder="e.g. Tell the enterprise client their 30% discount request is denied unless they pay upfront 2 years in cash..."
                rows={5}
                className="w-full bg-[#0E0E0E] border border-white/10 focus:border-[#FFD700] rounded-xl p-3.5 text-xs text-white placeholder-white/30 focus:outline-none transition-colors resize-none leading-relaxed"
              />

              <button
                onClick={handleSimulate}
                disabled={simulating || !scenarioInput.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#E5C100] hover:from-[#FFE234] hover:to-[#FFD700] text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_25px_rgba(255,215,0,0.25)] disabled:opacity-50"
              >
                {simulating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Cloning & Synthesizing in CEO Voice...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Synthesize as {config.ceoName}&apos;s Digital Twin →</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Synthesized Output & Neural Telemetry */}
          <div className="lg:col-span-7 space-y-4">
            {simResult ? (
              <div className="rounded-2xl bg-[#141414] border border-[#FFD700]/30 p-6 space-y-5 shadow-[0_0_35px_rgba(255,215,0,0.1)] relative">
                {/* Result Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-[#FFD700] uppercase tracking-wider font-bold">
                      Neural Output Generated
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">{simResult.scenarioTitle}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                      {simResult.voiceAlignmentScore}% DNA Alignment
                    </span>
                    <button
                      onClick={() => handleCopyText(
                        selectedAngle === 'primary' 
                          ? simResult.synthesizedOutput 
                          : selectedAngle === 'diplomatic' 
                            ? simResult.alternativeAngles.diplomaticAngle 
                            : simResult.alternativeAngles.aggressiveCloserAngle
                      )}
                      className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Angle Selector Tabs */}
                <div className="grid grid-cols-3 p-1 rounded-xl bg-black/50 border border-white/10 text-xs">
                  <button
                    onClick={() => setSelectedAngle('primary')}
                    className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      selectedAngle === 'primary' ? 'bg-[#FFD700] text-black' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Primary CEO Voice
                  </button>
                  <button
                    onClick={() => setSelectedAngle('diplomatic')}
                    className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      selectedAngle === 'diplomatic' ? 'bg-[#FFD700] text-black' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Diplomatic Bridge
                  </button>
                  <button
                    onClick={() => setSelectedAngle('closer')}
                    className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      selectedAngle === 'closer' ? 'bg-[#FFD700] text-black' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Aggressive Closer
                  </button>
                </div>

                {/* Main Text Display */}
                <div className="p-5 rounded-2xl bg-black/60 border border-white/10 text-sm leading-relaxed text-zinc-100 font-sans whitespace-pre-line shadow-inner min-h-[140px]">
                  {selectedAngle === 'primary' && simResult.synthesizedOutput}
                  {selectedAngle === 'diplomatic' && simResult.alternativeAngles.diplomaticAngle}
                  {selectedAngle === 'closer' && simResult.alternativeAngles.aggressiveCloserAngle}
                </div>

                {/* Heuristics Applied Badges */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
                    Executive Heuristics Enforced:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {simResult.executiveHeuristicsApplied.map((heuristic, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3 h-3 text-[#FFD700]" />
                        <span>{heuristic}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-[#141414] border border-dashed border-white/15 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center mx-auto text-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.15)]">
                  <Brain className="w-8 h-8 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">Simulator Ready</h4>
                  <p className="text-xs text-white/50 max-w-md mx-auto">
                    Select any scenario or type raw thoughts on the left to see how your Digital Twin instantly turns them into pristine executive communication.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TONE & PERSONA MATRIX SLIDERS */}
      {/* ========================================================================= */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Archetype Cards */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Crown className="w-4 h-4 text-[#FFD700]" />
              <span>Select Core Executive Archetype</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ARCHETYPES.map((item) => {
                const Icon = item.icon;
                const isSelected = config.archetype === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => updateConfig({ archetype: item.id })}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#FFD700]/10 border-[#FFD700] shadow-[0_0_25px_rgba(255,215,0,0.15)]'
                        : 'bg-[#141414] hover:bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-white/60'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-[#FFD700] text-black' : 'bg-white/10 text-white/50'
                        }`}>
                          {item.badge}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{item.label}</h4>
                      <p className="text-xs text-white/50 leading-snug">{item.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className={isSelected ? 'text-[#FFD700] font-bold' : 'text-white/30'}>
                        {isSelected ? '✓ Active Model' : 'Click to Activate'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5 Dimensional Sliders */}
          <div className="rounded-3xl bg-[#141414] border border-white/10 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Linguistic Dimension Matrix</h3>
                <p className="text-xs text-white/50">Fine-tune the mathematical weights governing your digital twin&apos;s output cadence.</p>
              </div>
              <button
                onClick={() => updateConfig({
                  matrix: {
                    brevity: 8,
                    assertiveness: 9,
                    candor: 8,
                    urgency: 9,
                    optimism: 7
                  }
                })}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                Reset to CEO Defaults
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Brevity */}
              <div className="space-y-2 p-4 rounded-2xl bg-black/40 border border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Brevity vs. Elaboration</span>
                  <span className="font-mono font-bold text-[#FFD700]">{config.matrix.brevity} / 10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={config.matrix.brevity}
                  onChange={(e) => updateConfig({ matrix: { ...config.matrix, brevity: Number(e.target.value) } })}
                  className="w-full accent-[#FFD700] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-white/40">
                  <span>1: Comprehensive Briefs</span>
                  <span>10: 1-Sentence Punchy</span>
                </div>
              </div>

              {/* Assertiveness */}
              <div className="space-y-2 p-4 rounded-2xl bg-black/40 border border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Assertiveness & Conviction</span>
                  <span className="font-mono font-bold text-[#FFD700]">{config.matrix.assertiveness} / 10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={config.matrix.assertiveness}
                  onChange={(e) => updateConfig({ matrix: { ...config.matrix, assertiveness: Number(e.target.value) } })}
                  className="w-full accent-[#FFD700] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-white/40">
                  <span>1: Diplomatic Suggestion</span>
                  <span>10: Non-negotiable Mandate</span>
                </div>
              </div>

              {/* Candor */}
              <div className="space-y-2 p-4 rounded-2xl bg-black/40 border border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Radical Candor</span>
                  <span className="font-mono font-bold text-[#FFD700]">{config.matrix.candor} / 10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={config.matrix.candor}
                  onChange={(e) => updateConfig({ matrix: { ...config.matrix, candor: Number(e.target.value) } })}
                  className="w-full accent-[#FFD700] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-white/40">
                  <span>1: Corporate Courtesy</span>
                  <span>10: Unfiltered Reality</span>
                </div>
              </div>

              {/* Urgency */}
              <div className="space-y-2 p-4 rounded-2xl bg-black/40 border border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Execution Urgency</span>
                  <span className="font-mono font-bold text-[#FFD700]">{config.matrix.urgency} / 10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={config.matrix.urgency}
                  onChange={(e) => updateConfig({ matrix: { ...config.matrix, urgency: Number(e.target.value) } })}
                  className="w-full accent-[#FFD700] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-white/40">
                  <span>1: Quarterly Pace</span>
                  <span>10: Immediate 24h Sprint</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: VERBAL FINGERPRINTS & BLACKLIST */}
      {/* ========================================================================= */}
      {activeTab === 'fingerprints' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Signatures & Hooks */}
          <div className="rounded-3xl bg-[#141414] border border-white/10 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Quote className="w-4 h-4 text-[#FFD700]" />
              <span>Signature Hooks & Sign-Offs</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Standard Greeting Hook</label>
                <input
                  type="text"
                  value={config.signatureHook}
                  onChange={(e) => updateConfig({ signatureHook: e.target.value })}
                  placeholder="e.g. Team, or Let's be direct:"
                  className="w-full bg-black/50 border border-white/10 focus:border-[#FFD700] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Executive Sign-Off</label>
                <input
                  type="text"
                  value={config.signatureSignoff}
                  onChange={(e) => updateConfig({ signatureSignoff: e.target.value })}
                  placeholder="e.g. - Alexander Vance, CEO or Onward,"
                  className="w-full bg-black/50 border border-white/10 focus:border-[#FFD700] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Power Phrases */}
            <div className="space-y-3 pt-4 border-t border-white/5">
              <label className="block text-xs font-bold text-white flex items-center justify-between">
                <span>Signature Power Phrases (Organic Injection)</span>
                <span className="text-[10px] text-white/40 font-mono">{config.powerPhrases.length} Active</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPowerPhrase}
                  onChange={(e) => setNewPowerPhrase(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPowerPhrase()}
                  placeholder="e.g. Move with extreme speed..."
                  className="flex-1 bg-black/50 border border-white/10 focus:border-[#FFD700] rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-colors"
                />
                <button
                  onClick={handleAddPowerPhrase}
                  className="px-3 py-2 rounded-xl bg-[#FFD700] text-black font-bold text-xs flex items-center gap-1 cursor-pointer hover:bg-[#FFC700]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {config.powerPhrases.map((phrase, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-xs flex items-center gap-2 group"
                  >
                    <span>&quot;{phrase}&quot;</span>
                    <button
                      onClick={() => handleRemovePowerPhrase(phrase)}
                      className="text-white/30 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Banned Phrases / Corporate Fluff Blacklist */}
          <div className="rounded-3xl bg-[#141414] border border-red-500/20 p-6 space-y-4 shadow-[0_0_30px_rgba(239,68,68,0.05)]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>Forbidden Words & Fluff Blacklist</span>
              </h3>
              <span className="text-[10px] text-red-400/60 font-mono">Zero Tolerance</span>
            </div>

            <p className="text-xs text-white/50 leading-relaxed">
              Your Digital Twin is mathematically blocked from using passive-aggressive or weak corporate jargon.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={newBannedPhrase}
                onChange={(e) => setNewBannedPhrase(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddBannedPhrase()}
                placeholder="e.g. per my last email, just checking in..."
                className="flex-1 bg-black/50 border border-white/10 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-colors"
              />
              <button
                onClick={handleAddBannedPhrase}
                className="px-3 py-2 rounded-xl bg-red-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer hover:bg-red-600"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ban</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {config.bannedPhrases.map((phrase, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 group"
                >
                  <span className="line-through">{phrase}</span>
                  <button
                    onClick={() => handleRemoveBannedPhrase(phrase)}
                    className="text-white/30 hover:text-white transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: AUTO-CALIBRATE FROM REAL WRITING SAMPLES */}
      {/* ========================================================================= */}
      {activeTab === 'calibration' && (
        <div className="rounded-3xl bg-[#141414] border border-white/10 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#FFD700]" />
                <span>Neural Linguistic Calibration Engine</span>
              </h3>
              <p className="text-xs text-white/50 mt-1">
                Paste 2-3 real past emails, Slack memos, or executive letters. Gemini AI will analyze your vocabulary, cadence, and decision posture to automatically configure your Twin.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] text-xs font-mono font-bold">
              Gemini 3.7
            </span>
          </div>

          {calibrationSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{calibrationSuccess}</span>
            </div>
          )}

          <div className="space-y-3">
            <label className="block text-xs font-bold text-white/80">
              Paste Real Executive Writing Samples:
            </label>
            <textarea
              value={sampleWritingText}
              onChange={(e) => setSampleWritingText(e.target.value)}
              placeholder="e.g. Team, Q3 targets are non-negotiable. I need engineering and sales in daily alignment. We are walking away from non-paying pilot clients..."
              rows={7}
              className="w-full bg-black/60 border border-white/10 focus:border-[#FFD700] rounded-2xl p-4 text-xs text-white placeholder-white/30 focus:outline-none transition-colors leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-white/40">
              Minimum 25 characters for statistical accuracy ({sampleWritingText.length} chars entered)
            </span>

            <button
              onClick={handleCalibrateFromSample}
              disabled={calibrating || sampleWritingText.length < 25}
              className="px-6 py-3 rounded-xl bg-[#FFD700] hover:bg-[#FFC700] text-black font-extrabold text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-40 shadow-[0_0_20px_rgba(255,215,0,0.2)]"
            >
              {calibrating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Extracting Executive DNA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Calibrate My Digital Twin DNA</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: DELEGATION RULES OF ENGAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'heuristics' && (
        <div className="rounded-3xl bg-[#141414] border border-white/10 p-6 sm:p-8 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Autonomous Decision Heuristics & Guardrails</span>
            </h3>
            <p className="text-xs text-white/50 mt-1">
              Specify exact financial and legal boundaries for what the Digital Twin can autonomously authorize vs. what must alert your phone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 p-5 rounded-2xl bg-black/40 border border-white/5">
              <label className="block text-xs font-bold text-white">Auto-Approve Budget Threshold</label>
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono font-bold text-[#FFD700]">$</span>
                <input
                  type="number"
                  value={config.heuristics.autoApproveBudgetBelow}
                  onChange={(e) => updateConfig({
                    heuristics: { ...config.heuristics, autoApproveBudgetBelow: Number(e.target.value) }
                  })}
                  className="w-full bg-black/60 border border-white/10 focus:border-[#FFD700] rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
              <p className="text-[10px] text-white/40">Invoices & vendor renewals under this amount will be signed autonomously.</p>
            </div>

            <div className="space-y-2 p-5 rounded-2xl bg-black/40 border border-white/5">
              <label className="block text-xs font-bold text-white">Max Contract Discount Limit</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={config.heuristics.contractDiscountLimitPct}
                  onChange={(e) => updateConfig({
                    heuristics: { ...config.heuristics, contractDiscountLimitPct: Number(e.target.value) }
                  })}
                  className="w-full bg-black/60 border border-white/10 focus:border-[#FFD700] rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
                <span className="text-sm font-mono font-bold text-[#FFD700]">%</span>
              </div>
              <p className="text-[10px] text-white/40">Any customer requesting greater discounts will be escalated to you.</p>
            </div>

            <div className="space-y-2 p-5 rounded-2xl bg-black/40 border border-white/5">
              <label className="block text-xs font-bold text-white">Default Meeting Duration</label>
              <select
                value={config.heuristics.defaultMeetingDurationMins}
                onChange={(e) => updateConfig({
                  heuristics: { ...config.heuristics, defaultMeetingDurationMins: Number(e.target.value) }
                })}
                className="w-full bg-black/60 border border-white/10 focus:border-[#FFD700] rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value={15}>15 Minutes (Executive Sprint)</option>
                <option value={25}>25 Minutes (Standard Deep Dive)</option>
                <option value={45}>45 Minutes (Board Review)</option>
              </select>
              <p className="text-[10px] text-white/40">Automatically trims all proposed calendar invites.</p>
            </div>

            <div className="space-y-2 p-5 rounded-2xl bg-black/40 border border-white/5">
              <label className="block text-xs font-bold text-white">Negotiation Standoff Posture</label>
              <select
                value={config.heuristics.standoffResponseStrategy}
                onChange={(e) => updateConfig({
                  heuristics: { ...config.heuristics, standoffResponseStrategy: e.target.value as any }
                })}
                className="w-full bg-black/60 border border-white/10 focus:border-[#FFD700] rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="FIRM_DEFENSE">Firm Defense (Zero concessions, walk away)</option>
                <option value="VALUE_REALIGN">Value Re-alignment (Add value instead of discounting)</option>
                <option value="EXECUTIVE_COMPROMISE">Executive Compromise (Split difference on multi-year terms)</option>
              </select>
              <p className="text-[10px] text-white/40">Dictates how your Twin counters aggressive procurement reps.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
