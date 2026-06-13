'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import { MealType } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const mealLogSchema = z.object({
  foodId: z.string(),
  mealType: z.nativeEnum(MealType),
  servings: z.number().min(0.1, 'Servings must be at least 0.1'),
  date: z.string().or(z.date()).optional(),
});

const customFoodSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  calories: z.number().min(0, 'Calories cannot be negative'),
  protein: z.number().min(0, 'Protein cannot be negative'),
  carbs: z.number().min(0, 'Carbs cannot be negative'),
  fat: z.number().min(0, 'Fat cannot be negative'),
  servingSize: z.string().min(1, 'Serving size is required'),
});

export async function getFoods() {
  const session = await auth();
  const userId = session?.user?.id;

  return prisma.food.findMany({
    where: {
      OR: [
        { isCustom: false },
        { isCustom: true, userId: userId || undefined },
      ],
    },
    orderBy: { name: 'asc' },
  });
}

export async function createCustomFood(data: z.infer<typeof customFoodSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };
  const userId = session.user.id;

  try {
    const validated = customFoodSchema.parse(data);

    const food = await prisma.food.create({
      data: {
        ...validated,
        isCustom: true,
        userId,
      },
    });

    revalidatePath('/nutrition');

    return { success: true, food };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create food' };
  }
}

export async function getNutritionLogs(dateStr?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const targetDate = dateStr ? new Date(dateStr) : new Date();
  
  // Set to start and end of day in UTC/Local depending on context
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  return prisma.nutritionLog.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      food: true,
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function logMeal(data: z.infer<typeof mealLogSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };
  const userId = session.user.id;

  try {
    const validated = mealLogSchema.parse(data);

    const food = await prisma.food.findUnique({
      where: { id: validated.foodId },
    });

    if (!food) return { success: false, error: 'Food item not found' };

    const multiplier = validated.servings;
    const calories = food.calories * multiplier;
    const protein = food.protein * multiplier;
    const carbs = food.carbs * multiplier;
    const fat = food.fat * multiplier;

    const log = await prisma.nutritionLog.create({
      data: {
        userId,
        date: validated.date ? new Date(validated.date) : new Date(),
        mealType: validated.mealType,
        foodId: validated.foodId,
        servings: validated.servings,
        calories,
        protein,
        carbs,
        fat,
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/nutrition');
    revalidatePath('/analytics');

    return { success: true, log };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to log meal' };
  }
}

export async function deleteMeal(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  try {
    const log = await prisma.nutritionLog.findUnique({ where: { id } });
    if (!log || log.userId !== session.user.id) {
      return { success: false, error: 'Unauthorized or meal not found' };
    }

    await prisma.nutritionLog.delete({ where: { id } });

    revalidatePath('/dashboard');
    revalidatePath('/nutrition');
    revalidatePath('/analytics');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete meal' };
  }
}
