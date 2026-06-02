// build_carousel_html.js — SmartOps IA | Carousel 5 slides 1080×1080
// Research-based: 1 idea per slide, max 12 words, bold first slide hook
require('dotenv').config();
const fs   = require('fs');
const path = require('path');

const args     = process.argv.slice(2);
const taskName = args[args.indexOf('--task') + 1] || 'smartops_demo';
const taskDate = args[args.indexOf('--date') + 1] || new Date().toISOString().split('T')[0];
const outDir   = path.join('outputs', `${taskName}_${taskDate}`);
const adsDir   = path.join(outDir, 'ads');
const layoutPath = path.join(adsDir, 'layout.json');
const copyDir  = path.join(outDir, 'copy');

if (!fs.existsSync(layoutPath)) { console.error('layout.json not found:', layoutPath); process.exit(1); }
const layout = JSON.parse(fs.readFileSync(layoutPath, 'utf8'));

// Try to load research for more specific carousel content
let research = {};
try { research = JSON.parse(fs.readFileSync(path.join(outDir, 'research_results.json'), 'utf8')); } catch {}

const W = 1080, H = 1080;

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

function icon(name, color, size = 32) {
  color = color || C.ACCENT;
  const d = {
    check:    `<circle cx="12" cy="12" r="9" stroke="${color}" stroke-width="1.8"/><path d="M8 12.5l3 3 5-5" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
    x:        `<circle cx="12" cy="12" r="9" stroke="${color}" stroke-width="1.8"/><path d="M9 9l6 6M15 9l-6 6" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>`,
    alert:    `<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="${color}" stroke-width="1.8"/><line x1="12" y1="9" x2="12" y2="13" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>`,
    gear:     `<circle cx="12" cy="12" r="3" stroke="${color}" stroke-width="1.8"/><circle cx="12" cy="12" r="9" stroke="${color}" stroke-width="1.8" stroke-dasharray="3 2"/>`,
    trending: `<polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><polyline points="16 7 22 7 22 13" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
    arrow:    `<path d="M5 12h14M12 5l7 7-7 7" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
    question: `<circle cx="12" cy="12" r="10" stroke="${color}" stroke-width="1.8"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>`,
    lightning:`<path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
    dollar:   `<line x1="12" y1="1" x2="12" y2="23" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>`,
    phone:    `<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.5a2 2 0 011.97-2H8a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L9.91 14a16 16 0 006.06 6.06l.27-.28a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="${color}" stroke-width="1.8"/>`,
  }[name] || `<circle cx="12" cy="12" r="9" stroke="${color}" stroke-width="1.8"/>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">${d}</svg>`;
}

function logoSVG(size = 28) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 30 30" fill="none">
    <path d="M15 2L27 8.5V21.5L15 28L3 21.5V8.5L15 2Z" fill="rgba(${C.RGB},0.12)" stroke="${C.ACCENT}" stroke-width="1.3"/>
    <path d="M18.5 12C18.5 12 16.5 10.5 14 11.5C11.5 12.5 11.5 14 13.5 15L16 16C18 17 18.2 18.5 16.5 19.5C14.8 20.5 12 19.5 12 19.5" stroke="${C.ACCENT}" stroke-width="1.9" stroke-linecap="round"/>
  </svg>`;
}

// ─── Shared slide shell ────────────────────────────────────────────────────────
function makeSlide(num, total, inner) {
  const dots = Array(total).fill(0).map((_,i) =>
    `<div style="width:${i===num-1?28:8}px;height:8px;border-radius:4px;background:${i===num-1?C.ACCENT:'rgba(255,255,255,0.2)'}"></div>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: ${C.BG}; }
.slide { position: relative; width: ${W}px; height: ${H}px; background: ${C.BG}; font-family: 'Inter', sans-serif; overflow: hidden; }
.grid { position: absolute; inset: 0; background-image: linear-gradient(${C.SOFT} 1px, transparent 1px), linear-gradient(90deg, ${C.SOFT} 1px, transparent 1px); background-size: 60px 60px; }
.stripe { position: absolute; left: 0; top: 0; width: 6px; height: 100%; background: linear-gradient(180deg, ${C.ACCENT} 0%, ${C.DARK} 100%); z-index: 10; }
.brand-row { position: absolute; left: 60px; top: 48px; display: flex; align-items: center; gap: 10px; }
.brand-name { font-size: 14px; font-weight: 700; color: ${C.TEXT}; margin-left: 8px; }
.brand-tag { font-size: 12px; color: ${C.MUTED}; }
.slide-counter { position: absolute; right: 60px; top: 52px; font-size: 13px; font-weight: 600; color: ${C.MUTED}; letter-spacing: 1px; }
.dots { position: absolute; bottom: 42px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; align-items: center; }
${inner.css || ''}
</style>
</head>
<body>
<div class="slide">
  <div class="grid"></div>
  ${inner.glows || ''}
  <div class="stripe"></div>
  <div class="brand-row">
    ${logoSVG()}
    <span class="brand-name">SmartOps IA</span>
    <span class="brand-tag">/ Consultoria</span>
  </div>
  <div class="slide-counter">${num} / ${total}</div>
  ${inner.body}
  <div class="dots">${dots}</div>
