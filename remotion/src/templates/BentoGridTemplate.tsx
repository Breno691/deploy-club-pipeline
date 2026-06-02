// BentoGridTemplate.tsx
// Estilo: Bento Grid — layout estilo Apple/Vercel/Linear com cards de tamanhos variados
// que "acordam" em sequência. Visual premium de produto tech.
// Baseado em ESTILO 28 da pesquisa — dark e light variants.

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export type BentoTheme = 'dark' | 'light';

const THEMES = {
  dark:  { bg: '#000000', surface: '#1C1C1E', border: 'rgba(255,255,255,0.1)', text: '#F5F5F7', textDim: '#8E8E93', accent: '#0071E3', accentAlt: '#30D158' },
  light: { bg: '#F5F5F7', surface: '#FFFFFF', border: 'rgba(0,0,0,0.08)', text: '#1D1D1F', textDim: '#6E6E73', accent: '#0071E3', accentAlt: '#34C759' },
};

export interface BentoProject { theme?: BentoTheme; headline: string; metric1: string; metric1Label: string; metric2: string; metric2Label: string; metric3: string; metric3Label: string; tagline: string; ctaText: string; }

interface CardProps { T: typeof THEMES.dark; frame: number; fps: number; delay: number; style?: React.CSSProperties; children: React.ReactNode }
const BentoCard: React.FC<CardProps> = ({ T, frame, fps, delay, style, children }) => {
  const sp = spring({ frame, fps, config: { stiffness: 55, damping: 20 }, delay });
  return (
    <div style={{
      background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`,
      boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
      opacity: sp, transform: `translateY(${interpolate(sp,[0,1],[40,0])}px) scale(${interpolate(sp,[0,1],[0.95,1])})`,
      overflow: 'hidden', position: 'relative',
      ...style,
    }}>
      {children}
    </div>
  );
};

// ── FULL BENTO LAYOUT ─────────────────────────────────────────────────────────
const BentoLayout: React.FC<{ p: BentoProject; frame: number; fps: number }> = ({ p, frame, fps }) => {
  const T = THEMES[p.theme ?? 'dark'];

  return (
    <AbsoluteFill style={{ background: T.bg, padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Row 1: Big headline card */}
      <BentoCard T={T} frame={frame} fps={fps} delay={5} style={{ flex: '0 0 auto', padding: '36px 40px' }}>
        <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 20, fontWeight: 700, letterSpacing: 3, color: T.accent, textTransform: 'uppercase', marginBottom: 12 }}>
          SmartOps IA
        </div>
        <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 108, color: T.text, lineHeight: 0.92, letterSpacing: 1 }}>
          {p.headline}
        </div>
      </BentoCard>

      {/* Row 2: 3 metric cards */}
      <div style={{ display: 'flex', gap: 20, flex: '0 0 auto' }}>
        {[
          { v: p.metric1, l: p.metric1Label, color: T.accent, delay: 18 },
          { v: p.metric2, l: p.metric2Label, color: T.accentAlt, delay: 26 },
          { v: p.metric3, l: p.metric3Label, color: '#FF375F', delay: 34 },
        ].map((m, i) => (
          <BentoCard key={i} T={T} frame={frame} fps={fps} delay={m.delay} style={{ flex: 1, padding: '24px 20px', textAlign: 'center' }}>
            <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 72, color: m.color, lineHeight: 1 }}>{m.v}</div>
            <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 22, color: T.textDim, lineHeight: 1.3, marginTop: 6 }}>{m.l}</div>
          </BentoCard>
        ))}
      </div>

      {/* Row 3: Tagline + CTA */}
      <div style={{ display: 'flex', gap: 20, flex: 1 }}>
        <BentoCard T={T} frame={frame} fps={fps} delay={42} style={{ flex: 2, padding: '24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 32, color: T.text, lineHeight: 1.4 }}>
            {p.tagline}
          </div>
          <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 20, color: T.textDim, marginTop: 12 }}>
            Lean Six Sigma · Automação · IA · BH/MG
          </div>
        </BentoCard>

        <BentoCard T={T} frame={frame} fps={fps} delay={50} style={{
          flex: 1, padding: '24px 20px', textAlign: 'center',
          background: T.accent, border: 'none',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 50, color: '#FFFFFF', lineHeight: 1.1, letterSpacing: 1 }}>
            {p.ctaText}
          </div>
          <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 20, color: 'rgba(255,255,255,0.8)', marginTop: 8 }}>
            Gratuito · 30 min
          </div>
        </BentoCard>
      </div>
    </AbsoluteFill>
  );
};

export function buildBentoProject(theme: BentoTheme = 'dark'): BentoProject {
  return {
    theme, headline: 'Processo caótico custa caro.',
    metric1: '−32%', metric1Label: 'custo operacional',
    metric2: '+45%', metric2Label: 'automação IA',
    metric3: '3×', metric3Label: 'capacidade',
    tagline: 'SmartOps IA elimina desperdícios com Lean Six Sigma e automação n8n em 4 semanas.',
    ctaText: 'Diagnóstico Gratuito',
  };
}

export const BentoGridTemplate: React.FC<{ project?: BentoProject }> = ({ project }) => {
  const { fps } = useVideoConfig();
  const frame   = useCurrentFrame();
  const p = project ?? buildBentoProject('dark');
  return <BentoLayout p={p} frame={frame} fps={fps} />;
};
