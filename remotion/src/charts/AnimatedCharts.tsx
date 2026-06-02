// AnimatedCharts.tsx
// Gráficos animados usando D3 (escalas e math) + React SVG (rendering).
// D3 calcula posições/escalas; React renderiza — abordagem correta para Remotion.
// Inclui: BarChart, LineChart, DonutChart, AreaChart

import React from 'react';
import * as d3 from 'd3';
import { interpolate, useCurrentFrame, useVideoConfig, spring, Easing } from 'remotion';

// ── TIPOS ─────────────────────────────────────────────────────────────────────
export interface DataPoint { label: string; value: number; color?: string }
export interface TimePoint { date: string; value: number }

// ── PALETA PADRÃO ─────────────────────────────────────────────────────────────
const DEFAULT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// ══════════════════════════════════════════════════════════════════════════════
// BAR CHART — barras verticais que crescem de baixo para cima
// ══════════════════════════════════════════════════════════════════════════════
interface BarChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  startFrame?: number;
  showValues?: boolean;
  bgColor?: string;
  labelColor?: string;
}

export const AnimatedBarChart: React.FC<BarChartProps> = ({
  data,
  width = 900,
  height = 500,
  startFrame = 0,
  showValues = true,
  bgColor = 'transparent',
  labelColor = 'rgba(255,255,255,0.7)',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const margin = { top: 40, right: 20, bottom: 60, left: 20 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xScale = d3.scaleBand()
    .domain(data.map(d => d.label))
    .range([0, innerW])
    .padding(0.28);

  const maxVal = d3.max(data, d => d.value) ?? 0;
  const yScale = d3.scaleLinear().domain([0, maxVal * 1.1]).range([innerH, 0]);

  return (
    <svg width={width} height={height} style={{ background: bgColor }}>
      <g transform={`translate(${margin.left},${margin.top})`}>
        {/* Grid lines */}
        {yScale.ticks(4).map((tick, i) => (
          <line key={i} x1={0} x2={innerW} y1={yScale(tick)} y2={yScale(tick)}
            stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
        ))}

        {/* Bars */}
        {data.map((d, i) => {
          const delay = startFrame + i * 8;
          const sp = spring({ frame, fps, config: { stiffness: 40, damping: 20 }, delay });
          const barH = Math.max(0, innerH - yScale(d.value) * sp);
          const x = xScale(d.label) ?? 0;
          const barW = xScale.bandwidth();
          const color = d.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
          const y = innerH - barH;

          return (
            <g key={i}>
              {/* Bar */}
              <rect
                x={x} y={y} width={barW} height={barH}
                fill={color} rx={6} ry={6}
                style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}
              />
              {/* Top glow line */}
              {barH > 0 && (
                <rect x={x} y={y} width={barW} height={4} fill="rgba(255,255,255,0.4)" rx={3} />
              )}
              {/* Value label */}
              {showValues && sp > 0.5 && (
                <text
                  x={x + barW / 2} y={y - 10}
                  textAnchor="middle"
                  fontFamily='"Bebas Neue", Impact, sans-serif'
                  fontSize={32} fill={color}
                  opacity={Math.max(0, sp * 2 - 1)}
                >
                  {d.value}%
                </text>
              )}
              {/* X label */}
              <text
                x={x + barW / 2} y={innerH + 36}
                textAnchor="middle"
                fontFamily='"Inter", system-ui, sans-serif'
                fontSize={22} fill={labelColor}
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// LINE CHART — linha que se desenha da esquerda para direita
// ══════════════════════════════════════════════════════════════════════════════
interface LineChartProps {
  data: TimePoint[];
  width?: number;
  height?: number;
  color?: string;
  startFrame?: number;
  showArea?: boolean;
  label?: string;
}

export const AnimatedLineChart: React.FC<LineChartProps> = ({
  data,
  width = 900,
  height = 400,
  color = '#3B82F6',
  startFrame = 0,
  showArea = true,
  label,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const margin = { top: 30, right: 20, bottom: 50, left: 20 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xScale = d3.scaleLinear().domain([0, data.length - 1]).range([0, innerW]);
  const yScale = d3.scaleLinear()
    .domain([d3.min(data, d => d.value) ?? 0, (d3.max(data, d => d.value) ?? 0) * 1.1])
    .range([innerH, 0]);

  const lineGen = d3.line<TimePoint>()
    .x((_, i) => xScale(i))
    .y(d => yScale(d.value))
    .curve(d3.curveMonotoneX);

  const areaGen = d3.area<TimePoint>()
    .x((_, i) => xScale(i))
    .y0(innerH)
    .y1(d => yScale(d.value))
    .curve(d3.curveMonotoneX);

  const fullPath  = lineGen(data) ?? '';
  const areaPath  = areaGen(data) ?? '';

  // Animate draw progress
  const progress = interpolate(
    frame, [startFrame, startFrame + 50], [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
  );

  // SVG path length trick — use dasharray/dashoffset to reveal path
  const uid = `line-clip-${color.replace('#','')}`;

  return (
    <svg width={width} height={height}>
      <defs>
        <clipPath id={uid}>
          <rect x={0} y={-margin.top} width={innerW * progress} height={height} />
        </clipPath>
        <linearGradient id={`area-grad-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <g transform={`translate(${margin.left},${margin.top})`}>
        {/* Grid */}
        {yScale.ticks(4).map((tick, i) => (
          <line key={i} x1={0} x2={innerW} y1={yScale(tick)} y2={yScale(tick)}
            stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
        ))}

        <g clipPath={`url(#${uid})`}>
          {/* Area fill */}
          {showArea && <path d={areaPath} fill={`url(#area-grad-${uid})`} />}
          {/* Line */}
          <path d={fullPath} fill="none" stroke={color} strokeWidth={3}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
        </g>

        {/* Data points */}
        {data.map((d, i) => {
          const visible = i / (data.length - 1) <= progress;
          return visible ? (
            <circle key={i} cx={xScale(i)} cy={yScale(d.value)} r={5}
              fill={color} stroke="rgba(255,255,255,0.8)" strokeWidth={2} />
          ) : null;
        })}

        {/* Labels */}
        {data.map((d, i) => (
          <text key={i} x={xScale(i)} y={innerH + 28} textAnchor="middle"
            fontFamily='"Inter", system-ui, sans-serif' fontSize={18}
            fill="rgba(255,255,255,0.5)">
            {d.date}
          </text>
        ))}

        {label && (
          <text x={innerW / 2} y={-10} textAnchor="middle"
            fontFamily='"Inter", system-ui, sans-serif' fontSize={24} fontWeight={700}
            fill="rgba(255,255,255,0.7)">
            {label}
          </text>
        )}
      </g>
    </svg>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// DONUT CHART — setores que se revelam em arco
// ══════════════════════════════════════════════════════════════════════════════
interface DonutChartProps {
  data: DataPoint[];
  size?: number;
  thickness?: number;
  startFrame?: number;
  centerLabel?: string;
  centerSub?: string;
}

export const AnimatedDonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 400,
  thickness = 70,
  startFrame = 0,
  centerLabel,
  centerSub,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 10;
  const innerR = outerR - thickness;

  const total = d3.sum(data, d => d.value);

  const pie = d3.pie<DataPoint>()
    .value(d => d.value)
    .sort(null)
    .padAngle(0.03);

  const arc = d3.arc<d3.PieArcDatum<DataPoint>>()
    .innerRadius(innerR)
    .outerRadius(outerR)
    .cornerRadius(6);

  const arcs = pie(data);

  const progress = interpolate(
    frame, [startFrame, startFrame + 45], [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
  );

  return (
    <svg width={size} height={size}>
      <g transform={`translate(${cx},${cy})`}>
        {arcs.map((a, i) => {
          const color = a.data.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
          const animatedArc = { ...a, endAngle: a.startAngle + (a.endAngle - a.startAngle) * progress };
          const pathD = arc(animatedArc) ?? '';
          const sp = spring({ frame, fps, config: { stiffness: 60, damping: 20 }, delay: startFrame + i * 6 });

          return (
            <g key={i} transform={`scale(${sp})`}>
              <path d={pathD} fill={color} style={{ filter: `drop-shadow(0 0 8px ${color}55)` }} />
            </g>
          );
        })}

        {/* Center text */}
        {centerLabel && (
          <>
            <text textAnchor="middle" dy="-0.1em"
              fontFamily='"Bebas Neue", Impact, sans-serif' fontSize={56}
              fill="white" opacity={Math.max(0, progress * 2 - 0.5)}>
              {centerLabel}
            </text>
            {centerSub && (
              <text textAnchor="middle" dy="1.4em"
                fontFamily='"Inter", system-ui, sans-serif' fontSize={20}
                fill="rgba(255,255,255,0.6)" opacity={Math.max(0, progress * 2 - 0.8)}>
                {centerSub}
              </text>
            )}
          </>
        )}
      </g>
    </svg>
  );
};
