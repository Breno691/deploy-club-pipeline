// build_ad_html.js — SmartOps IA | Square 1080×1080 | 5 templates
// Research-based: adaptive font, smart split, professional hierarchy
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

// ─── Color palettes ───────────────────────────────────────────────────────────
const PALETTES = {
  '#7C3AED': { dark: '#4C1D95', rgb: '124,58,237' },
  '#10B981': { dark: '#064E3B', rgb: '16,185,129' },
  '#0EA5E9': { dark: '#0369A1', rgb: '14,165,233' },
  '#F59E0B': { dark: '#B45309', rgb: '245,158,11'  },
};
const ACCENT  = layout.accentColor || '#7C3AED';
const pal     = PALETTES[ACCENT] || PALETTES['#7C3AED'];
const C = {
  BG: '#0A0A0F', CARD: '#0B0F17', BORDER: '#1F2937',
  TEXT: '#FFFFFF', TEXT2: '#A1A1AA', MUTED: '#6B7280', DEEP: '#374151',
  ACCENT, DARK: pal.dark,
  GLOW: `rgba(${pal.rgb},0.45)`,
  SOFT: `rgba(${pal.rgb},0.07)`,
  BOR:  `rgba(${pal.rgb},0.22)`,
  RGB:  pal.rgb,
};

// ─── Typography: adaptive headline size ──────────────────────────────────────
// Bebas Neue is condensed — avg char width ~0.52× font-size
// At 1080px canvas, left 60 right 60 → 960px usable
// Safe: keep each line under ~14 chars at 128px, or ~18 chars at 100px
function adaptiveSize(text) {
  const words = (text || '').split(' ').length;
  if (words <= 3) return 152;
  if (words <= 5) return 132;
  if (words <= 7) return 112;
  return 94;
}

// Smart split: prefer breaking after position ~40% of words
// Avoids orphan last words and balances line visual weight
function smartSplit(text) {
  const clean = (text || '').replace(/\.$/, '');
  const words = clean.split(' ');
  const n = words.length;
  if (n <= 2) return [clean, ''];
  // Find break: prefer after preposition/connector
  const connectors = new Set(['está', 'é', 'são', 'não', 'e', 'ou', 'com', 'de', 'da', 'do', 'no', 'na', 'por', 'para', 'que', 'seu', 'sua', 'os', 'as']);
  const ideal = Math.max(2, Math.round(n * 0.45));
  let at = ideal;
  // Scan near ideal for a connector to break after
  for (let d = 0; d <= 2; d++) {
    if (ideal + d < n && connectors.has(words[ideal + d - 1]?.toLowerCase())) { at = ideal + d; break; }
    if (ideal - d > 0 && connectors.has(words[ideal - d - 1]?.toLowerCase())) { at = ideal - d; break; }
  }
  return [words.slice(0, at).join(' '), words.slice(at).join(' ')];
}

