import React, { useState, useEffect, useCallback } from 'react';
import { AndroidFrame } from './components/AndroidFrame';
import { TopBar } from './components/TopBar';
import { BottomNav, NavTab } from './components/BottomNav';
import { HomeTab } from './components/HomeTab';
import { TasksTab } from './components/TasksTab';
import { DailyBonusTab } from './components/DailyBonusTab';
import { WalletTab } from './components/WalletTab';
import { ReferralTab } from './components/ReferralTab';
import { ProfileTab } from './components/ProfileTab';
import { AuthModal } from './components/AuthModal';
import { TaskExecutionModal } from './components/TaskExecutionModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { DownloadAppModal } from './components/DownloadAppModal';
import { api, authStorage } from './api';
import { User, Task } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    pointsBalance: 450,
    inrBalance: 45.0,
    todayEarnedPoints: 65,
    todayEarnedInr: 6.5,
    totalEarnedPoints: 650,
    totalEarnedInr: 65.0,
    referralEarningsPoints: 50,
    referralEarningsInr: 5.0,
    totalWithdrawnInr: 20,
    pointsPerInr: 10,
    minWithdrawalInr: 50,
  });

  const [tasks, setTasks] = useState<
    Array<
      Task & {
        userStatus: 'available' | 'pending' | 'completed';
        submissionId: string | null;
        submissionDate: string | null;
      }
    >
  >([]);

  const [canClaimBonus, setCanClaimBonus] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals State
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);

  // Initialize or fetch user session
  const refreshUserData = useCallback(async () => {
    try {
      const token = authStorage.getToken();
      if (!token) {
        // Auto sign-in demo user for immediate instant usability
        authStorage.setToken('usr_niraj_1');
      }

      const [profileRes, tasksRes, bonusRes] = await Promise.all([
        api.getProfile(),
        api.getTasks(),
        api.getDailyBonusStatus(),
      ]);

      if (profileRes.success) {
        setUser(profileRes.user);
        setStats(profileRes.stats);
      }

      if (tasksRes.success) {
        setTasks(tasksRes.tasks);
      }

      if (bonusRes.success) {
        setCanClaimBonus(bonusRes.canClaimToday);
      }
    } catch (err) {
      console.error('Failed to load user session', err);
      // If unauthorized, prompt auth
      if (!authStorage.getToken()) {
        setIsAuthOpen(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  const handleStartTask = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskCompleted = (rewardPoints: number, isPending: boolean) => {
    refreshUserData();
  };

  const handleBonusClaimed = (points: number) => {
    refreshUserData();
  };

  const handleLogout = () => {
    authStorage.clearToken();
    setUser(null);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = (newUser: User) => {
    setUser(newUser);
    setIsAuthOpen(false);
    refreshUserData();
  };

  const handleSwitchUser = () => {
    setIsAuthOpen(true);
  };

  const availableTasksCount = tasks.filter((t) => t.userStatus === 'available').length;

  return (
    <AndroidFrame
      onOpenAdmin={() => setIsAdminOpen(true)}
      onSwitchUser={handleSwitchUser}
      onOpenDownload={() => setIsDownloadOpen(true)}
      onNavigateHome={() => setCurrentTab('home')}
      currentUserName={user?.name}
      isLoggedIn={!!user}
    >
      {/* Top Header */}
      <TopBar
        user={user}
        pointsBalance={stats.pointsBalance}
        inrBalance={stats.inrBalance}
        onOpenWallet={() => setCurrentTab('wallet')}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenProfile={() => setCurrentTab('profile')}
        onOpenDownload={() => setIsDownloadOpen(true)}
      />

      {/* Main Body per Tab */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {currentTab === 'home' && (
          <HomeTab
            user={user}
            stats={stats}
            tasks={tasks}
            onNavigate={(tab) => setCurrentTab(tab)}
            onStartTask={handleStartTask}
            canClaimBonus={canClaimBonus}
            onOpenDownload={() => setIsDownloadOpen(true)}
          />
        )}

        {currentTab === 'tasks' && (
          <TasksTab
            tasks={tasks}
            pointsPerInr={stats.pointsPerInr}
            onStartTask={handleStartTask}
          />
        )}

        {currentTab === 'bonus' && (
          <DailyBonusTab onBonusClaimed={handleBonusClaimed} />
        )}

        {currentTab === 'wallet' && (
          <WalletTab onRefreshProfile={refreshUserData} />
        )}

        {currentTab === 'refer' && <ReferralTab />}

        {currentTab === 'profile' && (
          <ProfileTab
            user={user}
            onRefreshProfile={refreshUserData}
            onLogout={handleLogout}
            onOpenAdmin={() => setIsAdminOpen(true)}
            onNavigateToWallet={() => setCurrentTab('wallet')}
            onOpenDownload={() => setIsDownloadOpen(true)}
          />
        )}
      </div>

      {/* Android Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        canClaimBonus={canClaimBonus}
        availableTasksCount={availableTasksCount}
      />

      {/* Download App Modal */}
      <DownloadAppModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
      />

      {/* Task Execution Modal */}
      <TaskExecutionModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onTaskCompleted={handleTaskCompleted}
      />

      {/* Admin Panel Modal */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onDataChanged={refreshUserData}
      />

      {/* User Login & Register Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onSuccess={handleAuthSuccess}
        onClose={() => setIsAuthOpen(false)}
      />
    </AndroidFrame>
  );
}
