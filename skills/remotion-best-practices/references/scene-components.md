# Scene Components — Remotion

Código completo de cada tipo de cena. Importar `S` tokens de `../tokens/brand`.

## Animation Utilities

```tsx
import { useCurrentFrame, useVideoConfig, interpolate, Easing, spring } from 'remotion';

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

const fadeIn = (start = 0, end = 20) =>
  interpolate(frame, [start, end], [0, 1], { extrapolateRight: 'clamp' });

const slideUp = (start = 0, end = 20, dist = 40) =>
  interpolate(frame, [start, end], [dist, 0], {
    extrapolateRight: 'clamp', easing: Easing.out(Easing.quad),
  });

const springScale = (offset = 0, config = { damping: 12, stiffness: 80 }) =>
  spring({ frame: frame - offset, fps, config });

const lineGrow = (start = 20, end = 60, maxPct = 100) =>
  interpolate(frame, [start, end], [0, maxPct], { extrapolateRight: 'clamp' }) + '%';

const counter = (from: number, to: number, s: number, e: number) =>
  Math.floor(interpolate(frame, [s, e], [from, to], { extrapolateRight: 'clamp' }));

const charReveal = (text: string, startFrame = 0, speed = 3) =>
  text.slice(0, Math.floor(Math.max(0, frame - startFrame) * speed));
```

## Hook Scene

```tsx
<AbsoluteFill style={{ background: S.bg }}>
  <svg style={{ position: 'absolute', width: '100%', height: '100%' }}>
    <defs>
      <radialGradient id="glow" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stopColor={accent} stopOpacity="0.18"/>
        <stop offset="100%" stopColor={accent} stopOpacity="0"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#glow)" />
  </svg>
  <div style={{ opacity: fadeIn(0,15), fontSize:11, fontWeight:800,
    textTransform:'uppercase', letterSpacing:'0.14em', color:accentL,
    border:`1px solid ${S.accentBorder}`, background:`${accent}20`,
    padding:'5px 14px', borderRadius:9999 }}>
    {isLean ? 'Lean Six Sigma' : 'Automação com IA'}
  </div>
  <div style={{ opacity: fadeIn(10,35),
    transform:`translateY(${slideUp(10,35)}px)`,
    fontFamily:S.font, fontSize:72, fontWeight:800,
    letterSpacing:'-0.04em', color:S.fg, lineHeight:1.1 }}>
    {scene.text}
  </div>
  <div style={{ width:lineGrow(35,60), height:3, background:accentL, marginTop:24, borderRadius:2 }}/>
</AbsoluteFill>
```

## Problem Scene

```tsx
const clockRotation = interpolate(frame, [0, fps*3], [0, 720]);
const arrowY = interpolate(frame, [0, fps*2], [0, 40]);

<AbsoluteFill style={{ background:S.bg2 }}>
  <div style={{ color:S.error, fontWeight:800, fontSize:48 }}>✗</div>
  <svg viewBox="0 0 100 100" width={120} height={120}>
    <circle cx="50" cy="50" r="44" stroke={S.error} strokeWidth="3" fill="none"/>
    <line x1="50" y1="50" x2="50" y2="18" stroke={S.fg} strokeWidth="3"
      strokeLinecap="round"
      style={{ transformOrigin:'50px 50px', transform:`rotate(${clockRotation}deg)` }}/>
  </svg>
  <svg viewBox="0 0 50 100" width={50} height={100}
    style={{ transform:`translateY(${arrowY}px)` }}>
    <line x1="25" y1="10" x2="25" y2="80" stroke={S.error} strokeWidth="4" strokeLinecap="round"/>
    <polygon points="10,65 25,90 40,65" fill={S.error}/>
  </svg>
  <div style={{ opacity:fadeIn(8,30), transform:`translateY(${slideUp(8,30)}px)`,
    fontFamily:S.font, fontSize:52, fontWeight:700, color:S.fg }}>{scene.text}</div>
</AbsoluteFill>
```

## Product Scene

