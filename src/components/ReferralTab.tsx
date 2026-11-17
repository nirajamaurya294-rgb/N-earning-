import React, { useState, useEffect } from 'react';
import {
  Users,
  Copy,
  Check,
  Share2,
  Gift,
  Coins,
  QrCode,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { api } from '../api';

export const ReferralTab: React.FC = () => {
  const [referralCode, setReferralCode] = useState<string>('NEARN789');
  const [bonusPoints, setBonusPoints] = useState<number>(50);
  const [bonusInr, setBonusInr] = useState<number>(5);
  const [totalInvited, setTotalInvited] = useState<number>(0);
  const [totalEarnedInr, setTotalEarnedInr] = useState<number>(0);
  const [totalEarnedPoints, setTotalEarnedPoints] = useState<number>(0);
  const [referredFriends, setReferredFriends] = useState<
    Array<{
      id: string;
      name: string;
      mobile: string;
      avatar: string;
      joinedAt: string;
      status: string;
    }>
  >([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [showQr, setShowQr] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const res = await api.getReferrals();
        if (res.success) {
          setReferralCode(res.referralCode);
          setBonusPoints(res.referralBonusPoints);
          setBonusInr(res.referralBonusInr);
          setTotalInvited(res.totalInvited);
          setTotalEarnedInr(res.totalEarnedInr);
          setTotalEarnedPoints(res.totalEarnedPoints);
          setReferredFriends(res.referredFriends);
        }
      } catch (err) {
        console.error('Failed to load referral data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReferralData();
  }, []);

  const shareText = `Join N EARNING using my code ${referralCode} and get +50 Welcome Reward Points instantly! Earn real UPI payouts for completing daily tasks.`;
  const shareUrl = window.location.origin;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      `${shareText}\n${shareUrl}`
    )}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'N EARNING - Earn Online Rewards',
          text: shareText,
          url: shareUrl,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex-1 pb-8 space-y-4">
      {/* Top Banner */}
      <div className="bg-emerald-700 text-white px-4 pt-2 pb-5 rounded-b-3xl shadow-sm">
        <h2 className="text-lg font-bold flex items-center gap-1.5">
          <Users className="w-5 h-5 text-amber-300" />
          <span>Refer & Earn Program</span>
        </h2>
        <p className="text-xs text-emerald-100 mt-0.5">
          Invite friends & earn +{bonusPoints} points (₹{bonusInr.toFixed(2)}) for every verified registration
        </p>
      </div>

      <div className="px-4 space-y-4">
        {/* Referral Code Card */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-5 text-white shadow-lg border border-emerald-500/40 text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-emerald-900/60 px-3 py-1 rounded-full text-xs font-semibold text-emerald-200">
            <Gift className="w-3.5 h-3.5 text-amber-300" />
            <span>Your Exclusive Invite Code</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/20 flex items-center justify-between max-w-xs mx-auto">
            <span className="text-2xl font-black tracking-widest font-mono text-amber-300 pl-2">
              {referralCode}
            </span>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-white text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs hover:bg-emerald-50 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-emerald-100 max-w-xs mx-auto">
            Share this code with your contacts. Your friend receives +50 welcome bonus points, and you receive +50 points!
          </p>

          {/* Share Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleWhatsAppShare}
              className="py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/20 active:scale-95 transition-all cursor-pointer"
            >
              <span>WhatsApp Share</span>
            </button>

            <button
              onClick={handleNativeShare}
              className="py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/20 active:scale-95 transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>More Options</span>
            </button>
          </div>
        </div>

        {/* Earnings Summary Metric Strip */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs text-center">
            <span className="text-[11px] text-slate-500 font-medium block">
              Friends Joined
            </span>
            <span className="text-xl font-extrabold text-slate-800 font-mono-numbers mt-0.5 block">
              {totalInvited} Users
            </span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs text-center">
            <span className="text-[11px] text-slate-500 font-medium block">
              Referral Reward Earned
            </span>
            <span className="text-xl font-extrabold text-emerald-700 font-mono-numbers mt-0.5 block">
              ₹{totalEarnedInr.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400 font-mono-numbers">
              ({totalEarnedPoints} Points)
            </span>
          </div>
        </div>

        {/* How It Works 3-Step Guide */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800">How Referral Works</h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                1
              </div>
              <p className="text-slate-600">
                <strong className="text-slate-800">Send Invite:</strong> Share your unique referral code with friends, family, or social media groups.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                2
              </div>
              <p className="text-slate-600">
                <strong className="text-slate-800">Friend Registers:</strong> Your friend signs up with OTP and enters your referral code.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                3
              </div>
              <p className="text-slate-600">
                <strong className="text-slate-800">Instant Rewards:</strong> Both of you get rewarded! Points are credited immediately to your wallets.
              </p>
            </div>
          </div>
        </div>

        {/* Referral Reward History */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span>Referred Friends History</span>
            <span className="text-[10px] text-slate-400 font-normal">
              {referredFriends.length} total
            </span>
          </h3>

          <div className="space-y-2 max-h-[220px] overflow-y-auto">
            {referredFriends.length > 0 ? (
              referredFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full bg-white object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{friend.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono-numbers">
                        +91 {friend.mobile} • {new Date(friend.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-700 font-mono-numbers bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    +{bonusPoints} Pts
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center py-5 text-xs text-slate-400">
                You haven't referred any friends yet. Share your code above to earn rewards!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
