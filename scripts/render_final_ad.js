require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const taskDate = new Date().toISOString().split('T')[0];
const outDir = path.join('outputs', `campaign_${taskDate}`, 'final');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const adHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;600;700;800;900&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }

  body {
    width: 1080px;
    height: 1080px;
    font-family: Inter, sans-serif;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* ── TOPO ── */
  .top-bar {
    height: 56px;
    background: #0A0A0F;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    flex-shrink: 0;
    z-index: 10;
  }
  .brand {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 26px;
    letter-spacing: 3px;
    color: #fff;
  }
  .brand span { color: #7C3AED; }
  .tag-line {
    font-size: 11px;
    color: #6B7280;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  /* ── SPLIT ── */
  .split {
    flex: 1;
    display: flex;
  }

  .side {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 36px 44px;
    position: relative;
    overflow: hidden;
  }

  /* LADO ESQUERDO — DOR */
  .left {
    background: #0F0505;
  }
  .left::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at top left, rgba(180,0,0,0.25) 0%, transparent 65%);
    pointer-events: none;
  }

  /* LADO DIREITO — SOLUÇÃO */
  .right {
    background: #030F06;
  }
  .right::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at top right, rgba(0,160,60,0.2) 0%, transparent 65%);
    pointer-events: none;
  }

  /* Labels */
  .side-label {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 4px;
    text-transform: uppercase;
    padding: 5px 12px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    width: fit-content;
    margin-bottom: 20px;
    border-radius: 2px;
  }
  .label-bad { background: rgba(200,0,0,0.2); color: #FF6B6B; border: 1px solid rgba(200,0,0,0.4); }
  .label-good { background: rgba(0,160,60,0.15); color: #4ADE80; border: 1px solid rgba(0,160,60,0.4); }

  /* Headlines */
  .side-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 58px;
    line-height: 0.95;
    letter-spacing: 1px;
    margin-bottom: 28px;
  }
  .left .side-title { color: #FF4444; }
  .right .side-title { color: #22C55E; }

  /* Items */
  .items { display: flex; flex-direction: column; gap: 10px; flex: 1; }

  .item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 14px;
    border-radius: 6px;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.3;
  }
  .item-bad {
    background: rgba(180,0,0,0.12);
    border: 1px solid rgba(180,0,0,0.2);
    color: #FCA5A5;
  }
  .item-good {
    background: rgba(0,160,60,0.1);
    border: 1px solid rgba(0,160,60,0.2);
    color: #86EFAC;
  }
  .item-icon {
    font-size: 18px;
    flex-shrink: 0;
    width: 28px;
    text-align: center;
  }

  /* Números de impacto */
  .impact {
    margin-top: 20px;
    padding: 16px 18px;
    border-radius: 8px;
  }
  .impact-bad { background: rgba(180,0,0,0.15); border: 1px solid rgba(180,0,0,0.3); }
  .impact-good { background: rgba(0,160,60,0.12); border: 1px solid rgba(0,160,60,0.3); }
  .impact-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 56px;
    line-height: 1;
    letter-spacing: -1px;
  }
  .impact-bad .impact-num { color: #FF4444; }
  .impact-good .impact-num { color: #22C55E; }
  .impact-label {
    font-size: 13px;
    font-weight: 600;
    margin-top: 2px;
  }
  .impact-bad .impact-label { color: #FCA5A5; }
  .impact-good .impact-label { color: #86EFAC; }

  /* Divisor central */
  .divider {
    width: 4px;
    background: linear-gradient(to bottom, #7C3AED, #10B981);
    position: relative;
    z-index: 10;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .vs-badge {
    background: #0A0A0F;
    border: 2px solid #7C3AED;
    color: #fff;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    letter-spacing: 1px;
    flex-shrink: 0;
  }

  /* ── RODAPÉ ── */
  .bottom {
    height: 80px;
    background: #0A0A0F;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    flex-shrink: 0;
    border-top: 1px solid #1F2937;
  }
  .bottom-left { display: flex; flex-direction: column; gap: 3px; }
  .bottom-tagline { font-size: 13px; color: #6B7280; }
  .bottom-url { font-size: 14px; color: #7C3AED; font-weight: 700; }
  .cta-btn {
    background: linear-gradient(135deg, #7C3AED, #6D28D9);
    color: #fff;
    font-size: 17px;
    font-weight: 800;
    padding: 16px 36px;
    border-radius: 4px;
    letter-spacing: 0.3px;
    white-space: nowrap;
  }
  .cta-sub {
    font-size: 11px;
    color: #6B7280;
    text-align: center;
    margin-top: 4px;
  }
</style>
</head>
<body>

<!-- Topo -->
<div class="top-bar">
  <div class="brand">Smart<span>Ops</span> IA</div>
  <div class="tag-line">Lean Six Sigma + Automação com IA · BH/MG</div>
</div>

<!-- Split -->
<div class="split">

  <!-- Esquerda — Dor -->
  <div class="side left">
    <div class="side-label label-bad">🔴 Sua empresa hoje</div>
    <div class="side-title">Caos<br>controlado</div>
    <div class="items">
      <div class="item item-bad"><span class="item-icon">😤</span>Retrabalho todo dia, sem fim</div>
      <div class="item item-bad"><span class="item-icon">📱</span>Equipe no WhatsApp 24 horas</div>
      <div class="item item-bad"><span class="item-icon">📄</span>Processo que só o dono sabe</div>
      <div class="item item-bad"><span class="item-icon">📦</span>Estoque parado = dinheiro parado</div>
      <div class="item item-bad"><span class="item-icon">🎲</span>Decisão no feeling, sem dados</div>
      <div class="item item-bad"><span class="item-icon">📉</span>Cresceu, mas a margem caiu</div>
    </div>
    <div class="impact impact-bad">
      <div class="impact-num">−R$47mil</div>
      <div class="impact-label">desperdiçado por mês em média</div>
    </div>
  </div>

  <!-- Divisor -->
  <div class="divider">
    <div class="vs-badge">VS</div>
  </div>

  <!-- Direita — Solução -->
  <div class="side right">
    <div class="side-label label-good">✅ Após SmartOps IA</div>
    <div class="side-title">Processo<br>que escala</div>
    <div class="items">
      <div class="item item-good"><span class="item-icon">🔧</span>Processos mapeados e padronizados</div>
      <div class="item item-good"><span class="item-icon">🤖</span>IA elimina tarefas repetitivas</div>
      <div class="item item-good"><span class="item-icon">📊</span>Dashboard com dados em tempo real</div>
      <div class="item item-good"><span class="item-icon">📈</span>Estoque calibrado, zero parado</div>
      <div class="item item-good"><span class="item-icon">🎯</span>Equipe foca no que gera valor</div>
      <div class="item item-good"><span class="item-icon">💰</span>Margem aumenta junto com receita</div>
    </div>
    <div class="impact impact-good">
      <div class="impact-num">−30% custo</div>
      <div class="impact-label">em 4 semanas · método comprovado</div>
    </div>
  </div>

</div>

<!-- Rodapé -->
<div class="bottom">
  <div class="bottom-left">
    <div class="bottom-tagline">Breno Luiz · Black Belt Lean Six Sigma · Presencial BH/MG</div>
    <div class="bottom-url">smartops-ia.com.br</div>
  </div>
  <div>
    <div class="cta-btn">→ Diagnóstico Gratuito — 30 min</div>
    <div class="cta-sub">Sem compromisso · Sem enrolação</div>
  </div>
</div>

</body>
</html>`;

async function render() {
  console.log('\nSmartOps IA — Renderizando versão final...');

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1080, height: 1080 });
  await page.setContent(adHtml, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const file = path.join(outDir, 'ad_final_1080x1080.png');
  await page.screenshot({ path: file, type: 'png' });

  // Versão 1200x628 para Google Display e Facebook link
  await page.setViewportSize({ width: 1200, height: 628 });
  await page.setContent(adHtml.replace('height: 1080px', 'height: 628px').replace('width: 1080px', 'width: 1200px'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const file2 = path.join(outDir, 'ad_final_1200x628.png');
  await page.screenshot({ path: file2, type: 'png' });

  await browser.close();

  // Salva HTML também
  fs.writeFileSync(path.join(outDir, 'ad_final.html'), adHtml);

  console.log(`  ✓ 1080x1080: ${file}`);
  console.log(`  ✓ 1200x628:  ${file2}`);
  console.log(`  ✓ HTML:      ${path.join(outDir, 'ad_final.html')}`);
  console.log('\n✅ Pronto para subir no Meta Ads e Google Display!\n');
}

render().catch(err => { console.error('Erro:', err.message); process.exit(1); });
