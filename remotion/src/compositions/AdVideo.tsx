import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';
import { z } from 'zod';

// SmartOps IA uses system fonts — no Google Fonts needed
// Font stack matches the site exactly
const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';

// ─── Schema ───────────────────────────────────────────────────────────────────

const SceneSchema = z.object({
  type: z.enum(['hook', 'problem', 'product', 'benefit', 'testimonial', 'offer', 'cta']),
  text: z.string(),
  subtext: z.string().optional(),
  quote: z.string().optional(),
  price: z.string().optional(),
  visual: z.string().optional(),   // descriptive hint only — not used by renderer
  animation: z.string().optional(),
  duration: z.number(),
});

export const AdVideoSchema = z.object({
  style: z.string(),
  duration: z.number(),
  platform: z.string(),
  service: z.enum(['lean_six_sigma', 'automacao_ia', 'brand']).optional(),
  scenes: z.array(SceneSchema),
});

type AdVideoProps = z.infer<typeof AdVideoSchema>;
type Scene = z.infer<typeof SceneSchema>;

// ─── SmartOps IA Brand Tokens ─────────────────────────────────────────────────
// Source: smartops-ia.com.br CSS variables

const C = {
  // Backgrounds
  bg:   '#06060e',   // --bg  : primary background
  bg2:  '#0d0d1c',   // --bg2 : secondary background
  bg3:  '#13132a',   // --bg3 : tertiary background

  // Text
  fg:    '#e8e8f0',  // --fg    : primary text
  muted: '#8b8baa',  // --muted : secondary text

  // Lean Six Sigma — purple
  accent:       '#7c3aed',                      // --accent
  accentL:      '#a78bfa',                      // --accent-l
  accentC:      '#c4b5fd',                      // lighter purple
  accentBorder: 'rgba(167,139,250,0.18)',        // --accent-border
  accentGlow:   'rgba(124,58,237,0.18)',         // --accent-glow

  // Automação com IA — emerald
  green:  '#10b981',  // emerald primary
  greenL: '#6ee7b7',  // emerald light

  // UI
  whatsapp: '#25d366',                    // --green : WhatsApp CTA
  star:     '#fbbf24',                    // stars and highlights
  error:    '#f87171',                    // problem markers
  border:   'rgba(255,255,255,0.07)',     // --border

  // Typography
  font: SYSTEM_FONT,
};

// ─── Root Composition ─────────────────────────────────────────────────────────

// Derive active accent based on service
function getAccent(service?: string) {
  if (service === 'automacao_ia') return { accent: C.green, accentL: C.greenL, label: 'Automação com IA' };
  return { accent: C.accent, accentL: C.accentL, label: 'Lean Six Sigma' };
}

export const AdVideo: React.FC<AdVideoProps> = ({ scenes, platform, service }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  const { accent, accentL, label } = getAccent(service);

  // Calculate per-scene frame ranges
  const sceneFrameRanges = scenes.reduce<{ start: number; end: number; scene: Scene }[]>((acc, scene) => {
    const start = acc.length > 0 ? acc[acc.length - 1].end : 0;
    const end = start + scene.duration * fps;
    return [...acc, { start, end, scene }];
  }, []);

  const current = sceneFrameRanges.find(r => frame >= r.start && frame < r.end) || sceneFrameRanges[sceneFrameRanges.length - 1];
  const sceneFrame = frame - current.start;
  const sceneFrames = current.scene.duration * fps;

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden' }}>
      <GrainOverlay />
      <SceneRenderer scene={current.scene} frame={sceneFrame} totalFrames={sceneFrames} fps={fps} />
    </AbsoluteFill>
  );
};

// ─── Grain Overlay ────────────────────────────────────────────────────────────

const GrainOverlay: React.FC = () => (
  <AbsoluteFill style={{ opacity: 0.06, pointerEvents: 'none' }}>
    <svg width="100%" height="100%" style={{ position: 'absolute' }}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  </AbsoluteFill>
);

