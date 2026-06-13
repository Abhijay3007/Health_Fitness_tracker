'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const workoutLogSchema = z.object({
  durationMinutes: z.number().min(1, 'Duration must be at least 1 minute'),
  caloriesBurned: z.number().min(0, 'Calories cannot be negative'),
  notes: z.string().optional(),
  date: z.string().or(z.date()).optional(),
  sets: z.array(z.object({
    exerciseId: z.string(),
    reps: z.number().min(1),
    weight: z.number().min(0),
    restSeconds: z.number().optional(),
    rpe: z.number().min(1).max(10).optional(),
  })).min(1, 'Log must contain at least one exercise set'),
});

const exerciseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  category: z.string().min(2, 'Category must be at least 2 characters'),
  muscleGroup: z.string().min(2, 'Muscle group must be at least 2 characters'),
  difficulty: z.string(),
  instructions: z.string().min(10, 'Instructions must be at least 10 characters'),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
});

export async function getExercises() {
  return prisma.exercise.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function getWorkoutLogs() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  return prisma.workoutLog.findMany({
    where: { userId: session.user.id },
    include: {
      sets: {
        include: {
          exercise: true,
        },
      },
    },
    orderBy: { date: 'desc' },
  });
}

export async function logWorkout(data: z.infer<typeof workoutLogSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };
  const userId = session.user.id;

  try {
    const validated = workoutLogSchema.parse(data);

    // Create Workout Log and Set Logs
    const log = await prisma.workoutLog.create({
      data: {
        userId,
        date: validated.date ? new Date(validated.date) : new Date(),
        durationMinutes: validated.durationMinutes,
        caloriesBurned: validated.caloriesBurned,
        notes: validated.notes,
        sets: {
          create: validated.sets.map((set, idx) => ({
            exerciseId: set.exerciseId,
            setNumber: idx + 1,
            reps: set.reps,
            weight: set.weight,
            restSeconds: set.restSeconds,
            rpe: set.rpe,
          })),
        },
      },
    });

    // Award Achievements logic
    const totalLogs = await prisma.workoutLog.count({ where: { userId } });
    let achievementUnlocked = null;

    if (totalLogs === 1) {
      const firstWorkout = await prisma.achievement.findUnique({
        where: { requirementCode: 'FIRST_WORKOUT' },
      });
      if (firstWorkout) {
        await prisma.userAchievement.upsert({
          where: { userId_achievementId: { userId, achievementId: firstWorkout.id } },
          update: {},
          create: { userId, achievementId: firstWorkout.id },
        });
        achievementUnlocked = firstWorkout.name;
        
        // Create notification
        await prisma.notification.create({
          data: {
            userId,
            title: 'Achievement Unlocked!',
            message: `You've unlocked the "${firstWorkout.name}" badge!`,
            type: 'ACHIEVEMENT',
          },
        });
      }
    } else if (totalLogs === 100) {
      const centuryClub = await prisma.achievement.findUnique({
        where: { requirementCode: 'WORKOUTS_100' },
      });
      if (centuryClub) {
        await prisma.userAchievement.upsert({
          where: { userId_achievementId: { userId, achievementId: centuryClub.id } },
          update: {},
          create: { userId, achievementId: centuryClub.id },
        });
        achievementUnlocked = centuryClub.name;

        await prisma.notification.create({
          data: {
            userId,
            title: 'Achievement Unlocked!',
            message: `You've unlocked the "${centuryClub.name}" badge for logging 100 workouts!`,
            type: 'ACHIEVEMENT',
          },
        });
      }
    }

    revalidatePath('/dashboard');
    revalidatePath('/workouts');
    revalidatePath('/analytics');

    return { success: true, logId: log.id, achievementUnlocked };
  } catch (error: any) {
    console.error('Error logging workout:', error);
    return { success: false, error: error.message || 'Failed to log workout' };
  }
}

export async function createExercise(data: z.infer<typeof exerciseSchema>) {
  const session = await auth();
  const isAdmin = (session?.user as any)?.role === 'ADMIN';
  if (!isAdmin) return { success: false, error: 'Forbidden: Admins only' };

  try {
    const validated = exerciseSchema.parse(data);

    const exercise = await prisma.exercise.create({
      data: validated,
    });

    revalidatePath('/admin');
    revalidatePath('/workouts');

    return { success: true, exercise };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create exercise' };
  }
}
