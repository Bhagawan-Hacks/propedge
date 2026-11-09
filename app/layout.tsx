import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { SimulationBanner } from '@/components/layout/simulation-banner';
import { Navbar } from '@/components/layout/navbar';

export const metadata: Metadata = {
  title: 'PropEdge — Simulated Proprietary Trading Firm Platform',
  description: 'Educational simulated prop firm platform. Paper trade live cryptocurrency markets with authentic risk management and evaluation phases.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
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

