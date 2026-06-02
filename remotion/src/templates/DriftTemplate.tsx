// DriftTemplate.tsx
// Dinâmico · Leve · Elegante
// Fundo escuro com shapes geométricas grandes que "derivam" lentamente —
// círculos, retângulos e linhas em movimento paralax suave. Texto limpo e arejado.
// Sensação: premium SaaS + motion design sofisticado + espaço para respirar.

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

const C = {
  bg:     '#080812',
  text:   '#FFFFFF',
  dimW:   'rgba(255,255,255,0.60)',
  mutW:   'rgba(255,255,255,0.35)',
};

export type DriftPalette = 'indigo' | 'teal' | 'rose';

const PALETTES = {
  indigo: { a: '#4F46E5', b: '#818CF8', c: '#C7D2FE' },
  teal:   { a: '#0D9488', b: '#2DD4BF', c: '#99F6E4' },
  rose:   { a: '#E11D48', b: '#FB7185', c: '#FCA5A5' },
};

// ── DRIFTING SHAPES BACKGROUND ────────────────────────────────────────────────
const DriftBG: React.FC<{ frame: number; palette: typeof PALETTES.indigo }> = ({ frame, palette }) => {
  const t = frame / 30;
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 1080 1920">
      {/* Large circle — slow drift */}
      <circle
        cx={300 + Math.sin(t * 0.18) * 80}
        cy={500 + Math.cos(t * 0.14) * 120}
        r={380}
        fill={palette.a} opacity={0.12}
      />
      {/* Medium circle — different speed */}
      <circle
        cx={850 + Math.cos(t * 0.22) * 60}
        cy={1300 + Math.sin(t * 0.16) * 100}
        r={280}
        fill={palette.b} opacity={0.10}
      />
      {/* Small accent circle */}
      <circle
        cx={800 + Math.sin(t * 0.3) * 40}
        cy={400 + Math.cos(t * 0.25) * 60}
        r={150}
        fill={palette.c} opacity={0.12}
      />
      {/* Thin rings */}
      <circle cx={540} cy={960} r={520} fill="none" stroke={palette.a} strokeWidth={0.8} opacity={0.08} />
      <circle cx={540} cy={960} r={380} fill="none" stroke={palette.b} strokeWidth={0.5} opacity={0.06} />
      {/* Diagonal line accents */}
      <line x1={0} y1={800} x2={1080} y2={900} stroke={palette.a} strokeWidth={0.6} opacity={0.08} />
      <line x1={0} y1={1100} x2={1080} y2={1000} stroke={palette.b} strokeWidth={0.5} opacity={0.06} />
    </svg>
  );
};

// ── WORD REVEAL LINE BY LINE ───────────────────────────────────────────────────
const RevealText: React.FC<{
  lines: string[]; frame: number; fps: number;
  startDelay?: number; fontSize: number; color?: string; align?: 'left' | 'center';
}> = ({ lines, frame, fps, startDelay = 0, fontSize, color = C.text, align = 'left' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: fontSize * 0.06, alignItems: align === 'center' ? 'center' : 'flex-start' }}>
    {lines.map((line, i) => {
      const delay = startDelay + i * 10;
      const sp = spring({ frame, fps, config: { stiffness: 60, damping: 20 }, delay });
      const y  = interpolate(sp, [0, 1], [fontSize * 0.6, 0]);
      return (
        <div key={i} style={{ overflow: 'hidden', paddingBottom: fontSize * 0.06 }}>
          <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize, color, lineHeight: 0.9, letterSpacing: 2, textTransform: 'uppercase', opacity: sp, transform: `translateY(${y}px)` }}>
            {line}
          </div>
        </div>
      );
    })}
  </div>
);

// ── TAG PILL ─────────────────────────────────────────────────────────────────
const Tag: React.FC<{ text: string; color: string; frame: number; delay?: number; fps: number }> = ({ text, color, frame, delay = 0, fps }) => {
  const sp = spring({ frame, fps, config: { stiffness: 80, damping: 20 }, delay });
  return (
    <div style={{
      display: 'inline-flex', alignSelf: 'flex-start',
      background: `${color}22`, border: `1px solid ${color}55`,
      borderRadius: 100, padding: '8px 24px',
      fontFamily: '"Inter", system-ui, sans-serif', fontSize: 20, fontWeight: 700,
      color, letterSpacing: 4, textTransform: 'uppercase',
      opacity: sp, transform: `translateY(${interpolate(sp,[0,1],[-20,0])}px)`,
    }}>
      {text}
    </div>
  );
};

