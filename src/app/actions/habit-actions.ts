'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const habitSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  frequency: z.string().default('daily'),
});

export async function getHabits() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const userId = session.user.id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const habits = await prisma.habit.findMany({
    where: { userId },
    include: {
      entries: {
        where: {
          date: {
            gte: today,
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return habits.map(h => ({
    ...h,
    completedToday: h.entries.length > 0 && h.entries[0].completed,
  }));
}

export async function getHabitHistory() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const userId = session.user.id;

  // Retrieve habits and their entries for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  return prisma.habit.findMany({
    where: { userId },
    include: {
      entries: {
        where: {
          date: {
            gte: thirtyDaysAgo,
          },
        },
        orderBy: { date: 'asc' },
      },
    },
  });
}

export async function createHabit(data: z.infer<typeof habitSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };
  const userId = session.user.id;

  try {
    const validated = habitSchema.parse(data);

    const habit = await prisma.habit.create({
      data: {
        userId,
        name: validated.name,
        frequency: validated.frequency,
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/habits');

    return { success: true, habit };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create habit' };
  }
}

export async function toggleHabit(habitId: string, dateStr?: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };
  const userId = session.user.id;

  const targetDate = dateStr ? new Date(dateStr) : new Date();
  targetDate.setHours(0, 0, 0, 0);

  try {
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
      include: { entries: { where: { date: targetDate } } },
    });

    if (!habit || habit.userId !== userId) {
      return { success: false, error: 'Habit not found or unauthorized' };
    }

    const hasEntry = habit.entries.length > 0;

    if (hasEntry) {
      // Remove completion
      await prisma.habitEntry.delete({
        where: { id: habit.entries[0].id },
      });
    } else {
      // Add completion
      await prisma.habitEntry.create({
        data: {
          habitId,
          date: targetDate,
          completed: true,
        },
      });
    }

    // Recalculate streak
    const allEntries = await prisma.habitEntry.findMany({
      where: { habitId, completed: true },
      orderBy: { date: 'desc' },
    });

    const completedDates = new Set(
      allEntries.map(e => {
        const d = new Date(e.date);
        d.setHours(0, 0, 0, 0);
        return d.toDateString();
      })
    );

    let streak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    // If today is not completed, we check if yesterday is completed to maintain streak
    if (!completedDates.has(checkDate.toDateString())) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (completedDates.has(checkDate.toDateString())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    const newMaxStreak = Math.max(habit.maxStreak, streak);

    await prisma.habit.update({
      where: { id: habitId },
      data: {
        streak,
        maxStreak: newMaxStreak,
      },
    });

    // Check Achievements: 7-day streak or 30-day streak
    let achievementUnlocked = null;
    if (streak >= 7) {
      const s7 = await prisma.achievement.findUnique({ where: { requirementCode: 'STREAK_7' } });
      if (s7) {
        const alreadyHas = await prisma.userAchievement.findUnique({
          where: { userId_achievementId: { userId, achievementId: s7.id } },
        });
        if (!alreadyHas) {
          await prisma.userAchievement.create({
            data: { userId, achievementId: s7.id },
          });
          achievementUnlocked = s7.name;

          await prisma.notification.create({
            data: {
              userId,
              title: 'Achievement Unlocked!',
              message: `You've unlocked the "${s7.name}" badge for completing a habit for 7 consecutive days!`,
              type: 'ACHIEVEMENT',
            },
          });
        }
      }
    }

    if (streak >= 30) {
      const s30 = await prisma.achievement.findUnique({ where: { requirementCode: 'STREAK_30' } });
      if (s30) {
        const alreadyHas = await prisma.userAchievement.findUnique({
          where: { userId_achievementId: { userId, achievementId: s30.id } },
        });
        if (!alreadyHas) {
          await prisma.userAchievement.create({
            data: { userId, achievementId: s30.id },
          });
          achievementUnlocked = s30.name;

          await prisma.notification.create({
            data: {
              userId,
              title: 'Achievement Unlocked!',
              message: `You've unlocked the "${s30.name}" badge for completing a habit for 30 consecutive days!`,
              type: 'ACHIEVEMENT',
            },
          });
        }
      }
    }

    revalidatePath('/dashboard');
    revalidatePath('/habits');
    revalidatePath('/analytics');

    return { success: true, streak, achievementUnlocked };
  } catch (error: any) {
    console.error('Error toggling habit:', error);
    return { success: false, error: error.message || 'Failed to toggle habit' };
  }
}
