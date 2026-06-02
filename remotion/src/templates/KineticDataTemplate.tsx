// KineticDataTemplate.tsx
// Estilo: Kinetic Data Storytelling — gráficos que se constroem, números que contam,
// barras que crescem, linha de progresso que se desenha. Visual B2B profissional premium.
// Baseado em ESTILO 32 da pesquisa — o mais recomendado para consultoria B2B.

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

const C = {
  bg:      '#FFFFFF',
  bgAlt:   '#F8FAFC',
  text:    '#0F172A',
  textMid: '#334155',
  textDim: '#64748B',
  blue:    '#2563EB',
  green:   '#059669',
  red:     '#DC2626',
  amber:   '#D97706',
  border:  '#E2E8F0',
  line:    '#CBD5E1',
};

// ── ANIMATED NUMBER (counts from 0 to value) ─────────────────────────────────
const AnimNum: React.FC<{ raw: string; frame: number; start: number; duration?: number; size: number; color: string }> = ({ raw, frame, start, duration = 40, size, color }) => {
  const prog = interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad),
  });
  const prefix = raw.match(/^[^0-9]*/)?.[0] ?? '';
  const num    = parseInt(raw.replace(/[^0-9]/g, '') || '0');
  const suffix = raw.replace(/^[^0-9]*/, '').replace(/^[0-9]+/, '');
  const display = `${prefix}${Math.round(num * prog)}${suffix}`;

  return (
    <span style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: size, color, lineHeight: 1 }}>
      {display}
    </span>
  );
};

// ── BAR CHART COMPONENT ──────────────────────────────────────────────────────
const Bar: React.FC<{ value: number; maxValue: number; label: string; color: string; frame: number; delay: number; fps: number }> = ({ value, maxValue, label, color, frame, delay, fps }) => {
  const sp = spring({ frame, fps, config: { stiffness: 35, damping: 20 }, delay });
  const barH = interpolate(sp, [0, 1], [0, (value / maxValue) * 280]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, flex: 1 }}>
      <AnimNum raw={`${value}%`} frame={frame} start={delay} size={56} color={color} />
      <div style={{ width: '100%', height: 280, background: C.border, borderRadius: 8, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
        <div style={{ width: '100%', height: barH, background: color, borderRadius: 8, boxShadow: `0 -4px 20px ${color}44` }} />
      </div>
      <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 26, color: C.textMid, textAlign: 'center', lineHeight: 1.3 }}>{label}</div>
    </div>
  );
};

