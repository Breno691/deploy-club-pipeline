// SynthwaveTemplate.tsx
// Estilo: Synthwave / Retrowave — grade de perspectiva roxa/rosa que avança,
// sol retro com linhas horizontais, néons, scan lines, estética anos 80 sci-fi.
// Baseado em ESTILO 11 da pesquisa. Visual altamente memorável e viral.

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

const C = {
  bg:      '#0D0221',
  purple:  '#711C91',
  magenta: '#F222FF',
  cyan:    '#01CDFE',
  pink:    '#FF2975',
  yellow:  '#FFD319',
  white:   '#FFFFFF',
  dimW:    'rgba(255,255,255,0.65)',
};

// ── ANIMATED GRID FLOOR ───────────────────────────────────────────────────────
const GridFloor: React.FC<{ frame: number }> = ({ frame }) => {
  const offset = (frame * 6) % 120;
  const lines = 16;
  return (
    <svg style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: '60%' }} viewBox="0 0 1080 1152" preserveAspectRatio="none">
      <defs>
        <linearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.bg} stopOpacity="1" />
          <stop offset="40%" stopColor={C.bg} stopOpacity="0" />
          <stop offset="100%" stopColor={C.bg} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor={C.magenta} stopOpacity="0.8" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {/* Horizontal lines */}
      {Array.from({ length: lines }).map((_, i) => {
        const y = ((i * (1152 / lines)) + offset) % 1152;
        const perspective = i / lines;
        const opacity = perspective * 0.8 + 0.1;
        return <line key={i} x1="0" y1={y} x2="1080" y2={y} stroke="url(#lineGrad)" strokeWidth={1} opacity={opacity} />;
      })}

      {/* Vertical converging lines */}
      {[-8,-6,-4,-2,0,2,4,6,8].map((offset, i) => (
        <line key={i} x1={540 + offset * 80} y1={0} x2={540 + offset * 400} y2={1152}
          stroke={C.magenta} strokeWidth={0.8} opacity={0.35} />
      ))}

      {/* Fade overlay */}
      <rect x="0" y="0" width="1080" height="1152" fill="url(#gridFade)" />
    </svg>
  );
};

// ── RETRO SUN ──────────────────────────────────────────────────────────────────
const RetroSun: React.FC<{ frame: number; y: number; opacity: number }> = ({ frame, y, opacity }) => {
  const sunR = 200;
  const lines = 10;
  return (
    <svg style={{ position: 'absolute', left: '50%', top: y, transform: 'translateX(-50%)', width: sunR * 2, height: sunR }} viewBox={`0 0 ${sunR * 2} ${sunR}`}>
      <defs>
        <linearGradient id="sunGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.yellow} />
          <stop offset="40%" stopColor="#FF901F" />
          <stop offset="80%" stopColor={C.pink} />
          <stop offset="100%" stopColor={C.purple} />
        </linearGradient>
        <clipPath id="sunClip">
          <ellipse cx={sunR} cy={sunR} rx={sunR} ry={sunR} />
        </clipPath>
      </defs>
      <ellipse cx={sunR} cy={sunR} rx={sunR} ry={sunR} fill="url(#sunGrad)" opacity={opacity} />
      {Array.from({ length: lines }).map((_, i) => {
        const lineY = (sunR * 0.4) + (i * (sunR * 0.55 / lines));
        return <rect key={i} x={0} y={lineY} width={sunR * 2} height={sunR * 0.04} fill={C.bg} clipPath="url(#sunClip)" />;
      })}
    </svg>
  );
};

// ── NEON GLOW TEXT ────────────────────────────────────────────────────────────
const NeonText: React.FC<{ text: string; size: number; color: string; align?: 'center' | 'left'; style?: React.CSSProperties }> = ({ text, size, color, align = 'center', style }) => (
  <div style={{
    fontFamily: '"Bebas Neue", Impact, sans-serif',
    fontSize: size, color, textAlign: align,
    lineHeight: 0.92, letterSpacing: 4, textTransform: 'uppercase',
    textShadow: `0 0 20px ${color}, 0 0 60px ${color}66, 0 0 100px ${color}33`,
    ...style,
  }}>
    {text}
  </div>
);

