// AuroraTemplate.tsx
// Estilo: Gradient Mesh Aurora — gradientes de malha iridescentes, multi-cor,
// efeito de aurora boreal ou superfície holográfica. Premium e sofisticado.
// Baseado em ESTILO 29 da pesquisa + paleta Adobe 2026 Holographic Bloom.

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

// Aurora color system — Holographic Bloom palette
const C = {
  lilac:   '#C084FC',
  pink:    '#F9A8D4',
  mint:    '#6EE7B7',
  lavender:'#A5B4FC',
  peach:   '#FCA5A1',
  butter:  '#FDE68A',
  white:   '#FFFFFF',
  dark:    '#0F0A1E',
  dimW:    'rgba(255,255,255,0.75)',
};

// ── ANIMATED AURORA BACKGROUND ────────────────────────────────────────────────
const AuroraBG: React.FC<{ frame: number; variant?: 'dark' | 'light' }> = ({ frame, variant = 'dark' }) => {
  const t = frame / 30;
  const r1 = 40 + Math.sin(t * 0.4) * 10;
  const r2 = 60 + Math.cos(t * 0.3) * 15;
  const r3 = 50 + Math.sin(t * 0.5 + 1) * 12;

  const bg = variant === 'dark' ? C.dark : '#F8F5FF';
  const textColor = variant === 'dark' ? C.white : C.dark;

  return (
    <div style={{ position: 'absolute', inset: 0, background: bg }}>
      {/* Orb 1 — lilac */}
      <div style={{ position: 'absolute', width: 900, height: 900, borderRadius: '50%', background: `radial-gradient(circle, ${C.lilac}66 0%, transparent 65%)`, top: -200, left: -100, filter: 'blur(80px)', transform: `rotate(${t * 8}deg)` }} />
      {/* Orb 2 — mint */}
      <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: `radial-gradient(circle, ${C.mint}55 0%, transparent 65%)`, bottom: 0, right: -100, filter: 'blur(100px)' }} />
      {/* Orb 3 — pink */}
      <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, ${C.pink}55 0%, transparent 65%)`, top: '40%', left: '30%', filter: 'blur(90px)' }} />
      {/* Orb 4 — butter */}
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${C.butter}44 0%, transparent 70%)`, top: '15%', right: '10%', filter: 'blur(70px)' }} />
    </div>
  );
};

// ── FROSTED CARD ──────────────────────────────────────────────────────────────
const FrostCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{
    background: 'rgba(255,255,255,0.14)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: 28, padding: '24px 28px',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    ...style,
  }}>
    {children}
  </div>
);

// ── SCENE: INTRO ──────────────────────────────────────────────────────────────
const AuroraHero: React.FC<{ frame: number; fps: number; headline: string; sub?: string; eyebrow?: string }> = ({ frame, fps, headline, sub, eyebrow }) => {
  const eyeSp   = spring({ frame, fps, config: { stiffness: 70, damping: 22 }, delay: 5 });
  const titleSp = spring({ frame, fps, config: { stiffness: 45, damping: 18 }, delay: 18 });
  const subSp   = spring({ frame, fps, config: { stiffness: 40, damping: 20 }, delay: 38 });

  return (
    <AbsoluteFill>
      <AuroraBG frame={frame} />
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 72px', gap: 28, zIndex: 2 }}>
        {eyebrow && (
          <FrostCard style={{ opacity: eyeSp }}>
            <span style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 22, fontWeight: 700, color: C.white, letterSpacing: 4, textTransform: 'uppercase' }}>
              {eyebrow}
            </span>
          </FrostCard>
        )}

        <div style={{
          fontFamily: '"Bebas Neue", Impact, sans-serif',
          fontSize: 155, color: C.white, textAlign: 'center', lineHeight: 0.9, letterSpacing: 2,
          opacity: titleSp, transform: `translateY(${interpolate(titleSp,[0,1],[70,0])}px)`,
          textShadow: `0 4px 60px ${C.lilac}88`,
        }}>
          {headline}
        </div>

        {sub && (
          <FrostCard style={{ opacity: subSp, maxWidth: 820 }}>
            <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 38, color: C.dimW, textAlign: 'center', lineHeight: 1.4 }}>
              {sub}
            </div>
          </FrostCard>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE: STATS CARDS ────────────────────────────────────────────────────────
const AuroraStats: React.FC<{ frame: number; fps: number; headline: string; stats: { v: string; l: string; color?: string }[] }> = ({ frame, fps, headline, stats }) => {
  const statColors = [C.mint, C.lavender, C.peach, C.butter];
  return (
    <AbsoluteFill>
      <AuroraBG frame={frame} />
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 64px', gap: 28, zIndex: 2 }}>
        <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 88, color: C.white, letterSpacing: 2, opacity: interpolate(frame,[0,18],[0,1],{extrapolateRight:'clamp'}), textShadow: `0 0 40px ${C.lilac}` }}>
          {headline}
        </div>

        {stats.map((st, i) => {
          const delay = 16 + i * 15;
          const sp = spring({ frame, fps, config: { stiffness: 50, damping: 18 }, delay });
          const accent = st.color ?? statColors[i % statColors.length];
          return (
            <FrostCard key={i} style={{
              opacity: sp, transform: `translateX(${interpolate(sp,[0,1],[-60,0])}px)`,
              display: 'flex', alignItems: 'center', gap: 24,
            }}>
              <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 96, color: accent, lineHeight: 1, minWidth: 220, textAlign: 'right', textShadow: `0 0 30px ${accent}88` }}>
                {st.v}
              </div>
              <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 34, color: C.dimW, lineHeight: 1.3 }}>
                {st.l}
              </div>
            </FrostCard>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE: FEATURES ───────────────────────────────────────────────────────────
