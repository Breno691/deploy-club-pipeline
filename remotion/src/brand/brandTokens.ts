// SmartOps IA — Brand Tokens (source of truth for all video components)

export const colors = {
  background:     '#0A0A0F',
  surface:        '#0B0F17',
  surfaceAlt:     '#13132a',

  text:           '#FFFFFF',
  textMuted:      '#A1A1AA',

  // Lean Six Sigma — roxo
  primary:        '#7C3AED',
  primaryLight:   '#a78bfa',
  primaryLighter: '#c4b5fd',
  primaryGlow:    'rgba(124,58,237,0.18)',
  primaryBorder:  'rgba(167,139,250,0.18)',

  // Automação IA — verde
  accent:         '#10B981',
  accentLight:    '#6ee7b7',

  warning:        '#F59E0B',
  danger:         '#EF4444',

  border:         'rgba(255,255,255,0.07)',
  overlay:        'rgba(0,0,0,0.6)',
} as const;

export const typography = {
  headline:       '"Bebas Neue", Impact, sans-serif',
  body:           '"Inter", "Segoe UI", system-ui, sans-serif',
  mono:           '"JetBrains Mono", "Fira Code", monospace',

  sizeHook:       96,
  sizeHeadline:   72,
  sizeSub:        52,
  sizeBody:       40,
  sizeCaption:    28,
  sizeSmall:      20,
} as const;

export const spacing = {
  xs:  8,
  sm:  16,
  md:  24,
  lg:  48,
  xl:  64,
  xxl: 96,
} as const;

export const layout = {
  paddingX: 64,
  paddingY: 96,
  maxWidth: 920,
} as const;

export const brand = {
  name:      'SmartOps IA',
  tagline:   'Lean Six Sigma + IA para PMEs',
  location:  'BH/MG',
  instagram: '@smartops.ia',
  website:   'smartops-ia.com.br',
  ctaText:   'Diagnóstico Gratuito',
} as const;
