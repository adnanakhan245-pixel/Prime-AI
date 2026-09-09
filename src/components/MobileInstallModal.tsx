import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Apple, 
  Download, 
  CheckCircle2, 
  Share, 
  PlusSquare, 
  Layers, 
  ExternalLink,
  Zap,
  ShieldCheck,
  Globe,
  Code2,
  Copy,
  Check
} from 'lucide-react';

export const MobileInstallModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'flutter'>('ios');
  const [copiedCode, setCopiedCode] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Detect device platform automatically
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setPlatform('ios');
    } else if (/android/i.test(userAgent)) {
      setPlatform('android');
    }

    // Capture PWA beforeinstallprompt on Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    }
  };

  const flutterCodeSample = `// PRIME AI Flutter Runner (iOS & Android)
// Add dependencies in pubspec.yaml: webview_flutter: ^4.4.2
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() => runApp(const MaterialApp(
  debugShowCheckedModeBanner: false,
  home: PrimeAIWebView(),
));

class PrimeAIWebView extends StatefulWidget {
  const PrimeAIWebView({super.key});
  @override
  State<PrimeAIWebView> createState() => _PrimeAIWebViewState();
}

class _PrimeAIWebViewState extends State<PrimeAIWebView> {
  late final WebViewController controller;

  @override
  void initState() {
    super.initState();
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF0A0A0A))
      ..loadRequest(Uri.parse("${window.location.origin}"));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      body: SafeArea(
        child: WebViewWidget(controller: controller),
      ),
    );
  }
}`;

  const handleCopyFlutter = () => {
    navigator.clipboard.writeText(flutterCodeSample);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#121212] border border-[#FFD700]/40 p-6 sm:p-8 shadow-[0_0_60px_rgba(255,215,0,0.25)] text-white space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FFD700]/20 via-[#FFD700]/30 to-amber-500/20 border border-[#FFD700]/50 flex items-center justify-center text-[#FFD700]">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
              <CheckCircle2 className="w-3 h-3" />
              <span>NATIVE CROSS-PLATFORM READY</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              Run PRIME AI on Apple iOS &amp; Android
            </h3>
            <p className="text-xs text-white/60">
              Install directly as an offline-ready App or export the Flutter / Native container
            </p>
          </div>
        </div>

        {/* Platform Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/60 border border-white/10">
          <button
            type="button"
            onClick={() => setPlatform('ios')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              platform === 'ios'
                ? 'bg-white text-black shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>Apple (iPhone / iPad)</span>
          </button>

          <button
            type="button"
            onClick={() => setPlatform('android')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              platform === 'android'
                ? 'bg-[#3DDC84] text-black shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android (Samsung / Pixel)</span>
          </button>

          <button
            type="button"
            onClick={() => setPlatform('flutter')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              platform === 'flutter'
                ? 'bg-[#FFD700] text-black shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Flutter Code</span>
          </button>
        </div>

        {/* Tab 1: Apple iOS Instructions */}
        {platform === 'ios' && (
          <div className="space-y-4 rounded-2xl bg-white/5 border border-white/10 p-5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Apple className="w-5 h-5 text-white" />
              <span>How to Install on iPhone &amp; iPad (1-Click App Icon)</span>
            </div>

            <ol className="space-y-3 text-xs text-white/80 list-decimal list-inside leading-relaxed">
              <li className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2.5">
                <Share className="w-4 h-4 text-[#FFD700] shrink-0 mt-0.5" />
                <div>
                  <strong>Step 1:</strong> Open this URL in <strong>Safari browser</strong> and tap the <strong>Share button</strong> (at the bottom toolbar).
                </div>
              </li>
              <li className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2.5">
                <PlusSquare className="w-4 h-4 text-[#FFD700] shrink-0 mt-0.5" />
                <div>
                  <strong>Step 2:</strong> Scroll down and select <strong>"Add to Home Screen" (ہوم اسکرین پر شامل کریں)</strong>.
                </div>
              </li>
              <li className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Step 3:</strong> Tap <strong>"Add"</strong>. PRIME AI will now appear on your iPhone home screen as a full-screen standalone Native App with zero browser bars!
                </div>
              </li>
            </ol>

            <div className="p-3 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 text-[11px] text-[#FFD700] flex items-center gap-2">
              <Zap className="w-4 h-4 shrink-0" />
              <span>Supports FaceID, biometric tokens, offline caching, and CEO Digital Twin audio.</span>
            </div>
          </div>
        )}

        {/* Tab 2: Android Instructions */}
        {platform === 'android' && (
          <div className="space-y-4 rounded-2xl bg-white/5 border border-white/10 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Smartphone className="w-5 h-5 text-[#3DDC84]" />
                <span>Install on Android Device</span>
              </div>
              {isInstallable && (
                <button
                  onClick={handleInstallClick}
                  className="px-3.5 py-1.5 rounded-xl bg-[#3DDC84] text-black font-extrabold text-xs flex items-center gap-1.5 hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install App Now</span>
                </button>
              )}
            </div>

            <ol className="space-y-3 text-xs text-white/80 list-decimal list-inside leading-relaxed">
              <li className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2.5">
                <Globe className="w-4 h-4 text-[#3DDC84] shrink-0 mt-0.5" />
                <div>
                  <strong>Step 1:</strong> Open Chrome or any browser on your Android phone.
                </div>
              </li>
              <li className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2.5">
                <Download className="w-4 h-4 text-[#3DDC84] shrink-0 mt-0.5" />
                <div>
                  <strong>Step 2:</strong> Tap the 3 dots menu (top-right) and select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                </div>
              </li>
              <li className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Step 3:</strong> The official PRIME AI icon will be added to your Android App Drawer just like a Play Store app.
                </div>
              </li>
            </ol>
          </div>
        )}

        {/* Tab 3: Flutter / Native APK / IPA Export */}
        {platform === 'flutter' && (
          <div className="space-y-4 rounded-2xl bg-white/5 border border-white/10 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Code2 className="w-5 h-5 text-[#FFD700]" />
                <span>Flutter Native Wrapper (Xcode &amp; Play Store)</span>
              </div>
              <button
                onClick={handleCopyFlutter}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Flutter Code'}</span>
              </button>
            </div>

            <p className="text-xs text-white/70">
              Below is the pre-configured Flutter entrypoint for generating native <strong>Android APK/AAB</strong> and <strong>Apple iOS (IPA/Xcode)</strong>:
            </p>

            <pre className="p-3.5 rounded-xl bg-black/80 border border-white/10 font-mono text-[11px] text-[#FFD700] overflow-x-auto max-h-48 leading-relaxed">
              {flutterCodeSample}
            </pre>

            <div className="flex items-center justify-between text-xs text-white/50 pt-1">
              <span>Terminal Command: <code className="text-white font-mono">flutter build appbundle</code> (Android) / <code className="text-white font-mono">flutter build ipa</code> (Apple)</span>
            </div>
          </div>
        )}

        {/* Footer Features Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#FFD700]/10 to-amber-500/10 border border-[#FFD700]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#FFD700]" />
            <div className="text-xs">
              <strong className="text-white">Full Cross-Platform Synchronization:</strong>
              <div className="text-white/60">Any change on web or mobile immediately syncs via Supabase cloud DB.</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#FFD700] text-black font-extrabold text-xs hover:bg-[#FFE55C] transition-all cursor-pointer shadow-md"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
