// DifferentiationAgent.js — Competitor Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// ── Scoring de oportunidade ──────────────────────────────────────────────────

function scoreOpportunity({ painMarket = 10, clearGap = 10, smartopsFit = 10, lowCompetition = 8, revenuePotential = 8, easeExecution = 5 }) {
  const score = painMarket + clearGap + smartopsFit + lowCompetition + revenuePotential + easeExecution;
  let level = { label: 'IGNORAR', color: '⚫' };
  if (score >= 85) level = { label: 'ATACAR IMEDIATAMENTE', color: '🔴' };
  else if (score >= 70) level = { label: 'CRIAR TESTE',      color: '🟠' };
  else if (score >= 50) level = { label: 'MONITORAR',        color: '🟡' };
  return { score: Math.min(100, score), ...level };
}

function buildDifferentiationMatrix() {
  return {
    vs_traditional_lean:      CONFIG.differentiation.vs_traditional_lean,
    vs_automation_agencies:   CONFIG.differentiation.vs_automation_agencies,
    vs_generic_consultants:   CONFIG.differentiation.vs_generic_consultants,
    positioning_message:      CONFIG.differentiation.positioning_message,
  };
}

// ── Agente Claude ────────────────────────────────────────────────────────────

async function generateDifferentiation({ context = '', gap = '' }) {
  const matrix = buildDifferentiationMatrix();

  const prompt = `Você é o Differentiation Agent da SmartOps IA.
Sua missão é transformar análise competitiva em diferenciação clara, mensagens vencedoras e oportunidades de posicionamento.

SmartOps IA: ${CONFIG.company.positioning}
Diferenciais vs. mercado:
- vs. Lean tradicional: ${matrix.vs_traditional_lean.join(' | ')}
- vs. Agências automação: ${matrix.vs_automation_agencies.join(' | ')}
- vs. Consultorias genéricas: ${matrix.vs_generic_consultants.join(' | ')}

GAP IDENTIFICADO: ${gap || 'nenhum gap específico — análise geral do mercado'}
CONTEXTO: ${context || 'mercado de consultoria operacional + automação em BH/MG'}

POSICIONAMENTO ATUAL:
"${matrix.positioning_message}"

Gere a análise de diferenciação completa:

MARKET_PATTERN: [padrão dominante no mercado — o que todos fazem]

COMPETITOR_POSITIONING:
- Lean tradicional: [como se posicionam]
- Agências automação: [como se posicionam]
- Consultorias genéricas: [como se posicionam]
- Criadores de conteúdo: [como se posicionam]

WEAKNESS_IN_MARKET: [fraqueza coletiva do mercado — o que todos erram]

SMARTOPS_DIFFERENTIATION:
UNIQUE_ANGLE: [o que a SmartOps faz que ninguém mais faz]
CATEGORY: [se a SmartOps pode criar uma nova categoria — qual seria]
PROOF_NEEDED: [que prova social valida essa diferenciação]

MESSAGE_TO_USE:
HEADLINE: [headline de posicionamento — máximo 10 palavras]
SUBHEADLINE: [complemento — 15-20 palavras]
ELEVATOR_PITCH: [pitch de 30 segundos — 2-3 frases]
INSTAGRAM_BIO: [bio otimizada — 150 caracteres]
LINKEDIN_HEADLINE: [headline LinkedIn]
PROPOSAL_POSITIONING: [como se apresentar na proposta]

OFFER_TO_CREATE: [oferta que materializa a diferenciação]
CHANNEL_TO_ATTACK: [onde atacar para reforçar a diferenciação]
CONTENT_ANGLES: [3 ângulos de conteúdo que reforçam a diferenciação]

COMPETITIVE_ADVANTAGE_SCORE:
vs_lean: [1-10]
vs_automacao: [1-10]
vs_gestao: [1-10]
overall: [1-10]

ACTION: [próximo passo para implementar a diferenciação]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  return { matrix, gap, analysis: resp.content[0].text, created_at: new Date().toISOString() };
}

async function generateOpportunityBrief({ gap, context = '' }) {
  const opp = scoreOpportunity({
    painMarket:      18,
    clearGap:        18,
    smartopsFit:     17,
    lowCompetition:  13,
    revenuePotential: 13,
    easeExecution:    8,
  });

  const prompt = `Você é o Opportunity Agent da SmartOps IA.
Transforme o gap competitivo em opportunity brief acionável.

GAP IDENTIFICADO: ${gap}
CONTEXTO: ${context || 'mercado de consultoria + automação em BH'}
SmartOps IA: ${CONFIG.company.positioning}

SCORE ESTIMADO: ${opp.score}/100 — ${opp.color} ${opp.label}

Gere o Opportunity Brief:

OPPORTUNITY_BRIEF:
TITLE: [título da oportunidade]
GAP: ${gap}
SCORE: ${opp.score}/100
DECISION: ${opp.color} ${opp.label}

WHY_IT_EXISTS: [por que esse gap existe no mercado]
WHY_SMARTOPS_IS_RIGHT: [por que a SmartOps é a empresa certa para explorar]
MARKET_SIZE: [tamanho estimado da oportunidade em BH/MG]

RECOMMENDED_ACTION:
IMMEDIATE: [o que fazer esta semana]
SHORT_TERM: [o que fazer neste mês]
MEDIUM_TERM: [o que fazer nos próximos 90 dias]

CONTENT_OPPORTUNITY: [conteúdo a criar baseado nesse gap]
SEO_OPPORTUNITY: [keyword ou página a criar]
ADS_OPPORTUNITY: [anúncio a testar]
OFFER_OPPORTUNITY: [produto ou serviço a criar]

AGENTS_TO_TRIGGER:
- [agente 1 + ação]
- [agente 2 + ação]
- [agente 3 + ação]

SUCCESS_METRIC: [como medir se a oportunidade está sendo capturada]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  return { gap, opportunityScore: opp, analysis: resp.content[0].text, created_at: new Date().toISOString() };
}

module.exports = { generateDifferentiation, generateOpportunityBrief, scoreOpportunity, buildDifferentiationMatrix };
