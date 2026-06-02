// build_story_html.js — SmartOps IA | Story 1080×1920 (9:16)
// Safe zones: top 150px (status bar + profile) + bottom 150px (text input area)
require('dotenv').config();
const fs   = require('fs');
const path = require('path');

const args     = process.argv.slice(2);
const taskName = args[args.indexOf('--task') + 1] || 'smartops_demo';
const taskDate = args[args.indexOf('--date') + 1] || new Date().toISOString().split('T')[0];
const adsDir   = path.join('outputs', `${taskName}_${taskDate}`, 'ads');
const layoutPath = path.join(adsDir, 'layout.json');

if (!fs.existsSync(layoutPath)) { console.error('layout.json not found:', layoutPath); process.exit(1); }
const layout = JSON.parse(fs.readFileSync(layoutPath, 'utf8'));

const W = 1080, H = 1920;
const SAFE_TOP = 160, SAFE_BOT = 180; // Instagram UI overlay safe zones

const PALETTES = {
  '#7C3AED': { dark: '#4C1D95', rgb: '124,58,237' },
  '#10B981': { dark: '#064E3B', rgb: '16,185,129' },
  '#0EA5E9': { dark: '#0369A1', rgb: '14,165,233' },
  '#F59E0B': { dark: '#B45309', rgb: '245,158,11' },
};
const ACCENT = layout.accentColor || '#7C3AED';
const pal    = PALETTES[ACCENT] || PALETTES['#7C3AED'];
const C = {
  BG: '#0A0A0F', CARD: '#0B0F17', BORDER: '#1F2937',
  TEXT: '#FFFFFF', TEXT2: '#A1A1AA', MUTED: '#6B7280', DEEP: '#374151',
  ACCENT, DARK: pal.dark,
  GLOW: `rgba(${pal.rgb},0.45)`, SOFT: `rgba(${pal.rgb},0.07)`,
  BOR:  `rgba(${pal.rgb},0.22)`, RGB:  pal.rgb,
};

function icon(name, color, size = 28) {
  color = color || C.ACCENT;
  const d = {
    check:    `<circle cx="12" cy="12" r="9" stroke="${color}" stroke-width="1.8"/><path d="M8 12.5l3 3 5-5" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
    flow:     `<rect x="1" y="9" width="6" height="6" rx="1" stroke="${color}" stroke-width="1.8"/><rect x="17" y="9" width="6" height="6" rx="1" stroke="${color}" stroke-width="1.8"/><path d="M7 12h10" stroke="${color}" stroke-width="1.8"/><path d="M14 9.5l2.5 2.5L14 14.5" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
    search:   `<circle cx="10.5" cy="10.5" r="6.5" stroke="${color}" stroke-width="1.8"/><path d="M16 16L20 20" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>`,
    lightning:`<path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
    trending: `<polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><polyline points="16 7 22 7 22 13" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
    gear:     `<circle cx="12" cy="12" r="3" stroke="${color}" stroke-width="1.8"/><circle cx="12" cy="12" r="9" stroke="${color}" stroke-width="1.8" stroke-dasharray="3 2"/>`,
  }[name] || `<circle cx="12" cy="12" r="9" stroke="${color}" stroke-width="1.8"/>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">${d}</svg>`;
}

function labelToIcon(label) {
  const l = (label||'').toLowerCase();
  if (/diagnós|pesquis|análise/.test(l)) return 'search';
  if (/mapea|processo|fluxo/.test(l))   return 'flow';
  if (/autom|ia\b|tecnol/.test(l))      return 'lightning';
  if (/roi|financ|receita/.test(l))     return 'trending';
  if (/lean|desperd/.test(l))           return 'gear';
  return 'check';
}

