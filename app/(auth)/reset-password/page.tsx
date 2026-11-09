'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-xl bg-blue-600/20 border border-blue-500/30 items-center justify-center text-blue-400 mb-2">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Reset Password</h1>
          <p className="text-sm text-slate-400">
            Enter your email to receive a password recovery link.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {sent ? (
          <Card className="border-slate-800 bg-slate-900/90 shadow-xl text-center">
            <CardHeader className="space-y-2 pb-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg">Check Your Email</CardTitle>
              <CardDescription>
                We have dispatched a password reset link to <strong className="text-white">{email}</strong>.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center border-t border-slate-800/80 pt-4">
              <Link href="/login" className="text-sm text-blue-400 hover:underline flex items-center">
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Sign In
              </Link>
            </CardFooter>
          </Card>
        ) : (
          <Card className="border-slate-800 bg-slate-900/90 shadow-xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-lg">Request Reset Link</CardTitle>
              <CardDescription>Enter your registered email address</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300">Email Address</label>
                  <div className="relative">
                    <Mail className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
                    <Input
                      type="email"
                      placeholder="trader@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 bg-slate-950"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500" disabled={loading}>
                  {loading ? 'Sending link...' : 'Send Reset Link'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t border-slate-800/80 pt-4 text-xs text-slate-400">
              <Link href="/login" className="text-blue-400 hover:underline flex items-center">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Sign In
              </Link>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