</div>
</body>
</html>`;
}

// ─── Slide 1: CAPA — Hook (pain point, bold, single idea) ────────────────────
function slide1() {
  const hook = layout.headline || 'Seu processo está te custando dinheiro.';
  const words = hook.replace(/\.$/, '').split(' ');
  const n = words.length;
  const at = Math.max(2, Math.round(n * 0.42));
  const [hl1, hl2] = [words.slice(0, at).join(' '), words.slice(at).join(' ')];
  const fs = n <= 5 ? 148 : n <= 7 ? 126 : 106;

  return makeSlide(1, 5, {
    glows: `<div style="position:absolute;top:-220px;left:-120px;width:880px;height:720px;background:radial-gradient(ellipse,${C.SOFT} 0%,transparent 60%)"></div>`,
    css: `
.badge { position: absolute; left: 60px; top: 94px; display: inline-flex; align-items: center; gap: 7px; background: ${C.SOFT}; border: 1px solid ${C.BOR}; border-radius: 100px; padding: 6px 16px; }
.bdot { width: 5px; height: 5px; border-radius: 50%; background: ${C.ACCENT}; }
.btxt { font-size: 11px; font-weight: 700; color: ${C.ACCENT}; letter-spacing: 2px; text-transform: uppercase; }
.headline { position: absolute; left: 60px; top: 146px; font-family: 'Bebas Neue', sans-serif; font-size: ${fs}px; color: ${C.TEXT}; line-height: 0.88; letter-spacing: 2px; max-width: 960px; }
.hla { color: ${C.ACCENT}; }
.hook-sub { position: absolute; left: 60px; top: 560px; font-size: 24px; color: ${C.TEXT2}; line-height: 1.6; max-width: 800px; }
.hook-sub strong { color: #E5E7EB; font-weight: 700; }
.swipe-hint { position: absolute; right: 60px; bottom: 100px; display: flex; align-items: center; gap: 10px; background: ${C.CARD}; border: 1px solid ${C.BORDER}; border-radius: 100px; padding: 12px 22px; }
.swipe-txt { font-size: 14px; font-weight: 600; color: ${C.MUTED}; }`,
    body: `
  <div class="badge"><div class="bdot"></div><span class="btxt">${layout.badge || 'LEAN SIX SIGMA'}</span></div>
  <div class="headline">${hl1}${hl2?`<br><span class="hla">${hl2}</span>`:''}</div>
  <div class="hook-sub">${(layout.subtext||'').replace(/(Lean Six Sigma|automação com IA|Lean \+ automação|automação|IA)/gi,'<strong>$&</strong>')}</div>
  <div class="swipe-hint">
    ${icon('arrow', C.ACCENT, 20)}
    <span class="swipe-txt">Arraste para ver a solução</span>
  </div>`,
  });
}

// ─── Slide 2: O PROBLEMA — 3 bullet points ────────────────────────────────────
function slide2() {
  const problems = layout.problems || research.pain_points || [
    { icon: 'dollar', text: 'Retrabalho consome até 30% do tempo produtivo' },
    { icon: 'alert',  text: 'Processos manuais geram erros invisíveis e caros' },
    { icon: 'gear',   text: 'Falta de padronização cria gargalos todo dia'   },
  ];

  return makeSlide(2, 5, {
    glows: `<div style="position:absolute;top:-200px;left:50%;transform:translateX(-50%);width:1100px;height:700px;background:radial-gradient(ellipse,rgba(${C.RGB},0.07) 0%,transparent 58%)"></div>`,
    css: `
.s2-lbl { position: absolute; left: 60px; top: 94px; font-size: 11px; font-weight: 700; color: ${C.MUTED}; letter-spacing: 2.5px; text-transform: uppercase; }
.s2-title { position: absolute; left: 60px; top: 126px; font-family: 'Bebas Neue', sans-serif; font-size: 112px; color: ${C.TEXT}; line-height: 0.88; letter-spacing: 2px; }
.s2-title .hla { color: ${C.ACCENT}; }
.problems { position: absolute; left: 60px; right: 60px; top: 476px; display: flex; flex-direction: column; gap: 18px; }
.prob { display: flex; align-items: center; gap: 24px; background: ${C.CARD}; border: 1px solid ${C.BORDER}; border-left: 3px solid ${C.BORDER}; border-radius: 16px; padding: 24px 28px; }
.prob.hi { border-left-color: rgba(239,68,68,0.6); background: rgba(239,68,68,0.04); }
.prob-ico { opacity: 0.7; }
.prob-txt { font-size: 20px; font-weight: 500; color: ${C.TEXT}; line-height: 1.45; }
.prob-txt strong { color: ${C.ACCENT}; font-weight: 700; }`,
    body: `
  <div class="s2-lbl">O problema</div>
  <div class="s2-title">Isso está<br><span class="hla">acontecendo.</span></div>
  <div class="problems">
    ${problems.map((p,i)=>`
    <div class="prob${i===0?' hi':''}">
      <div class="prob-ico">${icon(p.icon||'alert', i===0?'rgba(239,68,68,0.8)':C.MUTED, 30)}</div>
      <div class="prob-txt">${p.text.replace(/(\d+%|\d+x|\d+ dias)/g,'<strong>$&</strong>')}</div>
    </div>`).join('')}
  </div>`,
  });
}

// ─── Slide 3: POR QUE — causa raiz ────────────────────────────────────────────
function slide3() {
  const causes = layout.causes || [
    { num: '01', title: 'Sem diagnóstico', desc: 'Não se sabe onde está a perda real' },
    { num: '02', title: 'Sem padrão',      desc: 'Cada um faz do seu jeito — variabilidade' },
    { num: '03', title: 'Sem dados',       desc: 'Decisões por intuição, não por evidência' },
  ];

  return makeSlide(3, 5, {
    glows: `<div style="position:absolute;bottom:-200px;right:-100px;width:700px;height:700px;background:radial-gradient(ellipse,rgba(${C.RGB},0.07) 0%,transparent 58%)"></div>`,
    css: `
.s3-lbl { position: absolute; left: 60px; top: 94px; font-size: 11px; font-weight: 700; color: ${C.MUTED}; letter-spacing: 2.5px; text-transform: uppercase; }
.s3-title { position: absolute; left: 60px; top: 126px; font-family: 'Bebas Neue', sans-serif; font-size: 112px; color: ${C.TEXT}; line-height: 0.88; letter-spacing: 2px; }
.s3-title .hla { color: ${C.ACCENT}; }
.causes { position: absolute; left: 60px; right: 60px; top: 466px; display: flex; flex-direction: column; gap: 20px; }
.cause { display: flex; align-items: flex-start; gap: 22px; }
.c-num { font-family: 'Bebas Neue', sans-serif; font-size: 56px; color: rgba(${C.RGB},0.25); line-height: 1; min-width: 60px; }
.c-body { border-left: 2px solid ${C.BORDER}; padding-left: 22px; padding-top: 4px; }
.c-title { font-size: 20px; font-weight: 800; color: ${C.TEXT}; margin-bottom: 6px; }
.c-desc { font-size: 16px; color: ${C.MUTED}; line-height: 1.5; }`,
    body: `
  <div class="s3-lbl">Por que acontece</div>
  <div class="s3-title">A causa<br><span class="hla">raiz.</span></div>
  <div class="causes">
    ${causes.map((c,i)=>`
    <div class="cause">
      <div class="c-num">${c.num||String(i+1).padStart(2,'0')}</div>
      <div class="c-body">
        <div class="c-title">${c.title}</div>
        <div class="c-desc">${c.desc}</div>
      </div>
    </div>`).join('')}
  </div>`,
  });
}

// ─── Slide 4: A SOLUÇÃO — 3 passos horizontais ────────────────────────────────
function slide4() {
  const pillars = layout.pillars || [
    { num: '01', label: 'Diagnóstico', sub: 'Mapeamos o processo real e onde está a perda' },
    { num: '02', label: 'Análise',     sub: 'Quantificamos perdas, gargalos e custos ocultos' },
    { num: '03', label: 'Solução',     sub: 'Lean + IA eliminam desperdício com ROI claro' },
  ];

  return makeSlide(4, 5, {
    glows: `<div style="position:absolute;top:-200px;left:50%;transform:translateX(-50%);width:1100px;height:700px;background:radial-gradient(ellipse,rgba(${C.RGB},0.07) 0%,transparent 58%)"></div>`,
    css: `
.s4-lbl { position: absolute; left: 60px; top: 94px; font-size: 11px; font-weight: 700; color: ${C.MUTED}; letter-spacing: 2.5px; text-transform: uppercase; }
.s4-title { position: absolute; left: 60px; top: 126px; font-family: 'Bebas Neue', sans-serif; font-size: 112px; color: ${C.TEXT}; line-height: 0.88; letter-spacing: 2px; }
.s4-title .hla { color: ${C.ACCENT}; }
.steps { position: absolute; left: 60px; right: 60px; top: 466px; display: flex; align-items: stretch; }
.step { flex: 1; position: relative; background: ${C.CARD}; border: 1px solid ${C.BORDER}; padding: 28px 22px 24px; }
.step:first-child { border-radius: 16px 0 0 16px; border-right: none; border-top: 3px solid ${C.ACCENT}; background: ${C.SOFT}; }
.step:nth-child(2) { border-left: none; border-right: none; border-top: 3px solid ${C.BORDER}; }
.step:last-child { border-radius: 0 16px 16px 0; border-left: none; border-top: 3px solid ${C.BORDER}; }
.arr { position: absolute; right: -18px; top: 50%; transform: translateY(-50%); z-index: 5; width: 36px; height: 36px; background: ${C.BG}; border: 1px solid ${C.BORDER}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; color: ${C.ACCENT}; font-weight: 700; }
.s-num { font-family: 'Bebas Neue', sans-serif; font-size: 42px; color: ${C.DEEP}; line-height: 1; margin-bottom: 10px; }
.step:first-child .s-num { color: ${C.ACCENT}; }
.s-lbl { font-size: 16px; font-weight: 800; color: ${C.TEXT}; margin-bottom: 8px; }
.s-sub { font-size: 13px; color: ${C.MUTED}; line-height: 1.5; }
.s4-sub { position: absolute; left: 60px; right: 60px; bottom: 108px; font-size: 18px; color: ${C.TEXT2}; line-height: 1.6; }
.s4-sub strong { color: #E5E7EB; font-weight: 700; }`,
    body: `
  <div class="s4-lbl">A solução</div>
  <div class="s4-title">Como a gente<br><span class="hla">resolve.</span></div>
  <div class="steps">
    ${pillars.map((p,i)=>`
    <div class="step">
      ${i<2?`<div class="arr">→</div>`:''}
      <div class="s-num">${p.num}</div>
      <div class="s-lbl">${p.label}</div>
      <div class="s-sub">${p.sub}</div>
    </div>`).join('')}
  </div>
  <div class="s4-sub">${(layout.subtext||'').replace(/(Lean Six Sigma|automação com IA|Lean \+ automação|automação|IA)/gi,'<strong>$&</strong>')}</div>`,
  });
}

