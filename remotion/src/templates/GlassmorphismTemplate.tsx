// GlassmorphismTemplate.tsx
// Estilo: Apple Liquid Glass 2025 — gradientes vibrantes como fundo, cards de vidro fosco
// translúcidos (backdrop-blur simulado), bordas com reflexo de luz, profundidade real.
// Baseado em ESTILO 3 da pesquisa + design system Liquid Glass Apple iOS 26.

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

// ── DOIS TEMAS ────────────────────────────────────────────────────────────────
export type GlassTheme = 'cool' | 'warm';

const THEMES = {
  cool: {
    grad1: '#667EEA', grad2: '#764BA2', grad3: '#6BCFFF',
    card:  'rgba(255,255,255,0.12)',
    border:'rgba(255,255,255,0.28)',
    glow:  'rgba(102,126,234,0.4)',
    text:  '#FFFFFF', textDim: 'rgba(255,255,255,0.72)',
    accent:'#A5F3FC',
  },
  warm: {
    grad1: '#F093FB', grad2: '#F5576C', grad3: '#FDC830',
    card:  'rgba(255,255,255,0.14)',
    border:'rgba(255,255,255,0.3)',
    glow:  'rgba(245,87,108,0.4)',
    text:  '#FFFFFF', textDim: 'rgba(255,255,255,0.75)',
    accent:'#FDE68A',
  },
};

interface GScene {
  type: 'hero' | 'cards' | 'list' | 'cta';
  duration: number;
  headline?: string;
  sub?: string;
  eyebrow?: string;
  cards?: { icon: string; title: string; body: string }[];
  items?: string[];
  ctaText?: string;
  ctaSub?: string;
}

export interface GlassProject { scenes: GScene[]; theme?: GlassTheme }

// ── BACKGROUND ────────────────────────────────────────────────────────────────
const GradBG: React.FC<{ T: typeof THEMES.cool; frame: number }> = ({ T, frame }) => {
  const shift = interpolate(frame, [0, 180], [0, 30], { extrapolateRight: 'clamp' });
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `linear-gradient(${135 + shift}deg, ${T.grad1} 0%, ${T.grad2} 50%, ${T.grad3} 100%)`,
    }}>
      {/* Blur orbs for depth */}
      <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: `${T.grad3}44`, top: -200, right: -100, filter: 'blur(100px)' }} />
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: `${T.grad1}55`, bottom: 0, left: -100, filter: 'blur(80px)' }} />
    </div>
  );
};

// ── GLASS CARD ────────────────────────────────────────────────────────────────
const GlassCard: React.FC<{ T: typeof THEMES.cool; children: React.ReactNode; style?: React.CSSProperties }> = ({ T, children, style }) => (
  <div style={{
    background: T.card,
    border: `1px solid ${T.border}`,
    borderRadius: 28,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: `0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 ${T.border}`,
    padding: '28px 32px',
    ...style,
  }}>
    {children}
  </div>
);

