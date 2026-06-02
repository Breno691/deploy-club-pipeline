// GradientHeroTemplate.tsx
// Estilo: gradiente bold azul-roxo, tipografia gigante, minimal dark — trending B2B 2025

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, spring, useVideoConfig } from 'remotion';

const PALETTE = {
  bg:           '#08080E',
  gradFrom:     '#4F46E5',   // indigo
  gradTo:       '#7C3AED',   // violet
  gradAccent:   '#A855F7',   // purple
  orange:       '#F97316',   // pop accent
  text:         '#FFFFFF',
  textMuted:    '#C4B5FD',
  textDark:     '#1E1B4B',
  card:         'rgba(79,70,229,0.12)',
  border:       'rgba(168,85,247,0.25)',
};

interface Scene {
  type: 'intro' | 'stat' | 'list' | 'cta';
  duration: number;
  headline?: string;
  sub?: string;
  stats?: { value: string; label: string }[];
  items?: string[];
  ctaText?: string;
  ctaSub?: string;
}

export interface GradientHeroProject {
  scenes: Scene[];
}

const bg = (frame: number): React.CSSProperties => ({
  background: PALETTE.bg,
  position: 'absolute',
  inset: 0,
});

// ── INTRO SCENE ──────────────────────────────────────────────────────────────
const IntroScene: React.FC<{ scene: Scene; frame: number; fps: number }> = ({ scene, frame, fps }) => {
  const orb1 = interpolate(frame, [0, 60], [0.3, 0.7], { extrapolateRight: 'clamp' });
  const orb2 = interpolate(frame, [0, 45], [0, 0.5], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const lineW = interpolate(frame, [20, 55], [0, 320], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });

  const titleSpring = spring({ frame, fps, config: { stiffness: 60, damping: 18 }, delay: 5 });
  const subSpring   = spring({ frame, fps, config: { stiffness: 50, damping: 20 }, delay: 22 });
  const tagSpring   = spring({ frame, fps, config: { stiffness: 80, damping: 22 }, delay: 40 });

  const titleY = interpolate(titleSpring, [0, 1], [80, 0]);
  const subY   = interpolate(subSpring,   [0, 1], [50, 0]);
  const tagY   = interpolate(tagSpring,   [0, 1], [30, 0]);

  return (
    <AbsoluteFill style={bg(frame)}>
      {/* Gradient orbs */}
      <div style={{
        position: 'absolute', width: 800, height: 800,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${PALETTE.gradFrom} 0%, transparent 70%)`,
        top: -200, left: -200, opacity: orb1, filter: 'blur(80px)',
      }} />
      <div style={{
        position: 'absolute', width: 600, height: 600,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${PALETTE.gradAccent} 0%, transparent 70%)`,
        bottom: 100, right: -100, opacity: orb2, filter: 'blur(100px)',
      }} />

      {/* Tag line top */}
      <div style={{
        position: 'absolute', top: 120, left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
        transform: `translateY(${tagY}px)`,
        opacity: tagSpring,
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${PALETTE.gradFrom}, ${PALETTE.gradAccent})`,
          borderRadius: 100, padding: '10px 32px',
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: 22, fontWeight: 700, letterSpacing: 3,
          color: '#fff', textTransform: 'uppercase',
        }}>
          SmartOps IA · BH/MG
        </div>
      </div>

      {/* Main content */}
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 72px' }}>
        {/* Headline */}
        <div style={{
          fontFamily: '"Bebas Neue", Impact, sans-serif',
          fontSize: 155, fontWeight: 700, color: PALETTE.text,
          textAlign: 'center', lineHeight: 0.95, letterSpacing: 2,
          transform: `translateY(${titleY}px)`, opacity: titleSpring,
          textShadow: `0 0 80px ${PALETTE.gradFrom}`,
          zIndex: 2,
        }}>
          {scene.headline}
        </div>

        {/* Gradient accent line */}
        <div style={{
          width: lineW, height: 5, margin: '28px 0 24px',
          background: `linear-gradient(90deg, ${PALETTE.gradFrom}, ${PALETTE.orange}, ${PALETTE.gradAccent})`,
          borderRadius: 4, zIndex: 2,
        }} />

        {/* Sub */}
        {scene.sub && (
          <div style={{
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: 50, color: PALETTE.textMuted,
            textAlign: 'center', lineHeight: 1.4,
            transform: `translateY(${subY}px)`, opacity: subSpring,
            maxWidth: 820, zIndex: 2,
          }}>
            {scene.sub}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── STATS SCENE ──────────────────────────────────────────────────────────────
const StatScene: React.FC<{ scene: Scene; frame: number; fps: number }> = ({ scene, frame, fps }) => {
  const stats = scene.stats ?? [];
  const bgPulse = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={bg(frame)}>
      {/* Gradient mesh background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(160deg, ${PALETTE.gradFrom}22 0%, ${PALETTE.bg} 50%, ${PALETTE.gradAccent}22 100%)`,
        opacity: bgPulse,
      }} />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 64px', gap: 40 }}>
        {/* Headline */}
        <div style={{
          fontFamily: '"Bebas Neue", Impact, sans-serif',
          fontSize: 96, color: PALETTE.text, textAlign: 'center',
          letterSpacing: 2, lineHeight: 1,
          opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' }),
        }}>
          {scene.headline}
        </div>

        {/* Stats grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', maxWidth: 880 }}>
          {stats.map((stat, i) => {
            const delay = 15 + i * 18;
            const sp = spring({ frame, fps, config: { stiffness: 55, damping: 16 }, delay });
            const xVal = interpolate(sp, [0, 1], [-80, 0]);

            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center',
                background: PALETTE.card, border: `1.5px solid ${PALETTE.border}`,
                borderRadius: 20, padding: '24px 36px', gap: 28,
                transform: `translateX(${xVal}px)`, opacity: sp,
                backdropFilter: 'blur(8px)',
              }}>
                <div style={{
                  fontFamily: '"Bebas Neue", Impact, sans-serif',
                  fontSize: 96, color: PALETTE.orange,
                  lineHeight: 1, minWidth: 180, textAlign: 'right',
                  textShadow: `0 0 40px ${PALETTE.orange}88`,
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontSize: 30, color: PALETTE.textMuted, lineHeight: 1.3,
                }}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── LIST SCENE ────────────────────────────────────────────────────────────────
const ListScene: React.FC<{ scene: Scene; frame: number; fps: number }> = ({ scene, frame, fps }) => {
  const items = scene.items ?? [];
  const lineW = interpolate(frame, [10, 40], [0, 280], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={bg(frame)}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(200deg, ${PALETTE.gradFrom}18 0%, transparent 60%, ${PALETTE.gradAccent}12 100%)`,
      }} />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 72px', gap: 32 }}>
        <div>
          <div style={{
            fontFamily: '"Bebas Neue", Impact, sans-serif',
            fontSize: 100, color: PALETTE.text, letterSpacing: 2, lineHeight: 1,
            opacity: interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' }),
          }}>
            {scene.headline}
          </div>
          <div style={{
            width: lineW, height: 4,
            background: `linear-gradient(90deg, ${PALETTE.gradFrom}, ${PALETTE.orange})`,
            borderRadius: 2, marginTop: 16,
          }} />
        </div>

        {items.map((item, i) => {
          const delay = 20 + i * 15;
          const sp = spring({ frame, fps, config: { stiffness: 60, damping: 18 }, delay });
          const yVal = interpolate(sp, [0, 1], [40, 0]);

          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 24,
              transform: `translateY(${yVal}px)`, opacity: sp,
            }}>
              <div style={{
                width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, ${PALETTE.gradFrom}, ${PALETTE.orange})`,
                boxShadow: `0 0 16px ${PALETTE.gradFrom}`,
              }} />
              <div style={{
                fontFamily: '"Inter", system-ui, sans-serif',
                fontSize: 34, color: PALETTE.text, lineHeight: 1.3,
              }}>
                {item}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── CTA SCENE ─────────────────────────────────────────────────────────────────
const CTAScene: React.FC<{ scene: Scene; frame: number; fps: number }> = ({ scene, frame, fps }) => {
  const pulse = Math.sin(frame * 0.08) * 0.04 + 0.96;
  const mainSp = spring({ frame, fps, config: { stiffness: 50, damping: 18 }, delay: 5 });
  const btnSp  = spring({ frame, fps, config: { stiffness: 60, damping: 20 }, delay: 25 });
  const subSp  = spring({ frame, fps, config: { stiffness: 40, damping: 16 }, delay: 40 });

  return (
    <AbsoluteFill style={bg(frame)}>
      {/* Full gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(160deg, ${PALETTE.gradFrom}44 0%, ${PALETTE.bg} 45%, ${PALETTE.gradAccent}33 100%)`,
      }} />
      {/* Radial center glow */}
      <div style={{
        position: 'absolute', width: 900, height: 900, borderRadius: '50%',
        background: `radial-gradient(circle, ${PALETTE.gradFrom}55 0%, transparent 65%)`,
        top: '50%', left: '50%',
        transform: `translate(-50%, -50%) scale(${pulse})`,
        filter: 'blur(60px)',
      }} />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 72px', gap: 40 }}>
        {/* Headline */}
        <div style={{
          fontFamily: '"Bebas Neue", Impact, sans-serif',
          fontSize: 148, color: PALETTE.text, textAlign: 'center',
          lineHeight: 0.95, letterSpacing: 3,
          opacity: mainSp,
          transform: `translateY(${interpolate(mainSp, [0,1], [60,0])}px)`,
          zIndex: 2,
          textShadow: `0 0 60px ${PALETTE.gradAccent}`,
        }}>
          {scene.ctaText ?? 'Diagnóstico Gratuito'}
        </div>

        {/* CTA button */}
        <div style={{
          background: `linear-gradient(135deg, ${PALETTE.gradFrom}, ${PALETTE.orange})`,
          borderRadius: 100, padding: '22px 64px',
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: 32, fontWeight: 800, color: '#fff',
          letterSpacing: 1,
          opacity: btnSp,
          transform: `scale(${interpolate(btnSp, [0, 1], [0.7, 1])})`,
          zIndex: 2, textAlign: 'center',
          boxShadow: `0 0 60px ${PALETTE.gradFrom}88`,
        }}>
          {scene.ctaSub ?? 'smartops-ia.com.br'}
        </div>

        {/* Bottom note */}
        <div style={{
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: 26, color: PALETTE.textMuted, textAlign: 'center',
          opacity: subSp, zIndex: 2,
        }}>
          Lean Six Sigma + IA · Presencial BH/MG
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── MAIN COMPOSITION ──────────────────────────────────────────────────────────
export const GradientHeroTemplate: React.FC<{ project?: GradientHeroProject }> = ({ project }) => {
  const { fps } = useVideoConfig();
  const frame   = useCurrentFrame();

  const scenes: Scene[] = project?.scenes ?? [
    {
      type: 'intro', duration: 6,
      headline: 'Sua empresa perde dinheiro todo mês sem perceber.',
      sub: 'Lean Six Sigma + IA identifica e elimina isso.',
    },
    {
      type: 'stat', duration: 9,
      headline: 'O impacto real nas PMEs',
      stats: [
        { value: '−32%', label: 'redução de custo operacional em 90 dias' },
        { value: '3×',   label: 'capacidade de entrega sem contratar' },
        { value: '+45%', label: 'produtividade com automações n8n + IA' },
      ],
    },
    {
      type: 'list', duration: 9,
      headline: 'O que entregamos',
      items: [
        'Mapeamento completo de desperdícios (VSM)',
        'Automações reais com n8n e IA em 4 semanas',
        'Dashboard de KPIs em tempo real',
        'Treinamento da equipe e SOPs prontos',
      ],
    },
    {
      type: 'cta', duration: 6,
      ctaText: 'Diagnóstico Gratuito — 30 min',
      ctaSub: 'smartops-ia.com.br · BH/MG',
    },
  ];

  const ranges = scenes.reduce<{ start: number; end: number; scene: Scene }[]>(
    (acc, s) => {
      const start = acc.length > 0 ? acc[acc.length - 1].end : 0;
      return [...acc, { start, end: start + s.duration * fps, scene: s }];
    }, [],
  );

  const cur = ranges.find(r => frame >= r.start && frame < r.end) ?? ranges[ranges.length - 1];
  const sceneFrame = frame - cur.start;

  switch (cur.scene.type) {
    case 'intro': return <IntroScene scene={cur.scene} frame={sceneFrame} fps={fps} />;
    case 'stat':  return <StatScene  scene={cur.scene} frame={sceneFrame} fps={fps} />;
    case 'list':  return <ListScene  scene={cur.scene} frame={sceneFrame} fps={fps} />;
    case 'cta':   return <CTAScene   scene={cur.scene} frame={sceneFrame} fps={fps} />;
    default:      return <IntroScene scene={cur.scene} frame={sceneFrame} fps={fps} />;
  }
};

export function buildGradientHeroProject(): GradientHeroProject {
  return {
    scenes: [
      { type: 'intro', duration: 6, headline: 'Sua empresa perde dinheiro todo mês sem perceber.', sub: 'Lean Six Sigma + IA identifica e elimina isso.' },
      { type: 'stat',  duration: 9, headline: 'O impacto real nas PMEs', stats: [
        { value: '−32%', label: 'redução de custo operacional em 90 dias' },
        { value: '3×',   label: 'capacidade de entrega sem contratar' },
        { value: '+45%', label: 'produtividade com automações n8n + IA' },
      ]},
      { type: 'list', duration: 9, headline: 'O que entregamos', items: [
        'Mapeamento completo de desperdícios (VSM)',
        'Automações reais com n8n e IA em 4 semanas',
        'Dashboard de KPIs em tempo real',
        'Treinamento da equipe e SOPs prontos',
      ]},
      { type: 'cta', duration: 6, ctaText: 'Diagnóstico Gratuito — 30 min', ctaSub: 'smartops-ia.com.br · BH/MG' },
    ],
  };
}
