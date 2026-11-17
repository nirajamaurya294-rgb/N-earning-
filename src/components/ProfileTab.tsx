import React, { useState } from 'react';
import {
  User as UserIcon,
  Phone,
  ShieldCheck,
  CreditCard,
  LogOut,
  Edit2,
  Check,
  ChevronRight,
  ShieldAlert,
  Coins,
  History,
  Info,
  Download,
} from 'lucide-react';
import { User } from '../types';
import { api } from '../api';

interface ProfileTabProps {
  user: User | null;
  onRefreshProfile: () => void;
  onLogout: () => void;
  onOpenAdmin: () => void;
  onNavigateToWallet: () => void;
  onOpenDownload: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  onRefreshProfile,
  onLogout,
  onOpenAdmin,
  onNavigateToWallet,
  onOpenDownload,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>(user?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user?.avatar || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const avatarPresets = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Niraj&backgroundColor=b6e3f4,c0aede,d1d4f9',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav&backgroundColor=ffdfbf,ffd5dc',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=c0aede,d1d4f9',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan&backgroundColor=b6e3f4,ffdfbf',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya&backgroundColor=ffd5dc,b6e3f4',
  ];

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.updateProfile({ name: name.trim(), avatar: selectedAvatar });
      setSuccessMsg('Profile updated successfully');
      setIsEditing(false);
      onRefreshProfile();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 pb-8 space-y-4">
      {/* Top Banner */}
      <div className="bg-emerald-700 text-white px-4 pt-2 pb-6 rounded-b-3xl shadow-sm text-center">
        <div className="relative w-20 h-20 mx-auto rounded-full bg-white p-1 shadow-md mb-2">
          <img
            src={user?.avatar || selectedAvatar}
            alt={user?.name}
            referrerPolicy="no-referrer"
            className="w-full h-full rounded-full object-cover bg-emerald-50"
          />
          <button
            onClick={() => setIsEditing(true)}
            className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-600 hover:bg-emerald-700 rounded-full flex items-center justify-center text-white ring-2 ring-white shadow-xs"
          >
            <Edit2 className="w-3 h-3" />
          </button>
        </div>

        <h2 className="text-base font-bold">{user?.name}</h2>
        <p className="text-xs text-emerald-200 font-mono-numbers mt-0.5">
          +91 {user?.mobile}
        </p>

        <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full bg-emerald-800/80 border border-emerald-500/40 text-[10px] text-emerald-100 font-medium">
          <ShieldCheck className="w-3 h-3 text-emerald-300" />
          <span>Mobile Verified Account</span>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {successMsg && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
            {successMsg}
          </div>
        )}

        {/* Profile Edit Drawer / Form */}
        {isEditing && (
          <form
            onSubmit={handleSaveProfile}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3"
          >
            <h3 className="text-xs font-bold text-slate-800">Edit Profile</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Choose Profile Avatar
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {avatarPresets.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`w-10 h-10 rounded-full p-0.5 shrink-0 transition-transform ${
                      selectedAvatar === av
                        ? 'ring-2 ring-emerald-600 scale-105'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={av}
                      alt="Preset"
                      className="w-full h-full rounded-full object-cover bg-slate-100"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Lifetime Earnings Snapshot */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] text-slate-400 block font-medium">Balance</span>
            <span className="text-sm font-bold text-slate-800 font-mono-numbers mt-0.5 block">
              {user?.pointsBalance || 0} pts
            </span>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] text-slate-400 block font-medium">Total Earned</span>
            <span className="text-sm font-bold text-emerald-700 font-mono-numbers mt-0.5 block">
              {user?.totalEarnedPoints || 0} pts
            </span>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] text-slate-400 block font-medium">Withdrawn</span>
            <span className="text-sm font-bold text-slate-800 font-mono-numbers mt-0.5 block">
              ₹{user?.totalWithdrawnInr || 0}
            </span>
          </div>
        </div>

        {/* Security & Verification Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Account Verification & KYC</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
              <span className="text-slate-600">Registered Mobile:</span>
              <span className="font-bold font-mono-numbers text-slate-900">
                +91 {user?.mobile} ✓
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
              <span className="text-slate-600">Linked UPI ID:</span>
              <span className="font-bold font-mono text-slate-900">
                {user?.upiId || 'Not Linked'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
              <span className="text-slate-600">Account Standing:</span>
              <span className="font-bold text-emerald-700">
                {user?.status === 'active' ? 'Active & Good Standing' : 'Suspended'}
              </span>
            </div>
          </div>
        </div>

        {/* Platform Legal & Anti-Fraud Notice */}
        <div className="bg-slate-100/80 rounded-2xl border border-slate-200 p-3.5 text-xs text-slate-600 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>Platform Policy & Disclaimers</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            • <strong>No Guaranteed Income:</strong> N EARNING does not promise any guaranteed or fixed return. Earning points are awarded purely for actual completion and verification of legitimate sponsor tasks.
          </p>
          <p className="text-[11px] leading-relaxed">
            • <strong>Anti-Bot & Fraud Detection:</strong> Automated scripts, emulator clickers, and multiple accounts from the same physical device will result in immediate account termination.
          </p>
        </div>

        {/* Action Buttons: Download App, Admin Panel & Logout */}
        <div className="space-y-2 pt-1">
          <button
            onClick={onOpenDownload}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download N EARNING Android App (.apk)</span>
          </button>

          <button
            onClick={onOpenAdmin}
            className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
            <span>Switch to Admin Control Room</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
