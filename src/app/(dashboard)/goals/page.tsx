import { getGoals } from '@/app/actions/goal-actions';
import GoalsClient from '@/components/goals-client';

export default async function GoalsPage() {
  const goals = await getGoals();

  return (
    <GoalsClient 
      initialGoals={goals} 
    />
  );
}
