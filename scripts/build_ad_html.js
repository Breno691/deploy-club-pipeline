// build_ad_html.js — Premium light-theme ad renderer (Deploy Club palette)
require('dotenv').config();
const fs   = require('fs');
const path = require('path');

const args     = process.argv.slice(2);
const taskName = args[args.indexOf('--task') + 1] || 'deploy_club_demo';
const taskDate = args[args.indexOf('--date') + 1] || new Date().toISOString().split('T')[0];
const adsDir   = path.join('outputs', `${taskName}_${taskDate}`, 'ads');
const layoutPath = path.join(adsDir, 'layout.json');

if (!fs.existsSync(layoutPath)) { console.error('layout.json not found:', layoutPath); process.exit(1); }

const layout = JSON.parse(fs.readFileSync(layoutPath, 'utf8'));

// Deploy Club brand tokens
const BG      = '#F5F0E8';
const BG2     = '#EDE8DE';
const BG3     = '#E2D9CE';
const ESPRESSO= '#2C1810';
const COFFEE  = '#3D2B1F';
const TAUPE   = '#8D7B68';
const TERRA   = '#AC5B30';
const CLAY    = '#C47A52';
const PARCH   = '#D4C8B8';
const WHITE   = '#FAF8F4';

const get   = (type) => layout.elements?.filter(e => e.type === type) || [];
const first = (type) => layout.elements?.find(e => e.type === type);

const headlineText = first('headline')?.text || 'Retrabalho que volta todo mês?';
const subtextText  = first('subtext')?.text  || 'O processo está quebrado — não a equipe. Em 4 semanas eliminamos a raiz do problema.';
const metricRaw    = first('metric')?.text   || '−30% custo operacional';
const metricTokens = metricRaw.trim().split(/\s+/);
const metricVal    = metricTokens[0];
const metricLbl    = first('metric')?.label  || metricTokens.slice(1).join(' ') || 'custo operacional';
const ctaText      = first('cta')?.text      || 'Agendar Diagnóstico Grátis';
const ctaSub       = first('cta')?.subtext   || 'WhatsApp · Resposta em 30 min';
const pillText     = first('label')?.text    || 'Lean Six Sigma';
const benefits     = get('benefit');

const words    = headlineText.split(' ');
const firstWord= words[0];
const restWords= words.slice(1).join(' ');

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  width: 1080px; height: 1080px;
  overflow: hidden;
  background: ${BG};
}

.ad {
  position: relative;
  width: 1080px; height: 1080px;
  background: ${BG};
  font-family: 'DM Sans', system-ui, sans-serif;
  overflow: hidden;
}

/* ── Noise grain ── */
.noise {
  position: absolute; inset: 0;
  pointer-events: none; opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 200px;
}

/* ── Right dark panel ── */
.right-panel {
  position: absolute;
  top: 0; right: 0;
  width: 460px; height: 1080px;
  background: ${ESPRESSO};
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 64px 48px;
  gap: 28px;
  z-index: 4;
}

/* ── Top accent bar ── */
.top-bar {
  position: absolute; top: 0; left: 0; right: 0; height: 4px;
  background: linear-gradient(90deg, ${TERRA}, ${CLAY}, ${TERRA});
  z-index: 10;
}

/* ── Left panel ── */
.left {
  position: absolute;
  top: 0; left: 0;
  width: 620px; height: 1080px;
  padding: 80px 72px 72px;
  display: flex; flex-direction: column;
  justify-content: space-between;
  z-index: 6;
}

/* Category pill */
.pill {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 20px;
  border: 1.5px solid ${TERRA};
  border-radius: 999px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; font-weight: 500;
  color: ${TERRA};
  letter-spacing: .14em; text-transform: uppercase;
  width: fit-content;
}
.pill-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: ${TERRA};
}

/* Headline — Playfair Display */
.headline {
  font-family: 'Playfair Display', serif;
  font-size: 68px; font-weight: 800;
  line-height: 1.08; letter-spacing: -0.02em;
  color: ${ESPRESSO};
  max-width: 500px;
}
.headline .hl { color: ${TERRA}; }

/* Subtext */
.subtext {
  font-size: 18px; font-weight: 400;
  color: ${TAUPE}; line-height: 1.6;
  max-width: 440px;
}

