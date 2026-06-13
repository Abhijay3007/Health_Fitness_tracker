'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const goalSchema = z.object({
  title: z.string().min(3, 'Goal title must be at least 3 characters'),
  type: z.enum(['WEIGHT', 'WORKOUT_COUNT', 'NUTRITION_CALORIES', 'HABIT_STREAK']),
  targetValue: z.number().min(0.1, 'Target must be positive'),
  endDate: z.string().optional(),
});

export async function getGoals() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  return prisma.goal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createGoal(data: z.infer<typeof goalSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };
  const userId = session.user.id;

  try {
    const validated = goalSchema.parse(data);

    let startValue = 0;
    let currentValue = 0;

    // Pre-fill starting weights/values
    if (validated.type === 'WEIGHT') {
      const profile = await prisma.profile.findUnique({ where: { userId } });
      startValue = profile?.weight || 0;
      currentValue = startValue;
    } else if (validated.type === 'WORKOUT_COUNT') {
      const count = await prisma.workoutLog.count({ where: { userId } });
      startValue = count;
      currentValue = count;
    } else if (validated.type === 'HABIT_STREAK') {
      const habits = await prisma.habit.findMany({ where: { userId } });
      const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);
      startValue = maxStreak;
      currentValue = maxStreak;
    }

    const goal = await prisma.goal.create({
      data: {
        userId,
        title: validated.title,
        type: validated.type,
        startValue,
        currentValue,
        targetValue: validated.targetValue,
        endDate: validated.endDate ? new Date(validated.endDate) : null,
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/goals');

    return { success: true, goal };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create goal' };
  }
}

export async function updateGoalProgress(goalId: string, value: number) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  try {
    const goal = await prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal || goal.userId !== session.user.id) {
      return { success: false, error: 'Goal not found' };
    }

    const isCompleted = value >= goal.targetValue;

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        currentValue: value,
        status: isCompleted ? 'COMPLETED' : 'ACTIVE',
        endDate: isCompleted ? new Date() : undefined,
      },
    });

    // If completed, check for achievement
    let achievementUnlocked = null;
    if (isCompleted && goal.status !== 'COMPLETED') {
      const goalGetter = await prisma.achievement.findUnique({
        where: { requirementCode: 'GOAL_REACHED' },
      });

      if (goalGetter) {
        const alreadyHas = await prisma.userAchievement.findUnique({
          where: { userId_achievementId: { userId: session.user.id, achievementId: goalGetter.id } },
        });

        if (!alreadyHas) {
          await prisma.userAchievement.create({
            data: { userId: session.user.id, achievementId: goalGetter.id },
          });
          achievementUnlocked = goalGetter.name;

          await prisma.notification.create({
            data: {
              userId: session.user.id,
              title: 'Achievement Unlocked!',
              message: `You've unlocked the "${goalGetter.name}" badge for completing your goal: "${goal.title}"!`,
              type: 'ACHIEVEMENT',
            },
          });
        }
      }
    }

    revalidatePath('/dashboard');
    revalidatePath('/goals');

    return { success: true, goal: updatedGoal, achievementUnlocked };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update goal' };
  }
}