function logoSVG(size = 36) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 30 30" fill="none">
    <path d="M15 2L27 8.5V21.5L15 28L3 21.5V8.5L15 2Z" fill="rgba(${C.RGB},0.12)" stroke="${C.ACCENT}" stroke-width="1.3"/>
    <path d="M18.5 12C18.5 12 16.5 10.5 14 11.5C11.5 12.5 11.5 14 13.5 15L16 16C18 17 18.2 18.5 16.5 19.5C14.8 20.5 12 19.5 12 19.5" stroke="${C.ACCENT}" stroke-width="1.9" stroke-linecap="round"/>
  </svg>`;
}

function hlKw(t) { return (t||'').replace(/(Lean Six Sigma|automação com IA|Lean \+ automação|automação|IA)/gi,'<strong>$&</strong>'); }

// Smart split for story — prefers shorter lines for vertical reading
function smartSplit(text) {
  const clean = (text||'').replace(/\.$/, '');
  const words = clean.split(' ');
  const n = words.length;
  if (n <= 2) return [clean, ''];
  const at = Math.max(2, Math.round(n * 0.42));
  return [words.slice(0, at).join(' '), words.slice(at).join(' ')];
}

function adaptiveSize(text) {
  const w = (text||'').split(' ').length;
  if (w <= 3) return 168; if (w <= 5) return 148;
  if (w <= 7) return 124; return 104;
}

const pillars = layout.pillars || [
  { num: '01', label: 'Diagnóstico', sub: 'Mapeamos o processo real da operação' },
  { num: '02', label: 'Análise',     sub: 'Identificamos gargalos e desperdícios' },
  { num: '03', label: 'Solução',     sub: 'Lean + IA eliminam o desperdício' },
];

const [hl1, hl2] = smartSplit(layout.headline);
const hlFontSize = adaptiveSize(layout.headline);
const badge = layout.badge || 'LEAN SIX SIGMA';

// Content zones (safe area: SAFE_TOP to H-SAFE_BOT = 160 to 1740)
// Brand zone:  160–280
// Headline:    300–700 (400px, generous for big text)
// Subtext:     720–860
// Divider:     880
// Steps:       900–1500 (3 stacked cards × 190px)
// CTA zone:    1560–1740

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: ${C.BG}; }
.ad { position: relative; width: ${W}px; height: ${H}px; background: ${C.BG}; font-family: 'Inter', sans-serif; overflow: hidden; }

/* Background elements */
.grid { position: absolute; inset: 0; background-image: linear-gradient(${C.SOFT} 1px, transparent 1px), linear-gradient(90deg, ${C.SOFT} 1px, transparent 1px); background-size: 60px 60px; }
.glow-t { position: absolute; top: -300px; left: 50%; transform: translateX(-50%); width: 1400px; height: 900px; background: radial-gradient(ellipse, rgba(${C.RGB},0.09) 0%, transparent 58%); }
.glow-m { position: absolute; top: 700px; right: -200px; width: 800px; height: 800px; background: radial-gradient(ellipse, rgba(${C.RGB},0.05) 0%, transparent 58%); }
.glow-b { position: absolute; bottom: -200px; left: 50%; transform: translateX(-50%); width: 1200px; height: 700px; background: radial-gradient(ellipse, rgba(${C.RGB},0.07) 0%, transparent 58%); }
.stripe { position: absolute; left: 0; top: 0; width: 6px; height: 100%; background: linear-gradient(180deg, ${C.ACCENT} 0%, ${C.DARK} 60%, rgba(${C.RGB},0.1) 100%); z-index: 10; }

/* Safe zone indicators (visual only, no content here) */
.safe-top { position: absolute; top: 0; left: 0; right: 0; height: ${SAFE_TOP}px; }
.safe-bot { position: absolute; bottom: 0; left: 0; right: 0; height: ${SAFE_BOT}px; }

/* Brand zone — inside safe area */
.brand-zone { position: absolute; left: 60px; right: 60px; top: ${SAFE_TOP + 20}px; display: flex; align-items: center; justify-content: space-between; }
.brand-left { display: flex; align-items: center; gap: 12px; }
.brand-name { font-size: 18px; font-weight: 700; color: ${C.TEXT}; letter-spacing: 0.5px; }
.brand-tag { font-size: 13px; color: ${C.MUTED}; }
.badge { display: inline-flex; align-items: center; gap: 7px; background: ${C.SOFT}; border: 1px solid ${C.BOR}; border-radius: 100px; padding: 8px 18px; }
.bdot { width: 5px; height: 5px; border-radius: 50%; background: ${C.ACCENT}; }
.btxt { font-size: 12px; font-weight: 700; color: ${C.ACCENT}; letter-spacing: 2px; text-transform: uppercase; }

/* Headline */
.headline { position: absolute; left: 60px; right: 60px; top: 316px; font-family: 'Bebas Neue', sans-serif; font-size: ${hlFontSize}px; color: ${C.TEXT}; line-height: 0.88; letter-spacing: 2px; }
.hla { color: ${C.ACCENT}; }

/* Subtext */
.subtext { position: absolute; left: 60px; right: 60px; top: 716px; font-size: 24px; color: ${C.TEXT2}; line-height: 1.6; }
.subtext strong { color: #E5E7EB; font-weight: 700; }

/* Divider */
.divider { position: absolute; left: 60px; right: 60px; top: 880px; height: 1px; background: linear-gradient(90deg, rgba(${C.RGB},0.5), ${C.BORDER} 40%, transparent); }

/* Steps (stacked vertically) */
.steps { position: absolute; left: 60px; right: 60px; top: 912px; display: flex; flex-direction: column; gap: 16px; }
.step { display: flex; align-items: center; gap: 24px; background: ${C.CARD}; border: 1px solid ${C.BORDER}; border-left: 4px solid ${C.BORDER}; border-radius: 18px; padding: 28px 28px; }
.step:first-child { border-left-color: ${C.ACCENT}; background: ${C.SOFT}; }
.s-num { font-family: 'Bebas Neue', sans-serif; font-size: 48px; color: ${C.DEEP}; line-height: 1; min-width: 56px; }
.step:first-child .s-num { color: ${C.ACCENT}; }
.s-content { flex: 1; }
.s-lbl { font-size: 20px; font-weight: 800; color: ${C.TEXT}; margin-bottom: 6px; }
.s-sub { font-size: 15px; color: ${C.MUTED}; line-height: 1.5; }
.s-ico { opacity: 0.4; }
.step:first-child .s-ico { opacity: 1; }

/* CTA zone — inside safe area */
.cta-zone { position: absolute; left: 60px; right: 60px; bottom: ${SAFE_BOT + 30}px; text-align: center; }
.cta-pre { font-size: 13px; font-weight: 600; color: ${C.MUTED}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; }
.cta-btn { display: inline-block; background: ${C.ACCENT}; color: #FFF; font-family: 'Inter', sans-serif; font-size: 20px; font-weight: 700; padding: 24px 60px; border-radius: 18px; box-shadow: 0 0 70px ${C.GLOW}; letter-spacing: 0.3px; }
.swipe { font-size: 13px; color: ${C.DEEP}; margin-top: 20px; letter-spacing: 1px; text-transform: uppercase; }

/* Domain */
.domain { position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); font-size: 11px; color: ${C.DEEP}; letter-spacing: 2.5px; text-transform: uppercase; }
</style>
</head>
<body>
<div class="ad">
  <div class="grid"></div>
  <div class="glow-t"></div>
  <div class="glow-m"></div>
  <div class="glow-b"></div>
  <div class="stripe"></div>

  <div class="brand-zone">
    <div class="brand-left">
      ${logoSVG(38)}
      <div>
        <div class="brand-name">SmartOps IA</div>
        <div class="brand-tag">Consultoria Lean + IA</div>
      </div>
    </div>
    <div class="badge"><div class="bdot"></div><span class="btxt">${badge}</span></div>
  </div>

  <div class="headline">
    ${hl1}${hl2 ? `<br><span class="hla">${hl2}</span>` : ''}
  </div>

  <div class="subtext">${hlKw(layout.subtext)}</div>

  <div class="divider"></div>

  <div class="steps">
    ${pillars.map((p,i) => `
    <div class="step">
      <div class="s-num">${p.num}</div>
      <div class="s-content">
        <div class="s-lbl">${p.label}</div>
        <div class="s-sub">${p.sub}</div>
      </div>
      <div class="s-ico">${icon(p.icon || labelToIcon(p.label), i===0?C.ACCENT:C.MUTED, 28)}</div>
    </div>`).join('')}
  </div>

  <div class="cta-zone">
    <div class="cta-pre">Primeira etapa sem compromisso</div>
    <div class="cta-btn">Diagnóstico gratuito — 30 min →</div>
    <div class="swipe">↑ Responda para agendar</div>
  </div>

  <div class="domain">${layout.domain || 'smartops-ia.com.br'}</div>
</div>
</body>
</html>`;

fs.writeFileSync(path.join(adsDir, 'story.html'), html);
console.log(`✓ story.html — ${W}×${H} | safe zones: top ${SAFE_TOP}px bot ${SAFE_BOT}px`);
