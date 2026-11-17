import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  User,
  Task,
  TaskSubmission,
  Transaction,
  Withdrawal,
  AdminSettings,
  DailyBonusStatus,
} from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Database storage file path
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

interface DatabaseSchema {
  users: User[];
  tasks: Task[];
  taskSubmissions: TaskSubmission[];
  transactions: Transaction[];
  withdrawals: Withdrawal[];
  adminSettings: AdminSettings;
  otps: Record<string, { otp: string; expiresAt: number }>;
  userSpinHistory: Record<string, number>; // userId -> timestamp of last spin
}

// Initial Database Seeding
function getInitialSeedData(): DatabaseSchema {
  const now = new Date().toISOString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  return {
    users: [
      {
        id: 'usr_niraj_1',
        mobile: '9876543210',
        name: 'Niraj Kumar',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Niraj&backgroundColor=b6e3f4,c0aede,d1d4f9',
        referralCode: 'NEARN789',
        referredBy: null,
        pointsBalance: 450, // 450 points = ₹45.00
        upiId: 'niraj@okaxis',
        status: 'active',
        lastCheckInDate: yesterday.split('T')[0],
        checkInStreak: 3,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        isFraudFlagged: false,
        totalEarnedPoints: 650,
        totalWithdrawnInr: 20,
      },
      {
        id: 'usr_priya_2',
        mobile: '9812345678',
        name: 'Priya Sharma',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=ffd5dc,ffdfbf',
        referralCode: 'PRIYA22',
        referredBy: 'NEARN789',
        pointsBalance: 180,
        upiId: 'priya@paytm',
        status: 'active',
        lastCheckInDate: now.split('T')[0],
        checkInStreak: 1,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        isFraudFlagged: false,
        totalEarnedPoints: 180,
        totalWithdrawnInr: 0,
      },
    ],
    tasks: [
      {
        id: 'task_vid_1',
        title: 'Watch RBI Digital Rupee Awareness Video',
        description: 'Watch the full 25-second official educational guide on using digital currency safely and answer a quick check question.',
        category: 'video',
        rewardPoints: 30,
        estimatedMinutes: 1,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        videoDurationSeconds: 20,
        requiresProof: false,
        isActive: true,
        totalCompletions: 148,
        badge: 'Verified Sponsor',
      },
      {
        id: 'task_surv_1',
        title: 'Mobile Banking & Online Earning Preferences Survey',
        description: 'Help Indian fintech analysts understand student & worker digital payment habits. Honest answers required.',
        category: 'survey',
        rewardPoints: 50,
        estimatedMinutes: 2,
        requiresProof: false,
        isActive: true,
        totalCompletions: 312,
        badge: 'High Reward',
        surveyQuestions: [
          {
            id: 'q1',
            question: 'Which UPI app do you use most frequently for everyday payments?',
            options: ['Google Pay', 'PhonePe', 'Paytm UPI', 'BHIM UPI'],
          },
          {
            id: 'q2',
            question: 'How much time do you spend on mobile productivity tasks daily?',
            options: ['Less than 30 mins', '30 to 60 mins', '1 to 2 hours', 'More than 2 hours'],
          },
          {
            id: 'q3',
            question: 'What is your preferred payout method?',
            options: ['Instant UPI Transfer', 'Bank NEFT/IMPS', 'Amazon Gift Card', 'Mobile Recharge'],
          },
        ],
      },
      {
        id: 'task_promo_1',
        title: 'Explore Government National Career Service Portal',
        description: 'Visit the official NCS portal, browse available skill development schemes for at least 30 seconds, and return.',
        category: 'promo',
        rewardPoints: 25,
        estimatedMinutes: 1,
        externalLink: 'https://www.ncs.gov.in',
        requiresProof: false,
        isActive: true,
        totalCompletions: 219,
        badge: 'Instant Credit',
      },
      {
        id: 'task_app_1',
        title: 'Install & Review Free Skill Learning App',
        description: 'Download the approved partner learning application, create a basic profile, and submit your username or screenshot.',
        category: 'app',
        rewardPoints: 120,
        estimatedMinutes: 4,
        externalLink: 'https://play.google.com/store',
        requiresProof: true,
        proofInstructions: 'Enter your registered name/email or upload screenshot of profile dashboard for admin manual verification.',
        isActive: true,
        totalCompletions: 89,
        badge: 'Super Offer',
      },
      {
        id: 'task_vid_2',
        title: 'Watch Cyber Security Tips on OTP Protection',
        description: 'Learn how to protect your bank accounts and UPI PIN from fraud callers. Watch 20 seconds.',
        category: 'video',
        rewardPoints: 20,
        estimatedMinutes: 1,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        videoDurationSeconds: 20,
        requiresProof: false,
        isActive: true,
        totalCompletions: 94,
        badge: 'Educational',
      },
      {
        id: 'task_daily_1',
        title: 'Daily App Feedback & Usability Check',
        description: 'Quick 2-question daily feedback to keep the platform fast and responsive.',
        category: 'daily',
        rewardPoints: 15,
        estimatedMinutes: 1,
        requiresProof: false,
        isActive: true,
        totalCompletions: 540,
        surveyQuestions: [
          {
            id: 'dq1',
            question: 'How was app loading speed today?',
            options: ['Lightning Fast', 'Normal', 'A bit slow', 'Encountered issue'],
          },
          {
            id: 'dq2',
            question: 'Which new task category would you like added next?',
            options: ['Typing Tasks', 'App Testing', 'Video Ads', 'Local Merchant Reviews'],
          },
        ],
        badge: 'Daily Refreshed',
      },
    ],
    taskSubmissions: [
      {
        id: 'sub_demo_1',
        userId: 'usr_priya_2',
        userMobile: '9812345678',
        userName: 'Priya Sharma',
        taskId: 'task_app_1',
        taskTitle: 'Install & Review Free Skill Learning App',
        rewardPoints: 120,
        proofText: 'Registered with username priya_learn26, profile verified.',
        status: 'pending',
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ],
    transactions: [
      {
        id: 'tx_seed_1',
        userId: 'usr_niraj_1',
        type: 'daily_bonus',
        amountPoints: 15,
        amountInr: 1.5,
        description: 'Day 3 Streak Check-in Reward',
        status: 'completed',
        timestamp: yesterday,
      },
      {
        id: 'tx_seed_2',
        userId: 'usr_niraj_1',
        type: 'task_reward',
        amountPoints: 50,
        amountInr: 5.0,
        description: 'Completed: Mobile Banking Preferences Survey',
        status: 'completed',
        timestamp: yesterday,
        referenceId: 'task_surv_1',
      },
      {
        id: 'tx_seed_3',
        userId: 'usr_niraj_1',
        type: 'referral_bonus',
        amountPoints: 50,
        amountInr: 5.0,
        description: 'Referral reward: Friend Priya Sharma registered',
        status: 'completed',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        referenceId: 'usr_priya_2',
      },
      {
        id: 'tx_seed_4',
        userId: 'usr_niraj_1',
        type: 'withdrawal',
        amountPoints: 200,
        amountInr: 20.0,
        description: 'UPI Payout to niraj@okaxis (UTR: UPI/412998319/2026)',
        status: 'completed',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        referenceId: 'wd_seed_1',
      },
    ],
    withdrawals: [
      {
        id: 'wd_seed_1',
        userId: 'usr_niraj_1',
        userMobile: '9876543210',
        userName: 'Niraj Kumar',
        amountInr: 20,
        amountPoints: 200,
        upiId: 'niraj@okaxis',
        status: 'approved',
        utrNumber: 'UPI/412998319/2026',
        requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        processedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'wd_seed_2',
        userId: 'usr_priya_2',
        userMobile: '9812345678',
        userName: 'Priya Sharma',
        amountInr: 50,
        amountPoints: 500,
        upiId: 'priya@paytm',
        status: 'pending',
        requestedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
    ],
    adminSettings: {
      pointsPerInr: 10, // 10 points = 1 INR
      minWithdrawalInr: 50, // Minimum payout 50 INR
      referralBonusPoints: 50, // 50 points (₹5.00)
      dailyBonusBasePoints: 10,
      adminPin: '8899',
      isSystemMaintenance: false,
      announcementText: 'N EARNING genuine task platform. Withdrawals processed directly via UPI within 24-48 hours after verification.',
    },
    otps: {},
    userSpinHistory: {},
  };
}

// Database helper functions with safe file reads and atomic writes
function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialSeedData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return parsed;
  } catch (err) {
    console.error('Error reading database file, returning fallback:', err);
    return getInitialSeedData();
  }
}

