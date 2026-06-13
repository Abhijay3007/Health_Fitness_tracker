'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './providers';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Dumbbell,
  Apple,
  CheckSquare,
  Target,
  Scale,
  TrendingUp,
  User,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  Activity
} from 'lucide-react';

interface SidebarClientProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
  unreadCount: number;
}

export default function SidebarClient({ user, unreadCount }: SidebarClientProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/workouts', label: 'Workouts', icon: Dumbbell },
    { href: '/nutrition', label: 'Nutrition', icon: Apple },
    { href: '/habits', label: 'Habits', icon: CheckSquare },
    { href: '/goals', label: 'Goals', icon: Target },
    { href: '/metrics', label: 'Body Metrics', icon: Scale },
    { href: '/analytics', label: 'Analytics', icon: TrendingUp },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const isAdmin = user.role === 'ADMIN';

  const toggleMobileMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="flex items-center justify-between lg:hidden bg-card border-b border-border px-4 py-3 sticky top-0 z-40 w-full shadow-sm">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            AuraFit
          </span>
        </Link>
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-card border-r border-border transform lg:transform-none transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen shadow-lg lg:shadow-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="hidden lg:flex items-center space-x-2 px-6 py-6 border-b border-border">
          <Activity className="h-7 w-7 text-primary" />
          <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            AuraFit
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {links.map(link => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group
                  ${
                    isActive
                      ? 'bg-primary/10 text-primary border-l-4 border-primary pl-3'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
              >
                <Icon
                  className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110
                    ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}
                  `}
                />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group
                ${
                  pathname.startsWith('/admin')
                    ? 'bg-destructive/10 text-destructive border-l-4 border-destructive pl-3'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }
              `}
            >
              <ShieldAlert
                className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110
                  ${pathname.startsWith('/admin') ? 'text-destructive' : 'text-muted-foreground group-hover:text-foreground'}
                `}
              />
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>

        {/* User Footer & Quick Actions */}
        <div className="p-4 border-t border-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary text-white font-bold shrink-0">
                {user.name[0].toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate leading-none mb-1">{user.name}</p>
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md font-mono">
                  {user.role}
                </span>
              </div>
            </div>

            {/* Desktop Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="hidden lg:flex p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors shrink-0"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center justify-center space-x-2 w-full px-4 py-2.5 rounded-lg border border-border hover:bg-muted text-sm font-medium text-destructive transition-colors duration-200 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