// ─── SVG icon library ─────────────────────────────────────────────────────────
function icon(name, color, size = 24) {
  color = color || C.ACCENT;
  const d = {
    search:    `<circle cx="10.5" cy="10.5" r="6.5" stroke="${color}" stroke-width="1.8"/><path d="M16 16L20 20" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>`,
    flow:      `<rect x="1" y="9" width="6" height="6" rx="1" stroke="${color}" stroke-width="1.8"/><rect x="17" y="9" width="6" height="6" rx="1" stroke="${color}" stroke-width="1.8"/><path d="M7 12h10" stroke="${color}" stroke-width="1.8"/><path d="M14 9.5l2.5 2.5L14 14.5" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
    check:     `<circle cx="12" cy="12" r="9" stroke="${color}" stroke-width="1.8"/><path d="M8 12.5l3 3 5-5" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
    chart:     `<path d="M4 20V14M9 20V10M14 20V6M19 20V2" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>`,
    gear:      `<circle cx="12" cy="12" r="3" stroke="${color}" stroke-width="1.8"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="${color}" stroke-width="1.8"/>`,
    lightning: `<path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
    trending:  `<polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><polyline points="16 7 22 7 22 13" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
    target:    `<circle cx="12" cy="12" r="10" stroke="${color}" stroke-width="1.8"/><circle cx="12" cy="12" r="6" stroke="${color}" stroke-width="1.8"/><circle cx="12" cy="12" r="2" fill="${color}"/>`,
    shield:    `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
    clock:     `<circle cx="12" cy="12" r="10" stroke="${color}" stroke-width="1.8"/><polyline points="12 6 12 12 16 14" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
    dollar:    `<line x1="12" y1="1" x2="12" y2="23" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>`,
    users:     `<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/><circle cx="9" cy="7" r="4" stroke="${color}" stroke-width="1.8"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>`,
    star:      `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
  }[name] || `<circle cx="12" cy="12" r="9" stroke="${color}" stroke-width="1.8"/>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">${d}</svg>`;
}

function labelToIcon(label) {
  const l = (label || '').toLowerCase();
  if (/diagnós|pesquis|análise|auditoria/.test(l)) return 'search';
  if (/mapea|processo|fluxo|vsm/.test(l))          return 'flow';
  if (/soluç|result|entrega|implementa/.test(l))   return 'check';
  if (/dado|métric|relat|kpi/.test(l))             return 'chart';
  if (/autom|robot|ia\b|tecnol|digital/.test(l))   return 'lightning';
  if (/roi|financ|receita|lucro/.test(l))          return 'trending';
  if (/lean|desperd|eliminaç|redução/.test(l))     return 'gear';
  if (/client|equip|time/.test(l))                 return 'users';
  if (/prazo|tempo|lead time/.test(l))             return 'clock';
  if (/custo|econ|poupar/.test(l))                 return 'dollar';
  if (/qualid|padroniz|defeito/.test(l))           return 'shield';
  return 'check';
}

function logoSVG() {
  return `<svg width="30" height="30" viewBox="0 0 30 30" fill="none">
    <path d="M15 2L27 8.5V21.5L15 28L3 21.5V8.5L15 2Z" fill="rgba(${C.RGB},0.12)" stroke="${C.ACCENT}" stroke-width="1.3"/>
    <path d="M18.5 12C18.5 12 16.5 10.5 14 11.5C11.5 12.5 11.5 14 13.5 15L16 16C18 17 18.2 18.5 16.5 19.5C14.8 20.5 12 19.5 12 19.5" stroke="${C.ACCENT}" stroke-width="1.9" stroke-linecap="round"/>
  </svg>`;
}

// ─── Shared text helpers ──────────────────────────────────────────────────────
function hlKw(t) { return (t||'').replace(/(Lean Six Sigma|automação com IA|Lean \+ automação|automação|IA)/gi,'<strong>$&</strong>'); }
function hlFree(t) { return (t||'').replace(/(gratu[íi]to|gratis|gratuita)/i,`<span class="hl">$&</span>`); }

const GF = `<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">`;

const BASE = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 1080px; height: 1080px; overflow: hidden; background: ${C.BG}; }
.ad { position: relative; width: 1080px; height: 1080px; background: ${C.BG}; font-family: 'Inter', sans-serif; overflow: hidden; }
.stripe { position: absolute; left: 0; top: 0; width: 6px; height: 100%; background: linear-gradient(180deg, ${C.ACCENT} 0%, ${C.DARK} 100%); z-index: 10; }
.grid { position: absolute; inset: 0; background-image: linear-gradient(${C.SOFT} 1px, transparent 1px), linear-gradient(90deg, ${C.SOFT} 1px, transparent 1px); background-size: 60px 60px; }
.brand-row { position: absolute; left: 60px; top: 50px; display: flex; align-items: center; gap: 10px; }
.brand-name { font-size: 15px; font-weight: 700; color: ${C.TEXT}; letter-spacing: 0.5px; margin-left: 8px; }
.brand-tag { font-size: 12px; color: ${C.MUTED}; }
.badge { display: inline-flex; align-items: center; gap: 7px; background: ${C.SOFT}; border: 1px solid ${C.BOR}; border-radius: 100px; padding: 6px 16px; }
.bdot { width: 5px; height: 5px; border-radius: 50%; background: ${C.ACCENT}; }
.btxt { font-size: 11px; font-weight: 700; color: ${C.ACCENT}; letter-spacing: 2px; text-transform: uppercase; }
.domain { position: absolute; bottom: 18px; left: 50%; transform: translateX(-50%); font-size: 11px; font-weight: 500; color: ${C.DEEP}; letter-spacing: 2.5px; text-transform: uppercase; }
.hl { color: ${C.ACCENT}; }
.cta-btn { background: ${C.ACCENT}; color: #FFF; font-family: 'Inter', sans-serif; font-size: 17px; font-weight: 700; padding: 20px 44px; border-radius: 14px; box-shadow: 0 0 50px ${C.GLOW}; letter-spacing: 0.3px; white-space: nowrap; }
`;

function wrap(inner) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8">${GF}
<style>${BASE}${inner.css}</style>
</head>
<body><div class="ad">
  <div class="grid"></div>
  ${inner.glows || ''}
  <div class="stripe"></div>
  <div class="brand-row">
    ${logoSVG()}
    <span class="brand-name">SmartOps IA</span>
    <span class="brand-tag">/ Consultoria</span>
  </div>
  ${inner.body}
  <div class="domain">${layout.domain || 'smartops-ia.com.br'}</div>
</div></body></html>`;
}