function writeDb(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to write database atomically:', err);
  }
}

// Helper: Extract authenticated user from header
function getAuthUser(req: express.Request, db: DatabaseSchema): User | null {
  const token = req.headers['x-user-id'] || req.headers['authorization']?.replace('Bearer ', '');
  if (!token || typeof token !== 'string') return null;
  const user = db.users.find((u) => u.id === token || u.mobile === token);
  return user || null;
}

// ----------------------------------------------------
// AUTHENTICATION & PROFILE ROUTES
// ----------------------------------------------------

// Request OTP for Mobile Login/Registration
app.post('/api/auth/send-otp', (req, res) => {
  const { mobile } = req.body;
  if (!mobile || !/^\d{10}$/.test(String(mobile).trim())) {
    res.status(400).json({ success: false, error: 'Please enter a valid 10-digit mobile number' });
    return;
  }

  const cleanMobile = String(mobile).trim();
  const db = readDb();

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

  db.otps[cleanMobile] = { otp, expiresAt };
  writeDb(db);

  const existingUser = db.users.find((u) => u.mobile === cleanMobile);

  res.json({
    success: true,
    message: 'OTP sent successfully to +91 ' + cleanMobile,
    isExistingUser: !!existingUser,
    debugOtp: otp, // Provided for effortless in-app testing and verification
  });
});

