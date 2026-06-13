'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logMeal, createCustomFood, deleteMeal } from '@/app/actions/nutrition-actions';
import {
  Apple,
  Search,
  Plus,
  PlusCircle,
  X,
  Trash2,
  Utensils,
  ChevronRight,
  TrendingUp,
  FolderHeart
} from 'lucide-react';

interface NutritionClientProps {
  foods: any[];
  initialLogs: any[];
}

export default function NutritionClient({ foods, initialLogs }: NutritionClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'tracker' | 'foods'>('tracker');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [customFoodModal, setCustomFoodModal] = useState(false);
  const [logMealModal, setLogMealModal] = useState(false);

  // Form states - Custom Food
  const [foodName, setFoodName] = useState('');
  const [foodCalories, setFoodCalories] = useState('');
  const [foodProtein, setFoodProtein] = useState('');
  const [foodCarbs, setFoodCarbs] = useState('');
  const [foodFat, setFoodFat] = useState('');
  const [servingSize, setServingSize] = useState('100g');

  // Form states - Log Meal
  const [selectedFood, setSelectedFood] = useState<any>(foods[0] || null);
  const [mealType, setMealType] = useState('BREAKFAST');
  const [servings, setServings] = useState('1');

  const [loading, setLoading] = useState(false);

  // Filter food search
  const filteredFoods = foods.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate totals
  const totals = initialLogs.reduce(
    (acc, log) => {
      acc.calories += log.calories;
      acc.protein += log.protein;
      acc.carbs += log.carbs;
      acc.fat += log.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Default targets
  const targets = {
    calories: 2000,
    protein: 140,
    carbs: 220,
    fat: 65,
  };

  const handleCreateCustomFoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createCustomFood({
      name: foodName,
      calories: Number(foodCalories),
      protein: Number(foodProtein),
      carbs: Number(foodCarbs),
      fat: Number(foodFat),
      servingSize: servingSize,
    });
    setLoading(false);
    if (res.success) {
      setCustomFoodModal(false);
      // Reset
      setFoodName('');
      setFoodCalories('');
      setFoodProtein('');
      setFoodCarbs('');
      setFoodFat('');
      alert('Custom food created successfully!');
      router.refresh();
    } else {
      alert(res.error || 'Failed to create food');
    }
  };

  const handleLogMealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFood) return;
    setLoading(true);
    const res = await logMeal({
      foodId: selectedFood.id,
      mealType: mealType as any,
      servings: Number(servings),
    });
    setLoading(false);
    if (res.success) {
      setLogMealModal(false);
      alert('Meal logged successfully!');
      router.refresh();
    } else {
      alert(res.error || 'Failed to log meal');
    }
  };

  const handleDeleteMeal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this log?')) return;
    const res = await deleteMeal(id);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || 'Failed to delete');
    }
  };

  // Grouped logs by meal type
  const mealTypesList = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const;
  const groupedLogs = mealTypesList.reduce((acc, mt) => {
    acc[mt] = initialLogs.filter(log => log.mealType === mt);
    return acc;
  }, {} as Record<typeof mealTypesList[number], any[]>);

  const displayMealType = (mt: string) => {
    switch (mt) {
      case 'BREAKFAST': return 'Breakfast 🍳';
      case 'LUNCH': return 'Lunch 🍱';
      case 'DINNER': return 'Dinner 🥗';
      case 'SNACK': return 'Snacks & Extras 🍎';
      default: return mt;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-md shadow-md">
        <div>
          <h1 className="text-3xl font-black tracking-tight leading-tight">Nutrition Module</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Log your daily meal breakdowns, track calorie target targets, and create custom recipe values.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              if (foods.length > 0) {
                setSelectedFood(foods[0]);
                setLogMealModal(true);
              }
            }}
            className="flex items-center space-x-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:brightness-110 shadow-lg shadow-primary/25 cursor-pointer text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Log Meal</span>
          </button>
          <button
            onClick={() => setCustomFoodModal(true)}
            className="flex items-center space-x-1 px-4 py-2.5 rounded-xl border border-border bg-card font-bold hover:bg-muted cursor-pointer text-sm"
          >
            <FolderHeart className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>Add Custom Food</span>
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-border/80 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('tracker')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all cursor-pointer
            ${activeTab === 'tracker' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <Utensils className="h-4 w-4" />
          <span>Daily Tracker Summary</span>
        </button>
        <button
          onClick={() => setActiveTab('foods')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all cursor-pointer
            ${activeTab === 'foods' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <Apple className="h-4 w-4" />
          <span>Food Database ({filteredFoods.length})</span>
        </button>
      </div>

      {/* 1. DAILY TRACKER TAB */}
      {activeTab === 'tracker' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calorie & Macro Target Progress */}
          <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
            <h3 className="text-lg font-bold">Daily Macro Progress</h3>
            
            {/* Calorie Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span>Calories</span>
                <span>{Math.round(totals.calories)} / {targets.calories} kcal</span>
              </div>
              <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all" 
                  style={{ width: `${Math.min((totals.calories / targets.calories) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Protein Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-indigo-500">Protein</span>
                <span>{Math.round(totals.protein)} / {targets.protein} g</span>
              </div>
              <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all" 
                  style={{ width: `${Math.min((totals.protein / targets.protein) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Carbs Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-amber-500">Carbohydrates</span>
                <span>{Math.round(totals.carbs)} / {targets.carbs} g</span>
              </div>
              <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all" 
                  style={{ width: `${Math.min((totals.carbs / targets.carbs) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Fat Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-rose-500">Fat</span>
                <span>{Math.round(totals.fat)} / {targets.fat} g</span>
              </div>
              <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-rose-500 h-full rounded-full transition-all" 
                  style={{ width: `${Math.min((totals.fat / targets.fat) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Grouped Meal Logs List */}
          <div className="lg:col-span-2 p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
            <h3 className="text-lg font-bold">Meal Logs Timeline</h3>

            {initialLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl bg-background/50">
                <Utensils className="h-10 w-10 text-muted-foreground/60 mb-2 animate-pulse" />
                <p className="font-semibold text-muted-foreground text-sm">No food logged today.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {mealTypesList.map(mt => {
                  const logs = groupedLogs[mt];
                  if (logs.length === 0) return null;
                  
                  // Calculate meal type calories
                  const mealCal = logs.reduce((sum, l) => sum + l.calories, 0);

                  return (
                    <div key={mt} className="space-y-2.5">
                      <div className="flex justify-between items-center pb-1 border-b border-border/60">
                        <span className="font-bold text-sm text-primary">{displayMealType(mt)}</span>
                        <span className="text-xs font-mono font-bold text-muted-foreground">{Math.round(mealCal)} kcal</span>
                      </div>
                      <div className="space-y-2">
                        {logs.map(log => (
                          <div key={log.id} className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background/30 hover:border-primary/20 transition-all text-xs">
                            <div>
                              <p className="font-bold text-sm">{log.food.name}</p>
                              <p className="text-muted-foreground text-[10px] mt-0.5">
                                {log.servings} serving ({log.food.servingSize}) • P: {Math.round(log.protein)}g C: {Math.round(log.carbs)}g F: {Math.round(log.fat)}g
                              </p>
                            </div>
                            <div className="flex items-center space-x-3.5">
                              <span className="font-bold font-mono">{Math.round(log.calories)} kcal</span>
                              <button
                                onClick={() => handleDeleteMeal(log.id)}
                                className="p-1 text-destructive hover:bg-destructive/10 rounded cursor-pointer"
                                title="Delete Log"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. FOOD DATABASE TAB */}
      {activeTab === 'foods' && (
        <div className="space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search foods library..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-card focus:outline-none focus:ring-1 focus:ring-primary text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFoods.map(food => (
              <div key={food.id} className="p-5 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-base">{food.name}</span>
                    {food.isCustom && (
                      <span className="text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded">
                        Custom
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground font-semibold">Serving size: {food.servingSize}</span>
                  <div className="grid grid-cols-4 gap-2 my-4 pt-3 border-t border-border/50 text-center font-mono">
                    <div className="p-1.5 bg-muted rounded">
                      <p className="text-xs font-black">{Math.round(food.calories)}</p>
                      <span className="text-[8px] text-muted-foreground uppercase tracking-widest block mt-0.5">kcal</span>
                    </div>
                    <div className="p-1.5 bg-muted rounded">
                      <p className="text-xs font-black text-indigo-500">{Math.round(food.protein)}g</p>
                      <span className="text-[8px] text-muted-foreground uppercase tracking-widest block mt-0.5">Prot</span>
                    </div>
                    <div className="p-1.5 bg-muted rounded">
                      <p className="text-xs font-black text-amber-500">{Math.round(food.carbs)}g</p>
                      <span className="text-[8px] text-muted-foreground uppercase tracking-widest block mt-0.5">Carb</span>
                    </div>
                    <div className="p-1.5 bg-muted rounded">
                      <p className="text-xs font-black text-rose-500">{Math.round(food.fat)}g</p>
                      <span className="text-[8px] text-muted-foreground uppercase tracking-widest block mt-0.5">Fat</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedFood(food);
                    setLogMealModal(true);
                  }}
                  className="w-full mt-2 flex items-center justify-center space-x-1 py-2 rounded-xl border border-border hover:bg-muted text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Log this food</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LOG MEAL MODAL */}
      {logMealModal && selectedFood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setLogMealModal(false)}
              className="absolute top-4 right-4 p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-4">
              <h3 className="text-xl font-bold flex items-center space-x-2">
                <Utensils className="h-5 w-5 text-primary" />
                <span>Log Food Intake</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Log servings for: <strong>{selectedFood.name}</strong></p>
            </div>

            <form onSubmit={handleLogMealSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Meal Category</label>
                  <select
                    value={mealType}
                    onChange={e => setMealType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value="BREAKFAST">Breakfast</option>
                    <option value="LUNCH">Lunch</option>
                    <option value="DINNER">Dinner</option>
                    <option value="SNACK">Snacks</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Servings ({selectedFood.servingSize})</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={servings}
                    onChange={e => setServings(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Calculated macros display */}
              <div className="p-3.5 bg-background border border-border rounded-xl space-y-1.5 text-xs text-muted-foreground font-mono">
                <p className="font-bold text-foreground font-sans text-xs">Calculated macros:</p>
                <p>⚡ Calories: {Math.round(selectedFood.calories * Number(servings))} kcal</p>
                <p>💪 Protein: {Math.round(selectedFood.protein * Number(servings))} g</p>
                <p>🍞 Carbs: {Math.round(selectedFood.carbs * Number(servings))} g</p>
                <p>🥑 Fat: {Math.round(selectedFood.fat * Number(servings))} g</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:brightness-115 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? 'Logging meal...' : 'Confirm Log'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CUSTOM FOOD MODAL */}
      {customFoodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setCustomFoodModal(false)}
              className="absolute top-4 right-4 p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-4">
              <h3 className="text-xl font-bold flex items-center space-x-2">
                <FolderHeart className="h-5 w-5 text-secondary" />
                <span>Create Custom Food Entry</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Specify macro values per serving size.</p>
            </div>

            <form onSubmit={handleCreateCustomFoodSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Food Name</label>
                <input
                  type="text"
                  required
                  value={foodName}
                  onChange={e => setFoodName(e.target.value)}
                  placeholder="e.g. Greek Yogurt 2%"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Serving Size description</label>
                  <input
                    type="text"
                    required
                    value={servingSize}
                    onChange={e => setServingSize(e.target.value)}
                    placeholder="e.g. 100g, 1 cup"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Calories (kcal)</label>
                  <input
                    type="number"
                    required
                    value={foodCalories}
                    onChange={e => setFoodCalories(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-indigo-500">Protein (g)</label>
                  <input
                    type="number"
                    required
                    value={foodProtein}
                    onChange={e => setFoodProtein(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-xs text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-amber-500">Carbs (g)</label>
                  <input
                    type="number"
                    required
                    value={foodCarbs}
                    onChange={e => setFoodCarbs(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-xs text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-rose-500">Fat (g)</label>
                  <input
                    type="number"
                    required
                    value={foodFat}
                    onChange={e => setFoodFat(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-xs text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-bold hover:brightness-115 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? 'Creating...' : 'Create Food Item'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
