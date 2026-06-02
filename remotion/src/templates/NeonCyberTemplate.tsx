// NeonCyberTemplate.tsx
// Estilo: Neon-Noir — fundo preto + neon vermelho/ciano, overlays CCTV/surveillance, scan lines
// Tendência viral 2025 para tech B2B: cyberpunk, heatmap data, grids de rastreamento

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

const C = {
  bg:      '#030306',
  surface: '#0A0A12',
  red:     '#FF1744',   // neon vermelho
  cyan:    '#00F5FF',   // neon ciano
  yellow:  '#FFD600',   // alerta
  magenta: '#F50057',   // destaque
  text:    '#FFFFFF',
  textDim: '#8888AA',
  redGlow: 'rgba(255,23,68,0.22)',
  cyanGlow:'rgba(0,245,255,0.18)',
};

// ── SCAN LINE OVERLAY ────────────────────────────────────────────────────────
const ScanLines: React.FC<{ opacity?: number }> = ({ opacity = 0.04 }) => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10,
    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.3) 3px, rgba(0,0,0,0.3) 4px)',
    opacity,
  }} />
);

// ── GRID OVERLAY ─────────────────────────────────────────────────────────────
const CyberGrid: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 20], [0, 0.06], { extrapolateRight: 'clamp' });
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: `
        linear-gradient(${C.cyan}44 1px, transparent 1px),
        linear-gradient(90deg, ${C.cyan}44 1px, transparent 1px)
      `,
      backgroundSize: '60px 60px',
      opacity,
    }} />
  );
};

// ── CORNER BRACKETS (CCTV aesthetic) ────────────────────────────────────────
const CornerBrackets: React.FC<{ frame: number }> = ({ frame }) => {
  const op = interpolate(frame, [5, 30], [0, 1], { extrapolateRight: 'clamp' });
  const size = 44;
  const thick = 3;
  const cornerStyle = (top: boolean, left: boolean): React.CSSProperties => ({
    position: 'absolute',
    width: size, height: size,
    borderTop:    top  ? `${thick}px solid ${C.red}` : 'none',
    borderBottom: !top ? `${thick}px solid ${C.red}` : 'none',
    borderLeft:   left  ? `${thick}px solid ${C.red}` : 'none',
    borderRight:  !left ? `${thick}px solid ${C.red}` : 'none',
    top:    top  ? 40 : 'auto',
    bottom: !top ? 40 : 'auto',
    left:   left  ? 40 : 'auto',
    right:  !left ? 40 : 'auto',
    opacity: op,
    boxShadow: `0 0 12px ${C.red}`,
  });
  return (
    <>
      <div style={cornerStyle(true, true)} />
      <div style={cornerStyle(true, false)} />
      <div style={cornerStyle(false, true)} />
      <div style={cornerStyle(false, false)} />
    </>
  );
};

// ── GLITCH TEXT ──────────────────────────────────────────────────────────────
const GlitchText: React.FC<{ text: string; frame: number; fontSize: number; color?: string }> = ({
  text, frame, fontSize, color = C.text,
}) => {
  const glitch = (frame % 40 < 2) ? 3 : (frame % 97 < 1) ? -2 : 0;
  const glitchColor = glitch !== 0 ? C.red : 'transparent';

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Glitch clone */}
      {glitch !== 0 && (
        <div style={{
          position: 'absolute', inset: 0,
          fontFamily: '"Bebas Neue", Impact, sans-serif',
          fontSize, color: glitchColor,
          transform: `translateX(${glitch}px)`,
          opacity: 0.7, userSelect: 'none',
          textTransform: 'uppercase',
        }}>
          {text}
        </div>
      )}
      <div style={{
        fontFamily: '"Bebas Neue", Impact, sans-serif',
        fontSize, color, textTransform: 'uppercase',
        letterSpacing: 3, lineHeight: 0.95,
        textShadow: `0 0 30px ${C.red}88, 0 0 60px ${C.red}44`,
      }}>
        {text}
      </div>
    </div>
  );
};