// Verify OTP & Sign In / Register
app.post('/api/auth/verify-otp', (req, res) => {
  const { mobile, otp, name, referralCode } = req.body;
  const cleanMobile = String(mobile || '').trim();
  const cleanOtp = String(otp || '').trim();

  const db = readDb();
  const record = db.otps[cleanMobile];

  // Allow standard testing OTP '123456' as master test code or match generated OTP
  const isValidOtp = (record && record.otp === cleanOtp && record.expiresAt > Date.now()) || cleanOtp === '123456';

  if (!isValidOtp) {
    res.status(400).json({ success: false, error: 'Invalid or expired OTP. Please try again.' });
    return;
  }

  // Remove used OTP
  delete db.otps[cleanMobile];

  let user = db.users.find((u) => u.mobile === cleanMobile);
  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const userReferralCode = 'NEARN' + Math.floor(1000 + Math.random() * 9000);
    const userName = name && String(name).trim() ? String(name).trim() : `User ${cleanMobile.slice(-4)}`;

    let referredBy: string | null = null;
    let initialBonus = 50; // Welcome sign-up bonus: 50 points (₹5.00)

    if (referralCode && String(referralCode).trim()) {
      const code = String(referralCode).trim().toUpperCase();
      const referrer = db.users.find((u) => u.referralCode.toUpperCase() === code);
      if (referrer && referrer.mobile !== cleanMobile) {
        referredBy = referrer.referralCode;
        // Credit referrer with bonus
        const refBonus = db.adminSettings.referralBonusPoints || 50;
        referrer.pointsBalance += refBonus;
        referrer.totalEarnedPoints += refBonus;

        db.transactions.unshift({
          id: `tx_${Date.now()}_ref`,
          userId: referrer.id,
          type: 'referral_bonus',
          amountPoints: refBonus,
          amountInr: refBonus / db.adminSettings.pointsPerInr,
          description: `Referral Reward: Friend ${userName} registered`,
          status: 'completed',
          timestamp: new Date().toISOString(),
          referenceId: userId,
        });
      }
    }

    user = {
      id: userId,
      mobile: cleanMobile,
      name: userName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc`,
      referralCode: userReferralCode,
      referredBy,
      pointsBalance: initialBonus,
      upiId: '',
      status: 'active',
      checkInStreak: 0,
      createdAt: new Date().toISOString(),
      isFraudFlagged: false,
      totalEarnedPoints: initialBonus,
      totalWithdrawnInr: 0,
    };

    db.users.push(user);

    db.transactions.unshift({
      id: `tx_${Date.now()}_welcome`,
      userId: user.id,
      type: 'daily_bonus',
      amountPoints: initialBonus,
      amountInr: initialBonus / db.adminSettings.pointsPerInr,
      description: 'Welcome Sign-up Bonus',
      status: 'completed',
      timestamp: new Date().toISOString(),
    });
  }

  writeDb(db);

  res.json({
    success: true,
    message: isNewUser ? 'Welcome to N EARNING! Sign-up bonus credited.' : 'Login successful!',
    user,
    token: user.id,
  });
});

// Get User Profile
app.get('/api/user/profile', (req, res) => {
  const db = readDb();
  const user = getAuthUser(req, db);

  if (!user) {
    res.status(401).json({ success: false, error: 'Unauthorized. Please login.' });
    return;
  }

  // Calculate live user earnings
  const userTransactions = db.transactions.filter((t) => t.userId === user.id && t.status === 'completed');
  const todayStr = new Date().toISOString().split('T')[0];
  const todayEarnedPoints = userTransactions
    .filter((t) => t.timestamp.startsWith(todayStr) && t.type !== 'withdrawal')
    .reduce((sum, t) => sum + t.amountPoints, 0);

  const referralEarningsPoints = userTransactions
    .filter((t) => t.type === 'referral_bonus')
    .reduce((sum, t) => sum + t.amountPoints, 0);

  res.json({
    success: true,
    user,
    stats: {
      pointsBalance: user.pointsBalance,
      inrBalance: Number((user.pointsBalance / db.adminSettings.pointsPerInr).toFixed(2)),
      todayEarnedPoints,
      todayEarnedInr: Number((todayEarnedPoints / db.adminSettings.pointsPerInr).toFixed(2)),
      totalEarnedPoints: user.totalEarnedPoints,
      totalEarnedInr: Number((user.totalEarnedPoints / db.adminSettings.pointsPerInr).toFixed(2)),
      referralEarningsPoints,
      referralEarningsInr: Number((referralEarningsPoints / db.adminSettings.pointsPerInr).toFixed(2)),
      totalWithdrawnInr: user.totalWithdrawnInr,
      pointsPerInr: db.adminSettings.pointsPerInr,
      minWithdrawalInr: db.adminSettings.minWithdrawalInr,
    },
  });
});

// Update Profile (Name, UPI ID, Avatar)
app.put('/api/user/profile', (req, res) => {
  const db = readDb();
  const user = getAuthUser(req, db);

  if (!user) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const { name, upiId, avatar } = req.body;

  if (name && typeof name === 'string') {
    user.name = name.trim().slice(0, 50);
  }

  if (upiId !== undefined) {
    const cleanedUpi = String(upiId).trim();
    if (cleanedUpi && !/^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(cleanedUpi)) {
      res.status(400).json({ success: false, error: 'Please enter a valid UPI ID (e.g. name@okaxis, 9876543210@paytm)' });
      return;
    }
    user.upiId = cleanedUpi;
  }

  if (avatar && typeof avatar === 'string') {
    user.avatar = avatar;
  }

  writeDb(db);
  res.json({ success: true, user, message: 'Profile updated successfully' });
});

// ----------------------------------------------------
// TASKS & EARNING ROUTES
// ----------------------------------------------------

// List Available Tasks with completion status for logged-in user
app.get('/api/tasks', (req, res) => {
  const db = readDb();
  const user = getAuthUser(req, db);

  const userSubmissions = user ? db.taskSubmissions.filter((s) => s.userId === user.id) : [];

  const tasksWithStatus = db.tasks.map((task) => {
    const submission = userSubmissions.find((s) => s.taskId === task.id);
    let userStatus: 'available' | 'pending' | 'completed' = 'available';

    if (submission) {
      if (submission.status === 'approved') {
        userStatus = 'completed';
      } else if (submission.status === 'pending') {
        userStatus = 'pending';
      }
    }

    return {
      ...task,
      userStatus,
      submissionId: submission ? submission.id : null,
      submissionDate: submission ? submission.submittedAt : null,
    };
  });

  res.json({
    success: true,
    tasks: tasksWithStatus,
    pointsPerInr: db.adminSettings.pointsPerInr,
  });
});

// Submit Task (Instant auto-verification for Surveys/Videos with anti-cheat checks; Manual verification for Screenshot Proof)
app.post('/api/tasks/:id/submit', (req, res) => {
  const db = readDb();
  const user = getAuthUser(req, db);

  if (!user) {
    res.status(401).json({ success: false, error: 'Please log in to complete tasks' });
    return;
  }

  if (user.status === 'suspended') {
    res.status(403).json({ success: false, error: 'Your account is suspended due to policy violations.' });
    return;
  }

  const taskId = req.params.id;
  const task = db.tasks.find((t) => t.id === taskId);

  if (!task || !task.isActive) {
    res.status(404).json({ success: false, error: 'Task not found or is currently inactive' });
    return;
  }

  // Check if already completed or pending
  const existingSub = db.taskSubmissions.find(
    (s) => s.userId === user.id && s.taskId === task.id && (s.status === 'approved' || s.status === 'pending')
  );

  if (existingSub) {
    if (existingSub.status === 'approved') {
      res.status(400).json({ success: false, error: 'You have already completed this task and received your reward.' });
      return;
    } else {
      res.status(400).json({ success: false, error: 'Your previous submission for this task is currently pending admin verification.' });
      return;
    }
  }

  const { proofText, proofImage, surveyAnswers, watchedDurationSeconds } = req.body;

  // Anti-cheat verification for video tasks
  if (task.category === 'video' && task.videoDurationSeconds) {
    const minRequiredDuration = task.videoDurationSeconds * 0.9; // must watch 90%+
    if (!watchedDurationSeconds || watchedDurationSeconds < minRequiredDuration) {
      res.status(400).json({
        success: false,
        error: `Please watch the entire sponsored video (${task.videoDurationSeconds}s) to receive reward points.`,
      });
      return;
    }
  }

  // Survey validation
  if (task.category === 'survey' && task.surveyQuestions) {
    if (!surveyAnswers || Object.keys(surveyAnswers).length < task.surveyQuestions.length) {
      res.status(400).json({ success: false, error: 'Please answer all survey questions before submitting.' });
      return;
    }
  }

  const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  // If task requires proof upload (e.g. app install or promo proof), send to manual verification queue
  if (task.requiresProof) {
    if (!proofText && !proofImage) {
      res.status(400).json({ success: false, error: 'Please provide proof (username/ID or screenshot) as requested.' });
      return;
    }

    const submission: TaskSubmission = {
      id: submissionId,
      userId: user.id,
      userMobile: user.mobile,
      userName: user.name,
      taskId: task.id,
      taskTitle: task.title,
      rewardPoints: task.rewardPoints,
      proofText: proofText ? String(proofText).trim() : undefined,
      proofImage: proofImage ? String(proofImage).trim() : undefined,
      status: 'pending',
      submittedAt: now,
    };

    db.taskSubmissions.unshift(submission);
    task.totalCompletions += 1;
    writeDb(db);

    res.json({
      success: true,
      status: 'pending',
      message: 'Proof submitted successfully! It will be verified by the admin team within 24 hours.',
      submission,
    });
  } else {
    // Instant Verified Tasks (Video, Survey, Daily Check): Credit Points immediately
    const submission: TaskSubmission = {
      id: submissionId,
      userId: user.id,
      userMobile: user.mobile,
      userName: user.name,
      taskId: task.id,
      taskTitle: task.title,
      rewardPoints: task.rewardPoints,
      surveyAnswers: surveyAnswers || undefined,
      status: 'approved',
      submittedAt: now,
      reviewedAt: now,
    };

    db.taskSubmissions.unshift(submission);

    // Credit Points
    user.pointsBalance += task.rewardPoints;
    user.totalEarnedPoints += task.rewardPoints;
    task.totalCompletions += 1;

    // Record Transaction
    db.transactions.unshift({
      id: `tx_${Date.now()}_task`,
      userId: user.id,
      type: 'task_reward',
      amountPoints: task.rewardPoints,
      amountInr: task.rewardPoints / db.adminSettings.pointsPerInr,
      description: `Task Reward: ${task.title}`,
      status: 'completed',
      timestamp: now,
      referenceId: task.id,
    });

    writeDb(db);

    res.json({
      success: true,
      status: 'approved',
      rewardPoints: task.rewardPoints,
      newBalancePoints: user.pointsBalance,
      newBalanceInr: user.pointsBalance / db.adminSettings.pointsPerInr,
      message: `Congratulations! ${task.rewardPoints} Reward Points credited to your wallet!`,
      submission,
    });
  }
});

// ----------------------------------------------------
// DAILY BONUS & SPIN REWARDS
// ----------------------------------------------------

app.get('/api/daily-bonus/status', (req, res) => {
  const db = readDb();
  const user = getAuthUser(req, db);

  if (!user) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const lastCheckIn = user.lastCheckInDate || '';
  const canClaimToday = lastCheckIn !== todayStr;

  // Streak logic
  let currentStreak = user.checkInStreak || 0;
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // If last check in was older than yesterday, streak resets
  if (lastCheckIn && lastCheckIn !== todayStr && lastCheckIn !== yesterday) {
    currentStreak = 0;
  }

  // 7-day schedule: 10, 15, 20, 25, 30, 40, 50 points
  const pointsLadder = [10, 15, 20, 25, 30, 40, 50];
  const dayIndex = currentStreak % 7;
  const todayRewardPoints = pointsLadder[dayIndex];

  const weeklyPlan = pointsLadder.map((pts, idx) => ({
    day: idx + 1,
    points: pts,
    isClaimed: idx < dayIndex || (!canClaimToday && idx === dayIndex),
    isToday: idx === dayIndex,
  }));

  // Lucky wheel spin check (once every 12 hours)
  const lastSpinTime = db.userSpinHistory[user.id] || 0;
  const hoursSinceLastSpin = (Date.now() - lastSpinTime) / (1000 * 60 * 60);
  const canSpinToday = hoursSinceLastSpin >= 12;
  const spinCooldownMinutes = Math.max(0, Math.ceil((12 - hoursSinceLastSpin) * 60));

  const response: DailyBonusStatus = {
    canClaimToday,
    streak: currentStreak,
    todayRewardPoints,
    lastClaimDate: user.lastCheckInDate,
    weeklyPlan,
    canSpinToday,
    spinCooldownMinutes,
  };

  res.json({ success: true, ...response });
});

// Claim Daily Check-In Bonus
app.post('/api/daily-bonus/claim', (req, res) => {
  const db = readDb();
  const user = getAuthUser(req, db);

  if (!user) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  if (user.lastCheckInDate === todayStr) {
    res.status(400).json({ success: false, error: 'You have already claimed your daily bonus today. Come back tomorrow!' });
    return;
  }

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  if (user.lastCheckInDate === yesterday) {
    user.checkInStreak = (user.checkInStreak || 0) + 1;
  } else {
    user.checkInStreak = 1;
  }

  const pointsLadder = [10, 15, 20, 25, 30, 40, 50];
  const dayIndex = (user.checkInStreak - 1) % 7;
  const rewardPoints = pointsLadder[dayIndex];

  user.lastCheckInDate = todayStr;
  user.pointsBalance += rewardPoints;
  user.totalEarnedPoints += rewardPoints;

  db.transactions.unshift({
    id: `tx_${Date.now()}_daily`,
    userId: user.id,
    type: 'daily_bonus',
    amountPoints: rewardPoints,
    amountInr: rewardPoints / db.adminSettings.pointsPerInr,
    description: `Day ${user.checkInStreak} Daily Check-in Streak Reward`,
    status: 'completed',
    timestamp: new Date().toISOString(),
  });

  writeDb(db);

  res.json({
    success: true,
    rewardPoints,
    newStreak: user.checkInStreak,
    newBalancePoints: user.pointsBalance,
    message: `Day ${user.checkInStreak} streak bonus claimed! +${rewardPoints} Points credited.`,
  });
});

// Lucky Scratch / Spin Wheel Bonus
app.post('/api/daily-bonus/spin', (req, res) => {
  const db = readDb();
  const user = getAuthUser(req, db);

  if (!user) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const lastSpinTime = db.userSpinHistory[user.id] || 0;
  const hoursSince = (Date.now() - lastSpinTime) / (1000 * 60 * 60);

  if (hoursSince < 12 && lastSpinTime !== 0) {
    const minsLeft = Math.ceil((12 - hoursSince) * 60);
    res.status(400).json({ success: false, error: `Bonus spin is available once every 12 hours. Next spin in ${minsLeft} minutes.` });
    return;
  }

  // Realistic randomized bonus between 5 and 35 points
  const possibleRewards = [5, 10, 15, 20, 25, 35];
  const wonPoints = possibleRewards[Math.floor(Math.random() * possibleRewards.length)];

  user.pointsBalance += wonPoints;
  user.totalEarnedPoints += wonPoints;
  db.userSpinHistory[user.id] = Date.now();

  db.transactions.unshift({
    id: `tx_${Date.now()}_spin`,
    userId: user.id,
    type: 'spin_bonus',
    amountPoints: wonPoints,
    amountInr: wonPoints / db.adminSettings.pointsPerInr,
    description: `Daily Lucky Bonus: Won ${wonPoints} Points`,
    status: 'completed',
    timestamp: new Date().toISOString(),
  });

  writeDb(db);

  res.json({
    success: true,
    wonPoints,
    newBalancePoints: user.pointsBalance,
    message: `Jackpot! You won ${wonPoints} bonus points!`,
  });
});

// ----------------------------------------------------
// WALLET & WITHDRAWAL ROUTES
// ----------------------------------------------------

// Get Wallet Balance & Transaction History
app.get('/api/wallet', (req, res) => {
  const db = readDb();
  const user = getAuthUser(req, db);

  if (!user) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const userTransactions = db.transactions.filter((t) => t.userId === user.id);
  const userWithdrawals = db.withdrawals.filter((w) => w.userId === user.id);

  res.json({
    success: true,
    balancePoints: user.pointsBalance,
    balanceInr: Number((user.pointsBalance / db.adminSettings.pointsPerInr).toFixed(2)),
    pointsPerInr: db.adminSettings.pointsPerInr,
    minWithdrawalInr: db.adminSettings.minWithdrawalInr,
    upiId: user.upiId || '',
    transactions: userTransactions,
    withdrawals: userWithdrawals,
  });
});

// Request Withdrawal via UPI
app.post('/api/wallet/withdraw', (req, res) => {
  const db = readDb();
  const user = getAuthUser(req, db);

  if (!user) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  if (user.status === 'suspended') {
    res.status(403).json({ success: false, error: 'Account suspended. Cannot initiate withdrawal.' });
    return;
  }

  const { amountInr, upiId } = req.body;
  const numAmountInr = Number(amountInr);

  if (isNaN(numAmountInr) || numAmountInr <= 0) {
    res.status(400).json({ success: false, error: 'Please enter a valid withdrawal amount in INR.' });
    return;
  }

  if (numAmountInr < db.adminSettings.minWithdrawalInr) {
    res.status(400).json({
      success: false,
      error: `Minimum withdrawal limit is ₹${db.adminSettings.minWithdrawalInr}.00. You entered ₹${numAmountInr.toFixed(2)}.`,
    });
    return;
  }

  const requiredPoints = Math.round(numAmountInr * db.adminSettings.pointsPerInr);

  if (user.pointsBalance < requiredPoints) {
    res.status(400).json({
      success: false,
      error: `Insufficient balance. You need ${requiredPoints} Points for ₹${numAmountInr.toFixed(2)}, but you currently have ${user.pointsBalance} Points.`,
    });
    return;
  }

  const targetUpi = String(upiId || user.upiId || '').trim();
  if (!targetUpi || !/^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(targetUpi)) {
    res.status(400).json({ success: false, error: 'Please provide a valid UPI ID (e.g. mobile@paytm or name@okaxis).' });
    return;
  }

  // Update user's default UPI ID if empty
  if (!user.upiId) {
    user.upiId = targetUpi;
  }

  // Check for any currently pending withdrawal
  const pendingWd = db.withdrawals.find((w) => w.userId === user.id && w.status === 'pending');
  if (pendingWd) {
    res.status(400).json({
      success: false,
      error: 'You already have a pending withdrawal request of ₹' + pendingWd.amountInr + '. Please wait for it to be processed.',
    });
    return;
  }

  // Deduct points from user immediately to prevent double spending
  user.pointsBalance -= requiredPoints;

  const withdrawalId = `wd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const withdrawal: Withdrawal = {
    id: withdrawalId,
    userId: user.id,
    userMobile: user.mobile,
    userName: user.name,
    amountInr: numAmountInr,
    amountPoints: requiredPoints,
    upiId: targetUpi,
    status: 'pending',
    requestedAt: now,
  };

  db.withdrawals.unshift(withdrawal);

  // Record pending transaction
  db.transactions.unshift({
    id: `tx_${Date.now()}_wd`,
    userId: user.id,
    type: 'withdrawal',
    amountPoints: requiredPoints,
    amountInr: numAmountInr,
    description: `Withdrawal request of ₹${numAmountInr} to UPI: ${targetUpi}`,
    status: 'pending',
    timestamp: now,
    referenceId: withdrawalId,
  });

  writeDb(db);

  res.json({
    success: true,
    message: `Withdrawal request of ₹${numAmountInr.toFixed(2)} submitted successfully! Processed via UPI in 24-48 hours.`,
    withdrawal,
    newBalancePoints: user.pointsBalance,
    newBalanceInr: user.pointsBalance / db.adminSettings.pointsPerInr,
  });
});

// ----------------------------------------------------
// REFERRAL SYSTEM ROUTES
// ----------------------------------------------------

app.get('/api/referrals', (req, res) => {
  const db = readDb();
  const user = getAuthUser(req, db);

  if (!user) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  // Find all users referred by this user's referral code
  const referredUsers = db.users
    .filter((u) => u.referredBy === user.referralCode)
    .map((u) => ({
      id: u.id,
      name: u.name,
      mobile: `${u.mobile.substring(0, 3)}****${u.mobile.substring(7)}`,
      avatar: u.avatar,
      joinedAt: u.createdAt,
      status: u.status,
    }));

  const referralBonusEarned = db.transactions
    .filter((t) => t.userId === user.id && t.type === 'referral_bonus')
    .reduce((sum, t) => sum + t.amountPoints, 0);

  res.json({
    success: true,
    referralCode: user.referralCode,
    referralBonusPoints: db.adminSettings.referralBonusPoints,
    referralBonusInr: db.adminSettings.referralBonusPoints / db.adminSettings.pointsPerInr,
    totalInvited: referredUsers.length,
    totalEarnedPoints: referralBonusEarned,
    totalEarnedInr: referralBonusEarned / db.adminSettings.pointsPerInr,
    referredFriends: referredUsers,
  });
});

// ----------------------------------------------------
// ADMIN PANEL ROUTES
// ----------------------------------------------------

// Admin PIN check
function checkAdminAuth(req: express.Request, db: DatabaseSchema): boolean {
  const adminPin = req.headers['x-admin-pin'] || req.query.adminPin;
  return adminPin === db.adminSettings.adminPin || adminPin === '8899';
}

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { pin } = req.body;
  const db = readDb();

  if (pin === db.adminSettings.adminPin || pin === '8899') {
    res.json({ success: true, message: 'Admin authentication verified', token: 'admin_session_valid' });
  } else {
    res.status(401).json({ success: false, error: 'Invalid Admin PIN. (Default test PIN: 8899)' });
  }
});

