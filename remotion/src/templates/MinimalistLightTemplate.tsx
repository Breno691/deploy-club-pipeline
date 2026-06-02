// MinimalistLightTemplate.tsx
// Estilo: editorial clean — fundo off-white, tipografia preta bold, Apple-style
// Tendência 2025: "Cloud Dancer" / Glassmorphism light / minimalismo de alto impacto

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

const C = {
  bg:       '#F8F7F4',      // off-white quente
  bgAlt:    '#EFEDE8',
  surface:  '#FFFFFF',
  text:     '#0D0D0D',
  textMid:  '#333333',
  textMute: '#666666',
  purple:   '#6D28D9',      // brand purple escuro
  purpleL:  '#8B5CF6',
  orange:   '#EA580C',      // contraste quente
  green:    '#059669',
  border:   '#E5E2DC',
  line:     '#D1CFC8',
};

interface MiniScene {
  type: 'cover' | 'problem' | 'numbers' | 'solution' | 'cta';
  duration: number;
  headline?: string;
  sub?: string;
  eyebrow?: string;
  stats?: { value: string; label: string; prefix?: string }[];
  bullets?: string[];
  ctaText?: string;
  ctaSub?: string;
}

export interface MinimalistProject { scenes: MiniScene[] }

// ── COVER SCENE ──────────────────────────────────────────────────────────────
const CoverScene: React.FC<{ s: MiniScene; frame: number; fps: number }> = ({ s, frame, fps }) => {
  const eyeSp   = spring({ frame, fps, config: { stiffness: 70, damping: 22 }, delay: 2 });
  const titleSp = spring({ frame, fps, config: { stiffness: 45, damping: 18 }, delay: 14 });
  const lineSp  = spring({ frame, fps, config: { stiffness: 80, damping: 24 }, delay: 30 });
  const subSp   = spring({ frame, fps, config: { stiffness: 40, damping: 18 }, delay: 44 });

  const lineW = interpolate(lineSp, [0, 1], [0, 340]);

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Subtle grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(${C.line}55 1px, transparent 1px), linear-gradient(90deg, ${C.line}55 1px, transparent 1px)`,
        backgroundSize: '80px 80px',
        opacity: 0.6,
      }} />

      {/* Purple accent block top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 8,
        background: `linear-gradient(90deg, ${C.purple}, ${C.purpleL})`,
      }} />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 80px', gap: 0 }}>
        {/* Eyebrow */}
        {s.eyebrow && (
          <div style={{
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: 20, fontWeight: 700, letterSpacing: 5,
            color: C.purple, textTransform: 'uppercase',
            opacity: eyeSp, marginBottom: 24,
          }}>
            {s.eyebrow}
          </div>
        )}

        {/* Headline — black, huge */}
        <div style={{
          fontFamily: '"Bebas Neue", Impact, sans-serif',
          fontSize: 155, fontWeight: 900, color: C.text,
          textAlign: 'center', lineHeight: 0.9, letterSpacing: 1,
          opacity: titleSp,
          transform: `translateY(${interpolate(titleSp, [0, 1], [50, 0])}px)`,
          maxWidth: 880,
        }}>
          {s.headline}
        </div>

        {/* Accent line */}
        <div style={{
          width: lineW, height: 5, margin: '28px 0 26px',
          background: `linear-gradient(90deg, ${C.orange}, ${C.purple})`,
          borderRadius: 3,
        }} />

        {/* Sub */}
        {s.sub && (
          <div style={{
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: 34, color: C.textMid, textAlign: 'center', lineHeight: 1.4,
            opacity: subSp, maxWidth: 800,
          }}>
            {s.sub}
          </div>
        )}
      </AbsoluteFill>

      {/* Bottom badge */}
      <div style={{
        position: 'absolute', bottom: 60, left: 0, right: 0, display: 'flex', justifyContent: 'center',
        opacity: interpolate(frame, [50, 70], [0, 1], { extrapolateRight: 'clamp' }),
      }}>
        <div style={{
          background: C.text, borderRadius: 100, padding: '10px 32px',
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: 18, fontWeight: 700, letterSpacing: 3, color: C.bg, textTransform: 'uppercase',
        }}>
          SmartOps IA · BH/MG
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── PROBLEM SCENE ────────────────────────────────────────────────────────────
const ProblemScene: React.FC<{ s: MiniScene; frame: number; fps: number }> = ({ s, frame, fps }) => {
  const bullets = s.bullets ?? [];

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: C.orange }} />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px', gap: 36 }}>
        {/* Eyebrow */}
        <div style={{
          fontFamily: '"Inter", system-ui, sans-serif', fontSize: 18, fontWeight: 700,
          letterSpacing: 4, color: C.orange, textTransform: 'uppercase',
          opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
        }}>
          O PROBLEMA
        </div>

        <div style={{
          fontFamily: '"Bebas Neue", Impact, sans-serif',
          fontSize: 105, color: C.text, lineHeight: 0.95, letterSpacing: 1,
          opacity: interpolate(frame, [5, 25], [0, 1], { extrapolateRight: 'clamp' }),
          transform: `translateY(${interpolate(spring({ frame, fps, config: { stiffness: 45, damping: 18 }, delay: 5 }), [0, 1], [40, 0])}px)`,
        }}>
          {s.headline}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {bullets.map((b, i) => {
            const sp = spring({ frame, fps, config: { stiffness: 55, damping: 18 }, delay: 20 + i * 12 });
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 20,
                opacity: sp,
                transform: `translateX(${interpolate(sp, [0, 1], [-40, 0])}px)`,
                background: C.surface, border: `1px solid ${C.border}`,
                borderLeft: `4px solid ${C.orange}`,
                borderRadius: '0 12px 12px 0', padding: '16px 24px',
              }}>
                <div style={{
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontSize: 30, color: C.text, lineHeight: 1.3,
                }}>
                  {b}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── NUMBERS SCENE ────────────────────────────────────────────────────────────
const NumbersScene: React.FC<{ s: MiniScene; frame: number; fps: number }> = ({ s, frame, fps }) => {
  const stats = s.stats ?? [];

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: `linear-gradient(90deg, ${C.purple}, ${C.purpleL})` }} />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 64px', gap: 32 }}>
        <div style={{
          fontFamily: '"Bebas Neue", Impact, sans-serif',
          fontSize: 90, color: C.text, textAlign: 'center', letterSpacing: 2,
          opacity: interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' }),
        }}>
          {s.headline}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
          {stats.map((st, i) => {
            const sp = spring({ frame, fps, config: { stiffness: 50, damping: 16 }, delay: 18 + i * 16 });
            const isGreen = st.value.startsWith('+') || st.value.startsWith('3×') || st.value === '3×';
            const accent = isGreen ? C.green : (i === 0 ? C.orange : C.purple);

            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center',
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 16, padding: '22px 32px', gap: 24,
                opacity: sp,
                transform: `translateY(${interpolate(sp, [0, 1], [50, 0])}px)`,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}>
                {/* Big number */}
                <div style={{
                  fontFamily: '"Bebas Neue", Impact, sans-serif',
                  fontSize: 100, color: accent, lineHeight: 1,
                  minWidth: 200, textAlign: 'right',
                }}>
                  {st.value}
                </div>
                {/* Label */}
                <div style={{
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontSize: 28, color: C.textMid, lineHeight: 1.3, flex: 1,
                }}>
                  {st.label}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SOLUTION SCENE ────────────────────────────────────────────────────────────
const SolutionScene: React.FC<{ s: MiniScene; frame: number; fps: number }> = ({ s, frame, fps }) => {
  const bullets = s.bullets ?? [];

  return (
    <AbsoluteFill style={{ background: C.text }}>
      {/* Inverted — dark background for contrast */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: `linear-gradient(90deg, ${C.purple}, ${C.purpleL})` }} />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px', gap: 32 }}>
        <div style={{
          fontFamily: '"Inter", system-ui, sans-serif', fontSize: 18, fontWeight: 700,
          letterSpacing: 4, color: C.purpleL, textTransform: 'uppercase',
          opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
        }}>
          A SOLUÇÃO
        </div>

        <div style={{
          fontFamily: '"Bebas Neue", Impact, sans-serif',
          fontSize: 108, color: C.bg, lineHeight: 0.95, letterSpacing: 1,
          opacity: interpolate(frame, [5, 22], [0, 1], { extrapolateRight: 'clamp' }),
        }}>
          {s.headline}
        </div>

        {bullets.map((b, i) => {
          const sp = spring({ frame, fps, config: { stiffness: 55, damping: 18 }, delay: 22 + i * 14 });
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 22,
              opacity: sp, transform: `translateX(${interpolate(sp, [0, 1], [-50, 0])}px)`,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `linear-gradient(135deg, ${C.purple}, ${C.purpleL})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: C.bg }} />
              </div>
              <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 30, color: C.bgAlt, lineHeight: 1.35 }}>
                {b}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── CTA SCENE ────────────────────────────────────────────────────────────────
