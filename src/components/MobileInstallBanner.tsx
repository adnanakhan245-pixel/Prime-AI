import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Apple, 
  Share, 
  PlusSquare, 
  Download, 
  X, 
  Zap,
  Sparkles
} from 'lucide-react';

export const MobileInstallBanner: React.FC<{
  onOpenModal: () => void;
}> = ({ onOpenModal }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    // Check if dismissed before
    const isDismissed = sessionStorage.getItem('prime_ai_mobile_banner_dismissed');
    if (isDismissed) return;

    // Check if standalone PWA or native webview already
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setDeviceType('ios');
      setShowBanner(true);
    } else if (/android/i.test(userAgent)) {
      setDeviceType('android');
      setShowBanner(true);
    }
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowBanner(false);
    sessionStorage.setItem('prime_ai_mobile_banner_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div 
      onClick={onOpenModal}
      className="md:hidden sticky top-0 z-40 bg-gradient-to-r from-zinc-900 via-black to-zinc-900 border-b border-[#FFD700]/30 px-3.5 py-2.5 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.5)] cursor-pointer text-white"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-[#FFD700]/20 border border-[#FFD700]/40 flex items-center justify-center text-[#FFD700] shrink-0">
          {deviceType === 'ios' ? <Apple className="w-4 h-4 text-white" /> : <Smartphone className="w-4 h-4 text-[#3DDC84]" />}
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-bold flex items-center gap-1.5 truncate">
            <span>Install PRIME AI on {deviceType === 'ios' ? 'iPhone' : 'Android'}</span>
            <span className="px-1 py-0.2 rounded bg-[#FFD700] text-black font-extrabold text-[8px]">APP</span>
          </div>
          <p className="text-[10px] text-white/60 truncate">
            {deviceType === 'ios' ? 'Tap Share → "Add to Home Screen"' : '1-Click Fast Mobile Installation'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpenModal(); }}
          className="px-2.5 py-1 rounded-lg bg-[#FFD700] text-black font-extrabold text-[10px] shadow-sm hover:brightness-110"
        >
          Install
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 text-white/40 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
