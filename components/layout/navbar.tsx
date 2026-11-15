'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  LayoutDashboard, 
  LineChart, 
  Trophy, 
  CreditCard, 
  ShieldAlert, 
  LogOut, 
  User, 
  Menu, 
  X,
  Sparkles,
  Zap,
  ArrowRight,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
    }
    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setProfile(data);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const navLinks = [
    { label: 'Evaluation Models', href: '/pricing', icon: CreditCard },
    { label: 'Web Terminal', href: '/terminal', icon: LineChart },
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Certificates', href: '/certificate', icon: Award },
    { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { label: 'Payouts', href: '/payouts', icon: TrendingUp },
  ];

  const isAdmin = 
    profile?.role === 'admin' || 
    user?.email?.toLowerCase().includes('admin@propedgebg') ||
    user?.email?.toLowerCase() === 'admin@propedge.demo';

  return (
    <header className="border-b border-[#1b2234] bg-[#06080f]/90 backdrop-blur-xl sticky top-[33px] z-40 transition-all">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* PropEdge Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative flex items-center justify-center">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(139,92,246,0.45)] group-hover:scale-105 transition-transform duration-200">
              {/* Sharp geometric chevron pip icon */}
              <svg 
                className="w-5 h-5 text-white" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="m13 17 5-5-5-5M6 17l5-5-5-5" />
              </svg>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#06080f]" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-slate-100 transition">
                Prop<span className="text-violet-400">Edge</span>
              </span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                PRO
              </span>
            </div>
            <span className="text-[9px] text-slate-400 font-mono tracking-wider uppercase">
              YOUR SKILL IS OUR CAPITAL
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-[#151c2e] text-white border border-[#232f48] shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-violet-400' : 'text-slate-500'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                pathname.startsWith('/admin')
                  ? 'bg-amber-950/40 border border-amber-500/30 text-amber-300'
                  : 'text-amber-400/90 hover:bg-amber-950/30 hover:text-amber-200'
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        {/* User Account Actions - PropEdge Glowing Pill CTA */}
        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2.5 bg-[#0e1422] border border-[#1b2336] rounded-full py-1 px-3.5">
                <div className="h-6 w-6 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-xs font-bold text-violet-300 uppercase">
                  {profile?.full_name?.[0] || user.email?.[0] || 'T'}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                    {profile?.full_name || user.email?.split('@')[0]}
                  </span>
                </div>
                {isAdmin && (
                  <Badge variant="warning" className="text-[9px] px-1 py-0 uppercase">
                    Admin
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 h-8 w-8 p-0 rounded-full"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-slate-300 hover:text-white font-semibold text-xs px-4"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/pricing">
                <Button 
                  size="sm" 
                  className="rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs px-5 shadow-[0_0_20px_rgba(139,92,246,0.35)] border border-violet-400/30 active:scale-95 transition"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1.5 text-violet-200" />
                  Buy Challenge
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#1b2234] bg-[#070a14]/98 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-150 backdrop-blur-xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-semibold ${
                  isActive
                    ? 'bg-violet-600/15 text-violet-300 border border-violet-500/30'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-semibold text-amber-300 bg-amber-950/40 border border-amber-500/30"
            >
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <span>Admin Panel</span>
            </Link>
          )}

          <div className="pt-4 border-t border-[#1b2234]">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 px-3 py-1">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-200">{user.email}</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-center text-rose-400 border-rose-500/30 hover:bg-rose-950/30 rounded-xl"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full rounded-xl">
                    Sign In
                  </Button>
                </Link>
                <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 shadow-[0_0_20px_rgba(139,92,246,0.35)]">
                    Buy Challenge
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
