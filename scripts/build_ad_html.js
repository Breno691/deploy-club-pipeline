// build_ad_html.js — SmartOps IA dark theme ad renderer
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

// SmartOps IA brand tokens
const BG        = '#0A0A0F';
const CARD      = '#0B0F17';
const ELEVATED  = '#111827';
const BORDER    = '#1F2937';
const TEXT      = '#FFFFFF';
const TEXT2     = '#A1A1AA';
const MUTED     = '#6B7280';
const DEEP      = '#374151';

// Accent: purple (Lean) or emerald (Automation)
const accentColor = layout.accentColor || '#7C3AED';
const isEmerald   = accentColor === '#10B981';
const ACCENT      = accentColor;
const ACCENT_GLOW = isEmerald ? 'rgba(16,185,129,0.40)' : 'rgba(124,58,237,0.40)';
const ACCENT_SOFT = isEmerald ? 'rgba(16,185,129,0.06)' : 'rgba(124,58,237,0.06)';
const ACCENT_BOR  = isEmerald ? 'rgba(16,185,129,0.20)' : 'rgba(124,58,237,0.20)';
const ACCENT_DARK = isEmerald ? '#064E3B' : '#4C1D95';

// Content from layout.json with smart defaults
const headlineText = layout.headline  || 'Seu processo está te custando dinheiro.';
const subtextText  = layout.subtext   || 'Mapeamos, diagnosticamos e eliminamos o desperdício com Lean + automação com IA.';
const ctaText      = layout.ctaText   || 'Diagnóstico gratuito — 30 min';
const domain       = layout.domain    || 'smartops-ia.com.br';

// Break headline for Bebas Neue display
const headlineWords = headlineText.split(' ');
const mid = Math.ceil(headlineWords.length / 2);
const hl1 = headlineWords.slice(0, mid).join(' ');
const hl2 = headlineWords.slice(mid).join(' ');

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  width: 1080px; height: 1080px;
  overflow: hidden; background: ${BG};
}

.ad {
  position: relative;
  width: 1080px; height: 1080px;
  background: ${BG};
  font-family: 'Inter', sans-serif;
  overflow: hidden;
}

/* Left accent stripe */
.stripe {
  position: absolute;
  left: 0; top: 0; width: 14px; height: 1080px;
  background: linear-gradient(180deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%);
  z-index: 10;
}

/* Subtle grid */
.grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(${ACCENT_SOFT} 1px, transparent 1px),
    linear-gradient(90deg, ${ACCENT_SOFT} 1px, transparent 1px);
  background-size: 54px 54px;
}

/* Radial glow */
.glow {
  position: absolute; top: -100px; left: -100px;
  width: 700px; height: 600px;
  background: radial-gradient(ellipse, ${ACCENT_SOFT} 0%, transparent 60%);
  pointer-events: none;
}

/* Brand row */
.brand-row {
  position: absolute; left: 60px; top: 52px;
  display: flex; align-items: center; gap: 10px;
}
.brand-dot {
  width: 9px; height: 9px; border-radius: 50%;
  background: ${ACCENT};
  box-shadow: 0 0 10px ${ACCENT};
}
.brand-name {
  font-size: 14px; font-weight: 700;
  color: ${TEXT}; letter-spacing: 0.5px;
}
.brand-tag { font-size: 12px; font-weight: 400; color: ${MUTED}; }

/* Headline — Bebas Neue */
.headline {
  position: absolute; left: 60px; top: 118px;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 112px; color: ${TEXT};
  line-height: 0.93; letter-spacing: 2px;
}
.hl-line2 { color: ${ACCENT}; }

/* Divider */
.divider {
  position: absolute; left: 60px; right: 60px; top: 474px;
  height: 1px; background: ${BORDER};
}

