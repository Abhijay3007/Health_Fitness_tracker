'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function getAdminStats() {
  const session = await auth();
  const isAdmin = (session?.user as any)?.role === 'ADMIN';
  if (!isAdmin) throw new Error('Unauthorized');

  // Total users
  const totalUsers = await prisma.user.count();

  // Active users (users who logged a workout or meal in the last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const activeUsers = await prisma.user.count({
    where: {
      OR: [
        {
          workoutLogs: {
            some: {
              date: { gte: sevenDaysAgo },
            },
          },
        },
        {
          nutritionLogs: {
            some: {
              date: { gte: sevenDaysAgo },
            },
          },
        },
      ],
    },
  });

  const totalWorkouts = await prisma.workoutLog.count();
  const totalNutritionLogs = await prisma.nutritionLog.count();

  // Simple growth calculation: users created in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentUsersCount = await prisma.user.count({
    where: {
      createdAt: { gte: thirtyDaysAgo },
    },
  });

  const growthPercent = totalUsers > recentUsersCount 
    ? Math.round((recentUsersCount / (totalUsers - recentUsersCount)) * 100) 
    : 100;

  return {
    totalUsers,
    activeUsers,
    totalWorkouts,
    totalNutritionLogs,
    growthPercent,
  };
}

export async function getUsersList() {
  const session = await auth();
  const isAdmin = (session?.user as any)?.role === 'ADMIN';
  if (!isAdmin) throw new Error('Unauthorized');

  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      profile: {
        select: {
          age: true,
          gender: true,
          weight: true,
          height: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateUserRole(userId: string, role: Role) {
  const session = await auth();
  const isAdmin = (session?.user as any)?.role === 'ADMIN';
  if (!isAdmin) return { success: false, error: 'Unauthorized' };

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update user role' };
  }
}
