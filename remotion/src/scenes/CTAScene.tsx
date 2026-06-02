import React from 'react';
import { AbsoluteFill, interpolate, spring, Easing } from 'remotion';
import { colors, typography, layout, spacing, brand } from '../brand/brandTokens';
import type { VideoScene } from '../data/video.schema';

interface Props {
  scene: VideoScene;
  frame: number;
  totalFrames: number;
  fps: number;
  cta?: { text: string; subtext?: string };
}

export const CTAScene: React.FC<Props> = ({ scene, frame, fps, cta }) => {
  const titleScale = spring({ frame, fps, config: { damping: 14, stiffness: 90 } });
  const subOpacity = interpolate(frame, [18, 38], [0, 1], { extrapolateRight: 'clamp' });
  const buttonScale = spring({ frame: frame - 25, fps, config: { damping: 12, stiffness: 80 } });
  const buttonOpacity = interpolate(frame, [22, 40], [0, 1], { extrapolateRight: 'clamp' });
  const brandOpacity = interpolate(frame, [35, 55], [0, 1], { extrapolateRight: 'clamp' });

  const pulseScale = interpolate(
    (frame - 40) % 60,
    [0, 30, 60],
    [1, 1.04, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const ctaText = cta?.text ?? brand.ctaText;
  const ctaSubtext = cta?.subtext ?? scene.subheadline;

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, ${colors.surface} 0%, ${colors.background} 100%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: `${layout.paddingY}px ${layout.paddingX}px`,
      overflow: 'hidden',
    }}>
      {/* Radial glow */}
      <div style={{
        position: 'absolute',
        width: 700,
        height: 700,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${colors.primaryGlow}, transparent 65%)`,
        opacity: 0.8,
        pointerEvents: 'none',
      }} />

      {/* Headline */}
      <div style={{
        fontFamily: typography.headline,
        fontSize: typography.sizeHeadline,
        fontWeight: 700,
        color: colors.text,
        textAlign: 'center',
        lineHeight: 1.05,
        letterSpacing: 1,
        transform: `scale(${titleScale})`,
        maxWidth: layout.maxWidth,
        zIndex: 1,
        textTransform: 'uppercase',
      }}>
        {scene.headline}
      </div>

      {/* Subheadline */}
      {ctaSubtext && (
        <div style={{
          fontFamily: typography.body,
          fontSize: typography.sizeBody,
          color: colors.textMuted,
          textAlign: 'center',
          marginTop: spacing.md,
          lineHeight: 1.4,
          opacity: subOpacity,
          maxWidth: layout.maxWidth,
          zIndex: 1,
        }}>
          {ctaSubtext}
        </div>
      )}

      {/* CTA Button */}
      <div style={{
        marginTop: spacing.xl,
        background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
        color: colors.text,
        fontFamily: typography.body,
        fontSize: typography.sizeSub,
        fontWeight: 700,
        padding: `${spacing.md}px ${spacing.xl}px`,
        borderRadius: 12,
        transform: `scale(${Math.max(0, buttonScale) * (frame > 40 ? pulseScale : 1)})`,
        opacity: buttonOpacity,
        zIndex: 1,
        letterSpacing: 0.5,
        boxShadow: `0 0 40px ${colors.primaryGlow}`,
      }}>
        {ctaText}
      </div>

      {/* Brand footer */}
      <div style={{
        position: 'absolute',
        bottom: 64,
        fontFamily: typography.body,
        fontSize: typography.sizeSmall,
        color: colors.textMuted,
        letterSpacing: 3,
        textTransform: 'uppercase',
        opacity: brandOpacity,
        zIndex: 1,
      }}>
        {brand.name} · {brand.location}
      </div>
    </AbsoluteFill>
  );
};
