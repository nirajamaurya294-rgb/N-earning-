import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  KeyRound,
  Users,
  CheckSquare,
  CreditCard,
  Settings,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Search,
  ExternalLink,
  Coins,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { api, authStorage } from '../api';
import { User, Task, TaskSubmission, Withdrawal, AdminSettings } from '../types';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

type AdminTab = 'overview' | 'submissions' | 'withdrawals' | 'users' | 'tasks' | 'settings';

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminPin, setAdminPin] = useState<string>(authStorage.getAdminPin() || '8899');
  const [pinInput, setPinInput] = useState<string>('8899');
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [notice, setNotice] = useState<string>('');

  // Overview Data
  const [overviewMetrics, setOverviewMetrics] = useState<any>(null);
  const [adminSettings, setAdminSettings] = useState<AdminSettings | null>(null);

  // Submissions Data
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);

  // Withdrawals Data
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  // Users Data
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState<string>('');

  // Tasks Data
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState<boolean>(false);
  const [newTaskData, setNewTaskData] = useState<Partial<Task>>({
    title: '',
    description: '',
    category: 'daily',
    rewardPoints: 20,
    estimatedMinutes: 2,
    requiresProof: false,
    badge: 'New',
  });

  // Action Modals State
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [utrInput, setUtrInput] = useState<string>('');
  const [rejectReason, setRejectReason] = useState<string>('');

  if (!isOpen) return null;

  const handleAdminLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.adminLogin(pinInput.trim());
      if (res.success) {
        setIsAuthenticated(true);
        setAdminPin(pinInput.trim());
        loadAdminData(pinInput.trim());
      }
    } catch (err: any) {
      setError(err.message || 'Invalid Admin PIN');
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async (pin: string = adminPin) => {
    setLoading(true);
    try {
      const [overviewRes, subsRes, wdRes, usersRes, tasksRes] = await Promise.all([
        api.getAdminOverview(pin),
        api.getAdminSubmissions(pin),
        api.getAdminWithdrawals(pin),
        api.getAdminUsers(pin),
        api.getAdminTasks(pin),
      ]);

      if (overviewRes.success) {
        setOverviewMetrics(overviewRes.metrics);
        setAdminSettings(overviewRes.adminSettings);
      }
      if (subsRes.success) setSubmissions(subsRes.submissions);
      if (wdRes.success) setWithdrawals(wdRes.withdrawals);
      if (usersRes.success) setUsers(usersRes.users);
      if (tasksRes.success) setTasks(tasksRes.tasks);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmission = async (
    submissionId: string,
    decision: 'approved' | 'rejected',
    reason?: string
  ) => {
    setError('');
    setNotice('');
    try {
      const res = await api.reviewAdminSubmission(adminPin, submissionId, decision, reason);
      setNotice(res.message);
      await loadAdminData();
      onDataChanged();
    } catch (err: any) {
      setError(err.message || 'Review action failed');
    }
  };

  const handleProcessWithdrawal = async (
    withdrawalId: string,
    action: 'approve' | 'reject',
    utr?: string,
    reason?: string
  ) => {
    setError('');
    setNotice('');
    try {
      const res = await api.processAdminWithdrawal(adminPin, withdrawalId, action, utr, reason);
      setNotice(res.message);
      setSelectedWithdrawal(null);
      setUtrInput('');
      setRejectReason('');
      await loadAdminData();
      onDataChanged();
    } catch (err: any) {
      setError(err.message || 'Processing withdrawal failed');
    }
  };

  const handleToggleUserBlock = async (user: User) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await api.updateAdminUser(adminPin, user.id, { status: nextStatus });
      setNotice(`User account marked as ${nextStatus}`);
      await loadAdminData();
      onDataChanged();
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    }
  };

  const handleToggleFraudFlag = async (user: User) => {
    const nextFlag = !user.isFraudFlagged;
    try {
      await api.updateAdminUser(adminPin, user.id, {
        isFraudFlagged: nextFlag,
        fraudReason: nextFlag ? 'Suspicious activity flagged by Admin' : '',
      });
      setNotice(`User fraud status updated to ${nextFlag ? 'Flagged' : 'Normal'}`);
      await loadAdminData();
      onDataChanged();
    } catch (err: any) {
      setError(err.message || 'Failed to update fraud flag');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskData.title || !newTaskData.description) {
      setError('Title and description required');
      return;
    }

    try {
      await api.createAdminTask(adminPin, newTaskData);
      setIsNewTaskModalOpen(false);
      setNotice('Task created successfully');
      setNewTaskData({
        title: '',
        description: '',
        category: 'daily',
        rewardPoints: 20,
        estimatedMinutes: 2,
        requiresProof: false,
        badge: 'New',
      });
      await loadAdminData();
      onDataChanged();
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.deleteAdminTask(adminPin, taskId);
      setNotice('Task deleted');
      await loadAdminData();
      onDataChanged();
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
    }
  };

  const handleResetDemo = async () => {
    if (!confirm('Reset entire database to initial rich seed demo state?')) return;
    try {
      await api.resetDemoData(adminPin);
      setNotice('Database reset to fresh test state');
      await loadAdminData();
      onDataChanged();
    } catch (err: any) {
      setError(err.message || 'Reset failed');
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.mobile.includes(q);
  });

  const pendingSubmissions = submissions.filter((s) => s.status === 'pending');
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-4xl bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>N EARNING — Admin Control Room</span>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                  Secure Admin Mode
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Task audits, UPI payout verification, user management & fraud prevention
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Not Authenticated View */}
        {!isAuthenticated ? (
          <div className="p-8 max-w-sm mx-auto text-center space-y-4 my-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-emerald-400 flex items-center justify-center mx-auto border border-slate-700">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Admin Authentication</h3>
            <p className="text-xs text-slate-400">
              Enter the 4-digit Master Admin PIN to access user balances, audits, and payouts.
            </p>

            {error && (
              <div className="p-2.5 bg-rose-950/50 border border-rose-800 text-rose-300 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-3">
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Admin PIN (Default: 8899)"
                className="w-full text-center tracking-widest text-lg font-bold font-mono py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
              >
                {loading ? 'Verifying...' : 'Unlock Admin Room'}
              </button>
            </form>
            <span className="text-[11px] text-slate-500 block">Default Demo PIN: 8899</span>
          </div>
        ) : (
          /* Authenticated Dashboard View */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Admin Tabs */}
            <div className="px-5 pt-2 bg-slate-950/80 border-b border-slate-800 flex items-center gap-1 overflow-x-auto shrink-0 no-scrollbar">
              {[
                { id: 'overview' as AdminTab, label: 'Overview' },
                {
                  id: 'submissions' as AdminTab,
                  label: 'Verify Proofs',
                  badge: pendingSubmissions.length || undefined,
                },
                {
                  id: 'withdrawals' as AdminTab,
                  label: 'UPI Payouts',
                  badge: pendingWithdrawals.length || undefined,
                },
                { id: 'users' as AdminTab, label: 'Users' },
                { id: 'tasks' as AdminTab, label: 'Tasks' },
                { id: 'settings' as AdminTab, label: 'Settings' },
              ].map((tab) => {
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentTab(tab.id)}
                    className={`px-3.5 py-2 text-xs font-semibold whitespace-nowrap rounded-t-xl transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-slate-900 text-emerald-400 border-t-2 border-emerald-500'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 rounded-full font-mono">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Notification / Feedback Banner */}
            {notice && (
              <div className="mx-5 mt-3 p-2.5 bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center justify-between">
                <span>{notice}</span>
                <button onClick={() => setNotice('')} className="text-emerald-400 hover:text-white">
                  ✕
                </button>
              </div>
            )}

            {error && (
              <div className="mx-5 mt-3 p-2.5 bg-rose-950/70 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center justify-between">
                <span>{error}</span>
                <button onClick={() => setError('')} className="text-rose-400 hover:text-white">
                  ✕
                </button>
              </div>
            )}

            {/* Tab Contents */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {/* TAB 1: OVERVIEW */}
              {currentTab === 'overview' && overviewMetrics && (
                <div className="space-y-4">
                  {/* KPI Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl">
                      <span className="text-[11px] text-slate-400 block font-medium">
                        Total Users
                      </span>
                      <span className="text-xl font-bold font-mono text-white mt-1 block">
                        {overviewMetrics.totalUsers}
                      </span>
                      <span className="text-[10px] text-emerald-400">
                        {overviewMetrics.activeUsers} Active
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl">
                      <span className="text-[11px] text-slate-400 block font-medium">
                        Points Circulating
                      </span>
                      <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                        {overviewMetrics.totalPointsDistributed} pts
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ₹{(overviewMetrics.totalPointsDistributed / 10).toFixed(2)} Liability
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl">
                      <span className="text-[11px] text-slate-400 block font-medium">
                        Paid Out (INR)
                      </span>
                      <span className="text-xl font-bold font-mono text-amber-300 mt-1 block">
                        ₹{overviewMetrics.totalWithdrawnInr.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400">Verified UPI Transfers</span>
                    </div>

                    <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl">
                      <span className="text-[11px] text-slate-400 block font-medium">
                        Pending Actions
                      </span>
                      <span className="text-xl font-bold font-mono text-rose-400 mt-1 block">
                        {overviewMetrics.pendingSubmissionsCount +
                          overviewMetrics.pendingWithdrawalsCount}
                      </span>
                      <span className="text-[10px] text-amber-400">
                        {overviewMetrics.pendingSubmissionsCount} Tasks ·{' '}
                        {overviewMetrics.pendingWithdrawalsCount} Payouts
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                        <span>Pending Task Proofs: {pendingSubmissions.length}</span>
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Users submit screenshots or account credentials for partner app reviews. Admin verification is required before crediting reward points.
                      </p>
                      <button
                        onClick={() => setCurrentTab('submissions')}
                        className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30"
                      >
                        Audit Pending Proofs →
                      </button>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-amber-400" />
                        <span>Pending UPI Payouts: {pendingWithdrawals.length}</span>
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Total pending value: ₹{overviewMetrics.pendingWithdrawalsAmount.toFixed(2)}. Verify UPI receiver name and enter Bank UTR reference to complete transfer.
                      </p>
                      <button
                        onClick={() => setCurrentTab('withdrawals')}
                        className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/30"
                      >
                        Process Payouts →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: VERIFY SUBMISSIONS */}
              {currentTab === 'submissions' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <h3 className="font-bold text-white">Task Proof Verification Queue</h3>
                    <span className="text-slate-400 font-mono">
                      {pendingSubmissions.length} pending approval
                    </span>
                  </div>

                  {submissions.length > 0 ? (
                    submissions.map((sub) => {
                      const isPending = sub.status === 'pending';
                      return (
                        <div
                          key={sub.id}
                          className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    sub.status === 'approved'
                                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                      : sub.status === 'rejected'
                                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                                  }`}
                                >
                                  {sub.status.toUpperCase()}
                                </span>
                                <span className="text-xs text-slate-400 font-mono">
                                  {new Date(sub.submittedAt).toLocaleString()}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-white">{sub.taskTitle}</h4>
                              <p className="text-xs text-slate-300 mt-0.5">
                                Submitted by: <strong className="text-white">{sub.userName}</strong> (+91 {sub.userMobile})
                              </p>
                            </div>

                            <span className="text-sm font-bold font-mono text-emerald-400 shrink-0">
                              +{sub.rewardPoints} Pts
                            </span>
                          </div>

                          {/* Submitted Proof Content */}
                          {sub.proofText && (
                            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200">
                              <span className="text-slate-400 text-[10px] block font-semibold mb-1">
                                Proof Details:
                              </span>
                              {sub.proofText}
                            </div>
                          )}

                          {sub.proofImage && (
                            <div className="max-w-xs rounded-xl overflow-hidden border border-slate-800">
                              <img
                                src={sub.proofImage}
                                alt="Proof Screenshot"
                                className="w-full h-auto object-cover"
                              />
                            </div>
                          )}

                          {isPending && (
                            <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                              <button
                                onClick={() => handleReviewSubmission(sub.id, 'approved')}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve & Credit +{sub.rewardPoints} Pts</span>
                              </button>

                              <button
                                onClick={() => {
                                  const reason = prompt('Enter rejection reason:') || 'Proof criteria not met';
                                  handleReviewSubmission(sub.id, 'rejected', reason);
                                }}
                                className="px-3.5 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-8">
                      No task submissions found
                    </p>
                  )}
                </div>
              )}

              {/* TAB 3: UPI WITHDRAWALS */}
              {currentTab === 'withdrawals' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <h3 className="font-bold text-white">Withdrawal & UPI Payout Queue</h3>
                    <span className="text-slate-400 font-mono">
                      {pendingWithdrawals.length} pending transfers
                    </span>
                  </div>

                  {withdrawals.length > 0 ? (
                    withdrawals.map((wd) => {
                      const isPending = wd.status === 'pending';
                      return (
                        <div
                          key={wd.id}
                          className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    wd.status === 'approved'
                                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                      : wd.status === 'rejected'
                                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                                  }`}
                                >
                                  {wd.status.toUpperCase()}
                                </span>
                                <span className="text-xs text-slate-400 font-mono">
                                  {new Date(wd.requestedAt).toLocaleString()}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-white">
                                ₹{wd.amountInr.toFixed(2)} Payout ({wd.amountPoints} Points)
                              </h4>
                              <p className="text-xs text-slate-300 mt-0.5">
                                Beneficiary: <strong className="text-white">{wd.userName}</strong> (+91 {wd.userMobile})
                              </p>
                              <p className="text-xs font-mono font-bold text-emerald-400 mt-1">
                                UPI ID: {wd.upiId}
                              </p>
                              {wd.utrNumber && (
                                <p className="text-[11px] font-mono text-slate-400">
                                  Bank UTR: {wd.utrNumber}
                                </p>
                              )}
                            </div>
                          </div>

                          {isPending && (
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                              <button
                                onClick={() => {
                                  const utr = prompt(
                                    `Enter Bank / UPI UTR reference for ₹${wd.amountInr} payout:`,
                                    `UPI/${Date.now().toString().slice(-8)}/2026`
                                  );
                                  if (utr) {
                                    handleProcessWithdrawal(wd.id, 'approve', utr);
                                  }
                                }}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve & Mark Transferred</span>
                              </button>

                              <button
                                onClick={() => {
                                  const reason = prompt(
                                    'Enter rejection reason (Points will be auto-refunded to user wallet):',
                                    'Invalid UPI ID'
                                  );
                                  if (reason) {
                                    handleProcessWithdrawal(wd.id, 'reject', undefined, reason);
                                  }
                                }}
                                className="px-3.5 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject & Refund Points</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-8">
                      No withdrawal records found
                    </p>
                  )}
                </div>
              )}

              {/* TAB 4: USERS MANAGEMENT */}
              {currentTab === 'users' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-xs">
                      <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search by name or mobile..."
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {filteredUsers.length} users
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {filteredUsers.map((u) => (
                      <div
                        key={u.id}
                        className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-9 h-9 rounded-full bg-slate-800 object-cover"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-white">{u.name}</h4>
                              {u.isFraudFlagged && (
                                <span className="text-[10px] bg-rose-950 text-rose-400 px-1.5 py-0.5 rounded border border-rose-800">
                                  Flagged
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 font-mono">
                              +91 {u.mobile} · Referral: {u.referralCode}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              UPI: {u.upiId || 'Not linked'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <div className="text-right mr-2">
                            <span className="text-xs font-bold font-mono text-emerald-400 block">
                              {u.pointsBalance} pts
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ₹{(u.pointsBalance / 10).toFixed(2)}
                            </span>
                          </div>

                          <button
                            onClick={() => handleToggleUserBlock(u)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                              u.status === 'active'
                                ? 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                                : 'bg-rose-950 text-rose-300 border-rose-800'
                            }`}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>

                          <button
                            onClick={() => handleToggleFraudFlag(u)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                              u.isFraudFlagged
                                ? 'bg-amber-950 text-amber-300 border-amber-800'
                                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
                            }`}
                          >
                            {u.isFraudFlagged ? 'Unflag' : 'Flag Fraud'}
                          </button>

                          <button
                            onClick={() => {
                              const amount = prompt(
                                `Adjust balance for ${u.name} (e.g. +50 or -50 points):`
                              );
                              if (amount && !isNaN(Number(amount))) {
                                api.updateAdminUser(adminPin, u.id, {
                                  adjustPoints: Number(amount),
                                  adjustReason: 'Admin manual adjustment',
                                }).then(() => {
                                  setNotice(`Balance updated by ${amount} points`);
                                  loadAdminData();
                                  onDataChanged();
                                });
                              }
                            }}
                            className="px-2 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs hover:bg-slate-700"
                            title="Adjust points balance"
                          >
                            ± Pts
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: MANAGE TASKS */}
              {currentTab === 'tasks' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <h3 className="font-bold text-white">Platform Task Catalog</h3>
                    <button
                      onClick={() => setIsNewTaskModalOpen(true)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Task</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {tasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-mono uppercase bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800">
                              {t.category}
                            </span>
                            {t.requiresProof && (
                              <span className="text-[10px] bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded border border-amber-800">
                                Requires Proof
                              </span>
                            )}
                            <span className="text-[11px] text-slate-500 font-mono">
                              {t.totalCompletions} completions
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white truncate">{t.title}</h4>
                          <p className="text-[11px] text-slate-400 truncate">{t.description}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold font-mono text-emerald-400">
                            +{t.rewardPoints} pts
                          </span>

                          <button
                            onClick={() => handleDeleteTask(t.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: SETTINGS */}
              {currentTab === 'settings' && adminSettings && (
                <div className="space-y-4 max-w-lg">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-white">System Economics</h4>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-slate-400 block mb-1">
                          Conversion Rate (Points per 1 INR)
                        </label>
                        <input
                          type="number"
                          value={adminSettings.pointsPerInr}
                          onChange={(e) =>
                            setAdminSettings({
                              ...adminSettings,
                              pointsPerInr: Number(e.target.value) || 10,
                            })
                          }
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">
                          Minimum Withdrawal Threshold (INR)
                        </label>
                        <input
                          type="number"
                          value={adminSettings.minWithdrawalInr}
                          onChange={(e) =>
                            setAdminSettings({
                              ...adminSettings,
                              minWithdrawalInr: Number(e.target.value) || 50,
                            })
                          }
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="text-slate-400 block mb-1 text-xs">
                        Referral Bonus (Points per registered friend)
                      </label>
                      <input
                        type="number"
                        value={adminSettings.referralBonusPoints}
                        onChange={(e) =>
                          setAdminSettings({
                            ...adminSettings,
                            referralBonusPoints: Number(e.target.value) || 50,
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold text-xs"
                      />
                    </div>

                    <button
                      onClick={async () => {
                        await api.updateAdminSettings(adminPin, adminSettings);
                        setNotice('System settings updated successfully');
                        onDataChanged();
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Save Configuration
                    </button>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                    <h4 className="text-xs font-bold text-rose-400">Database Maintenance</h4>
                    <p className="text-xs text-slate-400">
                      Reset the server database back to standard sample tasks, pending proofs, and user seed data for evaluation.
                    </p>
                    <button
                      onClick={handleResetDemo}
                      className="px-4 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Demo Database State</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal for Creating New Task */}
        {isNewTaskModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Add New Platform Task</h3>
                <button
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Task Title</label>
                  <input
                    type="text"
                    required
                    value={newTaskData.title}
                    onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                    placeholder="e.g. Watch Partner Promo"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    required
                    value={newTaskData.description}
                    onChange={(e) =>
                      setNewTaskData({ ...newTaskData, description: e.target.value })
                    }
                    placeholder="Instructions for user..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Category</label>
                    <select
                      value={newTaskData.category}
                      onChange={(e) =>
                        setNewTaskData({ ...newTaskData, category: e.target.value as any })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    >
                      <option value="daily">Daily Task</option>
                      <option value="video">Video Ad</option>
                      <option value="survey">Survey</option>
                      <option value="promo">Promo Link</option>
                      <option value="app">App Install</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Reward (Points)</label>
                    <input
                      type="number"
                      required
                      value={newTaskData.rewardPoints}
                      onChange={(e) =>
                        setNewTaskData({ ...newTaskData, rewardPoints: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="reqProof"
                    checked={newTaskData.requiresProof}
                    onChange={(e) =>
                      setNewTaskData({ ...newTaskData, requiresProof: e.target.checked })
                    }
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="reqProof" className="text-slate-300">
                    Requires Admin Screenshot / ID Audit
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewTaskModalOpen(false)}
                    className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