// ── SCENE: OPEN ───────────────────────────────────────────────────────────────
const DriftOpen: React.FC<{ frame: number; fps: number; lines: string[]; sub?: string; tag?: string; pal: typeof PALETTES.indigo }> = ({ frame, fps, lines, sub, tag, pal }) => {
  const subSp = spring({ frame, fps, config: { stiffness: 50, damping: 20 }, delay: lines.length * 10 + 18 });
  const lineSp = spring({ frame, fps, config: { stiffness: 80, damping: 22 }, delay: 8 });
  const lineW = interpolate(lineSp, [0, 1], [0, 120]);

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <DriftBG frame={frame} palette={pal} />
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 72px', gap: 20, zIndex: 2 }}>
        {tag && <Tag text={tag} color={pal.b} frame={frame} delay={0} fps={fps} />}
        <RevealText lines={lines} frame={frame} fps={fps} startDelay={6} fontSize={165} />
        <div style={{ width: lineW, height: 3, background: `linear-gradient(90deg, ${pal.a}, ${pal.b})`, borderRadius: 2, margin: '4px 0' }} />
        {sub && (
          <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 40, color: C.dimW, lineHeight: 1.4, maxWidth: 840, opacity: subSp, transform: `translateY(${interpolate(subSp,[0,1],[24,0])}px)` }}>
            {sub}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE: METRICS ────────────────────────────────────────────────────────────
const DriftMetrics: React.FC<{ frame: number; fps: number; label: string; metrics: { v: string; l: string; delta?: string }[]; pal: typeof PALETTES.indigo }> = ({ frame, fps, label, metrics, pal }) => {
  const hSp = spring({ frame, fps, config: { stiffness: 60, damping: 20 }, delay: 2 });
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <DriftBG frame={frame} palette={pal} />
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 72px', gap: 28, zIndex: 2 }}>
        <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 24, fontWeight: 700, letterSpacing: 5, color: pal.b, textTransform: 'uppercase', opacity: hSp }}>
          {label}
        </div>
        {metrics.map((m, i) => {
          const delay = 12 + i * 14;
          const sp = spring({ frame, fps, config: { stiffness: 55, damping: 20 }, delay });
          return (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '180px 1fr',
              alignItems: 'center', gap: 28,
              opacity: sp, transform: `translateX(${interpolate(sp,[0,1],[-50,0])}px)`,
            }}>
              {/* Big value */}
              <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 120, color: pal.a, lineHeight: 1, textAlign: 'right', textShadow: `0 0 40px ${pal.a}66` }}>
                {m.v}
              </div>
              {/* Label + delta */}
              <div>
                <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 34, color: C.text, lineHeight: 1.3 }}>{m.l}</div>
                {m.delta && (
                  <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 24, color: pal.c, marginTop: 6, fontWeight: 700 }}>
                    {m.delta}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE: FEATURES ───────────────────────────────────────────────────────────