```tsx
const scale = springScale(5);
const energyOpacity = interpolate(frame % (fps*0.8), [0, fps*0.4, fps*0.8], [0.2, 0.6, 0.2]);

{isLean ? (
  <div style={{ display:'flex', gap:8, opacity:scale }}>
    {['D','M','A','I','C'].map((step, i) => (
      <div key={step} style={{
        opacity: interpolate(frame, [i*6, i*6+12], [0,1], { extrapolateRight:'clamp' }),
        background:S.bg3, border:`1px solid ${S.accentBorder}`,
        borderRadius:8, padding:'12px 16px', color:accentL, fontWeight:800, fontSize:18
      }}>{step}</div>
    ))}
  </div>
) : (
  <svg viewBox="0 0 120 120" width={160} height={160} style={{ transform:`scale(${scale})` }}>
    <rect x="10" y="10" width="100" height="100" rx="20" fill={S.bg2} stroke={S.green} strokeWidth="2"/>
    <circle cx="40" cy="50" r="10" fill={S.greenL} opacity={energyOpacity}/>
    <circle cx="60" cy="50" r="10" fill={S.greenL} opacity={energyOpacity*0.8}/>
    <circle cx="80" cy="50" r="10" fill={S.greenL} opacity={energyOpacity*0.6}/>
    <text x="60" y="85" textAnchor="middle" fill={S.muted} fontSize="12" fontFamily={S.font}>IA · 24h</text>
  </svg>
)}
```

## Benefit Scene

```tsx
{bullets.map((bullet, index) => {
  const startF = index * 12 + 5;
  return (
    <div key={index} style={{
      opacity: interpolate(frame, [startF, startF+10], [0,1], { extrapolateRight:'clamp' }),
      transform: `translateX(${interpolate(frame, [startF, startF+12], [-30,0], { extrapolateRight:'clamp' })}px)`,
      display:'flex', alignItems:'center', gap:16,
    }}>
      <svg viewBox="0 0 44 44" width={40} height={40}>
        <circle cx="22" cy="22" r="20" fill={S.bg2} stroke={accentL} strokeWidth="1.5"/>
        <polyline points="12,22 19,30 33,14" stroke={accentL} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span style={{ fontFamily:S.font, fontSize:36, color:S.fg }}>{bullet}</span>
    </div>
  );
})}
```

## Testimonial Scene

```tsx
<AbsoluteFill style={{ background:S.bg2, display:'flex', flexDirection:'column',
  alignItems:'center', justifyContent:'center', padding:'80px 64px' }}>
  <div style={{ fontSize:100, lineHeight:0.8, color:accentL, opacity:0.2,
    fontFamily:'Georgia, serif', alignSelf:'flex-start' }}>"</div>
  <div style={{ opacity:fadeIn(0,25), fontFamily:S.font, fontSize:44,
    fontStyle:'italic', color:S.fg, textAlign:'center', lineHeight:1.3, maxWidth:900 }}>
    {scene.text}
  </div>
  <div style={{ width:lineGrow(10,50), height:2, background:accentL, margin:'32px auto 24px' }}/>
  {scene.quote && (
    <div style={{ opacity:fadeIn(25,45), fontFamily:S.font, fontSize:16,
      color:S.muted, textAlign:'center', letterSpacing:1 }}>{scene.quote}</div>
  )}
</AbsoluteFill>
```

## Offer Scene

```tsx
const priceScale = springScale(15);
<div style={{ background:S.whatsapp, color:'#fff', fontFamily:S.font, fontSize:64,
  fontWeight:800, padding:'16px 48px', borderRadius:12,
  transform:`scale(${Math.max(0, priceScale)})`,
  boxShadow:`0 4px 24px ${S.whatsapp}40` }}>
  {scene.price}
</div>
```

## CTA Scene