/* Subtext */
.subtext {
  position: absolute; left: 60px; top: 494px;
  font-size: 20px; font-weight: 400;
  color: ${TEXT2}; line-height: 1.6; max-width: 700px;
}
.subtext strong { color: #E5E7EB; font-weight: 600; }

/* 3-pillar cards row */
.pillars {
  position: absolute; left: 60px; right: 60px; top: 638px;
  display: flex; gap: 18px;
}
.pillar {
  flex: 1; background: #0F1319;
  border: 1px solid ${BORDER};
  border-top: 2.5px solid ${BORDER};
  border-radius: 14px;
  padding: 22px 20px 20px;
}
.pillar.active {
  border-top-color: ${ACCENT};
  background: ${ACCENT_SOFT};
}
.pillar-num {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 36px; color: ${DEEP};
  line-height: 1; margin-bottom: 8px;
}
.pillar.active .pillar-num { color: ${ACCENT}; }
.pillar-label {
  font-size: 14px; font-weight: 700;
  color: #D1D5DB; margin-bottom: 5px;
}
.pillar-sub { font-size: 12px; color: ${MUTED}; line-height: 1.4; }

/* Footer */
.footer {
  position: absolute; left: 60px; right: 60px; bottom: 52px;
  display: flex; align-items: center; justify-content: space-between;
}
.footer-label {
  font-size: 11px; font-weight: 500; color: ${MUTED};
  text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 5px;
}
.footer-text { font-size: 21px; font-weight: 700; color: ${TEXT}; }
.footer-text span { color: ${ACCENT}; }

.cta {
  background: ${ACCENT}; color: ${TEXT};
  font-family: 'Inter', sans-serif;
  font-size: 17px; font-weight: 700;
  padding: 20px 44px; border-radius: 12px;
  box-shadow: 0 0 48px ${ACCENT_GLOW};
  letter-spacing: 0.2px; white-space: nowrap;
}

/* Domain */
.domain {
  position: absolute; bottom: 20px; left: 50%;
  transform: translateX(-50%);
  font-size: 11px; font-weight: 500;
  color: ${DEEP}; letter-spacing: 2px;
  text-transform: uppercase;
}
</style>
</head>
<body>
<div class="ad">
  <div class="stripe"></div>
  <div class="grid"></div>
  <div class="glow"></div>

  <div class="brand-row">
    <div class="brand-dot"></div>
    <span class="brand-name">SmartOps IA</span>
    <span class="brand-tag">/ Consultoria</span>
  </div>

  <div class="headline">
    ${hl1}<br>
    <span class="hl-line2">${hl2}</span>
  </div>

  <div class="divider"></div>

  <div class="subtext">
    ${subtextText.replace(/(Lean Six Sigma|automação com IA|Lean \+ automação|automação)/gi, '<strong>$&</strong>')}
  </div>

  <div class="pillars">
    <div class="pillar active">
      <div class="pillar-num">01</div>
      <div class="pillar-label">Diagnóstico</div>
      <div class="pillar-sub">Entendemos o problema real da operação</div>
    </div>
    <div class="pillar">
      <div class="pillar-num">02</div>
      <div class="pillar-label">Mapeamento</div>
      <div class="pillar-sub">Identificamos gargalos e desperdícios</div>
    </div>
    <div class="pillar">
      <div class="pillar-num">03</div>
      <div class="pillar-label">Solução</div>
      <div class="pillar-sub">Lean + IA aplicados no processo</div>
    </div>
  </div>

  <div class="footer">
    <div>
      <div class="footer-label">Primeira etapa</div>
      <div class="footer-text">${ctaText.replace(/(gratu[íi]to|gratis|gratuita)/i, '<span>$&</span>')}</div>
    </div>
    <div class="cta">Quero meu diagnóstico →</div>
  </div>

  <div class="domain">${domain}</div>
</div>
</body>
</html>`;

fs.writeFileSync(path.join(adsDir, 'ad.html'), html);
console.log('✓ ad.html rebuilt — SmartOps IA dark theme');
