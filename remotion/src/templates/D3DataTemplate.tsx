// D3DataTemplate.tsx
// Template de data storytelling usando gráficos D3 animados.
// Bar chart, Line chart e Donut chart em sequência — conta a história do ROI.

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from 'remotion';
import { AnimatedBarChart, AnimatedLineChart, AnimatedDonutChart } from '../charts/AnimatedCharts';

const C = {
  bg:     '#0A0F1E',
  bgAlt:  '#0F1629',
  text:   '#FFFFFF',
  dimW:   'rgba(255,255,255,0.65)',
  blue:   '#3B82F6',
  green:  '#10B981',
  amber:  '#F59E0B',
  red:    '#EF4444',
  purple: '#8B5CF6',
  border: 'rgba(255,255,255,0.08)',
};

const Label: React.FC<{ text: string; color?: string; size?: number; frame: number; fps: number; delay?: number }> = ({ text, color = C.text, size = 88, frame, fps, delay = 0 }) => {
  const sp = spring({ frame, fps, config: { stiffness: 55, damping: 18 }, delay });
  return (
    <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: size, color, letterSpacing: 2, lineHeight: 1, opacity: sp, transform: `translateY(${interpolate(sp,[0,1],[40,0])}px)` }}>
      {text}
    </div>
  );
};

// ── SCENE 1: BAR CHART — desperdícios por categoria ───────────────────────────
const BarScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <AbsoluteFill style={{ background: C.bg, display: 'flex', flexDirection: 'column', padding: '64px 56px', gap: 16 }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: `linear-gradient(90deg, ${C.red}, ${C.amber})` }} />
    <Label text="Onde vai o dinheiro da sua empresa:" color={C.amber} size={80} frame={frame} fps={fps} delay={0} />
    <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 30, color: C.dimW, opacity: interpolate(frame,[12,28],[0,1],{extrapolateRight:'clamp'}) }}>
      % do custo operacional desperdiçado por categoria
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
      <AnimatedBarChart
        startFrame={8}
        width={940}
        height={520}
        showValues
        data={[
          { label: 'Retrabalho',  value: 32, color: C.red },
          { label: 'Esperas',     value: 24, color: C.amber },
          { label: 'Moviment.',   value: 18, color: C.purple },
          { label: 'Estoque',     value: 15, color: C.blue },
          { label: 'Processo',    value: 11, color: C.green },
        ]}
      />
    </div>
  </AbsoluteFill>
);

// ── SCENE 2: LINE CHART — evolução do custo com SmartOps IA ──────────────────
const LineScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <AbsoluteFill style={{ background: C.bg, display: 'flex', flexDirection: 'column', padding: '64px 56px', gap: 16 }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: `linear-gradient(90deg, ${C.blue}, ${C.green})` }} />
    <Label text="Custo operacional ao longo do projeto:" color={C.blue} size={80} frame={frame} fps={fps} delay={0} />
    <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 30, color: C.dimW, opacity: interpolate(frame,[12,28],[0,1],{extrapolateRight:'clamp'}) }}>
      Índice de custo (100 = ponto de partida) — cliente real BH/MG
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
      <AnimatedLineChart
        startFrame={8}
        width={940}
        height={480}
        color={C.green}
        showArea
        data={[
          { date: 'Jan', value: 100 },
          { date: 'Fev', value: 98 },
          { date: 'Mar', value: 91 },
          { date: 'Abr', value: 82 },
          { date: 'Mai', value: 74 },
          { date: 'Jun', value: 68 },
        ]}
      />
    </div>
  </AbsoluteFill>
);

// ── SCENE 3: DONUT CHART — distribuição de tempo automatizado vs manual ──────
const DonutScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <AbsoluteFill style={{ background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 56px', gap: 20 }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: `linear-gradient(90deg, ${C.green}, ${C.blue})` }} />
    <Label text="Antes vs. depois: distribuição do trabalho" color={C.green} size={80} frame={frame} fps={fps} delay={0} />

    <div style={{ display: 'flex', alignItems: 'center', gap: 60, marginTop: 20 }}>
      {/* Donut antes */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 28, color: C.dimW, fontWeight: 700 }}>ANTES</div>
        <AnimatedDonutChart
          startFrame={6} size={320} thickness={60}
          centerLabel="74%" centerSub="manual"
          data={[
            { label: 'Manual',     value: 74, color: C.red },
            { label: 'Automático', value: 26, color: C.green },
          ]}
        />
      </div>

      {/* Arrow */}
      <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 96, color: C.blue, opacity: interpolate(frame,[20,35],[0,1],{extrapolateRight:'clamp'}) }}>
        →
      </div>

      {/* Donut depois */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 28, color: C.green, fontWeight: 700 }}>DEPOIS</div>
        <AnimatedDonutChart
          startFrame={22} size={320} thickness={60}
          centerLabel="79%" centerSub="automático"
          data={[
            { label: 'Manual',     value: 21, color: C.red },
            { label: 'Automático', value: 79, color: C.green },
          ]}
        />
      </div>
    </div>

    <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 30, color: C.dimW, textAlign: 'center', opacity: interpolate(frame,[50,65],[0,1],{extrapolateRight:'clamp'}) }}>
      De 74% manual → 79% automatizado em 4 semanas
    </div>
  </AbsoluteFill>
);

// ── SCENE 4: CTA ──────────────────────────────────────────────────────────────
const D3CTA: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const mainSp = spring({ frame, fps, config: { stiffness: 50, damping: 18 }, delay: 5 });
  const btnSp  = spring({ frame, fps, config: { stiffness: 65, damping: 20 }, delay: 26 });
  return (
    <AbsoluteFill style={{ background: C.bgAlt, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 72px', gap: 36 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: `linear-gradient(90deg, ${C.blue}, ${C.green})` }} />
      <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 148, color: C.text, textAlign: 'center', lineHeight: 0.9, letterSpacing: 3, opacity: mainSp, transform: `translateY(${interpolate(mainSp,[0,1],[60,0])}px)` }}>
        Veja os dados da sua empresa
      </div>
      <div style={{
        background: `linear-gradient(135deg, ${C.blue}, ${C.green})`,
        borderRadius: 100, padding: '22px 72px',
        fontFamily: '"Inter", system-ui, sans-serif', fontSize: 34, fontWeight: 800, color: '#fff',
        opacity: btnSp, transform: `scale(${interpolate(btnSp,[0,1],[0.75,1])})`,
        boxShadow: `0 0 50px ${C.blue}55`,
      }}>
        Diagnóstico Gratuito · smartops-ia.com.br
      </div>
    </AbsoluteFill>
  );
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
export const D3DataTemplate: React.FC = () => {
  const { fps } = useVideoConfig();
  const frame   = useCurrentFrame();

  // Each scene: 10s, 10s, 12s, 6s = 38s total
  const s1End = 10 * fps;
  const s2End = 20 * fps;
  const s3End = 32 * fps;

  if (frame < s1End)      return <BarScene   frame={frame}         fps={fps} />;
  if (frame < s2End)      return <LineScene  frame={frame - s1End} fps={fps} />;
  if (frame < s3End)      return <DonutScene frame={frame - s2End} fps={fps} />;
  return                         <D3CTA      frame={frame - s3End} fps={fps} />;
};
