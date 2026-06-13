'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/app/actions/auth-actions';
import { Activity, Mail, Lock, User, Scale, Ruler, Award, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('Beginner');
  const [activityLevel, setActivityLevel] = useState('Moderate');

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all account fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      name,
      email,
      password,
      age: age ? Number(age) : undefined,
      gender,
      height: height ? Number(height) : undefined,
      weight: weight ? Number(weight) : undefined,
      fitnessLevel,
      activityLevel,
    };

    try {
      const res = await registerUser(payload);

      if (!res.success) {
        setError(res.error || 'Registration failed');
        setLoading(false);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
        <Link href="/" className="flex items-center space-x-2 mb-8 lg:hidden">
          <Activity className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            AuraFit
          </span>
        </Link>
        <h2 className="text-3xl font-black tracking-tight">Create your account</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Step {step} of 2: {step === 1 ? 'Credentials' : 'Fitness Profile'}
        </p>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm animate-pulse">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-2 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-primary text-sm">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>Registration successful! Redirecting to login...</span>
        </div>
      )}

      {!success && step === 1 && (
        <form onSubmit={handleNextStep} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="•••••••• (min 6 characters)"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/95 focus:outline-none transition-colors cursor-pointer"
          >
            Continue to Profile
          </button>
        </form>
      )}

      {!success && step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Age</label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="25"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gender</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Height (cm)</label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="number"
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                  placeholder="175"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Weight (kg)</label>
              <div className="relative">
                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="number"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  placeholder="70"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Activity Level</label>
            <select
              value={activityLevel}
              onChange={e => setActivityLevel(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="Sedentary">Sedentary (Little/no exercise)</option>
              <option value="Light">Lightly Active (1-3 days/week)</option>
              <option value="Moderate">Moderately Active (3-5 days/week)</option>
              <option value="Active">Very Active (6-7 days/week)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fitness Level</label>
            <select
              value={fitnessLevel}
              onChange={e => setFitnessLevel(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="Beginner">Beginner (Just starting)</option>
              <option value="Intermediate">Intermediate (Consistent training)</option>
              <option value="Advanced">Advanced (Experienced athlete)</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-1/3 py-3 rounded-lg border border-border hover:bg-muted font-medium transition-colors cursor-pointer"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 flex items-center justify-center space-x-2 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/95 focus:outline-none disabled:opacity-50 transition-colors cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Register</span>
              )}
            </button>
          </div>
        </form>
      )}

      <p className="text-sm text-center text-muted-foreground mt-4">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
