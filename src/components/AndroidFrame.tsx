import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Download,
  Wifi,
  Battery,
  ChevronLeft,
  Circle,
  Square,
  Sparkles,
  Smartphone,
} from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  onOpenAdmin: () => void;
  onSwitchUser: () => void;
  onOpenDownload: () => void;
  currentUserName?: string;
  isLoggedIn: boolean;
  onNavigateHome?: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  onOpenAdmin,
  onSwitchUser,
  onOpenDownload,
  currentUserName,
  isLoggedIn,
  onNavigateHome,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('09:41');
  const [navBarType, setNavBarType] = useState<'gesture' | '3-button'>('gesture');
  const [showRecentsSheet, setShowRecentsSheet] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center select-none font-sans">
      {/* Top Android System Environment Strip */}
      <header className="w-full bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span className="font-extrabold text-white tracking-wide">N EARNING</span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 hidden sm:inline">
              Android 14 (API 34) · com.nearning.rewards
            </span>
          </div>

          {/* Android Navigation Style Switcher */}
          <div className="hidden md:flex items-center gap-1 bg-slate-950 border border-slate-800 p-0.5 rounded-lg text-[11px]">
            <button
              onClick={() => setNavBarType('gesture')}
              className={`px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                navBarType === 'gesture'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Gesture Bar
            </button>
            <button
              onClick={() => setNavBarType('3-button')}
              className={`px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                navBarType === '3-button'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3-Button Nav (◀ ◯ ▢)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLoggedIn && (
            <button
              onClick={onSwitchUser}
              title="Switch demo user account"
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">User: {currentUserName || 'Account'}</span>
            </button>
          )}

          <button
            onClick={onOpenDownload}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-sm shadow-emerald-600/30 transition-colors"
            title="Download N EARNING Android App (.apk)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download APK (.apk)</span>
          </button>

          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg transition-colors font-medium"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </div>
      </header>

      {/* Main Container - Built Purely for Android */}
      <main className="w-full flex-1 flex justify-center items-start p-0 sm:p-4 md:p-6 overflow-x-hidden">
        {/* Authentic Android Smartphone Chassis */}
        <div className="relative w-full max-w-[430px] h-[100dvh] sm:h-[92vh] sm:max-h-[890px] bg-black rounded-none sm:rounded-[44px] shadow-2xl border-0 sm:border-[10px] sm:border-slate-800 flex flex-col overflow-hidden ring-1 ring-white/10">
          {/* Top Speaker Ear-piece (on desktop chassis) */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-slate-800 rounded-full z-40 hidden sm:block pointer-events-none" />

          {/* Android Status Bar */}
          <div className="w-full h-8 px-4 bg-emerald-700 text-white flex items-center justify-between text-[11px] font-semibold tracking-tight z-30 shrink-0 select-none">
            <div className="flex items-center gap-1.5">
              <span className="font-mono-numbers">{currentTime}</span>
              {/* Notification icon */}
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-xs" title="N EARNING Alert" />
            </div>

            {/* Android Camera Punch Hole / Notch */}
            <div className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-800 mx-auto" />

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-emerald-200">Jio 5G</span>
              {/* WiFi SVG */}
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4zm0 2.5c3.84 0 7.34 1.5 9.94 3.96L12 18.5 2.06 10.46C4.66 8 8.16 6.5 12 6.5z" />
              </svg>
              {/* Battery SVG */}
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] font-mono-numbers">92%</span>
                <div className="w-4 h-2.5 border border-white rounded-[2px] p-[1px] flex items-center">
                  <div className="w-full h-full bg-white rounded-[1px]" />
                </div>
              </div>
            </div>
          </div>

          {/* Inner Android App Canvas */}
          <div className="flex-1 w-full bg-slate-50 text-slate-900 overflow-y-auto flex flex-col relative">
            {children}
          </div>

          {/* Android Navigation Bar */}
          {navBarType === 'gesture' ? (
            /* Modern Android 14 Gesture Navigation Bar */
            <div
              className="w-full h-4 bg-white flex items-center justify-center shrink-0 z-30 cursor-pointer"
              onClick={onNavigateHome}
              title="Android Home Gesture"
            >
              <div className="w-32 h-1 bg-slate-300 rounded-full hover:bg-slate-400 transition-colors" />
            </div>
          ) : (
            /* Classic Android 3-Button Navigation Bar */
            <div className="w-full h-9 bg-white border-t border-slate-200 flex items-center justify-around shrink-0 z-30 text-slate-600 px-8">
              {/* Back Button */}
              <button
                onClick={onNavigateHome}
                className="p-2 hover:text-slate-900 active:scale-90 transition-transform"
                title="Android Back"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Home Button */}
              <button
                onClick={onNavigateHome}
                className="p-2 hover:text-slate-900 active:scale-90 transition-transform"
                title="Android Home"
              >
                <Circle className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Overview / Recents Button */}
              <button
                onClick={() => setShowRecentsSheet(!showRecentsSheet)}
                className="p-2 hover:text-slate-900 active:scale-90 transition-transform"
                title="Android Recents"
              >
                <Square className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Android Recents Task Overview Modal */}
      {showRecentsSheet && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowRecentsSheet(false)}
        >
          <div
            className="w-full max-w-xs bg-slate-900 rounded-3xl p-5 border border-slate-800 text-center space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 mx-auto flex items-center justify-center text-white font-extrabold text-lg shadow-md">
              N
            </div>
            <h4 className="text-sm font-bold text-white">N EARNING (Running)</h4>
            <p className="text-xs text-slate-400">
              Package: com.nearning.rewards<br />
              Task Verifier: Active in Background
            </p>
            <button
              onClick={() => setShowRecentsSheet(false)}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
            >
              Resume App
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
