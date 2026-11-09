import React from 'react';
import Link from 'next/link';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function CheckoutCancelPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 py-16">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/90 shadow-2xl text-center">
        <CardHeader className="space-y-3 pb-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <XCircle className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl font-bold text-white">Checkout Cancelled</CardTitle>
          <CardDescription className="text-sm text-slate-300">
            Your simulated payment transaction was not completed. No charges or challenge accounts were created.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2 pt-2">
          <Link href="/pricing" className="w-full">
            <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white">
              <CreditCard className="h-4 w-4 mr-2" /> Return to Pricing Plans
            </Button>
          </Link>
          <Link href="/" className="w-full">
            <Button variant="ghost" className="w-full text-slate-400">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
