import { PrismaClient, Role, MealType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Reset database tables to ensure idempotency
  await prisma.userAchievement.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.setLog.deleteMany({});
  await prisma.workoutLog.deleteMany({});
  await prisma.nutritionLog.deleteMany({});
  await prisma.habitEntry.deleteMany({});
  await prisma.habit.deleteMany({});
  await prisma.goal.deleteMany({});
  await prisma.bodyMetric.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.food.deleteMany({});
  await prisma.exercise.deleteMany({});

  // 1. Create achievements
  const achievements = [
    {
      name: 'First Workout',
      description: 'Logged your very first workout session. Keep it up!',
      requirementCode: 'FIRST_WORKOUT',
      points: 10,
      badgeUrl: '/badges/first-workout.svg',
    },
    {
      name: '7-Day Streak',
      description: 'Completed your daily habits 7 days in a row.',
      requirementCode: 'STREAK_7',
      points: 30,
      badgeUrl: '/badges/streak-7.svg',
    },
    {
      name: '30-Day Streak',
      description: 'Completed your daily habits 30 days in a row. Incredible dedication!',
      requirementCode: 'STREAK_30',
      points: 100,
      badgeUrl: '/badges/streak-30.svg',
    },
    {
      name: 'Century Club',
      description: 'Logged 100 workouts on the platform.',
      requirementCode: 'WORKOUTS_100',
      points: 150,
      badgeUrl: '/badges/workouts-100.svg',
    },
    {
      name: 'Goal Getter',
      description: 'Successfully reached one of your fitness goals.',
      requirementCode: 'GOAL_REACHED',
      points: 50,
      badgeUrl: '/badges/goal-reached.svg',
    },
  ];

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { requirementCode: ach.requirementCode },
      update: ach,
      create: ach,
    });
  }
  console.log('Achievements seeded.');

  // 2. Create exercises
  const exercises = [
    {
      name: 'Bench Press',
      category: 'Strength',
      muscleGroup: 'Chest',
      difficulty: 'Intermediate',
      instructions: 'Lay flat on a bench, grip the barbell slightly wider than shoulder-width, lower the bar to your chest, then push it back up lock-out.',
      imageUrl: '/exercises/bench-press.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3ps',
    },
    {
      name: 'Barbell Back Squat',
      category: 'Strength',
      muscleGroup: 'Legs',
      difficulty: 'Intermediate',
      instructions: 'Rest barbell on your upper back, stand with feet shoulder-width apart, bend knees and hips to lower your body until thighs are parallel to floor, then drive back up.',
      imageUrl: '/exercises/squat.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=ultWZbUMsg8',
    },
    {
      name: 'Deadlift',
      category: 'Strength',
      muscleGroup: 'Back',
      difficulty: 'Advanced',
      instructions: 'Stand with mid-foot under barbell, bend over and grab bar with shoulder-width grip, bend knees until shins touch bar, lift chest, pull bar up keeping back flat.',
      imageUrl: '/exercises/deadlift.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
    },
    {
      name: 'Push-Ups',
      category: 'Strength',
      muscleGroup: 'Chest',
      difficulty: 'Beginner',
      instructions: 'Place hands slightly wider than shoulders, extend legs back, lower chest to floor keeping body straight, push back up.',
      imageUrl: '/exercises/pushups.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
    },
    {
      name: 'Pull-Ups',
      category: 'Strength',
      muscleGroup: 'Back',
      difficulty: 'Intermediate',
      instructions: 'Grab pull-up bar with overhand grip, hang with arms straight, pull your body up until chin clears bar, lower control.',
      imageUrl: '/exercises/pullups.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
    },
    {
      name: 'Overhead Press',
      category: 'Strength',
      muscleGroup: 'Shoulders',
      difficulty: 'Intermediate',
      instructions: 'Stand with feet shoulder-width, hold barbell at shoulder height, press bar straight up overhead, lock out elbows.',
      imageUrl: '/exercises/overheadpress.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI',
    },
    {
      name: 'Running',
      category: 'Cardio',
      muscleGroup: 'Legs',
      difficulty: 'Beginner',
      instructions: 'Jog or run at a sustained pace, focusing on breathing and upright posture.',
      imageUrl: '/exercises/running.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=5km38s4eXQ4',
    },
    {
      name: 'Plank',
      category: 'Flexibility',
      muscleGroup: 'Core',
      difficulty: 'Beginner',
      instructions: 'Hold a push-up position but rest weight on forearms rather than hands. Maintain flat back and engaged core.',
      imageUrl: '/exercises/plank.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
    },
  ];

  for (const ex of exercises) {
    await prisma.exercise.upsert({
      where: { name: ex.name },
      update: ex,
      create: ex,
    });
  }
  console.log('Exercises seeded.');

  // 3. Create food database
  const foods = [
    { name: 'Chicken Breast (Cooked)', calories: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: '100g' },
    { name: 'Brown Rice (Cooked)', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, servingSize: '100g' },
    { name: 'Whole Egg (Large)', calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, servingSize: '1 egg' },
    { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, servingSize: '1 medium' },
    { name: 'Rolled Oats (Raw)', calories: 379, protein: 13.5, carbs: 68, fat: 6.5, servingSize: '100g' },
    { name: 'Broccoli (Steamed)', calories: 35, protein: 2.4, carbs: 7, fat: 0.4, servingSize: '100g' },
    { name: 'Salmon Fillet (Grilled)', calories: 206, protein: 22, carbs: 0, fat: 12.3, servingSize: '100g' },
    { name: 'Sweet Potato (Baked)', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, servingSize: '100g' },
    { name: 'Almonds', calories: 579, protein: 21, carbs: 22, fat: 49, servingSize: '100g' },
    { name: 'Whey Protein Powder', calories: 120, protein: 24, carbs: 3, fat: 1.5, servingSize: '1 scoop (30g)' },
    { name: 'Greek Yogurt (Non-Fat)', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, servingSize: '100g' },
    { name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, servingSize: '1 medium' },
  ];

  for (const f of foods) {
    await prisma.food.create({
      data: f,
    });
  }
  console.log('Foods seeded.');

  // 4. Create standard users (Admin and Regular User)
  const saltRounds = 10;
  const adminPasswordHash = await bcrypt.hash('Admin@123', saltRounds);
  const userPasswordHash = await bcrypt.hash('User@123', saltRounds);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@tracker.com' },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: 'admin@tracker.com',
      name: 'Admin Trainer',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      profile: {
        create: {
          age: 30,
          gender: 'Male',
          height: 180,
          weight: 85,
          fitnessLevel: 'Advanced',
          activityLevel: 'Active',
        },
      },
    },
  });

  const normalUser = await prisma.user.upsert({
    where: { email: 'user@tracker.com' },
    update: { passwordHash: userPasswordHash },
    create: {
      email: 'user@tracker.com',
      name: 'Jane Doe',
      passwordHash: userPasswordHash,
      role: Role.USER,
      profile: {
        create: {
          age: 26,
          gender: 'Female',
          height: 165,
          weight: 62,
          fitnessLevel: 'Intermediate',
          activityLevel: 'Moderate',
        },
      },
    },
  });

  const googleUser = await prisma.user.upsert({
    where: { email: 'google@tracker.com' },
    update: { passwordHash: userPasswordHash },
    create: {
      email: 'google@tracker.com',
      name: 'Google Athlete',
      passwordHash: userPasswordHash,
      role: Role.USER,
      profile: {
        create: {
          age: 28,
          gender: 'Male',
          height: 175,
          weight: 75,
          fitnessLevel: 'Intermediate',
          activityLevel: 'Active',
        },
      },
    },
  });

  console.log('Test users created:');
  console.log(`- Admin: admin@tracker.com / Admin@123`);
  console.log(`- User: user@tracker.com / User@123`);
  console.log(`- Google Mock: google@tracker.com / User@123`);

  // 5. Create some sample goals, habits, metrics, and logs for the regular user to populate dashboard
  const today = new Date();
  
  // Body Metrics
  await prisma.bodyMetric.createMany({
    data: [
      { userId: normalUser.id, date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), weight: 63.5, bmi: 23.3, bodyFatPercent: 22 },
      { userId: normalUser.id, date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000), weight: 62.8, bmi: 23.1, bodyFatPercent: 21.6 },
      { userId: normalUser.id, date: today, weight: 62.0, bmi: 22.8, bodyFatPercent: 21.2 },
    ]
  });

  // Goals
  await prisma.goal.createMany({
    data: [
      { userId: normalUser.id, title: 'Lose 3 kg', type: 'WEIGHT', startValue: 65, currentValue: 62, targetValue: 62, status: 'COMPLETED', endDate: today },
      { userId: normalUser.id, title: 'Drink 3L water daily', type: 'HABIT_STREAK', startValue: 0, currentValue: 8, targetValue: 30, status: 'ACTIVE' },
      { userId: normalUser.id, title: 'Build Muscle', type: 'WEIGHT', startValue: 62, currentValue: 62, targetValue: 64, status: 'ACTIVE' },
    ]
  });

  // Habits
  const waterHabit = await prisma.habit.create({
    data: { userId: normalUser.id, name: 'Drink 3L water', frequency: 'daily', streak: 5, maxStreak: 10 }
  });
  const stepsHabit = await prisma.habit.create({
    data: { userId: normalUser.id, name: 'Walk 10,000 steps', frequency: 'daily', streak: 3, maxStreak: 5 }
  });

  // Habit entries (last few days)
  for (let i = 1; i <= 5; i++) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    // strip time
    d.setUTCHours(0, 0, 0, 0);
    await prisma.habitEntry.create({
      data: { habitId: waterHabit.id, date: d, completed: true }
    });
    if (i <= 3) {
      await prisma.habitEntry.create({
        data: { habitId: stepsHabit.id, date: d, completed: true }
      });
    }
  }

  // Workouts & Logs
  const excList = await prisma.exercise.findMany();
  const bp = excList.find(e => e.name === 'Bench Press');
  const sq = excList.find(e => e.name === 'Barbell Back Squat');

  if (bp && sq) {
    const workoutLog = await prisma.workoutLog.create({
      data: {
        userId: normalUser.id,
        date: new Date(today.getTime() - 24 * 60 * 60 * 1000), // yesterday
        durationMinutes: 45,
        caloriesBurned: 320,
        notes: 'Great workout, felt strong on squats.',
      }
    });

    await prisma.setLog.createMany({
      data: [
        { workoutLogId: workoutLog.id, exerciseId: bp.id, setNumber: 1, reps: 10, weight: 40, restSeconds: 60, rpe: 8 },
        { workoutLogId: workoutLog.id, exerciseId: bp.id, setNumber: 2, reps: 8, weight: 45, restSeconds: 60, rpe: 9 },
        { workoutLogId: workoutLog.id, exerciseId: sq.id, setNumber: 1, reps: 10, weight: 50, restSeconds: 90, rpe: 7 },
        { workoutLogId: workoutLog.id, exerciseId: sq.id, setNumber: 2, reps: 10, weight: 60, restSeconds: 90, rpe: 8 },
      ]
    });

    // Award first workout achievement
    const firstWorkoutAch = await prisma.achievement.findUnique({ where: { requirementCode: 'FIRST_WORKOUT' } });
    if (firstWorkoutAch) {
      await prisma.userAchievement.create({
        data: {
          userId: normalUser.id,
          achievementId: firstWorkoutAch.id,
        }
      });
    }
  }

  // Nutrition Logs (Today)
  const chicken = await prisma.food.findFirst({ where: { name: { contains: 'Chicken' } } });
  const rice = await prisma.food.findFirst({ where: { name: { contains: 'Rice' } } });
  const egg = await prisma.food.findFirst({ where: { name: { contains: 'Egg' } } });

  if (chicken && rice && egg) {
    await prisma.nutritionLog.createMany({
      data: [
        {
          userId: normalUser.id,
          date: today,
          mealType: MealType.BREAKFAST,
          foodId: egg.id,
          servings: 2,
          calories: egg.calories * 2,
          protein: egg.protein * 2,
          carbs: egg.carbs * 2,
          fat: egg.fat * 2,
        },
        {
          userId: normalUser.id,
          date: today,
          mealType: MealType.LUNCH,
          foodId: chicken.id,
          servings: 1.5, // 150g
          calories: chicken.calories * 1.5,
          protein: chicken.protein * 1.5,
          carbs: chicken.carbs * 1.5,
          fat: chicken.fat * 1.5,
        },
        {
          userId: normalUser.id,
          date: today,
          mealType: MealType.LUNCH,
          foodId: rice.id,
          servings: 2, // 200g
          calories: rice.calories * 2,
          protein: rice.protein * 2,
          carbs: rice.carbs * 2,
          fat: rice.fat * 2,
        },
      ]
    });
  }

  console.log('Seed logs, metrics, goals, and habits created successfully.');
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
