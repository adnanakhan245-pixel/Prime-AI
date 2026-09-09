import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Copy,
  Check,
  Video,
  Sparkles,
  Camera,
  Play,
  Pause,
  Layers,
  Palette,
  Layout,
  Share2,
  ExternalLink,
  Shield,
  Zap,
  DollarSign,
  TrendingUp,
  Activity,
  Bot,
  Flame,
  CheckCircle2,
  RefreshCw,
  Eye,
  Sliders,
  Monitor
} from 'lucide-react';
import { toPng, toBlob, toCanvas } from 'html-to-image';

interface MarketingStudioProps {
  publicAppUrl?: string;
  onNavigate?: (view: string) => void;
}

type AspectRatio = 'linkedin-post' | 'square' | 'story' | 'landscape';
type TemplateId = 'executive-war-room' | 'ceo-twin' | 'revenue-radar' | 'closer-ai' | 'launch-special';
type FrameStyle = 'macbook' | 'studio-dark' | 'glass-card' | 'clean-border';

export const MarketingStudio: React.FC<MarketingStudioProps> = ({
  publicAppUrl = 'https://ais-pre-46jg7eftrifddrnjsd4h6u-303742499908.asia-southeast1.run.app',
  onNavigate
}) => {
  const [template, setTemplate] = useState<TemplateId>('executive-war-room');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('linkedin-post');
  const [frameStyle, setFrameStyle] = useState<FrameStyle>('macbook');
  const [accentColor, setAccentColor] = useState<'gold' | 'emerald' | 'cyan' | 'purple'>('gold');
  const [headline, setHeadline] = useState('Autonomous AI Chief of Operations for Modern Founders');
  const [subheading, setSubheading] = useState('Save 20+ hours a week on operational firefighting, deal triage, & executive reporting.');
  const [showBadges, setShowBadges] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [selectedPostIndex, setSelectedPostIndex] = useState(0);

  // Video recording state
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [videoRecordingProgress, setVideoRecordingProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Animation frame ticks
  const [tick, setTick] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => (t + 1) % 100);
    }, 60);
    return () => clearInterval(interval);
  }, []);

  // Update default headlines when template changes
  useEffect(() => {
    switch (template) {
      case 'executive-war-room':
        setHeadline('Autonomous AI Chief of Operations');
        setSubheading('Unify metrics, run predictive simulations, and automate 24/7 executive execution.');
        break;
      case 'ceo-twin':
        setHeadline('Executive Digital Twin 3.0');
        setSubheading('Clone your decision framework. Let AI triage boardroom briefs & meetings 24/7.');
        break;
      case 'revenue-radar':
        setHeadline('Live Revenue Radar & Deal Triage');
        setSubheading('Spot pipeline bottlenecks before they cost revenue. Instant ARR intervention.');
        break;
      case 'closer-ai':
        setHeadline('Deal Room & High-Stakes Closer AI');
        setSubheading('Predict deal velocity, automate objection scripts, and close enterprise deals faster.');
        break;
      case 'launch-special':
        setHeadline('PRIME AI Official Launch — Live Platform');
        setSubheading('Replace $200k/yr COO overhead with an autonomous AI executive system.');
        break;
    }
  }, [template]);

  // Color helper
  const getAccentHex = () => {
    switch (accentColor) {
      case 'gold': return '#FFD700';
      case 'emerald': return '#10B981';
      case 'cyan': return '#06B6D4';
      case 'purple': return '#A855F7';
    }
  };

  // Dimensions
  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'linkedin-post': return 'w-full aspect-[1.91/1] max-w-[800px]'; // 1200x628
      case 'square': return 'w-full aspect-square max-w-[620px]'; // 1080x1080
      case 'landscape': return 'w-full aspect-video max-w-[840px]'; // 16:9
      case 'story': return 'w-full aspect-[9/16] max-w-[420px]'; // 1080x1920
    }
  };

  // Export options to prevent cross-origin stylesheet (cssRules) errors
  const exportOptions = {
    pixelRatio: 2,
    backgroundColor: '#0A0A0A',
    cacheBust: true,
    skipFonts: true,
    fontEmbedCSS: '',
  };

  // 1. Export Image (PNG)
  const handleDownloadImage = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(previewRef.current, exportOptions);
      const link = document.createElement('a');
      link.download = `prime-ai-linkedin-${template}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Image capture error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Copy Image to Clipboard
  const handleCopyImageToClipboard = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      const blob = await toBlob(previewRef.current, exportOptions);
      if (blob && navigator.clipboard?.write) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopiedImage(true);
          setTimeout(() => setCopiedImage(false), 3000);
        } catch (e) {
          console.error('Clipboard write failed, downloading instead', e);
          handleDownloadImage();
        }
      } else {
        handleDownloadImage();
      }
    } catch (err) {
      console.error('Copy image error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // 3. Record Animated Video Clip (WebM/MP4)
  const handleRecordTeaserVideo = async () => {
    if (!previewRef.current) return;
    setIsRecordingVideo(true);
    setVideoRecordingProgress(0);
    setVideoUrl(null);

    try {
      // Create offscreen canvas with fixed standard resolution
      const width = 1200;
      const height = 675;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      // Prepare MediaStream from canvas
      const stream = canvas.captureStream(30); // 30 FPS
      const mimeTypes = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4'
      ];
      let supportedType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';
      
      const recorder = new MediaRecorder(stream, { mimeType: supportedType, videoBitsPerSecond: 4000000 });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: supportedType });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setIsRecordingVideo(false);

        // Auto trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `prime-ai-teaser-video-${Date.now()}.webm`;
        a.click();
      };

      recorder.start();

      // Render 3 seconds of animated frames
      const totalFrames = 90; // 3 seconds at 30 fps
      let currentFrame = 0;

      const snapCanvas = await toCanvas(previewRef.current, {
        ...exportOptions,
        pixelRatio: 1.2,
      });

      const renderLoop = () => {
        if (currentFrame >= totalFrames) {
          recorder.stop();
          return;
        }

        try {
          ctx.fillStyle = '#050505';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(snapCanvas, 0, 0, width, height);

          // Draw an overlay animated scanline or glowing progress indicator
          const scanY = (currentFrame / totalFrames) * height;
          const grad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
          grad.addColorStop(0, 'rgba(255, 215, 0, 0)');
          grad.addColorStop(0.5, 'rgba(255, 215, 0, 0.35)');
          grad.addColorStop(1, 'rgba(255, 215, 0, 0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, scanY - 30, width, 60);

          currentFrame++;
          setVideoRecordingProgress(Math.round((currentFrame / totalFrames) * 100));
          setTimeout(renderLoop, 33);
        } catch (e) {
          console.error('Frame capture error:', e);
          recorder.stop();
          setIsRecordingVideo(false);
        }
      };

      renderLoop();
    } catch (err) {
      console.error('Video recording failed:', err);
      setIsRecordingVideo(false);
    }
  };

  // Ready-to-use viral LinkedIn posts
  const linkedInPosts = [
    {
      title: '🎯 Direct Value Hook (Founders & CEOs)',
      content: `Founders are losing 15–20 hours every week on operational firefighting instead of high-leverage revenue growth.

