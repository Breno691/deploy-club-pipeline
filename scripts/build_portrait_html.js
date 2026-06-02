// build_portrait_html.js — SmartOps IA | Portrait 1080×1350 (4:5)
// Instagram's recommended format 2025 — 30% more engagement, 67% more screen space
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

const W = 1080, H = 1350;

// ─── Colors ───────────────────────────────────────────────────────────────────
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

// ─── Typography helpers ───────────────────────────────────────────────────────
function adaptiveSize(text) {
  const w = (text || '').split(' ').length;
  if (w <= 3) return 158; if (w <= 5) return 138;
  if (w <= 7) return 118; return 98;
}

function smartSplit(text) {
  const clean = (text || '').replace(/\.$/, '');
  const words = clean.split(' ');
  const n = words.length;
  if (n <= 2) return [clean, ''];
  const connectors = new Set(['está', 'é', 'são', 'não', 'e', 'ou', 'com', 'de', 'da', 'do', 'no', 'na', 'por', 'para', 'que', 'seu', 'sua', 'os', 'as']);
  const ideal = Math.max(2, Math.round(n * 0.45));
  let at = ideal;
  for (let d = 0; d <= 2; d++) {
    if (ideal + d < n && connectors.has(words[ideal + d - 1]?.toLowerCase())) { at = ideal + d; break; }
    if (ideal - d > 0 && connectors.has(words[ideal - d - 1]?.toLowerCase())) { at = ideal - d; break; }
  }
  return [words.slice(0, at).join(' '), words.slice(at).join(' ')];
}

// ─── SVG icons ────────────────────────────────────────────────────────────────
function icon(name, color, size = 24) {
  color = color || C.ACCENT;
  const d = {
    search:   `<circle cx="10.5" cy="10.5" r="6.5" stroke="${color}" stroke-width="1.8"/><path d="M16 16L20 20" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>`,
    flow:     `<rect x="1" y="9" width="6" height="6" rx="1" stroke="${color}" stroke-width="1.8"/><rect x="17" y="9" width="6" height="6" rx="1" stroke="${color}" stroke-width="1.8"/><path d="M7 12h10" stroke="${color}" stroke-width="1.8"/><path d="M14 9.5l2.5 2.5L14 14.5" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
    check:    `<circle cx="12" cy="12" r="9" stroke="${color}" stroke-width="1.8"/><path d="M8 12.5l3 3 5-5" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
    chart:    `<path d="M4 20V14M9 20V10M14 20V6M19 20V2" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>`,
    lightning:`<path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
    gear:     `<circle cx="12" cy="12" r="3" stroke="${color}" stroke-width="1.8"/><circle cx="12" cy="12" r="9" stroke="${color}" stroke-width="1.8" stroke-dasharray="3 2"/>`,
    trending: `<polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><polyline points="16 7 22 7 22 13" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
    dollar:   `<line x1="12" y1="1" x2="12" y2="23" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>`,
    clock:    `<circle cx="12" cy="12" r="10" stroke="${color}" stroke-width="1.8"/><polyline points="12 6 12 12 16 14" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
    users:    `<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/><circle cx="9" cy="7" r="4" stroke="${color}" stroke-width="1.8"/>`,
    shield:   `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
  }[name] || `<circle cx="12" cy="12" r="9" stroke="${color}" stroke-width="1.8"/>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">${d}</svg>`;
}

function labelToIcon(label) {
  const l = (label || '').toLowerCase();
  if (/diagnós|pesquis|análise/.test(l)) return 'search';
  if (/mapea|processo|fluxo/.test(l))   return 'flow';
  if (/soluç|result|entrega/.test(l))   return 'check';
  if (/dado|métric|relat/.test(l))      return 'chart';
  if (/autom|ia\b|tecnol/.test(l))      return 'lightning';
  if (/roi|financ|receita/.test(l))     return 'trending';
  if (/lean|desperd|eliminaç/.test(l))  return 'gear';
  if (/client|equip/.test(l))           return 'users';
  if (/prazo|tempo/.test(l))            return 'clock';
  if (/custo|econ/.test(l))             return 'dollar';
  return 'check';
}

function logoSVG() {
  return `<svg width="32" height="32" viewBox="0 0 30 30" fill="none">
    <path d="M15 2L27 8.5V21.5L15 28L3 21.5V8.5L15 2Z" fill="rgba(${C.RGB},0.12)" stroke="${C.ACCENT}" stroke-width="1.3"/>
    <path d="M18.5 12C18.5 12 16.5 10.5 14 11.5C11.5 12.5 11.5 14 13.5 15L16 16C18 17 18.2 18.5 16.5 19.5C14.8 20.5 12 19.5 12 19.5" stroke="${C.ACCENT}" stroke-width="1.9" stroke-linecap="round"/>
  </svg>`;
}