// ─── Slide 5: CTA — Resultado + ação ─────────────────────────────────────────
function slide5() {
  const metric      = layout.metric      || '40%';
  const metricLabel = layout.metricLabel || 'menos retrabalho em 30 dias';
  const mfs = metric.length <= 3 ? 200 : 160;

  return makeSlide(5, 5, {
    glows: `
    <div style="position:absolute;top:-100px;right:-100px;width:700px;height:700px;background:radial-gradient(ellipse,rgba(${C.RGB},0.1) 0%,transparent 58%)"></div>
    <div style="position:absolute;bottom:-100px;left:-60px;width:500px;height:400px;background:radial-gradient(ellipse,rgba(${C.RGB},0.06) 0%,transparent 60%)"></div>`,
    css: `
.s5-lbl { position: absolute; left: 60px; top: 94px; font-size: 11px; font-weight: 700; color: ${C.MUTED}; letter-spacing: 2.5px; text-transform: uppercase; }
.s5-title { position: absolute; left: 60px; top: 126px; font-family: 'Bebas Neue', sans-serif; font-size: 112px; color: ${C.TEXT}; line-height: 0.88; letter-spacing: 2px; }
.s5-title .hla { color: ${C.ACCENT}; }
.metric-blk { position: absolute; left: 60px; top: 430px; display: flex; align-items: baseline; gap: 0; }
.m-num { font-family: 'Bebas Neue', sans-serif; font-size: ${mfs}px; color: ${C.ACCENT}; line-height: 0.85; letter-spacing: -4px; filter: drop-shadow(0 0 50px ${C.GLOW}); }
.m-info { margin-left: 24px; }
.m-lbl { font-size: 22px; font-weight: 700; color: ${C.TEXT}; line-height: 1.3; max-width: 400px; }
.m-sub { font-size: 14px; color: ${C.MUTED}; margin-top: 8px; }
.divider { position: absolute; left: 60px; right: 60px; top: 700px; height: 1px; background: linear-gradient(90deg, rgba(${C.RGB},0.4), ${C.BORDER} 40%, transparent); }
.cta-area { position: absolute; left: 60px; right: 60px; top: 730px; }
.cta-pre { font-size: 13px; font-weight: 600; color: ${C.MUTED}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; }
.cta-btn { display: inline-block; background: ${C.ACCENT}; color: #FFF; font-family: 'Inter', sans-serif; font-size: 18px; font-weight: 700; padding: 22px 50px; border-radius: 14px; box-shadow: 0 0 60px ${C.GLOW}; letter-spacing: 0.3px; }
.cta-note { margin-top: 18px; font-size: 14px; color: ${C.MUTED}; }
.contact-row { position: absolute; left: 60px; right: 60px; bottom: 108px; display: flex; align-items: center; gap: 32px; }
.contact-item { display: flex; align-items: center; gap: 10px; }
.contact-txt { font-size: 15px; color: ${C.TEXT2}; }`,
    body: `
  <div class="s5-lbl">Resultado real</div>
  <div class="s5-title">Pronto para<br><span class="hla">mudar?</span></div>
  <div class="metric-blk">
    <div class="m-num">${metric}</div>
    <div class="m-info">
      <div class="m-lbl">${metricLabel}</div>
      <div class="m-sub">resultado típico — clientes SmartOps IA</div>
    </div>
  </div>
  <div class="divider"></div>
  <div class="cta-area">
    <div class="cta-pre">Primeira etapa — sem compromisso</div>
    <div class="cta-btn">Diagnóstico gratuito — 30 min →</div>
    <div class="cta-note">Breno Luiz · Black Belt Lean Six Sigma · ${layout.domain || 'smartops-ia.com.br'}</div>
  </div>`,
  });
}

