import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { SimulationBanner } from '@/components/layout/simulation-banner';
import { Navbar } from '@/components/layout/navbar';

export const metadata: Metadata = {
  title: 'PropEdge — Global Proprietary Trading Evaluation & Funded Accounts',
  description: 'Trade institutional simulated capital with real-time market liquidity feeds. Pass evaluation phases, respect drawdown limits, and unlock up to an 80% performance profit split.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-slate-950">
        <Providers>
          <SimulationBanner />
          <Navbar />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
