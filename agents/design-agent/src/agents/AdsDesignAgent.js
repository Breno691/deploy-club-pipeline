// AdsDesignAgent.js — Design Intelligence Agent (SmartOps IA)
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic  = require('@anthropic-ai/sdk');
const { COLORS, BRAND, getAccent } = require('../brand/brandTokens');
const { generateAdCreative }       = require('../generators/generateAdCreative');

const client = new Anthropic();

// ── Score a creative brief (0-100) ────────────────────────────────────────────
function scoreCreativeBrief(brief) {
  let score = 50;
  const headline = (brief.headline || '').toLowerCase();

  if (/\d/.test(headline))             score += 8;    // number in headline
  if (headline.split(' ').length <= 7) score += 5;    // short headline
  if (/bh|belo horizonte/i.test(headline)) score += 4;
  if (brief.cta)                       score += 6;
  if (brief.pain)                      score += 5;
  if (brief.visual_style)             score += 3;

  return Math.min(100, score);
}

// ── Generate 3 creative variations via Claude ─────────────────────────────────
async function generateAdVariations({ offer, pain, audience, platform = 'instagram_square', service_mode = 'lean' }) {
  const accent = getAccent(service_mode);

  const prompt = `Você é o Ads Design Agent da SmartOps IA — especialista em criativos de alta conversão.

SmartOps IA: ${BRAND.tagline} | ${BRAND.location} | ${BRAND.website}

CONTEXTO:
- Oferta: ${offer}
- Dor principal: ${pain}
- Público: ${audience}
- Plataforma: ${platform}
- Cor de destaque: ${accent.color}

Gere 3 variações de criativo (headlines diferentes, mesmo objetivo).

Retorne JSON:
{
  "variations": [
    {
      "id": "v1",
      "creative_type": "dor | roi | autoridade | local | automacao",
      "headline": "máximo 7 palavras, impacto",
      "subheadline": "máximo 15 palavras",
      "cta": "texto do botão",
      "visual_style": "dark-premium-tech | roi-focused | tech-automation",
      "layout": "pain_hook | roi_focus | proof_method",
      "score": 0-100,
      "why_it_works": "...",
      "testing_plan": "testar vs V2 por CTR por 72h"
    }
  ],
  "recommended_test": "V1 vs V2 — hook mais forte ganha",
  "success_metric": "CTR ≥ 2.5% | CPA ≤ R$60"
}

REGRAS:
- Variation 1: dor financeira direta
- Variation 2: número/ROI
- Variation 3: local BH ou autoridade
- Headline nunca genérico — sempre específico
- CTA de baixo risco: diagnóstico gratuito`;

  const response = await client.messages.create({
    model:      'claude-sonnet-4-6',
    max_tokens: 2000,
    messages:   [{ role: 'user', content: prompt }],
  });

  const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AdsDesignAgent: no JSON from Claude');
  const result = JSON.parse(jsonMatch[0]);

  return result.variations.map(v => ({ ...v, score: v.score || scoreCreativeBrief(v) }))
                           .sort((a, b) => b.score - a.score);
}

// ── Generate ad creative from a variation ─────────────────────────────────────
async function generateAdFromVariation(variation, outputDir) {
  const designInput = {
    design_id:    `ad-${variation.id}-${Date.now()}`,
    type:         'meta_ad_square',
    dimensions:   { width: 1080, height: 1080 },
    objective:    'lead_generation',
    headline:     variation.headline,
    subheadline:  variation.subheadline,
    cta:          variation.cta || BRAND.ctaMain,
    template:     variation.layout || 'pain_hook',
    visual_style: variation.visual_style || 'dark-premium-tech',
  };

  return generateAdCreative(designInput, outputDir);
}

// ── Analyze ad creative performance ───────────────────────────────────────────
function analyzeCreativePerformance(metrics) {
  const { ctr, cpa, saves, shares } = metrics;
  const issues  = [];
  const actions = [];
  let   score   = 50;

  if (ctr >= 2.5)  { score += 20; }
  else if (ctr < 1) { issues.push('CTR baixo'); score -= 20; actions.push('Criar 3 novas variações de headline'); }

  if (cpa && cpa <= 60)   { score += 20; }
  else if (cpa && cpa > 120){ issues.push('CPA acima do limite'); score -= 25; actions.push('Revisar oferta e CTA'); }

  if (saves && saves > 50) { score += 10; }

  return {
    score:    Math.max(0, Math.min(100, score)),
    status:   score >= 70 ? 'winner' : score >= 45 ? 'average' : 'loser',
    issues,
    recommended_actions: actions,
  };
}

module.exports = { generateAdVariations, generateAdFromVariation, analyzeCreativePerformance, scoreCreativeBrief };