// ─── Template 1: pain_hook ────────────────────────────────────────────────────
function tPainHook() {
  const [hl1, hl2] = smartSplit(layout.headline);
  const fs   = adaptiveSize(layout.headline);
  const hlTop = 130 + (132 - fs) * 0.5; // push down slightly for smaller fonts
  const badge = layout.badge || 'LEAN SIX SIGMA';
  const dividerTop = hlTop + fs * 0.90 * 2 + 30;
  const subtextTop = dividerTop + 22;
  const pillarsTop = subtextTop + 80;

  const pillars = layout.pillars || [
    { num: '01', label: 'Diagnóstico', sub: 'Entendemos o problema real da operação' },
    { num: '02', label: 'Mapeamento',  sub: 'Identificamos gargalos e desperdícios' },
    { num: '03', label: 'Solução',     sub: 'Lean + IA aplicados no processo' },
  ];

  const css = `
.glow-tl { position: absolute; top: -220px; left: -120px; width: 880px; height: 720px; background: radial-gradient(ellipse, ${C.SOFT} 0%, transparent 60%); }
.glow-br { position: absolute; bottom: -180px; right: -80px; width: 560px; height: 460px; background: radial-gradient(ellipse, rgba(${C.RGB},0.04) 0%, transparent 60%); }
.bwrap { position: absolute; left: 60px; top: 94px; }
.headline { position: absolute; left: 60px; top: ${hlTop}px; font-family: 'Bebas Neue', sans-serif; font-size: ${fs}px; color: ${C.TEXT}; line-height: 0.90; letter-spacing: 2px; max-width: 960px; }
.hla { color: ${C.ACCENT}; }
.divider { position: absolute; left: 60px; right: 60px; top: ${dividerTop}px; height: 1px; background: linear-gradient(90deg, rgba(${C.RGB},0.5), ${C.BORDER} 40%, transparent); }
.subtext { position: absolute; left: 60px; top: ${subtextTop}px; font-size: 20px; color: ${C.TEXT2}; line-height: 1.6; max-width: 740px; }
.subtext strong { color: #E5E7EB; font-weight: 700; }
.pillars { position: absolute; left: 60px; right: 60px; top: ${pillarsTop}px; display: flex; gap: 16px; }
.pillar { flex: 1; position: relative; background: ${C.CARD}; border: 1px solid ${C.BORDER}; border-top: 3px solid ${C.BORDER}; border-radius: 16px; padding: 22px 18px 20px; }
.pillar.act { border-top-color: ${C.ACCENT}; background: ${C.SOFT}; }
.p-ico { position: absolute; top: 18px; right: 16px; opacity: 0.35; }
.pillar.act .p-ico { opacity: 1; }
.p-num { font-family: 'Bebas Neue', sans-serif; font-size: 34px; color: ${C.DEEP}; line-height: 1; margin-bottom: 8px; }
.pillar.act .p-num { color: ${C.ACCENT}; }
.p-lbl { font-size: 14px; font-weight: 700; color: #D1D5DB; margin-bottom: 5px; }
.p-sub { font-size: 12px; color: ${C.MUTED}; line-height: 1.45; }
.footer { position: absolute; left: 60px; right: 60px; bottom: 50px; display: flex; align-items: center; justify-content: space-between; }
.flbl { font-size: 11px; font-weight: 600; color: ${C.MUTED}; text-transform: uppercase; letter-spacing: 1.8px; margin-bottom: 6px; }
.ftxt { font-size: 21px; font-weight: 800; color: ${C.TEXT}; }
`;

  return wrap({
    css,
    glows: `<div class="glow-tl"></div><div class="glow-br"></div>`,
    body: `
  <div class="bwrap"><div class="badge"><div class="bdot"></div><span class="btxt">${badge}</span></div></div>
  <div class="headline">${hl1}${hl2 ? `<br><span class="hla">${hl2}</span>` : ''}</div>
  <div class="divider"></div>
  <div class="subtext">${hlKw(layout.subtext)}</div>
  <div class="pillars">
    ${pillars.map((p,i)=>`
    <div class="pillar${i===0?' act':''}">
      <div class="p-ico">${icon(p.icon||labelToIcon(p.label), i===0?C.ACCENT:C.MUTED, 22)}</div>
      <div class="p-num">${p.num}</div>
      <div class="p-lbl">${p.label}</div>
      <div class="p-sub">${p.sub}</div>
    </div>`).join('')}
  </div>
  <div class="footer">
    <div><div class="flbl">Primeira etapa</div><div class="ftxt">${hlFree(layout.ctaText)}</div></div>
    <div class="cta-btn">Quero meu diagnóstico →</div>
  </div>`,
  });
}

