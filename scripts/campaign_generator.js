require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const taskDate  = new Date().toISOString().split('T')[0];
const outputDir = path.join('outputs', `campaign_${taskDate}`);
const adsDir    = path.join(outputDir, 'ads');
const copyDir   = path.join(outputDir, 'copy');
const logsDir   = path.join(outputDir, 'logs');

[adsDir, copyDir, logsDir].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }

async function run() {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   SmartOps IA — Campaign Generator       ║');
  console.log(`║   ${taskDate}                          ║`);
  console.log('╚══════════════════════════════════════════╝\n');

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  const brand    = readFileSafe('knowledge/brand_identity.md');
  const product  = readFileSafe('knowledge/product_campaign.md');
  const personas = readFileSafe('knowledge/customer_personas.md');

  const client = new Anthropic();

  // ── PARTE 1: COPY GOOGLE ADS + META ADS ──────────────────────────────────
  console.log('1/3 — Gerando copy Google Ads + Meta Ads...');

  const copyResp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 6000,
    messages: [{ role: 'user', content: `Você é um especialista em copy de performance para Google Ads e Meta Ads.

## EMPRESA
SmartOps IA — consultoria Lean Six Sigma + Automação com IA para PMEs em BH/MG
Consultor: Breno Luiz — Black Belt Lean Six Sigma
Site: https://smartops-ia.com.br

## OFERTAS (3 — usar nas campanhas)
1. Diagnóstico Gratuito de 30 minutos — descobrir gargalos e desperdícios
2. Projeto Lean Six Sigma — eliminação de desperdícios, −30% custo, 4 semanas
3. Automação com IA — automatizar processos manuais com n8n e IA

## PÚBLICO-ALVO
Donos e gerentes de PMEs em BH/MG (indústria, varejo, serviços, logística)
Dores: retrabalho, processo lento, custo alto, equipe no improviso, WhatsApp caótico

## IDENTIDADE DE MARCA
${brand.slice(0, 400)}

## PRODUTO
${product.slice(0, 400)}

---

Gere uma campanha completa em formato de arquivo pronto para usar:

# CAMPANHA SMARTOPS IA — ${taskDate}

---

## GOOGLE ADS — SEARCH

### Campanha 1: Diagnóstico Gratuito (objetivo: lead)

**Grupo de Anúncios A: Consultoria Lean BH**

Keywords:
- consultoria lean six sigma belo horizonte [exata]
- consultoria lean bh [exata]
- melhoria de processos empresa bh [frase]
- lean six sigma empresa pequena [frase]
- consultoria processos belo horizonte [frase]

**Anúncio 1 (RSA):**
Headline 1 (30 car max):
Headline 2 (30 car max):
Headline 3 (30 car max):
Headline 4 (30 car max):
Headline 5 (30 car max):
Description 1 (90 car max):
Description 2 (90 car max):
URL final: https://smartops-ia.com.br/diagnostico-gratuito
Display path: smartops-ia.com.br/Diagnostico-Gratis

**Anúncio 2 (RSA) — ângulo dor:**
Headline 1:
Headline 2:
Headline 3:
Headline 4:
Headline 5:
Description 1:
Description 2:

**Anúncio 3 (RSA) — ângulo ROI:**
Headline 1:
Headline 2:
Headline 3:
Headline 4:
Headline 5:
Description 1:
Description 2:

---

**Grupo de Anúncios B: Automação com IA**

Keywords:
- automação de processos empresa [frase]
- consultoria automacao ia bh [frase]
- automatizar processos pequena empresa [frase]
- n8n consultoria [ampla modificada]

**Anúncio 1:**
Headline 1:
Headline 2:
Headline 3:
Description 1:
Description 2:

---

**Keywords negativas (para toda a campanha):**
[lista de 15 keywords negativas relevantes]

---

## META ADS

### Campanha 1: Diagnóstico Gratuito (conversão — objetivo: lead)

**Criativo 1 — Antes/Depois (melhor para consultoria B2B)**
Headline (40 car):
Primary text (corpo — até 250 car):
Descrição (30 car):
CTA: [Saiba mais / Fale conosco / Cadastre-se]

**Criativo 2 — Pergunta direta (alta CTR)**
Headline:
Primary text:
Descrição:
CTA:

**Criativo 3 — Prova social/números**
Headline:
Primary text:
Descrição:
CTA:

### Campanha 2: Retargeting (visitantes do site)
**Criativo retargeting:**
Headline:
Primary text:
Descrição:
CTA:

---

## ORÇAMENTO RECOMENDADO

| Canal | Budget/dia | Budget/mês | Objetivo |
|---|---|---|---|
| Google Ads Search | R$ X | R$ X | X leads/mês |
| Meta Ads Conversão | R$ X | R$ X | X leads/mês |
| Meta Ads Retargeting | R$ X | R$ X | Reconversão |
| **Total** | **R$ X** | **R$ X** | **X leads/mês** |

---

## CHECKLIST DE CONFIGURAÇÃO

### Google Ads
- [ ] Criar conta em ads.google.com
- [ ] Configurar conversão (clique no WhatsApp + formulário)
- [ ] Subir campanha Search com os 3 anúncios
- [ ] Configurar extensões: chamada, sitelinks, snippet estruturado
- [ ] Definir estratégia de lances: CPC manual → maximizar conversões após 30 conversões

### Meta Ads
- [ ] Meta Pixel ativo ✅ (já feito)
- [ ] Criar público personalizado: visitantes do site últimos 30 dias
- [ ] Criar público lookalike: 1% do público personalizado
- [ ] Subir campanhas com os 3 criativos
- [ ] Teste A/B: criativo 1 vs criativo 2

---

## MÉTRICAS PARA ACOMPANHAR

| Métrica | Meta Google | Meta Meta Ads |
|---|---|---|
| CTR | >3% | >1,5% |
| CPC | <R$ 5 | <R$ 2 |
| CPL (custo/lead) | <R$ 80 | <R$ 60 |
| Taxa conversão landing | >5% | >3% |
| Leads/mês | 10+ | 8+ |

Escreva copy REAL, não placeholder. Cada headline e description deve estar completo, específico e dentro do limite de caracteres. Foco em conversão para PMEs em BH.` }],
  });

  const copyMD = copyResp.content[0].text;
  fs.writeFileSync(path.join(copyDir, 'campaign_copy.md'), copyMD);
  console.log('  ✓ Copy salvo');

  // ── PARTE 2: LAYOUT DO AD (imagem) ───────────────────────────────────────
  console.log('2/3 — Gerando layout do anúncio visual...');

  const layoutResp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{ role: 'user', content: `Gere um JSON de layout para um anúncio visual da SmartOps IA (1080x1080px).

Tema: campanha de captação de leads — Diagnóstico Gratuito
Empresa: SmartOps IA — Lean Six Sigma + Automação com IA para PMEs em BH
Consultor: Breno Luiz — Black Belt

Design tokens:
- Background: #0A0A0F
- Card: #0B0F17
- Border: #1F2937
- Acento principal: #7C3AED (roxo)
- Acento secundário: #10B981 (verde)
- Texto: #F9FAFB
- Fonte headline: Bebas Neue
- Fonte body: Inter

O anúncio deve ter:
- Badge de urgência ou credencial (ex: "Black Belt Lean Six Sigma")
- Headline forte de dor ou resultado (ex: "Sua empresa perde R$ X todo mês sem perceber")
- Subheadline com a solução
- 3 bullets de benefício concreto com ícone
- CTA claro ("Diagnóstico Gratuito — 30 minutos")
- URL: smartops-ia.com.br
- Logo/nome SmartOps IA

Responda APENAS com o JSON no seguinte formato:
{
  "task": "campaign_ad",
  "date": "${taskDate}",
  "badge": "texto do badge",
  "headline": "headline principal",
  "subheadline": "subheadline",
  "bullets": ["bullet 1", "bullet 2", "bullet 3"],
  "cta": "texto do botão",
  "cta_sub": "texto abaixo do botão",
  "url": "smartops-ia.com.br",
  "accent_color": "#7C3AED",
  "accent_secondary": "#10B981"
}` }],
  });

  let layout = {};
  try {
    const jsonMatch = layoutResp.content[0].text.match(/\{[\s\S]*\}/);
    if (jsonMatch) layout = JSON.parse(jsonMatch[0]);
  } catch { layout = {
    task: 'campaign_ad', date: taskDate,
    badge: 'Black Belt Lean Six Sigma • BH/MG',
    headline: 'Sua empresa perde dinheiro todo mês sem perceber',
    subheadline: 'Lean Six Sigma + Automação com IA elimina gargalos em 4 semanas',
    bullets: ['−30% custo operacional comprovado', 'Processos automatizados com IA', 'Diagnóstico gratuito de 30 minutos'],
    cta: 'Quero meu diagnóstico grátis',
    cta_sub: 'Sem compromisso • Presencial em BH',
    url: 'smartops-ia.com.br',
    accent_color: '#7C3AED',
    accent_secondary: '#10B981',
  }; }

  fs.writeFileSync(path.join(adsDir, 'layout.json'), JSON.stringify(layout, null, 2));
  console.log('  ✓ Layout gerado');

  // ── PARTE 3: RENDERIZAR IMAGEM ────────────────────────────────────────────
  console.log('3/3 — Renderizando imagem do anúncio...');

  // Gera HTML do ad
  try {
    execFileSync('node', ['scripts/build_ad_html.js',
      '--task', 'campaign',
      '--date', taskDate,
    ], { cwd: process.cwd(), env: process.env, stdio: 'pipe' });

    // Renderiza PNG
    execFileSync('node', ['scripts/render_ad.js',
      '--task', 'campaign',
      '--date', taskDate,
    ], { cwd: process.cwd(), env: process.env, stdio: 'pipe' });

    console.log('  ✓ Imagem renderizada');
  } catch (e) {
    console.log('  ⚠️  Render via pipeline falhou — gerando HTML standalone...');
    // Gera HTML standalone como fallback
    const html = buildAdHtml(layout);
    fs.writeFileSync(path.join(adsDir, 'ad.html'), html);
    console.log('  ✓ HTML do anúncio salvo (abra no navegador para visualizar)');
  }

  // ── RESUMO ────────────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   Campanha gerada com sucesso! ✅         ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  📝 Copy:   ${path.join(copyDir, 'campaign_copy.md').slice(0,35)}... ║`);
  console.log(`║  🖼️  Layout: ${path.join(adsDir, 'layout.json').slice(0,35)}...    ║`);
  console.log(`║  📁 Pasta:  ${outputDir.slice(0,38)}...  ║`);
  console.log('╚══════════════════════════════════════════╝\n');
}