// ─── Generate all slides ──────────────────────────────────────────────────────
const slides = [slide1(), slide2(), slide3(), slide4(), slide5()];
const carouselDir = path.join(adsDir, 'carousel');
if (!fs.existsSync(carouselDir)) fs.mkdirSync(carouselDir, { recursive: true });

slides.forEach((html, i) => {
  fs.writeFileSync(path.join(carouselDir, `slide_${i+1}.html`), html);
});

// Preview page — all slides side by side at 50% scale
const preview = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Carousel Preview</title>
<style>
body { background: #111; padding: 40px; font-family: Inter, sans-serif; }
h1 { color: #fff; font-size: 18px; margin-bottom: 30px; opacity: 0.6; }
.row { display: flex; gap: 20px; flex-wrap: wrap; }
.slide-wrap { flex-shrink: 0; }
.slide-wrap p { color: #6B7280; font-size: 13px; margin-top: 10px; text-align: center; }
iframe { width: 540px; height: 540px; border: 1px solid #1F2937; border-radius: 12px; transform: scale(0.5); transform-origin: top left; pointer-events: none; }
.frame-wrapper { width: 540px; height: 540px; overflow: hidden; border: 1px solid #1F2937; border-radius: 12px; }
</style>
</head>
<body>
<h1>SmartOps IA — Carousel Preview · ${taskDate}</h1>
<div class="row">
  ${slides.map((_,i)=>`
  <div class="slide-wrap">
    <div class="frame-wrapper"><iframe src="slide_${i+1}.html" scrolling="no"></iframe></div>
    <p>Slide ${i+1} / 5</p>
  </div>`).join('')}
</div>
</body>
</html>`;

fs.writeFileSync(path.join(carouselDir, 'preview.html'), preview);
console.log(`✓ Carousel — 5 slides + preview → ${carouselDir}`);
console.log(`  slide_1.html (hook) · slide_2.html (problema) · slide_3.html (causa) · slide_4.html (solução) · slide_5.html (CTA)`);
