import {
  User,
  Task,
  TaskSubmission,
  Transaction,
  Withdrawal,
  AdminSettings,
  DailyBonusStatus,
} from './types';

const TOKEN_KEY = 'n_earning_user_token';
const ADMIN_PIN_KEY = 'n_earning_admin_pin';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
  getAdminPin: () => localStorage.getItem(ADMIN_PIN_KEY) || '8899',
  setAdminPin: (pin: string) => localStorage.setItem(ADMIN_PIN_KEY, pin),
};

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('x-user-id', token);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Network error occurred. Please try again.');
  }

  return data as T;
}

// ---------------- AUTH API ----------------

export const api = {
  sendOtp: async (mobile: string) => {
    return apiRequest<{
      success: boolean;
      message: string;
      isExistingUser: boolean;
      debugOtp?: string;
    }>('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile }),
    });
  },

  verifyOtp: async (mobile: string, otp: string, name?: string, referralCode?: string) => {
    const res = await apiRequest<{
      success: boolean;
      message: string;
      user: User;
      token: string;
    }>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile, otp, name, referralCode }),
    });
    if (res.token) {
      authStorage.setToken(res.token);
    }
    return res;
  },

  getProfile: async () => {
    return apiRequest<{
      success: boolean;
      user: User;
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
    }>('/api/user/profile');
  },

  updateProfile: async (data: { name?: string; upiId?: string; avatar?: string }) => {
    return apiRequest<{
      success: boolean;
      user: User;
      message: string;
    }>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // ---------------- TASKS API ----------------

  getTasks: async () => {
    return apiRequest<{
      success: boolean;
      tasks: Array<
        Task & {
          userStatus: 'available' | 'pending' | 'completed';
          submissionId: string | null;
          submissionDate: string | null;
        }
      >;
      pointsPerInr: number;
    }>('/api/tasks');
  },

  submitTask: async (
    taskId: string,
    payload: {
      proofText?: string;
      proofImage?: string;
      surveyAnswers?: Record<string, string>;
      watchedDurationSeconds?: number;
    }
  ) => {
    return apiRequest<{
      success: boolean;
      status: 'pending' | 'approved';
      rewardPoints?: number;
      newBalancePoints?: number;
      newBalanceInr?: number;
      message: string;
      submission: TaskSubmission;
    }>(`/api/tasks/${taskId}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // ---------------- DAILY BONUS API ----------------

  getDailyBonusStatus: async () => {
    return apiRequest<DailyBonusStatus & { success: boolean }>('/api/daily-bonus/status');
  },

  claimDailyBonus: async () => {
    return apiRequest<{
      success: boolean;
      rewardPoints: number;
      newStreak: number;
      newBalancePoints: number;
      message: string;
    }>('/api/daily-bonus/claim', {
      method: 'POST',
    });
  },

  spinLuckyBonus: async () => {
    return apiRequest<{
      success: boolean;
      wonPoints: number;
      newBalancePoints: number;
      message: string;
    }>('/api/daily-bonus/spin', {
      method: 'POST',
    });
  },

  // ---------------- WALLET API ----------------

  getWallet: async () => {
    return apiRequest<{
      success: boolean;
      balancePoints: number;
      balanceInr: number;
      pointsPerInr: number;
      minWithdrawalInr: number;
      upiId: string;
      transactions: Transaction[];
      withdrawals: Withdrawal[];
    }>('/api/wallet');
  },

  requestWithdrawal: async (amountInr: number, upiId: string) => {
    return apiRequest<{
      success: boolean;
      message: string;
      withdrawal: Withdrawal;
      newBalancePoints: number;
      newBalanceInr: number;
    }>('/api/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amountInr, upiId }),
    });
  },

  // ---------------- REFERRAL API ----------------

  getReferrals: async () => {
    return apiRequest<{
      success: boolean;
      referralCode: string;
      referralBonusPoints: number;
      referralBonusInr: number;
      totalInvited: number;
      totalEarnedPoints: number;
      totalEarnedInr: number;
      referredFriends: Array<{
        id: string;
        name: string;
        mobile: string;
        avatar: string;
        joinedAt: string;
        status: string;
      }>;
    }>('/api/referrals');
  },

  // ---------------- ADMIN API ----------------

  adminLogin: async (pin: string) => {
    const res = await apiRequest<{
      success: boolean;
      message: string;
      token: string;
    }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ pin }),
    });
    if (res.success) {
      authStorage.setAdminPin(pin);
    }
    return res;
  },

  getAdminOverview: async (pin: string) => {
    return apiRequest<{
      success: boolean;
      metrics: {
        totalUsers: number;
        activeUsers: number;
        suspendedUsers: number;
        fraudFlaggedUsers: number;
        totalPointsDistributed: number;
        totalWithdrawnInr: number;
        pendingWithdrawalsCount: number;
        pendingWithdrawalsAmount: number;
        pendingSubmissionsCount: number;
        totalTasksCount: number;
        activeTasksCount: number;
      };
      adminSettings: AdminSettings;
    }>('/api/admin/overview', {
      headers: { 'x-admin-pin': pin },
    });
  },

  getAdminUsers: async (pin: string) => {
    return apiRequest<{ success: boolean; users: User[] }>('/api/admin/users', {
      headers: { 'x-admin-pin': pin },
    });
  },

  updateAdminUser: async (
    pin: string,
    userId: string,
    data: {
      status?: 'active' | 'suspended';
      isFraudFlagged?: boolean;
      fraudReason?: string;
      adjustPoints?: number;
      adjustReason?: string;
    }
  ) => {
    return apiRequest<{ success: boolean; user: User; message: string }>(
      `/api/admin/users/${userId}`,
      {
        method: 'PUT',
        headers: { 'x-admin-pin': pin },
        body: JSON.stringify(data),
      }
    );
  },

  getAdminTasks: async (pin: string) => {
    return apiRequest<{ success: boolean; tasks: Task[] }>('/api/admin/tasks', {
      headers: { 'x-admin-pin': pin },
    });
  },

  createAdminTask: async (pin: string, taskData: Partial<Task>) => {
    return apiRequest<{ success: boolean; task: Task; message: string }>('/api/admin/tasks', {
      method: 'POST',
      headers: { 'x-admin-pin': pin },
      body: JSON.stringify(taskData),
    });
  },

  updateAdminTask: async (pin: string, taskId: string, taskData: Partial<Task>) => {
    return apiRequest<{ success: boolean; task: Task; message: string }>(
      `/api/admin/tasks/${taskId}`,
      {
        method: 'PUT',
        headers: { 'x-admin-pin': pin },
        body: JSON.stringify(taskData),
      }
    );
  },

  deleteAdminTask: async (pin: string, taskId: string) => {
    return apiRequest<{ success: boolean; message: string }>(`/api/admin/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { 'x-admin-pin': pin },
    });
  },

  getAdminSubmissions: async (pin: string) => {
    return apiRequest<{ success: boolean; submissions: TaskSubmission[] }>(
      '/api/admin/submissions',
      {
        headers: { 'x-admin-pin': pin },
      }
    );
  },

  reviewAdminSubmission: async (
    pin: string,
    submissionId: string,
    decision: 'approved' | 'rejected',
    rejectionReason?: string
  ) => {
    return apiRequest<{ success: boolean; submission: TaskSubmission; message: string }>(
      `/api/admin/submissions/${submissionId}/review`,
      {
        method: 'POST',
        headers: { 'x-admin-pin': pin },
        body: JSON.stringify({ decision, rejectionReason }),
      }
    );
  },

  getAdminWithdrawals: async (pin: string) => {
    return apiRequest<{ success: boolean; withdrawals: Withdrawal[] }>('/api/admin/withdrawals', {
      headers: { 'x-admin-pin': pin },
    });
  },

  processAdminWithdrawal: async (
    pin: string,
    withdrawalId: string,
    action: 'approve' | 'reject',
    utrNumber?: string,
    rejectionReason?: string
  ) => {
    return apiRequest<{ success: boolean; withdrawal: Withdrawal; message: string }>(
      `/api/admin/withdrawals/${withdrawalId}/process`,
      {
        method: 'POST',
        headers: { 'x-admin-pin': pin },
        body: JSON.stringify({ action, utrNumber, rejectionReason }),
      }
    );
  },

  updateAdminSettings: async (pin: string, settings: Partial<AdminSettings>) => {
    return apiRequest<{ success: boolean; settings: AdminSettings; message: string }>(
      '/api/admin/settings',
      {
        method: 'PUT',
        headers: { 'x-admin-pin': pin },
        body: JSON.stringify(settings),
      }
    );
  },

  resetDemoData: async (pin: string) => {
    return apiRequest<{ success: boolean; message: string }>('/api/admin/reset-demo', {
      method: 'POST',
      headers: { 'x-admin-pin': pin },
    });
  },
};