// ── SCENE: HERO ───────────────────────────────────────────────────────────────
const HeroScene: React.FC<{ s: GScene; T: typeof THEMES.cool; frame: number; fps: number }> = ({ s, T, frame, fps }) => {
  const eyeSp   = spring({ frame, fps, config: { stiffness: 70, damping: 22 }, delay: 5 });
  const titleSp = spring({ frame, fps, config: { stiffness: 45, damping: 18 }, delay: 18 });
  const subSp   = spring({ frame, fps, config: { stiffness: 40, damping: 20 }, delay: 36 });

  return (
    <AbsoluteFill>
      <GradBG T={T} frame={frame} />
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 72px', gap: 28, zIndex: 2 }}>
        {s.eyebrow && (
          <div style={{
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 100,
            padding: '10px 32px',
            fontFamily: '"Inter", system-ui, sans-serif', fontSize: 22, fontWeight: 700,
            letterSpacing: 4, color: T.text, textTransform: 'uppercase',
            opacity: eyeSp, transform: `translateY(${interpolate(eyeSp, [0,1],[-30,0])}px)`,
          }}>
            {s.eyebrow}
          </div>
        )}

        <div style={{
          fontFamily: '"Bebas Neue", Impact, sans-serif',
          fontSize: 155, color: T.text, textAlign: 'center', lineHeight: 0.9, letterSpacing: 2,
          opacity: titleSp, transform: `translateY(${interpolate(titleSp, [0,1],[70,0])}px)`,
          textShadow: '0 4px 40px rgba(0,0,0,0.25)',
        }}>
          {s.headline}
        </div>

        {s.sub && (
          <GlassCard T={T} style={{ maxWidth: 820 }}>
            <div style={{
              fontFamily: '"Inter", system-ui, sans-serif',
              fontSize: 38, color: T.textDim, textAlign: 'center', lineHeight: 1.4,
              opacity: subSp,
            }}>
              {s.sub}
            </div>
          </GlassCard>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE: CARDS ──────────────────────────────────────────────────────────────
const CardsScene: React.FC<{ s: GScene; T: typeof THEMES.cool; frame: number; fps: number }> = ({ s, T, frame, fps }) => {
  const cards = s.cards ?? [];
  const hOp = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <GradBG T={T} frame={frame} />
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 64px', gap: 24, zIndex: 2 }}>
        <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 96, color: T.text, opacity: hOp, letterSpacing: 2, textShadow: '0 2px 20px rgba(0,0,0,0.2)' }}>
          {s.headline}
        </div>
        {cards.map((c, i) => {
          const sp = spring({ frame, fps, config: { stiffness: 50, damping: 18 }, delay: 16 + i * 14 });
          return (
            <GlassCard key={i} T={T} style={{
              opacity: sp, transform: `translateX(${interpolate(sp,[0,1],[-60,0])}px) scale(${interpolate(sp,[0,1],[0.95,1])})`,
              display: 'flex', alignItems: 'flex-start', gap: 20,
            }}>
              <div style={{ fontSize: 40, lineHeight: 1 }}>{c.icon}</div>
              <div>
                <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 46, color: T.text, lineHeight: 1.1, letterSpacing: 1 }}>{c.title}</div>
                <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 30, color: T.textDim, lineHeight: 1.4, marginTop: 6 }}>{c.body}</div>
              </div>
            </GlassCard>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE: LIST ───────────────────────────────────────────────────────────────
const ListScene: React.FC<{ s: GScene; T: typeof THEMES.cool; frame: number; fps: number }> = ({ s, T, frame, fps }) => {
  const items = s.items ?? [];
  return (
    <AbsoluteFill>
      <GradBG T={T} frame={frame} />
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 72px', gap: 28, zIndex: 2 }}>
        <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 96, color: T.text, letterSpacing: 2, opacity: interpolate(frame,[0,18],[0,1],{extrapolateRight:'clamp'}) }}>
          {s.headline}
        </div>
        {items.map((item, i) => {
          const sp = spring({ frame, fps, config: { stiffness: 55, damping: 18 }, delay: 16 + i * 13 });
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20, opacity: sp, transform: `translateY(${interpolate(sp,[0,1],[40,0])}px)` }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: T.accent, flexShrink: 0, boxShadow: `0 0 16px ${T.accent}` }} />
              <GlassCard T={T} style={{ flex: 1, padding: '18px 26px' }}>
                <span style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 34, color: T.text, lineHeight: 1.3 }}>{item}</span>
              </GlassCard>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE: CTA ────────────────────────────────────────────────────────────────
const GlassCTA: React.FC<{ s: GScene; T: typeof THEMES.cool; frame: number; fps: number }> = ({ s, T, frame, fps }) => {
  const mainSp = spring({ frame, fps, config: { stiffness: 45, damping: 18 }, delay: 5 });
  const btnSp  = spring({ frame, fps, config: { stiffness: 60, damping: 20 }, delay: 28 });

  return (
    <AbsoluteFill>
      <GradBG T={T} frame={frame} />
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 72px', gap: 40, zIndex: 2 }}>
        <div style={{
          fontFamily: '"Bebas Neue", Impact, sans-serif',
          fontSize: 148, color: T.text, textAlign: 'center', lineHeight: 0.9, letterSpacing: 3,
          opacity: mainSp, transform: `translateY(${interpolate(mainSp,[0,1],[60,0])}px)`,
          textShadow: '0 4px 40px rgba(0,0,0,0.3)',
        }}>
          {s.ctaText}
        </div>

        <GlassCard T={T} style={{
          opacity: btnSp, transform: `scale(${interpolate(btnSp,[0,1],[0.8,1])})`,
          padding: '22px 64px', textAlign: 'center',
        }}>
          <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 36, fontWeight: 800, color: T.text }}>
            {s.ctaSub}
          </div>
        </GlassCard>

        <div style={{
          fontFamily: '"Inter", system-ui, sans-serif', fontSize: 24, color: T.textDim,
          letterSpacing: 3, textTransform: 'uppercase',
          opacity: interpolate(frame,[44,60],[0,1],{extrapolateRight:'clamp'}),
        }}>
          Lean · Six Sigma · Automação · IA
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
export const GlassmorphismTemplate: React.FC<{ project?: GlassProject }> = ({ project }) => {
  const { fps } = useVideoConfig();
  const frame   = useCurrentFrame();
  const T = THEMES[project?.theme ?? 'cool'];
  const scenes: GScene[] = project?.scenes ?? buildGlassProject('cool').scenes;

  const ranges = scenes.reduce<{ start: number; end: number; scene: GScene }[]>(
    (acc, s) => { const start = acc.length > 0 ? acc[acc.length-1].end : 0; return [...acc,{start,end:start+s.duration*fps,scene:s}]; }, [],
  );
  const cur = ranges.find(r => frame >= r.start && frame < r.end) ?? ranges[ranges.length-1];
  const sf = frame - cur.start;
  const s  = cur.scene;

  switch (s.type) {
    case 'hero':  return <HeroScene  s={s} T={T} frame={sf} fps={fps} />;
    case 'cards': return <CardsScene s={s} T={T} frame={sf} fps={fps} />;
    case 'list':  return <ListScene  s={s} T={T} frame={sf} fps={fps} />;
    case 'cta':   return <GlassCTA   s={s} T={T} frame={sf} fps={fps} />;
    default:      return <HeroScene  s={s} T={T} frame={sf} fps={fps} />;
  }
};

export function buildGlassProject(theme: GlassTheme = 'cool'): GlassProject {
  return {
    theme,
    scenes: [
      { type: 'hero', duration: 6, eyebrow: 'SmartOps IA · BH/MG', headline: 'Lean Six Sigma + IA para PMEs que crescem.', sub: 'Diagnóstico gratuito. Resultados em 90 dias.' },
      { type: 'cards', duration: 10, headline: 'Como transformamos sua empresa:', cards: [
        { icon: '🔍', title: 'Diagnóstico presencial', body: 'Mapeamos todos os desperdícios in loco na sua empresa.' },
        { icon: '⚡', title: 'Automação em 4 semanas', body: 'n8n + IA eliminando trabalho manual com zero código.' },
        { icon: '📊', title: 'Dashboard de KPIs', body: 'Decisões baseadas em dados, não em feeling.' },
      ]},
      { type: 'list', duration: 9, headline: 'Resultados que entregamos:', items: [
        '−30% custo operacional com Lean Six Sigma',
        '+45% processos automatizados com IA',
        '3× capacidade de crescimento sem contratar',
        'ROI positivo em menos de 90 dias',
      ]},
      { type: 'cta', duration: 5, ctaText: 'Diagnóstico Gratuito', ctaSub: 'smartops-ia.com.br · 30 min · BH/MG' },
    ],
  };
}
