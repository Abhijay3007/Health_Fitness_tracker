'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().min(1).optional(),
  gender: z.string().optional(),
  height: z.number().min(50).max(300).optional(),
  weight: z.number().min(20).max(500).optional(),
  fitnessLevel: z.string().optional(),
  activityLevel: z.string().optional(),
  privacy: z.string().default('private'),
});

export async function getProfile() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const userId = session.user.id;

  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
    },
  });
}

export async function updateProfile(data: z.infer<typeof profileSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };
  const userId = session.user.id;

  try {
    const validated = profileSchema.parse(data);

    // Update User Name
    await prisma.user.update({
      where: { id: userId },
      data: { name: validated.name },
    });

    // Update or Create Profile
    await prisma.profile.upsert({
      where: { userId },
      update: {
        age: validated.age,
        gender: validated.gender,
        height: validated.height,
        weight: validated.weight,
        fitnessLevel: validated.fitnessLevel,
        activityLevel: validated.activityLevel,
        privacy: validated.privacy,
      },
      create: {
        userId,
        age: validated.age,
        gender: validated.gender,
        height: validated.height,
        weight: validated.weight,
        fitnessLevel: validated.fitnessLevel,
        activityLevel: validated.activityLevel,
        privacy: validated.privacy,
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/profile');
    revalidatePath('/analytics');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update profile' };
  }
}

export async function exportUserData() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const userId = session.user.id;

  // Retrieve EVERYTHING about the user
  const userData = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      workoutLogs: {
        include: {
          sets: {
            include: {
              exercise: true,
            },
          },
        },
      },
      nutritionLogs: {
        include: {
          food: true,
        },
      },
      bodyMetrics: true,
      goals: true,
      habits: {
        include: {
          entries: true,
        },
      },
      achievements: {
        include: {
          achievement: true,
        },
      },
      notifications: true,
    },
  });

  if (!userData) throw new Error('User not found');

  return {
    exportedAt: new Date().toISOString(),
    user: {
      name: userData.name,
      email: userData.email,
      role: userData.role,
      createdAt: userData.createdAt,
    },
    profile: userData.profile,
    workouts: userData.workoutLogs,
    nutrition: userData.nutritionLogs,
    metrics: userData.bodyMetrics,
    goals: userData.goals,
    habits: userData.habits,
    achievements: userData.achievements.map(ua => ua.achievement),
    notifications: userData.notifications,
  };
}
