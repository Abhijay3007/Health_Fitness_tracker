'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const bodyMetricSchema = z.object({
  weight: z.number().min(20, 'Weight must be at least 20 kg').max(500, 'Weight is too high'),
  bodyFatPercent: z.number().min(2, 'Body fat must be at least 2%').max(80, 'Body fat is too high').optional(),
  chest: z.number().min(20).max(300).optional(),
  waist: z.number().min(20).max(300).optional(),
  hip: z.number().min(20).max(300).optional(),
  arm: z.number().min(5).max(100).optional(),
  thigh: z.number().min(10).max(150).optional(),
  date: z.string().or(z.date()).optional(),
});

export async function getBodyMetrics() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  return prisma.bodyMetric.findMany({
    where: { userId: session.user.id },
    orderBy: { date: 'desc' },
  });
}

export async function logBodyMetric(data: z.infer<typeof bodyMetricSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };
  const userId = session.user.id;

  try {
    const validated = bodyMetricSchema.parse(data);

    // Fetch user profile to get height for BMI calculation
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    let bmi: number | undefined = undefined;
    if (profile?.height) {
      const heightInMeters = profile.height / 100;
      bmi = Number((validated.weight / (heightInMeters * heightInMeters)).toFixed(1));
    }

    const metric = await prisma.bodyMetric.create({
      data: {
        userId,
        date: validated.date ? new Date(validated.date) : new Date(),
        weight: validated.weight,
        bmi,
        bodyFatPercent: validated.bodyFatPercent,
        chest: validated.chest,
        waist: validated.waist,
        hip: validated.hip,
        arm: validated.arm,
        thigh: validated.thigh,
      },
    });

    // Update weight in User Profile
    await prisma.profile.update({
      where: { userId },
      data: {
        weight: validated.weight,
      },
    });

    // Check goals of type WEIGHT
    const goals = await prisma.goal.findMany({
      where: {
        userId,
        type: 'WEIGHT',
        status: 'ACTIVE',
      },
    });

    let goalCompleted = null;
    let achievementUnlocked = null;

    for (const goal of goals) {
      const isLoseGoal = goal.targetValue < goal.startValue;
      let isCompleted = false;

      if (isLoseGoal && validated.weight <= goal.targetValue) {
        isCompleted = true;
      } else if (!isLoseGoal && validated.weight >= goal.targetValue) {
        isCompleted = true;
      }

      await prisma.goal.update({
        where: { id: goal.id },
        data: {
          currentValue: validated.weight,
          status: isCompleted ? 'COMPLETED' : 'ACTIVE',
          endDate: isCompleted ? new Date() : undefined,
        },
      });

      if (isCompleted) {
        goalCompleted = goal.title;

        // Award achievement
        const goalGetter = await prisma.achievement.findUnique({
          where: { requirementCode: 'GOAL_REACHED' },
        });

        if (goalGetter) {
          const alreadyHas = await prisma.userAchievement.findUnique({
            where: { userId_achievementId: { userId, achievementId: goalGetter.id } },
          });

          if (!alreadyHas) {
            await prisma.userAchievement.create({
              data: { userId, achievementId: goalGetter.id },
            });
            achievementUnlocked = goalGetter.name;

            await prisma.notification.create({
              data: {
                userId,
                title: 'Achievement Unlocked!',
                message: `You've unlocked the "${goalGetter.name}" badge for completing your goal: "${goal.title}"!`,
                type: 'ACHIEVEMENT',
              },
            });
          }
        }
      }
    }

    revalidatePath('/dashboard');
    revalidatePath('/goals');
    revalidatePath('/metrics');
    revalidatePath('/analytics');

    return { success: true, metric, goalCompleted, achievementUnlocked };
  } catch (error: any) {
    console.error('Error logging metric:', error);
    return { success: false, error: error.message || 'Failed to log body metrics' };
  }
}