// ─── Template 2: proof_method ─────────────────────────────────────────────────
function tProofMethod() {
  const [hl1, hl2] = smartSplit(layout.headline);
  const fs = Math.min(adaptiveSize(layout.headline), 108);
  const pillars = layout.pillars || [
    { num: '01', label: 'Diagnóstico', sub: 'Mapeamos o processo real' },
    { num: '02', label: 'Análise',     sub: 'Identificamos perdas ocultas' },
    { num: '03', label: 'Solução',     sub: 'Lean + IA eliminam desperdício' },
  ];

  const css = `
.glow-t { position: absolute; top: -200px; left: 50%; transform: translateX(-50%); width: 1100px; height: 640px; background: radial-gradient(ellipse, rgba(${C.RGB},0.07) 0%, transparent 58%); }
.glow-b { position: absolute; bottom: -160px; left: 50%; transform: translateX(-50%); width: 900px; height: 500px; background: radial-gradient(ellipse, rgba(${C.RGB},0.04) 0%, transparent 60%); }
.headline { position: absolute; left: 60px; top: 112px; font-family: 'Bebas Neue', sans-serif; font-size: ${fs}px; color: ${C.TEXT}; line-height: 0.90; letter-spacing: 2px; max-width: 960px; }
.hla { color: ${C.ACCENT}; }
.how-lbl { position: absolute; left: 60px; top: 416px; font-size: 11px; font-weight: 700; color: ${C.MUTED}; letter-spacing: 2.5px; text-transform: uppercase; }
.steps { position: absolute; left: 60px; right: 60px; top: 444px; display: flex; align-items: stretch; }
.step { flex: 1; position: relative; background: ${C.CARD}; border: 1px solid ${C.BORDER}; padding: 26px 22px 24px; }
.step:first-child { border-radius: 16px 0 0 16px; border-right: none; border-top: 3px solid ${C.ACCENT}; background: ${C.SOFT}; }
.step:nth-child(2) { border-left: none; border-right: none; border-top: 3px solid ${C.BORDER}; }
.step:last-child  { border-radius: 0 16px 16px 0; border-left: none; border-top: 3px solid ${C.BORDER}; }
.arr { position: absolute; right: -19px; top: 50%; transform: translateY(-50%); z-index: 5; width: 38px; height: 38px; background: ${C.BG}; border: 1px solid ${C.BORDER}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; color: ${C.ACCENT}; font-weight: 700; }
.s-ico { margin-bottom: 10px; }
.step:not(:first-child) .s-ico { opacity: 0.35; }
.s-num { font-family: 'Bebas Neue', sans-serif; font-size: 38px; color: ${C.DEEP}; line-height: 1; margin-bottom: 8px; }
.step:first-child .s-num { color: ${C.ACCENT}; }
.s-lbl { font-size: 16px; font-weight: 800; color: ${C.TEXT}; margin-bottom: 7px; }
.s-sub { font-size: 13px; color: ${C.MUTED}; line-height: 1.5; }
.divider { position: absolute; left: 60px; right: 60px; top: 726px; height: 1px; background: linear-gradient(90deg, rgba(${C.RGB},0.4), ${C.BORDER} 40%, transparent); }
.subtext { position: absolute; left: 60px; top: 748px; font-size: 20px; color: ${C.TEXT2}; line-height: 1.6; max-width: 680px; }
.subtext strong { color: #E5E7EB; font-weight: 700; }
.footer { position: absolute; left: 60px; right: 60px; bottom: 50px; display: flex; align-items: center; justify-content: space-between; }
.flbl { font-size: 11px; font-weight: 600; color: ${C.MUTED}; text-transform: uppercase; letter-spacing: 1.8px; margin-bottom: 6px; }
.ftxt { font-size: 21px; font-weight: 800; color: ${C.TEXT}; }
`;

  return wrap({
    css,
    glows: `<div class="glow-t"></div><div class="glow-b"></div>`,
    body: `
  <div class="headline">${hl1}${hl2?`<br><span class="hla">${hl2}</span>`:''}</div>
  <div class="how-lbl">Como funciona</div>
  <div class="steps">
    ${pillars.map((p,i)=>`
    <div class="step">
      ${i<2?`<div class="arr">→</div>`:''}
      <div class="s-ico">${icon(p.icon||labelToIcon(p.label), i===0?C.ACCENT:C.MUTED, 26)}</div>
      <div class="s-num">${p.num}</div>
      <div class="s-lbl">${p.label}</div>
      <div class="s-sub">${p.sub}</div>
    </div>`).join('')}
  </div>
  <div class="divider"></div>
  <div class="subtext">${hlKw(layout.subtext)}</div>
  <div class="footer">
    <div><div class="flbl">Primeira etapa</div><div class="ftxt">${hlFree(layout.ctaText)}</div></div>
    <div class="cta-btn">Quero meu diagnóstico →</div>
  </div>`,
  });
}