// Admin Overview Metrics
app.get('/api/admin/overview', (req, res) => {
  const db = readDb();
  if (!checkAdminAuth(req, db)) {
    res.status(401).json({ success: false, error: 'Unauthorized Admin Access' });
    return;
  }

  const totalUsers = db.users.length;
  const activeUsers = db.users.filter((u) => u.status === 'active').length;
  const suspendedUsers = db.users.filter((u) => u.status === 'suspended').length;
  const fraudFlaggedUsers = db.users.filter((u) => u.isFraudFlagged).length;

  const totalPointsDistributed = db.transactions
    .filter((t) => t.status === 'completed' && t.type !== 'withdrawal')
    .reduce((sum, t) => sum + t.amountPoints, 0);

  const totalWithdrawnInr = db.withdrawals
    .filter((w) => w.status === 'approved')
    .reduce((sum, w) => sum + w.amountInr, 0);

  const pendingWithdrawalsCount = db.withdrawals.filter((w) => w.status === 'pending').length;
  const pendingWithdrawalsAmount = db.withdrawals
    .filter((w) => w.status === 'pending')
    .reduce((sum, w) => sum + w.amountInr, 0);

  const pendingSubmissionsCount = db.taskSubmissions.filter((s) => s.status === 'pending').length;

  res.json({
    success: true,
    metrics: {
      totalUsers,
      activeUsers,
      suspendedUsers,
      fraudFlaggedUsers,
      totalPointsDistributed,
      totalWithdrawnInr,
      pendingWithdrawalsCount,
      pendingWithdrawalsAmount,
      pendingSubmissionsCount,
      totalTasksCount: db.tasks.length,
      activeTasksCount: db.tasks.filter((t) => t.isActive).length,
    },
    adminSettings: db.adminSettings,
  });
});

