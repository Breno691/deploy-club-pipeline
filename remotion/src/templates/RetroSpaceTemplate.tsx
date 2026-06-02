// RetroSpaceTemplate.tsx
// Estilo: Retro Futurism Space Age — cosmos art deco, planetas com rings,
// arcos orbitais, foguetes, tipografia Bauhaus/Futura. "NASA meets Art Nouveau."
// Baseado em ESTILO 20 da pesquisa.

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

const C = {
  cosmos:  '#0B0C2A',
  navy:    '#0D1B3E',
  orange:  '#FF6B35',
  gold:    '#C9A84C',
  cream:   '#F5E6B0',
  skyBlue: '#3D7EAA',
  red:     '#CC2936',
  white:   '#F0F0F0',
  dimW:    'rgba(240,240,240,0.65)',
};

// ── STARS ─────────────────────────────────────────────────────────────────────
const Stars: React.FC<{ frame: number; count?: number }> = ({ frame, count = 80 }) => {
  const stars = React.useMemo(() => Array.from({ length: count }, (_, i) => ({
    x: (i * 137.5) % 1080, y: (i * 89.3) % 1920, r: (i % 3) + 1, delay: i * 0.4,
  })), [count]);

  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      {stars.map((s, i) => {
        const twinkle = Math.sin(frame * 0.05 + s.delay) * 0.4 + 0.6;
        return <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={C.white} opacity={twinkle * 0.7} />;
      })}
    </svg>
  );
};

// ── PLANET SVG ────────────────────────────────────────────────────────────────
const Planet: React.FC<{ frame: number; x: number; y: number; r: number; color: string; ring?: boolean; opacity?: number }> = ({ frame, x, y, r, color, ring = false, opacity = 1 }) => {
  const rot = (frame * 0.3) % 360;
  return (
    <g opacity={opacity} transform={`translate(${x}, ${y})`}>
      {ring && (
        <ellipse cx={0} cy={0} rx={r * 1.8} ry={r * 0.4} fill="none" stroke={C.gold} strokeWidth={3} opacity={0.6} transform={`rotate(${-15})`} />
      )}
      <circle cx={0} cy={0} r={r} fill={color} />
      {/* Shading */}
      <circle cx={r * 0.3} cy={-r * 0.3} r={r * 0.7} fill="rgba(0,0,0,0.3)" />
      {ring && (
        <ellipse cx={0} cy={0} rx={r * 1.8} ry={r * 0.4} fill="none" stroke={C.gold} strokeWidth={1.5} opacity={0.3} transform={`rotate(${-15})`} strokeDasharray="8 4" />
      )}
    </g>
  );
};

