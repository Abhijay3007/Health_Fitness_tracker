import { getDashboardData } from '@/app/actions/dashboard-actions';
import { getFoods } from '@/app/actions/nutrition-actions';
import { getExercises } from '@/app/actions/workout-actions';
import DashboardClient from '@/components/dashboard-client';

export default async function DashboardPage() {
  const data = await getDashboardData();
  const foods = await getFoods();
  const exercises = await getExercises();

  return (
    <DashboardClient 
      initialData={data} 
      foods={foods} 
      exercises={exercises} 
    />
  );
}