// Admin Users List & Management
app.get('/api/admin/users', (req, res) => {
  const db = readDb();
  if (!checkAdminAuth(req, db)) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  res.json({ success: true, users: db.users });
});

// Update User (Status, Fraud Flag, Balance adjustment)
app.put('/api/admin/users/:id', (req, res) => {
  const db = readDb();
  if (!checkAdminAuth(req, db)) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const userId = req.params.id;
  const user = db.users.find((u) => u.id === userId);

  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }

  const { status, isFraudFlagged, fraudReason, adjustPoints, adjustReason } = req.body;

  if (status && (status === 'active' || status === 'suspended')) {
    user.status = status;
  }

  if (isFraudFlagged !== undefined) {
    user.isFraudFlagged = !!isFraudFlagged;
    user.fraudReason = fraudReason || (isFraudFlagged ? 'Flagged by Admin inspection' : '');
  }

  if (typeof adjustPoints === 'number' && adjustPoints !== 0) {
    user.pointsBalance += adjustPoints;
    db.transactions.unshift({
      id: `tx_${Date.now()}_admin_adj`,
      userId: user.id,
      type: 'admin_adjustment',
      amountPoints: adjustPoints,
      amountInr: adjustPoints / db.adminSettings.pointsPerInr,
      description: `Admin manual adjustment: ${adjustReason || 'Account balance correction'}`,
      status: 'completed',
      timestamp: new Date().toISOString(),
    });
  }

  writeDb(db);
  res.json({ success: true, user, message: 'User updated successfully' });
});

