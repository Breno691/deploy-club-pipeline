// KineticStatsTemplate.tsx
// Estilo: Split-screen kinetic — painel laranja / painel dark, contadores animados,
// tipografia em movimento agressivo. Tendência viral Split Screen 2025.

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

const C = {
  dark:     '#0C0C10',
  darkAlt:  '#14141C',
  orange:   '#F97316',   // vibrant orange
  orangeD:  '#C2410C',
  white:    '#FFFFFF',
  offWhite: '#F3F4F6',
  textDark: '#0C0C10',
  muted:    '#6B7280',
  green:    '#22C55E',
  teal:     '#0EA5E9',
};

// ── ANIMATED COUNTER (simulate counting up) ──────────────────────────────────
const Counter: React.FC<{ value: string; frame: number; startFrame: number; color: string; size: number }> = ({ value, frame, startFrame, color, size }) => {
  const progress = interpolate(frame, [startFrame, startFrame + 35], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  // Parse number from value string (e.g. "−32%" → 32, "+45%" → 45, "R$41k" → 41)
  const prefix = value.match(/^[+−\-R$]*/)?.[0] ?? '';
  const numMatch = value.match(/(\d+)/);
  const num = numMatch ? parseInt(numMatch[1]) : 0;
  const suffix = value.replace(/^[+−\-R$]*/, '').replace(/^\d+/, '');

  const displayNum = Math.floor(num * progress);
  const displayVal = `${prefix}${displayNum}${suffix}`;

  return (
    <div style={{
      fontFamily: '"Bebas Neue", Impact, sans-serif',
      fontSize: size, color, lineHeight: 0.9,
      textShadow: color === C.orange ? `0 0 40px ${C.orange}88` : undefined,
    }}>
      {displayVal}
    </div>
  );
};

// ── SCENE: SPLIT HOOK ────────────────────────────────────────────────────────
const SplitHookScene: React.FC<{ frame: number; fps: number; headline: string; sub?: string }> = ({ frame, fps, headline, sub }) => {
  const splitProg = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const leftW = interpolate(splitProg, [0, 1], [0, 50]);   // % of width
  const titleSp = spring({ frame, fps, config: { stiffness: 40, damping: 16 }, delay: 18 });
  const subSp   = spring({ frame, fps, config: { stiffness: 35, damping: 18 }, delay: 36 });

  const words = headline.split(' ');
  const half = Math.ceil(words.length / 2);
  const line1 = words.slice(0, half).join(' ');
  const line2 = words.slice(half).join(' ');

  return (
    <AbsoluteFill style={{ background: C.dark }}>
      {/* Orange left panel — slides in */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0, left: 0,
        width: `${leftW}%`,
        background: C.orange,
        overflow: 'hidden',
      }}>
        {/* Diagonal texture */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `repeating-linear-gradient(45deg, rgba(0,0,0,0.04) 0, rgba(0,0,0,0.04) 2px, transparent 2px, transparent 14px)`,
        }} />
      </div>

      {/* Diagonal cut edge */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0,
        left: `calc(${leftW}% - 40px)`,
        width: 80,
        background: C.orange,
        clipPath: 'polygon(0 0, 50% 0, 100% 100%, 50% 100%)',
        opacity: splitProg,
      }} />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 72px' }}>
        {/* Headline */}
        <div style={{ textAlign: 'center', zIndex: 2 }}>
          {[line1, line2].map((line, i) => {
            const isOnOrange = i === 0;
            return (
              <div key={i} style={{
                fontFamily: '"Bebas Neue", Impact, sans-serif',
                fontSize: 152, lineHeight: 0.92, letterSpacing: 2,
                color: isOnOrange ? C.textDark : C.white,
                opacity: titleSp,
                transform: `translateX(${interpolate(titleSp, [0, 1], [i === 0 ? -80 : 80, 0])}px)`,
                display: 'block',
              }}>
                {line}
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{
          width: 6, height: interpolate(frame, [30, 55], [0, 80], { extrapolateRight: 'clamp' }),
          background: C.orange, margin: '24px 0', zIndex: 2,
        }} />

        {sub && (
          <div style={{
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: 32, color: C.offWhite, textAlign: 'center', lineHeight: 1.4,
            opacity: subSp, zIndex: 2, maxWidth: 780,
          }}>
            {sub}
          </div>
        )}
      </AbsoluteFill>

      {/* Bottom brand */}
      <div style={{
        position: 'absolute', bottom: 56, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 3,
        opacity: interpolate(frame, [50, 65], [0, 1], { extrapolateRight: 'clamp' }),
      }}>
        <div style={{
          background: C.white, borderRadius: 100, padding: '10px 32px',
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: 18, fontWeight: 800, letterSpacing: 3, color: C.dark,
          textTransform: 'uppercase',
        }}>
          SmartOps IA
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── SCENE: BIG COUNTERS ──────────────────────────────────────────────────────
interface Stat { value: string; label: string; color?: string }
const CounterScene: React.FC<{ frame: number; fps: number; headline: string; stats: Stat[] }> = ({ frame, fps, headline, stats }) => {
  const hSp = spring({ frame, fps, config: { stiffness: 55, damping: 18 }, delay: 2 });

  return (
    <AbsoluteFill style={{ background: C.dark }}>
      {/* Top orange band */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10, background: C.orange }} />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 64px', gap: 16 }}>
        {/* Eyebrow */}
        <div style={{
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: 20, fontWeight: 700, letterSpacing: 4,
          color: C.orange, textTransform: 'uppercase',
          opacity: hSp,
        }}>
          RESULTADOS COMPROVADOS
        </div>

        {/* Headline */}
        <div style={{
          fontFamily: '"Bebas Neue", Impact, sans-serif',
          fontSize: 96, color: C.white, letterSpacing: 2, lineHeight: 1,
          opacity: hSp, marginBottom: 16,
        }}>
          {headline}
        </div>

        {/* Stats */}
        {stats.map((stat, i) => {
          const delay = 20 + i * 14;
          const entSp = spring({ frame, fps, config: { stiffness: 50, damping: 16 }, delay });
          const accent = stat.color ?? (i === 0 ? C.orange : i === 1 ? C.teal : C.green);

          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 28,
              background: `${C.darkAlt}EE`, border: `1px solid ${accent}33`,
              borderLeft: `5px solid ${accent}`,
              borderRadius: '0 20px 20px 0', padding: '20px 32px',
              opacity: entSp,
              transform: `translateX(${interpolate(entSp, [0, 1], [-120, 0])}px)`,
            }}>
              {/* Counter */}
              <Counter value={stat.value} frame={frame} startFrame={delay} color={accent} size={80} />

              {/* Label */}
              <div style={{
                fontFamily: '"Inter", system-ui, sans-serif',
                fontSize: 28, color: C.offWhite, lineHeight: 1.3, flex: 1,
              }}>
                {stat.label}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE: KINETIC LIST ────────────────────────────────────────────────────────
const KineticListScene: React.FC<{ frame: number; fps: number; headline: string; items: string[] }> = ({ frame, fps, headline, items }) => {
  const scanLine = interpolate(frame, [0, 90], [-100, 2000], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: C.dark }}>
      {/* Horizontal scan line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 2,
        top: scanLine, background: C.orange, opacity: 0.6,
        boxShadow: `0 0 20px ${C.orange}`,
      }} />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 72px', gap: 24 }}>
        {/* Headline with orange underline */}
        <div>
          <div style={{
            fontFamily: '"Bebas Neue", Impact, sans-serif',
            fontSize: 100, color: C.white, letterSpacing: 2,
            opacity: interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' }),
          }}>
            {headline}
          </div>
          <div style={{
            height: 4,
            width: interpolate(frame, [12, 45], [0, 260], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) }),
            background: `linear-gradient(90deg, ${C.orange}, ${C.teal})`,
            borderRadius: 2, marginTop: 12,
          }} />
        </div>

        {items.map((item, i) => {
          const delay = 18 + i * 13;
          const sp = spring({ frame, fps, config: { stiffness: 60, damping: 18 }, delay });
          const isEven = i % 2 === 0;

          return (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '56px 1fr',
              alignItems: 'center', gap: 20,
              opacity: sp,
              transform: `translateX(${interpolate(sp, [0, 1], [isEven ? -70 : 70, 0])}px)`,
            }}>
              {/* Number badge */}
              <div style={{
                width: 48, height: 48,
                background: C.orange, borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: '"Bebas Neue", Impact, sans-serif',
                fontSize: 28, color: C.dark, fontWeight: 700,
              }}>
                {i + 1}
              </div>
              <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 30, color: C.white, lineHeight: 1.3 }}>
                {item}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE: CTA ────────────────────────────────────────────────────────────────
const KineticCTA: React.FC<{ frame: number; fps: number; ctaText: string; ctaSub: string }> = ({ frame, fps, ctaText, ctaSub }) => {
  const mainSp = spring({ frame, fps, config: { stiffness: 40, damping: 16 }, delay: 5 });
  const btnSp  = spring({ frame, fps, config: { stiffness: 55, damping: 18 }, delay: 28 });
  const scale  = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.97, 1.03]);

  return (
    <AbsoluteFill style={{ background: C.orange }}>
      {/* Diagonal texture */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `repeating-linear-gradient(45deg, rgba(0,0,0,0.03) 0, rgba(0,0,0,0.03) 2px, transparent 2px, transparent 16px)`,
      }} />

      {/* Dark band bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', background: C.dark, clipPath: 'polygon(0 40%, 100% 0, 100% 100%, 0 100%)' }} />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 72px', gap: 36, zIndex: 2 }}>
        {/* Headline — dark on orange */}
        <div style={{
          fontFamily: '"Bebas Neue", Impact, sans-serif',
          fontSize: 148, color: C.dark, textAlign: 'center',
          lineHeight: 0.9, letterSpacing: 3,
          opacity: mainSp,
          transform: `translateY(${interpolate(mainSp, [0, 1], [60, 0])}px)`,
        }}>
          {ctaText}
        </div>

        {/* CTA button — white on dark */}
        <div style={{
          background: C.white, borderRadius: 100, padding: '24px 70px',
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: 30, fontWeight: 800, color: C.dark,
          letterSpacing: 1, textAlign: 'center',
          opacity: btnSp,
          transform: `scale(${interpolate(btnSp, [0, 1], [0.7, 1])}) scale(${scale})`,
          boxShadow: '0 10px 50px rgba(0,0,0,0.3)',
        }}>
          {ctaSub}
        </div>

        <div style={{
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: 22, color: 'rgba(0,0,0,0.5)',
          letterSpacing: 3, textTransform: 'uppercase',
          opacity: interpolate(frame, [45, 60], [0, 1], { extrapolateRight: 'clamp' }),
        }}>
          Lean · Six Sigma · IA · BH/MG
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
interface KScene {
  type: 'split_hook' | 'counters' | 'kinetic_list' | 'cta';
  duration: number;
  headline?: string;
  sub?: string;
  stats?: Stat[];
  items?: string[];
  ctaText?: string;
  ctaSub?: string;
}

export interface KineticStatsProject { scenes: KScene[] }

export function buildKineticStatsProject(): KineticStatsProject {
  return {
    scenes: [
      { type: 'split_hook', duration: 6, headline: 'Seu processo está custando mais do que você imagina.', sub: 'E dá pra mudar isso em 4 semanas.' },
      { type: 'counters', duration: 10, headline: 'Em 90 dias de SmartOps IA:', stats: [
        { value: '−32%', label: 'redução de custo operacional com Lean Six Sigma', color: C.orange },
        { value: '+45%', label: 'processos automatizados com n8n + IA', color: C.teal },
        { value: '3×',   label: 'capacidade de crescimento sem contratar', color: C.green },
      ]},
      { type: 'kinetic_list', duration: 9, headline: 'Como funciona:', items: [
        'Diagnóstico presencial — mapeamos tudo',
        'Lean Six Sigma aplicado no seu fluxo',
        'Automações n8n + IA em 4 semanas',
        'Dashboard de KPIs em tempo real',
      ]},
      { type: 'cta', duration: 5, ctaText: 'Diagnóstico Gratuito', ctaSub: 'smartops-ia.com.br · BH/MG' },
    ],
  };
}

export const KineticStatsTemplate: React.FC<{ project?: KineticStatsProject }> = ({ project }) => {
  const { fps } = useVideoConfig();
  const frame   = useCurrentFrame();
  const scenes  = project?.scenes ?? buildKineticStatsProject().scenes;

  const ranges = scenes.reduce<{ start: number; end: number; scene: KScene }[]>(
    (acc, s) => {
      const start = acc.length > 0 ? acc[acc.length - 1].end : 0;
      return [...acc, { start, end: start + s.duration * fps, scene: s }];
    }, [],
  );

  const cur = ranges.find(r => frame >= r.start && frame < r.end) ?? ranges[ranges.length - 1];
  const sf  = frame - cur.start;
  const s   = cur.scene;

  switch (s.type) {
    case 'split_hook':    return <SplitHookScene    frame={sf} fps={fps} headline={s.headline!} sub={s.sub} />;
    case 'counters':      return <CounterScene       frame={sf} fps={fps} headline={s.headline!} stats={s.stats!} />;
    case 'kinetic_list':  return <KineticListScene   frame={sf} fps={fps} headline={s.headline!} items={s.items!} />;
    case 'cta':           return <KineticCTA          frame={sf} fps={fps} ctaText={s.ctaText!} ctaSub={s.ctaSub!} />;
    default:              return <SplitHookScene    frame={sf} fps={fps} headline={s.headline ?? ''} />;
  }
};
