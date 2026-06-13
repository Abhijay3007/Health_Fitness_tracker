'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateUserRole } from '@/app/actions/admin-actions';
import {
  ShieldAlert,
  Users,
  Dumbbell,
  Apple,
  Search,
  CheckCircle,
  TrendingUp,
  UserCheck,
  UserX,
  Sparkles,
  Loader2
} from 'lucide-react';

interface AdminClientProps {
  stats: any;
  initialUsers: any[];
}

export default function AdminClient({ stats, initialUsers }: AdminClientProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`Are you sure you want to change this user role to ${nextRole}?`)) return;

    setUpdatingUserId(userId);
    const res = await updateUserRole(userId, nextRole);
    setUpdatingUserId(null);

    if (res.success) {
      // Update local state optimistically
      setUsers(prev => 
        prev.map(u => u.id === userId ? { ...u, role: nextRole } : u)
      );
      showToast(`🛡️ User role successfully updated to ${nextRole}!`);
      router.refresh();
    } else {
      alert(res.error || 'Failed to update user role');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-3 p-4 rounded-xl border border-destructive/20 bg-card text-foreground shadow-2xl animate-bounce">
          <Sparkles className="h-5 w-5 text-destructive shrink-0" />
          <span className="font-bold text-sm">{toast}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-md shadow-md">
        <div>
          <h1 className="text-3xl font-black tracking-tight leading-tight text-destructive">Admin Console</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Overview global statistics, view registered users lists, and assign roles.
          </p>
        </div>
      </div>

      {/* Admin stats dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
            <Users className="h-5 w-5" />
          </div>
          <div className="my-2">
            <h2 className="text-4xl font-black">{stats.totalUsers}</h2>
            <div className="mt-2 flex items-center space-x-1 text-xs text-emerald-500 font-semibold">
              <TrendingUp className="h-4.5 w-4.5" />
              <span>+{stats.growthPercent}% growth rate</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Active Users (7d)</span>
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="my-2">
            <h2 className="text-4xl font-black">{stats.activeUsers}</h2>
            <span className="text-xs text-muted-foreground block mt-2 font-semibold">
              {Math.round((stats.activeUsers / (stats.totalUsers || 1)) * 100)}% of total database
            </span>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Workouts</span>
            <Dumbbell className="h-5 w-5 text-primary" />
          </div>
          <div className="my-2">
            <h2 className="text-4xl font-black">{stats.totalWorkouts}</h2>
            <span className="text-xs text-muted-foreground block mt-2 font-semibold">
              Platform training sessions logged
            </span>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Meals Logged</span>
            <Apple className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="my-2">
            <h2 className="text-4xl font-black">{stats.totalNutritionLogs}</h2>
            <span className="text-xs text-muted-foreground block mt-2 font-semibold">
              Nutrition macro records logged
            </span>
          </div>
        </div>
      </div>

      {/* Users table list */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold">Registered Users database</h3>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search user by name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary focus:outline-none text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground uppercase font-bold">
                <th className="py-3">User</th>
                <th className="py-3">Email</th>
                <th className="py-3">Role status</th>
                <th className="py-3">Joined Date</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id} className="border-b border-border/20 hover:bg-muted/10 font-medium">
                  <td className="py-3.5 flex items-center space-x-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary text-white font-bold text-xs shrink-0">
                      {u.name?.[0].toUpperCase()}
                    </div>
                    <span className="font-bold text-sm text-foreground">{u.name}</span>
                  </td>
                  <td className="py-3.5 font-mono text-muted-foreground">{u.email}</td>
                  <td className="py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border
                      ${u.role === 'ADMIN' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-muted text-muted-foreground border-border'}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  </td>
                  <td className="py-3.5 text-right">
                    {updatingUserId === u.id ? (
                      <Loader2 className="h-4.5 w-4.5 animate-spin text-primary ml-auto" />
                    ) : (
                      <button
                        onClick={() => handleToggleRole(u.id, u.role)}
                        className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer
                          ${u.role === 'ADMIN' 
                            ? 'border-destructive/20 text-destructive hover:bg-destructive/10' 
                            : 'border-primary/20 text-primary hover:bg-primary/10'}`}
                      >
                        {u.role === 'ADMIN' ? (
                          <>
                            <UserX className="h-3.5 w-3.5 mr-1" />
                            <span>Demote</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-3.5 w-3.5 mr-1" />
                            <span>Promote</span>
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