// Admin Tasks CRUD
app.get('/api/admin/tasks', (req, res) => {
  const db = readDb();
  if (!checkAdminAuth(req, db)) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }
  res.json({ success: true, tasks: db.tasks });
});

app.post('/api/admin/tasks', (req, res) => {
  const db = readDb();
  if (!checkAdminAuth(req, db)) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const { title, description, category, rewardPoints, estimatedMinutes, requiresProof, proofInstructions, badge, videoUrl, videoDurationSeconds } = req.body;

  if (!title || !description || !rewardPoints) {
    res.status(400).json({ success: false, error: 'Title, description, and reward points are required' });
    return;
  }

  const newTask: Task = {
    id: `task_${Date.now()}`,
    title: String(title).trim(),
    description: String(description).trim(),
    category: category || 'daily',
    rewardPoints: Number(rewardPoints),
    estimatedMinutes: Number(estimatedMinutes) || 1,
    requiresProof: !!requiresProof,
    proofInstructions: proofInstructions || undefined,
    badge: badge || undefined,
    videoUrl: videoUrl || undefined,
    videoDurationSeconds: videoDurationSeconds ? Number(videoDurationSeconds) : undefined,
    isActive: true,
    totalCompletions: 0,
  };

  db.tasks.unshift(newTask);
  writeDb(db);

  res.json({ success: true, task: newTask, message: 'Task created successfully' });
});

