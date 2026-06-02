// BoldTypoTemplate.tsx
// Estilo: Tipografia Cinética Maximalista — texto gigante que ocupa toda a tela,
// palavras colidem, entram de direções opostas, tipografia como arte visual.
// Baseado em ESTILO 21 — Nike/Adidas/Monument style. Fontes 200px+.

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

export type TypoTheme = 'black' | 'white';

const THEMES = {
  black: { bg: '#000000', text: '#FFFFFF', accent: '#FF3B00', textDim: 'rgba(255,255,255,0.4)' },
  white: { bg: '#FFFFFF', text: '#000000', accent: '#0047FF', textDim: 'rgba(0,0,0,0.3)' },
};

export interface TypoProject { theme?: TypoTheme; words: string[]; sub: string; ctaText: string; ctaSub: string }

export const BoldTypoTemplate: React.FC<{ project?: TypoProject }> = ({ project }) => {
  const { fps } = useVideoConfig();
  const frame   = useCurrentFrame();
  const p: TypoProject = project ?? buildTypoProject('black');
  const T = THEMES[p.theme ?? 'black'];

  // Each word gets ~1.5 seconds (45 frames), cycling through all words
  const totalWords  = p.words.length;
  const framesPerWord = 45;
  const totalWordFrames = totalWords * framesPerWord;

  // Show CTA for last 6s
  const ctaStart = totalWordFrames;
  const showCTA  = frame >= ctaStart;

  if (showCTA) {
    const sf = frame - ctaStart;
    const mainSp = spring({ frame: sf, fps, config: { stiffness: 45, damping: 18 }, delay: 5 });
    const btnSp  = spring({ frame: sf, fps, config: { stiffness: 60, damping: 20 }, delay: 26 });

    return (
      <AbsoluteFill style={{ background: T.accent, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 72px', gap: 36 }}>
        <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 155, color: '#FFFFFF', textAlign: 'center', lineHeight: 0.88, letterSpacing: 3, opacity: mainSp, transform: `translateY(${interpolate(mainSp,[0,1],[70,0])}px)` }}>
          {p.ctaText}
        </div>
        <div style={{
          background: T.bg, borderRadius: 100, padding: '22px 68px',
          fontFamily: '"Inter", system-ui, sans-serif', fontSize: 34, fontWeight: 800, color: T.text,
          opacity: btnSp, transform: `scale(${interpolate(btnSp,[0,1],[0.75,1])})`,
        }}>
          {p.ctaSub}
        </div>
      </AbsoluteFill>
    );
  }

  const wordIdx  = Math.floor(frame / framesPerWord) % totalWords;
  const wordFrame = frame % framesPerWord;
  const word     = p.words[wordIdx];
  const nextWord = p.words[(wordIdx + 1) % totalWords];

  const wordSp = spring({ frame: wordFrame, fps, config: { stiffness: 80, damping: 14 }, delay: 0 });
  const exitSp = spring({ frame: wordFrame, fps, config: { stiffness: 100, damping: 20 }, delay: 30 });

  const directions = ['left', 'right', 'top', 'bottom', 'scale'];
  const dir = directions[wordIdx % directions.length];

  const getEnterTransform = (sp: number) => {
    switch (dir) {
      case 'left':   return `translateX(${interpolate(sp,[0,1],[-300,0])}px)`;
      case 'right':  return `translateX(${interpolate(sp,[0,1],[300,0])}px)`;
      case 'top':    return `translateY(${interpolate(sp,[0,1],[-300,0])}px)`;
      case 'bottom': return `translateY(${interpolate(sp,[0,1],[300,0])}px)`;
      case 'scale':  return `scale(${interpolate(sp,[0,1],[0.3,1])}) rotate(${interpolate(sp,[0,1],[-8,0])}deg)`;
      default:       return '';
    }
  };

  const wordLength = word.length;
  const fontSize = wordLength <= 4 ? 240 : wordLength <= 8 ? 190 : wordLength <= 12 ? 150 : 120;

  return (
    <AbsoluteFill style={{ background: T.bg }}>
      {/* Full-bleed decorative accent line */}
      <div style={{
        position: 'absolute', left: 0, right: 0,
        height: 8, background: T.accent,
        top: '50%', transform: 'translateY(-50%)',
        opacity: 0.15,
      }} />

      {/* Word number indicator */}
      <div style={{
        position: 'absolute', top: 60, right: 64,
        fontFamily: '"Inter", system-ui, sans-serif',
        fontSize: 22, fontWeight: 700, color: T.textDim,
        letterSpacing: 3,
        opacity: interpolate(wordSp,[0,1],[0,1]),
      }}>
        {String(wordIdx + 1).padStart(2,'0')} / {String(totalWords).padStart(2,'0')}
      </div>

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 40px', overflow: 'hidden' }}>
        <div style={{
          fontFamily: '"Bebas Neue", Impact, sans-serif',
          fontSize: fontSize, color: T.text,
          lineHeight: 0.88, letterSpacing: 2, textAlign: 'center',
          textTransform: 'uppercase',
          opacity: wordSp,
          transform: getEnterTransform(wordSp),
          textShadow: wordIdx % 3 === 0 ? `4px 4px 0 ${T.accent}` : 'none',
          transition: 'none',
          maxWidth: 980,
        }}>
          {word}
        </div>

        {/* Accent underline that draws under key words */}
        {wordIdx % 2 === 0 && (
          <div style={{
            width: interpolate(wordFrame,[5,25],[0,Math.min(wordLength * 30, 800)],{extrapolateRight:'clamp',easing:Easing.out(Easing.quad)}),
            height: 8, background: T.accent, marginTop: 16, borderRadius: 4,
          }} />
        )}
      </AbsoluteFill>

      {/* Sub text at bottom */}
      {wordIdx === totalWords - 1 && (
        <div style={{
          position: 'absolute', bottom: 80, left: 72, right: 72, textAlign: 'center',
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: 36, color: T.textDim, lineHeight: 1.4,
          opacity: interpolate(wordFrame,[20,40],[0,1],{extrapolateRight:'clamp'}),
        }}>
          {p.sub}
        </div>
      )}
    </AbsoluteFill>
  );
};

export function buildTypoProject(theme: TypoTheme = 'black'): TypoProject {
  return {
    theme,
    words: ['Desperdício.', 'Retrabalho.', 'Caos.', 'Improviso.', 'Chega.', 'SmartOps IA.'],
    sub: 'Lean Six Sigma + IA para PMEs em BH/MG',
    ctaText: 'Diagnóstico Gratuito',
    ctaSub: 'smartops-ia.com.br',
  };
}
