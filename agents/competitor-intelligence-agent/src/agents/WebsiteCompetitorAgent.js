// WebsiteCompetitorAgent.js — Competitor Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// ── Checklist de análise de site ─────────────────────────────────────────────

const SITE_CHECKLIST = [
  'Headline clara na home',
  'Proposta de valor acima da dobra',
  'CTA visível sem scroll',
  'Serviços explicados claramente',
  'Cases ou resultados visíveis',
  'Depoimento de clientes',
  'Formulário ou botão WhatsApp',
  'Blog ou conteúdo educativo',
  'Velocidade mobile adequada',
  'Página de diagnóstico/isca',
];

function scoreCompetitorSite(featuresPresent) {
  const score = (featuresPresent / SITE_CHECKLIST.length) * 100;
  let level = '';
  if (score >= 80) level = 'SITE FORTE — difícil de superar sem diferenciação clara';
  else if (score >= 55) level = 'SITE MÉDIO — oportunidade de superar em 3-4 pontos';
  else level = 'SITE FRACO — SmartOps pode superar facilmente';
  return { score: Math.round(score), level };
}

// ── Agente Claude ────────────────────────────────────────────────────────────

async function analyzeCompetitorWebsite({ competitor, url, context = '' }) {
  const checklistText = SITE_CHECKLIST.map((item, i) => `${i+1}. ${item}`).join('\n');

  const prompt = `Você é o Website Competitor Agent da SmartOps IA.
Sua missão é analisar sites de concorrentes e identificar onde a SmartOps pode superar.

SmartOps IA: ${CONFIG.company.positioning}
Site da SmartOps: [em construção]

CONCORRENTE: ${competitor}
URL: ${url}
CONTEXTO: ${context || 'consultoria/agência de processos ou automação em BH/MG'}

CHECKLIST DE ANÁLISE:
${checklistText}

DIFERENCIAÇÃO SMARTOPS vs CONCORRENTES:
${CONFIG.differentiation.vs_traditional_lean.join('\n')}

Analise o site do concorrente e gere:

COMPETITOR_SITE: ${url}
POSITIONING: [qual posicionamento o site transmite]

HOMEPAGE_ANALYSIS:
HEADLINE: [headline provável para esse tipo de empresa]
VALUE_PROP: [proposta de valor — o que prometem]
SERVICES: [serviços listados]
CTA: [CTA principal]
PROOF: [tipo de prova social presente]

WHAT_THEY_DO_WELL: [3-4 pontos fortes do site]
WEAKNESSES: [3-4 fraquezas — o que falta ou é ruim]
MISSING_ELEMENTS: [o que não está no site deles e SmartOps deve ter]

UX_ISSUES: [problemas de experiência que podem afugentar leads]
CONVERSION_GAPS: [onde o funil do site quebra]

SMARTOPS_IMPROVEMENT:
PAGES_THEY_DONT_HAVE: [páginas que faltam no site deles — oportunidade de criação]
BETTER_CTA: [CTA mais forte que a SmartOps deve usar]
BETTER_PROOF: [tipo de prova social que a SmartOps deve criar]
BETTER_OFFER: [oferta mais forte que a SmartOps pode ter]
BETTER_HEADLINE: [headline mais forte para a SmartOps]
DIFFERENTIATION_ANGLE: [como a SmartOps se posiciona claramente diferente]

CHECKLIST_SCORE: [quantos itens do checklist estão presentes — X/${SITE_CHECKLIST.length}]
OVERALL_RATING: [FORTE / MÉDIO / FRACO]
THREAT_LEVEL: [Alta/Média/Baixa]
ACTION: [o que fazer com essa análise]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  return { competitor, url, checklist: SITE_CHECKLIST, analysis: resp.content[0].text, created_at: new Date().toISOString() };
}

module.exports = { analyzeCompetitorWebsite, scoreCompetitorSite, SITE_CHECKLIST };
