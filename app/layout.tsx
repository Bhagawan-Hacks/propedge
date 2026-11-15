import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { SimulationBanner } from '@/components/layout/simulation-banner';
import { Navbar } from '@/components/layout/navbar';

export const metadata: Metadata = {
  title: 'FundingPips — Your Skill Is Our Capital | Evaluation & Funded Accounts',
  description: 'Trade up to $300,000 in simulated capital. Pass evaluation phases, trade without arbitrary time limits, and receive fast on-demand payouts with up to 100% profit split.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#06080f] text-slate-100 flex flex-col antialiased selection:bg-violet-600 selection:text-white">
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
