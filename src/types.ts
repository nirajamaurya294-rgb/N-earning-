export type TaskCategory = 'daily' | 'video' | 'survey' | 'promo' | 'app';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  rewardPoints: number;
  estimatedMinutes: number;
  videoUrl?: string;
  videoDurationSeconds?: number;
  surveyQuestions?: Array<{
    id: string;
    question: string;
    options: string[];
  }>;
  externalLink?: string;
  requiresProof: boolean;
  proofInstructions?: string;
  isActive: boolean;
  totalCompletions: number;
  cooldownHours?: number;
  badge?: string;
}

export interface User {
  id: string;
  mobile: string;
  name: string;
  avatar: string;
  referralCode: string;
  referredBy?: string | null;
  pointsBalance: number;
  upiId?: string;
  status: 'active' | 'suspended';
  lastCheckInDate?: string;
  checkInStreak: number;
  createdAt: string;
  isFraudFlagged: boolean;
  fraudReason?: string;
  totalEarnedPoints: number;
  totalWithdrawnInr: number;
}

export interface TaskSubmission {
  id: string;
  userId: string;
  userMobile: string;
  userName: string;
  taskId: string;
  taskTitle: string;
  rewardPoints: number;
  proofText?: string;
  proofImage?: string;
  surveyAnswers?: Record<string, string>;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export type TransactionType =
  | 'task_reward'
  | 'daily_bonus'
  | 'spin_bonus'
  | 'referral_bonus'
  | 'withdrawal'
  | 'admin_adjustment';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amountPoints: number;
  amountInr: number;
  description: string;
  status: 'completed' | 'pending' | 'failed' | 'rejected';
  timestamp: string;
  referenceId?: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  userMobile: string;
  userName: string;
  amountInr: number;
  amountPoints: number;
  upiId: string;
  status: 'pending' | 'approved' | 'rejected';
  utrNumber?: string;
  rejectionReason?: string;
  requestedAt: string;
  processedAt?: string;
}

export interface AdminSettings {
  pointsPerInr: number; // e.g. 10 pts = 1 INR
  minWithdrawalInr: number; // e.g. 50 INR
  referralBonusPoints: number; // e.g. 50 pts
  dailyBonusBasePoints: number; // e.g. 10 pts
  adminPin: string;
  isSystemMaintenance: boolean;
  announcementText: string;
}

export interface DailyBonusStatus {
  canClaimToday: boolean;
  streak: number;
  todayRewardPoints: number;
  lastClaimDate?: string;
  weeklyPlan: Array<{ day: number; points: number; isClaimed: boolean; isToday: boolean }>;
  canSpinToday: boolean;
  spinCooldownMinutes: number;
}
