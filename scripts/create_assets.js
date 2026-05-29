// Generates SmartOps IA brand placeholder assets
// Uses site's actual CSS variables: bg #06060e, accent #7c3aed, green #10b981
require('dotenv').config();
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join('assets');
if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });

const BASE_CSS = `
  :root {
    --bg:#06060e; --bg2:#0d0d1c; --bg3:#13132a;
    --fg:#e8e8f0; --muted:#8b8baa;
    --accent:#7c3aed; --accent-l:#a78bfa; --accent-c:#c4b5fd;
    --green:#10b981; --green-l:#6ee7b7;
    --whatsapp:#25d366;
    --border:rgba(255,255,255,.07);
    --font:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:var(--font); background:var(--bg); color:var(--fg); }
  .pill {
    display:inline-flex; align-items:center; gap:6px;
    font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.14em;
    color:var(--accent-l); border:1px solid rgba(167,139,250,.3);
    background:rgba(124,58,237,.12); padding:4px 12px; border-radius:9999px;
  }
  .pill-green { color:var(--green-l); border-color:rgba(16,185,129,.3); background:rgba(16,185,129,.1); }
  .card { background:var(--bg2); border:1px solid var(--border); border-radius:16px; padding:24px; }
  .glow {
    position:absolute; top:-80px; left:50%; transform:translateX(-50%);
    width:600px; height:400px;
    background:radial-gradient(ellipse,rgba(124,58,237,.18) 0%,transparent 70%);
    pointer-events:none;
  }
`;

