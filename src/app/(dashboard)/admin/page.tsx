import { getAdminStats, getUsersList } from '@/app/actions/admin-actions';
import AdminClient from '@/components/admin-client';

export default async function AdminPage() {
  const stats = await getAdminStats();
  const users = await getUsersList();

  return (
    <AdminClient 
      stats={stats} 
      initialUsers={users} 
    />
  );
}
