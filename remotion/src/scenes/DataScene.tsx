import React from 'react';
import { AbsoluteFill, interpolate, Easing } from 'remotion';
import { colors, typography, layout, spacing } from '../brand/brandTokens';
import type { VideoScene } from '../data/video.schema';

interface Props {
  scene: VideoScene;
  frame: number;
  totalFrames: number;
  fps: number;
}

const MetricCard: React.FC<{
  label: string;
  value: string | number;
  unit?: string;
  frame: number;
  delay: number;
}> = ({ label, value, unit, frame, delay }) => {
  const opacity = interpolate(frame, [delay, delay + 18], [0, 1], { extrapolateRight: 'clamp' });
  const scale = interpolate(frame, [delay, delay + 20], [0.7, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.3)),
  });

  return (
    <div style={{
      background: colors.surface,
      border: `1px solid ${colors.primaryBorder}`,
      borderRadius: 16,
      padding: `${spacing.lg}px ${spacing.xl}px`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      flex: 1,
      opacity,
      transform: `scale(${scale})`,
    }}>
      <div style={{
        fontFamily: typography.headline,
        fontSize: 80,
        fontWeight: 700,
        color: colors.primary,
        lineHeight: 1,
        letterSpacing: -1,
      }}>
        {value}
      </div>
      {unit && (
        <div style={{
          fontFamily: typography.body,
          fontSize: typography.sizeSmall,
          color: colors.accent,
          fontWeight: 600,
          marginTop: spacing.xs,
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}>
          {unit}
        </div>
      )}
      <div style={{
        fontFamily: typography.body,
        fontSize: typography.sizeCaption,
        color: colors.textMuted,
        marginTop: spacing.sm,
        textAlign: 'center',
        lineHeight: 1.2,
      }}>
        {label}
      </div>
    </div>
  );
};

export const DataScene: React.FC<Props> = ({ scene, frame }) => {
  const titleOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 20], [40, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  const metrics = scene.metrics ?? [];

  return (
    <AbsoluteFill style={{
      background: colors.background,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: `${layout.paddingY}px ${layout.paddingX}px`,
    }}>
      {/* Headline */}
      <div style={{
        fontFamily: typography.headline,
        fontSize: typography.sizeHeadline,
        fontWeight: 700,
        color: colors.text,
        lineHeight: 1.1,
        letterSpacing: 0.5,
        opacity: titleOpacity,
        transform: `translateY(${titleY}px)`,
        maxWidth: layout.maxWidth,
        marginBottom: spacing.xl,
        textTransform: 'uppercase',
      }}>
        {scene.headline}
      </div>

      {/* Metrics grid */}
      <div style={{
        display: 'flex',
        gap: spacing.md,
        flexWrap: 'wrap',
      }}>
        {metrics.map((metric, i) => (
          <MetricCard
            key={i}
            label={metric.label}
            value={metric.value}
            unit={metric.unit}
            frame={frame}
            delay={20 + i * 12}
          />
        ))}
      </div>

      {/* Body text */}
      {scene.body && (
        <div style={{
          fontFamily: typography.body,
          fontSize: typography.sizeBody,
          color: colors.textMuted,
          marginTop: spacing.lg,
          lineHeight: 1.4,
          opacity: interpolate(frame, [50, 70], [0, 1], { extrapolateRight: 'clamp' }),
        }}>
          {scene.body}
        </div>
      )}
    </AbsoluteFill>
  );
};