function hlKw(t) { return (t||'').replace(/(Lean Six Sigma|automação com IA|Lean \+ automação|automação|IA)/gi,'<strong>$&</strong>'); }
function hlFree(t) { return (t||'').replace(/(gratu[íi]to|gratis|gratuita)/i,`<span class="hl">$&</span>`); }

const GF = `<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">`;

const BASE = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: ${C.BG}; }
.ad { position: relative; width: ${W}px; height: ${H}px; background: ${C.BG}; font-family: 'Inter', sans-serif; overflow: hidden; }
.stripe { position: absolute; left: 0; top: 0; width: 6px; height: 100%; background: linear-gradient(180deg, ${C.ACCENT} 0%, ${C.DARK} 60%, ${C.BG} 100%); z-index: 10; }
.grid { position: absolute; inset: 0; background-image: linear-gradient(${C.SOFT} 1px, transparent 1px), linear-gradient(90deg, ${C.SOFT} 1px, transparent 1px); background-size: 60px 60px; }
.brand-row { position: absolute; left: 60px; top: 52px; display: flex; align-items: center; gap: 10px; }
.brand-name { font-size: 15px; font-weight: 700; color: ${C.TEXT}; letter-spacing: 0.5px; margin-left: 8px; }
.brand-tag { font-size: 12px; color: ${C.MUTED}; }
.badge { display: inline-flex; align-items: center; gap: 7px; background: ${C.SOFT}; border: 1px solid ${C.BOR}; border-radius: 100px; padding: 6px 16px; }
.bdot { width: 5px; height: 5px; border-radius: 50%; background: ${C.ACCENT}; }
.btxt { font-size: 11px; font-weight: 700; color: ${C.ACCENT}; letter-spacing: 2px; text-transform: uppercase; }
.domain { position: absolute; bottom: 22px; left: 50%; transform: translateX(-50%); font-size: 11px; font-weight: 500; color: ${C.DEEP}; letter-spacing: 2.5px; text-transform: uppercase; }
.hl { color: ${C.ACCENT}; }
.cta-btn { background: ${C.ACCENT}; color: #FFF; font-family: 'Inter', sans-serif; font-size: 18px; font-weight: 700; padding: 22px 50px; border-radius: 16px; box-shadow: 0 0 60px ${C.GLOW}; letter-spacing: 0.3px; white-space: nowrap; }
`;

// ─── Portrait template: pain_hook_portrait ────────────────────────────────────
// Extra 270px used for: bigger headline breathing + larger CTA zone at bottom
function tPainHookPortrait() {
  const [hl1, hl2] = smartSplit(layout.headline);
  const fs    = adaptiveSize(layout.headline);
  const badge = layout.badge || 'LEAN SIX SIGMA';
  const pillars = layout.pillars || [
    { num: '01', label: 'Diagnóstico', sub: 'Entendemos o problema real da operação' },
    { num: '02', label: 'Mapeamento',  sub: 'Identificamos gargalos e desperdícios' },
    { num: '03', label: 'Solução',     sub: 'Lean + IA aplicados no processo' },
  ];

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8">${GF}
<style>
${BASE}
.glow-tl { position: absolute; top: -250px; left: -120px; width: 920px; height: 800px; background: radial-gradient(ellipse, ${C.SOFT} 0%, transparent 60%); }
.glow-br { position: absolute; bottom: -200px; right: -80px; width: 600px; height: 500px; background: radial-gradient(ellipse, rgba(${C.RGB},0.04) 0%, transparent 60%); }
.bwrap { position: absolute; left: 60px; top: 96px; }
.headline { position: absolute; left: 60px; top: 148px; font-family: 'Bebas Neue', sans-serif; font-size: ${fs}px; color: ${C.TEXT}; line-height: 0.88; letter-spacing: 2px; max-width: 960px; }
.hla { color: ${C.ACCENT}; }
.divider { position: absolute; left: 60px; right: 60px; top: 500px; height: 1px; background: linear-gradient(90deg, rgba(${C.RGB},0.5), ${C.BORDER} 40%, transparent); }
.subtext { position: absolute; left: 60px; top: 524px; font-size: 22px; color: ${C.TEXT2}; line-height: 1.65; max-width: 820px; }
.subtext strong { color: #E5E7EB; font-weight: 700; }
.pillars { position: absolute; left: 60px; right: 60px; top: 690px; display: flex; gap: 16px; }
.pillar { flex: 1; position: relative; background: ${C.CARD}; border: 1px solid ${C.BORDER}; border-top: 3px solid ${C.BORDER}; border-radius: 18px; padding: 26px 20px 22px; }
.pillar.act { border-top-color: ${C.ACCENT}; background: ${C.SOFT}; }
.p-ico { position: absolute; top: 20px; right: 18px; opacity: 0.35; }
.pillar.act .p-ico { opacity: 1; }
.p-num { font-family: 'Bebas Neue', sans-serif; font-size: 38px; color: ${C.DEEP}; line-height: 1; margin-bottom: 10px; }
.pillar.act .p-num { color: ${C.ACCENT}; }
.p-lbl { font-size: 15px; font-weight: 700; color: #D1D5DB; margin-bottom: 6px; }
.p-sub { font-size: 13px; color: ${C.MUTED}; line-height: 1.5; }
/* Signature zone — extra 270px portrait has a dedicated CTA area */
.sig-zone { position: absolute; left: 60px; right: 60px; top: 1056px; }
.sig-divider { height: 1px; background: linear-gradient(90deg, rgba(${C.RGB},0.3), ${C.BORDER} 40%, transparent); margin-bottom: 36px; }
.sig-row { display: flex; align-items: center; justify-content: space-between; }
.sig-left { }
.sig-lbl { font-size: 11px; font-weight: 600; color: ${C.MUTED}; text-transform: uppercase; letter-spacing: 1.8px; margin-bottom: 8px; }
.sig-txt { font-size: 24px; font-weight: 800; color: ${C.TEXT}; }
</style>
</head>
<body>
<div class="ad">
  <div class="grid"></div>
  <div class="glow-tl"></div>
  <div class="glow-br"></div>
  <div class="stripe"></div>
  <div class="brand-row">
    ${logoSVG()}
    <span class="brand-name">SmartOps IA</span>
    <span class="brand-tag">/ Consultoria</span>
  </div>
  <div class="bwrap"><div class="badge"><div class="bdot"></div><span class="btxt">${badge}</span></div></div>
  <div class="headline">${hl1}${hl2?`<br><span class="hla">${hl2}</span>`:''}</div>
  <div class="divider"></div>
  <div class="subtext">${hlKw(layout.subtext)}</div>
  <div class="pillars">
    ${pillars.map((p,i)=>`
    <div class="pillar${i===0?' act':''}">
      <div class="p-ico">${icon(p.icon||labelToIcon(p.label), i===0?C.ACCENT:C.MUTED, 24)}</div>
      <div class="p-num">${p.num}</div>
      <div class="p-lbl">${p.label}</div>
      <div class="p-sub">${p.sub}</div>
    </div>`).join('')}
  </div>
  <div class="sig-zone">
    <div class="sig-divider"></div>
    <div class="sig-row">
      <div class="sig-left">
        <div class="sig-lbl">Primeira etapa gratuita</div>
        <div class="sig-txt">${hlFree(layout.ctaText)}</div>
      </div>
      <div class="cta-btn">Quero meu diagnóstico →</div>
    </div>
  </div>
  <div class="domain">${layout.domain || 'smartops-ia.com.br'}</div>
</div>
</body>
</html>`;
}

