'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TrendingUp, Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12 bg-[#0b0f17]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 items-center justify-center text-emerald-400 mb-2">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Set New Password</h1>
          <p className="text-sm text-slate-400">
            Enter your new secure password to regain access to your account.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <Card className="border-slate-800 bg-slate-900/90 shadow-xl text-center">
            <CardHeader className="space-y-2 pb-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg text-white">Password Updated</CardTitle>
              <CardDescription>
                Your password has been changed successfully. Redirecting you to your dashboard...
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Card className="border-slate-800 bg-slate-900/90 shadow-xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-lg text-white">New Password</CardTitle>
              <CardDescription>Choose a strong password with at least 6 characters</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300">New Password</label>
                  <div className="relative">
                    <Lock className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
                    <Input
                      type="password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 bg-slate-950 border-slate-800 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300">Confirm Password</label>
                  <div className="relative">
                    <Lock className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
                    <Input
                      type="password"
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-9 bg-slate-950 border-slate-800 text-white"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold" 
                  disabled={loading}
                >
                  {loading ? 'Updating Password...' : 'Save Password & Continue'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t border-slate-800/80 pt-4 text-xs text-slate-500">
              <Link href="/login" className="hover:text-slate-300 transition">
                Cancel and return to sign in
              </Link>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}

