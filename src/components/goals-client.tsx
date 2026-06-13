'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createGoal, updateGoalProgress } from '@/app/actions/goal-actions';
import {
  Target,
  Plus,
  X,
  Trophy,
  Calendar,
  CheckCircle,
  TrendingUp,
  Sliders,
  Sparkles
} from 'lucide-react';

interface GoalsClientProps {
  initialGoals: any[];
}

export default function GoalsClient({ initialGoals }: GoalsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [goalModal, setGoalModal] = useState(false);

  // Update progress input toggles
  const [updatingGoalId, setUpdatingGoalId] = useState<string | null>(null);
  const [updatedValue, setUpdatedValue] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'WEIGHT' | 'WORKOUT_COUNT' | 'NUTRITION_CALORIES' | 'HABIT_STREAK'>('WEIGHT');
  const [targetValue, setTargetValue] = useState('');
  const [endDate, setEndDate] = useState('');

  const [loading, setLoading] = useState(false);

  // Success celebration message
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleCreateGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetValue) return;
    setLoading(true);
    const res = await createGoal({
      title,
      type,
      targetValue: Number(targetValue),
      endDate: endDate || undefined,
    });
    setLoading(false);
    if (res.success) {
      setGoalModal(false);
      setTitle('');
      setTargetValue('');
      setEndDate('');
      showToast('🎯 Goal created successfully!');
      router.refresh();
    } else {
      alert(res.error || 'Failed to create goal');
    }
  };

  const handleUpdateProgressSubmit = async (e: React.FormEvent, goalId: string) => {
    e.preventDefault();
    if (!updatedValue) return;
    setLoading(true);
    const res = await updateGoalProgress(goalId, Number(updatedValue));
    setLoading(false);
    if (res.success) {
      setUpdatingGoalId(null);
      setUpdatedValue('');
      showToast(res.achievementUnlocked ? `🏆 Goal Completed! Achievement unlocked: ${res.achievementUnlocked}` : 'Goal progress updated successfully.');
      router.refresh();
    } else {
      alert(res.error || 'Failed to update progress');
    }
  };

  const activeGoals = initialGoals.filter(g => g.status === 'ACTIVE');
  const completedGoals = initialGoals.filter(g => g.status === 'COMPLETED');

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
          <h1 className="text-3xl font-black tracking-tight leading-tight">Fitness Milestones</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Establish targets for body weight, workouts count, or habit streaks, and monitor progress.
          </p>
        </div>
        <div>
          <button
            onClick={() => setGoalModal(true)}
            className="flex items-center space-x-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:brightness-110 shadow-lg shadow-primary/25 cursor-pointer text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Goal</span>
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-border/80 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all cursor-pointer
            ${activeTab === 'active' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <Target className="h-4 w-4" />
          <span>Active Goals ({activeGoals.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all cursor-pointer
            ${activeTab === 'completed' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <CheckCircle className="h-4 w-4" />
          <span>Completed Goals ({completedGoals.length})</span>
        </button>
      </div>

      {/* 1. ACTIVE GOALS TAB */}
      {activeTab === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeGoals.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl bg-card/10">
              <Target className="h-12 w-12 text-muted-foreground/60 mb-3 animate-pulse" />
              <p className="font-semibold text-muted-foreground mb-1">No active fitness goals.</p>
              <button
                onClick={() => setGoalModal(true)}
                className="text-primary text-xs font-bold hover:underline"
              >
                Set a milestone target
              </button>
            </div>
          ) : (
            activeGoals.map(goal => {
              // Calculate progress percentages
              let pct = 0;
              if (goal.type === 'WEIGHT') {
                const range = Math.abs(goal.startValue - goal.targetValue);
                const currentDiff = Math.abs(goal.startValue - goal.currentValue);
                pct = range > 0 ? Math.min(Math.round((currentDiff / range) * 100), 100) : 0;
              } else {
                pct = Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100);
              }

              const isWeight = goal.type === 'WEIGHT';

              return (
                <div key={goal.id} className="p-6 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between space-y-4 hover:border-primary/20 transition-all duration-300">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-base line-clamp-1">{goal.title}</h3>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded font-mono">
                        {goal.type}
                      </span>
                    </div>
                    {goal.endDate && (
                      <p className="text-[10px] text-muted-foreground flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Target: {new Date(goal.endDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5 my-3">
                    <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                      <span>
                        Current: {goal.currentValue} {isWeight ? 'kg' : ''} (Start: {goal.startValue} {isWeight ? 'kg' : ''})
                      </span>
                      <span>{pct}%</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/50 flex flex-col space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                      <span>Goal Target: {goal.targetValue} {isWeight ? 'kg' : ''}</span>
                      
                      {!isWeight && updatingGoalId !== goal.id && (
                        <button
                          onClick={() => {
                            setUpdatingGoalId(goal.id);
                            setUpdatedValue(String(goal.currentValue));
                          }}
                          className="flex items-center text-primary hover:underline cursor-pointer"
                        >
                          <Sliders className="h-3 w-3 mr-1" />
                          <span>Update Progress</span>
                        </button>
                      )}
                    </div>

                    {/* Quick progress updates input */}
                    {updatingGoalId === goal.id && (
                      <form 
                        onSubmit={(e) => handleUpdateProgressSubmit(e, goal.id)}
                        className="flex items-center space-x-2 pt-2"
                      >
                        <input
                          type="number"
                          required
                          step="0.1"
                          value={updatedValue}
                          onChange={e => setUpdatedValue(e.target.value)}
                          className="w-24 px-2 py-1 border border-border bg-background rounded text-xs text-center"
                          title="New Progress Value"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1 bg-primary text-primary-foreground font-bold rounded text-xs cursor-pointer hover:brightness-110"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setUpdatingGoalId(null)}
                          className="px-2 py-1 border border-border bg-card rounded text-xs cursor-pointer hover:bg-muted"
                        >
                          Cancel
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. COMPLETED GOALS TAB */}
      {activeTab === 'completed' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {completedGoals.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl bg-card/10">
              <Trophy className="h-12 w-12 text-muted-foreground/60 mb-3 animate-pulse" />
              <p className="font-semibold text-muted-foreground">No completed goals yet. Keep pushing!</p>
            </div>
          ) : (
            completedGoals.map(goal => (
              <div key={goal.id} className="p-6 rounded-2xl border border-primary/20 bg-primary/5 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-base flex items-center text-primary">
                      <Trophy className="h-4 w-4 mr-2 text-amber-500" />
                      <span>{goal.title}</span>
                    </h3>
                    {goal.endDate && (
                      <p className="text-[10px] text-muted-foreground mt-1 flex items-center font-semibold">
                        <CheckCircle className="h-3.5 w-3.5 text-primary mr-1" />
                        Completed on: {new Date(goal.endDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                      </p>
                    )}
                  </div>
                  <span className="text-[9px] font-bold text-primary uppercase bg-primary/10 border border-primary/20 px-2 py-0.5 rounded font-mono">
                    {goal.type}
                  </span>
                </div>

                <div className="pt-3 border-t border-primary/10 text-xs font-semibold text-muted-foreground flex justify-between">
                  <span>Target Value: {goal.targetValue}</span>
                  <span>Achieved Value: {goal.currentValue}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* CREATE GOAL MODAL */}
      {goalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setGoalModal(false)}
              className="absolute top-4 right-4 p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-4">
              <h3 className="text-xl font-bold flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <span>Establish Fitness Goal</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Set a metric Target to track over time.</p>
            </div>

            <form onSubmit={handleCreateGoalSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Goal Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Achieve 80kg body weight"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Goal Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none"
                  >
                    <option value="WEIGHT">Weight (kg)</option>
                    <option value="WORKOUT_COUNT">Workouts Logged</option>
                    <option value="NUTRITION_CALORIES">Daily Calories Consumed</option>
                    <option value="HABIT_STREAK">Max Habit Streak</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Target Value</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={targetValue}
                    onChange={e => setTargetValue(e.target.value)}
                    placeholder="e.g. 80"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Target End Date (Optional)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:brightness-115 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? 'Creating...' : 'Establish Goal'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
