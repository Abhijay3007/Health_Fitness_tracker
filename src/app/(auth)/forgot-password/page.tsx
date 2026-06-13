'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/app/actions/auth-actions';
import { Activity, Mail, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tempPassword, setTempPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await resetPassword(email);

      if (!res.success) {
        setError(res.error || 'Failed to request reset');
        setLoading(false);
      } else {
        setSuccess(true);
        setTempPassword(res.tempPassword || '');
        setLoading(false);
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
        <h2 className="text-3xl font-black tracking-tight">Reset password</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Enter your email address to recover your account.
        </p>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="space-y-4">
          <div className="flex items-start space-x-2 p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 text-sm">
            <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Password Reset Simulated!</p>
              <p>An email was mock-sent to <span className="font-semibold text-foreground">{email}</span>.</p>
            </div>
          </div>

          {tempPassword && (
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
              <p className="text-xs font-bold text-primary uppercase tracking-wider">Local Testing Bypass:</p>
              <p className="text-sm text-muted-foreground">
                Since you are in local development, we have updated your password immediately to the temporary credential below:
              </p>
              <div className="flex items-center justify-between p-2 rounded bg-card border border-border">
                <code className="text-sm font-mono font-bold text-foreground select-all">{tempPassword}</code>
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Copy</span>
              </div>
              <p className="text-xs text-muted-foreground">
                You can use this new password to sign in immediately.
              </p>
            </div>
          )}

          <div className="pt-2">
            <Link
              href="/login"
              className="w-full flex items-center justify-center py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/95 transition-colors cursor-pointer text-center text-sm"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/95 focus:outline-none disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Simulating Reset...</span>
              </>
            ) : (
              <span>Request Temp Password</span>
            )}
          </button>
        </form>
      )}

      <p className="text-sm text-center text-muted-foreground mt-4">
        Remember your password?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
