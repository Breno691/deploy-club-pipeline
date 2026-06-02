require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const taskDate = new Date().toISOString().split('T')[0];
const outDir = path.join('outputs', `campaign_${taskDate}`, 'concepts');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// ── CONCEITO 1: NOTA FISCAL DO DESPERDÍCIO ────────────────────────────────
const concept1 = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Inter:wght@400;600;700;900&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:1080px; height:1080px; background:#F5F0E8; display:flex; align-items:center; justify-content:center; font-family:Inter,sans-serif; }
  .receipt { width:680px; background:#fff; padding:48px; box-shadow: 8px 8px 0px #000; border:2px solid #000; position:relative; }
  .receipt::before { content:''; position:absolute; bottom:-16px; left:-2px; right:-16px; height:16px; background:#000; }
  .header { text-align:center; border-bottom:2px dashed #000; padding-bottom:24px; margin-bottom:24px; }
  .company { font-family:'Courier Prime',monospace; font-size:13px; color:#666; letter-spacing:2px; text-transform:uppercase; }
  .receipt-title { font-size:11px; color:#999; font-family:'Courier Prime',monospace; letter-spacing:3px; margin-top:4px; }
  .doc-num { font-size:11px; color:#999; font-family:'Courier Prime',monospace; margin-top:8px; }
  .items { border-bottom:2px dashed #000; padding-bottom:20px; margin-bottom:20px; }
  .item { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px dotted #ccc; }
  .item:last-child { border:none; }
  .item-name { font-family:'Courier Prime',monospace; font-size:15px; }
  .item-val { font-family:'Courier Prime',monospace; font-size:15px; font-weight:700; color:#CC0000; }
  .total-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
  .total-label { font-family:'Courier Prime',monospace; font-size:13px; letter-spacing:2px; text-transform:uppercase; color:#666; }
  .total-val { font-family:'Courier Prime',monospace; font-size:13px; color:#CC0000; }
  .grand-total { display:flex; justify-content:space-between; align-items:center; background:#000; padding:12px 16px; margin:0 -4px; }
  .grand-label { font-family:'Courier Prime',monospace; font-size:18px; color:#fff; letter-spacing:2px; text-transform:uppercase; }
  .grand-val { font-family:'Courier Prime',monospace; font-size:22px; color:#FF4444; font-weight:700; }
  .cta-area { margin-top:28px; text-align:center; }
  .cta-question { font-size:14px; color:#666; font-family:'Courier Prime',monospace; margin-bottom:12px; letter-spacing:1px; }
  .cta-btn { display:inline-block; background:#000; color:#fff; font-size:18px; font-weight:800; padding:16px 40px; letter-spacing:1px; }
  .cta-sub { font-size:11px; color:#999; margin-top:8px; font-family:'Courier Prime',monospace; letter-spacing:1px; }
  .stamp { position:absolute; top:40px; right:40px; border:4px solid #CC0000; color:#CC0000; padding:8px 16px; font-size:20px; font-weight:900; letter-spacing:2px; transform:rotate(-15deg); opacity:0.8; }
  .bottom { position:absolute; bottom:24px; left:0; right:0; text-align:center; }
  .smartops { font-size:12px; font-weight:800; letter-spacing:3px; color:#7C3AED; text-transform:uppercase; }
  .tagline { font-size:10px; color:#999; font-family:'Courier Prime',monospace; margin-top:2px; }
</style>
</head>
<body>
<div style="position:relative">
<div class="receipt">
  <div class="stamp">EVITÁVEL</div>
  <div class="header">
    <div class="company">Nota de Desperdício</div>
    <div class="receipt-title">o que sua empresa paga todo mês sem perceber</div>
    <div class="doc-num">Emitido para: Dono de PME em BH/MG</div>
  </div>
  <div class="items">
    <div class="item"><span class="item-name">Retrabalho de produção</span><span class="item-val">R$ 8.400/mês</span></div>
    <div class="item"><span class="item-name">Equipe no improviso</span><span class="item-val">R$ 11.200/mês</span></div>
    <div class="item"><span class="item-name">Processo parado esperando</span><span class="item-val">R$ 9.600/mês</span></div>
    <div class="item"><span class="item-name">WhatsApp caótico</span><span class="item-val">R$ 4.800/mês</span></div>
    <div class="item"><span class="item-name">Estoque parado (capital)</span><span class="item-val">R$ 7.300/mês</span></div>
    <div class="item"><span class="item-name">Rejeito e defeito</span><span class="item-val">R$ 5.900/mês</span></div>
  </div>
  <div class="total-row"><span class="total-label">Subtotal mensal</span><span class="total-val">R$ 47.200</span></div>
  <div class="total-row"><span class="total-label">× 12 meses/ano</span><span class="total-val">R$ 566.400</span></div>
  <div class="grand-total">
    <span class="grand-label">Total desperdiçado</span>
    <span class="grand-val">R$ 566.400/ano</span>
  </div>
  <div class="cta-area">
    <div class="cta-question">* Valores médios para PMEs em BH. E na sua empresa?</div>
    <div class="cta-btn">→ Diagnóstico Gratuito em 30 min</div>
    <div class="cta-sub">smartops-ia.com.br · Lean Six Sigma + IA · Black Belt BH</div>
  </div>
</div>
<div class="bottom" style="position:relative;margin-top:20px">
  <div class="smartops">SmartOps IA</div>
  <div class="tagline">Lean Six Sigma + Automação com IA para PMEs em Belo Horizonte</div>
</div>
</div>
</body>
</html>`;

// ── CONCEITO 2: ANTES/DEPOIS — CAOS VS ORDEM ─────────────────────────────
const concept2 = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;600;700;900&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:1080px; height:1080px; display:flex; font-family:Inter,sans-serif; }
  .side { flex:1; padding:48px; display:flex; flex-direction:column; justify-content:space-between; position:relative; overflow:hidden; }
  .left { background:#1A0505; }
  .right { background:#021A0A; }
  .tag { font-size:11px; font-weight:800; letter-spacing:4px; text-transform:uppercase; padding:6px 14px; display:inline-block; margin-bottom:24px; }
  .tag-bad { background:#CC0000; color:#fff; }
  .tag-good { background:#00AA44; color:#fff; }
  h2 { font-family:'Bebas Neue',sans-serif; font-size:52px; line-height:1; margin-bottom:20px; }
  .left h2 { color:#FF6B6B; }
  .right h2 { color:#4ADE80; }
  .chaos-items, .order-items { display:flex; flex-direction:column; gap:10px; flex:1; }
  .chaos-item { background:rgba(204,0,0,0.15); border-left:3px solid #CC0000; padding:10px 14px; font-size:14px; color:#FFB3B3; display:flex; align-items:center; gap:10px; }
  .order-item { background:rgba(0,170,68,0.12); border-left:3px solid #00AA44; padding:10px 14px; font-size:14px; color:#86EFAC; display:flex; align-items:center; gap:10px; }
  .chaos-item span { font-size:18px; }
  .order-item span { font-size:18px; }
  .divider { width:6px; background:#fff; position:relative; z-index:10; display:flex; align-items:center; justify-content:center; }
  .vs { background:#fff; color:#000; font-family:'Bebas Neue',sans-serif; font-size:24px; padding:12px 6px; writing-mode:vertical-rl; letter-spacing:4px; }
  .bottom-cta { background:#000; margin:0 -48px -48px; padding:20px 48px; display:flex; align-items:center; justify-content:space-between; }
  .cta-text { font-size:14px; color:#fff; font-weight:600; }
  .cta-text strong { color:#A78BFA; font-size:18px; display:block; margin-bottom:2px; }
  .cta-btn { background:#7C3AED; color:#fff; font-size:16px; font-weight:800; padding:14px 28px; white-space:nowrap; }
  .noise { position:absolute; top:0; left:0; right:0; bottom:0; opacity:0.03; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
</style>
</head>
<body>
<div class="side left">
  <div class="noise"></div>
  <div>
    <div class="tag tag-bad">Sua empresa hoje</div>
    <h2>Caos controlado</h2>
    <div class="chaos-items">
      <div class="chaos-item"><span>🔴</span> Retrabalho todo dia sem parar</div>
      <div class="chaos-item"><span>🔴</span> Equipe no WhatsApp 24h</div>
      <div class="chaos-item"><span>🔴</span> Processo que ninguém documentou</div>
      <div class="chaos-item"><span>🔴</span> Estoque parado = dinheiro parado</div>
      <div class="chaos-item"><span>🔴</span> Decisões no feeling, sem dados</div>
      <div class="chaos-item"><span>🔴</span> Cresceu mas a margem caiu</div>
    </div>
  </div>
  <div class="bottom-cta" style="background:transparent;padding:0;margin:0;flex-direction:column;align-items:flex-start;gap:4px">
    <div style="font-size:48px;font-weight:900;color:#CC0000;font-family:'Bebas Neue',sans-serif">−R$47mil</div>
    <div style="font-size:13px;color:#FF6B6B">desperdiçado por mês em média</div>
  </div>
</div>

<div class="divider"><div class="vs">VS</div></div>

<div class="side right">
  <div>
    <div class="tag tag-good">Após SmartOps IA</div>
    <h2>Processo que escala</h2>
    <div class="order-items">
      <div class="order-item"><span>✅</span> Processos mapeados e padronizados</div>
      <div class="order-item"><span>✅</span> Automação elimina tarefas manuais</div>
      <div class="order-item"><span>✅</span> Equipe foca no que gera valor</div>
      <div class="order-item"><span>✅</span> Estoque calibrado, zero parado</div>
      <div class="order-item"><span>✅</span> Dados em tempo real — dashboard</div>
      <div class="order-item"><span>✅</span> Crescimento com margem preservada</div>
    </div>
  </div>
  <div style="flex-direction:column;align-items:flex-start;gap:4px">
    <div style="font-size:48px;font-weight:900;color:#00AA44;font-family:'Bebas Neue',sans-serif">−30%</div>
    <div style="font-size:13px;color:#86EFAC">custo operacional em 4 semanas</div>
  </div>
</div>

<div style="position:absolute;bottom:0;left:0;right:0;background:#000;padding:16px 40px;display:flex;align-items:center;justify-content:space-between;z-index:20">
  <div>
    <div style="font-size:20px;font-weight:900;color:#A78BFA;font-family:'Bebas Neue',sans-serif;letter-spacing:2px">SmartOps IA · Lean Six Sigma + Automação com IA</div>
    <div style="font-size:12px;color:#6B7280;margin-top:2px">Black Belt · Presencial em BH/MG · smartops-ia.com.br</div>
  </div>
  <div style="background:#7C3AED;color:#fff;font-size:15px;font-weight:800;padding:14px 28px">Diagnóstico Grátis →</div>
</div>
</body>
</html>`;

// ── CONCEITO 3: TIPOGRAFIA PURA — NÚMERO GIGANTE ─────────────────────────
const concept3 = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;900&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:1080px; height:1080px; background:#FAFAFA; display:flex; flex-direction:column; font-family:Inter,sans-serif; position:relative; overflow:hidden; }
  .accent-bar { height:10px; background:linear-gradient(90deg, #7C3AED, #10B981); }
  .main { flex:1; display:flex; flex-direction:column; justify-content:center; padding:60px 72px; }
  .eyebrow { font-size:13px; font-weight:700; letter-spacing:4px; text-transform:uppercase; color:#7C3AED; margin-bottom:16px; }
  .big-number { font-family:'Bebas Neue',sans-serif; font-size:220px; line-height:0.9; color:#0A0A0F; letter-spacing:-4px; }
  .big-label { font-size:28px; font-weight:900; color:#0A0A0F; margin-top:8px; letter-spacing:-0.5px; }
  .big-sub { font-size:18px; color:#6B7280; margin-top:12px; max-width:640px; line-height:1.5; }
  .big-sub strong { color:#0A0A0F; }
  .separator { width:80px; height:4px; background:#7C3AED; margin:32px 0; }
  .pills { display:flex; gap:12px; flex-wrap:wrap; }
  .pill { background:#0A0A0F; color:#fff; padding:10px 20px; font-size:14px; font-weight:600; border-radius:2px; }
  .pill.purple { background:#7C3AED; }
  .pill.green { background:#10B981; }
  .bottom { padding:28px 72px; border-top:2px solid #E5E7EB; display:flex; align-items:center; justify-content:space-between; }
  .brand { font-family:'Bebas Neue',sans-serif; font-size:32px; letter-spacing:3px; color:#0A0A0F; }
  .brand span { color:#7C3AED; }
  .cta { background:#0A0A0F; color:#fff; font-size:17px; font-weight:800; padding:18px 40px; letter-spacing:0.5px; }
  .watermark { position:absolute; right:-60px; top:50%; transform:translateY(-50%) rotate(90deg); font-family:'Bebas Neue',sans-serif; font-size:200px; color:rgba(124,58,237,0.04); letter-spacing:10px; white-space:nowrap; pointer-events:none; }
</style>
</head>
<body>
<div class="accent-bar"></div>
<div class="watermark">LEAN SIX SIGMA</div>
<div class="main">
  <div class="eyebrow">⚡ Sua empresa está perdendo</div>
  <div class="big-number">47mil</div>
  <div class="big-label">reais por mês com processos ruins</div>
  <div class="big-sub">
    Retrabalho, espera, improviso e WhatsApp caótico custam isso — ou mais.<br>
    <strong>Em 4 semanas, a SmartOps IA elimina esses desperdícios.</strong>
  </div>
  <div class="separator"></div>
  <div class="pills">
    <div class="pill purple">Lean Six Sigma</div>
    <div class="pill green">Automação com IA</div>
    <div class="pill">Black Belt</div>
    <div class="pill">Presencial BH/MG</div>
    <div class="pill">−30% custo garantido</div>
  </div>
</div>
<div class="bottom">
  <div>
    <div class="brand">Smart<span>Ops</span> IA</div>
    <div style="font-size:13px;color:#6B7280;margin-top:4px">smartops-ia.com.br · Breno Luiz · Black Belt</div>
  </div>
  <div class="cta">Diagnóstico Gratuito — 30 min</div>
</div>
</body>
</html>`;

async function render() {
  console.log('\nSmartOps IA — Renderizando 3 conceitos criativos...\n');

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1080, height: 1080 });

  const concepts = [
    { name: 'conceito1_nota_fiscal', html: concept1 },
    { name: 'conceito2_antes_depois', html: concept2 },
    { name: 'conceito3_numero_gigante', html: concept3 },
  ];

  for (const c of concepts) {
    await page.setContent(c.html, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const file = path.join(outDir, `${c.name}.png`);
    await page.screenshot({ path: file, type: 'png' });
    console.log(`  ✓ ${c.name}.png`);
  }

  await browser.close();
  console.log(`\n✅ 3 conceitos salvos em: ${outDir}\n`);
}

render().catch(err => { console.error('Erro:', err.message); process.exit(1); });
