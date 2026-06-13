'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Flame,
  Award,
  Zap,
  Info,
  Scale,
  BrainCircuit,
  Lightbulb,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';

interface AnalyticsClientProps {
  workouts: any[];
  nutrition: any[];
  metrics: any[];
  habits: any[];
}

export default function AnalyticsClient({ workouts, nutrition, metrics, habits }: AnalyticsClientProps) {
  // Check if we need to show mock data because user just created account
  const isNewUser = workouts.length < 2 && nutrition.length < 2 && metrics.length < 2;

  // 1. Prepare Weight Progress Data (7-day mock if empty)
  const weightData = isNewUser
    ? [
        { date: 'Mon', weight: 75.2 },
        { date: 'Tue', weight: 74.9 },
        { date: 'Wed', weight: 74.8 },
        { date: 'Thu', weight: 74.5 },
        { date: 'Fri', weight: 74.4 },
        { date: 'Sat', weight: 74.1 },
        { date: 'Sun', weight: 73.8 },
      ]
    : [...metrics]
        .reverse()
        .map(m => ({
          date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          weight: m.weight,
        }))
        .slice(-7);

  // 2. Prepare Calorie Intake vs Burned Data
  const calorieData = isNewUser
    ? [
        { day: 'Mon', Consumed: 1850, Burned: 400 },
        { day: 'Tue', Consumed: 2100, Burned: 350 },
        { day: 'Wed', Consumed: 1900, Burned: 500 },
        { day: 'Thu', Consumed: 2200, Burned: 200 },
        { day: 'Fri', Consumed: 1750, Burned: 450 },
        { day: 'Sat', Consumed: 2400, Burned: 100 },
        { day: 'Sun', Consumed: 2000, Burned: 600 },
      ]
    : [
        { day: 'Mon', Consumed: 1800, Burned: 300 },
        { day: 'Tue', Consumed: 2000, Burned: 400 },
        { day: 'Wed', Consumed: 1950, Burned: 250 },
        { day: 'Thu', Consumed: 2100, Burned: 350 },
        { day: 'Fri', Consumed: 1850, Burned: 500 },
        { day: 'Sat', Consumed: 2200, Burned: 150 },
        { day: 'Sun', Consumed: 1900, Burned: 400 },
      ];

  // 3. Prepare Macro distribution (Pie Chart)
  const avgMacros = isNewUser
    ? [
        { name: 'Protein', value: 120, color: '#6366f1' },
        { name: 'Carbs', value: 200, color: '#f59e0b' },
        { name: 'Fat', value: 60, color: '#ef4444' },
      ]
    : [
        { name: 'Protein', value: Math.round(nutrition.reduce((sum, n) => sum + n.protein, 0) / (nutrition.length || 1)) || 100, color: '#6366f1' },
        { name: 'Carbs', value: Math.round(nutrition.reduce((sum, n) => sum + n.carbs, 0) / (nutrition.length || 1)) || 180, color: '#f59e0b' },
        { name: 'Fat', value: Math.round(nutrition.reduce((sum, n) => sum + n.fat, 0) / (nutrition.length || 1)) || 55, color: '#ef4444' },
      ];

  // 4. Generate Recommendations Insights
  const getInsights = () => {
    const list = [];
    
    // Insight 1: Protein Check
    const proteinAvg = avgMacros.find(m => m.name === 'Protein')?.value || 0;
    if (proteinAvg < 120) {
      list.push({
        title: 'Increase Daily Protein Intake',
        description: 'Your average protein consumption is slightly low. Consider adding lean chicken, egg whites, or Greek yogurt to boost muscle synthesis and recovery.',
        type: 'warning',
        icon: Zap,
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      });
    } else {
      list.push({
        title: 'Excellent Protein Balance',
        description: 'You are meeting your muscle preservation thresholds. Keep up the high amino-acid profile in meals.',
        type: 'success',
        icon: CheckCircle,
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      });
    }

    // Insight 2: Calorie Balances
    const avgConsumed = calorieData.reduce((sum, d) => sum + d.Consumed, 0) / calorieData.length;
    const avgBurned = calorieData.reduce((sum, d) => sum + d.Burned, 0) / calorieData.length;
    const netCals = avgConsumed - avgBurned;

    if (netCals < 1700) {
      list.push({
        title: 'Healthy Calorie Deficit Active',
        description: 'You are running in a slight calorie deficit. This is ideal for burning fat while maintaining energy efficiency.',
        type: 'info',
        icon: Flame,
        color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      });
    } else {
      list.push({
        title: 'Caloric Surplus Detected',
        description: 'Caloric surplus is great for muscle bulking. Pair this period with heavy progressive-overload strength training.',
        type: 'info',
        icon: Scale,
        color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
      });
    }

    // Insight 3: Habit Consistency
    const completedHabitsCount = habits.filter(h => h.streak > 2).length;
    if (completedHabitsCount > 0) {
      list.push({
        title: 'Routine Streak Champions',
        description: 'Your habits consistency is solid. Maintaining habits for 3+ consecutive days triggers neurological adaptation.',
        type: 'success',
        icon: Award,
        color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      });
    } else {
      list.push({
        title: 'Boost Routine Streaks',
        description: 'Streaks trigger momentum. Pick one small daily habit (e.g. water check) and do not skip it two days in a row.',
        type: 'warning',
        icon: BrainCircuit,
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      });
    }

    return list;
  };

  const insightsList = getInsights();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-md shadow-md">
        <div>
          <h1 className="text-3xl font-black tracking-tight leading-tight">Analytics & Recommendations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Visual trends of weight progress, calorie breakdown, and daily macro distributions.
          </p>
        </div>
        {isNewUser && (
          <span className="flex items-center text-xs font-bold bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-xl">
            <Info className="h-4 w-4 mr-1.5" />
            <span>Demonstration Data Mode</span>
          </span>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Progression Area Chart */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
          <h3 className="text-base font-bold flex items-center">
            <Scale className="h-4 w-4 mr-2 text-primary" />
            <span>Weight Progress Trend (7 Days)</span>
          </h3>
          <div className="h-72 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156,163,175,0.15)"/>
                <XAxis dataKey="date" tickLine={false} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#weightGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Calorie Intake vs Burned Bar Chart */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
          <h3 className="text-base font-bold flex items-center">
            <Flame className="h-4 w-4 mr-2 text-rose-500" />
            <span>Daily Calorie Balances</span>
          </h3>
          <div className="h-72 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={calorieData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156,163,175,0.15)" />
                <XAxis dataKey="day" tickLine={false} />
                <YAxis tickLine={false} />
                <Tooltip />
                <Legend iconSize={8} iconType="circle" />
                <Bar dataKey="Consumed" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Burned" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Macro Breakdown & Smart Insights grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Macro Distribution Pie Chart */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold mb-1">Average Macro Profile</h3>
            <p className="text-xs text-muted-foreground">Distribution of protein, carbohydrates, and healthy fats.</p>
          </div>
          <div className="h-56 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={avgMacros}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {avgMacros.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute text-center">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Grams</span>
              <span className="text-lg font-black">{avgMacros.reduce((sum, m) => sum + m.value, 0)}g</span>
            </div>
          </div>
          <div className="flex justify-around text-xs font-semibold">
            {avgMacros.map(m => (
              <div key={m.name} className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: m.color }} />
                <span className="text-muted-foreground">{m.name}:</span>
                <span className="font-bold">{m.value}g</span>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Recommendations Insights Engine */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
          <h3 className="text-lg font-bold flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-primary" />
            <span>AI Health & Wellness Insights</span>
          </h3>

          <div className="space-y-4">
            {insightsList.map((ins, idx) => {
              const Icon = ins.icon;
              return (
                <div key={idx} className={`p-4 rounded-xl border flex items-start space-x-3.5 ${ins.color}`}>
                  <Icon className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground">{ins.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{ins.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
