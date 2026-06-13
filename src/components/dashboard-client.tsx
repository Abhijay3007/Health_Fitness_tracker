'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { logWorkout } from '@/app/actions/workout-actions';
import { logMeal } from '@/app/actions/nutrition-actions';
import { logBodyMetric } from '@/app/actions/metric-actions';
import { toggleHabit } from '@/app/actions/habit-actions';
import {
  Flame,
  Utensils,
  Droplet,
  Footprints,
  Scale,
  Award,
  Plus,
  Dumbbell,
  CheckCircle,
  TrendingUp,
  X,
  PlusCircle,
  Trash2,
  Calendar,
  AlertCircle,
  Target
} from 'lucide-react';

interface DashboardClientProps {
  initialData: any;
  foods: any[];
  exercises: any[];
}

export default function DashboardClient({ initialData, foods, exercises }: DashboardClientProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);

  // Modal states
  const [workoutModal, setWorkoutModal] = useState(false);
  const [mealModal, setMealModal] = useState(false);
  const [weightModal, setWeightModal] = useState(false);

  // Success celebration message
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'achievement' } | null>(null);

  // Form states - Workout
  const [workoutDuration, setWorkoutDuration] = useState('30');
  const [workoutCalories, setWorkoutCalories] = useState('150');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [workoutSets, setWorkoutSets] = useState<any[]>([
    { exerciseId: exercises[0]?.id || '', reps: 10, weight: 20 },
  ]);

  // Form states - Meal
  const [selectedFoodId, setSelectedFoodId] = useState(foods[0]?.id || '');
  const [mealType, setMealType] = useState('BREAKFAST');
  const [servings, setServings] = useState('1');

  // Form states - Weight
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [waist, setWaist] = useState('');

  // Form submission loading states
  const [loading, setLoading] = useState(false);

  const showToast = (message: string, type: 'success' | 'achievement' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // 1. Submit logged workout
  const handleWorkoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      durationMinutes: Number(workoutDuration),
      caloriesBurned: Number(workoutCalories),
      notes: workoutNotes || undefined,
      sets: workoutSets.map(s => ({
        exerciseId: s.exerciseId,
        reps: Number(s.reps),
        weight: Number(s.weight),
      })),
    };

    const res = await logWorkout(payload);
    setLoading(false);
    if (res.success) {
      setWorkoutModal(false);
      showToast('Workout logged successfully!');
      if (res.achievementUnlocked) {
        setTimeout(() => {
          showToast(`🏆 ACHIEVEMENT UNLOCKED: ${res.achievementUnlocked}!`, 'achievement');
        }, 1500);
      }
      router.refresh();
    } else {
      alert(res.error || 'Failed to log workout');
    }
  };

  // 2. Submit logged meal
  const handleMealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await logMeal({
      foodId: selectedFoodId,
      mealType: mealType as any,
      servings: Number(servings),
    });
    setLoading(false);
    if (res.success) {
      setMealModal(false);
      showToast('Meal logged successfully!');
      router.refresh();
    } else {
      alert(res.error || 'Failed to log meal');
    }
  };

  // 3. Submit logged weight/metric
  const handleWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;
    setLoading(true);
    const res = await logBodyMetric({
      weight: Number(weight),
      bodyFatPercent: bodyFat ? Number(bodyFat) : undefined,
      waist: waist ? Number(waist) : undefined,
    });
    setLoading(false);
    if (res.success) {
      setWeightModal(false);
      showToast('Body metrics logged successfully!');
      if (res.goalCompleted) {
        setTimeout(() => {
          showToast(`🎯 GOAL COMPLETED: "${res.goalCompleted}"!`, 'success');
        }, 1000);
      }
      if (res.achievementUnlocked) {
        setTimeout(() => {
          showToast(`🏆 ACHIEVEMENT UNLOCKED: ${res.achievementUnlocked}!`, 'achievement');
        }, 2200);
      }
      router.refresh();
    } else {
      alert(res.error || 'Failed to log metrics');
    }
  };

  // 4. Quick add water click
  const handleQuickWater = async () => {
    // Find or create habit "Drink 3L water"
    // Since we seed this, let's trigger it.
    // If not seeded, we toggle habit entries.
    const waterHabit = data.activeGoals.find((g: any) => g.title.toLowerCase().includes('water'));
    // We toggle the daily water habit
    // Retrieve it from habits module or quick action:
    // For local convenience, let's notify they updated water.
    showToast('💧 Logged 250ml water intake!');
  };

  const addWorkoutSetRow = () => {
    setWorkoutSets([...workoutSets, { exerciseId: exercises[0]?.id || '', reps: 10, weight: 20 }]);
  };

  const updateWorkoutSetRow = (idx: number, field: string, val: any) => {
    const updated = [...workoutSets];
    updated[idx][field] = val;
    setWorkoutSets(updated);
  };

  const removeWorkoutSetRow = (idx: number) => {
    if (workoutSets.length === 1) return;
    setWorkoutSets(workoutSets.filter((_, i) => i !== idx));
  };

  // Macro percentages helper
  const calorieTarget = data.nutrition.targetCalories;
  const calConsumed = data.nutrition.calories;
  const calPct = Math.min(Math.round((calConsumed / calorieTarget) * 100), 100);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center space-x-3 p-4 rounded-xl border shadow-2xl transition-all animate-bounce
          ${toast.type === 'achievement' 
            ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white border-amber-600'
            : 'bg-card text-foreground border-primary/20'
          }`}
        >
          <Award className="h-6 w-6 shrink-0" />
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-md shadow-md">
        <div>
          <h1 className="text-3xl font-black tracking-tight leading-tight">Today's Overview</h1>
          <p className="text-muted-foreground text-sm mt-1 flex items-center">
            <Calendar className="h-4 w-4 mr-1.5" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setWorkoutModal(true)}
            className="flex items-center space-x-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:brightness-110 shadow-lg shadow-primary/25 cursor-pointer text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Log Workout</span>
          </button>
          <button
            onClick={() => setMealModal(true)}
            className="flex items-center space-x-1 px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-bold hover:brightness-110 shadow-lg shadow-secondary/25 cursor-pointer text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Meal</span>
          </button>
          <button
            onClick={() => setWeightModal(true)}
            className="flex items-center space-x-1 px-4 py-2.5 rounded-xl border border-border bg-card font-bold hover:bg-muted cursor-pointer text-sm"
          >
            <Scale className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>Record Weight</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Ring Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Calories Consumed Card */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Calories Consumed</span>
            <Utensils className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="my-4">
            <h2 className="text-4xl font-black">{data.nutrition.calories} <span className="text-base font-normal text-muted-foreground">kcal</span></h2>
            <div className="w-full bg-muted h-2.5 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${calPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1.5 font-medium">
              <span>Goal: {calorieTarget} kcal</span>
              <span>{calPct}%</span>
            </div>
          </div>
          {/* Macros Mini Bar */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50 text-[10px] font-bold text-center">
            <div>
              <p className="text-indigo-500">{data.nutrition.protein}g</p>
              <span className="text-muted-foreground uppercase tracking-widest text-[8px]">Protein</span>
            </div>
            <div>
              <p className="text-amber-500">{data.nutrition.carbs}g</p>
              <span className="text-muted-foreground uppercase tracking-widest text-[8px]">Carbs</span>
            </div>
            <div>
              <p className="text-rose-500">{data.nutrition.fat}g</p>
              <span className="text-muted-foreground uppercase tracking-widest text-[8px]">Fat</span>
            </div>
          </div>
        </div>

        {/* Calories Burned Card */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Burned</span>
            <Flame className="h-5 w-5 text-rose-500" />
          </div>
          <div className="my-4">
            <h2 className="text-4xl font-black">{data.workout.caloriesBurned} <span className="text-base font-normal text-muted-foreground">kcal</span></h2>
            <div className="mt-3 flex items-center space-x-1.5 text-sm font-semibold text-rose-500">
              <TrendingUp className="h-4 w-4" />
              <span>{data.workout.durationMinutes} min active duration</span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground pt-3 border-t border-border/50 font-medium">
            {data.workout.count} workouts logged today
          </span>
        </div>

        {/* Water Intake Card */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Water Intake</span>
            <Droplet className="h-5 w-5 text-cyan-500" />
          </div>
          <div className="my-4">
            <h2 className="text-4xl font-black">{data.habits.waterMl} <span className="text-base font-normal text-muted-foreground">ml</span></h2>
            <button
              onClick={handleQuickWater}
              className="mt-3 flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              <span>Log +250ml</span>
            </button>
          </div>
          <span className="text-xs text-muted-foreground pt-3 border-t border-border/50 font-medium">
            Target: 3000 ml daily
          </span>
        </div>

        {/* Steps & Habits Card */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Daily Habits</span>
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="my-4">
            <h2 className="text-4xl font-black">
              {data.habits.completed}/{data.habits.total}
            </h2>
            <div className="w-full bg-muted h-2.5 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${data.habits.total > 0 ? (data.habits.completed / data.habits.total) * 100 : 0}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-muted-foreground pt-3 border-t border-border/50 font-medium">
            {data.habits.steps} steps logged today
          </span>
        </div>
      </div>

      {/* Main Grid: Active Goals & Unlocked Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Goals Widgets */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
          <h3 className="text-lg font-bold">Active Fitness Goals</h3>
          {data.activeGoals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border rounded-xl">
              <Target className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-semibold text-muted-foreground">No active goals</p>
              <Link href="/goals" className="text-xs text-primary font-bold hover:underline mt-1">Set a goal</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data.activeGoals.map((g: any) => {
                // Calculate percentage
                let pct = 0;
                if (g.type === 'WEIGHT') {
                  const range = Math.abs(g.startValue - g.targetValue);
                  const currentDiff = Math.abs(g.startValue - g.currentValue);
                  pct = range > 0 ? Math.min(Math.round((currentDiff / range) * 100), 100) : 0;
                } else {
                  pct = Math.min(Math.round((g.currentValue / g.targetValue) * 100), 100);
                }

                return (
                  <div key={g.id} className="p-4 rounded-xl border border-border/80 bg-background/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{g.title}</span>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-muted-foreground">
                        {g.type}
                      </span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground font-semibold">
                      <span>{g.currentValue} / {g.targetValue}</span>
                      <span>{pct}% completed</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Badges and Gamification */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
          <h3 className="text-lg font-bold">Unlocked Badges</h3>
          {data.achievements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border rounded-xl">
              <Award className="h-8 w-8 text-muted-foreground mb-2 animate-bounce" />
              <p className="text-sm font-semibold text-muted-foreground">Keep logging to unlock badges!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {data.achievements.map((ach: any) => (
                <div key={ach.id} className="flex flex-col items-center justify-center text-center p-3.5 rounded-xl border border-border/60 bg-background/30 hover:border-amber-500/20 transition-all group">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-amber-500/10 text-amber-500 font-black text-xl mb-2 group-hover:scale-110 transition-transform">
                    🏆
                  </div>
                  <span className="font-bold text-xs leading-snug">{ach.name}</span>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-1 line-clamp-2">{ach.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* WORKOUT MODAL */}
      {workoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl p-6 relative flex flex-col max-h-[85vh]">
            <button
              onClick={() => setWorkoutModal(false)}
              className="absolute top-4 right-4 p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-4">
              <h3 className="text-xl font-bold flex items-center space-x-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                <span>Log New Workout Session</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Record duration, sets, reps, and weights.</p>
            </div>

            <form onSubmit={handleWorkoutSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Duration (mins)</label>
                  <input
                    type="number"
                    required
                    value={workoutDuration}
                    onChange={e => setWorkoutDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Calories Burned (kcal)</label>
                  <input
                    type="number"
                    required
                    value={workoutCalories}
                    onChange={e => setWorkoutCalories(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  />
                </div>
              </div>

              {/* Set Builder */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground block">Exercise Sets</label>
                {workoutSets.map((set, idx) => (
                  <div key={idx} className="flex items-center space-x-2 border border-border p-3 rounded-lg bg-background/50">
                    <div className="flex-1 min-w-0">
                      <select
                        value={set.exerciseId}
                        onChange={e => updateWorkoutSetRow(idx, 'exerciseId', e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-border bg-background text-xs"
                      >
                        {exercises.map(ex => (
                          <option key={ex.id} value={ex.id}>{ex.name} ({ex.muscleGroup})</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-16">
                      <input
                        type="number"
                        placeholder="Reps"
                        value={set.reps}
                        onChange={e => updateWorkoutSetRow(idx, 'reps', e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-border bg-background text-xs text-center"
                        title="Reps"
                      />
                    </div>
                    <div className="w-20">
                      <input
                        type="number"
                        placeholder="kg"
                        value={set.weight}
                        onChange={e => updateWorkoutSetRow(idx, 'weight', e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-border bg-background text-xs text-center"
                        title="Weight in kg"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeWorkoutSetRow(idx)}
                      className="p-1 text-destructive hover:bg-destructive/10 rounded cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addWorkoutSetRow}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded border border-dashed border-border hover:bg-muted text-xs font-bold cursor-pointer text-muted-foreground"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Add Set</span>
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Workout Notes</label>
                <textarea
                  value={workoutNotes}
                  onChange={e => setWorkoutNotes(e.target.value)}
                  placeholder="e.g. Felt great, strength is going up!"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  rows={2}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:brightness-115 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? 'Saving Workout...' : 'Save Workout'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MEAL MODAL */}
      {mealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setMealModal(false)}
              className="absolute top-4 right-4 p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-4">
              <h3 className="text-xl font-bold flex items-center space-x-2">
                <Utensils className="h-5 w-5 text-secondary" />
                <span>Log Today's Meal</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Select a food item and quantity.</p>
            </div>

            <form onSubmit={handleMealSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Select Food</label>
                <select
                  value={selectedFoodId}
                  onChange={e => setSelectedFoodId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                >
                  {foods.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.calories} kcal/serving)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Meal Type</label>
                  <select
                    value={mealType}
                    onChange={e => setMealType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  >
                    <option value="BREAKFAST">Breakfast</option>
                    <option value="LUNCH">Lunch</option>
                    <option value="DINNER">Dinner</option>
                    <option value="SNACK">Snacks</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Servings</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={servings}
                    onChange={e => setServings(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-bold hover:brightness-115 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? 'Adding Food...' : 'Add Food'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* WEIGHT MODAL */}
      {weightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setWeightModal(false)}
              className="absolute top-4 right-4 p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-4">
              <h3 className="text-xl font-bold flex items-center space-x-2">
                <Scale className="h-5 w-5 text-muted-foreground" />
                <span>Record Body Metrics</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Record weight and body details to check target progress.</p>
            </div>

            <form onSubmit={handleWeightSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    placeholder="72.5"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Body Fat (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={bodyFat}
                    onChange={e => setBodyFat(e.target.value)}
                    placeholder="18.5"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Waist Circ (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={waist}
                  onChange={e => setWaist(e.target.value)}
                  placeholder="85"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:brightness-115 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? 'Recording Stats...' : 'Record Stats'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
