'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  age: z.number().min(1).optional(),
  gender: z.string().optional(),
  height: z.number().min(50).max(300).optional(),
  weight: z.number().min(20).max(500).optional(),
  fitnessLevel: z.string().optional(),
  activityLevel: z.string().optional(),
});

export async function registerUser(formData: {
  name: string;
  email: string;
  password: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  fitnessLevel?: string;
  activityLevel?: string;
}) {
  try {
    const validatedData = registerSchema.parse(formData);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return { success: false, error: 'Email already registered' };
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(validatedData.password, saltRounds);

    await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        passwordHash,
        profile: {
          create: {
            age: validatedData.age,
            gender: validatedData.gender,
            height: validatedData.height,
            weight: validatedData.weight,
            fitnessLevel: validatedData.fitnessLevel,
            activityLevel: validatedData.activityLevel,
          },
        },
      },
    });

    return { success: true, message: 'User registered successfully!' };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Validation error' };
    }
    return { success: false, error: error.message || 'Registration failed' };
  }
}
