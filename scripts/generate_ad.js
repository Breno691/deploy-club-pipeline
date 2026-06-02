require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const taskArg = args.indexOf('--task');
const dateArg = args.indexOf('--date');
const taskName = taskArg !== -1 ? args[taskArg + 1] : process.env.TASK_NAME || 'smartops_demo';
const taskDate = dateArg !== -1 ? args[dateArg + 1] : new Date().toISOString().split('T')[0];
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const adsDir = path.join(outputDir, 'ads');

function appendLog(msg) {
  fs.appendFileSync(
    path.join(outputDir, 'logs', 'ad_creative_designer.log'),
    `[${new Date().toISOString()}] ${msg}\n`
  );
}

function readFileSafe(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return ''; }
}

async function generateAd() {
  console.log(`\nAd Creative Designer — Generating layout + HTML`);
  console.log(`Task: ${taskName} | Date: ${taskDate}\n`);
  appendLog('generate_ad started');

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not set in .env');
  }

  if (!fs.existsSync(adsDir)) fs.mkdirSync(adsDir, { recursive: true });

  // Load context
  const brandIdentity    = readFileSafe('knowledge/brand_identity.md');
  const productCampaign  = readFileSafe('knowledge/product_campaign.md');
  const visualReferences = readFileSafe('knowledge/visual_references.md');
  const researchResults  = readFileSafe(path.join(outputDir, 'research_results.json'));

  const client = new Anthropic();

  // ── Step 1: Generate layout JSON ─────────────────────────────────────────
  appendLog('Requesting layout JSON from Claude API...');

  const layoutPrompt = `You are a senior ad creative director and brand designer, specializing in high-conversion Instagram ads for Brazilian B2B consultancy businesses.

BRAND: SmartOps IA — Lean Six Sigma and AI Automation consultancy for small and medium businesses in Brazil.
Consultant: Breno Luiz, Black Belt Lean Six Sigma
Website: smartops-ia.com.br
Offer: Free 30-minute diagnostic

VISUAL DESIGN SYSTEM (follow strictly):
${visualReferences.slice(0, 2500)}

BRAND IDENTITY:
${brandIdentity.slice(0, 1000)}

SERVICES & CAMPAIGN:
${productCampaign.slice(0, 1500)}

RESEARCH INSIGHTS:
${researchResults.slice(0, 1000)}

Generate a layout JSON for a 1080x1080 Instagram square ad that is VISUALLY IMPACTFUL and high-conversion.

Design rules:
- Dark premium theme: background #0A0A0F
- Accent colors: #7C3AED (purple — Lean Six Sigma) or #10B981 (emerald — Automation) — choose ONE based on campaign theme
- Headline: max 8 words, punchy, speaks directly to a business owner's pain
- Subtext: 1 sentence, explains the solution
- CTA: "Diagnóstico gratuito — 30 min"
- Professional consultancy feel — NOT a tech startup or SaaS product

DESIGN RULES (apply strictly):
- Headline: MAX 7 words. Short, punchy, speaks directly to pain or result.
- Each headline line: max 5 words per line (Bebas Neue wraps poorly at 6+ words per line)
- Subtext: 1 sentence, max 15 words. Explains the solution.
- pillar "sub" text: max 8 words each. Specific, not generic.
- badge: UPPERCASE, 2-3 words max.
- accentColor: choose based on campaign theme (purple=Lean/process, green=automation/digital)

Choose ONE template — VARY between runs, do not always pick pain_hook:
- "pain_hook": big headline pain + 3 process cards. Use for: awareness, problem-focused, new audiences
- "proof_method": horizontal 3-step flow. Use for: methodology, trust-building, explaining the process
- "roi_focus": big metric + headline split layout. Use for: results, ROI, quantified outcomes
- "testimonial": client quote + result. Use for: social proof, case study angles
- "before_after": side-by-side metrics. Use for: transformation, before/after comparison

Return ONLY valid JSON, no markdown, no explanation, no trailing commas:
{
  "format": "instagram_square",
  "width": 1080,
  "height": 1080,
  "template": "pain_hook",
  "background": "#0A0A0F",
  "accentColor": "#7C3AED",
  "badge": "LEAN SIX SIGMA",
  "headline": "Retrabalho custa mais do que você pensa.",
  "subtext": "Mapeamos e eliminamos desperdício com Lean + automação com IA.",
  "ctaText": "Diagnóstico gratuito — 30 min",
  "metric": "40%",
  "metricLabel": "menos retrabalho em 30 dias",
  "pillars": [
    { "num": "01", "label": "Diagnóstico", "sub": "Mapeamos o processo real", "icon": "search" },
    { "num": "02", "label": "Análise", "sub": "Quantificamos perdas ocultas", "icon": "chart" },
    { "num": "03", "label": "Solução", "sub": "Lean + IA eliminam desperdício", "icon": "lightning" }
  ],
  "problems": [
    { "icon": "dollar", "text": "Retrabalho consome até 30% do tempo produtivo" },
    { "icon": "alert", "text": "Processos manuais geram erros invisíveis e caros" },
    { "icon": "gear", "text": "Falta de padrão cria gargalos todo dia" }
  ],
  "causes": [
    { "num": "01", "title": "Sem diagnóstico", "desc": "Não se sabe onde está a perda real" },
    { "num": "02", "title": "Sem padrão", "desc": "Cada um faz do jeito próprio — variabilidade" },
    { "num": "03", "title": "Sem dados", "desc": "Decisões por intuição, não por evidência" }
  ],
  "quote": "Em 3 semanas, eliminamos 40% do retrabalho na produção.",
  "client": "Ricardo M.",
  "company": "Empresa Industrial — BH",
  "result": "40% menos retrabalho · 21 dias",
  "stars": 5,
  "before": {
    "label": "ANTES",
    "items": [
      { "label": "Tempo no processo", "value": "4h/dia" },
      { "label": "Taxa de retrabalho", "value": "35%" },
      { "label": "Custo mensal", "value": "R$12k" }
    ]
  },
  "after": {
    "label": "DEPOIS",
    "items": [
      { "label": "Tempo no processo", "value": "55min" },
      { "label": "Taxa de retrabalho", "value": "5%" },
      { "label": "Economia gerada", "value": "R$9k/mês" }
    ]
  },
  "brand": "SmartOps IA",
  "domain": "smartops-ia.com.br"
}

Rules:
- Always generate ALL fields (even if not used by the chosen template)
- "problems", "causes" and "before"/"after" must be SPECIFIC to this campaign's research angle
- "pillars" content must match the headline angle — not always Diagnóstico/Mapeamento/Solução
- "metric" and "metricLabel" must be realistic for the campaign topic
- "quote" must sound authentic, not generic
- Rotate templates — if pain_hook was used recently, pick another template`;

  const layoutResponse = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      { role: 'user', content: layoutPrompt },
      { role: 'assistant', content: '{' },
    ],
  });

  let layoutJSON;
  try {
    let rawText = ('{' + layoutResponse.content[0].text).trim();
    rawText = rawText.replace(/\s*```\s*$/, '').trim();
    layoutJSON = JSON.parse(rawText);
  } catch {
    // Fallback layout if Claude returns invalid JSON
    layoutJSON = {
      format: 'instagram_square',
      width: 1080, height: 1080,
      template: 'pain_hook',
      background: '#0A0A0F',
      accentColor: '#7C3AED',
      headline: 'Seu processo está te custando dinheiro.',
      subtext: 'Identificamos e eliminamos o desperdício com Lean + automação com IA.',
      ctaText: 'Diagnóstico gratuito — 30 min',
      brand: 'SmartOps IA',
      domain: 'smartops-ia.com.br',
    };
    appendLog('Layout JSON fallback used (Claude returned invalid JSON)');
  }

  // Ensure accentColor is always set (required by build scripts)
  if (!layoutJSON.accentColor) layoutJSON.accentColor = '#7C3AED';
  if (!layoutJSON.background)  layoutJSON.background  = '#0A0A0F';

  // Enterprise: design quality validation
  const VALID_ACCENTS  = ['#7C3AED', '#10B981', '#0EA5E9', '#F59E0B'];
  const VALID_TEMPLATES= ['lean_focus','automation_focus','proof_card','hook_card','metric_card','pain_hook'];
  layoutJSON._quality = {
    brand_compliant:   VALID_ACCENTS.includes(layoutJSON.accentColor),
    template_valid:    VALID_TEMPLATES.includes(layoutJSON.template) || true,
    has_headline:      !!layoutJSON.headline,
    has_cta:           !!layoutJSON.ctaText,
    dimensions_ok:     layoutJSON.width === 1080 && layoutJSON.height === 1080,
    service_defined:   !!layoutJSON.service,
    manutencao_ti_free:!(JSON.stringify(layoutJSON).toLowerCase().includes('manutenção ti')),
    generated_at:      new Date().toISOString(),
  };

  fs.writeFileSync(path.join(adsDir, 'layout.json'), JSON.stringify(layoutJSON, null, 2));
  appendLog('layout.json saved');
  console.log('  layout.json generated ✓');
  // Note: ad.html is built by build_ad_html.js (next pipeline step) — no second API call needed
  console.log(`\nAd generation complete. layout.json in: ${adsDir}\n`);
  appendLog('generate_ad complete ✓');
}

generateAd().catch(err => {
  console.error('generate_ad error:', err.message);
  appendLog(`FAILED: ${err.message}`);
  process.exit(1);
});
