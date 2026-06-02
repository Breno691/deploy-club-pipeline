// NeoBrutalTemplate.tsx
// Estilo: Neo-Brutalism 2025 — bordas pretas grossas e sólidas, sombras offset sem blur,
// cores saturadas intensas (amarelo, rosa choque, laranja), tipografia abrupta.
// Baseado em ESTILO 16 da pesquisa — viral em startups e design criativo.

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

export type BrutTheme = 'yellow' | 'pink' | 'orange';

const THEMES = {
  yellow: { bg: '#FFEB3B', text: '#000000', border: '#000000', shadow: '#000000', accent: '#FF1744', accentText: '#FFFFFF' },
  pink:   { bg: '#FF4081', text: '#000000', border: '#000000', shadow: '#000000', accent: '#FFEB3B', accentText: '#000000' },
  orange: { bg: '#FF6D00', text: '#000000', border: '#000000', shadow: '#000000', accent: '#1A237E', accentText: '#FFFFFF' },
};

export interface BrutProject { theme?: BrutTheme; headline: string; sub?: string; stats: { v: string; l: string }[]; items: string[]; ctaText: string }

// ── BRUT CARD ─────────────────────────────────────────────────────────────────
const BCard: React.FC<{ T: typeof THEMES.yellow; frame: number; fps: number; delay: number; children: React.ReactNode; style?: React.CSSProperties; bg?: string }> = ({ T, frame, fps, delay, children, style, bg }) => {
  const sp = spring({ frame, fps, config: { stiffness: 80, damping: 14 }, delay });
  const scale = interpolate(sp, [0, 0.6, 0.8, 1], [0.7, 1.08, 0.96, 1]);
  return (
    <div style={{
      background: bg ?? '#FFFFFF', border: `3px solid ${T.border}`,
      boxShadow: `6px 6px 0 ${T.shadow}`,
      padding: '20px 24px',
      opacity: sp, transform: `scale(${scale})`,
      ...style,
    }}>
      {children}
    </div>
  );
};

// ── FULL COMPOSITION ─────────────────────────────────────────────────────────
export const NeoBrutalTemplate: React.FC<{ project?: BrutProject }> = ({ project }) => {
  const { fps } = useVideoConfig();
  const frame   = useCurrentFrame();

  const p: BrutProject = project ?? buildBrutProject('yellow');
  const T = THEMES[p.theme ?? 'yellow'];

  const titleSp = spring({ frame, fps, config: { stiffness: 60, damping: 14 }, delay: 5 });
  const titleY  = interpolate(titleSp, [0, 0.6, 0.8, 1], [100, -10, 4, 0]);

  // Diagonal texture
  const texture = {
    position: 'absolute' as const, inset: 0,
    backgroundImage: `repeating-linear-gradient(45deg, rgba(0,0,0,0.04) 0, rgba(0,0,0,0.04) 2px, transparent 2px, transparent 14px)`,
  };

  return (
    <AbsoluteFill style={{ background: T.bg, position: 'relative', overflow: 'hidden' }}>
      <div style={texture} />

      {/* Big bold border frame */}
      <div style={{ position: 'absolute', top: 24, left: 24, right: 24, bottom: 24, border: `4px solid ${T.border}`, pointerEvents: 'none' }} />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', padding: '56px 52px', gap: 20 }}>

        {/* Eyebrow tag */}
        <div style={{
          display: 'inline-flex', alignSelf: 'flex-start',
          background: T.border, padding: '8px 22px',
          fontFamily: '"Inter", system-ui, sans-serif', fontSize: 20, fontWeight: 900,
          letterSpacing: 4, color: T.bg, textTransform: 'uppercase',
          opacity: interpolate(frame,[0,12],[0,1],{extrapolateRight:'clamp'}),
        }}>
          SmartOps IA
        </div>

        {/* HEADLINE — massive */}
        <div style={{
          fontFamily: '"Bebas Neue", Impact, sans-serif',
          fontSize: 148, color: T.text, lineHeight: 0.88, letterSpacing: 1,
          opacity: titleSp, transform: `translateY(${titleY}px)`,
        }}>
          {p.headline}
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 14 }}>
          {p.stats.map((s, i) => {
            const delay = 22 + i * 12;
            const sp    = spring({ frame, fps, config: { stiffness: 75, damping: 14 }, delay });
            const scale = interpolate(sp, [0, 0.6, 1], [0.6, 1.1, 1]);
            return (
              <div key={i} style={{
                flex: 1, background: '#FFFFFF', border: `3px solid ${T.border}`,
                boxShadow: `5px 5px 0 ${T.shadow}`, padding: '16px 12px', textAlign: 'center',
                opacity: sp, transform: `scale(${scale})`,
              }}>
                <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 72, color: T.accent, lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 22, fontWeight: 700, color: T.text, lineHeight: 1.2, marginTop: 4 }}>{s.l}</div>
              </div>
            );
          })}
        </div>

        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          {p.items.map((item, i) => {
            const delay = 36 + i * 10;
            const sp = spring({ frame, fps, config: { stiffness: 70, damping: 16 }, delay });
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: '#FFFFFF', border: `2px solid ${T.border}`,
                boxShadow: `4px 4px 0 ${T.shadow}`, padding: '12px 18px',
                opacity: sp, transform: `translateX(${interpolate(sp,[0,1],[-40,0])}px)`,
              }}>
                <div style={{ width: 12, height: 12, background: T.accent, flexShrink: 0 }} />
                <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 28, fontWeight: 700, color: T.text, lineHeight: 1.3 }}>
                  {item}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA button */}
        <div style={{
          background: T.accent, border: `3px solid ${T.border}`,
          boxShadow: `6px 6px 0 ${T.shadow}`, padding: '20px 32px', textAlign: 'center',
          opacity: spring({ frame, fps, config: { stiffness: 65, damping: 14 }, delay: 68 }),
        }}>
          <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 72, color: T.accentText, letterSpacing: 2, lineHeight: 1 }}>
            {p.ctaText}
          </div>
          <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 22, fontWeight: 700, color: T.accentText, opacity: 0.85, marginTop: 4 }}>
            smartops-ia.com.br · BH/MG
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export function buildBrutProject(theme: BrutTheme = 'yellow'): BrutProject {
  return {
    theme,
    headline: 'Desperdício é crime empresarial.',
    stats: [{ v: '−32%', l: 'custo' }, { v: '+45%', l: 'IA' }, { v: '3×', l: 'escala' }],
    items: [
      'Lean Six Sigma — elimina os 8 desperdícios',
      'Automação n8n + IA em 4 semanas',
      'Diagnóstico presencial em BH/MG',
    ],
    ctaText: 'DIAGNÓSTICO GRÁTIS',
  };
}
