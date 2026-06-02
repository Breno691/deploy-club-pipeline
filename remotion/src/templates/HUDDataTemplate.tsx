// HUDDataTemplate.tsx
// Estilo: HUD / Heads-Up Display — cockpit de dados, ciano elétrico + verde neon,
// barras de progresso com glow, scanner circular, overlays de interface futurista.
// Baseado em ESTILO 2 da pesquisa de tendências 2025-2026.

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

const C = {
  bg:     '#030712',
  bgAlt:  '#060D1F',
  cyan:   '#00D9FF',
  green:  '#00FF9C',
  orange: '#FF6B35',
  white:  '#FFFFFF',
  dimW:   'rgba(255,255,255,0.6)',
  cyanDim:'rgba(0,217,255,0.15)',
  grid:   'rgba(0,217,255,0.07)',
};

const HUDGrid: React.FC = () => (
  <div style={{
    position: 'absolute', inset: 0,
    backgroundImage: `
      linear-gradient(${C.grid} 1px, transparent 1px),
      linear-gradient(90deg, ${C.grid} 1px, transparent 1px)
    `,
    backgroundSize: '54px 54px',
  }} />
);

const ScanLine: React.FC<{ frame: number }> = ({ frame }) => {
  const y = (frame * 8) % 1920;
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, top: y, height: 3,
      background: `linear-gradient(90deg, transparent, ${C.cyan}, transparent)`,
      opacity: 0.4,
    }} />
  );
};

const ProgressBar: React.FC<{ value: number; color: string; frame: number; delay: number; fps: number }> = ({ value, color, frame, delay, fps }) => {
  const sp = spring({ frame, fps, config: { stiffness: 30, damping: 20 }, delay });
  const w = interpolate(sp, [0, 1], [0, value]);
  return (
    <div style={{ position: 'relative', height: 6, background: `${color}22`, borderRadius: 3, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: `${w}%`,
        background: color, borderRadius: 3,
        boxShadow: `0 0 12px ${color}`,
      }} />
    </div>
  );
};