// ── SCENE: HERO ───────────────────────────────────────────────────────────────
const SWHero: React.FC<{ frame: number; fps: number; headline: string; sub?: string }> = ({ frame, fps, headline, sub }) => {
  const sunOp  = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const titleSp = spring({ frame, fps, config: { stiffness: 40, damping: 16 }, delay: 18 });
  const subSp   = spring({ frame, fps, config: { stiffness: 35, damping: 18 }, delay: 38 });

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.bg} 0%, #1A0535 60%, ${C.bg} 100%)` }}>
      <GridFloor frame={frame} />
      <RetroSun frame={frame} y={300} opacity={sunOp} />

      {/* Scan lines */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)', pointerEvents: 'none' }} />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 140, padding: '140px 72px 0', gap: 24, zIndex: 3 }}>
        <NeonText text={headline} size={152} color={C.magenta} style={{ opacity: titleSp, transform: `translateY(${interpolate(titleSp,[0,1],[60,0])}px)` }} />
        <div style={{ width: interpolate(frame,[22,55],[0,320],{extrapolateRight:'clamp'}), height: 3, background: `linear-gradient(90deg, ${C.cyan}, ${C.magenta})`, boxShadow: `0 0 12px ${C.cyan}` }} />
        {sub && (
          <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 38, color: C.dimW, textAlign: 'center', lineHeight: 1.4, opacity: subSp, maxWidth: 820 }}>
            {sub}
          </div>
        )}
      </AbsoluteFill>

      {/* Bottom label */}
      <div style={{ position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center', zIndex: 4 }}>
        <NeonText text="SmartOps IA · BH/MG" size={28} color={C.cyan} style={{ letterSpacing: 6, opacity: interpolate(frame,[50,70],[0,1],{extrapolateRight:'clamp'}) }} />
      </div>
    </AbsoluteFill>
  );
};

