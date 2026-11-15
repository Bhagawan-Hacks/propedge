'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Loader2,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import { TradingAccount, Payout } from '@/types';

export default function PayoutsPage() {
  const [fundedAccounts, setFundedAccounts] = useState<TradingAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [openModal, setOpenModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Crypto USDT (TRC20)');
  const [destination, setDestination] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const supabase = createClient();

  async function loadData() {
    setLoading(true);
    try {
      const { data: accs } = await supabase
        .from('trading_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (accs) {
        const typedAccs = accs as TradingAccount[];
        const funded = typedAccs.filter((a) => a.status === 'funded');
        setFundedAccounts(funded);
        if (funded.length > 0 && !selectedAccountId) {
          setSelectedAccountId(funded[0].id);
        }
      }

      const { data: pays } = await supabase
        .from('payouts')
        .select('*')
        .order('requested_at', { ascending: false });

      if (pays) setPayouts(pays);
    } catch (err) {
      console.warn('Payouts fetch note:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const activeAccount = fundedAccounts.find((a) => a.id === selectedAccountId);
  const currentProfit = activeAccount
    ? Math.max(0, Number(activeAccount.current_balance) - Number(activeAccount.initial_balance))
    : 0;
  const eligiblePayout = Math.round(currentProfit * 0.8 * 100) / 100;

  async function handleRequestPayout(e: React.FormEvent) {
    e.preventDefault();
    if (!activeAccount) return;
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/payouts/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: activeAccount.id,
          amount: parseFloat(amount),
          paymentMethod: method,
          destinationAddress: destination,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payout request failed');

      setOpenModal(false);
      setAmount('');
      setDestination('');
      setFeedback('Simulated payout request successfully registered in queue.');
      loadData();
    } catch (err: any) {
      setFeedback(err.message || 'Error submitting payout.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 py-10 px-4 container mx-auto max-w-5xl space-y-8 bg-[#06080f]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
            <Wallet className="h-3.5 w-3.5" /> Performance Rewards (80% to 100%)
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Trader Reward Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Funded Master Account traders receive on-demand profit disbursements in under 2 hours.
          </p>
        </div>

        {fundedAccounts.length > 0 && (
          <Button
            onClick={() => setOpenModal(true)}
            disabled={eligiblePayout <= 0}
            className="rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.4)] border border-violet-400/30"
          >
            <DollarSign className="h-4 w-4 mr-1.5" />
            Request Payout
          </Button>
        )}
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Account Balance & Profit Cards */}
      {fundedAccounts.length === 0 ? (
        <Card className="border-[#1b2234] bg-gradient-to-b from-[#0e1424] to-[#090d18] text-center py-12 rounded-2xl">
          <CardContent className="space-y-4">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No Master Accounts Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Payout requests unlock automatically when you pass Phase 1 (8%) and Phase 2 (5%) of your evaluation challenge.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Link href="/pricing">
                <Button size="sm" className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs shadow-[0_0_15px_rgba(139,92,246,0.35)]">
                  Start Evaluation Challenge
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="sm" variant="outline" className="rounded-xl border-[#1d2a40] text-xs">
                  Check Dashboard Progress
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-[#1b2234] bg-[#0b101e] rounded-2xl">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs text-slate-400">Funded Master Account</CardDescription>
              <CardTitle className="text-lg font-mono text-white">
                {activeAccount?.account_number}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Initial Allocation:</span>
                <span className="text-white">${Number(activeAccount?.initial_balance).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Balance:</span>
                <span className="text-white font-bold">${Number(activeAccount?.current_balance).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#1b2234] bg-[#0b101e] rounded-2xl">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs text-slate-400">Net Simulated Profit</CardDescription>
              <CardTitle className="text-2xl font-mono text-emerald-400">
                +${currentProfit.toFixed(2)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-400">
              Generated above starting allocation baseline.
            </CardContent>
          </Card>

          <Card className="border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 to-[#0b101e] rounded-2xl shadow-xl shadow-emerald-500/5">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs text-emerald-300">Your Performance Share</CardDescription>
              <CardTitle className="text-2xl font-mono text-emerald-300">
                ${eligiblePayout.toFixed(2)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-emerald-400/80">
              Eligible for simulated instant withdrawal request.
            </CardContent>
          </Card>
        </div>
      )}

      {/* Historical Payout Ledger */}
      <Card className="border-[#1b2234] bg-[#080c18] rounded-2xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-[#1b2234]">
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-violet-400" />
            Payout Request History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {payouts.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No previous payout requests recorded.
            </div>
          ) : (
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-[#0a0f1c] border-b border-[#1b2234] text-[10px] text-slate-400 uppercase">
                  <th className="p-3">Request Date</th>
                  <th className="p-3">Gross Requested</th>
                  <th className="p-3">Profit Split</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Method Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#131c2e]">
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#0d1424]">
                    <td className="p-3 text-slate-400">
                      {new Date(p.requested_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-slate-300">${Number(p.requested_amount).toFixed(2)}</td>
                    <td className="p-3 text-emerald-400 font-bold">${Number(p.payout_amount).toFixed(2)}</td>
                    <td className="p-3">
                      <Badge
                        variant={
                          p.status === 'APPROVED' || p.status === 'PAID'
                            ? 'success'
                            : p.status === 'REJECTED'
                            ? 'destructive'
                            : 'warning'
                        }
                        className="text-[10px] px-2 py-0.5 uppercase"
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-slate-400 text-[11px] font-sans truncate max-w-xs">
                      {p.admin_notes || 'Standard Wire'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Request Payout Modal */}
      {openModal && (
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogContent className="max-w-md bg-[#0a0f1c] border border-[#1b2234] text-slate-100 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Wallet className="h-5 w-5 text-violet-400" />
                Request Simulated Payout
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRequestPayout} className="space-y-4 py-2 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Withdrawable Profit</label>
                <div className="p-2.5 rounded-xl bg-[#060910] border border-[#1b2234] font-mono text-emerald-400 font-bold">
                  ${currentProfit.toFixed(2)} available (${eligiblePayout.toFixed(2)} after 80% split)
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Amount to Withdraw ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  max={currentProfit}
                  min={10}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 500.00"
                  className="bg-[#060910] font-mono"
                  required
                />
                <span className="text-[10px] text-slate-500">
                  Estimated 80% Net Payout: ${amount ? (parseFloat(amount) * 0.8).toFixed(2) : '0.00'}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Destination Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full bg-[#060910] border border-[#1b2234] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  <option>Crypto USDT (TRC20)</option>
                  <option>Crypto USDC (ERC20)</option>
                  <option>Direct Bank Wire</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Wallet Address / Account Info</label>
                <Input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. TXy123456789... or Bank IBAN"
                  className="bg-[#060910] font-mono"
                  required
                />
              </div>

              <div className="bg-[#060910] border border-[#1b2234] p-3 rounded-xl text-[11px] text-slate-400 space-y-1">
                <strong className="text-slate-200">Payout Processing:</strong> Withdrawal requests undergo risk compliance review prior to settlement in under 2 hours.
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setOpenModal(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold"
                >
                  {submitting ? 'Submitting...' : 'Confirm Request'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