// ─── Scene Router ─────────────────────────────────────────────────────────────

const SceneRenderer: React.FC<{ scene: Scene; frame: number; totalFrames: number; fps: number }> = (props) => {
  switch (props.scene.type) {
    case 'hook': return <HookScene {...props} />;
    case 'problem': return <ProblemScene {...props} />;
    case 'product': return <ProductScene {...props} />;
    case 'benefit': return <BenefitScene {...props} />;
    case 'testimonial': return <TestimonialScene {...props} />;
    case 'offer': return <OfferScene {...props} />;
    case 'cta': return <CTAScene {...props} />;
    default: return <HookScene {...props} />;
  }
};

// ─── Shared Utilities ─────────────────────────────────────────────────────────

function fadeIn(frame: number, startFrame = 0, endFrame = 20): number {
  return interpolate(frame, [startFrame, endFrame], [0, 1], { extrapolateRight: 'clamp' });
}

function slideUp(frame: number, startFrame = 0, endFrame = 20, distance = 40): number {
  return interpolate(frame, [startFrame, endFrame], [distance, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
}

function scaleIn(frame: number, startFrame = 0, endFrame = 25): number {
  return interpolate(frame, [startFrame, endFrame], [0.7, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.2)),
  });
}

// ─── Scene 1: Hook ────────────────────────────────────────────────────────────