```tsx
const arrowY = interpolate(frame, [0, fps*2], [200, -80]);
const textScale = springScale(0);

<svg viewBox="0 0 80 160" width={80} height={160}
  style={{ position:'absolute', transform:`translateY(${arrowY}px)`, opacity:0.15 }}>
  <line x1="40" y1="160" x2="40" y2="40" stroke={S.whatsapp} strokeWidth="8" strokeLinecap="round"/>
  <polygon points="20,70 40,20 60,70" fill={S.whatsapp}/>
</svg>
<div style={{ fontFamily:S.font, fontSize:80, fontWeight:800, color:S.fg,
  transform:`scale(${textScale})` }}>{scene.text}</div>
{scene.subtext && (
  <div style={{ opacity:fadeIn(20,40), fontFamily:S.font, fontSize:24,
    color:S.muted, textAlign:'center' }}>{scene.subtext}</div>
)}
<div style={{ position:'absolute', bottom:64, fontFamily:S.font, fontSize:16,
  color:S.muted, letterSpacing:3, textTransform:'uppercase', opacity:fadeIn(30,50) }}>
  SmartOps IA
</div>
```

## Comparison Scene

```tsx
const leftOpacity = fadeIn(0,20);
const rightOpacity = fadeIn(20,40);
const dividerWidth = interpolate(frame,[15,35],[0,4],{extrapolateRight:'clamp'});

<AbsoluteFill style={{ background:S.bg, display:'flex', flexDirection:'row' }}>
  <div style={{ flex:1, opacity:leftOpacity, padding:48, display:'flex',
    flexDirection:'column', justifyContent:'center', borderRight:`${dividerWidth}px solid ${S.border}` }}>
    <div style={{ color:S.error, fontSize:14, fontWeight:800, textTransform:'uppercase', letterSpacing:2, marginBottom:24 }}>SEM PROCESSO</div>
    <div style={{ fontFamily:S.font, fontSize:36, color:S.fg, lineHeight:1.4 }}>{scene.sideA}</div>
  </div>
  <div style={{ flex:1, opacity:rightOpacity, padding:48, display:'flex', flexDirection:'column', justifyContent:'center' }}>
    <div style={{ color:accentL, fontSize:14, fontWeight:800, textTransform:'uppercase', letterSpacing:2, marginBottom:24 }}>COM LEAN</div>
    <div style={{ fontFamily:S.font, fontSize:36, color:S.fg, lineHeight:1.4 }}>{scene.sideB}</div>
  </div>
</AbsoluteFill>
```

## Before/After Scene

```tsx
const revealProgress = interpolate(frame, [20,70], [0,100], { extrapolateRight:'clamp' });

<AbsoluteFill style={{ background:S.bg, overflow:'hidden' }}>
  <div style={{ position:'absolute', inset:0, opacity:0.4, display:'flex',
    alignItems:'center', justifyContent:'center', fontFamily:S.font, fontSize:48, color:S.error }}>
    {scene.before}
  </div>
  <div style={{ position:'absolute', inset:0, clipPath:`inset(0 ${100-revealProgress}% 0 0)`,
    background:S.bg2, display:'flex', alignItems:'center', justifyContent:'center', padding:64 }}>
    <div style={{ fontFamily:S.font, fontSize:52, fontWeight:700, color:accentL, textAlign:'center' }}>
      {scene.after}
    </div>
  </div>
  <div style={{ position:'absolute', top:0, bottom:0, left:`${revealProgress}%`,
    width:3, background:accentL, boxShadow:`0 0 20px ${accent}` }}/>
</AbsoluteFill>
```

## Overlays

```tsx
// Grain
export const GrainOverlay = ({ opacity = 0.04 }) => (
  <AbsoluteFill style={{ opacity, pointerEvents:'none' }}>
    <svg width="100%" height="100%">
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)"/>
    </svg>
  </AbsoluteFill>
);

// Vignette
export const VignetteOverlay = () => (
  <AbsoluteFill style={{ pointerEvents:'none' }}>
    <svg width="100%" height="100%">
      <defs>
        <radialGradient id="vig" cx="50%" cy="50%" r="70%">
          <stop offset="60%" stopColor="transparent"/>
          <stop offset="100%" stopColor="#000" stopOpacity="0.4"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#vig)"/>
    </svg>
  </AbsoluteFill>
);
```