const ASSETS = [
  {
    name: 'smartops_logo.png',
    width: 800, height: 800,
    html: `<!DOCTYPE html><html><head><style>${BASE_CSS}
    body{width:800px;height:800px;display:flex;align-items:center;justify-content:center;flex-direction:column;position:relative;}
    </style></head><body>
    <div class="glow"></div>
    <svg viewBox="0 0 200 200" width="220" height="220" style="margin-bottom:28px">
      <circle cx="100" cy="100" r="90" fill="#0d0d1c" stroke="#7c3aed" stroke-width="1.5"/>
      <text x="100" y="88" text-anchor="middle" font-family="system-ui" font-size="58" font-weight="800" fill="#e8e8f0">S</text>
      <path d="M60,115 L100,140 L140,115" stroke="#7c3aed" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M60,130 L100,155 L140,130" stroke="#a78bfa" stroke-width="2" fill="none" stroke-linecap="round" opacity=".5"/>
    </svg>
    <div style="font-size:26px;font-weight:800;letter-spacing:-0.02em;color:#e8e8f0">SmartOps <span style="color:#a78bfa">IA</span></div>
    <div style="font-size:12px;color:#8b8baa;letter-spacing:.1em;text-transform:uppercase;margin-top:10px">Lean Six Sigma · Automação com IA</div>
    </body></html>`
  },
  {
    name: 'lean_process.png',
    width: 1200, height: 800,
    html: `<!DOCTYPE html><html><head><style>${BASE_CSS}
    body{width:1200px;height:800px;position:relative;overflow:hidden;padding:56px;}
    .header{margin-bottom:48px;}
    .dmaic{display:flex;gap:16px;margin-bottom:48px;}
    .step{flex:1;background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:20px;text-align:center;transition:border-color .2s;}
    .step-letter{font-size:40px;font-weight:900;color:var(--accent-l);margin-bottom:8px;}
    .step-name{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);}
    .step-desc{font-size:12px;color:var(--muted);margin-top:6px;line-height:1.4;}
    .results{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
    .result{background:var(--bg2);border:1px solid rgba(124,58,237,.2);border-radius:10px;padding:16px;}
    .result-value{font-size:28px;font-weight:800;color:var(--accent-l);}
    .result-label{font-size:11px;color:var(--muted);margin-top:4px;text-transform:uppercase;letter-spacing:.08em;}
    </style></head><body>
    <div class="glow"></div>
    <div class="header">
      <div class="pill" style="margin-bottom:16px">Lean Six Sigma · DMAIC</div>
      <div style="font-size:28px;font-weight:800;letter-spacing:-0.03em">Eliminamos desperdícios. Padronizamos processos.</div>
      <div style="font-size:15px;color:#8b8baa;margin-top:8px">SmartOps IA · Black Belt · BH, MG</div>
    </div>
    <div class="dmaic">
      <div class="step"><div class="step-letter">D</div><div class="step-name">Define</div><div class="step-desc">Escopo, problema, meta</div></div>
      <div class="step"><div class="step-letter">M</div><div class="step-name">Measure</div><div class="step-desc">Dados, baseline, métricas</div></div>
      <div class="step"><div class="step-letter" style="color:#10b981">A</div><div class="step-name">Analyze</div><div class="step-desc">Causa raiz, Fishbone</div></div>
      <div class="step"><div class="step-letter">I</div><div class="step-name">Improve</div><div class="step-desc">Soluções, quick wins</div></div>
      <div class="step"><div class="step-letter">C</div><div class="step-name">Control</div><div class="step-desc">Padronização, SOP</div></div>
    </div>
    <div class="results">
      <div class="result"><div class="result-value">−30%</div><div class="result-label">Custo Operacional</div></div>
      <div class="result"><div class="result-value">4 sem.</div><div class="result-label">Quick Wins</div></div>
      <div class="result"><div class="result-value">24h</div><div class="result-label">1º Atendimento</div></div>
      <div class="result"><div class="result-value">30 min</div><div class="result-label">Diagnóstico Grátis</div></div>
    </div>
    </body></html>`
  },
  {
    name: 'automation_workflow.png',
    width: 1200, height: 800,
    html: `<!DOCTYPE html><html><head><style>${BASE_CSS}
    body{width:1200px;height:800px;position:relative;overflow:hidden;padding:56px;}
    .nodes{display:flex;gap:24px;align-items:flex-start;margin-top:48px;margin-bottom:48px;}
    .node{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:20px 24px;min-width:160px;}
    .node-icon{font-size:20px;margin-bottom:10px;}
    .node-title{font-size:14px;font-weight:700;color:#e8e8f0;}
    .node-sub{font-size:12px;color:#8b8baa;margin-top:4px;}
    .arrow{font-size:20px;color:#7c3aed;align-self:center;}
    .node-active{border-color:rgba(16,185,129,.35);background:rgba(16,185,129,.06);}
    .metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
    .metric{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:20px;}
    .metric-value{font-size:32px;font-weight:800;color:var(--green-l);}
    .metric-label{font-size:12px;color:var(--muted);margin-top:4px;text-transform:uppercase;letter-spacing:.08em;}
    </style></head><body>
    <div class="glow" style="background:radial-gradient(ellipse,rgba(16,185,129,.15) 0%,transparent 70%)"></div>
    <div class="pill pill-green" style="margin-bottom:16px">Automação com IA · WhatsApp</div>
    <div style="font-size:28px;font-weight:800;letter-spacing:-0.03em">Seu WhatsApp responde. 24h por dia.</div>
    <div style="font-size:15px;color:#8b8baa;margin-top:8px">SmartOps IA · BH, MG</div>
    <div class="nodes">
      <div class="node"><div class="node-icon">📱</div><div class="node-title">Mensagem</div><div class="node-sub">WhatsApp Business</div></div>
      <div class="arrow">→</div>
      <div class="node node-active"><div class="node-icon" style="color:#10b981">🤖</div><div class="node-title">IA Classifica</div><div class="node-sub">Categoria + intenção</div></div>
      <div class="arrow">→</div>
      <div class="node"><div class="node-icon">💬</div><div class="node-title">Responde</div><div class="node-sub">FAQ automático</div></div>
      <div class="arrow">→</div>
      <div class="node"><div class="node-icon">📅</div><div class="node-title">Agenda</div><div class="node-sub">Qualificado → humano</div></div>
    </div>
    <div class="metrics">
      <div class="metric"><div class="metric-value">24h</div><div class="metric-label">Disponibilidade</div></div>
      <div class="metric"><div class="metric-value">1–2 sem</div><div class="metric-label">Para ficar pronto</div></div>
      <div class="metric"><div class="metric-value">Lean 1º</div><div class="metric-label">Processo mapeado antes</div></div>
    </div>
    </body></html>`
  },
  {
    name: 'smartops_terminal.png',
    width: 1200, height: 800,
    html: `<!DOCTYPE html><html><head><style>${BASE_CSS}
    body{width:1200px;height:800px;background:#06060e;overflow:hidden;}
    .bar{background:#0d0d1c;height:44px;display:flex;align-items:center;padding:0 20px;gap:8px;border-bottom:1px solid rgba(255,255,255,.07);}
    .dot{width:12px;height:12px;border-radius:50%;}
    .term{padding:36px;font-size:14px;line-height:1.9;}
    .prompt{color:#7c3aed;font-weight:700;}
    .cmd{color:#a78bfa;}
    .ok{color:#10b981;}
    .info{color:#8b8baa;}
    .warn{color:#fbbf24;}
    .dim{color:#13132a;font-size:12px;}
    </style></head><body>
    <div class="bar">
      <div class="dot" style="background:#f87171"></div>
      <div class="dot" style="background:#fbbf24"></div>
      <div class="dot" style="background:#10b981"></div>
      <span style="color:#8b8baa;font-size:13px;margin-left:8px;font-family:monospace">smartops-ia — pipeline · lean_q3_2026-05-28</span>
    </div>
    <div class="term" style="font-family:monospace">
      <div style="color:#13132a;font-size:12px">~ smartops-ia-pipeline</div>
      <div><span class="prompt">❯ </span><span class="cmd">node pipeline/worker.js</span></div>
      <div class="info">  Worker started. Listening on queue: ai-content-pipeline</div>
      <div><span class="ok">  ✓ research_agent</span> <span class="info">— Tavily: 5/5 searches complete</span></div>
      <div class="info">    data_source: tavily · SmartOps IA · Lean Six Sigma + Automação</div>
      <div><span class="ok">  ✓ ad_creative_designer</span> <span class="info">— instagram_ad.png (1080×1080)</span></div>
      <div><span class="ok">  ✓ copywriter_agent</span> <span class="info">— threads, instagram, youtube</span></div>
      <div><span class="ok">  ✓ video_ad_specialist</span> <span class="info">— ad.mp4 rendered (15s · Reels)</span></div>
      <div><span class="ok">  ✓ distribution_agent</span> <span class="info">— Supabase upload complete</span></div>
      <div style="margin-top:12px"><span style="color:#a78bfa;font-weight:700">  Pipeline complete ✓</span> <span class="info">— Publish lean_q3 2026-05-28.md ready</span></div>
      <div><span class="prompt">❯ </span><span style="color:#13132a">█</span></div>
    </div>
    </body></html>`
  },
];

async function createAssets() {
  console.log('\nCreating SmartOps IA brand assets...\n');
  const browser = await chromium.launch({ headless: true });

  for (const asset of ASSETS) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: asset.width, height: asset.height });
    await page.setContent(asset.html, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);

    const outPath = path.join(ASSETS_DIR, asset.name);
    await page.screenshot({
      path: outPath,
      clip: { x: 0, y: 0, width: asset.width, height: asset.height },
      type: 'png',
    });

    const size = (require('fs').statSync(outPath).size / 1024).toFixed(0);
    console.log(`  ✓ ${asset.name} (${size}KB)`);
    await page.close();
  }

  await browser.close();
  console.log(`\nAll SmartOps IA assets saved to: ${ASSETS_DIR}/\n`);
}

createAssets().catch(err => {
  console.error('Asset creation failed:', err.message);
  process.exit(1);
});