const AuroraFeatures: React.FC<{ frame: number; fps: number; headline: string; items: string[] }> = ({ frame, fps, headline, items }) => {
  return (
    <AbsoluteFill>
      <AuroraBG frame={frame} />
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 72px', gap: 24, zIndex: 2 }}>
        <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 96, color: C.white, letterSpacing: 2, opacity: interpolate(frame,[0,18],[0,1],{extrapolateRight:'clamp'}) }}>
          {headline}
        </div>
        {items.map((item, i) => {
          const sp = spring({ frame, fps, config: { stiffness: 55, damping: 18 }, delay: 16 + i * 13 });
          const accent = [C.mint, C.lavender, C.pink, C.butter][i % 4];
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20, opacity: sp, transform: `translateY(${interpolate(sp,[0,1],[40,0])}px)` }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: accent, boxShadow: `0 0 20px ${accent}`, flexShrink: 0 }} />
              <FrostCard style={{ flex: 1, padding: '16px 24px' }}>
                <span style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 34, color: C.white, lineHeight: 1.3 }}>{item}</span>
              </FrostCard>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE: CTA ────────────────────────────────────────────────────────────────
const AuroraCTA: React.FC<{ frame: number; fps: number; ctaText: string; ctaSub: string }> = ({ frame, fps, ctaText, ctaSub }) => {
  const mainSp = spring({ frame, fps, config: { stiffness: 45, damping: 18 }, delay: 5 });
  const btnSp  = spring({ frame, fps, config: { stiffness: 60, damping: 20 }, delay: 26 });
  return (
    <AbsoluteFill>
      <AuroraBG frame={frame} />
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 72px', gap: 36, zIndex: 2 }}>
        <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 148, color: C.white, textAlign: 'center', lineHeight: 0.9, letterSpacing: 3, opacity: mainSp, transform: `translateY(${interpolate(mainSp,[0,1],[60,0])}px)`, textShadow: `0 4px 60px ${C.lilac}` }}>
          {ctaText}
        </div>
        <FrostCard style={{ opacity: btnSp, transform: `scale(${interpolate(btnSp,[0,1],[0.8,1])})`, padding: '22px 64px', textAlign: 'center' }}>
          <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 36, fontWeight: 800, color: C.white }}>{ctaSub}</div>
        </FrostCard>
        <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 24, color: C.dimW, letterSpacing: 3, textTransform: 'uppercase', opacity: interpolate(frame,[44,60],[0,1],{extrapolateRight:'clamp'}) }}>
          Lean · Automação · IA · BH/MG
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
interface AScene { type: 'hero' | 'stats' | 'features' | 'cta'; duration: number; headline?: string; sub?: string; eyebrow?: string; stats?: { v: string; l: string; color?: string }[]; items?: string[]; ctaText?: string; ctaSub?: string }
export interface AuroraProject { scenes: AScene[] }

export function buildAuroraProject(): AuroraProject {
  return {
    scenes: [
      { type: 'hero', duration: 6, eyebrow: 'SmartOps IA · Consultoria Lean + IA', headline: 'Transforme sua empresa em 90 dias.', sub: 'Lean Six Sigma + Automação com IA aplicados na sua PME.' },
      { type: 'stats', duration: 9, headline: 'Resultados que entregamos:', stats: [
        { v: '−32%', l: 'redução de custo operacional', color: C.mint },
        { v: '+45%', l: 'processos automatizados com n8n + IA', color: C.lavender },
        { v: '3×',   l: 'capacidade sem contratar mais', color: C.peach },
      ]},
      { type: 'features', duration: 9, headline: 'O que fazemos:', items: [
        'Diagnóstico presencial — mapeamos tudo',
        'Lean Six Sigma elimina os 8 desperdícios',
        'Automações n8n + IA em 4 semanas',
        'Dashboard de KPIs em tempo real',
      ]},
      { type: 'cta', duration: 6, ctaText: 'Diagnóstico Gratuito', ctaSub: 'smartops-ia.com.br · BH/MG' },
    ],
  };
}

export const AuroraTemplate: React.FC<{ project?: AuroraProject }> = ({ project }) => {
  const { fps } = useVideoConfig();
  const frame   = useCurrentFrame();
  const scenes  = project?.scenes ?? buildAuroraProject().scenes;
  const ranges  = scenes.reduce<{ start: number; end: number; scene: AScene }[]>((acc,s)=>{const start=acc.length>0?acc[acc.length-1].end:0;return[...acc,{start,end:start+s.duration*fps,scene:s}];},[]);
  const cur = ranges.find(r => frame >= r.start && frame < r.end) ?? ranges[ranges.length-1];
  const sf  = frame - cur.start;
  const s   = cur.scene;

  switch (s.type) {
    case 'hero':     return <AuroraHero     frame={sf} fps={fps} headline={s.headline!} sub={s.sub} eyebrow={s.eyebrow} />;
    case 'stats':    return <AuroraStats    frame={sf} fps={fps} headline={s.headline!} stats={s.stats!} />;
    case 'features': return <AuroraFeatures frame={sf} fps={fps} headline={s.headline!} items={s.items!} />;
    case 'cta':      return <AuroraCTA      frame={sf} fps={fps} ctaText={s.ctaText!} ctaSub={s.ctaSub!} />;
    default:         return <AuroraHero     frame={sf} fps={fps} headline={s.headline ?? ''} />;
  }
};
