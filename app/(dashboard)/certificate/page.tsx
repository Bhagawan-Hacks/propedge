'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Download,
  Printer,
  ArrowLeft,
  Award,
  CheckCircle2,
  Share2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TradingCertificate } from '@/components/certificate/trading-certificate';
import { createClient } from '@/lib/supabase/client';

type AchievementType = 'phase1' | 'phase2' | 'funded';

const BADGE_LABELS: Record<AchievementType, string> = {
  phase1: 'Phase I Passed',
  phase2: 'Phase II Passed',
  funded: 'Master Funded',
};

const BADGE_COLORS: Record<AchievementType, string> = {
  phase1: 'bg-violet-500/15 border-violet-500/40 text-violet-300',
  phase2: 'bg-sky-500/15 border-sky-500/40 text-sky-300',
  funded: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
};

// Mock data used when Supabase is not connected
const MOCK_ACCOUNTS = [
  {
    id: 'phase1-demo',
    accountNumber: 'PE-DEMO-1001',
    traderName: 'Alex Morgan',
    achievement: 'phase1' as AchievementType,
    accountSize: 10000,
    achievedOn: new Date().toISOString(),
    certificateId: 'PE-CERT-P1-001',
  },
  {
    id: 'phase2-demo',
    accountNumber: 'PE-DEMO-2002',
    traderName: 'Alex Morgan',
    achievement: 'phase2' as AchievementType,
    accountSize: 25000,
    achievedOn: new Date().toISOString(),
    certificateId: 'PE-CERT-P2-002',
  },
  {
    id: 'funded-demo',
    accountNumber: 'PE-DEMO-3003',
    traderName: 'Alex Morgan',
    achievement: 'funded' as AchievementType,
    accountSize: 100000,
    achievedOn: new Date().toISOString(),
    certificateId: 'PE-CERT-FD-003',
  },
];