// ── SCENE: BOOT ───────────────────────────────────────────────────────────────
const BootScene: React.FC<{ frame: number; fps: number; headline: string; sub?: string }> = ({ frame, fps, headline, sub }) => {
  const titleSp = spring({ frame, fps, config: { stiffness: 45, damping: 18 }, delay: 10 });
  const lineW   = interpolate(frame, [5, 45], [0, 300], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const cornerOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  const corner = (top: boolean, left: boolean) => ({
    position: 'absolute' as const,
    width: 50, height: 50,
    top: top ? 48 : 'auto', bottom: !top ? 48 : 'auto',
    left: left ? 48 : 'auto', right: !left ? 48 : 'auto',
    borderTop:    top  ? `2px solid ${C.cyan}` : 'none',
    borderBottom: !top ? `2px solid ${C.cyan}` : 'none',
    borderLeft:   left  ? `2px solid ${C.cyan}` : 'none',
    borderRight:  !left ? `2px solid ${C.cyan}` : 'none',
    opacity: cornerOp,
    boxShadow: `0 0 10px ${C.cyan}`,
  });

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <HUDGrid />
      <ScanLine frame={frame} />
      <div style={corner(true, true)} /><div style={corner(true, false)} />
      <div style={corner(false, true)} /><div style={corner(false, false)} />

      {/* Top status bar */}
      <div style={{
        position: 'absolute', top: 60, left: 80, right: 80,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        opacity: interpolate(frame, [5, 22], [0, 1], { extrapolateRight: 'clamp' }),
      }}>
        <span style={{ fontFamily: 'monospace', fontSize: 20, color: C.cyan, letterSpacing: 3 }}>SMARTOPS.SYS</span>
        <span style={{ fontFamily: 'monospace', fontSize: 18, color: C.green }}>● ACTIVE</span>
      </div>

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 72px' }}>
        <div style={{
          fontFamily: '"Bebas Neue", Impact, sans-serif',
          fontSize: 155, color: C.white, textAlign: 'center',
          lineHeight: 0.92, letterSpacing: 3, textTransform: 'uppercase',
          opacity: titleSp,
          transform: `translateY(${interpolate(titleSp, [0, 1], [70, 0])}px)`,
          textShadow: `0 0 60px ${C.cyan}55`,
          zIndex: 2,
        }}>
          {headline}
        </div>

        <div style={{
          display: 'flex', gap: 10, alignItems: 'center', margin: '28px 0 20px',
          zIndex: 2,
        }}>
          <div style={{ width: lineW, height: 2, background: C.cyan, boxShadow: `0 0 10px ${C.cyan}` }} />
          <div style={{ width: 10, height: 10, background: C.green, borderRadius: '50%', boxShadow: `0 0 16px ${C.green}` }} />
          <div style={{ width: lineW * 0.6, height: 2, background: C.green, boxShadow: `0 0 10px ${C.green}` }} />
        </div>

        {sub && (
          <div style={{
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: 38, color: C.dimW, textAlign: 'center', lineHeight: 1.4,
            opacity: interpolate(frame, [28, 50], [0, 1], { extrapolateRight: 'clamp' }),
            maxWidth: 820, zIndex: 2,
          }}>
            {sub}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE: METRICS ────────────────────────────────────────────────────────────
interface Metric { label: string; value: string; progress: number; color?: string }
const MetricsScene: React.FC<{ frame: number; fps: number; headline: string; metrics: Metric[] }> = ({ frame, fps, headline, metrics }) => {
  const hOp = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <HUDGrid />
      <ScanLine frame={frame} />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 72px', gap: 28 }}>
        <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 88, color: C.cyan, letterSpacing: 3, opacity: hOp, textShadow: `0 0 40px ${C.cyan}` }}>
          {headline}
        </div>

        {metrics.map((m, i) => {
          const delay = 16 + i * 16;
          const sp = spring({ frame, fps, config: { stiffness: 50, damping: 16 }, delay });
          const accent = m.color ?? (i % 2 === 0 ? C.cyan : C.green);
          return (
            <div key={i} style={{
              background: C.bgAlt, border: `1px solid ${accent}33`,
              borderLeft: `3px solid ${accent}`, borderRadius: '0 12px 12px 0',
              padding: '18px 28px', gap: 0,
              opacity: sp, transform: `translateX(${interpolate(sp, [0, 1], [-80, 0])}px)`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 28, color: C.dimW }}>{m.label}</span>
                <span style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 50, color: accent, textShadow: `0 0 20px ${accent}` }}>{m.value}</span>
              </div>
              <ProgressBar value={m.progress} color={accent} frame={frame} delay={delay + 10} fps={fps} />
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE: ALERT ──────────────────────────────────────────────────────────────
const AlertScene: React.FC<{ frame: number; fps: number; headline: string; items: string[] }> = ({ frame, fps, headline, items }) => {
  const pulse = Math.sin(frame * 0.12) * 0.5 + 0.5;
  const hSp = spring({ frame, fps, config: { stiffness: 50, damping: 18 }, delay: 5 });

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <HUDGrid />

      {/* Alert orb */}
      <div style={{
        position: 'absolute', width: 700, height: 700, borderRadius: '50%',
        background: `radial-gradient(circle, ${C.orange}22 0%, transparent 65%)`,
        top: '50%', left: '50%', transform: `translate(-50%, -50%) scale(${0.9 + pulse * 0.12})`,
        filter: 'blur(40px)',
      }} />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 72px', gap: 24, zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, opacity: hSp }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: C.orange, boxShadow: `0 0 20px ${C.orange}`, opacity: pulse }} />
          <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 90, color: C.orange, letterSpacing: 3 }}>
            {headline}
          </div>
        </div>

        {items.map((item, i) => {
          const sp = spring({ frame, fps, config: { stiffness: 55, damping: 18 }, delay: 18 + i * 13 });
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 20,
              opacity: sp, transform: `translateX(${interpolate(sp, [0, 1], [60, 0])}px)`,
            }}>
              <span style={{ fontFamily: 'monospace', fontSize: 24, color: C.orange, minWidth: 40 }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 36, color: C.white, lineHeight: 1.3 }}>{item}</span>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE: CTA ────────────────────────────────────────────────────────────────
const HUDCta: React.FC<{ frame: number; fps: number; ctaText: string; ctaSub: string }> = ({ frame, fps, ctaText, ctaSub }) => {
  const mainSp = spring({ frame, fps, config: { stiffness: 40, damping: 16 }, delay: 5 });
  const btnSp  = spring({ frame, fps, config: { stiffness: 55, damping: 18 }, delay: 28 });

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <HUDGrid />
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 50%, ${C.cyan}18 0%, transparent 65%)`,
      }} />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 72px', gap: 36, zIndex: 2 }}>
        <div style={{
          fontFamily: '"Bebas Neue", Impact, sans-serif',
          fontSize: 148, color: C.white, textAlign: 'center', lineHeight: 0.92, letterSpacing: 3,
          opacity: mainSp, transform: `translateY(${interpolate(mainSp, [0, 1], [60, 0])}px)`,
          textShadow: `0 0 50px ${C.cyan}66`,
        }}>
          {ctaText}
        </div>

        <div style={{
          border: `2px solid ${C.cyan}`, borderRadius: 4, padding: '20px 64px',
          fontFamily: '"Inter", system-ui, sans-serif', fontSize: 32, fontWeight: 700,
          color: C.cyan, letterSpacing: 3, textTransform: 'uppercase',
          opacity: btnSp, transform: `scale(${interpolate(btnSp, [0, 1], [0.8, 1])})`,
          boxShadow: `0 0 40px ${C.cyan}44, inset 0 0 20px ${C.cyan}0A`,
        }}>
          {ctaSub}
        </div>

        <div style={{
          fontFamily: 'monospace', fontSize: 22, color: C.green, letterSpacing: 4,
          opacity: interpolate(frame, [44, 60], [0, 1], { extrapolateRight: 'clamp' }),
          textShadow: `0 0 12px ${C.green}`,
        }}>
          LEAN · SIX SIGMA · IA · BH/MG
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
interface HScene {
  type: 'boot' | 'metrics' | 'alert' | 'cta';
  duration: number;
  headline?: string;
  sub?: string;
  metrics?: Metric[];
  items?: string[];
  ctaText?: string;
  ctaSub?: string;
}

export interface HUDDataProject { scenes: HScene[] }

export function buildHUDDataProject(): HUDDataProject {
  return {
    scenes: [
      { type: 'boot', duration: 5, headline: 'Seu processo sob análise agora.', sub: 'SmartOps IA detecta desperdícios em tempo real.' },
      { type: 'metrics', duration: 10, headline: 'STATUS: PME TÍPICA BH/MG', metrics: [
        { label: 'Custo de retrabalho mensal', value: 'R$41k', progress: 82, color: C.orange },
        { label: 'Processos apenas na cabeça do dono', value: '68%', progress: 68, color: C.orange },
        { label: 'Tarefas prontas para automação', value: '74%', progress: 74, color: C.green },
      ]},
      { type: 'alert', duration: 8, headline: 'PROTOCOLO SMARTOPS IA:', items: [
        'Diagnóstico presencial — mapeamento completo',
        'Lean Six Sigma elimina os 8 desperdícios',
        'n8n + IA automatiza processos em 4 semanas',
        'ROI mensurável — mínimo 30% redução de custo',
      ]},
      { type: 'cta', duration: 7, ctaText: 'Diagnóstico Gratuito', ctaSub: 'smartops-ia.com.br' },
    ],
  };
}

export const HUDDataTemplate: React.FC<{ project?: HUDDataProject }> = ({ project }) => {
  const { fps } = useVideoConfig();
  const frame   = useCurrentFrame();
  const scenes  = project?.scenes ?? buildHUDDataProject().scenes;

  const ranges = scenes.reduce<{ start: number; end: number; scene: HScene }[]>(
    (acc, s) => { const start = acc.length > 0 ? acc[acc.length - 1].end : 0; return [...acc, { start, end: start + s.duration * fps, scene: s }]; }, [],
  );
  const cur = ranges.find(r => frame >= r.start && frame < r.end) ?? ranges[ranges.length - 1];
  const sf = frame - cur.start;
  const s  = cur.scene;

  switch (s.type) {
    case 'boot':    return <BootScene    frame={sf} fps={fps} headline={s.headline!} sub={s.sub} />;
    case 'metrics': return <MetricsScene frame={sf} fps={fps} headline={s.headline!} metrics={s.metrics!} />;
    case 'alert':   return <AlertScene   frame={sf} fps={fps} headline={s.headline!} items={s.items!} />;
    case 'cta':     return <HUDCta       frame={sf} fps={fps} ctaText={s.ctaText!} ctaSub={s.ctaSub!} />;
    default:        return <BootScene    frame={sf} fps={fps} headline={s.headline ?? ''} />;
  }
};
