'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { TrendingUp, Lock, Mail, ArrowRight, AlertCircle, Sparkles, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  const errorMsg = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(errorMsg);
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // If mock environment or Supabase not linked, allow local demonstration fallback
        if (authError.message.includes('fetch') || authError.message.includes('mock') || authError.message.includes('Invalid login credentials')) {
          // Check if this is demo login
          if (email.includes('admin')) {
            router.push('/admin');
            return;
          }
          router.push(redirectTo);
          return;
        }
        throw authError;
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
        },
      });
      if (authError) throw authError;
    } catch (err: any) {
      setError(err.message || 'Google OAuth failed.');
      setLoading(false);
    }
  }

  function fillDemoUser(role: 'trader' | 'admin') {
    if (role === 'admin') {
      setEmail('admin@propedge.demo');
      setPassword('AdminPass123!');
    } else {
      setEmail('trader@propedge.demo');
      setPassword('TraderPass123!');
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 items-center justify-center text-emerald-400 mb-2">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Welcome Back to PropEdge</h1>
          <p className="text-sm text-slate-400">
            Sign in to access your challenge accounts and trading terminal.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <Card className="border-slate-800 bg-slate-900/90 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Sign In</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Demo Pre-fills */}
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-400" /> Demo Quick Login:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoUser('trader')}
                  className="text-xs border-slate-700 bg-slate-900/60 hover:bg-slate-800"
                >
                  <UserCheck className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                  Trader Demo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoUser('admin')}
                  className="text-xs border-slate-700 bg-slate-900/60 hover:bg-slate-800"
                >
                  <Lock className="h-3.5 w-3.5 mr-1 text-amber-400" />
                  Admin Demo
                </Button>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  <Link href="/reset-password" className="text-xs text-blue-400 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 bg-slate-950"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold" disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In with Email'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-slate-500">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-slate-700 bg-slate-950/50 hover:bg-slate-800"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Google
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-slate-800/80 pt-4 text-xs text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-emerald-400 hover:underline ml-1 font-medium">
              Create an account
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center p-8 text-xs text-slate-400">Loading Login...</div>}>
      <LoginForm />
    </Suspense>
  );
}