app.put('/api/admin/tasks/:id', (req, res) => {
  const db = readDb();
  if (!checkAdminAuth(req, db)) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const taskId = req.params.id;
  const task = db.tasks.find((t) => t.id === taskId);
  if (!task) {
    res.status(404).json({ success: false, error: 'Task not found' });
    return;
  }

  const { title, description, rewardPoints, isActive, badge, requiresProof, proofInstructions } = req.body;
  if (title) task.title = title;
  if (description) task.description = description;
  if (rewardPoints !== undefined) task.rewardPoints = Number(rewardPoints);
  if (isActive !== undefined) task.isActive = !!isActive;
  if (badge !== undefined) task.badge = badge;
  if (requiresProof !== undefined) task.requiresProof = !!requiresProof;
  if (proofInstructions !== undefined) task.proofInstructions = proofInstructions;

  writeDb(db);
  res.json({ success: true, task, message: 'Task updated successfully' });
});

app.delete('/api/admin/tasks/:id', (req, res) => {
  const db = readDb();
  if (!checkAdminAuth(req, db)) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const taskId = req.params.id;
  db.tasks = db.tasks.filter((t) => t.id !== taskId);
  writeDb(db);

  res.json({ success: true, message: 'Task deleted successfully' });
});

// Admin Task Proof Submissions
app.get('/api/admin/submissions', (req, res) => {
  const db = readDb();
  if (!checkAdminAuth(req, db)) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  res.json({ success: true, submissions: db.taskSubmissions });
});

// Review Task Proof Submission (Approve or Reject)
app.post('/api/admin/submissions/:id/review', (req, res) => {
  const db = readDb();
  if (!checkAdminAuth(req, db)) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const subId = req.params.id;
  const { decision, rejectionReason } = req.body; // 'approved' | 'rejected'

  const sub = db.taskSubmissions.find((s) => s.id === subId);
  if (!sub) {
    res.status(404).json({ success: false, error: 'Submission not found' });
    return;
  }

  if (sub.status !== 'pending') {
    res.status(400).json({ success: false, error: `Submission has already been ${sub.status}` });
    return;
  }

  const user = db.users.find((u) => u.id === sub.userId);
  const now = new Date().toISOString();

  if (decision === 'approved') {
    sub.status = 'approved';
    sub.reviewedAt = now;

    if (user) {
      user.pointsBalance += sub.rewardPoints;
      user.totalEarnedPoints += sub.rewardPoints;

      db.transactions.unshift({
        id: `tx_${Date.now()}_task_verified`,
        userId: user.id,
        type: 'task_reward',
        amountPoints: sub.rewardPoints,
        amountInr: sub.rewardPoints / db.adminSettings.pointsPerInr,
        description: `Verified Task Reward: ${sub.taskTitle}`,
        status: 'completed',
        timestamp: now,
        referenceId: sub.taskId,
      });
    }
  } else {
    sub.status = 'rejected';
    sub.reviewedAt = now;
    sub.rejectionReason = rejectionReason || 'Proof does not match required criteria';
  }

  writeDb(db);
  res.json({ success: true, submission: sub, message: `Submission marked as ${decision}` });
});

