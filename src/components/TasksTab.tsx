import React, { useState } from 'react';
import {
  CheckSquare,
  Play,
  ClipboardList,
  Flame,
  Clock,
  Coins,
  CheckCircle2,
  Hourglass,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Task, TaskCategory } from '../types';

interface TasksTabProps {
  tasks: Array<
    Task & {
      userStatus: 'available' | 'pending' | 'completed';
      submissionId: string | null;
      submissionDate: string | null;
    }
  >;
  pointsPerInr: number;
  onStartTask: (task: Task) => void;
}

export const TasksTab: React.FC<TasksTabProps> = ({
  tasks,
  pointsPerInr,
  onStartTask,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | TaskCategory>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'available' | 'pending' | 'completed'>('all');

  const categories: Array<{ id: 'all' | TaskCategory; label: string; icon: React.ElementType }> = [
    { id: 'all', label: 'All Tasks', icon: Layers },
    { id: 'video', label: 'Videos', icon: Play },
    { id: 'survey', label: 'Surveys', icon: ClipboardList },
    { id: 'promo', label: 'Promos', icon: Flame },
    { id: 'app', label: 'App Installs', icon: CheckSquare },
    { id: 'daily', label: 'Daily', icon: Clock },
  ];

  const filteredTasks = tasks.filter((task) => {
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || task.userStatus === selectedStatus;
    return matchesCategory && matchesStatus;
  });

  return (
    <div className="flex-1 pb-8 space-y-4">
      {/* Top Header */}
      <div className="bg-emerald-700 text-white px-4 pt-2 pb-5 rounded-b-3xl shadow-sm">
        <h2 className="text-lg font-bold">Earn Reward Points</h2>
        <p className="text-xs text-emerald-100 mt-0.5">
          Complete verified brand tasks to earn real wallet rewards
        </p>

        {/* Category Horizontal Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 -mx-2 px-2 no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  isSelected
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'bg-emerald-800/60 text-emerald-100 hover:bg-emerald-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 space-y-3">
        {/* Status Filter Segmented Control */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Showing {filteredTasks.length} tasks
          </span>

          <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg text-[11px]">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-2 py-1 rounded-md font-semibold transition-colors ${
                selectedStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedStatus('available')}
              className={`px-2 py-1 rounded-md font-semibold transition-colors ${
                selectedStatus === 'available' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setSelectedStatus('pending')}
              className={`px-2 py-1 rounded-md font-semibold transition-colors ${
                selectedStatus === 'pending' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setSelectedStatus('completed')}
              className={`px-2 py-1 rounded-md font-semibold transition-colors ${
                selectedStatus === 'completed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Done
            </button>
          </div>
        </div>

        {/* Task Cards List */}
        <div className="space-y-3">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const inrValue = (task.rewardPoints / pointsPerInr).toFixed(2);
              const isCompleted = task.userStatus === 'completed';
              const isPending = task.userStatus === 'pending';

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCompleted
                      ? 'bg-slate-50 border-slate-200 opacity-80'
                      : isPending
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-white border-slate-200 hover:border-emerald-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {task.badge && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            {task.badge}
                          </span>
                        )}
                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          ~{task.estimatedMinutes} min
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          {task.requiresProof ? '• Manual Audit' : '• Instant Reward'}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900">{task.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {task.description}
                      </p>
                    </div>

                    {/* Reward Points Box */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-2.5 py-1.5 text-center shrink-0">
                      <div className="flex items-center justify-center gap-1 text-emerald-700 font-extrabold text-sm font-mono-numbers">
                        <Coins className="w-3.5 h-3.5 text-amber-500" />
                        <span>+{task.rewardPoints}</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 block font-mono-numbers">
                        ₹{inrValue}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Action / Status Strip */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {task.totalCompletions} people completed
                    </span>

                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed & Credited
                      </span>
                    ) : isPending ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100/70 px-3 py-1 rounded-xl">
                        <Hourglass className="w-3.5 h-3.5 animate-spin" />
                        Proof Under Verification
                      </span>
                    ) : (
                      <button
                        onClick={() => onStartTask(task)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                      >
                        <span>Start Task</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No tasks in this filter</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Switch filters to view all available earning opportunities
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
