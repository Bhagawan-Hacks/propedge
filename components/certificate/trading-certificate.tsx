'use client';

import React, { useRef } from 'react';

interface TradingCertificateProps {
  traderName: string;
  accountNumber: string;
  achievementType: 'phase1' | 'phase2' | 'funded';
  accountSize: number;
  achievedOn: string; // ISO date string
  certificateId: string;
}

const ACHIEVEMENT_CONFIG = {
  phase1: {
    title: 'Phase I Evaluation',
    subtitle: 'Student Trader Certification',
    headline: 'has successfully completed Phase I of the',
    detail: 'PropEdge Proprietary Evaluation Program',
    color1: '#6d28d9',
    color2: '#4f46e5',
    accent: '#a78bfa',
    badge: 'PHASE I PASSED',
    badgeBg: 'rgba(109,40,217,0.15)',
    badgeBorder: '#6d28d9',
    star: '⭐',
    description:
      'demonstrating consistent profitability and disciplined risk management, achieving the required 8% profit target while respecting all risk parameters.',
  },
  phase2: {
    title: 'Phase II Evaluation',
    subtitle: 'Practitioner Trader Certification',
    headline: 'has successfully completed Phase II of the',
    detail: 'PropEdge Proprietary Evaluation Program',
    color1: '#0ea5e9',
    color2: '#6366f1',
    accent: '#38bdf8',
    badge: 'PHASE II PASSED',
    badgeBg: 'rgba(14,165,233,0.15)',
    badgeBorder: '#0ea5e9',
    star: '🌟',
    description:
      'demonstrating verified consistency and strategic discipline, achieving the required 5% profit target in Phase II while maintaining full compliance with all evaluation rules.',
  },
  funded: {
    title: 'Master Funded Trader',
    subtitle: 'Elite Capital Allocation Certificate',
    headline: 'has been awarded Master Funded Trader status by',
    detail: 'PropEdge Technologies Inc.',
    color1: '#059669',
    color2: '#10b981',
    accent: '#34d399',
    badge: 'MASTER FUNDED',
    badgeBg: 'rgba(5,150,105,0.15)',
    badgeBorder: '#059669',
    star: '🏆',
    description:
      'having demonstrated exceptional trading mastery, risk discipline, and consistent profitability across all evaluation phases. This trader is now authorized to trade institutional simulated capital and receive performance-based profit distributions.',
  },
};

