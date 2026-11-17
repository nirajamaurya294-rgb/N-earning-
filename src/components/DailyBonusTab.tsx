import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Flame,
  Gift,
  Coins,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Clock,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api';
import { DailyBonusStatus } from '../types';

interface DailyBonusTabProps {
  onBonusClaimed: (points: number) => void;
}

export const DailyBonusTab: React.FC<DailyBonusTabProps> = ({ onBonusClaimed }) => {
  const [bonusStatus, setBonusStatus] = useState<DailyBonusStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [claiming, setClaiming] = useState<boolean>(false);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [spinResult, setSpinResult] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [error, setError] = useState<string>('');

  const loadStatus = async () => {
    try {
      const res = await api.getDailyBonusStatus();
      if (res.success) {
        setBonusStatus(res);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bonus status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#F59E0B', '#3B82F6', '#EC4899'],
      });
    } catch {}
  };

  const handleClaimDaily = async () => {
    if (!bonusStatus?.canClaimToday) return;
    setClaiming(true);
    setError('');
    setFeedback('');

    try {
      const res = await api.claimDailyBonus();
      triggerConfetti();
      setFeedback(res.message);
      onBonusClaimed(res.rewardPoints);
      await loadStatus();
    } catch (err: any) {
      setError(err.message || 'Could not claim daily bonus');
    } finally {
      setClaiming(false);
    }
  };

  const handleSpinWheel = async () => {
    if (!bonusStatus?.canSpinToday || spinning) return;
    setSpinning(true);
    setError('');
    setFeedback('');
    setSpinResult(null);

    try {
      // Simulate wheel spinning delay
      setTimeout(async () => {
        try {
          const res = await api.spinLuckyBonus();
          triggerConfetti();
          setSpinResult(res.wonPoints);
          setFeedback(res.message);
          onBonusClaimed(res.wonPoints);
          await loadStatus();
        } catch (err: any) {
          setError(err.message || 'Spin failed');
        } finally {
          setSpinning(false);
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Spin failed');
      setSpinning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 pb-8 space-y-4">
      {/* Top Banner */}
      <div className="bg-emerald-700 text-white px-4 pt-2 pb-5 rounded-b-3xl shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-1.5">
              <span>Daily Rewards & Streak</span>
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            </h2>
            <p className="text-xs text-emerald-100 mt-0.5">
              Check in daily to build your streak multiplier
            </p>
          </div>
          <div className="bg-emerald-800/80 px-3 py-1.5 rounded-2xl border border-emerald-600/40 text-center">
            <span className="text-[10px] text-emerald-200 block">Current Streak</span>
            <span className="text-sm font-extrabold text-amber-300 font-mono-numbers">
              {bonusStatus?.streak || 0} Days 🔥
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {feedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{feedback}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 7-Day Streak Calendar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>7-Day Check-in Plan</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">
              Resets if a day is missed
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {bonusStatus?.weeklyPlan.map((day) => (
              <div
                key={day.day}
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-between transition-all ${
                  day.isClaimed
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : day.isToday
                    ? 'bg-amber-50 border-2 border-amber-400 shadow-xs'
                    : 'bg-slate-50 border border-slate-200/70 text-slate-500'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-500">D{day.day}</span>
                <div className="my-1">
                  {day.isClaimed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                  ) : (
                    <Coins className="w-4 h-4 text-amber-500 mx-auto" />
                  )}
                </div>
                <span className="text-[10px] font-extrabold font-mono-numbers">
                  +{day.points}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={handleClaimDaily}
            disabled={claiming || !bonusStatus?.canClaimToday}
            className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all ${
              bonusStatus?.canClaimToday
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active:scale-98 cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            {claiming ? (
              'Claiming...'
            ) : bonusStatus?.canClaimToday ? (
              <>
                <Gift className="w-3.5 h-3.5" />
                <span>Claim Today's +{bonusStatus.todayRewardPoints} Points</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Today's Check-in Claimed</span>
              </>
            )}
          </button>
        </div>

        {/* Special Bonus: Lucky Spin Wheel / Scratch Bonus */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl border border-amber-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-xs">
                ★
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Lucky Bonus Spin</h3>
                <p className="text-[10px] text-slate-500">Available every 12 hours</p>
              </div>
            </div>

            <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md">
              Win 5-35 Pts
            </span>
          </div>

          {/* Interactive Wheel Graphic Box */}
          <div className="relative py-4 text-center">
            <div
              className={`w-28 h-28 mx-auto rounded-full border-4 border-amber-400 bg-white shadow-md flex items-center justify-center text-center p-2 relative overflow-hidden transition-all duration-1000 ${
                spinning ? 'rotate-[720deg] scale-105' : ''
              }`}
            >
              <div className="absolute inset-0 bg-radial from-amber-100 to-amber-300 opacity-30" />
              <div className="relative z-10 flex flex-col items-center">
                {spinResult !== null ? (
                  <>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Won</span>
                    <span className="text-xl font-extrabold text-amber-600 font-mono-numbers">
                      +{spinResult}
                    </span>
                    <span className="text-[9px] text-emerald-700 font-bold">Points</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 text-amber-500 mb-0.5" />
                    <span className="text-[10px] font-bold text-slate-700">LUCKY</span>
                    <span className="text-[9px] text-slate-400 font-semibold">BONUS</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleSpinWheel}
            disabled={spinning || !bonusStatus?.canSpinToday}
            className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all ${
              bonusStatus?.canSpinToday
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20 active:scale-98 cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            {spinning ? (
              <span className="flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Spinning Wheel...</span>
              </span>
            ) : bonusStatus?.canSpinToday ? (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Spin & Win Bonus Points</span>
              </>
            ) : (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Next Spin in {bonusStatus?.spinCooldownMinutes || 0} mins</span>
              </span>
            )}
          </button>
        </div>

        {/* Bonus Rules & Tips */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-500 space-y-1">
          <span className="font-bold text-slate-700 block">Streak Guidelines:</span>
          <p>• Check in daily without missing 24 hours to keep your multiplier active.</p>
          <p>• Day 7 rewards a grand bonus of 50 reward points (₹5.00 INR).</p>
          <p>• Bonus points can be withdrawn instantly once minimum wallet threshold is reached.</p>
        </div>
      </div>
    </div>
  );
};
