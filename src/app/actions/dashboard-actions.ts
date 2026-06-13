'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function getDashboardData() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const userId = session.user.id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 1. Fetch today's nutrition logs
  const todayMeals = await prisma.nutritionLog.findMany({
    where: {
      userId,
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  const nutritionSummary = todayMeals.reduce(
    (acc, m) => {
      acc.calories += m.calories;
      acc.protein += m.protein;
      acc.carbs += m.carbs;
      acc.fat += m.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // 2. Fetch today's workout logs
  const todayWorkouts = await prisma.workoutLog.findMany({
    where: {
      userId,
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  const workoutSummary = todayWorkouts.reduce(
    (acc, w) => {
      acc.duration += w.durationMinutes;
      acc.caloriesBurned += w.caloriesBurned;
      return acc;
    },
    { duration: 0, caloriesBurned: 0 }
  );

  // 3. Fetch habits and check-ins
  const habits = await prisma.habit.findMany({
    where: { userId },
    include: {
      entries: {
        where: {
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
      },
    },
  });

  const habitSummary = habits.reduce(
    (acc, h) => {
      acc.total += 1;
      if (h.entries.length > 0 && h.entries[0].completed) {
        acc.completed += 1;
      }
      return acc;
    },
    { total: 0, completed: 0 }
  );

  // 4. Get water and steps habits specifically if they exist, or mock them
  const waterHabit = habits.find(h => h.name.toLowerCase().includes('water'));
  const stepsHabit = habits.find(h => h.name.toLowerCase().includes('step') || h.name.toLowerCase().includes('walk'));

  const waterLogged = waterHabit && waterHabit.entries.length > 0 ? 3000 : 0; // in ml, assume 3L if complete
  const stepsLogged = stepsHabit && stepsHabit.entries.length > 0 ? 10000 : 0; // steps, assume 10000 if complete

  // 5. Get recent body weight
  const latestMetric = await prisma.bodyMetric.findFirst({
    where: { userId },
    orderBy: { date: 'desc' },
  });

  // 6. Get active goals
  const activeGoals = await prisma.goal.findMany({
    where: { userId, status: 'ACTIVE' },
    take: 3,
  });

  // 7. Get unlocked achievements
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
    orderBy: { unlockedAt: 'desc' },
    take: 4,
  });

  // 8. Unread notifications count
  const unreadNotificationsCount = await prisma.notification.count({
    where: { userId, read: false },
  });

  return {
    nutrition: {
      calories: Math.round(nutritionSummary.calories),
      protein: Math.round(nutritionSummary.protein),
      carbs: Math.round(nutritionSummary.carbs),
      fat: Math.round(nutritionSummary.fat),
      targetCalories: 2000, // standard recommendation, can be dynamic later
      targetProtein: 150,
      targetCarbs: 220,
      targetFat: 65,
    },
    workout: {
      durationMinutes: workoutSummary.duration,
      caloriesBurned: workoutSummary.caloriesBurned,
      count: todayWorkouts.length,
    },
    habits: {
      total: habitSummary.total,
      completed: habitSummary.completed,
      waterMl: waterLogged,
      steps: stepsLogged,
    },
    weight: latestMetric?.weight || null,
    bmi: latestMetric?.bmi || null,
    activeGoals,
    achievements: userAchievements.map(ua => ua.achievement),
    unreadNotificationsCount,
  };
}
