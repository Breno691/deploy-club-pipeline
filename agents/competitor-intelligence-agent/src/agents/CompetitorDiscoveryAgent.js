// CompetitorDiscoveryAgent.js — Competitor Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// ── Calculadoras locais ──────────────────────────────────────────────────────

function scoreOpportunity({ painMarket, clearGap, smartopsFit, lowCompetition, revenuePotential, easeExecution }) {
  const score =
    (painMarket       || 10) +
    (clearGap         || 10) +
    (smartopsFit      || 10) +
    (lowCompetition   || 8)  +
    (revenuePotential || 8)  +
    (easeExecution    || 5);

  let level = '';
  if (score >= 85) level = CONFIG.opportunity_levels[85];
  else if (score >= 70) level = CONFIG.opportunity_levels[70];
  else if (score >= 50) level = CONFIG.opportunity_levels[50];
  else level = CONFIG.opportunity_levels[0];

  return { score, level };
}

function classifyThreat(competitor) {
  const threatMap = { alta: 3, média: 2, baixa: 1 };
  const score = threatMap[competitor.threat] || 2;
  return { score, label: competitor.threat };
}

function buildCompetitorLandscape() {
  return CONFIG.known_competitors.map(c => ({
    ...c,
    threat_score: classifyThreat(c),
    channels: c.channel.split(',').map(s => s.trim()),
  })).sort((a, b) => b.threat_score.score - a.threat_score.score);
}

// ── Agente Claude ────────────────────────────────────────────────────────────

async function discoverCompetitors({ context = '' }) {
  const landscape = buildCompetitorLandscape();
  const queries   = CONFIG.google_queries.slice(0, 6).join('\n- ');

  const prompt = `Você é o Competitor Discovery Agent da SmartOps IA.
Cargo: Diretor de Inteligência Competitiva.
SmartOps IA: ${CONFIG.company.positioning}.
Localização: ${CONFIG.company.location}.

Mapeie o cenário competitivo completo.

CONCORRENTES CONHECIDOS:
${landscape.map(c => `- [${c.type.toUpperCase()}] ${c.name} | Canais: ${c.channels.join('+')} | Ameaça: ${c.threat}`).join('\n')}

QUERIES MONITORADAS:
- ${queries}

DIFERENCIAIS SMARTOPS:
${CONFIG.differentiation.positioning_message}

Gere o mapa competitivo completo:

LANDSCAPE_SUMMARY: [visão geral do mercado em BH/MG para esse segmento]

DIRECT_COMPETITORS:
[liste os prováveis concorrentes diretos de uma consultoria Lean+IA em BH]
Para cada um:
- NOME: [nome ou perfil]
- CANAL: [onde aparecem]
- AMEAÇA: [Alta/Média/Baixa]
- POR_QUÊ: [por que são concorrentes]

INDIRECT_COMPETITORS:
[agências de automação, consultorias de gestão, ERP vendors, freelancers]
Para cada um:
- NOME: [nome ou tipo]
- POR_QUÊ_INDIRETO: [como resolvem parte do mesmo problema]

ATTENTION_COMPETITORS:
[criadores de conteúdo sobre IA, produtividade, automação que disputam atenção]
Para cada um:
- PERFIL: [Instagram/LinkedIn]
- TEMA: [sobre o que falam]
- RISCO: [como deseduca ou distrai o mercado-alvo da SmartOps]

MARKET_WHITE_SPACES: [gaps que nenhum concorrente está cobrindo bem]

SMARTOPS_STRONGEST_POSITION: [onde a SmartOps pode vencer sem competição direta]

PRIORITY_TO_MONITOR: [top 3 concorrentes para monitorar primeiro e por quê]

IMMEDIATE_ACTION: [o que fazer agora baseado no mapa]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  return { landscape, analysis: resp.content[0].text, created_at: new Date().toISOString() };
}

async function mapCompetitiveLandscape() {
  const landscape = buildCompetitorLandscape();
  return { landscape };
}

module.exports = { discoverCompetitors, mapCompetitiveLandscape, scoreOpportunity, buildCompetitorLandscape };
