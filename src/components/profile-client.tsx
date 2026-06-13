'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile, exportUserData } from '@/app/actions/profile-actions';
import {
  User,
  Scale,
  Ruler,
  Download,
  Shield,
  Activity,
  CheckCircle2,
  Sparkles,
  Loader2
} from 'lucide-react';

interface ProfileClientProps {
  initialUser: any;
}

export default function ProfileClient({ initialUser }: ProfileClientProps) {
  const router = useRouter();
  
  // Profile form states
  const [name, setName] = useState(initialUser?.name || '');
  const [age, setAge] = useState(initialUser?.profile?.age ? String(initialUser.profile.age) : '');
  const [gender, setGender] = useState(initialUser?.profile?.gender || 'Male');
  const [height, setHeight] = useState(initialUser?.profile?.height ? String(initialUser.profile.height) : '');
  const [weight, setWeight] = useState(initialUser?.profile?.weight ? String(initialUser.profile.weight) : '');
  const [fitnessLevel, setFitnessLevel] = useState(initialUser?.profile?.fitnessLevel || 'Beginner');
  const [activityLevel, setActivityLevel] = useState(initialUser?.profile?.activityLevel || 'Moderate');

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      age: age ? Number(age) : undefined,
      gender,
      height: height ? Number(height) : undefined,
      weight: weight ? Number(weight) : undefined,
      fitnessLevel,
      activityLevel,
      privacy: initialUser?.profile?.privacy || 'private',
    };

    const res = await updateProfile(payload);
    setLoading(false);
    if (res.success) {
      showToast('👤 Profile updated successfully!');
      router.refresh();
    } else {
      alert(res.error || 'Failed to update profile');
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const data = await exportUserData();
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `aurafit_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('📥 Data exported successfully!');
    } catch (err) {
      alert('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-3 p-4 rounded-xl border border-primary/20 bg-card text-foreground shadow-2xl animate-bounce">
          <Sparkles className="h-5 w-5 text-indigo-500 shrink-0" />
          <span className="font-bold text-sm">{toast}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-md shadow-md">
        <div>
          <h1 className="text-3xl font-black tracking-tight leading-tight">Profile Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Update personal metrics and download full historical database backup.
          </p>
        </div>
      </div>

      {/* Main Form & Exporter grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings Form */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
          <h3 className="text-lg font-bold flex items-center">
            <User className="h-5 w-5 mr-2 text-primary" />
            <span>Biometric Parameters</span>
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary focus:outline-none text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Email Address (Read-only)</label>
                <input
                  type="email"
                  disabled
                  value={initialUser?.email || ''}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-muted text-muted-foreground text-sm cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Gender</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Fitness Level</label>
                <select
                  value={fitnessLevel}
                  onChange={e => setFitnessLevel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Activity level</label>
                <select
                  value={activityLevel}
                  onChange={e => setActivityLevel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none"
                >
                  <option value="Sedentary">Sedentary (Little/no exercise)</option>
                  <option value="Light">Lightly Active (1-3 days/week)</option>
                  <option value="Moderate">Moderately Active (3-5 days/week)</option>
                  <option value="Active">Very Active (6-7 days/week)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer text-sm"
            >
              {loading ? 'Saving Changes...' : 'Save Settings'}
            </button>
          </form>
        </div>

        {/* Security & Data Export Panel */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold flex items-center">
              <Shield className="h-5 w-5 mr-2 text-indigo-500" />
              <span>Privacy & Data Controls</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Export your data or review role credentials.</p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-background/50 space-y-3">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Security Level</span>
            <p className="text-sm font-bold flex items-center">
              <CheckCircle2 className="h-4.5 w-4.5 text-primary mr-1.5 shrink-0" />
              <span>Role: {initialUser?.role}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Account created on: {new Date(initialUser?.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Download Backup</span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Export all your logged weight logs, calories macro metrics, custom recipes, habits completions, and achievements badges in a standard JSON format.
            </p>
            <button
              onClick={handleExportData}
              disabled={exporting}
              className="w-full flex items-center justify-center space-x-2 py-3 border border-border hover:bg-muted font-bold rounded-xl text-sm transition-colors cursor-pointer"
            >
              {exporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Preparing package...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 text-primary" />
                  <span>Export All Data (JSON)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
