// LottieTemplate.tsx
// Template com animações Lottie do LottieFiles CDN.
// Carrega os JSON remotamente via delayRender/continueRender do Remotion.

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { LottieRemote } from '../components/LottiePlayer';

// Animações gratuitas do LottieFiles CDN (lottie.host)
const LOTTIE_URLS = {
  analytics: 'https://lottie.host/4db68bbd-31f6-4cd8-84eb-189de081159a/IGmMCqhzpt.json',
  rocket:    'https://lottie.host/5ebe9b73-0b60-4dda-8ece-58dfb487bd5d/RVllHLmxd0.json',
  checkmark: 'https://lottie.host/cf2dc43b-b4c6-4e78-a2d6-9a58d2d4ac1e/a3LjRBa2iL.json',
  gear:      'https://lottie.host/0e5d1a2c-a1cb-4f1a-9dc4-24c2aaf2fc75/OtpVspNnit.json',
};

const C = {
  bg:    '#0B0F1A',
  card:  '#111827',
  text:  '#FFFFFF',
  dimW:  'rgba(255,255,255,0.65)',
  blue:  '#3B82F6',
  green: '#10B981',
};

interface CardData { url: string; title: string; body: string; color: string; delay: number }

const AnimCard: React.FC<{ card: CardData; frame: number; fps: number }> = ({ card, frame, fps }) => {
  const sp = spring({ frame, fps, config: { stiffness: 55, damping: 20 }, delay: card.delay });
  return (
    <div style={{
      background: C.card, border: `1px solid ${card.color}33`, borderRadius: 24, padding: '20px 24px',
      display: 'flex', alignItems: 'center', gap: 20,
      opacity: sp, transform: `translateY(${interpolate(sp,[0,1],[50,0])}px) scale(${interpolate(sp,[0,1],[0.92,1])})`,
      boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
    }}>
      <div style={{ flexShrink: 0, width: 80, height: 80 }}>
        <LottieRemote url={card.url} width={80} height={80} loop />
      </div>
      <div>
        <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 44, color: card.color, lineHeight: 1, letterSpacing: 1 }}>
          {card.title}
        </div>
        <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 28, color: C.dimW, lineHeight: 1.35, marginTop: 4 }}>
          {card.body}
        </div>
      </div>
    </div>
  );
};

export const LottieTemplate: React.FC = () => {
  const { fps } = useVideoConfig();
  const frame   = useCurrentFrame();

  const titleSp = spring({ frame, fps, config: { stiffness: 50, damping: 18 }, delay: 5 });
  const subSp   = spring({ frame, fps, config: { stiffness: 45, damping: 20 }, delay: 20 });

  const cards: CardData[] = [
    { url: LOTTIE_URLS.analytics, title: 'Dados em tempo real',   body: 'Dashboard KPIs do seu processo',   color: C.blue,    delay: 28 },
    { url: LOTTIE_URLS.gear,      title: 'Automação inteligente', body: 'n8n + IA eliminam trabalho manual', color: '#8B5CF6', delay: 42 },
    { url: LOTTIE_URLS.rocket,    title: 'Resultado em 90 dias',  body: '−30% custo · +45% eficiência',    color: '#F59E0B', delay: 56 },
    { url: LOTTIE_URLS.checkmark, title: 'Lean Six Sigma',        body: 'Black Belt presencial em BH/MG',   color: C.green,   delay: 70 },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 20%, rgba(59,130,246,0.12) 0%, transparent 60%)' }} />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 56px', gap: 20, zIndex: 2 }}>
        <div>
          <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 22, fontWeight: 700, letterSpacing: 4, color: C.blue, textTransform: 'uppercase', opacity: titleSp, marginBottom: 12 }}>
            SmartOps IA
          </div>
          <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 130, color: C.text, lineHeight: 0.9, letterSpacing: 2, opacity: titleSp, transform: `translateY(${interpolate(titleSp,[0,1],[50,0])}px)` }}>
            Tudo que fazemos.
          </div>
        </div>

        <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 34, color: C.dimW, lineHeight: 1.4, opacity: subSp, marginBottom: 8 }}>
          Lean Six Sigma + IA para PMEs em BH/MG
        </div>

        {cards.map((card, i) => (
          <AnimCard key={i} card={card} frame={frame} fps={fps} />
        ))}

        <div style={{ textAlign: 'center', marginTop: 4, opacity: interpolate(frame,[80,95],[0,1],{extrapolateRight:'clamp'}) }}>
          <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 28, color: C.dimW, letterSpacing: 3, textTransform: 'uppercase' }}>
            smartops-ia.com.br · Diagnóstico Gratuito
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