function buildAdHtml(layout) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1080px; height: 1080px; background: #0A0A0F; display: flex; align-items: center; justify-content: center; font-family: Inter, sans-serif; }
  .ad { width: 1020px; height: 1020px; background: #0B0F17; border: 1px solid #1F2937; border-radius: 24px; padding: 60px; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; }
  .glow { position: absolute; top: -200px; left: -200px; width: 600px; height: 600px; background: radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%); pointer-events: none; }
  .glow2 { position: absolute; bottom: -150px; right: -100px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%); pointer-events: none; }
  .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.4); color: #A78BFA; padding: 8px 20px; border-radius: 99px; font-size: 16px; font-weight: 600; width: fit-content; }
  .badge::before { content: '⚡'; }
  .headline { font-family: 'Bebas Neue', sans-serif; font-size: 72px; line-height: 1.05; color: #F9FAFB; letter-spacing: 1px; margin-top: 24px; }
  .headline span { color: #7C3AED; }
  .sub { font-size: 22px; color: #9CA3AF; line-height: 1.5; margin-top: 16px; max-width: 800px; }
  .bullets { display: flex; flex-direction: column; gap: 16px; margin-top: 32px; }
  .bullet { display: flex; align-items: center; gap: 16px; font-size: 20px; color: #F9FAFB; }
  .bullet-icon { width: 36px; height: 36px; background: rgba(16,185,129,0.15); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .cta-area { display: flex; align-items: center; justify-content: space-between; margin-top: 40px; }
  .cta-btn { background: linear-gradient(135deg, #7C3AED, #6D28D9); color: #fff; font-size: 22px; font-weight: 700; padding: 20px 48px; border-radius: 12px; border: none; }
  .cta-right { text-align: right; }
  .cta-sub { font-size: 15px; color: #6B7280; margin-top: 8px; }
  .url { font-size: 17px; color: #7C3AED; font-weight: 600; margin-top: 4px; }
  .logo { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: #F9FAFB; letter-spacing: 2px; }
  .logo span { color: #7C3AED; }
</style>
</head>
<body>
<div class="ad">
  <div class="glow"></div>
  <div class="glow2"></div>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div class="badge">${layout.badge || 'Black Belt Lean Six Sigma • BH/MG'}</div>
      <div class="logo">Smart<span>Ops</span> IA</div>
    </div>
    <div class="headline">${(layout.headline || '').replace(/R\$\s*\d+/g, m => `<span>${m}</span>`)}</div>
    <div class="sub">${layout.subheadline || ''}</div>
    <div class="bullets">
      ${(layout.bullets || []).map(b => `<div class="bullet"><div class="bullet-icon">✓</div>${b}</div>`).join('')}
    </div>
  </div>
  <div class="cta-area">
    <div class="cta-btn">${layout.cta || 'Diagnóstico Gratuito →'}</div>
    <div class="cta-right">
      <div class="url">🌐 ${layout.url || 'smartops-ia.com.br'}</div>
      <div class="cta-sub">${layout.cta_sub || 'Sem compromisso • Presencial em BH'}</div>
    </div>
  </div>
</div>
</body>
</html>`;
}

run().catch(err => { console.error('Erro:', err.message); process.exit(1); });
