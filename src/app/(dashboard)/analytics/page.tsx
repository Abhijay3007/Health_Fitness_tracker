import { getWorkoutLogs } from '@/app/actions/workout-actions';
import { getNutritionLogs } from '@/app/actions/nutrition-actions';
import { getBodyMetrics } from '@/app/actions/metric-actions';
import { getHabits } from '@/app/actions/habit-actions';
import AnalyticsClient from '@/components/analytics-client';

export default async function AnalyticsPage() {
  const workouts = await getWorkoutLogs();
  // Fetch nutrition logs for the last 7 days for charting
  const nutrition = await getNutritionLogs(); 
  const metrics = await getBodyMetrics();
  const habits = await getHabits();

  return (
    <AnalyticsClient 
      workouts={workouts} 
      nutrition={nutrition} 
      metrics={metrics} 
      habits={habits} 
    />
  );
}
