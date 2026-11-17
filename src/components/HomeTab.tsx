import React from 'react';
import {
  Wallet,
  ArrowUpRight,
  Sparkles,
  Play,
  CalendarCheck2,
  Users,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Coins,
  CheckCircle2,
  AlertCircle,
  Download,
} from 'lucide-react';
import { User, Task } from '../types';
import { NavTab } from './BottomNav';

interface HomeTabProps {
  user: User | null;
  stats: {
    pointsBalance: number;
    inrBalance: number;
    todayEarnedPoints: number;
    todayEarnedInr: number;
    totalEarnedPoints: number;
    totalEarnedInr: number;
    referralEarningsPoints: number;
    referralEarningsInr: number;
    totalWithdrawnInr: number;
    pointsPerInr: number;
    minWithdrawalInr: number;
  };
  tasks: Array<
    Task & {
      userStatus: 'available' | 'pending' | 'completed';
    }
  >;
  onNavigate: (tab: NavTab) => void;
  onStartTask: (task: Task) => void;
  canClaimBonus: boolean;
  onOpenDownload: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  user,
  stats,
  tasks,
  onNavigate,
  onStartTask,
  canClaimBonus,
  onOpenDownload,
}) => {
  // Pick top available tasks
  const availableTasks = tasks.filter((t) => t.userStatus === 'available').slice(0, 3);
  const completedTodayCount = tasks.filter((t) => t.userStatus === 'completed').length;

  return (
    <div className="flex-1 pb-8 space-y-4">
      {/* Top Welcome & Notification Bar */}
      <div className="bg-emerald-700 text-white px-4 pt-1 pb-4 rounded-b-3xl shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xs text-emerald-200">Welcome back,</span>
            <h2 className="text-lg font-bold truncate max-w-[200px]">
              {user?.name || 'Valued Earner'}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-1.5 p-1 pr-2.5 bg-emerald-800/80 rounded-full hover:bg-emerald-900 transition-colors border border-emerald-600/40"
          >
            <img
              src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Niraj'}
              alt="Avatar"
              referrerPolicy="no-referrer"
              className="w-6 h-6 rounded-full bg-white object-cover"
            />
            <span className="text-[11px] font-semibold text-emerald-100">Profile</span>
          </button>
        </div>

        {/* Main Wallet Balance Card */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-4 rounded-2xl border border-emerald-500/40 shadow-lg text-white">
          <div className="flex items-center justify-between text-xs text-emerald-100 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Wallet className="w-3.5 h-3.5 text-amber-300" />
              Total Wallet Balance
            </span>
            <span className="bg-emerald-900/60 px-2 py-0.5 rounded-full text-[10px] font-mono-numbers">
              {stats.pointsPerInr} Pts = ₹1.00
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-1 mb-3">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold tracking-tight font-mono-numbers">
                  ₹{stats.inrBalance.toFixed(2)}
                </span>
                <span className="text-sm font-semibold text-emerald-200 font-mono-numbers">
                  ({stats.pointsBalance} Pts)
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 mt-0.5">
                Eligible for instant UPI withdrawal
              </p>
            </div>

            <button
              onClick={() => onNavigate('wallet')}
              className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs rounded-xl flex items-center gap-1 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <span>Withdraw</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Stats Strip */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-emerald-500/30 text-center text-xs">
            <div>
              <span className="text-[10px] text-emerald-200 block">Today's Earn</span>
              <span className="font-bold font-mono-numbers text-white">
                +{stats.todayEarnedPoints} pts
              </span>
            </div>
            <div className="border-x border-emerald-500/30">
              <span className="text-[10px] text-emerald-200 block">Streak</span>
              <span className="font-bold font-mono-numbers text-white">
                Day {user?.checkInStreak || 0} 🔥
              </span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-200 block">Referral Earn</span>
              <span className="font-bold font-mono-numbers text-white">
                ₹{stats.referralEarningsInr.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Promotional Graphic Banner */}
        <div className="relative rounded-2xl overflow-hidden shadow-sm border border-emerald-100 bg-emerald-950">
          <img
            src="/src/assets/images/earning_hero_banner_1794106087780.jpg"
            alt="Earn Rewards Online"
            referrerPolicy="no-referrer"
            className="w-full h-32 object-cover opacity-90 hover:opacity-100 transition-opacity"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/40 to-transparent p-3.5 flex flex-col justify-end text-white">
            <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              Verified Earning Hub
            </span>
            <p className="text-xs font-bold leading-tight mt-0.5">
              Complete daily tasks & earn real UPI reward points
            </p>
          </div>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => onNavigate('bonus')}
            className="p-2.5 bg-white rounded-2xl border border-slate-200 text-center hover:border-emerald-500 hover:shadow-sm transition-all active:scale-95 relative flex flex-col items-center"
          >
            {canClaimBonus && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            )}
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 leading-tight">Daily Bonus</span>
            <span className="text-[9px] text-emerald-600 font-semibold mt-0.5">Streak</span>
          </button>

          <button
            onClick={() => onNavigate('bonus')}
            className="p-2.5 bg-white rounded-2xl border border-slate-200 text-center hover:border-emerald-500 hover:shadow-sm transition-all active:scale-95 flex flex-col items-center"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-1.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 leading-tight">Lucky Spin</span>
            <span className="text-[9px] text-amber-600 font-semibold mt-0.5">Up to 35 Pts</span>
          </button>

          <button
            onClick={() => onNavigate('tasks')}
            className="p-2.5 bg-white rounded-2xl border border-slate-200 text-center hover:border-emerald-500 hover:shadow-sm transition-all active:scale-95 flex flex-col items-center"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-1.5">
              <Play className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 leading-tight">Watch Ads</span>
            <span className="text-[9px] text-blue-600 font-semibold mt-0.5">Instant Pts</span>
          </button>

          <button
            onClick={() => onNavigate('refer')}
            className="p-2.5 bg-white rounded-2xl border border-slate-200 text-center hover:border-emerald-500 hover:shadow-sm transition-all active:scale-95 flex flex-col items-center"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-1.5">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 leading-tight">Refer & Earn</span>
            <span className="text-[9px] text-purple-600 font-semibold mt-0.5">+50 Pts</span>
          </button>
        </div>

        {/* Download Official Android App Banner */}
        <div className="bg-gradient-to-r from-emerald-800 to-slate-900 rounded-2xl p-3.5 text-white shadow-md border border-emerald-600/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-sm">
              N
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white truncate">Install N EARNING App</span>
                <span className="text-[9px] font-bold bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-mono shrink-0">
                  APK
                </span>
              </div>
              <p className="text-[10px] text-emerald-200 mt-0.5 truncate">
                Direct Android APK & 1-Click Home Screen Install
              </p>
            </div>
          </div>
          <button
            onClick={onOpenDownload}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 shrink-0 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
        </div>

        {/* Available Tasks Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Featured High Reward Tasks</h3>
              <p className="text-[11px] text-slate-500">Verified and ready to complete</p>
            </div>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {availableTasks.length > 0 ? (
              availableTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl border border-slate-100 hover:border-emerald-200 bg-slate-50/50 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {task.badge && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {task.badge}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        ~{task.estimatedMinutes} min
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 truncate">
                      {task.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {task.description}
                    </p>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <div className="flex items-center gap-1 text-emerald-700 font-bold text-xs mb-1 font-mono-numbers">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      <span>+{task.rewardPoints} pts</span>
                    </div>
                    <button
                      onClick={() => onStartTask(task)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-xs active:scale-95 transition-all"
                    >
                      Start
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                <span>You have caught up with all featured tasks! Check back soon or visit the Tasks tab.</span>
              </div>
            )}
          </div>
        </div>

        {/* Transparency & Genuine Platform Notice */}
        <div className="p-3.5 rounded-2xl bg-slate-100/80 border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-900 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Legitimate Earning Platform Policy</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-600">
            N EARNING provides real reward points for participating in legitimate brand surveys, sponsored video viewing, and promotional partner testing. Points are only credited after actual verification. Withdrawals are processed to your verified UPI ID within 24 to 48 hours.
          </p>
          <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium pt-1">
            <span>• No Investment Needed</span>
            <span>• Real UPI Payouts</span>
            <span>• Anti-Fraud Audited</span>
          </div>
        </div>
      </div>
    </div>
  );
};
