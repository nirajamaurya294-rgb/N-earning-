import React, { useState } from 'react';
import { Smartphone, KeyRound, User, Gift, ArrowRight, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import { api } from '../api';
import { User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (user: UserType) => void;
  onClose?: () => void;
  initialMobile?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onSuccess,
  initialMobile = '9876543210',
}) => {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState<string>(initialMobile);
  const [otp, setOtp] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [referralCode, setReferralCode] = useState<string>('');
  const [debugOtp, setDebugOtp] = useState<string>('');
  const [isExistingUser, setIsExistingUser] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    const clean = mobile.trim();
    if (!/^\d{10}$/.test(clean)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const res = await api.sendOtp(clean);
      setIsExistingUser(res.isExistingUser);
      if (res.debugOtp) {
        setDebugOtp(res.debugOtp);
      }
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!otp || otp.trim().length < 4) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await api.verifyOtp(mobile, otp, name, referralCode);
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Banner */}
        <div className="bg-emerald-700 px-6 pt-6 pb-5 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-emerald-600 rounded-full opacity-40 blur-xl pointer-events-none" />
          <div className="w-12 h-12 bg-white rounded-2xl mx-auto flex items-center justify-center text-emerald-700 font-extrabold text-2xl shadow-md mb-2">
            N
          </div>
          <h2 className="text-xl font-bold tracking-tight">N EARNING</h2>
          <p className="text-xs text-emerald-100 mt-0.5">
            Verified Online Earning & Rewards Platform
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          {step === 'mobile' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mobile Number
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center gap-1.5 text-xs font-bold text-slate-600 pointer-events-none border-r border-slate-200 pr-2">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit number"
                    className="w-full pl-20 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-mono-numbers"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  We'll send a secure one-time password (OTP) via SMS.
                </p>
              </div>

              {/* Quick Demo Credentials shortcut */}
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-900">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Quick Test Account</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Demo: +91 9876543210</span>
                  <button
                    type="button"
                    onClick={() => setMobile('9876543210')}
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    Select Demo
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || mobile.length !== 10}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                {loading ? 'Sending OTP...' : 'Get OTP Verification'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {/* Simulated OTP Notification Banner */}
              {debugOtp && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
                  <div>
                    <span className="font-semibold block text-[11px] text-emerald-700">
                      SMS Simulator:
                    </span>
                    <span className="font-mono-numbers font-bold text-sm tracking-wider">
                      Your OTP is {debugOtp}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtp(debugOtp)}
                    className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[11px] hover:bg-emerald-700 transition-colors"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Enter 6-Digit OTP
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep('mobile')}
                    className="text-xs text-emerald-700 hover:underline font-medium"
                  >
                    Change Number
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-mono-numbers"
                    autoFocus
                  />
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                  <span>Sent to +91 {mobile}</span>
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    className="text-emerald-700 hover:underline"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>

              {/* Extra details if new user */}
              {!isExistingUser && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Referral Code (Optional)
                    </label>
                    <div className="relative">
                      <Gift className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                        placeholder="e.g. NEARN789"
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase font-mono tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <span className="text-[10px] text-emerald-700 mt-0.5 block">
                      Get +50 welcome bonus points!
                    </span>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading || otp.length < 4}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Trust Footnote */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit encrypted secure session</span>
          </div>
        </div>
      </div>
    </div>
  );
};
