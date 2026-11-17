import React, { useState, useEffect } from 'react';
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Edit2,
  Check,
  X,
  CreditCard,
  History,
} from 'lucide-react';
import { api } from '../api';
import { Transaction, Withdrawal } from '../types';

interface WalletTabProps {
  onRefreshProfile: () => void;
}

export const WalletTab: React.FC<WalletTabProps> = ({ onRefreshProfile }) => {
  const [balancePoints, setBalancePoints] = useState<number>(0);
  const [balanceInr, setBalanceInr] = useState<number>(0);
  const [pointsPerInr, setPointsPerInr] = useState<number>(10);
  const [minWithdrawalInr, setMinWithdrawalInr] = useState<number>(50);
  const [upiId, setUpiId] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [txFilter, setTxFilter] = useState<'all' | 'credit' | 'withdrawal'>('all');

  // Edit UPI State
  const [isEditingUpi, setIsEditingUpi] = useState<boolean>(false);
  const [newUpiInput, setNewUpiInput] = useState<string>('');
  const [upiError, setUpiError] = useState<string>('');
  const [upiSuccess, setUpiSuccess] = useState<string>('');

  // Withdrawal Modal State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('50');
  const [withdrawUpi, setWithdrawUpi] = useState<string>('');
  const [withdrawSubmitting, setWithdrawSubmitting] = useState<boolean>(false);
  const [withdrawError, setWithdrawError] = useState<string>('');
  const [withdrawSuccess, setWithdrawSuccess] = useState<string>('');

  const loadWalletData = async () => {
    try {
      const res = await api.getWallet();
      if (res.success) {
        setBalancePoints(res.balancePoints);
        setBalanceInr(res.balanceInr);
        setPointsPerInr(res.pointsPerInr);
        setMinWithdrawalInr(res.minWithdrawalInr);
        setUpiId(res.upiId || '');
        setWithdrawUpi(res.upiId || '');
        setTransactions(res.transactions);
        setWithdrawals(res.withdrawals);
      }
    } catch (err) {
      console.error('Failed to load wallet', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, []);

  const handleSaveUpi = async () => {
    setUpiError('');
    setUpiSuccess('');

    const clean = newUpiInput.trim();
    if (!/^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(clean)) {
      setUpiError('Enter a valid UPI ID (e.g. name@okaxis, mobile@paytm)');
      return;
    }

    try {
      await api.updateProfile({ upiId: clean });
      setUpiId(clean);
      setWithdrawUpi(clean);
      setIsEditingUpi(false);
      setUpiSuccess('UPI ID updated successfully');
      onRefreshProfile();
    } catch (err: any) {
      setUpiError(err.message || 'Failed to update UPI ID');
    }
  };

  const handleInitiateWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');

    const amount = Number(withdrawAmount);
    if (isNaN(amount) || amount < minWithdrawalInr) {
      setWithdrawError(`Minimum withdrawal is ₹${minWithdrawalInr}.00`);
      return;
    }

    const neededPoints = amount * pointsPerInr;
    if (balancePoints < neededPoints) {
      setWithdrawError(
        `Insufficient points. You need ${neededPoints} points for ₹${amount.toFixed(2)}.`
      );
      return;
    }

    if (!withdrawUpi || !/^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(withdrawUpi.trim())) {
      setWithdrawError('Please enter a valid target UPI ID');
      return;
    }

    setWithdrawSubmitting(true);
    try {
      const res = await api.requestWithdrawal(amount, withdrawUpi.trim());
      setWithdrawSuccess(res.message);
      setBalancePoints(res.newBalancePoints);
      setBalanceInr(res.newBalanceInr);
      await loadWalletData();
      onRefreshProfile();
      setTimeout(() => {
        setIsWithdrawModalOpen(false);
        setWithdrawSuccess('');
      }, 2000);
    } catch (err: any) {
      setWithdrawError(err.message || 'Withdrawal request failed');
    } finally {
      setWithdrawSubmitting(false);
    }
  };

  const progressToMin = Math.min(100, Math.round((balanceInr / minWithdrawalInr) * 100));

  const filteredTransactions = transactions.filter((tx) => {
    if (txFilter === 'credit') return tx.type !== 'withdrawal';
    if (txFilter === 'withdrawal') return tx.type === 'withdrawal';
    return true;
  });

  return (
    <div className="flex-1 pb-8 space-y-4">
      {/* Top Banner */}
      <div className="bg-emerald-700 text-white px-4 pt-2 pb-5 rounded-b-3xl shadow-sm">
        <h2 className="text-lg font-bold flex items-center gap-1.5">
          <WalletIcon className="w-5 h-5 text-amber-300" />
          <span>My Earnings Wallet</span>
        </h2>
        <p className="text-xs text-emerald-100 mt-0.5">
          Direct instant UPI withdrawals with genuine payout records
        </p>
      </div>

      <div className="px-4 space-y-4">
        {/* Main Wallet Card */}
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 rounded-3xl p-5 text-white shadow-lg border border-emerald-500/40 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-emerald-100 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Available Redeemable Balance
            </span>
            <span className="bg-emerald-900/70 px-2 py-0.5 rounded-full text-[10px] font-mono-numbers">
              {pointsPerInr} Pts = ₹1.00 INR
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold tracking-tight font-mono-numbers">
              ₹{balanceInr.toFixed(2)}
            </span>
            <span className="text-sm font-semibold text-emerald-200 font-mono-numbers">
              ({balancePoints} Points)
            </span>
          </div>

          {/* Progress Bar to Minimum Limit */}
          <div className="mt-4 pt-3 border-t border-emerald-500/30 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-emerald-100">
              <span>Withdrawal Threshold:</span>
              <span className="font-bold font-mono-numbers">
                ₹{balanceInr.toFixed(2)} / ₹{minWithdrawalInr}.00 ({progressToMin}%)
              </span>
            </div>
            <div className="w-full h-2 bg-emerald-950/60 rounded-full overflow-hidden p-[1px]">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-300 rounded-full transition-all duration-500"
                style={{ width: `${progressToMin}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-2 flex items-center justify-between">
            <span className="text-[11px] text-emerald-200">
              {balanceInr >= minWithdrawalInr
                ? 'Ready for UPI withdrawal'
                : `Need ₹${(minWithdrawalInr - balanceInr).toFixed(2)} more to reach threshold`}
            </span>

            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              disabled={balanceInr < minWithdrawalInr}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:bg-emerald-800 disabled:text-emerald-400 text-slate-900 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <span>Withdraw to UPI</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* UPI ID Management Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-800">Linked UPI ID</h3>
            </div>
            {!isEditingUpi && (
              <button
                onClick={() => {
                  setNewUpiInput(upiId);
                  setIsEditingUpi(true);
                }}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>{upiId ? 'Change' : 'Link UPI'}</span>
              </button>
            )}
          </div>

          {upiSuccess && (
            <div className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 p-1.5 rounded-lg">
              {upiSuccess}
            </div>
          )}

          {isEditingUpi ? (
            <div className="space-y-2 pt-1">
              <div className="relative">
                <input
                  type="text"
                  value={newUpiInput}
                  onChange={(e) => setNewUpiInput(e.target.value)}
                  placeholder="e.g. mobile@paytm or name@okaxis"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  autoFocus
                />
              </div>
              {upiError && <p className="text-[11px] text-rose-600">{upiError}</p>}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveUpi}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save UPI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingUpi(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-800">
                {upiId || 'No UPI ID linked yet'}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                {upiId ? 'Verified' : 'Required for Payout'}
              </span>
            </div>
          )}
        </div>

        {/* Transaction & Withdrawal History */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-emerald-600" />
              <span>Wallet Ledger</span>
            </h3>

            {/* Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px]">
              <button
                onClick={() => setTxFilter('all')}
                className={`px-2 py-0.5 rounded-md font-semibold ${
                  txFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTxFilter('credit')}
                className={`px-2 py-0.5 rounded-md font-semibold ${
                  txFilter === 'credit' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                Earned
              </button>
              <button
                onClick={() => setTxFilter('withdrawal')}
                className={`px-2 py-0.5 rounded-md font-semibold ${
                  txFilter === 'withdrawal' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                Payouts
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => {
                const isWithdrawal = tx.type === 'withdrawal';
                return (
                  <div
                    key={tx.id}
                    className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isWithdrawal
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {isWithdrawal ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {tx.description}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono-numbers">
                          {new Date(tx.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-extrabold font-mono-numbers block ${
                          isWithdrawal ? 'text-amber-700' : 'text-emerald-700'
                        }`}
                      >
                        {isWithdrawal ? '-' : '+'}₹{tx.amountInr.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono-numbers">
                        ({tx.amountPoints} pts)
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center py-6 text-xs text-slate-400">
                No transaction records in this filter
              </p>
            )}
          </div>
        </div>

        {/* Withdrawal Rules & Security Footnote */}
        <div className="p-3.5 bg-slate-100/70 border border-slate-200 rounded-2xl text-[11px] text-slate-600 space-y-1">
          <span className="font-bold text-slate-800 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Withdrawal Rules & Guidelines</span>
          </span>
          <p>• Minimum withdrawal threshold: ₹{minWithdrawalInr}.00 (500 Points).</p>
          <p>• Payouts processed via direct UPI transfer within 24 to 48 business hours.</p>
          <p>• Maximum 1 active pending withdrawal permitted at a time.</p>
          <p>• Fraud check: Accounts with suspicious bot activity are subject to manual audit.</p>
        </div>
      </div>

      {/* WITHDRAWAL MODAL */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-3 bg-emerald-700 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Request UPI Withdrawal</h3>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="p-1 hover:bg-emerald-800 rounded-lg text-emerald-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInitiateWithdrawal} className="p-4 space-y-4">
              {withdrawError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{withdrawError}</span>
                </div>
              )}

              {withdrawSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{withdrawSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Withdrawal Amount (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm font-extrabold text-slate-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={minWithdrawalInr}
                    max={balanceInr}
                    step="1"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono-numbers"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>
                    Deducts:{' '}
                    <strong className="text-emerald-700 font-mono-numbers">
                      {(Number(withdrawAmount) || 0) * pointsPerInr} Points
                    </strong>
                  </span>
                  <span>Min: ₹{minWithdrawalInr}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Recipient UPI ID
                </label>
                <input
                  type="text"
                  value={withdrawUpi}
                  onChange={(e) => setWithdrawUpi(e.target.value)}
                  placeholder="e.g. mobile@paytm or name@okaxis"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block">Payout Summary:</span>
                <p>• Payout: ₹{Number(withdrawAmount) || 0} via IMPS/UPI</p>
                <p>• Estimated Time: 24 to 48 Hours</p>
                <p>• Processing Fee: ₹0.00 (Zero Fee)</p>
              </div>

              <button
                type="submit"
                disabled={withdrawSubmitting}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20 active:scale-98 transition-all cursor-pointer"
              >
                {withdrawSubmitting ? 'Submitting Request...' : 'Confirm UPI Withdrawal'}
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
