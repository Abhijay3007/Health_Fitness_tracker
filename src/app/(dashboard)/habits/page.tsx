import { getHabits, getHabitHistory } from '@/app/actions/habit-actions';
import HabitsClient from '@/components/habits-client';

export default async function HabitsPage() {
  const habits = await getHabits();
  const history = await getHabitHistory();

  return (
    <HabitsClient 
      initialHabits={habits} 
      history={history} 
    />
  );
}
