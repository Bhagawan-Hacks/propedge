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
  Sparkles
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
    { label: 'Pricing Plans', href: '/pricing', icon: CreditCard },
    { label: 'Terminal', href: '/terminal', icon: LineChart },
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { label: 'Payouts', href: '/payouts', icon: TrendingUp },
  ];

  const isAdmin = profile?.role === 'admin';

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-[29px] z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-all shadow-sm">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              PropEdge
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-emerald-500/30 text-emerald-400 bg-emerald-950/20 font-semibold tracking-wider">
                BETA
              </Badge>
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider">EVALUATION & FUNDED</span>
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
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800/80 text-white font-medium border border-slate-700/60 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/70'
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
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                pathname.startsWith('/admin')
                  ? 'bg-amber-950/40 border border-amber-500/30 text-amber-300'
                  : 'text-amber-400/90 hover:bg-amber-950/30 hover:text-amber-200'
              }`}
            >
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>

        {/* User Account Actions */}
        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-full py-1 px-3">
                <div className="h-6 w-6 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-xs font-bold text-blue-300 uppercase">
                  {profile?.full_name?.[0] || user.email?.[0] || 'T'}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-medium text-slate-200 truncate max-w-[120px]">
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
                className="text-slate-400 hover:text-rose-400 hover:bg-rose-950/20"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white font-medium">
                  Start Challenge
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
            className="text-slate-300"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/98 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-slate-800 text-blue-400'
                    : 'text-slate-300 hover:bg-slate-900'
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
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-amber-300 bg-amber-950/40 border border-amber-500/30"
            >
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <span>Admin Panel</span>
            </Link>
          )}

          <div className="pt-4 border-t border-slate-800">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 px-3 py-1">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-200">{user.email}</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-center text-rose-400 border-rose-500/30 hover:bg-rose-950/30"
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
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-500">
                    Sign Up
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

