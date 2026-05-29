# Motion Tokens — Deploy Club DLS

Referência completa de tokens de motion para produção de vídeo via Remotion.
Derivados de `brand knowledge/DEPLOY CLUB DLS.md` — seção "Primitivos de Motion / Vídeo".

---

## Frame Rate

| Token | Valor | Uso |
|-------|-------|-----|
| `motionFpsStandard` | 30fps | Reels, Stories, Carrosséis animados |
| `motionFpsCinematic` | 24fps | YouTube intros, conteúdo editorial premium |

---

## Durações de Transição

Todos os valores em frames (@30fps). Para 24fps, multiplique por 0.8.

| Token | Frames | Segundos | Uso |
|-------|--------|----------|-----|
| `motionDurationFade` | 20 | 0.67s | Fade in/out padrão entre elementos |
| `motionDurationSlide` | 15 | 0.50s | Entrada de elementos por deslize |
| `motionDurationHold` | 90 | 3.0s | Permanência mínima de texto (legibilidade) |
| `motionDurationScene` | 150 | 5.0s | Duração padrão de uma cena individual |

---

## Easing Curves

| Token | Valor | Uso |
|-------|-------|-----|
| `motionEasingEnter` | `cubic-bezier(0.25, 0.1, 0.25, 1.0)` | Entrada suave, editorial |
| `motionEasingExit` | `cubic-bezier(0.55, 0.0, 1.0, 0.45)` | Saída de elementos |
| `motionEasingEmphasis` | `cubic-bezier(0.0, 0.0, 0.2, 1.0)` | Momentos de destaque, CTA |

---

## Safe Zones

| Token | Valor | Uso |
|-------|-------|-----|
| `motionSafeZone` | 48px | Margem interna segura — todos os formatos |
| `motionSafeZoneBottom` | 120px | Zona inferior ampliada — UI de plataforma cobre reels |

---

## Regras de Motion (Invioláveis)

1. **Transições editoriais, nunca bouncy** — zero spring, elastic ou efeitos animados
2. **Grain overlay obrigatório** — 5–8% opacidade em todos os backgrounds sólidos; seed varia por frame para animação sutil
3. **Texto mínimo on-screen** — `motionDurationHold` (90 frames) para legibilidade
4. **Claude Orange** — fade in com `motionDurationFade`, nunca flash, no máximo 1x por composição
5. **Sem glow, blur animado ou partículas** — a tipografia é o protagonista
6. **Background escuro** — sempre `color-espresso (#2C1810)`, nunca preto puro `#000000`
7. **Background claro** — sempre `color-studio-white (#FAF8F4)` ou `color-cream (#F5F0E8)`, nunca `#FFFFFF`
8. **Radial gradient terroso sutil** — permitido em backgrounds escuros para profundidade

---

## dls.ts Completo (src/tokens/dls.ts)

```typescript
// Deploy Club Design Language System — Motion + Color + Typography Tokens
// Gerado de DEPLOY CLUB DLS.md v1.0

// === MOTION ===
export const motionFpsStandard = 30;
export const motionFpsCinematic = 24;

export const motionDurationFade = 20;
export const motionDurationSlide = 15;
export const motionDurationHold = 90;
export const motionDurationScene = 150;

export const motionEasingEnter = 'cubic-bezier(0.25, 0.1, 0.25, 1.0)';
export const motionEasingExit = 'cubic-bezier(0.55, 0.0, 1.0, 0.45)';
export const motionEasingEmphasis = 'cubic-bezier(0.0, 0.0, 0.2, 1.0)';

export const motionSafeZone = 48;
export const motionSafeZoneBottom = 120;

// === COLORS ===
export const colors = {
  // Neutrals
  studioWhite: '#FAF8F4',
  cream: '#F5F0E8',
  parchment: '#E8DFD3',
  warmSand: '#C4B5A3',
  stoneTaupe: '#8D7B68',
  coffee: '#5C3D2E',
  coffeeDark: '#3D2B1F',
  espresso: '#2C1810',
  // Accent — Terracotta
  terracottaDeep: '#8B3A2F',
  terracotta: '#AC5B30',
  terracottaClay: '#C47A52',
  blush: '#D4A589',
  // Accent — Claude Brand
  claudeOrange: '#DA7756',
  claudeWarm: '#E8956E',
  // UI States
  success: '#4A6741',
  warning: '#B8860B',
  error: '#8B3A2F',
} as const;

// === TYPOGRAPHY ===
export const fonts = {
  display: "'Playfair Display', serif",
  body: "'DM Sans', sans-serif",
  ui: "'JetBrains Mono', monospace",
} as const;

// === SPACING (base-8 grid) ===
export const space = {
  none: 0,
  micro: 4,
  xs: 8,
  sm: 16,
  md: 24,
  std: 32,
  lg: 48,
  xl: 64,
  '2xl': 96,
} as const;

// === SOCIAL DIMENSIONS ===
export const socialDimensions = {
  feed: { width: 1080, height: 1350 },     // 4:5
  story: { width: 1080, height: 1920 },    // 9:16
  thumb: { width: 1280, height: 720 },     // 16:9
} as const;
```
