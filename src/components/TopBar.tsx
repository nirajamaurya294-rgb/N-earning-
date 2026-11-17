import React, { useState } from 'react';
import { Coins, Bell, Shield, ArrowUpRight, CheckCircle2, Clock, Download } from 'lucide-react';
import { User } from '../types';

interface TopBarProps {
  user: User | null;
  pointsBalance: number;
  inrBalance: number;
  onOpenWallet: () => void;
  onOpenAdmin: () => void;
  onOpenProfile: () => void;
  onOpenDownload: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  pointsBalance,
  inrBalance,
  onOpenWallet,
  onOpenAdmin,
  onOpenProfile,
  onOpenDownload,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 bg-emerald-700 text-white shadow-md">
        <div className="px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Brand & Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onOpenProfile}>
            <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-white shadow-sm ring-1 ring-white/20 shrink-0">
              <img
                src="/src/assets/images/nearning_app_logo_1794106087420.jpg"
                alt="N EARNING Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if image path fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center font-bold text-emerald-700 text-sm">
                N
              </span>
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight leading-none flex items-center gap-1">
                N EARNING
              </h1>
              <p className="text-[10px] text-emerald-100 font-medium tracking-wide">
                Verified Rewards
              </p>
            </div>
          </div>

          {/* Right Action Icons: Wallet Balance & Notifications */}
          <div className="flex items-center gap-2">
            {/* Wallet points balance button */}
            <button
              onClick={onOpenWallet}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-800/80 hover:bg-emerald-900 border border-emerald-500/30 rounded-xl transition-all active:scale-95 text-xs shadow-inner"
            >
              <Coins className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <div className="flex items-baseline gap-1 text-left">
                <span className="font-bold font-mono-numbers text-white">{pointsBalance}</span>
                <span className="text-[10px] text-emerald-200 font-mono-numbers">
                  (₹{inrBalance.toFixed(2)})
                </span>
              </div>
            </button>

            {/* Download App button */}
            <button
              onClick={onOpenDownload}
              className="p-1.5 rounded-xl hover:bg-emerald-800/80 transition-colors text-emerald-100 flex items-center gap-1"
              title="Download App (.apk)"
            >
              <Download className="w-4 h-4 text-emerald-200" />
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 rounded-xl hover:bg-emerald-800/80 transition-colors text-emerald-100"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400" />
            </button>

            {/* Admin shortcut button */}
            <button
              onClick={onOpenAdmin}
              className="p-1.5 rounded-xl hover:bg-emerald-800/80 transition-colors text-emerald-100"
              title="Admin Panel"
            >
              <Shield className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Notifications Drawer Modal */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center p-4 pt-16"
          onClick={() => setShowNotifications(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                Close
              </button>
            </div>

            <div className="p-3 space-y-2.5 max-h-[360px] overflow-y-auto text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-950">Daily Bonus Ready</p>
                  <p className="text-slate-600 mt-0.5">
                    Your daily check-in reward is waiting! Keep your streak alive to unlock bonus points.
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">Just now</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Task Verification System</p>
                  <p className="text-slate-600 mt-0.5">
                    Surveys and video tasks are auto-verified instantly. Screenshot proof tasks are audited by admins in 24 hours.
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">Platform notice</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <ArrowUpRight className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">UPI Withdrawals Enabled</p>
                  <p className="text-slate-600 mt-0.5">
                    Direct transfer to PhonePe, Google Pay, Paytm & BHIM UPI supported.
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">System info</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