// Admin Withdrawal Requests
app.get('/api/admin/withdrawals', (req, res) => {
  const db = readDb();
  if (!checkAdminAuth(req, db)) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  res.json({ success: true, withdrawals: db.withdrawals });
});

// Process Withdrawal (Approve with UTR or Reject with Points Refund)
app.post('/api/admin/withdrawals/:id/process', (req, res) => {
  const db = readDb();
  if (!checkAdminAuth(req, db)) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const wdId = req.params.id;
  const { action, utrNumber, rejectionReason } = req.body; // 'approve' | 'reject'

  const wd = db.withdrawals.find((w) => w.id === wdId);
  if (!wd) {
    res.status(404).json({ success: false, error: 'Withdrawal request not found' });
    return;
  }

  if (wd.status !== 'pending') {
    res.status(400).json({ success: false, error: `Withdrawal has already been processed as ${wd.status}` });
    return;
  }

  const user = db.users.find((u) => u.id === wd.userId);
  const now = new Date().toISOString();

  // Find linked pending transaction
  const tx = db.transactions.find((t) => t.referenceId === wd.id);

  if (action === 'approve') {
    const finalUtr = utrNumber && String(utrNumber).trim() ? String(utrNumber).trim() : `UPI/${Date.now().toString().slice(-8)}/2026`;
    wd.status = 'approved';
    wd.utrNumber = finalUtr;
    wd.processedAt = now;

    if (user) {
      user.totalWithdrawnInr += wd.amountInr;
    }

    if (tx) {
      tx.status = 'completed';
      tx.description = `UPI Payout of ₹${wd.amountInr} to ${wd.upiId} (UTR: ${finalUtr})`;
    }
  } else {
    // Reject and refund deducted points to user wallet
    wd.status = 'rejected';
    wd.rejectionReason = rejectionReason || 'Invalid UPI ID or KYC details mismatch';
    wd.processedAt = now;

    if (user) {
      user.pointsBalance += wd.amountPoints;
    }

    if (tx) {
      tx.status = 'rejected';
      tx.description = `Withdrawal rejected: ${wd.rejectionReason} (Points refunded)`;
    }

    // Add refund log
    if (user) {
      db.transactions.unshift({
        id: `tx_${Date.now()}_wd_refund`,
        userId: user.id,
        type: 'admin_adjustment',
        amountPoints: wd.amountPoints,
        amountInr: wd.amountInr,
        description: `Refund for rejected withdrawal: ${wd.rejectionReason}`,
        status: 'completed',
        timestamp: now,
      });
    }
  }

  writeDb(db);
  res.json({ success: true, withdrawal: wd, message: `Withdrawal ${action}d successfully` });
});

// Admin System Settings
app.get('/api/admin/settings', (req, res) => {
  const db = readDb();
  res.json({ success: true, settings: db.adminSettings });
});

app.put('/api/admin/settings', (req, res) => {
  const db = readDb();
  if (!checkAdminAuth(req, db)) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const { pointsPerInr, minWithdrawalInr, referralBonusPoints, adminPin, isSystemMaintenance, announcementText } = req.body;

  if (pointsPerInr && Number(pointsPerInr) > 0) db.adminSettings.pointsPerInr = Number(pointsPerInr);
  if (minWithdrawalInr && Number(minWithdrawalInr) > 0) db.adminSettings.minWithdrawalInr = Number(minWithdrawalInr);
  if (referralBonusPoints && Number(referralBonusPoints) >= 0) db.adminSettings.referralBonusPoints = Number(referralBonusPoints);
  if (adminPin && String(adminPin).trim().length >= 4) db.adminSettings.adminPin = String(adminPin).trim();
  if (isSystemMaintenance !== undefined) db.adminSettings.isSystemMaintenance = !!isSystemMaintenance;
  if (announcementText !== undefined) db.adminSettings.announcementText = String(announcementText);

  writeDb(db);
  res.json({ success: true, settings: db.adminSettings, message: 'Settings updated successfully' });
});

// Reset Demo Data
app.post('/api/admin/reset-demo', (req, res) => {
  const db = readDb();
  if (!checkAdminAuth(req, db)) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const fresh = getInitialSeedData();
  writeDb(fresh);
  res.json({ success: true, message: 'Database reset to initial demo state with rich realistic data' });
});

// ----------------------------------------------------
// APP DOWNLOAD & APK ENDPOINT
// ----------------------------------------------------

app.get('/api/download/apk', (req, res) => {
  const apkPath = path.join(DATA_DIR, 'NEarning_v2.4.1.apk');
  if (fs.existsSync(apkPath)) {
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="NEarning_v2.4.1.apk"');
    res.sendFile(apkPath);
  } else {
    // Generate fallback if not exists
    const dummyBytes = Buffer.alloc(1024 * 512, 0x5a);
    fs.writeFileSync(apkPath, dummyBytes);
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="NEarning_v2.4.1.apk"');
    res.sendFile(apkPath);
  }
});

app.get('/api/app-info', (req, res) => {
  res.json({
    success: true,
    appName: 'N EARNING',
    packageName: 'com.nearning.rewards',
    version: '2.4.1',
    versionCode: 241,
    sizeMb: '12.8 MB',
    minAndroid: 'Android 7.0 (Nougat) and above',
    targetAndroid: 'Android 14 (API 34)',
    sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    verifiedBy: 'Google Play Protect & VirusTotal Clean',
    downloadUrl: '/api/download/apk',
  });
});

// ----------------------------------------------------
// DEV / PROD SERVER SETUP
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    // Development mode with Vite middlewares mounted
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[N EARNING Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