// ─── Template 3: roi_focus ────────────────────────────────────────────────────
function tRoiFocus() {
  const [hl1, hl2] = smartSplit(layout.headline);
  const fs = Math.min(adaptiveSize(layout.headline), 110);
  const metric      = layout.metric || '40%';
  const metricLabel = layout.metricLabel || 'menos retrabalho em 30 dias';
  const bullets = layout.pillars || [
    { num: '01', label: 'Diagnóstico', sub: 'Mapeamos o processo real' },
    { num: '02', label: 'Eliminação',  sub: 'Removemos desperdícios ocultos' },
    { num: '03', label: 'Resultado',   sub: 'ROI mensurável em semanas' },
  ];

  // Scale metric font based on length
  const mfs = metric.length <= 3 ? 210 : metric.length <= 5 ? 170 : 140;

  const css = `
.vdiv { position: absolute; left: 556px; top: 80px; bottom: 80px; width: 1px; background: linear-gradient(180deg, transparent, ${C.BORDER} 20%, ${C.BORDER} 80%, transparent); }
.glow-r { position: absolute; top: -80px; right: -80px; width: 700px; height: 700px; background: radial-gradient(ellipse, rgba(${C.RGB},0.09) 0%, transparent 58%); }
.glow-l { position: absolute; bottom: -100px; left: -60px; width: 500px; height: 400px; background: radial-gradient(ellipse, rgba(${C.RGB},0.05) 0%, transparent 60%); }
.bwrap { position: absolute; left: 60px; top: 94px; }
.headline { position: absolute; left: 60px; top: 146px; width: 456px; font-family: 'Bebas Neue', sans-serif; font-size: ${fs}px; color: ${C.TEXT}; line-height: 0.88; letter-spacing: 2px; }
.hla { color: ${C.ACCENT}; }
.subtext { position: absolute; left: 60px; top: 560px; width: 456px; font-size: 20px; color: ${C.TEXT2}; line-height: 1.6; }
.subtext strong { color: #E5E7EB; font-weight: 700; }
.cta-area { position: absolute; left: 60px; bottom: 50px; }
.clbl { font-size: 11px; font-weight: 600; color: ${C.MUTED}; text-transform: uppercase; letter-spacing: 1.8px; margin-bottom: 12px; }
.metric-blk { position: absolute; left: 596px; top: 80px; width: 424px; text-align: center; }
.mnum { font-family: 'Bebas Neue', sans-serif; font-size: ${mfs}px; color: ${C.ACCENT}; line-height: 0.82; letter-spacing: -4px; filter: drop-shadow(0 0 60px ${C.GLOW}); }
.mlbl { font-size: 20px; font-weight: 700; color: ${C.TEXT}; margin-top: 16px; line-height: 1.3; padding: 0 8px; }
.msub { font-size: 13px; color: ${C.MUTED}; margin-top: 8px; }
.rcards { position: absolute; left: 596px; top: 598px; width: 424px; display: flex; flex-direction: column; gap: 13px; }
.rcard { display: flex; align-items: flex-start; gap: 12px; background: ${C.CARD}; border: 1px solid ${C.BORDER}; border-left: 3px solid ${C.BORDER}; border-radius: 12px; padding: 14px 16px; }
.rcard:first-child { border-left-color: ${C.ACCENT}; background: ${C.SOFT}; }
.rco { margin-top: 2px; opacity: 0.4; }
.rcard:first-child .rco { opacity: 1; }
.rnum { font-family: 'Bebas Neue', sans-serif; font-size: 26px; color: ${C.DEEP}; min-width: 30px; line-height: 1; }
.rcard:first-child .rnum { color: ${C.ACCENT}; }
.rlbl { font-size: 14px; font-weight: 700; color: ${C.TEXT}; margin-bottom: 2px; }
.rsub { font-size: 12px; color: ${C.MUTED}; line-height: 1.4; }
`;

  return wrap({
    css,
    glows: `<div class="glow-r"></div><div class="glow-l"></div>`,
    body: `
  <div class="vdiv"></div>
  <div class="bwrap"><div class="badge"><div class="bdot"></div><span class="btxt">${layout.badge||'RESULTADO REAL'}</span></div></div>
  <div class="headline">${hl1}${hl2?`<br><span class="hla">${hl2}</span>`:''}</div>
  <div class="subtext">${hlKw(layout.subtext)}</div>
  <div class="cta-area">
    <div class="clbl">Comece hoje</div>
    <div class="cta-btn">Diagnóstico gratuito →</div>
  </div>
  <div class="metric-blk">
    <div class="mnum">${metric}</div>
    <div class="mlbl">${metricLabel}</div>
    <div class="msub">resultado típico — clientes SmartOps IA</div>
  </div>
  <div class="rcards">
    ${bullets.map((b,i)=>`
    <div class="rcard">
      <div class="rco">${icon(b.icon||labelToIcon(b.label), i===0?C.ACCENT:C.MUTED, 20)}</div>
      <div class="rnum">${b.num}</div>
      <div><div class="rlbl">${b.label}</div><div class="rsub">${b.sub}</div></div>
    </div>`).join('')}
  </div>`,
  });
}