// ── SCENE: SPACE INTRO ────────────────────────────────────────────────────────
const SpaceIntro: React.FC<{ frame: number; fps: number; headline: string; sub?: string }> = ({ frame, fps, headline, sub }) => {
  const titleSp = spring({ frame, fps, config: { stiffness: 40, damping: 16 }, delay: 15 });
  const subSp   = spring({ frame, fps, config: { stiffness: 35, damping: 18 }, delay: 36 });
  const lineW   = interpolate(frame,[10,50],[0,280],{extrapolateRight:'clamp',easing:Easing.out(Easing.quad)});
  const planetOp = interpolate(frame,[0,25],[0,1],{extrapolateRight:'clamp'});

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 30%, ${C.navy} 0%, ${C.cosmos} 70%)` }}>
      <Stars frame={frame} />

      {/* Decorative SVG elements */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 1080 1920">
        {/* Large ringed planet top-right */}
        <Planet frame={frame} x={900} y={200} r={130} color={C.skyBlue} ring opacity={planetOp} />
        {/* Small orange planet bottom-left */}
        <Planet frame={frame} x={120} y={1650} r={70} color={C.orange} opacity={planetOp * 0.7} />
        {/* Arc decoration */}
        <path d="M 200 960 A 300 300 0 0 1 800 960" fill="none" stroke={C.gold} strokeWidth={1} opacity={interpolate(frame,[20,50],[0,0.4],{extrapolateRight:'clamp'})} strokeDasharray="12 6" />
        {/* Orbital ring */}
        <ellipse cx={540} cy={400} rx={400} ry={80} fill="none" stroke={C.gold} strokeWidth={0.8} opacity={0.2} />
      </svg>

      {/* Top badge */}
      <div style={{
        position: 'absolute', top: 80, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 2,
        opacity: interpolate(frame,[5,22],[0,1],{extrapolateRight:'clamp'}),
      }}>
        <div style={{
          border: `1px solid ${C.gold}`, borderRadius: 100, padding: '8px 28px',
          fontFamily: '"Inter", system-ui, sans-serif', fontSize: 18, fontWeight: 700,
          letterSpacing: 5, color: C.gold, textTransform: 'uppercase',
        }}>
          SmartOps IA · Missão BH/MG
        </div>
      </div>

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 72px', gap: 28, zIndex: 2 }}>
        <div style={{
          fontFamily: '"Bebas Neue", Impact, sans-serif',
          fontSize: 155, color: C.cream, textAlign: 'center', lineHeight: 0.9, letterSpacing: 3,
          opacity: titleSp, transform: `translateY(${interpolate(titleSp,[0,1],[70,0])}px)`,
          textShadow: `0 0 60px ${C.orange}66`,
        }}>
          {headline}
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: lineW, height: 2, background: `linear-gradient(90deg, ${C.orange}, ${C.gold})` }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.gold, boxShadow: `0 0 16px ${C.gold}` }} />
          <div style={{ width: lineW * 0.5, height: 2, background: `linear-gradient(90deg, ${C.gold}, transparent)` }} />
        </div>

        {sub && (
          <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 38, color: C.dimW, textAlign: 'center', lineHeight: 1.4, opacity: subSp, maxWidth: 800 }}>
            {sub}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE: MISSION STATS ──────────────────────────────────────────────────────
const MissionStats: React.FC<{ frame: number; fps: number; headline: string; stats: { v: string; l: string }[] }> = ({ frame, fps, headline, stats }) => {
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, ${C.navy} 0%, ${C.cosmos} 70%)` }}>
      <Stars frame={frame} count={60} />
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 1080 1920">
        <Planet frame={frame} x={1000} y={1800} r={150} color={C.red} opacity={interpolate(frame,[0,20],[0,0.6],{extrapolateRight:'clamp'})} />
        <Planet frame={frame} x={80} y={400} r={50} color={C.gold} opacity={0.5} />
      </svg>

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 72px', gap: 28, zIndex: 2 }}>
        <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 88, color: C.orange, letterSpacing: 3, opacity: interpolate(frame,[0,18],[0,1],{extrapolateRight:'clamp'}), textShadow: `0 0 40px ${C.orange}88` }}>
          {headline}
        </div>
        {stats.map((s, i) => {
          const delay = 16 + i * 16;
          const sp = spring({ frame, fps, config: { stiffness: 50, damping: 16 }, delay });
          return (
            <div key={i} style={{
              background: 'rgba(13,27,62,0.8)', border: `1px solid ${C.gold}44`,
              borderLeft: `4px solid ${C.gold}`, borderRadius: '0 16px 16px 0',
              padding: '20px 28px', display: 'flex', alignItems: 'center', gap: 28,
              opacity: sp, transform: `translateX(${interpolate(sp,[0,1],[-80,0])}px)`,
            }}>
              <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 90, color: C.orange, lineHeight: 1, minWidth: 200, textAlign: 'right', textShadow: `0 0 30px ${C.orange}` }}>
                {s.v}
              </div>
              <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 32, color: C.cream, lineHeight: 1.3 }}>{s.l}</div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE: CTA ────────────────────────────────────────────────────────────────
