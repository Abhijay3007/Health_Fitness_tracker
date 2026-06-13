import { getBodyMetrics } from '@/app/actions/metric-actions';
import MetricsClient from '@/components/metrics-client';

export default async function MetricsPage() {
  const metrics = await getBodyMetrics();

  return (
    <MetricsClient 
      initialMetrics={metrics} 
    />
  );
}
