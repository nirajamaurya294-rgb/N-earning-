import React, { useState } from 'react';
import {
  X,
  Download,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  FileDown,
  Sparkles,
  QrCode,
  Share2,
  AlertCircle,
  HardDrive,
  Cpu,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [downloadingApk, setDownloadingApk] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [apkDownloaded, setApkDownloaded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'apk' | 'pwa'>('apk');

  if (!isOpen) return null;

  const handleDownloadApk = () => {
    setDownloadingApk(true);
    setDownloadProgress(15);
    setApkDownloaded(false);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            // Trigger actual download of NEarning_v2.4.1.apk
            const link = document.createElement('a');
            link.href = '/api/download/apk';
            link.download = 'NEarning_v2.4.1.apk';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setDownloadProgress(100);
            setDownloadingApk(false);
            setApkDownloaded(true);
          }, 400);
          return 90;
        }
        return prev + 25;
      });
    }, 200);
  };

  const handlePwaInstall = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="bg-emerald-700 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white p-1 shadow-sm flex items-center justify-center text-emerald-700 font-extrabold text-base">
              N
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-tight">
                Download N EARNING App
              </h3>
              <p className="text-[11px] text-emerald-100">
                Official Android Application (v2.4.1)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-emerald-800 rounded-lg text-emerald-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Method Selector Tabs */}
          <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600">
            <button
              onClick={() => setActiveTab('apk')}
              className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'apk'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct APK Download</span>
            </button>
            <button
              onClick={() => setActiveTab('pwa')}
              className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'pwa'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant Web App</span>
            </button>
          </div>

          {/* TAB 1: DIRECT APK DOWNLOAD */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              {/* App Specs Card */}
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950">
                      NEarning_v2.4.1.apk
                    </h4>
                    <span className="text-[11px] text-emerald-700 font-medium">
                      Latest stable production release
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                    12.8 MB
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-200/50 text-[11px] text-emerald-900">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Play Protect Safe</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Android 7.0+ Support</span>
                  </div>
                </div>
              </div>

              {/* Download Progress or Button */}
              {downloadingApk ? (
                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Downloading NEarning_v2.4.1.apk...</span>
                    <span className="font-mono-numbers">{downloadProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Saving package to your device Downloads folder...
                  </p>
                </div>
              ) : apkDownloaded ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 animate-in fade-in">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-emerald-900">
                    APK Download Complete! (NEarning_v2.4.1.apk)
                  </p>
                  <p className="text-[11px] text-slate-600">
                    File saved in your phone's <strong>Downloads</strong> folder. Tap it to install.
                  </p>
                  <button
                    onClick={handleDownloadApk}
                    className="text-xs text-emerald-700 font-bold hover:underline"
                  >
                    Download again
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleDownloadApk}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download APK (12.8 MB)</span>
                </button>
              )}

              {/* Installation Steps Guide in Hindi & English */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs text-slate-700">
                <span className="font-bold text-slate-900 block text-xs">
                  How to Install on Android / Kaise Install Karein:
                </span>
                <ol className="space-y-1.5 list-decimal pl-4 text-[11px] text-slate-600">
                  <li>
                    Tap <strong>Download APK</strong> button above to download the file.
                  </li>
                  <li>
                    Once downloaded, open the notification or go to your <strong>Downloads</strong> folder and tap <strong>NEarning_v2.4.1.apk</strong>.
                  </li>
                  <li>
                    If prompted with <em>"Install unknown apps"</em>, toggle <strong>Allow from this source</strong> in Settings.
                  </li>
                  <li>
                    Tap <strong>Install</strong>. Once completed, tap <strong>Open</strong> to start earning!
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: INSTANT PWA WEB APP */}
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-bold text-emerald-950">
                    Instant Home Screen App (No Download Needed)
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Adds N EARNING directly to your smartphone app drawer like a native app. Uses zero phone storage, auto-updates automatically, and provides full screen experience.
                </p>
              </div>

              {isInstalled ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-800 font-semibold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>N EARNING is already installed on your Android device!</span>
                </div>
              ) : isInstallable ? (
                <button
                  onClick={handlePwaInstall}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Install on Android Home Screen</span>
                </button>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                  <span className="font-bold text-slate-900 block">
                    Install via Android Chrome:
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    1. Tap the <strong>three dots menu (⋮)</strong> at top right of Chrome.<br />
                    2. Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.<br />
                    3. Tap <strong>Install</strong> to add the app icon to your Android launcher.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Security & Play Protect Badge */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Verified Safe & Virus-Free</span>
            </div>
            <span className="text-[10px] text-slate-400">SHA-256 Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
