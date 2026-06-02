// SmartOps IA — Design Brand Tokens (Node.js / CommonJS)

const COLORS = {
  // Backgrounds
  background:     '#0A0A0F',
  surface:        '#0B0F17',
  surfaceAlt:     '#111827',
  elevated:       '#13132a',

  // Text
  text:           '#FFFFFF',
  textSecondary:  '#A1A1AA',
  textMuted:      '#6B7280',

  // Primary — Lean Six Sigma
  primary:        '#7C3AED',
  primaryLight:   '#a78bfa',
  primaryLighter: '#c4b5fd',
  primaryGlow:    'rgba(124,58,237,0.35)',
  primarySoft:    'rgba(124,58,237,0.06)',
  primaryBorder:  'rgba(124,58,237,0.20)',

  // Accent — Automação IA
  accent:         '#10B981',
  accentGlow:     'rgba(16,185,129,0.35)',
  accentSoft:     'rgba(16,185,129,0.06)',
  accentBorder:   'rgba(16,185,129,0.20)',

  // Semantic
  warning:        '#F59E0B',
  danger:         '#EF4444',
  success:        '#10B981',
  highlight:      '#FACC15',

  // UI
  border:         '#1F2937',
  borderLight:    '#27272A',
  overlay:        'rgba(0,0,0,0.6)',
};

const TYPOGRAPHY = {
  headline:   "'Bebas Neue', Impact, sans-serif",
  body:       "'Inter', 'Segoe UI', system-ui, sans-serif",
  mono:       "'JetBrains Mono', 'Fira Code', monospace",

  // Sizes (px)
  sizeDisplay: 128,
  sizeHero:    96,
  sizeH1:      72,
  sizeH2:      52,
  sizeH3:      40,
  sizeBody:    20,
  sizeSmall:   14,
  sizeLabel:   12,
};

const SPACING = {
  xs:   8,
  sm:  16,
  md:  24,
  lg:  40,
  xl:  60,
  xxl: 80,
};

const EFFECTS = {
  // Glow shadows
  primaryGlowShadow:  '0 0 40px rgba(124,58,237,0.35)',
  accentGlowShadow:   '0 0 40px rgba(16,185,129,0.35)',

  // Border radius
  radiusSm:   8,
  radiusMd:  14,
  radiusLg:  24,
  radiusXl:  40,
  radiusFull: 999,

  // Card styles
  cardBg:         '#0F1319',
  cardBorder:     '1px solid #1F2937',
  cardRadius:     '14px',
  cardPadding:    '22px',
};

const BRAND = {
  name:      'SmartOps IA',
  tagline:   'Lean Six Sigma + IA para PMEs',
  location:  'BH/MG',
  website:   'smartops-ia.com.br',
  instagram: '@smartops.ia',
  ctaMain:   'Diagnóstico Gratuito — 30 min',
  specialist: 'Breno Luiz · Black Belt Lean Six Sigma',
};

const GRADIENTS = {
  bgPrimary:  `linear-gradient(160deg, #0A0A0F 0%, #111827 60%, #1E1B4B 100%)`,
  purple:     `linear-gradient(135deg, #7C3AED, #9333EA)`,
  green:      `linear-gradient(135deg, #10B981, #059669)`,
  warning:    `linear-gradient(135deg, #F59E0B, #D97706)`,
  dark:       `linear-gradient(160deg, #0B0F17 0%, #0A0A0F 100%)`,
};

// Resolve accent tokens by service/mode
function getAccent(mode = 'lean') {
  if (mode === 'automation' || mode === 'ia') {
    return {
      color:   COLORS.accent,
      glow:    COLORS.accentGlow,
      soft:    COLORS.accentSoft,
      border:  COLORS.accentBorder,
      label:   'Automação com IA',
    };
  }
  return {
    color:   COLORS.primary,
    glow:    COLORS.primaryGlow,
    soft:    COLORS.primarySoft,
    border:  COLORS.primaryBorder,
    label:   'Lean Six Sigma',
  };
}

module.exports = { COLORS, TYPOGRAPHY, SPACING, EFFECTS, BRAND, GRADIENTS, getAccent };
