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

export const ProblemScene: React.FC<Props> = ({ scene, frame }) => {
  const titleOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 20], [50, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const bodyOpacity = interpolate(frame, [18, 35], [0, 1], { extrapolateRight: 'clamp' });

  const bullets = scene.bullets ?? [];

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, ${colors.surface} 0%, ${colors.background} 100%)`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: `${layout.paddingY}px ${layout.paddingX}px`,
    }}>
      {/* Warning icon */}
      <div style={{
        fontSize: 72,
        marginBottom: spacing.lg,
        opacity: titleOpacity,
      }}>
        ⚠️
      </div>

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
        textTransform: 'uppercase',
      }}>
        {scene.headline}
      </div>

      {/* Body */}
      {scene.body && (
        <div style={{
          fontFamily: typography.body,
          fontSize: typography.sizeSub,
          color: colors.accent,
          fontWeight: 600,
          marginTop: spacing.md,
          opacity: bodyOpacity,
        }}>
          {scene.body}
        </div>
      )}

      {/* Bullet list */}
      {bullets.length > 0 && (
        <div style={{ marginTop: spacing.lg }}>
          {bullets.map((bullet, i) => {
            const bulletOpacity = interpolate(frame, [35 + i * 8, 50 + i * 8], [0, 1], { extrapolateRight: 'clamp' });
            const bulletX = interpolate(frame, [35 + i * 8, 48 + i * 8], [-30, 0], {
              extrapolateRight: 'clamp',
              easing: Easing.out(Easing.quad),
            });

            return (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.md,
                marginBottom: spacing.md,
                opacity: bulletOpacity,
                transform: `translateX(${bulletX}px)`,
              }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: colors.danger,
                  flexShrink: 0,
                }} />
                <span style={{
                  fontFamily: typography.body,
                  fontSize: typography.sizeBody,
                  color: colors.textMuted,
                  lineHeight: 1.3,
                }}>
                  {bullet}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </AbsoluteFill>
  );
};
