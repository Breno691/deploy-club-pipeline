import React from 'react';
import { AbsoluteFill, interpolate, Easing } from 'remotion';
import { colors, typography, layout } from '../brand/brandTokens';
import type { VideoScene } from '../data/video.schema';

interface Props {
  scene: VideoScene;
  frame: number;
  totalFrames: number;
  fps: number;
}

export const HookScene: React.FC<Props> = ({ scene, frame }) => {
  const textOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  const textY = interpolate(frame, [0, 20], [60, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const subOpacity = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: 'clamp' });
  const accentWidth = interpolate(frame, [25, 55], [0, 160], { extrapolateRight: 'clamp' });
  const bgGlow = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{
      background: colors.background,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: `${layout.paddingY}px ${layout.paddingX}px`,
      overflow: 'hidden',
    }}>
      {/* Glow background */}
      <div style={{
        position: 'absolute',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: colors.primaryGlow,
        filter: 'blur(120px)',
        opacity: bgGlow,
        pointerEvents: 'none',
      }} />

      {/* Headline */}
      <div style={{
        fontFamily: typography.headline,
        fontSize: typography.sizeHook,
        fontWeight: 700,
        color: colors.text,
        textAlign: 'center',
        lineHeight: 1.05,
        letterSpacing: 1,
        opacity: textOpacity,
        transform: `translateY(${textY}px)`,
        maxWidth: layout.maxWidth,
        zIndex: 1,
        textTransform: 'uppercase',
      }}>
        {scene.headline}
      </div>

      {/* Accent rule */}
      <div style={{
        width: accentWidth,
        height: 4,
        background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
        borderRadius: 2,
        margin: '32px 0 24px',
        zIndex: 1,
      }} />

      {/* Subheadline */}
      {scene.subheadline && (
        <div style={{
          fontFamily: typography.body,
          fontSize: typography.sizeCaption,
          color: colors.textMuted,
          textAlign: 'center',
          lineHeight: 1.4,
          opacity: subOpacity,
          maxWidth: layout.maxWidth,
          zIndex: 1,
        }}>
          {scene.subheadline}
        </div>
      )}
    </AbsoluteFill>
  );
};