// ── SCENE: OPENING STAT ───────────────────────────────────────────────────────
const OpeningScene: React.FC<{ frame: number; fps: number; headline: string; bigNum: string; bigLabel: string; sub: string }> = ({ frame, fps, headline, bigNum, bigLabel, sub }) => {
  const hSp  = spring({ frame, fps, config: { stiffness: 50, damping: 18 }, delay: 5 });
  const lineW = interpolate(frame, [12, 48], [0, 280], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Subtle grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${C.border} 1px, transparent 1px), linear-gradient(90deg, ${C.border} 1px, transparent 1px)`, backgroundSize: '72px 72px', opacity: 0.5 }} />
      {/* Top accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: `linear-gradient(90deg, ${C.blue}, ${C.green})` }} />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 80px', gap: 24 }}>
        <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 24, fontWeight: 700, letterSpacing: 4, color: C.blue, textTransform: 'uppercase', opacity: hSp }}>
          {headline}
        </div>

        {/* BIG NUMBER */}
        <div style={{ opacity: hSp, transform: `scale(${interpolate(hSp,[0,1],[0.7,1])})` }}>
          <AnimNum raw={bigNum} frame={frame} start={10} duration={50} size={220} color={C.red} />
        </div>

        <div style={{ width: lineW, height: 4, background: `linear-gradient(90deg, ${C.blue}, ${C.green})`, borderRadius: 2 }} />

        <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 38, color: C.textMid, textAlign: 'center', lineHeight: 1.4, maxWidth: 800, opacity: interpolate(frame,[30,50],[0,1],{extrapolateRight:'clamp'}) }}>
          {bigLabel}
        </div>
        <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 28, color: C.textDim, textAlign: 'center', opacity: interpolate(frame,[44,60],[0,1],{extrapolateRight:'clamp'}) }}>
          {sub}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE: BAR CHART ─────────────────────────────────────────────────────────
const BarChartScene: React.FC<{ frame: number; fps: number; headline: string; bars: { value: number; label: string; color?: string }[] }> = ({ frame, fps, headline, bars }) => {
  const maxVal = Math.max(...bars.map(b => b.value));
  const colors = [C.blue, C.green, C.amber, C.red];

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: C.blue }} />
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 72px 48px', gap: 32 }}>
        <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 90, color: C.text, letterSpacing: 2, opacity: interpolate(frame,[0,18],[0,1],{extrapolateRight:'clamp'}) }}>
          {headline}
        </div>
        <div style={{ display: 'flex', gap: 20, flex: 1, alignItems: 'flex-end' }}>
          {bars.map((b, i) => (
            <Bar key={i} value={b.value} maxValue={maxVal} label={b.label} color={b.color ?? colors[i % colors.length]} frame={frame} delay={16 + i * 14} fps={fps} />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE: BEFORE / AFTER ────────────────────────────────────────────────────
const BeforeAfterScene: React.FC<{ frame: number; fps: number; headline: string; items: { label: string; before: string; after: string }[] }> = ({ frame, fps, headline, items }) => {
  const hOp = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: `linear-gradient(90deg, ${C.red}, ${C.green})` }} />
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 64px', gap: 24 }}>
        <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 90, color: C.text, letterSpacing: 2, opacity: hOp }}>
          {headline}
        </div>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, opacity: hOp }}>
          <div />
          <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 24, fontWeight: 700, color: C.red, textAlign: 'center', letterSpacing: 2, textTransform: 'uppercase' }}>ANTES</div>
          <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 24, fontWeight: 700, color: C.green, textAlign: 'center', letterSpacing: 2, textTransform: 'uppercase' }}>DEPOIS</div>
        </div>

        {items.map((item, i) => {
          const sp = spring({ frame, fps, config: { stiffness: 55, damping: 18 }, delay: 18 + i * 14 });
          return (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, alignItems: 'center',
              opacity: sp, transform: `translateX(${interpolate(sp,[0,1],[-40,0])}px)`,
            }}>
              <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 28, color: C.textMid, lineHeight: 1.3 }}>{item.label}</div>
              <div style={{ background: `${C.red}12`, border: `1px solid ${C.red}33`, borderRadius: 12, padding: '14px', textAlign: 'center' }}>
                <span style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 52, color: C.red }}>{item.before}</span>
              </div>
              <div style={{ background: `${C.green}12`, border: `1px solid ${C.green}33`, borderRadius: 12, padding: '14px', textAlign: 'center' }}>
                <span style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 52, color: C.green }}>{item.after}</span>
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE: CTA ────────────────────────────────────────────────────────────────
const DataCTA: React.FC<{ frame: number; fps: number; ctaText: string; ctaSub: string }> = ({ frame, fps, ctaText, ctaSub }) => {
  const mainSp = spring({ frame, fps, config: { stiffness: 45, damping: 18 }, delay: 5 });
  const btnSp  = spring({ frame, fps, config: { stiffness: 60, damping: 20 }, delay: 26 });
  return (
    <AbsoluteFill style={{ background: C.text }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: `linear-gradient(90deg, ${C.blue}, ${C.green})` }} />
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 72px', gap: 36 }}>
        <div style={{
          fontFamily: '"Bebas Neue", Impact, sans-serif',
          fontSize: 148, color: C.bg, textAlign: 'center', lineHeight: 0.9, letterSpacing: 3,
          opacity: mainSp, transform: `translateY(${interpolate(mainSp,[0,1],[60,0])}px)`,
        }}>
          {ctaText}
        </div>
        <div style={{
          background: C.blue, borderRadius: 100, padding: '22px 68px',
          fontFamily: '"Inter", system-ui, sans-serif', fontSize: 34, fontWeight: 800, color: '#fff',
          opacity: btnSp, transform: `scale(${interpolate(btnSp,[0,1],[0.75,1])})`,
          boxShadow: `0 0 50px ${C.blue}88`,
        }}>
          {ctaSub}
        </div>
        <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 24, color: 'rgba(255,255,255,0.5)', letterSpacing: 3, textTransform: 'uppercase', opacity: interpolate(frame,[44,58],[0,1],{extrapolateRight:'clamp'}) }}>
          Lean · Six Sigma · Automação · IA
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
interface KDScene {
  type: 'opening' | 'bars' | 'before_after' | 'cta';
  duration: number;
  headline?: string; sub?: string;
  bigNum?: string; bigLabel?: string;
  bars?: { value: number; label: string; color?: string }[];
  items?: { label: string; before: string; after: string }[];
  ctaText?: string; ctaSub?: string;
}

export interface KineticDataProject { scenes: KDScene[] }

export function buildKineticDataProject(): KineticDataProject {
  return {
    scenes: [
      { type: 'opening', duration: 7, headline: 'O custo oculto da sua empresa:', bigNum: 'R$41k', bigLabel: 'perdidos por mês em retrabalho, espera e desperdício', sub: 'Média das PMEs atendidas pela SmartOps IA em BH/MG' },
      { type: 'bars', duration: 9, headline: 'Onde vai o dinheiro perdido:', bars: [
        { value: 82, label: 'Retrabalho', color: C.red },
        { value: 68, label: 'Esperas', color: C.amber },
        { value: 55, label: 'Movimentação', color: C.blue },
        { value: 74, label: 'Processo manual', color: C.textDim },
      ]},
      { type: 'before_after', duration: 10, headline: 'Antes e depois — 90 dias:', items: [
        { label: 'Custo operacional', before: 'R$41k', after: 'R$28k' },
        { label: 'Entregas no prazo', before: '62%', after: '94%' },
        { label: 'Horas manuais/sem.', before: '23h', after: '5h' },
      ]},
      { type: 'cta', duration: 6, ctaText: 'Veja como ficaria na sua empresa', ctaSub: 'Diagnóstico gratuito · smartops-ia.com.br' },
    ],
  };
}

export const KineticDataTemplate: React.FC<{ project?: KineticDataProject }> = ({ project }) => {
  const { fps } = useVideoConfig();
  const frame   = useCurrentFrame();
  const scenes  = project?.scenes ?? buildKineticDataProject().scenes;
  const ranges  = scenes.reduce<{ start: number; end: number; scene: KDScene }[]>(
    (acc, s) => { const start = acc.length > 0 ? acc[acc.length-1].end : 0; return [...acc,{start,end:start+s.duration*fps,scene:s}]; }, [],
  );
  const cur = ranges.find(r => frame >= r.start && frame < r.end) ?? ranges[ranges.length-1];
  const sf  = frame - cur.start;
  const s   = cur.scene;

  switch (s.type) {
    case 'opening':     return <OpeningScene     frame={sf} fps={fps} headline={s.headline!} bigNum={s.bigNum!} bigLabel={s.bigLabel!} sub={s.sub!} />;
    case 'bars':        return <BarChartScene     frame={sf} fps={fps} headline={s.headline!} bars={s.bars!} />;
    case 'before_after':return <BeforeAfterScene  frame={sf} fps={fps} headline={s.headline!} items={s.items!} />;
    case 'cta':         return <DataCTA           frame={sf} fps={fps} ctaText={s.ctaText!} ctaSub={s.ctaSub!} />;
    default:            return <OpeningScene     frame={sf} fps={fps} headline={s.headline ?? ''} bigNum="0" bigLabel="" sub="" />;
  }
};
