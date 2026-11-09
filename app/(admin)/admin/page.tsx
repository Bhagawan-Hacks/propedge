'use client';

import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  Users, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { TradingAccount, Profile, Payout, RuleEvent } from '@/types';

export default function AdminPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [ruleEvents, setRuleEvents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'accounts' | 'payouts' | 'users' | 'audit'>('accounts');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const supabase = createClient();

  async function loadAdminData() {
    setLoading(true);
    try {
      // 1. Accounts
      const { data: accs } = await supabase
        .from('trading_accounts')
        .select('*, profiles(email, full_name), plans(name)')
        .order('created_at', { ascending: false });
      if (accs) setAccounts(accs);

      // 2. Profiles
      const { data: profs } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (profs) setProfiles(profs);

      // 3. Payouts
      const { data: pays } = await supabase
        .from('payouts')
        .select('*, trading_accounts(account_number, user_id)')
        .order('requested_at', { ascending: false });
      if (pays) setPayouts(pays);

      // 4. Rule Events
      const { data: evts } = await supabase
        .from('rule_events')
        .select('*, trading_accounts(account_number)')
        .order('created_at', { ascending: false })
        .limit(50);
      if (evts) setRuleEvents(evts);
    } catch (err) {
      console.warn('Admin load note:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  async function handleAdminAction(action: string, payload: any) {
    setActionLoading(payload.accountId || payload.payoutId || action);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      if (!res.ok) throw new Error('Action failed');
      loadAdminData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  }

  // Filter accounts
  const filteredAccounts = accounts.filter((a) => {
    const matchesSearch =
      a.account_number.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (a.profiles?.email && a.profiles.email.toLowerCase().includes(filterQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const activeAccountsCount = accounts.filter(a => ['phase1', 'phase2', 'funded'].includes(a.status)).length;
  const fundedCount = accounts.filter(a => a.status === 'funded').length;
  const breachedCount = accounts.filter(a => a.status === 'breached').length;
  const pendingPayouts = payouts.filter(p => p.status === 'PENDING');

  return (
    <div className="flex-1 py-8 px-4 container mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-6 w-6 text-amber-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">PropEdge Admin Command Center</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Platform governance, evaluation status overrides, payout ledger approvals, and audit log inspection.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={loadAdminData}
          disabled={loading}
          className="border-slate-700 text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs text-slate-400">Total Users</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">{profiles.length}</div>
        </Card>
        <Card className="border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs text-slate-400">Active Accounts</span>
          <div className="text-2xl font-bold font-mono text-blue-400 mt-1">{activeAccountsCount}</div>
        </Card>
        <Card className="border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs text-slate-400">Funded Traders</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{fundedCount}</div>
        </Card>
        <Card className="border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs text-slate-400">Breached Accounts</span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">{breachedCount}</div>
        </Card>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
            activeTab === 'accounts'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Trading Accounts ({accounts.length})
        </button>
        <button
          onClick={() => setActiveTab('payouts')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
            activeTab === 'payouts'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Payout Queue ({pendingPayouts.length} Pending)
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Users & Profiles ({profiles.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
            activeTab === 'audit'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Audit Log ({ruleEvents.length})
        </button>
      </div>

      {/* 1. Accounts Tab */}
      {activeTab === 'accounts' && (
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="p-3 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Search className="h-3.5 w-3.5 text-slate-500" />
              <Input
                placeholder="Search by account number or email..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="h-8 w-64 bg-slate-950 text-xs border-slate-800"
              />
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-white rounded px-2 py-1"
              >
                <option value="ALL">All Statuses</option>
                <option value="PHASE1">Phase 1</option>
                <option value="PHASE2">Phase 2</option>
                <option value="FUNDED">Funded</option>
                <option value="BREACHED">Breached</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                  <th className="p-3">Account Number</th>
                  <th className="p-3">Trader Email</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Balance</th>
                  <th className="p-3 text-right">Equity</th>
                  <th className="p-3 text-center">Days</th>
                  <th className="p-3 text-center">Admin Overrides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-950/40">
                    <td className="p-3 font-bold text-white">{acc.account_number}</td>
                    <td className="p-3 text-slate-400 font-sans text-xs">
                      {acc.profiles?.email || 'Demo Trader'}
                    </td>
                    <td className="p-3 text-slate-300 font-sans text-xs">{acc.plans?.name || '$10K Plan'}</td>
                    <td className="p-3">
                      <Badge
                        variant={
                          acc.status === 'funded'
                            ? 'funded'
                            : acc.status === 'breached'
                            ? 'breached'
                            : acc.status === 'phase2'
                            ? 'phase2'
                            : 'phase1'
                        }
                        className="uppercase text-[9px] px-1.5 py-0"
                      >
                        {acc.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-right text-white">${Number(acc.current_balance).toLocaleString()}</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">
                      ${Number(acc.current_equity).toLocaleString()}
                    </td>
                    <td className="p-3 text-center text-slate-400">{acc.trading_days_count || 0}/5</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-1 font-sans">
                        {acc.status !== 'funded' && acc.status !== 'breached' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAdminAction('force_pass', { accountId: acc.id })}
                            disabled={actionLoading === acc.id}
                            className="h-6 px-1.5 text-[10px] text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/30"
                            title="Force pass to next phase"
                          >
                            Pass
                          </Button>
                        )}
                        {acc.status !== 'breached' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAdminAction('force_breach', { accountId: acc.id })}
                            disabled={actionLoading === acc.id}
                            className="h-6 px-1.5 text-[10px] bg-rose-600/80 hover:bg-rose-600"
                            title="Force fail / breach account"
                          >
                            Fail
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAdminAction('reset_balance', { accountId: acc.id })}
                          disabled={actionLoading === acc.id}
                          className="h-6 px-1.5 text-[10px] text-slate-400 hover:text-white"
                          title="Reset balance to starting challenge amount"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* 2. Payouts Queue Tab */}
      {activeTab === 'payouts' && (
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="p-4 border-b border-slate-800/80">
            <CardTitle className="text-base text-white">Pending Simulated Payout Review Queue</CardTitle>
            <CardDescription className="text-xs">Approve or reject simulated 80% profit payouts</CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-auto">
            {payouts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No payout requests in queue.</div>
            ) : (
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                    <th className="p-3">Date</th>
                    <th className="p-3">Account</th>
                    <th className="p-3">Requested Gross</th>
                    <th className="p-3">80% Share</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Details</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {payouts.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-950/40">
                      <td className="p-3 text-slate-400">{new Date(pay.requested_at).toLocaleDateString()}</td>
                      <td className="p-3 font-bold text-white">{pay.trading_accounts?.account_number || 'N/A'}</td>
                      <td className="p-3 text-slate-300">${Number(pay.requested_amount).toFixed(2)}</td>
                      <td className="p-3 text-emerald-400 font-bold">${Number(pay.payout_amount).toFixed(2)}</td>
                      <td className="p-3">
                        <Badge
                          variant={
                            pay.status === 'APPROVED' ? 'success' : pay.status === 'REJECTED' ? 'destructive' : 'warning'
                          }
                          className="uppercase text-[9px] px-1.5 py-0"
                        >
                          {pay.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-slate-400 font-sans text-xs">{pay.admin_notes || 'USDT'}</td>
                      <td className="p-3 text-center">
                        {pay.status === 'PENDING' ? (
                          <div className="flex items-center justify-center space-x-1">
                            <Button
                              size="sm"
                              onClick={() => handleAdminAction('approve_payout', { payoutId: pay.id })}
                              className="h-6 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-500"
                            >
                              <Check className="h-3 w-3 mr-1" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleAdminAction('reject_payout', { payoutId: pay.id })}
                              className="h-6 px-2 text-[10px] bg-rose-600 hover:bg-rose-500"
                            >
                              <X className="h-3 w-3 mr-1" /> Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}

      {/* 3. Users Tab */}
      {activeTab === 'users' && (
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="p-4 border-b border-slate-800/80">
            <CardTitle className="text-base text-white">Registered User Profiles</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                  <th className="p-3">User ID</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Registered At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {profiles.map((prof) => (
                  <tr key={prof.id} className="hover:bg-slate-950/40">
                    <td className="p-3 text-slate-500 text-[11px]">{prof.id.slice(0, 8)}...</td>
                    <td className="p-3 font-bold text-white font-sans">{prof.email}</td>
                    <td className="p-3 text-slate-300 font-sans">{prof.full_name || '—'}</td>
                    <td className="p-3">
                      <Badge variant={prof.role === 'admin' ? 'warning' : 'outline'} className="uppercase text-[9px] px-1.5 py-0">
                        {prof.role}
                      </Badge>
                    </td>
                    <td className="p-3 text-slate-400 text-[11px]">
                      {new Date(prof.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* 4. Audit Log Tab */}
      {activeTab === 'audit' && (
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="p-4 border-b border-slate-800/80">
            <CardTitle className="text-base text-white">Rule Breach & Evaluation Audit Events</CardTitle>
            <CardDescription className="text-xs">Immutable audit trail of firm compliance events</CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-auto">
            {ruleEvents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No rule audit events logged yet.</div>
            ) : (
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Account</th>
                    <th className="p-3">Event Type</th>
                    <th className="p-3">Rule Name</th>
                    <th className="p-3">Breached / Trigger Value</th>
                    <th className="p-3">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {ruleEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-950/40">
                      <td className="p-3 text-slate-400 text-[11px]">
                        {new Date(evt.created_at).toLocaleString()}
                      </td>
                      <td className="p-3 font-bold text-white">
                        {evt.trading_accounts?.account_number || 'N/A'}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            evt.event_type.includes('BREACH')
                              ? 'destructive'
                              : evt.event_type.includes('PASSED')
                              ? 'success'
                              : 'outline'
                          }
                          className="text-[9px] uppercase px-1.5 py-0"
                        >
                          {evt.event_type}
                        </Badge>
                      </td>
                      <td className="p-3 text-slate-200 font-sans">{evt.rule_name}</td>
                      <td className="p-3 text-rose-400 font-bold">
                        {evt.breached_value !== null ? `$${Number(evt.breached_value).toFixed(2)}` : '—'}
                      </td>
                      <td className="p-3 text-slate-400 text-[11px] font-sans truncate max-w-xs">
                        {JSON.stringify(evt.metadata)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
