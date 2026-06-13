'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createHabit, toggleHabit } from '@/app/actions/habit-actions';
import {
  CheckSquare,
  Flame,
  Plus,
  X,
  Calendar,
  Sparkles,
  Trophy
} from 'lucide-react';

interface HabitsClientProps {
  initialHabits: any[];
  history: any[];
}

export default function HabitsClient({ initialHabits, history }: HabitsClientProps) {
  const router = useRouter();
  const [habits, setHabits] = useState(initialHabits);
  const [habitModal, setHabitModal] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [loading, setLoading] = useState(false);

  // Success celebration message
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleCreateHabitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);
    const res = await createHabit({ name, frequency });
    setLoading(false);
    if (res.success) {
      setHabitModal(false);
      setName('');
      showToast('🎉 Habit created successfully!');
      router.refresh();
    } else {
      alert(res.error || 'Failed to create habit');
    }
  };

  const handleToggleHabit = async (habitId: string) => {
    // Optimistic UI update
    setHabits(prev => 
      prev.map(h => h.id === habitId ? { ...h, completedToday: !h.completedToday, streak: h.completedToday ? Math.max(0, h.streak - 1) : h.streak + 1 } : h)
    );

    const res = await toggleHabit(habitId);
    if (res.success) {
      if (res.achievementUnlocked) {
        showToast(`🏆 ACHIEVEMENT UNLOCKED: ${res.achievementUnlocked}!`);
      } else {
        showToast(res.streak !== undefined && res.streak > 0 ? `🔥 Keep it up! Current streak: ${res.streak} days.` : 'Habit status updated.');
      }
      router.refresh();
    } else {
      // Revert on failure
      router.refresh();
      alert(res.error || 'Failed to update habit');
    }
  };

  // Helper to generate the last 30 days
  const getLast30Days = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push(d);
    }
    return days;
  };

  const last30Days = getLast30Days();

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-3 p-4 rounded-xl border border-primary/20 bg-card text-foreground shadow-2xl animate-bounce">
          <Sparkles className="h-5 w-5 text-amber-500 shrink-0" />
          <span className="font-bold text-sm">{toast}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-md shadow-md">
        <div>
          <h1 className="text-3xl font-black tracking-tight leading-tight">Daily Habit Builder</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Build healthy, consistent routines. Complete tasks daily to keep your streak fires burning.
          </p>
        </div>
        <div>
          <button
            onClick={() => setHabitModal(true)}
            className="flex items-center space-x-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:brightness-110 shadow-lg shadow-primary/25 cursor-pointer text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Habit</span>
          </button>
        </div>
      </div>

      {/* Habits Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {habits.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl bg-card/10">
            <CheckSquare className="h-12 w-12 text-muted-foreground/60 mb-3 animate-pulse" />
            <p className="font-semibold text-muted-foreground mb-1">You haven't added any habits yet.</p>
            <button
              onClick={() => setHabitModal(true)}
              className="text-primary text-xs font-bold hover:underline"
            >
              Add your first habit
            </button>
          </div>
        ) : (
          habits.map(habit => (
            <div
              key={habit.id}
              className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-6 shadow-sm hover:shadow-md
                ${habit.completedToday ? 'border-primary/20 bg-primary/5' : 'border-border bg-card'}`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1 pr-4">
                  <h3 className="font-bold text-base line-clamp-1">{habit.name}</h3>
                  <span className="text-[10px] text-muted-foreground font-mono uppercase bg-muted px-1.5 py-0.5 rounded">
                    {habit.frequency}
                  </span>
                </div>
                {/* Large Toggle Checkbox */}
                <button
                  onClick={() => handleToggleHabit(habit.id)}
                  className={`h-9 w-9 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer shrink-0
                    ${habit.completedToday 
                      ? 'bg-primary border-primary text-primary-foreground scale-105 shadow-md shadow-primary/10' 
                      : 'border-border bg-background hover:border-primary/50'}`}
                >
                  {habit.completedToday && (
                    <svg className="h-5 w-5 stroke-current" fill="none" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Streaks Widget */}
              <div className="flex items-center space-x-6 text-sm font-semibold">
                <div className="flex items-center space-x-1">
                  <Flame className={`h-5 w-5 ${habit.streak > 0 ? 'text-orange-500 animate-pulse' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="font-mono text-base leading-none font-black">{habit.streak}</p>
                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider block mt-0.5">Current Streak</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 border-l border-border/80 pl-6">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="font-mono text-base leading-none font-black">{habit.maxStreak}</p>
                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider block mt-0.5">Best Streak</span>
                  </div>
                </div>
              </div>

              {/* last 30 Days Contributions Grid */}
              <div className="pt-4 border-t border-border/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2.5">
                  Last 30 Days Activity
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {last30Days.map((day, idx) => {
                    // Check if completed in history logs
                    const habitHistory = history.find(h => h.id === habit.id);
                    const completed = habitHistory?.entries.some((entry: any) => {
                      const entryDate = new Date(entry.date);
                      entryDate.setHours(0, 0, 0, 0);
                      return entryDate.toDateString() === day.toDateString() && entry.completed;
                    });

                    return (
                      <div
                        key={idx}
                        className={`h-3.5 w-3.5 rounded-sm transition-all
                          ${completed 
                            ? 'bg-primary hover:brightness-110' 
                            : 'bg-muted dark:bg-muted/30 hover:bg-muted-foreground/30'}`}
                        title={`${day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${completed ? 'Completed' : 'Incomplete'}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE HABIT MODAL */}
      {habitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setHabitModal(false)}
              className="absolute top-4 right-4 p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-4">
              <h3 className="text-xl font-bold flex items-center space-x-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                <span>Create New Habit Routine</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Define habit name and schedule frequency.</p>
            </div>

            <form onSubmit={handleCreateHabitSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Habit Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Walk 10,000 steps"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Frequency</label>
                <select
                  value={frequency}
                  onChange={e => setFrequency(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none"
                >
                  <option value="daily">Daily Checklist</option>
                  <option value="weekly">Weekly Checklist</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:brightness-115 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? 'Creating...' : 'Create Habit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
