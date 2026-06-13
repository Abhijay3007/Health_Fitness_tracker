'use server';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';
import prisma from '@/lib/prisma';
import SidebarClient from './sidebar-client';

export default async function Sidebar() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Get unread notification count
  const unreadCount = await prisma.notification.count({
    where: {
      userId: session.user.id,
      read: false,
    },
  });

  return (
    <SidebarClient
      user={{
        name: session.user.name || 'User',
        email: session.user.email || '',
        role: (session.user as any).role || 'USER',
      }}
      unreadCount={unreadCount}
    />
  );
}
