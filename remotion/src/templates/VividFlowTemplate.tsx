// VividFlowTemplate.tsx
// Dinâmico · Leve · Atraente
// Fundo de cor viva que flui suavemente entre cenas, texto enorme e limpo,
// animações elegantes com timing premium. Sem peso visual — espaço para respirar.

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

// Each scene has its own signature color
const SCENE_COLORS = [
  { from: '#0066FF', to: '#00C6FF' },   // electric blue
  { from: '#7C3AED', to: '#C084FC' },   // violet
  { from: '#059669', to: '#34D399' },   // emerald
  { from: '#FF6B00', to: '#FFB347' },   // vivid orange
  { from: '#DC2626', to: '#F87171' },   // red energy
];

interface VFScene {
  type: 'hook' | 'stat' | 'list' | 'cta';
  duration: number;
  headline: string;
  sub?: string;
  eyebrow?: string;
  stats?: { v: string; l: string }[];
  items?: string[];
  colorIdx?: number;
}

export interface VividFlowProject { scenes: VFScene[] }

// ── ANIMATED BACKGROUND ───────────────────────────────────────────────────────
const FlowBG: React.FC<{ frame: number; from: string; to: string }> = ({ frame, from, to }) => {
  const angle = interpolate(frame, [0, 300], [135, 200], { extrapolateRight: 'clamp' });
  const scale = 1 + Math.sin(frame * 0.02) * 0.04;

  return (
    <div style={{
      position: 'absolute', inset: -40,
      background: `linear-gradient(${angle}deg, ${from} 0%, ${to} 60%, ${from}CC 100%)`,
      transform: `scale(${scale})`,
    }}>
      {/* Soft light orb that drifts */}
      <div style={{
        position: 'absolute',
        width: 700, height: 700, borderRadius: '50%',
        background: 'rgba(255,255,255,0.12)',
        filter: 'blur(100px)',
        top: `${20 + Math.sin(frame * 0.015) * 15}%`,
        left: `${10 + Math.cos(frame * 0.01) * 12}%`,
      }} />
      <div style={{
        position: 'absolute',
        width: 500, height: 500, borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
        filter: 'blur(80px)',
        bottom: `${10 + Math.cos(frame * 0.018) * 10}%`,
        right: `${5 + Math.sin(frame * 0.012) * 8}%`,
      }} />
    </div>
  );
};

// ── LETTER STAGGER ANIMATION ─────────────────────────────────────────────────
const AnimLetters: React.FC<{
  text: string; frame: number; fps: number; delay?: number;
  fontSize: number; color?: string; align?: 'center' | 'left';
}> = ({ text, frame, fps, delay = 0, fontSize, color = '#FFFFFF', align = 'center' }) => {
  const letters = text.split('');
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: align === 'center' ? 'center' : 'flex-start', gap: fontSize * 0.02 }}>
      {letters.map((l, i) => {
        const letterDelay = delay + i * 1.8;
        const sp = spring({ frame, fps, config: { stiffness: 200, damping: 18 }, delay: letterDelay });
        const y  = interpolate(sp, [0, 1], [fontSize * 0.8, 0]);
        const op = interpolate(sp, [0, 0.4, 1], [0, 1, 1]);
        return (
          <span key={i} style={{
            fontFamily: '"Bebas Neue", Impact, sans-serif',
            fontSize, color,
            lineHeight: 0.9, letterSpacing: 2,
            display: 'inline-block',
            transform: `translateY(${y}px)`,
            opacity: op,
          }}>
            {l === ' ' ? ' ' : l}
          </span>
        );
      })}
    </div>
  );
};