// ─── Portrait template: roi_focus_portrait ────────────────────────────────────
function tRoiFocusPortrait() {
  const [hl1, hl2] = smartSplit(layout.headline);
  const fs = adaptiveSize(layout.headline);
  const metric      = layout.metric || '40%';
  const metricLabel = layout.metricLabel || 'menos retrabalho em 30 dias';
  const mfs = metric.length <= 3 ? 240 : metric.length <= 5 ? 190 : 150;
  const pillars = layout.pillars || [
    { num: '01', label: 'Diagnóstico', sub: 'Mapeamos o processo real' },
    { num: '02', label: 'Eliminação',  sub: 'Removemos desperdícios' },
    { num: '03', label: 'Resultado',   sub: 'ROI mensurável em semanas' },
  ];

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8">${GF}
<style>
${BASE}
.glow-t { position: absolute; top: -200px; left: 50%; transform: translateX(-50%); width: 1100px; height: 700px; background: radial-gradient(ellipse, rgba(${C.RGB},0.08) 0%, transparent 58%); }
.glow-b { position: absolute; bottom: -200px; left: 50%; transform: translateX(-50%); width: 900px; height: 600px; background: radial-gradient(ellipse, rgba(${C.RGB},0.05) 0%, transparent 60%); }
.bwrap { position: absolute; left: 60px; top: 96px; }
.headline { position: absolute; left: 60px; top: 148px; font-family: 'Bebas Neue', sans-serif; font-size: ${fs}px; color: ${C.TEXT}; line-height: 0.88; letter-spacing: 2px; max-width: 960px; }
.hla { color: ${C.ACCENT}; }
.metric-blk { position: absolute; left: 50%; top: 440px; transform: translateX(-50%); text-align: center; width: 960px; }
.mnum { font-family: 'Bebas Neue', sans-serif; font-size: ${mfs}px; color: ${C.ACCENT}; line-height: 0.82; letter-spacing: -6px; filter: drop-shadow(0 0 80px ${C.GLOW}); }
.mlbl { font-size: 24px; font-weight: 700; color: ${C.TEXT}; margin-top: 16px; line-height: 1.3; }
.msub { font-size: 14px; color: ${C.MUTED}; margin-top: 10px; }
.hdivider { position: absolute; left: 60px; right: 60px; top: 780px; height: 1px; background: linear-gradient(90deg, rgba(${C.RGB},0.4), ${C.BORDER} 40%, transparent); }
.subtext { position: absolute; left: 60px; top: 804px; font-size: 21px; color: ${C.TEXT2}; line-height: 1.6; max-width: 820px; }
.subtext strong { color: #E5E7EB; font-weight: 700; }
.pillars { position: absolute; left: 60px; right: 60px; top: 944px; display: flex; gap: 16px; }
.pillar { flex: 1; position: relative; background: ${C.CARD}; border: 1px solid ${C.BORDER}; border-top: 3px solid ${C.BORDER}; border-radius: 16px; padding: 20px 18px; }
.pillar.act { border-top-color: ${C.ACCENT}; background: ${C.SOFT}; }
.p-num { font-family: 'Bebas Neue', sans-serif; font-size: 30px; color: ${C.DEEP}; line-height: 1; margin-bottom: 6px; }
.pillar.act .p-num { color: ${C.ACCENT}; }
.p-lbl { font-size: 13px; font-weight: 700; color: #D1D5DB; margin-bottom: 4px; }
.p-sub { font-size: 12px; color: ${C.MUTED}; line-height: 1.4; }
.sig-zone { position: absolute; left: 60px; right: 60px; bottom: 60px; display: flex; align-items: center; justify-content: center; }
</style>
</head>
<body>
<div class="ad">
  <div class="grid"></div>
  <div class="glow-t"></div>
  <div class="glow-b"></div>
  <div class="stripe"></div>
  <div class="brand-row">
    ${logoSVG()}
    <span class="brand-name">SmartOps IA</span>
    <span class="brand-tag">/ Consultoria</span>
  </div>
  <div class="bwrap"><div class="badge"><div class="bdot"></div><span class="btxt">${layout.badge||'RESULTADO REAL'}</span></div></div>
  <div class="headline">${hl1}${hl2?`<br><span class="hla">${hl2}</span>`:''}</div>
  <div class="metric-blk">
    <div class="mnum">${metric}</div>
    <div class="mlbl">${metricLabel}</div>
    <div class="msub">resultado típico nos clientes SmartOps IA</div>
  </div>
  <div class="hdivider"></div>
  <div class="subtext">${hlKw(layout.subtext)}</div>
  <div class="pillars">
    ${pillars.map((p,i)=>`
    <div class="pillar${i===0?' act':''}">
      <div class="p-num">${p.num}</div>
      <div class="p-lbl">${p.label}</div>
      <div class="p-sub">${p.sub}</div>
    </div>`).join('')}
  </div>
  <div class="sig-zone">
    <div class="cta-btn">Diagnóstico gratuito — 30 min →</div>
  </div>
  <div class="domain">${layout.domain || 'smartops-ia.com.br'}</div>
</div>
</body>
</html>`;
}

// ─── Dispatch ─────────────────────────────────────────────────────────────────
const tpl = layout.template || 'pain_hook';
const html = tpl === 'roi_focus' ? tRoiFocusPortrait() : tPainHookPortrait();

fs.writeFileSync(path.join(adsDir, 'portrait.html'), html);
console.log(`✓ portrait.html — ${W}×${H} template:${tpl} font:${adaptiveSize(layout.headline)}px`);