// ─── Template 4: testimonial ──────────────────────────────────────────────────
function tTestimonial() {
  const [hl1, hl2] = smartSplit(layout.headline || 'O que nossos clientes conquistaram.');
  const fs     = Math.min(adaptiveSize(layout.headline || 'O que nossos clientes conquistaram.'), 86);
  const quote  = layout.quote  || '"Em 3 semanas, eliminamos 40% do retrabalho na produção. A equipe ficou motivada e os custos caíram."';
  const client = layout.client || 'Ricardo M.';
  const company= layout.company|| 'Empresa Industrial — BH';
  const result = layout.result || '40% menos retrabalho · 21 dias';
  const stars  = layout.stars  || 5;
  const initials = client.split(' ').map(w=>w[0]||'').join('').slice(0,2).toUpperCase();
  const starRow = Array(5).fill(0).map((_,i)=>icon('star', i<stars?C.ACCENT:C.BORDER, 22)).join('');

  const css = `
.glow-c { position: absolute; top: -100px; left: 50%; transform: translateX(-50%); width: 1000px; height: 700px; background: radial-gradient(ellipse, rgba(${C.RGB},0.07) 0%, transparent 58%); }
.headline { position: absolute; left: 60px; top: 112px; font-family: 'Bebas Neue', sans-serif; font-size: ${fs}px; color: ${C.TEXT}; line-height: 0.90; letter-spacing: 2px; max-width: 960px; }
.hla { color: ${C.ACCENT}; }
.qmark { position: absolute; left: 52px; top: 318px; font-family: Georgia, serif; font-size: 150px; color: ${C.ACCENT}; line-height: 1; opacity: 0.15; }
.qbox { position: absolute; left: 60px; right: 60px; top: 362px; background: ${C.CARD}; border: 1px solid ${C.BORDER}; border-left: 4px solid ${C.ACCENT}; border-radius: 18px; padding: 34px 38px; }
.qtxt { font-size: 25px; font-weight: 400; color: ${C.TEXT}; line-height: 1.55; font-style: italic; }
.qtxt strong { font-weight: 700; color: ${C.ACCENT}; font-style: normal; }
.stars { display: flex; gap: 4px; margin-top: 26px; margin-bottom: 18px; }
.crow { display: flex; align-items: center; gap: 16px; }
.cavt { width: 52px; height: 52px; border-radius: 50%; background: ${C.SOFT}; border: 2px solid ${C.ACCENT}; display: flex; align-items: center; justify-content: center; font-family: 'Bebas Neue', sans-serif; font-size: 22px; color: ${C.ACCENT}; }
.cname { font-size: 16px; font-weight: 700; color: ${C.TEXT}; margin-bottom: 3px; }
.cco { font-size: 13px; color: ${C.MUTED}; }
.rbadge { position: absolute; left: 60px; right: 60px; bottom: 108px; display: flex; align-items: center; justify-content: space-between; background: ${C.SOFT}; border: 1px solid ${C.BOR}; border-radius: 12px; padding: 16px 24px; }
.rbl { display: flex; align-items: center; gap: 14px; }
.rbt { font-size: 15px; font-weight: 700; color: ${C.TEXT}; }
.rbs { font-size: 12px; color: ${C.MUTED}; margin-top: 2px; }
.footer { position: absolute; left: 60px; right: 60px; bottom: 50px; }
.fnote { font-size: 13px; color: ${C.MUTED}; }
`;

  return wrap({
    css,
    glows: `<div class="glow-c"></div>`,
    body: `
  <div class="headline">${hl1}${hl2?`<br><span class="hla">${hl2}</span>`:''}</div>
  <div class="qmark">"</div>
  <div class="qbox">
    <div class="qtxt">${quote.replace(/^[""]|[""]$/g,'').replace(/(\d+%|\d+ dias|\d+ semanas)/g,'<strong>$&</strong>')}</div>
    <div class="stars">${starRow}</div>
    <div class="crow">
      <div class="cavt">${initials}</div>
      <div><div class="cname">${client}</div><div class="cco">${company}</div></div>
    </div>
  </div>
  <div class="rbadge">
    <div class="rbl">
      ${icon('trending', C.ACCENT, 26)}
      <div><div class="rbt">Resultado comprovado</div><div class="rbs">${result}</div></div>
    </div>
    <div class="cta-btn" style="font-size:15px;padding:16px 30px;">Quero esse resultado →</div>
  </div>
  <div class="footer"><div class="fnote">Diagnóstico gratuito · 30 min · sem compromisso</div></div>`,
  });
}