const SpaceCTA: React.FC<{ frame: number; fps: number; ctaText: string }> = ({ frame, fps, ctaText }) => {
  const mainSp = spring({ frame, fps, config: { stiffness: 40, damping: 16 }, delay: 5 });
  const btnSp  = spring({ frame, fps, config: { stiffness: 55, damping: 18 }, delay: 28 });
  const rot    = interpolate(frame, [0, 300], [0, 360], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, ${C.navy} 0%, ${C.cosmos} 70%)` }}>
      <Stars frame={frame} count={100} />
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 1080 1920">
        <g transform={`translate(540, 960) rotate(${rot})`}>
          <ellipse cx={0} cy={0} rx={380} ry={100} fill="none" stroke={C.gold} strokeWidth={0.8} opacity={0.25} strokeDasharray="10 6" />
          <ellipse cx={0} cy={0} rx={460} ry={120} fill="none" stroke={C.orange} strokeWidth={0.5} opacity={0.15} strokeDasharray="6 8" />
        </g>
        <Planet frame={frame} x={200} y={300} r={80} color={C.orange} opacity={0.7} />
        <Planet frame={frame} x={900} y={1600} r={100} color={C.skyBlue} ring opacity={0.6} />
      </svg>

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 72px', gap: 36, zIndex: 2 }}>
        <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 148, color: C.cream, textAlign: 'center', lineHeight: 0.9, letterSpacing: 3, opacity: mainSp, transform: `translateY(${interpolate(mainSp,[0,1],[60,0])}px)`, textShadow: `0 0 60px ${C.orange}` }}>
          {ctaText}
        </div>
        <div style={{
          border: `2px solid ${C.gold}`, borderRadius: 4, padding: '18px 60px',
          fontFamily: '"Inter", system-ui, sans-serif', fontSize: 32, fontWeight: 700, color: C.gold, letterSpacing: 3,
          opacity: btnSp, transform: `scale(${interpolate(btnSp,[0,1],[0.8,1])})`,
          boxShadow: `0 0 30px ${C.gold}44`,
        }}>
          smartops-ia.com.br
        </div>
        <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 22, color: C.dimW, letterSpacing: 5, opacity: interpolate(frame,[44,60],[0,1],{extrapolateRight:'clamp'}) }}>
          LEAN · SIX SIGMA · IA · BH/MG
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
interface RSScene { type: 'intro' | 'stats' | 'cta'; duration: number; headline?: string; sub?: string; stats?: { v: string; l: string }[]; ctaText?: string; ctaSub?: string }
export interface RetroSpaceProject { scenes: RSScene[] }

export function buildRetroSpaceProject(): RetroSpaceProject {
  return {
    scenes: [
      { type: 'intro', duration: 7, headline: 'Processos de alta performance para PMEs.', sub: 'Lean Six Sigma + IA. Tecnologia do futuro aplicada hoje.' },
      { type: 'stats', duration: 10, headline: 'MISSÃO CUMPRIDA:', stats: [
        { v: '−32%', l: 'redução de custo em 90 dias' },
        { v: '+45%', l: 'eficiência com automação IA' },
        { v: '3×',   l: 'capacidade de entrega' },
      ]},
      { type: 'cta', duration: 6, ctaText: 'Diagnóstico Gratuito', ctaSub: '' },
    ],
  };
}

export const RetroSpaceTemplate: React.FC<{ project?: RetroSpaceProject }> = ({ project }) => {
  const { fps } = useVideoConfig();
  const frame   = useCurrentFrame();
  const scenes  = project?.scenes ?? buildRetroSpaceProject().scenes;
  const ranges  = scenes.reduce<{ start: number; end: number; scene: RSScene }[]>((acc,s)=>{const start=acc.length>0?acc[acc.length-1].end:0;return[...acc,{start,end:start+s.duration*fps,scene:s}];},[]);
  const cur = ranges.find(r => frame >= r.start && frame < r.end) ?? ranges[ranges.length-1];
  const sf  = frame - cur.start;
  const s   = cur.scene;

  switch (s.type) {
    case 'intro': return <SpaceIntro   frame={sf} fps={fps} headline={s.headline!} sub={s.sub} />;
    case 'stats': return <MissionStats frame={sf} fps={fps} headline={s.headline!} stats={s.stats!} />;
    case 'cta':   return <SpaceCTA     frame={sf} fps={fps} ctaText={s.ctaText!} />;
    default:      return <SpaceIntro   frame={sf} fps={fps} headline={s.headline ?? ''} />;
  }
};
