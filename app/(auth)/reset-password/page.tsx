'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
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
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
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
    <div className="flex-1 flex items-center justify-center p-4 py-16 bg-[#06080f] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.15),transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 items-center justify-center text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] mb-2">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m13 17 5-5-5-5M6 17l5-5-5-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Reset Password</h1>
          <p className="text-sm text-slate-400">
            Enter your email to receive a secure recovery link.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start space-x-2">
            <AlertCircle className="h-4.5 w-4.5 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {sent ? (
          <Card className="border-[#1b2234] bg-gradient-to-b from-[#0e1424] to-[#090d18] text-center rounded-2xl">
            <CardHeader className="space-y-2 pb-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg text-white">Check Your Email</CardTitle>
              <CardDescription className="text-xs text-slate-300">
                We have dispatched a recovery link to <strong className="text-white">{email}</strong>.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center border-t border-[#1b2234] pt-4">
              <Link href="/login" className="text-sm text-violet-400 hover:text-violet-300 flex items-center font-medium transition">
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Sign In
              </Link>
            </CardFooter>
          </Card>
        ) : (
          <Card className="border-[#1b2234] bg-gradient-to-b from-[#0e1424] to-[#090d18] shadow-2xl rounded-2xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-base font-bold text-white">Request Reset Link</CardTitle>
              <CardDescription className="text-xs text-slate-400">Enter your registered email address</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Email Address</label>
                  <div className="relative">
                    <Mail className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-500" />
                    <Input
                      type="email"
                      placeholder="trader@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  size="lg"
                  className="w-full rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.4)] border border-violet-400/30"
                  disabled={loading}
                >
                  {loading ? 'Sending link...' : 'Send Recovery Link'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t border-[#1b2234] pt-4 text-xs text-slate-400">
              <Link href="/login" className="text-violet-400 hover:text-violet-300 flex items-center font-medium transition">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Sign In
              </Link>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