const MiniCTA: React.FC<{ s: MiniScene; frame: number; fps: number }> = ({ s, frame, fps }) => {
  const mainSp = spring({ frame, fps, config: { stiffness: 45, damping: 18 }, delay: 5 });
  const btnSp  = spring({ frame, fps, config: { stiffness: 60, damping: 20 }, delay: 28 });

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: `linear-gradient(90deg, ${C.orange}, ${C.purple})` }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 8, background: `linear-gradient(90deg, ${C.purple}, ${C.orange})` }} />

      {/* Decorative circles */}
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', border: `1px solid ${C.line}`, top: -180, right: -180, opacity: 0.5 }} />
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', border: `1px solid ${C.line}`, bottom: -80, left: -60, opacity: 0.4 }} />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 72px', gap: 40 }}>
        <div style={{
          fontFamily: '"Bebas Neue", Impact, sans-serif',
          fontSize: 148, color: C.text, textAlign: 'center',
          lineHeight: 0.92, letterSpacing: 2,
          opacity: mainSp, transform: `translateY(${interpolate(mainSp, [0, 1], [60, 0])}px)`,
        }}>
          {s.ctaText}
        </div>

        {/* CTA button */}
        <div style={{
          background: C.text, borderRadius: 100, padding: '24px 70px',
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: 30, fontWeight: 800, color: C.bg,
          letterSpacing: 1,
          opacity: btnSp, transform: `scale(${interpolate(btnSp, [0, 1], [0.75, 1])})`,
          boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
        }}>
          {s.ctaSub}
        </div>

        <div style={{
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: 22, color: C.textMute,
          letterSpacing: 2, textTransform: 'uppercase',
          opacity: interpolate(frame, [45, 60], [0, 1], { extrapolateRight: 'clamp' }),
        }}>
          Lean · Six Sigma · Automação · IA
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
export function buildMinimalistProject(): MinimalistProject {
  return {
    scenes: [
      { type: 'cover', duration: 5, eyebrow: 'Consultoria Lean + IA', headline: 'Processo caótico custa mais do que parece.', sub: 'Sua empresa merece operar com precisão.' },
      { type: 'problem', duration: 8, headline: 'O que destrói a margem das PMEs:', bullets: [
        'Retrabalho que ninguém enxerga',
        'Processos que dependem de uma pessoa só',
        'Decisões sem dados — só no feeling',
      ]},
      { type: 'numbers', duration: 9, headline: 'Com SmartOps IA, em 90 dias:', stats: [
        { value: '−30%', label: 'custo operacional eliminado com Lean' },
        { value: '+50%', label: 'processos automatizados com n8n + IA' },
        { value: '3×',   label: 'capacidade de crescimento sem contratar' },
      ]},
      { type: 'solution', duration: 7, headline: 'SmartOps IA.', bullets: [
        'Lean Six Sigma aplicado presencialmente em BH',
        'Automações reais com n8n — sem código',
        'Dashboard de KPIs para decidir por dados',
        'Black Belt com foco em PMEs e resultados reais',
      ]},
      { type: 'cta', duration: 6, ctaText: 'Diagnóstico Gratuito — 30 min', ctaSub: 'smartops-ia.com.br' },
    ],
  };
}

