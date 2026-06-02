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

export const SolutionScene: React.FC<Props> = ({ scene, frame }) => {
  const titleOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 20], [50, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const bodyOpacity = interpolate(frame, [18, 35], [0, 1], { extrapolateRight: 'clamp' });
  const glowOpacity = interpolate(frame, [0, 40], [0, 0.6], { extrapolateRight: 'clamp' });

  const bullets = scene.bullets ?? [];

  return (
    <AbsoluteFill style={{
      background: colors.background,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: `${layout.paddingY}px ${layout.paddingX}px`,
      overflow: 'hidden',
    }}>
      {/* Glow */}
      <div style={{
        position: 'absolute',
        right: -100,
        top: '50%',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${colors.accent}33, transparent 70%)`,
        opacity: glowOpacity,
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
      }} />

      {/* Check icon */}
      <div style={{
        fontSize: 72,
        marginBottom: spacing.lg,
        opacity: titleOpacity,
      }}>
        ✅
      </div>

      {/* Headline */}
      <div style={{
        fontFamily: typography.headline,
        fontSize: typography.sizeHeadline,
        fontWeight: 700,
        color: colors.accent,
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
          color: colors.textMuted,
          marginTop: spacing.md,
          lineHeight: 1.4,
          opacity: bodyOpacity,
          maxWidth: layout.maxWidth,
        }}>
          {scene.body}
        </div>
      )}

      {/* Bullets */}
      {bullets.length > 0 && (
        <div style={{ marginTop: spacing.lg }}>
          {bullets.map((bullet, i) => {
            const bulletOpacity = interpolate(frame, [35 + i * 10, 50 + i * 10], [0, 1], { extrapolateRight: 'clamp' });
            const bulletX = interpolate(frame, [35 + i * 10, 48 + i * 10], [-30, 0], {
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
                <svg viewBox="0 0 24 24" width={28} height={28} style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="11" fill="none" stroke={colors.accent} strokeWidth="2" />
                  <polyline points="6,12 10,16 18,8" stroke={colors.accent} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{
                  fontFamily: typography.body,
                  fontSize: typography.sizeBody,
                  color: colors.text,
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