/* Big metric */
.metric-area { display: flex; flex-direction: column; gap: 6px; }
.metric-num {
  font-family: 'Playfair Display', serif;
  font-size: 88px; font-weight: 800;
  color: ${TERRA}; line-height: 1;
  letter-spacing: -0.03em;
}
.metric-lbl {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px; font-weight: 500;
  color: ${TAUPE};
  text-transform: uppercase; letter-spacing: .12em;
}

/* Benefits */
.benefits { display: flex; flex-direction: column; gap: 12px; }
.b-item {
  display: flex; align-items: center; gap: 12px;
  font-size: 15px; font-weight: 500; color: ${COFFEE};
}
.b-check {
  width: 20px; height: 20px; border-radius: 5px;
  background: ${TERRA}18;
  border: 1.5px solid ${TERRA}50;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

/* CTA */
.cta-area { display: flex; align-items: center; gap: 20px; }
.cta-btn {
  display: inline-flex; align-items: center; gap: 12px;
  background: ${ESPRESSO};
  border-radius: 12px;
  padding: 18px 32px;
  font-family: 'DM Sans', sans-serif;
  font-size: 16px; font-weight: 700;
  color: ${BG};
  letter-spacing: .01em;
  box-shadow: 0 8px 28px ${ESPRESSO}40;
  flex-shrink: 0;
}
.cta-meta {
  font-size: 13px; color: ${TAUPE}; line-height: 1.5;
}
.cta-meta strong { color: ${COFFEE}; font-weight: 600; }

/* ── Terminal card ── */
.terminal {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.07);
}
.t-bar {
  display: flex; align-items: center; gap: 7px;
  padding: 14px 18px;
  background: rgba(255,255,255,0.04);
  border-bottom: 1px solid rgba(255,255,255,.07);
}
.dot { width: 11px; height: 11px; border-radius: 50%; }
.dr{background:#ff5f57;}.dy{background:#febc2e;}.dg{background:#28c840;}
.t-fname { font-family:'JetBrains Mono',monospace; font-size:11px; color:${TAUPE}60; margin-left:8px; }
.t-body {
  padding: 20px 20px 24px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px; line-height: 2; color: ${TAUPE}60;
}
.tc { color: ${TAUPE}40; }
.tp { color: ${CLAY}; font-weight: 500; }
.tk { color: ${BG}90; }
.to { color: #4ade80; }
.tw { color: #fbbf24; }
.tv { color: ${BG}70; }
.thi { color: ${BG}; font-weight: 500; }

/* ── Stat badges ── */
.badges {
  display: grid; grid-template-columns: repeat(3,1fr); gap: 10px;
}
.badge {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 12px;
  padding: 16px 10px;
  text-align: center;
}
.bv { font-family:'Playfair Display',serif; font-size:22px; font-weight:700; color:${CLAY}; display:block; line-height:1; margin-bottom:5px; }
.bl { font-family:'JetBrains Mono',monospace; font-size:9px; color:${TAUPE}70; text-transform:uppercase; letter-spacing:.1em; }

/* ── Branding ── */
.brand-left {
  position: absolute; left: 72px; bottom: 36px;
  font-family: 'Playfair Display', serif;
  font-size: 14px; font-weight: 600; color: ${TAUPE};
  letter-spacing: .06em; z-index: 10;
}
.brand-right {
  position: absolute; right: 52px; bottom: 36px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; color: ${TAUPE}60;
  letter-spacing: .1em; text-transform: uppercase;
}

/* Horizontal rule */
.h-rule {
  position: absolute; top: 588px; left: 0; width: 590px; height: 1px;
  background: linear-gradient(90deg, transparent 0%, ${PARCH} 30%, ${PARCH} 70%, transparent 100%);
  z-index: 7;
}
</style>
</head>
<body>
<div class="ad">
  <div class="noise"></div>
  <div class="top-bar"></div>
  <div class="right-panel"></div>
  <div class="diag-cut"></div>
  <div class="h-rule"></div>

  <!-- Left panel -->
  <div class="left">

    <!-- TOP: pill + headline + subtext -->
    <div style="display:flex;flex-direction:column;gap:28px;padding-top:0">
      <div class="pill">
        <span class="pill-dot"></span>
        ${pillText}
      </div>
      <div class="headline">
        <span class="hl">${firstWord}</span>
        ${restWords ? ` ${restWords}` : ''}
      </div>
      <div class="subtext">${subtextText}</div>
    </div>

    <!-- MIDDLE: big metric -->
    <div class="metric-area">
      <div class="metric-num">${metricVal}</div>
      <div class="metric-lbl">${metricLbl}</div>
    </div>

    <!-- BOTTOM: benefits + CTA -->
    <div style="display:flex;flex-direction:column;gap:24px">
      <div class="benefits">
        ${benefits.length > 0
          ? benefits.map(b => `
          <div class="b-item">
            <div class="b-check">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <polyline points="1.5,5 4,7.5 8.5,2" stroke="${TERRA}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            ${b.text}
          </div>`).join('')
          : `
          <div class="b-item">
            <div class="b-check"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><polyline points="1.5,5 4,7.5 8.5,2" stroke="${TERRA}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
            Diagnóstico gratuito em 30 minutos
          </div>
          <div class="b-item">
            <div class="b-check"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><polyline points="1.5,5 4,7.5 8.5,2" stroke="${TERRA}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
            Quick wins em 2–4 semanas
          </div>`
        }
      </div>

      <div class="cta-area">
        <div class="cta-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" fill="rgba(255,255,255,0.12)"/>
            <path d="M17.5 14.7c-.2-.1-1.4-.7-1.6-.77-.2-.08-.34-.1-.49.1-.14.2-.57.7-.7.85-.12.14-.24.16-.45.05-.22-.1-.91-.34-1.73-1.07-.64-.57-1.07-1.27-1.2-1.49-.12-.21-.01-.33.1-.43.09-.09.2-.24.3-.36.1-.13.14-.21.2-.36.07-.14.04-.27-.01-.38-.06-.1-.49-1.2-.67-1.64-.18-.43-.37-.37-.5-.38h-.43c-.14 0-.37.05-.56.27-.19.21-.74.73-.74 1.78 0 1.04.76 2.05.86 2.19.1.14 1.48 2.27 3.6 3.18.5.21.9.34 1.2.44.5.16.96.14 1.32.09.4-.06 1.24-.51 1.41-1 .17-.49.17-.9.12-1c-.05-.09-.2-.14-.42-.25z" fill="white"/>
          </svg>
          ${ctaText}
        </div>
        <div class="cta-meta">
          <strong>Resposta em 30 min</strong><br>Sem compromisso
        </div>
      </div>
    </div>
  </div>

  <!-- Right panel content -->
  <div class="right-panel">
    <div class="terminal">
      <div class="t-bar">
        <span class="dot dr"></span><span class="dot dy"></span><span class="dot dg"></span>
        <span class="t-fname">lean_analyze.sh — bash</span>
      </div>
      <div class="t-body">
        <div><span class="tc"># Diagnóstico de processo</span></div>
        <div><span class="tp">▶</span> <span class="tk">smartops scan --mode=dmaic</span></div>
        <div>&nbsp;</div>
        <div><span class="to">✔</span> <span class="tv">Mapeando fluxo de valor...</span></div>
        <div><span class="to">✔</span> <span class="tv">Identificando gargalos</span></div>
        <div><span class="tw">⚠</span> <span class="tv">Retrabalho: </span><span class="tw thi">+340 h/mês</span></div>
        <div><span class="tw">⚠</span> <span class="tv">Causa-raiz: </span><span class="tw thi">3 pontos críticos</span></div>
        <div>&nbsp;</div>
        <div><span class="tp">▶</span> <span class="tv">iniciando DMAIC...</span></div>
        <div>&nbsp;</div>
        <div><span class="to">✔</span> <span class="tv">D — </span><span class="thi">problema definido</span></div>
        <div><span class="to">✔</span> <span class="tv">M — </span><span class="thi">dados coletados</span></div>
        <div><span class="to">✔</span> <span class="tv">A — </span><span class="thi">causa-raiz identificada</span></div>
        <div><span class="tp">⋯</span> <span class="tv">I — implementando melhoria</span></div>
        <div><span class="tp">⋯</span> <span class="tv">C — aguardando controle</span></div>
      </div>
    </div>
    <div class="badges">
      <div class="badge"><span class="bv">4 sem</span><span class="bl">Prazo</span></div>
      <div class="badge"><span class="bv">−30%</span><span class="bl">Custo</span></div>
      <div class="badge"><span class="bv">30 min</span><span class="bl">Diagnóstico</span></div>
    </div>
  </div>

  <div class="brand-left">Deploy Club</div>
  <div class="brand-right">SmartOps IA · Lean Six Sigma</div>
</div>
</body>
</html>`;

fs.writeFileSync(path.join(adsDir, 'ad.html'), html);
console.log('✓ ad.html rebuilt — light terracotta theme');