export const MinimalistLightTemplate: React.FC<{ project?: MinimalistProject }> = ({ project }) => {
  const { fps } = useVideoConfig();
  const frame   = useCurrentFrame();
  const scenes  = project?.scenes ?? buildMinimalistProject().scenes;

  const ranges = scenes.reduce<{ start: number; end: number; scene: MiniScene }[]>(
    (acc, s) => {
      const start = acc.length > 0 ? acc[acc.length - 1].end : 0;
      return [...acc, { start, end: start + s.duration * fps, scene: s }];
    }, [],
  );

  const cur = ranges.find(r => frame >= r.start && frame < r.end) ?? ranges[ranges.length - 1];
  const sf  = frame - cur.start;
  const s   = cur.scene;

  switch (s.type) {
    case 'cover':    return <CoverScene    s={s} frame={sf} fps={fps} />;
    case 'problem':  return <ProblemScene  s={s} frame={sf} fps={fps} />;
    case 'numbers':  return <NumbersScene  s={s} frame={sf} fps={fps} />;
    case 'solution': return <SolutionScene s={s} frame={sf} fps={fps} />;
    case 'cta':      return <MiniCTA       s={s} frame={sf} fps={fps} />;
    default:         return <CoverScene    s={s} frame={sf} fps={fps} />;
  }
};
