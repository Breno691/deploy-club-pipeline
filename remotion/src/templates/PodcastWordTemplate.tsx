// PodcastWordTemplate.tsx
// Estilo: Word-by-Word Podcast Style — texto aparece palavra por palavra,
// palavra atual em destaque bold e colorida, fundo dark com gradiente.
// Alex Hormozi / Gary Vee / Flow Podcast style. Altamente viral.
// Baseado em ESTILO 22 da pesquisa.

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export type PodTheme = 'dark' | 'purple' | 'red';

const THEMES = {
  dark:   { bg: '#111827', text: '#FFFFFF', highlight: '#F59E0B', textDim: 'rgba(255,255,255,0.55)', accent: '#F59E0B' },
  purple: { bg: '#1E1B4B', text: '#E0E7FF', highlight: '#A78BFA', textDim: 'rgba(224,231,255,0.5)', accent: '#A78BFA' },
  red:    { bg: '#1A0A0A', text: '#FFFFFF', highlight: '#EF4444', textDim: 'rgba(255,255,255,0.5)', accent: '#EF4444' },
};

interface Segment {
  words: string[];
  highlightIdx?: number[];
  duration: number;
}

export interface PodProject { theme?: PodTheme; segments: Segment[]; speaker: string; topic: string; ctaText: string }

// ── WORD BY WORD RENDERER ─────────────────────────────────────────────────────
const WordReveal: React.FC<{ T: typeof THEMES.dark; words: string[]; highlights: Set<number>; frame: number; fps: number }> = ({ T, words, highlights, frame, fps }) => {
  const framesPerWord = 12;
  const visibleCount  = Math.min(Math.floor(frame / framesPerWord) + 1, words.length);
  const currentIdx    = visibleCount - 1;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 12px', justifyContent: 'center', alignItems: 'baseline' }}>
      {words.map((word, i) => {
        if (i >= visibleCount) return null;
        const isCurrent = i === currentIdx;
        const isHighlight = highlights.has(i);
        const wordSp = spring({ frame: frame - i * framesPerWord, fps, config: { stiffness: 120, damping: 14 } });
        const scale = interpolate(wordSp, [0, 0.5, 0.75, 1], [0.6, 1.12, 0.96, 1]);

        return (
          <span key={i} style={{
            fontFamily: '"Bebas Neue", Impact, sans-serif',
            fontSize: isCurrent ? 130 : isHighlight ? 110 : 95,
            color: isHighlight ? T.highlight : (i < currentIdx ? T.textDim : T.text),
            lineHeight: 1.05,
            textTransform: 'uppercase',
            transform: `scale(${scale})`,
            display: 'inline-block',
            textShadow: isHighlight ? `0 0 30px ${T.highlight}88` : 'none',
            letterSpacing: 2,
            transition: 'font-size 0.1s ease',
          }}>
            {word}
          </span>
        );
      })}
    </div>
  );
};

export const PodcastWordTemplate: React.FC<{ project?: PodProject }> = ({ project }) => {
  const { fps } = useVideoConfig();
  const frame   = useCurrentFrame();

  const p: PodProject = project ?? buildPodProject('dark');
  const T = THEMES[p.theme ?? 'dark'];

  // Calculate scene ranges
  const ranges = p.segments.reduce<{ start: number; end: number; seg: Segment }[]>(
    (acc, seg) => { const start = acc.length > 0 ? acc[acc.length-1].end : 0; return [...acc, {start, end: start + seg.duration * fps, seg}]; }, [],
  );

  const lastRange = ranges[ranges.length - 1];
  const isCTA = lastRange ? frame >= lastRange.end : false;

  if (isCTA) {
    const sf = frame - (ranges[ranges.length-1]?.end ?? 0);
    const mainSp = spring({ frame: sf, fps, config: { stiffness: 45, damping: 18 }, delay: 5 });
    const btnSp  = spring({ frame: sf, fps, config: { stiffness: 60, damping: 20 }, delay: 26 });

    return (
      <AbsoluteFill style={{ background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 72px', gap: 36 }}>
        <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 148, color: T.text, textAlign: 'center', lineHeight: 0.9, letterSpacing: 3, opacity: mainSp, transform: `translateY(${interpolate(mainSp,[0,1],[60,0])}px)` }}>
          {p.ctaText}
        </div>
        <div style={{
          background: T.accent, borderRadius: 100, padding: '20px 68px',
          fontFamily: '"Inter", system-ui, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff',
          opacity: btnSp, transform: `scale(${interpolate(btnSp,[0,1],[0.75,1])})`,
        }}>
          smartops-ia.com.br
        </div>
      </AbsoluteFill>
    );
  }

  const cur = ranges.find(r => frame >= r.start && frame < r.end) ?? ranges[ranges.length-1];
  const sf  = frame - cur.start;
  const seg = cur.seg;
  const highlights = new Set(seg.highlightIdx ?? []);

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, ${T.bg} 0%, ${T.bg}EE 60%, ${T.bg} 100%)`,
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
    }}>
      {/* Gradient accent top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: `linear-gradient(90deg, ${T.accent}, ${T.accent}55)` }} />

      {/* Speaker label */}
      <div style={{
        position: 'absolute', top: 72, left: 72, right: 72,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        opacity: 0.7,
      }}>
        <span style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 22, fontWeight: 700, color: T.highlight, letterSpacing: 3, textTransform: 'uppercase' }}>
          {p.speaker}
        </span>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: T.accent, boxShadow: `0 0 16px ${T.accent}`, opacity: Math.sin(frame * 0.15) * 0.5 + 0.5 }} />
      </div>

      {/* Words */}
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 64px 140px' }}>
        <WordReveal T={T} words={seg.words} highlights={highlights} frame={sf} fps={fps} />
      </AbsoluteFill>

      {/* Topic bottom */}
      <div style={{
        position: 'absolute', bottom: 64, left: 0, right: 0, textAlign: 'center',
        fontFamily: '"Inter", system-ui, sans-serif', fontSize: 24, color: T.textDim,
        letterSpacing: 3, textTransform: 'uppercase',
      }}>
        {p.topic}
      </div>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, height: 4,
        width: `${(frame / (ranges[ranges.length-1]?.end ?? 1)) * 100}%`,
        background: T.accent, opacity: 0.6,
      }} />
    </AbsoluteFill>
  );
};

export function buildPodProject(theme: PodTheme = 'dark'): PodProject {
  return {
    theme,
    speaker: 'SmartOps IA',
    topic: 'Lean · Six Sigma · Automação · IA',
    ctaText: 'Diagnóstico Gratuito',
    segments: [
      { words: ['Sua', 'empresa', 'está', 'PERDENDO', 'dinheiro', 'todo', 'mês.'], highlightIdx: [3], duration: 4 },
      { words: ['Retrabalho.', 'Improviso.', 'WhatsApp', 'caótico.', 'Estoque', 'parado.'], highlightIdx: [0,1], duration: 4 },
      { words: ['LEAN', 'SIX', 'SIGMA', '+', 'IA', 'resolve', 'isso.'], highlightIdx: [0,1,2,4], duration: 4 },
      { words: ['−30%', 'custo.', '+45%', 'eficiência.', '4', 'SEMANAS.'], highlightIdx: [0,2,5], duration: 4 },
      { words: ['Presencial.', 'BH/MG.', 'Resultado', 'GARANTIDO.'], highlightIdx: [3], duration: 3 },
    ],
  };
}