export default function CertificatePage() {
  const params = useSearchParams();
  const certRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<typeof MOCK_ACCOUNTS>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [printing, setPrinting] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function loadCertificates() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Fetch user profile for name
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', user.id)
            .single();

          const displayName = profile?.full_name || user.email?.split('@')[0] || 'Valued Trader';

          // Fetch accounts that have passed phase1, phase2, or are funded
          const { data: accounts } = await supabase
            .from('trading_accounts')
            .select('*, plans(*)')
            .in('status', ['phase2', 'funded', 'passed', 'closed'])
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (accounts && accounts.length > 0) {
            const certs = accounts.flatMap((acc: any) => {
              const result: typeof MOCK_ACCOUNTS = [];
              const size = acc.plans?.starting_balance || acc.initial_balance || 10000;

              // Phase 1 cert — always earned for accounts beyond phase1
              result.push({
                id: `${acc.id}-p1`,
                accountNumber: acc.account_number,
                traderName: displayName,
                achievement: 'phase1',
                accountSize: size,
                achievedOn: acc.updated_at || acc.created_at,
                certificateId: `PE-CERT-P1-${acc.account_number.replace('PE-', '')}`,
              });

              // Phase 2 cert — funded/passed/closed accounts
              if (['funded', 'passed', 'closed'].includes(acc.status)) {
                result.push({
                  id: `${acc.id}-p2`,
                  accountNumber: acc.account_number,
                  traderName: displayName,
                  achievement: 'phase2',
                  accountSize: size,
                  achievedOn: acc.updated_at || acc.created_at,
                  certificateId: `PE-CERT-P2-${acc.account_number.replace('PE-', '')}`,
                });
              }

              // Funded cert
              if (acc.status === 'funded') {
                result.push({
                  id: `${acc.id}-funded`,
                  accountNumber: acc.account_number,
                  traderName: displayName,
                  achievement: 'funded',
                  accountSize: size,
                  achievedOn: acc.updated_at || acc.created_at,
                  certificateId: `PE-CERT-FD-${acc.account_number.replace('PE-', '')}`,
                });
              }

              return result;
            });

            setCertificates(certs.length > 0 ? certs : MOCK_ACCOUNTS);
            setSelectedId(certs[0]?.id || MOCK_ACCOUNTS[0].id);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        // Fallback to mock
      }

      // No live data — show demo certificates
      setCertificates(MOCK_ACCOUNTS);
      setSelectedId(params.get('type') === 'funded' ? 'funded-demo' : params.get('type') === 'phase2' ? 'phase2-demo' : 'phase1-demo');
      setLoading(false);
    }

    loadCertificates();
  }, []);

  const selected = certificates.find((c) => c.id === selectedId) || certificates[0];

  function handlePrint() {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 150);
  }

  async function handleDownload() {
    // Open print dialog with a print-only stylesheet that hides everything but the cert
    handlePrint();
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: `PropEdge Certificate – ${selected?.traderName}`,
        text: `I just earned my ${BADGE_LABELS[selected?.achievement || 'phase1']} certificate from PropEdge! 🏆`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  }

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #certificate-print-wrapper { display: block !important; position: fixed; inset: 0; background: white; z-index: 9999; display: flex; align-items: center; justify-content: center; }
          #certificate-print-area { transform: scale(0.95) !important; transform-origin: center center !important; }
        }
      `}</style>

      <div className="flex-1 min-h-screen bg-[#06080f] py-10 px-4">
        <div className="container mx-auto max-w-6xl space-y-8">

          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="rounded-xl border-[#1d2a40] text-slate-400 hover:text-white hover:border-violet-500/40 text-xs gap-1.5">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Dashboard
                  </Button>
                </Link>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-semibold">
                  <Award className="h-3.5 w-3.5" />
                  Achievement Certificates
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">
                Your Certificates
              </h1>
              <p className="text-sm text-slate-400">
                Official PropEdge evaluation achievement certificates — printable &amp; shareable.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="rounded-xl border-[#1d2a40] text-slate-300 hover:border-violet-500/40 gap-1.5 text-xs"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                disabled={printing}
                className="rounded-xl border-[#1d2a40] text-slate-300 hover:border-violet-500/40 gap-1.5 text-xs"
              >
                {printing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Printer className="h-3.5 w-3.5" />}
                Print
              </Button>
              <Button
                size="sm"
                onClick={handleDownload}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold gap-1.5 text-xs shadow-[0_0_15px_rgba(139,92,246,0.4)] border border-violet-400/30"
              >
                <Download className="h-3.5 w-3.5" />
                Download PDF
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
            </div>
          ) : (
            <div className="grid lg:grid-cols-[260px_1fr] gap-6">

              {/* Sidebar: certificate selector */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                  Select Certificate
                </div>
                <div className="space-y-2">
                  {certificates.map((cert) => (
                    <button
                      key={cert.id}
                      onClick={() => setSelectedId(cert.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                        selectedId === cert.id
                          ? 'border-violet-500/60 bg-gradient-to-b from-[#131a2f] to-[#0d1220] shadow-[0_0_20px_rgba(139,92,246,0.15)]'
                          : 'border-[#1b2234] bg-[#0b1020] hover:border-violet-500/30 hover:bg-[#101828]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-sm ${
                          cert.achievement === 'funded' ? 'bg-emerald-500/15 text-emerald-400' :
                          cert.achievement === 'phase2' ? 'bg-sky-500/15 text-sky-400' :
                          'bg-violet-500/15 text-violet-400'
                        }`}>
                          {cert.achievement === 'funded' ? '🏆' : cert.achievement === 'phase2' ? '🌟' : '⭐'}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{BADGE_LABELS[cert.achievement]}</div>
                          <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">{cert.accountNumber}</div>
                          <div className="text-[11px] text-slate-500 mt-1">${cert.accountSize.toLocaleString()} capital</div>
                        </div>
                        {selectedId === cert.id && (
                          <CheckCircle2 className="h-4 w-4 text-violet-400 shrink-0 ml-auto mt-0.5" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Info box */}
                <div className="p-3.5 rounded-xl bg-[#0b1020] border border-[#1b2234] space-y-2 mt-2">
                  <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">About Certificates</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Certificates are issued for each milestone: Phase I pass, Phase II pass, and Master Funded status. Each is signed by the CEO and verifiable via its unique ID.
                  </p>
                </div>
              </div>

              {/* Main: certificate preview */}
              <div className="space-y-4">
                {selected && (
                  <>
                    {/* Type badge */}
                    <div className="flex items-center gap-3">
                      <Badge className={`text-[10px] font-bold uppercase tracking-wider border px-3 py-1 rounded-full ${BADGE_COLORS[selected.achievement]}`}>
                        {BADGE_LABELS[selected.achievement]}
                      </Badge>
                      <span className="text-xs text-slate-500 font-mono">ID: {selected.certificateId}</span>
                    </div>

                    {/* Certificate render area */}
                    <div
                      id="certificate-print-wrapper"
                      className="overflow-auto rounded-2xl"
                      style={{ maxWidth: '100%' }}
                    >
                      <div
                        style={{
                          transformOrigin: 'top left',
                          display: 'inline-block',
                          minWidth: '900px',
                        }}
                      >
                        <TradingCertificate
                          traderName={selected.traderName}
                          accountNumber={selected.accountNumber}
                          achievementType={selected.achievement}
                          accountSize={selected.accountSize}
                          achievedOn={selected.achievedOn}
                          certificateId={selected.certificateId}
                        />
                      </div>
                    </div>

                    {/* Footer note */}
                    <p className="text-[11px] text-slate-500 text-center">
                      This is an official PropEdge certificate. Certificate ID <span className="font-mono text-slate-400">{selected.certificateId}</span> is verifiable by contacting support.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
