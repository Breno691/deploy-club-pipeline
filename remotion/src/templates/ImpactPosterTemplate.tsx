// ImpactPosterTemplate.tsx
// Dinâmico · Leve · Atraente
// Estilo poster de impacto — blocos de cor sólida que alternam, tipografia
// que "stampa" na tela como carimbo, ritmo de clipe de música/publicidade.
// Texto enorme (185-220px), animações rápidas e precisas, cores inconfundíveis.

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

export type PosterTheme = 'blue' | 'green' | 'red';

const THEMES = {
  blue:  { primary: '#0052FF', secondary: '#001A66', accent: '#00C6FF', text: '#FFFFFF', dark: '#000814' },
  green: { primary: '#00C853', secondary: '#003300', accent: '#CCFF00', text: '#FFFFFF', dark: '#001400' },
  red:   { primary: '#FF1744', secondary: '#660000', accent: '#FF9800', text: '#FFFFFF', dark: '#1A0000' },
};

interface PosterSlide {
  word: string;
  sub?: string;
  bgLight?: boolean;
  duration: number; // frames
}

interface PosterScene {
  type: 'slides' | 'stats' | 'cta';
  duration: number;
  slides?: PosterSlide[];
  stats?: { v: string; l: string }[];
  headline?: string;
  ctaText?: string;
}

export interface PosterProject { theme?: PosterTheme; scenes: PosterScene[] }

