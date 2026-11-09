'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, LineChart, LayoutDashboard, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const accountNumber = searchParams.get('account_number');
  const isDemo = searchParams.get('demo') === 'true';

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-16">
      <Card className="w-full max-w-lg border-slate-800 bg-slate-900/90 shadow-2xl text-center">
        <CardHeader className="space-y-3 pb-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <Badge variant="phase1" className="mx-auto text-xs px-3 py-1">
            Phase 1 Challenge Active
          </Badge>
          <CardTitle className="text-2xl font-bold text-white">Challenge Account Activated!</CardTitle>
          <CardDescription className="text-sm text-slate-300">
            Your simulated trading account has been successfully provisioned. You can now begin executing trades according to your challenge parameters.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {accountNumber && (
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Account Number:</span>
              <span className="text-blue-400 font-bold text-sm">{accountNumber}</span>
            </div>
          )}

          <div className="text-left bg-slate-950/50 p-4 rounded-lg border border-slate-800/80 space-y-2 text-xs text-slate-400">
            <div className="flex items-center text-slate-200 font-medium">
              <ShieldCheck className="h-4 w-4 mr-1.5 text-blue-400" />
              Evaluation Objectives:
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>Phase 1 Profit Target: <strong>8.0%</strong></li>
              <li>Maximum Daily Loss: <strong>5.0%</strong></li>
              <li>Maximum Total Drawdown: <strong>10.0%</strong></li>
              <li>Minimum Trading Days: <strong>5 days</strong></li>
              <li>Maximum Leverage: <strong>1:20</strong></li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link href="/terminal" className="w-full">
            <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white">
              <LineChart className="h-4 w-4 mr-2" /> Launch Terminal
            </Button>
          </Link>
          <Link href="/dashboard" className="w-full">
            <Button variant="outline" className="w-full border-slate-700 bg-slate-950 hover:bg-slate-800">
              <LayoutDashboard className="h-4 w-4 mr-2" /> View Dashboard
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center p-8 text-xs text-slate-400">Loading Confirmation...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