const DriftFeatures: React.FC<{ frame: number; fps: number; headline: string; items: string[]; pal: typeof PALETTES.indigo }> = ({ frame, fps, headline, items, pal }) => {
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <DriftBG frame={frame} palette={pal} />
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 72px', gap: 24, zIndex: 2 }}>
        <RevealText lines={[headline]} frame={frame} fps={fps} startDelay={0} fontSize={100} />
        {items.map((item, i) => {
          const delay = 16 + i * 12;
          const sp = spring({ frame, fps, config: { stiffness: 65, damping: 20 }, delay });
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 18,
              opacity: sp, transform: `translateY(${interpolate(sp,[0,1],[30,0])}px)`,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: pal.b, marginTop: 20, flexShrink: 0, boxShadow: `0 0 12px ${pal.b}` }} />
              <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 38, color: C.dimW, lineHeight: 1.35, letterSpacing: 0.5 }}>
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
const DriftCTA: React.FC<{ frame: number; fps: number; ctaLine1: string; ctaLine2: string; pal: typeof PALETTES.indigo }> = ({ frame, fps, ctaLine1, ctaLine2, pal }) => {
  const btnSp = spring({ frame, fps, config: { stiffness: 55, damping: 18 }, delay: 26 });
  const subSp = spring({ frame, fps, config: { stiffness: 45, damping: 20 }, delay: 44 });

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <DriftBG frame={frame} palette={pal} />
      {/* Center glow */}
      <div style={{ position: 'absolute', width: 900, height: 900, borderRadius: '50%', background: `radial-gradient(circle, ${pal.a}22 0%, transparent 65%)`, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', filter: 'blur(60px)' }} />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 72px', gap: 32, zIndex: 2 }}>
        <RevealText lines={[ctaLine1, ctaLine2]} frame={frame} fps={fps} startDelay={2} fontSize={155} align="center" />

        <div style={{
          background: `linear-gradient(135deg, ${pal.a}, ${pal.b})`,
          borderRadius: 100, padding: '22px 72px',
          fontFamily: '"Inter", system-ui, sans-serif', fontSize: 34, fontWeight: 800, color: '#fff',
          opacity: btnSp, transform: `scale(${interpolate(btnSp,[0,1],[0.75,1])})`,
          boxShadow: `0 0 50px ${pal.a}55`,
        }}>
          smartops-ia.com.br · BH/MG
        </div>

        <div style={{
          fontFamily: '"Inter", system-ui, sans-serif', fontSize: 24, color: C.mutW,
          letterSpacing: 5, textTransform: 'uppercase',
          opacity: subSp,
        }}>
          Lean · Six Sigma · Automação · IA
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
interface DScene {
  type: 'open' | 'metrics' | 'features' | 'cta';
  duration: number;
  lines?: string[]; sub?: string; tag?: string;
  label?: string; metrics?: { v: string; l: string; delta?: string }[];
  headline?: string; items?: string[];
  ctaLine1?: string; ctaLine2?: string;
}

export interface DriftProject { palette?: DriftPalette; scenes: DScene[] }

export function buildDriftProject(palette: DriftPalette = 'indigo'): DriftProject {
  return {
    palette,
    scenes: [
      { type: 'open', duration: 6, tag: 'SmartOps IA · BH/MG', lines: ['Processo', 'sob controle.'], sub: 'Lean Six Sigma + IA para PMEs que crescem.' },
      { type: 'metrics', duration: 9, label: 'Em 90 dias', metrics: [
        { v: '−32%', l: 'custo operacional', delta: 'com Lean Six Sigma' },
        { v: '+45%', l: 'automação com IA', delta: 'via n8n + Claude' },
        { v: '3×',   l: 'capacidade sem contratar', delta: 'processos documentados' },
      ]},
      { type: 'features', duration: 8, headline: 'Como fazemos:', items: [
        'Diagnóstico presencial — in loco na sua empresa',
        'Lean elimina desperdícios visíveis e ocultos',
        'Automações n8n entram em produção em 4 semanas',
        'Dashboard de KPIs para decisões por dados',
      ]},
      { type: 'cta', duration: 6, ctaLine1: 'Diagnóstico', ctaLine2: 'Gratuito' },
    ],
  };
}

export const DriftTemplate: React.FC<{ project?: DriftProject }> = ({ project }) => {
  const { fps } = useVideoConfig();
  const frame   = useCurrentFrame();
  const p = project ?? buildDriftProject('indigo');
  const pal = PALETTES[p.palette ?? 'indigo'];

  const ranges = p.scenes.reduce<{ start: number; end: number; scene: DScene }[]>(
    (acc, s) => { const start = acc.length > 0 ? acc[acc.length-1].end : 0; return [...acc, { start, end: start + s.duration * fps, scene: s }]; }, [],
  );
  const cur = ranges.find(r => frame >= r.start && frame < r.end) ?? ranges[ranges.length-1];
  const sf  = frame - cur.start;
  const s   = cur.scene;

  switch (s.type) {
    case 'open':     return <DriftOpen     frame={sf} fps={fps} lines={s.lines!} sub={s.sub} tag={s.tag} pal={pal} />;
    case 'metrics':  return <DriftMetrics  frame={sf} fps={fps} label={s.label!} metrics={s.metrics!} pal={pal} />;
    case 'features': return <DriftFeatures frame={sf} fps={fps} headline={s.headline!} items={s.items!} pal={pal} />;
    case 'cta':      return <DriftCTA      frame={sf} fps={fps} ctaLine1={s.ctaLine1!} ctaLine2={s.ctaLine2!} pal={pal} />;
    default:         return <DriftOpen     frame={sf} fps={fps} lines={s.lines ?? ['']} pal={pal} />;
  }
};