export function TradingCertificate({
  traderName,
  accountNumber,
  achievementType,
  accountSize,
  achievedOn,
  certificateId,
}: TradingCertificateProps) {
  const config = ACHIEVEMENT_CONFIG[achievementType];

  const formattedDate = new Date(achievedOn).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      id="certificate-print-area"
      style={{
        width: '900px',
        minHeight: '640px',
        background: 'linear-gradient(135deg, #04060b 0%, #080d1a 40%, #060810 100%)',
        border: `1px solid #1b2234`,
        borderRadius: '20px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Georgia', serif",
        boxShadow: `0 0 80px rgba(109,40,217,0.15), 0 0 160px rgba(79,70,229,0.08)`,
      }}
    >
      {/* ── Decorative corner ornaments ── */}
      <CornerOrnament pos="top-left" color={config.color1} />
      <CornerOrnament pos="top-right" color={config.color1} />
      <CornerOrnament pos="bottom-left" color={config.color1} />
      <CornerOrnament pos="bottom-right" color={config.color1} />

      {/* ── Outer border glow line ── */}
      <div
        style={{
          position: 'absolute',
          inset: '12px',
          borderRadius: '12px',
          border: `1px solid rgba(${hexToRgb(config.color1)},0.25)`,
          pointerEvents: 'none',
        }}
      />
      {/* Inner hairline */}
      <div
        style={{
          position: 'absolute',
          inset: '16px',
          borderRadius: '10px',
          border: `1px solid rgba(${hexToRgb(config.color1)},0.10)`,
          pointerEvents: 'none',
        }}
      />

      {/* ── Radial glow background ── */}
      <div
        style={{
          position: 'absolute',
          top: '-120px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '400px',
          background: `radial-gradient(ellipse at top, rgba(${hexToRgb(config.color1)},0.18) 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* ── Watermark logo ── */}
      <div
        style={{
          position: 'absolute',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: 0.03,
          fontSize: '220px',
          fontWeight: 900,
          color: '#fff',
          letterSpacing: '-8px',
          userSelect: 'none',
          fontFamily: 'sans-serif',
          whiteSpace: 'nowrap',
        }}
      >
        PE
      </div>

      {/* ── Subtle grid pattern ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }}
      />

      {/* ── CONTENT ── */}
      <div style={{ padding: '52px 64px', position: 'relative', zIndex: 10 }}>

        {/* Header row: logo + badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px' }}>
          {/* Brand logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${config.color1}, ${config.color2})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 20px rgba(${hexToRgb(config.color1)},0.5)`,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m13 17 5-5-5-5M6 17l5-5-5-5" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', fontFamily: 'sans-serif' }}>
                Prop<span style={{ color: config.accent }}>Edge</span>
              </div>
              <div style={{ fontSize: '9px', color: '#64748b', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'sans-serif', fontWeight: 600 }}>
                Technologies Inc.
              </div>
            </div>
          </div>

          {/* Achievement badge pill */}
          <div
            style={{
              padding: '6px 16px',
              borderRadius: '999px',
              background: config.badgeBg,
              border: `1px solid ${config.badgeBorder}`,
              color: config.accent,
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '2px',
              fontFamily: 'sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
            }}
          >
            <span>{config.star}</span>
            {config.badge}
          </div>
        </div>

        {/* ── Divider ── */}
        <GradientDivider color={config.color1} />

        {/* Title block */}
        <div style={{ textAlign: 'center', margin: '28px 0 20px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '4px', color: config.accent, textTransform: 'uppercase', fontFamily: 'sans-serif', fontWeight: 700, marginBottom: '10px' }}>
            Certificate of Achievement
          </div>
          <h1
            style={{
              fontSize: '42px',
              fontWeight: 700,
              color: '#fff',
              margin: '0 0 4px',
              lineHeight: 1.1,
              letterSpacing: '-0.5px',
              textShadow: `0 0 40px rgba(${hexToRgb(config.color1)},0.3)`,
            }}
          >
            {config.title}
          </h1>
          <div style={{ fontSize: '13px', color: '#94a3b8', fontFamily: 'sans-serif', letterSpacing: '1px' }}>
            {config.subtitle}
          </div>
        </div>

        {/* ── Divider ── */}
        <GradientDivider color={config.color1} />

        {/* Recipient block */}
        <div style={{ textAlign: 'center', margin: '26px 0 22px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '10px' }}>
            This Certificate is Proudly Presented to
          </div>

          {/* Trader name with golden underline */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '8px' }}>
            <div
              style={{
                fontSize: '38px',
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '-0.3px',
                textShadow: `0 2px 20px rgba(${hexToRgb(config.color1)},0.4)`,
              }}
            >
              {traderName}
            </div>
            {/* Underline accent */}
            <div
              style={{
                height: '2px',
                background: `linear-gradient(90deg, transparent, ${config.color1}, ${config.color2}, transparent)`,
                borderRadius: '999px',
                marginTop: '4px',
              }}
            />
          </div>

          <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'sans-serif', marginBottom: '18px' }}>
            Account: <span style={{ color: '#94a3b8', fontFamily: 'monospace', fontWeight: 700 }}>{accountNumber}</span>
          </div>

          {/* Body copy */}
          <div
            style={{
              maxWidth: '640px',
              margin: '0 auto',
              fontSize: '14px',
              lineHeight: 1.75,
              color: '#94a3b8',
              fontStyle: 'italic',
              fontFamily: 'Georgia, serif',
            }}
          >
            {config.headline}{' '}
            <span style={{ color: '#e2e8f0', fontStyle: 'normal', fontWeight: 600 }}>
              {config.detail}
            </span>
            {', '}
            {config.description}
          </div>
        </div>

        {/* Stats ribbon */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            margin: '0 0 28px',
          }}
        >
          <StatPill label="Simulated Capital" value={`$${accountSize.toLocaleString()}`} color={config.color1} accent={config.accent} />
          <StatPill label="Achievement" value={config.badge} color={config.color1} accent={config.accent} />
          <StatPill label="Date Achieved" value={formattedDate} color={config.color1} accent={config.accent} />
          <StatPill label="Profit Split" value="Up to 100%" color={config.color1} accent={config.accent} />
        </div>

        {/* ── Bottom divider ── */}
        <GradientDivider color={config.color1} />

        {/* Signatures row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '24px' }}>
          {/* CEO signature */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '28px',
                color: config.accent,
                fontFamily: "'Brush Script MT', 'Comic Sans MS', cursive",
                letterSpacing: '1px',
                marginBottom: '2px',
                filter: `drop-shadow(0 0 8px rgba(${hexToRgb(config.color1)},0.5))`,
              }}
            >
              Charls Nomi
            </div>
            <div style={{ width: '180px', height: '1px', background: `linear-gradient(90deg, ${config.color1}, ${config.color2})`, margin: '6px auto 8px' }} />
            <div style={{ fontSize: '11px', color: '#e2e8f0', fontFamily: 'sans-serif', fontWeight: 700, letterSpacing: '0.5px' }}>
              Charls Nomi
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'sans-serif', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Chief Executive Officer
            </div>
            <div style={{ fontSize: '9px', color: '#475569', fontFamily: 'sans-serif', marginTop: '1px' }}>
              PropEdge Technologies Inc.
            </div>
          </div>

          {/* Center seal */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                background: `conic-gradient(from 0deg, ${config.color1}, ${config.color2}, ${config.color1})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                boxShadow: `0 0 24px rgba(${hexToRgb(config.color1)},0.4), 0 0 48px rgba(${hexToRgb(config.color1)},0.15)`,
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '50%',
                  background: '#070b14',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={config.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m13 17 5-5-5-5M6 17l5-5-5-5" />
                </svg>
                <div style={{ fontSize: '7px', color: config.accent, fontFamily: 'sans-serif', fontWeight: 800, letterSpacing: '1px', marginTop: '2px' }}>
                  VERIFIED
                </div>
              </div>
            </div>
            <div style={{ fontSize: '9px', color: '#475569', fontFamily: 'monospace', marginTop: '8px', letterSpacing: '0.5px' }}>
              ID: {certificateId}
            </div>
          </div>

          {/* Risk Officer signature */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '28px',
                color: config.accent,
                fontFamily: "'Brush Script MT', 'Comic Sans MS', cursive",
                letterSpacing: '1px',
                marginBottom: '2px',
                filter: `drop-shadow(0 0 8px rgba(${hexToRgb(config.color1)},0.5))`,
              }}
            >
              Risk Board
            </div>
            <div style={{ width: '180px', height: '1px', background: `linear-gradient(90deg, ${config.color2}, ${config.color1})`, margin: '6px auto 8px' }} />
            <div style={{ fontSize: '11px', color: '#e2e8f0', fontFamily: 'sans-serif', fontWeight: 700, letterSpacing: '0.5px' }}>
              Evaluation Committee
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'sans-serif', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Risk & Compliance Board
            </div>
            <div style={{ fontSize: '9px', color: '#475569', fontFamily: 'sans-serif', marginTop: '1px' }}>
              PropEdge Technologies Inc.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function CornerOrnament({ pos, color }: { pos: string; color: string }) {
  const styles: Record<string, React.CSSProperties> = {
    'top-left': { top: 18, left: 18, transform: 'none' },
    'top-right': { top: 18, right: 18, transform: 'rotate(90deg)' },
    'bottom-left': { bottom: 18, left: 18, transform: 'rotate(-90deg)' },
    'bottom-right': { bottom: 18, right: 18, transform: 'rotate(180deg)' },
  };
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      style={{ position: 'absolute', ...styles[pos], opacity: 0.5 }}
    >
      <path d="M2 34 L2 2 L34 2" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M2 20 L2 2 L20 2" stroke={color} strokeWidth="0.75" fill="none" strokeLinecap="round" opacity="0.5" />
      <circle cx="2" cy="2" r="2" fill={color} />
    </svg>
  );
}

function GradientDivider({ color }: { color: string }) {
  return (
    <div
      style={{
        height: '1px',
        background: `linear-gradient(90deg, transparent, rgba(${hexToRgb(color)},0.5) 20%, rgba(${hexToRgb(color)},0.8) 50%, rgba(${hexToRgb(color)},0.5) 80%, transparent)`,
        margin: '0',
      }}
    />
  );
}

function StatPill({
  label,
  value,
  color,
  accent,
}: {
  label: string;
  value: string;
  color: string;
  accent: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        padding: '10px 14px',
        borderRadius: '10px',
        background: `rgba(${hexToRgb(color)},0.07)`,
        border: `1px solid rgba(${hexToRgb(color)},0.2)`,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '9px', color: '#64748b', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'sans-serif', fontWeight: 600, marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '13px', color: accent, fontFamily: 'sans-serif', fontWeight: 700 }}>
        {value}
      </div>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '139,92,246';
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}
