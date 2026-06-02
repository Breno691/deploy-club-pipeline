// GoogleCompetitorAgent.js — Competitor Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// ── Análise local ────────────────────────────────────────────────────────────

function categorizeQuery(query) {
  const q = query.toLowerCase();
  if (/bh|belo horizonte|mg|minas/.test(q)) return 'local';
  if (/como|o que|por que|quando|qual/.test(q)) return 'informational';
  if (/consultoria|agência|empresa|serviço/.test(q)) return 'commercial';
  return 'generic';
}

function estimateLocalCompetition(query) {
  // Heurística: queries locais específicas têm menos concorrência
  const q = query.toLowerCase();
  const isLocal    = /bh|belo horizonte/.test(q);
  const isNiche    = /lean|six sigma|n8n|ia para/.test(q);
  const isSpecific = q.split(' ').length >= 4;

  if (isLocal && isNiche)     return { level: 'BAIXA',  score: 85, opportunity: 'ALTA' };
  if (isLocal && isSpecific)  return { level: 'BAIXA',  score: 75, opportunity: 'ALTA' };
  if (isLocal)                return { level: 'MÉDIA',  score: 60, opportunity: 'MÉDIA' };
  if (isNiche)                return { level: 'MÉDIA',  score: 55, opportunity: 'MÉDIA' };
  return                             { level: 'ALTA',   score: 30, opportunity: 'BAIXA' };
}

// ── Agente Claude ────────────────────────────────────────────────────────────

async function analyzeGoogleCompetition({ query, context = '' }) {
  const queryType   = categorizeQuery(query);
  const competition = estimateLocalCompetition(query);
  const queries     = CONFIG.google_queries;

  const prompt = `Você é o Google Competitor Agent da SmartOps IA.
Sua missão é analisar como a SmartOps pode vencer na busca orgânica e paga para esse termo.

SmartOps IA: ${CONFIG.company.positioning}
Localização: ${CONFIG.company.location}

TERMO ANALISADO: "${query}"
TIPO: ${queryType}
COMPETIÇÃO ESTIMADA: ${competition.level} (score: ${competition.score})
OPORTUNIDADE: ${competition.opportunity}
CONTEXTO: ${context || 'busca orgânica e paga'}

TODOS OS TERMOS MONITORADOS:
${queries.map((q, i) => `${i+1}. ${q}`).join('\n')}

Analise e gere:

SEARCH_TERM: "${query}"
QUERY_TYPE: ${queryType}
COMPETITION_LEVEL: ${competition.level}
OPPORTUNITY_SCORE: ${competition.score}/100

PROBABLE_COMPETITORS: [quem provavelmente ranqueia para esse termo em BH]
1. [nome/tipo de empresa]
2. [nome/tipo de empresa]
3. [nome/tipo de empresa]

ADS_VISIBLE: [quem provavelmente anuncia para esse termo]
ORGANIC_TOP: [que tipo de página ranqueia — home, serviço, blog, diretório]
LOCAL_PACK: [o Google Business Pack mostra esse tipo de empresa — o que isso significa]

MESSAGING_PATTERNS: [que mensagens os concorrentes provavelmente usam nesse termo]
GAPS_IN_SERP: [o que falta nos resultados atuais — o que ninguém está entregando bem]

SMARTOPS_ACTION:
PAGE_TO_CREATE: [que página criar para ranquear]
PAGE_TITLE: [título SEO recomendado]
META_DESC: [meta description recomendada]
MAIN_KEYWORD: "${query}"
SECONDARY_KEYWORDS: [3-4 variações]
CONTENT_ANGLE: [ângulo diferenciado para esse termo]
CTA_SUGGESTION: [CTA ideal para essa intenção de busca]

ADS_RECOMMENDATION: [criar ou não anúncio para esse termo + copy sugerido]
PRIORITY: [Alta / Média / Baixa]
EXPECTED_TIMELINE: [quando esperar resultado SEO]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  return { query, queryType, competition, analysis: resp.content[0].text, created_at: new Date().toISOString() };
}

module.exports = { analyzeGoogleCompetition, categorizeQuery, estimateLocalCompetition };