// ── SCENE: HOOK ───────────────────────────────────────────────────────────────
const NeonHook: React.FC<{ frame: number; fps: number; headline: string; sub?: string }> = ({ frame, fps, headline, sub }) => {
  const mainSp  = spring({ frame, fps, config: { stiffness: 40, damping: 16 }, delay: 8 });
  const subSp   = spring({ frame, fps, config: { stiffness: 35, damping: 18 }, delay: 30 });
  const redLineW = interpolate(frame, [10, 50], [0, 200], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const cyanW    = interpolate(frame, [20, 60], [0, 120], { extrapolateRight: 'clamp' });
  const orbOp    = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <CyberGrid frame={frame} />
      <ScanLines />
      <CornerBrackets frame={frame} />

      {/* Red orb top-left */}
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: `radial-gradient(circle, ${C.red} 0%, transparent 70%)`,
        top: -150, left: -100, opacity: orbOp * 0.25, filter: 'blur(60px)',
      }} />
      {/* Cyan orb bottom-right */}
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: `radial-gradient(circle, ${C.cyan} 0%, transparent 70%)`,
        bottom: -100, right: -80, opacity: orbOp * 0.2, filter: 'blur(80px)',
      }} />

      {/* REC indicator */}
      <div style={{
        position: 'absolute', top: 60, right: 80, display: 'flex', alignItems: 'center', gap: 10,
        opacity: interpolate(frame, [5, 20], [0, 1], { extrapolateRight: 'clamp' }),
      }}>
        <div style={{
          width: 14, height: 14, borderRadius: '50%',
          background: C.red,
          boxShadow: `0 0 20px ${C.red}`,
          opacity: Math.sin(frame * 0.15) * 0.5 + 0.5,
        }} />
        <span style={{ fontFamily: '"Inter", monospace', fontSize: 18, color: C.red, letterSpacing: 2, fontWeight: 700 }}>REC</span>
      </div>

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 72px', gap: 24, zIndex: 5 }}>
        <div style={{ opacity: mainSp, transform: `translateY(${interpolate(mainSp, [0, 1], [70, 0])}px)`, textAlign: 'center' }}>
          <GlitchText text={headline} frame={frame} fontSize={155} />
        </div>

        {/* Dual accent lines */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ width: redLineW, height: 3, background: C.red, boxShadow: `0 0 12px ${C.red}`, borderRadius: 2 }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.cyan, boxShadow: `0 0 16px ${C.cyan}` }} />
          <div style={{ width: cyanW, height: 3, background: C.cyan, boxShadow: `0 0 12px ${C.cyan}`, borderRadius: 2 }} />
        </div>

        {sub && (
          <div style={{
            opacity: subSp,
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: 32, color: C.textDim, textAlign: 'center', lineHeight: 1.4,
          }}>
            {sub}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE: DATA / ALERT ───────────────────────────────────────────────────────
const NeonData: React.FC<{ frame: number; fps: number; headline: string; metrics: { value: string; label: string; color?: string }[] }> = ({ frame, fps, headline, metrics }) => {
  const hOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <CyberGrid frame={frame} />
      <ScanLines />
      <CornerBrackets frame={frame} />

      {/* Heatmap horizontal lines */}
      {[0.2, 0.35, 0.55, 0.7, 0.85].map((t, i) => (
        <div key={i} style={{
          position: 'absolute', left: 0, right: 0, top: `${t * 100}%`,
          height: 1, background: `${C.cyan}22`,
          opacity: interpolate(frame, [i * 8, i * 8 + 20], [0, 1], { extrapolateRight: 'clamp' }),
        }} />
      ))}

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 72px', gap: 32, zIndex: 5 }}>
        <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 90, color: C.cyan, letterSpacing: 2, opacity: hOp, textShadow: `0 0 30px ${C.cyan}` }}>
          {headline}
        </div>

        {metrics.map((m, i) => {
          const delay = 18 + i * 16;
          const sp = spring({ frame, fps, config: { stiffness: 55, damping: 16 }, delay });
          const x = interpolate(sp, [0, 1], [-100, 0]);
          const accent = m.color ?? (i % 2 === 0 ? C.red : C.cyan);
          const barW = interpolate(frame, [delay + 10, delay + 45], [0, 260], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });

          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 28,
              background: `${C.surface}CC`, border: `1px solid ${accent}44`,
              borderLeft: `4px solid ${accent}`, borderRadius: '0 16px 16px 0',
              padding: '20px 32px',
              opacity: sp, transform: `translateX(${x}px)`,
              boxShadow: `inset 0 0 20px ${accent}11`,
            }}>
              <div style={{
                fontFamily: '"Bebas Neue", Impact, sans-serif',
                fontSize: 94, color: accent, lineHeight: 1, minWidth: 200, textAlign: 'right',
                textShadow: `0 0 40px ${accent}`,
              }}>
                {m.value}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 28, color: C.text, lineHeight: 1.3 }}>{m.label}</div>
                <div style={{ width: barW, height: 3, background: accent, marginTop: 10, borderRadius: 2, boxShadow: `0 0 8px ${accent}` }} />
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE: REVEAL ─────────────────────────────────────────────────────────────
const NeonReveal: React.FC<{ frame: number; fps: number; headline: string; items: string[] }> = ({ frame, fps, headline, items }) => {
  const hSp = spring({ frame, fps, config: { stiffness: 50, damping: 16 }, delay: 5 });

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <CyberGrid frame={frame} />
      <ScanLines />
      <CornerBrackets frame={frame} />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 72px', gap: 28, zIndex: 5 }}>
        <div style={{
          fontFamily: '"Bebas Neue", Impact, sans-serif',
          fontSize: 96, color: C.cyan, letterSpacing: 2,
          opacity: hSp, textShadow: `0 0 40px ${C.cyan}`,
          transform: `translateX(${interpolate(hSp, [0, 1], [-50, 0])}px)`,
        }}>
          {headline}
        </div>

        {items.map((item, i) => {
          const delay = 20 + i * 14;
          const sp = spring({ frame, fps, config: { stiffness: 60, damping: 18 }, delay });

          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 20,
              opacity: sp, transform: `translateX(${interpolate(sp, [0, 1], [60, 0])}px)`,
            }}>
              <div style={{
                fontFamily: '"Inter", monospace',
                fontSize: 22, color: C.red, minWidth: 36, paddingTop: 4,
                textShadow: `0 0 10px ${C.red}`,
              }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 44, color: C.text, lineHeight: 1.35 }}>
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
const NeonCTA: React.FC<{ frame: number; fps: number; ctaText: string; ctaSub: string }> = ({ frame, fps, ctaText, ctaSub }) => {
  const mainSp = spring({ frame, fps, config: { stiffness: 45, damping: 16 }, delay: 5 });
  const btnSp  = spring({ frame, fps, config: { stiffness: 55, damping: 18 }, delay: 28 });
  const pulse  = Math.sin(frame * 0.1) * 0.06 + 0.94;

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <CyberGrid frame={frame} />
      <ScanLines />
      <CornerBrackets frame={frame} />

      {/* Center glow */}
      <div style={{
        position: 'absolute', width: 800, height: 800, borderRadius: '50%',
        background: `radial-gradient(circle, ${C.red}33 0%, transparent 65%)`,
        top: '50%', left: '50%',
        transform: `translate(-50%, -50%) scale(${pulse})`,
        filter: 'blur(40px)',
      }} />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 72px', gap: 36, zIndex: 5 }}>
        <div style={{ opacity: mainSp, transform: `translateY(${interpolate(mainSp, [0, 1], [60, 0])}px)`, textAlign: 'center' }}>
          <GlitchText text={ctaText} frame={frame} fontSize={148} color={C.text} />
        </div>

        {/* CTA button — neon border */}
        <div style={{
          border: `2px solid ${C.red}`,
          borderRadius: 4, padding: '20px 60px',
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: 32, fontWeight: 700, color: C.red,
          letterSpacing: 3, textTransform: 'uppercase',
          opacity: btnSp, transform: `scale(${interpolate(btnSp, [0, 1], [0.8, 1])})`,
          boxShadow: `0 0 40px ${C.red}55, inset 0 0 20px ${C.red}11`,
          background: `${C.red}0A`,
        }}>
          {ctaSub}
        </div>

        <div style={{
          fontFamily: '"Inter", monospace',
          fontSize: 22, color: C.cyan, letterSpacing: 4,
          opacity: interpolate(frame, [45, 65], [0, 0.9], { extrapolateRight: 'clamp' }),
          textShadow: `0 0 16px ${C.cyan}`,
        }}>
          LEAN · SIX SIGMA · IA · BH/MG
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
interface NeonScene {
  type: 'hook' | 'data' | 'reveal' | 'cta';
  duration: number;
  headline?: string;
  sub?: string;
  metrics?: { value: string; label: string; color?: string }[];
  items?: string[];
  ctaText?: string;
  ctaSub?: string;
}

export interface NeonCyberProject { scenes: NeonScene[] }

export function buildNeonCyberProject(): NeonCyberProject {
  return {
    scenes: [
      { type: 'hook', duration: 5, headline: 'Quanto custa o caos na sua empresa?', sub: 'Cada dia sem processo é dinheiro que não volta.' },
      { type: 'data', duration: 10, headline: '⚠ DIAGNÓSTICO: PME TÍPICA BH/MG', metrics: [
        { value: 'R$41k', label: 'perdidos por mês em retrabalho e desperdício', color: C.red },
        { value: '68%',   label: 'dos processos críticos existem só na cabeça do dono', color: C.yellow },
        { value: '23h',   label: 'semanais gastas em tarefas que poderiam ser automatizadas', color: C.cyan },
      ]},
      { type: 'reveal', duration: 8, headline: 'O QUE SMARTOPS IA ENTREGA:', items: [
        'Eliminação de retrabalho com Lean Six Sigma',
        'Automações n8n + IA rodando 24/7',
        'Processos documentados e rastreáveis',
        'ROI mensurável em 90 dias',
      ]},
      { type: 'cta', duration: 7, ctaText: 'Diagnóstico Gratuito', ctaSub: 'smartops-ia.com.br' },
    ],
  };
}

export const NeonCyberTemplate: React.FC<{ project?: NeonCyberProject }> = ({ project }) => {
  const { fps } = useVideoConfig();
  const frame   = useCurrentFrame();
  const scenes  = project?.scenes ?? buildNeonCyberProject().scenes;

  const ranges = scenes.reduce<{ start: number; end: number; scene: NeonScene }[]>(
    (acc, s) => {
      const start = acc.length > 0 ? acc[acc.length - 1].end : 0;
      return [...acc, { start, end: start + s.duration * fps, scene: s }];
    }, [],
  );

  const cur = ranges.find(r => frame >= r.start && frame < r.end) ?? ranges[ranges.length - 1];
  const sf  = frame - cur.start;
  const s   = cur.scene;

  switch (s.type) {
    case 'hook':   return <NeonHook   frame={sf} fps={fps} headline={s.headline!} sub={s.sub} />;
    case 'data':   return <NeonData   frame={sf} fps={fps} headline={s.headline!} metrics={s.metrics!} />;
    case 'reveal': return <NeonReveal frame={sf} fps={fps} headline={s.headline!} items={s.items!} />;
    case 'cta':    return <NeonCTA    frame={sf} fps={fps} ctaText={s.ctaText!} ctaSub={s.ctaSub!} />;
    default:       return <NeonHook   frame={sf} fps={fps} headline={s.headline ?? ''} />;
  }
};
