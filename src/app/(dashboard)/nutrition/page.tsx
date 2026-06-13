import { getFoods, getNutritionLogs } from '@/app/actions/nutrition-actions';
import NutritionClient from '@/components/nutrition-client';

export default async function NutritionPage() {
  const foods = await getFoods();
  const logs = await getNutritionLogs();

  return (
    <NutritionClient 
      foods={foods} 
      initialLogs={logs} 
    />
  );
}
