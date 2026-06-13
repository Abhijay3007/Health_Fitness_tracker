import { getExercises, getWorkoutLogs } from '@/app/actions/workout-actions';
import { auth } from '@/auth';
import WorkoutsClient from '@/components/workouts-client';

export default async function WorkoutsPage() {
  const exercises = await getExercises();
  const logs = await getWorkoutLogs();
  const session = await auth();
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  return (
    <WorkoutsClient 
      exercises={exercises} 
      initialLogs={logs} 
      isAdmin={isAdmin} 
    />
  );
}