// ── SCENE: HOOK ───────────────────────────────────────────────────────────────
const VFHook: React.FC<{ s: VFScene; frame: number; fps: number }> = ({ s, frame, fps }) => {
  const col = SCENE_COLORS[s.colorIdx ?? 0];
  const subSp = spring({ frame, fps, config: { stiffness: 50, damping: 18 }, delay: 40 });
  const lineSp = spring({ frame, fps, config: { stiffness: 80, damping: 22 }, delay: 20 });
  const lineW  = interpolate(lineSp, [0, 1], [0, 200]);

  return (
    <AbsoluteFill>
      <FlowBG frame={frame} from={col.from} to={col.to} />
      {s.eyebrow && (
        <div style={{
          position: 'absolute', top: 80, left: 0, right: 0, textAlign: 'center', zIndex: 2,
          fontFamily: '"Inter", system-ui, sans-serif', fontSize: 22, fontWeight: 700,
          color: 'rgba(255,255,255,0.8)', letterSpacing: 5, textTransform: 'uppercase',
          opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
        }}>
          {s.eyebrow}
        </div>
      )}
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 56px', gap: 20, zIndex: 2 }}>
        <AnimLetters text={s.headline} frame={frame} fps={fps} delay={0} fontSize={165} />
        <div style={{ width: lineW, height: 4, background: 'rgba(255,255,255,0.6)', borderRadius: 2, margin: '8px 0' }} />
        {s.sub && (
          <div style={{
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: 42, color: 'rgba(255,255,255,0.88)', textAlign: 'center', lineHeight: 1.35,
            opacity: subSp, transform: `translateY(${interpolate(subSp,[0,1],[30,0])}px)`,
            maxWidth: 880,
          }}>
            {s.sub}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE: STAT ───────────────────────────────────────────────────────────────
const VFStat: React.FC<{ s: VFScene; frame: number; fps: number }> = ({ s, frame, fps }) => {
  const col = SCENE_COLORS[s.colorIdx ?? 1];
  const stats = s.stats ?? [];

  return (
    <AbsoluteFill>
      <FlowBG frame={frame} from={col.from} to={col.to} />
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 64px', gap: 28, zIndex: 2 }}>
        <AnimLetters text={s.headline} frame={frame} fps={fps} delay={0} fontSize={96} align="left" />
        {stats.map((st, i) => {
          const delay = 20 + i * 16;
          const sp = spring({ frame, fps, config: { stiffness: 60, damping: 18 }, delay });
          return (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)', borderRadius: 24,
              padding: '22px 32px', display: 'flex', alignItems: 'center', gap: 24,
              opacity: sp, transform: `translateY(${interpolate(sp,[0,1],[50,0])}px) scale(${interpolate(sp,[0,1],[0.9,1])})`,
            }}>
              <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 110, color: '#FFFFFF', lineHeight: 1, minWidth: 220, textAlign: 'right', textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                {st.v}
              </div>
              <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 36, color: 'rgba(255,255,255,0.9)', lineHeight: 1.3 }}>
                {st.l}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE: LIST ───────────────────────────────────────────────────────────────
const VFList: React.FC<{ s: VFScene; frame: number; fps: number }> = ({ s, frame, fps }) => {
  const col = SCENE_COLORS[s.colorIdx ?? 2];
  const items = s.items ?? [];

  return (
    <AbsoluteFill>
      <FlowBG frame={frame} from={col.from} to={col.to} />
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 64px', gap: 24, zIndex: 2 }}>
        <AnimLetters text={s.headline} frame={frame} fps={fps} delay={0} fontSize={96} align="left" />
        {items.map((item, i) => {
          const delay = 18 + i * 12;
          const sp = spring({ frame, fps, config: { stiffness: 65, damping: 18 }, delay });
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 20,
              opacity: sp, transform: `translateX(${interpolate(sp,[0,1],[-60,0])}px)`,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)',
                border: '1.5px solid rgba(255,255,255,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 26, color: '#fff' }}>{i + 1}</span>
              </div>
              <div style={{
                flex: 1, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.25)', borderRadius: 18, padding: '14px 22px',
              }}>
                <span style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 36, color: '#FFFFFF', lineHeight: 1.3, fontWeight: 500 }}>
                  {item}
                </span>
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE: CTA ────────────────────────────────────────────────────────────────
const VFCTA: React.FC<{ s: VFScene; frame: number; fps: number }> = ({ s, frame, fps }) => {
  const col = SCENE_COLORS[s.colorIdx ?? 3];
  const btnSp = spring({ frame, fps, config: { stiffness: 55, damping: 18 }, delay: 30 });
  const pulse = 1 + Math.sin(frame * 0.12) * 0.025;

  return (
    <AbsoluteFill>
      <FlowBG frame={frame} from={col.from} to={col.to} />
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 64px', gap: 36, zIndex: 2 }}>
        <AnimLetters text={s.headline} frame={frame} fps={fps} delay={0} fontSize={165} />

        {/* CTA pill */}
        <div style={{
          background: '#FFFFFF', borderRadius: 100, padding: '24px 72px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
          opacity: btnSp, transform: `scale(${interpolate(btnSp,[0,1],[0.7,1]) * pulse})`,
        }}>
          <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 34, fontWeight: 800, color: col.from, textAlign: 'center' }}>
            {s.sub ?? 'smartops-ia.com.br'}
          </div>
        </div>

        <div style={{
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: 26, color: 'rgba(255,255,255,0.7)',
          letterSpacing: 4, textTransform: 'uppercase',
          opacity: interpolate(frame, [40, 58], [0, 1], { extrapolateRight: 'clamp' }),
        }}>
          Lean · Six Sigma · IA · BH/MG
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
export function buildVividFlowProject(): VividFlowProject {
  return {
    scenes: [
      { type: 'hook', duration: 6, colorIdx: 0, eyebrow: 'SmartOps IA · Consultoria', headline: 'Sua empresa perde dinheiro todo mês.', sub: 'E dá pra mudar isso em 4 semanas.' },
      { type: 'stat', duration: 9, colorIdx: 1, headline: 'Com SmartOps IA:', stats: [
        { v: '−32%', l: 'custo operacional eliminado com Lean' },
        { v: '+45%', l: 'processos automatizados com IA' },
        { v: '3×',   l: 'capacidade sem contratar' },
      ]},
      { type: 'list', duration: 9, colorIdx: 2, headline: 'O que fazemos:', items: [
        'Diagnóstico Lean presencial em BH/MG',
        'Automação n8n + IA em 4 semanas',
        'Dashboard de KPIs em tempo real',
        'Black Belt com foco em resultado',
      ]},
      { type: 'cta', duration: 6, colorIdx: 3, headline: 'Diagnóstico Gratuito', sub: 'smartops-ia.com.br · 30 min · BH/MG' },
    ],
  };
}

export const VividFlowTemplate: React.FC<{ project?: VividFlowProject }> = ({ project }) => {
  const { fps } = useVideoConfig();
  const frame   = useCurrentFrame();
  const scenes  = project?.scenes ?? buildVividFlowProject().scenes;
  const ranges  = scenes.reduce<{ start: number; end: number; scene: VFScene }[]>(
    (acc, s) => { const start = acc.length > 0 ? acc[acc.length-1].end : 0; return [...acc, { start, end: start + s.duration * fps, scene: s }]; }, [],
  );
  const cur = ranges.find(r => frame >= r.start && frame < r.end) ?? ranges[ranges.length-1];
  const sf  = frame - cur.start;
  const s   = cur.scene;

  switch (s.type) {
    case 'hook': return <VFHook s={s} frame={sf} fps={fps} />;
    case 'stat': return <VFStat s={s} frame={sf} fps={fps} />;
    case 'list': return <VFList s={s} frame={sf} fps={fps} />;
    case 'cta':  return <VFCTA  s={s} frame={sf} fps={fps} />;
    default:     return <VFHook s={s} frame={sf} fps={fps} />;
  }
};