const HookScene: React.FC<{ scene: Scene; frame: number; totalFrames: number; fps: number }> = ({ scene, frame, fps }) => {
  const iconRotation = interpolate(frame, [0, fps * scene.duration], [0, 360]);
  const iconScale = scaleIn(frame, 0, 30);
  const textOpacity = fadeIn(frame, 20, 45);
  const textY = slideUp(frame, 20, 45);

  return (
    <AbsoluteFill style={{ background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
      {/* Terminal Icon SVG */}
      <svg
        viewBox="0 0 120 120"
        width={160}
        height={160}
        style={{
          transform: `rotate(${iconRotation}deg) scale(${iconScale})`,
          marginBottom: 48,
          opacity: scaleIn(frame, 0, 20),
        }}
      >
        <rect x="10" y="10" width="100" height="100" rx="16" fill={C.bg2} stroke={C.accentL} strokeWidth="2" />
        <text x="28" y="72" fontFamily="monospace" fontSize="36" fontWeight="bold" fill={C.fg}>&gt;_</text>
        <circle cx="90" cy="30" r="4" fill={C.whatsapp} />
        <circle cx="78" cy="30" r="4" fill={C.accentL} />
        <circle cx="66" cy="30" r="4" fill={C.muted} />
      </svg>

      {/* Headline */}
      <div style={{
        fontFamily: C.font,
        fontSize: 64,
        fontWeight: 700,
        color: C.fg,
        textAlign: 'center',
        lineHeight: 1.1,
        opacity: textOpacity,
        transform: `translateY(${textY}px)`,
        maxWidth: 900,
      }}>
        {scene.text}
      </div>

      {/* Accent line */}
      <div style={{
        width: interpolate(frame, [40, 70], [0, 120], { extrapolateRight: 'clamp' }),
        height: 3,
        background: C.whatsapp,
        marginTop: 32,
        borderRadius: 2,
      }} />
    </AbsoluteFill>
  );
};

// ─── Scene 2: Problem ─────────────────────────────────────────────────────────

const ProblemScene: React.FC<{ scene: Scene; frame: number; totalFrames: number; fps: number }> = ({ scene, frame, fps }) => {
  const clockRotation = interpolate(frame, [0, fps * 3], [0, 720]);
  const arrowY = interpolate(frame, [0, fps * 2], [0, 30]);
  const textOpacity = fadeIn(frame, 15, 40);
  const textY = slideUp(frame, 15, 40, 50);

  return (
    <AbsoluteFill style={{ background: C.bg2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
      {/* Clock + Arrow SVGs */}
      <div style={{ display: 'flex', gap: 48, marginBottom: 64, opacity: fadeIn(frame, 0, 20) }}>
        {/* Clock */}
        <svg viewBox="0 0 100 100" width={120} height={120}>
          <circle cx="50" cy="50" r="44" stroke={C.accentL} strokeWidth="4" fill="none" />
          <circle cx="50" cy="50" r="4" fill={C.accentC} />
          <line
            x1="50" y1="50" x2="50" y2="18"
            stroke={C.fg} strokeWidth="3" strokeLinecap="round"
            style={{ transformOrigin: '50px 50px', transform: `rotate(${clockRotation}deg)` }}
          />
          <line
            x1="50" y1="50" x2="72" y2="50"
            stroke={C.muted} strokeWidth="2" strokeLinecap="round"
            style={{ transformOrigin: '50px 50px', transform: `rotate(${clockRotation * 0.083}deg)` }}
          />
        </svg>

        {/* Descending Arrow */}
        <svg viewBox="0 0 60 120" width={60} height={120}
          style={{ transform: `translateY(${arrowY}px)` }}>
          <line x1="30" y1="10" x2="30" y2="90" stroke={C.accentL} strokeWidth="4" strokeLinecap="round" />
          <polygon points="15,70 30,100 45,70" fill={C.accentL} />
        </svg>
      </div>

      {/* Text */}
      <div style={{
        fontFamily: C.font,
        fontSize: 56,
        fontWeight: 700,
        color: C.fg,
        textAlign: 'center',
        lineHeight: 1.2,
        opacity: textOpacity,
        transform: `translateY(${textY}px)`,
        maxWidth: 860,
      }}>
        {scene.text}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3: Product ─────────────────────────────────────────────────────────

const ProductScene: React.FC<{ scene: Scene; frame: number; totalFrames: number; fps: number }> = ({ scene, frame, fps }) => {
  const dashboardScale = scaleIn(frame, 0, 35);
  const pulseOpacity = interpolate(
    frame % (fps * 0.8),
    [0, fps * 0.4, fps * 0.8],
    [0.3, 0.7, 0.3],
    { extrapolateRight: 'clamp' }
  );
  const textOpacity = fadeIn(frame, 30, 55);
  const textY = slideUp(frame, 30, 55, 40);

  return (
    <AbsoluteFill style={{ background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
      {/* Energy lines */}
      <svg style={{ position: 'absolute', width: '100%', height: '100%', opacity: pulseOpacity }}>
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
          <line
            key={i}
            x1="540" y1="960"
            x2={540 + Math.cos(angle * Math.PI / 180) * 500}
            y2={960 + Math.sin(angle * Math.PI / 180) * 500}
            stroke={C.whatsapp}
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* Dashboard SVG */}
      <svg
        viewBox="0 0 400 280"
        width={420}
        height={294}
        style={{ transform: `scale(${dashboardScale})`, marginBottom: 48 }}
      >
        <rect width="400" height="280" rx="16" fill={C.bg2} />
        <rect x="20" y="20" width="360" height="32" rx="6" fill={C.bg3} />
        <circle cx="42" cy="36" r="6" fill={C.whatsapp} />
        <circle cx="62" cy="36" r="6" fill={C.accentL} />
        <circle cx="82" cy="36" r="6" fill={C.muted} />
        {[0, 1, 2, 3].map(i => (
          <React.Fragment key={i}>
            <rect x={20 + i * 94} y="72" width="84" height="54" rx="8" fill={C.bg3} />
            <rect x={24 + i * 94} y="82" width="52" height="8" rx="3" fill={C.accentC} opacity="0.7" />
            <rect x={24 + i * 94} y="96" width="36" height="8" rx="3" fill={C.muted} opacity="0.5" />
          </React.Fragment>
        ))}
        {[0, 1, 2].map(i => (
          <rect key={i} x="20" y={148 + i * 38} width="360" height="24" rx="6" fill={C.bg3} opacity={1 - i * 0.2} />
        ))}
        <text x="200" y="250" textAnchor="middle" fill={C.accentC} fontFamily="monospace" fontSize="14" fontWeight="bold">88 TEMPLATES · DEPLOY CLUB</text>
      </svg>

      {/* Text */}
      <div style={{
        fontFamily: C.font,
        fontSize: 52,
        fontWeight: 700,
        color: C.fg,
        textAlign: 'center',
        lineHeight: 1.15,
        opacity: textOpacity,
        transform: `translateY(${textY}px)`,
        maxWidth: 900,
      }}>
        {scene.text}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 4: Benefit (Bullets with Checkmarks) ───────────────────────────────

const BenefitScene: React.FC<{ scene: Scene; frame: number; totalFrames: number; fps: number }> = ({ scene, frame, fps }) => {
  const bullets = scene.text.split('\n').filter(Boolean);

  return (
    <AbsoluteFill style={{ background: C.bg3, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 64px' }}>
      {bullets.map((bullet: string, index: number) => {
        const startFrame = index * 10 + 5;
        const itemOpacity = fadeIn(frame, startFrame, startFrame + 12);
        const itemX = interpolate(frame, [startFrame, startFrame + 15], [-40, 0], {
          extrapolateRight: 'clamp',
          easing: Easing.out(Easing.quad),
        });

        return (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            marginBottom: 40,
            opacity: itemOpacity,
            transform: `translateX(${itemX}px)`,
          }}>
            <svg viewBox="0 0 44 44" width={44} height={44} style={{ flexShrink: 0 }}>
              <circle cx="22" cy="22" r="20" fill={C.bg} stroke={C.whatsapp} strokeWidth="2" />
              <polyline
                points="12,22 19,30 33,14"
                stroke={C.whatsapp}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span style={{
              fontFamily: C.font,
              fontSize: 44,
              fontWeight: 500,
              color: C.fg,
              lineHeight: 1.2,
            }}>
              {bullet}
            </span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ─── Scene 5: Testimonial ─────────────────────────────────────────────────────

const TestimonialScene: React.FC<{ scene: Scene; frame: number; totalFrames: number; fps: number }> = ({ scene, frame, fps }) => {
  const quoteOpacity = fadeIn(frame, 0, 25);
  const quoteY = slideUp(frame, 0, 25, 50);
  const attributionOpacity = fadeIn(frame, 25, 45);
  const lineWidth = interpolate(frame, [10, 50], [0, 180], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: C.bg3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 64px' }}>
      {/* Opening quote mark */}
      <div style={{
        fontFamily: C.font,
        fontSize: 120,
        color: C.accentC,
        lineHeight: 0.8,
        alignSelf: 'flex-start',
        opacity: fadeIn(frame, 0, 15),
      }}>
        "
      </div>

      {/* Quote text */}
      <div style={{
        fontFamily: C.font,
        fontSize: 52,
        fontWeight: 700,
        fontStyle: 'italic',
        color: C.fg,
        textAlign: 'center',
        lineHeight: 1.25,
        opacity: quoteOpacity,
        transform: `translateY(${quoteY}px)`,
        maxWidth: 900,
        marginTop: -20,
      }}>
        {scene.text}
      </div>

      {/* Accent line */}
      <div style={{
        width: lineWidth,
        height: 2,
        background: C.whatsapp,
        margin: '36px auto 28px',
      }} />

      {/* Attribution */}
      {scene.quote && (
        <div style={{
          fontFamily: C.font,
          fontSize: 18,
          letterSpacing: 2,
          color: C.muted,
          textAlign: 'center',
          opacity: attributionOpacity,
        }}>
          {scene.quote}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─── Scene 6: Offer ───────────────────────────────────────────────────────────

const OfferScene: React.FC<{ scene: Scene; frame: number; totalFrames: number; fps: number }> = ({ scene, frame, fps }) => {
  const priceScale = spring({ frame: frame - 15, fps, config: { damping: 10, stiffness: 100 } });
  const badgeOpacity = fadeIn(frame, 0, 20);
  const textOpacity = fadeIn(frame, 20, 40);

  return (
    <AbsoluteFill style={{ background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px' }}>
      {/* Scarcity label */}
      <div style={{
        fontFamily: C.font,
        fontSize: 12,
        letterSpacing: 4,
        color: C.accentL,
        textTransform: 'uppercase',
        marginBottom: 32,
        opacity: badgeOpacity,
      }}>
        Oferta Especial
      </div>

      {/* Main offer text */}
      <div style={{
        fontFamily: C.font,
        fontSize: 56,
        fontWeight: 700,
        color: C.fg,
        textAlign: 'center',
        lineHeight: 1.15,
        opacity: textOpacity,
        maxWidth: 860,
        marginBottom: 48,
      }}>
        {scene.text}
      </div>

      {/* Price badge */}
      {scene.price && (
        <div style={{
          background: C.whatsapp,
          color: C.bg,
          fontFamily: C.font,
          fontSize: 72,
          fontWeight: 700,
          padding: '20px 56px',
          borderRadius: 12,
          transform: `scale(${Math.max(0, priceScale)})`,
          display: 'inline-block',
        }}>
          {scene.price}
        </div>
      )}

      {/* Subtext */}
      {scene.subtext && (
        <div style={{
          fontFamily: C.font,
          fontSize: 20,
          color: C.muted,
          marginTop: 28,
          textAlign: 'center',
          opacity: fadeIn(frame, 35, 55),
        }}>
          {scene.subtext}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─── Scene 7: CTA ─────────────────────────────────────────────────────────────

const CTAScene: React.FC<{ scene: Scene; frame: number; totalFrames: number; fps: number }> = ({ scene, frame, fps }) => {
  const arrowY = interpolate(frame, [0, fps * scene.duration], [200, -100]);
  const textScale = spring({ frame, fps, config: { damping: 12, stiffness: 80 } });
  const subtextOpacity = fadeIn(frame, 20, 40);

  return (
    <AbsoluteFill style={{ background: C.bg2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', overflow: 'hidden' }}>
      {/* Rising Deploy Arrow (background) */}
      <svg
        viewBox="0 0 100 200"
        width={100}
        height={200}
        style={{
          position: 'absolute',
          transform: `translateY(${arrowY}px)`,
          opacity: 0.2,
        }}
      >
        <line x1="50" y1="200" x2="50" y2="50" stroke={C.whatsapp} strokeWidth="8" strokeLinecap="round" />
        <polygon points="20,80 50,20 80,80" fill={C.whatsapp} />
      </svg>

      {/* Main CTA text */}
      <div style={{
        fontFamily: C.font,
        fontSize: 88,
        fontWeight: 700,
        fontStyle: 'italic',
        color: C.fg,
        textAlign: 'center',
        lineHeight: 1.0,
        transform: `scale(${textScale})`,
        marginBottom: 32,
      }}>
        {scene.text}
      </div>

      {/* Accent rule */}
      <div style={{
        width: 100,
        height: 3,
        background: C.whatsapp,
        marginBottom: 32,
        opacity: subtextOpacity,
      }} />

      {/* Subtext price */}
      {scene.subtext && (
        <div style={{
          fontFamily: C.font,
          fontSize: 28,
          fontWeight: 500,
          color: C.accentC,
          textAlign: 'center',
          letterSpacing: 2,
          textTransform: 'uppercase',
          opacity: subtextOpacity,
        }}>
          {scene.subtext}
        </div>
      )}

      {/* Logo monogram */}
      <div style={{
        position: 'absolute',
        bottom: 64,
        fontFamily: C.font,
        fontSize: 18,
        color: C.muted,
        letterSpacing: 4,
        textTransform: 'uppercase',
        opacity: fadeIn(frame, 30, 50),
      }}>
        Deploy Club
      </div>
    </AbsoluteFill>
  );
};