// ─── Template 5: before_after ─────────────────────────────────────────────────
function tBeforeAfter() {
  const [hl1, hl2] = smartSplit(layout.headline || 'Antes e depois do Lean na operação.');
  const fs = Math.min(adaptiveSize(layout.headline || 'Antes e depois do Lean na operação.'), 94);
  const bi = layout.before?.items || [
    { label: 'Tempo no processo', value: '4h/dia'  },
    { label: 'Taxa de retrabalho', value: '35%'    },
    { label: 'Custo mensal',      value: 'R$12k'   },
  ];
  const ai = layout.after?.items || [
    { label: 'Tempo no processo', value: '55min'   },
    { label: 'Taxa de retrabalho', value: '5%'     },
    { label: 'Economia gerada',   value: 'R$9k/mês'},
  ];
  const bl = layout.before?.label || 'ANTES';
  const al = layout.after?.label  || 'DEPOIS';

  const css = `
.glow-c { position: absolute; top: -100px; left: 50%; transform: translateX(-50%); width: 1100px; height: 600px; background: radial-gradient(ellipse, rgba(${C.RGB},0.06) 0%, transparent 58%); }
.headline { position: absolute; left: 60px; top: 108px; font-family: 'Bebas Neue', sans-serif; font-size: ${fs}px; color: ${C.TEXT}; line-height: 0.90; letter-spacing: 2px; max-width: 960px; }
.hla { color: ${C.ACCENT}; }
.cols { position: absolute; left: 60px; right: 60px; top: 376px; display: flex; gap: 20px; height: 512px; }
.col { flex: 1; border-radius: 20px; padding: 28px 26px 24px; }
.cb { background: rgba(100,100,110,0.08); border: 1px solid #2D3748; }
.ca { background: ${C.SOFT}; border: 1px solid ${C.BOR}; }
.cbadge { display: inline-flex; align-items: center; gap: 8px; border-radius: 100px; padding: 5px 14px; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; width: fit-content; }
.cb .cbadge { background: rgba(100,100,110,0.2); border: 1px solid #4A5568; color: #9CA3AF; }
.ca .cbadge { background: ${C.SOFT}; border: 1px solid ${C.BOR}; color: ${C.ACCENT}; }
.cbdot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
.mrow { display: flex; align-items: center; justify-content: space-between; padding: 17px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
.mrow:last-child { border-bottom: none; }
.mlbl { font-size: 14px; color: ${C.MUTED}; }
.mval { font-family: 'Bebas Neue', sans-serif; font-size: 34px; line-height: 1; }
.cb .mval { color: #6B7280; }
.ca .mval { color: ${C.ACCENT}; }
.carrow { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: 5; width: 52px; height: 52px; background: ${C.BG}; border: 2px solid ${C.ACCENT}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; color: ${C.ACCENT}; box-shadow: 0 0 32px ${C.GLOW}; }
.footer { position: absolute; left: 60px; right: 60px; bottom: 50px; display: flex; align-items: center; justify-content: space-between; }
.fnote { font-size: 14px; color: ${C.MUTED}; }
`;

  return wrap({
    css,
    glows: `<div class="glow-c"></div>`,
    body: `
  <div class="headline">${hl1}${hl2?`<br><span class="hla">${hl2}</span>`:''}</div>
  <div class="cols">
    <div class="col cb">
      <div class="cbadge"><div class="cbdot"></div>${bl}</div>
      ${bi.map(r=>`<div class="mrow"><span class="mlbl">${r.label}</span><span class="mval">${r.value}</span></div>`).join('')}
    </div>
    <div class="carrow">→</div>
    <div class="col ca">
      <div class="cbadge"><div class="cbdot"></div>${al}</div>
      ${ai.map(r=>`<div class="mrow"><span class="mlbl">${r.label}</span><span class="mval">${r.value}</span></div>`).join('')}
    </div>
  </div>
  <div class="footer">
    <div class="fnote">Diagnóstico gratuito · 30 min · sem compromisso</div>
    <div class="cta-btn">Quero esse resultado →</div>
  </div>`,
  });
}

// ─── Dispatch ─────────────────────────────────────────────────────────────────
const T = { pain_hook: tPainHook, proof_method: tProofMethod, roi_focus: tRoiFocus, testimonial: tTestimonial, before_after: tBeforeAfter };
const html = (T[layout.template] || tPainHook)();
fs.writeFileSync(path.join(adsDir, 'ad.html'), html);
console.log(`✓ ad.html — template:${layout.template||'pain_hook'} font:${adaptiveSize(layout.headline)}px accent:${C.ACCENT}`);