We built PRIME AI — the Autonomous AI Chief of Operations designed to solve this forever.

⚡ Autonomous Executive War Room: Real-time strategic simulations & boardroom metrics.
🎯 Revenue Radar: Instant deal bottleneck triage & pipeline rescue.
🤖 24/7 Executive Twin: Autonomous delegation and priority alignment.

No $200k/yr executive hiring lag. Instant deployment.

👉 Test the live platform here:
${publicAppUrl}

#ArtificialIntelligence #SaaS #Leadership #Productivity #Founders #Automation #COO`
    },
    {
      title: '💡 "Behind The Build" Launch Post',
      content: `🚀 Introducing PRIME AI — The Autonomous Chief of Operations for Modern Leadership.

Scaling a business shouldn't mean drowning in Slack pings, unorganized reports, and manual executive summaries.

What PRIME AI gives you out of the box:
• Automated daily executive briefing & morning audio briefing
• Live AI Closer that predicts deal risk & writes tactical objection counters
• Real-time CashFlow & Ad Spend optimization

Check out the interactive platform:
${publicAppUrl}

Would love your feedback!

#Startups #TechLaunch #AI #Productivity #BusinessGrowth`
    },
    {
      title: '📊 ROI & Problem-Solution Breakdown',
      content: `Hiring a full-time Chief Operating Officer:
❌ $180,000 - $250,000 / year
❌ 3–6 months onboarding time
❌ Unavailable 16 hours a day

Deploying PRIME AI (Autonomous Operations Suite):
✅ $499/month instant activation
✅ Available 24/7/365 across meetings, CRM, & financials
✅ Real-time predictive ROI scenario simulations

See the live system in action:
${publicAppUrl}

#ExecutiveLeadership #COO #Automation #AIforBusiness`
    }
  ];

  const handleCopyPostText = (text: string) => {
    navigator.clipboard?.writeText?.(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-xs font-mono font-bold tracking-wide mb-2">
            <Camera className="w-3.5 h-3.5" />
            <span>LINKEDIN MARKETING &amp; MEDIA STUDIO</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
            Media Asset <span className="font-semibold text-[#FFD700]">Export &amp; Post Creator</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-2xl">
            Generate high-resolution mockups, live animated video teasers, and pre-written viral posts ready to publish on LinkedIn.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleCopyImageToClipboard}
            disabled={isExporting || isRecordingVideo}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {copiedImage ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#FFD700]" />}
            <span>{copiedImage ? 'Image Copied!' : 'Copy Image'}</span>
          </button>

          <button
            onClick={handleDownloadImage}
            disabled={isExporting || isRecordingVideo}
            className="px-5 py-2.5 rounded-xl bg-[#FFD700] hover:bg-[#FFC700] text-black text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(255,215,0,0.25)] disabled:opacity-50"
          >
            {isExporting ? <RefreshCw className="w-4 h-4 animate-spin text-black" /> : <Download className="w-4 h-4 text-black" />}
            <span>Download HQ Image (PNG)</span>
          </button>

          <button
            onClick={handleRecordTeaserVideo}
            disabled={isExporting || isRecordingVideo}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 hover:brightness-110 text-white text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(239,68,68,0.3)] disabled:opacity-50"
          >
            {isRecordingVideo ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Recording Video ({videoRecordingProgress}%)</span>
              </>
            ) : (
              <>
                <Video className="w-4 h-4" />
                <span>Export Animated Teaser Video</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Controls on Left, Live Mockup on Right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Controls & Presets */}
        <div className="xl:col-span-4 space-y-6">
          {/* Template Selection */}
          <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 space-y-4">
            <h3 className="text-xs font-mono font-bold text-white/70 uppercase tracking-wider flex items-center gap-2">
              <Layout className="w-4 h-4 text-[#FFD700]" />
              <span>1. Choose App Screen Template</span>
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'executive-war-room', label: 'Executive War Room & Dashboard', desc: 'Main telemetry, $1.4M ARR metrics, live action stream' },
                { id: 'ceo-twin', label: 'CEO Digital Twin 3.0', desc: 'Autonomous AI delegation, voice agent, strategy memory' },
                { id: 'revenue-radar', label: 'Revenue Radar & Pipeline Triage', desc: 'Live bottleneck radar, deal risks, MRR acceleration' },
                { id: 'closer-ai', label: 'Deal Room & Closer AI', desc: 'Enterprise objection counters, deal velocity predictor' },
                { id: 'launch-special', label: 'Official Launch Special Banner', desc: 'Priced plans ($499), Payoneer verification badges' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id as TemplateId)}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                    template === t.id
                      ? 'bg-[#FFD700]/10 border-[#FFD700] text-white shadow-[0_0_15px_rgba(255,215,0,0.15)]'
                      : 'bg-black/30 border-white/5 text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span className={template === t.id ? 'text-[#FFD700]' : ''}>{t.label}</span>
                    {template === t.id && <Check className="w-3.5 h-3.5 text-[#FFD700]" />}
                  </div>
                  <div className="text-[10px] text-white/40 mt-1">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio & Frame */}
          <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 space-y-4">
            <h3 className="text-xs font-mono font-bold text-white/70 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#FFD700]" />
              <span>2. Format &amp; Frame Style</span>
            </h3>

            <div>
              <label className="text-[11px] text-white/60 font-semibold block mb-2">Image Aspect Ratio</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'linkedin-post', label: 'LinkedIn Post (1.91:1)' },
                  { id: 'square', label: 'Square (1:1 Carousel)' },
                  { id: 'landscape', label: 'Full HD 16:9' },
                  { id: 'story', label: 'Mobile Story (9:16)' },
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => setAspectRatio(r.id as AspectRatio)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                      aspectRatio === r.id
                        ? 'bg-white/15 border-white/40 text-white'
                        : 'bg-black/30 border-white/5 text-white/50 hover:text-white'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] text-white/60 font-semibold block mb-2">Device Frame</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'macbook', label: 'MacBook Frame' },
                  { id: 'studio-dark', label: 'Dark Studio Glow' },
                  { id: 'glass-card', label: 'Glass Card UI' },
                  { id: 'clean-border', label: 'Clean Borderless' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFrameStyle(f.id as FrameStyle)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                      frameStyle === f.id
                        ? 'bg-[#FFD700]/15 border-[#FFD700] text-[#FFD700]'
                        : 'bg-black/30 border-white/5 text-white/50 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] text-white/60 font-semibold block mb-2">Accent Glow</label>
              <div className="flex items-center gap-2">
                {[
                  { id: 'gold', color: '#FFD700', label: 'Gold' },
                  { id: 'emerald', color: '#10B981', label: 'Emerald' },
                  { id: 'cyan', color: '#06B6D4', label: 'Cyan' },
                  { id: 'purple', color: '#A855F7', label: 'Purple' },
                ].map(c => (
                  <button
                    key={c.id}
                    onClick={() => setAccentColor(c.id as any)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      accentColor === c.id ? 'border-white bg-white/10 text-white' : 'border-white/10 bg-black/30 text-white/40'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Text Customizer */}
          <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
            <h3 className="text-xs font-mono font-bold text-white/70 uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#FFD700]" />
              <span>3. Marketing Headline &amp; Tagline</span>
            </h3>
            <div>
              <label className="text-[10px] text-white/50 uppercase font-mono">Headline Text</label>
              <input
                type="text"
                value={headline}
                onChange={e => setHeadline(e.target.value)}
                className="w-full mt-1 bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD700]"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/50 uppercase font-mono">Subtitle / Hook</label>
              <textarea
                rows={2}
                value={subheading}
                onChange={e => setSubheading(e.target.value)}
                className="w-full mt-1 bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD700] resize-none"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-white/60 font-semibold">Show Trust Badges (SOC2, 24/7 AI)</span>
              <button
                type="button"
                onClick={() => setShowBadges(!showBadges)}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${showBadges ? 'bg-[#FFD700]' : 'bg-white/20'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-black absolute top-0.5 transition-transform ${showBadges ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Mockup Canvas Preview */}
        <div className="xl:col-span-8 space-y-6">
          <div className="p-6 rounded-3xl bg-[#0F0F0F] border border-white/10 space-y-4 flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-xs text-white/50 font-mono">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#FFD700]" />
                <span>Live Rendering Canvas (Pixel-Perfect HD)</span>
              </span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Ready to Export
              </span>
            </div>

            {/* THE CAPTURABLE CANVAS ELEMENT */}
            <div
              ref={previewRef}
              className={`${getAspectClass()} rounded-2xl bg-gradient-to-br from-[#121212] via-[#0A0A0A] to-[#161616] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)]`}
              style={{
                boxShadow: `0 0 80px ${getAccentHex()}15, inset 0 0 40px rgba(255,255,255,0.02)`
              }}
            >
              {/* Background Ambient Aura */}
              <div 
                className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[100px] pointer-events-none opacity-30"
                style={{ backgroundColor: getAccentHex() }}
              />
              <div 
                className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-[90px] pointer-events-none opacity-20"
                style={{ backgroundColor: getAccentHex() }}
              />

              {/* Canvas Header */}
              <div className="relative z-10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg font-black text-black font-mono text-sm"
                      style={{ backgroundColor: getAccentHex() }}
                    >
                      P
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-white tracking-wide font-mono">PRIME AI</div>
                      <div className="text-[10px] text-white/40 font-mono">CHIEF OF OPERATIONS OS</div>
                    </div>
                  </div>

                  {showBadges && (
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-black/60 border border-white/15 text-white/80 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        24/7 AUTONOMOUS
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-black/60 border border-white/15 text-[#FFD700] text-[10px] font-mono font-bold hidden sm:flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        SOC2 ISOLATED
                      </span>
                    </div>
                  )}
                </div>

                {/* Main Headline */}
                <div className="pt-2">
                  <h2 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">
                    {headline}
                  </h2>
                  <p className="text-xs sm:text-sm text-white/70 mt-1 max-w-xl line-clamp-2">
                    {subheading}
                  </p>
                </div>
              </div>

              {/* Dynamic Mockup Body based on Template */}
              <div className="relative z-10 my-4 flex-1 flex flex-col justify-center">
                {frameStyle === 'macbook' ? (
                  <div className="rounded-xl bg-[#090909] border border-white/20 overflow-hidden shadow-2xl">
                    {/* Browser topbar */}
                    <div className="px-3 py-2 bg-[#1A1A1A] border-b border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      </div>
                      <div className="px-3 py-0.5 rounded-md bg-black/50 border border-white/10 text-[9px] font-mono text-white/50 flex items-center gap-1.5">
                        <Bot className="w-2.5 h-2.5 text-[#FFD700]" />
                        <span>app.prime-ai.com/operations-radar</span>
                      </div>
                      <div className="w-10" />
                    </div>

                    {/* App Window Content Mock */}
                    <div className="p-3 sm:p-4 bg-[#0B0B0B] space-y-3">
                      {template === 'executive-war-room' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="p-2.5 rounded-lg bg-black/60 border border-white/10">
                              <div className="text-[9px] text-white/40 uppercase font-mono">Live Pipeline ARR</div>
                              <div className="text-sm sm:text-base font-extrabold text-[#FFD700] font-mono mt-0.5">$1,420,000</div>
                              <div className="text-[8px] text-emerald-400 font-mono mt-0.5">▲ +38% MoM Velocity</div>
                            </div>
                            <div className="p-2.5 rounded-lg bg-black/60 border border-white/10">
                              <div className="text-[9px] text-white/40 uppercase font-mono">Triage Precision</div>
                              <div className="text-sm sm:text-base font-extrabold text-white font-mono mt-0.5">99.4%</div>
                              <div className="text-[8px] text-[#FFD700] font-mono mt-0.5">0 Manual Bottlenecks</div>
                            </div>
                            <div className="p-2.5 rounded-lg bg-black/60 border border-white/10">
                              <div className="text-[9px] text-white/40 uppercase font-mono">Executive Hours Saved</div>
                              <div className="text-sm sm:text-base font-extrabold text-emerald-400 font-mono mt-0.5">84.5 hrs</div>
                              <div className="text-[8px] text-white/40 font-mono mt-0.5">Across 4 Departments</div>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-lg bg-black/80 border border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                              <span className="text-[11px] text-white font-bold font-mono">Autonomous Strategic Action Stream</span>
                            </div>
                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                              Active 24/7 Execution
                            </span>
                          </div>
                        </div>
                      )}

                      {template === 'ceo-twin' && (
                        <div className="space-y-2.5">
                          <div className="p-3 rounded-xl bg-gradient-to-r from-purple-950/40 via-black to-purple-950/40 border border-purple-500/30 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                                🤖
                              </div>
                              <div>
                                <div className="text-xs font-bold text-white">CEO Persona Neural Sync: 99.8%</div>
                                <div className="text-[9px] text-purple-300">Delegates deals, attends async syncs, &amp; signs ops briefs</div>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-mono font-bold">
                              ACTIVE TWIN
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                            <div className="p-2 rounded bg-black/60 border border-white/10 text-white/70">
                              🎙️ Voice Synthesis Briefings (Auto-Audio)
                            </div>
                            <div className="p-2 rounded bg-black/60 border border-white/10 text-white/70">
                              ⚡ Boardroom Memo Generator (PDF)
                            </div>
                          </div>
                        </div>
                      )}

                      {template === 'revenue-radar' && (
                        <div className="space-y-2.5">
                          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/40 via-black to-amber-950/40 border border-amber-500/30 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
                              <span className="text-xs font-bold text-white font-mono">Radar Alert: $140k Enterprise Deal Rescued</span>
                            </div>
                            <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                              +100% Retained
                            </span>
                          </div>
                          <div className="h-12 w-full bg-black/80 rounded-lg border border-white/10 flex items-center justify-around px-3">
                            <div className="text-center">
                              <div className="text-[8px] text-white/40 font-mono">STAGE 1</div>
                              <div className="text-[11px] font-bold text-emerald-400">12 Deals</div>
                            </div>
                            <div className="text-white/20">→</div>
                            <div className="text-center">
                              <div className="text-[8px] text-white/40 font-mono">STAGE 2</div>
                              <div className="text-[11px] font-bold text-[#FFD700]">8 Deals</div>
                            </div>
                            <div className="text-white/20">→</div>
                            <div className="text-center">
                              <div className="text-[8px] text-white/40 font-mono">CLOSING</div>
                              <div className="text-[11px] font-bold text-emerald-400">5 Deals ($420k)</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {template === 'closer-ai' && (
                        <div className="space-y-2.5">
                          <div className="p-3 rounded-xl bg-black/80 border border-emerald-500/30 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-emerald-400" />
                              <span className="text-xs font-bold text-white font-mono">AI Objection Triage: 12-Second Counter-Script</span>
                            </div>
                            <span className="text-[9px] font-mono text-emerald-400 font-bold">94% WIN RATE</span>
                          </div>
                          <div className="p-2 rounded bg-black/60 border border-white/10 text-[10px] text-white/70 italic">
                            &quot;Customer hesitated on annual commitment — AI automatically surfaced competitor cost-comparison &amp; 30-day guarantee ROI framework.&quot;
                          </div>
                        </div>
                      )}

                      {template === 'launch-special' && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="p-2 rounded-lg bg-black/80 border border-white/10 text-center">
                              <div className="text-[9px] text-white/40 font-mono">STARTER</div>
                              <div className="text-xs sm:text-sm font-extrabold text-[#FFD700] font-mono mt-0.5">$499<span className="text-[9px] text-white/40">/mo</span></div>
                            </div>
                            <div className="p-2 rounded-lg bg-[#FFD700]/10 border border-[#FFD700] text-center shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                              <div className="text-[9px] text-[#FFD700] font-mono font-bold">PRO (MOST POPULAR)</div>
                              <div className="text-xs sm:text-sm font-extrabold text-white font-mono mt-0.5">$1,499<span className="text-[9px] text-white/40">/mo</span></div>
                            </div>
                            <div className="p-2 rounded-lg bg-black/80 border border-white/10 text-center">
                              <div className="text-[9px] text-white/40 font-mono">ENTERPRISE</div>
                              <div className="text-xs sm:text-sm font-extrabold text-purple-400 font-mono mt-0.5">$2,999<span className="text-[9px] text-white/40">/mo</span></div>
                            </div>
                          </div>
                          <div className="text-center text-[10px] text-white/60 font-mono">
                            ⚡ Direct Payoneer Checkout • Instant Activation • 24/7 AI COO
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-black/70 border border-white/15 backdrop-blur-md space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-white font-mono flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#FFD700]" />
                        <span>Autonomous Operations Engine</span>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 font-bold">$1.4M ARR Live</span>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Transform unstructured company chaos into unified boardroom metrics, automated strategic briefs, and 24/7 AI decision execution.
                    </p>
                  </div>
                )}
              </div>

              {/* Canvas Footer */}
              <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                <div className="text-white/60">
                  Built for CEOs &amp; Modern Founders • <strong className="text-white">{publicAppUrl.replace('https://', '')}</strong>
                </div>
                <div className="text-[#FFD700] font-bold flex items-center gap-1">
                  <span>GET STARTED</span>
                  <span>→</span>
                </div>
              </div>
            </div>

            {/* Quick Export Hint */}
            <div className="text-center text-xs text-white/40">
              💡 Tip: Click <strong>&quot;Download HQ Image&quot;</strong> or <strong>&quot;Copy Image&quot;</strong>, then drag it straight into your LinkedIn post!
            </div>
          </div>

          {/* Viral LinkedIn Post Captions Section */}
          <div className="p-6 rounded-3xl bg-[#121212] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#FFD700]" />
                <span>Pre-Written LinkedIn Post Captions (1-Click Copy)</span>
              </h3>
              <span className="text-[11px] text-white/40 font-mono">3 High-Converting Hooks</span>
            </div>

            {/* Tabs for post captions */}
            <div className="flex flex-wrap gap-2">
              {linkedInPosts.map((post, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPostIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedPostIndex === idx
                      ? 'bg-[#FFD700] text-black font-extrabold'
                      : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {post.title}
                </button>
              ))}
            </div>

            {/* Post Content Box */}
            <div className="relative">
              <pre className="w-full p-4 rounded-2xl bg-black/60 border border-white/10 text-xs text-white/80 font-sans whitespace-pre-wrap leading-relaxed">
                {linkedInPosts[selectedPostIndex].content}
              </pre>

              <button
                onClick={() => handleCopyPostText(linkedInPosts[selectedPostIndex].content)}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#FFD700] text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer border border-white/10 shadow-lg"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? 'Copied to Clipboard!' : 'Copy Caption'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
