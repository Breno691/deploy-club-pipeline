// SEOCompetitorAgent.js — Competitor Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// ── Calculadoras locais ──────────────────────────────────────────────────────

function estimateKeywordOpportunity(keyword) {
  const kw = keyword.toLowerCase();
  const cfg = CONFIG.seo_keywords.find(k => k.kw === kw) || {};

  const isLocal    = /bh|belo horizonte|minas/.test(kw);
  const isNiche    = /lean|six sigma|n8n|kaizen|dmaic/.test(kw);
  const isLongTail = kw.split(' ').length >= 4;
  const isCommercial = /consultoria|agência|contratar|preço/.test(kw);

  let opportunityScore = 40;
  if (isLocal)      opportunityScore += 25;
  if (isNiche)      opportunityScore += 20;
  if (isLongTail)   opportunityScore += 10;
  if (isCommercial) opportunityScore += 5;

  return {
    score:      Math.min(100, opportunityScore),
    difficulty: cfg.difficulty || (isLocal && isNiche ? 'baixa' : 'média'),
    intent:     cfg.intent     || (isCommercial ? 'commercial' : 'informational'),
    priority:   cfg.priority   || (opportunityScore >= 70 ? 'alta' : 'média'),
  };
}

function generateContentPlan(keyword) {
  const kw      = keyword.toLowerCase();
  const isLocal = /bh|belo horizonte/.test(kw);

  if (isLocal) return {
    type:     'landing page',
    h1:       `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} | SmartOps IA`,
    sections: ['O que é', 'Para quem é', 'Como funciona', 'Resultados', 'Cases', 'Diagnóstico gratuito'],
    cta:      'Agendar diagnóstico gratuito',
  };

  return {
    type:     'blog post / pilar',
    h1:       `${keyword.charAt(0).toUpperCase() + keyword.slice(1)}: Guia Completo para PMEs`,
    sections: ['Introdução', 'O problema', 'A solução', 'Passo a passo', 'Exemplos', 'CTA'],
    cta:      'Baixar guia ou agendar conversa',
  };
}

// ── Agente Claude ────────────────────────────────────────────────────────────

async function analyzeSEOKeyword({ keyword, context = '' }) {
  const opp  = estimateKeywordOpportunity(keyword);
  const plan = generateContentPlan(keyword);
  const allKws = CONFIG.seo_keywords.map(k =>
    `- "${k.kw}" | intent: ${k.intent} | dificuldade: ${k.difficulty} | prioridade: ${k.priority}`
  ).join('\n');

  const prompt = `Você é o SEO Competitor Agent da SmartOps IA.
Sua missão é analisar oportunidades de SEO e criar briefs de conteúdo para superar concorrentes.

SmartOps IA: ${CONFIG.company.positioning}
Localização: ${CONFIG.company.location}

KEYWORD ANALISADA: "${keyword}"
INTENÇÃO: ${opp.intent}
DIFICULDADE ESTIMADA: ${opp.difficulty}
OPORTUNIDADE: ${opp.score}/100
PRIORIDADE: ${opp.priority}

PLANO DE CONTEÚDO SUGERIDO:
Tipo: ${plan.type}
H1: ${plan.h1}
Seções: ${plan.sections.join(' → ')}
CTA: ${plan.cta}

TODAS AS KEYWORDS MONITORADAS:
${allKws}

CONTEXTO: ${context || 'SEO local BH para consultoria Lean + IA'}

Gere análise SEO completa:

KEYWORD: "${keyword}"
SEARCH_INTENT: [o que o usuário quer encontrar]
COMPETITION_ANALYSIS: [quem ranqueia e por quê]
SMARTOPS_STATUS: [a SmartOps tem conteúdo para isso? Ranqueia?]
DIFFICULTY: ${opp.difficulty}
OPPORTUNITY: ${opp.score}/100

COMPETITORS_RANKING: [tipos de página que provavelmente estão no top 5]
CONTENT_GAP: [o que falta nos resultados — o que ninguém faz bem]

SMARTOPS_PAGE_TO_CREATE:
TYPE: ${plan.type}
H1: ${plan.h1}
DESCRIPTION: [o que a página deve cobrir]
SECTIONS: [seções principais]
CTA: ${plan.cta}
INTERNAL_LINKS: [páginas da SmartOps que devem linkar para essa]
SECONDARY_KEYWORDS: [3-5 variações do termo principal]

CONTENT_BRIEF:
ANGLE: [ângulo diferenciado — o que SmartOps faz melhor que os concorrentes]
PROOF_TO_INCLUDE: [que prova social ou case incluir]
TECHNICAL_SEO: [título, meta, URL sugeridos]

PRIORITY: ${opp.priority}
EXPECTED_IMPACT: [impacto esperado em leads e autoridade]
TIME_TO_RANK: [estimativa de tempo para ver resultado]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  return { keyword, opportunity: opp, contentPlan: plan, analysis: resp.content[0].text, created_at: new Date().toISOString() };
}

async function generateSEOOpportunityMap({ context = '' }) {
  const sorted = [...CONFIG.seo_keywords]
    .map(k => ({ ...k, opp: estimateKeywordOpportunity(k.kw) }))
    .sort((a, b) => b.opp.score - a.opp.score);

  const prompt = `Você é o SEO Competitor Agent da SmartOps IA.
Gere o mapa de oportunidades SEO priorizado.

SmartOps IA: ${CONFIG.company.positioning}
CONTEXTO: ${context || 'empresa em fase inicial — precisamos ranquear localmente'}

KEYWORDS RANKEADAS POR OPORTUNIDADE:
${sorted.map((k, i) => `${i+1}. "${k.kw}" | score: ${k.opp.score} | ${k.opp.difficulty} dificuldade | ${k.opp.priority} prioridade`).join('\n')}

Gere:

SEO_OPPORTUNITY_MAP:

TOP_5_QUICK_WINS: [keywords com maior oportunidade e menor esforço]
PAGES_TO_CREATE_NOW: [páginas a criar esta semana]
BLOG_POSTS_TO_CREATE: [artigos a criar neste mês]
TOPIC_CLUSTERS: [clusters de conteúdo para autoridade]
LOCAL_SEO_PRIORITY: [foco em BH — o que fazer]
ESTIMATED_IMPACT: [impacto em leads se essas páginas ranquearem]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  return { keywords: sorted, analysis: resp.content[0].text, created_at: new Date().toISOString() };
}

module.exports = { analyzeSEOKeyword, generateSEOOpportunityMap, estimateKeywordOpportunity };