// ── STAMP WORD ────────────────────────────────────────────────────────────────
const StampWord: React.FC<{ word: string; sub?: string; T: typeof THEMES.blue; frame: number; fps: number; bgLight?: boolean }> = ({ word, sub, T, frame, fps, bgLight }) => {
  const bg = bgLight ? '#FFFFFF' : T.primary;
  const textColor = bgLight ? T.primary : T.text;

  // Stamp animation — comes from scale 1.4 to 1.0 with a "thud"
  const sp = spring({ frame, fps, config: { stiffness: 400, damping: 22 }, delay: 2 });
  const scale = interpolate(sp, [0, 0.5, 0.75, 0.9, 1], [1.5, 0.94, 1.03, 0.98, 1]);
  const opacity = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: 'clamp' });

  // Sub text comes in after stamp
  const subSp = spring({ frame, fps, config: { stiffness: 80, damping: 18 }, delay: 14 });

  const fontSize = word.length <= 5 ? 220 : word.length <= 10 ? 175 : word.length <= 15 ? 145 : 115;

  return (
    <AbsoluteFill style={{ background: bg }}>
      {/* Diagonal accent stripe */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0, right: 0, width: '35%',
        background: bgLight ? `${T.primary}12` : 'rgba(255,255,255,0.06)',
        clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0 100%)',
      }} />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 56px', gap: 16 }}>
        <div style={{
          fontFamily: '"Bebas Neue", Impact, sans-serif',
          fontSize, color: textColor,
          textAlign: 'center', lineHeight: 0.88, letterSpacing: 3,
          textTransform: 'uppercase',
          opacity,
          transform: `scale(${scale})`,
        }}>
          {word}
        </div>

        {sub && (
          <div style={{
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: 40, color: bgLight ? T.primary : 'rgba(255,255,255,0.85)',
            textAlign: 'center', lineHeight: 1.3,
            opacity: subSp,
            transform: `translateY(${interpolate(subSp,[0,1],[24,0])}px)`,
          }}>
            {sub}
          </div>
        )}
      </AbsoluteFill>

      {/* Bottom accent bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 8, background: bgLight ? T.primary : T.accent }} />
    </AbsoluteFill>
  );
};

// ── STATS SCENE ───────────────────────────────────────────────────────────────
const PosterStats: React.FC<{ T: typeof THEMES.blue; frame: number; fps: number; stats: { v: string; l: string }[]; headline?: string }> = ({ T, frame, fps, stats, headline }) => {
  const hSp = spring({ frame, fps, config: { stiffness: 120, damping: 18 }, delay: 2 });

  return (
    <AbsoluteFill style={{ background: T.dark }}>
      {/* Accent top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10, background: T.primary }} />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 64px', gap: 24 }}>
        {headline && (
          <div style={{
            fontFamily: '"Bebas Neue", Impact, sans-serif',
            fontSize: 90, color: T.accent, letterSpacing: 3,
            opacity: hSp, transform: `translateX(${interpolate(hSp,[0,1],[-50,0])}px)`,
          }}>
            {headline}
          </div>
        )}

        {stats.map((st, i) => {
          const delay = 14 + i * 14;
          const sp = spring({ frame, fps, config: { stiffness: 150, damping: 18 }, delay });
          const stampScale = interpolate(sp, [0, 0.4, 0.7, 0.85, 1], [0.6, 1.06, 0.97, 1.01, 1]);

          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 24,
              borderLeft: `6px solid ${T.primary}`,
              paddingLeft: 28,
              opacity: sp, transform: `scale(${stampScale})`,
              transformOrigin: 'left center',
            }}>
              <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 110, color: T.primary, lineHeight: 1, minWidth: 220 }}>
                {st.v}
              </div>
              <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 36, color: 'rgba(255,255,255,0.85)', lineHeight: 1.3 }}>
                {st.l}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 10, background: T.primary }} />
    </AbsoluteFill>
  );
};

// ── CTA SCENE ─────────────────────────────────────────────────────────────────
const PosterCTA: React.FC<{ T: typeof THEMES.blue; frame: number; fps: number; ctaText: string }> = ({ T, frame, fps, ctaText }) => {
  const sp    = spring({ frame, fps, config: { stiffness: 400, damping: 22 }, delay: 2 });
  const scale = interpolate(sp, [0, 0.5, 0.75, 0.9, 1], [1.5, 0.94, 1.03, 0.98, 1]);
  const pulse = 1 + Math.sin(frame * 0.1) * 0.02;
  const btnSp = spring({ frame, fps, config: { stiffness: 80, damping: 18 }, delay: 22 });

  return (
    <AbsoluteFill style={{ background: T.primary }}>
      {/* Light diagonal */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0, rgba(255,255,255,0.04) 2px, transparent 2px, transparent 16px)`,
      }} />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 64px', gap: 36 }}>
        <div style={{
          fontFamily: '"Bebas Neue", Impact, sans-serif',
          fontSize: 185, color: '#FFFFFF', textAlign: 'center', lineHeight: 0.88, letterSpacing: 3,
          transform: `scale(${scale})`,
          opacity: interpolate(frame, [0, 4], [0, 1], { extrapolateRight: 'clamp' }),
        }}>
          {ctaText}
        </div>

        <div style={{
          background: '#FFFFFF', borderRadius: 100, padding: '22px 72px',
          opacity: btnSp, transform: `scale(${interpolate(btnSp,[0,1],[0.7,1]) * pulse})`,
          boxShadow: '0 10px 50px rgba(0,0,0,0.2)',
        }}>
          <span style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 32, fontWeight: 800, color: T.primary }}>
            smartops-ia.com.br
          </span>
        </div>

        <div style={{
          fontFamily: '"Inter", system-ui, sans-serif', fontSize: 24, color: 'rgba(255,255,255,0.7)',
          letterSpacing: 5, textTransform: 'uppercase',
          opacity: interpolate(frame,[36,52],[0,1],{extrapolateRight:'clamp'}),
        }}>
          Lean · Six Sigma · IA · BH/MG
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
export function buildPosterProject(theme: PosterTheme = 'blue'): PosterProject {
  return {
    theme,
    scenes: [
      {
        type: 'slides', duration: 18,
        slides: [
          { word: 'Retrabalho?', duration: 45, bgLight: false },
          { word: 'Improviso?', duration: 45, bgLight: true },
          { word: 'Caos?', duration: 45, bgLight: false },
          { word: 'Chega.', sub: 'Existe uma solução.', duration: 45, bgLight: true },
        ],
      },
      {
        type: 'stats', duration: 11,
        headline: 'Com SmartOps IA:',
        stats: [
          { v: '−32%', l: 'custo operacional em 90 dias' },
          { v: '+45%', l: 'automação com n8n + IA' },
          { v: '3×',   l: 'capacidade sem contratar' },
        ],
      },
      {
        type: 'cta', duration: 6,
        ctaText: 'Diagnóstico Gratuito',
      },
    ],
  };
}

export const ImpactPosterTemplate: React.FC<{ project?: PosterProject }> = ({ project }) => {
  const { fps } = useVideoConfig();
  const frame   = useCurrentFrame();
  const p = project ?? buildPosterProject('blue');
  const T = THEMES[p.theme ?? 'blue'];

  // Build ranges
  const sceneRanges = p.scenes.reduce<{ start: number; end: number; scene: PosterScene }[]>(
    (acc, s) => { const start = acc.length > 0 ? acc[acc.length-1].end : 0; return [...acc, { start, end: start + s.duration * fps, scene: s }]; }, [],
  );
  const curScene = sceneRanges.find(r => frame >= r.start && frame < r.end) ?? sceneRanges[sceneRanges.length-1];
  const sceneFrame = frame - curScene.start;
  const scene = curScene.scene;

  if (scene.type === 'stats') {
    return <PosterStats T={T} frame={sceneFrame} fps={fps} stats={scene.stats!} headline={scene.headline} />;
  }

  if (scene.type === 'cta') {
    return <PosterCTA T={T} frame={sceneFrame} fps={fps} ctaText={scene.ctaText!} />;
  }

  // slides scene — cycle through each slide
  const slides = scene.slides ?? [];
  const slideRanges = slides.reduce<{ start: number; end: number; slide: PosterSlide }[]>(
    (acc, sl) => { const start = acc.length > 0 ? acc[acc.length-1].end : 0; return [...acc, { start, end: start + sl.duration, slide: sl }]; }, [],
  );
  const curSlide = slideRanges.find(r => sceneFrame >= r.start && sceneFrame < r.end) ?? slideRanges[slideRanges.length-1];
  const slideFrame = sceneFrame - curSlide.start;
  const slide = curSlide.slide;

  return <StampWord word={slide.word} sub={slide.sub} T={T} frame={slideFrame} fps={fps} bgLight={slide.bgLight} />;
};