// ── SCENE: STATS ──────────────────────────────────────────────────────────────
const SWStats: React.FC<{ frame: number; fps: number; headline: string; stats: { v: string; l: string }[] }> = ({ frame, fps, headline, stats }) => {
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.bg} 0%, #1A0535 100%)` }}>
      <GridFloor frame={frame} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 4px)' }} />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 72px', gap: 32, zIndex: 2 }}>
        <NeonText text={headline} size={88} color={C.cyan} align="left" style={{ opacity: interpolate(frame,[0,18],[0,1],{extrapolateRight:'clamp'}) }} />

        {stats.map((s, i) => {
          const delay = 18 + i * 16;
          const sp = spring({ frame, fps, config: { stiffness: 50, damping: 16 }, delay });
          const colors = [C.magenta, C.cyan, C.yellow];
          const accent = colors[i % colors.length];
          return (
            <div key={i} style={{
              background: 'rgba(242,34,255,0.08)', border: `1px solid ${accent}44`,
              borderLeft: `4px solid ${accent}`, borderRadius: '0 16px 16px 0', padding: '20px 28px',
              display: 'flex', alignItems: 'center', gap: 28,
              opacity: sp, transform: `translateX(${interpolate(sp,[0,1],[-80,0])}px)`,
              boxShadow: `inset 0 0 20px ${accent}0A`,
            }}>
              <NeonText text={s.v} size={88} color={accent} style={{ minWidth: 200, textAlign: 'right' }} />
              <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 32, color: C.dimW, lineHeight: 1.3 }}>{s.l}</div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE: CTA ────────────────────────────────────────────────────────────────
const SWCTA: React.FC<{ frame: number; fps: number; ctaText: string }> = ({ frame, fps, ctaText }) => {
  const mainSp = spring({ frame, fps, config: { stiffness: 40, damping: 16 }, delay: 5 });
  const btnSp  = spring({ frame, fps, config: { stiffness: 55, damping: 18 }, delay: 28 });
  const pulse  = Math.sin(frame * 0.1) * 0.05 + 0.95;

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.bg} 0%, #200040 100%)` }}>
      <GridFloor frame={frame} />
      <RetroSun frame={frame} y={250} opacity={interpolate(frame,[0,20],[0,0.8],{extrapolateRight:'clamp'})} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 4px)' }} />

      {/* Center magenta glow */}
      <div style={{ position: 'absolute', width: 800, height: 800, borderRadius: '50%', background: `radial-gradient(circle, ${C.magenta}33 0%, transparent 65%)`, top: '50%', left: '50%', transform: `translate(-50%, -50%) scale(${pulse})`, filter: 'blur(40px)' }} />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 72px', gap: 36, zIndex: 3 }}>
        <NeonText text={ctaText} size={148} color={C.white} style={{ opacity: mainSp, transform: `translateY(${interpolate(mainSp,[0,1],[60,0])}px)` }} />

        <div style={{
          border: `2px solid ${C.magenta}`, borderRadius: 4, padding: '18px 60px',
          fontFamily: '"Inter", system-ui, sans-serif', fontSize: 32, fontWeight: 700,
          color: C.magenta, letterSpacing: 3, textTransform: 'uppercase',
          opacity: btnSp, transform: `scale(${interpolate(btnSp,[0,1],[0.8,1])})`,
          boxShadow: `0 0 40px ${C.magenta}66, inset 0 0 20px ${C.magenta}11`,
          background: `${C.magenta}0A`,
        }}>
          smartops-ia.com.br
        </div>

        <NeonText text="Lean · Six Sigma · IA · BH/MG" size={26} color={C.cyan} style={{ letterSpacing: 5, opacity: interpolate(frame,[44,60],[0,1],{extrapolateRight:'clamp'}) }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
interface SWScene { type: 'hero' | 'stats' | 'cta'; duration: number; headline?: string; sub?: string; stats?: { v: string; l: string }[]; ctaText?: string }
export interface SynthwaveProject { scenes: SWScene[] }

export function buildSynthwaveProject(): SynthwaveProject {
  return {
    scenes: [
      { type: 'hero', duration: 6, headline: 'Sua empresa no próximo nível.', sub: 'Lean Six Sigma + IA. Resultados em 90 dias.' },
      { type: 'stats', duration: 10, headline: 'RESULTADOS COMPROVADOS:', stats: [
        { v: '−32%', l: 'custo operacional com Lean Six Sigma' },
        { v: '+45%', l: 'processos automatizados com n8n + IA' },
        { v: '3×',   l: 'capacidade de crescimento sem contratar' },
      ]},
      { type: 'cta', duration: 7, headline: '', ctaText: 'Diagnóstico Gratuito' },
    ],
  };
}

export const SynthwaveTemplate: React.FC<{ project?: SynthwaveProject }> = ({ project }) => {
  const { fps } = useVideoConfig();
  const frame   = useCurrentFrame();
  const scenes  = project?.scenes ?? buildSynthwaveProject().scenes;
  const ranges  = scenes.reduce<{ start: number; end: number; scene: SWScene }[]>((acc,s) => { const start = acc.length > 0 ? acc[acc.length-1].end : 0; return [...acc,{start,end:start+s.duration*fps,scene:s}]; },[]);
  const cur = ranges.find(r => frame >= r.start && frame < r.end) ?? ranges[ranges.length-1];
  const sf = frame - cur.start;
  const s  = cur.scene;

  switch (s.type) {
    case 'hero':  return <SWHero  frame={sf} fps={fps} headline={s.headline!} sub={s.sub} />;
    case 'stats': return <SWStats frame={sf} fps={fps} headline={s.headline!} stats={s.stats!} />;
    case 'cta':   return <SWCTA   frame={sf} fps={fps} ctaText={s.ctaText!} />;
    default:      return <SWHero  frame={sf} fps={fps} headline={s.headline ?? ''} />;
  }
};
