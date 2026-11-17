import React from 'react';
import { Home, CheckSquare, Gift, Wallet, Users, User } from 'lucide-react';

export type NavTab = 'home' | 'tasks' | 'bonus' | 'wallet' | 'refer' | 'profile';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  canClaimBonus?: boolean;
  availableTasksCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  canClaimBonus = false,
  availableTasksCount = 0,
}) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'tasks' as NavTab, label: 'Tasks', icon: CheckSquare, badge: availableTasksCount > 0 ? availableTasksCount : undefined },
    { id: 'bonus' as NavTab, label: 'Bonus', icon: Gift, hasDot: canClaimBonus },
    { id: 'wallet' as NavTab, label: 'Wallet', icon: Wallet },
    { id: 'refer' as NavTab, label: 'Refer', icon: Users },
  ];

  return (
    <nav className="sticky bottom-0 z-30 bg-white border-t border-slate-200 shadow-lg px-2 py-1 select-none">
      <div className="grid grid-cols-5 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`min-h-[48px] py-1 flex flex-col items-center justify-center transition-all relative ${
                isActive ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />

                {/* Number Badge */}
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[9px] font-bold px-1 rounded-full min-w-3.5 h-3.5 flex items-center justify-center font-mono-numbers ring-1 ring-white">
                    {tab.badge}
                  </span>
                )}

                {/* Dot Indicator */}
                {tab.hasDot && !tab.badge && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
                )}
              </div>

              <span
                className={`text-[10px] mt-1 transition-colors whitespace-nowrap ${
                  isActive ? 'font-bold text-emerald-800' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>

              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-emerald-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
